/* ══ 1108A：航班動態／登機門發布時間（使用者：「航班動態預計的只能Publish到隔天…證明要等實際抵達才可以下載，登機門也要在起飛前一天23:00放上去，還沒到就不要寫登機門」）
   · 登機門：起飛日前一天 23:00（台北時間；停機位只排桃園出發）起才公布，之前一律「未公布」。
     做法：最外層包 kgmGateOfR26 —— 先用 S._k65Raw 拿排定的門，再依新規則決定 published；
     後台排班（S._k65Raw／S._k65ShowPlan）與地勤櫃檯列印（ci31 ground）照舊拿排定的門。
   · 預估時刻只發布到隔天、航班證明實際抵達後才可下載：改在 gen_r28（est30 front／st38 cert RW）。 */
(function(){
  if(window.__st38)return;window.__st38=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  /* 起飛日前一天 23:00（UTC+8）的時間戳 */
  function pubAt(date){var p=String(date||'').split('-');if(p.length<3)return 0;return Date.UTC(+p[0],+p[1]-1,+p[2])-60*60000-8*3600000}
  window.kgmGatePubAtR1108A=pubAt;
  function wrap(){var O=window.kgmGateOfR26;if(typeof O!=='function'||O.__st38)return;
    var w=function(code,date){var raw0=S._k65Raw,base;try{S._k65Raw=1;base=O.apply(this,arguments)}finally{S._k65Raw=raw0}
      if(!base)return base;if(S._k65Raw||S._k65ShowPlan)return base;
      var out={};for(var k in base)if(Object.prototype.hasOwnProperty.call(base,k))out[k]=base[k];
      var pub=Date.now()>=pubAt(date);out.published=pub;out.pubAtR1108A=pubAt(date);
      if(pub){if(out.withheldR65){out.gate=out.plannedGate||out.gate;delete out.withheldR65}return out}
      out.plannedGate=base.plannedGate||base.gate;out.gate=z()?'未公布':'TBA';out.withheldR65=true;return out};
    w.__st38=1;try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}window.kgmGateOfR26=w}
  wrap();[0,1500,4000,13000,30000].forEach(function(t){setTimeout(wrap,t)});
})();
/* 1108A N11：組員班表月曆格子的 DH 行原本 nowrap＋省略號（「DH KX307 PVG→TPE 18:45–20…」）→ DH 行與 DH 訂位代號換行、不截字 */
(function(){try{if(document.getElementById('k38-cal-css'))return;var cs=document.createElement('style');cs.id='k38-cal-css';
  cs.textContent='.k196-cal i.k196-dh{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.35;color:#5b4a1f}.k196-cal i.k196-pnr{white-space:normal!important}';
  (document.head||document.documentElement).appendChild(cs)}catch(_){}})();
/* 1108B B14（使用者圖三、四：「你看圖三寫 11:33 arrive PDF report is not 11:33!」）：
   航班證明原本讀 FLIGHTS 的原始表定（KX180＝07:50–11:55，連季節時刻都不是）＋只看人工改的時刻；前台航班動態讀季節時刻＋人工改＋航班資料的預估（EST）。
   → 證明改讀跟前台航班動態卡片（fb20b info20＋gen est30 front）同一份：表定＝當天季節時刻（sortedFlights 同一列），實際＝人工改 → 預估（同樣只到隔天、起飛後 30 小時內）→ 表定。 */
(function(){
  function mn(t){var p=String(t||'0:0').split(':');return (+p[0])*60+(+p[1]||0)}
  function clk(m){m=((m%1440)+1440)%1440;return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+(m%60)).slice(-2)}
  window.kgmCertTimesR1108B=function(f0,code,date){var fs=f0;
    try{var L=sortedFlights(f0.fr,f0.to,date)||[],hit=L.filter(function(x){return x&&x.code===code&&x.fr===f0.fr&&x.to===f0.to})[0];if(hit)fs=Object.assign({},f0,hit)
      else if(window.kgmSeasonFlightR48){var sx=window.kgmSeasonFlightR48(f0,date);if(sx)fs=Object.assign({},f0,sx)}}catch(_){}
    var O=S.flightOverrides||{},ov={};try{ov=O[_ovKey(fs,date)]||O[code+'_'+date]||{}}catch(_){ov=O[code+'_'+date]||{}}
    var p=null;try{if(!ov.arr&&!fs.partner&&!fs.divertContR1101A&&window.kgmOpsPredR1026C){var depEp=(function(){try{if(typeof _utcOf==='function')return _utcOf(date,fs.dep,fs.fr)}catch(_){}var q=String(date).split('-');return Date.UTC(+q[0],+q[1]-1,+q[2])+(mn(fs.dep)-((typeof TZ!=='undefined'&&TZ[fs.fr]!=null)?TZ[fs.fr]:8)*60)*60000})();   /* 跟 fb20b utc20 同一算法 */var h=(depEp-Date.now())/36e5;
        if(date<=addDays(todayISO(),1)&&h>-30){var q=window.kgmOpsPredR1026C(fs,date);if(q&&q.estArr)p=q}}}catch(_){}
    var sDD=+fs.dd||0,aDep=ov.dep||(p&&p.estDep)||fs.dep,aArr=ov.arr||(p&&p.estArr)||fs.arr,aDD=sDD;
    if(ov.arrDD!==undefined&&ov.arrDD!==null&&ov.arrDD!=='')aDD=+ov.arrDD;else if(p&&!ov.arr)aDD=sDD+Math.floor((mn(fs.arr)+(+p.arrDelta||0))/1440);
    return {f:fs,ov:ov,schDep:fs.dep,schArr:fs.arr,schArrDD:sDD,actDep:aDep,actArr:aArr,actArrDD:aDD,predR1108B:!!p}};
})();
