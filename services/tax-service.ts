import { prisma } from "@/lib/db/prisma";
import { isBefore, isAfter, startOfDay } from "date-fns";
import Decimal from "decimal.js";

export interface ApplicableTaxRule {
  id: string;
  taxCode: string;
  name: string;
  taxType: "PERCENTAGE" | "FIXED";
  rate: Decimal;
  isInclusive: boolean;
}

export async function getActiveTaxRules(category?: string | null): Promise<ApplicableTaxRule[]> {
  const now = startOfDay(new Date());

  const rules = await prisma.taxRule.findMany({
    where: {
      active: true,
      effectiveFrom: { lte: now },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: now } },
      ],
      ...(category ? { OR: [{ appliesToCategory: null }, { appliesToCategory: category }] } : {}),
    },
    orderBy: { rate: "desc" },
  });

  return rules.map((r) => ({
    id: r.id,
    taxCode: r.taxCode,
    name: r.name,
    taxType: r.taxType,
    rate: new Decimal(r.rate),
    isInclusive: r.isInclusive,
  }));
}

export function calculateLineTax(
  netSubtotal: Decimal | number | string,
  taxRate: Decimal | number | string,
  isInclusive: boolean = false
): { taxAmount: Decimal; lineTotal: Decimal } {
  const net = new Decimal(netSubtotal || 0);
  const rate = new Decimal(taxRate || 0);

  if (rate.isZero() || net.isZero()) {
    return { taxAmount: new Decimal(0), lineTotal: net };
  }

  if (isInclusive) {
    const factor = new Decimal(1).plus(rate.dividedBy(100));
    const preTax = net.dividedBy(factor);
    const taxAmount = net.minus(preTax).toDecimalPlaces(2);
    return { taxAmount, lineTotal: net.toDecimalPlaces(2) };
  }

  const taxAmount = net.times(rate).dividedBy(100).toDecimalPlaces(2);
  const lineTotal = net.plus(taxAmount).toDecimalPlaces(2);
  return { taxAmount, lineTotal };
}
