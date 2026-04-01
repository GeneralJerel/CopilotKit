"use client";

import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/ui/kpi-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { ExpenseChart } from "@/components/charts/expense-chart";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
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
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Transactions
              </h3>
              <Link
                href="/accounts"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <DataTable<Transaction>
              keyExtractor={(row) => row.id}
              columns={[
                {
                  header: "Description",
                  accessor: "description",
                  className: "text-gray-900 font-medium",
                },
                {
                  header: "Amount",
                  accessor: (row) => (
                    <span
                      className={
                        row.type === "credit"
                          ? "text-emerald-600"
                          : "text-gray-700"
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
          </div>

          {/* Outstanding Invoices */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Outstanding Invoices
              </h3>
              <Link
                href="/invoices"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <DataTable<Invoice>
              keyExtractor={(row) => row.id}
              columns={[
                {
                  header: "Invoice",
                  accessor: (row) => (
                    <div>
                      <p className="font-medium text-gray-900">
                        {row.number}
                      </p>
                      <p className="text-xs text-gray-500">{row.client}</p>
                    </div>
                  ),
                },
                {
                  header: "Amount",
                  accessor: (row) => (
                    <span className="text-gray-900">
                      {formatCurrency(row.amount)}
                    </span>
                  ),
                },
                {
                  header: "Due",
                  accessor: "dueDate",
                  className: "text-gray-500",
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
          </div>
        </div>
      </div>
    </Shell>
  );
}
