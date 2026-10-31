import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireStaffOrAdmin } from "@/lib/permissions/rbac";
import { executeRecurringBillingBatch, billSubscriptionPeriod } from "@/services/billing-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const guard = requireStaffOrAdmin(user);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error }, { status: guard.statusCode || 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { subscriptionId, targetDate } = body;

    const asOfDate = targetDate ? new Date(targetDate) : new Date();

    if (subscriptionId) {
      const result = await billSubscriptionPeriod(subscriptionId, asOfDate);
      return NextResponse.json(result);
    }

    const batchSummary = await executeRecurringBillingBatch(asOfDate);
    return NextResponse.json(batchSummary);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Billing execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
