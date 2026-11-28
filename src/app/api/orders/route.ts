import { NextRequest, NextResponse } from "next/server";
import {
  AFFILIATE_COOKIE_NAME,
  createCommissionForPaidOrder,
  generateReferralCode,
  resolveReferrerForOrder,
} from "@/lib/affiliate";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { evaluateCoupon } from "@/lib/coupons";
import {
  canAccessCourseWithMembership,
  computeExtendedExpiry,
} from "@/lib/membership";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import { ActivationCode, CertificateRecord, Course, LMSDatabase, Order, UserProfile } from "@/types/lms";

function userCanAccessCourse(
  db: LMSDatabase,
  user: UserProfile,
  course: Course
): boolean {
  return canAccessCourseWithMembership(
    course,
    user,
    db.enrollments[user.id] || [],
    db.subscriptions?.[user.id]
  );
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập tài khoản trước khi tạo đơn hàng VietQR." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      orderType,
      planId,
      courseId,
      customerName,
      customerEmail,
      customerPhone,
      couponCode,
    } = body;

    const db = await readServerDb();
    db.affiliateCommissions = db.affiliateCommissions || [];
    const buyerRecord = db.users.find((u) => u.id === authUser.id);
    const cookieRef = req.cookies.get(AFFILIATE_COOKIE_NAME)?.value || "";
    const explicitRefCode = String(body.referralCode || cookieRef || "").trim();
    const matchedReferrer = buyerRecord
      ? resolveReferrerForOrder({
          buyer: buyerRecord,
          explicitRefCode,
          users: db.users,
          orders: db.orders || [],
          subscriptions: db.subscriptions || {},
        })
      : null;
    if (matchedReferrer && buyerRecord && !buyerRecord.referredByUserId) {
      buyerRecord.referredByUserId = matchedReferrer.id;
    }

    const isMembershipOrder = orderType === "membership" || Boolean(planId);

    if (isMembershipOrder) {
      const plan = (db.membershipPlans || []).find(
        (p) => p.id === planId && p.active
      );
      if (!plan) {
        return NextResponse.json(
          { error: "Gói Hội viên không tồn tại hoặc đang tạm ngưng." },
          { status: 404 }
        );
      }

      let discountAmount = 0;
      let appliedCouponCode: string | undefined;
      const normalizedCoupon = String(couponCode || "").trim().toUpperCase();
      if (normalizedCoupon) {
        const evaluation = evaluateCoupon(
          db.coupons || [],
          normalizedCoupon,
          `membership:${plan.id}`,
          plan.price
        );
        if (!evaluation.valid) {
          return NextResponse.json({ error: evaluation.error }, { status: 400 });
        }
        discountAmount = evaluation.discountAmount;
        appliedCouponCode = evaluation.coupon.code;
      }

      const finalAmount = Math.max(0, plan.price - discountAmount);
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const orderCode = `OHANA${randomDigits}`;

      const newOrder: Order = {
        orderCode,
        orderType: "membership",
        planId: plan.id,
        durationDays: plan.durationDays,
        courseId: `membership:${plan.id}`,
        courseSlug: "membership",
        courseTitle: `${plan.name} (${plan.durationDays} ngày)`,
        userId: authUser.id,
        customerName: String(customerName || authUser.name).trim(),
        customerEmail: String(customerEmail || authUser.email).trim(),
        customerPhone: String(customerPhone || authUser.phone || "").trim(),
        originalAmount: plan.price,
        discountAmount,
        finalAmount,
        couponCode: appliedCouponCode,
        status: finalAmount === 0 ? "paid" : "pending",
        paymentMethod: "vietqr",
        referrerUserId: matchedReferrer?.id,
        referralCode: matchedReferrer?.referralCode,
        createdAt: new Date().toISOString(),
        paidAt: finalAmount === 0 ? new Date().toISOString() : undefined,
      };

      db.orders.unshift(newOrder);

      if (finalAmount === 0) {
        if (appliedCouponCode) {
          const usedCoupon = (db.coupons || []).find(
            (c) => c.code.toUpperCase() === appliedCouponCode
          );
          if (usedCoupon) usedCoupon.usedCount += 1;
        }
        db.subscriptions = db.subscriptions || {};
        const prevSub = db.subscriptions[authUser.id];
        const extended = computeExtendedExpiry(prevSub?.expiresAt, plan.durationDays);
        db.subscriptions[authUser.id] = {
          userId: authUser.id,
          planId: plan.id,
          planName: plan.name,
          startedAt: prevSub?.startedAt || extended.startedAt,
          expiresAt: extended.expiresAt,
          lastOrderCode: orderCode,
          updatedAt: new Date().toISOString(),
        };
      }

      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        order: newOrder,
        db: buildClientStateView(db, authUser),
      });
    }

    const course = db.courses.find((c) => c.id === courseId);
    if (!course) {
      return NextResponse.json({ error: "Không tìm thấy khóa học." }, { status: 404 });
    }

    let discountAmount = 0;
    let appliedCouponCode: string | undefined;
    const normalizedCoupon = String(couponCode || "").trim().toUpperCase();
    if (normalizedCoupon) {
      const evaluation = evaluateCoupon(
        db.coupons || [],
        normalizedCoupon,
        course.id,
        course.price
      );
      if (!evaluation.valid) {
        return NextResponse.json({ error: evaluation.error }, { status: 400 });
      }
      discountAmount = evaluation.discountAmount;
      appliedCouponCode = evaluation.coupon.code;
    }

    const finalAmount = Math.max(0, course.price - discountAmount);
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderCode = `OHANA${randomDigits}`;

    const newOrder: Order = {
      orderCode,
      orderType: "course",
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      userId: authUser.id,
      customerName: String(customerName || authUser.name).trim(),
      customerEmail: String(customerEmail || authUser.email).trim(),
      customerPhone: String(customerPhone || authUser.phone || "").trim(),
      originalAmount: course.price,
      discountAmount,
      finalAmount,
      couponCode: appliedCouponCode,
      status: finalAmount === 0 ? "paid" : "pending",
      paymentMethod: "vietqr",
      referrerUserId: matchedReferrer?.id,
      referralCode: matchedReferrer?.referralCode,
      createdAt: new Date().toISOString(),
      paidAt: finalAmount === 0 ? new Date().toISOString() : undefined,
    };

    db.orders.unshift(newOrder);

    if (finalAmount === 0) {
      if (appliedCouponCode) {
        const usedCoupon = (db.coupons || []).find(
          (c) => c.code.toUpperCase() === appliedCouponCode
        );
        if (usedCoupon) usedCoupon.usedCount += 1;
      }
      if (!db.enrollments[authUser.id]) db.enrollments[authUser.id] = [];
      if (!db.enrollments[authUser.id].includes(course.id)) {
        db.enrollments[authUser.id].push(course.id);
      }
      course.studentsCount += 1;
    }

    await writeServerDb(db);
    return NextResponse.json({
      success: true,
      order: newOrder,
      db: buildClientStateView(db, authUser),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi tạo đơn hàng: " + String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json(
      { error: "Bạn cần đăng nhập để thực hiện thao tác này." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;
    const db = await readServerDb();

    if (action === "approve_order") {
      if (authUser.role !== "admin") {
        return NextResponse.json(
          { error: "Chỉ Quản trị viên mới có quyền duyệt đơn hàng." },
          { status: 403 }
        );
      }
      const { orderCode, transactionRef } = body;
      const order = db.orders.find((o) => o.orderCode === orderCode);
      if (!order) {
        return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
      }
      const wasAlreadyPaid = order.status === "paid";
      order.status = "paid";
      order.paidAt = new Date().toISOString();
      order.transactionRef = transactionRef || `Admin (${authUser.name}) duyệt`;
      if (!wasAlreadyPaid && order.couponCode) {
        const usedCoupon = (db.coupons || []).find(
          (c) => c.code.toUpperCase() === order.couponCode!.toUpperCase()
        );
        if (usedCoupon) usedCoupon.usedCount += 1;
      }
      if (order.orderType === "membership") {
        if (!wasAlreadyPaid) {
          db.subscriptions = db.subscriptions || {};
          const prevSub = db.subscriptions[order.userId];
          const days = order.durationDays || 30;
          const extended = computeExtendedExpiry(prevSub?.expiresAt, days);
          db.subscriptions[order.userId] = {
            userId: order.userId,
            planId: order.planId || "plan-monthly",
            planName: order.courseTitle,
            startedAt: prevSub?.startedAt || extended.startedAt,
            expiresAt: extended.expiresAt,
            lastOrderCode: order.orderCode,
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        if (!db.enrollments[order.userId]) db.enrollments[order.userId] = [];
        if (!db.enrollments[order.userId].includes(order.courseId)) {
          db.enrollments[order.userId].push(order.courseId);
          const c = db.courses.find((item) => item.id === order.courseId);
          if (c) c.studentsCount += 1;
        }
      }
      if (!wasAlreadyPaid) {
        const buyer = db.users.find((u) => u.id === order.userId);
        if (buyer && !buyer.referralCode) {
          buyer.referralCode = generateReferralCode(buyer.name, buyer.id);
        }
        const refUid = order.referrerUserId || buyer?.referredByUserId;
        const referrer = refUid
          ? db.users.find((u) => u.id === refUid)
          : undefined;
        db.affiliateCommissions = db.affiliateCommissions || [];
        const commission = createCommissionForPaidOrder({
          order,
          referrer,
          existingCommissions: db.affiliateCommissions,
        });
        if (commission) {
          db.affiliateCommissions.unshift(commission);
        }
      }
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        order,
        db: buildClientStateView(db, authUser),
      });
    }

    if (action === "create_code") {
      if (authUser.role !== "admin") {
        return NextResponse.json(
          { error: "Chỉ Quản trị viên mới có quyền phát hành mã kích hoạt." },
          { status: 403 }
        );
      }
      const { code, label, targetCourseId, maxUses } = body;
      const cleanCode = String(code || "").trim().toUpperCase();
      if (!cleanCode) {
        return NextResponse.json({ error: "Mã kích hoạt không hợp lệ" }, { status: 400 });
      }
      const newCode: ActivationCode = {
        code: cleanCode,
        label: label || "Mã kích hoạt Ohana",
        targetCourseId: targetCourseId || "ALL_INTERNAL",
        maxUses: Number(maxUses || 100),
        usedCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
      };
      db.activationCodes = db.activationCodes.filter((c) => c.code !== cleanCode);
      db.activationCodes.unshift(newCode);
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        activationCode: newCode,
        db: buildClientStateView(db, authUser),
      });
    }

    if (action === "enroll_free") {
      const { courseId } = body;
      const course = db.courses.find((c) => c.id === courseId);
      if (!course || course.accessType !== "free") {
        return NextResponse.json(
          { error: "Khóa học này không thuộc diện mở khóa miễn phí trực tiếp." },
          { status: 400 }
        );
      }
      if (!db.enrollments[authUser.id]) db.enrollments[authUser.id] = [];
      if (!db.enrollments[authUser.id].includes(courseId)) {
        db.enrollments[authUser.id].push(courseId);
        course.studentsCount += 1;
      }
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        db: buildClientStateView(db, authUser),
      });
    }

    if (action === "toggle_lesson") {
      const { courseId, lessonId, completed } = body;
      const course = db.courses.find((c) => c.id === courseId);
      if (!course || !userCanAccessCourse(db, authUser, course)) {
        return NextResponse.json(
          { error: "Bạn chưa kích hoạt khóa học này." },
          { status: 403 }
        );
      }
      if (!db.progress[authUser.id]) db.progress[authUser.id] = {};
      if (!db.progress[authUser.id][courseId]) {
        db.progress[authUser.id][courseId] = [];
      }
      const list = db.progress[authUser.id][courseId];
      if (completed && !list.includes(lessonId)) {
        list.push(lessonId);
      } else if (!completed) {
        db.progress[authUser.id][courseId] = list.filter((id) => id !== lessonId);
      }
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        db: buildClientStateView(db, authUser),
      });
    }

    if (action === "save_quiz") {
      const { courseId, lessonId, scorePercent } = body;
      const course = db.courses.find((c) => c.id === courseId);
      if (!course || !userCanAccessCourse(db, authUser, course)) {
        return NextResponse.json(
          { error: "Bạn chưa kích hoạt khóa học này." },
          { status: 403 }
        );
      }
      if (!db.quizScores[authUser.id]) db.quizScores[authUser.id] = {};
      const prev = db.quizScores[authUser.id][lessonId] || 0;
      db.quizScores[authUser.id][lessonId] = Math.max(prev, Number(scorePercent));

      if (scorePercent >= 80) {
        if (!db.progress[authUser.id]) db.progress[authUser.id] = {};
        if (!db.progress[authUser.id][courseId]) {
          db.progress[authUser.id][courseId] = [];
        }
        if (!db.progress[authUser.id][courseId].includes(lessonId)) {
          db.progress[authUser.id][courseId].push(lessonId);
        }
      }
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        db: buildClientStateView(db, authUser),
      });
    }

    if (action === "issue_certificate") {
      const { courseId, quizScore } = body;
      const course = db.courses.find((c) => c.id === courseId);
      if (!course || !userCanAccessCourse(db, authUser, course)) {
        return NextResponse.json(
          { error: "Bạn chưa đủ điều kiện cấp chứng chỉ khóa học này." },
          { status: 403 }
        );
      }
      const existing = db.certificates.find(
        (cert) =>
          cert.courseId === courseId &&
          cert.studentEmail.toLowerCase() === authUser.email.toLowerCase()
      );
      if (existing) {
        return NextResponse.json({
          success: true,
          certificate: existing,
          db: buildClientStateView(db, authUser),
        });
      }
      const code = `CERT-OHANA-${Math.floor(100000 + Math.random() * 900000)}`;
      const cert: CertificateRecord = {
        code,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        studentName: authUser.name,
        studentEmail: authUser.email,
        issuer: course.certificateIssuer,
        issuedAt: new Date().toISOString(),
        quizScore,
      };
      db.certificates.unshift(cert);
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        certificate: cert,
        db: buildClientStateView(db, authUser),
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
