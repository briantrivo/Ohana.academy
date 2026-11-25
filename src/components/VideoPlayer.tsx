"use client";

import React from "react";
import { ExternalLink, Film, Video } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const parsed = parseVideoUrl(videoUrl);

  const providerBadge =
    parsed.provider === "youtube"
      ? "YouTube HD / Unlisted"
      : parsed.provider === "vimeo"
      ? "Vimeo Pro Stream"
      : parsed.provider === "mp4"
      ? "Direct Video MP4"
      : "Video Bài Giảng";

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
      <div className="relative aspect-video w-full bg-slate-950">
        {parsed.provider === "youtube" || parsed.provider === "vimeo" ? (
          <iframe
            key={parsed.embedUrl}
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : parsed.provider === "mp4" ? (
          <video
            key={parsed.embedUrl}
            src={parsed.embedUrl}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <Film className="w-12 h-12 text-cyan-400 mb-3" />
            <p className="text-sm text-slate-300 font-semibold">
              Đường dẫn video bài giảng chưa đúng chuẩn nhúng tự động
            </p>
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30"
              >
                Mở link video gốc <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 bg-[#0B101D] border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold">
          <Video className="w-3.5 h-3.5" />
          Nguồn phát: {providerBadge}
        </span>
        <a
          href={parsed.originalUrl}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          Mở tab riêng nếu mạng chặn nhúng <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
