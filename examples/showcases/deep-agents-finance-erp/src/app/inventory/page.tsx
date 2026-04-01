"use client";

import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { inventoryItems } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Package, Plus } from "lucide-react";
import type { InventoryItem } from "@/types/erp";

export default function InventoryPage() {
  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
  const lowStockCount = inventoryItems.filter(
    (item) => item.status === "low-stock" || item.status === "out-of-stock"
  ).length;
  const totalSKUs = inventoryItems.length;

  return (
    <Shell>
      <Header title="Inventory" subtitle="Stock management and tracking" />

      <div className="space-y-6 p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-400" />
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Total SKUs
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {totalSKUs}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Inventory Value
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Low / Out of Stock
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-400">
              {lowStockCount} items
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {["all", "in-stock", "low-stock", "out-of-stock"].map((f) => (
              <button
                key={f}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium capitalize text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                {f.replace("-", " ")}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <DataTable<InventoryItem>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "SKU",
                accessor: "sku",
                className: "font-mono text-zinc-400 text-xs",
              },
              {
                header: "Item Name",
                accessor: "name",
                className: "text-zinc-200 font-medium",
              },
              {
                header: "Category",
                accessor: "category",
                className: "text-zinc-400",
              },
              {
                header: "Qty",
                accessor: (row) => (
                  <span
                    className={
                      row.quantity <= row.reorderLevel
                        ? "font-medium text-amber-400"
                        : "text-zinc-300"
                    }
                  >
                    {row.quantity}
                  </span>
                ),
              },
              {
                header: "Reorder Lvl",
                accessor: (row) => (
                  <span className="text-zinc-500">{row.reorderLevel}</span>
                ),
              },
              {
                header: "Unit Cost",
                accessor: (row) => (
                  <span className="text-zinc-300">
                    {formatCurrency(row.unitCost)}
                  </span>
                ),
              },
              {
                header: "Location",
                accessor: "location",
                className: "text-zinc-500",
              },
              {
                header: "Status",
                accessor: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            data={inventoryItems}
          />
        </div>
      </div>
    </Shell>
  );
}
