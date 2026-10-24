/* 0927C · 機隊：為什麼航班明明一段接一段，還會需要調機？
   追到兩個真正的原因（0927B notes 寫的「時刻表進出不平衡」是錯的，那個數字把調機也算進去了）：
   ① r136 兩種機型共飛的航線（KX80/79、KX16/15、KX82/81、KX96/95、KX50/49）依「航班號＋日期」
      各自雜湊選機型，去程和回程互不相干。例：11/02 KX80 TPE→BUD 派 B789，這架飛機要飛的回程是
      11/03 00:45 的 KX79，雜湊卻選了 A339L → B789 被困在布達佩斯，只能等別的班次或調機。
   ② r72 nextLegOf 找多段班後段時，只檢查「第一個時間接得上的日子」那天有沒有飛，沒飛就放棄。
      冬季 KX29 YYZ→YVR 起飛時間改成 08:25，同一天 12:05 的 YVR→TPE 時間接得上、但那天沒飛，
      整個冬季（10/26～3/27）KX29 前段都找不到後段 → 飛機停在溫哥華／多倫多，只能拆開用調機補。 */

/* ── ① 共飛航線：回程機型跟著「飛進來的那一架」 ── */
RL('c mixed pair','kgm-0905a-r136',
"        if(l.length){\n          var h=0,s=String(code)+'|'+String(date);",
"        if(l.length){\n          /* 0927C：不是從台北出發的那一段，機型＝把飛機帶進這一站的那一段（同號前段優先，其次對號去程） */\n          var pv=DEPTH927C<6?prevLeg927C(k,date):null;\n          if(pv){DEPTH927C++;try{return fn(pv.code,pv.date,pv.fr,pv.to)}finally{DEPTH927C--}}\n          var h=0,s=String(code)+'|'+String(date);");
RL('c mixed pair fn','kgm-0905a-r136',
"/* ── ④ 機型顯示「A21N/B78X」 ──────────────────────────────",
"/* 0927C：兩種機型共飛的航線，回程要跟去程同一架飛機。原本回程自己用日期雜湊選機型，\n   去程 B789、回程 A339L 的日子，B789 就被困在外站（一年一千多段調機的主因）。\n   這裡找出「把飛機帶進這一站的那一段」：同航班號的前段優先（KX81 ATH→TPE ← KX81 EWR→ATH），\n   沒有才找對號去程（KX79 ← KX80）；落地＋55 分（最短過站）之後才能接，先到的先飛。\n   台北出發的那一段維持原本的日期雜湊，所以兩種機型仍然各飛一半。 */\nvar PAIRC927C={},DEPTH927C=0;\nwindow.kgmMixedPairClearR927C=function(){PAIRC927C={}};\nfunction num927C(c){var m=/(\\d+)/.exec(String(c||''));return m?+m[1]:-1}\nfunction day927C(d,k){return new Date(Date.parse(d+'T00:00:00Z')+k*864e5).toISOString().slice(0,10)}\nfunction prevLeg927C(k,date){\n  if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(date)))return null;\n  var ck=k+'|'+date;\n  if(Object.prototype.hasOwnProperty.call(PAIRC927C,ck))return PAIRC927C[ck];\n  var res=null;\n  try{\n    var p=k.split('|');\n    var L=p[1]==='TPE'?null:rows(p[0],p[1],p[2])[0];\n    /* 經停整段列（KX49 SYD→TPE）沒有自己的實體航段：跟同一天同號、同起點的第一段（KX49 SYD→BKK）同機型 */\n    if(!L&&p[1]!=='TPE')Object.keys(MIXED136).some(function(q){var r=q.split('|');\n      if(q!==k&&r[0]===p[0]&&r[1]===p[1]&&rows(r[0],r[1],r[2])[0]){res={code:r[0],fr:r[1],to:r[2],date:date};return true}});\n    if(L){\n      var sea=window.kgmSeasonFlightR48||function(f){return f};\n      var n0=num927C(p[0]),same=[],pair=[];\n      Object.keys(MIXED136).forEach(function(q){\n        var r=q.split('|');if(q===k||r[2]!==p[1])return;\n        if(r[0]===p[0])same.push(r);else if(n0>=0&&Math.abs(num927C(r[0])-n0)===1)pair.push(r);\n      });\n      /* 先到先飛（跟排班器的「等最久的先派」一致）：從 14 天前開始模擬這一站的進出，\n         每一班 L 起飛時，派給已落地＋55 分、最早到的那一架。這樣 KX96（二四五日）／KX95（一三五六）\n         這種班期不對稱的航線也是一班配一班，不會兩班回程搶同一架去程。 */\n      var ev=[],cand=same.length?same:pair,Lrow=L;\n      for(var j=14;j>=-1;j--){\n        var d2=day927C(date,-j);\n        cand.forEach(function(r){\n          var P=rows(r[0],r[1],r[2])[0];if(!P)return;\n          var Ps=sea(P,d2),on=true;try{on=flyOn(Ps,new Date(d2+'T12:00:00'))}catch(_){on=true}\n          if(on)ev.push({t:_fUTC(Ps,d2,'arr')+55,a:{code:r[0],fr:r[1],to:r[2],date:d2}});\n        });\n        if(j>=0){var Ls=sea(Lrow,d2),on2=true;try{on2=flyOn(Ls,new Date(d2+'T12:00:00'))}catch(_){on2=true}\n          if(on2||d2===date)ev.push({t:_fUTC(Ls,d2,'dep'),l:d2});}\n      }\n      ev.sort(function(x,y){return x.t-y.t||(x.a?-1:1)-(y.a?-1:1)});\n      var q=[];\n      for(var e=0;e<ev.length;e++){\n        if(ev[e].a){q.push(ev[e].a);continue}\n        var got=q.length?q.shift():null;\n        if(ev[e].l===date){res=got;break}\n      }\n    }\n  }catch(_){res=null}\n  PAIRC927C[ck]=res;\n  return res;\n}\nwindow.kgmMixedPrevLegR927C=function(code,fr,to,date){return prevLeg927C(code+'|'+fr+'|'+to,date)};\n\n/* ── ④ 機型顯示「A21N/B78X」 ──────────────────────────────");
/* ── ② 多段班後段：往後找「時間接得上、而且那一天真的有飛、還沒被別班前段接走」的第一天 ── */
RL('c nextleg helper','kgm-0823o-r72',
"  function nextLegOf(x){\n    if(x._nx!==undefined)return x._nx;",
"  /* 0927C：多段班後段原本只看「第一個時間接得上的日子」有沒有飛，沒飛就放棄 ——\n     冬季 KX29 YYZ→YVR 整季都接不到 YVR→TPE。改成往後最多 3 天找第一個「有飛、而且\n     還沒被別天的前段接走」的後段（SECUSE927C 記錄已被接走的後段，一班後段只給一架）。 */\n  var SECUSE927C={};\n  function onDay927C(c,cd){try{return !!flyOn(c,new Date(cd+'T12:00:00'))}catch(_){return true}}\n  function nextLegOf(x){\n    if(x._nx!==undefined)return x._nx;");
RL('c nextleg loop','kgm-0823o-r72',
"      while(dep0<x.arrAbs+75&&k0<3){k0++;",
"      while(k0<3&&(dep0<x.arrAbs+75||!onDay927C(c,cd)||SECUSE927C[raw.code+'|'+raw.fr+'|'+raw.to+'|'+cd])){k0++;");
RL('c nextleg used','kgm-0823o-r72',
"      if(dep0<x.arrAbs+75)continue;\n      var cd=D(w0,x.di+k0),on=true;",
"      if(dep0<x.arrAbs+75)continue;\n      if(SECUSE927C[raw.code+'|'+raw.fr+'|'+raw.to+'|'+cd])continue;\n      var cd=D(w0,x.di+k0),on=true;");
RL('c nextleg claim','kgm-0823o-r72',
"    if(!sec)return null;\n    return (x._nx={f:sec,",
"    if(!sec)return null;\n    SECUSE927C[sec.code+'|'+sec.fr+'|'+sec.to+'|'+D(w0,x.di+secK)]=1;   /* 0927C：這班後段已經有前段接走 */\n    return (x._nx={f:sec,");
RL('c clear pair cache','kgm-0823o-r72',
"window.kgmClearRotationCacheR72=function(){LEGC72={};DAYC72={};ROT72={};THRU72=null;SEC72=null;flight72.cache={}};",
"window.kgmClearRotationCacheR72=function(){LEGC72={};DAYC72={};ROT72={};THRU72=null;SEC72=null;flight72.cache={};\n  try{if(window.kgmMixedPairClearR927C)window.kgmMixedPairClearR927C()}catch(_){}};   /* 0927C：共飛機型配對也要重算 */");

/* ── 更正 0927B 的錯誤說明 ── */
RL('c fix 0927B comment','kgm-0823o-r72',
"  /* 0927B：B789 在多倫多等 8～10 天、B78X 停在沖繩一整個月的原因。\n     第一輪排班「外站只能由剛飛對號去程的同一架接回」，而時刻表本身進出不平衡\n     （例：60 天內 B789 飛進 YYZ 99 班、飛出的營收班只有 77 班），多出來的飛機只能排隊，",
"  /* 0927B：B789 在多倫多等 8～10 天、B78X 停在沖繩一整個月的原因。\n     0927C 更正：下面「時刻表進出不平衡」是錯的（那個數字把調機也算進去了，時刻表是每週進 9 班、出 9 班）。\n     真正的原因是共飛航線回程機型各自雜湊（r136 prevLeg927C）與冬季後段接不上（上面 nextLegOf），0927C 已修；\n     這一段切開保留當作最後的保險。以下是 0927B 原文：\n     第一輪排班「外站只能由剛飛對號去程的同一架接回」，而時刻表本身進出不平衡\n     （例：60 天內 B789 飛進 YYZ 99 班、飛出的營收班只有 77 班），多出來的飛機只能排隊，");

/* ── ④ 首爾線「每天最多一架 A388」：一架＝去程＋它飛回來的對號班 ──
   原本是「一天只留排序第一的那一段 A388」，排序第一的常常是回程（KX103 ICN→TPE），
   去程 KX104 被換成 B779 → A388 每天空機飛去首爾、B779 每天空機飛回台北（一年各 285 段）。 */
RL('c icn pair','kgm-0905a-r136',
"        /* 一天只留第一班 A388，其餘換成 B779 */\n        if(first&&first!==me)return 'B779';",
"        /* 一天只留第一班 A388，其餘換成 B779 */\n        if(first&&first!==me){\n          /* 0927C：「每天最多一架 A388」是一架飛機 —— 同一架飛出去的班和飛回來的對號班（KX104↔KX103）都保留 A388 */\n          if(me===icnPartner927C(first))return r;\n          return 'B779';\n        }");
RL('c icn partner fn','kgm-0905a-r136',
"function icnCap136(){\n  if(window.kgmIcnCapR136)return false;",
"/* 0927C：首爾線對號班（偶數去、奇數回：KX104 TPE→ICN ↔ KX103 ICN→TPE） */\nfunction icnPartner927C(k){\n  var p=String(k||'').split('|'),m=/(\\d+)/.exec(p[0]||'');if(!m||p.length<3)return '';\n  var n=+m[1],q=n%2?n+1:n-1;\n  return p[0].replace(/\\d+/,String(q))+'|'+p[2]+'|'+p[1];\n}\nfunction icnCap136(){\n  if(window.kgmIcnCapR136)return false;");
RL('c icn audit','kgm-0905a-r136',
"      var d=addDays(todayISO(),i),dt=new Date(d+'T12:00:00'),n=0;\n      FLIGHTS.forEach(function(f){\n        if(!f||f.via||f.partner)return;\n        if(f.fr!=='ICN'&&f.to!=='ICN')return;\n        if(!flyOn(f,dt))return;\n        tot++;\n        if(acftOfFlight(f.code,d,f.fr,f.to)==='A388')n++;\n      });",
"      var d=addDays(todayISO(),i),dt=new Date(d+'T12:00:00'),n=0,a388=[];\n      FLIGHTS.forEach(function(f){\n        if(!f||f.via||f.partner)return;\n        if(f.fr!=='ICN'&&f.to!=='ICN')return;\n        if(!flyOn(f,dt))return;\n        tot++;\n        if(acftOfFlight(f.code,d,f.fr,f.to)==='A388')a388.push(f.code+'|'+f.fr+'|'+f.to);\n      });\n      /* 0927C：算「架」—— 回程的對號去程也是 A388 就是同一架 */\n      n=a388.filter(function(k){return !(k.split('|')[1]==='ICN'&&a388.indexOf(icnPartner927C(k))>=0)}).length;");

/* ── ⑤ EQV 去回程配對要用「最外層」的去程機型 ──
   r72 已經有「EQV 回程跟去程同機型」的配對表（PAIR72，含隔天回程 k=1），但它只問內層 —— 外面還有
   A330 版本分配、首爾／關西／新千歲／沖繩 A388 上限等好幾層包裝，去程實際派出去的機型跟回程抄到的不一樣
   （例：9/27 KX126 TPE→KIX 是 A339L，9/28 的回程 KX125 卻是 A21N），60 天內日韓線就有上百組對不上。 */
RL('c eqv pair outer','kgm-0823o-r72',
"              try{t=_ac72.call(this,P.lead,D(date,-P.k))}finally{_busy72=0}",
"              /* 0927C：去程問最外層（含所有上限規則）＝實際派出去的那一架；回程跟它一樣 */\n              try{var top72=(typeof window.acftOfFlight==='function')?window.acftOfFlight:_ac72;t=top72.call(this,P.lead,D(date,-P.k),P.to,P.fr)}finally{_busy72=0}");
