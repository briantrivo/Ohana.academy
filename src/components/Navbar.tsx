"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Crown,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Share2,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { UserRole } from "@/types/lms";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasActiveMembership, membershipRemainingDays, logout, redeemActivationCode } = useLMS();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [redeemMsg, setRedeemMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setSubmitting(true);
    setRedeemMsg(null);
    const res = await redeemActivationCode(codeInput);
    setRedeemMsg({ ok: res.ok, text: res.message });
    setSubmitting(false);
    if (res.ok) setCodeInput("");
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push("/");
  };

  const roleLabels: Record<UserRole, { badge: string; color: string }> = {
    student: {
      badge: "Học viên",
      color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    },
    internal: {
      badge: "Nhân sự Nội bộ",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    admin: {
      badge: "Quản trị viên (Admin)",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-xl border-b border-slate-800/80 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/ohana/astronixa_logo.jpg"
              alt="Ohana Academy Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white/5 border border-purple-500/40 p-1 shadow-lg shadow-purple-500/20 group-hover:border-cyan-400/60 transition-colors"
            />
            <div>
              <span className="font-display font-bold text-lg tracking-wider text-white block leading-none">
                OHANA <span className="text-cyan-400">ACADEMY</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">
                Astronixa E-Learning
              </span>
            </div>
          </Link>

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                pathname === "/"
                  ? "bg-white/10 text-cyan-300 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Kho Khóa Học
            </Link>

            <Link
              href="/membership"
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/membership")
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/35 font-semibold"
                  : "text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10"
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              Hội Viên VIP
              {hasActiveMembership && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {membershipRemainingDays}d
                </span>
              )}
            </Link>

            {user && (
              <Link
                href="/my-learning"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/my-learning")
                    ? "bg-white/10 text-cyan-300 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Award className="w-4 h-4" />
                Góc Học Tập &amp; Chứng Chỉ
              </Link>
            )}

            {user && (
              <Link
                href="/affiliate"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/affiliate")
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/35 font-semibold"
                    : "text-emerald-300/90 hover:text-emerald-200 hover:bg-emerald-500/10"
                }`}
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                Affiliate
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  router.push("/login?next=/");
                  return;
                }
                setRedeemMsg(null);
                setRedeemOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              Nhập Mã Kích Hoạt
            </button>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/admin")
                    ? "bg-purple-500/20 text-purple-200 border border-purple-500/30 font-semibold"
                    : "text-slate-300 hover:text-purple-300 hover:bg-purple-500/10"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                Quản Trị Studio
              </Link>
            )}
          </nav>

          {/* Right: Real Auth Status / Account Menu */}
          <div className="relative">
            {!user ? (
              <Link
                href={`/login?next=${encodeURIComponent(pathname || "/")}`}
                className="px-4 py-2 rounded-xl btn-gradient text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                Đăng Nhập / Đăng Ký
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-cyan-400/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white leading-tight max-w-[160px] truncate">
                      {user.name}
                    </div>
                    <span
                      className={`inline-block text-[10px] px-1.5 py-0.5 rounded border mt-0.5 font-semibold ${
                        roleLabels[user.role].color
                      }`}
                    >
                      {roleLabels[user.role].badge}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0D121F] border border-slate-700 shadow-2xl p-3 z-50 space-y-2">
                    <div className="px-2 pb-2 border-b border-slate-800">
                      <div className="text-xs font-bold text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {user.email}
                      </div>
                      {user.authProvider === "google" && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200">
                          Đã liên kết Google
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs">
                      <Link
                        href="/my-learning"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                      >
                        <Award className="w-4 h-4 text-cyan-400" />
                        Góc Học Tập &amp; Chứng Chỉ
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setRedeemMsg(null);
                          setRedeemOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 flex items-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        Nhập Mã Kích Hoạt / Nội Bộ
                      </button>

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-3 py-2 rounded-xl hover:bg-purple-500/20 text-purple-200 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-400" />
                          Quản Trị Studio
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/15 text-rose-300 flex items-center gap-2 cursor-pointer border-t border-slate-800 mt-1 pt-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal Nhập Mã Kích Hoạt Nội Bộ / Học Bổng */}
      {redeemOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0D1322] border border-cyan-500/40 p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setRedeemOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Kích Hoạt Khóa Học Nội Bộ &amp; Học Bổng
            </div>
            <h3 className="text-xl font-extrabold text-white font-display">
              Nhập Mã Kích Hoạt Ohana
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Nhập mã nhân sự nội bộ để tự động mở toàn bộ khóa học nội bộ hoặc mã học bổng tại Workshop.
            </p>

            <form onSubmit={handleRedeem} className="mt-4 space-y-3">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã kích hoạt được cấp..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-cyan-400"
              />

              {redeemMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    redeemMsg.ok
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                      : "bg-rose-500/15 border border-rose-500/40 text-rose-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{redeemMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 transition-all shadow-lg cursor-pointer"
              >
                {submitting ? "Đang kiểm tra mã..." : "Kích Hoạt Ngay"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
