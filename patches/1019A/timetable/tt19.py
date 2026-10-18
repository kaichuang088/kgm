# 1019A：使用者審 00:00～02:59 抵達的班次後指定的時刻（網站 r77 定值表同一組值）：
#   「KX288/KX287都提早1-1.5小時」→ 1.5 小時；「KX212/KX211提早1.5-2小時」→ 2 小時；「KX282/KX281提早2-2.5hr」→ 2.5 小時；
#   KX37「你直接寫新時間 反正抵達台北時間最好是04:00-05:00上午」→ 夏 00:20-04:55+1、冬 00:05-04:50+1（飛行時間 15h35／15h45）；
#   「KX51提早15分鐘」→ 夏季 雪梨→台北 19:25-23:55、奧克蘭→雪梨 16:45-18:10（冬季不動）。
#   以 1018B 交付的時刻表 PDF 為底稿，只改這些格子（其他文字、位置、字型不動）；+1 不再需要的拿掉、新需要的補上；
#   波士頓→台北那一段的標題飛行時間跟著改。表內各列照班號排，不用重排。
#   用法：python3 tt19.py <1018B PDF> <輸出 PDF>
import pymupdf as fitz, sys
SRC, OUT = sys.argv[1], sys.argv[2]
F = {"LiberationSans": "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
     "LiberationSans-Bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"}
# (頁, 班號格文字, 該列 y, 舊時刻, 新時刻, 新的是否 +1)
EDITS = [
    (10, "KX 212", 218.4, "00:55-02:10", "22:55-00:10", True),
    (10, "KX 212", 229.6, "00:40-02:05", "22:40-00:05", True),
    (10, "KX 211", 218.4, "07:40-11:05", "05:40-09:05", False),
    (10, "KX 211", 229.6, "07:25-11:00", "05:25-09:00", False),
    (11, "KX 288", 159.1, "23:35-01:25", "22:05-23:55", False),
    (11, "KX 288", 171.9, "23:50-01:30", "22:20-00:00", True),
    (11, "KX 287", 91.6, "02:55-07:00", "01:25-05:30", False),
    (11, "KX 287", 102.9, "03:10-07:05", "01:40-05:35", False),
    (14, "KX 282", 225.9, "16:35-20:30", "14:05-18:00", False),
    (14, "KX 282", 237.1, "17:15-20:55", "14:45-18:25", False),
    (14, "KX 281", 249.1, "22:00-02:15", "19:30-23:45", False),
    (14, "KX 281", 261.9, "22:40-02:40", "20:10-00:10", True),
    (15, "KX 51", 138.1, "19:40-00:10", "19:25-23:55", False),
    (16, "KX 37", 375.9, "01:50-04:10", "00:20-04:55", True),
    (16, "KX 37", 388.6, "01:05-02:40", "00:05-04:50", True),
    (22, "KX 51", 91.6, "17:00-18:25", "16:45-18:10", False),
]
HEADERS = [(16, "12h35m ~ 13h20m", "15h35m ~ 15h45m")]   # 波士頓 → 台北 標題（白字、色帶底）
doc = fitz.open(SRC)
FT = {k: fitz.Font(fontfile=v) for k, v in F.items()}
def col(c): return ((c >> 16 & 255) / 255, (c >> 8 & 255) / 255, (c & 255) / 255)
done = []
for pno in sorted(set([e[0] for e in EDITS] + [h[0] for h in HEADERS])):
    pg = doc[pno - 1]
    sp = [s for b in pg.get_text("dict")["blocks"] for l in b.get("lines", []) for s in l["spans"]]
    red, ins = [], []
    for e in [e for e in EDITS if e[0] == pno]:
        _, lab, y, old, new, plus = e
        lab_s = [s for s in sp if s["text"].strip() == lab and abs(s["bbox"][1] - y) < 1.2]
        assert len(lab_s) == 1, ("label", e, len(lab_s))
        L = lab_s[0]; right = L["bbox"][0] >= 300
        same = lambda s: abs(s["bbox"][1] - y) < 2.5 and (s["bbox"][0] >= 300) == right
        tm = [s for s in sp if same(s) and s["text"].strip() == old]
        assert len(tm) == 1, ("time", e, len(tm))
        T = tm[0]
        pl = [s for s in sp if same(s) and s["text"].strip() == "+1"]
        had = len(pl) == 1
        red.append(T["bbox"])
        if had: red.append(pl[0]["bbox"])
        base = 429.9 if right else 132.3          # 沒有 +1 時時刻的 x（跟同一欄其他列一樣）
        x = base - 2.7 if plus else base           # 有 +1 時往左讓出位置
        oy = L["origin"][1] + (0.4 if plus else 0)
        ins.append((x, oy, new, "LiberationSans", T["size"], T["color"]))
        if plus:
            ins.append((x + 30.2, oy - 2.6, "+1", "LiberationSans", 4.7, T["color"]))
        done.append((pno, lab, old + (" +1" if had else ""), new + (" +1" if plus else "")))
    bands = []
    for h in [h for h in HEADERS if h[0] == pno]:
        hs = [s for s in sp if s["text"].strip() == h[1]]
        assert len(hs) == 1, ("header", h, len(hs))
        H = hs[0]; r = fitz.Rect(H["bbox"])
        pix = pg.get_pixmap(clip=fitz.Rect(r.x1 + 0.5, r.y0, r.x1 + 1.5, r.y1), dpi=72)
        bg = tuple(v / 255 for v in pix.pixel(0, pix.height // 2))   # 色帶底色
        bands.append((r, bg))
        w = FT[H["font"]].text_length(h[2], fontsize=H["size"])
        ins.append((r.x1 - w, H["origin"][1], h[2], H["font"], H["size"], H["color"]))
        done.append((pno, "header", h[1], h[2]))
    for b in red:
        r = fitz.Rect(b); pg.add_redact_annot(fitz.Rect(r.x0 - 0.3, r.y0 + 0.2, r.x1 + 0.3, r.y1 - 0.2), fill=(1, 1, 1))
    for r, bg in bands:
        pg.add_redact_annot(fitz.Rect(r.x0 - 0.3, r.y0 + 0.2, r.x1 + 0.3, r.y1 - 0.2), fill=bg)
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    for x, y, t, fn, size, c in ins:
        pg.insert_text((x, y), t, fontname="k19" + str(list(F).index(fn)), fontfile=F[fn], fontsize=size, color=col(c))
doc.set_metadata(dict(doc.metadata, modDate=fitz.get_pdf_now()))
doc.save(OUT, garbage=4, deflate=True, clean=True)
print("saved", OUT, doc.page_count, "cells", len(done))
for d in done: print(d)
