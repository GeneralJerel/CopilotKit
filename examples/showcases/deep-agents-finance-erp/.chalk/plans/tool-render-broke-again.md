# Fix: render_invoices not called + raw JSON leaking during streaming

## Context

The finance ERP showcase has two bugs when the user asks "Show me all overdue invoices":

1. **Wrong tool called**: The agent calls `navigate_and_filter(page="invoices", filter="overdue")` instead of `render_invoices(statuses=["overdue"])`. The routing rules in the prompt treat ALL "show me" requests as navigation, but "show me overdue invoices" is a data display request that should render a dashboard widget.

2. **Raw JSON during streaming**: The `task` tool's result JSON (research subagent output) flashes on screen during streaming, then disappears on completion. The `emit_tool_calls` filter in the SDK doesn't catch subgraph events because their `raw_event` metadata lacks the `copilotkit:emit-tool-calls` key, and the code doesn't fall back to `self.config` when `raw_event` exists but is missing the key.

## Changes

### 1. Fix routing rules in orchestrator prompt

**File**: `examples/showcases/deep-agents-finance-erp/agent/prompts.py`

**a) Update `navigate_and_filter` description (lines 29-31)**

Replace:
```
- **navigate_and_filter** — Navigate to an ERP page and optionally apply filters.
  Use when: user says "show me", "go to", "pull up", or needs to see a filtered view.
  Pages: dashboard, invoices, accounts, inventory, hr.
```

With:
```
- **navigate_and_filter** — Navigate to an ERP page and optionally apply filters.
  Use when: user says "go to", "open", "pull up", or explicitly asks to navigate to a page.
  Do NOT use for data display requests — use render_* dashboard tools instead.
  Pages: dashboard, invoices, accounts, inventory, hr.
```

**b) Split the "Show me" routing rule (line 69)**

Replace:
```
| "Show me" / "go to" / navigation | research (get data) → call navigate_and_filter |
```

With two rules:
```
| "Go to" / "open" / "pull up" + page name | call navigate_and_filter (no research needed) |
| "Show me" + data (invoices, transactions, expenses, KPIs) | research (get data) → call appropriate render_* / dashboard tool |
```

### 2. Fix metadata fallback in `_dispatch_event`

**File**: `sdk-python/copilotkit/langgraph_agui_agent.py` (lines 165-173)

Current code reads metadata from `raw_event` when present, falls back to `self.config` only when `raw_event` is absent. Subgraph events have `raw_event` (truthy) but its metadata lacks `copilotkit:emit-tool-calls`.

Replace lines 165-173:
```python
raw_event = getattr(event, 'raw_event', None)
if raw_event:
    metadata = (raw_event.get('metadata', {}) if isinstance(raw_event, dict)
                else getattr(raw_event, 'metadata', {})) or {}
else:
    metadata = (self.config or {}).get("metadata", {}) or {}
```

With:
```python
raw_event = getattr(event, 'raw_event', None)
if raw_event:
    metadata = (raw_event.get('metadata', {}) if isinstance(raw_event, dict)
                else getattr(raw_event, 'metadata', {})) or {}
else:
    metadata = {}

# Fall back to agent-level config for copilotkit filter keys that may
# not propagate into subgraph raw_event metadata.
config_metadata = (self.config or {}).get("metadata", {}) or {}
for key in ("copilotkit:emit-tool-calls", "copilotkit:emit-messages"):
    if key not in metadata and key in config_metadata:
        metadata[key] = config_metadata[key]
```

### 3. Add test for metadata fallback

**File**: `sdk-python/tests/test_emit_filtering.py`

Add a test class verifying that when `raw_event` metadata lacks the copilotkit filter key, the agent config is consulted as fallback. Three cases:
- Subgraph event for excluded tool (`task`) → filtered out
- Subgraph event for allowed tool (`render_chart`) → passes through
- `raw_event` metadata explicitly sets the key → takes precedence over config

## Critical files

| File | Change |
|------|--------|
| `examples/showcases/deep-agents-finance-erp/agent/prompts.py` | Fix routing rules + navigate_and_filter description |
| `sdk-python/copilotkit/langgraph_agui_agent.py` | Add config metadata fallback for subgraph events |
| `sdk-python/tests/test_emit_filtering.py` | Add subgraph metadata fallback tests |

## Verification

1. Start agent + frontend
2. Ask "Show me all overdue invoices" → should call `render_invoices(statuses=["overdue"])`, NOT `navigate_and_filter`
3. No raw JSON visible during streaming — "Researching..." animation only
4. Ask "Go to invoices" → should still call `navigate_and_filter(page="invoices")`
5. Run tests: `cd sdk-python && python -m pytest tests/test_emit_filtering.py -v`
