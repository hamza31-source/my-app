# Claude Hybrid Security Workflow - Setup Guide

## Quick Overview

**Cost-effective workflow using existing team subscriptions ($0 additional cost)**

```
GitHub Security Issues
        ↓
Auto-Pattern Detection ($0) → 70% of issues fixed → PR created
        ↓
Complex Issues → /fix-security-issue command → Uses team subscription → PR created
        ↓
Review Dashboard → Approve/Merge
```

---

## 3 Components

### 1. Pattern Auto-Fixer (Free)
Detects and auto-fixes common vulnerabilities:
- **SQL Injection** → Parameterize queries
- **XSS** → Use textContent instead of innerHTML
- **Hardcoded Secrets** → Move to environment variables
- **Vulnerable Dependencies** → Update package.json
- **Missing Auth** → Add authentication middleware

**Cost:** $0 per fix (template-based, no AI)  
**Runs:** Every 30 minutes  
**Coverage:** 70-80% of issues

### 2. Manual Trigger Skill (Uses Subscription)
For complex issues team triggers manually:

```bash
/fix-security-issue #456
```

Claude analyzes → Creates PR with detailed explanation  
**Cost:** $0 (uses existing team subscription)  
**When to use:** Complex logic, architecture issues

### 3. Review Dashboard (Free)
Simple web interface:
- List all pending security PRs
- One-click approve/merge
- View statistics
- Track auto vs manual fixes

**URL:** http://localhost:3000  
**Cost:** $0

---

## Setup - 5 Phases

### Phase 1: Infrastructure (2 hours)
```bash
mkdir claude-hybrid-security
cd claude-hybrid-security

npm init -y
npm install axios dotenv @octokit/rest node-cron express

# Create .env file
GITHUB_TOKEN=your-token
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo
SLACK_WEBHOOK_URL=your-webhook
```

**Folders needed:**
```
├── src/           (modules)
├── scripts/       (schedulers)
├── dashboard/     (web interface)
├── state/         (tracking files)
└── logs/          (logs)
```

---

### Phase 2: Pattern Detector (3-4 hours)

**File: `src/patterns.js`**
Define 5 vulnerability patterns with fix templates

**File: `src/pattern-detector.js`**
Main logic:
- `detectSecurityIssues()` → Fetch GitHub issues
- `analyzeCode(code)` → Run patterns
- `generateFix(match)` → Apply template fix
- `createPullRequest(branch, issue)` → Create PR
- `notifySlack(pr)` → Send notification

**File: `scripts/run-pattern-detector.js`**
Entry point that runs every 30 minutes

**Test:**
```bash
node scripts/run-pattern-detector.js
# Verify: PR created, Slack notified, state file updated
```

---

### Phase 3: Manual Trigger Skill (2-3 hours)

**File: `src/manual-fix-skill.js`**
```
Function: fixSecurityIssue(issueNumber)
1. Fetch issue from GitHub
2. Send to Claude (uses subscription)
3. Get analysis + fix
4. Create PR
5. Notify Slack
```

**File: `claude-code/skills/fix-security-issue.md`**
Skill definition for Claude Code

**Usage:**
```bash
/fix-security-issue #456
```

---

### Phase 4: Review Dashboard (1-2 hours)

**File: `scripts/dashboard-server.js`**
Express server with endpoints:
- `GET /api/prs` → List pending PRs
- `GET /api/stats` → Statistics
- `POST /api/approve/:prId` → Merge PR
- `POST /api/reject/:prId` → Request changes

**File: `dashboard/index.html`**
Simple web interface showing:
- All pending security PRs
- Approve/Reject buttons
- Statistics (auto vs manual, success rate)
- Refresh every 30 seconds

---

### Phase 5: Scheduler & Testing (1 hour)

**File: `scripts/scheduler.js`**
```javascript
const cron = require('node-cron')
const patternDetector = require('./run-pattern-detector')

// Run every 30 minutes
cron.schedule('*/30 * * * *', () => {
  patternDetector.run()
})
```

**Start services:**
```bash
# Terminal 1: Pattern detector scheduler
node scripts/scheduler.js

# Terminal 2: Dashboard
node scripts/dashboard-server.js
# Open: http://localhost:3000
```

**Test:**
1. Create GitHub issue with label 'security'
2. Wait 30 min OR run manually
3. Verify PR created
4. Check dashboard
5. Approve PR

---

## State Tracking File

**File: `state/processed-issues.json`**

```json
{
  "issues": [
    {
      "id": "GITHUB-123",
      "title": "SQL Injection in auth.js",
      "issue_number": 123,
      "vulnerability_type": "sql_injection",
      "detection_type": "auto",
      "status": "pr_created",
      "pr_number": 500,
      "file_affected": "src/auth.js",
      "created_at": "2024-01-15T10:30:00Z",
      "merged": false
    }
  ]
}
```

Tracks: Issue ID, type, status, PR number, merge status

---

## Monitoring

### Weekly (30 min)
- Review merged PRs
- Check success rate
- Look for false positives

### Monthly (1 hour)
- Add new patterns if needed
- Review vulnerability trends
- Update documentation

### Alerts
- ⚠️ No detections in 24h (scheduler down?)
- ⚠️ High false positives (>30%)
- ⚠️ GitHub API errors

---

## Cost Breakdown

| Component | Cost | How |
|-----------|------|-----|
| Pattern detector | $0 | Template-based |
| Manual trigger | $0 | Uses subscription |
| Dashboard | $0 | Free |
| **TOTAL** | **$0/month** | **Within budget** |

**Comparison:**
- Pure API approach: $120-480/year
- Hybrid approach: $0/year ✅
- **Savings: $120-480/year**

---

## Deployment

### Option 1: Local (Dev/Testing)
```bash
npm install
node scripts/scheduler.js &
node scripts/dashboard-server.js &
```

### Option 2: GitHub Actions
Create `.github/workflows/pattern-detector.yml`:
- Runs every 30 minutes
- Detects patterns
- Creates PRs
- Sends Slack notifications

### Option 3: Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "scripts/scheduler.js"]
```

---

## Quick Reference

### File Structure
```
├── src/
│   ├── patterns.js                (5 vulnerability patterns)
│   ├── pattern-detector.js        (main detection logic)
│   └── manual-fix-skill.js        (Claude integration)
├── scripts/
│   ├── run-pattern-detector.js    (detector runner)
│   ├── scheduler.js               (cron schedule)
│   └── dashboard-server.js        (Express server)
├── dashboard/
│   ├── index.html                 (web interface)
│   └── app.js                     (frontend logic)
├── state/
│   └── processed-issues.json      (tracking file)
└── .env                           (credentials)
```

### Key Functions
```
patternDetector.detectSecurityIssues()
patternDetector.analyzeCode(code)
patternDetector.generateFix(match, code)
patternDetector.createPullRequest(branch, issue)

manualFixSkill.fixSecurityIssue(issueNumber)

dashboard.listPendingPRs()
dashboard.approvePR(prId)
dashboard.rejectPR(prId)
```

### Environment Variables
```
GITHUB_TOKEN          - GitHub personal access token
GITHUB_OWNER          - Repository owner
GITHUB_REPO           - Repository name
GITHUB_BASE_BRANCH    - Base branch (default: main)
SLACK_WEBHOOK_URL     - Slack notification webhook
PATTERN_DETECTOR_INTERVAL - Minutes (default: 30)
DASHBOARD_PORT        - Port for dashboard (default: 3000)
```

---

## Timeline & Effort

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup infrastructure | 2h |
| 2 | Build pattern detector | 3-4h |
| 3 | Build manual skill | 2-3h |
| 4 | Build dashboard | 1-2h |
| 5 | Scheduler & testing | 1h |
| **Total** | **Complete hybrid workflow** | **~10h** |

**Ongoing:** 30 min/week maintenance

---

## What Gets Fixed Automatically

✅ **SQL Injection** - Pattern match + parameterized query fix  
✅ **XSS Vulnerabilities** - Pattern match + DOM safety fix  
✅ **Hardcoded Secrets** - Pattern match + env var migration  
✅ **Vulnerable Packages** - Dependency check + version update  
✅ **Missing Auth Checks** - Pattern match + middleware addition  

---

