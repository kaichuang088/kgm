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
    if(S.view!=='admin'||!S.adminAuthed)return;var side=document.querySelector('#app .p-admin-side');if(!side)return;
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
  hook();[0,1500,4000,12000].forEach(function(t){setTimeout(hook,t)});setInterval(paint,1500);
  var CSS='@media(min-width:641px){'
    +'#app .p-admin-grid{align-items:start}'
    +'#app .p-admin-side{position:sticky;top:14px;max-height:calc(100vh - 28px);overflow:auto;scrollbar-width:thin}'
    +'#app .p-admin-side>section{margin:0 0 10px!important;padding:0 0 8px;border-bottom:1px solid #F0EBDF}#app .p-admin-side>section:last-of-type{border-bottom:0}'
    +'#app .p-admin-side>section>label{display:block;font-size:10.5px!important;letter-spacing:.16em;color:#9A8A62!important;font-weight:800!important;margin:6px 0 4px 10px!important;text-transform:uppercase}'
    +'#app .p-admin-side button.on{position:relative;box-shadow:inset 3px 0 0 #C9A24F!important}'
    +'#app .p-admin-side .ad120-hide{display:none!important}'
    +'.ad120-q{margin:4px 0 12px}.ad120-q input{width:100%;box-sizing:border-box;border:1px solid #E3DCCB;border-radius:10px;padding:8px 10px;font:inherit;font-size:12.5px;background:#FBFAF6;outline:none}.ad120-q input:focus{border-color:#0B3D2E;background:#fff}'
    +'.ad120-none{font-size:12px;color:#9A948A;margin:0 0 10px 4px}'
    +'#app .p-admin-title.ad120-hd h1{font-size:30px!important;line-height:1.2}#app .p-admin-title.ad120-hd div>span{letter-spacing:.14em}'
    +'}';
  try{var st=document.createElement('style');st.id='ad120-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
