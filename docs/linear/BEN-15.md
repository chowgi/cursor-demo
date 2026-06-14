# BEN-15 — Record demo video of fuzzy typo search

**State:** Todo  
**Parent:** BEN-11

## Description

Record a screen video that **visually proves** fuzzy typo search works. A video file alone is **not** done — the recording must show each on-screen moment below clearly for at least 1.5 seconds.

**Full spec:** `docs/discussions-search-demo.md`  
**Skill:** `.cursor/skills/record-demo/SKILL.md`

## Preconditions (verify before recording)

- [ ] App running at http://127.0.0.1:3000 (use **start-demo** skill)
- [ ] `.env` has `VITE_APP_ENABLE_API_MOCKING=true` and `VITE_APP_ENABLE_DEMO_SEEDING=true` (do not commit)
- [ ] `/app/discussions` shows **Design review for dashboard refresh** in demo seed
- [ ] `yarn record:search-demo --rehearse` passes (all selectors + assertions green)

## Required on-screen moments (ALL must appear in video)

1. **Login** — admin@demo.com logged in, redirected to /app
2. **Discussions list** — full list visible before search
3. **Typo typing** — `desgn` typed visibly in "Search discussions" combobox (slow typing, not paste)
4. **Autocomplete** — dropdown open; option "Design review for dashboard refresh" visible
5. **Search submit** — click Search; "Showing results for: desgn" + exactly 1 table row
6. **Hold** — final filtered state visible ≥2s

## Recording command

```bash
cd apps/react-vite
yarn record:search-demo --rehearse   # must pass first
yarn record:search-demo
# Output: /opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm
```

## Definition of done

- [ ] Rehearsal passes with zero failures
- [ ] Video ≥15s and ≥500 KB
- [ ] Video shows all 6 on-screen moments above
- [ ] Video saved to artifact path

## Anti-patterns (reject)

- Video is only login or a static page
- Autocomplete never opens
- Query pasted instantly
- Agent only ran unit tests and skipped recording
