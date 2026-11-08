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
