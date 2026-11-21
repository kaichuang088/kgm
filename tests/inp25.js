// 1025B E：使用者感受的延遲 —— 真的滑鼠點後台左側選單，量每次點擊到畫面更新（Event Timing）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 await p.goto('file:///tmp/j/'+(process.argv[2]||'kgm.html'),{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForTimeout(+(process.argv[3]||20000));
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();
   window.__ev=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(e.name==='click'||e.name==='pointerdown'||e.name==='pointerup')window.__ev.push({n:e.name,d:Math.round(e.duration),t:Math.round(e.startTime)})})).observe({type:'event',durationThreshold:16,buffered:false})});
 await p.waitForTimeout(1500);
 const names=['航班狀態','航線管理','定位管理','團體訂位','案件處理中心','競標管理','會員管理','營收分析','票價分析','員工管理','組員班表','地勤班表','機隊排班','請假管理','員工票狀態','審核中心','航班資料／實體報到','登機門／櫃檯'];
 const res=[];
 for(let round=0;round<2;round++)for(const nm of names){const loc=p.locator('#app >> text="'+nm+'"').first();
   try{await loc.scrollIntoViewIfNeeded({timeout:3000});const t0=Date.now();await loc.click({timeout:15000});const t1=Date.now();await p.waitForTimeout(1200);
     const ev=await p.evaluate(()=>{const e=window.__ev;window.__ev=[];return e});const mx=Math.max(0,...ev.filter(x=>x.n==='click').map(x=>x.d));res.push([nm,mx,t1-t0])}catch(e){res.push([nm,-1,String(e).slice(0,60)])}}
 res.forEach(r=>console.log(r.join('\t')));
 const v=res.filter(r=>r[1]>=0).map(r=>r[1]).sort((a,b)=>a-b);console.log('clicks',v.length,'median',v[Math.floor(v.length/2)],'p90',v[Math.floor(v.length*0.9)],'max',v[v.length-1],'over1s',v.filter(x=>x>1000).length,'over300',v.filter(x=>x>300).length);
 await b.close()})();
