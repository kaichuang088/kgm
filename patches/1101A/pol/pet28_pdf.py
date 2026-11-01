# 1101A：《動物運送規定》KGM-PET-009 PDF（1102A Rev. C） —— 跟其他規章同一個版型（1023A pol/render_pol.doc_html），條文來源＝../pet_doc.py（網站內嵌同一份）
#   用法：python3 pet28_pdf.py <lxgw-wenkai-webfont 套件目錄> <輸出目錄>
import sys, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..', '1023A', 'pol')
sys.path.insert(0, P); sys.path.insert(0, os.path.dirname(D))
PKG, OUT = sys.argv[1], sys.argv[2]
import render_pol as RP
import pet_doc
d = pet_doc.doc()
c = dict(id=pet_doc.ID, t=d['t'], en=d['en'], ver=d['ver'], h=d['h'], kick='規 章 文 件', meta=[
    ['文件編號', pet_doc.ID, '版　　次', d['ver']], ['核定日期', '2026-11-01', '生效日期', d['eff']],
    ['前一版次', '2026.11（Rev. B）', '條文總數', '全文 %d 條' % d['arts']], ['主辦單位', d['owner'], '核定層級', '董事長'],
    ['文件等級', '對外公開（Public）', '保存年限', '永久保存（電子檔）'],
    ['適用範圍', '攜帶寵物、服務性動物或情緒支持動物之旅客，及受理其申請之本公司與其代理人員。']],
    sign=['地勤服務處', '法務暨法令遵循室', '營運管理委員會', '董事長'],
    rev=[['2026.11', 'Rev. C', d['eff'], '申請時限以各航段出發地當地時間逐段計算，來回或多航段得一併申請；攜帶客艙寵物得指定座位，選位費經濟艙美金三十元、豪華經濟艙美金四十元（每一航段），不因票價方案含免費選位而免收（第 3 條、第 8 條、表四）。'],
         ['2026.11', 'Rev. B', '2026-11-01', '明定「可帶上客艙／只能托運貨艙／只受理貨運／不受理」之判斷表；客艙限經濟艙及豪華經濟艙；貨艙動物連同運輸籠 45 公斤、運輸籠三邊合計 292 公分及三級費用；英國、澳洲、紐西蘭、夏威夷、香港、阿聯只受理貨運；線上申請（寵物同行申請頁、AI 助理）與案件編號；費用於報到時支付；夥伴航空營運航段依營運航空規定。'],
         ['2026.09', 'Rev. A', '2026-09-14', '全文改寫並重新編章。明定申請時限為起飛前七十二小時及每航班受理數量上限；區分服務性動物與情緒支持動物之受理條件；明定文件不備之責任歸屬。'],
         ['2026.03', 'Rev. A', '2026-03-01', '首次發布。']])
FN = '09_KGM_動物運送規定.pdf'
os.makedirs(OUT, exist_ok=True)
p = os.path.join(OUT, FN.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(RP.doc_html(c))
subprocess.check_call([sys.executable, os.path.join(P, 'mkfont_lxgw.py'), PKG, RP.FONT, p])
from weasyprint import HTML
HTML(filename=p).write_pdf(os.path.join(OUT, FN))
print('ok', FN, d['arts'], 'arts')
