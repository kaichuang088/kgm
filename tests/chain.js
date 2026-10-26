const {chromium}=require('playwright');const F=process.argv[2];const C=process.argv[3].split(',');const D=process.argv[4].split(',');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForTimeout(15000);
console.log(await p.evaluate(([C,D])=>{const o=[];FLIGHTS.filter(f=>f&&!f.via&&C.includes(f.code)).forEach(f=>{o.push(f.code+' '+f.fr+'-'+f.to+' '+D.map(d=>{if(!flyOn(f,new Date(d+'T00:00:00')))return d.slice(5)+' --';const x=kgmSeasonFlightR48(f,d);return d.slice(5)+' '+x.dep+'-'+x.arr+(x.dd?'+'+x.dd:'')+'('+x.dur+')'}).join(' | '))});return o.join('\n')},[C,D]));await b.close()})();
