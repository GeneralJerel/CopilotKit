"""Finance ERP Agent — FastAPI + CopilotKit AG-UI entry point."""

import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from copilotkit.langgraph import copilotkit_customize_config
from fastapi import FastAPI

from agent import build_agent

app = FastAPI(title="Finance ERP Agent")

agent_graph = build_agent()

# Emit all tool calls (backend + frontend) so the frontend can render them
agui_config = copilotkit_customize_config(
    emit_tool_calls=True,
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
