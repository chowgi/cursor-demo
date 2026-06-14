# Discussions Search Demo Spec

Screen recording spec for fuzzy typo search on `/app/discussions`. Cloud agents and local devs follow this document; Linear issues BEN-15 and BEN-16 reference it.

## Goal

Produce a video that **visually proves** typo query `desgn` matches **Design review for dashboard refresh** in autocomplete and full search. A video file alone is not sufficient — every on-screen moment below must appear clearly for at least 1.5 seconds.

## Preconditions (verify before recording)

1. App running at `http://127.0.0.1:3000` (use the **start-demo** skill).
2. `.env` in `apps/react-vite` (do not commit):

```env
VITE_APP_ENABLE_API_MOCKING=true
VITE_APP_ENABLE_DEMO_SEEDING=true
```

3. Log in manually or via script: `admin@demo.com` / `password123`.
4. `/app/discussions` shows demo seed data including **Design review for dashboard refresh**.
5. Rehearsal passes:

```bash
cd apps/react-vite
yarn record:search-demo --rehearse
```

## Required on-screen moments

| # | Moment | What the viewer must see |
|---|--------|--------------------------|
| 1 | Login | Email/password filled; app navigates to `/app` |
| 2 | Discussions list | Full table before search (multiple rows) |
| 3 | Typo typing | `desgn` typed character-by-character in the search combobox (no paste) |
| 4 | Autocomplete | Dropdown open with **Design review for dashboard refresh** |
| 5 | Search submit | Click Search; banner "Showing results for: desgn" and exactly 1 row |
| 6 | Hold | Filtered state visible ≥2s before recording ends |

## Recording

```bash
cd apps/react-vite
npx playwright install chromium   # first run only
yarn record:search-demo
```

Output: `/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm`

## Post-recording verification

Before opening a PR (BEN-16), confirm:

- [ ] Rehearsal (`yarn record:search-demo --rehearse`) passed with zero failures
- [ ] Video file exists at the path above
- [ ] Video duration ≥15 seconds
- [ ] Video size ≥500 KB
- [ ] All six on-screen moments are visible to a human viewer

## PR embed

```markdown
## Demo

<video src="/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm"></video>

### On-screen checklist
- [ ] Login
- [ ] Full discussions list
- [ ] Typo `desgn` typed in combobox
- [ ] Autocomplete suggestion visible
- [ ] Filtered search result (1 row)
- [ ] Final state held ≥2s
```

## Anti-patterns (reject)

- Video is only a login screen or static page
- Autocomplete dropdown never opens
- Query pasted instantly with no visible typing
- Agent ran unit tests only and skipped recording
- Video under 15s or under 500 KB
- PR opened before video passes this checklist

## Related paths

- `apps/react-vite/scripts/record-search-demo.ts` — rehearse + record script
- `.cursor/skills/record-demo/SKILL.md` — agent skill
- `.cursor/skills/start-demo/SKILL.md` — start dev server
- `docs/linear/` — Linear issue templates for BEN-11 … BEN-16
