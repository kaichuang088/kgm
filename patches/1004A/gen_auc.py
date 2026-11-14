import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 競標（Residence 單一得標、Big Deal 里程／現金競標） */
'''
L='kgm-0909E-r229'
# ---- #75：同一航段只能有一個得標；有現金出價就由現金得標，里程全部未得標 ----
RL('auc cash lost',L,"              status:(ci9?'lost':'won'),","              status:'lost',/* 1004A：先全部未得標，下面依金額選出唯一得標 */")
RL('auc mile lost',L,"              fallback:'refund',status:(mi9?'lost':'won'),",
   "              fallback:'refund',status:'lost',/* 1004A：有現金出價就由現金得標，里程出價全部未得標（舊版現金、里程各一筆得標 → 兩個 Won） */")
RL('auc cash top',L,"              demoR922:true});\n          }\n          made++;\n        }\n        if(!has9(S.resMileBidsR161,code,date,f.fr,f.to)){\n          var nM922",
   "              demoR922:true});\n          }\n          /* 1004A：金額最高的那一筆才是得標（舊版固定第一筆得標，不一定最高） */\n          S.residenceBidsR83.filter(function(b){return b&&b.demoR922&&b.code===code&&b.date===date&&b.fr===f.fr&&b.to===f.to})\n            .sort(function(a,b){return (+b.amount||0)-(+a.amount||0)}).forEach(function(b,i){b.status=i?'lost':'won'});\n          made++;\n        }\n        if(!has9(S.resMileBidsR161,code,date,f.fr,f.to)){\n          var nM922")
RL('auc normalize',L,"  window.kgmEnsureAuctionsR922=function(code,date,fObj){\n    var made=0;\n    try{\n",
   """  /* 1004A：已開標的航段只能有一個得標。瀏覽器裡存著的舊模擬資料（現金、里程各一個 Won）也一併整理：
     有現金得標 → 現金只留金額最高的一筆、里程得標全部改成未得標；沒有現金得標才看里程（只留最高里程）。 */
  window.kgmAucOneWinnerR929=function(code,date){
    var fixed=0;
    try{
      var cash=(S.residenceBidsR83||[]).filter(function(b){return b&&b.code===code&&b.date===date});
      var mile=(S.resMileBidsR161||[]).filter(function(b){return b&&b.code===code&&b.date===date});
      var segs={};cash.concat(mile).forEach(function(b){segs[(b.fr||'')+(b.to||'')]=1});
      Object.keys(segs).forEach(function(sg){
        var inSeg=function(b){return ((b.fr||'')+(b.to||''))===sg};
        var cw=cash.filter(function(b){return inSeg(b)&&b.status==='won'}).sort(function(a,b){return (+b.amount||0)-(+a.amount||0)});
        var mw=mile.filter(function(b){return inSeg(b)&&b.status==='won'}).sort(function(a,b){return (+b.miles||0)-(+a.miles||0)});
        cw.slice(1).forEach(function(b){b.status='lost';fixed++});
        if(cw.length)mw.forEach(function(b){b.status='lost';fixed++});
        else mw.slice(1).forEach(function(b){b.status='lost';fixed++});
      });
    }catch(_){}
    return fixed;
  };
  /* 1004A：上面那支每次都要把全部出價掃一遍；後台競標分頁一打開就要補 10 天、約 5,000 班，每班都掃一次 → 光這裡就 1 秒以上。
     要整理的只有瀏覽器裡存著的舊資料（新產生的出價本來就只有一個得標），所以整個工作階段只做一次、一趟分組做完。 */
  window.kgmAucOneWinnerAllR929=function(){
    var g={},fixed=0;
    try{
      var key=function(b){return b.code+'|'+b.date+'|'+(b.fr||'')+(b.to||'')};
      (S.residenceBidsR83||[]).forEach(function(b){if(b&&b.status==='won'){var k=key(b);(g[k]=g[k]||{c:[],m:[]}).c.push(b)}});
      (S.resMileBidsR161||[]).forEach(function(b){if(b&&b.status==='won'){var k=key(b);(g[k]=g[k]||{c:[],m:[]}).m.push(b)}});
      Object.keys(g).forEach(function(k){
        var cw=g[k].c.sort(function(a,b){return (+b.amount||0)-(+a.amount||0)}),mw=g[k].m.sort(function(a,b){return (+b.miles||0)-(+a.miles||0)});
        cw.slice(1).forEach(function(b){b.status='lost';fixed++});
        if(cw.length)mw.forEach(function(b){b.status='lost';fixed++});
        else mw.slice(1).forEach(function(b){b.status='lost';fixed++});
      });
    }catch(_){}
    return fixed;
  };
  window.kgmEnsureAuctionsR922=function(code,date,fObj){
    var made=0;
    try{
      if(!window.__kgmAucOneDoneR929){window.__kgmAucOneDoneR929=1;try{window.kgmAucOneWinnerAllR929()}catch(_){}}
""")
open('p_f_auc.js','w').write(hdr+'\n'.join(out)+'\n')

# ---- #90 BigDeal ----
ENG=open('bd_engine.js',encoding='utf8').read()
RL('bd engine',L,"/* ══ 0922B：競標資料 —— 每一班都要有人競標",ENG+"\n/* ══ 0922B：競標資料 —— 每一班都要有人競標")
SEED_OLD=open('/tmp/j/bdseed_old.txt',encoding='utf8').read()
SEED_NEW=r'''      /* ── BigDeal（1004A）：起飛前 7 天開放、起飛前 48 小時公布。長程豪經／商務、頭等、沒有人競標的 Residence。
            競標人數刻意有時比座位多（Out of Bid 的情況），出價有現金、里程、現金＋里程三種。 ── */
      if(hrs>0&&hrs<=168&&typeof window.kgmBigDealTargetsR929==='function'&&!window.__kgmBdSkipR929){   /* __kgmBdSkipR929：後台第一次打開時超過時間預算，剩下的分段補 */
        var bdk929=code+'|'+date+'|'+f.fr+f.to;
        window.KGM_BD_SEEN_R929=window.KGM_BD_SEEN_R929||{};
        if(!window.KGM_BD_SEEN_R929[bdk929]){
          window.KGM_BD_SEEN_R929[bdk929]=1;
          S.bigDeals=S.bigDeals||[];
          var had929=S.bigDeals.some(function(b){return b&&b.kindR929&&b.code===code&&b.date===date&&b.fr===f.fr&&b.to===f.to});
          if(!had929){
            var ORD929=['Economy','Premium','Business','First','Resident'];
            window.kgmBigDealTargetsR929(f,date,'Economy').forEach(function(t,ti){
              if(t.seats<=0)return;
              var hs=H9(seed+'bd'+t.cab),nb=Math.max(1,Math.min(12,t.seats+((hs%7)-2)));
              var lower=ORD929.slice(0,ORD929.indexOf(t.cab)).filter(function(c){try{return window.kgmBigDealHasCabR929?window.kgmBigDealHasCabR929(f,date,c):window.kgmCabinInventory54(Object.assign({},f,{date:date}),date,c).capacity>0}catch(_){return c==='Economy'}});
              for(var k=0;k<nb;k++){
                var hk=H9(seed+t.cab+'k'+k),from=lower[(hk>>>3)%lower.length]||'Economy';
                var op=window.kgmBigDealOpenPriceR929(f,date,from,t.cab),pax=(hk%7===0)?2:1;
                var tv=Math.round(op.cash*pax*(1+(hk%90)/100)/100)*100,kind=hk%3,cash=0,mi=0;
                if(kind===0)cash=tv;else if(kind===1)mi=Math.ceil(tv/0.30/1000)*1000;else{cash=Math.round(tv*0.5/100)*100;mi=Math.ceil((tv-cash)/0.30/1000)*1000}
                var span=Math.max(1,Math.floor(168-Math.max(hrs,48)));
                S.bigDeals.push({id:'BD929'+(seed%99999)+'_'+ti+'_'+k,code:code,date:date,fr:f.fr,to:f.to,
                  pnr:pnr9(seed+t.cab+k),userId:'KGM'+(400000+(hk%99999)),who:NAMES[(hk+3)%NAMES.length],
                  cabin:from,toCabin:t.cab,amount:cash,miles:mi,pax:pax,status:'open',
                  at:new Date(Date.now()-((hk%span)+(hrs<48?48-hrs:0))*3600000).toISOString(),demoR922:true,kindR929:1});
              }
              try{if(hrs<=48)window.kgmBigDealSettleR929(code,date,f.fr,f.to,t.cab);else window.kgmBigDealRankR929(code,date,f.fr,f.to,t.cab)}catch(_){}
            });
            made++;
          }
        }
      }
'''
RL('bd seed',L,SEED_OLD,SEED_NEW)
# 後台競標管理：BigDeal 列出現金／里程／總價值／目標艙等，分組以「航段＋目標艙等」，組頭顯示 Available Seats 與競標人數
L61='kgm-0823h-r61'
RL('bd rows',L61,"""  try{(S.bigDeals||[]).forEach(function(b){if(!b)return;
    push({kind:'bigdeal',id:b.id||b.pnr,code:b.code||'',date:b.date||'',fr:b.fr||'',to:b.to||'',pnr:b.pnr||'',
      who:b.userId||'',amount:+b.amount||+b.bid||0,miles:0,status:b.status||'pending',""",
 """  try{(S.bigDeals||[]).forEach(function(b){if(!b)return;
    push({kind:'bigdeal',id:b.id||b.pnr,code:b.code||'',date:b.date||'',fr:b.fr||'',to:b.to||'',pnr:b.pnr||'',
      /* 1004A：BigDeal 也有里程出價，合併價值＝現金＋里程折現 */
      miles929:+b.miles||0,combined:(window.kgmBigDealValueR929?window.kgmBigDealValueR929(b):0),fromCabin:b.cabin||'',pax:+b.pax||1,rank:b.rankR929||0,outbidMail:b.outbidMailAt||'',
      who:b.userId||'',amount:+b.amount||+b.bid||0,miles:0,status:b.status||'pending',""")
RL('bd col miles',L61,"          +'<td>'+(r.miles?n920(r.miles):'—')+'</td>'","          +'<td>'+((r.miles||r.miles929)?n920(r.miles||r.miles929):'—')+'</td>'")
RL('bd col 2nd',L61,"            else if(r.kind==='res-miles')t=({refund:z?'全額退還里程':'Refund miles',first90:z?'95% 里程改頭等':'First (95%)',biz95:z?'90% 里程改商務':'Business (90%)'})[r.fallback]||'—';\n            var s=e920(t)+(r.backupSeat?",
  "            else if(r.kind==='res-miles')t=({refund:z?'全額退還里程':'Refund miles',first90:z?'95% 里程改頭等':'First (95%)',biz95:z?'90% 里程改商務':'Business (90%)'})[r.fallback]||'—';\n            else if(r.kind==='bigdeal'){var CZ929={Economy:z?'經濟':'Y',Premium:z?'豪經':'W',Business:z?'商務':'J',First:z?'頭等':'F',Resident:'Residence'};\n              t=(r.fromCabin?(CZ929[r.fromCabin]||r.fromCabin)+'→':'')+(CZ929[r.toCabin]||r.toCabin||'');}   /* 1004A */\n            var s=e920(t)+(r.backupSeat?")
RL('bd col mail',L61,"            return s})()+'</td>'","            if(r.kind==='bigdeal')s='<span style=\"white-space:nowrap;font-weight:800\">'+s+'</span>'+((r.rank||r.pax>1)?'<br><small style=\"white-space:nowrap;color:#8a94a0\">'+(r.rank?(z?'第 '+r.rank+' 名':'#'+r.rank):'')+(r.pax>1?(z?' · '+r.pax+' 位':' · '+r.pax+' pax'):'')+'</small>':'');\n            if(r.kind==='bigdeal'&&r.outbidMail&&(r.status==='outbid'||r.status==='lost'))s+='<br><small style=\"color:#b3123a;font-weight:800\">'+(z?'Out of Bid 通知已寄出':'Out-of-bid email sent')+'</small>';   /* 1004A */\n            return s})()+'</td>'")
RL('bd status opts',L61,"              +['open','won','lost','withdrawn','pending','approved','rejected'].map(function(x){","              +['open','leading','outbid','won','lost','withdrawn','pending','approved','rejected'].map(function(x){   /* 1004A：BigDeal 的座位內／Out of Bid */")
RL('bd grp key',L61,"    var g={};rows.filter(pred).forEach(function(r){var k=r.code+'|'+r.date+'|'+(r.fr?r.fr+'-'+r.to:'');",
  "    var g={};rows.filter(pred).forEach(function(r){var k=r.code+'|'+r.date+'|'+(r.fr?r.fr+'-'+r.to:'')+(r.kind==='bigdeal'?'|'+(r.toCabin||''):'');   /* 1004A：BigDeal 以航段＋目標艙等分組 */")
RL('bd grp head',L61,"+e920(f.date)+'</span>'\n      +((can&&settle)?",
  "+e920(f.date)+'</span>'\n      +((f.kind==='bigdeal'&&window.kgmBigDealRankR929)?(function(){try{var q=window.kgmBigDealRankR929(f.code,f.date,f.fr,f.to,f.toCabin,false),z=z920a();\n        var CZ={Economy:z?'經濟艙':'Economy',Premium:z?'豪華經濟艙':'Premium',Business:z?'商務艙':'Business',First:z?'頭等艙':'First',Resident:'Residence'};\n        var all=(S.bigDeals||[]).filter(function(x){return x&&x.code===f.code&&x.date===f.date&&(!f.fr||x.fr===f.fr)&&(x.toCabin||x.cabin)===f.toCabin&&x.status!=='withdrawn'}),wn=all.filter(function(x){return x.status==='won'}).length;\n        if(!q.bidders&&all.length)return '<em class=\"k929-bdh\">'+e920(CZ[f.toCabin]||f.toCabin||'')+' · '+(z?'已公布 · 得標 ':'Published · won ')+'<b>'+wn+'</b> · '+(z?'競標人數 ':'Bidders ')+'<b>'+all.length+'</b></em>';\n        return '<em class=\"k929-bdh\">'+e920(CZ[f.toCabin]||f.toCabin||'')+' · Available Seats <b>'+q.seats+'</b> · '+(z?'競標人數 ':'Bidders ')+'<b>'+q.bidders+'</b></em>'}catch(_){return ''}})():'')   /* 1004A */\n      +((can&&settle)?")
RL('bd css',L61,"  st.textContent='.k920-auc{max-width:1360px}'","  st.textContent='.k920-auc{max-width:1360px}'\n   +'.k929-bdh{font-style:normal;font-size:11px;color:#6b5a2a;background:#fbf4e2;border:1px solid #ecdcb4;border-radius:999px;padding:3px 10px;margin-left:6px;white-space:nowrap}.k929-bdh b{color:#0b493b}'")
# 行程管理頁：更改／退款區塊之後加 BigDeal 區塊
L217='kgm-0909B-r217'
RL('trip bd html',L217,"      +paxBlock(b)+actsBlock(b)\n","      +paxBlock(b)+actsBlock(b)\n      +(window.kgmBigDealTripHtmlR929?window.kgmBigDealTripHtmlR929(b,segs):'')   /* 1004A：行程管理也要有 BigDeal */\n      +(window.kgmStaffNoticeHtmlR929?window.kgmStaffNoticeHtmlR929(b):'')   /* 1004A：員工票候補通知 */\n")
RL('trip bd key',L217,"      +'|'+String(b.status||'')+'|'+(Z()?'zh':'en');\n    if(box.getAttribute('data-k217')===key)return 0;",
  "      +'|'+String(b.status||'')+'|'+(Z()?'zh':'en')\n      +'|'+(window.kgmBigDealKeyR929?window.kgmBigDealKeyR929(b):'');\n    if(box.getAttribute('data-k217')===key)return 0;")
# 寄信清單補上 BigDeal
R('mail list bd',"  {ev:'upgrade.bigdeal_approved', who:'ext',","  {ev:'bigdeal.bid_received', who:'ext', zh:'BigDeal 出價確認（目前名次）', en:'BigDeal bid received', when:'出價或加碼後'},\n  {ev:'bigdeal.outbid', who:'ext', zh:'BigDeal Out of Bid（排在座位之外）', en:'BigDeal outbid', when:'被更高總價值超越，或座位被直接買走而名額變少'},\n  {ev:'bigdeal.result', who:'ext', zh:'BigDeal 得標／未得標結果', en:'BigDeal result', when:'起飛前 48 小時公布'},\n  {ev:'upgrade.bigdeal_approved', who:'ext',")
RL('bd sort',L61,"||String(a.code).localeCompare(String(b.code))||(b.amount+b.miles)-(a.amount+a.miles)});",
  "||String(a.code).localeCompare(String(b.code))||((a.kind==='bigdeal'&&b.kind==='bigdeal')?((a.rank||999)-(b.rank||999)||(b.combined||0)-(a.combined||0)):((b.amount+b.miles)-(a.amount+a.miles)))});   /* 1004A：BigDeal 依名次（總價值）排 */")
RL('bd header text',L61,"        +'沒有任何現金出價時，里程出價以「訂位金額＋里程折現」合併計算，最高者得標（商務艙、頭等艙皆可出價）。'",
  "        +'沒有任何現金出價時，里程出價以「訂位金額＋里程折現」合併計算，最高者得標（商務艙、頭等艙皆可出價）。'\n        +'BigDeal 於起飛前 7 天開放、起飛前 48 小時公布：長程豪經／商務、頭等艙，以及完全沒有人競標的 Residence 剩餘座位都拿出來競標；可用現金、里程或現金＋里程（1 哩 = NT$0.30），依每位總價值排名，排在 Available Seats 之外的會立即收到 Out of Bid 通知。'")
R('bd notif window','if(h>=48&&h<=120){',"if(h>48&&h<=168&&(!window.kgmBigDealSeatsOkR923||window.kgmBigDealSeatsOkR923(bk,{flight:bk.outF.code,date:bk.outF.date}))){/* 1004A：BigDeal 起飛前 7 天開放 */")
R('bd mail window',"if(nx&&hours>=48&&hours<=120&&_bdOk923){","if(nx&&hours>48&&hours<=168&&_bdOk923){/* 1004A：起飛前 7 天開放 */")
R('bd mail text',"bidWindow:Z()?'起飛前 48–120 小時':'48–120 hours before departure'","bidWindow:Z()?'起飛前 7 天至 48 小時（48 小時前公布結果）':'7 days to 48 hours before departure (results at 48h)'")
R('bd seatsok',"    if(!f)return true;\n    var cur='';try{cur=(FARES[b.outC]||AWARD_FARES[b.outC]||{}).cabin||'Economy'}catch(_){cur='Economy'}\n    var LAD=['Economy','Premium','Business','First'];",
  "    if(!f)return true;\n    /* 1004A：改用 BigDeal 新規則（長程豪經／商務、頭等、沒有人競標的 Residence），任一艙等還有座位就算可以競標 */\n    if(window.kgmBigDealTargetsR929){var cur0='Economy';try{cur0=(FARES[b.outC]||AWARD_FARES[b.outC]||{}).cabin||'Economy'}catch(_){}\n      return window.kgmBigDealTargetsR929(Object.assign({},f,{date:date}),date,cur0).some(function(t){return t.seats>0})}\n    var cur='';try{cur=(FARES[b.outC]||AWARD_FARES[b.outC]||{}).cabin||'Economy'}catch(_){cur='Economy'}\n    var LAD=['Economy','Premium','Business','First'];")
R('bd old txt1',"KGM BigDeal 於起飛前5天開放，起飛前48小時截止。","KGM BigDeal 於起飛前 7 天開放，起飛前 48 小時公布結果。")
R('bd old txt2',"起飛前5天~48小時 · 經濟艙限升豪經 · 豪經限升商務<","起飛前 7 天～48 小時 · 現金／里程／現金＋里程 · 依總價值排名<")
R('bd old txt3',"起飛前5天開放，起飛前48小時截止</div>","起飛前 7 天開放，起飛前 48 小時公布結果</div>")
# 1004A：kgmAucSegFixR928 每次都把三個出價陣列全部掃一遍；BigDeal 模擬出價變多之後，補齊迴圈（約 5,000 班）光這裡就半秒以上
RL('segfix only when needed',L,"      try{if(window.kgmAucSegFixR928)window.kgmAucSegFixR928()}catch(_){}",
"""      /* 1004A：只有陣列換了、或新加入的出價缺航段時才重掃（原本每一班都把全部出價掃一遍） */
      try{if(window.kgmAucSegFixR928){var _a929=[S.residenceBidsR83||[],S.resMileBidsR161||[],S.bigDeals||[]],_m929=window.__kgmSegFixMemoR929;
        var _need929=!_m929||_a929.some(function(a,i){return a!==_m929.a[i]||a.length<_m929.n[i]})||_a929.some(function(a,i){for(var j=_m929.n[i];j<a.length;j++){var b=a[j];if(b&&!b.fr&&b.code&&b.date)return true}return false});
        if(_need929)window.kgmAucSegFixR928();
        window.__kgmSegFixMemoR929={a:_a929,n:_a929.map(function(a){return a.length})}}}catch(_){}""")
# 1004A：後台競標分頁第一次打開（瀏覽器裡還沒有模擬出價）要替 7 天內約 1,600 班產生 BigDeal，一次做完 3 秒以上。
#        沒有搜尋條件時只先做約 0.8 秒（從最近的日期開始，畫面上先顯示的那幾組一定完成），其餘每段 40 毫秒在背景補完再重畫。
RL('bd seed budget',L,"""        for(var d=1;d<=10;d++){
          var dd=D9(today,d);
          allF9().forEach(function(f){if(f&&!f.via)n+=window.kgmEnsureAuctionsR922(f.code,dd,f)});
        }
        return n;""","""        var t0929=Date.now(),P929=window.__kgmBdPendR929||[];
        try{
          for(var d=1;d<=10;d++){
            var dd=D9(today,d);
            allF9().forEach(function(f){if(!f||f.via)return;
              if(!window.__kgmBdSkipR929&&Date.now()-t0929>800)window.__kgmBdSkipR929=1;   /* 1004A：超過預算 → 這一輪先不產生 BigDeal */
              n+=window.kgmEnsureAuctionsR922(f.code,dd,f);
              if(window.__kgmBdSkipR929)P929.push([f.code,dd,f]);
            });
          }
        }finally{window.__kgmBdSkipR929=0}
        if(P929.length&&!window.__kgmBdPendR929){
          window.__kgmBdPendR929=P929;
          (function step929(){
            var Q=window.__kgmBdPendR929;if(!Q)return;var t1=Date.now();
            while(Q.length&&Date.now()-t1<40){var x=Q.shift();try{window.kgmEnsureAuctionsR922(x[0],x[1],x[2])}catch(_){}}
            if(Q.length){setTimeout(step929,30);return}
            window.__kgmBdPendR929=null;
            /* 補完：還停在競標頁、沒有搜尋、也沒有在輸入框打字，才重畫一次（更新組數） */
            try{var ae=document.activeElement;if(S.view==='admin'&&S.adminTab==='auctions'&&!String(S.auctionQR920||'').trim()&&!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)))render()}catch(_){}
          })();
        }
        return n;""")
open('p_f_auc.js','w').write(hdr+'\n'.join(out)+'\n')
