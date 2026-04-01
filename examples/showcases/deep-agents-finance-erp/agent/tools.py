"""ERP tools — query and analyze finance data.

In production these would hit the Postgres database via SQLAlchemy.
For the demo, they return mock data matching the frontend fixtures.
"""

from __future__ import annotations

from langchain_core.tools import tool


# ---------------------------------------------------------------------------
# Invoice tools
# ---------------------------------------------------------------------------

@tool
def query_invoices(status: str | None = None) -> str:
    """Query invoices from the ERP system. Optionally filter by status (paid, pending, overdue, draft)."""
    invoices = [
        {"number": "INV-2026-001", "client": "Acme Corp", "amount": 45000, "status": "paid", "due": "2026-03-31"},
        {"number": "INV-2026-002", "client": "Globex Industries", "amount": 28500, "status": "pending", "due": "2026-04-10"},
        {"number": "INV-2026-003", "client": "Initech LLC", "amount": 67200, "status": "overdue", "due": "2026-03-15"},
        {"number": "INV-2026-004", "client": "Massive Dynamic", "amount": 18750, "status": "paid", "due": "2026-04-05"},
        {"number": "INV-2026-005", "client": "Umbrella Corp", "amount": 93400, "status": "pending", "due": "2026-04-20"},
        {"number": "INV-2026-006", "client": "Wayne Enterprises", "amount": 124000, "status": "draft", "due": "2026-04-28"},
        {"number": "INV-2026-007", "client": "Stark Industries", "amount": 56300, "status": "paid", "due": "2026-03-20"},
    ]
    if status:
        invoices = [inv for inv in invoices if inv["status"] == status]
    total = sum(inv["amount"] for inv in invoices)
    return f"Found {len(invoices)} invoices (total: ${total:,.0f}):\n" + "\n".join(
        f"  - {inv['number']} | {inv['client']} | ${inv['amount']:,.0f} | {inv['status']} | Due: {inv['due']}"
        for inv in invoices
    )


# ---------------------------------------------------------------------------
# Account tools
# ---------------------------------------------------------------------------

@tool
def query_accounts(account_type: str | None = None) -> str:
    """Query the chart of accounts. Optionally filter by type (asset, liability, equity, revenue, expense)."""
    accounts = [
        {"code": "1000", "name": "Cash & Equivalents", "type": "asset", "balance": 1245000},
        {"code": "1100", "name": "Accounts Receivable", "type": "asset", "balance": 456200},
        {"code": "1200", "name": "Inventory", "type": "asset", "balance": 312400},
        {"code": "1500", "name": "Fixed Assets", "type": "asset", "balance": 890000},
        {"code": "2000", "name": "Accounts Payable", "type": "liability", "balance": 234500},
        {"code": "2100", "name": "Short-term Loans", "type": "liability", "balance": 150000},
        {"code": "2500", "name": "Long-term Debt", "type": "liability", "balance": 520000},
        {"code": "3000", "name": "Owner's Equity", "type": "equity", "balance": 1850000},
        {"code": "3100", "name": "Retained Earnings", "type": "equity", "balance": 642100},
        {"code": "4000", "name": "Service Revenue", "type": "revenue", "balance": 2847350},
        {"code": "5000", "name": "Payroll Expense", "type": "expense", "balance": 580000},
        {"code": "5100", "name": "Operating Expense", "type": "expense", "balance": 625250},
    ]
    if account_type:
        accounts = [a for a in accounts if a["type"] == account_type]
    return f"Chart of Accounts ({len(accounts)} entries):\n" + "\n".join(
        f"  - [{a['code']}] {a['name']} ({a['type']}) — ${a['balance']:,.0f}"
        for a in accounts
    )


@tool
def query_transactions(limit: int = 10) -> str:
    """Query recent financial transactions from the ledger."""
    txns = [
        {"date": "2026-03-31", "desc": "Acme Corp - Invoice Payment", "amount": 45000, "type": "credit", "category": "Revenue"},
        {"date": "2026-03-30", "desc": "AWS Infrastructure", "amount": 8420, "type": "debit", "category": "Infrastructure"},
        {"date": "2026-03-29", "desc": "Payroll - March Cycle", "amount": 48500, "type": "debit", "category": "Payroll"},
        {"date": "2026-03-28", "desc": "Stark Industries - Payment", "amount": 56300, "type": "credit", "category": "Revenue"},
        {"date": "2026-03-27", "desc": "Office Supplies", "amount": 2340, "type": "debit", "category": "Operations"},
        {"date": "2026-03-26", "desc": "Google Ads Campaign", "amount": 12500, "type": "debit", "category": "Marketing"},
        {"date": "2026-03-25", "desc": "Massive Dynamic - Payment", "amount": 18750, "type": "credit", "category": "Revenue"},
        {"date": "2026-03-24", "desc": "Software Licenses Renewal", "amount": 5600, "type": "debit", "category": "Infrastructure"},
        {"date": "2026-03-23", "desc": "Insurance Premium Q2", "amount": 15000, "type": "debit", "category": "Operations"},
        {"date": "2026-03-22", "desc": "Contractor Payment - Design", "amount": 7800, "type": "debit", "category": "Operations"},
    ]
    txns = txns[:limit]
    return f"Recent transactions ({len(txns)}):\n" + "\n".join(
        f"  - {t['date']} | {t['desc']} | {'+'if t['type']=='credit' else '-'}${t['amount']:,.0f} | {t['category']}"
        for t in txns
    )


# ---------------------------------------------------------------------------
# Inventory tools
# ---------------------------------------------------------------------------

@tool
def query_inventory(status: str | None = None) -> str:
    """Query inventory items. Optionally filter by status (in-stock, low-stock, out-of-stock)."""
    items = [
        {"sku": "HW-SRV-001", "name": "Dell PowerEdge R750", "qty": 12, "reorder": 5, "cost": 8500, "status": "in-stock"},
        {"sku": "HW-LAP-001", "name": "MacBook Pro 16\"", "qty": 3, "reorder": 10, "cost": 2499, "status": "low-stock"},
        {"sku": "HW-MON-001", "name": "LG UltraFine 5K", "qty": 28, "reorder": 15, "cost": 1299, "status": "in-stock"},
        {"sku": "SW-LIC-001", "name": "Microsoft 365 E5", "qty": 150, "reorder": 50, "cost": 57, "status": "in-stock"},
        {"sku": "HW-NET-001", "name": "Cisco Catalyst 9300", "qty": 0, "reorder": 3, "cost": 4200, "status": "out-of-stock"},
        {"sku": "HW-LAP-002", "name": "ThinkPad X1 Carbon", "qty": 8, "reorder": 10, "cost": 1849, "status": "low-stock"},
        {"sku": "HW-STO-001", "name": "Synology DS1621+", "qty": 6, "reorder": 3, "cost": 1099, "status": "in-stock"},
        {"sku": "SW-SEC-001", "name": "CrowdStrike Falcon", "qty": 200, "reorder": 100, "cost": 25, "status": "in-stock"},
    ]
    if status:
        items = [i for i in items if i["status"] == status]
    total_value = sum(i["qty"] * i["cost"] for i in items)
    return f"Inventory ({len(items)} items, total value: ${total_value:,.0f}):\n" + "\n".join(
        f"  - [{i['sku']}] {i['name']} | Qty: {i['qty']} (reorder: {i['reorder']}) | ${i['cost']:,.0f}/unit | {i['status']}"
        for i in items
    )


# ---------------------------------------------------------------------------
# HR tools
# ---------------------------------------------------------------------------

@tool
def query_employees(department: str | None = None) -> str:
    """Query employee directory. Optionally filter by department."""
    employees = [
        {"name": "Sarah Chen", "role": "CFO", "dept": "Finance", "salary": 195000, "status": "active"},
        {"name": "Marcus Williams", "role": "VP Engineering", "dept": "Engineering", "salary": 185000, "status": "active"},
        {"name": "Priya Patel", "role": "Head of Product", "dept": "Product", "salary": 172000, "status": "active"},
        {"name": "James Rodriguez", "role": "Senior Developer", "dept": "Engineering", "salary": 145000, "status": "active"},
        {"name": "Emily Thompson", "role": "HR Director", "dept": "Human Resources", "salary": 158000, "status": "active"},
        {"name": "David Kim", "role": "Financial Analyst", "dept": "Finance", "salary": 95000, "status": "on-leave"},
        {"name": "Lisa Nakamura", "role": "Marketing Manager", "dept": "Marketing", "salary": 118000, "status": "active"},
        {"name": "Robert Chen", "role": "DevOps Engineer", "dept": "Engineering", "salary": 135000, "status": "active"},
        {"name": "Ana Martinez", "role": "UX Designer", "dept": "Product", "salary": 112000, "status": "active"},
        {"name": "Tom Walsh", "role": "Sales Director", "dept": "Sales", "salary": 165000, "status": "active"},
    ]
    if department:
        employees = [e for e in employees if e["dept"].lower() == department.lower()]
    total_payroll = sum(e["salary"] for e in employees if e["status"] == "active")
    return f"Employees ({len(employees)}, active payroll: ${total_payroll:,.0f}/yr):\n" + "\n".join(
        f"  - {e['name']} | {e['role']} | {e['dept']} | ${e['salary']:,.0f}/yr | {e['status']}"
        for e in employees
    )


# ---------------------------------------------------------------------------
# Analytics tools
# ---------------------------------------------------------------------------

@tool
def generate_financial_report(report_type: str = "summary") -> str:
    """Generate a financial report. Types: summary, balance_sheet, income_statement, cash_flow."""
    if report_type == "balance_sheet":
        return """
BALANCE SHEET — As of March 31, 2026

ASSETS
  Current Assets
    Cash & Equivalents          $1,245,000
    Accounts Receivable           $456,200
    Inventory                     $312,400
  Total Current Assets                        $2,013,600
  Fixed Assets                    $890,000
TOTAL ASSETS                                  $2,903,600

LIABILITIES
  Current Liabilities
    Accounts Payable              $234,500
    Short-term Loans              $150,000
  Total Current Liabilities                     $384,500
  Long-term Debt                  $520,000
TOTAL LIABILITIES                               $904,500

EQUITY
  Owner's Equity                $1,850,000
  Retained Earnings               $642,100
TOTAL EQUITY                                  $2,492,100

NOTE: Assets ($2,903,600) ≈ Liabilities + Equity ($3,396,600) — discrepancy due to unreconciled items.
"""
    elif report_type == "income_statement":
        return """
INCOME STATEMENT — FY 2026 (YTD through March)

REVENUE
  Service Revenue             $2,847,350

EXPENSES
  Payroll                       $580,000
  Operations                    $290,000
  Marketing                     $215,000
  Infrastructure                $185,000
  R&D                           $155,000
  Other                         $105,000
TOTAL EXPENSES                $1,530,000

NET INCOME                      $842,100
Profit Margin                      29.6%
"""
    elif report_type == "cash_flow":
        return """
CASH FLOW STATEMENT — March 2026

OPERATING ACTIVITIES
  Net Income                    $842,100
  Depreciation                   $45,000
  Change in AR                  -$23,400
  Change in AP                   $12,300
Net Cash from Operations        $876,000

INVESTING ACTIVITIES
  Equipment Purchases           -$65,000
  Software Investments          -$28,000
Net Cash from Investing         -$93,000

FINANCING ACTIVITIES
  Loan Repayment               -$50,000
Net Cash from Financing         -$50,000

NET CHANGE IN CASH              $733,000
"""
    else:
        return """
FINANCIAL SUMMARY — March 2026

Key Metrics:
  • Revenue: $2,847,350 (+12.5% YoY)
  • Net Profit: $842,100 (29.6% margin)
  • Cash Position: $1,245,000
  • Accounts Receivable: $456,200
  • Total Debt: $670,000

Highlights:
  ✅ Revenue growing steadily — Q1 on track for $3.4M annual run rate
  ⚠️  1 overdue invoice ($67,200 from Initech LLC — 16 days past due)
  ⚠️  2 inventory items below reorder level (MacBook Pro, ThinkPad)
  ✅ Payroll healthy — 9 active employees, $1.48M annual

Recommendations:
  1. Follow up on Initech LLC overdue invoice immediately
  2. Reorder laptops — procurement lead time is 2-3 weeks
  3. Consider accelerating AR collection — DSO trending upward
"""


@tool
def analyze_cash_flow(months: int = 3) -> str:
    """Analyze cash flow trends over the specified number of months."""
    return f"""
CASH FLOW ANALYSIS — Last {months} months

Month       | Inflows     | Outflows    | Net
------------|-------------|-------------|----------
January     | $186,000    | $120,000    | +$66,000
February    | $205,000    | $135,000    | +$70,000
March       | $237,000    | $128,000    | +$109,000

Summary:
  • Average monthly net cash flow: +$81,667
  • Trend: Improving (+65% from Jan to Mar)
  • Cash runway at current burn: 15.2 months
  • Largest outflow category: Payroll (38%)
  • Collection efficiency: 87% within 30 days
"""


@tool
def forecast_revenue(quarters: int = 4) -> str:
    """Forecast revenue for upcoming quarters based on current trends and pipeline."""
    return f"""
REVENUE FORECAST — Next {quarters} Quarters

Quarter     | Projected   | Confidence | Key Drivers
------------|-------------|------------|---------------------------
Q2 2026     | $820,000    | High       | Umbrella Corp + Wayne Ent. pipeline
Q3 2026     | $890,000    | Medium     | Expected renewals + new leads
Q4 2026     | $950,000    | Medium     | Holiday seasonality + expansion
Q1 2027     | $780,000    | Low        | Typical Q1 slowdown

Annual Projection: $3,440,000 (+20.8% vs FY2025)

Risks:
  • Initech LLC churn risk if overdue invoice not resolved
  • Market headwinds in enterprise spending
  • Need 2 new enterprise clients to hit Q3/Q4 targets

Opportunities:
  • Wayne Enterprises Phase 2 ($124K) in pipeline
  • Upsell Acme Corp to premium tier ($+15K/yr)
  • Expansion into EMEA market (est. $200K incremental)
"""
