"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Copy,
  Crown,
  Loader2,
  LogIn,
  PlayCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { MemberZaloCard } from "@/components/MemberZaloCard";
import { useLMS } from "@/context/LMSContext";
import {
  collectRecentMembershipLessons,
  isCourseInMembership,
} from "@/lib/membership";
import { OHANA_BANK_CONFIG } from "@/lib/seed-data";
import { buildVietQrUrl, formatVND } from "@/lib/video";
import { MembershipPlan, Order } from "@/types/lms";

interface AppliedCouponState {
  code: string;
  label: string;
  discountAmount: number;
  finalAmount: number;
}

export default function MembershipPage() {
  const {
    db,
    user,
    mySubscription,
    hasActiveMembership,
    membershipRemainingDays,
    googleEnabled,
    refreshState,
    updateUserProfile,
  } = useLMS();

  const plans = useMemo(
    () =>
      (db.membershipPlans || [])
        .filter((p) => p.active)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [db.membershipPlans]
  );

  const membershipCourses = useMemo(
    () => db.courses.filter((c) => isCourseInMembership(c)),
    [db.courses]
  );

  const recentLessons = useMemo(
    () => collectRecentMembershipLessons(db.courses, 8),
    [db.courses]
  );

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showCouponBox, setShowCouponBox] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createError, setCreateError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    if (user) {
      setFullName((prev) => prev || user.name);
      setEmail((prev) => prev || user.email);
      setPhone((prev) => prev || user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (!order || order.status === "paid") return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.orderCode}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isPaid && data.order) {
            setOrder(data.order);
            await refreshState();
          }
        }
      } catch {}
    }, 3000);
    return () => clearInterval(timer);
  }, [order, refreshState]);

  const openCheckoutForPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setOrder(null);
    setCreateError("");
    setShowCouponBox(false);
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleApplyCoupon = async () => {
    if (!selectedPlan) return;
    const clean = couponCode.trim().toUpperCase();
    if (!clean) {
      setAppliedCoupon(null);
      setCouponError("");
      return;
    }
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean, planId: selectedPlan.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setAppliedCoupon(null);
        setCouponError(data.error || "Mã ưu đãi không hợp lệ hoặc đã hết hiệu lực.");
        return;
      }
      setAppliedCoupon({
        code: data.code,
        label: data.label,
        discountAmount: Number(data.discountAmount || 0),
        finalAmount: Number(data.finalAmount ?? selectedPlan.price),
      });
    } catch {
      setCouponError("Không thể kiểm tra mã ưu đãi lúc này.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCreateMembershipOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setCreatingOrder(true);
    setCreateError("");
    await updateUserProfile({ name: fullName, phone });

    try {
      let storedRef = "";
      try {
        storedRef = window.localStorage.getItem("ohana_ref") || "";
      } catch {}
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "membership",
          planId: selectedPlan.id,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          couponCode: appliedCoupon?.code || "",
          referralCode: storedRef,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Không thể tạo đơn đăng ký Membership.");
      } else if (data.order) {
        setOrder(data.order);
        await refreshState();
      }
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCopy = (val: string, field: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1800);
  };

  const finalPlanPrice = selectedPlan
    ? appliedCoupon
      ? appliedCoupon.finalAmount
      : selectedPlan.price
    : 0;

  const qrUrl = order
    ? buildVietQrUrl({
        amount: order.finalAmount,
        orderCode: order.orderCode,
      })
    : "";

  const flagshipMembershipCourse = membershipCourses[0];

  return (
    <div className="pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-800/80 py-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.16),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.14),transparent_55%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Crown className="w-4 h-4" />
              OHANA AI MEMBERSHIP • CẬP NHẬT BÀI HỌC MỚI HÀNG TUẦN
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Đóng Phí Định Kỳ Linh Hoạt —{" "}
              <span className="gradient-text">
                Học Trọn Bộ Bài Giảng AI Cập Nhật Mới Nhất
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Công nghệ AI thay đổi mỗi tuần. Trở thành Hội viên{" "}
              <strong className="text-white">Ohana Membership</strong> để liên tục cập nhật video
              hướng dẫn thực chiến, bộ Prompt kinh doanh, quy trình Automation mới nhất và tải trọn
              bộ tài liệu đính kèm trong suốt thời gian hội viên.
            </p>
          </div>

          {/* Active / Expired Status Banner */}
          {user && hasActiveMembership && mySubscription && (
            <div className="p-5 sm:p-6 rounded-3xl bg-emerald-500/10 border border-emerald-400/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  <Crown className="w-4 h-4" />
                  Tài khoản của bạn đang là Hội Viên VIP Ohana
                </div>
                <div className="text-lg sm:text-xl font-display font-bold text-white">
                  {mySubscription.planName} • Còn{" "}
                  <span className="text-emerald-300">{membershipRemainingDays} ngày</span>
                </div>
                <div className="text-xs text-slate-300">
                  Hiệu lực đến hết ngày{" "}
                  <strong className="text-white">
                    {new Date(mySubscription.expiresAt).toLocaleDateString("vi-VN")}
                  </strong>{" "}
                  • Khi gia hạn sớm, hệ thống sẽ tự động cộng dồn thêm ngày nối tiếp.
                </div>
              </div>
              {flagshipMembershipCourse && (
                <Link
                  href={`/learn/${flagshipMembershipCourse.slug}`}
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm inline-flex items-center justify-center gap-2 shrink-0 shadow-lg"
                >
                  <PlayCircle className="w-5 h-5" /> Vào Học Bài Cập Nhật Ngay
                </Link>
              )}
            </div>
          )}

          {user && mySubscription && !hasActiveMembership && (
            <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-400/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  <CalendarClock className="w-4 h-4" />
                  Gói Hội Viên Của Bạn Đã Hết Hạn
                </div>
                <div className="text-base sm:text-lg font-bold text-white">
                  Đã hết hạn ngày{" "}
                  {new Date(mySubscription.expiresAt).toLocaleDateString("vi-VN")} — Toàn bộ tiến
                  độ học cũ vẫn được bảo toàn nguyên vẹn.
                </div>
                <div className="text-xs text-slate-300">
                  Chọn 1 gói bên dưới để quét VietQR ACB gia hạn và mở khóa lại ngay lập tức trong 3 giây.
                </div>
              </div>
            </div>
          )}

          {/* Member Zalo Group QR & Join Card */}
          <MemberZaloCard />
        </div>
      </section>

      {/* 2. PRICING PLANS */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Gói Hội Viên Ohana Membership
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Chọn Kỳ Hạn Phù Hợp Với Lộ Trình Của Bạn
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Thanh toán tự động qua VietQR ACB 24/7 (SePay) — Kích hoạt ngay sau 3 giây, không cần chờ duyệt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, idx) => {
            const isHighlighted =
              plan.badge?.toLowerCase().includes("phổ biến") || idx === 1;
            const monthlyEquiv = Math.round(
              plan.price / Math.max(1, Math.round(plan.durationDays / 30))
            );
            return (
              <div
                key={plan.id}
                className={`glow-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative ${
                  isHighlighted
                    ? "border-2 border-amber-400/70 shadow-2xl shadow-amber-500/10"
                    : "border border-slate-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      {plan.durationDays} Ngày Quyền Lợi
                    </span>
                    {plan.badge && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          isHighlighted
                            ? "bg-amber-400 text-slate-950"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/35"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-extrabold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {plan.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 pb-4 border-b border-slate-800">
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                      <div className="text-xs text-rose-400 line-through font-semibold">
                        {formatVND(plan.originalPrice)}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                        {formatVND(plan.price)}
                      </span>
                      <span className="text-xs text-slate-400">
                        / {plan.durationDays} ngày
                      </span>
                    </div>
                    {plan.durationDays > 30 && (
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                        ≈ {formatVND(monthlyEquiv)} / tháng
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => openCheckoutForPlan(plan)}
                    className={`w-full py-3.5 px-5 rounded-xl font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isHighlighted
                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 hover:opacity-95 shadow-lg"
                        : "btn-gradient text-white"
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    {hasActiveMembership
                      ? `Gia Hạn Cộng Dồn (+${plan.durationDays} ngày)`
                      : "Đăng Ký Gói Này Ngay"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. RECENTLY UPDATED LESSONS FEED */}
      {recentLessons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                Bảng Tin Cập Nhật Liên Tục
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Bài Học Mới Cập Nhật Cho Hội Viên
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Hiển thị {recentLessons.length} bài giảng đăng gần nhất
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentLessons.map((item) => (
              <Link
                key={`${item.course.id}-${item.lesson.id}`}
                href={`/learn/${item.course.slug}`}
                className="glow-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/45 transition-all flex items-start justify-between gap-4 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Mới • {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
                    </span>
                    {item.lesson.isFreePreview ? (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        Học thử miễn phí
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        Hội viên VIP
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">
                      {item.lesson.duration}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                    {item.lesson.title}
                  </h3>
                  <div className="text-xs text-slate-400 line-clamp-2">
                    {item.lesson.summary}
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    {item.course.title} • {item.chapterTitle}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-cyan-400/50 flex items-center justify-center shrink-0 text-cyan-300">
                  <PlayCircle className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. INCLUDED MEMBERSHIP COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Quyền Lợi Kho Học Liệu
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Các Khóa Học Nằm Trong Gói Membership ({membershipCourses.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mở khóa đồng loạt ngay khi gói Hội viên đang hoạt động (các khóa chuyên sâu mua đứt lẻ được quản lý tách biệt).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {membershipCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* 5. CHECKOUT MODAL FOR SELECTED MEMBERSHIP PLAN */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0B101D] border border-cyan-500/40 p-6 sm:p-8 relative shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!user ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mx-auto">
                  <Crown className="w-8 h-8 text-amber-300" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-white">
                  Đăng Nhập Để Kích Hoạt {selectedPlan.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Đăng nhập bằng Google hoặc Email để hệ thống gắn chính xác{" "}
                  <strong>{selectedPlan.durationDays} ngày Hội viên</strong> vào tài khoản của bạn
                  ngay sau khi chuyển khoản VietQR.
                </p>
                <div className="space-y-3 max-w-sm mx-auto pt-2">
                  {googleEnabled && (
                    <a
                      href="/api/auth/google?next=%2Fmembership"
                      className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center shadow-lg"
                    >
                      Đăng nhập nhanh với Google
                    </a>
                  )}
                  <Link
                    href="/login?next=%2Fmembership"
                    className="w-full py-3.5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Đăng Nhập / Đăng Ký Email
                  </Link>
                </div>
              </div>
            ) : order?.status === "paid" ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-4 h-4" /> Kích Hoạt Thành Công • Mã Đơn {order.orderCode}
                </div>
                <h3 className="font-display text-2xl font-extrabold text-white">
                  Chào Mừng Hội Viên VIP Ohana Membership!
                </h3>
                <p className="text-sm text-slate-300">
                  Hệ thống đã cộng <strong>+{selectedPlan.durationDays} ngày</strong> quyền lợi Hội
                  viên vào tài khoản <strong className="text-cyan-300">{user.email}</strong>. Bạn có
                  thể vào học toàn bộ bài giảng cập nhật và tham gia Group Zalo Hội Viên ngay bây giờ!
                </p>
                <div className="text-left">
                  <MemberZaloCard compact />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {flagshipMembershipCourse && (
                    <Link
                      href={`/learn/${flagshipMembershipCourse.slug}`}
                      className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm inline-flex items-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" /> Vào Học Ngay
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : order ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 pr-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Quét VietQR ACB • Tự Động Kích Hoạt Sau 3 Giây
                    </span>
                    <h3 className="font-display text-xl font-extrabold text-white mt-0.5">
                      {selectedPlan.name} ({selectedPlan.durationDays} ngày)
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-bold shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang chờ tiền về (3s)...
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-2xl border-2 border-cyan-400 shadow-xl w-full max-w-[230px]">
                      <img
                        src={qrUrl}
                        alt={`VietQR ${order.orderCode}`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            OHANA_BANK_CONFIG.fallbackQrImage;
                        }}
                        className="w-full h-auto rounded-xl object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-cyan-300 font-semibold mt-2 text-center">
                      Mở App Ngân hàng bất kỳ quét mã trên
                    </span>
                  </div>

                  <div className="md:col-span-7 space-y-2.5 text-sm">
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Chủ tài khoản</div>
                      <div className="font-extrabold text-cyan-300 text-sm mt-0.5">
                        {OHANA_BANK_CONFIG.accountName}
                      </div>
                      <div className="text-xs text-slate-400">{OHANA_BANK_CONFIG.bankName}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Số tài khoản</div>
                        <div className="font-mono text-lg font-black text-emerald-400">
                          {OHANA_BANK_CONFIG.accountNo}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(OHANA_BANK_CONFIG.accountNo, "stk")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedField === "stk" ? "Đã chép" : "Sao chép"}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Số tiền</div>
                        <div className="font-display text-lg font-extrabold text-white">
                          {formatVND(order.finalAmount)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(order.finalAmount), "amt")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedField === "amt" ? "Đã chép" : "Sao chép"}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-amber-300 uppercase font-bold">
                          Nội dung chuyển khoản (Giữ nguyên)
                        </div>
                        <div className="font-mono text-base font-black text-amber-300">
                          {order.orderCode}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.orderCode, "code")}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedField === "code" ? "Đã chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateMembershipOrder} className="space-y-4">
                <div className="pr-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {hasActiveMembership
                      ? "Gia Hạn Cộng Dồn Ngày Hội Viên"
                      : "Đăng Ký Gói Hội Viên Ohana"}
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-white mt-0.5">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Quyền lợi <strong className="text-cyan-300">+{selectedPlan.durationDays} ngày</strong>{" "}
                    sẽ gắn trực tiếp vào tài khoản <strong>{user.email}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Số điện thoại Zalo *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="090x xxx xxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  {!showCouponBox && !appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => setShowCouponBox(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Bạn có mã ưu đãi? Bấm để nhập
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Nhập mã ưu đãi..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
                        />
                        <button
                          type="button"
                          disabled={validatingCoupon}
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 cursor-pointer"
                        >
                          {validatingCoupon ? "Đang kiểm..." : "Áp dụng"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-rose-400">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <p className="text-[11px] text-emerald-400 font-semibold">
                          ✓ Đã áp dụng: {appliedCoupon.label} (-{formatVND(appliedCoupon.discountAmount)})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Tổng thanh toán</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Đối soát tự động ACB 24/7 qua SePay
                    </div>
                  </div>
                  <div className="font-display text-2xl font-extrabold text-cyan-300">
                    {formatVND(finalPlanPrice)}
                  </div>
                </div>

                {createError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                    {createError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="w-full py-3.5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-5 h-5" />
                  {creatingOrder ? "Đang tạo mã VietQR..." : "Tạo Mã VietQR Thanh Toán Ngay"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
