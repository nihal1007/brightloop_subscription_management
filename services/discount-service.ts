import { prisma } from "@/lib/db/prisma";
import { isBefore, isAfter, startOfDay } from "date-fns";
import Decimal from "decimal.js";

export interface ValidateDiscountInput {
  discountCode: string;
  customerId: string;
  subtotal: number | string | Decimal;
  quantity?: number;
  planId?: string;
}

export interface DiscountValidationResult {
  isValid: boolean;
  reason?: string;
  discountRule?: {
    id: string;
    discountCode: string;
    name: string;
    discountType: "PERCENTAGE" | "FIXED";
    value: Decimal;
    calculatedDiscount: Decimal;
  };
}

export async function validateAndCalculateDiscount(
  input: ValidateDiscountInput
): Promise<DiscountValidationResult> {
  const code = input.discountCode.trim().toUpperCase();
  const rule = await prisma.discountRule.findUnique({
    where: { discountCode: code },
    include: { redemptions: true },
  });

  if (!rule || !rule.active) {
    return { isValid: false, reason: "Discount code is invalid or inactive." };
  }

  const now = startOfDay(new Date());

  // Date validity
  if (rule.validFrom && isBefore(now, startOfDay(new Date(rule.validFrom)))) {
    return { isValid: false, reason: "Discount is not yet active." };
  }
  if (rule.validTo && isAfter(now, startOfDay(new Date(rule.validTo)))) {
    return { isValid: false, reason: "Discount code has expired." };
  }

  // Plan specificity
  if (rule.applicablePlanId && input.planId && rule.applicablePlanId !== input.planId) {
    return { isValid: false, reason: "This discount code is not applicable to the selected plan." };
  }

  // Minimum subtotal
  const subtotal = new Decimal(input.subtotal || 0);
  if (rule.minPurchaseValue && subtotal.lessThan(new Decimal(rule.minPurchaseValue))) {
    return {
      isValid: false,
      reason: `Minimum purchase value of ${rule.minPurchaseValue.toString()} required to use this discount.`,
    };
  }

  // Minimum quantity
  const qty = input.quantity || 1;
  if (rule.minQuantity && qty < rule.minQuantity) {
    return {
      isValid: false,
      reason: `Minimum quantity of ${rule.minQuantity} items required for this discount.`,
    };
  }

  // Max total usage
  if (rule.maxUsageCount != null && rule.currentUsageCount >= rule.maxUsageCount) {
    return { isValid: false, reason: "This discount code has reached its maximum usage limit." };
  }

  // Per-customer usage limit
  if (rule.perCustomerLimit != null) {
    const customerUses = rule.redemptions.filter((r) => r.customerId === input.customerId).length;
    if (customerUses >= rule.perCustomerLimit) {
      return {
        isValid: false,
        reason: `You have reached the maximum allowed redemptions (${rule.perCustomerLimit}) for this discount.`,
      };
    }
  }

  // Calculate discount amount
  let calculated = new Decimal(0);
  if (rule.discountType === "PERCENTAGE") {
    calculated = subtotal.times(rule.value).dividedBy(100).toDecimalPlaces(2);
  } else {
    calculated = new Decimal(rule.value).toDecimalPlaces(2);
  }

  // Ensure discount does not exceed subtotal
  if (calculated.greaterThan(subtotal)) {
    calculated = subtotal;
  }

  return {
    isValid: true,
    discountRule: {
      id: rule.id,
      discountCode: rule.discountCode,
      name: rule.name,
      discountType: rule.discountType,
      value: new Decimal(rule.value),
      calculatedDiscount: calculated,
    },
  };
}

/**
 * Atomically records discount redemption and increments usage count.
 */
export async function redeemDiscount(
  discountRuleId: string,
  customerId: string,
  amountApplied: Decimal | number | string,
  invoiceId?: string,
  quotationId?: string
) {
  return prisma.$transaction(async (tx) => {
    const rule = await tx.discountRule.findUnique({
      where: { id: discountRuleId },
    });

    if (!rule || !rule.active) {
      throw new Error("Discount rule is no longer active.");
    }

    if (rule.maxUsageCount != null && rule.currentUsageCount >= rule.maxUsageCount) {
      throw new Error("Discount rule has reached its usage limit.");
    }

    const applied = new Decimal(amountApplied).toDecimalPlaces(2);

    const redemption = await tx.discountRedemption.create({
      data: {
        discountRuleId: rule.id,
        customerId,
        invoiceId,
        quotationId,
        amountApplied: applied,
      },
    });

    await tx.discountRule.update({
      where: { id: rule.id },
      data: {
        currentUsageCount: {
          increment: 1,
        },
      },
    });

    return redemption;
  });
}
