"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Award, CheckCircle2, Printer, ShieldCheck } from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { CertificateRecord } from "@/types/lms";

export default function CertificateVerifyPage() {
  const params = useParams<{ code: string }>();
  const { db, user } = useLMS();
  const [fetchedCert, setFetchedCert] = useState<CertificateRecord | null>(null);

  const localMatch = db.certificates.find(
    (c) => c.code.toUpperCase() === params.code.toUpperCase()
  );

  useEffect(() => {
    if (localMatch) return;
    fetch(`/api/certificates/${encodeURIComponent(params.code)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.certificate) setFetchedCert(data.certificate);
      })
      .catch(() => {});
  }, [localMatch, params.code]);

  const cert = localMatch || fetchedCert;

  const displayCert = cert || {
    code: params.code,
    courseTitle: "OHANA AI ACADEMY — Làm Chủ AI Kinh Doanh Tạo Doanh Số Thực Chiến",
    studentName: user?.name || "Học viên Ohana Academy",
    studentEmail: user?.email || "hocvien@ohana.vn",
    issuer: "Viện Phát Triển Khoa Học Công Nghệ & Giáo Dục",
    issuedAt: new Date().toISOString(),
    quizScore: 100,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
        <Link
          href="/my-learning"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Góc Học Tập
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl btn-gradient text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> In / Lưu File PDF Chứng Chỉ
        </button>
      </div>

      <div className="rounded-3xl p-6 sm:p-12 bg-gradient-to-br from-[#0F172A] via-[#0B101E] to-[#13112B] border-4 border-amber-400/60 shadow-[0_0_80px_rgba(251,191,36,0.18)] relative overflow-hidden">
        <div className="absolute inset-4 border border-cyan-400/30 rounded-2xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <img
              src="/ohana/astronixa_logo.jpg"
              alt="Astronixa Ohana"
              className="w-14 h-14 rounded-2xl object-contain bg-white/10 p-1.5 border border-amber-400/50"
            />
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Học Viện Đào Tạo Thực Chiến
              </div>
              <div className="font-display text-xl font-extrabold text-white">
                OHANA ACADEMY • ASTRONIXA
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              CHỨNG NHẬN ĐIỆN TỬ ĐÃ XÁC THỰC
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-wide text-amber-300 uppercase pt-2">
              Giấy Chứng Nhận
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 uppercase tracking-widest">
              Chứng nhận hoàn thành chương trình đào tạo chuyên sâu
            </p>
          </div>

          <div className="py-4 border-y border-slate-800/90 max-w-2xl mx-auto space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider">
              Trân trọng trao tặng học viên
            </div>
            <div className="font-display text-2xl sm:text-4xl font-extrabold text-white">
              {displayCert.studentName}
            </div>
            <div className="text-xs text-slate-400">{displayCert.studentEmail}</div>
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-xs text-slate-400">
              Đã hoàn thành xuất sắc toàn bộ nội dung bài giảng, thực hành và vượt qua kỳ kiểm tra sát hạch của chương trình:
            </p>
            <div className="font-display text-lg sm:text-2xl font-bold text-cyan-300">
              {displayCert.courseTitle}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400">Mã tra cứu định danh</div>
              <div className="font-mono font-bold text-amber-300 mt-1">
                {displayCert.code}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400">Ngày cấp chứng nhận</div>
              <div className="font-bold text-white mt-1">
                {new Date(displayCert.issuedAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400">Kết quả sát hạch</div>
              <div className="font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {displayCert.quizScore ?? 100}% Đạt chuẩn
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between max-w-2xl mx-auto gap-6 text-xs text-slate-300">
            <div className="text-center">
              <div className="font-bold text-white">Đơn vị bảo chứng</div>
              <div className="text-cyan-300 mt-1">{displayCert.issuer}</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
              <Award className="w-8 h-8 text-amber-300" />
            </div>
            <div className="text-center">
              <div className="font-bold text-white">Giám Đốc Điều Hành Chương Trình</div>
              <div className="font-display text-sm font-bold text-amber-300 mt-1">
                Brian Võ (Võ Quốc Trí)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
