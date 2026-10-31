import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireStaffOrAdmin } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const guard = requireStaffOrAdmin(user);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error }, { status: guard.statusCode || 403 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      planCode,
      name,
      description,
      billingInterval = "MONTHLY",
      billingIntervalCount = 1,
      basePrice,
      allowPause = true,
      allowEarlyCancel = true,
      productIds = [],
    } = body;

    if (!planCode || !name || basePrice === undefined) {
      return NextResponse.json(
        { error: "Plan code, name, and base price are required." },
        { status: 400 }
      );
    }

    const price = new Decimal(basePrice);
    if (price.isNaN() || price.lessThan(0)) {
      return NextResponse.json({ error: "Base price must be a non-negative number." }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        planCode: planCode.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        billingInterval,
        billingIntervalCount: Number(billingIntervalCount) || 1,
        basePrice: price,
        allowPause: Boolean(allowPause),
        allowEarlyCancel: Boolean(allowEarlyCancel),
        planProducts: {
          create: productIds.map((pId: string) => ({
            productId: pId,
            defaultQuantity: 1,
          })),
        },
      },
      include: {
        planProducts: { include: { product: true } },
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Plan creation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
