"use client";

import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { accounts, transactions } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import type { Account, Transaction } from "@/types/erp";

const accountTypeColors: Record<string, string> = {
  asset: "text-emerald-400 bg-emerald-400/10",
  liability: "text-rose-400 bg-rose-400/10",
  equity: "text-indigo-400 bg-indigo-400/10",
  revenue: "text-sky-400 bg-sky-400/10",
  expense: "text-amber-400 bg-amber-400/10",
};

export default function AccountsPage() {
  const totalAssets = accounts
    .filter((a) => a.type === "asset")
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => a.type === "liability")
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <Shell>
      <Header title="Accounts" subtitle="Chart of accounts and transactions" />

      <div className="space-y-6 p-8">
        {/* Balance Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Assets
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {formatCurrency(totalAssets)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Liabilities
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-400">
              {formatCurrency(totalLiabilities)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Net Position
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-400">
              {formatCurrency(totalAssets - totalLiabilities)}
            </p>
          </div>
        </div>

        {/* Chart of Accounts */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">
              Chart of Accounts
            </h3>
          </div>
          <DataTable<Account>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Code",
                accessor: "code",
                className: "font-mono text-zinc-400",
              },
              {
                header: "Account Name",
                accessor: "name",
                className: "text-zinc-200 font-medium",
              },
              {
                header: "Type",
                accessor: (row) => (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${accountTypeColors[row.type]}`}
                  >
                    {row.type}
                  </span>
                ),
              },
              {
                header: "Balance",
                accessor: (row) => (
                  <span className="font-medium text-zinc-200">
                    {formatCurrency(row.balance)}
                  </span>
                ),
              },
            ]}
            data={accounts}
          />
        </div>

        {/* Transaction Ledger */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">
              Transaction Ledger
            </h3>
          </div>
          <DataTable<Transaction>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Date",
                accessor: "date",
                className: "text-zinc-500",
              },
              {
                header: "Description",
                accessor: "description",
                className: "text-zinc-200 font-medium",
              },
              {
                header: "Category",
                accessor: "category",
                className: "text-zinc-400",
              },
              {
                header: "Account",
                accessor: "accountCode",
                className: "font-mono text-zinc-500",
              },
              {
                header: "Amount",
                accessor: (row) => (
                  <span
                    className={
                      row.type === "credit"
                        ? "font-medium text-emerald-400"
                        : "font-medium text-zinc-300"
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
            data={transactions}
          />
        </div>
      </div>
    </Shell>
  );
}
