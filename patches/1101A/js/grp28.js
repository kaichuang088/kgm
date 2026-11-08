
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
  var SEATFEE={Q:{Economy:750,Premium:2000},U:{Economy:0,Premium:1500},G:{Economy:750,Premium:2000}};   /* 1103A：團體票 G 同優惠方案 */window.KGM_GRP_SEATFEE_R1101A=SEATFEE;
  /* ① 前置視窗 */
  var m0=window.kgmGrpModeR1025B;
  if(typeof m0==='function'&&!m0.__r28){var m28=function(v){var r=m0.apply(this,arguments);try{if(v&&on()){S.search.grpPlanR1101A='';S.grp28Pre=false}else if(!v){S.grp28Pre=false;if(S.search)S.search.grpPlanR1101A=''}   /* 1101B：切到團體不再先跳視窗，改成每次按「搜尋航班」才跳（下面 nav 包裝） */}catch(_){}return r};m28.__r28=1;window.kgmGrpModeR1025B=m28}
  window.kgmGrpPickR1101A=function(k,how){var zh=z();if(how==='charter'||how==='custom'){S.grp28Pre=false;S.search.grpPlanR1101A=k||'U';
      S.view='group23';S.grpViewR1023A=null;   /* 1108A G3：之前停在某一團的明細頁 → 申請表不會出現（使用者：「會跳到我的團體頁面，但問題是我不能加入新訂單」） */if(window.kgmCharterOpenR1026C){try{window.kgmCharterOpenR1026C(how)}catch(_){}}try{render()}catch(_){}return}
    S.search.grpPlanR1101A=k;S.grp28Pre=false;S.openFare=null;
    if(S.grp28PendingNav){S.grp28PendingNav=0;window.__grp28go=1;try{nav('booking')}finally{window.__grp28go=0}return}
    try{render()}catch(_){}};
  function preModal(){var zh=z(),p=P(),Q=p.G||p.Q||{},U=p.U||{};
    var row=function(l,a,b){return '<tr><th>'+l+'</th><td>'+a+'</td><td>'+b+'</td></tr>'};
    return '<div class="k28g-mask"><div class="k28g-dlg" role="dialog" aria-modal="true"><header><div><small>GROUP BOOKING</small><h3>'+(zh?'團體票（G 艙）':'Group fare (G)')+'</h3><p>'+(zh?'團體只有一種票：G 艙。先看規則，再選要訂現有航班、包機或自創航班。':'One group fare. Review the rules, then choose how to fly.')+'</p></div><button type="button" class="x" onclick="S.grp28Pre=false;S.grp28PendingNav=0;render()" aria-label="close">×</button></header>'
      /* 1103A：團體票只剩 G 艙一種（使用者：「團體票改成只有 G Class…退改辦法統一」；可混艙、規則一致）——內部沿用優惠方案 Q 的票價與期限 */
      +'<div class="k31g-card"><div class="k31g-badge"><b>G</b><span>'+(zh?'團體票':'GROUP')+'</span></div><div class="k31g-body"><h4>'+(zh?'團體票（G 艙）—— 經濟、豪經、商務可混艙，退改規則全團一致':'Group fare (G) — mixed cabins, one set of rules')+'</h4>'
      +'<ul class="k31g-rules">'
        +'<li><b>'+(zh?'人數':'Size')+'</b><span>'+(zh?'10–99 位，去程、回程全團同一航班（團進團出）':'10–99, the whole group on the same flights')+'</span></li>'
        +'<li><b>'+(zh?'訂金':'Deposit')+'</b><span>'+(zh?'總票價 10%，訂位後付清；不退':'10% on booking, non-refundable')+'</span></li>'
        +'<li><b>'+(zh?'名單':'Names')+'</b><span>'+(zh?'出發前 '+Q.names+' 天交齊；之前可免費改名':Q.names+' days before departure')+'</span></li>'
        +'<li><b>'+(zh?'尾款・開票':'Balance & ticketing')+'</b><span>'+(zh?'出發前 '+Q.bal+' 天付清並開票（'+Q.bal+' 天內訂位：當下付清＋填名單）':Q.bal+' days before departure')+'</span></li>'
        +'<li><b>'+(zh?'增減人數':'Size change')+'</b><span>'+(zh?'名單期限前 ±'+Q.free+' 位免手續費；之後加人每筆 '+M(Q.chg)+'、減人每位 '+M(Q.ref):'±'+Q.free+' free before names')+'</span></li>'
        +'<li><b>'+(zh?'改期・退票':'Changes & refunds')+'</b><span>'+(zh?'開票後不能改期、改航班或改名；未搭乘不退票價（只退未使用的機場稅）':'No date/flight/name changes after ticketing; unused tickets refund taxes only')+'</span></li>'
        +'<li><b>'+(zh?'選位':'Seats')+'</b><span>'+(zh?'經濟艙每位 NT$750、豪經每位 NT$2,000（整團一次劃位）':'Economy NT$750, Premium NT$2,000 per person')+'</span></li>'
        +'<li><b>'+(zh?'哩程':'Miles')+'</b><span>'+(zh?'累積比率與會籍積分為同艙超值票的 50%；不可哩程升等或 BigDeal':'50% of Value fares; no upgrades')+'</span></li>'
      +'</ul><p class="k31g-n">'+(zh?'完整條文：《團體訂位規章》KGM-GRP-021。':'Full terms: KGM-GRP-021.')+'</p></div></div>'
      +'<div class="k28g-how"><div><b>'+(zh?'現有航班':'Scheduled flights')+'</b><span>'+(zh?'在時刻表上的航班訂團體票':'Book seats on scheduled flights')+'</span><div class="b"><button type="button" class="g" onclick="kgmGrpPickR1101A(\'G\')">'+(zh?'用團體票 G 訂位':'Book group fare')+'</button></div></div>'
      +'<div><b>'+(zh?'包機':'Charter')+'</b><span>'+(zh?'整架包下現有航班；起飛前 6 個月申請，機型不能更換':'Whole aircraft on a scheduled flight')+'</span><div class="b"><button type="button" onclick="kgmGrpPickR1101A(\'G\',\'charter\')">'+(zh?'申請包機':'Request charter')+'</button></div></div>'
      +'<div><b>'+(zh?'自創航班':'Custom flight')+'</b><span>'+(zh?'自訂航線與日期（包機進階版）；填需要人數，起飛前 3 個月申請，可申請換大機型':'Your own route and date')+'</span><div class="b"><button type="button" onclick="kgmGrpPickR1101A(\'G\',\'custom\')">'+(zh?'申請自創航班':'Request custom flight')+'</button></div></div></div>'
      +'</div></div>'}

  /* 1101B：使用者「是每次按下搜尋之後才會顯示，每次團體都要」——團體模式在首頁按「搜尋航班」（nav('booking')）先跳方案視窗，選好才往下搜尋 */
  function nw28(){var O=window.nav;if(typeof O!=='function'||O.__r28b)return;var w=function(v){try{if(v==='booking'&&on()&&S.view==='home'&&!window.__grp28go&&S.view!=='admin'){S.search.grpPlanR1101A='';S.grp28Pre=true;S.grp28PendingNav=1;try{render()}catch(_){}return}}catch(_){}return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28b=1;window.nav=w;try{nav=w}catch(_){}}
  nw28();setTimeout(nw28,0);setTimeout(nw28,3500);setTimeout(nw28,13000);
  /* 方案限制：團體模式只留選好的方案代號 */
  function vc(){var O=window.validCodes;if(typeof O!=='function'||O.__r28)return;var w=function(){var r=O.apply(this,arguments)||[];try{var k=on()&&S.search&&S.search.grpPlanR1101A;if(k){var f=r.filter(function(c){var x=(FARES[c]||{}).groupPlanR1026C;return !x||x===k});return f}}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28=1;window.validCodes=w;try{validCodes=w}catch(_){}}
  function cc(){var O=window.CAB_CODES;if(typeof O!=='function'||O.__r28)return;var w=function(){var r=O.apply(this,arguments)||[];try{var k=on()&&S.search&&S.search.grpPlanR1101A;if(k)return r.filter(function(c){var x=(FARES[c]||{}).groupPlanR1026C;return !x||x===k})}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28=1;window.CAB_CODES=w;try{CAB_CODES=w}catch(_){}}
  [0,200,3500,13000].forEach(function(t){setTimeout(function(){vc();cc()},t)});
  /* ③ 整團要坐得下 */
  function sw(){var O=window.kgmGrpSellR1025B;if(typeof O!=='function'||O.__r28)return;var w=function(code,date,flight){var r=O.apply(this,arguments);try{if(r>0&&on()){var need=(passengerCounts()||{}).seats||0;if(window.__k28need!=null)need=window.__k28need;else{var ib=S.phase==='sel_inb'&&S.search&&S.search.grpInbR1108B,mx=ib?ib.m:(window.kgmGrpMixOfR1101A&&window.kgmGrpMixOfR1101A());if(mx){var cb=(FARES[code]||{}).cabin;if(mx[cb])need=mx[cb]}}if(need&&r<need)return 0}}catch(_){}return r};   /* 1101A ⑨：有分艙時每一艙只要坐得下那一艙的人數 */w.__r28=1;window.kgmGrpSellR1025B=w}
  sw();setTimeout(sw,0);setTimeout(sw,4000);
  /* 1108B B2（使用者：「現在不用跳出那個回程剩下哪些 因為…現在也只有這方案了」）：團體只剩 G 一個方案 → 拿掉 1101A ② 回程「這些航班沒有這個方案」的確認視窗（retWarn／retModal）。 */
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
      (S.bookings||[]).forEach(function(b){var gr=b&&b.groupR1025B;if(!gr||b.memberFixR1101A)return;var g=L.filter(function(x){return x&&x.id===gr.id})[0];if(!g||g.status!=='ticketed')return;var n=gr.cabinMove?{member:((b.paxList||[])[0]||{}).kgmMemberR1101A}:((g.names||[])[gr.index]||{}),v=String(n.member||'').toUpperCase();
        if(v){var u=(S.users||[]).filter(function(u){return u&&(String(u.id).toUpperCase()===v||String(u.memberId||'').toUpperCase()===v)})[0];if(u){b.purchaserR1101A=b.userId;b.userId=u.id;if(b.paxList&&b.paxList[0])b.paxList[0].kgmId=u.id}}
        b.memberFixR1101A=1;ch++});if(ch)try{save()}catch(_){}}catch(_){}}
  setInterval(memberFix,30000);setTimeout(memberFix,15000);
  /* ⑦ 已在尾款期限內 → 名單當下填完 */
  function late(){try{var k=S.search.grpPlanR1101A||((FARES[S.outC]||{}).groupPlanR1026C)||'U',pl=P()[k]||{},d0=(S.outF&&S.outF.date)||S.search.dep;return Math.round((Date.parse(d0)-Date.parse(T()))/864e5)<=(+pl.bal||0)}catch(_){return false}}
  /* 1104A：名單表每次都出現（使用者：「旅客名單要是表格需要每位旅客的生日啊會員號碼(optional)等等 有輸入的話可以獲得對應里程」）：
     欄位跟「我的團體訂位」名單頁一樣（姓、名、性別、生日、護照、KGM 會員卡號選填）；尾款期限內訂位一定要填完，其他時候可以先填一部分、沒填的以 TBA 保留，
     填過的帶進團體名單（grp25 finish → kgmGrpDraftNamesR1104A）；有填會員卡號的旅客開票後里程進他自己的帳號（memberFix）。 */
  function namesForm(){var zh=z(),p=passengerCounts(),d=S.grpDraftR1025B=S.grpDraftR1025B||{},lt=late();d.namesR1101A=d.namesR1101A||[];var rows='',k=S.search.grpPlanR1101A||'G',pl=P()[k]||{};
    var cell=function(i,key,r,ph,w){if(i>0&&key!=='member')ph='';return '<td><input class="inp" value="'+E(r[key]||'')+'" placeholder="'+E(ph)+'"'+(w?' style="min-width:'+w+'px"':'')+' oninput="kgmGrpNmR1101A('+i+',\''+key+'\',this.value)"></td>'};
    for(var i=0;i<p.seats+p.infants;i++){var r=d.namesR1101A[i]||{},ty=i<p.adults?'ADT':(i<p.seats?'CHD':'INF');
      rows+='<tr><td>'+(i+1)+'<small>'+(zh?(ty==='ADT'?'成人':(ty==='CHD'?'兒童':'嬰兒')):ty)+'</small></td>'+cell(i,'last',r,'WANG',90)+cell(i,'first',r,'DAMING',110)
        +'<td><select class="inp" onchange="kgmGrpNmR1101A('+i+',\'gender\',this.value)"><option value=""></option><option value="M"'+(r.gender==='M'?' selected':'')+'>M</option><option value="F"'+(r.gender==='F'?' selected':'')+'>F</option></select></td>'
        +cell(i,'dob',r,'1990-05-20',110)+cell(i,'passport',r,'A12345678',110)+cell(i,'nat',r,'TW',56)+cell(i,'member',r,i?(zh?'選填':'optional'):'KGM100000',110)+'</tr>'}   /* 1108A：護照、國籍、會員卡號範例（第一列）；國籍欄 */
    return '<div class="k28g-names k32-names"><b>'+(lt?(zh?'出發前 '+pl.bal+' 天內訂位：要當下付清並填好全部旅客（姓名、性別、生日）':'Within the balance window: enter every traveller now'):(zh?'旅客名單（可以現在填，也可以之後在「我的團體訂位」補；沒填的先以 TBA 保留，名單期限 出發前 '+pl.names+' 天）':'Traveller list (optional now; blank rows are held as TBA)'))+'</b>'
      +'<p>'+(zh?'姓名照護照英文拼音、姓名分開；生日 YYYY-MM-DD；國籍兩碼（例 TW）。範例：WANG／DAMING／M／1990-05-20／A12345678／TW／KGM100000。填了 <b>KGM 會員卡號</b> 的旅客，開票後這段的里程與會籍積分進他自己的帳號；沒填的累積到訂購的團體帳號。':'Names as in passport. With a KGM member number, miles go to that member.')+'</p>'
      +'<div class="k25g-scroll"><table><thead><tr><th>#</th><th>'+(zh?'姓 Last':'Last')+'</th><th>'+(zh?'名 First':'First')+'</th><th>'+(zh?'性別':'Sex')+'</th><th>'+(zh?'生日':'DOB')+'</th><th>'+(zh?'護照號碼':'Passport')+'</th><th>'+(zh?'國籍':'Nationality')+'</th><th>'+(zh?'KGM 會員卡號（選填）':'KGM member no. (optional)')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>'}
  window.kgmGrpNmR1101A=function(i,k,v){var d=S.grpDraftR1025B=S.grpDraftR1025B||{};d.namesR1101A=d.namesR1101A||[];d.namesR1101A[i]=d.namesR1101A[i]||{};v=String(v==null?'':v);
    d.namesR1101A[i][k]=(k==='member'||k==='passport'||k==='nat')?v.trim().toUpperCase():(k==='dob'?(window.kgmDob38R1108A?window.kgmDob38R1108A(v):v.trim()):(k==='gender'?v.trim():v.toUpperCase().replace(/[^A-Z\- ]/g,'')))};   /* 1108A：國籍；生日接受 / . */
  try{var cs32=document.createElement('style');cs32.textContent='.k32-names td:first-child{white-space:nowrap}.k32-names td{padding:3px 4px!important}.k32-names .inp{height:34px;padding:4px 8px;font-size:13px}.k32-names select.inp{min-width:56px}.k32-names p{font-size:12.5px;color:#5d665f;margin:4px 0 8px}';document.head.appendChild(cs32)}catch(_){}
  function chkNames(all){var p=passengerCounts(),L=(S.grpDraftR1025B||{}).namesR1101A||[],bad=[],zh=z();
    for(var i=0;i<p.seats+p.infants;i++){var r=L[i]||{},any=r.last||r.first||r.gender||r.dob||r.passport||r.member||r.nat;if(r.nat&&!/^[A-Z]{2}$/.test(r.nat))bad.push((i+1)+(zh?'：國籍請填兩碼英文（例 TW）':': nationality 2 letters'));
      if(all||any){if(!r.last||!r.first)bad.push((i+1)+(zh?'：姓、名都要填':': last and first name'));else if(all&&(!r.gender||!r.dob))bad.push((i+1)+(zh?'：性別、生日要填':': sex and DOB'))}
      if(r.dob&&!/^\d{4}-\d{2}-\d{2}$/.test(r.dob)||(r.dob&&(r.dob>T()||isNaN(Date.parse(r.dob)))))bad.push((i+1)+(zh?'：生日格式 YYYY-MM-DD':': DOB YYYY-MM-DD'));
      if(r.member&&!(S.users||[]).some(function(u){return u&&(String(u.id).toUpperCase()===r.member||String(u.memberId||'').toUpperCase()===r.member)}))bad.push((i+1)+(zh?'：查無 KGM 會員卡號 ':': unknown member ')+r.member)}
    return bad}
  /* grp25 finish 建立團體時讀這裡：草稿名單 → g.names（只取佔位的旅客） */
  window.kgmGrpDraftNamesR1104A=function(d,pc){try{var L=(d&&d.namesR1101A)||[],n=pc?pc.seats:0,out=[];for(var i=0;i<n;i++){var r=L[i]||{};out.push({last:r.last||'',first:r.first||'',gender:r.gender||'',dob:r.dob||'',passport:r.passport||'',nat:r.nat||'',member:r.member||'',type:i>=(pc.adults||0)?'CHD':'ADT'})}
      return out.some(function(x){return x.last||x.first})?out:[]}catch(_){return []}};
  var px0=window.kgmGrpPaxNextR1025B;
  if(typeof px0==='function'&&!px0.__r28){var px28=function(){try{if(on()){var bad=chkNames(late());if(bad.length){alert((z()?(late()?'尾款期限內訂位要先填好全部旅客：\n':'名單有幾格要修正：\n'):'Please fix the traveller list:\n')+bad.slice(0,8).join('\n'));return}}}catch(_){}
      var r=px0.apply(this,arguments);
      try{if(on()&&S.paxList){var L2=(S.grpDraftR1025B||{}).namesR1101A||[];S.paxList.forEach(function(p,i){var n=L2[i];if(n&&n.last&&n.first){p.lastName=n.last;p.firstName=n.first;p.groupNameTbaR1023A=false;if(n.gender){p.gender=n.gender;p.title=n.gender==='F'?(p.passengerType==='CHD'?'MISS':'MS'):(p.passengerType==='CHD'?'MSTR':'MR')}if(n.dob)p.dob=n.dob;if(n.passport)p.passport=n.passport;if(n.nat)p.nationality=n.nat;if(n.member)p.kgmMemberR1101A=n.member}})}}catch(_){}return r};   /* 1104A：不只尾款期限內，有填的都帶（含性別、生日、護照、會員卡號） */
    px28.__r28=1;window.kgmGrpPaxNextR1025B=px28}
  /* 畫面：前置視窗、回程提示、團體資料頁加名單表、搜尋艙等選單拿掉頭等 */
  try{var r0=window.render;if(typeof r0==='function'&&!r0.__grp28){var w=function(){autoName();var r=r0.apply(this,arguments);try{decorate()}catch(_){}return r};w.__grp28=1;window.render=w;try{render=w}catch(_){}}}catch(_){}
  function decorate(){var host=document.getElementById('k28g-host');if(!host){host=document.createElement('div');host.id='k28g-host';document.body.appendChild(host)}
    var h='';if(on()&&S.grp28Pre&&S.view!=='admin')h=preModal();if(host.__h!==h){host.innerHTML=h;host.__h=h}
    try{g32rules()}catch(_){}
    if(on()&&S.view==='booking'&&S.phase==='pax'){var pg=document.querySelector('.k25g-pax');if(pg&&!pg.querySelector('.k28g-names')){var act=pg.querySelector('.k25g-act');var d=document.createElement('div');d.innerHTML=namesForm();if(act)pg.insertBefore(d.firstChild,act);else pg.appendChild(d.firstChild)}}
    if(on()){[].forEach.call(document.querySelectorAll('#app select option[value="First"]'),function(o){o.disabled=true;o.hidden=true});if(S.search&&S.search.cabin==='First')S.search.cabin='Business'}
    /* ⑨ 搜尋卡客艙級別底下寫艙等分配 */
    /* 1101B：人數跟艙等已合併在乘客面板（三艙各幾位都能改）→ 團體模式首頁的「客艙級別」下拉藏起來，原位置寫各艙人數，點了打開同一個面板（不會有兩個地方互相蓋） */
    try{var mx=mixOf(),m29=on()&&S.view==='home'?cur28():null;[].forEach.call(document.querySelectorAll('#app select'),function(sl){if(!sl.querySelector('option[value="Business"]')||!sl.parentElement)return;var cap=sl.parentElement.querySelector('.k28m-cab');
      var t=m29?((z()?'團體 ':'Group ')+(m29.Economy+m29.Premium+m29.Business)+(z()?' 位':'')):'';   /* 1108A N2：首頁只寫總人數 */
      if(!t){if(cap)cap.remove();if(sl.style.display==='none'&&sl.__k29)sl.style.display='';return}
      if(!cap||cap.tagName!=='BUTTON'){if(cap)cap.remove();cap=document.createElement('button');cap.type='button';cap.className='k28m-cab k29-cab';cap.setAttribute('onclick','S.paxPickerOpen=true;render()');sl.parentElement.appendChild(cap)}
      sl.__k29=1;if(sl.style.display!=='none')sl.style.display='none';
      var h='<b>'+t+'</b><small>'+(z()?'艙等在搜尋結果逐艙加位':'Pick cabins in the results')+'</small>';if(cap.__h!==h){cap.innerHTML=h;cap.__h=h}})}catch(_){}}
  setInterval(function(){try{if(on()&&(S.grp28Pre||S.phase==='pax'))decorate()}catch(_){}},1200);
  /* 1104A：團體資料頁、我的團體訂位右欄的「團體票規」原本寫 Q 的改票／退票費（舊方案的字）→ G 改寫成 G 的規則 */
  function g32rules(){var zh=z(),G0=P().G||{};
    if(S.view==='booking'&&S.phase==='pax'&&(S.search.grpPlanR1101A||((FARES[S.outC]||{}).groupPlanR1026C))==='G'){var bx=document.querySelector('.k25g-pax .k25g-pay > div:nth-child(2)');
      if(bx&&!bx.__g32){bx.__g32=1;bx.innerHTML='<small>'+(zh?'團體票規（團體票 G）':'Group fare rules (G)')+'</small><b>'+(zh?'開票後不能改期、改航班、改艙、改名；不退票價（未搭乘可申請退回未使用的代收稅費）':'No changes or refunds after ticketing')+'</b><span>'+(zh?'開票前：名單期限前 ±'+(G0.free||3)+' 位免手續費，之後加人每筆 '+M(G0.chg||1400)+'、減人每位 '+M(G0.ref||2600)+'；訂金不退。選位經濟艙每位 NT$750、豪華經濟艙每位 NT$2,000（可整團一次劃位）。開票後一位旅客一個 PNR；不能網路報到；不能使用酬賓機票、哩程升等、Residence 競標。':'Before ticketing: ±'+(G0.free||3)+' free before the name deadline.')+'</span>'}}
    [].forEach.call(document.querySelectorAll('.k25box.rules'),function(bx){var sm=bx.querySelector('small');if(bx.__g32||!sm||!/ G$|\(G\)|Group fare$/.test(sm.textContent.trim()))return;var ul=bx.querySelector('ul');if(!ul)return;bx.__g32=1;
      ul.innerHTML=[zh?'開票後不能改期、改航班、改艙、改名；不退票價（未搭乘可申請退回代收稅費）':'No changes or refunds after ticketing',zh?'開票前：名單期限前 ±'+(G0.free||3)+' 位免手續費；之後加人每筆 '+M(G0.chg||1400)+'、減人每位 '+M(G0.ref||2600):'±'+(G0.free||3)+' free before names',zh?'訂金不退；尾款逾期自動取消':'Deposit non-refundable',zh?'不能網路報到：出發當日由領隊或全體旅客到櫃檯辦理':'Airport check-in only',zh?'選位經濟艙每位 NT$750、豪華經濟艙每位 NT$2,000；座位保留到起飛前 60 分鐘':'Seat fees apply',zh?'開票後一人一個 PNR':'One PNR per traveller'].map(function(t){return '<li>'+E(t)+'</li>'}).join('')})}
  /* ⑨ 混艙（使用者：「定位時要可以選擇幾位旅客哪個倉等幾位旅客哪個倉等 所以搜尋介面要調一下」）
     搜尋人數選單多一段「艙等分配」：豪經、商務填人數，其餘自動算經濟艙；S.search.grpMixR1101A={Premium,Business}。
     訂位：人數最多的那一艙當主訂位（整團一起付訂金／尾款），付款完成、團體成立後，其他艙的人用原本「名單頁改艙等」那一套
     （kgmGrpCabinR1026C）各自拆成那一艙的團體代號訂位，差額加進尾款；拆出的旅客姓名在名單頁下方另外填。 */
  var CABS=['Economy','Premium','Business'],CZ={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙'};
  function cabZ(c){return z()?CZ[c]:({Economy:'Economy',Premium:'Premium Economy',Business:'Business'}[c])}
  /* 1101B：使用者「那兩個合併也要可以改」——人數跟艙等合併成一張：經濟艙／豪華經濟艙／商務艙各幾位（成人＋兒童，三格都能改），其中兒童幾位、嬰兒幾位。
     S.search.grpMixR1101A={Economy,Premium,Business}；成人＝三艙合計－兒童。只有一艙有人＝不分艙（S.search.cabin＝那一艙）。 */
  function mixFrom(src,seats){var m=src||{},e=Math.max(0,Math.round(+m.Economy||0)),p=Math.max(0,Math.round(+m.Premium||0)),b=Math.max(0,Math.round(+m.Business||0));
    if(m.Economy==null){e=Math.max(0,seats-p-b)}   /* 舊資料（只有豪經／商務） */
    var o={Economy:e,Premium:p,Business:b},n=CABS.filter(function(c){return o[c]>0}).length;return n>1?o:null}
  function mixOf(){try{if(!on())return null;var s=S.search||{};if(!s.grpMixR1101A)return null;return mixFrom(s.grpMixR1101A,(passengerCounts()||{}).seats||0)}catch(_){return null}}
  function mainOf(m){var best='Economy';CABS.forEach(function(c){if((m[c]||0)>(m[best]||0))best=c});return best}
  function cur28(){var s=S.search,pc=passengerCounts()||{},seats=pc.seats||0,m=s.grpMixR1101A;
    if(!m||m.Economy==null){var c0=s.cabin&&CZ[s.cabin]?s.cabin:'Economy',p=+((m||{}).Premium||0),b=+((m||{}).Business||0);m={Economy:0,Premium:p,Business:b};m[c0]+=Math.max(0,seats-p-b)}
    return {Economy:+m.Economy||0,Premium:+m.Premium||0,Business:+m.Business||0}}
  function apply28(m){var s=S.search,kids=Math.max(0,+s.children||0),tot=m.Economy+m.Premium+m.Business;
    if(kids>tot)kids=tot;s.children=kids;s.adults=Math.max(1,tot-kids);s.grpMixR1101A=m;
    var o=mixFrom(m,tot);if(o)s.cabin=mainOf(o);else{var one=CABS.filter(function(c){return m[c]>0})[0];if(one)s.cabin=one}
    if(+s.infants>s.adults)s.infants=s.adults;try{passengerCounts()}catch(_){}S.openFare=null;S.outF=null;S.outC=null;S.inbF=null;S.inbC=null}
  window.kgmGrpMixR1101A=function(cab,v){try{var m=cur28();m[cab]=Math.max(0,Math.min(99,Math.round(+v||0)));apply28(m)}catch(_){}try{render()}catch(_){}};
  window.kgmGrpKidsR1101B=function(k,v){try{var m=cur28(),tot=m.Economy+m.Premium+m.Business,n=Math.max(0,Math.round(+v||0));if(k==='children'){S.search.children=Math.min(n,Math.max(0,tot-1))}else{S.search.infants=n}apply28(m)}catch(_){}try{render()}catch(_){}};
  window.kgmGrpMixOfR1101A=mixOf;
  window.kgmGrpTotR1108A=function(v){try{var n=Math.max(0,Math.min(99,Math.round(+v||0)));apply28({Economy:n,Premium:0,Business:0});S.search.grpMixR1101A=null;S.search.cabin='Economy';S.grpAllocR1108A=null;S.grpAllocInbR1108B=null;S.search.grpInbR1108B=null}catch(_){}try{render()}catch(_){}};
  function pp(){var O=window.paxPickerHTML;if(typeof O!=='function'||O.__r28)return;var w=function(){try{if(!on()||!S.paxPickerOpen)return O.apply(this,arguments);
        var zh=z(),m=cur28(),pc=passengerCounts()||{},tot=m.Economy+m.Premium+m.Business;
        var row=function(lab,sub,val,fn){return '<div class="pax-pick-row k28m-row"><div><b>'+lab+'</b><small>'+sub+'</small></div><div><input type="number" class="inp k25g-num" min="0" max="99" value="'+val+'" onchange="'+fn+'"></div></div>'};
        return '<div class="pax-pick-pop k28m-pop"><div class="pax-pick-head"><b>'+(zh?'團體人數與艙等':'Group size & cabins')+'</b><button onclick="S.paxPickerOpen=false;render()">×</button></div>'
          /* 1108A N2（使用者：「團體票我想改成人數進去再搜尋 然後可以到各個倉等直接按下加幾個位置 但必須是同個航班」）：這裡只填總人數，艙等在搜尋結果逐艙加位 */
          +row(zh?'團體人數':'Group size',zh?'成人＋兒童；艙等在搜尋結果逐艙加位':'adults + children; choose cabins in results',tot,"kgmGrpTotR1108A(this.value)")
          +'<div class="k28m-sec">'+(zh?'其中':'Of whom')+'</div>'
          +row(zh?'兒童':'Children',zh?'2–11 歲・成人票價 75%':'2–11 · 75%',pc.children||0,"kgmGrpKidsR1101B('children',this.value)")
          +row(zh?'嬰兒':'Infants',zh?'未滿 2 歲・不佔位・每位成人 1 位':'under 2 · lap',pc.infants||0,"kgmGrpKidsR1101B('infants',this.value)")
          +'<p class="k28m-sum">'+(zh?'共 <b>'+tot+'</b> 位（成人 '+(pc.adults||0)+'・兒童 '+(pc.children||0)+(pc.infants?'・嬰兒 '+pc.infants:'')+'）':'<b>'+tot+'</b> travellers')+'</p>'
          +'<p>'+(zh?'團體 10–99 位（成人＋兒童）；不到 10 位請切回一般訂票。不提供頭等艙。':'10–99 travellers. No First.')+'</p></div>'}catch(_){return O.apply(this,arguments)}};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28=1;window.paxPickerHTML=w;try{paxPickerHTML=w}catch(_){}}
  pp();setTimeout(pp,0);setTimeout(pp,3500);setTimeout(pp,13000);
  /* 搜尋卡上的人數文字加艙等分配 */
  function mixTxt(m){return CABS.filter(function(c){return m[c]>0}).map(function(c){return cabZ(c)+' '+m[c]}).join(z()?'・':' · ')}
  /* ⑩ 類酬賓訂票頁：去程／回程改成跟酬賓機票一樣的「航班 × 艙等」矩陣（沿用 award-shop 的版面），每格寫團體每位票價與剩餘座位；
     沒分艙＝點哪一格就用那一艙；有分艙＝每班一個「選擇此航班」，要每一艙都坐得下才能按。轉機航班照舊在原本的清單（下方連結）。 */
  function needOf(cab,m){var seats=(passengerCounts()||{}).seats||0;return m?(m[cab]||0):seats}
  function rawLeft(code,d,f){window.__k28need=0;try{var n=window.kgmGrpSellR1025B(code,d,f);return n==null?0:Math.max(0,+n||0)}catch(_){return 0}finally{window.__k28need=null}}
  function pricePP(f,code){try{return Math.round(+owPrice(f,code,1)||0)}catch(_){return 0}}
  /* 1108A N2：去程「逐艙加位」——每一班每一艙 − n ＋（同一班；換別班就從那一班重新分配），某艙加到剩餘座位寫「已達上限」；分配滿總人數才能選這班。
     選好就照分配設成混艙（grpMixR1101A），回程沿用同樣的艙等人數（原本的混艙矩陣）。 */
  function alSum(m){return (m.Economy||0)+(m.Premium||0)+(m.Business||0)}
  /* 1108B B2：回程也用同一套逐艙加位（S.grpAllocInbR1108B），回程的艙等人數可以跟去程不同；dir 不給＝去程 */
  function dirOf(dir){var s=S.search,inb=dir==='inb';return {inb:inb,d:inb?s.ret:s.dep,fr:inb?s.to:s.fr,to:inb?s.fr:s.to}}
  function alOf(dir,d,fr,to,code){var a=dir==='inb'?S.grpAllocInbR1108B:S.grpAllocR1108A;return a&&a.d===d&&a.fr===fr&&a.to===to&&a.code===code?a:null}
  window.kgmGrpAllocR1108A=function(i,fcode,cab,op,val,dir){try{var s=S.search,D=dirOf(dir),d=D.d,k=s.grpPlanR1101A||'U',a=alOf(dir,d,D.fr,D.to,fcode);if(!a){a={d:d,fr:D.fr,to:D.to,code:fcode,i:i,m:{Economy:0,Premium:0,Business:0}};if(D.inb)S.grpAllocInbR1108B=a;else S.grpAllocR1108A=a}a.i=i;
      var f=null;try{f=Object.assign({},(sortedFlights(D.fr,D.to,d)||[])[i],{date:d})}catch(_){}if(!f||f.code!==fcode)return;
      var cd=window.kgmGrpCodeR1025B(cab,k),left=cd?rawLeft(cd,d,f):0,seats=(passengerCounts()||{}).seats||0;
      if(op==='all'){a.m={Economy:0,Premium:0,Business:0}}
      var others=alSum(a.m)-(a.m[cab]||0),nv=op==='all'?seats:(op==='set'?Math.round(+val||0):(a.m[cab]||0)+(+op||0));
      a.m[cab]=Math.max(0,Math.min(nv,left,seats-others))}catch(e){try{console.warn('g38 alloc',e)}catch(_){}}try{render()}catch(_){}};
  window.kgmGrpAllocPickR1108A=function(i,fcode,dir){var s=S.search,D=dirOf(dir),a=alOf(dir,D.d,D.fr,D.to,fcode),seats=(passengerCounts()||{}).seats||0;if(!a||alSum(a.m)!==seats)return;
    if(D.inb){var mi=Object.assign({},a.m),ni=CABS.filter(function(c){return mi[c]>0});s.grpInbR1108B={m:ni.length>1?mi:null,cab:ni.length>1?mainOf(mi):(ni[0]||'Economy')};window.kgmGrpShopPickR1101A('inb',i,s.grpInbR1108B.cab);return}
    S.grpAllocInbR1108B=null;s.grpInbR1108B=null;
    var m=Object.assign({},a.m);apply28(m);var n=CABS.filter(function(c){return m[c]>0});if(n.length<2){S.search.grpMixR1101A=null;S.search.cabin=n[0]||'Economy'}
    window.kgmGrpShopPickR1101A('out',i,n.length>1?mainOf(m):(n[0]||'Economy'))};
  function shop(dir){var zh=z(),out=dir==='out',s=S.search,d=out?s.dep:s.ret,fr=out?s.fr:s.to,to=out?s.to:s.fr,k=s.grpPlanR1101A||'U',pl=P()[k]||{},AL=true,m=null,pc=passengerCounts()||{},seats=pc.seats||0;
    var fl=[];try{fl=sortedFlights(fr,to,d)||[]}catch(_){fl=[]}if(!fl.length)return null;
    var code=function(c){try{return window.kgmGrpCodeR1025B(c,k)}catch(_){return null}};
    var offered=function(f,c){var cd=code(c);if(!cd)return false;try{return (validCodes(f)||[]).indexOf(cd)>=0}catch(_){return false}};
    var strip=[-3,-2,-1,0,1,2,3].map(function(off){var day=addDays(d,off),min=null;try{(sortedFlights(fr,to,day)||[]).forEach(function(r){var f=Object.assign({},r,{date:day});if(AL){var tl=0,mp=null;CABS.forEach(function(c){if(!offered(f,c))return;var cd=code(c),l=rawLeft(cd,day,f);if(l>0){tl+=l;var p=pricePP(f,cd);if(p>0&&(mp==null||p<mp))mp=p}});if(tl>=seats&&mp!=null&&(min==null||mp<min))min=mp;return}if(m){var mc0=mainOf(m),okAll=CABS.every(function(c){return !m[c]||(offered(f,c)&&rawLeft(code(c),day,f)>=m[c])});if(!okAll)return;var p0=pricePP(f,code(mc0));if(p0>0&&(min==null||p0<min))min=p0;return}CABS.forEach(function(c){if(!offered(f,c))return;var cd=code(c);if(rawLeft(cd,day,f)<needOf(c,m))return;var p=pricePP(f,cd);if(p>0&&(min==null||p<min))min=p})})}catch(_){}
      var dt=new Date(day+'T12:00:00Z');return '<button type="button" class="award-date-chip '+(day===d?'on':'')+'" '+(day<T()?'disabled':'')+' onclick="kgmSelectTravelDay0911(&quot;'+dir+'&quot;,&quot;'+day+'&quot;)"><span>'+(zh?DOW_ZH:DOW_EN)[dt.getUTCDay()]+' · '+day.slice(5).replace('-','/')+'</span><b>'+(min==null?'—':M(min))+'</b></button>'}).join('');
    var rows=fl.map(function(raw,i){var f=Object.assign({},raw,{date:d});
      var detail='<div class="award-flight-cell"><div class="award-flight-code"><b>'+E(f.code)+'</b><span>'+E(typeof acftNameOf==='function'?acftNameOf(f):(f.acft||''))+'</span></div><div class="award-time-line"><div><b>'+E(f.dep)+'</b><span>'+E(fr)+'</span></div><div class="award-route-line"><small>'+E(f.durStr||(typeof durStr==='function'?durStr(f.dur||0):''))+'</small><i></i><small>'+(f.via?(zh?'經停 ':'Via ')+E(typeof CITY==='function'?CITY(f.via):f.via):(zh?'直飛':'Nonstop'))+'</small></div><div><b>'+E(f.arr)+(f.dd?' <sup>'+(f.dd>0?'+':'')+f.dd+'</sup>':'')+'</b><span>'+E(to)+'</span></div></div><div class="award-flight-bottom"><span>'+E(f.partner?(f.operator||'Partner airline'):'KGM Airways')+'</span><button type="button" onclick="openModal(&quot;flightDetail&quot;,{fr:&quot;'+fr+'&quot;,to:&quot;'+to+'&quot;,date:&quot;'+d+'&quot;,idx:'+i+'})">'+(zh?'航班詳情':'Details')+'</button></div></div>';
      var allOk=true,tot=0,kids=pc.children||0,mc=m?mainOf(m):null;
      var al=AL?alOf(dir,d,fr,to,f.code):null,aSum=al?alSum(al.m):0;
      if(AL){var aTot=0;var cellsA=CABS.map(function(c){if(!offered(f,c))return '<div class="award-plan-cell unavailable"><span>'+cabZ(c)+'</span><strong>'+(zh?'未提供':'Unavailable')+'</strong></div>';
          var cd=code(c),left=rawLeft(cd,d,f),p=pricePP(f,cd),cur=al?(al.m[c]||0):0,full=left<=0||cur>=left,canAdd=!full&&aSum<seats&&p>0;if(cur){var ch=c===mainOf(al.m)?Math.min(pc.children||0,cur):0;aTot+=p*(cur-ch)+Math.round(p*0.75)*ch}
          return '<div class="award-plan-cell k38al'+(cur?' on':'')+(left<=0?' none':'')+'"><span>'+cabZ(c)+'</span><strong>'+(p>0?M(p):'—')+'</strong><em>'+(zh?'每位・單程':'per person · one way')+'</em>'
            +'<small class="k38al-left'+(full?' cap':'')+'">'+(full?(zh?'已達上限':'Limit reached'):(zh?'剩 '+left+' 席':left+' left'))+'</small>'
            +'<div class="k38al-st"><button type="button" aria-label="−" '+(cur?'':'disabled ')+'onclick="kgmGrpAllocR1108A('+i+',\''+f.code+'\',\''+c+'\',-1,null,\''+dir+'\')">−</button><input type="number" class="inp" min="0" max="'+Math.max(0,left)+'" value="'+cur+'" '+(left<=0?'disabled ':'')+'onchange="kgmGrpAllocR1108A('+i+',\''+f.code+'\',\''+c+'\',\'set\',this.value,\''+dir+'\')"><button type="button" aria-label="+" '+(canAdd?'':'disabled ')+'onclick="kgmGrpAllocR1108A('+i+',\''+f.code+'\',\''+c+'\',1,null,\''+dir+'\')">＋</button></div>'
            +(left>=seats&&p>0?'<button type="button" class="k38al-all" onclick="kgmGrpAllocR1108A('+i+',\''+f.code+'\',\''+c+'\',\'all\',null,\''+dir+'\')">'+(zh?'整團 '+seats+' 位都放這艙':'All '+seats+' here')+'</button>':'')+'</div>'}).join('');
        var ok=aSum===seats&&seats>0,txt=al&&aSum?CABS.filter(function(c){return al.m[c]>0}).map(function(c){return cabZ(c)+' '+al.m[c]}).join(zh?'・':' · '):'';
        var confA='<div class="staff-flight-confirm k28m-conf k38al-conf"><div><b>'+(zh?'已分配 '+aSum+' / '+seats+' 位':aSum+' / '+seats+' allocated')+(txt?'　'+txt:'')+'</b><small>'+(ok?(zh?'合計約 '+M(aTot)+'（單程）；全團同一航班'+(out&&s.type==='RT'?'，回程一樣逐艙加位（艙等人數可以跟去程不同）。':'。'):'About '+M(aTot)+' one way.'):(zh?'在這一班的各艙按「＋」加位（全團必須同一航班）；加到剩餘座位會寫「已達上限」。':'Add seats in each cabin on this flight.'))+'</small></div><button type="button" class="btn btn-g" '+(ok?'':'disabled ')+'onclick="kgmGrpAllocPickR1108A('+i+',\''+f.code+'\',\''+dir+'\')">'+(zh?'選擇此航班':'Choose flight')+' →</button></div>';
        return '<article class="award-shop-row'+(al&&aSum?' k38al-row':'')+'">'+detail+cellsA+confA+'</article>'}
      var cells=CABS.map(function(c){var need=needOf(c,m);if(!offered(f,c)){if(m&&need)allOk=false;return '<div class="award-plan-cell unavailable"><span>'+cabZ(c)+'</span><strong>'+(zh?'未提供':'Unavailable')+'</strong></div>'}
        var cd=code(c),left=rawLeft(cd,d,f),p=pricePP(f,cd),ok=left>=need&&p>0;if(m&&need){if(!ok)allOk=false;var ch=c===mc?Math.min(kids,need):0;tot+=p*(need-ch)+Math.round(p*0.75)*ch}
        var price='<span>'+cabZ(c)+'</span><strong>'+M(p)+'</strong><em>'+(zh?'每位・單程':'per person · one way')+'</em>'+(left<need?'<small class="award-low">'+(left?(zh?'只剩 '+left+' 席':left+' left'):(zh?'售完':'Sold out'))+'</small>':(left<need+10?'<small class="award-low">'+(zh?'剩 '+left+' 席':left+' left')+'</small>':''));
        if(m)return '<div class="award-plan-cell k28m-cell '+(need?(ok?'need':'lack'):'')+'">'+price+(need?'<b class="k28m-need">'+(zh?'需 '+need+' 位':need+' needed')+'</b>':'')+'</div>';
        return '<div class="award-plan-cell"><button type="button" class="award-plan-btn" '+(ok?'':'disabled ')+'onclick="kgmGrpShopPickR1101A(\''+dir+'\','+i+',\''+c+'\')">'+price+'<b class="award-select">'+(ok?(zh?'選擇':'Select'):(zh?'座位不夠整團':'Not enough seats'))+'</b></button></div>'}).join('');
      var conf=m?'<div class="staff-flight-confirm k28m-conf"><div><b>'+mixTxt(m)+'</b><small>'+(allOk?(zh?'合計約 '+M(tot)+'（單程）；'+cabZ(mc)+'為主訂位，其他艙在付款後自動拆成各自的訂位代號，差額加進尾款。':'About '+M(tot)+' one way.'):(zh?'這班有艙等坐不下，請選其他航班或改艙等分配。':'Not every cabin has room.'))+'</small></div><button type="button" class="btn btn-g" '+(allOk?'':'disabled ')+'onclick="kgmGrpShopPickR1101A(\''+dir+'\','+i+',\''+mc+'\')">'+(zh?'選擇此航班':'Choose flight')+' →</button></div>':'';
      return '<article class="award-shop-row">'+detail+cells+conf+'</article>'}).join('');
    var head='<div class="award-shop-head"><div>'+(zh?'航班':'Flights')+'</div>'+CABS.map(function(c){return '<div><small>'+E(zh?(pl.zh||'團體'):(pl.en||'Group'))+'</small><b>'+cabZ(c)+'</b></div>'}).join('')+'</div>';
    return '<section class="award-shop k28m-shop" style="--cabin-columns:3"><div class="award-heading"><small>GROUP TRAVEL</small><h1>'+(out?(zh?'去程':'Depart'):(zh?'回程':'Return'))+'</h1></div>'
      +'<div class="award-date-strip"><button class="award-arrow" aria-label="Previous week" onclick="kgmSelectTravelDay0911(&quot;'+dir+'&quot;,&quot;'+addDays(d,-7)+'&quot;)">‹</button>'+strip+'<button class="award-arrow" aria-label="Next week" onclick="kgmSelectTravelDay0911(&quot;'+dir+'&quot;,&quot;'+addDays(d,7)+'&quot;)">›</button></div>'
      +'<div class="award-tools"><div><b>'+E(typeof CITY==='function'?CITY(fr):fr)+' ('+fr+') → '+E(typeof CITY==='function'?CITY(to):to)+' ('+to+')</b><p>'+(zh?'團體 '+seats+' 位（成人 '+(pc.adults||0)+(pc.children?'・兒童 '+pc.children:'')+(pc.infants?'・嬰兒 '+pc.infants:'')+'）':seats+' travellers')+(m?' · '+mixTxt(m):'')+' · '+(zh?'去回程同一方案；兒童票價 75%':'same plan both ways')+'</p></div><span class="award-mode">'+E(zh?(pl.zh||'團體'):(pl.en||'Group'))+'</span></div>'
      +'<div class="award-matrix-scroll">'+head+rows+'</div>'
      +'<div class="k28m-foot"><button class="btn" onclick="nav(&quot;home&quot;)">← '+(zh?'修改搜尋（人數／艙等分配）':'Edit search')+'</button></div></section>'}
  window.kgmGrpShopPickR1101A=function(dir,i,c){var k=S.search.grpPlanR1101A||'U',cd=null;try{cd=window.kgmGrpCodeR1025B(c,k)}catch(_){}if(!cd)return;if(!mixOf())S.search.cabin=c;try{pickFare(dir,+i,cd,true)}catch(e){try{console.warn('grp28 pick',e)}catch(_){}}};
  function fs(){var O=window.flightSel;if(typeof O!=='function'||O.__r28)return;var w=function(dir){try{if(on()&&S.view==='booking'&&(S.grp28List=0,true)&&S.search&&S.search.type!=='MC'&&!S.search.useMiles&&!(S.stx&&S.stx.plan)){var h=shop(dir);if(h)return h}}catch(e){try{console.warn('grp28 shop',e)}catch(_){}}
        var r=O.apply(this,arguments);try{if(on()&&S.grp28List)r='<div class="k28m-back"><button class="btn" onclick="S.grp28List=0;render()">← '+(z()?'回到艙等矩陣':'Back to cabin grid')+'</button></div>'+r}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28=1;window.flightSel=w;try{flightSel=w}catch(_){}}
  fs();setTimeout(fs,0);setTimeout(fs,3500);setTimeout(fs,13000);
  /* ⑪ 混艙：團體成立後把其他艙的人拆出去（原本的 kgmGrpCabinR1026C；名字還沒給就先用 TBA，名單頁下方再填） */
  function bkOf(p){return (S.bookings||[]).filter(function(x){return x&&x.pnr===p})[0]}
  /* 1108B B2：去程、回程的艙等分配可以不同 → 每位旅客配成（去程艙, 回程艙）一對：跟主訂位同一對的留著，其餘先配同艙、再把剩下的對起來，
     每一對用 kgmGrpCabinR1026C(id,i,去程艙,回程艙) 拆成自己的訂位（gen g39 cab*）。單程或回程沒分艙＝跟 1108A 一樣。 */
  function one39(c,n){var o={Economy:0,Premium:0,Business:0};o[c]=n;return o}
  function pairs39(b,n){var ib=b.search.grpInbR1108B||null,mo=(FARES[b.outC]||{}).cabin||'Economy',mi=b.inbC?((FARES[b.inbC]||{}).cabin||mo):null;
    var om=mixFrom(b.search.grpMixR1101A,n),im=mi&&ib&&ib.m?mixFrom(ib.m,n):null;if(!om&&!im)return null;
    var o=Object.assign({},om||one39(mo,n)),q=mi?Object.assign({},im||one39(mi,n)):null,mv=[],keep=q?Math.min(o[mo]||0,q[mi]||0):(o[mo]||0);o[mo]-=keep;if(q)q[mi]-=keep;
    if(q){CABS.forEach(function(c){var x=Math.min(o[c]||0,q[c]||0);for(var j=0;j<x;j++)mv.push([c,c]);o[c]-=x;q[c]-=x});var lo=[],li=[];CABS.forEach(function(c){for(var j=0;j<(o[c]||0);j++)lo.push(c);for(var j2=0;j2<(q[c]||0);j2++)li.push(c)});lo.forEach(function(c,j){mv.push([c,li[j]||mi])})}
    else CABS.forEach(function(c){if(c===mo)return;for(var j=0;j<(o[c]||0);j++)mv.push([c,null])});
    return {om:om||one39(mo,n),im:im,mo:mo,mi:mi,mv:mv}}
  var SPLIT=0;function split(){if(SPLIT)return;SPLIT=1;try{(S.groupsR1023A||[]).forEach(function(g){if(!g||g.kind!=='v25'||g.mixDoneR1101A||g.charterR1026C||!/deposit_paid|paid/.test(g.status))return;var b=bkOf(g.pnr);if(!b||!b.search||!(b.search.grpMixR1101A||b.search.grpInbR1108B))return;
        var pr=pairs39(b,g.pax0||g.pax);if(!pr){g.mixDoneR1101A={at:new Date().toISOString(),none:1};return}var m=pr.om,mc=pr.mo,zh=z(),done=[],fail=[],c0=window.confirm,k=g.plan||'U',fee=0;
        window.confirm=function(){return true};
        try{pr.mv.some(function(pp){var c=pp[0],ci=pp[1];{if(g.pax<=1)return true;var i=Math.max(0,g.adults-1);if(g.adults<=1&&g.children>0)i=g.pax-1;var p=(b.paxList||[])[i]||{};g.names=g.names||[];var had=g.names[i];
              if(!(had&&had.last&&had.first))g.names[i]={last:String(p.lastName||'TBA'),first:String(p.firstName||((i>=g.adults?'CHD':'ADT')+('0'+(i+1)).slice(-2))),type:i>=g.adults?'CHD':'ADT',tbaR1101A:!!p.groupNameTbaR1023A||!p.lastName||p.lastName==='TBA'};
              var n0=(g.moved||[]).length;if(ci)window.kgmGrpCabinR1026C(g.id,i,c,ci);else window.kgmGrpCabinR1026C(g.id,i,c);if((g.moved||[]).length>n0){var mv=g.moved[g.moved.length-1];mv.mixR1101A=1;done.push(c);var per=(c!==mc?((SEATFEE[k]||{})[c]):(ci&&ci!==pr.mi?((SEATFEE[k]||{})[ci]):0))||0;if(per){fee+=per}}else{if(!had)g.names[i]=had;fail.push(c);return true}}return false})}
        finally{window.confirm=c0}
        if(g.names&&!g.names.some(function(x){return x&&x.last}))g.names=[];
        if(fee){g.fees=g.fees||[];g.fees.push({at:new Date().toISOString(),kind:'seat',n:done.length,amount:fee,why:zh?'分艙旅客選位費':'Seat fee (split cabins)'});g.feeTotal=(g.feeTotal||0)+fee;try{window.kgmGrpRebalR1101A(g,b,zh?'分艙選位費':'seat fee')}catch(_){}}
        g.mixDoneR1101A={at:new Date().toISOString(),plan:m,planInbR1108B:pr.im,main:mc,moved:done.length,fail:fail};(g.history=g.history||[]).push({at:new Date().toISOString(),act:'艙等分配：'+(pr.im?'去程 '+mixTxt(m)+'／回程 '+mixTxt(pr.im):mixTxt(m))+'；已拆出 '+done.length+' 位'+(fail.length?'，'+fail.length+' 位沒有空位（仍在'+CZ[mc]+'）':''),by:'system'});
        S.grpMsgR1025B=zh?('✓ 已依艙等分配拆出 '+done.length+' 位（'+(pr.im?'去程 '+mixTxt(m)+'／回程 '+mixTxt(pr.im):mixTxt(m))+'）'+(fail.length?'；'+CZ[fail[0]]+'已沒有空位，'+fail.length+' 位留在'+CZ[mc]:'')+'。拆出的旅客姓名請在名單頁下方填寫。'):'Split done.';try{save()}catch(_){}try{render()}catch(_){}})}catch(e){try{console.warn('grp28 split',e)}catch(_){}}finally{SPLIT=0}}
  setInterval(split,1500);
  window.kgmGrpMovedTbaR1101A=function(g){return (g&&g.moved||[]).some(function(m){var c=bkOf(m.pnr);return c&&c.status!=='cancelled'&&(((c.paxList||[])[0]||{}).groupNameTbaR1023A||((c.paxList||[])[0]||{}).lastName==='TBA')})};
  window.kgmGrpMovedEdR1101A=function(g){var L=(g&&g.moved||[]).map(function(m,j){return {m:m,j:j,c:bkOf(m.pnr)}}).filter(function(x){return x.c&&x.c.status!=='cancelled'});if(!L.length)return '';var zh=z(),tk=g.status==='ticketed';
    return '<div class="k28m-moved"><b>'+(zh?'其他艙等的旅客'+(tk?'（各自的訂位代號）':''):'Travellers in other cabins')+'</b><table class="k25g-t"><thead><tr><th>'+(zh?'艙等':'Cabin')+'</th><th>'+(zh?'訂位代號':'PNR')+'</th><th>'+(zh?'姓 Last':'Last')+'</th><th>'+(zh?'名 First':'First')+'</th><th>'+(zh?'KGM 會員卡號':'Member no.')+'</th></tr></thead><tbody>'
      +L.map(function(x){var p=(x.c.paxList||[])[0]||{},tba=p.groupNameTbaR1023A||p.lastName==='TBA',v=function(s){return E(tba?'':s||'')};
        return '<tr><td>'+E(cabZ(x.m.cab))+(x.m.cabInR1108B?'<small>'+(zh?'回程 ':'Return ')+E(cabZ(x.m.cabInR1108B))+'</small>':'')+'<small>'+E(p.passengerType||'ADT')+'</small></td><td class="mono">'+(tk?E(x.m.pnr):(zh?'開票後提供':'After ticketing'))+'</td>'   /* 1108A：開票前不提供訂位代號（G1） */+(tk?'<td colspan="3">'+E((p.lastName||'')+'/'+(p.firstName||''))+'</td>':'<td><input id="k28mvL'+x.j+'" class="inp" value="'+v(p.lastName)+'" placeholder="WANG"></td><td><input id="k28mvF'+x.j+'" class="inp" value="'+v(p.firstName)+'" placeholder="DAMING"></td><td><input id="k28mvM'+x.j+'" class="inp" value="'+E(p.kgmMemberR1101A||'')+'" placeholder="'+(zh?'選填':'optional')+'"></td>')+'</tr>'}).join('')+'</tbody></table><small>'+(zh?'跟上面同一個「儲存名單」按鈕一起存；全部填好才會開票。':'Saved with the button above.')+'</small></div>'};
  function nw2(){var O=window.kgmGrpNamesR1025B;if(typeof O!=='function'||O.__r28b)return;var w=function(id){var g=(S.groupsR1023A||[]).filter(function(x){return x&&x.id===id})[0],bad=[],up=[];
      (g&&g.moved||[]).forEach(function(m,j){var eL=document.getElementById('k28mvL'+j),eF=document.getElementById('k28mvF'+j),eM=document.getElementById('k28mvM'+j);if(!eL||!eF)return;
        var L=String(eL.value||'').trim().toUpperCase().replace(/[^A-Z\- ]/g,''),F=String(eF.value||'').trim().toUpperCase().replace(/[^A-Z\- ]/g,''),Mm=String(eM&&eM.value||'').trim().toUpperCase();
        if((L&&!F)||(!L&&F))bad.push(m.pnr+(z()?'：姓、名都要填':': both names'));if(Mm&&!(S.users||[]).some(function(u){return u&&(String(u.id).toUpperCase()===Mm||String(u.memberId||'').toUpperCase()===Mm)}))bad.push(m.pnr+(z()?'：查無會員卡號 ':': unknown member ')+Mm);up.push({m:m,L:L,F:F,M:Mm})});
      if(bad.length){S.grpMsgR1025B=bad.slice(0,6).join('　');try{render()}catch(_){}return}
      up.forEach(function(u){var c=bkOf(u.m.pnr);if(!c)return;var p=(c.paxList||[])[0];if(!p)return;if(u.L&&u.F){p.lastName=u.L;p.firstName=u.F;p.groupNameTbaR1023A=false;u.m.name=u.L+'/'+u.F;u.m.names=Object.assign({},u.m.names||{},{last:u.L,first:u.F,tbaR1101A:false})}p.kgmMemberR1101A=u.M||'';if(u.m.names)u.m.names.member=u.M||''});
      return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__r28=O.__r28;w.__r28b=1;window.kgmGrpNamesR1025B=w}
  setTimeout(nw2,50);setTimeout(nw2,4500);
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
   +'.k28m-mix{margin-top:10px;padding-top:10px;border-top:1px dashed #DCE3DF;display:flex;flex-direction:column;gap:6px}.k28m-mix>b{color:#0B3D2E;font-size:13px}.k28m-mix>small{color:#7A857F;font-size:11.5px;line-height:1.5}.k28m-sec{margin:10px 0 2px;font-size:12px;font-weight:800;color:#0B3D2E;letter-spacing:.04em}.k28m-sum{margin:10px 0 4px;font-size:13px;color:#0B3D2E}.k28m-cab{display:block;margin-top:3px;font-size:11.5px;color:#0B6B48;font-weight:700}.k29-cab{display:flex;flex-direction:column;align-items:flex-start;gap:2px;margin:0;padding:4px 0;border:0;background:none;cursor:pointer;text-align:left;font-family:inherit}.k29-cab b{font-size:15px;font-weight:700;color:#14231D}.k29-cab small{font-size:11px;font-weight:500;color:#7A857F}.k29-cab:hover b{color:#0B3D2E;text-decoration:underline;text-underline-offset:3px}'
   +'.k28m-shop .award-plan-cell.k28m-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:14px 10px;text-align:center}.k28m-cell.need{background:#F2F8F5;box-shadow:inset 0 0 0 1.5px #0B6B48}.k28m-cell.lack{background:#FFF4F2;box-shadow:inset 0 0 0 1.5px #C2412D}'
   +'.k28m-need{display:inline-block;margin-top:4px;border-radius:999px;padding:3px 10px;font-size:11.5px;background:#0B3D2E;color:#fff}.k28m-cell.lack .k28m-need{background:#C2412D}'
   +'.k38al{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:12px 8px;text-align:center}.k38al.on{background:#EEF7F2;box-shadow:inset 0 0 0 2px #0B3D2E;border-radius:12px}.k38al.none{opacity:.6}.k38al-left{font-size:11.5px;color:#5E6863}.k38al-left.cap{color:#9B1C1C;font-weight:700}'
   +'.k38al-st{display:flex;align-items:center;gap:6px;margin-top:4px}.k38al-st button{width:30px;height:30px;border-radius:50%;border:1px solid #0B3D2E;background:#fff;color:#0B3D2E;font-size:16px;font-weight:700;cursor:pointer;line-height:1}.k38al-st button[disabled]{opacity:.35;cursor:not-allowed}.k38al-st .inp{width:56px;height:30px;text-align:center;padding:2px 4px}'
   +'.k38al-all{margin-top:4px;border:none;background:none;color:#8A6D2B;font-size:11.5px;text-decoration:underline;cursor:pointer}.k38al-conf{grid-column:1/-1}'
   +'.k28m-conf .btn[disabled]{opacity:.45;cursor:not-allowed}.k28m-foot{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.k28m-back{max-width:1180px;margin:14px auto 0;padding:0 18px}'
   +'.k28m-moved{margin-top:14px;border:1px solid #E1E8E4;border-radius:14px;padding:12px 14px;background:#FAFCFB}.k28m-moved>b{display:block;color:#0B3D2E;margin-bottom:8px}.k28m-moved td small{display:block;color:#9AA49F}.k28m-moved td:first-child,.k28m-moved td.mono{white-space:nowrap}.k28m-moved>small{display:block;margin-top:6px;color:#7A857F;font-size:11.5px}'
   +'@media(max-width:760px){.k28g-how{grid-template-columns:1fr}.k28g-dlg{padding:18px}}';
    document.head.appendChild(cs)}catch(_){}
})();
