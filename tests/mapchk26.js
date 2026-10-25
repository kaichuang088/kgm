const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm1026B_w16.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(10000);
for(const [c,fr,to] of [['KX93','VIE','TPE'],['KX47','JFK','TPE'],['KX1','DOH','TPE']]){
 const u=await p.evaluate(async([c,fr,to])=>{const f=FLIGHTS.find(x=>x.code===c&&x.fr===fr&&x.to===to);const d=document.createElement('div');d.style.width='900px';document.body.appendChild(d);kgmRouteMapR1025B(d,f,'2027-01-15',null);
   for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,300));const im=d.querySelector('img.k25map-img');if(im&&im.src)return im.src}return null},[c,fr,to]);
 if(u)require('fs').writeFileSync('/tmp/j/map_'+c+'.jpg',Buffer.from(u.split(',')[1],'base64'));console.log(c,!!u)}
console.log(errs.slice(0,3));await b.close()})();
