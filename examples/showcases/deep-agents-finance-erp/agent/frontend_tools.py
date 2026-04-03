"""Backend tool stubs matching frontend tool schemas.

These tools are registered at agent creation time so the model can call them
via function calling. The AG-UI adapter streams ToolCall events, which the
CopilotKit frontend matches to useFrontendTool renderers by name.

Rendering tools return a simple confirmation string.
HITL tools use copilotkit_interrupt() to pause the graph for user approval.
"""

from typing import Optional
from langchain_core.tools import tool
from copilotkit.langgraph import copilotkit_interrupt


# ---------------------------------------------------------------------------
# Chat rendering tools
# ---------------------------------------------------------------------------

@tool
def render_chart(title: str, type: str, data: list, series: list) -> str:
    """Render an interactive chart inline in the chat.

    Args:
        title: Chart title.
        type: Chart type — 'area' for trends, 'bar' for comparisons, 'line' for trajectories.
        data: Chart data points. Each has label (x-axis), value (primary), and optional value2.
        series: Series config. Each has key ('value' or 'value2'), color (hex), and label.
    """
    return f"Chart '{title}' rendered."


@tool
def render_cash_position(
    accounts: list,
    totalCash: float,
    totalLiabilities: float,
    netPosition: float,
) -> str:
    """Render a cash position summary card in the chat showing accounts, liabilities, and net position.

    ALWAYS use this when the user asks about cash position, liquidity, or cash vs liabilities.

    Args:
        accounts: Cash and asset accounts. Each has name (str) and balance (number).
        totalCash: Total cash and cash equivalents.
        totalLiabilities: Total liabilities.
        netPosition: Net position (totalCash - totalLiabilities).
    """
    return f"Cash position card rendered. Net: ${netPosition:,.0f}"


@tool
def navigate_and_filter(page: str, filter: Optional[str] = None) -> str:
    """Navigate to an ERP page and optionally apply a filter.

    Args:
        page: Page to navigate to — dashboard, invoices, accounts, inventory, or hr.
        filter: Optional filter. Invoices: paid|pending|overdue|draft. Inventory: in-stock|low-stock|out-of-stock.
    """
    msg = f"Navigated to {page}"
    if filter:
        msg += f" with filter '{filter}'"
    return msg


# ---------------------------------------------------------------------------
# Human-in-the-loop tools
# ---------------------------------------------------------------------------

@tool
def approve_invoice_payment(invoices: list, totalAmount: float, action: str) -> str:
    """Present invoices for payment approval. MANDATORY before processing any payment.

    Args:
        invoices: Invoices to approve. Each has number, client, amount, dueDate.
        totalAmount: Sum of all invoice amounts.
        action: Description of the action, e.g. 'Process payment for 3 overdue invoices'.
    """
    answer, _ = copilotkit_interrupt(
        action="approve_invoice_payment",
        args={"invoices": invoices, "totalAmount": totalAmount, "action": action},
    )
    return answer


@tool
def approve_inventory_reorder(
    items: list,
    estimatedTotal: float,
    supplier: str = "",
) -> str:
    """Present a purchase order for review. MANDATORY before placing any reorder.

    Args:
        items: Items to reorder. Each has sku, name, currentQty, reorderQty, unitCost.
        estimatedTotal: Total estimated cost of the purchase order.
        supplier: Supplier name, if known.
    """
    answer, _ = copilotkit_interrupt(
        action="approve_inventory_reorder",
        args={"items": items, "estimatedTotal": estimatedTotal, "supplier": supplier},
    )
    return answer


# ---------------------------------------------------------------------------
# Dashboard widget tools
# ---------------------------------------------------------------------------

@tool
def render_kpi_cards(metrics: Optional[list] = None, colSpan: int = 4) -> str:
    """Add or update KPI metric cards on the dashboard.

    Args:
        metrics: Which KPI labels to show. Omit to show all.
        colSpan: Grid column span (1-4). Default: 4 (full width).
    """
    return "KPI cards rendered."


@tool
def render_revenue_chart(
    showProfit: bool = True,
    showExpenses: bool = True,
    colSpan: int = 3,
) -> str:
    """Add or update the Revenue vs Expenses chart on the dashboard.

    Args:
        showProfit: Show the profit line. Default: true.
        showExpenses: Show the expenses line. Default: true.
        colSpan: Grid column span (1-4). Default: 3.
    """
    return "Revenue chart rendered."


@tool
def render_expense_breakdown(
    categories: Optional[list] = None,
    colSpan: int = 1,
) -> str:
    """Add or update the Expense Breakdown widget on the dashboard.

    Args:
        categories: Filter to specific categories. Omit to show all.
        colSpan: Grid column span (1-4). Default: 1.
    """
    return "Expense breakdown rendered."


@tool
def render_transactions(limit: int = 5, colSpan: int = 2) -> str:
    """Add or update the Recent Transactions table on the dashboard.

    Args:
        limit: Number of transactions to display (1-20). Default: 5.
        colSpan: Grid column span (1-4). Default: 2.
    """
    return "Transactions table rendered."


@tool
def render_invoices(statuses: Optional[list] = None, colSpan: int = 2) -> str:
    """Add or update the Outstanding Invoices table on the dashboard.

    Args:
        statuses: Which statuses to show ('pending', 'overdue'). Default: both.
        colSpan: Grid column span (1-4). Default: 2.
    """
    return "Invoices table rendered."


@tool
def render_custom_chart(
    title: str,
    chartType: str,
    data: list,
    series: list,
    colSpan: int = 2,
) -> str:
    """Add a custom chart with agent-provided data to the dashboard.

    Args:
        title: Chart title displayed on the dashboard card.
        chartType: Chart type — 'area', 'bar', or 'line'.
        data: Chart data points. Each has label, value, and optional value2.
        series: Series config. Each has key, color (hex), and label.
        colSpan: Grid column span (1-4). Default: 2.
    """
    return f"Custom chart '{title}' added to dashboard."


@tool
def remove_dashboard_widget(widgetId: str) -> str:
    """Remove a widget from the dashboard by its ID.

    Args:
        widgetId: The ID of the widget to remove.
    """
    return f"Widget '{widgetId}' removed."


@tool
def update_dashboard_layout(updates: list) -> str:
    """Reorder or resize multiple dashboard widgets at once.

    Args:
        updates: Array of updates. Each has widgetId (str), optional colSpan (1-4), optional order (int).
    """
    return f"Updated {len(updates)} widget(s)."


@tool
def reset_dashboard() -> str:
    """Reset the dashboard to its default layout with all standard widgets."""
    return "Dashboard reset to defaults."


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------

# Tools whose execution is intercepted by CopilotKitMiddleware and forwarded to
# the frontend for rendering via useFrontendTool. Backend stubs exist only so
# the LLM has tool schemas; actual execution + rendering happens in the browser.
ui_tools = [
    # Chat rendering
    render_chart,
    render_cash_position,
    navigate_and_filter,
    # Dashboard widgets
    render_kpi_cards,
    render_revenue_chart,
    render_expense_breakdown,
    render_transactions,
    render_invoices,
    render_custom_chart,
    # Dashboard management
    remove_dashboard_widget,
    update_dashboard_layout,
    reset_dashboard,
]

# Human-in-the-loop tools — these MUST execute on the backend because they call
# copilotkit_interrupt() to pause the graph for user approval.
hitl_tools = [
    approve_invoice_payment,
    approve_inventory_reorder,
]

# All frontend tools (backward-compatible export)
frontend_tools = [*ui_tools, *hitl_tools]
