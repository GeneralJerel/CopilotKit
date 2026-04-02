import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useRenderInvoices() {
  const { upsertWidget } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_invoices",
    description:
      "Add or update the Outstanding Invoices table on the dashboard. Shows invoices filtered by status with amounts and due dates.",
    parameters: z.object({
      statuses: z
        .array(z.enum(["pending", "overdue"]))
        .optional()
        .describe("Which invoice statuses to show. Default: ['pending', 'overdue']"),
      colSpan: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe("Grid column span (1-4). Default: 2"),
    }),
    handler: async ({ statuses, colSpan }) => {
      const config = { statuses: statuses ?? ["pending" as const, "overdue" as const] };
      const { existed } = upsertWidget(
        "outstanding-invoices",
        (order) => ({
          id: `outstanding-invoices-${Date.now()}`,
          type: "outstanding-invoices",
          colSpan: (colSpan ?? 2) as 1 | 2 | 3 | 4,
          order,
          config,
        }),
        { config, ...(colSpan !== undefined && { colSpan: colSpan as 1 | 2 | 3 | 4 }) },
      );
      return { action: existed ? "updated" : "added", widgetType: "Outstanding Invoices" };
    },
  });
}
