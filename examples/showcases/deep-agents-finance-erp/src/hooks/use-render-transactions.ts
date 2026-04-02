import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useRenderTransactions() {
  const { upsertWidget } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_transactions",
    description:
      "Add or update the Recent Transactions table on the dashboard. Shows the latest financial transactions with descriptions, amounts, and status.",
    parameters: z.object({
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Number of transactions to display. Default: 5"),
      colSpan: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe("Grid column span (1-4). Default: 2"),
    }),
    handler: async ({ limit, colSpan }) => {
      const config = { limit: limit ?? 5 };
      const { existed } = upsertWidget(
        "recent-transactions",
        (order) => ({
          id: `recent-transactions-${Date.now()}`,
          type: "recent-transactions",
          colSpan: (colSpan ?? 2) as 1 | 2 | 3 | 4,
          order,
          config,
        }),
        { config, ...(colSpan !== undefined && { colSpan: colSpan as 1 | 2 | 3 | 4 }) },
      );
      return { action: existed ? "updated" : "added", widgetType: "Recent Transactions" };
    },
  });
}
