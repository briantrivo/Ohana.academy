"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightCircle,
  Award,
  BookOpen,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Gift,
  KeyRound,
  Lock,
  LogIn,
  PlayCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useLMS } from "@/context/LMSContext";
import { formatVND } from "@/lib/video";
import { Lesson } from "@/types/lms";

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const {
    db,
    user,
    hasCourseAccess,
    enrollFreeCourse,
    redeemActivationCode,
  } = useLMS();

  const course = db.courses.find((c) => c.slug === params.slug);

  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [activationCode, setActivationCode] = useState("");
  const [redeemFeedback, setRedeemFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Không tìm thấy khóa học</h1>
        <p className="text-sm text-slate-400 mt-2">
          Đường dẫn khóa học có thể đã thay đổi hoặc vừa được gỡ khỏi hệ thống.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Kho Khóa Học
        </Link>
      </div>
    );
  }

  const unlocked = hasCourseAccess(course);
  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  );

  const toggleChapter = (id: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleEnrollFree = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);
      return;
    }
    setEnrolling(true);
    const ok = await enrollFreeCourse(course.id);
    setEnrolling(false);
    if (ok) {
      router.push(`/learn/${course.slug}`);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);
      return;
    }
    if (!activationCode.trim()) return;
    const res = await redeemActivationCode(activationCode);
    setRedeemFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setActivationCode("");
    }
  };

  return (
    <div className="pb-20">
      <section className="border-b border-slate-800/80 bg-slate-950/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Kho Khóa Học Ohana
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    {course.category}
                  </span>
                  {course.badge && (
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-bold">
                      {course.badge}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {course.rating.toFixed(1)} ({course.studentsCount.toLocaleString("vi-VN")} học viên)
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {course.title}
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {course.subtitle}
                </p>

                {course.scheduleInfo && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-300 font-semibold">
                    ⚡ {course.scheduleInfo}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-9 h-9 rounded-full object-contain bg-white/5 border border-purple-500/40 p-0.5"
                    />
                    <div>
                      <div className="font-bold text-white">{course.instructor.name}</div>
                      <div className="text-[11px] text-slate-400">{course.instructor.role}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    {course.chapters.length} chương • {totalLessons} bài học
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    {course.totalDuration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    Trình độ: {course.level}
                  </span>
                </div>
              </div>

              {course.introVideoUrl && (
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Video Giới Thiệu Chương Trình Đào Tạo
                  </div>
                  <VideoPlayer
                    videoUrl={course.introVideoUrl}
                    title={`Giới thiệu ${course.title}`}
                  />
                </div>
              )}

              {course.targetAudience && course.targetAudience.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-bold text-white">
                    Lộ Trình Được Thiết Kế Cho Ai?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {course.targetAudience.map((aud, i) => (
                      <div
                        key={i}
                        className="glow-card rounded-2xl p-5 border-t-2 border-t-cyan-400 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <h3 className="font-bold text-white text-sm sm:text-base">
                            {aud.title}
                          </h3>
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {aud.description}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-800 text-[11px] font-semibold text-cyan-300 flex items-start gap-1.5">
                          <ArrowRightCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{aud.outcome}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glow-card rounded-2xl p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Giá Trị Khác Biệt Khi Tham Gia Khóa Học
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold text-white">
                    Đề Cương Chi Tiết ({totalLessons} buổi học &amp; workshop)
                  </h2>
                  <span className="text-xs text-cyan-300">
                    Bấm bài có nhãn &ldquo;Học thử&rdquo; để xem ngay
                  </span>
                </div>

                <div className="space-y-4">
                  {course.chapters.map((chapter, chIdx) => {
                    const isOpen = openChapters[chapter.id] !== false;
                    return (
                      <div
                        key={chapter.id}
                        className="glow-card rounded-2xl overflow-hidden border border-slate-800"
                      >
                        <button
                          type="button"
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 bg-slate-900/70 hover:bg-slate-900 transition-colors text-left cursor-pointer"
                        >
                          <div>
                            <div className="text-sm sm:text-base font-bold text-white">
                              {chapter.title}
                            </div>
                            {chapter.subtitle && (
                              <div className="text-xs text-cyan-300/90 mt-0.5">
                                {chapter.subtitle}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400">
                              {chapter.lessons.length} buổi
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-slate-800/80">
                            {chapter.bannerUrl && (
                              <div className="p-3 bg-slate-950/60">
                                <img
                                  src={chapter.bannerUrl}
                                  alt={chapter.title}
                                  className="w-full max-h-64 object-cover rounded-xl border border-slate-800"
                                />
                              </div>
                            )}
                            {chapter.lessons.map((lesson, lIdx) => {
                              const canPlay = unlocked || lesson.isFreePreview;
                              return (
                                <div
                                  key={lesson.id}
                                  className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                                >
                                  <div className="flex items-start gap-3 min-w-0">
                                    {canPlay ? (
                                      <PlayCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                                    )}
                                    <div className="min-w-0">
                                      <div className="text-xs sm:text-sm font-semibold text-slate-100">
                                        {chIdx + 1}.{lIdx + 1} {lesson.title}
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        {lesson.summary}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2.5 shrink-0">
                                    {lesson.resources && lesson.resources.length > 0 && (
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                        Có tài liệu
                                      </span>
                                    )}
                                    {lesson.quiz && lesson.quiz.length > 0 && (
                                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                                        Sát hạch
                                      </span>
                                    )}
                                    {lesson.isFreePreview && !unlocked && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewLesson(lesson)}
                                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold cursor-pointer"
                                      >
                                        Học thử
                                      </button>
                                    )}
                                    <span className="text-xs text-slate-400 font-mono">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {course.gallery && course.gallery.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <Camera className="w-5 h-5 text-cyan-400" />
                      Hình Ảnh Workshop Thực Chiến &amp; Cộng Đồng Ohana
                    </h2>
                    <span className="text-xs text-slate-400">Bấm ảnh để phóng to</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {course.gallery.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setLightboxImage({ src: photo.src, title: photo.title })
                        }
                        className="glow-card rounded-2xl overflow-hidden text-left group cursor-pointer"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={photo.src}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent" />
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-purple-600/90 text-white text-[10px] font-bold">
                            {photo.tag}
                          </span>
                          <div className="absolute bottom-2.5 left-3 right-3">
                            <div className="text-xs font-bold text-white">
                              {photo.title}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {course.certificateImage && (
                <div className="glow-card rounded-3xl p-6 border border-cyan-500/35 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" /> Bảo Chứng Năng Lực Quốc Gia
                    </span>
                    <h3 className="font-display text-xl font-extrabold text-white">
                      Bằng Chứng Nhận Từ {course.certificateIssuer}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Sau khi hoàn thành 8 buổi học và vượt qua 4 kỳ Workshop thực hành cùng bài kiểm tra cuối khóa, học viên được cấp Giấy chứng nhận có mã số định danh lưu trữ trên hệ thống.
                    </p>
                  </div>
                  <div className="md:col-span-5">
                    <img
                      src={course.certificateImage}
                      alt="Chứng chỉ Viện KHCN"
                      className="w-full rounded-xl border-2 border-cyan-400/50 shadow-xl"
                    />
                  </div>
                </div>
              )}

              {course.faqs && course.faqs.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-bold text-white">
                    Câu Hỏi Thường Gặp (FAQ)
                  </h2>
                  <div className="space-y-3">
                    {course.faqs.map((faq, idx) => (
                      <details
                        key={idx}
                        className="glow-card rounded-2xl p-4 sm:p-5 cursor-pointer group"
                      >
                        <summary className="font-bold text-sm sm:text-base text-white flex items-center justify-between gap-3 list-none">
                          <span>{faq.question}</span>
                          <ChevronDown className="w-4 h-4 text-cyan-400 shrink-0 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed space-y-2">
                          <p>{faq.answer}</p>
                          {faq.linkUrl && (
                            <a
                              href={faq.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:underline"
                            >
                              {faq.linkLabel || "Xem bài viết tham khảo"}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Action Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="glow-card rounded-3xl overflow-hidden border border-cyan-500/35">
                <div className="relative aspect-video">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D121E] via-transparent to-transparent" />
                </div>

                <div className="p-6 space-y-5">
                  {course.accessType === "internal" ? (
                    <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30">
                      <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> Chương Trình Đào Tạo Nội Bộ
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Dành riêng cho Nhân sự, Leader &amp; Đối tác thuộc hệ sinh thái Ohana.
                      </div>
                    </div>
                  ) : course.price === 0 ? (
                    <div>
                      <div className="text-3xl font-extrabold text-emerald-400 font-display">
                        Miễn phí 0đ
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Khóa học Cộng đồng Ohana — Mở khóa ngay lập tức
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-3xl font-extrabold text-cyan-300 font-display">
                          {formatVND(course.price)}
                        </span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-base text-rose-400 line-through font-semibold">
                            {formatVND(course.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold mt-1">
                        ✓ Thanh toán VietQR tự động kích hoạt sau 3 giây
                      </div>
                    </div>
                  )}

                  {unlocked ? (
                    <Link
                      href={`/learn/${course.slug}`}
                      className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Vào Lớp Học Ngay
                    </Link>
                  ) : course.accessType === "free" ? (
                    <button
                      type="button"
                      disabled={enrolling}
                      onClick={handleEnrollFree}
                      className="w-full py-3.5 px-5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {user ? (
                        <>
                          <PlayCircle className="w-5 h-5" />
                          {enrolling ? "Đang mở lớp học..." : "Đăng Ký Học Miễn Phí Ngay"}
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          Đăng Nhập Để Học Miễn Phí
                        </>
                      )}
                    </button>
                  ) : course.accessType === "internal" ? (
                    <div className="space-y-3">
                      <Link
                        href={
                          user
                            ? `/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`
                            : `/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`
                        }
                        className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {user
                          ? "Nhập Mã Nhân Sự Nội Bộ Bên Dưới"
                          : "Đăng Nhập Tài Khoản Nội Bộ Ohana"}
                      </Link>
                      <div className="text-center text-[11px] text-slate-400">
                        Hoặc đăng ký tài khoản mới kèm mã nhân sự nội bộ
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/checkout/${course.slug}`}
                      className="w-full py-3.5 px-5 rounded-xl btn-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      Đăng Ký &amp; Thanh Toán VietQR
                    </Link>
                  )}

                  {course.gifts && course.gifts.length > 0 && (
                    <div className="pt-4 border-t border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Gift className="w-4 h-4" /> Quyền lợi &amp; Quà tặng đi kèm:
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        {course.gifts.map((g, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-cyan-400">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!unlocked && course.accessType !== "free" && (
                    <form
                      onSubmit={handleRedeem}
                      className="pt-4 border-t border-slate-800 space-y-2"
                    >
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        Có mã kích hoạt / Học bổng?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={activationCode}
                          onChange={(e) =>
                            setActivationCode(e.target.value.toUpperCase())
                          }
                          placeholder={
                            course.accessType === "internal"
                              ? "Nhập mã nhân sự nội bộ"
                              : "Nhập mã học bổng"
                          }
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer"
                        >
                          {user ? "Mở khóa" : "Đăng nhập"}
                        </button>
                      </div>
                      {redeemFeedback && (
                        <p
                          className={`text-[11px] font-semibold ${
                            redeemFeedback.ok ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {redeemFeedback.text}
                        </p>
                      )}
                    </form>
                  )}

                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Cấp bởi: {course.certificateIssuer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Truy cập trọn đời trên máy tính &amp; điện thoại</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Preview Video Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-[#0B101D] border border-cyan-500/40 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Bài Giảng Học Thử Miễn Phí
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {previewLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <VideoPlayer
              videoUrl={previewLesson.videoUrl}
              title={previewLesson.title}
            />

            <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed">
              {previewLesson.summary}
            </p>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Workshop Gallery */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-white border border-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl text-center">
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="max-h-[80vh] rounded-2xl border border-cyan-400/40 shadow-2xl mx-auto"
            />
            <p className="text-sm text-white font-semibold mt-3">
              {lightboxImage.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
