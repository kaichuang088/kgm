from common import *
import json
# ══ 1101A ═══════════════════════════════════════════════════════════════
#   使用者（1027A 交付後）三輪回饋，逐條見 notes/1101A-pass130-notes.md。
#   比對基準：1027A 最終版 w77（/tmp/j/kgm1026C_w77.html，patches/1026C/build.sh 重建，跟交付檔逐位元相同）。
#   程式內部標記一律 1101A／R1101A。
CUR=open('/tmp/j/kgm1026C_w77.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]
# ══ A：時刻（js/bt26.js 1101A 版：EARLY27 加 KX262／KX66／KX9、WIN28 非曼谷航線 01:30–03:59 不抵達）══
RW('bt28 window',open('../1026C/js/bt26.js',encoding='utf-8').read(),JS('bt26.js'))

open('p_h_r28.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
