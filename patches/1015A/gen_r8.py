from common import *
# ══ 1008A ═══════════════════════════════════════════════════════════════════
#   使用者：「我在後台看到圖一有四個航班結果圖二櫃檯2只有兩個航班 然後為什麼地勤這麼經常會沒有航班這樣太多人都擠在那裡了吧
#   （排班時間可能每個人客製化直接要更好）然後工作內容很vague … 幾本上沒是就是滑手幾而已這樣不行」
# 全部在既有的層裡改（沒有新增 <script id> 層）。
CUR=open('/tmp/j/kgm1008A_w1.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
GPLAN=open('js/gplan8.js',encoding='utf-8').read()
OLDFLUSH=open('js/flush_old.txt',encoding='utf-8').read()
NEWFLUSH=open('js/flush_new.txt',encoding='utf-8').read()
assert '</script' not in GPLAN

# ── 1. 地勤派工引擎：放在 r194（原本重畫個人班表的那一層）尾端，所有包裝都裝好之後才接上 ──
RC('gplan8 engine','kgm-0907A-r194',
   "  o.ok=!bad.length;o.bad=bad;\n  return o;\n};\n})();\n",
   "  o.ok=!bad.length;o.bad=bad;\n  return o;\n};\n})();\n"+GPLAN)
# r194：不再把 8 小時硬切三段、也不再寫「這段時間本航廈沒有航班起降 → 旅客服務台」那種空話
RC('r194 off','kgm-0907A-r194',
   "    if(tab()!=='groundops')return 0;\n",
   "    if(tab()!=='groundops')return 0;\n    if(window.kgmGroundPlanInstalledR1008A)return 0;   /* 1008A：個人班表改由派工計畫直接畫 */\n")
RC('r194 audit','kgm-0907A-r194',
   "window.kgmAuditR194=function(){\n  var o={},bad=[];",
   "window.kgmAuditR194=function(){\n  if(window.kgmGroundPlanInstalledR1008A&&window.kgmAuditR1008A){   /* 1008A：「三段八小時」規則已由派工計畫取代，改驗派工計畫 */\n"
   "    var a8=window.kgmAuditR1008A('TPE'),b8=window.kgmAuditR1008A('TSA');\n"
   "    return {ok:!!(a8.ok&&b8.ok),bad:a8.bad.concat(b8.bad),tpe:a8,tsa:b8,supersededBy:'R1008A'};\n  }\n  var o={},bad=[];")

# ── 2. 派工計畫自己算的時候，舊的挑人邏輯（r102／r116／r138）不必再跑（結果會被派工計畫整個換掉） ──
RC('r102 skip','kgm-0902a-r102',
   "      var out=_alloc.apply(this,arguments);\n      try{\n        if(!out||!out.rows||!out.rows.length)return out;",
   "      var out=_alloc.apply(this,arguments);\n      if(window.KGM_GPLAN_BUSY_R1008A)return out;   /* 1008A：派工計畫自己排人 */\n      try{\n        if(!out||!out.rows||!out.rows.length)return out;")
RC('r116 skip','kgm-0903b-r116',
   "        try{\n          var fx=termOfDayR914(ap,date),fixed=fx.map,info=fx.people;",
   "        if(!window.KGM_GPLAN_BUSY_R1008A)try{   /* 1008A：派工計畫自己排人 */\n          var fx=termOfDayR914(ap,date),fixed=fx.map,info=fx.people;")
RC('r138 skip','kgm-0905a-r138',
   "    if(busy||!r||!r.rows)return r;",
   "    if(busy||!r||!r.rows||window.KGM_GPLAN_BUSY_R1008A)return r;   /* 1008A：派工計畫自己排人 */")
# r138 稽核：「一人至少顧兩個櫃檯」是舊規則（那時地勤只做櫃檯）；現在同一個人也做登機門與到站，這一條改由派工計畫的稽核取代。
#   分身（clash）照驗，但以每個人實際在這個櫃檯的時段為準（同一個櫃檯可能分前後兩組交接）。
RC('r138 clash time','kgm-0905a-r138',
   "        (row.staff||[]).forEach(function(p){\n          if(!p||!p.empId)return;\n          (byPerson[p.empId]=byPerson[p.empId]||[]).push([a,b2]);",
   "        (row.staff||[]).forEach(function(p){\n          if(!p||!p.empId)return;\n"
   "          var d8=/^(\\d\\d):(\\d\\d)–(\\d\\d):(\\d\\d)$/.exec(String(p.dutyR1008A||''));   /* 1008A：這個人在這個櫃檯的實際時段 */\n"
   "          if(d8){var a8=+d8[1]*60+ +d8[2],b8=+d8[3]*60+ +d8[4];if(a8<180)a8+=1440;if(b8<a8)b8+=1440;(byPerson[p.empId]=byPerson[p.empId]||[]).push([a8,b8]);return}\n"
   "          (byPerson[p.empId]=byPerson[p.empId]||[]).push([a,b2]);")
RC('r138 pass','kgm-0905a-r138',
   "  function pass(x){return !!(x&&x.clash===0&&x.multiTerm===0&&x.under<=(+x.floor||0))}",
   "  function pass(x){return !!(x&&x.clash===0&&x.multiTerm===0&&(x.under<=(+x.floor||0)||window.kgmGroundPlanInstalledR1008A))}   /* 1008A：至少兩櫃改由派工計畫的稽核取代 */")

# ── 3. 後台頁面（r74）：選人清單、職務、當日派工都讀派工計畫 ─────────────────────
T74='kgm-0823o-r74'
RC('r74 skip old people loop',T74,
   "  if(h.self){\n    [0,1,2,3,4,5,6,7].forEach(function(slot74){",
   "  var plan74=(h.self&&(ap==='TPE'||ap==='TSA')&&window.kgmGroundPeopleR1008A)?window.kgmGroundPeopleR1008A(ap,date):null;   /* 1008A：派工計畫（櫃檯頁與個人班表同一份） */\n"
   "  if(plan74)plan74.forEach(function(x74){peopleById74[x74.empId]=Object.assign({},x74.p,{label8:x74.label});tasksById74[x74.empId]=x74.tasks});\n"
   "  if(h.self&&!plan74){\n    [0,1,2,3,4,5,6,7].forEach(function(slot74){")
RC('r74 people order',T74,
   "  var people74=Object.keys(peopleById74).map(function(id74){return peopleById74[id74]}).sort(function(a74,b74){return String(a74.empId).localeCompare(String(b74.empId))});",
   "  var people74=plan74?plan74.map(function(x74){return peopleById74[x74.empId]}):Object.keys(peopleById74).map(function(id74){return peopleById74[id74]}).sort(function(a74,b74){return String(a74.empId).localeCompare(String(b74.empId))});")
RC('r74 option label',T74,
   "E(p74.name||'')+'</option>'",
   "E(p74.name||'')+(p74.label8?(' · '+E(p74.label8)):'')+'</option>'")
RC('r74 role',T74,
   "E(roleLabel74(person74))",
   "E((plan74&&window.kgmGroundRoleR1008A&&window.kgmGroundRoleR1008A(ap,date,personId74))||roleLabel74(person74))")
RC('r74 jobs open',T74,
   "</div></div><div class=\"k74-person-jobs\">'+(personTasks74.length?",
   "</div></div>'+((plan74&&window.kgmGroundJobsR1008A&&window.kgmGroundJobsR1008A(ap,date,personId74))||('<div class=\"k74-person-jobs\">'+(personTasks74.length?")
RC('r74 jobs close',T74,
   "'</div>')+'</div>':'')+'</section>':'<section class=\"k74-person k74-contracted\">",
   "'</div>')+'</div>')):'')+'</section>':'<section class=\"k74-person k74-contracted\">")

# ── 4. 週班表（r102）、站別梯次（r163）、月班表（r174）的文字跟著改 ─────────────────
RC('r102 hours text','kgm-0902a-r102',
   "(z()?'連續 8 小時':'8 continuous hours')",
   "(d.reserveR1008A?(z()?'備勤・在家待命，不到場':'Reserve · on call'):d.previewR1008A?(z()?'預排時間帶・前一天依航班排定上下班時間':'Pre-roster · exact times set the day before'):d.planR1008A?(z()?('依當日航班排定・實際工時 '+Math.floor((d.workMinsR1008A||0)/60)+' 小時'+((d.workMinsR1008A||0)%60?(' '+((d.workMinsR1008A||0)%60)+' 分'):'')):('Built from flights · '+Math.round((d.workMinsR1008A||0)/6)/10+' h working')):(z()?'連續 8 小時':'8 continuous hours'))")
RC('r102 note','kgm-0902a-r102',
   "+'<p class=\"k102-note\">'+(z()",
   "+'<p class=\"k102-note\">'+(window.kgmGroundPlanInstalledR1008A?(z()"
   "?('上下班時間依當天航班排定（1008A）：第一項工作前 15 分鐘報到、最後一項工作後 15 分鐘交接；班別最長 9 小時、實際工時最多 8 小時，連續工作 4.5 小時內一定有 30 分鐘以上用餐。'"
   "+'時間帶以週為單位輪替（早班／中班／晚班），前後兩天之間至少休息 11 小時；每週固定連休兩天'+(offDays.length?('（'+offDays.join('、')+'）'):'')+'。'"
   "+'當天工作已排滿時，其餘同仁為「備勤」（在家待命，不到機場）。明天以後先顯示預排時間帶，前一天才排定實際上下班時間。')"
   ":('Shifts are built from the day\\u2019s flights: brief 15 minutes before the first duty and hand over 15 minutes after the last; at most 9 hours on shift and 8 hours working, with a meal break of 30 minutes or more within every 4.5 hours. Two consecutive rest days a week.'))"
   ":z()")
RC('r163 panel','kgm-0905b-r163',
   "    el.innerHTML='<b>'+(z()?'本站當日各梯次上下班時間':'Start and finish times on duty today')+'</b>'",
   "    el.innerHTML=(window.kgmGroundStationHtmlR1008A&&window.kgmGroundStationHtmlR1008A(String(S._cr74Ap||'TPE'),date,id))||('<b>'+(z()?'本站當日各梯次上下班時間':'Start and finish times on duty today')+'</b>'")
RC('r163 panel end','kgm-0905b-r163',
   "      }).join('')+'</div>';\n    host.appendChild(el);",
   "      }).join('')+'</div>');\n    host.appendChild(el);")
RC('r163 audit','kgm-0905b-r163',
   "  o.ok=!!(o.hooked&&o.spreadOK&&o.stable===true&&o.hours===0);\n",
   "  o.ok=!!(o.hooked&&o.spreadOK&&o.stable===true&&o.hours===0);\n"
   "  if(window.kgmGroundPlanInstalledR1008A&&window.kgmAuditR1008A){var a8=window.kgmAuditR1008A('TPE');o.supersededBy='R1008A';o.ok=!!(o.hooked&&a8.ok);o.bad=a8.bad}   /* 1008A：五梯次固定 8 小時已改成依航班排定 */\n")
RC('r174 hours','kgm-0905c-r174',
   "  o.hoursOK=!!(o.month&&o.month.hours===o.month.work*8);",
   "  o.hoursOK=!!(o.month&&(window.kgmGroundPlanInstalledR1008A?(o.month.hours<=o.month.work*9):(o.month.hours===o.month.work*8)));   /* 1008A：派工日的班別依航班排定（最長 9 小時） */")
RC('r174 note','kgm-0905c-r174',
   "        ?'每一格寫的是這位同仁<b>自己的</b>上下班時間 —— 同一個班別的人前後各錯開最多一小時，所以不會每個人都一樣。'",
   "        ?(window.kgmGroundPlanInstalledR1008A?'每一格寫的是這位同仁<b>自己的</b>上下班時間：前天到明天是依航班排好的實際時段，之後的日子是預排時間帶（前一天才排定實際上下班時間）。'"
   ":'每一格寫的是這位同仁<b>自己的</b>上下班時間 —— 同一個班別的人前後各錯開最多一小時，所以不會每個人都一樣。')")
# 松山：每天 6 班出發、6 班抵達（早上 7 點同時要 7 人），12 人排不出來 → 20 人
RW('tsa team 20',
   "slice(0,12).forEach(function(x){ids[x.empId]=1})",
   "slice(0,20).forEach(function(x){ids[x.empId]=1})")

# ── 5. 後台卡頓：開站約 37 秒時整年機隊重排獨佔主執行緒 16 秒 ─────────────────────────
#   1006A 起收尾重排會先分段算好快取，輸入（FLIGHTS 等）沒變就直接沿用；但 r132 每隔幾秒把 KX168／KX167 改成 B78X，
#   r143／r184 又改回 A21N（0906A 使用者確認固定 A21N），兩邊來回翻 → 簽章對不上 → 快取作廢、整年從頭重排。
#   r132 這一段不再改 FLIGHTS（機型解析的包裝保留，最外層仍是 r184 的 A21N 鎖）。
RC('r132 no B78X flip','kgm-0904a-r132',
   "      if(f.acft==='B78X')return;\n      f.acft='B78X';n++;log132(t[0]+' 機型 → B78X');",
   "      return;   /* 1008A：0906A 起固定 A21N（r143／r184），這裡再改 B78X 只會跟它們來回翻，每翻一次整年機隊重排的快取就作廢 */\n      f.acft='B78X';n++;log132(t[0]+' 機型 → B78X');")

#   收尾重排沿用快取後仍要 7 秒；其中 coverageRecovery72 的 initTail 對每一列（約 11 萬列）呼叫 flight72，
#   flight72 快取沒中時要把 590 班全部掃一遍（實測 2.3 秒）。改成先依航班號建索引，只掃同航班號的那幾筆，結果完全相同。
RC('flight72 index','kgm-0823o-r72',
   "  var dt=new Date(date+'T12:00:00');var f=allF().filter(function(x){return x&&!x.via&&x.code===code&&(!fr||x.fr===fr)&&(!to||x.to===to)&&flyOn(x,dt)})[0];",
   "  var all72=allF(),ix72=flight72.idx;   /* 1008A：依航班號建索引（只掃同航班號的那幾筆，結果相同） */\n"
   "  if(!ix72||ix72.n!==all72.length){ix72=flight72.idx={n:all72.length,m:{}};all72.forEach(function(x){if(x&&!x.via)(ix72.m[x.code]=ix72.m[x.code]||[]).push(x)})}\n"
   "  var dt=new Date(date+'T12:00:00');var f=(ix72.m[code]||[]).filter(function(x){return x&&!x.via&&x.code===code&&(!fr||x.fr===fr)&&(!to||x.to===to)&&flyOn(x,dt)})[0];")
RC('flight72 index reset','kgm-0823o-r72',
   "window.kgmClearRotationCacheR72=function(){LEGC72={};DAYC72={};ROT72={};THRU72=null;SEC72=null;flight72.cache={};",
   "window.kgmClearRotationCacheR72=function(){LEGC72={};DAYC72={};ROT72={};THRU72=null;SEC72=null;flight72.cache={};flight72.idx=null;")

#   再把「每一列的機型時刻＋飛行時間」挪到前面分段準備的階段先算好（同一個 flight72 函式，結果相同），收尾那一刀只剩查表。
RC('flight72 warm fn','kgm-0823o-r72',
   "window.kgmDayOf72R1006A=function(d){return dayOf72(d)};",
   "window.kgmDayOf72R1006A=function(d){return dayOf72(d)};\n"
   "window.kgmWarmF72R1008A=function(d){dayOf72(d).forEach(function(r){var f=flight72(r.f.code,r.f.fr,r.f.to,d);if(f)durOnM72(f,d)})};   /* 1008A：分段準備時先把每一列查好 */\n"
   "var DURM72=new WeakMap();function durOnM72(f,date){var m=DURM72.get(f);if(m&&m.d===date&&m.a===f.dep&&m.b===f.arr)return m.v;var v=durOn72(f,date);DURM72.set(f,{d:date,a:f.dep,b:f.arr,v:v});return v}")
RC('initTail memo dur','kgm-0823o-r72',
   "f?durOn72(f,q.date):180",
   "f?durOnM72(f,q.date):180")
RC('final prep warm','kgm-0823o-r72',
   "while(di6<rg6.n&&Date.now()-t<150){window.kgmDayOf72R1006A(D(rg6.w0,di6));di6++}",
   "while(di6<rg6.n&&Date.now()-t<150){var dd8=D(rg6.w0,di6);window.kgmDayOf72R1006A(dd8);if(window.kgmWarmF72R1008A)window.kgmWarmF72R1008A(dd8);di6++}")

#   分段準備要 11～14 秒，期間別的圖層還在背景改 FLIGHTS（例：r131 把 KX31 的夏令時差套上去），收尾時輸入已經變了，
#   原本就整年從頭同步重排（實測 15 秒不能動）。改成：輸入變了就再分段準備一次（最多 3 次），收尾那一刀永遠是查表。
RC('final retry prep','kgm-0823o-r72',
   "    function finish6(){\n      if(window.KGM_ROT_FINAL_R913)return;\n",
   "    var retry8=0;\n    function finish6(){\n      if(window.KGM_ROT_FINAL_R913)return;\n"
   "      window.KGM_KEEP72_1006A=sig6;try{if(window.kgmRepairTimetableR77)window.kgmRepairTimetableR77()}catch(_){}window.KGM_KEEP72_1006A=null;   /* r92 包裝在重排前會先跑這個，先跑再比，才是重排真正看到的輸入（跑的時候先別清快取：輸入有變下一行就會重新準備） */\n"
   "      if(retry8<3&&window.kgmSig72R1006A(st6,dy6)!==sig6){retry8++;di6=0;ti6=0;window.KGM_FINALRETRY_1008A=retry8;next6(prep6);return}   /* 1008A：準備期間輸入變了 → 再分段準備，不在主執行緒上整年硬算 */\n")

#   準備期間會一直變的其實只是顯示用欄位：r143 加上 mixedTypesR136、r184 又把它刪掉（每輪巡檢互翻），跟排班無關。
#   簽章略過這兩個顯示欄位與 __ 開頭的內部標記；起降時間、班期、機型等真正會影響排班的欄位照比。
RC('sig ignore display fields','kgm-0823o-r72',
   "return JSON.stringify([st,dy,T(),S.acftSub||{},S.tailStatus||{},S.fleetAddedR928||null,S.fleetRetiredR928||null,S.fleetMaintenanceR830||null,S.customFlights||[],FLIGHTS,man])",
   "return JSON.stringify([st,dy,T(),S.acftSub||{},S.tailStatus||{},S.fleetAddedR928||null,S.fleetRetiredR928||null,S.fleetMaintenanceR830||null,S.customFlights||[],FLIGHTS,man],function(k,v){return (k==='mixedTypesR136'||k==='acLabelR136'||/^__/.test(k))?undefined:v})")

#   營收分析的 12 個月月結是背景逐日累加（一天約 135 ms、一年 365 步），原本每一步算完立刻排下一步，
#   打開過一次營收分析之後整個後台有一兩分鐘每秒都在卡。改成只在瀏覽器閒置時才跑下一步（數字完全相同，只是讓出主執行緒給操作）。
RW('finance month idle 1',
   "financeMonth.jobs.shift();setTimeout(step,0);return}",
   "financeMonth.jobs.shift();kgmIdleR1008A(step);return}")
RW('finance month idle 2',
   "      setTimeout(step,0);\n    },0)}return _last929||null;",
   "      kgmIdleR1008A(step);   /* 1008A：閒置時才算下一天 */\n    },0)}return _last929||null;")
RW('finance month idle fn',
   "function financeMonth(ym,ap,lazy){",
   "function kgmIdleR1008A(f){try{if(window.requestIdleCallback)return window.requestIdleCallback(function(){f()},{timeout:2000})}catch(_){}return setTimeout(f,40)}\n"
   "function financeMonth(ym,ap,lazy){")

#   每次重畫都會呼叫 save()，原本每次都把 80 個鍵全部重新寫進 localStorage —— 實測切 7 個分頁（21 秒）寫了 103 次，
#   組員班表 1.9 MB、訂位 1.6 MB 每次都重寫，共約 400 MB。改成：內容沒變的鍵不重寫；半秒內的連續存檔合併成一次。
RW('ls flush skip unchanged',OLDFLUSH,NEWFLUSH)

#   旅客回饋頁背景補組員姓名（r52 fillCrewK923）每查一班 crewOnFlight，外層包裝就把「當天整份班表」
#   幾百班重新排一次座艙長／服務艙等（每班都去問機型、是否賣豪經），實測 20 秒裡佔 7.8 秒。
#   同一班、同一份組員名單已經排過就直接沿用（名單一變就重排，結果相同）。
RC('cabin positions memo','kgm-0907A-r196',
   "    var L=f&&f.cabin;if(!L||!L.length)return f;\n",
   "    var L=f&&f.cabin;if(!L||!L.length)return f;\n    if(f.__posR1008A===L)return f;   /* 1008A：同一份名單已經排過 */\n")
RC('cabin positions memo set','kgm-0907A-r196',
   "    f.cabin=order;\n  }catch(_){}\n  return f;\n};",
   "    f.cabin=order;try{Object.defineProperty(f,'__posR1008A',{value:order,writable:true,configurable:true,enumerable:false})}catch(_){f.__posR1008A=order}\n  }catch(_){}\n  return f;\n};")

#   每分鐘一次的寄信巡檢（emailSweep0810J）會跑 reconcileActualEquipment0810J：原本「35 天 × 每一架 × 該架全年每一列」逐日掃
#   （約 400 萬次比對，實測每次約 2 秒卡住）。改成每一架的列只掃一次、只處理落在這 35 天內的；同一天同一航班的處理順序不變，結果相同。
RW('reconcile equip one pass',
   "    for(var di=0;di<days;di++){\n      var date=addDays(start,di);\n      Object.keys(S.tailAssign||{}).forEach(function(tail){var tp=typeof _typeOfTail==='function'?_typeOfTail(tail):null;if(!tp)return;(S.tailAssign[tail]||[]).forEach(function(x){\n        if(!x||x.date!==date)return;var rt=x.route||'',row=scheduledRow0810J(x.code,rt);",
   "    var end8=addDays(start,days);   /* 1008A：每一架的列只掃一次 */\n    {\n      Object.keys(S.tailAssign||{}).forEach(function(tail){var tp=typeof _typeOfTail==='function'?_typeOfTail(tail):null;if(!tp)return;(S.tailAssign[tail]||[]).forEach(function(x){\n        if(!x||!x.date||x.date<start||x.date>=end8)return;var date=x.date;var rt=x.route||'',row=scheduledRow0810J(x.code,rt);")

#   旅客回饋背景補組員姓名：原本一次把一整天的回饋做完（實測單次 1～1.6 秒），改成每段最多 60ms，做不完的下一段接著做（結果相同）。
RC('feedback fill chunk','kgm-0823b-r52',open('js/fb_old.txt',encoding='utf-8').read(),open('js/fb_new.txt',encoding='utf-8').read())
RC('feedback fill chunk 2','kgm-0823b-r52',open('js/fb_old2.txt',encoding='utf-8').read(),open('js/fb_new2.txt',encoding='utf-8').read())

# ── 6. 案件類型 ────────────────────────────────────────────────────────────────────
#   使用者：「里程購買不應該成立案件編號 案件主要是退費 行李問題 非自願將倉 之類的你去研究一下」
#   · 里程購買是交易（審核在「里程購買」頁，有自己的訂單號 MP-…），現場改票也是交易（0928B 使用者：改票不成立案件、只有退款才成立），兩者不再列為案件。
#   · 組員調位造成的非自願降艙／無位改搭自動成立案件；地勤／客服建立案件時多了「非自願降艙」「拒絕登機／超賣」「里程補登」。
CASE8=open('js/case8.js',encoding='utf-8').read()
RW('case8 sources',
   "  add(S.serviceCases0831A,'counter','現場改票');add(S.moneyCasesG,'money','請款／退款');add(S.irropsCases,'irrops','航班異常');",
   "  add(S.moneyCasesG,'money','請款／退款');add(S.irropsCases,'irrops','航班異常');   /* 1008A：現場改票是交易，不成立案件 */\n"
   "  try{add(invol8J(),'invol','非自願降艙')}catch(_){}   /* 1008A：組員調位造成的非自願降艙／無位改搭 */")
RW('case8 no miles',
   "  add(S.profileChangeCases0815,'profile','會員資料變更');add(S.milesPurchaseCases0809D,'miles','里程購買');",
   "  add(S.profileChangeCases0815,'profile','會員資料變更');   /* 1008A：里程購買是交易（訂單號 MP-…，審核在「里程購買」頁），不成立案件 */")
RW('case8 fn',"function caseRowsJ(){",CASE8+"function caseRowsJ(){")
RW('case8 types',
   "  refund_req:['退款申請','Refund request'],disruption:['航班異動協助','Disruption assistance'],other:['其他','Other']};",
   "  refund_req:['退款申請','Refund request'],disruption:['航班延誤／取消','Delay / cancellation'],other:['其他','Other'],\n"
   "  invol_downgrade:['非自願降艙','Involuntary downgrade'],denied_boarding:['拒絕登機／超賣','Denied boarding'],miles_claim:['里程補登','Missing miles claim']};   /* 1008A */")
RW('case8 new list',
   "var NEW7=['bag_lost','bag_delayed','bag_damaged','item_lost','complaint','assistance','refund_req','disruption','other'];",
   "var NEW7=['refund_req','bag_delayed','bag_lost','bag_damaged','invol_downgrade','denied_boarding','disruption','item_lost','complaint','assistance','miles_claim','other'];   /* 1008A：依航空公司客服常見案件排序 */")
RW('case8 source label',
   "  profile:['會員服務','Membership'],miles:['里程服務','Miles'],staff:['地勤／客服','Ground / Customer service'],upgrade:['里程升等','Upgrade']};",
   "  profile:['會員服務','Membership'],miles:['里程服務','Miles'],staff:['地勤／客服','Ground / Customer service'],upgrade:['里程升等','Upgrade'],\n"
   "  invol:['艙等異動（系統）','Cabin change (system)']};")
RW('case8 front text',
   "以您的會員帳號建立的所有案件：里程升等、會員資料變更、請款與退款、現場改票、航班異常、里程購買，以及機場地勤／客服為您建立的行李與服務案件。",
   "以您的會員帳號建立的所有案件：退款、行李（延誤／遺失／損壞）、非自願降艙與拒絕登機、航班延誤／取消、會員資料變更，以及機場地勤／客服為您建立的服務案件。")
RW('case8 reissue wording',
   "st.caseNo=caseNo;st.msg=(z()?'改票完成；案件編號 ':'Reissue completed; case ')+caseNo",
   "st.caseNo=caseNo;st.msg=(z()?'改票完成；改票紀錄 ':'Reissue completed; record ')+caseNo")
RW('case8 reissue notif',
   "title:z()?'現場改票完成':'Counter reissue completed',message:(z()?'案件 ':'Case ')+caseNo",
   "title:z()?'現場改票完成':'Counter reissue completed',message:(z()?'改票紀錄 ':'Record ')+caseNo")

# ── 7. 組員 DH 的 PNR：直接寫在班表那一天下面，而且行程管理查得到 ─────────────────────
#   使用者：「員工的DH PNR直接寫在該日班表正下面 進去行程管理要找的到喔」
#   原本 DH 訂位是打開「航班資料」那一班才建立，所以從班表抄 PNR 去行程管理會查不到。
#   改成：組員班表畫到 DH 那一天就建立（同一個函式、同一個 4 碼 PNR），並把 PNR 與行程管理要輸入的姓氏寫在那一格。
RC('dh ensure','kgm-r7-admin-ops',
   "  window.kgmDhPnrR929=dhPnr929;",
   "  window.kgmDhPnrR929=dhPnr929;\n"
   "  /* 1008A：班表上看到的 DH 一定有訂位（行程管理查得到）；回傳 {pnr,last} */\n"
   "  window.kgmDhEnsureR1008A=function(empId,date,code,fr,to){\n"
   "    try{\n"
   "      var key=[date,code,fr,to].join('|'),L=(S.crewPositioningR121||{})[key]||[];\n"
   "      var p=L.filter(function(q){return q&&q.empId===empId})[0];if(!p)return null;\n"
   "      var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&!x.via&&x.code===code&&x.fr===fr&&x.to===to})[0];if(!f)return null;\n"
   "      try{f=window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(f,date)||f):f}catch(_){}\n"
   "      var pn=dhPnr929(empId,date,code),had=(S.bookings||[]).some(function(x){return x&&x.pnr===pn});\n"
   "      var b=dhBooking929(p,f,date);\n"
   "      var px=(b.paxList||[])[0];if(px&&!px.lastName){var nm8=String(dhName8(empId)||'').trim().split(/\\s+/);if(nm8[0]){px.firstName=(nm8.slice(0,-1).join(' ')||nm8[0]).toUpperCase();px.lastName=(nm8.length>1?nm8[nm8.length-1]:'').toUpperCase();had=false}}   /* 舊的 DH 訂位姓名是空的 → 補上 */\n"
   "      if(!had){try{save()}catch(_){}}\n"
   "      return {pnr:b.pnr,last:((b.paxList||[])[0]||{}).lastName||''};\n"
   "    }catch(_){return null}\n"
   "  };")
RC('roster dh pnr fn','kgm-0907A-r196',
   "  function dhCodes1004B(ls){",
   "  function dhPnrs8(ls,d){var o=[];(ls||[]).forEach(function(l){var c=l&&(l.dhFlightR1004B||(l.code&&l.code!=='DH'?l.code:''));if(!c||!window.kgmDhEnsureR1008A)return;\n"
   "    var r=window.kgmDhEnsureR1008A(id,l.dhDateR1004B||l.date||d,c,l.fr,l.to);if(r&&r.pnr){var b8=(S.bookings||[]).filter(function(q){return q&&q.pnr===r.pnr})[0];r.first=b8&&((b8.paxList||[])[0]||{}).firstName||''}if(r&&r.pnr&&!o.some(function(x){return x.pnr===r.pnr}))o.push(r)});\n"
   "    return o.length?('<i class=\"k196-pnr\" style=\"display:block;margin-top:3px;font:800 10.5px ui-monospace,Menlo,monospace;color:#123c32;background:#eef5f1;border:1px solid #cfe1d6;border-radius:6px;padding:2px 6px\">'+o.map(function(r){return 'DH PNR '+E(r.pnr)+(r.last?(z()?(' · '+E(r.last)+' / '+E(r.first||'')):(' · '+E(r.last)+' / '+E(r.first||''))):'')}).join('<br>')+'</i>'):''}   /* 1008A：DH 訂位代號（行程管理用 PNR＋姓氏查得到） */\n"
   "  function dhCodes1004B(ls){")
RC('roster dh pnr day','kgm-0907A-r196',
   "          +'<i class=\"k196-dh\">'+(z()?'整日調位（以旅客身分搭乘），不計執勤':'Positioning only; not an operating duty')+'</i>';",
   "          +'<i class=\"k196-dh\">'+(z()?'整日調位（以旅客身分搭乘），不計執勤':'Positioning only; not an operating duty')+'</i>'+dhPnrs8(_dl,x.date);")
RC('roster dh pnr op','kgm-0907A-r196',
   "+'　'+(z()?'以旅客身分調位':'positioning as a passenger')+'</i>'):'');",
   "+'　'+(z()?'以旅客身分調位':'positioning as a passenger')+'</i>'+dhPnrs8(_dl,x.date)):'');")

RC('dh name fallback','kgm-r7-admin-ops',
   "    var nm=String(p.name||'').trim().split(/\\s+/),",
   "    var nm=String(p.name||dhName8(p.empId)||'').trim().split(/\\s+/),")
RC('dh name fn','kgm-r7-admin-ops',
   "  function dhPnr929(empId,date,code){return dhPnr4(empId,date,code)}",
   "  function dhPnr929(empId,date,code){return dhPnr4(empId,date,code)}\n"
   "  function dhName8(id){try{var s8=(S.staff||[]).filter(function(x){return x&&x.empId===id})[0];if(s8&&s8.name)return s8.name;var P8=window.kgmCrewPoolR121&&window.kgmCrewPoolR121(),r8=null;((P8&&P8.pilots)||[]).concat((P8&&P8.cabin)||[]).forEach(function(q){if(!r8&&q&&q.empId===id)r8=q});return (r8&&r8.name)||''}catch(_){return ''}}   /* 1008A */")

#   實測：DH 訂位帶 staffTix 標記，行程管理把它當成「未驗證的員工票」擋掉（「員工票 4V2U 目前為未驗證」）——
#   DH 是公司指派的調位（確定座位），不是候補員工票，不需要 AI 行程核對。
RW('dh not unverified stx',
   "    if(b.staffVerifiedR922||b.tixVerified)return true;",
   "    if(b.staffVerifiedR922||b.tixVerified||b.dhR929)return true;   /* 1008A：DH 調位是公司指派的確定座位，不走員工票核對 */")

#   班表重排之後，原本那一天的 DH 可能已經不存在；舊的 DH 訂位若還留著，行程管理會查到一張已經不用搭的票。
#   打開某位組員的班表時，60 天內已經不在班表上的 DH 訂位改成「已取消（班表異動）」。
RC('roster dh stale','kgm-0907A-r196',
   "  var ros=window.kgmRosterR196(id,DAYS196);",
   "  var ros=window.kgmRosterR196(id,DAYS196);\n"
   "  try{if(window.kgmDhPnrR929&&ros.length){var ok8={},d0=ros[0].date,d1=ros[ros.length-1].date;   /* 1008A：班表上已經沒有的 DH 訂位 → 取消 */\n"
   "    ros.forEach(function(x){(x.legs||[]).forEach(function(l){if(!(l&&(l.deadhead||l.dhR913||String(l.code||'')==='DH')))return;var c=l.dhFlightR1004B||(l.code!=='DH'?l.code:'');if(c)ok8[window.kgmDhPnrR929(id,l.dhDateR1004B||l.date||x.date,c)]=1})});\n"
   "    var ch8=0;(S.bookings||[]).forEach(function(b){var h=b&&b.dhR929;if(!h||h.empId!==id||b.status==='cancelled'||h.date<d0||h.date>d1||ok8[b.pnr])return;b.status='cancelled';b.dhCancelledR1008A=new Date().toISOString();ch8++});\n"
   "    if(ch8){try{save()}catch(_){}}}}catch(_){}")

# ── 8. 前台案件查詢頁：上下 → 左右 ────────────────────────────────────────────────────
#   使用者：「前台案件編號頁面超醜不應該是上下應該是左右然後整體很奇怪」
RW('case lookup cols',
   "  if(!r)return '<main class=\"j-case-public\">'+head+form+'</main>';",
   "  if(!r){var right8=(S.user&&window.kgmMyCasesBodyR920H)?window.kgmMyCasesBodyR920H():caseInfo8J();   /* 1008A：左邊查詢、右邊說明（登入後是我的案件） */\n"
   "    return '<main class=\"j-case-public\">'+head+'<div class=\"k8c-cols\"><div class=\"k8c-left\">'+form"
   "+'<p class=\"k8c-hint\">'+(ZJ()?'案件編號為 KG 開頭的 13 碼，寄在案件成立時的 Email 與站內通知；姓名請填案件上的旅客（同護照拼音）。':'The case number starts with KG (13 characters). Use the passenger name on the case.')+'</p>'"
   "+'</div><aside class=\"k8c-right\">'+right8+'</aside></div></main>';}")
RW('case lookup first',
   "    +'<label>First Name<input id=\"caseFirst0831B\" class=\"inp\" value=\"'+EJ(st.first||'')+'\"></label>'",
   "    +'<label>'+(ZJ()?'名（同護照拼音）':'Given name')+'<input id=\"caseFirst0831B\" class=\"inp\" value=\"'+EJ(st.first||'')+'\"></label>'")
RW('case lookup last',
   "    +'<label>Last Name<input id=\"caseLast0831B\" class=\"inp\" value=\"'+EJ(st.last||'')+'\"></label>'",
   "    +'<label>'+(ZJ()?'姓（同護照拼音）':'Surname')+'<input id=\"caseLast0831B\" class=\"inp\" value=\"'+EJ(st.last||'')+'\"></label>'")
RC('case lookup mine once','kgm-0909E-r229',
   "        if(S.user&&!st.result){",
   "        if(S.user&&!st.result&&h.indexOf('k8c-right')<0){   /* 1008A：左右版已經把我的案件放在右欄 */")
RC('case lookup hero text','kgm-0909E-r229',
   "輸入案件編號與案件旅客姓名，就會看到這件案子目前走到哪一步、還缺什麼。登入之後，下方會直接列出您名下的所有案件，不必背編號。",
   "輸入案件編號與案件旅客姓名，就會看到這件案子目前走到哪一步、還缺什麼。登入之後，右邊會直接列出您名下的所有案件，不必背編號。")

# ── 9. 後台 AI ───────────────────────────────────────────────────────────────────────
#   使用者：「後台AI太笨了吧看圖四我希望是真的AI不是只固定會回覆幾個TEMPLATE」
#   ① 真的 AI 在 Worker（/ai/admin → Anthropic）：原本連不上時一律安靜改用站內規則，看不出是 Worker 沒部署、沒設 API Key、還是逾時（15 秒就放棄）。
#      改成等 45 秒，並把失敗原因寫在回覆下方。
#   ② 站內引擎看得懂「某組員跨日改班＋回程 DH／執勤」：拆出去程、回程、原班接手人選，列成方案。
AI8=open('js/ai8.js',encoding='utf-8').read()
RC('ai8 trip fn','kgm-0909E-r229',"  function crewSwap(a){",AI8+"  function crewSwap(a){")
RC('ai8 tool','kgm-0909E-r229',
   "    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},",
   "    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},\n"
   "    crew_trip_change:{tab:'sched',zh:'組員跨日改班（去程／回程 DH 方案）',run:function(a){return tripChange8(a)}},   /* 1008A */")
RC('ai8 plan','kgm-0909E-r229',
   "    var mp=/(?:改用|換成)?第\\s*(\\d)\\s*(?:位|個)/.exec(t);",
   "    if(crIds.length&&/改|換|調/.test(t)&&/\\b[A-Z]{3}\\s*[-–→>]\\s*[A-Z]{3}\\b/i.test(t)&&/\\d{1,2}[\\/\\-.]\\d{1,2}/.test(t)&&!/對調/.test(t))return [{tool:'crew_trip_change',args:{text:t}}];   /* 1008A：跨日改班 */\n"
   "    var mp=/(?:改用|換成)?第\\s*(\\d)\\s*(?:位|個)/.exec(t);")
RC('ai8 remote timeout','kgm-0909E-r229',
   "    var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},15000);",
   "    var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},45000);WHY8='';   /* 1008A：Opus 帶工具常要 20 秒以上，15 秒就放棄等於永遠用不到 */")
RC('ai8 remote why','kgm-0909E-r229',
   "      clearTimeout(tm);if(!res.ok)return null;var j=await res.json();if(!j||(!j.actions&&!j.reply))return null;return j;\n    }catch(_){clearTimeout(tm);return null}",
   "      clearTimeout(tm);if(!res.ok){var bt='';try{bt=(await res.text()).slice(0,160)}catch(_){}\n"
   "        WHY8=res.status===404?(z()?'Worker 沒有 /ai/admin 這個路由（Worker 還是舊版，請貼上 1008A 的 Worker 程式）':'Worker has no /ai/admin route')\n"
   "          :/no key/i.test(bt)?(z()?'Worker 沒有設定 ANTHROPIC_API_KEY':'ANTHROPIC_API_KEY is not set on the Worker')\n"
   "          :/origin/i.test(bt)?(z()?'Worker 的 ALLOWED_ORIGIN 跟目前開啟網站的網址不一樣（用檔案直接開時網址是 null）':'ALLOWED_ORIGIN does not match this page')\n"
   "          :('Worker HTTP '+res.status+(bt?('：'+bt):''));return null}\n"
   "      var j=await res.json();if(!j||(!j.actions&&!j.reply)){WHY8=(j&&j.error)?('Worker：'+String(j.error).slice(0,160)):(z()?'Worker 回傳空白':'empty reply');return null}return j;\n"
   "    }catch(e8){clearTimeout(tm);WHY8=(e8&&e8.name==='AbortError')?(z()?'等了 45 秒 Worker 沒有回應':'Worker timed out (45 s)'):(z()?('連不到 Worker（網路或 CORS）：'+String(e8&&e8.message||e8).slice(0,80)):'Network/CORS error');return null}")
RC('ai8 note','kgm-0909E-r229',
   "    if(src==='local')th.note=z()?'Claude Opus 5.5（Worker /ai/admin）目前連不上，這次由站內規則引擎依同一套權限執行。':'Worker unreachable — handled by the built-in rule engine with the same permissions.';",
   "    if(src==='local')th.note=(z()?'Claude Opus 5.5（Worker /ai/admin）目前連不上':'Worker unreachable')+(WHY8?((z()?'（原因：':' (')+WHY8+(z()?'）':')')):'')+(z()?'，這次由站內規則引擎依同一套權限執行。':' — handled by the built-in rule engine.');")
RC('ai8 why var','kgm-0909E-r229',
   "  async function remote(text){",
   "  var WHY8='';   /* 1008A：Worker 失敗的原因 */\n  async function remote(text){")
# 1008A：系統自動成立的非自願降艙／拒絕登機案件每次都由訂位紀錄重算 —— 不給「補充說明／CEO 核准」（寫進去會被下一次重算洗掉）
RW('case8 invol acts',
   "  }else if(!cl){",
   "  }else if(r.source==='invol'){acts='<div class=\"k7c-closed\">⚙ '+(zh?'系統自動案件：依組員調位紀錄成立，旅客改搭或座位恢復後自動更新，不需人工處理。':'System case: updated automatically from the crew-positioning record.')+'</div>';   /* 1008A */\n  }else if(!cl){")
RW('case8 invol card',
   "  if(!closed){",
   "  if(!closed&&r.source==='invol')foot+='<span class=\"j-case-done\">⚙ '+(ZJ()?'系統自動案件，不需人工處理':'System case — no action needed')+'</span>';   /* 1008A */\n  else if(!closed){")
RW('case8 center subtitle',
   "(zh?'改票、退款、航班異常、會員資料、里程與地勤／客服建立的案件都在這裡。點一件案件看完整紀錄與可以做的處理。'",
   "(zh?'退款、行李事故、非自願降艙／拒絕登機、航班延誤取消、會員資料與地勤／客服建立的案件都在這裡（改票、里程購買屬一般交易，不成立案件）。點一件案件看完整紀錄與可以做的處理。'")
save('p_h_r8.js','/* 1008A · 地勤單一派工引擎：櫃檯頁與個人班表同一份、每人依航班排定上下班時間、工作內容具體 */\n')
