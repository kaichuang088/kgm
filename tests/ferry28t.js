// 1101A：換機身清單——在 TPE 的飛機算空機調派（KX37 BOS→TPE）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{var T=todayISO(),out=[];for(var i=2;i<6;i++){var D=addDays(T,i),f=FLIGHTS.find(x=>x.code==='KX37'&&!x.via);if(!flyOn(f,new Date(D+'T12:00:00')))continue;
  var ty=acftOfFlight('KX37',D)||f.acft;var L=kgmAvailTailsR1023A(ty,'KX37',D,f.fr,f.to);var c={};L.forEach(x=>{var k=x.ferry?'ferry':x.st;c[k]=(c[k]||0)+1});
  out.push({D,ty,cur:kgmTailOfR1023A('KX37',D,f.fr,f.to),c,ferry:L.filter(x=>x.ferry).slice(0,2).map(x=>x.tail+' '+x.why),late:L.filter(x=>x.st==='away').slice(0,2).map(x=>x.tail+' '+x.why)});if(out.length>=2)break}return out});
console.log(JSON.stringify({r,errs:errs.slice(0,3)},null,1));await b.close()})();
