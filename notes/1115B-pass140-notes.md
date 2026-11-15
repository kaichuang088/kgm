# 1115B 技術筆記（pass140）

建置：同一套 `patches/1101A`（`cd patches/1101A && set -o pipefail; python3 gen_r28.py | tail -1 && bash build.sh <1004B.html> <out.html>`），版號 1115B（`p_h_ver*.js`）。
gen 新 RW 都在 `# ══ 1115B ══`（`# ══ 新長程式嵌入 ══` 之前）；長程式改在既有的 `js/cx38.js`（A35K 輪替旗標、許願截止）、`js/cs42.js`（側欄入口、許願提醒）、`js/ai42.js`（免費 AI 顯示）。逐項見 `notes/1115B-todo.md`。

## E1 後台卡頓 —— 量法
- 真實情境：`/tmp/j/ux43.js`（後台檔、真的滑鼠點側欄、停 2～8 秒、偶爾捲動；第一次開頁跑 W1 秒 → 重新整理 → 量 DUR 秒；Event Timing 量每次點擊從按下到畫面更新＋CDP profile 依根函式彙總）。
- 開頁頭 60 秒每個長任務是誰：`/tmp/j/boot43.js`；只量重畫：`/tmp/j/rprof43b.js`（每個分頁分開 profile）。
- **只用程式換分頁（`S.adminTab=…;render()`）量不準**：不會觸發 `KGM_LAST_INPUT_R1025B`（pointerdown／keydown／wheel／touchstart／input），背景計算的「使用者在操作就讓開」閘門不會作用。

## E1 根因 ①：整年機隊排班每次開頁都不一樣 → 組員班表存檔永遠讀不回來
- 舊補班 `_subPass`（第一層，0803）寫 `S.acftSub` 沒有 `auto` 旗標（`{…,tail,at}`），`planSub10` 把它當「人工換機」餵進整年重排；紀錄是依開頁當下的排班產生、帶時間戳記 → 每次開頁輸入不同 → 整年排班不同（兩個全新瀏覽器 79／196 架不同）→ 組員引擎指紋 `sig25` 的 TAH 每次不同 → IndexedDB 存檔（`kgm25_crew`）`why:'sig'` → 每次開頁重算 60 天組員班表（背景 2 分多鐘，每段 1.5～2.4 秒）。
- 修：gen `planSub10 no subPass R1115B`：沒有 manual／maint／mx、有 `tail`＋字串 `at` 的紀錄不算人工換機（紀錄本身保留，畫面與通知不變）。實測兩個全新瀏覽器 0／196 架不同、閒置 0；整年重排收尾 `finalMs` 2.2～2.9 秒 → 0.5 秒（分段準備的結果終於能沿用，`kept:true`）。
- cx38 A35K 短程輪替原本 20 秒計時器才跑（機隊「完成」後 0～20 秒又改 2 架）→ 組員引擎在這之間開始算、機隊一變整份作廢。改：`KGM_FULLDONE_1006A` 一變 500 毫秒內跑一次並設 `KGM_A35_FD_R1115B`；組員引擎 `kgmCrewStepR121`、人力需求 `demand121.full` 等它（最多 60 秒）。
- 診斷：組員讀檔失敗時 `KGM_CREW_RESTORE_R1025B` 多記 `sigR1115B`／`savedR1115B`／`rcur`。

## E1 根因 ②：每次重畫都重做的事（`rprof43b.js`）
- `adminView` 每次 `reconcileAcftSubs(today,14)`（掃全機隊十幾萬段，每頁 10～57 ms）→ 段數、機身數、換機紀錄數、航班數、今天都沒變就 30 秒內不重掃（gen `adminView reconcile memo R1115B`）。
- 每次重畫後 `querySelectorAll('*')` 找「Email / Cloudflare」→ XPath 只找葉節點（gen `email scan xpath R1115B`）。
- 松山地勤名單 `kgmTsaTeamR1006A` 每問一位就過濾全部員工 → 同一批員工 5 秒內用上次的（gen `tsa team memo *`）。
- 競標頁每次重畫補未來 10 天的競標 → 同查詢、上次沒新增、沒有排隊的 60 秒內不再補（gen `auc ensure memo R1115B`）。

## E2 免費 AI（不買 API）
- `patches/1101A/worker_ai_1115B.txt`（純文字）：同一個 `/ai/messages` 路由；Worker 有 `ANTHROPIC_API_KEY` 照舊走 Claude，沒有金鑰但有 Workers AI 綁定（名稱 `AI`）就走免費 Workers AI（預設 `@cf/google/gemma-4-26b-a4b-it`，`KGM_FREE_MODEL` 可換）。請求從 Claude 格式翻成 Workers AI（OpenAI 式 tools；歷史裡的 tool_use／tool_result 攤平成文字），回應（`choices[].message.tool_calls` 或 `response`＋`tool_calls`）翻回 Claude 格式 → 網站工具迴圈不用改。
- 免費額度（Cloudflare 文件 pricing.mdx）：每天 10,000 Neurons，免費方案超過當天失敗、不扣錢，00:00 UTC 重置；gemma-4 每 M 輸入 9,091／輸出 27,273 Neurons → 一次約 1 萬 token 的後台 AI 呼叫約 100 Neurons。
- 「根據時事」：免費模型不能上網，Worker 抓 FAA NAS 狀態＋Google 新聞 RSS 標題附在提示裡。**這兩個來源在這個環境連不到（403），格式沒有實測**；Worker 翻譯邏輯用 Node 模擬 `env.AI.run`／fetch 測過（`/tmp/j/wk/t.mjs`：兩種回應格式、純文字、額度用完 429、沒綁定、有金鑰走 Claude）。

## E3 許願截止
- cx38：`kgmCrewWishDeadlineR1115B(mo)`＝前一個月 15 日 23:59:59（台北）；`kgmCrewWishOpenR1115B()`＝開放的月份（下個月截止了就換下下個月）；截止後誰都不能送；送出記 `S.crewWishR1115A[id]['@'+mo]`，截止後才送的不算；沒送＝員工編號＋月份雜湊的隨機 5 個（每次開頁一樣）。
- 側欄（cs42 `wishBox`）：空服員、機師看得到「許願航點 · 月份、截止時間、剩多久、送了沒」＋「去許願」（到組員班表、選自己、捲到面板）。

## E4 案件入口
- cs42：地勤、空服員側欄最上面「＋ 提出案件」→ 航班資料（自己的班、最近一班）直接打開「為這班旅客建立案件」；地勤班表是背景算的，最多等 20 秒找到才開，找不到才說 7 天沒有航班。視窗裡寫怎麼換班、旅客不在你的航班上去哪裡建。
