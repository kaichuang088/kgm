/* 0928A · 航班機身查詢
   ① KX24 出現兩列：KX24 在時刻表上有兩筆（一三五日 19:20、二四六 11:40），查詢把兩筆都列出來，
      不飛的那一筆標「當日不營運」，看起來就像同一班有兩個。同一班號同一航段只要當天有一筆在飛，就不再列不飛的那筆。
   ② 查到「當天有飛但沒有機身」時，原本會從查詢的那一天起整年重排 —— r72 重排會把起點之前的輪轉全部清掉
      （含已定案的 30 天），一次查詢就可能造成大量無機可派。改成只用 r135 的補洞程式把缺的補上，不重排。 */
RL('q no rebuild','kgm-0823l-r69',
"      try{window.kgmRebuildFleetR72(d,366,true);IDX69=null;tl=assignedTo69(f.code,f.fr+'→'+f.to,d)}catch(_){}",
"      try{if(window.kgmCoverGapsR135){var g928=window.kgmCoverGapsR135(false);if(g928.missing&&g928.missing<=300)window.kgmCoverGapsR135(true)}IDX69=null;tl=assignedTo69(f.code,f.fr+'→'+f.to,d)}catch(_){}   /* 0928A：不再從查詢日整年重排 */",1);
RL('q dedupe','kgm-0823l-r69',
"  S._fsQRes={code:c,date:d,rows:rows};",
"  /* 0928A：同一班號同一航段當天有一筆在飛，就不列不飛的那筆（例：KX24 一三五日／二四六兩筆時刻） */\n  rows=rows.filter(function(r){return r.operating||!rows.some(function(o){return o!==r&&o.operating&&o.code===r.code&&o.fr===r.fr&&o.to===r.to})});\n  S._fsQRes={code:c,date:d,rows:rows};",1);
