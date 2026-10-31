const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
const r0=await p.evaluate(()=>{var u=S.users.find(x=>x.email==='demo@kgm.com')||S.users[0];S.user=u;var T=todayISO();
 function mk(pnr,code,D){var f0=FLIGHTS.filter(x=>x.code===code&&!x.via)[0]||FLIGHTS.filter(x=>x.code===code)[0];var f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});S.bookings.push({pnr:pnr,status:'confirmed',userId:u.id,outF:f,outC:'E-T',inbF:null,paxList:[{firstName:'DEMO',lastName:'EXPLORER'}],seats:{},total:9000,curr:'TWD'})}
 var f0=FLIGHTS.find(x=>x.code==='KX180'),D;for(var i=10;i<25;i++){var d=addDays(T,i);if(flyOn(f0,new Date(d+'T12:00:00'))){D=d;break}}mk('PETAI1','KX180',D);S.bookings.push({pnr:'PETLHR',status:'confirmed',userId:u.id,outF:Object.assign({},FLIGHTS.find(x=>x.code==='KX78'&&x.via),{date:addDays(T,30)}),outC:'E-T',paxList:[{firstName:'A',lastName:'B'}],seats:{}});
 var lhr=kgmPetCheckR1101A(S.bookings.find(x=>x.pnr==='PETLHR'),segsOfx=null||'out',{species:'cat',mode:'cabin',kg:4,docs:true});
 var cs=['KX9901','KX9921','KX9801'].map(c=>kgmCaseFlightR1101A(c,null,null,'2026-11-05'));
 return {lhr:lhr.why,cs}});
await p.evaluate(()=>{S.view='home';render();if(!S.aiOpen0819H)kgmToggleAi0819I()});await p.waitForTimeout(1500);
const q1=await p.evaluate(async()=>{const i=document.getElementById('aiInput');i.value='寵物可以帶上飛機嗎';kgmSendAi0819I();await new Promise(r=>setTimeout(r,700));const m=S.aiConversation0819I.messages;return m[m.length-1].text});
await p.evaluate(()=>{const i=document.getElementById('aiInput');i.value='我要帶我的狗 6公斤 搭 PETAI1 可以嗎';kgmSendAi0819I()});await p.waitForTimeout(2500);
const r1=await p.evaluate(()=>{var m=S.aiConversation0819I.messages;var last=m[m.length-1].text;
 return {view:S.view,pnr:S.pet28&&S.pet28.pnr,kg:S.pet28&&S.pet28.kg,answer:String(last).slice(0,700)}});
await p.screenshot({path:'/tmp/j/petai.png'});
console.log(JSON.stringify({r0,q1:String(q1).slice(0,300),r1,errs:errs.slice(0,3)},null,1));await b.close()})();
