// 1108A N8／N9／N10：模擬寵物申請＋模擬團體；航班資料座位圖標寵物座位＋寵物表；CEO 同意／不同意、客服不同意；徽章規則
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(16000);
const r=await p.evaluate(async()=>{window.alert=()=>{};window.confirm=()=>true;const out={mock:window.KGM_MOCK_R1108A};
 const pets=(S.staffCasesR1007A||[]).filter(c=>c&&c.mockR1108A);out.pets=pets.map(c=>[c.caseNo,c.status,(c.pet||{}).mode,c.segment.code,c.segment.date,c.decisionR1101A&&(c.decisionR1101A.deny?'deny':'ok')].join(' '));
 out.groups=(S.groupsR1023A||[]).filter(g=>g&&g.mockR1108A).map(g=>[g.id,g.status,g.pax,g.company].join(' '));out.reqs=(S.charterReqsR1026C||[]).filter(x=>x&&x.mockR1108A).map(x=>x.id+' '+x.status);
 /* 航班資料：挑一件已核准的客艙寵物那一班 */
 const c=pets.find(x=>x.status==='closed'&&x.decisionR1101A&&x.decisionR1101A.ok&&x.pet.mode==='cabin')||pets[0];const sg=c.segment;const f=FLIGHTS.find(x=>x.code===sg.code&&x.fr===sg.fr&&x.to===sg.to&&!x.via);
 const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';S.opsQueryR7=f.code;S.opsDateR7=sg.date;S.opsSelectedR7=[f.code,sg.date,f.fr,f.to].join('|');render();
 await new Promise(r=>setTimeout(r,3000));render();await new Promise(r=>setTimeout(r,800));
 const c2=(S.staffCasesR1007A||[]).find(x=>x.caseNo===c.caseNo);out.bound={pnr:c2.pnr,pax:c2.paxName,seat:c2.segments[0].seat,bound:c2.mockBoundR1108A};
 const ps=[...document.querySelectorAll('.r7-map-seat.pet38')];out.seatMarked=ps.map(x=>x.title);
 const pn=document.querySelector('.k38pets');out.panel=pn?pn.innerText.replace(/\s+/g,' ').slice(0,400):null;
 const tag=[...document.querySelectorAll('.k28-pettag')].map(x=>x.innerText);out.tags=tag.slice(0,4);
 /* 案件中心：待 CEO 的一件 → CEO 不同意 */
 const pend=(S.staffCasesR1007A||[]).find(x=>x&&x.mockR1108A&&x.status==='ceo_review');out.ceoBefore=pend&&pend.status;
 S.adminTab='cases0831B';S.case28Cat='other';S.caseTabR913='open';S.case7F={};S.caseFilter0831B='';S.case7Sel=pend.caseNo;render();await new Promise(r=>setTimeout(r,800));
 const art=()=>[...document.querySelectorAll('#app article, #app .k7c-detail')].find(a=>a.querySelector('.k7c-btns')&&a.innerText.indexOf(S.case7Sel)>=0);out.ceoBtns=art()?[...art().querySelectorAll('.k7c-btns button')].map(x=>x.innerText):'no-article';
 const ta=document.getElementById('k28CeoMsg');if(ta)ta.value='寵物體重超過客艙上限（模擬測試）';kgmCase28Ceo(pend.caseNo,'deny');await new Promise(r=>setTimeout(r,500));
 const pd=(S.staffCasesR1007A||[]).find(x=>x.caseNo===pend.caseNo);out.ceoAfter={status:pd.status,dec:pd.decisionR1101A,last:pd.progress[pd.progress.length-1].label};
 /* 客服（非 CEO）：剛送出的申請 → 不同意 */
 const rcv=(S.staffCasesR1007A||[]).find(x=>x&&x.mockR1108A&&x.status==='received');const agent=S.staff.find(x=>x.role!=='ceo'&&/service|cs|agent/i.test(String(x.role||'')))||S.staff.find(x=>x.role!=='ceo');S.adminUser=agent;S.case7Sel=rcv.caseNo;render();await new Promise(r=>setTimeout(r,800));
 out.agentRole=agent&&agent.role;out.agentBtns=art()?[...art().querySelectorAll('.k7c-btns button')].map(x=>x.innerText):'no-article';
 const msg=document.getElementById('k7cMsg');if(msg)msg.value='缺少狂犬病疫苗證明（模擬測試）';if(window.kgmCase28DenyR1108A)kgmCase28DenyR1108A(rcv.caseNo);await new Promise(r=>setTimeout(r,500));
 const rd=(S.staffCasesR1007A||[]).find(x=>x.caseNo===rcv.caseNo);out.agentAfter={status:rd.status,dec:rd.decisionR1101A&&rd.decisionR1101A.deny};
 /* 寵物同行頁 */
 S.adminUser=st;S.adminTab='pets30';S.petDeskR1102A={f:'all',q:''};render();await new Promise(r=>setTimeout(r,600));out.desk=[...document.querySelectorAll('.k30pd-st')].map(x=>x.innerText).slice(0,10);
 /* 後台團體訂位頁 */
 S.adminTab='groups23';render();await new Promise(r=>setTimeout(r,800));out.grpAdmin=(document.getElementById('app').innerText.match(/（模擬）/g)||[]).length;
 return out});
console.log(JSON.stringify(r,null,1));await p.evaluate(()=>{S.adminTab='flightdata';render()});await p.waitForTimeout(1500);
await p.evaluate(()=>{const t=[...document.querySelectorAll('#app button, #app a')].find(x=>/^\s*.?\s*座位圖\s*$/.test(x.innerText));if(t)t.click()});await p.waitForTimeout(1200);await p.evaluate(()=>{const e=document.querySelector('.r7-map-seat.pet38');if(e)e.scrollIntoView({block:'center'})});await p.waitForTimeout(500);await p.screenshot({path:'/tmp/j/pet38.png'});console.log('ERR',errs.slice(0,5));await b.close()})();
