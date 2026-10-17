from common import *
import json
# ══ 1015A ═══════════════════════════════════════════════════════════════════
#   使用者（1014A 交付後）：
#   「瀏覽器儲存空間已滿　剛才的修改（單日航班調整、組員排班（各分頁自己算）、票價調整、座位庫存）沒有存進瀏覽器…
#     我的一進去還是有顯示這個欸」
#   「（後台開著的時候，偶爾會整個卡住 10～20 秒…）把這個改完吧 1015A」
#   逐項見 notes/1015A-pass119-notes.md。
#   比對基準：1014A 最終版 w8（/tmp/j/kgm1014A_w8.html，由 patches/1014A/build.sh 重建，跟交付檔逐位元相同）。
#   不要改到版號字串（build.sh 最後才換版號）。
CUR=open('/tmp/j/kgm1014A_w8.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
R229='kgm-0909E-r229'
R72='kgm-0823o-r72'
EMB="    window.kgmCrewUpdateR928=function(){"

# ── 1. 整年機隊重排卡住畫面 ─────────────────────────────────────────────────────────────
#   CPU 剖析（prof15.js／prof15t.js，1014A w8 開頁 42～67 秒）：整年重排 7.3 秒，其中 kgmFixSplitR929 5.1 秒，
#   再往下是 1012A 的「多飛不同地方」kgmVarietyR1012A 4.0 秒：每換一次（整串互換）就把兩架飛機互換點以後的
#   全部航段（各約上千段）逐段重設所屬飛機、逐段組一次換機紀錄的鍵字串（只為了找少數幾段有換機紀錄的），
#   換幾百次就是幾十萬次字串組合。結果不變的改法：
#   · 只有「接點的最後一段」需要查所屬飛機、只有「有換機紀錄的航段」需要跟著改紀錄 → 開頭各掃一次記下來，
#     互換時只更新這兩種航段（換機紀錄的規則一樣：紀錄指向原本那架才跟著換）。
RC('variety interesting legs',R72,
   "  stat.junctions=J.length;J.forEach(function(j){if(rep(j.prev,j.nxt))stat.before++});\n",
   "  stat.junctions=J.length;J.forEach(function(j){if(rep(j.prev,j.nxt))stat.before++});\n"
   "  /* 1015A：互換時只需要更新兩種航段 —— 接點的最後一段（要查所屬飛機）、有換機紀錄的航段（紀錄跟著飛機走）；開頭各記一次 */\n"
   "  var INT15=new Set(),SUBK15=new Map(),SUB15=S.acftSub||{};J.forEach(function(j){INT15.add(j.last)});\n"
   "  try{Object.keys(seq).forEach(function(tl){var L=seq[tl];for(var i=0;i<L.length;i++){var q=L[i],k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB15[k]&&SUB15[k].tail){SUBK15.set(q,k);INT15.add(q)}}})}catch(_){}\n")
RC('variety swap fast',R72,
   "      toA.forEach(function(q){owner.set(q,ta)});toB.forEach(function(q){owner.set(q,tb2)});\n      try{var SUB=S.acftSub||{};toA.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===tb2)SUB[k].tail=ta});\n        toB.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===ta)SUB[k].tail=tb2})}catch(_){}\n",
   "      /* 1015A：只更新接點最後一段與有換機紀錄的航段（原本每一段都重設、每一段都組一次鍵字串，整年重排卡 3 秒以上） */\n"
   "      for(var q15=0;q15<toA.length;q15++){var x15=toA[q15];if(!INT15.has(x15))continue;owner.set(x15,ta);var k15=SUBK15.get(x15);if(k15&&SUB15[k15]&&SUB15[k15].tail===tb2)SUB15[k15].tail=ta}\n"
   "      for(var r15=0;r15<toB.length;r15++){var y15=toB[r15];if(!INT15.has(y15))continue;owner.set(y15,tb2);var m15=SUBK15.get(y15);if(m15&&SUB15[m15]&&SUB15[m15].tail===ta)SUB15[m15].tail=tb2}\n")

#   · 外站對號回程 kgmPairReturnR1004B：每換一次就把全機隊 11 萬多段的位置表整份重建一次（where()），
#     換機紀錄也是每段組一次鍵字串 → 只更新被換的兩架、換機紀錄用開頭記下的對照表。結果不變。
RC('pairret sub index',R72,
   "  var pos=new Map();\n  function where(){pos=new Map();Object.keys(seq).forEach(function(tl){seq[tl].forEach(function(x,i){pos.set(x,[tl,i])})})}\n",
   "  var pos=new Map();\n  function where(){pos=new Map();Object.keys(seq).forEach(function(tl){seq[tl].forEach(function(x,i){pos.set(x,[tl,i])})})}\n"
   "  /* 1015A：換完只重排被換的那兩架的位置（原本整個機隊重建，換幾百次就卡好幾秒）；換機紀錄用開頭記下的對照表 */\n"
   "  function where15(tl,from){var L=seq[tl];for(var i=Math.max(0,from);i<L.length;i++)pos.set(L[i],[tl,i])}\n"
   "  var SUB15=S.acftSub||{},SUBK15=new Map();try{Object.keys(seq).forEach(function(tl){var L=seq[tl];for(var i=0;i<L.length;i++){var q=L[i],k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB15[k]&&SUB15[k].tail)SUBK15.set(q,k)}})}catch(_){}\n")
RC('pairret swap fast',R72,
   "      try{var SUB=S.acftSub||{};toA.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===tb)SUB[k].tail=ta});\n        toB.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===ta)SUB[k].tail=tb})}catch(_){}\n      changed++;stat.swapped++;where();\n",
   "      if(SUBK15.size){for(var q15=0;q15<toA.length;q15++){var k15=SUBK15.get(toA[q15]);if(k15&&SUB15[k15]&&SUB15[k15].tail===tb)SUB15[k15].tail=ta}\n"
   "        for(var r15=0;r15<toB.length;r15++){var m15=SUBK15.get(toB[r15]);if(m15&&SUB15[m15]&&SUB15[m15].tail===ta)SUB15[m15].tail=tb}}\n"
   "      changed++;stat.swapped++;where15(ta,i+1);where15(tb,j);   /* 1015A */\n")

# ── 2. 組員班表頁的「組員位置接續」小卡（r149 paint149，每 2.8 秒）會同步呼叫 kgmCrewPlanR121(date)：
#      機隊重排剛把組員計畫清掉時，這一呼叫就在畫面上整天重算（實測 6 秒）。當天還沒算好就先不畫，等背景算好再畫。
RC('paint149 wait ready','kgm-0907a-r149',
   "  var plan=null;try{plan=window.kgmCrewPlanR121(date)}catch(_){return 0}\n  var c=plan&&plan.continuityR149;",
   "  try{if(window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(date))return 0}catch(_){}   /* 1015A：那一天還沒算好就不在這裡同步算（實測卡 6 秒），背景算好後下一輪再畫 */\n"
   "  var plan=null;try{plan=window.kgmCrewPlanR121(date)}catch(_){return 0}\n  var c=plan&&plan.continuityR149;")

#   · DH 自動騰位（r7 scan7，開頁 75 秒後、之後每 10 分鐘）：逐班叫 manifest7 → crewOnFlight → kgmCrewPlanR121，
#     那一天的組員計畫還沒算好（機隊重排剛清掉）就在這裡同步整天重算（實測 4.5 秒）→ 先等背景算好（最多等 2 分鐘，之後照常做）。
RC('dh scan wait crew day','kgm-r7-admin-ops',
   "      var i=0;(function step(){if(i>=list.length)return;if(busy7()){setTimeout(step,15000);return}try{window.kgmDhBumpR1007A(list[i][0],list[i][1])}catch(_){}i++;setTimeout(step,120)})();",
   "      var i=0,w15=0;(function step(){if(i>=list.length)return;if(busy7()){setTimeout(step,15000);return}\n"
   "        try{if(w15<8&&window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(list[i][1])){w15++;setTimeout(step,15000);return}}catch(_){}   /* 1015A：那一天組員計畫還沒算好就先等背景算（不在這裡同步算、實測卡 4.5 秒），最多等 2 分鐘 */\n"
   "        w15=0;try{window.kgmDhBumpR1007A(list[i][0],list[i][1])}catch(_){}i++;setTimeout(step,120)})();")

#   · 整年重排「先分段準備、最後一次組合」（r913 finish6）：準備期間輸入的指紋變了就重新準備（最多 3 次），
#     3 次都變就在主執行緒上整年硬算（實測一次 16 秒，就是使用者遇到的卡 10～20 秒）。
#     sig15.js 實測：指紋會變，全是因為 S.acftSub 裡「自動產生的換機紀錄」（auto0810J 等）在背景被別的作業改寫 ——
#     而排班本身根本不讀這些（planSub10 只留人工換機與維修改派）。指紋改成只看排班真的會讀的那一份。
RC('sig72 plan inputs only',R72,
   "  return JSON.stringify([st,dy,T(),S.acftSub||{},S.tailStatus||{},",
   "  return JSON.stringify([st,dy,T(),planSub10(S.acftSub||{}),S.tailStatus||{},   /* 1015A：只看排班會讀的換機紀錄（人工／維修）；自動紀錄在背景被改寫會讓分段準備白做、最後整年硬算 16 秒 */")

#   · 最後那一次整年組合（finish6）把第五航權拆機收尾（含外站對號回程、多飛不同地方）也包在同一個工作裡，合計 4.5 秒。
#     拆成兩個工作：先組合（約 2.3 秒），讓出主執行緒，再做拆機收尾（約 2 秒）。做完收尾之前「背景重排中」旗標不放。
RC('defer split in final',R72,
   "  try{sum.splitFix929=window.kgmFixSplitR929()}catch(e929){try{console.warn('1004A split fix',e929)}catch(_){}}",
   "  if(window.KGM_DEFER_SPLIT_R1015A)sum.splitFix929={deferredR1015A:1};   /* 1015A：最後那一次整年組合時，拆機收尾改成下一個工作再做（不跟組合擠在同一個卡住畫面的工作裡） */\n"
   "  else try{sum.splitFix929=window.kgmFixSplitR929()}catch(e929){try{console.warn('1004A split fix',e929)}catch(_){}}")
RC('final run split task',R72,
   "      try{window.kgmRebuildFleetR72(T(),366,true)}catch(e){try{console.warn('r913 final rotation',e)}catch(_){}}\n      window.KGM_KEEP72_1006A=null;window.KGM_FINALRUN_1006A=false;\n      window.KGM_ROT_FINAL_MS_R913=Date.now()-t0;\n      setTimeout(function(){\n        try{if(window.kgmPairReturnR1004B)window.kgmPairReturnR1004B()}catch(_){}   /* 1004B：外站對號回程配對 */",
   "      window.KGM_DEFER_SPLIT_R1015A=true;\n"
   "      try{window.kgmRebuildFleetR72(T(),366,true)}catch(e){try{console.warn('r913 final rotation',e)}catch(_){}}\n"
   "      window.KGM_DEFER_SPLIT_R1015A=false;window.KGM_KEEP72_1006A=null;\n      window.KGM_ROT_FINAL_MS_R913=Date.now()-t0;\n"
   "      setTimeout(function(){\n"
   "        var t15=Date.now();try{var sp15=window.kgmFixSplitR929();if(window.KGM_ROT_SUM_R72)window.KGM_ROT_SUM_R72.splitFix929=sp15}catch(e15){try{console.warn('1015A split fix',e15)}catch(_){}}   /* 1015A：拆機收尾（含外站對號回程、多飛不同地方）自己一個工作 */\n"
   "        window.KGM_SPLIT_MS_R1015A=Date.now()-t15;window.KGM_FINALRUN_1006A=false;\n"
   "      setTimeout(function(){\n"
   "        try{if(window.kgmPairReturnR1004B)window.kgmPairReturnR1004B()}catch(_){}   /* 1004B：外站對號回程配對 */")

RC('final run split task close',R72,
   "          try{render()}catch(_){}\n        },0);\n      },0);\n    }\n    next6(prep6);",
   "          try{render()}catch(_){}\n        },0);\n      },0);\n      },0);   /* 1015A：拆機收尾那一層 */\n    }\n    next6(prep6);")

# ── 3. 「瀏覽器儲存空間已滿」一進去就跳 ───────────────────────────────────────────────────────
#   1014A 只在開頁 20 秒後、或票價紀錄超過上限才整理；使用者的儲存區一開頁就滿，開頁那幾次存檔就失敗 → 提示。
#   我這邊模擬（full15.js：用 1014A 存滿 → 同一個瀏覽器再開）沒有重現，表示使用者的儲存區還有我看不到、縮不下來的資料。
#   所以改成通用的作法：任何一份「空間滿了存不進去」→ 先清掉網站自己算得回來的資料、再重寫同一份；還是不行才顯示提示。
#   能清的（都是網站自己會重新算出來的，清掉不會少任何旅客／員工資料）：
#     1. 票價庫存自動紀錄（kgm7_fare3／kgm_seatinv6 裡的自動部分，兩份一起；人工設定的不動）
#     2. 組員排班快取 kgm_crewsched（「各分頁自己算」；這次開頁先不再寫入，關掉重開會自己再算）
#     3. 模擬競標出價（demoR922）超出近期範圍的（BigDeal 起飛前 1 天～8 天、Residence 前 1 天～15 天以外；查詢時同一組種子會再補出）
#     4. 還是不夠：模擬競標出價全部（同上，查詢時補回）。旅客真的出價永遠不動。
RW('ls evict on quota',
   "  kgmLsFailR1012A=window.kgmLsFailR1012A=function(k,e,s){\n    var F=window.KGM_LS_FAIL_R1012A=window.KGM_LS_FAIL_R1012A||{n:0,keys:{}};",
   "  /* 1015A：空間滿 → 先清掉網站自己算得回來的資料、重寫同一份；還是存不進去才顯示提示 */\n"
   "  var EV15=false;\n"
   "  function td15(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}\n"
   "  function ad15(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}\n"
   "  function put15(k,v){try{var x=typeof kgmLsStrR1012A==='function'?kgmLsStrR1012A(k,v):JSON.stringify(v);localStorage.setItem(k,x);try{if(window._ls8last)window._ls8last[k]=x}catch(_){}return true}catch(_){return false}}\n"
   "  function len15(k){try{return (localStorage.getItem(k)||'').length}catch(_){return 0}}\n"
   "  var STEPS15=[\n"
   "    function(){var ft=S.fareThirds0810P,si=S.seatInventory;if(!ft||typeof ft!=='object')return 0;var b=len15('kgm7_fare3')+len15('kgm_seatinv6'),n=0;\n"
   "      Object.keys(ft).forEach(function(x){delete ft[x];if(si&&(x in si))delete si[x];n++});if(!n)return 0;put15('kgm7_fare3',ft);if(si)put15('kgm_seatinv6',si);return Math.max(0,b-len15('kgm7_fare3')-len15('kgm_seatinv6'))},\n"
   "    function(){var b=len15('kgm_crewsched');window.KGM_LS_NOCS_R1015A=1;if(!b)return 0;try{localStorage.removeItem('kgm_crewsched')}catch(_){}return b},\n"
   "    function(){var t=td15(),lo=ad15(t,-1),h1=ad15(t,8),h2=ad15(t,15),f=0;\n"
   "      [['bigDeals','kgmbd4',h1],['residenceBidsR83','kgm_resbid6',h2],['resMileBidsR161','kgm_resmile6',h2]].forEach(function(z){var a=S[z[0]];if(!Array.isArray(a))return;\n"
   "        var keep=a.filter(function(x){return !(x&&x.demoR922&&x.date&&(x.date<lo||x.date>z[2]))});if(keep.length===a.length)return;var b=len15(z[1]);S[z[0]]=keep;put15(z[1],keep);f+=Math.max(0,b-len15(z[1]))});return f},\n"
   "    function(){var f=0;[['bigDeals','kgmbd4'],['residenceBidsR83','kgm_resbid6'],['resMileBidsR161','kgm_resmile6']].forEach(function(z){var a=S[z[0]];if(!Array.isArray(a))return;\n"
   "        var keep=a.filter(function(x){return !(x&&x.demoR922)});if(keep.length===a.length)return;var b=len15(z[1]);S[z[0]]=keep;put15(z[1],keep);f+=Math.max(0,b-len15(z[1]))});\n"
   "      try{window.KGM_BD_SEEN_R929={}}catch(_){}return f}\n"
   "  ];\n"
   "  /* 回傳 true＝清完之後這一份寫進去了 */\n"
   "  function evict15(k,s){\n"
   "    if(EV15)return false;EV15=true;var ok=false,E=window.KGM_LS_EVICT_R1015A=window.KGM_LS_EVICT_R1015A||{n:0,freed:0,steps:[],keys:[]};E.n++;E.at=new Date().toISOString();if(E.keys.indexOf(k)<0)E.keys.push(k);\n"
   "    try{for(var i=0;i<STEPS15.length&&!ok;i++){var fr=0;try{fr=STEPS15[i]()||0}catch(_){}if(fr){E.freed+=fr;E.steps.push(i+1)}\n"
   "        if(s!=null){try{localStorage.setItem(k,s);ok=true;try{if(window._ls8last)window._ls8last[k]=s}catch(_){}}catch(_){}}}}\n"
   "    finally{EV15=false}\n"
   "    return ok;\n"
   "  }\n"
   "  window.kgmLsEvictR1015A=function(){return evict15('',null)};\n"
   "  kgmLsFailR1012A=window.kgmLsFailR1012A=function(k,e,s){\n"
   "    if(isQuota(e)&&evict15(k,s)){try{if(window.KGM_LS_FAIL_R1012A)kgmLsOkR1012A(k)}catch(_){}return}   /* 1015A：清完寫進去了 → 不提示 */\n"
   "    var F=window.KGM_LS_FAIL_R1012A=window.KGM_LS_FAIL_R1012A||{n:0,keys:{}};")
RW('ls setNow pass string',
   "setNow(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){try{typeof kgmLsFailR1012A==='function'&&kgmLsFailR1012A(k,e)}catch(_){}}}",
   "setNow(k,v){var s15;try{s15=JSON.stringify(v);localStorage.setItem(k,s15);}catch(e){try{typeof kgmLsFailR1012A==='function'&&kgmLsFailR1012A(k,e,s15)}catch(_){}}}   /* 1015A：把要寫的字串帶過去，清完空間可以重寫 */")
RW('ls flush skip crewsched',
   "try{var s8=kgmLsStrR1012A(k,q[k]);if(_ls8last[k]!==s8){",
   "try{if(k==='kgm_crewsched'&&window.KGM_LS_NOCS_R1015A)continue;   /* 1015A：空間不夠時這次開頁不再寫組員排班快取（各分頁自己算） */\n      var s8=kgmLsStrR1012A(k,q[k]);if(_ls8last[k]!==s8){",2)

open('p_h_r16.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
