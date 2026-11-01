
/* ══ 1101A：後台（使用者 Round 3）══
   1. 通知管理「航班旅客」：第五航權／經停班要分航段選（使用者：「如果是第五航權航班要選哪個航段，可能選 10-31 KX86 TPE-BKK，
      另一個 Option 要是 11-01 KX86 BKK-FRA，因為另一個航段是隔天的，這種要寫清楚」；原本「符合的旅客：0 人」）。
      輸入班號＋起點出發日 → 列出這班每一段（各寫自己的日期與時刻、每段旅客人數），勾選要通知的航段；人數與發送都依勾選的航段。
      旅客比對用 segs7(b,true)（實際飛行的每一段，經停第二段是自己的日期），只算未取消的訂位。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function ad(d,k){return new Date(Date.parse(d+'T12:00:00Z')+k*864e5).toISOString().slice(0,10)}
  function hm(s){var m=/(\d{1,2}):(\d{2})/.exec(String(s||''));return m?(+m[1]*60+ +m[2]):0}
  function flies(f,d){try{return flyOn(f,new Date(d+'T12:00:00'))}catch(_){return true}}
  function seas(f,d){try{return Object.assign({},f,(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,d))||{})}catch(_){return f}}
  /* 這個班號、這個起點出發日的每一段（含日期） */
  window.kgmFlightLegsR1101A=function(code,date){
    code=String(code||'').toUpperCase().replace(/\s+/g,'');if(!code||!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))return [];
    var rows=[].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&f.code===code&&!f.via});if(!rows.length)return [];
    var tos={};rows.forEach(function(f){tos[f.to]=1});
    var first=rows.filter(function(f){return !tos[f.fr]&&flies(f,date)})[0]||rows.filter(function(f){return flies(f,date)})[0]||rows[0];
    var out=[],cur=first,d=date,guard=0;
    while(cur&&guard++<6){var s=seas(cur,d);out.push({code:code,fr:cur.fr,to:cur.to,date:d,dep:s.dep||cur.dep,arr:s.arr||cur.arr,dd:+(s.dd!=null?s.dd:cur.dd)||0,flies:flies(cur,d),key:[code,d,cur.fr,cur.to].join('|')});
      var nx=rows.filter(function(f){return f.fr===cur.to&&out.every(function(o){return o.fr!==f.fr})})[0];if(!nx)break;
      var arrDay=ad(d,+(s.dd!=null?s.dd:cur.dd)||0),ns=seas(nx,arrDay);d=hm(ns.dep||nx.dep)<hm(s.arr||cur.arr)?ad(arrDay,1):arrDay;cur=nx}
    return out};
  function legsOfBk(b){try{return (window.segs7?window.segs7(b,true):[]).map(function(s){var f=s.f||s;return {code:f.code,fr:f.fr,to:f.to,date:s.date||f.date}})}catch(_){return []}}
  function bksOn(leg){return (S.bookings||[]).filter(function(b){return b&&b.status!=='cancelled'&&legsOfBk(b).some(function(l){return l.code===leg.code&&l.fr===leg.fr&&l.to===leg.to&&l.date===leg.date})})}
  function paxN(list){return list.reduce(function(a,b){return a+((b.paxList||[]).length||1)},0)}
  function picked(leg){var m=S.anFltLegsR1101A||{};return m[leg.key]!==false}
  window.kgmNtLegPickR1101A=function(k,on){S.anFltLegsR1101A=S.anFltLegsR1101A||{};S.anFltLegsR1101A[k]=!!on;render()};
  window.kgmNtLegsR1101A=function(){var L=window.kgmFlightLegsR1101A(S.anFltCode,S.anFltDate);if(!L.length)return '';var zh=z();
    return '<div class="k28nt-legs"><div class="k28nt-h">'+(zh?(L.length>1?'這班有 '+L.length+' 個航段，請勾選要通知的航段（日期以各段出發地為準）：':'航段：'):'Choose the sector(s):')+'</div>'
      +L.map(function(l){var n=paxN(bksOn(l));return '<label class="k28nt-leg'+(l.flies?'':' off')+'"><input type="checkbox"'+(picked(l)?' checked':'')+(l.flies?'':' disabled')+' onchange="kgmNtLegPickR1101A(\''+E(l.key)+'\',this.checked)">'
        +'<b>'+E(l.date.slice(5))+'</b><span class="c">'+E(l.code)+'</span><span>'+E(l.fr)+' → '+E(l.to)+'</span><small>'+E(l.dep)+'–'+E(l.arr)+(l.dd?'<sup>+'+l.dd+'</sup>':'')+'</small>'
        +'<em>'+(l.flies?(n+(zh?' 位旅客':' pax')):(zh?'這天不飛':'not operating'))+'</em></label>'}).join('')+'</div>'};
  var c0=window.countPaxOnFlight;
  if(typeof c0==='function'){var c28=function(code,date){var L=window.kgmFlightLegsR1101A(code,date);if(!L.length)return c0.apply(this,arguments);
      return L.filter(function(l){return l.flies&&picked(l)}).reduce(function(a,l){return a+paxN(bksOn(l))},0)};window.countPaxOnFlight=c28;try{countPaxOnFlight=c28}catch(_){}}
  var s0=window.doSendFlightNotif;
  if(typeof s0==='function'){var s28=function(){var code=String(S.anFltCode||'').trim().toUpperCase(),date=String(S.anFltDate||'').trim(),L=window.kgmFlightLegsR1101A(code,date);if(!L.length)return s0.apply(this,arguments);
      var zh=z(),msgEl=document.getElementById('anFltMsg'),msg=String(msgEl&&msgEl.value||'').trim();if(!msg){alert(zh?'請輸入訊息':'Enter a message');return}
      var legs=L.filter(function(l){return l.flies&&picked(l)});if(!legs.length){alert(zh?'請至少勾選一個航段。':'Choose at least one sector.');return}
      var sent={},n=0;legs.forEach(function(l){bksOn(l).forEach(function(b){var uid=b.userId,k=(uid||b.pnr)+'|'+l.key;if(sent[k])return;sent[k]=1;n++;
        if(uid){S.notifs=S.notifs||[];S.notifs.unshift({title:'🛫 '+(zh?'航班通知 ':'Flight notice ')+l.code+' '+l.fr+'→'+l.to+' '+l.date,message:msg,date:(typeof todayISO==='function'?todayISO():l.date),read:false,userId:uid})}})});
      try{logAct(zh?'航班旅客通知':'Flight notice',code+' '+legs.map(function(l){return l.date.slice(5)+' '+l.fr+'-'+l.to}).join('、')+' · '+n)}catch(_){}
      try{save()}catch(_){}S.adminSaved='✓ '+(zh?'已發送給 '+n+' 筆訂位（'+legs.map(function(l){return l.date.slice(5)+' '+l.code+' '+l.fr+'→'+l.to}).join('、')+'）':'Sent to '+n+' booking(s)');render()};
    window.doSendFlightNotif=s28;try{doSendFlightNotif=s28}catch(_){}}
  /* 2. 換機身：航班從外站出發、候選飛機在 TPE（使用者 Round 3 圖五：「如果不是從 TPE 出發的話，要算從 TPE 出發的時間來支援，不能寫不在 BOS 就沒有」）
        空機飛行時間＝時刻表上 TPE→外站 那一班的飛行時間（沒有直飛就不算）；落地後至少 2 小時過站才接這一班；
        從空機起飛前 1 小時到這一班結束，這架不能有別的勤務。來得及＝可選，按鈕上寫空機幾點從 TPE 起飛。 */
  function tzOf(a){try{return (TZ&&TZ[a]!=null)?TZ[a]:8}catch(_){return 8}}
  function blk(fr,to){var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&!x.via&&!x.partner&&x.fr===fr&&x.to===to})[0];if(!f)return 0;
    if(+f.dur)return +f.dur;var d=hm(f.dep)-tzOf(fr)*60,a=hm(f.arr)+(+f.dd||0)*1440-tzOf(to)*60,m=a-d;while(m<=0)m+=1440;return m}
  function fmt(absLocal){var d=new Date(absLocal*60000).toISOString();return d.slice(5,10).replace('-','/')+' '+d.slice(11,16)}
  window.kgmFerryR1101A=function(tail,at,dest,legs,win,span,routeOf){var zh=z();if(at!=='TPE'&&at!=='TSA')return null;
    var b=blk('TPE',dest);if(!b)return {ok:false,why:zh?('不在 '+dest+'（在 '+at+'），TPE 沒有直飛 '+dest+' 可算空機調派'):'No TPE ferry route'};
    var start=win[0]+60,depUtc=start-tzOf(dest)*60,fUtc=depUtc-120-b,fTpe=fUtc+8*60;   /* 外站當地起飛 → UTC → 空機 TPE 起飛（台北時間） */
    var lo=fTpe-60,c=((S.tailAssign||{})[tail]||[]).filter(function(x){if(!x||legs.indexOf(x)>=0)return false;var q=span(x),fr=String(routeOf(x)).split('→')[0],q0=q[0]-(tzOf(fr)-8)*60,q1=q[1]-(tzOf(String(routeOf(x)).split('→')[1])-8)*60;
      var hi=start-(tzOf(dest)-8)*60+(win[1]-win[0]);return q0<hi&&lo<q1})[0];
    var h=Math.floor(b/60)+'h'+String(b%60).padStart(2,'0')+'m';
    if(c)return {ok:false,why:zh?('空機要 '+fmt(fTpe)+' 從 TPE 起飛（飛 '+h+'），但這架那時有 '+c.code+' '+routeOf(c)+' '+c.dep+'，來不及'):'Ferry too late: '+c.code};
    return {ok:true,fromTPE:fmt(fTpe),block:b,to:dest,depAbs:fTpe,arrAbs:fUtc+b+tzOf(dest)*60,why:zh?('可從 TPE 空機調派：'+fmt(fTpe)+' 起飛 TPE→'+dest+'（飛 '+h+'，落地過站 2 小時）'):('Ferry from TPE '+fmt(fTpe)+' ('+h+')')}};
  /* 1102A：空機調派寫進排班（使用者：「空機調派寫進排班」；1101B 只在換機身清單算給你看）
     · 機隊：存檔換機身時，選的那架要從 TPE 空機過去 → 那段空機（KX8900，不載客、positioningR830）寫進那架飛機的輪轉（S.tailAssign），
       跟換機身紀錄（S.tailPickR1023A）存在一起，整年重排後重新套用換機身時一起放回去。
     · 組員：挑 2 位 TPE 基地、有這個機型資格（同機型族）、空機前後一天都沒有勤務的機師（機長＋副機長），
       班表寫「空機調派 KX8900 TPE→外站」＋落地休息 ≥ 12 小時後搭第一班 KGM 回 TPE（DH）。要等組員班表算到那幾天才挑（不同步算還沒算的日子）。 */
  function rt30(t){t=String(t||'');return /^A3[12]|^A21/.test(t)?'A320':/^A33/.test(t)?'A330':/^B78/.test(t)?'B787':/^B77/.test(t)?'B777':/^A35/.test(t)?'A350':/^A38/.test(t)?'A380':''}
  function loc30(abs){var d=new Date(abs*60000).toISOString();return {date:d.slice(0,10),time:d.slice(11,16)}}
  window.kgmFerryRowR1102A=function(tail,pk){try{var F=pk&&pk.ferryR1102A;if(!F||!tail)return false;var TA=S.tailAssign=S.tailAssign||{},a=loc30(F.depAbs),b=loc30(F.arrAbs),id=F.id||(pk.code+'|'+pk.date);
      Object.keys(TA).forEach(function(t){if(t!==tail&&TA[t])TA[t]=TA[t].filter(function(x){return !(x&&x.ferryR1102A===id)})});
      var L=TA[tail]=TA[tail]||[];if(L.some(function(x){return x&&x.ferryR1102A===id}))return false;
      L.push({date:a.date,code:'KX8900',route:'TPE→'+F.to,fr:'TPE',to:F.to,dep:a.time,arr:b.time,dd:Math.round((Date.parse(b.date)-Date.parse(a.date))/86400000),positioningR830:true,noPax:true,manualR69:1,ferryR1102A:id,remark:(z()?'空機調派（接 ':'Ferry (for ')+pk.code+' '+pk.date+')'});
      L.sort(function(x,y){return (String(x.date)+String(x.dep)).localeCompare(String(y.date)+String(y.dep))});return true}catch(_){return false}};
  /* 組員：只在組員班表已經算好那幾天時挑人；挑好就記在換機身紀錄上（之後不再變） */
  function busy30(d){var o={};try{if(!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(d)))return null;(window.kgmCrewPlanR121(d).flights||[]).forEach(function(f){(f.pilots||[]).concat(f.cabin||[]).forEach(function(c){if(c&&c.empId)o[c.empId]=1})})}catch(_){return null}return o}
  window.kgmFerryCrewR1102A=function(pk){try{var F=pk&&pk.ferryR1102A;if(!F)return null;if(F.crew&&F.crew.length)return F.crew;var a=loc30(F.depAbs),busy={},ds=[addDays(a.date,-1),a.date,addDays(a.date,1),addDays(a.date,2)];
      for(var i=0;i<ds.length;i++){var b=busy30(ds[i]);if(!b)return null;Object.assign(busy,b)}
      (S.tailPickR1023A||[]).forEach(function(q){((q&&q.ferryR1102A&&q.ferryR1102A.crew)||[]).forEach(function(c){busy[c.empId]=1})});
      var ty='';try{ty=(window.kgmTypeOfTailR1023A?window.kgmTypeOfTailR1023A(pk.tail):'')||''}catch(_){}if(!ty){try{ty=acftOfFlight(pk.code,pk.date)}catch(_){}}var rt=rt30(ty),P=(window.kgmCrewPoolR121()||{}).pilots||[];
      var pick=function(rank){return P.filter(function(c){return c&&c.base==='TPE'&&c.rank===rank&&(!rt||c.rating===rt)&&!busy[c.empId]&&!c.standbyOnly}).sort(function(x,y){return (x.virtualR121?1:0)-(y.virtualR121?1:0)||String(x.empId).localeCompare(String(y.empId))})[0]};
      var cp=pick('CP'),fo=pick('FO');if(!cp||!fo)return null;
      var arrUTC=F.arrAbs-((TZ&&TZ[F.to]!=null?TZ[F.to]:8)*60),back=null;try{for(var k3=0;k3<16&&!back;k3++){var nd=arrUTC+720+180*(k3+1)+60,x3=window.kgmRealDhR1004B?window.kgmRealDhR1004B(F.to,'TPE',new Date((nd+480)*60000).toISOString().slice(0,10),nd):null;if(x3&&x3.depUTC>=arrUTC+720&&!x3.viaR1004B)back=x3}}catch(_){}   /* 落地休息 12 小時後的第一班 KGM 直飛回 TPE */
      F.crew=[{empId:cp.empId,name:cp.name||'',rank:'CP',pos:'PIC'},{empId:fo.empId,name:fo.name||'',rank:'FO',pos:'SIC'}];F.rating=rt;F.dhBack=back&&back.depUTC>=arrUTC+12*60?{code:back.code,date:back.date,dep:back.dep,arr:back.arr,dd:back.dd||0,depUTC:back.depUTC,arrUTC:back.arrUTC}:null;
      try{save()}catch(_){}return F.crew}catch(e){return null}};
  /* 組員班表（kgmCrewChainR210）：空機調派的兩位機師在那一天多一段勤務、之後一段 DH 回 TPE */
  function chainWrap30(){var O=window.kgmCrewChainR210;if(typeof O!=='function'||O.__fy30)return;var w=function(empId,start,days){var out=O.apply(this,arguments);try{
      applyDh30(empId,out);
      (S.tailPickR1023A||[]).forEach(function(pk){var F=pk&&pk.ferryR1102A;if(!F||!F.crew)return;if(!F.crew.some(function(c){return c.empId===empId}))return;var a=loc30(F.depAbs),b=loc30(F.arrAbs),me=F.crew.filter(function(c){return c.empId===empId})[0];
        (out||[]).forEach(function(day){if(day.date===a.date&&!day.legs.some(function(l){return l&&l.ferryR1102A})){day.legs.push({code:'KX8900',fr:'TPE',to:F.to,date:a.date,arrDate:b.date,dep:a.time,arr:b.time,dd:Math.round((Date.parse(b.date)-Date.parse(a.date))/86400000),depUTC:F.depAbs-480,arrUTC:F.arrAbs-((TZ&&TZ[F.to]!=null?TZ[F.to]:8)*60),block:F.block,blockStr:Math.floor(F.block/60)+':'+String(F.block%60).padStart(2,'0'),acft:pk.tail,type:F.rating||'',operating:true,ferryR1102A:true,posCode:me.pos,posR1009A:me.pos,remark:(z()?'空機調派（不載客）・接 ':'Ferry (no passengers) for ')+pk.code+' '+pk.date});day.rest=false;day.reason='ferry';day.awayAt=F.to}
          if(F.dhBack&&day.date===F.dhBack.date&&!day.legs.some(function(l){return l&&l.ferryDhR1102A})){day.legs.push({code:'DH',fr:F.to,to:'TPE',date:F.dhBack.date,dep:F.dhBack.dep,arr:F.dhBack.arr,dd:F.dhBack.dd,depUTC:F.dhBack.depUTC,arrUTC:F.dhBack.arrUTC,block:0,blockStr:'DH',acft:'—',type:'—',deadhead:true,operating:false,dhFlightR1004B:F.dhBack.code,dhDateR1004B:F.dhBack.date,ferryDhR1102A:true,remark:(z()?'DH · 空機調派後返回 TPE':'DH · return after ferry')});day.rest=false;day.reason='ferry';day.awayAt=null}})})}catch(_){}return out};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__fy30=1;window.kgmCrewChainR210=w}
  /* 1102A：DH 改期後自動重排組員班表（使用者：「DH 改期後自動重排組員班表」；1101B 只搬 DH 訂位與名單）
     · 班表：原本那段 DH 拿掉，新的那班 DH 放在新的日期（S.dhMoveR1101A 最後一筆有效）。
     · 衝突：新 DH 落地＋60 分鐘之後才趕得上的勤務（原 DH 起飛到新 DH 落地＋60 分之間起飛的執勤段）→ 自動找代班：
       同基地、同職級（機師另看同機型族）、那幾天組員班表沒有勤務的人；代班的人不在起飛站就先 DH 過去（最晚落地的 KGM 班）。
       紀錄寫在那筆改期上（subR1102A），原組員班表那段拿掉、代班的人加上，雙方都收到員工通知。
     · 要等組員班表算到那幾天才檢查（不同步算還沒算的日子）；沒算到的先記著，背景每分鐘再試。 */
  function tz30(a){try{return (TZ&&TZ[a]!=null)?+TZ[a]:8}catch(_){return 8}}
  function utc30(d,t,ap){return Date.parse(d+'T'+t+':00Z')/60000-tz30(ap)*60}
  function lastMoves30(){var last={};(S.dhMoveR1101A||[]).forEach(function(m){if(m&&m.active!==false&&m.empId)last[m.pnr]=m});return Object.keys(last).map(function(k){return last[k]})}
  function applyDh30(empId,out){lastMoves30().forEach(function(m){var o=m.orig||{},t=m.to||{};
      if(m.empId===empId){
        out.forEach(function(day){var n0=day.legs.length;day.legs=day.legs.filter(function(l){return !(l&&l.deadhead&&!l.ferryDhR1102A&&!l.dhMovedR1102A&&(l.dhFlightR1004B===o.code||l.code===o.code)&&l.fr===o.fr&&l.to===o.to&&String(l.dhDateR1004B||l.date||day.date)===o.date)});if(n0&&!day.legs.length){day.rest=true;day.reason='dh_moved'}});
        var dd=out.filter(function(day){return day.date===t.date})[0];
        if(dd&&!dd.legs.some(function(l){return l&&l.dhMovedR1102A===m.pnr})&&t.dep&&t.arr){var dU=utc30(t.date,t.dep,t.fr),aU=utc30(addDays(t.date,+t.dd||0),t.arr,t.to);
          dd.legs.push({code:'DH',fr:t.fr,to:t.to,date:t.date,dep:t.dep,arr:t.arr,dd:+t.dd||0,depUTC:dU,arrUTC:aU,block:0,blockStr:'DH',acft:'—',type:'—',deadhead:true,operating:false,dhFlightR1004B:t.code,dhDateR1004B:t.date,dhMovedR1102A:m.pnr,
            remark:(z()?'DH · 已改到 '+t.code+' '+t.date+'（原 '+o.code+' '+o.date+'）':'DH · moved to '+t.code+' '+t.date)});
          dd.legs.sort(function(a,b){return (+a.depUTC||0)-(+b.depUTC||0)});dd.rest=false;dd.reason='assigned'}
        (m.subR1102A||[]).forEach(function(sb){out.forEach(function(day){var n0=day.legs.length,cut=false;day.legs=day.legs.filter(function(l){var x=l&&!l.deadhead&&l.code===sb.leg.code&&l.fr===sb.leg.fr&&l.to===sb.leg.to&&+l.depUTC===+sb.leg.depUTC;if(x)cut=true;return !x});
          if((cut||day.date===sb.day)&&!day.legs.some(function(l){return l&&!l.deadhead}))day.legs=day.legs.filter(function(l){return l&&l.dhMovedR1102A});   /* 那天沒有勤務了 → 為那段勤務排的地面轉場／DH 一起拿掉（改期後的 DH 留著） */
          if(n0&&!day.legs.length){day.rest=true;day.reason='dh_moved'}})})}
      (m.subR1102A||[]).forEach(function(sb){if(sb.in!==empId)return;var day=out.filter(function(x){return x.date===sb.day})[0];if(!day||day.legs.some(function(l){return l&&l.subForR1102A===m.pnr&&+l.depUTC===+sb.leg.depUTC}))return;
        var ex=day.legs.filter(function(l){return l&&!l.deadhead&&l.code===sb.leg.code&&l.fr===sb.leg.fr&&+l.depUTC===+sb.leg.depUTC})[0];if(ex){ex.subForR1102A=m.pnr;ex.remark=(z()?'代班（'+(sb.outName||sb.out)+' 的 DH 改期，趕不上這班）':'Covering for '+sb.out);return}   /* 引擎那天的計畫已經換人（見 planWrap30）→ 班表本來就有這段 */
        if(sb.dh)day.legs.push(Object.assign({},sb.dh,{subForR1102A:m.pnr}));
        day.legs.push(Object.assign({},sb.leg,{subForR1102A:m.pnr,remark:(z()?'代班（'+(sb.outName||sb.out)+' 的 DH 改期，趕不上這班）':'Covering for '+sb.out)}));day.legs.sort(function(a,b){return (+a.depUTC||0)-(+b.depUTC||0)});day.rest=false;day.reason='assigned'})})}
  /* 引擎每天的計畫（kgmCrewPlanR121）也換人：航班資料、組員名單、DH 名單、薪資都讀這一份，跟班表一致 */
  function subPlan30(d,r){try{if(!r||!r.flights)return r;lastMoves30().forEach(function(m){(m.subR1102A||[]).forEach(function(sb){if(sb.day!==d)return;r.flights.forEach(function(f){if(!f||f.code!==sb.leg.code||f.fr!==sb.leg.fr||f.to!==sb.leg.to)return;
        ['pilots','cabin'].forEach(function(k){(f[k]||[]).forEach(function(c,i){if(c&&c.empId===sb.out){f[k][i]=Object.assign({},c,{empId:sb.in,name:sb.inName||c.name,subForR1102A:m.pnr,subOutR1102A:sb.out})}})})})})})}catch(_){}return r}
  function planWrap30(){var O=window.kgmCrewPlanR121;if(typeof O!=='function'||O.__sub30)return;var w=function(d){return subPlan30(d,O.apply(this,arguments))};try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__sub30=1;window.kgmCrewPlanR121=w}
  planWrap30();setTimeout(planWrap30,0);setTimeout(planWrap30,5000);
  function touch30(){try{lastMoves30().forEach(function(m){(m.subR1102A||[]).forEach(function(sb){if(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(sb.day))window.kgmCrewPlanR121(sb.day)})})}catch(_){}}
  window.kgmDhReplanR1102A=function(m){try{if(!m||m.replanR1102A)return m&&m.replanR1102A;var t=m.to,fr=m.from||{};if(!t||!t.dep)return null;
      var d0=fr.date||m.orig.date,days=[addDays(d0,-1),d0,addDays(d0,1),t.date,addDays(t.date,1),addDays(t.date,2)];for(var i=0;i<days.length;i++)if(!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(days[i])))return null;
      var lo=utc30(d0,fr.dep||'00:00',m.orig.fr),aU=utc30(addDays(t.date,+t.dd||0),t.arr,t.to),hi=aU+60,start=d0<t.date?d0:t.date;
      var ch=window.kgmCrewChainR210(m.empId,addDays(start,-1),4+Math.max(0,Math.round((Date.parse(t.date)-Date.parse(start))/864e5)));
      var bad=[];ch.forEach(function(day){day.legs.forEach(function(l){if(l&&!l.deadhead&&l.operating!==false&&!l.subForR1102A&&+l.depUTC>=lo-60&&+l.depUTC<hi)bad.push({day:day.date,leg:l})})});
      var P=window.kgmCrewPoolR121()||{},all=(P.pilots||[]).concat(P.cabin||[]),me=all.filter(function(c){return c.empId===m.empId})[0]||{},busy={};
      days.forEach(function(d){Object.assign(busy,busy30(d)||{})});lastMoves30().forEach(function(x){(x.subR1102A||[]).forEach(function(s2){busy[s2.in]=1})});(S.tailPickR1023A||[]).forEach(function(q){((q&&q.ferryR1102A&&q.ferryR1102A.crew)||[]).forEach(function(c){busy[c.empId]=1})});
      var subs=[],prev=null;bad.forEach(function(b){var rep=null;if(prev&&prev.loc===b.leg.fr&&+b.leg.depUTC>=prev.free)rep=prev.c;   /* 同一趟的下一段：同一位代班接著飛 */
        if(!rep){var cs=all.filter(function(c){return c&&c.empId!==m.empId&&c.role===me.role&&c.rank===me.rank&&(me.role!=='pilot'||c.rating===me.rating)&&c.base===(me.base||'TPE')&&!busy[c.empId]&&!c.standbyOnly}).sort(function(x,y){return (x.virtualR121?1:0)-(y.virtualR121?1:0)||String(x.empId).localeCompare(String(y.empId))});
          for(var ci=0;ci<cs.length&&ci<40&&!rep;ci++){var cc=null;try{cc=window.kgmCrewChainR210(cs[ci].empId,addDays(b.day,-1),1)}catch(_){}if(cc&&cc[0]&&!cc[0].awayAt&&!(cc[0].legs||[]).length)rep=cs[ci];else busy[cs[ci].empId]=1}}   /* 前一天要在基地、沒有勤務（不在外站過夜） */
        if(!rep){subs.push({day:b.day,leg:b.leg,none:true});return}busy[rep.empId]=1;var dh=null,home=rep.base||'TPE',same=prev&&prev.c===rep;
        if(!same&&b.leg.fr!==home&&!((home==='TPE'||home==='TSA')&&(b.leg.fr==='TPE'||b.leg.fr==='TSA'))){var x=null;try{x=window.kgmRealDhR1004B(home,b.leg.fr,b.day,+b.leg.depUTC)}catch(_){}if(x)dh={code:'DH',fr:home,to:b.leg.fr,date:x.date,dep:x.dep,arr:x.arr,dd:x.dd||0,depUTC:x.depUTC,arrUTC:x.arrUTC,block:0,blockStr:'DH',acft:'—',type:'—',deadhead:true,operating:false,dhFlightR1004B:x.code,dhDateR1004B:x.date,remark:(z()?'DH · 代班前往 ':'DH · positioning to ')+b.leg.fr}}
        var L=Object.assign({},b.leg);delete L.subForR1102A;subs.push({day:b.day,leg:L,in:rep.empId,inName:rep.name||'',out:m.empId,outName:m.name||'',dh:dh});prev={c:rep,loc:b.leg.to,free:(+b.leg.arrUTC||+b.leg.depUTC)+600}});
      m.subR1102A=subs.filter(function(x){return !x.none});m.replanR1102A={at:new Date().toISOString(),conflicts:bad.length,covered:m.subR1102A.length,missing:subs.filter(function(x){return x.none}).map(function(x){return x.leg.code+' '+x.day})};
      m.subR1102A.forEach(function(sb){try{notifyStaff(sb.in,(z()?'【代班】':'[Cover] ')+sb.leg.code+' '+sb.leg.fr+'→'+sb.leg.to+' '+sb.day+' '+(sb.leg.dep||'')+(z()?'（'+sb.outName+' 的 DH 改期趕不上，由您代班'+(sb.dh?'；先 DH '+sb.dh.dhFlightR1004B+' '+sb.dh.date+' 前往 '+sb.leg.fr:'')+'）':''));notifyStaff(sb.out,(z()?'【班表異動】':'[Roster] ')+sb.leg.code+' '+sb.day+(z()?' 已改由 '+sb.inName+'（'+sb.in+'）代班（您的 DH 改期）。':' reassigned.'))}catch(_){}});
      touch30();try{save()}catch(_){}return m.replanR1102A}catch(e){try{console.warn('dh30',e)}catch(_){}return null}};
  setInterval(function(){try{lastMoves30().forEach(function(m){if(!m.replanR1102A)window.kgmDhReplanR1102A(m)});touch30()}catch(_){}},60000);
  chainWrap30();setTimeout(chainWrap30,0);setTimeout(chainWrap30,5000);
  /* 組員班表算到那幾天時再挑人（背景，每分鐘看一次，不同步算） */
  setInterval(function(){try{(S.tailPickR1023A||[]).forEach(function(pk){if(pk&&pk.ferryR1102A&&!(pk.ferryR1102A.crew&&pk.ferryR1102A.crew.length))window.kgmFerryCrewR1102A(pk)})}catch(_){}},60000);
  /* 3. 轉降續航段（使用者 Round 3：「也要可以 add status to flight，eg divert to KIX 要追加 KX37 KIX-TPE，僅限該日在航班動態」）
        航班狀態設成 Diverted＋轉降地 → 航班動態（依航班號、依航線）在續航起飛那一天多一段「KX37 KIX→TPE」，只在那天出現。
        續航時刻來源：①編輯面板手填 ②後台 AI 轉降紀錄（S.divertsR1018A 的 contDep／contArr）③估算：原班飛行時間扣掉轉降地→目的地的時刻表飛行時間＝落地轉降地，
        地停 2 小時再起飛，飛行時間用時刻表上 轉降地→目的地 那一班（沒有就不估，請手填）。存在 S.flightOverrides[key].divertLegR1101A。 */
  function keyParts(k){var p=String(k||'').split('_');var date=p[p.length-1],code=p[0],fr=p.length>=4?p[1]:'',to=p.length>=4?p[2]:'';
    var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.via&&(!fr||(x.fr===fr&&x.to===to))})[0];return f?{code:code,date:date,f:f}:null}
  function blkAny(fr,to){var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&!x.via&&!x.partner&&x.fr===fr&&x.to===to})[0];if(!f)return 0;if(+f.dur)return +f.dur;
    var d=hm(f.dep)-tzOf(fr)*60,a=hm(f.arr)+(+f.dd||0)*1440-tzOf(to)*60,m=a-d;while(m<=0)m+=1440;return m}
  function loc(abs,ap){var d=new Date((abs+tzOf(ap)*60)*60000).toISOString();return {date:d.slice(0,10),hm:d.slice(11,16)}}
  window.kgmDivertLegR1101A=function(code,date,f,ov){if(!(ov&&ov.status==='Diverted'&&ov.divertTo))return null;var alt=String(ov.divertTo).toUpperCase(),to=f.to,fr=f.fr;if(alt===to||alt===fr)return null;
    var L=ov.divertLegR1101A;if(L&&L.dep&&L.date)return {code:code,fr:alt,to:to,date:L.date,dep:L.dep,arr:L.arr||'',dd:+L.dd||0,src:L.est?'est':'manual'};
    var r=(S.divertsR1018A||{})[code+'|'+date+'|'+fr];if(r&&r.contDep&&r.contArr){var a=loc(r.contDep,alt),b=loc(r.contArr,to);return {code:code,fr:alt,to:to,date:a.date,dep:a.hm,arr:b.hm,dd:Math.round((Date.parse(b.date)-Date.parse(a.date))/864e5),src:'ai'}}
    var s=seas(f,date),k=blkAny(alt,to);if(!k)return null;var dd0=+((ov.depDD!=null&&ov.depDD!=='')?ov.depDD:0)||0,dep=ov.dep||s.dep;
    var depUtc=Date.parse(date+'T'+dep+':00Z')/60000+dd0*1440-tzOf(fr)*60,tot=hm(s.arr)+(+s.dd||0)*1440-tzOf(to)*60-(hm(s.dep)-tzOf(fr)*60);while(tot<=0)tot+=1440;
    var land=depUtc+Math.max(60,tot-k)+30,cd=land+120,ca=cd+k,a2=loc(cd,alt),b2=loc(ca,to);
    return {code:code,fr:alt,to:to,date:a2.date,dep:a2.hm,arr:b2.hm,dd:Math.round((Date.parse(b2.date)-Date.parse(a2.date))/864e5),src:'est',land:loc(land,alt)}};
  window.kgmDivertFindR1101A=function(byNo,kx,D,stFr,stTo){var out=[],O=S.flightOverrides||{};Object.keys(O).forEach(function(k){var ov=O[k];if(!ov||ov.status!=='Diverted'||!ov.divertTo)return;var P=keyParts(k);if(!P)return;
      var L=window.kgmDivertLegR1101A(P.code,P.date,P.f,ov);if(!L||L.date!==D)return;if(byNo?P.code!==kx:!(L.fr===stFr&&L.to===stTo))return;
      out.push({legs:[{f:{code:P.code,fr:L.fr,to:L.to,dep:L.dep,arr:L.arr,dd:L.dd,acft:P.f.acft,days:'daily',divertContR1101A:true,divertFromR1101A:P.f.fr},d:L.date}],via:null})});return out};
  window.kgmDivertFieldsR1101A=function(k){var zh=z(),ov=(S.flightOverrides||{})[k]||{},P=keyParts(k);var L=P?window.kgmDivertLegR1101A(P.code,P.date,P.f,Object.assign({},ov,{status:'Diverted',divertTo:ov.divertTo||''})):null;var man=ov.divertLegR1101A&&!ov.divertLegR1101A.est?ov.divertLegR1101A:{};
    return '<div class="k28-dvc"><label>'+(zh?'續航起飛（轉降地當地時間）':'Continuation dep (local)')+'</label><input id="adDvDep" class="inp" placeholder="'+(L?L.dep:'HH:MM')+'" value="'+E(man.dep||'')+'"><small>'+(L?((zh?'續航日期 ':'Date ')+L.date+(L.src==='est'?(zh?'（估算，可改）':' (estimated)'):L.src==='ai'?(zh?'（AI 轉降紀錄）':' (AI record)'):'')):(zh?'Diverted 時填轉降地即自動估算':'Set Diverted + airport'))+'</small></div>'
      +'<div class="k28-dvc"><label>'+(zh?'續航抵達（目的地當地時間）':'Continuation arr (local)')+'</label><input id="adDvArr" class="inp" placeholder="'+(L?L.arr:'HH:MM')+'" value="'+E(man.arr||'')+'"><small>'+(zh?'航班動態會在續航那天多一段 ':'Shown in flight status: ')+(P&&L?E(P.code+' '+L.fr+'→'+L.to):'')+'</small></div>'};
  /* 1101B：後台「航班狀態」頁（使用者：「後台航班動態你沒改啊」）——
     ① 每班狀態底下寫預估出發／抵達（kgmOpsPredR1026C＝predict7，跟前台航班動態、航班資料路線圖同一份；含繞道比班表多的時間），比班表晚／早幾分、原因；
     ② Diverted 寫轉降地與續航段；③ 續航那天、續航航線（如 KIX→TPE）多一列續航段（只在那天）。 */
  function dm(a,b){var x=hm(a)-hm(b);if(x>720)x-=1440;if(x<-720)x+=1440;return x}
  window.kgmAdStNoteR1101B=function(f,date,ov,st){try{var zh=z(),o=[];ov=ov||{};var lb=st==='Arrived'?(zh?'實際':'ACT'):st==='Departed'?(zh?'起飛後預估':'EST'):'EST';
      if(ov.status==='Diverted'&&ov.divertTo){var L=window.kgmDivertLegR1101A(f.code,date,f,ov);o.push('<span class="k29st-dv">'+(zh?'轉降 ':'Diverted to ')+E(String(ov.divertTo).toUpperCase())+(L?(zh?'・續航 ':' · continues ')+E(L.date.slice(5)+' '+L.dep+' '+L.fr+'→'+L.to+(L.arr?' '+L.arr+(L.dd?'⁺'+L.dd:''):'')):'')+'</span>')}
      else if(ov.status!=='Cancelled'){var p=window.kgmOpsPredR1026C?window.kgmOpsPredR1026C(f,date):null;
        if(p&&p.estDep&&p.estArr){var dD=p.depDelta!=null?p.depDelta:dm(p.estDep,p.scheduledDep),aD=p.arrDelta!=null?p.arrDelta:dm(p.estArr,p.scheduledArr);
          var t=function(v){return v===0?(zh?'準時':'on time'):(v>0?(zh?'晚 ':'+')+v+(zh?' 分':' min'):(zh?'早 ':'')+(-v)+(zh?' 分':' min early'))};
          o.push('<span class="k29st-est"><b>'+lb+'</b> '+E(p.estDep)+' <small>'+t(dD)+'</small> → '+E(p.estArr)+' <small class="'+(aD>=15?'late':aD<=-5?'early':'')+'">'+t(aD)+'</small></span>');
          if(p.reasonR1026C&&(p.arrLateR1101B||aD>=15||dD>=15))o.push('<span class="k29st-why">'+E(p.reasonR1026C)+'</span>');
          else if(p.warMinR1101B>0)o.push('<span class="k29st-why">'+(zh?'含繞道關閉空域 '+p.warMinR1101B+' 分':'incl. '+p.warMinR1101B+' min detour')+'</span>')}}
      return o.length?'<div class="k29st">'+o.join('')+'</div>':''}catch(_){return ''}};
  window.kgmAdStExtraR1101B=function(fr,to,date){try{var zh=z(),L=window.kgmDivertFindR1101A(false,'',date,fr,to)||[];return L.map(function(x){var g=x.legs[0].f;
      return '<tr class="k29st-cont"><td style="padding:7px 10px"><div style="font-weight:700;color:var(--g);font-size:13px">'+E(g.code)+'</div><div style="font-size:10px;color:#888">'+(zh?'轉降續航段':'Diversion continuation')+'</div></td><td style="padding:7px 10px;font-size:12px">'+E(g.fr)+' → '+E(g.to)+'</td><td style="padding:7px 10px;font-size:13px;font-weight:600">'+E(g.dep)+'</td><td style="padding:7px 10px;font-size:13px;font-weight:600">'+E(g.arr||'—')+(g.dd?'<sup>+'+g.dd+'</sup>':'')+'</td><td style="padding:7px 10px"><span style="font-weight:700;color:#b45309">&bull; '+(zh?'續航（原 '+E(g.divertFromR1101A)+' 出發，轉降 '+E(g.fr)+'）':'Continuation (diverted from '+E(g.divertFromR1101A)+')')+'</span></td><td style="padding:7px 10px;font-size:11px;color:#889">'+(zh?'在原航班編輯':'Edit on the original flight')+'</td></tr>'}).join('')}catch(_){return ''}};
  /* 1102A：航班狀態編輯——填新的出發時間，抵達依當天飛行狀況（kgmOpsPredR1026C：高空風、繞道、目的地天候）自動帶入；手動改過抵達就不再自動覆蓋 */
  /* 1102A：航班狀態編輯面板的欄位只存在畫面上，背景排班／模擬一重畫就被洗掉（實測填好出發、抵達 10 秒內變空白）
     → 每次重畫前把面板裡的欄位值記進 S.adDraftR1102A（同一個 editKey），重畫後填回；換一班、存檔或關閉就丟掉。 */
  function edBox(){return document.querySelector('.k28-edit')}
  var ED30=null;   /* 畫面上這個面板是哪一班（換一班時舊面板的值不能帶過去） */
  function grab30(){try{if(!(S.view==='admin'&&S.adminTab==='status'&&S.adEditKey)||ED30!==S.adEditKey){S.adDraftR1102A=null;return}var b=edBox();if(!b)return;var v={};
      [].forEach.call(b.querySelectorAll('input[id],select[id],textarea[id]'),function(e){v[e.id]=e.type==='checkbox'?(e.checked?'1':''):e.value});
      var a=document.getElementById('adNewArr');S.adDraftR1102A={key:S.adEditKey,v:v,man:!!(a&&a.dataset.man30==='1'),focus:(document.activeElement&&document.activeElement.id)||''}}catch(_){}}
  function put30(){try{ED30=edBox()?S.adEditKey:null;var D=S.adDraftR1102A;if(!D)return;if(D.key!==S.adEditKey||S.adminTab!=='status'){S.adDraftR1102A=null;return}var b=edBox();if(!b)return;
      Object.keys(D.v).forEach(function(id){var e=document.getElementById(id);if(!e||!b.contains(e))return;if(e.type==='checkbox')e.checked=D.v[id]==='1';else if(e.value!==D.v[id])e.value=D.v[id]});
      var a=document.getElementById('adNewArr');if(a&&D.man){a.dataset.man30='1'}if(a&&!a.__k30){a.__k30=1;a.addEventListener('input',function(){a.dataset.man30='1'})}
      if(D.focus){var f=document.getElementById(D.focus);if(f&&b.contains(f)&&document.activeElement!==f)try{f.focus({preventScroll:true})}catch(_){}}}catch(_){}}
  try{var r30=window.render;if(typeof r30==='function'&&!r30.__ed30){var w30=function(){grab30();var x=r30.apply(this,arguments);put30();return x};w30.__ed30=1;window.render=w30;try{render=w30}catch(_){}}}catch(_){}
  window.kgmEstFillR1102A=function(){try{var k=S.adEditKey,P=keyParts(k);if(!P)return;var dEl=document.getElementById('adNewDep'),aEl=document.getElementById('adNewArr');if(!dEl||!aEl)return;
      if(!aEl.__k30){aEl.__k30=1;aEl.addEventListener('input',function(){aEl.dataset.man30='1'})}
      if(aEl.dataset.man30==='1')return;
      var m=/^(\d{1,2}):(\d{2})$/.exec(String(dEl.value||'').trim());if(!m)return;
      var s=seas(P.f,P.date),pr=null;try{pr=window.kgmOpsPredR1026C?window.kgmOpsPredR1026C(P.f,P.date):null}catch(_){}
      var inflt=pr?((pr.arrDelta||0)-(pr.depDelta||0)):0,ddEl=document.getElementById('adDepDD'),depDD=ddEl?(+ddEl.value||0):0;
      var shift=(+m[1])*60+(+m[2])+depDD*1440-hm(s.dep),abs=hm(s.arr)+(+s.dd||0)*1440+shift+inflt,day=Math.floor(abs/1440),mm=((abs%1440)+1440)%1440;
      aEl.value=String(Math.floor(mm/60)).padStart(2,'0')+':'+String(mm%60).padStart(2,'0');aEl.title=(z()?'依當天飛行狀況自動帶入（飛行時間差 ':'Auto-filled (in-flight ')+(inflt>=0?'+':'')+inflt+(z()?' 分）':' min)');
      var aDD=document.getElementById('adArrDD');if(aDD&&[].some.call(aDD.options,function(o){return +o.value===day}))aDD.value=String(day)}catch(_){}};
  window.kgmEditHeadR1101A=function(k){var P=keyParts(k),zh=z();if(!P)return 'Edit: '+E(k);return '<small>'+(zh?'編輯航班狀態':'EDIT FLIGHT STATUS')+'</small>'+E(P.code)+'<span>'+E(P.f.fr)+' → '+E(P.f.to)+' · '+E(P.date)+'</span>'};
  try{var sv0=window.doAdminSave;if(typeof sv0==='function'&&!sv0.__dv28){var sv28=function(){var k=S.adEditKey||'',d1=String((document.getElementById('adDvDep')||{}).value||'').trim(),a1=String((document.getElementById('adDvArr')||{}).value||'').trim();
      var r=sv0.apply(this,arguments);try{var ov=(S.flightOverrides||{})[k];var P=keyParts(k);if(ov&&P){if(ov.status==='Diverted'&&ov.divertTo){delete ov.divertLegR1101A;var L=window.kgmDivertLegR1101A(P.code,P.date,P.f,ov);
          if(/^\d{1,2}:\d{2}$/.test(d1)||/^\d{1,2}:\d{2}$/.test(a1)){var dep=d1||(L&&L.dep)||'',arr=a1||(L&&L.arr)||'';var dd=(L?L.dd:0);if(dep&&arr&&hm(arr)<hm(dep)&&!dd)dd=1;ov.divertLegR1101A={date:(L&&L.date)||P.date,dep:dep,arr:arr,dd:dd}}
          else if(L)ov.divertLegR1101A={date:L.date,dep:L.dep,arr:L.arr,dd:L.dd,est:true};
          try{save()}catch(_){}}else if(ov.divertLegR1101A){delete ov.divertLegR1101A;try{save()}catch(_){}}}}catch(_){}return r};sv28.__dv28=1;window.doAdminSave=sv28;try{doAdminSave=sv28}catch(_){}}}catch(_){}
  /* 4. 航班調整 −／＋：只改輸入框（不重畫，頁面不卡） */
  window.kgmTimeStepR1101A=function(id,d,link){[id,link].forEach(function(x){if(!x)return;var e=document.getElementById(x);if(!e)return;var m=/^(\d{1,2}):(\d{2})$/.exec(String(e.value||'').trim());if(!m)return;
    var t=((+m[1]*60+ +m[2]+d)%1440+1440)%1440;e.value=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');e.classList.add('k28-chg')})};
  window.kgmEffNoteR1101A=function(f,rec,rng){try{var t=(typeof todayISO==='function'?todayISO():''),d=t>=rng.from&&t<=rng.to?t:rng.from,e=seas(f,d),dep=rec.dep||f.dep,arr=rec.arr||f.arr;
    if(!e||(e.dep===dep&&e.arr===arr))return '';var zh=z();
    return '<p class="k28-eff">'+(zh?'實際生效時刻 ':'In effect ')+'<b>'+E(e.dep)+'–'+E(e.arr)+(+e.dd?'<sup>+'+e.dd+'</sup>':'')+'</b>'+(zh?'（系統依夜間起降時段與輪擋規則自動調整；販售與航班動態用這個時刻）':' (adjusted by night-window and block rules; used for sales and status)')+'</p>'}catch(_){return ''}};
  /* 5. 請假管理、訊息中心：頁首與統計（使用者 Round 2：「請假管理頁面不夠正式」「訊息中心頁面待加強不好」） */
  function ceo(){try{return isCEO()}catch(_){return false}}
  window.kgmLeaveHeadR1101A=function(){var zh=z(),me=(S.adminUser||{}).empId,y=String(typeof todayISO==='function'?todayISO():'').slice(0,4),L=(S.leave||[]).filter(function(l){return l&&(ceo()||l.empId===me)});
    var pend=L.filter(function(l){return /^(pending|ceo_review)$/.test(String(l.status||''))}).length,ok=L.filter(function(l){return l.status==='approved'&&String(l.start||'').slice(0,4)===y}),days=ok.reduce(function(a,l){return a+(+l.days||0)},0);
    var mon=String(typeof todayISO==='function'?todayISO():'').slice(0,7),mn=L.filter(function(l){return String(l.start||'').slice(0,7)===mon&&l.status!=='rejected'}).length;
    return '<div class="k28-ph"><div><small>HUMAN RESOURCES · LEAVE</small><h2>'+(zh?'請假管理':'Leave management')+'</h2><p>'+(zh?'依《勞動基準法》與《勞工請假規則》辦理。送出後產生案件編號，由執行長審核；核准後組員與地勤班表自動重排並通知職務代理人。':'Leave under the Taiwan Labor Standards Act; approved leave re-plans rosters automatically.')+'</p></div></div>'
      +'<div class="k28-kpi"><div class="'+(pend?'warn':'')+'"><small>'+(ceo()?(zh?'待審核（全公司）':'Pending (all)'):(zh?'我的待審核':'My pending'))+'</small><b>'+pend+'</b></div>'
      +'<div><small>'+(zh?y+' 年已核准天數':'Approved days '+y)+'</small><b>'+days+'</b></div><div><small>'+(zh?'本月請假人次':'This month')+'</small><b>'+mn+'</b></div><div><small>'+(zh?'申請紀錄':'Records')+'</small><b>'+L.length+'</b></div></div>'};
  window.kgmLeaveRulesR1101A=function(){var zh=z();var R=[['特休','Annual','滿半年 3 天、1 年 7 天、2 年 10 天、3 年 14 天、5 年 15 天，10 年起每年加 1 天（上限 30 天）；機師滿 3 個月起、最高 42 天','全薪'],
      ['病假','Sick','未住院每年合計 30 日內；3 天以上須附診斷證明','半薪'],['事假','Personal','每年合計 14 日內','不給薪'],['生理假','Menstrual','每月 1 日；全年未逾 3 日不併入病假','半薪']];
    return '<div class="adm-card k28-rules"><table><thead><tr><th>'+(zh?'假別':'Type')+'</th><th>'+(zh?'天數與條件':'Entitlement')+'</th><th>'+(zh?'工資':'Pay')+'</th></tr></thead><tbody>'
      +R.map(function(r){return '<tr><td><b>'+(zh?r[0]:r[1])+'</b></td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>'}).join('')+'</tbody></table></div>'};
  window.kgmChatHeadR1101A=function(){var zh=z(),me=(S.adminUser||{}).empId,n=0;try{(S.staffChat||S.chatMsgs||[]).forEach(function(m){if(m&&m.to===me&&!m.read)n++})}catch(_){}
    return '<div class="k28-ph"><div><small>INTERNAL MESSAGES</small><h2>'+(zh?'員工訊息中心':'Staff messages')+'</h2><p>'+(zh?'全體頻道、部門群組、主管團隊與一對一對話；未讀訊息會在左側顯示，開啟對話即標為已讀。':'Company channel, department groups, manager teams and direct messages.')+'</p></div></div>'};
  try{var cs=document.createElement('style');cs.id='k28ad-css';cs.textContent=
    '.k28nt-legs{display:grid;gap:6px;margin:4px 0 10px}.k28nt-h{font-size:12px;color:#55605B;margin-bottom:2px}'
   +'.k28nt-leg{width:100%;box-sizing:border-box;display:grid;grid-template-columns:20px 54px 58px minmax(110px,1fr) 110px auto;align-items:center;gap:10px;border:1px solid #E4E9E6;border-radius:12px;padding:10px 14px;background:#fff;cursor:pointer;font-size:13.5px}'
   +'.k28nt-leg:has(input:checked){border-color:#0B3D2E;background:#F4F9F6}.k28nt-leg.off{opacity:.5;cursor:default}'
   +'.k28nt-leg b{font:700 13px ui-monospace,monospace;color:#0B3D2E}.k28nt-leg .c{font:700 13px ui-monospace,monospace;color:#B08A3E}.k28nt-leg small{font:500 12px ui-monospace,monospace;color:#6B7570}.k28nt-leg sup{color:#B08A3E;font-size:10px}'
   +'.k28nt-leg em{font-style:normal;font-weight:700;color:#0B3D2E;justify-self:end}'
   +'.k23-tb-t.ok small{white-space:normal}'
   +'#app .k28-edit{background:#fff!important;border:1px solid rgba(11,58,46,.14)!important;border-radius:16px!important;padding:20px 22px!important;box-shadow:0 14px 30px -24px rgba(11,58,46,.6)}'
   +'#app .k28-edit h4{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;font:700 22px Georgia,serif!important;color:#0B3D2E!important;margin:0 0 16px!important}#app .k28-edit h4 small{flex-basis:100%;font:800 10.5px system-ui,sans-serif;letter-spacing:.2em;color:#B08A3E}#app .k28-edit h4 span{font:500 14px system-ui,sans-serif;color:#55605B}'
   +'#app .k28-edit>div[style*="grid-template-columns"]{gap:12px 14px!important}#app .k28-edit label{font:700 10.5px system-ui,sans-serif!important;letter-spacing:.12em;text-transform:uppercase;color:#7A857F!important;margin-bottom:5px!important}'
   +'#app .k28-edit .inp{border-radius:10px;height:38px}#app .k28-edit textarea.inp{height:auto}'
   +'.k28pm{display:flex;align-items:stretch;gap:0}.k28pm .inp{border-radius:0!important;text-align:center;font:600 15px ui-monospace,monospace;min-width:0}.k28pm button{flex:0 0 38px;border:1px solid #D9E1DC;background:#F6F9F7;color:#0B3D2E;font:700 16px system-ui;cursor:pointer}.k28pm button:first-child{border-radius:10px 0 0 10px;border-right:0}.k28pm button:last-child{border-radius:0 10px 10px 0;border-left:0}.k28pm button:hover{background:#0B3D2E;color:#fff}.inp.k28-chg{background:#FFF8EC}'
   +'.k28-eff{margin:-2px 0 10px;font-size:12px;color:#7A5A12;background:#FFF8EC;border-radius:8px;padding:6px 10px}.k28-eff b{font:700 13px ui-monospace,monospace;color:#0B3D2E}.k28-eff sup{color:#B08A3E}'
   +'.k28-ph{margin:2px 0 14px}.k28-ph small{font:800 10.5px system-ui,sans-serif;letter-spacing:.2em;color:#B08A3E}.k28-ph h2{font:700 26px Georgia,"Noto Serif TC",serif;color:#0B3D2E;margin:4px 0 6px}.k28-ph p{margin:0;font-size:13px;color:#6B7570;max-width:760px;line-height:1.7}'
   +'.k28-kpi{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 14px}.k28-kpi>div{background:#fff;border:1px solid #E4E9E6;border-radius:14px;padding:12px 16px}.k28-kpi small{display:block;font-size:11.5px;color:#7A857F}.k28-kpi b{font:700 26px Georgia,serif;color:#0B3D2E}.k28-kpi .warn b{color:#B4531E}'
   +'.k28-rules table{width:100%;border-collapse:collapse;font-size:12.5px}.k28-rules th{text-align:left;font:700 10.5px system-ui,sans-serif;letter-spacing:.12em;color:#7A857F;padding:6px 10px;border-bottom:1px solid #E4E9E6}.k28-rules td{padding:9px 10px;border-bottom:1px solid #F0F3F1;color:#33443C;vertical-align:top}.k28-rules td:first-child b{color:#0B3D2E}.k28-rules td:last-child{white-space:nowrap;color:#7A5A12}'
   +'.k28-audit{margin:0 0 12px;border:1px dashed #D3DCD7;border-radius:12px;padding:8px 14px;background:#FAFBFA}.k28-audit summary{cursor:pointer;font-size:12.5px;font-weight:700;color:#55605B}.k28-audit[open]{background:#fff}'
   +'.k28-chat{border-radius:16px!important}.k28-chat>div{min-height:520px!important}.k28-chat div[style*="max-height:300px"]{max-height:420px!important}'
   +'@media(max-width:760px){.k28-kpi{grid-template-columns:1fr 1fr}}'
   +'.k29st{display:flex;flex-direction:column;gap:2px;margin-top:4px;font-size:11.5px;line-height:1.45;color:#4B5A53}.k29st-est b{font-size:9.5px;letter-spacing:.08em;color:#8A938E;margin-right:2px}.k29st-est small{font-size:10.5px;color:#6B776F}.k29st-est small.late{color:#b45309;font-weight:700}.k29st-est small.early{color:#15803d}.k29st-why{color:#92400E;font-size:11px}.k29st-dv{color:#b45309;font-weight:600}tr.k29st-cont{background:#FFF8EC!important}'
   +'.k28-dvc{background:#FFF8EC;border:1px dashed rgba(176,138,62,.55);border-radius:12px;padding:8px 10px}.k28-dvc small{display:block;margin-top:4px;font-size:11px;color:#7A5A12}';
    document.head.appendChild(cs)}catch(_){}
})();
