import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: "text-emerald-400 bg-emerald-400/10",
    completed: "text-emerald-400 bg-emerald-400/10",
    active: "text-emerald-400 bg-emerald-400/10",
    "in-stock": "text-emerald-400 bg-emerald-400/10",
    pending: "text-amber-400 bg-amber-400/10",
    "low-stock": "text-amber-400 bg-amber-400/10",
    "on-leave": "text-amber-400 bg-amber-400/10",
    overdue: "text-red-400 bg-red-400/10",
    failed: "text-red-400 bg-red-400/10",
    "out-of-stock": "text-red-400 bg-red-400/10",
    terminated: "text-red-400 bg-red-400/10",
    draft: "text-zinc-400 bg-zinc-400/10",
  };
  return colors[status] || "text-zinc-400 bg-zinc-400/10";
}
