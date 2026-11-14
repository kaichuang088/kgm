const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(20000);
 const r=await p.evaluate(async()=>{const T=todayISO();
  // inject stale old-number mock bid like user's (KX3 LAX→TPE) + same-name group
  S.resMileBidsR161=S.resMileBidsR161||[];S.resMileBidsR161.push({id:'RMTEST1',code:'KX3',date:addDays(T,9),fr:'LAX',to:'TPE',pnr:'TST001',userId:'KGM499999',who:'WANG TZU-WEI',miles:600000,status:'open',placedAt:new Date().toISOString(),demoR922:true});
  S.adminUser=S.adminUser||{role:'ceo'};S.view='admin';S.adminTab='auctions';render();await new Promise(r=>setTimeout(r,4000));
  for(let d=1;d<=30;d++){const dd=addDays(T,d);for(const f of FLIGHTS){if(f&&!f.via&&!f.partner&&/^KX\d{1,3}$/.test(f.code)){try{kgmEnsureAuctionsR922(f.code,dd,f)}catch(e){}}}}
  const fixN=kgmMockAucFixR1115A();
  const bd=(S.bigDeals||[]).filter(b=>/^(open|leading|outbid)$/.test(b.status)&&b.date>=T);const g={};bd.forEach(b=>{const k=b.code+b.date+b.fr+b.to+b.toCabin;(g[k]=g[k]||[]).push(b.who)});
  let dupG=0;Object.values(g).forEach(a=>{if(new Set(a).size<a.length)dupG++});
  const names=new Set(bd.map(b=>b.who)).size;
  const rs={};const all=(S.residenceBidsR83||[]).map(b=>Object.assign({k:'cash'},b)).concat((S.resMileBidsR161||[]).map(b=>Object.assign({k:'mile'},b)));
  all.filter(b=>b.date>=T).forEach(b=>{const dd=Math.round((Date.parse(b.date)-Date.parse(T))/864e5);const bucket=dd<=7?'<=7':dd<=14?'8-14':'>14';const k=bucket+' '+b.k+' '+b.status;rs[k]=(rs[k]||0)+1});
  const t3=S.resMileBidsR161.find(b=>b.id==='RMTEST1');
  // non A388 residence open
  let nonA=0;all.filter(b=>b.date>=T&&b.status==='open').forEach(b=>{let t='';try{t=acftOfFlight(b.code,b.date,b.fr,b.to)}catch(e){}if(t!=='A388')nonA++});
  render();await new Promise(r=>setTimeout(r,1500));const lv=document.querySelector('.k40lv');
  return {fixN,bdGroups:Object.keys(g).length,dupG,bdBids:bd.length,names,rs,test:t3&&t3.status,nonA388Open:nonA,head:lv&&lv.querySelector('.k40lv-h').innerText.replace(/\s+/g,' ')}});
 console.log(JSON.stringify(r,null,1),errs.slice(0,3));await b.close()})();
