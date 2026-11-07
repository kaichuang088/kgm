const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
console.log(await p.evaluate(()=>{var gaps=['2026-10-06','2026-10-13','2026-10-20','2026-10-27','2026-11-03','2027-03-16','2027-03-23','2027-03-30','2027-04-01'],ref={s:'2026-08-12',w:'2026-12-09'};var out=[];
  FLIGHTS.filter(f=>/^KX\d+$/.test(f.code)&&!f.via&&!f.partner).forEach(f=>{var rs=kgmSeasonFlightR48(f,ref.s)||{},rw=kgmSeasonFlightR48(f,ref.w)||{};
    gaps.forEach(D=>{for(var k=0;k<7;k++){var d=addDays(D,k-3);try{if(!flyOn(f,new Date(d+'T12:00:00')))continue}catch(_){continue}var x=kgmSeasonFlightR48(f,d)||{};var sea=kgmSeasonR57?kgmSeasonR57(d):'';var r=sea==='winter'?rw:rs;
      if(x.dur&&r.dur&&x.dur<Math.min(rs.dur,rw.dur)-15){out.push(f.code+' '+f.fr+'-'+f.to+' '+d+' '+x.dep+'-'+x.arr+' dur='+x.dur+' (s '+rs.dur+' / w '+rw.dur+')');break}}})});
  return [...new Set(out)].join('\n')||'none'}));await b.close()})();
