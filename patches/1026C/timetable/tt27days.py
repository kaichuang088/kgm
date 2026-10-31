# 1026C（交付 1027A）：KX30 台北出發改成前一天 23:50 → 營運日 一二四六 改 日一三五（網站 [1,3,5,7]）；tt27.py 只改時刻、不改營運日 → 這裡補「台北＞美洲」頁 KX 30 兩列的營運日（同字型 DejaVu Sans Mono、同字級、同基準線）。
import sys, fitz
SRC, OUT = sys.argv[1], sys.argv[2]
FF = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
doc = fitz.open(SRC); n = 0
for pg in doc:
    W = pg.rect.width; words = pg.get_text("words")
    ys = [w[1] for w in words if w[4] == "30" and w[0] < W / 2 and any(v[4] == "KX" and abs(v[1] - w[1]) < 1 and 0 <= w[0] - v[2] < 6 for v in words)]
    if not ys: continue
    tgt = []
    for b in pg.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                if s["text"] == "12·4·6·" and s["bbox"][0] < W / 2 and any(abs(s["bbox"][1] - y) < 2 for y in ys): tgt.append(s)
    for s in tgt: pg.add_redact_annot(fitz.Rect(s["bbox"]), fill=(1, 1, 1))
    if tgt: pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
    for s in tgt:
        c = s["color"]; pg.insert_text(s["origin"], "1·3·5·7", fontname="k27mono", fontfile=FF, fontsize=s["size"], color=((c >> 16 & 255) / 255, (c >> 8 & 255) / 255, (c & 255) / 255)); n += 1
    print("page", pg.number + 1, "rows", len(ys), "cells", len(tgt))
doc.subset_fonts(); doc.save(OUT, garbage=4, deflate=True, clean=True); print("KX30 營運日改了", n, "格")
