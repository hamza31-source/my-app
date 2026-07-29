# Security System - Quick Reference Card

**Print this page or bookmark for quick access**

---

## 🔐 Environment Variables

Copy these to `.env`:

```bash
# REQUIRED - GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=my-app
GITHUB_BASE_BRANCH=main

# REQUIRED - Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# REQUIRED - Claude API
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx

# OPTIONAL - Configuration
PATTERN_DETECTOR_INTERVAL=30
DASHBOARD_PORT=3000
ENABLE_AUTO_FIX=true
ENABLE_SLACK_NOTIFICATIONS=true
```

**⚠️ Never commit `.env` - Add to `.gitignore`**

---

## 🎯 Main Commands

### Scan for Vulnerabilities
```bash
/fix-security-issues --scan
```
Finds and logs all issues to `security-issues.json`

### Auto-Fix All Issues
```bash
/fix-security-issues --fix
```
Applies template fixes and creates branch

### Create Pull Requests
```bash
/fix-security-issues --create-prs
```
Creates PRs on GitHub with descriptions

### Full Workflow (Recommended)
```bash
/fix-security-issues --all
```
Scan → Fix → Create PRs → Notify Slack

### Manual AI Analysis
```bash
/fix-security-issues --manual SEC-001
```
Get Claude's AI analysis for complex issues

### Generate Report
```bash
/fix-security-issues --report
```
Sends stats and summary to Slack

---

## 🔍 Vulnerability Types Detected

| Type | Risk | Auto-Fix |
|------|------|----------|
| SQL Injection | 🔴 Critical | ✅ Yes |
| XSS Attacks | 🟠 High | ✅ Yes |
| Hardcoded Secrets | 🔴 Critical | ✅ Yes |
| Vulnerable Packages | 🟠 High | ✅ Yes |
| Missing Authentication | 🟠 High | ✅ Yes |

---

## 📊 File Locations

```
my-app/
├── .env                              ← Your credentials (git-ignored)
├── security-issues.json              ← Results & tracking
├── security/
│   ├── patterns.js                   ← Vulnerability patterns
│   ├── pattern-detector.js           ← Detection engine
│   ├── slack-notifier.js             ← Slack integration
│   ├── github-integration.js          ← GitHub automation
│   └── security-orchestrator.js       ← Main coordinator
└── .claude/skills/
    └── fix-security-issues.md        ← Skill definition
```

---

## 🔑 Getting Credentials (3 minutes each)

### GitHub Token
1. https://github.com/settings/tokens
2. Generate new token (classic)
3. Scope: `repo` + `read:user`
4. Copy → Paste into `GITHUB_TOKEN`

### Slack Webhook
1. Your Slack workspace → Apps → Incoming Webhooks
2. Add New Webhook → Select #security
3. Copy URL → Paste into `SLACK_WEBHOOK_URL`

### Claude API Key
1. https://console.anthropic.com/api_keys
2. Create Key
3. Copy → Paste into `CLAUDE_API_KEY`

---

## ✅ Testing Tokens

### GitHub
```bash
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
# Should return: {"login": "your-username", ...}
```

### Slack
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' $SLACK_WEBHOOK_URL
# Should get message in #security
```

### Claude
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
# Should return valid response
```

---

## 📋 Issue Status Flow

```
pending
   ↓
auto_fixed (or) manual_fix → pr_created
   ↓
approved
   ↓
merged ✅
```

Also: `false_positive` (mark if not real), `rejected` (if fix failed)

---

## 💡 Example Fixes

### SQL Injection
```javascript
// Before
const query = `SELECT * FROM users WHERE id = ${id}`;

// After  
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [id]);
```

### XSS
```javascript
// Before
element.innerHTML = userInput;

// After
element.textContent = userInput;
```

### Hardcoded Secrets
```javascript
// Before
const API_KEY = "sk-1234567890";

// After
const API_KEY = process.env.API_KEY;
```

---

## 📊 Monitoring

### View Current Issues
```bash
cat security-issues.json | jq '.metadata'
```

### View Specific Issue
```bash
cat security-issues.json | jq '.issues[] | select(.id=="SEC-001")'
```

### Count by Severity
```bash
cat security-issues.json | jq '.statistics.by_severity'
```

---

## 🚀 Common Workflows

### First Time Setup
```bash
# 1. Setup
cp .env.example .env
# Edit .env with your credentials

# 2. Test
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# 3. Scan
/fix-security-issues --scan

# 4. Check
cat security-issues.json | jq '.metadata'
```

### Regular Security Review
```bash
# Scan and fix
/fix-security-issues --all

# Check Slack for notifications
# Review PRs on GitHub
# Approve and merge
```

### Manual Analysis of Complex Issue
```bash
# 1. Scan
/fix-security-issues --scan

# 2. Find the issue ID (from security-issues.json)
# 3. Analyze with Claude
/fix-security-issues --manual SEC-001

# 4. Review Claude's suggestion
# 5. Create PR from suggestion
```

---

## 🆘 Quick Troubleshoot

| Problem | Fix |
|---------|-----|
| Token invalid | Regenerate at github.com/settings/tokens |
| Slack not sending | Test: curl + webhook URL |
| No issues found | Check patterns.js matches your code |
| PR creation fails | Verify `gh` CLI: `gh --version` |
| Command not found | Ensure skill file is at `.claude/skills/fix-security-issues.md` |
| `.env` not found | Run: `cp .env.example .env` |

---

## 📈 Metrics

**Track in security-issues.json**

```json
{
  "total_issues": 15,
  "total_fixed": 8,
  "auto_fixed": 6,
  "manual_fixed": 2,
  "false_positives": 1,
  "fix_success_rate": 53%,
  "by_severity": {
    "critical": 2,
    "high": 5,
    "medium": 6,
    "low": 2
  }
}
```

---

## 💰 Cost Estimate

| Usage | Cost |
|-------|------|
| 50 complex fixes/month | ~$5 |
| Basic usage (auto-fixes only) | $0 |
| High usage (200+ fixes/month) | ~$20 |
| **Savings vs SaaS** | **-80%** |

---

## 📚 Full Documentation

- **Setup**: SECURITY_SETUP_GUIDE.md
- **Full Guide**: HYBRID_SECURITY_WORKFLOW_IMPLEMENTATION.md
- **Summary**: SECURITY_IMPLEMENTATION_SUMMARY.md
- **Deployment**: DEPLOYMENT_CHECKLIST.md
- **This Card**: SECURITY_QUICK_REFERENCE.md

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Setup (.env) | 5 min |
| Get credentials | 15 min |
| Test tokens | 5 min |
| First scan | 5 min |
| Review results | 5 min |
| **Total** | **35 min** |

---

## 🎯 Success Checklist

- [ ] `.env` created with all variables
- [ ] All tokens tested successfully
- [ ] First scan completed
- [ ] security-issues.json created
- [ ] Slack notifications working
- [ ] Team trained
- [ ] Ready for production

---

**💡 Tip**: Save this page in your bookmarks for quick reference!

**🚀 Ready to start?**
```bash
/fix-security-issues --scan
```

---

*Hybrid Security System for my-app | Quick Reference | 2026*
