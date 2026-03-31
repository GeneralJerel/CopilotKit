"use client";

import { correlationColor } from "@/lib/colors";
import { useState } from "react";

interface Props {
  status: string;
  tickers?: string[];
  matrix?: number[][];
}

function corrLabel(v: number): string {
  const abs = Math.abs(v);
  if (abs > 0.8) return "Highly correlated";
  if (abs > 0.5) return "Moderately correlated";
  if (abs > 0.3) return "Weakly correlated";
  return "Low correlation";
}

export function CorrelationMatrix({ status, tickers, matrix }: Props) {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  if (status === "inProgress" || !tickers || !matrix) {
    const n = 8;
    return (
      <div className="space-y-2">
        <p className="text-xs font-serif italic text-slate-text">
          Computing correlations...
        </p>
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
        >
          {Array.from({ length: n * n }).map((_, i) => (
            <div key={i} className="skeleton-pulse aspect-square rounded-sm bg-cream-dark" />
          ))}
        </div>
      </div>
    );
  }

  const n = tickers.length;
  const cellSize = Math.min(Math.floor(320 / n), 40);

  return (
    <div className="space-y-2">
      <div className="overflow-auto">
        <div className="inline-block">
          {/* Column headers */}
          <div className="flex" style={{ marginLeft: cellSize + 4 }}>
            {tickers.map((t, i) => (
              <div
                key={t}
                style={{ width: cellSize }}
                className={`text-[8px] font-mono text-center truncate ${
                  hovered?.col === i ? "text-slate-dark font-semibold" : "text-slate-text"
                }`}
              >
                <span
                  className="inline-block origin-center"
                  style={{ transform: "rotate(-45deg)", whiteSpace: "nowrap" }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {matrix.map((row, ri) => (
            <div key={ri} className="flex items-center gap-0.5">
              {/* Row label */}
              <div
                style={{ width: cellSize }}
                className={`text-[8px] font-mono text-right pr-1 truncate ${
                  hovered?.row === ri ? "text-slate-dark font-semibold" : "text-slate-text"
                }`}
              >
                {tickers[ri]}
              </div>

              {/* Cells */}
              {row.map((val, ci) => {
                const isHighlighted =
                  hovered && (hovered.row === ri || hovered.col === ci);
                const isDiagonal = ri === ci;

                return (
                  <div
                    key={ci}
                    onMouseEnter={() => setHovered({ row: ri, col: ci })}
                    onMouseLeave={() => setHovered(null)}
                    className="relative cursor-pointer rounded-sm transition-opacity"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: isDiagonal ? "#C4A961" : correlationColor(val),
                      opacity: hovered && !isHighlighted ? 0.3 : 1,
                    }}
                  >
                    {cellSize >= 24 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono text-white/80">
                        {val.toFixed(2)}
                      </span>
                    )}

                    {/* Tooltip */}
                    {hovered?.row === ri && hovered?.col === ci && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 rounded border border-border bg-cream-warm px-2 py-1 shadow-lg whitespace-nowrap">
                        <p className="text-[10px] font-semibold text-slate-dark">
                          {tickers[ri]} x {tickers[ci]}: {val.toFixed(2)}
                        </p>
                        <p className="text-[9px] text-slate-text">{corrLabel(val)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[9px] text-slate-text">
        <span>-1</span>
        <div
          className="h-2 flex-1 rounded"
          style={{
            background: "linear-gradient(to right, #2D5A3D, #FAF8F5, #8B3A3A)",
          }}
        />
        <span>+1</span>
      </div>
    </div>
  );
}
