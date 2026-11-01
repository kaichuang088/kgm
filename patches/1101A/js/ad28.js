
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
