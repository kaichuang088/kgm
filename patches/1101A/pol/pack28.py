# 1101A：KGM_Policies 彙編 = 1027A 交付的 21 份，換掉 09《動物運送規定》（KGM-PET-009 Rev. B）與 21《團體訂位規章》（KGM-GRP-021 Rev. B），其餘條文沒有改
#   用法：python3 pack28.py <1027A 的 KGM_Policies 資料夾> <pet28_pdf.py 輸出的 PDF> <grp28_pdf.py 輸出的 PDF> <輸出 ZIP>
import sys, os, shutil, zipfile, tempfile, re
src, pdf, gpdf, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
from pypdf import PdfReader
pages = len(PdfReader(pdf).pages); gpages = len(PdfReader(gpdf).pages)
tmp = tempfile.mkdtemp(); root = os.path.join(tmp, 'KGM_Policies')
shutil.copytree(src, root)
dst = os.path.join(root, 'Policy', '對外', '09_KGM_動物運送規定.pdf'); assert os.path.exists(dst)
shutil.copy2(pdf, dst)
gdst = os.path.join(root, 'Policy', '對外', '21_KGM_團體訂位規章.pdf'); assert os.path.exists(gdst); shutil.copy2(gpdf, gdst)
ix = os.path.join(root, '00_KGM_規章文件彙編目錄.txt'); t = open(ix, encoding='utf-8').read()
row = '| 09 | KGM-PET-009 | 動物運送規定 | 2026.09（Rev. A） | 6 頁 | 地勤服務處　會同飛航安全室 |'
assert t.count(row) == 1
t = t.replace(row, '| 09 | KGM-PET-009 | 動物運送規定 | 2026.11（Rev. B） | %d 頁 | 地勤服務處　會同飛航安全室 |' % pages)
grow = [l for l in t.split('\n') if l.startswith('| 21 | KGM-GRP-021 |')]
assert len(grow) == 1
t = t.replace(grow[0], '| 21 | KGM-GRP-021 | 團體訂位規章 | 2026.11（Rev. B） | %d 頁 | 營業處團體業務組　會同 旅客服務處 |' % gpages)
m = list(re.finditer(r'　　（十四）新增 KGM-GRP-021[^\n]*(\n　　　　　　[^\n]*)*', t))
assert len(m) == 1
t = t[:m[0].end()] + ('\n　　（十五）KGM-PET-009《動物運送規定》改版 Rev. B（2026-11-01 施行）：可帶上客艙／只能托運貨艙／只受理貨運／不受理之判斷表、\n'
                     '　　　　　　客艙限經濟艙及豪華經濟艙、貨艙 45 公斤及運輸籠三級費用、英澳紐夏威夷香港阿聯只受理貨運、線上申請與案件編號。\n'
                     '　　（十六）KGM-GRP-021《團體訂位規章》改版 Rev. B（2026-11-01 施行）：優惠方案經濟艙選位每位 NT$750、豪華經濟艙選位費、\n'
                     '　　　　　　訂位前選方案且去回程同方案、整團坐得下才受理、尾款期限內訂位當下付清並提供名單、名單可填 KGM 會員卡號。') + t[m[0].end():]
t = t.replace('1027A 新增第 21 份', '1027A 新增第 21 份；1101A 第 09 份改版 Rev. B')
open(ix, 'w', encoding='utf-8').write(t)
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(root):
        for f in sorted(fs):
            p = os.path.join(d, f); z.write(p, os.path.relpath(p, tmp))
print('ok', out, pages, gpages, 'pages')
