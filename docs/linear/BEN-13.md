# BEN-13 — MSW fuzzy mock handler

**State:** Todo  
**Parent:** BEN-11

## Description

Mirror fuzzy typo tolerance in MSW so tests and demo recordings work without Atlas.

- Add Levenshtein-based fuzzy helper (e.g. `src/testing/mocks/fuzzy-search.ts`)
- Update discussions MSW handler to match typo queries like `desgn` → "Design review…"

## Acceptance criteria

- [ ] MSW suggestions endpoint returns fuzzy matches
- [ ] MSW full search endpoint returns fuzzy matches
- [ ] Works with demo seed data when `VITE_APP_ENABLE_DEMO_SEEDING=true`

## Key file

`apps/react-vite/src/testing/mocks/handlers/discussions.ts`
