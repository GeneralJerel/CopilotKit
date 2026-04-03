"""Finance ERP Agent — FastAPI + CopilotKit AG-UI entry point."""

import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

import logging

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from copilotkit.langgraph import copilotkit_customize_config
from fastapi import FastAPI

from agent import build_agent
from frontend_tools import ui_tools, hitl_tools

logger = logging.getLogger("finance_erp")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Finance ERP Agent")

agent_graph = build_agent()

# Emit only frontend tool calls — excludes internal tools like "task" (subagent
# delegation) whose raw JSON results would otherwise render in the chat.
# Suppress all text messages during streaming to prevent subagent text (raw JSON
# from research/projections subagents) from leaking into the chat. The final
# MessagesSnapshot still includes all orchestrator messages.
_emit_tool_names = [t.name for t in ui_tools] + [t.name for t in hitl_tools]
agui_config = copilotkit_customize_config(
    emit_tool_calls=_emit_tool_names,
    emit_messages=False,
)
agui_config["recursion_limit"] = 100

add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="finance_erp_agent",
        description=(
            "A finance ERP assistant that can analyze invoices, review accounts, "
            "check inventory levels, manage HR data, generate financial reports, "
            "and provide actionable business insights."
        ),
        graph=agent_graph,
        config=agui_config,
    ),
    path="/copilotkit/agents/finance_erp_agent",
)


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8123))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
