#!/bin/bash
# 0927C：從 0927B 重建 0927C（全部是逐字比對的替換，數量對不上就中止）
# 用法：patches/0927C/build.sh <KGM_Airways_0927B.html> <輸出.html>
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IN="$(realpath "$1")"; OUT="$(realpath -m "$2")"; TMP="$(mktemp)"
cd "$D"
node pf.js "$IN" "$TMP" p_c_fleet.js p_c_pay.js p_c_motion.js
node pf.js "$TMP" "$OUT" p_c_ver.js
node p_c_ver2.js "$OUT"
node syn2.js "$OUT"
rm -f "$TMP"
