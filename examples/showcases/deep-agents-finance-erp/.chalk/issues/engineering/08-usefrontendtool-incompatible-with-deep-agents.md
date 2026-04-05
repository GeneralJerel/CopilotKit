# useFrontendTool doesn't work reliably with deep agents

**Component:** CopilotKit React SDK + Python SDK middleware + LangGraph deep agents
**Severity:** High
**Status:** Working around by switching to `useRenderTool`

## Problem

`useFrontendTool` relies on a middleware interception cycle:
1. Agent calls a frontend tool
2. `CopilotKitMiddleware` intercepts the call, pauses the graph, and streams a `TOOL_CALL` event to the frontend
3. Frontend executes the tool handler, returns a result
4. Middleware resumes the graph with the tool result

With deep agents (`create_deep_agent`), this cycle breaks. The orchestrator delegates to subagents via a `task` tool, creating a nested graph execution. When the middleware pauses the outer graph to wait for a frontend tool result, the subagent's state and the graph continuation don't re-enter cleanly. The result: tools render momentarily during streaming, then vanish when the graph finalizes.

This is compounded by issue #01 (`copilotkit.actions` being empty), which means the middleware can't even identify which tools to intercept in the first place.

## Workaround

Switch non-HITL tools from `useFrontendTool` to `useRenderTool`:
- Backend stubs execute normally and return string results
- Frontend renders components from the tool call args (not from handler execution)
- No middleware interception or graph pause needed
- The `useRenderTool` hook simply observes `TOOL_CALL` events and renders a component

HITL tools (`useHumanInTheLoop` / `copilotkit_interrupt()`) are unaffected — they use a different mechanism that pauses at the LangGraph checkpointer level, not the middleware level.

## What engineering should investigate

1. Is `useFrontendTool` intended to work with multi-agent / deep agent graphs? If not, document this limitation.
2. If it should work, the middleware's graph pause/resume mechanism needs to handle nested subgraph execution — the continuation must propagate through the orchestrator's `task` tool back to the subagent.
3. Consider whether `useRenderTool` should be the recommended default for generative UI, with `useFrontendTool` reserved for cases where the frontend must compute a result the agent needs.

## Lesson learned

`useFrontendTool` and `useRenderTool` look similar but have fundamentally different execution models. `useFrontendTool` is bidirectional (frontend computes a result, sends it back to the agent). `useRenderTool` is one-way (agent provides args, frontend renders). For generative UI where the agent doesn't need a computed result back, `useRenderTool` is simpler and doesn't require middleware interception — making it compatible with any agent architecture.
