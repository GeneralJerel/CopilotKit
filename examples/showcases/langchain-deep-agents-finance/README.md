# FinSight — AI-Powered Portfolio Risk Analyst

A financial advisory copilot that demonstrates CopilotKit's `useFrontendTool` generative UI pattern integrated with LangChain Deep Agents. Upload a portfolio, and an AI agent plans multi-step analysis, delegates to specialized subagents, and renders rich interactive visualizations inline in a chat interface.

## Features

- **5 `useFrontendTool` components**: Portfolio Heatmap, Risk Gauge, Scenario Cards, Correlation Matrix, Investment Memo
- **4 Deep Agent subagents**: Portfolio Parser, Risk Analyst, Scenario Analyst, Memo Writer
- **LangGraph human-in-the-loop**: Memo approval workflow with revision feedback loop
- **SQLite + Prisma**: Zero-config persistence for portfolios and analysis runs
- **LangSmith tracing**: Automatic tracing with smoke-test evaluations
- **Luxury minimal UI**: Cream and slate palette, serif headings, subtle gold accents

## Quick Start

### Frontend

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed    # Load demo portfolios
npm run dev            # http://localhost:3000
```

### Agent (separate terminal)

```bash
cd agent
pip install -e ".[dev]"
cp .env.example .env   # Add your OPENAI_API_KEY
uvicorn main:app --port 8123 --reload
```

### Or use Make

```bash
make install
make seed
make dev     # Frontend (terminal 1)
make agent   # Agent (terminal 2)
```

## Environment Variables

### Frontend (`.env.local`)
```
LANGGRAPH_DEPLOYMENT_URL=http://localhost:8123
DATABASE_URL=file:./prisma/dev.db
```

### Agent (`agent/.env`)
```
OPENAI_API_KEY=sk-...
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=finsight-demo
```

## Architecture

```
Browser → Next.js API Route → CopilotRuntime → FastAPI (Python)
                                                  └── Deep Agent
                                                       ├── Portfolio Parser
                                                       ├── Risk Analyst
                                                       ├── Scenario Analyst
                                                       └── Memo Writer
```

## Running Evals

```bash
cd agent
python -m pytest evals/ -v
```
