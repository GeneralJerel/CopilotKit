"use client";

import { motion } from "framer-motion";
import { ScenarioData } from "@/lib/types";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";

interface Props {
  status: string;
  scenarios?: ScenarioData[];
}

const SCENARIO_COLORS: Record<string, string> = {
  recession: "border-t-gold",
  rate_hike: "border-t-slate-text",
  sector_rotation: "border-t-burgundy",
};

export function ScenarioCards({ status, scenarios }: Props) {
  if (status === "inProgress" || !scenarios) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Find the worst scenario
  const worstIdx = scenarios.reduce(
    (worst, s, i) => (s.projectedReturn < scenarios[worst].projectedReturn ? i : worst),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {scenarios.map((scenario, i) => {
        const borderColor =
          SCENARIO_COLORS[scenario.name.toLowerCase().replace(/\s+/g, "_")] ??
          "border-t-border";

        return (
          <motion.div
            key={scenario.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.4 }}
            className={`relative rounded-lg border border-border ${borderColor} border-t-2 bg-cream-warm p-4 space-y-3`}
          >
            {i === worstIdx && (
              <span className="absolute -top-2.5 right-3 rounded-full bg-burgundy px-2 py-0.5 text-[9px] font-semibold text-white">
                Worst Case
              </span>
            )}

            <div>
              <h4 className="font-serif text-sm font-600 text-slate-dark capitalize">
                {scenario.name.replace(/_/g, " ")}
              </h4>
              <p className="text-[11px] text-slate-text mt-0.5 leading-relaxed">
                {scenario.description}
              </p>
            </div>

            <div className="space-y-2">
              <MetricRow
                label="Projected Return"
                value={scenario.projectedReturn}
                suffix="%"
                negative={scenario.projectedReturn < 0}
              />
              <MetricRow
                label="VaR Delta"
                value={scenario.varDelta}
                suffix="%"
                negative={scenario.varDelta > 0}
              />
              <MetricRow
                label="Sharpe Delta"
                value={scenario.sharpeDelta}
                negative={scenario.sharpeDelta < 0}
              />
            </div>

            {scenario.impactedHoldings && scenario.impactedHoldings.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-text mb-1">
                  Most Impacted
                </p>
                <div className="space-y-0.5">
                  {scenario.impactedHoldings.slice(0, 3).map((h) => (
                    <div
                      key={h.ticker}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span className="font-mono text-slate-dark">{h.ticker}</span>
                      <span
                        className={
                          h.projectedChange < 0 ? "text-burgundy" : "text-forest"
                        }
                      >
                        {h.projectedChange > 0 ? "+" : ""}
                        {h.projectedChange.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1 border-t border-border-light">
              <span className="text-[10px] text-slate-text">
                Probability:{" "}
                <CountUpNumber
                  value={scenario.probability * 100}
                  suffix="%"
                  decimals={0}
                  className="font-semibold text-slate-dark"
                />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MetricRow({
  label,
  value,
  suffix = "",
  negative,
}: {
  label: string;
  value: number;
  suffix?: string;
  negative: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-text">{label}</span>
      <CountUpNumber
        value={value}
        suffix={suffix}
        prefix={value > 0 ? "+" : ""}
        className={`text-xs font-semibold ${negative ? "text-burgundy" : "text-forest"}`}
      />
    </div>
  );
}
