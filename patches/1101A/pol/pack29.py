# 1101B：KGM_Policies 彙編 = 1101A 交付的 21 份，換掉 13《航班異常處理及旅客權益辦法》（KGM-IRR-013 Rev. B，增訂第 8 條之一）與 21《團體訂位規章》（KGM-GRP-021 Rev. C），其餘沒有改
#   用法：python3 pack29.py <1101A 的 KGM_Policies 資料夾> <irr29_pdf.py 輸出的 PDF> <grp28_pdf.py 輸出的 PDF> <輸出 ZIP>
import sys, os, shutil, zipfile, tempfile, re
src, ipdf, gpdf, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
from pypdf import PdfReader
ipages = len(PdfReader(ipdf).pages); gpages = len(PdfReader(gpdf).pages)
tmp = tempfile.mkdtemp(); root = os.path.join(tmp, 'KGM_Policies')
shutil.copytree(src, root)
idst = os.path.join(root, 'Policy', '對外', '13_KGM_航班異常處理及旅客權益辦法.pdf'); assert os.path.exists(idst); shutil.copy2(ipdf, idst)
gdst = os.path.join(root, 'Policy', '對外', '21_KGM_團體訂位規章.pdf'); assert os.path.exists(gdst); shutil.copy2(gpdf, gdst)
ix = os.path.join(root, '00_KGM_規章文件彙編目錄.txt'); t = open(ix, encoding='utf-8').read()
row = '| 13 | KGM-IRR-013 | 航班異常處理及旅客權益辦法 | 2026.09（Rev. A） | 7 頁 | 聯合管制中心　會同旅客服務處 |'
assert t.count(row) == 1
t = t.replace(row, '| 13 | KGM-IRR-013 | 航班異常處理及旅客權益辦法 | 2026.11（Rev. B） | %d 頁 | 聯合管制中心　會同旅客服務處 |' % ipages)
grow = [l for l in t.split('\n') if l.startswith('| 21 | KGM-GRP-021 |')]
assert len(grow) == 1
t = t.replace(grow[0], '| 21 | KGM-GRP-021 | 團體訂位規章 | 2026.11（Rev. C） | %d 頁 | 營業處團體業務組　會同 旅客服務處 |' % gpages)
m = list(re.finditer(r'　　（十六）KGM-GRP-021[^\n]*(\n　　　　　　[^\n]*)*', t))
assert len(m) == 1
t = t[:m[0].end()] + ('\n　　（十七）KGM-IRR-013《航班異常處理及旅客權益辦法》改版 Rev. B（2026-11-08 施行）：增訂第 8 條之一「座位之非自願調整」——\n'
                     '　　　　　　調整順序（系統劃位→經濟艙基本→自選座位）、自選座位被調整者退還選位費並二擇一補償（哩程 500／1,200 或抵用券 USD 20／30）。\n'
                     '　　（十八）KGM-GRP-021《團體訂位規章》改版 Rev. C（2026-11-08 施行）：票價不再列與一般票價之比例；改票手續費改為每筆訂位每次收取一次（金額不變），退票仍按人計。') + t[m[0].end():]
assert t.count('1101A 第 09 份改版 Rev. B') == 1
t = t.replace('1101A 第 09 份改版 Rev. B', '1101A 第 09 份改版 Rev. B；1101B 第 13 份改版 Rev. B、第 21 份改版 Rev. C')
open(ix, 'w', encoding='utf-8').write(t)
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(root):
        for f in sorted(fs):
            p = os.path.join(d, f); z.write(p, os.path.relpath(p, tmp))
print('ok', out, ipages, gpages)
