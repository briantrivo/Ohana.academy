"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  PlayCircle,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { useLMS } from "@/context/LMSContext";
import { CourseAccessType } from "@/types/lms";

type FilterTab = "all" | CourseAccessType;

export default function HomePage() {
  const { db, user } = useLMS();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return db.courses.filter((course) => {
      const matchTab = activeTab === "all" || course.accessType === activeTab;
      const matchQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.subtitle.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [db.courses, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: db.courses.length,
      commercial: db.courses.filter((c) => c.accessType === "commercial").length,
      internal: db.courses.filter((c) => c.accessType === "internal").length,
      free: db.courses.filter((c) => c.accessType === "free").length,
    };
  }, [db.courses]);

  const totalStudents = useMemo(
    () => db.courses.reduce((sum, c) => sum + c.studentsCount, 0),
    [db.courses]
  );

  return (
    <div className="pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-20 border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Hệ Thống E-Learning Chính Thức • Ohana Astronixa
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Nền Tảng Đào Tạo{" "}
                <span className="gradient-text">Nội Bộ Toàn Quốc</span> &amp;{" "}
                <span className="text-cyan-300">Khóa Học Thực Chiến</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Một hệ thống duy nhất phục vụ trọn vẹn cả 2 mục tiêu của Ohana:
                chuẩn hóa năng lực đội ngũ nội bộ &amp; đồng thời thương mại hóa các
                chương trình đào tạo AI kinh doanh với thanh toán{" "}
                <strong className="text-cyan-300">VietQR mở khóa tự động 24/7</strong>{" "}
                và cấp chứng chỉ điện tử định danh.
              </p>

              {/* Quick Dual-Mode Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("internal");
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-left p-4 rounded-2xl bg-purple-950/35 hover:bg-purple-900/40 border border-purple-500/35 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
                      <Building2 className="w-4 h-4" /> Hướng 1: Nội Bộ Ohana
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-white mt-1.5">
                    Đào Tạo Nhân Sự &amp; Đối Tác
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Đăng nhập tài khoản nội bộ hoặc dùng mã nhân sự để mở khóa toàn bộ học phần nội bộ.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("commercial");
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-left p-4 rounded-2xl bg-cyan-950/30 hover:bg-cyan-900/35 border border-cyan-500/35 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      <QrCode className="w-4 h-4" /> Hướng 2: Thương Mại &amp; Phễu
                    </span>
                    <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-white mt-1.5">
                    Bán Khóa Học Quét VietQR
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Học thử miễn phí, đăng nhập Google/Email, chuyển khoản Techcombank tự động kích hoạt.
                  </p>
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="font-display text-2xl font-extrabold text-white">
                    {db.courses.length}+
                  </div>
                  <div className="text-xs text-slate-400">Chương trình đào tạo</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-cyan-300">
                    {totalStudents.toLocaleString("vi-VN")}+
                  </div>
                  <div className="text-xs text-slate-400">Lượt học viên theo học</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-emerald-400">
                    3 giây
                  </div>
                  <div className="text-xs text-slate-400">Mở khóa tự động VietQR</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5">
              <div className="glow-card rounded-3xl p-3 border border-cyan-500/30 relative">
                <div className="relative rounded-2xl overflow-hidden aspect-[16/11]">
                  <img
                    src="/ohana/ohana_workshop_practice.jpg"
                    alt="Đào tạo thực chiến Ohana Academy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/25 to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    Hỗ trợ YouTube Playlist &amp; Vimeo Pro
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      {user
                        ? `Xin chào: ${user.name}`
                        : "Đăng nhập Google / Email để lưu tiến độ & nhận bằng"}
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      Học Mọi Lúc • Thực Hành Ra Sản Phẩm Thật • Nhận Chứng Chỉ Viện KHCN
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <Link
                    href="/courses/ohana-ai-academy-thuc-chien"
                    className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <PlayCircle className="w-8 h-8 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Học thử ngay</div>
                      <div className="text-[11px] text-slate-400">2 bài mở miễn phí</div>
                    </div>
                  </Link>
                  <Link
                    href={user?.role === "admin" ? "/admin" : "/login"}
                    className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <ShieldCheck className="w-8 h-8 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {user?.role === "admin" ? "Quản trị Studio" : "Đăng nhập / Đăng ký"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {user?.role === "admin"
                          ? "Đăng khóa & tải tài liệu"
                          : "Google hoặc Email"}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COURSE CATALOG & FILTER */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Danh Mục Đào Tạo Ohana
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Khám Phá Các Chương Trình Học
            </h2>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm khóa học AI, Nội bộ, Agent..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {(
            [
              { id: "all", label: `Tất cả (${counts.all})` },
              { id: "commercial", label: `Khóa Thương Mại (${counts.commercial})` },
              { id: "internal", label: `Đào Tạo Nội Bộ (${counts.internal})` },
              { id: "free", label: `Cộng Đồng Miễn Phí (${counts.free})` },
            ] as { id: FilterTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600/80 to-cyan-500/80 text-white border-cyan-400/50 shadow-lg"
                  : "bg-slate-900/70 text-slate-300 border-slate-800 hover:border-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="glow-card rounded-2xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold">
              Chưa tìm thấy khóa học phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              Xem lại toàn bộ khóa học
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* 3. SYSTEM ARCHITECTURE HIGHLIGHTS FOR OHANA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="glow-card rounded-3xl p-6 sm:p-10 border border-purple-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              Bảo Chứng Năng Lực &amp; Vận Hành Trọn Gói
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Tự Động Hóa Từ Khâu Tuyển Sinh Đến Cấp Chứng Chỉ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-900/75 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Video YouTube Playlist &amp; Vimeo</div>
                  <div className="text-slate-400 mt-0.5">
                    Chỉ cần dán link vào Admin Studio, băng thông 0đ, tải cực nhanh trên mọi thiết bị.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/75 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">VietQR Techcombank Tự Động</div>
                  <div className="text-slate-400 mt-0.5">
                    Tạo mã QR kèm đúng số tiền &amp; mã đơn, kết nối sẵn Webhook SePay / PayOS / Casso.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/75 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Đăng Nhập Google &amp; Phân Quyền Nội Bộ</div>
                  <div className="text-slate-400 mt-0.5">
                    Tách biệt tài khoản Học viên, Nhân sự Nội bộ &amp; Quản trị viên bảo mật bằng Session Cookie.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/75 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Quiz Chấm Điểm &amp; Cấp Chứng Chỉ</div>
                  <div className="text-slate-400 mt-0.5">
                    Vượt qua bài thi cuối khóa ≥ 80% để nhận Bằng chứng nhận có mã số tra cứu riêng.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl">
              <img
                src="/ohana/chung_chi_vien_khcn_ohana.jpg"
                alt="Chứng chỉ tốt nghiệp Ohana Academy"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" /> Viện KHCN &amp; Giáo Dục x Astronixa
              </span>
              <Link
                href={user ? "/my-learning" : "/login"}
                className="text-cyan-300 font-bold hover:underline"
              >
                {user ? "Xem chứng chỉ của tôi →" : "Đăng nhập xem chứng chỉ →"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
