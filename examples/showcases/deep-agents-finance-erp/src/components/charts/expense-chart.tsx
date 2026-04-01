"use client";

import { expenseBreakdown } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export function ExpenseChart() {
  const total = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900">
          Expense Breakdown
        </h3>
        <p className="text-xs text-gray-500">By category, YTD</p>
      </div>

      <div className="space-y-4">
        {expenseBreakdown.map((item) => (
          <div key={item.category}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-gray-700">{item.category}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">
                  {formatCurrency(item.amount)}
                </span>
                <span className="w-8 text-right text-xs text-gray-400">
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Expenses
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
