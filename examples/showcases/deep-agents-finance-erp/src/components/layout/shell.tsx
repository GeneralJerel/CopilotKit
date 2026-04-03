"use client";

import {
  CopilotSidebar,
  CopilotSidebarView,
  useAgentContext,
  useAgent,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { cn } from "@/lib/utils";
import { useNavigateAndFilter } from "@/hooks/use-navigate-and-filter";
import { useRenderChart } from "@/hooks/use-render-chart";
import { useRenderCashPosition } from "@/hooks/use-render-cash-position";
import { useApproveInvoicePayment } from "@/hooks/use-approve-invoice-payment";
import { useApproveInventoryReorder } from "@/hooks/use-approve-inventory-reorder";
import { useRenderKpiCards } from "@/hooks/use-render-kpi-cards";
import { useRenderRevenueChart } from "@/hooks/use-render-revenue-chart";
import { useRenderExpenseBreakdown } from "@/hooks/use-render-expense-breakdown";
import { useRenderTransactions } from "@/hooks/use-render-transactions";
import { useRenderInvoices } from "@/hooks/use-render-invoices";
import { useRenderCustomChart } from "@/hooks/use-render-custom-chart";
import { useRemoveDashboardWidget } from "@/hooks/use-remove-dashboard-widget";
import { useUpdateDashboardLayout } from "@/hooks/use-update-dashboard-layout";
import { useResetDashboard } from "@/hooks/use-reset-dashboard";
import { DashboardProvider, useDashboard } from "@/context/dashboard-context";
import { Sidebar } from "./sidebar";
import { kpis } from "@/lib/data";

const demoSuggestions = [
  {
    title: "Cash Position",
    message:
      "What's our current cash position and how does it compare to our liabilities?",
  },
  {
    title: "Overdue Invoices",
    message: "Show me all overdue invoices",
  },
  {
    title: "Cash Flow Chart",
    message: "Give me a visual cash flow projection for the next 4 quarters",
  },
  {
    title: "Approve Payments",
    message: "Process payment for all overdue invoices",
  },
  {
    title: "Reorder Inventory",
    message: "Check inventory levels and reorder anything that needs restocking",
  },
  {
    title: "Cash Flow Dashboard",
    message:
      "Build me a dashboard focused on cash flow risk — show AR aging, overdue invoices at the top, and a quarterly cash projection",
  },
  {
    title: "Cost Control Dashboard",
    message:
      "I'm concerned about the Marketing overspend — set up a cost control view with budget tracking and spending trends",
  },
];

function FinanceSidebarWelcomeScreen({
  input,
  suggestionView,
  welcomeMessage,
  className,
  ...props
}: React.ComponentProps<typeof CopilotSidebarView.WelcomeScreen>) {
  const { agent } = useAgent({ agentId: "finance_erp_agent" });

  const handlePromptClick = (message: string) => {
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    });
    void agent.runAgent();
  };

  return (
    <div className={cn("cpk:h-full cpk:flex cpk:flex-col", className)} {...props}>
      <div className="cpk:flex-1" />

      <div className="cpk:px-8 cpk:pb-4">
        <div className="cpk:mx-auto cpk:flex cpk:max-w-3xl cpk:flex-col cpk:items-center">
          <h2 className="cpk:mb-4 cpk:max-w-md cpk:text-center cpk:font-heading cpk:text-3xl cpk:font-medium cpk:leading-tight cpk:text-foreground">
            Ask about invoices, accounts, inventory, or HR.
          </h2>
          <div className="cpk:mb-4 cpk:flex cpk:max-w-md cpk:flex-wrap cpk:justify-center cpk:gap-3">
            {demoSuggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                type="button"
                onClick={() => handlePromptClick(suggestion.message)}
                className="cpk:rounded-full cpk:border cpk:border-border cpk:bg-background cpk:px-4 cpk:py-2 cpk:text-sm cpk:font-medium cpk:text-foreground cpk:transition-colors hover:cpk:border-primary hover:cpk:bg-muted"
              >
                {suggestion.title}
              </button>
            ))}
          </div>
          <div className="cpk:w-full">{input}</div>
        </div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <ShellInner>{children}</ShellInner>
    </DashboardProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { widgets } = useDashboard();

  // Lightweight context — detailed data is available via backend research tools
  useAgentContext({
    description: "Key performance indicators for the company",
    value: kpis,
  });

  // Dashboard layout context — agent uses this to know current widget IDs and configuration
  useAgentContext({
    description:
      "Current dashboard layout — list of widgets with their IDs, types, column spans, order, and configuration. Use widget IDs when removing or updating widgets.",
    value: widgets,
  });

  // Render the internal "task" tool (subagent delegation) as a clean loading state
  useRenderTool(
    {
      name: "task",
      render: ({ status, args }) => {
        if (status === "complete") return null;
        const label =
          args?.subagent_type === "projections"
            ? "Running projections..."
            : "Researching...";
        return (
          <p className="text-sm text-muted-foreground animate-pulse py-1">
            {label}
          </p>
        );
      },
    },
    [],
  );

  // Existing frontend tools (render in chat)
  useNavigateAndFilter();
  useRenderChart();
  useRenderCashPosition();

  // Human-in-the-loop
  useApproveInvoicePayment();
  useApproveInventoryReorder();

  // Dashboard widget tools (render on dashboard page)
  useRenderKpiCards();
  useRenderRevenueChart();
  useRenderExpenseBreakdown();
  useRenderTransactions();
  useRenderInvoices();
  useRenderCustomChart();

  // Dashboard management tools
  useRemoveDashboardWidget();
  useUpdateDashboardLayout();
  useResetDashboard();

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />
      <main className="ml-[72px] flex-1 overflow-y-auto">{children}</main>
      <CopilotSidebar
        agentId="finance_erp_agent"
        defaultOpen={false}
        welcomeScreen={FinanceSidebarWelcomeScreen}
        instructions="You are the FinanceOS AI assistant. Always use the research subagent for data queries and the projections subagent for forecasts. Prefer rendering rich UI components (charts, cards, dashboard widgets) over plain text whenever possible."
        labels={{
          modalHeaderTitle: "FinanceOS AI",
          welcomeMessageText: "Ask about invoices, accounts, inventory, or HR.",
        }}
      />
    </div>
  );
}
