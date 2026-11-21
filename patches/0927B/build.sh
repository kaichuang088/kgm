#!/bin/bash
# 0927B：從 0927A 重建 0927B（全部是逐字比對的替換，數量對不上就中止）
# 用法：patches/0927B/build.sh <KGM_Airways_0927A.html> <輸出.html>
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IN="$(realpath "$1")"; OUT="$(realpath -m "$2")"; TMP="$(mktemp)"
cd "$D"
node pf.js "$IN" "$TMP" p_staff.js p_res.js p_ukb.js p_ctr.js p_crew.js p_fleet.js
node pf.js "$TMP" "$OUT" p_ver.js
node p_ver2.js "$OUT"
node syn2.js "$OUT"
rm -f "$TMP"
