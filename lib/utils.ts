import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | { toString(): string } | null | undefined,
  currency: string = "INR"
): string {
  if (amount == null) return "₹0.00";
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return "₹0.00";

  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined, pattern: string = "dd MMM yyyy"): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, pattern);
  } catch {
    return "—";
  }
}
