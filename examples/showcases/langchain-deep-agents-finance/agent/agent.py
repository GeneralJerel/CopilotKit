import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver
from copilotkit import CopilotKitMiddleware

from tools.market_data import fetch_market_data
from tools.risk_calculator import compute_risk_metrics
from tools.scenario_engine import run_scenario_simulation
from tools.correlation import compute_correlations
from subagents.portfolio_parser import PARSER_CONFIG
from subagents.risk_analyst import RISK_ANALYST_CONFIG
from subagents.scenario_analyst import SCENARIO_ANALYST_CONFIG
from subagents.memo_writer import MEMO_WRITER_CONFIG
from prompts.system import MAIN_SYSTEM_PROMPT

load_dotenv()


def build_agent():
    """Build the FinSight Deep Agent graph with subagents and middleware."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY")

    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
        temperature=0.3,
        api_key=api_key,
    )

    tools = [
        fetch_market_data,
        compute_risk_metrics,
        run_scenario_simulation,
        compute_correlations,
    ]

    subagents = [
        PARSER_CONFIG,
        RISK_ANALYST_CONFIG,
        SCENARIO_ANALYST_CONFIG,
        MEMO_WRITER_CONFIG,
    ]

    agent_graph = create_deep_agent(
        model=llm,
        system_prompt=MAIN_SYSTEM_PROMPT,
        tools=tools,
        subagents=subagents,
        middleware=[CopilotKitMiddleware()],
        checkpointer=MemorySaver(),
    )

    print("[AGENT] FinSight Deep Agent graph created with 4 subagents")
    return agent_graph.with_config({"recursion_limit": 100})
