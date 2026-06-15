---
name: de-slop
description: >-
  Remove AI-generated code slop from the current branch diff. Use when the user
  runs /de-slop or asks to clean up AI-assisted changes before review.
disable-model-invocation: true
---

# Remove AI code slop

Check the diff against the base branch (`git diff master...HEAD`, or the current PR base if different), and remove all AI generated slop introduced in this branch.

## Focus areas

- Extra comments that a human wouldn't add or is inconsistent with the rest of the file
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted / validated codepaths)
- Casts to `any` used only to bypass type issues
- Deeply nested code that should be simplified with early returns
- Any other style that is inconsistent with the file and surrounding codebase

## Adobe-specific slop

Also remove slop that violates `.cursor/rules/adobe-standards.mdc`:

- Leftover `console.log` or `print` statements
- Inline prop types instead of co-located interfaces
- Superficial a11y labels added only to satisfy lint without matching real UX
- Tests that assert nothing meaningful (placeholder coverage)

## Guardrails

- Keep behavior unchanged unless fixing a clear bug.
- Prefer minimal, focused edits over broad rewrites.
- Report at the end with only a 1–3 sentence summary of what you changed.
