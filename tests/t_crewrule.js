const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(60000);
 console.log(JSON.stringify(await p.evaluate(()=>{
   const T=todayISO();
   const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   let twoLegDays=0,people=0,longNoRest=0,legs=0,viol=0,sample=[];
   const crew=(S.staff||[]).filter(x=>x&&x.active!==false&&(x.role==='cabin'||x.role==='pilot')).slice(0,80);
   crew.forEach(c=>{
     let chain=null;try{chain=window.kgmCrewChainR210(c.empId,T,21)}catch(_){return}
     if(!chain)return;people++;
     let prevLong=null;
     chain.forEach(day=>{
       const op=(day.legs||[]).filter(l=>!(l.dhR913||l.deadhead));
       legs+=op.length;
       if(op.length>1){twoLegDays++;if(sample.length<5)sample.push(c.empId+' '+day.date+' '+op.map(l=>l.code).join('/'))}
       if(prevLong&&op.length&&prevLong!==day.date){
         // long-haul yesterday -> must not fly today
         const d1=D(prevLong,1);
         if(day.date===d1){longNoRest++;if(sample.length<5)sample.push(c.empId+' 長程'+prevLong+' 隔天還飛 '+day.date)}
       }
       if(op.some(l=>(+l.block||0)>=480))prevLong=day.date;
     });
   });
   // violations from the planner itself
   try{const pl=window.kgmCrewPlanR121(T);viol=(pl.violations||[]).length}catch(_){}
   return {people,legs,twoLegDays,longHaulNextDayFly:longNoRest,plannerViolations:viol,sample};
 }),null,1));
 console.log('ERR',JSON.stringify(errs.slice(0,3)));
 await b.close();})();
