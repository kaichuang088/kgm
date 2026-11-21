# 1121A 之後：Netlify 上線＋網頁推播（交接給下一個工作階段）

## 已完成（2026-11-21）
- Netlify 專案 `kgm-airways`（site id `5b8ea366-996f-4ce0-9bea-7716189d473e`），deploy `6b011d19f788f301a97e4921` state=ready。
  - 內容＝1121A 交付 ZIP 裡的 `netlify/`：前台 `https://kgm-airways.netlify.app/`、後台 `https://kgm-airways.netlify.app/admin/`。
  - 訪客存取：使用者選「改成公開」→ 已關掉團隊 SSO（requiresSSOTeamLogin=false）。
  - **還沒在瀏覽器打開驗證過**：舊環境網路只放行 mcp.netlify.com，netlify.app、workers.dev 都被代理擋（403）。
- 新雲端環境 `kgm`（env_01QrRmekHyWLKVbMXYXE3JME，個人）：放行 api.cloudflare.com、kgm-email.amychen-640413.workers.dev、kgm-airways.netlify.app、mcp.netlify.com＋套件庫。舊工作階段不能搬過去 → **下一個工作階段要選 `kgm` 環境開**。

## 使用者這次要的（逐字）
「你可以幫我把這個版本連結Netlify嗎 我相信應該可以了 ＠按需要手機通知和信箱通知 還有AI」
手機通知：選「網頁推播」；補充「這個是要關閉也要有通知」（＝網站／App 關掉也要收得到）；「我想要網頁但是Cloudflare你可以幫我用嗎」（＝Cloudflare 那邊要我直接處理，不要只給她貼）。

## 下一個工作階段要做
1. 先在瀏覽器實測線上站：前台、/admin/ 打得開、0 頁面錯誤；前台／後台同網域資料互通（後台建一筆、前台看得到）。
2. 寄信／AI：網站寫死 `https://kgm-email.amychen-640413.workers.dev`（`/api/notify`、`/ai/messages`、`/ai/admin`、`/ai/front`、`/ops/flight-predictions`、`/schedule/booking-notifications`、`/api/health`）。
   從 `https://kgm-airways.netlify.app` 來源實測：health 200、寄一封真的測試信到使用者自己的信箱（要先問收件地址；**模擬資料一律不寄**）、後台 AI 一題。
   若 Worker 設了 `ALLOWED_ORIGIN`，要改成 `https://kgm-airways.netlify.app`。
3. 需要 Cloudflare API Token（request_credential，host `api.cloudflare.com`；權限：Account → Workers Scripts:Edit、Workers KV Storage:Edit）。
   **改 Worker 前先把現在線上的 kgm-email 腳本整份下載備份**（我們手上沒有她完整的 Worker 原始碼，只有歷次給她貼的片段：`Worker_mail_1101A.txt`、`Worker_ai_1116A.txt`）。
4. 網頁推播（網站關掉也收得到）：
   - 網站：根目錄 `sw.js`（Service Worker：`push` 事件 showNotification、`notificationclick` 開到對應頁）＋`manifest.webmanifest`（iPhone「加入主畫面」，display standalone、圖示）；
     前台會員資料／我的行程放「開啟手機通知」按鈕（要使用者手勢才能要求權限；iPhone 沒加主畫面時提示怎麼加）。
     程式放進現有 EMB28 的新 js（不新增 `<script id>` 層，維持 241）；sw.js／manifest 是 Netlify 資料夾裡的獨立檔。
   - Worker：`/push/key`（VAPID 公鑰）、`/push/subscribe`／`/push/unsubscribe`（KV 依會員 Email 存訂閱）；
     `/api/notify` 寄信成功後同一事件也推播給這個 Email 的所有訂閱（＝「按需要」：會寄信的事件都會推播，模擬資料照樣不送）。
     Web Push 加密（aes128gcm）＋VAPID（ES256 JWT）用 WebCrypto 自己寫，Worker 不能 npm；VAPID 私鑰放 Worker secret。
   - 實測：Chromium 允許通知 → 訂閱 → 關掉分頁 → 觸發一個會寄信的事件 → 收到推播（Playwright 用 persistent context＋grant permissions 量 SW 收到 push）。
5. 版號：這是新功能，要使用者命名新版號（目前 1121A）；照 CLAUDE.md 跑完整關卡再重新部署。
