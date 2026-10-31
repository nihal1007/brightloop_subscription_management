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
    const { productCode, name, description, productType = "SERVICE", salesPrice, costPrice = "0.00" } = body;

    if (!productCode || !name || salesPrice === undefined) {
      return NextResponse.json(
        { error: "Product code, name, and sales price are required." },
        { status: 400 }
      );
    }

    const price = new Decimal(salesPrice);
    if (price.isNaN() || price.lessThan(0)) {
      return NextResponse.json({ error: "Sales price must be a non-negative number." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        productCode: productCode.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        productType,
        salesPrice: price,
        costPrice: new Decimal(costPrice || 0),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Product creation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
