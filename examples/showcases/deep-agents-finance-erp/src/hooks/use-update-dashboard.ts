import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

const widgetSchema = z.object({
  type: z
    .enum([
      "kpi_cards",
      "revenue_chart",
      "expense_breakdown",
      "transactions",
      "invoices",
      "custom_chart",
    ])
    .describe("Widget type"),
  colSpan: z
    .number()
    .min(1)
    .max(4)
    .optional()
    .describe("Grid column span (1-4)"),
  config: z
    .record(z.any())
    .optional()
    .describe("Type-specific configuration"),
});

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

export function useUpdateDashboard() {
  const { upsertWidget, addWidget, getWidgets } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "update_dashboard",
    description:
      "Add or update one or more dashboard widgets in a single call. Each widget in the array is upserted by type (if a widget of that type exists, it updates; otherwise it adds).",
    parameters: z.object({
      widgets: z.array(widgetSchema).describe("Array of widget configs"),
    }),
    handler: async ({ widgets }) => {
      const results: { action: string; type: string }[] = [];

      for (const w of widgets) {
        const internalType = TYPE_MAP[w.type] ?? w.type;
        const colSpan = (w.colSpan ?? DEFAULT_COLSPAN[internalType] ?? 2) as 1 | 2 | 3 | 4;
        const config = w.config ?? {};

        if (internalType === "custom-chart") {
          // Custom charts are always added (not upserted) since there can be many
          const id = `custom-chart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          addWidget({
            id,
            type: "custom-chart",
            colSpan,
            order: getWidgets().length,
            config: config as any,
          });
          results.push({ action: "added", type: w.type });
        } else {
          const { existed } = upsertWidget(
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
          results.push({ action: existed ? "updated" : "added", type: w.type });
        }
      }

      return { widgets: results };
    },
  });
}
