export type WidgetType =
  | "kpi-cards"
  | "revenue-chart"
  | "expense-breakdown"
  | "recent-transactions"
  | "outstanding-invoices"
  | "custom-chart";

export interface BaseWidget {
  id: string;
  type: WidgetType;
  colSpan: 1 | 2 | 3 | 4;
  order: number;
}

export interface KpiCardsWidget extends BaseWidget {
  type: "kpi-cards";
  config: { metrics?: string[] };
}

export interface RevenueChartWidget extends BaseWidget {
  type: "revenue-chart";
  config: { showProfit?: boolean; showExpenses?: boolean };
}

export interface ExpenseBreakdownWidget extends BaseWidget {
  type: "expense-breakdown";
  config: { categories?: string[] };
}

export interface RecentTransactionsWidget extends BaseWidget {
  type: "recent-transactions";
  config: { limit?: number };
}

export interface OutstandingInvoicesWidget extends BaseWidget {
  type: "outstanding-invoices";
  config: { statuses?: ("pending" | "overdue")[] };
}

export interface CustomChartWidget extends BaseWidget {
  type: "custom-chart";
  config: {
    title: string;
    subtitle?: string;
    chartType: "area" | "bar" | "line";
    data: { label: string; value: number; value2?: number; value3?: number }[];
    series: { key: string; color: string; label: string }[];
    formatValues?: "currency" | "number" | "percent";
  };
}

export type DashboardWidget =
  | KpiCardsWidget
  | RevenueChartWidget
  | ExpenseBreakdownWidget
  | RecentTransactionsWidget
  | OutstandingInvoicesWidget
  | CustomChartWidget;

export interface SavedDashboard {
  id: string;
  name: string;
  description?: string;
  category: "template" | "custom";
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}
