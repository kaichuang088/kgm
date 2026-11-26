import re
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


# ── 1006A（第二輪）：#46 第五航權中停一律 75 分、#18 A339 航線改派 B779／A35K／A339L ──────────────
#   時刻一律取網站（1006A）實際班表；中停那一段只平移起飛與抵達，飛行時間不變。
def edit_span(page, row, col, old, new, mapy):
    """整個 span 換字（機型寫成「A339L/B789」時會跨進時刻欄，不能用 edit_cell 的欄位判斷）"""
    ss = [s for s in row["spans"] if s["text"].strip() == old]
    if not ss: raise SystemExit("span not found %s p%d" % (old, row["pno"] + 1))
    sp = ss[-1]; u = fitz.Rect(sp["bbox"])
    if PHASE == 1:
        REDACT.setdefault((CUR, row["pno"]), []).append((fitz.Rect(u.x0 - 0.6, u.y0 - 0.4, u.x1 + 0.6, u.y1 + 0.3), True)); return
    f, size, color = CELLFONT["type"]
    cx = (u.x0 + u.x1) / 2
    put_text(page, cx - text_w(new, f, size) / 2, mapy(sp["origin"][1]), new, f, size, color)
def T6(pg, pno, col, code, per, t, mapy, sup=None):
    row = row_find(pno, col, code, per)
    extra = [x for x in row["spans"] if cell_of(x, col) == "time" and x["font"] != "Helvetica"
             and not re.match(r"^(\d\d:\d\d-\d\d:\d\d|[+-]\d)$", x["text"].strip())]
    has_sup = any(re.match(r"^[+-]\d$", x["text"].strip()) for x in row["spans"])
    if extra and (sup is None or has_sup):      # 機型寫進時刻欄的列（例 KX82「A359/B789」）：只換時刻那段，機型與上標不動
        return T6s(pg, pno, col, code, per, t, mapy)
    edit_cell(pg, row, col, "time", t, mapy, sup=sup)
def T6s(pg, pno, col, code, per, t, mapy):
    """只換時刻那一段（原檔「時刻＋機型」寫在同一格、機型跨進時刻欄的列，例如 KX49／KX50 的 B789/B78X），上標 +1 與機型不動"""
    row = row_find(pno, col, code, per)
    old = [s["text"].strip() for s in row["spans"] if re.match(r"^\d\d:\d\d-\d\d:\d\d$", s["text"].strip()) and s["font"] != "Helvetica"][-1]
    ss = [s for s in row["spans"] if s["text"].strip() == old]
    sp = ss[-1]; u = fitz.Rect(sp["bbox"])
    if PHASE == 1:
        REDACT.setdefault((CUR, row["pno"]), []).append((fitz.Rect(u.x0 - 0.4, u.y0 - 0.4, u.x1 - 0.8, u.y1 + 0.3), True)); return   # 右緣內縮：緊貼在後面的上標「+1」不能一起刪掉
    f, size, color = CELLFONT["time"]
    put_text(page_of(pg), u.x0, mapy(sp["origin"][1]), t, f, size, color)
def page_of(pg): return pg
def TY6(pg, pno, col, code, old, new, mapy):
    for per in (S_, W_): edit_span(pg, row_find(pno, col, code, per), col, old, new, mapy)

# ════ p10（index 9）右欄：KX237 峇里島→台北 ═════════════════════
pg = rebuild(9, cols=())
for per, t in ((S_, "14:05-18:55"), (W_, "14:55-19:50")):
    r = row_find(9, 1, "KX 237", per)
    edit_cell(pg, r, 1, "time", t, lambda y: y)
T6(pg, 9, 1, "KX 59", W_, "07:00-11:10", lambda y: y)   # 1006A #46：吉隆坡中停 75 分、回台北 07:00 起飛

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

m4R = lambda y: R.map(4, y)
T6(pg, 4, 1, "KX 19", S_, "12:05-14:05", m4R); T6(pg, 4, 1, "KX 19", W_, "11:30-13:20", m4R)   # 1006A #46：成田中停 75 分

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
for r, t in ((a43, "07:25-08:30"), (b43, "08:40-09:40")):   # 1006A #46：夏季中停 75 分（首爾 07:25 起飛）
    edit_cell(pg, r, 1, "time", t, m43); edit_cell(pg, r, 1, "days", DAYS([1,3,6]), m43)

# ════ p8（index 7）上海：移除 KX302／KX301 ═══════════════════════
pg = rebuild(7)
L = Col(pg, 0)
a = row_find(7, 0, "KX 302", S_); b = row_find(7, 0, "KX 302", W_)
L.put(7, R0, a["top"]); L.put(7, b["bot"], cbot(7, 0))
R = Col(pg, 1)
a = row_find(7, 1, "KX 301", S_); b = row_find(7, 1, "KX 301", W_)
R.put(7, R0, a["top"]); R.put(7, b["bot"], cbot(7, 1))
m7R = lambda y: R.map(7, y)
T6(pg, 7, 1, "KX 303", S_, "07:25-08:40", m7R); T6(pg, 7, 1, "KX 303", W_, "08:55-10:15", m7R)   # 1006A #46：浦東中停 75 分

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
for per, t in ((S_, "23:30-18:50"), (W_, "23:10-17:45")):   # 1006A #46：仁川中停 75 分
    r = row_find(23, 0, "KX 44", per)
    edit_cell(pg, r, 0, "time", t, ident); edit_cell(pg, r, 0, "days", DAYS([1,4,6]), ident)
for per, t in ((S_, "01:20-06:10"), (W_, "01:20-07:25")):
    r = row_find(23, 1, "KX 43", per)
    edit_cell(pg, r, 1, "time", t, ident, sup="+1"); edit_cell(pg, r, 1, "days", DAYS([2,5,7]), ident)

# 加拿大線（本輪 #66：KX29／KX30 續飛改成同一天，不再在溫哥華空等 25 小時）
for per, t, sup, ds in ((S_, "22:25-05:35", "+1", [1,3,5,7]), (W_, "00:05-07:00", None, None)):   # 1006A #46：溫哥華中停 75 分
    r = row_find(23, 0, "KX 30", per)
    edit_cell(pg, r, 0, "time", t, ident, sup=sup)
    if ds: edit_cell(pg, r, 0, "days", DAYS(ds), ident)
edit_cell(pg, row_find(23, 1, "KX 29", W_), 1, "time", "08:25-10:15", ident)
# 1006A #46：第五航權後段（中停 75 分）
T6(pg, 23, 0, "KX 304", S_, "11:45-15:10", ident); T6(pg, 23, 0, "KX 304", W_, "11:30-15:30", ident)
T6(pg, 23, 0, "KX 20", S_, "15:40-04:35", ident); T6(pg, 23, 0, "KX 20", W_, "14:45-04:10", ident)
T6(pg, 23, 0, "KX 60", S_, "12:25-22:05", ident); T6(pg, 23, 0, "KX 60", W_, "12:45-22:55", ident)
T6(pg, 23, 0, "KX 54", S_, "12:55-14:15", ident); T6(pg, 23, 0, "KX 54", W_, "12:00-13:10", ident)
T6(pg, 23, 0, "KX 32", S_, "07:15-14:25", ident); T6(pg, 23, 0, "KX 32", W_, "08:55-15:55", ident)
T6(pg, 23, 1, "KX 59", S_, "00:20-05:45", ident); T6(pg, 23, 1, "KX 59", W_, "23:50-05:45", ident, sup="+1")
# 1006A #18：KX53／KX54 墨爾本—伯斯改 A35K
TY6(pg, 23, 0, "KX 54", "A339L", "A35K", ident); TY6(pg, 23, 1, "KX 53", "A339L", "A35K", ident)

# ════ p17（index 16）美洲右欄：KX29 溫哥華→台北 ═════════════════════
pg = rebuild(16, cols=())
for per, t in ((S_, "11:25-15:25"), (W_, "11:30-16:15")):   # 1006A #46：溫哥華中停 75 分
    r = row_find(16, 1, "KX 29", per)
    edit_cell(pg, r, 1, "time", t, ident, sup="+1"); edit_cell(pg, r, 1, "days", DAYS([1,2,4,6]), ident)
for per, t in ((S_, "22:55-03:55"), (W_, "23:00-03:45")):   # 1006A #46：KX31 溫哥華中停 75 分（飛行時間與原 PDF 相同）
    T6(pg, 16, 1, "KX 31", per, t, ident, sup="+2")

# ════ p13（index 12）右欄：KX75 曼谷→台北冬季（站內第五航權中停 90 分規則；原本網站在 10:25／11:10 兩組值之間來回跳） ══
pg = rebuild(12, cols=())
edit_cell(pg, row_find(12, 1, "KX 75", W_), 1, "time", "10:10-14:20", ident)   # 1006A #46：中停 75 分
# 1006A #46：曼谷→台北（第五航權後段，中停 75 分）
for code, ts, tw in (("KX 85", "07:10-11:35", "07:15-11:25"), ("KX 61", "07:50-12:00", "08:05-12:10"), ("KX 73", "07:50-12:00", "09:30-13:25"),
                     ("KX 67", "09:45-14:10", "10:10-14:20"), ("KX 71", "13:15-17:40", "12:45-16:55"), ("KX 77", "15:25-19:50", "15:40-20:00"),
                     ):
    T6(pg, 12, 1, code, S_, ts, ident); T6(pg, 12, 1, code, W_, tw, ident)
T6s(pg, 12, 1, "KX 49", S_, "16:50-21:15", ident); T6s(pg, 12, 1, "KX 49", W_, "18:25-22:35", ident)
T6(pg, 12, 1, "KX 75", S_, "11:40-16:05", ident)
# 1006A #18：清邁 A339R → A339L
TY6(pg, 12, 0, "KX 264", "A339R", "A339L", ident); TY6(pg, 12, 1, "KX 263", "A339R", "A339L", ident)


# ════ 1006A（第二輪）其餘各頁 ═══════════════════════════════════
# p11（index 10）馬尼拉：KX272／KX271 A339R → A339L
pg = rebuild(10, cols=())
TY6(pg, 10, 0, "KX 272", "A339R", "A339L", ident); TY6(pg, 10, 1, "KX 271", "A339R", "A339L", ident)
# p12（index 11）宿霧：KX260／262／261／259 A339R → A339L
pg = rebuild(11, cols=())
for c in ("KX 260", "KX 262"): TY6(pg, 11, 0, c, "A339R", "A339L", ident)
for c in ("KX 261", "KX 259"): TY6(pg, 11, 1, c, "A339R", "A339L", ident)
# p14（index 13）新加坡／檳城：A339R → A339L
pg = rebuild(13, cols=())
for c in ("KX 278", "KX 282", "KX 290"): TY6(pg, 13, 0, c, "A339R", "A339L", ident)
for c in ("KX 289", "KX 277", "KX 281"): TY6(pg, 13, 1, c, "A339R", "A339L", ident)
# p15（index 14）澳洲：KX54／KX53 改 A35K；KX53 墨爾本中停 75 分；KX51 雪梨→台北（雪梨中停 75 分，與網站一致）
pg = rebuild(14, cols=())
TY6(pg, 14, 0, "KX 54", "A339L", "A35K", ident); TY6(pg, 14, 1, "KX 53", "A339L", "A35K", ident)
T6(pg, 14, 1, "KX 53", S_, "22:55-05:35", ident, sup="+1"); T6(pg, 14, 1, "KX 53", W_, "23:25-05:30", ident, sup="+1")
T6(pg, 14, 1, "KX 51", S_, "19:40-00:10", ident, sup="+1"); T6(pg, 14, 1, "KX 51", W_, "18:20-22:55", ident)
# p18（index 17）布達佩斯：KX80／KX79 A339L/B789 → B779/B789
pg = rebuild(17, cols=())
TY6(pg, 17, 0, "KX 80", "A339L/B789", "B779/B789", ident); TY6(pg, 17, 1, "KX 79", "A339L/B789", "B779/B789", ident)
# p19（index 18）華沙、維也納、赫爾辛基 A339L → B779；KX81 雅典→台北（雅典中停 75 分）
pg = rebuild(18, cols=())
for c in ("KX 90", "KX 94", "KX 98"): TY6(pg, 18, 0, c, "A339L", "B779", ident)
for c in ("KX 89", "KX 93", "KX 97"): TY6(pg, 18, 1, c, "A339L", "B779", ident)
T6(pg, 18, 1, "KX 81", S_, "12:00-04:15", ident, sup="+1"); T6(pg, 18, 1, "KX 81", W_, "11:00-04:00", ident, sup="+1")
# p22（index 21）第五航權後段（一）
pg = rebuild(21, cols=())
for code, ts, tw in (("KX 76", "11:05-17:40", "11:25-17:15"), ("KX 82", "08:30-12:10", "10:10-13:10"),
                     ("KX 74", "00:20-06:50", "00:40-07:55"), ("KX 86", "02:20-08:40", "02:40-08:15")):
    T6(pg, 21, 0, code, S_, ts, ident); T6(pg, 21, 0, code, W_, tw, ident)
T6(pg, 21, 0, "KX 52", S_, "10:30-15:35", ident)            # 雪梨→奧克蘭（夏季）
T6(pg, 21, 1, "KX 51", S_, "17:00-18:25", ident)            # 奧克蘭→雪梨（夏季）
# p23（index 22）第五航權後段（二）
pg = rebuild(22, cols=())
for code, ts, tw in (("KX 68", "11:20-16:40", "11:40-17:35"), ("KX 62", "00:25-06:10", "00:45-07:15"),
                     ("KX 78", "14:00-19:35", "14:20-20:40"), ("KX 72", "12:45-18:25", "13:05-18:00")):
    T6(pg, 22, 0, code, S_, ts, ident); T6(pg, 22, 0, code, W_, tw, ident)
T6s(pg, 22, 0, "KX 50", S_, "18:10-06:10", ident); T6s(pg, 22, 0, "KX 50", W_, "18:30-07:10", ident)
T6(pg, 22, 0, "KX 52", W_, "09:20-13:10", ident)            # 雪梨→基督城（冬季）
T6(pg, 22, 1, "KX 51", W_, "15:40-17:05", ident)            # 基督城→雪梨（冬季）

if PHASE == 2:
    out.set_metadata(dict(src.metadata, modDate=fitz.get_pdf_now(), title=src.metadata.get("title", "")))
    out.save(OUT, garbage=4, deflate=True, clean=True)
    print("saved", OUT, out.page_count)
