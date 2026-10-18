from common import *
import json
# ══ 1018B ═══════════════════════════════════════════════════════════════════
#   使用者（1018A 交付後）：
#   ①「像是圖一現在這個販售的，我希望其他倉等（基本超值）顯示出來但是寫售完按不下去」
#   ②「KX31時間改成（夏季）：01:00-04:30+1 所有抵達航班一定要是04:00之後喔不能是03:00」
#   比對基準：1018A 最終版 w26（/tmp/j/kgm1018A_w26.html，patches/1018A/build.sh 重建）。
#   不要改到版號字串（build.sh 最後才換版號）。逐項見 notes/1018B-pass121-notes.md。
CUR=open('/tmp/j/kgm1018A_w26.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()

# ══ ① 票價方案售完也列出來（js/sold18.js 放在最後一層 r229 最前面）══════════════════════════
RW('sold18 embed','<script id="kgm-0909E-r229">\n','<script id="kgm-0909E-r229">\n'+JS('sold18.js'))
# 直飛的方案面板
RW('sold18 direct list',
   'const gc=codes.filter(c=>vc.includes(c));if(!gc.length)return"";',
   'const gc=codes.filter(c=>vc.includes(c));if(!gc.length)return"";'
   'const _so18=(window.kgmSoldFamR1018B&&!(S.stx&&S.stx.plan))?window.kgmSoldFamR1018B(key,gc):[];   /* 1018B：賣完的方案照樣列出（售完、不能選） */')
RW('sold18 direct codes',
   'const _fareCodes=_staffFare?[_staffCode]:gc;',
   'const _fareCodes=_staffFare?[_staffCode]:codes.filter(c=>gc.includes(c)||_so18.includes(c));')
RW('sold18 direct avail',
   'const xAvail=(invOverride!==undefined?invOverride>0:(!isXClass||(f.acft!=="A21N"&&xSold<6)))&&!_b11Shut;',
   'const xAvail=(invOverride!==undefined?invOverride>0:(!isXClass||(f.acft!=="A21N"&&xSold<6)))&&!_b11Shut&&!_so18.includes(c);')
RW('sold18 direct rec',
   '${_isRec?`<div class="k929-rec">',
   '${(_isRec&&!_so18.includes(c))?`<div class="k929-rec">')
RW('sold18 direct price',
   '<div class="k929-pr">${useMi?(mi.toLocaleString()+" mi"):(_isBase?fmtAmt(prVar,curr):("+"+fmtAmt(_dlt,curr)))}</div>',
   '<div class="k929-pr">${_so18.includes(c)?(LANG==="en"?"Sold out":"售完"):(useMi?(mi.toLocaleString()+" mi"):(_isBase?fmtAmt(prVar,curr):("+"+fmtAmt(_dlt,curr))))}</div>')
RW('sold18 direct sub',
   '<div class="k929-sub">${useMi?(LANG==="en"?"per guest":"每人"):(_isBase?',
   '<div class="k929-sub">${_so18.includes(c)?(LANG==="en"?"This fare is no longer available on this flight":"此票價本班已售完，請選擇其他票價"):useMi?(LANG==="en"?"per guest":"每人"):(_isBase?')
RW('sold18 direct soldline',
   '${(!xAvail)?`<div class="k929-sold">${LANG==="en"?"Sold out":"售完"}</div>`:""}',
   '${(!xAvail&&!_so18.includes(c))?`<div class="k929-sold">${LANG==="en"?"Sold out":"售完"}</div>`:""}')
RW('sold18 direct button',
   'data-r91="1">${LANG==="en"?\'Select\':\'選擇\'}</button></div>',
   'data-r91="1">${xAvail?(LANG==="en"?\'Select\':\'選擇\'):(LANG==="en"?\'Sold out\':\'售完\')}</button></div>')
# 轉機的方案面板（卡片本身是按鈕 → 售完改成不能點的 div）
RW('sold18 conn list',
   '  var cards=codes.map(function(k){',
   '  var so18=window.kgmSoldFamR1018B?window.kgmSoldFamR1018B(cabK,codes):[];   /* 1018B：賣完的方案照樣列出 */\n'
   '  var cards=CAB_CODES(cabK).filter(function(k){return codes.indexOf(k)>=0||so18.indexOf(k)>=0}).map(function(k){var sold18=so18.indexOf(k)>=0;')
RW('sold18 conn open',
   "    return '<button class=\"k929-fare k929-cbtn\" style=\"--k929c:'+col+';padding:0\" onclick=\"event.stopPropagation();pickConnectionFare('+cIdx+',\\''+dir+'\\',\\''+f1.date+'\\',\\''+k+'\\')\">'",
   "    return (sold18?'<div class=\"k929-fare k929-cbtn sold\" style=\"--k929c:'+col+';padding:0;cursor:not-allowed\" aria-disabled=\"true\">':'<button class=\"k929-fare k929-cbtn\" style=\"--k929c:'+col+';padding:0\" onclick=\"event.stopPropagation();pickConnectionFare('+cIdx+',\\''+dir+'\\',\\''+f1.date+'\\',\\''+k+'\\')\">')")
RW('sold18 conn rec',
   "      +(fi.rec?'<div class=\"k929-rec\">'",
   "      +((fi.rec&&!sold18)?'<div class=\"k929-rec\">'")
RW('sold18 conn price',
   "      +'<div class=\"k929-pr\">'+(base?fmtAmt(p,curr2):('+'+fmtAmt(dlt,curr2)))+'</div>'",
   "      +'<div class=\"k929-pr\">'+(sold18?(EN?'Sold out':'售完'):(base?fmtAmt(p,curr2):('+'+fmtAmt(dlt,curr2))))+'</div>'")
RW('sold18 conn sub',
   "      +'<div class=\"k929-sub\">'+(base?",
   "      +'<div class=\"k929-sub\">'+(sold18?(EN?'This fare is no longer available on this flight':'此票價本班已售完，請選擇其他票價'):base?")
RW('sold18 conn sel',
   "      +'<div class=\"k929-sel\"><span class=\"k929-selb\">'+(EN?'Select':'選擇')+'</span></div>'",
   "      +'<div class=\"k929-sel\"><span class=\"k929-selb\">'+(sold18?(EN?'Sold out':'售完'):(EN?'Select':'選擇'))+'</span></div>'")
RW('sold18 conn close',
   "      +'</div></button>';\n  }).join(\"\");",
   "      +'</div>'+(sold18?'</div>':'</button>');\n  }).join(\"\");")

# ══ ② KX31 夏季 溫哥華→台北 01:00–04:30⁺¹ ═══════════════════════════════════════════
#   溫哥華 01:00 起飛是多倫多出發的隔天 → 溫哥華→台北這一段夏季營運日跟著往後一天（多倫多 一三五六日 → 溫哥華 一二四六日）；
#   整段（多倫多→台北）19:40–04:30⁺²，營運日照舊。冬季不動（23:30–04:15⁺²）。
#   r179「中停一律 75 分」「回台北的後段 07:00 以後才起飛」會把 01:00 推回去 → KX31 列入例外（使用者指定的時刻）。
#   冬季多倫多→溫哥華 20:10–22:15 原本不是定值，是 r68／r136／r179 互相改出來的結果；夏季改了以後那串改法跑出來不一樣（量到 19:55–21:45、溫哥華 23:00 起飛）
#   → 照 1018A 網站實際顯示的冬季值寫成定值（CLAUDE.md：季節時刻的修正一律寫定值），冬季三列跟 1018A 完全相同。
#   r77 定值表對「已存過的季節紀錄」（userR929A）不覆蓋 → 舊預設值（22:55–03:55／04:55、整段 19:40–03:55／04:55）才遷移，人工改過的不動。
RC('kx31 summer 1018B','kgm-0823p-r77',
   "'KX31|YVR|TPE':{summer:['22:55','04:55',2,[1,3,5,6,7],'B789'],winter:['23:30','04:15',2,[1,3,5,6,7],'B789']},'KX31|YYZ|TPE':{summer:['19:40','04:55',2,[1,3,5,6,7],'B789'],winter:['20:10','04:15',2,[1,3,5,6,7],'B789']}",
   "'KX31|YYZ|YVR':{summer:['19:40','21:40',0,[1,3,5,6,7],'B789'],winter:['20:10','22:15',0,[1,3,5,6,7],'B789']},'KX31|YVR|TPE':{summer:['01:00','04:30',1,[1,2,4,6,7],'B789'],winter:['23:30','04:15',2,[1,3,5,6,7],'B789']},'KX31|YYZ|TPE':{summer:['19:40','04:30',2,[1,3,5,6,7],'B789'],winter:['20:10','04:15',2,[1,3,5,6,7],'B789']}   /* 1018B：使用者指定夏季 01:00–04:30+1；多倫多→溫哥華冬季寫定值（＝1018A 實際顯示） */")
RC('kx31 migrate 1018B','kgm-0823p-r77',
   "      if(!(old&&old.userR929A))S.seasonSchedulesR48[k]={summer:rec(v.summer)",
   "      var MIG18B={'KX31|YVR|TPE':['22:55-03:55','22:55-04:55','01:10-05:10'],'KX31|YYZ|TPE':['19:40-03:55','19:40-04:55','19:40-05:10']};   /* 1018B：舊的系統預設才遷移 */\n"
   "      if(old&&old.userR929A&&MIG18B[k]&&old.summer&&MIG18B[k].indexOf(old.summer.dep+'-'+old.summer.arr)>=0){old.summer=rec(v.summer);old.updatedAt=new Date().toISOString()}\n"
   "      if(!(old&&old.userR929A))S.seasonSchedulesR48[k]={summer:rec(v.summer)")
RC('kx31 season change 1018B','kgm-0823p-r77',
   "      if(f.code==='KX239')f.noOpDatesR928=nyepi928.concat(['2027-03-28','2028-03-26']);});",
   "      if(f.code==='KX239')f.noOpDatesR928=nyepi928.concat(['2027-03-28','2028-03-26']);});\n"
   "    /* 1018B：KX31 夏季溫哥華 01:00 起飛（多倫多出發的隔天），冬季 23:30（同一天）。換季那一天兩種接法會撞在一起：\n"
   "       冬季第一個星期日（2026-10-25、2027-10-31）那天溫哥華只有接前一天的 01:00 班 → 多倫多出發那一班停飛；\n"
   "       夏季第一個星期一（2027-03-29、2028-03-27）01:00 沒有前一天飛進來的飛機（前一天已經 23:30 走了）→ 溫哥華→台北那一段停飛。（同 KX240／239 換季做法） */\n"
   "    allF().forEach(function(f){if(!f||f.partner||f.code!=='KX31')return;\n"
   "      if(f.fr==='YYZ')f.noOpDatesR928=['2026-10-25','2027-10-31'];\n"
   "      if(f.fr==='YVR'&&f.to==='TPE')f.noOpDatesR928=['2027-03-29','2028-03-27'];});")
#   只免「夏季」：整個班號列入 EXEMPT 會連 freeze（seededR57=0）一起跳過 → r68 把冬季多倫多→溫哥華改成 19:55–21:40（原本 20:10–22:15），量到才發現。
RC('kx31 exempt r179','kgm-0907B-r179',"var EXEMPT={};",
   "var EXEMPT={};var SEA18B={KX31:'summer'};   /* 1018B：KX31 夏季溫哥華 01:00 起飛是使用者指定（中停 3 小時 20 分、回台北段 07:00 前起飛），這一季不套 75 分／07:00 規則；冬季照舊 */")
RC('kx31 exempt r179 apply','kgm-0907B-r179',
   "      if(!runsIn(V,L1,sea))return;      /* 這一季不飛這個版本",
   "      if(SEA18B[V.code]===sea)return;   /* 1018B */\n      if(!runsIn(V,L1,sea))return;      /* 這一季不飛這個版本")
RC('kx31 exempt r179 audit','kgm-0907B-r179',
   "exempt:!!EXEMPT[V.code],",
   "exempt:!!EXEMPT[V.code]||SEA18B[V.code]===sea,")

# ══ ③ 瀏覽器儲存空間已滿（1018B 交付後使用者回報：員工資料 kgm_staff 5.5 MB、會員 kgmus4 3.0 MB，座位庫存存不進去）═════════
#   重現（tests/upsim18.js）：舊版（沒有產生前估算）用後台「模擬資料」產生 3,000 位員工 → 1018B 開頁，kgm_staff 存成 151 萬字元；
#   其中員工票眷屬名單 famOnFile 佔 92.5 萬：r55 seedStaffFamK5 依員工編號＋姓名替每一位員工（含模擬員工）自動產生 1～4 位眷屬，整份存進去。
#   修法：存檔時，跟「用同一個員工編號＋姓名重新產生」一模一樣的眷屬名單不存（只留 famSeed18B 標記）；讀回時用 r55 同一個函式重新產生。
#   使用者自己登記／改過的眷屬跟自動產生的不一樣 → 整份照存，不冒險。famOnFile 只有 r55 在讀，開頁時 r55 本來就會補空的名單。
RC('fam seed list 1018B','kgm-0823c-r55',
   "function seedStaffFamK5(){\n  var n=0;\n  try{\n    (S.staff||[]).forEach(function(st){\n      if(!st||!st.empId)return;\n      if(st.famOnFile&&st.famOnFile.length)return;\n      var h=H(st.empId),out=[];",
   "function seedStaffFamK5(list18){   /* 1018B：list18＝只補這幾位、不存檔（讀回存檔時重新產生用） */\n  var n=0;\n  try{\n    (list18||S.staff||[]).forEach(function(st){\n      if(!st||!st.empId)return;\n"
   "      if(st.famOnFile&&st.famOnFile.length){delete st.famSeed18B;return}\n"
   "      var re18=st.famSeed18B||0;delete st.famSeed18B;   /* 1018B：存檔時省略的自動眷屬名單，重新產生（內容一模一樣），不算新的修改；2＝當初用改名前的姓名產生 */\n"
   "      var h=H(st.empId),out=[];")
RC('fam seed oldname 1018B','kgm-0823c-r55',
   "      var last=String(st.name||'KGM').trim().split(/\\s+/).pop().toUpperCase();",
   "      var last=String((re18===2&&st.nameWasR1012A)||st.name||'KGM').trim().split(/\\s+/).pop().toUpperCase();")
RC('fam seed save 1018B','kgm-0823c-r55',
   "      st.famOnFile=out;n++;\n    });\n    if(n)try{save()}catch(_){}",
   "      st.famOnFile=out;if(!re18)n++;\n    });\n    if(n&&!list18)try{save()}catch(_){}")
RC('fam seed export 1018B','kgm-0823c-r55',
   "window.kgmSeedStaffFamK5=seedStaffFamK5;\n",
   "window.kgmSeedStaffFamK5=seedStaffFamK5;\n"
   "/* 1018B：這位員工（員工編號＋姓名）自動產生的眷屬名單長什麼樣子 —— 存檔時比對用 */\n"
   "window.kgmFamSeedR1018B=function(st,was){var t={empId:st&&st.empId,name:st&&(was?st.nameWasR1012A:st.name)};if(!t.name)return null;seedStaffFamK5([t]);return t.famOnFile||null};\n")
RW('fam strip fn 1018B',
   "try{window._stripSynR1018A=_stripSynR1018A}catch(e){}\n",
   "try{window._stripSynR1018A=_stripSynR1018A}catch(e){}\n"
   "/* 1018B：員工票眷屬名單 famOnFile 跟 r55 依員工編號＋姓名自動產生的一模一樣 → 不存（留 famSeed18B 標記），讀回時重新產生。\n"
   "   使用者回報 kgm_staff 5.5 MB：模擬員工每位都有自動眷屬名單，3,000 位員工光這一欄就 92.5 萬字元。人工登記／改過的照存。 */\n"
   "function _stripFamR1018B(arr){\n"
   "  if(!Array.isArray(arr)||typeof window.kgmFamSeedR1018B!=='function')return arr;var out=null;\n"
   "  for(var i=0;i<arr.length;i++){var st=arr[i];if(!st||!Array.isArray(st.famOnFile)||!st.famOnFile.length)continue;\n"
   "    var f=JSON.stringify(st.famOnFile),w=0,g=null;try{g=window.kgmFamSeedR1018B(st);if(g&&JSON.stringify(g)===f)w=1;\n"
   "      else if(st.nameWasR1012A){g=window.kgmFamSeedR1018B(st,true);if(g&&JSON.stringify(g)===f)w=2}}catch(_){}   /* 2＝名單是改名（nameWasR1012A）前用舊姓名產生的 */\n"
   "    if(!w)continue;\n"
   "    if(!out)out=arr.slice();var c={};for(var k in st)if(k!=='famOnFile'&&Object.prototype.hasOwnProperty.call(st,k))c[k]=st[k];c.famSeed18B=w;out[i]=c}\n"
   "  return out||arr;\n"
   "}\n")
RW('fam strip pack 1018B',
   "    if(k==='kgmus4')return _packAR1012A(_stripSynR1018A(v));",
   "    if(k==='kgmus4')return _packAR1012A(_stripSynR1018A(v));\n"
   "    if(k==='kgm_staff')return _packAR1012A(_stripFamR1018B(v));   /* 1018B：自動產生的眷屬名單不存 */")
RW('fam strip unpack 1018B',
   "if(k==='kgmus4'){try{window.kgmSynLogR1018A&&window.kgmSynLogR1018A(a18)}catch(_){}}return a18}",
   "if(k==='kgmus4'){try{window.kgmSynLogR1018A&&window.kgmSynLogR1018A(a18)}catch(_){}}"
   "if(k==='kgm_staff'){try{window.kgmSeedStaffFamK5&&window.kgmSeedStaffFamK5(a18.filter(function(x){return x&&x.famSeed18B}))}catch(_){}}"   # 1018B：開頁時 r55 還沒載入，由 r55 自己補；跨分頁同步讀回時在這裡補
   "return a18}")

RW('fam strip cache 1018B',
   "      if(c&&c.raw===raw)return c.s;\n      var s=JSON.stringify(kgmLsPackR1012A(k,v));_arCacheR1012A[k]={raw:raw,s:s};return s;",
   "      var f18=typeof window.kgmFamSeedR1018B==='function';   /* 1018B：開頁第一次存檔時 r55 還沒載入、眷屬名單沒省略；那一份不能一直沿用（員工資料沒變就永遠是大的那份） */\n"
   "      if(c&&c.raw===raw&&(c.f18||!f18||k!=='kgm_staff'))return c.s;\n"
   "      var s=JSON.stringify(kgmLsPackR1012A(k,v));_arCacheR1012A[k]={raw:raw,s:s,f18:f18};return s;")

# ══ ⑤ 票價分析：出發地／目的地、班號搜尋、拿掉航線總覽、艙位階梯可以編輯（js/fa18b.js，跟 1018A adm18 放同一處 r40）══════
R40='kgm-0816d-r40'
RC('fa18b embed',R40,"window.kgmFareAnaPageR1004B=function(){",JS('fa18b.js')+"window.kgmFareAnaPageR1004B=function(){")
RC('fa18b no overview',R40,"var ov=faOverview1004B(d),fl=faFlights1004B(d),routes={};","var fl=faFlights1004B(d),routes={};   /* 1018B：航線總覽拿掉（使用者：「這個總覽不用有」）—— 也不用再把當天全部航班算一遍 */")
i0=CUR.index('<script id="kgm-0816d-r40"');L40=CUR[i0:CUR.index('</script>',i0)]
ovBlk=L40[L40.index("  /* ① 航線總覽 */"):L40.index("  /* ② 選定航線：每一班 */")]
RC('fa18b no overview html',R40,ovBlk,"")
RC('fa18b no overview sec',R40,"    +'<div class=\"k4b-fa-sec\"><h3>'+(z()?'航線總覽':'Routes')+' <small>'+E(d)+'</small></h3>'+ovH+'</div>'\n","")
RC('fa18b route pick',R40,
   "  if(!q.fr||!routes[q.fr+'-'+q.to]){var p=(rk.indexOf('TPE-NRT')>=0?'TPE-NRT':rk[0]||'-').split('-');q.fr=p[0];q.to=p[1]}",
   "  /* 1018B：輸入班號 → 跳到那一班的航線；出發地選了、目的地不在這個出發地 → 換成這個出發地的第一個目的地 */\n"
   "  var codeHit18=null;if(q.code){fl.forEach(function(x){if(!codeHit18&&x.f.code===q.code)codeHit18=x});if(codeHit18){q.fr=codeHit18.f.fr;q.to=codeHit18.f.to}}\n"
   "  if(q.fr&&!routes[q.fr+'-'+q.to]){var t18=rk.filter(function(k){return k.indexOf(q.fr+'-')===0})[0];if(t18)q.to=t18.split('-')[1]}\n"
   "  if(!q.fr||!routes[q.fr+'-'+q.to]){var p=(rk.indexOf('TPE-NRT')>=0?'TPE-NRT':rk[0]||'-').split('-');q.fr=p[0];q.to=p[1]}")
RC('fa18b mine code',R40,
   "  var mine=fl.filter(function(x){return x.f.fr===fr&&x.f.to===to});",
   "  var mine=fl.filter(function(x){return x.f.fr===fr&&x.f.to===to&&(!codeHit18||x.f.code===q.code)});")
RC('fa18b chip',R40,
   "          return '<span class=\"k4b-fa-b '+r.st+'\" title=\"'",
   "          return '<span class=\"k4b-fa-b '+r.st+fa18bCls(a,d,r)+'\"'+fa18bOn(a,d,r)+' title=\"'")
RC('fa18b editor',R40,"}).join('')+'</div></td>'","}).join('')+'</div>'+fa18bEditor(a,d,c)+'</td>'")
RC('fa18b bar',R40,
   "      +'<label>'+(z()?'航線':'Route')+'<select class=\"inp k4b-fa-sel\" onchange=\"kgmFareAnaSetR1004B(\\'route\\',this.value)\">'+rk.map(function(k){return '<option value=\"'+E(k)+'\"'+(k===fr+'-'+to?' selected':'')+'>'+E(k.replace('-',' → '))+'</option>'}).join('')+'</select></label>'",
   "      +fa18bBar(q,routes,fl)")
RC('fa18b css',R40,"  return '<section class=\"k4b-ss k4b-fa\">'",
   "  var miss18=(q.code&&!codeHit18)?'<div class=\"k4b-fa-empty\">'+E(q.code)+(z()?' 這一天沒有飛（或不是本公司班號），先顯示原本的航線。':' does not operate that day.')+'</div>':'';\n"
   "  return FA18B_CSS+'<section class=\"k4b-ss k4b-fa\">'")
RC('fa18b miss note',R40,
   "    +'<div class=\"k4b-fa-sec\"><h3>'+E(fr)+' → '+E(to)+' <small>'",
   "    +miss18+'<div class=\"k4b-fa-sec\"><h3>'+E(fr)+' → '+E(to)+' <small>'")
RC('fa18b set',R40,
   "  if(k==='route'){var p=String(v||'').split('-');q.fr=p[0]||'';q.to=p[1]||''}else q[k]=v;",
   "  if(k==='route'){var p=String(v||'').split('-');q.fr=p[0]||'';q.to=p[1]||'';q.code=''}\n"
   "  else if(k==='code'){v=String(v||'').toUpperCase().replace(/\\s+/g,'');if(/^\\d+$/.test(v))v='KX'+v;q.code=v}   /* 1018B：班號搜尋（182 也當 KX182） */\n"
   "  else{q[k]=v;if(k==='fr'||k==='to')q.code=''}\n"
   "  S.fa18bEdR1018B=null;")
# 價格：人工調整可以只套用在某一個艙位代號（bucket）
RW('fa18b rule bucket sig',"function kgmFareRuleMulR929(f,cabin){","function kgmFareRuleMulR929(f,cabin,fc18){   /* 1018B：fc18＝艙位代號（E-C…），規則有 bucket 時只套那一格 */")
RW('fa18b rule bucket chk',"      if(r.code&&r.code!==f.code)return;\n      if(r.firstSegOnly)","      if(r.code&&r.code!==f.code)return;\n      if(r.bucket&&r.bucket!==fc18)return;\n      if(r.firstSegOnly)")
RW('fa18b rule bucket call',"*kgmFareRuleMulR929(f,cabin);","*kgmFareRuleMulR929(f,cabin,code);")

open('p_h_r18.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
