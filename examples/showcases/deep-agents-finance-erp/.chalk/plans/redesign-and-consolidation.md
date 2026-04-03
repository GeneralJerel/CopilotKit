# Finance ERP Agent: Architecture Redesign + Rendering Fix

## Context

Two problems with the deep-agents-finance-erp showcase:

1. **Tool rendering streams and vanishes** — inline chat components (charts, cash position cards) appear briefly then disappear. 3 of 4 logged runs show null inputs/outputs.
2. **Wrong tool selection** — the orchestrator has 14 frontend tools + built-in deep agent tools (~20+ total) visible at once. It sometimes calls the wrong render tool or skips calling one entirely, responding with plain text.

The user wants to redesign the agent architecture to improve reliability.

---

## Problem 1: Rendering Fix (Already Partially Done)

The SDK fix in [langgraph_agui_agent.py](sdk-python/copilotkit/langgraph_agui_agent.py) is **already applied** — it properly handles list/string-based `emit_tool_calls` filtering, includes `TOOL_CALL_RESULT`, and falls back to agent config metadata for subgraph events. Tests exist in [test_emit_filtering.py](sdk-python/tests/test_emit_filtering.py).

**Remaining diagnosis needed:**
- Verify the fix works end-to-end (the code is committed but may not have been tested live)
- The null inputs/outputs in LOG2-4 are likely subagent traces in LangSmith (expected behavior — each `task()` spawns an ephemeral subagent whose results collapse into a `ToolMessage`)
- If rendering still vanishes after confirming the SDK fix works, the issue is in the frontend tool lifecycle (the `useFrontendTool` render component being unmounted when the message list reconciles)

**Action:** Test live before any architecture changes. If rendering works, proceed to Problem 2.

---

## Problem 2: Architecture Redesign

### Why Option A (5 agents) Won't Work

Orchestrator + Planner + Calculation + Frontend Tool Caller + Dashboard Designer is **not viable** because:

- **Only the orchestrator can call frontend tools.** The `deepagents` library spawns subagents as ephemeral one-shot LangGraph runs. `CopilotKitMiddleware` only wraps the orchestrator. A "Frontend Tool Caller" subagent literally cannot emit AG-UI tool call events.
- **Each subagent gets the full deepagents middleware stack** (TodoList, Filesystem, Summarization, PromptCaching, PatchToolCalls). 5 agents = 5x the overhead.
- **Coordination is fragile.** Data must be faithfully serialized through 4+ handoffs. LLMs lose fidelity at each step.

### Why Option B (Skills Only) Is Insufficient

Skills in `deepagents` are a **system prompt mechanism** — they organize instructions via progressive disclosure but do NOT reduce the tool list. The orchestrator would still see all 14 frontend tools simultaneously. Skills help with prompt organization but don't solve tool confusion.

### Recommended: Hybrid — Keep 3 Agents, Consolidate Tools, Add Skills for Prompt Organization

**Architecture:**
```
Orchestrator (GPT-4o)
  Tools: 6 consolidated frontend tools + task
  Skills: "dashboard", "visualization", "approval"

Research Subagent (unchanged)
  Tools: 13 data query tools

Projections Subagent (unchanged)  
  Tools: 6 computation tools
```

**The key change: consolidate 14 frontend tools into 6.**

| Current tools | New consolidated tool | Why |
|---|---|---|
| `render_chart` + `render_cash_position` | **`render_chat_visual`** | Single tool with `type: "chart" \| "cash_position"`. Model only decides "show a visual in chat". |
| `navigate_and_filter` | **`navigate_and_filter`** | Keep as-is, unique function. |
| `approve_invoice_payment` + `approve_inventory_reorder` | **`request_approval`** | Single HITL tool with `type: "invoice_payment" \| "inventory_reorder"`. |
| 6 dashboard widget tools (`render_kpi_cards`, `render_revenue_chart`, `render_expense_breakdown`, `render_transactions`, `render_invoices`, `render_custom_chart`) | **`update_dashboard`** | Single tool accepting `widgets: [{type, config, colSpan}]`. One call adds multiple widgets. |
| `remove_dashboard_widget` + `update_dashboard_layout` + `reset_dashboard` | **`manage_dashboard`** | Single tool with `action: "remove" \| "reorder" \| "reset"`. |

**Result: 6 tools visible to the orchestrator** (down from 14) + `task` + ~5 built-in deep agent tools = ~12 total. Well within the 3-12 range where GPT-4o is reliable.

### Skills for Prompt Organization

Add 3 skills to the orchestrator (read on demand, not always loaded):

1. **`dashboard` skill** — Detailed instructions for `update_dashboard` and `manage_dashboard`: widget types, colSpan guidelines, themed dashboard composition workflow, example widget configs.
2. **`visualization` skill** — Chart type selection guide (area vs bar vs line), series configuration, data formatting rules for `render_chat_visual`.
3. **`approval` skill** — HITL workflow details for `request_approval`, when to use each approval type, required data format.

This keeps the base orchestrator prompt short (~75 lines) while detailed instructions are available on-demand when the model encounters a relevant task.

### Simplified Orchestrator Prompt (~75 lines)

```
Section 1: Role + subagents (20 lines)
  - Identity
  - research agent: when to use, what it returns
  - projections agent: when to use, what it returns

Section 2: Frontend tools (30 lines)  
  - render_chat_visual — inline visuals in chat
  - navigate_and_filter — SPA navigation
  - request_approval — HITL approval flows
  - update_dashboard — add/update dashboard widgets
  - manage_dashboard — remove/reorder/reset dashboard

Section 3: Decision rules (15 lines)
  - Simple if/then rules (not a 21-row table)
  
Section 4: Behavior (10 lines)
  - Acknowledge first, render rich UI, summarize after
```

### Data Flow Example

User: "Build me a cash flow risk dashboard"

1. Orchestrator: "Setting up a cash flow risk dashboard." 
2. `manage_dashboard(action="reset")`
3. `task(research, "Query AR aging, overdue invoices, account balances")`
4. `task(projections, "Compute 4-quarter cash flow forecast")`
5. `update_dashboard(widgets=[{type: "kpi_cards", config: {metrics: ["AR", "Cash"]}}, {type: "invoices", config: {statuses: ["overdue"]}}, {type: "custom_chart", config: {title: "AR Aging", ...}}, {type: "custom_chart", config: {title: "Cash Flow Projection", ...}}])`
6. Summary message

**2 tool selection decisions** (manage_dashboard + update_dashboard) instead of **6+** (reset + render_kpi + render_invoices + render_custom_chart x2 + ...).

---

## Implementation Plan

### Phase 1: Verify Rendering Fix
1. Start agent + frontend, test "What's our cash position?"
2. Confirm the cash position card renders and persists (doesn't vanish)
3. If it still vanishes, debug the frontend `useFrontendTool` lifecycle

### Phase 2: Consolidate Backend Tools
**File: [agent/frontend_tools.py](examples/showcases/deep-agents-finance-erp/agent/frontend_tools.py)**
- Replace 14 `@tool` functions with 6 consolidated ones
- `render_chat_visual(type, ...)` — dispatches based on type
- `request_approval(type, ...)` — uses `copilotkit_interrupt()` for both approval types
- `update_dashboard(widgets)` — accepts array of widget configs
- `manage_dashboard(action, ...)` — handles remove/reorder/reset

### Phase 3: Consolidate Frontend Hooks
**Files: [src/hooks/](examples/showcases/deep-agents-finance-erp/src/hooks/)**
- Replace 14 `useFrontendTool` hooks with 6
- `useRenderChatVisual` — dispatches to `InlineChatChart` or `CashPositionCard` based on args.type
- `useRequestApproval` — dispatches to `InvoiceApprovalCard` or `InventoryReorderCard`
- `useUpdateDashboard` — iterates `widgets` array, calls `upsertWidget` for each
- `useManageDashboard` — calls `removeWidget`/`reorderWidgets`/`resetDashboard`

### Phase 4: Rewrite Prompts
**File: [agent/prompts.py](examples/showcases/deep-agents-finance-erp/agent/prompts.py)**
- Rewrite `ORCHESTRATOR_PROMPT` from 153 lines to ~75 lines
- Add skill files for dashboard, visualization, approval details
- Keep `RESEARCH_AGENT_PROMPT` and `PROJECTIONS_AGENT_PROMPT` unchanged

### Phase 5: Update Entry Point
**File: [agent/main.py](examples/showcases/deep-agents-finance-erp/agent/main.py)**
- Update `_UI_TOOL_SCHEMAS` for new consolidated tool names
- Update `_emit_tool_names` list
- Update `agent.py` tool imports

### Phase 6: Update Frontend Registration
**File: [src/components/layout/shell.tsx](examples/showcases/deep-agents-finance-erp/src/components/layout/shell.tsx)**
- Replace 14 hook calls with 6

---

## Verification

1. **Rendering**: "What's our cash position?" — cash position card renders and persists
2. **Tool selection**: "Build me a cost control dashboard" — orchestrator calls `manage_dashboard(reset)` then `update_dashboard(widgets=[...])`
3. **Chart**: "Show me revenue vs expenses trend" — `render_chat_visual(type="chart", ...)` renders inline
4. **Approval**: "Pay overdue invoices" — `request_approval(type="invoice_payment", ...)` shows HITL card
5. **Existing evals**: Run `agent/evals/test_agent.py` to verify no regression

---

## Key Files

| File | Change |
|------|--------|
| `agent/frontend_tools.py` | Consolidate 14 tools → 6 |
| `agent/prompts.py` | Rewrite orchestrator prompt (~75 lines) |
| `agent/agent.py` | Update tool imports |
| `agent/main.py` | Update schemas + emit config |
| `src/hooks/use-*.ts` | Consolidate 14 hooks → 6 |
| `src/components/layout/shell.tsx` | Register 6 hooks instead of 14 |
| `sdk-python/copilotkit/langgraph_agui_agent.py` | Already fixed (verify only) |
