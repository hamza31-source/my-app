#!/usr/bin/env node
/**
 * Security Issues CLI
 * Entry point for running security fixes from command line
 */

const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        const value = valueParts.join("=").trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const SecurityOrchestrator = require("./security/security-orchestrator");

const args = process.argv.slice(2);
const hasAllFlag = args.includes("--all") || args.includes("-a");

const projectRoot = process.cwd();

async function main() {
  try {
    // Validate environment variables
    if (!process.env.GITHUB_TOKEN) {
      console.error("❌ Error: GITHUB_TOKEN not found in .env file");
      process.exit(1);
    }
    if (!process.env.GITHUB_OWNER) {
      console.error("❌ Error: GITHUB_OWNER not found in .env file");
      process.exit(1);
    }
    if (!process.env.GITHUB_REPO) {
      console.error("❌ Error: GITHUB_REPO not found in .env file");
      process.exit(1);
    }

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
