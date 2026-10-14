# AI-Assisted Portfolio Risk Interpretation Platform

## Course Project Report

### Student Team
- Henry Saber
- Michael Haddad
- Mathew Aoun

### Repository
- Primary project URL: https://github.com/MichaelHaddad47/Portfolio_Risk_Management
- Organization URL (as documented in project notes): https://github.com/PortfolioRiskManagement/Portfolio_Risk_Management

---

## Abstract
This project presents an AI-assisted portfolio risk interpretation platform that helps investors understand how and why their portfolio behaves under uncertainty. The system is designed as a diagnostic and education layer rather than a trade-execution engine. It combines deterministic risk analytics (volatility, drawdown, concentration, correlation, diversification, Sharpe ratio) with interpretable machine learning diagnostics (PCA and KMeans clustering) and event-driven alerting based on financial news and price movement. 

The central contribution is not an opaque recommendation model, but an explainable workflow that maps measurable portfolio statistics to actionable risk insights. The platform includes an interactive front-end for portfolio editing and what-if comparison, and a Python API backend that computes risk diagnostics from historical market data.

---

## 1. Vision and Technical Ambition (Rubric: Vision)

### 1.1 Problem Statement
Retail investors often see account value and returns, but lack a clear explanation of latent risk structure. Existing broker dashboards underemphasize:
- risk concentration by asset contribution,
- cross-asset co-movement risk,
- mismatch between user risk preference and realized portfolio risk,
- factor-like hidden drivers behind portfolio behavior.

### 1.2 Project Goal
Build an interpretable risk advisory system that:
- quantifies portfolio risk using established finance metrics,
- explains metrics in user-facing language,
- allows counterfactual portfolio edits and comparison,
- surfaces current market/news events relevant to holdings,
- avoids black-box recommendation behavior.

### 1.3 Technical Ambition
The system intentionally combines:
- finance diagnostics,
- machine learning structure discovery,
- front-end explainability UX,
- live data integration from market and news APIs,
- end-to-end web product architecture.

This moves beyond static metric display toward explainable decision support with measurable outcomes.

---

## 2. System Architecture and Implementation (Rubric: Engineering)

### 2.1 High-Level Architecture
The platform follows a two-tier architecture:

1) Front-end (React + TypeScript + Vite)
- Portfolio analysis dashboard and advisor UI.
- Tabs for overview, detailed diagnostics, sampling/comparison, and ML analysis.
- Portfolio editing and scenario comparison.
- Alerts page with impact and category filtering.

2) Backend API (Flask + Python)
- Endpoint for portfolio analysis.
- Endpoint for mock portfolio generation.
- Risk engine that fetches market data and computes diagnostics.

### 2.2 Data Flow
1. User portfolio and settings (risk tolerance, lookback window) are submitted from the front-end.
2. Flask API receives request and initializes PortfolioAnalyzer.
3. Analyzer downloads historical prices using yfinance.
4. Risk and ML diagnostics are computed.
5. JSON summary report is returned to front-end.
6. UI renders cards, charts, and explanations.

### 2.3 Core Analytics Engine
The Python analyzer computes:
- Annualized portfolio volatility:
  sigma_p = sqrt(w^T Sigma w)
- Maximum drawdown:
  minimum over time of cumulative return relative to running peak
- Individual annualized asset volatilities
- Pairwise correlation matrix and average pairwise correlation
- Diversification score via Herfindahl-Hirschman Index
- Effective number of assets: 1 / sum(w_i^2)
- Sharpe ratio (annualized):
  SR = sqrt(252) * mean(r_p - r_f/252) / std(r_p - r_f/252)
- Risk class thresholds based on volatility
- Risk alignment status between user tolerance and measured risk class
- Risk concentration by weighted individual volatility contribution
- ML diagnostics:
  - PCA explained variance and loadings
  - KMeans clustering over PCA loadings

### 2.4 Explainability Layer
The advisor UI translates numbers into plain-language insight cards:
- Alignment warning when user tolerance and measured risk diverge.
- Diversification interpretation by score range.
- Correlation interpretation (poor to good diversification).
- Drawdown warning emphasizing downside realism.
- PCA interpretation as hidden market factors.
- Cluster interpretation as co-movement groups.

### 2.5 Alerting Component
A separate alerts service integrates Finnhub news and quotes:
- market and company news ingestion,
- ticker alias matching for relevance detection,
- impact heuristics from keyword intensity and price moves,
- category assignment (stock, sector, economy, market),
- periodic refresh and filtering by impact/category/holdings.

---

## 3. Feature Selection Rationale

Feature selection is motivated by interpretability, practical utility, and academic grounding:
- Volatility and drawdown capture downside exposure and uncertainty.
- Sharpe ratio contextualizes return quality per unit risk.
- Correlation and effective asset count capture true diversification quality.
- Risk concentration identifies portfolio fragility from dominant contributors.
- PCA and clustering expose latent common drivers that may not be obvious from simple allocation percentages.
- News and price alerts connect quantitative diagnostics with current market narrative.

This set avoids overfitting to one metric and supports multi-perspective risk understanding.

---

## 4. Research Context and Literature Review (Rubric: Academia)

This project is grounded in classical and modern portfolio/risk literature:

1) Modern Portfolio Theory (Markowitz, 1952)
- Mean-variance logic motivates covariance-based risk computation and diversification analysis.

2) Capital Market and Risk-Adjusted Return (Sharpe, 1964; 1966)
- Sharpe ratio supports risk-adjusted evaluation in a single interpretable score.

3) Diversification and Concentration Structure
- Effective number of assets and HHI-based concentration are consistent with concentration economics and risk spreading principles.

4) Correlation as Diversification Constraint
- Portfolio-level dependence structure is a central limitation in naive diversification approaches.

5) PCA for Latent Risk Factors (Jolliffe, 2002)
- PCA provides interpretable dimensional compression and hidden factor extraction from returns.

6) KMeans for Behavioral Grouping (MacQueen, 1967)
- Clustering offers intuitive group-level co-movement interpretation.

7) Statistical Caveats in Sharpe Estimation (Lo, 2002)
- Highlights sampling sensitivity and need for robust evaluation windows.

8) Multi-factor Risk Perspective (Fama and French, 1993)
- Supports the idea that broad market, size, and related latent components drive return behavior.

### Why this matters academically
The platform is not based on generic LLM output generation. It operationalizes established financial and statistical methods, then uses interpretable UX to communicate them. This directly addresses the requirement that "LLM magic" alone is insufficient.

---

## 5. Evaluation Methodology and Scientific Rigor (Rubric: Rigour)

### 5.1 Evaluation Questions
- Q1: How accurate and stable are the system risk diagnostics over time?
- Q2: Do suggested portfolio edits improve risk-quality metrics?
- Q3: Which modules contribute most to quality (ablation)?
- Q4: How robust is the system to new asset regimes (for example crypto)?

### 5.2 Validation Dataset Design
Recommended protocol for this project:

1. Asset universe
- Large-cap US equities, sector ETFs, bonds, and commodities.
- Optional crypto proxies (for example BTC-USD, ETH-USD via yfinance) for stress testing.

2. Time horizon
- Rolling windows across multiple market regimes (calm, inflation shock, drawdown periods).
- Suggested baseline: 5 to 7 years daily data with rolling test windows.

3. Portfolio set
- Generate multiple synthetic portfolios with controlled concentration and correlation profiles.
- Include realistic user-style portfolios from project mock data and edited scenarios.

4. Split strategy
- Train-free analytics, but evaluate stability and consistency by rolling out-of-window comparisons.

### 5.3 Metrics for Model/Advice Quality
Because the platform is diagnostic rather than predictive, evaluate advice quality by outcome-oriented risk metrics:

1) Primary quality metrics
- Delta volatility after user modification
- Delta max drawdown
- Delta Sharpe ratio
- Delta diversification score
- Delta average pairwise correlation
- Delta risk alignment status (mismatch to aligned)

2) Reliability metrics
- Metric variance across rolling windows
- Sensitivity to lookback length (for example 252 vs 504 days)

3) Explainability metrics
- User-study style rubric: clarity, trust, actionability (Likert scale)

### 5.4 Ablation Study Design
Ablation should test whether removing a component degrades advice quality.

Recommended ablations:
- A0 Full system (all diagnostics + ML + explanations)
- A1 Remove PCA/clustering interpretation
- A2 Remove correlation/diversification module
- A3 Remove risk concentration module
- A4 Remove risk alignment messaging
- A5 Remove event alerts from decision context

Evaluate each ablation on the same portfolio scenarios and compare aggregate deltas. If A0 consistently produces better risk-improving edits than A1-A5, the architecture is justified.

### 5.5 Suggested Results Table Template
Use this exact structure in your submitted report with your measured values:

- Columns: Variant, Delta Volatility, Delta Drawdown, Delta Sharpe, Delta Diversification, Delta Correlation, Alignment Improvement Rate
- Rows: A0, A1, A2, A3, A4, A5

### 5.6 Functional and Scientific Test Cases
The following test cases are designed to demonstrate both software correctness and evaluation rigor. Each test should be executed on at least two lookback windows (252 and 504 days), and results should be recorded with timestamp and portfolio definition.

| ID | Test Name | Input Setup | Expected Outcome | Rigor Evidence |
|---|---|---|---|---|
| TC-01 | Custom Portfolio Input Acceptance | Enter user-defined holdings in Sampling tab (for example AAPL, XLE, GLD, BTC-USD with positive shares/prices). Run Analyze. | API accepts user portfolio payload; response returns all core metrics without fallback to mock portfolio. | Request/response logs showing submitted tickers and returned `assets` match input symbols. |
| TC-02 | Input Validation: Empty Portfolio | Keep holdings empty and click Analyze. | UI blocks analysis and displays validation message; no invalid API request is processed. | Screenshot of validation message and network tab showing no successful analysis call with empty payload. |
| TC-03 | Input Validation: Invalid Values | Set one holding with zero/negative shares or price; keep others valid. | Invalid rows are excluded or blocked; analysis uses only valid holdings, and no crash occurs. | Before/after portfolio snapshot and resulting normalized weights sum near 1.0. |
| TC-04 | Weight Normalization Correctness | Use 3-5 assets with known market values (shares * price). | Computed weights equal value proportion and sum to 1.0 (up to rounding tolerance). | Table of manual vs system-computed weights; absolute error per asset < 0.001. |
| TC-05 | Risk Alignment Logic | Run same portfolio under `low`, `medium`, `high` risk tolerance settings. | `risk_alignment.status` changes consistently with tolerance and measured risk class. | Matrix of tolerance vs risk class vs alignment status. |
| TC-06 | Lookback Sensitivity | Run identical portfolio for 252 and 504 days. | Metrics differ but remain stable (no erratic sign flips for core risk descriptors unless market regime changed). | Delta table for volatility, drawdown, Sharpe, correlation with interpretation notes. |
| TC-07 | Diversification Improvement Scenario | Create concentrated baseline (for example 80% single stock) then diversified variant. | Diversified variant improves diversification score and effective number of assets; concentration risk declines. | Paired comparison output and percentage improvements. |
| TC-08 | Correlation Stress Scenario | Compare portfolio of highly correlated tech names vs cross-asset mix (equity, bond/ETF, commodity). | High-correlation basket shows worse diversification assessment and higher average pairwise correlation. | Two-run correlation table with qualitative explanation from insight cards. |
| TC-09 | ML Explainability Consistency | Run PCA/clustering on two portfolio variants with known structure overlap. | Cluster memberships and top PCA factors change in direction consistent with changed exposures. | Saved PCA explained variance and cluster membership snapshots across variants. |
| TC-10 | End-to-End Robustness | Full flow: add/edit/remove holdings, analyze, compare with current, switch tabs, rerun. | No runtime errors, consistent state updates, and reproducible reports under same inputs/time window. | Execution checklist with pass/fail plus browser console showing no uncaught errors. |

#### Pass/Fail Criteria
- A test passes only if both UI behavior and API payload/response evidence match expected outcome.
- For numerical checks, use tolerance threshold $\epsilon = 10^{-3}$ unless otherwise justified.
- Repeat each case at least 3 times across different dates/market conditions to demonstrate repeatability.

---

## 6. Current Evidence From Implementation

Based on the implemented codebase:
- Deterministic risk diagnostics are fully integrated and returned in one API report.
- User risk tolerance is explicitly compared to computed portfolio class.
- Counterfactual comparison workflow exists in the advisor sampling tab.
- PCA and clustering are computed and explained in dedicated UI.
- Alerts integrate market and holdings-specific relevance with impact tagging.

This provides a strong engineering base for formal empirical evaluation.

---

## 7. Limitations and Threats to Validity

### 7.1 Data Source and Market Assumptions
- yfinance data quality, corporate action handling, and missing data can affect metric stability.
- Daily close-based analytics do not capture intraday risk.

### 7.2 Static Risk Thresholds
- Current risk class boundaries are fixed volatility thresholds; they may need adaptive calibration by market regime.

### 7.3 Crypto Risk Coverage
- The system can process tickers available via yfinance, including some crypto symbols.
- However, current risk logic is mostly mathematical (volatility/correlation/concentration) and does not include crypto-specific microstructure risks (exchange risk, on-chain events, liquidity fragmentation, custody failure, stablecoin depeg, protocol governance shocks).

### 7.4 No Execution Layer
- The system provides interpretation, not automatic portfolio rebalancing or order execution.

### 7.5 Explainability Quality Not Yet User-Study Validated
- Insight text is deterministic and practical, but needs formal user evaluation for comprehension and trust impact.

---

## 8. Future Work

1. Regime-aware risk thresholds and Bayesian or robust covariance estimation.
2. CVaR and downside-tail metrics to complement volatility and drawdown.
3. Dedicated crypto risk module with liquidity/exchange and on-chain features.
4. Formal user study on decision quality improvement.
5. Persistent experiment harness to automate ablation and benchmark reporting.
6. Exportable PDF report generation for advisor workflows.

---

## 9. How to Run the Project

### 9.1 Prerequisites
- Python 3.10 or later
- Node.js 18 or later (LTS recommended)
- npm

### 9.2 Backend Setup (Flask API)
From project root:

1. Create and activate a Python virtual environment.
2. Install dependencies:
   pip install -r requirements.txt
3. Start backend:
   python app.py
4. API runs on:
   http://localhost:5001

Health check endpoint:
- http://localhost:5001/api/health

### 9.3 Frontend Setup (React Dashboard)
From finai-dashboard folder:

1. Install dependencies:
   npm install
2. Start development server:
   npm run dev
3. Open app in browser:
   http://localhost:5173

### 9.4 Environment Variables
Frontend optionally uses:
- VITE_API_URL (default backend URL if not set: http://localhost:5001)
- VITE_FINNHUB_API_KEY (required for live alerts/news features)

Create a local .env file inside finai-dashboard if needed.

### 9.5 Typical Local Run Sequence
1. Start backend API on port 5001.
2. Start frontend Vite app on port 5173.
3. Open advisor page and run portfolio analysis.
4. Modify holdings in sampling tab and run comparison.
5. Review AI analysis and alerts outputs.

---

## 10. Reproducible Evaluation Plan (What to Include in Submission)

To satisfy rigorous grading criteria, include:
- At least 20 to 50 portfolio scenarios.
- At least two lookback windows (252 and 504 days).
- At least one stress period evaluation window.
- Full vs ablated variant comparisons.
- Statistical summaries (mean, median, standard deviation of metric deltas).
- At least one qualitative case study where recommendation quality is visibly improved.

---

## 11. Rubric Mapping Summary

### Vision (25%)
- Ambitious integration of financial diagnostics, ML interpretation, explainable UX, and real-time alerts.

### Engineering (25%)
- Functional full-stack implementation with working endpoints, analytics pipeline, and interactive UI comparison loop.

### Rigour (25%)
- Clear evaluation protocol with validation dataset design, measurable quality metrics, and ablation framework.

### Academia (25%)
- Grounding in MPT, Sharpe, factor structure, PCA/clustering literature, plus explicit validity/limitation discussion.

---

## References

- Markowitz, H. (1952). Portfolio selection. Journal of Finance, 7(1), 77-91.
- Sharpe, W. F. (1964). Capital asset prices: A theory of market equilibrium under conditions of risk. Journal of Finance, 19(3), 425-442.
- Sharpe, W. F. (1966). Mutual fund performance. Journal of Business, 39(1), 119-138.
- Fama, E. F., and French, K. R. (1993). Common risk factors in the returns on stocks and bonds. Journal of Financial Economics, 33(1), 3-56.
- Jolliffe, I. T. (2002). Principal Component Analysis (2nd ed.). Springer.
- MacQueen, J. (1967). Some methods for classification and analysis of multivariate observations. Proceedings of the Fifth Berkeley Symposium on Mathematical Statistics and Probability, 281-297.
- Lo, A. W. (2002). The statistics of Sharpe ratios. Financial Analysts Journal, 58(4), 36-52.
- Ledoit, O., and Wolf, M. (2004). A well-conditioned estimator for large-dimensional covariance matrices. Journal of Multivariate Analysis, 88(2), 365-411.
