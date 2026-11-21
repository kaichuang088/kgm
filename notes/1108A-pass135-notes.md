# 1108A（pass 135）筆記

建置跟 1101A～1104A 同一套：`cd patches/1101A && python3 gen_r28.py && bash build.sh <1004B.html> <out.html>`（版號 `p_h_ver*.js`＝1108A；新 RW 在 gen_r28.py `# ══ 1108A ══`，放在 `RW('srch31 inv idx',` 前；程式標 R1108A）。比對基準仍是 w77。最終檔 `/tmp/j/kgm1108A_w23.html`。逐項清單（18 點＋圖細節）與每一項的實測紀錄在 `notes/1108A-todo.md`；給使用者的說明在交付的 `1108A說明.md`。

## 新檔案
- `js/grp38.js`（EMB 接在 st38 後）：團體 G1 隱藏 PNR（`kgmGrpHideR1108A`、`wrapN` 擋開票前 booking.confirmed／代號換 GRP 編號）、G2 自動扣款（`g.autoPayR1108A` 只存末四碼、`kgmGrpAutoChargeR1108A` 每 30 秒；期限當天扣，原 tick 隔天才取消）、G3 包機／自創回清單層、G5 名單草稿 `S.grpNmDraftR1108A`（MutationObserver 重畫後填回）、G6 我的團體頁 `wrapGV`、N8 模擬資料 `seedMock`（`mockR1108A`，一律不寄信、不佔座位）。
- `js/cx38.js`：N12 換機型換機長。每 90 秒掃 8 天，班表算好之後機隊又換機 → 換同職級新機型族、d-1／d／d+1 沒勤務的機師；`S.crewSwapR1108A`（`kgm38_cswap`，已加進 save 與 S 初始值）；包 `kgmCrewPlanR121`（最外層）、`kgmRosterR196`、`kgmRestDayWorkR927C`、`kgmChangesR78`。
- `js/pdf38.js`：N7 包 `kgmOpsReportR1018A`／`printOpsR7`／`kgmPrintOpsR41`；`KGM_OPSREPORT_R1108A={ver,len,map,sections}`、`__k38LastReport`。
- `js/st38.js`：登機門前一天 23:00 公布（包 `kgmGateOfR26`，後台 `_k65Raw` 照舊看得到）、預估只到隔天、證明實際抵達後；班表 DH 行換行 CSS。

## 改既有程式
- `grp28.js`：`namesForm` 國籍＋範例；N2 單一總人數 `kgmGrpTotR1108A`、去程逐艙加位 `kgmGrpAllocR1108A`／`kgmGrpAllocPickR1108A`（`.k38al*`）。
- `cs28.js`：`denyCase`／`kgmCase28DenyR1108A`／`kgmCaseNeedsDecisionR1108A`；CEO 同意／不同意／退回；寵物座位圖 `kgmPetsOnFlightR1108A`、`kgmPetSeatR1108A`、`kgmPetPanelR1108A`；`kgmPetSetSeatR1108A` 不同意時還原座位。
- `bd31.js`：寵物徽章改「核准且已搭乘 3 段」。
- `bt26.js`：`WB38` 西行輪擋定值（只動抵達、`f.to==='TPE'`）。
- gen RW：`map38 jfk`（MAP18 KX48／47 A35K）、`aw38 quota`（`_awardQuotaScaled` ×2）、`cab38 *`（客艙一桶 `CABIN`，機型檢定稽核只查機師）、`cab38 dh pnr`、`cx38 cell`、`g38 *`、`pet38 *`、`fd38 chip／live`、`est30 front`、`st38 cert*`、`trip30 mine`／`S init/save`。
- `payload/pl28pdf.py`：頁尾／標題版號改讀環境變數 `VER`（不帶照舊 1101A）。

## 坑
- **客艙一桶讓組員引擎變重**：`choose()` 的候選清單從各機型族的桶變成整站客艙 → `eligible`＋排序量變大。開頁 90～150 秒主執行緒佔用 49 秒（1104A 31 秒），150 秒後相同；60 天完成時間差不多（t_sched922 第 35／36 樣本 vs 1104A 33／34）、maxLatency 3.0 秒。`/tmp/j/ltcmp.js <html>`（每 30 秒長任務合計）、`/tmp/j/prof38.js <html> <起秒> <秒數>`（CDP 取樣，依函式＋行號合計）。要壓：在 `choose` 對非虛擬組員也設候選上限會改變挑人結果 → 要重量 t_crewrule／月負載平衡。
- t_admlag 的 `paint` 會把背景長任務算進去：寵物頁 2.3 秒是落在上面那段；直接呼叫 `kgmPetDeskPageR1102A()` 1 ms、`render()` 50 ms。
- 地勤的航班資料頁只列「我的航班 7 天」，`S.opsSelectedR7` 會被清掉 → 測匯出要等 `KGM_FULLDONE_1006A` 後從自己的班開（`tests/pdf38g.js`）。報告徽章文字本身含「不含燃油」，檢查燃油要先拿掉徽章（`pdf38t.js` 已改）。
- 模擬案件編號要符合 `KG`＋4 碼＋MMDDYY＋`M`，不然 `caseNoJ` 會重編號。
- 時刻表 PDF：底稿用 1027A PDF＋`dumptt_old28.json`（1102A 輸出第 24 頁巢狀表單 `get_text` 要 ~5 GB；1101B 底稿會重複帶狀標題），`ulimit -v 8000000`；`subset_fonts` 後 1.79 MB（逐頁像素跟未子集相同）。JFK 機型欄底稿寫 B779：白底蓋掉、LiberationSans 5.66 同色寫 A35K，再 subset 一次。跟 1104A PDF 比只有第 16、17 頁不同。
- Payload：`tests/pl28dump.js` 跟 1104A 比 13 列不同（10 段西行抵達、KX48／47 A35K、KX138／137 冬季取樣日 12-01 由自動換機 A339R 變回 B779——JFK 改 A35K 空出 B779 的連帶）。
- KX306／305 冬季時刻表 A21N、機隊實派 B779 → cx38 幾乎每天換機長（原本就不一致，沒動，等使用者）。

## 關卡結果（w23，一次只跑一支）
- syn 248／0、241 層；vfy1 24／24；vfy2d、vfy3、vfy4 各 8／8；vfy5d 5／6（AA1 同前）；vfy5 4／6（另 AC1：UTC 21:36 跑，時段問題）；vfy6 55／55。
- reg2 notOk 78 個，跟 1104A 基準逐一相同；view errors 0、PAGE ERRORS 0 → `baselines/reg_1108A.out`。
- t_crewrule 0／0／0；t_fl1 overlap 0、orphan 0（116,293）；tz8 missing 0；ai9t 同前（401／站內）。
- t_sched922 ready 60、maxLatency 3,033 ms；t_admlag 36 頁、ERR 0。
- 功能測試：`names34`、`st38t`、`g1_38`、`g2_38`、`g3_38`、`g3b_38`、`g5_38`（含 BAD=1／BAD2=1）、`g6_38`、`n2_38`、`pet38`、`dh38`、`cx38`、`pdf38t`、`pdf38g` 全部 exit 0、ERR []。
