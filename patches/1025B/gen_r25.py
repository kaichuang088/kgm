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
   "window.kgmCrewPlanR121=function(date){\n  date=date||T();\n  if(!window.KGM_FULLDONE_1006A)return {date:date,sig:'pending',flights:[],standby:[],violations:[],pilotsUsed:0,pendingR1025B:true};   /* 1025B：機隊排完才算 */\n"
   "  if(before121(date))return {date:date,sig:'before',flights:[],standby:[],violations:[],pilotsUsed:0,beforeR1025B:true};   /* 1025B：起算日以前（機隊排班沒有資料的日子）—— 回空班表，不要整份倒掉從那天重算 */")
RC('crew before inval','kgm-0903b-r121',"  if(date&&CURSOR121&&date<CURSOR121&&!MEM121[date])_wipe121=true;",
   "  if(date&&CURSOR121&&date<CURSOR121&&!MEM121[date]&&!before121(date))_wipe121=true;   /* 1025B：起算日以前的日子不觸發重算（「給旅客評分」「旅客回饋」會問過去 30 天，原本一打開就把整份組員班表倒掉、從更早的日子重算兩分鐘，起算日一變結果也跟別人不同） */")
RC('crew before fn','kgm-0903b-r121',"function inval121(date){",
   "/* 1025B：已經算出來的最早一天；比它更早、又沒算過的日子＝起算日以前 */\n"
   "function before121(date){if(!date||!CURSOR121||MEM121[date]||date>=CURSOR121)return false;var lo=null;for(var k in MEM121){if(lo===null||k<lo)lo=k}return !!(lo&&date<lo)}\n"
   "function inval121(date){")
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
RW('k25 embed',open('../1023A/js/grp23.js',encoding='utf-8').read(),open('../1023A/js/grp23.js',encoding='utf-8').read()+JS('k25.js')+JS('wind25.js')+JS('ap25.js'))
RC('dh card label','kgm-0907A-r196',"'DH PNR '+E(r.pnr)+(r.last?(z()?(' · '+E(r.last)+' / '+E(r.first||'')):","'DH PNR '+E(r.pnr)+(r.last?(z()?('<span style=\"display:block;font-weight:700\">姓 '+E(r.last)+'　名 '+E(r.first||'')+'</span>'):")   # 1025B：PNR 一行、姓名一行

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


# ══ K：請假（使用者：「地勤可能請了那天班就是那天會變成休息找其他人代替 然後下是組元可能請假他剛到國外就要幫他取消請假區間的班表並且在請假節數格天排回程當組元或是DH」）
#    組員那一半 r121／r229（0928B）本來就做了（請假日不排、結束隔天在外站沒排到班就 DH 回基地），實測通過；
#    地勤的 8 小時班（r194，1022A）完全沒讀請假 → 核准後當天照樣排他上班。══
RC('gnd lv fn','kgm-0907A-r194',"function person8(p,date){",
   "/* 1025B：已核准的請假（整天 → 這天休；指定時段 → 那段時間不排工作） */\n"
   "var IGN25=null;\n"
   "function lv25(id,date){try{if(IGN25===id)return null;var L=S.leave||[];for(var i=0;i<L.length;i++){var l=L[i];if(!l||l.empId!==id||l.status!=='approved')continue;\n"
   "  var a=String(l.start||''),b=String(l.end||l.start||'');if(!a||!(a<=date&&date<=b))continue;\n"
   "  if(l.part&&l.part.from&&l.part.to){var m=function(x){var q=String(x).split(':');return (+q[0])*60+(+q[1]||0)},x=m(l.part.from),y=m(l.part.to);if(y<=x)y+=1440;if(x<180){x+=1440;y+=1440}return {l:l,part:1,blk:[x,y],no:l.caseNo||l.id||''}}\n"
   "  return {l:l,no:l.caseNo||l.id||''}}}catch(_){}return null}\n"
   "function lvsig25(){try{var o='';(S.leave||[]).forEach(function(l){if(l&&l.status==='approved')o+=l.empId+l.start+(l.end||'')+(l.part?l.part.from+l.part.to:'')+','});return o.length+':'+(function(h){for(var i=0;i<o.length;i++)h=(h*31+o.charCodeAt(i))|0;return h})(7)}catch(_){return ''}}\n"
   "function person8(p,date){")
RC('gnd lv person','kgm-0907A-r194',"  if(!d||d.off)return {id:p.empId,p:p,off:true,base:d};",
   "  if(!d||d.off)return {id:p.empId,p:p,off:true,base:d};\n  var lv=lv25(p.empId,date);if(lv&&!lv.part)return {id:p.empId,p:p,off:true,base:d,leaveR1025B:lv};   /* 1025B：請假 → 這天休，工作由同仁接手 */")
RC('gnd lv person2','kgm-0907A-r194',"    ord:H(p.empId+'|'+date)};","    ord:H(p.empId+'|'+date),blk25:lv&&lv.part?lv.blk:null,leaveR1025B:lv||null};")
RC('gnd lv ok8','kgm-0907A-r194',"function ok8(P,t,maxGap){\n  if(P.off)return false;","function ok8(P,t,maxGap){\n  if(P.off)return false;\n  if(P.blk25&&t.a<P.blk25[1]&&t.b>P.blk25[0])return false;   /* 1025B：指定時段請假 */")
RC('gnd lv stamp','kgm-0907A-r194',"return a+'|'+b+'|'+(z()?'z':'e');","return a+'|'+b+'|'+(z()?'z':'e')+'|'+lvsig25();   /* 1025B：請假核准／撤銷後重排 */")
RC('gnd lv shift','kgm-0907A-r194',"  P.from=s;P.to=e;P.meal=meal;P.fillR1022A=fill;",
   "  P.from=s;P.to=e;P.meal=meal;P.fillR1022A=fill;\n"
   "  /* 1025B：指定時段請假落在班內 → 那段寫請假（不排簡報／服務台／用餐） */\n"
   "  if(P.blk25&&P.blk25[1]>s&&P.blk25[0]<e){var x0=Math.max(s,P.blk25[0]),x1=Math.min(e,P.blk25[1]),nf=[];\n"
   "    fill.forEach(function(f){if(f.b<=x0||f.a>=x1){nf.push(f);return}if(f.a<x0)nf.push(Object.assign({},f,{b:x0}));if(f.b>x1)nf.push(Object.assign({},f,{a:x1}))});\n"
   "    if(x0<=s)P.from=x1;else if(x1>=e)P.to=x0;else nf.push({a:x0,b:x1,k:'leave'});   /* 壓到班頭就從請假結束上班、壓到班尾就在請假開始下班；在中間才寫一段請假 */\n"
   "    nf.sort(function(a,b){return a.a-b.a});P.fillR1022A=nf;if(meal&&meal[1]>x0&&meal[0]<x1)P.meal=null}")
RC('gnd lv fill','kgm-0907A-r194',"var FILL22={","var FILL22={leave:['請假（指定時段）','Leave (part day)','已核准的請假時段：這段時間不排工作，原本的櫃檯／登機門工作由同仁接手','Approved part-day leave; no duties in this window'],   /* 1025B */\n  ")
RC('gnd lv fill tag','kgm-0907A-r194',"if(it.f){var L22=FILL22[it.f.k];rows.push('<article class=\"k8-svc\"><time>'+hm(it.f.a)+'–'+hm(it.f.b)+'<i>'+(z()?'勤務':'Duty')+'</i></time>",
   "if(it.f){var L22=FILL22[it.f.k];rows.push('<article class=\"'+(it.f.k==='leave'?'k8-break k25lv-part':'k8-svc')+'\"><time>'+hm(it.f.a)+'–'+hm(it.f.b)+'<i>'+(it.f.k==='leave'?(z()?'請假':'Leave'):(z()?'勤務':'Duty'))+'</i></time>")
RC('gnd lv duty','kgm-0907A-r194',"  window.kgmGroundDutyR99=duty;window.kgmGroundShiftR90=duty;",
   "  /* 1025B：請假 —— 整天請假這天就是休（不論派工是否已排出）；指定時段寫在班別後面 */\n"
   "  var duty0R25=duty;duty=function(id,date){var r=duty0R25.apply(this,arguments);\n"
   "    try{var lv=lv25(id,date);if(lv&&r&&!r.off){var zh=(typeof LEAVE_ZH!=='undefined'&&LEAVE_ZH[lv.l.type])||'';\n"
   "      if(!lv.part)return {off:true,k:'off',label:(z()?'請假':'Leave')+(zh&&z()?'（'+zh+'）':''),from:'',to:'',hours:0,leaveR1025B:lv.no,baseR1025B:(r.from||'')+'–'+(r.to||'')};\n"
   "      r=Object.assign({},r,{leaveTxtR1025B:(z()?'・請假 ':' · leave ')+lv.l.part.from+'–'+lv.l.part.to,leavePartR1025B:lv.no})}}catch(_){}\n"
   "    return r};\n"
   "  window.kgmGroundDutyR99=duty;window.kgmGroundShiftR90=duty;")
RC('gnd lv people','kgm-0907A-r194',"label:q.off?(z()?'例休':'Rest day'):","label:q.off?(q.leaveR1025B?(z()?'請假':'Leave'):(z()?'例休':'Rest day')):")
RC('gnd lv jobs','kgm-0907A-r194',"  if(q.off)return '<div class=\"k74-person-jobs k8-jobs\"><div class=\"k74-empty\">'+(z()?'本日例休（每週固定連休兩天）。':'Rest day.')+'</div></div>';",
   "  if(q.off&&q.leaveR1025B)return cover25html(ap,date,id,q);   /* 1025B */\n"
   "  if(q.off)return '<div class=\"k74-person-jobs k8-jobs\"><div class=\"k74-empty\">'+(z()?'本日例休（每週固定連休兩天）。':'Rest day.')+'</div></div>';")
RC('gnd lv cover','kgm-0907A-r194',"window.kgmGroundPeopleR1008A=function(ap,date){",JS('gl25.js')+"window.kgmGroundPeopleR1008A=function(ap,date){")
RW('gnd lv approve',"    try{if(window.kgmCrewLeaveApplyR928&&window.kgmCrewLeaveApplyR928(l)){removed=0;replaced=0;l._crewAsync928=1}}catch(_e928){}",
   "    try{if(window.kgmCrewLeaveApplyR928&&window.kgmCrewLeaveApplyR928(l)){removed=0;replaced=0;l._crewAsync928=1}}catch(_e928){}\n"
   "    try{if(myRoleR==='ground'&&window.kgmGroundLeaveApplyR1025B){var g25=window.kgmGroundLeaveApplyR1025B(l);if(g25){removed=0;replaced=0;l._gnd25=g25}}}catch(_g25){}   /* 1025B：地勤 8 小時班（r194）當天改休、工作由同仁接手並通知 */")
RW('gnd lv old sched',"    if(myRoleR==='pilot'||myRoleR==='cabin')lst=null;","    if(myRoleR==='pilot'||myRoleR==='cabin'||myRoleR==='ground')lst=null;   /* 1025B：地勤也不用舊 S.crewSched（實際班表是 r194） */")
RW('gnd lv msg','+(l._crewAsync928?"　請假期間的航班由系統改派給符合法規的組員，班表異動另行通知。":""));','+(l._crewAsync928?"　請假期間的航班由系統改派給符合法規的組員，班表異動另行通知。":"")+(l._gnd25?"　"+l._gnd25:""));')

RW('replan warm full',"    function warm(until,done){var g=0;(function step(){try{window.kgmCrewStepR121(140,until)}catch(_){}",
   "    function warm(until,done){var g=0;(function step(){if(!window.KGM_FULLDONE_1006A){setTimeout(step,1000);return}   /* 1025B：組員引擎要等機隊排完才算（不然 4000 次空轉後拿半套班表比對） */try{window.kgmCrewStepR121(140,until)}catch(_){}")

RW('gnd lv sig74',"rx74.msg||'',ns74].join('|');","rx74.msg||'',ns74,(window.kgmGroundLvSigR1025B?window.kgmGroundLvSigR1025B():'')].join('|');   /* 1025B：請假核准後面板要重畫 */")

RC('gnd lv label','kgm-0907A-r194',"    return s.label+'　'+s.from+'–'+s.to+'（'+s.hours+'h）';","    return s.label+'　'+s.from+'–'+s.to+'（'+s.hours+'h'+(s.leaveTxtR1025B||'')+'）';   /* 1025B */")

RC('gnd lv head','kgm-0902a-r102',"      +'<b>'+E(d.off?d.label:(d.label+'　'+d.from+' – '+d.to))+'</b>'",
   "      +'<b>'+E(d.off?d.label:(d.label+'　'+d.from+' – '+d.to+(d.leaveTxtR1025B?'（'+String(d.leaveTxtR1025B).replace(/^[・· ]+/,'')+'）':'')))+'</b>'   /* 1025B：指定時段請假 */")
RC('gnd lv head2','kgm-0902a-r102',"      +'<span>'+(d.off?(z()?'例休':'Rest day'):","      +'<span>'+(d.off?(d.leaveR1025B?(z()?('已核准請假 '+d.leaveR1025B+'・當天工作由同仁接手'):'Approved leave · duties covered'):(z()?'例休':'Rest day')):")
RC('gnd lv week','kgm-0902a-r102',"          +'<b>'+E(q.off?(z()?'休':'Off'):q.label)+'</b>'","          +'<b>'+E(q.off?(q.leaveR1025B?(z()?'請假':'Leave'):(z()?'休':'Off')):q.label)+'</b>'")
RC('gnd lv offdays','kgm-0902a-r102',"  var offDays=wk.filter(function(x){return duty102(id,x).off}).map(","  var offDays=wk.filter(function(x){var q=duty102(id,x);return q.off&&!q.leaveR1025B}).map(")
RC('gnd lv role','kgm-0907A-r194',"  var q=P.people[id];if(q.off)return z()?'旅客服務地勤・本日例休':'Passenger Service Agent · rest day';",
   "  var q=P.people[id];if(q.off)return q.leaveR1025B?(z()?'旅客服務地勤・本日請假':'Passenger Service Agent · on leave'):(z()?'旅客服務地勤・本日例休':'Passenger Service Agent · rest day');")
RC('gnd lv tile','kgm-0907A-r194',"      +tile(z()?'例休':'Rest day',P.off,z()?'人':'staff')",
   "      +(function(){var n=0;Object.keys(P.people).forEach(function(k){if(P.people[k].leaveR1025B&&P.people[k].off)n++});return tile(z()?'例休':'Rest day',P.off-n,(z()?'人':'staff')+(n?(z()?('（另請假 '+n+' 人）'):(' (+'+n+' on leave)')):''))})()   /* 1025B */")
RW('gnd lv r12',"var lab=!d?'—':(d.off?(z12()?'例休':'Rest day'):","var lab=!d?'—':(d.off?(d.leaveR1025B?(z12()?'請假':'Leave'):(z12()?'例休':'Rest day')):")

RC('gnd lv sum','kgm-0902a-r102',"      return {early:R.by.early.length,mid:R.by.mid.length,late:R.by.late.length,\n        off:R.by.off.length,total:R.total};",
   "      var lv25=0;try{R.by.off.forEach(function(x){var q=window.kgmGroundDutyR99(x.empId,date);if(q&&q.leaveR1025B)lv25++})}catch(_){}   /* 1025B：請假另列 */\n"
   "      return {early:R.by.early.length,mid:R.by.mid.length,late:R.by.late.length,\n        off:R.by.off.length-lv25,lv:lv25,total:R.total};")
RC('gnd lv sum2','kgm-0902a-r102',"      +'<span class=\"off\">'+(z()?'例休 ':'Rest ')+S7.off+'</span>'","      +'<span class=\"off\">'+(z()?'例休 ':'Rest ')+S7.off+'</span>'+(S7.lv?('<span class=\"off\">'+(z()?'請假 ':'Leave ')+S7.lv+'</span>'):'')")

RC('crew lv cell','kgm-0907A-r196',"        h+='<span class=\"rest\">'+(z()?'休':'OFF')+'</span>';",
   "        var lv25=false;try{lv25=window.kgmCrewOffR928&&window.kgmCrewOffR928(id,x.date)}catch(_){}   /* 1025B：核准的請假寫「請假」，不是「休」 */\n"
   "        h+=lv25?('<span class=\"rest\" style=\"color:#8a5a12;background:#fff3dc;border-radius:6px;padding:1px 6px\">'+(lv25==='leave'?(z()?'請假':'LEAVE'):(z()?'停派':'REMOVED'))+'</span>'):('<span class=\"rest\">'+(z()?'休':'OFF')+'</span>');")

RC('r196 bg step','kgm-0907A-r196',"window.kgmRosterReadyR196=function(){return READY196};",
   "window.kgmRosterReadyR196=function(){return READY196};\n"
   "/* 1025B：背景（cw25）組員引擎算完 60 天後，在瀏覽器空檔一天一天把班表索引也補好 —— 進「組員班表」就是 60/60，不用停在那一頁等 */\n"
   "window.kgmRosterStepR196=function(){if(READY196<DAYS196&&window.KGM_ROT_FINAL_R913&&window.KGM_FULLDONE_1006A)buildStep196();return READY196};")

# ══ D：冬季飛行時間每一班各自算（js/wind25.js）══
RW('wind flight',"    var w=window.kgmWindDeltaR1023A(f.fr,f.to),off=0,dep=mn(x.dep);",
   "    var wf25=null;try{wf25=window.kgmWindFlightR1025B&&window.kgmWindFlightR1025B(f,x,su,bs,date)}catch(_){}   /* 1025B：每一班依航路高空風、機型速度、起降時段算 */\n"
   "    var w=wf25?wf25.w:window.kgmWindDeltaR1023A(f.fr,f.to),off=0,dep=mn(x.dep);\n"
   "    /* 1025B：同一班號的前一段（同一架飛機）冬季落地後，地面時間要跟夏季一樣夠（60～90 分）；不夠就把這一段起飛往後挪（KX54 墨爾本冬季原本只剩 35 分 → 機隊排班拆機） */\n"
   "    var sh25=0;try{sh25=gt25(o0,f,date,x)}catch(_){}if(sh25>0){dep+=sh25;x=Object.assign({},x,{dep:hm(dep),gtShiftR1025B:sh25})}")
RW('wind flight c',"    var c={arr:hm(a),dd:Math.floor(a/1440),windR1023A:w};","    var c={dep:x.dep,gtShiftR1025B:x.gtShiftR1025B||0,arr:hm(a),dd:Math.floor(a/1440),windR1023A:w,windAirR1025B:wf25?wf25.air:null,windGndR1025B:wf25?wf25.gnd:null};")
RW('wind flight key',"    var k=[f.code,f.fr,f.to,f.dep,date.slice(0,7),x.dep,x.arr,x.dd].join('|'),mm=MEMO[k];","    var k=[f.code,f.fr,f.to,f.dep,date.slice(0,7),x.dep,x.arr,x.dd,x.acft||'',window.kgmWindFlightR1025B?'n':'o'].join('|'),mm=MEMO[k];")
RW('wind route sea',"    try{var x=window.kgmSeasonFlightR48(f,date);if(x&&x.dep){r.dep=x.dep;r.arr=x.arr;r.dd=x.dd}}catch(_){}","    try{var x=window.kgmSeasonFlightR48(f,date);if(x&&x.dep){r.dep=x.dep;r.arr=x.arr;r.dd=x.dd;r.wa=x.windAirR1025B;r.wg=x.windGndR1025B}}catch(_){}")
RW('wind route label',"+(dl&&!wi.off?'<u>'+(dl>0?'+':'')+dl+(z()?' 分':' min')+'</u>':'')","+(dl&&!wi.off?'<u'+(wi.wa!=null?' title=\"'+(z()?('高空風 '+(wi.wa>0?'+':'')+wi.wa+' 分・起降時段／除冰 '+(wi.wg>0?'+':'')+wi.wg+' 分'):('Winds '+wi.wa+' min · ground '+wi.wg+' min'))+'\"':'')+'>'+(dl>0?'+':'')+dl+(z()?' 分':' min')+'</u>':'')")

RW('wind 03 nearest',"    if(in3(a)){var sg=w>0?1:-1,ok=false;for(var e=5;e<=20&&!ok;e+=5){if(!in3(at(w+sg*e))){w+=sg*e;ok=true}}if(!ok){var m=((a%1440)+1440)%1440;w-= (m-175)}a=at(w)}",
   "    if(in3(a)){var m3=((a%1440)+1440)%1440,up3=240-m3,dn3=m3-175;w+=(up3<=dn3?up3:-dn3);a=at(w)}   /* 1025B：落在 03 點就挪到較近的 04:00 或 02:55（原本先往同方向推 20 分、推不出去就退到 02:55 —— KX20 成田→檀香山冬季因此比夏季快 90 分） */")
RW('wind gt fn',"  var MEMO={};\n  function adj(o0,f,date,x){",
   "  var MEMO={};\n"
   "  function sg25(v){v=((v%1440)+1440)%1440;return v>720?v-1440:v}\n"
   "  var GI25=null,GN25=-1;function prev25(f){var L=[].concat(FLIGHTS,S.customFlights||[]);if(!GI25||GN25!==L.length){GI25={};GN25=L.length;L.forEach(function(y){if(y&&!y.via&&!y.partner)(GI25[y.code+'>'+y.to]=GI25[y.code+'>'+y.to]||[]).push(y)})}   /* 1025B：班號＋抵達站索引（原本每次掃整份航班表） */\n"
   "    return (GI25[f.code+'>'+f.fr]||[]).filter(function(y){return y.fr!==f.to})[0]||null}\n"
   "  function gt25(o0,f,date,x){var P=prev25(f);if(!P)return 0;\n"
   "    var su=o0(f,sumDate(date)),ps=o0(P,sumDate(date));if(!su||!ps||!su.dep||!ps.arr)return 0;var gs=sg25(mn(su.dep)-mn(ps.arr));if(gs<0||gs>360)return 0;\n"
   "    var p0=o0(P,date),p1=adj(o0,P,date,p0);if(!p1||!p1.arr)return 0;var need=Math.max(60,Math.min(90,gs)),gw=sg25(mn(x.dep)-mn(p1.arr));if(gw<-360||gw>360)return 0;\n"
   "    return gw<need?Math.ceil((need-gw)/5)*5:0}\n"
   "  function adj(o0,f,date,x){")

# ══ 機型同步：冬夏不同機型（1020B SEAS20：KX304/303 冬 A388、KX306/305 冬 A21N）實際排班一直沒派對 ——
#    r76 的 acftOfFlight 只看航段底表機型（KX306 底表釘夏季 B779），不看季節表；機隊排班照它派機，冬季整季派成 B779、KX304 頭幾天 B789，
#    「每日異動」卻寫應有 A388／A21N（兩個不一致的來源）。══
RW('sea type fl20b',"      try{if((code==='KX304'||code==='KX303')&&date&&t!=='A359'&&t!=='B779'){var od=origin20(code,fr,to,date);",
   "      try{var m25=SEAS20[code];if(m25&&date){var od25=origin20(code,fr,to,date);if(sea20(od25)==='winter'){var sub25=(S.acftSub||{})[code+'_'+date],ov25=(S.flightOverrides||{})[code+'_'+date];   /* 1025B：冬季照 SEAS20（KX304／303 A388、KX306／305 A21N），沒人工換機就回冬季機型 —— 原本只有 KX304／303 夏季有這一層，冬季被 r76 底表（KX306 釘 B779）與 r71（EQV→B789）蓋掉，排班整季派錯 */\n"
   "        if(!(sub25&&(sub25.sub||sub25.to||sub25.acft))&&!(ov25&&ov25.acft))return m25.winter}}}catch(_){}\n"
   "      try{if((code==='KX304'||code==='KX303')&&date&&t!=='A359'&&t!=='B779'){var od=origin20(code,fr,to,date);")

# ══ E：後台卡頓（背景算完之後還一直卡）══
RW('hol memo',"function kgmHolDirR929(f,date,why){\n  date=date||(f&&f.date);if(!f||!date)return 1;\n",
   "var HOLM25={},HOLN25=0;   /* 1025B：假期方向是純函式（假期表＋起訖國家＋日期），算過就記住；營收背景結算一次要問幾萬次（實測 6 秒內 1.1 秒都在這裡） */\n"
   "function kgmHolDirR929(f,date,why){\n  date=date||(f&&f.date);if(!f||!date)return 1;\n"
   "  var HL25=(window.KGM_HOLIDAYS_R929||KGM_HOLIDAYS_R929),hk25=why?null:(f.fr+'|'+f.to+'|'+date+'|'+HL25.length);if(hk25&&HOLM25[hk25]!=null)return HOLM25[hk25];\n"
   "  if(hk25){var r25=kgmHolDirR929(f,date,[]);if(++HOLN25>60000){HOLM25={};HOLN25=0}HOLM25[hk25]=r25;return r25}\n")
RW('finance bg pause',"    if(!financeMonth.running){financeMonth.running=true;setTimeout(function step(){var job=financeMonth.jobs[0];if(!job){financeMonth.running=false;return}",
   "    if(!financeMonth.running){financeMonth.running=true;setTimeout(function step(){var job=financeMonth.jobs[0];if(!job){financeMonth.running=false;return}\n"
   "      try{if(!(S.adminAuthed&&S.view==='admin'&&S.adminTab==='finance')){setTimeout(step,2000);return}}catch(_){}   /* 1025B：離開營收分析就暫停（原本整年 12 個月在背景一直算，切到別頁也卡），回來接著算 */")

RW('auc pre idle',"    (function step(){var t=Date.now();while(Q.length&&Date.now()-t<30){var x=Q.shift();try{window.kgmEnsureAuctionsR922(x[0],x[1],x[2])}catch(_){}}if(Q.length)setTimeout(step,60)})();",
   "    /* 1025B：一班就要 100 毫秒以上（Payload 艙單），原本每 60 毫秒一段、每補到一班就整份存檔 → 開頁後好幾分鐘一直卡。\n"
   "       改成瀏覽器空閒、而且使用者 1.5 秒內沒有操作才補一班；存檔最多 10 秒一次 */\n"
   "    function idle25(f){if(window.requestIdleCallback)window.requestIdleCallback(f,{timeout:4000});else setTimeout(f,200)}\n"
   "    var sv25=0;function flush25(force){if(window.KGM_AUC_DIRTY_R1025B&&(force||Date.now()-sv25>10000)){window.KGM_AUC_DIRTY_R1025B=0;sv25=Date.now();window.KGM_AUC_DEFER_SAVE_R1025B=0;try{save()}catch(_){}}}\n"
   "    (function step(dl){if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(function(){idle25(step)},700);return}\n"
   "      window.KGM_AUC_DEFER_SAVE_R1025B=1;var t=Date.now(),n=0;\n"
   "      while(Q.length&&(n===0||(dl&&dl.timeRemaining&&dl.timeRemaining()>12))&&Date.now()-t<40){var x=Q.shift();n++;try{window.kgmEnsureAuctionsR922(x[0],x[1],x[2])}catch(_){}}\n"
   "      window.KGM_AUC_DEFER_SAVE_R1025B=0;flush25(!Q.length);if(Q.length)idle25(step)})();")
RW('auc save defer',"      if(made){try{save()}catch(_){}}\n      if(mk12&&!window.__kgmBdSkipR929)M12[mk12]=Date.now();",
   "      if(made){if(window.KGM_AUC_DEFER_SAVE_R1025B)window.KGM_AUC_DIRTY_R1025B=1;else try{save()}catch(_){}}   /* 1025B：背景預補時集中存檔 */\n"
   "      if(mk12&&!window.__kgmBdSkipR929)M12[mk12]=Date.now();")

RW('auc page budget',open('auc_old.txt',encoding='utf-8').read(),
   "              if(Date.now()-t0929>150){P929.push([f.code,dd,f]);return}   /* 1025B：競標頁每次重畫最多同步補 150 毫秒（原本 800 毫秒，而且超過之後還是每一班都補一次競標），其餘交給空閒時補 */\n"
   "              n+=window.kgmEnsureAuctionsR922(f.code,dd,f);")
RW('auc page idle',"            var Q=window.__kgmBdPendR929;if(!Q)return;var t1=Date.now();\n            while(Q.length&&Date.now()-t1<40){var x=Q.shift();try{window.kgmEnsureAuctionsR922(x[0],x[1],x[2])}catch(_){}}\n            if(Q.length){setTimeout(step929,30);return}",
   "            var Q=window.__kgmBdPendR929;if(!Q)return;\n"
   "            /* 1025B：使用者正在操作就先讓開；瀏覽器空閒才補；存檔集中（每補到一班就整份存檔是卡頓來源） */\n"
   "            var I25=function(f){if(window.requestIdleCallback)window.requestIdleCallback(f,{timeout:4000});else setTimeout(f,200)};\n"
   "            if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(function(){I25(step929)},700);return}\n"
   "            var t1=Date.now();window.KGM_AUC_DEFER_SAVE_R1025B=1;\n"
   "            while(Q.length&&Date.now()-t1<40){var x=Q.shift();try{window.kgmEnsureAuctionsR922(x[0],x[1],x[2])}catch(_){}}\n"
   "            window.KGM_AUC_DEFER_SAVE_R1025B=0;if(window.KGM_AUC_DIRTY_R1025B&&(!Q.length||Date.now()-(step929.sv||0)>10000)){window.KGM_AUC_DIRTY_R1025B=0;step929.sv=Date.now();try{save()}catch(_){}}\n"
   "            if(Q.length){I25(step929);return}")
RW('auc settle 60s',"if(L6.sg!==sg6||t6-L6.t>5000){","if(L6.sg!==sg6||t6-L6.t>60000){")

# ══ G：後台機場欄位用前台選擇器（js/ap25.js）—— r158 的區域分組與名稱匯出給它用 ══
RC('ap lib export','kgm-0908a-r158',"window.kgmApOpenR158=function(which){",
   "window.kgmApLibR1025B={regions:regions158,city:cityLabel158,sub:subLabel158,rank:rank158};   /* 1025B：後台機場欄位共用同一套分組與名稱 */\nwindow.kgmApOpenR158=function(which){")

# ══ L：前台選航班頁每畫一次 1.3 秒 —— 可售票種（validCodes）每次重畫就清空重算；改成「訂位／規則／可售座位等資料有變或過了一分鐘才重算」，明確要求重算的照舊 ══
RW('vc memo gen',"      if(VCAT111!==VCGEN111){VCMEM111={};VCAT111=VCGEN111}",
   "      var g25=VCGEN111+'|'+(window.kgmInvSigR1025B?window.kgmInvSigR1025B():Date.now());if(VCAT111!==g25){VCMEM111={};VCAT111=g25}   /* 1025B：不再每次重畫都清空 */")
RW('vc memo no per-render bump',"  render=window.render=function(){\n    VCGEN111++;\n","  render=window.render=function(){\n")

# ══ 結尾 ══
open('p_h_r25.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
