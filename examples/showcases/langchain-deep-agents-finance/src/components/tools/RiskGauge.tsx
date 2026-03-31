"use client";

import { GaugeArc } from "@/components/ui/GaugeArc";
import { RiskBreakdown } from "@/lib/types";
import { riskColor } from "@/lib/colors";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Props {
  status: string;
  score?: number;
  breakdown?: RiskBreakdown[];
  recommendation?: string;
}

function riskLabel(score: number): string {
  if (score < 33) return "Low";
  if (score < 66) return "Moderate";
  return "Elevated";
}

export function RiskGauge({ status, score, breakdown, recommendation }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (status === "inProgress" || score == null) {
    return (
      <div className="flex flex-col items-center py-4">
        <GaugeArc score={0} label="Calculating risk..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GaugeArc score={score} label={riskLabel(score)} />

      {/* Breakdown accordion */}
      {breakdown && breakdown.length > 0 && (
        <div className="space-y-1.5">
          {breakdown.map((item, i) => (
            <div key={item.category} className="rounded border border-border bg-cream/50">
              <button
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-xs font-medium text-slate-dark">
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-cream-dark overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: riskColor(item.score) }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-text w-6 text-right">
                    {item.score}
                  </span>
                </div>
              </button>
              <AnimatePresence>
                {expandedIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-3 pb-2 text-[11px] text-slate-text leading-relaxed">
                      {item.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold mb-1">
            Recommendation
          </p>
          <p className="text-xs text-slate-dark leading-relaxed">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
