# FinanceOS Deep Agents — Live Demo Guide

A ~12 minute live demo showcasing CopilotKit's frontend primitives: **useCopilotReadable** (context sharing), **useFrontendTool** (agent-driven UI), **useHumanInTheLoop** (approval workflows), and **customizable dashboard** (agent-designed layouts).

---

## Pre-Demo Checklist

- [ ] Agent running (`cd agent && python main.py` — port 8123)
- [ ] Frontend running (`npm run dev` — port 3000)
- [ ] Browser open to `http://localhost:3000` (Dashboard page)
- [ ] CopilotSidebar closed (click the chat icon to open when ready)
- [ ] Browser window large enough to show sidebar + main content side by side
- [ ] If showing code: editor open to `src/components/layout/shell.tsx`

---

## Act 1: Conversational Baseline (1 min)

> Establish that the agent understands your financial data without any setup.

### Say
"This is FinanceOS — a finance ERP with invoices, accounts, inventory, and HR. We've connected it to a LangGraph agent using CopilotKit. The agent already sees all our data through `useCopilotReadable` — six data sources shared with zero custom API work. Let me show you."

### Type
```
What's our current cash position and how does it compare to our liabilities?
```

### See
- Agent responds with cash & equivalents ($1,245,000), total liabilities (~$904,500), and a net analysis
- Response references specific account names from the Chart of Accounts
- The agent pulled this from frontend context — no backend query needed for this one

### Code Callout
> `shell.tsx` — six `useCopilotReadable()` calls share KPIs, invoices, accounts, transactions, inventory, and employees with the agent.

---

## Act 2: Navigate + Filter (2 min)

> Show the agent driving the UI — not just answering questions, but taking you to the answer.

### Say
"But what if I don't just want a text answer? What if I want the agent to actually show me the data? With `useFrontendTool`, the agent can control the UI directly."

### Type
```
Show me all overdue invoices
```

### See
1. The app navigates from Dashboard to `/invoices?filter=overdue`
2. The filter button "overdue" is now highlighted/active
3. The table shows 3 overdue invoices: Initech LLC ($67,200), Soylent Industries ($34,500), Cyberdyne Systems ($51,800) — totaling $153,500
4. The URL bar shows `?filter=overdue` — the agent wrote that

### Say (after)
"The agent didn't just tell me about overdue invoices — it navigated me there and applied the filter. This is a frontend tool: the agent calls it, Next.js router does the navigation, and the URL params drive the filter. The user sees the real app view, not a chat summary."

### Code Callout
> `use-navigate-and-filter.ts` — a `useFrontendTool` that calls `router.push()` with the target page and filter as a URL search param.

---

## Act 3: Inline Charts (2 min)

> Show generative UI — the agent composing visual components on the fly inside the chat.

### Say
"Text and navigation are great, but sometimes you need a visualization. The agent can render charts directly in the conversation using your app's own charting library."

### Type
```
Give me a visual cash flow projection for the next 4 quarters
```

### See
1. A loading skeleton appears briefly in the chat
2. An area chart renders inline in the sidebar with:
   - Title: "Cash Flow Projection — Next 4 Quarters" (or similar)
   - X-axis: Q2 2026, Q3 2026, Q4 2026, Q1 2027
   - Two series: projected inflows (blue) and outflows (red/orange)
   - Clean Recharts styling that matches the rest of the app
3. The agent follows up with a text summary below the chart

### Say (after)
"That chart was composed by the agent — it decided the chart type, generated the data points from its analysis, and rendered it using Recharts, the same library powering the dashboard. This is `useFrontendTool` with a `render` prop — the agent calls the tool, and a React component renders the result inline in the chat."

### Code Callout
> `use-render-chart.ts` — `useFrontendTool` with a `render` component that receives the agent's data and renders an area, bar, or line chart.

### Optional Follow-Up
If time permits, try a second chart to show type flexibility:
```
Show me a bar chart comparing expenses by category
```
This renders a bar chart instead of an area chart — same tool, different visualization.

---

## Act 4: Approve Invoice Payment (2 min)

> The big moment: human-in-the-loop. The agent proposes a financial action and waits for approval.

### Say
"Now here's where it gets interesting. What happens when the agent needs to take action — not just read data, but change it? In finance, you never want an AI autonomously processing payments. CopilotKit's `useHumanInTheLoop` hook solves this: the agent proposes an action, renders an approval card, and pauses until the human decides."

### Type
```
Process payment for all overdue invoices
```

### See
1. Brief "Reviewing invoices..." loading state in the chat
2. A rich approval card appears with:
   - Header: "Payment Approval Required" with a dollar icon
   - Table listing 3 overdue invoices: Initech LLC ($67,200), Soylent Industries ($34,500), Cyberdyne Systems ($51,800)
   - Bold total at the bottom: $153,500
   - Action description: "Mark 3 invoices as paid"
   - Two buttons: green "Approve Payment" and red "Reject"
3. **The agent is paused** — it's waiting for the user to decide
4. Click **"Approve Payment"**
5. The card transitions to a muted state with a green "Payment Approved" badge
6. The agent resumes and confirms the action was processed

### Say (after)
"The agent stopped and waited. It rendered a real approval card with the invoice details, and nothing happened until I clicked Approve. The `useHumanInTheLoop` hook creates a promise that resolves when the user responds — the agent's execution is literally suspended. This is the pattern for any high-stakes action: payments, transfers, refunds, adjustments."

### Code Callout
> `use-approve-invoice-payment.ts` — `useHumanInTheLoop` with a render component that shows three states: loading, executing (with buttons), and complete (with badge).

---

## Act 5: Approve Inventory Reorder (2 min)

> Same pattern, different domain — showing HITL is a composable primitive.

### Say
"Let's see the same pattern in a completely different context — inventory management."

### Type
```
Check inventory levels and reorder anything that needs restocking
```

### See
1. Brief "Analyzing inventory levels..." loading state
2. A purchase order card appears with:
   - Header: "Purchase Order Review" with a package icon
   - Table: SKU, item name, current qty (red for out-of-stock, amber for low), order quantity, line total
   - Items like: MacBook Pro 16" (3 in stock, reorder 10), Cisco Catalyst 9300 (0 in stock, reorder 5), ThinkPad X1 (8 in stock, reorder 10)
   - Bold estimated PO total at the bottom
   - Two buttons: blue "Approve PO" and gray "Skip Reorder"
3. Click **"Approve PO"**
4. Card transitions to muted state with "PO Approved" badge
5. Agent confirms the reorder was submitted

### Say (after)
"Same hook, completely different UI. The invoice card had green approve/red reject. The PO card has blue approve/gray skip. Different business logic, different visual treatment, but the same `useHumanInTheLoop` primitive underneath. You define the render component, CopilotKit handles the agent pause/resume lifecycle."

### Code Callout
> `use-approve-inventory-reorder.ts` — same `useHumanInTheLoop` pattern, different render component and business context.

---

## Act 6: CFO Dashboard Composition (3 min)

> The finale: the agent composes entirely new dashboards tailored to specific CFO concerns — not just moving widgets, but making editorial decisions about what matters.

### Say
"Everything we've seen so far — context, navigation, charts, approvals — those are tools the agent uses inside the chat. But what if the agent could redesign the application itself? Every widget on this dashboard is a frontend tool. The agent can add, remove, resize, and rearrange them — and because it understands the financial data, it can compose dashboards tailored to specific business concerns."

### Navigate back to Dashboard
Click the Dashboard icon in the sidebar (or type `/` in the browser).

### Type
```
Build me a dashboard focused on cash flow risk — show AR aging, overdue invoices at the top, and a quarterly cash projection
```

### See
1. The agent removes widgets that aren't relevant to cash flow (e.g. expense breakdown)
2. Overdue invoices move to a prominent position
3. New custom charts appear: an AR Aging bar chart (current/30/60/90+ day buckets) and a Cash Flow Projection area chart
4. KPI cards remain (AR up 15.8% is the key metric)
5. The dashboard now tells a cash flow risk story

### Say (after)
"The agent just redesigned the entire dashboard for a specific CFO use case. It didn't just move widgets — it decided what's relevant to cash flow risk, removed what's not, and composed custom charts from the financial data. It called `remove_dashboard_widget`, `update_dashboard_layout`, and `render_custom_chart` — multiple frontend tools in one conversation turn."

### Type
```
Reset my dashboard
```

### See
- Dashboard returns to its original default layout

### Type
```
I'm concerned about the Marketing overspend — set up a cost control view with budget tracking and spending trends
```

### See
1. The agent removes widgets not relevant to cost control (e.g. revenue chart, invoices)
2. New custom charts appear: a Budget vs Actual bar chart showing Marketing 32% over budget, and a Monthly Marketing Spend line chart showing the Feb-Mar spike
3. Expense breakdown stays (relevant to cost analysis)
4. KPI cards may narrow to Operating Expenses and Net Profit
5. The dashboard now tells a cost control story

### Say (after)
"Same primitives, completely different dashboard. The agent identified that Marketing is 32% over budget — driven by conference sponsorships and ad campaigns — and composed a dashboard around that insight. It's not following a template; it's reading the data, identifying the story, and designing a view that highlights what matters. That's the power of combining `useFrontendTool` with `useCopilotReadable` — the agent has the context to make editorial decisions."

### Type
```
Reset my dashboard
```

### See
- Dashboard returns to default layout (clean finish)

### Code Callout
> `src/hooks/` — nine dashboard tools: `render_kpi_cards`, `render_revenue_chart`, `render_expense_breakdown`, `render_transactions`, `render_invoices`, `render_custom_chart`, `remove_dashboard_widget`, `update_dashboard_layout`, `reset_dashboard`. Each is a `useFrontendTool` that mutates the `DashboardProvider` context.

> `src/context/dashboard-context.tsx` — React context holding the widget list. Default state matches the original hardcoded layout. Exposes `addWidget`, `removeWidget`, `updateWidget`, `setWidgets`, `resetToDefault`.

> `src/components/dashboard/widget-renderer.tsx` — maps widget type to component. `dashboard-grid.tsx` reads the sorted widget list and renders them in a CSS grid.

> `src/lib/data.ts` — monthly expense data by category enables the agent to build trend charts showing the Marketing spike in Feb-Mar.

---

## Closing (1 min)

### Say
"Let's recap what we just saw — four CopilotKit patterns powering an entire AI-native ERP:

1. **`useCopilotReadable`** — shared all our financial data with the agent in six lines of code. No custom API endpoints, no data serialization logic.

2. **`useFrontendTool`** — gave the agent the ability to drive the UI. Navigate pages, apply filters, render charts inline. The agent becomes a co-pilot, not just a chatbot.

3. **`useHumanInTheLoop`** — the guardrail for high-stakes actions. The agent proposes, the human approves. Payments don't process and purchase orders don't submit without explicit confirmation.

4. **Customizable Dashboard** — every dashboard widget is a frontend tool. The agent can add, remove, resize, and rearrange them. Users design their own dashboard experience through natural language. The same `useFrontendTool` primitive, but now it's modifying the application layout itself.

These are composable React hooks. You register them in your components, and CopilotKit handles the agent communication, the rendering lifecycle, and the approval flow. Your agent framework — LangGraph, CrewAI, whatever you're using — just sees tools. The magic is in the frontend."

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Agent doesn't navigate | Check that `useNavigateAndFilter` is registered in Shell and the agent system prompt mentions `navigate_and_filter` |
| Chart doesn't render | Verify `recharts` is installed and `InlineChatChart` is imported correctly in `use-render-chart.ts` |
| Approval card appears but buttons don't work | Ensure the component checks `status === ToolCallStatus.Executing` before rendering buttons with `respond` |
| Agent processes payment without asking | Update agent system prompt to explicitly require approval tool usage before any data mutations |
| Filter doesn't apply after navigation | Check that the page component reads `searchParams.filter` and filters data accordingly |
| Dashboard widget doesn't appear/disappear | Verify `DashboardProvider` wraps `ShellInner` in `shell.tsx` and the hook calls `useDashboard()` |
| Agent doesn't know widget IDs | Check that the dashboard layout `useAgentContext` call is present in `ShellInner` |
| Custom chart shows no data | Ensure the agent's `render_custom_chart` call includes valid `data` and `series` arrays |

---

## Component Reference

See [components.md](./components.md) for full implementation specs of all hooks and render components used in this demo.
