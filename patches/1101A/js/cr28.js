
/* ══ 1101A：包機／自創航班改成「報價 → 客戶接受或拒絕」（使用者 Round 2）══════════════════
   「資料輸入頁選一些需要的資料回傳到後台，成立後後台案件那裡要可以給這案件一個報價，這個報價會回傳到買家那裡，不二價，可以接受或是拒絕 Offer，
    有七天的決定權（如果可能離規定時間只剩下三天就只有三天的決定時間）；確認接受後就要立即付尾款，後台要先自動帶入價錢但也要可以改。
    包機和自創航班要立即付尾款，名單必須一起填寫完成，但到起飛前十四天都還可以改，起飛前十四天後後台系統要自動開票給確認的名單。
    用戶端申請的包機無法提出機型更換訴求，自創航班可以提出（只能換大不能換小），在起飛前 21 天本公司會確認。
    自創航班也要考慮到回程一部分的價錢，因為多數都是單程。假如是 TPE-NRT，該日回程可以多開一班（例如 KX3181 NRT-TPE）開放預訂，要有這個選項。」
   做法（沿用 1026C cr27 的申請、可用飛機、建立航班、團體訂位，不另做一套）：
   · 後台「核准・建立航班」改成「送出報價」：價錢預先帶入（cr27 的報價合計；單程自創航班＋空機回程分攤 40%），可改；可勾「空機回程開放一般旅客訂購」。
     報價存在申請單 r.quoteR1101A（選的飛機方案也存起來），狀態 quoted；決定期限＝7 天，離申請期限（包機 183 天、自創 90 天）不到 7 天就只有 3 天。
   · 前台申請單：接受（要一起貼上全體旅客名單）→ 用存下的方案執行原本的核准（建立航班、團體訂位），金額改成報價、訂金改成全額立即付款、名單寫進去；
     開票時間＝起飛前 14 天（之前名單可改；之後自動開票給確認的名單）；拒絕 → 狀態 rejected；逾期 → expired。
   · 自創航班核准後，前台可申請換大機型（只列座位比現在多的機型），後台確認（起飛前 21 天前）；核准就換機型（setFlightAcftOnDate，跟 AI 換機同一條路）。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}}
  function days(a,b){return Math.round((Date.parse(b+'T12:00:00')-Date.parse(a+'T12:00:00'))/86400000)}
  function M(v){return 'NT$'+Math.round(+v||0).toLocaleString()}
  function R(){return S.charterReqsR1026C=S.charterReqsR1026C||[]}
  function req(id){return R().filter(function(x){return x&&x.id===id})[0]||null}
  function who(){return (S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'desk'}
  function save1(){try{save()}catch(_){}}
  function mail(ev,r,msg){try{if(typeof kgmNotify!=='function')return;var u=(S.users||[]).filter(function(x){return x&&x.id===r.userId})[0]||{};Promise.resolve(kgmNotify(ev,{email:u.email||'',name:u.name||'',caseNo:r.id,message:msg})).catch(function(){})}catch(_){}}
  var LEAD={charter_existing:183,charter_extra:183,custom:90};
  function until(r){var dl=AD(r.date,-(LEAD[r.kind]||90)),left=days(T(),dl);return AD(T(),left>=7?7:3)}
  var A0=window.kgmCharterApproveR1026C;
  /* ── 後台：送出報價 ── */
  window.kgmCharterQuoteR1101A=function(id){var r=req(id);if(!r||r.status!=='pending')return;var zh=z();
    var amt=Math.round(+String((document.getElementById('k28q-amt-'+id)||{}).value||'').replace(/[^\d.]/g,'')||0),op=!!((document.getElementById('k28q-open-'+id)||{}).checked),base=+((document.getElementById('k28q-amt-'+id)||{}).getAttribute('data-base')||0);
    if(!(amt>0)){S.k27cdMsg=zh?'請填報價金額。':'Enter the quote.';try{render()}catch(_){}return}
    var u=until(r);r.quoteR1101A={amount:amt,base:base,openFerry:op,picks:JSON.parse(JSON.stringify((S.k27crPick||{})[id]||{})),at:new Date().toISOString(),by:who(),until:u};
    r.status='quoted';(r.history=r.history||[]).push({at:r.quoteR1101A.at,act:(zh?'送出報價 ':'Quoted ')+M(amt)+(zh?'（回覆期限 '+u+'）':''),by:who()});
    S.notifs=S.notifs||[];S.notifs.unshift({title:(zh?'包機／自創航班報價 ':'Charter quote ')+r.id,message:(zh?'報價 '+M(amt)+'（不二價），請於 '+u+' 前在「我的團體訂位 › 包機／自創航班申請」接受或拒絕；接受時需一併提供全體旅客名單並立即付清。':'Quote '+M(amt)+'; respond by '+u),date:T(),read:false,userId:r.userId});
    mail('group.charter_quoted',r,(zh?'您的'+(r.kind==='custom'?'自創航班':'包機')+'申請 '+r.id+' 報價 '+M(amt)+'（不二價），請於 '+u+' 前回覆。':'Quote '+M(amt)));
    try{logAct(zh?'包機報價':'Charter quote',r.id+' '+M(amt))}catch(_){}S.k27cdMsg=(zh?'✓ 已送出報價 ':'✓ Quoted ')+r.id+' · '+M(amt);save1();try{render()}catch(_){}};
  if(typeof A0==='function'&&!A0.__r28){var a28=function(id){var r=req(id);if(r&&r.status==='pending'&&S.view==='admin'&&!window.__k28accept)return window.kgmCharterQuoteR1101A(id);return A0.apply(this,arguments)};a28.__r28=1;window.kgmCharterApproveR1026C=a28}
  /* ── 前台：接受／拒絕 ── */
  function parseNames(t,n){var L=String(t||'').split(/\r?\n/).map(function(l){return l.trim()}).filter(Boolean),out=[],bad=[];
    L.forEach(function(l,i){var p=l.split(/\s*[\/,]\s*/);var last=String(p[0]||'').toUpperCase().replace(/[^A-Z\- ]/g,''),first=String(p[1]||'').toUpperCase().replace(/[^A-Z\- ]/g,''),mem=String(p[2]||'').trim().toUpperCase();if(!last||!first)bad.push(i+1);out.push({last:last,first:first,member:mem})});
    return {list:out,bad:bad,ok:!bad.length&&out.length===n}}
  window.kgmCharterAcceptR1101A=function(id){var r=req(id),zh=z();if(!r||r.status!=='quoted'||!r.quoteR1101A)return;var Q=r.quoteR1101A;
    if(T()>Q.until){r.status='expired';save1();try{render()}catch(_){}return}
    var nm=parseNames((document.getElementById('k28q-names-'+id)||{}).value,r.pax);
    if(!nm.ok){S.k27crMsg=zh?('接受報價要一起提供全體 '+r.pax+' 位旅客名單（每行一位：姓/名，可加 /KGM 會員卡號）；目前 '+nm.list.length+' 行'+(nm.bad.length?'，第 '+nm.bad.slice(0,6).join('、')+' 行格式不對':'')+'。'):'Provide all names.';try{render()}catch(_){}return}
    if(!confirm(zh?('接受報價 '+M(Q.amount)+'？確認後立即付清全額，系統建立航班與團體訂位；名單到起飛前 14 天都還可以改，之後自動開票。'):'Accept and pay '+M(Q.amount)+'?'))return;
    S.k27crPick=S.k27crPick||{};S.k27crPick[id]=Q.picks||{};var c0=window.confirm;window.confirm=function(){return true};window.__k28accept=1;
    /* 1101A：原本的核准只接受 pending → 暫時改回 pending 再呼叫，失敗就還原成 quoted */
    var m0=S.k27crMsg,d0m=S.k27cdMsg;S.k27crMsg='';S.k27cdMsg='';r.status='pending';
    try{A0.call(window,id)}catch(e){S.k27crMsg=String(e&&e.message||e)}finally{window.confirm=c0;window.__k28accept=0}
    if(r.status!=='approved'){var why=S.k27cdMsg||S.k27crMsg||'';S.k27cdMsg=d0m;if(r.status==='pending')r.status='quoted';S.k27crMsg=(zh?'目前無法建立航班（可能飛機已被排走），請聯絡團體業務':'Could not create the flight')+(why?(zh?'：':': ')+why:'');save1();try{render()}catch(_){}return}
    S.k27crMsg=m0;S.k27cdMsg=d0m;
    try{var g=(S.groupsR1023A||[]).filter(function(x){return x&&x.id===r.groupId})[0],b=g&&(S.bookings||[]).filter(function(x){return x&&x.pnr===g.pnr})[0];
      if(g&&b){try{if(g.deposit&&g.deposit.chargeId&&window.kgmVoidChargeR45)window.kgmVoidChargeR45(g.deposit.chargeId)}catch(_){}
        g.total=Q.amount;b.total=Q.amount;b.fareComponent=Q.amount;g.perSeat=Math.round(Q.amount/Math.max(1,g.pax));g.balance=Object.assign({},g.balance||{},{amount:0,paid:false});g.fullPayR1101A=1;
        var ch=null;try{ch=window.kgmCreateChargeR45({pnr:b.pnr,items:[{label:(zh?'包機／自創航班全額 · ':'Charter full payment · ')+g.id,amount:Q.amount}],note:zh?'接受報價後立即付清':'Pay now'})}catch(_){}
        g.deposit={amount:Q.amount,paid:false,due:T(),chargeId:ch&&ch.charge&&ch.charge.id,token:ch&&ch.charge&&ch.charge.token};g.status='quoted';
        var d0=(r.flights&&r.flights[0]&&r.flights[0].date)||r.date;g.ticketFromR1101A=AD(d0,-14);g.due=Object.assign({},g.due||{},{names:AD(d0,-14),balance:T()});
        g.names=nm.list.map(function(n,i){return {last:n.last,first:n.first,gender:'',dob:'',passport:'',type:'ADT',member:n.member}});
        (b.paxList||[]).forEach(function(p,i){var n=nm.list[i];if(n){p.lastName=n.last;p.firstName=n.first;p.groupNameTbaR1023A=false;if(n.member)p.kgmMemberR1101A=n.member}});
        (g.history=g.history||[]).push({at:new Date().toISOString(),act:(zh?'接受報價 ':'Quote accepted ')+M(Q.amount)+(zh?'，名單 '+nm.list.length+' 位；開票日 '+g.ticketFromR1101A:''),by:'customer'});
        if(Q.openFerry){(S.customFlights||[]).forEach(function(f){if(f&&f.charterR1026C===r.id&&f.ferryR1026C){f.ferryR1026C=false;f.noSaleR913=false;f.publicReturnR1101A=true;(r.history=r.history||[]).push({at:new Date().toISOString(),act:(zh?'空機回程開放一般旅客訂購：':'Open for sale: ')+f.code+' '+f.fr+'→'+f.to,by:'system'})}})}
        r.quote=Q.amount;r.acceptedAt=new Date().toISOString();(r.history=r.history||[]).push({at:r.acceptedAt,act:zh?'申請人接受報價':'Quote accepted',by:'customer'});
        mail('group.charter_approved',r,(zh?'已接受報價 '+M(Q.amount)+'，航班 '+(r.flights||[]).map(function(m){return m.code+' '+m.fr+'→'+m.to+' '+m.date}).join('；')+'；請立即付清。名單起飛前 14 天（'+g.ticketFromR1101A+'）前可修改，之後自動開票。':'Accepted'));
        save1();try{render()}catch(_){}if(g.deposit.token&&window.kgmOpenPayR45)setTimeout(function(){try{window.kgmOpenPayR45(g.deposit.token)}catch(_){}},200)}}catch(e){try{console.warn('cr28 accept',e)}catch(_){}}};
  window.kgmCharterRejectR1101A=function(id){var r=req(id),zh=z();if(!r||r.status!=='quoted')return;if(!confirm(zh?'拒絕這份報價？申請會結案。':'Decline this quote?'))return;
    r.status='rejected';(r.history=r.history||[]).push({at:new Date().toISOString(),act:zh?'申請人拒絕報價':'Quote declined',by:'customer'});
    try{kgmNotify('internal.group_request',{email:'groups@kgm-airways.com',caseNo:r.id,message:(zh?'申請人拒絕報價：':'Quote declined: ')+r.id})}catch(_){}save1();try{render()}catch(_){}};
  /* ── 自創航班換大機型 ── */
  function seatsOf(t){try{var n=0;(window.seatSections7(t)||[]).forEach(function(s){(s.rows||[]).forEach(function(r){(r.cells||[]).forEach(function(c){if(c&&c.id)n++})})});return n}catch(_){return 0}}
  var TYPES=['A21N','B78X','B789','B779','A359','A35K','A339R','A339L','A388'];
  window.kgmCharterUpsizeR1101A=function(id){var r=req(id),zh=z();if(!r||r.kind!=='custom'||r.status!=='approved')return;var t=String((document.getElementById('k28q-up-'+id)||{}).value||'');if(!t)return;
    r.upsizeR1101A={type:t,from:(r.flights[0]||{}).type,at:new Date().toISOString(),status:'requested',confirmBy:AD(r.date,-21)};(r.history=r.history||[]).push({at:r.upsizeR1101A.at,act:(zh?'申請換大機型 ':'Upsize request ')+t,by:'customer'});
    try{kgmNotify('internal.group_request',{email:'groups@kgm-airways.com',caseNo:r.id,message:(zh?'自創航班申請換大機型：':'Upsize: ')+r.id+' → '+t})}catch(_){}save1();try{render()}catch(_){}};
  window.kgmCharterUpsizeOkR1101A=function(id,ok){var r=req(id),zh=z();if(!r||!r.upsizeR1101A||r.upsizeR1101A.status!=='requested')return;var U=r.upsizeR1101A,res=[];
    if(ok){(r.flights||[]).forEach(function(m){try{var x=window.setFlightAcftOnDate?window.setFlightAcftOnDate(m.code,m.date,U.type):null;res.push(m.code+(x&&x.ok?' ✓':' ✗ '+((x&&x.why)||'')));if(x&&x.ok)m.type=U.type}catch(e){res.push(m.code+' ✗')}})}
    U.status=ok?'approved':'declined';U.doneAt=new Date().toISOString();U.by=who();U.result=res.join('；');(r.history=r.history||[]).push({at:U.doneAt,act:(ok?(zh?'核准換機型 ':'Upsize approved '):(zh?'不核准換機型 ':'Upsize declined '))+U.type+(res.length?'（'+U.result+'）':''),by:who()});
    S.notifs=S.notifs||[];S.notifs.unshift({title:(zh?'換機型申請結果 ':'Upsize ')+r.id,message:ok?(zh?'已換成 '+U.type:'Changed to '+U.type):(zh?'無法換成 '+U.type:'Not possible'),date:T(),read:false,userId:r.userId});save1();try{render()}catch(_){}};
  /* ── 名單：起飛前 14 天之後不能改；之後才開票（maybeTicket 的 RW 在 gen_r28） ── */
  function nw(){var O=window.kgmGrpNamesR1025B;if(typeof O!=='function'||O.__cr28)return;var w=function(id){var g=(S.groupsR1023A||[]).filter(function(x){return x&&x.id===id})[0];
      if(g&&g.ticketFromR1101A&&T()>=g.ticketFromR1101A){S.grpMsgR1025B=z()?'起飛前 14 天之後名單不能再改（已依確認的名單開票）。':'Names are locked 14 days before departure.';try{render()}catch(_){}return}return O.apply(this,arguments)};w.__cr28=1;window.kgmGrpNamesR1025B=w}
  nw();setTimeout(nw,0);setTimeout(nw,5000);
  /* 全額付清 → 尾款視同已付；過期報價 */
  function tick(){var ch=false,td=T();(S.groupsR1023A||[]).forEach(function(g){if(g&&g.fullPayR1101A&&g.deposit&&g.deposit.paid&&!g.balance.paid){g.balance.paid=true;g.balance.amountPaid=0;g.status='paid';ch=true}});
    R().forEach(function(r){if(r&&r.status==='quoted'&&r.quoteR1101A&&td>r.quoteR1101A.until){r.status='expired';(r.history=r.history||[]).push({at:new Date().toISOString(),act:z()?'報價逾期未回覆':'Quote expired',by:'system'});ch=true}});
    if(ch)save1();return ch}
  setInterval(function(){try{if(tick())(window.kgmSafeRenderR1026C||render)()}catch(_){}},20000);setTimeout(tick,9000);
  /* ── 畫面：後台申請卡（報價欄位）、前台申請卡（接受／拒絕、名單、換大機型） ── */
  function deskDecor(){if(!(S.view==='admin'))return;var zh=z();
    [].forEach.call(document.querySelectorAll('button[onclick^="kgmCharterApproveR1026C("]'),function(bt){var m=/kgmCharterApproveR1026C\('([^']+)'\)/.exec(bt.getAttribute('onclick')||'');if(!m)return;var id=m[1],r=req(id);if(!r||r.status!=='pending')return;
      if(bt.getAttribute('data-k28'))return;bt.setAttribute('data-k28','1');bt.textContent=zh?'送出報價':'Send quote';
      var card=bt.closest('article'),tb=card&&card.querySelector('.k27cd-tot b'),base=tb?(+String(tb.textContent||'').replace(/[^\d]/g,'')||0):0,one=r.kind==='custom'&&!r.retDate,fer=one?Math.round(base*0.4):0;
      var box=document.createElement('div');box.className='k28q-desk';
      box.innerHTML='<label>'+(zh?'報價金額（不二價，可改）':'Quote (editable)')+'<input id="k28q-amt-'+E(id)+'" class="inp" data-base="'+base+'" value="'+(base?base+fer:'')+'"></label>'
        +'<small>'+(zh?('系統試算 '+M(base)+(one?' ＋ 空機回程分攤 40% '+M(fer)+'（單程自創航班）':'')+'；客戶 '+until(r)+' 前要回覆'):'')+'</small>'
        +(r.kind!=='charter_existing'?'<label class="ck"><input type="checkbox" id="k28q-open-'+E(id)+'"> '+(zh?'空機回程開放一般旅客訂購（例：TPE-NRT 包機，當天 NRT-TPE 回程開放販售）':'Open the empty return for public sale')+'</label>':'');
      bt.parentNode.insertBefore(box,bt)});
    R().forEach(function(r){if(!r||(r.status!=='quoted'&&!(r.upsizeR1101A&&r.upsizeR1101A.status==='requested')))return;var card=[].filter.call(document.querySelectorAll('article.k27cd'),function(a){return (a.textContent||'').indexOf(r.id)>=0})[0];if(!card||card.querySelector('.k28q-st'))return;
      var d=document.createElement('div');d.className='k28q-st';var Q=r.quoteR1101A||{};
      d.innerHTML=(r.status==='quoted'?'<b>'+(zh?'已報價 ':'Quoted ')+M(Q.amount)+'</b>'+(zh?'・等待客戶回覆（'+E(Q.until)+' 前）'+(Q.openFerry?'・空機回程將開放販售':''):''):'')
        +(r.upsizeR1101A&&r.upsizeR1101A.status==='requested'?'<div>'+(zh?'客戶申請換大機型：':'Upsize request: ')+'<b>'+E(r.upsizeR1101A.from)+' → '+E(r.upsizeR1101A.type)+'</b>'+(zh?'（起飛前 21 天 '+E(r.upsizeR1101A.confirmBy)+' 前確認）':'')+' <button type="button" class="k25g-btn sm" onclick="kgmCharterUpsizeOkR1101A(\''+E(r.id)+'\',true)">'+(zh?'核准換機型':'Approve')+'</button> <button type="button" class="k25g-btn ghost sm" onclick="kgmCharterUpsizeOkR1101A(\''+E(r.id)+'\',false)">'+(zh?'不核准':'Decline')+'</button></div>':'');
      card.appendChild(d)})}
  function frontDecor(){if(S.view==='admin')return;var zh=z();
    R().forEach(function(r){if(!r)return;var art=[].filter.call(document.querySelectorAll('.k27cr-list article'),function(a){return (a.textContent||'').indexOf(r.id)>=0})[0];if(!art||art.querySelector('.k28q-f'))return;var d=document.createElement('div');d.className='k28q-f';var Q=r.quoteR1101A||{},h='';
      if(r.status==='quoted'){h='<div class="k28q-offer"><small>'+(zh?'KGM 報價（不二價）':'KGM offer')+'</small><b>'+M(Q.amount)+'</b><span>'+(zh?'請於 '+E(Q.until)+' 前回覆（剩 '+Math.max(0,days(T(),Q.until))+' 天）。接受後立即付清全額；名單到起飛前 14 天都還可以改，之後自動開票。':'Respond by '+E(Q.until))+'</span></div>'
        +'<label>'+(zh?'全體 '+r.pax+' 位旅客名單（每行一位：姓/名，可加 /KGM 會員卡號）':'Names, one per line: LAST/FIRST[/member no.]')+'<textarea id="k28q-names-'+E(r.id)+'" class="inp" rows="4" placeholder="WANG/DAMING\nLIN/MEI/KGM100123"></textarea></label>'
        +'<div class="k28q-acts"><button type="button" class="k25g-btn ghost" onclick="kgmCharterRejectR1101A(\''+E(r.id)+'\')">'+(zh?'拒絕報價':'Decline')+'</button><button type="button" class="k25g-btn" onclick="kgmCharterAcceptR1101A(\''+E(r.id)+'\')">'+(zh?'接受並付款':'Accept & pay')+'</button></div>'}
      else if(r.status==='rejected'||r.status==='expired')h='<div class="k27cr-no">'+(r.status==='rejected'?(zh?'已拒絕報價 ':'Quote declined ')+M(Q.amount):(zh?'報價已逾期（'+E(Q.until)+'）':'Quote expired'))+'</div>';
      else if(r.status==='approved'&&r.kind==='custom'){var cur=(r.flights&&r.flights[0]&&r.flights[0].type)||'',cn=seatsOf(cur),big=TYPES.filter(function(t){return t!==cur&&seatsOf(t)>cn});var U=r.upsizeR1101A;
        h=U?('<div class="k28q-up">'+(zh?'換大機型申請：':'Upsize: ')+E(U.from)+' → '+E(U.type)+'・'+({requested:zh?'待 KGM 確認（起飛前 21 天前）':'pending',approved:zh?'已核准':'approved',declined:zh?'未核准':'declined'}[U.status]||U.status)+'</div>')
          :(big.length?'<div class="k28q-up"><label>'+(zh?'申請換大機型（只能換大；起飛前 21 天前由 KGM 確認）':'Request a larger aircraft')+'<select id="k28q-up-'+E(r.id)+'" class="inp">'+big.map(function(t){return '<option value="'+t+'">'+t+'（'+seatsOf(t)+(zh?' 席':' seats')+'）</option>'}).join('')+'</select></label><button type="button" class="k25g-btn sm" onclick="kgmCharterUpsizeR1101A(\''+E(r.id)+'\')">'+(zh?'送出申請':'Request')+'</button></div>':'')}
      if(r.status==='approved'&&r.acceptedAt){var g=(S.groupsR1023A||[]).filter(function(x){return x&&x.id===r.groupId})[0];if(g&&g.ticketFromR1101A)h+='<div class="k28q-up">'+(zh?'名單可修改到 '+E(AD(g.ticketFromR1101A,-1))+'；'+E(g.ticketFromR1101A)+' 起依確認的名單自動開票。':'Names editable until '+E(g.ticketFromR1101A))+'</div>'}
      if(!h)return;d.innerHTML=h;art.appendChild(d)})}
  function decor(){try{deskDecor()}catch(_){}try{frontDecor()}catch(_){}}
  try{var r0=window.render;if(typeof r0==='function'&&!r0.__cr28){var w=function(){var x=r0.apply(this,arguments);setTimeout(decor,0);return x};w.__cr28=1;window.render=w;try{render=w}catch(_){}}}catch(_){}
  setInterval(decor,1500);
  try{var cs=document.createElement('style');cs.id='k28q-css';cs.textContent=
    '.k28q-desk{display:grid;gap:6px;margin:0 10px 0 0;min-width:280px}.k28q-desk label{display:grid;gap:4px;font-size:11.5px;font-weight:700;color:#55605B}.k28q-desk small{font-size:11px;color:#7A5A12}.k28q-desk .ck{display:flex!important;gap:8px;align-items:flex-start;font-weight:500}.k28q-desk .ck input{width:16px!important;height:16px!important;min-height:0!important;flex:0 0 auto;margin:1px 0 0;padding:0}'
   +'.k28q-st{margin-top:10px;padding:10px 12px;border-radius:12px;background:#FFF8EC;border:1px solid #F0D9B0;font-size:13px;color:#5B4A2C}.k28q-st b{color:#0B3D2E}'
   +'.k28q-f{margin-top:10px;display:grid;gap:10px}.k28q-offer{display:grid;gap:2px;padding:12px 14px;border-radius:14px;background:#EEF7F1;border:1px solid #BFDCCB}.k28q-offer small{font:800 10.5px system-ui,sans-serif;letter-spacing:.16em;color:#0B6B48}.k28q-offer b{font:700 24px Georgia,serif;color:#0B3D2E}.k28q-offer span{font-size:12.5px;color:#33443C}'
   +'.k28q-f label{display:grid;gap:4px;font-size:12px;font-weight:700;color:#55605B}.k28q-acts{display:flex;gap:8px;justify-content:flex-end}.k28q-up{font-size:12.5px;color:#55605B;display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}';
    document.head.appendChild(cs)}catch(_){}
})();
