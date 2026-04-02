import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useUpdateDashboardLayout() {
  const { getWidgets, setWidgets } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "update_dashboard_layout",
    description:
      "Reorder or resize multiple dashboard widgets at once. Provide an array of updates with widgetId and optional new colSpan or order values.",
    parameters: z.object({
      updates: z
        .array(
          z.object({
            widgetId: z.string().describe("The widget ID to update"),
            colSpan: z
              .number()
              .min(1)
              .max(4)
              .optional()
              .describe("New column span (1-4)"),
            order: z.number().optional().describe("New sort order"),
          })
        )
        .describe("Array of widget updates"),
    }),
    handler: async ({ updates }) => {
      const updatedWidgets = getWidgets().map((w) => {
        const update = updates.find((u) => u.widgetId === w.id);
        if (!update) return w;
        return {
          ...w,
          ...(update.colSpan !== undefined && { colSpan: update.colSpan as 1 | 2 | 3 | 4 }),
          ...(update.order !== undefined && { order: update.order }),
        } as typeof w;
      });
      setWidgets(updatedWidgets);
      return { action: "updated", widgetType: `${updates.length} widget(s)` };
    },
  });
}
