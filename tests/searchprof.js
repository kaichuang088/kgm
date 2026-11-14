const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1360,height:950}});const A=await ctx.newPage();
 await A.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});await A.waitForTimeout(40000);
 const cdp=await ctx.newCDPSession(A);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');
 const t=await A.evaluate(()=>{const t0=performance.now();S.search.type='RT';S.search.fr='TPE';S.search.to='NRT';S.search.dep=addDays(todayISO(),30);S.search.ret=addDays(todayISO(),35);S.search.adults=1;S.phase='sel_out';nav('booking');return performance.now()-t0});
 const t2=await A.evaluate(()=>{const t0=performance.now();S.search.dep=addDays(todayISO(),31);render();return performance.now()-t0});
 const {profile}=await cdp.send('Profiler.stop');require('fs').writeFileSync('/tmp/j/search.cpuprofile',JSON.stringify(profile));console.log('search',Math.round(t),'next day',Math.round(t2));await b.close()})();
