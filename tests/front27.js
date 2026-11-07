const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1360,height:950}});const A=await ctx.newPage();
 for(const label of ['FIRST','RELOAD']){
 if(label==='FIRST')await A.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});else await A.reload({waitUntil:'domcontentloaded'});
 await A.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({type:'longtask',buffered:true})});
 const marks=[];for(let s=0;s<90;s+=15){await A.waitForTimeout(15000);marks.push(await A.evaluate(()=>{const l=window.__lt;return Math.round(performance.now()/1000)+'s:'+l.reduce((a,x)=>a+x[1],0)+'/max'+l.reduce((a,x)=>Math.max(a,x[1]),0)}))}
 console.log(label,marks.join(' | '));
 // 搜尋一次：量點擊到畫面更新
 const t=await A.evaluate(()=>{const t0=performance.now();S.search.type='RT';S.search.fr='TPE';S.search.to='NRT';S.search.dep=addDays(todayISO(),30);S.search.ret=addDays(todayISO(),35);S.search.adults=1;S.phase='sel_out';nav('booking');return performance.now()-t0});
 console.log(label,'search render ms',Math.round(t));}
 await b.close()})();
