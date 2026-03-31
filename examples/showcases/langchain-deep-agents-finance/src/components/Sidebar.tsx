"use client";

import { useState } from "react";

export function Sidebar() {
  const [loading, setLoading] = useState(false);

  async function loadDemoPortfolio() {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const portfolios = await res.json();
      if (portfolios.length > 0) {
        // Signal to the chat that demo data is ready
        window.dispatchEvent(
          new CustomEvent("finsight:demo-loaded", { detail: portfolios[0] })
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-cream-warm p-4 space-y-3">
        <h3 className="font-serif text-sm font-600 text-slate-dark">Quick Start</h3>
        <button
          onClick={loadDemoPortfolio}
          disabled={loading}
          className="w-full rounded-lg border border-gold/40 bg-gold/5 px-3 py-2 text-xs font-semibold text-slate-dark transition-colors hover:bg-gold/10 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Demo Portfolio"}
        </button>
        <p className="text-[11px] text-slate-text leading-relaxed">
          Pre-loaded 25-holding portfolio across 10 sectors for instant demo.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-cream-warm p-4 space-y-2">
        <h3 className="font-serif text-sm font-600 text-slate-dark">Demo Prompts</h3>
        <div className="space-y-1.5">
          {[
            "Analyze my portfolio for risk",
            "Run recession scenario",
            "Show correlation matrix",
            "Generate investment memo",
          ].map((prompt) => (
            <p
              key={prompt}
              className="cursor-pointer rounded border border-transparent px-2 py-1 text-[11px] text-slate-text hover:border-border hover:bg-cream-dark transition-colors"
            >
              &ldquo;{prompt}&rdquo;
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-cream-warm p-4">
        <h3 className="font-serif text-sm font-600 text-slate-dark mb-2">Architecture</h3>
        <div className="space-y-1 text-[11px] text-slate-text">
          <p>5 useFrontendTool components</p>
          <p>4 Deep Agent subagents</p>
          <p>LangGraph HITL approval</p>
          <p>SQLite + Prisma persistence</p>
          <p>LangSmith tracing</p>
        </div>
      </div>
    </div>
  );
}
