
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
    return {ok:true,fromTPE:fmt(fTpe),block:b,why:zh?('可從 TPE 空機調派：'+fmt(fTpe)+' 起飛 TPE→'+dest+'（飛 '+h+'，落地過站 2 小時）'):('Ferry from TPE '+fmt(fTpe)+' ('+h+')')}};
  try{var cs=document.createElement('style');cs.id='k28ad-css';cs.textContent=
    '.k28nt-legs{display:grid;gap:6px;margin:4px 0 10px}.k28nt-h{font-size:12px;color:#55605B;margin-bottom:2px}'
   +'.k28nt-leg{width:100%;box-sizing:border-box;display:grid;grid-template-columns:20px 54px 58px minmax(110px,1fr) 110px auto;align-items:center;gap:10px;border:1px solid #E4E9E6;border-radius:12px;padding:10px 14px;background:#fff;cursor:pointer;font-size:13.5px}'
   +'.k28nt-leg:has(input:checked){border-color:#0B3D2E;background:#F4F9F6}.k28nt-leg.off{opacity:.5;cursor:default}'
   +'.k28nt-leg b{font:700 13px ui-monospace,monospace;color:#0B3D2E}.k28nt-leg .c{font:700 13px ui-monospace,monospace;color:#B08A3E}.k28nt-leg small{font:500 12px ui-monospace,monospace;color:#6B7570}.k28nt-leg sup{color:#B08A3E;font-size:10px}'
   +'.k28nt-leg em{font-style:normal;font-weight:700;color:#0B3D2E;justify-self:end}'
   +'.k23-tb-t.ok small{white-space:normal}';
    document.head.appendChild(cs)}catch(_){}
})();
