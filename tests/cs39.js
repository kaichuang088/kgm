// 1108B B8：每一類模擬案件至少 4 件、狀態分散；後台開著時持續處理（每分鐘往下一步、送 CEO 的會被決定、新案件進來）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(8000);
await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='cases0831B';render()});
const stat=()=>p.evaluate(()=>{const isSim=c=>c&&(c.simR1022A||c.simR1101A||c.mockR1108A);const L=(S.staffCasesR1007A||[]).filter(isSim);const by={};L.forEach(c=>{by[c.type]=by[c.type]||{};by[c.type][c.status]=(by[c.type][c.status]||0)+1});
 const sig={};L.forEach(c=>sig[c.caseNo]=c.status+'|'+(c.progress||[]).length);return {n:L.length,by,sig,cnt:Object.fromEntries(Object.entries(by).map(([k,v])=>[k,Object.values(v).reduce((a,b)=>a+b,0)]))}});
await p.waitForTimeout(40000);const a=await stat();console.log('T+48s',a.n,JSON.stringify(a.cnt));
await p.waitForTimeout(150000);const c=await stat();console.log('T+198s',c.n,JSON.stringify(c.cnt));
let moved=0,added=0;for(const k in c.sig){if(!(k in a.sig))added++;else if(a.sig[k]!==c.sig[k])moved++}
console.log('in 150s: progressed',moved,'new',added);console.log('BY',JSON.stringify(c.by));
const ui=await p.evaluate(()=>{render();return (document.querySelector('#app main')||{innerText:''}).innerText.slice(0,400)});console.log('UI',ui.replace(/\s+/g,' ').slice(0,300));
console.log('ERR',errs.slice(0,5));await b.close()})();
