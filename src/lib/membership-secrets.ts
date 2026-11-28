import { isSubscriptionActive, UserSubscriptionLike } from "@/lib/membership";

export const MEMBERSHIP_ZALO_GROUP_NAME = "Group Hội Viên Học AI";

export function getMemberZaloGroupUrl(): string {
  return (
    process.env.MEMBERSHIP_ZALO_GROUP_URL ||
    "https://zalo.me/g/bpnuctoawvxv0gnc42uf"
  ).trim();
}

export function canAccessMemberZaloGroup(
  role: string | undefined,
  sub: UserSubscriptionLike | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (role === "admin") return true;
  return isSubscriptionActive(sub, nowMs);
}
