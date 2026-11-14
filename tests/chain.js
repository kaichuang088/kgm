const p=JSON.parse(require('fs').readFileSync(process.argv[2]));const nodes={};p.nodes.forEach(n=>nodes[n.id]=n);const parent={};p.nodes.forEach(n=>(n.children||[]).forEach(c=>parent[c]=n.id));
const from=+process.argv[3]*1e6,to=+process.argv[4]*1e6,needle=process.argv[5];let t=p.startTime;const cnt={};
for(let i=0;i<p.samples.length;i++){t+=p.timeDeltas[i];if(t-p.startTime<from||t-p.startTime>to)continue;let c=p.samples[i],chain=[];while(c){const cf=nodes[c].callFrame;chain.push((cf.functionName||'(anon)')+'@'+cf.lineNumber);c=parent[c]}
 chain.reverse();const j=chain.findIndex(x=>x.startsWith(needle));if(j<0)continue;const k=chain.slice(0,j+1).join(' > ');cnt[k]=(cnt[k]||0)+1}
Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([k,v])=>console.log(v,k))
