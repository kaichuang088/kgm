# 1012A：KGM_Policies 依使用者要求分成 Policy／Contract 兩大資料夾，各再分「對員工」「對外」。
# 用法：python3 pack_pol12.py <原本平放的 KGM_Policies 資料夾> <輸出 ZIP>
# 檔名（含 01～19 序號）不變，跟目錄、文件編號對得起來；目錄檔 00 放在最上層並加上資料夾說明。
import sys, os, shutil, zipfile, tempfile, re
src, out = sys.argv[1], sys.argv[2]
GROUP = {
  'Contract/對外':   ['01', '11', '19'],
  'Contract/對員工': ['18'],
  'Policy/對員工':   ['15', '17'],
  'Policy/對外':     ['02', '03', '04', '05', '06', '07', '08', '09', '10', '12', '13', '14', '16'],
}
where = {n: g for g, ns in GROUP.items() for n in ns}
files = sorted(os.listdir(src))
idx = [f for f in files if f.startswith('00_')]
assert len(idx) == 1, idx
docs = [f for f in files if re.match(r'^\d\d_', f) and not f.startswith('00_')]
assert sorted(f[:2] for f in docs) == sorted(where), (sorted(f[:2] for f in docs), sorted(where))
tmp = tempfile.mkdtemp()
root = os.path.join(tmp, 'KGM_Policies')
for g in GROUP: os.makedirs(os.path.join(root, g))
for f in docs: shutil.copy2(os.path.join(src, f), os.path.join(root, where[f[:2]], f))
txt = open(os.path.join(src, idx[0]), encoding='utf-8').read()
MARK = '────────────────────────────────────────────────────────\n文件規格'
assert txt.count(MARK) == 1
names = {f[:2]: f for f in docs}
sec = ['────────────────────────────────────────────────────────', '資料夾分類（1012A 起）', '────────────────────────────────────────────────────────', '',
       '本彙編依文件性質分成「Policy（規章辦法）」與「Contract（契約／同意書）」兩大資料夾，',
       '各再依適用對象分成「對員工」與「對外」（旅客、會員及一般大眾）。檔名序號與上表相同。', '']
LAB = {'Contract/對外': 'Contract／對外　　旅客、會員簽署或適用之契約、條款及同意書',
       'Contract/對員工': 'Contract／對員工　公司與員工之契約',
       'Policy/對員工': 'Policy／對員工　　員工適用之內部規章',
       'Policy/對外': 'Policy／對外　　　旅客及一般大眾適用之作業規定與政策'}
for g in ['Contract/對外', 'Contract/對員工', 'Policy/對員工', 'Policy/對外']:
    sec.append(LAB[g])
    for n in GROUP[g]: sec.append('　　' + names[n])
    sec.append('')
txt = txt.replace(MARK, '\n'.join(sec) + '\n' + MARK)
open(os.path.join(root, idx[0]), 'w', encoding='utf-8').write(txt)
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(root):
        rel = os.path.relpath(d, tmp)
        z.write(d, rel + '/')
        for f in sorted(fs): z.write(os.path.join(d, f), os.path.join(rel, f))
print('ok', out, len(docs), 'docs')
