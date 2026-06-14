# BEN-16 — Open PR with demo video attached

**State:** Todo  
**Parent:** BEN-11  
**Blocked by:** BEN-15

## Description

Open (or update) the PR only after BEN-15 demo video passes the on-screen checklist.

## PR blocked until

- [ ] BEN-12, BEN-13, BEN-14 complete
- [ ] BEN-15 complete — video passes checklist in `docs/discussions-search-demo.md`
- [ ] `yarn check-types && yarn test --run` green in `apps/react-vite`
- [ ] `yarn record:search-demo --rehearse` green

## PR body must include

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

## Agent instruction

Do **not** create or mark PR ready until BEN-15 video is recorded, verified, and embedded.
