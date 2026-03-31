"use client";

import { useFinSightState } from "@/hooks/useFinSightState";
import { PortfolioHeatmap } from "@/components/tools/PortfolioHeatmap";
import { RiskGauge } from "@/components/tools/RiskGauge";
import { ScenarioCards } from "@/components/tools/ScenarioCards";
import { CorrelationMatrix } from "@/components/tools/CorrelationMatrix";
import { motion, AnimatePresence } from "framer-motion";

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-cream-warm/50 p-6">
      <p className="text-xs text-slate-text/50">{label}</p>
    </div>
  );
}

export function Dashboard() {
  const state = useFinSightState();

  return (
    <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
      {/* Top-left: Portfolio Heatmap */}
      <div className="rounded-lg border border-border bg-cream-warm p-4 overflow-auto">
        <h3 className="font-serif text-sm font-600 text-slate-dark mb-3">
          Portfolio Composition
        </h3>
        <AnimatePresence mode="wait">
          {state.portfolio ? (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PortfolioHeatmap status="complete" holdings={state.portfolio.holdings} />
            </motion.div>
          ) : (
            <EmptyPanel label="Heatmap will appear after portfolio analysis" />
          )}
        </AnimatePresence>
      </div>

      {/* Top-right: Risk Gauge */}
      <div className="rounded-lg border border-border bg-cream-warm p-4 overflow-auto">
        <h3 className="font-serif text-sm font-600 text-slate-dark mb-3">
          Risk Assessment
        </h3>
        <AnimatePresence mode="wait">
          {state.risk ? (
            <motion.div
              key="gauge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <RiskGauge
                status="complete"
                score={state.risk.overallScore}
                breakdown={state.risk.breakdown}
                recommendation={state.risk.recommendation}
              />
            </motion.div>
          ) : (
            <EmptyPanel label="Risk gauge will appear after risk analysis" />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom-left: Scenario Analysis */}
      <div className="rounded-lg border border-border bg-cream-warm p-4 overflow-auto">
        <h3 className="font-serif text-sm font-600 text-slate-dark mb-3">
          Scenario Analysis
        </h3>
        <AnimatePresence mode="wait">
          {state.scenarios ? (
            <motion.div
              key="scenarios"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ScenarioCards status="complete" scenarios={state.scenarios} />
            </motion.div>
          ) : (
            <EmptyPanel label="Scenarios will appear after stress testing" />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom-right: Correlation Matrix */}
      <div className="rounded-lg border border-border bg-cream-warm p-4 overflow-auto">
        <h3 className="font-serif text-sm font-600 text-slate-dark mb-3">
          Correlation Matrix
        </h3>
        <AnimatePresence mode="wait">
          {state.correlation ? (
            <motion.div
              key="correlation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CorrelationMatrix
                status="complete"
                tickers={state.correlation.tickers}
                matrix={state.correlation.matrix}
              />
            </motion.div>
          ) : (
            <EmptyPanel label="Correlation matrix will appear after analysis" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
