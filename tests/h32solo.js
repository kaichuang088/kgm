const {chromium}=require('playwright');const fs=require('fs');const F=process.argv[2]||'/tmp/j/kgm.html';
const src=fs.readFileSync('/tmp/j/vfy6.js','utf8');const a=src.indexOf('const h32=await p.evaluate(');const b=src.indexOf("push('H32'",a);
const body=src.slice(a,b).replace('const h32=await p.evaluate(','return p.evaluate(').trim().replace(/;\s*$/,'');
(async()=>{const br=await chromium.launch();const p=await (await br.newContext()).newPage();
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<150&&!(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A));i++)await p.waitForTimeout(1000);await p.waitForTimeout(5000);
 const run=new Function('p',body);const r=await run(p);console.log(JSON.stringify(r));await br.close()})();
