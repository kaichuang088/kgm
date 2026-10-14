# 1006A：KGM_Policies 規章 PDF 排版 —— 與原彙編同一版型（A4、霞鶩文楷＋Liberation Serif、封面文件控制表、修訂履歷＋目錄、頁首章名、頁尾頁碼）
#   條文來源＝網站內嵌條文（pol6.py 產生的同一份），網站與 PDF 不會各說各話。
#   用法：python3 render_pol.py <lxgw 套件目錄> <輸出目錄>
import sys, os, re, json, html as H, subprocess
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(D))
import pol6, res_doc, hr_doc
PKG, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FONT = os.path.join(OUT, '_font')
META = json.load(open(os.path.join(os.path.dirname(D), 'meta.json'), encoding='utf-8'))
DOCS = json.load(open(os.path.join(os.path.dirname(D), 'docs_r914.json'), encoding='utf-8'))
NEW = pol6.build(DOCS)
ZH = '〇一二三四五六七八九'

def one(s): return re.sub(r'\s*\n\s*', '', s or '')
def kind(title):
    for k in ('條款', '政策', '規範', '規定', '辦法'):
        if title.endswith(k): return '本' + k
    return '本辦法'
def spaced(s): return ' '.join(s)

CSS = r'''
@font-face{font-family:"LXGW WenKai";font-weight:400;src:url("file://%(F)s/LXGWWenKai-400.ttf")}
@font-face{font-family:"LXGW WenKai";font-weight:700;src:url("file://%(F)s/LXGWWenKai-700.ttf")}
@page{size:A4;margin:25mm 20mm 22mm 20mm;
  @top-left{content:string(docid);font-size:8pt;vertical-align:bottom;padding-bottom:2.2mm;border-bottom:.7pt solid #000;width:120mm}
  @top-right{content:string(chap);font-size:8pt;vertical-align:bottom;padding-bottom:2.2mm;border-bottom:.7pt solid #000;width:50mm;text-align:right}
  @bottom-left{content:"KGM 航空股份有限公司　·　%(ID)s　·　%(VER)s　·　受控文件，列印後為非受控版本";font-size:7.5pt;vertical-align:top;padding-top:3mm;width:130mm}
  @bottom-right{content:"第 " counter(page) " 頁，共 " counter(pages) " 頁";font-size:7.5pt;vertical-align:top;padding-top:3mm;width:40mm;text-align:right}}
@page:first{@top-left{content:none;border:0}@top-right{content:none;border:0}}
html{font-family:"Liberation Serif","LXGW WenKai";font-size:12pt;line-height:1.78;color:#000}
body{margin:0}
.docid{string-set:docid content()}
/* 封面 */
.cv{page-break-after:always;text-align:center}
.cv .co{font-size:15pt;font-weight:700;letter-spacing:.18em;margin-top:2mm}
.cv .coen{font-size:8pt;letter-spacing:.18em;margin-top:1mm}
.cv .rule{border-top:2.2pt solid #000;border-bottom:.6pt solid #000;height:1.6pt;margin:6mm 0 0}
.cv .kick{font-size:11pt;letter-spacing:.5em;margin-top:20mm}
.cv h1{font-weight:400;letter-spacing:.12em;line-height:1.35;margin:7mm 0 0}
.cv .en{font-size:11.5pt;margin-top:5mm}
.cv .no{font-size:13pt;letter-spacing:.3em;margin-top:9mm}
table.meta{width:100%%;border-collapse:collapse;margin-top:12mm;font-size:10pt;line-height:1.55;text-align:left}
table.meta td{border:.8pt solid #000;padding:2.4mm 3.2mm;vertical-align:middle}
table.meta td.k{width:25mm;text-align:center;letter-spacing:.12em;background:#fff}
table.sign{width:100%%;border-collapse:collapse;margin-top:6mm;font-size:10pt}
table.sign th{border:.8pt solid #000;font-weight:400;letter-spacing:1.2em;padding:2mm 0 2mm 1.2em}
table.sign td{border:.8pt solid #000;height:15mm;vertical-align:bottom;padding-bottom:2mm;font-size:8.5pt;color:#555}
.cv .ntc{margin-top:6mm;border:.6pt solid #999;padding:3mm 4mm;font-size:8.6pt;line-height:1.75;text-align:justify}
/* 修訂履歷＋目錄 */
h2.sec{text-align:center;font-size:15pt;letter-spacing:.5em;margin:0 0 5mm;font-weight:700}
table.rev{width:100%%;border-collapse:collapse;font-size:10.5pt;line-height:1.7;margin-bottom:12mm}
table.rev th{border:.8pt solid #000;background:#eee;padding:2mm 2mm;font-weight:700}
table.rev td{border:.8pt solid #000;padding:2.4mm 3mm;vertical-align:top;text-align:center}
table.rev td.w{text-align:justify}
.toc .c{display:flex;justify-content:space-between;font-weight:700;margin-top:4mm;page-break-after:avoid}
.toc .c span.n{display:inline-block;width:22mm}
.toc .c>span+span{font-weight:400}
.toc .a{padding-left:30mm;line-height:1.95;font-size:11pt}
.tocw{page-break-after:always}
/* 條文 */
h4.ch{string-set:chap content();text-align:center;font-size:14pt;font-weight:700;letter-spacing:.2em;margin:9mm 0 5mm;padding-bottom:2.2mm;border-bottom:.8pt solid #000;page-break-after:avoid}
.art>span.t{display:block;font-weight:700;margin:5mm 0 1.6mm;page-break-after:avoid}
.art p{margin:0 0 1.6mm;text-indent:2em;text-align:justify}
ol.kuan{list-style:none;margin:0 0 1.6mm;padding:0}
ol.kuan li{padding-left:2em;text-indent:-2em;text-align:justify;margin-bottom:.8mm}
ol.kuan li b{font-weight:400}
em.term{font-style:normal;font-weight:700}
.tw{page-break-inside:avoid;break-before:avoid;margin:2mm 0 3mm}
.tw .cap{font-weight:700;font-size:10.5pt;margin-bottom:2mm;line-height:1.5}
table.t{width:100%%;border-collapse:collapse;font-size:10.5pt;line-height:1.6}
table.t caption{caption-side:top;text-align:left;font-weight:700;font-size:10.5pt;margin-bottom:2mm}
table.t th{border:.8pt solid #000;background:#eee;padding:2mm 2.4mm;font-weight:700}
table.t td{border:.8pt solid #000;padding:2mm 2.4mm;vertical-align:top}
table.t td.num{text-align:right;white-space:nowrap}
.nw{white-space:nowrap}
.note{border:.6pt solid #999;background:#f6f6f6;padding:2.4mm 3.2mm;margin:2mm 0 3mm;font-size:10.5pt;line-height:1.7;page-break-inside:avoid}
.fx{border-left:2pt solid #000;background:#f6f6f6;padding:2.4mm 3.2mm;margin:2mm 0 3mm 2em;font-weight:700;font-size:11pt}
.end{margin-top:12mm;border-top:.8pt solid #000;padding-top:5mm;text-align:center;letter-spacing:.12em;font-size:11pt}
'''

def cover_html(c):
    rows = ''
    for r in c['meta']:
        if len(r) == 2:
            rows += '<tr><td class="k">%s</td><td colspan="3">%s</td></tr>' % (r[0], r[1])
        else:
            rows += '<tr><td class="k">%s</td><td>%s</td><td class="k">%s</td><td>%s</td></tr>' % tuple(r)
    sign = '<tr>' + ''.join('<th>%s</th>' % x.replace(' ', '').replace('　', '') for x in ('擬案', '會辦', '審查', '核定')) + '</tr>'
    sign += '<tr>' + ''.join('<td>%s</td>' % x for x in c['sign']) + '</tr>'
    n = len(c['t']); fs = 26 if n <= 15 else max(19, int(470 / (n * 1.12)))
    return ('<section class="cv"><div class="co">KGM 航空股份有限公司</div><div class="coen">KGM AIRWAYS CO., LTD.</div><div class="rule"></div>'
            '<div class="kick">%s</div><h1 style="font-size:%dpt">%s</h1><div class="en">%s</div><div class="no">%s</div>'
            '<table class="meta">%s</table><table class="sign">%s</table>'
            '<div class="ntc">本文件為 KGM 航空股份有限公司 受控文件，著作權為本公司所有。未經主辦單位書面同意，不得複製、外流或作成衍生文件。'
            '自本文件封面所載生效日期起施行，同時廢止前一版次。列印本或另存本為非受控版本，使用前應向主辦單位查對現行版次；非受控版本與受控版本不一致時，'
            '以受控版本為準。本文件以正體中文版為準，英文名稱僅供參照。</div></section>'
            % (c['kick'], fs, c['t'], c['en'], c['id'], rows, sign))

def toc_html(h):
    out = []
    for m in re.finditer(r'<h4 class="ch">(第.+?章)　(.*?)</h4>(.*?)(?=<h4 class="ch">|$)', h, re.S):
        arts = re.findall(r'<span class="t">第 (\d+) 條　(.*?)</span>', m.group(3))
        rng = '第 %s 條' % arts[0][0] if len(arts) == 1 else '第 %s–%s 條' % (arts[0][0], arts[-1][0])
        out.append('<div class="c"><span><span class="n">%s</span>%s</span><span>%s</span></div>' % (m.group(1), m.group(2), rng))
        out.append('<div class="a">' + ''.join('第 %s 條　%s<br>' % a for a in arts) + '</div>')
    return '<div class="toc">' + ''.join(out) + '</div>'

def doc_html(c):
    css = CSS % dict(F=FONT, ID=c['id'], VER=c['ver'])
    rev = '<tr><th style="width:15%">版次</th><th style="width:15%">修訂編號</th><th style="width:18%">生效日期</th><th>修訂要旨</th></tr>'
    rev += ''.join('<tr><td>%s</td><td>%s</td><td>%s</td><td class="w">%s</td></tr>' % tuple(r) for r in c['rev'])
    # PDF：表號與表身不分頁（caption 在 WeasyPrint 會跟表身分開斷頁 → 包成一塊）
    body = re.sub(r'<table class="t"><caption>(.*?)</caption>(.*?)</table>', r'<div class="tw"><div class="cap">\1</div><table class="t">\2</table></div>', c['h'], flags=re.S)
    # 短的儲存格（5 字以內）不斷行（例如「類別」不會被擠成一字一行）；Wi-Fi 不在連字號斷開
    body = re.sub(r'<(td|th)>([^<]{1,5})</\1>', r'<\1 class="nw">\2</\1>', body)
    body = body.replace('Wi-Fi', '<span class="nw">Wi-Fi</span>')
    return ('<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>%s %s</title><style>%s</style></head><body>'
            '<div class="docid" style="height:0;overflow:hidden">%s　%s</div>%s'
            '<div class="tocw"><h2 class="sec">修訂履歷</h2><table class="rev">%s</table><h2 class="sec">目　　錄</h2>%s</div>'
            '%s<div class="end">%s全文完　—　%s　%s</div></body></html>'
            % (c['id'], c['t'], css, c['id'], c['t'], cover_html(c), rev, toc_html(c['h']), body, kind(c['t']), c['id'], c['ver']))

def from_meta(fname, did, d, kick, newver=None, revtxt=None):
    m = META[fname]
    rows = []
    for r in m['cover'][0]:
        r = [one(x) if x else x for x in r]
        if r[2] is None: rows.append([r[0], r[1]])
        else: rows.append(r)
    sign = [one(x) for x in m['cover'][1][1]]
    rev = [[one(x) for x in r] for r in m['rev'][1:]]
    if newver:
        old = rows[0][3]
        for r in rows:
            for i in (0, 2):
                if len(r) > i + 1 and r[i].replace('　', '').replace(' ', '') == '版次': r[i + 1] = newver
                if len(r) > i + 1 and r[i] == '核定日期': r[i + 1] = pol6.APPROVED
                if len(r) > i + 1 and r[i] == '生效日期': r[i + 1] = pol6.EFF
                if len(r) > i + 1 and r[i] == '前一版次': r[i + 1] = old
                if len(r) > i + 1 and r[i] == '條文總數': r[i + 1] = '全文 %d 條' % d['arts']
        v = re.match(r'(\d{4}\.\d\d)（(Rev\. [A-Z])）', newver)
        rev = [[v.group(1), v.group(2), pol6.EFF, revtxt]] + rev
    return dict(id=did, t=d['t'], en=d['en'], ver=d['ver'], h=d['h'], kick=kick, meta=rows, sign=sign, rev=rev)

FILES = {'KGM-RES-002': '02_KGM_訂位開票及票價使用規定.pdf', 'KGM-CHG-003': '03_KGM_機票更改重新開立及退票作業辦法.pdf',
         'KGM-FFP-011': '11_KGM_Explorer會員及哩程計畫條款.pdf', 'KGM-AWD-012': '12_KGM_酬賓機票及哩程升等規定.pdf',
         'KGM-PRV-014': '14_KGM_個人資料保護及隱私政策.pdf', 'KGM-STX-015': '15_KGM_員工票管理辦法.pdf'}
JOBS = []
for k, fn in FILES.items():
    JOBS.append((fn, from_meta(fn, k, NEW[k], '人 事 規 章' if k == 'KGM-STX-015' else '規 章 文 件', NEW[k]['ver'], pol6.REV[k])))
r = res_doc.doc()
JOBS.append(('16_KGM_Residence御璽套房競標辦法.pdf', dict(id=res_doc.ID, t=r['t'], en=r['en'], ver=r['ver'], h=r['h'], kick='規 章 文 件', meta=[
    ['文件編號', res_doc.ID, '版　　次', r['ver']], ['核定日期', pol6.APPROVED, '生效日期', r['eff']],
    ['前一版次', '—（首次發布）', '條文總數', '全文 %d 條' % r['arts']], ['主辦單位', r['owner'], '核定層級', '董事長'],
    ['文件等級', '對外公開（Public）', '保存年限', '永久保存（電子檔）'],
    ['適用範圍', '參與本公司以空中巴士 A380 執飛航段 Residence 御璽套房競標（含現金出價、里程出價及以 Residence 為標的之 BigDeal）之旅客。']],
    sign=['營收管理處', '法務暨法令遵循室', '營運管理委員會', '董事長'], rev=[['2026.10', 'Rev. A', r['eff'], '首次發布。']])))
hd = hr_doc.doc()
JOBS.append(('17_KGM_員工管理辦法.pdf', dict(id=hr_doc.ID, t=hd['t'], en=hd['en'], ver=hd['ver'], h=hd['h'], kick='人 事 規 章', meta=hd['meta'],
    sign=hd['sign'], rev=hd['rev'])))

if __name__ == '__main__':
    paths = []
    for fn, c in JOBS:
        p = os.path.join(OUT, fn.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(doc_html(c)); paths.append(p)
    subprocess.check_call([sys.executable, os.path.join(D, 'mkfont_lxgw.py'), PKG, FONT] + paths)
    from weasyprint import HTML
    for (fn, c), p in zip(JOBS, paths):
        HTML(filename=p).write_pdf(os.path.join(OUT, fn))
        print('ok', fn)
