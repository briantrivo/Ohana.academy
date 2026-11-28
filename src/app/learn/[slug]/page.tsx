"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Crown,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Link2,
  Lock,
  MessageCircle,
  Paperclip,
  PlayCircle,
  QrCode,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useLMS } from "@/context/LMSContext";
import { isCourseInMembership } from "@/lib/membership";
import { Lesson } from "@/types/lms";

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LearnCoursePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const {
    db,
    user,
    mySubscription,
    hasActiveMembership,
    memberZaloGroupUrl,
    setDbState,
    hasCourseAccess,
    getCourseProgress,
    toggleLessonComplete,
    saveQuizScore,
    issueCertificate,
  } = useLMS();

  const course = db.courses.find((c) => c.slug === params.slug);

  const allLessons: Lesson[] = useMemo(
    () => (course ? course.chapters.flatMap((ch) => ch.lessons) : []),
    [course]
  );

  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [issuingCert, setIssuingCert] = useState<boolean>(false);

  // Admin Attachment State
  const [attachMode, setAttachMode] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Không tìm thấy khóa học</h1>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>
      </div>
    );
  }

  const unlocked = hasCourseAccess(course);
  const progress = getCourseProgress(course);

  const activeLesson =
    allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];
  const activeIdx = allLessons.findIndex((l) => l.id === activeLesson?.id);

  const canWatchCurrent = unlocked || Boolean(activeLesson?.isFreePreview);
  const isCompleted = activeLesson
    ? progress.completedIds.includes(activeLesson.id)
    : false;

  const existingCert = user
    ? db.certificates.find(
        (c) =>
          c.courseId === course.id &&
          c.studentEmail.toLowerCase() === user.email.toLowerCase()
      )
    : undefined;

  const selectLesson = (lessonId: string, scrollToResources = false) => {
    setSelectedLessonId(lessonId);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setUploadMsg(null);
    if (scrollToResources) {
      setTimeout(() => {
        document
          .getElementById("lesson-resources")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeLesson?.quiz || activeLesson.quiz.length === 0) return;
    let correct = 0;
    activeLesson.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) correct += 1;
    });
    const scorePercent = Math.round((correct / activeLesson.quiz.length) * 100);
    setQuizSubmitted(true);
    await saveQuizScore(course.id, activeLesson.id, scorePercent);
  };

  const handleClaimCertificate = async () => {
    setIssuingCert(true);
    const quizScoresForUser = user ? db.quizScores[user.id] || {} : {};
    const bestQuiz = Object.values(quizScoresForUser).reduce(
      (max, v) => Math.max(max, v),
      100
    );
    const cert = await issueCertificate(course.id, bestQuiz);
    setIssuingCert(false);
    if (cert) {
      router.push(`/certificates/${cert.code}`);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson) return;
    setUploadingDoc(true);
    setUploadMsg(null);

    try {
      let res: Response;
      if (attachMode === "file") {
        if (!selectedFile) {
          setUploadMsg({ ok: false, text: "Vui lòng chọn file từ máy tính trước." });
          setUploadingDoc(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("courseId", course.id);
        formData.append("lessonId", activeLesson.id);
        formData.append("title", docTitle.trim() || selectedFile.name);
        res = await fetch("/api/resources/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!docTitle.trim() || !docUrl.trim()) {
          setUploadMsg({
            ok: false,
            text: "Vui lòng nhập đầy đủ Tên tài liệu và Đường dẫn.",
          });
          setUploadingDoc(false);
          return;
        }
        res = await fetch("/api/resources/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            lessonId: activeLesson.id,
            title: docTitle.trim(),
            url: docUrl.trim(),
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setUploadMsg({ ok: false, text: data.error || "Không thể đính kèm tài liệu." });
      } else {
        if (data.db) setDbState(data.db);
        setSelectedFile(null);
        setDocTitle("");
        setDocUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadMsg({
          ok: true,
          text: "✓ Đã đính kèm tài liệu thành công! Học viên có thể tải về ngay.",
        });
      }
    } catch (err) {
      setUploadMsg({ ok: false, text: "Lỗi kết nối: " + String(err) });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteResource = async (index: number) => {
    if (!activeLesson) return;
    const res = await fetch(
      `/api/resources/upload?courseId=${encodeURIComponent(
        course.id
      )}&lessonId=${encodeURIComponent(activeLesson.id)}&index=${index}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.db) setDbState(data.db);
    }
  };

  const currentQuizScore =
    activeLesson && user ? db.quizScores[user.id]?.[activeLesson.id] : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* Top Learning Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-800">
        <div>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Thông tin khóa học
          </Link>
          <h1 className="font-display text-lg sm:text-2xl font-extrabold text-white">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-400">
              Tiến độ: {progress.completedCount}/{progress.totalCount} bài
            </div>
            <div className="text-sm font-extrabold text-cyan-300">
              Hoàn thành {progress.percent}%
            </div>
          </div>

          {existingCert ? (
            <Link
              href={`/certificates/${existingCert.code}`}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              Xem Chứng Chỉ
            </Link>
          ) : (
            <button
              type="button"
              disabled={progress.percent < 100 || issuingCert}
              onClick={handleClaimCertificate}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                progress.percent >= 100
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg cursor-pointer hover:opacity-95"
                  : "bg-slate-900 border border-slate-700 text-slate-500 cursor-not-allowed"
              }`}
              title={
                progress.percent < 100
                  ? "Hoàn thành 100% bài học để mở khóa Chứng chỉ"
                  : "Nhận Bằng Chứng Nhận Ohana"
              }
            >
              <Award className="w-4 h-4" />
              {issuingCert
                ? "Đang xuất bằng..."
                : progress.percent >= 100
                ? "Nhận Chứng Chỉ Ngay"
                : `Chứng chỉ (${progress.percent}%)`}
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video & Lesson Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeLesson && canWatchCurrent ? (
            <>
              <VideoPlayer
                videoUrl={activeLesson.videoUrl}
                title={activeLesson.title}
              />

              <div className="glow-card rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                      Bài {activeIdx + 1} / {allLessons.length} • Thời lượng{" "}
                      {activeLesson.duration}
                    </div>
                    <h2 className="font-display text-xl font-bold text-white mt-1">
                      {activeLesson.title}
                    </h2>
                  </div>

                  {unlocked && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleLessonComplete(
                          course.id,
                          activeLesson.id,
                          !isCompleted
                        )
                      }
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "btn-gradient text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isCompleted ? "Đã hoàn thành bài này" : "Đánh dấu hoàn thành"}
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeLesson.summary}
                </p>

                {/* Resources & Admin File Upload Box (Ô Đỏ) */}
                {((activeLesson.resources && activeLesson.resources.length > 0) ||
                  user?.role === "admin") && (
                  <div
                    id="lesson-resources"
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/85 border border-cyan-500/30 space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        Tài liệu đính kèm bài giảng
                      </div>
                      {activeLesson.resources && activeLesson.resources.length > 0 && (
                        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-0.5 rounded-full">
                          {activeLesson.resources.length} tài liệu sẵn sàng
                        </span>
                      )}
                    </div>

                    {/* List of attached resources */}
                    {activeLesson.resources && activeLesson.resources.length > 0 ? (
                      <div className="space-y-2">
                        {activeLesson.resources.map((res, idx) => {
                          const isUploadedFile = res.url.startsWith(
                            "/api/resources/file/"
                          );
                          const isExternalUrl = res.url.startsWith("http");

                          return (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/80 px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/35 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Paperclip className="w-4 h-4 text-cyan-400 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-cyan-200 truncate">
                                    {res.title}
                                  </div>
                                  {res.fileName && (
                                    <div className="text-[10px] text-slate-400">
                                      File: {res.fileName}
                                      {res.fileSize
                                        ? ` • ${formatBytes(res.fileSize)}`
                                        : ""}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isUploadedFile ? (
                                  <a
                                    href={res.url}
                                    download={res.fileName || true}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Tải tài liệu
                                  </a>
                                ) : isExternalUrl ? (
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                                  >
                                    Mở liên kết →
                                  </a>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold">
                                    ✓ Đính kèm khóa học
                                  </span>
                                )}

                                {user?.role === "admin" && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteResource(idx)}
                                    title="Xóa tài liệu này"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Bài học này chưa có file tài liệu đính kèm.
                      </p>
                    )}

                    {/* Admin-Only File & Link Upload Toolbar */}
                    {user?.role === "admin" && (
                      <form
                        onSubmit={handleUploadFile}
                        className="mt-3 pt-4 border-t border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            Quản trị viên: Đính kèm thêm file đào tạo vào bài này
                          </span>

                          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button
                              type="button"
                              onClick={() => setAttachMode("file")}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                                attachMode === "file"
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              Tải file từ máy
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttachMode("link")}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                                attachMode === "link"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              Dán link ngoài
                            </button>
                          </div>
                        </div>

                        {attachMode === "file" ? (
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                            <div className="sm:col-span-5">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                  const f = e.target.files?.[0] || null;
                                  setSelectedFile(f);
                                  if (f && !docTitle.trim()) {
                                    setDocTitle(f.name);
                                  }
                                }}
                                className="w-full text-xs text-slate-300 file:mr-2.5 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 bg-slate-950 border border-slate-700 rounded-xl p-1 cursor-pointer"
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                placeholder="Tên hiển thị (VD: Giáo trình PDF)"
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <button
                                type="submit"
                                disabled={uploadingDoc}
                                className="w-full py-2.5 px-3 rounded-xl btn-gradient text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                {uploadingDoc ? "Đang tải..." : "Đính kèm file"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                            <div className="sm:col-span-4">
                              <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                placeholder="Tên tài liệu (VD: Slide bài giảng)"
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div className="sm:col-span-5">
                              <input
                                type="url"
                                value={docUrl}
                                onChange={(e) => setDocUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <button
                                type="submit"
                                disabled={uploadingDoc}
                                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                {uploadingDoc ? "Đang lưu..." : "Gắn link"}
                              </button>
                            </div>
                          </div>
                        )}

                        {uploadMsg && (
                          <div
                            className={`text-xs font-semibold ${
                              uploadMsg.ok ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {uploadMsg.text}
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                )}

                {/* Quiz Section if available */}
                {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-purple-400" />
                        Bài Kiểm Tra Sát Hạch Kiến Thức
                      </h3>
                      {currentQuizScore !== undefined && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/35 text-emerald-300 text-xs font-bold">
                          Điểm cao nhất: {currentQuizScore}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {activeLesson.quiz.map((q, qIdx) => {
                        const chosen = quizAnswers[q.id];
                        return (
                          <div
                            key={q.id}
                            className="p-4 rounded-2xl bg-slate-900/75 border border-slate-800 space-y-3"
                          >
                            <div className="text-sm font-bold text-white">
                              Câu {qIdx + 1}: {q.question}
                            </div>
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = chosen === optIdx;
                                const isCorrect = optIdx === q.correctIndex;
                                let borderCls =
                                  "border-slate-700/80 bg-slate-950/70 hover:border-cyan-400/60";
                                if (quizSubmitted) {
                                  if (isCorrect) {
                                    borderCls =
                                      "border-emerald-500 bg-emerald-500/15 text-emerald-200";
                                  } else if (isSelected && !isCorrect) {
                                    borderCls =
                                      "border-rose-500 bg-rose-500/15 text-rose-200";
                                  }
                                } else if (isSelected) {
                                  borderCls =
                                    "border-cyan-400 bg-cyan-500/15 text-white";
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() =>
                                      setQuizAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: optIdx,
                                      }))
                                    }
                                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${borderCls}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {quizSubmitted && (
                              <div className="text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3">
                                💡 <strong>Giải thích:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3">
                      {!quizSubmitted ? (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          className="px-6 py-3 rounded-xl btn-gradient text-white text-xs sm:text-sm font-bold cursor-pointer"
                        >
                          Nộp Bài &amp; Chấm Điểm Tự Động
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Làm Lại Bài Kiểm Tra
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Prev / Next Navigation */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={activeIdx <= 0}
                    onClick={() =>
                      activeIdx > 0 && selectLesson(allLessons[activeIdx - 1].id)
                    }
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Bài trước
                  </button>

                  <button
                    type="button"
                    disabled={activeIdx >= allLessons.length - 1}
                    onClick={() =>
                      activeIdx < allLessons.length - 1 &&
                      selectLesson(allLessons[activeIdx + 1].id)
                    }
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 hover:border-cyan-400 disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Bài tiếp theo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="glow-card rounded-3xl p-10 text-center space-y-4 border border-purple-500/40">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-purple-300" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-white">
                {isCourseInMembership(course) && mySubscription && !hasActiveMembership
                  ? "Gói Hội Viên Membership Đã Hết Hạn"
                  : isCourseInMembership(course)
                  ? "Nội Dung Dành Riêng Cho Hội Viên Membership"
                  : "Nội Dung Dành Cho Học Viên Đã Kích Hoạt"}
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                {isCourseInMembership(course) && mySubscription && !hasActiveMembership
                  ? `Gói Hội viên của bạn đã hết hạn vào ngày ${new Date(
                      mySubscription.expiresAt
                    ).toLocaleDateString(
                      "vi-VN"
                    )}. Toàn bộ tiến độ học tập cũ vẫn được giữ nguyên — hãy gia hạn ngay để tiếp tục xem bài mới.`
                  : isCourseInMembership(course)
                  ? "Đăng ký gói Hội viên Ohana Membership (từ 299.000đ/tháng) để mở khóa trọn bộ kho bài học cập nhật liên tục và tải toàn bộ tài liệu đính kèm."
                  : "Bạn đang xem chế độ khách. Hãy kích hoạt khóa học qua VietQR hoặc nhập mã nội bộ để mở khóa toàn bộ bài giảng và nhận chứng chỉ."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!user && (
                  <Link
                    href={`/login?next=${encodeURIComponent(`/learn/${course.slug}`)}`}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold inline-flex items-center gap-2 border border-slate-700"
                  >
                    Đăng Nhập Tài Khoản
                  </Link>
                )}
                {isCourseInMembership(course) ? (
                  <Link
                    href="/membership"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-sm font-extrabold inline-flex items-center gap-2 shadow-lg"
                  >
                    <Crown className="w-4 h-4" />
                    {mySubscription && !hasActiveMembership
                      ? "Gia Hạn Hội Viên Ngay"
                      : "Đăng Ký Hội Viên Membership"}
                  </Link>
                ) : course.accessType === "commercial" ? (
                  <Link
                    href={`/checkout/${course.slug}`}
                    className="px-6 py-3 rounded-xl btn-gradient text-white text-sm font-bold inline-flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> Mua Khóa Học Ngay
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="px-6 py-3 rounded-xl btn-gradient text-white text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Kích Hoạt Khóa Học
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Playlist Sidebar */}
        <aside className="lg:col-span-4 glow-card rounded-2xl overflow-hidden border border-slate-800 lg:sticky lg:top-24">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Nội Dung Chương Trình
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-800/80">
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="p-3 space-y-1.5">
                <div className="px-2 py-1 text-xs font-extrabold text-slate-300 uppercase tracking-wide">
                  {chapter.title}
                </div>
                {chapter.lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const done = progress.completedIds.includes(lesson.id);
                  const playable = unlocked || lesson.isFreePreview;
                  const hasResources =
                    Boolean(lesson.resources && lesson.resources.length > 0);

                  return (
                    <div
                      key={lesson.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectLesson(lesson.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectLesson(lesson.id);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isActive
                          ? "bg-cyan-500/15 border-cyan-500/45 text-white"
                          : "border-transparent hover:bg-slate-900/70 text-slate-300"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : playable ? (
                        isActive ? (
                          <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        )
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold leading-snug">
                          {lesson.title}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span>{lesson.duration}</span>
                            {lesson.isFreePreview && !unlocked && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                                Học thử
                              </span>
                            )}
                            {lesson.quiz && lesson.quiz.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                                Bài thi
                              </span>
                            )}
                          </div>

                          {/* Ô Xanh: Ký hiệu Tải tài liệu tại đây */}
                          {hasResources && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectLesson(lesson.id, true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/45 font-bold transition-colors cursor-pointer"
                              title="Nhấn để xuống mục tải tài liệu bài giảng"
                            >
                              <Download className="w-2.5 h-2.5" />
                              Tải tài liệu tại đây
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {isCourseInMembership(course) && memberZaloGroupUrl && (
            <div className="p-4 border-t border-sky-500/30 bg-sky-950/35 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-300">
                <MessageCircle className="w-4 h-4 shrink-0" />
                Group Hội Viên Học AI (Zalo)
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-xl w-20 shrink-0 border border-sky-400/60">
                  <img
                    src="/api/membership/zalo-qr"
                    alt="QR Group Hội Viên Học AI"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="space-y-2 min-w-0">
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Quét QR hoặc bấm nút để tham gia nhóm Zalo nhận thông báo bài mới &amp; hỏi đáp.
                  </p>
                  <a
                    href={memberZaloGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-extrabold"
                  >
                    Vào Nhóm Zalo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
