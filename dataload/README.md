# Data Load And Analytics Layer

<!-- Purpose: Explain data ingestion and portfolio-analysis module responsibilities for new contributors/reviewers. -->

## Folder purpose
This directory contains backend data preparation and portfolio analytics logic used by API routes.

## Key files
- `data_loader.py` : Portfolio ingestion/normalization and mock portfolio generation helpers.
- `portfolio_analyzer.py` : Core portfolio analytics and risk metric computation logic.
- `example_notebook.py` : Example exploratory workflow file for data/analysis experiments.

## How this layer is used
1. Backend routes in the repository root (`app.py`) gather request data.
2. Loader utilities construct portfolio data frames.
3. Analyzer utilities compute risk and summary outputs.
4. API returns analysis results to the frontend dashboard.

## Related entry points
- Backend API entry: [../app.py](../app.py)
- Scenario analytics service: [../scenario_service.py](../scenario_service.py)
- Root project guide: [../README.md](../README.md)
