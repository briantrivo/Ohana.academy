"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Lock,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { useLMS } from "@/context/LMSContext";

export function MemberZaloCard({ compact = false }: { compact?: boolean }) {
  const { user, memberZaloGroupUrl, hasActiveMembership } = useLMS();
  const [copied, setCopied] = useState(false);

  const unlocked = Boolean(memberZaloGroupUrl);

  const handleCopyLink = () => {
    if (!memberZaloGroupUrl) return;
    navigator.clipboard?.writeText(memberZaloGroupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (unlocked && memberZaloGroupUrl) {
    return (
      <div
        className={`rounded-3xl bg-gradient-to-br from-sky-950/60 via-slate-900/90 to-cyan-950/50 border border-sky-400/40 shadow-xl ${
          compact ? "p-4 sm:p-5" : "p-6 sm:p-7"
        }`}
      >
        <div
          className={`flex flex-col ${
            compact ? "sm:flex-row" : "md:flex-row"
          } items-center gap-5`}
        >
          {/* Protected QR Image from /api/membership/zalo-qr */}
          <div className="bg-white p-2.5 rounded-2xl border-2 border-sky-400/70 shadow-lg shrink-0 w-40 sm:w-44">
            <img
              src="/api/membership/zalo-qr"
              alt="Mã QR Group Hội Viên Học AI trên Zalo"
              className="w-full h-auto rounded-xl object-contain"
            />
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[11px] font-extrabold uppercase tracking-wider">
              <MessageCircle className="w-3.5 h-3.5" />
              Đặc Quyền Hội Viên • Group Zalo Riêng
            </div>

            <div>
              <h3
                className={`font-display font-extrabold text-white ${
                  compact ? "text-lg" : "text-xl sm:text-2xl"
                }`}
              >
                Group Hội Viên Học AI (Zalo)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Quét mã QR bằng ứng dụng Zalo hoặc bấm nút bên dưới để tham gia nhóm
                hội viên nhận thông báo bài học mới cập nhật, bộ Prompt thực chiến và
                hỏi đáp trực tiếp cùng đội ngũ Ohana.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <a
                href={memberZaloGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Tham Gia Nhóm Zalo Ngay
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-200 border border-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Đã chép link nhóm
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép link Zalo
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono break-all">
              {memberZaloGroupUrl}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-slate-900/75 border border-sky-500/25 p-6 sm:p-7">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-36 h-36 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-2 text-center p-4 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(56,189,248,0.16),transparent_70%)]" />
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/35 flex items-center justify-center text-sky-300 relative">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-300 relative">
            QR Group Zalo VIP
          </span>
        </div>

        <div className="flex-1 space-y-2.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            Đặc Quyền Dành Riêng Cho Hội Viên Membership
          </div>
          <h3 className="font-display text-xl font-extrabold text-white">
            Tham Gia Group Zalo &ldquo;Group Hội Viên Học AI&rdquo;
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ngay khi kích hoạt gói Hội Viên Ohana Membership (từ 299.000đ/tháng), mã
            QR &amp; đường link tham gia <strong>Group Hội Viên Học AI</strong> trên Zalo
            sẽ tự động mở khóa để bạn vào nhóm hỏi đáp và nhận cập nhật bài mới hàng tuần.
          </p>
          <div className="pt-1">
            {user && !hasActiveMembership ? (
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg"
              >
                <Crown className="w-4 h-4" />
                Chọn Gói Hội Viên Để Mở Khóa QR Zalo
              </a>
            ) : (
              <Link
                href="/membership#plans"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg"
              >
                <Crown className="w-4 h-4" />
                Đăng Ký Hội Viên Để Nhận Mã QR Zalo
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
