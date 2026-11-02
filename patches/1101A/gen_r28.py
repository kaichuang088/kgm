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
EMB28.append('fr28.js')
EMB28.append('dh28.js')
EMB28.append('cs28.js')
EMB28.append('ad28.js')
EMB28.append('grp28.js')
EMB28.append('cr28.js')
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

# ══ C3：航班資料載重平衡（js/pl28.js 後半）——鎖住的排還有旅客 → 建議名單（A 系統配位 → B 經濟基本退選位費＋補償 → C 自選座位補償），旅客在行程管理二選一（里程或機場抵用券）
#   新存檔：機場抵用券 S.vouchersR1101A（kgm28_vouch）——save() 與 S 初始值都加（前後台同步只認這種寫法）。
RW('vouch28 S init','paxCapAdjR1026C:LS.get("kgm27_paxcap",[]),','paxCapAdjR1026C:LS.get("kgm27_paxcap",[]),vouchersR1101A:LS.get("kgm28_vouch",[]),dhMoveR1101A:LS.get("kgm28_dhmove",[]),')
RW('vouch28 save','LS.set("kgm27_paxcap",S.paxCapAdjR1026C||[]);','LS.set("kgm27_paxcap",S.paxCapAdjR1026C||[]);LS.set("kgm28_vouch",S.vouchersR1101A||[]);LS.set("kgm28_dhmove",S.dhMoveR1101A||[]);')

# ══ C4：（測 C3 時查到的 1027A 舊問題）航班資料旅客名單用原始排號（seatSections7：B779 經濟艙 18–47），真實訂位存的是改號後的號碼（1006A：26–55）
#   → 名單核對不到真實旅客的座位，就再配一個並寫回訂位（一人兩個座位）。核對前把改號後的號碼換回原始號碼（訂位一律存內部排號，見 C5）。
RW('seat28 manifest raw',"    rows.slice().sort(function(a,b){return (bz7[b.id]?1:0)-(bz7[a.id]?1:0)}).forEach(function(x){if(x.resShareR928&&x.cabin==='Resident')return;   /* 0928B：Residence 兩位共用同一間套房 */\n      if(x.seat&&",
   "    rows.slice().sort(function(a,b){return (bz7[b.id]?1:0)-(bz7[a.id]?1:0)}).forEach(function(x){if(x.resShareR928&&x.cabin==='Resident')return;   /* 0928B：Residence 兩位共用同一間套房 */\n"
   "      try{if(x.real&&x.seat&&window.kgmRawSeatR1006A&&(byCab[x.cabin]||[]).indexOf(x.seat)<0){var r28=window.kgmRawSeatR1006A(f,x.seat);if(r28!==x.seat&&(byCab[x.cabin]||[]).indexOf(r28)>=0){x.seatShownR1101A=x.seat;x.seat=r28}}}catch(_){}   /* 1101A：真實訂位存改號後的號碼 → 換回原始排號再核對（原本核對不到就重配、寫回訂位變成一人兩個座位） */\n"
   "      if(x.seat&&")
RW('seat28 manual write',"else if(p.real&&p.booking){p.booking.seats=p.booking.seats||{};p.booking.seats[p.segmentKey]={};p.booking.seats[p.segmentKey][seat]=p.name;}",
   "else if(p.real&&p.booking){p.booking.seats=p.booking.seats||{};var sg28=p.booking.seats[p.segmentKey]||{},o28={},hit28=false;Object.keys(sg28).forEach(function(k){if(k==='_auto')return;if(k===p.seat||k===p.seatShownR1101A){o28[seat]=p.name;hit28=true}else o28[k]=sg28[k]});if(!hit28)o28[seat]=p.name;p.booking.seats[p.segmentKey]=o28;}   /* 1101A：只換掉這位旅客原本的座位、而且留在原本的位置（名單照座位順序對應第幾位旅客）；原本整段清空，同一筆訂位其他旅客的座位一起不見；訂位存內部排號 */")

# ══ C5：（測 C3 時查到的 1027A 舊問題）座位號兩套約定互相矛盾——訂票選位（toggleSeat 傳內部排號）、行程卡（r65 kgmSeatShowR65 內部→顯示）、航班資料名單（seatSections7）、
#   模擬旅客都是「訂位存內部排號，畫面才換成改號後」（0823C 註解：座位代號維持原本編號交給 r30 平移，避免移兩次）；只有 1006A 三處反過來用改號後號碼：
#   自動劃位存改號後號碼（行程卡再加 8 排：存 33K 顯示 41K）、選位圖「被其他訂位選走」與「已選」用改號後號碼比對（別人的真實座位標不出來、自己選的位子不亮）。統一回內部排號。
RW('seat28 view sid',"        const _sid6=(cabinName===\"Economy\"&&window.kgmShownSeatR1006A)?window.kgmShownSeatR1006A(f,sid):sid;",
   "        const _sid6=sid;   /* 1101A：訂位存內部排號（訂票選位、行程卡 r65、航班資料名單都這樣）；1006A 這裡用改號後號碼比對 → 別人的真實座位標不出來、自己選的不亮 */")
RW('seat28 auto sh6',"  var sh6=function(sid){return window.kgmShownSeatR1006A?window.kgmShownSeatR1006A(f,sid):sid};/* 1006A：真實訂位用改號後的號碼 */",
   "  var sh6=function(sid){return sid};/* 1101A：訂位存內部排號（1006A 存改號後號碼 → 行程卡 r65 再換一次號，顯示多 8 排） */")

# ══ H1：後台卡頓（使用者 Round 3「後台全部都很卡頓」）——tests/lt15.js：開頁 85 秒起組員背景一天一天算（buildDay121 每天 0.7～1.4 秒），
#   中間每次存進度的指紋 sig25 都呼叫 pool121 → demand121（掃整份機隊排班 0.4～0.7 秒，機隊背景重排時快取一直失效）。
#   ① 指紋：組員名單已經建好就不再重建；② 不在組員班表分頁時，瀏覽器沒空檔最多等 10 秒才算（原本 2.5 秒就硬算）；③ 使用者停手才算：組員班表分頁 4 秒、其他頁 10 秒（原本 2 秒）。算的結果不變。
RW('lag28 sig pool',"    try{if(window.KGM_FULLDONE_1006A)try{pool121()}catch(_){}",
   "    try{if(window.KGM_FULLDONE_1006A&&!POOL121)try{pool121()}catch(_){}   /* 1101A：名單已建好就不再重建（每次 0.8 秒） */")
RW('lag28 idle',"  function idle(f){if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(f,{timeout:2500});else setTimeout(f,60)}\n  function tick(){",
   "  function idle(f){var to=(S.view==='admin'&&S.adminTab==='sched')?2500:10000;   /* 1101A：不在組員班表分頁時多等瀏覽器空檔 */\n    if(window.kgmBgHiddenR1103A&&window.kgmBgHiddenR1103A())return window.kgmBgSoonR1103A(f,0);   /* 1103A：分頁看不見時 requestIdleCallback 幾乎不跑 → Worker 叫醒（rot31.js） */\n    if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(f,{timeout:to});else setTimeout(f,60)}\n  function tick(){")
RW('lag28 input',"    if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<2000)return;   /* 使用者正在操作就先讓開",
   "    if(!(window.kgmBgHiddenR1103A&&window.kgmBgHiddenR1103A())&&Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<((S.view==='admin'&&S.adminTab==='sched')?4000:6000))return;   /* 1103A：其他頁 20→6 秒（使用者：看其他頁也要繼續跑）；分頁看不見時不等 */   /* 1101B：其他頁 10→20 秒（一天 1～15 秒不能中斷，看頁面時不開始算） */   /* 1101A：使用者停手 4 秒（組員班表分頁）／10 秒（其他頁）才算，一算就卡 1 秒 */   /* 使用者正在操作就先讓開")

# ══ H2：後台卡頓（續）——真人點擊剖析（tests/prof28c.js）：除了組員背景，還有競標模擬資料預補（1025B：使用者 1.5 秒沒操作就補一班，一班 0.1 秒以上、還會牽動 Payload 艙單與組員計畫）、
#   航班資料 DH 背景補算（1026C dhLater929，沒有看使用者是否正在操作）→ 都改成使用者停手 8 秒才做（讀一頁的時間通常超過 1.5 秒，下一次點擊剛好撞上就卡）。
RW('lag28 auc pre',"(function step(dl){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(function(){idle25(step)},700);return}",
   "(function step(dl){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<8000){setTimeout(function(){idle25(step)},1500);return}   /* 1101A：1.5→8 秒 */")
RW('lag28 auc q',"if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(function(){I25(step929)},700);return}",
   "if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<8000){setTimeout(function(){I25(step929)},1500);return}   /* 1101A：1.5→8 秒 */")
RW('lag28 dh later',"    setTimeout(function go(){n++;try{if(window.kgmCrewHasDayR121(date)){",
   "    setTimeout(function go(){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<20000){setTimeout(go,1500);return}   /* 1101A：使用者停手 8 秒才算（一算一天卡 1 秒）；1101B：8→20 秒 */\n      n++;try{if(window.kgmCrewHasDayR121(date)){")

# H3：每次畫面後的全頁掃描（0812A postRenderQ）：先看整頁文字有沒有要換的字，沒有就不逐節點掃（結果相同）
RW('lag28 post click',"      document.querySelectorAll('[onclick]').forEach(function(x){var o=x.getAttribute('onclick')||'',t=(x.textContent||'').trim();if(/milesTab",
   "      var adm28=S.view==='admin',ps28=!adm28||(S.milesPurchaseCases0809D||[]).some(function(c){return c&&c.status==='pending_security'}),bt28=ps28?((document.body&&document.body.textContent)||''):'';   /* 1101A：後台只有真的有「pending_security」的里程購買案件才掃整頁文字；會員頁的選單清理只在前台做（後台每次畫面省 100～300ms） */\n      if(!adm28&&(document.querySelector('[onclick*=\"milesTab\" i],[onclick*=\"flight miles\" i],[onclick*=\"搭機累積里程\"]')||/搭機累積里程|flight miles/i.test(bt28)))document.querySelectorAll('[onclick]').forEach(function(x){var o=x.getAttribute('onclick')||'',t=(x.textContent||'').trim();if(/milesTab")
RW('lag28 post walker',"      var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,nodes=[];while((n=walker.nextNode()))nodes.push(n);nodes.forEach(function(x){if(/pending_security/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/pending_security/g,statusNameQ('pending_security'));if(/搭機累積里程/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/搭機累積里程/g,'');});",
   "      if(ps28&&/pending_security|搭機累積里程/.test(bt28)){var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,nodes=[];while((n=walker.nextNode()))nodes.push(n);nodes.forEach(function(x){if(/pending_security/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/pending_security/g,statusNameQ('pending_security'));if(/搭機累積里程/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/搭機累積里程/g,'');});}")
# H4：存檔合併寫入時，機隊輪轉（kgm_tailasg）與組員班表快取（kgm_crewsched）每次都整份重新打包（一次 200～300ms）→ 使用者 3 秒內有操作就延後（最多 20 秒；關頁照樣立即寫）
RW('lag28 flush var',"    var q=_ls0818q;_ls0818q={};\n    for(var k in q){",
   "    var q=_ls0818q,rt28=0,now28=Date.now();_ls0818q={};\n    for(var k in q){if((k==='kgm_tailasg'||k==='kgm_crewsched')&&now28-(window.KGM_LAST_INPUT_R1025B||0)<3000&&now28-(window.__lsDf28||now28)<20000){if(!window.__lsDf28)window.__lsDf28=now28;if(!(k in _ls0818q))_ls0818q[k]=q[k];rt28=1;continue}   /* 1101A：大份快取等使用者停手再打包 */")
RW('lag28 flush retry',"/* 1008A：內容沒變就不重寫 */\n  },500);",
   "/* 1008A：內容沒變就不重寫 */\n    if(rt28)_ls0818flush();else window.__lsDf28=0;\n  },500);")

# G1：我的行程分「即將出發／已完成」（使用者 Round 3 圖三）
RW('trip28 list split',"  var rows=mine().slice().sort(function(a,b){return String(firstDate(a)).localeCompare(String(firstDate(b)))});\n  var cards=rows.map(function(b){",
   "  var all28=mine().slice().sort(function(a,b){return String(firstDate(a)).localeCompare(String(firstDate(b)))});   /* 1101A：分即將出發／已完成 */\n  var td28=(typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10));\n  var last28=function(b){var ss=segs(b),l=ss[ss.length-1]||{};return String(l.date||(l.f||{}).date||firstDate(b)||'')};\n  var up28=all28.filter(function(b){return b.status!=='cancelled'&&last28(b)>=td28}),done28=all28.filter(function(b){return up28.indexOf(b)<0}).sort(function(a,b){return last28(b).localeCompare(last28(a))});\n  var tab28=S.tripsTabR1101A==='done'?'done':'up',rows=tab28==='done'?done28:up28;\n  var tabs28='<div class=\"k60-tabs28\" role=\"tablist\"><button type=\"button\" role=\"tab\" class=\"'+(tab28==='up'?'on':'')+'\" onclick=\"S.tripsTabR1101A=\\'up\\';render()\">'+(z()?'即將出發':'Upcoming')+'<i>'+up28.length+'</i></button><button type=\"button\" role=\"tab\" class=\"'+(tab28==='done'?'on':'')+'\" onclick=\"S.tripsTabR1101A=\\'done\\';render()\">'+(z()?'已完成':'Completed')+'<i>'+done28.length+'</i></button></div>';\n  var cards=rows.map(function(b){")
RW('trip28 list body',"    +(rows.length?('<section class=\"k60-trips\">'+cards+'</section>')\n      :('<div class=\"k60-warn\">'+(z()?'此帳號目前沒有訂位。':'No bookings on this account yet.')+'</div>'))",
   "    +(all28.length?tabs28:'')+(rows.length?('<section class=\"k60-trips\">'+cards+'</section>')\n      :('<div class=\"k60-warn\">'+(!all28.length?(z()?'此帳號目前沒有訂位。':'No bookings on this account yet.'):tab28==='up'?(z()?'目前沒有即將出發的行程。':'No upcoming trips.'):(z()?'還沒有已完成的行程。':'No completed trips yet.'))+'</div>'))")

# G2：辦理登機——美國航線起飛前 24 小時、其他 48 小時開放（以出發地當地時間算）；行程卡按鈕未開放／已截止時灰色
RW('ci28 window',"function ciWindow60(s){\n  var t=depMs60(s);if(!isFinite(t))return {open:true,why:''};\n  var h=(t-Date.now())/3600000;\n  if(h>CI_OPEN_H)return {open:false,early:true,hours:Math.ceil(h-CI_OPEN_H),\n    why:(z()?('尚未開放，起飛前 '+CI_OPEN_H+' 小時開放'):('Opens '+CI_OPEN_H+'h before departure'))};",
   "function ciWindow60(s){\n  var c28=window.kgmCiOpenR1101A?window.kgmCiOpenR1101A(s):null,OH=c28?c28.openH:CI_OPEN_H;   /* 1101A：美國航線 24 小時；起飛時間用出發地當地時間 */\n  var t=c28&&isFinite(c28.ms)?c28.ms:depMs60(s);if(!isFinite(t))return {open:true,why:''};\n  var h=(t-Date.now())/3600000;\n  if(h>OH)return {open:false,early:true,hours:Math.ceil(h-OH),openAt:t-OH*3600000,\n    why:(z()?('尚未開放，起飛前 '+OH+' 小時開放'+(OH===24?'（美國航線）':'')):('Opens '+OH+'h before departure'+(OH===24?' (US routes)':'')))};")
RW('ci28 hub text',"'每一個實際飛行的航段都要各自辦理報到；開放時間為該航段起飛前 48 小時，截止於起飛前 90 分鐘。'",
   "'每一個實際飛行的航段都要各自辦理報到；開放時間為該航段起飛前 48 小時（美國航線 24 小時），截止於起飛前 90 分鐘。'")
RW('ci28 card btn',"           +'<button class=\"k56-ci\" type=\"button\" onclick=\"'+op('checkin')+'\">'\n             +(Z()?'辦理登機':'Check in')+'</button>'",
   "           +(function(){var w28=window.kgmCiStateR1101A?window.kgmCiStateR1101A(b,s):null;   /* 1101A：還沒開放／已截止＝灰色 */\n             return '<button class=\"k56-ci'+(w28&&!w28.open?' k28-ci-off':'')+'\" type=\"button\"'+(w28&&!w28.open?' aria-disabled=\"true\" title=\"'+E(w28.why)+'\"':'')+' onclick=\"'+op('checkin')+'\">'\n             +(Z()?'辦理登機':'Check in')+'</button>'+(w28&&!w28.open?'<small class=\"k28-ci-why\">'+E(w28.short)+'</small>':'')})()")

# G1b：我的行程清單改成「左邊大勾勾選一筆 → 右下角『進入行程』」（使用者 Round 3 追加，一次選一個）
RW('trip28 card pick',"    return '<button class=\"k60-trip'+(cancelled?' off':'')+'\" onclick=\"kgmOpenTripR60(\\''+A(b.pnr)+'\\')\">'",
   "    var pk28=S.tripPickR1101A===b.pnr;   /* 1101A：點卡片＝勾選（一次一筆），右下角按鈕才進入 */\n    return '<button type=\"button\" role=\"radio\" aria-checked=\"'+(pk28?'true':'false')+'\" data-pnr28=\"'+E(b.pnr)+'\" data-route28=\"'+E(route)+'\" class=\"k60-trip k28-pick'+(cancelled?' off':'')+(pk28?' sel':'')+'\" onclick=\"kgmTripPickR1101A(\\''+A(b.pnr)+'\\')\">'\n      +'<span class=\"k28-chk\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"/></svg></span>'")
RW('trip28 card go',"      +'<span class=\"k60-trip-go\">›</span></button>';",
   "      +'</button>';")
RW('trip28 list foot',"    +'<button class=\"k60-btn ghost\" style=\"margin-top:18px\" onclick=\"S.tripsListR60=false;S.mgForceForm=true;S.view=\\'manage\\';render()\">'",
   "    +(rows.length?(function(){var sb=rows.filter(function(b){return b.pnr===S.tripPickR1101A})[0];return '<div class=\"k28-pickbar\"><span class=\"k28-pickinfo\">'+(sb?((z()?'已選 ':'Selected ')+'<b>'+E(sb.pnr)+'</b>'):(z()?'請在左邊勾選一筆行程':'Tick a trip on the left'))+'</span><button type=\"button\" class=\"k28-pickgo\"'+(sb?'':' disabled')+' onclick=\"kgmTripGoR1101A()\">'+(z()?'進入行程':'Open trip')+'<span aria-hidden=\"true\">›</span></button></div>'})():'')\n    +'<button class=\"k60-btn ghost\" style=\"margin-top:18px\" onclick=\"S.tripsListR60=false;S.mgForceForm=true;S.view=\\'manage\\';render()\">'")

RW('trip28 intro',"'這裡列出此帳號名下的所有訂位。點選任何一筆即可進入行程管理，辦理報到、選位、改票與退票。'",
   "'這裡列出此帳號的訂位，以及您用訂位代號查詢過的行程。在左邊勾選一筆，再按右下角「進入行程」，即可辦理報到、選位、改票與退票。'")   # 1102A：只列自己的＋查詢過的
RW('trip28 intro en',"'Every booking on this account. Open one to check in, choose seats, change or refund it.'",
   "'Every booking on this account. Tick one, then press Open trip to check in, choose seats, change or refund it.'")

# G3：附加服務頁（訂票第 4 步 r7 bookingReview7）：抵達隔天要寫 +1（使用者 Round 3 圖二 KX47 01:05→05:00）；版面改成網站的綠／金（樣式只套這一頁 .r28-addons）
RW('addon28 dd',"<div class=\"time\">'+e7(f.arr||'—')+'</div>",
   "<div class=\"time\">'+e7(f.arr||'—')+(+f.dd?'<sup class=\"r28-dd\">'+(f.dd>0?'+':'')+(+f.dd)+'</sup>':'')+'</div>")
RW('addon28 shell',"return '<main class=\"r7-shell\"><h1 class=\"r7-page-title\">'+(z7()?'附加服務'",
   "return '<main class=\"r7-shell r28-addons\"><h1 class=\"r7-page-title\">'+(z7()?'附加服務'")
RW('addon28 pax line',"'+e7(p.kgmId||S.user&&S.user.id||'')+' · '+e7(p.email||'')+' · '+e7((p.countryCode||'')+(p.phone||''))+'",
   "'+e7([p.kgmId||S.user&&S.user.id||'',p.email||'',(p.countryCode||'')+(p.phone||'')].filter(Boolean).join(' · '))+'")

# G4：DH 調位行程：座位現場劃位（行程卡不顯示預排座位）、線上報到關閉（灰色＋機場櫃檯）；改日期只能後台 AI（dh_change，pl28 下面 dh28）
RW('dh28 seat',"  var seat=seatOf(b,key),meal=mealOf(b,key);",
   "  var seat=b.dhR929?(Z()?'機場櫃檯劃位':'Assigned at the airport'):seatOf(b,key),meal=mealOf(b,key);   /* 1101A：DH 座位現場指派 */")
RW('dh28 rule',"'座位由公司指派（機長、副機長、教官商務艙；巡航機師、座艙長、副座艙長豪華經濟艙；其他組員經濟艙。商務艙客滿時副機長改坐豪華經濟艙，豪華經濟艙客滿時副座艙長改坐經濟艙），<b>無法自行選位</b>。'",
   "'艙等由公司指派（機長、副機長、教官商務艙；巡航機師、座艙長、副座艙長豪華經濟艙；其他組員經濟艙。商務艙客滿時副機長改坐豪華經濟艙，豪華經濟艙客滿時副座艙長改坐經濟艙）；<b>座位於機場櫃檯報到時劃位</b>，不開放線上報到與自行選位。'")
RW('dh28 rule2',"'調位屬於執勤安排，不能改票、退票或里程升等；班表異動時系統會自動更新。'",
   "'調位屬於執勤安排，不能改票、退票或里程升等；要改日期或班次請洽組員派遣（由後台處理），訂位會自動更新。'")

# G4b：DH 改日期／改班只能後台 AI（dh_change）：紀錄 S.dhMoveR1101A（kgm28_dhmove），航班資料 DH 名單與 DH 訂位都照它搬；PNR 不變
RW('dh28 list move',"    return (o[key]||[]).filter(function(p){return p&&p.empId&&!p.surfaceR928})\n  }\n  function dhBooking929(p,f,date){",
   "    var l28=(o[key]||[]).filter(function(p){return p&&p.empId&&!p.surfaceR928});return window.kgmDhMoveListR1101A?window.kgmDhMoveListR1101A(l28,f,date):l28   /* 1101A：後台 AI 改過日期／班次的 DH */\n  }\n  function dhBooking929(p,f,date){")
RW('dh28 keep pnr',"    if(!b){b=(S.bookings||[]).filter(function(x){return dhOwn7(x,p.empId,date,f.code)})[0]||null;if(b)b.pnr=pnr}",
   "    if(!b){b=(S.bookings||[]).filter(function(x){return dhOwn7(x,p.empId,date,f.code)})[0]||null;if(b&&!b.dhMovedR1101A)b.pnr=pnr}   /* 1101A：改過日期的 DH 訂位 PNR 不變 */")
RW('dh28 tool',"    crew_swap_approve:{tab:'sched',zh:'核准換班',run:function(){",
   "    dh_change:{tab:'sched',zh:'改組員 DH 調位的日期或班次（text 放原話，例如「8K3X 改晚一天回來」「K12345 11/3 KX65 的 DH 改到 11/4」「8K3X 改搭 KX67」）：同一段航線找新的一天／班次，訂位（PNR 不變）、航班資料 DH 名單、組員通知一起更新；座位一律機場櫃檯劃位',run:function(a){return window.kgmDhChangeR1101A(a)}},   /* 1101A */\n    crew_swap_approve:{tab:'sched',zh:'核准換班',run:function(){")
RW('dh28 router',"  function plan(text){\n    var t=norm(text),acts=[];",
   "  function plan(text){\n    var t=norm(text),acts=[];\n    if(/\\bDH\\b|調位/i.test(t)&&/改|換|延|提前|晚一天|早一天|隔天|前一天|move|change/i.test(t)&&!/列出|查詢|哪些|規則/.test(t))return [{tool:'dh_change',args:{text:t}}];   /* 1101A：DH 改日期／改班 */")

# G5：Residence 現金競標不再保留「未得標備選座位」（使用者 Round 2：備選 Seats 可以不用賣、有 workload 的問題）：
#     出價不必帶座位、表單拿掉座位欄、模擬出價不再逐筆配備選座位；未得標改訂替代艙等時再照一般方式選位。舊出價已有的座位照舊顯示。
RW('res28 no seat req',"  if(!o.backupSeat)return {ok:false,why:z()?'請先選擇未得標時使用的備選座位。':'Choose a backup seat first.'};\n",
   "  /* 1101A：不再要求備選座位 */\n")
RW('res28 fix noop',"window.kgmResSeatFixR1006A=function(){\n  var n=0,g={},ver=(S.bookings||[]).length;",
   "window.kgmResSeatFixR1006A=function(){\n  if(!window.KGM_RES_BACKUP_R1101A)return 0;   /* 1101A：不再配備選座位（省掉每次開競標頁的座位計算） */\n  var n=0,g={},ver=(S.bookings||[]).length;")
RW('res28 form seat',"      +'<label>'+(z()?'未得標時的備選座位':'Backup seat')\n        +'<input id=\"r89seat\" class=\"inp\" placeholder=\"'+(z()?'留空系統自動指派':'Leave blank to auto-assign')+'\"></label>'\n",
   "")
RW('res28 submit a',"      backupSeat:window.kgmResAltSeatR182(alt),\n","      backupSeat:'',   /* 1101A：不保留備選座位 */\n")
RW('res28 submit b',"      backupSeat:seat||defaultSeat89(alt),confirmed:true,","      backupSeat:seat||'',confirmed:true,   /* 1101A：不再自動配備選座位 */")
RW('res28 list',"<small>'+(z()?'備選座位 ':'Backup seat ')+E(x.backupSeat||'—')+' · '+E(x.alt||'—')+'</small>",
   "<small>'+(x.backupSeat?((z()?'備選座位 ':'Backup seat ')+E(x.backupSeat)+' · '):'')+(z()?'未得標改訂 ':'Fallback ')+E(x.alt||'—')+'</small>")

# G6：多航段搜尋：新增的航段目的地還沒選時，下拉選單顯示「請選擇目的地」（原本畫面顯示第一個城市、資料卻是空的，路線摘要變成「…」）；版面在 fr28（.mc-search）
# 1101B：使用者「多航段搜尋航點格式不對」→ 出發地／目的地改用主搜尋表單同一個機場選擇器（代碼＋城市＋英文、可搜尋），不再是下拉選單；
#        選擇器的鍵用 mc<i>fr／mc<i>to，讀寫 S.search.segs[i]（r158 pickerHTML158／kgmApPickR158 加這一支）
RW('mc29 fr picker','<select id="mc-seg-${i}-fr" class="inp" onchange="S.search.segs[${i}].fr=this.value">${cityOpts(seg.fr)}</select>',
   '<div class="k29-mcap" id="mc-seg-${i}-fr">${apPickerHTML("mc"+i+"fr")}</div>')
RW('mc28 to placeholder','<select id="mc-seg-${i}-to" class="inp" onchange="S.search.segs[${i}].to=this.value">${cityOpts(seg.to)}</select>',
   '<div class="k29-mcap" id="mc-seg-${i}-to">${apPickerHTML("mc"+i+"to")}</div>')
RW('mc29 cur',"var cur=(which==='fr')?s.fr:s.to;",
   "var cur=(which==='fr')?s.fr:s.to;\n  var mc29=/^mc(\\d+)(fr|to)$/.exec(String(which||''));   /* 1101B：多航段的航點 */\n  if(mc29){var sg29=(s.segs||[])[+mc29[1]]||{};cur=sg29[mc29[2]]||'';s={fr:mc29[2]==='to'?sg29.fr:sg29.to,to:mc29[2]==='fr'?sg29.to:sg29.fr}}")
RW('mc29 pick',"S.search[which]=a;",
   "var mc29=/^mc(\\d+)(fr|to)$/.exec(String(which||''));   /* 1101B：多航段 */\n    if(mc29){var sg29=(S.search.segs||[])[+mc29[1]];if(sg29)sg29[mc29[2]]=a}else\n    S.search[which]=a;")
RW('mc29 label',"+E(cur||'')+'<span style=\"font-family:system-ui,sans-serif;font-size:13.5px;font-weight:400;'",
   "+(cur?E(cur):'<span class=\"k29-ph\">'+(z()?'請選擇':'Select')+'</span>')+'<span style=\"font-family:system-ui,sans-serif;font-size:13.5px;font-weight:400;'")

# F：案件與寵物（js/cs28.js）
RW('cs28 ct7',"group_account:['團體帳號綁定','Group account']};","group_account:['團體帳號綁定','Group account'],pet:['寵物同行申請','Pet travel application']};   /* 1101A */")
RW('cs28 menu','{zh:"特殊醫療",en:"Medical Needs",nav:"prep",tab:"special"}]}\n    ]},',
   '{zh:"特殊醫療",en:"Medical Needs",nav:"prep",tab:"special"},{zh:"寵物同行",en:"Travel with Pets",nav:"pet28"}]},\n      {zh:"旅客服務",en:"Customer Care",items:[{zh:"寵物同行申請",en:"Pet Application",nav:"pet28"},{zh:"建立客服案件",en:"Contact Us · New Case",nav:"case28"},{zh:"案件進度查詢",en:"Case Status",nav:"case_lookup_0831B"}]}   /* 1101B：使用者「上排像是寵物還有其他的要加入到上排，指的是這裡」＝飛行準備選單 */\n    ]},')
RW('cs28 cat filter',"  var zh=ZJ(),all=caseRowsJ(),F=S.case7F||{},q=String(S.caseFilter0831B||'').toUpperCase();",
   "  var zh=ZJ(),all0=caseRowsJ(),cat28=S.case28Cat==='refund'?'refund':'other',isR28=function(r){return window.kgmCaseIsRefundR1101A?window.kgmCaseIsRefundR1101A(r):false};   /* 1101A：退票退費（需 CEO）／其他 兩個分頁 */\n  var all=all0.filter(function(r){return isR28(r)===(cat28==='refund')}),F=S.case7F||{},q=String(S.caseFilter0831B||'').toUpperCase();\n  var cnt28=function(rf){return all0.filter(function(r){return isR28(r)===rf&&!closed7(r)}).length},ceo28=function(rf){return all0.filter(function(r){return isR28(r)===rf&&/ceo_review|needs_more_info/.test(r.status)}).length};\n  var catBar28='<div class=\"k28-cat\" role=\"tablist\"><button type=\"button\" class=\"'+(cat28==='refund'?'on':'')+'\" onclick=\"S.case28Cat=\\'refund\\';S.case7Sel=null;render()\">'+(zh?'退票退費':'Refunds')+'<b>'+cnt28(true)+'</b><small>'+(zh?'需執行長核准・待 CEO '+ceo28(true):'CEO approval')+'</small></button><button type=\"button\" class=\"'+(cat28==='other'?'on':'')+'\" onclick=\"S.case28Cat=\\'other\\';S.case7Sel=null;render()\">'+(zh?'其他案件':'Other cases')+'<b>'+cnt28(false)+'</b><small>'+(zh?'行李、客訴、寵物、團體異動…・待 CEO '+ceo28(false):'Bags, complaints, pets…')+'</small></button></div>';")
RW('cs28 cat bar',"    +'<div class=\"k7c-kpi\">'+kpi.map(","    +catBar28+'<div class=\"k7c-kpi\">'+kpi.map(")
RW('cs28 ceo acts',"  if(staff&&!cl){\n    acts='<div class=\"k7c-act\">",
   "  if(staff&&!cl&&raw.status==='ceo_review'&&window.kgmCase28CeoActsR1101A){acts=window.kgmCase28CeoActsR1101A(r)}   /* 1101A：送 CEO 最後審核的案件 */\n  else if(staff&&!cl){\n    acts='<div class=\"k7c-act\">")
RW('cs28 to ceo btn',"      +'<div class=\"k7c-btns\"><button class=\"btn btn-g\" onclick=\"kgmCase7Update(\\''+AJ(r.no)+'\\')\">'+(zh?'儲存並更新':'Save update')+'</button></div></div>';",
   "      +'<div class=\"k7c-btns\"><button class=\"btn\" onclick=\"kgmCase28ToCeo(\\''+AJ(r.no)+'\\')\">'+(zh?'送 CEO 最後審核':'Assign to CEO')+'</button><button class=\"btn btn-g\" onclick=\"kgmCase7Update(\\''+AJ(r.no)+'\\')\">'+(zh?'儲存並更新':'Save update')+'</button></div></div>';")
RW('cs28 files',"    +bag+(r.source==='profile'?profileBlockR913(r):'')","    +bag+(window.kgmCaseFilesHtmlR1101A?window.kgmCaseFilesHtmlR1101A(raw):'')+(r.source==='profile'?profileBlockR913(r):'')")
RW('cs28 flight',"  if(raw.segment&&raw.segment.code)x.flight=raw.segment.code+' '+(raw.segment.fr||'')+'→'+(raw.segment.to||'')+' '+String(raw.segment.date||'').slice(5);",
   "  if(raw.segment&&raw.segment.code)x.flight=window.kgmCaseFlightR1101A?window.kgmCaseFlightR1101A(raw.segment.code,raw.segment.fr,raw.segment.to,raw.segment.date):(raw.segment.code+' '+(raw.segment.fr||'')+'→'+(raw.segment.to||'')+' '+String(raw.segment.date||'').slice(5));   /* 1101A：夥伴營運寫 CX531 (KX9921) TPE-HKG */")
RW('cs28 src label',"  rows.forEach(function(r){try{case7Label(r)}catch(_){}});",
   "  rows.forEach(function(r){try{case7Label(r)}catch(_){}});\n  rows.forEach(function(r){try{if(r.raw&&r.raw.by&&r.raw.by.role==='passenger')r.sourceLabel=ZJ()?'旅客線上建立':'Passenger (online)'}catch(_){}});   /* 1101A */")
RW('cs28 pet tag',"+(window.kgmSsrBadgeR1010A?window.kgmSsrBadgeR1010A(x):'')+(x.dhR929?' <span class=\"k929-dh\"",
   "+(window.kgmSsrBadgeR1010A?window.kgmSsrBadgeR1010A(x):'')+(window.kgmPetTagR1101A&&x.pnr?window.kgmPetTagR1101A(x.pnr,k):'')+(x.dhR929?' <span class=\"k929-dh\"")

RW('cs28 ai pet',"    [/寵物|狗|貓|動物|pet/i,function(){return '寵物（犬、貓）可以，需於起飛前申請：'+pol('寵物 受理',300)}],",
   "    [/寵物|狗|貓|動物|服務犬|導盲犬|pet/i,function(){return window.kgmPetAiR1101A?window.kgmPetAiR1101A(String(window.__k23q||'')):('寵物（犬、貓）可以，需於起飛前申請：'+pol('寵物 受理',300))}],   /* 1101A：KGM-PET-022＋直接開申請頁 */")

# F2：《動物運送規定》KGM-PET-009 改版 Rev. B（pet_doc.py；PDF 同一份 pol/pet28_pdf.py）：網站內嵌條文換成新版（份數不變）
import json, pet_doc, grp_doc28
RW('pet28 policy doc',"window.kgmPolicyDocR914=function(id){",
   "/* 1101A：《動物運送規定》KGM-PET-009 Rev. B（patches/1101A/pet_doc.py，PDF 同一份）、《團體訂位規章》KGM-GRP-021 Rev. C（grp_doc28.py；1101B 改版） */\nwindow.KGM_POLICY_DOCS_R914[\"KGM-PET-009\"]="+json.dumps(pet_doc.doc(),ensure_ascii=False)+";\nwindow.KGM_POLICY_DOCS_R914[\"KGM-GRP-021\"]="+json.dumps(grp_doc28.doc(),ensure_ascii=False)+";\nwindow.kgmPolicyDocR914=function(id){")

# H5：通知管理「航班旅客」分航段（js/ad28.js）
RW('nt28 code',"value=\"${S.anFltCode||''}\" oninput=\"S.anFltCode=this.value.toUpperCase()\">","value=\"${S.anFltCode||''}\" oninput=\"S.anFltCode=this.value.toUpperCase()\" onchange=\"render()\">")
RW('nt28 date',"value=\"${S.anFltDate||''}\" oninput=\"S.anFltDate=this.value\">","value=\"${S.anFltDate||''}\" oninput=\"S.anFltDate=this.value\" onchange=\"render()\">")
RW('nt28 legs',"<div style=\"font-size:11px;color:var(--sub);margin-bottom:6px\">${(function(){var n=countPaxOnFlight(","${window.kgmNtLegsR1101A?window.kgmNtLegsR1101A():''}<div style=\"font-size:11px;color:var(--sub);margin-bottom:6px\">${(function(){var n=countPaxOnFlight(")

# H4：換機身清單：飛機在 TPE、航班從外站出發 → 算從 TPE 空機調過去來不來得及（js/ad28.js kgmFerryR1101A），不再一律「不在 BOS」
RW('ferry28 var',"    return T.map(function(t){var st='ok',why='';","    return T.map(function(t){var st='ok',why='',ferry=null;")
RW('ferry28 away',"if(at!==f0&&!(at==='TPE'&&f0==='TSA')&&!(at==='TSA'&&f0==='TPE')){st='away';why=(z()?'不在 ':'Not at ')+f0+(z()?'（在 '+at+'）':' (at '+at+')')}",
   "if(at!==f0&&!(at==='TPE'&&f0==='TSA')&&!(at==='TSA'&&f0==='TPE')){var fy=null;try{fy=window.kgmFerryR1101A?window.kgmFerryR1101A(t,at,f0,legs,win,span,routeOf):null}catch(_){}   /* 1101A：在 TPE 的飛機算空機調派 */\n            if(fy&&fy.ok){st='ok';why=fy.why;ferry=fy}else{st='away';why=(fy&&fy.why)||((z()?'不在 ':'Not at ')+f0+(z()?'（在 '+at+'）':' (at '+at+')'))}}")
RW('ferry28 ret',"      return {tail:t,st:st,why:why,legs:n,cur:t===mv.tail}});","      if(st==='ok'&&!ferry&&t!==mv.tail&&mv.tail&&window.kgmRotMoveR1103A){try{var r31=window.kgmRotMoveR1103A([{code:code,date:date,route:fr+'→'+to}],t,{dry:1});if(r31&&!r31.ok&&r31.kind!=='none'){st=r31.kind==='mx'?'mx':(r31.kind==='away'?'away':'busy');why=r31.why}}catch(_){}}   /* 1103A：跟換過去實際用的同一套檢查（rot31.js；要空機調派的照 1101A 算法） */\n      return {tail:t,st:st,why:why,legs:n,cur:t===mv.tail,ferry:ferry}});")
RW('ferry28 label',"(x.st==='ok'?((z()?'當天 ':'')+x.legs+(z()?' 段':' legs')):E(x.why))","(x.st==='ok'?(x.ferry?E(x.why):((z()?'當天 ':'')+x.legs+(z()?' 段':' legs'))):E(x.why))")

# H3：航班狀態「轉降」→ 航班動態該日追加續航段（例：KX37 轉降 KIX → 當日加一段 KX37 KIX→TPE），編輯面板加續航時刻與版面（js/ad28.js）
RW('dv28 find',"    out.sort(function(a,b){return mn(a.legs[0].f.dep)-mn(b.legs[0].f.dep)||String(a.legs[0].f.code).localeCompare(String(b.legs[0].f.code))});\n    return out;\n  }\n  /* 依航班號：查詢那天經停點起飛的第二段",
   "    try{if(window.kgmDivertFindR1101A)window.kgmDivertFindR1101A(byNo,kx,D,S.stFr,S.stTo).forEach(push)}catch(_){}   /* 1101A：轉降後的續航段（只在那一天） */\n    out.sort(function(a,b){return mn(a.legs[0].f.dep)-mn(b.legs[0].f.dep)||String(a.legs[0].f.code).localeCompare(String(b.legs[0].f.code))});\n    return out;\n  }\n  /* 依航班號：查詢那天經停點起飛的第二段")
RW('dv28 info',"    var f=l.f,d=l.d,ov=ovOf(f,d),dep=ov.dep||f.dep,","    var f=l.f,d=l.d,ov=f.divertContR1101A?{}:ovOf(f,d),dep=ov.dep||f.dep,")
RW('dv28 label',"(mini?'<span class=\"fb19-st '+x.st[2]+'\">'+E(Z?x.st[0]:x.st[1])+'</span>':(Z?'直飛':'Nonstop'))",
   "(mini?'<span class=\"fb19-st '+x.st[2]+'\">'+E(Z?x.st[0]:x.st[1])+'</span>':(x.f.divertContR1101A?(Z?'轉降續航（原 '+E(x.f.divertFromR1101A)+'→'+E(x.f.to)+'）':'Diversion continuation'):(Z?'直飛':'Nonstop')))")
RW('dv28 fields','<input id="adDivertTo" class="inp" placeholder="如 KIX" value="${(S.flightOverrides?.[editKey]||{}).divertTo||""}"></div>',
   '<input id="adDivertTo" class="inp" placeholder="如 KIX" value="${(S.flightOverrides?.[editKey]||{}).divertTo||""}"></div>${window.kgmDivertFieldsR1101A?window.kgmDivertFieldsR1101A(editKey):""}')
RW('dv28 panel','<div style="border:1px solid var(--border);border-radius:8px;padding:14px;background:#fafaf9;margin-bottom:10px">\n      <h4 style="font-size:13px;color:var(--g);margin-bottom:10px">Edit: ${editKey}</h4>',
   '<div class="k28-edit" style="border:1px solid var(--border);border-radius:8px;padding:14px;background:#fafaf9;margin-bottom:10px">\n      <h4 style="font-size:13px;color:var(--g);margin-bottom:10px">${window.kgmEditHeadR1101A?window.kgmEditHeadR1101A(editKey):("Edit: "+editKey)}</h4>')

# H1：航班調整（季節班表卡）起飛／抵達時間加 −／＋（每次 5 分鐘；起飛改了抵達跟著移，航程不變；只改輸入框、不重畫整頁）
RW('fa28 dep',"      +'<label>'+(zh?'起飛時間':'Departure')+'<input id=\"k57dep_'+sea+'\" class=\"inp\" value=\"'+E7(rec.dep||f.dep)+'\" placeholder=\"HH:MM\"></label>'",
   "      +'<label>'+(zh?'起飛時間':'Departure')+'<span class=\"k28pm\"><button type=\"button\" title=\"−5\" onclick=\"kgmTimeStepR1101A(\\'k57dep_'+sea+'\\',-5,\\'k57arr_'+sea+'\\')\">−</button><input id=\"k57dep_'+sea+'\" class=\"inp\" value=\"'+E7(rec.dep||f.dep)+'\" placeholder=\"HH:MM\"><button type=\"button\" title=\"+5\" onclick=\"kgmTimeStepR1101A(\\'k57dep_'+sea+'\\',5,\\'k57arr_'+sea+'\\')\">＋</button></span><small>'+(zh?'每按一次 5 分鐘，抵達跟著移':'5 min per click; arrival moves too')+'</small></label>'")
RW('fa28 arr',"<input id=\"k57arr_'+sea+'\" class=\"inp\" value=\"'+E7(rec.arr||f.arr)+'\" placeholder=\"HH:MM\">",
   "<span class=\"k28pm\"><button type=\"button\" title=\"−5\" onclick=\"kgmTimeStepR1101A(\\'k57arr_'+sea+'\\',-5)\">−</button><input id=\"k57arr_'+sea+'\" class=\"inp\" value=\"'+E7(rec.arr||f.arr)+'\" placeholder=\"HH:MM\"><button type=\"button\" title=\"+5\" onclick=\"kgmTimeStepR1101A(\\'k57arr_'+sea+'\\',5)\">＋</button></span>")

RW('fa28 eff',"      +' <span>'+E7(rng.label)+'</span></p>'","      +' <span>'+E7(rng.label)+'</span></p>'+(window.kgmEffNoteR1101A?window.kgmEffNoteR1101A(f,rec,rng):'')   /* 1101A：存的時刻跟實際生效（夜間時段／輪擋規則調整後）不同時寫出來 */")

# H6：請假管理、訊息中心正式化（js/ad28.js：頁首、統計、假別規定表；聊天的 CEO 稽核收進可展開區塊）
RW('lv28 head','    body=`<div class="adm-sec">${_S("請假管理（依臺灣勞基法）","Leave Management (Taiwan Labor Standards Act)")}</div>',
   '    body=`${window.kgmLeaveHeadR1101A?window.kgmLeaveHeadR1101A():\'<div class="adm-sec">\'+_S("請假管理（依臺灣勞基法）","Leave Management (Taiwan Labor Standards Act)")+\'</div>\'}')
RW('lv28 rules','    <div class="adm-card" style="background:#f4f7f5"><div style="font-size:11.5px;color:#556;line-height:1.7"><b>特休：</b>滿半年3天・1年7天・2年10天・3年14天・5年15天・10年起每年+1天（上限30天）。機師滿3月起、最高42天。<b> 病假：</b>每年≤30天半薪。<b> 事假：</b>每年≤14天不支薪。<b> 生理假：</b>每月1天，全年前3天不併病假。</div></div>',
   '    ${window.kgmLeaveRulesR1101A?window.kgmLeaveRulesR1101A():\'\'}')
RW('ch28 head','    body=`<div class="adm-sec">員工聊天 v2（分串對話・已讀・未讀通知）</div>\n    ${_ceoHTML}\n    <div class="adm-card" style="padding:0;overflow:hidden">',
   '    body=`${window.kgmChatHeadR1101A?window.kgmChatHeadR1101A():\'<div class="adm-sec">員工訊息</div>\'}\n    ${_ceoHTML?\'<details class="k28-audit"><summary>\'+(LANG==="en"?"CEO audit · view a full conversation between two staff":"CEO 稽核：查看兩位員工的完整對話")+\'</summary>\'+_ceoHTML+\'</details>\':\'\'}\n    <div class="adm-card k28-chat" style="padding:0;overflow:hidden">')

# D：團體訂位（js/grp28.js）＋原程式三處：會員欄位鎖定不套用到團體表單、尾款重開匯出、名單多一欄 KGM 會員卡號
RW('grp28 lock',"function lockMember49(){try{if(!(S.view==='booking'&&S.phase==='pax'&&S.user))return;",
   "function lockMember49(){try{if(!(S.view==='booking'&&S.phase==='pax'&&S.user))return;if(window.kgmGrpOnR1025B&&window.kgmGrpOnR1025B())return;   /* 1101A：團體資料頁（團名、領隊）不是會員本人資料，不能鎖 */")
RW('grp28 rebal',"function rebal(g,b,why){","window.kgmGrpRebalR1101A=function(g,b,why){return rebal(g,b,why)};   /* 1101A：選位費加進尾款（js/grp28.js） */\nfunction rebal(g,b,why){")
RW('grp28 names td',"<td><input id=\"k25gNP'+i+'\" class=\"inp\" value=\"'+E(r.passport||'')+'\"></td>'",
   "<td><input id=\"k25gNP'+i+'\" class=\"inp\" value=\"'+E(r.passport||'')+'\"></td><td><input id=\"k25gNM'+i+'\" class=\"inp\" value=\"'+E(r.member||'')+'\" placeholder=\"'+(z()?'選填':'optional')+'\"></td>'")
RW('grp28 names th',"<th>'+(z()?'護照號碼':'Passport')+'</th><th>'+(z()?'艙等':'Cabin')+'</th>","<th>'+(z()?'護照號碼':'Passport')+'</th><th>'+(z()?'KGM 會員卡號（里程進該會員；不填進訂購者）':'KGM member no.')+'</th><th>'+(z()?'艙等':'Cabin')+'</th>")

# E：包機／自創航班報價流程（js/cr28.js）＋原程式：狀態名稱、開票等到起飛前 14 天
RW('cr28 stz',"cancelled:['已撤回／取消','Cancelled','#6B6F6C','#F1F2F1']};",
   "cancelled:['已撤回／取消','Cancelled','#6B6F6C','#F1F2F1'],quoted:['已報價・待回覆','Quoted','#7A5A12','#FFF4E0'],rejected:['已拒絕報價','Quote declined','#6B6F6C','#F1F2F1'],expired:['報價逾期','Quote expired','#6B6F6C','#F1F2F1']};   /* 1101A */")
RW('cr28 ticket hold',"function maybeTicket(g,force){\n  if(g.kind!=='v25'||g.status==='ticketed'||g.status==='cancelled')return false;",
   "function maybeTicket(g,force){\n  if(g.kind!=='v25'||g.status==='ticketed'||g.status==='cancelled')return false;\n  if(!force&&g.ticketFromR1101A&&T()<g.ticketFromR1101A)return false;   /* 1101A：包機／自創航班名單到起飛前 14 天都能改，那天才開票 */\n  if(window.kgmGrpMovedTbaR1101A&&window.kgmGrpMovedTbaR1101A(g))return false;   /* 1101A：分艙拆出的旅客姓名還沒填 */")
RW('grp28 mix steps',"[z()?'名單':'Names',namesDone(g)>=g.pax]","[z()?'名單':'Names',namesDone(g)>=g.pax&&!(window.kgmGrpMovedTbaR1101A&&window.kgmGrpMovedTbaR1101A(g))]")
RW('grp28 mix moved ed',"var mv=(g.moved||[]).length?","var mv=window.kgmGrpMovedEdR1101A?window.kgmGrpMovedEdR1101A(g):(g.moved||[]).length?")

# Z：寄信清單（後台「寄信事件」）：包機／自創航班報價
RW('mail28 charter quoted',"  {ev:'group.charter_approved',who:'ext',zh:'包機／自創航班核准・班號與訂金請款',en:'Charter approved',when:'團體業務核准：寫明班號、時刻、機型、報價與訂金期限（核准後 7 天）'},",
   "  {ev:'group.charter_quoted',who:'ext',zh:'包機／自創航班報價（不二價）',en:'Charter quote',when:'團體業務在後台案件給報價：寫明金額、回覆期限（7 天；離申請期限不到 7 天就到期限前 3 天）；旅客在前台案件接受或拒絕'},\n"
   "  {ev:'group.charter_approved',who:'ext',zh:'包機／自創航班成立・班號與全額請款',en:'Charter confirmed',when:'旅客接受報價：建立航班與團體訂位，寫明班號與時刻；當下付清全額，名單起飛前 14 天前可改、之後自動開票'},")

# Z：稽核 R182 跟著 1101A 規則（Residence 競標不再保留備選座位 → 送出時不帶 backupSeat 才對）
RW('res28 audit r182',"  if(!(o.submitPasses&&o.submitPasses.backupSeat&&o.submitPasses.confirmed))\n    bad.push('送出現金出價仍然沒有帶 backupSeat／confirmed');",
   "  if(!(o.submitPasses&&o.submitPasses.confirmed))\n    bad.push('送出現金出價沒有帶 confirmed');\n  if(o.submitPasses&&o.submitPasses.backupSeat)\n    bad.push('1101A 起競標不保留備選座位，送出仍帶 backupSeat');   /* 1101A：使用者「Residence 備選座位不賣」 */")

# R2-A：後台卡頓——cabinInventory54 每問一次就把全部訂位重跑 segs7（每段還查季節時刻）；排組員 DH 一班要問幾百次（開頁 2 分鐘後 33 秒裡 12.6 秒在這裡）。
#   每筆訂位的實體航段清單記在訂位上（不可列舉、不存檔），航班／日期／艙等（outF/inbF/mcFlights/outC/inbC）一變就重算；座位、狀態、單段升等照舊每次即時讀。
RW('lag29 inv segs',"(window.segs7(b,true)||[]).forEach(function(s){var sf=s.f||{};if(sf.code!==f.code",
   "(window.kgmSegsMemoR1101B?window.kgmSegsMemoR1101B(b):(window.segs7(b,true)||[])).forEach(function(s){var sf=s.f||{};if(sf.code!==f.code")

# R2-A：背景計算讓出主執行緒（使用者：「非常嚴重的卡頓，確保都有解決」；clk28 1101A p50 0.74 秒、p90 2.9 秒、最長 7.5 秒；1027A p50 2.7 秒、最長 12.5 秒）
#   開頁後機隊整年重排：每一段（準備每段 0.4～2 秒、最後組合 3.2 秒、拆機收尾 3.2 秒）原本不管使用者有沒有在操作 → 每段開始前先確認使用者停手 1.5 秒（最後組合與拆機收尾 3 秒）
RW('lag29 fleet gate',"function next6(f){setTimeout(function(){try{f()}catch(e){try{console.warn('r72 final prep',e)}catch(_){}finish6()}},0)}",
   "function gate6(ms,fn){var go=function(){var w=!(window.kgmBgHiddenR1103A&&window.kgmBgHiddenR1103A())&&(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<ms||(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<30000&&(Date.now()-(gate6.end||0)<1.5*(gate6.dur||0)||Date.now()-(window.KGM_BG_LAST_R1101B||0)<2500)));if(w){(window.kgmBgSoonR1103A||setTimeout)(go,400);return}var t=Date.now();try{fn()}finally{gate6.dur=Date.now()-t;gate6.end=window.KGM_BG_LAST_R1101B=Date.now()}};(window.kgmBgSoonR1103A||setTimeout)(go,0)}   /* 1103A：分頁看不見時不等使用者、由 Worker 叫醒（rot31.js） */   /* 1101B：使用者停手才做下一段；使用者 30 秒內有操作時做完一段讓出 1.5 倍時間（沒人操作照原本速度，整年重排不會變晚） */\n"
   "    function next6(f){gate6(f===finish6?3000:1500,function(){try{f()}catch(e){try{console.warn('r72 final prep',e)}catch(_){}finish6()}})}")
RW('lag29 split gate',"      setTimeout(function(){\n        var t15=Date.now();","      gate6(3000,function(){\n        var t15=Date.now();")
#   組員排班背景：算一天 1～2.6 秒 → 開始算之前再確認使用者停手 1.5 秒（瀏覽器空檔回呼可能逾時觸發）；不在組員班表分頁時，兩天之間至少讓出「上一天花的時間 × 3」（佔主執行緒 ≤ 25%）；進度存檔 5 天一次 → 20 天一次（一次 2～3 秒）
RW('lag29 r135 wait',"setTimeout(function(){try{if(typeof window.kgmRebuild135==='function')window.kgmRebuild135()}catch(_){}},72000);",
   "setTimeout(function w135(){if(!window.KGM_FULLDONE_1006A){setTimeout(w135,5000);return}try{if(typeof window.kgmRebuild135==='function')window.kgmRebuild135()}catch(_){}},72000);   /* 1101B：分段整年重排還沒做完就等（原本 72 秒一到就同步整年重排一次，卡 22 秒；做完後 KGM_ROT_SUM_R72 已設，這裡不會再重排） */")
RW('lag29 crew pool',"    BUSY25=true;\n    idle(function(){",
   "    BUSY25=true;\n    if(!POOL121){idle(function(){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500||(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<60000&&Date.now()-(window.KGM_BG_LAST_R1101B||0)<2500)){BUSY25=false;setTimeout(tick,1500);return}try{pool121()}catch(_){}window.KGM_BG_LAST_R1101B=Date.now();BUSY25=false;setTimeout(tick,Math.max(900,Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<60000?6000:0))});return}   /* 1101B：組員名單（約 3 秒）第一次另外算一段，不跟第一天（1～4 秒）擠在同一段 */\n    idle(function(){")
RW('lag29 crew gate',"    idle(function(){try{window.kgmCrewStepR121(1,target())}catch(_){}BUSY25=false;",
   "    idle(function(){if(!(window.kgmBgHiddenR1103A&&window.kgmBgHiddenR1103A())&&(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500||(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<60000&&Date.now()-(window.KGM_BG_LAST_R1101B||0)<2500))){BUSY25=false;(window.kgmBgSoonR1103A||setTimeout)(tick,1500);return}var t29=Date.now();try{window.kgmCrewStepR121(1,target())}catch(_){}window.__crewMs29=Date.now()-t29;window.KGM_BG_LAST_R1101B=Date.now();BUSY25=false;")
RW('lag29 crew pace',"      setTimeout(tick,pace27())});","      (window.kgmBgSoonR1103A||setTimeout)(tick,Math.max(pace27(),pace27()<100||Date.now()-(window.KGM_LAST_INPUT_R1025B||0)>60000?0:3*(window.__crewMs29||0)))});   /* 1103A：8→3 倍（使用者：看其他頁也要繼續跑）；分頁看不見時 Worker 叫醒 */   /* 1101B：不在組員班表分頁、使用者 60 秒內有操作時佔主執行緒 ≤ 11%（一天 1～4 秒不能中斷，算一天休息 8 倍時間，撞到點擊的機率約 1/9）；沒人操作照原本 0.9 秒 */")
#   競標預補：一班最多 1.5 秒（結算要 Payload 艙單），補完一班花超過 0.3 秒就休息 5 倍時間
RW('lag29 auc pace',"      window.KGM_AUC_DEFER_SAVE_R1025B=0;flush25(!Q.length);if(Q.length)idle25(step)})();",
   "      window.KGM_AUC_DEFER_SAVE_R1025B=0;flush25(!Q.length);var dt29=Date.now()-t;if(Q.length){if(dt29>300&&Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<60000)setTimeout(function(){idle25(step)},5*dt29);else idle25(step)}})();   /* 1101B：一班超過 0.3 秒就休息 5 倍時間 */")
RW('lag29 crew save',"days27(SAVEDCUR27,CURSOR121)>=5))save25();","days27(SAVEDCUR27,CURSOR121)>=20))save25();   /* 1101B：5→20 天存一次（一次 2～3 秒） */")
#   DH 騰位掃描：一班 0.1～0.6 秒，原本不看使用者 → 停手 5 秒才掃下一班
RW('lag29 dh gate',"      var i=0,w15=0;(function step(){if(i>=list.length)return;if(busy7()){setTimeout(step,15000);return}",
   "      var i=0,w15=0;(function step(){if(i>=list.length)return;if(busy7()){setTimeout(step,15000);return}if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<5000){setTimeout(step,2000);return}   /* 1101B：使用者停手才掃 */")

# 1102A：拿掉 1101B 的機隊整年結果讀回（lag29 fleet cache）：KGM_ROT_FINAL_R913 在整年重排做完後也一直是 false，從來沒存成功過＝死碼

# R2-A 附帶：KX30 溫哥華→多倫多時刻被兩層來回改（r77 定值 22:25 寫進航班表、r179 中停 75 分改回 21:00，各自計時重跑）→ 網站顯示的時刻看什麼時候看（21:30–05:10／22:25–06:05），
#   機隊整年重排讀到的航班表也不一定 → 定值改成 r179 定案的值（夏 21:00–04:10⁺¹、冬 21:30–04:25⁺¹、營運日 1·3·5·7），兩層一致就不再來回改
RW('kx30 fixed',"'KX30|YVR|YYZ':{summer:['22:25','05:35',1,[1,3,5,7],'B789'],winter:['00:05','07:00',0,[1,2,4,6],'B789']},",
   "'KX30|YVR|YYZ':{summer:['21:00','04:10',1,[1,3,5,7],'B789'],winter:['21:30','04:25',1,[1,3,5,7],'B789']},   /* 1101B：跟 r179 中停 75 分定案的值一致（原本兩層來回改） */\n      ")
RW('kx30 fixed thru',"'KX30|TPE|YYZ':{summer:['23:50','05:35',1,[1,3,5,7],'B789'],winter:['23:50','07:00',1,[1,3,5,7],'B789']},",
   "'KX30|TPE|YYZ':{summer:['23:50','04:10',1,[1,3,5,7],'B789'],winter:['23:35','04:25',1,[1,3,5,7],'B789']},")

# R2-D：團體（使用者：「圖一不要顯示 但是整體應該還是要比單獨訂便宜很多」「改票一律都是以整筆訂位而非單次費用 手續費與現在一樣」）
RW('grp29 mul q',"mul:0.93,","mul:0.72,")
RW('grp29 mul u',"mul:1.08,","mul:0.85,")
RW('grp29 chg txt',"改票每人 NT$","改票每筆訂位 NT$",cnt=7)
RW('grp29 chg card','"Per passenger · counter same fee":"每位旅客 · 櫃檯同價"','"Per booking · counter same fee":"每筆訂位 · 櫃檯同價"')
RW('grp29 chg fee',"    fee=changeFeeOf(s.cls);\n    if(fee<0){changeable=false;fee=0}\n    fee=fee*pax;",
   "    fee=changeFeeOf(s.cls);\n    if(fee<0){changeable=false;fee=0}\n    if(!(window.kgmIsGrpCodeR1026C&&window.kgmIsGrpCodeR1026C(s.cls)))fee=fee*pax;   /* 1101B：團體改票以整筆訂位收一次 */")

# R2-F／1102A：Residence 開放中的出價依第二志願艙與人數保留座位、不指定座位號（js/gr28.js kgmResHoldNR1102A；1101B 的每艙固定 1 席已拿掉）
RW('res29 hold1',"  Object.keys(S.seatHoldsR4||{}).forEach(function(k){var hold=S.seatHoldsR4[k];",
   "  try{if(window.kgmResHold1R1101B)window.kgmResHold1R1101B(f,date,cabin,slots,used)}catch(_){}   /* 1102A：開放中的 Residence 出價依第二志願艙與人數保留（不指定座位號） */\n  Object.keys(S.seatHoldsR4||{}).forEach(function(k){var hold=S.seatHoldsR4[k];")

# R2-E：定位管理顯示寵物（js/cs28.js）——定位管理實際的畫面是 0819J 票務中心（.j-dossier），表頭加「寵物同行」、完整行程下面加寵物表
RW('pet29 booking cell',"<div><small>'+(ZJ()?'狀態':'Status')+'</small><b>'+EJ(b.status||'confirmed')+'</b></div><div><small>'+(ZJ()?'訂購時間（訂購地當地）'",
   "<div><small>'+(ZJ()?'狀態':'Status')+'</small><b>'+EJ(b.status||'confirmed')+'</b></div>'+(window.kgmPetBookingCellR1101B?window.kgmPetBookingCellR1101B(b):'')+'<div><small>'+(ZJ()?'訂購時間（訂購地當地）'")
RW('pet29 booking detail',"'+EJ(s.acft||s.f&&s.f.acft||'—')+'</span></div></article>'}).join('')+'</div><h3>'+(ZJ()?'票價、付款與服務'",
   "'+EJ(s.acft||s.f&&s.f.acft||'—')+'</span></div></article>'}).join('')+'</div>'+(window.kgmPetBookingDetailR1101B?window.kgmPetBookingDetailR1101B(b):'')+'<h3>'+(ZJ()?'票價、付款與服務'")

# R2-C：航班預估時刻跟路線圖同一套（使用者：「圖四這種直接改延遲抵達並同步更新航班動態啊」「圖四寫預計晚快一小時 圖五寫提早到？？？」）
#   圖四「多飛約 55 分」是跟大圓直飛比（班表本來就含繞道）；EST（predict7）只算當天高空風、沒算「繞道比班表還多的時間」（kgmWarDelayR1025B.min，48 小時延遲抵達通知用的那個）。
#   → predict7 抵達加上 min；晚 15 分以上＝延誤（延遲抵達）＋原因；航班資料、航班動態、通知都讀 predict7 這一份。路線圖文字改成「比直飛多 X 分（班表已含）・預計準時／晚到 N 分」。
RW('war29 sig',"sg27=[f.dep,f.arr,ov27.status||'',ov27.dep||'',ov27.arr||'',ov27.reason||''].join('|');",
   "wm29=(function(){try{var w=window.kgmWarDelayR1025B&&window.kgmWarDelayR1025B(f,date);return w&&w.min||0}catch(_){return 0}})(),sg27=[f.dep,f.arr,ov27.status||'',ov27.dep||'',ov27.arr||'',ov27.reason||'','w29:'+wm29].join('|');   /* 1101B：繞道比班表多的時間（kgmWarDelayR1025B.min） */")
RW('war29 arr',"arr=dep+(wd27?wd27.diff:0)+Math.max(0,b.impact-2)+(H(k+'FLOW')%7)-3,",
   "arr=dep+(wd27?wd27.diff:0)+wm29+Math.max(0,b.impact-2)+(H(k+'FLOW')%7)-3,")
RW('war29 status',"p.sigR1026C=sg27;p.windR1026C=wd27;try{",
   "p.sigR1026C=sg27;p.windR1026C=wd27;p.warMinR1101B=wm29;try{if(wm29>0&&p.arrDelta>=15&&p.depDelta<15&&!/^(Diverted|Cancelled)$/.test(p.status)){p.status='Delayed';p.arrLateR1101B=1;p.reasonR1026C=(z()?'避開關閉空域繞道，預計晚到 '+p.arrDelta+' 分（準時起飛）':'Closed-airspace detour — arriving about '+p.arrDelta+' min late')}}catch(_){}try{")
RW('war29 legend',"(wd?((z()?'・多飛約 ':' · about ')+'<b>'+Math.round(wd.raw)+(z()?' 分鐘':' min')+'</b>'):'')",
   "(wd?((z()?'・比直飛多約 ':' · about ')+Math.round(wd.raw)+(z()?' 分鐘（班表已含 '+Math.min(Math.round(wd.raw),Math.round(wd.slack||0))+' 分）':' min more than direct (schedule allows '+Math.min(Math.round(wd.raw),Math.round(wd.slack||0))+')')+'・'+(wd.min>0?'<b>'+(z()?'繞道預計晚到 '+wd.min+' 分':'detour adds '+wd.min+' min')+'</b>':(z()?'繞道不影響抵達時間':'detour does not delay arrival'))+(z()?'（當天預估時刻見上方 EST）':' (see EST above for today)')):'')")

# R2-C：後台航班狀態頁（js/ad28.js kgmAdStNoteR1101B／kgmAdStExtraR1101B）：狀態下面寫預估時刻與原因、轉降寫續航、續航那天的航線多一列
RW('st29 note','<td style="padding:7px 10px"><span style="font-weight:700;color:${stColors[st]||"#888"}">&bull; ${st}</span></td>',
   '<td style="padding:7px 10px"><span style="font-weight:700;color:${stColors[st]||"#888"}">&bull; ${st}</span>${window.kgmAdStNoteR1101B?window.kgmAdStNoteR1101B(f,qdate,ov,st):""}</td>')
RW('st29 extra','&#10003; Arrived</button>\n            </div></td>\n          </tr>`;}).join("")}\n        </tbody>',
   '&#10003; Arrived</button>\n            </div></td>\n          </tr>`;}).join("")}${window.kgmAdStExtraR1101B?window.kgmAdStExtraR1101B(S.adSearchFr||"TPE",S.adSearchTo||"NRT",qdate):""}\n        </tbody>')
RW('st29 show','${srchF.length?`<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:12px">',
   '${(srchF.length||(window.kgmAdStExtraR1101B&&window.kgmAdStExtraR1101B(S.adSearchFr||"TPE",S.adSearchTo||"NRT",qdate)))?`<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:12px">')

# R2-C：前台航班動態——48 小時內繞道晚到（geo26 job 寫的 S.flightOverrides，warDelayR1025B）狀態寫「延遲抵達」（原本寫「時間更改」）
RW('st29 front label',"    var m=ST20[s];if(m){m=m.slice();","    var m=ST20[s];if(s==='Time Change'&&ov&&ov.warDelayR1025B)m=['延遲抵達','Late arrival','warn'];   /* 1101B */\n    if(m){m=m.slice();")

# R2-C：48 小時延遲抵達通知（geo26 job）的新抵達時間改用 predict7 的預估抵達（繞道＋當天高空風／天候），跟航班資料 EST、後台航班狀態同一個數字（原本只加繞道分鐘 → 前台 19:35、EST 19:44 兩個數字）
RW('war29 job',"var w=window.kgmWarDelayR1025B(f,d);if(!w||w.min<15)return;",
   "var w=window.kgmWarDelayR1025B(f,d);if(!w||w.min<15)return;var pr29=null;try{pr29=window.kgmOpsPredR1026C?window.kgmOpsPredR1026C(f,d):null}catch(_){}if(pr29&&pr29.arrDelta!=null){if(pr29.arrDelta<15)return;w=Object.assign({},w,{min:pr29.arrDelta,routeMinR1101B:w.min})}   /* 1101B：晚幾分＝預測（EST）的抵達差 */")

# ══ 1102A ══
# B：航班預估（predict7）——使用者：「出發時間 EST 一定要是原本的出發時間不能提早或延後，除非人工調整；人工調整了出發時間，延後時間系統會自動調整根據該日飛行狀況，auto fill in 但人工也要可以調整」
#    ① 出發 EST＝班表出發（拿掉每班每天亂數 −4～+15 分）；② 人工改了出發（航班狀態頁 New Dep）→ 抵達＝新出發＋當天預估飛行時間（高空風、繞道、目的地天候），人工填了抵達就用人工的
RW('est30 dep',"dep=(H(k+'DEP')%13)-4+a.impact,","dep=0,   /* 1102A：出發 EST＝班表出發（只有人工改才動） */")
RW('est30 manual',"if(ov27.dep&&ov27.status==='Delayed'){p.estDep=ov27.dep;if(ov27.arr)p.estArr=ov27.arr;p.depDelta=mins(ov27.dep)+(+ov27.depDD||0)*1440-mins(f.dep)}",
   "if(ov27.dep&&ov27.status!=='Cancelled'){var md30=mins(ov27.dep)+(+ov27.depDD||0)*1440-mins(f.dep);if(md30){p.estDep=ov27.dep;p.depDelta=md30;p.arrDelta+=md30;p.estArr=clock(mins(f.arr)+p.arrDelta)}   /* 1102A：人工改出發 → 抵達跟著移（加當天飛行狀況） */\n        if(ov27.arr&&!ov27.warDelayR1025B){var ad30=mins(ov27.arr)-mins(f.arr);if(ad30>720)ad30-=1440;if(ad30<-720)ad30+=1440;p.estArr=ov27.arr;p.arrDelta=ad30}}   /* 人工填的抵達優先 */")
# 前台航班動態（fb20b info20）：起飛前 48 小時內（到落地後一天）把預估抵達發佈出去；狀態寫延遲抵達／提早抵達
RW('est30 front',"dd2=addDays(d,dOff);\n    var sk=aoff20(f,d,f.dep,f.arr),",
   "dd2=addDays(d,dOff);\n    var pe30=null;try{if(!ov.arr&&!f.partner&&!f.divertContR1101A&&window.kgmOpsPredR1026C){var h30=(utc20(d,f.dep,f.fr)-Date.now())/36e5;if(h30<=168&&h30>-30){   /* 1103A：48 小時→7 天（後台看得到 EST 的都發佈） */ var pp30=window.kgmOpsPredR1026C(f,d);if(pp30&&pp30.estArr){pe30=pp30;if(pp30.estDep&&!ov.dep)dep=pp30.estDep;arr=pp30.estArr}}}}catch(_){}   /* 1102A：航班資料的預估（EST）發佈到旅客航班動態（起飛前 48 小時起） */\n    var sk=aoff20(f,d,f.dep,f.arr),")
RW('est30 front st',"ty:ty,st:st20(f,d,ov,depEp),can:can};",
   "ty:ty,st:(function(s){if(pe30&&!ov.status&&s&&/^(ok|warn)$/.test(s[2])){if(pe30.arrDelta>=5)return ['預計延遲 '+pe30.arrDelta+' 分抵達','Late arrival +'+pe30.arrDelta+' min','warn'];if(pe30.arrDelta<=-5)return ['預計提早 '+(-pe30.arrDelta)+' 分抵達','Early arrival '+(-pe30.arrDelta)+' min','ok']}return s}   /* 1103A：差 5 分以上就寫（使用者：後台寫早 10 分，前台也要改） */)(st20(f,d,ov,depEp)),can:can,estR1102A:!!pe30};")
# 後台航班狀態編輯：改出發 → 抵達自動帶入（當天預估飛行時間），可以再改
RW('est30 form',"<input id=\"adNewDep\" class=\"inp\" placeholder=\"HH:MM\" value=\"${(S.flightOverrides?.[editKey]||{}).dep||\"\"}\"></div>",
   "<input id=\"adNewDep\" class=\"inp\" placeholder=\"HH:MM\" value=\"${(S.flightOverrides?.[editKey]||{}).dep||\"\"}\" oninput=\"window.kgmEstFillR1102A&&kgmEstFillR1102A()\"><small style=\"display:block;font-size:10.5px;color:var(--sub);margin-top:2px\">${LANG===\"en\"?\"Arrival fills in from today's flying conditions; you can still edit it\":\"填出發後，抵達依當天飛行狀況自動帶入，可再修改\"}</small></div>")

# L：機隊排班頁——整年重排還沒做完時，「無機可派」清單是半成品（使用者截圖：12/2 起 227 段 B78X，等系統跑完就沒了）→ 重排完成前改寫「重排中」不列清單
RW('cov30 wait',"dow.KGM_COVER_CACHE_R914,v=c&&c.v;if(!v||(!v.missing&&!v.notPlanned))return '';",
   "dow.KGM_COVER_CACHE_R914,v=c&&c.v;if(!v||(!v.missing&&!v.notPlanned))return '';\n    if(!window.KGM_FULLDONE_1006A)return '<div class=\"k72-miss1008B\" style=\"margin-top:10px;padding:12px 14px;border:1px solid #e6dcc4;border-radius:12px;background:#fffbf2;font-size:12.5px;color:#6b5320\">'+((typeof LANG==='undefined'||LANG!=='en')?'整年機隊重排中（開頁後約 1 分鐘）：現在看到的是開頁前 60 天的初排，「無機可派」要等重排做完才準，完成後自動更新。':'Full-year fleet replan in progress (about a minute after opening); the unassigned list is shown once it finishes.')+'</div>';   /* 1102A */")

# B2：航班狀態編輯面板開著（S.adEditKey）時，背景排班跑完不要整頁重畫（會把還沒存的出發／抵達欄位洗掉）；其他分頁重畫也改走 kgmSafeRenderR1026C（正在輸入就延後）
RW('est30 norender',"if(!_t||SCHEDTABS_R920F.indexOf(_t)>=0)render();",
   "if((!_t||SCHEDTABS_R920F.indexOf(_t)>=0)&&!(_t==='status'&&S.adEditKey))(window.kgmSafeRenderR1026C||render)();   /* 1102A */")

# C：後台側欄「訂位與客服」加「寵物同行」分頁（pets30；頁面在 cs28.js kgmPetDeskPageR1102A）——使用者：「圖二那裡要多寵物喔」
RW('pet30 side',"['groups23','團體訂位'],['cases0831B','案件處理中心']","['groups23','團體訂位'],['pets30','寵物同行'],['cases0831B','案件處理中心']",2)
RW('pet30 body',"else if(tab==='groups23')body=","else if(tab==='pets30')body=(typeof window.kgmPetDeskPageR1102A==='function'?window.kgmPetDeskPageR1102A():'');   /* 1102A：寵物同行 */else if(tab==='groups23')body=")
RW('pet30 perm',"bookings:'use',groups23:'use',","bookings:'use',groups23:'use',pets30:'use',")
RW('pet30 perm svc',"service:{cardverify:'use',groups23:'use',","service:{cardverify:'use',groups23:'use',pets30:'use',")
RW('pet30 role',"if(r==='service')return ['bookings','groups23','cases0831B',","if(r==='service')return ['bookings','groups23','pets30','cases0831B',")
RW('pet30 role gnd',"if(r==='ground')return ['flightdata','groundops','groundroster12','mgr12','bookings','cases0831B',","if(r==='ground')return ['flightdata','groundops','groundroster12','mgr12','bookings','pets30','cases0831B',")
RW('pet30 order',"var ORDER7=['status','flightdata','groundops','bookings','groups23',","var ORDER7=['status','flightdata','groundops','bookings','groups23','pets30',")

# E：我的行程（r60 listPage60）——使用者：「我的行程還是不好看線要統一對齊，然後只列出有查詢過的行程和自己的行程」「圖五怎麼兒童不算旅客」
#   ① 清單來源：原本「沒有 userId 的訂位全部算自己的」→ 組員 DH 訂位（877 筆）全部混進來；改成只列自己的（userId）＋登入後用訂位代號查過的（S.tripLookR1102A，存 kgm30_triplook）
#   ② 卡片改成固定欄寬的格線（勾勾／訂位代號／航線／出發／旅客／狀態），分隔線與各欄每一列對齊；旅客寫總數＋成人／兒童／嬰兒
RW('trip30 mine',"  return all.filter(function(b){return !b.userId||b.userId===S.user.id});",
   "  var lk30=((S.tripLookR1102A||{})[S.user.id])||[];return all.filter(function(b){return b.userId===S.user.id||lk30.indexOf(b.pnr)>=0});   /* 1102A：只列自己的＋查詢過的（組員 DH 等沒有會員的訂位不算） */")
RW('trip30 S init','paxCapAdjR1026C:LS.get("kgm27_paxcap",[]),','paxCapAdjR1026C:LS.get("kgm27_paxcap",[]),tripLookR1102A:LS.get("kgm30_triplook",{}),cardXferR1103A:LS.get("kgm31_xfer",[]),cardPostR1103A:LS.get("kgm31_cpost",{}),')   # 1103A：KGM Cards 機場接送、帳單入帳紀錄（kc31.js）
RW('trip30 save','LS.set("kgm27_paxcap",S.paxCapAdjR1026C||[]);','LS.set("kgm27_paxcap",S.paxCapAdjR1026C||[]);LS.set("kgm30_triplook",S.tripLookR1102A||{});LS.set("kgm31_xfer",S.cardXferR1103A||[]);LS.set("kgm31_cpost",S.cardPostR1103A||{});')
RW('trip30 card',"""    var pax=(b.paxList||[]).length||1;""",
   """    var pl30=b.paxList||[],pax=pl30.length||1,pc30={ADT:0,CHD:0,INF:0};pl30.forEach(function(p){var t=String(p.passengerType||'ADT').toUpperCase();pc30[pc30[t]!=null?t:'ADT']++});   /* 1102A：旅客＝成人＋兒童＋嬰兒 */
    var pxs30=[pc30.ADT?(z()?'成人 ':'Adult ')+pc30.ADT:'',pc30.CHD?(z()?'兒童 ':'Child ')+pc30.CHD:'',pc30.INF?(z()?'嬰兒 ':'Infant ')+pc30.INF:''].filter(Boolean).join(z()?'・':' · ');
    var dt30=String(firstDate(b)||''),wk30='';try{wk30=dt30?'日一二三四五六'.charAt(new Date(dt30+'T00:00:00Z').getUTCDay()):''}catch(_){}""")
RW('trip30 card body',"""      +'<span class="k60-trip-main"><b>'+E(route)+'</b>'
        +'<small>'+E(firstDate(b))+'　·　'+E(ss.map(function(s){return (s.f||s).code}).join(' / '))
        +'　·　'+pax+(z()?' 位乘客':' pax')+'</small>'
        +'<em>'+(cancelled?(z()?'已取消':'Cancelled'):E(window.kgmStaffStatusR1006A(b)||(z()?'已確認':'Confirmed')))+'　·　'+E(String(ss.length))+(z()?' 個航段':' sector(s)')+'</em></span>'""",
   """      +'<span class="k60-trip-main"><b>'+E(route)+'</b><small>'+E(ss.map(function(s){return (s.f||s).code}).join(' / '))+'　·　'+E(String(ss.length))+(z()?' 個航段':' sector(s)')+'</small></span>'
      +'<span class="k30-tc"><small>'+(z()?'出發':'Departs')+'</small><b>'+E(dt30.slice(5).replace('-','/'))+(z()&&wk30?'（'+wk30+'）':'')+'</b><i>'+E(dt30.slice(0,4))+'</i></span>'
      +'<span class="k30-tc"><small>'+(z()?'旅客':'Passengers')+'</small><b>'+pax+(z()?' 位':'')+'</b><i>'+E(pxs30)+'</i></span>'
      +'<span class="k30-tst"><em>'+(cancelled?(z()?'已取消':'Cancelled'):E(window.kgmStaffStatusR1006A(b)||(z()?'已確認':'Confirmed')))+'</em></span>'""")
# （說明文字：改在上面 1101A 的 trip28 intro 那一條，gen 的比對基準是 1027A 原檔）

# F：航班資料路線圖——使用者：「航班資料路線圖不太可能是直的吧 也不可能每天都一樣吧」
#   原本沒有繞道的航線畫大圓（地圖以航線中點為中心的正射投影，大圓剛好是一條直線），而且每天同一條。
#   改成每天依高空風選的航路（flex track）：東向順著噴射氣流、西向避開，偏離大圓的距離與方向依日期＋航線決定（同一天前後台看到同一條）；
#   經過關閉空域就縮小偏移、仍碰到就退回大圓；有繞道（A* 避戰航路）的照舊畫繞道。大圓改成虛線當參考。kgmFlexTrackR1102A(fr,to,date)＝航點與里程。
RW('map30 flex fn',"  function render(o){\n    load();",
   """  /* 1102A：每天的風選航路（flex track） */
  function flex30(A,B,d,fr,to){var D=hav(A,B);if(D<250||!d)return null;var h=2166136261,s=fr+'>'+to+'|'+d;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}
    var r1=(h%997)/997,r2=((h>>>11)%991)/991,r3=((h>>>21)%983)/983,ua=unit(A),ub=unit(B),n=[ua[1]*ub[2]-ua[2]*ub[1],ua[2]*ub[0]-ua[0]*ub[2],ua[0]*ub[1]-ua[1]*ub[0]],nl=Math.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2])||1;n=[n[0]/nl,n[1]/nl,n[2]/nl];
    var mid=gcPts(A,B,D/2)[1]||A,ml=mid[0],east=(((B[1]-A[1])%360)+540)%360-180>0,pole=ml>=0?1:-1,jet=Math.abs(ml)>38?-pole:pole,side=(east?jet:-jet);   /* 東向：往噴射氣流（中緯度 30–40 度）；西向：避開 */
    if(r3<0.18)side=-side;   /* 有些天風場不同，反過來 */
    var amp=Math.min(D<1500?90:650,D*(0.018+0.05*r1))*(r3<0.18?0.55:1),sgn=(n[2]>=0?1:-1)*side,sk=0.6+0.8*r2;
    function mk(a){var g=gcPts(A,B,30),N=g.length-1;return g.map(function(p,i){var t=i/N,off=a*Math.pow(Math.sin(Math.PI*t),sk)*sgn/6371,u=unit(p),c=Math.cos(off),sn=Math.sin(off),x=u[0]*c+n[0]*sn,y=u[1]*c+n[1]*sn,q=u[2]*c+n[2]*sn;return [deg(Math.atan2(q,Math.sqrt(x*x+y*y))),deg(Math.atan2(y,x))]})}
    for(var k=0;k<3;k++){var a=amp*[1,0.5,0.25][k],pts=mk(a),bad=false;for(var j=1;j<pts.length-1&&!bad;j++)if(cellZone(pts[j][0],pts[j][1],A,B))bad=true;
      if(!bad){var km=0;for(var j2=0;j2<pts.length-1;j2++)km+=hav(pts[j2],pts[j2+1]);return {pts:pts,km:Math.round(km),d0:Math.round(D),off:Math.round(a)}}}
    return null}
  window.kgmFlexTrackR1102A=function(fr,to,d){try{load();var A=geo(fr),B=geo(to);if(!A||!B||window.kgmWarRouteR1025B(fr,to))return null;return flex30(A,B,d,fr,to)}catch(_){return null}};
  function render(o){
    load();""")
RW('map30 flex act',"var war=window.kgmWarRouteR1025B(o.fr,o.to),direct=gcPts(A,B,30),act=war?poly([A].concat(war.wp,[B]),30):direct;",
   "var war=window.kgmWarRouteR1025B(o.fr,o.to),direct=gcPts(A,B,30),fx30=war?null:flex30(A,B,o.date,o.fr,o.to),act=war?poly([A].concat(war.wp,[B]),30):(fx30?fx30.pts:direct);   /* 1102A：沒有繞道 → 當天的風選航路 */")
RW('map30 flex dash',"    if(war){ctx.beginPath();lines(ctx,P,direct);ctx.setLineDash([7*px,6*px]);",
   "    if(war||fx30){ctx.beginPath();lines(ctx,P,direct);ctx.setLineDash([7*px,6*px]);")
RW('map30 flex key',"    var key=[f.fr,f.to,W,H,dpr,z()?'z':'e',prog!=null?Math.round(prog*40):'-',sig()].join('|');",
   "    var key=[f.fr,f.to,date||'',W,H,dpr,z()?'z':'e',prog!=null?Math.round(prog*40):'-',sig()].join('|');   /* 1102A：每天航路不同 */")
RW('map30 flex date',"var u=render({w:Math.round(W*dpr),h:Math.round(H*dpr),fr:f.fr,to:f.to,",
   "var u=render({date:date,w:Math.round(W*dpr),h:Math.round(H*dpr),fr:f.fr,to:f.to,")
RW('map30 flex legend',"    if(w){h+='<span class=\"lg gc\">'",
   "    var fx30=w?null:window.kgmFlexTrackR1102A(f.fr,f.to,date);if(fx30)h+='<span class=\"lg gc\">'+(z()?'大圓直飛（參考）':'Great circle (reference)')+'</span>';\n    if(w){h+='<span class=\"lg gc\">'")
RW('map30 flex info',"      :(z()?'航路不經過關閉空域，照大圓航線飛行':'Track does not cross closed airspace');",
   "      :(fx30?(z()?('今天依高空風選的航路（每天不同）：最遠偏離大圓約 '+fx30.off+' 公里，航路比大圓多 '+Math.max(0,fx30.km-fx30.d0)+' 公里；不經過關閉空域'):('Today\\'s wind-optimised track, up to '+fx30.off+' km off the great circle (+'+Math.max(0,fx30.km-fx30.d0)+' km)')):(z()?'航路不經過關閉空域，照大圓航線飛行':'Track does not cross closed airspace'));")

RW('map30 flex ret',"    return {legend:h,info:info,war:w,delay:wd,cap:pc}};","    return {legend:h,info:info,war:w,delay:wd,cap:pc,fx:fx30}};")
RW('map30 flex head',"(z()?'這條航線不經過關閉空域，照大圓航線飛。':'This route does not cross closed airspace.')",
   "(L.fx?(z()?'這條航線不經過關閉空域；金色線是今天依高空風選的航路（每天不同），白色虛線是大圓直飛參考。':'No closed airspace on this route; gold = today\\'s wind-optimised track, dashed = great circle.'):(z()?'這條航線不經過關閉空域，照大圓航線飛。':'This route does not cross closed airspace.'))")
RW('map30 flex dist',"<div class=\"r7-route-legend\"><div><small>DISTANCE</small><b>'+d.toLocaleString()+' km</b></div>",
   "<div class=\"r7-route-legend\"><div><small>DISTANCE</small><b>'+(function(){try{var x30=window.kgmFlexTrackR1102A&&window.kgmFlexTrackR1102A(f.fr,f.to,date);if(x30)return (d+Math.max(0,x30.km-x30.d0)).toLocaleString()}catch(_){}return d.toLocaleString()})()+' km</b></div>")   # 1102A：今天的航路長度＝原本的距離＋今天航路比大圓多的公里數（跟路線圖說明同一個數）

# K：我的團體訂位——包機／自創航班卡片的「CHR… · 自創航班 · TPE→PHX 2027-07-29 · 192 位」一行字改成對齊的資訊格（案件／類型／航段＋城市／日期＋星期／人數）；報價區塊在 cr28.js
RW('grp30 facts',"'</div><div class=\"k27cr-m\">'+E(r.id)+' · '+kindName(r.kind)+' · '+E(r.fr)+'→'+E(r.to)+' '+E(r.date)+(r.retDate?(z()?'，回程 ':' · return ')+E(r.retDate):'')+' · '+r.pax+(z()?' 位':' pax')+'</div>'",
   "'</div>'+(function(){var cy=function(a){try{return (z()?CITY_ZH:(typeof CITY_EN!=='undefined'?CITY_EN:CITY_ZH))[a]||a}catch(_){return a}},wk=function(d){try{return z()?'（'+'日一二三四五六'.charAt(new Date(d+'T00:00:00Z').getUTCDay())+'）':''}catch(_){return ''}};   /* 1102A：資訊格 */\n"
   "      return '<div class=\"k30cr-facts\"><div><small>'+(z()?'申請編號':'Request')+'</small><b class=\"mono\">'+E(r.id)+'</b></div><div><small>'+(z()?'類型':'Type')+'</small><b>'+kindName(r.kind)+'</b></div><div><small>'+(z()?'航段':'Route')+'</small><b>'+E(r.fr)+' → '+E(r.to)+'</b><i>'+E(cy(r.fr))+' → '+E(cy(r.to))+'</i></div><div><small>'+(z()?'去程日期':'Date')+'</small><b>'+E(r.date)+wk(r.date)+'</b>'+(r.retDate?'<i>'+(z()?'回程 ':'Return ')+E(r.retDate)+wk(r.retDate)+'</i>':'')+'</div><div><small>'+(z()?'旅客':'Pax')+'</small><b>'+(r.paxRet&&r.paxRet!==r.pax?r.pax+'／'+r.paxRet:r.pax)+(z()?' 位':'')+'</b>'+(r.paxRet&&r.paxRet!==r.pax?'<i>'+(z()?'去程／回程':'out / return')+'</i>':'')+'</div></div>'})()")   # 1103A：去回程人數不同

# I：員工票——使用者：「員工票如果原本艙等沒辦法上次等可以要自動發出通知改成次等然後+/-差價在薪資裡面喔」
#   原本起飛前 48 小時定案只試首選、次選，兩個都沒位就一直候補到機場。改成：都沒位就自動往下一個艙等找（商務→豪經→經濟），
#   報價依該航段原本的員工票價比例換算（跟首選／次選同一套份額），價差照原本的方式進薪資（降艙＝退回、正數），並發通知「原艙等沒有空位，已改為○○艙」。
#   人工在定位管理指定艙等（choices）時不自動降艙。
RW('stx30 down fn',"function settleStaffCabins0911(b,choices,opts){",
   "/* 1102A：首選、次選都沒位 → 自動降到下一個有位的艙等 */\n"
   "var CAB30=['First','Business','Premium','Economy'];\n"
   "function pub30(f,cab){var L=[];try{Object.keys(FARES).forEach(function(c){if((FARES[c]||{}).cabin!==cab)return;try{var q=+owPrice(f,c,1);if(isFinite(q)&&q>0)L.push(q)}catch(_){}})}catch(_){}return L.length?Math.min.apply(null,L):0}\n"
   "function stxDown1102A(b,entry,s,need,prefs){try{var low=Math.max.apply(null,prefs.map(function(c){return CAB30.indexOf(c)}));if(low<0)return null;var paid=entry.paidCabin||prefs[0];\n"
   "  for(var k=low+1;k<CAB30.length;k++){var cab=CAB30[k],inv=window.kgmCabinInventory54(s.f,s.date,cab,b.pnr);if(!inv||inv.left<need||!(inv.capacity>0))continue;\n"
   "    var code=Object.keys(FARES).find(function(x){return /^[EPBF]-/.test(x)&&FARES[x].cabin===cab});if(!code)continue;\n"
   "    var f0=pub30(s.f,paid),f1=pub30(s.f,cab),zed=String(((b.stx||b.staffTix||{}).plan)||'').toUpperCase()==='ZED',rt=zed?1:(f0>0?f1/f0:0);if(!(rt>0))continue;   /* 員工票價＝公告價 × 方案比例 → 用兩艙公告價的比例換算（ZED 不分艙等） */\n"
   "    var q=Math.round(Number(entry.cabinQuotes[paid]||0)*rt),tx=Math.round(Number((entry.cabinTaxes||{})[paid]||0)*rt);\n"
   "    entry.cabinQuotes[cab]=q;entry.cabinTaxes=entry.cabinTaxes||{};entry.cabinTaxes[cab]=tx;entry.downgradedR1102A={from:prefs[prefs.length-1],paid:paid,to:cab,at:new Date().toISOString()};\n"
   "    return {entry:entry,segment:s,cabin:cab,code:code,seats:inv.seats.slice(0,need),physical:inv.segments||null,diff:Math.round(q-Number(entry.cabinQuotes[paid]||0)+tx-Number((entry.cabinTaxes||{})[paid]||0))}}}catch(_){}return null}\n"
   "function settleStaffCabins0911(b,choices,opts){")
RW('stx30 down use',"if(!chosen){failure.push({key:entry.key,code:entry.code,date:entry.date});",
   "if(!chosen&&!requested)chosen=stxDown1102A(b,entry,s,need,prefs);   /* 1102A：自動降艙 */\n    if(!chosen){failure.push({key:entry.key,code:entry.code,date:entry.date});")
RW('stx30 down notif',"if(r.ok&&r.changed){done++;_pushBkNotif(b,'員工票艙等已確認：'+due.filter(function(x){return x.assignedCabin}).map(function(x){return x.code+' '+x.assignedCabin}).join('、')+'。艙等價差已登錄薪資。');",
   "if(r.ok&&r.changed){done++;var dn30=due.filter(function(x){return x.assignedCabin&&x.downgradedR1102A&&x.downgradedR1102A.to===x.assignedCabin});var CZ30={First:'頭等艙',Business:'商務艙',Premium:'豪華經濟艙',Economy:'經濟艙'};\n"
   "      _pushBkNotif(b,'員工票艙等已確認：'+due.filter(function(x){return x.assignedCabin}).map(function(x){return x.code+' '+x.assignedCabin}).join('、')+'。艙等價差已登錄薪資。'+(dn30.length?'（'+dn30.map(function(x){var d=-(+x.payrollAdjustment||0);return x.code+' 原艙等沒有空位，已自動改為'+(CZ30[x.assignedCabin]||x.assignedCabin)+'，價差 NT$'+Math.abs(d).toLocaleString()+(d>=0?' 退回薪資':' 由薪資扣除')}).join('；')+'）':''));   /* 1102A */\n"
   "      try{if(dn30.length&&typeof notifyStaff==='function')notifyStaff((b.stx||b.staffTix||{}).empId,'員工票自動改艙（'+b.pnr+'）：'+dn30.map(function(x){var d=-(+x.payrollAdjustment||0);return x.code+' '+x.date+' '+(CZ30[x.downgradedR1102A.paid]||x.downgradedR1102A.paid)+' 沒有空位 → '+(CZ30[x.assignedCabin]||x.assignedCabin)+'，薪資 '+(d>=0?'+':'−')+'NT$'+Math.abs(d).toLocaleString()}).join('；'))}catch(_){}")

RW('stx30 down mail',"      +(anySecond?'\\n部分旅客以「次選艙等」成行，價差已登錄薪資（多退少補）。':'')",
   "      +((due||[]).some(function(e){return e&&e.downgradedR1102A&&e.downgradedR1102A.to===e.assignedCabin})?'\\n首選與次選艙等都沒有空位，已自動改為下一個有空位的艙等，價差已登錄薪資（多退少補）。':(anySecond?'\\n部分旅客以「次選艙等」成行，價差已登錄薪資（多退少補）。':''))")   # 1102A

# 測員工票時順便查到的兩個舊問題（都在這輪有動到的功能上）：
#   ① 員工票候補結果信的「薪資調整合計」讀不存在的欄位（payrollDiff／diff），從來不顯示 → 改讀 payrollAdjustment（正數＝退回薪資）
#   ② Residence 里程出價沒有選備選方案時，未得標通知寫「（未得標處理：undefined）」
RW('stx30 mail payroll',"var diff=+e.payrollDiff||+e.diff||0;payroll+=diff;","var diff=+e.payrollDiff||+e.diff||(e.payrollAdjustment!=null?-(+e.payrollAdjustment||0):0);payroll+=diff;   /* 1102A：原本欄位不存在，合計永遠不顯示 */")
RW('res30 fbname',"function fbName(k){var a=FALLBACK_R161.filter(function(x){return x.k===k})[0];return a?(z()?a.zh:a.en):k}",
   "function fbName(k){var a=FALLBACK_R161.filter(function(x){return x.k===k})[0];return a?(z()?a.zh:a.en):(k&&k!=='none'?k:(z()?'沒有選擇備選方案':'no fallback chosen'))}   /* 1102A：原本寫 undefined */")

# H1：曼谷組員 DH 可搭聯盟航空（使用者：「曼谷組員 DH 聯盟航空」）——曼谷基地組員找不到 KGM 直飛（只剩經台北轉、或完全沒有）時，
#   改找寰宇一家夥伴營運的班次（直飛，或夥伴＋夥伴／KGM 一次轉機、轉機 ≥ 90 分），一樣是落地後 60 分鐘以上才報到、36 小時內最晚落地的那一班。
#   班表寫 KGM 共掛班號＋（營運航空 班號），例：KX9843（Cathay Pacific CX750）。實測 64 天曼谷組員 365 段 DH 全部有 KGM 直飛，這條規則只在 KGM 那班沒飛時才用到。
RW('dh30 alliance',"  var rf1004B=(typeof nextDepUTC==='number'&&isFinite(nextDepUTC))?realDhR1004B(fr,to,date,nextDepUTC):null;",
   "  var rf1004B=(typeof nextDepUTC==='number'&&isFinite(nextDepUTC))?realDhR1004B(fr,to,date,nextDepUTC):null;\n"
   "  try{if(typeof nextDepUTC==='number'&&isFinite(nextDepUTC)&&(!rf1004B||rf1004B.viaR1004B==='TPE')&&window.kgmBkkCrewR1102A&&window.kgmBkkCrewR1102A(empId)){var al30=window.kgmAllianceDhR1102A(fr,to,date,nextDepUTC);if(al30){rf1004B=al30;window.KGM_DH_ALLIANCE_N_R1102A=(window.KGM_DH_ALLIANCE_N_R1102A||0)+1}}}catch(_){}   /* 1102A：曼谷組員可搭聯盟航空 */")
RW('dh30 alliance fn',"window.kgmRealDhR1004B=realDhR1004B;",
   "window.kgmRealDhR1004B=realDhR1004B;\n"
   "/* 1102A：曼谷基地組員（kgmCrewPoolR121 的 base）＋聯盟航空（夥伴營運、oneworld）調位班次 */\n"
   "var BKK30=null;window.kgmBkkCrewR1102A=function(id){try{if(!BKK30){BKK30={};var P=window.kgmCrewPoolR121?window.kgmCrewPoolR121():null;(function w(x,dp){if(dp>3||!x)return;if(Array.isArray(x)){x.forEach(function(c){if(c&&c.empId){if(c.base==='BKK')BKK30[c.empId]=1}else w(c,dp+1)})}else if(typeof x==='object')Object.keys(x).forEach(function(k){w(x[k],dp+1)})})(P,0);setTimeout(function(){BKK30=null},600000)}return !!BKK30[id]}catch(_){return false}};\n"
   "window.kgmAllianceDhR1102A=function(fr,to,date,nextDepUTC){var best=null,WIN=36*60;function tz(ap){try{if(typeof TZ!=='undefined'&&TZ[ap]!=null)return +TZ[ap]}catch(_){}return 8}\n"
   "  var pool=[];[D(date,-1),date].forEach(function(fd){(FLIGHTS||[]).forEach(function(f){if(!f||!(f.partner||f.operator)||f.oneworld===false||!/^\\d\\d:\\d\\d$/.test(String(f.dep||''))||!/^\\d\\d:\\d\\d$/.test(String(f.arr||'')))return;var ok=false;try{ok=flyOn(f,new Date(fd+'T12:00:00'))}catch(_){}if(!ok)return;\n"
   "    var dep=Date.parse(fd+'T'+f.dep+':00Z')/60000-tz(f.fr)*60,arr=Date.parse(D(fd,+f.dd||0)+'T'+f.arr+':00Z')/60000-tz(f.to)*60;pool.push({f:f,fd:fd,dep:dep,arr:arr,p:1})})});\n"
   "  var kgm=[];[D(date,-1),date].forEach(function(fd){var fs=[];try{fs=(window.kgmFlightsOnR121?window.kgmFlightsOnR121(fd):[])||[]}catch(_){}fs.forEach(function(f){if(f&&!f.partner&&/^\\d\\d:\\d\\d$/.test(String(f.dep||''))&&/^\\d\\d:\\d\\d$/.test(String(f.arr||''))){var dep=Date.parse(fd+'T'+f.dep+':00Z')/60000-tz(f.fr)*60,arr=Date.parse(D(fd,+f.dd||0)+'T'+f.arr+':00Z')/60000-tz(f.to)*60;kgm.push({f:f,fd:fd,dep:dep,arr:arr,p:0})}})});\n"
   "  function nm(x){return x.p?((x.f.operator||'')+' '+(x.f.operatorFlight||'')).trim():''}\n"
   "  function take(c){if(c.arrUTC>nextDepUTC-60||c.arrUTC<nextDepUTC-WIN)return;if(!best||c.arrUTC>best.arrUTC)best=c}\n"
   "  pool.forEach(function(a){if(a.f.fr!==fr)return;if(a.f.to===to){take({code:a.f.code,date:a.fd,dep:a.f.dep,arr:a.f.arr,dd:+a.f.dd||0,depUTC:a.dep,arrUTC:a.arr,op:nm(a),allianceR1102A:true,legs:[{d:a.fd,fr:fr,to:to,code:a.f.code,op:nm(a)}]});return}\n"
   "    pool.concat(kgm).forEach(function(b){if(b.f.fr!==a.f.to||b.f.to!==to||b.dep<a.arr+90||b.dep>a.arr+12*60)return;var dd=Math.round((Date.parse(new Date((b.arr+tz(to)*60)*60000).toISOString().slice(0,10))-Date.parse(a.fd))/86400000);\n"
   "      take({code:a.f.code+'/'+b.f.code,date:a.fd,dep:a.f.dep,arr:b.f.arr,dd:dd,depUTC:a.dep,arrUTC:b.arr,op:[nm(a),nm(b)].filter(Boolean).join('／'),viaR1004B:a.f.to,allianceR1102A:true,legs:[{d:a.fd,fr:fr,to:a.f.to,code:a.f.code,op:nm(a)},{d:b.fd,fr:b.f.fr,to:to,code:b.f.code,op:nm(b)}]})})});\n"
   "  kgm.forEach(function(a){if(a.f.fr!==fr)return;pool.forEach(function(b){if(b.f.fr!==a.f.to||b.f.to!==to||b.dep<a.arr+90||b.dep>a.arr+12*60)return;var dd=Math.round((Date.parse(new Date((b.arr+tz(to)*60)*60000).toISOString().slice(0,10))-Date.parse(a.fd))/86400000);\n"
   "      take({code:a.f.code+'/'+b.f.code,date:a.fd,dep:a.f.dep,arr:b.f.arr,dd:dd,depUTC:a.dep,arrUTC:b.arr,op:nm(b),viaR1004B:a.f.to,allianceR1102A:true,legs:[{d:a.fd,fr:fr,to:a.f.to,code:a.f.code},{d:b.fd,fr:b.f.fr,to:to,code:b.f.code,op:nm(b)}]})})});\n"
   "  return best};")

# H2：空機調派寫進排班——換機身存檔時，選的那架要從 TPE 空機過去 → 空機段寫進換機身紀錄（ferryR1102A），applyPick 每次套用都放進那架的輪轉；組員在 ad28.js
RW('fy30 calc',"      if(el&&type&&fam(type)===fam(before))el.value='';\n      var r=o.apply(this,arguments),msg='';",
   "      if(el&&type&&fam(type)===fam(before))el.value='';\n      var fy30=null;try{if(k&&f&&tail){fy30=(availTails(type||fam(before),k.code,k.date,f.fr,f.to).filter(function(x){return x.tail===tail})[0]||{}).ferry||null;if(fy30&&!fy30.ok)fy30=null}}catch(_){}   /* 1102A：要空機調派 */\n      var FY30=fy30?{id:k.code+'|'+k.date,to:fy30.to,depAbs:fy30.depAbs,arrAbs:fy30.arrAbs,block:fy30.block,at:new Date().toISOString()}:null;\n      var r=o.apply(this,arguments),msg='';")
RW('fy30 pk',"var pk={code:k.code,date:k.date,tail:tail,legs:specsFor(k.code,k.date,f.fr,f.to,res),at:new Date().toISOString(),by:(S.adminUser||{}).empId||''};",
   "var pk={code:k.code,date:k.date,tail:tail,legs:specsFor(k.code,k.date,f.fr,f.to,res),at:new Date().toISOString(),by:(S.adminUser||{}).empId||'',ferryR1102A:FY30};")
RW('fy30 pk2',"var pk2={code:k.code,date:k.date,tail:tail,legs:specsFor(k.code,k.date,f.fr,f.to,null),at:new Date().toISOString(),by:(S.adminUser||{}).empId||''};",
   "var pk2={code:k.code,date:k.date,tail:tail,legs:specsFor(k.code,k.date,f.fr,f.to,null),at:new Date().toISOString(),by:(S.adminUser||{}).empId||'',ferryR1102A:FY30};")
RW('fy30 apply',"  function applyPick(pk){\n    var got=pk.legs.map(findLeg).filter(Boolean);if(!got.length)return 0;",
   "  function applyPick(pk){\n    try{if(pk&&pk.ferryR1102A&&window.kgmFerryRowR1102A)window.kgmFerryRowR1102A(pk.tail,pk)}catch(_){}   /* 1102A：空機調派段放進那架的輪轉 */\n    if(window.kgmRotMoveR1103A){var r31=window.kgmRotMoveR1103A(pk.legs,pk.tail,{mark:'byR1023A'});if(r31.ok)delete pk.skipR1103A;else pk.skipR1103A=r31.why;return r31.ok?(r31.n||0):0}   /* 1103A：統一規則（rot31.js）：整趟搬、UTC 比時間、接點要接得上；不過就不動 */\n    var got=pk.legs.map(findLeg).filter(Boolean);if(!got.length)return 0;")

# H4：前台第一次搜尋——sortedFlights 的快取上限 180 筆，但一次搜尋（含轉機）會查 ~1,860 個「航線＋日期」→ 查到一半就被清掉、一直重算。
#   上限改 8,000 筆（每筆是那條航線那天的幾個班次，約幾 MB；換季／改時刻照原本的鍵（customFlights、flightDateOverride、flightOverrides 數量）失效）。
RW('srch30 cache',"if(cacheJ.size>180)cacheJ.clear();","if(cacheJ.size>8000)cacheJ.clear();   /* 1102A：原本 180，一次搜尋就超過、一直清掉重算 */")

# R2（使用者：「沒改的就把它改完吧」）前台第一次搜尋：訂票頁七天價格列每一天都查「之後 3 天內出發」的轉機（findConnectionsFull(...,3)），
#   再把兩段都當成那一天報價 → 一次搜尋做 7 次大範圍轉機搜尋（TPE→LAX 約 0.8 秒），而且晚 1～3 天出發的轉機被算成當天的價格。
#   改成只查當天出發（第二段可以隔天，原本的轉機規則），第二段用它自己的日期報價。
# ══ 1103A ══
# J：機隊輪轉統一規則（rot31.js）：機隊排班頁「＋」／換機身／可選機身清單都走 kgmRotMoveR1103A；逐月排班格子依 UTC 真實先後排
RW('rot31 curtail',"function curDate69(){return S._fsDate||T()}","function curDate69(){return S._fsDate||T()}\nwindow.kgmFsTailR1103A=function(){return curTail69()};   /* 1103A：rot31 的「＋」要知道目前選的是哪一架 */")
RW('rot31 cal sort',"    var d=D(start,k),rows=(byDate[d]||[]).map(function(x){return liveRow(x,d)}).sort(function(a,b){\n      return String(a.dep).localeCompare(String(b.dep))});",
   "    var d=D(start,k),rows=(byDate[d]||[]).map(function(x){return liveRow(x,d)}).sort(function(a,b){\n      if(window.kgmRotSpanR1103A)return window.kgmRotSpanR1103A(a)[0]-window.kgmRotSpanR1103A(b)[0];   /* 1103A：依真實（UTC）先後排，不用當地時刻字串 */\n      return String(a.dep).localeCompare(String(b.dep))});")
RW('bg31 crew tick',"setInterval(tick,3000);\n})();\n\nvar MOVE121","setInterval(tick,3000);window.kgmCrewTickR1103A=tick;   /* 1103A：分頁看不見時由 rot31.js 的 Worker 每 3 秒叫一次 */\n})();\n\nvar MOVE121")
# A：自創航班申請（cf31.js）：機型選單依兩端機場／航程／人數重產；去程／回程人數分開，報價每段用那一段的人數
RW('cf31 quote',"if(r.kind==='custom'){var p=seatPrice(f,'Economy');lines.push({cab:'Economy',n:r.pax,p:p});sum=r.pax*p}",
   "if(r.kind==='custom'){var p=seatPrice(f,'Economy'),n31=(r.paxRet&&f&&f.fr===r.to&&f.to===r.fr)?r.paxRet:r.pax;lines.push({cab:'Economy',n:n31,p:p});sum=n31*p}   /* 1103A：回程用回程人數 */")
RW('cf31 admin pax',"<div class=\"k27cd-n\"><b>'+r.pax+'</b><small>'+(z()?'位':'pax')+'</small></div></div>'",
   "<div class=\"k27cd-n\"><b>'+(r.paxRet&&r.paxRet!==r.pax?r.pax+'／'+r.paxRet:r.pax)+'</b><small>'+(r.paxRet&&r.paxRet!==r.pax?(z()?'去／回 位':'out / ret'):(z()?'位':'pax'))+'</small></div></div>'")
EMB28.append('cf31.js')
EMB28.append('ui31.js')
# I：地勤報到——Residence（或模擬名單）旅客的艙等／票價要跟航班資料名單同一份（名單寫 Resident / R，報到卻當成經濟基本 2 件）
RW('ci31 call',"onchange=\"toggleOpsR7(\\''+A(k)+'\\',\\''+A(x.id)+'\\',\\'physical\\',this.checked,\\''+A(x.tier||'Bronze')+'\\')\"",
   "onchange=\"toggleOpsR7(\\''+A(k)+'\\',\\''+A(x.id)+'\\',\\'physical\\',this.checked,\\''+A(x.tier||'Bronze')+'\\',\\''+A(x.cabin||'')+'\\',\\''+A(x.fare||'')+'\\')\"")
RW('ci31 open',"S.checkin49={key:key,id:id,pnr:pnr,code:p[0],date:p[1],fr:p[2],to:p[3],step:1,bags:0,weights:'',extra:0,memberTier:memberTier||'Bronze'};render();return}",
   "S.checkin49={key:key,id:id,pnr:pnr,code:p[0],date:p[1],fr:p[2],to:p[3],step:1,bags:0,weights:'',extra:0,memberTier:memberTier||'Bronze',cabR1103A:String(arguments[5]||''),fareR1103A:String(arguments[6]||'')};render();return}   /* 1103A：帶名單上的艙等／票價 */")
RW('ci31 wiz',"var clsNow=(segNow&&segNow.cls)||(b&&b.outC)||'',famNow=family49(clsNow)||'Basic',cabNow=((FARES[clsNow]||{}).cabin)||cab||'Economy',longNow=false;",
   "var clsNow=((c.fareR1103A&&FARES[c.fareR1103A])?c.fareR1103A:'')||(segNow&&segNow.cls)||(b&&b.outC)||'',famNow=family49(clsNow)||(((FARES[clsNow]||{}).cabin==='Resident')?'':'Basic'),cabNow=((FARES[clsNow]||{}).cabin)||c.cabR1103A||cab||'Economy',longNow=false;   /* 1103A：名單上的艙等優先（Residence 得標、模擬名單） */")
RW('ci31 calc',"var cls=(s&&s.cls)||(b&&b.outC)||'',fam=family49(cls)||'Basic',cab=((FARES[cls]||{}).cabin)||'Economy',isLong=false;",
   "var cls=((c.fareR1103A&&FARES[c.fareR1103A])?c.fareR1103A:'')||(s&&s.cls)||(b&&b.outC)||'',fam=family49(cls)||'Basic',cab=((FARES[cls]||{}).cabin)||c.cabR1103A||'Economy',isLong=false;   /* 1103A：名單上的艙等優先 */",2)
RW('ci31 tier',"/silver|gold|diamond|black/i.test(tier)?1:0","(/diamond|black/i.test(tier)?2:(/silver|gold/i.test(tier)?1:0))   /* 1103A：尊爵卡 +2 件（規章 FFP 表：銀 +1、金 +1、尊爵 +2） */",3)
RW('ci31 print',"+(d.paymentSent?bagSent23(d):'')+'<button class=\"btn btn-g\" onclick=\"S.checkin49=null;render()\">'",
   "+(d.paymentSent?bagSent23(d):'')+(window.kgmCiPrintR1103A?window.kgmCiPrintR1103A(d):'')+'<button class=\"btn btn-g\" onclick=\"S.checkin49=null;render()\">'")   # 1103A：報到完成 → 列印（ci31.js）
RW('ci31 wizexp',"function checkinWizard49(){","window.kgmCiWizHtmlR1103A=function(){return checkinWizard49()};   /* 1103A：報到視窗單獨重畫（ci31.js） */\nfunction checkinWizard49(){")
EMB28.append('ci31.js')
# F：行李改運——還沒報到的旅客不知道每件多重 → 不逐件列，上方寫「未報到 N 位、預估 X 件」；已報到的用櫃檯輸入的實際重量（可以有小數）
RW('bm31 bags',"function bags(f,date,m){var out=[],kg=window.kgmBagKgR1023A||function(){return 20};\n  (m||[]).forEach(function(x){if(!x||x.dhR929)return;var n=(+x.freeBags||0)+(+x.extraBags||0);\n    for(var i=0;i<n;i++){if(window.kgmBagOutR1023A(f.code,date,f.fr,x.id,i))continue;\n      out.push({pid:x.id,i:i,kg:kg(x.id,i),",
   "function bags(f,date,m){var out=[],kg=window.kgmBagKgR1023A||function(){return 20},CK=(S.r49&&S.r49.checkins)||{},k0=f.code+'|'+date+'|'+f.fr+'|'+f.to;bags.pendN=0;bags.pend=0;bags.pendKg=0;\n  (m||[]).forEach(function(x){if(!x||x.dhR929)return;var n=(+x.freeBags||0)+(+x.extraBags||0),ci=CK[k0+'|'+x.id],ws=null;\n    if(ci&&ci.bags!==undefined&&ci.bags!==''){n=+ci.bags||0;ws=String(ci.weights||'').split(/[^0-9.]+/).map(parseFloat).filter(function(v){return isFinite(v)&&v>0})}\n    if(!ci&&!x.physical){if(n){bags.pendN++;bags.pend+=n;for(var j=0;j<n;j++)bags.pendKg+=kg(x.id,j)}return}   /* 1103A：還沒報到 → 不知道每件多重，不逐件列（使用者：「還沒報到怎麼會知道每個人行李重量」） */\n    for(var i=0;i<n;i++){if(window.kgmBagOutR1023A(f.code,date,f.fr,x.id,i))continue;\n      var h31=0;for(var q=0,s31=String(x.id)+'#'+i;q<s31.length;q++)h31=(h31*31+s31.charCodeAt(q))>>>0;\n      out.push({pid:x.id,i:i,kg:(ws&&ws[i]!=null)?Math.round(ws[i]*10)/10:Math.round((kg(x.id,i)-0.5+(h31%10)/10)*10)/10,")   # 已報到：櫃檯輸入的重量；沒輸入（模擬旅客自動報到）就到 0.1 kg
RW('bm31 head',"+'<div><small>'+(z()?'本班托運行李':'Bags on board')+'</small><b>'+L.length+'</b><span>'+N(L.reduce(function(s,b){return s+b.kg},0))+' kg</span></div>'",
   "+'<div><small>'+(z()?'已報到托運行李':'Checked bags')+'</small><b>'+L.length+'</b><span>'+N(Math.round(L.reduce(function(s,b){return s+b.kg},0)*10)/10)+' kg'+(bags.pendN?(z()?'　｜　未報到 '+bags.pendN+' 位，預估 '+bags.pend+' 件約 '+N(Math.round(bags.pendKg))+' kg（報到後才有實際重量，不能改運）':' · '+bags.pendN+' pax not checked in (~'+bags.pend+' bags)'):'')+'</span></div>'")
EMB28.append('rot31.js')

# K：員工票狀態——Payload 只能上 N 人時，各艙燈號／「給員工票的座位」不能還寫座位數（使用者：「你都說可上０人後面為啥還有」）
RW('stx31 cells',"var n=Math.max(0,+((p.after||{})[c])||0),k=lt6(n);tot[k]++;\n      return '<td class=\"k6ss-c\"><span class=\"k6ss-p '+k+'\" title=\"'+ltTxt6(k)+'\"><i></i><b>'+n+'</b><small>'+(z()?'席':'')+'</small></span></td>';",
   "var s31=Math.max(0,+((p.after||{})[c])||0),pc31=p.payload?Math.max(0,Math.floor(Math.max(0,+p.payload.after||0)/(p.payload.kg||107))):Infinity,n=Math.min(s31,pc31),k=lt6(n);tot[k]++;   /* 1103A：Payload 上限（整班共用）也要算進每艙可上人數 */\n      return '<td class=\"k6ss-c\"><span class=\"k6ss-p '+k+'\" title=\"'+ltTxt6(k)+'\"><i></i><b>'+n+'</b><small>'+(z()?'席':'')+'</small></span>'+(n<s31?'<small class=\"k31-plcap\">'+(z()?'空位 '+s31+'・Payload 限 '+pc31+' 人':s31+' seats · payload '+pc31)+'</small>':'')+'</td>';")
RW('stx31 strip',"+'<span><i>'+(z()?'給員工票的座位':'Seats for staff')+'</i><b>'+plan.forStaffTotal+'</b><em>'+(z()?'扣除 ①②':'after ①②')+'</em></span>'",
   "+(function(){var pc=plan.payload?Math.max(0,Math.floor(Math.max(0,+plan.payload.left0||0)/(plan.payload.kg||107))):Infinity,v=Math.min(plan.forStaffTotal,pc);return '<span><i>'+(z()?'給員工票的座位':'Seats for staff')+'</i><b>'+v+'</b><em>'+(v<plan.forStaffTotal?(z()?'空位 '+plan.forStaffTotal+'，Payload 只夠 '+pc+' 人':plan.forStaffTotal+' seats, payload '+pc):(z()?'扣除 ①②':'after ①②'))+'</em></span>'})()")   # 1103A：同上，候補名單頁上方
RW('stx31 wl',"var pl=window.kgmPayloadR1023A(code,date,fr,to);if(!pl)return '';var kg=+window.KGM_STAFF_KG_R1023A||107,n=Math.floor(pl.left/kg);",
   "var pl=window.kgmPayloadR1023A(code,date,fr,to);if(!pl)return '';var kg=+window.KGM_STAFF_KG_R1023A||107,n=Math.max(0,Math.floor(((p&&p.payload&&isFinite(+p.payload.after))?+p.payload.after:pl.left)/kg));   /* 1103A：座位數是扣掉已候補上的員工票後的，Payload 也要扣（同一個基準） */")

RW('stx31 css',"+'.k6ss-c{text-align:center;width:13%}","+'.k31-plcap{display:block;margin-top:4px;font-size:10.5px;line-height:1.3;color:#9b2d17;font-weight:700}.k6ss-c{text-align:center;width:13%}")
# K：超賣／撞位處理（ov31.js，座位圖分頁上方）：航班資料層內部的寫入／通知函式開給它用（不另寫一套）
RW('ov31 kit',"window.kgmFdFilterR929=function(q){S.fdQR929=String(q||'');fdApply929()};",
   "window.kgmFdFilterR929=function(q){S.fdQR929=String(q||'');fdApply929()};\n  window.kgmFdKitR1103A={applyRow:applyRow929,tell:tell929,cabZh:cabZh929,seatsFlat:seatsFlat7,type:type7,fromKey:upgradeFlightFromKey7,fare:curFare929,low:lowFare929,upFare:upgradeFare7};   /* 1103A：ov31.js 超賣處理用 */")
EMB28.append('ov31.js')
# L：KGM Cards（kc31.js）——上排「KGM Cards」只給綁定 KGM Cards 的會員；帳單、哩程回饋、機場接送、權益
RW('kc31 menu','{zh:"哩程補登",en:"Retro Claim",nav:"profile"}]}\n    ]}\n  };',
   '{zh:"哩程補登",en:"Retro Claim",nav:"profile"}]}\n    ]},\n    ...((window.kgmHasCardR1103A&&window.kgmHasCardR1103A())?{cards31:{zh:"KGM Cards",en:"KGM Cards",cols:[   /* 1103A：綁定 KGM Cards 的會員才有（kc31.js） */\n      {zh:"我的卡片",en:"My Card",items:[{zh:"帳單與消費",en:"Statement",nav:"card31"},{zh:"機場接送",en:"Airport Transfer",nav:"card31x"}]},\n      {zh:"卡片權益",en:"Benefits",items:[{zh:"卡別與權益",en:"Card Benefits",nav:"card31p"}]}\n    ]}}:{})\n  };')
EMB28.append('kc31.js')
RW('srch31 inv idx',"var allBookings=S.bookings||[],real=[],known={},fareCounts={},sim=[];\n  allBookings.forEach(function(b){known[b.pnr]=true;",
   "var allBookings=S.bookings||[],real=[],known={},fareCounts={},sim=[];\n  try{var ix31=window.kgmInvIdxR1102A?window.kgmInvIdxR1102A(allBookings):null;if(ix31){known=ix31.known;allBookings=ix31.by[f.code+'|'+f.fr+'|'+f.to+'|'+date]||[]}}catch(_){allBookings=S.bookings||[];known={}}   /* 1102A R2：只看這一班這一天的訂位（同一批建一次索引，gr28 kgmInvIdxR1102A） */\n  allBookings.forEach(function(b){known[b.pnr]=true;")
RW('srch31 strip',"const _cc=findConnectionsFull(fr,to,d,3)||[];","const _cc=findConnectionsFull(fr,to,d,0)||[];   /* 1102A：只查當天出發的轉機（原本 3 天內，又當成當天報價） */")
RW('srch31 strip date',"const g1={...cn.f1,date:d},g2={...cn.f2,date:d};","const g1={...cn.f1,date:d},g2={...cn.f2,date:cn.f2.date||d};   /* 1102A：第二段用自己的日期 */")

# R2-G：IRR-013 Rev. B 增訂第 8 條之一（irr_doc29.py；網站內嵌的條文是 JSON 字串，引號要跳脫）
import irr_doc29
RW('irr29 art',irr_doc29.ANCHOR,irr_doc29.ANCHOR+irr_doc29.ART.replace('"','\\"'))
RW('irr29 ver','"KGM-IRR-013":{"t":"航班異常處理及旅客權益辦法","en":"Irregular Operations and Passenger Rights","ver":"2026.09（Rev. A）","eff":"2026-09-14","owner":"聯合管制中心\u3000會同旅客服務處","arts":16,',
   '"KGM-IRR-013":{"t":"航班異常處理及旅客權益辦法","en":"Irregular Operations and Passenger Rights","ver":"2026.11（Rev. B）","eff":"2026-11-08","owner":"聯合管制中心\u3000會同旅客服務處","arts":17,')

# ══ 新長程式嵌入 ══
_ch27=open('../1026C/js/ch27.js',encoding='utf-8').read()
RW('r28 embed',_ch27,_ch27+''.join(JS(n) for n in EMB28))
open('p_h_r28.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
