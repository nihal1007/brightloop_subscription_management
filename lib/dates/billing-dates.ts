import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  setDate,
  lastDayOfMonth,
  getDate,
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";

export type BillingInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface NextBillingDateOptions {
  currentBillingDate: Date;
  interval: BillingInterval;
  intervalCount?: number;
  anchorDay?: number; // Original day of month (e.g., 31)
}

/**
 * Calculates the next billing date taking calendar month lengths and leap years into account.
 */
export function calculateNextBillingDate({
  currentBillingDate,
  interval,
  intervalCount = 1,
  anchorDay,
}: NextBillingDateOptions): Date {
  const count = Math.max(1, intervalCount);
  const baseDate = new Date(currentBillingDate);
  const originalAnchor = anchorDay || getDate(baseDate);

  switch (interval) {
    case "DAILY":
      return addDays(baseDate, count);

    case "WEEKLY":
      return addWeeks(baseDate, count);

    case "MONTHLY": {
      // Add months
      const nextMonthDate = addMonths(baseDate, count);
      const maxDaysInNextMonth = getDate(lastDayOfMonth(nextMonthDate));
      // Re-anchor to the original anchor day if possible, or clamp to last day of that month
      const targetDay = Math.min(originalAnchor, maxDaysInNextMonth);
      return setDate(nextMonthDate, targetDay);
    }

    case "YEARLY": {
      // Leap year aware
      const nextYearDate = addYears(baseDate, count);
      if (originalAnchor === 29 && getDate(baseDate) === 28) {
        // If anchor was Feb 29 and next year has 29 days in Feb
        const maxDays = getDate(lastDayOfMonth(nextYearDate));
        if (maxDays >= 29 && nextYearDate.getMonth() === 1) {
          return setDate(nextYearDate, 29);
        }
      }
      return nextYearDate;
    }

    default:
      return addMonths(baseDate, count);
  }
}

/**
 * Checks if a subscription can be created given the plan's availability window.
 */
export function isPlanAvailableOnDate(
  plan: { availableFrom?: Date | null; availableTo?: Date | null; active: boolean },
  targetDate: Date = new Date()
): { isAvailable: boolean; reason?: string } {
  if (!plan.active) {
    return { isAvailable: false, reason: "The subscription plan is archived or inactive." };
  }

  const checkDate = startOfDay(targetDate);

  if (plan.availableFrom && isBefore(checkDate, startOfDay(new Date(plan.availableFrom)))) {
    return {
      isAvailable: false,
      reason: `Plan is not yet available. Availability begins on ${new Date(plan.availableFrom).toLocaleDateString()}.`,
    };
  }

  if (plan.availableTo && isAfter(checkDate, startOfDay(new Date(plan.availableTo)))) {
    return {
      isAvailable: false,
      reason: `Plan has expired. Availability ended on ${new Date(plan.availableTo).toLocaleDateString()}.`,
    };
  }

  return { isAvailable: true };
}

/**
 * Checks if a subscription is due for recurring billing.
 */
export function isSubscriptionDueForBilling(
  nextBillingDate: Date,
  asOfDate: Date = new Date()
): boolean {
  return !isAfter(startOfDay(new Date(nextBillingDate)), startOfDay(asOfDate));
}
