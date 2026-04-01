"use client";

import { DollarSign, Check, X } from "lucide-react";
import { ToolCallStatus } from "@copilotkit/react-core/v2";

type InvoiceRow = {
  number: string;
  client: string;
  amount: number;
  dueDate: string;
};

type Args = {
  invoices: InvoiceRow[];
  totalAmount: number;
  action: string;
};

type Props =
  | {
      status: ToolCallStatus.InProgress;
      args: Partial<Args>;
      respond: undefined;
      result: undefined;
    }
  | {
      status: ToolCallStatus.Executing;
      args: Args;
      respond: (result: unknown) => Promise<void>;
      result: undefined;
    }
  | {
      status: ToolCallStatus.Complete;
      args: Args;
      respond: undefined;
      result: string;
    };

export function InvoiceApprovalCard(props: Props) {
  const { status, args } = props;

  if (status === ToolCallStatus.InProgress) {
    return (
      <div className="my-2 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 text-gray-400">
          <DollarSign className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Reviewing invoices...</span>
        </div>
      </div>
    );
  }

  const { invoices, totalAmount, action } = args as Args;
  const isComplete = status === ToolCallStatus.Complete;
  const result = isComplete ? (props as { result: string }).result : null;
  const wasApproved = result?.includes("approved");

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  return (
    <div
      className={`my-2 rounded-2xl border bg-white p-5 ${isComplete ? "border-gray-100 opacity-80" : "border-gray-200"}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
          <DollarSign className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Payment Approval Required
          </p>
          <p className="text-xs text-gray-500">{action}</p>
        </div>
      </div>

      {/* Invoice table */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">Invoice</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium text-right">Amount</th>
              <th className="px-3 py-2 font-medium text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.number} className="border-b border-gray-50">
                <td className="px-3 py-2 font-mono text-gray-700">
                  {inv.number}
                </td>
                <td className="px-3 py-2 text-gray-700">{inv.client}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">
                  {formatCurrency(inv.amount)}
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {inv.dueDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
          <span className="text-xs font-medium text-gray-500">Total</span>
          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Status badge (complete state) */}
      {isComplete && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${wasApproved ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
        >
          {wasApproved ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          {wasApproved ? "Payment Approved" : "Payment Rejected"}
        </div>
      )}

      {/* Action buttons (executing state only) */}
      {status === ToolCallStatus.Executing && (
        <div className="flex gap-2">
          <button
            onClick={() =>
              props.respond({
                approved: true,
                message: `Payment approved for ${invoices.length} invoice(s) totaling ${formatCurrency(totalAmount)}`,
              })
            }
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Approve Payment
          </button>
          <button
            onClick={() =>
              props.respond({
                approved: false,
                message: "Payment rejected by user",
              })
            }
            className="flex-1 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
