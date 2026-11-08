# 1108B B5／B6：時刻表 PDF 班號改成「去程奇數、回程偶數」（跟網站 kx39.py 同一份對照：全網 +1、福岡依出發時間重排）
# 底稿＝1108A 交付的時刻表 PDF。直接改 PDF 內容裡畫班號的那幾個字：「KX 180」在底稿是逐字畫的
#   BT/F 7.55 Tf … Tm <002e>Tj a -0 TD <003b>Tj b -0 TD <0003>Tj c -0 TD <0014>Tj d -0 TD <001b>Tj d -0 TD <0013>Tj ET
#   （LiberationSans 字形編號：K=2e、X=3b、空白=03、0～9=13～1c；之前幾輪寫上去的格子是 [<002E003B0003…>]TJ 一整串）
#   → 只換數字那幾個字形（位數變多就多畫一個字、間距用同一格數字的間距），其他內容一個位元都不動：
#   不清除（apply_redactions 會弄掉整頁描邊字的線寬，標題中文糊掉）、不蓋底色、不加字型；文字層也只剩新號碼。
#   聯營頁 KX 9xxx（4 位數，夥伴營運）不動。時刻、機型、期間都不動（1108B 沒改時刻）。
# 用法：/tmp/j/venv/bin/python kx39tt.py <1108A PDF> <輸出 PDF>
import pymupdf as fitz, sys, re, collections
SRC, OUT = sys.argv[1], sys.argv[2]
FUK = {172: 171, 171: 170, 174: 173, 173: 172, 176: 175, 175: 174, 170: 177, 169: 176}
def mp(n): return FUK.get(n, n + 1)
DIG = 0x13
# ① 逐字畫的格子
TJ1 = re.compile(rb'(BT/(\S+) ([\d.]+) Tf (?:(?!ET|BT/).)*?<002e>Tj [\d.]+ -0 TD <003b>Tj [\d.]+ -0 TD <0003>Tj)((?: [\d.]+ -0 TD <00(?:1[3-9a-c])>Tj){1,3})((?: [\d.]+ -0 TD <0003>Tj)?\s*ET)')
DG = re.compile(rb' ([\d.]+) -0 TD <00(1[3-9a-c])>Tj')
# ② 之前幾輪寫上去的整串
TJ2 = re.compile(rb'\[<(0003)?002E003B0003((?:001[3-9A-C]){1,3})(0003)?>\]TJ')
d = fitz.open(SRC)
cnt = collections.Counter(); W = {}   # 字級 → 數字間距（同一份文件裡量到的）
def scan(b):
    for m in TJ1.finditer(b):
        ds = DG.findall(m.group(4))
        if len(ds) >= 2: W.setdefault(m.group(3), ds[1][0])
def sub1(m):
    ds = DG.findall(m.group(4)); old = int(''.join(str(int(h, 16) - DIG) for _, h in ds)); new = str(mp(old))
    adv0 = ds[0][0]; adv = W.get(m.group(3)) or ('%.6g' % (float(m.group(3)) * 0.55592)).encode()
    body = b''.join((b' ' + (adv0 if i == 0 else adv) + b' -0 TD <00' + ('%02x' % (DIG + int(c))).encode() + b'>Tj') for i, c in enumerate(new))
    cnt['tj'] += 1
    return m.group(1) + body + m.group(5)
def sub2(m):
    h = m.group(2).decode(); old = int(''.join(str(int(h[i:i + 4], 16) - DIG) for i in range(0, len(h), 4))); new = str(mp(old))
    cnt['TJ'] += 1
    return b'[<' + (m.group(1) or b'') + b'002E003B0003' + b''.join(('%04X' % (DIG + int(c))).encode() for c in new) + (m.group(3) or b'') + b'>]TJ'
X = [x for x in range(1, d.xref_length()) if d.xref_is_stream(x)]
for x in X:
    try: scan(d.xref_stream(x) or b'')
    except Exception: pass
for x in X:
    try: b = d.xref_stream(x)
    except Exception: continue
    if not b or (b'<002e>Tj' not in b and b'002E003B0003' not in b): continue
    nb = TJ2.sub(sub2, TJ1.sub(sub1, b))
    if nb != b: d.update_stream(x, nb); cnt['streams'] += 1
# ② 1108B（使用者：「A35K不要完全只有長程」，選「短程輪流機型加 A35K」）：成田 KX185／184、仁川 KX105／104 機型欄 A359 → A359/A35K
#    （香港 KX357／356 底稿本來就寫 EQV＝輪流機型，不用改）。那 8 格是之前幾輪用 LiberationSans 寫上去的 [<…>]TJ 一整串：
#    同一列（基線差 <0.4 pt）、字串＝A359 → 後面接「/A35K」五個字形（字型是完整字集，寬度表、可複製文字都有），起點左移半個新增寬度保持置中。
A35 = {'185', '184', '105', '104'}; ADD = [0x12, 0x24, 0x16, 0x18, 0x2E]; WADD = (277 + 666 + 556 + 556 + 666) / 1000.0
TJA = re.compile(rb'BT/(\S+) ([\d.]+) Tf ([\d.]+) ([\d.]+) TD\[<00240016001800(?:1C|1c)>\]TJ')
na = 0
for pg in d:
    ys = [sp['origin'][1] for b in pg.get_text('dict')['blocks'] for l in b.get('lines', []) for sp in l['spans'] if re.match(r'^\s*KX (\d+)\s*$', sp['text']) and re.match(r'^\s*KX (\d+)\s*$', sp['text']).group(1) in A35]
    if not ys: continue
    H = pg.rect.height
    for x in pg.get_contents():
        b = d.xref_stream(x)
        def subA(m):
            global na
            y = H - float(m.group(4))
            if not any(abs(y - v) < 0.4 for v in ys): return m.group(0)
            na += 1; sz = float(m.group(2)); x0 = float(m.group(3)) - WADD * sz / 2
            return b'BT/' + m.group(1) + b' ' + m.group(2) + b' Tf ' + ('%.5f' % x0).encode() + b' ' + m.group(4) + b' TD[<00240016001800' + b'1C' + b''.join(('%04X' % g).encode() for g in ADD) + b'>]TJ'
        nb = TJA.sub(subA, b)
        if nb != b: d.update_stream(x, nb)
assert na == 8, ('A359/A35K cells', na)
# ③ 杭州線統一（使用者：「OK」）：杭州→台北原本 KX315（改號後 KX316，跟重慶→台北同號）→ KX314。
#    第 8 頁右欄 4 格 KX 316：杭州那 2 格在底稿是逐字畫的（深一層的表單物件），重慶那 2 格是之前寫上去的整串 TJ
#    → 全文件逐字畫的 KX 316 應該剛好 2 格，改成 314；改完用文字層核對：KX 314 都在「杭州」標題與「重慶」標題之間。
K316 = re.compile(rb'(BT/\S+ [\d.]+ Tf 1 0 0 -1 ([\d.]+) ([\d.]+) Tm <002e>Tj [\d.]+ -0 TD <003b>Tj [\d.]+ -0 TD <0003>Tj [\d.]+ -0 TD <0016>Tj [\d.]+ -0 TD <0014>Tj [\d.]+ -0 TD )<0019>(Tj\s*ET)')   # KX 316（3、1、6）
nh = 0
for x in X:
    try: b = d.xref_stream(x)
    except Exception: continue
    if not b or b'<0019>Tj' not in b: continue
    cols = {}
    for m in K316.finditer(b): cols.setdefault(m.group(2), []).append(m)
    pick = []
    for L in cols.values():
        if len(L) == 4: pick += sorted(L, key=lambda m: float(m.group(3)))[:2]   # 同一欄 4 格：上面兩格＝杭州
    for m in sorted(pick, key=lambda m: -m.start()):
        b = b[:m.start()] + m.group(1) + b'<0017>' + m.group(4) + b[m.end():]; nh += 1
    if pick: d.update_stream(x, b)
assert nh == 2, ('HGH return cells', nh)
for pg in d:
    sp = [x for b in pg.get_text('dict')['blocks'] for l in b.get('lines', []) for x in l['spans']]
    got = sorted((x['origin'][1], x['text'].strip()) for x in sp if x['text'].strip() in ('KX 314', 'KX 316') and x['origin'][0] > 290)
    if not any(t == 'KX 314' for _, t in got): continue
    hz = [x['origin'][1] for x in sp if 'HANGZHOU' in x['text'] and x['origin'][0] > 290][0]; cq = [x['origin'][1] for x in sp if 'CHONGQING' in x['text'] and x['origin'][0] > 290][0]
    assert all((t == 'KX 314') == (hz < y < cq) for y, t in got), ('HGH cells', got, hz, cq)
    print('kx39tt: HGH page', pg.number + 1, [(round(y), t) for y, t in got])
cnt['hgh'] = nh
cnt['a35k'] = na
d.save(OUT, garbage=3, deflate=True, clean=False)
print('kx39tt:', dict(cnt), 'digit advance', {k.decode(): v.decode() for k, v in W.items()})
