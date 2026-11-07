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
