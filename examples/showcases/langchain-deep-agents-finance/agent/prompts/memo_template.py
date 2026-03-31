MEMO_TEMPLATE = """
Generate a structured investment memo with these sections:

## Executive Summary
- Portfolio overview (holdings count, total sectors, key characteristics)
- Overall risk rating with brief justification
- Top-level recommendation (1-2 sentences)

## Portfolio Composition
- Sector allocation breakdown with percentages
- Top 5 holdings by weight
- Notable concentration points

## Risk Assessment
- Overall risk score and category (Low/Moderate/Elevated/High)
- Breakdown by risk factor (Market, Concentration, Volatility, Liquidity, Correlation)
- Key risk drivers and mitigating factors

## Scenario Analysis
- Summary of each stress test (recession, rate hike, sector rotation)
- Comparative impact metrics
- Worst-case scenario implications

## Recommendations
- Specific, actionable portfolio adjustments
- Which positions to increase, reduce, or exit (with target weights)
- Timeline for recommended changes
- Expected impact of recommendations on risk profile

Format each section as clear, professional prose suitable for a CIO audience.
The recommendation should reference specific tickers and weight changes.
"""
