# 1112A：時刻表 PDF（底稿＝1108C 交付的 PDF）只改三處、只換字形，其他一個位元都不動（跟 kx39tt 同一個做法）：
#  ① C13 KX177 台北→福岡：夏 18:05-21:45 → 17:20-20:55、冬 18:20-21:55 → 17:15-20:45（之前幾輪寫上去的 [<…>]TJ 整串，全文件各 1 格）
#  ② C12 第 19 頁右欄（赫爾辛基／蘇黎世回程）營運日：KX100 1·3·5·7 → 12·4·6·（兩列）、KX98 1·3·56· → ·2·45·7（兩列）
#     （底稿逐字畫的等寬字 DejaVuSansMono：數字 n＝glyph 0x13+n、「·」＝0x79；同一頁左欄去程不動）
# 用法：/tmp/j/venv/bin/python tt40.py <1108C PDF> <輸出 PDF>
import pymupdf as fitz, sys, re
SRC, OUT = sys.argv[1], sys.argv[2]
d = fitz.open(SRC)
TG = {**{str(i): '%04X' % (0x13 + i) for i in range(10)}, ':': '001D', '-': '0010'}
def tj(s): return ('[<' + ''.join(TG[c] for c in s) + '>]TJ').encode()
X = [x for x in range(1, d.xref_length()) if d.xref_is_stream(x)]
n1 = 0
for a, b in (('18:05-21:45', '17:20-20:55'), ('18:20-21:55', '17:15-20:45')):
    hit = [x for x in X if (d.xref_stream(x) or b'').count(tj(a)) == 1]
    assert len(hit) == 1, ('KX177', a, hit)
    d.update_stream(hit[0], d.xref_stream(hit[0]).replace(tj(a), tj(b))); n1 += 1
# ② 營運日
pg = d[18]
G = rb'<00(?:1[4-9a-fA-F]|79)>Tj'
SEQ = re.compile(rb'1 0 0 -1 ([\d.]+) ([\d.]+) Tm ' + G + rb'(?: [\d.]+ -0 TD ' + G + rb'){6}')
def s2g(s): return [b'79' if c == '·' else ('%02x' % (0x13 + int(c))).encode() for c in s]
WANT = {'1·3·5·7': '12·4·6·', '1·3·56·': '·2·45·7'}
n2 = 0
for x in range(1003, 1020):
    b = d.xref_stream(x) or b''
    out = b; shift = 0
    for m in SEQ.finditer(b):
        if abs(float(m.group(1)) - 505.10939) > 1: continue
        gs = re.findall(rb'<00([0-9a-fA-F]{2})>Tj', m.group(0)); s = ''.join('·' if g.lower() == b'79' else str(int(g, 16) - 0x13) for g in gs)
        y = float(m.group(2))
        if not ((s == '1·3·5·7' and 14600 < y < 14650) or (s == '1·3·56·' and 14730 < y < 14770)): continue
        new = s2g(WANT[s]); it = iter(new)
        rep = re.sub(rb'<00([0-9a-fA-F]{2})>Tj', lambda mm: b'<00' + next(it) + b'>Tj', m.group(0))
        out = out[:m.start() + shift] + rep + out[m.end() + shift:]; shift += len(rep) - len(m.group(0)); n2 += 1
    if out != b: d.update_stream(x, out)
assert n1 == 2 and n2 == 4, (n1, n2)
d.save(OUT, garbage=3, deflate=True, clean=False)
# 核對（文字層）
d2 = fitz.open(OUT)
t7 = d2[6].get_text(); assert '17:20-20:55' in t7 and '17:15-20:45' in t7 and '18:05-21:45' not in t7 and '18:20-21:55' not in t7, 'KX177'
tr = [(round(t['chars'][0][3][0]), round(t['chars'][0][3][1]), ''.join(chr(c[0]) for c in t['chars'])) for t in d2[18].get_texttrace() if re.fullmatch(r'[1-7·]{7}', ''.join(chr(c[0]) for c in t['chars']))]
R = {(x, y): s for x, y, s in tr}
print('page19 right col', [(y, s) for (x, y), s in sorted(R.items()) if x == 379])
print('page19 left col', [(y, s) for (x, y), s in sorted(R.items()) if x == 81])
print('tt40 OK', n1, n2)
