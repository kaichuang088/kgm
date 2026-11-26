const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(20000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 await p.waitForTimeout(3000);
 const cdp=await ctx.newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});
 const tabs=process.argv[2].split(',');const wait=+(process.argv[3]||3000);
 for(const t of tabs){
  await cdp.send('Profiler.start');
  const ms=await p.evaluate(async([t,wait])=>{const t0=performance.now();S.adminTab=t;render();const s=performance.now()-t0;await new Promise(r=>setTimeout(r,wait));return Math.round(s)},[t,wait]);
  const {profile}=await cdp.send('Profiler.stop');
  // self time per node
  const dt={};const idx={};profile.nodes.forEach(n=>idx[n.id]=n);
  const st=profile.samples,td=profile.timeDeltas;const self={};
  for(let i=0;i<st.length;i++){self[st[i]]=(self[st[i]]||0)+(td[i]||0)}
  const agg={};
  profile.nodes.forEach(n=>{const cf=n.callFrame;const k=cf.functionName+'@'+(cf.lineNumber+1);agg[k]=(agg[k]||0)+(self[n.id]||0)});
  // inclusive
  const parent={};profile.nodes.forEach(n=>(n.children||[]).forEach(c=>parent[c]=n.id));
  const incl={};
  profile.nodes.forEach(n=>{let s=self[n.id]||0;if(!s)return;let seen=new Set();let x=n.id;while(x!=null){const cf=idx[x].callFrame;const k=cf.functionName+'@'+(cf.lineNumber+1);if(!seen.has(k)){incl[k]=(incl[k]||0)+s;seen.add(k)}x=parent[x]}});
  const top=Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>k+' '+Math.round(v/1000)+'ms');
  const topI=Object.entries(incl).filter(([k])=>!/^\(|^@0|render@|^@/.test(k)).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>k+' '+Math.round(v/1000)+'ms');
  const callers={};profile.nodes.forEach(n=>{const cf=n.callFrame;if(/kgmCrewPlanR121|fn196/.test(cf.functionName)){let x=parent[n.id],chain=[];for(let k=0;k<8&&x!=null;k++){const c=idx[x].callFrame;chain.push(c.functionName+'@'+(c.lineNumber+1));x=parent[x]}const key=chain.join(' < ');callers[key]=(callers[key]||0)+1}});
  const qcall={};profile.nodes.forEach(n=>{const cf=n.callFrame;if(/^(querySelectorAll|querySelector|\(program\))$/.test(cf.functionName)&&self[n.id]){const pp=parent[n.id]!=null?idx[parent[n.id]].callFrame:null;const k=cf.functionName+' < '+(pp?pp.functionName+'@'+(pp.lineNumber+1):'-');qcall[k]=(qcall[k]||0)+self[n.id]}});
  console.log('QCALL',Object.entries(qcall).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>k+' '+Math.round(v/1000)+'ms').join(' | '));
  console.log('CALLERS',JSON.stringify(Object.keys(callers).slice(0,6),null,1));
  console.log('== '+t+' sync '+ms+'ms\nSELF '+top.join(' | ')+'\nINCL '+topI.join(' | '));
 }
 await b.close();})();
