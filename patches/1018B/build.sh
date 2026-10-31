#!/bin/bash
# 1018B：從 1004B 重建 1018B（1018A 全部＋p_h_r18.js）（全部是逐字比對的替換，數量對不上就中止）
# 用法：patches/1018B/build.sh <KGM_Airways_1004B.html> <輸出.html>
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IN="$(realpath "$1")"; OUT="$(realpath -m "$2")"; TMP="$(mktemp)"
cd "$D"
node pf.js "$IN" "$TMP" $(cat list.txt)
node pf.js "$TMP" "$OUT" p_h_ver.js
node p_h_ver2.js "$OUT"
node syn2.js "$OUT"
rm -f "$TMP"
