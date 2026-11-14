const {execFileSync}=require('child_process');let best=[];
for(const coreA of [160,180,210,240])for(const polA of [60,90])for(const ampBase of [0.4,0.55,0.7])for(const ampJ of [0.3,0.5,0.7])for(const ampS of [25,40,60]){
 const P={coreA,polA,pol:52,ampBase,ampJ,ampS,longShift:[-30,-25,-20,-15,-10,-5,0,5,10,15]};const out=execFileSync('node',['cal.js',JSON.stringify(P)]).toString();best.push([+/rmse ([\d.]+)/.exec(out)[1],P]);}
best.sort((a,b)=>a[0]-b[0]);console.log(best.slice(0,4).map(x=>x[0]+' '+JSON.stringify(x[1])).join('\n'));
