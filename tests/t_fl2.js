const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(60000);
 const types=JSON.parse(process.argv[2]);
 for(const [tp,cands] of types){
  const r=await p.evaluate(([tp,cands])=>{
    const keep=FLEET_CNT[tp],out=[];
    const T0=todayISO();
    const lim=(()=>{const t=new Date(T0+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+60);return t.toISOString().slice(0,10)})();
    for(const n of cands){FLEET_CNT[tp]=n;kgmClearRotationCacheR72();const t0=performance.now();
      let R=null;try{R=kgmBuildRotationsR72(tp,T0,366)}catch(e){out.push(n+':ERR '+e.message);continue}
      const tails=Object.keys(R.legs||{});
      let blk=0,idle7=0,unused=0;
      tails.forEach(tl=>{const has={};let cnt=0;(R.legs[tl]||[]).forEach(x=>{if(x&&x.date>=T0&&x.date<lim){has[x.date]=1;cnt++;if(isFinite(+x.arrAbs))blk+=(+x.arrAbs)-(+x.depAbs)}});
        if(!cnt)unused++;let run=0,gap=0;for(let i=0;i<60;i++){const d=new Date(T0+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);if(has[d.toISOString().slice(0,10)])run=0;else{run++;gap=Math.max(gap,run)}}if(gap>=7)idle7++});
      out.push({n,tails:tails.length,orphan:R.orphan,open:R.open,split:R.split,assigned:R.assigned,total:R.total,unused,idle7,hPerTail:+(blk/60/60/Math.max(1,tails.length)).toFixed(2),ms:Math.round(performance.now()-t0)});
    }
    FLEET_CNT[tp]=keep;kgmClearRotationCacheR72();return out;},[tp,cands]);
  console.log(tp,JSON.stringify(r));
 }
 await b.close();})();
