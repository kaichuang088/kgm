from common import *
import base64, importlib.util, json, re
# ══ 1012A ═══════════════════════════════════════════════════════════════════
#   使用者（1010A 交付後）的修改清單，逐項見 notes/1012A-pass117-notes.md。
#   比對基準：1010A 最終版 w26（/tmp/j/kgm1010A_w26.html）。不要改到版號字串（build.sh 最後才換版號）。
CUR=open('/tmp/j/kgm1010A_w26.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))

# ── #8 兒童餐顯示成簡體「儿、童、餐」：模擬旅客的餐點字串寫成簡體；轉成正式訂位時餐點存成字串（不是 {std:…}），
#      附加服務摘要對字串做 Object.keys → 一個字一個字用「、」接起來 ─────────────────────────────
RW('kids meal trad','"\\u513f\\u7ae5\\u9910"]','"\\u5152\\u7ae5\\u9910"]')
R229='kgm-0909E-r229'
P121='kgm-0903b-r121'
RC('sim meal obj',R229,"mealChoice:x.meal?{out:x.meal}:{},","mealChoice:(function(){var ml=x.meal;try{if(window.kgmPaxMealR928)ml=window.kgmPaxMealR928(x,f,date)||''}catch(_){}ml=String(ml||'').replace(/\\u513f\\u7ae5/g,'\\u5152\\u7ae5');return ml?{out:{std:ml}}:{}})(),   /* 1012A：餐點存成 {種類:餐點}（不是字串），並用航班資料同一套換算（成人不會拿到兒童餐） */")
RC('sim meal migrate',R229,"    var CABF10={First:'F-X',Business:'B-T',Premium:'P-F',Economy:'E-C'};",
   "    var CABF10={First:'F-X',Business:'B-T',Premium:'P-F',Economy:'E-C'};\n"
   "    /* 1012A：之前轉成正式訂位、餐點存成字串的（例：mealChoice.out='儿童餐'）改成 {std:…}，簡體改繁體 */\n"
   "    try{(S.bookings||[]).forEach(function(b){var m=b&&b.mealChoice;if(m&&typeof m==='object')for(var k in m)if(typeof m[k]==='string')m[k]={std:m[k].replace(/\\u513f\\u7ae5/g,'\\u5152\\u7ae5')}})}catch(_){}")
RC('dossier meal str','kgm-0823a-r51',"        var mo=b.mealChoice[k]||{};\n        arr=Object.keys(mo).map(function(x){return mo[x]}).filter(Boolean);",
   "        var mo=b.mealChoice[k]||{};\n        arr=(typeof mo==='string'?[mo]:Object.keys(mo).map(function(x){return mo[x]})).filter(Boolean).map(function(x){return String(x).replace(/\\u513f\\u7ae5/g,'\\u5152\\u7ae5')});   /* 1012A：字串不能拆字 */")

# ── #14 搜尋頁一進去票價卡不要自動展開（含轉機組合）：
#      (1) 搜尋按鈕沒有清掉上一次展開的票價（S.openFare），重新搜尋時同一列又自動打開；
#      (2) 轉機組合的票價卡一律攤開 —— 改成跟直飛一樣「選擇票價 ▼」按了才展開（狀態存在 S，render() 不會洗掉）
RW('search resets open fare',"S.seatPhase='out';S.phase='sel_out';nav('booking');})()",
   "S.seatPhase='out';S.phase='sel_out';S.openFare=null;S.openConnR1012A=null;nav('booking');})()",2)
RW('conn card collapsed',
   "    +'<div style=\"padding:14px 16px 16px;background:linear-gradient(180deg,#fff,var(--light));border-top:1px solid var(--border)\">'+fareRows+'</div>'\n  +'</div>';",
   "    +(op12?'<div style=\"padding:14px 16px 16px;background:linear-gradient(180deg,#fff,var(--light));border-top:1px solid var(--border)\">'+fareRows+'</div>':'')\n"
   "    +'<div style=\"padding:12px 16px 14px;border-top:1px solid var(--border);background:#fff\"><button class=\"btn btn-sm btn-g\" style=\"width:100%;letter-spacing:.02em\" onclick=\"event.stopPropagation();S.openConnR1012A=(S.openConnR1012A===\\''+oc12+'\\'?null:\\''+oc12+'\\');render()\">'\n"
   "      +(op12?(LANG===\"en\"?\"Hide fares ▲\":\"收合票價 ▲\"):(LANG===\"en\"?\"Select fare ▼\":\"選擇票價 ▼\"))+'</button></div>'\n  +'</div>';")
RW('conn card key',"  var fareRows=connFareGrid(cn,cIdx,dir,curr2,pax);\n",
   "  var fareRows=connFareGrid(cn,cIdx,dir,curr2,pax);\n"
   "  /* 1012A：轉機票價卡預設收合，按「選擇票價」才展開（跟直飛一樣） */\n"
   "  var oc12=String(dir+'-'+cIdx+'-'+f1.code+'-'+f1.dep+'-'+f2.code+'-'+f2.dep+'-'+(f1.date||'')).replace(/[^\\w-]/g,''),op12=S.openConnR1012A===oc12;\n")

# ── #10 後台退票案件：手續費旁邊寫清楚訂的是哪個票價方案（基本／超值／豪華手續費不同） ──────────────
R113='kgm-0903b-r113'
RC('refund fam helper',R113,"  return {name:[p.lastName,p.firstName].filter(Boolean).join(' / '),flt:flt,segs:segs.length||1,",
   "  /* 1012A：訂購的票價方案（各段艙等＋方案），退票手續費依方案不同 */\n"
   "  var fam=[];try{var cs=[b&&b.outC,b&&b.inbC].concat(((b&&b.mcFlights)||[]).map(function(m){return m&&(m.c||m.code||m.fare)}));\n"
   "    cs.forEach(function(c){var f=c&&FARES[c];if(!f)return;var fm=f.familyR48||'',zf={Basic:'基本',Value:'超值',Deluxe:'豪華'}[fm]||'',\n"
   "      cz={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙',Resident:'Resident'}[f.cabin]||f.cabin||'',\n"
   "      t=z()?(cz+' '+(zf?zf+' '+fm:(f.tier||c))):((f.cabin||'')+' '+(fm||c));if(fam.indexOf(t)<0)fam.push(t)})}catch(_){}\n"
   "  return {name:[p.lastName,p.firstName].filter(Boolean).join(' / '),flt:flt,segs:segs.length||1,fam:fam.join('／'),")
RC('refund fam queue',R113,"+'<span><small>'+(zh?('手續費 · 全部 '+x.segs+' 段'):'FEE · ALL '+x.segs+' SECTORS')+'</small><b>NT$'+N(r.fee)+'</b></span>'",
   "+'<span><small>'+(zh?('手續費 · 全部 '+x.segs+' 段'):'FEE · ALL '+x.segs+' SECTORS')+'</small><b>NT$'+N(r.fee)+'</b></span>'\n"
   "        +'<span><small>'+(zh?'票價方案':'FARE FAMILY')+'</small><b>'+E(x.fam||'—')+'</b></span>'")
RC('refund fam case',R113,"      +'<span><small>'+(zh?('退票手續費（整筆訂位 '+paxOf10(q.pnr).segs+' 段，只收一次）'):'FEE (WHOLE BOOKING, ONCE)')+'</small><b>NT$'+N(q.fee)+'</b></span>'",
   "      +'<span><small>'+(zh?('退票手續費（整筆訂位 '+paxOf10(q.pnr).segs+' 段，只收一次）'):'FEE (WHOLE BOOKING, ONCE)')+'</small><b>NT$'+N(q.fee)+'</b></span>'\n"
   "      +'<span><small>'+(zh?'訂購票價方案':'FARE FAMILY')+'</small><b>'+E(paxOf10(q.pnr).fam||'—')+'</b></span>'")
RC('refund fam grid',R113,".k10rq-amt{display:grid;grid-template-columns:repeat(3,auto);",".k10rq-amt{display:grid;grid-template-columns:repeat(4,auto);")

# ── #7 冬夏季時刻：「航線管理」那頁跟網站要是同一份；每一班冬夏都要不一樣 ────────────────────────────
#   (1) 季節資料有兩份：S.seasonSchedulesR48（航線管理、排班讀這份）與 S.seasonSchedule0819H（航班調整頁存的、以班號為鍵，
#       網站售票的 kgmSeasonFlightR48 最外層 r106 會拿它蓋過 R48）。只要 0819H 有舊紀錄，網站和航線管理就各顯示一套。
#       → 1010A 的冬夏差修正跑完後，0819H 有的紀錄一律跟著 R48；航線管理的時刻改用網站同一個函式讀。
#   (2) KX59 墨爾本→吉隆坡→台北 冬夏都是吉隆坡 07:00 起飛（回台北的後段不能早於 07:00、中停 75 分，前段不能跨午夜，所以 1010A 沒改成）。
#   (3) 營運日欄「冬季 none」→「停飛」；該季不飛的那一欄寫「不飛」，不要印一個看起來一樣的時刻。
RC('season kx59 + 0819H sync',R229,"        if(n&&typeof window.kgmFixFifthGroundR179==='function'){try{window.kgmFixFifthGroundR179()}catch(_){}}",
   "        /* 1012A：KX59 墨爾本→吉隆坡→台北 冬夏起飛一樣（吉隆坡 07:00）：冬季（南半球夏季）前段飛行時間多 15 分，\n"
   "           墨爾本 23:50 → 吉隆坡 06:00，中停 75 分，吉隆坡 07:15 → 台北 11:25（夏季 07:00 → 11:15） */\n"
   "        (function(){var a=ST['KX59|MEL|KUL'],b=ST['KX59|KUL|TPE'],v=ST['KX59|MEL|TPE'];\n"
   "          if(!a||!b||!a.winter||!b.winter||!b.summer||!a.winter.arr||!runs(b))return;var d=dif(b);if(Math.abs(d)>=NEED)return;var x=NEED-d,was=b.winter.dep+'-'+b.winter.arr;\n"
   "          a.winter.arr=h10(m10(a.winter.arr)+x);b.winter.dep=h10(m10(b.winter.dep)+x);b.winter.arr=h10(m10(b.winter.arr)+x);if(v&&v.winter)v.winter.arr=b.winter.arr;\n"
   "          freeze(a);freeze(b);n++;SEALOG10.push('KX59|KUL|TPE 冬季 '+was+' → '+b.winter.dep+'-'+b.winter.arr+'（前段 MEL→KUL 冬季抵達 '+a.winter.arr+'）')})();\n"
   "        /* 1012A：0819H（航班調整頁存的、以班號為鍵）有紀錄的，時刻跟著 R48 —— 不然網站讀 0819H、航線管理讀 R48，兩邊各一套 */\n"
   "        try{var H12=S.seasonSchedule0819H;if(H12&&typeof H12==='object')Object.keys(H12).forEach(function(code){var lg=legs.filter(function(f){return f.code===code});if(lg.length!==1)return;\n"
   "          var o=ST[K(lg[0])];if(!o)return;['summer','winter'].forEach(function(sea){var a=H12[code]&&H12[code][sea],b=o[sea];\n"
   "            if(a&&b&&b.dep&&(a.dep!==b.dep||a.arr!==b.arr||(+a.dd||0)!==(+b.dd||0))){SEALOG10.push(code+' 0819H '+sea+' '+a.dep+'-'+a.arr+' → '+b.dep+'-'+b.arr);a.dep=b.dep;a.arr=b.arr;a.dd=+b.dd||0;n++}})})}catch(_){}\n"
   "        if(n&&typeof window.kgmFixFifthGroundR179==='function'){try{window.kgmFixFifthGroundR179()}catch(_){}}")
RC('routes same source','kgm-0823l-r68',"          var su=o.summer||{dep:f.dep,arr:f.arr},wi=o.winter||{dep:f.dep,arr:f.arr};",
   "          var su=o.summer||{dep:f.dep,arr:f.arr},wi=o.winter||{dep:f.dep,arr:f.arr};\n"
   "          /* 1012A：顯示的時刻跟網站售票／航班動態同一個來源（kgmSeasonFlightR48，含航班調整頁那份），不另外直接讀 R48 */\n"
   "          try{var td12=T(),y12=+td12.slice(0,4),sd12=(td12<=y12+'-07-15'?y12:y12+1)+'-07-15',wd12=(td12<=y12+'-01-15'?y12:y12+1)+'-01-15';\n"
   "            var s12=window.kgmSeasonFlightR48(f,sd12),w12=window.kgmSeasonFlightR48(f,wd12);\n"
   "            if(s12&&s12.dep)su={dep:s12.dep,arr:s12.arr,days:(o.summer||{}).days};if(w12&&w12.dep)wi={dep:w12.dep,arr:w12.arr,days:(o.winter||{}).days}}catch(_){}\n"
   "          var no12=function(r,sea){var d=r&&r.days;if(d==null&&f.seasonDaysR66)d=f.seasonDaysR66[sea];return d==='none'||(Array.isArray(d)&&!d.length)},\n"
   "              nf12='<span style=\"color:#9aa39f\">'+(z()?'不飛':'Not operating')+'</span>';")
RC('routes no-op season','kgm-0823l-r68',"            +'<td class=\"k68-t\">'+E(su.dep)+'–'+E(su.arr)+'</td>'\n            +'<td class=\"k68-t\">'+E(wi.dep)+'–'+E(wi.arr)\n              +(d?",
   "            +'<td class=\"k68-t\">'+(no12(su,'summer')?nf12:(E(su.dep)+'–'+E(su.arr)))+'</td>'\n            +'<td class=\"k68-t\">'+(no12(wi,'winter')?nf12:(E(wi.dep)+'–'+E(wi.arr)))\n              +(d&&!no12(wi,'winter')?")
RC('days none label','kgm-0823p-r78',"    if(x==='daily')return z()?'每日':'daily';\n    if(Array.isArray(x))",
   "    if(x==='daily')return z()?'每日':'daily';\n    if(x==='none')return z()?'停飛':'not operating';   /* 1012A：原本直接印出 none */\n    if(Array.isArray(x))")

#   (4) 航線管理表格以「搜尋字＋展開的分組」當快取鍵，第一次畫好之後季節資料再被修正（載入時的冬夏差修正、背景重建）也不會重畫，
#       顯示的是舊時刻（例：KX311 冬季表上 15:20、網站 15:25）→ 快取鍵加上季節資料的指紋
RC('routes sig season','kgm-0823l-r68',"    var sig=(S.k68Q||'')+'|'+JSON.stringify(S.k68Open||{});",
   "    var sig=(S.k68Q||'')+'|'+JSON.stringify(S.k68Open||{})+'|'+seaSig12();   /* 1012A：季節資料改了要重畫 */")
RC('routes sig fn','kgm-0823l-r68',"function mountRoutes68(){",
   "function seaSig12(){var h=0;try{[S.seasonSchedulesR48||{},S.seasonSchedule0819H||{}].forEach(function(T){Object.keys(T).forEach(function(k){var o=T[k]||{};\n"
   "  ['summer','winter'].forEach(function(sea){var r=o[sea];if(!r)return;var t=k+sea+r.dep+r.arr+(r.dd||0)+String(r.days);for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0})})})}catch(_){}return h}\n"
   "function mountRoutes68(){")

# ── #11 AI 客服（轉真人客服佇列）的模擬對話寫了訂位代號，定位管理卻查不到：那三筆對話是寫死的，訂位根本不存在
#      → 模擬對話的訂位代號一律補成一筆正式訂位（依對話內容：班號、日期、去回程；姓名用護照拼音），定位管理查得到、改得到
RC('cs sim pnr',R229,"  function seed(){var q=Q();if(Object.keys(q).length||S.csSeededR1006A)return;S.csSeededR1006A=1;",
   "  /* 1012A：模擬對話裡的訂位代號要真的存在（定位管理查得到）。依對話內容補一筆訂位：班號、日期（沒寫就 10～30 天後）、\n"
   "     「回程」→ 這班是回程，前面補一段反方向的去程；姓名用護照拼音。已經有同代號的訂位就不動。 */\n"
   "  var ROM12={'陳怡君':['CHEN','YICHUN'],'林志明':['LIN','CHIHMING'],'Daniel Wu':['WU','DANIEL']};\n"
   "  function csPnr12(){try{var q=Q(),made=0;Object.keys(q).forEach(function(id){var it=q[id];if(!it||!it.sim||!/^[A-Z0-9]{6}$/.test(String(it.pnr||'')))return;\n"
   "      if((S.bookings||[]).some(function(b){return b&&String(b.pnr).toUpperCase()===it.pnr}))return;\n"
   "      var txt=((it.msgs||[]).filter(function(m){return m.role==='user'})[0]||{}).text||'',code=(String(txt).match(/KX\\d+/)||[])[0];if(!code)return;\n"
   "      var ALL=[].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&!f.partner&&!f.codeshare});\n"
   "      var f=ALL.filter(function(x){return x.code===code&&!x.via&&(x.fr==='TPE'||x.to==='TPE'||x.fr==='TSA'||x.to==='TSA')})[0]||ALL.filter(function(x){return x.code===code&&!x.via})[0];if(!f)return;\n"
   "      var h=0;for(var i=0;i<it.pnr.length;i++)h=(h*31+it.pnr.charCodeAt(i))>>>0;\n"
   "      var td=todayISO(),dm=/(\\d{1,2})\\/(\\d{1,2})/.exec(txt),d0=dm?(td.slice(0,4)+'-'+('0'+dm[1]).slice(-2)+'-'+('0'+dm[2]).slice(-2)):addDays(td,10+h%20);\n"
   "      if(d0<td)d0=(+td.slice(0,4)+1)+d0.slice(4);\n"
   "      var on=function(x,d){for(var k=0;k<8;k++){var dd=addDays(d,k);try{if(flyOn(x,new Date(dd+'T12:00:00')))return dd}catch(_){return d}}return d};\n"
   "      var fare='E-C';try{var vc=validCodes(Object.assign({},f,{date:d0}))||[];fare=vc.filter(function(c){return /^E-/.test(c)&&(FARES[c]||{}).familyR48==='Value'})[0]||vc.filter(function(c){return /^E-/.test(c)})[0]||fare}catch(_){}\n"
   "      var sf12=function(x,d){try{return window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(x,d)||x):x}catch(_){return x}};\n"
   "      var out=f,inb=null,dO,dI=null;\n"
   "      if(/回程/.test(txt)){var rv=ALL.filter(function(x){return !x.via&&x.fr===f.to&&x.to===f.fr})[0];if(rv){inb=f;out=rv;dO=on(out,addDays(td,3+h%5));dI=on(inb,addDays(dO,7))}else dO=on(f,d0)}\n"
   "      else dO=on(f,d0);\n"
   "      var nm=ROM12[it.name]||String(it.name||'').toUpperCase().split(/\\s+/).reverse(),p0={title:'',lastName:nm[0]||'',firstName:nm[1]||'',dob:'',passport:'',nat:/[A-Za-z]/.test(it.name)?'AU':'TW',email:'',ffpNum:it.userId||'',passengerType:'ADT'};\n"
   "      var pax=[p0];if(/父親/.test(txt))pax.push({title:'',lastName:p0.lastName,firstName:'KUOHUA',dob:'',passport:'',nat:p0.nat,email:'',ffpNum:'',passengerType:'ADT'});\n"
   "      var price=0;try{price=Math.round((owPrice(Object.assign({},out,{date:dO}),fare,pax.length)||0)+(inb?(owPrice(Object.assign({},inb,{date:dI}),fare,pax.length)||0):0))}catch(_){}\n"
   "      var bt=new Date(Date.now()-(3+h%20)*86400e3);\n"
   "      var b={pnr:it.pnr,status:'confirmed',userId:null,csSimR1012A:id,simR1010A:{code:out.code,fr:out.fr,to:out.to,date:dO,at:new Date().toISOString(),by:'AI-CS'},\n"
   "        search:{type:inb?'RT':'OW',fr:out.fr,to:out.to,dep:dO,ret:dI,pax:pax.length},outF:Object.assign({},sf12(out,dO),{date:dO}),outC:fare,inbF:inb?Object.assign({},sf12(inb,dI),{date:dI}):null,inbC:inb?fare:null,\n"
   "        paxList:pax,contactEmail:'',seats:{},mealChoice:{},total:price,curr:'TWD',bookedAt:bt.toISOString(),ticketNumber:'297'+String((h*7919)%10000000000).padStart(10,'0')};\n"
   "      b.ticket=b.ticketNumber;S.bookings=S.bookings||[];S.bookings.push(b);made++});\n"
   "    if(made){try{save()}catch(_){}}}catch(e){try{console.warn('1012A cs pnr',e)}catch(_){}}}\n"
   "  window.kgmCsSimPnrR1012A=csPnr12;\n"
   "  setTimeout(function(){try{if(window.KGM_SIDE!=='front'){seed();csPnr12()}}catch(_){}},4000);   /* 不用先打開 AI 對話查詢，定位管理就查得到 */\n"
   "  function seed(){var q=Q();if(Object.keys(q).length||S.csSeededR1006A)return;S.csSeededR1006A=1;")
RC('cs sim pnr call',R229,"      if(!main)return;seed();","      if(!main)return;seed();csPnr12();")

# ── #9a 定位管理「旅客備註與特殊服務」一次列出全部 15 種服務（看起來像每位旅客都申請了一堆）
#      → 只列這位旅客已申請的（可按 × 移除），另外用下拉選單「新增特殊服務」；模擬旅客轉入時，少數人帶一項模擬申請的服務
RC('ssr chips applied only',R229,
   "            +'<div class=\"k10svc-chips\">'+SSR10.map(function(s){return '<label class=\"k10svc-chip'+(on[s[0]]?' on':'')+'\"><input type=\"checkbox\" data-k10ssr=\"'+i+'\" value=\"'+s[0]+'\"'+(on[s[0]]?' checked':'')+' onchange=\"kgmPaxSvcDraftR1010A(\\''+hE(b.pnr)+'\\','+i+')\"><b>'+s[0]+'</b>'+hE(s[1])+'</label>'}).join('')+'</div>'",
   "            /* 1012A：只列已申請的服務（× 移除），其餘從下拉選單新增 —— 不再一次攤開 15 種 */\n"
   "            +'<div class=\"k10svc-chips k12svc\">'+(c.ssr.length?c.ssr.map(function(code){return '<span class=\"k10svc-chip on\"><input type=\"checkbox\" style=\"display:none\" data-k10ssr=\"'+i+'\" value=\"'+hE(code)+'\" checked><b>'+hE(code)+'</b>'+hE(SSRZ10[code]||code)\n"
   "              +'<button type=\"button\" class=\"k12svc-x\" title=\"移除\" onclick=\"kgmPaxSvcDelR1012A(\\''+hE(b.pnr)+'\\','+i+',\\''+hE(code)+'\\')\">×</button></span>'}).join(''):'')+'</div>'\n"
   "            +'<div class=\"k12svc-add\"><select class=\"inp\" id=\"k12ssr'+i+'\"><option value=\"\">新增特殊服務…</option>'+SSR10.filter(function(s){return !on[s[0]]}).map(function(s){return '<option value=\"'+s[0]+'\">'+s[0]+'　'+hE(s[1])+'</option>'}).join('')+'</select>'\n"
   "              +'<button type=\"button\" class=\"btn btn-sm\" onclick=\"kgmPaxSvcAddR1012A(\\''+hE(b.pnr)+'\\','+i+')\">新增</button></div>'")
RC('ssr add/del fns',R229,"    window.kgmPaxSvcDraftR1010A=function(pnr,i){",
   "    /* 1012A：新增／移除只改草稿（存在 S，重畫不會不見），按「儲存這位旅客」才寫進訂位 */\n"
   "    function svcSet12(pnr,i,fn){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!b)return;var c=svcCur10(b,i),t=document.getElementById('k10rmk'+i);\n"
   "      var codes=fn(c.ssr.slice());(S.svcDraftR1010A=S.svcDraftR1010A||{})[pnr+'|'+i]={ssr:codes,rmk:t?String(t.value||''):c.rmk};try{render()}catch(_){}}\n"
   "    window.kgmPaxSvcAddR1012A=function(pnr,i){var sel=document.getElementById('k12ssr'+i),v=sel&&sel.value;if(!v||!SSRZ10[v])return;svcSet12(pnr,i,function(a){if(a.indexOf(v)<0)a.push(v);return a})};\n"
   "    window.kgmPaxSvcDelR1012A=function(pnr,i,code){svcSet12(pnr,i,function(a){return a.filter(function(x){return x!==code})})};\n"
   "    window.kgmPaxSvcDraftR1010A=function(pnr,i){")
RC('ssr sim seed',R229,"      b.ticket=b.ticketNumber;S.bookings=S.bookings||[];S.bookings.push(b);\n      try{logAct('模擬旅客轉為正式訂位'",
   "      b.ticket=b.ticketNumber;S.bookings=S.bookings||[];S.bookings.push(b);\n"
   "      /* 1012A：模擬旅客少數人帶一項模擬申請的特殊服務（約 6%），其他人沒有 */\n"
   "      try{var sp=[['WCHR',5],['MAAS',3],['LANG',2],['DEAF',1],['BLND',1],['PPOC',1],['SVAN',1]],sk=(hh>>>7)%100;if(sk<6){var sx=(hh>>>3)%14,acc=0,sc='WCHR';for(var q=0;q<sp.length;q++){acc+=sp[q][1];if(sx<acc){sc=sp[q][0];break}}\n"
   "        b.paxList[0].ssrR1010A=[sc];b.paxList[0].svcAtR1010A=bt.toISOString();b.paxList[0].svcByR1010A='模擬申請'}}catch(_){}\n"
   "      try{logAct('模擬旅客轉為正式訂位'")

RC('ssr css',R229,"      +'.k10svc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}'",
   "      +'.k10svc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}'\n"
   "      +'.k12svc .k10svc-chip{cursor:default;background:#F1F6F3;border-color:#BFD8C9;color:#1F4E46}.k12svc-x{border:0;background:transparent;color:#8A8578;font-size:14px;line-height:1;cursor:pointer;padding:0 0 0 4px}.k12svc-x:hover{color:#A23B2A}'\n"
   "      +'.k12svc-none{font-size:11.5px;color:#9A948A;font-style:normal}.k12svc-add{display:flex;gap:8px;align-items:center;margin:0 0 10px}.k12svc-add select{max-width:340px;font-size:12px}'")

# ── #9b 里程升等：可以取消；取消後改日期 →「恢復里程升等」；換了航線 →「請重新申請里程升等」；
#       同航線新日期沒有升等座位 → 問要不要接受候補（加收 10%），不要就取消這次恢復。前台行程管理與後台定位管理同一套。
RC('upg resume remember',R229,"    r.refundedMiles=got||(+r.miles||0);\n    /* 已確認的升等：艙等改回原艙等，座位重新配 */",
   "    r.refundedMiles=got||(+r.miles||0);\n"
   "    /* 1012A：記下這段原本升等到哪個艙等，改完日期可以「恢復」（DH 騰位的不記） */\n"
   "    try{if(b&&!window.KGM_NOASK_R1007A){var sg0=r.seg||'out',f0=b[sg0+'F']||{};(b.upgResumeR1012A=b.upgResumeR1012A||{})[sg0]={id:r.id,code:r.code||f0.code,fr:f0.fr,to:f0.to,date:r.date||f0.date,toCabin:r.toCabin,type:r.type,miles:+r.miles||0,at:new Date().toISOString()};\n"
   "      if(!(S.upgradeReqs||[]).some(function(x){return x&&x!==r&&x.pnr===b.pnr&&/confirmed|waitlist/.test(String(x.status||''))}))b.mileageUpgraded=false}}catch(_){}\n"
   "    /* 已確認的升等：艙等改回原艙等，座位重新配 */")
RC('upg resume fns',R229,"  window.kgmDeskUpgR1006A=function(pnr,seg,type,to,miles,inst){",
   "  /* 1012A：里程升等卡（前台行程管理、後台定位管理共用） */\n"
   "  function act12(b){return (S.upgradeReqs||[]).filter(function(r){return r&&r.pnr===b.pnr&&/confirmed|waitlist/.test(String(r.status||''))})}\n"
   "  window.kgmUpgCardHtmlR1012A=function(b,admin,only){\n"
   "    try{if(!b||b.dhR929||(window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b)))return '';css();\n"
   "      var reqs=act12(b),R=b.upgResumeR1012A||{},rows=[];\n"
   "      if(!only)reqs.forEach(function(r){var w=String(r.status)==='waitlist';\n"
   "        rows.push('<div class=\"k6-mup-row\"><span><b>'+E(r.code)+'</b>'+(r.legR1012A?' <i class=\"k12-leg\">'+E(r.legR1012A.replace('-','→'))+(Z()?' 單段':' leg')+'</i>':'')+'　'+E(r.date)+'　'+E(cz(r.prevCabinR922||cabOf(r.fromClass||r.prevClsR922)||''))+' → '+E(cz(r.toCabin||''))+'　<b>'+N(r.miles)+(Z()?' 哩':' mi')+'</b></span>'\n"
   "          +'<em class=\"'+(w?'w':'')+'\">'+(w?(Z()?'候補中':'Waitlisted'):(Z()?'已確認':'Confirmed'))+'</em>'\n"
   "          +'<button onclick=\"'+(admin?'kgmDeskCancelUpgR1006A':'kgmUpgradeWithdrawR922')+'(\\''+A(r.id)+'\\')\">'+(Z()?'取消里程升等':'Cancel upgrade')+'</button></div>')});   /* 前台＝旅客自行撤回（既有規則退 95%）；後台票務中心＝全額 */\n"
   "      ['out','inb'].forEach(function(k){var x=R[k],f=b[k+'F'];if(!x||!f)return;if(reqs.some(function(r){return (r.seg||'out')===k}))return;\n"
   "        var same=f.fr===x.fr&&f.to===x.to,moved=String(f.date||'')!==String(x.date||'')||f.code!==x.code;\n"
   "        if(!same)rows.push('<div class=\"k6-mup-row k12-re\"><span>'+(Z()?('已改到 '+E(f.code)+' '+E(f.fr)+'→'+E(f.to)+'（航線不同）：<b>請重新申請里程升等</b>'):('Route changed — please apply for a new mileage upgrade'))+'</span>'\n"
   "          +(admin?'':'<button onclick=\"pickUpgradeFlight0813(\\''+A(b.pnr)+'\\',\\''+k+'\\')\">'+(Z()?'重新申請':'Apply')+'</button>')\n"
   "          +'<button onclick=\"kgmUpgResumeDropR1012A(\\''+A(b.pnr)+'\\',\\''+k+'\\')\">'+(Z()?'知道了':'Dismiss')+'</button></div>');\n"
   "        else rows.push('<div class=\"k6-mup-row k12-re\"><span>'+(Z()?('已取消的里程升等：'+E(x.code)+' '+E(x.date)+' → '+E(cz(x.toCabin))+(moved?('；目前是 '+E(f.code)+' '+E(f.date)):'')):('Cancelled upgrade to '+x.toCabin))+'</span>'\n"
   "          +'<button class=\"up\" onclick=\"kgmUpgResumeR1012A(\\''+A(b.pnr)+'\\',\\''+k+'\\')\">'+(Z()?('恢復里程升等（'+E(cz(x.toCabin))+'）'):'Resume upgrade')+'</button>'\n"
   "          +'<button onclick=\"kgmUpgResumeDropR1012A(\\''+A(b.pnr)+'\\',\\''+k+'\\')\">'+(Z()?'不恢復':'Discard')+'</button></div>')});\n"
   "      if(!rows.length)return '';if(only)return rows.join('');\n"
   "      return '<section class=\"k6-mup k12-mup\"><header><small>MILEAGE UPGRADE · 里程升等</small><b>'+(Z()?'里程升等':'Mileage upgrade')+'</b>'\n"
   "        +'<p>'+(Z()?((admin?'票務中心取消里程升等全額退還里程':'自行取消里程升等退回 95% 里程（臨櫃／客服辦理全額退還）')+'，艙等改回原艙等；取消後才能自行改日期；改好日期可以按「恢復里程升等」，同一條航線有位子就直接升等，沒有位子會問你要不要候補。換了航線要重新申請。')\n"
   "                   :((admin?'Desk cancellation refunds the miles in full':'Self-service cancellation returns 95% of the miles')+' and unlocks online changes. After changing the date you can resume the upgrade on the same route.'))+'</p></header>'+rows.join('')+'</section>';\n"
   "    }catch(e){return ''}\n"
   "  };\n"
   "  /* 1012A：旅客自行撤回（r49，退 95%）跟票務中心取消一樣：記下可恢復、解除「已用里程升等不可線上改票」、座位改回原艙等重配 */\n"
   "  (function(){var w49=window.kgmWithdrawUpgrade49;if(typeof w49!=='function'||w49.__r1012A)return;\n"
   "    var f49=function(id,move){var r=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===id})[0],was=r&&r.status,c0=null,b=r&&bk(r.pnr),sg=r&&(r.segR922||r.seg||'out');if(b)c0=b[sg+'C'];\n"
   "      var out=w49.apply(this,arguments);\n"
   "      try{if(r&&b&&!move&&was!==r.status&&!/confirmed|waitlist/.test(String(r.status||''))){var f0=b[sg+'F']||{};\n"
   "        (b.upgResumeR1012A=b.upgResumeR1012A||{})[sg]={id:r.id,code:r.code||f0.code,fr:f0.fr,to:f0.to,date:r.date||f0.date,toCabin:r.toCabin,type:r.type,miles:+r.miles||0,at:new Date().toISOString()};\n"
   "        if(!act12(b).length)b.mileageUpgraded=false;\n"
   "        if(was==='confirmed'&&b[sg+'C']!==c0){if(b.upgraded&&b.upgraded[sg])delete b.upgraded[sg];b.seats=b.seats||{};b.seats[sg]={};try{autoAssignSeat(b,sg)}catch(_){}}\n"
   "        try{save()}catch(_){}try{render()}catch(_){}}}catch(_){}\n"
   "      return out};f49.__r1012A=1;window.kgmWithdrawUpgrade49=f49})();\n"
   "  (function(){var c922=window.kgmUpgradeCardR922;if(typeof c922!=='function'||c922.__r1012A)return;var w=function(){try{var a=document.getElementById('app');if(a&&a.querySelector('.k12-mup'))return ''}catch(_){}return c922.apply(this,arguments)};w.__r1012A=1;window.kgmUpgradeCardR922=w})();   /* 同一頁只留一張里程升等卡 */\n"
   "  window.kgmUpgResumeDropR1012A=function(pnr,k){var b=bk(pnr);if(b&&b.upgResumeR1012A){delete b.upgResumeR1012A[k];try{save()}catch(_){}try{render()}catch(_){}}};\n"
   "  window.kgmUpgResumeR1012A=function(pnr,k){\n"
   "    var b=bk(pnr),x=b&&(b.upgResumeR1012A||{})[k],f=b&&b[k+'F'];if(!b||!x||!f)return;\n"
   "    if(f.fr!==x.fr||f.to!==x.to){alert(Z()?'航線已經不同，請重新申請里程升等。':'Route changed — please apply again.');return}\n"
   "    var o=[];try{o=asOwner(b,function(){return window.kgmUpgradeOptionsR920?(window.kgmUpgradeOptionsR920(b,k)||[]):[]})}catch(_){o=[]}\n"
   "    var opt=o.filter(function(y){return y&&!y.auction&&y.to===x.toCabin})[0];\n"
   "    if(!opt){alert(Z()?(f.code+' '+f.date+' 沒有可以用里程升等到'+cz(x.toCabin)+'的艙等。'):'No mileage upgrade to that cabin on this flight.');return}\n"
   "    var inst=true;try{inst=!!asOwner(b,function(){return typeof upgradeStatus==='function'&&upgradeStatus(f.code,f.date,opt.to,(b.paxList||[{}]).length).instant})}catch(_){}   /* 跟票務中心同一個判斷 */\n"
   "    if(!inst&&!confirm(Z()?(f.code+' '+f.date+' 目前沒有'+cz(x.toCabin)+'的升等座位。\\n\\n要接受安排候補嗎？（候補加收 10% 哩程，報到前確定；沒有升上會全額退還）\\n\\n按「取消」＝不候補，結束這次升等。'):'No upgrade seat now. Join the waitlist (+10% miles)?')){window.kgmUpgResumeDropR1012A(pnr,k);return}\n"
   "    var keep=S.mileageSourceR4,r=null;\n"
   "    ['self','non_self'].some(function(src){S.mileageSourceR4=src;try{r=asOwner(b,function(){return window.requestUpgrade(pnr,k,opt.type,opt.to)})}catch(e){r={ok:false,why:e.message}}return r&&r.ok});\n"
   "    S.mileageSourceR4=keep;\n"
   "    if(!r||!r.ok){alert((r&&r.why)||(Z()?'升等失敗。':'Upgrade failed.'));return}\n"
   "    delete b.upgResumeR1012A[k];\n"
   "    try{if(typeof logAct==='function')logAct(Z()?'恢復里程升等':'Upgrade resumed',pnr+'　'+f.code+' '+f.date+' → '+opt.to+'　'+N(r.miles||0)+' 哩　'+(r.status||''))}catch(_){}\n"
   "    alert(Z()?((r.status==='confirmed'?'里程升等已恢復並確認':'已加入升等候補')+'，扣除 '+N(r.miles||0)+' 哩。'):('Upgrade '+(r.status||'')+'.'));\n"
   "    try{save()}catch(_){}try{render()}catch(_){}\n"
   "  };\n"
   "  window.kgmDeskUpgR1006A=function(pnr,seg,type,to,miles,inst){")

RC('upg resume admin rows',R229,"      if(opts.length)h+=opts.join('');\n      if(!reqs.length&&!opts.length)h+=",
   "      if(opts.length)h+=opts.join('');\n      try{h+=window.kgmUpgCardHtmlR1012A(b,true,true)||''}catch(_){}   /* 1012A：取消後可恢復／換航線要重新申請 */\n      if(!reqs.length&&!opts.length)h+=")
RC('upg card front','kgm-0909B-r217',"  return '<section class=\"k56-block\">'\n   +'<header><em>CHANGE &amp; REFUND</em>'",
   "  return (window.kgmUpgCardHtmlR1012A?window.kgmUpgCardHtmlR1012A(b,false):'')   /* 1012A：里程升等卡（取消／恢復／重新申請） */\n   +'<section class=\"k56-block\">'\n   +'<header><em>CHANGE &amp; REFUND</em>'")

# ── 定位管理「完整行程」同一段列兩次（1012A 測試時發現）：訂位上存的時刻是舊季節，改票紀錄（r45）回傳的是目前時刻，
#    去重複用「班號＋日期＋航段＋起飛時間」當鍵 → 時刻不同就變兩段。改成不看起飛時間，留最後一筆（目前的時刻）
RW('dossier seg dedupe',"var seen={};return a.filter(function(x){var k=[x.code,x.date,x.fr,x.to,x.dep].join('|');if(seen[k])return false;seen[k]=1;return true}).sort(",
   "var seen={};return a.reverse().filter(function(x){var k=[x.code,x.date,x.fr,x.to].join('|');if(seen[k])return false;seen[k]=1;return true}).reverse().sort(")

# ── #16 組員班表上的 DH 訂位（例：RQT3 LEE / JI-HO）用行程管理查是「資料錯誤」
#   原因：班表每次重排（每次開頁機隊輪轉可能換一套）時，班表上已經沒有的 DH 訂位會被自動取消（1008A）；
#        之後又排回同一段時，班表照樣顯示這個代號，但 dhBooking929 直接沿用那筆「已取消」的訂位 → 查詢時被當成取消的訂位排除。
#   → 自動取消的 DH 訂位，班表又排回來時恢復為有效。
#   另外：連動會員帳號的組員，DH 訂位顯示在「近期旅程」，執勤航班也列出來（標 WORKING／執勤）。
RC('dh reactivate','kgm-r7-admin-ops',"    if(b){syncDh7(b,p,f,date);return b}",
   "    if(b){if(b.status==='cancelled'&&b.dhCancelledR1008A){b.status='confirmed';b.dhRestoredR1012A=new Date().toISOString();delete b.dhCancelledR1008A;try{save()}catch(_){}}   /* 1012A：班表又排回來 → 自動取消的 DH 訂位恢復 */\n"
   "      syncDh7(b,p,f,date);return b}")
R196='kgm-0907A-r196'
RC('crew work index',R196,"window.kgmRosterR196=function(empId,days){",
   "/* 1012A：連動會員帳號的組員（S.staffLinkR1010A），把未來 30 天的執勤／DH 航段寫進 S.crewWorkR1012A（存檔、前後台同步），\n"
   "   前台「近期旅程」直接讀這份 —— 前台不用自己排一次組員班表。只讀背景已經建好的索引，不觸發重建。 */\n"
   "function work12(){try{if(window.KGM_SIDE==='front')return;var L=S.staffLinkR1010A||{},ids=Object.keys(L).filter(function(k){return L[k]&&L[k].userId});if(!ids.length)return;\n"
   "  var Wk=S.crewWorkR1012A=S.crewWorkR1012A||{},ch=0;\n"
   "  /* 跟後台班表畫面同一個來源（kgmRosterR196：比對指紋、只用已經暖好的天數）；直接讀 IDX196 會讀到失效／還沒建的索引 → 永遠空白 */\n"
   "  ids.forEach(function(id){var rows=[],seen={},ros=[];try{ros=window.kgmRosterR196(id,31)||[]}catch(_){ros=[]}ros.forEach(function(x){var d=x.date;\n"
   "      [].concat(x.legs||[],x.dh||[]).forEach(function(l){if(!l)return;var dh=!!(l.dhR913||l.deadhead||String(l.code||'')==='DH'),c=dh?(l.dhFlightR1004B||(l.code!=='DH'?l.code:'')):l.code;if(!c)return;\n"
   "        var dd=dh?(l.dhDateR1004B||d):d,k=dd+'|'+c+'|'+l.fr+'|'+l.to;if(seen[k])return;seen[k]=1;var row={date:dd,code:c,fr:l.fr,to:l.to,dep:l.dep||'',arr:l.arr||'',dh:dh};\n"
   "        /* DH 段：確保有 DH 訂位（行程管理查得到、近期旅程有卡片），PNR 一起記下 */\n"
   "        if(dh&&dd>=T()){try{var e12=window.kgmDhEnsureR1008A&&window.kgmDhEnsureR1008A(id,dd,c,l.fr,l.to);if(e12&&e12.pnr)row.pnr=e12.pnr}catch(_){}}\n"
   "        rows.push(row)})});\n"
   "    rows.sort(function(a,b){return (a.date+a.dep).localeCompare(b.date+b.dep)});\n"
   "    if(!Wk[id]||JSON.stringify(Wk[id].rows)!==JSON.stringify(rows)){Wk[id]={at:new Date().toISOString(),rows:rows};ch++}});\n"
   "  if(ch){try{save()}catch(_){}}}catch(_){}}\n"
   "window.kgmCrewWorkSyncR1012A=work12;setTimeout(work12,30000);setInterval(work12,90000);\n"
   "window.kgmRosterR196=function(empId,days){")
RW('mine dh linked',"function mineJ(){var u=S.user||{},id=String(u.id||''),mail=String(u.email||'').toLowerCase();return (S.bookings||[]).filter(function(b){if(!b||b.status==='cancelled')return false;if(b.userId&&String(b.userId)===id)return true;",
   "function linkEmpJ(){try{var u=S.user||{},L=(window.kgmStaffLinksR1012A?window.kgmStaffLinksR1012A():S.staffLinkR1010A)||{};return Object.keys(L).filter(function(k){return L[k]&&u.id&&String(L[k].userId)===String(u.id)})[0]||''}catch(_){return ''}}   /* 1012A：這個會員連動的員工編號 */\n"
   "function mineJ(){var u=S.user||{},id=String(u.id||''),mail=String(u.email||'').toLowerCase(),emp=linkEmpJ();return (S.bookings||[]).filter(function(b){if(!b||b.status==='cancelled')return false;if(b.userId&&String(b.userId)===id)return true;if(emp&&b.dhR929&&String(b.dhR929.empId)===emp)return true;   /* 1012A：連動組員的 DH 訂位 */")
RW('trip card dh label',"function tripCardJ(b,ss){var first=ss[0]||{},last=ss[ss.length-1]||first;return '<article class=\"h-trip-card j-trip\"><header><div><small>PNR '+EJ(b.pnr)+'</small><h3>'+EJ(kgmTripTitleR913(ss,ZJ()))+'</h3></div><span>'+EJ(b.status||'confirmed')+'</span></header>",
   "function tripCardJ(b,ss){var first=ss[0]||{},last=ss[ss.length-1]||first;return '<article class=\"h-trip-card j-trip'+(b.dhR929?' k12-dh':'')+'\"><header><div><small>PNR '+EJ(b.pnr)+(b.dhR929?(ZJ()?' · 執勤調位（DH）':' · Positioning (DH)'):'')+'</small><h3>'+EJ(kgmTripTitleR913(ss,ZJ()))+'</h3></div><span>'+(b.dhR929?'<b class=\"k12-work\">WORKING · DH</b>':EJ(b.status||'confirmed'))+'</span></header>")
RW('recent working list',"'</div>')+(past.length?'<details class=\"j-past\"><summary>'+(ZJ()?'過去的行程':'Past trips')",
   "'</div>')+workJ()+(past.length?'<details class=\"j-past\"><summary>'+(ZJ()?'過去的行程':'Past trips')")
RW('recent working fn',"function recentJ(){var rows=mineJ()",
   "/* 1012A：連動組員帳號的執勤航班（WORKING）。資料來自後台組員班表（S.crewWorkR1012A）；DH 段有自己的訂位，列在上面的旅程卡 */\n"
   "function workJ(){try{var emp=linkEmpJ();if(!emp)return '';var w=(S.crewWorkR1012A||{})[emp],t=TJ();var rows=((w&&w.rows)||[]).filter(function(r){return r&&String(r.date)>=t}).slice(0,30);   /* DH 段也依時間列出（標 DH＋PNR），時間軸才完整 */\n"
   "  var css='<style>.k12-workl{margin:14px 0 4px;border:1px solid #CFE1D6;border-radius:14px;background:#F6FAF7;padding:12px 14px}.k12-workl h4{margin:0 0 8px;font-size:13px;color:#0B493B;letter-spacing:.04em}.k12-workl h4 small{font-weight:600;color:#6B7B74;margin-left:6px}'\n"
   "    +'.k12-wr{display:grid;grid-template-columns:96px 70px 1fr auto;gap:10px;align-items:center;padding:7px 0;border-top:1px dashed #DCE8E1;font-size:12.5px}.k12-wr:first-of-type{border-top:0}.k12-wr b{font-family:ui-monospace,Menlo,monospace;color:#123C32}'\n"
   "    +'.k12-work{display:inline-block;font:800 10px ui-monospace,Menlo,monospace;letter-spacing:.08em;color:#fff;background:#1F4E46;border-radius:999px;padding:3px 9px}.k12-work.dh{background:#fff;color:#1F4E46;box-shadow:inset 0 0 0 1px #1F4E46}.k12-dh{border-color:#CFE1D6!important}</style>';\n"
   "  return css+'<div class=\"k12-workl\"><h4>'+(ZJ()?'執勤航班':'Working flights')+'<small>'+EJ(emp)+(ZJ()?' · 依組員班表，未來 30 天（DH＝以旅客身分調位）':' · from crew roster, next 30 days (DH = positioning)')+'</small></h4>'\n"
   "    +(rows.length?rows.map(function(r){return '<div class=\"k12-wr\"><span>'+EJ(r.date)+'</span><b>'+EJ(r.code)+'</b><span>'+EJ(r.fr)+' → '+EJ(r.to)+(r.dep?'　'+EJ(r.dep)+(r.arr?'–'+EJ(r.arr):''):'')+'</span>'+(r.dh?'<i class=\"k12-work dh\">'+(/地面轉場|GT/.test(String(r.code))?(ZJ()?'地面轉場':'GROUND'):'DH'+(r.pnr?' · '+EJ(r.pnr):''))+'</i>':'<i class=\"k12-work\">WORKING</i>')+'</div>'}).join('')\n"
   "      :'<div class=\"h-empty\">'+(w?(ZJ()?'未來 30 天沒有排到飛行勤務。':'No flying duty in the next 30 days.'):(ZJ()?'班表尚未同步（後台組員班表排好後自動出現）。':'Roster not synced yet.'))+'</div>')+'</div>'}catch(_){return ''}}\n"
   "function recentJ(){var rows=mineJ()")

# ── #17 組員班表很多重複名字（例：三個 JI-HO KIM）：補足人力的虛擬組員名字只從 24 個名 × 20 個姓裡挑（480 種），
#      組員有兩萬多人；正式員工檔也有 152 個重名。
#   → 名字改成由員工編號決定、保證不重複（50×50 個音節組成的名 × 100 個姓 = 25 萬種，編號對名字是一對一）；
#     正式員工只改重名的第二位以後（保留第一位原名），既有 DH 訂位上的姓名一併更新。
RC('unique names fn',P121,"function nm121(seed){",
   "/* 1012A：依員工編號產生的名字（一對一，不會重複）；k 是撞名時的備用序號 */\n"
   "var SY12=['Chia','Hao','Yu','Chen','Wei','Ting','Pei','Chun','Shu','Fen','Tzu','Han','Hsin','Yi','Kai','Ming','Jia','Ling','Kuan','Mei',\n"
   "  'Hsiao','Szu','Ying','Chih','Hung','Po','Sheng','Tsung','Hui','Li','Ya','Wen','Che','An','En','Jung','Yen','Lun','Hsuan','Fang',\n"
   "  'Chieh','Hua','Lan','Chung','Yuan','Chiao','Pin','Shan','Tai','Jen'];\n"
   "var SN12=['Chen','Lin','Huang','Chang','Lee','Wang','Wu','Liu','Tsai','Yang','Hsu','Cheng','Hsieh','Kuo','Hung','Tseng','Chiu','Liao','Lai','Chou',\n"
   "  'Yeh','Su','Chuang','Lu','Chiang','Ho','Lo','Kao','Chien','Pan','Chung','Fang','Peng','Tu','Tai','Fan','Sung','Chi','Shih','Yu',\n"
   "  'Tung','Hu','Wen','Liang','Chao','Tsao','Hsiao','Yen','Ko','Weng','Lien','Mao','Shen','Kang','Jen','Tang','Lai','Ou','Kung','Fu',\n"
   "  'Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Kim','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han',\n"
   "  'Smith','Brown','Wilson','Taylor','Clarke','Walker','Wright','Hall','Allen','Young','Nguyen','Tran','Pham','Santos','Reyes','Cruz','Garcia','Tan','Ong','Goh'];\n"
   "function nameOf12(emp,k){var n=+String(emp||'').replace(/\\D/g,'')||0,M=250000,i=((n*7919+(k||0)*104729+12345)%M+M)%M;\n"
   "  return SY12[i%50]+'-'+SY12[Math.floor(i/50)%50].toLowerCase()+' '+SN12[Math.floor(i/2500)%100]}\n"
   "function cap12(x){return String(x).replace(/-([a-z])/,function(m,c){return '-'+c.toUpperCase()})}\n"
   "window.kgmNameOfR1012A=function(emp){return cap12(nameOf12(emp,0))};\n"
   "/* 正式員工重名修正（只跑一次，存檔）＋ DH 訂位姓名同步 */\n"
   "function fixStaffNames12(){try{if(S.nameFixR1012A&&S.nameFixR1012A.len===(S.staff||[]).length)return;var seen={},ren={};\n"
   "    (S.staff||[]).slice().sort(function(a,b){return String(a.empId).localeCompare(String(b.empId))}).forEach(function(s){if(!s||!s.name)return;var key=String(s.name).trim().toUpperCase();\n"
   "      if(!seen[key]&&!/\\bUNDEFINED\\b/.test(key)){seen[key]=1;return}var k=0,nm;do{nm=cap12(nameOf12(s.empId,k++))}while(seen[nm.toUpperCase()]&&k<12);seen[nm.toUpperCase()]=1;ren[s.empId]={was:s.name,now:nm};s.nameWasR1012A=s.name;s.name=nm});\n"
   "    S.nameFixR1012A={at:new Date().toISOString(),n:Object.keys(ren).length,len:(S.staff||[]).length};dhNames12(ren);try{save()}catch(_){}}catch(_){}}\n"
   "window.kgmFixStaffNamesR1012A=fixStaffNames12;\n"
   "function dhNames12(ren){try{(S.bookings||[]).forEach(function(b){var h=b&&b.dhR929,r=h&&ren[h.empId];if(!r)return;var p=(b.paxList||[])[0];if(!p)return;\n"
   "    var nm=String(r.now).trim().split(/\\s+/);p.firstName=(nm.slice(0,-1).join(' ')||nm[0]).toUpperCase();p.lastName=(nm.length>1?nm[nm.length-1]:'').toUpperCase()})}catch(_){}}\n"
   "function staffNameSet12(){var o={};(S.staff||[]).forEach(function(s){if(s&&s.name)o[String(s.name).trim().toUpperCase()]=1});return o}\n"
   "function nm121(seed){")
RC('unique names virtual',P121,"  var ex=S.crewExtraR121;\n  if(ex&&ex.pilot===want.pilot&&ex.cabin===want.cabin&&ex.list)return ex.list;",
   "  var ex=S.crewExtraR121;fixStaffNames12();\n"
   "  /* 1012A：虛擬組員的名字改成依員工編號產生、不重複（舊存檔的名單一起換掉，DH 訂位姓名跟著改） */\n"
   "  function uniq12(list){var used=staffNameSet12(),ren={};list.forEach(function(x){var k=0,nm;do{nm=cap12(nameOf12(x.empId,k++))}while(used[nm.toUpperCase()]&&k<12);used[nm.toUpperCase()]=1;if(x.name!==nm){ren[x.empId]={was:x.name,now:nm};x.name=nm}});dhNames12(ren);return list}\n"
   "  if(ex&&ex.pilot===want.pilot&&ex.cabin===want.cabin&&ex.list){if(!ex.n12R1012A){uniq12(ex.list);ex.n12R1012A=1;try{save()}catch(_){}}return ex.list}")
RC('unique names virtual new',P121,"  S.crewExtraR121={pilot:want.pilot,cabin:want.cabin,list:list};",
   "  uniq12(list);S.crewExtraR121={pilot:want.pilot,cabin:want.cabin,list:list,n12R1012A:1};")

# ── #6 地勤個人區塊：標題「本日班別 早班」、下面派工卻寫「本日例休」
#   原因：標題讀 S.groundDateR7（舊地勤頁留下來的日期）優先，下面派工讀櫃檯分配頁的日期（S._cr74Date，最多到明天）——
#        兩個日期不一樣，週列上也同時亮兩天。→ 全部讀櫃檯分配頁同一個日期（curDate74）；明天以後的日子不能點（派工只排到明天）
RC('ground cur date expose','kgm-0823o-r74',"function curDate74(){var v=S._cr74Date||T(),max='';try{max=addDays(T(),1)}catch(_){max=T()}if(v>max)v=max;return v}",
   "function curDate74(){var v=S._cr74Date||T(),max='';try{max=addDays(T(),1)}catch(_){max=T()}if(v>max)v=max;return v}\n"
   "window.kgmCurDateR1012A=curDate74;   /* 1012A：地勤個人區塊（標題、週列、派工、梯次）一律用這個日期 */")
RC('ground hdr date','kgm-0902a-r102',"    var date=S.groundDateR7||S._cr74Date||S._gDateR3||today102();",
   "    var date=window.kgmCurDateR1012A?window.kgmCurDateR1012A():(S.groundDateR7||S._cr74Date||S._gDateR3||today102());   /* 1012A：跟下面派工同一天 */")
RC('ground chk date','kgm-0902a-r102',"      var date=S.groundDateR7||S._cr74Date||today102();",
   "      var date=window.kgmCurDateR1012A?window.kgmCurDateR1012A():(S.groundDateR7||S._cr74Date||today102());")
RC('ground r163 date','kgm-0905b-r163',"    var date=S.groundDateR7||S._cr74Date||S._gDateR3||today163();",
   "    var date=window.kgmCurDateR1012A?window.kgmCurDateR1012A():(S.groundDateR7||S._cr74Date||S._gDateR3||today163());")
RC('ground week fut','kgm-0902a-r102',"        var q=duty102(id,x),on=(x===date);\n        return '<span class=\"'+(q.off?'off ':'')+(on?'on':'')+'\" role=\"button\" tabindex=\"0\" '\n          +'title=\"'+(z()?('查看 '+x+' 的班表與派工'):('Open '+x))+'\" '\n          +'onclick=\"kgmGroundPickDayR914(\\''+x+'\\')\">'",
   "        var q=duty102(id,x),on=(x===date),fut=x>addD102(today102(),1);   /* 1012A：派工只排到明天，後面的日子只顯示預排班別、不能點 */\n"
   "        return '<span class=\"'+(q.off?'off ':'')+(on?'on':'')+(fut?' fut':'')+'\"'+(fut?' style=\"cursor:default;opacity:.72\"':' role=\"button\" tabindex=\"0\"')+' '\n"
   "          +'title=\"'+(fut?(z()?(x+' 預排班別（派工前一天排定）'):('Pre-roster for '+x)):(z()?('查看 '+x+' 的班表與派工'):('Open '+x)))+'\" '\n"
   "          +(fut?'>':('onclick=\"kgmGroundPickDayR914(\\''+x+'\\')\">'))")

# ── #5 每個報到櫃檯基本上 5 位員工；松山地勤太閒（例：K29107 一整天只有 1 項工作）
#   櫃檯人力原本是「1 班 3 人、2 班 4 人、3 班以上 5 人」，松山 2～3 人；改成每櫃 5 人（A388 6 人），人不夠時最少 3 人。
#   （之後使用者再補充「兩個航班至少五人、三個航班至少七人」→ 3 班 7 人，人數再補到桃園 426、松山 44）
#   人數：桃園 270 → 394、松山 20 → 36（松山原本有一半的人只排到 1～2 項工作，是因為櫃檯只排 1～2 人；櫃檯改 5 人以後工作量就補上來）
RC('ctr five','kgm-0907A-r194',"function needCtr8(ap,n,a388){\n  if(ap==='TSA')return {min:n>=2?2:1,ideal:n>=3?3:(n===2?3:2)};\n  var ideal=n>=3?5:(n===2?4:3);if(a388)ideal++;\n  return {min:n>=3?3:2,ideal:ideal};\n}",
   "function needCtr8(ap,n,a388){\n  /* 1012A：使用者「每個櫃檯基本上要有五個員工」、「基本上每個櫃檯兩個航班至少五人、三個航班至少七人」——\n     不分站：1～2 班 5 人、3 班 7 人（再多一班加 2 人），A388 再加 1 人；這是最少人力（排班先補滿櫃檯，再排登機門、到站） */\n  var m=n>=3?7+2*(n-3):5;if(a388)m++;\n  return {min:m,ideal:m};\n}")
RC('ctr pos 8','kgm-0907A-r194',"  {t:'超大行李',e:'Oversize bags',d:'超大行李送 X 光、行李件數與尾差核對',de:'Oversize bags to X-ray; bag counts and late figures'}\n];",
   "  {t:'超大行李',e:'Oversize bags',d:'超大行李送 X 光、行李件數與尾差核對',de:'Oversize bags to X-ray; bag counts and late figures'},\n"
   "  /* 1012A：3 班 7 人、A388 再加 1 人 —— 第 8、9 位不再重複「櫃檯組長」 */\n"
   "  {t:'自助託運',e:'Self bag-drop',d:'自助託運機旁協助、行李條補印、超重行李轉人工櫃檯',de:'Self bag-drop help, tag reprints, overweight bags to a staffed desk'},\n"
   "  {t:'團體報到',e:'Group check-in',d:'團體旅客整批報到、與領隊核對名單與證件',de:'Group check-in with the tour leader; list and document check'}\n];")
# ── 櫃檯最少人力還是偶爾不到（28 天：桃園 1,725 個櫃檯班次 4～9 次、松山 168 次 2～6 次；深夜／清晨與松山 13 點）：
#    那個時段班別合適的人都已經排在別的工作上，但其中有登機門／到站是「超過最少人力」的（例：登機門 3 人、最少 2 人）。
#    另外晚班的人一上班就被 16 點的工作排走，班長 9 小時撐不到深夜 01 點的櫃檯。
#    → 最後再補一次：櫃檯還缺人，就找班別排得進去的人，他身上卡住的工作交給有空的同仁接手（規則照舊檢查，接不上就整筆還原）。
RC('ground ctr rescue','kgm-0907A-r194',"  /* ④ 工時太短（< 3 小時）的人：他身上的工作若都超過最少人力就整個釋放回備勤，",
   "  /* 1012A ⑥：櫃檯還不到最少人力 → 找班別時間帶排得進去的人，把他身上會卡住的工作（時間重疊、或讓班長超過 9 小時／工時超過 8 小時）\n"
   "     交給別人：那項工作本來就超過最少人力就直接拿掉，否則找一位排得進去的同仁接手；全部接得上才換，接不上就整筆還原 */\n"
   "  (function(){\n"
   "    function rm12(P,x){x.who=x.who.filter(function(id){return id!==P.id});P.tasks=P.tasks.filter(function(y){return y!==x});P.work-=(x.b-x.a);\n"
   "      P.first=P.tasks.length?Math.min.apply(null,P.tasks.map(function(y){return y.a})):null;P.last=P.tasks.length?Math.max.apply(null,P.tasks.map(function(y){return y.b})):null;if(!P.tasks.length)P.term=null}\n"
   "    function snap(P){return {tasks:P.tasks.slice(),first:P.first,last:P.last,work:P.work,term:P.term}}\n"
   "    function back(P,s0){P.tasks.slice().forEach(function(x){x.who=x.who.filter(function(id){return id!==P.id})});P.tasks=s0.tasks.slice();P.tasks.forEach(function(x){if(x.who.indexOf(P.id)<0)x.who.push(P.id)});P.first=s0.first;P.last=s0.last;P.work=s0.work;P.term=s0.term}\n"
   "    function tryP(P,t){\n"
   "      var touched=[{P:P,s:snap(P)}],moved=[];\n"
   "      function undoAll(){for(var u=touched.length-1;u>=0;u--)back(touched[u].P,touched[u].s)}\n"
   "      P.tasks.filter(function(x){return x.a<t.b+10&&x.b+10>t.a}).forEach(function(x){rm12(P,x);moved.push(x)});\n"
   "      var g=0;while(!ok8(P,t,null)&&P.tasks.length&&g++<12){var far=P.tasks.slice().sort(function(a,b){return Math.abs(b.a-t.a)-Math.abs(a.a-t.a)})[0];rm12(P,far);moved.push(far)}\n"
   "      if(!ok8(P,t,null)){undoAll();return false}\n"
   "      for(var m=0;m<moved.length;m++){var x=moved[m];if(x.who.length>=x.min)continue;\n"
   "        var R=null,rc=1e9;people.forEach(function(Q){if(Q===P||Q.off||x.who.indexOf(Q.id)>=0)return;if(!ok8(Q,x,null))return;var c=cost8(Q,x);if(c<rc){rc=c;R=Q}});\n"
   "        if(!R){undoAll();return false}\n"
   "        if(!touched.some(function(z){return z.P===R}))touched.push({P:R,s:snap(R)});add8(R,x)}\n"
   "      add8(P,t);P.rescueR1012A=1;return true;\n"
   "    }\n"
   "    /* 白天／中／晚班可以提早 60 分鐘上班：換班別會撞到的日子已排休，所以前一天一定是同班別或更早的班別，最晚下班＋11 小時＝白天 04:30／中班 09:00／晚班 14:30，都早於提早後的上班時間；早班不提早 */\n"
   "    tasks.filter(function(t){return t.kind==='ctr'&&t.who.length<t.min}).forEach(function(t){\n"
   "      var cands=people.filter(function(P){return !P.off&&t.who.indexOf(P.id)<0&&t.a>=P.win0-(P.band==='early'?0:60)&&t.b<=P.win1}).sort(function(a,b){return a.tasks.length-b.tasks.length||a.work-b.work||a.ord-b.ord});\n"
   "      for(var i=0;i<cands.length&&t.who.length<t.min;i++){var P=cands[i],w0=P.win0;if(t.a<P.win0)P.win0=t.a;if(!tryP(P,t))P.win0=w0}\n"
   "    });\n"
   "  })();\n"
   "  /* ④ 工時太短（< 3 小時）的人：他身上的工作若都超過最少人力就整個釋放回備勤，")
# ── 地勤前後兩天休息不到 11 小時（勞基法 §34；1010A 就有）：班別每週輪替，從晚班（或中班）轉回比較早的班別那一天，
#    前一天晚班最晚 03:30 下班、這天早班最早 03:00 上班。→ 換班別那天，前一天有上班、而且前一天班別最晚下班 ＋11 小時
#    超過這天班別最早上班，這天排休（標「換班別休息」）；派工（person8）跟班表顯示（kgmGroundDutyR99）用同一個判斷。
RC('ground rest11 person','kgm-0907A-r194',"function person8(p,date){\n  var d=null;try{d=DUTY08(p.empId,date)}catch(_){d=null}\n  if(!d||d.off)return {id:p.empId,p:p,off:true,base:d};",
   "/* 1012A：換班別那一天前後休息不到 11 小時 → 這天排休 */\n"
   "function rest12(id,date){try{var t=new Date(date+'T12:00:00Z');t.setUTCDate(t.getUTCDate()-1);var pd=t.toISOString().slice(0,10);\n"
   "  var pv=DUTY08(id,pd);if(!pv||pv.off)return false;var a=window.kgmGroundBandR1008A(id,pd),b=window.kgmGroundBandR1008A(id,date);\n"
   "  return !!(a&&b&&a.k!==b.k&&(a.w[1]+660-1440)>b.w[0])}catch(_){return false}}\n"
   "window.kgmGroundRest11R1012A=rest12;\n"
   "function person8(p,date){\n  var d=null;try{d=DUTY08(p.empId,date)}catch(_){d=null}\n"
   "  if(d&&!d.off&&rest12(p.empId,date))d={off:true,k:'off',label:z()?'換班別休息':'Shift-change rest',from:'',to:'',hours:0,restR1012A:true};\n"
   "  if(!d||d.off)return {id:p.empId,p:p,off:true,base:d};")
RC('ground rest11 duty','kgm-0907A-r194',"    var d=DUTY08.apply(this,arguments);\n    if(BUSY8||!d||d.off)return d;",
   "    var d=DUTY08.apply(this,arguments);\n"
   "    try{if(d&&!d.off&&rest12(id,date))return {off:true,k:'off',label:z()?'換班別休息':'Shift-change rest',from:'',to:'',hours:0,restR1012A:true}}catch(_){}   /* 1012A：前後休息 11 小時 */\n"
   "    if(BUSY8||!d||d.off)return d;")
RC('ground target','kgm-0907A-r194',"var GTARGET8=290,","var GTARGET8=492,   /* 1012A：1～2 班的櫃檯 5 人、3 班 7 人、換班別那天排休：桃園 444＋松山 48 */")
RW('tsa team size','.slice(0,20).forEach(function(x){ids[x.empId]=1});TSAT1006A={k:k,ids:ids}}','.slice(0,48).forEach(function(x){ids[x.empId]=1});TSAT1006A={k:k,ids:ids}}   /* 1012A：松山 20 → 48 位（1～2 班的櫃檯 5 人、3 班 7 人、換班別那天排休） */')

# ══ 1012A 新增要存檔（前後台同步）的欄位 ══════════════════════════════════════
PERSIST_1012A=[('crewWorkR1012A','kgm12_crewwork','{}'),('nameFixR1012A','kgm12_namefix','{}'),('mgrR1012A','kgm12_mgr','{}'),('kxSwapR1012A','kgm12_kxswap','null')]
def _persist():
  si=''.join('%s:LS.get("%s",%s),'%(f,k,d) for f,k,d in PERSIST_1012A)
  sv=''.join('LS.set("%s",S.%s||%s);'%(k,f,d) for f,k,d in PERSIST_1012A)
  RW('r1012A S init','staffLinkR1010A:LS.get("kgm10_stflink",{}),','staffLinkR1010A:LS.get("kgm10_stflink",{}),'+si)
  RW('r1012A save','LS.set("kgm10_stflink",S.staffLinkR1010A||{});','LS.set("kgm10_stflink",S.staffLinkR1010A||{});'+sv)

_persist()
RC('ground fill pass','kgm-0907A-r194',"  /* ④ 工時太短（< 3 小時）的人：他身上的工作若都超過最少人力就整個釋放回備勤，",
   "  /* 1012A ⑤：照時間順序走過還缺人的工作（先補到最少人力、再補到建議人力；櫃檯 → 登機門 → 到站），\n"
   "     找已經在上班、班別時間帶涵蓋、排得進去的人（跟前一項工作中間可以空到 4 小時；班別 9 小時、工時 8 小時、連續 4.5 小時要用餐的規則照舊）。\n"
   "     原本每個人只往後接「75 分鐘內」的下一項，晚上的櫃檯、登機門沒人接，中班的同仁卻整天只排到 1 項。 */\n"
   "  ['min','ideal'].forEach(function(lv){['ctr','gate','arr'].forEach(function(kd){tasks.filter(function(t){return t.kind===kd}).forEach(function(t){\n"
   "    var need=lv==='min'?t.min:t.ideal,guard=0;while(t.who.length<need&&guard++<8){var P=pick8(people,t,false,240)||(kd==='ctr'?pick8(people,t,true,240):null);if(!P)break;add8(P,t)}})})});\n"
   "  /* 櫃檯叫來的人：再幫他把同一時段附近還缺人的登機門／到站接上（一樣照班別規則），工時才不會太短 */\n"
   "  people.forEach(function(P){if(!P.off&&P.tasks.length&&P.work<240)chain8(P,tasks,'ideal')});\n"
   "  /* ④ 工時太短（< 3 小時）的人：他身上的工作若都超過最少人力就整個釋放回備勤，")

RC('ground short threshold','kgm-0907A-r194',"    if(P.off||!P.tasks.length||P.work>=180)return;",
   "    if(P.off||!P.tasks.length||P.work>=120)return;   /* 1012A：櫃檯要排滿 5 人 —— 工時 2 小時以上就留著（原本 3 小時） */")

#   松山的班別輪替原本是 [早,早,日,日,中]，沒有晚班 —— 16:30 以後的櫃檯、18:00 以後的登機門與 20:00 的到站只能靠少數中班的人，
#   早班、日班的人卻閒著。改成 [早,早,早,日,日,中,中,晚]（一週一換，前後兩天至少休 11 小時的規則不變）
RW('tsa bands',"var ROT8=[0,0,0,1,1,1,2,2,3,3],ROT8TSA=[0,0,1,1,2];","var ROT8=[0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,3,3,3,3,3],ROT8TSA=[0,0,0,1,1,2,2,3];   /* 1012A：松山要有晚班，早班也要夠（清晨兩個櫃檯）；桃園深夜（22 點後長程）晚班不夠、白天班常有人閒著 → 早 3 成、白天 2.5 成、中 2 成、晚 2.5 成（原本 3／3／2／2） */")

# ── #3 後台分頁：「地勤班表」從「登機門／櫃檯」拆出來成為獨立分頁（人資與組員，組員班表旁邊）；#4 新分頁「主管紀錄」
#   地勤班表分頁沿用同一個櫃檯頁面的個人班表區塊（同一份資料、同一個日期），只顯示選站、選人、個人班表／週班表／月班表；
#   登機門／櫃檯分頁只留櫃檯分配、梯次、航班與停機位。
RW('admin route tabs',"else if(tab==='fleetsched')body='<div class=\"k69-host\"></div>';else if(tab==='groundops'||tab==='gates')body=(typeof window.kgmPage74R914==='function'?window.kgmPage74R914():'<div class=\"k74-host\"></div>');",
   "else if(tab==='fleetsched')body='<div class=\"k69-host\"></div>';else if(tab==='mgr12')body=(window.kgmMgrPageR1012A?window.kgmMgrPageR1012A():'');   /* 1012A：主管紀錄 */\n"
   "else if(tab==='groundops'||tab==='gates'||tab==='groundroster12')body='<div class=\"k12-gtab k12-g-'+(tab==='groundroster12'?'roster':'ops')+'\">'+(typeof window.kgmPage74R914==='function'?window.kgmPage74R914():'<div class=\"k74-host\"></div>')+'</div>';   /* 1012A：地勤班表拆成自己的分頁 */")
RW('nav groups r49',"['人資與組員',[['staff','員工管理'],['sched','組員班表'],['fleetsched','機隊排班'],['leave','請假管理'],['stafftix','員工票'],['stxstatus','員工票狀態'],['salary','薪資功過']]]",
   "['人資與組員',[['staff','員工管理'],['sched','組員班表'],['groundroster12','地勤班表'],['mgr12','主管紀錄'],['fleetsched','機隊排班'],['leave','請假管理'],['stafftix','員工票'],['stxstatus','員工票狀態'],['salary','薪資功過']]]")
RW('nav groups r123',"  ['人資與組員',[['staff','員工管理'],['sched','組員班表'],['fleetsched','機隊排班'],\n    ['leave','請假管理'],['stafftix','員工票'],['stxstatus','員工票狀態'],['salary','薪資功過']]],",
   "  ['人資與組員',[['staff','員工管理'],['sched','組員班表'],['groundroster12','地勤班表'],['mgr12','主管紀錄'],['fleetsched','機隊排班'],   /* 1012A */\n    ['leave','請假管理'],['stafftix','員工票'],['stxstatus','員工票狀態'],['salary','薪資功過']]],")
RW('nav can ground',"if(r==='ground')return ['flightdata','groundops','bookings','cases0831B','checkin_fail','leave','stafftix','stxstatus','salary','chat'].indexOf(tab)>=0;return ['sched','leave','stafftix','stxstatus','salary','chat'].indexOf(tab)>=0}",
   "if(r==='ground')return ['flightdata','groundops','groundroster12','mgr12','bookings','cases0831B','checkin_fail','leave','stafftix','stxstatus','salary','chat'].indexOf(tab)>=0;return ['sched','mgr12','leave','stafftix','stxstatus','salary','chat'].indexOf(tab)>=0}")
RW('perm ground',"  ground:{flightdata:'view',groundops:'use',bookings:'use',cases0831B:'use',\n    leave:'use',stafftix:'use',stxstatus:'use',salary:'view',chat:'use',status:'view'},",
   "  ground:{flightdata:'view',groundops:'use',groundroster12:'use',mgr12:'use',bookings:'use',cases0831B:'use',   /* 1012A：地勤班表、主管紀錄 */\n    leave:'use',stafftix:'use',stxstatus:'use',salary:'view',chat:'use',status:'view'},")
RW('perm crew pilot',"  crew:{status:'view',sched:'view',leave:'use',stafftix:'use',stxstatus:'use',",
   "  crew:{status:'view',sched:'view',mgr12:'use',leave:'use',stafftix:'use',stxstatus:'use',   /* 1012A：座艙長點名 */")
RW('mount r74 tab',"if(!(S.adminAuthed&&S.view==='admin'&&(S.adminTab==='gates'||S.adminTab==='groundops'))){",
   "if(!(S.adminAuthed&&S.view==='admin'&&(S.adminTab==='gates'||S.adminTab==='groundops'||S.adminTab==='groundroster12'))){")
RC('gtab css',R229,"    window.kgmCrewUpdateR928=function(){",
   "    /* 1012A：同一個櫃檯頁面，兩個分頁各看各的 */\n"
   "    (function(){if(document.getElementById('k12-gtab-css'))return;var s=document.createElement('style');s.id='k12-gtab-css';\n"
   "      s.textContent='.k12-g-ops .k74-person,.k12-g-ops .k99-roster,.k12-g-roster .k99-roster{display:none!important}'\n"
   "        +'.k12-g-roster .k74-slot-tabs,.k12-g-roster .k74-flightlist,.k12-g-roster .k74-stand,.k12-g-roster .k914-ptr,.k12-g-roster .k74-bar,.k12-g-roster .k74-rx,.k12-g-roster .k74-gates{display:none!important}'\n"
   "        +'.k12-g-roster .k74-person{margin-top:14px}';(document.head||document.documentElement).appendChild(s)})();\n"
   +open('js/mgr12.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")
# 主管加給、無故缺席扣薪 → 薪資功過的月薪
RW('salary mgr',"  return{base:base,yrs:yrs,sen:sen,perf:perf,bonus:bonus,adj:adj,restWork:rw,restPay:rpay,holidayPay:hpay,restNext:rn,restNextPay:npay,reimb:reimb,reimbItems:reimbItems,monthly:Math.round(base*sen*perf)+bonus+adj+rpay+hpay+reimb,items:items,",
   "  /* 1012A：主管職務加給（Manager I／II／III 每月 NT$8,000／15,000／25,000）；本月無故缺席每次扣當日薪資（月薪 ÷ 30） */\n"
   "  var mgrA=0,absN=0,absD=0;try{mgrA=window.kgmMgrAllowR1012A?(+window.kgmMgrAllowR1012A(stf.empId)||0):0;var ym12=todayISO().slice(0,7);\n"
   "    (((S.mgrR1012A||{}).absent)||[]).forEach(function(a){if(a&&a.empId===stf.empId&&!a.voided&&String(a.date).slice(0,7)===ym12)absN++});absD=Math.round(base*sen/30)*absN}catch(_){}\n"
   "  return{base:base,yrs:yrs,sen:sen,perf:perf,bonus:bonus,adj:adj,restWork:rw,restPay:rpay,holidayPay:hpay,restNext:rn,restNextPay:npay,reimb:reimb,reimbItems:reimbItems,mgrAllowR1012A:mgrA,absentR1012A:absN,absentDedR1012A:absD,monthly:Math.round(base*sen*perf)+bonus+adj+rpay+hpay+reimb+mgrA-absD,items:items,")

# ── 地勤員工姓名「Pei-Yun undefined」：產生器 LN8[(h>>5)%20] —— 雜湊值 ≥ 2^31 時 >> 變負數、索引 undefined（1008A 起的舊問題，
#    這輪地勤補到 430 人才大量出現：154 位）。改成 >>>，已存檔的壞名字依同一套規則重算；之後再跑一次重名修正。
RC('ground name gen','kgm-0907A-r194',"name:FN8[h%FN8.length]+' '+LN8[(h>>5)%LN8.length],",
   "name:FN8[h%FN8.length]+' '+LN8[(h>>>5)%LN8.length],   /* 1012A：>> → >>>（負數索引變 undefined） */")
RC('ground name repair','kgm-0907A-r194',"    if(G.length>=GTARGET8)return 0;",
   "    /* 1012A：之前存檔的「名 undefined」重算姓氏 */\n"
   "    var fx12=0;G.forEach(function(x){if(x.groundGeneratedR1008A&&/ undefined$/.test(String(x.name||''))){var h=H(x.empId+'|n8');x.name=FN8[h%FN8.length]+' '+LN8[(h>>>5)%LN8.length];fx12++}});\n"
   "    if(fx12){try{if(S.nameFixR1012A)S.nameFixR1012A.len=-1}catch(_){}try{window.kgmFixStaffNamesR1012A&&window.kgmFixStaffNamesR1012A()}catch(_){}try{save()}catch(_){}}\n"
   "    if(G.length>=GTARGET8)return 0;")
RC('ground name dedupe after add','kgm-0907A-r194',"    if(n){SIDX8=null;try{save()}catch(_){}}",
   "    if(n){SIDX8=null;try{window.kgmFixStaffNamesR1012A&&window.kgmFixStaffNamesR1012A()}catch(_){}try{save()}catch(_){}}   /* 1012A：新增的人也不能跟別人同名 */")
# 松山地勤每週各班別人數不平均（班別＝員編雜湊輪替；44 人時一週早班 13～22 人、白天班 7～17 人、晚班 2～10 人），早上或下午的櫃檯就會缺人
#   → 松山改用「依雜湊排序後的名次」輪替：每一週每個班別的人數固定（相差最多 1 人）。桃園人多、每週差不大，維持雜湊。相位（主管小組）用同一個算法。
RC('ground phase expose','kgm-0907A-r194',"  return BANDS8[R[(week8(date)+H('b8|'+id))%R.length]]};",
   "  return BANDS8[R[(week8(date)+off12(id,R))%R.length]]};\n"
   "/* 1012A：松山依名次輪替，每週各班別人數平均 */\n"
   "var TSARK12={s:null,n:-1,m:{}};\n"
   "function tsaRank12(id){var st=S.staff||[];if(TSARK12.s!==st||TSARK12.n!==st.length){var G=st.filter(function(x){return x&&x.role==='ground'&&x.active!==false&&window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(x.empId)}).map(function(x){return x.empId});\n"
   "  G.sort(function(a,b){return H('b8|'+a)-H('b8|'+b)||String(a).localeCompare(String(b))});var m={};G.forEach(function(e,i){m[e]=i});TSARK12={s:st,n:st.length,m:m}}\n"
   "  return TSARK12.m[id]!=null?TSARK12.m[id]:-1}\n"
   "function off12(id,R){if(R===ROT8TSA){try{var r=tsaRank12(id);if(r>=0)return r}catch(_){}}return H('b8|'+id)}\n"
   "/* 1012A：輪替相位 —— 相位相同的人每一週都是同一個時段（主管紀錄的地勤小組依這個分組） */\n"
   "window.kgmGroundPhaseR1012A=function(id){var R=ROT8;try{if(window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(id))R=ROT8TSA}catch(_){}return {p:off12(id,R)%R.length,n:R.length}};")

RC('crew pool dedupe names','kgm-0817b-r43',"  if(made){try{save()}catch(_){}}\n  return {pilots:",
   "  if(made){try{window.kgmFixStaffNamesR1012A&&window.kgmFixStaffNamesR1012A()}catch(_){}try{save()}catch(_){}}   /* 1012A：補進來的機師／客艙組員也不能跟別人同名 */\n  return {pilots:")
# ── #15 員工管理：依職務分組，每個職務一張可以收合的表（＋／－）；每一列加「主管」欄（目前等級＋任命按鈕，帶進主管紀錄） ──
RW('staff groups','    <div class="adm-card"><div style="overflow-x:auto"><table class="adm-tbl">\n      <tr><th>員工編號</th><th>姓名</th><th>職務</th><th>特休</th><th>Email</th><th>在職狀態（CEO）</th><th></th></tr>\n      ${S.staff.length?S.staff.map(function(s,idx){var es=s.employmentStatus||(s.active===false?"suspended":"active");return \'<tr><td><b>\'+s.empId+\'</b></td><td>\'+s.name+\'</td><td><span class="chip chip-mut">\'+({ground:"地勤",cabin:"組員",pilot:"飛行員",backend:"後台",service:"客服",ceo:"CEO",admin:"管理員",other:"其他"}[s.role]||s.role)+\'</span></td><td>\'+annualLeaveDays2(s.hireDate,s.role)+\' 天</td><td style="color:#778">\'+(s.email||"")+\'</td><td><select class="inp" style="min-width:120px;height:32px" \'+(isCEO()?"":"disabled")+\' onchange="kgmSetEmploymentStatus0831A(&#39;\'+s.empId+\'&#39;,this.value)">\'+[["active","在職"],["suspended","停職"],["retired","退休"],["resigned","離職"],["terminated","解僱"]].map(function(o){return \'<option value="\'+o[0]+\'"\'+(es===o[0]?\' selected\':\'\')+\'>\'+o[1]+\'</option>\'}).join(\'\')+\'</select></td><td style="text-align:right"><button class="btn btn-sm chip-err" style="background:#fde2e2;color:#b3261e;border-color:#f7bcbc" onclick="doRemoveStaff(&#39;\'+s.empId+\'&#39;)">\'+(S._rmConfirm===s.empId?"⚠ 再按一次確認移除":"移除")+\'</button></td></tr>\';}).join(""):\'<tr><td colspan="7" style="text-align:center;color:#889;padding:16px">尚無員工，請於上方註冊。</td></tr>\'}\n    </table></div></div>`;','    <div class="adm-card k12st">${(function(){/* 1012A：員工名冊依職務分組，每組一張表，按標題展開／收合（狀態存在 S，重畫不會跑掉）；每一列加「主管」欄 */\n      window.kgmStaffGrpR1012A=window.kgmStaffGrpR1012A||function(k){S._stfOpenR1012A=S._stfOpenR1012A||{};S._stfOpenR1012A[k]=!S._stfOpenR1012A[k];render()};\n      var RL={pilot:"飛行員",cabin:"客艙組員",ground:"地勤人員",service:"客服人員",backend:"系統人員",pricing:"定價人員",ceo:"CEO",admin:"管理員",other:"其他"},ORD=["pilot","cabin","ground","service","backend","pricing","ceo","admin","other"],G={},OP=S._stfOpenR1012A||{};\n      S.staff.forEach(function(s){var r=RL[s.role]?s.role:"other";(G[r]=G[r]||[]).push(s)});\n      var LV=["","Manager I","Manager II","Manager III"],mg=function(id){try{return window.kgmMgrOfR1012A?window.kgmMgrOfR1012A(id):null}catch(_){return null}};\n      if(!S.staff.length)return \'<div style="text-align:center;color:#889;padding:16px">尚無員工，請於上方註冊。</div>\';\n      return \'<style>.k12st-g{border:1px solid #e3ebe7;border-radius:12px;margin-bottom:10px;overflow:hidden;background:#fff}.k12st-h{display:flex;align-items:center;gap:10px;width:100%;border:0;background:#f6faf8;padding:11px 14px;cursor:pointer;text-align:left;font:inherit}.k12st-h:hover{background:#eef5f1}.k12st-h .pm{width:22px;height:22px;border-radius:7px;border:1px solid #c9dbd2;background:#fff;color:#1f4e46;font-weight:900;display:inline-flex;align-items:center;justify-content:center;flex:none}.k12st-h b{font-size:14px;color:#123c32}.k12st-h small{color:#6b7b74;font-size:11.5px}.k12st-h .rt{margin-left:auto;display:flex;gap:6px}.k12st-h .rt span{font-size:11px;border-radius:999px;padding:2px 9px;background:#fff;border:1px solid #dbe6e0;color:#476a5f}.k12st-b{overflow-x:auto;border-top:1px solid #e3ebe7}.k12st-lv{display:inline-block;font:800 10.5px ui-monospace,Menlo,monospace;border-radius:999px;padding:3px 9px;background:#eef5f1;color:#1f4e46;border:1px solid #cfe1d6;margin-right:6px}.k12st-lv.l3{background:#1f4e46;color:#fff}</style>\'\n        +\'<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px"><b style="font-size:13px">員工名冊</b><small style="color:#6b7b74">依職務分組，共 \'+S.staff.length+\' 人；按標題展開／收合</small></div>\'\n        +ORD.filter(function(r){return G[r]&&G[r].length}).map(function(r){var L=G[r],on=!!OP[r],act=L.filter(function(s){return s.active!==false&&(s.employmentStatus||"active")==="active"}).length,nm=L.filter(function(s){return mg(s.empId)}).length;\n          return \'<div class="k12st-g"><button class="k12st-h" onclick="kgmStaffGrpR1012A(&#39;\'+r+\'&#39;)"><span class="pm">\'+(on?\'－\':\'＋\')+\'</span><b>\'+RL[r]+\'</b><small>\'+L.length+\' 人</small><span class="rt"><span>在職 \'+act+\'</span>\'+(nm?\'<span>主管 \'+nm+\'</span>\':\'\')+\'</span></button>\'\n            +(on?\'<div class="k12st-b"><table class="adm-tbl" style="margin:0"><tr><th>員工編號</th><th>姓名</th><th>職務</th><th>特休</th><th>Email</th><th>在職狀態（CEO）</th><th>主管</th><th></th></tr>\'\n              +L.map(function(s,idx){var es=s.employmentStatus||(s.active===false?"suspended":"active"),M=mg(s.empId);return \'<tr><td><b>\'+s.empId+\'</b></td><td>\'+s.name+\'</td><td><span class="chip chip-mut">\'+({ground:"地勤",cabin:"組員",pilot:"飛行員",backend:"後台",service:"客服",ceo:"CEO",admin:"管理員",other:"其他"}[s.role]||s.role)+\'</span></td><td>\'+annualLeaveDays2(s.hireDate,s.role)+\' 天</td><td style="color:#778">\'+(s.email||"")+\'</td><td><select class="inp" style="min-width:120px;height:32px" \'+(isCEO()?"":"disabled")+\' onchange="kgmSetEmploymentStatus0831A(&#39;\'+s.empId+\'&#39;,this.value)">\'+[["active","在職"],["suspended","停職"],["retired","退休"],["resigned","離職"],["terminated","解僱"]].map(function(o){return \'<option value="\'+o[0]+\'"\'+(es===o[0]?\' selected\':\'\')+\'>\'+o[1]+\'</option>\'}).join(\'\')+\'</select></td><td style="white-space:nowrap">\'+(M?\'<span class="k12st-lv l\'+M.level+\'">\'+LV[+M.level]+\'</span>\':\'\')+\'<button class="btn btn-sm" onclick="kgmMgrPrefillR1012A(&#39;\'+s.empId+\'&#39;)">主管</button></td><td style="text-align:right"><button class="btn btn-sm chip-err" style="background:#fde2e2;color:#b3261e;border-color:#f7bcbc" onclick="doRemoveStaff(&#39;\'+s.empId+\'&#39;)">\'+(S._rmConfirm===s.empId?"⚠ 再按一次確認移除":"移除")+\'</button></td></tr>\';}).join("")+\'</table></div>\':\'\')+\'</div>\'}).join(\'\')})()}\n    </div>`;')

# ── #20 員工票狀態的候補預覽：拿掉「到航班資料處理」那顆按鈕；旅客、員工姓名改成遮蔽顯示（例：CHEN YU-TING → C*** Y***-T***），保護隱私 ──
RW('stx prev anon',"<td><b>'+hE(r.name)+'</b>'+(r.simR929?","<td><b>'+hE(anon12(r.name))+'</b>'+(r.simR929?",2)
RW('stx prev no goto',"<button class=\"btn btn-g\" onclick=\"kgmStxPrevGoR1010A()\">到航班資料處理 ›</button>","")
RW('stx prev anon fn',"      var CZ={First:'頭等',Business:'商務',Premium:'豪經',Economy:'經濟'};\n      var w=function(){var h=g.apply(this,arguments),p=S.stxPrevR1010A;",
   "      var CZ={First:'頭等',Business:'商務',Premium:'豪經',Economy:'經濟'};\n"
   "      /* 1012A：員工票狀態每個職務都看得到 —— 姓名只留每個字的第一個字母 */\n"
   "      function anon12(n){return String(n||'').trim().split(/(\\s+|\\/|-)/).map(function(t){return /^[A-Za-z\\u00C0-\\u024F]{2,}$/.test(t)?t.charAt(0).toUpperCase()+'***':(/^[\\u4e00-\\u9fff]{2,}$/.test(t)?t.charAt(0)+'*'.repeat(t.length-1):t)}).join('')}\n"
   "      var w=function(){var h=g.apply(this,arguments),p=S.stxPrevR1010A;")

# 薪資功過：本月薪資旁邊寫出主管加給、無故缺席扣薪（不然數字對不起來）
RW('salary self mgr rows',"""            <tr style="font-weight:900;color:var(--g)"><td>本月薪資</td><td style="text-align:right;font-size:16px">NT$ ${sal.monthly.toLocaleString()}</td></tr>""",
   """            ${sal.mgrAllowR1012A?`<tr><td>主管職務加給（${(window.kgmMgrOfR1012A&&window.kgmMgrOfR1012A(_meS.empId)?['','Manager I','Manager II','Manager III'][+window.kgmMgrOfR1012A(_meS.empId).level]:'')}）</td><td style="text-align:right">+ NT$ ${sal.mgrAllowR1012A.toLocaleString()}</td></tr>`:""}
            ${sal.absentDedR1012A?`<tr style="color:#9b2c1c"><td>無故缺席扣薪（本月 ${sal.absentR1012A} 天 × 當日薪資＝月薪 ÷ 30）</td><td style="text-align:right">− NT$ ${sal.absentDedR1012A.toLocaleString()}</td></tr>`:""}
            <tr style="font-weight:900;color:var(--g)"><td>本月薪資</td><td style="text-align:right;font-size:16px">NT$ ${sal.monthly.toLocaleString()}</td></tr>""")
RW('salary table mgr note',"""<td style="text-align:right;font-weight:800;color:var(--g)">NT$ '+sal.monthly.toLocaleString()+'</td>""",
   """<td style="text-align:right;font-weight:800;color:var(--g)">NT$ '+sal.monthly.toLocaleString()+(sal.mgrAllowR1012A?'<div style="font-size:10px;color:#476a5f;font-weight:600">含主管加給 '+sal.mgrAllowR1012A.toLocaleString()+'</div>':'')+(sal.absentDedR1012A?'<div style="font-size:10px;color:#9b2c1c;font-weight:600">缺席扣薪 −'+sal.absentDedR1012A.toLocaleString()+'</div>':'')+'</td>""")

# ── #12 已經過去的航班也要有完整的競標紀錄（例：KX4 2026-01-18）：1010A 只補「起飛 60 天內」，兩個地方都卡 60 天 → 放寬到兩年；
#    競標用的班機物件先套用季節（過去那一天實際的時刻、機型）
RW('auc past 2y',"if(d>=T0||d<addDays(T0,-60))return 0;","if(d>=T0||d<addDays(T0,-730))return 0;   /* 1012A：過去兩年內的每一天都補 */")
RW('auc past season f',"var k=f.fr+f.to;if(seen[k])return;seen[k]=1;try{n+=window.kgmEnsureAuctionsR922(c,d,f)||0}catch(_){}",
   "var k=f.fr+f.to;if(seen[k])return;seen[k]=1;var sf=f;try{sf=(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,d))||f}catch(_){sf=f}try{var K12=window.KGM_BD_SEEN_R929;if(K12&&!(S.bigDeals||[]).some(function(b){return b&&b.code===c&&b.date===d&&b.fr===sf.fr&&b.to===sf.to}))delete K12[c+'|'+d+'|'+sf.fr+sf.to]}catch(_){}   /* 1012A：起飛 3 天後模擬 BigDeal 不存檔（1010A），再搜尋時要能重新補出來，不能被「這次開頁已補過」擋住 */try{n+=window.kgmEnsureAuctionsR922(c,d,sf)||0}catch(_){}")
RW('auc ensure 2y',"if(!isFinite(hrs)||hrs<=-60*24)return 0;","if(!isFinite(hrs)||hrs<=-730*24)return 0;   /* 1012A：60 天 → 兩年 */")

# ── #2 第五航權（經停）航班：哩程升等候補、員工票候補分段；前台可以只升其中一段（js/ff12.js） ─────────────
RC('sb list pass leg','kgm-0816d-r40',"  var rows=[];try{rows=window.kgmStandbyListR40(code,date)||[]}catch(_){}",
   "  var rows=[];try{rows=window.kgmStandbyListR40(code,date,fr,to)||[]}catch(_){}   /* 1012A：經停航班依航段列出 */")
RC('sb panel pass leg','kgm-0816d-r40',"  var rows=window.kgmStandbyListR40(f.code,f.date);","  var rows=window.kgmStandbyListR40(f.code,f.date,f.fr,f.to);   /* 1012A：經停航班依航段列出 */")
RC('sb row leg tag','kgm-0816d-r40',"simTag(r)+'PNR <span class=\"r40-mono\">'","simTag(r)+(r.legTagR1012A||'')+'PNR <span class=\"r40-mono\">'",2)
RW('stx prev leg tag',"+(r.simR929?' <i class=\"k10sp-sim\">模擬</i>':'')+'<small>PNR '","+(r.simR929?' <i class=\"k10sp-sim\">模擬</i>':'')+'<small>'+(r.legTagR1012A||'')+'PNR '",2)
RW('desk upg leg tag',"return '<div class=\"k6-mup-row\"><span><b>'+E(r.code)+'</b>　'+E(r.date)+'　'+E(cz(r.prevCabinR922||cabOf(r.fromClass||r.prevClsR922)||''))+' → '+E(cz(r.toCabin||''))",
   "return '<div class=\"k6-mup-row\"><span><b>'+E(r.code)+'</b>'+(r.legR1012A?' <i class=\"k12-leg\">'+E(r.legR1012A.replace('-','→'))+(Z()?' 單段':' leg')+'</i>':'')+'　'+E(r.date)+'　'+E(cz(r.prevCabinR922||cabOf(r.fromClass||r.prevClsR922)||''))+' → '+E(cz(r.toCabin||''))")
RW('upg card pass leg',"onclick=\"doRequestUpgrade(\\''+attr0815(bk.pnr)+'\\',\\''+p.seg+'\\',\\''+o.type+'\\',\\''+o.to+'\\')\">",
   "onclick=\"doRequestUpgrade(\\''+attr0815(bk.pnr)+'\\',\\''+p.seg+'\\',\\''+o.type+'\\',\\''+o.to+'\\',\\''+(o.legKey||'')+'\\')\">")   # 1012A：經停航班帶航段
RW('desk upg segs per leg',"      var segs=['out','inb'].filter(function(k){return b[k+'F']&&!reqs.some(function(r){return (r.seg||'out')===k})});",
   "      var segs=['out','inb'].filter(function(k){return b[k+'F']});   /* 1012A：經停航班兩段分開升等 —— 已申請的那一段不再列（下面逐一選項判斷） */")
RW('desk upg opt filter',"        o.filter(function(x){return x&&!x.auction&&x.to&&x.to!=='Resident'}).forEach(function(x){",
   "        o.filter(function(x){return x&&!x.auction&&x.to&&x.to!=='Resident'&&!reqs.some(function(r){return (r.seg||'out')===k&&(!x.legKey||!r.legR1012A||r.legR1012A===x.legKey)})}).forEach(function(x){")
RW('desk upg btn leg',"onclick=\"kgmDeskUpgR1006A(\\''+A(b.pnr)+'\\',\\''+k+'\\',\\''+A(x.type)+'\\',\\''+A(x.to)+'\\','+mi+','+(inst?1:0)+')\">'",
   "onclick=\"kgmDeskUpgR1006A(\\''+A(b.pnr)+'\\',\\''+k+'\\',\\''+A(x.type)+'\\',\\''+A(x.to)+'\\','+mi+','+(inst?1:0)+',\\''+A(x.legKey||'')+'\\')\">'")
RW('desk upg fn leg',"  window.kgmDeskUpgR1006A=function(pnr,seg,type,to,miles,inst){","  window.kgmDeskUpgR1006A=function(pnr,seg,type,to,miles,inst,leg){   /* 1012A：leg＝經停航班的那一段 */")
RW('desk upg req leg',"      try{r=asOwner(bk(pnr),function(){return window.requestUpgrade(pnr,seg,type,to)})}catch(e){r={ok:false,why:e.message}}",
   "      try{r=asOwner(bk(pnr),function(){return window.requestUpgrade(pnr,seg,type,to,leg||'')})}catch(e){r={ok:false,why:e.message}}")
RC('ff12 embed',R229,"    window.kgmCrewUpdateR928=function(){",open('js/ff12.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")

# ── #1 規章：《員工管理辦法》Rev. C（主管職務、出勤點名、無故缺席；pol/pol12.py 排版），後台右上角內嵌的 PDF 換成同一份 ──
_HR=open('pol/KGM-HR-001.pdf','rb').read()
import pypdf, io
_NP=len(pypdf.PdfReader(io.BytesIO(_HR)).pages)
_a=CUR.index("window.KGM_EMP_POLICY_PDF_R1004B='")+len("window.KGM_EMP_POLICY_PDF_R1004B='");_e=CUR.index("'",_a)
RC('hr001 pdf 12','kgm-0831c-r86',CUR[_a:_e],'data:application/pdf;base64,'+base64.b64encode(_HR).decode())
RC('hr001 meta 12','kgm-0831c-r86',"  ver:'2026.10（Rev. B）',eff:'2026-10-06',pages:12,arts:32,owner:'人力資源處',approver:'董事長',issued:'2026-10-05',",
   "  ver:'2026.10（Rev. C）',eff:'2026-10-12',pages:%d,arts:36,owner:'人力資源處',approver:'董事長',issued:'2026-10-11',   /* 1012A：Rev. C 主管職務、出勤點名 */"%_NP)

# ── #18 飛機排班多飛不同地方（js/var12.js：台北地面換手、整串互換，不增減航段） ──
RC('rot strip pending','kgm-0823o-r72',"function stripHtml72(){\n  var s=window.KGM_ROT_SUM_R72;\n  if(!s)return '';",
   "function stripHtml72(){\n  var s=window.KGM_ROT_SUM_R72;\n  if(!s)return '';\n"
   "  /* 1012A：背景整年重排與收尾還沒做完 → 不顯示半成品的數字 */\n"
   "  if(window.kgmRotSettledR1012A&&!window.kgmRotSettledR1012A())return '<section class=\"k72-strip\"><div class=\"k72-h\"><b>'+(zz()?'輪轉檢查':'Rotation audit')+'</b>'"
   "+'<span>'+(zz()?'機隊輪轉背景重排中（開站後約兩分鐘），完成並自動檢查、補正後顯示結果。':'Rebuilding the fleet rotation in the background (about two minutes after opening).')+'</span></div></section>';")
RC('variety r72','kgm-0823o-r72',"var ROT72={};\nwindow.kgmBuildRotationsR72=function(type,start,days){",open('js/var12.js',encoding='utf-8').read()+"var ROT72={};\nwindow.kgmBuildRotationsR72=function(type,start,days){")

# ── #13 KX6/KX5 與 KX4/KX3 班號互換（js/kx12.js；2026-11-29 起生效，之前照舊）：時刻表本身改成新定義 ——
#    A380 改叫 KX6/KX5 時刻不變；A350 改叫 KX4/KX3、一三六早上、其餘四天下午（同一班號兩列，像 KX24） ──
RW('kx4 row','["KX4","TPE","LAX","23:55","20:25","A388","daily",null,0],','["KX4","TPE","LAX","17:45","14:15","A359","TTHFSU",null,0],\n["KX4","TPE","LAX","10:55","07:25","A359","MWS",null,0],')
RW('kx6 row','["KX6","TPE","LAX","17:45","14:15","A359","daily",null,0],','["KX6","TPE","LAX","23:55","20:25","A388","daily",null,0],')
RW('kx3 row','["KX3","LAX","TPE","00:30","05:30","A388","daily",null,1],','["KX3","LAX","TPE","16:45","21:45","A359","TTHFSU",null,1],\n["KX3","LAX","TPE","09:50","14:50","A359","MWS",null,1],')
RW('kx5 row','["KX5","LAX","TPE","16:45","21:45","A359","daily",null,1],','["KX5","LAX","TPE","00:30","05:30","A388","daily",null,1],')
RC('kx swap r112','kgm-0903b-r112',"    var sea=seaOf(date),r=recOf(f,sea);\n    if(!r||!r.dep)return f;",
   "    var sea=seaOf(date),r=recOf(f,sea);\n"
   "    /* 1012A：KX3–KX6 班號互換生效日（2026-11-29）以前照舊班表 —— 季節表只有一份（新定義），這裡依日期換回舊時刻／機型 */\n"
   "    try{var K12=window.kgmKxSwapR1012A,o12=K12&&!f.via&&!f.partner&&K12.isOld(f.code,date)&&K12.OLD[f.code];if(o12&&f.fr===o12.fr&&f.to===o12.to){var a12=o12[sea]||o12.summer;r={dep:a12[0],arr:a12[1],dd:a12[2],acft:o12.acft}}\n"
   "      /* 同一班號兩組時刻（KX24／KX23、新 KX4／KX3）：依當天星期幾挑對那一組，不要套成另一組的時刻 */\n"
   "      else{var v12=K12&&K12.rowSeason&&K12.rowSeason(f,date,sea,true);if(v12&&r)r=Object.assign({},r,v12)}}catch(_){}\n"
   "    if(!r||!r.dep)return f;")
RC('kx swap r112 sort','kgm-0903b-r112',"      return out.map(function(f){return applyR112(f,date)});\n    };\n    W.__r112=1; W.__base=baseSorted;",
   "      var res=out.map(function(f){return applyR112(f,date)});\n"
   "      /* 1012A：生效日以前 KX3–KX6 換回舊時刻、同一班號兩組時刻換成正確那組之後，要重新照起飛時間排（規則同 0915A：時間相同時自營在前） */\n"
   "      try{var K12=window.kgmKxSwapR1012A;if(K12&&res.some(function(f){return f&&(K12.isOld(f.code,date)||(window.kgmMultiRowR143&&window.kgmMultiRowR143(f)))})){var mm=function(t){var q=String(t||'0:0').split(':');return (+q[0])*60+(+q[1]||0)};"
   "res=res.map(function(f,i){return [f,i]}).sort(function(a,b){var d=mm(a[0]&&a[0].dep)-mm(b[0]&&b[0].dep);if(d)return d;var p=((a[0]&&a[0].partner)?1:0)-((b[0]&&b[0].partner)?1:0);return p||a[1]-b[1]}).map(function(x){return x[0]})}}catch(_){}\n"
   "      return res;\n    };\n    W.__r112=1; W.__base=baseSorted;")
# ── #7 補：「冬夏時刻到處都要不一樣」—— 登機門分配、櫃檯分配列上的起飛時間原本直接讀時刻表底表（＝夏季），開櫃時間卻已經用當季時刻；改成同一個來源 ──
RC('gate alloc season',R229,"      var g=ground9(tp),d0=mn9(f.dep);\n      list.push({code:f.code,fr:f.fr,to:f.to,dep:f.dep,type:tp,term:termOf9(f),",
   "      var sf12=f;try{sf12=window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(f,date)||f):f}catch(_){}   /* 1012A：當季時刻（冬季不再用夏季底表） */\n"
   "      var g=ground9(tp),d0=mn9(sf12.dep);\n      list.push({code:f.code,fr:f.fr,to:f.to,dep:sf12.dep,type:tp,term:termOf9(f),")
RC('counter season','kgm-0823o-r74',"    out.push({code:f.code,fr:f.fr,to:f.to,dep:f.dep,arr:f.arr,dd:+f.dd||0,type:ty,term:tm,",
   "    var sf12=f;try{sf12=window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(f,date)||f):f}catch(_){}   /* 1012A：列上的起降時間跟開櫃時間同一個來源（當季時刻） */\n"
   "    out.push({code:f.code,fr:f.fr,to:f.to,dep:sf12.dep,arr:sf12.arr,dd:+sf12.dd||0,type:ty,term:tm,")
# ── #21 前後台同步：後台綁定 K74992 ↔ KGMDEMO0911，前台員工票驗證頁顯示「尚未綁定」 ─────────────────────────
#   (1) 寫進儲存區失敗（空間滿）原本被 catch(e){} 吞掉 → 記錄＋畫面提示＋整理儲存空間（js/ls12.js）
#   (2) 新上傳的圖片附件先縮小再存
#   (3) 前台綁定以儲存區為準；驗證頁那一列在收到後台更新時就地換掉（正在輸入框裡時畫面延後重畫，原本要等離開輸入框才更新）
RW('ls fail fn',"var _ls8last={};   /* 1008A：每個鍵上一次寫進 localStorage 的內容 */",
   "var _ls8last={};   /* 1008A：每個鍵上一次寫進 localStorage 的內容 */\n"+open('js/ls12.js',encoding='utf-8').read())
RW('ls fail hook',"if(_ls8last[k]!==s8){localStorage.setItem(k,s8);_ls8last[k]=s8}}catch(e){}",
   "if(_ls8last[k]!==s8){localStorage.setItem(k,s8);_ls8last[k]=s8;if(window.KGM_LS_FAIL_R1012A)kgmLsOkR1012A(k)}}catch(e){try{kgmLsFailR1012A(k,e,s8)}catch(_){}}   /* 1012A：寫不進去要講 */",2)
RW('ls setnow hook',"setNow(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};",
   "setNow(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){try{typeof kgmLsFailR1012A==='function'&&kgmLsFailR1012A(k,e)}catch(_){}}}};   /* 1012A：寫不進去要講 */")
RW('cs pack get',"return (k==='kgm_tailasg')?_unpackTA0818(o):o;}catch{return fb;}}",
   "return (k==='kgm_tailasg')?_unpackTA0818(o):(k==='kgm_crewsched')?_unpackCS1012A(o):o;}catch{return fb;}}   /* 1012A：kgm_crewsched 精簡格式 */")
RW('cs pack set',"JSON.stringify(k==='kgm_tailasg'?_packTA0818(q[k]):q[k])","JSON.stringify(k==='kgm_tailasg'?_packTA0818(q[k]):k==='kgm_crewsched'?_packCS1012A(q[k]):q[k])",2)
RW('att shrink case',"resolve({name:file.name,type:file.type||'application/octet-stream',dataUrl:r.result});",
   "(window.kgmShrinkAttR1012A||function(u,t,cb){cb(u,t)})(r.result,file.type,function(u,t){resolve({name:file.name,type:t||file.type||'application/octet-stream',dataUrl:u})});   /* 1012A：圖片先縮小再存 */",4)
RW('att shrink passport',"ok({name:file.name,type:file.type,size:file.size,dataUrl:r.result});",
   "(window.kgmShrinkAttR1012A||function(u,t,cb){cb(u,t)})(r.result,file.type,function(u,t){ok({name:file.name,type:t||file.type,size:u===r.result?file.size:Math.round(u.length*0.75),dataUrl:u})});   /* 1012A：圖片先縮小再存 */")
RW('att shrink proof',"S.profileProofR920G={name:f.name,type:f.type,size:f.size,dataUrl:r.result,at:new Date().toISOString()};\n        try{save()}catch(_){}try{render()}catch(_){}",
   "(window.kgmShrinkAttR1012A||function(u,t,cb){cb(u,t)})(r.result,f.type,function(u,t){   /* 1012A：圖片先縮小再存 */\n"
   "        S.profileProofR920G={name:f.name,type:t||f.type,size:u===r.result?f.size:Math.round(u.length*0.75),dataUrl:u,at:new Date().toISOString()};\n        try{save()}catch(_){}try{render()}catch(_){}});")
RW('att shrink cabin 15',"S.cabinPhotos=S.cabinPhotos||{};S.cabinPhotos[cab]=r.result;LS.set('kgmcph4',S.cabinPhotos);save();render();};",
   "(window.kgmShrinkAttR1012A||function(u,t,cb){cb(u,t)})(r.result,f.type,function(u){S.cabinPhotos=S.cabinPhotos||{};S.cabinPhotos[cab]=u;LS.set('kgmcph4',S.cabinPhotos);save();render();},{max:2000,q:0.86,min:600000});};   /* 1012A：照片太大先縮小 */")
RW('att shrink cabin 16',"r.onload=function(){setCabinPhoto0816(key,r.result);};",
   "r.onload=function(){(window.kgmShrinkAttR1012A||function(u,t,cb){cb(u,t)})(r.result,f.type,function(u){setCabinPhoto0816(key,u)},{max:2000,q:0.86,min:600000});};   /* 1012A：照片太大先縮小 */")
RW('link of ls',"    window.kgmStaffLinkOfR1010A=function(empId){var r=lk10()[String(empId||'').toUpperCase()];return r&&r.userId?r:null};",
   "    /* 1012A：前台的綁定以儲存區為準（綁定只在後台改；前台的 S 可能還沒讀到後台剛存的那一份）；後台／合併檔照舊用 S */\n"
   "    window.kgmStaffLinksR1012A=function(){var s=lk10();try{if(String(window.KGM_SIDE||'')==='front'){var v=LS.get('kgm10_stflink',null);if(v&&typeof v==='object'&&!Array.isArray(v))return v}}catch(_){}return s};\n"
   "    window.kgmStaffLinkOfR1010A=function(empId){var r=window.kgmStaffLinksR1012A()[String(empId||'').toUpperCase()];return r&&r.userId?r:null};\n"
   "    /* 1012A：後台改了綁定 → 前台驗證頁那一列就地更新（不等整頁重畫） */\n"
   "    (function(){var t12=0;window.addEventListener('storage',function(e){try{if(e.key!=='kgm10_stflink'&&e.key!=='kgmrev:kgm10_stflink')return;clearTimeout(t12);t12=setTimeout(function(){\n"
   "      [].forEach.call(document.querySelectorAll('[data-k12lnk]'),function(el){try{var h=window.kgmStaffLinkRowR1010A({empId:el.getAttribute('data-k12lnk')}),m=/<dd[^>]*>([\\s\\S]*)<\\/dd>$/.exec(h);if(m&&el.innerHTML!==m[1])el.innerHTML=m[1]}catch(_){}})},300)}catch(_){}})})();")
RW('link row attr',"return '<dt>'+(zh?'綁定會員帳號':'Linked member')+'</dt><dd>'+(c.ok?",
   "return '<dt>'+(zh?'綁定會員帳號':'Linked member')+'</dt><dd data-k12lnk=\"'+lkE(String((st&&st.empId)||'').toUpperCase())+'\">'+(c.ok?")
# ── 離起飛還有幾小時（模擬報到、競標結標、候補、升等期限都用這一支）原本讀時刻表底表的起飛時間（＝夏季列）：
#    冬季每一班差 5～30 分；洛杉磯線底表改成新班表後，生效日以前的 KX3～KX6 差好幾個小時（KX4 底表 17:45、實際 23:55）。
#    改成當季、當天的實際起飛時間（同一個來源 kgmSeasonFlightR48；已經是當季時刻的再算一次結果不變，實測 6 個日期 330～358 班全部一致）
RW('hours to dep season',"    var d=date||f.date;if(!d)return NaN;\n    var q=String(f.dep||'00:00').split(':');",
   "    var d=date||f.date;if(!d)return NaN;\n"
   "    /* 1012A：用當季、當天的實際起飛時間（同層的 Sky Couch、免費選位也直接呼叫這一支，所以改在函式裡面） */\n"
   "    try{if(!f.partner&&typeof window.kgmSeasonFlightR48==='function'){var sf12=window.kgmSeasonFlightR48(f,d);if(sf12&&sf12.dep&&sf12.dep!==f.dep)f=Object.assign({},f,{dep:sf12.dep})}}catch(_){}\n"
   "    var q=String(f.dep||'00:00').split(':');")
# ── 組員一週沒有整天休（vfy6 H35；1010A 就有）：引擎記得的組員位置跟事後換人（一天一班、週休保護、補班）後的實際班表不一樣，
#    引擎排了一段「從外站回台北」的調位（人其實早就在台北），組員班表鏈又為了接上這段補一段「台北→外站」—— 一整天兩段沒用的 DH，
#    剛好落在那一週唯一的休息日。→ 組員班表鏈逐日檢查調位：連續的調位當一段看，終點就是目前所在地（白飛一趟），
#    或終點不是下一個實際執勤航班的起點（只看已經算好的日子，往後最多 3 天），就拿掉，並從 S.crewPositioningR121 刪除那筆紀錄。
RC('chain dh tag','kgm-0908B-r210',"if(p.empId===empId&&p.flight.date===date)legs.push(Object.assign({},p.flight,{seat:p.seat,cabin:p.cabin,remark:'DH · 組員調位'}))",
   "if(p.empId===empId&&p.flight.date===date)legs.push(Object.assign({},p.flight,{seat:p.seat,cabin:p.cabin,remark:'DH · 組員調位',k12pos:k,k12rec:p}))")
RC('chain dh stray','kgm-0908B-r210',"      legs=uniq;\n    })();\n",
   "      legs=uniq;\n    })();\n"
   "    /* 1012A：拿掉接不上任何東西的調位（見 gen_r14 說明）。只處理調位紀錄（k12rec），引擎排的實際航班不動 */\n"
   "    (function(){try{\n"
   "      var isDh=function(l){return l&&l.k12rec&&(l.dhR913||l.deadhead||l.surfaceR928||l.operating===false)};\n"
   "      var nextOp=function(fromIdx){for(var j=fromIdx;j<legs.length;j++)if(legs[j]&&!isDh(legs[j]))return legs[j].fr;\n"
   "        for(var k=1;k<=3;k++){var dk=D(date,k);if(!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(dk)))return null;var pk=window.kgmCrewPlanR121(dk),fst=null;\n"
   "          (pk.flights||[]).forEach(function(f){if(!(f.pilots||[]).concat(f.cabin||[]).some(function(q){return q&&q.empId===empId}))return;if(!fst||(+f.depUTC||0)<(+fst.depUTC||0))fst=f});\n"
   "          if(fst)return fst.fr}return null};\n"
   "      var cur=at,keep=[],drop=[];\n"
   "      for(var i2=0;i2<legs.length;){var l=legs[i2];if(!isDh(l)){keep.push(l);cur=l.to||cur;i2++;continue}\n"
   "        var run=[l],j2=i2+1;while(j2<legs.length&&isDh(legs[j2])&&legs[j2].fr===run[run.length-1].to){run.push(legs[j2]);j2++}\n"
   "        var end=run[run.length-1].to,nx=nextOp(j2),bad=(cur&&end===cur)||(nx&&nx!==end);\n"
   "        if(bad)drop=drop.concat(run);else{keep=keep.concat(run);cur=end}\n"
   "        i2=j2}\n"
   "      if(drop.length){legs=keep;drop.forEach(function(l){try{var L=S.crewPositioningR121[l.k12pos];if(!L)return;var ix=L.indexOf(l.k12rec);if(ix>=0)L.splice(ix,1);if(!L.length)delete S.crewPositioningR121[l.k12pos]}catch(_){}});\n"
   "        try{window.KGM_DH_STRAY_R1012A=(window.KGM_DH_STRAY_R1012A||0)+drop.length}catch(_){}}\n"
   "      legs.forEach(function(l){if(l){delete l.k12pos;delete l.k12rec}});\n"
   "    }catch(_){}})();\n")
# ── 後台競標分頁第一次打開 1.5～1.9 秒（vfy6 H16 門檻 1.5 秒）：打開時才替未來 10 天每一班「補模擬出價」，
#    已經補過的也每次重算當天飛不飛、機型、離起飛幾小時（約 3,400 班 × 每班一次）。
#    → 同一班同一天 10 分鐘內處理過就跳過（補資料本來就是「沒有才補」，結果不變）；後台開站 40 秒後用空檔分段先補好。
RW('auc memo head',"  window.kgmEnsureAuctionsR922=function(code,date,fObj){\n    var made=0;\n    try{",
   "  window.kgmEnsureAuctionsR922=function(code,date,fObj){\n    var made=0;\n"
   "    /* 1012A：同一班同一天 10 分鐘內處理過就跳過 */\n"
   "    var M12=window.__kgmAucMemoR1012A=window.__kgmAucMemoR1012A||{},mk12=fObj&&fObj.code===code?(code+'|'+date+'|'+fObj.fr+fObj.to):null;\n"
   "    if(mk12&&M12[mk12]&&Date.now()-M12[mk12]<600000)return 0;\n"
   "    try{")
RW('auc memo tail',"      if(made){try{save()}catch(_){}}\n    }catch(_){}\n    return made;\n  };\n  /* 查詢時就地補齊",
   "      if(made){try{save()}catch(_){}}\n      if(mk12&&!window.__kgmBdSkipR929)M12[mk12]=Date.now();   /* 1012A：BigDeal 被延後的那一輪不記，下次還要補 */\n"
   "    }catch(_){}\n    return made;\n  };\n"
   "  /* 1012A：後台開站 40 秒後用空檔分段先補好未來 10 天（每段 30 毫秒），第一次打開競標分頁不用等 */\n"
   "  (function pre12(){if(String(window.KGM_SIDE||'')==='front')return;setTimeout(function(){var Q=[],td=T9();\n"
   "    for(var d=1;d<=10;d++){var dd=D9(td,d);allF9().forEach(function(f){if(f&&!f.via)Q.push([f.code,dd,f])})}\n"
   "    (function step(){var t=Date.now();while(Q.length&&Date.now()-t<30){var x=Q.shift();try{window.kgmEnsureAuctionsR922(x[0],x[1],x[2])}catch(_){}}if(Q.length)setTimeout(step,60)})();\n"
   "  },40000)})();\n"
   "  /* 查詢時就地補齊")
# ── #253 第五航權單段升等：艙單（manifest7）與座位庫存（cabinInventory54）依實際航段、讀 legCabR1012A／legSeatR1012A（js/ff12.js） ──
R7A='kgm-r7-admin-ops'
RC('leg253 manifest seg',R7A,"var s=window.segs7(b).find(function(x){return x.f&&x.f.code===f.code&&x.f.fr===f.fr&&x.f.to===f.to&&x.date===date;});",
   "var s=window.segs7(b,true).find(function(x){return x.f&&x.f.code===f.code&&x.f.fr===f.fr&&x.f.to===f.to&&x.date===date;});   /* 1012A #253：經停航班依實際航段（原本拿整條 TPE→LAS 去比，兩段的艙單都看不到真實訂位） */")
RC('leg253 manifest cabin',R7A,"var fare=s.c||b.outC||'',cabin=(FARES[fare]||AWARD_FARES[fare]||{}).cabin||'Economy';",
   "var fare=s.c||b.outC||'',cabin=(FARES[fare]||AWARD_FARES[fare]||{}).cabin||'Economy',lc12=window.kgmLegCabR1012A?window.kgmLegCabR1012A(b,s):null;if(lc12){cabin=lc12.cabin;fare=lc12.fare}   /* 1012A #253：只升這一段 */")
RC('leg253 manifest seat',R7A,"var seatObj=(b.seats&&b.seats[s.key])||{},upgrade=",
   "var seatObj=lc12?(function(){var o={};lc12.seats.forEach(function(q){if(q)o[q]=1});return o})():((b.seats&&b.seats[s.key])||(s.through&&b.seats&&b.seats[s.rootKey])||{}),upgrade=")
RC('leg253 manifest autoseat',R7A,"if(x.real&&x.booking&&x.seat){x.booking.seats=",
   "if(x.real&&x.booking&&x.seat&&window.kgmLegSeatSetR1012A&&window.kgmLegSeatSetR1012A(x)){x.autoAssigned=true;wrote=true;}else if(x.real&&x.booking&&x.seat){x.booking.seats=")
RC('leg253 manifest thru',R7A,"var s1=window.segs7(x.booking).find(","var s1=window.segs7(x.booking,true).find(")
RC('leg253 inv cabin','kgm-0823c-r54',"var cls=(b.segmentFare0826A||{})[s.key]||s.c,cb=entry?entry.assignedCabin:(FARES[cls]||AWARD_FARES[cls]||{}).cabin||'Economy';if(cb!==cabin)return;",
   "var cls=(b.segmentFare0826A||{})[s.key]||s.c,cb=entry?entry.assignedCabin:(FARES[cls]||AWARD_FARES[cls]||{}).cabin||'Economy',lc12=!entry&&window.kgmLegCabR1012A?window.kgmLegCabR1012A(b,s):null;if(lc12){cb=lc12.cabin;cls=lc12.fare}if(cb!==cabin)return;   /* 1012A #253：只升這一段 */")
RC('leg253 inv seat','kgm-0823c-r54',"var seats=Object.keys((b.seats||{})[s.key]||(s.through&&(b.seats||{})[s.rootKey])||{}).filter(function(k){return k!=='_auto'}),pax=",
   "var seats=lc12?lc12.seats.filter(Boolean):Object.keys((b.seats||{})[s.key]||(s.through&&(b.seats||{})[s.rootKey])||{}).filter(function(k){return k!=='_auto'}),pax=")
RC('upg card no footer host',R229,"        var host=app.querySelector('.k56-trip')||app.querySelector('main')||app;\n        host.appendChild(node);",
   "        var host=app.querySelector('.k56-trip')||app.querySelector('main');if(!host)return 0;   /* 1012A：行程管理的子頁（登機證、報到…）沒有行程卡，原本退到 #app 最後 → 掛在頁尾 footer 下面 */\n        host.appendChild(node);")
RC('leg253 trip seat tile','kgm-0909B-r217',"E(seat||(Z()?'尚未選位':'Not selected'))",
   "E((window.kgmLegSeatTxtR1012A&&window.kgmLegSeatTxtR1012A(b,key,seat))||seat||(Z()?'尚未選位':'Not selected'))")   # 1012A #253：只升一段時兩段座位不同
RC('leg253 ops seat write',R7A,"if(p.real&&p.booking){p.booking.seats=p.booking.seats||{};p.booking.seats[p.segmentKey]={};p.booking.seats[p.segmentKey][seat]=p.name;}p.seat=seat;save();}",
   "if(p.real&&p.booking&&window.kgmLegSeatSetR1012A&&window.kgmLegSeatSetR1012A(Object.assign({},p,{seat:seat}))){}else if(p.real&&p.booking){p.booking.seats=p.booking.seats||{};p.booking.seats[p.segmentKey]={};p.booking.seats[p.segmentKey][seat]=p.name;}p.seat=seat;save();}")   # 1012A #253：只升一段的那一段，櫃檯改座位寫回 legSeatR1012A
RC('kx swap embed',R229,"    window.kgmCrewUpdateR928=function(){",open('js/kx12.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")

open('p_h_r14.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
