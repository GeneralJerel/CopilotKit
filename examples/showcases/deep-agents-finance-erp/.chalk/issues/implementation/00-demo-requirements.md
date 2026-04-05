# Demo requirements

This showcase was built to demonstrate CopilotKit's integration with the LangChain ecosystem for a joint marketing effort. The demo must show all three working together in a realistic finance ERP application.

## What the demo must show

### 1. LangChain Deep Agents (`deepagents` + `langgraph`)
- **Multi-agent orchestration** using `create_deep_agent()` — an orchestrator LLM delegates to specialized subagents (research, projections) via a `task` tool.
- Each subagent has its own system prompt, tools, and scope.
- The orchestrator handles user-facing interaction, routing, and frontend tool calls; subagents handle backend data queries.
- Demonstrates that CopilotKit's middleware layer (`CopilotKitMiddleware`) can wrap a deepagents graph transparently.

### 2. LangSmith observability and evals
- **Tracing:** Every agent interaction produces a trace visible in LangSmith (`LANGCHAIN_TRACING_V2=true`, project: `deep-agent-finance-erp-agent`).
- **Evals:** An evaluation suite (`agent/evals/test_agent.py`) with 8 test cases covering invoices, accounts, inventory, HR, reports, and forecasting. Uses `langsmith.evaluation.aevaluate` with a `contains_expected` evaluator. Target: >80% correctness score.
- **Commands:** `python -m evals.test_agent --create-dataset` to seed, `python -m evals.test_agent` to run.

### 3. LangGraph Cloud deployment
- The agent is deployable to LangGraph Cloud via `langgraph.json` config and `langgraph deploy`.
- The frontend connects to either a local agent (`http://localhost:8123/...`) or a cloud deployment (`https://<deployment>.us.langgraph.app/...`) by changing `REMOTE_ACTION_URL`.
- The `langgraph.json` maps graph name `finance_erp_agent` to the Python export `agent:finance_erp_graph`.

## Architecture

```
Next.js 16 (frontend)
  │  AG-UI / SSE
  ▼
CopilotKit Runtime (Next.js API route)
  │  LangGraphHttpAgent
  ▼
LangGraph Agent (FastAPI / deepagents)
  ├── Orchestrator (GPT-4o, frontend tools, routing)
  ├── Research subagent (ERP data queries)
  └── Projections subagent (financial forecasting)
  │
  │  traces
  ▼
LangSmith (observability + evals)
```

## Key files

| File | Role |
|------|------|
| `agent/agent.py` | Multi-agent graph via `create_deep_agent()` |
| `agent/main.py` | FastAPI + AG-UI entry point |
| `agent/prompts.py` | System prompts for orchestrator + subagents |
| `agent/evals/test_agent.py` | LangSmith eval dataset and runner |
| `agent/langgraph.json` | LangGraph Cloud deployment config |
| `src/app/api/copilotkit/[[...slug]]/route.ts` | CopilotKit runtime with `LangGraphHttpAgent` |

## Current status: post-consolidation patch

The architecture redesign (14→5 tools, commit `0ff40e0`) solved tool selection — evals confirm the orchestrator picks the right tool across all 7 test queries. Two rendering bugs remain:

1. **Subagent text leaks into chat.** Subagent `TEXT_MESSAGE` events stream raw JSON to the UI, then vanish when `MessagesSnapshot` replaces the streaming state. Fix: `emit_messages=False` in the agent config.

2. **`useFrontendTool` doesn't work reliably with deep agents.** Frontend tools require a middleware interception → graph exit → continuation cycle. Deep agents (orchestrator + subagents) don't re-enter cleanly after the middleware pauses the graph. Fix: switch non-HITL tools from `useFrontendTool` to `useRenderTool` — backend stubs execute normally, frontend renders from tool call args, no interception needed.

The patch ([post-consolidation-plan.md](../plans/post-consolidation-plan.md)) converts 4 hooks to `useRenderTool`, adds `emit_messages=False`, and removes the custom `CopilotKitLangGraphAgent` class that was only needed for frontend tool schema injection. `useHumanInTheLoop` (approval flow) is unchanged — HITL uses `copilotkit_interrupt()` which has its own mechanism.

## Why it matters

This isn't just a CopilotKit demo — it's a joint showcase proving that CopilotKit + LangChain deepagents + LangSmith + LangGraph Cloud work as a production stack. Every issue in this folder is something that threatened that story.
