/* ══ 1103A：航班資料 → 座位圖「超賣／撞位處理」（使用者：「超賣的問題是兩個旅客訂到一個位置所以座位圖要可以搜尋旅客的姓名找到那位旅客
   （因為座位圖應該找不到）要有 move to __ seat（都可以）and 給予 __ 里程補償 如果同倉等沒有位置要顯示 move to __ flight
   要可以選給予多少機場抵用券之類的補償方案要可以彈性 就感覺現在整體有點死」）
   · 座位圖分頁最上面一條：搜尋姓名／PNR／會員卡號（座位圖上找不到的旅客也找得到）；
     名單產生時（manifest7）同一個座位只給第一位，後面的人改配同艙空位，同艙配完就沒有座位 → 超賣的旅客在座位圖上看不到。
     自動列出「沒有座位」的旅客，以及畫面上仍然同一座位兩位以上的「撞位」（Residence 雙人套房同訂位共用不算）。
   · 選一位旅客 → 兩個方案並排：
     ① 換座位：同艙空位優先，其他艙也可以（升艙不收費、降艙可填退差額）；補償里程自由填（快選 0／500／1,000／2,000／3,000）。
     ② 改搭航班：同航線之後 3 天內的班次，各列同艙空位與 Payload；補償可自由組合：機場抵用券（USD）、里程、現金（NT$）、餐券、住宿。
       同艙已經沒有空位時，① 會寫「本艙已滿」，② 自動展開。
   · 執行：寫進航班資料（作業動作紀錄，跟「作業動作」同一份 store7 列，可用「復原」撤銷換座位）、通知旅客、自動成立案件（kgmCaseAutoR1103A）、動作歷史。
     真實訂位改搭：整筆訂位的這一段一起改到新航班（irropsReplaceBookingSeg0815，跟取消航班改搭同一支），原座位清除、登機證作廢。
     模擬旅客改搭：只在原航班標記改搭到哪一班（模擬旅客名單是依航班產生，不會寫進新航班名單）。
   · 抵用券寫進訂位 b.vouchersR1103A（一年效期），里程直接入會員帳戶（有會員才入）。 */
(function(){
  if(window.__ov31)return;window.__ov31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function N(n){return (Math.round(+n||0)).toLocaleString()}
  function K(){return window.kgmFdKitR1103A||null}
  function onFd(){try{return S.view==='admin'&&S.adminTab==='flightdata'&&!!S.opsSelectedR7}catch(_){return false}}
  function st(){var k=S.opsSelectedR7||'';var o=S.ovbR1103A;if(!o||o.key!==k)o=S.ovbR1103A={key:k,q:'',id:'',miles:1000,usd:50,cash:0,meal:false,hotel:false,fmiles:0,seat:'',fl:'',refund:0,open:''};return o}
  function noDh(fn){var o=window.KGM_NODH_R1023A;window.KGM_NODH_R1023A=1;try{return fn()}finally{window.KGM_NODH_R1023A=o}}
  var MC={};   /* 同一次畫面內 manifest 快取（key → {t,m}） */
  function man(f,date){var k=f.code+'|'+date+'|'+f.fr+'|'+f.to,c=MC[k];if(c&&Date.now()-c.t<1500)return c.m;var m=noDh(function(){return manifest7(f,date)||[]});MC[k]={t:Date.now(),m:m};return m}
  function cur(){var k=K();if(!k)return null;var h=k.fromKey(S.opsSelectedR7);if(!h||!h.f)return null;return {f:h.f,date:h.date,key:S.opsSelectedR7}}
  function cabZ(c){var k=K();return k?k.cabZh(c):c}
  function live(m){return m.filter(function(x){return x&&!x.offloadR929})}
  function resPair(a,b){return a.cabin==='Resident'&&b.cabin==='Resident'&&a.pnr===b.pnr}
  function conflicts(m){var by={};live(m).forEach(function(x){if(x.seat)(by[x.seat]=by[x.seat]||[]).push(x)});
    var out=[];Object.keys(by).forEach(function(s){var L=by[s];if(L.length<2)return;if(L.length===2&&resPair(L[0],L[1]))return;out.push({seat:s,pax:L})});
    return out.sort(function(a,b){return a.seat.localeCompare(b.seat,undefined,{numeric:true})})}
  function seatless(m){return live(m).filter(function(x){return !x.seat&&!x.dhR929})}
  function freeSeats(f,date,m,exceptId){var k=K();if(!k)return [];var occ={};live(m).forEach(function(x){if(x.id!==exceptId&&x.seat)occ[x.seat]=1});
    var all=k.seatsFlat(k.type(f,date)).filter(function(s){return !s.resident&&!occ[s.id]});var bl={};try{if(window.kgmPlBlockedIdsR1101A)bl=window.kgmPlBlockedIdsR1101A(f,date,all.map(function(s){return s.id}))||{}}catch(_){}
    return all.filter(function(s){return !bl[s.id]})}
  function cabOrder(){return ['First','Business','Premium','Economy']}
  function depMin(f){var p=String(f.dep||'0:0').split(':');return (+p[0]||0)*60+(+p[1]||0)}
  function candFlights(f,date,cab,n){var out=[],d0=date;
    for(var i=0;i<4&&out.length<6;i++){var d=addDays(d0,i),fs=[];try{fs=sortedFlights(f.fr,f.to,d)||[]}catch(_){}
      fs.forEach(function(g){if(!g||g.partner||g.via||!/^KX/.test(String(g.code||''))||g.fr!==f.fr||g.to!==f.to)return;if(i===0&&(g.code===f.code||depMin(g)<=depMin(f)))return;
        try{var ov=(S.flightOverrides||{})[g.code+'_'+d];if(ov&&/cancel/i.test(ov.status||''))return}catch(_){}
        if(out.length>=6||out.some(function(o){return o.f.code===g.code&&o.date===d}))return;
        var gg=Object.assign({},g,{date:d}),m=man(gg,d),fr=freeSeats(gg,d,m,'').filter(function(s){return s.cabin===cab}).length,pl=null;
        try{pl=window.kgmPayloadR1023A?window.kgmPayloadR1023A(g.code,d,g.fr,g.to):null}catch(_){}
        var kg=+window.KGM_STAFF_KG_R1023A||107,plOk=!pl||pl.left>=kg*n;
        out.push({f:gg,date:d,free:fr,plOk:plOk,plLeft:pl?Math.round(pl.left):null})})}
    return out}
  function paxN(x){if(!x.real||!x.booking)return 1;return Math.max(1,(x.booking.paxList||[]).length||+x.booking.pax||1)}
  function match(m,q){q=String(q||'').trim().toLowerCase().replace(/\s+/g,' ');if(!q)return [];var t=q.split(' ');
    return m.filter(function(x){var s=[x.name,x.last,x.first,x.pnr,x.member,x.seat].join(' ').toLowerCase();return t.every(function(w){return s.indexOf(w)>=0})}).slice(0,12)}
  function tagOf(x,cf){var h=[];if(x.offloadR929)h.push('<i class="off">'+(z()?'已移出':'offloaded')+'</i>');
    var c=cf.filter(function(c){return c.pax.some(function(p){return p.id===x.id})})[0];if(c)h.push('<i class="dup">'+(z()?'撞位 ':'Same seat ')+E(c.seat)+'</i>');
    if(!x.seat&&!x.offloadR929)h.push('<i class="dup">'+(z()?'沒有座位':'No seat')+'</i>');
    if(x.real)h.push('<i class="real">'+(z()?'真實訂位':'Live')+'</i>');return h.join('')}
  function quick(field,vals,curV,unit){return '<span class="k31o-q">'+vals.map(function(v){return '<button type="button" class="'+(+curV===v?'on':'')+'" onclick="kgmOvbSetR1103A(\''+field+'\','+v+',1)">'+(v?N(v)+unit:(z()?'不給':'None'))+'</button>'}).join('')+'</span>'}

  function card(c,m,cf){var o=st(),x=m.filter(function(q){return q.id===o.id})[0];if(!x)return '';
    var f=c.f,date=c.date,fs=freeSeats(f,date,m,x.id).filter(function(q){return q.id!==x.seat}),same=fs.filter(function(s){return s.cabin===x.cabin}),ci=cabOrder().indexOf(x.cabin);
    var others=cabOrder().filter(function(cb){return cb!==x.cabin&&fs.some(function(s){return s.cabin===cb})});
    if(!o.seat||!fs.some(function(s){return s.id===o.seat}))o.seat=(same[0]||fs[0]||{}).id||'';
    var pick=fs.filter(function(s){return s.id===o.seat})[0],down=pick&&cabOrder().indexOf(pick.cabin)>ci;
    var opt=function(cb,L){return '<optgroup label="'+E(cabZ(cb))+(cb===x.cabin?(z()?'（同艙）':' (same)'):'')+' · '+L.length+'">'+L.slice(0,80).map(function(s){return '<option value="'+E(s.id)+'"'+(s.id===o.seat?' selected':'')+'>'+E(s.id)+'</option>'}).join('')+'</optgroup>'};
    var seatSel='<select class="inp" onchange="kgmOvbSetR1103A(\'seat\',this.value,1)">'+(same.length?opt(x.cabin,same):'')+others.map(function(cb){return opt(cb,fs.filter(function(s){return s.cabin===cb}))}).join('')+'</select>';
    var n=paxN(x),open=o.open||(same.length?'seat':'flight');
    var A1='<section class="k31o-opt'+(open==='seat'?' on':'')+'"><header onclick="kgmOvbSetR1103A(\'open\',\'seat\',1)"><b>①</b><div><h4>'+(z()?'換座位':'Move to seat')+'</h4><small>'+(same.length?(z()?'同艙還有 '+same.length+' 個空位':same.length+' free in cabin'):(z()?'本艙已滿，可換其他艙':'Cabin full — other cabins'))+'</small></div></header>'
      +(fs.length?('<div class="k31o-body"><label>'+(z()?'改到座位':'Seat')+seatSel+'</label>'
        +(pick&&pick.cabin!==x.cabin?'<p class="k31o-note">'+(down?(z()?'降到 '+cabZ(pick.cabin)+'：請填退還差額（IRR-013）。':'Downgrade: refund the difference.'):(z()?'升到 '+cabZ(pick.cabin)+'，不另收費。':'Upgrade at no charge.'))+'</p>':'')
        +(down?'<label>'+(z()?'退還差額 NT$':'Refund NT$')+'<input class="inp" type="number" min="0" step="100" value="'+(+o.refund||0)+'" onchange="kgmOvbSetR1103A(\'refund\',this.value)"></label>':'')
        +'<label>'+(z()?'補償里程':'Miles')+'<input class="inp" type="number" min="0" step="100" value="'+(+o.miles||0)+'" onchange="kgmOvbSetR1103A(\'miles\',this.value,1)"></label>'+quick('miles',[0,500,1000,2000,3000],o.miles,z()?' 哩':' mi')
        +'<button class="k31o-go" onclick="kgmOvbSeatR1103A()">'+(z()?'換到 ':'Move to ')+E(o.seat||'—')+(+o.miles?(z()?'，給 '+N(o.miles)+' 哩':' + '+N(o.miles)+' mi'):'')+'</button></div>')
        :'<p class="k31o-note">'+(z()?'整架都沒有空位（含 Payload 鎖排）。請用 ② 改搭航班。':'No free seat on this aircraft.')+'</p>')+'</section>';
    var B2='';if(open==='flight'){var cs=candFlights(f,date,x.cabin==='Resident'?'First':x.cabin,n);
      if(!o.fl||!cs.some(function(q){return q.f.code+'|'+q.date===o.fl&&q.free>=n&&q.plOk})){var g=cs.filter(function(q){return q.free>=n&&q.plOk})[0];o.fl=g?g.f.code+'|'+g.date:''}
      B2='<div class="k31o-body"><div class="k31o-fl">'+(cs.length?cs.map(function(q){var ok=q.free>=n&&q.plOk,id=q.f.code+'|'+q.date;return '<button type="button" class="'+(o.fl===id?'on ':'')+(ok?'':'no')+'"'+(ok?' onclick="kgmOvbSetR1103A(\'fl\',\''+A(id)+'\',1)"':' disabled')+'><b>'+E(q.f.code)+'</b><span>'+E(q.date.slice(5))+' '+E(q.f.dep||'')+'</span><em>'+(q.plOk?(z()?cabZ(x.cabin==='Resident'?'First':x.cabin)+' 空位 '+q.free:q.free+' free'):(z()?'Payload 不足':'Payload'))+'</em></button>'}).join(''):'<p class="k31o-note">'+(z()?'之後 3 天沒有同航線的 KGM 航班。':'No later flight in 3 days.')+'</p>')+'</div>'
        +(n>1?'<p class="k31o-note">'+(z()?'這是真實訂位，同一訂位 '+n+' 位會一起改搭（不拆訂位）。':'All '+n+' passengers in this booking move together.')+'</p>':'')
        +'<div class="k31o-grid"><label>'+(z()?'機場抵用券 USD':'Airport voucher USD')+'<input class="inp" type="number" min="0" step="5" value="'+(+o.usd||0)+'" onchange="kgmOvbSetR1103A(\'usd\',this.value,1)"></label>'+quick('usd',[0,25,50,100,150,200],o.usd,'')
        +'<label>'+(z()?'補償里程':'Miles')+'<input class="inp" type="number" min="0" step="500" value="'+(+o.fmiles||0)+'" onchange="kgmOvbSetR1103A(\'fmiles\',this.value,1)"></label>'+quick('fmiles',[0,2000,5000,10000],o.fmiles,z()?' 哩':' mi')
        +'<label>'+(z()?'現金補償 NT$':'Cash NT$')+'<input class="inp" type="number" min="0" step="500" value="'+(+o.cash||0)+'" onchange="kgmOvbSetR1103A(\'cash\',this.value,1)"></label>'
        +'<div class="k31o-chk"><label><input type="checkbox"'+(o.meal?' checked':'')+' onchange="kgmOvbSetR1103A(\'meal\',this.checked,1)">'+(z()?'機場餐券':'Meal voucher')+'</label><label><input type="checkbox"'+(o.hotel?' checked':'')+' onchange="kgmOvbSetR1103A(\'hotel\',this.checked,1)">'+(z()?'過夜住宿＋接駁':'Hotel + transfer')+'</label></div></div>'
        +'<button class="k31o-go"'+(o.fl?'':' disabled')+' onclick="kgmOvbFlightR1103A()">'+(o.fl?((z()?'改搭 ':'Move to ')+E(o.fl.replace('|',' '))):(z()?'沒有可改搭的班次':'No flight'))+'</button></div>'}
    var B='<section class="k31o-opt'+(open==='flight'?' on':'')+'"><header onclick="kgmOvbSetR1103A(\'open\',\'flight\',1)"><b>②</b><div><h4>'+(z()?'改搭航班':'Move to flight')+'</h4><small>'+(z()?'機場抵用券、里程、現金、餐券、住宿可自由組合':'Mix vouchers, miles, cash, meals, hotel')+'</small></div></header>'+B2+'</section>';
    return '<div class="k31o-card"><div class="k31o-who"><div><b>'+E(x.name)+'</b><span>'+E(x.pnr)+' · '+E(cabZ(x.cabin))+' · '+(x.seat?(z()?'座位 ':'Seat ')+E(x.seat):(z()?'沒有座位':'No seat'))+(x.tier?' · '+E(x.tier):'')+'</span>'+tagOf(x,cf)+'</div><button class="k31o-x" onclick="kgmOvbSetR1103A(\'id\',\'\',1)">✕</button></div>'
      +(x.offloadR929?'<p class="k31o-note">'+(z()?'這位旅客已移出本航班（'+E(((x.opsActR929||{}).act)||'')+'）。要重新處理請先在旅客名單「復原」。':'Already offloaded.')+'</p>':'<div class="k31o-two">'+A1+B+'</div>')+'</div>'}

  function html(){var c=cur();if(!c)return '';var o=st(),m=man(c.f,c.date),cf=conflicts(m),sl=seatless(m),res=match(m,o.q);
    var sum='<div class="k31o-sum">'+(cf.length?'<span class="bad">'+(z()?'撞位 '+cf.length+' 處':cf.length+' seat conflicts')+'</span>'+cf.slice(0,8).map(function(q){return '<button onclick="kgmOvbSetR1103A(\'id\',\''+A(q.pax[1].id)+'\',1)">'+E(q.seat)+' · '+q.pax.map(function(p){return E(p.last||p.name)}).join(' / ')+'</button>'}).join(''):'<span class="ok">'+(z()?'沒有撞位':'No seat conflicts')+'</span>')
      +(sl.length?'<span class="bad">'+(z()?'沒有座位 '+sl.length+' 位':sl.length+' without seat')+'</span>'+sl.slice(0,6).map(function(x){return '<button onclick="kgmOvbSetR1103A(\'id\',\''+A(x.id)+'\',1)">'+E(x.name)+'</button>'}).join(''):'')+'</div>';
    var list=o.q?('<div class="k31o-res">'+(res.length?res.map(function(x){return '<button class="'+(x.id===o.id?'on':'')+'" onclick="kgmOvbSetR1103A(\'id\',\''+A(x.id)+'\',1)"><b>'+E(x.name)+'</b><span>'+E(x.pnr)+' · '+E(cabZ(x.cabin))+' · '+(x.seat?E(x.seat):'—')+'</span>'+tagOf(x,cf)+'</button>'}).join(''):'<p>'+(z()?'找不到符合的旅客。':'No match.')+'</p>')+'</div>'):'';
    return '<div class="k31o-top"><div class="k31o-h"><div><small>OVERSALE · SEAT CONFLICT</small><h3>'+(z()?'超賣／撞位處理':'Oversale & seat conflicts')+'</h3></div>'
      +'<label class="k31o-s"><span>⌕</span><input id="k31oQ" class="inp" autocomplete="off" placeholder="'+(z()?'搜尋旅客姓名、PNR、會員卡號（座位圖上被蓋住的也找得到）':'Name, PNR or member no.')+'" value="'+E(o.q)+'" oninput="kgmOvbQR1103A(this.value)"></label></div>'
      +sum+list+(o.id?card(c,m,cf):'')+'</div>'}

  /* 座位圖本身是有捲軸的框（.r7-seatmap，也是分頁區塊 data-k23fd="seat"）→ 面板放在它正上方（同一層），其他分頁用 CSS 藏起來 */
  function mount(){try{if(!onFd())return;var sm=document.querySelector('#app .r7-seatmap');if(!sm||!sm.parentNode)return;
      var box=document.getElementById('k31ovb');if(!box||box.nextElementSibling!==sm){if(box)box.remove();box=document.createElement('div');box.id='k31ovb';sm.parentNode.insertBefore(box,sm)}
      box.innerHTML=html()}catch(e){try{console.warn('ov31',e)}catch(_){}}}
  function redraw(focusQ){var a=document.activeElement,q=a&&a.id==='k31oQ',pos=q?a.selectionStart:null;mount();if(q||focusQ){var i=document.getElementById('k31oQ');if(i){i.focus();try{var n=i.value.length;i.setSelectionRange(pos==null?n:pos,pos==null?n:pos)}catch(_){}}}}
  var qT=null;
  window.kgmOvbQR1103A=function(v){st().q=String(v||'');if(qT)clearTimeout(qT);qT=setTimeout(function(){qT=null;redraw(true)},120)};
  window.kgmOvbSetR1103A=function(k,v,re){var o=st();if(k==='miles'||k==='usd'||k==='cash'||k==='fmiles'||k==='refund')v=Math.max(0,Math.round(+v||0));
    if(k==='id'){o.seat='';o.fl='';o.open='';o.refund=0}o[k]=v;
    if(k==='seat'){try{var c=cur(),m=man(c.f,c.date),x=m.filter(function(q){return q.id===o.id})[0],s=freeSeats(c.f,c.date,m,o.id).filter(function(q){return q.id===v})[0];var kk=K();
      if(x&&s&&cabOrder().indexOf(s.cabin)>cabOrder().indexOf(x.cabin))o.refund=Math.max(0,(kk.fare(c.f,c.date,x)||0)-(kk.low(c.f,c.date,s.cabin)||0));else o.refund=0}catch(_){}}
    if(re)redraw()};
  function who(){return (S.adminUser&&(S.adminUser.name||S.adminUser.empId))||'GROUND'}
  function credit(b,miles,desc){if(!miles||!b||!b.userId)return false;var u=(S.users||[]).filter(function(q){return q&&q.id===b.userId})[0];if(!u)return false;
    u.miles=(+u.miles||0)+miles;(u.milesLog=u.milesLog||[]).unshift({date:todayISO(),miles:miles,desc:desc});return true}
  function caseFor(x,c,act,detail){try{if(!window.kgmCaseAutoR1103A)return '';return window.kgmCaseAutoR1103A({pnr:x.pnr,act:act,type:'denied_boarding',priority:'high',label:z()?(act==='ovbseat'?'超賣換座位':'超賣改搭航班'):(act==='ovbseat'?'Oversale seat move':'Oversale rebooking'),
      detail:detail,segment:{code:c.f.code,date:c.date,fr:c.f.fr,to:c.f.to},paxName:x.name,staff:who(),empId:(S.adminUser||{}).empId||''})}catch(_){return ''}}
  function toast(t){try{var d=document.createElement('div');d.className='k31-toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},4200)}catch(_){}}
  window.kgmOvbSeatR1103A=function(){var k=K(),c=cur(),o=st();if(!k||!c)return;MC={};var m=man(c.f,c.date),x=m.filter(function(q){return q.id===o.id})[0];if(!x)return;
    var s=freeSeats(c.f,c.date,m,x.id).filter(function(q){return q.id===o.seat&&q.id!==x.seat})[0];if(!s){alert(z()?'這個座位已經有人，請重新選擇。':'Seat taken.');redraw();return}
    var miles=+o.miles||0,ref=cabOrder().indexOf(s.cabin)>cabOrder().indexOf(x.cabin)?(+o.refund||0):0,now=new Date().toISOString();
    var detail=(z()?'超賣／撞位換座位：':'Seat move: ')+(x.seat||'—')+' → '+s.id+(s.cabin!==x.cabin?'（'+cabZ(x.cabin)+' → '+cabZ(s.cabin)+'）':'')+(miles?(z()?' · 補償 '+N(miles)+' 哩':' · '+N(miles)+' mi'):'')+(ref?(z()?' · 退差額 NT$':' · refund NT$')+N(ref):'')+' · '+c.f.code+' '+c.f.fr+'→'+c.f.to+' '+c.date;
    if(!confirm(detail+'\n\n'+(z()?'確定執行？':'Proceed?')))return;
    var patch={seat:s.id,opsActR929:{act:'ovbseat',at:now,by:who(),to:s.id,miles:miles,amount:ref},prevR929:{cabin:x.cabin,fare:x.fare,seat:x.seat}};
    if(s.cabin!==x.cabin){patch.cabin=s.cabin;try{patch.fare=k.upFare(c.f,c.date,s.cabin)}catch(_){}}
    k.applyRow(c.key,x,patch,c.f,c.date);
    var b=x.real&&x.booking,cr=credit(b,miles,(z()?'超賣換座位補償 ':'Oversale compensation ')+c.f.code+' '+c.date);
    if(b){if(ref)(b.refundsR60=b.refundsR60||[]).push({at:now,segs:[x.segmentKey],fare:0,fee:0,noShow:0,net:ref,downgradeR929:'ovbseat'});(b.compR929=b.compR929||[]).push({seg:x.segmentKey,act:'ovbseat',miles:miles,amount:ref,seat:s.id,at:now,by:who()})}
    k.tell(x,(z()?'座位異動 ':'Seat change ')+c.f.code,z()?('您 '+c.f.code+'（'+c.date+'）的座位已改為 '+s.id+(s.cabin!==x.cabin?'（'+cabZ(s.cabin)+'）':'')+(miles?('，並補償 '+N(miles)+' 哩'+(cr?'（已入帳）':'')):'')+(ref?('，退還 NT$'+N(ref)):'')+'。造成不便，敬請見諒。'):'Your seat has changed.');
    var no=caseFor(x,c,'ovbseat',detail);
    try{logAct(z()?'航班資料：超賣換座位':'Flight file: oversale seat move',x.pnr+' '+detail+(no?' · '+no:''))}catch(_){}
    o.id='';o.seat='';MC={};try{save()}catch(_){}try{render()}catch(_){}toast((z()?'已換到 ':'Moved to ')+s.id+(no?(z()?' · 案件 ':' · case ')+no:''))};
  window.kgmOvbFlightR1103A=function(){var k=K(),c=cur(),o=st();if(!k||!c||!o.fl)return;MC={};var m=man(c.f,c.date),x=m.filter(function(q){return q.id===o.id})[0];if(!x)return;
    var p=o.fl.split('|'),cab=x.cabin==='Resident'?'First':x.cabin,n=paxN(x),cs=candFlights(c.f,c.date,cab,n),q=cs.filter(function(t){return t.f.code===p[0]&&t.date===p[1]})[0];
    if(!q||q.free<n||!q.plOk){alert(z()?'這班已經沒有足夠的空位或 Payload，請重新選擇。':'Not enough seats.');redraw();return}
    var usd=+o.usd||0,miles=+o.fmiles||0,cash=+o.cash||0,now=new Date().toISOString(),nf=q.f;
    var comp=[usd?(z()?'機場抵用券 USD'+usd:'voucher USD'+usd):'',miles?(N(miles)+(z()?' 哩':' mi')):'',cash?('NT$'+N(cash)):'',o.meal?(z()?'餐券':'meal'):'',o.hotel?(z()?'住宿＋接駁':'hotel'):''].filter(Boolean);
    var detail=(z()?'超賣改搭：':'Rebooked: ')+c.f.code+' '+c.date+' → '+nf.code+' '+q.date+' '+(nf.dep||'')+(n>1?(z()?'（同訂位 '+n+' 位）':' ('+n+' pax)'):'')+(comp.length?(z()?' · 補償：':' · comp: ')+comp.join('、'):'');
    if(!confirm(detail+'\n\n'+(z()?'確定執行？':'Proceed?')))return;
    var rec={act:'ovbflight',at:now,by:who(),to:nf.code+' '+q.date,usd:usd,miles:miles,amount:cash,meal:!!o.meal,hotel:!!o.hotel};
    var b=x.real&&x.booking,cr=false;
    if(b){var hit=null;try{hit=findAffectedBookingSeg0815(b,c.f.code,c.date)}catch(_){}var seg=(hit&&hit.seg)||x.segmentKey;
      try{irropsReplaceBookingSeg0815(b,seg,{code:nf.code,date:q.date,dep:nf.dep,arr:nf.arr,fr:nf.fr,to:nf.to,acft:nf.acft})}catch(e){alert((z()?'改訂位失敗：':'Rebook failed: ')+(e&&e.message||e));return}
      b.seats=b.seats||{};b.seats[seg]={};b.boardingPass=b.boardingPass||{};delete b.boardingPass[seg];
      (b.compR929=b.compR929||[]).push({seg:seg,act:'ovbflight',usd:usd,miles:miles,amount:cash,meal:!!o.meal,hotel:!!o.hotel,from:c.f.code+' '+c.date,to:nf.code+' '+q.date,at:now,by:who()});
      if(usd){var exp=addDays(todayISO(),365);(b.vouchersR1103A=b.vouchersR1103A||[]).push({type:'airport',usd:usd,code:'KGV'+String(Date.now()).slice(-7),issued:todayISO(),exp:exp,why:'ovbflight',flight:c.f.code+' '+c.date,used:false})}
      cr=credit(b,miles,(z()?'超賣改搭補償 ':'Oversale compensation ')+c.f.code+' '+c.date);
      k.applyRow(c.key,x,{offloadR929:true,seat:'',physical:false,boarded:false,opsActR929:rec},c.f,c.date)}
    else k.applyRow(c.key,x,{offloadR929:true,seat:'',physical:false,boarded:false,opsActR929:rec,prevR929:{cabin:x.cabin,fare:x.fare,seat:x.seat}},c.f,c.date);
    k.tell(x,(z()?'改搭航班與補償 ':'Rebooking & compensation ')+c.f.code,z()?('因 '+c.f.code+'（'+c.date+'）座位超賣，您已改搭 '+nf.code+'（'+q.date+' '+(nf.dep||'')+' 起飛）'+(comp.length?('，補償：'+comp.join('、')+(cr?'（里程已入帳）':'')):'')+'。原座位已取消，請重新選位或於櫃檯劃位。'):'You have been rebooked.');
    var no=caseFor(x,c,'ovbflight',detail);
    try{logAct(z()?'航班資料：超賣改搭':'Flight file: oversale rebooking',x.pnr+' '+detail+(no?' · '+no:''))}catch(_){}
    o.id='';o.fl='';MC={};try{save()}catch(_){}try{render()}catch(_){}toast((z()?'已改搭 ':'Rebooked to ')+nf.code+' '+q.date+(no?(z()?' · 案件 ':' · case ')+no:''))};
  /* 每次整頁重畫後把面板放回座位圖分頁上方（狀態在 S.ovbR1103A，不靠 DOM） */
  function hook(){var R0=window.render;if(typeof R0==='function'&&!R0.__ov31){var w=function(){var r=R0.apply(this,arguments);try{if(onFd())mount()}catch(_){}return r};
      try{Object.keys(R0).forEach(function(k){if(!(k in w))w[k]=R0[k]})}catch(_){}w.__ov31=1;window.render=w;try{render=w}catch(_){}}}
  hook();setTimeout(hook,0);setTimeout(hook,3000);setTimeout(hook,10000);
  try{var css=document.createElement('style');css.textContent=[
    '#k31ovb{margin:0 0 14px}.k25fd-tabm:not([data-k25t="seat"]):not([data-k25t="all"]) #k31ovb{display:none}.k31o-top{border:1px solid #e3dccb;border-radius:14px;background:linear-gradient(180deg,#fffdf8,#fff);padding:14px 16px;box-shadow:0 1px 0 rgba(11,59,48,.04)}',
    '.k31o-h{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}.k31o-h small{font-size:10px;letter-spacing:.16em;color:#a08a5c;font-weight:800}.k31o-h h3{margin:2px 0 0;font-size:17px;color:#0b3b30}',
    '.k31o-s{flex:1;min-width:260px;max-width:520px;position:relative;display:block}.k31o-s span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8a8175;font-size:15px}.k31o-s .inp{width:100%;height:38px;padding-left:32px;border-radius:10px}',
    '.k31o-sum{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:10px;font-size:12px}.k31o-sum span{font-weight:800;padding:3px 9px;border-radius:999px}.k31o-sum .bad{background:#fbe6e0;color:#9b2d17}.k31o-sum .ok{background:#e7f4ec;color:#1f6f4a}',
    '.k31o-sum button{border:1px solid #ead7cf;background:#fff;border-radius:999px;padding:3px 10px;font-size:11.5px;color:#5b3a2f;cursor:pointer}.k31o-sum button:hover{border-color:#9b2d17}',
    '.k31o-res{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px;margin-top:10px}.k31o-res p{margin:4px 0;color:#8a8175;font-size:12.5px}',
    '.k31o-res button{text-align:left;border:1px solid #e6e0d2;background:#fff;border-radius:10px;padding:7px 10px;cursor:pointer;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center}.k31o-res button.on,.k31o-res button:hover{border-color:#0b3b30;background:#f5faf7}',
    '.k31o-res b{font-size:12.5px;color:#0b3b30}.k31o-res span{font-size:11px;color:#7a7266}',
    '.k31o-res i,.k31o-who i{font-style:normal;font-size:10.5px;font-weight:800;padding:1px 7px;border-radius:999px;background:#eef2f0;color:#3c5a50}.k31o-res i.dup,.k31o-who i.dup{background:#fbe6e0;color:#9b2d17}.k31o-res i.real,.k31o-who i.real{background:#e8eefb;color:#2b4f8f}.k31o-res i.off,.k31o-who i.off{background:#eee;color:#666}',
    '.k31o-card{margin-top:12px;border-top:1px dashed #e3dccb;padding-top:12px}.k31o-who{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.k31o-who div{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}.k31o-who b{font-size:15px;color:#0b3b30}.k31o-who span{font-size:12px;color:#6b645a}',
    '.k31o-x{border:0;background:#f2efe7;border-radius:8px;width:28px;height:28px;cursor:pointer;color:#6b645a}',
    '.k31o-two{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}@media(max-width:900px){.k31o-two{grid-template-columns:1fr}}',
    '.k31o-opt{border:1px solid #e6e0d2;border-radius:12px;background:#fff;overflow:hidden}.k31o-opt.on{border-color:#0b3b30;box-shadow:0 0 0 2px rgba(11,59,48,.08)}',
    '.k31o-opt header{display:flex;gap:10px;align-items:center;padding:10px 12px;cursor:pointer;background:#faf8f3}.k31o-opt.on header{background:#0b3b30;color:#fff}.k31o-opt header b{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#0b3b30;font-size:13px}',
    '.k31o-opt h4{margin:0;font-size:14px}.k31o-opt header small{font-size:11.5px;opacity:.8}',
    '.k31o-body{padding:12px;display:flex;flex-direction:column;gap:8px}.k31o-body label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700;color:#6b645a}.k31o-body .inp{height:36px}',
    '.k31o-q{display:flex;flex-wrap:wrap;gap:5px;margin-top:-2px}.k31o-q button{border:1px solid #ddd5c4;background:#fff;border-radius:999px;padding:3px 10px;font-size:11.5px;cursor:pointer;color:#0b3b30}.k31o-q button.on{background:#0b3b30;color:#fff;border-color:#0b3b30}',
    '.k31o-note{margin:0;font-size:12px;color:#7a5608;background:#fdf3d8;border-radius:8px;padding:6px 9px;line-height:1.5}',
    '.k31o-go{margin-top:4px;height:40px;border:0;border-radius:10px;background:#a77d33;color:#fff;font-weight:800;cursor:pointer;font-size:13.5px}.k31o-go:disabled{background:#cfc8b8;cursor:not-allowed}',
    '.k31o-fl{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:6px}.k31o-fl button{border:1px solid #e0d9c8;background:#fff;border-radius:10px;padding:7px 8px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:1px}',
    '.k31o-fl button b{font-size:13px;color:#0b3b30}.k31o-fl button span{font-size:11px;color:#6b645a}.k31o-fl button em{font-style:normal;font-size:10.5px;color:#1f6f4a;font-weight:700}.k31o-fl button.on{border-color:#0b3b30;background:#eef6f1}.k31o-fl button.no{opacity:.5;cursor:not-allowed}.k31o-fl button.no em{color:#9b2d17}',
    '.k31o-grid{display:grid;grid-template-columns:1fr;gap:6px}.k31o-chk{display:flex;gap:14px;flex-wrap:wrap}.k31o-chk label{flex-direction:row!important;align-items:center;gap:6px!important;font-weight:600!important;color:#3c3a35!important;font-size:12.5px!important}'
  ].join('');document.head.appendChild(css)}catch(_){}
})();
