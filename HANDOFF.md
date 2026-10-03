# KGM Airways：交接給 Claude Code（版本 1004A）

## 包裡有什麼

| 路徑 | 內容 |
|---|---|
| `CLAUDE.md` | 固定規則、測試關卡、版號更新位置。Claude Code 開啟資料夾時會自動讀 |
| `build/KGM_Airways_1004A.html` | 目前版本（關卡結果見 `notes/1004A-pass108-notes.md`） |
| `build/KGM_Airways_0928B.html` | 上一版（1004A 的重建基底） |
| `patches/1004A/` | 0928B→1004A 的逐字替換腳本；`patches/1004A/build.sh <0928B.html> <out.html>` 重建（`gen_*.py` 產生 `p_f_*.js`；說明見該資料夾 README） |
| `patches/1004A/worker_ai_admin.txt` | 後台通用 AI 的 Cloudflare Worker 路由（純文字） |
| `patches/1004A/pdf/` | 時刻表 PDF 更新腳本 |
| `patches/0928B/` 以前 | 前幾版（留著查歷史） |
| `tests/` | syn、reg2、vfy1–vfy6 與各項實測腳本（vfy1 版號已改成 1004A） |
| `baselines/reg_1004A.out` | 1004A 的全站稽核基準（下一版要拿來比對） |
| `notes/` | 各版修改紀錄 |
| `setup.sh` | 建立 `/tmp/j` 工作目錄、放入 1004A、安裝 Playwright（雲端環境已內建 Chromium 1194 時，先 `npm i playwright@1.56.1` 再跑，版本才對得上） |

## 1004A 的狀態

詳見 `notes/1004A-pass108-notes.md`。這一版 = 0929A 清單 37 項＋1004A 追加三項：
- 使用者截圖 B-58087 逐月排班地點亂跳：新增／退役飛機後把新舊輪轉拼在一起造成；改為整年重排。月曆星期位移也修了。
- KX3168／KX3167 → KX200／KX199（當天來回），網站與 PDF 都改了。
- 關卡中找到 0929A 自己造成的組員班表無限迴圈（`kgmCrewLegsR929` 空日期 → `"NaN-NaN-NaN"`），已修。

## 已知、還沒處理的事

- 同一工作階段內重複重排，結果和重新載入後不一定一樣（既有的狀態相依）。
- 組員班表重建比 0928B 慢約 20–40%（客艙編制加大的代價）；t_sched922 最大延遲 2,451 ms（同機 0928B 1,798 ms）。
- vfy6 H23 失敗：10/05 起長短程分櫃後，第一航廈時段 2 長程只有兩架 A388＋一架 B78X，「A388 不能同櫃」使一架 A388 落單。0928B 同一天一樣失敗，要使用者決定哪條規則讓步。
- 後台競標管理在 1500 寬度時右欄（BigDeal）被切掉（0928B 就有）。
- 從聯營 PNR 開行程頁空白：測試版出現過一次，之後無法重現，原因不明。
- 商務艙酬賓里程等於頭等艙；酬賓里程由現金票價推算偏高（沒動）。
- 時刻表 PDF 與網站既有的不一致（KX24/23 SEA、KX191/192 KOJ/OKJ、KX386 TSA–SHA、KX51/52、KX85 冬季）。
- 0928B 留下的：聯營虛構班號（AA95xx／AA97xx、AS95xx、QF96xx）、時區 SYD +11／MEL +10、空機調機段數、A339L 缺機、KX310／KX309 A388 優先與否、側邊選單兩個「模擬資料」按鈕、改票視窗手續費標籤重複。

## 怎麼開始

1. 解壓縮 `KGM_handoff.zip`。
2. 在 `KGM_handoff` 資料夾開啟 Claude Code。
3. 貼上下面這段當作第一則訊息。

```
這是 KGM Airways 的專案交接，目前版本 1004A。
請先讀 CLAUDE.md、HANDOFF.md 和 notes/1004A-pass108-notes.md，然後執行 ./setup.sh，
確認 node syn.js 是 248/0、層數是 241，再跑一次 vfy1.js 確認版號是 1004A。
都通過之後回報給我，等我給下一版的修改清單，先不要動任何程式碼。
```
