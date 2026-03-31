"use client";

import { useFinSightState } from "@/hooks/useFinSightState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DashboardHeader() {
  const state = useFinSightState();

  const portfolioName = state.portfolio?.name ?? "No portfolio loaded";
  const stepLabel =
    state.currentStep === "idle"
      ? "Waiting"
      : state.currentStep === "complete"
        ? "Analysis Complete"
        : `Analyzing: ${state.currentStep}`;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-cream-warm px-5 py-3">
      <div>
        <h2 className="font-serif text-lg font-600 text-slate-dark">
          {portfolioName}
        </h2>
        <p className="text-xs text-slate-text">
          {state.portfolio
            ? `${state.portfolio.holdingsCount} holdings across ${state.portfolio.totalSectors} sectors`
            : "Upload or load a portfolio to begin"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={state.currentStep === "complete" ? "completed" : state.currentStep === "idle" ? "draft" : "running"} />
        <span className="text-xs text-slate-text">{stepLabel}</span>
      </div>
    </div>
  );
}
