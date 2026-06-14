# BEN-11 — Add fuzzy matching to discussions search (Atlas Search)

**State:** Todo  
**Labels:** (as needed)

## Description

Customer requirement: discussions search must tolerate typos while typing, including in the autocomplete dropdown.

Use MongoDB Atlas Search **fuzzy** options on the existing `autocomplete` and `text` operators (`maxEdits: 1`). No index change required — fuzzy is query-time.

This is the parent tracking issue. Complete sub-issues **in order**: BEN-12 → BEN-16.

**Demo spec (repo):** `docs/discussions-search-demo.md`

## Definition of done

- [ ] All sub-issues complete (BEN-12 → BEN-16)
- [ ] Typo query `desgn` matches "Design review for dashboard refresh" in autocomplete and full search
- [ ] `yarn check-types && yarn test --run` pass in `apps/react-vite`
- [ ] `yarn record:search-demo --rehearse` passes
- [ ] Demo video recorded and shows all on-screen moments in `docs/discussions-search-demo.md`
- [ ] PR opened with demo video embedded (BEN-16)

## Key paths

- `apps/react-vite/server/search/discussions-search-pipelines.ts`
- `apps/react-vite/server/search/discussions-search-config.ts`
- `apps/react-vite/src/testing/mocks/handlers/discussions.ts`
- `apps/react-vite/scripts/record-search-demo.ts`
- `apps/react-vite/SEARCH_SETUP.md`
- `docs/discussions-search-demo.md`

## Cloud agent instructions

1. Read `docs/discussions-search-demo.md` before recording.
2. Use **record-demo** skill for BEN-15; complete BEN-16 last.
3. Do **not** open the PR until the video passes the post-recording checklist in the demo spec.
