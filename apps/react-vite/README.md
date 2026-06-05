# React Vite Application

## Get Started

Prerequisites:

- Node 20+
- Yarn 1.22+

To set up the app execute the following commands.

```bash
git clone https://github.com/alan2207/bulletproof-react.git
cd bulletproof-react
cd apps/react-vite
cp .env.example .env
yarn install
```

##### `yarn dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Demo Accounts

When `VITE_APP_ENABLE_DEMO_SEEDING=true` (default in `.env.example`), the mock API is pre-populated with a demo team, users, discussions, and comments.

| Role  | Email          | Password     |
| ----- | -------------- | ------------ |
| Admin | admin@demo.com | password123  |
| User  | jane@demo.com  | password123  |
| User  | alex@demo.com  | password123  |
| User  | sam@demo.com   | password123  |

Log in with any account above to explore pre-filled team data.

### Reset demo data

If you need a fresh seed:

- **Browser (MSW):** clear `localStorage` for the app origin (or remove the `msw-db` key).
- **Node mock server:** delete `mocked-db.json` in this app folder, then restart the server.

Restart the app after clearing storage so `initializeDb()` can re-seed.

##### `yarn build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://vitejs.dev/guide/static-deploy) for more information.
