import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useManageDashboard() {
  const { getWidgets, setWidgets, removeWidget, resetToDefault } =
    useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "manage_dashboard",
    description:
      "Manage the dashboard layout: 'reset' restores defaults, 'remove' deletes a widget by ID, 'reorder' resizes or reorders widgets.",
    parameters: z.object({
      action: z
        .enum(["reset", "remove", "reorder"])
        .describe("Action to perform"),
      widgetId: z
        .string()
        .optional()
        .describe("(remove) ID of the widget to remove"),
      updates: z
        .array(
          z.object({
            widgetId: z.string().describe("Widget ID"),
            colSpan: z
              .number()
              .min(1)
              .max(4)
              .optional()
              .describe("New column span"),
            order: z.number().optional().describe("New sort order"),
          })
        )
        .optional()
        .describe("(reorder) Array of widget updates"),
    }),
    handler: async ({ action, widgetId, updates }) => {
      if (action === "reset") {
        resetToDefault();
        return { action: "reset" };
      }

      if (action === "remove" && widgetId) {
        const widget = getWidgets().find((w) => w.id === widgetId);
        removeWidget(widgetId);
        return {
          action: "removed",
          widgetType: widget?.type ?? widgetId,
        };
      }

      if (action === "reorder" && updates) {
        const updatedWidgets = getWidgets().map((w) => {
          const update = updates.find((u) => u.widgetId === w.id);
          if (!update) return w;
          return {
            ...w,
            ...(update.colSpan !== undefined && {
              colSpan: update.colSpan as 1 | 2 | 3 | 4,
            }),
            ...(update.order !== undefined && { order: update.order }),
          } as typeof w;
        });
        setWidgets(updatedWidgets);
        return { action: "reordered", count: updates.length };
      }

      return { action };
    },
  });
}
