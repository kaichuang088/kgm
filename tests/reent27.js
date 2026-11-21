const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1360,height:950}});const A=await ctx.newPage();
 const run=async(label,first)=>{
   if(first)await A.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});else await A.reload({waitUntil:'domcontentloaded',timeout:300000});
   await A.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({type:'longtask',buffered:true})});
   await A.waitForTimeout(3000);
   await A.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='dashboard';render()});
   const T=+(process.env.T||180);const marks=[];
   for(let s=0;s<T;s+=30){await A.waitForTimeout(30000);marks.push(await A.evaluate(()=>{const l=window.__lt;const tot=l.reduce((a,x)=>a+x[1],0),mx=l.reduce((a,x)=>Math.max(a,x[1]),0);return Math.round(performance.now()/1000)+'s:tot'+tot+'/max'+mx+'/full'+(!!window.KGM_FULLDONE_1006A)+'/crew'+(!!window.KGM_CREW_SAVE_R1025B)}))}
   console.log(label,marks.join(' | '));
   console.log(label,'LS crewsched len',await A.evaluate(()=>{try{return (localStorage.getItem('kgm_crewsched')||'').length}catch(e){return -1}}),'total LS',await A.evaluate(()=>{let n=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=(localStorage.getItem(k)||'').length}return n}));
 };
 await run('FIRST',true);await run('RELOAD',false);await b.close()})();
