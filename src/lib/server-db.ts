import fs from "fs";
import path from "path";
import { hashPasswordWithSalt } from "@/lib/auth-crypto";
import { DEFAULT_INITIAL_COUPONS } from "@/lib/coupons";
import { DEFAULT_MEMBERSHIP_PLANS } from "@/lib/membership";
import { createInitialDatabase } from "@/lib/seed-data";
import {
  ensureSupabaseReady,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  ActivationCode,
  AffiliateCommission,
  AffiliatePayoutInfo,
  CertificateRecord,
  CouponRecord,
  Course,
  DiscountType,
  LMSDatabase,
  MembershipPlan,
  Order,
  UserRecord,
  UserRole,
  UserSubscription,
} from "@/types/lms";

export function createDefaultUsers(): UserRecord[] {
  const adminEmail = (
    process.env.ADMIN_EMAIL || "brian@astronixa.com"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "OhanaAdmin@2026";

  return [
    {
      id: "user-admin",
      name: "Brian Võ (Võ Quốc Trí)",
      email: adminEmail,
      phone: "0909888999",
      department: "Founder / Market Director — Astronixa Ohana",
      role: "admin",
      authProvider: "credentials",
      passwordHash: hashPasswordWithSalt(
        adminPassword,
        "a1b2c3d4e5f60718293a4b5c6d7e8f90"
      ),
      createdAt: "2026-10-01T08:00:00.000Z",
    },
    {
      id: "user-internal",
      name: "Lê Thanh Thảo (Team Trí)",
      email: "thao.le@ohana.vn",
      phone: "0912345678",
      department: "Khối Phát Triển Thị Trường — Ohana Career",
      role: "internal",
      authProvider: "credentials",
      passwordHash: hashPasswordWithSalt(
        "OhanaNoibo@2026",
        "11223344556677889900aabbccddeeff"
      ),
      createdAt: "2026-10-15T08:00:00.000Z",
    },
    {
      id: "user-student",
      name: "Trần Gia Huy",
      email: "giahuy.learner@gmail.com",
      phone: "0908668899",
      role: "student",
      authProvider: "credentials",
      passwordHash: hashPasswordWithSalt(
        "Hocvien@2026",
        "ffeeddccbbaa00998877665544332211"
      ),
      createdAt: "2026-11-01T08:00:00.000Z",
    },
  ];
}

function buildSeededDb(): LMSDatabase {
  const initial = createInitialDatabase();
  initial.users = createDefaultUsers();
  initial.coupons = DEFAULT_INITIAL_COUPONS.map((c) => ({ ...c }));
  return initial;
}

function resolveDbFilePath(): string {
  const localDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return path.join(localDir, "lms-db.json");
  } catch {
    return path.join("/tmp", "ohana-lms-db.json");
  }
}

function readLocalJsonDb(): LMSDatabase {
  const filePath = resolveDbFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      const initial = buildSeededDb();
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as LMSDatabase;
    let mutated = false;
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = createDefaultUsers();
      mutated = true;
    }
    if (!Array.isArray(parsed.coupons)) {
      parsed.coupons = DEFAULT_INITIAL_COUPONS.map((c) => ({ ...c }));
      mutated = true;
    }
    if (!Array.isArray(parsed.membershipPlans) || parsed.membershipPlans.length === 0) {
      parsed.membershipPlans = DEFAULT_MEMBERSHIP_PLANS.map((p) => ({ ...p }));
      mutated = true;
    }
    if (!parsed.subscriptions || typeof parsed.subscriptions !== "object") {
      parsed.subscriptions = {};
      mutated = true;
    }
    if (!Array.isArray(parsed.affiliateCommissions)) {
      parsed.affiliateCommissions = [];
      mutated = true;
    }
    if (mutated) {
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch {
    return buildSeededDb();
  }
}

function writeLocalJsonDb(db: LMSDatabase): LMSDatabase {
  const filePath = resolveDbFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Cannot persist local LMS DB:", err);
  }
  return db;
}

export async function readServerDb(): Promise<LMSDatabase> {
  if (!isSupabaseConfigured()) {
    return readLocalJsonDb();
  }

  try {
    await ensureSupabaseReady();
    const sb = getSupabaseAdmin();
    if (!sb) return readLocalJsonDb();

    const [
      usersRes,
      coursesRes,
      ordersRes,
      couponsRes,
      codesRes,
      certsRes,
      plansRes,
      subsRes,
      affRes,
      enrollRes,
      progRes,
      quizRes,
    ] = await Promise.all([
      sb.from("ohana_users").select("*").order("created_at", { ascending: true }),
      sb.from("ohana_courses").select("*").order("created_at", { ascending: false }),
      sb.from("ohana_orders").select("*").order("created_at", { ascending: false }),
      sb.from("ohana_coupons").select("*").order("created_at", { ascending: false }),
      sb.from("ohana_activation_codes").select("*").order("created_at", { ascending: false }),
      sb.from("ohana_certificates").select("*").order("issued_at", { ascending: false }),
      sb.from("ohana_membership_plans").select("*").order("sort_order", { ascending: true }),
      sb.from("ohana_subscriptions").select("*").order("expires_at", { ascending: false }),
      sb.from("ohana_affiliate_commissions").select("*").order("created_at", { ascending: false }),
      sb.from("ohana_enrollments").select("*"),
      sb.from("ohana_lesson_progress").select("*"),
      sb.from("ohana_quiz_scores").select("*"),
    ]);

    if (coursesRes.error || usersRes.error) {
      console.warn("Supabase read fallback to local:", coursesRes.error || usersRes.error);
      return readLocalJsonDb();
    }

    const coursesRows = coursesRes.data || [];
    const usersRows = usersRes.data || [];

    // Nếu Supabase vừa khởi tạo và chưa có dữ liệu mẫu -> tự động nạp dữ liệu Ohana ban đầu
    if (coursesRows.length === 0 && usersRows.length === 0) {
      const seeded = buildSeededDb();
      await writeServerDb(seeded);
      return seeded;
    }

    const users: UserRecord[] = usersRows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      phone: String(row.phone || ""),
      department: row.department ? String(row.department) : undefined,
      role: (row.role as UserRole) || "student",
      avatar: row.avatar ? String(row.avatar) : undefined,
      authProvider: (row.auth_provider as "credentials" | "google") || "credentials",
      googleSub: row.google_sub ? String(row.google_sub) : undefined,
      passwordHash: row.password_hash ? String(row.password_hash) : undefined,
      referralCode: row.referral_code ? String(row.referral_code) : undefined,
      referredByUserId: row.referred_by_user_id ? String(row.referred_by_user_id) : undefined,
      affiliateEnabled: Boolean(row.affiliate_enabled),
      affiliatePayout:
        row.affiliate_payout && typeof row.affiliate_payout === "object"
          ? (row.affiliate_payout as AffiliatePayoutInfo)
          : undefined,
      createdAt: String(row.created_at),
      lastLoginAt: row.last_login_at ? String(row.last_login_at) : undefined,
    }));

    const courses: Course[] = coursesRows.map((row) => row.data as Course);

    const orders: Order[] = (ordersRes.data || []).map((row) => ({
      orderCode: String(row.order_code),
      orderType: row.order_type === "membership" ? "membership" : "course",
      planId: row.plan_id ? String(row.plan_id) : undefined,
      durationDays:
        row.duration_days !== null && row.duration_days !== undefined
          ? Number(row.duration_days)
          : undefined,
      courseId: String(row.course_id),
      courseSlug: String(row.course_slug),
      courseTitle: String(row.course_title),
      userId: String(row.user_id),
      customerName: String(row.customer_name),
      customerEmail: String(row.customer_email),
      customerPhone: String(row.customer_phone || ""),
      originalAmount: Number(row.original_amount || 0),
      discountAmount: Number(row.discount_amount || 0),
      finalAmount: Number(row.final_amount || 0),
      couponCode: row.coupon_code ? String(row.coupon_code) : undefined,
      status: (row.status as Order["status"]) || "pending",
      paymentMethod: (row.payment_method as Order["paymentMethod"]) || "vietqr",
      transactionRef: row.transaction_ref ? String(row.transaction_ref) : undefined,
      referrerUserId: row.referrer_user_id ? String(row.referrer_user_id) : undefined,
      referralCode: row.referral_code ? String(row.referral_code) : undefined,
      createdAt: String(row.created_at),
      paidAt: row.paid_at ? String(row.paid_at) : undefined,
    }));

    const coupons: CouponRecord[] = (!couponsRes.error && couponsRes.data ? couponsRes.data : []).map((row) => ({
      code: String(row.code),
      label: String(row.label),
      discountType: (row.discount_type as DiscountType) === "percent" ? "percent" : "fixed",
      discountValue: Number(row.discount_value || 0),
      targetCourseId: String(row.target_course_id || "ALL"),
      maxUses: Number(row.max_uses ?? 100),
      usedCount: Number(row.used_count || 0),
      active: Boolean(row.active),
      expiresAt: row.expires_at ? String(row.expires_at) : undefined,
      createdAt: String(row.created_at),
    }));

    const activationCodes: ActivationCode[] = (codesRes.data || []).map((row) => ({
      code: String(row.code),
      label: String(row.label),
      targetCourseId: String(row.target_course_id),
      maxUses: Number(row.max_uses || 100),
      usedCount: Number(row.used_count || 0),
      active: Boolean(row.active),
      createdAt: String(row.created_at),
    }));

    const certificates: CertificateRecord[] = (certsRes.data || []).map((row) => ({
      code: String(row.code),
      courseId: String(row.course_id),
      courseSlug: String(row.course_slug),
      courseTitle: String(row.course_title),
      studentName: String(row.student_name),
      studentEmail: String(row.student_email),
      issuer: String(row.issuer),
      issuedAt: String(row.issued_at),
      quizScore: row.quiz_score !== null && row.quiz_score !== undefined ? Number(row.quiz_score) : undefined,
    }));

    const membershipPlans: MembershipPlan[] =
      !plansRes.error && plansRes.data
        ? plansRes.data.map((row) => ({
            id: String(row.id),
            name: String(row.name),
            subtitle: String(row.subtitle || ""),
            durationDays: Number(row.duration_days || 30),
            price: Number(row.price || 0),
            originalPrice:
              row.original_price !== null && row.original_price !== undefined
                ? Number(row.original_price)
                : undefined,
            badge: row.badge ? String(row.badge) : undefined,
            features: Array.isArray(row.features)
              ? row.features.map((f: unknown) => String(f))
              : [],
            active: Boolean(row.active),
            sortOrder: Number(row.sort_order ?? 1),
            createdAt: String(row.created_at),
          }))
        : DEFAULT_MEMBERSHIP_PLANS.map((p) => ({ ...p }));

    const subscriptions: Record<string, UserSubscription> = {};
    if (!subsRes.error && subsRes.data) {
      for (const row of subsRes.data) {
        const uid = String(row.user_id);
        subscriptions[uid] = {
          userId: uid,
          planId: String(row.plan_id),
          planName: String(row.plan_name),
          startedAt: String(row.started_at),
          expiresAt: String(row.expires_at),
          lastOrderCode: row.last_order_code ? String(row.last_order_code) : undefined,
          updatedAt: String(row.updated_at),
        };
      }
    }

    const affiliateCommissions: AffiliateCommission[] =
      !affRes.error && affRes.data
        ? affRes.data.map((row) => ({
            id: String(row.id),
            orderCode: String(row.order_code),
            orderType: row.order_type === "membership" ? "membership" : "course",
            itemTitle: String(row.item_title || ""),
            orderAmount: Number(row.order_amount || 0),
            commissionRate: Number(row.commission_rate || 0.1),
            commissionAmount: Number(row.commission_amount || 0),
            referrerUserId: String(row.referrer_user_id),
            referrerName: String(row.referrer_name || ""),
            referrerEmail: String(row.referrer_email || ""),
            referrerPhone: String(row.referrer_phone || ""),
            referralCode: String(row.referral_code || ""),
            buyerUserId: String(row.buyer_user_id),
            buyerName: String(row.buyer_name || ""),
            buyerEmail: String(row.buyer_email || ""),
            status: (row.status as AffiliateCommission["status"]) || "pending",
            payoutNote: row.payout_note ? String(row.payout_note) : undefined,
            createdAt: String(row.created_at),
            paidAt: row.paid_at ? String(row.paid_at) : undefined,
          }))
        : [];

    const enrollments: Record<string, string[]> = {};
    for (const row of enrollRes.data || []) {
      const uid = String(row.user_id);
      const cid = String(row.course_id);
      if (!enrollments[uid]) enrollments[uid] = [];
      if (!enrollments[uid].includes(cid)) enrollments[uid].push(cid);
    }

    const progress: Record<string, Record<string, string[]>> = {};
    for (const row of progRes.data || []) {
      const uid = String(row.user_id);
      const cid = String(row.course_id);
      const lid = String(row.lesson_id);
      if (!progress[uid]) progress[uid] = {};
      if (!progress[uid][cid]) progress[uid][cid] = [];
      if (!progress[uid][cid].includes(lid)) progress[uid][cid].push(lid);
    }

    const quizScores: Record<string, Record<string, number>> = {};
    for (const row of quizRes.data || []) {
      const uid = String(row.user_id);
      const lid = String(row.lesson_id);
      if (!quizScores[uid]) quizScores[uid] = {};
      quizScores[uid][lid] = Number(row.best_score || 0);
    }

    return {
      users,
      courses,
      orders,
      coupons,
      activationCodes,
      certificates,
      membershipPlans,
      subscriptions,
      affiliateCommissions,
      enrollments,
      progress,
      quizScores,
    };
  } catch (err) {
    console.warn("Supabase read error, falling back to local:", err);
    return readLocalJsonDb();
  }
}

export async function writeServerDb(db: LMSDatabase): Promise<LMSDatabase> {
  if (!isSupabaseConfigured()) {
    return writeLocalJsonDb(db);
  }

  try {
    await ensureSupabaseReady();
    const sb = getSupabaseAdmin();
    if (!sb) return writeLocalJsonDb(db);

    if (db.users.length > 0) {
      await sb.from("ohana_users").upsert(
        db.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email.toLowerCase(),
          phone: u.phone || "",
          department: u.department || null,
          role: u.role,
          avatar: u.avatar || null,
          auth_provider: u.authProvider || "credentials",
          google_sub: u.googleSub || null,
          password_hash: u.passwordHash || null,
          referral_code: u.referralCode || null,
          referred_by_user_id: u.referredByUserId || null,
          affiliate_enabled: Boolean(u.affiliateEnabled),
          affiliate_payout: u.affiliatePayout || null,
          created_at: u.createdAt,
          last_login_at: u.lastLoginAt || null,
        })),
        { onConflict: "id" }
      );
    }

    const existingCourseIds = (
      await sb.from("ohana_courses").select("id")
    ).data?.map((r) => String(r.id)) || [];
    const currentCourseIds = new Set(db.courses.map((c) => c.id));
    const deletedCourseIds = existingCourseIds.filter(
      (id) => !currentCourseIds.has(id)
    );
    if (deletedCourseIds.length > 0) {
      await sb.from("ohana_courses").delete().in("id", deletedCourseIds);
    }
    if (db.courses.length > 0) {
      await sb.from("ohana_courses").upsert(
        db.courses.map((c) => ({
          id: c.id,
          slug: c.slug,
          data: c,
          created_at: c.createdAt,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" }
      );
    }

    if (db.orders.length > 0) {
      await sb.from("ohana_orders").upsert(
        db.orders.map((o) => ({
          order_code: o.orderCode,
          order_type: o.orderType || "course",
          plan_id: o.planId || null,
          duration_days: o.durationDays ?? null,
          course_id: o.courseId,
          course_slug: o.courseSlug,
          course_title: o.courseTitle,
          user_id: o.userId,
          customer_name: o.customerName,
          customer_email: o.customerEmail,
          customer_phone: o.customerPhone || "",
          original_amount: o.originalAmount,
          discount_amount: o.discountAmount,
          final_amount: o.finalAmount,
          coupon_code: o.couponCode || null,
          status: o.status,
          payment_method: o.paymentMethod,
          transaction_ref: o.transactionRef || null,
          referrer_user_id: o.referrerUserId || null,
          referral_code: o.referralCode || null,
          created_at: o.createdAt,
          paid_at: o.paidAt || null,
        })),
        { onConflict: "order_code" }
      );
    }

    const existingCouponCodes = (
      await sb.from("ohana_coupons").select("code")
    ).data?.map((r) => String(r.code)) || [];
    const currentCouponCodes = new Set((db.coupons || []).map((c) => c.code));
    const deletedCouponCodes = existingCouponCodes.filter(
      (code) => !currentCouponCodes.has(code)
    );
    if (deletedCouponCodes.length > 0) {
      await sb.from("ohana_coupons").delete().in("code", deletedCouponCodes);
    }
    if ((db.coupons || []).length > 0) {
      await sb.from("ohana_coupons").upsert(
        (db.coupons || []).map((c) => ({
          code: c.code,
          label: c.label,
          discount_type: c.discountType,
          discount_value: c.discountValue,
          target_course_id: c.targetCourseId || "ALL",
          max_uses: c.maxUses,
          used_count: c.usedCount,
          active: c.active,
          expires_at: c.expiresAt || null,
          created_at: c.createdAt,
        })),
        { onConflict: "code" }
      );
    }

    if (db.activationCodes.length > 0) {
      await sb.from("ohana_activation_codes").upsert(
        db.activationCodes.map((ac) => ({
          code: ac.code,
          label: ac.label,
          target_course_id: ac.targetCourseId,
          max_uses: ac.maxUses,
          used_count: ac.usedCount,
          active: ac.active,
          created_at: ac.createdAt,
        })),
        { onConflict: "code" }
      );
    }

    if (db.certificates.length > 0) {
      await sb.from("ohana_certificates").upsert(
        db.certificates.map((c) => ({
          code: c.code,
          course_id: c.courseId,
          course_slug: c.courseSlug,
          course_title: c.courseTitle,
          student_name: c.studentName,
          student_email: c.studentEmail,
          issuer: c.issuer,
          issued_at: c.issuedAt,
          quiz_score: c.quizScore ?? null,
        })),
        { onConflict: "code" }
      );
    }

    const existingPlanIds =
      (await sb.from("ohana_membership_plans").select("id")).data?.map((r) =>
        String(r.id)
      ) || [];
    const currentPlanIds = new Set((db.membershipPlans || []).map((p) => p.id));
    const deletedPlanIds = existingPlanIds.filter((id) => !currentPlanIds.has(id));
    if (deletedPlanIds.length > 0) {
      await sb.from("ohana_membership_plans").delete().in("id", deletedPlanIds);
    }
    if ((db.membershipPlans || []).length > 0) {
      await sb.from("ohana_membership_plans").upsert(
        (db.membershipPlans || []).map((p) => ({
          id: p.id,
          name: p.name,
          subtitle: p.subtitle || "",
          duration_days: p.durationDays,
          price: p.price,
          original_price: p.originalPrice ?? null,
          badge: p.badge || null,
          features: p.features || [],
          active: p.active,
          sort_order: p.sortOrder ?? 1,
          created_at: p.createdAt,
        })),
        { onConflict: "id" }
      );
    }

    const subRows = Object.values(db.subscriptions || {}).map((s) => ({
      user_id: s.userId,
      plan_id: s.planId,
      plan_name: s.planName,
      started_at: s.startedAt,
      expires_at: s.expiresAt,
      last_order_code: s.lastOrderCode || null,
      updated_at: s.updatedAt || new Date().toISOString(),
    }));
    if (subRows.length > 0) {
      await sb
        .from("ohana_subscriptions")
        .upsert(subRows, { onConflict: "user_id" });
    }

    if ((db.affiliateCommissions || []).length > 0) {
      await sb.from("ohana_affiliate_commissions").upsert(
        (db.affiliateCommissions || []).map((c) => ({
          id: c.id,
          order_code: c.orderCode,
          order_type: c.orderType,
          item_title: c.itemTitle,
          order_amount: c.orderAmount,
          commission_rate: c.commissionRate,
          commission_amount: c.commissionAmount,
          referrer_user_id: c.referrerUserId,
          referrer_name: c.referrerName,
          referrer_email: c.referrerEmail,
          referrer_phone: c.referrerPhone || "",
          referral_code: c.referralCode,
          buyer_user_id: c.buyerUserId,
          buyer_name: c.buyerName,
          buyer_email: c.buyerEmail,
          status: c.status,
          payout_note: c.payoutNote || null,
          created_at: c.createdAt,
          paid_at: c.paidAt || null,
        })),
        { onConflict: "order_code" }
      );
    }

    const enrollmentRows: { user_id: string; course_id: string }[] = [];
    for (const [uid, cids] of Object.entries(db.enrollments)) {
      for (const cid of cids) {
        enrollmentRows.push({ user_id: uid, course_id: cid });
      }
    }
    if (enrollmentRows.length > 0) {
      await sb
        .from("ohana_enrollments")
        .upsert(enrollmentRows, { onConflict: "user_id,course_id" });
    }

    // Đồng bộ progress (xóa các bài đã bỏ chọn + thêm các bài mới hoàn thành)
    for (const [uid, courseMap] of Object.entries(db.progress)) {
      for (const [cid, lessonIds] of Object.entries(courseMap)) {
        await sb
          .from("ohana_lesson_progress")
          .delete()
          .eq("user_id", uid)
          .eq("course_id", cid);
        if (lessonIds.length > 0) {
          await sb.from("ohana_lesson_progress").upsert(
            lessonIds.map((lid) => ({
              user_id: uid,
              course_id: cid,
              lesson_id: lid,
            })),
            { onConflict: "user_id,course_id,lesson_id" }
          );
        }
      }
    }

    const quizRows: { user_id: string; lesson_id: string; best_score: number }[] = [];
    for (const [uid, lessonMap] of Object.entries(db.quizScores)) {
      for (const [lid, score] of Object.entries(lessonMap)) {
        quizRows.push({ user_id: uid, lesson_id: lid, best_score: score });
      }
    }
    if (quizRows.length > 0) {
      await sb
        .from("ohana_quiz_scores")
        .upsert(quizRows, { onConflict: "user_id,lesson_id" });
    }
  } catch (err) {
    console.warn("Supabase write error:", err);
  }

  return db;
}
