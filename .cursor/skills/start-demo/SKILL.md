---
name: start-demo
description: >-
  Start the cursor-demo react-vite app (frontend + MongoDB API server).
  Use when the user asks to start, run, or launch the demo app.
disable-model-invocation: true
---

# Start cursor-demo app

Start the react-vite frontend and, when API mocking is off, the MongoDB Express API server.

## Pre-flight

Read `apps/react-vite/.env` (or `.env.example` if missing) to determine mode:

| `VITE_APP_ENABLE_API_MOCKING` | API source | Servers needed |
|-------------------------------|------------|----------------|
| `false` (default) | `yarn dev:server` → `:8080` | **Both** `:8080` + `:3000` |
| `true` | MSW in browser | `:3000` only |

Requires `MONGODB_URI` in `.env` when mocking is off. Do not commit `.env`.

## Steps

1. **Check `:8080`** (skip if mocking is on):
   - `curl -s http://localhost:8080/api/healthcheck` — expect `{"ok":true}`
   - If down, run in background: `cd apps/react-vite && yarn dev:server`
   - Wait for log: `MongoDB API server started at http://localhost:8080/api`

2. **Check `:3000`**:
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` — expect `200`
   - If down, run in background: `cd apps/react-vite && yarn dev`
   - Wait for log: `ready in`

3. **Verify** (when mocking is off):
   - `curl -s http://localhost:8080/api/healthcheck` → `{ ok: true }`
   - If API fails with missing `MONGODB_URI`, tell user to set it in `.env`

4. **Report**:
   - Frontend: http://localhost:3000
   - API (if running): http://localhost:8080/api
   - Admin login: `admin@demo.com` / `password123`
   - Discussions: http://localhost:3000/app/discussions

If both servers were already up, say so and skip starting.

## Rules

- Do not commit.
- Do not install deps unless `node_modules` is missing.
- Do not kill existing servers unless one failed to start due to port conflict.
