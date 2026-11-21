// 1101A：航班狀態設轉降 KIX → 航班動態當日追加 KX40 KIX→TPE
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(12000);
const r0=await p.evaluate(async()=>{window.alert=()=>{};window.confirm=()=>true;var T=todayISO(),f=FLIGHTS.find(x=>x.code==='KX40'&&!x.via),D=null;for(var i=2;i<9;i++){var d=addDays(T,i);if(flyOn(f,new Date(d+'T12:00:00'))){D=d;break}}
 S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';S.adSearchFr='BOS';S.adSearchTo='TPE';S.adSearchDate=D;S.adEditKey=_ovKey(f,D);render();await new Promise(r=>setTimeout(r,800));
 var has=!!document.getElementById('adDvDep');document.getElementById('adStatus').value='Diverted';document.getElementById('adDivertTo').value='KIX';doAdminSave();await new Promise(r=>setTimeout(r,800));
 var ov=S.flightOverrides[_ovKey(f,D)];return {D,key:_ovKey(f,D),has,st:ov&&ov.status,leg:ov&&ov.divertLegR1101A,sched:[f.dep,f.arr]}});
await p.evaluate(()=>{S.adEditKey=S.adEditKey;render()});await p.waitForTimeout(500);await p.screenshot({path:'/tmp/j/dv1.png'});
const legD=r0.leg&&r0.leg.date;
const r1=await p.evaluate(async(d)=>{S.adminAuthed=false;S.view='status';S.stBoardR1019A=false;S.stByNo=true;S.stFlightNo='KX40';S.stBase=d;S.stOff=0;render();await new Promise(r=>setTimeout(r,800));
 var cards=[...document.querySelectorAll('.fs20-c')].map(c=>c.innerText.replace(/\s+/g,' ').slice(0,200));
 S.stByNo=false;S.stFr='KIX';S.stTo='TPE';render();await new Promise(r=>setTimeout(r,800));var cards2=[...document.querySelectorAll('.fs20-c')].map(c=>c.innerText.replace(/\s+/g,' ').slice(0,160)).filter(t=>/KX40/.test(t));
 S.stBase=addDays(d,1);render();await new Promise(r=>setTimeout(r,600));var next=[...document.querySelectorAll('.fs20-c')].map(c=>c.innerText).filter(t=>/KX40/.test(t)).length;
 S.stBase=d;S.stByNo=true;S.stFlightNo='KX40';render();return {cards,cards2,nextDay:next}},legD);
await p.waitForTimeout(600);await p.screenshot({path:'/tmp/j/dv2.png'});
console.log(JSON.stringify({r0,r1,errs:errs.slice(0,3)},null,1));await b.close()})();
