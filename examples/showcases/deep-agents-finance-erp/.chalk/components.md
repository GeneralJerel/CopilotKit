# Component & Hook Definitions

All new frontend components and hook registrations needed to power the demo scenarios. Each component maps to a CopilotKit primitive (`useFrontendTool` or `useHumanInTheLoop`).

---

## 1. Navigate + Filter — `useFrontendTool`

### Hook: `useNavigateAndFilter`

**File:** `src/hooks/use-navigate-and-filter.ts`

```ts
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
```

**Registration:** Call `useNavigateAndFilter()` inside `Shell` component.

### Page Updates (URL-param filtering)

Pages read the `filter` search param and use it to control displayed data and active filter button.

**Pattern (apply to `invoices/page.tsx`, `inventory/page.tsx`, `hr/page.tsx`):**

```tsx
// Page component receives searchParams from Next.js App Router
export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  // ... use filter to control data display
}

// Filter buttons become Links:
<Link
  href={f === "all" ? "/invoices" : `/invoices?filter=${f}`}
  className={cn(
    "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
    activeFilter === f
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
  )}
>
  {f}
</Link>

// Data filtering:
const activeFilter = filter || "all";
const filtered =
  activeFilter === "all"
    ? invoices
    : invoices.filter((inv) => inv.status === activeFilter);
```

---

## 2. Inline Chat Charts — `useFrontendTool` with render

### Hook: `useRenderChart`

**File:** `src/hooks/use-render-chart.ts`

```ts
import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { InlineChatChart } from "@/components/chat/inline-chart";

export function useRenderChart() {
  useFrontendTool({
    name: "render_chart",
    description:
      "Render an interactive chart directly in the chat. Use this when the user asks for visualizations, projections, or trends. Choose the best chart type: 'area' for trends over time, 'bar' for comparisons, 'line' for trajectories.",
    parameters: z.object({
      title: z.string().describe("Chart title"),
      type: z
        .enum(["area", "bar", "line"])
        .describe("Chart type: area for trends, bar for comparisons, line for trajectories"),
      data: z
        .array(
          z.object({
            label: z.string().describe("X-axis label (e.g. month name, category)"),
            value: z.number().describe("Primary value"),
            value2: z.number().optional().describe("Optional secondary value for comparison"),
          })
        )
        .describe("Chart data points"),
      series: z
        .array(
          z.object({
            key: z.string().describe("Data key: 'value' or 'value2'"),
            color: z.string().describe("Hex color for this series"),
            label: z.string().describe("Legend label"),
          })
        )
        .describe("Series configuration for the chart"),
    }),
    handler: async () => {
      return { rendered: true };
    },
    render: InlineChatChart,
  });
}
```

### Render Component: `InlineChatChart`

**File:** `src/components/chat/inline-chart.tsx`

```tsx
"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartArgs = {
  title: string;
  type: "area" | "bar" | "line";
  data: { label: string; value: number; value2?: number }[];
  series: { key: string; color: string; label: string }[];
};

type Props = {
  args: ChartArgs | Partial<ChartArgs>;
  status: string;
};

export function InlineChatChart({ args, status }: Props) {
  const { title, type, data, series } = args as ChartArgs;

  if (status === "inProgress" || !data || !series) {
    return (
      <div className="my-2 rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-[180px] animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.label, ...d }));

  const renderChart = () => {
    const commonProps = { data: chartData, margin: { top: 5, right: 10, left: -10, bottom: 5 } };

    switch (type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} fill={s.color} name={s.label} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} name={s.label} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        );
      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {series.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.15} name={s.label} strokeWidth={2} />
            ))}
          </AreaChart>
        );
    }
  };

  return (
    <div className="my-2 rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-gray-900">{title}</p>
      <ResponsiveContainer width="100%" height={200}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
```

**Registration:** Call `useRenderChart()` inside `Shell` component.

---

## 3. Invoice Payment Approval — `useHumanInTheLoop`

### Hook: `useApproveInvoicePayment`

**File:** `src/hooks/use-approve-invoice-payment.ts`

```ts
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { InvoiceApprovalCard } from "@/components/chat/invoice-approval-card";

export function useApproveInvoicePayment() {
  useHumanInTheLoop({
    name: "approve_invoice_payment",
    description:
      "Present overdue or pending invoices to the user for payment approval. The agent MUST use this tool before marking any invoice as paid. Never process payments without explicit user approval.",
    parameters: z.object({
      invoices: z
        .array(
          z.object({
            number: z.string().describe("Invoice number, e.g. INV-2026-003"),
            client: z.string().describe("Client name"),
            amount: z.number().describe("Invoice amount in USD"),
            dueDate: z.string().describe("Due date in YYYY-MM-DD format"),
          })
        )
        .describe("Invoices to present for payment approval"),
      totalAmount: z.number().describe("Sum of all invoice amounts"),
      action: z
        .string()
        .describe("Description of the action, e.g. 'Mark 3 invoices as paid'"),
    }),
    render: InvoiceApprovalCard,
  });
}
```

### Render Component: `InvoiceApprovalCard`

**File:** `src/components/chat/invoice-approval-card.tsx`

```tsx
"use client";

import { DollarSign, Check, X } from "lucide-react";
import { ToolCallStatus } from "@copilotkit/core";

type InvoiceRow = {
  number: string;
  client: string;
  amount: number;
  dueDate: string;
};

type Args = {
  invoices: InvoiceRow[];
  totalAmount: number;
  action: string;
};

type Props =
  | { status: ToolCallStatus.InProgress; args: Partial<Args>; respond: undefined; result: undefined }
  | { status: ToolCallStatus.Executing; args: Args; respond: (result: unknown) => Promise<void>; result: undefined }
  | { status: ToolCallStatus.Complete; args: Args; respond: undefined; result: string };

export function InvoiceApprovalCard(props: Props) {
  const { status, args } = props;

  // Loading state while args stream in
  if (status === ToolCallStatus.InProgress) {
    return (
      <div className="my-2 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 text-gray-400">
          <DollarSign className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Reviewing invoices...</span>
        </div>
      </div>
    );
  }

  const { invoices, totalAmount, action } = args as Args;
  const isComplete = status === ToolCallStatus.Complete;
  const result = isComplete ? (props as { result: string }).result : null;
  const wasApproved = result?.includes("approved");

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className={`my-2 rounded-2xl border bg-white p-5 ${isComplete ? "border-gray-100 opacity-80" : "border-gray-200"}`}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
          <DollarSign className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Payment Approval Required</p>
          <p className="text-xs text-gray-500">{action}</p>
        </div>
      </div>

      {/* Invoice table */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">Invoice</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium text-right">Amount</th>
              <th className="px-3 py-2 font-medium text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.number} className="border-b border-gray-50">
                <td className="px-3 py-2 font-mono text-gray-700">{inv.number}</td>
                <td className="px-3 py-2 text-gray-700">{inv.client}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(inv.amount)}</td>
                <td className="px-3 py-2 text-right text-gray-500">{inv.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
          <span className="text-xs font-medium text-gray-500">Total</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Status badge (complete state) */}
      {isComplete && (
        <div className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${wasApproved ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {wasApproved ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {wasApproved ? "Payment Approved" : "Payment Rejected"}
        </div>
      )}

      {/* Action buttons (executing state only) */}
      {status === ToolCallStatus.Executing && (
        <div className="flex gap-2">
          <button
            onClick={() => props.respond({ approved: true, message: `Payment approved for ${invoices.length} invoice(s) totaling ${formatCurrency(totalAmount)}` })}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Approve Payment
          </button>
          <button
            onClick={() => props.respond({ approved: false, message: "Payment rejected by user" })}
            className="flex-1 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
```

**Registration:** Call `useApproveInvoicePayment()` inside `Shell` component.

---

## 4. Inventory Reorder Approval — `useHumanInTheLoop`

### Hook: `useApproveInventoryReorder`

**File:** `src/hooks/use-approve-inventory-reorder.ts`

```ts
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { InventoryReorderCard } from "@/components/chat/inventory-reorder-card";

export function useApproveInventoryReorder() {
  useHumanInTheLoop({
    name: "approve_inventory_reorder",
    description:
      "Present a purchase order for low-stock or out-of-stock items. The agent MUST use this tool before placing any reorder. Wait for user approval before proceeding.",
    parameters: z.object({
      items: z
        .array(
          z.object({
            sku: z.string().describe("Item SKU"),
            name: z.string().describe("Item name"),
            currentQty: z.number().describe("Current quantity in stock"),
            reorderQty: z.number().describe("Proposed quantity to order"),
            unitCost: z.number().describe("Unit cost in USD"),
          })
        )
        .describe("Items to reorder"),
      estimatedTotal: z.number().describe("Total estimated cost of the purchase order"),
      supplier: z.string().optional().describe("Supplier name, if known"),
    }),
    render: InventoryReorderCard,
  });
}
```

### Render Component: `InventoryReorderCard`

**File:** `src/components/chat/inventory-reorder-card.tsx`

```tsx
"use client";

import { Package, Check, SkipForward } from "lucide-react";
import { ToolCallStatus } from "@copilotkit/core";

type ReorderItem = {
  sku: string;
  name: string;
  currentQty: number;
  reorderQty: number;
  unitCost: number;
};

type Args = {
  items: ReorderItem[];
  estimatedTotal: number;
  supplier?: string;
};

type Props =
  | { status: ToolCallStatus.InProgress; args: Partial<Args>; respond: undefined; result: undefined }
  | { status: ToolCallStatus.Executing; args: Args; respond: (result: unknown) => Promise<void>; result: undefined }
  | { status: ToolCallStatus.Complete; args: Args; respond: undefined; result: string };

export function InventoryReorderCard(props: Props) {
  const { status, args } = props;

  if (status === ToolCallStatus.InProgress) {
    return (
      <div className="my-2 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 text-gray-400">
          <Package className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Analyzing inventory levels...</span>
        </div>
      </div>
    );
  }

  const { items, estimatedTotal, supplier } = args as Args;
  const isComplete = status === ToolCallStatus.Complete;
  const result = isComplete ? (props as { result: string }).result : null;
  const wasApproved = result?.includes("approved");

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className={`my-2 rounded-2xl border bg-white p-5 ${isComplete ? "border-gray-100 opacity-80" : "border-gray-200"}`}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Package className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Purchase Order Review</p>
          {supplier && <p className="text-xs text-gray-500">Supplier: {supplier}</p>}
        </div>
      </div>

      {/* Items table */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium text-right">Current</th>
              <th className="px-3 py-2 font-medium text-right">Order</th>
              <th className="px-3 py-2 font-medium text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.sku} className="border-b border-gray-50">
                <td className="px-3 py-2 font-mono text-gray-500">{item.sku}</td>
                <td className="px-3 py-2 text-gray-700">{item.name}</td>
                <td className={`px-3 py-2 text-right font-medium ${item.currentQty === 0 ? "text-red-600" : "text-amber-600"}`}>
                  {item.currentQty}
                </td>
                <td className="px-3 py-2 text-right text-gray-900">{item.reorderQty}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">
                  {formatCurrency(item.reorderQty * item.unitCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
          <span className="text-xs font-medium text-gray-500">Estimated PO Total</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(estimatedTotal)}</span>
        </div>
      </div>

      {/* Status badge (complete state) */}
      {isComplete && (
        <div className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${wasApproved ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
          {wasApproved ? <Check className="h-3.5 w-3.5" /> : <SkipForward className="h-3.5 w-3.5" />}
          {wasApproved ? "PO Approved" : "Reorder Skipped"}
        </div>
      )}

      {/* Action buttons (executing state only) */}
      {status === ToolCallStatus.Executing && (
        <div className="flex gap-2">
          <button
            onClick={() => props.respond({ approved: true, message: `PO approved for ${items.length} items, estimated ${formatCurrency(estimatedTotal)}` })}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Approve PO
          </button>
          <button
            onClick={() => props.respond({ approved: false, message: "Reorder skipped by user" })}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Skip Reorder
          </button>
        </div>
      )}
    </div>
  );
}
```

**Registration:** Call `useApproveInventoryReorder()` inside `Shell` component.

---

## 5. Shell Integration

**File:** `src/components/layout/shell.tsx`

All four hooks are registered in the Shell component, which is always mounted across all pages:

```tsx
"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { useNavigateAndFilter } from "@/hooks/use-navigate-and-filter";
import { useRenderChart } from "@/hooks/use-render-chart";
import { useApproveInvoicePayment } from "@/hooks/use-approve-invoice-payment";
import { useApproveInventoryReorder } from "@/hooks/use-approve-inventory-reorder";
import { Sidebar } from "./sidebar";
import { kpis, invoices, accounts, transactions, inventoryItems, employees } from "@/lib/data";

export function Shell({ children }: { children: React.ReactNode }) {
  // Existing readables (unchanged)
  useCopilotReadable({ description: "Key performance indicators", value: JSON.stringify(kpis) });
  useCopilotReadable({ description: "All invoices", value: JSON.stringify(invoices) });
  useCopilotReadable({ description: "Chart of accounts", value: JSON.stringify(accounts) });
  useCopilotReadable({ description: "Recent transactions", value: JSON.stringify(transactions) });
  useCopilotReadable({ description: "Inventory items", value: JSON.stringify(inventoryItems) });
  useCopilotReadable({ description: "Employee directory", value: JSON.stringify(employees) });

  // NEW: Frontend tools
  useNavigateAndFilter();
  useRenderChart();

  // NEW: Human-in-the-loop
  useApproveInvoicePayment();
  useApproveInventoryReorder();

  return (
    <div className="flex h-screen bg-gray-50">
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
```

---

## 6. Agent System Prompt Update

**File:** `agent/agent.py`

Add to the existing system prompt:

```
You also have access to frontend tools that control the UI directly:
- navigate_and_filter: Navigate to any ERP page and apply filters. Use this when the user asks to "show me", "go to", or "pull up" specific data.
- render_chart: Render interactive charts inline in the chat. Use this for visualizations, projections, and trend analysis. Pick the best chart type (area for trends, bar for comparisons, line for trajectories).
- approve_invoice_payment: Present invoices for payment approval. ALWAYS use this before processing any payment — never mark invoices as paid without explicit user approval.
- approve_inventory_reorder: Present a purchase order for review. ALWAYS use this before placing any reorder — never reorder inventory without explicit user approval.

Important: For actions that modify data (payments, reorders), you MUST use the approval tools and wait for user confirmation. Never take financial actions autonomously.
```

---

## New Files Summary

| File | Type | Purpose |
|------|------|---------|
| `src/hooks/use-navigate-and-filter.ts` | Hook | `useFrontendTool` — navigate + filter |
| `src/hooks/use-render-chart.ts` | Hook | `useFrontendTool` — inline charts |
| `src/hooks/use-approve-invoice-payment.ts` | Hook | `useHumanInTheLoop` — invoice approval |
| `src/hooks/use-approve-inventory-reorder.ts` | Hook | `useHumanInTheLoop` — reorder approval |
| `src/components/chat/inline-chart.tsx` | Component | Recharts renderer for chat |
| `src/components/chat/invoice-approval-card.tsx` | Component | Rich invoice approval card |
| `src/components/chat/inventory-reorder-card.tsx` | Component | Rich PO approval card |

## Modified Files Summary

| File | Change |
|------|--------|
| `src/components/layout/shell.tsx` | Register 4 new hooks |
| `src/app/invoices/page.tsx` | Read `searchParams.filter`, controlled filter buttons + data filtering |
| `src/app/inventory/page.tsx` | Read `searchParams.filter`, controlled filter buttons + data filtering |
| `src/app/hr/page.tsx` | Read `searchParams.filter`, controlled filter buttons + data filtering |
| `agent/agent.py` | Update system prompt with frontend tool descriptions |
