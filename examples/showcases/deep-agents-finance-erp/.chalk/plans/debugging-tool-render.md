# Fix: Hide raw JSON for `task` tool calls in chat

## Context

The deep-agents orchestrator delegates work to subagents via a `task` tool (defined in the `deepagents` library). When the agent calls `task`, the raw JSON result (e.g. `{"invoices":[...]}`) appears as plain text in the chat during streaming, then disappears when complete.

**Root cause**: The `_dispatch_event` method in `sdk-python/copilotkit/langgraph_agui_agent.py` has bugs in its `emit_tool_calls` filtering:

1. **List filtering not implemented**: It only checks `is False`, not list/string values. When `emit_tool_calls=["render_chart", ...]`, the value is truthy so the filter never triggers.
2. **`TOOL_CALL_RESULT` not filtered**: `EventType.TOOL_CALL_RESULT` is missing from the `is_tool_event` set, so tool results always pass through.
3. **Metadata key mismatch**: `copilotkit_customize_config()` sets `copilotkit:emit-tool-calls`, but the base `ag_ui_langgraph` agent reads `emit-tool-calls` (no prefix). The base agent always defaults to `True`.

### What's already done (previous conversation)

- `shell.tsx`: Added `useRenderTool` for `"task"` — shows "Researching..." / "Running projections..." with animation (safety net)
- `main.py`: Changed `emit_tool_calls=True` to `emit_tool_calls=_emit_tool_names` (list of frontend-only tool names, excluding `task`)

These changes are correct but insufficient because the SDK doesn't properly enforce list-based filtering.

## Plan

### 1. Fix `_dispatch_event` in `sdk-python/copilotkit/langgraph_agui_agent.py`

The `_dispatch_event` method needs to properly handle list/string-based `emit_tool_calls` filtering, not just boolean `False`.

**Changes:**
- Add `TOOL_CALL_RESULT` to the tool event type check
- Add a `_tool_call_names` dict to track `tool_call_id → tool_name` mappings (needed because ARGS/END/RESULT events don't carry the tool name)
- Implement list/string matching logic: if the tool name is not in the allowed list, return `None` to suppress the event

```python
# In __init__, add:
self._tool_call_names: dict[str, str] = {}

# In _dispatch_event, replace the existing filtering block (lines 144-169):
is_tool_event = event.type in [
    EventType.TOOL_CALL_START,
    EventType.TOOL_CALL_ARGS,
    EventType.TOOL_CALL_END,
    EventType.TOOL_CALL_RESULT,  # <-- ADD THIS
]

# Track tool_call_id → name from START events (before filtering)
if event.type == EventType.TOOL_CALL_START:
    tc_id = getattr(event, 'tool_call_id', None)
    tc_name = getattr(event, 'tool_call_name', None)
    if tc_id and tc_name:
        self._tool_call_names[tc_id] = tc_name

if "copilotkit:emit-tool-calls" in metadata and is_tool_event:
    emit_cfg = metadata["copilotkit:emit-tool-calls"]
    if emit_cfg is False:
        return None
    if isinstance(emit_cfg, (list, str)):
        tc_id = getattr(event, 'tool_call_id', None)
        tool_name = (
            getattr(event, 'tool_call_name', None)
            or self._tool_call_names.get(tc_id)
        )
        allowed = emit_cfg if isinstance(emit_cfg, list) else [emit_cfg]
        if tool_name and tool_name not in allowed:
            return None
```

### 2. No changes needed to showcase files

The existing changes in `main.py` and `shell.tsx` are already correct and will work once the SDK filtering is fixed.

**Files already modified (keep as-is):**
- `examples/showcases/deep-agents-finance-erp/agent/main.py` — `emit_tool_calls=_emit_tool_names` (list of frontend tool names)
- `examples/showcases/deep-agents-finance-erp/src/components/layout/shell.tsx` — `useRenderTool` for `"task"` as safety net

## Key files

| File | Role |
|------|------|
| `sdk-python/copilotkit/langgraph_agui_agent.py` | **FIX HERE** — `_dispatch_event` filtering |
| `sdk-python/copilotkit/langgraph.py` | `copilotkit_customize_config()` — sets `copilotkit:emit-tool-calls` metadata |
| `examples/showcases/deep-agents-finance-erp/agent/main.py` | Showcase entry point — already uses list-based `emit_tool_calls` |
| `examples/showcases/deep-agents-finance-erp/src/components/layout/shell.tsx` | Frontend — already has `useRenderTool` for `task` |

## Verification

1. Start the agent: `cd examples/showcases/deep-agents-finance-erp/agent && python main.py`
2. Start the frontend: `cd examples/showcases/deep-agents-finance-erp && npm run dev`
3. Test: "Process payment for all overdue invoices"
   - Should see "Researching..." animation briefly (from `useRenderTool`)
   - NO raw JSON in chat
   - Then `approve_invoice_payment` HITL card renders
4. Test: "What's our current cash position?"
   - Should see "Researching..." then cash position card
5. Test a projections query to verify "Running projections..." variant
