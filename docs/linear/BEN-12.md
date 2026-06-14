# BEN-12 — Backend fuzzy autocomplete/text search pipelines

**State:** Todo  
**Parent:** BEN-11

## Description

Add query-time fuzzy matching to Atlas Search pipelines.

- Create `discussions-search-config.ts` with `{ maxEdits: 1 }`
- Apply `fuzzy` to both `autocomplete` and `text` operators in:
  - `buildDiscussionSuggestionsPipeline`
  - `buildDiscussionSearchPipeline`
- No index change required

## Acceptance criteria

- [ ] `fuzzy: { maxEdits: 1 }` on autocomplete and text in both pipelines
- [ ] Shared config exported from `discussions-search-config.ts`
- [ ] `SEARCH_SETUP.md` updated to document fuzzy behavior

## Key file

`apps/react-vite/server/search/discussions-search-pipelines.ts`
