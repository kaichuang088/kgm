#!/bin/bash
# 0928B：從 0928A 重建 0928B（全部是逐字比對的替換，數量對不上就中止）
# 用法：patches/0928B/build.sh <KGM_Airways_0928A.html> <輸出.html>
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IN="$(realpath "$1")"; OUT="$(realpath -m "$2")"; TMP="$(mktemp)"
cd "$D"
node pf.js "$IN" "$TMP" $(cat list.txt)
node pf.js "$TMP" "$OUT" p_e_ver.js
node p_e_ver2.js "$OUT"
node syn2.js "$OUT"
rm -f "$TMP"
