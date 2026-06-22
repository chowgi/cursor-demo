# 🧪 Testing

As highlighted in this [tweet](https://twitter.com/rauchg/status/807626710350839808), the efficacy of testing lies in the comprehensive coverage provided by integration and end-to-end (e2e) tests. While unit tests serve a purpose in isolating and validating individual components, the true value and confidence in application functionality stem from robust integration and e2e testing strategies.

## Types of tests:

### Unit Tests

Unit tests are the smallest tests you can write. They test individual parts of your application in isolation. They are useful for testing shared components and functions that are used throughout the entire application. They are also useful for testing complex logic in a single component. They are fast to run and easy to write.

[Unit Test Example Code](../apps/react-vite/src/components/ui/dialog/confirmation-dialog/__tests__/confirmation-dialog.test.tsx)

### Integration Tests

Integration testing checks how different parts of your application work together. It's crucial to focus on integration tests for most of your testing, as they provide significant benefits and boost confidence in your application's reliability. While unit tests are helpful for individual parts, passing them doesn't guarantee your app will function correctly if the connections between parts are flawed. Testing various features with integration tests is vital to ensure that your application works smoothly and consistently.

[Integration Test Example Code](../apps/react-vite/src/app/routes/app/discussions/__tests__/discussion.test.tsx)

Integration tests in the react-vite app run against the real Express API backed by MongoDB Atlas (via `MONGODB_URI` in `.env`). Test helpers seed data directly into MongoDB and components make actual HTTP requests via Axios.

[Test Server Setup Example Code](../apps/react-vite/src/testing/test-server.ts)

[Test Utilities Example Code](../apps/react-vite/src/testing/test-utils.tsx)

### E2E

End-to-End Testing is a method that evaluates an application as a whole. These tests involve automating the complete application, including both the frontend and backend, to confirm that the entire system functions correctly. End-to-End tests simulate how a user would interact with the application.

[E2E Example Code](../apps/react-vite/e2e/tests/smoke.spec.ts)

Playwright starts both the Vite dev server and the MongoDB API server (using `MONGODB_URI`) before running E2E specs.

## Recommended Tooling:

#### [Vitest](https://vitest.dev)

Vitest is a powerful testing framework with features similar to Jest, but it's more up-to-date and works well with modern tools. It's highly customizable and flexible, making it a popular option for testing JavaScript code.

#### [Testing Library](https://testing-library.com/)

Testing library is a set of libraries and tools that makes testing easier than ever before. Its philosophy is to test your app in a way it is being used by a real world user instead of testing implementation details. For example, don't test what is the current state value in a component, but test what that component renders on the screen for its user. If you refactor your app to use a different state management solution for example, the tests should still be relevant as the actual component output to the user shouldn't change.

#### [Playwright](https://playwright.dev)

Playwright is a tool for running e2e tests in an automated way.
You define all the commands a real world user would execute when using the app and then start the test. It can be started in 2 modes:

- Browser mode - it will open a dedicated browser and run your application from start to finish. You get a nice set of tools to visualize and inspect your application on each step. Since this is a more expensive option, you want to run it only locally when developing the application.
- Headless mode - it will start a headless browser and run your application. Very useful for integrating with CI/CD to run it on every deploy.

#### MongoDB API (`apps/react-vite/server`)

The react-vite app uses a real Express + MongoDB API for development, testing, and E2E. Set `MONGODB_URI` in `.env` to point at Atlas or another MongoDB deployment.

[API Routes Example Code](../apps/react-vite/server/routes/auth.ts)

[Server App Factory Example Code](../apps/react-vite/server/app.ts)

Having a real API server means tests exercise the same routes, auth cookies, and serialization logic as production rather than a parallel mock implementation.

## React Vite Test Runbook

Before running tests in `apps/react-vite`, copy `.env.example` to `.env` and set `MONGODB_URI`. The test stack uses the configured MongoDB deployment; it does not start an in-memory database.

Recommended checks:

```bash
cd apps/react-vite
yarn check-types
yarn test --run
yarn test-e2e
```

- `yarn test` loads `src/testing/setup-tests.ts`, starts the Express API on port `8081` through `src/testing/test-server.ts`, sets `ENABLE_DEMO_SEEDING=false`, and lets test utilities seed users, teams, and discussions directly.
- `yarn test-e2e` uses Playwright `webServer` entries in `playwright.config.ts` to start `scripts/e2e-api-server.ts` on port `8080` and Vite on port `3000`.
- The discussions search E2E project logs in as `admin@demo.com`, so keep `ENABLE_DEMO_SEEDING=true` when running the full Playwright suite.
- Search tests and demos require Atlas Search. Run `yarn search:check-index` to confirm the `discussions_search` index is ready before relying on autocomplete behavior.
- If using a shared cluster, point `DATABASE_NAME` at a disposable database to avoid mixing local test data with another developer's data.
