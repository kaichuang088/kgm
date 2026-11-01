
/* ══ 1101A：前台（使用者 Round 3）══
   1. 我的行程分「即將出發／已完成」分頁樣式（清單本身在 r60 listPage60）。
   2. 辦理登機開放時間：美國航線（出發或抵達在美國，含關島／塞班）起飛前 24 小時，其他 48 小時；截止起飛前 90 分鐘。
      起飛時間用出發地當地時間（網站時區表 TZ）。r60 ciWindow60（點按鈕的檢查）與行程卡按鈕（灰色）都讀這裡。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var US28={EWR:1,GUM:1,SPN:1};try{Object.keys(US_AP).forEach(function(k){US28[k]=1})}catch(_){}
  function tz(a){try{return (TZ&&TZ[a]!=null)?TZ[a]:8}catch(_){return 8}}
  window.kgmUsRouteR1101A=function(fr,to){return !!(US28[fr]||US28[to])};
  window.kgmCiOpenR1101A=function(s){try{var f=s.f||s,fr=s.fr||f.fr,to=s.to||f.to,d=s.date||f.date,dep=String(s.dep||f.dep||'00:00').slice(0,5);
    var ms=Date.parse(d+'T'+dep+':00Z')-tz(fr)*3600000;return {ms:ms,openH:window.kgmUsRouteR1101A(fr,to)?24:48,tz:tz(fr)}}catch(_){return null}};
  window.kgmCiStateR1101A=function(b,s){try{
    if(!b||b.status==='cancelled')return null;var key=s.key||'out';
    if(b.dhR929)return {open:false,dh:true,why:z()?'DH 調位：請至機場櫃檯報到，座位現場劃位':'Crew positioning: check in at the airport counter',short:z()?'DH・機場櫃檯報到＋現場劃位':'DH · airport check-in'};
    var st=(b.checkinSegmentsR7||{})[key];if(st&&st.checkedIn)return {open:true};if(key==='out'&&b.checkedIn)return {open:true};
    var c=window.kgmCiOpenR1101A(s);if(!c||!isFinite(c.ms))return null;var h=(c.ms-Date.now())/3600000;
    if(h>c.openH){var at=new Date(c.ms-c.openH*3600000+c.tz*3600000).toISOString(),t=at.slice(5,10).replace('-','/')+' '+at.slice(11,16);
      return {open:false,early:true,why:z()?('尚未開放：起飛前 '+c.openH+' 小時開放'+(c.openH===24?'（美國航線）':'')+'，'+t+'（當地時間）起'):('Opens '+c.openH+'h before departure, from '+t+' local'),
        short:z()?(t+' 開放'+(c.openH===24?'・美國航線 24 小時':'')):('Opens '+t+(c.openH===24?' · US 24h':''))}}
    if(h<1.5)return {open:false,late:true,why:z()?'網路報到已截止，請至機場櫃檯辦理':'Online check-in has closed',short:z()?'網路報到已截止':'Closed'};
    return {open:true}}catch(_){return null}};
  /* 我的行程清單：勾選一筆（不重畫整頁，只換勾勾與右下角按鈕）→ 進入行程 */
  window.kgmTripPickR1101A=function(pnr){try{S.tripPickR1101A=pnr;var app=document.getElementById('app');if(!app){render();return}
    var on=null;[].forEach.call(app.querySelectorAll('.k28-pick'),function(e){var y=e.getAttribute('data-pnr28')===pnr;e.classList.toggle('sel',y);e.setAttribute('aria-checked',y?'true':'false');if(y)on=e});
    var info=app.querySelector('.k28-pickinfo'),go=app.querySelector('.k28-pickgo');if(!on||!info||!go){render();return}
    info.innerHTML=(z()?'已選 ':'Selected ')+'<b>'+String(pnr).replace(/[<>&"]/g,'')+'</b><small>'+String(on.getAttribute('data-route28')||'').replace(/[<>&"]/g,'')+'</small>';go.disabled=false}catch(_){render()}};
  window.kgmTripGoR1101A=function(){var p=S.tripPickR1101A;if(!p)return;if(!(S.bookings||[]).some(function(b){return b&&b.pnr===p}))return;window.kgmOpenTripR60(p)};
  /* 行程管理頁最上面加「‹ 我的行程」（會員登入、從清單進來的單筆行程；原本只有頁尾一個連結） */
  function back28(){try{var app=document.getElementById('app');if(!app)return;var ex=app.querySelector('.k28-back');
    if(!(S.user&&S.view==='mytrip'&&!S.tripsListR60&&S.mtOnly&&!S.checkinHubR60&&!S.pnrModeR7)){if(ex)ex.remove();return}if(ex)return;
    var hero=[].slice.call(app.querySelectorAll('div,section,header')).filter(function(e){return /^\s*MANAGE MY BOOKING/i.test(e.textContent||'')&&e.offsetHeight>80&&e.offsetHeight<600})[0];if(!hero)return;
    var lk=((S.tripLookR1102A||{})[S.user.id])||[],n=(S.bookings||[]).filter(function(b){return b&&b.pnr&&(b.userId===S.user.id||lk.indexOf(b.pnr)>=0)}).length;   /* 1102A：跟我的行程清單同一個條件 */
    var d=document.createElement('div');d.className='k28-back';d.style.maxWidth=(hero.offsetWidth||1080)+'px';
    d.innerHTML='<button type="button" onclick="S.tripPickR1101A=S.mtOnly;kgmAllTripsR60()"><span aria-hidden="true">‹</span>'+(z()?'我的行程':'My trips')+'<i>'+n+'</i></button>';
    hero.parentNode.insertBefore(d,hero)}catch(_){}}
  /* 1102A：登入狀態下用訂位代號查到別人的訂位（行程管理 S.mgResult）→ 記進「查詢過的行程」，我的行程清單會列出（每位會員最多 30 筆） */
  function look30(){try{var u=S.user,b=S.mgResult;if(!u||!u.id||!b||!b.pnr||b.userId===u.id)return;var M=S.tripLookR1102A=S.tripLookR1102A||{},L=M[u.id]=M[u.id]||[];if(L.indexOf(b.pnr)>=0)return;
    L.unshift(b.pnr);if(L.length>30)L.length=30;try{save()}catch(_){}}catch(_){}}
  window.kgmTripLookR1102A=look30;
  try{var _r28=window.render;if(typeof _r28==='function'){var w28=function(){var r=_r28.apply(this,arguments);setTimeout(back28,0);look30();return r};window.render=w28;try{render=w28}catch(_){}}}catch(_){}
  setInterval(back28,800);   /* 行程頁有些是後面的層另外畫的（不經過 window.render），補一個輕量檢查（不在行程頁就直接返回） */
  /* 地勤實體報到（航班資料點旅客 →「進入實體報到」）：原本只跳到地勤現場作業頁、沒有真的報到。
     改成：跑櫃檯報到檢查（kgmCounterAlertsR40）→ 沒座位先劃位（DH 也是這時候劃）→ 標記已報到 → 直接打開登機證（同一個新版登機證 kgmBpCardsOfR1012A）。
     有「停止」項目不放行；只有提醒項目先列出來讓地勤確認。 */
  try{var sc0=window.kgmSeatCheckinR914;if(typeof sc0==='function'&&!sc0.__r28){var sc28=function(pnr,code,date){
    try{if(window.kgmCanCheckinR914&&!window.kgmCanCheckinR914())return sc0.apply(this,arguments);
      var r=window.kgmCounterAlertsR40(pnr,code,date);if(!r||!r.found||!r.seg)return sc0.apply(this,arguments);
      var b=r.booking,key=r.seg.key,al=(r.alerts||[]).map(function(a){return (a.block?(z()?'停止：':'STOP: '):(z()?'注意：':'NOTE: '))+a.t});
      if(r.blocked){alert((z()?'不能報到（請先處理）：\n':'Cannot check in:\n')+al.join('\n'));return}
      if(!r.ok&&al.length&&!confirm((z()?'報到前請確認以下事項：\n':'Please confirm:\n')+al.join('\n')+(z()?'\n\n已確認，完成報到並列印登機證？':'\n\nConfirmed — check in and issue the boarding pass?')))return;
      try{var so=(b.seats||{})[key]||{},has=Object.keys(so).some(function(k){return k!=='_auto'&&so[k]});if(!has&&typeof autoAssignSeat==='function')autoAssignSeat(b,key)}catch(_){}
      window.kgmDoCounterCheckinR40(pnr,code,date,!r.ok);
      var bk=(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0];var st=bk&&window.ciState7?window.ciState7(bk,key):null;
      if(!(st&&st.checkedIn)&&!(bk&&bk.checkedIn))return;
      S.physCheckinR914={pnr:b.pnr,code:code,date:date,at:new Date().toISOString(),bpR1101A:true};try{save()}catch(_){}
      try{closeModal()}catch(_){}
      openModal('boardingPass',{pnr:b.pnr,seg:key});
    }catch(e){return sc0.apply(this,arguments)}};sc28.__r28=1;window.kgmSeatCheckinR914=sc28}}catch(_){}
  try{var cs=document.createElement('style');cs.id='k28fr-css';cs.textContent=
    '.k60-tabs28{display:flex;gap:6px;margin:0 0 16px;border-bottom:1px solid rgba(11,58,46,.12)}'
   +'.k60-tabs28 button{appearance:none;border:0;background:none;padding:10px 4px 12px;margin-right:22px;font:600 15px inherit;font-family:inherit;color:#6B7570;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}'
   +'.k60-tabs28 button.on{color:#0B3D2E;border-bottom-color:var(--gold,#B08A3E)}'
   +'.k60-tabs28 button i{font-style:normal;font-size:12px;margin-left:7px;padding:1px 8px;border-radius:999px;background:#EEF2EF;color:#55605B}'
   +'.k60-tabs28 button.on i{background:#0B3D2E;color:#fff}'
   +'html body #app button.k56-ci.k28-ci-off,html body #app button.k56-ci.k28-ci-off:hover{background:#D5DBD8!important;color:#fff!important;box-shadow:none!important;cursor:not-allowed;transform:none!important}'
   +'.k60-trip.k28-pick{position:relative;padding-left:16px}'
   +'.k28-chk{flex:0 0 auto;width:30px;height:30px;border-radius:50%;border:2px solid #C9D3CE;background:#fff;display:inline-flex;align-items:center;justify-content:center;transition:.15s}'
   +'.k28-chk svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:0;transform:scale(.6);transition:.15s}'
   +'.k60-trip.k28-pick:hover .k28-chk{border-color:#0B3D2E}'
   +'.k60-trip.k28-pick.sel{border-color:#0B3D2E;box-shadow:0 0 0 1px #0B3D2E,0 10px 26px -18px rgba(11,58,46,.7);background:#FBFDFC}'
   +'.k60-trip.k28-pick.sel .k28-chk{background:#0B3D2E;border-color:#0B3D2E}.k60-trip.k28-pick.sel .k28-chk svg{opacity:1;transform:none}'
   +'.k28-pickbar{position:sticky;bottom:16px;z-index:5;display:flex;align-items:center;justify-content:flex-end;gap:16px;margin-top:16px;padding:12px 14px 12px 20px;border-radius:16px;background:rgba(255,255,255,.94);backdrop-filter:blur(6px);border:1px solid rgba(11,58,46,.12);box-shadow:0 12px 30px -20px rgba(11,58,46,.55)}'
   +'.k28-pickinfo{font-size:13.5px;color:#55605B;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.k28-pickinfo b{font:700 15px ui-monospace,monospace;letter-spacing:.12em;color:#0B3D2E}.k28-pickinfo small{font-size:12.5px;color:#7A857F}'
   +'.k28-pickgo{appearance:none;border:0;border-radius:999px;background:#0B3D2E;color:#fff;font:700 14.5px inherit;font-family:inherit;padding:12px 26px;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:.15s}'
   +'.k28-pickgo span{font-size:18px;line-height:1}.k28-pickgo:hover:not(:disabled){background:#0e5a48;transform:translateY(-1px)}.k28-pickgo:disabled{background:#D5DBD8;cursor:not-allowed}'
   /* 1102A：卡片固定欄寬（勾勾／訂位代號／航線／出發／旅客／狀態），每一列的分隔線對齊 */
   +'.k60-trip.k28-pick{display:grid!important;grid-template-columns:30px 112px minmax(0,1fr) 128px 132px 96px;align-items:center;column-gap:18px}'
   +'.k60-trip.k28-pick .k60-trip-pnr{text-align:left;padding-right:0;border-right:0;align-self:stretch;display:flex;flex-direction:column;justify-content:center;border-right:1px solid rgba(11,58,46,.12)}'
   +'.k60-trip.k28-pick .k60-trip-pnr b{font-size:16px}.k60-trip.k28-pick .k60-trip-main b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
   +'.k30-tc{display:flex;flex-direction:column;gap:1px;padding-left:16px;border-left:1px solid rgba(11,58,46,.08);align-self:stretch;justify-content:center}.k30-tc small{font-size:10.5px;color:var(--sub,#7A857F)}.k30-tc b{font:700 14px ui-monospace,monospace;color:#0B3D2E;white-space:nowrap}.k30-tc i{font-style:normal;font-size:11px;color:var(--sub,#7A857F);white-space:nowrap}'
   +'.k30-tst{text-align:right}.k30-tst em{display:inline-block;font-style:normal;font-size:11px;font-weight:800;padding:3px 10px;border-radius:99px;background:#F1F6F3;color:#14503f;white-space:nowrap}.k60-trip.off .k30-tst em{background:#f6ecea;color:#8c3a2f}'
   +'@media(max-width:760px){.k60-trip.k28-pick{grid-template-columns:30px minmax(0,1fr) minmax(0,1fr);grid-template-areas:"c p st" "c m m" "c d x";row-gap:10px;column-gap:12px}.k60-trip.k28-pick>.k28-chk{grid-area:c;align-self:start}.k60-trip.k28-pick>.k60-trip-pnr{grid-area:p;border-right:0}.k60-trip.k28-pick>.k60-trip-main{grid-area:m}.k60-trip.k28-pick>.k30-tc:nth-child(4){grid-area:d}.k60-trip.k28-pick>.k30-tc:nth-child(5){grid-area:x}.k30-tc{padding-left:0;border-left:0}.k60-trip.k28-pick>.k30-tst{grid-area:st}}'
   +'@media(max-width:640px){.k28-pickbar{bottom:84px;padding:10px 10px 10px 14px}.k28-pickgo{padding:11px 18px}}'
   +'.k28-back{margin:0 auto 12px}.k28-back button{appearance:none;border:1px solid rgba(11,58,46,.16);background:#fff;border-radius:999px;padding:8px 16px 8px 12px;font:600 13.5px inherit;font-family:inherit;color:#0B3D2E;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:.15s}'
   +'.k28-back button span{font-size:18px;line-height:1}.k28-back button i{font-style:normal;font-size:11.5px;padding:1px 7px;border-radius:999px;background:#EEF2EF;color:#55605B}.k28-back button:hover{border-color:#0B3D2E;background:#F6F9F7}'
   /* 附加服務頁（只套 .r28-addons） */
   +'.r28-addons .r7-page-title{font:700 30px Georgia,"Noto Serif TC",serif;color:#0B3D2E;margin:6px 0 24px;letter-spacing:.02em}.r28-addons .r7-page-title:before{content:"ADD-ONS";display:block;font:800 11px system-ui,sans-serif;letter-spacing:.24em;color:#B08A3E;margin-bottom:8px}'
   +'.r28-addons .r7-flight{border:1px solid rgba(11,58,46,.12);border-radius:16px;padding:18px 24px 20px;box-shadow:0 10px 26px -22px rgba(11,58,46,.55);margin-bottom:14px}'
   +'.r28-addons .r7-flight-head{font:700 13.5px inherit;font-family:inherit;color:#0B3D2E;border-bottom:1px dashed rgba(11,58,46,.16);padding-bottom:12px;margin-bottom:16px;letter-spacing:.02em}'
   +'.r28-addons .r7-flight .time{font:700 30px Georgia,"Noto Serif TC",serif;color:#0B3D2E;font-variant-numeric:tabular-nums;letter-spacing:.01em}'
   +'.r28-addons .r7-flight .airport{font:800 12px system-ui,sans-serif;letter-spacing:.16em;color:#55605B}'
   +'.r28-addons .r7-flight .rule{height:0;background:none;border-top:1.5px dashed #C9B48A}.r28-addons .r7-flight .rule:after{color:#B08A3E;top:-11px}'
   +'.r28-addons .r7-flight .meta{font-size:12.5px;color:#55605B;line-height:1.75}'
   +'.r28-addons .r7-flight .fare{color:#0B3D2E;font-size:13px;line-height:1.7}.r28-addons .r7-flight .fare span{color:#7A857F!important;font-weight:600!important}'
   +'sup.r28-dd{font:800 12px system-ui,sans-serif;color:#B08A3E;margin-left:3px;vertical-align:14px}'
   +'.r28-addons .r7-price{display:flex;justify-content:flex-end;align-items:baseline;gap:10px;margin:6px 4px 26px;font-size:13px;color:#55605B}.r28-addons .r7-price b{font:700 22px Georgia,serif;color:#0B3D2E}'
   +'.r28-addons .r7-passenger-title,.r28-addons .r7-addon-title{text-align:left;color:#B08A3E;font:800 11.5px system-ui,sans-serif;letter-spacing:.2em;margin:26px 2px 10px}'
   +'.r28-addons .r7-passenger{border:1px solid rgba(11,58,46,.12);border-radius:16px;padding:16px 22px}.r28-addons .r7-passenger .check{background:#0B3D2E;width:24px;height:24px;font-size:12px}.r28-addons .r7-passenger h2{font:700 20px Georgia,serif;color:#0B3D2E;letter-spacing:.04em}.r28-addons .r7-passenger>span:last-child{color:#7A857F!important}'
   +'.r28-addons .r7-addon-box{border:1px solid rgba(11,58,46,.12);border-radius:16px;box-shadow:0 10px 26px -22px rgba(11,58,46,.55)}.r28-addons .r7-addon-row{border-bottom-color:rgba(11,58,46,.1)}'
   +'.r28-addons .r7-addon-copy{padding:22px 24px}.r28-addons .r7-addon-copy h3{color:#0B3D2E;font:700 16px inherit;font-family:inherit;margin-bottom:6px}.r28-addons .r7-addon-copy p{font-size:12px;color:#6B7570;line-height:1.6}'
   +'.r28-addons .r7-addon-copy .btn{border-radius:999px;border-color:#0B3D2E;color:#0B3D2E;padding:9px 20px}.r28-addons .r7-addon-copy .btn:hover{background:#0B3D2E;color:#fff}'
   +'.r28-addons .r7-addon-controls select,.r28-addons .r7-addon-controls input{border-radius:10px;border-color:rgba(11,58,46,.2)}'
   +'.r28-addons .r7-addon-art{background:linear-gradient(160deg,#F4F1E7,#EEF2EF)}.r28-addons .r7-addon-art svg{filter:grayscale(1) sepia(.45) hue-rotate(95deg) saturate(1.3) opacity(.75)}'
   /* 多航段搜尋（.mc-search）：拿掉卡片裡再一層卡片，改成跟單程／來回同一種「標籤＋底線欄位」的寫法，航段之間用細線串起來 */
   +'#app .mc-search{border:0;box-shadow:none;background:none;padding:6px 2px 0}'
   +'#app .mc-search .k134-route{background:#F7F5EF;border:0;border-radius:12px;padding:12px 16px;margin:10px 0 6px}'
   +'#app .mc-search .mc-seg{position:relative;border:0;border-bottom:1px solid #EEF0EC;border-radius:0;background:none;box-shadow:none;margin:0;padding:18px 4px 16px;transform:none}'
   +'#app .mc-search .mc-seg:hover{box-shadow:none;transform:none;background:linear-gradient(90deg,rgba(11,58,46,.025),transparent)}'
   +'#app .mc-search .mc-num{width:30px;height:30px;font:700 13px system-ui,sans-serif;background:#fff;color:#0B3D2E;border:1.5px solid #0B3D2E;box-shadow:none;align-self:center}'
   +'#app .mc-search .mc-label{font:700 10.5px system-ui,sans-serif;letter-spacing:.14em;color:#8A938E;text-transform:uppercase}'
   +'#app .mc-search .mc-seg select.inp,#app .mc-search .mc-seg input.inp,#app .mc-search .mc-seg button.inp{border:0;border-bottom:1.5px solid #D9DED9;border-radius:0;background-color:transparent;padding:6px 26px 7px 0;height:40px!important;font:600 15.5px inherit;font-family:inherit;color:#14231D;box-shadow:none}'
   +'#app .mc-search .mc-seg select.inp:focus,#app .mc-search .mc-seg input.inp:focus,#app .mc-search .mc-seg button.inp:focus{border-bottom-color:#0B3D2E;outline:none}'
   +'#app .mc-search .k134-add{width:auto;margin:14px 0 4px;padding:10px 18px;border:1px dashed rgba(176,138,62,.6);border-radius:999px;background:#FFFCF5;color:#0B3D2E;font:600 13.5px inherit;font-family:inherit}'
   +'#app .mc-search .k134-add:hover{background:#0B3D2E;color:#fff;border-color:#0B3D2E}'
   /* 1101B：航點改用主表單同一個機場選擇器（.apbig）；這裡只調大小，底線跟其他欄位一致 */
   +'#app .mc-search .k29-mcap .apbig{font-size:19px;line-height:1.35;padding:4px 22px 7px 0;border-bottom:1.5px solid #D9DED9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
   +'#app .mc-search .k29-mcap .apbig:focus{border-bottom-color:#0B3D2E}'
   +'#app .mc-search .k29-mcap .k29-ph{font:500 15px system-ui,sans-serif;color:#8A938E}'
   +'#app .mc-search .mc-remove{border-radius:999px}#app .mc-search .mc-seg button.inp{text-align:left;width:100%;background-image:linear-gradient(transparent,transparent)}#app .mc-search .mc-seg button.inp:before{content:"\\1F4C5";font-size:13px;margin-right:8px;opacity:.55}'
   +'.k28-ci-why{display:block;margin-top:6px;font-size:11.5px;color:#7A857F;text-align:center;letter-spacing:.02em}';
    document.head.appendChild(cs)}catch(_){}
})();
