"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LogIn,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useLMS } from "@/context/LMSContext";
import { formatVND } from "@/lib/video";
import { CourseAccessType, UserRole } from "@/types/lms";

type AdminTab = "courses" | "orders" | "codes" | "users";

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
      price: accessType === "commercial" ? Number(price || 0) : 0,
      originalPrice:
        accessType === "commercial" && Number(originalPrice) > Number(price)
          ? Number(originalPrice)
          : undefined,
      thumbnail,
      badge:
        accessType === "internal"
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
