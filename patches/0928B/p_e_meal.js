/* 0928B · 經濟艙與豪華經濟艙餐點：只有兩款＋宗教特別餐（使用者：「經濟艙和豪經艙餐點都只有兩個選項和宗教特別餐而已沒有那麼多」）
   ① 旅客端：豪經原本 3 款（第 3 款網路限定）→ 2 款；同一班的菜單只看航班與艙等（原本連「去程／回程」都拿來當種子，
      同一班不同旅客看到不同菜單）。
   ② 後台：旅客名單的「餐點」欄與「餐點統計」原本各算各的（名單把「素食」「兒童餐」原樣印出、沒選的隨機塞五道菜之一；
      統計另外對照一張表），同一位旅客兩邊不一樣。改成同一個來源：
      · 真實訂位：旅客選了什麼就是什麼，沒選就是「未選餐」；
      · 模擬旅客：從「這一班、這個艙等旅客看得到的那幾道」或宗教餐裡挑，兒童餐只給兩歲以上未滿十二歲的旅客；
      · 餐點統計直接數旅客名單。 */
R('menu eco/prem 2',
"mealMenuFor=function(segKey,cabin){var code=String(S._mealFlightCode||'KX000'),seed=code+'|'+segKey+'|'+cabin,base=rotatePick0817(FEAST_POOL_0817,8,seed);if(cabin==='Economy')return base.slice(0,2).map(function(x){x.online=false;return x;});if(cabin==='Premium')return base.slice(0,3).map(function(x,i){x.online=i===2;return x;});",
"mealMenuFor=function(segKey,cabin){var code=String(S._mealFlightCode||'KX000'),seed=code+'|'+cabin,base=rotatePick0817(FEAST_POOL_0817,8,seed);if(cabin==='Economy')return base.slice(0,2).map(function(x){x.online=false;return x;});if(cabin==='Premium')return base.slice(0,2).map(function(x){x.online=false;return x;});   /* 0928B：經濟／豪經都是 2 款＋宗教餐；同一班同一艙等只有一份菜單 */",1);
R('menu header text',
"(Z?'機上饗宴依航班輪替；豪經 1 款、商務／頭等 5 款標示為網路限定。':'Menus rotate by flight. Premium offers one online-exclusive choice; Business / First offer five online-exclusive choices.')",
"(Z?'機上饗宴依航班輪替；經濟艙與豪華經濟艙各 2 款，另可選宗教餐；商務／頭等 5 款標示為網路限定。':'Menus rotate by flight. Economy and Premium Economy offer two dishes plus religious meals; Business / First offer five online-exclusive choices.')",1);
/* 共用：某一班某艙等旅客看得到的菜色；某位旅客（模擬）的餐點 */
R('meal helpers',
"return base.slice(0,2);};\nmanagedMealPage0813=function(b,seg){var info=bookingSegInfo0813(b,seg);",
"return base.slice(0,2);};\nwindow.kgmCabinMenuR928=function(code,cabin){var keep=S._mealFlightCode;try{S._mealFlightCode=code;return (mealMenuFor('out',cabin)||[]).map(function(m){return m.nm})}catch(_){return []}finally{S._mealFlightCode=keep}};\n"
+"window.kgmPaxMealR928=function(x,f,date){\n"
+"  if(!x)return '';\n"
+"  if(x.real)return x.meal||'';                       /* 真實訂位：選什麼就是什麼，沒選就是未選餐 */\n"
+"  var cab=/resident/i.test(x.cabin)?'Resident':/first|suite/i.test(x.cabin)?'First':/business/i.test(x.cabin)?'Business':/premium/i.test(x.cabin)?'Premium':'Economy';\n"
+"  var h=0,k=String(x.pnr)+'|'+String(x.name||'')+'|'+String(f&&f.code)+'|'+String(date);for(var i=0;i<k.length;i++)h=((h*31)+k.charCodeAt(i))>>>0;\n"
+"  var NONE={Economy:30,Premium:18,Business:12,First:8,Resident:8}[cab];\n"
+"  if(h%100<NONE)return '';\n"
+"  var raw=String(x.meal||''),R=(typeof RELIGIOUS_MEALS_0815!=='undefined'?RELIGIOUS_MEALS_0815:[]);\n"
+"  function rel(id){var r=R.filter(function(m){return m.id===id})[0];return r?r.nm:''}\n"
+"  if(/hindu|印度/i.test(raw))return rel('HNML')||raw;\n"
+"  if(/kosher|猶太/i.test(raw))return rel('KSML')||raw;\n"
+"  if(/muslim|halal|回教/i.test(raw))return rel('MOML')||raw;\n"
+"  if(/^(veg|素食|蔬食)$/i.test(raw))return rel('BVML')||rel('AVML')||raw;\n"
+"  if(/kids|兒童|儿童/i.test(raw)){var age=99;try{age=(Date.now()-Date.parse(String(x.dob)+'T00:00:00'))/31557600000}catch(_){}if(age>=2&&age<12)return '兒童餐 Child Meal';}\n"
+"  var menu=window.kgmCabinMenuR928(f&&f.code,cab==='Resident'?'First':cab);\n"
+"  return menu.length?menu[(h>>>7)%menu.length]:'';\n"
+"};\n"
+"managedMealPage0813=function(b,seg){var info=bookingSegInfo0813(b,seg);",1);
RL('manifest meal from menu','kgm-r7-admin-ops',
"      x.detailedMeal=x.meal||(['台式三杯雞腿佐薑香米飯','味噌柚香鮭魚佐季節時蔬','紅酒慢燉牛頰佐松露薯泥','泰式打拋豬肉飯','松露野菇寬麵佐帕瑪森起司'][H(x.pnr+f.code)%5]);",
"      x.detailedMeal=(typeof window.kgmPaxMealR928==='function')?window.kgmPaxMealR928(x,f,date):(x.meal||'');   /* 0928B：跟旅客端菜單同一個來源；沒選就是未選餐 */",1);
RL('manifest meal blank label','kgm-r7-admin-ops',
"E(String(x.detailedMeal||'').slice(0,28))",
"(x.detailedMeal?E(String(x.detailedMeal).slice(0,28)):'<span style=\"color:#8a94a0\">'+(z()?'未選餐':'Not chosen')+'</span>')",1);
/* 餐點統計直接數旅客名單（同一份資料） */
R('meal stats pass leg',"window.kgmMealStatsR81(c.f.code,c.date)","window.kgmMealStatsR81(c.f.code,c.date,c.f)",3);
R('meal stats from manifest',
"window.kgmMealStatsR81=function(code,date){\n  var counts={},pax=0,none=0,byCabin={},cabins={};",
"window.kgmMealStatsR81=function(code,date){\n  var counts={},pax=0,none=0,byCabin={},cabins={};\n"
+"  /* 0928B：直接數航班資料的旅客名單（旅客名單與餐點統計同一份資料） */\n"
+"  try{\n"
+"    var f928=arguments[2]||[].concat(FLIGHTS,(S.customFlights||[])).filter(function(x){return x&&!x.via&&x.code===code})[0];\n"
+"    if(f928&&typeof window.manifest7==='function'){\n"
+"      var nc=function(c){c=String(c||'Economy');return /resident/i.test(c)?'Resident':/first|suite/i.test(c)?'First':/business/i.test(c)?'Business':/premium/i.test(c)?'Premium':'Economy'};\n"
+"      (window.manifest7(f928,date)||[]).forEach(function(x){\n"
+"        var c=nc(x.cabin),b=cabins[c]||(cabins[c]={cabin:c,pax:0,counts:{},none:0,rows:[],chosen:0});\n"
+"        pax++;b.pax++;byCabin[c]=(byCabin[c]||0)+1;\n"
+"        var m=x.detailedMeal||'';if(m){b.counts[m]=(b.counts[m]||0)+1;counts[m]=(counts[m]||0)+1}else{b.none++;none++}\n"
+"      });\n"
+"      if(pax){\n"
+"        Object.keys(cabins).forEach(function(c){var b=cabins[c];b.rows=Object.keys(b.counts).map(function(k){return {meal:k,n:b.counts[k]}}).sort(function(a,b){return b.n-a.n});b.chosen=b.rows.reduce(function(s,r){return s+r.n},0)});\n"
+"        var rows928=Object.keys(counts).map(function(k){return {meal:k,n:counts[k]}}).sort(function(a,b){return b.n-a.n});\n"
+"        return {code:code,date:date,pax:pax,rows:rows928,none:none,byCabin:byCabin,cabins:cabins,chosen:rows928.reduce(function(s,r){return s+r.n},0),srcR928:'manifest'};\n"
+"      }\n"
+"    }\n"
+"  }catch(_){}",1);
/* 現場選餐：經濟／豪經就是該班那兩道 */
RL('onboard options per flight','kgm-0901a-r97',
"    var opts=(z()?ONBOARD97[cb]:ONBOARD97_EN[cb])||ONBOARD97.Economy;",
"    var opts=(z()?ONBOARD97[cb]:ONBOARD97_EN[cb])||ONBOARD97.Economy;\n    try{if((cb==='Economy'||cb==='Premium')&&window.kgmCabinMenuR928){var mm=window.kgmCabinMenuR928(code,cb);if(mm.length)opts=mm}}catch(_){}   /* 0928B：跟旅客端同一份菜單（2 款） */",1);
