@echo off
REM Security Issues Fixer - Windows Batch Wrapper
REM Usage: fix-security-issues --all

node "%~dp0run-security.js" %*
