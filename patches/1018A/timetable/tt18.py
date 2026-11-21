# 1018A：機型定案 —— 以 1012A 交付的時刻表 PDF 為底稿，只改「機型」那一格（其他文字、位置、字型不動）。
#   對照表跟網站同一份：patches/1018A/js/tf18.js 的 MAP18（用 regex 讀出來，兩邊不會不一致）。
#   KX315 同時是杭州→台北（定案 A339R）與重慶→台北（A21N，不動）：舊機型是 A21N 的那一列跳過。
#   用法：python3 tt18.py <1012A PDF> <輸出 PDF>
import pymupdf as fitz, sys, re, os
SRC, OUT = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
MAP = dict(re.findall(r"(KX\d+):'(\w+)'", open(os.path.join(here, '..', 'js', 'tf18.js'), encoding='utf-8').read()))
F_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT = fitz.Font(fontfile=F_REG)
TYPES = {'EQV','A388','B779','B789','B78X','A359','A35K','A339L','A339R','A339','A21N','A21X'}
doc = fitz.open(SRC)
changed = []
for pno in range(doc.page_count):
    pg = doc[pno]
    sp = [s for b in pg.get_text("dict")["blocks"] for l in b.get("lines", []) for s in l["spans"]]
    todo = []
    for s in sp:
        m = re.fullmatch(r"KX (\d+)", s["text"].strip())
        if not m: continue
        code = 'KX' + m.group(1)
        if code not in MAP: continue
        y, x = s["bbox"][1], s["bbox"][0]
        row = [t for t in sp if abs(t["bbox"][1] - y) < 2.5 and (t["bbox"][0] >= 300) == (x >= 300) and t["text"].strip() in TYPES]
        if not row: continue
        t = row[0]; old = t["text"].strip(); new = MAP[code]
        if code == 'KX315' and old == 'A21N': continue
        if old == new: continue
        todo.append((t, old, new, code))
    for t, old, new, code in todo:
        r = fitz.Rect(t["bbox"])
        pg.add_redact_annot(fitz.Rect(r.x0 - 0.3, r.y0 + 0.2, r.x1 + 0.3, r.y1 - 0.2), fill=(1, 1, 1))
    if todo:
        pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    for t, old, new, code in todo:
        r = fitz.Rect(t["bbox"]); c = (r.x0 + r.x1) / 2; size = t["size"]; col = t["color"]
        w = FONT.text_length(new, fontsize=size)
        pg.insert_text((c - w / 2, t["origin"][1]), new, fontname="k18", fontfile=F_REG, fontsize=size,
                       color=((col >> 16 & 255) / 255, (col >> 8 & 255) / 255, (col & 255) / 255))
        changed.append((pno + 1, code, old, new))
doc.set_metadata(dict(doc.metadata, modDate=fitz.get_pdf_now()))
doc.save(OUT, garbage=4, deflate=True, clean=True)
print("saved", OUT, doc.page_count, "cells", len(changed))
import collections
print(sorted(collections.Counter((c[1], c[2], c[3]) for c in changed).items()))
