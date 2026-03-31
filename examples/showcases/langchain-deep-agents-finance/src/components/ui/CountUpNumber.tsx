"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface CountUpNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUpNumber({
  value,
  duration = 800,
  decimals = 1,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpNumberProps) {
  const displayed = useCountUp(value, duration, decimals);

  return (
    <span className={`font-mono ${className}`}>
      {prefix}
      {displayed}
      {suffix}
    </span>
  );
}
