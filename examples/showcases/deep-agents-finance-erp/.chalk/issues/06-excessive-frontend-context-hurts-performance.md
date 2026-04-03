# Excessive frontend context floods agent with redundant data

**Component:** Frontend — `useAgentContext()` usage pattern
**Severity:** Low
**Status:** Fixed in commit `c9d7ad3`

## Problem

The showcase initially registered 10+ `useAgentContext()` calls that duplicated data already available to the agent through its backend tools (invoices, expenses, transactions, etc.). This:
- Bloated the system prompt with thousands of tokens of raw data
- Increased latency and token cost on every agent turn
- Provided no additional capability since the agent could query the same data via tools
- May have contributed to tool selection confusion (the agent had the data in context, so it sometimes responded with text instead of calling a rendering tool)

## Fix applied

Removed bulk `useAgentContext()` calls. Kept only lightweight context: KPI summary and dashboard layout configuration — things the agent needs to understand current UI state but can't query via tools.

## What engineering should investigate

1. Document a best practice: "Use `useAgentContext()` for UI state the agent can't query. Use tools for queryable data."
2. Consider adding a warning or size limit when context exceeds a threshold (e.g., >2000 tokens).
3. The showcase is a reference implementation — if we got this wrong, users will too.

## Lesson learned

Context sharing and tool access are two ways to give the agent information. They're not interchangeable. Context is for ambient state (what page is the user on, what's the current layout). Tools are for data retrieval. Duplicating data in both channels wastes tokens and confuses the agent about whether to use what it already "knows" or call a tool to render it.
