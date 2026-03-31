import os
import pytest
from dotenv import load_dotenv

load_dotenv()


@pytest.fixture(autouse=True)
def _langsmith_env():
    """Ensure LangSmith tracing is configured for eval runs."""
    os.environ.setdefault("LANGSMITH_TRACING", "true")
    os.environ.setdefault("LANGSMITH_PROJECT", "finsight-evals")
