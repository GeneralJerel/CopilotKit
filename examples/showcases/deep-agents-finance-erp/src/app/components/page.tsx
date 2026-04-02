"use client";

import { InlineChatChart } from "@/components/chat/inline-chart";
import { CashPositionCard } from "@/components/chat/cash-position-card";
import { InvoiceApprovalCard } from "@/components/chat/invoice-approval-card";
import { InventoryReorderCard } from "@/components/chat/inventory-reorder-card";
import { KPICard } from "@/components/ui/kpi-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { ExpenseChart } from "@/components/charts/expense-chart";
import { DashboardCustomChart } from "@/components/dashboard/dashboard-custom-chart";
import { WidgetRenderer } from "@/components/dashboard/widget-renderer";
import { ToolCallStatus } from "@copilotkit/react-core/v2";
import { kpis } from "@/lib/data";
import type { DashboardWidget } from "@/types/dashboard";

// ---------------------------------------------------------------------------
// Mock data for each frontend tool
// ---------------------------------------------------------------------------

const chartAreaArgs = {
  title: "Revenue Trend (FY2025)",
  type: "area" as const,
  data: [
    { label: "Q1", value: 628000, value2: 383000 },
    { label: "Q2", value: 696000, value2: 390000 },
    { label: "Q3", value: 851000, value2: 435000 },
    { label: "Q4", value: 951000, value2: 457000 },
  ],
  series: [
    { key: "value", color: "#2563eb", label: "Revenue" },
    { key: "value2", color: "#fb7185", label: "Expenses" },
  ],
};

const chartBarArgs = {
  title: "Expense Comparison by Quarter",
  type: "bar" as const,
  data: [
    { label: "Q1", value: 340000 },
    { label: "Q2", value: 355000 },
    { label: "Q3", value: 370000 },
    { label: "Q4", value: 390000 },
  ],
  series: [{ key: "value", color: "#8b5cf6", label: "Expenses" }],
};

const chartLineArgs = {
  title: "Cash Flow Forecast (Next 4 Quarters)",
  type: "line" as const,
  data: [
    { label: "Q2 2026", value: 410000, value2: 285000 },
    { label: "Q3 2026", value: 495000, value2: 320000 },
    { label: "Q4 2026", value: 598000, value2: 360000 },
    { label: "Q1 2027", value: 722000, value2: 405000 },
  ],
  series: [
    { key: "value", color: "#10b981", label: "Operating" },
    { key: "value2", color: "#f59e0b", label: "Net" },
  ],
};

const cashPositionArgs = {
  accounts: [
    { name: "Cash & Equivalents", balance: 1245000 },
    { name: "Accounts Receivable", balance: 456200 },
    { name: "Inventory", balance: 312400 },
  ],
  totalCash: 1245000,
  totalLiabilities: 904500,
  netPosition: 340500,
};

const invoiceApprovalArgs = {
  invoices: [
    {
      number: "INV-2026-003",
      client: "Initech LLC",
      amount: 67200,
      dueDate: "2026-03-15",
    },
    {
      number: "INV-2026-002",
      client: "Globex Industries",
      amount: 28500,
      dueDate: "2026-04-10",
    },
  ],
  totalAmount: 95700,
  action: "Process payment for overdue invoices",
};

const inventoryReorderArgs = {
  items: [
    {
      sku: "HW-LAP-001",
      name: 'MacBook Pro 16"',
      currentQty: 3,
      reorderQty: 15,
      unitCost: 2499,
    },
    {
      sku: "HW-NET-001",
      name: "Cisco Catalyst 9300",
      currentQty: 0,
      reorderQty: 5,
      unitCost: 4200,
    },
    {
      sku: "HW-LAP-002",
      name: "ThinkPad X1 Carbon",
      currentQty: 8,
      reorderQty: 10,
      unitCost: 1849,
    },
  ],
  estimatedTotal: 76975,
  supplier: "CDW Direct",
};

const customChartConfig = {
  title: "Revenue Forecast — Scenario Analysis",
  chartType: "line" as const,
  data: [
    { label: "Q2 2026", value: 1050000, value2: 870000 },
    { label: "Q3 2026", value: 1160000, value2: 920000 },
    { label: "Q4 2026", value: 1280000, value2: 975000 },
    { label: "Q1 2027", value: 1150000, value2: 840000 },
  ],
  series: [
    { key: "value", color: "#10b981", label: "Optimistic" },
    { key: "value2", color: "#f59e0b", label: "Conservative" },
  ],
};

const dashboardWidgets: DashboardWidget[] = [
  {
    id: "demo-kpi",
    type: "kpi-cards",
    colSpan: 4,
    order: 0,
    config: {},
  },
  {
    id: "demo-revenue",
    type: "revenue-chart",
    colSpan: 2,
    order: 1,
    config: {},
  },
  {
    id: "demo-expense",
    type: "expense-breakdown",
    colSpan: 2,
    order: 2,
    config: {},
  },
  {
    id: "demo-transactions",
    type: "recent-transactions",
    colSpan: 2,
    order: 3,
    config: { limit: 3 },
  },
  {
    id: "demo-invoices",
    type: "outstanding-invoices",
    colSpan: 2,
    order: 4,
    config: {},
  },
];

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------

function Section({
  title,
  toolName,
  description,
  children,
}: {
  title: string;
  toolName: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <code className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {toolName}
          </code>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Frontend Tool Components
          </h1>
          <p className="mt-2 text-muted-foreground">
            All components registered via <code className="rounded bg-card px-1.5 py-0.5 text-sm">useFrontendTool</code> rendered with mock data.
          </p>
        </div>

        <div className="space-y-8">
          {/* ---- Chat-rendered tools ---- */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chat-rendered Components
            </h3>
            <div className="space-y-6">
              <Section
                title="Inline Chart (Area)"
                toolName="render_chart"
                description="Area chart for trends over time — rendered inline in chat."
              >
                <InlineChatChart args={chartAreaArgs} status="complete" />
              </Section>

              <Section
                title="Inline Chart (Bar)"
                toolName="render_chart"
                description="Bar chart for category comparisons — rendered inline in chat."
              >
                <InlineChatChart args={chartBarArgs} status="complete" />
              </Section>

              <Section
                title="Inline Chart (Line)"
                toolName="render_chart"
                description="Line chart for projections and forecasts — rendered inline in chat."
              >
                <InlineChatChart args={chartLineArgs} status="complete" />
              </Section>

              <Section
                title="Cash Position Card"
                toolName="render_cash_position"
                description="Summary card showing cash vs liabilities and net position."
              >
                <div className="max-w-md">
                  <CashPositionCard
                    args={cashPositionArgs}
                    status="complete"
                  />
                </div>
              </Section>

              <Section
                title="Invoice Approval (Executing)"
                toolName="approve_invoice_payment"
                description="Human-in-the-loop approval card for invoice payments. Shown in executing state with action buttons."
              >
                <div className="max-w-lg">
                  <InvoiceApprovalCard
                    status={ToolCallStatus.Executing}
                    args={invoiceApprovalArgs}
                    respond={async (result) => {
                      alert(JSON.stringify(result, null, 2));
                    }}
                    result={undefined}
                  />
                </div>
              </Section>

              <Section
                title="Invoice Approval (Approved)"
                toolName="approve_invoice_payment"
                description="Invoice approval card after user approved payment."
              >
                <div className="max-w-lg">
                  <InvoiceApprovalCard
                    status={ToolCallStatus.Complete}
                    args={invoiceApprovalArgs}
                    respond={undefined}
                    result="Payment approved for 2 invoices"
                  />
                </div>
              </Section>

              <Section
                title="Inventory Reorder (Executing)"
                toolName="approve_inventory_reorder"
                description="Human-in-the-loop purchase order review. Shown in executing state."
              >
                <div className="max-w-lg">
                  <InventoryReorderCard
                    status={ToolCallStatus.Executing}
                    args={inventoryReorderArgs}
                    respond={async (result) => {
                      alert(JSON.stringify(result, null, 2));
                    }}
                    result={undefined}
                  />
                </div>
              </Section>

              <Section
                title="Inventory Reorder (Approved)"
                toolName="approve_inventory_reorder"
                description="Purchase order card after user approved the reorder."
              >
                <div className="max-w-lg">
                  <InventoryReorderCard
                    status={ToolCallStatus.Complete}
                    args={inventoryReorderArgs}
                    respond={undefined}
                    result="PO approved for 3 items"
                  />
                </div>
              </Section>
            </div>
          </div>

          {/* ---- Dashboard widget tools ---- */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dashboard Widget Components
            </h3>
            <div className="space-y-6">
              <Section
                title="KPI Cards"
                toolName="render_kpi_cards"
                description="Key performance indicator cards. Config: metrics (optional label filter), colSpan."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {kpis.map((kpi) => (
                    <KPICard key={kpi.label} kpi={kpi} />
                  ))}
                </div>
              </Section>

              <Section
                title="Revenue vs Expenses Chart"
                toolName="render_revenue_chart"
                description="Monthly revenue, expenses, and profit area chart. Config: showProfit, showExpenses, colSpan."
              >
                <RevenueChart />
              </Section>

              <Section
                title="Expense Breakdown"
                toolName="render_expense_breakdown"
                description="Expense breakdown by category with progress bars. Config: categories (optional filter), colSpan."
              >
                <ExpenseChart />
              </Section>

              <Section
                title="Recent Transactions"
                toolName="render_transactions"
                description="Transaction ledger table. Config: limit, colSpan."
              >
                <WidgetRenderer
                  widget={{
                    id: "demo-txn",
                    type: "recent-transactions",
                    colSpan: 4,
                    order: 0,
                    config: { limit: 5 },
                  }}
                />
              </Section>

              <Section
                title="Outstanding Invoices"
                toolName="render_invoices"
                description="Pending and overdue invoices table. Config: statuses, colSpan."
              >
                <WidgetRenderer
                  widget={{
                    id: "demo-inv",
                    type: "outstanding-invoices",
                    colSpan: 4,
                    order: 0,
                    config: {},
                  }}
                />
              </Section>

              <Section
                title="Custom Chart (Dashboard)"
                toolName="render_custom_chart"
                description="Agent-generated chart rendered on the dashboard canvas. Config: title, chartType, data, series, colSpan."
              >
                <DashboardCustomChart config={customChartConfig} />
              </Section>
            </div>
          </div>

          {/* ---- Management tools (no visual) ---- */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Management Tools (No Visual Component)
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  tool: "remove_dashboard_widget",
                  desc: "Removes a widget by ID from the dashboard.",
                  params: "widgetId: string",
                },
                {
                  tool: "update_dashboard_layout",
                  desc: "Reorder or resize multiple widgets at once.",
                  params: "updates: { widgetId, colSpan?, order? }[]",
                },
                {
                  tool: "reset_dashboard",
                  desc: "Reset the dashboard to its default layout.",
                  params: "(none)",
                },
                {
                  tool: "navigate_and_filter",
                  desc: "Navigate to an ERP page with optional filters.",
                  params: 'page: "dashboard" | "invoices" | ... , filter?: string',
                },
              ].map((t) => (
                <div
                  key={t.tool}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <code className="text-sm font-semibold text-foreground">
                    {t.tool}
                  </code>
                  <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                  <p className="mt-2 rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                    {t.params}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
