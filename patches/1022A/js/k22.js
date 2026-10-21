/* 1022A：使用者（1020B 交付後）：
   「後台定位管理那裡要可以把乘客端的更改票全線關閉」
   「有中停的價錢一定要低於直飛」
   「航班資料那裡組員、地勤、飛行員要直接列出他們接下來七天的航班，不能有搜尋功能（只能看到自己負責的航班，一但班表有更新這個也要更新，
     也只能看到自己負責的部分，像是飛行資料只有飛行員看得到）」
   「航班資料每一個旁邊都要有一個展開+和收起來-的按鈕不然整個太多了要滑到下面很麻煩」
   ① 中停（f.via，同一班號經停）票價：同一天、同一起訖有直飛時，中停班每個方案「目前能賣的最低價」與每一階都比直飛低 12%（至少低 NT$100）；
      沒有直飛的航線不動。只包最外層 owPrice，訂票頁、轉機組合、結帳都讀同一個數字。
   ② 旅客自助改票總開關：S.selfChgR1022A={off,by,name,at}（kgm22_selfchg，跟 save() 一起存、前後台同步）。
      關閉時前台所有改票入口（我的行程按鈕、AI 助理、酬賓票改票、已經開到一半的改票頁）一律擋下並請旅客洽客服；退票／選位／餐點不受影響。
   ③ 航班資料（飛行員／客艙組員／地勤）：拿掉搜尋，直接列出自己接下來 7 天的航班（組員讀 kgmRosterR196＝組員班表同一份，地勤讀
      kgmGroundPlanR1008A＝地勤班表同一份，每次畫面都重讀，班表一改就跟著變）；只能開自己的航班。
      區塊照 r55 原本的權限表（這輪把飛行資料、PDF 改成只有飛行員／CEO）：飛行員＝航班概況、天氣、航路、載重平衡、PDF、餐食；
      客艙＝艙單、餐食；地勤＝報到核對、艙單、座位圖、候補、餐食。
   ④ 航班資料每個區塊右上角 + / −（收起只留標題列），上方「全部展開／全部收起」；收合狀態只記在這台瀏覽器。 */
(function(){
  if(window.__kgmK22)return;window.__kgmK22=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function D(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function allF(){try{return [].concat(FLIGHTS,(S.customFlights||[]))}catch(_){return []}}
  function fly(f,d){try{return flyOn(f,new Date(d+'T12:00:00'))}catch(_){return true}}

  /* ══ ① 中停票價低於直飛 ══════════════════════════════════════════════ */
  /* 只比同一個訂位代號不夠：畫面上看到的是「每個方案目前還能賣的最低那一階」，中停班便宜的階可能已經關了、直飛還開著
     （實測 KX60 每階都比 KX54 低，畫面上去程起卻是 22,134 > 19,410）。所以同一艙等整排一起乘一個係數 m，讓
     中停班每個方案、整個艙等「目前能賣的最低價」都 ≤ 直飛同方案／同艙等能賣的最低價 × 0.88；係數相同，階梯的先後與比例不變。 */
  var busy=0,memo={},memoT=0;
  function sellable(row,d,c){try{return (+window.kgmInventory49(c,d,row)||0)>0}catch(_){return true}}   /* r54 sell54 開出來的名字 */
  function famLow(o,row,d,codes,pax){   /* {方案:最低能賣的價, '*':整艙最低} */
    var out={};codes.forEach(function(c){if(!sellable(row,d,c))return;var fm=(FARES[c]||{}).familyR48||'*',v=+o(row,c,pax)||0;if(!(v>0))return;
      if(out[fm]==null||v<out[fm])out[fm]=v;if(out['*']==null||v<out['*'])out['*']=v});
    return out;
  }
  function nsRows(f){
    var rows=allF().filter(function(x){return x&&!x.via&&!x.partner&&!x.codeshare&&x.fr===f.fr&&x.to===f.to});
    if(rows.length&&f.date){var on=rows.filter(function(x){return fly(x,f.date)});if(on.length)rows=on}
    return rows.map(function(x){return Object.assign({},x,{date:f.date})});
  }
  function nsMin(o,f,code,pax){
    var best=0;nsRows(f).forEach(function(x){var v=0;try{v=+o(x,code,pax)||0}catch(_){}if(v>0&&(!best||v<best))best=v});
    return best;
  }
  function cabMul(o,f,cab,pax){
    var codes=[];try{codes=(typeof CAB_CODES==='function'?CAB_CODES(cab):[])||[]}catch(_){}
    if(!codes.length||!f.date)return 1;
    var ns=nsRows(f);if(!ns.length)return 1;
    var V=famLow(o,f,f.date,codes,pax),N={};
    ns.forEach(function(x){var q=famLow(o,x,f.date,codes,pax);Object.keys(q).forEach(function(k){if(N[k]==null||q[k]<N[k])N[k]=q[k]})});
    var m=1;Object.keys(V).forEach(function(k){if(N[k]>0&&V[k]>0){var want=Math.min(N[k]*0.88,N[k]-100*(pax||1));if(V[k]>want)m=Math.min(m,want/V[k])}});
    return m;
  }
  function viaWrap(){
    var o=window.owPrice;if(typeof o!=='function'||o.__r1022A)return;
    var w=function(f,code,pax){
      var v=o.apply(this,arguments);
      try{
        if(busy||!f||typeof f!=='object'||!f.via||f.partner||f.codeshare||!(+v>0)||!FARES[code])return v;
        if(!memoT){memoT=1;memo={};setTimeout(function(){memoT=0},0)}
        var px=[f.code,f.fr,f.to,f.date||'',pax||1,(S.search&&S.search.type)||'',S.search?[S.search.adults||1,S.search.children||0,S.search.infants||0].join('/'):''].join('|');
        var cab=(FARES[code]||{}).cabin||'Economy',km=px+'|m|'+cab,kc=px+'|c|'+code;
        if(FARE_CHAIN.indexOf(code)<0&&code!=='R-R'){if(memo[km]==null){busy=1;try{memo[km]=cabMul(o,f,cab,pax)}finally{busy=0}}if(memo[km]<1)v=Math.round(+v*memo[km])}
        if(memo[kc]==null){busy=1;try{memo[kc]=nsMin(o,f,code,pax)}finally{busy=0}}
        var ns=memo[kc];
        if(ns>0){var cap=Math.min(Math.round(ns*0.88),ns-100*(pax||1));if(+v>cap)v=cap}
      }catch(_){busy=0}
      return v;
    };
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}
    w.__r1022A=1;window.owPrice=w;try{owPrice=w}catch(_){}
  }
  window.kgmViaCapR1022A=function(f,code,pax){var o=window.owPrice;busy=1;try{return nsMin(o,f,code,pax||1)}finally{busy=0}};

  /* ══ ② 旅客自助改票總開關 ═══════════════════════════════════════════ */
  function chgOff(){try{return !!(S.selfChgR1022A&&S.selfChgR1022A.off)}catch(_){return false}}
  window.kgmSelfChgOffR1022A=chgOff;
  function isAdmin(){try{return S.view==='admin'}catch(_){return false}}
  function tell(){
    var msg=z()?'線上改票目前暫停服務。如需更改行程，請洽客服 0800-789-456（退票、選位、餐點不受影響）。'
               :'Online changes are temporarily unavailable. Please call 0800-789-456 to change your trip (refunds, seats and meals are not affected).';
    try{
      var old=document.querySelector('.k929-pnr-msg');if(old)old.remove();
      var d=document.createElement('div');d.className='k929-pnr-msg';d.setAttribute('role','alert');
      d.innerHTML='<b>'+(z()?'線上改票暫停服務中':'Online changes paused')+'</b><span></span><button type="button" aria-label="close">×</button>';
      d.querySelector('span').textContent=msg;d.querySelector('button').onclick=function(){d.remove()};
      document.body.appendChild(d);setTimeout(function(){try{d.remove()}catch(_){}},9000);
    }catch(_){try{alert(msg)}catch(__){}}
  }
  function wrapChg(name,isChg){
    var f=window[name];if(typeof f!=='function'||f.__r1022A)return;
    var w=function(){if(chgOff()&&!isAdmin()&&isChg.apply(null,arguments)){tell();return}return f.apply(this,arguments)};
    try{Object.keys(f).forEach(function(k){if(!(k in w))w[k]=f[k]})}catch(_){}
    w.__r1022A=1;window[name]=w;
    try{if(name==='openTicketService')openTicketService=w;if(name==='tripSvcR25')tripSvcR25=w}catch(_){}
  }
  function chgWrap(){
    wrapChg('openTicketService',function(p,s,tab){return (tab||'change')==='change'});
    wrapChg('tripSvcR25',function(p,s,kind){return kind==='change'});
    wrapChg('kgmAwardReissueOpenR213',function(){return true});
  }
  /* 按鈕在點擊捕獲階段先擋（跟 r929 同一種做法），不讓後面的處理先跑 */
  try{window.addEventListener('click',function(e){
    try{
      if(!chgOff()||isAdmin())return;
      var el=e.target;while(el&&el!==document.body&&!(el.getAttribute&&el.getAttribute('onclick')))el=el.parentNode;
      if(!el||!el.getAttribute)return;var oc=String(el.getAttribute('onclick')||'');
      if(/(tripSvcR25|openTicketService)\([^)]*'change'\)|kgmAwardReissueOpenR213\(/.test(oc)){
        e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();tell()}
    }catch(_){}
  },true)}catch(_){}
  /* 已經開到一半的改票頁（關閉前就進去、或另一個分頁）→ 導回我的行程 */
  function chgGuard(){
    try{
      if(!chgOff()||isAdmin())return;
      if(S.view==='reissue_r59'&&S.rxR59&&S.rxR59.mode==='change'){S.rxR59=null;S.view='mytrip';setTimeout(tell,60)}
      else if(S.view==='ticketService'&&S.ticketService&&(S.ticketService.tab||'change')==='change'){S.ticketService=null;S.view='mytrip';setTimeout(tell,60)}
    }catch(_){}
  }
  window.kgmSelfChgToggleR1022A=function(){
    var u=S.adminUser||{},off=chgOff();
    if(!/^(ceo|service|backend)$/.test(String(u.role||''))){alert(z()?'只有執行長、客服、後台人員可以變更。':'Only CEO, customer service or back-office staff can change this.');return}
    if(!confirm(off?(z()?'重新開放旅客線上改票？':'Re-open online changes for passengers?'):(z()?'全線關閉旅客線上改票？\n關閉後旅客只能洽客服改票（退票、選位、餐點不受影響）。':'Close online changes for all passengers?')))return;
    S.selfChgR1022A={off:!off,by:u.empId||'',name:u.name||'',at:new Date().toISOString()};
    try{save()}catch(_){}
    try{render()}catch(_){}
  };
  function chgCard(){
    try{
      if(!isAdmin()||S.adminTab!=='bookings')return;
      var main=document.querySelector('#app main.p-admin-main');if(!main)return;
      var c=S.selfChgR1022A||{},off=!!c.off,can=/^(ceo|service|backend)$/.test(String((S.adminUser||{}).role||''));
      var sig=[off,c.by,c.at,can,z()].join('|'),el=main.querySelector(':scope > .k22-chg');
      if(el&&el.getAttribute('data-s')===sig)return;
      if(!el){el=document.createElement('section');el.className='k22-chg';main.insertBefore(el,main.firstChild)}
      el.setAttribute('data-s',sig);el.classList.toggle('off',off);
      var when=c.at?String(c.at).slice(0,16).replace('T',' '):'';
      el.innerHTML='<div class="k22-chg-t"><small>'+(z()?'旅客自助改票':'PASSENGER SELF-SERVICE CHANGES')+'</small>'
        +'<b><i></i>'+(off?(z()?'已全線關閉':'Closed for all passengers'):(z()?'開放中':'Open'))+'</b>'
        +'<span>'+(off?(z()?'前台「我的行程」、AI 助理、酬賓票改票都不能自行改票，旅客會看到請洽客服的提示；退票、選位、餐點照常。':'My Trips, the AI assistant and award changes are blocked; passengers are asked to call us. Refunds, seats and meals still work.')
                    :(z()?'旅客可以在前台自行改票。關閉後所有改票入口立即停用（另一個分頁、前台檔案同步後也一樣）。':'Passengers can change bookings online. Closing takes effect on every entry point, including the front site after sync.'))+'</span>'
        +(when?'<em>'+(z()?'上次變更 ':'Last changed ')+E(when)+' UTC · '+E(c.by||'')+(c.name?' '+E(c.name):'')+'</em>':'')+'</div>'
        +(can?'<button class="btn '+(off?'btn-g':'k22-danger')+'" onclick="kgmSelfChgToggleR1022A()">'+(off?(z()?'重新開放':'Re-open'):(z()?'全線關閉改票':'Close all changes'))+'</button>'
             :'<span class="k22-ro">'+(z()?'僅執行長／客服／後台人員可變更':'CEO / service / back-office only')+'</span>');
    }catch(_){}
  }

  /* ══ ③ 航班資料：組員／地勤只看自己接下來 7 天的航班 ═══════════════════ */
  var ROLE={pilot:1,cabin:1,ground:1};
  var RK={CP:['機長','Captain'],TRI:['教官機長','Instructor'],FO:['副機長','First Officer'],CR:['巡航機師','Cruise Pilot'],SO:['巡航機師','Cruise Pilot'],
          PU:['座艙長','Purser'],DPU:['副座艙長','Asst. Purser'],FA:['空服員','Flight Attendant'],PIC:['機長','Captain'],SIC:['副機長','First Officer'],CRZ:['巡航機師','Cruise Pilot']};
  function rk(r){var x=RK[String(r||'').toUpperCase()];return x?(z()?x[0]:x[1]):(r||'')}
  function role(){try{return S.view==='admin'&&S.adminAuthed!==false&&S.adminUser&&ROLE[S.adminUser.role]?S.adminUser.role:''}catch(_){return ''}}
  function onFd(){try{return S.view==='admin'&&S.adminTab==='flightdata'}catch(_){return false}}
  function days7(){var t=T(),a=[];for(var i=0;i<7;i++)a.push(D(t,i));return a}
  var WARM=0,POLL=0,GSEEN={},GBUSY=0;
  function poll(){if(POLL)return;POLL=setTimeout(function(){POLL=0;try{if(onFd()&&role())render()}catch(_){}},1500)}
  function warmCrew(until){
    if(WARM)return;
    var c=null;try{c=window.kgmCrewCursorR121?window.kgmCrewCursorR121():null}catch(_){}
    if(c&&c>=until)return;               /* 游標已過，交給背景（r196）自己補，不在這裡倒快取 */
    WARM=1;
    var idle=function(f){if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(f,{timeout:300});else setTimeout(f,30)};
    (function slice(){
      try{window.kgmCrewStepR121(120,until)}catch(_){}
      var done=true;try{done=window.kgmCrewHasDayR121(until)}catch(_){}
      if(done||!(onFd()&&role())){WARM=0;return}
      idle(slice);
    })();
  }
  function crewDays(emp){
    /* r196 的 60 天進度只在「組員班表」分頁才往前算 → 這裡自己把 7 天的組員計畫暖好，再用 anyDay 直接讀同一份索引 */
    var ds=days7(),has=true;try{has=ds.every(function(d){return window.kgmCrewHasDayR121(d)})}catch(_){}
    if(!has){warmCrew(ds[6]);poll();return null}
    var rows=[];try{rows=window.kgmRosterR196(emp,7,true)||[]}catch(_){rows=[]}
    var by={};rows.forEach(function(r){if(r&&r.date)by[r.date]=r});
    return ds.map(function(d){var r=by[d]||{};
      var legs=(r.legs||[]).map(function(l){return {key:[l.code,d,l.fr,l.to].join('|'),code:l.code,fr:l.fr,to:l.to,dep:l.dep||'',arr:l.arr||'',type:l.type||'',tail:l.tail||'',pos:rk(l.rank),date:d}});
      var dh=(r.dh||[]).map(function(l){var c=l.dhFlightR1004B||(l.code!=='DH'?l.code:'');return {code:c,fr:l.fr,to:l.to,dep:l.dep||'',arr:l.arr||'',date:l.dhDateR1004B||d}}).filter(function(x){return x.code});
      return {date:d,legs:legs,dh:dh,sb:!!r.standby}});
  }
  var GK={ctr:['報到櫃檯','Check-in counter'],gate:['登機門','Boarding gate'],arr:['到站','Arrival']};
  function groundDays(emp){
    var me=(S.staff||[]).filter(function(x){return x&&x.empId===emp})[0]||{},st=me.station||'TPE',ds=days7(),out=[],miss=null;
    ds.forEach(function(d){
      var k=st+'|'+d;if(!GSEEN[k]){if(!miss)miss=d;return}
      var P=null;try{P=window.kgmGroundPlanR1008A(st,d)}catch(_){}
      var p=(P&&P.people&&P.people[emp])||null,legs=[];
      if(p&&!p.off)(p.tasks||[]).forEach(function(t){
        (t.flights||[]).forEach(function(f){if(!f||!f.code)return;
          /* 任務時間 t.a 是從這一天 00:00 起算的分鐘（晚班跨過午夜會 ≥1440）→ 那一班是隔天的航班 */
          var fd=(+t.a>=1440)?D(d,1):(+t.a<0?D(d,-1):d);
          if(t.kind==='arr'){var row=allF().filter(function(x){return x&&!x.via&&x.code===f.code&&x.fr===f.fr&&x.to===f.to})[0];if(row&&+row.dd>0)fd=D(fd,-(+row.dd))}   /* 到站：航班日＝起點出發那天 */
          var key=[f.code,fd,f.fr,f.to].join('|');
          if(legs.some(function(x){return x.key===key&&x.kind===t.kind}))return;
          legs.push({key:key,code:f.code,fr:f.fr,to:f.to,dep:f.dep||'',arr:f.arr||'',type:f.type||'',tail:'',date:fd,kind:t.kind,
            pos:(GK[t.kind]?(z()?GK[t.kind][0]:GK[t.kind][1]):'')+(t.counter?' '+t.counter:'')+(t.gate?' '+t.gate:'')})})});
      legs.sort(function(a,b){return String(t2(a)).localeCompare(String(t2(b)))});
      out.push({date:d,legs:legs,dh:[],sb:!!(p&&p.reserve),off:!p||!!p.off,shift:p&&p.base||''});
    });
    if(miss){
      if(!GBUSY){GBUSY=1;setTimeout(function(){try{window.kgmGroundPlanR1008A(st,miss)}catch(_){}GSEEN[st+'|'+miss]=1;GBUSY=0;try{if(onFd()&&role())render()}catch(_){}},30)}
      return null;
    }
    return out;
  }
  function t2(x){return x.kind==='arr'?(x.arr||''):(x.dep||'')}
  var CUR=null;   /* 這一次畫面的清單 {role,days,keys} */
  function mine(){
    var r=role();if(!r)return null;var u=S.adminUser||{},days=null;
    try{days=r==='ground'?groundDays(u.empId):crewDays(u.empId)}catch(_){days=null}
    var keys={},first=null,now=Date.now();
    (days||[]).forEach(function(d){d.legs.forEach(function(l){keys[l.key]=l;
      var t=Date.parse(l.date+'T'+(l.dep||'00:00')+':00+08:00');if(!first&&!(t<now-3*3600000))first=l})});
    if(!first)(days||[]).some(function(d){if(d.legs[0]){first=d.legs[0];return true}});
    return {role:r,days:days,keys:keys,first:first};
  }
  function preFd(){
    var h=document.documentElement,r=onFd()?role():'';
    ['pilot','cabin','ground'].forEach(function(x){h.classList.toggle('k22-'+x,r===x)});
    h.classList.toggle('k22-crew',!!r);
    CUR=null;h.classList.remove('k22-nof');
    if(!r)return;
    CUR=mine();
    var sel=CUR.keys[S.opsSelectedR7]||CUR.first;
    if(sel){S.opsSelectedR7=sel.key;S.opsQueryR7=sel.code;S.opsDateR7=sel.date}
    else{S.opsSelectedR7='';S.opsQueryR7='';h.classList.add('k22-nof')}
  }
  window.kgmFdOpenR1022A=function(k){
    if(role()&&CUR&&!CUR.keys[k])return;
    var p=String(k).split('|');S.opsSelectedR7=k;S.opsQueryR7=p[0];S.opsDateR7=p[1];S.opsPassengerR7=null;
    try{render()}catch(_){}try{var a=document.querySelector('.r7-ops-top');if(a)a.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){}
  };
  function fdWrap(){
    ['selectOpsR7','searchOpsR7'].forEach(function(name){var f=window[name];if(typeof f!=='function'||f.__r1022A)return;
      var w=function(k){if(role()){if(name==='selectOpsR7'&&CUR&&CUR.keys[k])return window.kgmFdOpenR1022A(k);return}return f.apply(this,arguments)};
      w.__r1022A=1;window[name]=w})
  }
  function wd(d){return (z()?['日','一','二','三','四','五','六']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[new Date(d+'T12:00:00').getDay()]}
  function panel(){
    var c=CUR,u=S.adminUser||{};
    var title=z()?'我的航班 · 接下來 7 天':'My flights · next 7 days';
    var who=E(u.name||'')+' · '+E(u.empId||'')+' · '+(z()?{pilot:'飛行員',cabin:'客艙組員',ground:'地勤'}[c.role]:{pilot:'Pilot',cabin:'Cabin crew',ground:'Ground staff'}[c.role]);
    var body;
    if(!c.days){
      body='<div class="k22-wait"><i></i>'+(z()?'班表整理中，排好就會自動列出（不用重新整理）…':'Preparing your roster — it will appear automatically…')+'</div>';
    }else{
      var any=c.days.some(function(d){return d.legs.length});
      body='<div class="k22-days">'+c.days.map(function(d){
        var h='<div class="k22-day'+(d.legs.length?'':' rest')+'"><div class="k22-dh"><b>'+E(d.date.slice(5).replace('-','/'))+'</b><span>'+E(wd(d.date))+'</span></div>';
        if(d.legs.length)h+=d.legs.map(function(l){var on=l.key===S.opsSelectedR7;
          return '<button class="k22-leg'+(on?' on':'')+'" onclick="kgmFdOpenR1022A(\''+A(l.key)+'\')"><b>'+E(l.code)+'</b><span>'+E(l.fr)+' → '+E(l.to)+'</span>'
            +'<small>'+E(l.dep)+(l.arr?'–'+E(l.arr):'')+(l.type?' · '+E(l.type):'')+(l.tail?' · '+E(l.tail):'')+'</small>'+(l.pos?'<em>'+E(l.pos)+'</em>':'')+'</button>'}).join('');
        h+=d.dh.map(function(l){return '<div class="k22-dhl"><b>DH '+E(l.code)+'</b><span>'+E(l.fr)+' → '+E(l.to)+(l.dep?' · '+E(l.dep):'')+'</span><small>'+(z()?'以旅客身分調位':'Positioning as passenger')+'</small></div>'}).join('');
        if(!d.legs.length&&!d.dh.length)h+='<div class="k22-off">'+(d.sb?(z()?'待命':'Standby'):(z()?'休':'Off'))+'</div>';
        return h+'</div>'}).join('')+'</div>'
        +(any?'':'<div class="k22-none">'+(z()?'接下來 7 天沒有排到航班。':'No flights in the next 7 days.')+'</div>');
    }
    return '<section class="k22-mine" data-k22="mine"><div class="k22-mh"><div><div class="r7-kicker">MY ASSIGNMENTS</div><h2>'+title+'</h2><p>'+who+'</p></div>'
      +'<span class="k22-src">'+(c.role==='ground'?(z()?'依地勤班表即時更新':'Live from the ground roster'):(z()?'依組員班表即時更新':'Live from the crew roster'))+'</span></div>'+body+'</section>';
  }
  /* 每個區塊的代號（顯示規則與 +/− 收合共用） */
  function kindOf(sec){
    var c=sec.classList;
    if(c.contains('k22-mine'))return 'mine';
    if(c.contains('r7-ops-hero'))return 'hero';
    if(sec.parentElement&&sec.parentElement.classList.contains('r7-ops-top'))return 'wx';
    if(c.contains('r7-route-card'))return 'route';
    if(c.contains('r7-loadbal'))return 'lb';
    if(c.contains('k55-cifail'))return 'ci';
    if(c.contains('k81-meals'))return 'meal';
    if(c.contains('r7-manifest'))return 'man';
    if(c.contains('r7-seatmap'))return 'seat';
    if(c.contains('r40-panel'))return 'sb';
    return '';
  }
  function sections(main){
    var out=[];
    main.querySelectorAll('.r7-admin > section, .r7-ops-top > section, .r7-ops-work > section, :scope > .r40-panel').forEach(function(s){
      if(s.classList.contains('r7-ops-search'))return;
      if(s.closest('.r7-admin')&&s.parentElement.classList.contains('r7-admin')&&s.style&&s.style.textAlign==='center')return;   /* 「輸入航班號碼」提示卡 */
      out.push(s)});
    return out;
  }
  function colGet(){try{return JSON.parse(localStorage.getItem('kgm22_fdcol')||'{}')||{}}catch(_){return {}}}
  function colSet(o){try{localStorage.setItem('kgm22_fdcol',JSON.stringify(o))}catch(_){}}
  window.kgmFdColR1022A=function(k,btn){
    var o=colGet();if(k==='*'||k==='-'){var main=document.querySelector('#app main.p-admin-main');if(main)sections(main).forEach(function(s){var q=s.getAttribute('data-k22');if(q){if(k==='-')o[q]=1;else delete o[q]}});}
    else{if(o[k])delete o[k];else o[k]=1}
    colSet(o);postFd();
  };
  function postFd(){
    try{
      if(!onFd())return;
      var main=document.querySelector('#app main.p-admin-main'),adm=main&&main.querySelector('.r7-admin');if(!adm)return;
      var r=role();
      if(r&&CUR){
        var old=adm.querySelector(':scope > .k22-mine'),html=panel(),sig=String(html.length)+'|'+S.opsSelectedR7+'|'+(CUR.days?1:0);
        if(!old||old.getAttribute('data-sig')!==sig){
          var box=document.createElement('div');box.innerHTML=html;var nw=box.firstChild;nw.setAttribute('data-sig',sig);
          if(old)old.replaceWith(nw);else{var anchor=adm.querySelector(':scope > .r7-ops-search');if(anchor)anchor.after(nw);else adm.insertBefore(nw,adm.children[2]||null)}
        }
        /* 分頁按鈕（同一班號的各實體航段）只留自己的；只剩一個就整列收起 */
        var tabs=adm.querySelector('.r7-ops-tabs');
        if(tabs){var n=0;tabs.querySelectorAll('button').forEach(function(b){var m=/selectOpsR7\('([^']+)'\)/.exec(b.getAttribute('onclick')||'');var ok=m&&CUR.keys[m[1].replace(/\\'/g,"'")];b.style.display=ok?'':'none';if(ok)n++});tabs.style.display=n>1?'':'none'}
      }
      /* + / − */
      var o=colGet(),list=sections(main),bar=adm.querySelector(':scope > .k22-bar');
      list.forEach(function(s){
        var k=kindOf(s)||('x'+Array.prototype.indexOf.call(list,s));s.setAttribute('data-k22',k);
        var b=s.querySelector(':scope > .k22-tg');
        if(!b){b=document.createElement('button');b.type='button';b.className='k22-tg';s.insertBefore(b,s.firstChild);s.classList.add('k22-sec')}
        var col=!!o[k];s.classList.toggle('k22-col',col);
        b.textContent=col?'+':'−';b.title=col?(z()?'展開':'Expand'):(z()?'收起':'Collapse');b.setAttribute('aria-expanded',col?'false':'true');
        b.setAttribute('onclick',"kgmFdColR1022A('"+A(k)+"',this)");
      });
      if(list.length>1){
        if(!bar){bar=document.createElement('div');bar.className='k22-bar';var tb=adm.querySelector(':scope > .r7-ops-tabs')||adm.querySelector(':scope > .k22-mine')||adm.querySelector(':scope > .r7-ops-search');if(tb)tb.after(bar);else adm.appendChild(bar)}
        var shown=list.filter(function(s){return s.style.display!=='none'&&getComputedStyle(s).display!=='none'});
        var cnt=shown.length,cc=shown.filter(function(s){return s.classList.contains('k22-col')}).length;
        var bh='<span>'+(z()?'區塊 ':'Sections ')+(cnt-cc)+' / '+cnt+(z()?' 展開':' open')+'</span><button type="button" onclick="kgmFdColR1022A(\'*\')">'+(z()?'＋ 全部展開':'＋ Expand all')+'</button><button type="button" onclick="kgmFdColR1022A(\'-\')">'+(z()?'－ 全部收起':'－ Collapse all')+'</button>';
        if(bar.getAttribute('data-h')!==bh){bar.innerHTML=bh;bar.setAttribute('data-h',bh)}
        var mineEl=adm.querySelector(':scope > .k22-mine'),tabsEl=adm.querySelector(':scope > .r7-ops-tabs');
        var want=(tabsEl&&tabsEl.style.display!=='none')?tabsEl:(mineEl||null);if(want&&want.nextElementSibling!==bar)want.after(bar);
      }else if(bar)bar.remove();
    }catch(e){try{console.warn('k22 fd',e)}catch(_){}}
  }
  window.kgmFdMineR1022A=function(){return CUR?{role:CUR.role,ready:!!CUR.days,days:CUR.days,keys:Object.keys(CUR.keys)}:null};

  /* ══ 會員頁（使用者：「會員也要有+/-然後好亂喔」）══════════════════════
     版面原本：概況數字、三顆動作鈕、一顆單獨的「會員管理」（＝Users 分頁，重複）、會員名單、帳號資料，全部直排。
     改成三個可收合的區塊：會員概況（數字＋動作鈕放進同一張卡）、會員名單（分頁＋表）、帳號資料（客服／CEO）。
     只在畫面上分組（加標題列與 + / −），不搬動輸入框，原本的搜尋、排序、調整里程照舊。 */
  function memTidy(){
    try{
      if(!(S.view==='admin'&&S.adminTab==='members'))return;
      var main=document.querySelector('#app main.p-admin-main');if(!main)return;
      var col=S._k22mR1022A||(S._k22mR1022A={}),kpi=main.querySelector(':scope > .k185-kpi'),act=main.querySelector(':scope > .k185-act');
      main.classList.add('k22m');
      if(kpi&&act&&act.parentNode!==kpi){act.classList.add('k22m-act');kpi.appendChild(act)}
      function head(el,key,title,sub){
        if(!el)return;var h=el.querySelector(':scope > .k22m-h')||(el.classList.contains('k22m-h')?el:null);
        var b=el.querySelector('.k22m-tg');
        if(!b){b=document.createElement('button');b.type='button';b.className='k22m-tg';el.insertBefore(b,el.firstChild)}
        b.textContent=col[key]?'+':'−';b.title=col[key]?'展開':'收起';b.onclick=function(){col[key]=!col[key];memTidy()};
        main.classList.toggle('k22m-c-'+key,!!col[key]);
      }
      /* 1 會員概況：在數字卡前面加一列標題 */
      if(kpi){var h1=main.querySelector(':scope > .k22m-h1');if(!h1){h1=document.createElement('div');h1.className='k22m-h k22m-h1';h1.innerHTML='<b>會員概況</b><span>註冊會員、評分與黑名單；模擬資料與審核入口</span>';main.insertBefore(h1,kpi)}head(h1,'a')}
      /* 2 會員名單：用原本的標題（H3.k192-title） */
      var leg=main.querySelector(':scope > .p-member-legacy'),t2=leg&&leg.querySelector(':scope > h3.k192-title');
      if(t2){t2.classList.add('k22m-h','k22m-h2');head(t2,'b')}
      /* 3 帳號資料：用原本的 .adm-sec */
      var t3=leg&&leg.querySelector(':scope > .adm-sec');
      if(t3){t3.classList.add('k22m-h','k22m-h3');head(t3,'c')}
    }catch(e){try{console.warn('k22 mem',e)}catch(_){}}
  }
  /* ══ 案件處理中心的模擬案件（使用者：「案件的AI Simulate可以有點創意不要只是退款申請太少了」）══════════
     原本模擬案件只有 1010A 的 6 件退票申請。這裡用跟「＋ 建立案件」一模一樣的資料格式（S.staffCasesR1007A，存檔、前後台同步）
     補上航空公司客服常見的各類案件：行李延誤／遺失／損壞、機上遺失物品、服務客訴、特殊協助、航班延誤錯過轉機、超賣拒絕登機、
     非自願降艙、里程補登、簽證被拒退款、服務犬文件…；每件有自己的處理進度（受理 → 調查 → 等旅客 → 結案）、內部備註與給旅客的訊息。
     旅客用模擬旅客轉成的正式訂位（kgmSimMaterializeR1010A，跟退票模擬同一個做法），行程管理、案件查詢都查得到。
     只自動產生一次（看紀錄上的 simR1022A）；案件處理中心上方另有「再產生一批模擬案件」。 */
  var SC22=[
    {t:'bag_delayed',d:-2,st:'investigating',pr:'urgent',det:'抵達後行李未出現在轉盤，已於到站行李服務處登記 PIR。行李條 KX{tag}，深藍色硬殼 28 吋，綁紅色行李帶。',
      steps:[['received','到站行李服務處受理 PIR'],['investigating','WorldTracer 比對：行李在 TPE 轉機時未裝上，已改掛隔日同班次，預計明天下午送達旅客飯店']],note:'旅客要求先購買盥洗用品，已告知可憑收據申請每日 NT$1,500 內的臨時必需品補助（最多 3 天）。',bag:'深藍色硬殼 28 吋，綁紅色行李帶'},
    {t:'bag_lost',d:-6,st:'investigating',pr:'urgent',det:'行李延誤已超過 5 天仍未找到。黑色布面 24 吋，前袋有相機。旅客已提交行李內容清單。',
      steps:[['received','到站登記行李延誤'],['investigating','追查第 5 天：轉運站 BKK、ICN 皆無紀錄，升級為遺失行李（第 21 天前持續追查）'],['awaiting_customer','請旅客提供貴重物品（相機）購買證明，以利理賠估算']],note:'理賠上限依蒙特利爾公約 1,288 SDR；相機屬貴重物品，需附購買證明。',bag:'黑色布面 24 吋，前袋有相機'},
    {t:'bag_damaged',d:-1,st:'awaiting_customer',pr:'normal',det:'硬殼行李箱一個輪子斷裂、拉桿無法收回。已在機場拍照存證。',
      steps:[['received','機場櫃檯受理行李損壞（附照片 3 張）'],['awaiting_customer','已請旅客提供維修估價單或同等級行李箱價格，7 日內回覆']],note:'屬可歸責損壞（輪子、拉桿），非正常使用磨損；可選擇維修或折舊後賠償。',bag:'銀色硬殼 26 吋'},
    {t:'item_lost',d:-3,st:'closed',pr:'normal',det:'旅客下機後發現 iPad（銀色、紅色保護套）遺留在座位前方置物袋。',
      steps:[['received','旅客來電登記遺失物'],['investigating','機上清潔組員拾獲，已送桃園機場第二航廈失物招領'],['closed','旅客本人憑證件領回，結案']],note:'座位號與遺失物描述相符，拾獲時間為落地後 40 分鐘。'},
    {t:'complaint',d:-2,st:'investigating',pr:'normal',det:'經濟艙第二輪送餐時牛肉餐已用完，旅客只能選素食；旅客另反映空服員回覆時語氣不耐。',
      steps:[['received','旅客透過網站留言申訴'],['investigating','已調閱當班座艙長報告與餐點裝載單：本班牛肉餐裝載 46%（依預訂比例），座艙長確認有致歉']],note:'建議致贈 3,000 哩表達歉意；餐點裝載比例已回報空廚檢討（該航線牛肉餐偏好高）。'},
    {t:'complaint',d:-4,st:'closed',pr:'normal',det:'長程航班機上 Wi-Fi 全程無法連線，旅客已購買 Wi-Fi 方案。',
      steps:[['received','旅客申訴並附購買收據'],['investigating','維修紀錄：該機衛星天線模組故障，已於落地後更換'],['closed','全額退還 Wi-Fi 費用並致贈 2,000 哩，旅客接受']],note:'同航班另有 11 位旅客購買，已主動全數退費。'},
    {t:'assistance',d:-1,st:'closed',pr:'urgent',det:'旅客訂位已註記 WCHC（需全程輪椅），抵達時登機門未有輪椅等候，等候 25 分鐘。',
      steps:[['received','旅客家屬於機場申訴'],['investigating','查明到站地勤派工表漏派（SSR 有傳送，但到站站點未收到更新）'],['closed','向旅客致歉並致贈下次航班貴賓室使用券；已修正到站 SSR 通報流程']],note:'屬服務疏失，列入地勤主管紀錄。'},
    {t:'assistance',d:9,st:'awaiting_customer',pr:'normal',det:'旅客懷孕 32 週，詢問搭乘規定。',
      steps:[['received','客服中心受理'],['awaiting_customer','已告知懷孕 28–36 週需附 7 日內醫師開立之適航證明（含預產期），請旅客於報到前上傳']],note:'36 週以上（多胞胎 32 週以上）不予受理搭乘。'},
    {t:'disruption',d:-1,st:'closed',pr:'urgent',det:'班機因航管流量管制延誤 3 小時 10 分，旅客錯過後續轉機。',
      steps:[['received','轉機櫃檯受理'],['investigating','改訂次日最早一班（同艙等），提供轉機飯店一晚與餐券'],['closed','旅客已搭乘改訂班機抵達目的地，結案']],note:'延誤原因屬航管，不適用 EU261 現金補償；已依本公司規定提供食宿。'},
    {t:'denied_boarding',d:-2,st:'closed',pr:'normal',det:'班機超賣，登機門徵求自願讓位，旅客同意改搭下一班。',
      steps:[['received','登機門徵求自願者'],['closed','改搭 4 小時後班機並升等商務艙；補償 NT$6,000 旅行抵用券＋餐券，旅客簽署同意書']],note:'自願讓位，依 KGM 超賣補償辦法。'},
    {t:'invol_downgrade',d:-3,st:'investigating',pr:'urgent',det:'因換機（座位配置不同），旅客由商務艙非自願降為豪華經濟艙。',
      steps:[['received','報到櫃檯告知換機降艙並請旅客簽署非自願降艙同意書'],['investigating','計算退款：退還該航段商務與豪經票價差額，另加 50% 補償']],note:'差額與補償將退回原付款方式，約 7–14 個工作天。'},
    {t:'miles_claim',d:-12,st:'investigating',pr:'normal',det:'旅客搭乘合作航空聯營航班，里程未自動入帳。已提供登機證與電子機票號碼。',
      steps:[['received','會員服務受理補登'],['investigating','已向合作航空提出比對請求（一般 4–6 週）']],note:'聯營航班依合作航空訂位艙等累積；機票號碼 297 開頭確認為本公司開票。'},
    {t:'other',d:12,st:'awaiting_customer',pr:'normal',det:'旅客攜帶服務犬同行，詢問所需文件。',
      steps:[['received','客服中心受理'],['awaiting_customer','已請旅客於起飛 48 小時前提供服務犬訓練證明、狂犬病疫苗紀錄與目的地入境許可']],note:'服務犬可免費於客艙隨行，需坐在旅客腳邊、不可佔用走道。'},
    {t:'refund_req',d:20,st:'received',pr:'normal',det:'旅客簽證申請遭拒，申請全額退票（附拒簽信）。',
      steps:[['received','旅客上傳拒簽證明，申請退票']],note:'依 CHG-003：簽證被拒且起飛前提出，可免收退票手續費（需拒簽正本）。'},
    {t:'complaint',d:-5,st:'closed',pr:'normal',det:'座位螢幕無法開啟、USB 充電孔故障，旅客整趟無法使用娛樂系統。',
      steps:[['received','空服員記錄於客艙缺點報告（CDL）'],['closed','已報修該座位，致贈 NT$1,000 機上免稅品折價券']],note:'同機 2 個座位有相同問題，維修已排定。'},
    {t:'assistance',d:-2,st:'closed',pr:'urgent',det:'無成人陪伴兒童（UM，9 歲）抵達後，原定接機人臨時無法到場，家長要求更換接機人。',
      steps:[['received','到站站點受理家長來電'],['investigating','核對新接機人身分證件與家長書面授權'],['closed','孩童已由新接機人（舅舅）接走，簽收完成']],note:'UM 交接一律核對證件與授權書，不接受口頭變更。'}
  ];
  function caseSim22(n,force){
    try{
      if(!S.adminAuthed||S.view!=='admin'||typeof kgmDayOf72R1006A!=='function'||!window.simManifest||!window.kgmSimMaterializeR1010A)return 0;
      var L=S.staffCasesR1007A=S.staffCasesR1007A||[];
      if(!force&&L.some(function(c){return c&&c.simR1022A}))return 0;
      var T0=T(),made=0,seed=Date.now()%9973,pick=force?SC22.slice().sort(function(a,b){return ((a.det.length*seed)%97)-((b.det.length*seed)%97)}).slice(0,n||6):SC22;
      pick.forEach(function(sc,qi){
        var d=D(T0,sc.d),list=[];try{list=(kgmDayOf72R1006A(d)||[]).filter(function(x){return x&&x.f&&!x.f.partner&&!x.f.codeshare&&!x.f.via})}catch(_){}
        if(!list.length)return;
        var h=0,key='cs22|'+d+'|'+qi+'|'+(force?seed:0);for(var i=0;i<key.length;i++)h=(h*31+key.charCodeAt(i))>>>0;
        var x0=list[h%list.length],f=x0.f,rows=[];
        try{rows=(window.simManifest(f.code,d,Object.assign({},f,{acft:x0.t||f.acft}))||[]).filter(function(r){return r&&!r.real&&/^[A-Z0-9]{6}$/.test(r.pnr||'')&&r.cabin!=='Resident'})}catch(_){}
        if(sc.t==='invol_downgrade'){var bz=rows.filter(function(r){return r.cabin==='Business'});if(bz.length)rows=bz}
        if(!rows.length)return;
        var x=Object.assign({},rows[(h>>>3)%rows.length]);x.nationality=x.nationality||x.nat||'';x.seat='';
        var b=window.kgmSimMaterializeR1010A({f:f,date:d,x:x});if(!b)return;
        var base=Date.parse(d+'T'+(f.arr||f.dep||'12:00')+':00+08:00');if(sc.d>0)base=Date.now()-(30+h%300)*60000;
        var no='KG'+String(1000+(h%9000))+new Date().toISOString().slice(5,10).replace('-','')+String(new Date().getFullYear()).slice(2)+'M';
        if(L.some(function(c){return c&&c.caseNo===no}))no=no.replace(/M$/,'N');
        var prog=sc.steps.map(function(s2,si){var at=new Date(Math.min(Date.now()-60000,base+(si*(9+h%14)+1)*3600e3)).toISOString();
          return {at:at,status:s2[0],label:s2[1],by:si?'客服中心':(/^bag_|assistance|item_lost|denied|disruption|invol/.test(sc.t)?'機場地勤':'客服中心')}});
        var p=(b.paxList||[])[0]||{},tag=String(100000+h%900000);
        var rec={caseNo:no,pnr:b.pnr,type:sc.t,status:sc.st,priority:sc.pr,paxIndex:0,paxName:((p.lastName||'')+' / '+(p.firstName||'')).trim(),
          segment:{code:f.code,fr:f.fr,to:f.to,date:d},detail:sc.det.replace('{tag}',tag),
          bag:sc.bag?{tag:'KX'+tag,look:String(sc.bag),seen:'',deliver:''}:null,
          createdAt:prog[0].at,updatedAt:prog[prog.length-1].at,by:{empId:'SIM',name:'AI 模擬',role:'service'},assignee:{empId:'',name:''},
          userId:b.userId||null,email:b.contactEmail||p.email||'',progress:prog,notes:[{at:prog[prog.length-1].at,by:'客服中心',text:sc.note}],simR1022A:1};
        L.unshift(rec);made++;
      });
      if(made){try{logAct('模擬案件','產生 '+made+' 件（行李、客訴、特殊協助、航班異常…）')}catch(_){}try{save()}catch(_){}}
      return made;
    }catch(e){try{console.warn('k22 case sim',e)}catch(_){}return 0}
  }
  window.kgmCaseSimR1022A=function(n){var k=caseSim22(n||6,true);try{render()}catch(_){}return k};
  (function seed22(n){if(n>150)return;setTimeout(function(){try{if(caseSim22(0,false)){try{render()}catch(_){}return}if((S.staffCasesR1007A||[]).some(function(c){return c&&c.simR1022A}))return}catch(_){}seed22(n+1)},n?4000:12000)})(0);
  function caseBtn(){
    try{
      if(!(S.view==='admin'&&S.adminTab==='cases0831B'))return;
      var main=document.querySelector('#app main.p-admin-main');if(!main||main.querySelector('.k22-csim'))return;
      if(!/^(ceo|service|backend|ground)$/.test(String((S.adminUser||{}).role||''))&&(S.adminUser||{}).empId!=='MASTER')return;
      var n=(S.staffCasesR1007A||[]).filter(function(c){return c&&c.simR1022A}).length,d=document.createElement('div');d.className='k22-csim';
      d.innerHTML='<span>'+(z()?'模擬案件 '+n+' 件（行李、客訴、特殊協助、航班異常、里程補登…）':'Simulated cases: '+n)+'</span><button type="button" class="btn btn-sm" onclick="kgmCaseSimR1022A(6)">'+(z()?'再產生一批模擬案件':'Generate more')+'</button>';
      main.appendChild(d);
    }catch(_){}
  }
  /* ══ 訂購地點與當地時間（使用者：「後台訂購日期要寫的是根據當地IP位置時間喔然後要寫清楚是哪裡 系統要自動偵測」）══
     · 網頁本身拿不到自己的 IP 位置；真正的 IP 定位由 Cloudflare Worker 做（request.cf 有城市、國家、時區）——
       開頁時問一次 Worker 的 /geo（3 秒逾時，這次開頁記住）；Worker 還沒加 /geo 或連不上，就用瀏覽器回報的裝置時區，並標明來源。
     · 新訂位（前台這台瀏覽器剛訂的、沒有地點紀錄）存檔前補上 b.bookedGeoR1022A={tz,city,country,src}。
     · 模擬訂位沒有真的 IP：依聯絡電話國碼推定訂購地（標「模擬」）。 */
  var TZC={'Asia/Taipei':['台北','台灣'],'Asia/Tokyo':['東京','日本'],'Asia/Seoul':['首爾','韓國'],'Asia/Hong_Kong':['香港','香港'],'Asia/Macau':['澳門','澳門'],'Asia/Shanghai':['上海','中國'],
    'Asia/Singapore':['新加坡','新加坡'],'Asia/Bangkok':['曼谷','泰國'],'Asia/Kuala_Lumpur':['吉隆坡','馬來西亞'],'Asia/Manila':['馬尼拉','菲律賓'],'Asia/Ho_Chi_Minh':['胡志明市','越南'],'Asia/Jakarta':['雅加達','印尼'],
    'Australia/Sydney':['雪梨','澳洲'],'Australia/Melbourne':['墨爾本','澳洲'],'Australia/Brisbane':['布里斯本','澳洲'],'Pacific/Auckland':['奧克蘭','紐西蘭'],
    'America/Los_Angeles':['洛杉磯','美國'],'America/New_York':['紐約','美國'],'America/Chicago':['芝加哥','美國'],'America/Vancouver':['溫哥華','加拿大'],'America/Toronto':['多倫多','加拿大'],
    'Europe/London':['倫敦','英國'],'Europe/Paris':['巴黎','法國'],'Europe/Berlin':['柏林','德國'],'Europe/Rome':['羅馬','義大利'],'Europe/Amsterdam':['阿姆斯特丹','荷蘭'],'Europe/Vienna':['維也納','奧地利'],
    'Asia/Dubai':['杜拜','阿聯'],'Asia/Qatar':['杜哈','卡達'],'Asia/Kolkata':['德里','印度']};
  var PH22=[['+886','Asia/Taipei'],['+852','Asia/Hong_Kong'],['+853','Asia/Macau'],['+971','Asia/Dubai'],['+974','Asia/Qatar'],['+81','Asia/Tokyo'],['+82','Asia/Seoul'],['+86','Asia/Shanghai'],['+65','Asia/Singapore'],
    ['+66','Asia/Bangkok'],['+60','Asia/Kuala_Lumpur'],['+63','Asia/Manila'],['+84','Asia/Ho_Chi_Minh'],['+62','Asia/Jakarta'],['+61','Australia/Sydney'],['+64','Pacific/Auckland'],['+44','Europe/London'],
    ['+33','Europe/Paris'],['+49','Europe/Berlin'],['+39','Europe/Rome'],['+31','Europe/Amsterdam'],['+43','Europe/Vienna'],['+91','Asia/Kolkata'],['+1','America/Los_Angeles']];
  var GEO=null;
  function devGeo(){var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(_){}var c=TZC[tz]||[];return {tz:tz||'Asia/Taipei',city:c[0]||String(tz).split('/').pop().replace(/_/g,' '),country:c[1]||'',src:'device'}}
  function loadGeo(){
    try{var c=sessionStorage.getItem('kgm22_geo');if(c){GEO=JSON.parse(c);return}}catch(_){}
    GEO=devGeo();
    try{var base=String(window.KGM_WORKER_URL||'https://kgm-email.amychen-640413.workers.dev').replace(/\/+$/,'');
      var ac=typeof AbortController==='function'?new AbortController():null;var tm=setTimeout(function(){try{ac&&ac.abort()}catch(_){}},3000);
      fetch(base+'/geo',{signal:ac?ac.signal:undefined,cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){clearTimeout(tm);
        if(j&&j.timezone){var c=TZC[j.timezone]||[];GEO={tz:j.timezone,city:j.city||c[0]||'',country:j.countryName||c[1]||j.country||'',src:'ip'};try{sessionStorage.setItem('kgm22_geo',JSON.stringify(GEO))}catch(_){}}}).catch(function(){clearTimeout(tm)});
    }catch(_){}
  }
  function stampGeo(){
    try{if(!GEO||String(window.KGM_SIDE||'')==='admin')return;var L=S.bookings||[],now=Date.now(),cand=L.slice(0,15).concat(L.slice(-15));
      cand.forEach(function(b){if(!b||b.bookedGeoR1022A||b.simulated||b.simR1010A||b.csSimR1012A)return;var t=Date.parse(b.bookedAt||'');if(!(t>0)||now-t>20*60000||now-t<-60000)return;b.bookedGeoR1022A={tz:GEO.tz,city:GEO.city,country:GEO.country,src:GEO.src}})}catch(_){}
  }
  function off22(tz,t){try{var p=new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'shortOffset'}).formatToParts(new Date(t)).filter(function(x){return x.type==='timeZoneName'})[0];return p?p.value.replace('GMT','UTC'):''}catch(_){return ''}}
  function loc22(tz,t){try{var f=new Intl.DateTimeFormat('sv-SE',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(t));return f.replace('T',' ').slice(0,16)}catch(_){return new Date(t).toISOString().slice(0,16).replace('T',' ')}}
  window.kgmBookedWhereR1022A=function(b){
    var raw=b&&(b.bookedAt||b.createdAt);if(!raw)return '—';var t=Date.parse(raw);if(!(t>0))return E(raw);
    var g=b.bookedGeoR1022A,sim=false;
    if(!g){var ph=String(b.contactPhone||((b.paxList||[])[0]||{}).phone||'').replace(/\s/g,''),tz='';PH22.some(function(x){if(ph.indexOf(x[0])===0){tz=x[1];return true}});
      if(!tz){var nat=String(((b.paxList||[])[0]||{}).nat||'').toUpperCase();tz={TW:'Asia/Taipei',JP:'Asia/Tokyo',KR:'Asia/Seoul',HK:'Asia/Hong_Kong',SG:'Asia/Singapore',TH:'Asia/Bangkok',AU:'Australia/Sydney',US:'America/Los_Angeles',GB:'Europe/London',FR:'Europe/Paris',DE:'Europe/Berlin',CA:'America/Vancouver',MY:'Asia/Kuala_Lumpur',VN:'Asia/Ho_Chi_Minh',PH:'Asia/Manila',ID:'Asia/Jakarta',NZ:'Pacific/Auckland'}[nat]||''}
      if(tz){var c=TZC[tz]||[];g={tz:tz,city:c[0]||tz,country:c[1]||'',src:'sim'};sim=true}}
    if(!g)return E(new Date(t).toISOString().slice(0,16).replace('T',' '))+' UTC';
    var src=g.src==='ip'?(z()?'IP 定位':'IP location'):g.src==='sim'?(z()?'模擬訂位・依電話國碼推定':'simulated · from phone code'):(z()?'裝置時區（Worker 未提供 IP 定位）':'device time zone');
    return E(loc22(g.tz,t))+' <span style="font-weight:600;color:#2f6b55">'+E([g.city,g.country].filter(Boolean).join('，'))+'</span> <small style="color:#8b928c;font-weight:400">'+E(off22(g.tz,t))+' · '+E(src)+'</small>';
  };
  function saveWrap(){var sv=window.save;if(typeof sv!=='function'||sv.__r1022A)return;var w=function(){try{stampGeo()}catch(_){}return sv.apply(this,arguments)};try{Object.keys(sv).forEach(function(k){if(!(k in w))w[k]=sv[k]})}catch(_){}w.__r1022A=1;window.save=w;try{save=w}catch(_){}}
  try{loadGeo()}catch(_){}
  var CSS='.k22-chg{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 18px;padding:16px 20px;border:1px solid #d8e5dd;border-radius:16px;background:linear-gradient(180deg,#fbfdfb,#f3f8f4)}'
   +'.k22-chg.off{border-color:#ecc9c0;background:linear-gradient(180deg,#fffaf8,#fbefeb)}'
   +'.k22-chg-t{display:flex;flex-direction:column;gap:3px;min-width:0}.k22-chg-t small{font-size:10px;letter-spacing:.14em;font-weight:800;color:#9a7a38}'
   +'.k22-chg-t b{display:flex;align-items:center;gap:8px;font-size:18px;color:#173f33}.k22-chg-t b i{width:9px;height:9px;border-radius:50%;background:#2f8a5b;box-shadow:0 0 0 4px rgba(47,138,91,.14)}'
   +'.k22-chg.off .k22-chg-t b{color:#8f2f1d}.k22-chg.off .k22-chg-t b i{background:#c4452b;box-shadow:0 0 0 4px rgba(196,69,43,.14)}'
   +'.k22-chg-t span{font-size:12.5px;color:#5d665f;line-height:1.55}.k22-chg-t em{font-style:normal;font-size:11px;color:#8b928c}'
   +'.k22-chg .btn{flex:none;white-space:nowrap}.k22-chg .k22-danger{background:#a8361f;border-color:#a8361f;color:#fff}.k22-chg .k22-danger:hover{background:#8f2d19}'
   +'.k22-ro{flex:none;font-size:11.5px;color:#8b928c}'
   +'@media(max-width:640px){.k22-chg{flex-direction:column;align-items:stretch}}'
   /* 航班資料：組員／地勤 */
   +'html.k22-crew .r7-ops-search{display:none!important}'
   +'html.k22-nof .r7-admin > p,html.k22-nof .r7-admin > section.r7-ops-card[style]{display:none!important}'
   /* 哪些區塊給哪個職務看，照 r55 的權限表（PERM5：飛行資料＝飛行員、報到／座位圖／候補＝地勤、餐食＝全部）；
      組員／地勤這裡只看自己的，不再顯示「🔒 沒有檢視權限」的佔位條；旅客艙單飛行員用不到 */
   +'html.k22-crew .k55-locked{display:none!important}'
   +'html.k22-pilot .r7-manifest{display:none!important}'
   +'html.k22-pilot main.p-admin-main > .r40-panel,html.k22-cabin main.p-admin-main > .r40-panel{display:none!important}'   /* 候補名單（1012A 搬進航班資料）是地勤的事 */
   +'html.k22-cabin .r7-admin > div[style*="space-between"] > .btn,html.k22-ground .r7-admin > div[style*="space-between"] > .btn{display:none!important}'
   +'html.k22-crew .r7-ops-top{grid-template-columns:1fr}'
   +'.k22-mine{margin:14px 0 6px;padding:18px 20px;border:1px solid #dfe3dc;border-radius:18px;background:#fff}'
   +'.k22-mh{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:12px}.k22-mh h2{margin:2px 0 2px;font-size:20px}.k22-mh p{margin:0;font-size:12px;color:#6b726c}'
   +'.k22-src{font-size:11px;color:#2f6b55;background:#eef6f1;border:1px solid #d5e8dc;border-radius:999px;padding:4px 10px;white-space:nowrap}'
   +'.k22-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}'
   +'.k22-day{display:flex;flex-direction:column;gap:6px;min-width:0;padding:10px;border:1px solid #e6e8e2;border-radius:14px;background:#fbfbf8}.k22-day.rest{background:#f6f5f0}'
   +'.k22-dh{display:flex;align-items:baseline;gap:6px}.k22-dh b{font-size:14px;color:#173f33}.k22-dh span{font-size:11px;color:#8b928c}'
   +'.k22-leg{display:flex;flex-direction:column;align-items:flex-start;gap:1px;width:100%;text-align:left;padding:8px 9px;border:1px solid #d9e6de;border-radius:11px;background:#fff;cursor:pointer;font:inherit;color:inherit;transition:border-color .15s,box-shadow .15s,background .15s}'
   +'.k22-leg:hover{border-color:#9cc2ad;box-shadow:0 4px 12px rgba(23,63,51,.08)}.k22-leg.on{background:#173f33;border-color:#173f33;color:#fff}'
   +'.k22-leg b{font-size:14px;letter-spacing:.02em}.k22-leg span{font-size:12px}.k22-leg small{font-size:10.5px;color:#7a817b}.k22-leg.on small{color:#cfe0d6}'
   +'.k22-leg em{margin-top:3px;font-style:normal;font-size:10px;font-weight:700;color:#9a7a38}.k22-leg.on em{color:#f0d7a0}'
   +'.k22-dhl{display:flex;flex-direction:column;gap:1px;padding:7px 9px;border:1px dashed #cfd5cf;border-radius:11px;color:#6b726c}.k22-dhl b{font-size:12px}.k22-dhl span,.k22-dhl small{font-size:10.5px}'
   +'.k22-off{font-size:13px;color:#a3a89f;padding:4px 2px}.k22-none{margin-top:10px;font-size:13px;color:#6b726c}'
   +'.k22-wait{display:flex;align-items:center;gap:10px;padding:16px 4px;color:#4f5a53;font-size:13px}.k22-wait i{width:14px;height:14px;border-radius:50%;border:2px solid #cfe0d6;border-top-color:#2f6b55;animation:k22spin .9s linear infinite}'
   +'@keyframes k22spin{to{transform:rotate(360deg)}}'
   +'@media(max-width:1100px){.k22-days{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:640px){.k22-days{grid-template-columns:repeat(2,minmax(0,1fr))}.k22-mh{flex-direction:column;align-items:flex-start}}'
   /* + / − */
   +'.k22-sec{position:relative}'
   +'.k22-tg{position:absolute;top:12px;right:12px;z-index:3;width:28px;height:28px;padding:0;border-radius:50%;border:1px solid #d6dbd4;background:#fff;color:#173f33;font:700 17px/26px system-ui,-apple-system,sans-serif;text-align:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.06);transition:background .15s,border-color .15s}'
   +'.k22-tg:hover{background:#eef6f1;border-color:#9cc2ad}'
   +'.r7-ops-hero > .k22-tg{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.35);color:#fff}'
   +'.k22-col{max-height:64px!important;overflow:hidden!important}'
   +'.k22-col::after{content:"";position:absolute;left:0;right:0;bottom:0;height:22px;background:linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.95));pointer-events:none}'
   +'.r7-ops-hero.k22-col::after{background:none}'
   +'.k22-bar{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin:10px 0 4px}.k22-bar span{margin-right:auto;font-size:11.5px;color:#7a817b}'
   /* 競標每組 + / −（r61 grpCard） */
   +'.k920-grp.k22c>table,.k920-grp.k22c>div,.k920-grp.k22c>p{display:none!important}.k920-grp.k22c>h3{margin-bottom:0!important;border-bottom:0!important}'
   +'.k22-agt{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;margin-right:10px;padding:0;border-radius:50%;border:1px solid #d6dbd4;background:#fff;color:#173f33;font:700 15px/1 system-ui,-apple-system,sans-serif;cursor:pointer;vertical-align:middle}.k22-agt:hover{background:#eef6f1;border-color:#9cc2ad}'
   +'.k22-aucall{display:inline-flex;gap:6px;margin-left:12px;vertical-align:middle}.k22-aucall button{padding:4px 10px;border-radius:999px;border:1px solid #d6dbd4;background:#fff;color:#173f33;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit}.k22-aucall button:hover{background:#eef6f1}'
   /* 會員頁分組 */
   +'.k22m > .p-member-tabs{display:none!important}'
   +'.k22m .k22m-h{display:flex!important;align-items:center;gap:10px;margin:22px 0 10px!important;padding:0 0 8px!important;border:0!important;border-bottom:1px solid #e6e2d6!important;font-size:17px;color:#173f33}'
   +'.k22m .k22m-h b{font-size:17px}.k22m .k22m-h1 span{font-size:12px;color:#8b928c;font-weight:400}.k22m .k22m-h1{margin-top:6px!important}'
   +'.k22m-tg{flex:none;width:26px;height:26px;padding:0;border-radius:50%;border:1px solid #d6dbd4;background:#fff;color:#173f33;font:700 16px/1 system-ui,-apple-system,sans-serif;cursor:pointer}.k22m-tg:hover{background:#eef6f1;border-color:#9cc2ad}'
   +'.k22m .k185-kpi{padding-bottom:14px}.k22m .k22m-act{display:flex!important;flex-wrap:wrap;gap:8px;margin:14px 0 0!important;padding:12px 0 0!important;border:0!important;border-top:1px dashed #e2dccb!important;border-radius:0!important;background:none!important;box-shadow:none!important;grid-column:1/-1}'
   +'.k22m .k22m-h{box-shadow:none!important;border-left:0!important;padding-left:0!important}.k22m .k22m-h::before,.k22m .k22m-h::after{display:none!important}'
   +'.k22m-c-a > .k185-kpi{display:none!important}'
   +'.k22m-c-b .p-member-legacy > .k22m-h2 ~ *:not(.k22m-h3):not(.k22m-h3 ~ *){display:none!important}'
   +'.k22m-c-c .p-member-legacy > .k22m-h3 ~ *{display:none!important}'
   /* 主管紀錄（名冊每一級收合、空的一行；機師考核選航班） */
   +'.k22-lvrow{display:flex;align-items:center;gap:10px;margin:0 0 10px;padding:10px 16px;border:1px dashed #dfe6e2;border-radius:12px;background:#fbfcfb;color:#6b7b74;font-size:12.5px}.k22-lvrow b{color:#123c32}.k22-lvrow small{margin-left:auto;font-size:11.5px}'
   +'.k12m-card.k22c .k12m-sec{margin-bottom:0}.k22-ng .k12m-t th:nth-child(3),.k22-ng .k12m-t td:nth-child(3),.k22-ng .k12m-t th:nth-child(4),.k22-ng .k12m-t td:nth-child(4){display:none}'
   +'.k22p-f{margin-bottom:6px}.k22p-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:6px 0 12px}'
   +'.k22p-c{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:9px 11px;border:1px solid #dfe6e2;border-radius:12px;background:#fff;cursor:pointer;font:inherit;color:inherit;text-align:left}.k22p-c:hover{border-color:#9cc2ad}.k22p-c.on{background:#123c32;border-color:#123c32;color:#fff}'
   +'.k22p-c b{font-size:14px}.k22p-c span{font-size:12px}.k22p-c small{font-size:10.5px;color:#7d8a84}.k22p-c.on small{color:#cfe0d6}.k22p-c em{margin-top:3px;font-style:normal;font-size:10px;font-weight:800;color:#9a7a38}.k22p-c.on em{color:#f0d7a0}'
   +'.k22p-sel{margin:4px 0 10px;padding:10px 14px;border-radius:12px;background:#eef6f1;border:1px solid #d5e8dc;font-size:12.5px;color:#123c32;line-height:1.6}'
   +'.k22-lvt{display:grid;grid-template-columns:1fr 1fr;gap:10px}.k22-lvt label{display:flex;flex-direction:column;gap:4px;font-size:11px;font-weight:700;color:#5e6a64}'
   +'.k22-csim{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0 0;padding:12px 16px;border:1px dashed #d8d2c2;border-radius:12px;background:#fbfaf6;font-size:12.5px;color:#6b726c}'
   +'.k22-bar button{padding:6px 12px;border-radius:999px;border:1px solid #d6dbd4;background:#fff;color:#173f33;font-size:12px;font-weight:700;cursor:pointer}.k22-bar button:hover{background:#eef6f1}';
  function css(){if(document.getElementById('k22css'))return;var s=document.createElement('style');s.id='k22css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}

  function renWrap(){
    if(typeof render!=='function'||render.__r1022A)return;
    var rd=render;
    var w=function(){
      try{chgGuard()}catch(_){}
      try{preFd()}catch(_){}
      var r=rd.apply(this,arguments);
      try{chgCard();postFd();memTidy();caseBtn()}catch(_){}
      [60,350,1000].forEach(function(ms){setTimeout(function(){try{chgCard();postFd();memTidy();caseBtn()}catch(_){}},ms)});
      return r};
    try{Object.keys(rd).forEach(function(k){if(!(k in w))w[k]=rd[k]})}catch(_){}
    w.__r1022A=1;render=window.render=w;
  }
  function run(){css();viaWrap();chgWrap();fdWrap();renWrap();saveWrap()}
  run();
  try{document.addEventListener('DOMContentLoaded',function(){run();setTimeout(run,4000)})}catch(_){}
  window.kgmK22ApplyR1022A=run;
})();
