"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Crown,
  Edit3,
  ExternalLink,
  LogIn,
  PlayCircle,
  QrCode,
  Receipt,
  Save,
} from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { formatVND } from "@/lib/video";

export default function MyLearningPage() {
  const {
    db,
    user,
    mySubscription,
    hasActiveMembership,
    membershipRemainingDays,
    googleEnabled,
    isLoading,
    hasCourseAccess,
    getCourseProgress,
    updateUserProfile,
  } = useLMS();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const enrolledCourses = useMemo(
    () => (user ? db.courses.filter((c) => hasCourseAccess(c)) : []),
    [db.courses, hasCourseAccess, user]
  );

  const myCertificates = useMemo(
    () =>
      user
        ? db.certificates.filter(
            (cert) =>
              user.role === "admin" ||
              cert.studentEmail.toLowerCase() === user.email.toLowerCase()
          )
        : [],
    [db.certificates, user]
  );

  const myOrders = useMemo(
    () =>
      user
        ? db.orders.filter(
            (ord) => user.role === "admin" || ord.userId === user.id
          )
        : [],
    [db.orders, user]
  );

  if (!isLoading && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="glow-card rounded-3xl p-8 text-center space-y-5 border border-cyan-500/35">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-cyan-300" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            Đăng Nhập Vào Góc Học Tập Ohana
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Đăng nhập bằng Google hoặc tài khoản Email để xem toàn bộ khóa học đã mở, tiến độ hoàn thành và tải Chứng chỉ điện tử của bạn.
          </p>
          <div className="space-y-3 pt-1">
            {googleEnabled && (
              <a
                href="/api/auth/google?next=%2Fmy-learning"
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center"
              >
                Đăng nhập nhanh với Google
              </a>
            )}
            <Link
              href="/login?next=%2Fmy-learning"
              className="w-full py-3 rounded-xl btn-gradient text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Đăng Nhập / Đăng Ký Tài Khoản
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-slate-400">
        Đang tải hồ sơ học tập...
      </div>
    );
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      await updateUserProfile({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-10">
      {/* User Banner */}
      <div className="glow-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Hồ Sơ Học Viên Ohana Academy
          </span>
          {editingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-400 text-white font-bold text-lg focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Lưu
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Xin chào, {user.name}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setNameInput(user.name);
                  setEditingName(true);
                }}
                title="Đổi tên hiển thị trên chứng chỉ"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-slate-400">
            Email: {user.email} {user.department ? `• ${user.department}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 shrink-0">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="font-display text-2xl font-extrabold text-cyan-300">
              {enrolledCourses.length}
            </div>
            <div className="text-[11px] text-slate-400">Khóa đã mở</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="font-display text-2xl font-extrabold text-amber-300">
              {myCertificates.length}
            </div>
            <div className="text-[11px] text-slate-400">Chứng chỉ</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="font-display text-2xl font-extrabold text-emerald-400">
              {myOrders.filter((o) => o.status === "paid").length}
            </div>
            <div className="text-[11px] text-slate-400">Đơn đã duyệt</div>
          </div>
        </div>
      </div>

      {/* Membership Status Card */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          hasActiveMembership
            ? "bg-emerald-500/10 border-emerald-400/40"
            : mySubscription
            ? "bg-amber-500/10 border-amber-400/40"
            : "bg-slate-900/70 border-slate-800"
        }`}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-300">
            <Crown className="w-4 h-4" />
            Ohana AI Membership
          </div>
          {hasActiveMembership && mySubscription ? (
            <>
              <div className="text-base sm:text-lg font-display font-bold text-white">
                {mySubscription.planName} • Còn{" "}
                <span className="text-emerald-300">
                  {membershipRemainingDays} ngày
                </span>
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5 text-emerald-400" />
                Hiệu lực đến ngày{" "}
                <strong>
                  {new Date(mySubscription.expiresAt).toLocaleDateString("vi-VN")}
                </strong>
              </div>
            </>
          ) : mySubscription ? (
            <>
              <div className="text-base font-bold text-white">
                Gói Hội viên đã hết hạn ngày{" "}
                {new Date(mySubscription.expiresAt).toLocaleDateString("vi-VN")}
              </div>
              <div className="text-xs text-slate-300">
                Toàn bộ lịch sử tiến độ học cũ vẫn được bảo toàn. Gia hạn để mở khóa tiếp các bài mới cập nhật.
              </div>
            </>
          ) : (
            <>
              <div className="text-base font-bold text-white">
                Học không giới hạn Kho Bài Học AI Cập Nhật Hàng Tháng
              </div>
              <div className="text-xs text-slate-400">
                Chỉ từ 299.000đ/tháng — Thanh toán VietQR ACB tự động mở khóa sau 3 giây.
              </div>
            </>
          )}
        </div>
        <Link
          href="/membership"
          className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 ${
            hasActiveMembership
              ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
              : "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg"
          }`}
        >
          <Crown className="w-4 h-4" />
          {hasActiveMembership
            ? "Xem Bài Mới / Gia Hạn Thêm"
            : mySubscription
            ? "Gia Hạn Hội Viên Ngay"
            : "Đăng Ký Hội Viên VIP"}
        </Link>
      </div>

      {/* Section 1: Khóa học của tôi */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Khóa Học Đang Tham Gia ({enrolledCourses.length})
          </h2>
          <Link href="/" className="text-xs font-bold text-cyan-300 hover:underline">
            + Khám phá thêm khóa học
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="glow-card rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-300">
              Bạn chưa kích hoạt khóa học nào. Hãy chọn khóa miễn phí hoặc nhập mã nội bộ để bắt đầu.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white text-xs font-bold"
            >
              Xem Kho Khóa Học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((course) => {
              const prog = getCourseProgress(course);
              return (
                <div
                  key={course.id}
                  className="glow-card rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D121E] via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700 text-[10px] font-bold text-cyan-300">
                        {course.category}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-display font-bold text-base text-white line-clamp-2">
                        {course.title}
                      </h3>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">
                            {prog.completedCount}/{prog.totalCount} bài học
                          </span>
                          <span className="font-bold text-cyan-300">
                            {prog.percent}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                            style={{ width: `${prog.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Link
                      href={`/learn/${course.slug}`}
                      className="w-full py-2.5 rounded-xl btn-gradient text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {prog.percent > 0 ? "Tiếp Tục Học" : "Bắt Đầu Học"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Chứng chỉ đã đạt */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Chứng Chỉ Đã Cấp ({myCertificates.length})
        </h2>

        {myCertificates.length === 0 ? (
          <div className="glow-card rounded-2xl p-6 text-xs sm:text-sm text-slate-400">
            Hoàn thành 100% bài học trong một khóa để hệ thống tự động cấp Giấy Chứng Nhận có mã tra cứu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCertificates.map((cert) => (
              <div
                key={cert.code}
                className="glow-card rounded-2xl p-5 border border-amber-500/35 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {cert.code}
                  </div>
                  <div className="font-bold text-white text-sm sm:text-base">
                    {cert.courseTitle}
                  </div>
                  <div className="text-xs text-slate-400">
                    Học viên: <strong className="text-slate-200">{cert.studentName}</strong> • Ngày cấp:{" "}
                    {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <Link
                  href={`/certificates/${cert.code}`}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                >
                  Mở Bằng <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Lịch sử đơn hàng VietQR */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-400" />
          Lịch Sử Đăng Ký &amp; Thanh Toán VietQR
        </h2>

        {myOrders.length === 0 ? (
          <div className="glow-card rounded-2xl p-6 text-xs sm:text-sm text-slate-400">
            Chưa có giao dịch thanh toán khóa học nào.
          </div>
        ) : (
          <div className="glow-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase">
                  <tr>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Khóa học</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {myOrders.map((ord) => (
                    <tr key={ord.orderCode} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                        {ord.orderCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-white max-w-xs truncate">
                        {ord.courseTitle}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-200">
                        {formatVND(ord.finalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {ord.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                            <Clock className="w-3 h-3" /> Chờ chuyển khoản
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {ord.status === "paid" ? (
                          <Link
                            href={`/learn/${ord.courseSlug}`}
                            className="text-xs font-bold text-emerald-400 hover:underline"
                          >
                            Vào học →
                          </Link>
                        ) : (
                          <Link
                            href={`/checkout/${ord.courseSlug}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:underline"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Thanh toán
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
