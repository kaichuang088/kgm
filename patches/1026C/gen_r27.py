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
RW('sc27 embed',_zn,_zn+JS('sc27.js')+JS('ch27.js'))

# ══ 1b：航班動態等畫面的 UTC 換算（_utcOf）也用依日期的時差（航班動態卡片寫的飛行時間、抵達日期）══
RW('utcOf dst',"return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tzMin(ap))*60000;",
   "var _tz27=_tzMin(ap);try{if(window.kgmTzAtR1026C)_tz27=Math.round(window.kgmTzAtR1026C(ap,String(dateISO).slice(0,10))*60)}catch(_){}   /* 1026C：夏令時間 */\n  return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tz27)*60000;")

# ══ 4：販售通路（js/ch27.js）：夥伴營運一般訂票配額、只開放包機／只開放旅客訂購 —— sell54 最前面問（在團體之前：只開放旅客訂購的班團體也不能訂）══
RC('sell54 channel','kgm-0823c-r54',"  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}",
   "  if(window.kgmChannelSellR1026C){var c27=window.kgmChannelSellR1026C(code,date,flight);if(c27!=null)return c27}   /* 1026C：販售通路 */\n  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}")
RW('sales S init','warZonesR1026B:LS.get("kgm26_zones",null),','warZonesR1026B:LS.get("kgm26_zones",null),salesModeR1026C:LS.get("kgm27_salesmode",null),charterReqsR1026C:LS.get("kgm27_charter",[]),dhSigR1026C:LS.get("kgm27_dhsig",{}),')
RW('sales save','LS.set("kgm26_zones",S.warZonesR1026B||null);','LS.set("kgm26_zones",S.warZonesR1026B||null);LS.set("kgm27_salesmode",S.salesModeR1026C||null);LS.set("kgm27_charter",S.charterReqsR1026C||[]);LS.set("kgm27_dhsig",S.dhSigR1026C||{});')

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
open('p_h_r27.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
