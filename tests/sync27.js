const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1360,height:950}});
 const A=await ctx.newPage(),B=await ctx.newPage();const errs=[];A.on('pageerror',e=>errs.push('A '+String(e).slice(0,150)));
 await A.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await A.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({entryTypes:['longtask']})});
 await A.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await A.waitForTimeout(5000);
 await A.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab=process&&0||'flightdata';render()}).catch(async()=>{await A.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';render()})});
 await A.waitForTimeout(8000);
 await B.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await B.waitForTimeout(20000);
 const t0=await A.evaluate(()=>{window.__lt=[];return performance.now()});
 // B：一般操作——存檔 10 次（每次改一點東西）
 for(let i=0;i<10;i++){await B.evaluate((i)=>{S.notifs=S.notifs||[];S.notifs.unshift({title:'t'+i,message:'m',date:todayISO(),read:false});save()},i);await B.waitForTimeout(700)}
 await A.waitForTimeout(6000);
 const lt=await A.evaluate(()=>window.__lt);const tot=lt.reduce((a,x)=>a+x[1],0),mx=lt.reduce((a,x)=>Math.max(a,x[1]),0);
 console.log('A longtasks',lt.length,'total',tot,'max',mx,JSON.stringify(lt.slice(0,20)));
 console.log('A app text len',await A.evaluate(()=>(document.querySelector('#app')||{}).innerText.length),'view',await A.evaluate(()=>S.view+' '+S.adminTab));
 console.log('errors',errs);await b.close()})();
