// 1012A：同一個瀏覽器連續重新整理 N 次（每次等 W 秒），比 30 天機隊輪轉與第 1／3／7／14 天組員班表；每一列全部是「.」才是穩定。用法：N=4 W=130 node rotreload.js /tmp/j/kgm.html
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html',N=+(process.env.N||4),WAIT=+(process.env.W||130);
const FP=()=>{const T=todayISO();const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
  const TA=S.tailAssign||{},day={};const days=[];for(let i=0;i<30;i++)days.push(D(T,i));
  Object.keys(TA).sort().forEach(tl=>{(TA[tl]||[]).forEach(x=>{if(!x||days.indexOf(x.date)<0)return;if(/^KX89/.test(x.code||''))return;(day[x.date]=day[x.date]||[]).push(tl+':'+x.code+':'+x.fr)})});
  const h=s=>{let v=2166136261;for(let i=0;i<s.length;i++){v^=s.charCodeAt(i);v=Math.imul(v,16777619)}return (v>>>0).toString(36)};
  let crew=[];try{for(const off of [1,3,7,14]){const pl=window.kgmCrewPlanR121&&window.kgmCrewPlanR121(D(T,off));const ids=f=>{const o=[];JSON.stringify(f,(k,v)=>{if(k==='empId')o.push(v);return v});return o.sort().join(',')};crew.push(h((pl&&pl.flights||[]).map(f=>f.code+'|'+f.fr+'|'+ids(f)).sort().join(';')))}}catch(e){crew=['E'+e.message]}crew=crew.join('/')
  let lsz=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);lsz+=(localStorage.getItem(k)||'').length}}catch(_){}
  return {n:Object.keys(TA).length,days:days.map(d=>h((day[d]||[]).sort().join('|'))),crew,lsz}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();const res=[];
 for(let k=0;k<N;k++){if(k===0)await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});else await p.reload({waitUntil:'domcontentloaded',timeout:300000});
  await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
  await p.waitForTimeout(WAIT*1000);res.push(await p.evaluate(FP));console.error('load',k)}
 res.forEach((r,i)=>console.log('load',i,'lsz',r.lsz,'crew',r.crew,r.days.map((x,j)=>x===res[0].days[j]?'.':'X').join(''),r.days[0]));
 await b.close()})();
