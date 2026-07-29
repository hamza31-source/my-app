# Security Issues Fixer - PowerShell Wrapper
# Usage: .\fix-security-issues.ps1 --all

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node "$ScriptDir/run-security.js" @Arguments
