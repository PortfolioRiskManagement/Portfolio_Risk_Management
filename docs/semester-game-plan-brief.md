# Semester Game Plan

## Main Goal

- Deliver a polished portfolio risk management app that users can run, understand, and test.
- Focus on portfolio visibility, risk analysis, scenario testing, and clear explanations.
- Keep all brokerage functionality read-only unless the project scope changes.

## Phase 1: Creating the app and stabilizing it

- Confirm the React frontend and Flask backend run from a clean setup.
- Connect frontend pages to the backend API.
- Remove or label fake sync times, fake activity, and sample data.
- Standardize loading, empty, success, and error states.
- Confirm all main routes work:
  - Dashboard
  - Assets
  - Portfolio
  - Risk
  - Scenario Lab
  - Connections
  - Settings

## Phase 2: Build the Core Portfolio Workflow

- Support manual portfolio creation.
- Add CSV and JSON portfolio upload.
- Validate uploaded files and show useful error messages.
- Normalize all holdings into one shared format:
  - Symbol
  - Name
  - Quantity
  - Average cost
  - Current price
  - Asset type
  - Account
  - Platform
  - Data source
- Handle duplicate holdings correctly.
- Clearly label data as manual, imported, live, or demo data.

## Phase 3: Complete Risk Analytics

- Calculate and display:
  - Portfolio value
  - Asset weights
  - Volatility
  - Maximum drawdown
  - Concentration
  - Diversification
  - Asset-class and sector exposure where available
- Connect dashboard metrics to backend calculations.
- Add plain-language explanations for each metric.
- Show data timestamps and missing-data warnings.
- Test calculations with both simple and complex portfolios.

## Phase 4: Connect to Wealthsimple

- Investigate whether Wealthsimple provides an approved API, developer program, OAuth flow, or authorized aggregation option.
- Confirm:
  - Regional availability
  - Supported account types
  - Read-only holdings access
  - Authentication method
  - Permission scopes
  - Rate limits
  - Token expiration and revocation
- If approved access is available:
  - Build a Wealthsimple backend adapter.
  - Use secure authorization; never collect brokerage passwords.
  - Import accounts and holdings.
  - Normalize data into the shared portfolio format.
  - Add synchronization status and disconnect functionality.
- If live access is unavailable:
  - Add a Wealthsimple CSV import template.
  - Provide manual import instructions.
  - Use clearly labelled mock data for demonstrations only.

## Phase 5: Connect to Robinhood

- Investigate whether Robinhood provides an approved API or developer program for read-only portfolio access.
- Confirm:
  - Regional availability
  - Supported account types and assets
  - Authentication method
  - Permissions
  - Sandbox availability
  - Rate limits and data freshness
- If approved access is available:
  - Build a Robinhood backend adapter.
  - Retrieve accounts, holdings, cash, and timestamps.
  - Normalize data into the shared portfolio format.
  - Handle expired connections and provider errors.
  - Add disconnect functionality.
- If live access is unavailable:
  - Add a Robinhood CSV import template.
  - Provide manual import instructions.
  - Use clearly labelled mock data for demonstrations only.

## Phase 6: Improve the Connection Experience

- Show clear provider states:
  - Not connected
  - Connecting
  - Connected
  - Syncing
  - Sync complete
  - Connection expired
  - Provider unavailable
  - Disconnected
- Display:
  - Provider name
  - Accounts connected
  - Holdings imported
  - Last successful sync
  - Data source
  - Refresh action
  - Disconnect action
- Do not treat a browser-only local flag as a real live connection.

## Phase 7: Finish Scenario Analysis

- Connect Scenario Lab to the normalized portfolio data.
- Support historical events and clearly labelled hypothetical scenarios.
- Show:
  - Estimated portfolio impact
  - Affected assets
  - Drawdown or volatility changes
  - Assumptions used
- Warn users when historical data is incomplete.
- Keep recommendations educational and transparent rather than presenting guaranteed predictions.

## Phase 8: Testing and Security

- Backend tests:
  - Portfolio validation
  - Risk calculations
  - Scenario calculations
  - API errors
  - Provider adapters using mock responses
- Frontend tests:
  - Import workflow
  - Connection states
  - Dashboard states
  - Scenario results
  - Disconnect behavior
- Test edge cases:
  - Empty portfolio
  - Invalid file
  - Missing price data
  - Duplicate holdings
  - Expired connection
  - Provider downtime
- Run before final submission:
  - Backend tests
  - Frontend tests
  - Frontend lint
  - Type checks
  - Production build
- Security requirements:
  - Never store brokerage passwords.
  - Do not commit API keys or tokens.
  - Do not log raw portfolio contents.
  - Redact account numbers and sensitive values.
  - Use read-only permissions.
  - Document data retention and deletion behavior.

## Suggested Weekly Schedule

- **Weeks 1-2:** Stabilize the app, review scope, and establish baseline tests.
- **Weeks 3-4:** Finish manual entry, CSV/JSON import, validation, and shared data models.
- **Weeks 5-6:** Connect backend analytics and complete risk explanations.
- **Weeks 7-8:** Investigate Wealthsimple and Robinhood access; build provider-neutral connection architecture.
- **Weeks 9-10:** Implement approved integrations or provider-specific import fallbacks.
- **Weeks 11-12:** Finish Scenario Lab, error states, accessibility, and visual polish.
- **Week 13:** Run full testing, privacy review, and acceptance testing.
- **Week 14:** Final demo, documentation, report updates, and handoff.

## Priority Order

1. Working app and stable setup.
2. Manual portfolio entry and file import.
3. Accurate backend risk analytics.
4. Scenario analysis.
5. Wealthsimple integration or import fallback.
6. Robinhood integration or import fallback.
7. Testing, security, accessibility, and final polish.

## Final Demo Checklist

- Open the app and show the dashboard.
- Create or import a portfolio.
- Show normalized holdings and risk metrics.
- Explain one major portfolio risk.
- Demonstrate the Wealthsimple connection or import fallback.
- Demonstrate the Robinhood connection or import fallback.
- Run a scenario in Scenario Lab.
- Show connection status and error handling.
- Explain which features are live, imported, simulated, or future work.

## Definition of Done

- The feature works with sanitized sample data.
- The feature has at least one happy-path test and one edge-case test.
- Loading, empty, and error states are handled.
- Sensitive information is protected.
- The feature is documented.
- The feature can be demonstrated without developer-only steps.