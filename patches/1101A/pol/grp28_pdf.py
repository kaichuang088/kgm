# 1101B：Rev. C（票價不寫係數、改票手續費每筆訂位）。1101A：《團體訂位規章》KGM-GRP-021 Rev. B PDF（1026C grp27_pdf.py 改版；條文來源 ../grp_doc28.py）
#   用法：python3 grp27_pdf.py <lxgw 套件目錄> <輸出目錄>
import sys, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..', '1023A', 'pol')
sys.path.insert(0, P); sys.path.insert(0, os.path.dirname(D))
PKG, OUT = sys.argv[1], sys.argv[2]
import render_pol as RP
import grp_doc28 as grp_doc
d = grp_doc.doc()
c = dict(id=grp_doc.ID, t=d['t'], en=d['en'], ver=d['ver'], h=d['h'], kick='規 章 文 件', meta=[
    ['文件編號', grp_doc.ID, '版　　次', d['ver']], ['核定日期', '2026-11-01', '生效日期', d['eff']],
    ['前一版次', '2026.11（Rev. B）', '條文總數', '全文 %d 條' % d['arts']], ['主辦單位', d['owner'], '核定層級', '董事長'],
    ['文件等級', '對外公開（Public）', '保存年限', '永久保存（電子檔）'],
    ['適用範圍', '經本公司核准之團體帳號（旅行社、企業、學校及各類團體）以團體優惠（Q）或團體彈性（U）方案訂購之 10–99 位同行旅客，以及包機與自創航班申請。']],
    sign=['營業處團體業務組', '旅客服務處', '法務暨法令遵循室', '董事長'],
    rev=[['2026.11', 'Rev. C', d['eff'], '團體票價改以「團體最低價／團體彈性價」表示，不再列與一般票價之比例（整體仍明顯低於一般訂票）；改票手續費改為每筆訂位每次收取一次（金額不變：優惠 NT$1,400、彈性 NT$600），退票仍按人計。'],
         ['2026.11', 'Rev. B', '2026-11-01', '優惠方案經濟艙選位一次收每位 NT$750（彈性免費）、豪華經濟艙選位費（優惠 NT$2,000、彈性 NT$1,500）；訂位前先選方案、去回程同方案、回程無此方案之班次列明；整團坐得下才受理；尾款期限內訂位須當下付清並提供名單；名單可填 KGM 會員卡號（哩程入本人帳戶）。'], ['2026.10', 'Rev. A', '2026-10-26', '首次發布：團體優惠／團體彈性兩方案（名單、尾款期限、免手續費增減人數、改票退票費）、團體案件編號與開票後一人一 PNR、隨時免費選位、行李、不適用網路報到與 Residence 競標、彈性方案哩程升等、包機（6 個月前）與自創航班（3 個月前）申請及人工核准。']])
FN = '21_KGM_團體訂位規章.pdf'
os.makedirs(OUT, exist_ok=True)
p = os.path.join(OUT, FN.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(RP.doc_html(c))
subprocess.check_call([sys.executable, os.path.join(P, 'mkfont_lxgw.py'), PKG, RP.FONT, p])
from weasyprint import HTML
HTML(filename=p).write_pdf(os.path.join(OUT, FN))
print('ok', FN, d['arts'], 'arts')
