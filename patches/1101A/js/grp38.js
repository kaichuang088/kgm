/* ══ 1108A：團體名單（使用者 G4「姓/名、性別、生日、護照號碼要給 sample，要包含國籍還有 KGM 會員卡號」、G5「我在名單按下儲存怎麼都不見了」）
   G5 根因（tests/g5_38.js 實測）：名單頁的輸入只存在畫面上；任何一格格式不對（例：生日打 1975/01/30、會員卡號查無）→ 寫錯誤訊息、整頁重畫 →
   重畫是從已存的 g.names 畫，剛打的字全部被洗掉；改艙等、點步驟卡也一樣。
   → 每打一個字就記到 S.grpNmDraftR1108A（只存在這次開頁；按「儲存名單」成功後清掉），重畫後把草稿填回輸入框；
     生日接受 1990/05/20、1990.05.20、19900520，存檔前改成 1990-05-20；國籍兩碼（TW、JP…）存進 g.names[i].nat 與訂位旅客 nationality。
   訂位頁名單表（grp28 namesForm）的國籍欄在 grp28.js。 */
(function(){
  if(window.__grp38)return;window.__grp38=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var RE=/^k25gN([LFGDPNM])(\d+)$/;
  function gid(){try{return S.grpViewR1023A&&S.grpViewR1023A.id||''}catch(_){return ''}}
  function D(){var id=gid();if(!id)return null;var d=S.grpNmDraftR1108A;if(!d||d.id!==id){d=S.grpNmDraftR1108A={id:id,rows:{}}}return d}
  function dob38(v){v=String(v||'').trim();var m=v.match(/^(\d{4})[\/\.\-]?(\d{1,2})[\/\.\-]?(\d{1,2})$/);if(!m)return v;return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2)}
  window.kgmDob38R1108A=dob38;
  function rec(e){var t=e&&e.target;if(!t||!t.id)return;var m=t.id.match(RE);if(!m)return;var d=D();if(!d)return;var r=d.rows[m[2]]=d.rows[m[2]]||{};r[m[1]]=String(t.value==null?'':t.value)}
  document.addEventListener('input',rec,true);document.addEventListener('change',rec,true);
  /* 重畫後填回 */
  var busy=false;function refill(){if(busy)return;var d=S.grpNmDraftR1108A;if(!d||d.id!==gid())return;var any=false;
    Object.keys(d.rows).forEach(function(i){var r=d.rows[i];Object.keys(r).forEach(function(k){var e=document.getElementById('k25gN'+k+i);if(e&&e!==document.activeElement&&e.value!==r[k]){e.value=r[k];any=true}})});return any}
  try{var Q=false;new MutationObserver(function(){if(Q)return;Q=true;Promise.resolve().then(function(){Q=false;try{if(document.getElementById('k25gNL0'))refill()}catch(_){}})}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
  function G(id){return (S.groupsR1023A||[]).filter(function(x){return x&&x.id===id})[0]}
  /* 存名單：先把生日改成標準格式；成功（訊息 ✓）後寫國籍、清草稿 */
  function wrapSave(){var O=window.kgmGrpNamesR1025B;if(typeof O!=='function'||O.__g38)return;
    var w=function(id){var nat=[],badN=[];
      for(var i=0;i<200;i++){var eL=document.getElementById('k25gNL'+i);if(!eL)break;var eD=document.getElementById('k25gND'+i);if(eD&&eD.value){var nv=dob38(eD.value);if(nv!==eD.value){eD.value=nv;var d0=D();if(d0){(d0.rows[i]=d0.rows[i]||{}).D=nv}}}
        var eN=document.getElementById('k25gNN'+i),n=String(eN&&eN.value||'').trim().toUpperCase();if(n&&!/^[A-Z]{2}$/.test(n))badN.push((i+1)+(z()?'：國籍請填兩碼英文（例 TW）':': nationality 2 letters'));nat.push(n)}
      if(badN.length){S.grpMsgR1025B=badN.slice(0,6).join('　');try{render()}catch(_){}return}
      var r=O.apply(this,arguments);
      try{if(/^✓/.test(String(S.grpMsgR1025B||''))){var g=G(id);if(g&&g.names){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===g.pnr})[0];
          g.names.forEach(function(x,i){if(!x)return;x.nat=nat[i]||'';var p=b&&b.paxList&&b.paxList[i];if(p)p.nationality=nat[i]||'';
            var sp=(g.split||[])[i],c=sp&&(S.bookings||[]).filter(function(y){return y&&y.pnr===sp.pnr})[0];if(c&&c.paxList&&c.paxList[0])c.paxList[0].nationality=nat[i]||''});try{save()}catch(_){}}   /* 這次存名單剛好開票：拆出的每位訂位也寫 */
        if(S.grpNmDraftR1108A&&S.grpNmDraftR1108A.id===id)S.grpNmDraftR1108A=null;try{render()}catch(_){}}}catch(_){}
      return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window.kgmGrpNamesR1025B=w}
  /* Excel 貼上：第 5、6 欄＝國籍、會員卡號；生日一樣接受 / . */
  function wrapPaste(){var O=window.kgmGrpPasteR1025B;if(typeof O!=='function'||O.__g38)return;
    var w=function(id){var r=O.apply(this,arguments);try{var t=String((document.getElementById('k25gPaste')||{}).value||'');
        t.split(/\r?\n/).map(function(l){return l.trim()}).filter(Boolean).forEach(function(l,i){var c=l.split(/\s*[,\t;]\s*/);
          var set=function(k,v){var e=document.getElementById('k25gN'+k+i);if(e&&v!=null){e.value=v;rec({target:e})}};
          var nm=String(c[0]||'').split('/');set('L',String(nm[0]||'').toUpperCase());set('F',String(nm[1]||'').toUpperCase());set('G',(c[1]||'').toUpperCase().charAt(0));set('D',dob38(c[2]||''));set('P',String(c[3]||'').toUpperCase());
          if(c[4]!=null)set('N',String(c[4]).trim().toUpperCase());if(c[5]!=null)set('M',String(c[5]).trim().toUpperCase())})}catch(_){}return r};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window.kgmGrpPasteR1025B=w}
  /* ── G1（使用者：「團體票在還沒開之前都是沒有提供PNR喔 然後要看只能去我的團體行程那裡」）──
     開票前的整團訂位（g.pnr）與改艙等拆出的訂位（g.moved[].pnr）在前台不給代號：我的行程清單不列（gen trip30 mine）、
     行程管理／用代號查詢／付款後自動打開的行程頁一律擋下，改成提示到「我的團體訂位」。後台照舊看得到。開票後每位旅客的訂位照常。 */
  /* 整團訂位（票價是團體代號、不是開票後拆出的個人訂位）——付款當下團體紀錄還沒建立就要認得（訂位確認信在那之前寄） */
  function grpFare(b){try{var c=b.outC||(b.mcFlights&&b.mcFlights[0]&&b.mcFlights[0].c)||'';var f=FARES[c]||{};return !!f.groupPlanR1026C&&!(b.groupR1025B&&b.groupR1025B.index!=null)}catch(_){return false}}
  function hideB(b){try{var p=b&&b.pnr;if(!p)return false;var L=S.groupsR1023A||[];for(var i=0;i<L.length;i++){var g=L[i];if(!g||g.status==='ticketed')continue;
      if(g.pnr===p)return true;if((g.moved||[]).some(function(m){return m&&m.pnr===p}))return true}
      var bb=(b.outC||b.mcFlights)?b:(S.bookings||[]).filter(function(x){return x&&x.pnr===p})[0];if(bb&&grpFare(bb))return true}catch(_){}return false}
  window.kgmGrpHideR1108A=hideB;
  function note(){var h=S.grpHideR1108A;if(!h||h.view!==S.view)return '';var zh=z();
    return '<div class="k38gh"><b>'+(zh?'團體訂位開票前不提供訂位代號':'Group bookings have no PNR before ticketing')+'</b><span>'+(zh?'行程、座位、付款與旅客名單都在「我的團體訂位」管理；開票後每位旅客會有自己的訂位代號，才能在這裡查詢。':'Manage itinerary, seats, payment and names under My group bookings; each traveller gets a PNR at ticketing.')+'</span>'
      +'<button type="button" class="btn btn-g" onclick="S.grpHideR1108A=null;S.grpViewR1023A=null;nav(\'group23\')">'+(zh?'前往我的團體訂位 →':'Go to My group bookings →')+'</button></div>'}
  function wrapV(name){var O=window[name];if(typeof O!=='function'||O.__g38)return;
    var w=function(){try{if(S.view!=='admin'){var c=[S.mtOnly,S.mtOpen&&S.mtOpen.pnr,S.mgResult&&S.mgResult.pnr,S.pnrBooking0812A&&S.pnrBooking0812A.pnr,S.mtPick&&S.mtPick.pnr],hid=null;
          for(var i=0;i<c.length;i++){if(c[i]&&hideB({pnr:c[i]})){hid=c[i];break}}
          if(hid){S.mtOnly=null;S.mtOpen=null;S.mtPick=null;S.mgResult=null;S.pnrBooking0812A=null;S.grpHideR1108A={pnr:hid,view:S.view}}else if(c.some(Boolean))S.grpHideR1108A=null}}catch(_){}   /* 改查別的訂位 → 提示收掉 */
      var h=O.apply(this,arguments);try{var n=note();if(n&&typeof h==='string'&&h.indexOf('class="k38gh"')<0)h='<div class="k38gh-w">'+n+'</div>'+h;   /* 1108B B3：行程管理裡面會再畫一次我的行程 → 只放一條 */else if(S.grpHideR1108A&&S.grpHideR1108A.view!==S.view)S.grpHideR1108A=null}catch(_){}return h};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window[name]=w;
    try{if(name==='myTripView')myTripView=w;else if(name==='manageView')manageView=w}catch(_){}}
  try{var cs=document.createElement('style');cs.textContent='.k38gh-w{max-width:1080px;margin:22px auto 0;padding:0 20px}.k38gh{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;border:1px solid #d9cfa8;background:#fffaf0;border-radius:14px;padding:16px 18px}.k38gh b{font-size:15px;color:#5b4300;flex-basis:100%}.k38gh span{flex:1 1 360px;font-size:13px;color:#5d665f;line-height:1.55}.k38gh .btn{white-space:nowrap}';document.head.appendChild(cs)}catch(_){}
  /* 信件：開票前的團體訂位不寄一般「訂位確認」信（團體成立信 group.booked 已經寄了）；其他信把代號換成團體案件編號 */
  function grpOfP(p){var L=S.groupsR1023A||[];for(var i=0;i<L.length;i++){var g=L[i];if(g&&g.status!=='ticketed'&&(g.pnr===p||(g.moved||[]).some(function(m){return m&&m.pnr===p})))return g}return null}
  function wrapN(){var O=window.kgmNotify;if(typeof O!=='function'||O.__g38)return;
    var w=function(ev,d){try{if(d&&((d.groupId&&(G(d.groupId)||{}).mockR1108A)||(d.caseNo&&(S.staffCasesR1007A||[]).some(function(c){return c&&c.caseNo===d.caseNo&&c.mockR1108A}))))return Promise.resolve({skipped:'mock'})}catch(_){}   /* 模擬資料不寄信 */
      try{var p=d&&d.pnr,g=p?grpOfP(p):null,hid=g||(p&&hideB({pnr:p}));if(hid){
          if(/^booking\.(confirmed|created|ticketed)$/.test(String(ev)))return Promise.resolve({skipped:'group-before-ticketing'});
          var rep=g?g.id:(z()?'團體訂位':'group booking'),js=JSON.stringify(d).split(p).join(rep),d2=JSON.parse(js);d2.pnr='';d2.groupCaseR1108A=g?g.id:'';var a=[].slice.call(arguments);a[1]=d2;return O.apply(this,a)}}catch(_){}
      return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window.kgmNotify=w;try{kgmNotify=w}catch(_){}}
  /* ── G2（使用者：「改成截止日期到會自動付尾款（也可以選擇結帳時填寫不同信用卡）」）──
     結帳頁（團體模式）多一塊「尾款自動扣款」：同一張卡（本次付訂金的卡）或另一張卡；付款後存在 g.autoPayR1108A（只存末四碼／到期／持卡人，不存卡號）。
     尾款期限當天（台北日期 ≥ 期限）自動把尾款請款單標成已付（跟付款頁同一套欄位：status／paidAt／card），原本的 tick 下一輪就照「尾款已付」處理（寄信、可開票）。
     我的團體訂位「尾款」步驟寫扣款日與卡片，可更換扣款卡或提前手動付。 */
  function lastOf(n){n=String(n||'').replace(/\D/g,'');return n.slice(-4)}
  function okCard(n,e){n=String(n||'').replace(/\s/g,'');return /^\d{13,19}$/.test(n)&&/^\d{2}\/\d{2}$/.test(String(e||''))}
  function apBox(){var zh=z(),c=S.grpBalCardR1108A=S.grpBalCardR1108A||{mode:'same'},oth=c.mode==='other';
    return '<div class="k38ap-pay"><b>'+(zh?'尾款自動扣款':'Balance auto-charge')+'</b><span>'+(zh?'尾款期限當天自動扣款，不用再另外付款；名單齊全後自動開票。':'The balance is charged automatically on the due date.')+'</span>'
      +'<label><input type="radio" name="k38ap" '+(oth?'':'checked')+' onchange="S.grpBalCardR1108A.mode=\'same\';render()"> '+(zh?'用這次付訂金的同一張卡':'Same card as this payment')+'</label>'
      +'<label><input type="radio" name="k38ap" '+(oth?'checked':'')+' onchange="S.grpBalCardR1108A.mode=\'other\';render()"> '+(zh?'用另一張信用卡扣尾款':'Use a different card for the balance')+'</label>'
      +(oth?cardForm('grpbal',{num:'k38apNum',name:'k38apName',expM:'k38apExpM',expY:'k38apExpY',exp:'k38apExp',cvv:'k38apCvv'},zh?'尾款期限當天才從這張卡扣款，現在不扣。':'This card is charged on the balance due date, not now.'):'')+'</div>'}
  /* 1112A C1／C2（使用者：「尾款需要安全碼吧 然後我希望可以是圖二的格式」）：扣尾款的另一張卡＝付款頁同一個信用卡元件（卡片預覽、卡號、有效期限月／年、安全碼 CVV、持卡人姓名），
     安全碼只用來驗證、不存（跟付款頁一樣）；重畫時已填的安全碼保留在畫面草稿 CVV38（不存檔）。 */
  var CVV38={};
  function cardForm(key,ids,note){var h='';try{h=kgmCardFormR923({key:key,ids:ids,contact:false,ssl:note})}catch(_){return ''}
    return '<div class="k38ap-card">'+h.replace('id="'+ids.cvv+'"','id="'+ids.cvv+'" value="'+E(CVV38[key]||'')+'"')+'</div>'}
  document.addEventListener('input',function(e){var t=e.target;if(!t||!t.id)return;if(t.id==='k38apCvv')CVV38.grpbal=t.value;if(t.id==='k38apCvv2')CVV38.grpbal2=t.value},true);
  function cardVals(ids){var v=function(k){return String((document.getElementById(ids[k])||{}).value||'').trim()};var m=v('expM'),y=v('expY');
    return {num:v('num').replace(/\s/g,''),exp:(m&&y)?(m+'/'+y):v('exp'),cvv:v('cvv'),name:v('name')}}
  function cardBad(c){var zh=z(),m=[];if(!/^\d{13,19}$/.test(c.num))m.push(zh?'卡號':'card number');if(!/^\d{2}\/\d{2}$/.test(c.exp))m.push(zh?'有效期限（月／年）':'expiry');if(!/^\d{3,4}$/.test(c.cvv))m.push(zh?'安全碼 CVV':'CVV');if(!c.name)m.push(zh?'持卡人姓名':'name on card');return m}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function gOn(){try{return !!(window.kgmGrpOnR1025B&&window.kgmGrpOnR1025B())}catch(_){return false}}
  function wrapPay(){var O=window.payView;if(typeof O!=='function'||O.__g38)return;
    var w=function(){var h=O.apply(this,arguments);try{if(gOn()&&typeof h==='string'&&h.indexOf('k25g-paynote')>=0&&h.indexOf('本次付清全額')<0&&h.indexOf('Paying in full')<0){var i=h.indexOf('</div>',h.indexOf('k25g-paynote'));if(i>0)h=h.slice(0,i+6)+apBox()+h.slice(i+6)}}catch(_){}return h};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window.payView=w;try{payView=w}catch(_){}}
  var PEND=null,REC39=null;
  /* ── 1108B B1（使用者：「訂購完團體機票應該是給案件而不是這頁吧 PNR是之後一個一個給啊」）──
     團體票（G）的訂位一律不畫一般「訂購完成」頁（那頁有整團 PNR＋訂位確認單）：團體已成立 → 直接到那一團的我的團體訂位；
     團體紀錄還沒建（原本 grp25 只等 15 秒、或建立時出錯）→ 用付款當下記住的團名／人數補建（kgmGrpFinishR1026C，跟原本同一支），建好再過去。 */
  function grpOfB39(b){if(!b)return null;var id=b.groupR1025B&&(b.groupR1025B.id);if(id)return G(id);return (S.groupsR1023A||[]).filter(function(g){return g&&g.pnr===b.pnr})[0]||null}
  function isGrpB39(b){return !!b&&(grpFare(b)||!!(b.groupR1025B&&b.groupR1025B.index==null&&!b.groupR1025B.cabinMove))}
  function goGrp39(g){S.grpHideR1108A=null;S.mgResult=null;S.pnrBooking0812A=null;S.mtOpen=null;S.mtOnly=null;S.grpViewR1023A={id:g.id};S.grp25Tab='seats';S.view='group23';S.phase=null;try{render()}catch(_){}try{window.scrollTo(0,0)}catch(_){}}
  function recover39(b){try{if(!b||grpOfB39(b)||typeof window.kgmGrpFinishR1026C!=='function')return null;var r=REC39&&REC39.uid===(S.user&&S.user.id)?REC39:null;
      var d=r?r.d:{},pc=r?r.pc:null;if(!String(d.name||'').trim()){var a=(S.user&&S.user.groupAccountR1025B)||{},f=b.outF||{};d=Object.assign({},d,{name:String((a.company||'')+' '+(f.fr||'')+'-'+(f.to||'')+' '+String(f.date||'').slice(5).replace('-','/')+(z()?' 團':' Group')).trim()})}
      if(!pc){var q=b.passengerCounts||{};pc={adults:+q.adults||0,children:+q.children||0,infants:+q.infants||0,seats:(+q.adults||0)+(+q.children||0)}}
      window.kgmGrpFinishR1026C(b,d,pc);REC39=null;var g=grpOfB39(b);if(g)(g.history=g.history||[]).push({at:new Date().toISOString(),act:'團體紀錄由付款完成頁補建（1108B）',by:'system'});return g}catch(e){try{console.warn('g39 recover',e)}catch(_){}return null}}
  function wrapSucc39(){var O=window.successView;if(typeof O!=='function'||O.__g39)return;
    var w=function(){var b=null;try{b=(S.bookings||[]).filter(function(x){return x&&x.pnr===S.pnr})[0]||null}catch(_){}
      if(!isGrpB39(b))return O.apply(this,arguments);var zh=z(),g=grpOfB39(b);
      setTimeout(function(){var g2=grpOfB39(b)||recover39(b);if(g2){try{if(window.kgmGrpSplitNowR1112A)window.kgmGrpSplitNowR1112A()}catch(_){}}if(g2&&S.view==='booking'&&S.phase==='success')goGrp39(g2)},g?0:600);   /* 1112A C4：先拆艙再進團體頁 → 進去就是最後的人數，不會再變一次 */
      return '<div style="max-width:760px;margin:40px auto;padding:0 18px"><div class="card k39gs"><small>KGM AIRWAYS · GROUP BOOKING</small><h2>'+(zh?'團體訂位已成立':'Group booking created')+'</h2><p>'+(zh?'正在打開這一團的「我的團體訂位」（團體案件編號、付款、劃位、名單）；開票後每位旅客才會有自己的訂位代號（PNR）。':'Opening your group case. Each traveller gets a PNR at ticketing.')+'</p>'+(g?'<b class="mono">'+E(g.id)+'</b>':'')+'</div></div>'};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g39=1;window.successView=w;try{successView=w}catch(_){}}
  /* 1112A C4（使用者：「訂完團體機票會閃兩下到其他頁面才會進到圖四這頁面」）：混艙團體付款後，團體頁先畫「15 位全在經濟」、1.5 秒後拆艙完成才重畫成 12＋3。
     改：要畫我的團體訂位頁時，這一團如果還沒拆艙就先拆（同一支 grp28 split），進去就是最後的人數。 */
  function needSplit40(){try{var v=S.grpViewR1023A,id=v&&v.id;if(S.view!=='group23'||!id)return false;var g=G(id);if(!g||g.kind!=='v25'||g.mixDoneR1101A||g.charterR1026C||!/deposit_paid|paid/.test(g.status))return false;
      var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===g.pnr})[0];return !!(b&&b.search&&(b.search.grpMixR1101A||b.search.grpInbR1108B))}catch(_){return false}}
  var MINER40=null;function wrapR40(){var O=window.render;if(typeof O!=='function'||O===MINER40)return;var w=function(){if(needSplit40()){try{window.kgmGrpSplitNowR1112A&&window.kgmGrpSplitNowR1112A()}catch(_){}if(!needSplit40()&&window.render===w)return}return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}MINER40=w;window.render=w;try{render=w}catch(_){}}
  wrapR40();setTimeout(wrapR40,3000);setTimeout(wrapR40,12000);
  /* 15 秒後還是一般完成頁以外的地方（例：付款後立刻離開）也補建，最多等 10 分鐘 */
  setInterval(function(){try{if(!REC39||Date.now()-REC39.t<16000)return;if(Date.now()-REC39.t>600000){REC39=null;return}
      var L=(S.bookings||[]).slice(REC39.before);for(var i=L.length-1;i>=0;i--){var b=L[i];if(isGrpB39(b)&&!grpOfB39(b)){var g=recover39(b);if(g&&S.view==='booking'&&S.phase==='success')goGrp39(g);return}}if(Date.now()-REC39.t>60000)REC39=null}catch(_){}},1000);
  function wrapDoPay(){var O=window.doPay;if(typeof O!=='function'||O.__g38)return;
    var w=function(){try{if(gOn()){var c=S.grpBalCardR1108A||{mode:'same'},main=String((document.getElementById('cnum')||{}).value||''),mname=String((document.getElementById('cname')||{}).value||'');
          var oc=c.mode==='other'?cardVals({num:'k38apNum',name:'k38apName',expM:'k38apExpM',expY:'k38apExpY',exp:'k38apExp',cvv:'k38apCvv'}):null,bad=oc?cardBad(oc):[];
          if(bad.length){alert((z()?'扣尾款的另一張信用卡還差：':'Balance card — still needed: ')+bad.join(z()?'、':', '));return}
          PEND={t:Date.now(),uid:S.user&&S.user.id,ap:c.mode==='other'?{mode:'other',last4:lastOf(oc.num),exp:oc.exp,holder:String(oc.name||mname).toUpperCase(),cvvOkR1112A:1}:{mode:'same',last4:lastOf(main),holder:mname.toUpperCase()}}}}catch(_){}
      try{if(gOn()){var pc0=null;try{pc0=Object.assign({},passengerCounts())}catch(_){}REC39={t:Date.now(),uid:S.user&&S.user.id,before:(S.bookings||[]).length,d:Object.assign({},S.grpDraftR1025B||{}),pc:pc0}}}catch(_){}   /* 1108B B1：付款當下記住團名與人數，萬一原本的 15 秒等待沒接到就由這裡補建團體 */
      return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window.doPay=w;try{doPay=w}catch(_){}}
  function attach(){if(!PEND)return;if(Date.now()-PEND.t>30000){PEND=null;return}
    var g=(S.groupsR1023A||[]).filter(function(x){return x&&x.kind==='v25'&&!x.autoPayR1108A&&x.userId===PEND.uid&&Date.parse(x.createdAt)>=PEND.t-5000})[0];
    if(!g)return;if(g.status==='deposit_paid'&&g.balance&&!g.balance.paid){g.autoPayR1108A=Object.assign({at:new Date().toISOString()},PEND.ap);(g.history=g.history||[]).push({at:new Date().toISOString(),act:'尾款自動扣款：'+g.due.balance+' 以 •••• '+(PEND.ap.last4||'')+' 扣款',by:'customer'});try{save()}catch(_){}}
    PEND=null;S.grpBalCardR1108A=null}
  setInterval(attach,400);
  /* 1108B B3（使用者圖二：「為什麼上面有這個啊好亂喔」）：付款流程會把整團訂位留在行程管理／我的行程的狀態（S.mgResult 等），
     之後打開行程管理就被當成「查詢到團體代號」而跳提示。團體剛成立（30 秒內）時把這些殘留狀態清掉；只有旅客自己去查團體代號才提示。 */
  var SEEN39=null;setInterval(function(){try{var L=S.groupsR1023A||[];if(!SEEN39){SEEN39={};L.forEach(function(g){if(g&&g.id)SEEN39[g.id]=1});return}
      L.forEach(function(g){if(!g||!g.id||SEEN39[g.id])return;SEEN39[g.id]=1;if(!g.pnr||Date.now()-Date.parse(g.createdAt||0)>30000)return;var p=g.pnr,hit=function(x){return x&&(x===p||x.pnr===p)};
        if(hit(S.mgResult))S.mgResult=null;if(hit(S.pnrBooking0812A))S.pnrBooking0812A=null;if(hit(S.mtOpen))S.mtOpen=null;if(hit(S.mtOnly))S.mtOnly=null;if(hit(S.mtPick))S.mtPick=null;if(S.grpHideR1108A&&S.grpHideR1108A.pnr===p)S.grpHideR1108A=null})}catch(_){}},500);
  function Tday(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function autoCharge(){var ch=0,td=Tday();(S.groupsR1023A||[]).forEach(function(g){try{if(!g||g.kind!=='v25'||!g.autoPayR1108A||g.autoPayR1108A.failed||/ticketed|cancelled/.test(g.status))return;
        if(!g.balance||g.balance.paid||!g.due||td<g.due.balance)return;var c=window.kgmChargeByTokenR45&&g.balance.token?window.kgmChargeByTokenR45(g.balance.token):null;if(!c||c.status!=='unpaid')return;
        c.status='paid';c.paidAt=new Date().toISOString();c.card='**** **** **** '+(g.autoPayR1108A.last4||'');c.autoR1108A=1;
        var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===c.pnr})[0];if(b)b.balanceDue=Math.max(0,(+b.balanceDue||0)-c.total);
        g.autoPayR1108A.chargedAt=c.paidAt;(g.history=g.history||[]).push({at:c.paidAt,act:'尾款到期自動扣款 •••• '+(g.autoPayR1108A.last4||''),by:'system'});ch++}catch(_){}});
    if(ch){try{save()}catch(_){}try{if(window.kgmGrpTickR1025B&&window.kgmGrpTickR1025B())render()}catch(_){}}return ch}
  window.kgmGrpAutoChargeR1108A=autoCharge;
  setTimeout(autoCharge,8000);setInterval(autoCharge,30000);   /* 原本的 tick 11 秒起每 60 秒；期限隔天才取消 → 期限當天先扣 */
  /* 我的團體訂位「尾款」步驟：寫扣款日與卡片；更換扣款卡 */
  var IDS2={num:'k38apN2',name:'k38apH2',expM:'k38apM2',expY:'k38apY2',exp:'k38apE2',cvv:'k38apCvv2'};
  window.kgmGrpApCardR1108A=function(id){var g=G(id);if(!g)return;var c=cardVals(IDS2),bad=cardBad(c);
    if(bad.length){alert((z()?'扣款卡還差：':'Still needed: ')+bad.join(z()?'、':', '));return}
    var n=c.num,e=c.exp,h=c.name;CVV38.grpbal2='';try{window.__kgmCardDraft928.grpbal2={}}catch(_){}
    g.autoPayR1108A={mode:'other',last4:lastOf(n),exp:e,holder:h.toUpperCase(),at:new Date().toISOString(),cvvOkR1112A:1};(g.history=g.history||[]).push({at:g.autoPayR1108A.at,act:'更換尾款扣款卡 •••• '+g.autoPayR1108A.last4,by:'customer'});S.grpApEdR1108A=0;
    S.grpMsgR1025B=(z()?'✓ 已更換尾款扣款卡 •••• ':'✓ Balance card updated •••• ')+g.autoPayR1108A.last4;try{save()}catch(_){}try{render()}catch(_){}};
  function payNote(){var id=gid();if(!id)return;var g=G(id);if(!g||!g.balance||g.balance.paid||/ticketed|cancelled/.test(g.status))return;var host=document.querySelector('#app .k25pay');if(!host)return;
    var zh=z(),ap=g.autoPayR1108A,key=id+'|'+JSON.stringify(ap||{})+'|'+(S.grpApEdR1108A?1:0);var ex=host.parentNode.querySelector('.k38ap');if(ex&&ex.getAttribute('data-k')===key)return;if(ex)ex.remove();
    var d=document.createElement('div');d.className='k38ap';d.setAttribute('data-k',key);
    d.innerHTML=(ap?'<b>'+(zh?'尾款自動扣款：':'Auto-charge: ')+E(g.due.balance)+(zh?' 以 ':' on card ')+'•••• '+E(ap.last4||'')+(zh?' 扣 ':' · ')+E((window.kgmFmtR38||function(x){return 'NT$'+Math.round(+x||0).toLocaleString()})(g.balance.amount))+'</b><span>'+(zh?'到期當天自動扣款，不用另外付款；要提前付清可按「付尾款」。':'Charged automatically on the due date.')+'</span>'
        :'<b>'+(zh?'尾款尚未設定自動扣款':'No auto-charge card on file')+'</b><span>'+(zh?'設定扣款卡後，尾款期限當天自動扣款；沒有設定則要在期限前手動付清，逾期自動取消。':'Add a card to charge the balance on the due date.')+'</span>')
      +(S.grpApEdR1108A?cardForm('grpbal2',IDS2,zh?'尾款期限當天才從這張卡扣款，現在不扣。':'Charged on the balance due date, not now.')+'<div class="k38ap-act"><button type="button" class="k25g-btn" onclick="kgmGrpApCardR1108A(\''+E(id)+'\')">'+(zh?'儲存扣款卡':'Save card')+'</button><button type="button" class="k25g-btn ghost" onclick="S.grpApEdR1108A=0;render()">'+(zh?'取消':'Cancel')+'</button></div>'
        :'<button type="button" class="k25g-btn ghost" onclick="S.grpApEdR1108A=1;render()">'+(ap?(zh?'更換扣款卡':'Change card'):(zh?'設定扣款卡':'Add a card'))+'</button>');
    host.parentNode.insertBefore(d,host.nextSibling)}
  try{var Q2=false;new MutationObserver(function(){if(Q2)return;Q2=true;Promise.resolve().then(function(){Q2=false;try{payNote()}catch(_){}})}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
  try{var cs2=document.createElement('style');cs2.textContent='.k38ap-pay{border:1px solid #cfe0d6;background:#f4faf6;border-radius:12px;padding:12px 14px;margin:10px 0;display:flex;flex-direction:column;gap:6px;font-size:13px}.k38ap-pay b{color:#0b3d2e}.k38ap-pay span{color:#5d665f}.k38ap-pay label{display:flex;gap:8px;align-items:center;cursor:pointer}.k38ap-f{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}.k38ap-f .inp{flex:1 1 140px;min-width:120px}.k38ap{border:1px solid #cfe0d6;background:#f4faf6;border-radius:12px;padding:12px 14px;margin:10px 0;display:flex;flex-direction:column;gap:6px;font-size:13px}.k38ap b{color:#0b3d2e}.k38ap span{color:#5d665f}.k38ap .k25g-btn{align-self:flex-start}.k38ap-card{margin-top:6px}.k38ap-card .k923cc{background:#fff}.k38ap-act{display:flex;gap:8px}';document.head.appendChild(cs2)}catch(_){}
  /* G3：任何入口打開包機／自創航班申請表（前置視窗、我的團體訂位上方按鈕、AI）都回到清單層，表單才畫得出來 */
  function wrapCr(){var O=window.kgmCharterOpenR1026C;if(typeof O!=='function'||O.__g38)return;
    var w=function(){try{if(S.view!=='admin'){S.grpViewR1023A=null;S.view='group23'}}catch(_){}return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window.kgmCharterOpenR1026C=w}
  /* ── G6／G6a（使用者：「我的團體訂位整體頁面好亂喔」；圖三：類型被截成「加開包機…」、已撤回的包機跟進行中的混在一起）──
     清單層重排（內容沿用原本各區塊，只換順序與分組）：頁首 → 申請表（有開才有）→ 一排總覽數字 →
     ① 進行中的團體訂位 → ② 包機／自創航班申請（審核中、已核准）→ ③「已結束」收合區（已開票／已取消的團體、已撤回／未核准的申請，一行一筆）。
     類型欄不再截字（整格換行）。明細頁（點進某一團）不動。 */
  var KZ={charter_existing:['包下現有航班（整班）','Charter a scheduled flight'],charter_extra:['加開包機（另加一架）','Extra charter aircraft'],custom:['自創航班','Custom flight']};
  var CRST={pending:['審核中','Under review','#8A5A00','#FFF4E0'],approved:['已核准','Approved','#0B6B48','#E9F5EF'],declined:['未核准','Declined','#9B1C1C','#FDECEC'],cancelled:['已撤回','Withdrawn','#6B6F6C','#F1F2F1']};
  function crChip(st){var x=CRST[st]||[st,st,'#555','#eee'];return '<span class="k38st" style="color:'+x[2]+';background:'+x[3]+'">'+E(z()?x[0]:x[1])+'</span>'}
  /* 1108B B4（使用者：「我的團體訂位也要可以切到其他團體訂位頁面不能只有在這一個定位」）：
     單一團體頁的頁首加「切換團體」：同一個帳號的其他團體（進行中在前、已結束在後）一鍵換過去，不用先回清單。 */
  function myGroups39(){var u=S.user;if(!u)return [];return (S.groupsR1023A||[]).filter(function(g){return g&&g.kind==='v25'&&g.userId===u.id&&!g.mockR1108A})
      .sort(function(a,b){var ea=/ticketed|cancelled/.test(a.status)?1:0,eb=/ticketed|cancelled/.test(b.status)?1:0;return ea-eb||String((a.segs&&a.segs[0]||{}).date||'').localeCompare(String((b.segs&&b.segs[0]||{}).date||''))})}
  window.kgmGrpSwitchR1108B=function(id){if(!id)return;if(id==='__list'){S.grpViewR1023A=null}else{S.grpViewR1023A={id:id};S.grp25Tab=null}S.grpMsgR1025B='';S.grpNmDraftR1108A=null;try{render()}catch(_){}try{window.scrollTo(0,0)}catch(_){}};
  function sw39(h){var cur=S.grpViewR1023A&&S.grpViewR1023A.id,L=myGroups39();if(L.length<2||h.indexOf('class="k25crumb"')<0)return h;var zh=z();
    var stx=function(g){return /ticketed/.test(g.status)?(zh?'已開票':'Ticketed'):/cancelled/.test(g.status)?(zh?'已取消':'Cancelled'):/paid/.test(g.status)&&g.balance&&g.balance.paid?(zh?'已付清':'Paid'):(zh?'待尾款':'Balance due')};
    var opts=L.map(function(g){var s0=(g.segs&&g.segs[0])||{};return '<option value="'+E(g.id)+'"'+(g.id===cur?' selected':'')+'>'+E(g.id)+'・'+E(g.name||'')+'・'+E(s0.fr||'')+'→'+E(s0.to||'')+' '+E(String(s0.date||'').slice(5).replace('-','/'))+'・'+(g.pax||0)+(zh?' 位・':' pax · ')+stx(g)+'</option>'}).join('');
    var i=L.map(function(g){return g.id}).indexOf(cur),prev=i>0?L[i-1]:null,next=i>=0&&i<L.length-1?L[i+1]:null;
    var bar='<div class="k39sw"><label>'+(zh?'切換團體（共 '+L.length+' 團）':'Switch group ('+L.length+')')+'</label><select class="inp" onchange="kgmGrpSwitchR1108B(this.value)">'+opts+'<option value="__list">'+(zh?'← 回到全部團體清單':'← All groups')+'</option></select>'
      +'<button type="button" class="btn btn-o" '+(prev?'onclick="kgmGrpSwitchR1108B(\''+E(prev.id)+'\')"':'disabled')+'>‹ '+(zh?'上一團':'Prev')+'</button><button type="button" class="btn btn-o" '+(next?'onclick="kgmGrpSwitchR1108B(\''+E(next.id)+'\')"':'disabled')+'>'+(zh?'下一團':'Next')+' ›</button></div>';
    var a=h.indexOf('class="k25crumb"'),e=h.indexOf('</div>',a);if(e<0)return h;return h.slice(0,e+6)+bar+h.slice(e+6)}
  try{var cs39=document.createElement('style');cs39.textContent='.k39sw{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin:10px 0 4px;padding:10px 14px;background:#F6F9F7;border:1px solid #E1E8E4;border-radius:12px}.k39sw label{font-size:12.5px;font-weight:800;color:#0B3D2E}.k39sw select{flex:1 1 360px;min-width:0;height:38px}.k39sw .btn{padding:8px 14px;font-size:13px}.k39sw .btn[disabled]{opacity:.4;cursor:not-allowed}'
    +'.k39gs{text-align:center;padding:34px 28px}.k39gs small{font:800 10.5px system-ui,sans-serif;letter-spacing:.2em;color:#B08A3E}.k39gs h2{font:700 26px Georgia,"Noto Serif TC",serif;color:#0B3D2E;margin:8px 0}.k39gs p{color:#5E6863;font-size:14px;line-height:1.6}.k39gs b{display:inline-block;margin-top:6px;font-size:18px;color:#0B3D2E}';document.head.appendChild(cs39)}catch(_){}
  function wrapGV(){var O=window.kgmGroupViewR1023A;if(typeof O!=='function'||O.__g38)return;
    var w=function(){var h=O.apply(this,arguments);try{if(S.view!=='admin'&&S.grpViewR1023A&&typeof h==='string')return sw39(h)}catch(e){try{console.warn('g39 sw',e)}catch(_){}}
      try{if(S.view==='admin'||S.grpViewR1023A||typeof h!=='string'||h.indexOf('k25list')<0)return h;
        var zh=z(),box=document.createElement('div');box.innerHTML=h;var root=box.querySelector('.k25g')||box;
        var top=root.querySelector('.k25top'),msgs=[].slice.call(root.querySelectorAll('.k25g-msg')).filter(function(m){return !m.closest('article')}),form=root.querySelector('#k27cr-form');
        var cards=[].slice.call(root.querySelectorAll('.k25gc')),arts=[].slice.call(root.querySelectorAll('.k27cr-list article'));
        var gOf=function(el){var m=/id:\\?'([^'\\]+)\\?'/.exec(el.getAttribute('onclick')||'')||/id:'([^']+)'/.exec(el.getAttribute('onclick')||'');return m?G(m[1]):null};
        var actG=[],endG=[];cards.forEach(function(c){var g=gOf(c);(g&&/ticketed|cancelled/.test(g.status)?endG:actG).push(c)});
        var u=S.user,reqs=(S.charterReqsR1026C||[]).filter(function(r){return r&&u&&r.userId===u.id});
        var actA=[],endR=[];arts.forEach(function(a,i){var idb=a.querySelector('.k30cr-facts b.mono'),rid=idb?String(idb.textContent).trim():'',r=reqs.filter(function(x){return x.id===rid})[0]||reqs[i];if(r&&/cancelled|declined/.test(r.status))endR.push(r);else actA.push(a)});
        actA.forEach(function(a){[].slice.call(a.querySelectorAll('.k30cr-facts > div')).forEach(function(d){var sm=d.querySelector('small');if(sm&&/類型|Type/.test(sm.textContent))d.classList.add('k38type')})});
        var out='<div class="k25g k38gl">'+(top?top.outerHTML:'')+msgs.map(function(m){return m.outerHTML}).join('')+(form?form.outerHTML:'');
        var nAct=actG.length,nReq=actA.length,nEnd=endG.length+endR.length;
        out+='<div class="k38sum"><div><b>'+nAct+'</b><span>'+(zh?'進行中的團體':'Active groups')+'</span></div><div><b>'+nReq+'</b><span>'+(zh?'包機／自創申請中':'Charter requests')+'</span></div><div><b>'+nEnd+'</b><span>'+(zh?'已結束':'Closed')+'</span></div></div>';
        out+='<section class="k38sec"><h3>'+(zh?'進行中的團體訂位':'Active group bookings')+'</h3>'+(nAct?actG.map(function(c){return c.outerHTML}).join(''):'<div class="k25empty"><b>'+(zh?'目前沒有進行中的團體訂位':'No active group bookings')+'</b><span>'+(zh?'用上方「＋ 一般航班團體訂位」或首頁訂票卡的「團體訂位」分頁開始。':'Start from the Group tab on the home booking card.')+'</span></div>')+'</section>';
        if(nReq)out+='<section class="k38sec k27cr-list"><h3>'+(zh?'包機／自創航班申請':'Charter & custom flight requests')+'</h3>'+actA.map(function(a){return a.outerHTML}).join('')+'</section>';
        if(nEnd){var rows=endG.map(function(c){return c.outerHTML}).join('')
            +endR.map(function(r){var k=KZ[r.kind]||[r.kind,r.kind];return '<div class="k38end"><div class="k38end-n"><b>'+E(r.name||r.id)+'</b><small class="mono">'+E(r.id)+'</small></div><div>'+E(zh?k[0]:k[1])+'</div><div class="mono">'+E(r.fr)+' → '+E(r.to)+'</div><div>'+E(r.date||'')+'</div><div>'+(+r.pax||0)+(zh?' 位':' pax')+'</div><div>'+crChip(r.status)+(r.status==='declined'&&r.declineWhy?'<small class="k38why">'+E(r.declineWhy)+'</small>':'')+'</div></div>'}).join('');
          out+='<details class="k38sec k38done"'+(S.grpEndOpenR1108A?' open':'')+' ontoggle="S.grpEndOpenR1108A=this.open"><summary>'+(zh?'已結束（已開票／已取消的團體、已撤回／未核准的申請）':'Closed (ticketed / cancelled groups, withdrawn / declined requests)')+' · '+nEnd+'</summary>'+rows+'</details>'}
        return out+'</div>'}catch(e){try{console.warn('g38 list',e)}catch(_){}}return h};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g38=1;window.kgmGroupViewR1023A=w;try{kgmGroupViewR1023A=w}catch(_){}}
  try{var cs3=document.createElement('style');cs3.textContent='.k38gl .k38sum{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0 4px}.k38gl .k38sum div{background:#fff;border:1px solid #E3E9E5;border-radius:12px;padding:12px 16px;display:flex;align-items:baseline;gap:10px}.k38gl .k38sum b{font-size:22px;color:#0B3D2E}.k38gl .k38sum span{font-size:12.5px;color:#5E6863}'
    +'.k38gl .k38sec{margin:18px 0 0}.k38gl .k38sec>h3{font-size:15px;color:#0B3D2E;margin:0 0 8px;font-weight:800}.k38gl .k27cr-list article{margin-bottom:10px}.k38gl .k30cr-facts .k38type b{white-space:normal!important;overflow:visible!important;text-overflow:clip!important}.k38gl .k30cr-facts{grid-template-columns:minmax(96px,.8fr) minmax(170px,1.3fr) minmax(150px,1.7fr) minmax(150px,1.5fr) minmax(70px,.6fr)!important}.k38gl .k30cr-facts>div{min-width:0}@media(max-width:760px){.k38gl .k30cr-facts{grid-template-columns:1fr 1fr!important}}'
    +'.k38gl details.k38done{background:#fff;border:1px solid #E3E9E5;border-radius:14px;padding:4px 16px}.k38gl details.k38done>summary{cursor:pointer;padding:12px 0;font-size:13.5px;font-weight:700;color:#5E6863}.k38gl details.k38done .k25gc{opacity:.85}'
    +'.k38end{display:grid;grid-template-columns:2fr 1.6fr 1fr 1fr .6fr 1.2fr;gap:10px;align-items:center;padding:10px 0;border-top:1px solid #EEF2EF;font-size:13px;color:#33403A}.k38end-n b{display:block;color:#0B3D2E}.k38end-n small{color:#8A948F}.k38end .k38why{display:block;color:#9B1C1C;font-size:11.5px;margin-top:2px}.k38end-n small{display:block;font-size:11.5px}.k38st{display:inline-block;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px}'
    +'@media(max-width:760px){.k38gl .k38sum{grid-template-columns:1fr 1fr 1fr}.k38end{grid-template-columns:1fr 1fr}.k38end-n{grid-column:1/-1}}';document.head.appendChild(cs3)}catch(_){}
  /* ── N8（使用者：「寵物同行和團體定位都要 mock data」）：模擬資料，開頁時補一次（固定編號、已有就不再補；兩個分頁同時開也不會重複）。
     · 寵物：未來 1–14 天桃園出發的自營航班 8 件申請（審核中／客服查證中／待 CEO／已核准／不同意；客艙、托運、服務犬），mockR1108A＋simR1101A（持續模擬會往下處理）。
       旅客／座位在航班資料第一次畫這一班座位圖時綁到那班的模擬旅客（kgmPetBindR1108A），之後座位圖與寵物表都讀同一份。
     · 團體：6 個模擬旅行社的團體（待付訂金／已付訂金／已付清／已開票／已取消）＋3 件包機／自創申請；不佔真實座位（沒有訂位），寄信一律略過。 */
  function h32(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function opOn(f,d){var ds=String(f.days||'daily');if(ds==='daily')return true;var wd=new Date(d+'T00:00:00Z').getUTCDay()||7;return ds.split(',').map(function(x){return +x}).indexOf(wd)>=0}
  function addDays38(d,n){var x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
  function flightsFrom(base,n,salt){var L=[];try{L=(FLIGHTS||[]).filter(function(f){return f&&!f.partner&&!f.codeshare&&!f.via&&/^KX\d+$/.test(f.code)&&f.fr==='TPE'})}catch(_){}if(!L.length)return [];
    var out=[],used={};for(var i=0;out.length<n&&i<n*20;i++){var f=L[h32(salt+i)%L.length],d=addDays38(base,1+(h32(salt+'d'+i)%14));if(used[f.code+d]||!opOn(f,d))continue;used[f.code+d]=1;out.push({f:f,d:d})}return out}
  var PETS38=[['dog','MOCHI','柴犬',7.5,'cabin','received'],['cat','LULU','英國短毛貓',4.2,'cabin','ceo_review'],['dog','BOBO','黃金獵犬',31,'hold','closed_ok'],['service','RIVER','拉布拉多（導盲犬）',28,'service','closed_ok'],
    ['cat','MIMI','米克斯',3.8,'cabin','investigating'],['dog','DOUDOU','法國鬥牛犬',11,'hold','closed_no'],['dog','COCO','貴賓犬',5.1,'cabin','closed_ok'],['cat','NANA','布偶貓',6.4,'cabin','ceo_review']];
  var NAMES38=[['CHEN','YI-HSUAN'],['LIN','CHIA-HAO'],['WANG','MEI-LING'],['HUANG','PO-WEI'],['CHANG','SHU-FEN'],['LEE','TZU-YU'],['WU','CHENG-EN'],['TSAI','HSIN-YI']];
  function seedPets(){var L=S.staffCasesR1007A=S.staffCasesR1007A||[];if(L.some(function(c){return c&&c.mockR1108A}))return 0;var t=Tday(),fl=flightsFrom(t,PETS38.length,'pet38'),n=0;
    fl.forEach(function(x,i){var P=PETS38[i],nm=NAMES38[i],no='KG9'+String(100+i)+t.slice(5).replace('-','')+t.slice(2,4)+'M',at=new Date(Date.now()-((i+1)*7*3600e3)).toISOString(),f=x.f;if(L.some(function(c){return c&&c.caseNo===no}))return;
      var fee=P[4]==='service'?0:(P[4]==='hold'?150:100),st=P[5]==='closed_ok'||P[5]==='closed_no'?'closed':P[5];
      var c={caseNo:no,pnr:'',type:'pet',status:st,priority:'normal',paxIndex:0,paxName:nm[0]+' / '+nm[1],segment:{code:f.code,fr:f.fr,to:f.to,date:x.d,key:'out'},segments:[{code:f.code,fr:f.fr,to:f.to,date:x.d,dep:f.dep,key:'out',fee:fee,seat:'',seatShown:'',seatFee:0}],
        detail:'寵物同行申請：'+({dog:'狗',cat:'貓',service:'服務犬'}[P[0]])+'「'+P[1]+'」・'+P[2]+'・'+P[3]+' kg・'+({cabin:'客艙',hold:'托運',service:'客艙（服務犬）'}[P[4]])+'。航段：'+f.code+' '+f.fr+'→'+f.to+' '+x.d.slice(5)+'（模擬資料）',
        pet:{species:P[0],name:P[1],breed:P[2],kg:P[3],mode:P[4],fee:fee,total:fee,docs:true,seats:{}},files:[],createdAt:at,updatedAt:at,by:{empId:'',name:nm[1]+' '+nm[0],role:'passenger'},assignee:{empId:'',name:''},userId:null,email:'',
        typeLabelR1101A:'寵物同行申請',paxR1101A:1,simR1101A:1,mockR1108A:1,progress:[{at:at,status:'received',label:'旅客線上申請（系統依 KGM-PET-009 預審通過）',by:'旅客'}],notes:[]};
      if(st!=='received')c.progress.push({at:at,status:'investigating',label:'客服專員核對疫苗、晶片與健康證明',by:'客服中心（模擬）'});
      if(st==='ceo_review'||st==='closed')c.progress.push({at:at,status:'ceo_review',label:'客服確認文件齊全，送執行長核准',by:'客服中心（模擬）'});
      if(P[5]==='closed_ok'){c.closedAt=at;c.decisionR1101A={ok:true,by:'CEO（模擬）',at:at};c.progress.push({at:at,status:'closed',label:'核准寵物同行',by:'CEO（模擬）'})}
      if(P[5]==='closed_no'){c.closedAt=at;c.decisionR1101A={ok:false,deny:true,by:'CEO（模擬）',at:at,why:'短鼻犬種（法國鬥牛犬）依 KGM-PET-009 不受理貨艙托運'};c.progress.push({at:at,status:'closed',label:'不同意寵物同行',note:c.decisionR1101A.why,by:'CEO（模擬）'})}
      L.push(c);n++});return n}
  /* 第一次畫這一班的座位圖：把這班的模擬寵物申請綁到一位模擬旅客（客艙寵物要坐經濟艙靠窗；托運只綁旅客） */
  window.kgmPetBindR1108A=function(k,m){try{var q=String(k).split('|'),code=q[0],date=q[1],ch=0;if(!m||!m.length)return;
      (S.staffCasesR1007A||[]).forEach(function(c){if(!c||!c.mockR1108A||c.type!=='pet'||c.mockBoundR1108A)return;var sg=(c.segments||[])[0]||{};if(sg.code!==code||sg.date!==date)return;
        var cand=m.filter(function(p){return p&&p.seat&&p.pnr&&!(S.bookings||[]).some(function(b){return b&&b.pnr===p.pnr})&&/^\d+[AK]$/.test(String(p.seat))&&+String(p.seat).replace(/\D/g,'')>=20});if(!cand.length)cand=m.filter(function(p){return p&&p.seat&&p.pnr});if(!cand.length)return;
        var p=cand[h32(c.caseNo)%cand.length];c.pnr=p.pnr;c.paxName=String(p.name||c.paxName);if(c.pet&&c.pet.mode!=='hold'){sg.seat=p.seat;sg.seatShown=p.seat}c.segment.seat=sg.seat;c.mockBoundR1108A=1;ch++});
      if(ch)try{save()}catch(_){}}catch(_){}};
  var AG38=[['星辰旅行社（模擬）','24536806','交觀甲 7316','林雅婷'],['海洋假期旅行社（模擬）','53212539','交觀甲 6021','陳俊宏'],['綠光企業福委會（模擬）','12345675','','張淑芬'],['青春學園國際交流（模擬）','80394512','','黃柏翰'],['樂遊國際旅行社（模擬）','27938172','交觀甲 5590','吳承恩'],['日光商旅（模擬）','42796510','交觀乙 2213','蔡心怡']];
  var GR38=[['北海道雪祭 6 日',32,'deposit_paid'],['京阪神賞楓 5 日',24,'paid'],['員工旅遊・沖繩 4 日',58,'deposit_paid'],['畢業旅行・首爾 5 日',41,'quoted'],['曼谷芭達雅 5 日',18,'ticketed'],['東京自由行團 6 日',12,'cancelled']];
  function seedGroups(){var L=S.groupsR1023A=S.groupsR1023A||[];if(L.some(function(g){return g&&g.mockR1108A}))return 0;var t=Tday(),n=0,fl=flightsFrom(addDays38(t,20),GR38.length,'grp38');
    fl.forEach(function(x,i){var A=AG38[i],R=GR38[i],f=x.f,d=addDays38(x.d,25),ret=addDays38(d,5),id='GRP'+t.slice(2,4)+t.slice(5,7)+'-M'+(i+1);if(L.some(function(g){return g&&g.id===id}))return;
      var back=null;try{back=(FLIGHTS||[]).filter(function(y){return y&&!y.partner&&y.fr===f.to&&y.to==='TPE'&&!y.via})[0]}catch(_){}
      var per=Math.round((9000+(h32(id)%9000))/10)*10,tot=per*R[1],dep=Math.round(tot*0.1),bd=addDays38(d,-21),nd=addDays38(d,-28),at=new Date(Date.now()-(i+2)*86400e3).toISOString(),st=R[2];
      var segs=[{key:'out',code:f.code,fr:f.fr,to:f.to,date:d,dep:f.dep,arr:f.arr,cls:'E-G'}].concat(back?[{key:'inb',code:back.code,fr:back.fr,to:back.to,date:ret,dep:back.dep,arr:back.arr,cls:'E-G'}]:[]);
      var g={kind:'v25',id:id,createdAt:at,status:st,name:R[0],type:i===2?'corporate':(i===3?'school':'tour'),leader:A[3],leaderPhone:'09'+String(10000000+h32(id+'p')%89999999),notes:'',userId:'MOCKAG'+(i+1),company:A[0],taxId:A[1],license:A[2],caseNo:'GA-M'+(i+1),
        contact:{name:A[3],phone:'02-2'+String(1000000+h32(id+'t')%8999999),email:''},pnr:'M'+String(h32(id)%100000).padStart(5,'0'),adults:R[1],children:0,infants:0,pax:R[1],pax0:R[1],reduced:0,plan:'G',adj:0,fees:[],moved:[],segs:segs,cabin:'Economy',total:tot,curr:'TWD',perSeat:per,
        deposit:{amount:dep,paid:st!=='quoted',paidAt:st!=='quoted'?at:null,due:st==='quoted'?addDays38(t,5):undefined},balance:{amount:tot-dep,paid:/paid|ticketed/.test(st)&&st!=='deposit_paid',due:bd,reminders:[]},due:{balance:bd,names:nd},names:[],history:[{at:at,act:'團體訂位成立（模擬資料）',by:'system'}],
        legs:segs.map(function(s){return {code:s.code,fr:s.fr,to:s.to,date:s.date,dep:s.dep,arr:s.arr}}),mockR1108A:1};
      if(st==='ticketed'){g.names=[];for(var j=0;j<R[1];j++){var nm=NAMES38[j%NAMES38.length];g.names.push({last:nm[0],first:nm[1]+(j>=NAMES38.length?'-'+j:''),gender:j%2?'F':'M',dob:'19'+(70+j%30)+'-0'+(1+j%9)+'-1'+(j%9),passport:'3'+String(10000000+h32(id+j)%89999999),nat:'TW',type:'ADT'})}g.ticketedAt=at;g.split=g.names.map(function(x,j){return {pnr:'M'+String(h32(id+'s'+j)%100000).padStart(5,'0'),name:x.last+'/'+x.first,ticket:'297'+String(1000000000+h32(id+'k'+j)%8999999999).slice(0,10),seat:''}})}
      if(st==='paid'){g.names=[];for(var j2=0;j2<Math.floor(R[1]*0.6);j2++){var nm2=NAMES38[j2%NAMES38.length];g.names.push({last:nm2[0],first:nm2[1]+(j2>=NAMES38.length?'-'+j2:''),gender:j2%2?'F':'M',dob:'1988-0'+(1+j2%9)+'-20',passport:'3'+String(10000000+h32(id+j2)%89999999),nat:'TW',type:'ADT'})}}
      if(st==='cancelled'){g.cancelWhy='balance';g.history.push({at:at,act:'尾款逾期，自動取消並釋出座位（模擬資料）',by:'system'})}
      L.push(g);n++});
    var R2=S.charterReqsR1026C=S.charterReqsR1026C||[];if(!R2.some(function(r){return r&&r.mockR1108A})){var mk=function(id,kind,st,fr,to,d,pax,ag,extra){return Object.assign({id:id,kind:kind,status:st,userId:'MOCKAG'+ag,name:AG38[ag-1][0].replace('（模擬）','')+' '+(kind==='custom'?'自創航班':'包機'),company:AG38[ag-1][0],fr:fr,to:to,date:d,retDate:addDays38(d,4),pax:pax,paxRet:pax,type:kind==='custom'?'A21N':'A359',plan:'G',createdAt:new Date().toISOString(),history:[{at:new Date().toISOString(),act:'送出申請（模擬資料）',by:'customer'}],mockR1108A:1},extra||{})};
      R2.push(mk('CRM-01','charter_existing','pending','TPE','OKA',addDays38(t,200),180,1),mk('CRM-02','custom','pending','TPE','HKT',addDays38(t,110),150,5),mk('CRM-03','charter_extra','declined','TPE','KIX',addDays38(t,190),160,2,{declineWhy:'該日關西機場時段已滿（模擬資料）'}));n+=3}
    return n}
  function seedMock(){try{if(!S||!Array.isArray(S.bookings))return;var a=seedPets(),b=seedGroups();if(a||b){try{save()}catch(_){}}window.KGM_MOCK_R1108A={pets:a,groups:b}}catch(e){try{console.warn('g38 mock',e)}catch(_){}}}
  setTimeout(seedMock,9000);
  function hook(){wrapGV();wrapCr();wrapSave();wrapPaste();wrapV('myTripView');wrapV('manageView');wrapN();wrapPay();wrapDoPay();wrapSucc39()}
  hook();[0,100,4600,6000,12000,30000].forEach(function(t){setTimeout(hook,t)});
  setInterval(function(){try{if(!(window.myTripView&&window.myTripView.__g38)||!(window.manageView&&window.manageView.__g38)||!(window.kgmNotify&&window.kgmNotify.__g38)||!(window.successView&&window.successView.__g39))hook()}catch(_){}},5000);   /* 後面有層再包一次就再包回來 */
})();
