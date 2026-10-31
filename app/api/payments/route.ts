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

    const body = await req.json();
    const payment = await recordPayment({
      invoiceId: body.invoiceId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
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
