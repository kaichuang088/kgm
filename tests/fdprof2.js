const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1360,height:950}});const p=await ctx.newPage();
 await p.goto('file://'+(process.env.F||'/tmp/j/kgm.html'),{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';render()});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(5000);
 const c=await ctx.newCDPSession(p);await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:200});await c.send('Profiler.start');
 const ms=await p.evaluate((code)=>{const f=FLIGHTS.find(f=>f.code===code);const t=performance.now();kgmFdOpenR1025B(code,todayISO(),f.fr,f.to);return Math.round(performance.now()-t)},process.env.C||'KX180');
 const {profile}=await c.send('Profiler.stop');
 const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const parent={};profile.nodes.forEach(n=>(n.children||[]).forEach(ch=>parent[ch]=n.id));
 const dt={};for(let i=0;i<profile.samples.length;i++){dt[profile.samples[i]]=(dt[profile.samples[i]]||0)+(profile.timeDeltas[i]||0)}
 // aggregate by the "first non-wrapper frame below adminView": collapse stack to frames whose name not in render/fullPage/w/wrapped/etc
 const skip=/^(window\.)?(render|fullPage|fp59|fp|w|wrapped|wrapA|adminView|fn|\(root\)|)$/;
 const agg={};
 Object.keys(dt).forEach(id=>{let x=+id;const st=[];while(x){const n=byId[x];const nm=n.callFrame.functionName;if(!skip.test(nm))st.push(nm+'@'+n.callFrame.lineNumber);x=parent[x]}st.reverse();const key=st.slice(0,5).join(' > ');agg[key]=(agg[key]||0)+dt[id]});
 console.log('open',ms);console.log(Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,30).map(x=>Math.round(x[1]/1000)+'  '+x[0]).join('\n'));
 await b.close()})();
