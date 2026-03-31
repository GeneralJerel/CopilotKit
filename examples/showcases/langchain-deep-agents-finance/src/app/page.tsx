"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { Dashboard } from "@/components/Dashboard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col bg-cream">
      {/* Top bar */}
      <header className="border-b border-border bg-cream-warm/80 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-600 tracking-tight text-slate-dark">
                FinSight
              </h1>
              <p className="mt-0.5 text-sm text-slate-text">
                AI-Powered Portfolio Risk Analyst
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-border bg-cream-warm px-3 py-1 text-xs font-semibold text-slate-text">
                CopilotKit
              </span>
              <span className="rounded-full border border-forest/30 bg-forest/5 px-3 py-1 text-xs font-semibold text-forest">
                Live
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] flex-1 flex min-h-0 px-6 py-5 gap-5">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <Sidebar />
        </aside>

        {/* Chat panel — 40% */}
        <section className="w-full lg:w-[38%] min-h-0 flex flex-col">
          <ChatPanel />
        </section>

        {/* Dashboard — 60% */}
        <section className="hidden lg:flex lg:flex-1 min-h-0 flex-col gap-4">
          <DashboardHeader />
          <Dashboard />
        </section>
      </div>
    </main>
  );
}
