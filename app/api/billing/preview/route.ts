import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireStaffOrAdmin } from "@/lib/permissions/rbac";
import { previewDueBilling } from "@/services/billing-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const guard = requireStaffOrAdmin(user);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error }, { status: guard.statusCode || 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("targetDate");
    const asOfDate = dateParam ? new Date(dateParam) : new Date();

    const previews = await previewDueBilling(asOfDate);
    return NextResponse.json({ previews });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Preview failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
