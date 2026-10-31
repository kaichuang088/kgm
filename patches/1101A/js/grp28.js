
/* ══ 1101A：團體訂位（使用者 Round 1～2）════════════════════════════════════════════
   ① 進團體訂位前先開小視窗：優惠（Q）／彈性（U）兩方案比較表，選一個；再選「現有航班／包機／自創航班」（包機、自創航班走 1026C 的申請頁）。
      選好的方案寫在 S.search.grpPlanR1101A，之後搜尋、去回程都只賣這個方案（去程回程同方案）。
   ② 去程選好、要選回程前：回程那天哪些班沒有這個方案（或座位不夠整團）→ 先用表格列出來，確認才往下。
   ③ 整團要坐得下才賣（原本 sell54 只看有沒有 1 位，KX180 剩 6 席時票價卡還能按，標題卻寫售罄）。
   ④ 團體資料頁：會員欄位鎖定（lockMember49）不套用到團體表單（原本團名、領隊都打不進去）；團名自動帶入（公司＋航線＋日期），可改。
   ⑤ 選位費：優惠方案經濟艙選位一次收每位 NT$750（彈性免費）；豪華經濟艙選位 優惠每位 NT$2,000、彈性每位 NT$1,500（整團劃位時加進尾款）。
   ⑥ 名單：每位可填 KGM 會員卡號（選填），開票後那位旅客的里程進他自己的帳號；沒填的進訂購者帳號（原本就是）。
   ⑦ 訂位時已在尾款期限內（優惠 21 天、彈性 7 天）→ 當下付清，名單也要當下填完（不能 TBA）。
   ⑧ 團體不賣頭等艙：搜尋艙等選單拿掉頭等。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function on(){try{return !!(window.kgmGrpOnR1025B&&window.kgmGrpOnR1025B())}catch(_){return false}}
  function P(){return window.KGM_GRP_PLANS_R1026C||{}}
  function M(n){return 'NT$'+Math.round(+n||0).toLocaleString()}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  var SEATFEE={Q:{Economy:750,Premium:2000},U:{Economy:0,Premium:1500}};window.KGM_GRP_SEATFEE_R1101A=SEATFEE;
  /* ① 前置視窗 */
  var m0=window.kgmGrpModeR1025B;
  if(typeof m0==='function'&&!m0.__r28){var m28=function(v){var r=m0.apply(this,arguments);try{if(v&&on()){S.search.grpPlanR1101A=S.search.grpPlanR1101A||'';if(!S.search.grpPlanR1101A){S.grp28Pre=true;render()}}else if(!v){S.grp28Pre=false;if(S.search)S.search.grpPlanR1101A=''}}catch(_){}return r};m28.__r28=1;window.kgmGrpModeR1025B=m28}
  window.kgmGrpPickR1101A=function(k,how){var zh=z();if(how==='charter'||how==='custom'){S.grp28Pre=false;S.search.grpPlanR1101A=k||'U';
      S.view='group23';if(window.kgmCharterOpenR1026C){try{window.kgmCharterOpenR1026C(how)}catch(_){}}try{render()}catch(_){}return}
    S.search.grpPlanR1101A=k;S.grp28Pre=false;S.openFare=null;try{render()}catch(_){}};
  function preModal(){var zh=z(),p=P(),Q=p.Q||{},U=p.U||{};
    var row=function(l,a,b){return '<tr><th>'+l+'</th><td>'+a+'</td><td>'+b+'</td></tr>'};
    return '<div class="k28g-mask"><div class="k28g-dlg" role="dialog" aria-modal="true"><header><div><small>GROUP BOOKING</small><h3>'+(zh?'選擇團體方案':'Choose a group plan')+'</h3><p>'+(zh?'去程、回程用同一個方案；確認後才進入訂位。':'Outbound and return use the same plan.')+'</p></div><button type="button" class="x" onclick="kgmGrpModeR1025B(0)" aria-label="close">×</button></header>'
      +'<table class="k28g-cmp"><thead><tr><th></th><th>'+(zh?'團體優惠 Group Saver（Q）':'Group Saver (Q)')+'</th><th>'+(zh?'團體彈性 Group Flex（U）':'Group Flex (U)')+'</th></tr></thead><tbody>'
      +row(zh?'票價':'Fare',(zh?'一般最低價 × ':'Lowest fare × ')+Math.round((Q.mul||0.93)*100)+'%',(zh?'一般最低價 × ':'Lowest fare × ')+Math.round((U.mul||1.08)*100)+'%')
      +row(zh?'改票／退票（每人）':'Change / refund',M(Q.chg)+' ／ '+M(Q.ref),M(U.chg)+' ／ '+M(U.ref))
      +row(zh?'名單期限':'Names due',(zh?'出發前 ':'')+Q.names+(zh?' 天':' days before'),(zh?'出發前 ':'')+U.names+(zh?' 天':' days before'))
      +row(zh?'尾款期限':'Balance due',(zh?'出發前 ':'')+Q.bal+(zh?' 天（之內訂位當下付清＋填名單）':' days'),(zh?'出發前 ':'')+U.bal+(zh?' 天（之內訂位當下付清＋填名單）':' days'))
      +row(zh?'免手續費增減':'Free changes in size','±'+Q.free,'±'+U.free)
      +row(zh?'經濟艙選位':'Economy seats',(zh?'一次收每位 NT$750（可整團一次劃位）':'NT$750 per person, once'),(zh?'免費（隨時；可整團一次劃位）':'Free'))
      +row(zh?'豪華經濟艙選位':'Premium Economy seats',(zh?'每位 NT$2,000':'NT$2,000 pp'),(zh?'每位 NT$1,500':'NT$1,500 pp'))
      +row(zh?'哩程升等':'Mileage upgrade',zh?'不可':'No',zh?'可（依「超值」規則）':'Yes')
      +row(zh?'艙等':'Cabins',zh?'經濟、豪經、商務（不含頭等）':'Economy, Premium, Business',zh?'經濟、豪經、商務（不含頭等）':'Economy, Premium, Business')
      +'</tbody></table>'
      +'<div class="k28g-how"><div><b>'+(zh?'現有航班':'Scheduled flights')+'</b><span>'+(zh?'在時刻表上的航班訂團體票':'Book seats on scheduled flights')+'</span><div class="b"><button type="button" onclick="kgmGrpPickR1101A(\'Q\')">'+(zh?'選團體優惠':'Saver')+'</button><button type="button" class="g" onclick="kgmGrpPickR1101A(\'U\')">'+(zh?'選團體彈性':'Flex')+'</button></div></div>'
      +'<div><b>'+(zh?'包機':'Charter')+'</b><span>'+(zh?'整架包下現有航班；起飛前 6 個月申請，機型不能更換':'Whole aircraft on a scheduled flight')+'</span><div class="b"><button type="button" onclick="kgmGrpPickR1101A(\'U\',\'charter\')">'+(zh?'申請包機':'Request charter')+'</button></div></div>'
      +'<div><b>'+(zh?'自創航班':'Custom flight')+'</b><span>'+(zh?'自訂航線與日期（包機進階版）；填需要人數，起飛前 3 個月申請，可申請換大機型':'Your own route and date')+'</span><div class="b"><button type="button" onclick="kgmGrpPickR1101A(\'U\',\'custom\')">'+(zh?'申請自創航班':'Request custom flight')+'</button></div></div></div>'
      +'</div></div>'}
  /* 方案限制：團體模式只留選好的方案代號 */
  function vc(){var O=window.validCodes;if(typeof O!=='function'||O.__r28)return;var w=function(){var r=O.apply(this,arguments)||[];try{var k=on()&&S.search&&S.search.grpPlanR1101A;if(k){var f=r.filter(function(c){var x=(FARES[c]||{}).groupPlanR1026C;return !x||x===k});return f}}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28=1;window.validCodes=w;try{validCodes=w}catch(_){}}
  function cc(){var O=window.CAB_CODES;if(typeof O!=='function'||O.__r28)return;var w=function(){var r=O.apply(this,arguments)||[];try{var k=on()&&S.search&&S.search.grpPlanR1101A;if(k)return r.filter(function(c){var x=(FARES[c]||{}).groupPlanR1026C;return !x||x===k})}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28=1;window.CAB_CODES=w;try{CAB_CODES=w}catch(_){}}
  [0,200,3500,13000].forEach(function(t){setTimeout(function(){vc();cc()},t)});
  /* ③ 整團要坐得下 */
  function sw(){var O=window.kgmGrpSellR1025B;if(typeof O!=='function'||O.__r28)return;var w=function(code,date,flight){var r=O.apply(this,arguments);try{if(r>0&&on()){var need=(passengerCounts()||{}).seats||0;if(need&&r<need)return 0}}catch(_){}return r};w.__r28=1;window.kgmGrpSellR1025B=w}
  sw();setTimeout(sw,0);setTimeout(sw,4000);
  /* ② 回程沒有這個方案的班 → 表格提示 */
  function retWarn(){try{if(!on()||S.search.type!=='RT'||S.phase!=='sel_inb'||!S.outC||!S.search.ret)return;var k=S.search.grpPlanR1101A||((FARES[S.outC]||{}).groupPlanR1026C)||'U',cab=(FARES[S.outC]||{}).cabin||'Economy',sig=[S.outF&&S.outF.code,S.search.ret,k,cab,S.search.adults,S.search.children].join('|');
      if(S.grp28RetSig===sig)return;S.grp28RetSig=sig;var code=window.kgmGrpCodeR1025B?window.kgmGrpCodeR1025B(cab,k):null;if(!code)return;var D=S.search.ret,need=(passengerCounts()||{}).seats||0,rows=[];
      [].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){if(!f||f.via||f.fr!==S.search.to||f.to!==S.search.fr)return;try{if(!flyOn(f,new Date(D+'T12:00:00')))return}catch(_){return}
        var sf=Object.assign({},f,(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,D))||{},{date:D}),n=0;try{n=window.kgmInventory49(code,D,sf)}catch(_){n=0}
        if(!(n>=need))rows.push({code:f.code,dep:sf.dep,arr:sf.arr,dd:sf.dd,n:Math.max(0,n||0)})});
      if(rows.length){S.grp28RetWarn={k:k,cab:cab,D:D,need:need,rows:rows.sort(function(a,b){return String(a.dep).localeCompare(String(b.dep))})};try{render()}catch(_){}}}catch(_){}}
  function retModal(){var w=S.grp28RetWarn;if(!w)return '';var zh=z(),pl=(P()[w.k]||{});
    return '<div class="k28g-mask"><div class="k28g-dlg sm"><header><div><small>RETURN · '+E(w.D)+'</small><h3>'+(zh?'回程這些航班沒有「'+(pl.zh||w.k)+'」':'No '+(pl.en||w.k)+' on these return flights')+'</h3><p>'+(zh?'去程、回程要用同一個方案；下表的班次這個方案已售完或座位不夠整團 '+w.need+' 位，只能選其他班次。是否確認訂購這個方案？':'Same plan both ways; these flights cannot take the group.')+'</p></div></header>'
      +'<table class="k28g-cmp"><thead><tr><th>'+(zh?'航班':'Flight')+'</th><th>'+(zh?'起飛':'Dep')+'</th><th>'+(zh?'抵達':'Arr')+'</th><th>'+(zh?'這個方案還能賣':'Available')+'</th></tr></thead><tbody>'
      +w.rows.map(function(r){return '<tr><th>'+E(r.code)+'</th><td>'+E(r.dep)+'</td><td>'+E(r.arr)+((+r.dd)?'<sup>+'+r.dd+'</sup>':'')+'</td><td>'+(r.n?r.n+(zh?' 席（不足 ':' (need ')+w.need+')':(zh?'售完':'Sold out'))+'</td></tr>'}).join('')+'</tbody></table>'
      +'<div class="k28g-acts"><button type="button" onclick="S.grp28RetWarn=null;S.phase=\'sel_out\';S.outC=null;render()">'+(zh?'回去重選去程方案':'Change outbound')+'</button><button type="button" class="g" onclick="S.grp28RetWarn=null;render()">'+(zh?'確認，用這個方案選回程':'Continue')+'</button></div></div></div>'}
  /* ④ 團名自動帶入；會員欄位鎖定不套用到團體表單（lockMember49 的 RW 在 gen_r28） */
  function autoName(){try{if(!on()||S.phase!=='pax')return;var d=S.grpDraftR1025B=S.grpDraftR1025B||{};if(d.nameAutoR1101A||String(d.name||'').trim())return;
    var a=(S.user&&((S.users||[]).filter(function(u){return u&&u.id===S.user.id})[0]||S.user).groupAccountR1025B)||{},f=S.outF||{},dt=String(f.date||S.search.dep||'');
    d.name=String((a.company||'')+' '+(S.search.fr||'')+'-'+(S.search.to||'')+' '+dt.slice(5).replace('-','/')+(z()?' 團':' Group')).trim();d.nameAutoR1101A=1;
    if(!d.leader&&a.contact&&a.contact.name){d.leader=a.contact.name;d.leaderPhone=d.leaderPhone||a.contact.phone||''}}catch(_){}}
  /* ⑤ 選位費 */
  function seatFee(id){try{var g=(S.groupsR1023A||[]).filter(function(x){return x&&x.id===id})[0];if(!g||g.seatFeeR1101A)return null;
      var k=g.plan||'U',cab=g.cabin||'Economy',per=((SEATFEE[k]||{})[cab])||0;if(!per)return {g:g,per:0};return {g:g,per:per,amount:per*g.pax}}catch(_){return null}}
  function aw(){var O=window.kgmGrpAutoSeatR1025B;if(typeof O!=='function'||O.__r28)return;var w=function(id){var sf=seatFee(id),zh=z();
      if(sf&&sf.per){if(!confirm(zh?('整團劃位要收選位費：'+({Economy:'經濟艙',Premium:'豪華經濟艙'}[sf.g.cabin]||'')+'每位 '+M(sf.per)+' × '+sf.g.pax+' 位 = '+M(sf.amount)+'（一次性，加進尾款）。確定劃位？'):('Seat fee '+M(sf.amount)+' will be added to the balance. Continue?')))return}
      var r=O.apply(this,arguments);
      try{if(sf&&sf.per&&sf.g.seatsAt){var g=sf.g,b=(S.bookings||[]).filter(function(x){return x&&x.pnr===g.pnr})[0];g.fees=g.fees||[];g.fees.push({at:new Date().toISOString(),kind:'seat',n:g.pax,unit:sf.per,amount:sf.amount,why:zh?'團體選位費':'Group seat fee'});g.feeTotal=(g.feeTotal||0)+sf.amount;g.seatFeeR1101A={per:sf.per,amount:sf.amount,at:new Date().toISOString()};
        (g.history=g.history||[]).push({at:new Date().toISOString(),act:'選位費 '+M(sf.amount)+'（每位 '+M(sf.per)+'）',by:'customer'});if(window.kgmGrpRebalR1101A)window.kgmGrpRebalR1101A(g,b,zh?'選位費':'seat fee');try{save()}catch(_){}try{render()}catch(_){}}}catch(_){}
      return r};w.__r28=1;window.kgmGrpAutoSeatR1025B=w}
  aw();setTimeout(aw,0);setTimeout(aw,4000);
  /* ⑥ 名單的 KGM 會員卡號：存名單時一起讀；開票後拆出的每位訂位改掛到該會員（里程進他的帳號） */
  function nw(){var O=window.kgmGrpNamesR1025B;if(typeof O!=='function'||O.__r28)return;var w=function(id){var mem=[],bad=[];for(var i=0;i<200;i++){var e=document.getElementById('k25gNM'+i);if(!e)break;var v=String(e.value||'').trim().toUpperCase();mem.push(v);
        if(v&&!(S.users||[]).some(function(u){return u&&(String(u.id).toUpperCase()===v||String(u.memberId||'').toUpperCase()===v)}))bad.push((i+1)+(z()?'：查無會員卡號 ':': unknown member ')+v)}
      if(bad.length){S.grpMsgR1025B=bad.slice(0,6).join('　');try{render()}catch(_){}return}
      var r=O.apply(this,arguments);try{var g=(S.groupsR1023A||[]).filter(function(x){return x&&x.id===id})[0];if(g&&g.names){g.names.forEach(function(n,i){if(n)n.member=mem[i]||''});memberFix();try{save()}catch(_){}}}catch(_){}return r};w.__r28=1;window.kgmGrpNamesR1025B=w}
  nw();setTimeout(nw,0);setTimeout(nw,4000);
  function memberFix(){try{var L=(S.groupsR1023A||[]);var ch=0;
      (S.bookings||[]).forEach(function(b){var gr=b&&b.groupR1025B;if(!gr||b.memberFixR1101A||gr.cabinMove)return;var g=L.filter(function(x){return x&&x.id===gr.id})[0];if(!g||g.status!=='ticketed')return;var n=(g.names||[])[gr.index]||{},v=String(n.member||'').toUpperCase();
        if(v){var u=(S.users||[]).filter(function(u){return u&&(String(u.id).toUpperCase()===v||String(u.memberId||'').toUpperCase()===v)})[0];if(u){b.purchaserR1101A=b.userId;b.userId=u.id;if(b.paxList&&b.paxList[0])b.paxList[0].kgmId=u.id}}
        b.memberFixR1101A=1;ch++});if(ch)try{save()}catch(_){}}catch(_){}}
  setInterval(memberFix,30000);setTimeout(memberFix,15000);
  /* ⑦ 已在尾款期限內 → 名單當下填完 */
  function late(){try{var k=S.search.grpPlanR1101A||((FARES[S.outC]||{}).groupPlanR1026C)||'U',pl=P()[k]||{},d0=(S.outF&&S.outF.date)||S.search.dep;return Math.round((Date.parse(d0)-Date.parse(T()))/864e5)<=(+pl.bal||0)}catch(_){return false}}
  function namesForm(){var zh=z(),p=passengerCounts(),d=S.grpDraftR1025B=S.grpDraftR1025B||{};d.namesR1101A=d.namesR1101A||[];var rows='';
    for(var i=0;i<p.seats+p.infants;i++){var r=d.namesR1101A[i]||{},ty=i<p.adults?'ADT':(i<p.seats?'CHD':'INF');
      rows+='<tr><td>'+(i+1)+'<small>'+ty+'</small></td><td><input class="inp" value="'+E(r.last||'')+'" placeholder="WANG" oninput="kgmGrpNmR1101A('+i+',\'last\',this.value)"></td><td><input class="inp" value="'+E(r.first||'')+'" placeholder="DAMING" oninput="kgmGrpNmR1101A('+i+',\'first\',this.value)"></td><td><input class="inp" value="'+E(r.member||'')+'" placeholder="'+(zh?'選填':'optional')+'" oninput="kgmGrpNmR1101A('+i+',\'member\',this.value)"></td></tr>'}
    return '<div class="k28g-names"><b>'+(zh?'出發前 '+(P()[S.search.grpPlanR1101A||'U']||{}).bal+' 天內訂位：要當下付清並填好全部旅客姓名':'Within the balance window: pay in full and give all names now')+'</b><table><thead><tr><th>#</th><th>'+(zh?'姓 Last':'Last')+'</th><th>'+(zh?'名 First':'First')+'</th><th>'+(zh?'KGM 會員卡號（選填，里程進該會員；不填進訂購者）':'KGM member no. (optional)')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'}
  window.kgmGrpNmR1101A=function(i,k,v){var d=S.grpDraftR1025B=S.grpDraftR1025B||{};d.namesR1101A=d.namesR1101A||[];d.namesR1101A[i]=d.namesR1101A[i]||{};d.namesR1101A[i][k]=k==='member'?String(v).trim().toUpperCase():String(v).toUpperCase().replace(/[^A-Z\- ]/g,'')};
  var px0=window.kgmGrpPaxNextR1025B;
  if(typeof px0==='function'&&!px0.__r28){var px28=function(){try{if(on()&&late()){var p=passengerCounts(),d=S.grpDraftR1025B||{},L=d.namesR1101A||[],miss=[];for(var i=0;i<p.seats+p.infants;i++){var r=L[i]||{};if(!r.last||!r.first)miss.push(i+1)}
        if(miss.length){alert(z()?('尾款期限內訂位要先填好全部旅客姓名：第 '+miss.slice(0,10).join('、')+' 位還沒填。'):'Please enter all names.');return}}}catch(_){}
      var r=px0.apply(this,arguments);
      try{if(on()&&late()&&S.paxList){var L2=(S.grpDraftR1025B||{}).namesR1101A||[];S.paxList.forEach(function(p,i){var n=L2[i];if(n&&n.last&&n.first){p.lastName=n.last;p.firstName=n.first;p.groupNameTbaR1023A=false;if(n.member)p.kgmMemberR1101A=n.member}})}}catch(_){}return r};
    px28.__r28=1;window.kgmGrpPaxNextR1025B=px28}
  /* 畫面：前置視窗、回程提示、團體資料頁加名單表、搜尋艙等選單拿掉頭等 */
  try{var r0=window.render;if(typeof r0==='function'&&!r0.__grp28){var w=function(){autoName();var r=r0.apply(this,arguments);try{decorate()}catch(_){}return r};w.__grp28=1;window.render=w;try{render=w}catch(_){}}}catch(_){}
  function decorate(){var host=document.getElementById('k28g-host');if(!host){host=document.createElement('div');host.id='k28g-host';document.body.appendChild(host)}
    retWarn();var h='';if(on()&&S.grp28Pre&&S.view!=='admin')h=preModal();else if(on()&&S.grp28RetWarn)h=retModal();if(host.__h!==h){host.innerHTML=h;host.__h=h}
    if(on()&&S.view==='booking'&&S.phase==='pax'&&late()){var pg=document.querySelector('.k25g-pax');if(pg&&!pg.querySelector('.k28g-names')){var act=pg.querySelector('.k25g-act');var d=document.createElement('div');d.innerHTML=namesForm();if(act)pg.insertBefore(d.firstChild,act);else pg.appendChild(d.firstChild)}}
    if(on()){[].forEach.call(document.querySelectorAll('#app select option[value="First"]'),function(o){o.disabled=true;o.hidden=true});if(S.search&&S.search.cabin==='First')S.search.cabin='Business'}}
  setInterval(function(){try{if(on()&&(S.grp28Pre||S.grp28RetWarn||S.phase==='pax'))decorate()}catch(_){}},1200);
  /* ⑥ 名單頁多一欄 KGM 會員卡號（namesEd 的 RW 在 gen_r28） */
  try{var cs=document.createElement('style');cs.id='k28g-css';cs.textContent=
    '.k28g-mask{position:fixed;inset:0;z-index:9000;background:rgba(10,30,24,.45);display:flex;align-items:center;justify-content:center;padding:16px}'
   +'.k28g-dlg{background:#fff;border-radius:20px;max-width:920px;width:100%;max-height:92vh;overflow:auto;padding:24px 28px;box-shadow:0 30px 80px -30px rgba(0,0,0,.5)}.k28g-dlg.sm{max-width:680px}'
   +'.k28g-dlg header{display:flex;justify-content:space-between;gap:16px;margin-bottom:14px}.k28g-dlg header small{font:800 10.5px system-ui,sans-serif;letter-spacing:.2em;color:#B08A3E}.k28g-dlg h3{font:700 24px Georgia,"Noto Serif TC",serif;color:#0B3D2E;margin:4px 0}.k28g-dlg header p{margin:0;font-size:13px;color:#6B7570}'
   +'.k28g-dlg .x{border:0;background:#F1F4F2;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer;flex:0 0 auto}'
   +'.k28g-cmp{width:100%;border-collapse:collapse;font-size:13px;margin:4px 0 16px}.k28g-cmp th,.k28g-cmp td{padding:9px 12px;border-bottom:1px solid #EEF1EF;text-align:left;vertical-align:top}.k28g-cmp thead th{background:#0B3D2E;color:#fff;font-weight:700}.k28g-cmp thead th:first-child{background:#fff}.k28g-cmp tbody th{color:#55605B;font-weight:600;white-space:nowrap;width:150px}.k28g-cmp sup{color:#B08A3E}'
   +'.k28g-how{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:12px}.k28g-how>div{border:1px solid #E1E8E4;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:6px}.k28g-how b{color:#0B3D2E;font-size:15px}.k28g-how span{font-size:12px;color:#6B7570;line-height:1.6;flex:1}'
   +'.k28g-how .b{display:flex;gap:8px;flex-wrap:wrap}.k28g-how button,.k28g-acts button{border:1px solid #0B3D2E;background:#fff;color:#0B3D2E;border-radius:999px;padding:9px 16px;font:700 13px inherit;font-family:inherit;cursor:pointer}.k28g-how button.g,.k28g-acts button.g{background:#0B3D2E;color:#fff}'
   +'.k28g-acts{display:flex;justify-content:flex-end;gap:10px}'
   +'.k28g-names{margin:14px 0;border:1px solid #F0D9B0;background:#FFFBF2;border-radius:14px;padding:12px 14px}.k28g-names>b{display:block;color:#7A5A12;margin-bottom:8px;font-size:13.5px}.k28g-names table{width:100%;border-collapse:collapse;font-size:12.5px}.k28g-names th{text-align:left;color:#7A857F;font-weight:700;padding:4px 6px}.k28g-names td{padding:3px 6px}.k28g-names td small{margin-left:4px;color:#9AA49F}.k28g-names .inp{height:32px}'
   +'@media(max-width:760px){.k28g-how{grid-template-columns:1fr}.k28g-dlg{padding:18px}}';
    document.head.appendChild(cs)}catch(_){}
})();
