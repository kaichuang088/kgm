/* ══ 1103A：實體櫃檯報到完成後的列印（使用者：「完成報到以後要跳出列印收據（只顯示如果有額外購買行李或是其他服務者）、登機證、
   貴賓室 Invitation Card（金／鑽石卡／商務艙／頭等艙），也要可以選擇稍後列印，然後到下一筆旅客的用完會選擇列印這位旅客或是
   這一位旅客和稍後列印的哪位哪位之類的」）══
   · 報到成功畫面加「列印文件」：這位旅客能印的文件逐項勾選（登機證一定有；收據只有這次加購行李／超重或訂位有付費加購才出現；
     貴賓室邀請卡＝金卡、尊爵（鑽石）卡、商務艙、頭等艙、Residence）。
   · 「稍後列印」：放進待印清單（這次開站有效）；下一位報到完成時，待印的旅客列在下面，可以一起勾選列印。
   · 旅客資料讀航班資料名單同一份（manifest7：姓名、座位、艙等、會員等級），模擬名單旅客也印得出來；登機證用網站唯一版型 kgmBpCardR1012A。 */
(function(){
  if(window.__ci31)return;window.__ci31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  var Q=window.KGM_CIQ_R1103A=window.KGM_CIQ_R1103A||[];
  function flightOf(key){var p=String(key||'').split('|'),f=null;try{f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===p[0]&&x.fr===p[2]&&x.to===p[3]})[0]||[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===p[0]})[0]}catch(_){}
    f=Object.assign({},f||{code:p[0],fr:p[2],to:p[3]},{date:p[1]});try{if(window.kgmSeasonFlightR48)f=Object.assign({},window.kgmSeasonFlightR48(f,p[1])||f,{date:p[1],fr:p[2]||f.fr,to:p[3]||f.to})}catch(_){}return f}
  function rowOf(d){var f=flightOf(d.key),r=null;try{window.KGM_NODH_R1023A=1;r=(manifest7(f,f.date)||[]).filter(function(x){return x&&String(x.id)===String(d.id)})[0]||null}catch(_){}finally{window.KGM_NODH_R1023A=0}return {f:f,x:r}}
  function bk(pnr){try{return (S.bookings||[]).filter(function(b){return b&&b.pnr===pnr})[0]||null}catch(_){return null}}
  function info(d){var o=rowOf(d),x=o.x||{},b=bk(d.pnr),cab=d.cabR1103A||x.cabin||'',tier=String(x.tier||d.memberTier||'Bronze');
    var name=((x.last||x.lastName||'')+'/'+(x.first||x.firstName||'')).toUpperCase();if(name==='/'){try{var p=((b&&b.paxList)||[])[0]||{};name=((p.lastName||'')+'/'+(p.firstName||'')).toUpperCase()}catch(_){}}
    var buys=[];if(d.charge&&+d.charge.total>0)buys.push({t:(z()?'超額／超重行李':'Excess baggage')+(d.chargeUnits?' × '+d.chargeUnits:''),amt:+d.charge.total,curr:d.charge.curr||'TWD'});
    else if(+d.chargeUnits>0)buys.push({t:(z()?'超額／超重行李 × ':'Excess baggage × ')+d.chargeUnits+(z()?'（每一等值件 USD 140）':' (USD 140 each)'),amt:140*(+d.chargeUnits),curr:'USD'});   /* 沒有訂位資料（模擬名單）時照報到算出的等值件數 */
    try{var ad=(b&&b.addons)||{};if(+ad.bagFee>0)buys.push({t:z()?'預購行李':'Pre-paid baggage',amt:+ad.bagFee,curr:b.curr||'TWD'});if(+ad.mealFee>0)buys.push({t:z()?'加購餐點':'Meal upgrade',amt:+ad.mealFee,curr:b.curr||'TWD'});
      if(+ad.seatFee>0)buys.push({t:z()?'選位費':'Seat selection',amt:+ad.seatFee,curr:b.curr||'TWD'});if(+ad.wifiFee>0)buys.push({t:'Wi-Fi',amt:+ad.wifiFee,curr:b.curr||'TWD'});
      (b&&b.petsR1101A||[]).forEach(function(pt){if(pt&&pt.flightCode===o.f.code&&+pt.fee>0)buys.push({t:z()?'寵物運送':'Pet transport',amt:+pt.fee,curr:'USD'})})}catch(_){}
    var lounge=/gold|diamond|black/i.test(tier)||/Business|First|Resident/i.test(cab);
    var voucher=null;try{voucher=window.kgmLoungeVoucherForR1103A?window.kgmLoungeVoucherForR1103A(d.pnr,o.f):null}catch(_){}
    if(voucher)lounge=true;
    return {d:d,f:o.f,x:x,b:b,name:name,seat:x.seat||'',cab:cab,fare:d.fareR1103A||x.fare||'',tier:tier,buys:buys,lounge:lounge,voucher:voucher}}
  window.kgmCiInfoR1103A=info;
  function docsOf(I){var a=[{k:'bp',t:z()?'登機證':'Boarding pass'}];if(I.buys.length)a.unshift({k:'rc',t:z()?'收據':'Receipt'});if(I.lounge)a.push({k:'lg',t:z()?'貴賓室邀請卡':'Lounge invitation'});return a}
  /* ── 文件 ── */
  function bpHtml(I){var b=I.b||{pnr:I.d.pnr,paxList:[{lastName:I.name.split('/')[0],firstName:I.name.split('/')[1]||''}]};
    try{var data=window.kgmBpDataR1012A(b,'out',{f:I.f,fare:I.fare,seat:I.seat,date:I.f.date});if(data){data.name=I.name||data.name;if(I.seat)data.seat=I.seat;if(!data.member&&I.x&&I.x.member)data.member=I.x.member;return window.kgmBpCardR1012A(data)}}catch(_){}
    return '<div class="k31pr-doc"><b>BOARDING PASS</b><p>'+E(I.name)+' · '+E(I.f.code)+' '+E(I.f.fr)+'→'+E(I.f.to)+' '+E(I.f.date)+' · '+E(I.seat)+'</p></div>'}
  function money(v,c){c=c||'TWD';if(c!=='TWD')return c+' '+Math.round(+v||0).toLocaleString('en-US');   /* fmtAmt 的金額是台幣、會換算 → 外幣直接寫 */
    try{return fmtAmt(Math.round(+v||0),'TWD')}catch(_){return 'TWD '+Math.round(+v||0).toLocaleString('en-US')}}
  function rcHtml(I){var sum={};I.buys.forEach(function(x){sum[x.curr]=(sum[x.curr]||0)+x.amt});
    return '<section class="k31pr-doc k31pr-rc"><header><b>KGM <span>AIRWAYS</span></b><small>'+(z()?'收據 RECEIPT':'RECEIPT')+'</small></header>'
      +'<dl><dt>'+(z()?'旅客':'Passenger')+'</dt><dd>'+E(I.name)+'</dd><dt>PNR</dt><dd>'+E(I.d.pnr)+'</dd><dt>'+(z()?'航班':'Flight')+'</dt><dd>'+E(I.f.code)+' '+E(I.f.fr)+'→'+E(I.f.to)+' · '+E(I.f.date)+'</dd><dt>'+(z()?'開立時間':'Issued')+'</dt><dd>'+new Date().toISOString().slice(0,16).replace('T',' ')+' UTC</dd></dl>'
      +'<table><thead><tr><th>'+(z()?'項目':'Item')+'</th><th>'+(z()?'金額':'Amount')+'</th></tr></thead><tbody>'+I.buys.map(function(x){return '<tr><td>'+E(x.t)+'</td><td>'+money(x.amt,x.curr)+'</td></tr>'}).join('')+'</tbody>'
      +'<tfoot>'+Object.keys(sum).map(function(c){return '<tr><td>'+(z()?'合計':'Total')+'</td><td>'+money(sum[c],c)+'</td></tr>'}).join('')+'</tfoot></table>'
      +'<p class="k31pr-fine">'+(z()?'本收據僅證明上列附加服務費用；機票票款收據請於行程管理下載。':'Ancillary charges only; ticket receipts are available in Manage Booking.')+'</p></section>'}
  function lgName(ap){return ap==='TPE'?(z()?'KGM Galaxy 貴賓室（桃園機場第二航廈）':'KGM Galaxy Lounge · TPE Terminal 2'):(ap==='TSA'?(z()?'KGM 松山貴賓室':'KGM Lounge · Taipei Songshan'):(z()?'oneworld 合作貴賓室（'+ap+'）':'oneworld partner lounge · '+ap))}
  function lgHtml(I){var why=I.voucher?(z()?'貴賓室券（徽章驚喜包）':'Lounge voucher'):(/Resident/i.test(I.cab)?'Residence':(/First/i.test(I.cab)?(z()?'頭等艙':'First'):(/Business/i.test(I.cab)?(z()?'商務艙':'Business'):I.tier+' Explorer')));
    var guest=/diamond|black/i.test(I.tier)?1:0;
    return '<section class="k31pr-doc k31pr-lg"><div class="k31pr-lgcard"><div class="k31pr-lgtop"><small>LOUNGE INVITATION</small><b>KGM <span>AIRWAYS</span></b></div>'
      +'<h3>'+E(lgName(I.f.fr))+'</h3>'
      +'<div class="k31pr-lgrow"><div><small>'+(z()?'旅客':'Guest')+'</small><b>'+E(I.name)+'</b></div><div><small>'+(z()?'資格':'Eligibility')+'</small><b>'+E(why)+'</b></div></div>'
      +'<div class="k31pr-lgrow"><div><small>'+(z()?'航班':'Flight')+'</small><b>'+E(I.f.code)+' · '+E(I.f.fr)+'→'+E(I.f.to)+'</b></div><div><small>'+(z()?'日期':'Date')+'</small><b>'+E(I.f.date)+'</b></div><div><small>'+(z()?'同行':'Guests')+'</small><b>'+(guest?'+'+guest:(z()?'本人':'Holder only'))+'</b></div></div>'
      +'<p>'+(z()?'限當日、本航班起飛前 3 小時起使用；請連同登機證出示。':'Valid on the day, from 3 hours before departure; present with your boarding pass.')+'</p></div></section>'}
  function docHtml(I,k){return k==='rc'?rcHtml(I):(k==='lg'?lgHtml(I):bpHtml(I))}
  /* ── 報到成功畫面的列印區 ── */
  window.kgmCiPrintR1103A=function(d){if(!d||!d.key)return '';var I=info(d),docs=docsOf(I),me=d.key+'|'+d.id;
    var q=Q.filter(function(x){return x.me!==me});
    return '<div class="k31ci-pr"><h3>'+(z()?'列印文件':'Print documents')+'</h3>'
      +'<div class="k31ci-who"><b>'+E(I.name||d.pnr)+'</b><span>'+E(I.f.code)+' · '+(z()?'座位 ':'Seat ')+E(I.seat||'—')+' · '+E(I.cab||'')+(I.tier&&!/bronze/i.test(I.tier)?' · '+E(I.tier):'')+'</span></div>'
      +'<div class="k31ci-docs">'+docs.map(function(x){return '<label><input type="checkbox" class="k31ci-cb" data-me="'+E(me)+'" data-k="'+x.k+'" checked> '+E(x.t)+'</label>'}).join('')+'</div>'
      +(q.length?'<div class="k31ci-q"><small>'+(z()?'稍後列印清單（勾選一起印）':'Queued for later (tick to include)')+'</small>'+q.map(function(x){return '<label><input type="checkbox" class="k31ci-qb" data-me="'+E(x.me)+'"> '+E(x.name)+' <i>'+E(x.code)+' · '+E(x.seat||'—')+' · '+E(x.docs.map(function(y){return y.t}).join('、'))+'</i></label>'}).join('')+'</div>':'')
      +'<div class="k31ci-acts"><button type="button" class="btn btn-g" onclick="kgmCiDoPrintR1103A(\''+A(me)+'\')">'+(z()?'列印勾選的文件':'Print selected')+'</button><button type="button" class="btn" onclick="kgmCiLaterR1103A(\''+A(me)+'\')">'+(z()?'稍後列印':'Print later')+'</button></div>'
      +'<p class="k31ci-msg" id="k31ci-msg"></p></div>'};
  window.kgmCiLaterR1103A=function(me){var c=S.checkin49&&S.checkin49.done;if(!c)return;if(!Q.some(function(x){return x.me===me})){var I=info(c),docs=docsOf(I).filter(function(x){var cb=document.querySelector('.k31ci-cb[data-me="'+me.replace(/"/g,'')+'"][data-k="'+x.k+'"]');return !cb||cb.checked});
      Q.push({me:me,d:Object.assign({},c),name:I.name||c.pnr,code:I.f.code,seat:I.seat,docs:docs})}
    var m=document.getElementById('k31ci-msg');if(m)m.textContent=z()?'已放進稍後列印清單；下一位報到完成時可以一起印。':'Queued.';
    setTimeout(function(){S.checkin49=null;try{render()}catch(_){}},700)};
  window.kgmCiDoPrintR1103A=function(me){var c=S.checkin49&&S.checkin49.done;var jobs=[];
    if(c){var I=info(c),ks=[].filter.call(document.querySelectorAll('.k31ci-cb'),function(x){return x.checked&&x.getAttribute('data-me')===me}).map(function(x){return x.getAttribute('data-k')});if(ks.length)jobs.push({I:I,ks:ks})}
    [].forEach.call(document.querySelectorAll('.k31ci-qb'),function(x){if(!x.checked)return;var m2=x.getAttribute('data-me'),q=Q.filter(function(y){return y.me===m2})[0];if(!q)return;jobs.push({I:info(q.d),ks:q.docs.map(function(y){return y.k})});Q.splice(Q.indexOf(q),1)});
    if(!jobs.length){var m=document.getElementById('k31ci-msg');if(m)m.textContent=z()?'請至少勾選一項。':'Select at least one.';return}
    printJobs(jobs)};
  function printJobs(jobs){var box=document.getElementById('k31pr');if(!box){box=document.createElement('div');box.id='k31pr';document.body.appendChild(box)}
    box.innerHTML=jobs.map(function(j){return j.ks.map(function(k){return '<div class="k31pr-page">'+docHtml(j.I,k)+'</div>'}).join('')}).join('');
    window.KGM_CIPRINT_R1103A={at:Date.now(),pages:box.querySelectorAll('.k31pr-page').length,who:jobs.map(function(j){return j.I.name})};
    var h=document.documentElement;h.classList.add('k31-printing');var off=function(){h.classList.remove('k31-printing');window.removeEventListener('afterprint',off)};window.addEventListener('afterprint',off);
    try{if(!window.KGM_NOPRINT_R1103A)window.print()}catch(_){}setTimeout(off,60000)}
  window.kgmCiPrintJobsR1103A=printJobs;
  /* 「完成報到」按下去後畫面停在第 3 步（原本就有的問題）：完成時中途會重畫一次，第 3 步的視窗又被放回去，
     之後「已經有視窗就不再放」→ 報到成功畫面永遠出不來。完成後把舊視窗拿掉再畫一次。 */
  function wrapFinish(){var O=window.kgmCheckinFinish49;if(typeof O!=='function'||O.__ci31)return;
    var w=function(){MO++;var r;try{r=O.apply(this,arguments)}finally{MO--}try{if(S.checkin49&&S.checkin49.step===4)modalOnly()}catch(_){}return r};
    w.__ci31=1;window.kgmCheckinFinish49=w}
  /* 報到頁卡頓（使用者：「航班資料報到頁面卡頓」）：報到視窗每一步（下一步、完成）都整頁重畫航班資料（KX4 460 位旅客，一次 1.1～1.5 秒，
     完成報到 4 秒）。視窗開著的時候後面的名單看不到 → 這段期間只重畫報到視窗；關掉視窗（返回航班資料／取消）時才整頁重畫一次。 */
  var MO=0;
  function modalOnly(){try{[].forEach.call(document.querySelectorAll('.r49-modal'),function(m){m.remove()});if(S.checkin49&&window.kgmCiWizHtmlR1103A)document.body.insertAdjacentHTML('beforeend',window.kgmCiWizHtmlR1103A())}catch(_){}}
  function wrapRender(){var R0=window.render;if(typeof R0!=='function'||R0.__ci31)return;
    var w=function(){if(MO&&S.checkin49&&S.view==='admin'){modalOnly();return}return R0.apply(this,arguments)};
    try{Object.keys(R0).forEach(function(k){if(!(k in w))w[k]=R0[k]})}catch(_){}w.__ci31=1;window.render=w;try{render=w}catch(_){}}
  function mo(name){var O=window[name];if(typeof O!=='function'||O.__ci31mo)return;var w=function(){MO++;try{return O.apply(this,arguments)}finally{MO--}};w.__ci31mo=1;window[name]=w}
  function wrapToggle(){var O=window.toggleOpsR7;if(typeof O!=='function'||O.__ci31mo)return;
    var w=function(key,id,field,val){if(field==='physical'&&val){MO++;try{return O.apply(this,arguments)}finally{MO--}}return O.apply(this,arguments)};w.__ci31mo=1;window.toggleOpsR7=w}
  /* 航班資料「作業動作」套用到旅客 → 自動成立案件（cs28 kgmCaseAutoR1103A）；「復原」→ 那件自動案件結案 */
  var ACTN={offload:['移出此航班','Offloaded','irregular','urgent'],freeup:['免費升等','Complimentary upgrade','other','normal'],paidup:['付費升等','Paid upgrade','other','normal'],comp:['超賣補償（拒絕登機）','Denied boarding compensation','compensation','urgent'],volbump:['自願讓位（改搭下一班）','Volunteer bump','compensation','normal'],invdown:['非自願降等','Involuntary downgrade','compensation','urgent'],voldown:['自願降等','Voluntary downgrade','compensation','normal']};
  function wrapAct(){var O=window.kgmFdActR929;if(typeof O!=='function'||O.__ci31)return;
    var w=function(key,id){var act=S.fdActR929||'',f=null,before=null;
      try{if(act){f=flightOf(key);window.KGM_NODH_R1023A=1;var x0=(manifest7(f,f.date)||[]).filter(function(q){return q&&q.id===id})[0];if(x0)before={cabin:x0.cabin,fare:x0.fare,seat:x0.seat,off:!!x0.offloadR929,a:x0.opsActR929}}}catch(_){}finally{window.KGM_NODH_R1023A=0}
      var r=O.apply(this,arguments);
      try{if(!act||!before||!window.kgmCaseAutoR1103A)return r;window.KGM_NODH_R1023A=1;var x=null;try{x=(manifest7(f,f.date)||[]).filter(function(q){return q&&q.id===id})[0]}finally{window.KGM_NODH_R1023A=0}if(!x)return r;
        var changed=x.cabin!==before.cabin||x.fare!==before.fare||x.seat!==before.seat||!!x.offloadR929!==before.off||x.opsActR929!==before.a;if(!changed)return r;
        var seg={code:f.code,fr:f.fr,to:f.to,date:f.date},pnr=x.pnr||((x.booking||{}).pnr)||'',who=(S.adminUser&&(S.adminUser.name||S.adminUser.empId))||'GROUND';
        if(act==='restore'){window.kgmCaseAutoCloseR1103A&&window.kgmCaseAutoCloseR1103A(pnr,f.code,f.date);try{save()}catch(_){}return r}
        var a=ACTN[act]||[act,act,'other','normal'],detail=(z()?a[0]:a[1])+'：'+(before.cabin!==x.cabin?(before.cabin+' → '+x.cabin+' · '):'')+(before.seat!==x.seat&&x.seat?((z()?'座位 ':'seat ')+(before.seat||'—')+' → '+x.seat+' · '):'')+f.code+' '+f.fr+'→'+f.to+' '+f.date;
        var no=window.kgmCaseAutoR1103A({pnr:pnr,act:act,type:a[2],priority:a[3],label:z()?a[0]:a[1],detail:detail,segment:seg,paxName:x.name||((x.last||'')+' / '+(x.first||'')),staff:who,empId:(S.adminUser&&S.adminUser.empId)||''});
        if(no){window.KGM_LASTCASE_R1103A=no;try{save()}catch(_){}try{var t=document.createElement('div');t.className='k31-toast';t.textContent=(z()?'已自動成立案件 ':'Case opened ')+no+' · '+(x.name||pnr);document.body.appendChild(t);setTimeout(function(){t.remove()},4000)}catch(_){}}
      }catch(_){}return r};
    w.__ci31=1;window.kgmFdActR929=w}
  function hookAll(){wrapAct();wrapFinish();['kgmCheckinNext49','kgmResolveResident49'].forEach(mo);wrapToggle();wrapRender()}
  hookAll();setTimeout(hookAll,0);setTimeout(hookAll,3000);setTimeout(hookAll,10000);
  try{var cs=document.createElement('style');cs.textContent=
    '.k31ci-pr{margin:18px 0 6px;padding:16px 18px;border:1px solid #E3DFD4;border-radius:16px;background:#FBFAF6;text-align:left}.k31ci-pr h3{margin:0 0 8px;font-size:15px;color:#1C3D33}'
    +'.k31ci-who{display:flex;flex-direction:column;gap:2px;margin-bottom:10px}.k31ci-who b{font-size:14px}.k31ci-who span{font-size:12px;color:#6B736F}'
    +'.k31ci-docs,.k31ci-q{display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:10px}.k31ci-docs label,.k31ci-q label{display:flex;align-items:center;gap:6px;font-size:13px}.k31ci-q{flex-direction:column;padding:10px 12px;border-radius:12px;background:#fff;border:1px dashed #D8D2C2}.k31ci-q small{font-size:11px;letter-spacing:.06em;color:#8A7F68;font-weight:700}.k31ci-q i{font-style:normal;color:#6B736F;font-size:12px}'
    +'.k31ci-acts{display:flex;gap:8px;flex-wrap:wrap}.k31ci-msg{margin:8px 0 0;font-size:12.5px;color:#0B6B48;min-height:1em}'
    +'#k31pr{display:none}.k31pr-doc{font-family:inherit;color:#1D2622}.k31pr-rc{max-width:560px;margin:0 auto;padding:24px;border:1px solid #DDD}.k31pr-rc header{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1C3D33;padding-bottom:8px;margin-bottom:12px}.k31pr-rc header b span,.k31pr-lgtop b span{color:#B08A3E}'
    +'.k31pr-rc dl{display:grid;grid-template-columns:110px 1fr;gap:4px 10px;font-size:13px;margin:0 0 14px}.k31pr-rc dt{color:#6B736F}.k31pr-rc table{width:100%;border-collapse:collapse;font-size:13px}.k31pr-rc th,.k31pr-rc td{padding:6px 4px;border-bottom:1px solid #EEE;text-align:left}.k31pr-rc td:last-child,.k31pr-rc th:last-child{text-align:right}.k31pr-rc tfoot td{font-weight:800}.k31pr-fine{font-size:11px;color:#777;margin-top:12px}'
    +'.k31pr-lgcard{max-width:520px;margin:0 auto;padding:26px 28px;border-radius:18px;background:linear-gradient(140deg,#14322A,#1F4A3E 60%,#2A5B4D);color:#F4EFE2;box-shadow:0 0 0 2px #B08A3E inset}.k31pr-lgtop{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.k31pr-lgtop small{letter-spacing:.2em;font-size:10.5px;color:#D9C38F}'
    +'.k31pr-lgcard h3{margin:0 0 14px;font-size:18px;font-weight:700}.k31pr-lgrow{display:flex;gap:22px;margin-bottom:10px}.k31pr-lgrow small{display:block;font-size:10px;letter-spacing:.12em;color:#CDBB8E}.k31pr-lgrow b{font-size:14px}.k31pr-lgcard p{margin:10px 0 0;font-size:11.5px;color:#E5DCC3}'
    +'.k31-toast{position:fixed;right:22px;bottom:22px;z-index:99999;background:#14322A;color:#F4EFE2;padding:11px 16px;border-radius:12px;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.18)}'
    +'@media print{html.k31-printing body>*{display:none!important}html.k31-printing #k31pr{display:block!important}html.k31-printing .k31pr-page{page-break-after:always;break-after:page;padding:12mm 0}html.k31-printing .k31pr-page:last-child{page-break-after:auto}}';
    document.head.appendChild(cs)}catch(_){}
})();
