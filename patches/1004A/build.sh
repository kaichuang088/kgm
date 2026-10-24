#!/bin/bash
# 1004A：從 0928B 重建 1004A（全部是逐字比對的替換，數量對不上就中止）
# 用法：patches/1004A/build.sh <KGM_Airways_0928B.html> <輸出.html>
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IN="$(realpath "$1")"; OUT="$(realpath -m "$2")"; TMP="$(mktemp)"
cd "$D"
node pf.js "$IN" "$TMP" $(cat list.txt)
node pf.js "$TMP" "$OUT" p_f_ver.js
node p_f_ver2.js "$OUT"
node syn2.js "$OUT"
rm -f "$TMP"
