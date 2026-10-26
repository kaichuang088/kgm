/* 1019A：手機介面（使用者：「這手機介面也太誇張的醜了吧完全不行 順便修手機介面 手機介面最下排要有五個按鈕包含AI要是其中一個其餘你自己分配」）
   · 只在 ≤640px、前台生效（後台檔 html.kgm-side-admin 不動；桌機不動）。
   · 最下排五個按鈕 #kgmTabR1019A（掛在 body，不在 #app 裡，render() 重畫不會洗掉）：首頁／我的行程／AI 助理（中間）／航班動態／會員。
     AI 按鈕開關的是原本前台那一個 AI（kgmToggleAi0819I），手機上原本右下的圓形 AI 鈕收起來，對話視窗改成整個畫面（下排按鈕上方）。
   · 訂票頁：步驟列只寫目前那一步的名稱；日期列改成可左右滑（目前那天置中）；航班列由左右兩欄改成上下一張卡（航班資訊在上、票價與按鈕在下）。
     r228 的 #app.k221-step tr.fl-row{display:table-row!important} 權重 (1,2,1) → 這裡用 tr.fl-row.fl-row 拉到 (1,2,3)；
     ff19 藏列用同樣權重、寫在 #app 裡（文件順序在後）→ 篩選藏起來的列照樣藏著。
   · 右下版號章（kgmStampC）移到下排按鈕上方、縮小。
   1020A（使用者：「手機版上面中間的應該是用Side Bar才對啊 我個人還是覺得很醜欸 可能要有一定的設計跟電腦有點不同吧 不然真的很不好看」）
   · ☰（移到左上角）改成左側滑出的側邊選單 #kgmDrawerR1020A（使用者：「通常這會在左邊不是右邊喔」；掛在 body；遮罩點一下／×／往左滑／點項目／換頁／Esc 都會關）：
     上面會員卡（沒登入：登入／加入會員；有登入：姓名、等級、哩程）→ 四個常用（線上報到／選位／登機證／查詢訂位）→
     四個選單（優惠與訂票／行程管理／飛行準備／無限萬哩遊）摺疊列表 → 通知、語言、登出。
     項目都是從表頭原本的 .mega 讀出來（文字跟著中英文），點了就是點原本那一個 li（同一個 onclick，不另寫一套）。
   · 表頭改成 App 式：☰＋標誌＋鈴鐺圖示（未讀數字）＋語言小膠囊（EN／中）。
   · 首頁：主視覺縮短（搜尋卡在第一個畫面就看得到）；搜尋欄位改成一格一格的圓角欄位（出發／目的地整列、交換鈕夾在中間）。
   · 結帳：總價＋下一步那一列黏在下排按鈕上方。
   1020B（使用者：「最底下那一排要FIX喔」→ 下排五鈕要固定在畫面最底；「手機登入放右上角按鈕」「右上角只要登入就好進去之後就是會員資料 其他的功能一樣放在左邊」）
   · 下排五鈕本來就是 position:fixed（掛在 body）；iPhone Safari 打字時鍵盤打開，fixed 的東西會跟著頁面捲到畫面中間，
     欄位字小於 16px 時 Safari 還會自動放大、放大後下排也會跑到中間 →
     有文字欄位在輸入（focus）或可視區被鍵盤擠小時，下排五鈕跟黏住的按鈕列先收起來（html.kgm-kb-r1020b），收鍵盤就回來；
     iPhone／iPad 的 viewport 加 maximum-scale=1（只擋輸入時自動放大，iOS 照樣可以兩指放大）。
   · 表頭右上角一顆「登入」：沒登入＝登入頁；有登入＝頭像字母，點了到會員資料。側邊選單、下排五鈕照舊。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var IC={
    home:'<path d="M3.5 10.5 12 3.8l8.5 6.7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>',
    trip:'<rect x="3.5" y="7" width="17" height="13" rx="2.2"/><path d="M8.5 7V5.2A1.7 1.7 0 0 1 10.2 3.5h3.6a1.7 1.7 0 0 1 1.7 1.7V7M3.5 12.5h17"/>',
    ai:'<path d="M12 3.2c.5 3.9 2.9 6.3 6.8 6.8-3.9.5-6.3 2.9-6.8 6.8-.5-3.9-2.9-6.3-6.8-6.8 3.9-.5 6.3-2.9 6.8-6.8z"/><path d="M18.6 15.4c.2 1.5 1.1 2.4 2.6 2.6-1.5.2-2.4 1.1-2.6 2.6-.2-1.5-1.1-2.4-2.6-2.6 1.5-.2 2.4-1.1 2.6-2.6z"/>',
    status:'<path d="M2.8 13.6 21 6.2c.6-.2 1 .4.6.9l-4.3 4.6a3 3 0 0 1-1.4.8L4 15.6z"/><path d="m8.6 11.6-3-4.3 2-.6 5.2 3.1M3.5 20.5h17"/>',
    me:'<circle cx="12" cy="8.2" r="4"/><path d="M4.2 20.5c.9-3.9 4-6 7.8-6s6.9 2.1 7.8 6"/>',
    /* 1020A：側邊選單用 */
    book:'<path d="M3.5 8.5a2 2 0 0 0 0 4v4.2a1.3 1.3 0 0 0 1.3 1.3h14.4a1.3 1.3 0 0 0 1.3-1.3v-4.2a2 2 0 0 1 0-4V5.3A1.3 1.3 0 0 0 19.2 4H4.8a1.3 1.3 0 0 0-1.3 1.3z"/><path d="M14.5 4.5v13" stroke-dasharray="2 2.2"/>',
    prep:'<rect x="5" y="7" width="14" height="12.5" rx="2.4"/><path d="M9 7V4.8A1.3 1.3 0 0 1 10.3 3.5h3.4A1.3 1.3 0 0 1 15 4.8V7M9 11v4.5M15 11v4.5M8 19.5v1.2M16 19.5v1.2"/>',
    miles:'<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.6-5 2.6 1-5.6-4.1-3.9 5.6-.8z"/>',
    chk:'<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.3 2.6 2.6 5-5.3"/>',
    seat:'<path d="M7.5 4.5v8.2a2 2 0 0 0 2 2h6.8M7.5 14.7l-1 5.8M16.3 14.7l1.6 5.8M10.5 18.2h6.6"/><path d="M5 9.5h2.5"/>',
    bp:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M15 5.5v13" stroke-dasharray="1.8 2"/><path d="M6.5 10h5M6.5 13.5h3.5"/>',
    find:'<circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 5 5"/>',
    bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.4 5.3 3.4 8.5s-1 6.1-3.4 8.5c-2.4-2.4-3.4-5.3-3.4-8.5s1-6.1 3.4-8.5z"/>',
    out:'<path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
    x:'<path d="M6 6l12 12M18 6 6 18"/>',
    chev:'<path d="m9 5.5 6.5 6.5L9 18.5"/>'
  };
  function svg(k,w){w=w||23;return '<svg viewBox="0 0 24 24" width="'+w+'" height="'+w+'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'}
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function cur(){
    var v=S.view||'home';   /* window.S 不是這一份 S（S 是最上層 let），只能直接讀 S */
    if(S.aiOpen0819H)return 'ai';
    if(v==='status')return 'status';
    if(/^(mytrip|manage|case_lookup_0831B|caselookup|cancel_r17|refund_r60|reissue_r59|reissue_done_r19)$/.test(v))return 'trip';
    if(/^(auth|profile|miles_page|upgrade|notif|resident_r39)$/.test(v))return 'me';
    if(v==='home'||v==='booking')return 'home';   /* 訂票流程從首頁搜尋進來 → 亮首頁 */
    return '';
  }
  window.kgmTabR1019A=function(k){
    try{
      if(k==='ai'){
        menu(false);
        /* r183：沒登入不顯示 AI → 帶去登入頁，提示登入後可用 */
        if(document.body.getAttribute('data-kgm-ai')==='off'){nav('auth');toast(z()?'登入會員後即可使用 AI 助理':'Log in to use the AI assistant');draw();return}
        if(typeof kgmToggleAi0819I==='function')kgmToggleAi0819I();draw();return}
      if(S.aiOpen0819H&&typeof kgmToggleAi0819I==='function')kgmToggleAi0819I();
      menu(false);
      if(k==='home')nav('home');
      else if(k==='trip')nav('mytrip');
      else if(k==='status')nav('status');
      else if(k==='me'){if(S.user){S.profileTab='profile';nav('profile')}else nav('auth')}
    }catch(_){}
    draw();
  };
  /* ── 1020A：側邊選單 ── */
  var menuView=null,openSec=-1;
  function isOpen(){return document.documentElement.classList.contains('kgm-drawer-r1020a')}
  function menu(on){
    on=!!on;
    if(on===isOpen()){if(!on)menuView=null;return}
    if(on){buildDrawer(true);var d0=document.getElementById('kgmDrawerR1020A');if(d0)d0.scrollTop=0}
    document.documentElement.classList.toggle('kgm-drawer-r1020a',on);
    menuView=on?S.view:null;
    var d=document.getElementById('kgmDrawerR1020A');if(d){d.setAttribute('aria-hidden',on?'false':'true');d.style.transform=''}
    var mb=document.querySelector('.kt19-menu');if(mb)mb.setAttribute('aria-expanded',on?'true':'false');
  }
  window.kgmDrawerR1020A=menu;
  /* 表頭四個 .mega 的內容（標題取自表頭的按鈕；沒有 onclick 的項目點了本來就沒反應 → 不列） */
  function megaData(){
    var out=[];
    var hdr=document.querySelector('#app>header'),r2=hdr&&hdr.children[1];if(!r2)return out;
    var nb=r2.querySelector('div'),bt=nb?nb.querySelectorAll('button'):[],mg=r2.querySelectorAll('.mega');
    for(var i=0;i<mg.length;i++){
      var sec={id:mg[i].id,t:bt[i]?bt[i].textContent.trim():'',g:[]},hs=mg[i].querySelectorAll('h4');
      for(var j=0;j<hs.length;j++){
        var ul=hs[j].nextElementSibling,li=ul?ul.querySelectorAll('li'):[],it=[];
        for(var k=0;k<li.length;k++)if(li[k].getAttribute('onclick'))it.push({t:li[k].textContent.trim(),k:k});
        if(it.length)sec.g.push({t:hs[j].textContent.trim(),j:j,it:it});
      }
      if(sec.t&&sec.g.length)out.push(sec);
    }
    return out;
  }
  function liveLi(id,j,k){
    try{var m=document.getElementById(id),h=m&&m.querySelectorAll('h4')[j],ul=h&&h.nextElementSibling;return ul?ul.querySelectorAll('li')[k]:null}catch(_){return null}
  }
  window.kgmDrawerGoR1020A=function(id,j,k){
    var li=liveLi(id,j,k);
    menu(false);
    if(li)li.click();
  };
  window.kgmDrawerActR1020A=function(a){
    var Z=z();
    menu(false);
    try{
      if(a==='login'){nav('auth')}
      else if(a==='me'){kgmTabR1019A('me')}
      else if(a==='notif'){var b=document.querySelector('#app>header .r4-notify-head');if(b)b.click()}
      else if(a==='zh'||a==='en'){if(typeof setLang==='function'&&LANG!==a)setLang(a)}
      else if(a==='logout'){var o=document.querySelector('#app>header .portal-link0815[onclick*="memberLogout"]');if(o)o.click();else if(typeof memberLogout0815==='function')memberLogout0815()}
    }catch(_){}
    draw();
  };
  window.kgmDrawerSecR1020A=function(i){
    openSec=openSec===i?-1:i;
    var d=document.getElementById('kgmDrawerR1020A');if(!d)return;
    var s=d.querySelectorAll('.kd20-sec');
    for(var n=0;n<s.length;n++){var on=n===openSec;s[n].classList.toggle('on',on);var b=s[n].querySelector('.kd20-sh');if(b)b.setAttribute('aria-expanded',on?'true':'false')}
  };
  var SECIC={mega_book:'book',mega_trip:'trip',mega_prep:'prep',mega_miles:'miles'};
  /* 常用：都是「行程管理」選單裡原本的項目 */
  var QUICK=[['mega_trip',1,0,'chk'],['mega_trip',1,1,'seat'],['mega_trip',1,3,'bp'],['mega_trip',0,1,'find']];
  function buildDrawer(force){
    var d=document.getElementById('kgmDrawerR1020A'),mk=document.getElementById('kgmDrawerMaskR1020A');
    if(!mk){mk=document.createElement('div');mk.id='kgmDrawerMaskR1020A';mk.onclick=function(){menu(false)};document.body.appendChild(mk)}
    if(!d){
      d=document.createElement('aside');d.id='kgmDrawerR1020A';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-hidden','true');
      document.body.appendChild(d);
      /* 往左滑關閉 */
      var x0=null,y0=0,dx=0;
      d.addEventListener('touchstart',function(e){var t=e.touches[0];x0=t.clientX;y0=t.clientY;dx=0},{passive:true});
      d.addEventListener('touchmove',function(e){if(x0===null)return;var t=e.touches[0],a=t.clientX-x0,b=t.clientY-y0;if(Math.abs(b)>Math.abs(a)&&dx===0){x0=null;return}dx=Math.min(0,a);d.style.transition='none';d.style.transform='translateX('+dx+'px)'},{passive:true});
      d.addEventListener('touchend',function(){if(x0===null)return;x0=null;d.style.transition='';if(dx<-70)menu(false);else d.style.transform='';dx=0});
    }
    if(!force&&!isOpen())return;
    var Z=z(),u=S.user,data=megaData(),h='';
    var unread=0;try{var bd=document.querySelector('#app>header .r4-notify-head .portal-badge0809g');unread=bd?parseInt(bd.textContent,10)||0:0}catch(_){}
    h+='<div class="kd20-top"><div class="kd20-brand"><b>KGM</b> AIRWAYS</div><button type="button" class="kd20-x" onclick="kgmDrawerR1020A(false)" aria-label="'+(Z?'關閉選單':'Close menu')+'">'+svg('x',22)+'</button>';
    if(u){
      var nm=u.name||u.firstName||u.email||'',lv=u.level||u.tier||'Bronze',mi=Number(u.miles)||0;
      h+='<button type="button" class="kd20-member" onclick="kgmDrawerActR1020A(\'me\')"><span class="kd20-av">'+esc((String(nm).trim().charAt(0)||'K').toUpperCase())+'</span>'
        +'<span class="kd20-mi"><span class="kd20-nm">'+esc(nm)+'</span><span class="kd20-lv kd20-lv-'+esc(String(lv).toLowerCase())+'">'+esc(lv)+'</span></span>'
        +'<span class="kd20-miles"><b>'+mi.toLocaleString('en-US')+'</b><small>'+(Z?'哩程':'miles')+'</small></span></button>';
    }else{
      var join=null;data.forEach(function(s){if(s.id==='mega_miles'&&s.g[0]&&s.g[0].j===0&&s.g[0].it[0]&&s.g[0].it[0].k===0)join=s});
      h+='<div class="kd20-guest"><div class="kd20-gt">'+(Z?'KGM Explorer 會員':'KGM Explorer')+'</div><div class="kd20-gs">'+(Z?'登入後查看哩程、行程與專屬優惠':'Log in for your miles, trips and member offers')+'</div>'
        +'<div class="kd20-gb"><button type="button" class="kd20-btn kd20-btn-p" onclick="kgmDrawerActR1020A(\'login\')">'+(Z?'登入':'Log in')+'</button>'
        +(join?'<button type="button" class="kd20-btn" onclick="kgmDrawerGoR1020A(\'mega_miles\',0,0)">'+esc(join.g[0].it[0].t)+'</button>':'')+'</div></div>';
    }
    h+='</div>';
    var q='';
    QUICK.forEach(function(x){var li=liveLi(x[0],x[1],x[2]);if(li&&li.getAttribute('onclick'))q+='<button type="button" class="kd20-q" onclick="kgmDrawerGoR1020A(\''+x[0]+'\','+x[1]+','+x[2]+')"><span class="kd20-qi">'+svg(x[3],22)+'</span><span>'+esc(li.textContent.trim().replace(/（PNR）|\(PNR\)/,''))+'</span></button>'});
    if(q)h+='<div class="kd20-quick">'+q+'</div>';
    h+='<div class="kd20-list">';
    data.forEach(function(s,i){
      h+='<div class="kd20-sec'+(i===openSec?' on':'')+'"><button type="button" class="kd20-sh" aria-expanded="'+(i===openSec)+'" onclick="kgmDrawerSecR1020A('+i+')"><span class="kd20-si">'+svg(SECIC[s.id]||'book',20)+'</span><span class="kd20-st">'+esc(s.t)+'</span><span class="kd20-sc">'+svg('chev',16)+'</span></button><div class="kd20-sb"><div class="kd20-sbi">';
      s.g.forEach(function(g){
        h+='<div class="kd20-g">'+esc(g.t)+'</div>';
        g.it.forEach(function(it){h+='<button type="button" class="kd20-it" onclick="kgmDrawerGoR1020A(\''+s.id+'\','+g.j+','+it.k+')">'+esc(it.t)+svg('chev',14)+'</button>'});
      });
      h+='</div></div></div>';
    });
    h+='</div><div class="kd20-foot">';
    h+='<button type="button" class="kd20-row" onclick="kgmDrawerActR1020A(\'notif\')">'+svg('bell',20)+'<span>'+(Z?'通知':'Notifications')+'</span>'+(unread?'<em>'+unread+'</em>':'')+'</button>';
    h+='<div class="kd20-row kd20-lang">'+svg('globe',20)+'<span>'+(Z?'語言':'Language')+'</span><span class="kd20-seg"><button type="button" class="'+(Z?'on':'')+'" onclick="kgmDrawerActR1020A(\'zh\')">中文</button><button type="button" class="'+(Z?'':'on')+'" onclick="kgmDrawerActR1020A(\'en\')">English</button></span></div>';
    if(u)h+='<button type="button" class="kd20-row kd20-out" onclick="kgmDrawerActR1020A(\'logout\')">'+svg('out',20)+'<span>'+(Z?'登出':'Log out')+'</span></button>';
    h+='</div>';
    if(d.__h!==h){var st=d.scrollTop;d.innerHTML=h;d.__h=h;d.scrollTop=st}
    d.setAttribute('aria-label',Z?'選單':'Menu');
  }
  /* 點了下排按鈕也關 */
  document.addEventListener('click',function(e){
    if(menuView===null)return;
    var t=e.target;
    if(t.closest&&t.closest('#kgmTabR1019A'))setTimeout(function(){menu(false)},0);
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen())menu(false)});
  /* 1020B：鍵盤打開時（文字欄位輸入中，或可視區被擠到 72% 以下）下排五鈕、黏住的按鈕列先收起來 */
  var KBSEL='input:not([type]),input[type="text"],input[type="email"],input[type="tel"],input[type="number"],input[type="password"],input[type="search"],input[type="url"],textarea,[contenteditable="true"]';
  function kb(){
    try{
      var a=document.activeElement,on=!!(a&&a.matches&&a.matches(KBSEL)&&!a.readOnly&&!a.disabled);
      var vv=window.visualViewport;if(!on&&vv&&window.innerHeight&&vv.height*vv.scale<window.innerHeight*0.72)on=true;
      if(window.innerWidth>640)on=false;
      document.documentElement.classList.toggle('kgm-kb-r1020b',on);
    }catch(_){}
  }
  window.kgmKbR1020B=kb;
  document.addEventListener('focusin',kb);
  document.addEventListener('focusout',function(){setTimeout(kb,80)});
  try{if(window.visualViewport)window.visualViewport.addEventListener('resize',kb)}catch(_){}
  /* 1020B：iPhone／iPad 欄位字小於 16px 時 Safari 會自動放大 → viewport 加 maximum-scale=1（iOS 10 起照樣可以兩指放大；只改蘋果裝置） */
  try{
    var ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
    if(ios)[].forEach.call(document.querySelectorAll('meta[name="viewport"]'),function(m){var c=m.getAttribute('content')||'';if(!/maximum-scale/.test(c))m.setAttribute('content',c+',maximum-scale=1')});
  }catch(_){}
  function toast(t){
    try{var d=document.getElementById('kgmTabToastR1019A');if(!d){d=document.createElement('div');d.id='kgmTabToastR1019A';document.body.appendChild(d)}
      d.textContent=t;d.className='on';clearTimeout(d.__t);d.__t=setTimeout(function(){d.className=''},2600)}catch(_){}
  }
  function draw(){
    try{
      if(window.KGM_SIDE==='admin'||document.documentElement.classList.contains('kgm-side-admin'))return;
      var el=document.getElementById('kgmTabR1019A');
      if(!el){el=document.createElement('nav');el.id='kgmTabR1019A';el.setAttribute('aria-label','KGM');document.body.appendChild(el)}
      var Z=z(),c=cur(),hideAll=S.view==='admin';
      var L=[['home',Z?'首頁':'Home'],['trip',Z?'我的行程':'My Trips'],['ai',Z?'AI 助理':'AI'],['status',Z?'航班動態':'Status'],['me',S.user?(Z?'會員':'Account'):(Z?'登入':'Log in')]];
      var h=L.map(function(x){return '<button type="button" class="kt19-i kt19-b-'+x[0]+(c===x[0]?' on':'')+'" onclick="kgmTabR1019A(\''+x[0]+'\')"'+(c===x[0]?' aria-current="page"':'')+'>'
        +(x[0]==='ai'?'<span class="kt19-ai">'+svg('ai')+'</span>':svg(x[0]))+'<span class="kt19-t">'+x[1]+'</span></button>'}).join('');
      if(el.__h!==h){el.innerHTML=h;el.__h=h}
      el.style.display=hideAll?'none':'';
      document.documentElement.classList.toggle('kgm-aiopen-r1019a',!!S.aiOpen0819H);
      /* 表頭「☰」：打開側邊選單 */
      var ut=document.querySelector('#app>header .portal-util0815'),row1=ut&&ut.parentElement;
      if(row1&&!row1.querySelector('.kt19-menu')){
        var mb=document.createElement('button');mb.type='button';mb.className='kt19-menu';mb.setAttribute('aria-label',Z?'選單':'Menu');mb.setAttribute('aria-expanded','false');mb.setAttribute('aria-controls','kgmDrawerR1020A');
        mb.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h11"/><path d="M4 17h16"/></svg>';
        mb.onclick=function(e){e.stopPropagation();menu(!isOpen())};
        row1.insertBefore(mb,row1.firstChild);
      }
      /* 1020B：表頭右上角「登入」（有登入＝頭像字母 → 會員資料） */
      if(ut){
        var lg=ut.querySelector('.kt20b-login');
        if(!lg){lg=document.createElement('button');lg.type='button';lg.className='kt20b-login';lg.onclick=function(e){e.stopPropagation();menu(false);kgmTabR1019A('me')};ut.appendChild(lg)}
        else if(lg!==ut.lastElementChild)ut.appendChild(lg);
        var u0=S.user,nm0=u0?String(u0.name||u0.firstName||u0.email||'').trim():'',lh=u0?'<span class="kt20b-av">'+esc((nm0.charAt(0)||'K').toUpperCase())+'</span>':(Z?'登入':'Log in');
        if(lg.__h!==lh+Z){lg.innerHTML=lh;lg.__h=lh+Z;lg.classList.toggle('kt20b-in',!!u0);lg.setAttribute('aria-label',u0?(Z?'會員資料':'My account'):(Z?'登入':'Log in'))}
        lg.classList.toggle('on',cur()==='me');
      }
      /* 語言鈕：手機上只寫 EN／中 */
      if(ut){var lb=ut.querySelector('.portal-link0815[onclick^="setLang"]');if(lb){var lt=Z?'EN':'中';if(lb.getAttribute('data-k20')!==lt)lb.setAttribute('data-k20',lt)}}
      if(menuView!==null&&S.view!==menuView)menu(false);
      buildDrawer(false);
      /* 日期列：目前那天置中 */
      var ds=document.querySelector('#app .daystrip'),on=ds&&ds.querySelector('.daychip.on');
      if(ds&&on&&ds.scrollWidth>ds.clientWidth+4&&ds.__k19!==on.getAttribute('onclick')){ds.__k19=on.getAttribute('onclick');ds.scrollLeft=Math.max(0,on.offsetLeft-(ds.clientWidth-on.offsetWidth)/2)}
    }catch(_){}
  }
  window.kgmTabDrawR1019A=draw;
  var M='@media (max-width:640px){';
  var F='html:not(.kgm-side-admin) ';
  var DO='html.kgm-drawer-r1020a:not(.kgm-side-admin) ';
  var STK=['.r7-actionline','.kgm-confirm .card>div[style*="justify-content:space-between"]:has(>button.btn-g)','.booking-content>div>div[style*="justify-content:space-between"]:has(>button.btn-g)'];
  var HERO=F+'#app div[style*="padding:56px 20px 78px"]';
  var RA=F+'#app .card>div:has(>div>div>.apbig)',RB=F+'#app .card>div:not(.mc-search):has(.pax-pick-trigger)';
  var SWAP="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 4v15M4.5 15.5 8 19l3.5-3.5M16 20V5M12.5 8.5 16 5l3.5 3.5'/%3E%3C/svg%3E\")";
  var BELL="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z'/%3E%3Cpath d='M10 20.5a2.2 2.2 0 0 0 4 0'/%3E%3C/svg%3E\")";
  var css='#kgmTabR1019A,#kgmTabToastR1019A,.kt19-menu,#kgmDrawerR1020A,#kgmDrawerMaskR1020A,.kt20b-login{display:none}'   /* 桌機不出現（☰ 跟側邊選單也只有手機有） */
    +M
    /* 下排五個按鈕 */
    +F+'#kgmTabR1019A{position:fixed;left:0;right:0;bottom:0;z-index:100060;display:grid;grid-template-columns:repeat(5,1fr);align-items:end;height:calc(62px + env(safe-area-inset-bottom));padding:0 4px env(safe-area-inset-bottom);background:rgba(255,255,255,.96);-webkit-backdrop-filter:saturate(1.6) blur(14px);backdrop-filter:saturate(1.6) blur(14px);border-top:1px solid #e2e8e5;box-shadow:0 -6px 22px -14px rgba(10,50,40,.35)}'
    +F+'.kt19-i{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:10px;gap:4px;height:62px;border:0;background:none;color:#7d8b85;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;position:relative}'
    +F+'.kt19-t{font-size:10.5px;font-weight:600;letter-spacing:.02em;line-height:1}'
    +F+'.kt19-i.on{color:#0b493b}'+F+'.kt19-i.on .kt19-t{font-weight:800}'
    +F+'.kt19-i.on:not(.kt19-b-ai)::before{content:"";position:absolute;top:0;left:50%;width:26px;height:3px;margin-left:-13px;border-radius:0 0 3px 3px;background:#b08a3c}'
    +F+'.kt19-ai{display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin-top:-26px;margin-bottom:1px;border-radius:50%;color:#f3dfae;background:radial-gradient(circle at 30% 25%,#1f6b58,#0b3f33 70%);box-shadow:0 8px 18px -6px rgba(8,52,42,.65),0 0 0 4px #fff}'
    +F+'.kt19-ai svg{width:25px;height:25px}'
    +F+'.kt19-i.kt19-b-ai.on::before{display:none}'+F+'.kt19-i.kt19-b-ai.on .kt19-ai{color:#fff;background:radial-gradient(circle at 30% 25%,#c9a24f,#8a6420 75%)}'
    +F+'#kgmTabToastR1019A{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom));transform:translate(-50%,8px);z-index:100070;background:#0b3f33;color:#f6ecd2;font-size:13px;font-weight:600;padding:10px 16px;border-radius:999px;box-shadow:0 10px 24px -10px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;white-space:nowrap}'
    +F+'#kgmTabToastR1019A.on{opacity:1;transform:translate(-50%,0)}'
    +F+'#app{padding-bottom:calc(66px + env(safe-area-inset-bottom))}'
    /* 右下版號章：手機上蓋住內容，版號在左上角標籤已經有 → 手機上收起 */
    +F+'#kgmStampC{display:none!important}'
    /* 原本右下的 AI 圓鈕收起來，對話視窗整個畫面 */
    +F+'#aiChat>button{display:none!important}'
    +'html.kgm-aiopen-r1019a:not(.kgm-side-admin) body[data-kgm-ai="on"] #aiChat{display:block!important;left:0!important;right:0!important;top:0!important;bottom:calc(62px + env(safe-area-inset-bottom))!important;z-index:100055!important}'
    +'html.kgm-aiopen-r1019a:not(.kgm-side-admin) #aiWindow{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border-radius:0!important;border:0!important;display:flex!important}'
    /* 表頭（1020A：App 式，圖示按鈕） */
    +F+'header:has(>div>.portal-util0815){position:sticky;top:0;box-shadow:0 1px 0 #e7ece9,0 6px 18px -16px rgba(10,50,40,.5)}'
    +F+'header:has(>div>.portal-util0815)>div:first-child{height:56px!important;padding:0 10px 0 14px!important;gap:6px}'
    +F+'header:has(>div>.portal-util0815)>div:first-child>button span{font-size:17px!important;letter-spacing:.01em}'
    +F+'header .portal-util0815{gap:4px!important;margin-left:auto;align-items:center}'
    +F+'header .portal-util0815>.portal-link0815{white-space:nowrap}'
    +F+'header .portal-util0815>.portal-link0815[onclick*="auth"]:not(.r4-notify-head),'+F+'header .portal-util0815>.portal-link0815[onclick*="profile"],'+F+'header .portal-util0815>.portal-link0815[onclick*="memberLogout"],'+F+'header .portal-util0815>.portal-search-wrap0815{display:none!important}'
    +F+'header .portal-util0815>.r4-notify-head{font-size:0!important;width:40px;height:40px;padding:0!important;display:inline-flex!important;align-items:center;justify-content:center;border-radius:12px;color:#0b3f33!important;background:none!important}'
    +F+'header .portal-util0815>.r4-notify-head::before{content:"";width:22px;height:22px;background:currentColor;-webkit-mask:'+BELL+' center/22px 22px no-repeat;mask:'+BELL+' center/22px 22px no-repeat}'
    +F+'header .portal-util0815>.r4-notify-head .portal-badge0809g{font-size:10px!important;line-height:16px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;top:5px!important;right:4px!important;box-shadow:0 0 0 2px #fff}'
    +F+'header .portal-util0815>.portal-link0815[data-k20]{font-size:0!important;padding:0!important;height:30px;min-width:38px;display:inline-flex!important;align-items:center;justify-content:center;border:1px solid #d9e1dd!important;border-radius:999px;background:#fff!important}'
    +F+'header .portal-util0815>.portal-link0815[data-k20]::after{content:attr(data-k20);font-size:12px;font-weight:800;letter-spacing:.04em;color:#0b3f33}'
    /* 第二列（四個選單）手機上收起 → 改由 ☰ 側邊選單 */
    +F+'header:has(>div>.portal-util0815)>div:nth-child(2){display:none!important}'
    +F+'header:has(>div>.portal-util0815)>div:first-child{justify-content:flex-start!important}'
    +F+'.kt19-menu{flex:0 0 auto;width:40px;height:40px;margin-left:-8px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:12px;background:none;color:#0b3f33;cursor:pointer;-webkit-tap-highlight-color:transparent}'
    +F+'.kt19-menu:active,'+F+'header .portal-util0815>.r4-notify-head:active{background:#eef3f1!important}'
    /* 1020B：右上角登入（有登入＝頭像） */
    +F+'header .portal-util0815>.kt20b-login{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;height:32px;min-width:52px;padding:0 13px;margin-left:2px;border:0;border-radius:999px;background:#0b3f33;color:#f6ecd2;font:inherit;font-size:13px;font-weight:800;letter-spacing:.04em;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent}'
    +F+'header .portal-util0815>.kt20b-login:active{background:#14594a}'
    +F+'header .portal-util0815>.kt20b-login.kt20b-in{min-width:0;width:36px;height:36px;padding:0;background:none}'
    +F+'.kt20b-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 15px Georgia,serif;color:#0b3f33;background:linear-gradient(135deg,#f3dfae,#c9a24f);box-shadow:0 0 0 2px #fff,0 0 0 3px #d9c08a}'
    +F+'.kt20b-login.on .kt20b-av{box-shadow:0 0 0 2px #fff,0 0 0 3.5px #0b493b}'
    +F+'#kgmBadgeR48{font-size:9px!important;padding:2px 6px!important;left:0!important;right:auto!important;border-radius:0 0 8px 0!important}'
    /* 側邊選單 */
    +F+'#kgmDrawerMaskR1020A{display:block;position:fixed;inset:0;z-index:100075;background:rgba(6,28,22,.46);opacity:0;visibility:hidden;transition:opacity .25s ease,visibility 0s .25s}'
    +DO+'#kgmDrawerMaskR1020A{opacity:1;visibility:visible;transition:opacity .25s ease}'
    +F+'#kgmDrawerR1020A{display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;width:min(86vw,348px);z-index:100080;background:#f7f6f1;box-shadow:18px 0 40px -18px rgba(0,0,0,.45);transform:translateX(-104%);visibility:hidden;transition:transform .3s cubic-bezier(.2,.8,.2,1),visibility 0s .3s;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom);color:#1d2a25}'
    +DO+'#kgmDrawerR1020A{transform:translateX(0);visibility:visible;transition:transform .3s cubic-bezier(.2,.8,.2,1)}'
    +'html.kgm-drawer-r1020a:not(.kgm-side-admin){overflow:hidden!important}'   /* 選單開著時後面的頁面不捲動 */
    +F+'#kgmDrawerR1020A button{font:inherit;-webkit-tap-highlight-color:transparent;cursor:pointer}'
    +F+'.kd20-top{position:relative;padding:18px 18px 20px;color:#f6ecd2;background:radial-gradient(120% 120% at 0% 0%,#155a48 0%,#0b3f33 55%,#082f26 100%)}'
    +F+'.kd20-brand{font:900 15px/1 Georgia,serif;letter-spacing:.06em;color:#c9a661;padding:6px 0 18px}'+F+'.kd20-brand b{color:#fff;font-weight:900}'
    +F+'.kd20-x{position:absolute;top:10px;right:10px;width:40px;height:40px;border:0;border-radius:12px;background:rgba(255,255,255,.08);color:#f6ecd2;display:flex;align-items:center;justify-content:center}'
    +F+'.kd20-member{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid rgba(201,166,97,.35);border-radius:16px;padding:12px 14px;background:rgba(255,255,255,.06);color:inherit}'
    +F+'.kd20-av{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 18px Georgia,serif;color:#0b3f33;background:linear-gradient(135deg,#f3dfae,#c9a24f)}'
    +F+'.kd20-mi{display:flex;flex-direction:column;gap:5px;min-width:0}'
    +F+'.kd20-nm{font-size:15px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    +F+'.kd20-lv{align-self:flex-start;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:2px 8px;border-radius:999px;color:#0b3f33;background:#d9c08a}'
    +F+'.kd20-lv-silver{background:#d7dde0}'+F+'.kd20-lv-gold{background:#e8c66e}'+F+'.kd20-lv-diamond,'+F+'.kd20-lv-platinum{background:#cfe7ef}'
    +F+'.kd20-miles{display:flex;flex-direction:column;align-items:flex-end;gap:2px}'+F+'.kd20-miles b{font:700 17px/1 Georgia,serif;color:#f3dfae}'+F+'.kd20-miles small{font-size:10.5px;color:rgba(246,236,210,.65)}'
    +F+'.kd20-gt{font:700 19px/1.25 Georgia,"Noto Serif TC",serif;color:#fff}'
    +F+'.kd20-gs{font-size:12.5px;line-height:1.5;color:rgba(246,236,210,.7);margin-top:5px}'
    +F+'.kd20-gb{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}'
    +F+'.kd20-btn{height:42px;border-radius:12px;border:1px solid rgba(243,223,174,.5);background:none;color:#f3dfae;font-size:14px!important;font-weight:700}'
    +F+'.kd20-btn-p{background:linear-gradient(135deg,#e9cd8a,#c09444);border-color:transparent;color:#0b3f33}'
    +F+'.kd20-quick{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:-1px 0 0;padding:14px 12px 16px;background:#fff;border-bottom:1px solid #ebe7dc}'
    +F+'.kd20-q{display:flex;flex-direction:column;align-items:center;gap:7px;border:0;background:none;padding:4px 2px;color:#33433d;font-size:11.5px!important;font-weight:600;line-height:1.25;text-align:center}'
    +F+'.kd20-qi{width:46px;height:46px;border-radius:15px;display:flex;align-items:center;justify-content:center;background:#eef4f1;color:#0b493b}'
    +F+'.kd20-q:active .kd20-qi{background:#dcebe5}'
    +F+'.kd20-list{padding:10px 12px 4px}'
    +F+'.kd20-sec{background:#fff;border-radius:16px;margin-bottom:8px;box-shadow:0 1px 0 #ebe7dc;overflow:hidden}'
    +F+'.kd20-sh{display:flex;align-items:center;gap:12px;width:100%;border:0;background:none;padding:13px 14px;text-align:left;color:#0b3f33}'
    +F+'.kd20-si{width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:#f4efe2;color:#9a7430;flex:0 0 auto}'
    +F+'.kd20-st{flex:1;font-size:15.5px;font-weight:700;letter-spacing:.01em}'
    +F+'.kd20-sc{color:#9aa7a1;display:flex;transition:transform .25s ease}'
    +F+'.kd20-sec.on .kd20-sc{transform:rotate(90deg);color:#0b3f33}'
    +F+'.kd20-sb{display:grid;grid-template-rows:0fr;transition:grid-template-rows .28s ease}'
    +F+'.kd20-sec.on .kd20-sb{grid-template-rows:1fr}'
    +F+'.kd20-sbi{overflow:hidden;padding:0 14px}'
    +F+'.kd20-sec.on .kd20-sbi{padding-bottom:8px}'
    +F+'.kd20-g{font-size:10.5px;font-weight:800;letter-spacing:.14em;color:#a07a2c;padding:12px 0 4px 2px;border-top:1px solid #f0ece2}'
    +F+'.kd20-it{display:flex;align-items:center;justify-content:space-between;width:100%;border:0;background:none;padding:11px 4px 11px 2px;font-size:14.5px!important;color:#1d2a25;text-align:left;border-radius:8px}'
    +F+'.kd20-it svg{color:#b9c3be;flex:0 0 auto}'
    +F+'.kd20-it:active{background:#f3f6f4}'
    +F+'.kd20-foot{margin:4px 12px 18px;background:#fff;border-radius:16px;box-shadow:0 1px 0 #ebe7dc;overflow:hidden}'
    +F+'.kd20-row{display:flex;align-items:center;gap:12px;width:100%;border:0;background:none;padding:13px 16px;font-size:14.5px!important;color:#1d2a25;text-align:left}'
    +F+'.kd20-row+.kd20-row{border-top:1px solid #f0ece2}'
    +F+'.kd20-row>svg{color:#55665f;flex:0 0 auto}'+F+'.kd20-row>span:first-of-type{flex:1}'
    +F+'.kd20-row em{font-style:normal;font-size:11px;font-weight:800;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#c0392b;color:#fff;display:inline-flex;align-items:center;justify-content:center}'
    +F+'.kd20-seg{display:inline-flex;padding:3px;border-radius:10px;background:#eef2f0;flex:0 0 auto!important}'
    +F+'.kd20-seg button{border:0;background:none;padding:6px 11px;border-radius:8px;font-size:12.5px!important;font-weight:700;color:#6b7a74}'
    +F+'.kd20-seg button.on{background:#fff;color:#0b3f33;box-shadow:0 1px 3px rgba(0,0,0,.12)}'
    +F+'.kd20-out,'+F+'.kd20-out>svg{color:#b23b2e!important}'
    /* 1020B：鍵盤打開時下排五鈕、黏住的按鈕列收起來（iPhone 打字時 fixed／sticky 會跑到畫面中間） */
    +'html.kgm-kb-r1020b:not(.kgm-side-admin) #kgmTabR1019A,html.kgm-kb-r1020b:not(.kgm-side-admin) #kgmTabToastR1019A{display:none!important}'
    +STK.map(function(x){return 'html.kgm-kb-r1020b:not(.kgm-side-admin) #app '+x}).join(',')+'{position:static!important}'
    +'html.kgm-kb-r1020b.kgm-aiopen-r1019a:not(.kgm-side-admin) body[data-kgm-ai="on"] #aiChat{bottom:0!important}'
    /* 首頁主視覺：縮短，搜尋卡在第一個畫面 */
    +HERO+'{padding:24px 18px 62px!important}'
    +HERO+'>div:first-child{margin-bottom:12px!important;padding:4px 11px!important}'
    +HERO+'>h1{font-size:27px!important;line-height:1.22!important;max-width:none!important;text-wrap:balance}'
    +HERO+'>p{font-size:13px!important;line-height:1.55!important;margin-top:9px!important;max-width:none!important}'
    +HERO+'>div:last-child{display:grid!important;grid-template-columns:repeat(3,1fr);gap:0!important;margin-top:16px!important;padding-top:13px;border-top:1px solid rgba(255,255,255,.12)}'
    +HERO+'>div:last-child>div+div{padding-left:14px;border-left:1px solid rgba(255,255,255,.12)}'
    +HERO+'>div:last-child>div>div:first-child{font-size:18px!important}'
    +F+'#app div[style*="margin:-42px auto 0"]{padding:0 12px!important}'
    /* 搜尋卡：一格一格的圓角欄位 */
    +F+'#app .card:has(>div>.ntab){padding:16px 14px 16px!important;border-radius:20px!important;border-top-width:0!important;box-shadow:0 18px 40px -22px rgba(8,52,42,.55),0 2px 6px -2px rgba(8,52,42,.12)!important}'
    +F+'#app .card:has(>div>.ntab)>div:first-child:has(>.ntab){margin-bottom:12px!important}'
    +F+'#app .card:has(>div>.ntab)>div:first-child>.ntab{flex:1;text-align:center;padding-left:0!important;padding-right:0!important}'
    +F+'#app .card>div:has(>button[onclick^="S.search.useMiles"]){display:grid!important;grid-template-columns:1fr 1fr;gap:0!important;margin:0 0 12px!important;padding:4px;border-radius:13px;background:#eef2f0}'
    +F+'#app .card>div:has(>button[onclick^="S.search.useMiles"])>button{border-radius:10px!important;padding:9px 6px!important;font-size:14px!important}'
    +RA+'{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.85fr);gap:8px!important;align-items:stretch!important;position:relative;padding-bottom:8px!important;border-bottom:0!important}'
    +RA+'>div,'+RB+'>div{min-width:0!important;margin:0!important;border:1px solid #e2e8e5!important;border-radius:14px!important;padding:9px 12px!important;background:#f8faf9!important}'
    +RA+'>div:has(.apbig){grid-column:1/-1;padding-right:48px!important}'
    +RA+'>div:not(:has(.apbig)):has(>button):not(:has(select)){position:absolute;right:16px;top:var(--k20sw,52px);z-index:3;padding:0!important;border:0!important;background:none!important}'
    +RA+'>div:not(:has(.apbig)):has(>button):not(:has(select))>button{width:40px!important;height:40px!important;box-shadow:0 4px 12px -4px rgba(8,52,42,.35);font-size:0!important;display:flex!important;align-items:center;justify-content:center;color:#0b3f33}'
    +RA+'>div:not(:has(.apbig)):has(>button):not(:has(select))>button::before{content:"";width:20px;height:20px;background:currentColor;-webkit-mask:'+SWAP+' center/20px 20px no-repeat;mask:'+SWAP+' center/20px 20px no-repeat}'
    +RA+' .apbig{width:100%}'
    +RA+' select.inp,'+RB+' select.inp,'+RB+' input.inp{width:100%!important;height:26px!important;background-color:transparent!important;box-shadow:none!important;padding-left:0!important}'
    +RA+'>div:not(:has(.apbig)):not(:has(select)):not(:has(>button)){display:flex!important;flex-direction:column;justify-content:flex-start}'+RA+'>div:not(:has(.apbig)):not(:has(select)):not(:has(>button))>div+div{margin-top:9px!important}'
    +RB+'{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px!important;align-items:stretch!important;padding-top:0!important}'
    +RB+'>div:nth-child(3){grid-column:1/-1}'
    +F+'#app .card:has(>div>.ntab) button.btn.btn-g:not(.btn-sm){height:52px;border-radius:14px!important;font-size:16px!important;font-weight:800;letter-spacing:.04em;margin-top:14px!important;box-shadow:0 10px 22px -12px rgba(8,52,42,.7)}'
    /* 訂票步驟列：只寫目前那一步 */
    +F+'#app .step-bar{gap:4px!important;padding:12px 14px!important;flex-wrap:nowrap!important;overflow:hidden}'
    +F+'#app .step-bar>span{display:none!important}'+F+'#app .step-bar>.sc-act+span{display:inline!important;white-space:nowrap;font-size:12.5px!important;margin:0 2px}'
    +F+'#app .step-bar>.sl{flex:1 1 8px!important;min-width:6px!important;margin:0!important}'
    +F+'#app .step-bar>.sc{flex:0 0 auto}'
    /* 日期列：左右滑 */
    +F+'body #app .daystrip{display:flex!important;overflow-x:auto!important;scroll-snap-type:x proximity;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:0!important;border-radius:14px}'
    +F+'body #app .daystrip::-webkit-scrollbar{display:none}'
    +F+'body #app .daystrip>.daychip{flex:0 0 74px!important;min-width:74px!important;scroll-snap-align:center;padding:10px 4px!important}'
    +F+'body #app .daystrip>.daynav{flex:0 0 30px!important;width:30px!important;position:sticky;z-index:2;background:#fff!important}'
    +F+'body #app .daystrip>.daynav:first-child{left:0}'+F+'body #app .daystrip>.daynav:last-child{right:0}'
    +F+'body #app .daystrip .dc-date{font-size:15px!important}'+F+'body #app .daystrip .dc-price{font-size:10.5px!important;white-space:nowrap}'
    /* 航班列：上下一張卡 */
    +F+'#app table:has(>tbody>tr.fl-row),'+F+'#app table:has(>tbody>tr.k12c-row){display:block!important}'
    +F+'#app table:has(>tbody>tr.fl-row)>thead>tr>th:last-child,'+F+'#app table:has(>tbody>tr.k12c-row)>thead>tr>th:last-child{display:none!important}'
    +F+'#app table:has(>tbody>tr.fl-row)>thead,'+F+'#app table:has(>tbody>tr.k12c-row)>thead,'+F+'#app table:has(>tbody>tr.fl-row)>thead>tr,'+F+'#app table:has(>tbody>tr.k12c-row)>thead>tr{display:block!important}'
    +F+'#app table:has(>tbody>tr.fl-row)>thead>tr>th:first-child,'+F+'#app table:has(>tbody>tr.k12c-row)>thead>tr>th:first-child{display:block!important;width:auto!important}'
    +F+'#app table:has(>tbody>tr.fl-row)>tbody,'+F+'#app table:has(>tbody>tr.k12c-row)>tbody{display:block!important}'
    +F+'body #app tr.fl-row.fl-row,'+F+'body #app tr.k12c-row.k12c-row{display:block!important;border-bottom:8px solid #f1f4f2}'
    +F+'body #app tr.fl-row.fl-row>td,'+F+'body #app tr.k12c-row.k12c-row>td{display:block!important;width:auto!important;min-width:0!important;border:0!important}'
    +F+'body #app tr.fl-row.fl-row>td:first-child{padding:16px 16px 10px!important}'
    +F+'body #app tr.k12c-row.k12c-row>td:first-child{padding:18px 16px 8px!important}'
    +F+'body #app tr.fl-row.fl-row>td+td,'+F+'body #app tr.k12c-row.k12c-row>td+td{padding:4px 16px 16px!important;border-top:1px dashed #e3e8e5!important;margin:0 16px;padding-left:0!important;padding-right:0!important}'
    +F+'body #app tr[id^="fp"],'+F+'body #app tr.k12c-fp{display:block}'
    +F+'body #app tr[id^="fp"]>td,'+F+'body #app tr.k12c-fp>td{display:block!important;width:auto!important;padding:14px 12px!important}'
    +F+'#app .flight-logo-wrap0809c{gap:10px!important}'
    /* 結帳：附加服務／航班確認的按鈕列原本超出畫面；1020A：黏在下排按鈕上方 */
    +F+'#app .r7-actionline{display:grid!important;grid-template-columns:auto 1fr;gap:10px 10px;align-items:center}'
    /* 1020A：下一步／付款那一列黏在下排按鈕上方（#app／body／html 原本 overflow-x:hidden 會讓 sticky 失效 → 手機上改 clip，一樣不會左右捲） */
    +'html:not(.kgm-side-admin),'+F+'body,'+F+'#app{overflow-x:clip!important;overflow-y:visible!important}'
    +STK.map(function(x){return F+'#app '+x}).join(',')+'{position:sticky!important;bottom:calc(70px + env(safe-area-inset-bottom));z-index:20;background:rgba(255,255,255,.97)!important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);padding:10px 12px!important;border:1px solid #e3e8e5!important;border-radius:16px!important;box-shadow:0 12px 28px -14px rgba(8,52,42,.45)}'
    +F+'#app .r7-actionline>.r7-grand-total{grid-column:1/-1;order:-1;text-align:right;display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:baseline;gap:2px 8px;padding-bottom:8px;border-bottom:1px dashed #dfe5e2}'
    +F+'#app .r7-actionline>.r7-grand-total small{flex-basis:100%}'
    +F+'#app .r7-actionline>button.btn-g{width:100%;white-space:normal;min-height:48px;border-radius:13px!important;font-size:15px!important}'
    +F+'#app .card>div[style*="justify-content:space-between"]:has(>button.btn-g){flex-wrap:wrap!important}'
    +F+'#app .card>div[style*="justify-content:space-between"]:has(>button.btn-g)>button.btn-g{flex:1 1 100%;order:-1;padding:14px 18px!important;font-size:15px!important;border-radius:13px!important}'
    /* 首頁航點：一張張直排 540px 高 → 左右滑動的卡片 */
    +F+'#app .r11-dest-grid{display:flex!important;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px!important;padding:4px 2px 16px;scrollbar-width:none;-webkit-overflow-scrolling:touch}'
    +F+'#app .r11-dest-grid::-webkit-scrollbar{display:none}'
    +F+'#app .r11-dest-grid>.r11-dest{flex:0 0 80%;max-width:300px;scroll-snap-align:start}'
    +F+'#app .r11-dest-grid .r11-photo{padding:14px 16px 16px!important}'
    +F+'#app .r11-dest-grid .r11-oval{width:150px!important;margin-top:8px!important}'
    /* 頁尾：四欄擠在一起 → 品牌一列、連結三欄 */
    +F+'#app>footer>div:first-child{grid-template-columns:repeat(3,1fr)!important;gap:18px 14px!important}'
    +F+'#app>footer>div:first-child>div:first-child{grid-column:1/-1}'
    /* 儲存空間提示（1020A 起不會自動跳出；後台手動打開時）：手機上改成下方抽屜 */
    +F+'#k12-lsclean{align-items:flex-end!important;padding:0 0 calc(62px + env(safe-area-inset-bottom))!important}'
    +F+'#k12-lsclean .k12c{border-radius:20px 20px 0 0!important;max-height:78vh!important;padding:18px 16px!important}'
    +F+'#k12-lsclean .k12c-h>button{white-space:nowrap;flex:0 0 auto}'
    +F+'#k12-lsclean table{font-size:12px}'+F+'#k12-lsclean code{word-break:break-all}'
    +'}';
  function inject(){
    if(document.getElementById('kgm-mb19-css'))return;
    var st=document.createElement('style');st.id='kgm-mb19-css';st.textContent=css;(document.head||document.documentElement).appendChild(st);
  }
  inject();
  if(typeof render==='function'&&!render.__mb19){
    var rd19=render;
    render=window.render=function(){var r=rd19.apply(this,arguments);try{draw();setTimeout(draw,30)}catch(_){}return r};
    render.__mb19=1;
  }
  /* AI 視窗右上角 × 是 S.aiOpen0819H=false;drawAi0819I() → 包 drawAi0819I，下排按鈕跟整頁樣式跟著關 */
  if(typeof window.drawAi0819I==='function'&&!window.drawAi0819I.__mb19){
    var da19=window.drawAi0819I;
    window.drawAi0819I=function(){var r=da19.apply(this,arguments);try{draw()}catch(_){}return r};
    window.drawAi0819I.__mb19=1;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',draw);else setTimeout(draw,0);
})();
