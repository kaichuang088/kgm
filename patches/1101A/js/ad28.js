
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
  window.kgmEditHeadR1101A=function(k){var P=keyParts(k),zh=z();if(!P)return 'Edit: '+E(k);return '<small>'+(zh?'編輯航班狀態':'EDIT FLIGHT STATUS')+'</small>'+E(P.code)+'<span>'+E(P.f.fr)+' → '+E(P.f.to)+' · '+E(P.date)+'</span>'};
  try{var sv0=window.doAdminSave;if(typeof sv0==='function'&&!sv0.__dv28){var sv28=function(){var k=S.adEditKey||'',d1=String((document.getElementById('adDvDep')||{}).value||'').trim(),a1=String((document.getElementById('adDvArr')||{}).value||'').trim();
      var r=sv0.apply(this,arguments);try{var ov=(S.flightOverrides||{})[k];var P=keyParts(k);if(ov&&P){if(ov.status==='Diverted'&&ov.divertTo){delete ov.divertLegR1101A;var L=window.kgmDivertLegR1101A(P.code,P.date,P.f,ov);
          if(/^\d{1,2}:\d{2}$/.test(d1)||/^\d{1,2}:\d{2}$/.test(a1)){var dep=d1||(L&&L.dep)||'',arr=a1||(L&&L.arr)||'';var dd=(L?L.dd:0);if(dep&&arr&&hm(arr)<hm(dep)&&!dd)dd=1;ov.divertLegR1101A={date:(L&&L.date)||P.date,dep:dep,arr:arr,dd:dd}}
          else if(L)ov.divertLegR1101A={date:L.date,dep:L.dep,arr:L.arr,dd:L.dd,est:true};
          try{save()}catch(_){}}else if(ov.divertLegR1101A){delete ov.divertLegR1101A;try{save()}catch(_){}}}}catch(_){}return r};sv28.__dv28=1;window.doAdminSave=sv28;try{doAdminSave=sv28}catch(_){}}}catch(_){}
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
   +'.k28-dvc{background:#FFF8EC;border:1px dashed rgba(176,138,62,.55);border-radius:12px;padding:8px 10px}.k28-dvc small{display:block;margin-top:4px;font-size:11px;color:#7A5A12}';
    document.head.appendChild(cs)}catch(_){}
})();
