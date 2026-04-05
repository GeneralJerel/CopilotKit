# emit_tool_calls filtering doesn't handle list/string values

**Component:** Python SDK — `_dispatch_event` in `langgraph_agui_agent.py`
**Severity:** High
**Status:** Fixed in commit `64d360e`

## Problem

The `emit_tool_calls` config option was only checked as a boolean (`is False`). When set to a list of tool names (e.g., `["render_invoices", "render_cash_position"]`) or a string, the filtering logic treated it as truthy and emitted all tool call events — including internal tools like `task` whose raw JSON would leak into the chat stream.

Additionally:
- `EventType.TOOL_CALL_RESULT` was not included in the tool event filter, so even when `TOOL_CALL_START` was suppressed, the result event would still stream through.
- Subgraph events carried metadata under `raw_event` that lacked the `copilotkit:emit-tool-calls` key, so the code couldn't determine filtering rules for nested agent tool calls.

## Impact

Users would see raw JSON blobs flash in the chat during streaming — e.g., a `task` tool's structured result appearing as `{"status": "complete", "result": {...}}` before being replaced by the actual rendered component (or not replaced at all).

## Fix applied

- Implemented proper list/string checking: if `emit_tool_calls` is a list, only emit events for tool names in that list.
- Added `TOOL_CALL_RESULT` to the set of filtered event types.
- Added fallback to `self.config` metadata when event-level metadata is missing the key.

## What engineering should investigate

1. Should `emit_tool_calls` filtering be documented as supporting `bool | list[str] | str`? The type signature may only declare `bool`.
2. Consider whether subgraph events should inherit parent graph metadata by default, rather than requiring each consumer to implement fallback logic.

## Lesson learned

When a config option can take multiple types (bool, list, string), test all forms. The `is False` check is a Python gotcha — `[] is False` is `False`, so an empty list also bypasses filtering. Use explicit type checks.
