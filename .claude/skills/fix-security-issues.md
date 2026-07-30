# Fix Security Issues Skill

Automated security vulnerability detection, fixing, and reporting for the my-app project.

**Implementation:** `.claude/scripts/fix-security-issues.ps1`  
**Requires:** `GITHUB_TOKEN` in `.env` (✓ configured)

## Quick Start

When you type `/fix-security-issues`, Claude will execute this skill:

```
/fix-security-issues --all
```

This **automatically**:
1. 🔍 Detects all security issues in your code
2. 🔧 Fixes them automatically
3. 🌳 Creates a new branch from `main`
4. 📤 Pushes code to GitHub
5. 🔗 Creates a GitHub PR

---

## Complete Workflow

When you run:

```bash
fix-security-issues --all
```

### Step 1: Scan
- Scans all `.js`, `.ts`, `.jsx`, `.tsx` files
- Detects vulnerabilities (SQL injection, XSS, hardcoded secrets, etc.)
- Saves results to `security-issues.json`

### Step 2: Auto-Fix
- Applies fix templates automatically
- Modifies vulnerable code files locally
- Follows security best practices

### Step 3: Create Branch
- Creates new branch: `security/fix-{type}-{id}` from `main`
- Example: `security/fix-sql-injection-SEC-001`
- Ensures main branch stays clean

### Step 4: Commit & Push
- Stages all fixed files
- Creates commit with security fix message
- Pushes branch to GitHub

### Step 5: Create GitHub PR
- Creates pull request on GitHub
- Adds labels: `security`, `auto-fix`
- Includes:
  - Vulnerability details
  - Before/after code comparison
  - Security guidelines
  - PR link: `https://github.com/YOUR_OWNER/my-app/pull/XXX`


---

## Commands

- `fix-security-issues --all` - **Full workflow** (scan + fix + PR) ⭐ **RECOMMENDED**

## What Gets Fixed Automatically

The system automatically detects and fixes:

| Issue Type | Detection | Fix |
|-----------|-----------|-----|
| **SQL Injection** | `SELECT * FROM users WHERE id = ${id}` | Convert to parameterized queries |
| **XSS Vulnerability** | `.innerHTML = userInput` | Change to `.textContent` |
| **Hardcoded Secrets** | `const API_KEY = "sk-..."` | Move to `process.env.API_KEY` |
| **Vulnerable Packages** | Old versions in package.json | Update to safe versions |
| **Missing Authentication** | `app.get('/api/users', (req, res) => {` | Add `authenticateUser` middleware |

## Full Workflow Details

### 1️⃣ Scan Phase
```
Your Code → Pattern Matcher → Finds Issues → security-issues.json
```
- Scans all project files
- Matches against 5 vulnerability patterns
- Creates issue records with ID, severity, location

### 2️⃣ Fix Phase
```
Vulnerable Code → Apply Template Fix → Fixed Code (local)
```
- Applies pre-built fix templates
- Maintains code style
- Follows security best practices
- NO changes committed yet

### 3️⃣ Branch Phase
```
main branch → Create new branch → security/fix-{type}-{id}
```
- Creates feature branch from main
- Keeps main clean
- Branch ready for PR

### 4️⃣ Commit & Push Phase
```
Fixed Files → git add → git commit → git push origin branch
```
- Stages all modified files
- Creates commit with security message
- Pushes to GitHub
- Branch now visible on GitHub

### 5️⃣ GitHub PR Phase
```
GitHub API → Create Pull Request → PR #500 Created
```
- Opens PR from feature branch to main
- Adds labels: `security`, `auto-fix`
- Includes detailed description:
  - What was vulnerable
  - How it was fixed
  - Before/after code
  - Security guidelines link

### 6️⃣ Slack Notification Phase
```
GitHub → Extract PR Info → Send to Slack #security
```
Example message:
```
✅ Security Fix Applied
Issue: SEC-001 (SQL Injection)
File: src/database.js
Severity: 🔴 CRITICAL
PR: #500 → Click to Review
Status: Auto-fixed
```

## Usage

### ⭐ Full Automated Workflow

When you type `/fix-security-issues`, Claude will:

**Step 1: Scan**
- Analyze all `.js` files in `src/`
- Detect: SQL Injection, XSS, hardcoded secrets, missing auth

**Step 2: Fix**
- Apply security fixes automatically to vulnerable code
- Update files locally

**Step 3: Git Workflow**
- Create new branch: `security/fix-vulnerabilities-{timestamp}`
- Stage all fixed files
- Commit with message: `Security: Fix N vulnerabilities`
- Push to GitHub
- Create PR with details

## Configuration

Required environment variables in `.env`:
```
GITHUB_TOKEN=your-personal-access-token
GITHUB_OWNER=your-github-org
GITHUB_REPO=my-app
```

Status: ✅ GITHUB_TOKEN is configured in your local `.env` (not committed)


## Process Details

### Detection Patterns
Pattern-based detection for:
1. SQL Injection patterns
2. XSS patterns (innerHTML, eval, etc.)
3. Hardcoded credentials (passwords, API keys, tokens)
4. Outdated package versions
5. Missing authentication checks

### Fix Templates
Each vulnerability type has predefined fix templates that:
- Maintain code style consistency
- Follow security best practices
- Include inline comments explaining the fix
- Link to security documentation

### Branch Naming
Format: `security/fix-{vulnerability_type}-{issue_id}`
Example: `security/fix-sql-injection-SEC-001`

### PR Naming
Format: `🔒 Fix {vulnerability_type}: {issue_title}`
Example: `🔒 Fix SQL Injection: Parameterize user queries`

## Manual Analysis

When using `--manual`, Claude will:
1. Fetch the specific issue from security-issues.json
2. Analyze the vulnerable code
3. Research best practices for the vulnerability type
4. Generate a detailed fix with explanation
5. Create PR with comprehensive documentation
6. Send notification to Slack with analysis results

## Monitoring & Maintenance

### Check Status
```bash
/fix-security-issues --report
```

### Review Issues
All issues are tracked in `security-issues.json` with:
- Detection timestamp
- Status (pending, fixed, merged, false_positive)
- PR number and URL
- Merge status

### Metrics Tracked
- Total issues detected
- Auto-fixed vs manual-fixed
- False positive rate
- Average time to fix
- Merge success rate

## Related Commands
- `/code-review` - Review created PR
- `/git commit` - Commit security fixes
- `gh pr create` - Create PR manually

## Notes

- Auto-fixes target 70-80% of common vulnerabilities
- Complex issues require manual analysis via `--manual`
- All fixes are reviewed before merge
- Slack notifications include PR link for quick review
- False positives should be marked in security-issues.json for ML improvement
