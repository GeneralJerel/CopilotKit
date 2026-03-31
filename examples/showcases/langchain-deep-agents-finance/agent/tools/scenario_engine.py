import random
import hashlib
from langchain.tools import tool
from typing import List, Dict, Any


SCENARIO_CONFIGS = {
    "recession": {
        "description": "Deep recession with GDP contracting 3-5%, unemployment rising to 8%, consumer spending declining sharply",
        "probability": 0.15,
        "sector_impacts": {
            "Technology": -0.22, "Financials": -0.28, "Healthcare": -0.08,
            "Energy": -0.18, "Consumer Discretionary": -0.30, "Consumer Staples": -0.05,
            "Utilities": -0.03, "Real Estate": -0.15, "Fixed Income": 0.06,
            "Commodities": -0.12, "International": -0.20, "Broad Market": -0.18,
        },
    },
    "rate_hike": {
        "description": "Federal Reserve raises rates by 150bp over 6 months to combat persistent inflation",
        "probability": 0.25,
        "sector_impacts": {
            "Technology": -0.12, "Financials": 0.05, "Healthcare": -0.04,
            "Energy": 0.02, "Consumer Discretionary": -0.10, "Consumer Staples": -0.03,
            "Utilities": -0.08, "Real Estate": -0.14, "Fixed Income": -0.10,
            "Commodities": 0.04, "International": -0.08, "Broad Market": -0.07,
        },
    },
    "sector_rotation": {
        "description": "Market rotates from growth to value — tech sells off while energy, financials, and industrials rally",
        "probability": 0.30,
        "sector_impacts": {
            "Technology": -0.18, "Financials": 0.12, "Healthcare": 0.04,
            "Energy": 0.15, "Consumer Discretionary": -0.08, "Consumer Staples": 0.06,
            "Utilities": 0.08, "Real Estate": 0.03, "Fixed Income": 0.02,
            "Commodities": 0.10, "International": 0.05, "Broad Market": -0.02,
        },
    },
}


@tool
def run_scenario_simulation(
    scenario_name: str, holdings: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Run a stress test scenario on the portfolio.
    scenario_name: one of 'recession', 'rate_hike', 'sector_rotation'
    holdings: list with ticker, weight, sector, beta, annualizedVolatility
    Returns scenario results with projected returns and impacted holdings.
    """
    config = SCENARIO_CONFIGS.get(scenario_name)
    if not config:
        return {"error": f"Unknown scenario: {scenario_name}. Use: recession, rate_hike, sector_rotation"}

    total_weight = sum(h.get("weight", 0) for h in holdings) or 1.0

    # Compute per-holding impact
    impacts = []
    for h in holdings:
        sector = h.get("sector", "Other")
        base_impact = config["sector_impacts"].get(sector, -0.10)
        beta = h.get("beta", 1.0)
        # Adjust by beta
        adjusted = base_impact * beta
        # Add some ticker-specific noise
        rng = random.Random(
            int(hashlib.md5(f"{scenario_name}:{h['ticker']}".encode()).hexdigest()[:8], 16)
        )
        noise = rng.uniform(-0.03, 0.03)
        final_impact = adjusted + noise

        impacts.append({
            "ticker": h["ticker"],
            "weight": h.get("weight", 0),
            "projectedChange": round(final_impact * 100, 1),
        })

    # Portfolio-level projected return (weighted)
    projected_return = sum(
        imp["projectedChange"] * imp["weight"] for imp in impacts
    ) / total_weight

    # VaR delta (simplified)
    var_delta = abs(projected_return) * 0.4

    # Sharpe delta (simplified)
    sharpe_delta = projected_return / 15  # rough approximation

    # Top impacted holdings (sorted by absolute impact)
    sorted_impacts = sorted(impacts, key=lambda x: abs(x["projectedChange"]), reverse=True)

    result = {
        "name": scenario_name,
        "description": config["description"],
        "projectedReturn": round(projected_return, 1),
        "varDelta": round(var_delta, 1),
        "sharpeDelta": round(sharpe_delta, 2),
        "probability": config["probability"],
        "impactedHoldings": [
            {"ticker": h["ticker"], "projectedChange": h["projectedChange"]}
            for h in sorted_impacts[:5]
        ],
    }

    print(f"[TOOL] run_scenario_simulation: {scenario_name} → {result['projectedReturn']}% return")
    return result
