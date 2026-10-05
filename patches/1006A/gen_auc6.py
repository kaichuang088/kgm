from common import *
# ══ 1006A #47：Big Deal 一律只能往上一個艙等 ══
#   根因：kgmBigDealTargetsR929 把「所有比原艙等高、符合條件的艙等」全部列出來，
#   所以經濟艙可以直接標頭等（KX304 經濟→頭等、豪經→頭等）。模擬出價的原艙等也是從「所有較低艙等」隨機挑。
#   改成：只看這架飛機「上面一個有的艙等」（沒有豪經的機型 經濟→商務），那一個艙等不符合 BigDeal 條件就沒有 BigDeal。
#   第 4 個參數 all===true 才回傳全部（只給產生模擬出價用，再各自配「下面一個艙等」當原艙等）。
RL('bd targets one-up','kgm-0909E-r229',
 "  window.kgmBigDealTargetsR929=function(f,date,fromCab){\n"
 "    var out=[],tp=typeOf(f,date),dist=0;try{dist=distOf(f.fr,f.to)}catch(_){}\n"
 "    var i0=ORDER.indexOf(fromCab||'Economy');\n"
 "    ORDER.slice(i0+1).forEach(function(cab){\n"
 "      if((cab==='Premium'||cab==='Business')&&dist<4000)return;          /* 豪經／商務：長程 */\n"
 "      if(cab==='Resident'&&(tp!=='A388'||resBids(f,date)>0))return;       /* Residence：A380，且沒有人用現金或里程競標過 */\n"
 "      if(noCab(tp,cab))return;                                           /* 1004A：機型沒有這個艙等 */\n"
 "      var iv=inv(f,date,cab);if(!iv.capacity)return;\n",
 "  window.kgmBigDealTargetsR929=function(f,date,fromCab,all1006A){\n"
 "    var out=[],tp=typeOf(f,date),dist=0;try{dist=distOf(f.fr,f.to)}catch(_){}\n"
 "    var i0=ORDER.indexOf(fromCab||'Economy'),next1006A=false;\n"
 "    ORDER.slice(i0+1).forEach(function(cab){\n"
 "      if(next1006A&&all1006A!==true)return;                              /* 1006A：只能往上一個艙等 */\n"
 "      if(noCab(tp,cab))return;                                           /* 1004A：機型沒有這個艙等 */\n"
 "      var iv=inv(f,date,cab);if(!iv.capacity)return;\n"
 "      next1006A=true;                                                    /* 1006A：這就是「上面一個艙等」 */\n"
 "      if((cab==='Premium'||cab==='Business')&&dist<4000)return;          /* 豪經／商務：長程 */\n"
 "      if(cab==='Resident'&&(tp!=='A388'||resBids(f,date)>0))return;       /* Residence：A380，且沒有人用現金或里程競標過 */\n")
RL('bd seed all targets','kgm-0909E-r229',
 "window.kgmBigDealTargetsR929(f,date,'Economy').forEach(function(t,ti){",
 "window.kgmBigDealTargetsR929(f,date,'Economy',true).forEach(function(t,ti){")
RL('bd seed from = one below','kgm-0909E-r229',
 "}catch(_){return c==='Economy'}});\n              for(var k=0;k<nb;k++){",
 "}catch(_){return c==='Economy'}}).slice(-1);   /* 1006A：出價者的原艙等＝目標艙等下面一個艙等 */\n              for(var k=0;k<nb;k++){")
RL('bd seed mark','kgm-0909E-r229',
 "demoR922:true,kindR929:1});",
 "demoR922:true,kindR929:1,oneUp1006A:1});")
RL('bd seed migrate','kgm-0909E-r229',
 "S.bigDeals=S.bigDeals||[];\n          var had929=",
 "S.bigDeals=S.bigDeals||[];\n"
 "          /* 1006A：舊規則產生的模擬 BigDeal（可能跳兩三級）整批清掉，用一級規則重新產生；真的旅客出價不動 */\n"
 "          if(!window.__kgmBdOneUpR1006A){window.__kgmBdOneUpR1006A=1;S.bigDeals=S.bigDeals.filter(function(b){return !(b&&b.demoR922&&b.kindR929&&!b.oneUp1006A)})}\n"
 "          var had929=")

# ══ 1006A #48：Residence 現金出價的備選座位重複（同一班兩個人都是 5A、兩個 5K），而且選退款的也有座位 ══
#   根因：模擬出價的備選座位用出價 id 的雜湊從固定六個座位挑；同一班的 id 只差最後一個字，雜湊幾乎一樣 → 同一個座位。
#   而且清單混了頭等（2A～3K）和商務（5A/5K），跟第二志願的艙等對不上；真的出價也是寫死（頭等 2A、商務 6K）。
#   改成：同一班（同一段）每位出價者一個不重複的座位，座位一定在第二志願那個艙等，優先用還空著的位置；選退款的沒有備選座位。
RL('res seat allocator','kgm-0823h-r61',
 "window.kgmAucSegFixR928=function(){",
 "/* 1006A：Residence 現金出價的備選座位 —— 同一段每人一位、不重複、在第二志願的艙等裡 */\n"
 "var RESSEAT1006A={};\n"
 "window.kgmResSeatFixR1006A=function(){\n"
 "  var n=0,g={},ver=(S.bookings||[]).length;\n"
 "  (S.residenceBidsR83||[]).forEach(function(b){if(!b||!b.code||!b.date)return;var k=b.code+'|'+b.date+'|'+(b.fr||'')+'|'+(b.to||'');(g[k]=g[k]||[]).push(b)});\n"
 "  Object.keys(g).forEach(function(k){\n"
 "    var list=g[k],sig=function(){return ver+'#'+list.map(function(b){return b.id+':'+b.alt+':'+(b.backupSeat||'')}).join(',')};\n"
 "    if(RESSEAT1006A[k]===sig())return;\n"
 "    var b0=list[0],tp='A388';try{tp=acftOfFlight(b0.code,b0.date,b0.fr,b0.to)||'A388'}catch(_){}\n"
 "    var taken={};\n"
 "    try{var sm=simSeatMap(b0.code,b0.date)||{};Object.keys(sm).forEach(function(s){if(sm[s])taken[s]=1})}catch(_){}\n"
 "    try{var rt=realTakenSeats0814({code:b0.code,date:b0.date});Object.keys(rt).forEach(function(s){taken[s]=1})}catch(_){}\n"
 "    var pool={};\n"
 "    ['First','Business'].forEach(function(c){var a=[];try{a=window.kgmCabinSeatsR108(tp,c)||[]}catch(_){}if(!a.length)try{a=window.kgmCabinSeatsR108('A388',c)||[]}catch(_){}\n"
 "      pool[c]=a.filter(function(s){return s!=='1A'})});   /* 1A 是 Residence 得標者的位置 */\n"
 "    var used={},ord=list.slice().sort(function(a,b){return (a.demoR922?1:0)-(b.demoR922?1:0)||String(a.placedAt||'').localeCompare(String(b.placedAt||''))||String(a.id).localeCompare(String(b.id))});\n"
 "    ord.forEach(function(b){\n"
 "      var cab=b.alt==='first'?'First':(b.alt==='business'?'Business':'');\n"
 "      if(!cab){if(b.backupSeat&&b.backupSeat!=='—'){b.backupSeat='';n++}return}\n"
 "      var p=pool[cab]||[],cur=b.backupSeat||'';\n"
 "      if(!(cur&&p.indexOf(cur)>=0&&!used[cur]&&!taken[cur])){\n"
 "        var h=0,s=String(b.id||b.pnr||'');for(var i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;\n"
 "        var pick='',alt2='';\n"
 "        for(var j=0;j<p.length;j++){var x=p[(h+j)%p.length];if(used[x])continue;if(!taken[x]){pick=x;break}if(!alt2)alt2=x}\n"
 "        pick=pick||alt2;   /* 那個艙等都滿了：仍給一個不重複的位置 */\n"
 "        if(pick!==cur){b.backupSeat=pick;n++}\n"
 "      }\n"
 "      if(b.backupSeat)used[b.backupSeat]=1;\n"
 "    });\n"
 "    RESSEAT1006A[k]=sig();\n"
 "  });\n"
 "  return n;\n"
 "};\n"
 "window.kgmAucSegFixR928=function(){")
RL('res seat use allocator','kgm-0823h-r61',
 "b.alt=['business','first','business','refund'][h%4];b.backupSeat=b.backupSeat||['2A','2K','3A','3K','5A','5K'][(h>>>4)%6];n++});",
 "b.alt=['business','first','business','refund'][h%4];n++});\n"
 "    try{n+=window.kgmResSeatFixR1006A()}catch(_){}   /* 1006A：備選座位不重複、在第二志願艙等 */")
# 合併價值：現金出價＝旅客已付票價＋競標金額；BigDeal 多人時再列每位價值（排名是用每位價值比）
RL('auc combined cell','kgm-0823h-r61',
 "+'<td>'+(r.combined?('NT$'+n920(r.combined)):'—')+'</td>'",
 "+'<td>'+(function(){   /* 1006A：現金出價也有總價值（票價＋競標金額）；BigDeal 多人時列每位價值（排名依每位價值） */\n"
 "            var z=z920a(),cv=+r.combined||0;\n"
 "            if(r.kind==='res-cash')cv=(+r.ticket||0)+(+r.amount||0);\n"
 "            if(!cv)return '—';\n"
 "            var s='<span style=\"white-space:nowrap\">NT$'+n920(cv)+'</span>';\n"
 "            if(r.kind==='res-cash')s+='<br><small style=\"white-space:nowrap;color:#8a94a0\">'+(z?'票價＋競標金額':'fare + bid')+'</small>';\n"
 "            if(r.kind==='bigdeal'&&(+r.pax||1)>1)s+='<br><small style=\"white-space:nowrap;color:#8a94a0\">'+(z?'每位 NT$':'per seat NT$')+n920(Math.round(cv/(+r.pax||1)))+'</small>';\n"
 "            return s})()+'</td>'")
save('p_h_auc.js','/* 1006A · Big Deal 只能升一級、Residence 備選座位不重複、現金出價總價值 */\n')
