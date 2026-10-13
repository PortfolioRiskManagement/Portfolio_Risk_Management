"""Purpose: Cover API edge cases, scenario data integrity, and boundary values for the analytics code with parametrized tests."""

import datetime as dt
import json
import re
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

import app as app_module
from dataload import portfolio_analyzer
from dataload.data_loader import PortfolioLoader
from dataload.portfolio_analyzer import PortfolioAnalyzer
from scenario_service import ScenarioService

ROOT = Path(__file__).resolve().parents[2]
SCENARIO_IDS = sorted(ScenarioService.SCENARIOS)


class _FakeResponse:
    """Context-manager response object for a mocked urlopen."""

    def __init__(self, payload):
        self._payload = payload

    def read(self) -> bytes:
        return json.dumps(self._payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


@pytest.fixture
def client():
    return app_module.app.test_client()


def _prices(tickers, days=300, seed=11) -> pd.DataFrame:
    """Deterministic random-walk prices shaped like yfinance's MultiIndex output."""
    rng = np.random.default_rng(seed)
    index = pd.bdate_range("2024-01-01", periods=days)
    closes = {t: 100 * np.cumprod(1 + rng.normal(0.0004, 0.01 * (i + 1), days)) for i, t in enumerate(tickers)}
    return pd.concat({"Adj Close": pd.DataFrame(closes, index=index)}, axis=1)


def _analyzer(monkeypatch, weights: dict) -> PortfolioAnalyzer:
    monkeypatch.setattr(portfolio_analyzer.yf, "download", lambda *a, **k: _prices(list(weights)))
    return PortfolioAnalyzer(weights)


def _search(client, monkeypatch, quotes, query="x"):
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse({"quotes": quotes}))
    return client.get(f"/api/search?q={query}")


# ---------- Search: asset classification ----------

@pytest.mark.parametrize(
    "quote, expected",
    [
        ({"symbol": "AAPL", "quoteType": "EQUITY", "exchange": "NMS"}, "stock"),
        ({"symbol": "VTI", "quoteType": "ETF", "exchange": "PCX"}, "etf"),
        ({"symbol": "VFIAX", "quoteType": "MUTUALFUND", "exchange": "NAS"}, "bond"),
        ({"symbol": "SPAXX", "quoteType": "MONEY MARKET", "exchange": "NAS"}, "bond"),
        ({"symbol": "BTC-USD", "quoteType": "CRYPTOCURRENCY", "exchange": "CCC"}, "crypto"),
        ({"symbol": "ETH-USD", "quoteType": "EQUITY", "exchange": "CCC"}, "crypto"),
        ({"symbol": "ZC=F", "quoteType": "FUTURE", "exchange": "CBT"}, "commodity"),
        ({"symbol": "GC=F", "quoteType": "FUTURE", "exchange": "CMX"}, "commodity"),
        ({"symbol": "CL=F", "quoteType": "FUTURE", "exchange": "NYM"}, "commodity"),
    ],
)
def test_search_classifies_each_asset_type(client, monkeypatch, quote, expected) -> None:
    response = _search(client, monkeypatch, [quote])

    assert response.get_json()["results"][0]["type"] == expected


# ---------- Search: result shaping and failure handling ----------

def test_search_returns_at_most_ten_results(client, monkeypatch) -> None:
    quotes = [{"symbol": f"S{i}", "quoteType": "EQUITY"} for i in range(15)]

    assert len(_search(client, monkeypatch, quotes).get_json()["results"]) == 10


def test_search_uppercases_and_trims_symbols(client, monkeypatch) -> None:
    results = _search(client, monkeypatch, [{"symbol": "  msft ", "quoteType": "EQUITY"}]).get_json()["results"]

    assert results[0]["symbol"] == "MSFT"


def test_search_skips_quotes_without_a_symbol(client, monkeypatch) -> None:
    quotes = [{"quoteType": "EQUITY"}, {"symbol": "", "quoteType": "EQUITY"}, {"symbol": "KO", "quoteType": "EQUITY"}]

    assert [r["symbol"] for r in _search(client, monkeypatch, quotes).get_json()["results"]] == ["KO"]


def test_search_name_falls_back_from_shortname_to_longname_to_symbol(client, monkeypatch) -> None:
    quotes = [
        {"symbol": "AAA", "shortname": "Short", "longname": "Long"},
        {"symbol": "BBB", "longname": "Only Long"},
        {"symbol": "CCC"},
    ]

    names = [r["name"] for r in _search(client, monkeypatch, quotes).get_json()["results"]]

    assert names == ["Short", "Only Long", "CCC"]


def test_search_url_encodes_the_query(client, monkeypatch) -> None:
    seen = {}

    def fake_urlopen(req, timeout=6):
        seen["url"] = req.full_url
        return _FakeResponse({"quotes": []})

    monkeypatch.setattr(app_module, "urlopen", fake_urlopen)
    client.get("/api/search?q=hello world")

    assert "q=hello%20world" in seen["url"]


def test_search_reports_upstream_failure_as_400(client, monkeypatch) -> None:
    def boom(req, timeout=6):
        raise OSError("network down")

    monkeypatch.setattr(app_module, "urlopen", boom)
    response = client.get("/api/search?q=aapl")

    assert response.status_code == 400
    assert response.get_json()["success"] is False


# ---------- Quote ----------

def test_quote_reports_missing_price_as_404(client, monkeypatch) -> None:
    payload = {"chart": {"result": [{"meta": {}}]}}
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse(payload))

    assert client.get("/api/quote?symbol=aapl").status_code == 404


def test_quote_reports_upstream_failure_as_400(client, monkeypatch) -> None:
    def boom(req, timeout=6):
        raise OSError("timeout")

    monkeypatch.setattr(app_module, "urlopen", boom)

    assert client.get("/api/quote?symbol=aapl").status_code == 400


def test_quote_returns_price_as_a_number(client, monkeypatch) -> None:
    payload = {"chart": {"result": [{"meta": {"regularMarketPrice": 10}}]}}
    monkeypatch.setattr(app_module, "urlopen", lambda req, timeout=6: _FakeResponse(payload))

    assert client.get("/api/quote?symbol=x").get_json()["price"] == 10.0


# ---------- Portfolio analysis route ----------

def test_analyze_passes_user_supplied_portfolio_to_the_analyzer(client, monkeypatch) -> None:
    seen = {}

    class _Spy:
        def __init__(self, portfolio_data, risk_tolerance, lookback_days):
            seen["frame"] = portfolio_data

        def get_summary_report(self):
            return {}

    monkeypatch.setattr(app_module, "PortfolioAnalyzer", _Spy)
    rows = [{"Ticker": "KO", "Weight": 0.5}, {"Ticker": "PEP", "Weight": 0.5}]
    client.post("/api/portfolio/analyze", json={"portfolio_data": rows})

    assert seen["frame"]["Ticker"].tolist() == ["KO", "PEP"]


def test_analyze_uses_documented_defaults(client, monkeypatch) -> None:
    seen = {}

    class _Spy:
        def __init__(self, portfolio_data, risk_tolerance, lookback_days):
            seen.update(risk=risk_tolerance, days=lookback_days)

        def get_summary_report(self):
            return {}

    monkeypatch.setattr(app_module, "PortfolioAnalyzer", _Spy)
    monkeypatch.setattr(PortfolioLoader, "create_mock_portfolio", staticmethod(lambda: pd.DataFrame({"Ticker": ["A"], "Weight": [1.0]})))
    client.post("/api/portfolio/analyze", json={})

    assert seen == {"risk": "medium", "days": 504}


def test_analyze_reports_analyzer_failure_as_400(client, monkeypatch) -> None:
    class _Broken:
        def __init__(self, *args, **kwargs):
            raise ValueError("Portfolio weights must sum to ~1.0")

    monkeypatch.setattr(app_module, "PortfolioAnalyzer", _Broken)
    monkeypatch.setattr(PortfolioLoader, "create_mock_portfolio", staticmethod(lambda: pd.DataFrame({"Ticker": ["A"], "Weight": [1.0]})))
    response = client.post("/api/portfolio/analyze", json={})

    assert response.status_code == 400
    assert "weights" in response.get_json()["error"]


def test_analyze_accepts_a_request_with_no_json_body(client, monkeypatch) -> None:
    class _Spy:
        def __init__(self, *args, **kwargs):
            pass

        def get_summary_report(self):
            return {"ok": True}

    monkeypatch.setattr(app_module, "PortfolioAnalyzer", _Spy)
    monkeypatch.setattr(PortfolioLoader, "create_mock_portfolio", staticmethod(lambda: pd.DataFrame({"Ticker": ["A"], "Weight": [1.0]})))

    assert client.post("/api/portfolio/analyze").status_code == 200


def test_mock_portfolio_endpoint_returns_weights_that_sum_to_one(client, monkeypatch) -> None:
    monkeypatch.setattr(PortfolioLoader, "get_sector", staticmethod(lambda t: "X"))
    weights = client.get("/api/mock-portfolio").get_json()

    assert len(weights) == 7
    assert sum(weights.values()) == pytest.approx(1.0)


# ---------- Scenario route ----------

def test_scenario_rejects_an_empty_holdings_list(client) -> None:
    response = client.post("/api/scenario/calculate", json={"holdings": [], "scenarioId": "2008-financial-crisis"})

    assert response.status_code == 400


def test_scenario_reports_service_failure_as_400(client, monkeypatch) -> None:
    def boom(holdings, scenario_id):
        raise RuntimeError("download failed")

    monkeypatch.setattr(app_module.scenario_service, "calculate_scenario", boom)
    response = client.post(
        "/api/scenario/calculate",
        json={"holdings": [{"symbol": "AAPL", "currentValue": 100}], "scenarioId": "2008-financial-crisis"},
    )

    assert response.status_code == 400
    assert "download failed" in response.get_json()["error"]


# ---------- CORS and methods ----------

def test_cors_allows_the_local_frontend_origin(client) -> None:
    response = client.get("/api/health", headers={"Origin": "http://localhost:5173"})

    assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:5173"


def test_cors_does_not_allow_unknown_origins(client) -> None:
    response = client.get("/api/health", headers={"Origin": "https://evil.example"})

    assert "Access-Control-Allow-Origin" not in response.headers


def test_health_endpoint_rejects_post(client) -> None:
    assert client.post("/api/health").status_code == 405


# ---------- Scenario definitions: every scenario must be well formed ----------

@pytest.mark.parametrize("scenario_id", SCENARIO_IDS)
def test_scenario_starts_before_it_ends(scenario_id) -> None:
    scenario = ScenarioService.SCENARIOS[scenario_id]

    assert dt.date.fromisoformat(scenario["start"]) < dt.date.fromisoformat(scenario["end"])


@pytest.mark.parametrize("scenario_id", SCENARIO_IDS)
def test_scenario_lies_entirely_in_the_past(scenario_id) -> None:
    assert dt.date.fromisoformat(ScenarioService.SCENARIOS[scenario_id]["end"]) < dt.date.today()


@pytest.mark.parametrize("scenario_id", SCENARIO_IDS)
def test_scenario_has_a_display_name(scenario_id) -> None:
    assert ScenarioService.SCENARIOS[scenario_id]["name"].strip()


def test_backend_and_frontend_agree_on_scenario_ids() -> None:
    types_file = ROOT / "finai-dashboard/src/features/scenario/types/scenario.types.ts"
    frontend_ids = set(re.findall(r"id:\s*'([a-z0-9-]+)'", types_file.read_text()))

    assert frontend_ids == set(SCENARIO_IDS)


# ---------- Risk alignment: all nine tolerance and volatility combinations ----------

@pytest.mark.parametrize("volatility, label", [(0.05, "low"), (0.12, "medium"), (0.30, "high")])
@pytest.mark.parametrize("tolerance", ["low", "medium", "high"])
def test_risk_alignment_for_every_combination(monkeypatch, volatility, label, tolerance) -> None:
    analyzer = _analyzer(monkeypatch, {"AAA": 0.5, "BBB": 0.5})
    analyzer.volatility = volatility
    analyzer.risk_tolerance = tolerance

    result = analyzer._risk_alignment()

    assert result["portfolio_risk_classification"] == label
    assert result["status"] == ("aligned" if label == tolerance else "misaligned")


# ---------- Risk concentration ----------

@pytest.mark.parametrize("top_n", [1, 2, 5])
def test_risk_concentration_honours_top_n(monkeypatch, top_n) -> None:
    analyzer = _analyzer(monkeypatch, {t: 0.2 for t in ["AAA", "BBB", "CCC", "DDD", "EEE"]})

    assert len(analyzer._risk_concentration(top_n=top_n)["top_contributors"]) == top_n


# ---------- Diversification score ----------

@pytest.mark.parametrize(
    "weights, expected_score",
    [
        ({"AAA": 0.5, "BBB": 0.5}, 100.0),
        ({"AAA": 0.25, "BBB": 0.25, "CCC": 0.25, "DDD": 0.25}, 100.0),
        ({"AAA": 0.7, "BBB": 0.3}, 86.2069),
        ({"AAA": 0.9, "BBB": 0.1}, 60.9756),
    ],
)
def test_diversification_score_for_known_weights(monkeypatch, weights, expected_score) -> None:
    analyzer = _analyzer(monkeypatch, weights)

    assert analyzer._diversification_score()["diversification_score"] == pytest.approx(expected_score, abs=1e-3)


# ---------- Maximum drawdown ----------

@pytest.mark.parametrize(
    "values, initial, expected",
    [
        ([100, 50], 100, -50.0),
        ([100, 120], 100, 0.0),
        ([80, 90], 100, -20.0),
        ([1000, 500, 2000], 1000, -50.0),
        ([50], 200, -75.0),
    ],
)
def test_max_drawdown_for_known_series(values, initial, expected) -> None:
    assert ScenarioService()._calculate_max_drawdown(values, initial) == pytest.approx(expected)


# ---------- Portfolio loader tolerance ----------

@pytest.mark.parametrize("total, accepted", [(0.995, True), (1.005, True), (0.98, False), (1.02, False)])
def test_from_dict_weight_tolerance(monkeypatch, total, accepted) -> None:
    monkeypatch.setattr(PortfolioLoader, "get_sector", staticmethod(lambda t: "X"))
    weights = {"AAA": total / 2, "BBB": total / 2}

    if accepted:
        assert len(PortfolioLoader.from_dict(weights)) == 2
    else:
        with pytest.raises(ValueError):
            PortfolioLoader.from_dict(weights)


# ---------- Symbol normalisation ----------

@pytest.mark.parametrize(
    "symbol, asset_class, expected",
    [
        ("sol", "crypto", "SOL-USD"),
        ("DOGE", "crypto", "DOGE-USD"),
        ("xrp", "crypto", "XRP-USD"),
        ("ada", "crypto", "ADA-USD"),
        ("BNB", "crypto", "BNB-USD"),
        ("tsla", "stock", "TSLA"),
        ("gld", "commodity", "GLD"),
    ],
)
def test_normalize_symbol_for_known_assets(symbol, asset_class, expected) -> None:
    assert ScenarioService()._normalize_symbol(symbol, asset_class) == expected


# ---------- Inception dates ----------

@pytest.mark.parametrize(
    "symbol, end_date, before_inception",
    [
        ("ETH-USD", "2017-01-01", True),
        ("ETH-USD", "2018-01-01", False),
        ("SOL-USD", "2020-03-23", True),
        ("TSLA", "2010-01-01", True),
        ("SPY", "2000-01-01", False),
    ],
)
def test_inception_boundaries(symbol, end_date, before_inception) -> None:
    assert ScenarioService()._is_before_symbol_inception(symbol, "1990-01-01", end_date) is before_inception
