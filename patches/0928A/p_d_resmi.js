/* 0927D · Residence 里程競標：只能在「艙位升等」用已開票的航段出價（訂位當下不行）；起標里程降低
   使用者：「降低 Residence 里程升等的起標價，按照現在的 Rate 有點太誇張的高了」
          「Residence 競標里程方式是只能透過艙位升等而非訂位時，所以請一起改」
   原本起標：商務艙兌換里程 ×1.6 ×1.30（=164,000，TPE–NRT），升等頁再乘票種倍率 ×1.30 → 213,000；LAX 726,000。
   改成：起標＝這一段的商務艙兌換里程（TPE–NRT 79,000）；持頭等艙沿用 ×0.75；不再乘票種倍率。 */
RL('resmi base','kgm-0905b-r161',
"    var dist=0;\n    try{dist=+f.dist||+f.km||0}catch(_){}\n    if(!dist){try{dist=Math.round((+f.dur||600)*13)}catch(_){dist=8000}}\n    mi=(typeof getAwardMi==='function')?getAwardMi('Business',dist,Object.assign({},f,{date:date})):0;\n    if(mi)mi=Math.round(mi*1.6);                 /* 頭等艙沒有里程表，用商務艙 ×1.6 推 */\n  }catch(_){}\n  if(!mi)mi=200000;\n  return Math.round(mi*1.30/1000)*1000;",
"    var dist=0;\n    try{dist=(typeof distOf==='function'&&f.fr&&f.to)?distOf(f.fr,f.to):0}catch(_){}   /* 0927D：用真正的航段距離 */\n    try{if(!dist)dist=+f.dist||+f.km||0}catch(_){}\n    if(!dist){try{dist=Math.round((+f.dur||600)*13)}catch(_){dist=8000}}\n    mi=(typeof getAwardMi==='function')?getAwardMi('Business',dist,Object.assign({},f,{date:date})):0;\n    /* 0927D：起標＝這一段的商務艙兌換里程（原本 ×1.6 ×1.30，使用者說太高） */\n  }catch(_){}\n  if(!mi)mi=80000;\n  return Math.round(mi/1000)*1000;");
RL('resmi comment','kgm-0905b-r161',
"/* 里程起標價：頭等艙里程 ×1.30，跟現金的算法一致 */",
"/* 里程起標價：0927D 起＝該航段商務艙兌換里程（原本頭等艙里程 ×1.30） */");
R('resmi option',
"    var mi=Math.round(base*fromMul*famMul0920(cls)/1000)*1000;",
"    var mi=Math.round(base*fromMul/1000)*1000;   /* 0927D：Residence 不再乘票種倍率（使用者：起標太高） */");
RL('resmi label','kgm-0905c-r173',
"            +'<i>'+(z()?'哩（頭等艙里程 ×1.30）':'miles')+'</i></div>'",
"            +'<i>'+(z()?'哩（本段商務艙兌換里程；持頭等艙 ×0.75）':'miles (Business award for this sector; ×0.75 from First)')+'</i></div>'");
/* 顯示的起標＝檢查用的起標 */
RL('resmi remember min','kgm-0905c-r173',
"  var bids=cur?myMileBids173(cur.code,cur.date):[];",
"  if(cur)S.resUpgMinR927D={k:cur.code+'|'+cur.date,min:min};   /* 0927D：送出時用同一個數字檢查 */\n  var bids=cur?myMileBids173(cur.code,cur.date):[];");
RL('resmi submit min','kgm-0905c-r173',
"  var r=window.kgmResMileBidR161({f:f,date:date,miles:mi,fallback:fb,\n    pnr:seg.pnr||'',companionPnr:cp});",
"  var _m927D=(S.resUpgMinR927D&&S.resUpgMinR927D.k===code+'|'+date)?S.resUpgMinR927D.min:0;\n  var r=window.kgmResMileBidR161({f:f,date:date,miles:mi,fallback:fb,\n    pnr:seg.pnr||'',companionPnr:cp,minR927D:_m927D,fromUpgradeR927D:true});");
RL('resmi validate min','kgm-0905b-r161',
"  var min=window.kgmResMinMilesR161(f,date);\n  if(miles<min)",
"  var min=(+o.minR927D>0)?+o.minR927D:window.kgmResMinMilesR161(f,date);   /* 0927D：跟升等頁印的起標一致 */\n  if(miles<min)");
/* 只能在艙位升等、用已開票的航段 */
RL('resmi only upgrade','kgm-0907B-r182',
"    window.kgmResMileBidR161=function(o){\n      if(!inPurchase182())\n        return {ok:false,why:z()?'Residence 里程競標一樣只能在購票當下提出；這裡只能取消下注。'\n                               :'Mileage bids for Residence are placed at purchase time only.'};\n      return _mbid182.apply(this,arguments);\n    };",
"    /* 0927D：使用者改規則 —— Residence 里程競標只能透過「艙位升等」、用已開票（有 PNR）的航段出價，訂位當下不行。\n       （原本 0907B 是反過來：只能在購票當下。現金競標仍然只能在購票當下，沒改。） */\n    window.kgmResMileBidR161=function(o){\n      if(S.resModalR161&&S.resModalR161.code)\n        return {ok:false,why:z()?'訂位當下只能用現金出價；Residence 里程競標請在開票後到「艙位升等」出價。'\n                               :'Mileage bids for Residence are placed in the upgrade centre after ticketing.'};\n      if(!(o&&o.pnr))\n        return {ok:false,why:z()?'Residence 里程競標需要已開票的訂位（PNR），請在開票後到「艙位升等」出價。'\n                               :'A ticketed booking is required for a Residence mileage bid.'};\n      return _mbid182.apply(this,arguments);\n    };");
RL('resmi no intent','kgm-0905c-r173',
"    var it=S.resUpgIntentR173;\n    if(it&&it.code&&it.date&&it.date>=T()&&!seen[it.code+'|'+it.date]){",
"    var it=S.resUpgIntentR173;\n    /* 0927D：里程競標只收已開票的航段，訂位流程帶過來、還沒開票的那一班不列 */\n    if(window.KGM_RES_MILE_INTENT_R927D&&it&&it.code&&it.date&&it.date>=T()&&!seen[it.code+'|'+it.date]){");
/* 訂位流程的 Residence 視窗：說明改成開票後到艙位升等，不再從訂位中途跳過去 */
RL('resmi booking pointer','kgm-0905b-r161',
"      +'<p>'+(z()\n        ?'Residence 的里程競標與候補改在「里程升等」那一頁辦理，'\n         +'那裡才看得到你自己的里程、已開票的航段與未得標時的處理方式。'\n         +'這一頁只負責付錢的部分。'\n        :'Residence mileage bidding and waitlisting live in the Mileage upgrade centre.')+'</p>'\n      +'<button class=\"k161-go alt\" onclick=\"kgmResGoUpgradeR161()\">'\n      +(z()?'前往里程升等 →':'Open mileage upgrade →')+'</button>'",
"      +'<p>'+(z()\n        ?'Residence 的里程競標只能在<b>開票之後</b>，到「艙位升等」用已開票的航段出價；'\n         +'訂位當下只收現金出價。完成這次訂位後，在「艙位升等」就看得到這一班。'\n        :'Residence mileage bids are placed in the upgrade centre after ticketing. Only cash bids are taken while booking.')+'</p>'");
