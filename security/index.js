/**
 * Security module entry point
 * Export all security components
 */

const PatternDetector = require("./pattern-detector");
const SlackNotifier = require("./slack-notifier");
const GitHubIntegration = require("./github-integration");
const SecurityOrchestrator = require("./security-orchestrator");
const patterns = require("./patterns");

module.exports = {
  PatternDetector,
  SlackNotifier,
  GitHubIntegration,
  SecurityOrchestrator,
  patterns,

  // Convenience exports
  createOrchestrator: (config) => new SecurityOrchestrator(config),
  createDetector: (projectRoot) => new PatternDetector(projectRoot),
  createNotifier: (webhookUrl) => new SlackNotifier(webhookUrl),
  createGitHub: (config) => new GitHubIntegration(config),
};
