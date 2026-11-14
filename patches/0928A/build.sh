#!/bin/bash
# 0928A：從 0927C 重建 0928A（全部是逐字比對的替換，數量對不上就中止）
# 用法：patches/0928A/build.sh <KGM_Airways_0927C.html> <輸出.html>
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IN="$(realpath "$1")"; OUT="$(realpath -m "$2")"; TMP="$(mktemp)"
cd "$D"
node pf.js "$IN" "$TMP" p_d_fleet.js p_d_crew.js p_d_miles.js p_d_upg.js p_d_res.js p_d_resmi.js p_d_admin.js p_d_ap.js p_d_cs.js p_d_rot.js p_d_fe.js p_d_q.js p_d_dps.js p_d_pair.js p_d_eqv.js p_d_fleetadm.js p_d_audit.js
node pf.js "$TMP" "$OUT" p_d_ver.js
node p_d_ver2.js "$OUT"
node syn2.js "$OUT"
rm -f "$TMP"
