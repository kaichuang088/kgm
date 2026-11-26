const p=JSON.parse(require('fs').readFileSync(process.argv[2]));const nodes={};p.nodes.forEach(n=>nodes[n.id]=n);const parent={};p.nodes.forEach(n=>(n.children||[]).forEach(c=>parent[c]=n.id));
const name=id=>{const cf=nodes[id].callFrame;return (cf.functionName||'(anon)')+'@'+cf.lineNumber};
let t=p.startTime,runs=[],cur=null;
for(let i=0;i<p.samples.length;i++){t+=p.timeDeltas[i];const id=p.samples[i],nm=nodes[id].callFrame.functionName;const idle=nm==='(idle)'||nm==='(program)'&&false;
 if(idle){if(cur){cur.end=t;runs.push(cur);cur=null}continue}
 if(!cur)cur={start:t,ids:{}};const seen=new Set();let c=id,depth=0;while(c){const k=name(c);if(!seen.has(k)){cur.ids[k]=(cur.ids[k]||0)+(p.timeDeltas[i+1]||0);seen.add(k)}c=parent[c]}}
if(cur){cur.end=t;runs.push(cur)}
const min=+(process.argv[3]||800)*1000;
runs.filter(r=>r.end-r.start>min).forEach(r=>{const tot=r.end-r.start;const top=Object.entries(r.ids).filter(([k])=>!/^\((root|program|anon)/.test(k)&&!/^\(anon\)/.test(k)).sort((a,b)=>b[1]-a[1]);
 // choose deepest-ish: functions with >=60% of run, last in order of decreasing share
 const big=top.filter(([k,v])=>v>tot*0.5).map(([k,v])=>k+'('+Math.round(v/1000)+')');
 console.log(Math.round((r.start-p.startTime)/1e6)+'s len '+Math.round(tot/1000)+'ms :: '+big.slice(0,8).join(' > '))});
