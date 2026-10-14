# KGM Airways — 專案規則（給 Claude Code）

KGM Airways 是一個虛構航空公司的訂位網站，**整個網站就是一個自包含的 HTML 檔**（約 8.4 MB）。
版號由使用者指定（目前是 1015A，下一版由使用者命名）。1006A 沒有單獨交付，併入 1007A；1011、1013 沒有。

## 使用者的固定要求（逐字，一律遵守）

- 「其餘沒有提及的「不要」調整喔！不要擅自移除或是更改其他的東西！」
- 「我不催你你慢慢來做好檢查三遍再給我 我不要看到沒有檢查敷衍的東西」；「我強調過質感很重要」
- 「不准像上次一樣欺騙我喔」「我所有講過的都要修正喔 不能遺漏任何點喔」
  → 只報告**真的在瀏覽器裡驗證過**的東西；沒做完的要老實列出來。
- 架構：do not create a new system, separate version, duplicate structure, or additional layers… edit the existing code directly… keep everything simple, direct, and within the current structure.
- Cloudflare Worker 程式碼要用**純文字**直接貼給使用者（可直接複製），不要做成 JSX 檔。
- 回覆風格：不要一開頭就附和；第一句要點出假設的漏洞或使用者沒注意到的事；
  結論標信心 [確定]/[可能]/[猜測]；不舒服的真相放第一行；不要暖場；沒有新資訊不要改口。
- 使用者用中文溝通，回覆用中文。

## 檔案結構的關鍵事實

- `<script id="...">` 共 **241 層**，每一輪都必須維持 241（不准新增層）。
- 後面的層會把前面的函式包起來（`window.X = function(){... prev.apply ...}`），**最外層的包裝才是實際生效的**。
- 反覆出現的 bug 型態（修之前先想是不是這幾種）：
  1. 兩個互相不一致的資料來源
  2. 只存在 DOM 的狀態，被 render() 重畫洗掉
  3. 層內區域變數綁定，後面的 `window.*` 包裝根本不會被呼叫到
  4. 包裝安裝順序錯
  5. 死碼（改了但根本沒在跑）
  6. SVG gradient 重複 id：`url(#id)` 會解析到第一個，即使它在 `display:none` 裡
- 新增的註解與變數用本輪版號標記（例如 `/* 0923C：… */`、`kgmXxxR923`）。
- 1007A 起：1004B 為重建基底，`patches/1010A/build.sh <1004B.html> <out.html>`（1010A＝1009B 全部＋`p_h_r13.js`；`p_h_r8.js`～`p_h_r13.js` 由 `gen_r8.py`～`gen_r13.py` 產生，**gen 要在 `patches/1010A/` 目錄下執行**，較長的程式在 `patches/1010A/js/*.js`） 依 `list.txt` 套用全部逐字替換（數量不符即中止）。
- 1012A：`bash patches/1012A/build.sh <1004B.html> <out.html>`（1012A＝1010A 全部＋`p_h_r14.js`；`p_h_r14.js` 由 `gen_r14.py` 產生，**要在 `patches/1012A/` 目錄下執行**，比對基準是 1010A 最終版 `/tmp/j/kgm1010A_w26.html`（重建 1010A 得到），較長的程式在 `patches/1012A/js/*.js`：`mgr12`、`ff12`、`var12`、`kx12`、`ls12`、`mo12`（前台首頁動畫）、`bz12`（登機組別）、`ctr12`（櫃檯）、`bp12`（登機證）、`cn12`（轉機列））。
- 1014A：`bash patches/1014A/build.sh <1004B.html> <out.html>`（1014A＝1012A 全部＋`p_h_r15.js`；`p_h_r15.js` 由 `gen_r15.py` 產生，**要在 `patches/1014A/` 目錄下執行**，比對基準是 1012A 最終版 `/tmp/j/kgm1012A_w40.html`（`patches/1012A/build.sh` 重建，跟交付檔逐位元相同），較長的程式在 `patches/1014A/js/rm14.js`（經濟艙營收管理售完）、`inv14.js`（票價庫存紀錄整理））。見 `notes/1014A-pass118-notes.md`。
- 1015A：`bash patches/1015A/build.sh <1004B.html> <out.html>`（1015A＝1014A 全部＋`p_h_r16.js`；`gen_r16.py` **在 `patches/1015A/` 下執行**，比對基準 1014A 最終版 `/tmp/j/kgm1014A_w8.html`）。見 `notes/1015A-pass119-notes.md`。
- 1015A 卡頓：量長任務用 `tests/lt15.js`（`ADMIN=1`、`TABS=1` 切分頁），改機隊排班的效能一定要用 `tests/fpfl.js` 比對輪轉指紋跟改之前**完全相同**。整年重排輸入指紋 `kgmSig72R1006A` 只看 `planSub10(S.acftSub)`（自動換機紀錄背景會改寫，放進去會讓分段準備白做、最後整年硬算 16 秒）。最後那一次整年組合時拆機收尾 `kgmFixSplitR929` 另一個工作做（`KGM_DEFER_SPLIT_R1015A`）。**背景／畫面程式不要同步呼叫 `kgmCrewPlanR121(date)` 算還沒算好的一天**（先問 `kgmCrewHasDayR121(date)`），一天要 1.5～6 秒。
- 1015A 儲存空間滿：`kgmLsFailR1012A` 先依序清可重算的資料（票價自動紀錄 → `kgm_crewsched` 快取（`KGM_LS_NOCS_R1015A` 這次開頁不再寫）→ 近期以外的模擬競標 → 全部模擬競標）並重寫同一份，寫進去就不提示；紀錄在 `KGM_LS_EVICT_R1015A`。量用 `tests/full15b.js`（開著時把儲存區塞滿）。
- 1014A 經濟艙營收管理售完：`sell54`（r54，各訂位代號剩幾位的唯一來源）最後一步問 `kgmRmEcoCloseR1014A(f,date)`：需求壓力（`kgmRmR929().pressure`）平常 ≥1.5／旺季 ≥1.3、起飛前 60 天內、每 3 天重新決定；A21N 只飛 A21N 的航線 60%／A21N 45%／其他 15%（旺季 +20%）；要有別的艙可賣；**A388 不做假售完**，只有旺季且壓力 ≥2.0 才售完。只關「賣」，實體座位（員工票、升等、酬賓、組員）不受影響。`kgmRmEcoClosedListR1014A(date)` 列出當天被關的班。
- 1014A 跨分頁同步（r229）：除了 `kgmrev` 版本號，也比對內容（`LASTS14`：本分頁最後寫入／讀入的內容）；`kgmrev` 格式 `時間|分頁|這次內容指紋|寫入時原本內容指紋`（舊格式兩段照舊）。收到事件先寫完自己排著的存檔（r32 `kgmSaveQueuedR1014A`、`_ls0818q`）。競標三份清單合併用 `id`。**版本號跟資料是兩個鍵、到達另一個分頁的時間可能不同，不能只看版本號**。量同步用 `race14.js`（兩分頁同時新增）＋`sync14.js`（新增／修改／刪除／同訂位兩筆／凍結班表／訂位）。
- 1014A 票價庫存自動紀錄（`S.fareThirds0810P`＋`S.seatInventory` 裡 fareThirds 有的鍵）：訂票頁每畫一次都會記（查一次一條航線約 670 筆），`kgmInvTrimR1014A` 兩份一起刪：已起飛的一律刪、超過 3,000 筆只留查詢日前後 4 天；人工設定（fareThirds 沒有的鍵）不動。
- 1012A 新增存檔（`PERSIST_1012A`）：`crewWorkR1012A`、`nameFixR1012A`、`mgrR1012A`（主管紀錄）、`kxSwapR1012A`（洛杉磯線班號調整的訂位搬移只做一次）、`crewFreezeR928`（已公布班表凍結，`kgm12_crewfrz`，精簡格式 `_packFZ1012A`）。
- 1012A 洛杉磯線（2026-11-29 起）：KX6/KX5＝A388 每天半夜班；KX4/KX3＝A359 每天、一三六早上／二四五日下午（同一班號兩列）。同一班號多列時，季節表只存第一列，**要用 `kgmKxSwapR1012A.rowSeason` 依星期挑列**（KX24／KX23 也是）；生效日前一律照舊班表。
- 1012A 儲存空間：寫入 localStorage 失敗會呼叫 `kgmLsFailR1012A`（畫面提示＋整理儲存空間）；`kgm_crewsched` 存成精簡格式（`_packCS1012A`／`_unpackCS1012A`）。Chromium 每個網站上限約 520 萬字元；第四輪實測開頁＋後台整站約 445 萬（w37）→ 210～230 萬（w40）：競標清單 kgmbd4／kgm_resbid6／kgm_resmile6 存成精簡格式（`_packAR1012A`），存檔／讀檔／跨分頁同步都走 `kgmLsPackR1012A`／`kgmLsUnpackR1012A`／`kgmLsStrR1012A`（內容沒變不重壓）。**新增精簡格式的鍵，三條路（LS.get、_ls0818flush、r229 sync pull／merge）都要走同一組函式**。
- 1012A 地勤櫃檯最少人力：1～2 班 5 人、3 班 7 人（再多一班 +2）、A388 +1（r194 `needCtr8`）；地勤桃園 444、松山 48 人；換班別那天若跟前一天班別接不滿 11 小時就排休（`kgmGroundRest11R1012A`）；排完再補一次（換手，`P.rescueR1012A`，白天／中／晚班可提早 60 分鐘）；桃園班別輪替 20 週（早 6／白天 5／中 4／晚 5），松山依名次輪替（`tsaRank12`）。**量要量 28 天以上、開兩次頁**（同一天的地勤排班每次開頁可能不同）。
- 1012A 第五航權單段升等：`b.legCabR1012A[seg][航段]`＝新艙等、`b.legSeatR1012A[seg][航段]`＝新座位（陣列，每位旅客一格）；艙單、庫存、登機證、72 小時遞補都讀 `kgmLegCabR1012A(b, segs7(b,true) 的段)`。
- 1012A 地勤主管小組：同站地勤依輪替相位排成一圈、主管平均分布、組員歸最近的主管（每組 10～13 人）。
- 1012A 第三輪：登機組別 `boardingZoneOf`／`kgmBpZoneTxtR1012A`（`js/bz12.js`：頭等 PRIORITY、商務與金卡／鑽石卡 ZONE 1、豪經與經濟豪華 ZONE 2、經濟艙依座位排數後→前 ZONE 3/4，B779／A388 分 3/4/5）；四種登機證都讀它。豪經每個方案 `FARES.zone`=2（優先登機），經濟只有豪華。員工票不論艙等列經濟艙最後一組。規章 RES-002／CKI-005／FFP-011 的登機組別條文在 `patches/1012A/pol/bz_pol12.py`（網站內嵌條文由 gen_r14 套、PDF 由 `pol/pol12.py` 重排，同一份修改）；銀卡沒有優先登機（使用者決定）。登機時間一律起飛前 30 分（使用者：「統一30分鐘」；行程卡 r217、登機證 bp12、r6／r7 舊頁、r26 行程列）。
- 1012A 第三輪：登機證只有一個版型 `kgmBpCardR1012A`（`js/bp12.js`，參考 EVA 式樣），五個入口都讀它；單段升等分段卡在 `kgmLegBpCardsR1012A`（ff12）。轉機航班列 `kgmConnRowR1012A`／`kgmConnTableR1012A`（`js/cn12.js`），跟直飛同一張表。
- 1012A 第三輪：報到櫃檯只有一份來源 `kgmCounterOfFlightR929`（後台分配）；`checkinCounterForFlight`（登機證）改讀它；當天沒飛取前後 14 天最近有飛的日子；外站聯營寫夥伴櫃檯號；經停整段列出發航廈跟第一段相同（`js/ctr12.js`）。**不准再出現「櫃檯依機場公告／依機場看板」**。
- 1012A 組員班表鏈會拿掉接不上任何東西的調位（`KGM_DH_STRAY_R1012A` 計數）：引擎的組員位置跟事後換人的班表不一致時會冒出來。
- 1010A 新增存檔（`PERSIST_1010A`）：`dhPnrR1010A`、`groundBandOvR1010A`、`casesR84`、`refundReqR113`、`refundSimR1010A`、`sbSimR929`、`redeemPromosR1010A`（里程兌換優惠）、`staffLinkR1010A`（員工↔會員綁定）。
- 1010A 機隊：排班時算機型用 `planSub10`（只看人工換機／維修改派）＋`KGM_PLAN_R1010A`，否則自動換機紀錄會被當成時刻表、換機永遠換不回來；量換機要讀 `kgmChangesR78().changes`（不是 `rows`）。
- 已知舊問題：`t_sched922` 到不了 60／60（1010A 今天也一樣）：組員引擎 60 天要 1～2 分鐘 CPU，又要等機隊整年最後重排（開頁約 65 秒）之後才能算，測試只等到開頁約 90 秒（見 `notes/1012A-pass117-notes.md` 第二輪 D）。看的是 maxLatency（畫面卡多久）。
- 前台／後台同步只認 `save()` 裡 `LS.set("鍵",S.欄位)` 這種寫法（r229 自動掃出對照表）。**新增要跨分頁或重新整理後還在的資料，一定要加進 `save()` 與 S 初始值**；
  1007A 實測發現一大批資料從來沒存檔（見 `notes/1007A-pass110-notes.md` 第二節）。
- 1009A 起機師另有「當班位置」：`kgmCrewPlanR121(date).flights[].pilots[].posCode`（PIC 機長／TRI 教官／SIC 副機長／CRZ 巡航），DH 艙等看位置；調位紀錄帶 `posR1009A`。1009B 起客艙也看當班位置（PU／DPU／FA，r196 `kgmCabinPositionsR1006A`）。
- 1009B 起正式組員的職級固定存在 `S.crewRankR1009B`（`kgm7_crewrank`）；職級晉升存在 `S.crewLevelR1009B`（`kgm7_crewlvl`，核准後第 30 天生效，排班引擎逐日套用 `lvApply1009B`）。
- 1012A 第二輪修好「每次開頁機隊輪轉換一套」：根因是 KX59 冬季時刻相對位移、存檔後每次開頁再移一次；現在寫定值。**季節時刻的修正一律寫定值，不要在存檔的值上再加減**。量輪轉穩定用同一個瀏覽器連續重新整理（`tests/rotreload.js`），不是只開新瀏覽器。
- 組員職級有兩套：排班引擎 `kgmCrewPoolR121()`（正機師 CP／FO／CR、座艙長 PU／DPU／FA，班表顯示這份）與員工檔 `S.staff.rank`（CAPT／CP／SC…）。判斷職位用前者。

## 測試環境

- 所有測試腳本寫死讀取 `/tmp/j/kgm.html`。工作方式：把要改的 HTML 放在 `/tmp/j/kgm.html`，腳本放在 `/tmp/j/`。
- 需要 Node 18+ 與 Playwright（Chromium）：`npm i playwright && npx playwright install chromium`
- `reg2.js` 約 9 分鐘；`vfy*.js` 每支 1–3 分鐘（頁面載入後要等背景排班跑完）。

## 每一輪交付前的關卡（全部要過）

1. `node syn.js` → `scripts checked 248 errors 0`
2. `grep -c '<script id=' kgm.html` → `241`
3. 版號更新（見下），並把 `vfy1.js` 的 `/1015A/.test(t)` 改成新版號
4. `node vfy1.js`（24 項）、`vfy2`（8；N1／F2／O1 找夏季班 KX160，測試從「今天＋18 天」起找，所以大約每年 10 月初～隔年 1 月下旬跑會找不到而失敗，改跑 `tests/vfy2d.js`（日期挪到 2027 年 4 月））、`vfy3`（8；1012A 起 S1 只挑今天真的有飛的班）、`vfy4`（8）、`vfy5`（6；AC1 在 UTC 00:00–約 04:00 跑會因 KX180 當天已起飛而失敗，改跑 `tests/vfy5d.js`）、`vfy6`（55）全部 PASS
5. `nohup timeout 560 node reg2.js > reg_X.out &` → 跟 `baselines/reg_1014A.out` 比 notOk 集合：**不能多出新的**；view errors 0、PAGE ERRORS 0
   （notOk 裡大部分只是回傳診斷物件、不是失敗；kgmAuditR210／R211 1012A 第三輪起改查「一天一班」（使用者同意）；真的 ok:false 的是 R6、R151 與 0903B/0904A/0905A–0909A 的效能門檻）
6. `node t_crewrule.js` → twoLegDays 0、longHaulNextDayFly 0、plannerViolations 0
7. `node t_sched922.js`（組員班表延遲）、`node t_admlag.js`（後台 27 個分頁逐頁量）
8. 不要同時平行跑多支測試（CPU 搶資源會讓效能門檻誤判）
9. `tests/tz8.js`（台北時區無機可派）、`tests/ai9t.js`（後台 AI 直連）要帶檔案路徑：`W=110000 node tz8.js /tmp/j/kgm.html`；`t_admlag.js` 反而**不能**帶（第一個參數是分頁篩選）
10. 量機隊輪轉要等背景重建跑完（至少 110 秒，`W=110000 node t_fl1.js`）；太早量會抓到重建到一半的狀態、誤報重疊
    （1014A 起 vfy6、t_crewrule 開頁後先等 `KGM_FULLDONE_1006A`（整年機隊重排做完，最多 150 秒）再加 5 秒才量；原本 45／60 秒常落在重排中途而誤報。t_sched922 的 10 秒以上尖峰是整年機隊重排本身一次卡主執行緒約 11 秒（1012A 以前就有，未修），見 notes 1014A D）

## 版號更新位置（重建時由 1004B 換成新版號，用 regex 精準替換，不要全域取代）

`||'1004B')` ×29、`var BUILD='1004B'` ×118、`var V='1004B';` ×4、`KGM_BUILD_*='1004B'` ×12、
`'data-kgm-build','1004B')` ×1、`· 1004B</title>` ×1、`· 1004B'`（document.title）×1，合計 166 處（`patches/1015A/p_h_ver.js`、`p_h_ver2.js` 是現成的替換腳本，`build.sh` 最後一步自動套用；下一版改這兩個檔的目標版號即可）。
1004B 起交付是兩個檔：`node patches/1004B/split.js <合併檔> <前台> <後台>`（1007A 另外交兩個 ZIP：說明＋時刻表＋Worker，以及 KGM_Policies 規章彙編）（只差開頭一行 `window.KGM_SIDE`）；測試一律跑合併檔。
其他出現的舊版號都是歷史註解，**不要動**。
