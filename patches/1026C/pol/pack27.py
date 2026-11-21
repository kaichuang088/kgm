# 1026C（交付 1027A）：KGM_Policies 彙編 = 1026B 交付的 20 份（條文沒有改）＋新增 21《團體訂位規章》KGM-GRP-021
#   用法：python3 pack27.py <1026B 的 KGM_Policies 資料夾> <grp27_pdf.py 輸出的 PDF> <輸出 ZIP>
import sys, os, shutil, zipfile, tempfile, re
src, pdf, out = sys.argv[1], sys.argv[2], sys.argv[3]
from pypdf import PdfReader
pages = len(PdfReader(pdf).pages)
tmp = tempfile.mkdtemp(); root = os.path.join(tmp, 'KGM_Policies')
shutil.copytree(src, root)
shutil.copy2(pdf, os.path.join(root, 'Policy', '對外', os.path.basename(pdf)))
ix = os.path.join(root, '00_KGM_規章文件彙編目錄.txt'); t = open(ix, encoding='utf-8').read()
row20 = '| 20 | KGM-CRD-020 | KGM Cards 聯名卡使用辦法 | 2026.10（Rev. A） | 10 頁 | 商務暨聯盟合作處　會同 KGM Explorer 會員中心 |'
assert t.count(row20) == 1
t = t.replace(row20, row20 + '\n| 21 | KGM-GRP-021 | 團體訂位規章 | 2026.10（Rev. A） | %d 頁 | 營業處團體業務組　會同 旅客服務處 |' % pages)
l20 = '　　20_KGM_KGM Cards聯名卡使用辦法.pdf'
assert t.count(l20) == 1
t = t.replace(l20, l20 + '\n　　' + os.path.basename(pdf))
m = list(re.finditer(r'　　（十三）新增 KGM-CRD-020[^\n]*(\n　　　　　　[^\n]*)*', t))
assert len(m) == 1
t = t[:m[0].end()] + ('\n　　（十四）新增 KGM-GRP-021《團體訂位規章》（2026-10-26 施行）：團體優惠（Q）／團體彈性（U）兩方案、名單與尾款期限、\n'
                     '　　　　　　免手續費增減人數、改票退票費、團體案件編號與開票後一人一 PNR、隨時免費選位、彈性方案哩程升等、\n'
                     '　　　　　　不適用網路報到與 Residence 競標、包機（起飛前 6 個月）與自創航班（3 個月）申請及人工核准。') + t[m[0].end():]
t = t.replace('1025A 新增第 20 份；1026B 網站交付時重新核對，條文均無異動', '1025A 新增第 20 份；1026B 網站交付時重新核對，條文均無異動；1027A 新增第 21 份')
open(ix, 'w', encoding='utf-8').write(t)
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(root):
        for f in sorted(fs):
            p = os.path.join(d, f); z.write(p, os.path.relpath(p, tmp))
print('ok', out, pages, 'pages')
