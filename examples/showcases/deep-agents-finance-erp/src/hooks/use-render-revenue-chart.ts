import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useRenderRevenueChart() {
  const { upsertWidget } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_revenue_chart",
    description:
      "Add or update the Revenue vs Expenses area chart on the dashboard. Shows monthly revenue, expenses, and profit trends.",
    parameters: z.object({
      showProfit: z.boolean().optional().describe("Show the profit line. Default: true"),
      showExpenses: z.boolean().optional().describe("Show the expenses line. Default: true"),
      colSpan: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe("Grid column span (1-4). Default: 3"),
    }),
    handler: async ({ showProfit, showExpenses, colSpan }) => {
      const config = {
        showProfit: showProfit ?? true,
        showExpenses: showExpenses ?? true,
      };
      const { existed } = upsertWidget(
        "revenue-chart",
        (order) => ({
          id: `revenue-chart-${Date.now()}`,
          type: "revenue-chart",
          colSpan: (colSpan ?? 3) as 1 | 2 | 3 | 4,
          order,
          config,
        }),
        { config, ...(colSpan !== undefined && { colSpan: colSpan as 1 | 2 | 3 | 4 }) },
      );
      return { action: existed ? "updated" : "added", widgetType: "Revenue Chart" };
    },
  });
}
