import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useDashboard } from "@/context/dashboard-context";


export function useRenderExpenseBreakdown() {
  const { widgets, addWidget, updateWidget } = useDashboard();

  useFrontendTool({
    agentId: "finance_erp_agent",
    name: "render_expense_breakdown",
    description:
      "Add or update the Expense Breakdown widget on the dashboard. Shows expenses by category with progress bars.",
    parameters: z.object({
      categories: z
        .array(z.string())
        .optional()
        .describe(
          "Filter to specific expense categories. Options: 'Payroll', 'Operations', 'Marketing', 'Infrastructure', 'R&D', 'Other'. Omit to show all."
        ),
      colSpan: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe("Grid column span (1-4). Default: 1"),
    }),
    handler: async ({ categories, colSpan }) => {
      const existing = widgets.find((w) => w.type === "expense-breakdown");
      if (existing) {
        updateWidget(existing.id, { config: { categories }, colSpan: (colSpan ?? existing.colSpan) as 1 | 2 | 3 | 4 });
      } else {
        addWidget({
          id: `expense-breakdown-${Date.now()}`,
          type: "expense-breakdown",
          colSpan: (colSpan ?? 1) as 1 | 2 | 3 | 4,
          order: widgets.length,
          config: { categories },
        });
      }
      return { action: existing ? "updated" : "added", widgetType: "Expense Breakdown" };
    },
  });
}
