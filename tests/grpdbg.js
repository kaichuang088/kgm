const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
 const r=await p.evaluate(()=>{const u=S.users.find(u=>u&&u.email);S.user=u;u.groupAccountR1025B={status:'active',type:'agency',company:'T',taxId:'22099131',contact:{name:'X',phone:'0912345678',email:u.email},caseNo:'KGX'};
   S.search.grp25=1;S.search.type='RT';S.search.fr='TPE';S.search.to='NRT';S.search.dep=addDays(todayISO(),40);S.search.ret=addDays(todayISO(),45);S.search.adults=20;S.search.children=2;S.search.cabin='Economy';passengerCounts();S.view='booking';S.phase='sel_out';
   const d=S.search.dep,f=Object.assign({},sortedFlights('TPE','NRT',d).find(x=>x.code==='KX182'),{date:d});
   const gc=kgmGrpCodeR1025B('Economy'),o={gc,on:kgmGrpOnR1025B(),fam:JSON.stringify(window.KGM_FAM54_R1025B.Economy),vc:validCodes(f),sell:kgmInventory49(gc,d,f),inv:JSON.stringify(kgmCabinInventory54(f,d,'Economy')),pax:S.search.pax};
   try{o.fs=firstSellable54('Economy','Value',f,d,22)}catch(e){o.fs='ERR '+e}
   try{o.price=owPrice(f,gc,22)}catch(e){o.price='ERR '+e}
   return o});
 console.log(JSON.stringify(r,null,1));await b.close()})();
