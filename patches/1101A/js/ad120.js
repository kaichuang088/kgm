/* ══ 1120A N1（使用者：「我也覺得後台整體不夠好看不夠organized」）══
   不另做一套後台，只整理現有的外框（側邊欄＋頁首），每一頁的內容不動：
   ① 頁首原本永遠寫「管理後台」→ 改成「目前這一頁的名稱」，上面一行寫「KGM 管理後台 · 所屬分類」（從側邊欄目前亮起的那一顆與它的分類標題讀，不另存一份清單）；
   ② 側邊欄最上面加「搜尋功能」：打字即時篩選（分頁名稱，中英都可），沒有符合的分類整組藏起來；Esc 清除；
   ③ 側邊欄捲動時黏在畫面上（頁面很長時，不用捲回最上面才能換頁），超過螢幕高度自己捲；
   ④ 分類標題、按鈕間距、目前分頁的樣式統一（目前分頁左邊金色細線）。
   手機（≤640px）不動（手機有自己的抽屜選單）。 */
(function(){
  if(window.__ad120)return;window.__ad120=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var Q='';
  function cur(side){var b=side.querySelector('button.on');if(b)return b;var t=String(S.adminTab||'');if(!t)return null;var L=side.querySelectorAll('button');for(var i=0;i<L.length;i++){if(String(L[i].getAttribute('onclick')||'').indexOf("'"+t+"'")>=0)return L[i]}return null}
  function txt(el){var c=el.cloneNode(true);[].forEach.call(c.querySelectorAll('i,.k6cs-sb,small'),function(x){x.remove()});return String(c.textContent||'').replace(/\s+/g,' ').trim()}
  function filter(side){var q=Q.toLowerCase();[].forEach.call(side.querySelectorAll(':scope>section'),function(sec){var any=false;[].forEach.call(sec.querySelectorAll('button'),function(b){var hit=!q||txt(b).toLowerCase().indexOf(q)>=0||String(b.getAttribute('onclick')||'').toLowerCase().indexOf(q)>=0;b.classList.toggle('ad120-hide',!hit);if(hit)any=true});
      var lb=sec.querySelector('label');if(lb&&q&&lb.textContent.toLowerCase().indexOf(q)>=0){any=true;[].forEach.call(sec.querySelectorAll('button'),function(b){b.classList.remove('ad120-hide')})}sec.classList.toggle('ad120-hide',!any)});
    var none=side.querySelector('.ad120-none');var cnt=side.querySelectorAll(':scope>section:not(.ad120-hide)').length;if(q&&!cnt){if(!none){none=document.createElement('p');none.className='ad120-none';side.querySelector('.ad120-q').after(none)}none.textContent=z()?'沒有符合「'+Q+'」的功能':'No match'}else if(none)none.remove()}
  window.kgmAdNavQR1120A=function(v){Q=String(v||'').trim();var side=document.querySelector('#app .p-admin-side');if(side)filter(side)};
  function paint(){try{
    var on=S.view==='admin'&&!!S.adminAuthed;document.documentElement.classList.toggle('ad120-on',on);   /* 1120A：#app／body 原本 overflow-x:hidden → sticky 只黏在 #app 裡、捲動時跟著跑掉；後台時改 clip（同 1025B 航班資料頁） */
    if(!on)return;    try{var hb=document.elementFromPoint(innerWidth/2,2),top=0;while(hb&&hb!==document.body){var ps=getComputedStyle(hb).position;if(ps==='fixed'||ps==='sticky'){top=Math.round(hb.getBoundingClientRect().bottom);break}hb=hb.parentElement}document.documentElement.style.setProperty('--ad120-top',Math.max(0,Math.min(120,top))+'px')}catch(_){}   /* 頁首固定在上方 → 側欄黏在頁首下面 */
    var side=document.querySelector('#app .p-admin-side');if(!side)return;
    if(!side.querySelector('.ad120-q')){var w=document.createElement('div');w.className='ad120-q';
      w.innerHTML='<input type="search" placeholder="'+(z()?'搜尋功能（例：組員、Payload）':'Find a page')+'" oninput="kgmAdNavQR1120A(this.value)" onkeydown="if(event.key===\'Escape\'){this.value=\'\';kgmAdNavQR1120A(\'\')}">';
      var first=side.querySelector(':scope>section');if(first)side.insertBefore(w,first);else side.appendChild(w);var inp=w.querySelector('input');if(Q)inp.value=Q}
    if(Q)filter(side);
    var b=cur(side),hd=document.querySelector('#app .p-admin-title');if(!hd)return;var h1=hd.querySelector('h1'),sp=hd.querySelector('div>span');if(!h1)return;
    var name=b?txt(b):'',grp='';if(b){var sec=b.closest('section'),lb=sec&&sec.querySelector('label');grp=lb?lb.textContent.trim():''}
    var want=name||(z()?'管理後台':'Administration');if(h1.textContent!==want)h1.textContent=want;
    var k=(z()?'KGM 管理後台':'KGM ADMIN')+(grp?' · '+grp:'');if(sp&&sp.textContent!==k)sp.textContent=k;
    hd.classList.add('ad120-hd')}catch(_){}}
  function hook(){var r0=window.render;if(typeof r0!=='function'||r0.__ad120)return;var w=function(){var r=r0.apply(this,arguments);paint();return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__ad120=1;window.render=w;try{render=w}catch(_){}}
  /* 1121A Q1（使用者：「圖一無法往右滑」＝航班資料旅客名單）：表格比卡片寬時卡片本身可以橫捲，但捲軸在卡片最底（265 位旅客要捲到最下面才看得到），
     用滑鼠的人等於不能往右滑 → 卡片下面加一條黏在畫面底部的橫向捲軸（跟卡片同步；卡片底已經在畫面裡就藏起來）。只在後台、只在真的比較寬的卡片 */
  function hbars(){try{if(!(S.view==='admin'&&S.adminAuthed)||innerWidth<=640)return;
    [].forEach.call(document.querySelectorAll('#app .p-admin-main .r7-ops-card, #app .p-admin-main .table-wrap, #app .p-admin-main [data-ad121hs]'),function(c){
      var cs=getComputedStyle(c);if(cs.overflowX!=='auto'&&cs.overflowX!=='scroll')return;
      var bar=c.nextElementSibling&&c.nextElementSibling.classList.contains('ad121-hs')?c.nextElementSibling:null;
      var wide=c.scrollWidth>c.clientWidth+8&&c.offsetHeight>240;
      if(!wide){if(bar)bar.remove();return}
      if(!bar){bar=document.createElement('div');bar.className='ad121-hs';
        bar.innerHTML='<button type="button" class="ad121-l" aria-label="'+(z()?'往左':'Scroll left')+'">‹</button><div class="ad121-tr"><i></i></div><button type="button" class="ad121-r" aria-label="'+(z()?'往右':'Scroll right')+'">›</button><span>'+(z()?'表格較寬，可拖曳或按 ‹ › 左右移動':'Wide table — drag or use ‹ ›')+'</span>';
        c.after(bar);var tr=bar.querySelector('.ad121-tr'),th=tr.firstChild;
        bar.querySelector('.ad121-l').onclick=function(){c.scrollBy({left:-Math.round(c.clientWidth*0.6),behavior:'smooth'})};
        bar.querySelector('.ad121-r').onclick=function(){c.scrollBy({left:Math.round(c.clientWidth*0.6),behavior:'smooth'})};
        var drag=null;th.addEventListener('pointerdown',function(e){drag={x:e.clientX,sl:c.scrollLeft};th.setPointerCapture(e.pointerId);e.preventDefault()});
        th.addEventListener('pointermove',function(e){if(!drag)return;var k=(c.scrollWidth-c.clientWidth)/Math.max(1,tr.clientWidth-th.offsetWidth);c.scrollLeft=drag.sl+(e.clientX-drag.x)*k});
        th.addEventListener('pointerup',function(){drag=null});
        tr.addEventListener('pointerdown',function(e){if(e.target!==tr)return;var r=tr.getBoundingClientRect(),f=(e.clientX-r.left-th.offsetWidth/2)/Math.max(1,r.width-th.offsetWidth);c.scrollTo({left:Math.max(0,Math.min(1,f))*(c.scrollWidth-c.clientWidth),behavior:'smooth'})});
        c.addEventListener('scroll',function(){pos(c,bar)},{passive:true})}
      bar.style.width=c.clientWidth+'px';pos(c,bar)})}catch(_){}}
  function pos(c,bar){try{var tr=bar.querySelector('.ad121-tr'),th=tr.firstChild,w=tr.clientWidth,f=c.clientWidth/c.scrollWidth,tw=Math.max(40,Math.round(w*f)),m=c.scrollWidth-c.clientWidth;
    th.style.width=tw+'px';th.style.transform='translateX('+Math.round(m>0?c.scrollLeft/m*(w-tw):0)+'px)';
    bar.querySelector('.ad121-l').disabled=c.scrollLeft<=1;bar.querySelector('.ad121-r').disabled=c.scrollLeft>=m-1}catch(_){}}
  /* 1121A R2（使用者：「選位系統的寵物和兒童還在嗎？」）：航班資料座位圖原本只標寵物（🐾），兒童沒有任何標示 →
     依旅客生日（manifest7 的 dob，跟旅客名單「生日」欄同一份）算搭機當天年齡：未滿 2 歲＝嬰兒、未滿 12 歲＝兒童，座位格角落加標記、滑過寫出來 */
  window.kgmKidSeatR1121A=function(k,p,mode){try{var dob=p&&p.dob;if(!dob)return '';var m=/\d{4}-\d{2}-\d{2}/.exec(String(k||''));var d=m?m[0]:(typeof todayISO==='function'?todayISO():'');
    var a=(new Date(d+'T12:00:00Z')-new Date(String(dob).slice(0,10)+'T12:00:00Z'))/31557600000;if(!(a>=0&&a<12))return '';var inf=a<2;
    if(mode==='c')return inf?' inf121':' kid121';return z()?(inf?'・👶 嬰兒':'・🧒 兒童（'+Math.floor(a)+' 歲）'):(inf?' · infant':' · child')}catch(_){return ''}};
  /* 1121A Q2（使用者：「圖二is this working now? 我查幾個都是no flight欸」＝登機門／櫃檯頁的停機位查詢）：
     我這邊各種開法（合併檔、後台檔、1120A 交付檔、真的點選）TPE 2026-11-21 每個門都有 1～5 班，重現不出來。
     → 下拉選單每個門後面寫「N 班」（同一個查詢函式 kgmStandLookupR74 逐門算，分段在閒置時算、依機場＋日期快取），
       選到沒有航班的門時，下面列出這天有航班的門（點了直接查）；整天所有門都是 0 會直接寫出來，不再只看到一個門說沒有。 */
  var SC={};
  function standCounts(){try{if(!(S.view==='admin'&&S.adminAuthed))return;var sec=document.querySelector('#app .k74-stand');if(!sec)return;
    var sel=sec.querySelector('select'),di=sec.querySelector('input[type=date]');if(!sel||!di||typeof window.kgmStandLookupR74!=='function')return;
    var em=sec.querySelector('.k74-empty'),apm=em&&/^([A-Z]{3})\s/.exec(em.textContent.trim()),ap=(apm&&apm[1])||S._cr74StandAp||(typeof S._cr74Ap==='string'&&S._cr74Ap)||'TPE';
    var key=ap+'|'+di.value,c=SC[key];
    if(!c){c=SC[key]={n:{},todo:[].map.call(sel.options,function(o){return o.value}).filter(Boolean),done:false};}
    if(!c.done&&!c.busy){c.busy=1;var run=function(dl){var t0=performance.now();while(c.todo.length&&(performance.now()-t0<30)){var g=c.todo.shift();try{c.n[g]=window.kgmStandLookupR74(ap,di.value,g).rows.length}catch(_){c.n[g]=0}}
        if(c.todo.length){(window.requestIdleCallback||function(f){return setTimeout(f,60)})(run,{timeout:1500})}else{c.done=true;c.busy=0;standCounts()}};
      (window.requestIdleCallback||function(f){return setTimeout(f,60)})(run,{timeout:1500});return}
    if(!c.done)return;var zh=z();
    [].forEach.call(sel.options,function(o){if(!o.value)return;var n=c.n[o.value];if(n==null)return;var base=o.getAttribute('data-ad121')||o.textContent;o.setAttribute('data-ad121',base);var t=base+' · '+n+(zh?' 班':(n===1?' flight':' flights'));if(o.textContent!==t)o.textContent=t});
    var g=sel.value;if(em&&g&&!c.n[g]&&!sec.querySelector('.ad121-alt')){var has=Object.keys(c.n).filter(function(k){return c.n[k]>0});var d=document.createElement('div');d.className='ad121-alt';
      d.innerHTML=has.length?((zh?'這天有航班的停機位（點一下直接查）：':'Stands with flights on this date: ')+has.map(function(k){return '<button type="button" onclick="kgmCrGateR74(\''+k+'\')">'+k+' <b>'+c.n[k]+'</b></button>'}).join(''))
        :(zh?'這一天 '+ap+' 所有停機位都查不到航班——這不正常，請把這個畫面截圖給我。':'No stand at '+ap+' has any flight on this date.');
      em.after(d)}}catch(_){}}
  setInterval(standCounts,900);
  hook();[0,1500,4000,12000].forEach(function(t){setTimeout(hook,t)});setInterval(paint,1500);setInterval(hbars,700);
  var CSS='@media(min-width:641px){'
    +'#app .p-admin-grid{align-items:start}'
    +'html.ad120-on body,html.ad120-on #app{overflow-x:clip!important;overflow-y:visible!important}'
    +'#app .p-admin-side{position:sticky;top:calc(var(--ad120-top,0px) + 14px);max-height:calc(100vh - var(--ad120-top,0px) - 28px);overflow:auto;scrollbar-width:thin}'
    +'#app .p-admin-side>section{margin:0 0 10px!important;padding:0 0 8px;border-bottom:1px solid #F0EBDF}#app .p-admin-side>section:last-of-type{border-bottom:0}'
    +'#app .p-admin-side>section>label{display:block;font-size:10.5px!important;letter-spacing:.16em;color:#9A8A62!important;font-weight:800!important;margin:6px 0 4px 10px!important;text-transform:uppercase}'
    +'#app .p-admin-side button.on{position:relative;box-shadow:inset 3px 0 0 #C9A24F!important}'
    +'#app .p-admin-side .ad120-hide{display:none!important}'
    +'.ad120-q{margin:4px 0 12px}.ad120-q input{width:100%;box-sizing:border-box;border:1px solid #E3DCCB;border-radius:10px;padding:8px 10px;font:inherit;font-size:12.5px;background:#FBFAF6;outline:none}.ad120-q input:focus{border-color:#0B3D2E;background:#fff}'
    +'.ad120-none{font-size:12px;color:#9A948A;margin:0 0 10px 4px}'
    +'.r7-map-seat.kid121,.r7-map-seat.inf121{position:relative;box-shadow:inset 0 0 0 2px #3E7CB1!important}.r7-map-seat.kid121::after,.r7-map-seat.inf121::after{content:"兒";position:absolute;left:-6px;bottom:-7px;background:#3E7CB1;color:#fff;font-size:9px;font-weight:800;line-height:1;padding:2px 3px;border-radius:6px}.r7-map-seat.inf121::after{content:"嬰";background:#8A4FB0}.r7-map-seat.inf121{box-shadow:inset 0 0 0 2px #8A4FB0!important}'
    +'.ad121-alt{margin:10px 0 0;font-size:12.5px;color:#5d665f;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.ad121-alt button{border:1px solid #DCD3BE;background:#FBFAF6;border-radius:999px;padding:4px 10px;font:inherit;font-size:12px;cursor:pointer}.ad121-alt button b{color:#0B3D2E;margin-left:3px}.ad121-alt button:hover{border-color:#0B3D2E}'
    +'.ad121-hs{position:sticky;bottom:0;z-index:30;display:flex;align-items:center;gap:8px;box-sizing:border-box;padding:7px 10px;background:rgba(255,255,255,.97);border:1px solid #E7E1D3;border-top:0;border-radius:0 0 12px 12px;box-shadow:0 -4px 12px rgba(20,40,30,.06)}'+'.ad121-hs button{flex:none;width:28px;height:24px;border:1px solid #DCD3BE;background:#FBFAF6;border-radius:8px;font-size:17px;line-height:1;color:#0B3D2E;cursor:pointer}.ad121-hs button:disabled{opacity:.35;cursor:default}'+'.ad121-tr{position:relative;flex:1;height:10px;border-radius:999px;background:#EEEAE0;cursor:pointer}.ad121-tr>i{position:absolute;left:0;top:0;height:10px;border-radius:999px;background:#0B3D2E;opacity:.75;cursor:grab;touch-action:none}.ad121-tr>i:active{cursor:grabbing;opacity:.9}'+'.ad121-hs>span{flex:none;font-size:11.5px;color:#8A8F86}'
    +'#app .p-admin-title.ad120-hd h1{font-size:30px!important;line-height:1.2}#app .p-admin-title.ad120-hd div>span{letter-spacing:.14em}'
    +'}';
  try{var st=document.createElement('style');st.id='ad120-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
