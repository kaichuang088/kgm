# 1101B：《航班異常處理及旅客權益辦法》KGM-IRR-013 Rev. B PDF —— 跟其他規章同一個版型（1023A pol/render_pol.doc_html），條文＝../irr_doc29.py（網站內嵌同一份）
#   用法：python3 irr29_pdf.py <lxgw-wenkai-webfont 套件目錄> <輸出目錄>
import sys, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..', '1023A', 'pol')
sys.path.insert(0, P); sys.path.insert(0, os.path.dirname(D))
PKG, OUT = sys.argv[1], sys.argv[2]
import render_pol as RP
import irr_doc29
d = irr_doc29.doc()
# 目錄：共用的 toc_html 只認「第 N 條　」→ 這份多一條「第 8 條之一」，這裡換一個也認「第 N 條之一」的版本（其他規章不受影響）
import re
def toc29(h):
    out = []
    for m in re.finditer(r'<h4 class="ch">(第.+?章)　(.*?)</h4>(.*?)(?=<h4 class="ch">|$)', h, re.S):
        arts = re.findall(r'<span class="t">第 (\d+) 條(之[一二三四五六七八九十]+)?　(.*?)</span>', m.group(3))
        rng = '第 %s 條' % arts[0][0] if len(arts) == 1 else '第 %s–%s 條' % (arts[0][0], arts[-1][0])
        out.append('<div class="c"><span><span class="n">%s</span>%s</span><span>%s</span></div>' % (m.group(1), m.group(2), rng))
        out.append('<div class="a">' + ''.join('第 %s 條%s　%s<br>' % a for a in arts) + '</div>')
    return '<div class="toc">' + ''.join(out) + '</div>'
RP.toc_html = toc29
c = dict(id=irr_doc29.ID, t=d['t'], en=d['en'], ver=d['ver'], h=d['h'], kick='規 章 文 件', meta=[
    ['文件編號', irr_doc29.ID, '版　　次', d['ver']], ['核定日期', '2026-11-01', '生效日期', d['eff']],
    ['前一版次', '2026.09（Rev. A）', '條文總數', '全文 %d 條（含第 8 條之一）' % d['arts']], ['主辦單位', d['owner'], '核定層級', '董事長'],
    ['文件等級', '對外公開（Public）', '保存年限', '永久保存（電子檔）'],
    ['適用範圍', '受航班取消、延誤、機型變更、班表調整、座位非自願調整或超賣影響之旅客。']],
    sign=['聯合管制中心', '法務暨法令遵循室', '營運管理委員會', '董事長'],
    rev=[['2026.11', 'Rev. B', d['eff'], '增訂第 8 條之一「座位之非自願調整」：因載重平衡、機型變更或 Payload 限座調整旅客座位之順序（系統劃位→經濟艙基本→自選座位）；自選座位被調整者退還選位費，並得於行程管理二擇一補償（哩程短程 500／長程 1,200 哩，或機場抵用券短程 USD 20／長程 USD 30）。'],
         ['2026.09', 'Rev. A', '2026-09-14', '全文改寫並重新編章。明定機型變更於起飛前七十二小時定案；增訂已付選位費而座位無法保留時核發案件編號及等值折抵券之程序；明定超賣時自願放棄機位之補償級距。'],
         ['2026.03', 'Rev. A', '2026-03-01', '首次發布。']])
FN = '13_KGM_航班異常處理及旅客權益辦法.pdf'
os.makedirs(OUT, exist_ok=True)
p = os.path.join(OUT, FN.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(RP.doc_html(c))
subprocess.check_call([sys.executable, os.path.join(P, 'mkfont_lxgw.py'), PKG, RP.FONT, p])
from weasyprint import HTML
HTML(filename=p).write_pdf(os.path.join(OUT, FN))
print('ok', FN, d['arts'], 'arts')
