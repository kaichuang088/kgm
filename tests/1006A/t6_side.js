// 1006A：後台檔開檔閃前台＋長任務量測（讀 /tmp/j/w48_admin.html）
const {chromium}=require('playwright');
const F=process.env.F||'/tmp/j/w48_admin.html',OUT=process.env.O||'/tmp/j/t6';
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 await p.addInitScript(()=>{window.__lt=[];window.__vis=[];try{new PerformanceObserver(l=>{l.getEntries().forEach(e=>window.__lt.push({t:Math.round(e.startTime),d:Math.round(e.duration)}))}).observe({type:'longtask',buffered:true})}catch(e){}
   var f=function(){try{var a=document.getElementById('app'),boot=document.documentElement.classList.contains('kgm-boot1006A'),v=((typeof S!=='undefined'&&S.view))||'',txt=a?a.innerText.length:0;var last=window.__vis[window.__vis.length-1];var cur=(boot?'cover':'open')+'|'+v+'|'+(txt>0);if(!last||last.s!==cur)window.__vis.push({t:Math.round(performance.now()),s:cur})}catch(_){}requestAnimationFrame(f)};requestAnimationFrame(f)});
 const t0=Date.now();
 await p.goto('file://'+F,{waitUntil:'commit',timeout:300000});
 for(const ms of [300,700,1200,2000,3000,4500,6000]){const w=ms-(Date.now()-t0);if(w>0)await p.waitForTimeout(w);try{await p.screenshot({path:OUT+'_'+ms+'.png',timeout:20000})}catch(e){console.log('shot fail',ms,String(e).slice(0,80))}}
 await p.waitForFunction(()=>typeof S!=='undefined'&&!document.documentElement.classList.contains('kgm-boot1006A')&&(document.getElementById('app')||{}).innerText,null,{timeout:300000});await p.waitForTimeout(60000);
 console.log('READY ms',Date.now()-t0);
 const vis=await p.evaluate(()=>window.__vis);console.log('VIS',JSON.stringify(vis));
 // 登入 CEO（走後台登入畫面）
 const login=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));var inp=[...document.querySelectorAll('#app input')];var pw=inp.find(i=>i.type==='password');var id=inp.find(i=>i!==pw&&i.type!=='hidden');
   return {inputs:inp.length,hasPw:!!pw,view:S.view,tab:S.adminTab,authed:!!S.adminAuthed,txt:document.getElementById('app').innerText.slice(0,200)}});
 console.log('LOGINPAGE',JSON.stringify(login));
 await p.screenshot({path:OUT+'_login.png'});
 const lt1=await p.evaluate(()=>window.__lt);const big=lt1.filter(x=>x.d>=1000);
 console.log('LT boot n',lt1.length,'max',Math.max(0,...lt1.map(x=>x.d)),'>=1s',JSON.stringify(big.slice(0,20)));
 console.log('ERR',JSON.stringify(errs.slice(0,5)));
 await b.close();})();
