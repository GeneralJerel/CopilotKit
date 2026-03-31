import math
import hashlib
from langchain.tools import tool
from typing import List, Dict, Any


@tool
def compute_correlations(tickers: List[str], sectors: List[str]) -> Dict[str, Any]:
    """
    Compute pairwise correlation matrix for a set of tickers.
    Uses sector-based heuristic for demo purposes.
    tickers: list of ticker symbols
    sectors: corresponding list of sectors for each ticker
    Returns: { tickers, matrix } where matrix[i][j] is the correlation between tickers[i] and tickers[j].
    """
    n = len(tickers)
    matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i == j:
                matrix[i][j] = 1.0
            elif j > i:
                corr = _estimate_correlation(tickers[i], sectors[i], tickers[j], sectors[j])
                matrix[i][j] = corr
                matrix[j][i] = corr

    print(f"[TOOL] compute_correlations: {n}x{n} matrix")
    return {"tickers": tickers, "matrix": matrix}


def _estimate_correlation(ticker_a: str, sector_a: str, ticker_b: str, sector_b: str) -> float:
    """
    Estimate correlation between two assets based on sector similarity + deterministic noise.
    Same sector = higher base correlation, different sector = lower.
    """
    # Deterministic seed from ticker pair
    pair = "".join(sorted([ticker_a, ticker_b]))
    seed = int(hashlib.md5(pair.encode()).hexdigest()[:8], 16)

    # Base correlation by sector relationship
    if sector_a == sector_b:
        base = 0.75
    elif _sector_group(sector_a) == _sector_group(sector_b):
        base = 0.45
    else:
        base = 0.15

    # Add deterministic noise
    noise = (seed % 1000) / 1000 * 0.3 - 0.15  # [-0.15, 0.15]
    corr = max(-0.5, min(0.99, base + noise))

    return round(corr, 2)


def _sector_group(sector: str) -> str:
    """Group sectors into broader categories."""
    groups = {
        "Technology": "growth",
        "Consumer Discretionary": "growth",
        "Financials": "cyclical",
        "Energy": "cyclical",
        "Commodities": "cyclical",
        "Healthcare": "defensive",
        "Consumer Staples": "defensive",
        "Utilities": "defensive",
        "Real Estate": "income",
        "Fixed Income": "income",
        "International": "global",
        "Broad Market": "broad",
    }
    return groups.get(sector, "other")
