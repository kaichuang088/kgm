from common import *
# ══ 1006A #11：「組員和飛行員的班表現在多一個規定：一個月只能去同個航點一次！」 ══
#   「一次」＝一趟從基地出發的行程。同一趟行程裡的後續航段（例如第五航權 TPE→NRT→HNL→NRT→TPE 回程經過 NRT）不算第二次；
#   飛回基地（或同城機場）的航段不算。以日曆月計（航段日期）。調位（DH）不算造訪。
RL('dest once per month','kgm-0903b-r121',
 "    if(!_turn&&st.ready>report)return false;\n",
 "    if(!_turn&&st.ready>report)return false;\n"
 "    /* 1006A #11：一個月只能去同一個航點一次（以從基地出發的一趟行程為單位；同一趟裡的後續航段不算第二次） */\n"
 "    var home6=st.home||p.base||'TPE';\n"
 "    if(f.to!==home6&&!sameCity928(f.to,home6)){\n"
 "      var mo6d=date.slice(0,7),dm6=st.dm6;\n"
 "      if(!dm6||dm6.n!==h.length||dm6.mo!==mo6d){dm6=st.dm6={n:h.length,mo:mo6d,all:{},prev:{}};var cur6=true;\n"
 "        for(var q6d=h.length-1;q6d>=0;q6d--){var x6=h[q6d];if(!x6||!x6.date)continue;if(x6.date.slice(0,7)!==mo6d){if(x6.date<mo6d)break;continue}\n"
 "          if(!x6.deadhead&&x6.to&&x6.to!==home6&&!sameCity928(x6.to,home6)){dm6.all[x6.to]=1;if(!cur6)dm6.prev[x6.to]=1}\n"
 "          if(cur6&&(x6.fr===home6||sameCity928(x6.fr,home6)))cur6=false}}\n"
 "      var seen6=(f.fr===home6||sameCity928(f.fr,home6))?dm6.all:dm6.prev;\n"
 "      if(seen6[f.to])return false;\n"
 "      for(var k6d in seen6){if(sameCity928(k6d,f.to))return false}\n"
 "    }\n")
# 一人一月一航點 → 人數要夠：每個機型族的組員總數至少是「單月單一航點最多造訪人次」的 1.3 倍（不夠的話規則根本排不出來，實測 B777 客艙 BKK 11 月要 3,480 人次、只有 3,096 人）
RL('demand dest floor accrue','kgm-0903b-r121',
 "if(fr!=='TPE'){var k=key+'|'+fr,q=stations[k]||(stations[k]={fam:fam,fr:fr,p:0,c:0});q.p+=comp.n;q.c+=cab}})});",
 "if(fr!=='TPE'){var k=key+'|'+fr,q=stations[k]||(stations[k]={fam:fam,fr:fr,p:0,c:0});q.p+=comp.n;q.c+=cab}\n"
 "    if((fr==='TPE'||fr==='TSA')&&to!=='TPE'&&to!=='TSA'&&f.date){var dk6=String(f.date).slice(0,7)+'|'+fam+'|'+to,dv6=DEST6[dk6]||(DEST6[dk6]={fam:fam,p:0,c:0});dv6.p+=comp.n;dv6.c+=cab}})});   /* 1006A #11 */")
RL('demand dest floor decl','kgm-0903b-r121',
 "  var daily={},stations={},families={},idx=tailTypeIndex();",
 "  var daily={},stations={},families={},idx=tailTypeIndex(),DEST6={};")
RL('demand dest floor apply','kgm-0903b-r121',
 "    f.c=Math.ceil(f.c*7/LAW.roll7d*1.70)+2*f.stationC;\n    out.pilot+=f.p;out.cabin+=f.c;",
 "    f.c=Math.ceil(f.c*7/LAW.roll7d*1.70)+2*f.stationC;\n"
 "    /* 1006A #11：一個月只能去同一個航點一次 → 族內人數至少是單月單一航點造訪人次 × 1.3 */\n"
 "    var mp6=0,mc6=0;Object.keys(DEST6).forEach(function(q){var v=DEST6[q];if(v.fam===k){if(v.p>mp6)mp6=v.p;if(v.c>mc6)mc6=v.c}});\n"
 "    f.destP6=mp6;f.destC6=mc6;f.p=Math.max(f.p,Math.ceil(mp6*1.3));f.c=Math.max(f.c,Math.ceil(mc6*1.3));\n"
 "    out.pilot+=f.p;out.cabin+=f.c;")
RL('reposition attempt cap','kgm-0903b-r121',
 "for(var k=0;k<remaining.length&&list.length<n;k++)if(reposition(remaining[k],f))list.push(remaining[k])}",
 "for(var k=0,tr6=0;k<remaining.length&&list.length<n&&tr6<24;k++){tr6++;if(reposition(remaining[k],f))list.push(remaining[k])}}   /* 1006A：最多試 24 位，不讓一班卡住整天 */")
# ── DH 只能搭 KGM 自己的航班：r210 realDhR1004B 找不到時原本會改用聯營班次（「聯營班次只在引擎清單完全沒有時才從訂位清單補」）。
#    改成：只用 KGM 營運航班；當天與前一天找不到，就往前找到 4 天內落地的 KGM 直飛班次。
RL('dh window var','kgm-0908B-r210',
 "function realDhR1004B(fr,to,date,nextDepUTC){\n  var best=null;",
 "function realDhR1004B(fr,to,date,nextDepUTC){\n  var best=null,WIN6=36*60;   /* 1006A #11：只搭 KGM 航班；找不到時把時間窗放寬到 96 小時 */")
RL('dh window use','kgm-0908B-r210',
 "c.arrUTC<nextDepUTC-36*60)return;",
 "c.arrUTC<nextDepUTC-WIN6)return;")
RL('dh pool own only','kgm-0908B-r210',
 "fs.forEach(function(f){if(f&&!f.positioning&&ok(f.dep)&&ok(f.arr)){var u=utc(f,fd);pool.push({f:f,fd:fd,dep:u[0],arr:u[1]})}});",
 "fs.forEach(function(f){if(f&&!f.positioning&&!f.partner&&!f.operator&&ok(f.dep)&&ok(f.arr)){var u=utc(f,fd);pool.push({f:f,fd:fd,dep:u[0],arr:u[1]})}});")
RL('dh no partner fallback','kgm-0908B-r210',
 "  if(!best){\n    [date,D(date,-1)].forEach(function(fd){\n      var ps=[];try{ps=(sortedFlights(fr,to,fd)||[]).filter(function(f){return f&&f.partner&&f.fr===fr&&f.to===to&&ok(f.dep)&&ok(f.arr)})}catch(_){}\n      ps.forEach(function(f){var u=utc(f,fd);take({code:f.code,date:fd,dep:f.dep,arr:f.arr,dd:+f.dd||0,depUTC:u[0],arrUTC:u[1],op:String(f.operator||'')})});\n    });\n  }",
 "  if(!best){   /* 1006A #11：不再改搭聯營班次；往前找 4 天內的 KGM 直飛 */\n    WIN6=96*60;\n    pool.forEach(function(x){var f=x.f;if(f.fr===fr&&f.to===to)take({code:f.code,date:x.fd,dep:f.dep,arr:f.arr,dd:+f.dd||0,depUTC:x.dep,arrUTC:x.arr,op:'',legs:[{d:x.fd,fr:f.fr,to:f.to}]})});\n"
 "    [D(date,-2),D(date,-3)].forEach(function(fd){var fs=[];try{fs=(window.kgmFlightsOnR121?window.kgmFlightsOnR121(fd):[])||[]}catch(_){}\n"
 "      fs.forEach(function(f){if(f&&!f.positioning&&!f.partner&&!f.operator&&f.fr===fr&&f.to===to&&ok(f.dep)&&ok(f.arr)){var u=utc(f,fd);take({code:f.code,date:fd,dep:f.dep,arr:f.arr,dd:+f.dd||0,depUTC:u[0],arrUTC:u[1],op:'',legs:[{d:fd,fr:f.fr,to:f.to}]})}})});\n  }")
RL('dh via TPE','kgm-0908B-r210',
 "  return best;\n}\nwindow.kgmRealDhR1004B=realDhR1004B;",
 "  /* 1006A #11：KGM 沒有直飛（例如 IST→PEK）就搭兩班 KGM 經 TPE 轉，不再寫一段不存在的「DH」 */\n"
 "  if(!best&&fr!=='TPE'&&to!=='TPE'){\n"
 "    var all6=[];[D(date,-3),D(date,-2),D(date,-1),date].forEach(function(fd){var fs=[];try{fs=(window.kgmFlightsOnR121?window.kgmFlightsOnR121(fd):[])||[]}catch(_){}\n"
 "      fs.forEach(function(f){if(f&&!f.positioning&&!f.partner&&!f.operator&&ok(f.dep)&&ok(f.arr)&&((f.fr===fr&&f.to==='TPE')||(f.fr==='TPE'&&f.to===to))){var u=utc(f,fd);all6.push({f:f,fd:fd,dep:u[0],arr:u[1]})}})});\n"
 "    all6.filter(function(a){return a.f.fr===fr}).forEach(function(a){all6.filter(function(b){return b.f.fr==='TPE'&&b.dep>=a.arr+90}).forEach(function(b){\n"
 "      var dd6=Math.round((Date.parse(new Date((b.arr+tz(to)*60)*60000).toISOString().slice(0,10))-Date.parse(a.fd))/86400000);\n"
 "      take({code:a.f.code+'/'+b.f.code,date:a.fd,dep:a.f.dep,arr:b.f.arr,dd:dd6,depUTC:a.dep,arrUTC:b.arr,op:'',viaR1004B:'TPE',legs:[{d:a.fd,fr:fr,to:'TPE',code:a.f.code},{d:b.fd,fr:'TPE',to:to,code:b.f.code}]})})});\n"
 "  }\n"
 "  return best;\n}\nwindow.kgmRealDhR1004B=realDhR1004B;")
RL('dh register per-leg code','kgm-0908B-r210',
 "        var kk=[lg.d,dh.dhFlightR1004B||'DH',lg.fr,lg.to].join('|');",
 "        var kk=[lg.d,lg.code||dh.dhFlightR1004B||'DH',lg.fr,lg.to].join('|');   /* 1006A：經 TPE 轉的兩班各自登記 */")
RL('dh register flight code','kgm-0908B-r210',
 "dh.dhFlightR1004B?{code:dh.dhFlightR1004B,fr:lg.fr,to:lg.to}:{}",
 "dh.dhFlightR1004B?{code:lg.code||dh.dhFlightR1004B,fr:lg.fr,to:lg.to}:{}")
# 調位（reposition）的搜尋窗：原本從「這個人上次可用的時間」一路掃到報到 —— 在外站閒置好幾週的人，兩段式路徑是 O(n²)，
# 實測 10/28 一天 216 次嘗試花 424 秒。調位實務上只看報到前 72 小時內的班次，最多試 40 組。
RL('repo window direct','kgm-0903b-r121',
 "for(var i=after(direct,st.ready);i<direct.length&&direct[i].depUTC<report;i++)if(feasible(direct[i],st.ready,[])&&commit([direct[i]]))return true;",
 "var w6=Math.max(st.ready,report-4320),n6c=0;   /* 1006A：只看報到前 72 小時，最多試 40 組 */\n    for(var i=after(direct,w6);i<direct.length&&direct[i].depUTC<report&&n6c<40;i++){if(feasible(direct[i],st.ready,[])){n6c++;if(commit([direct[i]]))return true}}")
RL('repo window 2leg','kgm-0903b-r121',
 "for(var ai=after(first,st.ready);ai<first.length&&first[ai].depUTC<report;ai++){var a=first[ai];if(!feasible(a,st.ready,[]))continue;for(var bi=after(second,a.arrUTC+750);bi<second.length&&second[bi].depUTC<report;bi++){var b=second[bi];if(feasible(b,a.arrUTC+750,[a])&&commit([a,b]))return true}}",
 "for(var ai=after(first,w6);ai<first.length&&first[ai].depUTC<report&&n6c<40;ai++){var a=first[ai];if(!feasible(a,st.ready,[]))continue;for(var bi=after(second,a.arrUTC+750);bi<second.length&&second[bi].depUTC<report&&n6c<40;bi++){var b=second[bi];if(feasible(b,a.arrUTC+750,[a])){n6c++;if(commit([a,b]))return true}}}")
save('p_h_dest.js','/* 1006A · 組員：一個月只能去同一個航點一次 */\n')
