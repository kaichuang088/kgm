// full-year fleet rebuild cost, idle page (no tab activity): long tasks + KGM_ROT_FINAL_MS_R913
const {chromium}=require('playwright');
(async()=>{for(const f of process.argv.slice(2)){const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();
 await p.addInitScript(()=>{window.__LT=[];try{new PerformanceObserver(l=>{l.getEntries().forEach(e=>{if(e.duration>1500)window.__LT.push([Math.round(e.startTime/1000),Math.round(e.duration)])})}).observe({entryTypes:['longtask']})}catch(_){}});
 await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(170000);
 console.log(f.split('/').pop(),JSON.stringify(await p.evaluate(()=>({lt:window.__LT,final:window.KGM_ROT_FINAL_MS_R913||null,full:window.KGM_FULLDONE_1006A?Math.round((window.KGM_FULLDONE_1006A-performance.timeOrigin)/1000):null}))));await b.close()}})();
