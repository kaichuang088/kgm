
/* ══ 1101A：季節性 Payload 限座＝鎖經濟艙最後幾排（使用者：「Payload 有影響少賣的座位要在選位系統整個季節所有日期調整」＋實務說明：
   「以排為單位鎖死，而非零散鎖位……直接把經濟艙最後面的 3–4 排整區完全鎖住」）。
   少賣席數照舊讀 kgmPaxCapR1025B（最外層含後台人工調整）；鎖幾排＝少賣席數 ÷ 每排座位數（無條件進位），從經濟艙最後一排往前。
   選位圖（seatView）、真實訂位自動劃位（autoAssignSeat 0814）、模擬旅客座位（simManifest 1018A）三個地方都用這一份。 ══ */
(function(){
  var C=new Map();
  function sprOf(type){try{var e=((AC[type]||{}).cabins||{}).econ;if(!e||!e.lay)return 0;return e.lay.filter(function(c){return c!=='|'}).length}catch(_){return 0}}
  /* f：航班（或航段）物件；回傳 {seats:少賣席數, rows:鎖幾排, spr:每排座位數} */
  window.kgmPlBlockRowsR1101A=function(f,date,type){try{
    if(!f||!date||f.partner||f.codeshare)return {seats:0,rows:0,spr:0};
    var ty=type||f.acft;try{ty=type||acftOfFlight(f.code,date,f.fr,f.to)||f.acft}catch(_){}
    var k=f.code+'|'+f.fr+'|'+f.to+'|'+date+'|'+ty,v=C.get(k);if(v&&Date.now()-v.t<20000)return v.r;
    var c=null;try{c=window.kgmPaxCapR1025B?window.kgmPaxCapR1025B(f,date):null}catch(_){c=null}
    var b=c&&+c.blocked>0?+c.blocked:0,spr=sprOf(ty)||10,r={seats:b,rows:b?Math.ceil(b/spr):0,spr:spr,type:ty};
    if(C.size>4000)C.clear();C.set(k,{t:Date.now(),r:r});return r}catch(_){return {seats:0,rows:0,spr:0}}};
  /* 經濟艙座位號清單（已依前→後排序或任意）→ 最後 rows 排的座位號 */
  window.kgmPlBlockedIdsR1101A=function(f,date,ids){var out={};try{var B=window.kgmPlBlockRowsR1101A(f,date);if(!B.rows||!ids||!ids.length)return out;
    var rows=[];ids.forEach(function(s){var n=parseInt(String(s),10);if(!isNaN(n)&&rows.indexOf(n)<0)rows.push(n)});rows.sort(function(a,b){return a-b});
    var cut=rows.slice(Math.max(0,rows.length-B.rows));ids.forEach(function(s){if(cut.indexOf(parseInt(String(s),10))>=0)out[s]=1})}catch(_){}return out};
  try{var cs=document.createElement('style');cs.id='k28pl-css';cs.textContent=
    '.seat.k28-plblk{background:repeating-linear-gradient(135deg,#EEF1EF 0 4px,#E1E6E3 4px 8px)!important;border-color:#CBD3CE!important;color:transparent!important;cursor:not-allowed}'
   +'.k28pl-chips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}.k28pl-chips button{border:1px solid #DCE5E0;background:#fff;border-radius:999px;padding:6px 12px;font:600 12.5px system-ui,sans-serif;color:#33443C;cursor:pointer}.k28pl-chips button.on{background:#0B3D2E;color:#fff;border-color:#0B3D2E}.k28pl-chips i{font-style:normal;opacity:.65;margin-left:2px}'
   +'tr.k28pl-g td{background:#F4F1E8!important;padding:10px 14px!important;border-top:2px solid #E3DAC3}tr.k28pl-g b{font-size:14px;color:#0F2A21}tr.k28pl-g code{font:700 11px ui-monospace,monospace;color:#9A7B2F;margin-left:4px}tr.k28pl-g span{float:right;font-size:11.5px;color:#6B5A2E}'
   +'.k28-pl-div{display:flex;align-items:center;gap:8px;margin:6px 0 4px;font:700 10.5px system-ui,sans-serif;color:#6B5A2E;letter-spacing:.04em}.k28-pl-div span{flex:1;height:1px;background:#D9CBA6}.k28-pl-div b{white-space:nowrap}';
    document.head.appendChild(cs)}catch(_){}
})();

/* ══ 1101A：航班資料「載重平衡」——Payload 鎖住的後排還有旅客（限座生效前就劃好位、或人工劃位）→ 列出建議調整幾席與名單，一鍵移到前面的空位。
   使用者：「一率先從沒有事先選位置的先下手（自動選位階段也要確保平衡），再來還有需要調整的就從那一群經濟艙基本的旅客，然後要退還選位支付的費用加上補償：
   1) 里程方案：短程 500／長程 1200 里程　2) 現金抵用券：短程 USD 20／長程 USD 30 機場抵用券，二選一」。
   順序：A 系統配位（沒有自己選位）→ B 經濟艙基本（自己付費選位：退選位費＋補償）→ C 其他自己選的位子（補償，免費選位不用退費）。
   補償由旅客在「行程管理」二選一（kgmPlCompChooseR1101A）；選里程直接入帳（creditMiles），選抵用券發一張機場抵用券（S.vouchersR1101A，存檔）。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E2(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  /* 模擬訂位（案件模擬、客服模擬、團體模擬…）不列、不補償、不寄信 */
  function sim28(b){return !!(b.sim||b.simR1023A||b.simR1010A||b.csSimR1012A||b.simulated||b.isSim||b.mockR1026C)}
  /* 選位費是整筆訂位的總額 → 依這筆訂位自己選的座位數平均（每位旅客、每一段各一份） */
  function share28(b){try{var t=window.kgmSeatPaidR109?window.kgmSeatPaidR109(b.pnr):0,n=0;Object.keys(b.seats||{}).forEach(function(k){var st=b.seats[k]||{};if(st._auto)return;n+=Object.keys(st).filter(function(x){return x!=='_auto'&&st[x]}).length});return n?Math.round(t/n):0}catch(_){return 0}}
  function longHaul(f){try{return (+distOf(f.fr,f.to)||0)>=4000}catch(_){return false}}
  function sh(f,sid){try{return window.kgmShownSeatR1006A?window.kgmShownSeatR1006A(f,sid):sid}catch(_){return sid}}
  function econCode(){try{return Object.keys(FARES).filter(function(k){return FARES[k].cabin==='Economy'})[0]}catch(_){return 'L'}}
  function legOf(code,date,fr,to){var f=null;try{f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.via&&(!fr||x.fr===fr)&&(!to||x.to===to)})[0]}catch(_){}
    if(!f)return null;var x=f;try{x=window.kgmSeasonFlightR48(f,date)||f}catch(_){}return Object.assign({},f,x,{date:date})}
  /* 這一班這一天：鎖住的排、坐在裡面的真實旅客（依 A→B→C 排序）、前面可用的空位 */
  window.kgmPlBalanceR1101A=function(code,date,fr,to){try{
    var f=legOf(code,date,fr,to);if(!f)return null;var B=window.kgmPlBlockRowsR1101A(f,date);
    var ids=window.cabinSeatIds0814?cabinSeatIds0814(f,econCode()):[],bl=window.kgmPlBlockedIdsR1101A(f,date,ids),blS=bl,idS={};ids.forEach(function(s){idS[s]=1});   /* 訂位存內部排號（0823C／r65）；舊資料若存了改號後的號碼（1006A 自動劃位，48 排以後）換回內部排號 */
    function in28(s){return idS[s]?s:(function(){try{var r=window.kgmRawSeatR1006A?window.kgmRawSeatR1006A(f,s):s;return idS[r]?r:s}catch(_){return s}})()}
    var sim={};try{sim=simSeatMap(f.code,date)||{}}catch(_){}
    var real={},who=[];
    (S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled'||sim28(b))return;Object.keys(b.seats||{}).forEach(function(seg){var info=null;try{info=bookingSegInfo0813(b,seg)}catch(_){}
      if(!info||!info.f||info.f.code!==f.code||info.f.date!==date||(info.f.fr&&info.f.fr!==f.fr))return;var st=b.seats[seg]||{},ks=Object.keys(st).filter(function(k){return k!=='_auto'&&st[k]}),fc=FARES[info.c]||{};
      ks.forEach(function(sid0,i){var sid=in28(sid0);real[sid]=1;if(!blS[sid])return;var px=(b.paxList||[])[i]||{};var auto=!!st._auto,basic=fc.tierEN==='Basic'||fc.freeSeat===0;
        who.push({pnr:b.pnr,seg:seg,seat:sid0,raw:sid,show:sh(f,sid),i:i,name:((px.last||px.lastName||'')+' / '+(px.first||px.firstName||'')).trim()||b.name||b.pnr,fare:info.c,grp:auto?'A':(basic?'B':'C'),paid:auto?0:(basic?share28(b):0)})})})});
    who.sort(function(a,b){return a.grp.localeCompare(b.grp)||String(a.seat).localeCompare(String(b.seat),'en',{numeric:true})});
    /* 前面的空位：先用真正空的，不夠再用模擬旅客坐的（模擬旅客是虛擬的，真實旅客優先）；陣列尾端先用 → 真正空的放在尾端 */
    var nb=ids.filter(function(s){return !bl[s]&&!real[s]}),free=nb.filter(function(s){return sim[s]}).concat(nb.filter(function(s){return !sim[s]}));
    return {f:f,date:date,block:B,blockedSeats:Object.keys(blS),blockedShown:Object.keys(blS).map(function(s){return sh(f,s)}),who:who,free:free,lh:longHaul(f)}}catch(e){return null}};
  /* 非自願座位調整的紀錄＋補償（Payload 平衡、航班資料手動改座位共用）：系統配位只通知；經濟艙基本自己付費選位＝退選位費＋補償；其他自選座位＝補償。
     使用者：「座位調整是非自願才有的補償喔，是透過後台航班資料直接調整」 */
  function rec28(b,seg,fare,code,date,f,from,to,auto,reason,name){var fc=FARES[fare]||{},basic=fc.tierEN==='Basic'||fc.freeSeat===0,grp=auto?'A':(basic?'B':'C'),lh=longHaul(f);
    var comp=grp==='A'?null:{miles:lh?1200:500,usd:lh?30:20,refund:grp==='B'?share28(b):0,choice:'',ts:new Date().toISOString()};
    var log=b.plMoveR1101A=b.plMoveR1101A||[];log.push({seg:seg,code:code,date:date,from:from,to:to,fromShow:sh(f,from),toShow:sh(f,to),grp:grp,name:name||'',reason:reason,by:(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'',comp:comp});
    try{if(comp&&comp.refund>0){b.refundsR1101A=b.refundsR1101A||[];b.refundsR1101A.push({kind:'seat',amount:comp.refund,ts:comp.ts,reason:(reason==='payload'?'Payload 座位調整':'航班作業座位調整')+'・退選位費'})}}catch(_){}
    var why=reason==='payload'?(z()?'季節性載重限制':'a seasonal payload limit'):(z()?'航班作業調整':'an operational change');
    var msg=z()?('您在 '+code+'（'+date+'）的座位因'+why+'由 '+sh(f,from)+' 調整為 '+sh(f,to)+'。'+(comp?('我們'+(comp.refund?'已退還選位費 NT$'+comp.refund.toLocaleString()+'，並':'')+'提供補償，請到「行程管理」二選一：'+comp.miles+' 哩，或 USD '+comp.usd+' 機場抵用券。'):'')):('Your seat on '+code+' ('+date+') was moved from '+sh(f,from)+' to '+sh(f,to)+' due to '+why+'.'+(comp?' Please choose your compensation in Manage Booking: '+comp.miles+' miles or a USD '+comp.usd+' airport voucher.':''));
    try{b.notifs=b.notifs||[];b.notifs.unshift({ts:new Date().toISOString(),msg:msg})}catch(_){}
    try{var em=b.contactEmail||b.email||(b.paxList&&b.paxList[0]&&b.paxList[0].email)||'';if(em&&typeof kgmNotify==='function')kgmNotify('booking.changed',{email:em,pnr:b.pnr,flight:code,date:date,subject:z()?'座位調整通知':'Seat change',message:msg})}catch(_){}
    try{logAct(z()?(reason==='payload'?'Payload 座位調整':'航班資料・非自願座位調整'):'Involuntary seat change',b.pnr+' '+code+' '+date+' '+sh(f,from)+'→'+sh(f,to)+(comp?(z()?'（補償 ':' (comp ')+comp.miles+'／USD'+comp.usd+(comp.refund?'，退 NT$'+comp.refund:'')+(z()?'）':')'):''))}catch(_){}}
  /* 航班資料旅客名單手動改座位（setOpsSeatR7）＝非自願：改之前記下這一班每筆真實訂位的座位，改完比對 */
  (function wrapOps(n){var O=window.setOpsSeatR7;if(typeof O!=='function'){if(n<40)setTimeout(function(){wrapOps(n+1)},500);return}if(O.__r28)return;
    var w=function(key,id,seat){var q=String(key).split('|'),code=q[0],date=q[1],fr=q[2],snap=[];
      try{(S.bookings||[]).forEach(function(b){if(!b||!b.seats||b.status==='cancelled'||sim28(b))return;Object.keys(b.seats).forEach(function(sg){var info=null;try{info=bookingSegInfo0813(b,sg)}catch(_){}
        if(info&&info.f&&info.f.code===code&&info.f.date===date&&(!info.f.fr||info.f.fr===fr))snap.push({b:b,sg:sg,c:info.c,before:JSON.parse(JSON.stringify(b.seats[sg]||{}))})})})}catch(_){}
      var r=O.apply(this,arguments);
      try{var f=legOf(code,date,fr,q[3]);snap.forEach(function(x){var now=x.b.seats[x.sg]||{},bef=x.before;var gone=Object.keys(bef).filter(function(s){return s!=='_auto'&&bef[s]&&!now[s]}),add=Object.keys(now).filter(function(s){return s!=='_auto'&&now[s]&&!bef[s]});
        if(!gone.length||!add.length||!f)return;var nm=typeof now[add[0]]==='string'?now[add[0]]:'';rec28(x.b,x.sg,x.c,code,date,f,gone[0],add[0],!!bef._auto,'ops',nm)});try{save()}catch(_){}}catch(_){}
      return r};
    w.__r28=1;window.setOpsSeatR7=w;try{setOpsSeatR7=w}catch(_){}})(0);
  /* 執行：依序移到前面空位（從空位清單的最後面開始，盡量靠近原本的位子）；B／C 記補償（B 加退選位費），通知旅客 */
  window.kgmPlBalanceRunR1101A=function(code,date,fr,to){var R=window.kgmPlBalanceR1101A(code,date,fr,to);if(!R||!R.who.length)return {moved:0};
    var free=R.free.slice(),moved=0,left=0;
    R.who.forEach(function(w){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===w.pnr})[0];if(!b)return;var to2=free.pop();if(!to2){left++;return}
      var st=b.seats[w.seg],ks=Object.keys(st).filter(function(k){return k!=='_auto'}),n={};ks.forEach(function(k){n[k===w.seat?to2:k]=st[k]});if(st._auto)n._auto=true;b.seats[w.seg]=n;moved++;
      rec28(b,w.seg,w.fare,code,date,R.f,w.seat,to2,w.grp==='A','payload',w.name)});
    try{logAct(z()?'Payload 座位調整':'Payload seat moves',code+' '+date+'：'+moved+(left?(' / 沒有空位 '+left):''))}catch(_){}try{save()}catch(_){}return {moved:moved,left:left}};
  /* 前台：旅客二選一 */
  window.kgmPlCompChooseR1101A=function(pnr,k,choice){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!b||!b.plMoveR1101A)return;var m=b.plMoveR1101A[+k];if(!m||!m.comp||m.comp.choice)return;
    m.comp.choice=choice;m.comp.chosenAt=new Date().toISOString();
    if(choice==='miles'){try{var uid=b.userId||b.uid||b.memberId||(S.user&&S.user.id);if(uid&&typeof creditMiles==='function')creditMiles(uid,m.comp.miles,(z()?'Payload 座位調整補償 ':'Seat-move compensation ')+m.code,m.date)}catch(_){}}
    else{S.vouchersR1101A=S.vouchersR1101A||[];var vno='KGV'+String(Date.now()).slice(-8);S.vouchersR1101A.push({no:vno,pnr:pnr,usd:m.comp.usd,code:m.code,date:m.date,ts:m.comp.chosenAt,used:false});m.comp.voucher=vno}
    try{save()}catch(_){}try{render()}catch(_){}};
  window.kgmPlCompHtmlR1101A=function(b){try{var L=(b&&b.plMoveR1101A)||[];if(!L.length)return '';
    return '<div class="k28pc">'+L.map(function(m,k){var c=m.comp;return '<div class="k28pc-i"><div><b>'+(z()?'座位已調整':'Seat changed')+'・'+E2(m.code)+' '+E2(m.date)+'</b><span>'+E2(m.fromShow||m.from)+' → '+E2(m.toShow||m.to)+(m.reason==='ops'?(z()?'（航班作業調整・非自願）':' (operational change)'):(z()?'（季節性載重限制，後排不開放）':' (seasonal payload limit)'))+'</span>'
      +(c&&c.refund?'<small>'+(z()?'已退還選位費 NT$':'Seat fee refunded NT$')+Number(c.refund).toLocaleString()+'</small>':'')+'</div>'
      +(!c?'':(c.choice?'<em class="ok">'+(c.choice==='miles'?(z()?'已入帳 ':'Credited ')+c.miles+(z()?' 哩':' miles'):(z()?'機場抵用券 USD ':'Airport voucher USD ')+c.usd+' · '+E2(c.voucher||''))+'</em>'
        :'<div class="k28pc-b"><button type="button" onclick="kgmPlCompChooseR1101A(\''+E2(b.pnr)+'\','+k+',\'miles\')">'+c.miles+(z()?' 哩':' miles')+'</button><button type="button" onclick="kgmPlCompChooseR1101A(\''+E2(b.pnr)+'\','+k+',\'voucher\')">USD '+c.usd+(z()?' 機場抵用券':' voucher')+'</button></div>'))+'</div>'}).join('')+'</div>'}catch(_){return ''}};
  /* 後台航班資料：載重平衡區塊最上面 */
  function panel(){try{if(!(S.view==='admin'&&S.adminTab==='flightdata'))return;var p=String(S.opsSelectedR7||'').split('|');if(p.length<4)return;
    var host=document.querySelector('[data-k23fd="lb"]');if(!host)return;var R=window.kgmPlBalanceR1101A(p[0],p[1],p[2],p[3]);if(!R)return;
    var sig=p.join('|')+'|'+R.block.rows+'|'+R.who.map(function(w){return w.pnr+w.raw}).join(',')+'|'+(z()?'z':'e'),el=host.querySelector(':scope > .k28bal');if(el&&el.getAttribute('data-sig')===sig)return;
    var rows=R.block.rows?(function(){var nums=R.blockedShown.map(function(s){return parseInt(s,10)}).filter(function(n){return !isNaN(n)}).sort(function(a,b){return a-b});return nums.length?nums[0]+'–'+nums[nums.length-1]:''})():'';
    var G={A:z()?'A 系統配位':'A System-assigned',B:z()?'B 經濟基本・付費選位':'B Basic · paid seat',C:z()?'C 自選座位':'C Chosen seat'};
    var h='<header><div><small>PAYLOAD · SEAT BALANCE</small><h3>'+(z()?'載重平衡・Payload 鎖後排':'Payload rear-row lock')+'</h3></div><span>'+(R.block.rows?((z()?'少賣 ':'Blocked ')+R.block.seats+(z()?' 席 → 鎖最後 ':' seats → last ')+R.block.rows+(z()?' 排（第 ':' rows (')+rows+(z()?' 排）':')')):(z()?'這一班這一天沒有 Payload 限座':'No payload limit on this flight/date'))+'</span></header>';
    if(R.block.rows)h+=R.who.length?('<p class="k28bal-sum">'+(z()?'建議調整 <b>'+R.who.length+'</b> 席：鎖住的排裡還有真實旅客。依序先移系統配位的，再移經濟艙基本（退選位費＋補償），最後其他自選座位（補償）；前面可用空位 '+R.free.length+' 席。':'Move <b>'+R.who.length+'</b> passengers forward; '+R.free.length+' free seats.')+'</p>'
      +'<table><thead><tr><th>'+(z()?'順序':'Order')+'</th><th>PNR</th><th>'+(z()?'旅客':'Passenger')+'</th><th>'+(z()?'座位':'Seat')+'</th><th>'+(z()?'艙等代號':'Fare')+'</th><th>'+(z()?'退費／補償':'Refund / comp.')+'</th></tr></thead><tbody>'
      +R.who.map(function(w){return '<tr><td><span class="g g'+w.grp+'">'+G[w.grp]+'</span></td><td class="m">'+E2(w.pnr)+'</td><td>'+E2(w.name)+'</td><td class="m">'+E2(w.show)+'</td><td class="m">'+E2(w.fare)+'</td><td>'+(w.grp==='A'?'—':((w.grp==='B'&&w.paid?(z()?'退 NT$':'Refund NT$')+w.paid.toLocaleString()+' ＋ ':'')+(z()?'補償 ':'Comp. ')+(R.lh?'1,200 哩／USD 30':'500 哩／USD 20')))+'</td></tr>'}).join('')+'</tbody></table>'
      +'<div class="k28bal-act"><button type="button" onclick="(function(){var r=kgmPlBalanceRunR1101A(\''+E2(p[0])+'\',\''+E2(p[1])+'\',\''+E2(p[2])+'\',\''+E2(p[3])+'\');alert('+(z()?'\'已調整 \'+r.moved+\' 位\'+(r.left?\'，沒有空位 \'+r.left+\' 位（請考慮徵求自願改班）\':\'\')':'\'Moved \'+r.moved')+');render()})()">'+(z()?'執行調整並通知旅客':'Move and notify')+'</button></div>')
      :('<p class="k28bal-ok">✓ '+(z()?'鎖住的排沒有旅客；自動劃位與模擬旅客都不會排進去。':'No passengers in locked rows.')+'</p>');
    var d=document.createElement('section');d.className='k28bal';d.setAttribute('data-sig',sig);d.innerHTML=h;if(el)el.replaceWith(d);else host.insertBefore(d,host.firstChild)}catch(e){}}
  setInterval(panel,900);
  /* 前台行程管理：座位調整的補償二選一卡片（插在頁首大標題下面） */
  function front(){try{if(S.view!=='manage'||!S.mgResult)return;var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===S.mgResult.pnr})[0]||S.mgResult;
    var app=document.getElementById('app');if(!app)return;var ex=app.querySelector('.k28pc-host'),html=window.kgmPlCompHtmlR1101A(b);
    if(!html){if(ex)ex.remove();return}if(ex){if(ex.getAttribute('data-h')!==String(html.length)+html.slice(-80)){ex.innerHTML=html;ex.setAttribute('data-h',String(html.length)+html.slice(-80))}return}
    var hero=[].slice.call(app.querySelectorAll('div,section')).filter(function(e){return /^\s*MANAGE MY BOOKING/i.test(e.textContent||'')&&e.offsetHeight>80&&e.offsetHeight<600})[0];if(!hero)return;
    var d=document.createElement('div');d.className='k28pc-host';d.style.cssText='max-width:'+(hero.offsetWidth||1080)+'px;margin:12px auto 0';d.innerHTML=html;d.setAttribute('data-h',String(html.length)+html.slice(-80));hero.parentNode.insertBefore(d,hero.nextSibling)}catch(_){}}
  if(typeof render==='function'){var rd28=render;render=window.render=function(){var r=rd28.apply(this,arguments);try{front()}catch(_){}setTimeout(front,120);return r}}
  try{var cs=document.createElement('style');cs.id='k28bal-css';cs.textContent=
    '.k28bal{border:1px solid #E3DAC3;background:#FFFCF4;border-radius:14px;padding:16px 18px;margin:0 0 16px}.k28bal header{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-end}.k28bal small{font:700 10.5px system-ui,sans-serif;letter-spacing:.14em;color:#9A7B2F}.k28bal h3{margin:2px 0 0;font-size:17px;color:#0F2A21}.k28bal header>span{font-size:12.5px;color:#6B5A2E}'
   +'.k28bal-sum{margin:10px 0;font-size:13px;color:#33443C}.k28bal-ok{margin:10px 0 0;color:#1d6b45;font-weight:600;font-size:13px}.k28bal table{width:100%;border-collapse:collapse;font-size:12.5px}.k28bal th{text-align:left;font:700 11px system-ui,sans-serif;color:#7A6A40;padding:6px 8px;border-bottom:1px solid #E3DAC3}.k28bal td{padding:7px 8px;border-bottom:1px solid #F0E9D6}.k28bal td.m{font-family:ui-monospace,monospace}'
   +'.k28bal .g{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700}.k28bal .gA{background:#E5F1EC;color:#0B3D2E}.k28bal .gB{background:#FCE9E7;color:#9A3A2F}.k28bal .gC{background:#F1ECFB;color:#4B3A8A}'
   +'.k28bal-act{margin-top:12px;text-align:right}.k28bal-act button{border:0;background:#0B3D2E;color:#fff;border-radius:999px;padding:10px 20px;font:700 13px system-ui,sans-serif;cursor:pointer}'
   +'.k28pc{display:flex;flex-direction:column;gap:8px;margin:12px 0}.k28pc-i{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border:1px solid #E3DAC3;background:#FFFCF4;border-radius:12px;padding:12px 14px}.k28pc-i b{display:block;color:#0F2A21;font-size:13.5px}.k28pc-i span{font-size:12.5px;color:#55605B}.k28pc-i small{display:block;color:#1d6b45;font-size:12px;margin-top:2px}'
   +'.k28pc-b{display:flex;gap:8px}.k28pc-b button{border:1px solid #0B3D2E;background:#fff;color:#0B3D2E;border-radius:999px;padding:8px 14px;font:700 12.5px system-ui,sans-serif;cursor:pointer}.k28pc-b button:hover{background:#0B3D2E;color:#fff}.k28pc-i em.ok{font-style:normal;color:#1d6b45;font-weight:700;font-size:12.5px}';
    document.head.appendChild(cs)}catch(_){}
})();
