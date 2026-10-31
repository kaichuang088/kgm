# 1010A：冬夏季時刻差（短程至少 15 分）、成田／羽田 3h05、KX20 3h30、KX107／KX108 提早 1.5 小時，以及連帶順延的航段。
#   每一格的新值都取自網站（1010A）實際班表；edits_1010A.json 由「1009B 網站班表 ↔ 1009B PDF」逐列比對產生，
#   只改 1009B 時 PDF 與網站一致、而 1010A 網站有變動的格子（原本就不一致的 17 列照舊不動）。
import re, json, os
out = fitz.open()
if PHASE == 2: out.insert_pdf(src)
ident = lambda y: y
def rebuild(pno):
    global CUR
    CUR = pno
    if PHASE == 1: return Dummy()
    out.delete_page(pno)
    pg = out.new_page(pno, width=src[pno].rect.width, height=src[pno].rect.height)
    pg.show_pdf_page(pg.rect, clean_src(pno, src[pno].rect, list(REDACT.get((pno, pno), []))), 0)
    return pg
def row_find_t(pno, col, code, per, old):
    """同一欄可能有兩列同班號同期間（例：KX24），以舊時刻確認是哪一列"""
    ss = [s for s in sp_of(pno) if col_of(s["bbox"][0]) == col]
    for h in [s for s in ss if s["text"].strip() == code and s["font"].endswith("Bold")]:
        yc = (h["bbox"][1] + h["bbox"][3]) / 2
        row = [s for s in ss if abs((s["bbox"][1] + s["bbox"][3]) / 2 - yc) < 3.2]
        if any(s["text"].strip() == per for s in row) and any(old in s["text"] for s in row):
            sp = seps(pno, col)
            top = max([y1 for k, y0, y1 in sp if y1 < yc - 2] or [R0])
            bot = min([y1 for k, y0, y1 in sp if k == "sep" and y0 > yc])
            return {"yc": yc, "spans": row, "top": top, "bot": bot, "pno": pno}
    raise SystemExit("row not found p%d %s %s %s" % (pno + 1, code, per, old))
def T10(pg, pno, col, code, per, old, t, sup):
    row = row_find_t(pno, col, code, per, old)
    tsp = [s for s in row["spans"] if old in s["text"]]
    if tsp and tsp[0]["text"].strip() != old:     # 時刻與機型寫在同一個 span：只換時刻那一段
        sp = tsp[0]; u = fitz.Rect(sp["bbox"])
        if PHASE == 1:
            REDACT.setdefault((CUR, row["pno"]), []).append((fitz.Rect(u.x0 - 0.4, u.y0 - 0.4, u.x0 + text_w(old, "reg", sp["size"]) + 0.3, u.y1 + 0.3), True)); return
        put_text(pg, u.x0, sp["origin"][1], t, "reg", sp["size"], INK); return
    edit_cell(pg, row, col, "time", t, ident, sup=sup or None)
EDITS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else ".", "edits_1010A.json"), encoding="utf-8"))
EDITS.append({"pno": 16, "col": 1, "code": "KX 31", "per": W_, "old": "23:00-03:45", "new": "23:30-04:15", "sup": "+2"})
# KX240／KX239 峇里島（使用者指定）：冬季 KX240 01:05-06:05；夏季兩班機型 B78X（只有冬季才是 A21N/B78X）
EDITS.append({"pno": 9, "col": 0, "code": "KX 240", "per": W_, "old": "01:05-05:55", "new": "01:05-06:05", "sup": ""})
for _c, _col, _per, _t in (("KX 240", 0, S_, "18:45-23:45"), ("KX 239", 1, S_, "07:20-12:30"), ("KX 239", 1, W_, "07:35-12:50")):   # 0928A 疊在上面的字位置偏右，跟同欄其他列對齊
    EDITS.append({"pno": 9, "col": _col, "code": _c, "per": _per, "old": _t, "new": _t, "sup": ""})   # 溫哥華中停 75 分，冬季後段跟著前段晚 15 分
# 區段標題上的飛行時間範圍（白字），依網站實際飛行時間重算；靠右對齊原位置
HEADS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else ".", "headers_1010A.json"), encoding="utf-8"))
def HD10(pg, h):
    x0, y0, x1, y1, ox, oy = h["bboxes"][0]
    if PHASE == 1:
        REDACT.setdefault((CUR, h["pno"]), []).append((fitz.Rect(x0 - 0.5, y0 - 0.4, x1 + 0.5, y1 + 0.3), True)); return
    put_text(pg, x1 - text_w(h["new"], "bold", h["size"]), oy, h["new"], "bold", h["size"], WHITE)
# 1010A #6：常態機型調整（網站 r143 機型指定）：新加坡 KX282/281、宿霧 KX260/259、峴港 KX272/271 A339L → B78X；
#   名古屋 KX154/153 A339R → B78X；西雅圖 KX24/23 A35K → B779。該班號在這一欄的每一列（夏／冬、不同班期）都換。
TYPES = [(13, 0, "KX 282", "A339L", "B78X"), (13, 1, "KX 281", "A339L", "B78X"),
         (11, 0, "KX 260", "A339L", "B78X"), (11, 1, "KX 259", "A339L", "B78X"),
         (10, 0, "KX 272", "A339L", "B78X"), (10, 1, "KX 271", "A339L", "B78X"),
         (2, 0, "KX 154", "A339R", "B78X"), (2, 1, "KX 153", "A339R", "B78X"),
         (15, 0, "KX 24", "A35K", "B779"), (15, 1, "KX 23", "A35K", "B779"),
         (9, 0, "KX 240", "A21N/B78X", "B78X", S_), (9, 1, "KX 239", "A21N/B78X", "B78X", S_)]
def TYP10(pg, pno, col, code, old, new, per=None):
    ss = [s for s in sp_of(pno) if col_of(s["bbox"][0]) == col]
    hits = 0
    for h in [s for s in ss if s["text"].strip() == code and s["font"].endswith("Bold")]:
        yc = (h["bbox"][1] + h["bbox"][3]) / 2
        if per and not any(s["text"].strip() == per for s in ss if abs((s["bbox"][1] + s["bbox"][3]) / 2 - yc) < 3.2): continue
        for sp in [s for s in ss if abs((s["bbox"][1] + s["bbox"][3]) / 2 - yc) < 3.2 and s["text"].strip() == old]:
            hits += 1; u = fitz.Rect(sp["bbox"])
            if PHASE == 1:
                REDACT.setdefault((CUR, pno), []).append((fitz.Rect(u.x0 - 0.6, u.y0 - 0.4, u.x1 + 0.6, u.y1 + 0.3), True)); continue
            f, size, color = CELLFONT["type"]
            cs = sorted((t["bbox"][0] + t["bbox"][2]) / 2 for t in ss if re.match(r"^(A|B)\d[\dA-Z]*$", t["text"].strip()) and t["font"] == "LiberationSans")
            cx = cs[len(cs) // 2] if cs else (u.x0 + u.x1) / 2   # 原檔機型欄是置中：用同一欄其他列的中線
            x = cx - text_w(new, f, size) / 2
            put_text(pg, x, sp["origin"][1], new, f, size, color)
    if not hits: raise SystemExit("type span not found p%d %s %s" % (pno + 1, code, old))
for pno in sorted(set(e["pno"] for e in EDITS) | set(h["pno"] for h in HEADS) | set(t[0] for t in TYPES)):
    pg = rebuild(pno)
    for e in [x for x in EDITS if x["pno"] == pno]:
        T10(pg, pno, e["col"], e["code"], e["per"], e["old"], e["new"], e["sup"])
    for h in [x for x in HEADS if x["pno"] == pno]:
        HD10(pg, h)
    for t in [x for x in TYPES if x[0] == pno]:
        TYP10(pg, *t)
if PHASE == 2:
    out.set_metadata(dict(src.metadata, modDate=fitz.get_pdf_now(), title=src.metadata.get("title", "")))
    out.save(OUT, garbage=4, deflate=True, clean=True)
    print("saved", OUT, out.page_count)
