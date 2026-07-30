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
- Creates pull request on GitHub with comprehensive description
- Includes:
  - Vulnerability details and severity levels
  - Files affected by each vulnerability
  - Actions taken to fix issues
  - Testing checklist

### Step 6: Add PR Comment ✨ NEW
- Claude adds detailed comment explaining each issue
- Shows **what security problem** each vulnerability causes
- Explains **how it was fixed**
- Links to security best practices
- Helps reviewers understand the changes

### Step 7: Send Slack Notification ✨ NEW  
- Sends formatted message to Slack webhook (if configured)
- Includes issue summary with severity indicators
- Provides direct clickable link to PR
- **Auto-skips if webhook not configured** - no errors!


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
- Count and categorize issues by severity

**Step 2: Fix**
- Apply security fixes automatically to vulnerable code
- Update files locally with proper fixes

**Step 3: Git Workflow**
- Create new branch: `security/fix-vulnerabilities-{timestamp}`
- Stage all fixed files
- Commit with message: `Security: Fix N vulnerabilities`
- Push to GitHub

**Step 4: Create GitHub PR**
- Create PR with comprehensive description
- Include issue type, severity, and files affected
- Detail the fixes applied and best practices

**Step 5: Add PR Comment** ✨ NEW
- Add detailed comment explaining each issue found
- Show what security problem it causes
- Explain how it was fixed
- Link to security best practices

**Step 6: Send Slack Notification** ✨ NEW
- Send formatted message to Slack webhook
- Include issue summary with severity indicators
- Provide direct link to PR for quick review
- **Note:** Skips automatically if `SLACK_WEBHOOK_URL` not configured

## Configuration

### Required Environment Variables

```
GITHUB_TOKEN=your-personal-access-token
GITHUB_OWNER=your-github-org
GITHUB_REPO=my-app
```

Status: ✅ GITHUB_TOKEN is configured

### Optional: Slack Integration

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**What happens:**
- ✅ If configured: PR notification sent to Slack with issue summary and PR link
- ⏭️ If not configured: Skill automatically skips this step (no errors)

---

## What Gets Added to Your PR

### PR Description Includes:
- Issue type and count
- Affected files
- Brief description of each vulnerability
- Actions taken (fixes applied)
- Testing checklist
- Security best practices applied

### PR Comment Includes:
- Detailed explanation of **each issue found**
- **Why it's a security problem** (e.g., SQL Injection allows unauthorized database access)
- **How it was fixed** (e.g., Changed to parameterized queries)
- **Security impact** (severity level)
- Timestamp and attribution to Claude Security Skill

### Slack Message Includes:
- Total number of vulnerabilities fixed
- Issues grouped by type with severity indicators
- Direct link to PR for quick review
- Only sent if webhook is configured


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
