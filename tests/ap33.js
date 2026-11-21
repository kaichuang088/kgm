const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const out={};for(const v of ['1102A_w21','1103A_w29']){const p=await b.newPage();await p.goto('file:///tmp/j/kgm'+v+'.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(9000);
out[v]=await p.evaluate(()=>{const L=window.KGM_GRP_EXTRA_R1103A||['KOJ','HKT','CXR','PEK','SHA','NGS','KMQ','OKJ','HIJ','ITM','TAK','KIJ','TOY','SDJ','AOJ','MYJ','FSZ','KMI','OIT','NKG','XIY','WUH','TAO','DLC','SHE','KMG','TSN'];const srv={};[].concat(FLIGHTS,S.customFlights||[]).forEach(f=>{if(f&&!f.partner&&/^KX/.test(f.code||'')){srv[f.fr]=1;srv[f.to]=1}});
 const r={};L.forEach(a=>{if(srv[a])r[a]={xy:typeof AP_XY!=='undefined'?AP_XY[a]||null:'?',tz:typeof TZ!=='undefined'?TZ[a]:'?',zh:CITY_ZH[a]||null,reg:typeof REGION_AP_R913!=='undefined'?REGION_AP_R913[a]||null:'?'}});return r});await p.close()}
console.log(JSON.stringify(out));await b.close()})();
