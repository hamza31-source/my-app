/**
 * Security Orchestrator
 * Main entry point for the hybrid security workflow
 * Orchestrates pattern detection, fixing, PR creation, and notifications
 */

const PatternDetector = require("./pattern-detector");
const SlackNotifier = require("./slack-notifier");
const GitHubIntegration = require("./github-integration");
const fs = require("fs");
const path = require("path");

class SecurityOrchestrator {
  constructor(config = {}) {
    this.config = {
      projectRoot: config.projectRoot || process.cwd(),
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
      githubOwner: config.githubOwner || process.env.GITHUB_OWNER,
      githubRepo: config.githubRepo || process.env.GITHUB_REPO,
      slackWebhookUrl: config.slackWebhookUrl || process.env.SLACK_WEBHOOK_URL,
      baseBranch: config.baseBranch || "main",
      ...config,
    };

    this.detector = new PatternDetector(this.config.projectRoot);
    this.slack = new SlackNotifier(this.config.slackWebhookUrl);
    this.github = new GitHubIntegration({
      token: this.config.githubToken,
      owner: this.config.githubOwner,
      repo: this.config.githubRepo,
      baseBranch: this.config.baseBranch,
      projectRoot: this.config.projectRoot,
    });
  }

  /**
   * Run full security workflow
   */
  async runFullWorkflow() {
    console.log("🔒 Starting Hybrid Security Workflow...\n");

    try {
      // Step 1: Scan project
      console.log("Step 1: Scanning project for vulnerabilities...");
      const issues = this.detector.scanProject();
      console.log(`Found ${issues.length} potential security issues\n`);

      if (issues.length === 0) {
        console.log("✅ No security issues found!");
        await this.slack.notifyScanResults(this.detector.calculateStatistics([]));
        return { success: true, message: "No issues found" };
      }

      // Step 2: Apply automatic fixes
      console.log("Step 2: Applying automatic fixes...");
      const fixedIssues = await this.autoFixIssues(issues);
      console.log(`Fixed ${fixedIssues.length} issues automatically\n`);

      // Step 3: Create pull requests
      console.log("Step 3: Creating pull requests...");
      const prs = await this.createPullRequests(fixedIssues);
      console.log(`Created ${prs.length} pull requests\n`);

      // Step 4: Send Slack notifications
      console.log("Step 4: Sending Slack notifications...");
      await this.sendBatchNotification(fixedIssues, prs);
      console.log("✅ Notifications sent\n");

      // Step 5: Save updated issues
      this.detector.saveIssues(issues);
      console.log("✅ Security workflow completed successfully!");

      return {
        success: true,
        issuesFound: issues.length,
        issuesFixed: fixedIssues.length,
        prsCreated: prs.length,
      };
    } catch (error) {
      console.error("❌ Workflow failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Scan project for issues
   */
  async scanProject() {
    console.log("🔍 Scanning project for security issues...");
    const issues = this.detector.scanProject();
    await this.slack.notifyScanResults(
      this.detector.calculateStatistics(issues)
    );
    return issues;
  }

  /**
   * Auto-fix issues that have patterns
   */
  async autoFixIssues(issues) {
    const fixedIssues = [];

    for (const issue of issues) {
      if (issue.detection_type !== "auto") continue;

      try {
        const fullPath = path.join(this.config.projectRoot, issue.file_path);

        // Apply fix
        this.detector.applyFix(fullPath, issue.vulnerability_type);

        // Mark as pending fix
        issue.status = "auto_fixed";
        fixedIssues.push(issue);

        console.log(`✓ Fixed: ${issue.id} (${issue.vulnerability_type})`);
      } catch (error) {
        console.error(`✗ Failed to fix ${issue.id}: ${error.message}`);
      }
    }

    return fixedIssues;
  }

  /**
   * Create pull requests for fixed issues
   */
  async createPullRequests(issues) {
    const prs = [];

    if (issues.length === 0) {
      console.log("No issues to fix");
      return prs;
    }

    try {
      // Ensure repo is clean
      if (!this.github.isRepositoryClean()) {
        console.log("Repository has uncommitted changes, stashing...");
        this.github.stashChanges();
      }

      // Group issues by type for batch PRs (optional)
      const issuesByType = this.groupByType(issues);

      for (const [type, typeIssues] of Object.entries(issuesByType)) {
        const branchName = this.github.createBranch(type, type);

        // Stage fixed files
        const files = [...new Set(typeIssues.map((i) => i.file_path))];
        this.github.stageFiles(files);

        // Create commit
        const commitMessage = `🔒 Security Fix: ${type}`;
        const commitDetails = `Fixed ${typeIssues.length} ${type} vulnerabilities\n\nIssues: ${typeIssues.map((i) => i.id).join(", ")}`;

        this.github.commitChanges(commitMessage, commitDetails);

        // Push branch
        this.github.pushBranch(branchName);

        // Create PR for the first issue in the group (representative)
        const pr = this.github.createPullRequest(branchName, typeIssues[0]);

        // Update issues with PR info
        typeIssues.forEach((issue) => {
          issue.pr_number = pr.number;
          issue.pr_url = pr.url;
          issue.status = "pr_created";
        });

        prs.push({
          number: pr.number,
          url: pr.url,
          type,
          issueCount: typeIssues.length,
        });

        console.log(`✓ PR created: #${pr.number} for ${typeIssues.length} issues`);
      }
    } catch (error) {
      console.error(`Failed to create PRs: ${error.message}`);
    }

    return prs;
  }

  /**
   * Send batch notification to Slack
   */
  async sendBatchNotification(issues, prs) {
    const prUrls = prs.map((pr) => `<${pr.url}|#${pr.number}> (${pr.type})`);

    try {
      await this.slack.notifyBatchFixes(issues, prUrls);
    } catch (error) {
      console.error(`Failed to send Slack notification: ${error.message}`);
    }
  }

  /**
   * Get a specific issue and analyze it with AI
   */
  async analyzeIssueManual(issueId) {
    const issues = this.detector.loadIssues();
    const issue = issues.find((i) => i.id === issueId);

    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    console.log(`Analyzing issue ${issueId}: ${issue.title}`);
    console.log(`Vulnerability: ${issue.vulnerability_type}`);
    console.log(`File: ${issue.file_path}:${issue.line_number}`);
    console.log(`Description: ${issue.description}`);

    // This would integrate with Claude API for manual analysis
    // For now, return the issue for manual processing
    return issue;
  }

  /**
   * Group issues by vulnerability type
   */
  groupByType(issues) {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.vulnerability_type]) {
        acc[issue.vulnerability_type] = [];
      }
      acc[issue.vulnerability_type].push(issue);
      return acc;
    }, {});
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    const issues = this.detector.loadIssues();
    const stats = this.detector.calculateStatistics(issues);

    return {
      total_issues: issues.length,
      pending_issues: issues.filter((i) => i.status === "pending").length,
      pr_created: issues.filter((i) => i.status === "pr_created").length,
      merged: issues.filter((i) => i.merged).length,
      statistics: stats,
      issues_by_severity: {
        critical: issues.filter((i) => i.severity === "critical"),
        high: issues.filter((i) => i.severity === "high"),
        medium: issues.filter((i) => i.severity === "medium"),
        low: issues.filter((i) => i.severity === "low"),
      },
    };
  }

  /**
   * Get pending PRs for review
   */
  getPendingPRs() {
    const issues = this.detector.loadIssues();
    return issues.filter(
      (i) => i.status === "pr_created" && !i.merged && i.pr_number
    );
  }

  /**
   * Mark issue as reviewed and ready for merge
   */
  approveIssue(issueId) {
    const issues = this.detector.loadIssues();
    const issue = issues.find((i) => i.id === issueId);

    if (issue) {
      issue.status = "approved";
      this.detector.saveIssues(issues);
      console.log(`✓ Issue ${issueId} approved`);
      return true;
    }
    return false;
  }

  /**
   * Reject an issue fix
   */
  rejectIssue(issueId, reason = "") {
    const issues = this.detector.loadIssues();
    const issue = issues.find((i) => i.id === issueId);

    if (issue) {
      issue.status = "rejected";
      issue.notes = reason;
      this.detector.saveIssues(issues);
      console.log(`✓ Issue ${issueId} rejected`);
      return true;
    }
    return false;
  }

  /**
   * Mark issue as false positive
   */
  markFalsePositive(issueId) {
    const issues = this.detector.loadIssues();
    const issue = issues.find((i) => i.id === issueId);

    if (issue) {
      this.detector.markAsFalsePositive(issueId);
      this.detector.saveIssues(issues);
      console.log(`✓ Issue ${issueId} marked as false positive`);
      return true;
    }
    return false;
  }
}

module.exports = SecurityOrchestrator;
