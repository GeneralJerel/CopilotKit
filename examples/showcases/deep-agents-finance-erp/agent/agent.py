"""Finance ERP deep agent — built with create_deep_agent + CopilotKit middleware."""

from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()

from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver
from copilotkit import CopilotKitMiddleware

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
# System prompt
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
- render_cash_position: Render a cash position summary card showing cash accounts, liabilities, and net position. You MUST call this tool whenever the user asks about cash position, liquidity, or cash vs liabilities — always render the card instead of describing numbers in text.
- approve_invoice_payment: Present invoices for payment approval. ALWAYS use this before processing any payment — never mark invoices as paid without explicit user approval.
- approve_inventory_reorder: Present a purchase order for review. ALWAYS use this before placing any reorder — never reorder inventory without explicit user approval.

Important: For actions that modify data (payments, reorders), you MUST use the approval tools and wait for user confirmation. Never take financial actions autonomously.

Always be precise with financial data — never hallucinate numbers."""

# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

erp_tools = [
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
# Agent
# ---------------------------------------------------------------------------


def build_agent():
    """Build the Finance ERP agent with CopilotKit integration."""
    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
        temperature=0,
        streaming=True,
    )

    checkpointer = None if os.environ.get("LANGGRAPH_CLOUD") else MemorySaver()

    agent = create_deep_agent(
        model=llm,
        tools=erp_tools,
        system_prompt=SYSTEM_PROMPT,
        middleware=[CopilotKitMiddleware()],
        checkpointer=checkpointer,
    )

    return agent
