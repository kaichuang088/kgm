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
EMB28=[]   # 1101A：新的長程式接在 1026C ch27.js 後面（最後一個 RW 一次接上）
# ══ A：時刻（js/bt26.js 1101A 版：EARLY27 加 KX262／KX66／KX9、WIN28 非曼谷航線 01:30–03:59 不抵達）══
RW('bt28 window',open('../1026C/js/bt26.js',encoding='utf-8').read(),JS('bt26.js'))

# ══ B1：地勤備勤時段（使用者圖：備勤 13:00–21:00 → 隔天早班 02:45，休息嚴重不足）——1027A 掃描 4 天 850 組有 35 組 <11 小時，全部牽涉備勤：
#   備勤那天顯示的是舊輪班表的時段（DUTY08），不是這個人這週的班別、也沒看前後天 → 改成班別代表時段，再跟前一天下班、隔天上班各隔 ≥11 小時；排不下就這天休息。
RW('gnd28 reserve',"      if(q.reserve)return {off:false,k:d.k,label:z()?'備勤':'Reserve',from:d.from,to:d.to,hours:0,\n        reserveR1008A:true,planR1008A:true,baseR1008A:d.from+'–'+d.to};",
   "      if(q.reserve)return rv28(id,date,d);   /* 1101A：備勤時段照班別＋前後天休息 11 小時 */")
RW('gnd28 reserve fn',"  var duty=function(id,date){\n    var d=DUTY08.apply(this,arguments);",
   "  /* 1101A：備勤（當天工作已排滿、在機場待命）時段：班別代表時段（PREV8），跟前一天實際下班、隔天實際上班各隔 ≥11 小時；排不下＝這天休息 */\n"
   "  var RV28=0;function p28(t){var a=String(t||'').split(':');return (+a[0]||0)*60+(+a[1]||0)}function ad28(d,k){return new Date(Date.parse(d+'T12:00:00Z')+k*864e5).toISOString().slice(0,10)}\n"
   "  function rv28(id,date,d){var bd=null;try{bd=window.kgmGroundBandR1008A(id,date)}catch(_){}var pv=PREV8[(bd&&bd.k)||'early']||PREV8.early,s=p28(pv.from),e=s+480;\n"
   "    if(!RV28){RV28++;try{var pd=window.kgmGroundDutyR99(id,ad28(date,-1)),nd=window.kgmGroundDutyR99(id,ad28(date,1)),pe=null,ns=null;\n"
   "      if(pd&&!pd.off&&pd.from){var a=p28(pd.from),b=p28(pd.to);if(b<=a)b+=1440;pe=b-1440}if(nd&&!nd.off&&nd.from)ns=p28(nd.from)+1440;\n"
   "      if(pe!=null&&s<pe+660){s=pe+660;e=s+480}if(ns!=null&&e>ns-660){e=ns-660;s=e-480}\n"
   "      if((pe!=null&&s<pe+660)||(ns!=null&&e>ns-660))return {off:true,k:'off',label:z()?'休息（與前後班間隔不足 11 小時）':'Rest (11-h gap)',from:'',to:'',hours:0,restR1101A:true}}finally{RV28--}}\n"
   "    return {off:false,k:(bd&&bd.k)||d.k,label:z()?'備勤':'Reserve',from:hm(((s%1440)+1440)%1440),to:hm(((e%1440)+1440)%1440),hours:0,reserveR1008A:true,planR1008A:true,baseR1008A:d.from+'–'+d.to}}\n"
   "  var duty=function(id,date){\n    var d=DUTY08.apply(this,arguments);")

#   B1 續：一般班接一般班也有 <11 小時（中班 18:30 下班 → 隔天補滿 8 小時把起點往前推到 05:20）→ 排某天前先拿前一天的派工（派工排得出來的 4 天內依日期順序），
#   指派工作不早於「前一天下班＋11 小時＋簡報 25 分」、補滿 8 小時的起點不早於「前一天下班＋11 小時」。
RW('gnd28 prev plan',"  if(BUSY8)return null;\n  BUSY8=true;",
   "  if(BUSY8)return null;\n"
   "  try{var pd28=new Date(Date.parse(date+'T12:00:00Z')-864e5).toISOString().slice(0,10),g28=Math.round((Date.parse(pd28+'T00:00:00Z')-Date.parse(T()+'T00:00:00Z'))/864e5);   /* 1101A：前一天的派工（休息 11 小時） */\n"
   "    window.KGM_GPREV_R1101A=(g28>=-2&&g28<=1)?plan8(ap,pd28):(CACHE8[ap+'|'+pd28+'|'+stamp8()]||null)}catch(_){window.KGM_GPREV_R1101A=null}\n"
   "  BUSY8=true;")
RW('gnd28 lb',"  var people=poolOf8(ap).map(function(p){return person8(p,date)});",
   "  var people=poolOf8(ap).map(function(p){return person8(p,date)});\n"
   "  try{var PV28=window.KGM_GPREV_R1101A;if(PV28&&PV28.people)people.forEach(function(P){var q=PV28.people[P.id];if(q&&!q.off&&!q.reserve&&q.to!=null)P.lb28=q.to-1440+660})}catch(_){}   /* 1101A：前一天下班＋11 小時 */")
RW('gnd28 ok8',"function ok8(P,t,maxGap){\n  if(P.off)return false;",
   "function ok8(P,t,maxGap){\n  if(P.off)return false;\n  if(P.lb28!=null&&t.a<P.lb28+25)return false;   /* 1101A：跟前一天下班隔 11 小時（再加簡報＋步行 25 分） */")
RW('gnd28 shift22',"  if(P.win1!=null&&s+SHIFT22>P.win1+60&&l0-SHIFT22<=f0)s=Math.max(l0-SHIFT22,Math.min(f0,P.win1+60-SHIFT22));",
   "  if(P.win1!=null&&s+SHIFT22>P.win1+60&&l0-SHIFT22<=f0)s=Math.max(l0-SHIFT22,Math.min(f0,P.win1+60-SHIFT22));\n"
   "  if(P.lb28!=null&&s<P.lb28&&P.lb28<=f0)s=P.lb28;   /* 1101A：補滿 8 小時的起點不早於前一天下班＋11 小時 */")

# ══ B2：地勤個人行事曆的員工清單（js/gr28.js）——下拉選單換成員工表（搜尋、班別篩選、本週 7 天班別），點一列＝個人行事曆換人 ══
RW('gr28 list',"<label>'+(z()?'選擇員工':'Ground staff')+'<select class=\"inp\" onchange=\"kgmCrPersonR74(this.value)\">'+people74.map(function(p74){return '<option value=\"'+A(p74.empId)+'\" '+(p74.empId===personId74?'selected':'')+'>'+E(p74.empId)+' · '+E(p74.name||'')+(p74.label8?(' · '+E(p74.label8)):'')+'</option>'}).join('')+'</select></label></div>'",
   "<label>'+(z()?'選擇員工':'Ground staff')+'<select class=\"inp\" onchange=\"kgmCrPersonR74(this.value)\">'+people74.map(function(p74){return '<option value=\"'+A(p74.empId)+'\" '+(p74.empId===personId74?'selected':'')+'>'+E(p74.empId)+' · '+E(p74.name||'')+(p74.label8?(' · '+E(p74.label8)):'')+'</option>'}).join('')+'</select></label></div>'+((h.self&&window.kgmGroundRosterListR1101A)?window.kgmGroundRosterListR1101A(ap,date,people74,personId74):'')")
EMB28.append('gr28.js')

# ══ B3：組員名冊加「職位」（使用者圖三）——排班引擎的職級（kgmCrewPoolR121：正機師／副機師／巡航機師、座艙長／副座艙長／空服員）＋教官＋機型 ══
RW('crew28 rank fn',"function natOf196(id){",
   "var RK28={n:-1,p:{},c:{}};function rank28(id,role){try{var P=kgmCrewPoolR121(),n=(P.pilots||[]).length+(P.cabin||[]).length;   /* 1101A：職位（排班引擎職級；飛行員與客艙員編會重複，各查各的） */\n"
   "  if(RK28.n!==n){var mp={},mc={};(P.pilots||[]).forEach(function(c){if(c&&c.empId&&!mp[c.empId])mp[c.empId]=c});(P.cabin||[]).forEach(function(c){if(c&&c.empId&&!mc[c.empId])mc[c.empId]=c});RK28={n:n,p:mp,c:mc}}\n"
   "  var c=(role==='pilot'?RK28.p:RK28.c)[id];if(!c)return '—';var r=z()?(c.rankZH||c.rank):({CP:'Captain',FO:'First Officer',CR:'Cruise Relief',PU:'Purser',DPU:'Deputy Purser',FA:'Flight Attendant'}[c.rank]||c.rank);\n"
   "  return r+(c.triR1009A?(z()?'・教官':' · TRI'):'')+(c.rating?' · '+c.rating:'')}catch(_){return '—'}}\n"
   "function natOf196(id){")
RW('crew28 rank th',"+'<th>'+(z()?'姓名':'Name')+'</th><th>'+(z()?'國籍':'Nat.')+'</th><th>'+(z()?'員編':'ID')+'</th>'",
   "+'<th>'+(z()?'姓名':'Name')+'</th><th>'+(z()?'職位':'Position')+'</th><th>'+(z()?'國籍':'Nat.')+'</th><th>'+(z()?'員編':'ID')+'</th>'")
RW('crew28 rank td',"        +'<td><b>'+E(s.name||s.empId)+'</b></td>'\n        +'<td><span class=\"k22-nt '+E(nt)+'\">'",
   "        +'<td><b>'+E(s.name||s.empId)+'</b></td>'\n        +'<td class=\"k28-pos\">'+E(rank28(s.empId,role))+'</td>'\n        +'<td><span class=\"k22-nt '+E(nt)+'\">'")

# ══ B4：組員頁「有時當掉變成舊版面」（使用者圖四）——新版面板 k196 是畫完之後用計時器插進去、舊段落也要等計時器（sweep196）才收；
#   背景算組員班表時主執行緒忙，計時器延後好幾秒，這段時間看到的就是舊頁。改成 render 一結束就同步掛面板、收舊段落（計時器照舊補一次）。
RW('crew28 sync paint',"    [50,240,650].forEach(function(ms){setTimeout(function(){paint196()},ms)});return r};",
   "    try{if(tab()==='sched'){paint196();tidy196()}}catch(_){}   /* 1101A：同步掛上，不等計時器 */\n    [50,240,650].forEach(function(ms){setTimeout(function(){paint196();try{tidy196()}catch(_){}},ms)});return r};")

# ══ B5：曼谷組員太閒（使用者：「BKK 的組員和機長太閒了，可以砍一點人，至少要跟 TPE 等級一樣」）——tests/util28.js 7 天：
#   曼谷虛擬飛行員每人 0.29 天（台北 0.87）、曼谷虛擬客艙 0.62 天（台北 1.11）→ 泰籍比例（曼谷航段占比 × 0.5）飛行員 ×0.17、客艙 ×0.36（量兩次照總執勤天數調）；減下來的回台北基地。
RW('nat28 fewer th',"else nt=(H(p.empId+'|th22')%1000<Math.round((sh[p.fam]||0)*500))?'TH':surNat22(p.name);",
   "else nt=(H(p.empId+'|th22')%1000<Math.round((sh[p.fam]||0)*(p.role==='pilot'?85:180)))?'TH':surNat22(p.name);   /* 1101A：曼谷組員利用率跟台北一樣（原本 500） */")

# ══ C1：季節性 Payload 限座＝鎖經濟艙最後幾排（js/pl28.js）——選位圖、真實訂位自動劃位、模擬旅客座位都不用那幾排 ══
EMB28.append('pl28.js')
RW('pl28 seat row',"      const _xb929=(f.acft===\"A388\"&&cabinName===\"Business\"&&r===0);",
   "      const _xb929=(f.acft===\"A388\"&&cabinName===\"Business\"&&r===0);\n"
   "      const _plRow28=(cabinName===\"Economy\"&&window.kgmPlBlockRowsR1101A)?window.kgmPlBlockRowsR1101A(f,f.date).rows:0;   /* 1101A：Payload 鎖經濟艙最後幾排 */\n"
   "      if(_plRow28&&r===rows-_plRow28)html2+=`<div class=\"k28-pl-div\"><span></span><b>${LANG===\"en\"?\"PAYLOAD LIMIT — last \"+_plRow28+\" rows closed this season\":\"Payload 季節性限座・最後 \"+_plRow28+\" 排不開放\"}</b><span></span></div>`;")
RW('pl28 seat lock',"        if(isOccupied)lk=true;\n        const cabK=cabinName===\"Economy\"?\"econ\"",
   "        if(isOccupied)lk=true;\n        const _plb28=!!(_plRow28&&r>=rows-_plRow28);if(_plb28&&!isSel)lk=true;   /* 1101A */\n        const cabK=cabinName===\"Economy\"?\"econ\"")
RW('pl28 seat title',"        if(_xb929)titleStr+=(LANG===\"en\"?\" [Extended Business seat]\":\" [加長商務艙座位]\");",
   "        if(_xb929)titleStr+=(LANG===\"en\"?\" [Extended Business seat]\":\" [加長商務艙座位]\");\n        if(_plb28)titleStr=(LANG===\"en\"?sid+\" — closed (seasonal payload limit)\":sid+\"・Payload 季節性限座，本排不開放\");")
RW('pl28 seat cls',"${_xb929?\" k929-xbiz\":\"\"}\" onclick=\"toggleSeat('${seatKey}','${sid}',${lk})\"",
   "${_xb929?\" k929-xbiz\":\"\"}${_plb28?\" k28-plblk\":\"\"}\" onclick=\"toggleSeat('${seatKey}','${sid}',${lk})\"")
RW('pl28 auto seat',"  var ids=cabinSeatIds0814(f,c),real=realTakenSeats0814(f,bk.pnr),sim={};",
   "  var ids=cabinSeatIds0814(f,c),real=realTakenSeats0814(f,bk.pnr),sim={};\n"
   "  try{var bl28=window.kgmPlBlockedIdsR1101A?window.kgmPlBlockedIdsR1101A(f,f.date,ids):{};if(Object.keys(bl28).length&&((FARES[c]||AWARD_FARES[c]||{}).cabin||'Economy')==='Economy')ids=ids.filter(function(s){return !bl28[s]})}catch(_){}   /* 1101A：自動劃位不排 Payload 鎖住的後排 */")
RW('pl28 sim seat',"      if(ids18.length){ids18.forEach(function(x){x.k=rnd()+x.mid*0.35+(nr18?x.row/nr18:0)*0.15});",
   "      try{if(nm18==='Economy'&&window.kgmPlBlockRowsR1101A){var pb28=window.kgmPlBlockRowsR1101A(f,date,ty18).rows;if(pb28>0)ids18=ids18.filter(function(x){return x.row<=nr18-pb28})}}catch(_){}   /* 1101A：模擬旅客不坐 Payload 鎖住的後排 */\n"
   "      if(ids18.length){ids18.forEach(function(x){x.k=rnd()+x.mid*0.35+(nr18?x.row/nr18:0)*0.15});")

# ══ C2：Payload 限座表依目的地分組（js/zn27.js 1101A 版）══
RW('zn28 group',open('../1026C/js/zn27.js',encoding='utf-8').read(),JS('zn27.js'))

# ══ 新長程式嵌入 ══
_ch27=open('../1026C/js/ch27.js',encoding='utf-8').read()
RW('r28 embed',_ch27,_ch27+''.join(JS(n) for n in EMB28))
open('p_h_r28.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
