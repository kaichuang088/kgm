const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';const DAYS=+(process.env.DAYS||30);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>console.log('no fulldone'));
 await p.waitForTimeout(5000);
 const t0=Date.now();
 const r=await p.evaluate(({DAYS})=>{
   const T=todayISO();const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   const P=kgmCrewPoolR121(),info={};P.pilots.concat(P.cabin).forEach(x=>info[x.empId]=x);
   const real={};(S.staff||[]).forEach(s=>{if(s&&(s.role==='pilot'||s.role==='cabin'))real[s.empId]=s});
   const legs={};const NB={f:0,seats:0,th:0,over:0,thOff:0,jpF:0,jpOn:0,oF:0,jpOff:0};let viol=0,violS=[],flights=0,tailMin='9999';
   Object.keys(S.tailAssign||{}).forEach(t=>(S.tailAssign[t]||[]).forEach(f=>{if(f.date&&f.date<tailMin)tailMin=f.date}));
   const tms=[];
   for(let i=0;i<DAYS;i++){const d=D(T,i);const a=Date.now();const pl=kgmCrewPlanR121(d);tms.push(Date.now()-a);viol+=(pl.violations||[]).length;if(violS.length<6)violS.push(...(pl.violations||[]).slice(0,6-violS.length));
     (pl.flights||[]).forEach(f=>{flights++;{const cr=(f.pilots||[]).concat(f.cabin||[]);const bk=f.fr==='BKK'||f.to==='BKK';const th=cr.filter(q=>(info[q.empId]||{}).nat22==='TH').length;const jp=cr.filter(q=>(info[q.empId]||{}).nat22==='JP').length;const jf=[f.fr,f.to].some(a=>kgmCountryR929(a)==='JP');
 if(bk){NB.f++;NB.seats+=cr.length;NB.th+=th;['pilots','cabin'].forEach(k=>{const L=f[k]||[];const t=L.filter(q=>(info[q.empId]||{}).nat22==='TH').length;if(t>Math.floor(L.length/2))NB.over++});}else if(th)NB.thOff++;
 if(jf){NB.jpF+=cr.length;NB.jpOn+=jp}else{NB.oF+=cr.length;NB.jpOff+=jp}}(f.pilots||[]).concat(f.cabin||[]).forEach(q=>{if(!q||!q.empId)return;(legs[q.empId]=legs[q.empId]||[]).push({code:f.code,fr:f.fr,to:f.to,date:d,dd:+f.dd||0,dep:+f.depUTC,arr:+f.arrUTC})})});
     Object.keys((S.crewPositioningR121)||{}).forEach(k=>{});}
   Object.keys(S.crewPositioningR121||{}).forEach(k=>{const a=k.split('|');if(a[0]<D(T,-5)||a[0]>D(T,DAYS))return;(S.crewPositioningR121[k]||[]).forEach(q=>{if(!q||!q.empId||!q.flight)return;const f=q.flight;(legs[q.empId]=legs[q.empId]||[]).push({code:f.code,fr:f.fr,to:f.to,date:a[0],dep:+f.depUTC,arr:+f.arrUTC,dh:1})})});
   const out={flights,viol,violS,tailMin,ms:tms.reduce((a,b)=>a+b,0),maxDay:Math.max(...tms),NB,thStaff:(S.staff||[]).filter(s=>s.nationality==='TH').length};
   const sameC=(x,y)=>x===y||(window.kgmSameCityR928&&window.kgmSameCityR928(x,y));
   const fmt=l=>(l.dh?'DH ':'')+l.code+' '+l.fr+'-'+l.to+' '+l.date;
   ['real','virt'].forEach(kind=>{const st={people:0,legs:0,gap24:0,gs:[],stay3:0,ss:[],trip5:0,ts:[],nonBase:0,nat:{},thNonBkk:0};
     Object.keys(legs).forEach(id=>{const isR=!!real[id];if((kind==='real')!==isR)return;const L=legs[id].sort((a,b)=>a.dep-b.dep);const OP=L.filter(x=>!x.dh);st.people++;st.legs+=OP.length;st.dh=(st.dh||0)+(L.length-OP.length);
       const pr=info[id]||{};const home=(real[id]&&real[id].base)||pr.base||'TPE';const nat=pr.nat22||'?';st.nat[nat]=(st.nat[nat]||0)+1;
       if(nat==='TH'&&L.some(l=>!l.dh&&l.fr!=='BKK'&&l.to!=='BKK'))st.thNonBkk++;
       for(let i=1;i<OP.length;i++){const g=(OP[i].dep-OP[i-1].arr)/60;if(g<24){st.gap24++;if(st.gs.length<4)st.gs.push(id+' '+fmt(OP[i-1])+' → '+fmt(OP[i])+' '+g.toFixed(1)+'h')}}
       let trip=[],started=false;
       for(let i=0;i<L.length;i++){const l=L[i];if(!started){if(!sameC(l.fr,home)){continue}started=true}
         trip.push(l);
         if(sameC(l.to,home)){if(trip.filter(x=>!x.dh).length>4){st.trip5++;if(st.ts.length<4)st.ts.push(id+' '+trip.map(fmt).join(' | '))}trip=[]}
         else{const nx=L[i+1];if(nx){const dd=Math.round((Date.parse(nx.date)-Date.parse(D(l.date,l.dd||0)))/864e5);if(dd>3){st.stay3++;if(st.ss.length<4)st.ss.push(id+' '+fmt(l)+' → '+fmt(nx)+' '+dd+'d')}if(!sameC(nx.fr,l.to)){/*DH*/}}}}
     });out[kind]=st});
   return out},{DAYS});
 r.secs=(Date.now()-t0)/1000;console.log(JSON.stringify(r,null,1));console.log('ERR',JSON.stringify(errs.slice(0,3)));await b.close()})();
