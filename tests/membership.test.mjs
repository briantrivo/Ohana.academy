import test from "node:test";
import assert from "node:assert/strict";
import {
  computeExtendedExpiry,
  isSubscriptionActive,
  getRemainingDays,
  canAccessCourseWithMembership,
  collectRecentMembershipLessons,
} from "../src/lib/membership.ts";

const FIXED_NOW = Date.parse("2026-11-28T10:00:00.000Z");

test("computeExtendedExpiry starts from now for new subscriber", () => {
  const res = computeExtendedExpiry(undefined, 30, FIXED_NOW);
  assert.equal(res.startedAt, "2026-11-28T10:00:00.000Z");
  assert.equal(res.expiresAt, "2026-12-28T10:00:00.000Z");
});

test("computeExtendedExpiry stacks days onto active future expiry without losing remaining days", () => {
  const activeUntil = "2026-12-10T10:00:00.000Z";
  const res = computeExtendedExpiry(activeUntil, 30, FIXED_NOW);
  assert.equal(res.expiresAt, "2027-01-09T10:00:00.000Z");
});

test("computeExtendedExpiry restarts from now when previous subscription already expired", () => {
  const pastExpiry = "2026-11-01T10:00:00.000Z";
  const res = computeExtendedExpiry(pastExpiry, 30, FIXED_NOW);
  assert.equal(res.expiresAt, "2026-12-28T10:00:00.000Z");
});

test("isSubscriptionActive and getRemainingDays handle active vs expired accurately", () => {
  const activeSub = {
    userId: "u1",
    planId: "plan-1m",
    planName: "Gói 1 Tháng",
    startedAt: "2026-11-28T10:00:00.000Z",
    expiresAt: "2026-12-08T10:00:00.000Z",
    updatedAt: "2026-11-28T10:00:00.000Z",
  };
  const expiredSub = {
    ...activeSub,
    expiresAt: "2026-11-27T10:00:00.000Z",
  };

  assert.equal(isSubscriptionActive(activeSub, FIXED_NOW), true);
  assert.equal(getRemainingDays(activeSub, FIXED_NOW), 10);
  assert.equal(isSubscriptionActive(expiredSub, FIXED_NOW), false);
  assert.equal(getRemainingDays(expiredSub, FIXED_NOW), 0);
});

test("canAccessCourseWithMembership isolates standalone commercial courses from membership", () => {
  const student = { id: "u1", role: "student" };
  const activeSub = {
    userId: "u1",
    planId: "plan-1m",
    planName: "Gói 1 Tháng",
    startedAt: "2026-11-28T10:00:00.000Z",
    expiresAt: "2026-12-28T10:00:00.000Z",
    updatedAt: "2026-11-28T10:00:00.000Z",
  };
  const expiredSub = {
    ...activeSub,
    expiresAt: "2026-11-20T10:00:00.000Z",
  };

  const membershipCourse = { id: "c-mem", accessType: "membership" };
  const flagship66m = { id: "c-66", accessType: "commercial", includedInMembership: false };
  const bonusCommercial = { id: "c-bonus", accessType: "commercial", includedInMembership: true };

  // Active member accesses membership courses and opted-in commercial courses, NOT standalone 6.6M course
  assert.equal(canAccessCourseWithMembership(membershipCourse, student, [], activeSub, FIXED_NOW), true);
  assert.equal(canAccessCourseWithMembership(bonusCommercial, student, [], activeSub, FIXED_NOW), true);
  assert.equal(canAccessCourseWithMembership(flagship66m, student, [], activeSub, FIXED_NOW), false);

  // Expired member loses membership access, but keeps lifetime purchased commercial course
  assert.equal(canAccessCourseWithMembership(membershipCourse, student, [], expiredSub, FIXED_NOW), false);
  assert.equal(canAccessCourseWithMembership(flagship66m, student, ["c-66"], expiredSub, FIXED_NOW), true);
});

test("collectRecentMembershipLessons returns newest updated lessons first", () => {
  const courses = [
    {
      id: "c-mem",
      slug: "kho-membership",
      title: "Kho Bài Học AI Cập Nhật",
      accessType: "membership",
      chapters: [
        {
          id: "ch1",
          title: "Tháng 11/2026",
          lessons: [
            { id: "l1", title: "Bài cũ", duration: "10:00", videoUrl: "u1", summary: "s1", publishedAt: "2026-11-10T08:00:00.000Z" },
            { id: "l2", title: "Bài mới nhất", duration: "15:00", videoUrl: "u2", summary: "s2", publishedAt: "2026-11-28T09:00:00.000Z" },
          ],
        },
      ],
    },
    {
      id: "c-66",
      slug: "khoa-le",
      title: "Khóa Lẻ 6.6tr",
      accessType: "commercial",
      includedInMembership: false,
      chapters: [
        {
          id: "ch2",
          title: "Buổi 1",
          lessons: [
            { id: "l3", title: "Không thuộc membership", duration: "20:00", videoUrl: "u3", summary: "s3", publishedAt: "2026-11-29T09:00:00.000Z" },
          ],
        },
      ],
    },
  ];

  const feed = collectRecentMembershipLessons(courses, 10);
  assert.equal(feed.length, 2);
  assert.equal(feed[0].lesson.id, "l2");
  assert.equal(feed[1].lesson.id, "l1");
});
