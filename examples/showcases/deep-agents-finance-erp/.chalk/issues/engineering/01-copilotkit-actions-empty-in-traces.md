# copilotkit.actions is empty in agent traces

**Component:** Python SDK — `CopilotKitMiddleware` / `langgraph_agui_agent`
**Severity:** High
**Status:** Worked around, not fixed at root

## Problem

`copilotkit.actions` (the runtime-injected list of frontend tools) is consistently empty when the LangGraph agent executes. This was observed across multiple debugging sessions and confirmed in LangSmith traces.

Because `copilotkit.actions` is empty:
1. `CopilotKitMiddleware` cannot identify which tool calls are frontend tools, so it doesn't intercept them.
2. Frontend tool calls execute as backend stubs, returning plain strings instead of streaming UI components.
3. Dashboard update tools, rendering tools, and HITL approval tools all silently fail to produce visible UI.

## Evidence

- Plans [dashboard-changes-not-working.md](../plans/dashboard-changes-not-working.md) and [fix-agent-trace-behavior.md](../plans/fix-agent-trace-behavior.md) both identify this as root cause.
- [best-practices-assessment.md](../plans/best-practices-assessment.md) calls it a "framework-level data flow issue."
- Commit `c523eee` worked around it by passing `frontend_tools` directly to `create_deep_agent(tools=...)`.

## Workaround applied

Pass `frontend_tool_names` explicitly to the middleware and to `create_deep_agent()` so tools are available without relying on `copilotkit.actions`.

## What engineering should investigate

1. Why does `copilotkit.actions` not populate when the runtime forwards frontend tool definitions to the Python agent?
2. Is this specific to the `create_deep_agent` + `CopilotKitMiddleware` path, or does it also affect `CopilotKitAgent`?
3. Is there a race condition where the agent graph starts executing before the runtime has finished injecting actions?

## Lesson learned

When a framework-provided context object is empty, don't assume it's a usage error — trace the data flow from source to consumer. We spent multiple sessions debugging tool rendering when the actual issue was upstream data injection.
