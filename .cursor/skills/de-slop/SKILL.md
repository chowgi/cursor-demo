---
name: de-slop
description: >-
  Remove AI-generated cruft from changed files before committing. Scans the
  diff for redundant comments, obvious TODOs, excessive docstrings, and
  ephemeral scratch files — then strips them cleanly without touching logic.
---

# De-Slop

Cleans AI-generated artifacts from the working diff before a PR is opened. Keeps your actual changes; removes the noise that makes it obvious an agent wrote it.

## When to run

Run this automatically before every commit or PR open. Also available as `/de-slop` in the Cursor command palette.

## What it removes

**Redundant comments** — comments that restate what the code already says:
```ts
// Increment counter by 1
count += 1;
```

**Generic AI TODOs** — vague placeholders an agent left behind:
```ts
// TODO: Add error handling here
// TODO: Consider edge cases
// TODO: Improve this later
```

**Excessive docstrings** — JSDoc blocks on trivial functions that need no explanation:
```ts
/**
 * Returns the sum of two numbers.
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 */
const add = (a: number, b: number) => a + b;
```

**Ephemeral markdown files** — scratch files an agent created during its session:
- `PLAN.md`, `SCRATCH.md`, `NOTES.md`, `TODO.md` at repo root or feature level
- Any `.md` file not in `docs/`, `README.md`, or a designated notes directory

**Console noise** — `console.log` statements added for agent debugging (also caught by the adobe-standards rule, but de-slop removes them from the diff directly)

**Commented-out code blocks** — large blocks of old code the agent commented out "just in case"

## What it preserves

- All logic changes
- Legitimate JSDoc on public APIs and exported functions
- Comments that explain *why* (not *what*)
- Proper TODOs with ticket references: `// TODO: ENG-52 — handle rate limit response`
- All test files and test comments

## Steps

1. `git diff main` — get the full diff of changed files
2. Scan each changed file for the patterns above
3. Remove matching lines/blocks
4. Re-run `yarn lint --fix` to clean up any formatting side-effects
5. Stage the cleaned files

## Repo conventions

- This project uses Prettier + ESLint — always run lint after de-slop
- Do not remove comments in `__tests__/` files — test intent comments are legitimate
- Do not touch `.cursor/rules/` or `.cursor/skills/` files
