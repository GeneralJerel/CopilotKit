# Fix: Finance ERP Agent Trace — Missing Acknowledgment, Empty Frontend Tools, No UI Render

## Context

The user shared a LangSmith trace for the finance ERP showcase agent. The user asked:
> "What's our current cash position and how does it compare to our liabilities?"

**Desired behavior:**
1. User prompts
2. Agent acknowledges with a quick sentence, then calls the right subagent (with tool render visible via CopilotKit)
3. Agent computes/plans the answer
4. Agent calls the right CopilotKit frontend tool (`render_cash_position`) to display rich UI

**Actual behavior (from trace):**
1. User prompts
2. Agent emits **empty content `""`** → immediately calls `task(research)` with no acknowledgment
3. Research returns structured data (cash: $1.245M, liabilities: $904.5K, net: $340.5K)
4. Agent responds with **plain text** summary — never calls `render_cash_position`

## Root Cause Analysis

### Issue 1: `copilotkit.actions` is empty — frontend tools not available
The trace shows `"actions": []` in the input state. This means the CopilotKitMiddleware has **zero frontend tools** to inject into the LLM's tool list. Without tools, the LLM literally cannot call `render_cash_position`.

The agent is configured with `tools=[]` in `create_deep_agent()` (agent.py:67), relying entirely on CopilotKitMiddleware to inject frontend tools from `state.copilotkit.actions`. But if the frontend doesn't send them (or the trace was run outside the frontend), the agent has **no frontend tools at all**.

**Fix:** Pass `frontend_tools` directly to `create_deep_agent(tools=frontend_tools)`. CopilotKitMiddleware will still intercept these tool calls (preventing backend execution) and stream them to the frontend via AG-UI. This ensures frontend tools are always available even if the frontend doesn't send action definitions. The middleware deduplicates if both sources provide the same tool.

### Issue 2: `copilotkit.context` is empty — no ERP data context
The trace shows `"context": []`. The frontend's `useAgentContext()` shares 12 data contexts (KPIs, invoices, accounts, etc.), but none arrived. This is consistent with Issue 1 — either the request didn't come from the frontend, or context injection failed.

**Fix:** This is likely the same root cause as Issue 1 (test/eval without frontend). Passing frontend_tools as backend tools is the primary fix. Context being empty is secondary — the agent can still fetch data via the research subagent.

### Issue 3: No acknowledgment before tool call
The AI message has `content: ""` then immediately makes the `task` tool call. The ORCHESTRATOR_PROMPT (prompts.py:3-124) has no instruction to acknowledge the user before acting.

**Fix:** Add a "Response Style" section to ORCHESTRATOR_PROMPT instructing the LLM to always emit a brief acknowledgment sentence before dispatching to subagents.

### Issue 4: No `render_cash_position` call — plain text instead of rich UI
The routing rules clearly state: "Cash position / liquidity → research → call render_cash_position". But the agent just responded with plain text. This is a direct consequence of Issue 1 — the tool wasn't available. Once frontend tools are available, the LLM should follow the routing table.

**Fix:** Primarily solved by Issue 1 fix. Additionally, strengthen the prompt to emphasize: "NEVER describe financial data in plain text when a frontend tool exists for it."

---

## Implementation Plan

### Step 1: Pass frontend tools to orchestrator (agent.py)

```python
# Add import
from frontend_tools import frontend_tools

# Change tools=[] to tools=frontend_tools
agent = create_deep_agent(
    model=llm,
    tools=frontend_tools,  # Always available; CopilotKitMiddleware intercepts execution
    system_prompt=ORCHESTRATOR_PROMPT,
    subagents=[research_subagent, projections_subagent],
    middleware=[CopilotKitMiddleware()],
    checkpointer=checkpointer,
)
```

### Step 2: Add acknowledgment + response style to prompt (prompts.py)

Add a new section to ORCHESTRATOR_PROMPT after "## Rules":

```
## Response Style

- **Always acknowledge first.** Before calling any subagent or tool, emit a brief
  (1 sentence) acknowledgment so the user sees immediate feedback while you work.
  Example: "Let me pull the latest cash position data." Then call the subagent/tool.
- **Never respond with plain financial data in text** when a frontend rendering tool
  exists for it. Always prefer the rich UI component.
- After rendering a component, add a brief (1-2 sentence) insight or summary — not
  a raw repetition of the numbers the component already shows.
```

### Step 3: Strengthen routing enforcement in prompt (prompts.py)

In the existing Rules section, add emphasis:

```
- CRITICAL: After getting data from a subagent, ALWAYS check the Routing Rules table
  and call the appropriate frontend tool before responding. Never skip the frontend
  tool step — the user expects rich UI, not plain text.
```

---

## Files to Modify

| File | Change |
|---|---|
| agent/agent.py | Import and pass `frontend_tools` to `create_deep_agent(tools=...)` |
| agent/prompts.py | Add "Response Style" section + strengthen routing enforcement in Rules |

## Verification

1. Run the agent locally: `cd agent && make dev`
2. Ask: "What's our current cash position and how does it compare to our liabilities?"
3. Verify in trace:
   - AI message has non-empty `content` (acknowledgment) before `task` tool call
   - After research returns, agent calls `render_cash_position` with correct data
   - Final response is a brief insight, not a raw data dump
4. Run existing evals if available: `python evals/test_agent.py`
