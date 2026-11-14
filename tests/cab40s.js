const {chromium}=require('playwright');const DAYS=+(process.env.DAYS||14);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({timezoneId:'Asia/Taipei'})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(5000);
 const r=await p.evaluate(({DAYS})=>{const T=todayISO();const per={};let flights=0,noSen=0,tot=0;const RK={'頭等艙':4,'商務艙':3,'豪華經濟艙':2,'經濟艙':1};
  for(let i=0;i<DAYS;i++){const d=addDays(T,i);const pl=kgmCrewPlanR121(d);(pl.flights||[]).forEach(f=>{flights++;(f.cabin||[]).forEach(q=>{if(!q||!q.empId)return;tot++;if(q.seniority==null)noSen++;const o=per[q.empId]=per[q.empId]||{sen:+q.seniority||0,c:{}};o.c[q.cabinZH]=(o.c[q.cabinZH]||0)+1})})}
  const ids=Object.keys(per);let multi=0,legs=0,offHome=0;ids.forEach(id=>{const c=per[id].c,ks=Object.keys(c);if(ks.length>1)multi++;const n=ks.reduce((a,k)=>a+c[k],0);legs+=n;const mx=Math.max(...ks.map(k=>c[k]));offHome+=n-mx});
  // 年資分組 vs 平均艙等
  const arr=ids.map(id=>{const c=per[id].c;let s=0,n=0;Object.keys(c).forEach(k=>{s+=(RK[k]||1)*c[k];n+=c[k]});return {sen:per[id].sen,avg:s/n}}).sort((a,b)=>a.sen-b.sen);const q=k=>{const a=arr.slice(Math.floor(arr.length*k/4),Math.floor(arr.length*(k+1)/4));return {sen:a.length?a[0].sen+'-'+a[a.length-1].sen:'',avgCab:+(a.reduce((x,y)=>x+y.avg,0)/Math.max(1,a.length)).toFixed(2)}};
  return {days:DAYS,flights,people:ids.length,legs,noSen,tot,multiCabinPeople:multi,legsNotInMainCabin:offHome,pctOff:+(offHome/legs*100).toFixed(1),quartiles:[q(0),q(1),q(2),q(3)]}},{DAYS});
 console.log(JSON.stringify(r,null,1));await b.close()})();
