import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";

export function useResetDashboard() {
  const { resetToDefault } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "reset_dashboard",
    description:
      "Reset the dashboard to its default layout with all standard widgets: KPI cards, Revenue chart, Expense breakdown, Recent transactions, and Outstanding invoices.",
    parameters: z.object({}),
    handler: async () => {
      resetToDefault();
      return { action: "reset" };
    },
  });
}
