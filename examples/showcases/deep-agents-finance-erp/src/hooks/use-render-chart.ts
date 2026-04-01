import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { InlineChatChart } from "@/components/chat/inline-chart";

export function useRenderChart() {
  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_chart",
    description:
      "Render an interactive chart directly in the chat. Use this when the user asks for visualizations, projections, or trends. Choose the best chart type: 'area' for trends over time, 'bar' for comparisons, 'line' for trajectories.",
    parameters: z.object({
      title: z.string().describe("Chart title"),
      type: z
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
    }),
    handler: async () => {
      return { rendered: true };
    },
    render: InlineChatChart,
  });
}
