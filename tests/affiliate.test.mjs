import test from "node:test";
import assert from "node:assert/strict";
import {
  AFFILIATE_RATE_COURSE,
  AFFILIATE_RATE_MEMBERSHIP,
  calculateAffiliateCommission,
  isUserAffiliateEligible,
  generateReferralCode,
  resolveReferrerForOrder,
  createCommissionForPaidOrder,
} from "../src/lib/affiliate.ts";

const FIXED_NOW = Date.parse("2026-11-28T17:30:00.000Z");

test("calculateAffiliateCommission applies 10% for commercial courses and 20% for membership", () => {
  assert.equal(AFFILIATE_RATE_COURSE, 0.1);
  assert.equal(AFFILIATE_RATE_MEMBERSHIP, 0.2);

  assert.deepEqual(calculateAffiliateCommission("course", 6600000), {
    rate: 0.1,
    amount: 660000,
  });
  assert.deepEqual(calculateAffiliateCommission("course", 6100000), {
    rate: 0.1,
    amount: 610000,
  });
  assert.deepEqual(calculateAffiliateCommission("membership", 299000), {
    rate: 0.2,
    amount: 59800,
  });
  assert.deepEqual(calculateAffiliateCommission("membership", 790000), {
    rate: 0.2,
    amount: 158000,
  });
  assert.deepEqual(calculateAffiliateCommission("membership", 2490000), {
    rate: 0.2,
    amount: 498000,
  });
  assert.deepEqual(calculateAffiliateCommission("course", 0), {
    rate: 0.1,
    amount: 0,
  });
});

test("isUserAffiliateEligible unlocks only for buyers, members, internal/admin, or admin-granted CTV", () => {
  const freeStudent = { id: "u-free", role: "student", email: "free@gmail.com" };
  const paidBuyer = { id: "u-buyer", role: "student", email: "buyer@gmail.com" };
  const memberUser = { id: "u-mem", role: "student", email: "mem@gmail.com" };
  const grantedCtv = { id: "u-ctv", role: "student", email: "ctv@gmail.com", affiliateEnabled: true };
  const internalStaff = { id: "u-in", role: "internal", email: "in@ohana.vn" };
  const admin = { id: "u-adm", role: "admin", email: "admin@ohana.vn" };

  const orders = [
    { userId: "u-buyer", status: "paid", finalAmount: 6600000 },
    { userId: "u-free", status: "pending", finalAmount: 6600000 },
  ];
  const subscriptions = {
    "u-mem": { userId: "u-mem", expiresAt: "2026-12-28T00:00:00.000Z" },
  };

  assert.equal(isUserAffiliateEligible(freeStudent, orders, subscriptions), false);
  assert.equal(isUserAffiliateEligible(paidBuyer, orders, subscriptions), true);
  assert.equal(isUserAffiliateEligible(memberUser, orders, subscriptions), true);
  assert.equal(isUserAffiliateEligible(grantedCtv, orders, subscriptions), true);
  assert.equal(isUserAffiliateEligible(internalStaff, orders, subscriptions), true);
  assert.equal(isUserAffiliateEligible(admin, orders, subscriptions), true);
});

test("generateReferralCode creates clean ASCII uppercase code without Vietnamese accents", () => {
  const code = generateReferralCode("Võ Quốc Trí", "user-123456789");
  assert.match(code, /^OHA-[A-Z0-9]{4,14}$/);
});

test("resolveReferrerForOrder supports lifetime attribution and blocks self-referral", () => {
  const referrer = {
    id: "u-ref",
    name: "Nguyễn Đối Tác",
    email: "partner@gmail.com",
    role: "student",
    referralCode: "OHA-PARTNER1",
    affiliateEnabled: true,
  };
  const buyerNew = {
    id: "u-buyer-1",
    name: "Khách Mới",
    email: "buyer1@gmail.com",
    role: "student",
  };
  const buyerReturning = {
    id: "u-buyer-2",
    name: "Khách Gia Hạn",
    email: "buyer2@gmail.com",
    role: "student",
    referredByUserId: "u-ref",
  };
  const users = [referrer, buyerNew, buyerReturning];

  // First purchase via cookie code
  const r1 = resolveReferrerForOrder({
    buyer: buyerNew,
    explicitRefCode: "oha-partner1",
    users,
    orders: [],
    subscriptions: {},
  });
  assert.equal(r1?.id, "u-ref");

  // Recurring renewal without cookie still credits original referrer (lifetime)
  const r2 = resolveReferrerForOrder({
    buyer: buyerReturning,
    explicitRefCode: "",
    users,
    orders: [],
    subscriptions: {},
  });
  assert.equal(r2?.id, "u-ref");

  // Self-referral strictly blocked
  const rSelf = resolveReferrerForOrder({
    buyer: referrer,
    explicitRefCode: "OHA-PARTNER1",
    users,
    orders: [],
    subscriptions: {},
  });
  assert.equal(rSelf, null);
});

test("createCommissionForPaidOrder calculates accurately and is idempotent per orderCode", () => {
  const referrer = {
    id: "u-ref",
    name: "Nguyễn Đối Tác",
    email: "partner@gmail.com",
    phone: "0909111222",
    role: "student",
    referralCode: "OHA-PARTNER1",
    affiliateEnabled: true,
  };
  const memOrder = {
    orderCode: "OHANA555111",
    orderType: "membership",
    courseTitle: "Gói Hội Viên 3 Tháng (90 ngày)",
    userId: "u-buyer",
    customerName: "Trần Khách Hàng",
    customerEmail: "khach@gmail.com",
    finalAmount: 790000,
    status: "paid",
    referrerUserId: "u-ref",
    referralCode: "OHA-PARTNER1",
  };

  const c1 = createCommissionForPaidOrder({
    order: memOrder,
    referrer,
    existingCommissions: [],
    nowMs: FIXED_NOW,
  });
  assert.ok(c1);
  assert.equal(c1.commissionRate, 0.2);
  assert.equal(c1.commissionAmount, 158000);
  assert.equal(c1.status, "pending");

  // Duplicate webhook call for same orderCode must NOT duplicate commission
  const cDup = createCommissionForPaidOrder({
    order: memOrder,
    referrer,
    existingCommissions: [c1],
    nowMs: FIXED_NOW,
  });
  assert.equal(cDup, null);

  // Unpaid order creates no commission
  const cUnpaid = createCommissionForPaidOrder({
    order: { ...memOrder, orderCode: "OHANA555112", status: "pending" },
    referrer,
    existingCommissions: [],
    nowMs: FIXED_NOW,
  });
  assert.equal(cUnpaid, null);
});
