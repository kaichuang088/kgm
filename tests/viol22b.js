const {chromium}=require('playwright');const DAYS=+(process.env.DAYS||60);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>console.log('no fulldone'));
 await p.waitForTimeout(5000);
 console.log(await p.evaluate(({DAYS})=>{const T=todayISO();const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
  const P=kgmCrewPoolR121(),info={};P.pilots.concat(P.cabin).forEach(x=>info[x.empId]=x);
  const by={},ex=[];let tot=0;
  for(let i=0;i<DAYS;i++){const d=D(T,i);const pl=kgmCrewPlanR121(d);const m={};(pl.flights||[]).forEach(f=>m[f.code+' '+d]=f);
   (pl.violations||[]).forEach(s=>{tot++;const c=s.split('：')[0];const f=m[c];if(!f)return;const fam=(info[(f.pilots[0]||{}).empId]||{}).fam||f.type;const rk=f.pilots.map(q=>(info[q.empId]||{}).rank).join('/');const k=fam+' '+f.fr+' '+(/客艙/.test(s)?'cabin':'pilot')+' '+rk;by[k]=(by[k]||0)+1;if(ex.length<8)ex.push(d+' '+s+' | '+f.fr+'-'+f.to+' '+f.type+' '+rk+' '+f.pilots.map(q=>q.empId+(info[q.empId]&&info[q.empId].virtualR121?'v':'r')).join(','))})}
  const vc={};P.pilots.forEach(x=>{const k=x.fam+'|'+x.rank+'|'+(x.virtualR121?'v':'r');vc[k]=(vc[k]||0)+1});
  return 'tot '+tot+'\n'+Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,20).map(x=>x.join(': ')).join('\n')+'\n'+ex.join('\n')+'\nPOOL '+JSON.stringify(vc)},{DAYS}));
 await b.close()})();
