"use client";

import {
  CopilotSidebar,
  CopilotSidebarView,
  useAgentContext,
  useAgent,
} from "@copilotkit/react-core/v2";
import { cn } from "@/lib/utils";
import { useNavigateAndFilter } from "@/hooks/use-navigate-and-filter";
import { useRenderChart } from "@/hooks/use-render-chart";
import { useRenderCashPosition } from "@/hooks/use-render-cash-position";
import { useApproveInvoicePayment } from "@/hooks/use-approve-invoice-payment";
import { useApproveInventoryReorder } from "@/hooks/use-approve-inventory-reorder";
import { Sidebar } from "./sidebar";
import {
  kpis,
  invoices,
  accounts,
  transactions,
  inventoryItems,
  employees,
} from "@/lib/data";

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
  useAgentContext({
    description: "Key performance indicators for the company",
    value: JSON.stringify(kpis),
  });

  useAgentContext({
    description: "List of all invoices with client, amount, status, and dates",
    value: JSON.stringify(invoices),
  });

  useAgentContext({
    description: "Chart of accounts with balances and types",
    value: JSON.stringify(accounts),
  });

  useAgentContext({
    description: "Recent financial transactions",
    value: JSON.stringify(transactions),
  });

  useAgentContext({
    description: "Inventory items with stock levels and locations",
    value: JSON.stringify(inventoryItems),
  });

  useAgentContext({
    description: "Employee directory with roles, departments, and salaries",
    value: JSON.stringify(employees),
  });

  // Frontend tools
  useNavigateAndFilter();
  useRenderChart();
  useRenderCashPosition();

  // Human-in-the-loop
  useApproveInvoicePayment();
  useApproveInventoryReorder();

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />
      <main className="ml-[72px] flex-1 overflow-y-auto">{children}</main>
      <CopilotSidebar
        agentId="finance_erp_agent"
        defaultOpen={false}
        welcomeScreen={FinanceSidebarWelcomeScreen}
        labels={{
          modalHeaderTitle: "FinanceOS AI",
          welcomeMessageText: "Ask about invoices, accounts, inventory, or HR.",
        }}
      />
    </div>
  );
}
