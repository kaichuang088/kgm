const {chromium}=require('playwright');const OLD=process.argv[2],NEW=process.argv[3];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();
const snap=()=>p.evaluate(()=>{const ST=S.seasonSchedulesR48||{},o={};['KX31|YYZ|YVR','KX31|YVR|TPE','KX31|YYZ|TPE'].forEach(k=>{const r=ST[k];o[k]=r?['summer','winter'].map(s=>r[s]?s[0]+':'+r[s].dep+'-'+r[s].arr+'+'+r[s].dd+'/'+(r[s].days||''):'-').join(' '):'none'});
 const v=[];['2026-10-24','2026-10-26','2027-01-10'].forEach(d=>FLIGHTS.filter(x=>x&&x.code==='KX31').forEach(x=>{let y=x;try{y=window.kgmSeasonFlightR48(x,d)}catch(_){}let on=null;try{on=flyOn(x,new Date(d+'T12:00:00'))}catch(_){}v.push(d+' '+x.fr+'-'+x.to+' '+y.dep+'-'+y.arr+'+'+(y.dd||0)+(on?'':' ×'))}));o.view=v;let sp=null;try{sp=kgmLiveSplitR929().n}catch(_){}o.split=sp;
 let saved=null;try{saved=JSON.parse(localStorage.getItem('kgm7_seas')||'null')}catch(_){}return o});
const go=async(f,tag,reload)=>{if(reload)await p.reload({waitUntil:'domcontentloaded',timeout:300000});else await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:240000,polling:1000});await p.waitForTimeout(8000);console.log(tag,JSON.stringify(await snap(),null,0))};
await go(OLD,'old');await go(NEW,'new');await go(NEW,'new-reload',1);await b.close()})();
