// 1103A：機隊輪轉全面稽核（接點跳站／時間重疊），讀 S.tailAssign（所有機身、今天起 N 天）
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1100}})).newPage();
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(+(process.env.W||5000));
const r=await p.evaluate((N)=>{const T=todayISO();const end=addDays(T,N);const TA=S.tailAssign||{};const out={tails:0,legs:0,jump:0,overlap:0,noAbs:0,ex:[]};
 let audit=null;try{const a=window.kgmAuditRotAllR922();audit={ok:a.ok,gap:a.gap,overlap:a.overlap,type:a.type,legs:a.legs}}catch(e){audit=String(e)}
 Object.keys(TA).forEach(tl=>{const L=(TA[tl]||[]).filter(x=>x&&x.date>=addDays(T,-2)&&x.date<=end).slice();if(!L.length)return;out.tails++;
   L.forEach(x=>{if(!isFinite(+x.depAbs))out.noAbs++});
   L.sort((a,b)=>(+a.depAbs||0)-(+b.depAbs||0));
   for(let i=1;i<L.length;i++){const a=L[i-1],c=L[i];if(c.date<T)continue;out.legs++;
     const j=a.to&&c.fr&&a.to!==c.fr,o=isFinite(+a.arrAbs)&&isFinite(+c.depAbs)&&(+c.depAbs)<(+a.arrAbs);
     if(j)out.jump++;if(o)out.overlap++;
     if((j||o)&&out.ex.length<25)out.ex.push(tl+' '+(j?'JUMP ':'')+(o?'OVL ':'')+a.date+' '+a.code+' '+a.fr+'→'+a.to+' '+a.dep+'-'+a.arr+' | '+c.date+' '+c.code+' '+c.fr+'→'+c.to+' '+c.dep+'-'+c.arr+(c.positioningR830?' [pos]':'')+(c.manualR69?' [man]':''))}});
 out.audit=audit;const na={};Object.keys(TA).forEach(tl=>(TA[tl]||[]).forEach(x=>{if(x&&x.date>=T&&x.date<=end&&!isFinite(+x.depAbs)){const k=x.code+' '+x.fr+'→'+x.to+' '+Object.keys(x).filter(k=>/R\d|manual|pos|ferry|tsa|sub/i.test(k)).join(',');na[k]=(na[k]||0)+1}}));out.noAbsKinds=Object.entries(na).sort((a,b)=>b[1]-a[1]).slice(0,30);
 /* 輪轉依日期＋出發時間（月曆的排法）再檢一次 */ let j2=0,o2=0;const ex2=[];Object.keys(TA).forEach(tl=>{const L=(TA[tl]||[]).filter(x=>x&&x.date>=T&&x.date<=end).slice().sort((a,b)=>(a.date+(a.dep||'')).localeCompare(b.date+(b.dep||'')));for(let i=1;i<L.length;i++){const a=L[i-1],c=L[i];if(a.to&&c.fr&&a.to!==c.fr){j2++;if(ex2.length<15)ex2.push(tl+' '+a.date+' '+a.code+' '+a.fr+'→'+a.to+' '+a.dep+' | '+c.date+' '+c.code+' '+c.fr+'→'+c.to+' '+c.dep+' abs:'+(isFinite(+c.depAbs)))}}});out.byDateJump=j2;out.ex2=ex2;return out},+(process.env.N||60));
console.log(JSON.stringify(r,null,1));await b.close()})();
