# Deep Agents Finance ERP

A finance ERP showcase powered by CopilotKit deep agents. An AI assistant can analyze invoices, review accounts, check inventory, manage HR data, generate financial reports, and provide actionable business insights.

**Stack:** Next.js (frontend) + FastAPI / LangGraph (agent) + Postgres (data) + CopilotKit (AI layer)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for Postgres)
- Python 3.11+
- Node.js 18+
- An OpenAI API key

## Quick start

```bash
make dev
```

This single command starts Postgres, seeds the database, launches the agent, and runs the frontend. Open [http://localhost:3000](http://localhost:3000).

## Step-by-step setup

### 1. Postgres

```bash
make db       # start the container
make db-seed  # create tables and insert seed data
```

### 2. Agent (Python)

Copy the example env and add your OpenAI key:

```bash
cp agent/.env.example agent/.env
# edit agent/.env — set OPENAI_API_KEY
```

Then start the agent:

```bash
make agent    # installs deps in a venv, starts FastAPI on port 8123
```

### 3. Frontend (Next.js)

```bash
make frontend   # creates .env.local (if missing), starts Next.js on port 3000
```

## Environment variables

### `agent/.env`

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (required) |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o`) |
| `DATABASE_URL` | Postgres connection string (default: `postgresql://erp_user:erp_password@localhost:5432/finance_erp`) |
| `LANGCHAIN_API_KEY` | LangSmith key for tracing (optional) |

### `.env.local`

| Variable | Description |
|---|---|
| `REMOTE_ACTION_URL` | Agent URL (default: `http://localhost:8123/copilotkit/agents/finance_erp_agent`) |

## Makefile targets

| Target | Description |
|---|---|
| `make dev` | Start everything (Postgres + seed + agent + frontend) |
| `make db` | Start Postgres container |
| `make db-seed` | Start Postgres and seed tables |
| `make agent` | Install Python deps and start the agent (port 8123) |
| `make frontend` | Start Next.js dev server (port 3000) |
| `make stop` | Stop all running services |
| `make clean` | Stop services, remove container and Python venv |

## Architecture

```
Browser (:3000)
  |
  |  Next.js API route (/api/copilotkit)
  |       |
  |       v
  |  CopilotKit Runtime (LangGraphHttpAgent)
  |       |  AG-UI / SSE
  |       v
  |  FastAPI (:8123)
  |       |
  |       v
  |  LangGraph Orchestrator
  |      /         \
  |     v           v
  |  Research    Projections
  |  Sub-agent   Sub-agent
  |     |
  |     v
  |  Postgres (:5432)
  |
```
