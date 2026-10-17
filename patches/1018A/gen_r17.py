from common import *
import json
# ══ 1018A ═══════════════════════════════════════════════════════════════════
#   使用者（1015A 交付後）：「瀏覽器儲存空間已滿…（同樣的提示＋整理儲存空間畫面）」
#   以及 1018A 的一長串（主管紀錄、第五航權拆機、A35K 短程、AI 客服 PNR 太假、模擬選位、票價艙等、轉降、AI 換班、
#   營收分析、票價分析人工調整、機型定案、薪資 CSV、航班資料 PDF、上一輪沒修完的）。逐項見 notes/1018A-pass120-notes.md。
#   比對基準：1015A 最終版 w6（/tmp/j/kgm1015A_w6.html，由 patches/1015A/build.sh 重建，跟交付檔逐位元相同）。
#   不要改到版號字串（build.sh 最後才換版號）。
CUR=open('/tmp/j/kgm1015A_w6.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
R53='kgm-0823c-r53'
R54='kgm-0823c-r54'
R72='kgm-0823o-r72'
R229='kgm-0909E-r229'

# ══ A. 瀏覽器儲存空間已滿 ═══════════════════════════════════════════════════════════
# A1 精簡格式、單日航班調整整理、模擬資料估算（js/ls18.js，放在 ls12 的競標精簡格式對照表後面）
RW('ls18 embed',
   "var KGM_PACK_AR_R1012A={kgmbd4:1,kgm_resbid6:1,kgm_resmile6:1};\n",
   "var KGM_PACK_AR_R1012A={kgmbd4:1,kgm_resbid6:1,kgm_resmile6:1};\n"+JS('ls18.js'))
RW('ls18 pack users',
   "    if(KGM_PACK_AR_R1012A[k])return _packAR1012A(v);\n  }catch(e){}\n  return v;\n}",
   "    if(k==='kgmus4')return _packAR1012A(_stripSynR1018A(v));   /* 1018A：模擬會員自動產生的里程紀錄只存重算方式 */\n"
   "    if(KGM_PACK_AR_R1012A[k])return _packAR1012A(v);\n  }catch(e){}\n  return v;\n}")
RW('ls18 unpack users',
   "    if(o.__ar1012A)return _unpackAR1012A(o);\n  }catch(e){}\n  return o;\n}",
   "    if(o.__ar1012A){var a18=_unpackAR1012A(o);if(k==='kgmus4'){try{window.kgmSynLogR1018A&&window.kgmSynLogR1018A(a18)}catch(_){}}return a18}   /* 1018A：讀回時把模擬會員的里程紀錄重算回來 */\n"
   "  }catch(e){}\n  return o;\n}")
RW('ls18 str hooks',
   "    if(KGM_PACK_AR_R1012A[k]){\n      var raw=JSON.stringify(v),c=_arCacheR1012A[k];\n      if(c&&c.raw===raw)return c.s;\n      var s=JSON.stringify(_packAR1012A(v));",
   "    if(k==='kgmdov4')kgmDovTrimR1018A(v);   /* 1018A：每天自動寫入的航班動態預測，前天以前的寫入前先刪 */\n"
   "    if(KGM_PACK_AR_R1012A[k]){\n      var raw=JSON.stringify(v),c=_arCacheR1012A[k];\n      if(c&&c.raw===raw)return c.s;\n      var s=JSON.stringify(kgmLsPackR1012A(k,v));")

# A2 員工通知：同一位員工、一模一樣的通知只留一則；之前累積的重複在開頁時合併
RW('stnotif dedupe',
   "function notifyStaff(empId,msg){if(!empId)return;if(!S.staffNotifs)S.staffNotifs=[];S.staffNotifs.unshift({empId:empId,msg:msg,date:todayISO(),read:false});}",
   "function notifyStaff(empId,msg){if(!empId)return;if(!S.staffNotifs)S.staffNotifs=[];\n"
   "  /* 1018A：同一位員工、一模一樣的通知只留一則（移到最上面、日期更新、已讀狀態照舊）。原本組員 60 天班表每次開頁重排，\n"
   "     就對每位組員再發一則「您的 60 天班表已更新」，從來不刪 —— 使用者的瀏覽器累積到 3.4 MB。 */\n"
   "  var a18=S.staffNotifs,rd18=false;for(var i18=0;i18<a18.length;i18++){var x18=a18[i18];if(x18&&x18.empId===empId&&x18.msg===msg){rd18=!!x18.read;a18.splice(i18,1);break}}\n"
   "  a18.unshift({empId:empId,msg:msg,date:todayISO(),read:rd18});}\n"
   "/* 1018A：之前累積的重複通知在開頁時合併：留最新的那一則；任何一則已讀就算已讀 */\n"
   "(function(){try{var a=S.staffNotifs;if(!Array.isArray(a)||a.length<2)return;var seen=Object.create(null),o=[];\n"
   "  for(var i=0;i<a.length;i++){var x=a[i];if(!x||typeof x!=='object'){o.push(x);continue}var k=x.empId+'\\u0001'+x.msg,j=seen[k];\n"
   "    if(j===undefined){seen[k]=o.length;o.push(x)}else if(x.read&&o[j]&&!o[j].read)o[j]=Object.assign({},o[j],{read:true})}\n"
   "  if(o.length<a.length){window.KGM_STNOTIF_DEDUP_R1018A=a.length-o.length;S.staffNotifs=o}}catch(_){}})();")

# A3 模擬會員的自動里程紀錄（r53 seedMilesLogK）：產生時記下重算方式，讀回時重算
RC('syn T3',R53,
   "function T3(){try{return todayISO()}",
   "var T3AT18=null,ZAT18=null;   /* 1018A：重算模擬會員里程紀錄時，用當初產生的日期與語言 */\nfunction T3(){if(T3AT18)return T3AT18;try{return todayISO()}")
RC('syn seed args',R53,
   "function seedMilesLogK(force){\n  try{\n    var n=0;\n    (S.users||[]).forEach(function(u){",
   "function seedMilesLogK(force,list18,quiet18){\n  try{\n    var n=0;\n    (list18||S.users||[]).forEach(function(u){")
RC('syn seed lv',R53,
   "      var rows=[],bal=0,segs=[];\n      (S.bookings||[]).forEach(function(b){\n        if(!b||b.userId!==u.id",
   "      var rows=[],bal=0,segs=[],lv18=u.level||u.tier||'Bronze';\n      (S.bookings||[]).forEach(function(b){\n        if(!b||b.userId!==u.id")
RC('syn seed zh',R53,
   "reason:Z()?'期初結轉／里程調整':'Opening balance'",
   "reason:(ZAT18!=null?ZAT18:Z())?'期初結轉／里程調整':'Opening balance'")
RC('syn seed mark',R53,
   "      u.milesLog=rows.slice().reverse();   /* newest first */\n      u.miles=bal;n++;\n    });\n    if(n)try{save()}catch(_){}",
   "      u.milesLog=rows.slice().reverse();   /* newest first */\n      u.miles=bal;n++;\n"
   "      /* 1018A：模擬會員 —— 記下重算方式，存檔時不必整份存（存得下）；讀回時 kgmSynLogR1018A 用同一套公式重算 */\n"
   "      if(u.simulated&&!list18&&window.kgmHashR1018A){try{u.synLog18={at:T3(),lv:lv18,m:bal,z:Z()?1:0,n:u.milesLog.length,h:window.kgmHashR1018A(JSON.stringify(u.milesLog))}}catch(_){}}\n"
   "    });\n    if(n&&!quiet18)try{save()}catch(_){}")
RC('syn regen',R53,
   "window.kgmSeedMilesLogK=seedMilesLogK;\n",
   "window.kgmSeedMilesLogK=seedMilesLogK;\n"
   "/* 1018A：存檔時沒存的模擬會員里程紀錄，讀回時重算（同一個日期、等級、里程、語言 → 一模一樣的內容） */\n"
   "window.kgmSynLogR1018A=function(list){\n"
   "  var n=0;\n"
   "  try{(list||S.users||[]).forEach(function(u){var g=u&&u.synLog18;if(!g||(Array.isArray(u.milesLog)&&u.milesLog.length))return;\n"
   "    var t={id:u.id,email:u.email,level:g.lv,miles:g.m};T3AT18=g.at;ZAT18=!!g.z;\n"
   "    try{seedMilesLogK(true,[t],true)}catch(_){}finally{T3AT18=null;ZAT18=null}\n"
   "    if(Array.isArray(t.milesLog)){u.milesLog=t.milesLog;n++;\n"
   "      try{if(window.kgmHashR1018A(JSON.stringify(t.milesLog))!==g.h)window.KGM_SYNLOG_MISS_R1018A=(window.KGM_SYNLOG_MISS_R1018A||0)+1}catch(_){}}})}catch(_){}\n"
   "  return n;\n"
   "};\n"
   "/* 所有層都載入完（航班表定案）才重算 */\n"
   "(function(){function go(){try{window.kgmSynLogR1018A()}catch(_){}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else setTimeout(go,0)})();\n")
RC('syn order-free',R53,
   "    try{all=[].concat(typeof FLIGHTS!=='undefined'?FLIGHTS:[])}catch(_){}\n",
   "    try{all=[].concat(typeof FLIGHTS!=='undefined'?FLIGHTS:[])}catch(_){}\n"
   "    /* 1018A：依班號排序，跟航班表的先後順序無關（存檔後重算才會一模一樣） */\n"
   "    all=all.filter(function(f){return f&&f.code}).sort(function(a,b){var x=a.code+'|'+a.fr+'|'+a.to,y=b.code+'|'+b.fr+'|'+b.to;return x<y?-1:x>y?1:0});\n")
# A4 模擬資料：產生前估算存不存得下（最外層的包裝 r54）
RC('sim fit guard',R54,
   "  var gen54=doGenSimPax;\n  doGenSimPax=window.doGenSimPax=function(){\n    var r=gen54.apply(this,arguments);",
   "  var gen54=doGenSimPax;\n  doGenSimPax=window.doGenSimPax=function(){\n"
   "    /* 1018A：產生前先估算瀏覽器存不存得下；存不下就不產生（產生了也存不進去，重新整理就不見，還會讓其他修改也存不進去） */\n"
   "    try{var f18=window.kgmSimFitR1018A&&window.kgmSimFitR1018A(Math.max(0,+S._simStaff||0),Math.max(0,+S._simCust||0),Math.max(0,+S._simBk||0));\n"
   "      if(f18&&!f18.ok){S._simMsg='✗ '+f18.msg;try{render()}catch(_){}return}}catch(_){}\n"
   "    var r=gen54.apply(this,arguments);")

# A5 組員排班快取（kgm_crewsched，「各分頁自己算」）本身存不進去 → 這次開頁不再寫、不提示；不為了它去清別的資料
RW('ls crewsched give up',
   "    if(isQuota(e)&&evict15(k,s)){",
   "    if(k==='kgm_crewsched'&&isQuota(e)){window.KGM_LS_NOCS_R1015A=1;try{localStorage.removeItem('kgm_crewsched')}catch(_){}try{if(window.KGM_LS_FAIL_R1012A)kgmLsOkR1012A(k)}catch(_){}return}   /* 1018A：快取存不下就算了，各分頁自己算 */\n"
   "    if(isQuota(e)&&evict15(k,s)){")

# ══ B. 主管紀錄（mgr12，嵌在 r229）══════════════════════════════════════════════════
def SEG(a,b):
    i=CUR.index(a);j=CUR.index(b,i);assert CUR.count(a)==1 and CUR.count(b)==1;return CUR[i:j]
RW('mgr list',SEG("    /* ── 頁面 ── */\n    function css12(){","    function groundSec12(){"),JS('mgr18_list.js'))
RW('mgr cabin',SEG("    function cabinSec12(){","    function pilotSec12(){"),JS('mgr18_cabin.js'))
RW('mgr log',SEG("    function logSec12(){","    window.kgmMgrPageR1012A=function(){"),JS('mgr18_log.js'))
RW('mgr ground find',
   "      var sel=S._mgrSelR1012A&&T[S._mgrSelR1012A]?S._mgrSelR1012A:(T[me12().id]?me12().id:ids[0]);",
   "      var sel=S._mgrSelR1012A&&T[S._mgrSelR1012A]?S._mgrSelR1012A:(T[me12().id]?me12().id:ids[0]);\n"
   "      /* 1018A：打員工編號 → 直接跳到他所屬的主管那一組 */\n"
   "      var gq=String(S._mgrGQR1018A||'').trim().toUpperCase(),gHit='';if(gq){ids.forEach(function(b){if(gHit)return;if(String(b).toUpperCase()===gq||T[b].some(function(e){return String(e).toUpperCase()===gq}))gHit=b});if(gHit)sel=gHit}")
RW('mgr ground search box',
   ":'')+'</p>'+head\n        +'<div class=\"k12m-team\">",
   ":'')+'</p>'+head+'<div class=\"k12m-bar\">'+q18('_mgrGQR1018A',z12()?'輸入員工編號，直接找到所屬主管的那一組':'Employee ID')+(gq?(gHit?'<span class=\"k12m-sub\">'+(z12()?'已找到':'Found')+'</span>':'<span class=\"k12m-sub\" style=\"color:#9b2c1c\">'+(z12()?'這一站的組員裡沒有這個員工編號':'Not in this station')+'</span>'):'')+'</div>'\n        +'<div class=\"k12m-team\">")

# ══ E. AI 客服模擬訂位：旅客資料全是空的（圖二 B8LNQ2）══════════════════════════════
#   csPnr12 建訂位時生日、護照、Email、電話一律寫空字串。改成依訂位代號固定產生（每次開都一樣）：
#   定位者有生日／護照／Email／手機，同行家人有生日／護照（沒有自己的 Email／手機，跟真的一樣）；之前已經建好的也補上。
RW('cs pnr pax fill',
   "      var nm=ROM12[it.name]||String(it.name||'').toUpperCase().split(/\\s+/).reverse(),p0={title:'',lastName:nm[0]||'',firstName:nm[1]||'',dob:'',passport:'',nat:/[A-Za-z]/.test(it.name)?'AU':'TW',email:'',ffpNum:it.userId||'',passengerType:'ADT'};\n"
   "      var pax=[p0];if(/父親/.test(txt))pax.push({title:'',lastName:p0.lastName,firstName:'KUOHUA',dob:'',passport:'',nat:p0.nat,email:'',ffpNum:'',passengerType:'ADT'});",
   "      var nm=ROM12[it.name]||String(it.name||'').toUpperCase().split(/\\s+/).reverse(),p0={title:'',lastName:nm[0]||'',firstName:nm[1]||'',dob:'',passport:'',nat:/[A-Za-z]/.test(it.name)?'AU':'TW',email:'',ffpNum:it.userId||'',passengerType:'ADT'};\n"
   "      var pax=[p0];if(/父親/.test(txt))pax.push({title:'',lastName:p0.lastName,firstName:'KUOHUA',dob:'',passport:'',nat:p0.nat,email:'',ffpNum:'',passengerType:'ADT'});\n"
   "      fill18(it.pnr,pax,it.name);   /* 1018A：生日、護照、聯絡資料依訂位代號固定產生 */")
RW('cs pnr contact',
   "        paxList:pax,contactEmail:'',seats:{},",
   "        paxList:pax,contactEmail:pax[0].email||'',contactPhone:(pax[0].countryCode||'')+(pax[0].phone||''),seats:{},")
RW('cs pnr fill fn',
   "  function csPnr12(){try{var q=Q(),made=0;",
   "  /* 1018A：模擬訂位的旅客資料（生日、護照、Email、手機）—— 依訂位代號雜湊，每次開都一樣 */\n"
   "  var FEM18={YICHUN:1,MEILING:1,SHUFEN:1,HSINYI:1};\n"
   "  function fill18(pnr,pax,name){try{var h=0,k=String(pnr||'');for(var i=0;i<k.length;i++)h=(h*131+k.charCodeAt(i))>>>0;\n"
   "    var dg=function(n,s){var o='';for(var j=0;j<n;j++){s=(s*1103515245+12345)>>>0;o+=String((s>>>16)%10)}return o};\n"
   "    (pax||[]).forEach(function(p,i){if(!p)return;var hh=(h+i*7919)>>>0,tw=p.nat!=='AU',fn=String(p.firstName||'').replace(/[^A-Z]/g,'');\n"
   "      if(!p.title)p.title=FEM18[fn]?'MS':'MR';\n"
   "      if(!p.dob){var age=i?(58+hh%14):(27+hh%26),y=+todayISO().slice(0,4)-age;p.dob=y+'-'+('0'+(1+hh%12)).slice(-2)+'-'+('0'+(1+(hh>>>4)%28)).slice(-2)}\n"
   "      if(!p.passport)p.passport=tw?('3'+dg(8,hh)):('PA'+dg(7,hh));\n"
   "      if(!p.passportExp){var ey=+todayISO().slice(0,4)+2+hh%7;p.passportExp=ey+'-'+('0'+(1+(hh>>>3)%12)).slice(-2)+'-'+('0'+(1+(hh>>>6)%28)).slice(-2)}\n"
   "      if(i===0){if(!p.email)p.email=(fn.toLowerCase()+'.'+String(p.lastName||'').toLowerCase()+(hh%90+10)+(tw?'@gmail.com':'@outlook.com.au')).replace(/[^a-z0-9@._]/g,'');\n"
   "        if(!p.phone){p.countryCode=tw?'+886':'+61';p.phone=tw?('9'+dg(8,hh^77)):('4'+dg(8,hh^77))}}});\n"
   "  }catch(_){}}\n"
   "  function csPnr12(){try{var q=Q(),made=0;\n"
   "    /* 之前（1012A～1015A）建好的模擬訂位：旅客資料空的 → 補上（只補空的欄位） */\n"
   "    (S.bookings||[]).forEach(function(b){if(!b||!b.csSimR1012A||!Array.isArray(b.paxList))return;if(b.paxList.every(function(p){return p&&p.dob&&p.passport}))return;var it=q[b.csSimR1012A]||{};fill18(b.pnr,b.paxList,it.name);\n"
   "      if(!b.contactEmail)b.contactEmail=b.paxList[0].email||'';if(!b.contactPhone)b.contactPhone=(b.paxList[0].countryCode||'')+(b.paxList[0].phone||'');made++});")

# ══ G. 票價方案：低艙等要先賣完（圖三：KX128 基本還很多、超值「剩 1 席」、豪華「剩 3 席」）════════════════
#   原因：三個方案各自依載客率「賣」（基本 0.92、超值 0.78、豪華 0.62 × 載客率），互不相干；標籤顯示的是「目前這個價位」剩幾位，
#   不是整個方案。改成同一班的需求依序流入：先買基本（需求的 60%），基本滿了溢到超值（30%＋溢出），再到豪華（10%＋溢出）
#   → 一定是基本先賣完、再來超值、最後豪華；標籤改看整個方案還剩幾位。另外基本賣完之後，營收管理偶爾（每兩天重新決定，約 14%）
#   會再釋出 1～3 位，所以會看到「一下賣、一下又沒有」。
RC('fare cascade',R54,
   "  var lf=Math.max(0,Math.min(1,Number(loadFactor(flight.code,date))||0)),j=((hash54(flight.code+'|'+date+'|'+fam)%11)-5)/100+(typeof kgmRmSellAdjR929==='function'?kgmRmSellAdjR929(flight,date):0)/* 1004A：RM 訂位進度 */,rate=Math.max(0.12,Math.min(0.99,lf*(FAM_RATE54[fam]||1)+j)),sold=Math.floor(rate*famCap),used=Math.max(0,sold-idx*bucket),left=Math.max(0,bucket-Math.min(bucket,used));",
   "  /* 1018A：同一班的需求依序流入三個方案（基本 60%、超值 30%、豪華 10%；前一個滿了就溢到下一個）→ 低的方案一定先賣完 */\n"
   "  var lf=Math.max(0,Math.min(1,Number(loadFactor(flight.code,date))||0)),j=((hash54(flight.code+'|'+date+'|'+cab)%11)-5)/100+(typeof kgmRmSellAdjR929==='function'?kgmRmSellAdjR929(flight,date):0)/* 1004A：RM 訂位進度 */,\n"
   "    D18=Math.max(0.12,Math.min(0.99,lf*0.86+j))*cap,hol18=false;\n"
   "  try{hol18=families.length>1&&families.indexOf('Basic')>=0&&typeof window.kgmHolSeatR1006A==='function'&&!!window.kgmHolSeatR1006A(date,flight)}catch(_){}\n"
   "  var bs18=+(window.KGM_HOLSEAT_R1006A||{}).basic;if(!(bs18>0&&bs18<1))bs18=0.2;\n"
   "  var capF18=function(fm){return hol18?(fm==='Basic'?Math.max(1,Math.floor(cap*bs18)):Math.max(1,Math.floor(cap*(1-bs18)/(families.length-1)))):Math.max(1,Math.floor(cap/Math.max(1,families.length)))};\n"
   "  var SH18=families.length>=3?[0.6,0.3,0.1]:(families.length===2?[0.7,0.3]:[1]),rem18=0,sold=0;\n"
   "  for(var q18=0;q18<families.length;q18++){var cf18=capF18(families[q18]),want18=D18*(SH18[q18]||0)+rem18,sf18=Math.min(cf18,want18);rem18=want18-sf18;\n"
   "    if(families[q18]===fam){sold=Math.floor(sf18);\n"
   "      /* 基本賣完之後，營收管理偶爾再釋出 1～3 位（每兩天重新決定） */\n"
   "      if(q18===0&&sf18>=cf18){var dy18=0;try{dy18=Math.floor(Date.parse(todayISO()+'T00:00:00Z')/864e5/2)}catch(_){}var hr18=hash54('rel18|'+flight.code+'|'+date+'|'+cab+'|'+dy18);if(hr18%100<14)sold=Math.max(0,sold-(1+hr18%3))}\n"
   "      break}}\n"
   "  var used=Math.max(0,sold-idx*bucket),left=Math.max(0,bucket-Math.min(bucket,used));")
RC('fam left fn',R54,
   "sell54.__canonical54=true;window.kgmInventory49=sell54;",
   "sell54.__canonical54=true;window.kgmInventory49=sell54;\n"
   "/* 1018A：整個方案還剩幾位（這個價位＋同方案更高的價位）—— 票價卡「剩餘 N 席」看這個，不是只看目前這個價位 */\n"
   "window.kgmFamLeftR1018A=function(code,date,flight){try{var fi=FARES[code]||{},cab=fi.cabin||'Economy',a=((FAM54[cab]||{})[famOf54(code)]||[]),i=a.indexOf(code);if(i<0)return null;var n=0;for(var k=i;k<a.length;k++)n+=sell54(a[k],date,flight)||0;return n}catch(_){return null}};")
RW('fare badge fam main',
   "const _shown929=(seatLeft!=null&&isFinite(seatLeft)&&seatLeft>0)?Math.max(_pax929,Math.floor(seatLeft/2)):null;",
   "const _sl18=(function(){try{var v=(!_staffFare&&window.kgmFamLeftR1018A)?window.kgmFamLeftR1018A(c,date,f):null;return (v!=null&&isFinite(v)&&seatLeft!=null&&isFinite(seatLeft)&&seatLeft>0)?Math.max(v,seatLeft):seatLeft}catch(_){return seatLeft}})();   /* 1018A：整個方案剩幾位 */\n"
   "          const _shown929=(_sl18!=null&&isFinite(_sl18)&&_sl18>0)?Math.max(_pax929,Math.floor(_sl18/2)):null;")
RW('fare badge fam conn',
   "var left=null;try{if(typeof window.kgmInventory49===\"function\"){[f1,f2].forEach(function(ff){var v=window.kgmInventory49(k,ff.date,ff);if(v!=null&&isFinite(v))left=left==null?v:Math.min(left,v)})}}catch(_){}",
   "var left=null;try{if(typeof window.kgmInventory49===\"function\"){[f1,f2].forEach(function(ff){var v=window.kgmInventory49(k,ff.date,ff);if(v>0&&window.kgmFamLeftR1018A){var w=window.kgmFamLeftR1018A(k,ff.date,ff);if(w!=null&&isFinite(w))v=Math.max(v,w)}if(v!=null&&isFinite(v))left=left==null?v:Math.min(left,v)})}}catch(_){}   /* 1018A：整個方案剩幾位 */")

# ══ F. 模擬旅客的座位：不會整排空、其他全滿 ═══════════════════════════════════════════
#   原因：模擬名單（simManifest）的座位號是自己從第 1 排往後編的，跟實際座位圖的排號對不上 → 大部分模擬旅客「沒有座位」，
#   最後由 cabinInventory54 依座位圖順序從第一個空位往後塞（free.shift()）→ 前面全滿、後面整排空。
#   改成：沒有座位的模擬旅客依固定亂數（同一班同一天每次都一樣）散開入座 —— 靠窗、靠走道先坐，中間位置晚一點，前段稍微優先；
#   真的訂位、選好的座位、保留座位都照舊。
RC('seat scatter info',R54,
   "  sections.forEach(function(s){if((s.name||s.cabin)===cabin)s.rows.forEach(function(r){r.cells.forEach(function(c){if(!c.aisle&&c.id)slots.push(c.id)})})});",
   "  var pref18={},nrow18=0;   /* 1018A：每個座位的「受歡迎程度」：靠窗／靠走道 0、中間 1；排數越後面越晚 */\n"
   "  sections.forEach(function(s){if((s.name||s.cabin)===cabin)s.rows.forEach(function(r){nrow18++;var cs=r.cells||[];cs.forEach(function(c,ci){if(!c.aisle&&c.id){slots.push(c.id);\n"
   "    var L=cs[ci-1],R=cs[ci+1],edge=!L||!R||(L&&L.aisle)||(R&&R.aisle);pref18[c.id]={mid:edge?0:1,row:nrow18}}})})});")
RC('seat scatter assign',R54,
   "  var free=slots.filter(function(s){return !used[s]});unseated.forEach(function(p){var seat=free.shift();if(seat)used[seat]=p.pnr});",
   "  var free=slots.filter(function(s){return !used[s]});\n"
   "  if(unseated.length){var sd18=hash54('seat18|'+f.code+'|'+date+'|'+f.fr+f.to+'|'+cabin),rk18={};\n"
   "    free.forEach(function(s){sd18=(Math.imul(sd18,1103515245)+12345)>>>0;var q=pref18[s]||{mid:0,row:0};rk18[s]=(sd18%10000)/10000+q.mid*0.45+(nrow18?q.row/nrow18:0)*0.25});\n"
   "    free.sort(function(a,b){return rk18[a]-rk18[b]})}\n"
   "  unseated.forEach(function(p){var seat=free.shift();if(seat)used[seat]=p.pnr});")

#   F 第二步（量了才發現）：模擬名單自己用「第 1 排起算」編座位號，經濟艙編到第 21～46 排，實際座位圖是第 15～40 排 →
#   第 21～40 排幾乎全滿、前面幾排的空位都集中在一起，航班資料上還會出現座位圖沒有的「45K」。
#   改成：模擬名單直接用實際座位圖（seatSections7，跟座位圖同一份）的座位號，並依「靠窗／走道先坐、中間位置晚坐、前段稍微優先」加上固定亂數排序 →
#   空位零星分散（這裡空兩個、那裡空一個），航班資料、座位圖、庫存三邊座位號一致。
RW('sim seats real map',
   "    for(var r=0;r<sg.rows;r++)for(var c3=0;c3<cols.length;c3++)slots.push((rowBase+r)+cols[c3]);\n"
   "    slots=slots.slice(0,sg.cap);\n"
   "    // 洗牌後取前 want 個，保證不重複\n"
   "    for(var z=slots.length-1;z>0;z--){var j2=Math.floor(rnd()*(z+1));var t=slots[z];slots[z]=slots[j2];slots[j2]=t;}",
   "    for(var r=0;r<sg.rows;r++)for(var c3=0;c3<cols.length;c3++)slots.push((rowBase+r)+cols[c3]);\n"
   "    slots=slots.slice(0,sg.cap);\n"
   "    // 洗牌後取前 want 個，保證不重複\n"
   "    for(var z=slots.length-1;z>0;z--){var j2=Math.floor(rnd()*(z+1));var t=slots[z];slots[z]=slots[j2];slots[j2]=t;}\n"
   "    /* 1018A：改用實際座位圖的座位號；靠窗／走道先坐、中間晚坐、前段稍微優先（固定亂數，同一班同一天每次一樣）→ 空位零星分散 */\n"
   "    /* 座位圖每個機型＋艙等只拆一次（BigDeal 排名一次要模擬幾百班，每班重拆座位圖多花 0.4 秒；機型設定換了才重拆，結果一模一樣） */\n"
   "    try{var nm18={first:'First',biz:'Business',prem:'Premium',econ:'Economy'}[sg.key],ty18=fp.type||f.acft,C18=window.__kgmSeatIdsR1018A||(window.__kgmSeatIdsR1018A={}),ac18=(typeof AC!=='undefined')?AC[ty18]:null,cc18=nm18?C18[ty18+'|'+nm18]:null;\n"
   "      if(nm18&&!(cc18&&cc18.ac===ac18)){var ss18=typeof window.seatSections7==='function'?window.seatSections7(ty18):null,ids0=[],nr0=0;\n"
   "        (ss18||[]).forEach(function(s){if((s.name||s.cabin)!==nm18)return;s.rows.forEach(function(rw){nr0++;var cs=rw.cells||[];cs.forEach(function(c,ci){if(c.aisle||!c.id)return;var L=cs[ci-1],R=cs[ci+1];ids0.push({id:c.id,mid:(!L||!R||L.aisle||R.aisle)?0:1,row:nr0})})})});\n"
   "        cc18=C18[ty18+'|'+nm18]={ac:ac18,ids:ids0,nr:nr0}}\n"
   "      var nr18=cc18?cc18.nr:0,ids18=cc18?cc18.ids.map(function(x){return {id:x.id,mid:x.mid,row:x.row}}):[];\n"
   "      if(ids18.length){ids18.forEach(function(x){x.k=rnd()+x.mid*0.35+(nr18?x.row/nr18:0)*0.15});ids18.sort(function(a,b){return a.k-b.k});slots=ids18.map(function(x){return x.id})}}catch(_){}")

# ══ C. 第五航權拆機（圖一：KX52 TPE→SYD、KX51 AKL→SYD 共 6 班）══════════════════════════════
#   實測（split18d.js：同一個瀏覽器隔幾天再開）：日期一換、背景整年重排做完那一刻拆機 36 班，1015A 的拆機收尾修到剩 5 班，
#   但接著跑的「外站對號回程」又會拆開幾班，要再等約 100 秒別的收尾才回到 0 —— 使用者看到的 6 班就是這段時間。
#   改成：對號回程之後，只要還有拆機就再收一次（最多 3 次，每次自己一個工作，不卡畫面）。
RC('split fix after pairret',R72,
   "        try{if(window.kgmPairReturnR1004B)window.kgmPairReturnR1004B()}catch(_){}   /* 1004B：外站對號回程配對 */\n        setTimeout(function(){\n          try{if(window.kgmCrewResetR121)window.kgmCrewResetR121()}catch(_){}\n          try{if(window.kgmPlanCacheClearR196)window.kgmPlanCacheClearR196()}catch(_){}\n          try{render()}catch(_){}\n        },0);\n      },0);\n      },0);   /* 1015A：拆機收尾那一層 */",
   "        try{if(window.kgmPairReturnR1004B)window.kgmPairReturnR1004B()}catch(_){}   /* 1004B：外站對號回程配對 */\n"
   "        /* 1018A：對號回程會再拆開幾班 → 還有拆機就再收（最多 3 次，每次一個工作） */\n"
   "        var p18=0;(function fx18(){try{window.KGM_SPLIT_CACHE_R929=null;if(p18<3&&window.kgmLiveSplitR929&&window.kgmFixSplitR929&&window.kgmLiveSplitR929().n>0){p18++;window.kgmFixSplitR929();window.KGM_SPLIT_PASSES_R1018A=p18;window.KGM_SPLIT_CACHE_R929=null;setTimeout(fx18,0);return}}catch(_){}\n"
   "        setTimeout(function(){\n          try{if(window.kgmCrewResetR121)window.kgmCrewResetR121()}catch(_){}\n          try{if(window.kgmPlanCacheClearR196)window.kgmPlanCacheClearR196()}catch(_){}\n          try{render()}catch(_){}\n        },0);\n        })();\n      },0);\n      },0);   /* 1015A：拆機收尾那一層 */")

# ══ I. 後台 AI 換班（圖四、圖五）══════════════════════════════════════════════════════
#   圖四：「1029」「1028」這種沒有斜線的日期聽不懂 → 落到「換機」那一條，把 1028 當成機型。
#   圖五：寫成 10/29、10/28 之後，只在同一天、同一站出發的航班找人 → 10/28 的 UKB→TPE 永遠找不到。
RW('ai date mmdd',
   "if(!yy&&d<T())d=(Y+1)+d.slice(4);return d}return ''}",
   "if(!yy&&d<T())d=(Y+1)+d.slice(4);return d}\n"
   "    /* 1018A：「1029」「1028」這種四位數月日（前面不是英數字、後面接「的／號／日／或／、」等） */\n"
   "    if((m=/(?:^|[^\\dA-Za-z\\-\\/.])(0[1-9]|1[0-2])([0-3]\\d)(?=的|號|日|班|或|、|,|，|\\s|$|到|~|～)/.exec(s))&&+m[2]>=1&&+m[2]<=31){var Y4=yy||y,d4=Y4+'-'+m[1]+'-'+m[2];if(!yy&&d4<T())d4=(Y4+1)+d4.slice(4);return d4}\n"
   "    return ''}\n"
   "  /* 1018A：一句話裡的所有日期（「1028 或是 1029」「10/28、10/29」） */\n"
   "  function datesOf18(s){s=String(s||'');var out=[],re=/(\\d{4}\\s*[-\\/.年]\\s*\\d{1,2}\\s*[-\\/.月]\\s*\\d{1,2})|(\\d{1,2}\\s*[\\/月\\-.]\\s*\\d{1,2})(?![\\d%])|((?:0[1-9]|1[0-2])[0-3]\\d)(?=的|號|日|班|或|、|,|，|\\s|$|到|~|～)/g,m;\n"
   "    while((m=re.exec(s))){var pre=s.charAt(m.index-1);if(pre&&/[\\dA-Za-z]/.test(pre))continue;if(m[3]&&/[\\-\\/.]/.test(pre))continue;var d=dateOf(' '+m[0]);if(d&&out.indexOf(d)<0)out.push(d)}return out}")
RW('ai aircraft swap guard',
   "var sw=/(KX\\s?\\d{1,4}).*?(換成|換機|改用|改成)\\s*([A-Z0-9]{3,5})/i.exec(t);if(sw)return",
   "var sw=/(KX\\s?\\d{1,4}).*?(換成|換機|改用|改成)\\s*([A-Z0-9]{3,5})/i.exec(t);if(sw&&!/^\\d{3,4}$/.test(sw[3]))return")   # 1018A：數字是日期不是機型
RW('ai crew swap target',
   "      return [{tool:'crew_swap',args:{text:who10.empId+' '+dateOf(t)+' '+(tg10?tg10.replace(/\\s+/g,'').toUpperCase():'')+' '+ap10.join(' '),pick:1}}];",
   "      /* 1018A：「換成 10/28 或 10/29 的 UKB-TPE」→ 指定的日期與航段一起帶過去；原本的日期取「換成」前面那一個 */\n"
   "      var kw18=/(換成|換到|改成|改飛|想飛)/.exec(t),bf18=kw18?t.slice(0,kw18.index):t,af18=kw18?t.slice(kw18.index+kw18[0].length):'';\n"
   "      var src18=dateOf(bf18)||dateOf(t),td18=datesOf18(af18).filter(function(d){return d!==src18||datesOf18(af18).length>1}),rt18=/(?:^|[^A-Za-z])([A-Za-z]{3})\\s*(?:-|－|→|->|>|到|至|~|～)\\s*([A-Za-z]{3})(?![A-Za-z])/.exec(af18);\n"
   "      if(kw18&&(td18.length||rt18))return [{tool:'crew_swap',args:{text:who10.empId+' '+src18+' '+(tg10?tg10.replace(/\\s+/g,'').toUpperCase():'')+(td18.length?' TD:'+td18.join(','):'')+(rt18?' TR:'+rt18[1].toUpperCase()+'-'+rt18[2].toUpperCase():' '+ap10.join(' ')),pick:1}}];\n"
   "      return [{tool:'crew_swap',args:{text:who10.empId+' '+dateOf(t)+' '+(tg10?tg10.replace(/\\s+/g,'').toUpperCase():'')+' '+ap10.join(' '),pick:1}}];")
RW('ai crewSwap opts',
   "      var code=(/\\bKX\\s?(\\d{1,4})\\b/i.exec(t)||[])[1],aps=apsOf(t);",
   "      var code=(/\\bKX\\s?(\\d{1,4})\\b/i.exec(t)||[])[1],aps=apsOf(t);\n"
   "      /* 1018A：指定換到哪幾天（TD:）、哪一段（TR:）*/\n"
   "      var tdm18=/\\bTD:([\\d,\\-]+)/.exec(t),trm18=/\\bTR:([A-Z]{3})-([A-Z]{3})/.exec(t.toUpperCase()),opt18=null;\n"
   "      if(tdm18||trm18){opt18={tDates:tdm18?tdm18[1].split(',').filter(function(x){return /^\\d{4}-\\d{2}-\\d{2}$/.test(x)}):[],tFr:trm18?trm18[1]:'',tTo:trm18?trm18[2]:''};if(trm18)aps=[]}")
RW('ai crewSwap pass opts',
   "        swapBuild6(K,X,Y,date,code?'KX'+code:'',aps).then(",
   "        swapBuild6(K,X,Y,date,code?'KX'+code:'',aps,opt18).then(")
RW('ai swapBuild6 sig',
   "  async function swapBuild6(K,X,Y,date,code,aps){",
   "  async function swapBuild6(K,X,Y,date,code,aps,opt18){")
RW('ai swapBuild6 target block',
   "    var tx=tripF(X,date);\n",
   "    var tx=tripF(X,date);\n"+JS('swap18.js'))
RW('ai swapPick start',
   "    S.crewAiR928={ok:true,text:'AI',at:new Date().toISOString(),msgs:[],date:o.date,end:c.end,",
   "    S.crewAiR928={ok:true,text:'AI',at:new Date().toISOString(),msgs:[],date:c.start||o.date,end:c.end,")   # 1018A：跨日互換從較早那一天開始重排

# ══ J／K／M. 營收分析航線搜尋、票價分析人工調整、薪資 CSV（js/adm18.js 放在 r40）══════════════════
R40='kgm-0816d-r40'
RC('adm18 embed',R40,"window.kgmFareAnaPageR1004B=function(){",JS('adm18.js')+"window.kgmFareAnaPageR1004B=function(){")
RC('fareana adj panel',R40,
   "+'<div class=\"k4b-fa-sec\"><h3>'+E(fr)+' → '+E(to)+' <small>'+(z()?'每班艙位階梯':'Fare ladder per flight')+'</small></h3>'",
   "+'<div class=\"k4b-fa-sec\"><h3>'+E(fr)+' → '+E(to)+' <small>'+(z()?'每班艙位階梯':'Fare ladder per flight')+'</small></h3>'+fa18Panel(fr,to,d,mine)")
RW('salary csv button',
   '<button class="btn btn-sm" onclick="kgmSalFoldAllR1006A(true)">全部收起</button>',
   '<button class="btn btn-sm" onclick="kgmSalFoldAllR1006A(true)">全部收起</button><button class="btn btn-sm btn-g" onclick="kgmSalCsvR1018A()">匯出 CSV</button>')
RW('finance route filter',
   "  var top=r.rows.slice().sort(function(a,b){",
   "  /* 1018A：「營收分析要用航線搜尋不要一次列出來太亂了」—— 預設只列航線彙總（點一條才看每一班），可以打航線（TPE-NRT，雙向都算）、班號或機場 */\n"
   "  var q18=String(S._finQR1018A||'').trim().toUpperCase(),qn18=q18.replace(/\\s+/g,'').replace(/[→>～~－]/g,'-'),rt18=function(x){return String(x.route||'').toUpperCase().replace(/\\s+/g,'').replace(/[→>～~－]/g,'-')};\n"
   "  var top=r.rows.filter(function(x){if(!qn18)return true;var rt=rt18(x);if(/^[A-Z]{3}-[A-Z]{3}$/.test(qn18)){var p=qn18.split('-');return rt===qn18||rt===p[1]+'-'+p[0]}return String(x.code).toUpperCase().indexOf(qn18)>=0||rt.indexOf(qn18)>=0}).sort(function(a,b){")
RW('finance route summary',
   "    +'<div style=\"overflow-x:auto;max-height:460px;overflow-y:auto;border:1px solid var(--border);border-radius:10px\">'",
   "    +(function(){var ag={};r.rows.forEach(function(x){var p=rt18(x).split('-'),k=[p[0],p[1]].sort().join('-');var a=ag[k]=ag[k]||{k:k,n:0,pax:0,seats:0,gross:0,profit:0};a.n++;a.pax+=+x.pax||0;a.seats+=+x.seats||0;a.gross+=+x.gross||0;a.profit+=+x.profit||0});\n"
   "      var L=Object.keys(ag).map(function(k){return ag[k]}).sort(function(a,b){return b.profit-a.profit});\n"
   "      return '<div style=\"display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0 10px\"><input class=\"inp\" style=\"height:34px;flex:1;max-width:360px\" list=\"fin18L\" placeholder=\"'+(Z?'搜尋航線（例：TPE-NRT）、班號或機場':'Route (e.g. TPE-NRT), flight or airport')+'\" value=\"'+esc(S._finQR1018A||'')+'\" onchange=\"S._finQR1018A=this.value;render()\" onkeydown=\"if(event.key===\\'Enter\\'){S._finQR1018A=this.value;render()}\">'\n"
   "        +'<datalist id=\"fin18L\">'+L.map(function(a){return '<option value=\"'+esc(a.k)+'\">'}).join('')+'</datalist>'\n"
   "        +(q18?'<button class=\"btn btn-sm\" onclick=\"S._finQR1018A=\\'\\';render()\">'+(Z?'回到航線列表':'All routes')+'</button><span style=\"font-size:12px;color:#556\">'+top.length+(Z?' 班':' flights')+'</span>':'<span style=\"font-size:12px;color:#889\">'+(Z?'下表是各航線（雙向合計）；點一條航線看每一班的明細':'Routes (both directions); click one for flight detail')+'</span>')+'</div>'\n"
   "        +(q18?'':'<div style=\"overflow-x:auto;max-height:460px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;margin-bottom:6px\"><table style=\"width:100%;border-collapse:collapse;font-size:12px;background:#fff\"><thead><tr style=\"background:var(--gsoft);position:sticky;top:0\"><th style=\"padding:8px;text-align:left\">'+(Z?'航線':'Route')+'</th><th style=\"padding:8px;text-align:right!important\">'+(Z?'班次':'Flights')+'</th><th style=\"padding:8px;text-align:right!important\">'+(Z?'旅客':'Pax')+'</th><th style=\"padding:8px;text-align:right!important\">'+(Z?'搭乘率':'LF')+'</th><th style=\"padding:8px;text-align:right!important\">'+(Z?'收入':'Gross')+'</th><th style=\"padding:8px;text-align:right!important\">'+(Z?'淨利':'Profit')+'</th><th></th></tr></thead><tbody>'\n"
   "          +L.map(function(a){var lf=a.seats?a.pax/a.seats:0;return '<tr style=\"border-bottom:1px solid var(--border);cursor:pointer\" onclick=\"S._finQR1018A=\\''+a.k+'\\';render()\"><td style=\"padding:7px 8px;font-weight:800\">'+a.k.replace('-',' ⇄ ')+'</td><td style=\"padding:7px 8px;text-align:right\">'+a.n+'</td><td style=\"padding:7px 8px;text-align:right\">'+Math.round(a.pax).toLocaleString()+'</td><td style=\"padding:7px 8px;text-align:right\">'+(lf*100).toFixed(1)+'%</td><td style=\"padding:7px 8px;text-align:right\">'+money(a.gross)+'</td><td style=\"padding:7px 8px;text-align:right;font-weight:800;color:'+(a.profit>=0?'var(--g)':'var(--red)')+'\">'+money(a.profit)+'</td><td style=\"padding:7px 8px;color:#889\">›</td></tr>'}).join('')+'</tbody></table></div>')})()\n"
   "    +'<div style=\"'+(q18?'':'display:none;')+'overflow-x:auto;max-height:460px;overflow-y:auto;border:1px solid var(--border);border-radius:10px\">'")

# ══ N. 航班資料 PDF → 正式的航班作業報告（js/ops18.js）════════════════════════════════
R48='kgm-0819d-r48'
RC('ops report',R48,"try{window.kgmPrintOpsR41=window.kgmPrintOpsR48;window.printOpsR7=window.kgmPrintOpsR48}catch(_){ }",
   "try{window.kgmPrintOpsR41=window.kgmPrintOpsR48;window.printOpsR7=window.kgmPrintOpsR48}catch(_){ }\n"+JS('ops18.js'))
#   自動補的模擬評分（r195）低分沒有評語 → 之後補的低分直接帶一句（跟 ops18 的負評句庫同一組）
RW('mock low score comment',
   "score:score,comment:'',role:'cabin',",
   "score:score,comment:score<=2?['要求換位態度不佳，當眾大聲爭執。','機上不配合安全指示（安全帶、行李收納）。','登機門廣播兩次仍未到，延誤關門。','行李超重拒絕補費，櫃檯處理逾 20 分鐘。','對餐點不滿意，對組員出言不遜。','飲酒過量，影響鄰座旅客。','多次按服務鈴催促，對組員態度不佳。','擅自更換至空位，經勸導後才返回原座位。'][hh%8]:'',role:'cabin',   /* 1018A：低分帶評語 */")

# ══ H. 航班轉降（Divert）：後台 AI 處理換組員、通知、班表、航班資料顯示（js/dv18.js）════════════════
RC('divert embed',R229,"  function crewSwap(a){",JS('dv18.js')+"  function crewSwap(a){")
RC('divert tool',R229,
   "    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},",
   "    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},\n"
   "    flight_divert:{tab:'sched',zh:'航班轉降處理（text 放原始描述：班號或航線、日期、轉降機場三碼、原因，例如「KX31 10/20 天氣轉降 KIX」；也可給 code/date/alt/reason）：標記轉降、派接替組員（去程多派備援）、原組員休息後 DH 返台、通知當事人並重排班表',run:function(a){return divert18(a)}},   /* 1018A */")
RC('divert plan',R229,
   "    var t=norm(text),acts=[];\n",
   "    var t=norm(text),acts=[];\n"
   "    if(/轉降|改降|備降|divert/i.test(t)&&/\\bKX\\s?\\d{1,4}\\b|[A-Z]{3}(?:\\s*\\/\\s*[A-Z]{3})*\\s*(?:-|→|到)\\s*[A-Z]{3}/i.test(t))return [{tool:'flight_divert',args:{text:t}}];   /* 1018A：轉降 */\n")
RW('divert save','LS.set("kgm_farerule929",S.fareRulesR929||[]);','LS.set("kgm_farerule929",S.fareRulesR929||[]);LS.set("kgm18_divert",S.divertsR1018A||{});')
RW('divert init','fareRulesR929:LS.get("kgm_farerule929",[]),','fareRulesR929:LS.get("kgm_farerule929",[]),divertsR1018A:LS.get("kgm18_divert",{}),/* 1018A：轉降紀錄 */')

RC('divert status keep','kgm-r7-admin-ops',
   "status:Math.abs(dep)<15&&Math.abs(arr)<15?'Scheduled':'Time Change',origin:a,destination:b,updatedAt:new Date().toISOString()};S.flightPredR7[k]=p;",
   "status:Math.abs(dep)<15&&Math.abs(arr)<15?'Scheduled':'Time Change',origin:a,destination:b,updatedAt:new Date().toISOString()};"
   "try{var mo18=(S.flightOverrides||{})[f.code+'_'+date];if(mo18&&/^(Diverted|Cancelled)$/.test(mo18.status||''))p.status=mo18.status}catch(_){}   /* 1018A：人工標的轉降／取消不被預測蓋掉 */"
   "S.flightPredR7[k]=p;")

# ══ D+L. 機型定案（js/tf18.js）：放在最後一層（r229）最前面 ════════════════════════════════
RW('type finalize','<script id="kgm-0909E-r229">\n','<script id="kgm-0909E-r229">\n'+JS('tf18.js'))

# ══ D+L 補：舊稽核（r136 仁川、r143 關西／新千歲、r160 沖繩）寫死「這幾條線一定是 EQV」—— 使用者這一輪要定案機型，
#   改成「EQV 或跟定案（MAP18）相同」都算對；禁 A388 等其他條件照舊。（1012A R210/R211 同樣做法）
FIN18="((window.KGM_TYPEFIX_R1018A||{}).map||{})[f.code]!==f.acft"
RC('audit r136 icn','kgm-0905a-r136',"    if(f.acft!=='EQV')o.icnNonEqv.push(f.code)})}catch(_){}",
   "    if(f.acft!=='EQV'&&"+FIN18+")o.icnNonEqv.push(f.code)})}catch(_){}   /* 1018A：定案機型也算對 */")
RC('audit r143 cts','kgm-0906a-r143',"        if(f.acft!=='EQV')bad.push(f.code+' acft='+f.acft);",
   "        if(f.acft!=='EQV'&&"+FIN18+")bad.push(f.code+' acft='+f.acft);   /* 1018A：定案機型也算對 */")
RC('audit r143 kixEqv','kgm-0906a-r143',"&&f.acft!=='EQV')o.kixEqv.push(f.code)})}catch(_){}",
   "&&f.acft!=='EQV'&&"+FIN18+")o.kixEqv.push(f.code)})}catch(_){}   /* 1018A：定案機型也算對 */")
RC('audit r143 kix','kgm-0906a-r143',"if(f.acft!=='EQV')bad.push(d+' '+f.code+' acft='+f.acft);",
   "if(f.acft!=='EQV'&&"+FIN18+")bad.push(d+' '+f.code+' acft='+f.acft);   /* 1018A：定案機型也算對 */")
RC('audit r160 oka','kgm-0905b-r160',"        if(f.acft!=='EQV')bad.push(f.code+' acft='+f.acft);",
   "        if(f.acft!=='EQV'&&"+FIN18+")bad.push(f.code+' acft='+f.acft);   /* 1018A：定案機型也算對 */")

# ══ O-1. KX31（多倫多／溫哥華→台北）抵達時間三層互搶 → 整年機隊輪轉看開頁時序 ══════════════════════════════
#   量了才發現（kx31u.js）：r77 定值寫夏季 03:55／冬季 23:00–03:45，r68「全航網不在 03:00–03:59 抵達」改成 04:55，
#   r179 經停整段又從前段複製，畫面重繪才會再改回 04:55 —— 整年重排開始那一刻剛好是哪個值，取決於中間有沒有重繪，
#   同一版在快慢不同的電腦上排出來的輪轉就不一樣（30 架不同）。改成 r77 直接寫網站最後顯示的定值（夏 22:55–04:55、冬 23:30–04:15，
#   多倫多出發冬季 20:10），畫面顯示不變，誰先跑都是同一個值。
RC('kx31 settled times','kgm-0823p-r77',
   "'KX31|YVR|TPE':{summer:['22:55','03:55',2,[1,3,5,6,7],'B789'],winter:['23:00','03:45',2,[1,3,5,6,7],'B789']},'KX31|YYZ|TPE':{summer:['19:40','03:55',2,[1,3,5,6,7],'B789'],winter:['19:55','03:45',2,[1,3,5,6,7],'B789']}",
   "'KX31|YVR|TPE':{summer:['22:55','04:55',2,[1,3,5,6,7],'B789'],winter:['23:30','04:15',2,[1,3,5,6,7],'B789']},'KX31|YYZ|TPE':{summer:['19:40','04:55',2,[1,3,5,6,7],'B789'],winter:['20:10','04:15',2,[1,3,5,6,7],'B789']}   /* 1018A：寫網站最後顯示的定值（原本 03:55／03:45 跟 r68、r179 互改，整年輪轉看開頁時序） */")

# ══ O-2. 開頁約 23 秒的 _subPass（舊機型代派）一次 2.2 秒：每一班沒排到的航班都把約 200 架 × 每架上百段掃三遍找「前一段／後一段」
#   → 每架的航段先依起飛時間排一份（穩定排序，同時間保留原本順序），二分搜尋找前一段／後一段；挑選規則（同值取原本順序第一個）不變。
RW('subpass prev bsearch',
   "        var _pb=null,_pd=-Infinity;\n"
   "        for(var _p=0;_p<legs.length;_p++){var _x=legs[_p],_xd=(_x.depAbs||0);\n"
   "          if(_xd<depAbs&&_xd>_pd){_pd=_xd;_pb=_x;}}\n",
   "        /* 1018A：原本每架逐段掃；改成依起飛時間排好的副本二分搜尋（同時間取原本順序第一個，結果一樣） */\n"
   "        var _sx=_sx18(tl,legs),_pb=null,_lo=0,_hi=_sx.length;\n"
   "        while(_lo<_hi){var _m=(_lo+_hi)>>1;if(_sx[_m].d<depAbs)_lo=_m+1;else _hi=_m}\n"
   "        if(_lo>0){var _j=_lo-1;while(_j>0&&_sx[_j-1].d===_sx[_lo-1].d)_j--;_pb=_sx[_j].x}\n")
RW('subpass after bsearch',
   "        var after=null,_ad=Infinity;\n"
   "        for(var _q=0;_q<legs.length;_q++){var _y=legs[_q],_yd=(_y.depAbs||0);\n"
   "          if(_yd>=arrAbs&&_yd<_ad){_ad=_yd;after=_y;}}\n",
   "        var after=null;_lo=0;_hi=_sx.length;\n"
   "        while(_lo<_hi){var _m2=(_lo+_hi)>>1;if(_sx[_m2].d<arrAbs)_lo=_m2+1;else _hi=_m2}\n"
   "        if(_lo<_sx.length)after=_sx[_lo].x;\n")
RW('subpass sx cache',
   "function _subPass(start,days){\n  S.tailAssign=S.tailAssign||{};S.acftSub=S.acftSub||{};\n",
   "function _subPass(start,days){\n  S.tailAssign=S.tailAssign||{};S.acftSub=S.acftSub||{};\n"
   "  /* 1018A：每架航段依起飛時間的排序副本（同時間保留原本順序）；該架加了航段（長度變了）就重排 */\n"
   "  var SX18={};function _sx18(tl,legs){var c=SX18[tl];if(c&&c.a===legs&&c.n===legs.length)return c.s;\n"
   "    var s=legs.map(function(x,i){return {x:x,d:(x.depAbs||0),i:i}});s.sort(function(a,b){return (a.d-b.d)||(a.i-b.i)});SX18[tl]={a:legs,n:legs.length,s:s};return s}\n")

# ══ O-3. 組員引擎第一次建調位索引（MOVE121）：typeOfTail121 對 11 萬段每段都查一次機型（同一架結果一樣）→ 每架查一次
RW('move121 type per tail',
   "if(!MOVE121){MOVE121={};Object.keys(S.tailAssign||{}).forEach(function(t){(S.tailAssign[t]||[]).forEach(function(q){var fr=q.fr||String(q.route).split('→')[0],to=q.to||String(q.route).split('→')[1],v=Object.assign({},q,{fr:fr,to:to,tail:t,type:typeOfTail121(t)});",
   "if(!MOVE121){MOVE121={};Object.keys(S.tailAssign||{}).forEach(function(t){var ty18;(S.tailAssign[t]||[]).forEach(function(q){var fr=q.fr||String(q.route).split('→')[0],to=q.to||String(q.route).split('→')[1],v=Object.assign({},q,{fr:fr,to:to,tail:t,type:(ty18===undefined?(ty18=typeOfTail121(t)):ty18)});   /* 1018A：每架只查一次機型 */")

# ══ O-4. 組員歷史暖機：補完最後一天跟算 30 天歷史擠在同一段（實測 1.95 秒）→ 補完那一段先讓出，下一段再算歷史（結果相同）
RW('hist warm split',
   "        if(!ready&&++guard<600){next(slice);return}\n        var _ok=null;",
   "        if(!ready&&++guard<600){next(slice);return}\n"
   "        if(!rd18){rd18=1;next(slice);return}   /* 1018A：剛補完的這一段先讓出，下一段再算歷史 */\n"
   "        var _ok=null;")
RW('hist warm split var',
   "target=(function(){var t=D(T(),-1),m=D(need6,27);return m>t?m:t})(),guard=0",
   "target=(function(){var t=D(T(),-1),m=D(need6,27);return m>t?m:t})(),guard=0,rd18=0")

# ══ O. 1015A 留下的開頁卡頓：前 60 天機隊初排一次 2.3～3 秒 → 分段準備（js/boot18.js；結果不變，fpfl 指紋比對）══════
_i=CUR.index('<script id="'+R72+'"');_L=CUR[_i:CUR.index('</script>',_i)]
_a=_L.index("setTimeout(function(){\n  if(window.KGM_FULLDONE_1006A||window.KGM_FINALRUN_1006A)return;");_b=_L.index("},2600);\n",_a)+len("},2600);\n")
RC('boot60 chunk',R72,_L[_a:_b],JS('boot18.js'))

open('p_h_r17.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
