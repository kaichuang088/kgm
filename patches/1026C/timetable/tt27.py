# 1026C（交付 1027A）：tt26.py 的副本，底稿改成 1026B 交付的 PDF —— 那份已經 subset 過，沿用字型名 k26reg 會用到只剩舊字的子集（新數字變方框）→ 字型名改 k27。
# 1023A：時刻表 PDF（以 1020B 交付的 PDF 為底稿）—— 冬季飛行時間依風向（網站 kgmWindDeltaR1023A）：
#   使用者：「你冬天假設去程-5可能因為風向 回來就會是逆風應該是+5或更多才對啊 所以你要確認好並給我新的時刻表PDF」
#   ① 冬季（25Oct26-27Mar27）每一列：班號＋起飛時間對到網站同一班的冬季時刻，抵達時間／跨日（+1）不同就改那一格
#   ② 每個航線帶狀標題右邊的飛行時間（最短 ~ 最長）依這條航線夏、冬各列重算
#   ③ 夏季列核對網站：不同的也改成網站的時刻，並列出來（1020B 以前就不同步的列）
#   1026B：以 1026A 交付的 PDF 為底稿；PDF 上每一列先用 1026A 的網站時刻（舊）對到是哪一班，再寫上 1026B 的網站時刻（新，含彈性）
#   用法：python3 tt26.py <1026A PDF> <輸出 PDF> <dumptt26.json（1026B 網站匯出）> <dumptt25b.json（1026A 網站匯出）> [--dry]
import pymupdf as fitz, sys, re, json
SRC, OUT, DATA, OLDD = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]; DRY = '--dry' in sys.argv
D = json.load(open(OLDD, encoding='utf-8'))      # 用來對列（PDF 上印的就是這一份）
DN = json.load(open(DATA, encoding='utf-8'))     # 要寫上去的新時刻
assert len(D) == len(DN) and all((a['code'], a['fr'], a['to'], a['via']) == (b['code'], b['fr'], b['to'], b['via']) for a, b in zip(D, DN)), '兩份匯出的航班順序不同'
NEWOF = {id(a): b for a, b in zip(D, DN)}
import os, datetime as DT
from zoneinfo import ZoneInfo
TZI = json.load(open(os.path.join(os.path.dirname(DATA), 'tz_iana.json'), encoding='utf-8'))   # 網站 TZ_IANA_K（/tmp/j/tz_iana.json）
TZI.update({'HIJ': 'Asia/Tokyo', 'KOJ': 'Asia/Tokyo', 'OKJ': 'Asia/Tokyo', 'MXP': 'Europe/Rome'})
def mins(t): return int(t[:2]) * 60 + int(t[3:])
OFF = {}   # 網站的固定時差（blockMin 用的那一份）：由網站自己算出的飛行時間反推，每條航線一個值
for x in D:
    v = x['s']; OFF[(x['fr'], x['to'])] = mins(v['arr']) + 1440 * v['dd'] - mins(v['dep']) - v['dur']
def blk(fr, to, dep, arr, dd, day):
    # 帶狀標題的飛行時間跟原 PDF 同一個算法（網站 blockMin、固定時差）；網站時區表固定值是已知未修的問題，等使用者決定，這裡不改算法
    return mins(arr) + 1440 * dd - mins(dep) - OFF[(fr, to)]
EN2 = {'KAGOSHIMA': 'KOJ', 'OKAYAMA': 'OKJ', 'TAIPEI SONGSHAN': 'TSA', 'SHANGHAI HONGQIAO': 'SHA', 'CHRISTCHURCH': 'CHC', 'SYDNEY': 'SYD', 'AUCKLAND': 'AKL', 'TAIPEI TAOYUAN': 'TPE', 'BRISBANE': 'BNE', 'MELBOURNE': 'MEL', 'BANGKOK SUVARNABHUMI': 'BKK', 'KUALA LUMPUR': 'KUL'}
DAY = {'s': '2026-09-15', 'w': '2027-01-15'}
MON = {m: i + 1 for i, m in enumerate(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}
DATES = ['2026-09-15', '2026-10-10', '2026-10-20', '2026-11-15', '2027-01-15', '2027-02-01']
def pdate(per):
    # 適用期間 → 期間內一個代表日（網站資料匯出了這幾天的時刻）；夏季期間的列只核對，冬季（10-25 起）的列依網站改
    def d(x): return '20%s-%02d-%s' % (x[5:7], MON[x[2:5]], x[:2])
    a, b = d(per[:7]), d(per[8:])
    c = [x for x in DATES if a <= x <= b]
    return (c[len(c) // 2] if len(c) > 2 else c[-1]) if c else None
FF = {"reg": "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", "bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"}
FT = {k: fitz.Font(fontfile=v) for k, v in FF.items()}
def rgb(h): return ((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255
INK, WHITE = rgb(0x1B1B1B), (1, 1, 1)
def tw(t, f, s): return FT[f].text_length(t, fontsize=s)
def put(pg, x, y, t, f, s, c): pg.insert_text((x, y), t, fontname="k27" + f, fontfile=FF[f], fontsize=s, color=c)
def spans(pg): return [s for b in pg.get_text("dict")["blocks"] for l in b.get("lines", []) for s in l["spans"] if s["text"].strip()]
S_, W_ = "04Sep26-24Oct26", "25Oct26-27Mar27"
BYR = {}
for x in D: BYR.setdefault((x['code'], x['fr'], x['to']), []).append(x)
def pick(code, route, sea, dep, arr=None):
    """同一班號＋航線可能有好幾列（例如 KX4／KX3 依星期兩個時刻）：先找起飛時間相同的；夏季再比抵達；都沒有就取起飛最接近的"""
    L = BYR.get((code,) + route, [])
    if not L: return None
    ex = [x for x in L if x['v'][sea]['dep'] == dep and (arr is None or x['v'][sea]['arr'] == arr)] or [x for x in L if x['v'][sea]['dep'] == dep]
    if ex: return ex[0]
    m = lambda t: int(t[:2]) * 60 + int(t[3:])
    return min(L, key=lambda x: abs(m(x['v'][sea]['dep']) - m(dep)))
def hm(m): return '%dh%02dm' % (m // 60, m % 60)
def durtxt(ms): a, b = min(ms), max(ms); return hm(a) if a == b else hm(a) + ' ~ ' + hm(b)
doc = fitz.open(SRC); log = []; miss = []; sm = []; chg = 0
for pno in range(doc.page_count):
    pg = doc[pno]; sp = spans(pg)
    bands = []
    for t in sp:
        tx = t["text"].strip()
        if t["size"] >= 6.5: continue
        if re.fullmatch(r"\d+h\d\dm ~", tx):
            nx = [u for u in sp if re.fullmatch(r"\d+h\d\dm", u["text"].strip()) and (abs(u["bbox"][2] - t["bbox"][2]) < 3 or abs(u["bbox"][0] - t["bbox"][0]) < 3) and 4 < u["bbox"][1] - t["bbox"][1] < 10]
            if nx: bands.append(dict(bbox=t["bbox"], spans=[t, nx[0]], text=tx + ' ' + nx[0]["text"].strip(), size=t["size"])); continue
        if re.fullmatch(r"\d+h\d\dm( ~ \d+h\d\dm)?", tx):
            if any(u is t for bb in bands for u in bb['spans']): continue
            bands.append(dict(bbox=t["bbox"], spans=[t], text=tx, size=t["size"]))
    bands = [bb for bb in bands if not any(bb is not cc and any(u is bb['spans'][0] for u in cc['spans'][1:]) for cc in bands)]
    rows = []
    for s in sp:
        m = re.fullmatch(r"KX (\d+)", s["text"].strip())
        if not m: continue
        y = s["bbox"][1]; right = s["bbox"][0] >= 300
        rr = [t for t in sp if abs(t["bbox"][1] - y) < 2.5 and (t["bbox"][0] >= 300) == right]
        per = next((t["text"].strip() for t in rr if re.fullmatch(r"\d\d\w{3}\d\d-\d\d\w{3}\d\d", t["text"].strip())), None)
        tc = next((t for t in rr if re.fullmatch(r"\d\d:\d\d-\d\d:\d\d", t["text"].strip())), None)
        if not tc or not per: continue
        sup = next((t for t in sp if re.fullmatch(r"[+\-]\d", t["text"].strip()) and (t["bbox"][0] >= 300) == right and abs(t["bbox"][1] - (y - 2.6)) < 3 and -1.5 <= t["bbox"][0] - tc["bbox"][2] < 3), None)
        rows.append(dict(code='KX' + m.group(1), y=y, right=right, per=per, tc=tc, sup=sup))
    todo = []; bandrows = {}; frozen = set()
    def band_of(r):
        c = [bb for bb in bands if (bb["bbox"][0] >= 300) == r['right'] and bb["bbox"][1] < r['y']]
        return max(c, key=lambda bb: bb["bbox"][1]) if c else None
    # 先用夏季列（班號＋起飛＋抵達完全相同）找出每個帶狀標題是哪一條航線
    route = {}
    for r in rows:
        if r['per'] != S_: continue
        dep, arr = r['tc']["text"].strip().split('-')
        for (code, fr, to), L in BYR.items():
            if code == r['code'] and any(x['s']['dep'] == dep and x['s']['arr'] == arr for x in L):
                b = band_of(r); route.setdefault(id(b), (fr, to)); break
    for r in rows:
        dep, arr = r['tc']["text"].strip().split('-'); sea = pdate(r['per'])
        b = band_of(r); rt = route.get(id(b))
        od = int(r['sup']["text"].strip()) if r['sup'] else 0
        if not sea:   # 其他適用期間的列（例如洛杉磯線 29Nov26 起）：不改，但飛行時間照算進帶狀標題
            if b is not None:
                if rt and rt in [k[1:] for k in BYR if k[0] == r['code']]: bandrows.setdefault(id(b), (b, []))[1].append(blk(rt[0], rt[1], dep, arr, od, ''))
                else: frozen.add(id(b))
            continue
        if not rt:   # 這個帶狀標題底下沒有夏季列（只有冬季飛）：用班號找唯一的航線；不唯一就找這一季起飛時間相同的那一條
            cs = [k[1:] for k in BYR if k[0] == r['code']]
            rt = cs[0] if len(set(cs)) == 1 else None
            if not rt:
                cs2 = [k[1:] for k, L in BYR.items() if k[0] == r['code'] and any(x['v'][sea]['dep'] == dep for x in L)]
                rt = cs2[0] if len(set(cs2)) == 1 else None
                if not rt and b is not None:   # 還是好幾條：看帶狀標題上的英文城市名
                    nm = [t["text"].strip() for t in sp if abs(t["bbox"][1] - b['bbox'][1]) < 10 and (t["bbox"][0] >= 300) == r['right'] and re.fullmatch(r"[A-Z][A-Z ]+", t["text"].strip())]
                    cc = [EN2.get(n) for n in nm]
                    if len(cc) >= 2 and cc[0] and cc[1] and ((cc[0], cc[1]) in cs2 or (cc[0], cc[1]) in cs): rt = (cc[0], cc[1])   # 1026B：起飛時間對不到（底稿這一列從 1020B 起就沒更新）也用帶狀標題的城市名
        x = pick(r['code'], rt, sea, dep, arr if sea < '2026-10-25' else None) if rt else None
        if not x:
            miss.append((pno + 1, r['code'], r['per'], r['tc']["text"].strip()))
            if b is not None: frozen.add(id(b))   # 對不到網站的列：這個帶狀標題不動
            continue
        v = NEWOF[id(x)]['v'][sea]   # 1026B：寫新時刻
        if b is not None:
            if os.environ.get('TT23_SELFCHECK'): od = int(r['sup']["text"].strip()) if r['sup'] else 0; bandrows.setdefault(id(b), (b, []))[1].append(blk(x['fr'], x['to'], dep, arr, od, sea))   # 自我檢查：用 PDF 原本的時刻算，應該跟原本的帶狀標題一樣
            else: bandrows.setdefault(id(b), (b, []))[1].append(blk(x['fr'], x['to'], v['dep'], v['arr'], v['dd'], sea))
        newt = v['dep'] + '-' + v['arr']; news = ('%+d' % v['dd']) if v['dd'] else ''; olds = r['sup']["text"].strip() if r['sup'] else ''
        if newt != r['tc']["text"].strip() or news != olds:
            if sea < '2026-10-25': sm.append((pno + 1, r['code'], r['tc']["text"].strip() + olds, '→ site', newt + news))   # 夏季列跟網站不同：也改成網站的（列出來）
            todo.append((r, newt, news)); log.append((pno + 1, r['code'], rt[0] + '-' + rt[1], r['tc']["text"].strip() + olds, newt + news))
    btodo = []
    for k, (b, ds) in bandrows.items():
        if k in frozen: continue
        nt = durtxt(ds)
        if nt != b['text']: btodo.append((b, nt)); log.append((pno + 1, 'band', b['text'], nt))
    if DRY or not (todo or btodo): chg += len(todo); continue
    for r, newt, news in todo:
        rc = fitz.Rect(r['tc']["bbox"]); pg.add_redact_annot(fitz.Rect(rc.x0 - 0.3, rc.y0 + 0.2, rc.x1 + 0.3, rc.y1 - 0.2), fill=(1, 1, 1))
        if r['sup']: rs = fitz.Rect(r['sup']["bbox"]); pg.add_redact_annot(fitz.Rect(rs.x0 - 0.2, rs.y0 + 0.1, rs.x1 + 0.4, rs.y1 - 0.1), fill=(1, 1, 1))
    for b, nt in btodo:
        fl = None; rb = fitz.Rect(b['spans'][0]["bbox"])
        for g in pg.get_drawings():
            gr = g["rect"]
            if g.get("fill") and sum(g["fill"]) < 2.4 and gr.x0 <= rb.x0 and gr.x1 >= rb.x1 and gr.y0 <= rb.y0 and gr.y1 >= rb.y1 and gr.height < 26: fl = g["fill"]   # 1025B：排除淺色框（同一位置的米白色底框會被誤取 → 白字蓋在米白上變成白框）
        assert fl, ('band fill', pno + 1, b['text'])
        b['fill'] = fl
        for u in b['spans']:
            ru = fitz.Rect(u["bbox"]); w = max(tw(nt, 'bold', u["size"]), ru.width) if len(b['spans']) == 1 else ru.width + 4
            pg.add_redact_annot(fitz.Rect(ru.x1 - w - 0.6, ru.y0 + 0.2, ru.x1 + 0.3, ru.y1 - 0.2), fill=fl)
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    for r, newt, news in todo:
        t = r['tc']; s = t["size"]; put(pg, t["bbox"][0], t["origin"][1], newt, 'reg', s, INK)
        if news: put(pg, t["bbox"][0] + tw(newt, 'reg', s) + 0.6, t["origin"][1] - 2.6, news, 'reg', 4.7, INK)
    for b, nt in btodo:
        sz = b['size']
        if len(b['spans']) == 2:   # 原本兩行（「9h20m ~」／「9h55m」）照兩行寫
            parts = nt.split(' ~ '); lines = [parts[0] + ' ~', parts[1]] if len(parts) == 2 else [parts[0]]
            for u, tx in zip(b['spans'], lines): ru = fitz.Rect(u["bbox"]); put(pg, ru.x1 - tw(tx, 'bold', sz), u["origin"][1], tx, 'bold', sz, WHITE)
        else:
            u = b['spans'][0]; ru = fitz.Rect(u["bbox"]); put(pg, ru.x1 - tw(nt, 'bold', sz), u["origin"][1], nt, 'bold', sz, WHITE)
    chg += len(todo)
print('rows changed', chg, '| bands changed', len([l for l in log if l[1] == 'band']), '| unmatched', len(miss), '| summer differs', len(sm))
for l in miss[:40]: print('MISS', l)
for l in sm[:40]: print('SUMMER', l)
if not DRY:
    doc.subset_fonts(); doc.set_metadata(dict(doc.metadata, modDate=fitz.get_pdf_now())); doc.save(OUT, garbage=4, deflate=True, clean=True)
    json.dump(log, open(OUT + '.log.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0); print('saved', OUT, doc.page_count)
