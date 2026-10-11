from common import *
import base64, importlib.util, json, re
# ══ 1012A ═══════════════════════════════════════════════════════════════════
#   使用者（1010A 交付後）的修改清單，逐項見 notes/1012A-pass117-notes.md。
#   比對基準：1010A 最終版 w26（/tmp/j/kgm1010A_w26.html）。不要改到版號字串（build.sh 最後才換版號）。
CUR=open('/tmp/j/kgm1010A_w26.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))

open('p_h_r14.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
