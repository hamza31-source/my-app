---
name: fix-security-issues
description: Use when asked to scan for, fix, or report on security vulnerabilities in my-app — e.g. "run the security fixer", "fix security issues", "scan for vulnerabilities", or when working with security-issues.json or simple-fix.js. Detects XSS, SQL injection, and missing auth, and ships fixes as small, verified, human-reviewed PRs. Deliberately does NOT scan or fix hardcoded secrets.
version: 2.1.0
---

# Fix Security Issues

Detects and fixes security vulnerabilities in this repo, then ships each fix as a
small, reviewable PR. The underlying scanner/fixer is `simple-fix.js`
(invoked via `fix-security-issues.ps1` / `fix-security-issues.cmd`).

## Guardrails (non-negotiable)

These were added after real incidents on this project (see PRs #7-#12) and must
not be dropped just because a request asks for "more automation":

1. **Never scan or fix hardcoded secrets.** This category is out of scope for
   this tool entirely — it is not detected, reported, or auto-fixed. Past runs
   produced code that read a new env var with no real value ever set anywhere,
   risking breakage of the running app. Hardcoded secrets require manual
   security review, not pattern-based auto-fixing. If you notice one while
   working in this codebase, flag it to a human — do not modify it via this
   skill.
2. **Never touch the real `.env`.** If some other fix needs a new env var
   for an unrelated reason, add a placeholder to `.env.example` only, and call
   out in the PR description that a human must set the real value before
   merging. Never invent or write a real secret value anywhere.
3. **Verify before pushing.** Run the project's build/lint/test commands
   against the fixed code and confirm they pass before committing. If there is
   no test coverage for the touched code, say so explicitly in the PR instead
   of silently skipping verification.
4. **Small, single-purpose PRs.** One vulnerability class (or a tightly
   related group in one file) per PR — do not batch unrelated fixes across
   many files into one giant PR.
5. **No auto-merge, ever.** Open the PR and stop. A human merges it.
6. **Check for overlapping work first.** Before creating a new branch, check
   open PRs and existing branches (`gh pr list`, `git branch -r`) for ones
   touching the same files. If a sibling PR already fixes the same issue,
   don't open a duplicate — note the conflict instead.
7. **Don't trust `security-issues.json` status blindly.** Its `status`/
   `pr_number` fields have drifted from reality before (entries marked
   `auto_fixed` with no corresponding code change). Before reporting an issue
   as fixed or linking a PR number, verify against actual `git diff`/GitHub
   state, not just the JSON.

## Workflow

### 1. Scan
Scans every `.js` file in `src/` for pattern-based issues (fixed 2026-08-05 —
it previously only matched `src/vulnerable-*.js`, a leftover demo-fixture
pattern that doesn't exist in this repo, so it silently found nothing):

| Issue Type | Detection pattern |
|---|---|
| XSS | `.innerHTML =` assignment |
| SQL injection | Template-literal `SELECT ... ${...}` queries |
| Missing authentication | `app.post('/api/process-payment', (req, res) => ...)` with no auth middleware |

Hardcoded secrets are intentionally excluded (guardrail 1). Record findings,
but reconcile against actual file contents — don't just append to
`security-issues.json` (see guardrail 7).

### 2. Fix
Apply the minimal, behavior-preserving fix for the issue type:
- XSS → `.innerHTML =` → `.textContent =`.
- SQL injection → convert to a parameterized query.
- Missing auth → insert the appropriate auth middleware into the route.

### 3. Verify
Run this project's build/lint/test commands on the changed files. Do not
proceed to commit/push if verification fails or can't be run — report the
blocker instead.

### 4. Branch, commit, push
- Check for overlapping open PRs/branches first (guardrail 6).
- Branch from up-to-date `main`: `security/fix-{type}-{short-id}`.
- Stage only the files relevant to this one fix.
- Commit with a descriptive security-fix message.
- Push the branch.

### 5. Open a PR (never merge)
Open a PR from the branch to `main` describing:
- What was vulnerable and where.
- The fix applied (before/after).
- Verification performed (or why it couldn't be).

Stop there — do not merge, and do not mark the issue "fixed" in
`security-issues.json` until the PR is actually merged and verified in `main`.

## Related
- `simple-fix.js` — the actual scan/fix/branch/push implementation.
- `security-issues.json` — issue tracking; treat status fields as
  unverified until cross-checked (guardrail 7).
- `/code-review` — use to review the PR this skill opens.
