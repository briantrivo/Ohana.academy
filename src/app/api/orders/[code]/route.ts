import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { readServerDb } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { code } = await context.params;
  const db = await readServerDb();
  const order = db.orders.find(
    (o) => o.orderCode.toUpperCase() === code.toUpperCase()
  );

  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  }

  if (order.userId !== authUser.id && authUser.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền xem đơn hàng này." }, { status: 403 });
  }

  return NextResponse.json({
    order,
    isPaid: order.status === "paid",
  });
}
