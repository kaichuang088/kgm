# 1101B：帶狀標題（棕色條：出發地 → 目的地 ‧ 飛行時間）重排（使用者：「箭頭要對齊喔」）
#   底稿從 1020B 起箭頭跟著出發地文字長度走（同一欄 58～157 pt 都有）→ 整本每一欄的箭頭放同一個位置：
#   ① 箭頭：欄位左緣＋T（T＝整本最長的出發地文字右緣＋間距，左右兩欄同一個相對位置）
#   ② 目的地文字：整塊照原樣（向量、原字型）平移到箭頭後面（show_pdf_page 從修改前的底稿剪下來貼）
#      1102A：show_pdf_page 會把整頁原內容再存一份（3.0→3.4 MB 的元兇）→ 改成逐字重畫：中文用同一個字型（文泉驛正黑，底稿裡是同字形的 Type3）、
#      英文 LiberationSans-Bold，每個字放在原本的位置＋平移量（rawdict 的逐字座標）；最後 subset_fonts 只留用到的字
#   ③ 飛行時間：重寫、靠右；一行放得下就一行，放不下而且標題是兩行高就分兩行（「A ~」／「B」）
#   tt28 算好的新飛行時間在 BANDTXT[(頁, 第一行 x, 第一行 y)]；沒有的照原本文字
import pymupdf as fitz, re
TIME = re.compile(r'^\d+h\d\dm( ~)?( ~ \d+h\d\dm)?$|^~$')
def _white(s): return s['color'] == 0xffffff
def _bands(pg):
    out = []
    for g in pg.get_drawings():
        r = g['rect']; f = g.get('fill')
        if not f or g.get('type') not in ('f', 'fs'): continue
        if sum(f) < 2.4 and 12 < r.height < 27 and r.width > 250 and r.y0 > 40:   # 各區顏色不同（棕、藍綠、深藍、桃紅…）
            dup = [i for i, (o, _) in enumerate(out) if abs(r.y0 - o.y0) < 2.5 and abs(r.x0 - o.x0) < 30]
            if dup: out[dup[0]] = (out[dup[0]][0] & fitz.Rect(r), out[dup[0]][1]); continue   # 底稿同一條標題疊了兩個底色框（舊版拷貝，差 0.75 pt）→ 只算一次、用兩個的交集（蓋底色才不會超出看得到的那一層）
            out.append((fitz.Rect(r), f))
    return out
def _spans(pg):
    return [s for b in pg.get_text('dict')['blocks'] for l in b.get('lines', []) for s in l['spans'] if s['text'].strip()]
def _parse(pg):
    sp = _spans(pg); res = []
    for R, f in _bands(pg):
        ins = [s for s in sp if _white(s) and R.contains(fitz.Point((s['bbox'][0] + s['bbox'][2]) / 2, (s['bbox'][1] + s['bbox'][3]) / 2))]
        ar = [s for s in ins if s['text'].strip() == '→']
        if len(ar) != 1: continue
        a = ar[0]; tm = [s for s in ins if TIME.match(s['text'].strip())]
        org = [s for s in ins if s is not a and s not in tm and s['bbox'][2] <= a['bbox'][0] + 0.6]
        dst = [s for s in ins if s is not a and s not in tm and s not in org]
        if not org or not dst: continue
        res.append(dict(R=R, fill=f, a=a, tm=sorted(tm, key=lambda s: s['bbox'][1]), org=org, dst=dst))
    return res
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'; LBB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
def _raw(pg):   # 逐字座標：key＝span 外框（取 0.1 pt）
    out = {}
    for b in pg.get_text('rawdict')['blocks']:
        for l in b.get('lines', []):
            for sp in l['spans']:
                out[tuple(round(v, 1) for v in sp['bbox'])] = sp
    return out
def _stk(pg):   # 1102A：底稿哪些字有描邊（文泉驛：大部分頁只有填色，少數標題填色＋描邊 0.366 pt）→ [(外框, 描邊寬÷字級)]
    return [(fitz.Rect(t['bbox']), t['linewidth'] / t['size']) for t in pg.get_texttrace() if t['type'] == 1 and t.get('linewidth')]
def fixw(doc, src):   # 1102A：清除（apply_redactions）會把表單物件複製一份新的、描邊字的線寬（「.3663 w 1 M」）沒帶過去 → 用預設 1 pt 描邊、字糊成一團（1101B 起第 24 頁「首爾仁川」）。存檔前照底稿同一頁、同一順位的物件補回去
    S = fitz.open(src); n = 0
    PAT = re.compile(rb'(?<! w 1 M )BT/(\S+) ([\d.]+) Tf (\d) Tr ([\d.-]+ [\d.-]+) TD')   # 用 字型＋字級＋位置 對應（清除後被搬走的那幾段不在了，數量會不同）
    for pno in range(min(doc.page_count, S.page_count)):
        A, B = S[pno].get_xobjects(), doc[pno].get_xobjects()
        if len(A) != len(B): continue
        for xa, xb in zip(A, B):
            if xa[1] != xb[1]: continue
            o = S.xref_stream(xa[0]) or b''
            W = {m.group(2, 3, 4): m.group(1) for m in re.finditer(rb'([\d.]+) w 1 M BT/(\S+) ([\d.]+) Tf \d Tr ([\d.-]+ [\d.-]+) TD', o)}
            if not W: continue
            nw = doc.xref_stream(xb[0]) or b''; k = [0]
            def sub(m):
                w = W.get((m.group(1), m.group(2), m.group(4)))
                if not w: return m.group(0)
                k[0] += 1; return w + b' w 1 M ' + m.group(0)
            nw2 = PAT.sub(sub, nw)
            if k[0]: doc.update_stream(xb[0], nw2); n += k[0]
    return n
def run(doc, BANDTXT, put, tw, WHITE, src=None):
    P = {pno: _parse(doc[pno]) for pno in range(doc.page_count)}
    RAW = {pno: _raw(doc[pno]) for pno in P if P[pno]}
    SD = fitz.open(src) if src else doc   # 描邊要讀底稿（tt28 前面改時刻已經清除過的頁，線寬已經不見了）
    STK = {pno: _stk(SD[pno]) for pno in P if P[pno]}
    ow = [max(s['bbox'][2] for s in h['org']) - h['R'].x0 for L in P.values() for h in L]
    if not ow: return 'no bands'
    n = 0; tight = []; TS = {}
    for pno, L in P.items():
        if not L: continue
        # 箭頭的相對位置（欄位左緣起算）：同一頁同一欄（左＝去程、右＝回程）全部對齊；一般＝台北桃園 TAIPEI TAOYUAN 那種寬度（96.5），這一欄有特別長的出發地就整欄往右
        TC = {}
        for h in L:
            c = h['R'].x0 > 290; TC[c] = max(TC.get(c, 0), max(s['bbox'][2] for s in h['org']) - h['R'].x0 + 5.5)   # 這一欄最長的出發地＋5.5（不設下限：目的地長的欄才放得下時間）
        for c, v in TC.items():
            TS[(pno + 1, 'R' if c else 'L')] = round(v, 1)
        pg = doc[pno]; jobs = []
        for h in L:
            R, a = h['R'], h['a']; T = TC[R.x0 > 290]
            sh = (R.x0 + T) - a['bbox'][0]
            D = fitz.Rect(h['dst'][0]['bbox'])
            for s in h['dst'][1:]: D |= fitz.Rect(s['bbox'])
            old = ' '.join(s['text'].strip() for s in h['tm']).replace(' ~ ~', ' ~')
            t0 = h['tm'][0] if h['tm'] else None
            key = (pno, round(t0['bbox'][0]), round(t0['bbox'][1])) if t0 else None
            nt = BANDTXT.get(key) or BANDTXT.get(next((k for k in BANDTXT if k[0] == pno and t0 and any(abs(k[1] - round(s['bbox'][0])) <= 1 and abs(k[2] - round(s['bbox'][1])) <= 1 for s in h['tm'])), None)) or re.sub(r'\s+', ' ', old).strip()
            sz = (t0['size'] if t0 else 5.9); right = R.x1 - 5.9; room = right - (D.x1 + sh) - 7
            parts = nt.split(' ~ ')
            if tw(nt, 'bold', sz) <= room or len(parts) == 1: lines = [nt]
            else: lines = [parts[0] + ' ~', parts[1]]
            if len(lines) == 2 and R.height < 20: lines = [nt]
            while max(tw(x, 'bold', sz) for x in lines) > room and sz > 5.3: sz -= 0.15   # 放不下：時間字縮小一點
            if max(tw(x, 'bold', sz) for x in lines) > room and len(parts) == 2: lines = [parts[0] + ' ~', parts[1]]; sz = min(sz, 5.4)   # 還是放不下（單行標題、目的地很長）：分兩行
            if max(tw(x, 'bold', sz) for x in lines) > room: tight.append((pno + 1, nt, round(room, 1)))
            jobs.append((h, sh, D, lines, sz, T))
            for s in [a] + h['dst'] + h['tm']:
                r = fitz.Rect(s['bbox']); pg.add_redact_annot(fitz.Rect(r.x0 - 0.2, r.y0 + 0.1, r.x1 + 0.2, r.y1 - 0.1), fill=h['fill'])
        pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
        # 有些頁的內容包在表單物件（Form XObject）裡，清除清不到 → 一律再用標題底色蓋掉舊的箭頭、目的地、時間
        for h, sh, D, lines, sz, T in jobs:
            R = h['R']; x0 = min(h['a']['bbox'][0], D.x0) - 0.6
            pg.draw_rect(fitz.Rect(x0, R.y0 + 0.4, R.x1 - 0.4, R.y1 - 0.4), color=None, fill=h['fill'], overlay=True)
        for h, sh, D, lines, sz, T in jobs:
            R, a = h['R'], h['a']
            for s in h['dst']:   # 1102A：逐字重畫（不再整頁剪貼）
                rs = RAW[pno].get(tuple(round(v, 1) for v in s['bbox']))
                cjk = 'Type3' in s['font'] or any(ord(ch) > 0x2e80 for ch in s['text'])
                fn, ff = ('k31cjk', CJK) if cjk else ('k31lb', LBB)
                chars = rs['chars'] if rs else [dict(c=s['text'], origin=s['origin'])]
                SR = fitz.Rect(s['bbox'])
                bw = 0.03 if 'Type3' in s['font'] else next((w for r, w in STK[pno] if abs(r.x0 - SR.x0) < 0.6 and r.y0 < SR.y1 and r.y1 > SR.y0), 0)   # Type3 字形本身是粗字（描邊 0.03 逐字放大比對過）；文泉驛照底稿那個字有沒有描邊
                for ch in chars:
                    if not ch['c'].strip(): continue
                    pg.insert_text((ch['origin'][0] + sh, ch['origin'][1]), ch['c'], fontname=fn, fontfile=ff, fontsize=s['size'], color=WHITE, fill=WHITE, render_mode=2 if (cjk and bw) else 0, border_width=bw if cjk else 0)
            put(pg, R.x0 + T, a['origin'][1], '→', 'reg', a['size'], WHITE)
            mid = (R.y0 + R.y1) / 2
            ob = min(s['origin'][1] for s in h['org'])   # 單行標題：跟城市名同一條基線
            ys = [ob if R.height < 20 else mid + sz * 0.36] if len(lines) == 1 else ([mid - 0.5, mid + sz] if R.height < 20 else [mid - 0.6, mid + sz + 0.3])
            for x, y in zip(lines, ys): put(pg, R.x1 - 5.9 - tw(x, 'bold', sz), y, x, 'bold', sz, WHITE)
            n += 1
    import collections
    return dict(bands=n, T=sorted(collections.Counter(TS.values()).items()), tight=tight[:30])
