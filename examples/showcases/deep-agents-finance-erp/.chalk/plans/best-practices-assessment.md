# Best Practices Assessment: deep-agents-finance-erp

## Context
Review and fix the deep-agents-finance-erp showcase for CopilotKit best practices. A trace for "set up a cost control view" revealed critical issues with data flow and agent behavior.

---

## Desired Interaction Flow

1. User prompts
2. Agent acknowledges briefly ("Pulling Marketing spend data..."), then calls research subagent
3. Agent computes/plans the dashboard composition
4. Agent calls the right CopilotKit frontend tools to **reshape** the dashboard:
   - Reset dashboard (clear irrelevant widgets)
   - Add Budget vs Actual bar chart (Marketing 32% over budget)
   - Add Monthly Marketing Spend line chart (showing Feb-Mar spike)
   - Keep expense breakdown (relevant to cost analysis)
   - Narrow KPI cards to Operating Expenses and Net Profit
   - The dashboard tells a **cost control story**

---

## Changes Made

### 1. Added `query_monthly_expenses` tool (agent/tools.py)
- New tool exposes the existing `_MONTHLY_EXPENSES` data to the research subagent
- Supports optional `category` filter (payroll, operations, marketing, etc.)
- Returns JSON suitable for charting (e.g., "Monthly Marketing Spend" line chart)
- Added to `research_tools` list
- Documented in research agent prompt (agent/prompts.py)

### 2. Updated orchestrator prompt for dashboard reshaping (agent/prompts.py)
- Added "Dashboard Reshaping" section: when user asks for a themed dashboard, agent should `reset_dashboard` first, then build only relevant widgets
- Includes concrete example for Cost Control theme
- Added routing rule for "set up a ... view" pattern
- Updated `render_cash_position` instructions to route through research (no longer references frontend context)

### 3. Reduced frontend context (src/components/layout/shell.tsx)
- Removed 10 bulk `useAgentContext` calls that duplicated backend tool data
- Kept only KPIs (lightweight summary) and dashboard layout (widget management)
- Removed `JSON.stringify()` wrappers — `useAgentContext` handles serialization internally
- Cleaned up unused data imports

### 4. Added `instructions` prop to CopilotSidebar (src/components/layout/shell.tsx)
- Frontend-level guidance for the agent: prefer rich UI, use subagents for data

### 5. Deleted unused `agent/db.py`
- SQLAlchemy scaffolding that was never imported or used

---

## Known Issue: Empty `copilotkit.actions` and `copilotkit.context`

The trace shows `copilotkit: { actions: [], context: [] }` — frontend tools and context registered via `useFrontendTool`/`useAgentContext` don't reach the Python agent. This is a framework-level data flow issue (not showcase-specific).

**Investigation summary:** The `HttpAgent` correctly serializes the full `RunAgentInput` (including `tools` and `context`). The Python `langgraph_default_merge_state` correctly reads `input.tools` and `input.context` and maps them to `copilotkit.actions`/`copilotkit.context`. Yet the trace shows empty arrays, suggesting the frontend `CopilotKitCore` isn't populating tools/context in the HTTP request to the runtime — possibly a timing issue or agent ID mismatch in tool/context registration.

**Workarounds in place:**
- **Tools**: `frontend_tools.py` stubs are passed directly to the orchestrator (commit `771173f`). `CopilotKitMiddleware` intercepts execution and streams to frontend.
- **Context**: Bulk data removed from `useAgentContext`. Backend tools are the authoritative data source. Dashboard reshaping uses `reset_dashboard` to avoid needing widget IDs from context.

---

## Verification
1. Start the agent: `cd agent && uvicorn main:app --port 8123`
2. Start the frontend: `nx run deep-agents-finance-erp:dev`
3. Test: "I'm concerned about the Marketing overspend — set up a cost control view with budget tracking and spending trends"
4. Expected:
   - Agent resets dashboard, fetches budget + monthly data via research
   - Budget vs Actual bar chart (Marketing 32% over budget)
   - Monthly Marketing Spend line chart (Feb-Mar spike visible)
   - Expense breakdown widget (relevant to cost analysis)
   - KPI cards narrowed to cost-relevant metrics
5. Test other flows: cash position, HITL approval, forecasts
