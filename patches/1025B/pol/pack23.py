# 1025A（內部標記 1023A）：KGM_Policies 彙編 = 1012A 交付的 19 份（條文自 1012A 起沒有改過，網站內嵌條文逐字相同）＋新增 20《KGM Cards 聯名卡使用辦法》KGM-CRD-020
#   用法：python3 pack23.py <1012A 的 KGM_Policies 資料夾> <crd23_pdf.py 輸出的 PDF> <輸出 ZIP>
import sys, os, shutil, zipfile, tempfile
src, pdf, out = sys.argv[1], sys.argv[2], sys.argv[3]
from pypdf import PdfReader
pages = len(PdfReader(pdf).pages)
tmp = tempfile.mkdtemp(); root = os.path.join(tmp, 'KGM_Policies')
shutil.copytree(src, root)
dst = os.path.join(root, 'Policy', '對外', os.path.basename(pdf)); shutil.copy2(pdf, dst)
ix = os.path.join(root, '00_KGM_規章文件彙編目錄.txt'); t = open(ix, encoding='utf-8').read()
row19 = '| 19 | KGM-FRM-019 | 旅客同意書格式（設備故障補償・非自願降艙） | 2026.10（Rev. A） | 6 頁 | 旅客服務處 |'
assert t.count(row19) == 1
t = t.replace(row19, row19 + '\n| 20 | KGM-CRD-020 | KGM Cards 聯名卡使用辦法 | 2026.10（Rev. A） | %d 頁 | 商務暨聯盟合作處　會同 KGM Explorer 會員中心 |' % pages)
l16 = '　　16_KGM_Residence御璽套房競標辦法.pdf'
assert t.count(l16) == 1
t = t.replace(l16, l16 + '\n　　' + os.path.basename(pdf))
n12 = '　　　　　　KGM-RES-002 Rev. C 第四條表二、KGM-FFP-011 Rev. C 第四條表一同步標示登機組別；銀卡不再享有優先登機。'
assert t.count(n12) == 1
t = t.replace(n12, n12 + '\n　　（十三）新增 KGM-CRD-020《KGM Cards 聯名卡使用辦法》（2026-10-26 施行）：STAR-Gen 銀行 × KGM 聯名卡 Star K／Star G／Star M\n'
              '　　　　　　之卡別、年費、哩程回饋、機場及旅行禮遇；官網帳戶僅得綁定本卡，綁定核對項目及卡號只保存前六碼與末四碼。\n'
              '　　　　　　取代舊版「STAR-Gen Bank × KGM Credit Card」說明（舊版數字全部重新訂定）。')
t = t.replace('（未列為 2026.10 版次之文件，維持 2026.09 版內容，檔案未變動）', '（未列為 2026.10 版次之文件，維持 2026.09 版內容，檔案未變動；1025A 新增第 20 份）')
open(ix, 'w', encoding='utf-8').write(t)
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(root):
        for f in sorted(fs):
            p = os.path.join(d, f); z.write(p, os.path.relpath(p, tmp))
print('ok', out, pages, 'pages')
