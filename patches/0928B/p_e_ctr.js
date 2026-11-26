/* 0928B · 報到櫃檯分區（使用者：「櫃檯分配盡量這樣配，除了相近時間外：『短程＋聯營航班』和『長程航班
   （第五航權航班如 TPE-BKK-IST 也算是長程航班，依照最終目的地決定）』，櫃檯更新資料也請放在新聞，
   從 10/5 開始更改（後台也要確認是 10/5 開始更改），但是航廈不變。」）
   · 2026-10-05 起：同一航廈裡，長程與「短程＋聯營」各自分櫃；各自仍照開櫃時間相近的 2–3 班併一櫃（原規則不變）。
   · 長程＝依「最終目的地」距離 ≥ 4,500 km（歐洲、北美、大洋洲、中東、馬爾地夫…）；經停班看整趟的終點，
     例如 TPE→BKK→IST 的 TPE→BKK 段算長程。聯營一律歸短程區。
   · 某一區在該時段只剩一班時，盡量併到時間最近、還有空位的另一區櫃檯，不讓它單獨開一櫃（2–3 班一櫃的規則優先）。
   · 10/4（含）以前照舊。航廈不動。 */
RL('ctr zone group','kgm-0903b-r116',
"          var groups=window.kgmGroupCountersR116(o.flights);",
"          var groups=window.kgmGroupByZoneR928?window.kgmGroupByZoneR928(o.flights,date):window.kgmGroupCountersR116(o.flights);   /* 0928B：10/5 起長程／短程＋聯營分櫃 */",1);
RL('ctr zone tag','kgm-0903b-r116',
"            rows.push({term:t,counter:String(cs[i]),flights:g,staff:uniq,",
"            rows.push({term:t,counter:String(cs[i]),flights:g,staff:uniq,zoneR928:(window.kgmZoneOfGroupR928?window.kgmZoneOfGroupR928(g,date):''),",1);
RL('ctr zone fn','kgm-0903b-r116',
"/* ── 職務描述（與 r74 同一套語彙，重新分組後要跟著重算時間）─────── */",
"/* ── 0928B：長程／短程＋聯營分櫃（2026-10-05 起）──────────────────── */\n"
+"var ZONE_FROM_R928='2026-10-05',ZONE_KM_R928=4500,ZMEMO_R928={};\n"
+"window.KGM_COUNTER_ZONE_FROM_R928=ZONE_FROM_R928;\n"
+"window.kgmHaulOfR928=function(f){\n"
+"  if(!f)return 'S';if(f.partner)return 'S';\n"
+"  var k=f.code+'|'+f.fr+'|'+f.to;if(ZMEMO_R928[k])return ZMEMO_R928[k];\n"
+"  var dest=f.to;\n"
+"  try{var all=[].concat(FLIGHTS,(S.customFlights||[]));var v=all.filter(function(x){return x&&x.via&&x.code===f.code&&x.fr===f.fr&&x.via===f.to})[0];if(v)dest=v.to}catch(_){}\n"
+"  var km=0;try{km=+distOf(f.fr,dest)||0}catch(_){}\n"
+"  return (ZMEMO_R928[k]=(km>=ZONE_KM_R928?'L':'S'));\n"
+"};\n"
+"window.kgmZoneOfGroupR928=function(g,date){\n"
+"  if(!date||String(date)<ZONE_FROM_R928)return '';\n"
+"  var z0={};(g||[]).forEach(function(f){z0[window.kgmHaulOfR928(f)]=1});\n"
+"  return (z0.L&&z0.S)?'M':(z0.L?'L':'S');\n"
+"};\n"
+"window.kgmGroupByZoneR928=function(list,date){\n"
+"  if(!date||String(date)<ZONE_FROM_R928)return window.kgmGroupCountersR116(list);\n"
+"  var L=[],Sx=[];(list||[]).forEach(function(f){(window.kgmHaulOfR928(f)==='L'?L:Sx).push(f)});\n"
+"  var gl=L.length?window.kgmGroupCountersR116(L):[],gs=Sx.length?window.kgmGroupCountersR116(Sx):[];\n"
+"  /* 某一區只剩單獨一班：盡量併進另一區時間最近、還放得下的那一櫃 */\n"
+"  function cap(g,f){var big=g.some(isA388)||isA388(f);if(isA388(f)&&g.some(isA388))return false;return g.length<(big?window.KGM_COUNTER_MAX_A388_R116:window.KGM_COUNTER_MAX_R116)}\n"
+"  [[gl,gs],[gs,gl]].forEach(function(p){\n"
+"    var mine=p[0],other=p[1];\n"
+"    for(var i=mine.length-1;i>=0;i--){\n"
+"      if(mine[i].length!==1||!other.length)continue;\n"
+"      var f=mine[i][0],best=null,bd=1e9;\n"
+"      other.forEach(function(g){if(!cap(g,f))return;var d=Math.min.apply(null,g.map(function(x){return Math.abs(x.open-f.open)}));if(d<bd){bd=d;best=g}});\n"
+"      if(best){best.push(f);best.sort(function(a,b){return a.open-b.open});mine.splice(i,1)}\n"
+"    }\n"
+"  });\n"
+"  return gl.concat(gs).sort(function(a,b){return a[0].open-b[0].open});\n"
+"};\n"
+"/* 會員新聞：一次性公告 */\n"
+"function newsCtrR928(){\n"
+"  try{\n"
+"    S.news=S.news||[];if(S.news.some(function(n){return n&&n.id==='N0928B-CTR'}))return 0;\n"
+"    S.news.unshift({id:'N0928B-CTR',date:(typeof todayISO==='function'?todayISO():'2026-09-28'),tag:(z()?'機場公告':'Airport notice'),\n"
+"      title:(z()?'10 月 5 日起，報到櫃檯改為「長程」與「短程＋聯營」分區':'From 5 October, check-in counters are split into long-haul and short-haul/codeshare zones'),\n"
+"      summary:(z()?'自 2026 年 10 月 5 日起，長程航班與短程＋聯營航班分開報到櫃檯；航廈不變。':'From 5 October 2026 long-haul and short-haul/codeshare flights use separate counters. Terminals are unchanged.'),\n"
+"      body:(z()?'親愛的旅客：\\n\\n自 2026 年 10 月 5 日（星期一）起，KGM 航空在各機場的報到櫃檯改為兩個區域：\\n\\n一、長程航班櫃檯：歐洲、北美、大洋洲、中東與馬爾地夫等長程航線。經停航班依「最終目的地」判斷，例如台北經曼谷飛伊斯坦堡、台北經成田飛檀香山，全程都在長程櫃檯辦理。\\n\\n二、短程＋聯營航班櫃檯：日本、韓國、中國大陸、港澳與東南亞航線，以及所有聯營航班。\\n\\n三、各區內起飛時間相近的航班仍會共用同一組櫃檯；每一班實際的櫃檯號碼會寫在報到通知信與航班資訊中。\\n\\n四、航廈不變，原本在第一航廈或第二航廈報到的航班，10 月 5 日之後仍在同一個航廈。\\n\\n10 月 4 日（含）以前出發的航班維持原本的櫃檯安排。感謝你選擇 KGM 航空。'\n"
+"        :'From Monday 5 October 2026, KGM check-in counters are split into a long-haul zone (Europe, North America, Oceania, the Middle East and the Maldives; through flights follow their final destination, e.g. Taipei–Bangkok–Istanbul) and a short-haul + codeshare zone (Japan, Korea, mainland China, Hong Kong/Macau, Southeast Asia and all codeshare flights). Flights departing close together still share counters. Terminals do not change. Departures on or before 4 October keep the current counters.'),\n"
+"      published:true});\n"
+"    try{save()}catch(_){}\n"
+"    return 1;\n"
+"  }catch(_){return 0}\n"
+"}\n"
+"newsCtrR928();setTimeout(newsCtrR928,3000);\n"
+"/* ── 職務描述（與 r74 同一套語彙，重新分組後要跟著重算時間）─────── */",1);
/* 後台櫃檯頁：標出分區與生效日 */
RL('ctr page note','kgm-0823o-r74',
"(z()?'每三小時顯示一組櫃檯、航班與人員；日期可查過去至明日，EQV 會顯示當日實際機型。':",
"(z()?'每三小時顯示一組櫃檯、航班與人員；日期可查過去至明日，EQV 會顯示當日實際機型。'+(String(date)>=(window.KGM_COUNTER_ZONE_FROM_R928||'9999')?'<br><b style=\"color:#123c32\">自 2026-10-05 起：長程櫃檯與「短程＋聯營」櫃檯分開（航廈不變），本日已套用。</b>':'<br><b style=\"color:#8a6d1f\">2026-10-05 起改為長程／「短程＋聯營」分區（航廈不變）；本日仍為原本的櫃檯分配。</b>'):",1);
RL('ctr card zone','kgm-0823o-r74',
"<b>'+E(terminalName74(ap,r.term)||r.term)+' · '+(z()?'櫃檯 ':'Counter ')+E(r.counter)+'</b><span>'+E(r.open)+'–'+E(r.close)+'</span></div>",
"<b>'+E(terminalName74(ap,r.term)||r.term)+' · '+(z()?'櫃檯 ':'Counter ')+E(r.counter)+'</b><span>'+E(r.open)+'–'+E(r.close)+'</span>'+(r.zoneR928?'<em style=\"display:inline-block;margin-top:4px;font-style:normal;font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:99px;background:'+(r.zoneR928==='L'?'#123c32;color:#fff':(r.zoneR928==='S'?'#eef3f0;color:#123c32':'#f7efdc;color:#8a6d1f'))+'\">'+(r.zoneR928==='L'?(z()?'長程':'Long-haul'):(r.zoneR928==='S'?(z()?'短程＋聯營':'Short-haul + codeshare'):(z()?'長程／短程併櫃（該時段單獨一班）':'Mixed (single flight in window)')))+'</em>':'')+'</div>",1);
