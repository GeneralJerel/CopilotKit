import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useRemoveDashboardWidget() {
  const { getWidgets, removeWidget } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "remove_dashboard_widget",
    description:
      "Remove a widget from the dashboard by its ID. Check the current dashboard layout context to find widget IDs.",
    parameters: z.object({
      widgetId: z.string().describe("The ID of the widget to remove"),
    }),
    handler: async ({ widgetId }) => {
      const widget = getWidgets().find((w) => w.id === widgetId);
      const widgetType = widget?.type ?? widgetId;
      removeWidget(widgetId);
      return { action: "removed", widgetType, widgetId };
    },
  });
}
