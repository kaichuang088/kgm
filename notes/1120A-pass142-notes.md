# 1120A pass 142 — 技術筆記

建置：`cd patches/1101A && set -o pipefail; python3 gen_r28.py | tail -1 && bash build.sh <1004B.html> <out.html>`（新 RW 在 gen_r28 `# ══ 1120A ══`，程式標 R1120A）。
逐項與實測結果見 `notes/1120A-todo.md`。

## 新長程式（EMB28，r229 最後）
| 檔案 | 做什麼 |
|---|---|
| `pdflib120.js` | jsPDF＋html2canvas 原始碼（字串），要用才 eval（`kgmPdfLibR1120A`） |
| `rp120.js` | 航班資料 PDF：每頁圖像＋浮水印＋RC4 加密（只能列印、不能複製）＋座位超連結；餐點建議；組員頁 +／− 收合；組員查詢查不到的原因 |
| `chg120.js` | 多航段行程：已起飛航段不能改票（openTicketService 最外層） |
| `nf120.js` | 新增航線兩步驟（一律來回、選販售哪一趟、只列有空機身的機型、固定／EQV 多選至少一個）＋某一週改營運日（`S.weekOpsR1120A`，包 flyOn） |
| `mail120.js` | 模擬訂位不寄信：fetch 最底層擋送往寄信 Worker、內容只提到模擬訂位的請求（含 R24 會換回的 `__kgmWorkerTransportR24`） |
| `cs120.js` | 轉真人客服摘要卡；模擬客服對話每天產生；案件／寵物／團體／退票申請每天補（`S.simDayR1120A`） |
| `eq120.js` | 台北區域 EQV（<3,500 km、班號只有一條航線；排除 A35K 輪替 KX356/355 與自建航班）輪替池＝B789／B779／A359（`bal120`），`kgmEqvPlanR79` 最外層對這些航線讀 r198 池。整年排班完成後：① `kgmStrandHealR1120A`（保守：視窗尾端沒下一班才交給同型同站的飛機，交不出去就不動，否則加空機回台北 KX899x）② 120 秒後缺班就 `kgmCoverGapsR135(true)` 補一次（`KGM_COVER120`）③ 125 秒後 `kgmIdleSpreadR1120A`：任一架在任何機場閒置 ≥10 天，跟同型、在閒置第 5～9 天落地又起飛那站的飛機交換之後的航段 |
| `mh120.js` | 無限萬里遊首頁、購買哩程頁重新排版（milesPageView 最外層，功能全用原本的） |
| `ad120.js` | 後台外框：頁首寫目前分頁、側邊欄搜尋、側邊欄黏住 |

## 坑
- r57 航線頁直接呼叫閉包裡的 `newRouteHtml7()` → gen `r57 newroute via window R1120A` 改走 window。
- ap25 會把 3 碼輸入框換成機場選擇器（原欄位藏起來）→ 表單值要在 input/change 時寫回 S，否則背景重畫就不見。
- r28 會把畫面上 KX 班號附近的「EQV」字樣換成當天機型 → 標籤用 CSS `:after` 畫。
- `kgmKxPairR1108B` 吃數字（給字串回 -1）。
- `kgmBkPnrR1118A` 索引回的物件可能不是 `S.bookings` 那一份，要改訂位內容直接找 `S.bookings`。
- `.k6cs-sum div{display:flex}` 會套到摘要卡裡的 div。
- EQV 實際機型由 r79 `kgmEqvPlanR79`（短程固定權重 A339 為主）決定，r198 池子只影響 `_eqvTypeFor`。
- 整年機隊排班（`kgmRebuildFleetR72`）是同步的，約 18～21 秒；新增航線／單週營運日先畫「排班中」再開始。

## 坑（續）
- 全站 `.inp{border-radius:9px!important;background:#fff!important}` 會蓋掉 fr28 多航段的底線欄位 → fe118 用更具體的 `html.fe118-home .fe118-console .mc-search …` 蓋回。
- 後台 `#app` 是 `overflow-x:hidden` → 側欄 sticky 只黏在 #app 裡；ad120 在後台加 `html.ad120-on` 改 clip（同 1025B 航班資料頁）。頁首固定 → 側欄 top 讀頁首底部（`--ad120-top`）。
- 季節航線（KX162 冬季不飛）組員查詢要往後找到一年。

## 量測
- 機隊完整檢查 `/tmp/j/fleetchk120.js`（重疊／缺班／卡外站／各機型最長閒置）。
- 機隊（`/tmp/j/fl120.js`）：見 todo L6。
- 卡外站（`/tmp/j/idle120.js <html>`，開頁後等整年排班＋60 秒）：見 todo L4。
- 模擬資料每天增加（`/tmp/j/day120.js`，同一設定檔、時鐘往後撥 N 天）：見 todo K6。
