# FINAI Dashboard (Frontend)

<!-- Purpose: Help new contributors quickly navigate and run the React dashboard layer. -->

## What this folder contains
This directory hosts the React + TypeScript + Vite frontend for portfolio risk interpretation.

Primary responsibilities:
- Render dashboard pages and feature views
- Call backend API services
- Present risk metrics, charts, and scenario outcomes

## Quick navigation
- App entry: [src/app/main.tsx](src/app/main.tsx)
- App wrapper/providers: [src/app/App.tsx](src/app/App.tsx)
- Route definitions: [src/app/routes.tsx](src/app/routes.tsx)
- Shared UI components: [src/components/](src/components/)
- Feature modules: [src/features/](src/features/)
- API client: [src/services/apiClient.ts](src/services/apiClient.ts)
- Utilities: [src/utils/](src/utils/)

## Local development
Install dependencies:
```bash
npm install
```

Start dev server:
```bash
npm run dev
```

Build production bundle:
```bash
npm run build
```

## Frontend quality checks
Lint:
```bash
npm run lint
```

Unit tests (Vitest):
```bash
npm run test
```

CI test run mode:
```bash
npm run test:ci
```

## Notes for reviewers
- This folder is intentionally organized by feature to keep domain logic discoverable.
- Tests currently focus on deterministic utility logic and can be expanded to component and page-level tests.
