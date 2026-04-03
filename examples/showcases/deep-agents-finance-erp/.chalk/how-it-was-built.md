# How FinanceOS Was Built

A walkthrough of how AI was integrated into this finance ERP to create an AI-native application — from stack choices to the patterns that make it work.

---

## What This Project Is

FinanceOS is a finance ERP showcase that demonstrates how CopilotKit turns a standard business application into an AI-native one. The AI assistant can query financial data, render charts, navigate pages, compose dashboards, and execute approval workflows — all through natural language.

It's not a chatbot bolted onto an app. The agent **drives the UI**.

---

## The Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Recharts | Application shell, dashboard, data visualization |
| **AI Layer** | CopilotKit (react-core + runtime) | Agent-frontend bridge via AG-UI protocol |
| **Agent** | LangGraph + deepagents, FastAPI | Multi-agent orchestration, tool execution |
| **LLM** | OpenAI GPT-4o | Reasoning, tool selection, response generation |
| **Data** | In-memory mock data (seed data in `lib/data.ts` and `agent/tools.py`) | Invoices, accounts, transactions, inventory, HR, financials |

---

## How AI Was Integrated

The integration follows four CopilotKit patterns, each adding a layer of AI capability.

### Pattern 1: Context Sharing (`useAgentContext`)

**Problem**: The agent needs to know about the application's current state without building custom API endpoints.

**Solution**: `useAgentContext()` shares frontend state directly with the agent as structured context.

```typescript
// shell.tsx
useAgentContext({
  description: "Key performance indicators for the company",
  value: kpis,
});

useAgentContext({
  description: "Current dashboard layout — widget IDs, types, column spans...",
  value: widgets,
});
```

Two calls share six KPI metrics and the full dashboard layout. The agent sees this context in every request — no backend work, no API endpoints, no serialization logic.

**Where it's used**: `src/components/layout/shell.tsx` — the `ShellInner` component.

---

### Pattern 2: Frontend Tools (`useFrontendTool`)

**Problem**: The agent should be able to control the UI — navigate pages, render charts, modify the dashboard — not just output text.

**Solution**: `useFrontendTool()` registers React-based tools that the agent can call. Each tool has a Zod schema, a handler function, and an optional render component.

```typescript
// src/hooks/use-render-chart.ts
useFrontendTool({
  agentId: "finance_erp_agent",
  name: "render_chart",
  parameters: z.object({
    title: z.string(),
    type: z.enum(["area", "bar", "line"]),
    data: z.array(z.object({ label: z.string(), value: z.number() })),
    series: z.array(z.object({ key: z.string(), color: z.string(), label: z.string() })),
  }),
  render: InlineChatChart,
});
```

When the agent calls `render_chart`, CopilotKit renders the `InlineChatChart` component inline in the chat with the agent's data.

**14 frontend tools** are registered in the shell:

| Category | Tools |
|---|---|
| Chat rendering | `render_chart`, `render_cash_position`, `navigate_and_filter` |
| Dashboard widgets | `render_kpi_cards`, `render_revenue_chart`, `render_expense_breakdown`, `render_transactions`, `render_invoices`, `render_custom_chart` |
| Dashboard management | `remove_dashboard_widget`, `update_dashboard_layout`, `reset_dashboard` |
| Human-in-the-loop | `approve_invoice_payment`, `approve_inventory_reorder` |

**Where it's used**: Each tool lives in its own hook file under `src/hooks/`. All hooks are called in `src/components/layout/shell.tsx`.

---

### Pattern 3: Human-in-the-Loop (`useHumanInTheLoop` + `copilotkit_interrupt`)

**Problem**: High-stakes actions (payments, purchase orders) must require human approval. The agent should never autonomously process money.

**Solution**: A two-sided pattern:

- **Backend**: The tool calls `copilotkit_interrupt()`, which pauses the LangGraph execution and sends the pending action to the frontend.
- **Frontend**: `useHumanInTheLoop()` renders an approval card with action buttons. The user's decision resumes the graph.

```python
# agent/frontend_tools.py (backend)
@tool
def approve_invoice_payment(invoices, totalAmount, action):
    answer, _ = copilotkit_interrupt(
        action="approve_invoice_payment",
        args={"invoices": invoices, "totalAmount": totalAmount, "action": action},
    )
    return answer
```

```typescript
// src/hooks/use-approve-invoice-payment.ts (frontend)
const { resolve } = useHumanInTheLoop({
  agentId: "finance_erp_agent",
  name: "approve_invoice_payment",
  render: InvoiceApprovalCard,
});
```

The approval card shows a table of invoices, the total amount, and Approve/Reject buttons. When the user clicks, `resolve()` sends the answer back through AG-UI, and the agent continues.

**Where it's used**: `src/hooks/use-approve-invoice-payment.ts`, `src/hooks/use-approve-inventory-reorder.ts`, with render components in `src/components/chat/`.

---

### Pattern 4: Agent-Driven Dashboard

**Problem**: Static dashboards show the same widgets for every user. A CFO investigating cash flow risk needs a different view than one tracking marketing spend.

**Solution**: Every dashboard widget is a frontend tool. The agent can add, remove, resize, and reorder widgets through natural language — composing dashboards tailored to specific business questions.

The dashboard state lives in React Context (`DashboardProvider`), shared with the agent via `useAgentContext()`. When the agent calls tools like `render_custom_chart` or `remove_dashboard_widget`, the corresponding hooks update the context, and the dashboard re-renders.

**Dashboard reshaping flow:**
1. Agent calls `reset_dashboard` to clear the current layout
2. Agent gathers data via research and/or projections subagents
3. Agent adds only widgets that support the theme (e.g., for "cash flow risk": AR aging chart, overdue invoices, cash flow projection)
4. Dashboard updates in real-time as each widget tool is called

**Where it's used**: `src/context/dashboard-context.tsx` for state, `src/components/dashboard/widget-renderer.tsx` for rendering, and nine hooks in `src/hooks/` for the dashboard tools.

---

## The Communication Layer: AG-UI Protocol

The frontend and backend communicate via the **AG-UI protocol** — an event-based Server-Sent Events (SSE) transport.

```
Browser                     Next.js API Route              FastAPI Agent
  |                              |                              |
  |  POST /api/copilotkit        |                              |
  |----------------------------->|                              |
  |                              |  AG-UI SSE stream            |
  |                              |----------------------------->|
  |                              |                              |
  |                              |  <-- ToolCall event          |
  |  <-- ToolCall event          |  <-- Message event           |
  |  <-- Message event           |  <-- ToolResult event        |
  |                              |                              |
```

**Key event types:**
- `ToolCall` — agent is calling a tool (frontend hooks match by name)
- `ToolResult` — frontend sends back the tool's return value
- `Message` — agent's text response (streamed token-by-token)

The Next.js API route (`src/app/api/copilotkit/[[...slug]]/route.ts`) creates a `CopilotRuntime` that forwards requests to the FastAPI backend via `LangGraphHttpAgent`:

```typescript
const runtime = new CopilotRuntime({
  agents: {
    finance_erp_agent: new LangGraphHttpAgent({
      url: process.env.REMOTE_ACTION_URL || "http://localhost:8123/copilotkit/agents/finance_erp_agent",
    }),
  },
});
```

---

## How the Agent Backend Was Built

### Entry Point: `agent/main.py`

FastAPI app with a single AG-UI endpoint:

```python
add_langgraph_fastapi_endpoint(
    app=app,
    agent=CopilotKitLangGraphAgent(
        name="finance_erp_agent",
        description="A finance ERP assistant...",
        graph=agent_graph,
        config=copilotkit_customize_config(
            emit_tool_calls=_emit_tool_names,
        ),
    ),
    path="/copilotkit/agents/finance_erp_agent",
)
```

`emit_tool_calls` controls which tool calls are streamed to the frontend. Only UI and HITL tools are emitted — internal tools like `task` (subagent delegation) are filtered out so their raw JSON doesn't appear in the chat.

### Multi-Agent Graph: `agent/agent.py`

`create_deep_agent()` from the `deepagents` library builds a LangGraph graph with:
- An orchestrator node that processes user messages and decides on tool calls
- Subagent nodes invoked via the `task` tool
- `CopilotKitMiddleware` for frontend tool interception

### System Prompts: `agent/prompts.py`

Three detailed prompts define agent behavior:

1. **ORCHESTRATOR_PROMPT** — Routing rules (which subagent for which intent), frontend tool documentation, dashboard composition guidelines, and response style rules
2. **RESEARCH_AGENT_PROMPT** — Available data query and analytics tools, guidelines for structured data retrieval
3. **PROJECTIONS_AGENT_PROMPT** — Forecasting and analysis tools, methodology guidelines

The orchestrator prompt includes a routing table that maps user intents to specific actions, ensuring the agent consistently uses the right tools.

---

## Project Structure

```
deep-agents-finance-erp/
  agent/                         # Python backend
    agent.py                     # Multi-agent graph builder
    main.py                      # FastAPI + AG-UI endpoint
    tools.py                     # Data query & analytics tools
    frontend_tools.py            # UI + HITL tool stubs
    prompts.py                   # System prompts for all agents

  src/                           # Next.js frontend
    app/
      layout.tsx                 # CopilotKit provider setup
      page.tsx                   # Dashboard page
      api/copilotkit/            # AG-UI runtime endpoint
      invoices/                  # Invoice management page
      accounts/                  # Chart of accounts page
      inventory/                 # Inventory management page
      hr/                        # Employee directory page
    components/
      layout/shell.tsx           # Agent integration hub (all hooks)
      chat/                      # Chat rendering (charts, approval cards)
      dashboard/                 # Dashboard widgets & grid
      charts/                    # Revenue/expense chart components
      ui/                        # Reusable UI components (shadcn)
    hooks/                       # 14 frontend tool hooks
    context/
      dashboard-context.tsx      # Dashboard state management
    types/                       # TypeScript type definitions
    lib/
      data.ts                    # Mock seed data
```

---

## Key Files to Read

If you want to understand how this project works, start with these files:

| File | What You'll Learn |
|---|---|
| `src/components/layout/shell.tsx` | How all 14 frontend tools + context sharing are wired together |
| `agent/agent.py` | How the multi-agent graph is assembled |
| `agent/prompts.py` | How the orchestrator decides what to do |
| `agent/frontend_tools.py` | How backend stubs and HITL interrupts work |
| `agent/tools.py` | What data is available and how it's queried |
| `src/hooks/use-render-chart.ts` | Example of a frontend rendering tool |
| `src/hooks/use-approve-invoice-payment.ts` | Example of a HITL approval flow |
| `src/context/dashboard-context.tsx` | How dashboard state is managed |
| `agent/main.py` | How the FastAPI server and AG-UI endpoint are configured |
| `src/app/api/copilotkit/[[...slug]]/route.ts` | How the Next.js runtime bridges to the agent |

---

## What Makes It AI-Native

This isn't a chat widget added to a traditional app. The AI is woven into the application's core interaction model:

1. **The agent sees what the user sees** — dashboard state, KPIs, and widget layout are shared in real-time via `useAgentContext`
2. **The agent controls the UI** — navigation, charts, dashboard composition are all agent-driven through frontend tools
3. **The agent respects boundaries** — high-stakes actions (payments, purchase orders) require explicit human approval via HITL
4. **The agent composes, not templates** — dashboards are assembled dynamically based on the agent's understanding of the data and the user's intent, not from predefined templates
5. **The protocol is standard** — AG-UI (SSE) means any agent framework can plug in; LangGraph is one implementation, not a requirement
