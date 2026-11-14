/* ══ 1108A N12：換機型要換機長（使用者：「圖二調換飛機有要通知換機長喔 然後原本的機長照常拿喔」——每日異動 KX138/137 A339R→B779「當日調度自動換機」）
   實測（tests/cx38.js 之前的探測）：組員班表算好之後機隊又換機（自動換機、維修改派、人工換機），班表上的機師還是原機型族
   （例 11-13 KX138 班表是 B777 機師、現在飛機是 A339R；11-10 KX96 現在是 A35K、機上 3 位 B777 機師）——沒有人被通知、也沒有換人。
   · 背景每 90 秒看今天起 8 天「已經算好」的班表：每一班現在的機型（acftOfFlight）跟機上機師的機型族不同 → 換成同職級、
     新機型族、當天與前後一天都沒有勤務的機師（同一位原機師當天多段＝同一位接手；先用待命名單）；結果存 S.crewSwapR1108A（kgm38_cswap）。
   · 班表（kgmCrewPlanR121 最外層、kgmRosterR196）照換：接手的人多一段「換機型接手」、原機師那一段標「換機型改派，照常計薪」。
   · 通知：原機師與接手機師各一則員工通知（notifyStaff）；每日異動的換機那一列寫機長改派。
   · 原機師照常計薪：薪資是固定月薪，跟飛不飛有關的只有休息日出勤加給（kgmRestDayWorkR927C）→ 算這個人的加給時，那一段照原排班算。
   · 客艙組員不分機型（N11），不用換。 */
(function(){
  if(window.__cx38)return;window.__cx38=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function FM(t){try{return window.kgmTypeFamilyR121?window.kgmTypeFamilyR121(t):t}catch(_){return t}}
  function H(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function ST(){var x=S.crewSwapR1108A;if(!x||typeof x!=='object'||Array.isArray(x))x=S.crewSwapR1108A={recs:{}};x.recs=x.recs||{};return x}
  function key(d,f){return d+'|'+f.code+'|'+f.fr+'|'+f.to}
  var RAW=null;   /* 原始（未換人）的班表函式：偵測要看原本的機師 */
  var POOLIX=null,POOLSIG='';function pool(){var P=null;try{P=kgmCrewPoolR121()}catch(_){}if(!P)return null;var sig=(P.pilots||[]).length;if(POOLIX&&POOLSIG===sig)return POOLIX;
    var by={},fam={};(P.pilots||[]).forEach(function(p){by[p.empId]=p;var k=(p.fam||p.rating)+'|'+p.rank+'|'+(p.base||'TPE');(fam[k]=fam[k]||[]).push(p)});POOLIX={by:by,fam:fam};POOLSIG=sig;return POOLIX}
  function has(d){try{return !!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(d))}catch(_){return false}}
  function rawPlan(d){try{return (RAW||window.kgmCrewPlanR121)(d)}catch(_){return null}}
  function usedOn(d){var u={};if(!has(d))return u;var p=rawPlan(d);((p&&p.flights)||[]).forEach(function(f){(f.pilots||[]).forEach(function(c){if(c)u[c.empId]=1})});
    var R=ST().recs;Object.keys(R).forEach(function(k){if(k.slice(0,10)!==d)return;(R[k].swaps||[]).forEach(function(s){u[s.inId]=1})});return u}
  function actType(f,d){try{return acftOfFlight(f.code,d,f.fr,f.to)||f.type}catch(_){return f.type}}
  function scanDay(d){var px=pool();if(!px||!has(d))return 0;var p=rawPlan(d);if(!p||!p.flights)return 0;var R=ST().recs,n=0,busy=null,mapOld={};
    Object.keys(R).forEach(function(k){if(k.slice(0,10)!==d)return;(R[k].swaps||[]).forEach(function(s){mapOld[s.outId]=s.inId})});
    p.flights.forEach(function(f){if(!f||!f.code)return;var k=key(d,f);if(R[k])return;var at=actType(f,d),nf=FM(at);if(!nf||!(f.pilots||[]).length)return;
      var bad=(f.pilots||[]).filter(function(c){var q=c&&px.by[c.empId];return q&&(q.fam||q.rating)!==nf});if(!bad.length)return;
      if(!busy){busy=usedOn(d);var b1=usedOn(AD(d,-1)),b2=usedOn(AD(d,1));Object.keys(b1).forEach(function(x){busy[x]=1});Object.keys(b2).forEach(function(x){busy[x]=1})}
      var swaps=[];bad.forEach(function(c){var q=px.by[c.empId],inId=mapOld[c.empId];
        if(!inId){var L=(px.fam[nf+'|'+q.rank+'|'+(q.base||'TPE')]||[]).filter(function(x){return !busy[x.empId]&&!(window.kgmCrewOffR928&&window.kgmCrewOffR928(x.empId,d))});
          if(!L.length)L=(px.fam[nf+'|'+q.rank+'|TPE']||[]).filter(function(x){return !busy[x.empId]});
          if(!L.length)return;L.sort(function(a,b){return H(d+f.code+a.empId)-H(d+f.code+b.empId)});inId=L[0].empId;busy[inId]=1;mapOld[c.empId]=inId}
        var ni=px.by[inId]||{};swaps.push({outId:c.empId,outName:c.name||q.name,inId:inId,inName:ni.name||inId,rank:q.rank,pos:c.posCode||c.pos||''})});
      if(!swaps.length)return;
      var rec=R[k]={date:d,code:f.code,fr:f.fr,to:f.to,dep:f.dep,arr:f.arr,dd:+f.dd||0,block:+f.block||0,fromType:f.type,toType:at,swaps:swaps,at:new Date().toISOString()};n++;
      var md=d.slice(5).replace('-','/');
      swaps.forEach(function(s){try{if(typeof notifyStaff==='function'){
          notifyStaff(s.outId,(z()?'【換機型・機長改派】'+md+' '+f.code+' '+f.fr+'→'+f.to+' 由 '+f.type+' 改為 '+at+'（機型族不同），本班改由 '+s.inName+' 執飛，您不需報到；本班照原排班計薪。':'[Aircraft change] '+md+' '+f.code+' now '+at+'; '+s.inName+' operates instead. You are paid as rostered.'));
          notifyStaff(s.inId,(z()?'【換機型・接手】'+md+' '+f.code+' '+f.fr+'→'+f.to+' '+(f.dep||'')+' 起飛，機型 '+at+'，請您接手執飛（原排 '+s.outName+'）。':'[Aircraft change] Please operate '+md+' '+f.code+' ('+at+') instead of '+s.outName+'.'))}}catch(_){}})});
    return n}
  function trim(){var R=ST().recs,t=AD(T(),-35);Object.keys(R).forEach(function(k){if(k.slice(0,10)<t)delete R[k]})}
  function tick(){try{if(!window.KGM_FULLDONE_1006A)return;var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
      var t=T(),n=0;for(var i=0;i<8;i++)n+=scanDay(AD(t,i));trim();if(n){try{save()}catch(_){}}window.KGM_CSWAP_R1108A=Object.keys(ST().recs).length}catch(e){try{console.warn('cx38',e)}catch(_){}}}
  window.kgmCrewSwapScanR1108A=tick;
  /* 班表最外層：照換 */
  function apply(d,r){try{if(!r||!r.flights||!d)return r;var R=ST().recs,pf=window.__k38PayFor;if(!Object.keys(R).length)return r;
      r.flights.forEach(function(f){var x=f&&R[key(d,f)];if(!x)return;f.typeSwapR1108A={from:x.fromType,to:x.toType};f.type=x.toType;
        x.swaps.forEach(function(s){if(pf&&pf===s.outId)return;(f.pilots||[]).forEach(function(c,i){if(c&&c.empId===s.outId){f.pilots[i]=Object.assign({},c,{empId:s.inId,name:s.inName,swapForR1108A:s.outId,swapOutNameR1108A:s.outName})}})})})}catch(_){}return r}
  function wrapPlan(){var O=window.kgmCrewPlanR121;if(typeof O!=='function'||O.__cx38)return;if(!RAW)RAW=O;else RAW=O;
    var w=function(d){return apply(d||T(),O.apply(this,arguments))};try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__cx38=1;window.kgmCrewPlanR121=w}
  /* 個人班表：原機師那段標改派、接手的人多一段 */
  function wrapRoster(){var O=window.kgmRosterR196;if(typeof O!=='function'||O.__cx38)return;
    var w=function(empId){var r=O.apply(this,arguments);try{if(!empId||!Array.isArray(r))return r;var R=ST().recs,ks=Object.keys(R);if(!ks.length)return r;var zh=z();
        r.forEach(function(x){if(!x||!x.date)return;ks.forEach(function(k){if(k.slice(0,10)!==x.date)return;var rec=R[k];(rec.swaps||[]).forEach(function(s){
          if(s.outId===empId&&window.__k38PayFor!==empId){var n0=(x.legs||[]).length;x.legs=(x.legs||[]).filter(function(l){return !(l&&!l.deadhead&&l.code===rec.code&&l.fr===rec.fr)});if(x.legs.length<n0){x.blockMin=Math.max(0,(+x.blockMin||0)-(+rec.block||0))}
            (x.paidSwapR1108A=x.paidSwapR1108A||[]).push(rec.code+' '+rec.fr+'→'+rec.to+'（'+rec.fromType+'→'+rec.toType+'）'+(zh?' 改由 '+s.inName+' 執飛，照常計薪':' operated by '+s.inName+'; paid as rostered'))}
          if(s.inId===empId&&!(x.legs||[]).some(function(l){return l&&!l.deadhead&&l.code===rec.code&&l.fr===rec.fr})){(x.legs=x.legs||[]).push({code:rec.code,fr:rec.fr,to:rec.to,dep:rec.dep,arr:rec.arr,dd:rec.dd,date:x.date,block:rec.block,rank:(zh?'換機型接手（原 ':'Aircraft-change cover (was ')+s.outName+')',swapInR1108A:1});
            x.legs.sort(function(a,b){return String(a.dep||'').localeCompare(String(b.dep||''))});x.blockMin=(+x.blockMin||0)+(+rec.block||0)}})})});}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__cx38=1;window.kgmRosterR196=w}
  /* 休息日出勤加給：原機師那一段照原排班算 */
  function wrapPay(){var O=window.kgmRestDayWorkR927C;if(typeof O!=='function'||O.__cx38)return;
    var w=function(empId){var pv=window.__k38PayFor;window.__k38PayFor=empId;try{return O.apply(this,arguments)}finally{window.__k38PayFor=pv}};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__cx38=1;window.kgmRestDayWorkR927C=w}
  /* 每日異動：換機那一列寫機長改派 */
  function wrapChg(){var O=window.kgmChangesR78;if(typeof O!=='function'||O.__cx38)return;
    var w=function(date){var r=O.apply(this,arguments);try{var d=(r&&r.date)||date||T(),R=ST().recs,zh=z();((r&&r.changes)||[]).forEach(function(c){if(!c||c.kind!=='sub')return;var fr=String(c.route||'').split('→')[0];
          var rec=null;Object.keys(R).forEach(function(k){var x=R[k];if(x.date===d&&x.code===c.code&&(!fr||x.fr===fr))rec=x});
          if(rec&&!c.crewSwapR1108A){c.crewSwapR1108A=rec.swaps.map(function(s){return s.outName+' → '+s.inName}).join('、');c.why=(c.why||'')+(zh?'；機長改派 '+c.crewSwapR1108A+'（已通知，原機長照常計薪）':'; pilots replaced '+c.crewSwapR1108A+' (notified; original crew paid)')}})}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__cx38=1;window.kgmChangesR78=w}
  function hook(){wrapPlan();wrapRoster();wrapPay();wrapChg()}
  hook();[0,3000,9000,25000,60000,90000].forEach(function(t){setTimeout(hook,t)});
  setInterval(function(){try{if(!(window.kgmCrewPlanR121&&window.kgmCrewPlanR121.__cx38)||!(window.kgmRosterR196&&window.kgmRosterR196.__cx38))hook()}catch(_){}},10000);
  setTimeout(tick,30000);setInterval(tick,90000);
})();

/* ══ 1108B（使用者：「短程有一些可以加入A35K…A35K不要完全只有長程」；使用者選「短程輪流機型加 A35K」、航線「台北—東京成田＋你幫我挑」）══
   三組白天出發、當天回台北的短程，跟 A35K 輪流（依日期隔天輪流）：
     台北—東京成田 KX184／KX183（原 A359）　台北—香港 KX356／KX355（原輪流機型）　台北—首爾仁川 KX104／KX103（原 A359）
     （原始碼照全站慣例寫改號前的班號；建置最後一步 kx39.py 會跟全站一起改成新班號，網站上是去程奇數的新號）
   機隊整年排好之後補一道：輪到 A35K 的那天，找一架 A35K 在這組來回的前後（各 90 分鐘）都停在台北、中間沒有任務 → 這組來回改由它飛，
   並寫一筆換機紀錄（跟現有自動換機同一份 S.acftSub，售位／座位／Payload／組員換機長都照現有規則跟著走；排定的輪流不是臨時異動，不寄異動通知）。
   找不到空著的 A35K 就照原本機型飛 —— 長程一班都不動。 */
(function(){
  if(window.__k39a35)return;window.__k39a35=1;
  var PAIRS=[['KX184','KX183','NRT'],['KX356','KX355','HKG'],['KX104','KX103','ICN']],TURN=90,HORIZON=330;
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function dayNo(d){return Math.round(Date.parse(d+'T00:00:00Z')/86400000)}
  function want(i,d){return (dayNo(d)+i)%2===0}   /* 隔天輪流（三組錯開） */
  var LAST=0;window.KGM_A35K_SHORT_R1108B={moved:0,kept:0,runs:0};
  function pass(){
    if(!window.KGM_FULLDONE_1006A)return;var TA=S.tailAssign;if(!TA)return;var tails=[];try{tails=tailsFor('A35K')||[]}catch(_){}if(!tails.length)return;
    var t0=AD(T(),-1),t1=AD(T(),HORIZON),moved=0,kept=0;
    /* 這三組來回目前在哪架飛機上（code|date → {tail,leg}） */
    var at={};Object.keys(TA).forEach(function(tl){(TA[tl]||[]).forEach(function(x){if(!x||x.date<t0||x.date>t1)return;for(var i=0;i<PAIRS.length;i++){if(x.code===PAIRS[i][0]||x.code===PAIRS[i][1]){at[x.code+'|'+x.date+'|'+x.fr]={tail:tl,x:x};break}}})});
    /* 之前排過的輪流：整年重排把那組來回放回原機型的飛機 → 換機紀錄一起拿掉（機型永遠跟實際飛的那架一致），下面再重新找 */
    var byCD={};Object.keys(at).forEach(function(q){var v=at[q];byCD[v.x.code+'|'+v.x.date]=v});
    var drop=0;Object.keys(S.acftSub||{}).forEach(function(k){var e=S.acftSub[k];if(!e||!e.plannedR1108B)return;var h=byCD[e.code+'|'+e.date];
      if(!h||tails.indexOf(h.tail)<0){delete S.acftSub[k];drop++}});
    for(var d=t0;d<=t1;d=AD(d,1)){
      for(var i=0;i<PAIRS.length;i++){var P=PAIRS[i];if(!want(i,d))continue;
        var o=at[P[0]+'|'+d+'|TPE'];if(!o)continue;var r=null;
        /* 回程：同一架、出發 ≥ 去程抵達（可能隔天日期，這三組都是當天回） */
        r=at[P[1]+'|'+d+'|'+P[2]];if(!r||r.tail!==o.tail||!(r.x.depAbs>o.x.arrAbs))continue;
        if(tails.indexOf(o.tail)>=0){kept++;continue}   /* 已經是 A35K 飛 */
        if((S.tailStatus||{})[o.tail]==='maintenance')continue;
        var a=o.x.depAbs-TURN,b=r.x.arrAbs+TURN,pick=null;
        for(var k=0;k<tails.length&&!pick;k++){var tl=tails[k];if((S.tailStatus||{})[tl]==='maintenance')continue;var L=(TA[tl]||[]).filter(Boolean),prev=null,next=null,clash=false;
          for(var j=0;j<L.length;j++){var y=L[j];if(!(+y.depAbs>=0))continue;if(y.depAbs<b&&y.arrAbs>a){clash=true;break}if(y.arrAbs<=a&&(!prev||y.arrAbs>prev.arrAbs))prev=y;if(y.depAbs>=b&&(!next||y.depAbs<next.depAbs))next=y}
          if(clash)continue;if(prev&&prev.to!=='TPE')continue;if(next&&next.fr!=='TPE')continue;if(!prev)continue;   /* 一定要知道它停在台北 */
          pick=tl}
        if(!pick)continue;
        [o,r].forEach(function(e){var src=TA[e.tail]||[],ix=src.indexOf(e.x);if(ix>=0)src.splice(ix,1);e.x.a35kR1108B=1;if(e.x.acft&&e.x.acft!=='A35K'){e.x.acftOrigR1108B=e.x.acft;e.x.acft='A35K'}TA[pick].push(e.x);e.tail=pick;
          var key=e.x.code+'_'+e.x.date,row=null;try{row=(FLIGHTS||[]).filter(function(f){return f&&f.code===e.x.code&&f.fr===e.x.fr&&f.to===e.x.to&&!f.via})[0]}catch(_){}
          var orig=null;try{orig=(S.acftSub[key]&&S.acftSub[key].orig)||(row&&row.acft!=='EQV'?row.acft:acftOfFlight(e.x.code,e.x.date))}catch(_){}
          S.acftSub=S.acftSub||{};S.acftSub[key]={code:e.x.code,date:e.x.date,route:e.x.route,orig:orig||'A359',sub:'A35K',tail:pick,seatsOrig:0,seatsSub:0,auto:1,plannedR1108B:1,notified:1,paxNotifiedR34:1,detectedAt:new Date().toISOString()};
          try{S.acftSub[key].seatsOrig=_seatOf(S.acftSub[key].orig);S.acftSub[key].seatsSub=_seatOf('A35K')}catch(_){}});
        TA[pick].sort(function(p,q){return (+p.depAbs||0)-(+q.depAbs||0)});moved++}}
    /* 換機紀錄被別層重寫時補回標記（不寄通知） */
    try{tails.forEach(function(tl){(TA[tl]||[]).forEach(function(x){if(x&&x.a35kR1108B&&x.acft&&x.acft!=='A35K'){x.acftOrigR1108B=x.acft;x.acft='A35K'}})})}catch(_){}   /* 航段自己帶的機型欄位跟著改（機隊稽核比的是它） */
    try{IX=null;var I=idx();Object.keys(I).forEach(function(k){var e=S.acftSub&&S.acftSub[k];if(e){e.plannedR1108B=1;e.notified=1;e.paxNotifiedR34=1;e.sub='A35K';e.tail=I[k]}})}catch(_){}
    var st=window.KGM_A35K_SHORT_R1108B;st.moved+=moved;st.kept=kept;st.dropped=(st.dropped||0)+drop;st.runs++;st.at=new Date().toISOString();
    if(moved||drop){try{if(window.kgmClearRotationCacheR72)window.kgmClearRotationCacheR72()}catch(_){}try{save()}catch(_){}}
  }
  window.kgmA35kShortR1108B=pass;
  /* 機型以「實際飛的那架」為準（唯一來源）：這三組班掛在 A35K 機身上 → A35K。
     不靠換機紀錄的標記 —— 0810J 自動換機會把那筆紀錄整筆重寫、標記會掉；成田／仁川的機型又被 1018A 定案表釘住，換機紀錄蓋不過它 */
  var CODES={};PAIRS.forEach(function(P){CODES[P[0]]=1;CODES[P[1]]=1});var IX=null,IXS='';
  function idx(){var tl=[];try{tl=tailsFor('A35K')||[]}catch(_){}var TA=S.tailAssign||{},sig=tl.map(function(t){return (TA[t]||[]).length}).join(',');if(IX&&sig===IXS)return IX;
    IX={};tl.forEach(function(t){(TA[t]||[]).forEach(function(x){if(x&&CODES[x.code])IX[x.code+'_'+x.date]=t})});IXS=sig;return IX}
  window.kgmA35kOnR1108B=function(code,date){if(!CODES[code])return '';try{return idx()[code+'_'+date]||''}catch(_){return ''}};
  /* 1108B（使用者：自動換機紀錄網站仍顯示原機型（例 KX138 實派 B779、畫面 A339R）→「YES」修）：
     0810J 那層本來就照「當天實際派的那架」，但外面的 1018A 定案表、A330 那層等又把它蓋回時刻表機型。
     最外層只在「有換機紀錄、而且換成的機型就是現在實際派的那架」時回換機後的機型（紀錄過期、飛機已換回原型就照原本）；
     A35K 短程輪流：那三組掛在 A35K 機身上就回 A35K。排機隊時（KGM_PLAN_R1010A）一律不看（不然換機永遠換不回來）。
     不做「一律回實際機身」：修補輪轉／補空檔／換機巡檢這些不在排班旗標底下的程式也會問機型，實測會讓 1,605 段改派。 */
  function actual(code,date){try{var f=[];(_taIndex0818()[code+'|'+date]||[]).forEach(function(e){var tp=_typeOfTail(e.tail);if(tp&&f.indexOf(tp)<0)f.push(tp)});return f.length===1?f[0]:null}catch(_){return null}}
  /* 輪流機型（EQV）的航線本來就是「哪型飛就是哪型」，換機紀錄程式又跳過 EQV（沒有紀錄）→ 有實際派機就照那一架（例：香港 KX359 實派 B779、畫面原本 A339R） */
  var EQ=null;function eqv(c){if(!EQ){EQ={};try{var all={};(FLIGHTS||[]).forEach(function(f){if(!f||f.via||f.partner||f.codeshare)return;(all[f.code]=all[f.code]||[]).push(f.acft)});Object.keys(all).forEach(function(k){if(all[k].every(function(a){return a==='EQV'}))EQ[k]=1})}catch(_){}}return !!EQ[c]}
  var MINE=null;function wrapAc(){var a0=window.acftOfFlight;if(typeof a0!=='function'||a0===MINE)return;var w=function(code,date){
      try{var c=code&&typeof code==='object'?code.code:code;if(c&&date&&!window.KGM_PLAN_R1010A){if(CODES[c]&&window.kgmA35kOnR1108B(c,date))return 'A35K';
        var m=(S.acftSub||{})[c+'_'+date];if(m&&m.sub&&!(m.manual&&!m.auto)&&actual(c,date)===m.sub)return m.sub;
        if(eqv(c)&&!(m&&m.manual&&!m.auto)){var t=actual(c,date);if(t)return t}}}catch(_){}return a0.apply(this,arguments)};
    MINE=w;try{acftOfFlight=window.acftOfFlight=w}catch(_){window.acftOfFlight=w}}
  /* 排定的輪流不是臨時換機：不寄機型異動通知 */
  var MINEN=null;function wrapN(){var n0=window.kgmNotifyAcftChangeR34;if(typeof n0!=='function'||n0===MINEN)return;var w=function(code,date,from,to){try{if(to==='A35K'&&window.kgmA35kOnR1108B(code,date))return 0}catch(_){}return n0.apply(this,arguments)};MINEN=w;window.kgmNotifyAcftChangeR34=w}
  function hk(){wrapAc();wrapN()}hk();setInterval(hk,5000);
  setInterval(function(){try{pass()}catch(e){try{console.warn('a35k short',e)}catch(_){}}},20000);
})();
/* ══ 1112B C14：曼谷長程段（一端 BKK、另一端不是台北／松山、航程 ≥4 小時）—— r121 只派曼谷基地組員 ══ */
window.kgmBkkLhR1112B=function(f){try{if(!f)return false;var a=f.fr,b=f.to;if(a!=='BKK'&&b!=='BKK')return false;var o=a==='BKK'?b:a;if(o==='TPE'||o==='TSA'||o==='BKK')return false;return (+f.block||0)>=240}catch(_){return false}};
/* ══ 1112B C15（使用者：「後台非常卡頓」）══
   組員引擎一天要算 0.7～1.9 秒、拆不開；背景補算有 9 個呼叫點，只有 2 個看「使用者正在操作」。大部分是用 requestIdleCallback 排的
   → 全站的 requestIdleCallback：使用者 1.5 秒內有點擊／按鍵／捲動／輸入，就先不跑、等停手再跑（最多延 20 次，之後照常），
   使用者在操作時不會剛好撞上一段背景計算。算出來的結果一樣，只是時間往後挪。 */
(function(){try{var R=window.requestIdleCallback;if(typeof R!=='function'||R.__k40)return;
  var w=function(cb,opt){var n=0;var run=function(dl){var q=Date.now()-(window.KGM_LAST_INPUT_R1025B||0);if(q<1500&&n<20){n++;setTimeout(function(){R.call(window,run,opt)},1500-q+30);return}cb(dl)};return R.call(window,run,opt)};
  w.__k40=1;window.requestIdleCallback=w}catch(_){}})();
/* 1112B C16（使用者：「越資深服務越高艙等；同一人盡量統一服務艙等」）：
   每位客艙組員有一個「本艙」——依年資在全體客艙組員的百分位決定（最資深那一段＝頭等、再來商務、豪經、經濟），
   各段大小＝全網航班各艙需要的組員比例。排班引擎挑人時先挑本艙還缺人的（在外站、當天來回、被指定的照舊優先），
   每班分艙時先放本艙。同年資用員工編號雜湊排順序（固定，不會每次開頁不同）。 */
(function(){
  var CABS=[['suite','頭等艙',2],['first','頭等艙',2],['biz','商務艙',8],['prem','豪華經濟艙',20],['econ','經濟艙',40]];
  function cabsOf(f){var ac=(typeof AC!=='undefined'&&(AC[f.type]||AC[f.acft]))||{},cb=ac.cabins||{};
    var sellP=true;try{if(window.kgmSellsPremiumR71)sellP=!!window.kgmSellsPremiumR71(f)}catch(_){}
    var cabs=[],seen={};
    CABS.forEach(function(c){var x=cb[c[0]];if(!x||!(+x.seats))return;var nm=(c[0]==='prem'&&!sellP)?'經濟艙':c[1];
      if(seen[nm]){seen[nm].d+=(+x.seats)/c[2];return}var o={nm:nm,d:(+x.seats)/c[2]};seen[nm]=o;cabs.push(o)});
    if(!cabs.length)cabs=[{nm:'經濟艙',d:1}];return cabs}
  /* 跟 r196 kgmCabinPositionsR1006A 同一套算法（那邊改讀這裡，只有一份） */
  window.kgmCabQuotaR1112B=function(f,n){try{
    var cabs=cabsOf(f),tot=cabs.reduce(function(a,c){return a+c.d},0);
    cabs.forEach(function(c){c.n=(n>=cabs.length)?1:0});
    var left=n-cabs.reduce(function(a,c){return a+c.n},0);
    if(left>0){var share=cabs.map(function(c){var e=left*c.d/tot;return {c:c,f:Math.floor(e),r:e-Math.floor(e)}});
      share.forEach(function(s){s.c.n+=s.f;left-=s.f});
      share.sort(function(a,b){return b.r-a.r});for(var i=0;left>0;i=(i+1)%share.length){share[i].c.n++;left--}}
    return cabs}catch(_){return null}};
  window.kgmCabCqR1112B=function(f,n){var q={};(window.kgmCabQuotaR1112B(f,n)||[]).forEach(function(c){q[c.nm]=(q[c.nm]||0)+c.n});return {q:q,g:{}}};
  function hs(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)%1000000}
  function key(p){return (+p.seniority||0)*1e6+hs(p.empId)}
  function rk(p){var r=p.rankCode||p.rank;return (r==='PU'||r==='DPU')?r:'FA'}
  var ORD=['頭等艙','商務艙','豪華經濟艙','經濟艙'];
  var MEMO=null,MEMOP=null,HOME={};
  /* 本艙比例要分職級算：每班 1 位座艙長＋依人數的副座艙長一定是那班最資深的，高艙的位子他們先坐，
     剩下的才輪到空服員（不分職級的話，空服員幾乎全是經濟艙本艙，班上高艙不夠人只好讓最資淺的去坐）。
     做法：每個自營航班照「座艙長→副座艙長→空服員」由高艙往低艙排一次，數各職級坐到各艙幾次，就是各職級的本艙比例。 */
  function build(){
    var P=null;try{P=window.kgmCrewPoolR121&&window.kgmCrewPoolR121()}catch(_){}
    var C=P&&P.cabin;if(!C||!C.length)return null;if(MEMO&&MEMOP===C)return MEMO;
    var w={PU:{},DPU:{},FA:{}};
    try{(typeof FLIGHTS!=='undefined'?FLIGHTS:[]).forEach(function(f){if(!f||f.partner||f.via)return;var t=String(f.type||f.acft||'').toUpperCase();if(typeof AC==='undefined'||!AC[t])return;
      var cabN=0;try{cabN=window.kgmCabinForR929({type:t,block:999})}catch(_){}if(!(cabN>0))return;
      var nD=cabN>=20?4:cabN>=14?3:cabN>=10?2:cabN>=5?1:0,q=window.kgmCabQuotaR1112B({type:t,acft:t,code:f.code,fr:f.fr,to:f.to},cabN)||[],sl=[];
      q.forEach(function(c){for(var j=0;j<c.n;j++)sl.push(c.nm)});
      sl.forEach(function(nm,i){var r=i===0?'PU':(i<=nD?'DPU':'FA');w[r][nm]=(w[r][nm]||0)+1})})}catch(_){}
    var cut={};['PU','DPU','FA'].forEach(function(r){
      var ks=C.filter(function(p){return rk(p)===r}).map(key).sort(function(a,b){return b-a});
      var W=ORD.reduce(function(a,nm){return a+(w[r][nm]||0)},0),acc=0;cut[r]=[];
      if(!W||!ks.length)return;
      ORD.slice(0,3).forEach(function(nm){var x=w[r][nm]||0;if(!x)return;acc+=x/W;cut[r].push({nm:nm,k:ks[Math.min(ks.length-1,Math.max(0,Math.round(acc*ks.length)-1))]})})});
    MEMO={cut:cut,w:w,n:C.length};MEMOP=C;HOME={};window.KGM_CABHOME_R1112B=MEMO;return MEMO}
  window.kgmCabHomeR1112B=function(p){try{if(!p||!p.empId)return '經濟艙';var h=HOME[p.empId];if(h&&MEMOP)return h;var m=build();if(!m)return '經濟艙';
    var k=key(p),cs=m.cut[rk(p)]||[];h='經濟艙';for(var i=0;i<cs.length;i++){if(k>=cs[i].k){h=cs[i].nm;break}}HOME[p.empId]=h;return h}catch(_){return '經濟艙'}};
})();
/* ══ 1115A D7（使用者：「組員要可以預先Bid/許願接下來一個月想飛的五個航點 當然不一定要有完全符合許願地點但盡量符合」）══
   · 每位組員（機師、客艙）可以許願下個月最想飛的 5 個航點（自己的班表頁「許願航點」）：S.crewWishR1115A[員工編號][YYYY-MM]＝[5 個機場]，存檔 kgm40_crewwish。
   · 還沒許願的組員用固定的模擬許願（員工編號＋月份雜湊，從他基地出發的航點挑 5 個；每次開頁一樣），只拿來排序，不寫進存檔。
   · 排班引擎挑人（r121 choose）在所有既有規則（指定、當天來回、外站先回、泰籍、日韓本國、虛擬組員…）都一樣時，
     先挑「這一班從基地飛出去、目的地是他許願航點」的人，再看月工時。只是排序，不會讓任何人違規，所以是「盡量符合」。
   · 組員班表的輸入指紋（sig25）含許願 → 改了許願，下一次算班表（下次開頁）就照新的許願；已公布凍結的班表不變。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function h(s){s=String(s);var x=2166136261;for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
  var BASE={TPE:1,TSA:1};
  function td(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  window.kgmCrewWishMonthR1115A=function(){var d=td(),y=+d.slice(0,4),m=+d.slice(5,7)+1;if(m>12){m=1;y++}return y+'-'+(m<10?'0':'')+m};
  var DST={};
  function dests(base){base=base==='BKK'?'BKK':'TPE';if(DST[base])return DST[base];var o={};
    try{(typeof FLIGHTS!=='undefined'?FLIGHTS:[]).forEach(function(f){if(!f||f.partner||f.codeshare||!/^KX\d{1,3}$/.test(String(f.code||'')))return;var fr=f.fr,to=f.via||f.to;
      if(base==='TPE'?(BASE[fr]&&!BASE[to]):(fr==='BKK'&&!BASE[to]))o[to]=1;if(base==='TPE'&&BASE[fr]&&f.via&&!BASE[f.to])o[f.to]=1})}catch(_){}
    return DST[base]=Object.keys(o).sort()}
  window.kgmCrewWishDestsR1115A=dests;
  var WC={},WCs='';
  window.kgmCrewWishOfR1115A=function(id,base,mo){var W=S.crewWishR1115A||{},a=W[id]&&W[id][mo];if(a&&a.length)return {list:a,mine:true};
    var k=id+'|'+mo+'|'+(base||'');if(WC[k])return WC[k];var L=dests(base).map(function(x){return [h(id+'|'+mo+'|'+x),x]}).sort(function(x,y){return x[0]-y[0]}).map(function(x){return x[1]});   /* 1115A D5：每個航點的雜湊只算一次（結果相同） */return WC[k]={list:L.slice(0,5),mine:false}};
  /* 引擎排序用：0＝這一班是他許願的航點（從基地飛出去），1＝不是／不適用 */
  var SC={},SCn=0;
  window.kgmCrewWishScoreR1115A=function(p,f,date){try{if(!p||!f)return 1;var base=p.base||(p.nat22==='TH'?'BKK':'TPE');
      var out=base==='BKK'?f.fr==='BKK':!!BASE[f.fr];if(!out)return 0;var mo=String(date||'').slice(0,7),k=p.empId+'|'+mo,set=SC[k];
      if(!set){var w=window.kgmCrewWishOfR1115A(p.empId,base,mo).list,o={};w.forEach(function(x){o[x]=1});set=SC[k]=o;if(++SCn>60000){SC={};SCn=0}}   /* 1115A D5：原本每次沒命中都 Object.keys(SC)（上萬個鍵）→ 平方成長，60 秒吃掉 5 秒主執行緒 */
      return set[f.to]||set[f.via]?0:1}catch(_){return 1}};
  window.kgmCrewWishSaveR1115A=function(id,mo){var me=S.adminUser||{},ceo=me.role==='ceo'||me.role==='admin'||me.empId==='MASTER';
    if(!(ceo||me.empId===id)){alert(z()?'只能改自己的許願。':'You can only change your own wishes.');return}
    var v=[];for(var i=0;i<5;i++){var el=document.getElementById('k115w-'+i);if(el&&el.value&&v.indexOf(el.value)<0)v.push(el.value)}
    S.crewWishR1115A=S.crewWishR1115A||{};S.crewWishR1115A[id]=S.crewWishR1115A[id]||{};S.crewWishR1115A[id][mo]=v;
    Object.keys(SC).forEach(function(k){if(k.indexOf(id+'|')===0)delete SC[k]});
    S.k115wMsg=(z()?'✓ 已送出 '+mo+' 的許願（'+v.length+' 個航點）。下次排班（下次開頁）會盡量照這個排；已公布的班表不會變。':'Saved.');try{save()}catch(_){}try{render()}catch(_){}};
  /* 班表頁的許願面板：ros＝這位組員的班表（r196），算目前符合幾段 */
  window.kgmCrewWishHtmlR1115A=function(id,ros){try{var P=null;try{var pl=window.kgmCrewPoolR121&&window.kgmCrewPoolR121();P=(pl&&pl.pilots||[]).concat(pl&&pl.cabin||[]).filter(function(x){return x.empId===id})[0]}catch(_){}
    var base=(P&&P.base)||((P&&P.nat22==='TH')?'BKK':'TPE'),mo=window.kgmCrewWishMonthR1115A(),cur=td().slice(0,7),D=dests(base),w=window.kgmCrewWishOfR1115A(id,base,mo),wc=window.kgmCrewWishOfR1115A(id,base,cur);
    var me=S.adminUser||{},can=me.role==='ceo'||me.role==='admin'||me.empId==='MASTER'||me.empId===id;
    function cnt(month,list){var o={},n=0,hit=0;list.forEach(function(x){o[x]=1});(ros||[]).forEach(function(x){if(String(x.date).slice(0,7)!==month)return;(x.legs||[]).forEach(function(l){if(!l||l.deadhead||l.dh)return;var fr=l.fr||String(l.route||'').split('→')[0],to=l.to||String(l.route||'').split('→')[1];if(base==='BKK'?fr!=='BKK':!BASE[fr])return;n++;if(o[to])hit++})});return {n:n,hit:hit}}
    var c1=cnt(cur,wc.list),c2=cnt(mo,w.list);
    var sel=function(i){var v=w.mine?(w.list[i]||''):'';return '<select id="k115w-'+i+'"'+(can?'':' disabled')+'><option value="">'+(z()?'第 '+(i+1)+' 志願':'Choice '+(i+1))+'</option>'+D.map(function(a){var c='';try{c=(typeof CITY==='function'?CITY(a):'')||''}catch(_){}return '<option value="'+a+'"'+(a===v?' selected':'')+'>'+a+(c&&c!==a?' '+E(c):'')+'</option>'}).join('')+'</select>'};
    return '<div class="k115w"><div class="k115w-h"><b>'+(z()?'許願航點 · '+mo:'Destination bids · '+mo)+'</b><small>'+(z()?'下個月最想飛的 5 個航點（從 '+base+' 出發的航點）。排班會在不違反任何規定的前提下盡量照許願排，不保證全部符合。':'')+'</small></div>'
      +'<div class="k115w-s">'+[0,1,2,3,4].map(sel).join('')+(can?'<button type="button" class="btn btn-g" onclick="kgmCrewWishSaveR1115A(\''+E(id)+'\',\''+mo+'\')">'+(z()?'送出許願':'Submit')+'</button>':'')+'</div>'
      +(w.mine?'':'<div class="k115w-n">'+(z()?'還沒許願（目前排班用系統預設：'+E(w.list.join('、'))+'）':'Not submitted yet')+'</div>')
      +(S.k115wMsg?'<div class="k115w-ok">'+E(S.k115wMsg)+'</div>':'')
      +'<div class="k115w-st">'+(z()?cur+' 從基地出發的航段 '+c1.n+' 段，其中 '+c1.hit+' 段是許願的航點'+(wc.mine?'':'（系統預設許願）')+(c2.n?'；'+mo+' 已排 '+c2.n+' 段，符合 '+c2.hit+' 段':''):'')+'</div></div>'}catch(_){return ''}};
  try{var cs=document.createElement('style');cs.textContent='.k115w{margin:12px 0 4px;padding:14px 16px;border:1px solid #d9e4dd;border-radius:14px;background:#f8fbf9}.k115w-h b{display:block;font-size:14px;color:#0B3D2E}.k115w-h small{display:block;margin-top:3px;color:#5f6b65;font-size:12px;line-height:1.5}.k115w-s{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center}.k115w-s select{padding:7px 10px;border:1px solid #cfd8d3;border-radius:10px;font-size:13px;min-width:140px}.k115w-n,.k115w-st{margin-top:8px;font-size:12.5px;color:#55605B}.k115w-ok{margin-top:8px;font-size:12.5px;color:#0B6B48;font-weight:700}';document.head.appendChild(cs)}catch(_){}
})();
