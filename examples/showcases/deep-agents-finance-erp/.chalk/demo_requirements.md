# Deep Agents Finance ERP — Demo Requirements

## Overview

A production-grade Finance ERP showcase demonstrating CopilotKit x LangChain deep agents with LangGraph, LangSmith observability, and a multi-agent architecture with human-in-the-loop approval workflows.

---

## Architecture

```
┌─────────────────┐     AG-UI / SSE      ┌──────────────────────────────────┐
│   Next.js 16    │ ──────────────────▶   │  LangGraph Multi-Agent (FastAPI) │
│   (Frontend)    │ ◀──────────────────   │                                  │
└─────────────────┘                       │  Orchestrator                    │
                                          │    ├─ Research Subagent (13 tools)│
                                          │    └─ Projections Subagent (6)   │
                                          │  + 5 Frontend Tools              │
                                          └──────────────────────────────────┘
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
- **CopilotKit:** `@copilotkit/react-core` v1.54.1
- **Chat UI:** CopilotSidebar with finance-specific system prompt

### Backend Agent
- **Runtime:** Python 3.11+, FastAPI + Uvicorn
- **LLM Framework:** LangChain + LangGraph (deep agent pattern via `create_deep_agent`)
- **Model:** GPT-5.4 (configurable via `OPENAI_MODEL` env var)
- **Protocol:** AG-UI (Agent-UI protocol) over SSE

### Data Layer
- **In-memory mock data** in `agent/tools.py` (backend) and `src/lib/data.ts` (frontend)
- Mirrored seed data: 9 invoices, 12 accounts, 15 transactions, 8 inventory items, 11 employees, 8 quarters of financials

### Observability & Evaluation
- **Tracing:** LangSmith (all agent calls traced automatically)
- **Evals:** LangSmith evaluation suite in `agent/evals/`
- **Cloud Deployment:** LangGraph Cloud via `langgraph.json`

---

## ERP Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/` | KPI cards, revenue/expense charts, recent transactions, outstanding invoices — agent can compose themed dashboards |
| Invoices | `/invoices` | Full invoice list with filtering, summary cards (outstanding, collected, overdue) |
| Accounts | `/accounts` | Chart of accounts, transaction ledger, balance summary |
| Inventory | `/inventory` | Stock management, reorder alerts, SKU tracking |
| HR | `/hr` | Employee directory cards, department breakdown, payroll overview |

---

## Agent Architecture

### Orchestrator (5 frontend tools + `task` for subagent dispatch)

The orchestrator routes user intent to subagents for data, then calls frontend tools to render UI.

### Research Subagent (13 tools)

| Tool | Description |
|------|-------------|
| `query_invoices` | Query invoices, filter by status |
| `query_accounts` | Query chart of accounts, filter by type |
| `query_transactions` | Query recent ledger transactions |
| `query_inventory` | Query inventory items, filter by stock status |
| `query_employees` | Query employee directory, filter by department |
| `query_quarterly_financials` | Quarterly revenue/expenses/profit history (JSON) |
| `query_cash_flow_components` | Quarterly cash flow by component (JSON) |
| `query_budget_vs_actual` | Current quarter budget vs actual by category |
| `query_ar_aging` | Accounts receivable aging breakdown |
| `query_monthly_expenses` | Monthly expense breakdown by category |
| `generate_financial_report` | Generate balance sheet, income statement, cash flow, or summary report |
| `analyze_cash_flow` | Analyze cash flow trends over N months |
| `forecast_revenue` | Project revenue for upcoming quarters |

### Projections Subagent (6 tools)

| Tool | Description |
|------|-------------|
| `compute_revenue_forecast` | Revenue projections (linear or seasonal method) |
| `compute_cash_flow_forecast` | Cash flow projections by component |
| `run_scenario_analysis` | Best/base/worst case scenarios |
| `compute_trend_analysis` | QoQ growth, YoY comparisons, trend direction |
| `query_quarterly_financials` | Historical quarterly data (shared) |
| `query_cash_flow_components` | Historical cash flow data (shared) |

### Frontend Tools (5 consolidated, called directly by orchestrator)

| Tool | Description |
|------|-------------|
| `render_chat_visual` | Inline chart (area/bar/line) or cash position card in chat |
| `navigate_and_filter` | SPA navigation to any ERP page with optional filter |
| `request_approval` | Human-in-the-loop approval for invoice payments or inventory reorders |
| `update_dashboard` | Batch add/update dashboard widgets |
| `manage_dashboard` | Reset, remove, or reorder dashboard layout |

---

## Setup Instructions

### 1. Configure Environment

```bash
cd agent
cp .env.example .env
# Edit .env with your API keys
```

Required environment variables:
- `OPENAI_API_KEY` — OpenAI API key
- `OPENAI_MODEL` — Model name (default: `gpt-5.4-2026-03-05`)
- `LANGCHAIN_API_KEY` — LangSmith API key for tracing (optional)
- `LANGCHAIN_PROJECT` — LangSmith project name (default: `finance-erp-agent`)

### 2. Start the Agent

```bash
cd agent
pip install -e .
python main.py
```

Or with LangGraph CLI:
```bash
langgraph dev
```

### 3. Start the Frontend

```bash
npm install
npm run dev
```

Frontend environment (`.env.local`):
- `REMOTE_ACTION_URL` — Agent endpoint (default: `http://localhost:8123/copilotkit/agents/finance_erp_agent`)

### 4. Deploy to LangGraph Cloud

```bash
cd agent
langgraph deploy
```

Update `REMOTE_ACTION_URL` in the frontend `.env.local` to point to the cloud deployment URL.

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

See `demo_guide.md` for the full 6-act demo script (~12 minutes). Summary:

1. **Conversational baseline** — "What's our cash position?" (agent context + research subagent)
2. **Navigate + Filter** — "Show me overdue invoices" (navigate_and_filter)
3. **Inline Charts** — "Cash flow projection for 4 quarters" (projections subagent + render_chat_visual)
4. **Invoice Approval (HITL)** — "Process payment for overdue invoices" (request_approval)
5. **Inventory Reorder (HITL)** — "Check inventory and reorder" (request_approval)
6. **Dashboard Composition** — "Build me a cash flow risk dashboard" (manage_dashboard + update_dashboard)

---

## Acceptance Criteria

- [ ] All 5 ERP modules render correctly with mock data
- [ ] CopilotKit sidebar opens and connects to the LangGraph agent
- [ ] Agent correctly routes queries to appropriate subagents
- [ ] Orchestrator calls frontend tools (not plain text) for visual responses
- [ ] Human-in-the-loop approval works for invoice payments
- [ ] Human-in-the-loop approval works for inventory reorders
- [ ] Dashboard composition responds to themed requests (e.g. "cash flow risk dashboard")
- [ ] Inline charts render in chat (area, bar, line)
- [ ] Navigation + filtering works from chat
- [ ] Revenue chart renders with Recharts (area chart)
- [ ] Dark theme is consistent across all pages
- [ ] Status badges show correct colors (green/amber/red)
- [ ] Navigation sidebar highlights active route
- [ ] LangSmith traces appear for all agent interactions (when configured)
