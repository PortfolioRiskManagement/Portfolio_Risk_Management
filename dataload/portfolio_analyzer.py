"""
Portfolio Analyzer - CORE DIAGNOSTIC ENGINE

Deterministic diagnostics:
- Risk metrics
- Risk alignment
- Risk concentration
- Correlation analysis
- Diversification score (effective assets)
- Sharpe ratio (risk-adjusted performance)

ML diagnostics:
- PCA (latent risk factors)
- KMeans clustering (behavioral similarity)

Diagnostic only. No predictions, no trading advice.
"""

import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans


class PortfolioAnalyzer:
    def __init__(self, portfolio_data, risk_tolerance="medium", lookback_days=504):

        self.risk_tolerance = risk_tolerance.lower()
        self.lookback_days = lookback_days

        if isinstance(portfolio_data, pd.DataFrame):
            self.portfolio_data = dict(
                zip(portfolio_data["Ticker"], portfolio_data["Weight"])
            )
        elif isinstance(portfolio_data, dict):
            self.portfolio_data = portfolio_data
        else:
            raise TypeError("portfolio_data must be DataFrame or dict")

        if not np.isclose(sum(self.portfolio_data.values()), 1.0, atol=0.01):
            raise ValueError("Portfolio weights must sum to ~1.0")

        self._fetch_data()
        self._calculate_metrics()

    # ==================================================
    # DATA
    # ==================================================
    def _fetch_data(self):
        end_date = datetime.now()
        start_date = end_date - timedelta(days=self.lookback_days)
        tickers = list(self.portfolio_data.keys())

        data = yf.download(
            tickers,
            start=start_date,
            end=end_date,
            progress=False,
            auto_adjust=False
        )

        # Robust price column selection
        if isinstance(data.columns, pd.MultiIndex):
            if "Adj Close" in data.columns.get_level_values(0):
                prices = data["Adj Close"]
            elif "Close" in data.columns.get_level_values(0):
                prices = data["Close"]
            else:
                raise ValueError("No Adj Close or Close prices found")
        else:
            if "Adj Close" in data.columns:
                prices = data["Adj Close"].to_frame()
            elif "Close" in data.columns:
                prices = data["Close"].to_frame()
            else:
                raise ValueError("No Adj Close or Close prices found")

        if isinstance(prices, pd.Series):
            prices = prices.to_frame()

        self.prices = prices.dropna(how="all")
        self.returns = self.prices.pct_change().dropna()

    # ==================================================
    # METRICS
    # ==================================================
    def _calculate_metrics(self):
        self.weights = np.array(list(self.portfolio_data.values()))
        cov = self.returns.cov() * 252

        self.volatility = float(np.sqrt(self.weights @ cov @ self.weights))

        portfolio_returns = self.returns @ self.weights
        cumulative = (1 + portfolio_returns).cumprod()
        self.max_drawdown = float((cumulative - cumulative.cummax()).min())

        self.individual_volatility = (
            self.returns.std() * np.sqrt(252)
        ).to_dict()

        self.corr_matrix = self.returns.corr()

    # ==================================================
    # SHARPE RATIO
    # ==================================================
    def _sharpe_ratio(self, risk_free_rate=0.02):
        """
        Annualized Sharpe Ratio
        risk_free_rate: annual (e.g. 0.02 = 2%)
        """
        portfolio_returns = self.returns @ self.weights
        rf_daily = risk_free_rate / 252
        excess_returns = portfolio_returns - rf_daily

        sharpe = np.sqrt(252) * excess_returns.mean() / excess_returns.std()
        return float(sharpe)

    # ==================================================
    # RISK CLASSIFICATION
    # ==================================================
    def _classify_risk(self):
        if self.volatility < 0.10:
            return "low"
        elif self.volatility < 0.15:
            return "medium"
        return "high"

    def _risk_alignment(self):
        return {
            "status": "aligned"
            if self._classify_risk() == self.risk_tolerance
            else "misaligned",
            "user_risk_tolerance": self.risk_tolerance,
            "portfolio_risk_classification": self._classify_risk(),
        }

    # ==================================================
    # RISK CONCENTRATION
    # ==================================================
    def _risk_concentration(self, top_n=3):
        raw = {
            t: float(w * self.individual_volatility[t])
            for t, w in self.portfolio_data.items()
        }

        total = sum(raw.values())
        pct = {k: float(v / total * 100) for k, v in raw.items()}
        ranked = sorted(pct.items(), key=lambda x: x[1], reverse=True)

        return {
            "top_contributors": [
                {"ticker": t, "risk_contribution_pct": p}
                for t, p in ranked[:top_n]
            ],
            "full_distribution": pct,
        }

    # ==================================================
    # CORRELATION
    # ==================================================
    def _correlation_analysis(self):
        vals = self.corr_matrix.values
        avg_corr = float(np.mean(vals[np.triu_indices_from(vals, k=1)]))

        if avg_corr > 0.7:
            label = "very high correlation — poor diversification"
        elif avg_corr > 0.5:
            label = "high correlation — limited diversification"
        elif avg_corr > 0.3:
            label = "moderate correlation — partial diversification"
        else:
            label = "low correlation — good diversification"

        return {
            "average_pairwise_correlation": avg_corr,
            "assessment": label,
        }

    # ==================================================
    # DIVERSIFICATION SCORE
    # ==================================================
    def _diversification_score(self):
        weights = np.array(list(self.portfolio_data.values()))
        hhi = np.sum(weights ** 2)

        return {
            "diversification_score": float((1 / hhi) / len(weights) * 100),
            "effective_number_of_assets": float(1 / hhi),
            "actual_number_of_assets": int(len(weights)),
        }

    # ==================================================
    # ML: PCA + CLUSTERING
    # ==================================================
    def ml_similarity_analysis(self, n_components=3, n_clusters=4):
        # Small portfolios can't support more components/clusters than they have assets
        n_assets = self.returns.shape[1]
        n_components = min(n_components, n_assets)
        n_clusters = min(n_clusters, n_assets)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(self.returns)

        pca = PCA(n_components=n_components)
        pca.fit(X_scaled)

        loadings = pd.DataFrame(
            pca.components_.T,
            index=self.returns.columns,
            columns=[f"PC{i+1}" for i in range(n_components)],
        )

        kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
        loadings["cluster"] = kmeans.fit_predict(loadings)

        clusters = {}
        for asset, row in loadings.iterrows():
            clusters.setdefault(int(row["cluster"]), []).append(asset)

        return {
            "explained_variance": pca.explained_variance_ratio_.tolist(),
            "asset_loadings": loadings.drop(columns="cluster").to_dict("index"),
            "clusters": clusters,
        }

    # ==================================================
    # SUMMARY
    # ==================================================
    def get_summary_report(self):
        ml = self.ml_similarity_analysis()

        return {
            "assets": list(self.portfolio_data.keys()),

            # Core diagnostics
            "portfolio_risk_classification": self._classify_risk(),
            "risk_alignment": self._risk_alignment(),
            "risk_concentration": self._risk_concentration(),
            "correlation_analysis": self._correlation_analysis(),
            "diversification": self._diversification_score(),

            # Risk metrics
            "volatility": self.volatility,
            "max_drawdown": self.max_drawdown,
            "sharpe_ratio": self._sharpe_ratio(),
            "individual_volatility": self.individual_volatility,

            # ML diagnostics
            "pca_clustering": {
                "explained_variance": ml["explained_variance"],
                "asset_loadings": ml["asset_loadings"],
                "clusters": ml["clusters"],
            },
        }
