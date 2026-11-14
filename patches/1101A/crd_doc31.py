# 1103A：《KGM Cards 聯名卡使用辦法》KGM-CRD-020 Rev. B —— 以 1023A crd_doc.py（Rev. A）為底，只改這一輪使用者要的三件事：
#   ① Star G／Star M 簽帳累積會籍積分（同時計入自營航班會籍積分；KGM-FFP-011 Rev. D 第四條之一）——使用者：「使用STAR G/M也要送會籍積分和自營會籍積分」
#   ② 機場接送：Star G／Star M 每曆年二次——使用者：「包含一年兩次機場接送也要有這個系統喔在這種卡片使用者」
#   ③ 第九條「不列入資格哩程」那句改寫（卡等改看會籍積分）
#   卡別、回饋比率、年費、申辦條件都沿用 Rev. A（使用者：「我記得應該有，如果沒有的話就是…」→ 網站已有，照原本的）。
#   新增的「機場接送」排在第四章最後（第十七條），第一～十六條條號不變。網站內嵌（gen_r28 'crd31 doc'）與 PDF（pol/crd31_pdf.py）共用這一份。
import sys, os, copy, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '1023A'))
import crd_doc as A
ID = A.ID
META = dict(A.META); META['ver'] = '2026.11（Rev. B）'; META['eff'] = '2026-11-15'
TP = A.TBL('表四　會籍積分（KGM-FFP-011 第四條之一）', ['項目', 'Star K', 'Star G', 'Star M'], [
  ['每新臺幣一萬元簽帳', '—', '二分', '三分'],
  ['計入', '—', '會籍積分及自營航班會籍積分', '會籍積分及自營航班會籍積分'],
  ['每曆年上限', '—', '一百分', '二百分']])
CH = copy.deepcopy(A.CH)
def art(chi, title):
  for t in CH[chi][1]:
    if t[0] == title: return t
  raise KeyError(title)
# ③＋① 第九條（入帳）
t = art(2, '入帳'); ps = t[1]
old = '本卡回饋之哩程為可兌換哩程，不列入會員等級之資格哩程或資格航段。'
assert old in ps
ps[ps.index(old)] = '本卡回饋之哩程為可兌換哩程，不列入卡等門檻。'
ps.append('Star G 及 Star M 持卡人另依表四累積會籍積分，同時計入會籍積分及自營航班會籍積分；以每曆年已入帳之帳單簽帳金額計算，未滿新臺幣一萬元部分不予累計，第十條所列項目不計入。')
ps.append(TP)
# ② 表三加一列＋第四章新增一條
PERKS = A.PERKS.replace('<tr><td>旅遊平安保險', '<tr><td>機場接送（桃園、松山）</td><td>—</td><td>每曆年二次</td><td>每曆年二次</td></tr><tr><td>旅遊平安保險')
assert PERKS != A.PERKS
t = art(3, '禮遇內容'); t[1][t[1].index(A.PERKS)] = PERKS
CH[3][1].append(('機場接送', [
  'Star G 及 Star M 正卡持卡人每曆年得使用機場接送二次，限搭乘本公司營運航班當日往返臺灣桃園國際機場或臺北松山機場；附卡持卡人與正卡共用次數。',
  '持卡人應於本公司官網「KGM Cards › 機場接送」選擇航班並填寫接送地址、人數（至多四人）及車型預約；每次預約限單程。',
  '於班機起飛（接機為抵達）時間二十四小時前取消者，退還次數；逾時取消或未到者，視為已使用。',
  '次數以每一曆年計算，未使用完畢者不得遞延至次年。']))
def doc():
  saveC, saveM = A.CH, A.META
  try:
    A.CH = CH; d = A.doc(); d.update({k: META[k] for k in ('ver', 'eff')}); return d
  finally:
    A.CH = saveC
def old_doc():
  return A.doc()
if __name__ == '__main__':
  d = doc(); print(d['ver'], d['arts'], len(d['h']))
