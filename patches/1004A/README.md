# 1004A patches

從 0928B 建出 1004A（全部是逐字比對的替換；數量對不上就中止）：

    bash patches/1004A/build.sh <KGM_Airways_0928B.html> <輸出.html>

- `gen_*.py` 產生 `p_f_*.js`（修改產生器後重跑對應的 `python3 gen_X.py`）。
- 產生器讀的幾個舊程式片段在 `deps/`；原本寫死在 `/tmp/j/`，重跑產生器前先複製到 `/tmp/j/`，
  `gen_misc.py` 也會讀 `/tmp/j/kgm0928B_final.html`（就是 build/KGM_Airways_0928B.html）。
- 版號替換：`p_f_ver.js`（0928B→1004A，166 處）＋ `p_f_ver2.js`（KGM_BUILD_* 12 處）。
- `worker_ai_admin.txt`：後台 AI 的 Cloudflare Worker 路由（純文字，直接貼進 Worker）。
- `pdf/`：時刻表 PDF 更新腳本（`python3 pdf/build_pdf.py`；來源 PDF 路徑寫在檔頭 SRC）。
