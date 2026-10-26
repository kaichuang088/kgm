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
RW('sc27 embed',_zn,_zn+JS('sc27.js')+JS('ch27.js'))

# ══ 1b：航班動態等畫面的 UTC 換算（_utcOf）也用依日期的時差（航班動態卡片寫的飛行時間、抵達日期）══
RW('utcOf dst',"return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tzMin(ap))*60000;",
   "var _tz27=_tzMin(ap);try{if(window.kgmTzAtR1026C)_tz27=Math.round(window.kgmTzAtR1026C(ap,String(dateISO).slice(0,10))*60)}catch(_){}   /* 1026C：夏令時間 */\n  return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tz27)*60000;")

# ══ 4：販售通路（js/ch27.js）：夥伴營運一般訂票配額、只開放包機／只開放旅客訂購 —— sell54 最前面問（在團體之前：只開放旅客訂購的班團體也不能訂）══
RC('sell54 channel','kgm-0823c-r54',"  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}",
   "  if(window.kgmChannelSellR1026C){var c27=window.kgmChannelSellR1026C(code,date,flight);if(c27!=null)return c27}   /* 1026C：販售通路 */\n  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}")
RW('sales S init','warZonesR1026B:LS.get("kgm26_zones",null),','warZonesR1026B:LS.get("kgm26_zones",null),salesModeR1026C:LS.get("kgm27_salesmode",null),')
RW('sales save','LS.set("kgm26_zones",S.warZonesR1026B||null);','LS.set("kgm26_zones",S.warZonesR1026B||null);LS.set("kgm27_salesmode",S.salesModeR1026C||null);')

open('p_h_r27.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
