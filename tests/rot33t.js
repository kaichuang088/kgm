// 1103A：機隊輪轉統一規則驗證——隨機 300 次「＋」，全機隊（UTC）重疊／跳站不能增加；舊資料的衝突手排段會被清掉
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1100}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(8000);
const r=await p.evaluate(async()=>{
 const sp=window.kgmRotSpanR1103A,B={TPE:1,TSA:1},same=(a,b)=>a===b||(B[a]&&B[b]);const rt=x=>String(x.route||(x.fr+'→'+x.to)).split('→');
 const T=todayISO(),end=addDays(T,45);
 function audit(){let ov=0,j=0,legs=0,turn=0;const ex=[];Object.keys(S.tailAssign).forEach(t=>{const L=(S.tailAssign[t]||[]).filter(x=>x&&x.date>=T&&x.date<=end).sort((a,c)=>sp(a)[0]-sp(c)[0]);legs+=L.length;
   for(let i=1;i<L.length;i++){const a=L[i-1],c=L[i],g=sp(c)[0]-sp(a)[1];if(g<0){ov++;if(ex.length<6)ex.push(t+' OVL '+a.code+' '+a.date+' / '+c.code+' '+c.date)}else if(!same(rt(a)[1],rt(c)[0])){j++;if(ex.length<6)ex.push(t+' JMP '+a.code+' '+rt(a).join('→')+' '+a.date+' / '+c.code+' '+rt(c).join('→')+' '+c.date)}else if(g<45)turn++}});return {ov,j,turn,legs,ex}}
 const out={base:audit(),sweep0:window.kgmRotSweepR1103A()};
 S.view='admin';S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.adminTab='status';
 // 隨機「＋」
 const types=['B779','A388','B78X','B789','A21N','A35K','A359','A339L','A339R'];let ok=0,no=0,noop=0;const msgs={};let seed=7;const rnd=n=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed%n};
 for(let k=0;k<300;k++){const ty=types[rnd(types.length)],tails=tailsFor(ty)||[];if(!tails.length)continue;const tl=tails[rnd(tails.length)],d=addDays(T,1+rnd(30));
   const fl=[].concat(FLIGHTS).filter(f=>f&&!f.via&&!f.partner&&(()=>{try{return acftOfFlight(f.code,d,f.fr,f.to)===ty&&flyOn(window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,d):f,new Date(d+'T12:00:00'))}catch(_){return false}})());if(!fl.length)continue;const f=fl[rnd(fl.length)];
   S._fsType=ty;S._fsTail=tl;S._fsDate=d;window.kgmFleetAddR69(f.code,f.fr,f.to);const m=String(S._fsMsg||'');
   if(/^✓/.test(m))ok++;else if(/本來就在/.test(m))noop++;else{no++;const key=m.replace(/[A-Z]{2}\d+|B-\d+|\d\d-\d\d|\d\d:\d\d|\d+ 分/g,'#').slice(0,40);msgs[key]=(msgs[key]||0)+1}
   if(k===0)out.first=m}
 out.ops={ok,no,noop,why:Object.entries(msgs).sort((a,c)=>c[1]-a[1]).slice(0,8)};out.after=audit();
 // 舊資料：塞一段衝突的手排段
 const t0=tailsFor('B779')[3],L0=(S.tailAssign[t0]||[]).filter(x=>x.date>addDays(T,3)).sort((a,c)=>sp(a)[0]-sp(c)[0]);const v=L0[1];
 S.tailAssign[t0].push({date:v.date,code:'KX85',route:'BKK→TPE',dep:'09:40',arr:'14:25',dd:0,manualR69:1});
 out.injected=audit();out.sweepN=window.kgmRotSweepR1103A();await new Promise(r=>setTimeout(r,50));out.afterSweep=audit();out.log=(window.KGM_ROTFIX_R1103A||[]).slice(-2);
 return out});
console.log(JSON.stringify(r,null,1));console.log('ERR',errs.slice(0,5));await b.close()})();
