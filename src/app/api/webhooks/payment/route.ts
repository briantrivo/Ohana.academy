import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { readServerDb, writeServerDb } from "@/lib/server-db";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Webhook Thanh Toán Tự Động VietQR (Tương thích chuẩn SePay, PayOS & Casso)
 * - SePay gửi: { transferType: "in", content: "...", transferAmount: 6600000, referenceCode: "FT..." }
 * - PayOS gửi: { data: { description: "...", amount: 6600000, reference: "..." } }
 * - Casso gửi: { data: [{ description: "...", amount: 6600000, tid: "..." }] }
 */
export async function POST(req: NextRequest) {
  try {
    const configuredSecret = (process.env.PAYMENT_WEBHOOK_SECRET || "").trim();
    if (configuredSecret) {
      const authHeader = (req.headers.get("authorization") || "").trim();
      const tokenHeader = (req.headers.get("secure-token") || "").trim();
      const strippedAuth = authHeader.replace(/^(Apikey|Bearer)\s+/i, "").trim();
      const isAuthorized =
        (strippedAuth.length > 0 && safeEqual(strippedAuth, configuredSecret)) ||
        (tokenHeader.length > 0 && safeEqual(tokenHeader, configuredSecret));
      if (!isAuthorized) {
        return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
      }
    }

    const payload = await req.json();

    // Chuẩn hóa danh sách giao dịch từ SePay / PayOS / Casso
    const transactions: { content: string; amount: number; ref: string }[] = [];

    if (Array.isArray(payload?.data)) {
      // Định dạng Casso
      for (const tx of payload.data) {
        transactions.push({
          content: String(tx.description || tx.content || ""),
          amount: Number(tx.amount || 0),
          ref: String(tx.tid || tx.id || "CASSO-TX"),
        });
      }
    } else if (payload?.data && typeof payload.data === "object") {
      // Định dạng PayOS
      transactions.push({
        content: String(payload.data.description || payload.data.orderCode || ""),
        amount: Number(payload.data.amount || 0),
        ref: String(payload.data.reference || payload.data.paymentLinkId || "PAYOS-TX"),
      });
    } else {
      // Định dạng SePay (chỉ xử lý tiền vào nếu có transferType)
      const transferType = String(payload?.transferType || "in").toLowerCase();
      if (transferType !== "out") {
        transactions.push({
          content: String(payload.content || payload.description || payload.orderCode || ""),
          amount: Number(payload.transferAmount ?? payload.amount ?? 0),
          ref: String(payload.referenceCode || payload.id || `VIETQR-${Date.now()}`),
        });
      }
    }

    const db = await readServerDb();
    const matchedOrders: string[] = [];

    for (const tx of transactions) {
      const match = tx.content.toUpperCase().match(/OHANA\d{6}/);
      if (!match) continue;
      const orderCode = match[0];

      const order = db.orders.find(
        (o) => o.orderCode.toUpperCase() === orderCode
      );
      if (!order) continue;

      if (order.status !== "paid" && tx.amount >= order.finalAmount) {
        order.status = "paid";
        order.paidAt = new Date().toISOString();
        order.transactionRef = tx.ref;

        if (!db.enrollments[order.userId]) {
          db.enrollments[order.userId] = [];
        }
        if (!db.enrollments[order.userId].includes(order.courseId)) {
          db.enrollments[order.userId].push(order.courseId);
          const course = db.courses.find((c) => c.id === order.courseId);
          if (course) course.studentsCount += 1;
        }
        matchedOrders.push(order.orderCode);
      }
    }

    if (matchedOrders.length > 0) {
      await writeServerDb(db);
    }

    return NextResponse.json({
      success: true,
      matchedOrders,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook processing failed: " + String(err) },
      { status: 500 }
    );
  }
}
