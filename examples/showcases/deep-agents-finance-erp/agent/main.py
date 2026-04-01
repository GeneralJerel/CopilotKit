"""Finance ERP Agent — FastAPI + CopilotKit AG-UI entry point."""

import os
import uvicorn
from dotenv import load_dotenv
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitRemoteEndpoint
from fastapi import FastAPI

from agent import finance_erp_graph

load_dotenv()

app = FastAPI(title="Finance ERP Agent")

# CopilotKit remote endpoint wiring
sdk = CopilotKitRemoteEndpoint(
    agents=[
        {
            "name": "finance_erp_agent",
            "graph": finance_erp_graph,
            "description": (
                "A finance ERP assistant that can analyze invoices, review accounts, "
                "check inventory levels, manage HR data, generate financial reports, "
                "and provide actionable business insights."
            ),
        }
    ],
)

add_fastapi_endpoint(app, sdk, "/copilotkit")


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8123))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
