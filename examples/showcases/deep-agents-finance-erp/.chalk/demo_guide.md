# FinanceOS Deep Agents — Live Demo Guide

A ~10 minute live demo showcasing CopilotKit's three frontend primitives: **useCopilotReadable** (context sharing), **useFrontendTool** (agent-driven UI), and **useHumanInTheLoop** (approval workflows).

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
3. The table shows only overdue invoices (Initech LLC — $67,200)
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
   - Table listing each overdue invoice: number, client, amount, due date
   - Bold total at the bottom
   - Action description: "Mark 1 invoice as paid"
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

## Closing (1 min)

### Say
"Let's recap what we just saw — three CopilotKit primitives powering an entire AI-native ERP:

1. **`useCopilotReadable`** — shared all our financial data with the agent in six lines of code. No custom API endpoints, no data serialization logic.

2. **`useFrontendTool`** — gave the agent the ability to drive the UI. Navigate pages, apply filters, render charts inline. The agent becomes a co-pilot, not just a chatbot.

3. **`useHumanInTheLoop`** — the guardrail for high-stakes actions. The agent proposes, the human approves. Payments don't process and purchase orders don't submit without explicit confirmation.

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

---

## Component Reference

See [components.md](./components.md) for full implementation specs of all hooks and render components used in this demo.
