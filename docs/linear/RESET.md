# Reset Linear issues for fuzzy search demo retest

Use this when re-running the Cursor cloud agent workflow from scratch.

## 1. Merge demo spec (this repo)

Ensure `master` includes:

- `docs/discussions-search-demo.md`
- `docs/linear/BEN-*.md` issue templates
- `apps/react-vite/scripts/record-search-demo.ts`
- Updated `.cursor/skills/record-demo/SKILL.md`

## 2. Reset GitHub

- Close any open fuzzy-search PR (e.g. #17).
- Do **not** merge fuzzy implementation until the new demo passes BEN-15 checklist.
- Assign Cursor against **master** (or a fresh branch off master).

## 3. Reset Linear issue states

Set all issues to **Backlog** or **Todo** and clear assignee if you want a clean assign:

| Issue | Title | State | Notes |
|-------|-------|-------|-------|
| BEN-11 | Add fuzzy matching to discussions search | Todo | Parent — paste from `BEN-11.md` |
| BEN-12 | Backend fuzzy autocomplete/text search pipelines | Todo | |
| BEN-13 | MSW fuzzy mock handler | Todo | |
| BEN-14 | Integration test for desgn typo | Todo | |
| BEN-15 | Record demo video of fuzzy typo search | Todo | Paste from `BEN-15.md` |
| BEN-16 | Open PR with demo video attached | Todo | Paste from `BEN-16.md` |

Remove any "Done" checkmarks from descriptions; use the template bodies in this folder.

## 4. Assign Cursor

In Linear, assign **BEN-11** (or the parent project) to Cursor. The agent should:

1. Read `docs/discussions-search-demo.md` and `docs/linear/BEN-11.md`
2. Complete sub-issues in order BEN-12 → BEN-16
3. Run `yarn record:search-demo --rehearse` then `yarn record:search-demo` before opening PR
4. Embed video per BEN-16 template

## 5. Linear MCP (optional)

To let agents update Linear directly, authenticate the Linear MCP server in Cursor desktop: **Settings → MCP → Linear → Authenticate**.
