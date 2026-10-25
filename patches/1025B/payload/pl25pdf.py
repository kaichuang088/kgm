# 1025B R：每班冬季／夏季 Payload 限座表（資料由 tests/pl25dump.js 從網站匯出：kgmPaxCapR1025B，跟販售用的是同一支）
# 用法：python3 pl25pdf.py <pl25.json> <out.pdf>
import json, sys, re
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import ParagraphStyle

src, out = sys.argv[1], sys.argv[2]
D = json.load(open(src))
pdfmetrics.registerFont(TTFont('CJK', '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont('Mono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
GREEN = colors.HexColor('#0B3D2E'); GOLD = colors.HexColor('#9A7B2F'); INK = colors.HexColor('#14231D'); MUT = colors.HexColor('#66726C')
LINE = colors.HexColor('#DDE3E0'); AMB = colors.HexColor('#FFF6E2'); RED = colors.HexColor('#B4472F'); PALE = colors.HexColor('#F4F7F5')

def P(t, size=9, color=INK, lead=None, bold=False, align=0):
    return Paragraph(t, ParagraphStyle('p', fontName='CJK', fontSize=size, leading=lead or size * 1.45, textColor=color, alignment=align))

def hm(m):
    if not m: return '—'
    return '%d:%02d' % (m // 60, m % 60)

def num(code):
    m = re.match(r'KX(\d+)', code); return int(m.group(1)) if m else 9999

rows = sorted(D['rows'], key=lambda r: (num(r['code']), r['fr'], (r.get('s') or r.get('w') or {}).get('dep') or ''))
# 同班號同航段、冬夏數字都一樣的重複列（KX4／KX24 一班號兩列）只留一列
seen = set(); R = []
for r in rows:
    k = (r['code'], r['fr'], r['to'], json.dumps([(r.get(s) or {}).get(x) for s in 'sw' for x in ('type', 'blk', 'blocked')]))
    if k in seen: continue
    seen.add(k); R.append(r)

W, H = landscape(A4)
def deco(c, doc):
    c.saveState()
    c.setFillColor(GREEN); c.rect(0, H - 16 * mm, W, 16 * mm, stroke=0, fill=1)
    c.setFillColor(colors.white); c.setFont('CJK', 12); c.drawString(14 * mm, H - 10.5 * mm, 'KGM AIRWAYS')
    c.setFillColor(colors.HexColor('#E9C46A')); c.setFont('CJK', 10); c.drawString(48 * mm, H - 10.5 * mm, '每班 Payload 限座表  ·  2026／27 冬季與 2027 夏季')
    c.setFillColor(MUT); c.setFont('CJK', 7.5)
    c.drawString(14 * mm, 8 * mm, '1025B · 資料來源：網站 kgmPaxCapR1025B（販售系統 sell54 用同一支計算）')
    c.drawRightString(W - 14 * mm, 8 * mm, '第 %d 頁' % doc.page)
    c.restoreState()

doc = BaseDocTemplate(out, pagesize=landscape(A4), leftMargin=14 * mm, rightMargin=14 * mm, topMargin=22 * mm, bottomMargin=14 * mm,
                      title='KGM Airways Payload 限座表 1025B', author='KGM Airways')
doc.addPageTemplates([PageTemplate(id='p', frames=[Frame(14 * mm, 14 * mm, W - 28 * mm, H - 36 * mm, id='f')], onPage=deco)])
S = []

# ── 第一頁：說明＋校正 ──
blocked_rows = [r for r in R if any((r.get(s) or {}).get('blocked') for s in 'sw')]
wb = sum(1 for r in R if (r.get('w') or {}).get('blocked')); sb = sum(1 for r in R if (r.get('s') or {}).get('blocked'))
S.append(P('每班 Payload 限座表', 20, GREEN, 26))
S.append(P('飛得越久要帶的油越多；最大起飛重量扣掉空重和燃油之後能載的人變少，經濟艙就要少賣幾位（可賣的數量，不是指定座位）。'
           '本表列出每一個 KGM 自營直飛航段在夏季與冬季的估計飛行時間、滿載上限、可載旅客與經濟艙少賣座位；網站販售（經濟艙可賣座位）已依此扣除。', 9.5, INK, 15))
S.append(Spacer(1, 4 * mm))
S.append(P('<b>計算方式</b>', 11, GREEN, 16))
for t in [
    '① 飛行時間：沿實際航路（避開俄羅斯、烏克蘭、白俄羅斯、伊朗、伊拉克、敘利亞、以色列、巴勒斯坦、黎巴嫩、葉門、阿富汗、北韓空域）＋當季高空風＋該機型巡航速度算空中時間，再加滑行 30 分。'
    '這是物理估算，不是時刻表時間（時刻表本身沒有改）。',
    '② 滿載上限 T0：超過這個輪擋時間才開始少賣。T0＝0.5 小時＋型錄航程 × 係數 ÷ 巡航速度。'
    '亞洲—歐洲（走中亞／高加索走廊）用華航校正係數 0.684；其他長程（越太平洋、澳紐、中東）沒有校正資料，用型錄航程（係數 1.0）。',
    '③ 少賣座位＝全機座位 × 14.8% ×（飛行時間 − T0）小時，四捨五入，最多整個經濟艙；可載旅客＝全機座位 − 少賣；旅客 Payload＝可載旅客 × 100 kg（旅客 77＋手提 7＋行李）。',
    '④ 機型：該季實際派的機型（同一班號冬夏不同機型的照各季）；座位數讀網站各機型座位圖。',
]:
    S.append(P(t, 8.8, INK, 13.5)); S.append(Spacer(1, 1.2 * mm))
S.append(Spacer(1, 3 * mm))
S.append(P('<b>校正：華航 A359（306 席）台北直飛歐洲，冬季少賣座位（使用者提供）</b>', 11, GREEN, 16))
cal = {x['to']: x['c'] for x in D['cal']}
CI = {'LHR': 80, 'AMS': 107, 'FRA': 59, 'VIE': 25, 'PRG': 40, 'FCO': 31}
tb = [[P('航線', 8.5, colors.white), P('避戰航路 km', 8.5, colors.white), P('估計輪擋', 8.5, colors.white), P('華航少賣', 8.5, colors.white), P('本模型', 8.5, colors.white), P('差', 8.5, colors.white)]]
for k in ['LHR', 'AMS', 'FRA', 'VIE', 'PRG', 'FCO']:
    c = cal[k]; d = c['blocked'] - CI[k]
    tb.append([P('台北 → ' + k, 8.5), P('{:,}'.format(c['km']) if c.get('km') else '—', 8.5), P(hm(c['blockMin']), 8.5), P(str(CI[k]), 8.5), P(str(c['blocked']), 8.5), P(('+' if d > 0 else '') + str(d), 8.5, RED if abs(d) >= 10 else INK)])
t = Table(tb, colWidths=[34 * mm, 30 * mm, 24 * mm, 22 * mm, 22 * mm, 16 * mm])
t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), GREEN), ('LINEBELOW', (0, 1), (-1, -1), 0.4, LINE), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3)]))
S.append(t)
S.append(Spacer(1, 2 * mm))
S.append(P('誤差約 15 席（RMSE）。AMS 107 比更遠的 LHR 80 還多，任何只看距離、風、航路的模型都對不上（應是華航該線自己的貨郵或機型配置因素）；FRA、VIE、PRG 在 2 席以內。', 8.5, MUT, 13))
S.append(Spacer(1, 4 * mm))
S.append(P('<b>總覽</b>：共 %d 個航段；冬季有限座 %d 個、夏季 %d 個（其餘飛行時間在滿載上限內，不少賣）。' % (len(R), wb, sb), 9.5, INK, 15))
top = sorted([(r['code'], r['fr'], r['to'], (r.get('w') or {}).get('type'), (r.get('w') or {}).get('blocked') or 0, (r.get('w') or {}).get('y') or 0) for r in R], key=lambda x: -x[4])[:8]
S.append(P('冬季少賣最多：' + '、'.join('%s %s→%s（%s，經濟艙 %d 席少賣 %d）' % (a, b, c, d, f, e) for a, b, c, d, e, f in top if e), 8.8, INK, 13.5))
S.append(PageBreak())

# ── 每班表 ──
hdr1 = ['', '', '夏季（2027 年 6–8 月）', '', '', '', '', '冬季（2026 年 12 月–2027 年 2 月）', '', '', '', '', '']
hdr2 = ['班號', '航段', '機型', '座位／經濟', '輪擋', '滿載上限', '可載／少賣', '機型', '座位／經濟', '輪擋', '滿載上限', '可載／少賣', '避戰航路']
def cell(v, key):
    if not v: return '—'
    if key == 'seat': return '%d／%d' % (v['seats'], v['y'])
    if key == 'blk': return hm(v['blk'])
    if key == 'lim': return hm(v.get('lim'))
    if key == 'cap': return ('%d／<font color="#B4472F"><b>-%d</b></font>' % (v['mx'], v['blocked'])) if v['blocked'] else ('%d／0' % v['mx'])
    return str(v.get(key) or '—')
data = [[P(x, 8, colors.white, 10, align=1) for x in hdr1], [P(x, 7.6, colors.white, 10) for x in hdr2]]
styles = [('SPAN', (2, 0), (6, 0)), ('SPAN', (7, 0), (11, 0)), ('BACKGROUND', (0, 0), (-1, 1), GREEN), ('LINEBELOW', (0, 2), (-1, -1), 0.3, LINE),
          ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('TOPPADDING', (0, 0), (-1, -1), 2.2), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.2),
          ('LINEBEFORE', (7, 0), (7, -1), 0.8, GOLD), ('LINEBEFORE', (2, 0), (2, -1), 0.8, GOLD), ('LINEBEFORE', (12, 0), (12, -1), 0.8, GOLD)]
for i, r in enumerate(R):
    s, w = r.get('s'), r.get('w')
    for v in (s, w):
        if v: v['lim'] = None
    row = [P('<font name="Mono">%s</font>' % r['code'], 8), P('%s→%s' % (r['fr'], r['to']), 8)]
    for v in (s, w):
        if not v: row += [P('不飛', 7.6, MUT)] + [P('', 7.6)] * 4; continue
        row += [P(v['type'] or '—', 7.8), P(cell(v, 'seat'), 7.8), P(cell(v, 'blk'), 7.8), P(hm(v.get('limit')) if v.get('limit') else '—', 7.8), P(cell(v, 'cap'), 7.8)]
    km = (w or s or {}).get('km'); row.append(P(('{:,} km'.format(km)) if km else '—', 7.6, MUT if not km else INK))
    data.append(row)
    if (s and s['blocked']) or (w and w['blocked']): styles.append(('BACKGROUND', (0, i + 2), (-1, i + 2), AMB))
cw = [16 * mm, 21 * mm, 15 * mm, 21 * mm, 14 * mm, 16 * mm, 22 * mm, 15 * mm, 21 * mm, 14 * mm, 16 * mm, 22 * mm, 22 * mm]
t = Table(data, colWidths=cw, repeatRows=2)
t.setStyle(TableStyle(styles))
S.append(t)
S.append(Spacer(1, 3 * mm))
S.append(P('「可載／少賣」＝可載旅客上限／經濟艙少賣座位（紅字）。底色標黃＝該航段至少一季有限座。「避戰航路」＝大圓會經過關閉空域、改走繞道航路後的距離。'
           '同一班號同一航段冬夏數字完全相同的重複列（一班號兩個時段）只列一次。', 8, MUT, 12))
doc.build(S)
print('rows', len(R), 'winter blocked', wb, 'summer blocked', sb)
