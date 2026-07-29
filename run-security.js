#!/usr/bin/env node
/**
 * Security Issues CLI
 * Entry point for running security fixes from command line
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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

// Create PR directly using gh CLI
function createPRDirectly(branchName, title, body) {
  try {
    console.log(`\n📝 Creating pull request...`);
    console.log(`  Branch: ${branchName}`);
    console.log(`  Title: ${title}\n`);

    const ghCommand = `gh pr create --base main --head ${branchName} --title "${title}" --body "${body}"`;

    const output = execSync(ghCommand, {
      cwd: projectRoot,
      encoding: "utf-8",
      env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
      stdio: ["pipe", "pipe", "pipe"]
    });

    console.log(`✅ PR created successfully!`);
    console.log(`   Output: ${output}`);

    return output;
  } catch (error) {
    console.error(`❌ PR creation failed`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
      cwd: projectRoot,
    }).trim();
  } catch (error) {
    return null;
  }
}

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

    console.log("✓ Environment variables loaded:");
    console.log(`  GITHUB_TOKEN: ${process.env.GITHUB_TOKEN.substring(0, 10)}...`);
    console.log(`  GITHUB_OWNER: ${process.env.GITHUB_OWNER}`);
    console.log(`  GITHUB_REPO: ${process.env.GITHUB_REPO}\n`);

    const orchestrator = new SecurityOrchestrator({
      projectRoot,
    });

    if (hasAllFlag) {
      // Run full workflow to fix all security issues
      const result = await orchestrator.runFullWorkflow();

      // Get current branch (should be the security fix branch)
      const currentBranch = getCurrentBranch();

      if (result.success && currentBranch && currentBranch.startsWith("security/")) {
        console.log(`\n🌿 Current branch: ${currentBranch}`);

        // Create PR for the fixed issues
        try {
          const title = `🔒 Fix ${result.issuesFixed} Security Vulnerabilities`;
          const body = `Automatically detected and fixed ${result.issuesFixed} security vulnerabilities:\n\n- SQL Injection issues fixed\n- XSS vulnerabilities patched\n- Hardcoded secrets removed\n- Missing authentication added\n- Vulnerable dependencies updated\n\nTotal issues found: ${result.issuesFound}\nIssues fixed: ${result.issuesFixed}`;

          createPRDirectly(currentBranch, title, body);
        } catch (prError) {
          console.error(`Note: Could not auto-create PR. You can create it manually with:`);
          console.error(`  gh pr create --base main --head ${currentBranch} --title "Fix security vulnerabilities" --body "..."`);
        }
      }

      process.exit(result.success ? 0 : 1);
    } else {
      // Just scan without fixing
      const issues = await orchestrator.scanProject();
      process.exit(issues.length > 0 ? 1 : 0);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
