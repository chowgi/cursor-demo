# React Vite Application

## Get Started

Prerequisites:

- Node 20+
- Yarn 1.22+
- MongoDB Atlas cluster with `MONGODB_URI` set in `.env` for the full demo, search, and test suite. A local MongoDB instance can run the API, but Atlas Search features require Atlas.

To set up the app execute the following commands.

```bash
git clone https://github.com/alan2207/bulletproof-react.git
cd bulletproof-react
cd apps/react-vite
cp .env.example .env
yarn install
```

Start the API and frontend (two terminals):

```bash
yarn dev:server   # MongoDB API on http://localhost:8080/api
yarn dev          # Vite app on http://localhost:3000
```

The API reads server-side configuration from `.env`:

| Variable              | Default                 | Purpose                                                |
| --------------------- | ----------------------- | ------------------------------------------------------ |
| `MONGODB_URI`         | none                    | Required MongoDB connection string                     |
| `APP_URL`             | `http://localhost:3000` | Allowed frontend origin for CORS                       |
| `APP_MOCK_API_PORT`   | `8080`                  | Express API port for dev and E2E runs                  |
| `ENABLE_DEMO_SEEDING` | `true`                  | Seeds demo team data when running `yarn dev:server`    |

##### `yarn dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Demo Accounts

When `ENABLE_DEMO_SEEDING=true` (default in `.env.example`), `yarn dev:server` upserts a demo team, users, 100 discussions, and comments on server startup.

| Role  | Email          | Password     |
| ----- | -------------- | ------------ |
| Admin | admin@demo.com | password123  |
| User  | jane@demo.com  | password123  |
| User  | alex@demo.com  | password123  |
| User  | sam@demo.com   | password123  |

Log in with any account above to explore pre-filled team data.

The first five discussions are stable fixtures for demos and search verification:

- `Improving new member onboarding`
- `Design review for dashboard refresh`
- `API versioning strategy`
- `Release checklist for v1.2`
- `Sprint retrospective notes`

Generated filler discussions avoid those fixture keywords so searches like `onboard`, `design`, `dashboard`, `api`, and `release` resolve to the expected rows. For Atlas Search index setup and limitations, see [SEARCH_SETUP.md](./SEARCH_SETUP.md).

### Reset demo data

Drop the `cursor-demo` database in MongoDB (or remove demo collections), then restart `yarn dev:server` to re-seed. The seed script uses fixed document IDs and upserts, so restarting the dev server refreshes known fixtures without deleting unrelated data.

##### `yarn build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://vitejs.dev/guide/static-deploy) for more information.

## Testing

- **Unit / integration tests:** `yarn test` — starts the real Express API on port 8081 through `src/testing/test-server.ts` and uses `MONGODB_URI`. Demo seeding is disabled; tests create their own users, teams, and discussions.
- **E2E tests:** `yarn test-e2e` — Playwright starts the Express API on port 8080 via `scripts/e2e-api-server.ts` plus the Vite dev server on port 3000. These tests use the configured MongoDB database, not an in-memory or ephemeral database.
- **Search recording project:** the `discussions-search-recording` Playwright project logs in as `admin@demo.com`, so the target database must already contain the demo seed data and a ready Atlas Search index.
