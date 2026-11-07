const {chromium}=require('playwright');
(async()=>{const [out,wd]=process.argv.slice(2);const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:+(wd||1440),height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
const r=await p.evaluate(()=>{const D1='2026-11-16',D2='2026-11-30';function F(c,D){const f0=FLIGHTS.filter(x=>x.code===c&&!x.via)[0];return Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D})}
 S.search=Object.assign(S.search||{},{type:'RT',fr:'TPE',to:'JFK',dep:D1,ret:D2,pax:1,adults:1,children:0,infants:0,useMiles:false});
 S.outF=F('KX48',D1);S.inbF=F('KX47',D2);S.outC='E-R';S.inbC='P-F';S.paxList=[{title:'MR',firstName:'TEST',lastName:'USER'}];S.view='booking';S.phase='addons';render();
 return {out:[S.outF.dep,S.outF.arr,S.outF.dd],inb:[S.inbF.dep,S.inbF.arr,S.inbF.dd]}});
await p.waitForTimeout(2500);
const cls=await p.evaluate(()=>{const t=[...document.querySelectorAll('#app *')].filter(e=>e.children.length===0&&/^05:00$|^22:30$/.test(e.textContent.trim()));return t.map(e=>{let a=[],x=e;for(let i=0;i<5&&x;i++){a.push(x.tagName+'.'+(x.className||''));x=x.parentElement}return a.join(' < ')})});
if(process.env.Y)await p.evaluate(y=>window.scrollTo(0,+y),process.env.Y);await p.waitForTimeout(300);await p.screenshot({path:out,fullPage:false});console.log(JSON.stringify({r,cls,errs:errs.slice(0,3)}));await b.close()})();
