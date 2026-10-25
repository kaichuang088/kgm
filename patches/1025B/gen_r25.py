from common import *
import json
# ══ 1025B ═══════════════════════════════════════════════════════════════
#   使用者（1025A 交付後）訊息，逐條見 notes/1025B-pass127-notes.md。
#   比對基準：1025A 最終版 w43（/tmp/j/kgm1025A_w43.html，patches/1023A/build.sh 重建）。
CUR=open('/tmp/j/kgm1025A_w43.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ F：後台按「信用卡驗證」倒回前台 —— 1025A 把卡別表 NET22 換成只有 KGM Cards，瀏覽器裡存著 1022A 產生的舊卡（visa／mc／jcb／amex／cup）
#    → NET22[c.net] 是 undefined → 頁面畫到一半丟錯 → 被丟回首頁。舊卡別只留顯示名稱（不可列舉，不會出現在綁定選單）；
#    1022A 的舊「模擬」卡清掉讓系統重新產生 KGM Cards 模擬資料；會員自己綁的舊卡保留，標「舊卡別」。══
RW('card legacy nets',"var NET22={stark:['KGM Star K',['Visa Signature']],starg:['KGM Star G',['Mastercard World Elite']],starm:['KGM Star M',['Visa Infinite']]};",
   "var NET22={stark:['KGM Star K',['Visa Signature']],starg:['KGM Star G',['Mastercard World Elite']],starm:['KGM Star M',['Visa Infinite']]};\n"
   "  /* 1025B：舊卡別（1022A 綁定的）只留顯示名稱，不可列舉 → 不會出現在綁定選單；沒見過的卡別也給一個名稱，頁面不會因為一筆舊資料整頁壞掉 */\n"
   "  [['visa','Visa'],['mc','Mastercard'],['jcb','JCB'],['amex','American Express'],['cup','UnionPay']].forEach(function(o){try{Object.defineProperty(NET22,o[0],{value:[o[1]+(LANG==='en'?' (legacy, not a KGM Card)':'（舊卡別・不符合現行綁定規定）'),['']],enumerable:false})}catch(_){}});\n"
   "  try{S.cardBindR1022A=(S.cardBindR1022A||[]).filter(function(c){return !(c&&c.simR1022A&&!/^star[kgm]$/.test(c.net))})}catch(_){}\n"
   "  try{(S.cardBindR1022A||[]).forEach(function(c){if(c&&!NET22[c.net])Object.defineProperty(NET22,c.net,{value:[String(c.net||'?').toUpperCase(),['']],enumerable:false,configurable:true})})}catch(_){}")

# ══ B：後台 AI 取消航班（整組輪轉含回程、長程可排除、旅客數含模擬訂位、否定句不再被當成新指令）══
_k23=open('../1023A/js/k23.js',encoding='utf-8').read()
_a=_k23.index("  /* ── ① 取消航班 ── */\n  function findFlights(t){");_b=_k23.index("  function reasonOf(t){",_a)
RW('cx find/start',_k23[_a:_b],JS('cx25.js'))
RW('cx step head',"  function step(t){\n    var P=S.adminAiPendR1023A;if(!P||P.kind!=='cancel')return null;\n    if(Date.now()-P.at>30*60000){S.adminAiPendR1023A=null;return null}\n    if(/^(算了|不要了|放棄|取消對話|cancel|abort)$/i.test(t.trim())){S.adminAiPendR1023A=null;return '好，已放棄，這 '+P.list.length+' 班沒有動。'}\n    P.at=Date.now();\n",
   "  async function step(t){\n    var P=S.adminAiPendR1023A;if(!P||P.kind!=='cancel')return null;\n    if(Date.now()-P.at>30*60000){S.adminAiPendR1023A=null;return null}\n    if(/^(算了|不要了|放棄|取消對話|cancel|abort)$/i.test(t.trim())){S.adminAiPendR1023A=null;return '好，已放棄，這 '+P.list.length+' 班沒有動。'}\n    P.at=Date.now();\n"
   "    /* 1025B：範圍（長程／外站）在任何一步都可以改：重新列出，已回答的原因與補償方案保留 */\n"
   "    var sc2=scopeIn(t,P.sc);\n"
   "    if(P.step==='scope'&&sc2.long==null)return /回程/.test(t)?'回程本來就一起取消（每一組都含同一架飛機的回程／後段）。長程要一起取消嗎？回答「長程不取消」或「長程也取消」。':'請回答「長程不取消」或「長程也取消」（說「算了」放棄）。';\n"
   "    if(P.step==='scope'||sc2.long!==P.sc.long||!!sc2.away!==!!P.sc.away){\n"
   "      var rs={},cp=P.comp,st0=P.step;P.list.forEach(function(x){if(x.reason)rs[x.code]=x.reason});\n"
   "      var msg=await start(P.text,sc2),P2=S.adminAiPendR1023A;if(!P2||P2.kind!=='cancel'||!P2.list.length)return msg;\n"
   "      var hasR=Object.keys(rs).length,r0=hasR?rs[Object.keys(rs)[0]]:'';P2.list.forEach(function(x){if(hasR)x.reason=rs[x.code]||r0});\n"
   "      if(st0==='comp'&&hasR){P2.step='comp';return msg.replace(Q_REASON,'')+'\\n\\n（原因沿用剛才的回答）請回答補償方案：1 退費、2 改搭下一班，可以再加「里程 3000」「餐券」。'}\n"
   "      if(st0==='confirm'&&cp){P2.step='confirm';P2.comp=cp;var s3=sum25(P2.list);return msg.replace(Q_REASON,'')+'\\n\\n（原因與補償方案沿用剛才的回答）請確認：取消 '+P2.list.length+' 班，'+(cp.mode==='refund'?'退這一段實付票價＋附加服務':'改搭同航線下一班')+'；受影響旅客約 '+s3.px.toLocaleString()+' 人、通知線上訂位 '+s3.bk.toLocaleString()+' 筆。回覆「確認」執行，或「算了」放棄。'}\n"
   "      return msg}\n"
   "    var on2=scopeIn(t,{});if((on2.long!=null||on2.away!=null)&&!/天氣|颱風|機械|航管|營運|罷工|疫情|退費|改搭|確認|^\\s*[12](\\D|$)/.test(t))return '範圍沒有變：'+(P.sc.long==='ex'?'長程不取消':(P.sc.long==='in'?'長程一起取消':'沒有長程'))+'、'+(P.sc.away?'外站飛回基地的也取消':'外站飛回基地的照飛')+'，清單不變。'+(P.step==='reason'?Q_REASON:(P.step==='comp'?'\\n\\n請回答補償方案：1 退費、2 改搭下一班，可以再加「里程 3000」「餐券」。':'\\n\\n回覆「確認」執行，或「算了」放棄。'));\n"
   "    if(/回程/.test(t)&&/取消/.test(t)&&P.step==='reason'&&!/天氣|颱風|機械|航管|營運|罷工|疫情/.test(t))return '回程本來就一起取消（每一組都含同一架飛機的回程／後段，已列在清單）。'+Q_REASON;\n")
RW('cx confirm msg',"        +'；系統會通知 '+nb+' 筆訂位、同步航班動態與飛機排班。\\n回覆「確認」執行，或",
   "        +'；受影響旅客約 '+sum25(P.list).px.toLocaleString()+' 人，系統會通知線上訂位 '+nb+' 筆、同步航班動態與飛機排班。\\n回覆「確認」執行，或")
RW('cx done msg',"    return '✓ 已取消 '+done+' 班（'+P.date+'），通知 '+nb+' 筆訂位；",
   "    return '✓ 已取消 '+done+' 班（'+P.date+' 起，含回程／後段），受影響旅客約 '+sum25(P.list).px.toLocaleString()+' 人，通知線上訂位 '+nb+' 筆；")
RW('cx tool async',"  window.kgmAiCancelR1023A=function(a){a=a||{};var t=String(a.text||'')||[a.date||'',a.after?a.after+'以後':'',a.station||'',(a.codes||[]).join(' ')].join(' ');\n    if(!S.adminAiPendR1023A||S.adminAiPendR1023A.kind!=='cancel')return {ok:true,msg:start(t)};var r=step(t);return {ok:true,msg:r||''}};",
   "  window.kgmAiCancelR1023A=async function(a){a=a||{};var t=String(a.text||'')||[a.date||'',a.after?a.after+'以後':'',a.station||'',(a.codes||[]).join(' ')].join(' ');\n    if(!S.adminAiPendR1023A||S.adminAiPendR1023A.kind!=='cancel'||(isCancel(t)&&target25(t)))return {ok:true,msg:await start(t)};var r=await step(t);return {ok:true,msg:r||''}};   /* 1025B：非同步（旅客數分批算） */")
RW('cx isCancel neg',"  function isCancel(t){return /取消/.test(t)&&",
   "  function isCancel(t){if(/(不|別|不要|不用|免)取消|照飛|保留|也要?取消|也取消|一起取消/.test(t)&&!/\\d{1,2}\\s*[\\/月]\\s*\\d{1,2}|今天|今日|明天|後天/.test(t))return false;   /* 1025B：「長程不取消」「回程也要取消」是對目前流程的補充，不是新指令 */\n    return /取消/.test(t)&&")
RW('cx hook await',"if(S.adminAiPendR1023A&&isCancel(t)){S.adminAiPendR1023A=null;r=start(t)}","if(S.adminAiPendR1023A&&isCancel(t)&&target25(t)){S.adminAiPendR1023A=null;r=await start(t)}")
RW('cx hook await2',"if(!r&&S.adminAiPendR1023A)r=step(t);if(!r&&isCancel(t))r=start(t);if(!r)r=q(t)}","if(!r&&S.adminAiPendR1023A)r=await step(t);if(!r&&isCancel(t))r=await start(t);if(!r)r=q(t)}")

# ══ H①：組員班表每台電腦都一樣 —— 實測兩個全新瀏覽器前 10 天 3,157 班有 455 班派的人不同。
#    根因：重名修正拿「隨機產生的模擬員工」（地勤、行政，名字與編號是 Math.random）來比，哪位組員撞名被改名每台不同，
#    名字決定國籍（日韓姓氏）、國籍影響排班 → 分岔。改成：重名時模擬員工讓位（組員保留依編號產生的名字），
#    虛擬組員避開的名單也不含模擬員工；舊瀏覽器裡被這樣改掉的組員名字還原（只還原「現在的名字＝系統產生的改名」的人，手動改過的不動）。══
RC('name set no sim','kgm-0903b-r121',"function staffNameSet12(){var o={};(S.staff||[]).forEach(function(s){if(s&&s.name)o[String(s.name).trim().toUpperCase()]=1});return o}",
   "function staffNameSet12(){var o={};(S.staff||[]).forEach(function(s){if(s&&s.name&&!s.simulated)o[String(s.name).trim().toUpperCase()]=1});return o}   /* 1025B：隨機模擬員工不算（不然每台電腦虛擬組員的名字不同） */")
RC('name fix prio','kgm-0903b-r121',"function fixStaffNames12(){try{if(S.nameFixR1012A&&S.nameFixR1012A.len===(S.staff||[]).length)return;var seen={},ren={};\n    (S.staff||[]).slice().sort(function(a,b){return String(a.empId).localeCompare(String(b.empId))}).forEach(function(s){",
   "function fixStaffNames12(){try{if(S.nameFixR1012A&&S.nameFixR1012A.len===(S.staff||[]).length&&S.nameFixR1012A.v25)return;var seen={},ren={};\n"
   "    /* 1025B：舊版拿隨機模擬員工比重名，被改掉名字的正式員工先還原（現在的名字必須是系統產生的改名，手動改過的不動） */\n"
   "    if(!(S.nameFixR1012A&&S.nameFixR1012A.v25))(S.staff||[]).forEach(function(s){if(!s||s.simulated||!s.nameWasR1012A)return;var auto=false;for(var k=0;k<12&&!auto;k++)if(s.name===cap12(nameOf12(s.empId,k)))auto=true;if(auto){ren[s.empId]={was:s.name,now:s.nameWasR1012A};s.name=s.nameWasR1012A;delete s.nameWasR1012A}});\n"
   "    (S.staff||[]).slice().sort(function(a,b){return ((a&&a.simulated)?1:0)-((b&&b.simulated)?1:0)||String(a.empId).localeCompare(String(b.empId))}).forEach(function(s){   /* 1025B：撞名時隨機模擬員工讓位 */")
RC('name fix v25','kgm-0903b-r121',"    S.nameFixR1012A={at:new Date().toISOString(),n:Object.keys(ren).length,len:(S.staff||[]).length};",
   "    S.nameFixR1012A={at:new Date().toISOString(),n:Object.keys(ren).length,len:(S.staff||[]).length,v25:1};")
RC('virt names v25','kgm-0903b-r121',"if(!ex.n12R1012A){uniq12(ex.list);ex.n12R1012A=1;try{save()}catch(_){}}","if(!ex.n12R1012A||ex.n12R1025B!==1||(ex.pre25&&window.KGM_FULLDONE_1006A)){uniq12(ex.list);ex.n12R1012A=1;ex.n12R1025B=1;ex.pre25=!window.KGM_FULLDONE_1006A;try{save()}catch(_){}}   /* 1025B：機隊排完前取的名字（當時名冊不完整）排完後重取 */")
RC('virt names v25b','kgm-0903b-r121',"uniq12(list);S.crewExtraR121={pilot:want.pilot,cabin:want.cabin,list:list,n12R1012A:1};","uniq12(list);S.crewExtraR121={pilot:want.pilot,cabin:want.cabin,list:list,n12R1012A:1,n12R1025B:1,pre25:!window.KGM_FULLDONE_1006A};")

# ══ H②：開頁後背景先算＋算好的班表存 IndexedDB，同一天輸入沒變直接讀回（js/cw25.js，放在 r121 裡才看得到引擎狀態）══
RC('crew warm idb','kgm-0903b-r121',"window.kgmCrewWarmProgressR923=function(){return CURSOR121||''};","window.kgmCrewWarmProgressR923=function(){return CURSOR121||''};"+JS('cw25.js'))

# ══ H③：組員需求人數（決定虛擬組員有幾位）原本用「第一次被呼叫當下」的飛機排班算、之後永不重算；
#    機隊整年重排還沒做完就被叫到（例如很早點開組員相關頁面），人數就不同 → 每台電腦組員庫不同。改成機隊排完才定下來，之前只算不留（5 秒內重用）。══
RC('demand after full','kgm-0903b-r121',"  if(demand121.cache)return demand121.cache;","  if(demand121.cache&&(demand121.full||Date.now()-demand121.at<5000))return demand121.cache;   /* 1025B：機隊整年排完才定下來 */")
RC('demand after full2','kgm-0903b-r121',"  return demand121.cache=out;","  demand121.full=!!window.KGM_FULLDONE_1006A;demand121.at=Date.now();\n  return demand121.cache=out;")

# ══ H④：機隊整年重排做完之前就算出來的組員班表（例如很早就點開組員班表），機隊排完一律作廢重算 ——
#    原本只比「航段數量」，數量一樣就沿用用舊機隊算的結果 → 每台電腦不同。══
RC('crew pre wipe','kgm-0903b-r121',"  if(SOURCE121!==S.tailAssign)_wipe121=true;","  if(SOURCE121!==S.tailAssign)_wipe121=true;\n  if(window.KGM_CREW_PRE_R1025B&&window.KGM_FULLDONE_1006A){window.KGM_CREW_PRE_R1025B=false;_wipe121=true;try{OW22={};OWD22='';OX22={};BLK121={};FL121={};POOL121=null;NAT22={};demand121.cache=null}catch(_){}}   /* 1025B：連同依日期快取的外站接續班、航段時間、航班清單、組員庫一起清 */")
RC('crew pre mark','kgm-0903b-r121',"function buildDay121(date){\n  if(MEM121[date])return MEM121[date];","function buildDay121(date){\n  if(MEM121[date])return MEM121[date];\n  if(!window.KGM_FULLDONE_1006A)window.KGM_CREW_PRE_R1025B=true;   /* 1025B：機隊還沒排完就算的 → 排完後作廢 */")

# ══ H⑤：正式組員職級在「第一次建組員庫」時固定存檔（S.crewRankR1009B），那一刻庫裡有哪些人（泰籍是否已加入、機型族平衡）看開頁時機
#    → 14 位組員固定下來的職級每台不同。改成機隊整年排完、組員庫完整後才固定；已經存了舊職級的瀏覽器重設一次。══
RC('rank fix after full','kgm-0903b-r121',"(function(){var RS9=S.crewRankR1009B=S.crewRankR1009B||{},st9={},n9=0;",
   "(function(){try{if(window.KGM_FULLDONE_1006A&&localStorage.getItem('kgm25_rk')!=='1'){S.crewRankR1009B={};localStorage.setItem('kgm25_rk','1')}}catch(_){}   /* 1025B：舊的固定職級是開頁時機決定的 → 重設一次 */\n    var RS9=S.crewRankR1009B=S.crewRankR1009B||{},st9={},n9=0;")
RC('rank fix after full2','kgm-0903b-r121',"if(r){if(r!==p.rank){p.rank=r;p.rankZH=LVZH1009B[r]||p.rankZH}}else{RS9[p.empId]=p.rank;n9++}});",
   "if(r){if(r!==p.rank){p.rank=r;p.rankZH=LVZH1009B[r]||p.rankZH}}else if(window.KGM_FULLDONE_1006A){RS9[p.empId]=p.rank;n9++}});   /* 1025B：機隊排完才固定 */")

# ══ H⑥：組員班表外層的快取（r196 客艙職位、r210 排班鏈、覆蓋率）都用 r121 的「各機身航段數」指紋；機隊整年排完前後數量可能一樣 → 排完前算的結果沿用。
#    指紋加上「機隊是否已排完」，排完那一刻依指紋的快取全部作廢（游標前的指紋也一樣 → 引擎本身也重算）。══
RC('stamp full','kgm-0903b-r121',"    for(i=0;i<k.length;i++)h=(h*31+((TA[k[i]]||[]).length))|0;\n    return h;","    for(i=0;i<k.length;i++)h=(h*31+((TA[k[i]]||[]).length))|0;\n    return h+(window.KGM_FULLDONE_1006A?'F':'p');   /* 1025B */")
RC('stamp full2','kgm-0903b-r121',"      h=(h*31+c)|0;\n    }\n    return h;","      h=(h*31+c)|0;\n    }\n    return h+(window.KGM_FULLDONE_1006A?'F':'p');   /* 1025B */")

# ══ H⑦：機隊整年重排做完之前，組員排班引擎一律不算（實測提早點開組員班表，即使所有輸入都相同，結果從第 4 天起仍會分岔 —— 有依查詢順序累積的狀態）。
#    之前呼叫只回「準備中」的空班表，組員班表頁顯示進度。══
RC('crew gate plan','kgm-0903b-r121',"window.kgmCrewPlanR121=function(date){\n  date=date||T();",
   "window.kgmCrewPlanR121=function(date){\n  date=date||T();\n  if(!window.KGM_FULLDONE_1006A)return {date:date,sig:'pending',flights:[],standby:[],violations:[],pilotsUsed:0,pendingR1025B:true};   /* 1025B：機隊排完才算 */")
RC('crew gate step','kgm-0903b-r121',"window.kgmCrewStepR121=function(budgetMs,until){","window.kgmCrewStepR121=function(budgetMs,until){\n  if(!window.KGM_FULLDONE_1006A)return;   /* 1025B：機隊排完才算 */")

RC('crew prog label','kgm-0907A-r196',"+'<span>'+READY196+' / '+DAYS196+(z()?' 天':' days')+'</span></div>'",
   "+'<span>'+(window.KGM_FULLDONE_1006A?(READY196+' / '+DAYS196+(z()?' 天':' days')):(z()?'機隊排班中，排完會自動排組員班表（大家看到的是同一份）':'Fleet rotation in progress; crew roster starts automatically'))+'</span></div>'")   # 1025B

# ══ Q：Residence「機型異動（A359）已改派、退款」誤判 —— 1023A 的撤回只處理未來的班；已起飛的（例：KX3 2026-10-20，A388、有 Residence）沒撤回。
#    已起飛的也撤回（退款收回、里程收回、訂位恢復 Residence），機隊排完後自己跑一次。══
RW('res undo past',"if(!r||r.voidR1023A||!b.date||b.date<T0||!hasRes(b))return;","if(!r||r.voidR1023A||!b.date||!hasRes(b))return;   /* 1025B：已起飛的誤判也撤回 */")
RW('res undo past2',"if(!r||!b.date||b.date<T0||!hasRes(b))return;","if(!r||!b.date||!hasRes(b))return;   /* 1025B */")
RW('res undo run',"  window.kgmResUndoR1023A=undo;\n","  window.kgmResUndoR1023A=undo;\n  (function u25(n){if(window.KGM_FULLDONE_1006A){try{undo()}catch(_){}return}if(n<120)setTimeout(function(){u25(n+1)},3000)})(0);   /* 1025B：機隊排完自己跑一次 */\n")

# ══ L：KX5（2026-11-29 起；之前同一班叫 KX3）冬季洛杉磯 00:00 出發 → 00:05（使用者：「KX5晚5分鐘出發不要有00:00這種出發時間」）；
#    季節班表已鎖定的舊紀錄（冬季 00:00）重新寫入；抵達由冬季風向修正自己重算。全網其他班沒有 00:00 出發（dumptt23 六個日期檢查）。══
RW('kx5 0005',"winter:['00:00','05:45',1]","winter:['00:05','05:50',1]",2)
RW('kx5 reseed',"        if(o&&o.userR1012B)return;","        if(o&&o.userR1012B&&!(o.winter&&o.winter.dep==='00:00'))return;   /* 1025B：冬季 00:00 → 00:05 重新寫入 */")

# ══ k25.js：接在 grp23 後面（r229 最後）══
RW('k25 embed',open('../1023A/js/grp23.js',encoding='utf-8').read(),open('../1023A/js/grp23.js',encoding='utf-8').read()+JS('k25.js'))
RC('dh card label','kgm-0907A-r196',"'DH PNR '+E(r.pnr)+(r.last?(z()?(' · '+E(r.last)+' / '+E(r.first||'')):","'DH PNR '+E(r.pnr)+(r.last?(z()?(' · 姓 '+E(r.last)+'　名 '+E(r.first||'')):")

# ══ J：AI 換班「正在找…」→ 網頁無回應：要看的日子（例 12/03～12/04）還沒算好時，planOf 會一口氣同步從游標算到那天（每天約 1 秒，40 天就卡 40 秒）。
#    先一天一天往前算、每天之間讓畫面回應；機隊還沒排完就先等。══
RW('swap warm days',"    for(var w6=-4;w6<=10;w6++){planOf(K.AD(date,w6));await yieldUI()}",
   "    /* 1025B：先一天一天算到要用的最後一天（每天之間讓畫面回應），不要在 planOf 裡一口氣同步算幾十天 */\n"
   "    for(var g25=0;g25<300&&!window.KGM_FULLDONE_1006A;g25++)await new Promise(function(r){setTimeout(r,500)});\n"
   "    var tg25=K.AD(date,10);for(var h25=0;h25<400&&window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(tg25);h25++){try{window.kgmCrewStepR121(1,tg25)}catch(_){break}await new Promise(function(r){setTimeout(r,30)})}\n"
   "    for(var w6=-4;w6<=10;w6++){planOf(K.AD(date,w6));await yieldUI()}")

# ══ M：員工票狀態每班寫 workload（旅客、行李、貨運、燃油、Payload 餘量、卡在座位還是 Payload）══
RC('stx workload','kgm-0816d-r40',"      +'<td class=\"k6ss-f\"><b>'+E(f.code)+'</b><span>'+E(f.fr)+' → '+E(f.to)+'</span><small>'+E(f.dep||'')+' · '+E(ac)+'</small><em>'+E(det)+'</em></td>'",
   "      +'<td class=\"k6ss-f\"><b>'+E(f.code)+'</b><span>'+E(f.fr)+' → '+E(f.to)+'</span><small>'+E(f.dep||'')+' · '+E(ac)+'</small><em>'+E(det)+'</em>'+(window.kgmStxWorkloadR1025B?window.kgmStxWorkloadR1025B(p,f.code,d,f.fr,f.to):'')+'</td>'")   # 1025B

RW('ai tool temp',"    flight_delay:{tab:'status',zh:'航班延誤或改起飛時間","    flight_temp:{tab:'fleetsched',zh:'建立臨時航班（text 放使用者原話，例如「加開 TPE-NRT 11/5」「11/8 臨時航班 台北到首爾 B789 09:30」；第一次呼叫會依距離建議機型並列出三個方案（機身已在出發站、前後勤務排得開），之後把使用者的回答原樣放 text 再呼叫：選 1／2／3、改機型或時間、要不要販售）',run:function(a){return window.kgmAiTempFlightR1025B(a)}},   /* 1025B */\n    flight_delay:{tab:'status',zh:'航班延誤或改起飛時間")

# ══ 結尾 ══
open('p_h_r25.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
