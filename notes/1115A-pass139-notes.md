# 1115A 技術筆記（pass139）

建置：同一套 `patches/1101A`（`cd patches/1101A && set -o pipefail; python3 gen_r28.py | tail -1 && bash build.sh <1004B.html> <out.html>`），版號 1115A（`p_h_ver*.js`）。
gen 新 RW 都在 `# ══ 1115A ══`（`# ══ 新長程式嵌入 ══` 之前）；新長程式 `js/ai42.js`（D1／D8）、`js/cs42.js`（D9）接在 EMB28 最後。逐項與實測見 `notes/1115A-todo.md`。

## D1 後台 AI：工具迴圈（ai42 `kgmAiLoopR1115A`）
- 原本（1008B）直連／Worker 都是「送一次」：Claude 回 tool_use 就結束，網站執行工具，但結果從來沒交回 Claude → 不能「先查再決定」，一個需求要問好幾句。
- 改：`remote()` 最前面先走 `loop15`（gen `ai loop remote R1115A`）：工具清單＝TOOLS（權限照舊在 `exec` 檢查）＋`web_search_20260209`（max_uses 4）；每輪把 assistant content 原樣送回（thinking／fallback 區塊不動），tool_use 逐一 `exec`（非同步工具如 flight_cancel 會 await），結果以 tool_result 交回；`pause_turn` 原樣再送；最多 8 輪、總時間 5 分鐘。查詢類（data_query 等 view 工具）的結果只給 Claude 看，改資料的工具才在回覆下面列 ✓／✕。
- 連線：有金鑰直連 api.anthropic.com；沒金鑰走 Worker `/ai/messages`（新路由，`patches/1101A/worker_ai_1115A.txt`，純文字）；Worker 沒有這條（404／連不到）→ `KGM_AI_LOOP_R1115A.noWorker=1`，退回原本 `/ai/admin` 一次性路線。
- 接上 Claude 時（`kgmAiOnR1115A()`：有金鑰，或這次開頁 Worker 迴圈成功過），k23 不再用站內 `q()` 搶答問句（gen `k23 q live ai R1115A`），交給 Claude（它自己會呼叫 data_query）。臨時航班、取消、延誤的多步流程照舊站內處理（跟 Claude 呼叫同一個工具結果相同）。
- 站內規則（沒接 Claude）：k25 `isTemp` 認得「加一班／多開一班／多飛一班／再開一班」（有員工編號的不算）；一句話用「/」「；」分段，第二段是第一段反方向 → 同一張來回、回程排在第二段的日期（`kgmTempSegsR1115A`、`kgmTempRetDepR1115A`；`plan()` 的 `end` 改用實際回程時間）。不是反方向 → 先排第一段，提示第二段之後再說。
- **沒有用真的 Claude 驗證過**：這個環境沒有 API 金鑰、Worker 主機被網路政策擋。測試（`tests/ai42.js`）用 Playwright 攔截 fetch 模擬 Messages API 多輪回應，驗證的是網站端的迴圈、工具執行、結果回傳格式與退回路線。

## D8 突發事件（ai42 `kgmDisrPlanR1115A`／`kgmDisrApplyR1115A`／`kgmDisrScanR1115A`）
- 影響範圍：自營航班（非夥伴、非經停整段列），起飛（dep）／降落（arr）機場在指定機場或國家（ai42 `CT` 國家表＋`kgmCountryR929`），排定（或人工改過的）起飛／抵達 UTC 落在時段內、還沒起飛、沒取消。時間：`kgmSeasonFlightR48`＋`kgmTzAtR1026C`（含夏令）。
- 決定：恢復時間（時段結束）距排定時間 +30 分 ≤12 小時 → 延後 12 小時（新抵達落在 00:30–05:59 或新起飛 03:00–05:59 且非曼谷航線 → 改 24 小時）；≤24 小時 → 延後 24 小時；更久 → 取消，`processCancelledFlight0815` 改搭恢復後 4 天內同航線第一班（沒有就退費）。延後走原本 `kgmAiDelayR1023A`（航班動態、旅客／組員通知、同一架下一班過站不足連鎖延誤 `cascade`，最多 6 段）。
- 紀錄 `S.disrR1115A`（`kgm40_disr`，S 初始值＋save() 加在 1101A RW `trip30 S init／save`）：events（處置結果每班一列）、auto、autoApply、every、lastScan。航班動態覆寫帶 `disrR1115A`＝事件編號；同一事件（範圍＋時段相同）不重複處置。
- 自動監測：後台開著、自動監測開、接得上 Claude（有金鑰或 Worker 沒被判定舊版）時每 1／3／6 小時（預設 3）跑一次：web_search（max_uses 6）＋strict client tool `report_disruptions`（tool_choice 不強制；Opus 5.5 強制會 400）。高可信度且有結束時間 → 自動處置並在後台 AI 對話寫一則；其他 → 「待確認」（可一鍵照規則處置或不處理）。
- 介面：航班營運「關閉空域・Payload」頁最上面（gen `zn27 disr panel R1115A`）。
- 站內解析（沒接 Claude）：`kgmDisrLocalR1115A` 認 FAA／禁飛／停飛令／ground stop／機場或空域關閉；國家中文名、機場三碼；「11/18 14:00-23:00 UTC」；先預覽，回「確認」才處置（`S.disrPendR1115A`）。k23 取消流程遇到這些字不搶（gen `k23 cancel not disr R1115A`）。
- **我不知道使用者說的「前幾天 FAA 禁止美國航班起飛」實際細節**，沒有把它寫成資料；測試用的是自己輸入的時段。

## customFlights 重新整理就消失（1004B 起）
- S 初始值物件裡 `customFlights` 寫了兩次：`LS.get("kgmcf4",[])` 之後又有 `customFlights:[],// admin-added flights`，後面那個蓋掉存檔 → 後台 AI 建的臨時航班、包機核准建的航班、空機調派等，重新整理後全部不見（飛機排班 `S.tailAssign` 卻還留著那幾段）。gen `S customFlights dup R1115A` 拿掉後面那個。實測（`tests/cf42r.js`）新瀏覽器 customFlights 0 筆；建 2 筆後重新整理 3 次都是 2 筆、不重複、排班 2 段、搜尋得到。

## D9 地勤／空服員為旅客成立案件（cs42）
- 航班資料頁上方「＋ 為這班旅客建立案件」（地勤、空服員只看得到自己的班；CEO／客服看得到全部）。表單就是 1007A 案件處理中心那一張（gen `c7 form export R1115A` 匯出 `newForm7`），上面加「這班旅客」名單（`manifest7`，`KGM_NODH_R1023A=1`），姓名／座位／PNR 搜尋。
- 真的訂位 → 照原本 `kgmCase7Create`（通知、Email 由全站「只寄真實訂位」那層把關）；模擬旅客 → 用一份只有這位旅客、這一段的資料建案件（`kgmCase7SimBkR1115A`），`simR1103A=1`、不通知不寄信（gen `c7 form sim／create sim／create mark／notify sim`）。
- 申請者：`by.role` 照帳號（ground／cabin），處理進度第一筆「案件成立（機場地勤／客艙組員）」（gen `c7 unit zh／en`），空服員可以建（gen `c7 canopen cabin`）。新類型 seat_dup／onboard_service／medical；bag_delayed 標成「行李延誤／未送達」（CT7、cs28 PCL／LB）。
- 「可註解」權限的頁面（空服員、地勤的航班資料是 annot）會攔「最後一顆確認鍵」送審 → 建案件不是改航班資料，入口與表單排除（gen `r197 case skip R1115A`）。
- 背景重畫會把入口按鈕整個換掉，點下去的瞬間按鈕被換掉就沒反應 → 內容沒變不重畫（`data-h`）。

## D5 後台卡頓
- 量法：`/tmp/j/prof42.js`（CDP CPU profile，後台開著 60 秒，依函式彙總）＋`tests/lag41.js`（點擊延遲）。
- 1115A 自己造成的：D7 許願分數 `kgmCrewWishScoreR1115A` 在組員引擎排序比較函式裡、每次比較都呼叫，而且快取沒命中時 `Object.keys(SC).length` → 平方成長，60 秒吃掉 5.7 秒主執行緒。改：每位候選算一次放進 `_sk921`（gen `r121 wish key R1115A`、`r121 wish sort R1115A` 改讀 `ka.w`）；快取計數改用計數器；許願航點排序的雜湊每個航點只算一次。改完 1115A 新增程式合計約 0.5 秒／60 秒。
- 剩下的長任務（開頁後 5～75 秒每 1～2 秒一次 0.5～2 秒）是 1112B 以前就有的機隊／組員排班，兩版分布相同，這輪沒有再降。
