import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "img.vietqr.io" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  outputFileTracingIncludes: {
    "/api/membership/zalo-qr": ["./private/zalo_group_hoivien_qr.jpg"],
  },
};

export default nextConfig;
