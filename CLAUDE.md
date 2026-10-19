# KGM Airways — 專案規則（給 Claude Code）

KGM Airways 是一個虛構航空公司的訂位網站，**整個網站就是一個自包含的 HTML 檔**（約 8.4 MB）。
版號由使用者指定（目前是 1020B，下一版由使用者命名）。1006A 沒有單獨交付，併入 1007A；1011、1013、1016、1017 沒有。

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
- 1018A：`bash patches/1018A/build.sh <1004B.html> <out.html>`（1018A＝1015A 全部＋`p_h_r17.js`；`gen_r17.py` **在 `patches/1018A/` 下執行**，比對基準 1015A 最終版 `/tmp/j/kgm1015A_w6.html`）。見 `notes/1018A-pass120-notes.md`。
- 1018B：`bash patches/1018B/build.sh <1004B.html> <out.html>`（1018B＝1018A 全部＋`p_h_r18.js`；`gen_r18.py` **在 `patches/1018B/` 下執行**，比對基準 1018A 最終版 `/tmp/j/kgm1018A_w26.html`）。見 `notes/1018B-pass121-notes.md`。
- 1019A：`bash patches/1019A/build.sh <1004B.html> <out.html>`（1019A＝1018B 全部＋`p_h_r19.js`；`gen_r19.py` **在 `patches/1019A/` 下執行**，比對基準 1018B 最終版 `/tmp/j/kgm1018B_w13.html`）。見 `notes/1019A-pass122-notes.md`。時刻表 PDF：`patches/1019A/timetable/tt19.py`。
- 1020B：`bash patches/1020B/build.sh <1004B.html> <out.html>`（1020B＝1020A 全部＋`p_h_r21.js`；`gen_r21.py` **在 `patches/1020B/` 下執行**，比對基準 1020A 最終版 `/tmp/j/kgm1020A_w5.html`；長程式 `js/fl20b.js`（航班／冬夏機型／卡達）、`js/mb20b.js`（手機，取代 mb20）、`js/fb20b.js`（航班動態，取代 fb19））。見 `notes/1020B-pass124-notes.md`。時刻表 PDF：`patches/1020B/timetable/tt20b.py <1019A PDF> <out> <dumptt20.json>`（`tests/dumptt20.js` 匯出），聯營頁整頁依網站資料重排；最後 `subset_fonts()`（不做會多 6 MB；做完逐頁像素相同）。
- 1020B 機型：使用者逐條指定的寫在 MAP18（gen_r21 `map18 *`）；**冬夏不同機型**（KX304/303 夏 EQV＝A359/B779 輪流、冬 A388；KX306/305 夏 B779、冬 A21N）寫在 `fl20b.js` `SEAS20`。r71 `wrap71` 會把經停長程班的字面 `EQV` 換成 B789 → `fl20b` `acWrap`（最外層 acftOfFlight）對 KX304/303 夏季改回航線池（同一天去回同型）。三台 A21N 寫進 `S.fleetAddedR928`（`builtinR1020B`）。
- 1020B 多哈線：KX2/KX1（B779 一三五日）、**KX100/KX99**（A359，使用者選的班號）；r77 定值冬夏；`effFrom` 2026-12-01（`fl20b` `effNew`）。**0809C 開頁計時器會把 KX100/KX99 改名成 KX74/KX73（巴黎線舊班號）→ 只排除多哈線，曼谷—巴黎那段還要改名**。卡達聯營 KX9520–9535＋反向 QR 代碼（`MKT19` 在 fb20b）。
- 1020B 航班動態依航線／依航班號＝`fb20b.js` `view20()`（舊 statusView 不再呼叫）：以起點出發日為準，經停第二段寫自己的日期（用**當季**時刻算日期差）；沒飛寫營運日＋最近有飛的日期。**r38 會掃航班動態頁的機型文字往上找班號改寫 → 新卡片 `.fs20` 要排除（gen_r21 `r38 skip fs20`），不然每張卡都變第一班的機型**。
- 1020B 手機：表頭右上角「登入」（`.kt20b-login`，登入後頭像→會員資料）；文字欄位輸入中／鍵盤擠小可視區時 `html.kgm-kb-r1020b` 收起下排五鈕與黏住的按鈕列；iOS viewport 加 `maximum-scale=1`。量用 `tests/mb20bt.js`。
- 已知未修：網站時區表固定值（雪梨 +11、墨爾本／布里斯本 +10…）→ 澳航國內聯營有幾班飛行時間 25～45 分；全站共用、動到 KGM 自己的澳紐航班，等使用者決定。
- 1020A：`bash patches/1020A/build.sh <1004B.html> <out.html>`（1020A＝1019A 全部＋`p_h_r20.js`；`gen_r20.py` **在 `patches/1020A/` 下執行**，比對基準 1019A 最終版 `/tmp/j/kgm1019A_w27.html`；只有 3 個替換：lz19→`js/lz20.js`、拿掉儲存失敗自動提示、mb19→`js/mb20.js`）。見 `notes/1020A-pass123-notes.md`。
- 1020A 手機側邊選單（`js/mb20.js`）：☰ 在表頭**左上角**、`#kgmDrawerR1020A` 從**左邊**滑出（使用者指定）；內容每次從表頭 `.mega` 讀，點項目＝對原本那個 li `.click()`（`kgmDrawerGoR1020A`），不另寫一套。手機 `#app`／`body`／`html` 改 `overflow-x:clip`（原本 hidden 會讓 `position:sticky` 全部失效）；結帳按鈕列 sticky 在下排五鈕上方（付款頁 `.k923cc-actions` 不黏）。桌機逐像素不變（`/tmp/j/desk20.js`）。
- 1020A 儲存空間：**不再自動跳出「儲存空間已滿」提示**（使用者要求；`kgmLsCleanR1012A()` 面板還在，只能手動開）；`lz20.js` 開頁整站 ≥260 萬字元就先壓縮（`KGM_LZ_R1020A`）。真的滿到寫不進去時沒有提示、只記 `KGM_LS_FAIL_R1012A`。量用 `tests/lz20t.js`（填充要用隨機中文字，有規律的字串會被壓縮掉、根本沒塞滿）。
- 1019A 票價分析座位：可以比系統多（重新開放已關閉的階）或少；寫在 `S.fareRulesR929` 的 bucket 規則 `seatsR1019A`／`soldR1019A`，sell54 最後一步套（`bks19`／`kgmBucketSeatR1019A`，優先於營收管理售完）；1018B 的 `S.seatInventory` 舊上限照樣有效、再套用一次就搬進規則。
- 1019A 轉機票價：`kgmConnCodesR1019A(f1,f2,pax)`（`js/cn19.js`）＝兩段都賣得到的代號，`connFareGrid`／r229 `selCab`／`pickConnectionFare`／`conn2Fare70` 都讀它；**夥伴營運段（`f.partner`）座位不在我們庫存（`kgmInventory49` 一律 0），不能查座位**。
- 1019A 航班動態「機場看板」（`js/fb19.js`，預設分頁）：桃園出發／抵達，讀季節班表＋`S.flightOverrides`/`autoStatus`＋`kgmGateOfR26`＋`kgmCounterOfFlightR929`；抵達登機門＝同一家飛回起點的下一班的登機門。KGM 自營航班掛夥伴代碼表 `KGM_MKT_R1019A`（`kgmMktCodesR1019A`／`kgmMktToKxR1019A`）。
- 1019A 搜尋航班頁篩選（`js/ff19.js`，包 `flightSel`）：轉機次數／營運航空／轉機點，選項只從這條航線這一天的結果算；營運航空對轉機是「每段都勾才顯示」。**選擇票價用清單位置選班 → 不能從清單拿掉，只能用 CSS 藏（`data-f19`／`data-c19`）；r228 的 `#app.k221-step tr.fl-row{display:table-row!important}` 會在打開票價面板時把列全打開，藏列選擇器要比它權重高**。直飛 0 班時直飛表格只放一行提示（轉機清單不重複）。
- 1019A 手機介面（`js/mb19.js`，≤640px 前台）：最下排五鈕 `#kgmTabR1019A`（首頁／我的行程／AI 助理／航班動態／會員）、表頭 ☰ 整頁選單（`.kt19-menu`，桌機要藏），AI 鈕＝`kgmToggleAi0819I`（沒登入→登入頁，r183 規則）；訂票頁航班列改上下卡片。**`window.S` 不是網站的 `S`（最上層 let），新程式一律直接讀 `S`**；手機卡片規則 `tr.fl-row.fl-row`，ff19 藏列要比它再高一級。
- 1019A 儲存空間（`js/lz19.js`，第一個 `<script>` 開頭）：瀏覽器存滿過（`kgm19_lz`＝1）才把 ≥2 萬字元的值 LZ 壓縮後存（前綴 `\u0001Z9`），掛在 `Storage.prototype.setItem/getItem` 與 `StorageEvent.newValue`，所有讀寫照舊拿原文；量真正佔用用 `kgmLsRawGetR1019A(k)`。**新程式讀 localStorage 一律用 getItem（不要用 `localStorage[k]`）**；存滿過的瀏覽器舊版網站讀不懂。量用 `tests/lz19t.js`（6,000＋6,000 會員＋塞滿）。
- 1019A 時刻（使用者逐列審 00:00–02:59 抵達）：KX288/287 −1.5h、KX212 −2h（KX211 使用者要求維持原時刻）、KX282/281 −2.5h、KX37 夏 00:20–04:55⁺¹／冬 00:05–04:50⁺¹、KX51 夏 −15 分（只動奧克蘭→雪梨、雪梨→台北；**基督城那段不能動**）。r77 tt929 定值＋`MIG19A`。**長程冬夏起飛要差 ≥15 分（r229 1010A 會自己推）；冬季抵達不能跟底表抵達同一個時間（r106 會把抵達跟著移）**。
- 1018B 售完方案：`validCodes` 不動，訂票頁直飛／轉機方案面板用 `kgmSoldFamR1018B(cab,可賣代號)`（`js/sold18.js`）補「售完」卡（不能按；轉機卡改成 div）。
- 1018B 第二輪 儲存：kgm_staff 存檔時，跟 r55 依員工編號＋姓名（或改名前 nameWasR1012A）自動產生一模一樣的眷屬名單 famOnFile 不存（famSeed18B 1／2），讀回 r55 重產；kgmLsStrR1012A 快取要記 f18（開頁第一次存檔時 r55 還沒載入）。量用 tests/big18b.js（1018A 產生 6,000＋6,000 → 新版）。
- 1018B 第二輪 售完卡：任何原因不能賣都同一種樣子，代號寫方案最貴那一階（kgmFamTopR1018B）；搜尋結果「去程起」（minP、_cabRows）也問 sell54。
- 1018B 第二輪 票價分析（js/fa18b.js，r40）：出發地／目的地／班號、沒有航線總覽；階梯格子可改這一班這一天的價格（fareRulesR929 加 bucket）與可售座位（S.seatInventory 人工值，只能比系統少）。
- 1018B KX31：夏季溫哥華→台北 01:00–04:30⁺¹（營運日 一二四六日）、整段 19:40–04:30⁺²；冬季三列＝1018A（多倫多→溫哥華 20:10–22:15 寫進 r77 定值表）。r179 只免夏季（`SEA18B`，**不要把班號放進 `EXEMPT`，會連 freeze 一起跳過**）；舊預設值遷移 `MIG18B`；換季停飛 `noOpDatesR928`（YYZ 出發 2026-10-25／2027-10-31、溫哥華→台北 2027-03-29／2028-03-27）。時刻表 PDF：`patches/1018B/timetable/tt18b.py`。全網沒有 03 點抵達；00:00–02:59 抵達 20 列：1019A 使用者審了 KX288/287、KX212（KX211 維持）、KX282/281、KX37、KX51，**KX148、KX253、KX217、KX244、KX262、KX86 還沒回**（清單在 notes/1019A）。
- 1018A 機型定案（`js/tf18.js`，r229 最前面）：MAP18 94 個班號的 `acft` 用 defineProperty **釘住**（讀＝定案、寫＝不理；季節班表 summer/winter 也釘），舊層計時器改回 EQV 改不動；`kgmPick330R92` 定案優先、其餘短程 A339R／長程 A339L；EQV 機型池拿掉 A35K、`kgmEqvPlanR79` 抽到 A35K 且 <5,000 km → A359。香港／澳門保留 EQV。**要改某班機型改 MAP18**（時刻表 PDF 用 `timetable/tt18.py` 讀同一份 MAP18 重印）。`kgmTypeFixApplyR1018A()` 回傳不一致列數（應為 0）。
- 1018A KX31（YYZ／YVR→TPE）：r77 定值改成網站實際顯示的值（夏 04:55、冬 23:30–04:15）；原本 03:55 跟 r68「不在 03 點抵達」、r179 互改，整年輪轉看開頁時序。（1018B 依使用者指定改成夏季 01:00–04:30⁺¹，PDF 已同步。）
- 1018A 開頁前 60 天機隊初排改分段（`js/boot18.js`，跟整年重排同一套 prep／days／types＋`KGM_KEEP72_1006A`），`KGM_BOOT60_R1018A={kept,prepMs,finalMs}`；量開頁初排結果用 `/tmp/j/boot60fp.js`（前 60 天＋整年指紋）。
- 1018A 轉降：後台 AI 工具 `flight_divert`（`js/dv18.js`），紀錄 `S.divertsR1018A`（`kgm18_divert`）；Diverted 寫在 `S.flightOverrides`，predict7 不蓋人工的 Diverted／Cancelled。
- 1018A 航班作業報告 `kgmOpsReportR1018A`（`js/ops18.js`）取代 `kgmPrintOpsR48`／`R41`／`printOpsR7`；天氣讀 `S.flightPredR7`（跟航班狀態同一份）。
- 1018A 模擬旅客座位用 `seatSections7` 的實際座位號（快取 `__kgmSeatIdsR1018A`，機型＋艙等）；票價三方案需求依序流入（基本→超值→豪華）。
- 1018A 儲存：員工通知同內容只留一則；`kgm_staff`／`kgmus4` 走 ls12 精簡格式；模擬會員自動里程紀錄存重算方式（`synLog18`）不存內容。
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
3. 版號更新（見下），並把 `vfy1.js` 的 `/1020B/.test(t)` 改成新版號
4. `node vfy1.js`（24 項）、`vfy2`（8；N1／F2／O1 找夏季班 KX160，測試從「今天＋18 天」起找，所以大約每年 10 月初～隔年 1 月下旬跑會找不到而失敗，改跑 `tests/vfy2d.js`（日期挪到 2027 年 4 月））、`vfy3`（8；1012A 起 S1 只挑今天真的有飛的班）、`vfy4`（8）、`vfy5`（6；AC1 在 UTC 00:00–約 04:00 跑會因 KX180 當天已起飛而失敗，改跑 `tests/vfy5d.js`）、`vfy6`（55）全部 PASS
5. `nohup timeout 560 node reg2.js > reg_X.out &` → 跟 `baselines/reg_1020B.out` 比 notOk 集合：**不能多出新的**；view errors 0、PAGE ERRORS 0
   （notOk 裡大部分只是回傳診斷物件、不是失敗；kgmAuditR210／R211 1012A 第三輪起改查「一天一班」（使用者同意）；真的 ok:false 的是 R6、R151 與 0903B/0904A/0905A–0909A 的效能門檻）
6. `node t_crewrule.js` → twoLegDays 0、longHaulNextDayFly 0、plannerViolations 0
7. `node t_sched922.js`（組員班表延遲）、`node t_admlag.js`（後台 27 個分頁逐頁量）
8. 不要同時平行跑多支測試（CPU 搶資源會讓效能門檻誤判）
9. `tests/tz8.js`（台北時區無機可派）、`tests/ai9t.js`（後台 AI 直連）要帶檔案路徑：`W=110000 node tz8.js /tmp/j/kgm.html`；`t_admlag.js` 反而**不能**帶（第一個參數是分頁篩選）
10. 量機隊輪轉要等背景重建跑完（至少 110 秒，`W=110000 node t_fl1.js`）；太早量會抓到重建到一半的狀態、誤報重疊
    （1014A 起 vfy6、t_crewrule 開頁後先等 `KGM_FULLDONE_1006A`（整年機隊重排做完，最多 150 秒）再加 5 秒才量；原本 45／60 秒常落在重排中途而誤報。t_sched922 的 10 秒以上尖峰是整年機隊重排本身一次卡主執行緒約 11 秒（1012A 以前就有，未修），見 notes 1014A D）

## 版號更新位置（重建時由 1004B 換成新版號，用 regex 精準替換，不要全域取代）

`||'1004B')` ×29、`var BUILD='1004B'` ×118、`var V='1004B';` ×4、`KGM_BUILD_*='1004B'` ×12、
`'data-kgm-build','1004B')` ×1、`· 1004B</title>` ×1、`· 1004B'`（document.title）×1，合計 166 處（`patches/1018A/p_h_ver.js`、`p_h_ver2.js` 是現成的替換腳本，`build.sh` 最後一步自動套用；下一版改這兩個檔的目標版號即可）。
1004B 起交付是兩個檔：`node patches/1004B/split.js <合併檔> <前台> <後台>`（1007A 另外交兩個 ZIP：說明＋時刻表＋Worker，以及 KGM_Policies 規章彙編）（只差開頭一行 `window.KGM_SIDE`）；測試一律跑合併檔。
其他出現的舊版號都是歷史註解，**不要動**。
