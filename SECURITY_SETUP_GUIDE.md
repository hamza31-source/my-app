# Security Setup Guide for my-app

Quick start guide for the Hybrid Security Workflow system.

## ⏱️ Setup Time: 15 minutes

---

## Step 1: Clone Environment Template (2 min)

```bash
cp .env.example .env
```

Now edit `.env` with your actual credentials.

---

## Step 2: Get GitHub Token (3 min)

1. Visit: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Enter name: `my-app-security`
4. Select scopes:
   - ✅ `repo` (full control of repositories)
   - ✅ `read:user` (read user profile)
5. Click **"Generate token"**
6. **Copy** the token (you won't see it again!)
7. Paste into `.env`:
   ```
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
   ```

**Also add:**
```
GITHUB_OWNER=your-github-username
GITHUB_REPO=my-app
GITHUB_BASE_BRANCH=main
```

---

## Step 3: Get Slack Webhook (5 min)

### For Slack App
1. Go to your Slack workspace
2. Create a channel: `#security` (or use existing)
3. Visit: https://api.slack.com/apps
4. Click **"Create New App"** → **"From scratch"**
5. Name: `my-app Security Bot`
6. Select your workspace
7. Go to **"Incoming Webhooks"**
8. Click **"Add New Webhook to Workspace"**
9. Select channel: `#security`
10. Copy webhook URL
11. Paste into `.env`:
    ```
    SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
    ```

### For Slack Integration (Faster)
1. Go to your Slack workspace
2. Find #security channel (or create)
3. Click **Details** → **Apps** → **Search apps**
4. Find **"Incoming Webhooks"**
5. Add to channel
6. Copy webhook URL to `.env`

---

## Step 4: Get Claude API Key (2 min)

1. Visit: https://console.anthropic.com/api_keys
2. Click **"Create Key"**
3. Name it: `my-app-security`
4. Copy the key
5. Paste into `.env`:
   ```
   CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
   ```

---

## Step 5: Verify .env File

Your `.env` should now look like:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=my-app
GITHUB_BASE_BRANCH=main

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Claude API (for manual fixes)
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# Keep these defaults
PATTERN_DETECTOR_INTERVAL=30
DASHBOARD_PORT=3000
ENABLE_AUTO_FIX=true
ENABLE_SLACK_NOTIFICATIONS=true
```

**⚠️ Important:** Never commit `.env` to Git!

---

## Step 6: Test Connections (3 min)

### Test GitHub Token
```bash
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```

Should return your GitHub user info.

### Test Slack Webhook
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test from security system"}' \
  $SLACK_WEBHOOK_URL
```

Should send message to #security channel.

### Test Claude API
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
```

Should return an API response.

---

## Step 7: Run Your First Scan

### Option A: Using the Skill (Recommended)
```bash
/fix-security-issues --scan
```

### Option B: Using Node Directly
```bash
node -e "
  const { SecurityOrchestrator } = require('./security');
  const orchestrator = new SecurityOrchestrator();
  orchestrator.scanProject().then(issues => {
    console.log('Found', issues.length, 'issues');
    console.log('Check security-issues.json for details');
  });
"
```

### Option C: Full Workflow
```bash
/fix-security-issues --all
```

This will:
1. Scan for vulnerabilities
2. Auto-fix simple issues
3. Create PRs
4. Send Slack notification

---

## Step 8: Check Results

### View detected issues:
```bash
cat security-issues.json | jq '.issues[] | {id, title, severity, status}'
```

### Check created PRs:
```bash
gh pr list --label security
```

### Check Slack:
Look at your `#security` channel for notifications

---

## 🎯 Common Tasks

### Run full workflow
```bash
/fix-security-issues --all
```

### Scan only (no fixes)
```bash
/fix-security-issues --scan
```

### Auto-fix detected issues
```bash
/fix-security-issues --fix
```

### Get security report
```bash
/fix-security-issues --report
```

### Manually analyze one issue
```bash
/fix-security-issues --manual SEC-001
```

---

## 📊 View Dashboard

Start dashboard server:
```bash
node scripts/dashboard-server.js
```

Open: http://localhost:3000

Features:
- See all detected issues
- Filter by severity
- Approve/reject fixes
- View statistics

---

## 🔍 What Gets Scanned?

The system scans for:

| Vulnerability | Risk | Auto-Fix |
|--------------|------|----------|
| SQL Injection | 🔴 Critical | ✅ Yes |
| XSS Attacks | 🟠 High | ✅ Yes |
| Hardcoded Secrets | 🔴 Critical | ✅ Yes |
| Vulnerable Packages | 🟠 High | ✅ Yes |
| Missing Auth | 🟠 High | ✅ Yes |

---

## 📁 File Structure Created

```
my-app/
├── .env                              # Your credentials (git-ignored)
├── .env.example                      # Template (safe to commit)
├── security-issues.json              # Auto-generated issue tracking
├── security/                         # Security modules
│   ├── patterns.js                   # Vulnerability patterns
│   ├── pattern-detector.js           # Detection engine
│   ├── slack-notifier.js             # Slack integration
│   ├── github-integration.js          # GitHub automation
│   ├── security-orchestrator.js       # Main coordinator
│   └── index.js                      # Module exports
├── .claude/skills/
│   └── fix-security-issues.md        # Claude skill definition
└── docs/
    ├── HYBRID_SECURITY_WORKFLOW_IMPLEMENTATION.md  # Full guide
    └── SECURITY_SETUP_GUIDE.md       # This file
```

---

## ✅ Verification Checklist

- [ ] `.env` file created with all credentials
- [ ] GitHub token verified (curl test passed)
- [ ] Slack webhook verified (message sent)
- [ ] Claude API key verified
- [ ] First scan completed
- [ ] security-issues.json created
- [ ] No errors in logs/

---

## 🚨 Troubleshooting

### "GitHub token invalid"
```bash
# Regenerate token at:
# https://github.com/settings/tokens
# Make sure token has 'repo' scope
```

### "Slack webhook failed"
```bash
# Check webhook URL in .env
# Verify it starts with: https://hooks.slack.com/
# Regenerate at: Slack workspace → Apps → Incoming Webhooks
```

### "Claude API error"
```bash
# Check API key starts with: sk-ant-
# Verify at: https://console.anthropic.com/api_keys
# Ensure key hasn't expired
```

### "No issues found" (but you expect some)
```bash
# Check that files are being scanned
# Verify vulnerability patterns in security/patterns.js
# Try manual test:
node security/pattern-detector.js
```

---

## 📚 Next Steps

1. **Schedule automated scans**
   - Use GitHub Actions (see HYBRID_SECURITY_WORKFLOW_IMPLEMENTATION.md)
   - Or cron job: `0 */1 * * * /fix-security-issues --scan`

2. **Customize vulnerability patterns**
   - Edit `security/patterns.js`
   - Add company-specific checks
   - Adjust fix templates

3. **Set up team permissions**
   - Decide who can approve/merge fixes
   - Configure PR review requirements

4. **Monitor metrics**
   - Track fix success rate
   - Monitor false positive rate
   - Review vulnerability trends

---

## 🆘 Need Help?

- **Skill documentation**: `/fix-security-issues --help`
- **Full guide**: See `HYBRID_SECURITY_WORKFLOW_IMPLEMENTATION.md`
- **Code patterns**: See `security/patterns.js`
- **API reference**: See `security/security-orchestrator.js`

---

**🔒 You're all set! Run your first scan:**

```bash
/fix-security-issues --scan
```
