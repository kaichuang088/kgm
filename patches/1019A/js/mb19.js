/* 1019A：手機介面（使用者：「這手機介面也太誇張的醜了吧完全不行 順便修手機介面 手機介面最下排要有五個按鈕包含AI要是其中一個其餘你自己分配」）
   · 只在 ≤640px、前台生效（後台檔 html.kgm-side-admin 不動；桌機不動）。
   · 最下排五個按鈕 #kgmTabR1019A（掛在 body，不在 #app 裡，render() 重畫不會洗掉）：首頁／我的行程／AI 助理（中間）／航班動態／會員。
     AI 按鈕開關的是原本前台那一個 AI（kgmToggleAi0819I），手機上原本右下的圓形 AI 鈕收起來，對話視窗改成整個畫面（下排按鈕上方）。
   · 表頭：一列（標誌＋通知＋語言＋☰），Member Portal 移到下排「會員」；四個選單收進 ☰（整頁選單，點項目或換頁自動關）。
   · 訂票頁：步驟列只寫目前那一步的名稱；日期列改成可左右滑（目前那天置中）；航班列由左右兩欄改成上下一張卡（航班資訊在上、票價與按鈕在下）。
     r228 的 #app.k221-step tr.fl-row{display:table-row!important} 權重 (1,2,1) → 這裡用 tr.fl-row.fl-row 拉到 (1,2,3)；
     ff19 藏列用同樣權重、寫在 #app 裡（文件順序在後）→ 篩選藏起來的列照樣藏著。
   · 右下版號章（kgmStampC）移到下排按鈕上方、縮小。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var IC={
    home:'<path d="M3.5 10.5 12 3.8l8.5 6.7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>',
    trip:'<rect x="3.5" y="7" width="17" height="13" rx="2.2"/><path d="M8.5 7V5.2A1.7 1.7 0 0 1 10.2 3.5h3.6a1.7 1.7 0 0 1 1.7 1.7V7M3.5 12.5h17"/>',
    ai:'<path d="M12 3.2c.5 3.9 2.9 6.3 6.8 6.8-3.9.5-6.3 2.9-6.8 6.8-.5-3.9-2.9-6.3-6.8-6.8 3.9-.5 6.3-2.9 6.8-6.8z"/><path d="M18.6 15.4c.2 1.5 1.1 2.4 2.6 2.6-1.5.2-2.4 1.1-2.6 2.6-.2-1.5-1.1-2.4-2.6-2.6 1.5-.2 2.4-1.1 2.6-2.6z"/>',
    status:'<path d="M2.8 13.6 21 6.2c.6-.2 1 .4.6.9l-4.3 4.6a3 3 0 0 1-1.4.8L4 15.6z"/><path d="m8.6 11.6-3-4.3 2-.6 5.2 3.1M3.5 20.5h17"/>',
    me:'<circle cx="12" cy="8.2" r="4"/><path d="M4.2 20.5c.9-3.9 4-6 7.8-6s6.9 2.1 7.8 6"/>'
  };
  function svg(k){return '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'}
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
  var menuView=null;
  function menu(on){
    document.documentElement.classList.toggle('kgm-menu-r1019a',!!on);
    menuView=on?S.view:null;
    if(on)window.scrollTo(0,0);
  }
  /* 選單裡點了項目（nav 到同一頁也要關）；點表頭以外的地方也關 */
  document.addEventListener('click',function(e){
    if(menuView===null)return;
    var t=e.target;
    if(t.closest&&(t.closest('header .mega li')||t.closest('#kgmTabR1019A')))setTimeout(function(){menu(false)},0);
  },true);
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
      /* 表頭「☰」：四個選單（優惠與訂票／行程管理／飛行準備／無限萬哩遊）改成整頁選單 */
      var ut=document.querySelector('#app>header .portal-util0815'),row1=ut&&ut.parentElement,hdr=ut&&ut.closest('header');
      if(row1&&!row1.querySelector('.kt19-menu')){
        var mb=document.createElement('button');mb.type='button';mb.className='kt19-menu';mb.setAttribute('aria-label',Z?'選單':'Menu');
        mb.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path class="a" d="M4 7h16"/><path class="b" d="M4 12h16"/><path class="c" d="M4 17h16"/></svg>';
        mb.onclick=function(e){e.stopPropagation();menu(!document.documentElement.classList.contains('kgm-menu-r1019a'))};
        row1.appendChild(mb);
      }
      if(hdr&&hdr.children[1]){
        var nb=hdr.children[1].querySelector('div'),bt=nb?nb.querySelectorAll('button'):[],mg=hdr.children[1].querySelectorAll('.mega');
        for(var i=0;i<mg.length;i++){var t=bt[i]?bt[i].textContent.trim():'';if(t&&mg[i].getAttribute('data-k19t')!==t)mg[i].setAttribute('data-k19t',t)}
      }
      if(menuView!==null&&S.view!==menuView)menu(false);
      /* 日期列：目前那天置中 */
      var ds=document.querySelector('#app .daystrip'),on=ds&&ds.querySelector('.daychip.on');
      if(ds&&on&&ds.scrollWidth>ds.clientWidth+4&&ds.__k19!==on.getAttribute('onclick')){ds.__k19=on.getAttribute('onclick');ds.scrollLeft=Math.max(0,on.offsetLeft-(ds.clientWidth-on.offsetWidth)/2)}
    }catch(_){}
  }
  window.kgmTabDrawR1019A=draw;
  var M='@media (max-width:640px){';
  var F='html:not(.kgm-side-admin) ';
  var css='#kgmTabR1019A,#kgmTabToastR1019A,.kt19-menu{display:none}'   /* 桌機不出現（☰ 也只有手機有） */
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
    /* 表頭 */
    +F+'header:has(>div>.portal-util0815){position:sticky;top:0}'
    +F+'header:has(>div>.portal-util0815)>div:first-child{height:52px!important;padding:0 14px!important;gap:8px}'
    +F+'header:has(>div>.portal-util0815)>div:first-child>button span{font-size:17px!important;letter-spacing:.01em}'
    +F+'header .portal-util0815{gap:2px!important;margin-left:auto}'
    +F+'header .portal-util0815>.portal-link0815{font-size:12px!important;padding:6px 7px!important;white-space:nowrap}'
    +F+'header .portal-util0815>.portal-link0815[onclick*="auth"],'+F+'header .portal-util0815>.portal-link0815[onclick*="profile"],'+F+'header .portal-util0815>.portal-link0815[onclick*="memberLogout"],'+F+'header .portal-util0815>.portal-search-wrap0815{display:none!important}'
    /* 第二列（四個選單）平常收起，按 ☰ 才整頁展開 */
    +F+'header:has(>div>.portal-util0815)>div:nth-child(2){display:none!important}'
    +F+'.kt19-menu{flex:0 0 auto;width:40px;height:40px;margin-left:2px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #dfe6e2;border-radius:12px;background:#fff;color:#0b3f33;cursor:pointer}'
    +F+'.kt19-menu path{transition:transform .25s ease,opacity .2s;transform-origin:12px 12px}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) .kt19-menu{background:#0b3f33;color:#f3dfae;border-color:#0b3f33}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) .kt19-menu .a{transform:translateY(5px) rotate(45deg)}html.kgm-menu-r1019a:not(.kgm-side-admin) .kt19-menu .b{opacity:0}html.kgm-menu-r1019a:not(.kgm-side-admin) .kt19-menu .c{transform:translateY(-5px) rotate(-45deg)}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) header:has(>div>.portal-util0815)>div:nth-child(2){display:block!important;position:fixed!important;top:52px;left:0;right:0;bottom:calc(62px + env(safe-area-inset-bottom));overflow:auto;background:#fbfaf6;padding:6px 20px 28px!important;z-index:100040;border-top:1px solid #e3e9e6;max-width:none!important;animation:kt19in .22s ease}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) header:has(>div>.portal-util0815)>div:nth-child(2)>div:first-child{display:none!important}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) header .mega{display:grid!important;position:static!important;grid-template-columns:1fr 1fr!important;gap:4px 18px!important;padding:18px 0 14px!important;box-shadow:none!important;border:0!important;border-bottom:1px solid #e6e2d6!important;background:none!important}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) header .mega::before{content:attr(data-k19t);grid-column:1/-1;font:700 21px/1.2 Georgia,"Noto Serif TC",serif;color:#0b3f33;margin-bottom:8px}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) header .mega h4{font-size:11px!important;letter-spacing:.12em;color:#a07a2c!important;margin:8px 0 2px!important;font-weight:800}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) header .mega ul{list-style:none;margin:0;padding:0}'
    +'html.kgm-menu-r1019a:not(.kgm-side-admin) header .mega li{padding:9px 0!important;font-size:14.5px!important;color:#1d2a25!important;border-bottom:1px solid #efece4;cursor:pointer}'
    +'@keyframes kt19in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}'
    +F+'#kgmBadgeR48{font-size:9px!important;padding:2px 6px!important;left:0!important;right:auto!important;border-radius:0 0 8px 0!important}'
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
    /* 結帳：附加服務／航班確認的按鈕列原本超出畫面 */
    +F+'#app .r7-actionline{display:grid!important;grid-template-columns:auto 1fr;gap:12px 10px;align-items:center}'
    +F+'#app .r7-actionline>.r7-grand-total{grid-column:1/-1;order:-1;text-align:right;display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:baseline;gap:2px 8px;padding-bottom:10px;border-bottom:1px dashed #dfe5e2}'
    +F+'#app .r7-actionline>.r7-grand-total small{flex-basis:100%}'
    +F+'#app .r7-actionline>button.btn-g{width:100%;white-space:normal}'
    +F+'#app .card>div[style*="justify-content:space-between"]:has(>button.btn-g){flex-wrap:wrap!important}'
    +F+'#app .card>div[style*="justify-content:space-between"]:has(>button.btn-g)>button.btn-g{flex:1 1 100%;order:-1;padding:14px 18px!important;font-size:15px!important}'
    /* 首頁航點：一張張直排 540px 高 → 左右滑動的卡片 */
    +F+'#app .r11-dest-grid{display:flex!important;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px!important;padding:4px 2px 16px;scrollbar-width:none;-webkit-overflow-scrolling:touch}'
    +F+'#app .r11-dest-grid::-webkit-scrollbar{display:none}'
    +F+'#app .r11-dest-grid>.r11-dest{flex:0 0 80%;max-width:300px;scroll-snap-align:start}'
    +F+'#app .r11-dest-grid .r11-photo{padding:14px 16px 16px!important}'
    +F+'#app .r11-dest-grid .r11-oval{width:150px!important;margin-top:8px!important}'
    /* 頁尾：四欄擠在一起 → 品牌一列、連結三欄 */
    +F+'#app>footer>div:first-child{grid-template-columns:repeat(3,1fr)!important;gap:18px 14px!important}'
    +F+'#app>footer>div:first-child>div:first-child{grid-column:1/-1}'
    /* 儲存空間提示：手機上改成下方抽屜 */
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
