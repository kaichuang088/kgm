#!/bin/bash
# 反覆：用目前的 EARLY27 建一版 → 求解（只看還不夠的）→ 合併進 EARLY27
set -e
for i in 1 2 3 4 5 6; do
  cd /home/user/kgm/patches/1026C && python3 gen_r27.py >/dev/null && bash build.sh /tmp/j/kgm1004B_t18.html /tmp/j/kgm1026C_it.html >/dev/null 2>&1
  cd /tmp/j && timeout 300 node early27.js /tmp/j/kgm1026C_it.html > /tmp/j/early27_it.txt
  N=$(python3 - <<'P'
import json,re
L=open('/tmp/j/early27_it.txt').read().split('\n')
new=json.loads(L[1]);short=json.loads(L[0])
p='/home/user/kgm/patches/1026C/js/bt26.js';s=open(p,encoding='utf-8').read()
cur=json.loads(re.search(r'var EARLY27=(\{[^}]*\});',s).group(1))
ch=0
for k,v in new.items():
  if cur.get(k)!=v: cur[k]=v;ch+=1
s=re.sub(r'var EARLY27=\{[^}]*\};','var EARLY27='+json.dumps(cur,ensure_ascii=False,separators=(',',':'))+';',s)
open(p,'w',encoding='utf-8').write(s)
print(len(short),ch)
P
)
  echo "iter $i short/changed: $N"
  set -- $N; if [ "$2" = "0" ]; then break; fi
done
