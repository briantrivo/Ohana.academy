"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LogIn,
  Plus,
  Power,
  QrCode,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useLMS } from "@/context/LMSContext";
import { isUserAffiliateEligible } from "@/lib/affiliate";
import {
  getRemainingDays,
  isCourseInMembership,
  isSubscriptionActive,
} from "@/lib/membership";
import { buildVietQrUrl, formatVND } from "@/lib/video";
import {
  AffiliateCommission,
  CourseAccessType,
  DiscountType,
  MembershipPlan,
  UserRole,
} from "@/types/lms";

type AdminTab =
  | "courses"
  | "membership"
  | "affiliate"
  | "orders"
  | "coupons"
  | "codes"
  | "users";

const OHANA_THUMBNAILS = [
  { label: "Banner Ohana AI Academy Cyber", url: "/ohana/banner_ohana_ai_academy_cyber.jpg" },
  { label: "Banner Ohana AI Mastery", url: "/ohana/banner_ohana_ai_mastery_cyber.jpg" },
  { label: "Khóa học AI Ứng Dụng", url: "/ohana/banner_khoa_hoc_ai_ung_dung.jpg" },
  { label: "Standee Cộng Đồng Ohana", url: "/ohana/ohana_community_standee.jpg" },
  { label: "Đào tạo Doanh nghiệp", url: "/ohana/ohana_executive_training.jpg" },
  { label: "Hội trường Workshop", url: "/ohana/ohana_workshop_practice.jpg" },
];

export default function AdminStudioPage() {
  const { db, user, isLoading, setDbState, refreshState } = useLMS();
  const [tab, setTab] = useState<AdminTab>("courses");

  // Course Builder Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("AI Kinh Doanh");
  const [accessType, setAccessType] = useState<CourseAccessType>("commercial");
  const [includedInMembership, setIncludedInMembership] = useState(false);
  const [price, setPrice] = useState("1990000");
  const [originalPrice, setOriginalPrice] = useState("3990000");
  const [thumbnail, setThumbnail] = useState(OHANA_THUMBNAILS[0].url);
  const [chapterTitle, setChapterTitle] = useState("Phần 1: Tổng quan & Thực hành");
  const [lessonsDraft, setLessonsDraft] = useState<
    { title: string; duration: string; videoUrl: string; summary: string; isFreePreview: boolean }[]
  >([
    {
      title: "Bài 1: Khởi động & Hướng dẫn sử dụng công cụ",
      duration: "25:00",
      videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
      summary: "Video hướng dẫn từng bước thực hành trực tiếp.",
      isFreePreview: true,
    },
  ]);
  const [previewUrl, setPreviewUrl] = useState("https://www.youtube.com/watch?v=CZDqmPXM26A");
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseMsg, setCourseMsg] = useState("");

  // Activation Code Form State
  const [newCode, setNewCode] = useState("");
  const [newCodeLabel, setNewCodeLabel] = useState("");
  const [newCodeTarget, setNewCodeTarget] = useState("ALL_INTERNAL");
  const [newCodeMaxUses, setNewCodeMaxUses] = useState("100");

  // User Create Form State
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPhone, setUPhone] = useState("");
  const [uDept, setUDept] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRole, setURole] = useState<"internal" | "student">("internal");
  const [userMsg, setUserMsg] = useState("");

  // Admin Change Password State
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Coupon Form State
  const [cCode, setCCode] = useState("");
  const [cLabel, setCLabel] = useState("");
  const [cType, setCType] = useState<DiscountType>("fixed");
  const [cValue, setCValue] = useState("500000");
  const [cTarget, setCTarget] = useState("ALL");
  const [cMaxUses, setCMaxUses] = useState("100");
  const [cExpiresAt, setCExpiresAt] = useState("");
  const [cActive, setCActive] = useState(true);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponErr, setCouponErr] = useState("");
  const [copiedCouponLink, setCopiedCouponLink] = useState("");

  // Membership Admin State
  const [updCourseId, setUpdCourseId] = useState("course-ohana-ai-membership-hub");
  const [updChapterTitle, setUpdChapterTitle] = useState("Cập Nhật Tháng 12/2026 — Bài Học AI Mới");
  const [updLessonTitle, setUpdLessonTitle] = useState("");
  const [updDuration, setUpdDuration] = useState("15:00");
  const [updVideoUrl, setUpdVideoUrl] = useState("");
  const [updSummary, setUpdSummary] = useState("");
  const [updPreview, setUpdPreview] = useState(false);
  const [updMsg, setUpdMsg] = useState("");
  const [updErr, setUpdErr] = useState("");

  const [mPlanId, setMPlanId] = useState("");
  const [mPlanName, setMPlanName] = useState("");
  const [mPlanSubtitle, setMPlanSubtitle] = useState("");
  const [mPlanDays, setMPlanDays] = useState("30");
  const [mPlanPrice, setMPlanPrice] = useState("299000");
  const [mPlanOriginal, setMPlanOriginal] = useState("499000");
  const [mPlanBadge, setMPlanBadge] = useState("");
  const [mPlanFeatures, setMPlanFeatures] = useState(
    "Mở khóa toàn bộ Kho Bài Học Cập Nhật Hàng Tháng\nTải trọn bộ file Prompt & tài liệu đính kèm"
  );
  const [mPlanMsg, setMPlanMsg] = useState("");

  const [grantUserId, setGrantUserId] = useState("");
  const [grantDays, setGrantDays] = useState("30");
  const [grantNote, setGrantNote] = useState("Hội Viên VIP Ohana");
  const [grantMsg, setGrantMsg] = useState("");

  // Affiliate Admin State
  const [affFilter, setAffFilter] = useState<"all" | "pending" | "paid" | "cancelled">("all");
  const [payoutModalCommission, setPayoutModalCommission] =
    useState<AffiliateCommission | null>(null);
  const [payoutNoteInput, setPayoutNoteInput] = useState("");

  const stats = useMemo(() => {
    const paidOrders = db.orders.filter((o) => o.status === "paid");
    const revenue = paidOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const pendingCount = db.orders.filter((o) => o.status === "pending").length;
    return {
      revenue,
      paidCount: paidOrders.length,
      pendingCount,
      totalCourses: db.courses.length,
      totalUsers: db.users.length,
    };
  }, [db]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-sm text-slate-400">
        Đang kiểm tra quyền Quản trị viên...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="glow-card rounded-3xl p-8 border border-rose-500/40 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            Khu Vực Dành Riêng Cho Quản Trị Viên
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {!user
              ? "Vui lòng đăng nhập bằng tài khoản Quản trị viên (Admin) của Ohana để quản lý khóa học, tải tài liệu và duyệt đơn VietQR."
              : `Tài khoản hiện tại (${user.email}) đang thuộc nhóm ${
                  user.role === "internal" ? "Nhân sự Nội bộ" : "Học viên"
                }, không có quyền truy cập Quản trị Studio.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!user && (
              <Link
                href="/login?next=%2Fadmin"
                className="px-6 py-3 rounded-xl btn-gradient text-white text-sm font-bold inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập Admin
              </Link>
            )}
            <Link
              href="/"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const addLessonRow = () => {
    setLessonsDraft((prev) => [
      ...prev,
      {
        title: `Bài ${prev.length + 1}: Nội dung tiếp theo`,
        duration: "20:00",
        videoUrl: "https://vimeo.com/76979871",
        summary: "Mô tả ngắn nội dung bài học.",
        isFreePreview: false,
      },
    ]);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSavingCourse(true);
    setCourseMsg("");

    const slug = `${toSlug(title)}-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      title: title.trim(),
      slug,
      subtitle: subtitle.trim() || "Chương trình đào tạo thực chiến của Ohana Academy.",
      category,
      accessType,
      includedInMembership:
        accessType === "membership" ? true : includedInMembership,
      price: accessType === "commercial" ? Number(price || 0) : 0,
      originalPrice:
        accessType === "commercial" && Number(originalPrice) > Number(price)
          ? Number(originalPrice)
          : undefined,
      thumbnail,
      badge:
        accessType === "membership"
          ? "Hội Viên VIP • Cập Nhật"
          : accessType === "internal"
          ? "Đào Tạo Nội Bộ"
          : accessType === "free"
          ? "Miễn phí 100%"
          : "Khóa học mới",
      totalDuration: `${lessonsDraft.length} bài giảng HD`,
      chapters: [
        {
          id: `ch-${Date.now()}`,
          title: chapterTitle || "Nội dung khóa học",
          lessons: lessonsDraft.map((l, idx) => ({
            id: `les-${Date.now()}-${idx}`,
            title: l.title,
            duration: l.duration || "20:00",
            videoUrl: l.videoUrl,
            summary: l.summary,
            isFreePreview: l.isFreePreview,
            publishedAt: new Date().toISOString(),
          })),
        },
      ],
    };

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.db) {
        setDbState(data.db);
        setTitle("");
        setSubtitle("");
        setCourseMsg(`✓ Đã xuất bản khóa học "${payload.title}" lên trang chủ!`);
      }
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const res = await fetch(`/api/courses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleApproveOrder = async (orderCode: string) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve_order",
        orderCode,
        transactionRef: "Admin duyệt xác nhận",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleTriggerWebhookForOrder = async (orderCode: string, amount: number) => {
    const res = await fetch("/api/webhooks/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: orderCode,
        transferAmount: amount,
        referenceCode: `SEPAY-${Date.now()}`,
      }),
    });
    if (res.ok) {
      await refreshState();
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_code",
        code: newCode,
        label: newCodeLabel || `Mã kích hoạt ${newCode}`,
        targetCourseId: newCodeTarget,
        maxUses: Number(newCodeMaxUses || 100),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
      setNewCode("");
      setNewCodeLabel("");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: uName,
        email: uEmail,
        phone: uPhone,
        department: uDept,
        password: uPassword,
        role: uRole,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setUserMsg(data.error || "Không thể tạo tài khoản.");
      return;
    }
    if (data.db) setDbState(data.db);
    setUName("");
    setUEmail("");
    setUPhone("");
    setUDept("");
    setUPassword("");
    setUserMsg(`✓ Đã cấp tài khoản thành công cho ${data.user.email}!`);
  };

  const handleSwitchUserRole = async (userId: string, role: UserRole) => {
    if (role !== "student" && role !== "internal") return;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdError("");
    if (newPwd.length < 8) {
      setPwdError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Xác nhận mật khẩu mới chưa khớp.");
      return;
    }
    setPwdSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error || "Không thể đổi mật khẩu.");
        return;
      }
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setPwdMsg("✓ " + (data.message || "Đã đổi mật khẩu Admin thành công!"));
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg("");
    setCouponErr("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: cCode,
        label: cLabel,
        discountType: cType,
        discountValue: Number(cValue || 0),
        targetCourseId: cTarget,
        maxUses: Number(cMaxUses || 0),
        expiresAt: cExpiresAt ? `${cExpiresAt}T23:59:59+07:00` : "",
        active: cActive,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCouponErr(data.error || "Không thể tạo mã giảm giá.");
      return;
    }
    if (data.db) setDbState(data.db);
    setCCode("");
    setCLabel("");
    setCExpiresAt("");
    setCouponMsg(`✓ Đã lưu mã giảm giá ${data.coupon.code} lên Supabase!`);
  };

  const handleToggleCoupon = async (code: string, active: boolean) => {
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, active }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleCopyCouponLink = (code: string, targetCourseId: string) => {
    const commercialCourse =
      (targetCourseId !== "ALL"
        ? db.courses.find((c) => c.id === targetCourseId)
        : db.courses.find((c) => c.accessType === "commercial")) || db.courses[0];
    if (!commercialCourse || typeof window === "undefined") return;
    const url = `${window.location.origin}/checkout/${commercialCourse.slug}?coupon=${encodeURIComponent(code)}`;
    navigator.clipboard?.writeText(url);
    setCopiedCouponLink(code);
    setTimeout(() => setCopiedCouponLink(""), 2200);
  };

  const handleAddUpdatedLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdMsg("");
    setUpdErr("");
    const targetCourse =
      db.courses.find((c) => c.id === updCourseId) ||
      db.courses.find((c) => isCourseInMembership(c)) ||
      db.courses[0];
    if (!targetCourse) {
      setUpdErr("Chưa có khóa học nào trong hệ thống.");
      return;
    }
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_updated_lesson",
        courseId: targetCourse.id,
        chapterTitle: updChapterTitle,
        lessonTitle: updLessonTitle,
        duration: updDuration,
        videoUrl: updVideoUrl,
        summary: updSummary,
        isFreePreview: updPreview,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setUpdErr(data.error || "Không thể đăng bài cập nhật.");
      return;
    }
    if (data.db) setDbState(data.db);
    setUpdLessonTitle("");
    setUpdVideoUrl("");
    setUpdSummary("");
    setUpdPreview(false);
    setUpdMsg(`✓ Đã đăng bài học cập nhật mới lên "${targetCourse.title}" và bảng tin /membership!`);
  };

  const handleEditPlan = (p: MembershipPlan) => {
    setMPlanId(p.id);
    setMPlanName(p.name);
    setMPlanSubtitle(p.subtitle);
    setMPlanDays(String(p.durationDays));
    setMPlanPrice(String(p.price));
    setMPlanOriginal(p.originalPrice ? String(p.originalPrice) : "");
    setMPlanBadge(p.badge || "");
    setMPlanFeatures((p.features || []).join("\n"));
    setMPlanMsg("");
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMPlanMsg("");
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_plan",
        id: mPlanId || undefined,
        name: mPlanName,
        subtitle: mPlanSubtitle,
        durationDays: Number(mPlanDays || 30),
        price: Number(mPlanPrice || 0),
        originalPrice: mPlanOriginal ? Number(mPlanOriginal) : undefined,
        badge: mPlanBadge,
        featuresText: mPlanFeatures,
        active: true,
        sortOrder:
          (db.membershipPlans || []).find((p) => p.id === mPlanId)?.sortOrder ||
          (db.membershipPlans || []).length + 1,
      }),
    });
    const data = await res.json();
    if (res.ok && data.db) {
      setDbState(data.db);
      setMPlanId("");
      setMPlanName("");
      setMPlanSubtitle("");
      setMPlanBadge("");
      setMPlanMsg(`✓ Đã lưu gói "${data.plan.name}" lên Supabase!`);
    } else {
      setMPlanMsg(data.error || "Không thể lưu gói.");
    }
  };

  const handleTogglePlan = async (id: string, active: boolean) => {
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_plan", id, active }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleDeletePlan = async (id: string) => {
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_plan", id }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleToggleCourseMembership = async (courseId: string, included: boolean) => {
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_course_membership",
        courseId,
        included,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleGrantDays = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantMsg("");
    const targetUid = grantUserId || db.users.find((u) => u.role !== "admin")?.id;
    if (!targetUid) return;
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "grant_days",
        userId: targetUid,
        days: Number(grantDays || 30),
        planName: grantNote,
      }),
    });
    const data = await res.json();
    if (res.ok && data.db) {
      setDbState(data.db);
      setGrantMsg(
        `✓ Đã cộng +${grantDays} ngày Hội viên (hết hạn ${new Date(
          data.subscription.expiresAt
        ).toLocaleDateString("vi-VN")})!`
      );
    } else {
      setGrantMsg(data.error || "Không thể cấp ngày.");
    }
  };

  const handleQuickExtendSub = async (userId: string, days: number) => {
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant_days", userId, days }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleRevokeSub = async (userId: string) => {
    const res = await fetch("/api/admin/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke_subscription", userId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const handleAffiliateAction = async (
    action: "mark_paid" | "mark_pending" | "cancel_commission",
    commissionId: string,
    payoutNote?: string
  ) => {
    const res = await fetch("/api/admin/affiliate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, commissionId, payoutNote }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
      setPayoutModalCommission(null);
      setPayoutNoteInput("");
    }
  };

  const handleToggleUserAffiliate = async (userId: string, enabled: boolean) => {
    const res = await fetch("/api/admin/affiliate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_user_affiliate", userId, enabled }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/35 text-purple-300 text-xs font-bold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Ohana Studio • Quản Trị Toàn Hệ Thống
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Quản Lý Khóa Học, Nhân Sự &amp; Thanh Toán VietQR
          </h1>
        </div>
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 hover:border-cyan-400 inline-flex items-center gap-1.5 self-start"
        >
          Xem Trang Chủ Học Viên <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card rounded-2xl p-5">
          <div className="text-xs text-slate-400">Doanh thu VietQR đã thu</div>
          <div className="font-display text-2xl font-extrabold text-emerald-400 mt-1">
            {formatVND(stats.revenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.paidCount} đơn hàng thành công
          </div>
        </div>
        <div className="glow-card rounded-2xl p-5">
          <div className="text-xs text-slate-400">Đơn chờ chuyển khoản</div>
          <div className="font-display text-2xl font-extrabold text-amber-300 mt-1">
            {stats.pendingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tự động mở khi Webhook về
          </div>
        </div>
        <div className="glow-card rounded-2xl p-5">
          <div className="text-xs text-slate-400">Tổng số khóa học</div>
          <div className="font-display text-2xl font-extrabold text-cyan-300 mt-1">
            {stats.totalCourses}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Thương mại, Nội bộ &amp; Miễn phí
          </div>
        </div>
        <div className="glow-card rounded-2xl p-5">
          <div className="text-xs text-slate-400">Tài khoản hệ thống</div>
          <div className="font-display text-2xl font-extrabold text-white mt-1">
            {stats.totalUsers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {db.activationCodes.length} mã kích hoạt đang chạy
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => setTab("courses")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
            tab === "courses"
              ? "btn-gradient text-white"
              : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600"
          }`}
        >
          <Video className="w-4 h-4" /> Khóa Học (YouTube / Vimeo)
        </button>

        <button
          type="button"
          onClick={() => setTab("membership")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
            tab === "membership"
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950"
              : "bg-slate-900 text-amber-300 border border-amber-500/30 hover:border-amber-400"
          }`}
        >
          <Crown className="w-4 h-4" /> Hội Viên Membership (
          {
            Object.values(db.subscriptions || {}).filter((s) =>
              isSubscriptionActive(s)
            ).length
          }
          )
        </button>

        <button
          type="button"
          onClick={() => setTab("affiliate")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
            tab === "affiliate"
              ? "bg-emerald-500 text-slate-950"
              : "bg-slate-900 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400"
          }`}
        >
          <Share2 className="w-4 h-4" /> Hoa Hồng Affiliate (
          {(db.affiliateCommissions || []).filter((c) => c.status === "pending").length} chờ trả)
        </button>

        <button
          type="button"
          onClick={() => setTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
            tab === "orders"
              ? "btn-gradient text-white"
              : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600"
          }`}
        >
          <QrCode className="w-4 h-4" /> Đơn Hàng VietQR ({db.orders.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("coupons")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
            tab === "coupons"
              ? "btn-gradient text-white"
              : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600"
          }`}
        >
          <Tag className="w-4 h-4" /> Mã Giảm Giá ({(db.coupons || []).length})
        </button>

        <button
          type="button"
          onClick={() => setTab("codes")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
            tab === "codes"
              ? "btn-gradient text-white"
              : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600"
          }`}
        >
          <KeyRound className="w-4 h-4" /> Mã Nội Bộ &amp; Học Bổng ({db.activationCodes.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("users")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
            tab === "users"
              ? "btn-gradient text-white"
              : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600"
          }`}
        >
          <UserCheck className="w-4 h-4" /> Tài Khoản &amp; Nhân Sự ({db.users.length})
        </button>
      </div>

      {/* TAB 1: COURSE STUDIO */}
      {tab === "courses" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveCourse}
            className="lg:col-span-7 glow-card rounded-3xl p-6 space-y-5"
          >
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Đăng Khóa Học Mới Lên Hệ Thống
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên khóa học *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Thực Chiến Bán Hàng Zalo OA & AI Agent 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mô tả ngắn hấp dẫn
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Kết quả đầu ra mà học viên đạt được sau khóa học..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mô hình phân phối (Hướng 1 hoặc 2)
                  </label>
                  <select
                    value={accessType}
                    onChange={(e) =>
                      setAccessType(e.target.value as CourseAccessType)
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="commercial">Hướng 2: Bán Thương Mại (VietQR)</option>
                    <option value="membership">Hướng 3: Hội Viên Membership (Đóng hàng tháng)</option>
                    <option value="internal">Hướng 1: Đào Tạo Nội Bộ (Ẩn giá)</option>
                    <option value="free">Hướng 1/2: Cộng Đồng Miễn Phí (0đ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Danh mục
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {accessType === "commercial" && (
                <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Giá bán ưu đãi (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Giá gốc gạch ngang (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includedInMembership}
                    onChange={(e) => setIncludedInMembership(e.target.checked)}
                    className="rounded border-slate-700"
                  />
                  Cho phép Hội viên Membership đang còn hạn cũng được học khóa này
                </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn ảnh bìa từ kho Ohana
                </label>
                <select
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {OHANA_THUMBNAILS.map((t) => (
                    <option key={t.url} value={t.url}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Danh sách Video Bài Giảng (YouTube / Playlist / Vimeo)
                  </label>
                  <button
                    type="button"
                    onClick={addLessonRow}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold cursor-pointer"
                  >
                    + Thêm bài
                  </button>
                </div>

                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Tên chương học"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                />

                {lessonsDraft.map((les, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900/75 border border-slate-800 space-y-2.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={les.title}
                        onChange={(e) => {
                          const copy = [...lessonsDraft];
                          copy[idx].title = e.target.value;
                          setLessonsDraft(copy);
                        }}
                        placeholder="Tên bài giảng"
                        className="sm:col-span-9 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={les.duration}
                        onChange={(e) => {
                          const copy = [...lessonsDraft];
                          copy[idx].duration = e.target.value;
                          setLessonsDraft(copy);
                        }}
                        placeholder="25:00"
                        className="sm:col-span-3 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={les.videoUrl}
                        onChange={(e) => {
                          const copy = [...lessonsDraft];
                          copy[idx].videoUrl = e.target.value;
                          setLessonsDraft(copy);
                          setPreviewUrl(e.target.value);
                        }}
                        placeholder="https://www.youtube.com/watch?v=... hoặc playlist"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-cyan-300 font-mono"
                      />
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 px-2">
                        <input
                          type="checkbox"
                          checked={les.isFreePreview}
                          onChange={(e) => {
                            const copy = [...lessonsDraft];
                            copy[idx].isFreePreview = e.target.checked;
                            setLessonsDraft(copy);
                          }}
                        />
                        Cho học thử
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {courseMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                {courseMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={savingCourse}
              className="w-full py-3 rounded-xl btn-gradient text-white font-extrabold text-sm cursor-pointer"
            >
              {savingCourse ? "Đang xuất bản..." : "Xuất Bản Khóa Học Ngay"}
            </button>
          </form>

          <div className="lg:col-span-5 space-y-6">
            <div className="glow-card rounded-3xl p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Kiểm Tra Nhúng Video (YouTube Unlisted / Playlist / Vimeo)
              </div>
              <VideoPlayer videoUrl={previewUrl} title="Xem trước video bài giảng" />
            </div>

            <div className="glow-card rounded-3xl p-5 space-y-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Khóa Học Đang Hoạt Động ({db.courses.length})
              </div>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {db.courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/courses/${c.slug}`}
                        className="text-xs font-bold text-white hover:text-cyan-300 line-clamp-1"
                      >
                        {c.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>
                          {c.accessType === "internal"
                            ? "Nội bộ"
                            : c.accessType === "free"
                            ? "Miễn phí"
                            : formatVND(c.price)}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3 h-3" /> {c.studentsCount}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(c.id)}
                      title="Xóa khóa học"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & VIETQR WEBHOOK */}
      {tab === "orders" && (
        <div className="space-y-6">
          <div className="glow-card rounded-2xl p-5 border border-cyan-500/35 space-y-2">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Endpoint Webhook Tự Động SePay / PayOS / Casso
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Khi đưa lên domain chính thức (Vercel), anh chỉ cần dán đường dẫn sau vào mục cấu hình Webhook của{" "}
              <strong>SePay / PayOS / Casso</strong>:
            </p>
            <code className="block px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono">
              POST https://academy.ohana.vn/api/webhooks/payment
            </code>
          </div>

          <div className="glow-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase">
                  <tr>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Học viên</th>
                    <th className="px-4 py-3">Khóa học</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {db.orders.map((ord) => (
                    <tr key={ord.orderCode} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                        {ord.orderCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-400">
                          {ord.customerPhone} • {ord.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-200 max-w-xs truncate">
                        {ord.courseTitle}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {formatVND(ord.finalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {ord.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                            Chờ chuyển khoản
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        {ord.status !== "paid" ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleTriggerWebhookForOrder(
                                  ord.orderCode,
                                  ord.finalAmount
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" /> Test Webhook
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveOrder(ord.orderCode)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold cursor-pointer"
                            >
                              Duyệt tay
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {ord.transactionRef || "Hoàn tất"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MEMBERSHIP MANAGEMENT */}
      {tab === "membership" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left column: Quick Post Updated Lesson + Manual Grant Days */}
          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={handleAddUpdatedLesson}
              className="glow-card rounded-3xl p-6 space-y-4 border border-amber-500/30"
            >
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Đăng Bài Học Cập Nhật Mới Cho Hội Viên
              </h2>
              <p className="text-xs text-slate-400">
                Video mới đăng sẽ tự động gắn ngày cập nhật và hiện ngay trên đầu bảng tin{" "}
                <strong className="text-amber-300">/membership</strong> cho Hội viên còn hạn.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn khóa học Membership *
                </label>
                <select
                  value={updCourseId}
                  onChange={(e) => setUpdCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {db.courses
                    .filter((c) => isCourseInMembership(c))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên chương / Đợt cập nhật
                </label>
                <input
                  type="text"
                  value={updChapterTitle}
                  onChange={(e) => setUpdChapterTitle(e.target.value)}
                  placeholder="VD: Cập Nhật Tháng 12/2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-8">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tiêu đề bài học mới *
                  </label>
                  <input
                    type="text"
                    required
                    value={updLessonTitle}
                    onChange={(e) => setUpdLessonTitle(e.target.value)}
                    placeholder="VD: Cập Nhật #03: Tạo Video Viral..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Thời lượng
                  </label>
                  <input
                    type="text"
                    value={updDuration}
                    onChange={(e) => setUpdDuration(e.target.value)}
                    placeholder="18:30"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link Video YouTube / Vimeo *
                </label>
                <input
                  type="url"
                  required
                  value={updVideoUrl}
                  onChange={(e) => setUpdVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mô tả ngắn nội dung bài học
                </label>
                <textarea
                  rows={2}
                  value={updSummary}
                  onChange={(e) => setUpdSummary(e.target.value)}
                  placeholder="Học viên sẽ áp dụng được gì ngay sau video này..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updPreview}
                  onChange={(e) => setUpdPreview(e.target.checked)}
                />
                Cho phép khách xem thử miễn phí bài này
              </label>

              {updErr && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-semibold">
                  {updErr}
                </div>
              )}
              {updMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold">
                  {updMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs cursor-pointer"
              >
                + Đăng Bài Học Cập Nhật Ngay
              </button>
            </form>

            <form
              onSubmit={handleGrantDays}
              className="glow-card rounded-3xl p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-cyan-400" />
                Cấp / Gia Hạn Ngày Hội Viên Thủ Công
              </h2>
              <p className="text-xs text-slate-400">
                Dùng khi khách chuyển khoản qua Zalo/Offline hoặc tặng ngày Membership VIP (tự cộng dồn nếu đang còn hạn).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn tài khoản học viên *
                </label>
                <select
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="">-- Chọn học viên --</option>
                  {db.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số ngày cộng thêm *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={grantDays}
                    onChange={(e) => setGrantDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên gói hiển thị
                  </label>
                  <input
                    type="text"
                    value={grantNote}
                    onChange={(e) => setGrantNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              {grantMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold">
                  {grantMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-gradient text-white font-bold text-xs cursor-pointer"
              >
                Kích Hoạt / Cộng Dồn Ngày Ngay
              </button>
            </form>
          </div>

          {/* Right column: Plans Manager + Included Courses + Subscribers List */}
          <div className="lg:col-span-7 space-y-6">
            {/* Plans Manager */}
            <div className="glow-card rounded-3xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">
                Các Gói Hội Viên Định Kỳ ({(db.membershipPlans || []).length})
              </h2>

              <div className="space-y-3">
                {(db.membershipPlans || []).map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                          {formatVND(p.price)} / {p.durationDays} ngày
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.active
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {p.active ? "Đang mở bán" : "Đang tắt"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{p.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditPlan(p)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Sửa giá
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePlan(p.id, !p.active)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-bold cursor-pointer"
                      >
                        {p.active ? "Tắt" : "Bật"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(p.id)}
                        className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSavePlan}
                className="pt-4 border-t border-slate-800 space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {mPlanId ? `Đang sửa gói: ${mPlanId}` : "Thêm Gói Membership Mới"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={mPlanName}
                    onChange={(e) => setMPlanName(e.target.value)}
                    placeholder="Tên gói (VD: Gói Hội Viên 1 Tháng)"
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={mPlanBadge}
                    onChange={(e) => setMPlanBadge(e.target.value)}
                    placeholder="Nhãn nổi bật (VD: Phổ biến nhất)"
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Số ngày *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={mPlanDays}
                      onChange={(e) => setMPlanDays(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Giá bán (VNĐ) *</label>
                    <input
                      type="number"
                      min={1000}
                      required
                      value={mPlanPrice}
                      onChange={(e) => setMPlanPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Giá gốc</label>
                    <input
                      type="number"
                      value={mPlanOriginal}
                      onChange={(e) => setMPlanOriginal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={mPlanSubtitle}
                  onChange={(e) => setMPlanSubtitle(e.target.value)}
                  placeholder="Mô tả ngắn dưới tên gói"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <textarea
                  rows={2}
                  value={mPlanFeatures}
                  onChange={(e) => setMPlanFeatures(e.target.value)}
                  placeholder="Mỗi dòng là 1 gạch đầu dòng quyền lợi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                {mPlanMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold">
                    {mPlanMsg}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl btn-gradient text-white font-bold text-xs cursor-pointer"
                  >
                    {mPlanId ? "Cập Nhật Gói Này" : "+ Lưu Gói Mới"}
                  </button>
                  {mPlanId && (
                    <button
                      type="button"
                      onClick={() => {
                        setMPlanId("");
                        setMPlanName("");
                        setMPlanSubtitle("");
                        setMPlanBadge("");
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Hủy sửa
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Courses Included in Membership */}
            <div className="glow-card rounded-3xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-white">
                Khóa Học Nằm Trong Quyền Lợi Membership
              </h2>
              <p className="text-xs text-slate-400">
                Tích chọn khóa học thương mại nào anh muốn mở thêm cho Hội viên (khóa lẻ 6.6tr mặc định Tắt để bán riêng).
              </p>
              <div className="space-y-2.5">
                {db.courses
                  .filter((c) => c.accessType === "membership" || c.accessType === "commercial")
                  .map((c) => {
                    const included = isCourseInMembership(c);
                    return (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {c.accessType === "membership"
                              ? "Khóa chuyên biệt Membership"
                              : `Khóa thương mại (${formatVND(c.price)})`}
                          </div>
                        </div>
                        {c.accessType === "membership" ? (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold shrink-0">
                            Mặc định có
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleCourseMembership(c.id, !included)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 cursor-pointer ${
                              included
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                            }`}
                          >
                            {included ? "✓ Đang mở cho VIP" : "Đang bán lẻ riêng"}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Active & Past Subscribers */}
            <div className="glow-card rounded-3xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-white">
                Danh Sách Hội Viên ({Object.keys(db.subscriptions || {}).length})
              </h2>
              {Object.keys(db.subscriptions || {}).length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                  Chưa có hội viên nào đăng ký. Khi khách thanh toán gói trên /membership hoặc anh cấp ngày ở khung bên trái, danh sách sẽ hiện tại đây.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Object.values(db.subscriptions || {}).map((sub) => {
                    const member = db.users.find((u) => u.id === sub.userId);
                    const active = isSubscriptionActive(sub);
                    const daysLeft = getRemainingDays(sub);
                    return (
                      <div
                        key={sub.userId}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">
                              {member?.name || sub.userId}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                active
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {active ? `Còn ${daysLeft} ngày` : "Đã hết hạn"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {member?.email || ""} • {sub.planName} • Hết hạn:{" "}
                            {new Date(sub.expiresAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQuickExtendSub(sub.userId, 30)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 text-xs font-bold cursor-pointer"
                          >
                            +30 ngày
                          </button>
                          {active && (
                            <button
                              type="button"
                              onClick={() => handleRevokeSub(sub.userId)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 text-xs font-bold cursor-pointer"
                            >
                              Ngưng hạn
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: AFFILIATE COMMISSIONS & PAYOUTS */}
      {tab === "affiliate" && (() => {
        const allComms = db.affiliateCommissions || [];
        const pendingTotal = allComms
          .filter((c) => c.status === "pending")
          .reduce((s, c) => s + c.commissionAmount, 0);
        const paidTotal = allComms
          .filter((c) => c.status === "paid")
          .reduce((s, c) => s + c.commissionAmount, 0);
        const affRevenue = allComms
          .filter((c) => c.status !== "cancelled")
          .reduce((s, c) => s + c.orderAmount, 0);
        const filteredComms = allComms.filter(
          (c) => affFilter === "all" || c.status === affFilter
        );

        const modalRefUser = payoutModalCommission
          ? db.users.find((u) => u.id === payoutModalCommission.referrerUserId)
          : undefined;
        const modalPayout = modalRefUser?.affiliatePayout;
        const modalQrUrl =
          payoutModalCommission && modalPayout?.bankId && modalPayout?.accountNo
            ? buildVietQrUrl({
                amount: payoutModalCommission.commissionAmount,
                orderCode: `HH ${payoutModalCommission.orderCode}`,
                bankId: modalPayout.bankId,
                accountNo: modalPayout.accountNo,
                accountName: modalPayout.accountName,
              })
            : "";

        return (
          <div className="space-y-6">
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glow-card rounded-2xl p-5 border border-amber-500/35">
                <div className="text-xs text-amber-300 font-semibold">
                  Hoa hồng chờ chuyển khoản
                </div>
                <div className="font-display text-2xl font-extrabold text-amber-300 mt-1">
                  {formatVND(pendingTotal)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {allComms.filter((c) => c.status === "pending").length} giao dịch cần chi trả
                </div>
              </div>
              <div className="glow-card rounded-2xl p-5 border border-emerald-500/35">
                <div className="text-xs text-emerald-300 font-semibold">
                  Hoa hồng đã chi trả
                </div>
                <div className="font-display text-2xl font-extrabold text-emerald-400 mt-1">
                  {formatVND(paidTotal)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {allComms.filter((c) => c.status === "paid").length} giao dịch hoàn tất
                </div>
              </div>
              <div className="glow-card rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-semibold">
                  Tổng doanh số từ kênh Affiliate
                </div>
                <div className="font-display text-2xl font-extrabold text-cyan-300 mt-1">
                  {formatVND(affRevenue)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Tỷ lệ: 10% Khóa Thương Mại • 20% Membership
                </div>
              </div>
            </div>

            {/* Commissions Table */}
            <div className="glow-card rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  Đối Soát &amp; Chi Trả Hoa Hồng Affiliate ({filteredComms.length})
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "all", label: `Tất cả (${allComms.length})` },
                      {
                        id: "pending",
                        label: `Chờ trả (${allComms.filter((c) => c.status === "pending").length})`,
                      },
                      {
                        id: "paid",
                        label: `Đã trả (${allComms.filter((c) => c.status === "paid").length})`,
                      },
                      { id: "cancelled", label: "Đã hủy" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAffFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        affFilter === f.id
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-300 border border-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredComms.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  Chưa có giao dịch hoa hồng Affiliate nào ở trạng thái này. Khi học viên chia sẻ link{" "}
                  <code>?ref=...</code> và có đơn thanh toán thành công (SePay / duyệt tay), hoa hồng 10% / 20% sẽ tự động xuất hiện tại đây.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Đơn Hàng</th>
                        <th className="px-4 py-3">Người Giới Thiệu &amp; STK Nhận Tiền</th>
                        <th className="px-4 py-3">Khách Mua</th>
                        <th className="px-4 py-3">Hoa Hồng</th>
                        <th className="px-4 py-3">Trạng Thái</th>
                        <th className="px-4 py-3 text-right">Chi Trả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredComms.map((c) => {
                        const refUser = db.users.find((u) => u.id === c.referrerUserId);
                        const payout = refUser?.affiliatePayout;
                        return (
                          <tr key={c.id} className="hover:bg-slate-900/40 align-top">
                            <td className="px-4 py-3">
                              <div className="font-mono font-bold text-cyan-300">
                                {c.orderCode}
                              </div>
                              <div className="text-slate-200 max-w-[200px] truncate mt-0.5">
                                {c.itemTitle}
                              </div>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.orderType === "membership"
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-cyan-500/15 text-cyan-300"
                                }`}
                              >
                                {c.orderType === "membership"
                                  ? `Membership (${Math.round(c.commissionRate * 100)}%)`
                                  : `Khóa lẻ (${Math.round(c.commissionRate * 100)}%)`}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">
                                {refUser?.name || c.referrerName}{" "}
                                <span className="font-mono text-[10px] text-cyan-300">
                                  ({c.referralCode})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Zalo: {payout?.zaloPhone || refUser?.phone || c.referrerPhone || "Chưa cập nhật"} •{" "}
                                {c.referrerEmail}
                              </div>
                              {payout?.accountNo ? (
                                <div className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                                  {payout.bankId} • {payout.accountNo} • {payout.accountName}
                                </div>
                              ) : (
                                <div className="mt-1 text-[11px] text-amber-300">
                                  ⚠ Chưa khai báo STK — liên hệ Zalo để lấy STK
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{c.buyerName}</div>
                              <div className="text-[11px] text-slate-400">{c.buyerEmail}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Đơn: {formatVND(c.orderAmount)}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-display font-extrabold text-sm text-emerald-400 whitespace-nowrap">
                              {formatVND(c.commissionAmount)}
                            </td>
                            <td className="px-4 py-3">
                              {c.status === "paid" ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                                    <CheckCircle2 className="w-3 h-3" /> Đã chi trả
                                  </span>
                                  {c.paidAt && (
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      {new Date(c.paidAt).toLocaleDateString("vi-VN")}
                                    </div>
                                  )}
                                  {c.payoutNote && (
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      {c.payoutNote}
                                    </div>
                                  )}
                                </div>
                              ) : c.status === "cancelled" ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[11px] font-bold">
                                  Đã hủy
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                                  Chờ chuyển khoản
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right space-y-1.5 whitespace-nowrap">
                              {c.status === "pending" ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPayoutModalCommission(c);
                                      setPayoutNoteInput(
                                        `Đã chuyển khoản hoa hồng đơn ${c.orderCode}`
                                      );
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                    {payout?.accountNo ? "QR Chuyển Tiền" : "Xác Nhận Trả"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAffiliateAction("cancel_commission", c.id)
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-bold cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : c.status === "paid" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAffiliateAction("mark_pending", c.id)
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                                >
                                  Đưa về chờ trả
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Partner Eligibility Management */}
            <div className="glow-card rounded-3xl p-6 space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Danh Sách Quyền Affiliate Của Tài Khoản ({db.users.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Học viên đã mua khóa học / Membership và Nhân sự nội bộ tự động được mở Affiliate. Anh có thể bấm bật thủ công cho bất kỳ CTV ngoài nào tại đây.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {db.users.map((u) => {
                  const eligible = isUserAffiliateEligible(
                    u,
                    db.orders || [],
                    db.subscriptions || {}
                  );
                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white truncate">
                            {u.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              eligible
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {eligible ? "Đang mở Affiliate" : "Chưa mở"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {u.email}
                          {u.referralCode ? ` • Mã: ${u.referralCode}` : ""}
                        </div>
                        {u.affiliatePayout?.accountNo && (
                          <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                            STK: {u.affiliatePayout.bankId} {u.affiliatePayout.accountNo} (
                            {u.affiliatePayout.accountName})
                          </div>
                        )}
                      </div>
                      {u.role === "student" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleUserAffiliate(u.id, !u.affiliateEnabled)
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 cursor-pointer ${
                            u.affiliateEnabled
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/35"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/35"
                          }`}
                        >
                          {u.affiliateEnabled ? "Tắt cấp tay" : "+ Bật quyền CTV"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payout VietQR Modal */}
            {payoutModalCommission && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-3xl bg-[#0B101D] border border-emerald-500/40 p-6 relative shadow-2xl space-y-4">
                  <button
                    type="button"
                    onClick={() => setPayoutModalCommission(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Chi Trả Hoa Hồng Affiliate
                    </span>
                    <h3 className="font-display text-xl font-extrabold text-white mt-0.5">
                      {formatVND(payoutModalCommission.commissionAmount)} →{" "}
                      {modalRefUser?.name || payoutModalCommission.referrerName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Đơn {payoutModalCommission.orderCode} • Zalo:{" "}
                      {modalPayout?.zaloPhone || modalRefUser?.phone || "Chưa có SĐT"}
                    </p>
                  </div>

                  {modalQrUrl && modalPayout ? (
                    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="bg-white p-2.5 rounded-2xl w-48">
                        <img
                          src={modalQrUrl}
                          alt="VietQR Chi Trả Hoa Hồng"
                          className="w-full h-auto rounded-xl"
                        />
                      </div>
                      <div className="text-center text-xs space-y-0.5">
                        <div className="font-bold text-cyan-300">
                          {modalPayout.bankName}
                        </div>
                        <div className="font-mono font-extrabold text-white text-sm">
                          {modalPayout.accountNo} • {modalPayout.accountName}
                        </div>
                        <div className="text-[11px] text-amber-300 font-mono">
                          Nội dung: HH {payoutModalCommission.orderCode}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                      Học viên này chưa nhập Số tài khoản ngân hàng trong trang /affiliate. Anh liên hệ qua SĐT/Email để nhận STK, chuyển khoản xong rồi bấm nút xác nhận bên dưới nhé.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ghi chú giao dịch / Mã tham chiếu
                    </label>
                    <input
                      type="text"
                      value={payoutNoteInput}
                      onChange={(e) => setPayoutNoteInput(e.target.value)}
                      placeholder="VD: Đã chuyển khoản ACB ngày 28/11"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleAffiliateAction(
                        "mark_paid",
                        payoutModalCommission.id,
                        payoutNoteInput
                      )
                    }
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Xác Nhận Đã Chuyển Khoản Hoa Hồng
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB: COMMERCIAL DISCOUNT COUPONS */}
      {tab === "coupons" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveCoupon}
            className="lg:col-span-5 glow-card rounded-3xl p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              Tạo / Thiết Lập Mã Giảm Giá
            </h2>
            <p className="text-xs text-slate-400">
              Mã được lưu bảo mật trên Supabase (không hiển thị công khai ở trang thanh toán). Anh có thể bật/tắt bất cứ lúc nào hoặc copy link ưu đãi riêng gửi khách VIP.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mã giảm giá (không dấu) *
              </label>
              <input
                type="text"
                required
                value={cCode}
                onChange={(e) => setCCode(e.target.value.toUpperCase())}
                placeholder="VD: K04VIP500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tên chương trình ưu đãi
              </label>
              <input
                type="text"
                value={cLabel}
                onChange={(e) => setCLabel(e.target.value)}
                placeholder="VD: Ưu đãi khách mời Workshop K04"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kiểu giảm
                </label>
                <select
                  value={cType}
                  onChange={(e) =>
                    setCType(e.target.value === "percent" ? "percent" : "fixed")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="fixed">Giảm trực tiếp (VNĐ)</option>
                  <option value="percent">Giảm theo phần trăm (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {cType === "percent" ? "Phần trăm giảm (%) *" : "Số tiền giảm (VNĐ) *"}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={cType === "percent" ? 100 : undefined}
                  value={cValue}
                  onChange={(e) => setCValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Khóa học áp dụng
              </label>
              <select
                value={cTarget}
                onChange={(e) => setCTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="ALL">Tất cả khóa học thương mại</option>
                {db.courses
                  .filter((c) => c.accessType === "commercial")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Chỉ khóa: {c.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số lượt tối đa (0 = vô hạn)
                </label>
                <input
                  type="number"
                  min={0}
                  value={cMaxUses}
                  onChange={(e) => setCMaxUses(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ngày hết hạn (tùy chọn)
                </label>
                <input
                  type="date"
                  value={cExpiresAt}
                  onChange={(e) => setCExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={cActive}
                onChange={(e) => setCActive(e.target.checked)}
                className="rounded border-slate-700"
              />
              Kích hoạt ngay sau khi tạo
            </label>

            {couponErr && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-semibold">
                {couponErr}
              </div>
            )}
            {couponMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold">
                {couponMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-gradient text-white font-bold text-xs cursor-pointer"
            >
              Lưu Mã Giảm Giá
            </button>
          </form>

          <div className="lg:col-span-7 glow-card rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Danh Sách Mã Giảm Giá ({(db.coupons || []).length})
            </h2>
            {(db.coupons || []).length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                Chưa có mã giảm giá nào. Tạo mã mới ở khung bên trái để sử dụng cho các chiến dịch ưu đãi.
              </div>
            ) : (
              <div className="space-y-3">
                {(db.coupons || []).map((cp) => {
                  const isExpired = Boolean(
                    cp.expiresAt && new Date(cp.expiresAt).getTime() < Date.now()
                  );
                  return (
                    <div
                      key={cp.code}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-extrabold text-sm text-cyan-300">
                            {cp.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold">
                            {cp.discountType === "percent"
                              ? `-${cp.discountValue}%`
                              : `-${formatVND(cp.discountValue)}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cp.active && !isExpired
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isExpired
                              ? "Đã hết hạn"
                              : cp.active
                              ? "Đang bật"
                              : "Đang tắt"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">{cp.label}</div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>
                            Áp dụng:{" "}
                            {cp.targetCourseId === "ALL"
                              ? "Tất cả khóa thương mại"
                              : db.courses.find((c) => c.id === cp.targetCourseId)?.title ||
                                cp.targetCourseId}
                          </span>
                          <span>
                            Lượt dùng: {cp.usedCount} /{" "}
                            {cp.maxUses === 0 ? "∞" : cp.maxUses}
                          </span>
                          {cp.expiresAt && (
                            <span>
                              Hạn: {new Date(cp.expiresAt).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(cp.code, !cp.active)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 border cursor-pointer ${
                            cp.active
                              ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40"
                              : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {cp.active ? "Tắt mã" : "Bật mã"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCouponLink(cp.code, cp.targetCourseId)
                          }
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedCouponLink === cp.code ? "Đã copy link" : "Link ưu đãi"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(cp.code)}
                          title="Xóa mã giảm giá"
                          className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTERNAL ACTIVATION CODES */}
      {tab === "codes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleCreateCode}
            className="lg:col-span-5 glow-card rounded-3xl p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              Phát Hành Mã Kích Hoạt Mới
            </h2>
            <p className="text-xs text-slate-400">
              Dùng để cấp nhanh cho nhân sự mới của Ohana hoặc khách hàng đăng ký trực tiếp tại hội thảo Offline.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mã kích hoạt *
              </label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="VD: OHANA-TEAMTRI-2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mô tả mục đích cấp mã
              </label>
              <input
                type="text"
                value={newCodeLabel}
                onChange={(e) => setNewCodeLabel(e.target.value)}
                placeholder="VD: Học bổng 100% lớp Tháng 12"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phạm vi mở khóa
              </label>
              <select
                value={newCodeTarget}
                onChange={(e) => setNewCodeTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="ALL_INTERNAL">Toàn bộ các khóa Đào tạo Nội bộ</option>
                {db.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Khóa riêng: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số lượt sử dụng tối đa
              </label>
              <input
                type="number"
                value={newCodeMaxUses}
                onChange={(e) => setNewCodeMaxUses(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-gradient text-white font-bold text-xs cursor-pointer"
            >
              Tạo Mã Kích Hoạt
            </button>
          </form>

          <div className="lg:col-span-7 glow-card rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Danh Sách Mã Đang Hoạt Động
            </h2>
            <div className="space-y-3">
              {db.activationCodes.map((ac) => (
                <div
                  key={ac.code}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-mono font-extrabold text-sm text-amber-300">
                      {ac.code}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">{ac.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Phạm vi:{" "}
                      {ac.targetCourseId === "ALL_INTERNAL"
                        ? "Toàn bộ Đào tạo Nội bộ"
                        : db.courses.find((c) => c.id === ac.targetCourseId)?.title ||
                          ac.targetCourseId}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-cyan-300">
                      Đã dùng {ac.usedCount} / {ac.maxUses}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Đang hiệu lực
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USER & INTERNAL STAFF MANAGEMENT */}
      {tab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleCreateUser}
            className="glow-card rounded-3xl p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              Cấp Tài Khoản Nhân Sự / Học Viên
            </h2>
            <p className="text-xs text-slate-400">
              Tạo nhanh tài khoản cho Nhân sự nội bộ Ohana hoặc đối tác để đăng nhập học ngay.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={uName}
                onChange={(e) => setUName(e.target.value)}
                placeholder="Nguyễn Thành Đạt"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="dat@ohana.vn"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={uPhone}
                  onChange={(e) => setUPhone(e.target.value)}
                  placeholder="090x..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phân quyền
                </label>
                <select
                  value={uRole}
                  onChange={(e) =>
                    setURole(e.target.value === "student" ? "student" : "internal")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="internal">Nhân sự Nội bộ Ohana</option>
                  <option value="student">Học viên Thương mại</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mật khẩu (≥ 6 ký tự) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phòng ban / Đội nhóm (tùy chọn)
              </label>
              <input
                type="text"
                value={uDept}
                onChange={(e) => setUDept(e.target.value)}
                placeholder="VD: Team Trí - Phát triển Thị trường"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            {userMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold">
                {userMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-gradient text-white font-bold text-xs cursor-pointer"
            >
              Cấp Tài Khoản Ngay
            </button>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="glow-card rounded-3xl p-6 space-y-4 border border-amber-500/25"
          >
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Đổi Mật Khẩu Admin ({user.email})
            </h2>
            <p className="text-xs text-slate-400">
              Cập nhật trực tiếp mật khẩu đăng nhập tài khoản Quản trị viên trên Supabase (băm scrypt).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mật khẩu hiện tại *
              </label>
              <input
                type="password"
                required
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mật khẩu mới (≥ 8 ký tự) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nhập lại mật khẩu mới *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
            {pwdError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-semibold">
                {pwdError}
              </div>
            )}
            {pwdMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold">
                {pwdMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={pwdSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              {pwdSubmitting ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu Admin"}
            </button>
          </form>
          </div>

          <div className="lg:col-span-7 glow-card rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Danh Sách Tài Khoản Hệ Thống ({db.users.length})
            </h2>
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {db.users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{u.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          u.role === "admin"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : u.role === "internal"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-cyan-500/20 text-cyan-300"
                        }`}
                      >
                        {u.role === "admin"
                          ? "Quản trị viên"
                          : u.role === "internal"
                          ? "Nhân sự Nội bộ"
                          : "Học viên"}
                      </span>
                      {u.authProvider === "google" && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200">
                          Google
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {u.email} {u.phone ? `• ${u.phone}` : ""}
                    </div>
                  </div>

                  {u.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSwitchUserRole(
                          u.id,
                          u.role === "internal" ? "student" : "internal"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 shrink-0 cursor-pointer"
                    >
                      {u.role === "internal"
                        ? "Chuyển về Học viên"
                        : "Nâng lên Nội bộ"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
