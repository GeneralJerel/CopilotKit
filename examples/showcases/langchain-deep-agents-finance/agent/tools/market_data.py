import random
import hashlib
from langchain.tools import tool
from typing import List, Dict, Any


# Deterministic mock data seeded by ticker for consistent demos
SECTOR_BETAS = {
    "Technology": 1.25,
    "Financials": 1.15,
    "Healthcare": 0.85,
    "Energy": 1.10,
    "Consumer Discretionary": 1.20,
    "Consumer Staples": 0.65,
    "Utilities": 0.50,
    "Real Estate": 0.90,
    "Fixed Income": 0.20,
    "Commodities": 0.75,
    "International": 1.05,
    "Broad Market": 1.00,
}


def _seed(ticker: str) -> random.Random:
    seed = int(hashlib.md5(ticker.encode()).hexdigest()[:8], 16)
    return random.Random(seed)


@tool
def fetch_market_data(tickers: List[str]) -> List[Dict[str, Any]]:
    """Fetch market data for a list of tickers. Returns price, beta, volatility, and 24h change for each ticker."""
    results = []
    for ticker in tickers:
        rng = _seed(ticker)
        sector = _guess_sector(ticker)
        base_beta = SECTOR_BETAS.get(sector, 1.0)

        results.append({
            "ticker": ticker,
            "price": round(rng.uniform(20, 600), 2),
            "beta": round(base_beta + rng.uniform(-0.2, 0.2), 2),
            "annualizedVolatility": round(rng.uniform(0.12, 0.55), 3),
            "change24h": round(rng.uniform(-4.0, 4.0), 2),
            "volume": rng.randint(500_000, 50_000_000),
            "sector": sector,
        })

    print(f"[TOOL] fetch_market_data: {len(results)} tickers")
    return results


def _guess_sector(ticker: str) -> str:
    """Simple ticker-to-sector mapping for demo purposes."""
    mapping = {
        "AAPL": "Technology", "MSFT": "Technology", "NVDA": "Technology",
        "GOOGL": "Technology", "AMZN": "Consumer Discretionary",
        "JPM": "Financials", "V": "Financials",
        "UNH": "Healthcare", "JNJ": "Healthcare", "PFE": "Healthcare",
        "XOM": "Energy", "CVX": "Energy",
        "PG": "Consumer Staples", "KO": "Consumer Staples", "PEP": "Consumer Staples",
        "NEE": "Utilities", "DUK": "Utilities", "SO": "Utilities",
        "AMT": "Real Estate", "PLD": "Real Estate", "VNQ": "Real Estate",
        "BND": "Fixed Income", "TLT": "Fixed Income",
        "GLD": "Commodities",
        "VWO": "International", "IEFA": "International", "VXUS": "International",
        "VTI": "Broad Market",
    }
    return mapping.get(ticker, "Other")
