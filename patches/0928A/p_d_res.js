/* 0927D · Residence：備案用表格選艙等×方案；送出後直接到下一頁；行程管理看狀態、截止前可撤回 */
const SNIPR927D=require('fs').readFileSync(require('path').join(__dirname,'snip_res.js'),'utf8');
/* r161 第二步：原本的下拉選單留著（送出、稽核都讀它），但藏起來，由表格寫入 */
RL('res select hidden','kgm-0905b-r161',
"        +'<select id=\"k161alt\" class=\"inp\"><option value=\"\">'+(z()?'— 請選擇 —':'— choose —')+'</option>'",
"        +'<select id=\"k161alt\" class=\"inp\"'+(window.kgmResAltTableR927D?' style=\"display:none\"':'')+'><option value=\"\">'+(z()?'— 請選擇 —':'— choose —')+'</option>'");
RL('res select keep choice','kgm-0905b-r161',
"          return '<option value=\"'+E(a.k)+'\">'+E(nm+pr)+'</option>'}).join('')\n        +'</select></label>'",
"          return '<option value=\"'+E(a.k)+'\"'+((S.resModalR161&&S.resModalR161.altR927D===a.k)?' selected':'')+'>'+E(nm+pr)+'</option>'}).join('')\n        +'</select></label>'\n      /* 0927D：艙等 × 方案表格，旅客自己按 */\n      +(window.kgmResAltTableR927D?window.kgmResAltTableR927D(f,date):'')");
/* r182：表格、選擇、行程管理 */
RL('res snippet','kgm-0907B-r182',
"/* ── ⑤ 備選艙等的說明與金額 ────────────────────────────────────── */",
SNIPR927D+"/* ── ⑤ 備選艙等的說明與金額 ────────────────────────────────────── */");
RL('res alt text zh','kgm-0907B-r182',
"        ?('未得標時改搭 <b>'+E(ALTCAB182[k])+'</b>，票種一律是<b>超值</b>（'+E(ap?ap.code:'')+'），'",
"        ?('未得標時改搭 <b>'+E(ALTCAB182[k])+'</b>，票種 <b>'+E((ap&&FARES[ap.code]&&FARES[ap.code].tier)||'')+'</b>（'+E(ap?ap.code:'')+'，依你在表格選的那一格），'");
RL('res alt text en','kgm-0907B-r182',
"        :('Fallback: <b>'+E(ALTCAB182[k])+'</b>, always the Value fare ('+E(ap?ap.code:'')+'), '",
"        :('Fallback: <b>'+E(ALTCAB182[k])+'</b>, '+E((ap&&FARES[ap.code]&&FARES[ap.code].tierEN)||'')+' fare ('+E(ap?ap.code:'')+'), '");
/* 送出後：出價真的記下來（有 id）就直接回訂位流程的下一步，不再停在「選下一段」 */
RL('res submit next page','kgm-0907B-r182',
"    +(z()?'\\n結果公布：':'\\nResult: ')+_pub);\n  m.step=3;try{save()}catch(_){}\n  try{window.kgmResRepaintR161&&window.kgmResRepaintR161()}catch(_){}\n};",
"    +(z()?'\\n結果公布：':'\\nResult: ')+_pub);\n  /* 0927D：使用者「送出競標以後會自動跳往下一頁，不會回到選第二個航段頁面，因為既然已經選了」。\n     這一段已經用備案票價選進訂位 → 直接走訂位流程的下一步（來回且回程還沒選：選回程；否則：旅客資料）。 */\n  if(r.bid&&r.bid.id&&typeof window.kgmResFinishR161==='function'){try{save()}catch(_){}window.kgmResFinishR161();return}\n  m.step=3;try{save()}catch(_){}\n  try{window.kgmResRepaintR161&&window.kgmResRepaintR161()}catch(_){}\n};");
/* 表格已經有標題，原本的「未得標時的替代方案」字樣就不重複；說明框放到表格下面 */
RL('res label text','kgm-0905b-r161',
"      +'<label>'+(z()?'未得標時的替代方案':'Fallback')\n        +'<select id=\"k161alt\"",
"      +'<label>'+(window.kgmResAltTableR927D?'':(z()?'未得標時的替代方案':'Fallback'))\n        +'<select id=\"k161alt\"");
RL('res hint after table','kgm-0907B-r182',
"    var host=sel.parentNode&&sel.parentNode.parentNode;\n    if(host)host.insertBefore(d,sel.parentNode.nextSibling);",
"    var host=sel.parentNode&&sel.parentNode.parentNode;\n    var tb927D=host&&host.querySelector('.k927d-alt');   /* 0927D：說明框放在備案表格下面 */\n    if(host)host.insertBefore(d,tb927D?tb927D.nextSibling:sel.parentNode.nextSibling);");
/* 付款頁的 Residence 說明、付款成功後記 PNR：都先對一次目前的去回程 */
R('res pay note sync',
"function kgmPayResNoteR923(){\n  try{\n    var m=S.resBidSegR923;if(!m||!(m.out||m.inb))return '';",
"function kgmPayResNoteR923(){\n  try{\n    try{if(window.kgmResBidSegSyncR927D)window.kgmResBidSegSyncR927D()}catch(_){}   /* 0927D：不是這一趟的出價不列 */\n    var m=S.resBidSegR923;if(!m||!(m.out||m.inb))return '';");
RL('res pay link sync','kgm-0909E-r229',
"      var _cc4='',_nb=(S.bookings||[]).length,_rs=S.resBidSegR923;",
"      try{if(window.kgmResBidSegSyncR927D)window.kgmResBidSegSyncR927D()}catch(_){}   /* 0927D：只把這一趟的出價記到這筆訂位 */\n      var _cc4='',_nb=(S.bookings||[]).length,_rs=S.resBidSegR923;");
