import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useRenderCustomChart() {
  const { addWidget, getWidgets } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_custom_chart",
    description:
      "Add a custom chart to the dashboard with agent-provided data. Use this when the user wants a new visualization on their dashboard (forecasts, projections, custom analysis). Each call creates a new chart widget.",
    parameters: z.object({
      title: z.string().describe("Chart title displayed on the dashboard card"),
      chartType: z
        .enum(["area", "bar", "line"])
        .describe("Chart type: area for trends, bar for comparisons, line for trajectories"),
      data: z
        .array(
          z.object({
            label: z.string().describe("X-axis label (e.g. month name, category)"),
            value: z.number().describe("Primary value"),
            value2: z.number().optional().describe("Optional secondary value for comparison"),
          })
        )
        .describe("Chart data points"),
      series: z
        .array(
          z.object({
            key: z.string().describe("Data key: 'value' or 'value2'"),
            color: z.string().describe("Hex color for this series"),
            label: z.string().describe("Legend label"),
          })
        )
        .describe("Series configuration for the chart"),
      colSpan: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe("Grid column span (1-4). Default: 2"),
    }),
    handler: async ({ title, chartType, data, series, colSpan }) => {
      const id = `custom-chart-${Date.now()}`;
      addWidget({
        id,
        type: "custom-chart",
        colSpan: (colSpan ?? 2) as 1 | 2 | 3 | 4,
        order: getWidgets().length,
        config: { title, chartType, data, series },
      });
      return { action: "added", widgetType: title };
    },
  });
}
