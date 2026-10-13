@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

set REPO_NAME=life-assistant
set GIT_USER=XiuyuanSun0212

echo ==^> 目标仓库: https://github.com/%GIT_USER%/%REPO_NAME%
echo.

if not exist ".git" (
  echo ==^> 初始化本地仓库
  git init -q
  git branch -M main
)

type nul > .nojekyll

git add -A
git diff --cached --quiet
if errorlevel 1 (
  echo ==^> 提交改动
  git commit -q -m "chore: 更新生活助理 %date% %time%"
) else (
  echo ==^> 没有新改动，跳过提交
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin "https://github.com/%GIT_USER%/%REPO_NAME%.git"
) else (
  git remote set-url origin "https://github.com/%GIT_USER%/%REPO_NAME%.git"
)

echo ==^> 推送到 GitHub（第一次会要求登录）
git push -u origin main

echo.
echo 完成。去仓库 Settings -^> Pages 里把 Source 设为 main / root，
echo 然后访问: https://xiuyuansun0212.github.io/%REPO_NAME%/

pause
