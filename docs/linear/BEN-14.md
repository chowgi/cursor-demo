# BEN-14 — Integration test for desgn typo

**State:** Todo  
**Parent:** BEN-11

## Description

Add an integration test proving typo query `desgn` matches "Design review for dashboard refresh" in autocomplete and filtered list.

## Acceptance criteria

- [ ] Test types `desgn` in search combobox
- [ ] Autocomplete shows the design review discussion
- [ ] Submit search filters table to that row only
- [ ] `yarn test --run` passes

## Key file

`apps/react-vite/src/app/routes/app/discussions/__tests__/discussions.test.tsx`
