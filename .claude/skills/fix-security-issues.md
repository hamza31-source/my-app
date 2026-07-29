# Fix Security Issues Skill

Automated security vulnerability detection, fixing, and reporting for the my-app project.

## Invocation

```bash
/fix-security-issues [options]
```

## Options

- `--scan` - Scan project for security issues and update security-issues.json
- `--fix` - Fix detected security issues automatically
- `--manual <issue-id>` - Manually fix a specific issue with AI analysis
- `--report` - Generate security report and send to Slack
- `--create-prs` - Create pull requests for all fixed issues
- `--all` - Run complete workflow (scan → fix → create PRs → report)

## Workflow Steps

### 1. Security Scanning
- Pattern matching for common vulnerabilities
- Dependency vulnerability checks
- Code analysis for insecure patterns
- Results saved to `security-issues.json`

### 2. Automatic Fixing
Automatically fixes these patterns:
- **SQL Injection**: Converts to parameterized queries
- **XSS Vulnerabilities**: Changes innerHTML to textContent
- **Hardcoded Secrets**: Moves to environment variables
- **Vulnerable Dependencies**: Updates package.json versions
- **Missing Authentication**: Adds auth middleware

### 3. Pull Request Creation
- Creates feature branch `security/fix-{issue-id}`
- Commits fixes with detailed message
- Creates PR with description linking to issue
- Adds labels: `security`, `auto-fix` or `manual-fix`

### 4. Slack Notification
Sends to configured webhook:
```
🔒 Security Fix: {vulnerability_type}
Issue: {title}
Files: {affected_files}
PR: {pr_url}
Status: Fixed by {detection_type}
```

### 5. GitHub PR Integration
- PR includes:
  - Vulnerability description
  - Fix explanation
  - Before/after code snippets
  - Security guidelines link
  - Merge requirements check

## Examples

```bash
# Scan entire project
/fix-security-issues --scan

# Auto-fix all detected issues
/fix-security-issues --fix

# Manually analyze and fix issue SEC-002
/fix-security-issues --manual SEC-002

# Full workflow: scan, fix, create PRs, notify Slack
/fix-security-issues --all

# Generate and send report
/fix-security-issues --report
```

## Configuration

Required environment variables in `.env`:
```
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-org
GITHUB_REPO=my-app
SLACK_WEBHOOK_URL=your-webhook-url
CLAUDE_API_KEY=your-claude-key (for manual fixes)
```

## Output

- Updates `security-issues.json` with detection results
- Creates branches and PRs for fixes
- Sends Slack notifications
- Generates logs in `logs/security-*.log`

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
