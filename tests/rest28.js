// 1101A：地勤相鄰兩天休息時間（kgmGroundDutyR99 畫面顯示的上下班）——node rest28.js [html]
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(70000);
const r=await p.evaluate(async()=>{const m=t=>{const a=String(t).split(':');return +a[0]*60+ +a[1]};
 const td=todayISO(),ds=[-2,-1,0,1].map(k=>new Date(Date.parse(td+'T12:00:00Z')+k*864e5).toISOString().slice(0,10));
 const out={short:[],n:0,kinds:{}};
 const ids=(S.staff||[]).filter(s=>s&&s.role==='ground'&&s.active!==false).map(s=>s.empId);
 for(const id of ids){let prev=null;
   for(let i=0;i<ds.length;i++){let d=null;try{d=kgmGroundDutyR99(id,ds[i])}catch(_){}
     if(!d||d.off||!d.from){prev=null;continue}
     let a=m(d.from)+i*1440,e=m(d.to)+i*1440;if(e<=a)e+=1440;
     const kind=(d.reserveR1008A?'R':'W');
     if(prev){const rest=a-prev.e;out.n++;if(rest<660)out.short.push([id,ds[i-1],prev.lab,ds[i],d.label+' '+d.from+'-'+d.to,Math.round(rest/6)/10+'h',prev.k+kind])}
     prev={e:e,lab:d.label+' '+d.from+'-'+d.to,k:kind};}
   }
 out.kinds=out.short.reduce((o,x)=>{o[x[6]]=(o[x[6]]||0)+1;return o},{});
 out.short=out.short.slice(0,15).concat([out.short.length]);return out});
console.log(JSON.stringify(r,null,0));await b.close()})();
