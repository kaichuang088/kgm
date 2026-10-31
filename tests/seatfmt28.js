const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:1000}})).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(18000);
const r=await p.evaluate(()=>{const D='2027-07-14';const f0=FLIGHTS.filter(x=>x.code==='KX98'&&!x.via)[0];const f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});
 S.search=Object.assign({},S.search,{type:'OW',dep:D,fr:f.fr,to:f.to,adt:1,chd:0,inf:0,pax:1});S.outF=f;S.outC='E-T';S.inbF=null;S.view='booking';S.phase='seat';S.seatPhase='out';S.seats={};render();
 const rows=[...document.querySelectorAll('#app div')].filter(d=>{const sp=d.firstElementChild;return sp&&sp.tagName==='SPAN'&&/^\d+/.test((sp.textContent||'').trim())&&d.querySelector('.seat[onclick]')});
 const out=rows.map(d=>({label:(d.firstElementChild.textContent||'').trim(),sid:(/'(\d+[A-K])'/.exec((d.querySelector('.seat[onclick]')||{}).getAttribute?d.querySelector('.seat[onclick]').getAttribute('onclick'):'')||[])[1]}));
 const r30=rows.find(d=>/^30\b/.test(d.firstElementChild.textContent.trim()));const seat=r30?[...r30.querySelectorAll('.seat[onclick]')].find(e=>!e.classList.contains('lk'))||r30.querySelector('.seat[onclick]'):null;
 let res={};if(seat){const oc=seat.getAttribute('onclick');const sid=/'(\d+[A-K])'/.exec(oc)[1];toggleSeat('out',sid,false);
   const after=[...document.querySelectorAll('.seat.sel[onclick]')].map(e=>(/'(\d+[A-K])'/.exec(e.getAttribute('onclick')||'')||[])[1]);res={clickLabelRow:'30',onclickSid:sid,stored:Object.keys(S.seats.out||{}),selHighlighted:after}}
 return {map:out.filter((x,i)=>i%6===0).slice(0,14),res}});
await p.waitForTimeout(1200);const hl=await p.evaluate(()=>({el:[...document.querySelectorAll('.seat[onclick]')].filter(e=>/'22A'/.test(e.getAttribute('onclick'))).map(e=>e.className+' | '+e.getAttribute('onclick')+' | '+e.title),sel:[...document.querySelectorAll('.seat.sel')].map(e=>(e.getAttribute('onclick')||'').slice(0,40)+'|'+e.title),seats:JSON.stringify(S.seats)}));console.log(JSON.stringify(r.res),JSON.stringify(hl));await b.close()})();
