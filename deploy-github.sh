#!/usr/bin/env bash
# 一键推送到 GitHub Pages（走 SSH，不再依赖 HTTPS 登录）
# 用法：bash deploy-github.sh
set -e
cd "$(dirname "$0")"

REPO_NAME="${1:-life-assistant}"
USER_NAME="XiuyuanSun0212"
SSH_URL="git@github.com:$USER_NAME/$REPO_NAME.git"

echo "==> 目标仓库：https://github.com/$USER_NAME/$REPO_NAME"

command -v git >/dev/null 2>&1 || { echo "[错误] 没找到 git"; exit 1; }

# 用本机 SSH key 探测 GitHub 认证
if ! ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=8 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  echo "[错误] SSH 连不上 GitHub：请确认 ~/.ssh/id_ed25519.pub 已添加到 GitHub → Settings → SSH keys"
  exit 1
fi
echo "==> SSH 认证通过"

if [ ! -d .git ]; then
  echo "==> 初始化本地仓库"
  git init -q
  git branch -M main 2>/dev/null || true
fi

touch .nojekyll

git add -A
if git diff --cached --quiet; then
  echo "==> 没有新改动，跳过提交"
else
  echo "==> 提交改动"
  git commit -q -m "chore: 更新生活助理 $(date +%Y-%m-%d\ %H:%M)"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$SSH_URL"
else
  git remote add origin "$SSH_URL"
fi

echo "==> 推送（SSH）"
git push -u origin main

echo ""
echo "完成。首次部署还需开一次 Pages（只需一次）："
echo "  仓库 Settings → Pages → Source: Deploy from a branch → main / (root) → Save"
echo "  然后访问：https://${USER_NAME,,}.github.io/$REPO_NAME/"
