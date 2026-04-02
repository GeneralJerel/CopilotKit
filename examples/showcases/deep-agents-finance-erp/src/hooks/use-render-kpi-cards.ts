import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";


export function useRenderKpiCards() {
  const { widgets, addWidget, updateWidget } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_kpi_cards",
    description:
      "Add or update KPI metric cards on the dashboard. Shows key financial metrics like Total Revenue, Net Profit, Accounts Receivable, and Operating Expenses.",
    parameters: z.object({
      metrics: z
        .array(z.string())
        .optional()
        .describe(
          "Which KPI labels to show. Options: 'Total Revenue', 'Net Profit', 'Accounts Receivable', 'Operating Expenses'. Omit to show all."
        ),
      colSpan: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe("Grid column span (1-4). Default: 4 (full width)"),
    }),
    handler: async ({ metrics, colSpan }) => {
      const existing = widgets.find((w) => w.type === "kpi-cards");
      if (existing) {
        updateWidget(existing.id, { config: { metrics }, colSpan: (colSpan ?? existing.colSpan) as 1 | 2 | 3 | 4 });
      } else {
        addWidget({
          id: `kpi-cards-${Date.now()}`,
          type: "kpi-cards",
          colSpan: (colSpan ?? 4) as 1 | 2 | 3 | 4,
          order: widgets.length,
          config: { metrics },
        });
      }
      return { action: existing ? "updated" : "added", widgetType: "KPI Cards" };
    },
  });
}
