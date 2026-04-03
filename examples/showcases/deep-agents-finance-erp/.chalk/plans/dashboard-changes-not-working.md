# Plan: Fix Dashboard Editor Not Working

## Context

The dashboard editor in the deep-agents-finance-erp showcase doesn't update when the agent calls dashboard tools (e.g., `render_kpi_cards`, `render_custom_chart`, `reset_dashboard`). The agent trace shows all tool calls succeed, but the dashboard remains unchanged.

## Root Cause Analysis

The architecture has three layers for frontend tools:

1. **Backend stubs** (`agent/frontend_tools.py`) — simple tools returning strings like `"KPI cards rendered."`, registered with the LLM so it can call them
2. **CopilotKitMiddleware** (`agent/agent.py:71`) — intercepts frontend tool calls in `after_model`, preventing backend execution, so they can be routed to the frontend
3. **Frontend handlers** (`src/hooks/use-render-*.ts`) — `useFrontendTool` hooks that actually update dashboard state via React context

**The bug**: The trace shows `copilotkit.actions: []` — the middleware doesn't know which tools are frontend tools. This causes:

1. `CopilotKitMiddleware.after_model()` sees empty `copilotkit.actions` → doesn't intercept any tool calls
2. All tools (including dashboard tools) execute as backend stubs → return simple strings
3. Frontend `RunHandler.processAgentResult()` checks each tool call: if a tool result message already exists (from the backend stub), it skips frontend handler execution (see `packages/core/src/core/run-handler.ts:351-357`)
4. Dashboard state never updates

**Data flow**: `copilotkit.actions` is populated from `input.tools` (the AG-UI request's `tools` field) via `langgraph_default_merge_state`. Since `input.tools` is `[]`, `copilotkit.actions` is `[]`.

**Why `input.tools` is empty**: The frontend registers 14 tools via `useFrontendTool` hooks, and the `RunHandler.buildFrontendTools()` should send them in the AG-UI request. Both `tools` AND `context` are empty in the trace (despite `useAgentContext` being called), suggesting a systemic issue with frontend → runtime → agent data flow.

## Fix Strategy

Since we cannot control whether frontend tools will arrive in `copilotkit.actions` (it depends on the AG-UI transport chain working correctly), the most robust fix is to make the `CopilotKitMiddleware` identify frontend tools by an **explicit list passed at construction time**, rather than relying solely on `copilotkit.actions`.

### Changes

#### 1. Update `CopilotKitMiddleware` usage in `agent/agent.py`

Pass the list of frontend tool names to the middleware so it can intercept them regardless of whether `copilotkit.actions` is populated:

```python
from copilotkit import CopilotKitMiddleware
from frontend_tools import frontend_tools

# Extract names of frontend tools
frontend_tool_names = [t.name for t in frontend_tools]

agent = create_deep_agent(
    ...
    tools=frontend_tools,
    middleware=[CopilotKitMiddleware(frontend_tool_names=frontend_tool_names)],
    ...
)
```

#### 2. Update `CopilotKitMiddleware` in `sdk-python/copilotkit/copilotkit_lg_middleware.py`

Add `frontend_tool_names` parameter to the constructor and use it as a fallback in `after_model`:

- `__init__`: Accept optional `frontend_tool_names: list[str]`
- `after_model`: Use `frontend_tool_names` as fallback when `copilotkit.actions` is empty
- Same for `wrap_model_call` / `awrap_model_call`

### Critical Files

- `examples/showcases/deep-agents-finance-erp/agent/agent.py` — middleware wiring
- `sdk-python/copilotkit/copilotkit_lg_middleware.py` — middleware implementation
- `examples/showcases/deep-agents-finance-erp/agent/frontend_tools.py` — tool definitions (no changes needed)

### Key Code Paths

- `CopilotKitMiddleware.after_model()` at `sdk-python/copilotkit/copilotkit_lg_middleware.py:332-385` — intercepts frontend tool calls
- `RunHandler.processAgentResult()` at `packages/core/src/core/run-handler.ts:339-409` — decides whether to execute frontend handlers
- `LangGraphAGUIAgent.langgraph_default_merge_state()` at `sdk-python/copilotkit/langgraph_agui_agent.py:192-204` — maps `input.tools` to `copilotkit.actions`

## Verification

1. Run the showcase app (`agent` + Next.js frontend)
2. Click "Cash Flow Dashboard" suggestion
3. Verify the dashboard updates with KPI cards, AR Aging chart, overdue invoices, and quarterly projection
4. Check LangSmith trace — tool call results should now be frontend handler results (e.g., `{ action: "added", widgetType: "KPI Cards" }`) instead of backend stub strings
