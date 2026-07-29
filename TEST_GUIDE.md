# 🧪 Security System Test Guide

**Status**: Ready to Test  
**Vulnerable Files Created**: 3 files with 7 vulnerabilities

---

## 📋 Vulnerable Code Created

### File 1: `src/database.js`
- ❌ **SQL Injection** - Template string in query
- ❌ **Hardcoded Secrets** - API key and password in code

### File 2: `src/ui.js`
- ❌ **XSS Vulnerability** - innerHTML with user data (3 instances)

### File 3: `src/api.js`
- ❌ **Missing Authentication** - API endpoints without auth (2 instances)
- ❌ **SQL Injection** - String interpolation in query

**Total Vulnerabilities**: 7 issues ready to detect and fix

---

## 🎯 What to Say in Claude Code

### **Step 1: Scan for Issues**

**Type this in Claude Code:**
```
/fix-security-issues --scan
```

**What will happen:**
- Scans all `.js` files in the project
- Finds the 7 vulnerabilities we created
- Updates `security-issues.json` with results
- Sends notification to Slack #security channel

**Expected output:**
```
Found 7 potential security issues
- 2 SQL Injection vulnerabilities
- 3 XSS vulnerabilities  
- 2 Missing Authentication issues
```

---

### **Step 2: View Detected Issues**

**Type this:**
```
cat security-issues.json | jq '.issues[] | {id, title, severity, file_path}'
```

**You'll see:**
```json
{
  "id": "SEC-...",
  "title": "SQL Injection in database.js",
  "severity": "critical",
  "file_path": "src/database.js"
}
```

---

### **Step 3: Auto-Fix All Issues** (Recommended)

**Type this:**
```
/fix-security-issues --all
```

**This will:**
1. ✅ Scan project for vulnerabilities
2. ✅ Auto-fix all detected issues (apply templates)
3. ✅ Create branch: `security/fix-...`
4. ✅ Commit changes
5. ✅ Create GitHub PRs
6. ✅ Send Slack notifications

**Wait time**: ~2-5 minutes

**Output will show:**
```
Step 1: Scanning project for vulnerabilities...
Found 7 potential security issues

Step 2: Applying automatic fixes...
Fixed 7 issues automatically

Step 3: Creating pull requests...
Created 2 pull requests

Step 4: Sending Slack notifications...
Notifications sent

✅ Security workflow completed successfully!
```

---

### **Step 4: Check Slack Notification**

Look at your **#security** Slack channel - you'll see messages like:

```
✅ Security Fix Applied
Issue: SEC-123456
Type: sql_injection
Severity: 🔴 CRITICAL
File: src/database.js

View PR #500 (click link)
```

---

### **Step 5: View GitHub PRs**

**Type this to see created PRs:**
```
gh pr list --label security
```

**Or go to GitHub:**
```
https://github.com/YOUR_OWNER/my-app/pulls?q=label%3Asecurity
```

You'll see PRs like:
- `🔒 Fix sql_injection: Parameterize database queries`
- `🔒 Fix xss: Fix XSS vulnerabilities`
- `🔒 Fix hardcoded_secrets: Move secrets to env vars`

---

### **Step 6: Check Results JSON**

**Type this:**
```
cat security-issues.json | jq '.metadata'
```

**You'll see:**
```json
{
  "total_issues": 7,
  "total_fixed": 7,
  "auto_fixed": 7,
  "manual_fixed": 0,
  "false_positives": 0
}
```

---

### **Step 7: View Individual Issue Details**

**Type this:**
```
cat security-issues.json | jq '.issues[0]'
```

**You'll see:**
```json
{
  "id": "SEC-123456",
  "title": "SQL Injection in database.js",
  "description": "Parameterized queries not used",
  "severity": "critical",
  "vulnerability_type": "sql_injection",
  "file_path": "src/database.js",
  "line_number": 8,
  "status": "pr_created",
  "pr_number": 500,
  "pr_url": "https://github.com/...",
  "merged": false
}
```

---

## 📝 Complete Test Sequence

### **Quick Test (5 minutes)**
```bash
# 1. Scan only
/fix-security-issues --scan

# 2. View results
cat security-issues.json | jq '.metadata'

# 3. Check Slack #security channel
```

### **Full Test (10 minutes)**
```bash
# 1. Full workflow
/fix-security-issues --all

# 2. View created issues
cat security-issues.json | jq '.issues[] | {title, status, pr_number}'

# 3. Check GitHub PRs
gh pr list --label security

# 4. View statistics
cat security-issues.json | jq '.statistics'

# 5. Check Slack notifications
# (Look at #security channel)
```

### **Extended Test (30 minutes)**
```bash
# 1. Run full workflow
/fix-security-issues --all

# 2. Review created PRs on GitHub
# Go to: https://github.com/YOUR_OWNER/my-app/pulls?q=label%3Asecurity

# 3. Approve and merge a PR manually
# Click "Approve" on GitHub, then "Merge"

# 4. Check updated status
cat security-issues.json | jq '.issues[0]'

# 5. Generate report
/fix-security-issues --report

# 6. View final metrics
cat security-issues.json | jq '.statistics'
```

---

## 🔍 What to Look For

### **In security-issues.json**
- ✅ All 7 issues detected
- ✅ Issue IDs generated (SEC-XXXXXX)
- ✅ Severity levels assigned
- ✅ File paths correct
- ✅ Status changed to "pr_created"
- ✅ PR numbers populated

### **In GitHub PRs**
- ✅ 2+ PRs created (issues grouped by type)
- ✅ Labels: `security`, `auto-fix`
- ✅ Title: "🔒 Fix {type}: {description}"
- ✅ Description includes: issue details, before/after code, fix explanation
- ✅ Branch name: `security/fix-{type}-{id}`

### **In Slack #security**
- ✅ Issue detection notification
- ✅ Fix applied notification with PR link
- ✅ Batch summary showing: total fixed, by type, by severity

---

## ⚠️ First Time Setup

Before running tests, make sure:

```bash
# 1. .env file exists with credentials
ls -la .env

# 2. Test GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
# Should return your GitHub username

# 3. Test Slack webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' $SLACK_WEBHOOK_URL
# Should post message to #security

# 4. Verify vulnerable files exist
ls -la src/database.js src/ui.js src/api.js
```

If any of these fail, see **SECURITY_SETUP_GUIDE.md** to fix.

---

## 🚀 Run Test NOW

### **Exact Commands to Copy/Paste:**

**Step 1 - Scan:**
```bash
/fix-security-issues --scan
```

**Step 2 - Check what was found:**
```bash
cat security-issues.json | jq '.metadata'
```

**Step 3 - Full workflow (creates PRs):**
```bash
/fix-security-issues --all
```

**Step 4 - View results:**
```bash
cat security-issues.json | jq '.statistics'
```

**Step 5 - Check Slack:**
```
Go to your Slack workspace #security channel
You should see 3+ notifications
```

---

## 📊 Expected Results

After running `/fix-security-issues --all`:

```
✅ Issues Found: 7
✅ Issues Fixed: 7  
✅ Auto-Fixed: 7
✅ PRs Created: 2-3
✅ Slack Notifications: 3+
✅ Branches Created: 2-3
✅ Status: pr_created
```

---

## 🎯 Test Success Criteria

Your test is successful when:

- ✅ `/fix-security-issues --scan` finds 7 issues
- ✅ `security-issues.json` is populated with issues
- ✅ `/fix-security-issues --all` completes without errors
- ✅ 2+ GitHub PRs are created
- ✅ Slack #security receives notifications
- ✅ All 7 issues have PR numbers assigned
- ✅ All files in src/ are unchanged (fixes are in PR only)

---

## 🐛 Troubleshooting

### Nothing is detected
```bash
# Check if vulnerable files exist
ls -la src/database.js src/ui.js src/api.js

# Check patterns are working
cat security/patterns.js | grep "patterns:"
```

### Slack notification not sending
```bash
# Test webhook manually
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' $SLACK_WEBHOOK_URL

# If fails: Check .env has correct SLACK_WEBHOOK_URL
```

### GitHub PR not created
```bash
# Check GitHub CLI is installed
gh --version

# Check GitHub token is valid
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Check repo is clean
git status
```

---

## 📚 Reference

- **How it works**: See SECURITY_IMPLEMENTATION_SUMMARY.md
- **Full guide**: See HYBRID_SECURITY_WORKFLOW_IMPLEMENTATION.md
- **Setup help**: See SECURITY_SETUP_GUIDE.md
- **Commands**: See SECURITY_QUICK_REFERENCE.md

---

## ✨ Next Steps After Test

1. ✅ Review created PRs on GitHub
2. ✅ Check fix quality (before/after code)
3. ✅ Approve and merge first PR
4. ✅ Watch issue status change to "merged"
5. ✅ Run `/fix-security-issues --report` for summary

---

**Ready? Run this now:**

```
/fix-security-issues --all
```

**Then check:**
- ✅ GitHub for new PRs
- ✅ Slack for notifications
- ✅ `security-issues.json` for updated status

Good luck! 🔒
