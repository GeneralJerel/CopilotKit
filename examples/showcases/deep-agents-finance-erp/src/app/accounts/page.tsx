"use client";

import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { accounts, transactions } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import type { Account, Transaction } from "@/types/erp";

const accountTypeColors: Record<string, string> = {
  asset: "text-emerald-700 bg-emerald-50",
  liability: "text-rose-700 bg-rose-50",
  equity: "text-blue-700 bg-blue-50",
  revenue: "text-sky-700 bg-sky-50",
  expense: "text-amber-700 bg-amber-50",
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
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Total Assets
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatCurrency(totalAssets)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Total Liabilities
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              {formatCurrency(totalLiabilities)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Net Position
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(totalAssets - totalLiabilities)}
            </p>
          </div>
        </div>

        {/* Chart of Accounts */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Chart of Accounts
            </h3>
          </div>
          <DataTable<Account>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Code",
                accessor: "code",
                className: "font-mono text-gray-500",
              },
              {
                header: "Account Name",
                accessor: "name",
                className: "text-gray-900 font-medium",
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
                  <span className="font-medium text-gray-900">
                    {formatCurrency(row.balance)}
                  </span>
                ),
              },
            ]}
            data={accounts}
          />
        </div>

        {/* Transaction Ledger */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Transaction Ledger
            </h3>
          </div>
          <DataTable<Transaction>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Date",
                accessor: "date",
                className: "text-gray-500",
              },
              {
                header: "Description",
                accessor: "description",
                className: "text-gray-900 font-medium",
              },
              {
                header: "Category",
                accessor: "category",
                className: "text-gray-500",
              },
              {
                header: "Account",
                accessor: "accountCode",
                className: "font-mono text-gray-500",
              },
              {
                header: "Amount",
                accessor: (row) => (
                  <span
                    className={
                      row.type === "credit"
                        ? "font-medium text-emerald-600"
                        : "font-medium text-gray-700"
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
