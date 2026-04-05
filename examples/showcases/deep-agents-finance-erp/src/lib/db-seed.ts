import type { DashboardWidget } from "@/types/dashboard";
import sql from "./db";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export async function ensureSchema() {
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS dashboards (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT NOT NULL,
      description TEXT,
      category   TEXT NOT NULL DEFAULT 'custom',
      widgets    JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Seed templates if none exist
  const [{ count }] = await sql`
    SELECT count(*)::int AS count FROM dashboards WHERE category = 'template'
  `;
  if (count === 0) {
    await seedTemplates();
  }
}

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------

export const TEMPLATES: {
  name: string;
  description: string;
  widgets: DashboardWidget[];
}[] = [
  {
    name: "Executive Summary",
    description:
      "High-level overview with KPIs, revenue trends, expenses, recent transactions, and outstanding invoices. The default starting layout.",
    widgets: [
      { id: "kpi-cards", type: "kpi-cards", colSpan: 4, order: 0, config: {} },
      {
        id: "revenue-chart",
        type: "revenue-chart",
        colSpan: 3,
        order: 1,
        config: { showProfit: true, showExpenses: true },
      },
      {
        id: "expense-breakdown",
        type: "expense-breakdown",
        colSpan: 1,
        order: 2,
        config: {},
      },
      {
        id: "recent-transactions",
        type: "recent-transactions",
        colSpan: 2,
        order: 3,
        config: { limit: 5 },
      },
      {
        id: "outstanding-invoices",
        type: "outstanding-invoices",
        colSpan: 2,
        order: 4,
        config: { statuses: ["pending", "overdue"] },
      },
    ],
  },
  {
    name: "Cash Flow Risk",
    description:
      "Focus on liquidity risk — AR aging, overdue invoices, and cash flow projections to spot potential shortfalls early.",
    widgets: [
      {
        id: "kpi-cards",
        type: "kpi-cards",
        colSpan: 4,
        order: 0,
        config: { metrics: ["Accounts Receivable", "Total Revenue"] },
      },
      {
        id: "ar-aging-chart",
        type: "custom-chart",
        colSpan: 2,
        order: 1,
        config: {
          title: "AR Aging Trend",
          subtitle: "Last 4 quarters — receivable aging by period",
          chartType: "area",
          data: [
            { label: "Q1 2025", value: 120000, value2: 45000 },
            { label: "Q2 2025", value: 145000, value2: 62000 },
            { label: "Q3 2025", value: 132000, value2: 58000 },
            { label: "Q4 2025", value: 168000, value2: 71000 },
          ],
          series: [
            { key: "value", color: "#2563eb", label: "Current" },
            { key: "value2", color: "#ef4444", label: "Overdue" },
          ],
          formatValues: "currency",
        },
      },
      {
        id: "outstanding-invoices",
        type: "outstanding-invoices",
        colSpan: 2,
        order: 2,
        config: { statuses: ["overdue"] },
      },
      {
        id: "cash-projection-chart",
        type: "custom-chart",
        colSpan: 4,
        order: 3,
        config: {
          title: "Quarterly Cash Projection",
          subtitle: "Next 4 quarters — projected operating cash balance",
          chartType: "bar",
          data: [
            { label: "Q1 2026", value: 410000, value2: 285000 },
            { label: "Q2 2026", value: 495000, value2: 320000 },
            { label: "Q3 2026", value: 598000, value2: 360000 },
            { label: "Q4 2026", value: 722000, value2: 405000 },
          ],
          series: [
            { key: "value", color: "#10b981", label: "Inflows" },
            { key: "value2", color: "#f59e0b", label: "Outflows" },
          ],
          formatValues: "currency",
        },
      },
    ],
  },
  {
    name: "Cost Control",
    description:
      "Monitor spending against budgets — expense breakdown by category, monthly trends, and budget variance analysis.",
    widgets: [
      {
        id: "kpi-cards",
        type: "kpi-cards",
        colSpan: 4,
        order: 0,
        config: { metrics: ["Operating Expenses", "Net Profit"] },
      },
      {
        id: "expense-breakdown",
        type: "expense-breakdown",
        colSpan: 2,
        order: 1,
        config: {},
      },
      {
        id: "spending-trend-chart",
        type: "custom-chart",
        colSpan: 2,
        order: 2,
        config: {
          title: "Monthly Spending Trend",
          subtitle: "Last 6 months — total operating expenditure",
          chartType: "area",
          data: [
            { label: "Oct", value: 285000 },
            { label: "Nov", value: 298000 },
            { label: "Dec", value: 312000 },
            { label: "Jan", value: 305000 },
            { label: "Feb", value: 291000 },
            { label: "Mar", value: 318000 },
          ],
          series: [{ key: "value", color: "#8b5cf6", label: "Total Spend" }],
          formatValues: "currency",
        },
      },
      {
        id: "budget-vs-actual-chart",
        type: "custom-chart",
        colSpan: 4,
        order: 3,
        config: {
          title: "Budget vs Actual",
          subtitle: "Current quarter — by department",
          chartType: "bar",
          data: [
            { label: "Payroll", value: 580000, value2: 560000 },
            { label: "Operations", value: 234000, value2: 248000 },
            { label: "Marketing", value: 156000, value2: 189000 },
            { label: "Infrastructure", value: 89000, value2: 85000 },
            { label: "R&D", value: 178000, value2: 172000 },
          ],
          series: [
            { key: "value", color: "#6366f1", label: "Budget" },
            { key: "value2", color: "#f43f5e", label: "Actual" },
          ],
          formatValues: "currency",
        },
      },
    ],
  },
  {
    name: "Revenue Overview",
    description:
      "Revenue-focused view with growth trends, profit margins, and forward-looking forecast. Ideal for sales and leadership reviews.",
    widgets: [
      {
        id: "kpi-cards",
        type: "kpi-cards",
        colSpan: 4,
        order: 0,
        config: { metrics: ["Total Revenue", "Net Profit"] },
      },
      {
        id: "revenue-chart",
        type: "revenue-chart",
        colSpan: 3,
        order: 1,
        config: { showProfit: true, showExpenses: true },
      },
      {
        id: "expense-breakdown",
        type: "expense-breakdown",
        colSpan: 1,
        order: 2,
        config: {},
      },
      {
        id: "revenue-forecast-chart",
        type: "custom-chart",
        colSpan: 4,
        order: 3,
        config: {
          title: "Revenue Forecast",
          subtitle: "Next 4 quarters — optimistic vs conservative projection",
          chartType: "line",
          data: [
            { label: "Q2 2026", value: 1050000, value2: 870000 },
            { label: "Q3 2026", value: 1160000, value2: 920000 },
            { label: "Q4 2026", value: 1280000, value2: 975000 },
            { label: "Q1 2027", value: 1410000, value2: 1030000 },
          ],
          series: [
            { key: "value", color: "#10b981", label: "Optimistic" },
            { key: "value2", color: "#f59e0b", label: "Conservative" },
          ],
          formatValues: "currency",
        },
      },
    ],
  },
];

async function seedTemplates() {
  if (!sql) return;
  for (const t of TEMPLATES) {
    await sql`
      INSERT INTO dashboards (name, description, category, widgets)
      VALUES (${t.name}, ${t.description}, 'template', ${JSON.stringify(t.widgets)})
    `;
  }
}
