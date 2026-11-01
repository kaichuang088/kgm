# 1101B（pass 131）筆記

建置跟 1101A 同一套：`cd patches/1101A && python3 gen_r28.py && bash build.sh <1004B.html> <out.html>`（版號 `p_h_ver.js`／`p_h_ver2.js` 改成 1101B；內部標記 1101B／R1101B，新 RW 用 `*29` 標籤）。比對基準仍是 1027A 最終版 `/tmp/j/kgm1026C_w77.html`。

## 這輪改了什麼（使用者 Round 2 對 1101A 的意見）

- **團體**：方案視窗每次在首頁按「搜尋航班」才跳（`grp28` nav 包裝 `nw28`、`S.grp28PendingNav`）；表格不寫係數；Q 0.93→0.72、U 1.08→0.85；改票手續費每筆訂位一次（`kgmReissueQuoteR45` 團體代號不乘人數；前台 `changeQuote` 本來就是每筆）。
  人數＋艙等合併成一個面板（三艙各幾位、其中兒童／嬰兒，全部可改：`kgmGrpMixR1101A`／`kgmGrpKidsR1101B`）；團體模式首頁的「客艙級別」下拉藏起來、原位寫各艙人數（點了開同一面板）。規章 KGM-GRP-021 Rev. C。
- **多航段**：出發地／目的地改用主表單同一個機場選擇器（`apPickerHTML("mc<i>fr|to")`；r158 `pickerHTML158`／`kgmApPickR158` 加 `mc` 鍵）。
- **選單**：飛行準備 → 特別服務加「寵物同行」、新增「旅客服務」欄（寵物同行申請、建立客服案件、案件進度查詢）。
- **航班動態**：predict7 加 `kgmWarDelayR1025B.min`（繞道比班表多的時間）；48 小時延遲抵達通知（geo26 job）新抵達＝predict7 的 EST（含高空風）→ 前台、後台、航班資料同一個數字；
  前台卡片 `warDelayR1025B` 的寫「延遲抵達」；後台航班狀態頁每班寫 EST／實際與原因、Diverted 寫續航、續航那天那條航線多一列（`kgmAdStNoteR1101B`／`kgmAdStExtraR1101B`）。路線圖文字寫「班表已含 S 分・繞道晚到 M 分／不影響」。
- **定位管理寵物**：1101A 接到沒在用的 `bookingAdmin49`；實際畫面是 0819J 票務中心（`.j-dossier`）→ 表頭＋完整行程下面（cs28 `kgmPetBookingCellR1101B`／`DetailR1101B`）。
- **Residence**：開放中的競標，各艙保留最後一個座位（gr28 `kgmResHold1R1101B`，cabinInventory54）；R182 稽核改看 confirmed 且沒有 backupSeat。
- **KX51**：紐西蘭先進夏令那週（9/27–10/3）AKL→SYD 輪擋照估算（bt26 `NZW29`），SYD→TPE 回到 16:50–23:55。
- **KX30**：tt929 定值改成 r179 過站規則算出的值（原本 22:25 與 21:00 之間跳動）→ 溫哥華→多倫多 夏 21:30–05:10⁺¹。
- **IRR-013 Rev. B**：第 8 條之一「座位之非自願調整」（`irr_doc29.py`、`pol/irr29_pdf.py`，目錄要認「第 N 條之一」）。
- **卡頓**：組員引擎一天 1～4.9 秒不能中斷 → 不在組員班表分頁時算一天休 8 倍；競標預補一班 >0.3 秒休 5 倍；機隊整年結果 IDB 快取（`kgmFleetCacheR1101B`）；cabinInventory54 的 segs7 快取。

## 坑

- 時刻表 PDF：底稿有些頁整頁包在 Form XObject 裡，**redaction 清不到** → `timetable/align29.py` 先用標題底色蓋再重畫。標題重排後 `subset_fonts` 要十幾分鐘 → 預設不做（`TT29_SUBSET=1` 才做）。
- 時刻表帶狀標題兩行置中（「9h50m ~」／「10h35m」）原本配不成一組 → 1101A 開了真時差重算後會變成三段字；tt28 配對加「中心對齊」。
- 箭頭位置：每頁每一欄（左去程／右回程）對齊，T＝max(96.5, 這欄最長出發地＋5.5)。
- DH 訂位是開航班資料（`manifest7`）時才建立，開頁背景不會建立 → 測 `dh_change` 要先開那班。

## 量測（2026-11-01）

- 點擊延遲（`/tmp/j/clk29p.js`，隨機 5～12 秒點一個後台分頁、240 秒）：1027A p50 4.0／p90 12.3／最長 13.3 秒；w60 p50 0.63／p90 1.49／最長 1.65 秒（剩一次組員引擎碰撞 1.4 秒）。
- 驗證腳本：`/tmp/j/v29f.js`（前台）、`v29a`／`v29d`／`v29e`（航班狀態、延遲抵達）、`v29v`／`v29g`／`v29h`／`v29i`（後台逐項）、`kx51t.js`。
