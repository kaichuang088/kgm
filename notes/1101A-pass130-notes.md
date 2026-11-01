# 1101A（pass 130）筆記

建置：`cd patches/1101A && python3 gen_r28.py && bash build.sh <1004B.html> <out.html>`（1101A＝1027A（1026C）全部＋`p_h_r28.js`；比對基準 1027A 最終版 `/tmp/j/kgm1026C_w77.html`）。
長程式在 `patches/1101A/js/`（`EMB28` 依序接在 r229 `ch27.js` 後面）：`gr28`、`pl28`（Payload／載重平衡／非自願換座位補償）、`fr28`（我的行程、辦理登機 24h、附加服務、地勤報到→登機證、多航段）、
`dh28`（DH 改期 AI 工具 `dh_change`）、`cs28`（寵物規則引擎、旅客建立案件、附件 IndexedDB `kgm28_files`、案件兩分頁、CEO 審核、持續模擬）、`ad28`（通知分航段、換機身空機調派、轉降續航、航班調整 −／＋、請假／訊息中心頁首）、
`grp28`（團體前置視窗、方案限制、整團坐得下、回程提示、團名、選位費、會員卡號、尾款期限內名單、**混艙人數＋類酬賓矩陣＋付款後自動拆艙**）、`cr28`（包機／自創航班報價流程）。
另外 `bt26.js` 在 1101A 也改了（WIN28／NIGHT28 時刻規則、`GAP28` 墨爾本夏令錯開週）。規章：`pet_doc.py`（KGM-PET-009 Rev. B）、`grp_doc28.py`（KGM-GRP-021 Rev. B）、`pol/pet28_pdf.py`、`pol/grp28_pdf.py`、`pol/pack28.py`（PDF 要用 venv python：系統 Pillow 壞掉）。

## 坑（下一輪要知道的）

- **時刻規則（WIN28）**：非曼谷航線不在 03:00–05:59 出發、不在 01:30–03:59 抵達（加彈性後落進去 → 較近的 01:25 或 04:00）。KX9 芝加哥→台北冬季允許提早到 06:00 以前（NIGHT28）。
- **GAP28（bt26 `seaProj`）**：墨爾本已進入夏令時間、但北半球夏季時刻還沒換的那幾週（10 月第一個週日～IATA 冬季開始；IATA 夏季開始～4 月第一個週日），KX54／KX53、KX60／KX59 改用冬季時刻（從 12-02 那天的原始時刻抄）。
  原因：夏季時刻照墨爾本標準時間排，那幾週伯斯→墨爾本只剩 2h55（使用者回報的 KX53 少 65 分）；前後班過站都卡 75 分、晚上不能過午夜，只往前挪出發做不到。量：`tests/kx53t.js`、`tests/dstscan28.js`。
  **還沒處理**：KX51 雪梨→台北在紐西蘭先進夏令、澳洲還沒進的那一週（2026-09-27～10-03）8h15（奧克蘭→雪梨那段被拉長到 4h25）；KX51／52 時刻是使用者審過的，沒動。
- **團體混艙**：`S.search.grpMixR1101A={Premium,Business}`，經濟艙＝其餘。人數最多那艙當主訂位；`kgmGrpSellR1025B` 外層（grp28 `sw`）有分艙時每艙只要坐得下那艙人數（`window.__k28need` 可蓋掉）。
  付款完成、團體成立後 `split()`（每 1.5 秒看一次 `g.mixDoneR1101A`）用原本的 `kgmGrpCabinR1026C` 把其他艙的人一位一位拆出去（名字還沒給就先 TBA），拆出去的旅客姓名在名單頁下方 `kgmGrpMovedEdR1101A` 填，跟「儲存名單」一起存；**有 TBA 就不開票**（`maybeTicket` 的 RW）。
  團體頁表頭的「人數」「艙等」寫的是主訂位（拆出去的不算）——1026C 名單頁改艙等本來就這樣，沒改。
- **類酬賓矩陣**：團體模式的 `flightSel` 外層（grp28 `fs`）改畫 `award-shop` 版面（沿用酬賓機票的 CSS），選格子＝`pickFare(dir,idx,code,true)`；沒有直飛／經停班就退回原本清單；「看轉機航班與完整清單」切 `S.grp28List`。
- **包機報價**：後台核准鍵在 pending 時改成「送報價」（`kgmCharterQuoteR1101A`）；前台接受（`kgmCharterAcceptR1101A`）時把狀態暫時改回 pending 再呼叫原本的 `kgmCharterApproveR1026C`（它只收 pending），失敗就還原 quoted；錯誤訊息在 `S.k27cdMsg`。
- **持續模擬**：`cs28` `simTick` 每 120 秒（只在後台開著、8 秒內沒輸入、焦點不在輸入框時）；`window.kgmCaseSimTickR1101A` 給測試直接呼叫。模擬案件不寄信。
- 新寄信事件：`group.charter_quoted`（寄信清單 RW `mail28 charter quoted`）；`group.charter_approved` 改成「接受報價・全額請款」。案件、寵物沿用 `case.opened`／`case.updated`，換座位補償沿用 `booking.changed`。
- 案件記錄的鍵是 `caseNo`（不是 `id`）。

## 量測

- 團體混艙：`tests/grp28m.js`（14 位＝經濟 10＋商務 4：矩陣、回程提示、付款後拆 4 位商務、填名字、TBA 不開票）；單一艙：`tests/grp28d.js`（多了 r1b 點矩陣格子）。
- 包機報價：`tests/cr28t.js`（報價 → 接受 → 航班 KX2001、空機回程開放販售、全額、名單 12、T-14 開票、換大機型清單）。
- 持續模擬：`tests/sim28.js`。KX182：`tests/kx182t.js`（12/2–12/8 每天都有價，重現不出 1027A 的售罄）。
- 前台第一次搜尋（`/tmp/j/fs28.js`）：TPE-NRT 1.8 秒、TPE-LAX 1.3 秒（同條件第二次 0.5 秒）；時間大半在 `findConnectionsFull`（約 0.7 秒）與 `merge189`（約 0.8 秒），這輪沒動。

## 交付關卡（最終檔 w49，2026-11-01 依序跑）

- syn 248／0、241 層；vfy1 24／24（H1 改成等整年重排做完）；vfy2d／3／4 全過；vfy5d 5／6（AA1 萬聖節促銷＝日期，1027A 同）；vfy6 54／55（H30：12 月前 40 位客艙組員沒有一週上 6 天，precondition 不成立；1027A 有 1 週；w47 11 月 55／55）。
- t_crewrule 0／0／0；t_fl1 gap／overlap／type／missing／orphan 全 0；tz8 0／0；ai9t 同 1027A（工具 32）；reg2 notOk 78＝1027A（`baselines/reg_1101A.out`）。
- t_sched922 ready 13／60、最長 2.7 秒。t_admlag 同機先後量：35 頁總和 1027A 8,530 → 1101A 9,253 ms（+8%）。
- 登機門／櫃檯第一次開原本 1027A 的兩倍（`plan8` 要連算前兩天的派工）→ `gr28.js` 閒置時先算（進後台或整年重排做完、3 秒沒操作，一次一天），20 秒內開 ≈ 1027A、放一分鐘以上再開比 1027A 快。
- 時刻表 PDF 只改 11 列（帶狀標題不重算：固定時差算法會在夏令差 1 小時）；Payload PDF 19 頁。
