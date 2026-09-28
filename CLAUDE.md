# KGM Airways — 專案規則（給 Claude Code）

KGM Airways 是一個虛構航空公司的訂位網站，**整個網站就是一個自包含的 HTML 檔**（約 8.4 MB）。
版號由使用者指定（目前是 0928B，下一版由使用者命名）。

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

## 測試環境

- 所有測試腳本寫死讀取 `/tmp/j/kgm.html`。工作方式：把要改的 HTML 放在 `/tmp/j/kgm.html`，腳本放在 `/tmp/j/`。
- 需要 Node 18+ 與 Playwright（Chromium）：`npm i playwright && npx playwright install chromium`
- `reg2.js` 約 9 分鐘；`vfy*.js` 每支 1–3 分鐘（頁面載入後要等背景排班跑完）。

## 每一輪交付前的關卡（全部要過）

1. `node syn.js` → `scripts checked 248 errors 0`
2. `grep -c '<script id=' kgm.html` → `241`
3. 版號更新（見下），並把 `vfy1.js` 的 `/0928B/.test(t)` 改成新版號
4. `node vfy1.js`（24 項）、`vfy2`（8）、`vfy3`（8）、`vfy4`（8）、`vfy5`（6）、`vfy6`（55）全部 PASS
5. `nohup timeout 560 node reg2.js > reg_X.out &` → 跟 `baselines/reg_0928B.out` 比 notOk 集合：**不能多出新的**；view errors 0、PAGE ERRORS 0
   （notOk 78 裡大部分只是回傳診斷物件、不是失敗；真的 ok:false 的是 R6、R151 與 0903B/0904A/0905A–0909A 的效能門檻）
6. `node t_crewrule.js` → twoLegDays 0、longHaulNextDayFly 0、plannerViolations 0
7. `node t_sched922.js`（組員班表延遲）、`node t_admlag.js`（後台 27 個分頁逐頁量）
8. 不要同時平行跑多支測試（CPU 搶資源會讓效能門檻誤判）
9. 量機隊輪轉要等背景重建跑完（至少 110 秒，`W=110000 node t_fl1.js`）；太早量會抓到重建到一半的狀態、誤報重疊

## 版號更新位置（目前 0928B → 新版號，用 regex 精準替換，不要全域取代）

`||'0928B')` ×29、`var BUILD='0928B'` ×118、`var V='0928B';` ×4、`KGM_BUILD_*='0928B'` ×12、
`'data-kgm-build','0928B')` ×1、`· 0928B</title>` ×1、`· 0928B'`（document.title）×1，合計 166 處（`patches/0928B/p_e_ver.js`、`p_e_ver2.js` 是現成的替換腳本）。
其他出現的舊版號都是歷史註解，**不要動**。
