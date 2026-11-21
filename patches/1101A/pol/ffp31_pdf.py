# 1103A：《KGM Explorer 會員及哩程計畫條款》KGM-FFP-011 Rev. D PDF —— 跟其他規章同一個版型（1023A pol/render_pol.doc_html）
#   條文＝網站實際內嵌的那一份（Rev. C 底稿＋../ffp_doc31.py PAIRS；gen_r28 'ffp31 *'），用 tests/dumppol33.js 從建好的網站匯出 JSON。
#   用法：python3 ffp31_pdf.py <lxgw-wenkai-webfont 套件目錄> <輸出目錄> <dumppol33 輸出 JSON>（render_pol 讀 argv[2] 當輸出目錄，順序不能換）
import sys, os, subprocess, json, re
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..', '1023A', 'pol')
sys.path.insert(0, P); sys.path.insert(0, os.path.dirname(D))
PKG, OUT, JS = sys.argv[1], sys.argv[2], sys.argv[3]
import render_pol as RP
d = json.load(open(JS, encoding='utf-8'))['KGM-FFP-011']
assert d['ver'] == '2026.11（Rev. D）' and '第 4 條之一' in d['h'], d['ver']
def toc31(h):   # 目錄要認「第 N 條之一」（同 irr29_pdf）
    out = []
    for m in re.finditer(r'<h4 class="ch">(第.+?章)　(.*?)</h4>(.*?)(?=<h4 class="ch">|$)', h, re.S):
        arts = re.findall(r'<span class="t">第 (\d+) 條(之[一二三四五六七八九十]+)?　(.*?)</span>', m.group(3))
        rng = '第 %s 條' % arts[0][0] if len(arts) == 1 else '第 %s–%s 條' % (arts[0][0], arts[-1][0])
        out.append('<div class="c"><span><span class="n">%s</span>%s</span><span>%s</span></div>' % (m.group(1), m.group(2), rng))
        out.append('<div class="a">' + ''.join('第 %s 條%s　%s<br>' % a for a in arts) + '</div>')
    return '<div class="toc">' + ''.join(out) + '</div>'
RP.toc_html = toc31
c = dict(id='KGM-FFP-011', t=d['t'], en=d['en'], ver=d['ver'], h=d['h'], kick='規 章 文 件', meta=[
    ['文件編號', 'KGM-FFP-011', '版　　次', d['ver']], ['核定日期', '2026-11-03', '生效日期', d['eff']],
    ['前一版次', '2026.10（Rev. C）', '條文總數', '全文 %d 條（含第 4 條之一）' % d['arts']], ['主辦單位', d['owner'], '核定層級', '董事長'],
    ['文件等級', '對外公開（Public）', '保存年限', '永久保存（電子檔）'],
    ['適用範圍', 'KGM Explorer 會員，及申請加入本計畫之個人。']],
    sign=['會員行銷處', '法務暨法令遵循室', '營運管理委員會', '董事長'],
    rev=[['2026.11', 'Rev. D', d['eff'], '卡等改依會籍積分認定：增訂第 4 條之一「會籍積分」（會籍積分及自營航班會籍積分；距離基數乘以艙等及票價家族比率；團體票為超值之 50%；Star G／Star M 簽帳依 KGM-CRD-020 表四累積），卡等門檻改為銀卡 240（120）分、金卡 480（240）分、尊爵卡 960（480）分，哩程及航段數不再作為門檻；卡等效期至取得之次年年底；二〇二七年底前只升不降。'],
         ['2026.10', 'Rev. C', '2026-10-12', '第四條表一尊爵卡及金卡之優先登機改以登機組別標示（第 1 組），與 KGM-CKI-005 第七條一致；銀卡不再享有優先登機，依搭乘艙等及票價家族登機。'],
         ['2026.10', 'Rev. B', '2026-10-06', '購買哩程價格調整為每千哩美金四十元並得辦理分級加贈促銷；購買安全審核改為第一、二次須二十四至七十二小時、第三次起即時入帳，系統標示之可疑交易一律人工核決；購買之哩程得用於酬賓及升等；刪除哩程暫扣（第十條）；卡等門檻依累積比率調整。'],
         ['2026.09', 'Rev. A', '2026-09-14', '全文改寫並重新編章。明定哩程價值固定為一哩折抵新臺幣零點三元，為全系統唯一換算基準；增訂購買哩程之二次安全審核程序；增訂哩程暫扣之定義及其效果；明定哩程效期及展延條件。'],
         ['2026.03', 'Rev. B', '2026-03-01', '調整卡等門檻並新增尊爵卡。'], ['2025.04', 'Rev. A', '2025-04-01', '首次發布。']])
FN = '11_KGM_Explorer會員及哩程計畫條款.pdf'
os.makedirs(OUT, exist_ok=True)
p = os.path.join(OUT, FN.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(RP.doc_html(c))
subprocess.check_call([sys.executable, os.path.join(P, 'mkfont_lxgw.py'), PKG, RP.FONT, p])
from weasyprint import HTML
HTML(filename=p).write_pdf(os.path.join(OUT, FN))
print('ok', FN, d['arts'], 'arts')
