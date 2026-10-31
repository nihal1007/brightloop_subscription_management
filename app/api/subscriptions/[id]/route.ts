import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAuth, requireStaffOrAdmin, requireOwnershipOrStaff } from "@/lib/permissions/rbac";
import {
  pauseSubscription,
  resumeSubscription,
  closeSubscription,
  requestCancellation,
} from "@/services/subscription-service";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const authCheck = requireAuth(user);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.statusCode || 401 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, reason } = body;

    // Handle customer cancellation request with customer ownership guard
    if (action === "request_cancel") {
      const ownershipCheck = requireOwnershipOrStaff(user, sub.customerId);
      if (!ownershipCheck.allowed) {
        return NextResponse.json(
          { error: ownershipCheck.error },
          { status: ownershipCheck.statusCode || 403 }
        );
      }

      const updated = await requestCancellation(
        params.id,
        reason || "Cancellation requested via portal",
        user?.id
      );
      return NextResponse.json({ success: true, subscription: updated });
    }

    // Administrative lifecycle actions require staff or admin privileges
    const staffGuard = requireStaffOrAdmin(user);
    if (!staffGuard.allowed) {
      return NextResponse.json(
        { error: staffGuard.error },
        { status: staffGuard.statusCode || 403 }
      );
    }

    if (action === "pause") {
      const updated = await pauseSubscription(params.id, user?.id);
      return NextResponse.json({ success: true, subscription: updated });
    } else if (action === "resume") {
      const updated = await resumeSubscription(params.id, user?.id);
      return NextResponse.json({ success: true, subscription: updated });
    } else if (action === "close") {
      const updated = await closeSubscription(params.id, reason || "Closed by staff", user?.id);
      return NextResponse.json({ success: true, subscription: updated });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Subscription update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
