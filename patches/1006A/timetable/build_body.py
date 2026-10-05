out = fitz.open()
if PHASE == 2: out.insert_pdf(src)

def rebuild(pno, cols=(0, 1)):
    """把輸出頁 pno 換成：原頁當底（要重排的欄位，其文字先從底層刪掉），之後各欄再重疊。"""
    global CUR
    CUR = pno
    if PHASE == 1: return Dummy()
    out.delete_page(pno)
    pg = out.new_page(pno, width=src[pno].rect.width, height=src[pno].rect.height)
    reds = list(REDACT.get((pno, pno), [])) + [(fitz.Rect(HALF * c, R0, HALF * c + HALF, R1), True) for c in cols]
    pg.show_pdf_page(pg.rect, clean_src(pno, src[pno].rect, reds), 0)
    return pg

# ════ p10（index 9）右欄：KX237 峇里島→台北 ═════════════════════
pg = rebuild(9, cols=())
for per, t in ((S_, "14:05-18:55"), (W_, "14:55-19:50")):
    r = row_find(9, 1, "KX 237", per)
    edit_cell(pg, r, 1, "time", t, lambda y: y)

# ════ p5（index 4）東京：移除 KX44／KX43（改經首爾），KX188／187 改每日，KX3167 改一四日 ═══
pg = rebuild(4)
L = Col(pg, 0)
a44 = row_find(4, 0, "KX 44", S_); b44 = row_find(4, 0, "KX 44", W_)
las_note = (262.1, 280.12)       # 「FINAL DEST. LAS LAS VEGAS · KX 44 續飛」（含上方 4.5pt 間距）
L.put(4, R0, a44["top"]); L.put(4, b44["bot"], las_note[0]); L.put(4, las_note[1], cbot(4, 0))
for per in (S_, W_):
    r = row_find(4, 0, "KX 188", per); edit_cell(pg, r, 0, "days", DAYS([1,2,3,4,5,6,7]), lambda y: L.map(4, y))
R = Col(pg, 1)
a43 = row_find(4, 1, "KX 43", S_); b43 = row_find(4, 1, "KX 43", W_)
R.put(4, R0, a43["top"]); R.put(4, b43["bot"], cbot(4, 1))
for per in (S_, W_):
    r = row_find(4, 1, "KX 187", per); edit_cell(pg, r, 1, "days", DAYS([1,2,3,4,5,6,7]), lambda y: R.map(4, y))
    r = row_find(4, 1, "KX 3167", per); edit_cell(pg, r, 1, "days", DAYS([1,4,7]), lambda y: R.map(4, y))
    edit_cell(pg, r, 1, "code", "KX 199", lambda y: R.map(4, y))          # 1004A：KX3167 改為 KX199
    r = row_find(4, 0, "KX 3168", per); edit_cell(pg, r, 0, "code", "KX 200", lambda y: L.map(4, y))   # 1004A：KX3168 改為 KX200

# ════ p6（index 5）首爾 ══════════════════════════════════════
PEAK_L1 = "⚠ KX 106／KX 105 季節性航班 Seasonal — 01Oct26-30Nov26、寒假 20Jan27-15Feb27"   # 1006A：營運整個 10–11 月與寒假
PEAK_L2 = "及暑假 7–8 月營運，每週一、四、五、日四班；其餘日期不營運。"
def peak_note(page, box_top_out, x0):
    """把複製過來的 KX160／159 夏季班提醒框改寫成 KX106／105 旺季提醒（同底色、同紅字、同字級）"""
    # 與原檔 KX160／159 提醒框同一規格：淡粉底 22.5pt 高、左側 3pt 紅條
    page.draw_rect(fitz.Rect(x0 + 11.25, box_top_out, x0 + 286.5, box_top_out + 22.5), color=None, fill=(0.9922, 0.949, 0.9569), overlay=True)
    page.draw_rect(fitz.Rect(x0 + 11.25, box_top_out, x0 + 14.25, box_top_out + 22.5), color=None, fill=(0.7843, 0.0627, 0.1804), overlay=True)
    put_mixed(page, x0 + 19.99, box_top_out + 9.0, PEAK_L1, 5.24, NOTE)
    put_mixed(page, x0 + 19.99, box_top_out + 16.5, PEAK_L2, 5.24, NOTE)
pg = rebuild(5)
L = Col(pg, 0)
k110 = row_find(5, 0, "KX 110", W_)
k160 = row_find(5, 0, "KX 160", S_)
L.put(5, R0, k110["bot"])
L.put(4, a44["top"], b44["bot"])            # KX44 兩列（從東京區段搬過來，再改時間／飛行日）
L.put(4, las_note[0], las_note[1])          # 拉斯維加斯續飛說明
note_top_L = L.y + (256.5 - k160["bot"]); L.space(279.0 - k160["bot"])   # 旺季提醒框（與 KX160 提醒框同尺寸、同間距）
L.put(5, k110["bot"], cbot(5, 0))
peak_note(pg, note_top_L, 0)
ml = lambda y: L.map(5, y)
for per in (S_, W_):
    edit_cell(pg, row_find(5, 0, "KX 102", per), 0, "days", DAYS([2,4,5,7]), ml)
edit_cell(pg, row_find(5, 0, "KX 104", S_), 0, "time", "07:40-10:50", ml)
edit_cell(pg, row_find(5, 0, "KX 104", W_), 0, "time", "07:20-10:25", ml)
for per, t, p2 in ((S_, "11:20-14:30", "01Oct26-24Oct26"), (W_, "11:00-14:05", "25Oct26-30Nov26")):
    r = row_find(5, 0, "KX 106", per)
    edit_cell(pg, r, 0, "time", t, ml); edit_cell(pg, r, 0, "days", DAYS([1,4,5,7]), ml); edit_cell(pg, r, 0, "per", p2, ml)
edit_cell(pg, row_find(5, 0, "KX 108", S_), 0, "time", "15:05-18:15", ml)
edit_cell(pg, row_find(5, 0, "KX 108", W_), 0, "time", "14:45-17:50", ml)
m44 = lambda y: L.map(4, y)
for r, t in ((a44, "19:05-22:15"), (b44, "18:50-21:55")):
    edit_cell(pg, r, 0, "time", t, m44); edit_cell(pg, r, 0, "days", DAYS([1,4,6]), m44)

R = Col(pg, 1)
hdrR = [y1 for k, y0, y1 in seps(5, 1) if k == "hdr"][0]
k109 = row_find(5, 1, "KX 109", W_)
k159 = row_find(5, 1, "KX 159", S_)
R.put(5, R0, hdrR)
R.put(4, a43["top"], b43["bot"])            # KX43 兩列放在首爾→台北區段最前面（08:10 最早）
R.put(5, hdrR + 0.4, k109["bot"])   # 從色條底下 0.4pt 起，才不會把色條邊緣帶進來
note_top_R = R.y + (256.5 - k159["bot"]); R.space(279.0 - k159["bot"])
R.put(5, k109["bot"], cbot(5, 1))
peak_note(pg, note_top_R, HALF)
PLACE = R.place
def mapR(y):
    # 首爾→台北區段本體（hdrR～k109 底）在第三個區塊
    for (p, a, b, oy) in PLACE:
        if p == 5 and a <= y <= b and not (a == R0 and b == hdrR): return oy + (y - a)
    raise SystemExit("mapR")
for per in (S_, W_):
    edit_cell(pg, row_find(5, 1, "KX 101", per), 1, "days", DAYS([2,4,5,7]), mapR)
edit_cell(pg, row_find(5, 1, "KX 103", S_), 1, "time", "12:05-13:10", mapR)
edit_cell(pg, row_find(5, 1, "KX 103", W_), 1, "time", "11:40-12:40", mapR)
for per, t, p2 in ((S_, "15:35-16:40", "01Oct26-24Oct26"), (W_, "15:15-16:15", "25Oct26-30Nov26")):
    r = row_find(5, 1, "KX 105", per)
    edit_cell(pg, r, 1, "time", t, mapR); edit_cell(pg, r, 1, "days", DAYS([1,4,5,7]), mapR); edit_cell(pg, r, 1, "per", p2, mapR)
edit_cell(pg, row_find(5, 1, "KX 107", S_), 1, "time", "19:30-20:35", mapR)
edit_cell(pg, row_find(5, 1, "KX 107", W_), 1, "time", "19:05-20:05", mapR)
m43 = lambda y: R.map(4, y)
for r, t in ((a43, "08:10-09:15"), (b43, "08:40-09:40")):
    edit_cell(pg, r, 1, "time", t, m43); edit_cell(pg, r, 1, "days", DAYS([1,3,6]), m43)

# ════ p8（index 7）上海：移除 KX302／KX301 ═══════════════════════
pg = rebuild(7)
L = Col(pg, 0)
a = row_find(7, 0, "KX 302", S_); b = row_find(7, 0, "KX 302", W_)
L.put(7, R0, a["top"]); L.put(7, b["bot"], cbot(7, 0))
R = Col(pg, 1)
a = row_find(7, 1, "KX 301", S_); b = row_find(7, 1, "KX 301", W_)
R.put(7, R0, a["top"]); R.put(7, b["bot"], cbot(7, 1))

# ════ p24（index 23）第五航權：成田↔拉斯維加斯 → 仁川↔拉斯維加斯 ══════════
pg = rebuild(23, cols=())
BAR = (0.4784, 0.3608, 0.0706)
BASE = 275.25
# 左欄標題：首爾仁川 SEOUL INCHEON → 拉斯維加斯 LAS VEGAS　11h20m ~ 11h35m
if PHASE == 1:
    REDACT.setdefault((23, 23), []).extend([(fitz.Rect(15.5, 268.2, 283.0, 278.2), False), (fitz.Rect(405.8, 268.2, 581.0, 278.2), False)])
pg.draw_rect(fitz.Rect(15.5, 268.2, 283.0, 278.2), color=None, fill=BAR, overlay=True)
x = put_mixed(pg, 16.99, BASE, "首爾仁川", 6.66, WHITE, heavy=True)
x = put_mixed(pg, x, BASE, " SEOUL INCHEON", 6.66, WHITE, latin="bold")
x += 5.73; put_text(pg, x, BASE, "→", "reg", 5.95, WHITE); x += text_w("→", "reg", 5.95) + 5.65
x = put_mixed(pg, x, BASE, "拉斯維加斯", 6.66, WHITE, heavy=True)
put_mixed(pg, x, BASE, " LAS VEGAS", 6.66, WHITE, latin="bold")
d = "11h20m ~ 11h35m"; put_text(pg, 280.64 - text_w(d, "bold", 5.95), BASE, d, "bold", 5.95, WHITE)
# 右欄標題：拉斯維加斯 LAS VEGAS → 首爾仁川 SEOUL INCHEON　12h50m ~ 13h05m
pg.draw_rect(fitz.Rect(405.8, 268.2, 581.0, 278.2), color=None, fill=BAR, overlay=True)
x = put_mixed(pg, 406.96, BASE, "首爾仁川", 6.66, WHITE, heavy=True)
put_mixed(pg, x, BASE, " SEOUL INCHEON", 6.66, WHITE, latin="bold")
d = "12h50m ~ 13h05m"; put_text(pg, 578.27 - text_w(d, "bold", 5.95), BASE, d, "bold", 5.95, WHITE)
ident = lambda y: y
for per, t in ((S_, "23:45-19:05"), (W_, "23:30-18:05")):
    r = row_find(23, 0, "KX 44", per)
    edit_cell(pg, r, 0, "time", t, ident); edit_cell(pg, r, 0, "days", DAYS([1,4,6]), ident)
for per, t in ((S_, "01:20-06:10"), (W_, "01:20-07:25")):
    r = row_find(23, 1, "KX 43", per)
    edit_cell(pg, r, 1, "time", t, ident, sup="+1"); edit_cell(pg, r, 1, "days", DAYS([2,5,7]), ident)

# 加拿大線（本輪 #66：KX29／KX30 續飛改成同一天，不再在溫哥華空等 25 小時）
for per, t, sup, ds in ((S_, "22:40-05:50", "+1", [1,3,5,7]), (W_, "00:20-07:15", None, None)):
    r = row_find(23, 0, "KX 30", per)
    edit_cell(pg, r, 0, "time", t, ident, sup=sup)
    if ds: edit_cell(pg, r, 0, "days", DAYS(ds), ident)
edit_cell(pg, row_find(23, 1, "KX 29", W_), 1, "time", "08:25-10:15", ident)

# ════ p17（index 16）美洲右欄：KX29 溫哥華→台北 ═════════════════════
pg = rebuild(16, cols=())
for per, t in ((S_, "11:40-15:40"), (W_, "11:45-16:30")):
    r = row_find(16, 1, "KX 29", per)
    edit_cell(pg, r, 1, "time", t, ident, sup="+1"); edit_cell(pg, r, 1, "days", DAYS([1,2,4,6]), ident)

# ════ p13（index 12）右欄：KX75 曼谷→台北冬季（站內第五航權中停 90 分規則；原本網站在 10:25／11:10 兩組值之間來回跳） ══
pg = rebuild(12, cols=())
edit_cell(pg, row_find(12, 1, "KX 75", W_), 1, "time", "10:25-14:35", ident)

if PHASE == 2:
    out.set_metadata(dict(src.metadata, modDate=fitz.get_pdf_now(), title=src.metadata.get("title", "")))
    out.save(OUT, garbage=4, deflate=True, clean=True)
    print("saved", OUT, out.page_count)
