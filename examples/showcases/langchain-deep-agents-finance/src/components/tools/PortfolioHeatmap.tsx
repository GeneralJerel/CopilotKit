"use client";

import { motion } from "framer-motion";
import { riskColor } from "@/lib/colors";
import { HoldingData } from "@/lib/types";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { useState } from "react";

interface Props {
  status: string;
  holdings?: HoldingData[];
}

export function PortfolioHeatmap({ status, holdings }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (status === "inProgress" || !holdings) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-serif italic text-slate-text">
          Building portfolio view...
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-pulse aspect-square rounded bg-cream-dark"
            />
          ))}
        </div>
      </div>
    );
  }

  if (status === "executing") {
    return (
      <div className="space-y-3">
        <p className="text-xs font-serif italic text-slate-text">
          Rendering holdings...
        </p>
        <SkeletonLoader rows={4} />
      </div>
    );
  }

  // Group by sector
  const sectors = holdings.reduce(
    (acc, h) => {
      if (!acc[h.sector]) acc[h.sector] = [];
      acc[h.sector].push(h);
      return acc;
    },
    {} as Record<string, HoldingData[]>
  );

  const maxWeight = Math.max(...holdings.map((h) => h.weight), 0.01);

  return (
    <div className="space-y-3">
      {Object.entries(sectors).map(([sector, items]) => (
        <div key={sector}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-text mb-1">
            {sector}
          </p>
          <div className="flex flex-wrap gap-1">
            {items.map((h, i) => {
              const globalIdx = holdings.indexOf(h);
              const size = Math.max(36, (h.weight / maxWeight) * 72);
              const isHovered = hoveredIdx === globalIdx;

              return (
                <motion.div
                  key={h.ticker}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  onMouseEnter={() => setHoveredIdx(globalIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative flex flex-col items-center justify-center rounded cursor-pointer transition-shadow"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: riskColor(h.riskScore),
                    boxShadow: isHovered ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  <span className="text-[9px] font-mono font-semibold text-white/90 leading-none">
                    {h.ticker}
                  </span>
                  <span className="text-[8px] text-white/70">
                    {(h.weight * 100).toFixed(1)}%
                  </span>

                  {isHovered && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 rounded border border-border bg-cream-warm px-2 py-1.5 shadow-lg whitespace-nowrap">
                      <p className="text-[10px] font-semibold text-slate-dark">
                        {h.name}
                      </p>
                      <p className="text-[9px] text-slate-text">
                        Risk: {h.riskScore} | 24h: {h.change24h > 0 ? "+" : ""}
                        {h.change24h.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
