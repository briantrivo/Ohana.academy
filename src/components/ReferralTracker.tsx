"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AFFILIATE_COOKIE_DAYS, AFFILIATE_COOKIE_NAME } from "@/lib/affiliate";

export function ReferralTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const rawRef = params.get("ref") || "";
    const cleanRef = rawRef
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "");

    if (cleanRef.length >= 4 && cleanRef.length <= 24) {
      const maxAge = AFFILIATE_COOKIE_DAYS * 24 * 60 * 60;
      document.cookie = `${AFFILIATE_COOKIE_NAME}=${encodeURIComponent(
        cleanRef
      )}; path=/; max-age=${maxAge}; SameSite=Lax`;
      try {
        window.localStorage.setItem(AFFILIATE_COOKIE_NAME, cleanRef);
      } catch {}
    }
  }, [pathname]);

  return null;
}
