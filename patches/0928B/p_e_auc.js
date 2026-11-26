/* 0928B · 競標以「航段」為單位（使用者：「後台搜尋 KX304 此類航班一樣要選擇航段，因為這些競標（Residence／BigDeal）一律使用航段為單位，
   第五航權航班會以兩個航段競標」；「Residence 如果是里程競標就算有其他是用錢競標，也要寫那位里程競標機票花了多少錢」）
   ① 每一筆出價都帶航段（fr／to）。旅客下標本來就有；模擬出價與舊資料補上（有訂位看訂位那一段，沒有就歸第一段）。
   ② 第五航權航班兩段各自有一組出價、各自結標。
   ③ 後台搜尋第五航權航班號時，先選航段才列出；每一組標題寫出航段，「立即結標」只結那一段。
   ④ 票價（旅客實付）：原本只有標記 demoR922 的模擬出價會估算，早期那幾筆（RM921x…）在有現金出價的班上一律顯示「—」。
      改成：查不到訂位的出價都依該段、該艙等票價估算。 */
/* ── 共用：航班號的航段（只有經停航班才會有兩段以上） ── */
RL('auc segs helper','kgm-0823h-r61',
"window.kgmAuctionRowsR920=function(q){",
"window.kgmAucSegsR928=function(code){\n"
+"  var out=[];code=String(code||'').trim().toUpperCase();if(!code)return out;\n"
+"  try{[].concat(FLIGHTS,(S.customFlights||[])).forEach(function(f){\n"
+"    if(!f||!f.via||f.code!==code)return;\n"
+"    [[f.fr,f.via],[f.via,f.to]].forEach(function(p){if(!out.some(function(x){return x.fr===p[0]&&x.to===p[1]}))out.push({fr:p[0],to:p[1]})});\n"
+"  })}catch(_){}\n"
+"  return out;\n"
+"};\n"
+"/* 舊資料／模擬出價補上航段 */\n"
+"window.kgmAucSegFixR928=function(){\n"
+"  var n=0;\n"
+"  try{\n"
+"    var all=[].concat(FLIGHTS,(S.customFlights||[]));\n"
+"    [S.residenceBidsR83||[],S.resMileBidsR161||[],S.bigDeals||[]].forEach(function(arr){\n"
+"      arr.forEach(function(b){\n"
+"        if(!b||b.fr||!b.code||!b.date)return;\n"
+"        var seg=null;\n"
+"        try{var bk=b.pnr?(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0]:null;\n"
+"          if(bk&&typeof window.segs7==='function'){var s=(window.segs7(bk)||[]).filter(function(q){return q.f&&q.f.code===b.code&&q.date===b.date})[0];if(s)seg={fr:s.f.fr,to:s.f.to}}}catch(_){}\n"
+"        if(!seg){var dt=new Date(b.date+'T12:00:00');var l=all.filter(function(x){if(!x||x.via||x.code!==b.code)return false;try{return (typeof flyOn!=='function')||flyOn(x,dt)}catch(_){return false}})[0]||all.filter(function(x){return x&&!x.via&&x.code===b.code})[0];if(l)seg={fr:l.fr,to:l.to}}\n"
+"        if(seg){b.fr=seg.fr;b.to=seg.to;n++}\n"
+"      });\n"
+"    });\n"
+"    if(n)try{save()}catch(_){}\n"
+"  }catch(_){}\n"
+"  return n;\n"
+"};\n"
+"window.kgmAuctionRowsR920=function(q){\n  try{window.kgmAucSegFixR928()}catch(_){}",1);
RL('auc rows cash seg','kgm-0823h-r61',"push({kind:'res-cash',id:b.id,code:b.code,date:b.date,","push({kind:'res-cash',id:b.id,code:b.code,date:b.date,fr:b.fr||'',to:b.to||'',",1);
RL('auc rows miles seg','kgm-0823h-r61',"push({kind:'res-miles',id:b.id,code:b.code,date:b.date,","push({kind:'res-miles',id:b.id,code:b.code,date:b.date,fr:b.fr||'',to:b.to||'',",1);
RL('auc rows big seg','kgm-0823h-r61',"push({kind:'bigdeal',id:b.id||b.pnr,code:b.code||'',date:b.date||'',","push({kind:'bigdeal',id:b.id||b.pnr,code:b.code||'',date:b.date||'',fr:b.fr||'',to:b.to||'',",1);
RL('auc rows seg filter','kgm-0823h-r61',
"  rows.sort(function(a,b){return String(a.date).localeCompare(String(b.date))\n    ||String(a.code).localeCompare(String(b.code))||(b.amount+b.miles)-(a.amount+a.miles)});\n  return rows;",
"  /* 0928B：第五航權航班號要先選航段 */\n  try{var sg928=String(S.auctionSegR928||'');if(qc&&sg928&&window.kgmAucSegsR928(qc).length>1)rows=rows.filter(function(r){return (r.fr+'-'+r.to)===sg928})}catch(_){}\n"
+"  rows.sort(function(a,b){return String(a.date).localeCompare(String(b.date))\n    ||String(a.code).localeCompare(String(b.code))||(b.amount+b.miles)-(a.amount+a.miles)});\n  return rows;",1);
RL('auc search reset seg','kgm-0823h-r61',
"    S.auctionCodeR923=String((document.getElementById('k920code')||{}).value||'').trim().toUpperCase();",
"    S.auctionCodeR923=String((document.getElementById('k920code')||{}).value||'').trim().toUpperCase();\n    if(S._aucCodePrevR928!==S.auctionCodeR923){S.auctionSegR928='';S._aucCodePrevR928=S.auctionCodeR923}   /* 0928B：換航班號就重選航段 */",1);
RL('auc group per seg','kgm-0823h-r61',
"    var g={};rows.filter(pred).forEach(function(r){var k=r.code+'|'+r.date;(g[k]=g[k]||[]).push(r)});",
"    var g={};rows.filter(pred).forEach(function(r){var k=r.code+'|'+r.date+'|'+(r.fr?r.fr+'-'+r.to:'');(g[k]=g[k]||[]).push(r)});   /* 0928B：以航段分組 */",1);
RL('auc card seg header','kgm-0823h-r61',
"    return '<article class=\"k920-grp\"><h3>'+e920(f.code)+'　'+e920(f.date)\n      +((can&&settle)?('<button class=\"btn btn-sm\" onclick=\"kgmAuctionSettleR920(\\''+e920(f.code)+'\\',\\''+e920(f.date)+'\\')\">'",
"    return '<article class=\"k920-grp\"><h3><span>'+e920(f.code)+'　'+(f.fr?('<em style=\"font-style:normal;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#8A6B1F\">'+e920(f.fr)+'→'+e920(f.to)+'</em>　'):'')+e920(f.date)+'</span>'\n      +((can&&settle)?('<button class=\"btn btn-sm\" onclick=\"kgmAuctionSettleR920(\\''+e920(f.code)+'\\',\\''+e920(f.date)+'\\',\\''+e920(f.fr||'')+'\\',\\''+e920(f.to||'')+'\\')\">'",1);
RL('auc seg chooser','kgm-0823h-r61',
"  if(isDate){\n    var fl=window.kgmResFlightsOnR920(q.trim());",
"  /* 0928B：第五航權航班號 → 先選航段 */\n"
+"  var segs928=[];try{segs928=window.kgmAucSegsR928(String(S.auctionCodeR923||''))}catch(_){}\n"
+"  if(segs928.length>1){\n"
+"    var cur928=String(S.auctionSegR928||'');\n"
+"    h+='<div class=\"k920-day\"><b>'+e920(String(S.auctionCodeR923))+(z920a()?' 是經停航班：Residence／BigDeal 以航段為單位競標，請先選擇航段':' is a through flight — auctions run per sector; pick a sector')+'</b><div>'\n"
+"      +segs928.map(function(x){var k=x.fr+'-'+x.to;return '<button class=\"btn btn-sm'+(cur928===k?' btn-g':'')+'\" style=\"margin:0 6px 6px 0\" onclick=\"S.auctionSegR928=\\''+k+'\\';S.aucShowR923={};render()\">'+e920(x.fr)+' → '+e920(x.to)+'</button>'}).join('')+'</div></div>';\n"
+"    if(!segs928.some(function(x){return (x.fr+'-'+x.to)===cur928}))return h+'<div class=\"k920-none\">'+(z920a()?'請先選擇上面其中一個航段。':'Pick a sector above.')+'</div></section>';\n"
+"  }\n"
+"  if(isDate){\n    var fl=window.kgmResFlightsOnR920(q.trim());",1);
RL('auc settle seg','kgm-0823h-r61',
"window.kgmAuctionSettleR920=function(code,date){\n  if(!window.kgmAuctionEditableR920()){alert(z920a()?'只有後台人員與 CEO 可以結標。':'Backend staff and the CEO only.');return}\n  var r=null;try{r=window.kgmResSettleR161(code,date)}catch(e){r={ok:false,why:String(e&&e.message||e)}}",
"window.kgmAuctionSettleR920=function(code,date,fr,to){\n  if(!window.kgmAuctionEditableR920()){alert(z920a()?'只有後台人員與 CEO 可以結標。':'Backend staff and the CEO only.');return}\n  var r=null;try{r=window.kgmResSettleR161(code,date,fr||'',to||'')}catch(e){r={ok:false,why:String(e&&e.message||e)}}   /* 0928B：只結這一段 */",1);
/* 結標：以航段為單位；沒指定航段的經停航班，兩段各自結標 */
RL('settle per seg','kgm-0905b-r161',
"window.kgmResSettleR161=function(code,date){\n  var cash=[],mile=[];\n  try{cash=(S.residenceBidsR83||[]).filter(function(b){return b&&b.code===code&&b.date===date&&b.status==='open'})}catch(_){}\n  mile=mbids().filter(function(b){return b.code===code&&b.date===date&&b.status==='open'});",
"window.kgmResSettleR161=function(code,date,fr,to){\n"
+"  /* 0928B：經停航班沒有指定航段 → 兩段各自結標 */\n"
+"  if(!fr){try{if(window.kgmAucSegFixR928)window.kgmAucSegFixR928();var sg928=window.kgmAucSegsR928?window.kgmAucSegsR928(code):[];\n"
+"    if(sg928.length>1){var last928=null;sg928.forEach(function(x){var r=window.kgmResSettleR161(code,date,x.fr,x.to);if(r&&r.ok)last928=r});return last928||{ok:false,why:'no bids'}}}catch(_){}}\n"
+"  function inSeg928(b){return !fr||!b.fr||(b.fr===fr&&b.to===to)}\n"
+"  var cash=[],mile=[];\n  try{cash=(S.residenceBidsR83||[]).filter(function(b){return b&&b.code===code&&b.date===date&&b.status==='open'&&inSeg928(b)})}catch(_){}\n  mile=mbids().filter(function(b){return b.code===code&&b.date===date&&b.status==='open'&&inSeg928(b)});",1);
/* 票價（旅客實付）：查不到訂位的出價一律估算（原本只估 demoR922） */
RL('ticket paid all bids','kgm-0905b-r161',"    if(!bid.demoR922)return 0;\n","    /* 0928B：查不到訂位的出價一律依該段票價估算（原本只估 demoR922，早期模擬出價一律顯示「—」） */\n",1);
RL('ticket paid seg','kgm-0905b-r161',"      if(!x||x.via||x.code!==bid.code)return false;","      if(!x||x.via||x.code!==bid.code)return false;\n      if(bid.fr&&(x.fr!==bid.fr||x.to!==bid.to))return false;   /* 0928B：看出價那一段 */",1);
/* 模擬出價：每一段各自一組 */
R('sim has9 seg',"function has9(arr,code,date){\n    for(var i=0;i<(arr||[]).length;i++){var b=arr[i];if(b&&b.code===code&&b.date===date)return true}",
"function has9(arr,code,date,fr,to){\n    for(var i=0;i<(arr||[]).length;i++){var b=arr[i];if(b&&b.code===code&&b.date===date&&(!fr||!b.fr||(b.fr===fr&&b.to===to)))return true}   /* 0928B：以航段判斷 */",1);
R('sim has9 cash',"has9(S.residenceBidsR83,code,date)","has9(S.residenceBidsR83,code,date,f.fr,f.to)",2);
R('sim has9 miles',"has9(S.resMileBidsR161,code,date)","has9(S.resMileBidsR161,code,date,f.fr,f.to)",2);
R('sim has9 big',"has9(S.bigDeals,code,date)","has9(S.bigDeals,code,date,f.fr,f.to)",1);
R('sim seed seg',"      var seed=H9(code+'|'+date);\n      var tp=typeOf9(f,date);",
"      try{if(window.kgmAucSegFixR928)window.kgmAucSegFixR928()}catch(_){}\n      var seed=H9(code+'|'+date+((window.kgmAucSegsR928&&window.kgmAucSegsR928(code).length>1)?('|'+f.fr+f.to):''));   /* 0928B：經停航班每一段各自一組 */\n      var tp=typeOf9(f,date);",1);
R('sim push cash x',"S.residenceBidsR83.push({id:'RBX922'+(seed%99999)+ci9,code:code,date:date,","S.residenceBidsR83.push({id:'RBX922'+(seed%99999)+ci9,code:code,date:date,fr:f.fr,to:f.to,",1);
R('sim push miles x',"S.resMileBidsR161.push({id:'RMX922'+(seed%99999)+mi9,code:code,date:date,","S.resMileBidsR161.push({id:'RMX922'+(seed%99999)+mi9,code:code,date:date,fr:f.fr,to:f.to,",1);
R('sim push cash',"S.residenceBidsR83.push({id:'RB922'+(seed%99999)+i,code:code,date:date,","S.residenceBidsR83.push({id:'RB922'+(seed%99999)+i,code:code,date:date,fr:f.fr,to:f.to,",1);
R('sim push miles',"S.resMileBidsR161.push({id:'RM922'+(seed%99999)+j,code:code,date:date,","S.resMileBidsR161.push({id:'RM922'+(seed%99999)+j,code:code,date:date,fr:f.fr,to:f.to,",1);
R('sim push big',"S.bigDeals.push({id:'BD922'+(seed%99999)+k,code:code,date:date,","S.bigDeals.push({id:'BD922'+(seed%99999)+k,code:code,date:date,fr:f.fr,to:f.to,",1);
R('sim query date legs',"allF9().forEach(function(f){if(f&&!f.via)n+=window.kgmEnsureAuctionsR922(f.code,q)});","allF9().forEach(function(f){if(f&&!f.via)n+=window.kgmEnsureAuctionsR922(f.code,q,f)});",1);
R('sim query 10d legs',"allF9().forEach(function(f){if(f&&!f.via)n+=window.kgmEnsureAuctionsR922(f.code,dd)});","allF9().forEach(function(f){if(f&&!f.via)n+=window.kgmEnsureAuctionsR922(f.code,dd,f)});",1);
R('sim query code legs',"        for(var d=1;d<=45;d++)n+=window.kgmEnsureAuctionsR922(c,D9(today,d));",
"        /* 0928B：每一段都補 */\n        var legs928=allF9().filter(function(x){return x&&!x.via&&x.code===c}),segs928={};\n        legs928=legs928.filter(function(x){var k=x.fr+x.to;if(segs928[k])return false;segs928[k]=1;return true});\n        for(var d=1;d<=45;d++){var dd928=D9(today,d);if(legs928.length>1)legs928.forEach(function(l){n+=window.kgmEnsureAuctionsR922(c,dd928,l)});else n+=window.kgmEnsureAuctionsR922(c,dd928)}",1);
