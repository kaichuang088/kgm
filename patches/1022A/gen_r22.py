from common import *
import json
# ══ 1022A ═══════════════════════════════════════════════════════════════════
#   使用者（1020B 交付後）：
#   「圖一不應該有下面那一些」（手機頁尾下面多一條白色空白）
#   「還有後台定位管理那裡要可以把乘客端的更改票全線關閉」
#   「圖二這種航班注意喔，有中停的價錢一定要低於直飛」（TPE→MEL：KX60 經 KUL 比 KX54 直飛貴）
#   「航班資料那裡組員、地勤、飛行員要直接列出他們接下來七天的航班，不能有搜尋功能（只能看到自己負責的航班，一但班表有更新這個也要更新，
#     也只能看到自己負責的部分，像是飛行資料只有飛行員看得到）」
#   「航班資料PDF要包含飛行資料和營運建議（for機長/ceo），還有之前講過要包含特別注意的旅客（金卡、鑽石卡、評分<2）也要列出來分艙等」
#   「圖三航班資料每一個旁邊都要有一個展開+和收起來-的按鈕不然整個太多了要滑到下面很麻煩」
#   「圖四有寫TPE-SYD via BKK很棒啊 但是像是圖五為啥沒有」（停機位查詢只有 KX50 寫死）
#   比對基準：1020B 最終版 w9（/tmp/j/kgm1020B_w9.html，patches/1020B/build.sh 重建）。
CUR=open('/tmp/j/kgm1020B_w9.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 航班資料 PDF：飛行資料（載重平衡、燃油估算）＋給機長／給 CEO 的營運建議＋特別留意旅客依艙等（金卡、鑽石卡、評分 < 2）—— ops18 → ops22 ══
RW('ops22',JS('ops18.js'),JS('ops22.js'))
# PDF 的載重平衡跟航班資料頁同一個函式：r7 loadBalance7 開出來，算完把數字留一份給 PDF 讀
RC('r7 expose lb','kgm-r7-admin-ops',"  function opsPage7(){",
   "  window.kgmLoadBalanceR1022A=loadBalance7;   /* 1022A：航班資料 PDF 的「飛行資料」讀同一個載重平衡 */\n  function opsPage7(){")
RC('r7 lb stash','kgm-r7-admin-ops',"    var util=Math.round(zfw/mzfw*1000)/10;\n    return '<section class=\"r7-ops-card r7-loadbal\">'",
   "    var util=Math.round(zfw/mzfw*1000)/10;\n"
   "    try{window.KGM_LB_R1022A=window.KGM_LB_R1022A||{};window.KGM_LB_R1022A[f.code+'|'+date+'|'+f.fr]={type:t,bagN:bagN,holdKg:holdKg,paxKg:paxKg,cabinKg:cabinKg,zfw:zfw,mzfw:mzfw,Z:Z,idx:Math.round(idx*10)/10,util:util,okBand:okBand,move:move,dir:dir,advice:advice}}catch(_){}   /* 1022A */\n"
   "    return '<section class=\"r7-ops-card r7-loadbal\">'")

# ══ r55 權限表：使用者「飛行資料只有飛行員看得到」、PDF「for 機長／CEO」→ 客艙組員拿掉（原本 flight／pdf 都有 cabin）══
RC('r55 perm flight','kgm-0823c-r55',"  flight:['cabin','pilot','ceo'],","  flight:['pilot','ceo'],          /* 1022A：飛行資料只有飛行員（使用者） */")
RC('r55 perm pdf','kgm-0823c-r55',"  pdf:['cabin','pilot','ceo']","  pdf:['pilot','ceo']               /* 1022A：PDF 給機長／CEO */")
RC('r55 hero all','kgm-0823c-r55',"      if(c.classList.contains('r7-manifest'))return;",
   "      if(c.classList.contains('r7-manifest'))return;\n      if(c.classList.contains('r7-ops-hero'))return;   /* 1022A：最上面的航班概況（班號、表定時間、人數）大家都要看得到是哪一班；飛行資料（天氣、航路、載重）仍只給飛行員 */")
# 頁面權限矩陣：0915A 空服員看不到航班資料頁 → 使用者 1022A「航班資料那裡組員、地勤、飛行員要直接列出他們接下來七天的航班」→ 空服員給檢視（只看得到自己的班，k22）
RC('r123 crew flightdata','kgm-0903b-r123',"  crew:{status:'view',sched:'view',mgr12:'use',leave:'use',stafftix:'use',stxstatus:'use',",
   "  crew:{flightdata:'view',   /* 1022A：使用者要組員在航班資料看到自己接下來 7 天的航班（只看得到自己的班與自己負責的區塊） */\n    status:'view',sched:'view',mgr12:'use',leave:'use',stafftix:'use',stxstatus:'use',")

# ══ 停機位查詢：所有經停直飛班都寫「起點→終點 via 經停站」（原本只寫死 KX50）══════════════
RC('r74 route label','kgm-0823o-r74',
   "function routeLabel74(f){\n  if(f&&f.code==='KX50'&&f.fr==='TPE')return 'TPE→SYD via BKK';\n  return f?(f.fr+'→'+f.to):'';\n}",
   "function routeLabel74(f,date){\n"
   "  /* 1022A：原本只寫死 KX50；改成查同一班號、從這一站出發、經停站＝這一段終點的經停列（f.via），有就寫「起點→終點 via 經停站」 */\n"
   "  if(!f)return '';\n"
   "  try{var dt=date?new Date(date+'T12:00:00'):null;\n"
   "    var V=allF().filter(function(x){return x&&x.via&&x.code===f.code&&x.fr===f.fr&&x.via===f.to&&(!dt||flyOn(x,dt))})[0];\n"
   "    if(V)return f.fr+'→'+V.to+' via '+f.to}catch(_){}\n"
   "  return f.fr+'→'+f.to;\n}")
RC('r74 label date 1','kgm-0823o-r74',"routeLabel:routeLabel74(f)","routeLabel:routeLabel74(f,date)")
RC('r74 label date 2','kgm-0823o-r74',"E(routeLabel74(f))","E(routeLabel74(f,date))",2)

# ══ 航班資料（組員看自己 7 天）讀組員班表同一份：r196 的 60 天索引只在「組員班表」分頁才會往前算（READY196），
#    其他分頁 kgmRosterR196 永遠回 0 天 → 加第三個參數 anyDay：呼叫端已經確認那幾天的組員計畫算好了（kgmCrewHasDayR121），就直接讀當天索引 ══
RC('r196 anyDay','kgm-0907A-r196',"window.kgmRosterR196=function(empId,days){\n  var out=[],n=Math.min(days||DAYS196,READY196);",
   "window.kgmRosterR196=function(empId,days,anyDay){\n  var out=[],n=anyDay?(days||DAYS196):Math.min(days||DAYS196,READY196);   /* 1022A：anyDay＝不等 r196 背景進度（航班資料頁自己暖好組員計畫） */")

# ══ 圖五：後台改票換機場組合（TPE–MEL → TPE–SEA）按確認跳「該日無相同航線」——
#    報價（kgmCabinQuoteR82）用新的起訖，但寫回時 kgmApplyReissueR45 → kgmReissueQuoteR45 又拿訂位上的原起訖找 KX26 → 找不到。
#    寫回前先把這一段的起訖換成新的機場組合，寫回失敗就還原（成功後原本的 airportChanged 那段照舊補時刻與紀錄）══
RC('r82 airport apply','kgm-0823p-r82',
   "  var applied=null;\n  try{applied=window.kgmApplyReissueR45(b.pnr,q.seg.key,q.targetFlight.code,q.targetDate,q.newCode,'settled')}catch(e){applied={ok:false,why:String(e&&e.message||e)}}",
   "  var applied=null,tgt22=(q.seg.key==='inb')?'inbF':(q.seg.key==='out'?'outF':null),was22=null;\n"
   "  if(q.airportChanged&&tgt22&&b[tgt22]){was22=b[tgt22];b[tgt22]=Object.assign({},b[tgt22],{fr:q.newFr,to:q.newTo})}   /* 1022A：換機場組合先換起訖再寫回 */\n"
   "  try{applied=window.kgmApplyReissueR45(b.pnr,q.seg.key,q.targetFlight.code,q.targetDate,q.newCode,'settled')}catch(e){applied={ok:false,why:String(e&&e.message||e)}}\n"
   "  if((!applied||!applied.ok)&&was22)b[tgt22]=was22;")

# ══ 動作歷史：使用者「（誰・做了什麼・何時）移除（內的文字）然後要可以輸入員工編號看某個員工幹啥」——
#    標題只留「動作歷史」；加員工編號（或姓名）篩選，類別筆數、全選、刪除「這個類別全部」都只算篩選後的那幾筆 ══
RC('hist emp fn','kgm-0909E-r229',
   "    window.kgmHistBodyR1010A=function(){\n      var all=S.audit||[],cat=String(S._histCatR1010A||''),cnt={};all.forEach(function(a){var k=String(a&&a.act||'');cnt[k]=(cnt[k]||0)+1});",
   "    /* 1022A：員工編號篩選 —— audit 的 who 是「姓名(員工編號)」，輸入編號或姓名都可以（不分大小寫） */\n"
   "    function empOk22(a){var q=String(S._histEmpR1022A||'').trim().toUpperCase();return !q||String(a&&a.who||'').toUpperCase().indexOf(q)>=0}\n"
   "    window.kgmHistEmpR1022A=function(v){S._histEmpR1022A=String(v||'').trim();S._histSelR1010A={};render()};\n"
   "    window.kgmHistBodyR1010A=function(){\n      var all=S.audit||[],cat=String(S._histCatR1010A||''),cnt={};all.forEach(function(a){if(!empOk22(a))return;var k=String(a&&a.act||'');cnt[k]=(cnt[k]||0)+1});")
RC('hist rows emp','kgm-0909E-r229',"rows=[];all.forEach(function(a,i){if(!cat||String(a&&a.act||'')===cat)rows.push(i)});",
   "rows=[];all.forEach(function(a,i){if(empOk22(a)&&(!cat||String(a&&a.act||'')===cat))rows.push(i)});")
RC('hist title','kgm-0909E-r229',"      return '<div class=\"adm-sec\">動作歷史（誰・做了什麼・何時）</div>'",
   "      var nAll=all.filter(empOk22).length,emp=String(S._histEmpR1022A||'');\n"
   "      return '<div class=\"adm-sec\">動作歷史</div>'")
RC('hist all count','kgm-0909E-r229',"+'<option value=\"\">全部（'+all.length+'）</option>'","+'<option value=\"\">全部（'+nAll+'）</option>'")
RC('hist emp input','kgm-0909E-r229',
   "        +'<span style=\"flex:1\"></span>'\n        +'<button class=\"btn btn-sm\"'+(nSel?'':' disabled')+' onclick=\"kgmHistDelR1010A(\\'sel\\')\">刪除勾選（'+nSel+'）</button>'",
   "        +'<label style=\"font-size:12px;color:#667;margin-left:6px\">員工編號</label><input class=\"inp\" style=\"max-width:200px;height:36px\" placeholder=\"例：K74992 或姓名\" value=\"'+hE(emp)+'\" onkeydown=\"if(event.key===\\'Enter\\')kgmHistEmpR1022A(this.value)\" onchange=\"kgmHistEmpR1022A(this.value)\">'\n"
   "        +(emp?'<button class=\"btn btn-sm\" onclick=\"kgmHistEmpR1022A(\\'\\')\">清除（'+hE(emp)+'：'+nAll+' 筆）</button>':'')\n"
   "        +'<span style=\"flex:1\"></span>'\n        +'<button class=\"btn btn-sm\"'+(nSel?'':' disabled')+' onclick=\"kgmHistDelR1010A(\\'sel\\')\">刪除勾選（'+nSel+'）</button>'")
RC('hist selall emp','kgm-0909E-r229',"if(on)(S.audit||[]).forEach(function(a,i){if(!cat||String(a&&a.act||'')===cat)o[i]=1});",
   "if(on)(S.audit||[]).forEach(function(a,i){if(empOk22(a)&&(!cat||String(a&&a.act||'')===cat))o[i]=1});")
RC('hist del emp','kgm-0909E-r229',"(S.audit||[]).forEach(function(a,i){if(mode==='cat'?(cat&&String(a&&a.act||'')===cat):!!sel[i]){kill[i]=1;n++}});",
   "(S.audit||[]).forEach(function(a,i){if(mode==='cat'?(cat&&empOk22(a)&&String(a&&a.act||'')===cat):!!sel[i]){kill[i]=1;n++}});")

# ══ 競標：使用者「競標要先列出商務在寫豪經然後要有那個+ / -的按鈕（可以expand or 收起）」——
#    同一班同一天的 BigDeal 依目標艙等由高到低（頭等 → 商務 → 豪經）；每一組標題左邊 + / −，欄位標題有「全部展開／全部收起」 ══
RC('auc sort cabin','kgm-0823h-r61',
   "    var ks=Object.keys(g).sort(function(a,b){\n      var A=a.split('|'),B=b.split('|');return String(A[1]).localeCompare(String(B[1]))||String(A[0]).localeCompare(String(B[0]),undefined,{numeric:true})});",
   "    var CR22={Resident:0,First:1,Business:2,Premium:3,Economy:4};   /* 1022A：同一班先列高艙等（頭等、商務），再列豪經 */\n"
   "    var ks=Object.keys(g).sort(function(a,b){\n      var A=a.split('|'),B=b.split('|');return String(A[1]).localeCompare(String(B[1]))||String(A[0]).localeCompare(String(B[0]),undefined,{numeric:true})||String(A[2]||'').localeCompare(String(B[2]||''))||((CR22[A[3]]!=null?CR22[A[3]]:9)-(CR22[B[3]]!=null?CR22[B[3]]:9))});")
RC('auc pass key','kgm-0823h-r61',"+(ks.length?shown.map(function(k){return grpCard(g[k],settle)}).join('')",
   "+(ks.length?shown.map(function(k){return grpCard(g[k],settle,key+'#'+k)}).join('')")
RC('auc col all','kgm-0823h-r61',
   "      +(rest>0?('<em class=\"k923-shown\">'+(z920a()?'顯示 '+shown.length+' 組':'showing '+shown.length)+'</em>'):'')+'</h2>'",
   "      +(rest>0?('<em class=\"k923-shown\">'+(z920a()?'顯示 '+shown.length+' 組':'showing '+shown.length)+'</em>'):'')\n"
   "      +(shown.length?('<span class=\"k22-aucall\"><button type=\"button\" onclick=\"kgmAucColAllR1022A(\\''+key+'\\',0)\">'+(z920a()?'＋ 全部展開':'＋ Expand all')+'</button><button type=\"button\" onclick=\"kgmAucColAllR1022A(\\''+key+'\\',1)\">'+(z920a()?'－ 全部收起':'－ Collapse all')+'</button></span>'):'')+'</h2>'")
RC('auc grp toggle','kgm-0823h-r61',
   "  function grpCard(list,settle){\n    var f=list[0];\n    return '<article class=\"k920-grp\"><h3><span>'+aucStat1004B(list)",
   "  /* 1022A：每一組可以收起（只留標題列）；狀態記在 S._aucColR1022A（只在這次開頁有效） */\n"
   "  window.kgmAucColR1022A=function(k){S._aucColR1022A=S._aucColR1022A||{};S._aucColR1022A[k]=!S._aucColR1022A[k];try{render()}catch(_){}};\n"
   "  window.kgmAucColAllR1022A=function(col,on){S._aucColR1022A=S._aucColR1022A||{};document.querySelectorAll('#app .k920-grp[data-k22]').forEach(function(el){var k=el.getAttribute('data-k22');if(k.indexOf(col+'#')===0)S._aucColR1022A[k]=!!on});try{render()}catch(_){}};\n"
   "  function grpCard(list,settle,gk){\n    var f=list[0],col=!!(S._aucColR1022A||{})[gk];\n"
   "    return '<article class=\"k920-grp'+(col?' k22c':'')+'\" data-k22=\"'+e920(gk||'')+'\"><h3><span><button type=\"button\" class=\"k22-agt\" title=\"'+(col?(z920a()?'展開':'Expand'):(z920a()?'收起':'Collapse'))+'\" onclick=\"kgmAucColR1022A(this.closest(\\'.k920-grp\\').getAttribute(\\'data-k22\\'))\">'+(col?'+':'−')+'</button>'+aucStat1004B(list)")

# ══ 主管紀錄：使用者「主管紀錄飛航是要可以搜尋日期選擇航班的 然後主管名冊好亂喔」——
#    ① 機師晉升考核（飛航）：先選航班日期、可打班號，列出那天有機師的航班（帶飛／航線訓練的排前面），點一班 → 教官、受考人只列那一班上的機師，紀錄寫上航班
#    ② 主管名冊：某一級在篩選後 0 位 → 只留一行（不再一大塊「沒有符合的主管」）；每一級可收合（超過 15 位預設收起）；
#       全部是非地勤的那一級，「站／時段」「組員」兩欄（地勤才有）不顯示 ══
RC('mgr pilot flight','kgm-0909E-r229',
   "    function pilotSec12(){var m=st12(),pl=(S.staff||[]).filter(function(s){return s&&s.role==='pilot'&&s.active!==false});\n      var lvOf=function(id){try{return window.kgmCrewLevelOfR1009B(id,'9999-12-31')}catch(_){return null}};\n      var ins=pl.filter(function(s){var l=lvOf(s.empId);return l&&(l.tri||l.rank==='TRI')}),cand=pl.filter(function(s){var l=lvOf(s.empId);return l&&(l.rank==='FO'||(l.rank==='CP'&&!l.tri))});",
   "    /* 1022A：考核要掛在一班航班上 —— 選日期、打班號，從組員計畫列出那天有機師的航班（航線訓練的排前面） */\n"
   "    window.kgmMgrPFltR1022A=function(k){S._mgrPFltR1022A=S._mgrPFltR1022A===k?'':k;try{render()}catch(_){}};\n"
   "    function pFlt22(){\n"
   "      var d=S._mgrPDateR1022A||T12(),q=String(S._mgrPQR1022A||'').trim().toUpperCase(),sel=S._mgrPFltR1022A||'',ready=true;\n"
   "      try{ready=!window.kgmCrewHasDayR121||window.kgmCrewHasDayR121(d)}catch(_){}\n"
   "      var head='<div class=\"k12m-form k22p-f\"><label>'+(z12()?'航班日期':'Flight date')+'<input type=\"date\" class=\"inp\" value=\"'+E12(d)+'\" onchange=\"S._mgrPDateR1022A=this.value;S._mgrPFltR1022A=\\'\\';render()\"></label>'\n"
   "        +'<label style=\"flex:1;min-width:200px\">'+(z12()?'班號':'Flight no.')+'<input class=\"inp\" placeholder=\"'+(z12()?'例：KX18（留白＝這一天全部）':'e.g. KX18')+'\" value=\"'+E12(q)+'\" onkeydown=\"if(event.key===\\'Enter\\'){S._mgrPQR1022A=this.value;render()}\" onchange=\"S._mgrPQR1022A=this.value;render()\"></label></div>';\n"
   "      if(!ready)return {html:head+'<div class=\"k12m-empty\">'+(z12()?'這一天的組員計畫還沒算好。':'Crew plan for this day is not ready.')+' <button class=\"btn btn-sm\" onclick=\"try{kgmCrewPlanR121(\\''+E12(d)+'\\')}catch(_){};render()\">'+(z12()?'整理這一天（約數秒）':'Prepare this day')+'</button></div>',f:null,d:d};\n"
   "      var P=null;try{P=window.kgmCrewPlanR121(d)}catch(_){}\n"
   "      var fl=((P&&P.flights)||[]).filter(function(f){return f&&(f.pilots||[]).length&&(!q||String(f.code).toUpperCase().indexOf(q)>=0)});\n"
   "      fl.sort(function(a,b){return (b.trainingR1009A?1:0)-(a.trainingR1009A?1:0)||String(a.dep||'').localeCompare(String(b.dep||''))||String(a.code).localeCompare(String(b.code),undefined,{numeric:true})});\n"
   "      var key=function(f){return [f.code,f.fr,f.to].join('|')},cur=fl.filter(function(f){return key(f)===sel})[0]||null,nTr=fl.filter(function(f){return f.trainingR1009A}).length;\n"
   "      var cards=fl.length?('<div class=\"k22p-list\">'+(cur?[cur]:fl.slice(0,48)).map(function(f){var on=cur&&key(f)===key(cur);\n"
   "          return '<button type=\"button\" class=\"k22p-c'+(on?' on':'')+'\" onclick=\"kgmMgrPFltR1022A(\\''+E12(key(f))+'\\')\"><b>'+E12(f.code)+'</b><span>'+E12(f.fr)+' → '+E12(f.to)+'</span><small>'+E12(f.dep||'')+(f.type?' · '+E12(f.type):'')+' · '+(z12()?'機師 ':'pilots ')+(f.pilots||[]).length+'</small>'+(f.trainingR1009A?'<em>'+(z12()?'航線訓練':'Line training')+'</em>':'')+'</button>'}).join('')+(cur?'<button type=\"button\" class=\"btn btn-sm\" style=\"align-self:center\" onclick=\"kgmMgrPFltR1022A(\\''+E12(key(cur))+'\\')\">'+(z12()?'改選其他航班':'Pick another flight')+'</button>':'')+'</div>'\n"
   "          +(!cur&&fl.length>48?'<p class=\"k12m-note\">'+(z12()?'只列前 48 班，請輸入班號縮小範圍。':'First 48 shown.')+'</p>':''))\n"
   "        :'<div class=\"k12m-empty\">'+(z12()?(q?'這一天沒有 '+E12(q)+' 的機師班表':'這一天沒有機師班表'):'No flights')+'</div>';\n"
   "      return {html:head+'<p class=\"k12m-note\">'+(z12()?(d+' 共 '+fl.length+' 班'+(nTr?'，其中 '+nTr+' 班航線訓練（教官帶飛）':'')+'；點一班，教官與受考人只列那一班上的機師。'):'')+'</p>'+cards,f:cur,d:d};\n"
   "    }\n"
   "    function pilotSec12(){var m=st12(),pl=(S.staff||[]).filter(function(s){return s&&s.role==='pilot'&&s.active!==false});\n      var lvOf=function(id){try{return window.kgmCrewLevelOfR1009B(id,'9999-12-31')}catch(_){return null}};\n      var ins=pl.filter(function(s){var l=lvOf(s.empId);return l&&(l.tri||l.rank==='TRI')}),cand=pl.filter(function(s){var l=lvOf(s.empId);return l&&(l.rank==='FO'||(l.rank==='CP'&&!l.tri))});\n"
   "      var pf=pFlt22();if(pf.f){var on={};(pf.f.pilots||[]).forEach(function(p){if(p&&p.empId)on[p.empId]=1});ins=ins.filter(function(s){return on[s.empId]});cand=cand.filter(function(s){return on[s.empId]})}   /* 1022A */")
RC('mgr pilot form','kgm-0909E-r229',
   "        +'<div class=\"k12m-form\"><label>'+(z12()?'教官':'Instructor')+'<select id=\"k12cIns\" class=\"inp\"><option value=\"\"></option>'+o(ins)+'</select></label>'",
   "        +pf.html+(pf.f?'<div class=\"k22p-sel\">'+(z12()?'考核航班：':'Flight: ')+'<b>'+E12(pf.f.code)+'</b> '+E12(pf.f.fr)+' → '+E12(pf.f.to)+' · '+E12(pf.d)+' · '+(pf.f.pilots||[]).map(function(p){return E12(p.name||p.empId)+'（'+E12(p.posZH||p.posCode||'')+'）'}).join('、')+(ins.length?'':'<span class=\"k12m-sub\">'+(z12()?'　這一班沒有教官資格的機師':'　no instructor on this flight')+'</span>')+'</div>':'')\n"
   "        +'<input type=\"hidden\" id=\"k12cFlt\" value=\"'+(pf.f?E12(pf.f.code+' '+pf.f.fr+'→'+pf.f.to):'')+'\">'\n"
   "        +'<div class=\"k12m-form\"><label>'+(z12()?'教官':'Instructor')+'<select id=\"k12cIns\" class=\"inp\"><option value=\"\"></option>'+o(ins)+'</select></label>'")
RC('mgr pilot date default','kgm-0909E-r229',
   "+'<input id=\"k12cDate\" type=\"date\" class=\"inp\" value=\"'+T12()+'\"></label>'",
   "+'<input id=\"k12cDate\" type=\"date\" class=\"inp\" value=\"'+(pf.f?pf.d:T12())+'\"></label>'")
RC('mgr check flight','kgm-0909E-r229',
   "var rec={id:'CK'+Date.now().toString(36).toUpperCase(),date:date,instructor:ins,candidate:cand,from:lv.rank,to:to,result:res,note:note,",
   "var rec={id:'CK'+Date.now().toString(36).toUpperCase(),date:date,flight:g('k12cFlt'),instructor:ins,candidate:cand,from:lv.rank,to:to,result:res,note:note,")
RC('mgr check list flight','kgm-0909E-r229',
   "          +L.map(function(c){return '<tr><td>'+E12(c.date)+'</td>",
   "          +L.map(function(c){return '<tr><td>'+E12(c.date)+(c.flight?'<br><small class=\"k12m-sub\">'+E12(c.flight)+'</small>':'')+'</td>")

RC('mgr list tidy','kgm-0909E-r229','        return \'<div class="k12m-card"><div class="k12m-sec"><h3><span class="k12m-lv l\'+l+\'">\'+LV12[l]+\'</span>\'+rows.length+(z12()?\' 位\':\'\')+\'</h3><small>\'+E12(desc)+\' · NT$\'+N12(ALW12[l])+(z12()?\'／月\':\'/mo\')+\'</small></div>\'\n          +(rows.length?\'<table class="k12m-t">',
   '        /* 1022A：篩選後 0 位 → 只留一行；每一級可收合（超過 15 位、沒在搜尋時預設收起）；整級沒有地勤 → 不顯示地勤才有的兩欄 */\n        var cl22=S._mgrColR1022A||{},col22=cl22[l]!=null?!!cl22[l]:(rows.length>15&&!q),ng22=!rows.some(function(id){return m.managers[id].dept===\'ground\'});\n        if(!rows.length)return \'<div class="k22-lvrow"><span class="k12m-lv l\'+l+\'">\'+LV12[l]+\'</span><b>0\'+(z12()?\' 位\':\'\')+\'</b><small>\'+E12(desc)+\' · NT$\'+N12(ALW12[l])+(z12()?\'／月\':\'/mo\')+\'</small></div>\';\n        return \'<div class="k12m-card\'+(col22?\' k22c\':\'\')+(ng22?\' k22-ng\':\'\')+\'"><div class="k12m-sec"><h3><button type="button" class="k22-agt" title="\'+(col22?\'展開\':\'收起\')+\'" onclick="S._mgrColR1022A=S._mgrColR1022A||{};S._mgrColR1022A[\'+l+\']=\'+(col22?\'false\':\'true\')+\';render()">\'+(col22?\'+\':\'−\')+\'</button><span class="k12m-lv l\'+l+\'">\'+LV12[l]+\'</span>\'+rows.length+(z12()?\' 位\':\'\')+\'</h3><small>\'+E12(desc)+\' · NT$\'+N12(ALW12[l])+(z12()?\'／月\':\'/mo\')+\'</small></div>\'\n          +(col22?\'\':rows.length?\'<table class="k12m-t">')

# ══ 請假：使用者「請假系統要可以選擇請假區段，可選特定日期的特定時間到特定時間（若無就要選全天）」——
#    請假區段：全天（照舊，可跨多天）／指定時段（一天內的開始～結束時間，以 8 小時＝1 天折算）。紀錄存 part:{from,to,hours}；
#    組員核准後的重排仍以「那一天」為單位（該日不派飛），地勤也是 ══
RW('leave days part','  var days=Math.round((new Date(end+"T00:00:00")-new Date(start+"T00:00:00"))/864e5)+1;\n  if(!reason){alert("請填寫事由（必填）");return;}',
   '  var days=Math.round((new Date(end+"T00:00:00")-new Date(start+"T00:00:00"))/864e5)+1;\n'
   '  /* 1022A：指定時段（一天內）—— 開始／結束時間必填、結束要晚於開始；以 8 小時＝1 天折算（最少 0.5 天） */\n'
   '  var part=null;if(S._lvPart==="part"){var t1=String(S._lvT1||""),t2=String(S._lvT2||"");if(!/^\\d{2}:\\d{2}$/.test(t1)||!/^\\d{2}:\\d{2}$/.test(t2)){alert("請選擇請假的開始與結束時間；整天請假請選「全天」");return;}\n'
   '    var mm=function(t){var a=t.split(":");return (+a[0])*60+(+a[1])},hrs=(mm(t2)-mm(t1))/60;if(!(hrs>0)){alert("結束時間要晚於開始時間");return;}end=start;part={from:t1,to:t2,hours:Math.round(hrs*10)/10};days=Math.max(0.5,Math.round(hrs/8*2)/2);}\n'
   '  if(!reason){alert("請填寫事由（必填）");return;}')
RW('leave rec part','    proxy:S._lvProxy||"",photos:((window.__lvDraft928||{}).photos||[]).slice()});',
   '    proxy:S._lvProxy||"",photos:((window.__lvDraft928||{}).photos||[]).slice(),part:part});   /* 1022A：part＝指定時段 */')
RW('leave notify part','  notifyStaff(empId,"【"+caseNo+"】您的"+(LEAVE_ZH[type]||type)+"申請（"+start+"~"+end+"，"+days+"天）已送出，待 CEO 審核。");',
   '  var span22=part?(start+" "+part.from+"–"+part.to+"，"+part.hours+" 小時"):(start+"~"+end+"，"+days+"天");\n'
   '  notifyStaff(empId,"【"+caseNo+"】您的"+(LEAVE_ZH[type]||type)+"申請（"+span22+"）已送出，待 CEO 審核。");')
RW('leave form part',"        +'<label>'+(Z()?'開始日期':'From')+'<input type=\"date\" class=\"inp\" value=\"'+E(S._lvStart||todayISO())+'\" onchange=\"S._lvStart=this.value;render()\"></label>'\n        +'<label>'+(Z()?'結束日期':'To')+'<input type=\"date\" class=\"inp\" value=\"'+E(S._lvEnd||S._lvStart||todayISO())+'\" onchange=\"S._lvEnd=this.value;render()\"></label>'\n        +'<label>'+(Z()?'天數':'Days')+'<input class=\"inp\" value=\"'+(n>0?n+(Z()?' 天':' days'):(Z()?'日期有誤':'Invalid'))+'\" disabled></label>'",
   "        /* 1022A：請假區段 —— 全天（可跨天）或指定時段（一天內的開始～結束時間） */\n"
   "        +'<label>'+(Z()?'請假區段':'Period')+'<select class=\"inp\" onchange=\"S._lvPart=this.value;render()\"><option value=\"full\"'+(S._lvPart!=='part'?' selected':'')+'>'+(Z()?'全天':'Full day(s)')+'</option><option value=\"part\"'+(S._lvPart==='part'?' selected':'')+'>'+(Z()?'指定時段（一天內）':'Hours within one day')+'</option></select></label>'\n"
   "        +(S._lvPart==='part'\n"
   "          ?('<label>'+(Z()?'日期':'Date')+'<input type=\"date\" class=\"inp\" value=\"'+E(S._lvStart||todayISO())+'\" onchange=\"S._lvStart=this.value;S._lvEnd=this.value;render()\"></label>'\n"
   "            +'<div class=\"k22-lvt\"><label>'+(Z()?'開始時間':'From')+'<input type=\"time\" class=\"inp\" step=\"900\" value=\"'+E(S._lvT1||'')+'\" onchange=\"S._lvT1=this.value;render()\"></label><label>'+(Z()?'結束時間':'To')+'<input type=\"time\" class=\"inp\" step=\"900\" value=\"'+E(S._lvT2||'')+'\" onchange=\"S._lvT2=this.value;render()\"></label></div>'\n"
   "            +'<label>'+(Z()?'時數':'Hours')+'<input class=\"inp\" value=\"'+(function(){var a=String(S._lvT1||''),b=String(S._lvT2||'');if(!/^\\d{2}:\\d{2}$/.test(a)||!/^\\d{2}:\\d{2}$/.test(b))return Z()?'請選開始與結束時間':'Pick both times';var h=((+b.slice(0,2))*60+(+b.slice(3))-(+a.slice(0,2))*60-(+a.slice(3)))/60;return h>0?(Math.round(h*10)/10+(Z()?' 小時（折 ':' h (')+Math.max(0.5,Math.round(h/8*2)/2)+(Z()?' 天）':' day)')):(Z()?'結束要晚於開始':'End must be after start')})()+'\" disabled></label>')\n"
   "          :('<label>'+(Z()?'開始日期':'From')+'<input type=\"date\" class=\"inp\" value=\"'+E(S._lvStart||todayISO())+'\" onchange=\"S._lvStart=this.value;render()\"></label>'\n"
   "            +'<label>'+(Z()?'結束日期':'To')+'<input type=\"date\" class=\"inp\" value=\"'+E(S._lvEnd||S._lvStart||todayISO())+'\" onchange=\"S._lvEnd=this.value;render()\"></label>'\n"
   "            +'<label>'+(Z()?'天數':'Days')+'<input class=\"inp\" value=\"'+(n>0?n+(Z()?' 天':' days'):(Z()?'日期有誤':'Invalid'))+'\" disabled></label>'))")
RW('leave list part',"    window.kgmLeavePhotosR928=function(i){var l=(S.leave||[])[i];if(!l)return '';var ph=l.photos||[];\n      return (l.proxy?",
   "    window.kgmLeavePhotosR928=function(i){var l=(S.leave||[])[i];if(!l)return '';var ph=l.photos||[];\n"
   "      return (l.part?'<div style=\"font-size:11.5px;color:#0b493b;margin-top:5px\">'+(Z()?'請假時段：':'Hours: ')+'<b>'+E(l.start)+' '+E(l.part.from)+'–'+E(l.part.to)+'</b>（'+E(l.part.hours)+(Z()?' 小時）':' h)')+'</div>':'')   /* 1022A */\n"
   "        +(l.proxy?")

# ══ 後台 AI 換班：使用者「K10732想把12-07的KX77換到12-08其他BKK-TPE航班，他不能找同一個飛過去的換班要找其他的（最好）」——
#    對方如果跟申請人是同一班飛過去的（同一天同一班），兩人整段互換等於沒換 → 排序時排到後面（真的只有這種才列出來）；多評估幾位以找到別人 ══
RC('swap more cands','kgm-0909E-r229',"for(var i=0;i<C18.length&&ok.length<8&&i<60;i++){var c=C18[i];",
   "for(var i=0;i<C18.length&&ok.length<12&&i<90;i++){var c=C18[i];   /* 1022A：多評估幾位（同一班飛過去的會排到後面，要留得到別人） */")
RC('swap same flag','kgm-0909E-r229',"c.tc=tc;c.gx=e1;c.gy=e2;c.n=e1.give.length+e2.give.length;ok.push(c)}",
   "c.tc=tc;c.gx=e1;c.gy=e2;c.n=e1.give.length+e2.give.length;c.same=tc.some(function(l){return tx.some(function(m2){return m2.d===l.d&&m2.f.code===l.f.code&&m2.f.fr===l.f.fr})})?1:0;ok.push(c)}",2)
RC('swap sort opt','kgm-0909E-r229',"ok.sort(function(a,b){return (a.v||0)-(b.v||0)||(reqD.indexOf(a.td)<0)-(reqD.indexOf(b.td)<0)||a.n-b.n});return ok.slice(0,3)};",
   "ok.sort(function(a,b){return (a.v||0)-(b.v||0)||(a.same||0)-(b.same||0)||(reqD.indexOf(a.td)<0)-(reqD.indexOf(b.td)<0)||a.n-b.n});return ok.slice(0,3)};   /* 1022A：同一班飛過去的排後面 */")
RC('swap sort gen','kgm-0909E-r229',"    ok.sort(function(a,b){return (a.v||0)-(b.v||0)||a.n-b.n});ok=ok.slice(0,3);",
   "    ok.sort(function(a,b){return (a.v||0)-(b.v||0)||(a.same||0)-(b.same||0)||a.n-b.n});ok=ok.slice(0,3);   /* 1022A */")
RC('swap gen cap','kgm-0909E-r229',"if(ok.length>=8||tried6++>40)break;","if(ok.length>=12||tried6++>60)break;")

# ══ 定位管理：使用者「後台訂購日期要寫的是根據當地IP位置時間喔然後要寫清楚是哪裡 系統要自動偵測」——
#    訂購日改成「訂購地當地時間＋地點＋時區」（k22 kgmBookedWhereR1022A）；原本直接印 ISO 字串（UTC） ══
RW('booked local',"+'</b></div><div><small>'+(ZJ()?'訂購日':'Booked')+'</small><b>'+EJ(b.bookedAt||b.createdAt||'—')+'</b></div>",
   "+'</b></div><div><small>'+(ZJ()?'訂購時間（訂購地當地）':'Booked (local time)')+'</small><b>'+(window.kgmBookedWhereR1022A?window.kgmBookedWhereR1022A(b):EJ(b.bookedAt||b.createdAt||'—'))+'</b></div>")

# ══ 旅客自助改票總開關（定位管理）：存檔＋前後台同步（r229 只認 save() 裡 LS.set 的寫法）══════
RW('selfchg init','crewFreezeR928:LS.get("kgm12_crewfrz",{}),',
   'crewFreezeR928:LS.get("kgm12_crewfrz",{}),selfChgR1022A:LS.get("kgm22_selfchg",null),')
RW('selfchg save','LS.set("kgm12_crewfrz",S.crewFreezeR928',
   'LS.set("kgm22_selfchg",S.selfChgR1022A||null);LS.set("kgm12_crewfrz",S.crewFreezeR928')

# ══ 手機：頁尾下面那條白色空白 —— #app 的 padding-bottom（讓出下排五鈕）落在深色頁尾「下面」；
#    有頁尾的頁面改成把那段高度加在頁尾裡面（頁尾的深色一路延伸到下排五鈕後面），沒有頁尾的頁面照舊 ══
RW('mb footer gap',"    +F+'#app{padding-bottom:calc(66px + env(safe-area-inset-bottom))}'",
   "    +F+'#app{padding-bottom:calc(66px + env(safe-area-inset-bottom))}'\n"
   "    +F+'#app:has(>footer){padding-bottom:0}'+F+'#app>footer::after{content:\"\";display:block;height:calc(66px + env(safe-area-inset-bottom))}'   /* 1022A：頁尾下面不留白 */")

# ══ k22：中停票價低於直飛、改票總開關、航班資料（組員／地勤只看自己 7 天）、區塊 +/−（r229 最後，fl20b 之後）══
RW('k22 embed',JS('fl20b.js'),JS('fl20b.js')+JS('k22.js'))

open('p_h_r22.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
