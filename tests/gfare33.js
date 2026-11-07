// 1103A：G 艙票價屬性、退改、哩程／會籍積分比率
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(17000);
console.log(JSON.stringify(await p.evaluate(()=>{const o={};kgmGrpCodeR1025B('Economy','G');const F=KGM_FAM54_R1025B;
 ['Economy','Premium','Business'].forEach(cab=>{const g=kgmGrpCodeR1025B(cab,'G'),q=kgmGrpCodeR1025B(cab,'Q'),v=(F[cab].Value||[])[0];const G=FARES[g];
  o[cab]={g,fam:G.familyR48,bag:G.bag,bagQ:FARES[q].bag,chg:G.chgZH,ref:G.refZH,cf:changeFeeOf(g),rp:refundPolicyOf(g),mileG:G.mile,mileQ:FARES[q].mile,valueCode:v,mileV:(FARES[v]||{}).mile}});
 try{const f=FLIGHTS.find(x=>x.fr==='TPE'&&x.to==='NRT');o.tp={G:kgmTpSegR1103A('TPE','NRT','E-G'),V:kgmTpSegR1103A('TPE','NRT','E-T'),BG:kgmTpSegR1103A('TPE','NRT','B-G'),BV:kgmTpSegR1103A('TPE','NRT','B-K')}}catch(e){o.tpErr=String(e)}
 return o}),null,1));console.log('ERR',errs.slice(0,3));await b.close()})();
