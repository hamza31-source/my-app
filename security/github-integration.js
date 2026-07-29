/**
 * GitHub integration module
 * Handles branch creation, commits, and pull requests
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class GitHubIntegration {
  constructor(config) {
    this.token = config.token;
    this.owner = config.owner;
    this.repo = config.repo;
    this.baseBranch = config.baseBranch || "main";
    this.projectRoot = config.projectRoot || process.cwd();
  }

  /**
   * Execute git command
   */
  execGit(command) {
    try {
      return execSync(`git ${command}`, {
        cwd: this.projectRoot,
        encoding: "utf-8",
      }).trim();
    } catch (error) {
      console.error(`Git command failed: git ${command}`);
      throw error;
    }
  }

  /**
   * Create a new branch for the security fix
   */
  createBranch(issueId, vulnerabilityType) {
    const branchName = `security/fix-${vulnerabilityType}-${issueId}`;

    try {
      // Ensure we're on base branch
      this.execGit(`checkout ${this.baseBranch}`);

      // Pull latest
      this.execGit(`pull origin ${this.baseBranch}`);

      // Create and checkout new branch
      this.execGit(`checkout -b ${branchName}`);

      console.log(`✓ Branch created: ${branchName}`);
      return branchName;
    } catch (error) {
      console.error(`Failed to create branch: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stage files for commit
   */
  stageFiles(files) {
    files.forEach((file) => {
      try {
        this.execGit(`add ${file}`);
      } catch (error) {
        console.error(`Failed to stage file ${file}: ${error.message}`);
      }
    });
  }

  /**
   * Create a commit
   */
  commitChanges(message, details = "") {
    try {
      const commitMessage = `${message}\n\n${details}`;
      this.execGit(`commit -m "${commitMessage}"`);
      console.log(`✓ Commit created: ${message}`);
      return true;
    } catch (error) {
      console.error(`Failed to commit: ${error.message}`);
      throw error;
    }
  }

  /**
   * Push branch to remote
   */
  pushBranch(branchName) {
    try {
      this.execGit(`push -u origin ${branchName}`);
      console.log(`✓ Branch pushed: ${branchName}`);
      return true;
    } catch (error) {
      console.error(`Failed to push branch: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a pull request using GitHub CLI
   */
  createPullRequest(branchName, issue) {
    const title = `🔒 Fix ${issue.vulnerability_type}: ${issue.title}`;

    const body = this.generatePRDescription(issue);

    const labels = `security,${issue.detection_type}-fix`;

    try {
      // Create environment with GitHub token for gh CLI
      const env = { ...process.env, GH_TOKEN: this.token };

      // Using GitHub CLI (gh) if available
      const ghCommand = `gh pr create --base ${this.baseBranch} --head ${branchName} --title "${title}" --body "${body}" --label "${labels}"`;

      console.log(`📝 Creating PR: ${title}`);

      const output = execSync(ghCommand, {
        cwd: this.projectRoot,
        encoding: "utf-8",
        env: env,
        stdio: ["pipe", "pipe", "pipe"]
      });

      // Extract PR number from output
      const prMatch = output.match(/#(\d+)/);
      const prNumber = prMatch ? parseInt(prMatch[1]) : null;

      // Extract PR URL
      const urlMatch = output.match(/(https:\/\/github\.com\/[^\s]+)/);
      const prUrl = urlMatch ? urlMatch[1] : null;

      if (prNumber) {
        console.log(`✓ Pull request created: #${prNumber}\n  ${prUrl}`);
      }

      return {
        number: prNumber,
        url: prUrl,
        title,
      };
    } catch (error) {
      console.error(`❌ Failed to create pull request: ${error.message}`);
      if (error.stderr) {
        console.error(`Error details: ${error.stderr}`);
      }
      throw error;
    }
  }

  /**
   * Generate PR description
   */
  generatePRDescription(issue) {
    const severityEmoji = this.getSeverityEmoji(issue.severity);

    return `## Security Fix: ${issue.vulnerability_type}

${severityEmoji} **Severity**: ${issue.severity.toUpperCase()}

### Issue Details
- **ID**: ${issue.id}
- **Type**: ${issue.vulnerability_type}
- **File**: \`${issue.file_path}\`
- **Line**: ${issue.line_number}
- **Detected**: ${issue.detection_type}

### Vulnerability Description
${issue.description}

### Vulnerable Code
\`\`\`
${issue.code_snippet}
\`\`\`

### Fix Applied
${issue.detection_type === "auto" ? "This fix was automatically applied based on security pattern templates." : "This fix was manually analyzed and created using AI-powered security analysis."}

### Template
\`\`\`
${issue.fix_template}
\`\`\`

### Testing Recommendations
1. Run security linters to verify the fix
2. Execute existing test suite
3. Add regression tests for this vulnerability type
4. Review the changes for any unintended side effects

### Related Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Guidelines](./docs/SECURITY.md)

---
*This PR was automatically generated by the Hybrid Security Workflow.*
`;
  }

  /**
   * Get severity emoji
   */
  getSeverityEmoji(severity) {
    const emojis = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🟢",
    };
    return emojis[severity] || "⚪";
  }

  /**
   * Get current branch
   */
  getCurrentBranch() {
    try {
      return this.execGit("rev-parse --abbrev-ref HEAD");
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if repository is clean
   */
  isRepositoryClean() {
    try {
      const status = this.execGit("status --porcelain");
      return status === "";
    } catch (error) {
      return false;
    }
  }

  /**
   * Stash uncommitted changes
   */
  stashChanges(message = "Temporary stash for security fix") {
    try {
      this.execGit(`stash push -m "${message}"`);
      return true;
    } catch (error) {
      console.error(`Failed to stash changes: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if branch exists
   */
  branchExists(branchName) {
    try {
      this.execGit(`rev-parse --verify ${branchName}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete local branch
   */
  deleteBranch(branchName, force = false) {
    try {
      const flag = force ? "-D" : "-d";
      this.execGit(`branch ${flag} ${branchName}`);
      console.log(`✓ Branch deleted: ${branchName}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete branch: ${error.message}`);
      return false;
    }
  }

  /**
   * Merge PR (requires GitHub CLI)
   */
  mergePullRequest(prNumber) {
    try {
      execSync(`gh pr merge ${prNumber} --auto --squash`, {
        cwd: this.projectRoot,
        encoding: "utf-8",
      });
      console.log(`✓ PR #${prNumber} merged`);
      return true;
    } catch (error) {
      console.error(`Failed to merge PR: ${error.message}`);
      return false;
    }
  }

  /**
   * Add commit co-author
   */
  addCoAuthor(name, email) {
    // This is typically added to the commit message
    return `Co-authored-by: ${name} <${email}>`;
  }
}

module.exports = GitHubIntegration;
