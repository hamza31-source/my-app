/**
 * Slack notification module
 * Sends security fix notifications to Slack
 */

const https = require("https");
const url = require("url");

class SlackNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send a Slack notification
   */
  async sendNotification(message) {
    if (!this.webhookUrl) {
      console.warn("Slack webhook URL not configured, skipping notification");
      return false;
    }

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(message);

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload.length,
        },
      };

      const req = https.request(this.webhookUrl, options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            reject(new Error(`Slack API error: ${res.statusCode}`));
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Notify about a detected security issue
   */
  async notifyIssueDetected(issue) {
    const message = {
      text: `🚨 Security Issue Detected: ${issue.vulnerability_type}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚨 Security Issue Detected",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Vulnerability Type*\n${issue.vulnerability_type}`,
            },
            {
              type: "mrkdwn",
              text: `*Severity*\n${this.getSeverityEmoji(issue.severity)} ${issue.severity.toUpperCase()}`,
            },
            {
              type: "mrkdwn",
              text: `*File*\n\`${issue.file_path}\``,
            },
            {
              type: "mrkdwn",
              text: `*Line*\n${issue.line_number}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Description*\n${issue.description}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Code Snippet*\n\`\`\`\n${issue.code_snippet}\n\`\`\``,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Detection Type*: ${issue.detection_type}\n*Status*: ${issue.status}`,
          },
        },
      ],
    };

    return this.sendNotification(message);
  }

  /**
   * Notify about a security fix being applied
   */
  async notifyFixApplied(issue, prNumber, prUrl) {
    const message = {
      text: `✅ Security Fix Applied: ${issue.vulnerability_type}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ Security Fix Applied",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Issue ID*\n${issue.id}`,
            },
            {
              type: "mrkdwn",
              text: `*Vulnerability*\n${issue.vulnerability_type}`,
            },
            {
              type: "mrkdwn",
              text: `*Severity*\n${this.getSeverityEmoji(issue.severity)} ${issue.severity.toUpperCase()}`,
            },
            {
              type: "mrkdwn",
              text: `*File*\n\`${issue.file_path}\``,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Title*\n${issue.title}`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Fix Type*: ${issue.detection_type === "auto" ? "Automated" : "Manual (AI-Analyzed)"}`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: `View PR #${prNumber}`,
              },
              url: prUrl,
              style: "primary",
            },
          ],
        },
      ],
    };

    return this.sendNotification(message);
  }

  /**
   * Notify about batch security fixes
   */
  async notifyBatchFixes(issues, prUrls) {
    const criticalCount = issues.filter(
      (i) => i.severity === "critical"
    ).length;
    const highCount = issues.filter((i) => i.severity === "high").length;
    const otherCount = issues.length - criticalCount - highCount;

    let severityText = "";
    if (criticalCount > 0) severityText += `🔴 ${criticalCount} Critical\n`;
    if (highCount > 0) severityText += `🟠 ${highCount} High\n`;
    if (otherCount > 0) severityText += `🟡 ${otherCount} Medium/Low`;

    const message = {
      text: `🔒 Security Fixes Batch: ${issues.length} issues fixed`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🔒 Security Fixes: ${issues.length} Issues Fixed`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: severityText,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Issues by Type*\n${this.getIssueTypesSummary(issues)}`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*PRs Created*\n${prUrls.map((url) => `• ${url}`).join("\n")}`,
          },
        },
      ],
    };

    return this.sendNotification(message);
  }

  /**
   * Notify about security scan results
   */
  async notifyScanResults(stats) {
    const message = {
      text: `📊 Security Scan Results`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📊 Security Scan Results",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Issues Found*\n${stats.total_issues}`,
            },
            {
              type: "mrkdwn",
              text: `*Critical*\n${stats.by_severity.critical}`,
            },
            {
              type: "mrkdwn",
              text: `*High*\n${stats.by_severity.high}`,
            },
            {
              type: "mrkdwn",
              text: `*Fix Success Rate*\n${stats.fix_success_rate}%`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Issues by Type*\n${Object.entries(stats.by_type)
              .map(([type, count]) => `• ${type}: ${count}`)
              .join("\n")}`,
          },
        },
      ],
    };

    return this.sendNotification(message);
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
   * Get summary of issue types
   */
  getIssueTypesSummary(issues) {
    const typeMap = {};
    issues.forEach((issue) => {
      typeMap[issue.vulnerability_type] =
        (typeMap[issue.vulnerability_type] || 0) + 1;
    });

    return Object.entries(typeMap)
      .map(([type, count]) => `• ${type}: ${count}`)
      .join("\n");
  }
}

module.exports = SlackNotifier;
