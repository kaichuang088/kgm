from common import *
# ══ 1006A #6：松山機場地勤 ══
#   使用者：「松山機場地勤班表有點太閒很多都沒有航班，然後KGM只有國際線沒有國內線所以不會出現在TSA T2，你可松山機場統一三個航班一個櫃檯包含聯營」
#   查到的根因：
#   ① 松山沒有自己的地勤：櫃檯人力從桃園的地勤池抽，被派到松山的 10 個人同一天也在桃園上班（一個人兩個機場）；
#      每人在松山只顧 2 個櫃檯時段，「本站當日」又顯示桃園全體 141 人 → 看起來很閒。
#   ② 松山只有一個櫃檯（6），一天 8 班（含聯營）全擠在同一櫃。
#   改成：松山固定一組 12 人的專屬地勤（從地勤名冊固定挑，不再同時排桃園）；
#        依起飛時間（含聯營）每 3 班一個櫃檯（6 → 5 → 4，第一航廈國際線）；
#        松山櫃檯人數照班數配（3 班 4 人、2 班 3 人、1 班 2 人）；「本站當日」與梯次、全站人力只算松山自己的人。
R('tsa counters + team',
 'function _countersFor(ap,term){\n  if(ap==="TSA")return ["6"];',
 '/* 1006A：松山——依起飛時間（含聯營）每 3 班一個櫃檯（6→5→4），以及松山專屬地勤名單 */\n'
 'var TSAC1006A={},TSAT1006A={k:"",ids:{}};\n'
 'window.kgmTsaCtrR1006A=function(date,code){\n'
 '  if(!TSAC1006A[date]){\n'
 '    var dt=new Date(date+"T12:00:00"),seen={},L=[];\n'
 '    [].concat(FLIGHTS,(S.customFlights||[])).forEach(function(f){if(!f||f.via||f.fr!=="TSA"||seen[f.code])return;try{if(!flyOn(f,dt))return}catch(_){return}seen[f.code]=1;\n'
 '      var d=f.dep;try{var sf=window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,date):f;if(sf&&sf.dep)d=sf.dep}catch(_){}L.push({c:f.code,d:d})});\n'
 '    L.sort(function(a,b){return String(a.d).localeCompare(String(b.d))||String(a.c).localeCompare(String(b.c))});\n'
 '    var m={},C=["6","5","4","3","2","1"];L.forEach(function(x,i){m[x.c]=C[Math.min(C.length-1,Math.floor(i/3))]});\n'
 '    if(Object.keys(TSAC1006A).length>40)TSAC1006A={};TSAC1006A[date]=m;\n'
 '  }\n'
 '  return TSAC1006A[date][code]||"6";\n'
 '};\n'
 'window.kgmTsaGroupsR1006A=function(list,date){var g={},o=[];(list||[]).forEach(function(f){var c=window.kgmTsaCtrR1006A(date,f.code);if(!g[c]){g[c]=[];o.push(c)}g[c].push(f)});return o.map(function(c){return g[c]})};\n'
 'window.kgmTsaTeamR1006A=function(empId){\n'
 '  try{var G=(S.staff||[]).filter(function(x){return x&&x.role==="ground"&&x.active!==false});var k=G.length+"|"+(G[0]&&G[0].empId);\n'
 '    if(TSAT1006A.k!==k){var h=function(s){var x=2166136261;s=String(s);for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0}return x};\n'
 '      var ids={};G.slice().sort(function(a,b){return h(a.empId+"|tsa1006A")-h(b.empId+"|tsa1006A")}).slice(0,12).forEach(function(x){ids[x.empId]=1});TSAT1006A={k:k,ids:ids}}\n'
 '    return !!TSAT1006A.ids[empId]}catch(_){return false}\n'
 '};\n'
 'function _countersFor(ap,term){\n  if(ap==="TSA")return ["6","5","4"];   /* 1006A：松山三個櫃檯，每櫃三班 */')
R('tsa passenger counter',
 "c1=mm(x.dep)-60,pick=pool[0]||'1';",
 "c1=mm(x.dep)-60,pick=(ap==='TSA'&&window.kgmTsaCtrR1006A)?window.kgmTsaCtrR1006A(date,x.code):(pool[0]||'1');   /* 1006A：松山每 3 班一櫃 */")
RL('r74 tsa grouping','kgm-0823o-r74',
 "    groups74(terms[t]).forEach(function(g,i){\n      var counter=String(cs[i%cs.length]||(i+1));\n      var need=g.length>=3?7:(g.length===2?5:3),staff=[];",
 "    ((ap==='TSA'&&window.kgmTsaGroupsR1006A)?window.kgmTsaGroupsR1006A(terms[t],date):groups74(terms[t])).forEach(function(g,i){   /* 1006A：松山依全天順序每 3 班一櫃 */\n"
 "      var counter=(ap==='TSA'&&window.kgmTsaCtrR1006A)?window.kgmTsaCtrR1006A(date,g[0].code):String(cs[i%cs.length]||(i+1));\n"
 "      var need=ap==='TSA'?(g.length>=3?4:(g.length===2?3:2)):(g.length>=3?7:(g.length===2?5:3)),staff=[];   /* 1006A：松山人力照班數配 */")
RL('r102 pool by station','kgm-0902a-r102',
 "        var pool=groundPool102();\n        if(!pool.length)return out;",
 "        var pool=groundPool102();\n"
 "        if(window.kgmTsaTeamR1006A)pool=pool.filter(function(x){return (String(ap).toUpperCase()==='TSA')===window.kgmTsaTeamR1006A(x.empId)});   /* 1006A：松山專屬地勤，不再同一天兩個機場 */\n"
 "        if(!pool.length)return out;")
RL('r138 station','kgm-0905a-r138',
 "      if(String(x.station||x.base||'TPE')!==String(ap))return;",
 "      var st6=(window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(x.empId))?'TSA':String(x.station||x.base||'TPE');   /* 1006A：松山專屬地勤 */\n"
 "      if(st6!==String(ap))return;")
RL('r102 summary station','kgm-0902a-r102',
 "      var R=window.kgmGroundRosterR99(date);\n      return {early:R.by.early.length,",
 "      var R=window.kgmGroundRosterR99(date);\n"
 "      /* 1006A：本站當日只算這個站的人（松山＝松山專屬地勤，桃園不含松山那一組） */\n"
 "      if(window.kgmTsaTeamR1006A){var tsa6=String(S._cr74Ap||'')==='TSA',f6=function(l){return (l||[]).filter(function(x){return tsa6===window.kgmTsaTeamR1006A(x.empId)})};\n"
 "        R={by:{early:f6(R.by.early),mid:f6(R.by.mid),late:f6(R.by.late),off:f6(R.by.off)}};R.total=R.by.early.length+R.by.mid.length+R.by.late.length+R.by.off.length}\n"
 "      return {early:R.by.early.length,")
RL('r163 starts station','kgm-0905b-r163',
 "    var pool=(S.staff||[]).filter(function(x){return x&&x.role==='ground'&&x.active!==false});\n    pool.forEach(function(x){\n      var d=window.kgmGroundDutyR99(x.empId,date);",
 "    var pool=(S.staff||[]).filter(function(x){return x&&x.role==='ground'&&x.active!==false});\n"
 "    if(window.kgmTsaTeamR1006A){var tsa6=String(S._cr74Ap||'')==='TSA';pool=pool.filter(function(x){return tsa6===window.kgmTsaTeamR1006A(x.empId)})}   /* 1006A：只算本站 */\n"
 "    pool.forEach(function(x){\n      var d=window.kgmGroundDutyR99(x.empId,date);")
RL('r174 pool station','kgm-0905c-r174',
 "function pool174(){\n  try{return (S.staff||[]).filter(function(x){return x&&x.role==='ground'&&x.active!==false})}catch(_){return []}",
 "function pool174(){\n  try{var tsa6=String(S._cr74Ap||'')==='TSA';return (S.staff||[]).filter(function(x){return x&&x.role==='ground'&&x.active!==false&&(!window.kgmTsaTeamR1006A||tsa6===window.kgmTsaTeamR1006A(x.empId))})}catch(_){return []}   /* 1006A：全站人力只列本站 */")
# 松山晚上沒有航班（末班 19:20，夜間不開放）→ 松山專屬地勤只排早班／中班，不排晚班。
RL('tsa no late shift','kgm-0901a-r99',
 "  var s=SH99[(wk+hh)%3];\n  return {off:false,k:s.k,",
 "  var s=SH99[(wk+hh)%3];\n"
 "  if(s.k==='late'&&window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(empId))s=SH99[(wk+hh)%2];   /* 1006A：松山夜間無航班，只排早／中班 */\n"
 "  return {off:false,k:s.k,")
# 松山的櫃檯派工要跟本人班表一致：r138 把人分到（班別×航廈）各組時是照員編順序切，沒看本人班表
#   （松山改成專屬人力之後實測 16 個席次有 10 個派給班表不是該班別的人）。松山改成每組只放本人班表就是該班別、當天不休假的人。
#   桃園也有同樣的現象（1004B 就有：2026-10-06 有 161／231），但桃園人力是早／中／晚各三分之一，照班表分會讓尖峰不夠人、
#   櫃檯重疊；要修得改全體地勤的班別比例，超出這次的範圍，先不動，列給使用者決定。
RL('r138 bucket by own duty','kgm-0905a-r138',
 "  var cur=0;\n  buckets.forEach(function(b){\n    var q=Math.max(0,Math.min(quota[b.key]||0,total-cur));\n    b.ids=cands.slice(cur,cur+q);cur+=q;\n  });",
 "  /* 1006A：松山每一組只放「本人班表就是這個班別、當天不休假」的人（原本照員編切，班表跟櫃檯派工對不起來）；桃園照舊 */\n"
 "  var SK6={am:'early',pm:'mid',nt:'late'};\n"
 "  if(String(ap)!=='TSA'){var cur=0;buckets.forEach(function(b){var q=Math.max(0,Math.min(quota[b.key]||0,total-cur));b.ids=cands.slice(cur,cur+q);cur+=q})}   /* 桃園照舊 */\n"
 "  else shKeys.forEach(function(sh){\n"
 "    var bs=buckets.filter(function(b){return b.sh===sh});if(!bs.length)return;\n"
 "    var M=cands.filter(function(id){var d=null;try{d=window.kgmGroundDutyR99(id,date)}catch(_){}return !!(d&&!d.off&&d.k===SK6[sh])});\n"
 "    /* 同一班別的人分給各航廈：先保證每組尖峰需要的人數，剩下的依席次比例分 */\n"
 "    var sumP=0,sumX=0;bs.forEach(function(b){sumP+=b.peak;sumX+=Math.max(0,b.want-b.peak)});\n"
 "    var room=M.length-sumP,cur6=0;\n"
 "    bs.forEach(function(b,i){\n"
 "      var q;if(room<0)q=Math.floor(M.length*b.peak/(sumP||1));\n"
 "      else q=b.peak+(sumX?Math.floor(room*Math.max(0,b.want-b.peak)/sumX):0);\n"
 "      if(i===bs.length-1)q=M.length-cur6;\n"
 "      q=Math.max(0,Math.min(q,M.length-cur6));b.ids=M.slice(cur6,cur6+q);cur6+=q;\n"
 "    });\n"
 "  });")
save('p_h_tsa.js','/* 1006A · 松山地勤：專屬人力、每 3 班一櫃 */\n')
