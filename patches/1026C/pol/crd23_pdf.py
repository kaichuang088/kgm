# 1023A：《KGM Cards 聯名卡使用辦法》KGM-CRD-020 PDF —— 跟其他規章同一個版型（render_pol.doc_html），條文來源＝crd_doc.py（網站內嵌同一份）
#   用法：python3 crd23_pdf.py <lxgw 套件目錄> <輸出目錄>
import sys, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(D)); sys.path.insert(0, D)
PKG, OUT = sys.argv[1], sys.argv[2]
import render_pol as RP
import crd_doc
d = crd_doc.doc()
c = dict(id=crd_doc.ID, t=d['t'], en=d['en'], ver=d['ver'], h=d['h'], kick='規 章 文 件', meta=[
    ['文件編號', crd_doc.ID, '版　　次', d['ver']], ['核定日期', '2026-10-25', '生效日期', d['eff']],
    ['前一版次', '—（首次發布；取代 STAR-Gen Bank × KGM Credit Card 說明舊版）', '條文總數', '全文 %d 條' % d['arts']], ['主辦單位', d['owner'], '核定層級', '董事長'],
    ['文件等級', '對外公開（Public）', '保存年限', '永久保存（電子檔）'],
    ['適用範圍', 'STAR-Gen 銀行與本公司合作發行之 KGM Cards 聯名信用卡（Star K、Star G、Star M）全部持卡人，及於本公司官網綁定該卡之 KGM Explorer 會員。']],
    sign=['商務暨聯盟合作處', '法務暨法令遵循室', '營運管理委員會', '董事長'],
    rev=[['2026.10', 'Rev. A', d['eff'], '首次發布：卡別、年費、哩程回饋、機場及旅行禮遇依本版重新訂定；官網帳戶僅得綁定本卡，並明定綁定核對項目及卡號保存範圍。']])
FN = '20_KGM_KGM Cards聯名卡使用辦法.pdf'
os.makedirs(OUT, exist_ok=True)
p = os.path.join(OUT, FN.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(RP.doc_html(c))
subprocess.check_call([sys.executable, os.path.join(D, 'mkfont_lxgw.py'), PKG, RP.FONT, p])
from weasyprint import HTML
HTML(filename=p).write_pdf(os.path.join(OUT, FN))
print('ok', FN, d['arts'], 'arts')
