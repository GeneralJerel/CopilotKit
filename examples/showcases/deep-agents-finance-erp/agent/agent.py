"""Finance ERP deep agent — LangGraph graph definition with tools."""

from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()
from typing import Annotated, TypedDict

from langchain_core.messages import AIMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from tools import (
    query_invoices,
    query_accounts,
    query_transactions,
    query_inventory,
    query_employees,
    generate_financial_report,
    analyze_cash_flow,
    forecast_revenue,
)

# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    copilotkit: dict


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

tools = [
    query_invoices,
    query_accounts,
    query_transactions,
    query_inventory,
    query_employees,
    generate_financial_report,
    analyze_cash_flow,
    forecast_revenue,
]

# ---------------------------------------------------------------------------
# LLM — unbound at module level; tools are bound dynamically per-call
# so that frontend tools from CopilotKit are included.
# ---------------------------------------------------------------------------

llm = ChatOpenAI(
    model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
    temperature=0,
    streaming=True,
)

# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are FinanceOS AI — an expert finance ERP assistant.

You have access to the company's full ERP system including:
- Invoices (billing, payments, overdue tracking)
- Chart of accounts (assets, liabilities, equity, revenue, expenses)
- Transaction ledger (all financial movements)
- Inventory management (stock levels, SKUs, reorder alerts)
- Human resources (employees, departments, payroll)

When answering questions:
1. Use the appropriate tool to fetch real data before responding.
2. Present numbers clearly with currency formatting.
3. Highlight risks (overdue invoices, low stock, budget overruns).
4. Provide actionable recommendations when appropriate.
5. For reports, structure them with clear sections and summaries.

You also have access to frontend tools that control the UI directly:
- navigate_and_filter: Navigate to any ERP page and apply filters. Use this when the user asks to "show me", "go to", or "pull up" specific data.
- render_chart: Render interactive charts inline in the chat. Use this for visualizations, projections, and trend analysis. Pick the best chart type (area for trends, bar for comparisons, line for trajectories).
- render_cash_position: Render a cash position summary card showing cash accounts, liabilities, and net position. Use this when the user asks about their cash position, liquidity, or cash vs liabilities.
- approve_invoice_payment: Present invoices for payment approval. ALWAYS use this before processing any payment — never mark invoices as paid without explicit user approval.
- approve_inventory_reorder: Present a purchase order for review. ALWAYS use this before placing any reorder — never reorder inventory without explicit user approval.

Important: For actions that modify data (payments, reorders), you MUST use the approval tools and wait for user confirmation. Never take financial actions autonomously.

Always be precise with financial data — never hallucinate numbers."""


async def agent_node(state: AgentState):
    """Call the LLM with backend + frontend tools bound dynamically."""
    # Convert AG-UI frontend tool dicts to OpenAI function-calling format
    frontend_actions = state.get("copilotkit", {}).get("actions", [])
    frontend_tool_defs = []
    for action in frontend_actions:
        name = action.get("name") or action.get("function", {}).get("name")
        desc = action.get("description") or action.get("function", {}).get("description", "")
        params = action.get("parameters") or action.get("function", {}).get("parameters", {})
        if name:
            frontend_tool_defs.append({
                "type": "function",
                "function": {
                    "name": name,
                    "description": desc,
                    "parameters": params,
                },
            })

    bound_llm = llm.bind_tools(list(tools) + frontend_tool_defs)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + state["messages"]
    response = await bound_llm.ainvoke(messages)
    return {"messages": [response]}


def filter_frontend_tools(state: AgentState):
    """Strip frontend tool calls from the AIMessage before ToolNode.

    Frontend tool calls are already streamed to the client via
    on_chat_model_stream events. ToolNode only knows about backend tools
    and would crash on unknown frontend tools.
    """
    frontend_actions = state.get("copilotkit", {}).get("actions", [])
    if not frontend_actions:
        return state

    frontend_names = set()
    for action in frontend_actions:
        name = action.get("name") or action.get("function", {}).get("name")
        if name:
            frontend_names.add(name)

    last = state["messages"][-1]
    tool_calls = getattr(last, "tool_calls", []) or []
    if not tool_calls:
        return state

    backend_calls = [tc for tc in tool_calls if tc["name"] not in frontend_names]

    if len(backend_calls) == len(tool_calls):
        return state  # No frontend calls to strip

    updated = AIMessage(content=last.content, tool_calls=backend_calls, id=last.id)
    return {"messages": [*state["messages"][:-1], updated]}


def should_continue(state: AgentState) -> str:
    """Route to tools if backend tool calls remain, otherwise end."""
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END


tool_node = ToolNode(tools)

# ---------------------------------------------------------------------------
# Graph
# ---------------------------------------------------------------------------

builder = StateGraph(AgentState)
builder.add_node("agent", agent_node)
builder.add_node("filter", filter_frontend_tools)
builder.add_node("tools", tool_node)

builder.set_entry_point("agent")
builder.add_edge("agent", "filter")
builder.add_conditional_edges("filter", should_continue, {"tools": "tools", END: END})
builder.add_edge("tools", "agent")

# LangGraph Cloud injects its own checkpointer; use MemorySaver only for local dev
_checkpointer = None if os.environ.get("LANGGRAPH_CLOUD") else MemorySaver()
finance_erp_graph = builder.compile(checkpointer=_checkpointer)
