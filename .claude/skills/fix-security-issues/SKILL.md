---
name: fix-security-issues
description: Read pending issues from security-issues.json across four categories — Vulnerability, Reliability, Maintainability, Duplicated Code — and ship safe, reviewable fixes as small PRs. Use when asked to run a security/quality scan or fix, or when referencing fix-security-issues / security-issues.json. Never touches the real .env, always verifies with build/lint/test before pushing, and never auto-merges.
---

# Fix Security Issues Skill

Reads issues already recorded in `security-issues.json` and fixes them directly in the code, one issue at a time. Covers four categories:

| Category | What it covers |
|---|---|
| **Vulnerability** | SQL injection, XSS, hardcoded secrets, vulnerable packages, missing auth |
| **Reliability** | Bugs likely to cause incorrect behavior or crashes at runtime (null/undefined access, unhandled rejections, `==` vs `===`, off-by-one, resource leaks) |
| **Maintainability** | Code smells that don't change behavior but hurt long-term upkeep (dead code, magic numbers, excessive nesting/complexity, misleading naming) |
| **Duplicated Code** | Near-identical blocks that should be consolidated into a shared function/module |

## How this skill actually works (read this first)

- **The source of truth is `security-issues.json`, not a fresh blind scan.** This skill does not regenerate issues by pattern-matching the whole repo from scratch each run. Issues are added to the JSON (by a prior scan, an external tool export, or manual entry) with a `category` field; this skill's job is to read the **pending** ones and fix them.
- **Every fix is a targeted, manual edit — never a blind find/replace.** For each issue, open the file at `file_path`/`line_number`, read the actual surrounding code, and apply the minimal change that resolves that specific issue. Do not run repo-wide regex substitutions, even if a `fix_template` looks like it would "just work" elsewhere — the template is a reference for the *shape* of the fix, not a script to execute blindly.
- The repo also has a legacy `simple-fix.js` (invoked by `fix-security-issues.ps1`/`.cmd`) that does its own crude regex scan/fix over `src/vulnerable-*.js` demo fixtures and pushes/PRs with no verification step. **Do not use it as the fixing mechanism for real issues** — it predates these guardrails and skips build/lint/test entirely. It's fine as a toy example, not as how this skill operates.

## ⚠️ Safety Guardrails (read before running --all)

The team is significantly behind on security and quality, so this skill will touch a lot of code. Because of that,
**every fix must be safe by default and reviewable in small pieces** — do not optimize for speed over correctness.
**These guardrails apply to all four categories equally** — Reliability/Maintainability/Duplicated-Code fixes get
the same scrutiny as Vulnerability fixes, not a lighter process.

1. **Never read, write, or overwrite the real `.env` file.** It contains live credentials and must never be
   modified, copied, printed, or included in a commit, PR description, log, or chat output.
2. **Only ever touch `.env.example`**, and only to add a new placeholder line (`VAR_NAME=your-value-here`) when a
   fix introduces a new required environment variable. Never put a real secret value in `.env.example`.
3. **Every PR that introduces a new env var must include an "⚠️ Action required before merge" section** in the
   PR description, naming the exact variable(s) that must be set in the real deployment environment / secrets
   manager. Merging without doing this will break the app — say so explicitly, don't assume the reader knows.
4. **Verify before pushing.** After applying fixes and before creating the branch/PR, run the project's existing
   build/lint/test commands (whatever the repo defines — e.g. `npm run build`, `npm test`). If a fix causes a
   failure, do not include it in the PR — revert just that file/change and mark the issue `needs_manual_review`
   in `security-issues.json` instead of shipping it silently.
5. **Keep fixes minimal and behavior-preserving.** Fix only the specific issue — no unrelated refactoring,
   renaming, or "while I'm here" cleanup. Smaller diffs are easier to verify are safe.
6. **Never auto-merge.** `AUTO_MERGE_LOW_RISK_FIXES` must stay `false`. Every PR requires explicit human review
   and approval, no exceptions, until the team says otherwise.
7. **Prefer several small PRs over one large batch.** Group by category and vulnerability/issue type rather than
   fixing everything in one PR — this lets the reviewer verify each batch didn't break anything before the next
   one goes out, instead of reviewing 40+ changes at once under time pressure.
8. **Duplicated Code and Maintainability fixes need extra caution because they touch structure, not just a line.**
   Only consolidate duplicated blocks when they are byte-identical (or differ only in trivially-renamed
   identifiers) and extracting them into a shared function provably preserves behavior for every call site. Only
   remove "dead code" when the build/lint tooling confirms it's unused (e.g. an unused-exports check), not just
   because it looks unused. If a fix is ambiguous or would require touching many call sites to stay consistent,
   mark it `needs_manual_review` instead of forcing a structural change.

## Issue Categories

| Category | Example issue types | Example safe fix |
|---|---|---|
| **Vulnerability** | `sql_injection`, `xss_vulnerability`, `hardcoded_secrets`, `vulnerable_packages`, `missing_authentication` | Parameterize the query; swap `.innerHTML` for `.textContent`; move the secret to `process.env.X` + `.env.example` placeholder; bump the package version; add the auth middleware |
| **Reliability** | `null_reference`, `unhandled_promise_rejection`, `loose_equality`, `off_by_one`, `resource_leak`, `missing_error_handling` | Add a null/undefined guard; add `.catch()` or `try/catch`; change `==`/`!=` to `===`/`!==`; fix the boundary condition; close/release the resource in a `finally` |
| **Maintainability** | `dead_code`, `magic_number`, `deep_nesting`, `long_function`, `misleading_name` | Delete confirmed-unused code; extract the literal into a named constant; return early to flatten nesting — only when it doesn't change control flow |
| **Duplicated Code** | `duplicate_block` | Extract the identical block into one shared function/module and call it from every original location |

Only Vulnerability issue types currently have entries in `security-issues.json` — Reliability, Maintainability, and
Duplicated Code issues get added the same way (manually, or from an external scan) with a `category` field set.

## Issue JSON Schema

Each issue in `security-issues.json` should carry a `category` field with one of the four exact values:
`"Vulnerability"`, `"Reliability"`, `"Maintainability"`, `"Duplicated Code"`.

```json
{
  "id": "REL-001",
  "title": "Unhandled promise rejection in fetchUser",
  "description": "fetchUser() is called without a .catch(), so a rejected promise crashes the process",
  "category": "Reliability",
  "severity": "high",
  "vulnerability_type": "unhandled_promise_rejection",
  "file_path": "src/api/users.js",
  "line_number": 18,
  "code_snippet": "fetchUser(id).then(user => res.json(user));",
  "detection_type": "manual",
  "status": "pending",
  "suggested_fix": "Add a .catch() handler or wrap in try/catch with async/await",
  "pr_number": null,
  "pr_url": null,
  "merged": false,
  "assigned_to": null,
  "notes": ""
}
```

**Legacy issues without a `category` field** (all the existing `SEC-*` entries) are treated as `"Vulnerability"`,
inferred from their existing `vulnerability_type`. Don't rewrite those entries just to backfill the field unless
you're already touching them for something else — that would violate guardrail #5.

## Quick Start

```bash
/fix-security-issues --all
```

This:
1. 🔍 Loads pending issues from `security-issues.json` (all four categories)
2. 🔧 Fixes each one directly, with a targeted edit — not a blind repo-wide replace
3. 🌳 Creates one branch per category+type batch from `main`
4. ✅ Verifies with build/lint/test before anything is pushed
5. 📤 Pushes each verified batch and opens a GitHub PR

To scope a run to one category:

```bash
/fix-security-issues --category=Reliability
```

Valid values: `Vulnerability`, `Reliability`, `Maintainability`, `"Duplicated Code"` (quote it — it has a space).

---

## Complete Workflow

### Step 1: Load
- Reads `security-issues.json`, filters to `status: "pending"`
- Groups issues by `category`, then by `vulnerability_type`/issue type within category
- If `--category=X` was passed, drops everything outside that category

### Step 2: Fix (per issue)
- Opens `file_path` at `line_number`, reads the real surrounding code
- Applies the minimal, targeted fix for that specific issue (see Issue Categories table above)
- Does **not** touch unrelated code in the same file
- If the fix is ambiguous or risky (see guardrail #8), marks the issue `needs_manual_review` and skips it —
  does not force a fix just to close out the batch

### Step 3: Verify
- Runs the repo's build/lint/test commands
- Any issue whose fix breaks verification is reverted and marked `needs_manual_review`, not shipped

### Step 4: Branch, Commit & Push (per batch)
- Creates a branch per category+type batch: `{category-slug}/fix-{type}-{id}`
  (`security/fix-sql-injection-SEC-001`, `reliability/fix-null-reference-REL-001`,
  `maintainability/fix-dead-code-MNT-001`, `duplication/fix-duplicate-block-DUP-001`)
- Stages only the files fixed in that batch, commits, pushes

### Step 5: Create GitHub PR (per batch)
- Opens a PR from the batch branch to `main`
- Labels: `auto-fix` plus the category slug (`security`, `reliability`, `maintainability`, `duplication`)
- Description includes: issue details, before/after code, and the "⚠️ Action required before merge" section
  if a new env var was introduced (guardrail #3)

### Step 6: Update tracking
- Updates each fixed issue's `status`, `pr_number`, `pr_url` in `security-issues.json`
- Issues that couldn't be safely fixed are set to `status: "needs_manual_review"` with a note explaining why

---

## Commands

- `/fix-security-issues --all` — fix all pending issues across all four categories, in small per-batch PRs
- `/fix-security-issues --category=<name>` — scope to one category (`Vulnerability`, `Reliability`,
  `Maintainability`, or `"Duplicated Code"`)
- `/fix-security-issues --report` — summarize current status from `security-issues.json`, no fixes applied

## Branch & PR Naming

- Branch: `{category-slug}/fix-{type}-{id}` — e.g. `security/fix-sql-injection-SEC-001`
- PR title: `🔒 Fix {issue title}` for Vulnerability, `🛠️ Fix {issue title}` for the other three categories

## Notes

- All fixes are reviewed before merge — nothing here auto-merges, regardless of category or severity.
- False positives, or issues judged unsafe to auto-fix, should be marked `needs_manual_review` /
  `false_positive` in `security-issues.json` with a `notes` explanation, not silently dropped.
- If `security-issues.json` has no pending issues in a requested category, say so plainly rather than inventing
  something to fix.
