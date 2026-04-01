# Deep Agents Finance ERP — Demo Requirements

## Overview

A production-grade Finance ERP showcase demonstrating CopilotKit deep agents with LangGraph, LangSmith observability, and a Postgres-backed data layer.

---

## Architecture

```
┌─────────────────┐     AG-UI / SSE      ┌──────────────────┐     SQL      ┌────────────┐
│   Next.js 16    │ ──────────────────▶   │  LangGraph Agent │ ──────────▶  │  Postgres  │
│   (Frontend)    │ ◀──────────────────   │  (Python/FastAPI) │ ◀──────────  │   16       │
└─────────────────┘                       └──────────────────┘              └────────────┘
                                                  │
                                                  │ traces
                                                  ▼
                                          ┌──────────────────┐
                                          │    LangSmith     │
                                          │   (Observability) │
                                          └──────────────────┘
```

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1 (App Router)
- **UI:** Tailwind CSS v4, custom dark theme, Recharts for data viz
- **CopilotKit:** `@copilotkit/react-core`, `@copilotkit/react-ui` v1.51.0
- **Chat UI:** CopilotSidebar with finance-specific system prompt

### Backend Agent
- **Runtime:** Python 3.11+, FastAPI + Uvicorn
- **LLM Framework:** LangChain + LangGraph (deep agent pattern)
- **Model:** GPT-4o (configurable via `OPENAI_MODEL` env var)
- **Protocol:** AG-UI (Agent-UI protocol) over SSE

### Data Layer
- **Database:** PostgreSQL 16 (via Docker Compose)
- **ORM:** SQLAlchemy 2.0
- **Seed Data:** `agent/seed.sql` — auto-loaded on container start

### Observability & Evaluation
- **Tracing:** LangSmith (all agent calls traced automatically)
- **Evals:** LangSmith evaluation suite in `agent/evals/`
- **Cloud Deployment:** LangGraph Cloud via `langgraph.json`

---

## ERP Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/` | KPI cards, revenue/expense charts, recent transactions, outstanding invoices |
| Invoices | `/invoices` | Full invoice list with filtering, summary cards (outstanding, collected, overdue) |
| Accounts | `/accounts` | Chart of accounts, transaction ledger, balance summary |
| Inventory | `/inventory` | Stock management, reorder alerts, SKU tracking |
| HR | `/hr` | Employee directory cards, department breakdown, payroll overview |

---

## Agent Tools

| Tool | Description |
|------|-------------|
| `query_invoices` | Query invoices, filter by status |
| `query_accounts` | Query chart of accounts, filter by type |
| `query_transactions` | Query recent ledger transactions |
| `query_inventory` | Query inventory items, filter by stock status |
| `query_employees` | Query employee directory, filter by department |
| `generate_financial_report` | Generate balance sheet, income statement, cash flow, or summary report |
| `analyze_cash_flow` | Analyze cash flow trends over N months |
| `forecast_revenue` | Project revenue for upcoming quarters |

---

## Setup Instructions

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Configure Environment

```bash
cd agent
cp .env.example .env
# Edit .env with your API keys
```

Required environment variables:
- `OPENAI_API_KEY` — OpenAI API key for GPT-4o
- `LANGCHAIN_API_KEY` — LangSmith API key for tracing
- `LANGCHAIN_PROJECT` — LangSmith project name (default: `finance-erp-agent`)
- `DATABASE_URL` — Postgres connection string (default: `postgresql://erp_user:erp_password@localhost:5432/finance_erp`)

### 3. Start the Agent

```bash
cd agent
pip install -e .
python main.py
```

Or with LangGraph CLI:
```bash
langgraph dev
```

### 4. Start the Frontend

```bash
npm install
npm run dev
```

### 5. Deploy to LangGraph Cloud

```bash
cd agent
langgraph deploy
```

Update `LANGGRAPH_DEPLOYMENT_URL` in the frontend `.env.local` to point to the cloud deployment URL.

---

## LangSmith Evals

### Create evaluation dataset
```bash
cd agent
python -m evals.test_agent --create-dataset
```

### Run evaluations
```bash
python -m evals.test_agent
```

Evaluations test:
- **Correctness:** Does the agent return accurate financial data?
- **Helpfulness:** Are responses actionable and well-structured?
- **Tool selection:** Does the agent pick the right tool for each query?

---

## Demo Script

1. **Dashboard Overview** — Show the KPI cards, revenue chart, and expense breakdown
2. **AI Chat — Financial Query** — Ask "What's our current cash position?" (triggers `query_accounts`)
3. **AI Chat — Overdue Invoices** — Ask "Show me overdue invoices" (triggers `query_invoices`)
4. **AI Chat — Report Generation** — Ask "Generate a balance sheet" (triggers `generate_financial_report`)
5. **AI Chat — Forecasting** — Ask "Forecast revenue for next 4 quarters" (triggers `forecast_revenue`)
6. **AI Chat — Cross-module** — Ask "We need to hire 2 engineers — what's the budget impact?" (uses `query_employees` + `analyze_cash_flow`)
7. **Navigate to Inventory** — Show low-stock alerts, ask AI "Which items need reordering?"
8. **LangSmith Dashboard** — Show traces, latency, token usage, and eval results

---

## Acceptance Criteria

- [ ] All 5 ERP modules render correctly with mock data
- [ ] CopilotKit sidebar opens and connects to the LangGraph agent
- [ ] Agent correctly routes queries to appropriate tools
- [ ] LangSmith traces appear for all agent interactions
- [ ] Postgres database seeds correctly via docker-compose
- [ ] Revenue chart renders with Recharts (area chart)
- [ ] Expense breakdown shows animated progress bars
- [ ] Dark theme is consistent across all pages
- [ ] Status badges show correct colors (green/amber/red)
- [ ] Navigation sidebar highlights active route
- [ ] LangSmith evals pass with >80% correctness score
