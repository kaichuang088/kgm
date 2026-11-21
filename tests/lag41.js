// 1112B C15：後台開著、使用者每 1.5 秒點一下，量「點下去到網頁開始處理」的等待（event.timeStamp → 處理函式）
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 await p.addInitScript(()=>{window.__lag=[];document.addEventListener('pointerdown',e=>{window.__lag.push([Math.round(performance.now()/1000),Math.round(performance.now()-e.timeStamp)])},true)});
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(8000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 const t0=Date.now();while(Date.now()-t0<+(process.env.DUR||150000)){try{await p.mouse.click(1300,40)}catch(_){}await p.waitForTimeout(1500)}
 const L=await p.evaluate(()=>window.__lag);const v=L.map(x=>x[1]).sort((a,b)=>a-b),n=v.length;
 console.log(JSON.stringify({file:F,clicks:n,p50:v[n>>1],p90:v[Math.floor(n*.9)],max:v[n-1],over500:v.filter(x=>x>500).length,over1000:v.filter(x=>x>1000).length,worst:L.filter(x=>x[1]>500).slice(0,12)}));await b.close()})();
