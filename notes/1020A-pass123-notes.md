# 1020A（pass 123）

版號：使用者指定 **1020A**（「請開始1020A（先改手機＋儲存空間）」）。

重建：`bash patches/1020A/build.sh <1004B.html> <out.html>`（1020A＝1019A 全部＋`p_h_r20.js`）。
`p_h_r20.js` 由 `gen_r20.py` 產生，**要在 `patches/1020A/` 目錄下執行**；比對基準是 1019A 最終版 `/tmp/j/kgm1019A_w27.html`
（`patches/1019A/build.sh` 重建）。gen_r20 只有 3 個替換：
1. `lz20`：整份 `../1019A/js/lz19.js` → `js/lz20.js`（第一個 `<script>` 開頭）。
2. `ls no banner`：`kgmLsFailR1012A` 最後的 `if(Date.now()>=hidUntil)setTimeout(banner,0);` 拿掉。
3. `mb20`：整份 `../1019A/js/mb19.js` → `js/mb20.js`（r229 前面）。
最終建置 **w5**，scripts 248 bad 0，layers 241。

## ① 手機：☰ 改成側邊選單（使用者：「手機版上面中間的應該是用Side Bar才對啊」「通常這會在左邊不是右邊喔」）
- 1019A 的 ☰ 是整頁展開（把表頭第二列的四個 `.mega` 撐成整頁）。1020A 改成 `#kgmDrawerR1020A`（掛在 body，render() 不會洗掉）＋遮罩 `#kgmDrawerMaskR1020A`。
- ☰ 移到表頭**左上角**（標誌左邊），選單從**左邊**滑出（寬 min(86vw, 348px)）。關閉：點遮罩、選單右上 ×、往左滑超過 70px、點任何項目、換頁（`S.view` 變了）、Esc、點下排五鈕。
  開著時 `html.kgm-drawer-r1020a{overflow:hidden}` → 後面的頁面不捲動；每次打開捲到最上面。
- 內容（每次打開／render 時從表頭現有的 `.mega` 讀，中英文跟著切換）：
  - 會員卡：沒登入＝「KGM Explorer 會員」＋登入／加入會員（加入會員＝點 `mega_miles` 的第一項）；有登入＝頭像字母、姓名、等級膠囊（Bronze／Silver／Gold／Diamond 不同色）、哩程，點了到會員頁。
  - 常用四格：線上報到／選位／登機證／查詢訂位（都是 `mega_trip` 裡原本的項目）。
  - 四個選單摺疊列：優惠與訂票／行程管理／飛行準備／無限萬哩遊（標題取自表頭按鈕），展開後是 h4 分組＋項目。沒有 onclick 的項目（「立即購票」）本來點了就沒反應 → 不列。
  - 通知（未讀數字）、語言（中文／English 切換）、登出（有登入才有）。
- 點項目＝`kgmDrawerGoR1020A(megaId,h4序,li序)` → 關選單 → 對表頭原本那一個 `li` 做 `.click()`（同一個 onclick，不另寫一套）。
- 實測 [確定]（w5，390×844）：項目 38＝表頭有 onclick 的 li 38；「航班動態」→ `S.view='status'` 且選單關；「線上報到」→ `manage`（跟桌機選單同一個動作）；
  捲到 600 後打開、滾輪 800 → 仍是 600；Esc 關、往左滑關、換頁關；英文版標題／項目全是英文。

## ② 手機：跟桌機不同的 App 式版面（使用者：「可能要有一定的設計跟電腦有點不同吧」）
全部寫在 `@media (max-width:640px)` 裡、前綴 `html:not(.kgm-side-admin)`（後台檔不動）。
- 表頭：☰＋標誌＋鈴鐺圖示（未讀數字小紅點，原本的 `.portal-badge0809g`）＋語言小膠囊（EN／中，`data-k20`）。Member Portal 文字鈕在手機上照 1019A 收進下排「會員」。
- 首頁主視覺縮短（上下 padding 56/78 → 24/62、標題 27px `text-wrap:balance`、三個數字改成三欄有分隔線）→ 搜尋卡在第一個畫面就看得到。
- 搜尋卡：單程／來回／多航段三等分、「預訂機票／酬賓機票」改成灰底分段按鈕；
  出發地／目的地各一整列圓角欄位，交換鈕（改成上下箭頭圖示）夾在兩格中間右側；航段＋日期一列、乘客＋艙等一列、優惠碼一列；搜尋鈕 52px 高。
  多航段（`.mc-search`）不套這些格子（第一版的選擇器把整個多航段區塊當成一格 → 擠成兩欄，已排除）。
- 結帳：旅客資料「返回／下一步」、附加服務「總價＋返回／下一步」、航班確認「確認並付款／返回／選位」三種按鈕列**黏在下排五鈕上方**（圓角浮動列）。
  付款頁的按鈕區（`.k923cc-actions`）裡面還有兩個同意條款＋說明，整塊黏住會蓋掉信用卡表單 → 不黏。
- **陷阱 [確定]**：`#app`、`body`、`html` 原本都是 `overflow-x:hidden`，`overflow-x` 不是 visible 就會把 `overflow-y` 變成 auto → 這三層都變成「不會捲的捲動容器」，
  `position:sticky` 全部失效（1019A 手機表頭寫了 sticky 其實也沒黏住）。手機上改成 `overflow-x:clip; overflow-y:visible`（一樣不會左右捲、不會建立捲動容器）。
  實測：捲到 600／900，表頭 top＝0；18 個手機畫面 scrollWidth 都＝390。

## ③ 儲存空間：不再跳出（使用者：「儲存空間滿了 這個我不想再看到這個東東跳出來喔！！！」）
- 跳出來的東西是 `kgmLsFailR1012A`（寫入失敗）最後的 `banner()`（`#k12-lsfail`，按鈕再打開 `#k12-lsclean` 整理面板）。gen_r20 拿掉自動跳出那一行；
  `kgmLsCleanR1012A()` 整理面板還在，只是不會自己出現（後台主控台手動呼叫才會開）。全站唯一呼叫 `banner()` 的地方就是這一行（grep `setTimeout(banner,0)`＝0）。
- `lz20.js`：1019A 要等到真的寫入失敗才開始壓縮；1020A 開頁就量整站原始字元數（`KGM_LS_TOTAL_R1020A`），**≥ 260 萬**（上限約 520 萬的一半）且還沒開壓縮
  → 直接把所有 ≥ 2 萬字元的鍵改存壓縮版、立 `kgm19_lz`（`KGM_LZ_R1020A={early:true,before}`）。
- 代價（老實寫）：壓縮過的瀏覽器，舊版網站檔（1018B 以前）讀不懂（跟 1019A 一樣）。儲存區真的滿到連壓縮＋1015A 清可重算資料都寫不進去時，這次的修改不會存檔，
  **而且不會有任何提示**（使用者要求不要跳）；失敗紀錄仍在 `window.KGM_LS_FAIL_R1012A`。
- 實測 [確定]（`/tmp/j/lz20t.js`，第三次才是真的塞滿：前兩次的填充字串有規律，被壓縮掉了）：
  1018A 產生 6,000 員工＋6,000 會員 → 1019A w27 開頁：337.8 萬字元、沒壓縮 →
  1020A 開頁：自動壓縮 7 個鍵 → 54.1 萬（kgmus4 179 萬 → 23.4 萬）→ 用隨機中文字（壓不下去）塞到 521 萬（上限約 524 萬）→ 重開＋後台員工分頁：
  網站自己的存檔都寫進去了（`KGM_LS_FAIL` 沒有紀錄），測試另外硬寫 6 萬字元＝QuotaExceededError（預期）→ 重新整理。
  四個階段：會員 6,002／員工 6,502 指紋完全一致；`#k12-lsfail`／`#k12-lsclean` 從頭到尾 0 次出現（MutationObserver 監看整份文件）。

## 桌機
- 逐像素比對（1400 寬，`/tmp/j/desk20.js`，12 個畫面：首頁、搜尋結果、旅客、附加服務、確認、付款、我的行程、航班動態、哩程、登入、會員、多航段）[確定]：
  只有頁尾版號 1019A→1020A、首頁統計數字（計數動畫）、航班動態「更新於」時間不同；版面完全相同。側邊選單、☰ 在桌機 `display:none`；`#app` overflow-x 仍是 hidden（clip 只在手機）。

## 驗證 1019A 手機表頭沒黏住
- `/tmp/j/stk19.js`（390×844，捲到 700）[確定]：1019A w27 表頭 top＝−700（跟著捲走）；1020A w5＝0（黏在頂端）。

## 關卡（w5，依序跑，`/tmp/j/gates20A.sh`）[確定]
- syn 248／0、`<script id=` 241、版號 1020A（title／頁尾）。
- vfy1 24/24、vfy2d 8/8（今天 10/19，vfy2 本來就要改跑 2d）、vfy3 8/8、vfy4 8/8、vfy5 6/6、vfy5d 6/6、vfy6 55/55。
- t_crewrule：twoLegDays 0、longHaulNextDayFly 0、plannerViolations 0；t_sched922 maxLatency 1,882 ms；t_admlag 27 分頁 ERR []。
- tz8 missing 0、split 0；ai9t 跟 1019A 相同（沙盒連不到 Worker，FAIL-NOTE 1 條＝站內引擎處理，1019A 一樣）；t_fl1 overlap 0、orphan 0。
- reg2：notOk 78＝`baselines/reg_1019A.out` 的 78（沒有新增、沒有消失），view errors 0、PAGE ERRORS 0 → 存成 `baselines/reg_1020A.out`。

## 交付
- `node patches/1004B/split.js` → `KGM_Airways_1020A_前台.html`／`_後台.html`（各 241 層）。
- ZIP `KGM_1020A.zip`：`1020A_說明.md`（本檔）、`worker_ai_1008B.txt`（Worker 沒改）、時刻表 PDF 沿用 1019A（這一版沒有改時刻，檔名保留 1019A）。
