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
   +'.k22-bar button{padding:6px 12px;border-radius:999px;border:1px solid #d6dbd4;background:#fff;color:#173f33;font-size:12px;font-weight:700;cursor:pointer}.k22-bar button:hover{background:#eef6f1}';
  function css(){if(document.getElementById('k22css'))return;var s=document.createElement('style');s.id='k22css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}

  function renWrap(){
    if(typeof render!=='function'||render.__r1022A)return;
    var rd=render;
    var w=function(){
      try{chgGuard()}catch(_){}
      try{preFd()}catch(_){}
      var r=rd.apply(this,arguments);
      try{chgCard();postFd()}catch(_){}
      [60,350,1000].forEach(function(ms){setTimeout(function(){try{chgCard();postFd()}catch(_){}},ms)});
      return r};
    try{Object.keys(rd).forEach(function(k){if(!(k in w))w[k]=rd[k]})}catch(_){}
    w.__r1022A=1;render=window.render=w;
  }
  function run(){css();viaWrap();chgWrap();fdWrap();renWrap()}
  run();
  try{document.addEventListener('DOMContentLoaded',function(){run();setTimeout(run,4000)})}catch(_){}
  window.kgmK22ApplyR1022A=run;
})();
