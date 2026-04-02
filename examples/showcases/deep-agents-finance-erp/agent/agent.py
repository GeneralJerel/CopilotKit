"""Finance ERP multi-agent — orchestrator with research & design subagents."""

from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()

from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver
from copilotkit import CopilotKitMiddleware

from tools import research_tools, projections_tools
from prompts import (
    ORCHESTRATOR_PROMPT,
    RESEARCH_AGENT_PROMPT,
    DESIGN_AGENT_PROMPT,
    PROJECTIONS_AGENT_PROMPT,
)

# ---------------------------------------------------------------------------
# Subagent definitions
# ---------------------------------------------------------------------------

research_subagent = {
    "name": "research",
    "description": (
        "Finance research specialist. Queries the ERP database for invoices, "
        "accounts, transactions, inventory, and employees. Generates financial "
        "reports, analyzes cash flow, and forecasts revenue. Use whenever you "
        "need data."
    ),
    "system_prompt": RESEARCH_AGENT_PROMPT,
    "tools": research_tools,
}

projections_subagent = {
    "name": "projections",
    "description": (
        "Financial projections specialist. Analyzes historical trends, "
        "computes growth rates, generates revenue/cash flow/profitability "
        "forecasts, and runs what-if scenarios. Use when the user asks about "
        "future projections, forecasts, trends, or scenario analysis."
    ),
    "system_prompt": PROJECTIONS_AGENT_PROMPT,
    "tools": projections_tools,
}

design_subagent = {
    "name": "design",
    "description": (
        "UI design specialist. Renders frontend components: page navigation, "
        "charts, cash position cards, and approval dialogs. Use when the user "
        "wants to SEE something or when human approval is required for "
        "financial actions. Always provide the data it needs to render."
    ),
    "system_prompt": DESIGN_AGENT_PROMPT,
    "tools": [],  # frontend tools injected at runtime by CopilotKitMiddleware
    "middleware": [CopilotKitMiddleware()],
}

# ---------------------------------------------------------------------------
# Agent builder
# ---------------------------------------------------------------------------


def build_agent():
    """Build the Finance ERP orchestrator with research & design subagents."""
    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
        temperature=0,
        streaming=True,
    )

    checkpointer = None if os.environ.get("LANGGRAPH_CLOUD") else MemorySaver()

    agent = create_deep_agent(
        model=llm,
        tools=[],  # orchestrator delegates via task() — no direct tools
        system_prompt=ORCHESTRATOR_PROMPT,
        subagents=[research_subagent, projections_subagent, design_subagent],
        middleware=[CopilotKitMiddleware()],
        checkpointer=checkpointer,
    )

    return agent
