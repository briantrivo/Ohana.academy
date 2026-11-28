export interface MembershipPlanLike {
  id: string;
  name: string;
  subtitle: string;
  durationDays: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  features: string[];
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface UserSubscriptionLike {
  userId: string;
  planId: string;
  planName: string;
  startedAt: string;
  expiresAt: string;
  lastOrderCode?: string;
  updatedAt: string;
}

export interface CourseAccessLike {
  id: string;
  accessType: string;
  includedInMembership?: boolean;
}

export interface UserAccessLike {
  id: string;
  role: string;
}

export interface LessonFeedCourseLike {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string;
  accessType: string;
  includedInMembership?: boolean;
  createdAt?: string;
  chapters: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      duration: string;
      videoUrl: string;
      summary: string;
      isFreePreview?: boolean;
      publishedAt?: string;
    }[];
  }[];
}

export const DEFAULT_MEMBERSHIP_PLANS: MembershipPlanLike[] = [
  {
    id: "plan-monthly",
    name: "Gói Hội Viên 1 Tháng",
    subtitle: "Trải nghiệm linh hoạt — Cập nhật bài học AI & Prompt mới mỗi tuần",
    durationDays: 30,
    price: 299000,
    originalPrice: 499000,
    badge: "Linh hoạt",
    features: [
      "Mở khóa toàn bộ Kho Bài Học AI Cập Nhật Hàng Tháng",
      "Tải trọn bộ file Prompt, Template & Slide mới đăng",
      "Lưu tiến độ học tập & chứng nhận học viên Ohana",
      "Gia hạn bất kỳ lúc nào — tự động cộng dồn ngày còn lại",
    ],
    active: true,
    sortOrder: 1,
    createdAt: "2026-11-28T08:00:00.000Z",
  },
  {
    id: "plan-quarterly",
    name: "Gói Hội Viên 3 Tháng",
    subtitle: "Tiết kiệm 12% so với đóng lẻ hàng tháng — Phổ biến nhất",
    durationDays: 90,
    price: 790000,
    originalPrice: 897000,
    badge: "Phổ biến nhất",
    features: [
      "Toàn bộ quyền lợi Hội viên trong suốt 90 ngày liên tục",
      "Truy cập mọi bài giảng AI, Video & Automation cập nhật mới",
      "Tải không giới hạn tài liệu thực chiến đính kèm bài giảng",
      "Ưu tiên tham gia các chuyên đề cập nhật công cụ AI mới nhất",
    ],
    active: true,
    sortOrder: 2,
    createdAt: "2026-11-28T08:01:00.000Z",
  },
  {
    id: "plan-yearly",
    name: "Gói Hội Viên VIP 12 Tháng",
    subtitle: "Tiết kiệm hơn 30% — Đồng hành cập nhật công nghệ AI trọn năm",
    durationDays: 365,
    price: 2490000,
    originalPrice: 3588000,
    badge: "Tiết kiệm nhất",
    features: [
      "365 ngày truy cập liên tục toàn bộ Kho Bài Học Membership",
      "Tự động mở khóa mọi chuyên đề & bài học mới xuất bản trong năm",
      "Tải trọn bộ kho tài nguyên, quy trình & bộ câu lệnh mới nhất",
      "Chỉ ~207.000đ/tháng — tiết kiệm 1.098.000đ so với đóng lẻ",
    ],
    active: true,
    sortOrder: 3,
    createdAt: "2026-11-28T08:02:00.000Z",
  },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeExtendedExpiry(
  currentExpiresAt: string | undefined,
  durationDays: number,
  nowMs: number = Date.now()
): { startedAt: string; expiresAt: string } {
  const safeDays = Math.max(1, Math.floor(Number(durationDays) || 30));
  const currentExpMs = currentExpiresAt ? Date.parse(currentExpiresAt) : NaN;
  const baseMs =
    !Number.isNaN(currentExpMs) && currentExpMs > nowMs ? currentExpMs : nowMs;
  const nextExpMs = baseMs + safeDays * MS_PER_DAY;
  return {
    startedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nextExpMs).toISOString(),
  };
}

export function isSubscriptionActive(
  sub: UserSubscriptionLike | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!sub || !sub.expiresAt) return false;
  const expMs = Date.parse(sub.expiresAt);
  return !Number.isNaN(expMs) && expMs > nowMs;
}

export function getRemainingDays(
  sub: UserSubscriptionLike | null | undefined,
  nowMs: number = Date.now()
): number {
  if (!sub || !sub.expiresAt) return 0;
  const expMs = Date.parse(sub.expiresAt);
  if (Number.isNaN(expMs) || expMs <= nowMs) return 0;
  return Math.ceil((expMs - nowMs) / MS_PER_DAY);
}

export function isCourseInMembership(course: CourseAccessLike): boolean {
  return course.accessType === "membership" || Boolean(course.includedInMembership);
}

export function canAccessCourseWithMembership(
  course: CourseAccessLike,
  user: UserAccessLike | null | undefined,
  enrolledCourseIds: string[],
  sub: UserSubscriptionLike | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (course.accessType === "internal" && user.role === "internal") {
    return true;
  }
  if ((enrolledCourseIds || []).includes(course.id)) {
    return true;
  }
  if (isCourseInMembership(course) && isSubscriptionActive(sub, nowMs)) {
    return true;
  }
  return false;
}

export interface RecentMembershipLessonItem<
  TCourse extends LessonFeedCourseLike = LessonFeedCourseLike,
> {
  course: TCourse;
  chapterTitle: string;
  lesson: TCourse["chapters"][number]["lessons"][number];
  publishedAt: string;
}

export function collectRecentMembershipLessons<
  TCourse extends LessonFeedCourseLike,
>(courses: TCourse[], limit: number = 12): RecentMembershipLessonItem<TCourse>[] {
  const items: RecentMembershipLessonItem<TCourse>[] = [];

  for (const course of courses || []) {
    if (!isCourseInMembership(course)) continue;
    for (const ch of course.chapters || []) {
      for (const lesson of ch.lessons || []) {
        const ts = lesson.publishedAt || course.createdAt || "2026-11-01T00:00:00.000Z";
        items.push({
          course,
          chapterTitle: ch.title,
          lesson,
          publishedAt: ts,
        });
      }
    }
  }

  items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return items.slice(0, Math.max(1, limit));
}
