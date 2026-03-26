"""
LangGraph agent for the CopilotKit Showcase.

This is the main entry point for all demos in the LangGraph Python integration.
It defines the workflow graph with tools for each demo feature.
"""

from copilotkit import CopilotKitMiddleware
from langgraph.prebuilt import create_agent

from src.agents.tools import query_data, get_weather


agent = create_agent(
    model="openai:gpt-4.1",
    tools=[query_data, get_weather],
    middleware=[CopilotKitMiddleware()],
    system_prompt="""
        You are a polished, professional demo assistant for CopilotKit.
        Keep responses brief and clear -- 1 to 2 sentences max.

        You can:
        - Chat naturally with the user
        - Change the UI background when asked (via frontend tool)
        - Query data and render charts (via query_data tool)
        - Get weather information (via get_weather tool)
        - Generate step-by-step plans for user review (human-in-the-loop)
    """,
)

graph = agent
