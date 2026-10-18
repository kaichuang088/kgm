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

open('p_h_r18.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
