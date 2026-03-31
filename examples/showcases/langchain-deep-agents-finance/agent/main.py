import os
from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from agent import build_agent

load_dotenv()

app = FastAPI(
    title="FinSight Portfolio Analyst",
    description="AI-powered portfolio risk analysis with Deep Agents",
    version="1.0.0",
)

try:
    agent_graph = build_agent()
    add_langgraph_fastapi_endpoint(
        app=app,
        agent=LangGraphAGUIAgent(
            name="finsight_analyst",
            description="Portfolio risk analyst with multi-step analysis pipeline",
            graph=agent_graph,
        ),
        path="/",
    )
    print("[MAIN] FinSight agent registered")
except Exception as e:
    print(f"[ERROR] Failed to build agent: {str(e)}")
    raise


@app.get("/healthz")
async def health_check():
    return {
        "status": "healthy",
        "service": "finsight-analyst",
        "version": "1.0.0",
    }


def main():
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", 8123))
    uvicorn.run("main:app", host=host, port=port, reload=True, log_level="info")


if __name__ == "__main__":
    main()
