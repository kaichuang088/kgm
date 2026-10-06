# 1006A：霞鶩文楷（LXGW WenKai，與原 KGM_Policies 同字型）—— 把 npm 套件 lxgw-wenkai-webfont 的 woff2 子集合併成單一 TTF
#   WeasyPrint 對 unicode-range 分檔只會用到第一個子集，所以先合併。只合併用得到的子集（依 HTML 實際用字）。
# 用法：python3 mkfont_lxgw.py <lxgw-wenkai-webfont 套件目錄> <輸出目錄> <html...>
import sys, re, os
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
from fontTools import subset
PKG, OUT = sys.argv[1], sys.argv[2]
need = set(range(0x20, 0x7f))
for f in sys.argv[3:]: need |= set(ord(c) for c in open(f, encoding='utf-8').read())
os.makedirs(OUT, exist_ok=True)
for w, css in (('400', 'lxgwwenkai-regular.css'), ('700', 'lxgwwenkai-bold.css')):
    t = open(os.path.join(PKG, css), encoding='utf-8').read()
    files = []
    for m in re.finditer(r"src: url\('\./files/([^']+\.woff2)'\)[^;]*;\s*unicode-range: ([^}]+?)\s*}", t):
        rs = []
        for r in m.group(2).split(','):
            r = r.strip()[2:]
            a, b = (r.split('-') + [None])[:2]; a = int(a, 16); b = int(b, 16) if b else a
            rs.append((a, b))
        hit = [c for c in need if any(a <= c <= b for a, b in rs)]
        if hit: files.append((os.path.join(PKG, 'files', m.group(1)), hit))
    tt = []
    for i, (f, hit) in enumerate(files):
        ft = TTFont(f); ft.flavor = None
        o = os.path.join(OUT, '_%s_%d.ttf' % (w, i)); ft.save(o); tt.append(o)
    mg = Merger().merge(tt)
    dst = os.path.join(OUT, 'LXGWWenKai-%s.ttf' % w); mg.save(dst)
    for o in tt: os.remove(o)
    # 只留用得到的字（檔案小、WeasyPrint 載入快）
    opt = subset.Options(); opt.layout_features = ['*']; opt.name_IDs = ['*']; opt.notdef_outline = True
    ft = TTFont(dst); s = subset.Subsetter(opt); s.populate(unicodes=sorted(need)); s.subset(ft); ft.save(dst)
    have = set(TTFont(dst).getBestCmap())
    miss = sorted(c for c in need if c not in have and c > 0x2000)
    print(w, len(files), 'subsets', os.path.getsize(dst), 'bytes; CJK/全形缺字', ''.join(chr(c) for c in miss)[:80])
