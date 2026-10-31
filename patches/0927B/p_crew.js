/* 0927B · 組員：休息依民航局規定；客艙組員最低人數＝民航局下限＋1～2 位 */

/* ── Q2：客艙組員人數，一份來源 ── */
R('cabin crew fn',
 "// ── Admin: AI crew scheduling ──\n// 客艙下限依 1:50 法規 = ceil(座位/50);再 +1 營運餘裕。機師航時 <8h=2、≥8h=3。\nvar _CREW_REQ={A388:{p:4,c:12},B779:{p:3,c:9},A35K:{p:3,c:8},A359:{p:3,c:7},B78X:{p:3,c:8},B789:{p:2,c:7},A21N:{p:2,c:4},A339:{p:3,c:8},EQV:{p:3,c:7}};\nfunction _cabinMin(acft){",
 "// ── Admin: AI crew scheduling ──\n// 客艙下限依 1:50 法規 = ceil(座位/50);再 +1 營運餘裕。機師航時 <8h=2、≥8h=3。\n/* 0927B：客艙組員人數改成一份來源（組員排班、AI 排班、航班組員名單都讀這一支）。\n   民航局《航空器飛航作業管理規則》：載客座位 20–50 座派 1 名以上、51–100 座派 2 名以上，\n   每增加 50 座再加派 1 名 —— 也就是 ceil(座位數／50)。\n   使用者：「最低人數依照民航局規定，再加上 1–2 位」→ 雙走道廣體 +2、單走道窄體 +1。 */\nfunction kgmCabinCrewR927(acft){\n  var t=String(acft||'').toUpperCase(),a=(typeof AC!=='undefined'&&(AC[t]||AC[t.replace(/[LR]$/,'')]))||null;\n  var seats=(a&&+a.seats)||300;\n  var legal=seats<20?0:Math.max(1,Math.ceil(seats/50));\n  var wide=/^(A388|B77|B78|A35|A33|EQV)/.test(t)||seats>=250;\n  var extra=wide?2:1;\n  return {type:t,seats:seats,legal:legal,extra:extra,crew:legal+extra};\n}\nwindow.kgmCabinCrewR927=kgmCabinCrewR927;\nvar _CREW_REQ={A388:{p:4,c:13},B779:{p:3,c:10},A35K:{p:3,c:9},A359:{p:3,c:8},B78X:{p:3,c:9},B789:{p:2,c:8},A21N:{p:2,c:6},A339:{p:3,c:8},EQV:{p:3,c:8}};/* 0927B：c 與 kgmCabinCrewR927 一致 */\nfunction _cabinMin(acft){\n  return kgmCabinCrewR927(acft).crew;   /* 0927B：民航局下限＋1～2 位 */");
R('ai sched cabin','    req.c=Math.max(req.c,_cabinMin(acft));','    req.c=_cabinMin(acft);   /* 0927B：民航局下限＋1～2 位 */');
R('roster cabin','req.p=hrs>=8?3:2;req.c=Math.max(req.c,_cabinMin(f.acft));','req.p=hrs>=8?3:2;req.c=_cabinMin(f.acft);');
RL('r121 cabinSize','kgm-0903b-r121',"function cabinSize121(type){\n  var t=String(type||'').toUpperCase();\n",
 "function cabinSize121(type){\n  var t=String(type||'').toUpperCase();\n  /* 0927B：客艙人數＝民航局下限 ceil(座位/50)＋1～2 位（一份來源 kgmCabinCrewR927） */\n  try{if(typeof window.kgmCabinCrewR927==='function')return window.kgmCabinCrewR927(t).crew}catch(_){}\n");
R('commercial crew',"    var req=COMMERCIAL_CREW_P[acft]||COMMERCIAL_CREW_P.EQV,need=req.total;",
 "    var req=Object.assign({},COMMERCIAL_CREW_P[acft]||COMMERCIAL_CREW_P.EQV);\n    /* 0927B：客艙人數跟組員排班同一份來源（民航局下限＋1～2 位） */\n    try{if(window.kgmCabinCrewR927){req.c=window.kgmCabinCrewR927(acft).crew;req.total=req.p+req.c}}catch(_){}\n    var need=req.total;");

/* ── Q1：組員休息依民航局規定（不再固定做四休二） ──
   《航空器飛航作業管理規則》：任何連續 7 日內至少連續 30 小時休息；
   客艙組員執勤後休息：FDP ≤8h → 9h、8–12h → 12h、12–16h → 20h、>16h → 24h。
   公司原本的「短程 12 小時、長程 48 小時」比法規嚴，保留。 */
RL('r196 maxrun','kgm-0907A-r196',"var MAXRUN=4;",
 "var MAXRUN=6;   /* 0927B：民航局「任連續 7 日至少連續 30 小時休息」→ 最多連續 6 個執勤日（原本固定做四休二） */\n/* 0927B：真人補班前，依民航局規定檢查休息 —— 用前 6 天已排好的班表（含補班）逐段算 */\nfunction restNeed927(fdp,block){\n  var caa=fdp<=480?540:fdp<=720?720:fdp<=960?1200:1440;\n  var co=(block>=(+window.KGM_LONGHAUL_MIN_R922||480))?(+window.KGM_LONGHAUL_REST_R922||2880):(+window.KGM_SHORTHAUL_REST_R922||720);\n  return Math.max(caa,co);\n}\nfunction duties927(id,date){\n  var out=[],known=true;\n  for(var k=6;k>=1;k--){\n    var p=PLANMEM196[D(date,-k)];\n    if(!p){known=false;continue}\n    var legs=[];\n    (p.flights||[]).forEach(function(f){['pilots','cabin'].forEach(function(kk){(f[kk]||[]).forEach(function(q){if(q&&q.empId===id)legs.push(f)})})});\n    if(!legs.length)continue;\n    legs.sort(function(a,b){return (+a.depUTC||0)-(+b.depUTC||0)});\n    var rep=(+legs[0].depUTC||0)-60,rel=(+legs[legs.length-1].arrUTC||0)+30,blk=0;\n    legs.forEach(function(f){blk=Math.max(blk,+f.block||0)});\n    out.push({report:rep,release:rel,fdp:rel-rep,block:blk});\n  }\n  return {list:out,known:known};\n}\nfunction caaOk927(id,a,b,date){\n  try{\n    var h=duties927(id,date);if(!h.known)return true;          /* 前幾天還沒算，交給 MAXRUN 擋 */\n    var rep=(+a.depUTC||0)-60,rel=(+b.arrUTC||0)+30;\n    var last=h.list[h.list.length-1];\n    if(last&&rep-last.release<restNeed927(last.fdp,last.block))return false;\n    /* 以這一段解除時間往回 7 日，要找得到一段連續 30 小時以上的休息 */\n    var from=rel-7*1440,cur=from,best=0;\n    h.list.concat([{report:rep,release:rel}]).forEach(function(x){\n      if(x.release<=from)return;\n      best=Math.max(best,x.report-cur);cur=Math.max(cur,x.release);\n    });\n    return best>=1800;\n  }catch(_){return true}\n}\nwindow.kgmCrewCaaOkR927=caaOk927;");
RL('r196 comment','kgm-0907A-r196',"   一對一換掉同機型、同階級的虛擬組員。做四休二，連上四天就強制休，\n   所以不會變成每個人天天飛。",
 "   一對一換掉同機型、同階級的虛擬組員。做四休二，連上四天就強制休，\n   所以不會變成每個人天天飛。\n   0927B：使用者要求依民航局規定 —— 改成「任連續 7 日至少連續 30 小時休息」\n   ＋「執勤後依 FDP 休息」（見 caaOk927），不再固定做四休二。");
RL('r196 need comment','kgm-0907A-r196',"    /* 需要補班的真人：今天沒班、而且不是剛連上四天 */","    /* 需要補班的真人：今天沒班、而且連續執勤日還沒到上限（0927B：依民航局規定，最多 6 天） */");
RL('r196 pair caa','kgm-0907A-r196',"          if(s2.f.fr!==sl.f.to||s2.f.to!==base921)continue;\n","          if(s2.f.fr!==sl.f.to||s2.f.to!==base921)continue;\n          if(!caaOk927(id,sl.f,s2.f,date))continue;   /* 0927B：民航局休息規定 */\n");
RL('r196 label','kgm-0907A-r196',"      note.textContent=z()?'航段制・長短程混排・落地點串接・做四休二錯開・長程落地後隔天強制休'\n                          :'Sector-based, mixed haul, location chaining, 4-on-2-off, forced rest after long haul';",
 "      note.textContent=z()?'航段制・長短程混排・落地點串接・依民航局規定：任 7 日內至少連續 30 小時休息・長程落地後隔天強制休'\n                          :'Sector-based, mixed haul, location chaining, CAA rule: 30 h continuous rest in any 7 days, forced rest after long haul';");
R('legacy label','航段制・長短程混排・落地點串接・做四休二錯開・長程落地後隔天強制休</span>','航段制・長短程混排・落地點串接・依民航局規定：任 7 日內至少連續 30 小時休息・長程落地後隔天強制休</span>');
/* 舊版 S.crewSched（請假替補、配員檢查還在讀）同步改成每 7 日至少一整天休假 */
R('legacy sched A comment','長程後隔天強制休、做四休二錯開。','長程後隔天強制休；0927B：依民航局規定每 7 日至少一整天休假（連續 30 小時以上）。');
R('legacy sched A phase',"    var loc=\"TPE\",lst=[],restNext=false;\n    var phase=si%6;","    var loc=\"TPE\",lst=[],restNext=false;\n    var phase=si%7;");
R('legacy sched A rule',"      if((d+phase)%6>=4){lst.push({d:date,c:\"休\",loc:loc});continue;}","      if((d+phase)%7>=6){lst.push({d:date,c:\"休\",loc:loc});continue;}/* 0927B：民航局 7 日 30 小時 */");
R('legacy sched B phase',"      var loc='TPE',restUntil=-Infinity,lst=[],phase=si%6;","      var loc='TPE',restUntil=-Infinity,lst=[],phase=si%7;");
R('legacy sched B rule',"if((loc==='TPE'||loc==='TSA')&&((di+phase)%6>=4)&&restUntil<=dayStart)","if((loc==='TPE'||loc==='TSA')&&((di+phase)%7>=6)&&restUntil<=dayStart)");
