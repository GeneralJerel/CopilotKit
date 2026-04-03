# Metadata key mismatch between base agent and SDK consumer

**Component:** Python SDK — metadata handling in `_dispatch_event`
**Severity:** Medium
**Status:** Fixed in commit `64d360e`

## Problem

Two related metadata issues caused tool call events from subgraphs to bypass filtering:

1. **Key naming mismatch:** The base agent sets metadata as `copilotkit:emit-tool-calls` but the SDK dispatcher was reading `emit-tool-calls` (without the `copilotkit:` prefix). Events with the prefixed key were not matched.

2. **Subgraph events lack parent metadata:** When a subagent (e.g., research or design agent) emits tool call events, these events are wrapped in a `raw_event` structure. The parent graph's metadata (including `copilotkit:emit-tool-calls`) is not propagated to the subgraph event's metadata. The SDK must fall back to `self.config` to get the filtering rules.

## Impact

Internal tool calls from subagents (especially the `task` tool used by deepagents) would stream their JSON payloads into the chat because the filtering logic couldn't find the metadata key to determine whether to suppress them.

## Fix applied

- Added fallback: if event-level metadata doesn't contain the key, check `self.config` metadata.
- Normalized key lookup to handle both prefixed and unprefixed forms.

## What engineering should investigate

1. Standardize metadata key naming — either always use the `copilotkit:` prefix or never. Document the convention.
2. Consider propagating parent graph metadata to subgraph events in LangGraph's event stream, so consumers don't need fallback logic.
3. Add SDK-level tests that verify metadata resolution for subgraph events specifically.

## Lesson learned

When metadata flows through multiple layers (config -> graph -> subgraph -> event), test at each boundary. A key that works at the top level may be absent or renamed by the time it reaches the consumer. Namespaced keys (`copilotkit:*`) are good practice but only if every reader agrees on the namespace.
