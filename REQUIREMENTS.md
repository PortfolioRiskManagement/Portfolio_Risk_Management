## Portfolio_Risk_Management — Functional & Non-Functional Requirements

This document lists clear, actionable functional requirements (what the system must do) and non-functional requirements (quality and constraints). Each requirement includes acceptance criteria, current status (Done / In progress / Planned), priority, and a short implementation hint that maps to the repository modules.
---

What we did (Done)
- Frontend scaffold and basic pages: `finai-dashboard/`.
- Python data-loader experiments and example notebook: `dataload/`.
- Meeting notes and project description: `docs/meetings/` and `README.md`.

---

Functional requirements (what the app must do)

1) Upload portfolio (High)
- Let a user upload a CSV or JSON file with portfolio data.
- Done when: File is parsed, fields checked, and a normalized asset list is returned.

2) Compute holdings and weights (High)
- For each asset calculate quantity, market value, and portfolio weight.
- Done when: A function returns these values for every asset.

3) Portfolio risk summary (High)
- Show volatility, max drawdown, and concentration (top holdings %).
- Done when: The app returns these numbers for a portfolio.

4) Price history and time series (Medium)
- Fetch historical prices and build portfolio value over time.
- Done when: We can plot portfolio value and compute drawdowns.

5) Short text explanations (Medium)
- Generate simple template sentences explaining main metrics (no LLM needed at first).
- Done when: Each metric has a one-line explanation.

6) Export report (Low)
- Let user download a CSV or PDF with metrics and basic charts.
- Done when: A download button provides the file.

---

Non-functional requirements (measurable)

- Tests (High):
	- Unit test coverage: target >= 70% for core Python modules (measure with pytest). 
	- Each new feature must include at least one unit test covering the happy path and one edge case.

- Security & privacy (High):
	- Transport: All network traffic must use TLS (HTTPS).
	- Storage: No portfolio data stored persistently by default. If stored, it must be encrypted at rest (AES-256 or platform default).
	- Retention: Default retention for uploaded files = 24 hours unless user opts in to save.
	- Logging: Do not log raw portfolio contents; mask or redact account numbers and sensitive fields.

- Performance (Medium):
	- Import parsing: files up to 5 MB should parse within 2 seconds (median) on a developer laptop.
	- Aggregation latency: for portfolios up to 10,000 rows, 95th percentile response time <= 3 seconds on a typical laptop (4 logical cores, SSD).
	- Dashboard render: initial dashboard Time-to-Interactive (TTI) <= 3 seconds on a modern laptop and connection.

- Reliability & availability (Medium):
	- Processing error rate target: < 1% for normal jobs.
	- Retry policy: transient failures should be retried up to 3 times with exponential backoff.

- Maintainability (Medium):
	- Frontend: TypeScript + linting rules enabled; PRs must pass lint and type checks.
	- Backend: Python modules should include docstrings and small functions; add a CONTRIBUTING note for tests and style.

- Accessibility (Low):
	- Contrast: text must meet WCAG AA contrast ratio of at least 4.5:1 for normal text.
	- Keyboard: Main pages must be keyboard-navigable.

- Observability (Low):
	- Structured logs including request-id for processing jobs.
	- CI must run tests and lint on each PR.

---

Extra details (short)
- File mapping (where to implement):
	- FR-1 (Upload): `dataload/data_loader.py` + frontend upload page in `finai-dashboard/src/features/portfolio`.
	- FR-2 (Holdings): `dataload/portfolio_analyzer.py` or new helper in `dataload/`.
	- FR-3 (Risk summary): `dataload/portfolio_analyzer.py` + `finai-dashboard/src/features/dashboard`.
	- FR-4 (Time series): `dataload/data_loader.py` (use `yfinance`).
	- FR-5 (Text explanations): small module `dataload/explanations.py` (templating).


- How to verify (quick):
	1. Use a sample CSV with a few assets.
	2. Run the data loader and check the parsed asset list.
	3. Run aggregation functions and confirm holdings/weights match expected numbers.
	4. Run risk summary functions and confirm numeric outputs (volatility, drawdown) exist.
	5. Run tests (pytest) after I add them to confirm no regressions.

