---
name: bug-fix-scope
description: Controls the blast radius of bug fixes and small improvements. Apply this skill on every fix, patch, or improvement task to prevent unintended changes.
---

# Bug Fix & Improvement Scope Rules

This skill defines strict boundaries for what the agent is allowed to change when fixing a bug or making an improvement. The goal is **surgical precision** — fix exactly what was asked, nothing more.

---

## The Golden Rule

> **If it wasn't broken and the prompt didn't mention it, don't touch it.**

---

## What You ARE Allowed to Do

- Modify the exact lines causing the reported bug.
- Add minimal code required to implement the requested improvement.
- Update imports **only** if the fix introduces a new dependency.
- Add or update a type if the fix requires it.

---

## What You Are NOT Allowed to Do

Unless the prompt explicitly asks for it:

- ❌ Do not rename variables, functions, or files.
- ❌ Do not reformat or re-indent untouched lines.
- ❌ Do not refactor surrounding logic, even if you think it's cleaner.
- ❌ Do not change the component/function structure (e.g., splitting or merging).
- ❌ Do not add, remove, or reorder imports beyond what the fix needs.
- ❌ Do not change Tailwind classes on elements unrelated to the fix.
- ❌ Do not upgrade or swap out libraries.
- ❌ Do not change file locations or folder structure.
- ❌ Do not modify any file not directly involved in the bug.

---

## Scope Escalation Protocol

If fixing the bug **requires** touching more than 2 files, or requires a structural change:

1. **STOP. Do not make changes.**
2. Explain clearly:
   - What the root cause is.
   - Why it requires broader changes.
   - Which files would need to be modified and why.
3. Wait for explicit approval before proceeding.

---

## Diff Size as a Signal

After making a fix, mentally check the diff:

- **< 10 lines changed** → Likely correct scope.
- **10–30 lines changed** → Double-check. Are all changes necessary?
- **> 30 lines changed** → Almost certainly out of scope. Re-evaluate.

---

## Examples

### ✅ Correct — Minimal fix
Prompt: *"The submit button doesn't disable while loading"*
```tsx
// Only change: add `disabled` prop condition
<button disabled={isLoading} className="...">
  {isLoading ? "Submitting..." : "Submit"}
</button>
```

### ❌ Wrong — Out of scope
Same prompt, but the agent also:
- Renames `isLoading` to `isPending`
- Extracts the button into a separate `SubmitButton` component
- Reformats the entire form JSX

That is three unrequested changes. Do not do this.

---

## Improvements vs Refactors

An **improvement** means making the requested feature better — not rewriting the surrounding code.

If you notice unrelated issues while working on a fix:
- Do **not** fix them silently.
- Mention them at the end of your response as a separate suggestion.
- Let the user decide whether to address them in a follow-up prompt.
