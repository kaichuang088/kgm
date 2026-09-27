#!/usr/bin/env bash
# 建立測試工作目錄：所有測試腳本都讀 /tmp/j/kgm.html
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p /tmp/j
cp "$HERE"/tests/*.js /tmp/j/
cp "$HERE"/baselines/*.out /tmp/j/
# 工作檔：預設用已驗證的 0927B；也可以傳入其他 HTML 路徑
SRC="${1:-$HERE/build/KGM_Airways_0927B.html}"
cp "$SRC" /tmp/j/kgm.html
cd /tmp/j
node -e "require.resolve('playwright')" >/dev/null 2>&1 || { [ -f package.json ] || npm init -y >/dev/null 2>&1; npm i playwright; }
npx playwright install chromium >/dev/null 2>&1 || echo 'playwright install chromium failed; run it manually'
node syn.js | tail -1
echo "layers: $(grep -c '<script id=' kgm.html)  (must be 241)"
