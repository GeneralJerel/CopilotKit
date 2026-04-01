"use client";

import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/ui/kpi-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { ExpenseChart } from "@/components/charts/expense-chart";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { kpis, transactions, invoices } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Transaction, Invoice } from "@/types/erp";

export default function DashboardPage() {
  return (
    <Shell>
      <Header title="Dashboard" subtitle="Financial overview and analytics" />

      <div className="space-y-8 p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <ExpenseChart />
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Link
                  href="/accounts"
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable<Transaction>
                keyExtractor={(row) => row.id}
                columns={[
                  {
                    header: "Description",
                    accessor: "description",
                    className: "text-foreground font-medium",
                  },
                  {
                    header: "Amount",
                    accessor: (row) => (
                      <span
                        className={
                          row.type === "credit"
                            ? "text-emerald-600"
                            : "text-foreground"
                        }
                      >
                        {row.type === "credit" ? "+" : "-"}
                        {formatCurrency(row.amount)}
                      </span>
                    ),
                  },
                  {
                    header: "Status",
                    accessor: (row) => <StatusBadge status={row.status} />,
                  },
                ]}
                data={transactions.slice(0, 5)}
              />
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Outstanding Invoices</CardTitle>
                <Link
                  href="/invoices"
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable<Invoice>
                keyExtractor={(row) => row.id}
                columns={[
                  {
                    header: "Invoice",
                    accessor: (row) => (
                      <div>
                        <p className="font-medium text-foreground">
                          {row.number}
                        </p>
                        <p className="text-xs text-muted-foreground">{row.client}</p>
                      </div>
                    ),
                  },
                  {
                    header: "Amount",
                    accessor: (row) => (
                      <span className="text-foreground">
                        {formatCurrency(row.amount)}
                      </span>
                    ),
                  },
                  {
                    header: "Due",
                    accessor: "dueDate",
                    className: "text-muted-foreground",
                  },
                  {
                    header: "Status",
                    accessor: (row) => <StatusBadge status={row.status} />,
                  },
                ]}
                data={invoices.filter(
                  (inv) => inv.status === "pending" || inv.status === "overdue"
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
