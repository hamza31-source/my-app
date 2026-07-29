#!/usr/bin/env node
/**
 * Test PR creation directly
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Load .env
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

console.log("🧪 Testing PR creation...\n");

const env = { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN };
const title = "🔒 Test: Auto-fix Security Issues";
const body = "This is a test PR created by automated security workflow.";
const baseBranch = "main";
const headBranch = "security/fix-xss_vulnerability-xss_vulnerability";

console.log("Current branch:");
try {
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
  console.log(`  ${branch}\n`);
} catch (e) {
  console.log("  error\n");
}

console.log(`Attempting to create PR:`);
console.log(`  Base: ${baseBranch}`);
console.log(`  Head: ${headBranch}`);
console.log(`  Title: ${title}\n`);

try {
  const cmd = `gh pr create --base ${baseBranch} --head ${headBranch} --title "${title}" --body "${body}"`;

  console.log(`Command: ${cmd}\n`);

  const output = execSync(cmd, {
    cwd: process.cwd(),
    encoding: "utf-8",
    env: env,
    stdio: ["pipe", "pipe", "pipe"]
  });

  console.log("✅ PR created successfully!\n");
  console.log("Output:");
  console.log(output);
} catch (error) {
  console.error("❌ PR creation failed!\n");
  console.error("Error message:", error.message);
  console.error("Status code:", error.status);

  if (error.stdout) {
    console.error("Stdout:", error.stdout.toString());
  }
  if (error.stderr) {
    console.error("Stderr:", error.stderr.toString());
  }

  console.error("\n🔍 Troubleshooting:");
  console.error("1. Check if branch 'security/fix-xss_vulnerability-xss_vulnerability' exists");
  console.error("2. Check if it has commits ahead of 'main'");
  console.error("3. Check if PR already exists for this branch");
}
