# 0923B · pass 102 notes

Base: 0923A. Same single HTML file, 241 `<script id>` layers (unchanged). No new layers; all edits in place.

## User list for this pass
「還沒做：Residence 競標那三件（還是重現不出「已選航班消失」）、信用卡頁改版、後台其他分頁的卡頓我還沒逐頁量、機隊 74 架空機等你決定縮機隊還是改派飛器。補一個AI有的時候一進去不會有圖是，然後profile我的案件也還沒修正」

## 1. Residence (three items)
**Root cause of the lost flight (reproduced):** `cleanCabin161()` in the r161 sweeper wipes any segment whose fare code starts with `R` when the search cabin isn't `Resident`. The old finish forced `R-R`, so once the user went back to booking, the sweeper erased the segment. The old submit never selected a flight either.
- `cleanCabin161` keeps a segment when it is held by an open bid recorded in `S.resBidSegR923[seg]` (same code and date).
- `kgmResCashSubmitR161` (live, r182 layer): on a successful bid, the segment is selected at the fallback fare (`ap.code`), or `R-R` for the "refund" fallback. It records `S.resBidSegR923`, plus `bid.fallbackCodeR923`, `fallbackPriceR923`, `segR923` and `payWithBookingR923`. The alert states the amount charged now, the difference owed if the bid wins, the same-card rule, and the result date. A mocked audit bid with no id does not change the selection.
- `kgmResFinishR161` keeps both segments and moves to `sel_inb` or `pax`.
- Step 3 after the inbound bid no longer offers "選這一段" for the same flight.
- Price labels = actual checkout. The r0826A stay multiplier was moved into `window.kgmStayMul0826A()`, and the option labels, alt box and alert all use it. The held refund segment is charged the bid amount: the outermost `owPrice` (f182) returns the bid for `R-R` when `kgmResHeldBidR923(f)` matches, and the stay multiplier is not applied to it.
- Payment (`installPay922` wrapper): reads the last 4 digits of `#cnum`. After the booking is created it tags the bids with `cardLast4R923`, `paidWithBookingR923` and the PNR, sets `bk.resBidsR923`, and clears `S.resBidSegR923`. It also sets `bk.cardLast4`; the receipt used to always show •••• 0000.
- Settlement (`kgmResSettleR161`): for a win, the segment becomes `R-R` and the difference is added to `bk.total` on the same card (`bk.resChargesR923`). A lost "refund" bid goes to `cancelledSegsR60` plus `refundsR60`. A lost fallback bid keeps its segment.
- Live test (t_res9c): KX4 B-K NT$118,496 plus KX3 refund bid NT$250,000 = NT$368,496 at payment. After payment both segments are present and both bids carry card 4242 and the PNR. Settling both as wins gives a total of NT$530,000 = 280,000 + 250,000.

## 2. Credit card page (圖7)
`kgmCardFormR923()` sits before `payView`. On the left: card preview (brand detected from the number, live number, name and expiry). On the right: card number (auto-spaced), expiry month and year selects feeding a hidden `#cexp`, CVV, and cardholder name. Cardholder contact fields (email, country code, phone) are prefilled. Brand chips and an SSL line are included. The consent rows are full width with a big 確認付款 button. Field ids are unchanged. Values survive a re-render through an in-memory draft; CVV is never kept. Checked at 390px with no horizontal scroll. `kgmPayResNoteR923()` shows the Residence lines in 訂單摘要.

## 3. Backend lag (measured on every tab, 27 tabs)
Causes found and fixed:
- `badge189` / `hotelGate189`: scanned every `#app` node 3× after each render. Now they skip admin, with a text precheck on the front end.
- `reconcileAcftSubs`: called on every admin render and was O(days×tails×legs×FLIGHTS). Now indexed; the output was verified identical.
- Auctions: rendered all 1,199 BigDeal + 114 Residence groups (65k nodes, 1.6 MB). Now paged at 12 per column with 顯示更多 (+24), date-sorted, and reset on search.
- Feedback first visit: computed 21 crew plans synchronously. Crew names are now filled in idle slices (`fillCrewK923`), stepping the crew cursor 100 ms at a time.
- Crew schedule: the first plan is warmed in idle slices (`kgmCrewWarmR923`) with a placeholder. `buildStep196` defers; `slice922` pauses off-tab and backs off; the r211 interval resumes it.
- AI windows H, I and J rebuilt their contents on every render while closed (0.3–0.4 s each). They now build only when open. The conversation objects are still created (keeps R139 chatId).
- `assignedTo69`: per-call full scan. Now a per-tick index with a length stamp, invalidated on add/remove/rebuild.
- `legsOf` (r168): the sort key is computed once.
- `kgmDedupR131`: skipped when fleet assignments are unchanged, with a full pass every 60 s; the audit forces it.
- `aiCrewSchedule` (legacy S.crewSched, runs on the first admin entry each day): flyOn/_fUTC recomputed per crew×day×pool, 6.6 s single task. Now a per-day pool; output identical (compared JSON, n=15,425), 1.3 s.
- Crew cache invalidation extracted to `inval121()`. `kgmCrewHasDayR121` and `kgmCrewStepR121` run it with a stamp-only check, so a stale cache never forces a synchronous 12 s rebuild.
- AI draw functions no longer read `scrollHeight` while closed (that forced a full-page reflow on every render).

Measured with t_admlag (fresh session, sync render ms, before → after): sched 6,201 → 310; feedback 3,951 → 179; auctions 2,000 (+2.6 s layout, 5.6 s to paint) → 770 (0.86 s to paint); staff 811 → ~400. All other tabs ≤ 550.
t_sched922 (after entering 組員班表): blocking 6,590 → 320 ms; 60 days ready in 23 s (0923A: 22 s); p50 round trip 203 ms (0923A: 257).

## 4. AI icon
Verified again: exactly one `#kgmAiG139`, not inside a hidden subtree (vfy6 H13).

## 5. Profile 我的案件
Verified again: nav on one row (6 tabs), and the upgrade case is listed (vfy6 H12).

## Not changed
- Fleet: 74 tails with ≥7 blank days. Still waiting for the user to choose between shrinking the fleet and changing the dispatcher.
- Found but left alone (outside the list): with the AI window open, any render swaps the visible content back to the H/J welcome, so the thread disappears from view (it is still stored). Pre-existing in 0923A.

## Gates (final file)
- syn 248 scripts / 0 errors; 241 layers; 0923A→0923B at 166 sites (17 remaining "0923A" are history comments).
- vfy1 24/24, vfy2 8/8, vfy3 8/8 (R1: sched 287 ms, auctions 526 ms), vfy4 8/8, vfy5 6/6, vfy6 35/35 (new H12–H16).
- reg2: 192 validators, ok 114, notOk 78, identical notOk set to reg_L, 0 page errors, 0 view errors. (An intermediate run showed R139 flipping; cause was the AI conversation object no longer being created while closed. Fixed and re-verified.)
- t_crewrule: 80 people, 760 legs, 0 two-leg days, 0 flights the day after a long-haul, 0 planner violations.
- t_res9c: Residence flow end to end (bid → both segments → pay → card tag → settle), as described above.
- vfy2 caught a regression from the new card form (typing CVV cleared a programmatically filled #cexp); fixed so only the month/year selects rewrite #cexp.
- In this sandbox the booking-confirmation mail throws "三種傳輸方式都無法連線到寄信服務" (the Worker domain is blocked here). Pre-existing unhandled `.then` in the mail hooks; not changed.
