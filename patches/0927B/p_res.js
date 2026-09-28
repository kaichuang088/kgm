/* 0927B · Residence：商務、頭等都能用里程出價；14 天現金截標時若已有現金出價就立刻通知里程未得標 */

/* ── Q7：商務艙與頭等艙都可以出價（該機型要真的有那個艙等） ── */
RL('res elig cabins','kgm-0905c-r173',
 "      if(cb&&cb!=='Business')return false;     /* 只有商務艙可以往 Residence 競標 */",
 "      /* 0927B：商務艙與頭等艙都可以用里程出價 Residence，但該機型要真的有那個艙等 */\n      if(cb&&cb!=='Business'&&cb!=='First')return false;\n      if(cb==='Business'&&!(ac.cabins.biz&&+ac.cabins.biz.seats>0))return false;\n      if(cb==='First'&&!(suite&&+suite.seats>0))return false;");
RL('res elig comment','kgm-0905c-r173',
 "   而且手上這一段是**商務艙**（Residence 是從商務艙往上競標）。 */",
 "   而且手上這一段是**商務艙**（Residence 是從商務艙往上競標）。\n   0927B：使用者確認商務艙、頭等艙都可以出價（該機型有提供的艙等才算）。 */");

/* ── Q8：結標時通知每一筆里程出價的結果；現金優先時寫清楚原因 ── */
RL('res settle notify','kgm-0905b-r161',
 "  mile.forEach(function(b,i){\n    b.status=(by==='miles'&&i===0)?'won':'lost';b.settledAt=new Date().toISOString();\n    if(b.status==='lost')settleFallback161(b);\n  });",
 "  mile.forEach(function(b,i){\n    b.status=(by==='miles'&&i===0)?'won':'lost';b.settledAt=new Date().toISOString();\n    if(b.status==='lost')settleFallback161(b);\n    /* 0927B：每一筆里程出價都通知結果。已經有現金出價時，現金一律優先，\n       起飛前 14 天現金截標當下就公布，不再讓里程出價一路等到 7 天。 */\n    try{\n      b.lostReasonR927=(b.status==='lost')?(by==='cash'?'cash_priority':'lower_value'):'';\n      S.notifs=S.notifs||[];\n      S.notifs.unshift({title:(b.status==='won'?'Residence 里程競標得標 ':'Residence 里程競標未得標 ')+b.code+' '+b.date,\n        message:b.status==='won'\n          ?('您以 '+N(b.miles)+' 哩出價的 '+b.code+'（'+b.date+'）Residence 已得標；比較基準為訂位金額＋里程折現合計 NT$'+N(b.combinedR920||0)+'。')\n          :(by==='cash'\n            ?('本班 Residence 已有現金出價，現金出價一律優先；起飛前 14 天現金截標時即公布：您的里程出價未得標。'+(b.fallbackDone?'（未得標處理：'+fbName(b.fallback)+'）':''))\n            :('本班沒有現金出價，里程出價以「訂位金額＋里程折現」合計比較，您的合計 NT$'+N(b.combinedR920||0)+' 不是最高：未得標。'+(b.fallbackDone?'（未得標處理：'+fbName(b.fallback)+'）':''))),\n        date:T(),at:new Date().toISOString(),read:false,userId:b.userId||null,type:'residence'});\n    }catch(_){}\n  });");

RL('res auto settle 14d','kgm-0823h-r61',
 "      if(!isFinite(hrs)||hrs>close)return;          /* 還沒到截止時間 */",
 "      /* 0927B：現金競標在起飛前 14 天截止。那時候只要這一班已經有現金出價，\n         現金一定得標，就立刻結標並通知里程出價未得標；沒有現金出價才等到 7 天用里程合併價值比。 */\n      var cashClose=(+window.KGM_RES_CASH_CLOSE_DAYS_R920||14)*24;\n      var hasCash=(S.residenceBidsR83||[]).some(function(x){return x&&x.code===b.code&&x.date===b.date&&x.status==='open'});\n      if(!isFinite(hrs))return;\n      if(hrs>close&&!(hasCash&&hrs<=cashClose))return;          /* 還沒到截止時間 */");
RL('res auto settle comment','kgm-0823h-r61',
 "   「立即結標」。這裡每次進後台與每 5 分鐘掃一次：只處理「已經過截止時間、\n   而且還有 open 出價」的航班。 */",
 "   「立即結標」。這裡每次進後台與每 5 分鐘掃一次：只處理「已經過截止時間、\n   而且還有 open 出價」的航班。\n   0927B：有現金出價的航班在起飛前 14 天（現金截標）就結標並通知里程出價未得標。 */");
RL('res admin text','kgm-0823h-r61',
 "+'沒有任何現金出價時，里程出價以「訂位金額＋里程折現」合併計算，最高者得標。'",
 "+'已有現金出價的航班於現金截標（起飛前 14 天）當下結標，並立即通知里程出價未得標；'\n        +'沒有任何現金出價時，里程出價以「訂位金額＋里程折現」合併計算，最高者得標（商務艙、頭等艙皆可出價）。'");
