from common import *
# ══ 1007A（第二批）：使用者追加 ═════════════════════════════════════════════
#   「Btw地勤和客服要可以針對一個PNR創立案件編號 可能是行李遺失等等 然後後台和前台案件都好醜 要improve not organized」
#   「後台這樣感覺很不像正式後台的網站 包含什麼登入介面 很敏感顯示假的 有可能你想一下怎麼調整嗎 現在我覺得整體功能基本有是有但是太假了」
#   「然後票價是隨時可以更新的（我希望現在是真的浮動的我不知道我沒有檢查這個）再改票或是里程升等甚至酬賓一但票價臨時有更新上面要寫個抱歉票價上漲之類的」
# 全部是在既有的層裡改（沒有新增 <script id> 層）：
#   · 案件：0819J（案件處理中心所在的那一段，沒有 id 的 <script>）—— 用到它內部的 caseRowsJ／caseStatusJ／profileActsR913 等，所以程式放在同一個範圍裡。
#   · 員工入口與報價保護：最後一層 r229 的尾端。
#   · 票價即時浮動：營收管理 kgmRmR929（主程式）；搜尋頁艙位庫存同批次快取：r54。
CUR=open('/tmp/j/kgm1007A_w63.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
CASE=open('js/case7.js',encoding='utf-8').read()
ADM=open('js/adm7.js',encoding='utf-8').read()
FARE=open('js/fare7.js',encoding='utf-8').read()
assert '</script' not in CASE+ADM+FARE

# ── 1. 案件 ──────────────────────────────────────────────────────────────
RW('case7 module',
   "window.kgmCaseOpenRowsR1004B=function(){try{return caseRowsJ().filter(function(r){return !caseClosedJ(r)})}catch(_){return []}};",
   "window.kgmCaseOpenRowsR1004B=function(){try{return caseRowsJ().filter(function(r){return !caseClosedJ(r)})}catch(_){return []}};\n"+CASE)
RW('case7 center',
   "function caseCenterJ(){\n  var q=String(S.caseFilter0831B||'').toUpperCase();",
   "function caseCenterJ(){try{return caseCenter7J()}catch(e){try{console.warn('case7',e)}catch(_){}}return caseCenterOld7J()}   /* 1007A：清單＋明細版；出錯才退回舊版 */\n"
   "function caseCenterOld7J(){\n  var q=String(S.caseFilter0831B||'').toUpperCase();")
RW('case7 rows source',
   "add(S.profileChangeCases0815,'profile','會員資料變更');add(S.milesPurchaseCases0809D,'miles','里程購買');",
   "add(S.profileChangeCases0815,'profile','會員資料變更');add(S.milesPurchaseCases0809D,'miles','里程購買');\n"
   "  add(S.staffCasesR1007A,'staff','地勤／客服案件');   /* 1007A：地勤／客服針對 PNR 建立的案件 */")
RW('case7 rows label',
   "  rows.sort(function(a,b){return String(b.updated).localeCompare(String(a.updated))});\n  if(caseRowsJ._dirty)",
   "  rows.forEach(function(r){try{case7Label(r)}catch(_){}});   /* 1007A：案件類型一律顯示中文名稱（原本直接印 ground_reissue） */\n"
   "  rows.sort(function(a,b){return String(b.updated).localeCompare(String(a.updated))});\n  if(caseRowsJ._dirty)")
RW('case7 status words',
   "function caseStatusJ(s){return ({received:'已受理',",
   "function caseStatusJ(s){return ({investigating:'調查處理中',awaiting_customer:'等待旅客回覆',resolved:'已解決',received:'已受理',")
RW('case7 public view',
   "window.caseLookupView0831B=function(){\n  /* 0913A",
   "window.caseLookupView0831B=function(){var st7=S.caseLookup0831B||{};if(st7.result){try{return caseFile7J(st7)}catch(e){try{console.warn('case7',e)}catch(_){}}}return caseLookupOld7J.apply(this,arguments)};   /* 1007A：查到案件後的頁面重做 */\n"
   "var caseLookupOld7J=function(){\n  /* 0913A")
RW('case7 state',
   'xSold:LS.get("kgm7_xsold",{}),',
   'xSold:LS.get("kgm7_xsold",{}),staffCasesR1007A:LS.get("kgm7_staffcases",[]),   /* 1007A：地勤／客服建立的案件（前後台同步） */')
RW('case7 save',
   'LS.set("kgm7_xsold",S.xSold||{});',
   'LS.set("kgm7_xsold",S.xSold||{});LS.set("kgm7_staffcases",S.staffCasesR1007A||[]);')
T='kgm-0909B-r217'
RC('case7 trip card',T,
   "      +(window.kgmDhTripHtmlR1007A?window.kgmDhTripHtmlR1007A(b):'')   /* 1007A：組員調位造成的艙等異動＋免費改搭 */\n",
   "      +(window.kgmDhTripHtmlR1007A?window.kgmDhTripHtmlR1007A(b):'')   /* 1007A：組員調位造成的艙等異動＋免費改搭 */\n"
   "      +(window.kgmCaseTripHtmlR1007A?window.kgmCaseTripHtmlR1007A(b):'')   /* 1007A：這個訂位的服務案件 */\n")
RC('case7 trip key',T,
   "      +'|'+(b.dhBumpR1007A||[]).map(function(a){return a.status}).join('');",
   "      +'|'+(b.dhBumpR1007A||[]).map(function(a){return a.status}).join('')\n      +'|'+(window.kgmCaseTripKeyR1007A?window.kgmCaseTripKeyR1007A(b):'');")

# ── 2. 員工入口：寄信服務診斷只放在「系統設定」 ─────────────────────────────
RC('adm7 mail panel tab','kgm-0823h-r61',
   "        if(tab!=='status')return h;\n        if(h.indexOf('k61-mail')>=0)return h;",
   "        if(tab!=='syscfg')return h;   /* 1007A：寄信服務的技術診斷（Worker 網址、錯誤碼）只放在系統設定，不攤在航班狀態首頁 */\n        if(h.indexOf('k61-mail')>=0)return h;")

# ── 3. 票價即時浮動 ─────────────────────────────────────────────────────────
RW('fare7 rm intraday key',
   '    var key=(f.code||"")+"|"+f.fr+f.to+"|"+date+"|"+asOf;',
   '    /* 1007A：當天的報價每 3 小時重新最佳化一次（同一時段內固定，不會一重整就跳價），而且真實訂位會推高需求：\n'
   '       過去 24 小時這一班每賣出一位，壓力往上加（最多約 1.6 階）。前後台同一個公式、同一份訂位資料，看到的價格一致。 */\n'
   '    var today7=todayISO(),slot7=-1,sold7=0,intra7=0;\n'
   '    if(asOf===today7){slot7=Math.floor(new Date().getUTCHours()/3);try{sold7=window.kgmRmSoldR1007A?+window.kgmRmSoldR1007A(f,date)||0:0}catch(_){}\n'
   '      intra7=((kgmRmHashR929((f.code||"")+"|"+date+"|"+asOf+"|"+slot7)%1000)/1000-0.5)*1.0+Math.min(1.6,sold7*0.4)}\n'
   '    var key=(f.code||"")+"|"+f.fr+f.to+"|"+date+"|"+asOf+"|"+slot7+"|"+sold7;')
RW('fare7 rm intraday idx',
   "var st=KGM_RM_R929.steps,idx=Math.round(3+2.2*(0.5*lg(P0.p)+0.3*lg(P1.p)+0.2*lg(P2.p)));",
   "var st=KGM_RM_R929.steps,idx=Math.round(3+2.2*(0.5*lg(P0.p)+0.3*lg(P1.p)+0.2*lg(P2.p))+intra7);")
# owPrice 的記憶原本只看「同一班、同一天、同人數」，一直查同一班時會一直回舊價（後台改價、即時浮動都看不到）。
#   改成每個工作（setTimeout 0）開頭清一次：同一次畫面內照樣只算一次，下一個動作就是新價格。
RW('fare7 owprice memo per task',
   "  if(_owMemoKey!==_k){_owMemoKey=_k;_owMemo={};}",
   "  if(!owPrice.t7){owPrice.t7=1;_owMemoKey='';setTimeout(function(){owPrice.t7=0},0)}   /* 1007A：價格記憶只在同一個工作內有效 */\n  if(_owMemoKey!==_k){_owMemoKey=_k;_owMemo={};}")
# 搜尋頁效能：同一個工作內同一班同一艙只算一次庫存（原本每個訂位代號、每個票價家族都重建一次整班模擬旅客名單；
#   1006A「基本先賣完」之後每畫一次搜尋頁要 6.5 秒在這裡，vfy6 H31 的換頁動畫因此被蓋掉）。
#   鍵含訂位筆數、選位保留、這班的 DH 與 Residence 出價數；工作結束（setTimeout 0）就清掉，不跨任何使用者操作。
RC('perf inv54 memo','kgm-0823c-r54',
   "function cabinInventory54(f,date,cabin,excludePnr){\n",
   "function cabinInventory54(f,date,cabin,excludePnr){\n"
   "  var mk7=null;try{if(f&&!f.via){mk7=[f.code,date,f.fr,f.to,cabin,excludePnr||'',(S.bookings||[]).length,Object.keys(S.seatHoldsR4||{}).length,((S.crewPositioningR121||{})[[date,f.code,f.fr,f.to].join('|')]||[]).length,(S.residentBids||[]).length].join('|');\n"
   "    var C7=cabinInventory54.c7;if(!C7){C7=cabinInventory54.c7={};setTimeout(function(){cabinInventory54.c7=null},0)}var h7=C7[mk7];if(h7)return Object.assign({},h7,{seats:h7.seats.slice(),fareCounts:Object.assign({},h7.fareCounts)})}}catch(_){mk7=null}   /* 1007A：同批次快取 */\n")
RC('perf inv54 store','kgm-0823c-r54',
   "  return {type:type,cabin:cabin,capacity:slots.length,sold:rows.length,left:left,seats:free.slice(0,left),fareCounts:fareCounts};\n}\nwindow.kgmCabinInventory54=cabinInventory54;",
   "  var res7={type:type,cabin:cabin,capacity:slots.length,sold:rows.length,left:left,seats:free.slice(0,left),fareCounts:fareCounts};\n"
   "  if(mk7&&cabinInventory54.c7){cabinInventory54.c7[mk7]=res7;return Object.assign({},res7,{seats:res7.seats.slice(),fareCounts:Object.assign({},fareCounts)})}\n"
   "  return res7;\n}\nwindow.kgmCabinInventory54=cabinInventory54;")

# 酬賓／升等哩程：同一班過去 24 小時的真實售出也往上推（每位 +2%，最多 +12%；仍在原本 ±20% 的上下限內）。沒有真實訂位時數字不變。
RW('fare7 award miles demand',
   "    try{if(typeof isPartnerFlight0817==='function'&&isPartnerFlight0817(f))m*=1.15;}catch(_){}\n",
   "    try{if(typeof isPartnerFlight0817==='function'&&isPartnerFlight0817(f))m*=1.15;}catch(_){}\n"
   "    try{var s7=(f&&f.code&&f.date&&window.kgmRmSoldR1007A)?+window.kgmRmSoldR1007A(f,f.date)||0:0;if(s7>0)m*=1+Math.min(0.12,s7*0.02)}catch(_){}   /* 1007A：真實售出推高酬賓／升等哩程 */\n")
# 里程折抵（r229 裡的 0922）：原本只看「最外層是不是折抵」，政策閘門補掛之後這裡又包一次 —— 1004B 實測鏈上 2 層，
#   旅客用里程折抵會被折兩次、扣兩次里程；扣里程也在付款驗證之前就做（卡號沒填也扣），而且記到「上一筆」訂位上。
#   改成：鏈上任何一層已是折抵就不再包；W 標出裡層（__inner914）讓政策閘門也認得；訂位真的成立後才扣里程、記到這一筆。
RC('off922 dedupe','kgm-0909E-r229',
   "    if(typeof window.doPay!=='function'||window.doPay.__off922)return;\n    var _p=window.doPay;",
   "    if(typeof window.doPay!=='function')return;\n"
   "    for(var f7=window.doPay,i7=0;f7&&i7<16;i7++){if(f7.__off922)return;f7=f7.__inner914||f7._rawGate914}   /* 1007A：鏈上任何一層已是折抵就不再包 */\n"
   "    var _p=window.doPay;")
RC('off922 inner mark','kgm-0909E-r229',
   "    W.__off922=1;window.doPay=W;try{doPay=W}catch(_){}",
   "    W.__off922=1;W.__inner914=_p;window.doPay=W;try{doPay=W}catch(_){}")
RC('off922 deduct after booking','kgm-0909E-r229',
   "      if(use>0){\n        try{\n          var u=(S.users||[]).filter(function(x){return x&&S.user&&x.id===S.user.id})[0]||S.user;\n",
   "      if(use>0){var _t7=0;(function _ded7(){   /* 1007A：訂位真的成立（筆數增加）才扣里程；付款沒過就不扣 */\n"
   "        if(!((S.bookings||[]).length>_nb)){if(++_t7<80)setTimeout(_ded7,250);return}\n"
   "        try{\n          var u=(S.users||[]).filter(function(x){return x&&S.user&&x.id===S.user.id})[0]||S.user;\n")
RC('off922 deduct close','kgm-0909E-r229',
   "          S.mileOffsetR922=0;\n          try{save()}catch(_){}\n        }catch(_){}\n      }\n      return r;",
   "          S.mileOffsetR922=0;\n          try{save()}catch(_){}\n          try{if(S.view==='booking')render()}catch(_){}\n        }catch(_){}\n      })()}\n      return r;")

# r44 的畫面內價格快取（每次 render／save 才清）：付款那一刻重算改票差額之前要先清，不然會拿到這次畫面裡的舊價
RC('r44 expose price cache clear','kgm-0818a-r44',
   "function flushR44(){C_SF={};C_AC={};C_OW={}} /* state actually changed */\n",
   "function flushR44(){C_SF={};C_AC={};C_OW={}} /* state actually changed */\n"
   "window.kgmPriceCacheClearR1007A=clearR44;   /* 1007A：付款前重算報價用 */\n")

# ── 4. 員工入口＋報價保護（最後一層尾端） ─────────────────────────────────
SOLD=('/* 1007A：營收管理用的「過去 24 小時真實售出」（同一個工作內只掃一次訂位） */\n'
 '(function(){var SOLD7=null;window.kgmRmSoldR1007A=function(f,date){\n'
 '  if(!SOLD7){SOLD7={};var cut=Date.now()-864e5;try{(S.bookings||[]).forEach(function(b){\n'
 '    if(!b||b.dhR929||b.stx||b.staffTix||b.staffPricing||/cancel|refund|fail/.test(String(b.status||\"\")))return;var t=Date.parse(b.bookedAt||"");if(!(t>cut))return;\n'
 '    var n=(b.paxList||[]).filter(function(p){return p&&p.passengerType!=="INF"}).length||1;\n'
 '    (typeof window.segs7==="function"?window.segs7(b,true):[]).forEach(function(s){var sf=s&&s.f;if(sf&&sf.code){var k=sf.code+"|"+(s.date||sf.date);SOLD7[k]=(SOLD7[k]||0)+n}})})}catch(_){}\n'
 '    setTimeout(function(){SOLD7=null},0)}\n'
 '  return (f&&SOLD7[f.code+"|"+date])||0};})();\n')
RC('adm7+fare7','kgm-0909E-r229',
   "try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();\n",
   "try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();\n"+ADM+"\n"+SOLD+FARE+"\n")
save('p_h_r7b.js','/* 1007A（第二批）· 地勤／客服建立案件、案件頁重做、員工入口、票價即時浮動與「票價已更新」提示 */\n')
