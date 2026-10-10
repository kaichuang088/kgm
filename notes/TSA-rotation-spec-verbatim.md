# TSA（松山）排班規格 — 使用者原話，逐字保存

> 使用者 2026-09-13 給的原話。往後任何動到松山排班的修改，以這一份為準，不得憑記憶轉述。
> （從 claude.ai 專案「KGM」的 claude/TSA-rotation-spec-verbatim.md 匯出）

## 原文（英文，逐字）

"For TSA aircraft scheduling, please make it FIX, and I will tell you how to exchange to TPE later. I just want 3 B78X (change all scheduled aircraft to B78X for all TSA flights). One of them will fly Schedule A KX162/KX161 then KX386/KX385, another will fly Schedule B KX384/KX383 then KX164/KX163, the last one will fly Schedule C KX165(time change to 07:50-10:10) then KX150(time change to 11:35-14:55)/KX149 (timechange to 16:15-17:30) then KX166(time change to 19:20-23:10). I want like eg B-58092 fly Schedule A on Monday, fly Schedule B on Tuesday, and assigned another aircraft to fly schedule C (the aircraft flying schedule C will be running the same schedule for everyday until being exchanged). The exchange flight method for Schedule A/B is to exchange with KX167, so fly KX164 as the departure to Haneda, and for the return flight, fly KX167 from Haneda to Taipei Taoyuan. Currently, KX168/KX167 Taoyuan to Haneda will use A21N, and for updating, only the date for exchanging aircraft will use B78X for the flight exchange date, so the flight being exchanged will fly KX168 TPE-HND and KX163 HND-TSA. On the other hand, the exchange flight method for Schedule C is to exchange with the new flight listed below: KX136/KX135, so the flight departing from TSA will remain the usual flight KX166, and for the return flight, it will be KX135 from HND-TPE, and the other flight going to TSA will be flying KX136 TPE-HND and returning to TSA by KX165 HND-TSA. For exchanges, I expect A/B to exchange 1 time per month, same as C, and, like for A/B, if aircraft B-58088 was not being exchanged last month, it must be exchanged for the next month; so, for aircraft working for schedule A and B will work at TSA for 2 months (can +/- some days), and the aircraft working for schedule C will work for 1 month (can +/- some days). Please do NOT make KX168/KX167 and KX136/KX135 both B78X on the same date; at least there should be 6 days difference, and please select the dates that estimate passengers of TPE-HND will probably have more passengers on TPE-HND. Since there is an additional B78X to TSA airport and no more A21N at TSA airport, we can add one more B78X aircraft for better and smoother aircraft scheduling."

補充（使用者後續）：after this cycle of staying in TSA, the next time going to fly flights at TSA should be at least **6 months** later.

## 拆解成可驗證的規則

- R1 機型：松山所有航班一律 B78X，不再有 A21N 駐松山；機隊再加一架 B78X。
- R2 三條固定班表（FIX）：
  - A：KX162 TSA→HND → KX161 HND→TSA → KX386 TSA→SHA → KX385 SHA→TSA
  - B：KX384 TSA→SHA → KX383 SHA→TSA → KX164 TSA→HND → KX163 HND→TSA
  - C：KX165 HND→TSA（07:50-10:10）→ KX150 TSA→GMP（11:35-14:55）→ KX149 GMP→TSA（16:15-17:30）→ KX166 TSA→HND（19:20-23:10）
- R3 共 3 架 B78X 駐松山；A／B 兩架每天對調；C 那架每天都飛 C 直到被換掉。
- R4 換機走實體航班交換，不插調機段：
  - A／B：換出去的飛 KX164 TSA→HND、回程 KX167 HND→TPE；接替的飛 KX168 TPE→HND、KX163 HND→TSA。KX168／KX167 平常 A21N，只有換機當天改 B78X。
  - C：換出去的照常飛 KX166 TSA→HND、回程 KX135 HND→TPE；接替的飛 KX136 TPE→HND、KX165 HND→TSA。
- R5 A／B 每月換一次、C 每月換一次；上月沒換到的這月一定換；A／B 駐 2 個月（±幾天）、C 駐 1 個月（±幾天）；離開松山後至少 6 個月才再回。
- R6 KX168/KX167 與 KX136/KX135 不可同一天都是 B78X，至少差 6 天；換機日挑 TPE–HND 預估客量較高的日期。
