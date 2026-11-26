// 1025B L：前台卡頓 —— 開頁後背景長任務、首頁→搜尋→選航班各步驟時間
const {chromium}=require('playwright');
(async()=>{const f=process.argv[2]||'kgm_front.html';const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,140)));
 await p.addInitScript(()=>{window.__lt=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push({t:Math.round(e.startTime),d:Math.round(e.duration)}))).observe({entryTypes:['longtask']})}catch(_){}});
 const t0=Date.now();await p.goto('file:///tmp/j/'+f,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById('app');return a&&a.innerHTML.length>3000},null,{timeout:300000});console.log('first paint',Date.now()-t0,'ms');
 for(const sec of [10,30,60,120]){await p.waitForTimeout(sec===10?10000:(sec===30?20000:(sec===60?30000:60000)));
   const r=await p.evaluate(()=>{const L=window.__lt;window.__lt=[];return {n:L.length,sum:L.reduce((a,x)=>a+x.d,0),max:Math.max(0,...L.map(x=>x.d))}});console.log('until',sec,'s longtasks',JSON.stringify(r))}
 const step=async(name,fn)=>{await p.evaluate(()=>{window.__lt=[]});const t=Date.now();await p.evaluate(fn);await p.waitForTimeout(1500);const r=await p.evaluate(()=>{const L=window.__lt;return {n:L.length,sum:L.reduce((a,x)=>a+x.d,0),max:Math.max(0,...L.map(x=>x.d))}});console.log(name,'eval',Date.now()-t-1500,'ms',JSON.stringify(r))};
 await step('search TPE-NRT',()=>{S.view='booking';S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',type:'RT',dep:addDays(todayISO(),20),ret:addDays(todayISO(),25)});S.phase='sel_out';render()});
 await step('rerender',()=>{render()});
 await step('home',()=>{S.view='home';render()});
 await step('flight status',()=>{S.view='flights';render()});
 console.log('errors',errs.slice(0,4));await b.close()})();
