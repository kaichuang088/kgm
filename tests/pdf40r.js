// 1112A C6：各職位按「PDF REPORT」：機師版／客艙版、財務不能按
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(todayISO()),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(3000);
const keys=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';render();await new Promise(r=>setTimeout(r,1500));
 return [...document.querySelectorAll('#app [onclick*="kgmFdOpenR1025B"]')].slice(0,40).map(x=>x.getAttribute('onclick'))});
console.log('keys',keys.length,keys.slice(0,3));
const pick=keys[0];
const out={};
for(const role of ['ceo','pilot','cabin','finance']){
 await p.evaluate(async(role)=>{const st=S.staff.find(x=>x.role===role)||Object.assign({},S.staff[0],{role});S.adminUser=st;render();await new Promise(r=>setTimeout(r,1500))},role);
 const dis=await p.evaluate(()=>{const b=[...document.querySelectorAll('#app button')].find(x=>/PDF REPORT/.test(x.textContent));return b?{dis:b.disabled,title:b.title}:null});
 let ver=null;
 if(dis&&!dis.dis){await p.evaluate(()=>{window.KGM_OPSREPORT_R1108A=null;window.__alert='';window.alert=m=>{window.__alert=m};window.open=()=>({document:{open(){},write(){},close(){}},focus(){},print(){},close(){}})});
  await p.evaluate(()=>{const b=[...document.querySelectorAll("#app button")].find(x=>/PDF REPORT/.test(x.textContent));b.click()});await p.waitForTimeout(15000);
  ver=await p.evaluate(()=>({r:window.KGM_OPSREPORT_R1108A,a:window.__alert}))}
 out[role]={btn:dis,ver:ver&&ver.r?{ver:ver.r.ver,sections:ver.r.sections}:ver};
}
console.log(JSON.stringify(out,null,1));await b.close()})();
