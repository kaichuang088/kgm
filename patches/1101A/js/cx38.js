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
    var st=window.KGM_A35K_SHORT_R1108B;st.moved+=moved;st.kept=kept;st.dropped=(st.dropped||0)+drop;st.runs++;st.at=new Date().toISOString();window.KGM_A35_FD_R1115B=window.KGM_FULLDONE_1006A;   /* 1115B：這次整年重排之後的 A35K 輪替已經跑過＝機隊最終版（組員引擎等這個才開始、才讀存檔） */
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
  /* 1115B：整年重排一做完就馬上跑一次（原本要等 0～20 秒的計時器，組員引擎在這之間開始算 → 機隊又變 → 整份作廢重算，存檔指紋也對不上） */
  setInterval(function(){var fd=window.KGM_FULLDONE_1006A;if(fd&&window.KGM_A35_FD_R1115B!==fd){try{pass()}catch(e){try{console.warn('a35k short',e)}catch(_){}}if(window.KGM_A35_FD_R1115B!==fd)window.KGM_A35_FD_R1115B=fd}},500);
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
  window.kgmCrewWishMonthR1115A=function(){return window.kgmCrewWishOpenR1115B?window.kgmCrewWishOpenR1115B():(function(){var d=td(),y=+d.slice(0,4),m=+d.slice(5,7)+1;if(m>12){m=1;y++}return y+'-'+(m<10?'0':'')+m})()};   /* 1115B：開放許願的月份（下個月截止了就換下下個月） */
  var DST={};
  function dests(base){base=base==='BKK'?'BKK':'TPE';if(DST[base])return DST[base];var o={};
    try{(typeof FLIGHTS!=='undefined'?FLIGHTS:[]).forEach(function(f){if(!f||f.partner||f.codeshare||!/^KX\d{1,3}$/.test(String(f.code||'')))return;var fr=f.fr,to=f.via||f.to;
      if(base==='TPE'?(BASE[fr]&&!BASE[to]):(fr==='BKK'&&!BASE[to]))o[to]=1;if(base==='TPE'&&BASE[fr]&&f.via&&!BASE[f.to])o[f.to]=1})}catch(_){}
    return DST[base]=Object.keys(o).sort()}
  window.kgmCrewWishDestsR1115A=dests;
  var WC={},WCs='';
  /* 1115B E3（使用者：「空服員要在一個deadline前上傳心願地點沒有就是隨機」）：每月 15 日 23:59（台北）截止「下個月」的許願；
     截止後誰都不能改；截止前沒送出（或截止後才送）的人＝系統隨機（依員工編號＋月份固定，每次開頁一樣，組員班表存檔才對得上）。 */
  var DLDAY15=15;
  window.kgmCrewWishDeadlineR1115B=function(mo){var y=+String(mo).slice(0,4),m=+String(mo).slice(5,7);return Date.UTC(y,m-2,DLDAY15,15,59,59)};   /* 前一個月 15 日 23:59:59（UTC+8） */
  function addMo(mo,n){var y=+mo.slice(0,4),m=+mo.slice(5,7)+n;while(m>12){m-=12;y++}return y+'-'+(m<10?'0':'')+m}
  window.kgmCrewWishOpenR1115B=function(){var cur=td().slice(0,7),nx=addMo(cur,1);return Date.now()<=window.kgmCrewWishDeadlineR1115B(nx)?nx:addMo(cur,2)};
  window.kgmCrewWishOfR1115A=function(id,base,mo){var W=S.crewWishR1115A||{},a=W[id]&&W[id][mo],at=W[id]&&W[id]['@'+mo];if(a&&a.length&&!(at&&at>window.kgmCrewWishDeadlineR1115B(mo)))return {list:a,mine:true,at:at||null};   /* 1115B：截止後才送的不算 */
    var k=id+'|'+mo+'|'+(base||'');if(WC[k])return WC[k];var L=dests(base).map(function(x){return [h(id+'|'+mo+'|'+x),x]}).sort(function(x,y){return x[0]-y[0]}).map(function(x){return x[1]});   /* 1115A D5：每個航點的雜湊只算一次（結果相同） */return WC[k]={list:L.slice(0,5),mine:false}};
  /* 引擎排序用：0＝這一班是他許願的航點（從基地飛出去），1＝不是／不適用 */
  var SC={},SCn=0;
  window.kgmCrewWishScoreR1115A=function(p,f,date){try{if(!p||!f)return 1;var base=p.base||(p.nat22==='TH'?'BKK':'TPE');
      var out=base==='BKK'?f.fr==='BKK':!!BASE[f.fr];if(!out)return 0;var mo=String(date||'').slice(0,7),k=p.empId+'|'+mo,set=SC[k];
      if(!set){var w=window.kgmCrewWishOfR1115A(p.empId,base,mo).list,o={};w.forEach(function(x){o[x]=1});set=SC[k]=o;if(++SCn>60000){SC={};SCn=0}}   /* 1115A D5：原本每次沒命中都 Object.keys(SC)（上萬個鍵）→ 平方成長，60 秒吃掉 5 秒主執行緒 */
      var dm=set[f.to]||set[f.via]?0:1;   /* 1118A G2：外站停留許願（短／中／長）不符合 +0.5（航點優先、再看停留） */
      var lw=window.kgmCrewWishLayR1118A?window.kgmCrewWishLayR1118A(p.empId,mo):'';if(lw){var lh=window.kgmLayEstR1118A?window.kgmLayEstR1118A(f,date):null;if(lh!=null&&LAYB[lw]&&!(lh>=LAYB[lw][0]&&lh<LAYB[lw][1]))dm+=0.5}
      return dm}catch(_){return 1}};
  /* ══ 1118A G2（使用者：「也要可以許願lay over多久我不確定是不是55hr (longest) 還是多久」）══
     實測（60 天組員班表）外站停留：最短 24 小時、中位 34 小時、九成在 73 小時以內、最長 176 小時（巴黎）→ 55 小時不是最長。
     許願分三種：短（30 小時以內）／中（30～56 小時）／長（56 小時以上）；排班挑人時航點許願優先、再看停留（只是排序，不會違規）。
     估計停留＝這班抵達外站後，最早一班飛回基地、起飛時間在抵達＋22.5 小時（最低休息）以後的航班（kgmFlightsOnR121，跟排班引擎同一份）。 */
  var LAYB={short:[0,30],mid:[30,56],long:[56,1e9]};window.KGM_LAYB_R1118A=LAYB;
  window.kgmCrewWishLayR1118A=function(id,mo){var W=S.crewWishR1115A||{},o=W[id];if(!o)return '';var v=o['L'+mo],at=o['@L'+mo]||o['@'+mo];if(!v)return '';if(at&&at>window.kgmCrewWishDeadlineR1115B(mo))return '';return v};
  var LE={},LEn=0;
  window.kgmLayEstR1118A=function(f,date){try{if(!f||f.arrUTC==null)return null;var k=f.code+'|'+date+'|'+f.fr+f.to;if(k in LE)return LE[k];var to=f.to,base=f.fr==='BKK'?{BKK:1}:BASE,need=f.arrUTC+1350,best=null;
      for(var i=0;i<8&&best==null;i++){var t=new Date(date+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+i);var d=t.toISOString().slice(0,10),L=window.kgmFlightsOnR121?window.kgmFlightsOnR121(d):[];
        for(var j=0;j<L.length;j++){var g=L[j];if(g.fr===to&&base[g.to]&&!g.positioning&&g.depUTC>=need&&(best==null||g.depUTC<best))best=g.depUTC}}
      if(++LEn>20000){LE={};LEn=0}return LE[k]=best==null?null:(best-f.arrUTC)/60}catch(_){return null}};
  function dlTxt(mo){var x=new Date(window.kgmCrewWishDeadlineR1115B(mo)+8*3600000);return (x.getUTCMonth()+1)+'/'+x.getUTCDate()+' 23:59'}
  function left(mo){var ms=window.kgmCrewWishDeadlineR1115B(mo)-Date.now();if(ms<=0)return z()?'已截止':'closed';var h2=Math.floor(ms/3600000),d2=Math.floor(h2/24);return z()?(d2>=1?'剩 '+d2+' 天 '+(h2%24)+' 小時':'剩 '+h2+' 小時 '+Math.floor(ms%3600000/60000)+' 分'):(d2>=1?d2+'d '+(h2%24)+'h left':h2+'h left')}
  window.kgmCrewWishDraftR1115B=function(id,mo){var v=[];for(var i=0;i<5;i++){var el=document.getElementById('k115w-'+i);v.push(el?el.value:'')}var elL=document.getElementById('k115w-L');v.push(elL?elL.value:'');   /* 1118A：第 6 格＝外站停留許願 */S.k115wDraftR1115B=S.k115wDraftR1115B||{};S.k115wDraftR1115B[id+'|'+mo]=v};
  window.kgmCrewWishSaveR1115A=function(id,mo){var me=S.adminUser||{},ceo=me.role==='ceo'||me.role==='admin'||me.empId==='MASTER';
    if(!(ceo||me.empId===id)){alert(z()?'只能改自己的許願。':'You can only change your own wishes.');return}
    if(Date.now()>window.kgmCrewWishDeadlineR1115B(mo)){alert(z()?mo+' 的許願已在 '+dlTxt(mo)+' 截止，不能再改；沒送出的由系統隨機分配。':'The bidding window for '+mo+' closed at '+dlTxt(mo)+'.');try{render()}catch(_){}return}   /* 1115B：截止後誰都不能改 */
    var v=[];for(var i=0;i<5;i++){var el=document.getElementById('k115w-'+i);if(el&&el.value&&v.indexOf(el.value)<0)v.push(el.value)}
    S.crewWishR1115A=S.crewWishR1115A||{};S.crewWishR1115A[id]=S.crewWishR1115A[id]||{};S.crewWishR1115A[id][mo]=v;S.crewWishR1115A[id]['@'+mo]=Date.now();var elL=document.getElementById('k115w-L');S.crewWishR1115A[id]['L'+mo]=elL?elL.value:'';   /* 1118A：外站停留許願 */try{delete (S.k115wDraftR1115B||{})[id+'|'+mo]}catch(_){}   /* 1115B：送出時間（截止後才送的不算） */
    Object.keys(SC).forEach(function(k){if(k.indexOf(id+'|')===0)delete SC[k]});
    S.k115wMsg=(z()?'✓ 已送出 '+mo+' 的許願（'+v.length+' 個航點）。'+dlTxt(mo)+' 截止前都可以再改；排班會盡量照這個排，已公布的班表不會變。':'Saved.');try{save()}catch(_){}try{render()}catch(_){}};
  /* 班表頁的許願面板：ros＝這位組員的班表（r196），算目前符合幾段 */
  window.kgmCrewWishHtmlR1115A=function(id,ros){try{var P=null;try{var pl=window.kgmCrewPoolR121&&window.kgmCrewPoolR121();P=(pl&&pl.pilots||[]).concat(pl&&pl.cabin||[]).filter(function(x){return x.empId===id})[0]}catch(_){}
    var base=(P&&P.base)||((P&&P.nat22==='TH')?'BKK':'TPE'),mo=window.kgmCrewWishMonthR1115A(),cur=td().slice(0,7),D=dests(base),w=window.kgmCrewWishOfR1115A(id,base,mo),wc=window.kgmCrewWishOfR1115A(id,base,cur);
    var me=S.adminUser||{},can=me.role==='ceo'||me.role==='admin'||me.empId==='MASTER'||me.empId===id;
    function cnt(month,list){var o={},n=0,hit=0;list.forEach(function(x){o[x]=1});(ros||[]).forEach(function(x){if(String(x.date).slice(0,7)!==month)return;(x.legs||[]).forEach(function(l){if(!l||l.deadhead||l.dh)return;var fr=l.fr||String(l.route||'').split('→')[0],to=l.to||String(l.route||'').split('→')[1];if(base==='BKK'?fr!=='BKK':!BASE[fr])return;n++;if(o[to])hit++})});return {n:n,hit:hit}}
    var c1=cnt(cur,wc.list),c2=cnt(mo,w.list);
    var dr=(S.k115wDraftR1115B&&S.k115wDraftR1115B[id+'|'+mo])||null;   /* 1115B：還沒送出的選擇存草稿（背景重畫不會洗掉） */
    var sel=function(i){var v=dr?(dr[i]||''):(w.mine?(w.list[i]||''):'');return '<select id="k115w-'+i+'"'+(can?'':' disabled')+' onchange="kgmCrewWishDraftR1115B(\''+E(id)+'\',\''+mo+'\')"><option value="">'+(z()?'第 '+(i+1)+' 志願':'Choice '+(i+1))+'</option>'+D.map(function(a){var c='';try{c=(typeof CITY==='function'?CITY(a):'')||''}catch(_){}return '<option value="'+a+'"'+(a===v?' selected':'')+'>'+a+(c&&c!==a?' '+E(c):'')+'</option>'}).join('')+'</select>'};
    var lv=dr&&dr.length>5?dr[5]:((S.crewWishR1115A&&S.crewWishR1115A[id]&&S.crewWishR1115A[id]['L'+mo])||'');
    var selL=function(){var o=function(v,t){return '<option value="'+v+'"'+(lv===v?' selected':'')+'>'+t+'</option>'};return '<select id="k115w-L" class="k115w-lay"'+(can?'':' disabled')+' onchange="kgmCrewWishDraftR1115B(\''+E(id)+'\',\''+mo+'\')">'+o('',z()?'外站停留：不指定':'Layover: any')+o('short',z()?'外站停留：短（30 小時以內）':'Layover: short (≤30 h)')+o('mid',z()?'外站停留：中（30～56 小時）':'Layover: medium (30–56 h)')+o('long',z()?'外站停留：長（56 小時以上）':'Layover: long (56 h+)')+'</select>'};   /* 1118A G2 */
    var nx1=(function(){var y=+cur.slice(0,4),m=+cur.slice(5,7)+1;if(m>12){m=1;y++}return y+'-'+(m<10?'0':'')+m})(),lk=mo!==nx1?nx1:'',wl=lk?window.kgmCrewWishOfR1115A(id,base,lk):null;   /* 1115B：下個月已截止 → 那個月顯示結果，開放的是下下個月 */
    return '<div class="k115w"><div class="k115w-h"><b>'+(z()?'許願航點 · '+mo:'Destination bids · '+mo)+'<span class="k115w-dl">'+(z()?'截止 '+dlTxt(mo)+'（台北時間）· '+left(mo):'Closes '+dlTxt(mo)+' (Taipei) · '+left(mo))+'</span></b><small>'+(z()?mo+' 最想飛的 5 個航點（從 '+base+' 出發的航點），請在每月 15 日 23:59 前送出下個月的許願；截止後不能再改，沒有送出的由系統隨機分配 5 個航點。也可以選外站停留長短（目前實際停留：最短 24 小時、一般 25～73 小時、少數歐洲／澳洲線 3～7 天）。排班會在不違反任何規定的前提下盡量照許願排（先看航點、再看停留），不保證全部符合。':'Submit 5 destinations for '+mo+' before the 15th 23:59 of the month before. After the deadline it is locked; crew who did not submit get 5 random destinations.')+'</small></div>'
      +(lk?'<div class="k115w-lk">'+(z()?'<b>'+lk+' 已截止（'+dlTxt(lk)+'）</b> · '+(wl.mine?'你的許願：':'沒有在截止前送出 → 系統隨機：')+E(wl.list.join('、')):'<b>'+lk+' closed</b> · '+(wl.mine?'Your bids: ':'Not submitted → random: ')+E(wl.list.join(', ')))+'</div>':'')
      +'<div class="k115w-s">'+[0,1,2,3,4].map(sel).join('')+selL()+(can?'<button type="button" class="btn btn-g" onclick="kgmCrewWishSaveR1115A(\''+E(id)+'\',\''+mo+'\')">'+(z()?'送出許願':'Submit')+'</button>':'')+'</div>'
      +(w.mine?'<div class="k115w-n">'+(z()?'已送出'+(w.at?'（'+new Date(w.at+8*3600000).toISOString().slice(5,16).replace('T',' ')+'）':'')+'，截止前都可以再改。':'Submitted.')+'</div>':'<div class="k115w-n">'+(z()?'還沒送出 · 截止前沒送出就由系統隨機分配（目前隨機會是：'+E(w.list.join('、'))+'）':'Not submitted · random if not submitted by the deadline')+'</div>')
      +(S.k115wMsg?'<div class="k115w-ok">'+E(S.k115wMsg)+'</div>':'')
      +'<div class="k115w-st">'+(z()?cur+' 從基地出發的航段 '+c1.n+' 段，其中 '+c1.hit+' 段是許願的航點'+(wc.mine?'':'（系統隨機）')+(c2.n?'；'+mo+' 已排 '+c2.n+' 段，符合 '+c2.hit+' 段':''):'')+'</div></div>'}catch(_){return ''}};
  /* ══ 1118A G1（使用者：「CEO組員資料要顯示組員許願list 然後系統會自動跟講那個排班」）══
     組員班表頁（CEO）最上面「組員許願總表」：每位組員（機師＋客艙）的 5 個許願航點、外站停留許願、送出時間（沒送＝系統隨機），
     以及系統實際排出來的結果（從已算好的班表讀，不另外計算）：從基地出發幾段、其中幾段是許願航點、外站停留符合幾次。
     月份分頁：已截止、正在排的月份＋還開放許願的月份。可搜尋姓名／員編、只看已送出。 */
  function isCeo(){var u=S.adminUser||{};return u.empId==='MASTER'||u.role==='ceo'||u.role==='admin'}
  function addM(mo,n){var y=+mo.slice(0,4),m=+mo.slice(5,7)+n;while(m>12){m-=12;y++}return y+'-'+(m<10?'0':'')+m}
  /* 實際排班結果：背景一天一天讀（每天一次、使用者 1.5 秒內有操作就等），畫面只讀統計好的；不在畫面上同步讀整個月的班表（實測會卡 2～7 秒） */
  var FT={k:'',by:{},done:{},days:[],ready:0,total:0,busy:0};
  function ftKey(mo){var ready=[];for(var i=1;i<=31;i++){var d=mo+'-'+(i<10?'0':'')+i;var t=new Date(d+'T12:00:00Z');if(t.toISOString().slice(0,10)!==d)break;var ok=false;try{ok=!!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(d))}catch(_){}if(ok)ready.push(d)}
    return {k:mo+'|'+ready.length+'|'+(window.kgmRosterStampR121?window.kgmRosterStampR121():'')+'|'+(window.KGM_FULLDONE_1006A||0),days:ready,total:+new Date(Date.UTC(+mo.slice(0,4),+mo.slice(5,7),0)).getUTCDate()}}
  function fulfil(mo){var K=ftKey(mo);if(FT.k!==K.k){FT={k:K.k,by:{},done:{},days:K.days,ready:0,total:K.total,busy:0}}
    if(FT.ready<FT.days.length&&!FT.busy){FT.busy=1;var my=FT;(function tick(){if(FT!==my)return;if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(tick,1600);return}
        var d=my.days[my.ready],P=null;try{P=window.kgmCrewPlanR121(d)}catch(_){}((P&&P.flights)||[]).forEach(function(f){if(f.depUTC==null)return;[].concat(f.pilots||[],f.cabin||[]).forEach(function(c){if(c&&c.empId)(my.by[c.empId]=my.by[c.empId]||[]).push(f)})});
        my.ready++;if(my.ready<my.days.length){setTimeout(tick,60);return}my.busy=0;
        Object.keys(my.by).forEach(function(id){my.by[id].sort(function(x,y){return x.depUTC-y.depUTC})});
        try{var el=document.getElementById('k118wb');if(el&&S.view==='admin'&&S.adminTab==='sched')el.innerHTML=body()}catch(_){}})()}
    var out=FT.out||{};if(!FT.out&&FT.ready>=FT.days.length){FT.out=out;Object.keys(FT.by).forEach(function(id){var a=FT.by[id],r={lay:[],a:a};for(var j=0;j+1<a.length;j++){var x=a[j],y=a[j+1];if(!BASE[x.to]&&x.to!=='BKK'&&y.fr===x.to){var h=(y.depUTC-x.arrUTC)/60;if(h>0&&h<24*8)r.lay.push(h)}}out[id]=r})}
    return {ready:FT.days.length,total:FT.total,by:out,pending:FT.ready<FT.days.length?(FT.days.length-FT.ready):0}}
  window.kgmCrewWishTabR1118A=function(mo){S.k118wMo=mo;S.k118wAll=0;var el=document.getElementById('k118wt');if(el)el.outerHTML=window.kgmCrewWishTableR1118A(true)};
  window.kgmCrewWishQR1118A=function(k,v){S['k118w'+k]=v;S.k118wAll=0;var el=document.getElementById('k118wb');if(el)el.innerHTML=body()};
  window.kgmCrewWishMoreR1118A=function(){S.k118wAll=1;var el=document.getElementById('k118wb');if(el)el.innerHTML=body()};
  window.kgmCrewWishOpenR1118A=function(o){S.k118wOpen=!!o;if(o){var el=document.getElementById('k118wb');if(el&&!el.innerHTML)el.innerHTML=body()}};
  var LN={short:['短（≤30h）','Short'],mid:['中（30–56h）','Medium'],long:['長（56h+）','Long']};
  function months(){var cur=td().slice(0,7),open=window.kgmCrewWishMonthR1115A(),L=[];var nx=addM(cur,1);if(nx!==open)L.push([nx,'locked']);L.push([open,'open']);return L}
  function body(){var zh=z(),mo=S.k118wMo,pl=null;try{pl=window.kgmCrewPoolR121&&window.kgmCrewPoolR121()}catch(_){}var PM={};((pl&&pl.pilots)||[]).concat((pl&&pl.cabin)||[]).forEach(function(p){if(p&&p.empId)PM[p.empId]=p});
    /* 只列正式組員（員工檔的機師／客艙）；排班引擎補人力用的虛擬組員不列 */
    var crew=(S.staff||[]).filter(function(x){return x&&x.empId&&(x.role==='pilot'||x.role==='cabin')&&x.active!==false&&!/resign|terminat|離職/i.test(String(x.employmentStatus||x.status||''))}).map(function(x){var q=PM[x.empId]||{};return [{empId:x.empId,name:x.name||q.name,rankCode:q.rankCode||x.rank,base:q.base||x.base,nat22:q.nat22},x.role==='pilot'?'P':'C']});
    var ff=fulfil(mo),q=String(S.k118wQ||'').trim().toUpperCase(),only=!!S.k118wOnly,sub=0,tn=0,th=0,ln=0,lh=0,rows=[];
    crew.forEach(function(x){var p=x[0];if(!p||!p.empId||/^V/.test(String(p.empId))&&!p.name)return;var base=p.base||(p.nat22==='TH'?'BKK':'TPE'),w=window.kgmCrewWishOfR1115A(p.empId,base,mo),lw=window.kgmCrewWishLayR1118A(p.empId,mo),f=ff.by[p.empId]||{n:0,hit:0,lay:[],a:[]};
      var set={};w.list.forEach(function(a){set[a]=1});var hit=0,n=0;(f.a||[]).forEach(function(g){if(g.positioning)return;var out=base==='BKK'?g.fr==='BKK':!!BASE[g.fr];if(!out)return;n++;if(set[g.to]||set[g.via])hit++});
      var lo=0;if(lw&&LAYB[lw])f.lay.forEach(function(h){if(h>=LAYB[lw][0]&&h<LAYB[lw][1])lo++});
      if(w.mine)sub++;tn+=n;th+=hit;if(lw){ln+=f.lay.length;lh+=lo}
      if(only&&!w.mine)return;if(q&&String(p.empId).toUpperCase().indexOf(q)<0&&String(p.name||'').toUpperCase().indexOf(q)<0)return;
      rows.push('<tr'+(w.mine?'':' class="rnd"')+'><td class="mono">'+E(p.empId)+'</td><td><b>'+E(p.name||'')+'</b></td><td>'+(x[1]==='P'?(zh?'機師':'Pilot'):(zh?'客艙':'Cabin'))+' · '+E(p.rankCode||p.rank||'')+'</td><td>'+E(base)+'</td><td>'+w.list.map(function(a){return '<span class="k118w-ap">'+E(a)+'</span>'}).join('')+'</td><td>'+(lw?E(zh?LN[lw][0]:LN[lw][1]):'<small>'+(zh?'不指定':'any')+'</small>')+'</td><td>'+(w.mine?(zh?'已送出 ':'Sent ')+(w.at?new Date(w.at+8*3600000).toISOString().slice(5,16).replace('T',' '):''):'<small>'+(zh?'沒送出 → 系統隨機':'not sent → random')+'</small>')+'</td><td>'+(n?'<b>'+hit+'</b> / '+n+' <small>('+Math.round(hit/n*100)+'%)</small>':'—')+'</td><td>'+(lw?(f.lay.length?lo+' / '+f.lay.length:'—'):'')+'</td></tr>')});
    var cap=S.k118wAll?rows.length:Math.min(rows.length,60);
    var sum='<div class="k118w-sum"><span>'+(zh?'已送出 ':'Submitted ')+'<b>'+sub+'</b> / '+crew.length+'</span><span>'+(zh?'已排好 ':'Rostered ')+'<b>'+ff.ready+'</b> / '+ff.total+(zh?' 天':' days')+'</span>'+(ff.pending?'<span><small>'+(zh?'正在讀取排班結果（還有 '+ff.pending+' 天）…':'Reading roster…')+'</small></span>':'<span>'+(zh?'從基地出發排到許願航點 ':'Outbound on a wished destination ')+'<b>'+(tn?Math.round(th/tn*100):0)+'%</b> <small>('+th+' / '+tn+')</small></span>')+(ln?'<span>'+(zh?'外站停留符合 ':'Layover matched ')+'<b>'+Math.round(lh/ln*100)+'%</b> <small>('+lh+' / '+ln+')</small></span>':'')+'</div>';
    return sum+'<table class="k118w-t"><thead><tr><th>'+(zh?'員編':'ID')+'</th><th>'+(zh?'姓名':'Name')+'</th><th>'+(zh?'職類':'Role')+'</th><th>'+(zh?'基地':'Base')+'</th><th>'+(zh?'許願航點（1～5 志願）':'Destination bids')+'</th><th>'+(zh?'外站停留':'Layover')+'</th><th>'+(zh?'送出':'Submitted')+'</th><th>'+(zh?'排到許願航點':'On wished dest.')+'</th><th>'+(zh?'停留符合':'Layover ok')+'</th></tr></thead><tbody>'+rows.slice(0,cap).join('')+'</tbody></table>'+(cap<rows.length?'<button type="button" class="btn" onclick="kgmCrewWishMoreR1118A()">'+(zh?'顯示全部 '+rows.length+' 位':'Show all '+rows.length)+'</button>':'')}
  window.kgmCrewWishTableR1118A=function(inner){try{if(!isCeo())return '';var zh=z(),M=months();if(!S.k118wMo||!M.some(function(m){return m[0]===S.k118wMo}))S.k118wMo=M[0][0];var mo=S.k118wMo,st=M.filter(function(m){return m[0]===mo})[0][1];
      return '<details class="k118w" id="k118wt"'+(S.k118wOpen||inner?' open':'')+' ontoggle="kgmCrewWishOpenR1118A(this.open)"><summary><b>'+(zh?'組員許願總表':'Crew bids')+'</b><small>'+(zh?'每位組員的許願航點、外站停留，和系統實際排出來的結果':'Each crew member’s bids and how the roster matched them')+'</small></summary>'
        +'<div class="k118w-tabs">'+M.map(function(m){var dl=window.kgmCrewWishDeadlineR1115B(m[0]),x=new Date(dl+8*3600000);return '<button type="button" class="'+(m[0]===mo?'on':'')+'" onclick="kgmCrewWishTabR1118A(\''+m[0]+'\')">'+m[0]+' · '+(m[1]==='locked'?(zh?'已截止・照許願排班中':'closed · rostering'):(zh?'開放中・'+(x.getUTCMonth()+1)+'/'+x.getUTCDate()+' 23:59 截止':'open'))+'</button>'}).join('')+'</div>'
        +'<p class="k118w-how">'+(zh?(st==='locked'?'這個月的許願已截止：排班引擎在所有法規條件（休息、資格、外站回程、國籍規則…）都相同時，<b>自動先排許願航點、再看外站停留</b>；沒送出的人用系統隨機的 5 個航點。下面「排到許願航點」是已經算好的班表實際結果（排班算到哪一天就統計到哪一天）。':'這個月還開放許願：組員送出（或截止時系統隨機）後，排班引擎會自動照許願排，不用另外操作。已經算好的日子會跟著重算（下次開頁）。'):(st==='locked'?'Bids are closed: the roster engine automatically prefers wished destinations, then layover length, whenever every legal constraint is equal.':'Bids still open; the engine applies them automatically.'))+'</p>'
        +'<div class="k118w-f"><input class="inp" placeholder="'+(zh?'搜尋姓名／員編':'Search name / ID')+'" value="'+E(S.k118wQ||'')+'" oninput="kgmCrewWishQR1118A(\'Q\',this.value)"><label><input type="checkbox"'+(S.k118wOnly?' checked':'')+' onchange="kgmCrewWishQR1118A(\'Only\',this.checked)"> '+(zh?'只看已送出':'Submitted only')+'</label></div>'
        +'<div id="k118wb">'+(S.k118wOpen||inner?body():'')+'</div></details>'}catch(e){return ''}};
  try{var cs=document.createElement('style');cs.textContent='.k118w{margin:10px 0 14px;padding:12px 16px;border:1px solid #d9e4dd;border-radius:14px;background:#fff}.k118w summary{cursor:pointer;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.k118w summary b{font-size:15px;color:#0B3D2E}.k118w summary small{color:#5f6b65}.k118w-tabs{display:flex;gap:8px;margin:10px 0 6px;flex-wrap:wrap}.k118w-tabs button{border:1px solid #cfd8d3;background:#f6f9f7;border-radius:999px;padding:5px 12px;font-size:12.5px;cursor:pointer}.k118w-tabs button.on{background:#0B3D2E;color:#fff;border-color:#0B3D2E}.k118w-how{font-size:12.5px;color:#43504a;line-height:1.6;margin:6px 0}.k118w-f{display:flex;gap:12px;align-items:center;margin:6px 0}.k118w-f .inp{max-width:240px;padding:6px 10px}.k118w-sum{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;margin:8px 0;color:#33413A}.k118w-sum b{color:#0B3D2E}.k118w-t{width:100%;border-collapse:collapse;font-size:12.5px}.k118w-t th{text-align:left;background:#f1f5f3;padding:6px 8px;font-weight:600;white-space:nowrap}.k118w-t td{padding:5px 8px;border-top:1px solid #eef2f0;vertical-align:middle}.k118w-t tr.rnd td{color:#6b7570}.k118w-ap{display:inline-block;padding:1px 6px;margin:1px 3px 1px 0;border-radius:6px;background:#EAF3EE;color:#0B3D2E;font-size:11.5px;font-weight:600}.k118w-t tr.rnd .k118w-ap{background:#f2f2f0;color:#7a817d}.k115w-lay{background:#FFF8EA}'+'.k115w{margin:12px 0 4px;padding:14px 16px;border:1px solid #d9e4dd;border-radius:14px;background:#f8fbf9}.k115w-h b{display:block;font-size:14px;color:#0B3D2E}.k115w-h small{display:block;margin-top:3px;color:#5f6b65;font-size:12px;line-height:1.5}.k115w-s{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center}.k115w-s select{padding:7px 10px;border:1px solid #cfd8d3;border-radius:10px;font-size:13px;min-width:140px}.k115w-n,.k115w-st{margin-top:8px;font-size:12.5px;color:#55605B}.k115w-ok{margin-top:8px;font-size:12.5px;color:#0B6B48;font-weight:700}.k115w-dl{display:inline-block;margin-left:10px;padding:2px 9px;border-radius:999px;background:#FFF4DC;color:#8A5A00;font-size:11.5px;font-weight:700;vertical-align:1px}.k115w-lk{margin-top:9px;padding:8px 11px;border-radius:10px;background:#EEF3F0;font-size:12.5px;color:#33413A}';document.head.appendChild(cs)}catch(_){}
})();
