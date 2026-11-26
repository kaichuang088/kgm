// 1020B：手機 下排固定（捲動、鍵盤）、右上角登入、iOS viewport；桌機不出現
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
const SP='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/mb20b/';require('fs').mkdirSync(SP,{recursive:true});
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch();const errs=[];const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+JSON.stringify(x):''))};
 const mk=async(o)=>{const p=await (await b.newContext(o)).newPage();p.on('pageerror',e=>errs.push(e.message.slice(0,200)));await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(14000);return p};
 const p=await mk({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await p.evaluate(()=>{S.user=null;nav('home');window.scrollTo(0,0)});await p.waitForTimeout(500);
 let r=await p.evaluate(()=>{const l=document.querySelector('header .kt20b-login');const rc=l&&l.getBoundingClientRect();return {t:l&&l.textContent,vis:l&&getComputedStyle(l).display,r:rc&&[Math.round(rc.left),Math.round(rc.right),Math.round(rc.top)],last:l&&l===l.parentElement.lastElementChild,meta:[...document.querySelectorAll('meta[name=viewport]')].map(m=>m.content)}});
 ok('login button top-right 登入',r.t==='登入'&&r.vis!=='none'&&r.r[1]<=390&&r.r[1]>340&&r.r[2]<40,r);ok('non-iOS viewport unchanged',!r.meta.some(x=>/maximum-scale/.test(x)),r.meta);
 await p.screenshot({path:SP+'01_header_guest.png',clip:{x:0,y:0,width:390,height:120}});
 await p.click('header .kt20b-login');await p.waitForTimeout(500);ok('guest tap → auth',await p.evaluate(()=>S.view)==='auth');
 await p.evaluate(()=>{S.user=(S.users||[])[0];nav('home');window.scrollTo(0,0)});await p.waitForTimeout(500);
 r=await p.evaluate(()=>{const l=document.querySelector('header .kt20b-login');return {cls:l.className,t:l.textContent,av:!!l.querySelector('.kt20b-av'),nm:S.user&&S.user.name}});ok('logged-in avatar',r.av&&/kt20b-in/.test(r.cls),r);
 await p.screenshot({path:SP+'02_header_user.png',clip:{x:0,y:0,width:390,height:120}});
 await p.click('header .kt20b-login');await p.waitForTimeout(500);ok('member tap → profile',await p.evaluate(()=>S.view+'/'+S.profileTab)==='profile/profile');
 r=await p.evaluate(()=>{const l=document.querySelector('header .kt20b-login');return l.className});ok('on-state on profile',/\bon\b/.test(r),r);
 // drawer + bottom bar unchanged
 r=await p.evaluate(()=>({tabs:[...document.querySelectorAll('#kgmTabR1019A .kt19-t')].map(x=>x.textContent),menu:!!document.querySelector('.kt19-menu')}));ok('bottom bar 5 + ☰ still there',r.tabs.length===5&&r.menu,r);
 await p.evaluate(()=>{S.user=null;render()});
 // English
 await p.evaluate(()=>{setLang('en');nav('home')});await p.waitForTimeout(400);ok('EN label',await p.evaluate(()=>document.querySelector('header .kt20b-login').textContent)==='Log in');await p.evaluate(()=>{setLang('zh');nav('home')});
 // pax page: bar stays at bottom while scrolling
 await p.evaluate(()=>{S.view='booking';S.phase='sel_out';S.openFare=null;S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',dep:'2026-11-12',type:'OW',pax:1,cabin:'Economy',useMiles:false});render()});await p.waitForTimeout(900);
 await p.evaluate(()=>{pickFare('out',0,'E-E',false)});await p.waitForTimeout(1200);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);const pos=[];
 for(const y of [0,300,700,1200,H]){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(250);pos.push(await p.evaluate(()=>{const t=document.getElementById('kgmTabR1019A').getBoundingClientRect();return [Math.round(window.scrollY),Math.round(t.top),Math.round(t.bottom)]}))}
 ok('bar fixed at viewport bottom while scrolling (pax page)',pos.every(x=>x[2]===844&&x[1]>=844-80),{H,pos});
 await p.evaluate(()=>window.scrollTo(0,500));await p.waitForTimeout(200);await p.screenshot({path:SP+'03_pax_scrolled.png'});
 // keyboard: focus text input
 const inp=await p.$('#app input[type=text]:not([readonly]),#app input:not([type]):not([readonly])');
 if(inp){await inp.focus();await p.waitForTimeout(200);
  r=await p.evaluate(()=>({kb:document.documentElement.classList.contains('kgm-kb-r1020b'),bar:getComputedStyle(document.getElementById('kgmTabR1019A')).display,act:document.activeElement.outerHTML.slice(0,80)}));ok('focus text → bar hidden',r.kb&&r.bar==='none',r);
  await p.screenshot({path:SP+'04_pax_typing.png'});
  await p.evaluate(()=>document.activeElement.blur());await p.waitForTimeout(250);
  r=await p.evaluate(()=>({kb:document.documentElement.classList.contains('kgm-kb-r1020b'),bar:getComputedStyle(document.getElementById('kgmTabR1019A')).display}));ok('blur → bar back',!r.kb&&r.bar!=='none',r);
 }else ok('found text input on pax page',false);
 // select/checkbox focus does not hide
 r=await p.evaluate(()=>{const s=document.querySelector('#app select');if(!s)return 'nosel';s.focus();return document.documentElement.classList.contains('kgm-kb-r1020b')});ok('select focus keeps bar',r===false||r==='nosel',r);
 await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
 // sticky CTA unstuck while typing (addons/confirm row)
 await p.evaluate(()=>{S.phase='addons';render()});await p.waitForTimeout(700);
 r=await p.evaluate(()=>{const a=document.querySelector('#app .r7-actionline');if(!a)return 'none';const p0=getComputedStyle(a).position;document.documentElement.classList.add('kgm-kb-r1020b');const p1=getComputedStyle(a).position;document.documentElement.classList.remove('kgm-kb-r1020b');return p0+'→'+p1});ok('sticky CTA static while keyboard',r==='sticky→static',r);
 await p.context().close();
 // iOS UA → maximum-scale
 const q=await mk({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:IOS});
 r=await q.evaluate(()=>[...document.querySelectorAll('meta[name=viewport]')].map(m=>m.content));ok('iOS viewport maximum-scale=1',r.every(x=>/maximum-scale=1/.test(x)),r);await q.context().close();
 // desktop: nothing new visible
 const d=await mk({viewport:{width:1400,height:900}});
 r=await d.evaluate(()=>{const l=document.querySelector('.kt20b-login');return {disp:l?getComputedStyle(l).display:'absent',tab:getComputedStyle(document.getElementById('kgmTabR1019A')||document.body).display}});ok('desktop hides login btn + tab bar',(r.disp==='none'||r.disp==='absent')&&r.tab==='none',r);
 const inp2=await d.$('#app input');if(inp2){await inp2.focus();ok('desktop focus no kb class',!(await d.evaluate(()=>document.documentElement.classList.contains('kgm-kb-r1020b'))))}
 await d.context().close();
 console.log(R.join('\n'));console.log('errs',JSON.stringify(errs.slice(0,8)));await b.close()})();
