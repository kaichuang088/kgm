// call tree under a root function name: children inclusive time (2 levels)
const {chromium}=require('playwright');const F=process.argv[2],ROOT=process.argv[3]||'finish6';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();const c=await ctx.newCDPSession(p);
await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:1000});
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(+(process.env.T0||40000));
await c.send('Profiler.start');await p.waitForTimeout(+(process.env.DUR||30000));const {profile}=await c.send('Profiler.stop');
const N=new Map(profile.nodes.map(n=>[n.id,n]));const self={};profile.samples.forEach((s,i)=>{self[s]=(self[s]||0)+(profile.timeDeltas[i]||0)});
const incl=id=>{const n=N.get(id);let t=self[id]||0;(n.children||[]).forEach(ch=>t+=incl(ch));return t};
const nm=n=>(n.callFrame.functionName||'(anon)')+':'+(n.callFrame.lineNumber+1);
const roots=profile.nodes.filter(n=>n.callFrame.functionName===ROOT);
const agg=(ids,depth,ind)=>{const m={};ids.forEach(id=>{const n=N.get(id);(n.children||[]).forEach(ch=>{const k=nm(N.get(ch));(m[k]=m[k]||{t:0,ids:[]}).t+=incl(ch);m[k].ids.push(ch)})});
 Object.entries(m).sort((a,b)=>b[1].t-a[1].t).slice(0,12).forEach(([k,v])=>{if(v.t<150000)return;console.log(ind+k+' '+Math.round(v.t/1000)+'ms');if(depth>0)agg(v.ids,depth-1,ind+'  ')})};
console.log(ROOT,roots.length,Math.round(roots.reduce((a,n)=>a+incl(n.id),0)/1000)+'ms');agg(roots.map(n=>n.id),+(process.env.D||4),'  ');await b.close()})();
