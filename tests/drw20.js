const {chromium}=require('playwright');const SP='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/aud20/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
await p.goto('file:///tmp/j/kgm1020A_w5.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(14000);
await p.evaluate(()=>{nav('home');scrollTo(0,600)});await p.waitForTimeout(500);
const r={};r.y0=await p.evaluate(()=>scrollY);
r.hdrTop=await p.evaluate(()=>Math.round(document.querySelector('#app>header').getBoundingClientRect().top));
await p.click('.kt19-menu');await p.waitForTimeout(500);
await p.mouse.wheel(0,800);await p.waitForTimeout(400);r.yOpenAfterWheel=await p.evaluate(()=>scrollY);
r.drawerLeft=await p.evaluate(()=>Math.round(document.getElementById('kgmDrawerR1020A').getBoundingClientRect().left));
await p.screenshot({path:SP+'g_drawer_scrolled.png'});
await p.keyboard.press('Escape');await p.waitForTimeout(500);r.afterEsc=await p.evaluate(()=>[scrollY,document.documentElement.classList.contains('kgm-drawer-r1020a')]);
// swipe-left close
await p.click('.kt19-menu');await p.waitForTimeout(400);
const cdp=await p.context().newCDPSession(p);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:250,y:500}]});
for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:250-i*25,y:502}]});}
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(500);
r.afterSwipe=await p.evaluate(()=>document.documentElement.classList.contains('kgm-drawer-r1020a'));
// tap quick action 線上報到
await p.click('.kt19-menu');await p.waitForTimeout(400);await p.click('#kgmDrawerR1020A .kd20-q >> nth=0');await p.waitForTimeout(800);r.quick0=await p.evaluate(()=>S.view);
// view change closes; AI tab
await p.evaluate(()=>nav('home'));await p.click('.kt19-menu');await p.waitForTimeout(300);await p.evaluate(()=>nav('status'));await p.waitForTimeout(300);r.closedOnNav=!(await p.evaluate(()=>document.documentElement.classList.contains('kgm-drawer-r1020a')));
// MC tabs full width
await p.evaluate(()=>{nav('home');S.search.type='MC';S.search.segs=[{fr:'TPE',to:'NRT',dep:'2026-11-12'},{fr:'NRT',to:'SIN',dep:'2026-11-15'}];render();scrollTo(0,0)});await p.waitForTimeout(600);
r.mcTabs=await p.evaluate(()=>[...document.querySelectorAll('#app .ntab')].map(b=>Math.round(b.getBoundingClientRect().width)));
await p.screenshot({path:SP+'g_mc.png'});
await p.evaluate(()=>{S.search.type='RT';render();scrollTo(0,0)});
// sticky header after scroll
await p.evaluate(()=>scrollTo(0,900));await p.waitForTimeout(300);r.hdrTopScrolled=await p.evaluate(()=>Math.round(document.querySelector('#app>header').getBoundingClientRect().top));
// all mega items reachable: count drawer items vs mega li with onclick
r.items=await p.evaluate(()=>{kgmDrawerR1020A(true);const n=document.querySelectorAll('#kgmDrawerR1020A .kd20-it').length;const m=document.querySelectorAll('#app>header .mega li[onclick]').length;kgmDrawerR1020A(false);return [n,m]});
console.log(JSON.stringify(r),'errs',JSON.stringify(errs));await b.close()})();
