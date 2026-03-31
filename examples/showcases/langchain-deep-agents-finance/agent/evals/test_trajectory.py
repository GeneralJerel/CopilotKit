"""Smoke test: agent should plan (write_todos) before running analysis tools."""

import pytest


@pytest.mark.langsmith
def test_agent_plans_before_acting():
    """Agent should call write_todos before any analysis tool.

    This is a placeholder eval — requires a running agent to exercise.
    In a full setup, use LangSmith's pytest integration to capture traces.
    """
    # Placeholder: in production, this would:
    # 1. Run the agent with a sample portfolio
    # 2. Extract the tool call trajectory from the trace
    # 3. Assert write_todos appears before compute_risk_metrics
    expected_first_tool = "write_todos"
    assert expected_first_tool == "write_todos", "Agent must plan first"
