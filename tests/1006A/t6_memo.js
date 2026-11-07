const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/w49_admin.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>window.KGM_ROT_FINAL_MS_R913>0,null,{timeout:400000,polling:500});
 await p.waitForTimeout(10000);
 const r=await p.evaluate(()=>{
   var snapTA=JSON.stringify(S.tailAssign),snapSub=JSON.stringify(S.acftSub||{}),snapTF=JSON.stringify(S.tsaFleet||{}),snapTW=JSON.stringify(S.tsaWindowsR913||null);
   function restore(){S.tailAssign=JSON.parse(snapTA);S.acftSub=JSON.parse(snapSub);S.tsaFleet=JSON.parse(snapTF);S.tsaWindowsR913=JSON.parse(snapTW);window.kgmClearRotationCacheR72()}
   function dump(){var A=S.tailAssign,o=[];Object.keys(A).sort().forEach(function(t){(A[t]||[]).forEach(function(x){o.push(t+'#'+[x.date,x.code,x.route,x.dep,x.positioningR830?'P':'',x.auto?'A':''].join('|'))})});return o.sort().join('\n')+'\nSUB'+JSON.stringify(Object.keys(S.acftSub||{}).sort())}
   var out={};
   ['off','on','off2'].forEach(function(m){restore();window.KGM_NOMEMO_1006A=(m!=='on');var t=performance.now();window.kgmRebuildFleetR72(todayISO(),366,true);out[m]={ms:Math.round(performance.now()-t),d:dump()}});
   window.KGM_NOMEMO_1006A=false;
   return {offMs:out.off.ms,onMs:out.on.ms,off2Ms:out.off2.ms,same:out.off.d===out.on.d,offStable:out.off.d===out.off2.d,len:out.on.d.length}});
 console.log(JSON.stringify(r));await b.close();})();
