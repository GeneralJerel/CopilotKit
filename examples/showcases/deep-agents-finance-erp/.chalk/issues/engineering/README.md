# Engineering Issues — CopilotKit x Deep Agents

Platform-level bugs and gaps in the CopilotKit Python SDK, middleware, and React SDK that surface specifically when used with LangChain deep agents (`create_deep_agent`). These need upstream fixes.

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 01 | `copilotkit.actions` empty in agent traces | High | Worked around |
| 02 | `emit_tool_calls` filtering broken for list/string | High | Fixed locally, needs upstream |
| 05 | Metadata key mismatch on subgraph events | Medium | Fixed locally, needs upstream |
| 08 | `useFrontendTool` incompatible with deep agents | High | Working around with `useRenderTool` |
