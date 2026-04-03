"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { InlineChatChart } from "@/components/chat/inline-chart";
import { CashPositionCard } from "@/components/chat/cash-position-card";

const chartDataSchema = z.object({
  label: z.string().describe("X-axis label"),
  value: z.number().describe("Primary value"),
  value2: z.number().optional().describe("Optional secondary value"),
});

const seriesSchema = z.object({
  key: z.string().describe("Data key: 'value' or 'value2'"),
  color: z.string().describe("Hex color"),
  label: z.string().describe("Legend label"),
});

const accountSchema = z.object({
  name: z.string().describe("Account name"),
  balance: z.number().describe("Account balance in USD"),
});

export function useRenderChatVisual() {
  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_chat_visual",
    description:
      "Render a visual component inline in the chat. Use type 'chart' for interactive charts (trends, comparisons, projections) or 'cash_position' for a cash summary card (cash vs liabilities).",
    parameters: z.object({
      type: z
        .enum(["chart", "cash_position"])
        .describe("Visual type: 'chart' or 'cash_position'"),
      title: z.string().describe("Title displayed on the visual"),
      data: z.array(chartDataSchema).default([]).describe("Chart data points"),
      series: z.array(seriesSchema).default([]).describe("Chart series config"),
      chartType: z
        .enum(["area", "bar", "line"])
        .optional()
        .describe("(chart) Chart subtype: area for trends, bar for comparisons, line for trajectories"),
      accounts: z
        .array(accountSchema)
        .optional()
        .describe("(cash_position) Cash and asset accounts"),
      totalCash: z.number().optional().describe("(cash_position) Total cash"),
      totalLiabilities: z.number().optional().describe("(cash_position) Total liabilities"),
      netPosition: z.number().optional().describe("(cash_position) Net position = totalCash - totalLiabilities"),
    }),
    handler: async () => {
      return { rendered: true };
    },
    render: ({ args, status }) => {
      if (args?.type === "cash_position") {
        return (
          <CashPositionCard
            status={status}
            args={{
              accounts: args.accounts ?? [],
              totalCash: args.totalCash ?? 0,
              totalLiabilities: args.totalLiabilities ?? 0,
              netPosition: args.netPosition ?? 0,
            }}
          />
        );
      }
      return (
        <InlineChatChart
          status={status}
          args={{
            title: args?.title ?? "",
            type: (args?.chartType ?? "area") as "area" | "bar" | "line",
            data: args?.data ?? [],
            series: args?.series ?? [],
          }}
        />
      );
    },
  });
}
