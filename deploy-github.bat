@echo off
setlocal
cd /d "%~dp0"

set REPO_NAME=life-assistant
set GIT_USER=XiuyuanSun0212

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] git not found. Install Git for Windows first.
  pause
  exit /b 1
)

if not exist ".git" (
  echo ==^> git init
  git init -q
  git branch -M main
)

type nul > .nojekyll

git add -A
git diff --cached --quiet
if errorlevel 1 (
  echo ==^> commit changes
  git commit -q -m "chore: update life-assistant %date% %time%"
) else (
  echo ==^> nothing new to commit
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin git@github.com:%GIT_USER%/%REPO_NAME%.git
) else (
  git remote set-url origin git@github.com:%GIT_USER%/%REPO_NAME%.git
)

echo ==^> push to GitHub via SSH
git push -u origin main
if errorlevel 1 (
  echo.
  echo [ERROR] push failed. Check:
  echo   1. repo exists: github.com/%GIT_USER%/%REPO_NAME%
  echo   2. SSH key added to your GitHub account
  pause
  exit /b 1
)

echo.
echo Done. First time only, enable Pages:
echo   repo Settings - Pages - Source: Deploy from a branch - main / ^(root^) - Save
echo Site: https://%GIT_USER%.github.io/%REPO_NAME%/
pause
