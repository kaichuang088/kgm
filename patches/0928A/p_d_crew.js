/* 0927D · 組員：每週（一～日）一定有一整天不排班（使用者回答：「OK」→ 改成每週一定有一整天不排班）
   原因：連續執勤日上限（LAW.maxDutyDays＝6）只數營運航段；調位（DH）那一天不記、還會把連續天數歸零，
   於是「營運 1 天＋DH 1 天＋營運 5 天」一週 7 天都有勤務（10 月 8 件，勞基法例假出勤）。
   改成：派任何一段（營運或 DH）之前，先看這一週一～日加上這一天，是不是 7 天都有勤務；是就不派。 */
RL('crew week helper','kgm-0903b-r121',
"  function history(p){return DUTY121[p.empId]||(DUTY121[p.empId]={at:p.base||'TPE',home:p.base||'TPE',ready:-Infinity,initial:true,days:[]})}",
"  function history(p){return DUTY121[p.empId]||(DUTY121[p.empId]={at:p.base||'TPE',home:p.base||'TPE',ready:-Infinity,initial:true,days:[]})}\n  /* 0927D：這一週（一～日）加上 d（與 extra 的調位日）會不會 7 天都有勤務（營運與 DH 都算） */\n  function wk927D(d){var w=(new Date(d+'T12:00:00Z').getUTCDay()+6)%7;return D(d,-w)}\n  var WK0_927D=wk927D(date);\n  function fullWeek927D(st,d,extra,id){\n    var w0=(d===date)?WK0_927D:wk927D(d),w1=D(w0,6),set={},n=0;\n    function add(x){if(x&&x.date&&x.date>=w0&&x.date<=w1&&!set[x.date]){set[x.date]=1;n++}}\n    add({date:d});(extra||[]).forEach(add);\n    var h=st.days||[];for(var i=Math.max(0,h.length-16);i<h.length;i++)add(h[i]);\n    /* r196 換人／補班加上去的勤務日（r121 自己的紀錄裡沒有） */\n    var ex=id&&window.KGM_EXTRA_DUTY_R927D&&window.KGM_EXTRA_DUTY_R927D[id];if(ex)Object.keys(ex).forEach(function(k){add({date:k})});\n    return n>=7;\n  }");
RL('crew week eligible','kgm-0903b-r121',
"    if(!_turn&&consecDays121(st,date)>=LAW.maxDutyDays)return false;",
"    if(!_turn&&consecDays121(st,date)>=LAW.maxDutyDays)return false;\n    if(fullWeek927D(st,date,null,p.empId))return false;   /* 0927D：每週一定有一整天不排班 */");
RL('crew week reposition','kgm-0903b-r121',
"    function feasible(m,ready,path){return m.depUTC-60>=ready&&m.arrUTC+750<=report&&m.date<date&&!m.noPax&&!m.positioningR830&&!st.days.some(function(d){return d.date===m.date})&&!path.some(function(d){return d.date===m.date})}",
"    function feasible(m,ready,path){return m.depUTC-60>=ready&&m.arrUTC+750<=report&&m.date<date&&!m.noPax&&!m.positioningR830&&!st.days.some(function(d){return d.date===m.date})&&!path.some(function(d){return d.date===m.date})&&!fullWeek927D(st,m.date,path,p.empId)}   /* 0927D：調位日也不能把一週排滿 */");

/* r121：匯出每人已派的勤務日（營運＋DH），並在整份重算時清掉 r196 的補班紀錄 */
RL('crew duty dates export','kgm-0903b-r121',
"window.kgmCrewCursorR121=function(){return CURSOR121};",
"window.kgmCrewCursorR121=function(){return CURSOR121};\n/* 0927D：某人在 r121 已派的勤務日（營運與調位都算），給 r196 換人／補班時檢查「每週一整天不排班」 */\nwindow.kgmCrewDutyDatesR927D=function(id){var st=DUTY121[id],o={};((st&&st.days)||[]).forEach(function(x){if(x&&x.date)o[x.date]=1});return o};");
RL('crew registry reset','kgm-0903b-r121',
"  if(_wipe121){MEM121={};ROLL121={};DUTY121={};LOAD121={};CURSOR121=null;",
"  if(_wipe121){window.KGM_EXTRA_DUTY_R927D={};MEM121={};ROLL121={};DUTY121={};LOAD121={};CURSOR121=null;");
/* r196：換人（一天一班）與真人補班都要守「每週一整天不排班」，並把加上去的日子記下來給 r121 看 */
RL('crew r196 helper','kgm-0907A-r196',
"function capOneFlight196(plan,date){",
"/* 0927D：這個人在 date 那一週（一～日）除了 date 以外是不是已經 6 天都有勤務。\n   來源：r121 已派（營運＋DH）、r196 已補／已換、已經算好的當日班表。 */\nfunction weekFull927D(id,date){\n  try{\n    var w=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7,w0=D(date,-w),w1=D(w0,6),set={},n=0;\n    function add(d){if(d&&d!==date&&d>=w0&&d<=w1&&!set[d]){set[d]=1;n++}}\n    var a=window.kgmCrewDutyDatesR927D?window.kgmCrewDutyDatesR927D(id):{};Object.keys(a).forEach(add);\n    var ex=(window.KGM_EXTRA_DUTY_R927D||{})[id];if(ex)Object.keys(ex).forEach(add);\n    for(var k=0;k<7;k++){var d=D(w0,k);if(d===date||set[d])continue;var pl=PLANMEM196[d];if(!pl)continue;\n      (pl.flights||[]).some(function(f){return ['pilots','cabin'].some(function(kk){return (f[kk]||[]).some(function(q){return q&&q.empId===id})})})&&add(d)}\n    return n>=6;\n  }catch(_){return false}\n}\nfunction regDuty927D(id,date){try{var R=window.KGM_EXTRA_DUTY_R927D=window.KGM_EXTRA_DUTY_R927D||{};(R[id]=R[id]||{})[date]=1}catch(_){}}\nwindow.kgmWeekFullR927D=weekFull927D;\nfunction capOneFlight196(plan,date){");
RL('crew r196 take','kgm-0907A-r196',
"            if(f.fr==='TSA'||f.to==='TSA'){if(!c.tsa)continue}\n            l.splice(i,1);busy[c.empId]=1;c.__poolR196=pools[q];return c;",
"            if(f.fr==='TSA'||f.to==='TSA'){if(!c.tsa)continue}\n            if(weekFull927D(c.empId,date))continue;   /* 0927D：每週一定有一整天不排班 */\n            l.splice(i,1);busy[c.empId]=1;c.__poolR196=pools[q];return c;");
RL('crew r196 swap reg','kgm-0907A-r196',
"      sl.p.swapR196=1;\n    }",
"      sl.p.swapR196=1;\n      regDuty927D(sub.empId,date);   /* 0927D：記下來，r121 之後排班看得到 */\n    }");
RL('crew r196 fill need','kgm-0907A-r196',
"      return !busy[id]&&(WORKED[id]||0)<MAXRUN;",
"      return !busy[id]&&(WORKED[id]||0)<MAXRUN&&!weekFull927D(id,date);   /* 0927D：每週一定有一整天不排班 */");
RL('crew r196 fill reg','kgm-0907A-r196',
"      WORKED[id]=(LASTDAY[id]===D(date,-1)?(WORKED[id]||0)+1:1);LASTDAY[id]=date;\n      n++;",
"      WORKED[id]=(LASTDAY[id]===D(date,-1)?(WORKED[id]||0)+1:1);LASTDAY[id]=date;\n      regDuty927D(id,date);   /* 0927D */\n      n++;");
/* 最外層收尾：當日班表定案時，把「這一週會 7 天都有勤務」的人換成當天沒勤務、這週也沒排滿的同階級同機型族組員。
   原因：r121 會先把整段日期排完，r149／r167／r176 事後才在各日內調換人員，r121 當下看不到那些調換 ——
   實測 K60047 在 r121 的紀錄裡 10/16 沒班，但最後班表 10/16 被換上 KX220，10/18 就變成第 7 天。 */
RL('crew r196 week guard','kgm-0907A-r196',
"      try{capOneFlight196(plan,d)}catch(_){}\n      if(plan)PLANMEM196[d]=plan;",
"      try{capOneFlight196(plan,d)}catch(_){}\n      try{weekGuard927D(plan,d)}catch(_){}   /* 0927D：每週一定有一整天不排班 */\n      if(plan)PLANMEM196[d]=plan;");
RL('crew r196 week guard fn','kgm-0907A-r196',
"function regDuty927D(id,date){",
"function weekGuard927D(plan,date){\n  if(!plan||plan.weekGuardR927D)return 0;\n  plan.weekGuardR927D=1;\n  var w=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7,w0=D(date,-w),days=[];for(var k=0;k<7;k++){var dk=D(w0,k);if(dk!==date)days.push(dk)}\n  /* 這一週其他 6 天：已定案的班表（PLANMEM196）優先，沒定案的用 r121 紀錄，再加調位與 r196 補班 */\n  var fin={};days.forEach(function(dk){var pl=PLANMEM196[dk];if(!pl)return;var m=fin[dk]={};(pl.flights||[]).forEach(function(f){['pilots','cabin'].forEach(function(kk){(f[kk]||[]).forEach(function(q){if(q&&q.empId)m[q.empId]=1})})})});\n  var dh={};Object.keys(S.crewPositioningR121||{}).forEach(function(key){var dk=key.slice(0,10);if(days.indexOf(dk)<0)return;(S.crewPositioningR121[key]||[]).forEach(function(q){if(q&&q.empId)((dh[q.empId]=dh[q.empId]||{})[dk]=1)})});\n  var REG=window.KGM_EXTRA_DUTY_R927D||{},cache={};\n  function busyDays(id){\n    if(cache[id]!=null)return cache[id];\n    var raw=null,n=0;\n    days.forEach(function(dk){\n      var on=false;\n      if(fin[dk])on=!!fin[dk][id];\n      else{if(!raw)raw=window.kgmCrewDutyDatesR927D?window.kgmCrewDutyDatesR927D(id):{};on=!!raw[dk]}\n      if(!on&&dh[id]&&dh[id][dk])on=true;\n      if(!on&&REG[id]&&REG[id][dk])on=true;\n      if(on)n++;\n    });\n    return (cache[id]=n);\n  }\n  var flights=plan.flights||[],busy={},bad=[];\n  flights.forEach(function(f){['pilots','cabin'].forEach(function(kk){(f[kk]||[]).forEach(function(q){if(q&&q.empId)busy[q.empId]=1})})});\n  flights.forEach(function(f){['pilots','cabin'].forEach(function(kk){(f[kk]||[]).forEach(function(q){if(q&&q.empId&&busyDays(q.empId)>=6)bad.push({f:f,q:q})})})});\n  if(!bad.length)return 0;\n  var P={pilots:[],cabin:[]};try{P=window.kgmCrewPoolR121()||P}catch(_){}\n  var UP={FA:['FA','DPU','PU'],DPU:['DPU','PU'],PU:['PU'],CP:['CP'],FO:['FO'],CR:['CR','FO','CP']};\n  var pool={};P.pilots.concat(P.cabin).forEach(function(p){if(busy[p.empId])return;var k=(p.fam||p.rating||'')+'|'+(p.rank||'');(pool[k]=pool[k]||[]).push(p)});\n  var fixed=0,left=0;\n  bad.forEach(function(x){\n    var f=x.f,q=x.q,rank=q.rankCode||q.rank,want=UP[rank]||[rank],sub=null;\n    for(var r=0;r<want.length&&!sub;r++){var l=pool[fam(f.type)+'|'+want[r]]||[];\n      for(var i=0;i<l.length;i++){var c=l[i];if((f.fr==='TSA'||f.to==='TSA')&&!c.tsa)continue;if(busyDays(c.empId)>=6)continue;l.splice(i,1);sub=c;break}}\n    if(!sub){left++;return}\n    busy[sub.empId]=1;\n    q.empId=sub.empId;q.name=sub.name;q.rank=sub.rankZH||sub.rank;q.rankCode=sub.rank;q.seniority=sub.seniority;q.weekGuardR927D=1;\n    regDuty927D(sub.empId,date);fixed++;\n  });\n  plan.weekGuardFixedR927D=fixed;plan.weekGuardLeftR927D=left;\n  return fixed;\n}\nfunction regDuty927D(id,date){");
