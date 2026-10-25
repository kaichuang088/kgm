const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file:///tmp/j/'+process.argv[2],{waitUntil:'domcontentloaded'});await p.waitForTimeout(12000);
console.log(await p.evaluate(()=>{const out=[];FLIGHTS.filter(f=>f&&!f.via&&!f.partner&&/^KX\d+$/.test(f.code)).forEach(f=>{const w=kgmWarRouteR1025B(f.fr,f.to);if(!w)return;
 const s=kgmWarDelayR1025B(f,'2027-07-15'),wi=kgmWarDelayR1025B(f,'2027-01-15');out.push(f.code+' '+f.fr+'-'+f.to+' +'+w.extra+'km S raw '+Math.round(s.raw)+' slack '+s.slack+' late '+s.min+' | W raw '+Math.round(wi.raw)+' slack '+wi.slack+' late '+wi.min)});return out.join('\n')}));await b.close()})();
