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

# Pre-compute tool schemas from UI stubs so CopilotKitMiddleware can identify
# which tool calls should be intercepted and forwarded to the frontend for
# rendering via useFrontendTool.  Normally the frontend forwards these via
# AG-UI RunAgentInput.tools, but when that list is empty this fallback ensures
# the middleware still intercepts them.
#
# NOTE: HITL tools (approve_*) are excluded — they MUST execute on the backend
# because they call copilotkit_interrupt() to pause the graph for approval.
_UI_TOOL_SCHEMAS = []
for _tool in ui_tools:
    schema = _tool.get_input_schema().model_json_schema() if hasattr(_tool, "get_input_schema") else {}
    _UI_TOOL_SCHEMAS.append({
        "name": _tool.name,
        "description": getattr(_tool, "description", ""),
        "parameters": schema,
    })


class CopilotKitLangGraphAgent(LangGraphAGUIAgent):
    """Ensures copilotkit.actions is always populated for middleware interception."""

    def langgraph_default_merge_state(self, state, messages, input):
        merged = super().langgraph_default_merge_state(state, messages, input)

        actions = merged.get("copilotkit", {}).get("actions", [])
        forwarded_count = len(actions)

        # If no frontend tools were forwarded, inject backend stub schemas
        # so CopilotKitMiddleware.after_model can intercept them.
        if not actions:
            logger.info(
                "[CopilotKit] No forwarded frontend tools — injecting %d UI tool schemas",
                len(_UI_TOOL_SCHEMAS),
            )
            merged.setdefault("copilotkit", {})["actions"] = _UI_TOOL_SCHEMAS
        else:
            logger.info(
                "[CopilotKit] %d frontend tools forwarded via AG-UI",
                forwarded_count,
            )

        return merged

app = FastAPI(title="Finance ERP Agent")

agent_graph = build_agent()

# Emit only frontend tool calls — excludes internal tools like "task" (subagent
# delegation) whose raw JSON results would otherwise render in the chat.
_emit_tool_names = [t.name for t in ui_tools] + [t.name for t in hitl_tools]
agui_config = copilotkit_customize_config(
    emit_tool_calls=_emit_tool_names,
)
agui_config["recursion_limit"] = 100

add_langgraph_fastapi_endpoint(
    app=app,
    agent=CopilotKitLangGraphAgent(
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
