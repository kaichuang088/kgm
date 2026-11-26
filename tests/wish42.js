// 1115A D7：組員許願航點 —— 基地出發航段飛到許願航點的比例（新舊版比較）＋班表頁面板
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html',DAYS=+(process.env.DAYS||14);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));p.on('dialog',d=>d.accept().catch(()=>{}));
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(5000);
 const r=await p.evaluate(async({DAYS})=>{
  function h(s){s=String(s);var x=2166136261;for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
  const B={TPE:1,TSA:1};const DST={};function dests(base){if(DST[base])return DST[base];const o={};FLIGHTS.forEach(f=>{if(!f||f.partner||f.codeshare||!/^KX\d{1,3}$/.test(String(f.code||'')))return;const fr=f.fr,to=f.via||f.to;if(base==='TPE'?(B[fr]&&!B[to]):(fr==='BKK'&&!B[to]))o[to]=1;if(base==='TPE'&&B[fr]&&f.via&&!B[f.to])o[f.to]=1});return DST[base]=Object.keys(o).sort()}
  const W={};function wish(id,base,mo){const k=id+'|'+mo+'|'+base;if(W[k])return W[k];const L=dests(base).slice().sort((x,y)=>h(id+'|'+mo+'|'+x)-h(id+'|'+mo+'|'+y));return W[k]=new Set(L.slice(0,5))}
  const P=kgmCrewPoolR121(),info={};P.pilots.concat(P.cabin).forEach(x=>info[x.empId]=x);
  const T=todayISO();let n=0,hit=0;const byRole={pilot:[0,0],cabin:[0,0]};
  for(let i=0;i<DAYS;i++){const d=addDays(T,i);const pl=kgmCrewPlanR121(d);(pl.flights||[]).forEach(f=>{(f.pilots||[]).map(q=>['pilot',q]).concat((f.cabin||[]).map(q=>['cabin',q])).forEach(([role,q])=>{const pp=info[q.empId]||{};const base=pp.base||(pp.nat22==='TH'?'BKK':'TPE');const out=base==='BKK'?f.fr==='BKK':!!B[f.fr];if(!out)return;n++;byRole[role][0]++;const w=wish(q.empId,base,d.slice(0,7));if(w.has(f.to)||w.has(f.via)){hit++;byRole[role][1]++}})})}
  const o={days:DAYS,outLegs:n,hit,pct:+(hit/n*100).toFixed(1),pilot:+(byRole.pilot[1]/byRole.pilot[0]*100).toFixed(1),cabin:+(byRole.cabin[1]/byRole.cabin[0]*100).toFixed(1)};
  if(window.kgmCrewWishHtmlR1115A){const st=(S.staff||[]).find(s=>s.role==='cabin'&&s.empId);S.adminAuthed=true;S.adminUser={name:st.name,empId:st.empId,role:'cabin'};
    const html=kgmCrewWishHtmlR1115A(st.empId,[]);const dv=document.createElement('div');dv.innerHTML=html;document.body.appendChild(dv);
    o.panel=dv.innerText.replace(/\s+/g,' ').slice(0,260);const sels=dv.querySelectorAll('select');o.nSel=sels.length;o.optN=sels[0]&&sels[0].options.length;
    const want=[...sels[0].options].map(x=>x.value).filter(Boolean).slice(0,5);want.forEach((v,i)=>{sels[i].value=v});const sig0=null;
    kgmCrewWishSaveR1115A(st.empId,kgmCrewWishMonthR1115A());o.saved=JSON.stringify((S.crewWishR1115A||{})[st.empId]);o.msg=S.k115wMsg;
    o.ls=(localStorage.getItem('kgm40_crewwish')||'').slice(0,120);
    const other=(S.staff||[]).find(s=>s.role==='pilot');o.otherBlocked=(function(){const a0=window.alert;let m='';window.alert=x=>m=x;kgmCrewWishSaveR1115A(other.empId,'2026-12');window.alert=a0;return m})();
    o.score=[kgmCrewWishScoreR1115A({empId:st.empId,base:'TPE'},{fr:'TPE',to:want[0]},kgmCrewWishMonthR1115A()+'-05'),kgmCrewWishScoreR1115A({empId:st.empId,base:'TPE'},{fr:'TPE',to:'ZZZ'},kgmCrewWishMonthR1115A()+'-05'),kgmCrewWishScoreR1115A({empId:st.empId,base:'TPE'},{fr:'NRT',to:'TPE'},kgmCrewWishMonthR1115A()+'-05')]}
  return o},{DAYS});
 console.log(F,JSON.stringify(r,null,1),errs.slice(0,3));await b.close()})();
