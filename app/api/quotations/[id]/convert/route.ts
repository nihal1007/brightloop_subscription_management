import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireStaffOrAdmin } from "@/lib/permissions/rbac";
import { convertQuotationToSubscription } from "@/services/subscription-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const guard = requireStaffOrAdmin(user);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error }, { status: guard.statusCode || 403 });
    }

    const subscription = await convertQuotationToSubscription(params.id, user?.id);
    return NextResponse.json({ success: true, subscription });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Conversion failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
