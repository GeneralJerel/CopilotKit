import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { InventoryReorderCard } from "@/components/chat/inventory-reorder-card";

export function useApproveInventoryReorder() {
  useHumanInTheLoop({
    name: "approve_inventory_reorder",
    description:
      "Present a purchase order for low-stock or out-of-stock items. The agent MUST use this tool before placing any reorder. Wait for user approval before proceeding.",
    parameters: z.object({
      items: z
        .array(
          z.object({
            sku: z.string().describe("Item SKU"),
            name: z.string().describe("Item name"),
            currentQty: z.number().describe("Current quantity in stock"),
            reorderQty: z.number().describe("Proposed quantity to order"),
            unitCost: z.number().describe("Unit cost in USD"),
          })
        )
        .describe("Items to reorder"),
      estimatedTotal: z.number().describe("Total estimated cost of the purchase order"),
      supplier: z.string().optional().describe("Supplier name, if known"),
    }),
    render: InventoryReorderCard,
  });
}
