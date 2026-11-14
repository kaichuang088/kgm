# 1103A：KGM_Policies 彙編 = 1102A 交付的 22 份（pack30 的結果），換掉 11《KGM Explorer 會員及哩程計畫條款》（KGM-FFP-011 Rev. D：會籍積分）、
#   20《KGM Cards 聯名卡使用辦法》（KGM-CRD-020 Rev. B：Star G／M 會籍積分、機場接送）、21《團體訂位規章》（KGM-GRP-021 Rev. D：團體票 G、團體帳號人工審核），其餘沒有改
#   用法：python3 pack31.py <1102A 的 KGM_Policies 資料夾> <ffp31_pdf.py 輸出> <crd31_pdf.py 輸出> <grp28_pdf.py 輸出> <輸出 ZIP>
#   1102A 的 ZIP 在 /tmp/j/out32/KGM_Policies_1102A.zip（解開後傳 KGM_Policies 資料夾）；跟 1102A 比只有 11、20、21 三個 PDF 不同（已核對）
import sys, os, shutil, zipfile, tempfile, re
src, fpdf, cpdf, gpdf, out = sys.argv[1:6]
from pypdf import PdfReader
n = lambda p: len(PdfReader(p).pages)
tmp = tempfile.mkdtemp(); root = os.path.join(tmp, 'KGM_Policies')
shutil.copytree(src, root)
for p, rel in ((fpdf, ('Contract', '對外', '11_KGM_Explorer會員及哩程計畫條款.pdf')), (cpdf, ('Policy', '對外', '20_KGM_KGM Cards聯名卡使用辦法.pdf')),
               (gpdf, ('Policy', '對外', '21_KGM_團體訂位規章.pdf'))):
    dst = os.path.join(root, *rel); assert os.path.exists(dst), dst; shutil.copy2(p, dst)
ix = os.path.join(root, '00_KGM_規章文件彙編目錄.txt'); t = open(ix, encoding='utf-8').read()
def row(no, new):
    r = [l for l in t.split('\n') if l.startswith('| %s | ' % no)]
    assert len(r) == 1, no
    return t.replace(r[0], new)
t = row('11', '| 11 | KGM-FFP-011 | KGM Explorer 會員及哩程計畫條款 | 2026.11（Rev. D） | %d 頁 | 會員行銷處 |' % n(fpdf))
t = row('20', '| 20 | KGM-CRD-020 | KGM Cards 聯名卡使用辦法 | 2026.11（Rev. B） | %d 頁 | 商務暨聯盟合作處　會同 KGM Explorer 會員中心 |' % n(cpdf))
t = row('21', '| 21 | KGM-GRP-021 | 團體訂位規章 | 2026.11（Rev. D） | %d 頁 | 營業處團體業務組　會同 旅客服務處 |' % n(gpdf))
m = list(re.finditer(r'　　（十九）KGM-PET-009[^\n]*(\n　　　　　　[^\n]*)*', t))
assert len(m) == 1
t = t[:m[0].end()] + (
  '\n　　（二十）KGM-FFP-011《KGM Explorer 會員及哩程計畫條款》改版 Rev. D（2026-11-15 施行）：卡等改依會籍積分認定，增訂第 4 條之一（會籍積分及自營航班會籍積分、\n'
  '　　　　　　距離基數乘以艙等及票價家族比率）；門檻銀卡 240（120）分、金卡 480（240）分、尊爵卡 960（480）分；二〇二七年底前只升不降。\n'
  '　　（二十一）KGM-CRD-020《KGM Cards 聯名卡使用辦法》改版 Rev. B（2026-11-15 施行）：Star G／Star M 簽帳累積會籍積分（表四）；增訂第十七條機場接送（每曆年二次）。\n'
  '　　（二十二）KGM-GRP-021《團體訂位規章》改版 Rev. D（2026-11-15 施行；2026-11-03 公告日起之新團體訂位適用）：團體票只剩 G 艙（可混艙、規則一致；開票後不改不退，\n'
  '　　　　　　未使用之代收稅費得申請退還）；團體帳號改為官網申請表＋團體業務組人工審核（含國籍；高風險國籍須 CEO 核准），AI 客服不得核准；首次核准 90 天試用。') + t[m[0].end():]
k = '1102A 第 09 份改版 Rev. C'
assert t.count(k) == 1
t = t.replace(k, k + '；1103A 第 11 份改版 Rev. D、第 20 份改版 Rev. B、第 21 份改版 Rev. D')
open(ix, 'w', encoding='utf-8').write(t)
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(root):
        for f in sorted(fs):
            p = os.path.join(d, f); z.write(p, os.path.relpath(p, tmp))
print('ok', out, n(fpdf), n(cpdf), n(gpdf))
