// deterministic two-tab race: A queues a new bid (500 ms debounce); B writes first; then check both tabs + storage
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';const N=+(process.argv[3]||3);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});
const A=await ctx.newPage(),B=await ctx.newPage();
await A.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await B.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
await A.waitForTimeout(120000);
for(let i=0;i<N;i++){
 const ida='RACEA'+i,idb='RACEB'+i;
 await A.evaluate((id)=>{S.bigDeals.push({id:id,code:'KX20',date:'2026-10-30',fr:'TPE',to:'NRT',pnr:id.slice(0,6),userId:'KGMDEMO0911',who:'RACE A',cabin:'Economy',toCabin:'Premium',amount:11111,miles:0,pax:1,status:'open',at:new Date().toISOString(),kindR929:1});save()},ida);
 await B.evaluate((id)=>{S.bigDeals.push({id:id,code:'KX20',date:'2026-10-30',fr:'TPE',to:'NRT',pnr:id.slice(0,6),userId:'KGMDEMO0912',who:'RACE B',cabin:'Economy',toCabin:'Premium',amount:22222,miles:0,pax:1,status:'open',at:new Date().toISOString(),kindR929:1});save();window._lsFlush0818&&window._lsFlush0818()},idb);
 await A.waitForTimeout(4000);
 const chk=async(P)=>P.evaluate(([a,b])=>{const st=kgmLsUnpackR1012A('kgmbd4',JSON.parse(localStorage.getItem('kgmbd4')||'[]'));return {memA:S.bigDeals.some(x=>x.id===a),memB:S.bigDeals.some(x=>x.id===b),stA:st.some(x=>x.id===a),stB:st.some(x=>x.id===b)}},[ida,idb]);
 console.log('round',i,'A',JSON.stringify(await chk(A)),'B',JSON.stringify(await chk(B)));
}
await b.close()})();
