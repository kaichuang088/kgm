# 1118A 技術筆記（pass141）

建置：同一套 `patches/1101A`（`cd patches/1101A && set -o pipefail; python3 gen_r28.py | tail -1 && bash build.sh <1004B.html> <out.html>`），版號 1118A（`p_h_ver*.js`）。
gen 新 RW 都在 `# ══ 1118A ══`（`# ══ 新長程式嵌入 ══` 之前），程式標 R1118A；新長程式 `js/fc118.js`（機隊排班沿用）、`js/pc118.js`（寵物報到檢查）；改既有的 `js/cx38.js`（許願總表、外站停留許願）、`js/cs42.js`（提出案件分頁）、`js/pdf38.js`（航班資料 PDF）。
逐項見 `notes/1118A-todo.md`。

## G5 後台卡頓 —— 這輪找到的根因（都用 CDP profile 量到）
量法：`/tmp/j/prof118.js`（同一個瀏覽器先開一次等機隊＋組員都存好，再重新整理，profile 頭 SEC 秒，依自身時間／入口函式彙總）；`/tmp/j/rest118.js`（三次開頁看機隊沿用／組員讀回）；`/tmp/j/fc118t.js`；`/tmp/j/tad118.js`（機隊完成後誰在改 S.tailAssign）；`/tmp/j/rld118.js`（第一次開頁 vs 重新整理，機隊哪幾架不同、sig72 哪一段不同）。

1. **組員存檔指紋把航段順序算進去**：機隊完成後約 110 秒有背景程式把 115 架的航段重新排序（內容不變），`sig25` 的 TAH 逐段串接 → 指紋變 → 重新整理後 `why:'sig'`。修：每架的航段字串排序後再雜湊（gen `crew sig order R1118A`）。
2. **整年重排輸入指紋 sig72 的「沒有資料」跟「空物件」不同**：第一次開頁 `S.fleetRetiredR928` 是 undefined、重新整理後讀回 `{}` → 指紋不同（gen `sig72 empty*`：tailStatus、fleetAdded、fleetRetired、fleetMaintenance、customFlights 空值一律當 0）。
3. **第一次開頁跟重新整理算出來的整年機隊排班不同（59 架）**：存檔狀態不同造成，不是隨機。不去追每個輸入，改成**沿用**：`js/fc118.js`
   - 整年重排完成、A35K 輪替跑完、機隊 60 秒沒變、輸入指紋跟整年重排那時相同、閒置 7 天以上 0 架 → 把整份 `S.tailAssign`（196 架、11.6 萬段、JSON 19 MB）分段序列化（每段 40 ms，共約 0.2 秒主執行緒）存進 IndexedDB `kgm118_fleet`（plan＝每架一個 JSON 字串、meta＝day／build／sig／bootSigs／ROT_SUM）。
   - **組員班表一存檔（`KGM_CREW_SAVE_R1025B` 變），機隊也跟著再存一次**（兩份描述同一個排班；只靠「60 秒沒變」那次存，偶爾組員存檔時機隊又動過 → 下次組員讀不回來，profile 量到過）。
   - 開頁 2.6 秒（r72 初排計時器）：`kgmFleetCacheBootR1118A()` 算 sig72（約 3 ms），在 meta.bootSigs 裡 → 放上存好的排班、跳過 60 天初排（原本分段 10～13 秒）。
   - 20 秒（整年重排 prep6 算完 sig6 之後）：`kgmFleetCacheFinalR1118A(sig6)` 跟 meta.sig 相同 → 再 parse 一次放上（蓋掉舊層在這之間寫的）、設 `KGM_ROT_FINAL_R913`／`KGM_FULLDONE_1006A`／`KGM_A35_FD_R1115B`（A35K 已在存好的排班裡）、清輪轉快取、組員重設；不同 → 照原本整年重排。這次開頁的初排指紋沒記過就補進 bootSigs（下次 2.6 秒就能用）。
   - 不同天（sig 含 T()）、不同版本（BUILD）、改了人工換機／維修／機隊／自建航班／時刻 → 指紋不同 → 照原本重算並重新存。
   - 實測（`rest118.js`）：第一次開頁存好 → 重新整理兩次都是 boot hit（0.05 秒）＋final hit（0.08 秒）＋組員讀回 ok。
4. **艙單 DH 列查訂位是訂位數的平方**：`dhRows929` 檢查 DH 訂位在不在時 `S.bookings.some(x=>x.pnr===dhPnr929(...))` —— 每一筆訂位都重算一次 DH 代號，而 `dhPnr4` 又掃一次全部訂位；背景預補競標（未來 10 天每一班）→ BigDeal → Payload → 艙單 → 這裡，profile 量到 37 秒裡約 23 秒。修：訂位代號索引 `window.kgmBkPnrR1118A(pnr)`（S.bookings 換陣列、筆數或最後一筆變了才重建；結果跟逐筆掃相同），dhRows929／dhPnr4／BigDeal curCls 改用（gen `bk pnr idx`、`dh had idx`、`dh pnr4 idx`、`bd curcls idx`）。
5. 結果（profile，重新整理後、沒有任何操作的頭 60 秒主執行緒忙碌時間）：機隊沿用＋組員讀回時 41 秒（其中組員 IndexedDB 讀回 2.2 秒、背景競標預補 5.2 秒、組員班表索引 4.6 秒、舊層機隊開機步驟約 7.5 秒）；組員讀不回來時 57 秒（組員引擎 60 天）。
   真實滑鼠操作的點擊延遲見下面「ux43」。

### 沒修好的
- **全新瀏覽器（沒有任何存檔）第一次開頁，機隊排班常掉進「30 多架閒置 7 天以上」的差版本**（今天 4 次全新開頁 3 次；重新整理（有存檔）後都正常）。fc118 只存閒置 0 架的版本，所以差版本不會被沿用；但那一次開頁本身的機隊是差的。原因沒找到（跟存檔狀態有關，不是隨機）。
- 舊層開機機隊步驟（`_assignEQV`、`aiCrewSchedule`、`_fleetAssignV3`、`_subPass`，約 7 秒）沿用時照樣跑（結果被蓋掉），沒動：它們會順便設別的狀態，不敢跳過。

## G6 Residence 都是里程
1006A 起「四班留一班只有里程出價」（`seed%4`，1115A 改高位元）→ 拿掉，每班都有現金出價（改在 1115A 那條 RW `res mock cash gate R1115A` 裡）。舊資料只有里程的班：下一次補資料（開頁後背景預補或打開競標頁）補上現金。實測刪掉 KX7 12-07 的現金出價 → 重新整理 → 補回 2 筆。Residence 本來沒有「同一筆出價現金＋里程」這種，混合＝同一班有現金也有里程出價（BigDeal 才有現金＋里程）。

## G3 寵物報到檢查（js/pc118.js）
- 報到視窗 `checkinWizard49` 的警示下面插 `kgmPetCiHtmlR1118A(c)`（gen `ci pet panel R1118A`）；寵物來源 `kgmPetsOnFlightR1108A`（航班資料名單同一份）。PNR 對不上時用姓名對（寵物申請姓名有「LAST/FIRST」和「LAST FIRST」兩種，比對前拿掉空白和斜線）。
- **模擬寵物的「是哪位旅客」是航班資料頁畫的時候才綁的（kgmPetBindR1108A），沒打開過那班的航班資料頁時，同一隻寵物可能綁在別的旅客** —— 測試要先畫航班資料頁再找旅客。
- 報到視窗是單獨重畫的（ci31），一般 render() 不更新它 → 記錄／重新檢查後寵物區塊就地換（`repaint()`）。
- 按鈕在 r197「可註解」頁面不攔截清單（.k118pc）。

## G4 航班資料 PDF（pdf38.js）
- CEO 版「航班資料頁原樣」區塊跳過 `.k23bm`（行李改運）；所有版本拿掉「附錄 旅客名單」；章節 6 每張表在「留意原因」後面加「餐點」欄（艙單 detailedMeal／meal，沒選＝「標準餐（X 艙菜單）」，特殊餐粗體）。

## G7 提出案件分頁
- `S.adminTab='newcase118'`：adminView 路由（gen `newcase tab R1118A`）＋r123 權限表沒有這個分頁 → 包一層 `kgmPermR123`（能建案件的職位＝use），不然整頁被 r123 藏掉（`data-k123hid`）。
- 機師也可以建案件（cs42 canOpen 加 pilot，預設類型「機上服務事件」）；側欄「＋ 提出案件」客服、機師也有，按了到這個分頁。
- 我的航班：組員讀 `kgmRosterR196(emp,7,true)`（UI 旗標，只讀已算好的日子）；地勤讀 `kgmGroundPlanR1008A`，沒算好的日子背景一天一天補。

## G1／G2 許願
- 許願總表只列正式組員（S.staff 機師／客艙，436 位）；`kgmCrewPoolR121` 有 2.9 萬（含引擎補人力的虛擬組員），第一版誤用。
- 外站停留估計 `kgmLayEstR1118A(f,date)`：抵達＋1350 分後最早一班飛回基地的時間（kgmFlightsOnR121，最多看 8 天）。
