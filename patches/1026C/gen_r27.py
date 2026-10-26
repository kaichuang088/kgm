from common import *
import json
# ══ 1026C ═══════════════════════════════════════════════════════════════
#   使用者（1026B 交付後）訊息，逐條見 notes/1026C-pass129-notes.md。
#   比對基準：1026B 最終版 w23（/tmp/j/kgm1026B_w23.html，patches/1026B/build.sh 重建）。
CUR=open('/tmp/j/kgm1026B_w23.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 1：夏令時間（js/bt26.js 改版：輪擋／飛行時間依日期的時差；TZ 表本身不動）══
_bt26old=open('../1026B/js/bt26.js',encoding='utf-8').read()
RW('bt26 dst',_bt26old,JS('bt26.js'))

# ══ 2：時刻異動通知（js/sc27.js，接在 zn26 後面）══
_zn=open('../1026B/js/zn26.js',encoding='utf-8').read()
RW('sc27 embed',_zn,_zn+JS('sc27.js'))

open('p_h_r27.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
