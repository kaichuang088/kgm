# 1026C（交付 1027A）：《團體訂位規章》KGM-GRP-021 PDF —— 跟其他規章同一個版型（1023A pol/render_pol.doc_html），條文來源＝../grp_doc.py（網站內嵌同一份）
#   用法：python3 grp27_pdf.py <lxgw 套件目錄> <輸出目錄>
import sys, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..', '1023A', 'pol')
sys.path.insert(0, P); sys.path.insert(0, os.path.dirname(D))
PKG, OUT = sys.argv[1], sys.argv[2]
import render_pol as RP
import grp_doc
d = grp_doc.doc()
c = dict(id=grp_doc.ID, t=d['t'], en=d['en'], ver=d['ver'], h=d['h'], kick='規 章 文 件', meta=[
    ['文件編號', grp_doc.ID, '版　　次', d['ver']], ['核定日期', '2026-10-26', '生效日期', d['eff']],
    ['前一版次', '—（首次發布）', '條文總數', '全文 %d 條' % d['arts']], ['主辦單位', d['owner'], '核定層級', '董事長'],
    ['文件等級', '對外公開（Public）', '保存年限', '永久保存（電子檔）'],
    ['適用範圍', '經本公司核准之團體帳號（旅行社、企業、學校及各類團體）以團體優惠（Q）或團體彈性（U）方案訂購之 10–99 位同行旅客，以及包機與自創航班申請。']],
    sign=['營業處團體業務組', '旅客服務處', '法務暨法令遵循室', '董事長'],
    rev=[['2026.10', 'Rev. A', d['eff'], '首次發布：團體優惠／團體彈性兩方案（名單、尾款期限、免手續費增減人數、改票退票費）、團體案件編號與開票後一人一 PNR、隨時免費選位、行李、不適用網路報到與 Residence 競標、彈性方案哩程升等、包機（6 個月前）與自創航班（3 個月前）申請及人工核准。']])
FN = '21_KGM_團體訂位規章.pdf'
os.makedirs(OUT, exist_ok=True)
p = os.path.join(OUT, FN.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(RP.doc_html(c))
subprocess.check_call([sys.executable, os.path.join(P, 'mkfont_lxgw.py'), PKG, RP.FONT, p])
from weasyprint import HTML
HTML(filename=p).write_pdf(os.path.join(OUT, FN))
print('ok', FN, d['arts'], 'arts')
