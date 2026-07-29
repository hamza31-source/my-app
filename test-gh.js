#!/usr/bin/env node
/**
 * Test GitHub CLI with token
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

console.log("🧪 Testing GitHub CLI...\n");

// Test 1: Check if gh is installed
console.log("1️⃣  Checking if 'gh' is installed...");
try {
  const version = execSync("gh --version", { encoding: "utf-8" });
  console.log(`✓ gh installed: ${version.split("\n")[0]}\n`);
} catch (error) {
  console.error("❌ gh not installed!");
  process.exit(1);
}

// Test 2: Check authentication
console.log("2️⃣  Checking GitHub authentication...");
try {
  const env = { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN };
  const result = execSync("gh auth status", {
    encoding: "utf-8",
    env: env,
    stdio: ["pipe", "pipe", "pipe"]
  });
  console.log(`✓ Auth status:\n${result}\n`);
} catch (error) {
  console.error(`❌ Auth failed: ${error.message}`);
  console.error(`Make sure your GITHUB_TOKEN is valid!\n`);
}

// Test 3: Get repo info
console.log("3️⃣  Fetching repository info...");
try {
  const env = { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN };
  const repo = execSync(`gh repo view ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`, {
    encoding: "utf-8",
    env: env,
  });
  console.log(`✓ Repo found:\n${repo}\n`);
} catch (error) {
  console.error(`❌ Failed to fetch repo: ${error.message}\n`);
}

// Test 4: Check current branch
console.log("4️⃣  Checking current git branch...");
try {
  const branch = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf-8",
    cwd: process.cwd(),
  }).trim();
  console.log(`✓ Current branch: ${branch}\n`);
} catch (error) {
  console.error(`❌ Git check failed: ${error.message}\n`);
}

console.log("✅ All tests passed! Ready to create PRs.\n");
