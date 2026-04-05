# Frontend tool renders briefly then vanishes from chat

**Component:** Frontend rendering lifecycle (React) + AG-UI event handling
**Severity:** High
**Status:** Partially addressed, needs further investigation

## Problem

When the agent calls a frontend tool (e.g., `render_invoices`), the rendered component appears in the chat for a moment during streaming, then disappears once the stream completes. The user sees a flash of the correct UI followed by either:
- An empty space where the component was
- The agent's text-only fallback response
- Raw JSON of the tool result

## Evidence

- [redesign-and-consolidation.md](../plans/redesign-and-consolidation.md): "Tool rendering streams and vanishes" listed as Problem 1.
- [debugging-tool-render.md](../plans/debugging-tool-render.md): Investigated streaming lifecycle but root cause was partially attributed to `emit_tool_calls` filtering.
- The consolidation commit (`0ff40e0`) may have reduced the frequency by simplifying tool selection, but the underlying lifecycle issue may still exist.

## Suspected causes

1. The AG-UI `TOOL_CALL_RESULT` event may trigger a React re-render that unmounts the streamed component.
2. The frontend tool registry may lose track of the tool call ID between the `TOOL_CALL_START` and `TOOL_CALL_RESULT` events.
3. If the middleware doesn't properly intercept the tool call (due to issue #01), the result event carries a string instead of a component reference.

## What engineering should investigate

1. Trace the full lifecycle of a frontend tool call in the React runtime: `TOOL_CALL_START` -> component mount -> `TOOL_CALL_RESULT` -> what happens to the mounted component?
2. Is there a race between the streaming completion handler and the tool render lifecycle?
3. Add integration tests that assert a rendered tool component remains visible after stream completion.

## Lesson learned

Streaming UIs have two critical moments: initial render and finalization. Testing only "does it render?" misses "does it stay rendered?" Always test the full lifecycle, especially the transition from streaming to complete state.
