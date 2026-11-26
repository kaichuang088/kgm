const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Tokyo'})).newPage();
const errs=[];p.on('pageerror',e=>{if(!/寄信/.test(e.message))errs.push(e.message)});
await p.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
console.log(await p.evaluate(()=>{const o=[];const b=S.bookings.find(x=>x.pnr==='B8LNQ2');o.push('sim: '+kgmBookedWhereR1022A(b).replace(/<[^>]+>/g,''));
 const nb=JSON.parse(JSON.stringify(b));nb.pnr='T22GEO';delete nb.csSimR1012A;delete nb.simR1010A;nb.bookedAt=new Date().toISOString();nb.contactPhone='';S.bookings.push(nb);save();
 o.push('new: '+JSON.stringify(nb.bookedGeoR1022A)+' → '+kgmBookedWhereR1022A(nb).replace(/<[^>]+>/g,''));return o.join('\n')}));
console.log('errs',errs.slice(0,3));await b.close()})();
