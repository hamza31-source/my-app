# 🚀 Quick Test Commands - Copy & Paste

**3 vulnerable files created with 7 security issues**

---

## 📋 Files Created for Testing

```
✅ src/database.js        - SQL Injection + Hardcoded Secrets
✅ src/ui.js              - XSS Vulnerabilities (3 instances)
✅ src/api.js             - Missing Auth + SQL Injection
```

---

## 🎯 EXACT COMMANDS TO RUN

### **Option 1: Scan Only (2 min)**

**Copy & Paste This:**
```
/fix-security-issues --scan
```

**What happens:**
- Scans all files
- Finds 7 vulnerabilities
- Saves to `security-issues.json`
- Sends Slack notification

**Then run:**
```
cat security-issues.json | jq '.metadata'
```

**Expected output:**
```json
{
  "total_issues": 7,
  "total_fixed": 0,
  "auto_fixed": 0,
  "manual_fixed": 0,
  "false_positives": 0
}
```

---

### **Option 2: Full Automation (5 min)** ⭐ RECOMMENDED

**Copy & Paste This:**
```
/fix-security-issues --all
```

**What happens:**
1. ✅ Scans all code (finds 7 issues)
2. ✅ Auto-fixes all issues (applies templates)
3. ✅ Creates branches & commits
4. ✅ Creates GitHub PRs (2-3 PRs)
5. ✅ Sends Slack notifications
6. ✅ Updates `security-issues.json`

**Then check results:**
```
cat security-issues.json | jq '.statistics'
```

**Expected output:**
```json
{
  "by_severity": {
    "critical": 3,
    "high": 4
  },
  "by_type": {
    "sql_injection": 2,
    "xss": 3,
    "hardcoded_secrets": 1,
    "missing_authentication": 1
  },
  "fix_success_rate": 100
}
```

---

## 📱 Check Slack

**Look at your #security channel** - you should see:

```
🚨 Security Issue Detected: sql_injection
Severity: 🔴 CRITICAL
...

✅ Security Fix Applied
Issue: SEC-XXXXXX
PR: #500 (CLICK TO REVIEW)
...

🔒 Security Fixes: 7 Issues Fixed
🔴 3 Critical | 🟠 4 High
```

---

## 🐙 Check GitHub PRs

**See what was created:**
```
gh pr list --label security
```

**Or go to:**
```
https://github.com/YOUR_OWNER/my-app/pulls?q=label%3Asecurity
```

**You'll see PRs like:**
```
🔒 Fix sql_injection: Parameterize database queries (#500)
🔒 Fix xss: Fix XSS vulnerabilities (#501)
🔒 Fix hardcoded_secrets: Move secrets to env vars (#502)
```

---

## 📊 View All Issues Detected

**List all issues:**
```
cat security-issues.json | jq '.issues[] | {id, title, severity, file_path, pr_number}'
```

**Expected output:**
```json
{
  "id": "SEC-1704067400...",
  "title": "SQL Injection: Parameterize database.js",
  "severity": "critical",
  "file_path": "src/database.js",
  "pr_number": 500
}
```

---

## 🔍 View One Specific Issue

**See details of first issue:**
```
cat security-issues.json | jq '.issues[0]'
```

**See the fix that was applied:**
```
cat security-issues.json | jq '.issues[0].fix_template'
```

---

## 📈 View Full Statistics

**Get all statistics:**
```
cat security-issues.json | jq '.statistics'
```

**Get metadata summary:**
```
cat security-issues.json | jq '.metadata'
```

---

## 🔄 Step-by-Step Test Workflow

### **Step 1: Scan (2 min)**
```
/fix-security-issues --scan
```
Expected: Finds 7 issues

### **Step 2: View what was found (30 sec)**
```
cat security-issues.json | jq '.issues | length'
```
Expected: `7`

### **Step 3: Auto-fix and create PRs (3 min)**
```
/fix-security-issues --all
```
Expected: Creates 2-3 PRs, sends Slack notification

### **Step 4: View PR numbers (30 sec)**
```
cat security-issues.json | jq '.issues[] | {id, pr_number}'
```
Expected: Each issue has a pr_number assigned

### **Step 5: Check GitHub (1 min)**
```
gh pr list --label security
```
Expected: Shows 2-3 new PRs with "security" label

### **Step 6: Check Slack (1 min)**
Go to #security channel  
Expected: 3+ notification messages with PR links

---

## 🎯 What Each Vulnerability Does

### **SQL Injection (src/database.js)**
```javascript
// BEFORE
const query = `SELECT * FROM users WHERE id = ${userId}`;

// FIXED
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### **XSS Attack (src/ui.js)**
```javascript
// BEFORE
commentContainer.innerHTML = `<div>${userInput}</div>`;

// FIXED
commentContainer.textContent = userInput;
```

### **Hardcoded Secrets (src/database.js)**
```javascript
// BEFORE
const API_KEY = "sk-1234567890abcdefghijklmnop";
const DB_PASSWORD = "admin123456";

// FIXED
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
```

### **Missing Authentication (src/api.js)**
```javascript
// BEFORE
app.get('/api/users', (req, res) => {
  const users = db.query('SELECT * FROM users');
  res.json(users);
});

// FIXED
app.get('/api/users', authenticateUser, (req, res) => {
  const users = db.query('SELECT * FROM users');
  res.json(users);
});
```

---

## ✅ Success Indicators

### **After `/fix-security-issues --scan`**
```
✅ Command completes
✅ No errors shown
✅ security-issues.json updated
✅ Says "Found 7 issues" (or similar)
```

### **After `/fix-security-issues --all`**
```
✅ Command completes in 3-5 min
✅ Creates branches: security/fix-*
✅ Creates 2-3 GitHub PRs
✅ Sends Slack notifications
✅ Updates PR numbers in JSON
✅ Sets status to "pr_created"
```

### **Check GitHub**
```
✅ 2-3 new PRs created
✅ Labels: security, auto-fix
✅ Title: 🔒 Fix {type}: {issue}
✅ Description has before/after code
```

### **Check Slack #security**
```
✅ Got notification about issues
✅ Got notification about fixes
✅ Notifications include PR links
✅ Batch summary showing counts
```

---

## 🆘 Quick Fixes

**Nothing happens when I run the command?**
```bash
# Check .env exists
test -f .env && echo "✓ .env exists" || echo "✗ .env missing"

# Check vulnerable files exist
ls src/database.js src/ui.js src/api.js
```

**Slack not notifying?**
```bash
# Test webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"test"}' $SLACK_WEBHOOK_URL
```

**GitHub PR not created?**
```bash
# Check gh CLI
gh --version

# Check repo clean
git status
```

---

## 🎉 Complete Test in 5 Commands

```bash
# 1. Scan
/fix-security-issues --scan

# 2. View summary
cat security-issues.json | jq '.metadata'

# 3. Full workflow
/fix-security-issues --all

# 4. Check results
cat security-issues.json | jq '.statistics'

# 5. View PRs
gh pr list --label security
```

---

## 📌 Copy This Exact Command

**To test everything in one go:**

```
/fix-security-issues --all
```

That's it! Watch for:
- ✅ GitHub PRs created
- ✅ Slack notifications sent
- ✅ Issues updated in JSON
- ✅ Status changed to "pr_created"

---

**🚀 Ready? Run this NOW:**

```
/fix-security-issues --all
```

Then check:
1. GitHub for new PRs
2. Slack #security for notifications
3. `security-issues.json` for updated status

**Total time: 5-10 minutes** ⏱️
