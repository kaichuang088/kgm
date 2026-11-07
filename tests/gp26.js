const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/'+process.argv[2],{waitUntil:'domcontentloaded'});await p.waitForTimeout(12000);
console.log(await p.evaluate(()=>{const u=S.users[0];S.user=u;u.groupAccountR1025B={type:'agency',company:'測試旅行社',taxId:'12345675',contact:{name:'王',phone:'0912',email:'a@b.c'},caseNo:'X',at:new Date().toISOString(),status:'active'};
 const P=FLIGHTS.filter(f=>f&&f.partner).slice(0,400);const d=addDays(todayISO(),40);S.search={fr:'TPE',to:'X',dep:d,type:'OW',adults:20,children:0,infants:0,pax:20,cabin:'Economy',grp25:1};
 const on=kgmGrpOnR1025B();const res=[];const seen={};P.forEach(f=>{const k=f.fr+f.to;if(seen[k]||res.length>6)return;seen[k]=1;const df=Object.assign({},f,{date:d});let codes=[];try{codes=Object.keys(FARES).filter(c=>FARES[c].familyR48&&FARES[c].cabin==='Economy').map(c=>c+':'+kgmInventory49(c,d,df))}catch(e){codes=['ERR '+e.message]}res.push(f.code+' '+f.fr+'-'+f.to+' op '+(f.operatorFlight||'')+' '+codes.join(' '))});
 return JSON.stringify({on,res},null,1)}),errs.slice(0,3));await b.close()})();
