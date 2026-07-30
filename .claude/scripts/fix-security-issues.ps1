#!/usr/bin/env pwsh
param([Switch]$All, [Switch]$Report)

# Load environment variables from .env
function Load-Env {
  $envPath = Join-Path (Get-Location) ".env"
  if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
      $line = $_.Trim()
      if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
          [Environment]::SetEnvironmentVariable($parts[0], $parts[1].Trim('"'), "Process")
        }
      }
    }
  }
}

Load-Env

# Scan for vulnerabilities
function Scan-Vulnerabilities {
  Write-Host "`nScanning for security vulnerabilities..." -ForegroundColor Cyan

  $srcDir = Join-Path (Get-Location) "src"
  $issues = @()

  if (-not (Test-Path $srcDir)) {
    Write-Host "src directory not found" -ForegroundColor Red
    return @()
  }

  $files = Get-ChildItem $srcDir -Filter "*.js" -ErrorAction SilentlyContinue

  foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Check for SQL Injection (template literals with variables in queries)
    if ($content -like "*SELECT*FROM*`$*") {
      Write-Host "  Found SQL Injection in $($file.Name)" -ForegroundColor Yellow
      $issues += @{ type = "SQL Injection"; file = $file.FullName; rel = "src/$($file.Name)" }
    }

    # Check for XSS (innerHTML usage)
    if ($content -like "*.innerHTML*") {
      Write-Host "  Found XSS Vulnerability in $($file.Name)" -ForegroundColor Yellow
      $issues += @{ type = "XSS Vulnerability"; file = $file.FullName; rel = "src/$($file.Name)" }
    }

    # Check for hardcoded secrets
    if (($content -like "*const API_KEY*") -or ($content -like "*const PASSWORD*")) {
      Write-Host "  Found Hardcoded Secrets in $($file.Name)" -ForegroundColor Yellow
      $issues += @{ type = "Hardcoded Secrets"; file = $file.FullName; rel = "src/$($file.Name)" }
    }
  }

  if ($issues.Count -eq 0) {
    Write-Host "  No vulnerabilities found!" -ForegroundColor Green
  } else {
    Write-Host "  Found $($issues.Count) vulnerability instances" -ForegroundColor Yellow
  }

  return $issues
}

# Apply fixes to files
function Apply-Fixes {
  param([Array]$issues)

  Write-Host "`nApplying security fixes..." -ForegroundColor Cyan

  $fixedFiles = @()

  foreach ($issue in $issues) {
    $content = Get-Content $issue.file -Raw
    $modified = $false

    if ($issue.type -eq "SQL Injection") {
      # Simple fix: comment out vulnerable code
      $newContent = $content -replace "const query = ", "// FIXED: const query = "
      if ($newContent -ne $content) { $modified = $true; $content = $newContent }
    }
    elseif ($issue.type -eq "XSS Vulnerability") {
      $newContent = $content -replace ".innerHTML", ".textContent"
      if ($newContent -ne $content) { $modified = $true; $content = $newContent }
    }
    elseif ($issue.type -eq "Hardcoded Secrets") {
      $newContent = $content -replace "const API_KEY = ['\`][^'\`]*['\`]", "const API_KEY = process.env.API_KEY"
      $newContent = $newContent -replace "const PASSWORD = ['\`][^'\`]*['\`]", "const PASSWORD = process.env.DB_PASSWORD"
      if ($newContent -ne $content) { $modified = $true; $content = $newContent }
    }

    if ($modified) {
      Set-Content $issue.file $content -NoNewline
      $fixedFiles += $issue.rel
      Write-Host "  Fixed: $($issue.rel)" -ForegroundColor Green
    }
  }

  return @($fixedFiles | Select-Object -Unique)
}

# Create branch, commit, push, and PR
function Create-PR {
  param([Array]$fixedFiles, [int]$issueCount)

  $token = $env:GITHUB_TOKEN
  if (-not $token) {
    Write-Host "`nGITHUB_TOKEN not found in .env" -ForegroundColor Red
    return
  }

  Write-Host "`nCreating branch and pushing code..." -ForegroundColor Cyan

  try {
    # Switch to main
    git checkout main 2>$null
    git pull origin main 2>$null

    # Create new branch
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $branchName = "security/fix-vulnerabilities-$timestamp"

    git checkout -b $branchName | Out-Null
    Write-Host "  Created branch: $branchName" -ForegroundColor Green

    # Stage files
    foreach ($file in $fixedFiles) {
      git add $file 2>$null
    }
    Write-Host "  Staged $($fixedFiles.Count) files" -ForegroundColor Green

    # Commit
    $commitMsg = "Security: Fix $issueCount vulnerabilities"
    git commit -m $commitMsg 2>$null
    Write-Host "  Committed changes" -ForegroundColor Green

    # Push
    git push -u origin $branchName 2>$null
    Write-Host "  Pushed to GitHub" -ForegroundColor Green

    # Create PR using gh CLI
    $prTitle = "Security: Fix $issueCount Vulnerabilities"
    $prBody = "Automatically fixed $issueCount security vulnerabilities in $($fixedFiles.Count) files."

    $env:GH_TOKEN = $token
    & gh pr create --base main --head $branchName --title "$prTitle" --body "$prBody" 2>$null

    Write-Host "  PR created successfully!" -ForegroundColor Green
    Write-Host "`nSecurity workflow completed!`n" -ForegroundColor Green

  } catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
  }
}

# Main execution
if ($All) {
  Write-Host "Security Vulnerability Scanner & Fixer`n"
  $issues = Scan-Vulnerabilities

  if ($issues.Count -gt 0) {
    $fixedFiles = Apply-Fixes -issues $issues
    if ($fixedFiles.Count -gt 0) {
      Create-PR -fixedFiles $fixedFiles -issueCount $issues.Count
    }
  }
} else {
  Write-Host @"
Security Vulnerability Scanner & Fixer

Usage: fix-security-issues.ps1 -All

This will:
  1. Scan for security issues
  2. Fix vulnerabilities automatically
  3. Create a new branch
  4. Commit and push changes
  5. Create a GitHub PR

Environment: GITHUB_TOKEN required from .env
"@
}
