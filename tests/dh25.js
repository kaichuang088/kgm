const {chromium}=require('playwright');
(async()=>{const ctx=await chromium.launchPersistentContext('/tmp/j/prof_dh',{});const p=await ctx.newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<300;i++){const sv=await p.evaluate(()=>window.KGM_CREW_SAVE_R1025B);if(sv)break;await p.waitForTimeout(1000)}
 const r=await p.evaluate(()=>{const P=S.crewPositioningR121||{};const out=[];for(const k of Object.keys(P)){const [d,c,fr,to]=k.split('|');if(d<todayISO())continue;for(const q of P[k]){if(!q||!q.empId)continue;const e=window.kgmDhEnsureR1008A(q.empId,d,c,fr,to);if(e&&e.pnr){const b=S.bookings.find(x=>x.pnr===e.pnr);const px=(b.paxList||[])[0]||{};
     out.push({pnr:e.pnr,last:px.lastName,first:px.firstName,ok:window.kgmLookupPnrR23(e.pnr,px.firstName,px.lastName).ok,swap:window.kgmLookupPnrR23(e.pnr,px.lastName,px.firstName).ok,lastOnly:window.kgmLookupPnrR23(e.pnr,'',px.lastName).ok})}if(out.length>=3)break}if(out.length>=3)break}return out});
 console.log(JSON.stringify(r));
 await p.waitForTimeout(3000);await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(8000);
 console.log('after reload',JSON.stringify(await p.evaluate(r=>r.map(x=>({pnr:x.pnr,exists:!!(S.bookings||[]).find(b=>b.pnr===x.pnr),ok:window.kgmLookupPnrR23(x.pnr,x.first,x.last).ok})),r)));
 await ctx.close()})();
