export interface ParsedVideo {
  provider: "youtube" | "vimeo" | "mp4" | "unknown";
  embedUrl: string;
  originalUrl: string;
}

/**
 * Phân tích tự động link YouTube (Video đơn, Unlisted, Shorts, Live, Danh sách phát Playlist)
 * và Vimeo (bao gồm cả Vimeo Unlisted có mã băm bảo mật dạng vimeo.com/ID/HASH).
 */
export function parseVideoUrl(rawUrl: string): ParsedVideo {
  const url = (rawUrl || "").trim();
  if (!url) {
    return { provider: "unknown", embedUrl: "", originalUrl: url };
  }

  // 1a. YouTube Playlist (youtube.com/playlist?list=... hoặc embed/videoseries?list=...)
  const ytListOnly = url.match(/youtube\.com\/(?:playlist|embed\/videoseries)\?(?:.*&)?list=([a-zA-Z0-9_-]+)/);
  if (ytListOnly && ytListOnly[1]) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${ytListOnly[1]}&rel=0&modestbranding=1`,
      originalUrl: url,
    };
  }

  // 1b. YouTube Video (watch?v=, youtu.be/, embed/, shorts/, live/, có thể kèm &list=...)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    const listQuery = listMatch && listMatch[1] ? `&list=${listMatch[1]}` : "";
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${listQuery}`,
      originalUrl: url,
    };
  }

  // 2. Vimeo (hỗ trợ cả Vimeo Unlisted có hash: vimeo.com/123456789/abcdef123 hoặc player.vimeo.com/video/123456789?h=abcdef)
  const vimeoPlayerMatch = url.match(
    /player\.vimeo\.com\/video\/(\d+)(?:\?.*h=([a-zA-Z0-9]+))?/
  );
  if (vimeoPlayerMatch && vimeoPlayerMatch[1]) {
    const id = vimeoPlayerMatch[1];
    const hash = vimeoPlayerMatch[2];
    return {
      provider: "vimeo",
      embedUrl: hash
        ? `https://player.vimeo.com/video/${id}?h=${hash}&title=0&byline=0&portrait=0`
        : `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
      originalUrl: url,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:manage\/videos\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    const hash = vimeoMatch[2];
    return {
      provider: "vimeo",
      embedUrl: hash
        ? `https://player.vimeo.com/video/${id}?h=${hash}&title=0&byline=0&portrait=0`
        : `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
      originalUrl: url,
    };
  }

  // 3. Direct MP4 / WebM
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return {
      provider: "mp4",
      embedUrl: url,
      originalUrl: url,
    };
  }

  return {
    provider: "unknown",
    embedUrl: url,
    originalUrl: url,
  };
}

export function formatVND(amount: number): string {
  if (amount <= 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function buildVietQrUrl(params: {
  amount: number;
  orderCode: string;
  bankId?: string;
  accountNo?: string;
  accountName?: string;
}): string {
  const bankId = params.bankId || process.env.NEXT_PUBLIC_VIETQR_BANK_ID || "TCB";
  const accountNo = params.accountNo || process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || "894567";
  const accountName =
    params.accountName ||
    process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME ||
    "CONG TY TNHH ASTRONIXA";

  const info = encodeURIComponent(`${params.orderCode}`);
  const accName = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${Math.round(
    params.amount
  )}&addInfo=${info}&accountName=${accName}`;
}
