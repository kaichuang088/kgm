/* 0928B · 行程管理（使用者：「我不知道為什麼有的時候還是進得去舊版行程管理頁面…我不想再看到舊的介面了。
   員工票進去行程管理只能『更改』或『取消』票，其他動作都要鎖，取消是免任何手續費，改票要補差價（按照員工選擇的方案去補對應價格
   不是按照原價），員工票無法進行里程升等。」）
   ① 舊版不見：新版行程管理（.k56-trip）是插在舊版（.r25-up：「← 顯示我的全部行程／查詢其他訂位／即將到來的航班／行程服務」）前面，
      再把舊版藏起來 —— 但同一筆訂位重畫時，r56 看到內容沒變就直接 return，舊版被重新畫出來後沒有人再藏，於是往下捲就看到舊介面
      （而且可能是另一筆訂位的報到按鈕）。改成每次都先藏，並加一條樣式：新版之後的舊區塊一律不顯示。
   ② 員工票：只能更改／取消；報到、選位、行李、特殊服務、餐點、哩程升等、加購退款全部鎖住（畫面標示＋按了也不會動）。
      取消免手續費、依方案實付金額退；改票依方案比例（免費 0%、ID90 10%、ID50 50%、ID25 75%、ZED 35%）計算新舊票價差額，不收改票手續費。 */
RL('k56 always hide old','kgm-0823d-r56',
"    var box=app.querySelector('.k56-trip');\n    if(box&&box.getAttribute('data-k')===key)return;",
"    var box=app.querySelector('.k56-trip');\n"
+"    /* 0928B：每次都先把舊版藏起來（原本內容沒變就直接 return，舊版重畫出來後沒人藏） */\n"
+"    ['.r25-up','.r25-h','.r25-grid','.r25-note','.r28-ci-box'].forEach(function(sel){app.querySelectorAll(sel).forEach(function(e){if(e.closest&&e.closest('.k56-trip'))return;e.style.display='none'})});\n"
+"    if(box&&box.getAttribute('data-k')===key)return;",1);
RL('k56 css hide old','kgm-0823d-r56',
"':root{--k56-g:#0b493b;--k56-gold:#a77d33}',",
"':root{--k56-g:#0b493b;--k56-gold:#a77d33}',\n'.k56-trip~.r25-up,.k56-trip~.r25-h,.k56-trip~.r25-grid,.k56-trip~.r25-note,.k56-trip~.r28-ci-box,.k56-trip~* .r25-up,.k56-trip~* .r25-grid,.k56-trip~* .r28-ci-box{display:none!important}',   /* 0928B：新版之後的舊區塊一律不顯示 */",1);
/* 取消：員工票免手續費、依方案實付金額 */
RL('r60 staff fare','kgm-0823g-r60',
"  try{v=owPrice(Object.assign({},f,{date:s.date||f.date}),cls,pax)||0}catch(_){v=0}\n  return Math.round(v);",
"  try{v=owPrice(Object.assign({},f,{date:s.date||f.date}),cls,pax)||0}catch(_){v=0}\n  try{if(window.kgmStaffPctR928)v=v*window.kgmStaffPctR928(b)}catch(_){}   /* 0928B：員工票依方案實付 */\n  return Math.round(v);",1);
RL('r60 staff no fee','kgm-0823g-r60',
"    var v=window.kgmRefundFeeR60(r.cls);\n    if(v==null){nonRef=true;return}",
"    var v=(window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b))?0:window.kgmRefundFeeR60(r.cls);   /* 0928B：員工票取消免手續費 */\n    if(v==null){nonRef=true;return}",1);
RL('r60 staff no noshow','kgm-0823g-r60',
"      var ns=window.kgmNoShowFeeR60(cls);\n      if(ns==null)nonRef=true;else noShow+=ns;",
"      var ns=(window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b))?0:window.kgmNoShowFeeR60(cls);\n      if(ns==null)nonRef=true;else noShow+=ns;",1);
RL('staff manage lock','kgm-0909E-r229',
"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();",
"/* ══ 0928B：員工票行程管理 —— 只能更改／取消 ════════════════════ */\n"
+"(function(){\n"
+"  function Zs(){try{return LANG!=='en'}catch(_){return true}}\n"
+"  function bkOf(pnr){try{return (S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0]||null}catch(_){return null}}\n"
+"  window.kgmIsStaffBkR928=function(b){return !!(b&&(b.staffPricing||b.stx||b.staffTicket||b.staffTravel))};\n"
+"  window.kgmStaffPctR928=function(b){\n"
+"    if(!window.kgmIsStaffBkR928(b))return 1;\n"
+"    var p=String((b.staffPricing&&b.staffPricing.plan)||(b.stx&&b.stx.plan)||'').toUpperCase();\n"
+"    return {FREE:0,ID90:0.10,ID50:0.50,ID25:0.75,ZED:0.35}[p]!=null?{FREE:0,ID90:0.10,ID50:0.50,ID25:0.75,ZED:0.35}[p]:1;\n"
+"  };\n"
+"  function deny(){alert(Zs()?'員工票在行程管理只能「更改」或「取消」；報到請至機場櫃檯辦理，選位、行李、餐點、特殊服務與哩程升等都不開放。':'Staff tickets can only be changed or cancelled online. Check in at the airport counter; seats, bags, meals, services and mileage upgrades are not available.')}\n"
+"  function wrap(name,allow){\n"
+"    var f=window[name];if(typeof f!=='function'||f.__stx928)return;\n"
+"    var w=function(pnr,seg,kind){var b=bkOf(pnr);if(window.kgmIsStaffBkR928(b)&&!allow(kind)){deny();return}return f.apply(this,arguments)};\n"
+"    w.__stx928=1;window[name]=w;try{if(name==='tripSvcR25')tripSvcR25=w}catch(_){}\n"
+"  }\n"
+"  function install(){\n"
+"    wrap('tripSvcR25',function(k){return /^(change|cancel|refund)$/.test(String(k||''))});\n"
+"    wrap('kgmPnrGoR59',function(k){return /^(change|cancel|refund)$/.test(String(k||''))});\n"
+"    wrap('pickUpgradeFlight0813',function(){return false});\n"
+"    /* 改票：依方案比例計算差額，不收改票手續費 */\n"
+"    var q=window.kgmReissueQuoteR45;\n"
+"    if(typeof q==='function'&&!q.__stx928){\n"
+"      var wq=function(pnr){var r=q.apply(this,arguments);try{var b=bkOf(pnr);if(r&&r.ok&&window.kgmIsStaffBkR928(b)){var pct=window.kgmStaffPctR928(b);\n"
+"        r.oldFare=Math.round((+r.oldFare||0)*pct);r.newFare=Math.round((+r.newFare||0)*pct);r.fareDiff=r.newFare-r.oldFare;r.changeFee=0;r.total=r.fareDiff;\n"
+"        r.direction=r.total>0?'collect':(r.total<0?'refund':'even');r.staffPctR928=pct}}catch(_){}return r};\n"
+"      wq.__stx928=1;window.kgmReissueQuoteR45=wq;\n"
+"    }\n"
+"  }\n"
+"  install();setTimeout(install,0);setTimeout(install,1500);\n"
+"  /* 畫面：員工票的行程管理，除了更改／取消（與電子機票文件）之外的按鈕都標成鎖住 */\n"
+"  function paint(){\n"
+"    try{\n"
+"      var box=document.querySelector('#app .k56-trip');if(!box)return;\n"
+"      var pnr=((box.querySelector('.k56-pnr b')||{}).textContent||S.mtOnly||'').trim(),b=bkOf(pnr);\n"
+"      if(!window.kgmIsStaffBkR928(b))return;\n"
+"      box.querySelectorAll('button').forEach(function(el){\n"
+"        var oc=String(el.getAttribute('onclick')||'');\n"
+"        if(/'(change|cancel)'\\)|kgmTripDoc|k56-chev/.test(oc)||el.classList.contains('k56-chev')||el.classList.contains('k928-stx-ok'))return;\n"
+"        if(el.classList.contains('k928-stx-lock'))return;\n"
+"        el.classList.add('k928-stx-lock');el.setAttribute('disabled','');el.setAttribute('title',Zs()?'員工票不開放此項目':'Not available for staff tickets');\n"
+"      });\n"
+"      if(!box.querySelector('.k928-stx-note')){var n=document.createElement('div');n.className='k928-stx-note';\n"
+"        n.innerHTML='<b>'+(Zs()?'員工票':'Staff ticket')+'</b>'+(Zs()?'　只能更改或取消。取消免任何手續費；改票依你選擇的方案（'+String((b.staffPricing&&b.staffPricing.plan)||(b.stx&&b.stx.plan)||'').toUpperCase()+'）比例補差價；報到請至機場櫃檯，選位、行李、餐點、特殊服務與哩程升等不開放。':'　Change or cancel only. Cancellation is free; changes are priced at your plan rate.');\n"
+"        var h=box.querySelector('.k56-head');if(h&&h.nextSibling)box.insertBefore(n,h.nextSibling);else box.insertBefore(n,box.firstChild)}\n"
+"    }catch(_){}\n"
+"  }\n"
+"  if(!document.getElementById('kgm-928-stx-css')){var st=document.createElement('style');st.id='kgm-928-stx-css';\n"
+"    st.textContent='.k928-stx-lock{opacity:.38!important;cursor:not-allowed!important;pointer-events:none!important;filter:grayscale(1)}'\n"
+"      +'.k928-stx-note{border:1px solid #e3d6b4;background:#fdf7ea;color:#6b5418;border-radius:12px;padding:10px 14px;margin:0 0 14px;font-size:12px;line-height:1.8}'\n"
+"      +'.k928-stx-note b{display:inline-block;background:#8a6d1f;color:#fff;border-radius:999px;padding:1px 10px;margin-right:6px;font-size:11px}';\n"
+"    (document.head||document.documentElement).appendChild(st)}\n"
+"  var RAF=0;function hook(){var app=document.getElementById('app');if(!app)return false;if(app.__k928stx)return true;app.__k928stx=1;\n"
+"    new MutationObserver(function(){if(RAF)return;RAF=requestAnimationFrame(function(){RAF=0;paint()})}).observe(app,{childList:true,subtree:true});paint();return true}\n"
+"  if(!hook())document.addEventListener('DOMContentLoaded',hook);\n"
+"})();\n"
+"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();",1);
