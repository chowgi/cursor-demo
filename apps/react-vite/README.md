# React Vite Application

## Get Started

Prerequisites:

- Node 20+
- Yarn 1.22+
- MongoDB via `MONGODB_URI` in `.env` (use Atlas for discussion search/autocomplete)

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

##### `yarn dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Demo Accounts

When `ENABLE_DEMO_SEEDING=true` (default in `.env.example`), the API is pre-populated with a demo team, users, discussions, and comments on server startup.

| Role  | Email          | Password    |
| ----- | -------------- | ----------- |
| Admin | admin@demo.com | password123 |
| User  | jane@demo.com  | password123 |
| User  | alex@demo.com  | password123 |
| User  | sam@demo.com   | password123 |

Log in with any account above to explore pre-filled team data.

Discussion search and autocomplete require a MongoDB Atlas Search index. See [Search Setup](./SEARCH_SETUP.md) for index creation, behavior, and troubleshooting.

### Reset demo data

Drop the `cursor-demo` database in MongoDB (or remove demo collections), then restart `yarn dev:server` to re-seed.

##### `yarn build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://vitejs.dev/guide/static-deploy) for more information.

## Testing

- **Unit / integration tests:** `yarn test` — requires `MONGODB_URI` and runs the real Express API. Test helpers seed data directly into MongoDB.
- **E2E tests:** `yarn test-e2e` — requires `MONGODB_URI`; Playwright starts the API server and Vite dev server automatically.
