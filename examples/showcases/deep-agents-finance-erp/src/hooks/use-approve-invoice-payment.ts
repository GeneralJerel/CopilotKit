import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { InvoiceApprovalCard } from "@/components/chat/invoice-approval-card";

export function useApproveInvoicePayment() {
  useHumanInTheLoop({
    agentId: "finance_erp_agent",
    name: "approve_invoice_payment",
    description:
      "Present overdue or pending invoices to the user for payment approval. The agent MUST use this tool before marking any invoice as paid. Never process payments without explicit user approval.",
    parameters: z.object({
      invoices: z
        .array(
          z.object({
            number: z.string().describe("Invoice number, e.g. INV-2026-003"),
            client: z.string().describe("Client name"),
            amount: z.number().describe("Invoice amount in USD"),
            dueDate: z.string().describe("Due date in YYYY-MM-DD format"),
          })
        )
        .describe("Invoices to present for payment approval"),
      totalAmount: z.number().describe("Sum of all invoice amounts"),
      action: z
        .string()
        .describe("Description of the action, e.g. 'Mark 3 invoices as paid'"),
    }),
    render: InvoiceApprovalCard,
  });
}
