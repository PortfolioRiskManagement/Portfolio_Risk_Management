# Portfolio Risk Management

<!-- Purpose: Give new reviewers and instructors a complete navigation and execution guide for this repository. -->

## Table Of Contents
- [Project Overview](#project-overview)
- [Repository Quick Navigation](#repository-quick-navigation)
- [Architecture Summary](#architecture-summary)
- [Local Setup](#local-setup)
- [Run The Application](#run-the-application)
- [Automated Testing](#automated-testing)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [Video Demo](#video-demo)
- [Client And Team Communication Records](#client-and-team-communication-records)
- [Contributors](#contributors)
- [License](#license)

## Project Overview
Modern investing platforms often show users values and percentages without enough explanation of what those metrics mean in practice. This project provides an AI-assisted portfolio risk interpretation platform that focuses on educational analysis, transparency, and scenario understanding.

The system does not execute trades. Instead, it explains risk through portfolio analytics, scenario simulation, and visualization.

Core capabilities:
- Portfolio-level metrics (volatility, concentration, drawdown)
- Asset-level risk interpretation
- Historical scenario simulation and impact tracking
- Dashboard-first UI for risk interpretation workflows

## Repository Quick Navigation
- Frontend app: [finai-dashboard/](finai-dashboard/)
- Backend API entry: [app.py](app.py)
- Data loading and analytics layer: [dataload/README.md](dataload/README.md)
- Testing guide and scripts: [tests/README.md](tests/README.md)
- CI workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- Client meeting notes: [docs/meetings/](docs/meetings/)

## Architecture Summary
High-level flow:
1. The React frontend collects portfolio/scenario inputs.
2. The Flask backend exposes analysis/search/scenario APIs.
3. Data and analytics modules process historical data and compute metrics.
4. Results are returned to UI components for interpretation and display.

Main backend endpoints:
- `POST /api/portfolio/analyze`
- `POST /api/scenario/calculate`
- `GET /api/search?q=...`
- `GET /api/health`

## Local Setup
Requirements:
- Python 3.11+
- Node.js 20+ (LTS recommended)
- npm

Install backend dependencies from repository root:
```bash
pip install -r requirements.txt
```

Install frontend dependencies:
```bash
cd finai-dashboard
npm install
```

## Run The Application
Run backend API (from repository root):
```bash
python app.py
```

Run frontend dashboard (in a second terminal):
```bash
cd finai-dashboard
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## Automated Testing
Automated tests are split by stack and documented in [tests/README.md](tests/README.md).

Quick commands:
- Backend tests:
```bash
pytest -q tests/backend
```
- Frontend tests:
```bash
cd finai-dashboard
npm run test:ci
```
- Run all tests and generate output logs:
```bash
python tests/scripts/run_all_tests.py
```

Expected generated logs:
- `tests/output/backend-test-output.txt`
- `tests/output/frontend-test-output.txt`
- `tests/output/summary.md`

## CI/CD (GitHub Actions)
CI workflow file: [.github/workflows/ci.yml](.github/workflows/ci.yml)

Current automated pipeline on push/PR to `main`:
1. Backend dependency install and pytest run
2. Frontend dependency install, lint, build, and Vitest run
3. Upload backend/frontend test output logs as artifacts

This is the current CI baseline and can be extended later with deployment steps.

## Video Demo
![Demo](docs/demoVideo/demonstration_2026-04-07.gif)

## Client And Team Communication Records
Meeting notes and progression records are tracked in:
- [docs/meetings/](docs/meetings/)

Each meeting note captures:
- Work completed
- Features demonstrated
- Client feedback
- Requested changes and next actions

## Contributors
- [Michael Haddad](https://github.com/MichaelHaddad47)
- [Henry Saber](https://github.com/HenrySaber)
- [Mathew Aoun](https://github.com/Mathewaoun)

## License
This project is licensed under the GPL-3.0 License.
- [LICENSE](LICENSE)
