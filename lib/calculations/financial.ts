import Decimal from "decimal.js";

// Configure Decimal for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface VariantPriceInput {
  basePrice: number | string | Decimal;
  pricingType?: "ADDITIONAL" | "OVERRIDE" | null;
  priceAdjustment?: number | string | Decimal | null;
}

export function calculateVariantPrice(input: VariantPriceInput): Decimal {
  const base = new Decimal(input.basePrice || 0);
  if (!input.pricingType || input.priceAdjustment == null) {
    return base.toDecimalPlaces(2);
  }

  const adjustment = new Decimal(input.priceAdjustment);
  if (input.pricingType === "OVERRIDE") {
    return adjustment.greaterThanOrEqualTo(0) ? adjustment.toDecimalPlaces(2) : base.toDecimalPlaces(2);
  }

  // ADDITIONAL
  return base.plus(adjustment).toDecimalPlaces(2);
}

export interface LineCalculationInput {
  quantity: number;
  unitPrice: number | string | Decimal;
  discountType?: "PERCENTAGE" | "FIXED" | null;
  discountValue?: number | string | Decimal | null;
  taxRate?: number | string | Decimal | null; // e.g. 18 for 18%
  isTaxInclusive?: boolean;
}

export interface LineCalculationResult {
  quantity: number;
  unitPrice: Decimal;
  subtotal: Decimal;
  discountAmount: Decimal;
  netSubtotal: Decimal;
  taxAmount: Decimal;
  lineTotal: Decimal;
}

export function calculateLine(input: LineCalculationInput): LineCalculationResult {
  const qty = Math.max(1, input.quantity || 1);
  const unitPrice = new Decimal(input.unitPrice || 0).toDecimalPlaces(2);
  const subtotal = unitPrice.times(qty).toDecimalPlaces(2);

  // Discount calculation
  let discountAmount = new Decimal(0);
  if (input.discountValue != null && input.discountType) {
    const discVal = new Decimal(input.discountValue);
    if (input.discountType === "PERCENTAGE") {
      discountAmount = subtotal.times(discVal).dividedBy(100).toDecimalPlaces(2);
    } else {
      discountAmount = discVal.toDecimalPlaces(2);
    }
  }

  // Discount cannot exceed subtotal
  if (discountAmount.greaterThan(subtotal)) {
    discountAmount = subtotal;
  }
  discountAmount = discountAmount.toDecimalPlaces(2);

  const netSubtotal = subtotal.minus(discountAmount).toDecimalPlaces(2);

  // Tax calculation
  let taxAmount = new Decimal(0);
  const taxRate = input.taxRate ? new Decimal(input.taxRate) : new Decimal(0);

  if (taxRate.greaterThan(0)) {
    if (input.isTaxInclusive) {
      // Inclusive: tax is already included in netSubtotal
      // taxAmount = netSubtotal - (netSubtotal / (1 + taxRate/100))
      const factor = new Decimal(1).plus(taxRate.dividedBy(100));
      const preTaxAmount = netSubtotal.dividedBy(factor);
      taxAmount = netSubtotal.minus(preTaxAmount).toDecimalPlaces(2);
    } else {
      // Exclusive: taxAmount = netSubtotal * (taxRate / 100)
      taxAmount = netSubtotal.times(taxRate).dividedBy(100).toDecimalPlaces(2);
    }
  }

  const lineTotal = input.isTaxInclusive
    ? netSubtotal
    : netSubtotal.plus(taxAmount).toDecimalPlaces(2);

  return {
    quantity: qty,
    unitPrice,
    subtotal,
    discountAmount,
    netSubtotal,
    taxAmount,
    lineTotal,
  };
}

export interface DocumentTotalsInput {
  lines: Array<{
    quantity: number;
    unitPrice: number | string | Decimal;
    discountAmount?: number | string | Decimal | null;
    taxRate?: number | string | Decimal | null;
    isTaxInclusive?: boolean;
  }>;
  documentDiscount?: {
    discountType: "PERCENTAGE" | "FIXED";
    value: number | string | Decimal;
  } | null;
}

export interface DocumentTotalsResult {
  subtotal: Decimal;
  discountTotal: Decimal;
  taxTotal: Decimal;
  grandTotal: Decimal;
}

export function calculateDocumentTotals(input: DocumentTotalsInput): DocumentTotalsResult {
  let subtotal = new Decimal(0);
  let lineDiscountTotal = new Decimal(0);
  let taxTotal = new Decimal(0);

  for (const line of input.lines) {
    const res = calculateLine({
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountValue: line.discountAmount,
      discountType: "FIXED",
      taxRate: line.taxRate,
      isTaxInclusive: line.isTaxInclusive,
    });
    subtotal = subtotal.plus(res.subtotal);
    lineDiscountTotal = lineDiscountTotal.plus(res.discountAmount);
    taxTotal = taxTotal.plus(res.taxAmount);
  }

  subtotal = subtotal.toDecimalPlaces(2);
  lineDiscountTotal = lineDiscountTotal.toDecimalPlaces(2);
  taxTotal = taxTotal.toDecimalPlaces(2);

  let docDiscount = new Decimal(0);
  if (input.documentDiscount) {
    const discVal = new Decimal(input.documentDiscount.value);
    if (input.documentDiscount.discountType === "PERCENTAGE") {
      docDiscount = subtotal.times(discVal).dividedBy(100).toDecimalPlaces(2);
    } else {
      docDiscount = discVal.toDecimalPlaces(2);
    }
  }

  const totalDiscount = lineDiscountTotal.plus(docDiscount).toDecimalPlaces(2);
  const effectiveDiscount = Decimal.min(totalDiscount, subtotal);

  const grandTotal = Decimal.max(0, subtotal.minus(effectiveDiscount).plus(taxTotal)).toDecimalPlaces(2);

  return {
    subtotal,
    discountTotal: effectiveDiscount,
    taxTotal,
    grandTotal,
  };
}

export function calculateOutstandingBalance(
  grandTotal: number | string | Decimal,
  amountPaid: number | string | Decimal
): { amountPaid: Decimal; outstandingAmount: Decimal; isFullyPaid: boolean } {
  const total = new Decimal(grandTotal || 0).toDecimalPlaces(2);
  const paid = new Decimal(amountPaid || 0).toDecimalPlaces(2);
  const outstanding = Decimal.max(0, total.minus(paid)).toDecimalPlaces(2);

  return {
    amountPaid: paid,
    outstandingAmount: outstanding,
    isFullyPaid: outstanding.isZero(),
  };
}
