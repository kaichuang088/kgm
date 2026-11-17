
/* ══ 1118A H1／H3／H4（使用者：「用戶端的主畫面你可以重新設計 我有點看膩了 還有選擇航班的介面（一般航班）要有質感喔 要Organized」
       「手機平板介面也要漂亮喔」）══
   不新增層、不動訂位流程，原本的搜尋、酬賓、團體、多航段、日期／旅客選擇、目的地卡片、篩選、選票價全部照舊（同一批按鈕與函式），只重新排版：
   · 首頁：主視覺改成左右兩欄（左：標語＋數字，右：新機隊精選卡），保留 mo12 首頁動畫要找的 h1／金色 span／航線 svg；
     訂位面板改成「訂位主控台」（行程類型、預訂／酬賓同一列，欄位排成一格一格）；面板下加「快速服務」六格（我的行程、線上報到、航班動態、酬賓與里程、行李與飛行準備、團體訂位）；
     目的地卡片改成整齊的橫式卡片（桌機兩欄、平板兩欄、手機橫向滑動）。
   · 選擇航班（一般航班）：上方航線摘要列（出發地→目的地、日期、旅客、艙等、修改搜尋）；日期條改成膠囊；航班列改成一張一張的卡片（時刻、飛行時間、直飛／轉機、班號機型、最低票價），
     手機沿用 mb20b 的上下卡片，只調字級與間距。
   · 只在 html 加 class（fe118-home／fe118-sel），其他頁一律不受影響。 */
(function(){
  if(window.__fe118)return;window.__fe118=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var ICON={
    trip:'<path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><rect x="4" y="7" width="16" height="12" rx="2.5"/><path d="M4 12h16"/>',
    checkin:'<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2 2 0 0 0 0 5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5a2 2 0 0 0 0-5Z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    status:'<path d="M3 15.5 21 9"/><path d="m10.5 12.8-3.2-5.3 1.6-.6 5.4 4.2"/><path d="M4 20h16"/>',
    miles:'<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>',
    bag:'<rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9 7V4.5h6V7"/><path d="M9 11v5M15 11v5"/>',
    pet:'<circle cx="7" cy="9.5" r="1.8"/><circle cx="10.5" cy="6.5" r="1.8"/><circle cx="14.5" cy="6.5" r="1.8"/><circle cx="18" cy="9.5" r="1.8"/><path d="M12.5 11.5c-2.6 0-5 3.1-5 5.4 0 1.6 1.2 2.6 2.7 2.6 1 0 1.6-.5 2.3-.5s1.3.5 2.3.5c1.5 0 2.7-1 2.7-2.6 0-2.3-2.4-5.4-5-5.4Z"/>'};
  function ic(k){return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[k]+'</svg>'}
  function tiles(){var zh=z(),T=[
      ['trip',zh?'我的行程':'My trips',zh?'查詢訂位、選位、加購':'Bookings, seats, extras',"nav('mytrip')"],
      ['checkin',zh?'線上報到':'Check in',zh?'起飛前開放，登機證存手機':'Online check-in & boarding pass',"nav('mytrip')"],
      ['status',zh?'航班動態':'Flight status',zh?'起降時間、登機門':'Times and gates',"nav('status')"],
      ['miles',zh?'酬賓與里程':'Awards & miles',zh?'里程兌換、升等、會籍':'Redeem, upgrade, tiers',"nav('miles_page')"],
      ['bag',zh?'行李與飛行準備':'Baggage & travel prep',zh?'行李額度、證件、機上服務':'Allowance, documents, onboard',"S.prepTab='bag';nav('prep')"],
      ['pet',zh?'寵物同行':'Travelling with pets',zh?'申請攜帶寵物搭機':'Apply to bring your pet',"S.view='pet28';render()"]];   /* 團體訂位只有團體帳號看得到（menuHide 會藏），這裡放人人都能用的 */
    return '<section class="fe118-quick" aria-label="'+(zh?'快速服務':'Quick services')+'"><div class="fe118-wrap"><div class="fe118-qh"><span>'+(zh?'快速服務':'Quick services')+'</span></div><div class="fe118-qgrid">'
      +T.map(function(t){return '<button type="button" class="fe118-q" onclick="'+t[3]+'"><i>'+ic(t[0])+'</i><b>'+E(t[1])+'</b><small>'+E(t[2])+'</small></button>'}).join('')+'</div></div></section>'}
  /* ── 首頁：原本的 homeView 產生字串後，重排主視覺、標記訂位面板、加快速服務 ── */
  function reshape(html){
    var d=document.createElement('div');d.innerHTML=html;var root=d.firstElementChild;if(!root)return html;
    var hero=root.firstElementChild,searchWrap=hero&&hero.nextElementSibling;if(!hero||!searchWrap)return html;
    hero.classList.add('fe118-hero');searchWrap.classList.add('fe118-searchwrap');var card=searchWrap.querySelector('.card');if(card)card.classList.add('fe118-console');
    var inner=hero.lastElementChild;if(!inner||!inner.querySelector('h1'))return html;inner.classList.add('fe118-hero-in');
    var chip=inner.children[0],h1=inner.querySelector('h1'),p=inner.querySelector('p'),stats=inner.children[inner.children.length-1];
    var zh=z(),promoTitle=h1.innerHTML,promoText=p?p.innerHTML:'',chipTxt=chip?chip.textContent.trim():'';
    var left=document.createElement('div');left.className='fe118-hl';
    left.innerHTML='<div class="fe118-eyebrow"><span></span>KGM AIRWAYS<em> · '+(zh?'寰宇一家 oneworld 成員':'A oneworld member')+'</em></div>'
      +'<h1>'+(zh?'從台北出發，<br>飛往<span>世界</span>的每一段旅程':'From Taipei to <span>everywhere</span> worth going')+'</h1>'
      +'<p class="fe118-lede">'+(zh?'訂位、報到、行程管理，一個地方全部完成。':'Book, check in and manage your trip in one place.')+'</p>';
    if(stats){stats.classList.add('fe118-stats');left.appendChild(stats)}
    var promo=document.createElement('aside');promo.className='fe118-promo';
    promo.innerHTML='<div class="fe118-pchip">'+E(chipTxt||(zh?'全新機隊':'New aircraft'))+'</div><div class="fe118-ptitle">'+promoTitle.replace(/<span[^>]*>/g,'<em>').replace(/<\/span>/g,'</em>')+'</div><div class="fe118-ptext">'+promoText+'</div>'
      +'<div class="fe118-pfoot"><span>'+(zh?'寬體客艙 · 平躺式商務艙 · 全機 Wi-Fi':'Widebody cabins · Flat-bed business · Wi-Fi')+'</span></div>';
    while(inner.firstChild)inner.removeChild(inner.firstChild);inner.appendChild(left);inner.appendChild(promo);
    searchWrap.insertAdjacentHTML('afterend',tiles());
    return d.innerHTML}
  function hookHome(){var H=window.homeView;if(typeof H!=='function'||H.__fe118)return;
    var w=function(){var h=H.apply(this,arguments);try{if(S.view==='home'||!S.view)return reshape(String(h))}catch(e){try{console.warn('fe118 home',e)}catch(_){}}return h};
    try{Object.keys(H).forEach(function(k){if(!(k in w))w[k]=H[k]})}catch(_){}w.__fe118=1;window.homeView=w;try{homeView=w}catch(_){}}
  hookHome();[0,1500,4000,12000].forEach(function(t){setTimeout(hookHome,t)});
  /* ── 選擇航班：航線摘要列 ── */
  var CABZ={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙'};
  function wd(iso){try{var d=new Date(iso+'T12:00:00Z');return (z()?'週'+'日一二三四五六'[d.getUTCDay()]:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()])}catch(_){return ''}}
  function selBar(){var s=S.search||{},zh=z(),inb=S.phase==='sel_inb',fr=inb?s.to:s.fr,to=inb?s.fr:s.to,dt=inb?s.ret:s.dep,n=0;
    try{var pc=passengerCounts();n=pc.total}catch(_){n=1}
    var city=function(a){try{return (typeof CITY==='function'&&CITY(a))||a}catch(_){return a}};
    return '<div class="fe118-selbar" data-fe118="'+E([fr,to,dt,n,s.cabin,S.phase].join('|'))+'"><div class="fe118-sb-route"><small>'+(inb?(zh?'回程':'Return'):(zh?'去程':'Outbound'))+'</small><div><b>'+E(fr)+'</b><span>'+E(city(fr))+'</span></div><i>→</i><div><b>'+E(to)+'</b><span>'+E(city(to))+'</span></div></div>'
      +'<div class="fe118-sb-meta"><span><small>'+(zh?'日期':'Date')+'</small><b>'+E(String(dt||'').replace(/-/g,'/'))+' '+E(wd(dt))+'</b></span><span><small>'+(zh?'旅客':'Travellers')+'</small><b>'+n+(zh?' 位':'')+'</b></span><span><small>'+(zh?'艙等':'Cabin')+'</small><b>'+E(zh?(CABZ[s.cabin]||s.cabin||'經濟艙'):(s.cabin||'Economy'))+'</b></span>'
      +'<button type="button" class="fe118-sb-edit" onclick="nav(\'home\')">'+(zh?'修改搜尋':'Edit search')+'</button></div></div>'}
  function paint(){try{
    var h=document.documentElement,front=S.view!=='admin',home=front&&S.view==='home',sel=front&&S.view==='booking'&&/^sel_(out|inb)$/.test(String(S.phase||''))&&S.search&&S.search.type!=='MC';
    h.classList.toggle('fe118-home',!!home);h.classList.toggle('fe118-sel',!!sel);
    if(sel){var h2=document.querySelector('#app .booking-content h2');if(h2){var host=h2.parentElement,old=host.previousElementSibling&&host.previousElementSibling.classList&&host.previousElementSibling.classList.contains('fe118-selbar')?host.previousElementSibling:null,nb=selBar();
        host.classList.add('fe118-h2row');if(!old)host.insertAdjacentHTML('beforebegin',nb);else{var t=document.createElement('div');t.innerHTML=nb;if(old.getAttribute('data-fe118')!==t.firstElementChild.getAttribute('data-fe118'))old.outerHTML=nb}}}
  }catch(e){try{console.warn('fe118',e)}catch(_){}}}
  var PT=0;function hookRender(){var r0=window.render;if(typeof r0!=='function'||r0.__fe118)return;var w=function(){var r=r0.apply(this,arguments);paint();clearTimeout(PT);PT=setTimeout(paint,60);return r};
    try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__fe118=1;window.render=w;try{render=w}catch(_){}}
  hookRender();[0,1500,4000,12000].forEach(function(t){setTimeout(hookRender,t)});setTimeout(paint,300);
  /* ── 樣式 ── */
  var C=[
  /* 首頁：主視覺 */
  'html.fe118-home .fe118-hero{min-height:440px}',
  'html.fe118-home .fe118-hero-in{display:grid!important;grid-template-columns:minmax(0,1.25fr) minmax(0,.9fr);gap:48px;align-items:center;max-width:1160px!important;padding:64px 28px 112px!important}',
  'html.fe118-home .fe118-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.62);font-weight:600}',
  'html.fe118-home .fe118-eyebrow span{width:28px;height:1px;background:var(--gold2)}html.fe118-home .fe118-eyebrow em{font-style:normal}',
  'html.fe118-home .fe118-hl h1{font-family:Georgia,"Noto Serif TC",serif;font-weight:400;color:#fff;font-size:clamp(32px,4.4vw,54px);line-height:1.14;letter-spacing:-.01em;margin:18px 0 0;max-width:none}',
  'html.fe118-home .fe118-hl h1 span{color:var(--gold2)}',
  'html.fe118-home .fe118-lede{color:rgba(255,255,255,.66);font-size:15px;line-height:1.7;margin:16px 0 0;max-width:40ch}',
  'html.fe118-home .fe118-stats{margin-top:34px!important;gap:0!important;display:flex!important}',
  'html.fe118-home .fe118-stats>div{padding:0 28px;border-left:1px solid rgba(255,255,255,.14)}html.fe118-home .fe118-stats>div:first-child{padding-left:0;border-left:0}',
  'html.fe118-home .fe118-promo{position:relative;border:1px solid rgba(201,166,97,.32);border-radius:20px;padding:26px 26px 22px;background:linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02));box-shadow:0 30px 60px -30px rgba(0,0,0,.55);backdrop-filter:blur(6px)}',
  'html.fe118-home .fe118-pchip{display:inline-block;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#0B2A20;background:var(--gold2);border-radius:999px;padding:4px 11px;font-weight:800}',
  'html.fe118-home .fe118-ptitle{font-family:Georgia,"Noto Serif TC",serif;color:#fff;font-size:24px;line-height:1.3;margin-top:14px}html.fe118-home .fe118-ptitle em{font-style:normal;color:var(--gold2)}',
  'html.fe118-home .fe118-ptext{color:rgba(255,255,255,.62);font-size:13px;line-height:1.7;margin-top:10px}',
  'html.fe118-home .fe118-pfoot{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:11.5px;color:rgba(255,255,255,.5);letter-spacing:.04em}',
  /* 首頁：訂位主控台 */
  'html.fe118-home .fe118-searchwrap{max-width:1160px!important;margin-top:-74px!important;padding:0 28px!important}',
  'html.fe118-home .fe118-console{border-top:0!important;border-radius:22px!important;padding:22px 26px 24px!important;box-shadow:0 24px 60px -24px rgba(11,42,32,.35),0 2px 0 rgba(201,166,97,.55) inset!important}',
  'html.fe118-home .fe118-console>div:first-child{display:inline-flex!important;gap:4px!important;border:0!important;background:#EEF3F0;border-radius:999px;padding:4px;margin-bottom:14px!important}',
  'html.fe118-home .fe118-console .ntab{border:0!important;border-radius:999px!important;padding:7px 18px!important;font-size:13px!important;color:#4A5A53!important;background:transparent!important}',
  'html.fe118-home .fe118-console .ntab.act{background:#0B3D2E!important;color:#fff!important;font-weight:700!important;box-shadow:none!important}',
  'html.fe118-home .fe118-console .ntab:after,html.fe118-home .fe118-console .ntab::before{display:none!important}',
  'html.fe118-home .fe118-console>div:nth-child(2){display:inline-flex!important;gap:4px!important;margin:0 0 14px 10px!important;padding:4px;border-radius:999px;background:#F6F1E6;vertical-align:top}',
  'html.fe118-home .fe118-console>div:nth-child(2)>button{border-radius:999px!important;box-shadow:none!important;padding:7px 16px!important;font-size:13px!important;background:transparent!important;color:#6B5A36!important;font-weight:600!important}',
  'html.fe118-home .fe118-console>div:nth-child(2)>button[style*="font-weight:800"]{background:#fff!important;color:#0B3D2E!important;font-weight:800!important;box-shadow:0 1px 4px rgba(0,0,0,.08)!important}',
  'html.fe118-home .fe118-console .btn.btn-g{height:52px;border-radius:14px!important;font-size:15.5px!important;letter-spacing:.06em;background:linear-gradient(180deg,#145A44,#0B3D2E)!important;box-shadow:0 10px 24px -12px rgba(11,61,46,.8)!important;margin-top:16px}',
  /* 快速服務 */
  '.fe118-quick{margin:34px 0 8px}.fe118-wrap{max-width:1160px;margin:0 auto;padding:0 28px}',
  '.fe118-qh{display:flex;align-items:center;gap:12px;margin-bottom:14px}.fe118-qh span{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold,#A88A4E);font-weight:800}.fe118-qh:after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(168,138,78,.4),transparent)}',
  '.fe118-qgrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}',
  '.fe118-q{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;border:1px solid #E3E9E5;background:#fff;border-radius:16px;padding:16px 16px 15px;cursor:pointer;color:#0F2A21;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;font-family:inherit}',
  '.fe118-q:hover{transform:translateY(-2px);box-shadow:0 14px 30px -18px rgba(11,61,46,.45);border-color:#C9D8CF}',
  '.fe118-q i{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#EEF4F0;color:#0B3D2E;margin-bottom:8px}',
  '.fe118-q b{font-size:14px;font-weight:800}.fe118-q small{font-size:11.5px;color:#6A7771;line-height:1.45}',
  /* 目的地卡片：橫式、兩欄 */
  'html.fe118-home .r11-dest-wrap{max-width:1160px!important;padding-left:28px!important;padding-right:28px!important;margin-top:34px!important}',
  '@media (min-width:641px){html.fe118-home .r11-dest-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important}',
  ' html.fe118-home .r11-dest{display:grid!important;grid-template-columns:200px minmax(0,1fr);border-radius:18px!important;overflow:hidden;min-height:0!important}',
  ' html.fe118-home .r11-dest .r11-photo{height:auto!important;min-height:190px}',
  ' html.fe118-home .r11-dest .r11-oval{width:120px!important;height:120px!important}',
  ' html.fe118-home .r11-dest .r11-body{padding:18px 20px!important;display:flex;flex-direction:column;justify-content:center}',
  ' html.fe118-home .r11-dest .r11-price{font-size:26px!important}}',
  /* 選擇航班：摘要列 */
  '.fe118-selbar{display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;background:#0B3D2E;color:#fff;border-radius:18px;padding:16px 22px;margin:4px 0 14px;box-shadow:0 18px 40px -26px rgba(11,42,32,.7)}',
  '.fe118-sb-route{display:flex;align-items:center;gap:14px}.fe118-sb-route>small{font-size:10.5px;letter-spacing:.2em;color:var(--gold2,#D6B676);text-transform:uppercase;font-weight:800;margin-right:4px}',
  '.fe118-sb-route b{display:block;font-family:Georgia,serif;font-size:26px;font-weight:400;line-height:1}.fe118-sb-route div span{display:block;font-size:11.5px;color:rgba(255,255,255,.6);margin-top:3px}.fe118-sb-route i{font-style:normal;color:var(--gold2,#D6B676);font-size:20px}',
  '.fe118-sb-meta{display:flex;align-items:center;gap:22px;flex-wrap:wrap}.fe118-sb-meta span small{display:block;font-size:10.5px;color:rgba(255,255,255,.55);letter-spacing:.08em}.fe118-sb-meta span b{font-size:14px;font-weight:700}',
  '.fe118-sb-edit{border:1px solid rgba(214,182,118,.6);background:transparent;color:#F3E3BE;border-radius:999px;padding:8px 16px;font:700 12.5px inherit;cursor:pointer}.fe118-sb-edit:hover{background:rgba(214,182,118,.14)}',
  'html.fe118-sel .fe118-h2row{display:none!important}',
  'html.fe118-sel .booking-content table thead,html.fe118-sel.fe118-sel body #app table:has(>tbody>tr.fl-row)>thead,html.fe118-sel.fe118-sel body #app table:has(>tbody>tr.fl-row)>thead>tr{display:none!important}',   /* 手機那層（mb20b）把表頭改成深色橫條，卡片式不需要 */
  /* 選擇航班：日期條 */
  'html.fe118-sel .daystrip{border:0!important;background:transparent!important;box-shadow:none!important;gap:8px!important;padding:2px 0!important}',
  'html.fe118-sel .daystrip .daychip{border:1px solid #E1E8E4!important;border-radius:14px!important;background:#fff!important;margin:0!important;transition:border-color .15s,box-shadow .15s}',
  'html.fe118-sel .daystrip .daychip:hover{border-color:#B9CCC1!important}',
  'html.fe118-sel .daystrip .daychip.on{background:#0B3D2E!important;border-color:#0B3D2E!important;box-shadow:0 10px 22px -14px rgba(11,61,46,.9)!important}',
  'html.fe118-sel .daystrip .daynav{border:1px solid #E1E8E4!important;border-radius:12px!important;background:#fff!important}',
  /* 選擇航班：航班卡片（桌機／平板；手機沿用 mb20b 的上下卡片） */
  '@media (min-width:641px){',
  ' html.fe118-sel .booking-content table{border-collapse:separate!important;border-spacing:0 12px!important;background:transparent!important}',
  ' html.fe118-sel .booking-content table thead{display:none!important}',
  ' html.fe118-sel .booking-content div:has(>table){background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important}',
  ' html.fe118-sel tr.fl-row{outline:0!important}',
  ' html.fe118-sel .booking-content tr.fl-row>td{background:#fff!important;border-top:1px solid #E3E9E5!important;border-bottom:1px solid #E3E9E5!important;transition:box-shadow .18s,border-color .18s}',
  ' html.fe118-sel tr.fl-row>td:first-child{border-left:1px solid #E3E9E5!important;border-radius:18px 0 0 18px}',
  ' html.fe118-sel tr.fl-row>td:last-child{border-right:1px solid #E3E9E5!important;border-radius:0 18px 18px 0;border-left:1px dashed #DCE4DF!important;background:#FBFCFB!important}',
  ' html.fe118-sel tr.fl-row:hover>td{border-color:#C3D3CA!important;box-shadow:0 16px 30px -24px rgba(11,61,46,.55)}',
  ' html.fe118-sel tr.fl-row>td:last-child .btn,html.fe118-sel tr.fl-row>td:last-child button{border-radius:12px!important}',
  '}',
  /* 平板 */
  '@media (max-width:1100px){html.fe118-home .fe118-qgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}',
  '@media (max-width:900px){html.fe118-home .fe118-hero-in{grid-template-columns:1fr;gap:26px;padding:48px 24px 104px!important}html.fe118-home .fe118-promo{max-width:560px}}',
  '@media (min-width:641px) and (max-width:900px){html.fe118-home .r11-dest-grid{grid-template-columns:1fr!important}}',
  /* 手機 */
  '@media (max-width:640px){',
  ' html.fe118-home .fe118-hero-in{padding:30px 18px 92px!important;gap:18px}',
  ' html.fe118-home .fe118-eyebrow{font-size:10px;letter-spacing:.16em}html.fe118-home .fe118-eyebrow span{width:18px}html.fe118-home .fe118-eyebrow em{display:none}',
  ' html.fe118-home .fe118-hl h1{font-size:30px;margin-top:12px}html.fe118-home .fe118-lede{font-size:13.5px;margin-top:10px}',
  ' html.fe118-home .fe118-stats{margin-top:20px!important}html.fe118-home .fe118-stats>div{padding:0 16px}',
  ' html.fe118-home .fe118-promo{padding:18px 18px 16px;border-radius:16px}html.fe118-home .fe118-ptitle{font-size:19px}html.fe118-home .fe118-ptext{display:none}',
  ' html.fe118-home .fe118-searchwrap{padding:0 12px!important;margin-top:-64px!important}html.fe118-home .fe118-console{padding:16px 14px 18px!important;border-radius:20px!important}',
  ' html.fe118-home .fe118-console>div:first-child{display:flex!important;width:100%}html.fe118-home .fe118-console .ntab{flex:1}',
  ' .fe118-wrap{padding:0 14px}.fe118-qgrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
  ' .fe118-q{align-items:center;text-align:center;padding:14px 6px 12px;border-radius:14px}.fe118-q i{margin-bottom:4px}.fe118-q b{font-size:12.5px}.fe118-q small{display:none}',
  ' html.fe118-home .r11-dest-wrap{padding-left:14px!important;padding-right:14px!important}',
  ' .fe118-selbar{padding:14px 16px;border-radius:16px;gap:10px}.fe118-sb-route b{font-size:21px}.fe118-sb-meta{gap:14px;width:100%}.fe118-sb-edit{margin-left:auto}',
  '}'
  ].join('\n');
  try{var st=document.createElement('style');st.id='fe118-css';st.textContent=C;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
