import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireStaffOrAdmin } from "@/lib/permissions/rbac";
import { recordPayment } from "@/services/payment-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const guard = requireStaffOrAdmin(user);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error }, { status: guard.statusCode || 403 });
    }

    const body = await req.json().catch(() => ({}));

    if (!body?.invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required." }, { status: 400 });
    }

    if (body?.amount === undefined || body?.amount === null || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      return NextResponse.json({ error: "A valid positive payment amount is required." }, { status: 400 });
    }

    const payment = await recordPayment({
      invoiceId: body.invoiceId,
      amount: body.amount,
      paymentMethod: body.paymentMethod || "BANK_TRANSFER",
      externalReference: body.externalReference,
      notes: body.notes,
      recordedByUserId: user?.id,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment recording failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
