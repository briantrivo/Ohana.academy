"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  LogIn,
  PlayCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { OHANA_BANK_CONFIG } from "@/lib/seed-data";
import { buildVietQrUrl, formatVND } from "@/lib/video";
import { Order } from "@/types/lms";

interface AppliedCouponState {
  code: string;
  label: string;
  discountAmount: number;
  finalAmount: number;
}

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const { db, user, googleEnabled, isLoading, refreshState, updateUserProfile } =
    useLMS();

  const course = db.courses.find((c) => c.slug === params.slug);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showCouponBox, setShowCouponBox] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [urlCouponParam, setUrlCouponParam] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        setIsLocalhost(true);
      }
      const qp = new URLSearchParams(window.location.search).get("coupon") || "";
      const cleanQp = qp.trim().toUpperCase();
      if (cleanQp) {
        setUrlCouponParam(cleanQp);
      }
    }
  }, []);

  useEffect(() => {
    if (!urlCouponParam || !course) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: urlCouponParam, courseId: course.id }),
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.valid) {
          setCouponCode(data.code);
          setAppliedCoupon({
            code: data.code,
            label: data.label,
            discountAmount: Number(data.discountAmount || 0),
            finalAmount: Number(data.finalAmount ?? course.price),
          });
          setShowCouponBox(true);
          setCouponError("");
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [urlCouponParam, course]);

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

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Không tìm thấy khóa học</h1>
        <Link href="/" className="mt-4 inline-block text-cyan-400 underline">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  if (!isLoading && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 pb-24">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại khóa học
        </Link>

        <div className="glow-card rounded-3xl p-8 border border-cyan-500/40 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-cyan-300" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            Đăng Nhập Để Nhận Khóa Học Tự Động
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Để khóa học <strong>{course.title}</strong> được gắn chặt vào tài khoản học tập và cấp Chứng chỉ chính xác, vui lòng đăng nhập hoặc tạo tài khoản trước khi thanh toán VietQR.
          </p>

          <div className="space-y-3 pt-2">
            {googleEnabled && (
              <a
                href={`/api/auth/google?next=${encodeURIComponent(
                  urlCouponParam
                    ? `/checkout/${course.slug}?coupon=${encodeURIComponent(urlCouponParam)}`
                    : `/checkout/${course.slug}`
                )}`}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                Đăng nhập nhanh với Google
              </a>
            )}
            <Link
              href={`/login?next=${encodeURIComponent(
                urlCouponParam
                  ? `/checkout/${course.slug}?coupon=${encodeURIComponent(urlCouponParam)}`
                  : `/checkout/${course.slug}`
              )}`}
              className="w-full py-3.5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Đăng Nhập / Tạo Tài Khoản Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalAmount = appliedCoupon
    ? appliedCoupon.finalAmount
    : Math.max(0, course.price);

  const handleApplyCoupon = async () => {
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
        body: JSON.stringify({ code: clean, courseId: course.id }),
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
        finalAmount: Number(data.finalAmount ?? course.price),
      });
      setCouponError("");
    } catch {
      setCouponError("Không thể kiểm tra mã ưu đãi lúc này. Vui lòng thử lại.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleClearCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
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
          courseId: course.id,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          couponCode: appliedCoupon?.code || "",
          referralCode: storedRef,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Không thể tạo đơn hàng.");
      } else if (data.order) {
        setOrder(data.order);
        await refreshState();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (val: string, field: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1800);
  };

  const handleSimulateWebhook = async () => {
    if (!order) return;
    setSimulatingWebhook(true);
    try {
      const res = await fetch("/api/webhooks/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway: "SePay",
          content: `CHUYEN KHOAN ${order.orderCode} HOC PHI OHANA`,
          transferAmount: order.finalAmount,
          referenceCode: `FT${Math.floor(10000000 + Math.random() * 90000000)}`,
        }),
      });
      if (res.ok) {
        const check = await fetch(`/api/orders/${order.orderCode}`, {
          cache: "no-store",
        });
        if (check.ok) {
          const checkData = await check.json();
          if (checkData.order) setOrder(checkData.order);
        }
        await refreshState();
      }
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const qrUrl = order
    ? buildVietQrUrl({
        amount: order.finalAmount,
        orderCode: order.orderCode,
      })
    : "";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <Link
        href={`/courses/${course.slug}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại thông tin khóa học
      </Link>

      {!order ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleCreateOrder}
            className="lg:col-span-7 glow-card rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Bước 1 / 2 • Đăng Ký &amp; Tạo Mã VietQR
              </span>
              <h1 className="font-display text-2xl font-extrabold text-white mt-1">
                Thông Tin Học Viên &amp; Cấp Chứng Chỉ
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Khóa học sẽ mở khóa trực tiếp cho tài khoản{" "}
                <strong className="text-cyan-300">{user?.email}</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Họ và tên học viên *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Số điện thoại (Zalo) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="090x xxx xxx"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email nhận chứng chỉ *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-1">
                {!showCouponBox && !appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => setShowCouponBox(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Bạn có mã ưu đãi? Bấm để nhập
                  </button>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Mã ưu đãi (nếu có)
                      </label>
                      {!appliedCoupon && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowCouponBox(false);
                            setCouponCode("");
                            setCouponError("");
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          Thu gọn
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã ưu đãi..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        disabled={validatingCoupon}
                        onClick={handleApplyCoupon}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 cursor-pointer disabled:opacity-50"
                      >
                        {validatingCoupon ? "Đang kiểm..." : "Áp dụng"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-400">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-[11px] text-emerald-300 font-semibold">
                          ✓ Đã áp dụng: {appliedCoupon.label}
                        </p>
                        <button
                          type="button"
                          onClick={handleClearCoupon}
                          className="text-[11px] text-slate-400 hover:text-rose-300 font-semibold shrink-0 cursor-pointer"
                        >
                          Gỡ mã
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3.5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              {creating ? "Đang tạo mã VietQR..." : "Tạo Mã Thanh Toán VietQR"}
            </button>
          </form>

          <div className="lg:col-span-5 glow-card rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Chi Tiết Đơn Hàng
            </h2>

            <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-24 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
              />
              <div>
                <div className="text-sm font-bold text-white line-clamp-2">
                  {course.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {course.totalDuration}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Học phí niêm yết</span>
                <span>{formatVND(course.price)}</span>
              </div>
              {discountAmount > 0 && appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Giảm giá ({appliedCoupon.code})
                  </span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white">Tổng thanh toán</span>
                <span className="font-display text-2xl font-extrabold text-cyan-300">
                  {formatVND(finalAmount)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cam kết kích hoạt tự động
              </div>
              <p>
                Hệ thống đối soát ACB 24/7 qua Webhook SePay. Ngay khi ngân hàng báo
                có, khóa học sẽ tự động mở mà không cần chờ nhân viên duyệt.
              </p>
            </div>
          </div>
        </div>
      ) : order.status === "paid" ? (
        <div className="glow-card rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto border-2 border-emerald-500/50 space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-4 h-4" /> Thanh Toán Thành Công • Mã Đơn {order.orderCode}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Khóa Học Đã Được Kích Hoạt Tự Động!
          </h1>
          <p className="text-sm text-slate-300">
            Cảm ơn <strong>{order.customerName}</strong>. Hệ thống đã ghi nhận giao dịch{" "}
            <strong className="text-cyan-300">{formatVND(order.finalAmount)}</strong>{" "}
            ({order.transactionRef || "VietQR Tự động"}). Bạn có thể vào học ngay bây giờ!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/learn/${course.slug}`}
              className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm inline-flex items-center gap-2 shadow-lg"
            >
              <PlayCircle className="w-5 h-5" /> Vào Lớp Học Ngay
            </Link>
            <Link
              href="/my-learning"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
            >
              Xem Góc Học Tập
            </Link>
          </div>
        </div>
      ) : (
        <div className="glow-card rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Bước 2 / 2 • Chờ Chuyển Khoản VietQR
              </span>
              <h1 className="font-display text-2xl font-extrabold text-white mt-1">
                Quét Mã VietQR Để Mở Khóa Tự Động
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang chờ nhận tiền (Kiểm tra mỗi 3s)...
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-6">
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="bg-white p-3.5 rounded-2xl border-2 border-cyan-400 shadow-2xl max-w-[270px] w-full">
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
              <span className="text-xs text-cyan-300 font-semibold mt-3">
                Mở App Ngân hàng bất kỳ &amp; quét mã QR trên
              </span>
            </div>

            <div className="md:col-span-7 space-y-3 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase">Đơn vị thụ hưởng</div>
                <div className="font-extrabold text-cyan-300 text-base mt-0.5">
                  {OHANA_BANK_CONFIG.accountName}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {OHANA_BANK_CONFIG.bankName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase">Số tài khoản</div>
                  <div className="font-mono text-xl font-black text-emerald-400">
                    {OHANA_BANK_CONFIG.accountNo}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(OHANA_BANK_CONFIG.accountNo, "stk")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === "stk" ? "Đã chép" : "Sao chép"}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase">Số tiền chuyển khoản</div>
                  <div className="font-display text-xl font-extrabold text-white">
                    {formatVND(order.finalAmount)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(String(order.finalAmount), "amount")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === "amount" ? "Đã chép" : "Sao chép"}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-amber-300 uppercase font-bold">
                    Nội dung chuyển khoản (Bắt buộc giữ nguyên)
                  </div>
                  <div className="font-mono text-lg font-black text-amber-300 mt-0.5">
                    {order.orderCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(order.orderCode, "code")}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === "code" ? "Đã chép" : "Sao chép"}
                </button>
              </div>

              {isLocalhost && (
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Môi trường chạy thử trên máy: Bấm nút bên phải để giả lập Webhook SePay báo tiền vừa về tài khoản.
                  </div>
                  <button
                    type="button"
                    disabled={simulatingWebhook}
                    onClick={handleSimulateWebhook}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    {simulatingWebhook
                      ? "Đang kích hoạt..."
                      : "Giả lập Webhook đã nhận tiền"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
