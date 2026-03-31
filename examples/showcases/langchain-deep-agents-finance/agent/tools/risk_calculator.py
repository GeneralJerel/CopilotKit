import math
from langchain.tools import tool
from typing import List, Dict, Any


@tool
def compute_risk_metrics(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute aggregate risk metrics for a portfolio.
    Each holding should have: ticker, weight, beta, annualizedVolatility, sector.
    Returns: overallScore, beta, sharpe, varDaily, and breakdown by risk category.
    """
    if not holdings:
        return {"error": "No holdings provided"}

    # Portfolio beta (weighted)
    total_weight = sum(h.get("weight", 0) for h in holdings)
    if total_weight == 0:
        total_weight = 1.0

    portfolio_beta = sum(
        h.get("weight", 0) * h.get("beta", 1.0) for h in holdings
    ) / total_weight

    # Portfolio volatility (simplified — weighted average, not covariance-based)
    portfolio_vol = sum(
        h.get("weight", 0) * h.get("annualizedVolatility", 0.2) for h in holdings
    ) / total_weight

    # Daily VaR (95%, assuming normal distribution)
    daily_vol = portfolio_vol / math.sqrt(252)
    var_95 = daily_vol * 1.645  # 95% confidence

    # Sharpe ratio (assuming 5% risk-free rate, 10% expected return)
    expected_return = 0.10
    risk_free = 0.05
    sharpe = (expected_return - risk_free) / portfolio_vol if portfolio_vol > 0 else 0

    # Sector concentration (HHI)
    sector_weights: Dict[str, float] = {}
    for h in holdings:
        sector = h.get("sector", "Other")
        sector_weights[sector] = sector_weights.get(sector, 0) + h.get("weight", 0)
    hhi = sum((w / total_weight) ** 2 for w in sector_weights.values())

    # Risk breakdown
    market_risk = min(100, int(portfolio_beta * 45))
    concentration_risk = min(100, int(hhi * 300))
    volatility_risk = min(100, int(portfolio_vol * 200))
    liquidity_risk = max(10, min(60, 50 - len(holdings)))  # More holdings = lower
    correlation_risk = min(100, int(hhi * 200 + portfolio_vol * 50))

    breakdown = [
        {
            "category": "Market Risk",
            "score": market_risk,
            "weight": 0.30,
            "detail": f"Portfolio beta of {portfolio_beta:.2f} indicates {'high' if portfolio_beta > 1.1 else 'moderate' if portfolio_beta > 0.9 else 'low'} market sensitivity.",
        },
        {
            "category": "Concentration Risk",
            "score": concentration_risk,
            "weight": 0.25,
            "detail": f"HHI of {hhi:.3f} across {len(sector_weights)} sectors. {'High' if hhi > 0.2 else 'Moderate' if hhi > 0.1 else 'Low'} concentration.",
        },
        {
            "category": "Volatility Risk",
            "score": volatility_risk,
            "weight": 0.20,
            "detail": f"Annualized portfolio volatility of {portfolio_vol:.1%}.",
        },
        {
            "category": "Liquidity Risk",
            "score": liquidity_risk,
            "weight": 0.10,
            "detail": f"Portfolio has {len(holdings)} holdings. Larger position count generally improves liquidity.",
        },
        {
            "category": "Correlation Risk",
            "score": correlation_risk,
            "weight": 0.15,
            "detail": f"Cross-sector correlation indicates {'limited' if hhi < 0.1 else 'moderate' if hhi < 0.2 else 'significant'} diversification benefit.",
        },
    ]

    # Weighted overall score
    overall = sum(b["score"] * b["weight"] for b in breakdown)

    recommendation = _generate_recommendation(overall, breakdown, sector_weights, total_weight)

    result = {
        "overallScore": round(overall),
        "beta": round(portfolio_beta, 2),
        "sharpe": round(sharpe, 2),
        "varDaily": round(var_95 * 100, 2),  # as percentage
        "breakdown": breakdown,
        "recommendation": recommendation,
    }

    print(f"[TOOL] compute_risk_metrics: score={result['overallScore']}, beta={result['beta']}")
    return result


def _generate_recommendation(score: float, breakdown: list, sectors: dict, total_weight: float) -> str:
    top_sector = max(sectors, key=sectors.get)
    top_pct = (sectors[top_sector] / total_weight) * 100

    if score > 70:
        return (
            f"Portfolio risk is elevated at {score:.0f}/100. "
            f"Consider reducing {top_sector} exposure (currently {top_pct:.0f}% of portfolio) "
            f"and increasing allocation to defensive sectors like Utilities or Fixed Income."
        )
    elif score > 50:
        return (
            f"Portfolio risk is moderate at {score:.0f}/100. "
            f"{top_sector} is your largest sector at {top_pct:.0f}%. "
            f"Monitor concentration and consider rebalancing if any single sector exceeds 30%."
        )
    else:
        return (
            f"Portfolio risk is well-managed at {score:.0f}/100. "
            f"Good diversification across sectors. Continue monitoring for drift."
        )
