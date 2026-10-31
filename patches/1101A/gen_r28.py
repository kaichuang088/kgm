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
   "  function idle(f){var to=(S.view==='admin'&&S.adminTab==='sched')?2500:10000;   /* 1101A：不在組員班表分頁時多等瀏覽器空檔 */\n    if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(f,{timeout:to});else setTimeout(f,60)}\n  function tick(){")
RW('lag28 input',"    if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<2000)return;   /* 使用者正在操作就先讓開",
   "    if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<((S.view==='admin'&&S.adminTab==='sched')?4000:10000))return;   /* 1101A：使用者停手 4 秒（組員班表分頁）／10 秒（其他頁）才算，一算就卡 1 秒 */   /* 使用者正在操作就先讓開")

# ══ H2：後台卡頓（續）——真人點擊剖析（tests/prof28c.js）：除了組員背景，還有競標模擬資料預補（1025B：使用者 1.5 秒沒操作就補一班，一班 0.1 秒以上、還會牽動 Payload 艙單與組員計畫）、
#   航班資料 DH 背景補算（1026C dhLater929，沒有看使用者是否正在操作）→ 都改成使用者停手 8 秒才做（讀一頁的時間通常超過 1.5 秒，下一次點擊剛好撞上就卡）。
RW('lag28 auc pre',"(function step(dl){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(function(){idle25(step)},700);return}",
   "(function step(dl){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<8000){setTimeout(function(){idle25(step)},1500);return}   /* 1101A：1.5→8 秒 */")
RW('lag28 auc q',"if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(function(){I25(step929)},700);return}",
   "if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<8000){setTimeout(function(){I25(step929)},1500);return}   /* 1101A：1.5→8 秒 */")
RW('lag28 dh later',"    setTimeout(function go(){n++;try{if(window.kgmCrewHasDayR121(date)){",
   "    setTimeout(function go(){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<8000){setTimeout(go,1500);return}   /* 1101A：使用者停手 8 秒才算（一算一天卡 1 秒） */\n      n++;try{if(window.kgmCrewHasDayR121(date)){")

# H3：每次畫面後的全頁掃描（0812A postRenderQ）：先看整頁文字有沒有要換的字，沒有就不逐節點掃（結果相同）
RW('lag28 post click',"      document.querySelectorAll('[onclick]').forEach(function(x){var o=x.getAttribute('onclick')||'',t=(x.textContent||'').trim();if(/milesTab",
   "      var bt28=(document.body&&document.body.textContent)||'';   /* 1101A：先看整頁有沒有要處理的字，沒有就不逐個掃（後台每次點擊省 100～300ms） */\n      if(document.querySelector('[onclick*=\"milesTab\" i],[onclick*=\"flight miles\" i],[onclick*=\"搭機累積里程\"]')||/搭機累積里程|flight miles/i.test(bt28))document.querySelectorAll('[onclick]').forEach(function(x){var o=x.getAttribute('onclick')||'',t=(x.textContent||'').trim();if(/milesTab")
RW('lag28 post walker',"      var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,nodes=[];while((n=walker.nextNode()))nodes.push(n);nodes.forEach(function(x){if(/pending_security/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/pending_security/g,statusNameQ('pending_security'));if(/搭機累積里程/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/搭機累積里程/g,'');});",
   "      if(/pending_security|搭機累積里程/.test(bt28)){var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,nodes=[];while((n=walker.nextNode()))nodes.push(n);nodes.forEach(function(x){if(/pending_security/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/pending_security/g,statusNameQ('pending_security'));if(/搭機累積里程/.test(x.nodeValue||''))x.nodeValue=String(x.nodeValue).replace(/搭機累積里程/g,'');});}")
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
   "'這裡列出此帳號名下的所有訂位。在左邊勾選一筆，再按右下角「進入行程」，即可辦理報到、選位、改票與退票。'")
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

# ══ 新長程式嵌入 ══
_ch27=open('../1026C/js/ch27.js',encoding='utf-8').read()
RW('r28 embed',_ch27,_ch27+''.join(JS(n) for n in EMB28))
open('p_h_r28.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
