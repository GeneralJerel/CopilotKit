import { useFrontendTool } from "@copilotkit/react-core/v2";
import { useRouter } from "next/navigation";
import { z } from "zod";

const routes: Record<string, string> = {
  dashboard: "/",
  invoices: "/invoices",
  accounts: "/accounts",
  inventory: "/inventory",
  hr: "/hr",
};

export function useNavigateAndFilter() {
  const router = useRouter();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "navigate_and_filter",
    description:
      "Navigate to an ERP page and optionally apply a filter. Use this when the user asks to see specific data (e.g. 'show me overdue invoices', 'go to inventory').",
    parameters: z.object({
      page: z.enum(["dashboard", "invoices", "accounts", "inventory", "hr"]),
      filter: z
        .string()
        .optional()
        .describe(
          "Filter to apply. Invoices: paid|pending|overdue|draft. Inventory: in-stock|low-stock|out-of-stock. HR: department name."
        ),
    }),
    handler: async ({ page, filter }) => {
      const base = routes[page];
      const url = filter ? `${base}?filter=${encodeURIComponent(filter)}` : base;
      router.push(url);
      return { navigated: true, url };
    },
  });
}
