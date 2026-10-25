
/* ══ 1025B k25（r229 最後，grp23 之後）══════════════════════════════════════ */
/* ── I：前台行程管理用 DH PNR 查不到（使用者：「你後台DH的PNR仍然找不到」，截圖 名 TAYLOR／姓 SHU-HAN）
      訂位上是 姓 TAYLOR、名 SHU-HAN；班表卡片寫「TAYLOR / SHU-HAN」看不出哪個是姓，照順序填就反了。
      名、姓填反也接受（仍然要兩個都對，不放寬成只看一個）。 ── */
(function(){
  var MY=null;
  function wrap(){var o=window.kgmLookupPnrR23;if(typeof o!=='function'||o===MY)return;
    var w=function(pnr,first,last){var r=o.apply(this,arguments);
      try{if(r&&!r.ok&&first&&last&&String(first).trim().toUpperCase()!==String(last).trim().toUpperCase()){var r2=o.call(this,pnr,last,first);if(r2&&r2.ok)return r2}}catch(_){}
      return r};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}MY=w;window.kgmLookupPnrR23=w}
  wrap();setTimeout(wrap,0);setTimeout(wrap,3000);setTimeout(wrap,10000);
})();
