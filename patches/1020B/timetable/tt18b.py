# 1018B：KX31 夏季溫哥華→台北改 01:00–04:30⁺¹（使用者：「KX31時間改成（夏季）：01:00-04:30+1 所有抵達航班一定要是04:00之後喔不能是03:00」）
#   以 1018A 交付的時刻表 PDF 為底稿，只改 KX31 的格子（其他文字、位置、字型不動），跟網站實際顯示的一致：
#   · 第 17 頁（溫哥華出發）夏季：營運日 1·3·567 → 12·4·67（01:00 起飛是多倫多出發的隔天）、22:55-03:55⁺² → 01:00-04:30⁺¹、
#     期間到 25Oct26（10/25 星期日那班還是接 10/24 多倫多出發的夏季班）；冬季從 26Oct26 開始。
#   · 第 24 頁（多倫多出發）冬季：期間從 26Oct26 開始（10/25 換季那天多倫多出發停飛，網站同）。時刻不動（20:10-22:15）。
#   用法：python3 tt18b.py <1018A PDF> <輸出 PDF>
import pymupdf as fitz, sys
SRC, OUT = sys.argv[1], sys.argv[2]
F = {"LiberationSans": "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
     "DejaVuSansMono": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"}
# (頁, 該列 KX 31 的 y, 舊字, 新字)
EDITS = [
    (17, 303.9, "1·3·567", "12·4·67"),
    (17, 303.9, "22:55-03:55", "01:00-04:30"),
    (17, 303.9, "+2", "+1"),
    (17, 303.9, "04Sep26-24Oct26", "04Sep26-25Oct26"),
    (17, 316.6, "25Oct26-27Mar27", "26Oct26-27Mar27"),
    (24, 441.1, "25Oct26-27Mar27", "26Oct26-27Mar27"),
]
doc = fitz.open(SRC)
done = []
for pno in sorted(set(e[0] for e in EDITS)):
    pg = doc[pno - 1]
    sp = [s for b in pg.get_text("dict")["blocks"] for l in b.get("lines", []) for s in l["spans"]]
    todo = []
    for e in [e for e in EDITS if e[0] == pno]:
        row = [s for s in sp if s["bbox"][0] >= 300 and abs(s["bbox"][1] - e[1]) < 2.5]
        assert any(s["text"].strip() == "KX 31" for s in row), ("no KX 31 row", e)
        hit = [s for s in row if s["text"].strip() == e[2]]
        assert len(hit) == 1, ("span", e, len(hit))
        todo.append((hit[0], e))
    for s, e in todo:
        r = fitz.Rect(s["bbox"])
        pg.add_redact_annot(fitz.Rect(r.x0 - 0.3, r.y0 + 0.2, r.x1 + 0.3, r.y1 - 0.2), fill=(1, 1, 1))
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    for s, e in todo:
        col = s["color"]; fn = s["font"]; assert fn in F, fn
        pg.insert_text((s["bbox"][0], s["origin"][1]), e[3], fontname="k18b" + str(list(F).index(fn)), fontfile=F[fn],
                       fontsize=s["size"], color=((col >> 16 & 255) / 255, (col >> 8 & 255) / 255, (col & 255) / 255))
        done.append((pno, e[2], e[3]))
doc.set_metadata(dict(doc.metadata, modDate=fitz.get_pdf_now()))
doc.save(OUT, garbage=4, deflate=True, clean=True)
print("saved", OUT, doc.page_count, "cells", len(done))
for d in done: print(d)
