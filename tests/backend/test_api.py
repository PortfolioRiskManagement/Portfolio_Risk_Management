"""Purpose: Validate Flask backend endpoints using deterministic unit/integration-style API tests."""

import json
from typing import Any

import pandas as pd

import app as app_module


class _FakeResponse:
    """Simple context-manager response object for mocked urlopen."""

    def __init__(self, payload: dict[str, Any]):
        self._payload = payload

    def read(self) -> bytes:
        return json.dumps(self._payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def test_health_endpoint_returns_healthy_status() -> None:
    """Health check should return HTTP 200 with healthy status payload."""
    client = app_module.app.test_client()

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "healthy"}


def test_analyze_portfolio_returns_success_with_mocked_analyzer(monkeypatch) -> None:
    """Portfolio analysis endpoint should return a successful payload when dependencies are mocked."""

    class _FakeAnalyzer:
        def __init__(self, portfolio_data, risk_tolerance, lookback_days):
            self.portfolio_data = portfolio_data
            self.risk_tolerance = risk_tolerance
            self.lookback_days = lookback_days

        def get_summary_report(self):
            return {
                "risk_tolerance": self.risk_tolerance,
                "lookback_days": self.lookback_days,
                "assets": len(self.portfolio_data),
            }

    monkeypatch.setattr(app_module, "PortfolioAnalyzer", _FakeAnalyzer)
    monkeypatch.setattr(
        app_module.PortfolioLoader,
        "create_mock_portfolio",
        staticmethod(lambda: pd.DataFrame([{"Ticker": "AAPL", "Weight": 0.6}, {"Ticker": "MSFT", "Weight": 0.4}])),
    )

    client = app_module.app.test_client()
    response = client.post("/api/portfolio/analyze", json={"risk_tolerance": "low", "lookback_days": 90})

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["data"]["risk_tolerance"] == "low"
    assert payload["data"]["lookback_days"] == 90
    assert payload["data"]["assets"] == 2


def test_search_endpoint_classifies_crypto_symbol(monkeypatch) -> None:
    """Search endpoint should classify crypto quotes correctly using mocked Yahoo Finance payload."""

    fake_payload = {
        "quotes": [
            {
                "symbol": "BTC-USD",
                "shortname": "Bitcoin USD",
                "quoteType": "CRYPTOCURRENCY",
                "exchange": "CCC",
            }
        ]
    }

    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse(fake_payload))

    client = app_module.app.test_client()
    response = client.get("/api/search?q=btc")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["results"][0]["symbol"] == "BTC-USD"
    assert payload["results"][0]["type"] == "crypto"
