    /* 1012A #255：前台首頁動畫（使用者：「用戶端的頁面可不可以有點動畫在提升主畫面質感」）
       0927C 已經有：按鈕／卡片滑過浮起、換頁淡入、往下滑時區塊依序浮現。這裡只加首頁主視覺，不動其他頁：
       · 進入首頁時：標籤、標題、說明、數字依序浮現；標題裡金色的機型名稱掃過一道光；數字從 0 數上來（結束時文字跟原本一字不差）。
       · 背景兩條航線：一道金色光點沿著航線慢慢飛過去，航線上的城市點有呼吸光圈（一直播，但很淡）。
       · 目的地卡片：滑過時圓形城市插畫微微放大、變亮。
       · 只用 opacity／transform，不改版面；同一頁背景重畫不重播進場；系統設定「減少動態效果」時全部不播。 */
    (function(){
      var CSS12='@media (prefers-reduced-motion: no-preference){'
        +'.k12h-in{animation:k12hUp .75s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--k12d,0ms)}'
        +'@keyframes k12hUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}'
        +'.k12h-gold{background-image:linear-gradient(100deg,var(--gold2) 0%,var(--gold2) 38%,#fff6dc 50%,var(--gold2) 62%,var(--gold2) 100%);background-size:260% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:k12hShine 1.8s cubic-bezier(.4,0,.2,1) .95s 1 both}'
        +'@keyframes k12hShine{from{background-position:100% 0}to{background-position:0 0}}'
        +'.k12h-fly{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}'
        +'.k12h-fly .tr{fill:none;stroke:#E9CF95;stroke-width:1.6;stroke-linecap:round;opacity:.55;animation:k12hTrail var(--k12dur,11s) linear infinite;animation-delay:var(--k12del,0s)}'
        +'@keyframes k12hTrail{from{stroke-dashoffset:var(--k12a,90)}to{stroke-dashoffset:var(--k12b,-1400)}}'
        +'.k12h-fly .pl{fill:#E9CF95;opacity:0;animation:k12hPulse 3.6s ease-out infinite;transform-box:fill-box;transform-origin:center}'
        +'@keyframes k12hPulse{0%{opacity:.45;transform:scale(.6)}80%{opacity:0;transform:scale(3.2)}100%{opacity:0;transform:scale(3.2)}}'
        +':where(.r11-dest) .r11-oval{transition:transform .9s cubic-bezier(.2,.7,.2,1),filter .6s ease}'
        +':where(.r11-dest):hover .r11-oval{transform:scale(1.04);filter:brightness(1.08) saturate(1.06)}'
        +'}';
      function reduced(){try{return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}}
      function css(){if(document.getElementById('k12-motion'))return;var st=document.createElement('style');st.id='k12-motion';st.textContent=CSS12;(document.head||document.documentElement).appendChild(st)}
      function front(){try{return window.KGM_SIDE!=='admin'&&S.view!=='admin'}catch(_){return false}}
      function heroOf(app){var sv=app.querySelector('svg[viewBox="0 0 1200 340"]');if(!sv)return null;var bg=sv.parentNode,hero=bg&&bg.parentNode;if(!hero)return null;
        var box=null;for(var i=hero.children.length-1;i>=0;i--){if(hero.children[i].querySelector('h1')){box=hero.children[i];break}}return box?{hero:hero,svg:sv,box:box}:null}
      /* 背景航線：光點拖尾＋城市點呼吸光圈（疊一層同尺寸的 SVG，原本那層不動） */
      function fly(H){
        if(H.hero.querySelector('.k12h-fly'))return;
        var ps=[].slice.call(H.svg.querySelectorAll('path')),cs=[].slice.call(H.svg.querySelectorAll('circle'));if(!ps.length)return;
        var NS='http://www.w3.org/2000/svg',o=document.createElementNS(NS,'svg');o.setAttribute('class','k12h-fly');o.setAttribute('viewBox','0 0 1200 340');o.setAttribute('preserveAspectRatio','none');o.setAttribute('aria-hidden','true');
        ps.forEach(function(p,i){var t=document.createElementNS(NS,'path');t.setAttribute('d',p.getAttribute('d'));t.setAttribute('class','tr');
          var L=1400;try{L=Math.ceil(p.getTotalLength())||1400}catch(_){}var seg=Math.round(L*0.07);
          t.style.strokeDasharray=seg+' '+(L+seg*2);t.style.setProperty('--k12a',String(seg));t.style.setProperty('--k12b',String(-L-seg));
          t.style.setProperty('--k12dur',(i?14:11)+'s');t.style.setProperty('--k12del',(i?-6.5:-1.5)+'s');o.appendChild(t)});
        cs.forEach(function(c,i){var p=document.createElementNS(NS,'circle');p.setAttribute('cx',c.getAttribute('cx'));p.setAttribute('cy',c.getAttribute('cy'));p.setAttribute('r','4');p.setAttribute('class','pl');p.style.animationDelay=(i*1.8)+'s';o.appendChild(p)});
        H.svg.parentNode.parentNode.insertBefore(o,H.box);
      }
      /* 數字從 0 數上來：只動開頭那串數字，前後文字原封不動，結束時寫回原本的字 */
      function count(el,delay){
        var txt=el.textContent,m=/^(\D*)(\d+)(.*)$/.exec(txt);if(!m)return;var n=+m[2];if(!(n>1))return;
        var t0=null,dur=1200;el.style.fontVariantNumeric='tabular-nums';el.textContent=m[1]+'0'+m[3];
        function step(ts){if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-k,3);
          if(!el.isConnected)return;el.textContent=k<1?(m[1]+Math.round(n*e)+m[3]):txt;if(k<1)requestAnimationFrame(step);else el.style.fontVariantNumeric=''}
        setTimeout(function(){requestAnimationFrame(step)},delay);
      }
      function enter(H){
        var kids=[].slice.call(H.box.children),d=60;
        kids.forEach(function(el){el.style.setProperty('--k12d',d+'ms');el.classList.add('k12h-in');d+=110;
          el.addEventListener('animationend',function f(e){if(e.target!==el)return;el.classList.remove('k12h-in');el.style.removeProperty('--k12d');el.removeEventListener('animationend',f)})});
        var g=H.box.querySelector('h1 span');if(g){g.classList.add('k12h-gold');g.addEventListener('animationend',function f(e){if(e.target!==g)return;g.classList.remove('k12h-gold');g.removeEventListener('animationend',f)})}
        var stats=kids[kids.length-1];if(stats&&!stats.querySelector('h1')){[].slice.call(stats.children).forEach(function(c,i){var v=c.firstElementChild;if(v)count(v,420+i*120)})}
      }
      var LASTV='',RAF=0;
      function run(){RAF=0;try{
        var app=document.getElementById('app');if(!app||!front())return;
        var v=String(S.view||'');if(v!=='home'){LASTV=v;return}
        var H=heroOf(app);if(!H)return;
        if(reduced()){LASTV=v;return}
        css();fly(H);
        if(LASTV!=='home'&&!H.box.getAttribute('data-k12h')){H.box.setAttribute('data-k12h','1');enter(H)}
        LASTV=v;
      }catch(_){}}
      function later(){if(!RAF)RAF=requestAnimationFrame(run)}
      if(typeof render==='function'){var _r12=render;render=window.render=function(){var r=_r12.apply(this,arguments);later();return r}}
      [0,300,1200].forEach(function(ms){setTimeout(later,ms)});
      window.kgmMotionAuditR1012A=function(){var app=document.getElementById('app'),H=app&&heroOf(app);return {css:!!document.getElementById('k12-motion'),fly:!!(H&&H.hero.querySelector('.k12h-fly')),reduced:reduced(),view:(window.S||{}).view}};
    })();
