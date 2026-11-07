// patch framework: node pf.js <in> <out> <patchfile...>
const fs=require('fs');let s=fs.readFileSync(process.argv[2],'utf8');const out=process.argv[3];
let fail=0,applied=0;
global.R=function(label,oldS,newS,cnt){cnt=cnt||1;let n=s.split(oldS).length-1;if(n!==cnt){console.log('FAIL',label,'expected',cnt,'found',n);fail++;return}s=s.split(oldS).join(newS);applied++;};
// replace within the body of a given layer id only
global.RL=function(label,layer,oldS,newS,cnt){cnt=cnt||1;const i=s.indexOf(layer.startsWith('#')?layer.slice(1):'<script id="'+layer+'"');if(i<0){console.log('FAIL nolayer',label);fail++;return}const e=s.indexOf('</script>',i);let body=s.slice(i,e);let n=body.split(oldS).length-1;if(n!==cnt){console.log('FAIL',label,'expected',cnt,'found',n);fail++;return}body=body.split(oldS).join(newS);s=s.slice(0,i)+body+s.slice(e);applied++;};
for(const pfile of process.argv.slice(4))require(require('path').resolve(pfile));
fs.writeFileSync(out,s);console.log('applied',applied,'fail',fail);if(fail)process.exit(1);
