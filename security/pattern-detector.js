/**
 * Pattern detector for security vulnerabilities
 * Scans project files and detects common security issues
 */

const fs = require("fs");
const path = require("path");
const patterns = require("./patterns");

class PatternDetector {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.issuesFile = path.join(projectRoot, "security-issues.json");
    this.detectedIssues = [];
  }

  /**
   * Load current issues from JSON file
   */
  loadIssues() {
    if (fs.existsSync(this.issuesFile)) {
      const content = fs.readFileSync(this.issuesFile, "utf-8");
      const data = JSON.parse(content);
      return data.issues || [];
    }
    return [];
  }

  /**
   * Save issues to JSON file
   */
  saveIssues(issues) {
    const data = {
      metadata: {
        version: "1.0",
        last_scan: new Date().toISOString(),
        total_issues: issues.length,
        total_fixed: issues.filter((i) => i.status === "merged").length,
        auto_fixed: issues.filter(
          (i) => i.detection_type === "auto" && i.merged
        ).length,
        manual_fixed: issues.filter(
          (i) => i.detection_type === "manual" && i.merged
        ).length,
        false_positives: issues.filter((i) => i.status === "false_positive")
          .length,
      },
      issues,
      statistics: this.calculateStatistics(issues),
    };

    fs.writeFileSync(this.issuesFile, JSON.stringify(data, null, 2));
  }

  /**
   * Analyze a single code file for vulnerabilities
   */
  analyzeFile(filePath) {
    const issues = [];

    if (!fs.existsSync(filePath)) {
      return issues;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    Object.entries(patterns).forEach(([typeKey, pattern]) => {
      pattern.patterns.forEach((regex) => {
        let match;
        lines.forEach((line, lineIndex) => {
          if (regex.test(line)) {
            const issueId = `SEC-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;

            issues.push({
              id: issueId,
              title: `${pattern.name}: ${path.basename(filePath)}`,
              description: pattern.description,
              severity: pattern.severity,
              vulnerability_type: typeKey,
              file_path: path.relative(this.projectRoot, filePath),
              line_number: lineIndex + 1,
              code_snippet: line.trim(),
              detection_type: "auto",
              detection_method: "pattern_matching",
              detected_at: new Date().toISOString(),
              status: "pending",
              suggested_fix: pattern.description,
              fix_template: pattern.template,
              pr_number: null,
              pr_url: null,
              merged: false,
              assigned_to: null,
              notes: "",
            });
          }
        });
      });
    });

    return issues;
  }

  /**
   * Scan entire project for vulnerabilities
   */
  scanProject(excludeDirs = ["node_modules", ".git", "dist", "build"]) {
    const allIssues = [];

    const scanDir = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(this.projectRoot, fullPath);

        // Skip excluded directories
        if (excludeDirs.some((exclude) => relativePath.includes(exclude))) {
          return;
        }

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (
          /\.(js|ts|jsx|tsx|py|java|go|rb)$/.test(file) &&
          !file.startsWith(".")
        ) {
          const issues = this.analyzeFile(fullPath);
          allIssues.push(...issues);
        }
      });
    };

    scanDir(this.projectRoot);

    // Merge with existing issues
    const existingIssues = this.loadIssues();
    const mergedIssues = this.mergeIssues(existingIssues, allIssues);

    this.detectedIssues = mergedIssues;
    this.saveIssues(mergedIssues);

    return mergedIssues;
  }

  /**
   * Merge existing issues with newly detected ones
   * Avoid duplicates
   */
  mergeIssues(existing, newIssues) {
    const deduped = new Map();

    // Add existing issues first
    existing.forEach((issue) => {
      const key = `${issue.file_path}:${issue.line_number}:${issue.vulnerability_type}`;
      deduped.set(key, issue);
    });

    // Add new issues (overwrites if already exists)
    newIssues.forEach((issue) => {
      const key = `${issue.file_path}:${issue.line_number}:${issue.vulnerability_type}`;
      if (!deduped.has(key)) {
        deduped.set(key, issue);
      }
    });

    return Array.from(deduped.values());
  }

  /**
   * Apply fix to code
   */
  applyFix(filePath, issueType) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    let content = fs.readFileSync(filePath, "utf-8");
    const pattern = patterns[issueType];

    if (!pattern) {
      throw new Error(`Unknown issue type: ${issueType}`);
    }

    // Apply the fix function
    const fixed = pattern.fix(content);

    // Write back to file
    fs.writeFileSync(filePath, fixed, "utf-8");

    return fixed;
  }

  /**
   * Calculate statistics about detected issues
   */
  calculateStatistics(issues) {
    const stats = {
      by_severity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      by_type: {},
      detection_rate: {
        last_week: 0,
        last_month: 0,
        total: issues.length,
      },
      fix_success_rate: 0,
      average_time_to_fix_hours: 0,
    };

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    issues.forEach((issue) => {
      // Count by severity
      stats.by_severity[issue.severity]++;

      // Count by type
      stats.by_type[issue.vulnerability_type] =
        (stats.by_type[issue.vulnerability_type] || 0) + 1;

      // Count detection rate
      const detectedDate = new Date(issue.detected_at);
      if (detectedDate >= oneWeekAgo) stats.detection_rate.last_week++;
      if (detectedDate >= oneMonthAgo) stats.detection_rate.last_month++;
    });

    // Calculate fix success rate
    const fixedIssues = issues.filter((i) => i.merged).length;
    stats.fix_success_rate =
      issues.length > 0 ? Math.round((fixedIssues / issues.length) * 100) : 0;

    return stats;
  }

  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity) {
    return this.detectedIssues.filter((i) => i.severity === severity);
  }

  /**
   * Get issues by type
   */
  getIssuesByType(type) {
    return this.detectedIssues.filter((i) => i.vulnerability_type === type);
  }

  /**
   * Get pending issues (not yet fixed)
   */
  getPendingIssues() {
    return this.detectedIssues.filter((i) => i.status === "pending");
  }

  /**
   * Mark issue as fixed
   */
  markAsFixed(issueId, prNumber, prUrl) {
    const issue = this.detectedIssues.find((i) => i.id === issueId);
    if (issue) {
      issue.status = "pr_created";
      issue.pr_number = prNumber;
      issue.pr_url = prUrl;
    }
  }

  /**
   * Mark issue as merged
   */
  markAsMerged(issueId) {
    const issue = this.detectedIssues.find((i) => i.id === issueId);
    if (issue) {
      issue.status = "merged";
      issue.merged = true;
    }
  }

  /**
   * Mark issue as false positive
   */
  markAsFalsePositive(issueId) {
    const issue = this.detectedIssues.find((i) => i.id === issueId);
    if (issue) {
      issue.status = "false_positive";
    }
  }
}

module.exports = PatternDetector;
