from common import *
# ══ 1008B ═══════════════════════════════════════════════════════════════════
#   使用者：「機隊排班（圖三）… 這個要去解決一定要！不是頁面問題是排班整體的，所以這一次你要更改機型可以但是ZIP包含新的PDF」
#   查到的：①「無機可派」量測用自己的一份航段清單（FLIGHTS＋flyOn），排班引擎用另一份（dayOf72：含後台新增航班、季節時刻、同日去重）
#          —— 兩個互相不一致的資料來源；② 量測的日期函式在台灣時區（UTC+8）會整段往前偏一天；
#          ③ 補位只接受「飛機剛好停在出發站」，沒有調機選項。
#   全部在既有的層裡改（沒有新增 <script id> 層）。
CUR=open('/tmp/j/kgm1008A_w8.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
COVER9=open('js/cover9.js',encoding='utf-8').read()
assert '</script' not in COVER9
L135='kgm-0904a-r135'

# ① 台灣時區：本地午夜 → toISOString() 會變成前一天（UTC），整個量測視窗往前偏一天
RC('r135 tz-safe D',L135,
   "  function D(d,n){var x=new Date(d+'T00:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}\n  var have={};",
   "  function D(d,n){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')}   /* 1008B：原本用 toISOString（UTC），台灣時區整段偏一天 */\n  var have={};")

# ② 量測改用排班引擎自己的航段清單（同一份資料）；時刻表有、排班清單沒有的另外列出
RC('r135 one source',L135,
   "    try{\n      FLIGHTS.forEach(function(f){\n        if(!f||f.via||f.partner||f.published===false)return;\n        if(!flyOn(f,dt))return;\n        out.expected++;\n        var k=date+'|'+f.code+'|'+f.fr+'|'+f.to;\n        if(have[k])have[k]--;else miss.push({date:date,f:f});\n      });\n    }catch(_){}\n  }\n  out.missing=miss.length;\n",
   "    var rows8=null;try{rows8=window.kgmDayOf72R1006A?window.kgmDayOf72R1006A(date):null}catch(_){rows8=null}   /* 1008B：跟排班引擎用同一份清單 */\n"
   "    if(rows8){\n"
   "      var pk8={};\n"
   "      rows8.forEach(function(r){var f=r&&r.f;if(!f)return;var k=date+'|'+f.code+'|'+f.fr+'|'+f.to;pk8[k]=1;out.expected++;if(have[k])have[k]--;else miss.push({date:date,f:f,t:r.t})});\n"
   "      try{FLIGHTS.forEach(function(f){if(!f||f.via||f.partner||f.codeshare||f.published===false)return;if(!flyOn(f,dt))return;var k=date+'|'+f.code+'|'+f.fr+'|'+f.to;\n"
   "        if(!pk8[k]){out.notPlanned++;if(out.notPlannedList.length<40)out.notPlannedList.push(date+' '+f.code+' '+f.fr+'\\u2192'+f.to)}})}catch(_){}\n"
   "      continue;\n"
   "    }\n"
   "    try{\n      FLIGHTS.forEach(function(f){\n        if(!f||f.via||f.partner||f.published===false)return;\n        if(!flyOn(f,dt))return;\n        out.expected++;\n        var k=date+'|'+f.code+'|'+f.fr+'|'+f.to;\n        if(have[k])have[k]--;else miss.push({date:date,f:f});\n      });\n    }catch(_){}\n  }\n  out.missing=miss.length;\n"
   "  out.missList=miss.slice(0,60).map(function(m){return m.date+' '+m.f.code+' '+m.f.fr+'\\u2192'+m.f.to+(m.t?(' '+m.t):'')});   /* 1008B：是哪幾段 */\n")
RC('r135 out init',L135,
   "  var out={window:null,expected:0,missing:0,covered:0,left:0,skipped:null,fixed:[]};",
   "  var out={window:null,expected:0,missing:0,covered:0,left:0,skipped:null,fixed:[],notPlanned:0,notPlannedList:[],missList:[]};")

# ③ 第三輪補位：可以插調機
RC('r135 ferry pass',L135,
   "    iv[best].sort(function(p,q){return p.a-q.a});\n  });\n  out.left=out.missing-out.covered;",
   "    iv[best].sort(function(p,q){return p.a-q.a});\n  });\n"
   "  try{ferryFill1008B(miss.filter(function(m){return !m.ok1006A}),iv,tailType,out)}catch(_){}   /* 1008B：前兩輪放不進去的，允許插調機 */\n"
   "  out.left=out.missing-out.covered;")
RC('r135 helpers',L135,"window.kgmCoverGapsR135=function(apply){",COVER9+"window.kgmCoverGapsR135=function(apply){")
RC('r135 live fields',L135,
   "  return {expected:r.expected,missing:r.missing,skipped:r.skipped,window:r.window,byDate927D:r.byDate927D||{}};",
   "  return {expected:r.expected,missing:r.missing,skipped:r.skipped,window:r.window,byDate927D:r.byDate927D||{},missList:r.missList||[],notPlanned:r.notPlanned||0,notPlannedList:r.notPlannedList||[]};   /* 1008B */")

# ④ 機隊頁：無機可派不只一個數字 —— 列出航段＋下載診斷檔
RC('r72 strip list','kgm-0823o-r72',
   "      return '<div class=\"k72-i'+(x.ok?'':' bad')+'\"><small>'+E72(x.k)+'</small><b>'+E72(x.v)+'</b></div>'\n    }).join('')+'</div></section>';",
   "      return '<div class=\"k72-i'+(x.ok?'':' bad')+'\"><small>'+E72(x.k)+'</small><b>'+E72(x.v)+'</b></div>'\n    }).join('')+'</div>'+(window.kgmCoverListR1008B?window.kgmCoverListR1008B():'')+'</section>';   /* 1008B */")


# ⑤ 後台 AI：不經 Worker 直接連線（使用者：「這有什麼其他解決辦法？這很重要耶！」）
WK=open('worker_ai_1008B.txt',encoding='utf-8').read()
i=WK.index('const ADMIN_AI_TOOLS = [');j=WK.index('\n];',i)
TOOLARR=WK[i+len('const ADMIN_AI_TOOLS = '):j+2]
AI9=open('js/ai9.js',encoding='utf-8').read().replace('__ADMIN_AI_TOOLS__',TOOLARR)
assert '</script' not in AI9
L229='kgm-0909E-r229'
RC('ai9 direct fns',L229,"  var WHY8='';   /* 1008A：Worker 失敗的原因 */\n","  var WHY8='';   /* 1008A：Worker 失敗的原因 */\n"+AI9)
RC('ai9 route order',L229,
   "  async function remote(text){\n    var base='';",
   "  async function remote(text){   /* 1008B：有金鑰先直連，再 Worker */\n"
   "    var k9=key9(),w9='';if(k9){var d9=await direct9(text,k9);if(d9)return d9;w9=WHY8}\n"
   "    var r9=await remoteW8(text);if(r9){r9.via='worker';return r9}\n"
   "    if(w9)WHY8=w9+(WHY8?((z()?'；Worker：':'; Worker: ')+WHY8):'');\n"
   "    else if(WHY8)WHY8=WHY8+(z()?'；也還沒設定直連金鑰（按視窗上方「連線」）':'; no direct key set');\n"
   "    return null;\n  }\n  async function remoteW8(text){\n    var base='';")
RC('ai9 note',L229,
   "    if(src==='local')th.note=(z()?'Claude Opus 5.5（Worker /ai/admin）目前連不上':'Worker unreachable')",
   "    if(src!=='local')th.note='Claude · '+String(src)+' · '+((j&&j.via==='direct')?(z()?'直接連線':'direct'):'Worker');   /* 1008B：看得出是哪一條路線回答的 */\n"
   "    if(src==='local')th.note=(z()?'Claude Opus 5.5 目前連不上':'Claude unreachable')")
RC('ai9 header btn',L229,
   "+'<div><button onclick=\"kgmAdminAiClearR929()\">'",
   "+'<div><button onclick=\"S.adminAiCfgR1008B=!S.adminAiCfgR1008B;kgmAdminAiDrawR929()\">'+(z()?'連線':'Connect')+'</button><button onclick=\"kgmAdminAiClearR929()\">'")
RC('ai9 cfg box',L229,
   "+'<div class=\"k929ai-msgs\" id=\"k929aiMsgs\">'+msgs+'</div>'",
   "+'<div class=\"k929ai-msgs\" id=\"k929aiMsgs\">'+cfg9()+msgs+'</div>'")
save('p_h_r9.js','/* 1008B · 無機可派：量測與排班同一份航段清單、台灣時區日期修正、補位可插調機、列出缺口與診斷檔 */\n')
