"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { DashboardWidget } from "@/types/dashboard";

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: "kpi-cards",
    type: "kpi-cards",
    colSpan: 4,
    order: 0,
    config: {},
  },
  {
    id: "revenue-chart",
    type: "revenue-chart",
    colSpan: 3,
    order: 1,
    config: { showProfit: true, showExpenses: true },
  },
  {
    id: "expense-breakdown",
    type: "expense-breakdown",
    colSpan: 1,
    order: 2,
    config: {},
  },
  {
    id: "recent-transactions",
    type: "recent-transactions",
    colSpan: 2,
    order: 3,
    config: { limit: 5 },
  },
  {
    id: "outstanding-invoices",
    type: "outstanding-invoices",
    colSpan: 2,
    order: 4,
    config: { statuses: ["pending", "overdue"] },
  },
];

interface DashboardContextValue {
  widgets: DashboardWidget[];
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  setWidgets: (widgets: DashboardWidget[]) => void;
  resetToDefault: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgetsState] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);

  const addWidget = useCallback((widget: DashboardWidget) => {
    setWidgetsState((prev) => [...prev, widget]);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgetsState((prev) => prev.filter((w) => w.id !== widgetId));
  }, []);

  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<DashboardWidget>) => {
      setWidgetsState((prev) =>
        prev.map((w) => (w.id === widgetId ? { ...w, ...updates } as DashboardWidget : w))
      );
    },
    []
  );

  const setWidgets = useCallback((newWidgets: DashboardWidget[]) => {
    setWidgetsState(newWidgets);
  }, []);

  const resetToDefault = useCallback(() => {
    setWidgetsState(DEFAULT_WIDGETS);
  }, []);

  return (
    <DashboardContext.Provider
      value={{ widgets, addWidget, removeWidget, updateWidget, setWidgets, resetToDefault }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}
