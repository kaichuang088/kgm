# 1102A：KGM_Policies 彙編 = 1101B 交付的 22 份，換掉 09《動物運送規定》（KGM-PET-009 Rev. C：申請時限逐段計算、來回一併申請、客艙寵物選位費），其餘沒有改
#   用法：python3 pack30.py <1101B 的 KGM_Policies 資料夾> <pet28_pdf.py 輸出的 PDF> <輸出 ZIP>
import sys, os, shutil, zipfile, tempfile, re
src, ppdf, out = sys.argv[1], sys.argv[2], sys.argv[3]
from pypdf import PdfReader
pages = len(PdfReader(ppdf).pages)
tmp = tempfile.mkdtemp(); root = os.path.join(tmp, 'KGM_Policies')
shutil.copytree(src, root)
dst = os.path.join(root, 'Policy', '對外', '09_KGM_動物運送規定.pdf'); assert os.path.exists(dst); shutil.copy2(ppdf, dst)
ix = os.path.join(root, '00_KGM_規章文件彙編目錄.txt'); t = open(ix, encoding='utf-8').read()
row = [l for l in t.split('\n') if l.startswith('| 09 | KGM-PET-009 |')]
assert len(row) == 1
t = t.replace(row[0], '| 09 | KGM-PET-009 | 動物運送規定 | 2026.11（Rev. C） | %d 頁 | 地勤服務處　會同飛航安全室 |' % pages)
m = list(re.finditer(r'　　（十八）KGM-GRP-021[^\n]*', t))
assert len(m) == 1
t = t[:m[0].end()] + ('\n　　（十九）KGM-PET-009《動物運送規定》改版 Rev. C（2026-11-08 施行）：起飛前七十二小時之申請時限以各航段出發地當地時間逐段計算，來回或多航段得一併申請；\n'
                     '　　　　　　攜帶客艙寵物之旅客得指定座位，選位費每一航段經濟艙美金三十元、豪華經濟艙美金四十元，不因票價方案含免費選位而免收。') + t[m[0].end():]
k = '1101B 第 13 份改版 Rev. B、第 21 份改版 Rev. C'
assert t.count(k) == 1
t = t.replace(k, k + '；1102A 第 09 份改版 Rev. C')
open(ix, 'w', encoding='utf-8').write(t)
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(root):
        for f in sorted(fs):
            p = os.path.join(d, f); z.write(p, os.path.relpath(p, tmp))
print('ok', out, 'pet pages', pages)
