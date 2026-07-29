#!/usr/bin/env node
/**
 * Security Issues CLI
 * Entry point for running security fixes from command line
 */

const SecurityOrchestrator = require("./security/security-orchestrator");
const path = require("path");

const args = process.argv.slice(2);
const hasAllFlag = args.includes("--all") || args.includes("-a");

const projectRoot = process.cwd();

async function main() {
  try {
    const orchestrator = new SecurityOrchestrator({
      projectRoot,
    });

    if (hasAllFlag) {
      // Run full workflow to fix all security issues
      const result = await orchestrator.runFullWorkflow();
      process.exit(result.success ? 0 : 1);
    } else {
      // Just scan without fixing
      const issues = await orchestrator.scanProject();
      process.exit(issues.length > 0 ? 1 : 0);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
