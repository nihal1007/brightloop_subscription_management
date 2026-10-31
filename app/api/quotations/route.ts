import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireStaffOrAdmin } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { calculateDocumentTotals } from "@/lib/calculations/financial";
import { addDays } from "date-fns";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const guard = requireStaffOrAdmin(user);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error }, { status: guard.statusCode || 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { customerId, planId, lines = [], paymentTerms = "Immediate", notes } = body;

    if (!customerId || !lines || lines.length === 0) {
      return NextResponse.json(
        { error: "Customer and at least one line item are required." },
        { status: 400 }
      );
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const totals = calculateDocumentTotals({
      lines: lines.map((l: any) => ({
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate || 0,
        discountAmount: l.discountAmount || 0,
      })),
    });

    const count = await prisma.quotation.count();
    const quotationNumber = `QUO-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}-${Date.now().toString().slice(-4)}`;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId,
        planId: planId || null,
        status: "SENT",
        issueDate: new Date(),
        expiryDate: addDays(new Date(), 30),
        paymentTerms,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        grandTotal: totals.grandTotal,
        notes: notes || null,
        lines: {
          create: lines.map((l: any) => {
            const qty = Number(l.quantity) || 1;
            const uPrice = new Decimal(l.unitPrice || 0);
            const disc = new Decimal(l.discountAmount || 0);
            const sub = Decimal.max(0, uPrice.times(qty).minus(disc));
            const taxR = new Decimal(l.taxRate || 0);
            const taxA = sub.times(taxR).dividedBy(100).toDecimalPlaces(2);
            const lineTot = sub.plus(taxA).toDecimalPlaces(2);

            return {
              productId: l.productId || null,
              description: l.description || "Custom Service",
              quantity: qty,
              unitPrice: uPrice,
              discountAmount: disc,
              taxRate: taxR,
              taxAmount: taxA,
              lineTotal: lineTot,
            };
          }),
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    return NextResponse.json({ success: true, quotation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Quotation creation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
