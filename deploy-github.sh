#!/usr/bin/env bash
# 一键推送到 GitHub Pages
# 用法：bash deploy-github.sh
set -e

cd "$(dirname "$0")"

REPO_NAME="${1:-life-assistant}"
USER_NAME="XiuyuanSun0212"

echo "==> 目标仓库：https://github.com/$USER_NAME/$REPO_NAME"
echo ""

if [ ! -d .git ]; then
  echo "==> 初始化本地仓库"
  git init -q
  git branch -M main 2>/dev/null || true
fi

# 确保不被 Jekyll 处理
touch .nojekyll

git add -A
if git diff --cached --quiet; then
  echo "==> 没有新改动，跳过提交"
else
  echo "==> 提交改动"
  git commit -q -m "chore: 更新生活助理 $(date +%Y-%m-%d\ %H:%M)"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/$USER_NAME/$REPO_NAME.git"
else
  git remote add origin "https://github.com/$USER_NAME/$REPO_NAME.git"
fi

echo "==> 推送到 GitHub（第一次会要求登录）"
git push -u origin main

echo ""
echo "完成。去仓库 Settings -> Pages 里把 Source 设为 main / root，"
echo "然后访问：https://${USER_NAME,,}.github.io/$REPO_NAME/"
