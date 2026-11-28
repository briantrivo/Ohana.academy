"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Gift,
  Landmark,
  Link2,
  LogIn,
  Save,
  Share2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { VIETQR_BANKS } from "@/lib/affiliate";
import { formatVND } from "@/lib/video";
import { AffiliateCommission, AffiliatePayoutInfo } from "@/types/lms";

interface AffiliateResponse {
  eligible: boolean;
  referralCode: string | null;
  payout: AffiliatePayoutInfo | null;
  summary: {
    totalOrders: number;
    pendingAmount: number;
    paidAmount: number;
    totalEarned: number;
  };
  commissions: AffiliateCommission[];
}

export default function AffiliatePage() {
  const { db, user, googleEnabled, isLoading, refreshState } = useLMS();

  const [loadingAff, setLoadingAff] = useState(true);
  const [affData, setAffData] = useState<AffiliateResponse | null>(null);
  const [origin, setOrigin] = useState("https://ohanaai-academy.vercel.app");

  // Payout & custom ref code form
  const [refCodeInput, setRefCodeInput] = useState("");
  const [bankId, setBankId] = useState("ACB");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");
  const [zaloPhone, setZaloPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const loadAffiliate = useCallback(async () => {
    if (!user) {
      setLoadingAff(false);
      return;
    }
    setLoadingAff(true);
    try {
      const res = await fetch("/api/affiliate", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as AffiliateResponse;
        setAffData(data);
        setRefCodeInput(data.referralCode || "");
        if (data.payout) {
          setBankId(data.payout.bankId || "ACB");
          setAccountNo(data.payout.accountNo || "");
          setAccountName(data.payout.accountName || "");
          setZaloPhone(data.payout.zaloPhone || user.phone || "");
        } else {
          setZaloPhone(user.phone || "");
        }
      }
    } finally {
      setLoadingAff(false);
    }
  }, [user]);

  useEffect(() => {
    loadAffiliate();
  }, [loadAffiliate]);

  const commercialCourses = useMemo(
    () => db.courses.filter((c) => c.accessType === "commercial"),
    [db.courses]
  );

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode: refCodeInput,
          bankId,
          accountNo,
          accountName,
          zaloPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMsg({ ok: false, text: data.error || "Không thể lưu thông tin." });
        return;
      }
      setSaveMsg({
        ok: true,
        text: "Đã lưu mã giới thiệu & thông tin tài khoản nhận hoa hồng lên Supabase!",
      });
      await loadAffiliate();
      await refreshState();
    } finally {
      setSaving(false);
    }
  };

  if (!isLoading && !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 pb-24">
        <div className="glow-card rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-cyan-500/35">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mx-auto">
            <Share2 className="w-8 h-8 text-emerald-300" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" /> Quyền Lợi Affiliate Dành Cho Học Viên Ohana
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
              Chia Sẻ Tri Thức — Nhận Hoa Hồng 10% Đến 20%
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Đăng nhập để nhận link giới thiệu cá nhân. Nhận ngay{" "}
              <strong className="text-cyan-300">10%</strong> cho mỗi đơn Khóa học Thương mại và{" "}
              <strong className="text-amber-300">20% trọn đời</strong> cho mỗi lượt đăng ký &amp; gia
              hạn Gói Hội Viên Membership!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
              <div className="text-2xl font-display font-extrabold text-cyan-300">10%</div>
              <div className="text-xs font-bold text-white mt-0.5">Khóa Học Thương Mại</div>
              <div className="text-[11px] text-slate-400 mt-1">
                VD: Khóa 6.600.000đ → nhận 660.000đ/đơn thành công
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30">
              <div className="text-2xl font-display font-extrabold text-amber-300">20%</div>
              <div className="text-xs font-bold text-white mt-0.5">Hội Viên Membership</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tính cả lần đầu &amp; mọi kỳ gia hạn tiếp theo (trọn đời)
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-sm mx-auto pt-2">
            {googleEnabled && (
              <a
                href="/api/auth/google?next=%2Faffiliate"
                className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center shadow-lg"
              >
                Đăng nhập nhanh với Google
              </a>
            )}
            <Link
              href="/login?next=%2Faffiliate"
              className="w-full py-3.5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Đăng Nhập / Đăng Ký Tài Khoản
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadingAff || !user || !affData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-sm text-slate-400">
        Đang tải cổng Affiliate của bạn...
      </div>
    );
  }

  if (!affData.eligible) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 pb-24">
        <div className="glow-card rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-amber-500/35">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mx-auto">
            <BadgePercent className="w-8 h-8 text-amber-300" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold">
              Quyền Lợi Dành Riêng Cho Học Viên Đã Mua Khóa / Hội Viên VIP
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Mở Khóa Quyền Lợi Affiliate Nhận Hoa Hồng 10% – 20%
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Chức năng <strong>Affiliate (Giới thiệu nhận hoa hồng)</strong> sẽ tự động mở ngay sau
              khi tài khoản <strong>{user.email}</strong> sở hữu ít nhất 1 Khóa học Thương mại hoặc
              đăng ký Gói Hội Viên Membership (chỉ từ 299.000đ/tháng).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
              <div className="text-2xl font-display font-extrabold text-cyan-300">10%</div>
              <div className="text-xs font-bold text-white mt-0.5">Khóa Học Thương Mại</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Giới thiệu 1 học viên khóa 6.6tr nhận ngay 660.000đ
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30">
              <div className="text-2xl font-display font-extrabold text-amber-300">20%</div>
              <div className="text-xs font-bold text-white mt-0.5">Hội Viên Membership</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Nhận 20% thu nhập định kỳ trên mọi kỳ gia hạn của khách
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/membership"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-sm inline-flex items-center gap-2 shadow-lg"
            >
              <Crown className="w-4 h-4" /> Đăng Ký Hội Viên (Từ 299k/tháng)
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl btn-gradient text-white font-bold text-sm inline-flex items-center gap-2"
            >
              Xem Khóa Học Thương Mại <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const refCode = affData.referralCode || "";
  const shareLinks = [
    {
      key: "home",
      title: "Link Trang Chủ Ohana Academy",
      badge: "10% Khóa lẻ • 20% VIP",
      url: `${origin}/?ref=${encodeURIComponent(refCode)}`,
    },
    {
      key: "membership",
      title: "Link Đăng Ký Hội Viên VIP Membership",
      badge: "Hoa hồng 20% trọn đời gia hạn",
      url: `${origin}/membership?ref=${encodeURIComponent(refCode)}`,
    },
    ...commercialCourses.map((c) => ({
      key: c.id,
      title: `Link Khóa: ${c.title}`,
      badge: `Hoa hồng 10% (~${formatVND(Math.round(c.price * 0.1))}/đơn)`,
      url: `${origin}/courses/${c.slug}?ref=${encodeURIComponent(refCode)}`,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-8">
      {/* Header */}
      <div className="glow-card rounded-3xl p-6 sm:p-8 border border-emerald-500/35 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            ĐỐI TÁC AFFILIATE OHANA ACADEMY • ĐÃ KÍCH HOẠT
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Xin chào, {user.name} — Mã Giới Thiệu:{" "}
            <span className="text-cyan-300 font-mono">{refCode}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Chia sẻ link giới thiệu bên dưới: khách bấm link được lưu cookie <strong>30 ngày</strong>{" "}
            và gắn trọn đời khi đăng ký/mua hàng. Nhận{" "}
            <strong className="text-cyan-300">10% Khóa Thương Mại</strong> và{" "}
            <strong className="text-amber-300">20% Gói Hội Viên Membership</strong> (bao gồm cả các
            kỳ gia hạn sau).
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleCopy(`${origin}/?ref=${encodeURIComponent(refCode)}`, "hero")}
          className="px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm inline-flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer"
        >
          {copiedKey === "hero" ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Đã Sao Chép Link!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Link Giới Thiệu Chính
            </>
          )}
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card rounded-2xl p-5">
          <div className="text-xs text-slate-400">Tổng hoa hồng phát sinh</div>
          <div className="font-display text-2xl font-extrabold text-white mt-1">
            {formatVND(affData.summary.totalEarned)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Từ {affData.summary.totalOrders} đơn giới thiệu thành công
          </div>
        </div>
        <div className="glow-card rounded-2xl p-5 border border-amber-500/30">
          <div className="text-xs text-amber-300">Chờ Admin chuyển khoản</div>
          <div className="font-display text-2xl font-extrabold text-amber-300 mt-1">
            {formatVND(affData.summary.pendingAmount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Admin đối soát &amp; chuyển về STK bên dưới
          </div>
        </div>
        <div className="glow-card rounded-2xl p-5 border border-emerald-500/30">
          <div className="text-xs text-emerald-300">Đã nhận về tài khoản</div>
          <div className="font-display text-2xl font-extrabold text-emerald-400 mt-1">
            {formatVND(affData.summary.paidAmount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đã hoàn tất chi trả</div>
        </div>
        <div className="glow-card rounded-2xl p-5">
          <div className="text-xs text-slate-400">Mức hoa hồng của bạn</div>
          <div className="font-display text-xl font-extrabold text-cyan-300 mt-1">
            10% • 20%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            10% Khóa lẻ / 20% Membership
          </div>
        </div>
      </div>

      {/* Main Grid: Share Links + Payout Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Share Links */}
        <div className="lg:col-span-7 glow-card rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Bộ Link Chia Sẻ Giới Thiệu Của Bạn
          </h2>
          <div className="space-y-3">
            {shareLinks.map((item) => (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs sm:text-sm font-bold text-white">
                    {item.title}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                    {item.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={item.url}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url, item.key)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey === item.key ? "Đã chép" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bank Payout Settings */}
        <form
          onSubmit={handleSaveSettings}
          className="lg:col-span-5 glow-card rounded-3xl p-6 space-y-4 border border-cyan-500/30"
        >
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-400" />
            Tài Khoản Ngân Hàng Nhận Hoa Hồng
          </h2>
          <p className="text-xs text-slate-400">
            Nhập chính xác thông tin ngân hàng &amp; SĐT Zalo để Ban Quản Trị Ohana liên hệ và
            chuyển khoản hoa hồng cho bạn ngay khi phát sinh đơn thành công.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mã giới thiệu cá nhân (4–20 ký tự không dấu)
            </label>
            <input
              type="text"
              required
              value={refCodeInput}
              onChange={(e) => setRefCodeInput(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ngân hàng nhận tiền *
            </label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              {VIETQR_BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số tài khoản *
              </label>
              <input
                type="text"
                required
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="VD: 123456789"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số điện thoại Zalo *
              </label>
              <input
                type="tel"
                required
                value={zaloPhone}
                onChange={(e) => setZaloPhone(e.target.value)}
                placeholder="090x xxx xxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tên chủ tài khoản (IN HOA KHÔNG DẤU) *
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              placeholder="VD: NGUYEN VAN A"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
            />
          </div>

          {saveMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                saveMsg.ok
                  ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-300"
                  : "bg-rose-500/15 border border-rose-500/35 text-rose-300"
              }`}
            >
              {saveMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl btn-gradient text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu Thông Tin Nhận Hoa Hồng"}
          </button>
        </form>
      </div>

      {/* Commission History Table */}
      <div className="glow-card rounded-3xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Lịch Sử Hoa Hồng Giới Thiệu ({affData.commissions.length})
          </h2>
        </div>

        {affData.commissions.length === 0 ? (
          <div className="p-10 text-center text-xs sm:text-sm text-slate-400">
            Chưa có đơn hàng giới thiệu nào thành công. Hãy copy link ở trên gửi cho bạn bè, đồng
            nghiệp hoặc đăng lên Facebook/Zalo để bắt đầu nhận hoa hồng 10% – 20%!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Mã Đơn</th>
                  <th className="px-4 py-3">Khách Hàng</th>
                  <th className="px-4 py-3">Khóa Học / Gói</th>
                  <th className="px-4 py-3">Giá Trị Đơn</th>
                  <th className="px-4 py-3">Hoa Hồng</th>
                  <th className="px-4 py-3">Trạng Thái Chi Trả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {affData.commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                      {c.orderCode}
                      <div className="text-[10px] text-slate-500 font-sans">
                        {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{c.buyerName}</div>
                      <div className="text-[11px] text-slate-500">{c.buyerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200 max-w-xs">
                      <div className="truncate">{c.itemTitle}</div>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.orderType === "membership"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-cyan-500/15 text-cyan-300"
                        }`}
                      >
                        {c.orderType === "membership"
                          ? "Membership (20%)"
                          : "Khóa Thương Mại (10%)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatVND(c.orderAmount)}
                    </td>
                    <td className="px-4 py-3 font-display font-extrabold text-sm text-emerald-400">
                      +{formatVND(c.commissionAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === "paid" ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Đã nhận tiền
                          </span>
                          {c.paidAt && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(c.paidAt).toLocaleDateString("vi-VN")}
                              {c.payoutNote ? ` • ${c.payoutNote}` : ""}
                            </div>
                          )}
                        </div>
                      ) : c.status === "cancelled" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[11px] font-bold">
                          Đã hủy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                          <Clock className="w-3 h-3" /> Chờ Admin chuyển khoản
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
