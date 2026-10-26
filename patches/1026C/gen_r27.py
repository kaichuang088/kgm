from common import *
import json
# ══ 1026C ═══════════════════════════════════════════════════════════════
#   使用者（1026B 交付後）訊息，逐條見 notes/1026C-pass129-notes.md。
#   比對基準：1026B 最終版 w23（/tmp/j/kgm1026B_w23.html，patches/1026B/build.sh 重建）。
CUR=open('/tmp/j/kgm1026B_w23.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 1：夏令時間（js/bt26.js 改版：輪擋／飛行時間依日期的時差；TZ 表本身不動）══
_bt26old=open('../1026B/js/bt26.js',encoding='utf-8').read()
RW('bt26 dst',_bt26old,JS('bt26.js'))

# ══ 2：時刻異動通知（js/sc27.js，接在 zn26 後面）══
_zn=open('../1026B/js/zn26.js',encoding='utf-8').read()
RW('sc27 embed',_zn,_zn+JS('zn27.js')+JS('nt27.js')+JS('sc27.js')+JS('ch27.js'))   # 1026C：zn27＝關閉空域・Payload 分頁

# ══ 1b：航班動態等畫面的 UTC 換算（_utcOf）也用依日期的時差（航班動態卡片寫的飛行時間、抵達日期）══
RW('utcOf dst',"return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tzMin(ap))*60000;",
   "var _tz27=_tzMin(ap);try{if(window.kgmTzAtR1026C)_tz27=Math.round(window.kgmTzAtR1026C(ap,String(dateISO).slice(0,10))*60)}catch(_){}   /* 1026C：夏令時間 */\n  return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tz27)*60000;")

# ══ 4：販售通路（js/ch27.js）：夥伴營運一般訂票配額、只開放包機／只開放旅客訂購 —— sell54 最前面問（在團體之前：只開放旅客訂購的班團體也不能訂）══
RC('sell54 channel','kgm-0823c-r54',"  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}",
   "  if(window.kgmChannelSellR1026C){var c27=window.kgmChannelSellR1026C(code,date,flight);if(c27!=null)return c27}   /* 1026C：販售通路 */\n  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}")
RW('sales S init','warZonesR1026B:LS.get("kgm26_zones",null),','warZonesR1026B:LS.get("kgm26_zones",null),salesModeR1026C:LS.get("kgm27_salesmode",null),charterReqsR1026C:LS.get("kgm27_charter",[]),dhSigR1026C:LS.get("kgm27_dhsig",{}),paxCapAdjR1026C:LS.get("kgm27_paxcap",[]),')
RW('sales save','LS.set("kgm26_zones",S.warZonesR1026B||null);','LS.set("kgm26_zones",S.warZonesR1026B||null);LS.set("kgm27_salesmode",S.salesModeR1026C||null);LS.set("kgm27_charter",S.charterReqsR1026C||[]);LS.set("kgm27_dhsig",S.dhSigR1026C||{});LS.set("kgm27_paxcap",S.paxCapAdjR1026C||[]);')

# ══ 3：團體訂位兩方案（js/grp25_27.js＝mkgrp27.py＋mkgrp27b.py 在現行 grp25 上逐段改；js/grp27x.js 團體不能網路報到）══
RW('grp27',open('js/grp25_cur.js',encoding='utf-8').read(),JS('grp25_27.js')+JS('grp27x.js')+JS('cr27.js'))
RW('grp27 seat text','const _seat929=_staffFare?(LANG==="en"?"Assigned at check-in":"報到時指派")',
   'const _seat929=(FARES[c]&&FARES[c].groupPlanR1026C)?(LANG==="en"?"Free seat selection, any time (whole group at once)":"免費選位（隨時；可整團一次劃位）"):_staffFare?(LANG==="en"?"Assigned at check-in":"報到時指派")')

RW('grp27 counter fee','_cv6(chgLabel||"—")+(_staffFare?"":`<small class="k929-chgn">',
   '_cv6(chgLabel||"—")+(_staffFare?"":(FARES[c]&&FARES[c].groupPlanR1026C)?`<small class="k929-chgn">${LANG==="en"?"Per passenger · counter same fee":"每位旅客 · 櫃檯同價"}</small>`:`<small class="k929-chgn">')   # 1026C：團體方案改票費一律方案金額
# ══ 3b：寄信清單（後台「寄信事件」）：團體兩方案、帳號人工新增、時刻異動信 ══
RW('mail list sched',"{ev:'flight.schedule_changed', who:'ext', zh:'季節班表調整',    en:'Seasonal schedule change',   when:'冬夏季班表切換'}",
   "{ev:'flight.schedule_changed', who:'ext', zh:'季節班表調整／時刻異動',    en:'Schedule change',   when:'冬夏季班表切換；或時刻調整（輪擋彈性、夏令時間）後已開票訂位的時刻跟現行班表不同：每筆真實訂位寄一次、分批寄，模擬資料不寄'}")
RW('mail list grp',"  {ev:'group.reduced',who:'ext',zh:'團體人數減少・尾款更新',en:'Group size reduced',when:'旅行社減少人數（最多 3 位），寫明剩餘人數與新尾款'},",
   "  {ev:'group.reduced',who:'ext',zh:'團體人數減少・尾款更新',en:'Group size reduced',when:'旅行社減少人數（名單期限前優惠 3 位／彈性 6 位免手續費，超過每位收退票手續費），寫明剩餘人數與新尾款'},\n"
   "  {ev:'group.pax_added',who:'ext',zh:'團體人數增加・尾款更新',en:'Group size increased',when:'旅行社加人（依當天剩餘座位；名單期限前優惠 3 位／彈性 6 位免手續費，超過每位收改票手續費），寫明人數與新尾款'},\n"
   "  {ev:'group.charter_received',who:'ext',zh:'包機／自創航班申請已收到',en:'Charter request received',when:'團體帳號在前台送出包機（包下現有航班／加開包機）或自創航班申請'},\n"
   "  {ev:'group.charter_approved',who:'ext',zh:'包機／自創航班核准・班號與訂金請款',en:'Charter approved',when:'團體業務核准：寫明班號、時刻、機型、報價與訂金期限（核准後 7 天）'},\n"
   "  {ev:'group.charter_declined',who:'ext',zh:'包機／自創航班無法承接',en:'Charter declined',when:'團體業務不核准（附原因）'},")
RW('mail list grp bal',"when:'尾款期限（最慢起飛前 14 天）前每 7 天一次，剩 3 天、1 天再寄；團體業務也可手動寄'}",
   "when:'尾款期限（優惠：起飛前 21 天／彈性：起飛前 7 天）前每 7 天一次，剩 3 天、1 天再寄；團體業務也可手動寄'}")
RW('mail list grp bind',"when:'AI 客服依案件號完成旅行社帳號綁定，可開始團體訂位'}",
   "when:'AI 客服審核通過或團體業務人工新增帳號，寫明可訂團體票的開放期間'}")

# ══ 3c：《團體訂位規章》KGM-GRP-021（grp_doc.py，PDF 同一份）：網站內嵌、辦法份數 17→18、團體訂位付款前要同意 ══
import grp_doc
RW('grp policy doc',"window.kgmPolicyDocR914=function(id){",
   "/* 1026C：《團體訂位規章》（patches/1026C/grp_doc.py，PDF 同一份） */\nwindow.KGM_POLICY_DOCS_R914[\"KGM-GRP-021\"]="+json.dumps(grp_doc.doc(),ensure_ascii=False)+";\nwindow.kgmPolicyDocR914=function(id){")
RW('grp policy audit',"if(o.docs!==17)o.bad.push('辦法份數 '+o.docs+'（應為 17）');","if(o.docs!==18)o.bad.push('辦法份數 '+o.docs+'（應為 18）');   /* 1026C：加 KGM-GRP-021 */")
RW('grp policy gate',"  {fn:'doPay',                    ids:['KGM-GC-001','KGM-CON-006'],",
   "  {fn:'doPay',                    get ids(){try{if(S&&S.search&&S.search.grp25)return ['KGM-GC-001','KGM-CON-006','KGM-GRP-021']}catch(_){}return ['KGM-GC-001','KGM-CON-006']},   /* 1026C：團體訂位付款另要同意 KGM-GRP-021 */")

# ══ 3d：包機／自創航班申請（js/cr27.js）：存檔、AI 臨時航班的排機與建立開出來共用、寄信清單 ══
RW('charter tempplan',"  window.kgmAiTempFlightR1025B=function(a){",
   "  window.kgmTempPlanR1026C=function(P){return plan(P)};window.kgmTempCreateR1026C=function(P,o){return create(P,o)};   /* 1026C：包機／自創航班核准共用同一套排機與建立（js/cr27.js） */\n  window.kgmAiTempFlightR1025B=function(a){")

# ══ 7：卡頓（使用者：「1026A我要測試那些真的非常辛苦 太過於卡頓 每次跳出去再回去都會套圖四這種」）
#   實測（tests/reent27.js）：後台開頁後 3 分鐘內主執行緒幾乎沒有空檔（195 秒裡 186 秒是長任務）；重新整理一樣 182 秒。
#   最大一塊是 DH 自動騰位掃描（scan7）：開頁 75 秒後把 3 天內每一班有 DH 組員的航班都重建一次艙單（manifest7），重新整理後全部再做一次（實測 23 秒）。
#   → 記下每班「DH 組員名單＋艙等」的指紋（S.dhSigR1026C，kgm27_dhsig）；這一班上次已經全部有位子、名單沒變就不再重建艙單。 ══
RW('dh sig skip',"      var key=opKey(f,date),m=manifest7(f,date),now=new Date().toISOString(),rev=0;",
   "      var key=opKey(f,date),sg27=dhSig27(f,date);if(!force&&sg27&&(S.dhSigR1026C||{})[key]===sg27)return 0;   /* 1026C：DH 名單沒變、上次都有位子 → 不重建艙單 */\n      var m=manifest7(f,date),now=new Date().toISOString(),rev=0;")
RW('dh sig none',"      if(!need.length){if(rev){try{save()}catch(_){}setTimeout(rr7,40)}return 0}",
   "      if(!need.length){dhSigSet27(key,sg27);if(rev){try{save()}catch(_){}setTimeout(rr7,40)}return 0}")
RW('dh sig done',"        try{save()}catch(_){}setTimeout(rr7,40)}\n      return n;",
   "        try{save()}catch(_){}setTimeout(rr7,40)}\n      if(need.every(function(x){return x.seat}))dhSigSet27(key,sg27);\n      return n;")
RW('dh sig fns',"  window.kgmDhBumpR1007A=function(f,date,force){",
   "  /* 1026C：DH 指紋＝這一班（日期|班號|起|迄）排到的 DH 組員員編＋艙等 */\n"
   "  function dhSig27(f,date){try{var L=(S.crewPositioningR121||{})[date+'|'+f.code+'|'+f.fr+'|'+f.to]||[];return L.map(function(x){return (x.empId||x.name||'')+':'+(x.cabin||'')}).sort().join(',')}catch(_){return ''}}\n"
   "  function dhSigSet27(key,sg){if(!sg)return;var o=S.dhSigR1026C=S.dhSigR1026C||{},t=todayISO();o[key]=sg;Object.keys(o).forEach(function(k){if(String(k.split('|')[1]||'')<addDays(t,-2))delete o[k]})}\n"
   "  window.kgmDhBumpR1007A=function(f,date,force){")

#   ② 後台登入後 4／9／12／13／26 秒，r131 apply131、r179、r184、r92、r135、舊引擎都會在主執行緒上一次做完整年機隊重排（實測 19.9 秒、使用者電腦更久 → 「網頁沒有回應」），
#     但後台一定還會跑分段的整年最終重排（r913／1006A，每段 0.15 秒）把結果整份換掉 —— 那一次同步重排是白做的。
#     → 後台（非前台）在最終重排做完之前不做這一次；季節時刻照灑（spreadOnly131 不動）。未登入後台的開頁本來就不做（fpfl.js 量的就是這條）。
RW('admin boot sync rebuild',"if(!S.adminAuthed||window.KGM_ROT_SUM_R72)return;",
   "if(!S.adminAuthed||window.KGM_ROT_SUM_R72)return;if(String(window.KGM_SIDE||'')!=='front'&&!window.KGM_ROT_FINAL_R913)return;   /* 1026C：後台登入後的同步整年重排等分段最終重排（實測各卡 20 秒） */",6)
RW('r72 interval wait final',"    if(window.KGM_ROT_SUM_R72)return;               /* 已經是 r72 這一份就不重算 */",
   "    if(window.KGM_ROT_SUM_R72)return;               /* 已經是 r72 這一份就不重算 */\n    if(String(window.KGM_SIDE||'')!=='front'&&!window.KGM_ROT_FINAL_R913)return;   /* 1026C：等分段最終重排 */")

#   ③ 組員班表背景（1025B cw25）：原本 60 天全部算完才存進 IndexedDB —— 開頁 3 分鐘內離開，下次進來又從頭算（每天 1～2.6 秒的長任務）；
#     而且一天算完只隔 30 毫秒就算下一天，整頁幾乎沒有空檔。→ 每多算 5 天就存一次進度（同一組輸入，讀回後接著算，結果跟一口氣算完一樣）；
#     不在「組員班表」分頁時，一天算完隔 0.9 秒再算下一天（點擊、捲動有空檔回應）。KGM_CREW_SAVE_R1025B 照舊只在算滿 60 天才設。
RW('cw25 part save',"  function save25(){var sg=sig25();if(sg===SAVED25||!CURSOR121)return;var o=snap(),t0=Date.now();",
   "  var SAVEDCUR27='';function days27(a,b){return Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/864e5)}\n"
   "  function pace27(){try{return (S.view==='admin'&&S.adminTab==='sched')?30:900}catch(_){return 900}}   /* 1026C：不在組員班表分頁時一天算完讓出 0.9 秒 */\n"
   "  function save25(){var sg=sig25();if(!CURSOR121||(sg===SAVED25&&CURSOR121===SAVEDCUR27))return;var o=snap(),t0=Date.now(),cur27=CURSOR121;   /* 1026C：算到一半也存（每 5 天） */")
RW('cw25 part done',"tx.oncomplete=function(){SAVED25=sg;window.KGM_CREW_SAVE_R1025B={sig:sg,cur:CURSOR121,ms:Date.now()-t0}}}catch(_){}})}",
   "tx.oncomplete=function(){SAVED25=sg;SAVEDCUR27=cur27;if(cur27>=target())window.KGM_CREW_SAVE_R1025B={sig:sg,cur:cur27,ms:Date.now()-t0};else window.KGM_CREW_PART_R1026C={sig:sg,cur:cur27,ms:Date.now()-t0}}}catch(_){}})}")
RW('cw25 part step',"      if(CURSOR121&&CURSOR121>=target())save25();",
   "      if(CURSOR121&&(CURSOR121>=target()||!SAVEDCUR27||days27(SAVEDCUR27,CURSOR121)>=5))save25();")
RW('cw25 pace',"      setTimeout(tick,30)});","      setTimeout(tick,pace27())});")

#   ④ BigDeal 開頁 25 秒後（之後每 5 分鐘）把所有有出價的航班一次排名／結標（實測一次卡 12.9 秒）→ 同一份工作切成每段 0.12 秒、段與段之間讓出主執行緒；結果一樣。
RW('bigdeal tick slices',"""    Object.keys(g).forEach(function(k){
      var p=k.split('|'),f=fOf(p[0],p[2],p[3]);if(!f)return;var w=window.kgmBigDealWindowR929(f,p[1]);
      try{if(w.closed||(isFinite(w.h)&&w.h<=-24))window.kgmBigDealSettleR929(p[0],p[1],p[2],p[3],p[4]);else if(w.open)window.kgmBigDealRankR929(p[0],p[1],p[2],p[3],p[4]);n++}catch(_){}
    });
    return n;
  };""","""    var ks=Object.keys(g),i=0;   /* 1026C：分段做（每段 0.12 秒），不一次卡住 */
    if(window.__bdTick27)return 0;window.__bdTick27=1;
    (function slice(){var t0=Date.now();try{while(i<ks.length&&Date.now()-t0<120){var k=ks[i++];
      var p=k.split('|'),f=fOf(p[0],p[2],p[3]);if(!f)continue;var w=window.kgmBigDealWindowR929(f,p[1]);
      try{if(w.closed||(isFinite(w.h)&&w.h<=-24))window.kgmBigDealSettleR929(p[0],p[1],p[2],p[3],p[4]);else if(w.open)window.kgmBigDealRankR929(p[0],p[1],p[2],p[3],p[4]);n++}catch(_){}}}catch(_){}
      if(i<ks.length)setTimeout(slice,30);else window.__bdTick27=0})();
    return ks.length;
  };""")

# ══ 8：北美出發不過午夜（使用者：「我覺得北美不要太多-1喔盡量都在23:55前出發 不然很亂」「圖二KX25在隔天吧」）══
#   台北出發往北美、過了午夜才起飛的只有 5 段（tests/legs 整週量）：KX26 台北→西雅圖 夏 00:35／冬 00:20、KX30 台北→溫哥華（→多倫多）夏 01:15／冬 02:10、KX8 台北→底特律 冬 00:15。
#   · KX26（每天）、KX30：改成前一天 23:50 起飛（同一架飛機、實際提早 45／30、85／140 分）→ 營運日跟著往前一天（KX30 一二四六 → 日一三五；溫哥華→多倫多那段實際日期不變）。
#   · KX8 冬季：改成跟夏季同一個接法 —— 當天 21:40 起飛、底特律 22:45 前後到、隔天 01:00 KX7 回（原本冬季 00:15 起飛、在底特律停 24 小時）。
#   r77 定值表寫定值（季節時刻的修正一律寫定值）；KX30 台北→多倫多那列存檔帶 userR929A → 舊預設值才遷移（同 1018B KX31 做法）。抵達時刻由 bt26 輪擋彈性照舊重算。
RC('na27 r77 kx30','kgm-0823p-r77',"'KX30|TPE|YYZ':{summer:['01:15','05:35',0,[1,2,4,6],'B789'],winter:['02:10','07:00',0,[1,2,4,6],'B789']},",
   "'KX30|TPE|YYZ':{summer:['23:50','05:35',1,[1,3,5,7],'B789'],winter:['23:50','07:00',1,[1,3,5,7],'B789']},'KX30|TPE|YVR':{summer:['23:50','19:45',0,[1,3,5,7],'B789'],winter:['23:50','20:30',0,[1,3,5,7],'B789']},'KX26|TPE|SEA':{summer:['23:50','19:25',0,'daily','B779'],winter:['23:50','18:45',0,'daily','B779']},'KX8|TPE|DTW':{summer:['23:50','21:55',0,[2,5,7],'B789'],winter:['21:40','19:45',0,[2,5,7],'B789']},")
RC('na27 r77 mig','kgm-0823p-r77',"      if(!(old&&old.userR929A))S.seasonSchedulesR48[k]={summer:rec(v.summer)",
   "      var MIG27={'KX30|TPE|YYZ':['01:15-05:35','02:10-07:00']};   /* 1026C：舊的系統預設才遷移（北美不過午夜起飛） */\n"
   "      if(old&&old.userR929A&&MIG27[k]){['summer','winter'].forEach(function(se){if(old[se]&&MIG27[k].indexOf(old[se].dep+'-'+old[se].arr)>=0){old[se]=rec(v[se]);old.updatedAt=new Date().toISOString()}})}\n"
   "      if(!(old&&old.userR929A))S.seasonSchedulesR48[k]={summer:rec(v.summer)")

RC('na27 r77 no return-day kx30','kgm-0823p-r77',"    var out=byStart['KX'+(n+1)];\n    if(!out||!out.via)return;",
   "    var out=byStart['KX'+(n+1)];\n    if(!out||!out.via)return;\n    if(back.code==='KX30')return;   /* 1026C：KX30 改成前一天 23:50 起飛（營運日日一三五是定值）—— 不再當 KX31 的同日回程去改營運日（改了會多出星期二班、KX29 跟著多星期三） */")
# ══ 9：機隊排班「接不上 3・時間重疊 3／接縫需調機 1 架」（使用者截圖）——重新整理後、整年最終重排做完之前，輪轉檢查量到的是「重排到一半」的輪轉
#   （實測重新整理後第 15 秒：接不上 45、重疊 36；最終重排做完 0／0、接縫 0；全新瀏覽器也是 0）。重排中的數字不是結果 → 這段時間改寫「機隊重排中」，做完自動重畫成真正的數字。
RW('rot audit pending',"  }catch(_){}\n  return '<section class=\"k72-strip\"><div class=\"k72-h\">'",
   "  }catch(_){}\n  try{if(String(window.KGM_SIDE||'')!=='front'&&!window.KGM_ROT_FINAL_R913){var pend27=zz()?'機隊重排中（開頁後約 1 分鐘），完成後自動更新':'Rebuilding — updates automatically';\n"
   "    items=items.map(function(x){return /覆蓋|Legs covered/.test(x.k)?x:{k:x.k,v:pend27,ok:true}})}}catch(_){}   /* 1026C：重排中不顯示半成品的紅字 */\n"
   "  return '<section class=\"k72-strip\"><div class=\"k72-h\">'")

#   根因（為什麼紅字一直在）：輪轉檢查條只在 data-sig 變了才重畫，而 sig 只看「上一次重建的摘要」（覆蓋段數、拆機、無機），
#   重排做完（settled）、背景換機改了輪轉都不會變 → 重排中量到的半成品數字一直留在畫面上。→ sig 加上 settled／最終重排／輪轉指紋。
RW('rot strip sig',"    var sig=[s?s.assigned:'-',s?s.total:'-',s?s.split:'-',s?s.orphan:'-',S._fsTail||''].join('|');",
   "    var sig=[s?s.assigned:'-',s?s.total:'-',s?s.split:'-',s?s.orphan:'-',S._fsTail||'',window.KGM_ROT_SETTLED_R1012A||0,window.KGM_ROT_FINAL_R913?1:0,(function(){try{return window.kgmRosterStampR121?window.kgmRosterStampR121():''}catch(_){return ''}})()].join('|');   /* 1026C：重排完、輪轉有變都要重畫 */")

# ══ 10：航班資料頁（使用者 1027A：圖一～圖五、KX12、今天的航線圖）══
#   ① 時刻兩個來源（實測明天 120 班：航班資料頁「SCHEDULED」與預估起飛都是 FLIGHTS 底表時刻，不是季節／加彈性後的實際時刻 ——
#     KX331 深圳→台北 頁面寫 12:35，實際 14:20；KX19 成田→台北 12:05，實際 13:30；同一頁上排「今日出發」卻是實際時刻）。
#     → matches7（航班資料頁、旅客資料卡共用）回傳季節時刻那一列；predict7 自己也先換成季節時刻，班表或人工延誤改了就重算（原本算過一次就一直用舊的）。
#   ② 預估起飛晚 15 分鐘以上不能寫「準時」：寫「延誤 +N 分」＋原因（人工／前段延誤的原因照寫；臨時換機寫「臨時更換飛機」；起飛站天候；其餘「航管流量管制」）。
#   ③ 查 KX12：完全相同的班號排第一個（原本照底表順序，KX120／KX122 會排在前面）。
RW('fd27 pred season',"function predict7(f,date,force){S.flightPredR7=S.flightPredR7||{};var k=opKey(f,date);if(S.flightPredR7[k]&&!force)return S.flightPredR7[k];",
   "function predict7(f,date,force){S.flightPredR7=S.flightPredR7||{};try{f=(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,date))||f}catch(_){}   /* 1026C：季節／加彈性後的實際時刻 */\n"
   "    var k=opKey(f,date),ov27=(S.flightOverrides||{})[f.code+'_'+date]||{},sg27=[f.dep,f.arr,ov27.status||'',ov27.dep||'',ov27.arr||'',ov27.reason||''].join('|');if(S.flightPredR7[k]&&!force&&S.flightPredR7[k].sigR1026C===sg27)return S.flightPredR7[k];")
RW('fd27 pred delay',"/* 1018A：人工標的轉降／取消不被預測蓋掉 */S.flightPredR7[k]=p;",
   "/* 1018A：人工標的轉降／取消不被預測蓋掉 */\n"
   "    p.sigR1026C=sg27;p.windR1026C=wd27;try{   /* 1026C：人工／前段延誤的時刻照用；晚 15 分鐘以上＝延誤＋原因 */\n"
   "      if(ov27.dep&&ov27.status==='Delayed'){p.estDep=ov27.dep;if(ov27.arr)p.estArr=ov27.arr;p.depDelta=mins(ov27.dep)+(+ov27.depDD||0)*1440-mins(f.dep)}\n"
   "      if(!/^(Diverted|Cancelled)$/.test(p.status)&&p.depDelta>=15){p.status='Delayed';var sub27=(S.acftSub||{})[f.code+'_'+date]||(S.acftSub||{})[f.code+'_'+date+'_'+f.fr+f.to];\n"
   "        p.reasonR1026C=(ov27.status==='Delayed'&&(ov27.reason||ov27.depRemark))||(sub27?(z()?'臨時更換飛機':'Aircraft change'):(a.impact>=7?(z()?('起飛站天候（'+({'Light rain':'降雨',Showers:'陣雨',Crosswind:'強側風'}[a.condition]||a.condition)+'）'):('Weather at origin ('+a.condition+')')):(z()?'航管流量管制':'ATC flow control')))}\n"
   "    }catch(_){}\n"
   "    S.flightPredR7[k]=p;")
RW('fd27 pred expose',"window.refreshDailyOpsR7=function(force){",
   "window.kgmOpsPredR1026C=function(f,d){try{return predict7(f,d)}catch(_){return null}};   /* 1026C：航班資料頁狀態用同一份預測 */\n  window.refreshDailyOpsR7=function(force){")
RW('fd27 matches season',"if(!ok)return false;var k=opKey(f,date);if(seen[k])return false;seen[k]=1;return true;});}",
   "if(!ok)return false;var k=opKey(f,date);if(seen[k])return false;seen[k]=1;return true;})\n"
   "    .map(function(f,i){var x=f;try{x=(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,date))||f}catch(_){}return [x,i,String(f.code).toUpperCase()===q?0:1]})   /* 1026C：季節時刻；班號完全相同的排第一 */\n"
   "    .sort(function(a,b){return a[2]-b[2]||a[1]-b[1]}).map(function(a){return a[0]});}")
_fd=open('js/fd25.js',encoding='utf-8').read()
RW('fd27 stat',_fd[_fd.index("  function stat(code,d){"):_fd.index("  function gate(code,d)")],
   """  function stat(code,d,f,long){var o=(S.flightOverrides||{})[code+'_'+d]||{},s=o.status||'Scheduled',why=o.reason||o.depRemark||'',dl=0;
    /* 1026C：預估起飛晚 15 分鐘以上不寫「準時」—— 跟下面 EST DEP 同一份預測（predict7），寫延誤＋原因（使用者：「你寫準時卻起飛時間延後兩小時？要寫原因」） */
    if(f&&window.kgmOpsPredR1026C&&!/^(Cancelled|Diverted|Departed)$/.test(s)){var p=window.kgmOpsPredR1026C(f,d);if(p&&p.status==='Delayed'){s='Delayed';why=p.reasonR1026C||why;dl=p.depDelta||0}}
    var m={Scheduled:['準時','On time','ok'],'On Time':['準時','On time','ok'],Delayed:['延誤','Delayed','warn'],Cancelled:['取消','Cancelled','bad'],Diverted:['轉降','Diverted','bad'],Departed:['已起飛','Departed','mut'],Boarding:['登機中','Boarding','ok'],'Time Change':['時間更改','Retimed','warn']}[s]||[s,s,'mut'];
    return '<i class="k25fd-st '+m[2]+'"'+(why?' title="'+E(why)+'"':'')+'>'+E(z()?m[0]:m[1])+(dl>0?' +'+dl+(z()?' 分':'m'):'')+'</i>'+(long&&why&&s!=='Scheduled'?'<small class="k27fd-why">'+E(why)+'</small>':'')}
""")
RW('fd27 stat row',"'</small>'+stat(f.code,d)+'<u>'","'</small>'+stat(f.code,d,f)+'<u>'")
RW('fd27 stat id',"'</dt><dd>'+stat(f.code,d)+'</dd>","'</dt><dd>'+stat(f.code,d,f,1)+'</dd>")

#   ④ 旅客名單「網路報到」：沒有網路報到的寫字（使用者：「圖二是Simulate的Data但是都要Fill In不能 -」）—— 到櫃檯報到過的寫「櫃檯報到」，其餘「未報到」。
RW('fd27 webci',"'<span title=\"'+(z()?'未網路報到':'Not checked in online')+'\" style=\"color:#C9C2B3\">—</span>'",
   "'<span title=\"'+(z()?'未網路報到':'Not checked in online')+'\" style=\"display:inline-block;padding:1px 7px;border-radius:999px;background:'+(x.physical?'#EEF3F8;color:#2F4F6B':'#F4F1EA;color:#8A7F68')+';font-weight:700;font-size:11px;white-space:nowrap\">'+(x.physical?(z()?'櫃檯報到':'At counter'):(z()?'未報到':'Not yet'))+'</span>'")

#   ⑤ 行李改運：同一類裡依票價方案由低到高（同一家族的各方案依票價比例），再依會員等級由低到高（非會員→Bronze→Silver→Gold→Diamond）（使用者圖三）。
RW('fd27 bm sort',"L.sort(function(a,b){return over?(a.r-b.r||b.kg-a.kg):(a.r-b.r||String(a.name).localeCompare(String(b.name)))});",
   "var TR27={Bronze:1,Silver:2,Gold:3,Platinum:4,Diamond:5,Black:6},fp27=function(b){var f=fareOf(b);return f&&isFinite(+f.pct)?+f.pct:9};   /* 1026C：票價方案低→高，再會員等級低→高 */\n"
   "    L.sort(function(a,b){return a.r-b.r||fp27(a)-fp27(b)||String(a.fare).localeCompare(String(b.fare))||(TR27[a.tier]||0)-(TR27[b.tier]||0)||(over?b.kg-a.kg:0)||String(a.name).localeCompare(String(b.name))});")


#   ⑦ 預估抵達＝預估起飛＋當天高空風（使用者：「航線圖要寫預估飛行時間，比班表多或少，要隨風向變化」）：
#     原本預估抵達跟預估起飛各自亂數（起飛晚 10 分、抵達卻早 7 分）。→ 抵達＝起飛的延誤＋當天風造成的飛行時間差（wind25 同一套風場沿實際航路算當季空中時間，
#     當天噴流強弱 ±20%）＋目的地天候等待＋航管進場流量 ±3 分。路線圖說明、EST ARR、航班資料 PDF 都讀這一份。
RW('fd27 pred wind',"var a=weather7(f.fr,date,f.dep),b=weather7(f.to,date,f.arr),dep=(H(k+'DEP')%13)-4+a.impact,arr=(H(k+'ARR')%19)-7+b.impact+(H(k+'FLOW')%7)-3,",
   "var a=weather7(f.fr,date,f.dep),b=weather7(f.to,date,f.arr),dep=(H(k+'DEP')%13)-4+a.impact,wd27=wind27(f,date,k),arr=dep+(wd27?wd27.diff:0)+Math.max(0,b.impact-2)+(H(k+'FLOW')%7)-3,   /* 1026C：抵達跟著起飛＋當天高空風 */")
RW('fd27 wind fn',"window.refreshDailyOpsR7=function(force){",
   "function wind27(f,date,k){try{   /* 1026C：當天高空風造成的飛行時間差（分鐘，正＝比班表慢） */\n"
   "    var G=window.kgmGeoR1025B,A=G&&G(f.fr),B=G&&G(f.to);if(!A||!B||!window.kgmAirMinR1025B||!window.kgmTasR1025B)return null;\n"
   "    var t='';try{t=acftOfFlight(f.code,date,f.fr,f.to)}catch(_){}if(!t||t==='EQV')t=f.acft&&f.acft!=='EQV'?f.acft:'B789';\n"
   "    var tas=window.kgmTasR1025B(t),win=false;try{win=window.kgmSeasonAtR112(date)==='winter'}catch(_){win=/-(1[12]|0[1-3])-/.test(date)}\n"
   "    var w=null;try{w=window.kgmWarRouteR1025B&&window.kgmWarRouteR1025B(f.fr,f.to)}catch(_){}\n"
   "    var km=w&&w.d1?w.d1:(function(){try{return +distOf(f.fr,f.to)||0}catch(_){return 0}})();if(km<300)return null;\n"
   "    var still=km*1.03/tas*60,sea=window.kgmAirMinR1025B([A].concat(w&&w.wp||[],[B]),tas,win),comp=sea-still,j=((H(k+'JET')%41)-20)/100,jit=((H(k+'JIT')%9)-4)/100*still*0.5;\n"
   "    var day=still+comp*(1+j)+jit;return {diff:Math.round(day-sea),air:Math.round(day),seaAir:Math.round(sea),comp:Math.round(comp),jet:j,type:t}}catch(_){return null}}\n"
   "  window.refreshDailyOpsR7=function(force){")

#   ⑧ 路線圖起飛前 48 小時才開放（使用者：「航線圖起飛前兩天才看得到」），開放後標題下寫預估飛行時間、比班表多／少幾分、當天高空風（跟 EST ARR 同一份預測）。
#     48 小時以前：卡片只寫「起飛前 48 小時開放（台北時間 幾月幾日 幾點起）」，不畫圖。
RW('fd27 map gate',"  function mapBox(card,c){var box=card.querySelector(':scope > .k25map');",
   """  function tzd27(a,d){try{if(window.kgmTzAtR1026C){var v=+window.kgmTzAtR1026C(a,d);if(isFinite(v))return v}}catch(_){}return tzh(a)}
  function depU27(f,d){var x=sea(f,d);return Date.parse(d+'T00:00:00Z')+(mn(x.dep||f.dep)-tzd27(f.fr,d)*60)*60000}
  function hm27(n){n=Math.round(Math.abs(n));return Math.floor(n/60)+(z()?' 小時 ':'h ')+String(n%60).padStart(2,'0')+(z()?' 分':'m')}
  function flyTxt27(c){try{var f=c.f,d=c.d,x=sea(f,d),p=window.kgmOpsPredR1026C&&window.kgmOpsPredR1026C(f,d);if(!p)return '';
    var blk=(mn(x.arr||f.arr)+(+(x.dd!=null?x.dd:f.dd)||0)*1440-tzd27(f.to,d)*60)-(mn(x.dep||f.dep)-tzd27(f.fr,d)*60),df=(p.arrDelta||0)-(p.depDelta||0),w=p.windR1026C;
    var wt=w?(Math.abs(w.comp)<8?(z()?'以側風為主':'mostly crosswind'):((w.comp<0?(z()?'順風':'tailwind'):(z()?'逆風':'headwind'))+(Math.abs(w.jet)<0.05?'':(w.jet>0?(z()?'，比季節平均強':', stronger than usual'):(z()?'，比季節平均弱':', weaker than usual'))))):'';
    return '<p class="k27fly"><b>'+(z()?'預估飛行時間 ':'Est. block ')+hm27(blk+df)+'</b><span class="'+(df>0?'up':df<0?'dn':'')+'">'+(df===0?(z()?'與班表相同':'same as schedule'):((z()?(df>0?'比班表多 ':'比班表少 '):(df>0?'+':'−'))+Math.abs(df)+(z()?' 分':' min')))+'</span>'
      +(wt?'<em>'+(z()?'當天高空風：':'Winds aloft: ')+wt+'</em>':'')+'<em>'+(z()?'班表 ':'Scheduled ')+hm27(blk)+(z()?'・預計 ':' · ETA ')+E(p.estArr)+(z()?' 抵達':'')+'</em></p>'}catch(_){return ''}}
  function mapBox(card,c){
    /* 1026C：起飛前 48 小時才開放航路圖 */
    var dU=depU27(c.f,c.d),lk=card.querySelector(':scope > .k27map-lock');
    if(isFinite(dU)&&dU-Date.now()>48*3600000){card.classList.add('k27locked');if(!lk){lk=document.createElement('div');lk.className='k27map-lock';card.insertBefore(lk,card.firstChild)}
      var o=new Date(dU-48*3600000+8*3600000),ls=c.f.code+'|'+c.d+'|'+(z()?'z':'e');
      if(lk.getAttribute('data-sig')!==ls){lk.setAttribute('data-sig',ls);lk.innerHTML='<div class="r7-kicker">FLIGHT PLAN ROUTE</div><h2>'+(z()?'飛行計畫航路':'Flight plan route')+'</h2><p>'+(z()?('起飛前 48 小時開放（台北時間 '+(o.getUTCMonth()+1)+' 月 '+o.getUTCDate()+' 日 '+String(o.getUTCHours()).padStart(2,'0')+':'+String(o.getUTCMinutes()).padStart(2,'0')+' 起）。屆時依當天高空風與關閉空域產生航路、預估飛行時間。'):('Opens 48 hours before departure ('+o.toISOString().slice(0,16).replace('T',' ')+' Taipei time), with the day\\'s winds aloft and closed airspace.'))+'</p>'}
      return}
    card.classList.remove('k27locked');if(lk)lk.remove();
    var box=card.querySelector(':scope > .k25map');""")
RW('fd27 map fly',"(z()?'這條航線不經過關閉空域，照大圓航線飛。':'This route does not cross closed airspace.'))+'</p>';",
   "(z()?'這條航線不經過關閉空域，照大圓航線飛。':'This route does not cross closed airspace.'))+'</p>'+flyTxt27(c);   /* 1026C：預估飛行時間 */")
RW('fd27 map css',"+'.k25map-hd{padding:20px 22px 14px}.k25map-hd p{margin:0!important}'",
   "+'.k25map-hd{padding:20px 22px 14px}.k25map-hd p{margin:0!important}'"
   "+'.k25map-hd .k27fly{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin-top:10px!important;padding:10px 14px;border-radius:12px;background:#F4F8F6;border:1px solid #E1EAE5;font-size:12.5px;color:#3d4944}'"
   "+'.k27fly b{font:700 15px/1.3 system-ui,sans-serif;color:#0B3D2E}.k27fly span{font-weight:700;padding:2px 9px;border-radius:999px;background:#E5F1EC;color:#0B493B}.k27fly span.up{background:#FFF3DC;color:#8A5A12}.k27fly em{font-style:normal;color:#66726C}'"
   "+'.k27locked > :not(.k27map-lock){display:none!important}.k27map-lock{padding:4px 0}.k27map-lock p{margin:6px 0 0!important;color:#66726C;font-size:13px}'"
   "+'#app main.k25fd-main section.r7-manifest[data-k23fd]{padding-top:0!important}#app main.k25fd-main section.r7-manifest[data-k23fd] > .k25fd-sechd{padding-top:18px}'   /* 1026C：旅客名單捲動時表頭上方 16px 空隙會露出上一列（半列） */")
#   ⑨ 離開再進入／開一個航班就「網頁沒有回應」（使用者：「每次跳出去再回去都會套圖四這種」）：實測開 KX180（今天）主執行緒一次卡 7.4～9.4 秒（1026B 也一樣 6.6 秒）。
#     CPU 剖析：6.3 秒在旅客名單的 DH 組員列（dhRows929 → crewOnFlight）—— 那一天的組員班表背景還沒算到，就在畫面上同步算（CLAUDE.md：不要同步算還沒算好的一天）；
#     1.4 秒在行李改運的「改到哪一班」下拉選單，替 3 天內 8 個候選航班各算一次 Payload（每個都要建艙單）。
#     → DH：那天還沒算好就先不列，交給背景一小段一小段算（kgmCrewStepR121，跟組員班表分頁同一套，結果一樣），算好自動重畫（正在輸入時不重畫）；
#       候選航班的 Payload 餘量只在「行李改運」或「全部」分頁算（其他分頁看不到這個下拉選單）。
RW('fd27 dh later',"    if(!(o[key]&&o[key].length)&&!DHDATE929[date]&&!(ws7&&date<ws7)&&!(window.KGM_NODH_R1023A&&!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(date)))){DHDATE929[date]=1;",
   "    if(!(o[key]&&o[key].length)&&!DHDATE929[date]&&!(ws7&&date<ws7)&&window.kgmCrewHasDayR121&&window.kgmCrewStepR121&&!window.kgmCrewHasDayR121(date)){dhLater929(date);return []}   /* 1026C：那天的組員班表還沒算好 → 背景算，不在畫面上同步算 */\n"
   "    if(!(o[key]&&o[key].length)&&!DHDATE929[date]&&!(ws7&&date<ws7)&&!(window.KGM_NODH_R1023A&&!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(date)))){DHDATE929[date]=1;")
RW('fd27 dh later fn',"  var DHDATE929={};",
   "  var DHDATE929={},DHLATER929={};\n"
   "  function dhLater929(date){if(DHLATER929[date])return;DHLATER929[date]=1;var n=0;   /* 1026C：一小段一小段算到那一天，算好重畫航班資料頁 */\n"
   "    setTimeout(function go(){n++;try{if(window.kgmCrewHasDayR121(date)){DHLATER929[date]=0;var a=document.activeElement;\n"
   "        if(S.view==='admin'&&S.adminTab==='flightdata'&&String(S.opsSelectedR7||'').split('|')[1]===date&&!(a&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)))try{render()}catch(_){}return}\n"
   "      var cu=window.kgmCrewWarmProgressR923&&window.kgmCrewWarmProgressR923();if(cu&&cu>=date){DHLATER929[date]=0;DHDATE929[date]=1;return}   /* 游標已經過了那天（快取被清過）：不再同步重算，那天先不列 DH */\n"
   "      if(window.KGM_FULLDONE_1006A)window.kgmCrewStepR121(120,date)}catch(_){DHLATER929[date]=0;return}\n"
   "      if(n<3000)setTimeout(go,window.KGM_FULLDONE_1006A?900:2000);else DHLATER929[date]=0},3000)}   /* 先讓航班頁（含路線圖）畫完再算 */")
RW('fd27 bm lazy payload',"var tsel='<select class=\"inp\" onchange=\"kgmBagToR1023A(this.value)\">'+tg.map(function(x){var p2=null;try{p2=window.kgmPayloadR1023A(x.code,x.date,f.fr,f.to)}catch(_){}",
   "var lz27=S.view==='admin'&&S.adminTab==='flightdata'&&!/^(bm|all)$/.test(S.fdTabR1025B||'');   /* 1026C：候選航班的 Payload 只在看得到下拉選單的分頁算 */\n"
   "    var tsel='<select class=\"inp\" onchange=\"kgmBagToR1023A(this.value)\">'+tg.map(function(x){var p2=null;if(!lz27)try{p2=window.kgmPayloadR1023A(x.code,x.date,f.fr,f.to)}catch(_){}")
RW('fd27 dh warm wait',"""    (function step(){
      var until=Date.now()+40;
      while(i<crew.length&&Date.now()<until){try{window.kgmCrewChainR210(crew[i].empId,t0,n)}catch(_){}i++}""",
   """    var w27=0;setTimeout(function step(){   /* 1026C：第一段也放到空檔做；那天的組員班表還沒算好就先等背景算（組員鏈會在畫面上同步算那一天，實測一段卡 0.4～1 秒） */
      if(window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(date)&&w27++<200){setTimeout(step,1500);return}
      var until=Date.now()+40;
      while(i<crew.length&&Date.now()<until){try{window.kgmCrewChainR210(crew[i].empId,t0,n)}catch(_){}i++}""")
RW('fd27 dh warm wait end',"""      try{if(S.view==='admin'&&/flightdata|stxstatus/.test(String(S.adminTab||'')))render()}catch(_){}
    })();""","""      try{if(S.view==='admin'&&/flightdata|stxstatus/.test(String(S.adminTab||'')))render()}catch(_){}
    },0);""")
#   ⑩ 今天的航班「看不到航線圖」：實測開航班後 6.5～12 秒圖才出來。根因：航班資料頁每 0.5 秒（還有每次 DOM 變動）重整一次版面，每次都叫一次畫圖，
#     圖還沒畫好（快取還沒有）就再排一張 —— 同一張圖排了十幾次、每次約 1 秒。→ 同一張圖正在畫就不再排（畫好放進快取，下一次直接用）。
RW('fd27 map dedupe',"    if(CACHE[key]){put(CACHE[key]);return}\n    var go=function(){tex(function(){if(!TEX)return;",
   "    if(CACHE[key]){put(CACHE[key]);return}\n    if(PEND27[key]){PEND27[key]=el;return}PEND27[key]=el;   /* 1026C：同一張圖正在畫就不再排（原本每 0.5 秒排一張，實測 6～12 秒才出圖） */\n    var go=function(){tex(function(){var el2=PEND27[key];delete PEND27[key];if(el2&&el2!==el&&el2.isConnected)el=el2;if(!TEX)return;")
RW('fd27 map dedupe var',"  var CACHE={},CN=0;","  var CACHE={},CN=0,PEND27={};")
RW('fd27 map soon',"    if(window.requestIdleCallback)window.requestIdleCallback(go,{timeout:600});else setTimeout(go,30)};\n  window.kgmRouteMapLegendR1025B",
   "    setTimeout(go,0)};   /* 1026C：不等空檔（開頁後背景一直在算組員班表，等空檔要好幾秒） */\n  window.kgmRouteMapLegendR1025B")
# ══ 11：「關閉空域（避戰航路）」改成「航班營運」底下的新分頁＋人工調整 Payload（使用者 1027A；js/zn27.js）══
#   原本 zn26 面板掛在「航線管理」（flightadjust）最上面 → 整塊搬到新分頁 airspace27（同一份程式；航線管理不再顯示），下面加 Payload 限座人工調整。
RW('as27 zn26 tab',"  function mount(){try{if(!(S.view==='admin'&&S.adminTab==='flightadjust'))return;var m=document.querySelector('#app main')||document.getElementById('app');if(!m)return;\n      var el=document.getElementById('k26zones');if(!el||!m.contains(el)){el=document.createElement('div');el.id='k26zones';m.insertBefore(el,m.firstChild);paint()}",
   "  window.kgmZoneHtmlR1026C=function(){try{work()}catch(_){}return html()};   /* 1026C：新分頁直接畫（不等計時器） */\n"
   "  function mount(){try{if(!(S.view==='admin'&&S.adminTab==='airspace27'))return;var m=document.querySelector('#app main')||document.getElementById('app');if(!m)return;   /* 1026C：搬到「關閉空域・Payload」分頁 */\n"
   "      var el=document.getElementById('k26zones');if(!el||!m.contains(el)){el=document.createElement('div');el.id='k26zones';m.insertBefore(el,m.firstChild);paint()}else if(!el.firstChild)paint()")
RW('as27 nav',"['flightadjust','航線管理']]],/* 0913A","['flightadjust','航線管理'],['airspace27','關閉空域・Payload']]],/* 1026C */ /* 0913A")
RW('as27 perm tabs',"    ['groundops','登機門／櫃檯'],['flightadjust','航線管理']]],\n","    ['groundops','登機門／櫃檯'],['flightadjust','航線管理'],['airspace27','關閉空域・Payload']]],   /* 1026C */\n")
RW('as27 perm def',"flightdata:'use',groundops:'use',flightadjust:'use',bookings:'use',groups23:'use',","flightdata:'use',groundops:'use',flightadjust:'use',airspace27:'use',bookings:'use',groups23:'use',")
RW('as27 order',"var ORDER7=['status','flightdata','groundops','bookings','groups23','cases0831B','cases0831C','flightadjust',","var ORDER7=['status','flightdata','groundops','bookings','groups23','cases0831B','cases0831C','flightadjust','airspace27',")
RW('as27 body',"else if(tab==='groups23')body=","else if(tab==='airspace27')body=(typeof window.kgmAirspacePageR1026C==='function'?window.kgmAirspacePageR1026C():'');   /* 1026C：關閉空域・Payload */else if(tab==='groups23')body=")
# ══ 12：後台真人客服（AI 對話查詢分頁上方，r229 1006A k6cs）——要先「接手」才能回覆（使用者：「客服要先接手才可以回覆」）══
#   原本等待中的對話直接打字送出也算接手、別人處理中的對話也能插話、AI 回覆誰都能改 → 兩位客服同時回同一位旅客。
#   → 回覆框、修改 AI 回覆只給「處理中、而且是自己接手」的人；等待中顯示「請先接手」，別人處理中顯示「由誰處理中」＋「改由我接手」；送出的程式也擋。
_cs27=open('cs27seg.txt',encoding='utf-8').read()
RW('cs27 reply gate',_cs27,
   "+((sel.status!=='closed'&&!(sel.status==='active'&&sel.agent===me().id))?'<div class=\"k6cs-lock\"><span>'+(sel.status==='waiting'?(z()?'請先按「接手」才能回覆（避免兩位客服同時回覆同一位旅客）。':'Take this chat before replying.'):(z()?'這個對話由 '+E(sel.agentName||sel.agent||'')+' 處理中；要回覆請先改由你接手。':'Handled by '+E(sel.agentName||sel.agent||'')+'.'))+'</span><button class=\"p\" onclick=\"kgmCsTakeR1006A(\\''+A(sel.id)+'\\')\">'+(sel.status==='waiting'?(z()?'接手':'Take'):(z()?'改由我接手':'Take over'))+'</button></div>':"+_cs27[1:]+")   /* 1026C：先接手才能回覆 */")
RW('cs27 take btn',"(sel.status==='waiting'?'<button class=\"p\" onclick=\"kgmCsTakeR1006A(\\''+A(sel.id)+'\\')\">'+(z()?'接手':'Take')+'</button>':'')",
   "((sel.status==='waiting'||(sel.status==='active'&&sel.agent!==me().id))?'<button class=\"p\" onclick=\"kgmCsTakeR1006A(\\''+A(sel.id)+'\\')\">'+(sel.status==='waiting'?(z()?'接手':'Take'):(z()?'改由我接手':'Take over'))+'</button>':'')")
RW('cs27 edit gate',"var tool=(m.role==='ai'||m.role==='agent')&&sel.status!=='closed'&&ed!==m.id?",
   "var tool=(m.role==='ai'||m.role==='agent')&&sel.status==='active'&&sel.agent===me().id&&ed!==m.id?")
RW('cs27 send gate',"    if(it.status==='waiting'){it.status='active';it.agent=m.id;it.agentName=m.name;it.takenAt=now()}\n    it.msgs.push({id:nid('M'),role:'agent'",
   "    if(!(it.status==='active'&&it.agent===m.id)){alert(z()?'請先按「接手」才能回覆。':'Take the chat before replying.');return}   /* 1026C */\n    it.msgs.push({id:nid('M'),role:'agent'")
RW('cs27 css',"'.k6cs{background:#fff;border:1px solid #e9e4d8;",
   "'.k6cs-lock{display:flex;align-items:center;gap:12px;justify-content:space-between;margin:0;padding:14px 16px;border-top:1px solid #EFE9DC;background:#FBF8F1;font-size:13px;color:#6B5A2E}.k6cs-lock button{flex:none}'   /* 1026C */\n    +'.k6cs{background:#fff;border:1px solid #e9e4d8;")
# ══ 13：旅客回饋分析重整（使用者：「旅客回饋分析很亂」）—— r49 feedback49 換成 js/fb27.js（同一份資料、Excel、30 天規則；組員表揚與申訴照舊在最上面）══
_fbi=CUR.index('function feedback49(){');_fbj=CUR.index('\n\n/* 9. Visible seasonal',_fbi)
RW('fb27 page',CUR[_fbi:_fbj],JS('fb27.js').strip('\n'))
# ══ 14：後台打字打到一半被洗掉（實測通知管理：輸入公告 1.5 秒後文字不見，1026B 一樣）——開頁第一分鐘內三個背景「補模擬資料」計時器補完會 render() 整頁，
#   不管現在在哪一頁、有沒有在打字。→ 改成正在輸入（焦點在輸入框）就晚一點再畫（kgmSafeRenderR1026C）。
RW('safe render fn',"window.kgmCsMountR1006A=mount;","window.kgmCsMountR1006A=mount;\n  window.kgmSafeRenderR1026C=function(){var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.closest&&a.closest('#app')){setTimeout(window.kgmSafeRenderR1026C,1500);return}try{render()}catch(_){}};   /* 1026C：背景補資料不洗掉正在打的字 */")
RW('safe render refund',"if(window.kgmRefundSimSeedR1010A()){try{render()}catch(_){}}return}","if(window.kgmRefundSimSeedR1010A()){try{(window.kgmSafeRenderR1026C||render)()}catch(_){}}return}")
RW('safe render card',"if(cardSim()){try{render()}catch(_){}return}","if(cardSim()){try{(window.kgmSafeRenderR1026C||render)()}catch(_){}return}")
RW('safe render case',"if(caseSim22(0,false)){try{render()}catch(_){}return}","if(caseSim22(0,false)){try{(window.kgmSafeRenderR1026C||render)()}catch(_){}return}")
#   ⑥ 旅客資料卡（PASSENGER & MEMBER RECORD）沒有分頁標記、哪一頁都看得到 → 換到別的分頁就關掉（使用者圖五）。
RW('fd27 pax close',"S.fdTabR1025B=b.getAttribute('data-t')||b.getAttribute('data-go');apply();",
   "var nt27=b.getAttribute('data-t')||b.getAttribute('data-go'),rr27=(S.opsPassengerR7&&nt27!==S.fdTabR1025B)||(/^(bm|all)$/.test(nt27)&&!/^(bm|all)$/.test(S.fdTabR1025B||''));if(S.opsPassengerR7&&nt27!==S.fdTabR1025B)S.opsPassengerR7=null;S.fdTabR1025B=nt27;if(rr27){try{render()}catch(_){}}else apply();   /* 1026C：換分頁關掉旅客資料卡；到行李改運才算候選航班 Payload */")
RW('fd27 why css',"+'.k25fd-id .k25fd-st{font-family:system-ui,sans-serif;font-size:11px;padding:2px 9px}'",
   "+'.k25fd-id .k25fd-st{font-family:system-ui,sans-serif;font-size:11px;padding:2px 9px}'+'.k27fd-why{display:block;margin-top:3px;font:500 11px/1.3 system-ui,sans-serif;color:#F3D99A;white-space:nowrap}'   /* 1026C：延誤原因 */")

open('p_h_r27.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
