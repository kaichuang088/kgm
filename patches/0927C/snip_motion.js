/* ── 0927C：全站動畫（使用者：「可以的話網站加一點動畫，不論是按鈕、滑動等等」） ─────────────
   · 按鈕：滑過微微浮起＋陰影、按下輕壓（所有規則用 :where()，權重 0，不會蓋掉原本任何樣式）。
   · 卡片：目的地卡、航班列滑過浮起。
   · 換頁：主內容淡入；往下滑時，區塊與卡片依序浮現（IntersectionObserver）。
   · 只有「換頁」才播：同一頁因為背景排班重畫（render）不會重播、也不會閃。
   · 等待浮現的區塊只設 opacity:0，不留位移，版面量測（重疊、跳站檢查）不受影響；播完就把 class 拿掉。
   · 系統設定「減少動態效果」時完全不播。 */
(function(){
  var CSS927C=
   '@media (prefers-reduced-motion: no-preference){'
  +':where(button,.btn,a.btn,[role="button"],.daychip,.ntab,.portal-link0815,.r11-dest,.fl-row){transition:background-color .18s ease,color .18s ease,border-color .18s ease,box-shadow .24s ease,transform .18s cubic-bezier(.2,.7,.2,1),opacity .18s ease}'
  +':where(.btn,.btn-g,.apbig,.r11-cta,.r31-detail-btn,.daychip,.k171-idbtn):hover{transform:translateY(-1px)}'
  +':where(.btn-g,.apbig,.r11-cta):hover{box-shadow:0 8px 18px -10px rgba(10,46,36,.55)}'
  +':where(button,.btn,a.btn,[role="button"],.daychip,.ntab):active{transform:translateY(0) scale(.97);transition-duration:.07s}'
  +':where(.r11-dest):hover{transform:translateY(-5px);box-shadow:0 22px 40px -22px rgba(6,36,28,.6)}'
  +':where(.fl-row):hover{box-shadow:0 14px 30px -22px rgba(6,36,28,.5)}'
  +'.kgm-enter927c{animation:kgmFade927c .28s ease both}'
  +'.kgm-rv927c{opacity:0}'
  +'.kgm-in927c{animation:kgmRise927c .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--kgm-d927c,0ms)}'
  +'@keyframes kgmFade927c{from{opacity:0}to{opacity:1}}'
  +'@keyframes kgmRise927c{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}'
  +'}';
  function reduced(){try{return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}}
  function css(){
    if(document.getElementById('kgm-motion-927c'))return;
    var st=document.createElement('style');st.id='kgm-motion-927c';st.textContent=CSS927C;
    (document.head||document.documentElement).appendChild(st);
  }
  var LAST='',IO=null,RAF=0;
  function sig(){try{return [S.view||'',S.view==='admin'?(S.adminTab||''):(S.phase||''),S.view==='admin'?(S.adminAuthed?1:0):''].join('|')}catch(_){return ''}}
  function done(e){var el=e.currentTarget;if(!el||!el.classList||e.target!==el)return;   /* 裡面元素自己的動畫結束也會冒泡上來，不算 */
    el.classList.remove('kgm-in927c','kgm-rv927c','kgm-enter927c');el.style.removeProperty('--kgm-d927c');el.removeEventListener('animationend',done)}
  function play(el,delay){
    el.classList.remove('kgm-rv927c');
    if(delay)el.style.setProperty('--kgm-d927c',delay+'ms');
    el.addEventListener('animationend',done);
    el.classList.add('kgm-in927c');
  }
  function mainOf(app){
    var m=app.querySelector('.p-admin-main');if(m)return {el:m,admin:true};
    var k=app.children,seen=false;
    for(var i=0;i<k.length;i++){if(k[i].tagName==='HEADER'){seen=true;continue}if(seen&&k[i].tagName==='DIV')return {el:k[i],admin:false}}
    return null;
  }
  function run(){
    RAF=0;
    var app=document.getElementById('app');if(!app)return;
    var s=sig();if(s===LAST)return;          /* 同一頁重畫：不重播 */
    var m=mainOf(app);if(!m||!m.el.children.length)return;   /* 還沒畫出來（載入中）就等下一次 */
    LAST=s;
    if(reduced())return;
    if(IO){try{IO.disconnect()}catch(_){}IO=null}
    var main=m.el;
    main.addEventListener('animationend',done);
    main.classList.add('kgm-enter927c');
    if(m.admin)return;                        /* 後台資料頁只淡入，不逐塊浮現（資料多，要快） */
    var cards=[].slice.call(main.querySelectorAll('.r11-dest,.fl-row,.card,.daychip'),0,48);
    var blocks=[].slice.call(main.children).filter(function(b){return cards.indexOf(b)<0&&!cards.some(function(c){return b.contains(c)})});
    var list=blocks.concat(cards).filter(function(el){return el.offsetParent!==null&&el.getBoundingClientRect().height>0});
    var vh=window.innerHeight||800,n=0,wait=[];
    list.forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<vh*0.96)play(el,Math.min(n++*40,280));   /* 畫面內：依序浮現 */
      else{el.classList.add('kgm-rv927c');wait.push(el)}  /* 畫面外：滑到才浮現 */
    });
    if(!wait.length)return;
    if(typeof IntersectionObserver!=='function'){wait.forEach(function(el){el.classList.remove('kgm-rv927c')});return}
    var k=0;
    IO=new IntersectionObserver(function(es){
      es.forEach(function(e){if(!e.isIntersecting)return;IO.unobserve(e.target);play(e.target,(k++%4)*60)});
    },{rootMargin:'0px 0px -6% 0px',threshold:0.01});
    wait.forEach(function(el){IO.observe(el)});
  }
  function hook(){
    var app=document.getElementById('app');if(!app||app.__kgmMotion927c)return !!app;
    app.__kgmMotion927c=1;
    css();
    new MutationObserver(function(){if(!RAF)RAF=requestAnimationFrame(run)}).observe(app,{childList:true});
    RAF=requestAnimationFrame(run);
    return true;
  }
  if(!hook())document.addEventListener('DOMContentLoaded',hook);
  window.kgmMotionR927C={sig:sig,last:function(){return LAST}};
})();
