# 1010A：以 1009B 交付的時刻表 PDF 為底稿，只改本輪網站時刻有變動的格子（edits_1010A.json）；其餘內容原樣保留
import pymupdf as fitz, json, re, sys
SRC = sys.argv[2] if len(sys.argv) > 2 else "/tmp/ttpdf/KGM_1009B/KGM_Airways_Timetable_2026S-2027W_1009B.pdf"
OUT = sys.argv[1] if len(sys.argv) > 1 else "KGM_Airways_Timetable_2026S-2027W_1010A.pdf"
F_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
F_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
F_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
F_SYM = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
F_CJK = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
FONTS = {"reg": fitz.Font(fontfile=F_REG), "bold": fitz.Font(fontfile=F_BOLD), "mono": fitz.Font(fontfile=F_MONO),
         "sym": fitz.Font(fontfile=F_SYM), "cjk": fitz.Font(fontfile=F_CJK)}
FILES = {"reg": F_REG, "bold": F_BOLD, "mono": F_MONO, "sym": F_SYM, "cjk": F_CJK}
def rgb(h): return ((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255
INK, INK2, NOTE = rgb(0x1B1B1B), rgb(0x333333), rgb(0x8E1B2C)
WHITE = (1, 1, 1)

src = fitz.open(SRC)
src.bake()
HALF = src[0].rect.width / 2
R0, R1 = 70.0, 572.0            # 欄位內容區（欄標題線之下、頁碼之上）

# ── 版面量測 ──────────────────────────────────────────────
def col_of(x): return 0 if x < HALF else 1
def spans(pno):
    out = []
    for bl in src[pno].get_text("dict")["blocks"]:
        for ln in bl.get("lines", []):
            for sp in ln["spans"]:
                if sp["text"].strip(): out.append(sp)
    return out
SP = {}
def sp_of(pno):
    if pno not in SP: SP[pno] = spans(pno)
    return SP[pno]
def seps(pno, col):
    ys = []
    for g in src[pno].get_drawings():
        r = g["rect"]
        if col_of(r.x0 + 1) != col or r.y0 < R0: continue
        f = g.get("fill")
        if f and r.height < 1.2 and r.width > 200: ys.append(("sep", r.y0, r.y1))
        elif f and r.width > 200 and 14 < r.height < 17 and g.get("color") is None: ys.append(("hdr", r.y0, r.y1))
    return sorted(ys, key=lambda t: t[1])
def row_find(pno, col, code, per):
    """找『班號＋期間』那一列的所有 span 與列帶（上一條分隔線／標題底 → 本列分隔線底）"""
    ss = [s for s in sp_of(pno) if col_of(s["bbox"][0]) == col]
    heads = [s for s in ss if s["text"].strip() == code and s["font"].endswith("Bold")]
    for h in heads:
        yc = (h["bbox"][1] + h["bbox"][3]) / 2
        row = [s for s in ss if abs((s["bbox"][1] + s["bbox"][3]) / 2 - yc) < 3.2]
        if any(s["text"].strip() == per for s in row):
            sp = seps(pno, col)
            top = max([y1 for k, y0, y1 in sp if y1 < yc - 2] or [R0])
            bot = min([y1 for k, y0, y1 in sp if k == "sep" and y0 > yc])
            return {"yc": yc, "spans": row, "top": top, "bot": bot, "pno": pno}
    raise SystemExit("row not found p%d %s %s" % (pno + 1, code, per))

def cbot(pno, col):
    """這一欄實際內容的最底（字或色塊），再多留 1pt；位移只搬到這裡，不把底部空白也搬下去"""
    ys = [s["bbox"][3] for s in sp_of(pno) if col_of(s["bbox"][0]) == col and R0 < s["bbox"][3] < R1]
    ys += [g["rect"].y1 for g in src[pno].get_drawings() if col_of(g["rect"].x0 + 1) == col and R0 < g["rect"].y1 < R1 and g["rect"].width < HALF]
    return min(R1, max(ys) + 1.0)

# 欄位 x 範圍（相對欄起點）
CELLX = [("code", 0, 60), ("days", 60, 120), ("time", 120, 190), ("type", 190, 232), ("per", 232, 300)]
def cell_of(s, col):
    x = s["bbox"][0] - (HALF if col else 0)
    for n, a, b in CELLX:
        if a <= x < b: return n

# ── 輸出頁的重組：一欄一欄把原頁面的區段依序疊上去 ────────────
class Col:
    def __init__(self, page, col):
        self.page, self.col, self.y, self.place = page, col, R0, []
        x0 = HALF * col
        self.x0, self.x1 = x0, x0 + HALF
        page.draw_rect(fitz.Rect(self.x0, R0, self.x1, R1), color=None, fill=WHITE, overlay=True)
    def put(self, pno, a, b):
        r = fitz.Rect(self.x0, self.y, self.x1, self.y + (b - a))
        if PHASE == 2:
            clip = fitz.Rect(self.x0, a, self.x1, b)
            self.page.show_pdf_page(r, clean_src(pno, clip, REDACT.get((CUR, pno), [])), 0, clip=clip)
        self.place.append((pno, a, b, self.y))
        self.y += b - a
        assert self.y <= R1 + 0.01, "column overflow"
    def space(self, h):
        self.y += h
        assert self.y <= R1 + 0.01, "column overflow"
    def map(self, pno, y, nth=0):
        hits = [(p, a, b, oy) for (p, a, b, oy) in self.place if p == pno and a <= y <= b]
        p, a, b, oy = hits[nth]
        return oy + (y - a)

def text_w(t, font, size): return FONTS[font].text_length(t, fontsize=size)
def put_text(page, x, y, t, font, size, color, heavy=False):
    if heavy:   # 標題列原本的中文是粗體；文泉驛只有一種字重，用同色細描邊補成相近的粗細
        page.insert_text((x, y), t, fontsize=size, fontname="k1010" + font, fontfile=FILES[font], color=color,
                         fill=color, render_mode=2, border_width=0.055)
    else:
        page.insert_text((x, y), t, fontsize=size, fontname="k1010" + font, fontfile=FILES[font], color=color)
def runs(t):
    """中英混排：CJK 用文泉驛（跟原檔備註框同一套），⚠ 用 DejaVu Sans，其餘 Liberation Sans"""
    out, cur, kind = [], "", None
    for ch in t:
        k = "sym" if ch == "⚠" else ("cjk" if ord(ch) >= 0x2E80 or ch in "，、：；（）。" else "reg")
        if k != kind and cur: out.append((kind, cur)); cur = ""
        kind = k; cur += ch
    if cur: out.append((kind, cur))
    return out
def put_mixed(page, x, y, t, size, color, latin="reg", heavy=False):
    for k, s in runs(t):
        f = latin if k == "reg" else k
        put_text(page, x, y, s, f, size, color, heavy=heavy and f == "cjk"); x += text_w(s, f, size)
    return x
def mixed_w(t, size, latin="reg"):
    return sum(text_w(s, latin if k == "reg" else k, size) for k, s in runs(t))

CELLFONT = {"code": ("bold", 5.66, INK), "days": ("mono", 5.66, INK), "time": ("reg", 5.66, INK),
            "type": ("reg", 5.66, INK), "per": ("reg", 5.53, INK2)}
def edit_cell(page, row, col, cell, text, mapy, sup=None):
    """把某一格改成新值：白框蓋掉原本的字（含上標 +1），新字以原本的中心對齊、同字型同字級"""
    ss = [s for s in row["spans"] if cell_of(s, col) == cell]
    main = [s for s in ss if s["font"] != "Helvetica" and s["size"] > 5]
    u = fitz.Rect(ss[0]["bbox"])
    for s in ss[1:]: u |= fitz.Rect(s["bbox"])
    cx = (min(s["bbox"][0] for s in main) + max(s["bbox"][2] for s in ss if s["font"] != "Helvetica")) / 2
    base = main[0]["origin"][1]
    base_row = [s for s in row["spans"] if cell_of(s, col) == "code"][0]["origin"][1]
    if PHASE == 1:   # 第一輪只記下要刪掉的舊字（真的從文字層移除，不是只用白框蓋住）
        REDACT.setdefault((CUR, row["pno"]), []).append((fitz.Rect(u.x0 - 0.6, u.y0 - 0.4, u.x1 + 0.6, u.y1 + 0.3), True))
        return
    f, size, color = CELLFONT[cell]
    w = text_w(text, f, size) + (text_w(sup, "reg", 4.72) if sup else 0)
    x = cx - w / 2
    if cell == "code": x = min(sp["bbox"][0] for sp in main)   # 1004A：班號欄靠左對齊（跟上下列同一個起點）
    by = (base_row + 0.39) if sup else base_row          # 原檔有 +1 的列，時間字基線低 0.39pt
    put_text(page, x, mapy(by), text, f, size, color)
    if sup: put_text(page, x + text_w(text, f, size), mapy(by - 2.64), sup, "reg", 4.72, color)

def DAYS(ds): return "".join(str(i) if i in ds else "·" for i in range(1, 8))
S_, W_ = "04Sep26-24Oct26", "25Oct26-27Mar27"


# ── 乾淨的來源：只留這次要用到的那一塊文字，其餘（被裁掉的、要改的舊值）從文字層刪除 ──
class Dummy:
    def __getattr__(self, k): return lambda *a, **kw: None
REDACT = {}
def clean_src(pno, keep, reds):
    t = fitz.open(); t.insert_pdf(src, from_page=pno, to_page=pno); p = t[0]; W, H = p.rect.width, p.rect.height
    outs = [fitz.Rect(0, 0, W, keep.y0), fitz.Rect(0, keep.y1, W, H), fitz.Rect(0, keep.y0, keep.x0, keep.y1), fitz.Rect(keep.x1, keep.y0, W, keep.y1)]
    for r in outs:
        if not r.is_empty and r.width > 0 and r.height > 0: p.add_redact_annot(r, fill=False)
    for r, fl in reds:
        if r.intersects(keep): p.add_redact_annot(r, fill=False)
    p.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE, text=fitz.PDF_REDACT_TEXT_REMOVE)
    return t

for PHASE in (1, 2):
    CUR = None
    exec(open(__file__.replace("build_pdf_1010A.py", "build_body_1010A.py"), encoding="utf-8").read(), globals())
