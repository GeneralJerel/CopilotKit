# Finance ERP: Fix Frontend Tool Rendering (Post-Rearchitecture)

## Context

The architecture redesign (14→5 consolidated tools) is **complete and working at the model level**. Eval data confirms the orchestrator correctly calls all 5 tools across 7 test queries. Tool selection problem is solved.

**The remaining bug is in the rendering pipeline:**
1. Subagent text (raw JSON) leaks to the chat via TEXT_MESSAGE events → vanishes when MessagesSnapshot replaces streaming state
2. `useFrontendTool` hooks require a middleware interception → graph exit → continuation cycle that doesn't work reliably with deep agents

**Fix:** Switch non-HITL tools from `useFrontendTool` to `useRenderTool`. Backend stubs execute normally, frontend renders components from tool call args. No middleware interception needed.

---

## Changes

### 1. Suppress subagent text leakage

**File: `examples/showcases/deep-agents-finance-erp/agent/main.py`**

Add `emit_messages=False` to the config:
```python
agui_config = copilotkit_customize_config(
    emit_tool_calls=_emit_tool_names,
    emit_messages=False,  # Suppress subagent text streaming
)
```

Remove `_UI_TOOL_SCHEMAS` and `CopilotKitLangGraphAgent` override — no longer needed since UI tools aren't intercepted:
```python
# Remove: _UI_TOOL_SCHEMAS, CopilotKitLangGraphAgent class
# Use standard LangGraphAGUIAgent directly
```

### 2. Switch hooks to useRenderTool

**File: `examples/showcases/deep-agents-finance-erp/src/hooks/use-render-chat-visual.tsx`**

Replace `useFrontendTool` with `useRenderTool`. Pure render, no handler:
```tsx
import { useRenderTool } from "@copilotkit/react-core/v2";

export function useRenderChatVisual() {
  useRenderTool({
    name: "render_chat_visual",
    render: ({ args, status }) => {
      if (status === "complete" && !args) return null;
      if (args?.type === "cash_position") {
        return <CashPositionCard status={status} args={{...}} />;
      }
      return <InlineChatChart status={status} args={{...}} />;
    },
  }, []);
}
```

**File: `examples/showcases/deep-agents-finance-erp/src/hooks/use-update-dashboard.ts` → `.tsx`**

Switch to `useRenderTool`. Return a wrapper component that applies mutations via useEffect:
```tsx
import { useRenderTool } from "@copilotkit/react-core/v2";

function DashboardUpdater({ widgets, status }: Props) {
  const { upsertWidget, addWidget, getWidgets } = useDashboard();
  const applied = useRef(false);

  useEffect(() => {
    if (status === "complete" && widgets?.length && !applied.current) {
      applied.current = true;
      // existing mutation logic from the old handler
    }
  }, [status, widgets]);

  if (status === "complete") return null;
  return <p className="animate-pulse">Updating dashboard...</p>;
}

export function useUpdateDashboard() {
  useRenderTool({
    name: "update_dashboard",
    render: ({ args, status }) => (
      <DashboardUpdater widgets={args?.widgets ?? []} status={status} />
    ),
  }, []);
}
```

**File: `examples/showcases/deep-agents-finance-erp/src/hooks/use-manage-dashboard.ts` → `.tsx`**

Same pattern — `useRenderTool` with a wrapper component:
```tsx
function DashboardManager({ action, widgetId, updates, status }: Props) {
  const { resetToDefault, removeWidget, ... } = useDashboard();
  const applied = useRef(false);

  useEffect(() => {
    if (status === "complete" && !applied.current) {
      applied.current = true;
      if (action === "reset") resetToDefault();
      else if (action === "remove") removeWidget(widgetId);
      else if (action === "reorder") { /* existing logic */ }
    }
  }, [status, action]);

  if (status === "complete") return null;
  return <p className="animate-pulse">Updating layout...</p>;
}
```

**File: `examples/showcases/deep-agents-finance-erp/src/hooks/use-navigate-and-filter.ts`**

Check current implementation. If it uses `useFrontendTool`, switch to `useRenderTool` with useEffect for navigation side effect.

**File: `examples/showcases/deep-agents-finance-erp/src/hooks/use-request-approval.tsx`**

Keep `useHumanInTheLoop` — unchanged. HITL tools use `copilotkit_interrupt()` which has its own mechanism.

### 3. Update shell.tsx imports

**File: `examples/showcases/deep-agents-finance-erp/src/components/layout/shell.tsx`**

No changes needed — the hook function names stay the same, only their internal implementation changes.

### 4. Simplify main.py

**File: `examples/showcases/deep-agents-finance-erp/agent/main.py`**

- Remove `_UI_TOOL_SCHEMAS` generation
- Remove `CopilotKitLangGraphAgent` class
- Use `LangGraphAGUIAgent` directly
- Keep `CopilotKitMiddleware` in agent.py for context injection (useAgentContext)
- Keep `emit_tool_calls=_emit_tool_names` for streaming tool call events
- Add `emit_messages=False`

---

## Key Files

| File | Change |
|------|--------|
| `agent/main.py` | Add emit_messages=False, remove _UI_TOOL_SCHEMAS + custom agent class |
| `src/hooks/use-render-chat-visual.tsx` | useFrontendTool → useRenderTool |
| `src/hooks/use-update-dashboard.ts` → `.tsx` | useFrontendTool → useRenderTool + wrapper component |
| `src/hooks/use-manage-dashboard.ts` → `.tsx` | useFrontendTool → useRenderTool + wrapper component |
| `src/hooks/use-navigate-and-filter.ts` | Check & convert if needed |
| `src/hooks/use-request-approval.tsx` | Unchanged (useHumanInTheLoop) |
| `src/components/layout/shell.tsx` | No changes needed |

---

## Verification

1. Start agent + frontend
2. "What's our cash position?" → cash position card renders and persists (no raw JSON)
3. "Give me a cash flow projection" → inline chart renders
4. "Build me a cost control dashboard" → dashboard widgets update
5. "Pay overdue invoices" → HITL approval card renders
6. Check browser console — no errors, no leaked JSON
7. Verify no raw JSON streams during subagent execution
