# 1108B B6：測試腳本裡寫死的班號照網站同一份對照換成新班號（kx39.py 的 mp；1～3 位數，4 位數不動）
# 用法：python3 kx39map.py <檔案…>（就地改寫；印出每個檔換了幾個）
import re, sys
sys.path.insert(0, __import__('os').path.dirname(__file__))
from kx39 import mp
PAT = re.compile(r'(?<![A-Za-z0-9_])KX([1-9]\d{0,2})(?![0-9A-Za-z\\\[])(?![\'"]\s*\+)')
RUN = re.compile(r'(?<![A-Za-z0-9_])KX[1-9]\d{0,2}(?:\s*[/／]\s*[1-9]\d{0,2}(?![\d:.]))+')
for fn in sys.argv[1:]:
    s = open(fn, encoding='utf-8').read()
    s2, nr = RUN.subn(lambda m: re.sub(r'(?<=[/／])(\s*)([1-9]\d{0,2})(?![\d:.])', lambda q: q.group(1) + str(mp(int(q.group(2)))), m.group(0)), s)
    s2, n = PAT.subn(lambda m: 'KX' + str(mp(int(m.group(1)))), s2)
    if s2 != s: open(fn, 'w', encoding='utf-8').write(s2)
    print(fn, n, nr)
