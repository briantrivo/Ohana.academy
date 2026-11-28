"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  canAccessCourseWithMembership,
  getRemainingDays,
  isSubscriptionActive,
} from "@/lib/membership";
import { createInitialDatabase } from "@/lib/seed-data";
import {
  CertificateRecord,
  Course,
  LMSDatabase,
  UserProfile,
  UserSubscription,
} from "@/types/lms";

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  internalCode?: string;
}

interface LMSContextValue {
  db: LMSDatabase;
  user: UserProfile | null;
  mySubscription: UserSubscription | null;
  hasActiveMembership: boolean;
  membershipRemainingDays: number;
  googleEnabled: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (patch: { name?: string; phone?: string }) => Promise<void>;
  refreshState: () => Promise<void>;
  setDbState: (nextDb: LMSDatabase) => void;
  hasCourseAccess: (course: Course) => boolean;
  getCourseProgress: (course: Course) => {
    completedCount: number;
    totalCount: number;
    percent: number;
    completedIds: string[];
  };
  enrollFreeCourse: (courseId: string) => Promise<boolean>;
  toggleLessonComplete: (
    courseId: string,
    lessonId: string,
    completed: boolean
  ) => Promise<void>;
  saveQuizScore: (
    courseId: string,
    lessonId: string,
    scorePercent: number
  ) => Promise<void>;
  redeemActivationCode: (
    code: string
  ) => Promise<{ ok: boolean; message: string }>;
  issueCertificate: (
    courseId: string,
    quizScore?: number
  ) => Promise<CertificateRecord | null>;
}

const LMSContext = createContext<LMSContextValue | null>(null);

export function LMSProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<LMSDatabase>(() => createInitialDatabase());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const { currentUser, googleEnabled: ggOn, ...restDb } = data;
        setUser(currentUser || null);
        setGoogleEnabled(Boolean(ggOn));
        setDb(restDb as LMSDatabase);
      }
    } catch (err) {
      console.error("Failed to fetch LMS state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Đăng nhập thất bại." };
      }
      if (data.user) setUser(data.user);
      if (data.db) setDb(data.db);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  };

  const register = async (
    input: RegisterInput
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Đăng ký thất bại." };
      }
      if (data.user) setUser(data.user);
      if (data.db) setDb(data.db);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    await refreshState();
  };

  const updateUserProfile = async (patch: { name?: string; phone?: string }) => {
    if (!user) return;
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) setUser(data.user);
    }
  };

  const mySubscription: UserSubscription | null =
    user && db.subscriptions ? db.subscriptions[user.id] || null : null;
  const hasActiveMembership = isSubscriptionActive(mySubscription);
  const membershipRemainingDays = getRemainingDays(mySubscription);

  const hasCourseAccess = useCallback(
    (course: Course): boolean => {
      if (!user) return false;
      const userEnrolled = db.enrollments[user.id] || [];
      return canAccessCourseWithMembership(
        course,
        user,
        userEnrolled,
        mySubscription
      );
    },
    [db.enrollments, mySubscription, user]
  );

  const getCourseProgress = useCallback(
    (course: Course) => {
      const allLessons = course.chapters.flatMap((ch) => ch.lessons);
      const totalCount = allLessons.length;
      if (!user) {
        return { completedCount: 0, totalCount, percent: 0, completedIds: [] };
      }
      const completedIds = db.progress[user.id]?.[course.id] || [];
      const validCompleted = completedIds.filter((id) =>
        allLessons.some((l) => l.id === id)
      );
      const completedCount = validCompleted.length;
      const percent =
        totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
      return {
        completedCount,
        totalCount,
        percent,
        completedIds: validCompleted,
      };
    },
    [db.progress, user]
  );

  const enrollFreeCourse = async (courseId: string): Promise<boolean> => {
    if (!user) return false;
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "enroll_free",
        courseId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDb(data.db);
      return true;
    }
    return false;
  };

  const toggleLessonComplete = async (
    courseId: string,
    lessonId: string,
    completed: boolean
  ) => {
    if (!user) return;
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_lesson",
        courseId,
        lessonId,
        completed,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDb(data.db);
    }
  };

  const saveQuizScore = async (
    courseId: string,
    lessonId: string,
    scorePercent: number
  ) => {
    if (!user) return;
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_quiz",
        courseId,
        lessonId,
        scorePercent,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDb(data.db);
    }
  };

  const redeemActivationCode = async (
    code: string
  ): Promise<{ ok: boolean; message: string }> => {
    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data.error || "Kích hoạt thất bại." };
    }
    if (data.user) setUser(data.user);
    if (data.db) setDb(data.db);
    return { ok: true, message: data.message || "Kích hoạt thành công!" };
  };

  const issueCertificate = async (
    courseId: string,
    quizScore?: number
  ): Promise<CertificateRecord | null> => {
    if (!user) return null;
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "issue_certificate",
        courseId,
        quizScore,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.db) setDb(data.db);
    return data.certificate || null;
  };

  return (
    <LMSContext.Provider
      value={{
        db,
        user,
        mySubscription,
        hasActiveMembership,
        membershipRemainingDays,
        googleEnabled,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        refreshState,
        setDbState: setDb,
        hasCourseAccess,
        getCourseProgress,
        enrollFreeCourse,
        toggleLessonComplete,
        saveQuizScore,
        redeemActivationCode,
        issueCertificate,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
}

export function useLMS() {
  const ctx = useContext(LMSContext);
  if (!ctx) {
    throw new Error("useLMS must be used inside LMSProvider");
  }
  return ctx;
}
