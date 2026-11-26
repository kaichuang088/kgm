const p=JSON.parse(require('fs').readFileSync(process.argv[2]));const by={},nodes={};p.nodes.forEach(n=>nodes[n.id]=n);
const dt=p.timeDeltas,samples=p.samples;const self={};for(let i=0;i<samples.length;i++){self[samples[i]]=(self[samples[i]]||0)+(dt[i]||0)}
// self time per function
Object.keys(self).forEach(id=>{const n=nodes[id],cf=n.callFrame,k=(cf.functionName||'(anon)')+' L'+cf.lineNumber+':'+cf.columnNumber;by[k]=(by[k]||0)+self[id]});
console.log('SELF');Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log((v/1000).toFixed(0)+'ms',k));
// inclusive: parent map
const parent={};p.nodes.forEach(n=>(n.children||[]).forEach(c=>parent[c]=n.id));const inc={};
Object.keys(self).forEach(id=>{let cur=+id;const seen=new Set();while(cur){const n=nodes[cur],cf=n.callFrame,k=(cf.functionName||'(anon)')+' L'+cf.lineNumber+':'+cf.columnNumber;if(!seen.has(k)){inc[k]=(inc[k]||0)+self[id];seen.add(k)}cur=parent[cur]}});
console.log('INCL');Object.entries(inc).sort((a,b)=>b[1]-a[1]).slice(0,40).forEach(([k,v])=>console.log((v/1000).toFixed(0)+'ms',k));
