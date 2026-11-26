# 1121A：時刻表 PDF（底稿＝1112B 交付的 PDF，內容＝1112A）只改兩件事、只換字形，其他一個位元都不動（跟 kx39tt／tt40 同一個做法）：
#  ① P3（使用者：「TPE-YVR是一共每週10班，兩個航班5+5」）：KX31 台北→溫哥華（→多倫多）加週四、KX32（多倫多→）溫哥華→台北加週五
#     第 17 頁台北⇄溫哥華：KX31 兩列 1·3·5·7 → 1·345·7（xref 985，[<…>]TJ 整串）、KX32 兩列 12·4·6· → 12·456·（xref 964）
#     第 24 頁溫哥華⇄多倫多：KX31 兩列（xref 1073、1090，整串）、KX32 兩列（表單物件 xref 1075，逐字畫的等寬字 Tm＋Tj）
#  ② 1120A L5（使用者：「HKG/MFM/MNL/OKA全數改EQV喔」）：香港、澳門、馬尼拉底稿本來就寫 EQV；沖繩（第 4 頁）20 格 B78X／A21N → EQV
#     （之前幾輪用 Liberation Sans 完整字集 k18 寫上去的 [<…>]TJ 整串，起點右移半個寬度差保持置中）
# 用法：/tmp/j/venv/bin/python tt121.py <1112B PDF> <輸出 PDF>
import pymupdf as fitz, sys, re
SRC, OUT = sys.argv[1], sys.argv[2]
d = fitz.open(SRC)
def dig(s): return ''.join('0079' if c == '·' else '%04X' % (0x13 + int(c)) for c in s)
# ① 營運日
WANT = {'1·3·5·7': '1·345·7', '12·4·6·': '12·456·'}
TJS = {985: [('81.19922', '313.16999', '1·3·5·7'), ('81.19922', '299.66999', '1·3·5·7')],
       964: [('379.17304', '313.16999', '12·4·6·'), ('379.17304', '299.66999', '12·4·6·')],
       1073: [('81.54026', '159.41999', '1·3·5·7')],
       1090: [('81.19922', '146.66999', '1·3·5·7')]}
n1 = 0
for x, L in TJS.items():
    b = d.xref_stream(x)
    for X, Y, s in L:
        old = (X + ' ' + Y + ' TD[<' + dig(s) + '>]TJ').encode()
        assert b.count(old) == 1, ('day TJ', x, X, Y, b.count(old))
        b = b.replace(old, (X + ' ' + Y + ' TD[<' + dig(WANT[s]) + '>]TJ').encode()); n1 += 1
    d.update_stream(x, b)
G = rb'<00(?:1[3-9a-fA-F]|79)>Tj'
SEQ = re.compile(rb'1 0 0 -1 505\.10939 (18813|18828) Tm ' + G + rb'(?: [\d.]+ -0 TD ' + G + rb'){6}')
b = d.xref_stream(1075); out = b; shift = 0
for m in SEQ.finditer(b):
    gs = re.findall(rb'<00([0-9a-fA-F]{2})>Tj', m.group(0)); s = ''.join('·' if g.lower() == b'79' else str(int(g, 16) - 0x13) for g in gs)
    assert s == '12·4·6·', s
    it = iter([b'79' if c == '·' else ('%02x' % (0x13 + int(c))).encode() for c in WANT[s]])
    rep = re.sub(rb'<00([0-9a-fA-F]{2})>Tj', lambda mm: b'<00' + next(it) + b'>Tj', m.group(0))
    out = out[:m.start() + shift] + rep + out[m.end() + shift:]; shift += len(rep) - len(m.group(0)); n1 += 1
d.update_stream(1075, out)
assert n1 == 8, ('days', n1)
# 第 17 頁 KX31 兩格、第 24 頁 KX31 第二格原本用的等寬字子集 k27mono（TMMJOM+DejaVu Sans Mono）沒有「4」這個字形（畫出來是空白）
# → 這三格改用同一套 DejaVu Sans Mono 的另一個子集（xref 588，有 0～9；字寬相同，位置不變）：第 17 頁頁面資源本來就有（名稱 k18b1），第 24 頁加一個名稱 k121mono
d.xref_set_key(d[23].xref, 'Resources/Font/k121mono', '588 0 R')
nf = 0
for x, fn, L in ((985, b'k18b1', TJS[985]), (1090, b'k121mono', TJS[1090])):
    b = d.xref_stream(x)
    for X, Y, s in L:
        old = (b'BT/k27mono 5.6625006 Tf ' + (X + ' ' + Y + ' TD[<' + dig(WANT[s]) + '>]TJ').encode())
        assert b.count(old) == 1, ('font swap', x, X, Y, b.count(old))
        b = b.replace(old, b'BT/' + fn + old[len(b'BT/k27mono'):]); nf += 1
    d.update_stream(x, b)
assert nf == 3, ('font swap', nf)
# ② 沖繩 EQV
def g(s): return ''.join('%04X' % (ord(c) - 29) for c in s)
W = {'B78X': 2444, 'A21N': 2500, 'EQV': 2109}
TY = re.compile(rb'BT/k18 ([\d.]+) Tf ([\d.]+) ([\d.]+) TD\[<(' + g('B78X').encode() + rb'|' + g('A21N').encode() + rb')>\]TJ')
b = d.xref_stream(721); n2 = 0
def sub(m):
    global n2
    old = 'B78X' if m.group(4) == g('B78X').encode() else 'A21N'; sz = float(m.group(1))
    x0 = float(m.group(2)) + (W[old] - W['EQV']) / 2000.0 * sz; n2 += 1
    return b'BT/k18 ' + m.group(1) + b' Tf ' + ('%.5f' % x0).encode() + b' ' + m.group(3) + b' TD[<' + g('EQV').encode() + b'>]TJ'
b = TY.sub(sub, b); d.update_stream(721, b)
assert n2 == 20, ('OKA cells', n2)
d.save(OUT, garbage=3, deflate=True, clean=False)
# 核對（文字層）
d2 = fitz.open(OUT)
def rows(pg, pat):
    sp = [x for bl in pg.get_text('dict')['blocks'] for l in bl.get('lines', []) for x in l['spans']]
    return sp
p17 = d2[16].get_text(); p24 = d2[23].get_text(); p4 = d2[3].get_text()
assert p17.count('1·345·7') == 2 and p17.count('12·456·') == 2, 'p17'
assert p24.count('1·345·7') == 2 and p24.count('12·456·') == 2, 'p24'
sp = rows(d2[3], None); oy = [x['origin'][1] for x in sp if re.match(r'^KX 1(4[0-9]|50)$', x['text'].strip())]
ty = [x['text'].strip() for x in sp if x['text'].strip() in ('B78X', 'A21N', 'EQV') and any(abs(x['origin'][1] - y) < 2 for y in oy)]
assert len(ty) == 20 and set(ty) == {'EQV'}, ('OKA rows', ty)
print('tt121: days', n1, 'OKA EQV', n2)
