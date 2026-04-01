"use client";

import {
  CopilotSidebar,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useNavigateAndFilter } from "@/hooks/use-navigate-and-filter";
import { useRenderChart } from "@/hooks/use-render-chart";
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

export function Shell({ children }: { children: React.ReactNode }) {
  useConfigureSuggestions({
    suggestions: demoSuggestions,
    available: "always",
  });

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
        labels={{
          modalHeaderTitle: "FinanceOS AI",
          welcomeMessageText:
            "Hi! I'm your AI finance assistant. I can help you analyze invoices, review accounts, check inventory, manage HR data, and provide financial insights. What would you like to explore?",
        }}
      />
    </div>
  );
}
