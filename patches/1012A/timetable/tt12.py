# 1012A #13：KX6/KX5 與 KX4/KX3 班號互換（2026-11-29 起）——以 1010A 交付的時刻表 PDF 為底稿，只改第 29／30 頁（檔案第 16 頁）洛杉磯兩段。
#   冬季期間拆成「25Oct26–28Nov26（照舊）」與「29Nov26–27Mar27（新班表）」兩列；舊 KX3 凌晨班 11-29 當天還飛，所以 KX3 舊列到 29Nov26、新列從 30Nov26。
#   字型、字級、欄位 x、分隔線全部沿用原檔同一段的量測值；其餘頁面原樣保留。
#   用法：python3 tt12.py <1010A PDF> <輸出 PDF>
import pymupdf as fitz, sys
SRC, OUT = sys.argv[1], sys.argv[2]
F_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
F_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
F_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FONT = {"reg": fitz.Font(fontfile=F_REG), "bold": fitz.Font(fontfile=F_BOLD), "mono": fitz.Font(fontfile=F_MONO)}
FILE = {"reg": F_REG, "bold": F_BOLD, "mono": F_MONO}
def rgb(h): return ((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255
INK, INK2, SEP = rgb(0x1B1B1B), rgb(0x333333), (0.9333, 0.9333, 0.9333)
PNO = 15
# 兩欄的版面（原檔量測）：x0/x1＝分隔線左右；code/days/time 靠左；type/period 置中；base＝第一列基線；pitch＝列距；sep＝基線到下方分隔線
COL = {
  "L": dict(x0=11.2, x1=286.5, code=11.3, days=81.2, time=132.3, type_c=202.65, per_c=256.5, base=472.5, pitch=11.3, sep=3.0, top=465.6, bot=510.5, sup=False),
  "R": dict(x0=309.0, x1=584.2, code=309.0, days=378.8, time=427.2, type_c=500.3, per_c=554.2, base=473.2, pitch=12.7, sep=4.6, top=465.6, bot=518.0, sup=True),
}
ROWS = {
  "L": [("KX 6", "1234567", "17:45-14:15", "", "A359", "04Sep26-24Oct26"),
        ("KX 6", "1234567", "17:15-14:30", "", "A359", "25Oct26-28Nov26"),
        ("KX 6", "1234567", "10:25-07:40", "", "A388", "29Nov26-27Mar27"),
        ("KX 4", "1234567", "23:55-20:25", "", "A388", "04Sep26-24Oct26"),
        ("KX 4", "1234567", "23:25-20:40", "", "A388", "25Oct26-28Nov26"),
        ("KX 4", "1·3··6·", "17:15-14:30", "", "A359", "29Nov26-27Mar27")],
  "R": [("KX 3", "1234567", "00:30-05:30", "+1", "A388", "04Sep26-24Oct26"),
        ("KX 3", "1234567", "00:00-05:45", "+1", "A388", "25Oct26-29Nov26"),
        ("KX 3", "1·3··6·", "16:15-22:00", "+1", "A359", "30Nov26-27Mar27"),
        ("KX 5", "1234567", "16:45-21:45", "+1", "A359", "04Sep26-24Oct26"),
        ("KX 5", "1234567", "16:15-22:00", "+1", "A359", "25Oct26-28Nov26"),
        ("KX 5", "1234567", "09:20-15:05", "+1", "A388", "29Nov26-27Mar27")],
}
doc = fitz.open(SRC)
pg = doc[PNO]
# 檢查底稿真的是 1010A 那一版（四列舊資料都在），避免套錯檔
txt = pg.get_text()
for need in ("KX 6", "17:45-14:15", "23:25-20:40", "00:00-05:45", "16:15-22:00", "LOS ANGELES"):
    assert need in txt, need
# 1) 舊的列（文字＋分隔線）整塊清掉：白底蓋掉、文字一併移除
for k, c in COL.items():
    pg.add_redact_annot(fitz.Rect(c["x0"] - 0.5, c["top"], c["x1"] + 0.5, c["bot"]), fill=(1, 1, 1))
pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_TOUCHED)
def put(x, y, s, f, size, color):
    pg.insert_text((x, y), s, fontname="k12" + f, fontfile=FILE[f], fontsize=size, color=color)
def w(s, f, size): return FONT[f].text_length(s, fontsize=size)
# 2) 重畫六列
for k, c in COL.items():
    for i, (code, days, tm, sup, typ, per) in enumerate(ROWS[k]):
        b = c["base"] + i * c["pitch"]
        put(c["code"], b, code, "bold", 5.66, INK)
        put(c["days"], b, days, "mono", 5.66, INK)
        tb = b + (1.2 if c["sup"] else 0)            # 右欄時刻比基線低 1.2（原檔：上標 +1 擠在上面）
        put(c["time"], tb, tm, "reg", 5.66, INK)
        if sup: put(c["time"] + w(tm, "reg", 5.66), tb - 2.6, sup, "reg", 4.72, INK)
        put(c["type_c"] - w(typ, "reg", 5.66) / 2, b, typ, "reg", 5.66, INK)
        put(c["per_c"] - w(per, "reg", 5.53) / 2, b, per, "reg", 5.53, INK2)
        y = b + c["sep"]
        pg.draw_rect(fitz.Rect(c["x0"], y, c["x1"], y + 0.75), color=None, fill=SEP, width=0)
doc.set_metadata(dict(doc.metadata, modDate=fitz.get_pdf_now()))
doc.save(OUT, garbage=4, deflate=True, clean=True)
print("saved", OUT, doc.page_count)
