"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { useLMS } from "@/context/LMSContext";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
      />
      <path
        fill="#34A853"
        d="M3.6 7.5l3.2 2.3C7.7 7.6 9.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 8.3 2.5 5.2 4.6 3.6 7.5z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.5c2.5 0 4.6-.8 6.1-2.3l-2.9-2.4c-.8.6-1.9 1-3.2 1-3.9 0-5.2-2.6-5.4-3.9l-3.2 2.5c1.5 3.1 4.7 5.1 8.6 5.1z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.2-1 2.2-2.1 2.9l2.9 2.4c1.7-1.6 2.9-4 2.9-7.6z"
      />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    "Tính năng Đăng nhập Google chưa được gắn GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET trên server.",
  google_cancelled: "Bạn đã hủy đăng nhập bằng Google.",
  google_state_invalid: "Phiên xác thực Google đã hết hạn, vui lòng thử lại.",
  google_token_exchange_failed: "Không thể kết nối tới Google OAuth, vui lòng thử lại.",
  google_email_unverified: "Tài khoản Google chưa xác minh Email.",
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, googleEnabled, login, register } = useLMS();

  const nextUrl = searchParams.get("next") || "/my-learning";
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const urlError = searchParams.get("error");
  const googleSetupHint = searchParams.get("google_setup") === "1";

  const [mode, setMode] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [internalCode, setInternalCode] = useState("");
  const [errorMsg, setErrorMsg] = useState(
    urlError ? ERROR_MESSAGES[urlError] || "Đăng nhập không thành công." : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [showGoogleGuide, setShowGoogleGuide] = useState(googleSetupHint);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      setIsLocalhost(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.replace(nextUrl.startsWith("/") ? nextUrl : "/my-learning");
    }
  }, [user, nextUrl, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || "Đăng nhập thất bại.");
      return;
    }
    router.push(nextUrl.startsWith("/") ? nextUrl : "/my-learning");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const res = await register({
      name,
      email,
      phone,
      password,
      internalCode: internalCode.trim() || undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || "Đăng ký thất bại.");
      return;
    }
    router.push(nextUrl.startsWith("/") ? nextUrl : "/my-learning");
  };

  const handleGoogleClick = () => {
    if (!googleEnabled) {
      setShowGoogleGuide(true);
      return;
    }
    window.location.href = `/api/auth/google?next=${encodeURIComponent(nextUrl)}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Kho Khóa Học
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Auth Card */}
        <div className="lg:col-span-7 glow-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Cổng Thành Viên Ohana Academy
              </span>
              <h1 className="font-display text-2xl font-extrabold text-white mt-0.5">
                {mode === "login"
                  ? "Đăng Nhập Tài Khoản"
                  : "Đăng Ký Học Viên / Nhân Sự"}
              </h1>
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  mode === "login"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg("");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  mode === "register"
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Đăng ký
              </button>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer"
          >
            <GoogleIcon />
            {mode === "login"
              ? "Đăng nhập nhanh bằng tài khoản Google"
              : "Đăng ký nhanh bằng tài khoản Google"}
            {!googleEnabled && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                Cần gắn Client ID
              </span>
            )}
          </button>

          {showGoogleGuide && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 text-xs text-amber-200 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Hướng dẫn bật nút Google Login thật (30 giây)
              </div>
              <p className="text-slate-300 leading-relaxed">
                Để nút Google xác thực trực tiếp tài khoản Gmail thật trên{" "}
                <strong>localhost</strong> và <strong>Vercel</strong>, anh tạo{" "}
                <em>OAuth 2.0 Client ID</em> tại Google Cloud Console rồi thêm vào file{" "}
                <code>.env.local</code> (hoặc Environment Variables trên Vercel):
              </p>
              <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto">
{`GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
# Redirect URI khai báo trên Google Cloud:
# http://localhost:3005/api/auth/google/callback`}
              </pre>
            </div>
          )}

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-800" />
            <span className="shrink-0 mx-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Hoặc dùng Email &amp; Mật khẩu
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email tài khoản
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {submitting ? "Đang xác thực..." : "Đăng Nhập Vào Hệ Thống"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Họ và tên (in trên Chứng chỉ) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ten@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Số điện thoại Zalo
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="090x xxx xxx"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mật khẩu (tối thiểu 6 ký tự) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <label className="block text-xs font-bold text-purple-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Mã Nhân Sự Nội Bộ / Học Bổng (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={internalCode}
                  onChange={(e) => setInternalCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã nếu bạn là Nhân sự Nội bộ hoặc có Học bổng"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? "Đang tạo tài khoản..." : "Hoàn Tất Đăng Ký"}
              </button>
            </form>
          )}
        </div>

        {/* Right: Role Info & Localhost Test Accounts Helper */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glow-card rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Phân Quyền 3 Nhóm Tài Khoản
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 1. Học viên Thương mại &amp; Cộng đồng
                </div>
                <p className="text-slate-400 mt-1">
                  Đăng ký qua Google hoặc Email, học khóa miễn phí, mua khóa trả phí bằng VietQR và nhận chứng chỉ mang tên mình.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 2. Nhân sự &amp; Đối tác Nội bộ Ohana
                </div>
                <p className="text-slate-400 mt-1">
                  Đăng nhập tài khoản nội bộ hoặc nhập mã <code>OHANA-NOIBO-2026</code> khi đăng ký để mở toàn bộ giáo trình nội bộ.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> 3. Quản trị viên (Admin — Brian Võ)
                </div>
                <p className="text-slate-400 mt-1">
                  Toàn quyền tạo khóa học mới, đính kèm tài liệu PDF/Word dưới bài giảng, quản lý tài khoản và duyệt đơn VietQR.
                </p>
              </div>
            </div>
          </div>

          {isLocalhost && (
            <div className="glow-card rounded-3xl p-5 border border-amber-500/35 space-y-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Tài khoản mẫu test trên Localhost (Ẩn khi lên domain thật)
              </div>
              <div className="space-y-2 text-xs">
                {[
                  {
                    label: "Admin (Brian Võ)",
                    email: "brian@astronixa.com",
                    pass: "OhanaAdmin@2026",
                    badge: "bg-emerald-500/20 text-emerald-300",
                  },
                  {
                    label: "Nhân sự Nội bộ (Lê Thanh Thảo)",
                    email: "thao.le@ohana.vn",
                    pass: "OhanaNoibo@2026",
                    badge: "bg-purple-500/20 text-purple-300",
                  },
                  {
                    label: "Học viên (Trần Gia Huy)",
                    email: "giahuy.learner@gmail.com",
                    pass: "Hocvien@2026",
                    badge: "bg-cyan-500/20 text-cyan-300",
                  },
                ].map((acc) => (
                  <div
                    key={acc.email}
                    className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold ${acc.badge}`}
                      >
                        {acc.label}
                      </span>
                      <div className="font-mono text-[11px] text-slate-300 mt-1 truncate">
                        {acc.email} / {acc.pass}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setEmail(acc.email);
                        setPassword(acc.pass);
                        setErrorMsg("");
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Điền nhanh
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-slate-400">
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
