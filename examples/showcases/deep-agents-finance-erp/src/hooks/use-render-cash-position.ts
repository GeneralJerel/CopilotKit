import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { CashPositionCard } from "@/components/chat/cash-position-card";

export function useRenderCashPosition() {
  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_cash_position",
    description:
      "Render a cash position summary card in the chat showing cash accounts, liabilities, and net position. Use this when the user asks about their cash position, liquidity, or cash vs liabilities.",
    parameters: z.object({
      accounts: z
        .array(
          z.object({
            name: z.string().describe("Account name"),
            balance: z.number().describe("Account balance in USD"),
          })
        )
        .describe("Cash and asset accounts to display"),
      totalCash: z.number().describe("Total cash and cash equivalents"),
      totalLiabilities: z.number().describe("Total liabilities"),
      netPosition: z
        .number()
        .describe("Net position (totalCash - totalLiabilities)"),
    }),
    handler: async () => {
      return { rendered: true };
    },
    render: CashPositionCard,
  });
}
