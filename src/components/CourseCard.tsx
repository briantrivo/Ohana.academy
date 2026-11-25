"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { formatVND } from "@/lib/video";
import { Course } from "@/types/lms";

export function CourseCard({ course }: { course: Course }) {
  const { hasCourseAccess, getCourseProgress } = useLMS();
  const unlocked = hasCourseAccess(course);
  const progress = getCourseProgress(course);
  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  );

  const typeBadge =
    course.accessType === "internal"
      ? {
          text: "Đào Tạo Nội Bộ",
          cls: "bg-purple-600/90 text-white border-purple-400/40",
          icon: <Building2 className="w-3 h-3" />,
        }
      : course.accessType === "free"
      ? {
          text: "Cộng Đồng Miễn Phí",
          cls: "bg-emerald-600/90 text-white border-emerald-400/40",
          icon: <PlayCircle className="w-3 h-3" />,
        }
      : {
          text: course.badge || "Khóa Học Chuyên Sâu",
          cls: "bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-cyan-300/40",
          icon: null,
        };

  return (
    <div className="glow-card rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Thumbnail */}
        <Link href={`/courses/${course.slug}`} className="block relative h-50 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/20 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-lg ${typeBadge.cls}`}
            >
              {typeBadge.icon}
              {typeBadge.text}
            </span>
          </div>

          {unlocked && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/90 text-slate-950 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã mở khóa
            </span>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
            <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700/80 text-[11px] text-cyan-300 font-semibold">
              {course.category}
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
          </div>
        </Link>

        {/* Body */}
        <div className="p-5">
          <Link href={`/courses/${course.slug}`}>
            <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {course.subtitle}
          </p>

          {/* Meta stats */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              {totalLessons} bài học
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              {course.totalDuration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              {course.studentsCount.toLocaleString("vi-VN")} học viên
            </span>
          </div>

          {/* Progress bar if unlocked */}
          {unlocked && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-slate-400">Tiến độ hoàn thành</span>
                <span className="font-bold text-cyan-300">{progress.percent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Price & CTA */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div>
          {course.accessType === "internal" ? (
            <div>
              <span className="text-xs text-purple-300 font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Nội bộ Ohana
              </span>
              <span className="text-[11px] text-slate-500">Cấp mã / Tài khoản nội bộ</span>
            </div>
          ) : course.price === 0 ? (
            <div>
              <span className="text-lg font-extrabold text-emerald-400 font-display">
                Miễn phí 0đ
              </span>
              <span className="block text-[11px] text-slate-500">Học ngay trọn đời</span>
            </div>
          ) : (
            <div>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="block text-xs text-slate-500 line-through">
                  {formatVND(course.originalPrice)}
                </span>
              )}
              <span className="text-lg font-extrabold text-cyan-300 font-display">
                {formatVND(course.price)}
              </span>
            </div>
          )}
        </div>

        <Link
          href={unlocked ? `/learn/${course.slug}` : `/courses/${course.slug}`}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shrink-0 ${
            unlocked
              ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
              : "btn-gradient text-white"
          }`}
        >
          {unlocked ? "Vào Học Ngay" : "Xem Chi Tiết"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
