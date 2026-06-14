---
name: record-demo
description: >-
  Record a demo video for discussions search UI changes (autocomplete, fuzzy
  matching, filtered list). Use when completing BEN-15 or any Linear issue
  that requires a searchable typo demo artifact before opening a PR.
---

# Record discussions search demo

Produce a screen recording that **visually proves** fuzzy typo search works. A video file alone is not sufficient — every on-screen moment below must appear clearly for at least 1.5 seconds.

## Workflow (do not skip steps)

1. Use **start-demo** skill — app must be running with MSW + demo seed
2. **Rehearse first** — run through the demo flow and verify every selector/assertion passes before recording
3. **Record** with slow typing and pauses (see Recording method)
4. Verify post-recording checklist below
5. Embed video in PR — do **not** open PR until video passes

## Required on-screen moments

1. Login (`admin@demo.com` / `password123`) → redirected to `/app`
2. Full discussions list on `/app/discussions` (multiple rows visible)
3. Typo `desgn` typed slowly in search combobox (≥80ms/char, not pasted)
4. Autocomplete dropdown open with **Design review for dashboard refresh**
5. Search clicked → banner "Showing results for: desgn" and exactly 1 table row
6. Final filtered state held ≥2s before recording ends

## Prerequisites

`.env` in `apps/react-vite` (do not commit):

```env
VITE_APP_ENABLE_API_MOCKING=true
VITE_APP_ENABLE_DEMO_SEEDING=true
```

Cloud agents: save video to `/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm`

## Recording method

```bash
cd apps/react-vite
npx playwright install chromium   # first run only
yarn dev --port 3000 --host 127.0.0.1   # background, MSW mode
```

Use Playwright with:

- `pressSequentially('desgn', { delay: 90 })` — visible typing
- `waitFor` on autocomplete option and filtered row — fail loudly if missing
- `waitForTimeout(1500)` after dropdown opens and after search results render
- `waitForTimeout(2000)` on final frame before closing

Do **not** use headless capture without pauses. Do **not** swallow assertion failures.

## Post-recording verification

- [ ] Rehearsal passed with zero failures
- [ ] Video ≥15s and ≥500 KB
- [ ] All 6 on-screen moments visible to a human viewer

## PR embed

```markdown
## Demo

<video src="/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm"></video>
```

## Rules

- Rehearsal failure = do not record; fix implementation first
- Do not open or push the PR until video passes the checklist above
- Do not commit `.env`

## Anti-patterns (reject)

- Video is only login or a static page
- Autocomplete never opens
- Query pasted instantly
- Agent ran unit tests only and skipped recording
- PR opened before video passes checklist
