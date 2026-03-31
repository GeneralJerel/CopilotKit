"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  color?: string;
}

export function MetricCard({
  label,
  value,
  suffix = "",
  prefix = "",
  decimals = 1,
  color = "text-slate-dark",
}: MetricCardProps) {
  const displayed = useCountUp(value, 800, decimals);

  return (
    <div className="rounded-lg border border-border bg-cream-warm p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-text">
        {label}
      </p>
      <p className={`mt-1 font-mono text-2xl font-semibold ${color}`}>
        {prefix}
        {displayed}
        {suffix}
      </p>
    </div>
  );
}
