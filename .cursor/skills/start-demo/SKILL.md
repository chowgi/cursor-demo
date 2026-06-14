---
name: start-demo
description: >-
  Start the cursor-demo react-vite app (frontend + MongoDB API server).
  Use when the user asks to start, run, or launch the demo app.
disable-model-invocation: true
---

# Start cursor-demo app

Start the react-vite frontend and MongoDB Express API server.

## Pre-flight

Read `apps/react-vite/.env` (or `.env.example` if missing).

Requires `MONGODB_URI` in `.env`. Do not commit `.env`.

Both servers are required:

- **API:** `yarn dev:server` → `:8080`
- **Frontend:** `yarn dev` → `:3000`

## Steps

1. **Check `:8080`**:
   - `curl -s http://localhost:8080/api/healthcheck` — expect `{"ok":true}`
   - If down, run in background: `cd apps/react-vite && yarn dev:server`
   - Wait for log: `MongoDB API server started at http://localhost:8080/api`

2. **Check `:3000`**:
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` — expect `200`
   - If down, run in background: `cd apps/react-vite && yarn dev`
   - Wait for log: `ready in`

3. **Verify**:
   - `curl -s http://localhost:8080/api/healthcheck` → `{ ok: true }`
   - If API fails with missing `MONGODB_URI`, tell user to set it in `.env`

4. **Report**:
   - Frontend: http://localhost:3000
   - API: http://localhost:8080/api
   - Admin login: `admin@demo.com` / `password123`
   - Discussions: http://localhost:3000/app/discussions

If both servers were already up, say so and skip starting.

## Rules

- Do not commit.
- Do not install deps unless `node_modules` is missing.
- Do not kill existing servers unless one failed to start due to port conflict.
