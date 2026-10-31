import { describe, it, expect } from "vitest";
import {
  calculateVariantPrice,
  calculateLine,
  calculateDocumentTotals,
  calculateOutstandingBalance,
} from "@/lib/calculations/financial";
import Decimal from "decimal.js";

describe("Financial Calculations Engine", () => {
  describe("Variant Price Calculations", () => {
    it("should calculate additional variant price correctly (₹1,000 + ₹560 = ₹1,560)", () => {
      const price = calculateVariantPrice({
        basePrice: "1000.00",
        pricingType: "ADDITIONAL",
        priceAdjustment: "560.00",
      });
      expect(price.toString()).toBe("1560");
    });

    it("should calculate fixed override variant price correctly", () => {
      const price = calculateVariantPrice({
        basePrice: "2499.00",
        pricingType: "OVERRIDE",
        priceAdjustment: "4999.00",
      });
      expect(price.toString()).toBe("4999");
    });

    it("should return base price when no variant adjustment is provided", () => {
      const price = calculateVariantPrice({
        basePrice: "1200.00",
      });
      expect(price.toString()).toBe("1200");
    });
  });

  describe("Line Calculations with Taxes & Discounts", () => {
    it("should calculate standard line subtotal without tax or discount", () => {
      const line = calculateLine({
        quantity: 3,
        unitPrice: "150.00",
      });
      expect(line.subtotal.toString()).toBe("450");
      expect(line.discountAmount.toString()).toBe("0");
      expect(line.taxAmount.toString()).toBe("0");
      expect(line.lineTotal.toString()).toBe("450");
    });

    it("should apply percentage discount and clamp at subtotal", () => {
      const line = calculateLine({
        quantity: 2,
        unitPrice: "100.00",
        discountType: "PERCENTAGE",
        discountValue: "20", // 20% of 200 = 40
      });
      expect(line.subtotal.toString()).toBe("200");
      expect(line.discountAmount.toString()).toBe("40");
      expect(line.netSubtotal.toString()).toBe("160");
    });

    it("should calculate 18% exclusive GST tax accurately", () => {
      const line = calculateLine({
        quantity: 1,
        unitPrice: "1000.00",
        taxRate: "18",
        isTaxInclusive: false,
      });
      expect(line.subtotal.toString()).toBe("1000");
      expect(line.taxAmount.toString()).toBe("180");
      expect(line.lineTotal.toString()).toBe("1180");
    });

    it("should calculate inclusive tax without increasing line total", () => {
      const line = calculateLine({
        quantity: 1,
        unitPrice: "1180.00",
        taxRate: "18",
        isTaxInclusive: true,
      });
      expect(line.lineTotal.toString()).toBe("1180");
      expect(line.taxAmount.toString()).toBe("180");
    });
  });

  describe("Document Totals & Multi-Line Aggregation", () => {
    it("should correctly aggregate multi-line subtotal, tax, and grand total", () => {
      const doc = calculateDocumentTotals({
        lines: [
          { quantity: 2, unitPrice: "1000.00", taxRate: "18" }, // 2000 + 360 tax = 2360
          { quantity: 1, unitPrice: "500.00", taxRate: "18" },  // 500 + 90 tax = 590
        ],
      });

      expect(doc.subtotal.toString()).toBe("2500");
      expect(doc.taxTotal.toString()).toBe("450");
      expect(doc.grandTotal.toString()).toBe("2950");
    });

    it("should apply document-level discount correctly", () => {
      const doc = calculateDocumentTotals({
        lines: [{ quantity: 1, unitPrice: "2000.00", taxRate: "18" }],
        documentDiscount: {
          discountType: "FIXED",
          value: "500.00",
        },
      });

      // subtotal: 2000, discount: 500, netSubtotal: 1500, tax: 360 (or line tax)
      expect(doc.subtotal.toString()).toBe("2000");
      expect(doc.discountTotal.toString()).toBe("500");
      expect(doc.grandTotal.toString()).toBe("1860");
    });
  });

  describe("Outstanding Balance & Payment Clearance", () => {
    it("should calculate partial payment balance correctly", () => {
      const res = calculateOutstandingBalance("1000.00", "400.00");
      expect(res.amountPaid.toString()).toBe("400");
      expect(res.outstandingAmount.toString()).toBe("600");
      expect(res.isFullyPaid).toBe(false);
    });

    it("should mark invoice fully paid when paid equals total", () => {
      const res = calculateOutstandingBalance("1000.00", "1000.00");
      expect(res.outstandingAmount.toString()).toBe("0");
      expect(res.isFullyPaid).toBe(true);
    });

    it("should clamp outstanding amount at 0 and prevent negative balance", () => {
      const res = calculateOutstandingBalance("1000.00", "1200.00");
      expect(res.outstandingAmount.toString()).toBe("0");
      expect(res.isFullyPaid).toBe(true);
    });
  });
});
