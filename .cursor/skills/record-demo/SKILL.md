---
name: record-demo
description: >-
  Record a demo video for discussions search UI changes (autocomplete, fuzzy
  matching, filtered list). Use when completing BEN-15 or any Linear issue
  that requires a searchable typo demo artifact before opening a PR.
---

# Record discussions search demo

**Single source of truth:** `docs/discussions-search-demo.md`

Produce a screen recording that **visually proves** fuzzy typo search works. A video file alone is not sufficient.

## Workflow (do not skip steps)

1. Read `docs/discussions-search-demo.md` and `docs/linear/BEN-15.md`
2. Use **start-demo** skill — app must be running with MSW + demo seed
3. **Rehearse first** (must pass before recording):

```bash
cd apps/react-vite
yarn record:search-demo --rehearse
```

4. **Record**:

```bash
yarn record:search-demo
# Output: /opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm
```

5. Verify post-recording checklist in the demo spec (duration, size, on-screen moments)
6. Embed video in PR (BEN-16) — do **not** open PR until video passes

## Required on-screen moments

1. Login (`admin@demo.com` / `password123`)
2. Full discussions list on `/app/discussions`
3. Typo `desgn` typed slowly in search combobox (not pasted)
4. Autocomplete shows **Design review for dashboard refresh**
5. Search clicked → filtered to 1 result
6. Final state held ≥2s

## Prerequisites

`.env` in `apps/react-vite` (do not commit):

```env
VITE_APP_ENABLE_API_MOCKING=true
VITE_APP_ENABLE_DEMO_SEEDING=true
```

Cloud agents: save video to `/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm`

## PR embed

```markdown
## Demo

<video src="/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm"></video>
```

## Rules

- Rehearsal failure = do not record; fix implementation first
- Do not open or push the PR until video passes the demo spec checklist
- Do not commit `.env`
- Reject anti-patterns listed in `docs/discussions-search-demo.md`
