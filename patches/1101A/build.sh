#!/bin/bash
# 1101A：從 1004B 重建 1101A（1027A＝1026C 全部＋p_h_r28.js）（全部是逐字比對的替換，數量對不上就中止）
# 用法：patches/1101A/build.sh <KGM_Airways_1004B.html> <輸出.html>
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IN="$(realpath "$1")"; OUT="$(realpath -m "$2")"; TMP="$(mktemp)"; TMP2="$(mktemp)"
cd "$D/../1026C"
node pf.js "$IN" "$TMP" $(cat list.txt)
cd "$D"
node pf.js "$TMP" "$TMP2" p_h_r28.js
node pf.js "$TMP2" "$OUT" p_h_ver.js
node p_h_ver2.js "$OUT"
node syn2.js "$OUT"
rm -f "$TMP" "$TMP2"
