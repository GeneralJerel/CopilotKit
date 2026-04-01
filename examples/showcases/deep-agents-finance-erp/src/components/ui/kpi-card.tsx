"use client";

import {
  DollarSign,
  TrendingUp,
  FileText,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPI } from "@/types/erp";

const iconMap: Record<string, React.ElementType> = {
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "file-text": FileText,
  receipt: Receipt,
};

export function KPICard({ kpi }: { kpi: KPI }) {
  const Icon = iconMap[kpi.icon] || DollarSign;
  const isPositive = kpi.trend === "up";

  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
          <Icon className="h-5 w-5 text-indigo-400" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(kpi.change)}%
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-zinc-100">
          {kpi.value}
        </p>
        <p className="mt-1 text-sm text-zinc-500">{kpi.label}</p>
      </div>
    </div>
  );
}
