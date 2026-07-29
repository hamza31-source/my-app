# Hybrid Security Workflow - Deployment Checklist

**Project**: my-app  
**Status**: Ready for Deployment  
**Estimated Time**: 45 minutes

---

## 📋 Pre-Deployment (5 min)

- [ ] Read SECURITY_SETUP_GUIDE.md completely
- [ ] Understand the 5 main components (detector, orchestrator, notifier, GitHub, skill)
- [ ] Verify you have access to:
  - [ ] GitHub (your username)
  - [ ] Slack workspace (admin or can create apps)
  - [ ] Anthropic console (for Claude API)

---

## 🔑 Step 1: Credential Setup (20 min)

### GitHub Token
- [ ] Visit https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Name: `my-app-security`
- [ ] Select scopes: `repo` + `read:user`
- [ ] Generate and **copy** token
- [ ] Paste into `.env` as `GITHUB_TOKEN`
- [ ] Test: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`
- [ ] ✅ Status: `200 OK` = Success

### Slack Webhook
- [ ] Go to your Slack workspace
- [ ] Create channel `#security` (or use existing)
- [ ] Visit https://api.slack.com/apps
- [ ] Create New App → From scratch
- [ ] Name: `my-app Security Bot`
- [ ] Select your workspace
- [ ] Enable Incoming Webhooks
- [ ] Add New Webhook to Workspace
- [ ] Select channel: `#security`
- [ ] Copy webhook URL
- [ ] Paste into `.env` as `SLACK_WEBHOOK_URL`
- [ ] Test: `curl -X POST -H 'Content-type: application/json' --data '{"text":"Test"}' $SLACK_WEBHOOK_URL`
- [ ] ✅ Status: Message should appear in #security

### Claude API Key
- [ ] Visit https://console.anthropic.com/api_keys
- [ ] Create new key, name: `my-app-security`
- [ ] Copy key
- [ ] Paste into `.env` as `CLAUDE_API_KEY`
- [ ] Key format check: Starts with `sk-ant-`

### GitHub Configuration
- [ ] Add `GITHUB_OWNER` = your GitHub username
- [ ] Add `GITHUB_REPO` = my-app
- [ ] Add `GITHUB_BASE_BRANCH` = main

---

## 🛠️ Step 2: Environment Setup (5 min)

- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] Verify `.env` contains all required variables:
  - [ ] `GITHUB_TOKEN` (starts with `ghp_`)
  - [ ] `GITHUB_OWNER` (your username)
  - [ ] `GITHUB_REPO` (my-app)
  - [ ] `GITHUB_BASE_BRANCH` (main)
  - [ ] `SLACK_WEBHOOK_URL` (starts with `https://hooks.slack.com`)
  - [ ] `CLAUDE_API_KEY` (starts with `sk-ant-`)

- [ ] Verify `.gitignore` contains `.env`
  ```bash
  cat .gitignore | grep ".env"
  ```

- [ ] ✅ Confirm: `.env` should NOT be in git
  ```bash
  git status | grep ".env"
  # Should show nothing (file is ignored)
  ```

---

## 🧪 Step 3: Testing (10 min)

### Test GitHub Connection
```bash
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```
- [ ] ✅ Returns JSON with your GitHub username

### Test Slack Connection
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🔐 Security system connected!"}' \
  $SLACK_WEBHOOK_URL
```
- [ ] ✅ Message appears in #security channel

### Test Claude API
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
```
- [ ] ✅ Returns valid API response (not 401 error)

---

## 🚀 Step 4: Initial Scan (5 min)

### Run First Scan
```bash
/fix-security-issues --scan
```

- [ ] ✅ Command completes without errors
- [ ] ✅ Scan output shows "Found X issues"
- [ ] ✅ `security-issues.json` is created/updated

### Verify Results
```bash
# Check summary
cat security-issues.json | jq '.metadata'
```

- [ ] ✅ Total issues found > 0
- [ ] ✅ Issues listed in JSON
- [ ] ✅ Slack notification sent to #security

### Review Detected Issues
```bash
# View first issue
cat security-issues.json | jq '.issues[0]'
```

- [ ] ✅ Issue has ID, title, severity
- [ ] ✅ File path is correct
- [ ] ✅ Vulnerability type is recognized

---

## 📝 Step 5: Workflow Configuration (5 min)

### Set Deployment Mode
Choose one option:

#### Option A: Manual (Recommended for testing)
```bash
# Run commands manually when needed
/fix-security-issues --all
```
- [ ] Selected

#### Option B: Scheduled (GitHub Actions)
- [ ] Create `.github/workflows/security-scan.yml`
- [ ] Add schedule: `0 */4 * * *` (every 4 hours)
- [ ] Commit workflow file
- [ ] Enable Actions in repo settings
- [ ] ✅ Verified: Actions can run

#### Option C: Cron Job (Linux/Mac)
```bash
# crontab -e
0 */4 * * * cd /path/to/my-app && /fix-security-issues --scan
```
- [ ] Added cron job

### Configure Team Access
- [ ] Decide who reviews PRs
- [ ] Set GitHub PR approval settings
- [ ] Add team to Slack #security channel

---

## ✅ Step 6: Final Verification (5 min)

### System Components
- [ ] ✅ `security/patterns.js` exists
- [ ] ✅ `security/pattern-detector.js` exists
- [ ] ✅ `security/slack-notifier.js` exists
- [ ] ✅ `security/github-integration.js` exists
- [ ] ✅ `security/security-orchestrator.js` exists
- [ ] ✅ `.claude/skills/fix-security-issues.md` exists

### Documentation
- [ ] ✅ SECURITY_SETUP_GUIDE.md available
- [ ] ✅ HYBRID_SECURITY_WORKFLOW_IMPLEMENTATION.md available
- [ ] ✅ SECURITY_IMPLEMENTATION_SUMMARY.md available
- [ ] ✅ DEPLOYMENT_CHECKLIST.md (this file)

### Configuration Files
- [ ] ✅ `.env` exists and is git-ignored
- [ ] ✅ `.env.example` exists in repo (no secrets)
- [ ] ✅ `security-issues.json` is created

### Skills & Commands
- [ ] ✅ `/fix-security-issues --scan` works
- [ ] ✅ `/fix-security-issues --fix` works
- [ ] ✅ `/fix-security-issues --all` works
- [ ] ✅ Claude skill loads properly

---

## 🎯 Step 7: Team Onboarding (Optional)

### Documentation for Team
- [ ] Share SECURITY_SETUP_GUIDE.md link
- [ ] Share SECURITY_IMPLEMENTATION_SUMMARY.md link
- [ ] Post command reference in team wiki/docs

### Team Training
- [ ] Explain the 5 components
- [ ] Demo: `/fix-security-issues --scan`
- [ ] Show Slack notifications
- [ ] Explain PR approval workflow
- [ ] Set expectations for review time

### Access & Permissions
- [ ] Add team members to #security channel
- [ ] Configure GitHub PR code owners
- [ ] Set minimum approval requirements
- [ ] Enable branch protection rules

---

## 📊 Step 8: Monitoring Setup (Optional)

### Set Up Alerts
- [ ] Slack alert when > 10 issues found
- [ ] Slack alert when critical issue detected
- [ ] Email if no scan runs for 24h

### Create Reporting
- [ ] Weekly summary report
- [ ] Monthly vulnerability trends
- [ ] Track fix success rate

### Metrics Dashboard
- [ ] Create simple metrics view
- [ ] Track by severity level
- [ ] Track by vulnerability type
- [ ] Track remediation time

---

## 🔄 Ongoing Maintenance Checklist

### Weekly (30 min)
- [ ] Review merged security PRs
- [ ] Check false positive rate
- [ ] Verify all scans completed

### Monthly (1 hour)
- [ ] Add new vulnerability patterns
- [ ] Review false positives
- [ ] Update documentation if needed
- [ ] Check token expiration dates

### Quarterly (2 hours)
- [ ] Full security audit
- [ ] Review overall metrics
- [ ] Plan pattern improvements
- [ ] Update team processes

---

## 🚨 Troubleshooting Checklist

If something fails, check in this order:

### Scan Issues
- [ ] `.env` file exists
- [ ] All tokens are set
- [ ] `security/patterns.js` is readable
- [ ] Project root path is correct

### GitHub Issues
- [ ] `GITHUB_TOKEN` is valid (test curl)
- [ ] `GITHUB_OWNER` matches username
- [ ] `GITHUB_REPO` matches repo name
- [ ] Git repo is clean (`git status`)
- [ ] `gh` CLI is installed (`gh --version`)

### Slack Issues
- [ ] `SLACK_WEBHOOK_URL` is correct
- [ ] Channel exists and bot has access
- [ ] Test curl returns `ok`
- [ ] Check workspace hasn't deleted app

### Claude Issues
- [ ] `CLAUDE_API_KEY` starts with `sk-ant-`
- [ ] Key hasn't expired
- [ ] API quota not exceeded
- [ ] Network connectivity working

---

## ✨ Success Indicators

Your deployment is successful when:

- ✅ `/fix-security-issues --scan` completes
- ✅ `security-issues.json` is populated
- ✅ Slack notifications appear in #security
- ✅ GitHub PRs are created with proper labels
- ✅ Team can view and approve fixes
- ✅ No errors in logs
- ✅ All tokens are working

---

## 📞 Post-Deployment Support

### Common Issues
**Q: Nothing happens when I run /fix-security-issues**
A: Check `.env` exists and is readable. Verify `GITHUB_TOKEN` and `SLACK_WEBHOOK_URL`.

**Q: Slack notifications not sending**
A: Test webhook with curl. Verify channel exists. Check bot has permission.

**Q: GitHub PR creation fails**
A: Verify `gh` CLI installed. Check GitHub token scope includes `repo`. Ensure repo is clean.

**Q: Issues not being detected**
A: Check `security/patterns.js` patterns match your code. Try manual test of pattern detector.

---

## 📋 Final Sign-Off

- [ ] All environment variables configured
- [ ] All tests passing
- [ ] First scan completed successfully
- [ ] Team notified and trained
- [ ] Documentation shared
- [ ] Monitoring configured
- [ ] Ready for production

---

## 🎉 Deployment Complete!

**Your hybrid security system is live!**

### Next Actions
1. Run first full workflow: `/fix-security-issues --all`
2. Review and approve first security PRs
3. Monitor Slack for notifications
4. Schedule regular scans

### Quick Reference Commands
```bash
# Scan for issues
/fix-security-issues --scan

# Auto-fix and create PRs
/fix-security-issues --all

# Manual AI analysis
/fix-security-issues --manual SEC-001

# Get report
/fix-security-issues --report
```

---

**Date Deployed**: _________________  
**Deployed By**: _________________  
**Notes**: 

```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

*Hybrid Security Workflow for my-app | Zero-cost automation | 2026*
