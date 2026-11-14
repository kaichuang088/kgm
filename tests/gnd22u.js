const {chromium}=require('playwright');const SH='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fd22/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1300}})).newPage();const errs=[];p.on('pageerror',e=>{if(!/寄信/.test(e.message))errs.push(e.message)});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
 const id=await p.evaluate(()=>{const d=todayISO();const P=kgmGroundPlanR1008A('TSA',d);const ids=Object.keys(P.people).filter(i=>!P.people[i].off&&P.people[i].tasks.length).sort((a,b)=>P.people[a].work-P.people[b].work);return ids[0]});
 console.log('id',id);
 await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='groundops';render()});await p.waitForTimeout(3000);
 // switch to TSA and select person
 const html=await p.evaluate((id)=>{return window.kgmGroundJobsR1008A('TSA',todayISO(),id)},id);
 await p.evaluate((h)=>{const d=document.createElement('div');d.id='t22';d.style.cssText='position:fixed;left:0;top:0;width:1100px;background:#fff;padding:20px;z-index:99999;max-height:1300px;overflow:auto';d.innerHTML=h;document.body.appendChild(d)},html);
 await p.waitForTimeout(300);await p.locator('#t22').screenshot({path:SH+'gnd_tsa_jobs.png'});
 console.log(await p.evaluate(()=>document.getElementById('t22').innerText.replace(/\n+/g,' | ').slice(0,1500)));
 console.log('errs',errs);await b.close()})();
