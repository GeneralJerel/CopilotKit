"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { invoices } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Invoice } from "@/types/erp";

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  );
}

function InvoicesContent() {
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") || "all";

  const filtered =
    activeFilter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === activeFilter);

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
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Outstanding
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Collected YTD
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Overdue
            </p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {overdueCount} invoice{overdueCount !== 1 && "s"}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {["all", "paid", "pending", "overdue", "draft"].map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/invoices" : `/invoices?filter=${f}`}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  activeFilter === f
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                )}
              >
                {f}
              </Link>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>

        {/* Invoice Table */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <DataTable<Invoice>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Invoice",
                accessor: (row) => (
                  <div>
                    <p className="font-medium text-gray-900">{row.number}</p>
                  </div>
                ),
              },
              {
                header: "Client",
                accessor: "client",
                className: "text-gray-700",
              },
              {
                header: "Amount",
                accessor: (row) => (
                  <span className="font-medium text-gray-900">
                    {formatCurrency(row.amount)}
                  </span>
                ),
              },
              {
                header: "Issued",
                accessor: "issuedDate",
                className: "text-gray-500",
              },
              {
                header: "Due Date",
                accessor: "dueDate",
                className: "text-gray-500",
              },
              {
                header: "Items",
                accessor: (row) => (
                  <span className="text-gray-500">{row.items.length}</span>
                ),
              },
              {
                header: "Status",
                accessor: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            data={filtered}
          />
        </div>
      </div>
    </Shell>
  );
}
