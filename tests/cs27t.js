const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));const dl=[];p.on('dialog',d=>{dl.push(d.message());d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(5000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'王客服',empId:'K30001',role:'ceo'};S.view='admin';S.adminTab='cases0831C';render()});await p.waitForTimeout(2000);
 const st=()=>p.evaluate(()=>({reply:!!document.getElementById('k6csReply'),lock:(document.querySelector('.k6cs-lock')||{}).innerText||'',edit:document.querySelectorAll('.k6cs-ed').length,take:[...document.querySelectorAll('.k6cs-act button,.k6cs-lock button')].map(b=>b.innerText).join('|')}));
 console.log('waiting',JSON.stringify(await st()));
 const id=await p.evaluate(()=>S.csSelR1006A||Object.keys(S.csQueueR1006A)[0]);
 const r=await p.evaluate(id=>{const n=S.csQueueR1006A[id].msgs.length;try{kgmCsReplyR1006A(id)}catch(e){};return n===S.csQueueR1006A[id].msgs.length},id);console.log('reply blocked (no textarea)',r);
 await p.click('.k6cs-act button.p');await p.waitForTimeout(800);console.log('taken',JSON.stringify(await st()));
 await p.fill('#k6csReply','您好，輪椅服務可以在行程管理申請，我幫您登記。');const t0=Date.now();await p.click('.k6cs-rep button.p');await p.waitForFunction(()=>[...document.querySelectorAll('.k6cs-m.agent p')].some(x=>/輪椅服務/.test(x.innerText)),null,{timeout:10000});console.log('reply shown in',Date.now()-t0,'ms');
 // another agent takes over
 await p.evaluate(()=>{S.adminUser={name:'李客服',empId:'K30002',role:'ceo'};render()});await p.waitForTimeout(1200);console.log('other agent view',JSON.stringify(await st()));
 await p.screenshot({path:'/tmp/j/cs27_other.png'});
 await p.click('.k6cs-lock button');await p.waitForTimeout(800);console.log('after take over',JSON.stringify(await st()),await p.evaluate(id=>S.csQueueR1006A[id].agentName,id));
 console.log('dialogs',dl,'errors',errs);await b.close()})();
