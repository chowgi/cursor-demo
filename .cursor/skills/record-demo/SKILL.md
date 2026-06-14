---
name: record-demo
description: >-
  Record a demo video for discussions search UI changes (autocomplete, fuzzy
  matching, filtered list). Use when completing search-related Linear issues,
  before opening a PR, or when the issue requires a demo video artifact.
---

# Record discussions search demo

Produce a screen recording that proves fuzzy/typo search works end-to-end. Full acceptance criteria and recording steps live in the Linear issue (e.g. BEN-15) — read that issue before recording.

## Demo script

1. Log in at `/auth/login` with `admin@demo.com` / `password123`
2. Open `/app/discussions`
3. Type `desgn` (typo) in the search combobox
4. Confirm autocomplete suggests **Design review for dashboard refresh**
5. Click **Search** — table filters to that discussion
6. (Optional) Type `xyznotfound` → empty state; clear → full list restored

## Prerequisites

1. Use the **start-demo** skill if the app is not running (requires `MONGODB_URI` and demo seed via `ENABLE_DEMO_SEEDING=true`)
2. Atlas Search index must exist for full autocomplete — see `apps/react-vite/SEARCH_SETUP.md`. Regex fallback still works for basic search without Atlas.
3. Cloud agents: save video to `/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm`

## Record

```bash
cd apps/react-vite
npx playwright install chromium   # if needed
# Ensure yarn dev:server and yarn dev are running (start-demo skill)
# Record via Playwright (see Linear BEN-15) or yarn record:search-demo if that script exists on your branch
```

## PR requirement

Before opening the PR, embed the video under **Demo**:

```markdown
## Demo

<video src="/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm"></video>
```

## Rules

- Do not open or push the PR until the video is recorded and embedded
- Do not skip the video when the Linear issue DoD requires demo recording
- Do not commit `.env`
