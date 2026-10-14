const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 await p.goto('file:///tmp/j/w49_admin.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>window.KGM_ROT_FINAL_MS_R913>0,null,{timeout:400000,polling:500});await p.waitForTimeout(8000);
 const r=await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='auctions';render();
   var g={},bad=[],n=0;(S.residenceBidsR83||[]).forEach(function(b){var k=b.code+'|'+b.date+'|'+(b.fr||'')+'|'+(b.to||'');(g[k]=g[k]||[]).push(b)});
   Object.keys(g).forEach(function(k){var seen={};g[k].forEach(function(b){n++;var s=b.backupSeat||'';
     if(b.alt==='refund'){if(s&&s!=='—')bad.push(k+' refund has '+s);return}
     var cab=b.alt==='first'?'First':'Business',tp=acftOfFlight(b.code,b.date,b.fr,b.to)||'A388',pool=window.kgmCabinSeatsR108(tp,cab)||[];
     if(!s)bad.push(k+' no seat');else{if(seen[s])bad.push(k+' dup '+s);seen[s]=1;if(pool.indexOf(s)<0)bad.push(k+' '+s+' not in '+cab)}})});
   return {groups:Object.keys(g).length,bids:n,bad:bad.slice(0,10),nbad:bad.length,sample:Object.keys(g).slice(0,2).map(k=>k+': '+g[k].map(b=>b.alt+'/'+(b.backupSeat||'-')).join(' '))}});
 console.log(JSON.stringify(r));await p.screenshot({path:'/tmp/j/auc6.png'});await b.close();})();
