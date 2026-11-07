// 1101A：真人點擊卡頓——開後台後每 3 秒點一個側邊欄分頁，量「點擊→可再執行 JS」的延遲（node clk28.js [html] [秒數]）
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html',DUR=+(process.argv[3]||150);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(10000);
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
const t0=Date.now();const lat=[];let i=0;
while(Date.now()-t0<DUR*1000){await p.waitForTimeout(3000);
  const items=await p.$$('.p-admin-side button, .p-admin-side a, .p-admin-side li, aside button, aside a');if(!items.length)continue;
  const el=items[(i++*7)%items.length];const a=Date.now();try{await el.click({timeout:15000})}catch(_){}await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>r())));lat.push([Math.round((Date.now()-t0)/1000),Date.now()-a])}
lat.sort((x,y)=>y[1]-x[1]);const v=lat.map(x=>x[1]).sort((a,b)=>a-b);
console.log(JSON.stringify({clicks:lat.length,p50:v[Math.floor(v.length/2)],p90:v[Math.floor(v.length*0.9)],max:v[v.length-1],over1s:v.filter(x=>x>1000).length,worst:lat.slice(0,6)}));await b.close()})();
