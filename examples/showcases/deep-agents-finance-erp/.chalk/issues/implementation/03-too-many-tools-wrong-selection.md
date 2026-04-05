# Agent selects wrong tools when too many are visible

**Component:** Agent behavior (LLM + prompt design)
**Severity:** Medium
**Status:** Mitigated by consolidation in commit `0ff40e0`

## Problem

With 14 frontend tools + 20+ built-in LangGraph tools visible to the orchestrator, the LLM frequently:
- Called the wrong tool (e.g., `navigate_and_filter` instead of `render_invoices` for "show me overdue invoices")
- Skipped frontend tools entirely and responded with plain text
- Called a generic tool when a specific one existed

The routing rules in the orchestrator prompt tried to disambiguate, but with 14 similar-sounding tool names the LLM couldn't reliably distinguish between them.

## Evidence

- [tool-render-broke-again.md](../plans/tool-render-broke-again.md): "show me overdue invoices" routed to `navigate_and_filter` instead of `render_invoices`.
- [redesign-and-consolidation.md](../plans/redesign-and-consolidation.md): identified 14 tools as the root cause of unreliable selection.
- Multiple commits attempted prompt-level fixes (stronger routing rules, mandatory tool calls) before consolidation was chosen.

## Fix applied

Consolidated 14 frontend tools into 5 broader tools with clear, non-overlapping responsibilities. This reduced cognitive load on the LLM and eliminated ambiguous routing decisions.

## What engineering should investigate

1. Is there a recommended upper bound on frontend tools per agent? Document it as a best practice.
2. Could the runtime or middleware provide tool-selection hints (e.g., scoring, pre-filtering based on user intent) to reduce the burden on prompt engineering?
3. Consider whether "skills" (lazy-loaded prompt sections) could be a first-class CopilotKit concept to keep tool counts low while preserving capability.

## Lesson learned

More tools != more capability. Each additional tool increases the chance of mis-selection, especially when names are semantically close. Design tools around user intents (render, navigate, approve) not data entities (invoices, expenses, cash). Consolidate early — retrofitting is painful.
