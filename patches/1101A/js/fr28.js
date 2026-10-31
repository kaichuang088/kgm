
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
    var n=(S.bookings||[]).filter(function(b){return b&&b.pnr&&(!b.userId||b.userId===S.user.id)}).length;
    var d=document.createElement('div');d.className='k28-back';d.style.maxWidth=(hero.offsetWidth||1080)+'px';
    d.innerHTML='<button type="button" onclick="S.tripPickR1101A=S.mtOnly;kgmAllTripsR60()"><span aria-hidden="true">‹</span>'+(z()?'我的行程':'My trips')+'<i>'+n+'</i></button>';
    hero.parentNode.insertBefore(d,hero)}catch(_){}}
  try{var _r28=window.render;if(typeof _r28==='function'){var w28=function(){var r=_r28.apply(this,arguments);setTimeout(back28,0);return r};window.render=w28;try{render=w28}catch(_){}}}catch(_){}
  setInterval(back28,800);   /* 行程頁有些是後面的層另外畫的（不經過 window.render），補一個輕量檢查（不在行程頁就直接返回） */
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
   +'.k28-ci-why{display:block;margin-top:6px;font-size:11.5px;color:#7A857F;text-align:center;letter-spacing:.02em}';
    document.head.appendChild(cs)}catch(_){}
})();
