"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
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

export function Shell({ children }: { children: React.ReactNode }) {
  useCopilotReadable({
    description: "Key performance indicators for the company",
    value: JSON.stringify(kpis),
  });

  useCopilotReadable({
    description: "List of all invoices with client, amount, status, and dates",
    value: JSON.stringify(invoices),
  });

  useCopilotReadable({
    description: "Chart of accounts with balances and types",
    value: JSON.stringify(accounts),
  });

  useCopilotReadable({
    description: "Recent financial transactions",
    value: JSON.stringify(transactions),
  });

  useCopilotReadable({
    description: "Inventory items with stock levels and locations",
    value: JSON.stringify(inventoryItems),
  });

  useCopilotReadable({
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
        defaultOpen={false}
        clickOutsideToClose={false}
        labels={{
          title: "FinanceOS AI",
          initial: "Hi! I'm your AI finance assistant. I can help you analyze invoices, review accounts, check inventory, manage HR data, and provide financial insights. What would you like to explore?",
        }}
      />
    </div>
  );
}
