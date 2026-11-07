// 1008B：用指定時區（預設台北）開合併檔，等收尾重排後量無機可派
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({timezoneId:process.env.TZID||'Asia/Taipei',viewport:{width:1500,height:1000}});const p=await ctx.newPage();
 if(process.env.FAKE)await p.addInitScript(iso=>{const D0=Date,off=new D0(iso).getTime()-D0.now();class FD extends D0{constructor(...a){if(a.length===0)super(D0.now()+off);else super(...a)}static now(){return D0.now()+off}}FD.UTC=D0.UTC;FD.parse=D0.parse;window.Date=FD},process.env.FAKE);
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 await p.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>window.KGM_ROT_FINAL_MS_R913>0,null,{timeout:400000});await p.waitForTimeout(+(process.env.W||30000));
 console.log(JSON.stringify(await p.evaluate(()=>{var c=window.kgmLiveCoverR135(),s=window.kgmLiveSplitR929();var ds=Object.keys(c.byDate927D||{}).sort();
   return {tz:Intl.DateTimeFormat().resolvedOptions().timeZone,now:new Date().toString().slice(0,33),today:todayISO(),missing:c.missing,expected:c.expected,window:c.window,days:ds.length,byDate:ds.slice(0,12).map(d=>d+':'+c.byDate927D[d]),split:s.n,np:c.notPlanned,ml:(c.missList||[]).slice(0,5),sl:(s.list||[]).slice(0,4),final:window.KGM_ROT_FINAL_MS_R913,kept:window.KGM_KEPT72_1006A}})),'ERR',JSON.stringify(errs.slice(0,4)));
 await b.close()})();
