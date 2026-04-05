# Repeated fix cycles from debugging symptoms instead of root causes

**Component:** Process / approach
**Severity:** N/A — retrospective
**Status:** Resolved through redesign

## Problem

The commit history shows a pattern of repeated fix attempts that addressed symptoms rather than root causes:

| Cycle | Symptom addressed | Actual root cause |
|-------|-------------------|-------------------|
| 1 | Agent doesn't call `render_cash_position` | `copilotkit.actions` empty — tools not available |
| 2 | Made tool call "mandatory" in prompt | Same — prompt can't fix missing tools |
| 3 | Added `DebugToolsMiddleware` | Traced the real issue — actions empty |
| 4 | Registered frontend tools as backend stubs | Workaround — stubs return strings, not UI |
| 5 | Passed tools directly to `create_deep_agent` | First real fix for tool availability |
| 6 | Raw JSON leaking in chat | `emit_tool_calls` filtering bug in SDK |
| 7 | Wrong tool selected | Too many tools — needed consolidation |

Commits `f09eca8` through `0ff40e0` represent ~7 fix attempts over what could have been 2-3 if root causes were identified earlier.

## What went wrong

1. **Prompt-level fixes for infrastructure problems.** When the agent didn't call a tool, the first instinct was to strengthen the prompt ("make it mandatory"). But the tool wasn't in the agent's tool list — no prompt can make the agent call a tool it can't see.

2. **Workarounds layered on workarounds.** Registering frontend tools as backend stubs was a workaround for empty `copilotkit.actions`. But stubs return strings, not rendered components — creating a new symptom that required another fix.

3. **Debugging the wrong layer.** Time was spent adjusting prompts and frontend code when the bug was in the SDK's event filtering logic.

## Lessons learned

1. **Before writing a prompt fix, verify the tool is in the agent's tool list.** Print `agent.tools` or check traces. If the tool isn't there, no prompt will help.

2. **Before adding a workaround, understand why the original path doesn't work.** "Register stubs" is a workaround. "Why is `copilotkit.actions` empty?" is the right question.

3. **When streaming output looks wrong, check the event pipeline first.** The display layer (React) is usually correct — the bug is usually in what events reach it.

4. **Reduce scope to isolate.** Test one tool, one agent, one user message. If that works, scale up. If it doesn't, you've found your minimal repro.
