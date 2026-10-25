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

# ══ 4a：選位圖與庫存同一個來源（舊問題：KX351 庫存剩 35、選位圖只剩 13 空位）——
#    r108 用「各訂位代號還能賣幾位」加總當空位：營收管理關掉的艙等（只是不賣，位子是空的）被當成有人坐。
#    改成實體庫存 kgmCabinInventory54 的剩餘座位（員工票、升等、團體劃位看的就是實體座位）；選位圖的模擬旅客＝實體已坐 − 真實訂位（真實訂位另外畫，不重複算）。
RC('r108 physical','kgm-0902a-r108',"""window.kgmSeatsLeftR108=function(code,date,cabin){
  var type=typeOf108(code,date);
  var all=seatsOfCabin108(type,cabin);
  var cap=all.length;
  if(!cap)return {cap:0,free:0,taken:0};
  var free=Math.max(0,Math.min(cap,window.kgmCabinFreeR108(code,date,cabin)));
  return {cap:cap,free:free,taken:cap-free,type:type};
};""","""window.kgmSeatsLeftR108=function(code,date,cabin){
  var type=typeOf108(code,date);
  var all=seatsOfCabin108(type,cabin);
  var cap=all.length;
  if(!cap)return {cap:0,free:0,taken:0};
  /* 1026B：實體庫存（跟團體劃位、員工票、升等同一份）；營收管理關掉的艙等只是不賣，位子還是空的 */
  var inv=null;try{var f=findF108(code);if(f&&window.kgmCabinInventory54)inv=window.kgmCabinInventory54(f,date,cabin)}catch(_){inv=null}
  if(inv&&inv.capacity){var real=0;Object.keys(inv.fareCounts||{}).forEach(function(k){real+=+inv.fareCounts[k]||0});var fr=Math.max(0,Math.min(cap,inv.left));
    return {cap:cap,free:fr,taken:cap-fr,simTaken:Math.max(0,cap-fr-real),type:type,physical:true}}
  var free=Math.max(0,Math.min(cap,window.kgmCabinFreeR108(code,date,cabin)));
  return {cap:cap,free:free,taken:cap-free,type:type};
};""")
RC('r108 sim only','kgm-0902a-r108',"      var diff=taken.length-want.taken;","      var diff=taken.length-(want.simTaken!=null?want.simTaken:want.taken);   /* 1026B：真實訂位的座位另外畫，這裡只放模擬旅客 */")
RC('r108 audit','kgm-0902a-r108',"      if(taken!==r.taken)bad.push(cb+':'+taken+'≠'+r.taken);","      if(taken!==(r.simTaken!=null?r.simTaken:r.taken))bad.push(cb+':'+taken+'≠'+(r.simTaken!=null?r.simTaken:r.taken));")

# ══ 4b：團體訂位可以訂夥伴營運的航段（舊問題：聯營航班不在我們的庫存，團體模式整段售罄）——
#    依聯營協議給團體座位配額（每班每艙 30 席，經濟／商務），不查我們的庫存；座位由營運航空在機場報到時劃位（整團劃位跳過這一段、不算座位不足）。
RW('grp partner sell',"""  if(window.__grp25raw||!on())return null;var fi=FARES[code]||{},cab=fi.cabin||'Economy';
  if(cab==='First'||cab==='Resident'||!fi.familyR48)return 0;if(code!==gcode(cab))return 0;return seatsLeft(flight,date,cab)};""","""  if(window.__grp25raw||!on())return null;var fi=FARES[code]||{},cab=fi.cabin||'Economy';
  if(cab==='First'||cab==='Resident'||!fi.familyR48)return 0;if(code!==gcode(cab))return 0;
  if(flight&&(flight.partner||flight.codeshare))return (cab==='Economy'||cab==='Business')?PARTNER26:0;   /* 1026B：夥伴營運段 —— 聯營團體座位配額 */
  return seatsLeft(flight,date,cab)};
var PARTNER26=30;window.KGM_GRP_PARTNER_R1026B=PARTNER26;""")
RW('grp partner seat',"""  segsOf(b).forEach(function(s){var f=Object.assign({},s,{acft:''});var t='';try{t=acftOfFlight(s.code,s.date,s.fr,s.to)}catch(_){}f.acft=t;""",
   """  var ptn26=[];segsOf(b).forEach(function(s){if(s.partner||s.codeshare||/^KX9[5-9]\\d\\d$/.test(String(s.code||''))&&isPartner26(s)){ptn26.push(s.code);return}   /* 1026B：夥伴營運段由營運航空在機場劃位 */
    var f=Object.assign({},s,{acft:''});var t='';try{t=acftOfFlight(s.code,s.date,s.fr,s.to)}catch(_){}f.acft=t;""")
RW('grp partner seat msg',"""g.seatsAt=new Date().toISOString();g.seatsBy='auto';log(g,'整團劃位（同排相鄰優先）'+done+' 段'+(miss.length?'，座位不足：'+miss.join('、'):''));""",
   """g.seatsAt=new Date().toISOString();g.seatsBy='auto';log(g,'整團劃位（同排相鄰優先）'+done+' 段'+(miss.length?'，座位不足：'+miss.join('、'):'')+(ptn26.length?'；'+ptn26.join('、')+' 由營運航空於報到時劃位':''));""")
RW('grp partner fn',"""window.kgmGrpSeatManualR1025B=function(id){""","""function isPartner26(s){try{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];return !!(f&&(f.partner||f.codeshare))}catch(_){return false}}
window.kgmGrpSeatManualR1025B=function(id){""")

# ══ 4c：地勤清晨登機門人力不足（舊問題：每天最早幾班 KX180／KX104／KX158… 登機門 0／2）——
#    1012A 的補位（白天／中／晚班可提早 60 分鐘、把別的工作換手）只做報到櫃檯；登機門（起飛前 50～80 分到起飛後 10 分）一樣要做。
RC('gnd gate rescue','kgm-0907A-r194',"    tasks.filter(function(t){return t.kind==='ctr'&&t.who.length<t.min}).forEach(function(t){",
   "    tasks.filter(function(t){return (t.kind==='ctr'||t.kind==='gate')&&t.who.length<t.min}).forEach(function(t){   /* 1026B：登機門也補（清晨第一波登機門原本 0／2） */")

RC('gnd reserve early','kgm-0907A-r194',"  people.forEach(function(P){if(!P.off&&P.tasks.length&&P.work<240)chain8(P,tasks,'ideal')});",
   "  people.forEach(function(P){if(!P.off&&P.tasks.length&&P.work<240)chain8(P,tasks,'ideal')});\n"
   "  /* 1026B：清晨還缺人的櫃檯／登機門（週日例休多、早班的人不夠）→ 請今天沒排到工作的備勤同仁提早上班：最多比班別早 120 分鐘，\n"
   "     而且跟前一天班別的最晚下班隔 11 小時以上（勞基法第 34 條）；排進來的人再接附近還缺人的工作，工時才夠 */\n"
   "  (function(){var prev=null;try{prev=addDays(date,-1)}catch(_){prev=null}\n"
   "    tasks.filter(function(t){return (t.kind==='ctr'||t.kind==='gate')&&t.who.length<t.min}).sort(function(a,b){return a.a-b.a}).forEach(function(t){\n"
   "      var C=people.filter(function(P){if(P.off||P.tasks.length||t.who.indexOf(P.id)>=0||P.band==='late'||t.a<P.win0-120||t.b>P.win1)return false;\n"
   "        var e=0;try{var pb=prev&&window.kgmGroundBandR1008A(P.id,prev);if(pb&&pb.w)e=pb.w[1]-1440+660}catch(_){e=0}return t.a>=e}).sort(function(a,b){return a.ord-b.ord});\n"
   "      for(var i=0;i<C.length&&t.who.length<t.min;i++){var P=C[i],w0=P.win0;P.win0=Math.min(P.win0,t.a);if(ok8(P,t,null)){add8(P,t);P.earlyR1026B=1;try{chain8(P,tasks,'min');chain8(P,tasks,'ideal')}catch(_){}}else P.win0=w0}});\n"
   "  })();")

RC('gnd headcount','kgm-0907A-r194',"var GTARGET8=492,   /* 1012A：1～2 班的櫃檯 5 人、3 班 7 人、換班別那天排休：桃園 444＋松山 48 */",
   "var GTARGET8=525,   /* 1012A：1～2 班的櫃檯 5 人、3 班 7 人、換班別那天排休：桃園 444＋松山 48；1026B：週日清晨（週休多、早班輪到的人少）櫃檯與登機門排不滿，桃園加到 477（實測 28 天、開三次頁都沒有低於最少人力） */")

open('p_h_r26.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
