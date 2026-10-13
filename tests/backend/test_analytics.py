"""Purpose: Unit-test the risk analytics engine, portfolio loader, and scenario helpers with synthetic, offline data."""

import numpy as np
import pandas as pd
import pytest

from dataload import data_loader, portfolio_analyzer
from dataload.data_loader import PortfolioLoader
from dataload.portfolio_analyzer import PortfolioAnalyzer
from scenario_service import ScenarioService

TICKERS = ["AAA", "BBB", "CCC", "DDD", "EEE"]
EQUAL_WEIGHTS = {t: 0.2 for t in TICKERS}


def _fake_prices(tickers=TICKERS, days=300, seed=7) -> pd.DataFrame:
    """Build a deterministic random-walk price table shaped like yfinance's MultiIndex output."""
    rng = np.random.default_rng(seed)
    index = pd.bdate_range("2024-01-01", periods=days)
    closes = {t: 100 * np.cumprod(1 + rng.normal(0.0004, 0.01 * (i + 1), days)) for i, t in enumerate(tickers)}
    frame = pd.DataFrame(closes, index=index)
    return pd.concat({"Adj Close": frame}, axis=1)


@pytest.fixture
def analyzer(monkeypatch) -> PortfolioAnalyzer:
    """A real PortfolioAnalyzer fed by fake prices instead of Yahoo Finance."""
    monkeypatch.setattr(portfolio_analyzer.yf, "download", lambda *a, **k: _fake_prices())
    return PortfolioAnalyzer(EQUAL_WEIGHTS, risk_tolerance="Medium")


# ---------- PortfolioAnalyzer: input handling ----------

def test_analyzer_rejects_weights_that_do_not_sum_to_one(monkeypatch) -> None:
    monkeypatch.setattr(portfolio_analyzer.yf, "download", lambda *a, **k: _fake_prices())
    with pytest.raises(ValueError, match="sum"):
        PortfolioAnalyzer({"AAA": 0.5, "BBB": 0.2})


def test_analyzer_rejects_unsupported_portfolio_type() -> None:
    with pytest.raises(TypeError):
        PortfolioAnalyzer(["AAA", "BBB"])


def test_analyzer_accepts_dataframe_and_dict_equally(monkeypatch) -> None:
    monkeypatch.setattr(portfolio_analyzer.yf, "download", lambda *a, **k: _fake_prices())
    frame = pd.DataFrame({"Ticker": TICKERS, "Weight": [0.2] * 5})

    from_frame = PortfolioAnalyzer(frame)
    from_dict = PortfolioAnalyzer(EQUAL_WEIGHTS)

    assert from_frame.volatility == pytest.approx(from_dict.volatility)


def test_analyzer_normalises_risk_tolerance_case(analyzer) -> None:
    assert analyzer.risk_tolerance == "medium"


def test_analyzer_raises_when_price_columns_missing(monkeypatch) -> None:
    bad = pd.concat({"Volume": _fake_prices()["Adj Close"]}, axis=1)
    monkeypatch.setattr(portfolio_analyzer.yf, "download", lambda *a, **k: bad)
    with pytest.raises(ValueError, match="Close"):
        PortfolioAnalyzer(EQUAL_WEIGHTS)


def test_analyzer_falls_back_to_close_when_adj_close_missing(monkeypatch) -> None:
    closes = pd.concat({"Close": _fake_prices()["Adj Close"]}, axis=1)
    monkeypatch.setattr(portfolio_analyzer.yf, "download", lambda *a, **k: closes)
    assert PortfolioAnalyzer(EQUAL_WEIGHTS).volatility > 0


# ---------- PortfolioAnalyzer: metrics ----------

def test_volatility_is_positive_and_drawdown_is_not_positive(analyzer) -> None:
    assert analyzer.volatility > 0
    assert analyzer.max_drawdown <= 0


def test_individual_volatility_covers_every_asset(analyzer) -> None:
    assert set(analyzer.individual_volatility) == set(TICKERS)
    assert all(v > 0 for v in analyzer.individual_volatility.values())


def test_sharpe_ratio_is_a_finite_float(analyzer) -> None:
    sharpe = analyzer._sharpe_ratio()
    assert isinstance(sharpe, float)
    assert np.isfinite(sharpe)


@pytest.mark.parametrize(
    "volatility, expected",
    [(0.05, "low"), (0.099, "low"), (0.10, "medium"), (0.149, "medium"), (0.15, "high"), (0.40, "high")],
)
def test_risk_classification_thresholds(analyzer, volatility, expected) -> None:
    analyzer.volatility = volatility
    assert analyzer._classify_risk() == expected


def test_risk_alignment_aligned_and_misaligned(analyzer) -> None:
    analyzer.volatility = 0.12
    analyzer.risk_tolerance = "medium"
    assert analyzer._risk_alignment()["status"] == "aligned"

    analyzer.risk_tolerance = "low"
    result = analyzer._risk_alignment()
    assert result["status"] == "misaligned"
    assert result["portfolio_risk_classification"] == "medium"


def test_risk_concentration_sums_to_100_and_is_ranked(analyzer) -> None:
    result = analyzer._risk_concentration(top_n=3)
    distribution = result["full_distribution"]
    contributions = [c["risk_contribution_pct"] for c in result["top_contributors"]]

    assert sum(distribution.values()) == pytest.approx(100.0)
    assert len(contributions) == 3
    assert contributions == sorted(contributions, reverse=True)


@pytest.mark.parametrize(
    "average_correlation, phrase",
    [(0.8, "very high"), (0.6, "high correlation"), (0.4, "moderate"), (0.1, "low correlation")],
)
def test_correlation_assessment_labels(analyzer, average_correlation, phrase) -> None:
    n = len(TICKERS)
    matrix = np.full((n, n), average_correlation)
    np.fill_diagonal(matrix, 1.0)
    analyzer.corr_matrix = pd.DataFrame(matrix, index=TICKERS, columns=TICKERS)

    result = analyzer._correlation_analysis()

    assert phrase in result["assessment"]
    assert result["average_pairwise_correlation"] == pytest.approx(average_correlation)


def test_diversification_score_is_100_for_equal_weights(analyzer) -> None:
    result = analyzer._diversification_score()
    assert result["diversification_score"] == pytest.approx(100.0)
    assert result["effective_number_of_assets"] == pytest.approx(5.0)
    assert result["actual_number_of_assets"] == 5


def test_diversification_score_drops_when_concentrated(monkeypatch) -> None:
    monkeypatch.setattr(portfolio_analyzer.yf, "download", lambda *a, **k: _fake_prices())
    weights = {"AAA": 0.8, "BBB": 0.05, "CCC": 0.05, "DDD": 0.05, "EEE": 0.05}

    result = PortfolioAnalyzer(weights)._diversification_score()

    assert result["diversification_score"] < 50
    assert result["effective_number_of_assets"] < 2


# ---------- PortfolioAnalyzer: ML and report ----------

def test_ml_analysis_assigns_every_asset_to_a_cluster(analyzer) -> None:
    result = analyzer.ml_similarity_analysis()
    clustered = [asset for members in result["clusters"].values() for asset in members]

    assert sorted(clustered) == sorted(TICKERS)
    assert len(result["explained_variance"]) == 3
    assert sum(result["explained_variance"]) <= 1.0 + 1e-9


def test_ml_analysis_is_deterministic(analyzer) -> None:
    assert analyzer.ml_similarity_analysis() == analyzer.ml_similarity_analysis()


def test_summary_report_contains_every_section(analyzer) -> None:
    report = analyzer.get_summary_report()

    expected = {
        "assets", "portfolio_risk_classification", "risk_alignment", "risk_concentration",
        "correlation_analysis", "diversification", "volatility", "max_drawdown",
        "sharpe_ratio", "individual_volatility", "pca_clustering",
    }
    assert expected <= set(report)
    assert report["assets"] == TICKERS


# ---------- PortfolioLoader ----------

def test_from_dict_rejects_weights_not_summing_to_one() -> None:
    with pytest.raises(ValueError, match="sum"):
        PortfolioLoader.from_dict({"AAPL": 0.5, "MSFT": 0.2})


def test_from_dict_builds_frame_with_sectors(monkeypatch) -> None:
    monkeypatch.setattr(PortfolioLoader, "get_sector", staticmethod(lambda t: "Tech"))

    frame = PortfolioLoader.from_dict({"AAPL": 0.6, "MSFT": 0.4})

    assert list(frame.columns) == ["Ticker", "Weight", "Sector"]
    assert frame["Sector"].tolist() == ["Tech", "Tech"]


def test_from_csv_adds_missing_sector_column(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(PortfolioLoader, "get_sector", staticmethod(lambda t: "Energy"))
    path = tmp_path / "p.csv"
    path.write_text("Ticker,Weight\nXOM,1.0\n")

    assert PortfolioLoader.from_csv(path)["Sector"].tolist() == ["Energy"]


def test_from_csv_keeps_existing_sector_column(tmp_path) -> None:
    path = tmp_path / "p.csv"
    path.write_text("Ticker,Weight,Sector\nXOM,1.0,Custom\n")

    assert PortfolioLoader.from_csv(path)["Sector"].tolist() == ["Custom"]


def test_mock_portfolio_weights_sum_to_one(monkeypatch) -> None:
    monkeypatch.setattr(PortfolioLoader, "get_sector", staticmethod(lambda t: "X"))

    frame = PortfolioLoader.create_mock_portfolio()

    assert len(frame) == 7
    assert frame["Weight"].sum() == pytest.approx(1.0)


def test_get_sector_returns_unknown_when_lookup_fails(monkeypatch) -> None:
    def boom(_ticker):
        raise RuntimeError("network down")

    monkeypatch.setattr(data_loader.yf, "Ticker", boom)

    assert PortfolioLoader.get_sector("AAPL") == "Unknown"


# ---------- ScenarioService helpers ----------

@pytest.fixture
def service() -> ScenarioService:
    return ScenarioService()


@pytest.mark.parametrize(
    "symbol, asset_class, expected",
    [("btc", "crypto", "BTC-USD"), ("ETH-USD", "crypto", "ETH-USD"), ("pepe", "crypto", "PEPE-USD"),
     ("  aapl ", "stock", "AAPL"), ("vti", "etf", "VTI")],
)
def test_normalize_symbol(service, symbol, asset_class, expected) -> None:
    assert service._normalize_symbol(symbol, asset_class) == expected


def test_max_drawdown_is_percentage_below_initial_value(service) -> None:
    assert service._calculate_max_drawdown([1000, 900, 750, 800], 1000) == pytest.approx(-25.0)


def test_max_drawdown_of_empty_series_is_zero(service) -> None:
    assert service._calculate_max_drawdown([], 1000) == 0.0


def test_inception_check_flags_assets_that_did_not_exist_yet(service) -> None:
    assert service._is_before_symbol_inception("BTC-USD", "2008-01-01", "2009-03-09") is True
    assert service._is_before_symbol_inception("BTC-USD", "2020-02-19", "2020-03-23") is False
    assert service._is_before_symbol_inception("UNKNOWNTICKER", "2008-01-01", "2009-03-09") is False


def test_extract_close_series_handles_missing_and_dirty_data(service) -> None:
    assert service._extract_close_series(None) is None
    assert service._extract_close_series(pd.DataFrame()) is None
    assert service._extract_close_series(pd.DataFrame({"Open": [1, 2]})) is None

    dirty = pd.DataFrame({"Close": [10.0, None, "bad", 12.0]})
    assert service._extract_close_series(dirty).tolist() == [10.0, 12.0]


def test_every_scenario_has_a_valid_date_range(service) -> None:
    assert len(service.SCENARIOS) >= 5
    for scenario_id, scenario in service.SCENARIOS.items():
        assert pd.Timestamp(scenario["start"]) < pd.Timestamp(scenario["end"]), scenario_id
        assert scenario["name"], scenario_id


def test_calculate_scenario_rejects_unknown_scenario(service) -> None:
    with pytest.raises(ValueError, match="Unknown scenario"):
        service.calculate_scenario([{"symbol": "AAPL", "currentValue": 100}], "nope")


def test_calculate_scenario_rejects_zero_value_portfolio(service) -> None:
    with pytest.raises(ValueError, match="greater than zero"):
        service.calculate_scenario([{"symbol": "AAPL", "currentValue": 0}], "2008-financial-crisis")


# ---------- ScenarioService: calculations with fake price history ----------

def _series(first: float, last: float, points: int = 30) -> pd.Series:
    """A straight-line price history between two prices."""
    return pd.Series(np.linspace(first, last, points), index=pd.bdate_range("2008-01-01", periods=points))


def _fake_downloads(service, prices: dict) -> None:
    """Make the service read prices from a dict (symbol -> Series or None) instead of Yahoo Finance."""
    service._download_close_series = lambda symbol, start, end: prices.get(symbol)


def test_asset_impact_computes_percent_change_and_final_value(service) -> None:
    _fake_downloads(service, {"AAPL": _series(100, 80)})

    result = service._calculate_asset_impact("AAPL", "stock", "2008-01-01", "2009-01-01", 1000)

    assert result["percentChange"] == pytest.approx(-20.0)
    assert result["finalValue"] == pytest.approx(800.0)
    assert result["sourceSymbol"] == "AAPL"


def test_asset_impact_is_flat_when_no_data_is_available(service) -> None:
    _fake_downloads(service, {})

    result = service._calculate_asset_impact("AAPL", "stock", "2008-01-01", "2009-01-01", 1000)

    assert result["percentChange"] == 0.0
    assert result["finalValue"] == 1000.0


def test_asset_impact_uses_market_proxy_when_symbol_has_no_history(service) -> None:
    _fake_downloads(service, {"^GSPC": _series(100, 50)})

    result = service._calculate_asset_impact("NEWCO", "stock", "2008-01-01", "2009-01-01", 1000)

    assert result["sourceSymbol"] == "^GSPC"
    assert result["percentChange"] == pytest.approx(-50.0)


def test_crypto_proxy_fallback_is_amplified(service) -> None:
    _fake_downloads(service, {"BTC-USD": _series(100, 110)})

    result = service._calculate_asset_impact("PEPE", "crypto", "2020-01-01", "2021-01-01", 1000)

    assert result["percentChange"] == pytest.approx(15.0)  # +10% proxy move x 1.5


def test_asset_impact_survives_zero_start_price(service) -> None:
    _fake_downloads(service, {"AAPL": _series(0, 10)})

    result = service._calculate_asset_impact("AAPL", "stock", "2008-01-01", "2009-01-01", 1000)

    assert result["percentChange"] == 0.0


def test_download_skips_network_for_assets_before_inception(service, monkeypatch) -> None:
    def explode(*args, **kwargs):
        raise AssertionError("should not download")

    monkeypatch.setattr("scenario_service.yf.download", explode)

    assert service._download_close_series("BTC-USD", "2008-01-01", "2009-03-09") is None


def test_calculate_scenario_end_to_end_with_fake_prices(service) -> None:
    _fake_downloads(service, {"AAPL": _series(100, 50), "VTI": _series(100, 150)})
    holdings = [
        {"symbol": "AAPL", "quantity": 1, "currentValue": 1000, "assetClass": "stock"},
        {"symbol": "VTI", "quantity": 1, "currentValue": 1000, "assetClass": "etf"},
    ]

    result = service.calculate_scenario(holdings, "2008-financial-crisis")

    assert result["scenarioId"] == "2008-financial-crisis"
    assert result["totalReturn"] == pytest.approx(0.0)  # -50% and +50% on equal weights: 500 + 1500 = 2000
    assert [a["symbol"] for a in result["affectedAssets"]] == ["AAPL", "VTI"]
    assert len(result["timeline"]) > 1
    assert result["maxDrawdown"] <= 0
    assert result["volatility"] >= 0
