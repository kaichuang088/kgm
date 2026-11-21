# 1121A 技術筆記（pass 143）

建置：`cd patches/1101A && set -o pipefail; python3 gen_r28.py | tail -1 && bash build.sh /tmp/j/kgm1004B_t18.html /tmp/j/out.html`。
新 RW 在 gen_r28 `# ══ 1121A ══`；新長程式依 EMB28 接在 `ad120.js` 後：`tpl121`、`ai121`、`st121`、`rp121`。
最終版 `/tmp/j/kgm1121A_w25.html`（從 commit 重建 w26 逐位元相同）。

## 1. 聯營代碼以航線為單位（P8）
gen `mkt19 by route R1121A`（fb20b `Object.keys(MKT19).forEach` 前）：每個夥伴先收集「航線」＝
① MKT19 列的班號的 O&D（經停班取整段）、② 單列班、③ 碰到夥伴本國機場（HOME 表：EY AUH、CX HKG、QF 澳洲、JL 日本、AA/AS 美國、IB MAD BCN、AY HEL、MH KUL PEN、QR DOH）的航段；
再把每一班有任一列落在這些航線上的自營班都掛上夥伴代碼。第一版（全部單段）把 QR 擴到所有 TPE-PVG；第二版（只看 O&D）掉了 KX51 的 QF、KX21 的 JL。

## 2. 後台
- Q1 `ad120` `hbars()`：寬 `.r7-ops-card`／`.table-wrap` 後面畫 `.ad121-hs`（按鈕／拖拉／點軌道），700 ms 同步。原生捲軸是 overlay，卡片內部捲動，看不到。
- Q2 `ad120` `standCounts()`：選單每格「· N 班」（`kgmStandLookupR74`，閒置分段算、依機場＋日期快取）；0 班時列出有班的停機位 `.ad121-alt`。原問題重現不了。
- Q6 gen `k22 invol pick／detail R1121A`：只挑 `kgmDayOf72R1006A(d)` 裡 `t≠f.acft` 且商務席數變少的班（往回 6 天），detail 帶 `acChgR1121A`；`tpl121` `fixInvol()`（FULLDONE 後）改寫或刪除舊含糊案件。
- Q7 `tpl121`：範本庫 T（依案件 type）＋GEN；`#k7cMsg` 上方 `.tpl121`；空白或沒改過才自動填，改狀態換範本。
- Q8 `cs120`：模擬推進加「還有其他需要…」→「沒有了」→ `bye()` → 關閉；真人 `wrapClose` 包 `kgmCsCloseR1006A`（`it.closeAskR1121A`），`checkAsk()` 每 5 秒看旅客回覆。
- Q9 `bd31`：`S.aucLiveColR1121A`、`kgmAucLiveToggleR1121A`、`kgmAucLiveAllR1121A`。**bd31 範圍裡沒有 `A()`**，用了整個頁面包裝會丟例外。
- R6 `ai121`：最外層包 `kgmAdminAiAskR929`，`kgmAiRewriteR1121A(text)` 改寫成原引擎看得懂的指令（逐日期），對話裡寫「我理解成：…」。兩人互換規則不變。
- R7 `st121` `paintStx()`（`adminTab==='stafftix'`）。

## 3. 航班資料 PDF（Q3–Q5）
流程：`kgmOpsReportR1018A` → pdf38 `filterHtml(版本)` → rp120 `kgmOpsPdfR1120A`（html2canvas＋jsPDF、浮水印、RC4）。
- pdf38 `verOf`：ceo；pilot／cabin→flight；ground／service→ground；`allowOf('ceo')` 三種都可。`KEEP.flight={1,2,2A,3,4,5,6,6A,8}`、`KEEP.ground={1}`＋餐點（xtra `/餐點統計|Catering|Meal/`）。
- 包裝 `w(pre,opt)`：`pre!=='none'` 先開 `kgmPdfDialogR1121A`；英文時暫時切 LANG，產完 `back()` 還原；`filterHtml` 後再 `kgmPdfEnR1121A`。
- 地勤版擷取餐點用暫時 CEO 角色（地勤頁沒有餐點區塊），只取餐點那段。
- 簽核頁 `kgmPdfSignR1121A`：組員來自 `kgmCrewPlanR121(c.date)`（posCode→職位），4 欄小格才放得進第 1 頁；下一個 h2 加 `rp121-after`（`break-before:page`）。
- 基本資料合併 `kgmPdfMergeR1121A`：`manifest7` 一定包 `KGM_NODH_R1023A=1`。
- 英文字典：完整詞條＋句型；子字串替換只用長度 ≥3 的詞（不然出現「表定Arrival STA」）。`KGM_PDF_EN_R1121A` 記未翻譯數。
- **非 CEO 角色在新對話框裡點擊沒反應＝r197 攔截**，gen `r197 case skip R1115A` 加 `#rp121m` 等。

## 4. 前台
- Q10 `fe118` `kgmNewsOpenR1120A` 自己的 `#fe121news`。
- R1 `fe118` `alignRail()`：`.k134-rail` 寬／左邊界跟 `.r28-addons .r7-flight`。
- R2 `ad120` `kgmKidSeatR1121A(k,p,'c'|'t')`，pet38 座位 RW 加呼叫。
- R5 `st121`：綁定寫 `S.staffLinkR1010A[empId]={userId,at,by,selfR1121A}`（沿用 1010A 存檔鍵 `kgm10_stflink`）；前台鈕 `kgmStaffGoR1121A` 設 promoCode＋`__stxLinkR1121A`＋`S.view='booking'`（首頁 `post55` 會清 promoCode，`staffGatePage5` 只在 booking 跑）。

## 5. 沒做／重現不了
- P1 票價介紹頁經濟艙空白、Q2 停機位都沒班：Chromium 重現不了（沒有 WebKit）。
- R3、R4 是規則（7 天、4,000 km），沒改。
- R6 沒有兩人互換方案時沒有其他替代換法。
