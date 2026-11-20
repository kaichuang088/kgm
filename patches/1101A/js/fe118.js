
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
  /* ── 首頁（1118A 第二輪：使用者「主畫面記得要改喔 我看還是長得一樣」→ 整個換掉）：
       淺色主視覺（不再是深綠色整條）、右邊「今日桃園出發」看板（讀航班動態機場看板同一份 kgmTpeBoardRowsR1019A，不另算）、
       訂位主控台獨立一張、快速服務一條。mo12 動畫要找的 h1／金色 span／svg[viewBox="0 0 1200 340"] 照舊在 hero 裡；
       看板不放在最後一格（mo12 會把最後一格裡的數字從 0 數上來，最後一格留給統計數字）。 ── */
  function tpeNow(){var d=new Date(Date.now()+8*3600000);return {date:d.toISOString().slice(0,10),min:d.getUTCHours()*60+d.getUTCMinutes(),hm:d.toISOString().slice(11,16)}}
  function mnOf(t){var m=/^(\d{1,2}):(\d{2})/.exec(String(t||''));return m?(+m[1])*60+(+m[2]):-1}
  function cityOf(a){try{return (typeof CITY==='function'&&CITY(a))||a}catch(_){return a}}
  var BDC={k:'',h:''};
  function boardRows(){var R=window.kgmTpeBoardRowsR1019A;if(typeof R!=='function')return [];var n=tpeNow(),out=[];
    try{R('dep',n.date).forEach(function(r){if(r.al!=='KGM')return;var m=mnOf(r.act);if(m<0)m=r.schMin;if(m>=n.min&&out.length<5)out.push({r:r,tm:0})})}catch(_){}
    if(out.length<5){try{var t=new Date(n.date+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+1);R('dep',t.toISOString().slice(0,10)).forEach(function(r){if(r.al==='KGM'&&out.length<5)out.push({r:r,tm:1})})}catch(_){}}
    return out}
  function board(){var zh=z(),n=tpeNow(),k=n.date+'|'+n.hm+'|'+zh+'|'+Object.keys(S.flightOverrides||{}).length;if(BDC.k===k)return BDC.h;
    var L=boardRows();if(!L.length){BDC={k:k,h:''};return ''}
    var rows=L.map(function(x){var r=x.r,cx=(r.ov&&r.ov.status)==='Cancelled',ch=r.act&&r.sch&&r.act!==r.sch;
      return '<li class="fe118-br'+(cx?' cx':'')+'"><span class="fe118-bt">'+E(r.act||r.sch)+(ch?'<s>'+E(r.sch)+'</s>':'')+(x.tm?'<em>'+(zh?'明天':'Tmrw')+'</em>':'')+'</span>'
        +'<span class="fe118-bd"><b>'+E(cityOf(r.other))+'</b><small>'+E(r.other)+(r.via?' · '+(zh?'續飛 ':'then ')+E(cityOf(r.via)):'')+'</small></span>'
        +'<span class="fe118-bc">'+E(r.code)+(cx?'<i>'+(zh?'取消':'Cancelled')+'</i>':'')+'</span></li>'}).join('');
    var h='<aside class="fe118-board" aria-label="'+(zh?'今日桃園出發':'Departures from Taipei today')+'"><div class="fe118-bh"><div><small>'+(zh?'出發 · DEPARTURES':'DEPARTURES')+'</small><b>'+(zh?'桃園國際機場':'Taipei Taoyuan')+' <span>TPE</span></b></div>'
      +'<div class="fe118-clock"><small>'+(zh?'台北時間':'Taipei time')+'</small><b data-fe118clock>'+n.hm+'</b></div><button type="button" class="fe118-blink" onclick="nav(\'status\')">'+(zh?'完整機場看板':'Full board')+' →</button></div><ul>'+rows+'</ul>'
      +'<button type="button" class="fe118-bmore" onclick="nav(\'status\')">'+(zh?'完整機場看板與航班動態':'Full departures board & flight status')+' <span aria-hidden="true">→</span></button></aside>';
    BDC={k:k,h:h};return h}
  setInterval(function(){try{var c=document.querySelector('[data-fe118clock]');if(c){var hm=tpeNow().hm;if(c.textContent!==hm)c.textContent=hm}}catch(_){}},15000);
  /* ── 1120A J4（使用者：「上面最新的那個要可以透過KGM航空新聞更改」）：首頁最新消息＝KGM 航空新聞（S.r49.news，後台「KGM 航空新聞」同一份）
       裡設成「首頁顯示」的那一則；沒有設定就用最新發布的那一則。原本寫死在首頁的「全新 A21X 馬爾地夫・神戶專機」第一次開頁時存成一則新聞（設為首頁），之後一律從後台改。 ── */
  function newsAll(){try{return ((S.r49&&S.r49.news)||[]).filter(function(n){return n&&n.published!==false})}catch(_){return []}}
  function homeNews(){var L=newsAll(),h=L.filter(function(n){return n.homeR1120A})[0];if(h)return h;return L.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))})[0]||null}
  function seedNews(){try{if(typeof S==='undefined'||!S)return;S.r49=S.r49||{};S.r49.news=S.r49.news||[];var N=S.r49.news;if(N.some(function(n){return n&&(n.homeR1120A||n.id==='KGM-A21X-1120A')}))return;
      var d='2026-11-19';try{d=todayISO()}catch(_){}
      N.unshift({id:'KGM-A21X-1120A',tag:'航班／航線消息',date:d,title:'全新 A21X 馬爾地夫・神戶專機',chipR1120A:'全新機隊',
        summary:'兩款新廣體客機加入機隊。更安靜的客艙、全座直通走道的平躺式商務艙，全艙提供 Wi-Fi。',
        body:'兩款新廣體客機加入機隊。\n\n更安靜的客艙、全座直通走道的平躺式商務艙，全艙提供 Wi-Fi。\n\n航班、日期與票價以訂位頁顯示為準。',published:true,homeR1120A:true});
      try{save()}catch(_){}try{if(S.view==='home'||!S.view)render()}catch(_){}}catch(_){}}
  setTimeout(seedNews,2500);
  window.kgmNewsHomeR1120A=function(id){try{var L=(S.r49&&S.r49.news)||[];L.forEach(function(n){if(n)n.homeR1120A=(n.id===id)});try{save()}catch(_){}render()}catch(_){}};
  window.kgmNewsOpenR1120A=function(id){try{var n=newsAll().filter(function(x){return x.id===id})[0];if(!n)return;var zh=z();
      var body=typeof window.kgmNewsBodyHtmlR913==='function'?window.kgmNewsBodyHtmlR913(n.body):String(n.body||'').split(/\n+/).map(function(p){return '<p>'+E(p)+'</p>'}).join('');
      /* 1121A Q10（使用者：「前台端新聞按下去是白的（主頁那個）」）：原本寫 S.modal={title,html}，網站的視窗只認 type／data → 空白白框。
         改成自己的覆蓋視窗（不經 render，關掉不會動到首頁） */
      var old=document.getElementById('fe121news');if(old)old.remove();
      var ov=document.createElement('div');ov.id='fe121news';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
      ov.innerHTML='<div class="fe121n-box"><button type="button" class="fe121n-x" aria-label="'+(zh?'關閉':'Close')+'">×</button><div class="fe121n-meta"><span>'+E(n.tag||(zh?'最新消息':'News'))+'</span><time>'+E(n.date||'')+'</time></div><h2>'+E(n.title||'')+'</h2>'+(n.summary&&String(n.body||'').replace(/\s+/g,'').indexOf(String(n.summary).replace(/\s+/g,''))<0?'<p class="fe121n-lead">'+E(n.summary)+'</p>':'')+'<div class="fe121n-body">'+body+'</div></div>';
      function close(){ov.remove();document.removeEventListener('keydown',esc)}function esc(e){if(e.key==='Escape')close()}
      ov.addEventListener('click',function(e){if(e.target===ov||e.target.classList.contains('fe121n-x'))close()});document.addEventListener('keydown',esc);
      document.body.appendChild(ov);try{ov.querySelector('.fe121n-x').focus()}catch(_){}}catch(_){}};
  function pillHtml(chipTxt,promoTitle){var zh=z(),n=homeNews();
    if(!n)return '<div class="fe118-promo"><span class="fe118-pchip">'+E(chipTxt||(zh?'全新機隊':'New aircraft'))+'</span><span class="fe118-ptitle">'+promoTitle+'</span></div>';
    return '<button type="button" class="fe118-promo" onclick="kgmNewsOpenR1120A(\''+E(n.id)+'\')"><span class="fe118-pchip">'+E(n.chipR1120A||(zh?'最新消息':'Latest'))+'</span><span class="fe118-ptitle">'+E(n.title||'')+'</span><span class="fe120-arr" aria-hidden="true">→</span></button>'}
  function reshape(html){
    var d=document.createElement('div');d.innerHTML=html;var root=d.firstElementChild;if(!root)return html;
    var hero=root.firstElementChild,searchWrap=hero&&hero.nextElementSibling;if(!hero||!searchWrap)return html;
    hero.classList.add('fe118-hero');searchWrap.classList.add('fe118-searchwrap');var card=searchWrap.querySelector('.card');if(card)card.classList.add('fe118-console');
    var inner=hero.lastElementChild;if(!inner||!inner.querySelector('h1'))return html;
    var chip=inner.children[0],h1=inner.querySelector('h1'),stats=inner.children[inner.children.length-1];
    var zh=z(),promoTitle=h1.innerHTML.replace(/<span[^>]*>/g,'<em>').replace(/<\/span>/g,'</em>').replace(/\s+/g,' ').trim(),chipTxt=chip?chip.textContent.trim():'';
    inner.removeAttribute('style');inner.className='fe118-hero-in';
    var left=document.createElement('div');left.className='fe118-hl';
    left.innerHTML='<div class="fe118-eyebrow"><span></span>KGM AIRWAYS<em> · '+(zh?'寰宇一家 oneworld 成員':'A oneworld member')+'</em></div>'
      +'<h1>'+(zh?'把<span>世界</span>，<br>排進你的行程':'Put the <span>world</span><br>on your itinerary')+'</h1>'
      +'<p class="fe118-lede">'+(zh?'訂位、報到、航班動態與里程，一次整理好。':'Booking, check-in, flight status and miles, all in one organised place.')+'</p>'
      +'<div class="fe120-cta"><button type="button" class="fe120-go" onclick="var e=document.querySelector(\'.fe118-searchwrap\');if(e)e.scrollIntoView({behavior:\'smooth\',block:\'start\'})">'+(zh?'開始訂位':'Book a flight')+'</button><button type="button" class="fe120-link" onclick="nav(\'status\')">'+(zh?'航班動態':'Flight status')+' →</button></div>'
      +pillHtml(chipTxt,promoTitle);
    while(inner.firstChild)inner.removeChild(inner.firstChild);inner.appendChild(left);
    /* 1120A J1（使用者：「圖一這個不太好看」）：右邊深綠看板拿掉 → 機窗插畫（目的地卡片同一張插畫，每天換一個精選目的地）；今日出發改成搜尋列下面一條淺色看板 */
    inner.insertAdjacentHTML('beforeend','<aside class="fe120-win"><div class="fe120-frame"><div class="fe120-glass" data-fe120art><span class="fe120-shade"></span></div></div><button type="button" class="fe120-cap" data-fe120cap><small>'+(zh?'今日精選目的地':'Featured today')+'</small><b>—</b></button></aside>');
    if(stats&&stats!==chip&&!stats.querySelector('h1')){stats.removeAttribute('style');stats.className='fe118-stats';inner.appendChild(stats)}   /* mo12 會把最後一格的數字從 0 數上來 → 統計一定放最後 */
    searchWrap.insertAdjacentHTML('afterend',tiles());
    var bh=board();if(bh)searchWrap.insertAdjacentHTML('afterend','<div class="fe118-wrap fe118-bwrap">'+bh+'</div>');
    return d.innerHTML}
  /* 機窗插畫：從首頁目的地卡片拿同一張插畫（每天換一個） */
  function fillWin(){try{var g=document.querySelector('#app [data-fe120art]'),cap=document.querySelector('#app [data-fe120cap]');if(!g||!cap)return;
    var cards=[].slice.call(document.querySelectorAll('#app .r11-dest'));if(!cards.length)return;
    var dn=Math.floor(Date.now()/864e5),c=cards[dn%cards.length],ov=c.querySelector('.r11-oval'),bg=ov&&ov.style.backgroundImage;if(!bg)return;
    var key=dn+'|'+cards.length+'|'+bg.length;if(g.getAttribute('data-k')===key)return;g.setAttribute('data-k',key);g.style.backgroundImage=bg;
    var code='',mo=/kgmUseDestR129\('([A-Z]{3})'\)/.exec(c.getAttribute('onclick')||''),txt=String(c.innerText||'').split(/\s+/);if(mo)code=mo[1];else for(var i=0;i<txt.length;i++){if(/^[A-Z]{3}$/.test(txt[i])&&txt[i]!=='TPE'&&txt[i]!=='TWD'){code=txt[i];break}}
    var nm=code?cityOf(code):'',zh=z();if(!nm||nm===code)nm=(ov.getAttribute('aria-label')||'').trim()||code;cap.innerHTML='<small>'+(zh?'今日精選目的地':'Featured today')+'</small><b>'+E(nm)+(code?' <i>'+E(code)+'</i>':'')+'</b><span>'+(zh?'帶入搜尋':'Search')+' →</span>';
    /* 1121A P6（使用者：「這個不會真的帶入搜尋」）：卡片本身就是按鈕（onclick＝kgmUseDestR129('代號')），原本在卡片『裡面』找按鈕找不到 → 只捲動畫面。改成直接用同一個函式帶入（跟按下面那張卡片一模一樣） */
    cap.setAttribute('data-fe121c',code);cap.onclick=function(){var cd=cap.getAttribute('data-fe121c');if(cd&&typeof window.kgmUseDestR129==='function'){window.kgmUseDestR129(cd);return}var live=document.querySelector('#app .r11-dest[onclick*="\''+cd+'\'"]');if(live){live.click();return}try{var e=document.querySelector('.fe118-searchwrap');if(e)e.scrollIntoView({behavior:'smooth'})}catch(_){}}}catch(_){}}
  /* 後台「KGM 航空新聞」：每一則加「設為首頁最新消息」 */
  function adminNews(){try{if(S.view!=='admin'||S.adminTab!=='news_r49')return;var zh=z();
    [].slice.call(document.querySelectorAll('#app button[onclick^="kgmEditNewsG("]')).forEach(function(b){var m=/kgmEditNewsG\('([^']+)'\)/.exec(b.getAttribute('onclick')||'');if(!m)return;var id=m[1],n=((S.r49&&S.r49.news)||[]).filter(function(x){return x&&x.id===id})[0];if(!n)return;
      var on=!!n.homeR1120A,cur=b.parentNode.querySelector('.fe120-nh');var lab=on?(zh?'★ 首頁顯示中':'★ On home page'):(zh?'設為首頁最新消息':'Show on home page');
      if(cur){if(cur.textContent!==lab){cur.textContent=lab;cur.classList.toggle('on',on)}return}
      var x=document.createElement('button');x.type='button';x.className='btn btn-sm fe120-nh'+(on?' on':'');x.textContent=lab;x.setAttribute('onclick',"kgmNewsHomeR1120A('"+id.replace(/'/g,'')+"')");b.parentNode.insertBefore(x,b)})}catch(_){}}
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
    if(sel)selSections();
    if(home)fillWin();adminNews();
  }catch(e){try{console.warn('fe118',e)}catch(_){}}}
  /* 1120A L7／L8（使用者：「直飛轉機要分開然後要對齊」「全數賣完不要顯示」）：
     直飛、轉機各一段標題；兩張表的票價欄同寬（卡片對齊）；搜尋的艙等已售完的班次／組合不顯示（只用 CSS 藏，選票價是用清單位置選班，不能從清單拿掉）。 */
  var SOLD=/所選艙等售[罄完]|Sold out in the selected cabin|Selected cabin sold out/i;
  function selSections(){try{var zh=z(),ALL=0,SO=0,VIS=0;
    [['tr.fl-row','d',zh?'直飛':'Nonstop',zh?' 班':' flights'],['tr.k12c-row','c',zh?'轉機':'Connections',zh?' 個組合':' options']].forEach(function(K){
      var rows=[].slice.call(document.querySelectorAll('#app .booking-content '+K[0]));if(!rows.length)return;var t=rows[0].closest('table');if(!t)return;
      var vis=0;rows.forEach(function(r){var tds=r.children,last=tds[tds.length-1],so=!!(last&&SOLD.test(last.textContent||''));if(so!==(r.getAttribute('data-fe120so')==='1')){if(so)r.setAttribute('data-fe120so','1');else r.removeAttribute('data-fe120so')}
        var nx=r.nextElementSibling;if(nx&&!nx.matches(K[0])){if(so)nx.setAttribute('data-fe120so','1');else nx.removeAttribute('data-fe120so')}
        if(!so&&r.getClientRects().length)vis++;ALL++;if(so)SO++});   /* 實際看得到的（篩選 ff19 藏起來的也不算） */VIS+=vis;
      var hd=t.previousElementSibling&&t.previousElementSibling.classList&&t.previousElementSibling.classList.contains('fe120-sech')?t.previousElementSibling:null;
      var txt='<b>'+K[2]+'</b><small>'+vis+K[3]+'</small>'+(vis?'':'<em>'+(zh?'這一天搜尋的艙等都已售完':'Sold out on this date')+'</em>');
      if(!hd){hd=document.createElement('div');hd.className='fe120-sech';hd.setAttribute('data-k',K[1]);t.parentNode.insertBefore(hd,t)}
      if(hd.innerHTML!==txt)hd.innerHTML=txt});
    /* 1121A P5（使用者：「這種沒有直飛的就不要有直飛那個category」）：這一天沒有直飛、只有轉機 → 直飛那一格（只剩一列「此日期沒有直飛航班」）整格不顯示 */
    [].slice.call(document.querySelectorAll('#app .booking-content td[colspan]')).forEach(function(td){if(!/沒有直飛航班|No nonstop/.test(td.textContent||''))return;var t=td.closest('table');if(!t||t.querySelector('tr.fl-row'))return;
      var box=(t.parentElement&&t.parentElement.children.length===1&&!t.parentElement.classList.contains('booking-content'))?t.parentElement:t,on=!!document.querySelector('#app .booking-content tr.k12c-row');
      if(on!==box.hasAttribute('data-fe121nd')){if(on)box.setAttribute('data-fe121nd','1');else box.removeAttribute('data-fe121nd')}});
    /* ff19 右上角「顯示 n／m 個航班」原本把售完藏起來的也算進去（顯示 6／6，畫面只有 5 個）→ 改成實際看得到的／可訂的，售完幾班另外寫 */
    if(ALL){[].slice.call(document.querySelectorAll('#app .booking-content span,#app .booking-content em,#app .booking-content div')).some(function(el){if(el.children.length)return false;var m=/^(顯示 )?\d+／\d+ 個航班|^\d+ of \d+ flights/.exec(String(el.textContent||'').trim());if(!m)return false;
      var t=zh?'顯示 '+VIS+'／'+(ALL-SO)+' 個航班'+(SO?'・全部售完 '+SO+' 班不顯示':''):VIS+' of '+(ALL-SO)+' flights'+(SO?' · '+SO+' sold out hidden':'');if(el.textContent!==t)el.textContent=t;return true})}
  }catch(e){try{console.warn('fe120 sel',e)}catch(_){}}}
  /* 1121A R1（使用者：「圖一邊匡沒對齊」＝多航段附加服務頁）：上面「行程總覽」(.k134-rail) 是整個訂位區的寬度，
     下面附加服務卡片 (.r28-addons .r7-flight) 在較窄的置中欄位裡 → 只在附加服務頁把行程總覽的左右邊對齊到卡片（量實際位置，不猜寬度） */
  function alignRail(){try{var rail=document.querySelector('#app .k134-rail'),card=document.querySelector('#app .r28-addons .r7-flight');
      if(!rail){return}if(!card){if(rail.style.width){rail.style.width='';rail.style.marginLeft=''}return}
      var rr=rail.getBoundingClientRect(),base=rr.left-(parseFloat(getComputedStyle(rail).marginLeft)||0),cr=card.getBoundingClientRect();if(!cr.width)return;
      var ml=Math.round(cr.left-base)+'px',w=Math.round(cr.width)+'px';if(rail.style.marginLeft!==ml)rail.style.marginLeft=ml;if(rail.style.width!==w)rail.style.width=w;rail.style.boxSizing='border-box'}catch(_){}}
  setInterval(alignRail,500);window.addEventListener('resize',alignRail);
  var PT=0;function hookRender(){var r0=window.render;if(typeof r0!=='function'||r0.__fe118)return;var w=function(){var r=r0.apply(this,arguments);paint();alignRail();clearTimeout(PT);PT=setTimeout(paint,60);return r};
    try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__fe118=1;window.render=w;try{render=w}catch(_){}}
  hookRender();[0,1500,4000,12000].forEach(function(t){setTimeout(hookRender,t)});setTimeout(paint,300);
  /* ── 樣式 ── */
  var C=[
  /* 首頁：主視覺（1120A：淺色；左標語＋按鈕＋最新消息、右機窗插畫、左下統計；原本的航線線條不畫（穿過文字）） */
  'html.fe118-home body,html.fe118-home #app{background:#F7F3EA!important}',
  'html.fe118-home .fe118-hero{background:radial-gradient(60% 80% at 88% 18%,#EFE4CD 0%,rgba(239,228,205,0) 70%),linear-gradient(180deg,#F4EEE2 0%,#F7F3EA 100%)!important;overflow:hidden}',
  'html.fe118-home .fe118-hero>div:first-child,html.fe118-home .fe118-hero>div:nth-child(2),html.fe118-home .fe118-hero .k12h-fly{display:none!important}',
  'html.fe118-home .fe118-hero-in{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-areas:"hl win" "st win";column-gap:64px;row-gap:40px;align-items:center;max-width:1200px;margin:0 auto;padding:56px 32px 52px}',
  'html.fe118-home .fe118-hl{grid-area:hl;min-width:0;align-self:end}html.fe118-home .fe118-stats{grid-area:st;align-self:start}html.fe120-win,html.fe118-home .fe120-win{grid-area:win}',
  'html.fe118-home .fe118-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8A7444;font-weight:700}',
  'html.fe118-home .fe118-eyebrow span{width:28px;height:1px;background:#A9802F}html.fe118-home .fe118-eyebrow em{font-style:normal;color:#9A9384}',
  'html.fe118-home .fe118-hl h1{font-family:Georgia,"Noto Serif TC",serif;font-weight:400;color:#0B2A20;font-size:clamp(40px,5vw,66px);line-height:1.08;letter-spacing:-.015em;margin:22px 0 0;max-width:none}',
  'html.fe118-home .fe118-hl h1 span{--gold2:#A9802F;color:#A9802F}',
  'html.fe118-home .fe118-lede{color:#56635D;font-size:16.5px;line-height:1.75;margin:18px 0 0;max-width:34ch}',
  'html.fe118-home .fe120-cta{display:flex;align-items:center;gap:18px;margin-top:28px}',
  'html.fe118-home .fe120-go{border:0;border-radius:999px;padding:14px 28px;background:linear-gradient(180deg,#145A44,#0B3D2E);color:#fff;font:inherit;font-size:15px;font-weight:800;letter-spacing:.06em;cursor:pointer;box-shadow:0 14px 28px -14px rgba(11,61,46,.75)}',
  'html.fe118-home .fe120-go:hover{filter:brightness(1.08)}html.fe118-home .fe120-link{border:0;background:none;padding:6px 0;font:inherit;font-size:14px;font-weight:700;color:#0B3D2E;cursor:pointer;border-bottom:1px solid #C9B78F}',
  'html.fe118-home .fe118-promo{display:flex;align-items:center;gap:12px;margin-top:30px;padding:8px 18px 8px 8px;border-radius:999px;background:#fff;border:1px solid #E6DCC6;box-shadow:0 10px 24px -18px rgba(80,60,20,.45);max-width:100%;width:fit-content;box-sizing:border-box;font:inherit;text-align:left;cursor:pointer;color:inherit}',
  'html.fe118-home button.fe118-promo:hover{border-color:#C9B78F}',
  'html.fe118-home .fe118-pchip{flex:0 0 auto;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#fff;background:#0B3D2E;border-radius:999px;padding:5px 11px;font-weight:800}',
  'html.fe118-home .fe118-ptitle{font-size:13.5px;color:#24352E;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}html.fe118-home .fe118-ptitle em{font-style:normal;color:#A9802F;font-weight:800}',
  'html.fe118-home .fe120-arr{color:#A9802F;font-weight:800}',
  'html.fe118-home .fe118-stats{display:flex;gap:0;flex-wrap:wrap}',
  'html.fe118-home .fe118-stats>div{padding:0 30px;border-left:1px solid #DCD2BD}html.fe118-home .fe118-stats>div:first-child{padding-left:0;border-left:0}',
  'html.fe118-home .fe118-stats>div>div:first-child{font-family:Georgia,serif!important;font-size:30px!important;line-height:1;color:#0B3D2E!important}',
  'html.fe118-home .fe118-stats>div>div:last-child{font-size:10.5px!important;letter-spacing:.16em;text-transform:uppercase;color:#867E6E!important;margin-top:8px!important}',
  /* 機窗 */
  'html.fe118-home .fe120-win{position:relative;justify-self:end;width:100%;max-width:380px;display:flex;flex-direction:column;align-items:center}',
  'html.fe118-home .fe120-win:before{content:"";position:absolute;width:118%;aspect-ratio:1;border-radius:50%;left:-9%;top:6%;border:1px solid rgba(169,128,47,.28);pointer-events:none}',
  'html.fe118-home .fe120-frame{position:relative;width:100%;aspect-ratio:3/4;border-radius:46% / 34%;padding:16px;box-sizing:border-box;background:linear-gradient(160deg,#FDFBF6 0%,#ECE3D1 100%);box-shadow:0 60px 90px -55px rgba(70,52,18,.7),0 0 0 1px #E3D8C2 inset,0 2px 0 #fff inset}',
  'html.fe118-home .fe120-glass{position:relative;width:100%;height:100%;border-radius:44% / 32%;overflow:hidden;background:#123d33 center/cover no-repeat;box-shadow:inset 0 0 0 1px rgba(0,0,0,.14),inset 0 26px 46px rgba(0,0,0,.30)}',
  'html.fe118-home .fe120-glass:after{content:"";position:absolute;inset:0;background:linear-gradient(125deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,0) 38%);pointer-events:none}',
  'html.fe118-home .fe120-shade{position:absolute;left:0;right:0;top:0;height:11%;background:linear-gradient(180deg,#F2EBDC,#E3D7BF);box-shadow:0 4px 10px rgba(0,0,0,.2);z-index:1}',
  'html.fe118-home .fe120-cap{position:relative;margin-top:-30px;display:flex;flex-direction:column;align-items:center;gap:2px;border:1px solid #E6DCC6;background:#fff;border-radius:18px;padding:10px 22px 11px;font:inherit;color:#0F2A21;cursor:pointer;box-shadow:0 18px 34px -20px rgba(70,52,18,.6);z-index:2}',
  'html.fe118-home .fe120-cap small{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8A7444;font-weight:800}html.fe118-home .fe120-cap b{font-family:Georgia,"Noto Serif TC",serif;font-size:19px;font-weight:400}html.fe118-home .fe120-cap b i{font-style:normal;font-family:inherit;font-size:13px;color:#8A7444;letter-spacing:.08em;margin-left:4px}html.fe118-home .fe120-cap span{font-size:12px;font-weight:700;color:#0B3D2E}',
  /* 今日桃園出發（搜尋列下面一條淺色看板） */
  'html.fe118-home .fe118-bwrap{margin-top:22px}',
  'html.fe118-home .fe118-board{display:grid;grid-template-columns:200px minmax(0,1fr);align-items:stretch;background:#fff;border:1px solid #E7E0D0;border-radius:22px;overflow:hidden;box-shadow:0 18px 40px -32px rgba(60,48,20,.45);color:#0F2A21}',
  'html.fe118-home .fe118-bh{display:flex;flex-direction:column;justify-content:space-between;gap:12px;padding:18px 20px;background:#0B3D2E;color:#fff}',
  'html.fe118-home .fe118-bh small{display:block;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#D6B676;font-weight:800}',
  'html.fe118-home .fe118-bh b{display:block;margin-top:6px;font-size:15px;font-weight:700}html.fe118-home .fe118-bh b span{color:rgba(255,255,255,.55);font-weight:600;font-size:12px;margin-left:4px}',
  'html.fe118-home .fe118-clock b{font-family:Georgia,serif;font-weight:400;font-size:24px;font-variant-numeric:tabular-nums;line-height:1;margin-top:4px}',
  'html.fe118-home .fe118-board ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr))}',
  'html.fe118-home .fe118-br{display:flex;flex-direction:column;gap:6px;padding:16px 18px 14px;border-left:1px solid #EFE9DC;min-width:0}html.fe118-home .fe118-br:first-child{border-left:0}',
  'html.fe118-home .fe118-bt{font-family:Georgia,serif;font-size:22px;font-variant-numeric:tabular-nums;line-height:1;color:#0B3D2E}',
  'html.fe118-home .fe118-bt s,html.fe118-home .fe118-bt em{font-family:inherit;font-size:10.5px;font-weight:600;color:#9A9384;margin-left:6px;font-style:normal}html.fe118-home .fe118-bt em{color:#A9802F}',
  'html.fe118-home .fe118-bd{min-width:0}html.fe118-home .fe118-bd b{display:block;font-size:14.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}html.fe118-home .fe118-bd small{display:block;font-size:11px;color:#7A857F;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  'html.fe118-home .fe118-bc{font-size:11.5px;font-weight:800;letter-spacing:.08em;color:#A9802F}html.fe118-home .fe118-bc i{font-style:normal;color:#b4412b;margin-left:6px}',
  'html.fe118-home .fe118-br.cx .fe118-bt,html.fe118-home .fe118-br.cx .fe118-bd b{opacity:.5;text-decoration:line-through}',
  'html.fe118-home .fe118-bmore{display:none}',
  'html.fe118-home .fe118-bh .fe118-blink{border:0;background:none;padding:0;color:#F3E3BE;font:inherit;font-size:12px;font-weight:700;cursor:pointer;text-align:left}',
  /* 1120A J2（使用者：「上排那四個可以平均分散在那一排不要都靠左」）：表頭第二列四個選單平均分散 */
  '@media (min-width:641px){html:not(.kgm-side-admin) #app>header>div:nth-child(2)>div:first-child{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:0!important}',
  ' html:not(.kgm-side-admin) #app>header>div:nth-child(2)>div:first-child>button{width:100%;text-align:center;padding:11px 8px!important;font-size:13.5px!important}}',
  /* 首頁：訂位主控台（獨立一張，不再壓在深色主視覺上） */
  'html.fe118-home .fe118-searchwrap{max-width:1200px!important;margin:0 auto!important;padding:0 32px!important}',
  'html.fe118-home .fe118-console{border:1px solid #E7E0D0!important;border-radius:24px!important;padding:24px 28px 26px!important;box-shadow:0 30px 60px -36px rgba(60,48,20,.4)!important;background:#fff!important}',
  'html.fe118-home .fe118-console>div:first-child{display:inline-flex!important;gap:4px!important;border:0!important;background:#EEF3F0;border-radius:999px;padding:4px;margin-bottom:14px!important}',
  'html.fe118-home .fe118-console .ntab{border:0!important;border-radius:999px!important;padding:7px 18px!important;font-size:13px!important;color:#4A5A53!important;background:transparent!important}',
  'html.fe118-home .fe118-console .ntab.act{background:#0B3D2E!important;color:#fff!important;font-weight:700!important;box-shadow:none!important}',
  'html.fe118-home .fe118-console .ntab:after,html.fe118-home .fe118-console .ntab::before{display:none!important}',
  'html.fe118-home .fe118-console>div:nth-child(2):not(.mc-search){display:inline-flex!important;gap:4px!important;margin:0 0 14px 10px!important;padding:4px;border-radius:999px;background:#F6F1E6;vertical-align:top}',
  /* 1120A M2（使用者：「這多航段是啥回事？」）：全站 .inp{border-radius:9px!important;background:#fff!important} 蓋掉 1101A 多航段的底線欄位 → 日期變白框、下排三格各一種樣式；這裡改回跟單程／來回同一種寫法 */
  'html.fe118-home .fe118-console .mc-search .mc-seg .inp{border:0!important;border-bottom:1.5px solid #D9DED9!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;width:100%;height:40px!important;padding:6px 0 7px!important;font-weight:700;font-size:15px}',
  'html.fe118-home .fe118-console .mc-search .mc-seg .inp:focus{border-bottom-color:#0B3D2E!important}',
  'html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger){gap:0!important;align-items:flex-end;padding-top:16px!important}',
  'html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger)>div{min-width:0!important;padding:0 18px}html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger)>div:first-of-type{padding-left:0;flex:0 0 170px}',
  'html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger)>div+div{border-left:1px solid var(--border)}html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger)>div:nth-of-type(2){flex:0 0 190px}',
  'html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger) .mc-label{display:block;font:400 11px inherit!important;font-family:inherit!important;letter-spacing:0!important;text-transform:none!important;color:var(--sub)!important;margin-bottom:2px}',
  'html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger) .inp{height:29px!important;border:0!important;background:none!important;box-shadow:none!important;border-radius:0!important;padding-left:0!important;font-size:14.5px;font-weight:700;color:var(--ink);width:100%}',
  'html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger) .pax-pick-trigger{height:29px;display:inline-flex;align-items:center;gap:4px;padding:0!important}',
  '@media (hover:none){html.fe118-home .fe118-console .mc-search .mc-seg:hover{background:none}}',
  '@media (max-width:640px){html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger){flex-wrap:wrap!important;row-gap:12px!important}html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger)>div:first-of-type{flex:1 1 100%}html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger)>div:nth-of-type(2){flex:0 0 45%;padding-left:0;border-left:0}html.fe118-home .fe118-console .mc-search div:has(>div>.pax-pick-trigger)>div:nth-of-type(3){flex:1 1 0}}',
  'html.fe118-home .fe118-console>div:nth-child(2):not(.mc-search)>button{border-radius:999px!important;box-shadow:none!important;padding:7px 16px!important;font-size:13px!important;background:transparent!important;color:#6B5A36!important;font-weight:600!important}',
  'html.fe118-home .fe118-console>div:nth-child(2):not(.mc-search)>button[style*="font-weight:800"]{background:#fff!important;color:#0B3D2E!important;font-weight:800!important;box-shadow:0 1px 4px rgba(0,0,0,.08)!important}',
  'html.fe118-home .fe118-console .btn.btn-g{height:52px;border-radius:14px!important;font-size:15.5px!important;letter-spacing:.06em;background:linear-gradient(180deg,#145A44,#0B3D2E)!important;box-shadow:0 10px 24px -12px rgba(11,61,46,.8)!important;margin-top:16px}',
  /* 快速服務：一條白卡，六格 */
  '.fe118-quick{margin:28px 0 6px}.fe118-wrap{max-width:1200px;margin:0 auto;padding:0 32px}',
  '.fe118-qh{display:flex;align-items:center;gap:12px;margin-bottom:12px}.fe118-qh span{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8A7444;font-weight:800}.fe118-qh:after{content:"";flex:1;height:1px;background:#E3DAC6}',
  '.fe118-qgrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));background:#fff;border:1px solid #E7E0D0;border-radius:22px;overflow:hidden;box-shadow:0 18px 40px -32px rgba(60,48,20,.45)}',
  '.fe118-q{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;border:0;border-left:1px solid #EFE9DC;background:transparent;padding:20px 18px 18px;cursor:pointer;color:#0F2A21;font-family:inherit;transition:background .18s ease}',
  '.fe118-q:first-child{border-left:0}.fe118-q:hover{background:#FBF8F1}',
  '.fe118-q i{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;border:1px solid #D9C69A;color:#8A6A2A;background:#FDFBF6;margin-bottom:10px;transition:background .18s,color .18s}',
  '.fe118-q:hover i{background:#0B3D2E;color:#F3E3BE;border-color:#0B3D2E}',
  '.fe118-q b{font-size:14px;font-weight:800}.fe118-q small{font-size:11.5px;color:#6E7670;line-height:1.45}',
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
  /* 1120A L7／L8 */
  'html.fe118-sel .fe120-sech{display:flex;align-items:baseline;gap:10px;margin:22px 0 4px;padding:0 4px}html.fe118-sel .fe120-sech b{font-family:Georgia,"Noto Serif TC",serif;font-size:19px;font-weight:400;color:#0B3D2E}html.fe118-sel .fe120-sech small{font-size:12px;color:#7A857F;font-weight:700}html.fe118-sel .fe120-sech em{font-style:normal;font-size:12px;color:#b4412b;margin-left:6px}',
  'html.fe118-sel .fe120-sech[data-k="c"]{margin-top:34px;padding-top:18px;border-top:1px solid #E3DAC6}',
  '#fe121news{position:fixed;inset:0;z-index:2147483000;background:rgba(18,28,22,.46);display:flex;align-items:center;justify-content:center;padding:16px;animation:fe121nIn .18s ease-out}'+
   '@keyframes fe121nIn{from{opacity:0}to{opacity:1}}'+
   '#fe121news .fe121n-box{position:relative;background:#fff;border-radius:18px;max-width:640px;width:100%;max-height:86vh;overflow:auto;padding:30px 32px 28px;box-shadow:0 24px 60px rgba(0,0,0,.25);color:#1f2a24}'+
   '#fe121news .fe121n-x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:1px solid #e3e0d8;background:#fff;font-size:20px;line-height:1;cursor:pointer;color:#4a564f}'+
   '#fe121news .fe121n-meta{display:flex;gap:10px;align-items:center;font-size:12px;color:#6d7771;margin-bottom:12px}'+
   '#fe121news .fe121n-meta span{background:#0f4d3a;color:#fff;border-radius:999px;padding:4px 10px;font-weight:700;letter-spacing:.04em}'+
   '#fe121news h2{font-size:24px;line-height:1.35;margin:0 40px 12px 0;color:#0f3d2e}'+
   '#fe121news .fe121n-lead{font-size:15px;color:#4a564f;margin:0 0 14px;line-height:1.7}'+
   '#fe121news .fe121n-body{font-size:14.5px;line-height:1.8;color:#2b3530}#fe121news .fe121n-body p{margin:0 0 10px}'+
   '@media (max-width:640px){#fe121news .fe121n-box{padding:24px 18px 20px;border-radius:16px}#fe121news h2{font-size:20px}}'+
   'html body #app [data-fe121nd]{display:none!important}',   /* 1121A P5 */
  'html body #app.k221-step tr.fl-row.fl-row[data-fe120so],html body #app tr.fl-row.fl-row[data-fe120so],html body #app tr.k12c-row.k12c-row[data-fe120so],html body #app tr[data-fe120so]{display:none!important}',
  '@media (min-width:641px){html.fe118-sel .booking-content tr.fl-row>td:last-child,html.fe118-sel .booking-content tr.k12c-row>td:last-child{width:360px!important;min-width:360px!important;max-width:360px!important;box-sizing:border-box}}',
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
  '@media (max-width:1100px){html.fe118-home .fe118-hero-in{grid-template-columns:minmax(0,1fr) 320px;column-gap:40px}.fe118-qgrid{grid-template-columns:repeat(3,minmax(0,1fr))}.fe118-q:nth-child(4){border-left:0}.fe118-q:nth-child(n+4){border-top:1px solid #EFE9DC}',
  ' html.fe118-home .fe118-board{grid-template-columns:1fr}html.fe118-home .fe118-bh{flex-direction:row;align-items:center;padding:14px 18px}html.fe118-home .fe118-clock{display:flex;align-items:baseline;gap:8px}html.fe118-home .fe118-clock b{font-size:20px;margin:0}}',
  '@media (max-width:900px){html.fe118-home .fe118-hero-in{grid-template-columns:minmax(0,1fr) 250px;column-gap:28px;row-gap:24px;padding:40px 28px 34px}html.fe118-home .fe118-hl h1{font-size:40px}html.fe118-home .fe118-lede{font-size:15px}',
  ' html.fe118-home .fe120-cap b{font-size:16px}html.fe118-home .fe120-cap{padding:8px 16px 9px}html.fe118-home .fe118-board ul{grid-template-columns:repeat(3,minmax(0,1fr))}html.fe118-home .fe118-br:nth-child(n+4){display:none}',
  ' html.fe118-home .fe118-stats>div{padding:0 18px}html.fe118-home .fe118-stats>div>div:first-child{font-size:24px!important}}',
  '@media (min-width:641px) and (max-width:900px){html.fe118-home .r11-dest-grid{grid-template-columns:1fr!important}}',
  /* 手機：機窗收起（一進首頁先看到搜尋）；今日出發改成直的清單 */
  '@media (max-width:640px){',
  ' html.fe118-home .fe118-hero-in{grid-template-columns:1fr!important;grid-template-areas:"hl" "st"!important;padding:24px 16px 24px;row-gap:20px}html.fe118-home .fe120-win{display:none}',
  ' html.fe118-home .fe118-eyebrow{font-size:10px;letter-spacing:.16em}html.fe118-home .fe118-eyebrow span{width:18px}html.fe118-home .fe118-eyebrow em{display:none}',
  ' html.fe118-home .fe118-hl h1{font-size:34px;margin-top:12px}html.fe118-home .fe118-lede{font-size:14px;margin-top:10px}',
  ' html.fe118-home .fe120-cta{margin-top:18px;gap:14px}html.fe118-home .fe120-go{padding:12px 22px;font-size:14px}',
  ' html.fe118-home .fe118-promo{margin-top:16px;width:100%}html.fe118-home .fe118-ptitle{font-size:12.5px}',
  ' html.fe118-home .fe118-stats>div{padding:0 16px}html.fe118-home .fe118-stats>div>div:first-child{font-size:24px!important}',
  ' html.fe118-home .fe118-bwrap{margin-top:16px}html.fe118-home .fe118-board ul{grid-template-columns:1fr}html.fe118-home .fe118-br{flex-direction:row;align-items:center;gap:14px;border-left:0;border-top:1px solid #EFE9DC;padding:11px 16px}html.fe118-home .fe118-br:first-child{border-top:0}html.fe118-home .fe118-br:nth-child(n+4){display:flex}html.fe118-home .fe118-br:nth-child(n+5){display:none}html.fe118-home .fe118-bt{font-size:19px;width:60px;flex:0 0 auto}html.fe118-home .fe118-bd{flex:1}',
  ' html.fe118-home .fe118-searchwrap{padding:0 12px!important}html.fe118-home .fe118-console{padding:16px 14px 18px!important;border-radius:20px!important}',
  ' html.fe118-home .fe118-console>div:first-child{display:flex!important;width:100%}html.fe118-home .fe118-console .ntab{flex:1}',
  ' .fe118-wrap{padding:0 12px}.fe118-qgrid{border-radius:18px}',
  ' .fe118-q{align-items:center;text-align:center;padding:16px 6px 14px}.fe118-q i{margin-bottom:4px;width:40px;height:40px}.fe118-q b{font-size:12.5px}.fe118-q small{display:none}',
  ' html.fe118-home .r11-dest-wrap{padding-left:14px!important;padding-right:14px!important}',
  ' .fe118-selbar{padding:14px 16px;border-radius:16px;gap:10px}.fe118-sb-route b{font-size:21px}.fe118-sb-meta{gap:14px;width:100%}.fe118-sb-edit{margin-left:auto}',
  '}',
  /* 平板（觸控、寬度超過手機）：最下排五個按鈕也要固定在最下面（使用者：「手機平板那一排一定要在最下面喔 不管什麼尺寸的device」）。
     手機（≤640）照 mb20b 原本那套；這裡只把同一排按鈕搬到平板（同一個 #kgmTabR1019A，mb20b 本來就每次 render 都畫，只是平板被 CSS 藏起來）。 */
  '@media (min-width:641px) and (hover:none) and (pointer:coarse){',
  ' html:not(.kgm-side-admin) #kgmTabR1019A{position:fixed;left:0;right:0;bottom:0;z-index:100060;display:grid;grid-template-columns:repeat(5,minmax(0,140px));justify-content:center;align-items:end;height:calc(66px + env(safe-area-inset-bottom));padding:0 12px env(safe-area-inset-bottom);background:rgba(255,255,255,.96);-webkit-backdrop-filter:saturate(1.6) blur(14px);backdrop-filter:saturate(1.6) blur(14px);border-top:1px solid #e2e8e5;box-shadow:0 -6px 22px -14px rgba(10,50,40,.35)}',
  ' html:not(.kgm-side-admin) .kt19-i{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:11px;gap:5px;height:66px;border:0;background:none;color:#7d8b85;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;position:relative}',
  ' html:not(.kgm-side-admin) .kt19-t{font-size:11.5px;font-weight:600;letter-spacing:.02em;line-height:1}',
  ' html:not(.kgm-side-admin) .kt19-i.on{color:#0b493b}html:not(.kgm-side-admin) .kt19-i.on .kt19-t{font-weight:800}',
  ' html:not(.kgm-side-admin) .kt19-i.on:not(.kt19-b-ai)::before{content:"";position:absolute;top:0;left:50%;width:28px;height:3px;margin-left:-14px;border-radius:0 0 3px 3px;background:#b08a3c}',
  ' html:not(.kgm-side-admin) .kt19-ai{display:flex;align-items:center;justify-content:center;width:52px;height:52px;margin-top:-28px;margin-bottom:1px;border-radius:50%;color:#f3dfae;background:radial-gradient(circle at 30% 25%,#1f6b58,#0b3f33 70%);box-shadow:0 8px 18px -6px rgba(8,52,42,.65),0 0 0 4px #fff}',
  ' html:not(.kgm-side-admin) .kt19-ai svg{width:26px;height:26px}',
  ' html:not(.kgm-side-admin) .kt19-i.kt19-b-ai.on::before{display:none}html:not(.kgm-side-admin) .kt19-i.kt19-b-ai.on .kt19-ai{color:#fff;background:radial-gradient(circle at 30% 25%,#c9a24f,#8a6420 75%)}',
  ' html:not(.kgm-side-admin) #kgmTabToastR1019A{display:block;position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom));transform:translate(-50%,8px);z-index:100070;background:#0b3f33;color:#f6ecd2;font-size:13px;font-weight:600;padding:10px 16px;border-radius:999px;box-shadow:0 10px 24px -10px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;white-space:nowrap}',
  ' html:not(.kgm-side-admin) #kgmTabToastR1019A.on{opacity:1;transform:translate(-50%,0)}',
  ' html:not(.kgm-side-admin) #app{padding-bottom:calc(70px + env(safe-area-inset-bottom))}',
  ' html:not(.kgm-side-admin) #kgmStampC{display:none!important}',
  ' html:not(.kgm-side-admin) #aiChat>button{display:none!important}',   /* 右下 AI 圓鈕＝下排中間的 AI 助理，平板不重複 */
  ' html.kgm-aiopen-r1019a:not(.kgm-side-admin) body[data-kgm-ai="on"] #aiChat{display:block!important;bottom:calc(78px + env(safe-area-inset-bottom))!important;z-index:100055!important}',
  '}'
  ].join('\n');
  try{var st=document.createElement('style');st.id='fe118-css';st.textContent=C;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
