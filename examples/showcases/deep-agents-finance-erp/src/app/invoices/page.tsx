"use client";

import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { invoices } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Plus, Filter } from "lucide-react";
import type { Invoice } from "@/types/erp";

export default function InvoicesPage() {
  const totalOutstanding = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueCount = invoices.filter(
    (inv) => inv.status === "overdue"
  ).length;

  return (
    <Shell>
      <Header title="Invoices" subtitle="Manage billing and payments" />

      <div className="space-y-6 p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Outstanding
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-400">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Collected YTD
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Overdue
            </p>
            <p className="mt-2 text-2xl font-bold text-red-400">
              {overdueCount} invoice{overdueCount !== 1 && "s"}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {["all", "paid", "pending", "overdue", "draft"].map((filter) => (
              <button
                key={filter}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium capitalize text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                {filter}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>

        {/* Invoice Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <DataTable<Invoice>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Invoice",
                accessor: (row) => (
                  <div>
                    <p className="font-medium text-zinc-200">{row.number}</p>
                  </div>
                ),
              },
              {
                header: "Client",
                accessor: "client",
                className: "text-zinc-300",
              },
              {
                header: "Amount",
                accessor: (row) => (
                  <span className="font-medium text-zinc-200">
                    {formatCurrency(row.amount)}
                  </span>
                ),
              },
              {
                header: "Issued",
                accessor: "issuedDate",
                className: "text-zinc-500",
              },
              {
                header: "Due Date",
                accessor: "dueDate",
                className: "text-zinc-500",
              },
              {
                header: "Items",
                accessor: (row) => (
                  <span className="text-zinc-400">{row.items.length}</span>
                ),
              },
              {
                header: "Status",
                accessor: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            data={invoices}
          />
        </div>
      </div>
    </Shell>
  );
}
