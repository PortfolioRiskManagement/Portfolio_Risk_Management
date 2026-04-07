# Testing Guide

<!-- Purpose: Explain how automated tests are organized, executed, and what outputs to expect. -->

## Why this exists
This folder centralizes all automated testing assets so reviewers (prof/TA/client) can quickly verify:
- What is tested in backend and frontend
- How to run tests locally
- Where output logs are stored
- What successful output should look like

## Folder structure
- `tests/backend/` : Python backend API tests (pytest)
- `tests/scripts/` : Cross-stack test runner scripts
- `tests/output/` : Generated test result logs (`.txt`) for demo evidence

## Test coverage summary
- Backend:
  - Health endpoint status contract (`/api/health`)
  - Portfolio analysis route using mocked analyzer dependencies
  - Search route classification behavior using mocked Yahoo response
- Frontend:
  - Currency and number formatting helpers used in UI cards/charts
  - Percentage formatting behavior for positive/negative values

## Local run options
1. Run backend only
```bash
pytest tests/backend -v
```

2. Run frontend only
```bash
cd finai-dashboard
npm run test:ci
```

3. Run both and generate logs
```bash
python tests/scripts/run_all_tests.py
```

## Expected outputs
On success, these files are generated in `tests/output/`:
- `backend-test-output.txt`
- `frontend-test-output.txt`
- `summary.md`

`summary.md` includes:
- Timestamp
- Exit code per stack
- Pass/fail interpretation
- Paths to each output file

## CI behavior
The GitHub Actions workflow in `.github/workflows/ci.yml` runs on push/PR to `main` and:
- Executes backend tests
- Executes frontend lint + build + tests
- Uploads backend/frontend test output logs as artifacts
