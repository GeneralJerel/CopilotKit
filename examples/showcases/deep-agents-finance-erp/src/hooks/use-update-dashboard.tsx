"use client";

import { useRef, useEffect } from "react";
import { useRenderTool, ToolCallStatus } from "@copilotkit/react-core/v2";
import { useDashboard } from "@/context/dashboard-context";

/** Map agent widget type names to internal WidgetType values. */
const TYPE_MAP: Record<string, string> = {
  kpi_cards: "kpi-cards",
  revenue_chart: "revenue-chart",
  expense_breakdown: "expense-breakdown",
  transactions: "recent-transactions",
  invoices: "outstanding-invoices",
  custom_chart: "custom-chart",
};

const DEFAULT_COLSPAN: Record<string, 1 | 2 | 3 | 4> = {
  "kpi-cards": 4,
  "revenue-chart": 3,
  "expense-breakdown": 1,
  "recent-transactions": 2,
  "outstanding-invoices": 2,
  "custom-chart": 2,
};

interface WidgetSpec {
  type: string;
  colSpan?: number;
  config?: Record<string, unknown>;
}

function DashboardUpdater({
  widgets,
  status,
}: {
  widgets: WidgetSpec[];
  status: string;
}) {
  const { upsertWidget, addWidget, getWidgets } = useDashboard();
  const applied = useRef(false);

  useEffect(() => {
    if (status === ToolCallStatus.Complete && widgets?.length && !applied.current) {
      applied.current = true;

      for (const w of widgets) {
        const internalType = TYPE_MAP[w.type] ?? w.type;
        const colSpan = (w.colSpan ??
          DEFAULT_COLSPAN[internalType] ??
          2) as 1 | 2 | 3 | 4;
        const config = w.config ?? {};

        if (internalType === "custom-chart") {
          const id = `custom-chart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          addWidget({
            id,
            type: "custom-chart",
            colSpan,
            order: getWidgets().length,
            config: config as any,
          });
        } else {
          upsertWidget(
            internalType as any,
            (order) => ({
              id: `${internalType}-${Date.now()}`,
              type: internalType as any,
              colSpan,
              order,
              config: config as any,
            }),
            { config: config as any, colSpan },
          );
        }
      }
    }
  }, [status, widgets, upsertWidget, addWidget, getWidgets]);

  if (status === ToolCallStatus.Complete) return null;
  return (
    <p className="text-sm text-muted-foreground animate-pulse py-1">
      Updating dashboard...
    </p>
  );
}

export function useUpdateDashboard() {
  useRenderTool(
    {
      name: "update_dashboard",
      render: ({ args, status }) => (
        <DashboardUpdater
          widgets={args?.widgets ?? []}
          status={status}
        />
      ),
    },
    [],
  );
}
