from common import *
import json
# ══ 1026B ═══════════════════════════════════════════════════════════════
#   使用者（1026A 交付後）訊息，逐條見 notes/1026B-pass128-notes.md。
#   比對基準：1026A 最終版 w50（/tmp/j/kgm1026A_w50.html，patches/1025B/build.sh 重建）。
CUR=open('/tmp/j/kgm1026A_w50.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 1：全網輪擋時間加彈性（js/bt26.js，接在 r229 最後；季節時刻最外層包裝）══
#    1023A 冬季風向那層開頁後 0／2／6／12 秒「不是自己就再包一次」→ 看到 1026B 這層就不包（不然冬季會從加過彈性的夏季再算一次）
RW('k23 wrap yield bt26',"  function wrap(){var o=window.kgmSeasonFlightR48;if(typeof o!=='function'||o===MY)return;\n    var w=function(f,date){var x=o.apply(this,arguments);try{if(x&&date)return adj(o,f,String(date),x)}catch(_){}return x};",
   "  function wrap(){var o=window.kgmSeasonFlightR48;if(typeof o!=='function'||o===MY||o.__bt26)return;   /* 1026B：輪擋彈性那層要在最外層 */\n    var w=function(f,date){var x=o.apply(this,arguments);try{if(x&&date)return adj(o,f,String(date),x)}catch(_){}return x};")
_g25=open('../1025B/js/grp25.js',encoding='utf-8').read()
RW('bt26 embed',_g25,_g25+JS('bt26.js')+JS('zn26.js'))

# ══ 2：關閉空域（2026-10-25 查證）＋後台可調整 —— geo25 換成 geo26（航路改在瀏覽器裡算、預設那一組預先算好嵌入）══
import base64
_tex="'data:image/jpeg;base64,"+base64.b64encode(open('../1025B/geo/tex/bm4096.jpg','rb').read()).decode()+"'"
_g25old=open('../1025B/js/geo25.js',encoding='utf-8').read().replace('/*GEO25*/null',open('../1025B/geo/geo25.json',encoding='utf-8').read()).replace("/*TEX25*/''",_tex)
_geo26=json.load(open('geo/geo26.json',encoding='utf-8'))
try:_geo26['baked']=json.load(open('geo/baked26.json',encoding='utf-8'))
except FileNotFoundError:pass
RW('geo26',_g25old,JS('geo26.js').replace('/*GEO26*/null',json.dumps(_geo26,ensure_ascii=False,separators=(',',':'))).replace("/*TEX25*/''",_tex))
RW('zones S init','bagMovesR1023A:LS.get("kgm23_bagmoves",[]),','bagMovesR1023A:LS.get("kgm23_bagmoves",[]),warZonesR1026B:LS.get("kgm26_zones",null),')
RW('zones save','LS.set("kgm23_bagmoves",S.bagMovesR1023A||[]);','LS.set("kgm23_bagmoves",S.bagMovesR1023A||[]);LS.set("kgm26_zones",S.warZonesR1026B||null);')

open('p_h_r26.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
