import { describe, it, expect } from "vitest";
import {
  calculateNextBillingDate,
  isPlanAvailableOnDate,
  isSubscriptionDueForBilling,
} from "@/lib/dates/billing-dates";
import { format } from "date-fns";

describe("Calendar-Aware Billing Date Calculations", () => {
  it("should advance daily billing by exactly 1 day", () => {
    const start = new Date(2026, 0, 15); // 15 Jan 2026
    const next = calculateNextBillingDate({
      currentBillingDate: start,
      interval: "DAILY",
      intervalCount: 1,
    });
    expect(format(next, "yyyy-MM-dd")).toBe("2026-01-16");
  });

  it("should advance weekly billing by 7 days", () => {
    const start = new Date(2026, 0, 10); // 10 Jan 2026
    const next = calculateNextBillingDate({
      currentBillingDate: start,
      interval: "WEEKLY",
      intervalCount: 1,
    });
    expect(format(next, "yyyy-MM-dd")).toBe("2026-01-17");
  });

  it("should handle month-end billing correctly (Jan 31 -> Feb 28 in non-leap year)", () => {
    const start = new Date(2025, 0, 31); // 31 Jan 2025
    const next = calculateNextBillingDate({
      currentBillingDate: start,
      interval: "MONTHLY",
      intervalCount: 1,
      anchorDay: 31,
    });
    expect(format(next, "yyyy-MM-dd")).toBe("2025-02-28");
  });

  it("should handle leap year February (Jan 31, 2024 -> Feb 29, 2024)", () => {
    const start = new Date(2024, 0, 31); // 31 Jan 2024 (leap year)
    const next = calculateNextBillingDate({
      currentBillingDate: start,
      interval: "MONTHLY",
      intervalCount: 1,
      anchorDay: 31,
    });
    expect(format(next, "yyyy-MM-dd")).toBe("2024-02-29");
  });

  it("should re-anchor to 31 when rolling from Feb 28 to March", () => {
    const start = new Date(2025, 1, 28); // 28 Feb 2025 with anchor 31
    const next = calculateNextBillingDate({
      currentBillingDate: start,
      interval: "MONTHLY",
      intervalCount: 1,
      anchorDay: 31,
    });
    expect(format(next, "yyyy-MM-dd")).toBe("2025-03-31");
  });

  it("should advance yearly billing correctly", () => {
    const start = new Date(2026, 5, 1); // 1 June 2026
    const next = calculateNextBillingDate({
      currentBillingDate: start,
      interval: "YEARLY",
      intervalCount: 1,
    });
    expect(format(next, "yyyy-MM-dd")).toBe("2027-06-01");
  });

  describe("Plan Availability vs Subscription Validation", () => {
    it("should reject subscription creation on archived plan", () => {
      const plan = { active: false };
      const res = isPlanAvailableOnDate(plan, new Date());
      expect(res.isAvailable).toBe(false);
    });

    it("should reject creation before plan availableFrom date", () => {
      const plan = {
        active: true,
        availableFrom: new Date(2026, 11, 1),
      };
      const res = isPlanAvailableOnDate(plan, new Date(2026, 5, 1));
      expect(res.isAvailable).toBe(false);
    });

    it("should accept creation within valid availability window", () => {
      const plan = {
        active: true,
        availableFrom: new Date(2026, 0, 1),
        availableTo: new Date(2026, 11, 31),
      };
      const res = isPlanAvailableOnDate(plan, new Date(2026, 5, 1));
      expect(res.isAvailable).toBe(true);
    });
  });

  describe("Due for Billing Check", () => {
    it("should identify subscriptions whose billing date has arrived or passed", () => {
      const pastDate = new Date(2026, 0, 1);
      const today = new Date(2026, 0, 15);
      expect(isSubscriptionDueForBilling(pastDate, today)).toBe(true);
    });

    it("should not trigger billing for future dates", () => {
      const futureDate = new Date(2026, 1, 1);
      const today = new Date(2026, 0, 15);
      expect(isSubscriptionDueForBilling(futureDate, today)).toBe(false);
    });
  });
});
