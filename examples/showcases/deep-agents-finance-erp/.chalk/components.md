# Component & Hook Definitions

All frontend hooks and render components powering the demo. The architecture uses 5 consolidated hooks (down from 14), each mapping to a CopilotKit primitive (`useRenderTool` or `useHumanInTheLoop`).

---

## 1. `render_chat_visual` — Inline visuals in chat (`useRenderTool`)

### Hook: `useRenderChatVisual`

**File:** `src/hooks/use-render-chat-visual.tsx`

Dispatches to `InlineChatChart` or `CashPositionCard` based on `args.type`.

```tsx
useRenderTool(
  {
    name: "render_chat_visual",
    render: ({ args, status }) => {
      if (args?.type === "cash_position") {
        return <CashPositionCard status={status} args={...} />;
      }
      return <InlineChatChart status={status} args={...} />;
    },
  },
  [],
);
```

### Render Components

- **`InlineChatChart`** (`src/components/chat/inline-chart.tsx`) — Recharts area/bar/line chart. Shows skeleton during InProgress, full chart on Complete.
- **`CashPositionCard`** (`src/components/chat/cash-position-card.tsx`) — Cash position summary: total cash, liabilities, net position, list of accounts.

---

## 2. `navigate_and_filter` — SPA navigation (`useRenderTool`)

### Hook: `useNavigateAndFilter`

**File:** `src/hooks/use-navigate-and-filter.tsx`

Renders a `Navigator` component that calls `router.push()` on Complete. Maps page names to routes and appends optional filter params.

```tsx
useRenderTool(
  {
    name: "navigate_and_filter",
    render: ({ args, status }) => (
      <Navigator page={args?.page ?? ""} filter={args?.filter} status={status} />
    ),
  },
  [],
);
```

**Routes:** `dashboard` → `/`, `invoices` → `/invoices`, `accounts` → `/accounts`, `inventory` → `/inventory`, `hr` → `/hr`

**Filters:** Invoices: `paid|pending|overdue|draft`. Inventory: `in-stock|low-stock|out-of-stock`.

Pages read `searchParams.filter` and apply client-side filtering.

---

## 3. `request_approval` — Human-in-the-loop (`useHumanInTheLoop`)

### Hook: `useRequestApproval`

**File:** `src/hooks/use-request-approval.tsx`

A single consolidated HITL hook handling both invoice payments and inventory reorders via a `type` discriminator.

```tsx
useHumanInTheLoop({
  agentId: "finance_erp_agent",
  name: "request_approval",
  parameters: z.object({
    type: z.enum(["invoice_payment", "inventory_reorder"]),
    invoices: z.array(invoiceSchema).optional(),
    totalAmount: z.number().optional(),
    action: z.string().optional(),
    items: z.array(reorderItemSchema).optional(),
    estimatedTotal: z.number().optional(),
    supplier: z.string().optional(),
  }),
  render: (props) => {
    if (args?.type === "inventory_reorder") {
      return <InventoryReorderCard {...} />;
    }
    return <InvoiceApprovalCard {...} />;
  },
});
```

### Render Components

- **`InvoiceApprovalCard`** (`src/components/chat/invoice-approval-card.tsx`)
  - Shows invoice table (number, client, amount, due date) + total
  - States: InProgress (skeleton) → Executing (Approve/Reject buttons visible) → Complete (approved/rejected badge)
  - Handler: `respond({ approved: bool, message: string })`

- **`InventoryReorderCard`** (`src/components/chat/inventory-reorder-card.tsx`)
  - Shows item table (SKU, name, current qty, order qty, line total) + PO total + supplier
  - States: InProgress → Executing → Complete
  - Handler: `respond({ approved: bool, message: string })`

---

## 4. `update_dashboard` — Batch widget add/update (`useRenderTool`)

### Hook: `useUpdateDashboard`

**File:** `src/hooks/use-update-dashboard.tsx`

Renders a `DashboardUpdater` component that maps agent widget type names to internal types and calls `upsertWidget()` or `addWidget()` on Complete.

```tsx
useRenderTool(
  {
    name: "update_dashboard",
    render: ({ args, status }) => (
      <DashboardUpdater widgets={args?.widgets ?? []} status={status} />
    ),
  },
  [],
);
```

**Type mapping:** `kpi_cards` → `"kpi-cards"`, `revenue_chart` → `"revenue-chart"`, `expense_breakdown` → `"expense-breakdown"`, `transactions` → `"recent-transactions"`, `invoices` → `"outstanding-invoices"`, `custom_chart` → `"custom-chart"`

**Default colSpans:** kpi-cards: 4, revenue-chart: 3, expense-breakdown: 1, recent-transactions: 2, outstanding-invoices: 2, custom-chart: 2

---

## 5. `manage_dashboard` — Layout management (`useRenderTool`)

### Hook: `useManageDashboard`

**File:** `src/hooks/use-manage-dashboard.tsx`

Renders a `DashboardManager` component that handles layout operations on Complete.

```tsx
useRenderTool(
  {
    name: "manage_dashboard",
    render: ({ args, status }) => (
      <DashboardManager
        action={args?.action ?? ""}
        widgetId={args?.widgetId}
        updates={args?.updates}
        status={status}
      />
    ),
  },
  [],
);
```

**Actions:**
- `reset` — calls `resetToDefault()`, restores the 5 default widgets
- `remove` — calls `removeWidget(widgetId)`
- `reorder` — maps `updates` array (each with `widgetId`, optional `colSpan`, optional `order`) onto existing widgets

---

## Shell Integration

**File:** `src/components/layout/shell.tsx`

All 5 hooks are registered in `ShellInner`, which is always mounted across all pages:

```tsx
function ShellInner({ children }: { children: React.ReactNode }) {
  const { widgets } = useDashboard();

  // Lightweight context — detailed data is available via backend research tools
  useAgentContext({
    description: "Key performance indicators for the company",
    value: kpis,
  });

  useAgentContext({
    description: "Current dashboard layout — widget IDs, types, column spans...",
    value: widgets,
  });

  // Render the internal "task" tool as a clean loading state
  useRenderTool({ name: "task", render: ({ status, args }) => { ... } }, []);

  // Consolidated frontend tools (5 hooks replacing 14)
  useRenderChatVisual();     // Inline chart + cash position card
  useNavigateAndFilter();    // SPA navigation
  useRequestApproval();      // HITL: invoice payment + inventory reorder
  useUpdateDashboard();      // Add/update dashboard widgets (batch)
  useManageDashboard();      // Reset/remove/reorder dashboard

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />
      <main>...</main>
      <CopilotSidebar agentId="finance_erp_agent" ... />
    </div>
  );
}
```

---

## Files Summary

### Hook Files (5 consolidated)

| File | Hook | Primitive | Purpose |
|------|------|-----------|---------|
| `src/hooks/use-render-chat-visual.tsx` | `useRenderChatVisual` | `useRenderTool` | Charts + cash position card |
| `src/hooks/use-navigate-and-filter.tsx` | `useNavigateAndFilter` | `useRenderTool` | Page navigation + filtering |
| `src/hooks/use-request-approval.tsx` | `useRequestApproval` | `useHumanInTheLoop` | Invoice payment + inventory reorder approval |
| `src/hooks/use-update-dashboard.tsx` | `useUpdateDashboard` | `useRenderTool` | Batch dashboard widget add/update |
| `src/hooks/use-manage-dashboard.tsx` | `useManageDashboard` | `useRenderTool` | Dashboard reset/remove/reorder |

### Render Components (4)

| File | Component | Used By |
|------|-----------|---------|
| `src/components/chat/inline-chart.tsx` | `InlineChatChart` | `useRenderChatVisual` |
| `src/components/chat/cash-position-card.tsx` | `CashPositionCard` | `useRenderChatVisual` |
| `src/components/chat/invoice-approval-card.tsx` | `InvoiceApprovalCard` | `useRequestApproval` |
| `src/components/chat/inventory-reorder-card.tsx` | `InventoryReorderCard` | `useRequestApproval` |
