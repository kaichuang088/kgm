# 1020B：時刻表 PDF（以 1019A 交付的 PDF 為底稿）
#   ① 機型（使用者這輪逐條指定；網站 MAP18／fl20b 同一組值）、KX78/77 每週五班、廈門時刻（1h20／1h25、1h10／1h15）——只改那幾格
#   ② 中東頁加 台北—多哈（KX2／KX1 B779、KX100／KX99 A359；2026-12-01 首航，只有冬季那一段在本時刻表期間內）
#   ③ 共用班號頁（使用者：「圖三聯營那邊資料不全喔」）：原本機型「—」、適用期間「-」→ 全部依網站的夥伴營運航班重排
#      （機型＝夥伴實際機型、適用期間寫出日期、飛行時間＝網站同一份），版頭／欄位標題／頁碼沿用原頁；
#      出發（左）＝離台灣較遠的方向（台灣出發、續程），抵達（右）＝往台灣方向（回程）
#   ④ 新增「共用班號 卡達航空」一頁（第 63／64 頁）＋目錄、使用說明的夥伴表各加一列
#   用法：python3 tt20b.py <1019A PDF> <輸出 PDF> <dumptt20.json（/tmp/j/dumptt20.js 從網站匯出）>
import pymupdf as fitz, sys, re, json
SRC, OUT, DATA = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(DATA, encoding='utf-8'))
FF = {"reg": "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
      "bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
      "mono": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
      "cjk": "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"}
FT = {k: fitz.Font(fontfile=v) for k, v in FF.items()}
def rgb(h): return ((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255
INK, PER_C, WHITE = rgb(0x1B1B1B), rgb(0x333333), (1, 1, 1)
TEAL, BROWN, SEP = (0.0431, 0.4314, 0.4314), (0.4784, 0.3608, 0.0706), (0.9333, 0.9333, 0.9333)
def tw(t, f, s): return FT[f].text_length(t, fontsize=s)
def put(pg, x, y, t, f, s, c):
    pg.insert_text((x, y), t, fontname="k20" + f, fontfile=FF[f], fontsize=s, color=c)
def spans(pg):
    return [s for b in pg.get_text("dict")["blocks"] for l in b.get("lines", []) for s in l["spans"] if s["text"].strip()]

doc = fitz.open(SRC)
log = []

# ══ ① 逐格修改 ═════════════════════════════════════════════════════════════
S_, W_ = "04Sep26-24Oct26", "25Oct26-27Mar27"
AC1 = {'KX180': 'A21N', 'KX179': 'A21N', 'KX188': 'A21N', 'KX187': 'A21N', 'KX104': 'A359', 'KX103': 'A359',
       'KX120': 'A21N', 'KX119': 'A21N', 'KX398': 'A359', 'KX397': 'A359', 'KX224': 'A21N', 'KX223': 'A21N',
       'KX220': 'A339R', 'KX219': 'A339R', 'KX216': 'A21N', 'KX215': 'A21N', 'KX228': 'A21N', 'KX227': 'A21N',
       'KX264': 'A21N', 'KX263': 'A21N',
       'KX245': 'EQV', 'KX246': 'EQV', 'KX247': 'EQV', 'KX248': 'EQV', 'KX249': 'EQV', 'KX250': 'EQV', 'KX251': 'EQV', 'KX252': 'EQV'}
AC_SEAS = {'KX304': {S_: 'A359/B779'}, 'KX303': {S_: 'A359/B779'}, 'KX306': {W_: 'A21N'}, 'KX305': {W_: 'A21N'}}
DAYS = {('KX78', None): '1·34·67', ('KX77', 'LHR'): '1·34·67', ('KX77', 'TPE'): '12·45·7'}
TIMES = {('KX320', S_): '12:30-13:50', ('KX320', W_): '12:15-13:40', ('KX319', S_): '14:50-16:00', ('KX319', W_): '15:10-16:25'}
BANDDUR = [(8, 0, 339.6, '0h50m ~ 0h55m', '1h20m ~ 1h25m'), (8, 1, 339.6, '0h50m ~ 0h55m', '1h10m ~ 1h15m')]   # 廈門兩個帶狀標題
TYPES = {'EQV', 'A388', 'B779', 'B789', 'B78X', 'A359', 'A35K', 'A339L', 'A339R', 'A339', 'A21N', 'A21X'}
def band_fill(pg, r):
    for g in pg.get_drawings():
        gr = g["rect"]
        if g.get("fill") and gr.x0 <= r.x0 and gr.x1 >= r.x1 and gr.y0 <= r.y0 and gr.y1 >= r.y1 and gr.height < 20:
            return g["fill"]
    raise SystemExit("band fill not found")
for pno in range(doc.page_count):
    pg = doc[pno]; sp = spans(pg); todo = []
    for s in sp:
        m = re.fullmatch(r"KX (\d+)", s["text"].strip())
        if not m: continue
        code = 'KX' + m.group(1); y = s["bbox"][1]; right = s["bbox"][0] >= 300
        row = [t for t in sp if abs(t["bbox"][1] - y) < 2.5 and (t["bbox"][0] >= 300) == right]
        per = next((t["text"].strip() for t in row if re.fullmatch(r"\d\d\w{3}\d\d-\d\d\w{3}\d\d", t["text"].strip())), None)
        tcell = next((t for t in row if t["text"].strip() in TYPES), None)
        new = AC1.get(code) or (AC_SEAS.get(code) or {}).get(per)
        if tcell and new and tcell["text"].strip() != new: todo.append((tcell, new, 'reg', 'center', INK))
        dk = (code, None) if (code, None) in DAYS else None
        if code == 'KX77':   # 倫敦→曼谷（同頁「最終目的地 台北」那一段）／曼谷→台北 依頁面判斷：第 13 頁右欄＝曼谷→台北
            dk = ('KX77', 'TPE') if pno == 12 else ('KX77', 'LHR')
        if dk and dk in DAYS:
            dc = next((t for t in row if re.fullmatch(r"[1-7·]{7}", t["text"].strip())), None)
            if dc and dc["text"].strip() != DAYS[dk]: todo.append((dc, DAYS[dk], 'mono', 'left', INK))
        if (code, per) in TIMES:
            tc = next((t for t in row if re.fullmatch(r"\d\d:\d\d-\d\d:\d\d", t["text"].strip())), None)
            if tc and tc["text"].strip() != TIMES[(code, per)]: todo.append((tc, TIMES[(code, per)], 'reg', 'left', INK))
    for (bp, half, by, old, new) in BANDDUR:
        if bp != pno: continue
        c = [t for t in sp if t["text"].strip() == old and abs(t["bbox"][1] - by) < 1.5 and (t["bbox"][0] >= 300) == bool(half)]
        assert len(c) == 1, ("band", bp, half, len(c))
        todo.append((c[0], new, 'bold', 'right', WHITE, band_fill(pg, fitz.Rect(c[0]["bbox"]))))
    if not todo: continue
    for it in todo:
        r = fitz.Rect(it[0]["bbox"])
        pg.add_redact_annot(fitz.Rect(r.x0 - 0.3, r.y0 + 0.2, r.x1 + 0.3, r.y1 - 0.2), fill=(it[5] if len(it) > 5 else (1, 1, 1)))
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    for it in todo:
        t, new, f, al, col = it[:5]; r = fitz.Rect(t["bbox"]); size = t["size"]; w = tw(new, f, size)
        x = (r.x0 + r.x1) / 2 - w / 2 if al == 'center' else (r.x1 - w if al == 'right' else r.x0)
        put(pg, x, t["origin"][1], new, f, size, col)
        log.append((pno + 1, t["text"].strip(), new))

# ══ 帶狀標題＋列（跟原頁同一個尺寸：帶 15.8、列距 11.3、欄位 x）════════════════════════
X_OFF = [0.0, 297.8]
def band(pg, half, y, a, b, dur, color):
    dx = X_OFF[half]; x0 = 11.2 + dx
    pg.draw_rect(fitz.Rect(x0, y, x0 + 275.3, y + 15.8), color=None, fill=color)
    base = y + 9.8; x = 17.0 + dx
    for i, (zh, en) in enumerate((a, b)):
        put(pg, x, base, zh, 'cjk', 6.66, WHITE); x += tw(zh, 'cjk', 6.66)
        put(pg, x, base, ' ' + en, 'bold', 6.66, WHITE); x += tw(' ' + en, 'bold', 6.66)
        if i == 0:
            x += 5.8; put(pg, x, base, '→', 'reg', 5.95, WHITE); x += tw('→', 'reg', 5.95) + 5.7
    put(pg, 280.6 + dx - tw(dur, 'bold', 5.95), base, dur, 'bold', 5.95, WHITE)
    return y + 15.8
def row(pg, half, top, i, code, days, tm, sup, ac, per):
    dx = X_OFF[half]; base = top + 6.8 + i * 11.3
    put(pg, 11.3 + dx, base, code, 'bold', 5.66, INK)
    put(pg, 81.2 + dx, base, days, 'mono', 5.66, INK)
    put(pg, 132.3 + dx, base, tm, 'reg', 5.66, INK)
    if sup: put(pg, 132.3 + dx + tw(tm, 'reg', 5.66) + 0.6, base - 2.6, sup, 'reg', 4.7, INK)
    put(pg, 202.65 + dx - tw(ac, 'reg', 5.66) / 2, base, ac, 'reg', 5.66, INK)
    put(pg, 256.5 + dx - tw(per, 'reg', 5.53) / 2, base, per, 'reg', 5.53, PER_C)
    pg.draw_rect(fitz.Rect(11.2 + dx, top + 10.5 + i * 11.3, 286.5 + dx, top + 11.2 + i * 11.3), color=None, fill=SEP)
    return top + 11.2 + i * 11.3
def group_h(n): return 15.8 + 10.5 + (n - 1) * 11.3 + 0.7 + 5.3
def fmt_days(v):
    if v in ('daily', ''): return '1234567'
    ds = [int(x) for x in (v if isinstance(v, list) else str(v).split(','))]
    return ''.join(str(i) if i in ds else '·' for i in range(1, 8))
def hm(m): return '%dh%02dm' % (m // 60, m % 60)
def durtxt(ms): a, b = min(ms), max(ms); return hm(a) if a == b else hm(a) + ' ~ ' + hm(b)

# ══ 城市中英文：中文跟網站同一份（CITY），英文沿用原 PDF 的寫法 ═══════════════════════════
EN = {'ADL': 'ADELAIDE', 'AKL': 'AUCKLAND', 'AMS': 'AMSTERDAM', 'AUH': 'ABU DHABI', 'BCN': 'BARCELONA', 'BKK': 'BANGKOK',
      'BNE': 'BRISBANE', 'BOS': 'BOSTON', 'CDG': 'PARIS CDG', 'CNS': 'CAIRNS', 'CTS': 'SAPPORO', 'DEN': 'DENVER',
      'DFW': 'DALLAS', 'DOH': 'DOHA', 'DPS': 'BALI', 'FCO': 'ROME', 'FRA': 'FRANKFURT', 'FUK': 'FUKUOKA', 'HEL': 'HELSINKI',
      'HKG': 'HONG KONG', 'HND': 'TOKYO HANEDA', 'HNL': 'HONOLULU', 'IAD': 'WASHINGTON', 'JFK': 'NEW YORK JFK', 'KIX': 'OSAKA KANSAI',
      'KUL': 'KUALA LUMPUR', 'LAS': 'LAS VEGAS', 'LAX': 'LOS ANGELES', 'LHR': 'LONDON HEATHROW', 'MAD': 'MADRID',
      'MAN': 'MANCHESTER', 'MCO': 'ORLANDO', 'MEL': 'MELBOURNE', 'MIA': 'MIAMI', 'MNL': 'MANILA', 'MUC': 'MUNICH',
      'MXP': 'MILAN MALPENSA', 'NRT': 'TOKYO NARITA', 'OKA': 'OKINAWA', 'ORD': 'CHICAGO', 'PEN': 'PENANG', 'PER': 'PERTH',
      'PHX': 'PHOENIX', 'SEA': 'SEATTLE', 'SFO': 'SAN FRANCISCO', 'SIN': 'SINGAPORE', 'SYD': 'SYDNEY', 'TPE': 'TAIPEI TAOYUAN',
      'TSA': 'TAIPEI SONGSHAN', 'ZRH': 'ZURICH'}
def city(a): return (D['city'][a], EN[a])

# ══ ② 中東頁：台北—多哈 ═════════════════════════════════════════════════════
me = doc[19]
assert 'MIDDLE EAST' in me.get_text()
dh = {x['code']: x for x in D['doh']}
def kgm_rows(codes):
    out = []
    for c in codes:
        x = dh[c]; out.append(('KX ' + c[2:], fmt_days(x['days']), x['dep'] + '-' + x['arr'], ('+%d' % x['dd']) if x['dd'] else '', x['acft'], '01Dec26-27Mar27'))
    return sorted(out, key=lambda r: r[2])
for half, codes, a, b in ((0, ['KX2', 'KX100'], 'TPE', 'DOH'), (1, ['KX1', 'KX99'], 'DOH', 'TPE')):
    y = 111.8 + 5.3
    top = band(me, half, y, city(a), city(b), durtxt([dh[c]['dur'] for c in codes]), BROWN)
    for i, r in enumerate(kgm_rows(codes)): row(me, half, top, i, *r)
log.append((20, 'DOH', 'added'))

# ══ ③④ 共用班號頁 ═════════════════════════════════════════════════════════════
ACS = {'Boeing 737-800': 'B738', 'Boeing 787-9': 'B789', 'Boeing 737 MAX 8': 'B38M', 'Airbus A350-1000': 'A35K', 'Airbus A321': 'A321',
       'Airbus A330-300': 'A333', 'Boeing 737-900ER': 'B739', 'Airbus A321neo': 'A21N', 'Airbus A350-900': 'A359',
       'Boeing 787-9 / 787-10 varies by date': 'B789/B78X', 'Boeing 777-300ER': 'B77W', 'Airbus A320neo': 'A20N', 'Airbus A320': 'A320',
       'Boeing 787-8': 'B788', 'Airbus A380-800': 'A388', 'Boeing 787-10 / 787-9 varies by date': 'B78X/B789', 'Boeing 737-900': 'B739',
       'Boeing 777-300': 'B773', 'Boeing 777-200ER': 'B772', 'A350-1000 / 777-300ER varies by date': 'A35K/B77W',
       'Boeing 787-10 / 787-9 / 777-300ER varies by date': 'EQV', 'Boeing 737 MAX 9': 'B39M',
       '737 MAX 9 / 737-900 / 737-800 varies by date': 'EQV', '737-800 / A330-300 varies by date': 'B738/A333',
       'Boeing 737-900 / 737 MAX 9 varies by date': 'B739/B39M'}
MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
def dfmt(s): y, m, d = s.split('-'); return '%s%s%s' % (d, MON[int(m) - 1], y[2:])
def period(x):
    a = x['ef'] or '2026-03-29'; b = x['et'] or '2027-03-27'
    a = max(a, '2026-03-29'); b = min(b, '2027-03-27')
    return dfmt(a) + '-' + dfmt(b)
def opf(s): m = re.match(r"([A-Z0-9]{2})(\d+)", s or ''); return (m.group(1) + ' ' + m.group(2)) if m else s
def groups_of(op):
    rows = [x for x in D['cs'] if x['op'] == op]
    g = {}
    for x in rows: g.setdefault((x['fr'], x['to']), []).append(x)
    L, R = [], []
    for (a, b), xs in g.items():
        xs.sort(key=lambda x: x['dep'])
        (L if D['dist'].get(b, 0) > D['dist'].get(a, 0) else R).append(((a, b), xs))
    k = lambda it: (it[0][0] not in ('TPE', 'TSA'), it[0][1] not in ('TPE', 'TSA'), D['dist'].get(it[0][0], 0), it[0][0], it[0][1])
    return sorted(L, key=k), sorted(R, key=k), len(rows)
Y0, YMAX = 74.2, 568.0
def paginate(gs, npages):
    # 原頁有幾頁就排幾頁（標題寫「1/3」…），平均分配，不留空白頁
    total = sum(group_h(len(it[1])) for it in gs); target = total / npages
    pages = [[] for _ in range(npages)]; p = 0; y = Y0; used = 0.0
    for it in gs:
        h = group_h(len(it[1]))
        if pages[p] and p < npages - 1 and (y + h - 5.3 > YMAX or used + h / 2 > target * (p + 1)):
            p += 1; y = Y0
        if y + h - 5.3 > YMAX: raise SystemExit('overflow %s' % (it[0],))
        pages[p].append(it); y += h; used += h
    return pages
def draw_groups(pg, half, gs):
    y = Y0; n = 0
    for (a, b), xs in gs:
        if not all(x['eq'] in ACS for x in xs): raise SystemExit('no A/C code: %s' % [x['eq'] for x in xs])
        top = band(pg, half, y, city(a), city(b), durtxt([x['dur'] for x in xs]), TEAL)
        for i, x in enumerate(xs):
            last = row(pg, half, top, i, 'KX %s (%s)' % (x['code'][2:], opf(x['opf'])), fmt_days(x['days']), x['dep'] + '-' + x['arr'],
                       ('+%d' % x['dd']) if x['dd'] else '', ACS[x['eq']], period(x)); n += 1
        y = last + 5.3
    return n
def clear(pg):
    for x0, x1 in ((10.5, 297.0), (300.0, 595.0)):
        pg.add_redact_annot(fitz.Rect(x0, 70.6, x1, 572.0), fill=(1, 1, 1))
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED)
PARTNERS = [('Alaska Airlines', [24]), ('American Airlines', [25]), ('Cathay Pacific', [26]), ('Etihad Airways', [27]),
            ('Japan Airlines', [28, 29, 30]), ('Qantas', [31])]
for op, pidx in PARTNERS:
    t = doc[pidx[0]].get_text()
    assert ('CODESHARE · ' + op.upper()) in t, (op, pidx)
# 卡達航空：複製澳航那一頁，改版頭、頁碼
doc.fullcopy_page(31)
qp = doc[doc.page_count - 1]
sp = spans(qp)
for s in sp:
    if s["bbox"][1] < 30 and (s["bbox"][0] > 150 and s["bbox"][0] < 297 or s["bbox"][0] > 440):
        qp.add_redact_annot(fitz.Rect(s["bbox"]) + (-0.3, -0.3, 0.3, 0.3), fill=TEAL)
    if s["bbox"][1] > 570:
        qp.add_redact_annot(fitz.Rect(s["bbox"]) + (-0.3, -0.3, 0.3, 0.3), fill=(1, 1, 1))
qp.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
for half, zh, en in ((0, '共用班號 卡達航空 出發', 'CODESHARE · QATAR AIRWAYS DEPARTURE'), (1, '共用班號 卡達航空 抵達', 'CODESHARE · QATAR AIRWAYS ARRIVAL')):
    xe = 286.2 + X_OFF[half] - (0.0 if half == 0 else 0.3)
    put(qp, xe - tw(zh, 'cjk', 8.22), 16.5, zh, 'cjk', 8.22, WHITE)
    put(qp, xe - tw(en, 'reg', 7.08), 26.2, en, 'reg', 7.08, WHITE)
put(qp, 11.3, 583.5, '63', 'bold', 6.8, rgb(0x666666)); put(qp, 583.9 - tw('64', 'bold', 6.8), 583.5, '64', 'bold', 6.8, rgb(0x666666))
PARTNERS.append(('Qatar Airways', [doc.page_count - 1]))
for op, pidx in PARTNERS:
    L, R, n = groups_of(op)
    pl, pr = paginate(L, len(pidx)), paginate(R, len(pidx))
    drawn = 0
    for k, pi in enumerate(pidx):
        pg = doc[pi]; clear(pg)
        drawn += draw_groups(pg, 0, pl[k]) + draw_groups(pg, 1, pr[k])
    assert drawn == n, (op, drawn, n)
    log.append(('codeshare', op, n, 'rows', len(L), '+', len(R), 'groups'))

# ══ ④ 目錄、使用說明夥伴表各加一列 ══════════════════════════════════════════════
toc = doc[1]
tmp = fitz.open(); tmp.insert_pdf(doc, from_page=1, to_page=1)
DY = 23.3
HOT = fitz.Rect(25.0, 443.6, 273.0, 514.2)        # 客服專線方框
LINE = fitz.Rect(25.0, 408.0, 273.0, 430.2)       # 「61 共用班號 Qantas 61」那一列（含分隔線）
toc.draw_rect(HOT, color=None, fill=(1, 1, 1))
toc.add_redact_annot(HOT, fill=(1, 1, 1)); toc.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
toc.show_pdf_page(HOT + (0, DY, 0, DY), tmp, 0, clip=HOT)
toc.show_pdf_page(LINE + (0, DY, 0, DY), tmp, 0, clip=LINE)
BADGE = (0.0431, 0.2314, 0.2)
toc.draw_rect(fitz.Rect(32.8, 414.6 + DY, 41.0, 422.6 + DY), color=None, fill=BADGE)
put(toc, 33.4, 420.8 + DY, '63', 'bold', 6.23, WHITE)
toc.draw_rect(fitz.Rect(86.6, 412.6 + DY, 140.0, 422.6 + DY), color=None, fill=(1, 1, 1))
put(toc, 86.7, 420.0 + DY, ' Qatar Airways', 'reg', 7.36, INK)
toc.draw_rect(fitz.Rect(262.5, 413.6 + DY, 272.6, 422.8 + DY), color=None, fill=(1, 1, 1))
put(toc, 272.1 - tw('63', 'bold', 7.36), 420.8 + DY, '63', 'bold', 7.36, rgb(0x8A8578))
GDY = 16.5
QROW = fitz.Rect(322.8, 411.8, 570.4, 428.3)      # 「QF 澳洲航空 Qantas」那一列（含左右框線）
GBOT = fitz.Rect(322.8, 428.3, 570.4, 437.8)      # 夥伴表方框底部
toc.draw_rect(GBOT, color=None, fill=(1, 1, 1))
toc.show_pdf_page(QROW + (0, GDY, 0, GDY), tmp, 0, clip=QROW)
toc.show_pdf_page(GBOT + (0, GDY, 0, GDY), tmp, 0, clip=GBOT)
for r in ((336.0, 415.6, 346.0, 423.4), (376.0, 415.4, 401.0, 423.6), (460.8, 415.6, 482.0, 423.4)):
    toc.draw_rect(fitz.Rect(*r) + (0, GDY, 0, GDY), color=None, fill=(1, 1, 1))
put(toc, 336.6, 421.5 + GDY, 'QR', 'bold', 5.95, rgb(0x0B3B33))
put(toc, 376.3, 421.5 + GDY, '卡達航空', 'cjk', 5.95, PER_C)
put(toc, 461.1, 421.5 + GDY, 'Qatar Airways', 'reg', 5.95, PER_C)
log.append((2, 'TOC + partners', 'Qatar'))

doc.subset_fonts()   # 新插入的字型只留用到的字（不然整份文泉驛會嵌進去，檔案大 6 MB）
doc.set_metadata(dict(doc.metadata, modDate=fitz.get_pdf_now()))
doc.save(OUT, garbage=4, deflate=True, clean=True)
print('saved', OUT, doc.page_count)
for l in log: print(l)
