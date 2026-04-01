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
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total SKUs
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalSKUs}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Inventory Value
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Low / Out of Stock
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
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
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium capitalize text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                {f.replace("-", " ")}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <DataTable<InventoryItem>
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "SKU",
                accessor: "sku",
                className: "font-mono text-gray-500 text-xs",
              },
              {
                header: "Item Name",
                accessor: "name",
                className: "text-gray-900 font-medium",
              },
              {
                header: "Category",
                accessor: "category",
                className: "text-gray-500",
              },
              {
                header: "Qty",
                accessor: (row) => (
                  <span
                    className={
                      row.quantity <= row.reorderLevel
                        ? "font-medium text-amber-600"
                        : "text-gray-700"
                    }
                  >
                    {row.quantity}
                  </span>
                ),
              },
              {
                header: "Reorder Lvl",
                accessor: (row) => (
                  <span className="text-gray-500">{row.reorderLevel}</span>
                ),
              },
              {
                header: "Unit Cost",
                accessor: (row) => (
                  <span className="text-gray-700">
                    {formatCurrency(row.unitCost)}
                  </span>
                ),
              },
              {
                header: "Location",
                accessor: "location",
                className: "text-gray-500",
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
