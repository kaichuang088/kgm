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
