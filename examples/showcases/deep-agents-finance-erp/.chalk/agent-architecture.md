# Agent Architecture

A deep-dive into the multi-agent system powering FinanceOS — from the LangGraph orchestrator to frontend tool rendering.

---

## Overview

FinanceOS uses a **hierarchical multi-agent** architecture built on LangGraph and CopilotKit. A parent orchestrator delegates to two specialized subagents and calls **5 consolidated frontend tools** directly.

```
                         +---------------------------+
                         |      Orchestrator         |
                         |   (finance_erp_graph)     |
                         |                           |
                         |  5 frontend tools         |
                         |  + task (subagent dispatch)|
                         +-------+----------+--------+
                                 |          |
                    task("research")  task("projections")
                                 |          |
               +-----------------+          +------------------+
               |                                               |
    +----------v-----------+                    +--------------v-----------+
    |   Research Subagent  |                    |  Projections Subagent    |
    |   13 data tools      |                    |  6 computation tools     |
    +----------------------+                    +--------------------------+
```

---

## How It's Built

### `agent/agent.py` — The Graph Builder

```python
from deepagents import create_deep_agent
from copilotkit import CopilotKitMiddleware

def build_agent():
    llm = ChatOpenAI(model="gpt-4o", temperature=0, streaming=True)
    checkpointer = MemorySaver()

    agent = create_deep_agent(
        model=llm,
        tools=frontend_tools,        # 5 consolidated tools
        system_prompt=ORCHESTRATOR_PROMPT,
        subagents=[research_subagent, projections_subagent],
        middleware=[CopilotKitMiddleware()],
        checkpointer=checkpointer,
    )
    return agent
```

### Subagent Definitions

Each subagent is a plain dictionary:

```python
research_subagent = {
    "name": "research",
    "description": "Finance research specialist. Queries the ERP database...",
    "system_prompt": RESEARCH_AGENT_PROMPT,
    "tools": research_tools,
}
```

`create_deep_agent` wraps these into a LangGraph graph where the orchestrator calls subagents through a built-in `task` tool. The orchestrator sends instructions to the subagent as a string, the subagent executes its tools, and the result flows back.

---

## The Consolidated Tool Surface (5 tools, down from 14)

### Why consolidation?

The original 14 frontend tools overwhelmed GPT-4o's tool selection — the model would pick the wrong render tool or skip calling one entirely. Consolidating to 5 tools reduces the decision space from "pick 1 of 20+" to "pick 1 of ~12" (including built-in deep agent tools), well within the reliable range for tool selection.

### 1. `render_chat_visual` — Inline visuals in chat

Renders either an interactive **chart** or a **cash position card** in the chat, controlled by a `type` parameter.

| Type | Use Case | Key Params |
|---|---|---|
| `chart` | Trends, comparisons, projections | title, chartType (area/bar/line), data, series |
| `cash_position` | Cash vs liabilities summary | accounts, totalCash, totalLiabilities, netPosition |

**Frontend:** `useRenderChatVisual` dispatches to `InlineChatChart` or `CashPositionCard` based on `args.type`.

### 2. `navigate_and_filter` — SPA navigation

Navigate to an ERP page with optional filter. Unchanged from the original.

### 3. `request_approval` — Human-in-the-loop

Merges both approval flows into one tool with a `type` discriminator.

| Type | Use Case | Key Params |
|---|---|---|
| `invoice_payment` | Payment processing | invoices, totalAmount, action |
| `inventory_reorder` | Purchase orders | items, estimatedTotal, supplier |

Uses `copilotkit_interrupt()` on the backend. Frontend dispatches to `InvoiceApprovalCard` or `InventoryReorderCard`.

### 4. `update_dashboard` — Batch widget add/update

A single call can add or update multiple dashboard widgets. Accepts a `widgets` array where each entry specifies:
- `type`: `kpi_cards`, `revenue_chart`, `expense_breakdown`, `transactions`, `invoices`, or `custom_chart`
- `colSpan`: Grid column span (1-4)
- `config`: Type-specific configuration

**Frontend:** `useUpdateDashboard` iterates the array and calls `upsertWidget` for standard widgets or `addWidget` for custom charts.

### 5. `manage_dashboard` — Layout management

Handles dashboard layout operations via an `action` parameter:
- `reset` — Restore default layout
- `remove` — Delete a widget by ID
- `reorder` — Resize/reorder multiple widgets

---

## Backend Data Tools (`agent/tools.py`)

Pure data retrieval — execute entirely on the backend, return text summaries.

**Research tools (13):** query_invoices, query_accounts, query_transactions, query_inventory, query_employees, query_quarterly_financials, query_cash_flow_components, query_budget_vs_actual, query_ar_aging, query_monthly_expenses, generate_financial_report, analyze_cash_flow, forecast_revenue

**Projection tools (6):** compute_revenue_forecast, compute_cash_flow_forecast, run_scenario_analysis, compute_trend_analysis, query_quarterly_financials, query_cash_flow_components

---

## Middleware: How Tools Reach the Frontend

`CopilotKitMiddleware` is the bridge between the LangGraph agent and the browser.

### Interception Flow

```
1. Model outputs a tool call  →  e.g. render_chat_visual(type="chart", ...)

2. CopilotKitMiddleware.after_model() checks:
   - Is this tool name in the registered actions list?
   - Yes → intercept. Don't execute the backend stub.

3. Middleware emits an AG-UI ToolCall event via SSE

4. Frontend receives the event. CopilotKit matches tool name
   to a useFrontendTool() hook registered in shell.tsx

5. Hook handler executes (updates state, renders component)

6. Hook sends back a ToolResult event

7. Middleware receives the result and injects it into the
   graph state as the tool's return value

8. Graph continues with the next step
```

### emit_tool_calls Filtering

The `_emit_tool_names` list in `main.py` controls which tool calls stream to the frontend. Only the 5 consolidated frontend tools are included — internal tools like `task` (subagent delegation) are excluded so their raw JSON doesn't render in chat. The SDK's `_dispatch_event` method properly handles list-based filtering, including `TOOL_CALL_RESULT` events and config metadata fallback for subgraph events.

---

## Orchestrator Routing

The orchestrator uses simple decision rules:

| User Intent | Action |
|---|---|
| Data question | research → text summary |
| "Go to" / "open" page | `navigate_and_filter` directly |
| "Show me" data visually | research → `render_chat_visual` (chart) |
| Cash position / liquidity | research → `render_chat_visual` (cash_position) |
| Forecast / projection | projections → `render_chat_visual` (chart) |
| Pay invoices | research → `request_approval` (invoice_payment) |
| Reorder inventory | research → `request_approval` (inventory_reorder) |
| Dashboard / overview | research + projections → `update_dashboard` |
| Themed dashboard | `manage_dashboard(reset)` → gather data → `update_dashboard` |

The orchestrator **never passes frontend tools to subagents**. It calls them directly after receiving data from a subagent.

---

## Request Lifecycle (End-to-End)

```
1. User types "Build me a cash flow risk dashboard"
   Browser → POST /api/copilotkit (Next.js API route)

2. CopilotRuntime forwards via AG-UI to FastAPI (:8123)

3. Orchestrator acknowledges: "Setting up a cash flow risk dashboard."
   → manage_dashboard(action="reset")

4. Orchestrator delegates:
   → task("research", "Query AR aging, overdue invoices, account balances")
   → task("projections", "Compute 4-quarter cash flow forecast")

5. Orchestrator calls update_dashboard with gathered data:
   → update_dashboard(widgets=[
       {type: "kpi_cards", config: {metrics: ["Accounts Receivable", "Cash & Equivalents"]}},
       {type: "invoices", config: {statuses: ["overdue"]}},
       {type: "custom_chart", config: {title: "AR Aging", chartType: "bar", ...}},
       {type: "custom_chart", config: {title: "Cash Flow Projection", chartType: "area", ...}}
     ])

6. Frontend receives update_dashboard tool call, iterates widgets,
   updates dashboard state. Dashboard rebuilds in real-time.

7. Orchestrator sends final summary message.
```

**2 tool selection decisions** (manage_dashboard + update_dashboard) instead of 6+ separate tool calls.

---

## Key Design Decisions

### Why consolidate 14 tools into 5?

- **Reduces model confusion**: GPT-4o reliably selects from ~12 tools but degrades with 20+
- **Enables batch operations**: One `update_dashboard` call adds 4 widgets simultaneously
- **Simpler prompt**: The orchestrator prompt dropped from 153 lines to ~85 lines
- **Same UI**: Frontend components are unchanged — only the hook dispatch layer consolidated

### Why multi-agent instead of one big agent?

- **Token efficiency**: Each subagent only sees tools relevant to its domain
- **Separation of concerns**: Research tools query current state; projection tools compute futures
- **Reliability**: Smaller, focused tool sets reduce hallucination

### Why backend stubs + frontend hooks?

- **The model needs schemas**: LLM function calling requires tool definitions at prompt time
- **Rendering belongs in the browser**: Charts, approval cards, and dashboard mutations are React components
- **Middleware bridges the gap**: `CopilotKitMiddleware` transparently routes tool calls without the model knowing where execution happens

### Why `copilotkit_interrupt()` for HITL?

- **Graph-level pause**: The entire LangGraph execution suspends — no polling, no timeouts
- **Guaranteed human oversight**: Payments and purchase orders cannot proceed without explicit approval
- **Clean resume**: The user's response becomes the tool's return value, and the graph continues naturally
