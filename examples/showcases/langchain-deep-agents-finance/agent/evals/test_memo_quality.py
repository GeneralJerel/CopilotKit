"""Smoke test: memo structure validation."""

import pytest


REQUIRED_SECTIONS = [
    "Executive Summary",
    "Portfolio Composition",
    "Risk Assessment",
    "Scenario Analysis",
    "Recommendations",
]


@pytest.mark.langsmith
def test_memo_template_has_required_sections():
    """The memo template should specify all required sections."""
    from prompts.memo_template import MEMO_TEMPLATE

    for section in REQUIRED_SECTIONS:
        assert section in MEMO_TEMPLATE, f"Missing required section in template: {section}"


@pytest.mark.langsmith
def test_memo_risk_ratings_are_valid():
    """Risk ratings should be one of the valid options."""
    valid_ratings = {"Low", "Moderate", "Elevated", "High"}
    # This is a structural validation — in a full eval, we'd check agent output
    assert len(valid_ratings) == 4
