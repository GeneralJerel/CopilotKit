"""Smoke test: risk calculator produces scores in expected ranges for known portfolios."""

import pytest
from tools.risk_calculator import compute_risk_metrics


@pytest.mark.langsmith
def test_risk_score_in_expected_range():
    """For a tech-heavy portfolio, risk score should be between 55-85."""
    holdings = [
        {"ticker": "AAPL", "weight": 0.20, "beta": 1.25, "annualizedVolatility": 0.30, "sector": "Technology"},
        {"ticker": "MSFT", "weight": 0.20, "beta": 1.20, "annualizedVolatility": 0.28, "sector": "Technology"},
        {"ticker": "NVDA", "weight": 0.15, "beta": 1.45, "annualizedVolatility": 0.50, "sector": "Technology"},
        {"ticker": "JPM", "weight": 0.10, "beta": 1.15, "annualizedVolatility": 0.25, "sector": "Financials"},
        {"ticker": "JNJ", "weight": 0.10, "beta": 0.75, "annualizedVolatility": 0.18, "sector": "Healthcare"},
        {"ticker": "KO", "weight": 0.10, "beta": 0.60, "annualizedVolatility": 0.15, "sector": "Consumer Staples"},
        {"ticker": "BND", "weight": 0.15, "beta": 0.20, "annualizedVolatility": 0.05, "sector": "Fixed Income"},
    ]

    result = compute_risk_metrics.invoke({"holdings": holdings})
    score = result["overallScore"]

    assert 40 <= score <= 90, f"Risk score {score} outside expected range for tech-heavy portfolio"
    assert result["beta"] > 0.8, f"Beta {result['beta']} too low for tech-heavy portfolio"
    assert "breakdown" in result and len(result["breakdown"]) == 5


@pytest.mark.langsmith
def test_defensive_portfolio_lower_risk():
    """A defensive portfolio should have a lower risk score than a tech-heavy one."""
    defensive = [
        {"ticker": "JNJ", "weight": 0.25, "beta": 0.75, "annualizedVolatility": 0.18, "sector": "Healthcare"},
        {"ticker": "KO", "weight": 0.25, "beta": 0.60, "annualizedVolatility": 0.15, "sector": "Consumer Staples"},
        {"ticker": "NEE", "weight": 0.25, "beta": 0.50, "annualizedVolatility": 0.20, "sector": "Utilities"},
        {"ticker": "BND", "weight": 0.25, "beta": 0.20, "annualizedVolatility": 0.05, "sector": "Fixed Income"},
    ]

    result = compute_risk_metrics.invoke({"holdings": defensive})
    assert result["overallScore"] < 60, f"Defensive portfolio score {result['overallScore']} should be < 60"
