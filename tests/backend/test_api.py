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


def test_search_endpoint_rejects_empty_query() -> None:
    """Search without a query should fail fast with HTTP 400 and no outbound request."""
    response = app_module.app.test_client().get("/api/search?q=")

    assert response.status_code == 400
    assert response.get_json()["success"] is False


def test_search_endpoint_falls_back_to_query_when_no_results(monkeypatch) -> None:
    """When Yahoo returns no quotes, the endpoint should echo the query back as a stock."""
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse({"quotes": []}))

    response = app_module.app.test_client().get("/api/search?q=zzzz")

    assert response.status_code == 200
    assert response.get_json()["results"] == [{"symbol": "ZZZZ", "name": "ZZZZ", "type": "stock"}]


def test_search_endpoint_deduplicates_symbols(monkeypatch) -> None:
    """Duplicate symbols in the Yahoo payload should only appear once in the response."""
    quote = {"symbol": "AAPL", "shortname": "Apple Inc.", "quoteType": "EQUITY", "exchange": "NMS"}
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse({"quotes": [quote, quote]}))

    response = app_module.app.test_client().get("/api/search?q=aapl")

    assert len(response.get_json()["results"]) == 1


def test_quote_endpoint_requires_symbol() -> None:
    """Quote endpoint should return 400 when no symbol is supplied."""
    response = app_module.app.test_client().get("/api/quote")

    assert response.status_code == 400


def test_quote_endpoint_returns_price(monkeypatch) -> None:
    """Quote endpoint should return the regular market price from the mocked chart payload."""
    payload = {"chart": {"result": [{"meta": {"regularMarketPrice": 123.45}}]}}
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse(payload))

    response = app_module.app.test_client().get("/api/quote?symbol=aapl")

    assert response.status_code == 200
    assert response.get_json() == {
        "success": True,
        "symbol": "AAPL",
        "price": 123.45,
        "previousClose": None,
        "changePercent": None,
    }


def test_quote_endpoint_returns_daily_change(monkeypatch) -> None:
    """Quote endpoint should compute the % change from the previous close."""
    payload = {"chart": {"result": [{"meta": {"regularMarketPrice": 98.0, "chartPreviousClose": 100.0}}]}}
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse(payload))

    body = app_module.app.test_client().get("/api/quote?symbol=aapl").get_json()

    assert body["previousClose"] == 100.0
    assert body["changePercent"] == -2.0


def test_quote_endpoint_unknown_symbol_returns_404(monkeypatch) -> None:
    """Quote endpoint should return 404 when Yahoo has no chart result for the symbol."""
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse({"chart": {"result": []}}))

    response = app_module.app.test_client().get("/api/quote?symbol=nope")

    assert response.status_code == 404


def test_quote_endpoint_maps_crypto_to_usd_pair(monkeypatch) -> None:
    """Crypto tickers like BTC should be requested from Yahoo as BTC-USD."""
    requested = []

    def fake_urlopen(req, timeout=6):
        requested.append(req.full_url)
        return _FakeResponse({"chart": {"result": [{"meta": {"regularMarketPrice": 60000.0}}]}})

    monkeypatch.setattr(app_module, "urlopen", fake_urlopen)

    response = app_module.app.test_client().get("/api/quote?symbol=btc")

    assert response.status_code == 200
    assert "/chart/BTC-USD?" in requested[0]


def test_history_endpoint_returns_closes_and_drops_gaps(monkeypatch) -> None:
    """History endpoint should return daily closes in ms timestamps, skipping null closes."""
    payload = {"chart": {"result": [{
        "timestamp": [1000, 2000, 3000],
        "indicators": {"quote": [{"close": [10.0, None, 12.5]}]},
    }]}}
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse(payload))

    response = app_module.app.test_client().get("/api/history?symbol=aapl&days=7")

    assert response.status_code == 200
    assert response.get_json() == {
        "success": True,
        "symbol": "AAPL",
        "times": [1_000_000, 3_000_000],
        "prices": [10.0, 12.5],
    }


def test_history_endpoint_requires_symbol() -> None:
    """History endpoint should return 400 when no symbol is supplied."""
    response = app_module.app.test_client().get("/api/history")

    assert response.status_code == 400


def test_analyze_rejects_invalid_lookback_days() -> None:
    """Non-positive or non-integer lookback_days should be rejected with a clear 400 message."""
    client = app_module.app.test_client()

    for bad in (-5, 0, "ninety", 1.5, True):
        response = client.post("/api/portfolio/analyze", json={"lookback_days": bad})
        assert response.status_code == 400, bad
        assert "lookback_days" in response.get_json()["error"]


def test_analyze_rejects_invalid_risk_tolerance() -> None:
    """risk_tolerance must be a non-empty string."""
    client = app_module.app.test_client()

    for bad in (123, "", "   ", None):
        response = client.post("/api/portfolio/analyze", json={"risk_tolerance": bad})
        assert response.status_code == 400, bad
        assert "risk_tolerance" in response.get_json()["error"]


def test_scenario_requires_holdings_and_scenario_id() -> None:
    """Scenario endpoint should validate required fields before doing any work."""
    client = app_module.app.test_client()

    no_holdings = client.post("/api/scenario/calculate", json={"scenarioId": "2008-financial-crisis"})
    no_scenario = client.post("/api/scenario/calculate", json={"holdings": [{"symbol": "AAPL", "currentValue": 100}]})

    assert no_holdings.status_code == 400
    assert "holdings" in no_holdings.get_json()["error"].lower()
    assert no_scenario.status_code == 400
    assert "scenarioId" in no_scenario.get_json()["error"]


def test_scenario_unknown_id_returns_400() -> None:
    """An unknown scenarioId should be reported as a client error."""
    response = app_module.app.test_client().post(
        "/api/scenario/calculate",
        json={"holdings": [{"symbol": "AAPL", "currentValue": 100}], "scenarioId": "bogus"},
    )

    assert response.status_code == 400
    assert "Unknown scenario" in response.get_json()["error"]


def test_scenario_success_with_mocked_service(monkeypatch) -> None:
    """Scenario endpoint should wrap the service result in a success payload."""
    monkeypatch.setattr(
        app_module.scenario_service, "calculate_scenario", lambda holdings, scenario_id: {"totalReturn": -12.5}
    )

    response = app_module.app.test_client().post(
        "/api/scenario/calculate",
        json={"holdings": [{"symbol": "AAPL", "currentValue": 100}], "scenarioId": "2008-financial-crisis"},
    )

    assert response.status_code == 200
    assert response.get_json() == {"success": True, "data": {"totalReturn": -12.5}}


def test_cors_preflight_returns_204() -> None:
    """OPTIONS preflight requests from the frontend origin should succeed without a body."""
    response = app_module.app.test_client().open(
        "/api/search", method="OPTIONS", headers={"Origin": "http://localhost:5173"}
    )

    assert response.status_code == 204


def test_unknown_route_returns_404() -> None:
    """Undefined routes should return 404."""
    assert app_module.app.test_client().get("/api/nope").status_code == 404
