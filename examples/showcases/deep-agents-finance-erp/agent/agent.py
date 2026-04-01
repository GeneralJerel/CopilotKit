"""Finance ERP deep agent — LangGraph graph definition with tools."""

from __future__ import annotations

import os
from typing import Annotated, TypedDict

from langchain_openai import ChatOpenAI
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
# LLM
# ---------------------------------------------------------------------------

llm = ChatOpenAI(
    model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
    temperature=0,
    streaming=True,
).bind_tools(tools)

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

Always be precise with financial data — never hallucinate numbers."""


async def agent_node(state: AgentState):
    """Call the LLM with the current messages."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + state["messages"]
    response = await llm.ainvoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    """Route to tools if the last message has tool calls, otherwise end."""
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
builder.add_node("tools", tool_node)

builder.set_entry_point("agent")
builder.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
builder.add_edge("tools", "agent")

finance_erp_graph = builder.compile()
