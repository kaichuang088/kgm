from common import *
import base64, importlib.util, json, re
# ══ 1010A ═══════════════════════════════════════════════════════════════════
#   使用者（1009B 交付後）的修改清單，逐項見 notes/1010A-pass116-notes.md。
CUR=open('/tmp/j/kgm1009B_w4.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
P121='kgm-0903b-r121'
# 1010A 新增要存檔（前後台同步）的欄位：S 欄位 → 存檔鍵
PERSIST_1010A=[('dhPnrR1010A','kgm10_dhpnr','{}'),('groundBandOvR1010A','kgm10_gband','{}'),
  ('casesR84','kgm10_cases84','[]'),('refundReqR113','kgm10_rfreq','{}'),('refundSimR1010A','kgm10_rfsim','{}'),('sbSimR929','kgm10_sbsim','{}'),
  ('redeemPromosR1010A','kgm10_rdpromo','[]'),('staffLinkR1010A','kgm10_stflink','{}')]   # 後四個：原本根本沒存檔（重新整理就不見）

# ── #12 機師職稱只有一個：巡航就是「巡航機師」；三人機組的巡航位置先找副機師 ──────────────
RC('crz label',P121,"r.rank=c==='TRI'?(p.rankZH+'・教官・訓練'):(c==='SIC'&&trn9)?(p.rankZH+'・訓練'):c==='CRZ'?(p.rank==='CR'?p.rankZH:p.rankZH+'・巡航'):p.rankZH;",
   "r.rank=c==='TRI'?'教官（航線訓練）':(c==='SIC'&&trn9)?(p.rankZH+'（受訓）'):c==='CRZ'?'巡航機師':p.rankZH;   /* 1010A：使用者「不能同時是正機師和巡航，只能是一個」—— 職稱只寫一個 */")
RC('crz prefers FO',P121,"      if(pilots.length<comp.n)pilots=pilots.concat(choose(f,'pilot',null,comp.n-pilots.length,used,'CRZ'));",
   "      if(pilots.length<comp.n)pilots=pilots.concat(choose(f,'pilot','FO',comp.n-pilots.length,used,'CRZ'));   /* 1010A：三人機組的巡航位置由副機師擔任（正機師就是機長，不坐巡航）；副機師不夠才由任何人補 */\n"
   "      if(pilots.length<comp.n)pilots=pilots.concat(choose(f,'pilot',null,comp.n-pilots.length,used,'CRZ'));")
RC('dh title crz','kgm-r7-admin-ops',"CRZ:'巡航機師'+(r.rank&&r.rank!=='CR'&&r.zh?'（'+r.zh+'）':'')}[c9]","CRZ:'巡航機師'}[c9]")

# ── #14 「我飛過的航班：給旅客評分」只有客艙組員 ──────────────────────────────────────
R195='kgm-0907A-r195'
RC('rate cabin only a',R195,"return !!(x&&(x.role==='cabin'||x.role==='pilot'));","return !!(x&&x.role==='cabin');   /* 1010A：評分只有客艙組員，機師沒有 */")
RC('rate cabin only b',R195,"var s=(S.staff||[]).filter(function(x){return x&&x.active!==false&&(x.role==='cabin'||x.role==='pilot')})[0];","var s=(S.staff||[]).filter(function(x){return x&&x.active!==false&&x.role==='cabin'})[0];")
RC('rate cabin only c',R195,"try{crew=(S.staff||[]).filter(function(s){return s&&s.active!==false&&(s.role==='cabin'||s.role==='pilot')})}catch(_){}","try{crew=(S.staff||[]).filter(function(s){return s&&s.active!==false&&s.role==='cabin'})}catch(_){}")
RC('rate cabin only d',R195,"var cand195=(S.staff||[]).filter(function(x){return x&&x.active!==false&&(x.role==='cabin'||x.role==='pilot')});","var cand195=(S.staff||[]).filter(function(x){return x&&x.active!==false&&x.role==='cabin'});")
RC('rate cabin only pick',R195,"  try{if(S.crewPickR195)return String(S.crewPickR195).trim()}catch(_){}",
   "  try{if(S.crewPickR195&&(S.staff||[]).some(function(q){return q&&q.empId===String(S.crewPickR195).trim()&&q.role==='cabin'}))return String(S.crewPickR195).trim()}catch(_){}   /* 1010A：之前選過機師的不再沿用 */")

# ── #20 行程卡：跨日天數與飛行時間照目前時刻表（舊訂位存的 dd 不可信）；經停航班不再寫「直飛」 ─────────────
R217='kgm-0909B-r217'
RC('trip seg fix',R217,"function segCard(b,s,i){\n  var key=s.key||'out',f=s.f||s;",
   "/* 1010A：使用者「TPE-LHR 是 +2 不是 +1 嗎？？」—— 舊訂位存的航班物件（班號、跨日天數）可能是舊版時刻表的。\n"
   "   同班號同航段在目前時刻表找得到 → 用那一天（夏／冬季）的時刻；找不到 → 用起飛時間＋飛行時間＋時差重算跨日天數。 */\n"
   "function fixSeg1010A(s){\n"
   "  try{var f=s.f||s,T=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&!x.partner&&!x.codeshare&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];\n"
   "    if(T){var t=T;try{t=window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(T,s.date)||T):T}catch(_){}\n"
   "      var dur=+t.dur||0;try{dur=blockMin(t.fr,t.to,t.dep,t.arr,+t.dd||0)||dur}catch(_){}\n"
   "      var ds=Math.floor(dur/60)+'h '+(dur%60)+'m';\n"
   "      return Object.assign({},s,{dep:t.dep,arr:t.arr,dd:+t.dd||0,via:t.via||'',f:Object.assign({},f,{dep:t.dep,arr:t.arr,dd:+t.dd||0,dur:dur,durStr:ds,via:t.via||''})})}\n"
   "    /* 時刻表已經沒有這個班號＋航段：用訂位上的起飛、抵達時刻與兩地時差，找出最合理的跨日天數（飛行時間最接近航程距離推估值），\n"
   "       飛行時間也跟著重算 —— 舊訂位存的 dd 與飛行時間都不可信（例：23:40 起飛、06:20 抵達倫敦，存成 +2、17 小時 40 分）。 */\n"
   "    var tz=function(a){try{return (TZ&&TZ[a]!=null)?TZ[a]:8}catch(_){return 8}},dep=String(s.dep||f.dep||''),arr=String(s.arr||f.arr||'');\n"
   "    if(/^\\d\\d:\\d\\d$/.test(dep)&&/^\\d\\d:\\d\\d$/.test(arr)){\n"
   "      var d=+f.dur||0;if(!d&&f.durStr){var q=/(\\d+)\\s*h\\s*(\\d+)?/.exec(String(f.durStr));if(q)d=(+q[1])*60+(+q[2]||0)}\n"
   "      var est=0;try{var km=distOf(s.fr||f.fr,s.to||f.to);if(km>0)est=30+km/12.5}catch(_){}if(!est)est=d;\n"
   "      var off=Math.round((tz(s.to||f.to)-tz(s.fr||f.fr))*60),best=null;\n"
   "      for(var k=0;k<=2;k++){var bl=m2(arr)+k*1440-m2(dep)-off;if(bl<30)continue;var df=est?Math.abs(bl-est):bl;if(!best||df<best.df)best={dd:k,bl:bl,df:df}}\n"
   "      if(best){var ds2=Math.floor(best.bl/60)+'h '+(best.bl%60)+'m';return Object.assign({},s,{dd:best.dd,f:Object.assign({},f,{dd:best.dd,dur:best.bl,durStr:ds2})})}}\n"
   "  }catch(_){}\n"
   "  return s;\n"
   "}\n"
   "function segCard(b,s,i){\n  s=fixSeg1010A(s);\n  var key=s.key||'out',f=s.f||s;")
RC('trip nonstop label',R217,"+'<span class=\"k217-nonstop\">'+(Z()?'直飛':'NON-STOP')+'</span>'",
   "+'<span class=\"k217-nonstop\">'+((s.via||f.via)?((Z()?'經 ':'VIA ')+E(s.via||f.via)):(Z()?'直飛':'NON-STOP'))+'</span>'")

# ── #20 KX108／KX107 提早 1.5 小時（仁川過站 75 分鐘不變） ───────────────────────────────
RC('kx108 r70','kgm-0823m-r70',"setTimes70('KX108','TPE','ICN','15:05','18:15',0);","setTimes70('KX108','TPE','ICN','13:35','16:45',0);   /* 1010A：提早 1.5 小時 */")
RC('kx107 r70','kgm-0823m-r70',"setTimes70('KX107','ICN','TPE','19:30','20:35',0);","setTimes70('KX107','ICN','TPE','18:00','19:05',0);")
RC('kx108 r77','kgm-0823p-r77',"'KX108|TPE|ICN':{summer:['15:05','18:15',0,'daily','EQV'],winter:['14:45','17:50',0,'daily','EQV']}",
   "'KX108|TPE|ICN':{summer:['13:35','16:45',0,'daily','EQV'],winter:['13:15','16:20',0,'daily','EQV']}")
RC('kx107 r77','kgm-0823p-r77',"'KX107|ICN|TPE':{summer:['19:30','20:35',0,'daily','EQV'],winter:['19:05','20:05',0,'daily','EQV']}",
   "'KX107|ICN|TPE':{summer:['18:00','19:05',0,'daily','EQV'],winter:['17:35','18:35',0,'daily','EQV']}")

# ── #10 組員班表上的 DH PNR 在前台行程管理一定查得到 ────────────────────────────────────
#   原本前台查不到時，只能拿前台自己算的組員排班去反推 —— 前台與後台的排班可能不同（機隊輪轉每次開頁不一定一樣），
#   後台建立的訂位如果又被另一個分頁存檔蓋掉，就變成「資料錯誤」。改成：後台班表一顯示 DH PNR，就把
#   「PNR → 組員／日期／航段／艙等」記進一份小表（S.dhPnrR1010A，存檔鍵 kgm10_dhpnr，前後台同步），
#   前台查不到訂位時照這份小表直接補建，不再依賴前台自己的排班。
R7='kgm-r7-admin-ops'
RC('dh registry write',R7,"var pn=dhPnr929(empId,date,code),had=(S.bookings||[]).some(function(x){return x&&x.pnr===pn});",
   "var pn=dhPnr929(empId,date,code),had=(S.bookings||[]).some(function(x){return x&&x.pnr===pn});\n"
   "      try{var RG=S.dhPnrR1010A=S.dhPnrR1010A||{};if(!RG[pn]||RG[pn].date!==date||RG[pn].code!==code){RG[pn]={empId:empId,date:date,code:code,fr:fr,to:to,name:p.name||'',role:p.role||'',cabin:p.cabin||'',seat:p.seat||''};had=false}}catch(_){}   /* 1010A */")
RC('dh registry read',R7,"      var h=scan();\n",
   "      var h=scan();\n"
   "      if(!h){try{var g=(S.dhPnrR1010A||{})[pnr];if(g&&g.empId&&g.date&&g.code)h={r:{empId:g.empId,name:g.name,role:g.role,cabin:g.cabin,seat:g.seat,flight:{}},date:g.date,code:g.code,fr:g.fr,to:g.to}}catch(_){}}   /* 1010A：後台班表記下的 DH PNR，前台直接補建 */\n")

# ── #18 動作歷史：可選類別、勾選刪除、整類刪除 ──────────────────────────────────────────
a=CUR.find('  if(_t==="history"){\n    if(!isCEO()){body=`<div class="lockbox">動作歷史僅限 CEO。</div>`;}');b=CUR.find('  if(_t==="syscfg"){',a)
RW('history body',CUR[a:b],
   '  if(_t==="history"){\n    if(!isCEO()){body=`<div class="lockbox">動作歷史僅限 CEO。</div>`;}\n'
   '    else{body=(window.kgmHistBodyR1010A?window.kgmHistBodyR1010A():"");}   /* 1010A：可選類別、刪除 */\n  }\n')
R229='kgm-0909E-r229'
RC('history fn',R229,"    window.kgmCrewUpdateR928=function(){",
   "    /* 1010A：動作歷史 —— 使用者「要可選擇哪個類別的然後移除（內的）」：上方選類別（依「動作」分類，括號內是筆數），\n"
   "       每列可勾選，「刪除勾選」只刪勾到的、「刪除這個類別全部」刪掉目前選的類別；刪除前都會再問一次，刪除本身也記一筆。 */\n"
   "    function hE(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]})}\n"
   "    window.kgmHistBodyR1010A=function(){\n"
   "      var all=S.audit||[],cat=String(S._histCatR1010A||''),cnt={};all.forEach(function(a){var k=String(a&&a.act||'');cnt[k]=(cnt[k]||0)+1});\n"
   "      var cats=Object.keys(cnt).sort(function(x,y){return cnt[y]-cnt[x]||x.localeCompare(y)});if(cat&&!cnt[cat])cat='';\n"
   "      var rows=[];all.forEach(function(a,i){if(!cat||String(a&&a.act||'')===cat)rows.push(i)});\n"
   "      var sel=S._histSelR1010A||{},nSel=rows.filter(function(i){return sel[i]}).length;\n"
   "      return '<div class=\"adm-sec\">動作歷史（誰・做了什麼・何時）</div>'\n"
   "        +'<div class=\"adm-card\"><div style=\"display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px\">'\n"
   "        +'<label style=\"font-size:12px;color:#667\">類別</label><select class=\"inp\" style=\"max-width:280px;height:36px\" onchange=\"S._histCatR1010A=this.value;S._histSelR1010A={};render()\">'\n"
   "        +'<option value=\"\">全部（'+all.length+'）</option>'+cats.map(function(k){return '<option value=\"'+hE(k)+'\"'+(k===cat?' selected':'')+'>'+hE(k||'（未分類）')+'（'+cnt[k]+'）</option>'}).join('')+'</select>'\n"
   "        +'<span style=\"flex:1\"></span>'\n"
   "        +'<button class=\"btn btn-sm\"'+(nSel?'':' disabled')+' onclick=\"kgmHistDelR1010A(\\'sel\\')\">刪除勾選（'+nSel+'）</button>'\n"
   "        +(cat?'<button class=\"btn btn-sm\" style=\"background:#fde2e2;color:#b3261e;border-color:#f7bcbc\" onclick=\"kgmHistDelR1010A(\\'cat\\')\">刪除「'+hE(cat)+'」全部（'+rows.length+'）</button>':'')\n"
   "        +'</div><table class=\"adm-tbl\"><tr><th style=\"width:34px\"><input type=\"checkbox\" '+(rows.length&&nSel===Math.min(rows.length,200)?'checked':'')+' onclick=\"kgmHistAllR1010A(this.checked)\"></th><th>時間</th><th>人員</th><th>動作</th><th>內容</th></tr>'\n"
   "        +(rows.length?rows.slice(0,200).map(function(i){var a=all[i]||{};return '<tr><td><input type=\"checkbox\" '+(sel[i]?'checked':'')+' onclick=\"kgmHistSelR1010A('+i+',this.checked)\"></td><td style=\"white-space:nowrap;color:#778\">'+hE(a.ts)+'</td><td>'+hE(a.who)+'</td><td><b>'+hE(a.act)+'</b></td><td style=\"color:#556\">'+hE(a.detail)+'</td></tr>'}).join('')\n"
   "          :'<tr><td colspan=\"5\" style=\"text-align:center;color:#889;padding:16px\">尚無紀錄。</td></tr>')\n"
   "        +'</table>'+(rows.length>200?'<div style=\"font-size:11.5px;color:#889;margin-top:8px\">只顯示最新 200 筆（這個類別共 '+rows.length+' 筆；「刪除這個類別全部」會刪掉全部 '+rows.length+' 筆）。</div>':'')+'</div>';\n"
   "    };\n"
   "    window.kgmHistSelR1010A=function(i,on){S._histSelR1010A=S._histSelR1010A||{};if(on)S._histSelR1010A[i]=1;else delete S._histSelR1010A[i];render()};\n"
   "    window.kgmHistAllR1010A=function(on){var cat=String(S._histCatR1010A||''),o={};if(on)(S.audit||[]).forEach(function(a,i){if(!cat||String(a&&a.act||'')===cat)o[i]=1});var ks=Object.keys(o).slice(0,200),m={};ks.forEach(function(k){m[k]=1});S._histSelR1010A=m;render()};\n"
   "    window.kgmHistDelR1010A=function(mode){\n"
   "      if(!((S.adminUser||{}).role==='ceo'||(S.adminUser||{}).empId==='MASTER'))return alert('動作歷史僅限 CEO。');\n"
   "      var cat=String(S._histCatR1010A||''),sel=S._histSelR1010A||{},kill={},n=0;\n"
   "      (S.audit||[]).forEach(function(a,i){if(mode==='cat'?(cat&&String(a&&a.act||'')===cat):!!sel[i]){kill[i]=1;n++}});\n"
   "      if(!n)return;if(!confirm('確定刪除 '+n+' 筆動作歷史？刪除後無法復原。'))return;\n"
   "      S.audit=(S.audit||[]).filter(function(a,i){return !kill[i]});S._histSelR1010A={};if(mode==='cat')S._histCatR1010A='';\n"
   "      try{logAct('刪除動作歷史',(mode==='cat'?('類別「'+cat+'」'):'勾選')+' '+n+' 筆')}catch(_){}\n"
   "      try{save()}catch(_){}render();\n"
   "    };\n"
   "    window.kgmCrewUpdateR928=function(){")

# ── #13／#2 後台 AI（站內引擎）：組員換班、地勤改班別一定聽得懂 ──────────────────────────────
#   使用者：「K10135想換掉12-03的KX96換成其他的都可以」「K32423想改成午班」都回「我還看不懂」。
#   沒有 Worker、沒有金鑰時只剩站內引擎，所以站內引擎要自己聽得懂：
#   · 員工編號是空勤組員＋換／不想飛／代班＋日期 → 組員換班（「換掉 KX96」是他自己的班，不當成目標；「換成 KX12／東京」才是目標）
#   · 員工編號是地勤＋早班／午班／中班／晚班 → 改班別（新工具 ground_shift；沒寫日期就從明天起兩週）
RC('ai plan crew/ground',R229,"    if(/(排班更新|重新排班|重排班表|立即重算)/.test(t))return [{tool:'crew_update'}];",
   "    if(/(排班更新|重新排班|重排班表|立即重算)/.test(t))return [{tool:'crew_update'}];\n"
   "    /* 1010A：員工編號＋換班／班別 */\n"
   "    var who10=crIds.map(function(id){var x=(S.staff||[]).filter(function(x){return x&&String(x.empId).toUpperCase()===id})[0];if(!x){try{var K=window.kgmCrewSwapKitR1006A,A=K&&K.crewAll();x=A&&A[id]}catch(_){}}return x}).filter(Boolean)[0];   /* 排班池的組員也算 */\n"
   "    if(who10&&who10.role==='ground'&&/(早班|午班|中班|晚班|夜班|清晨班|大夜|下午班|早上班)/.test(t)){\n"
   "      var bd10=/(清晨|大夜)/.test(t)?'early':/(午班|中班|下午)/.test(t)?'mid':/(晚班|夜班)/.test(t)?'late':'day',rg10=rangeOf(t);\n"
   "      return [{tool:'ground_shift',args:{empId:who10.empId,band:bd10,from:rg10.from,to:rg10.to}}];\n"
   "    }\n"
   "    if(who10&&(who10.role==='pilot'||who10.role==='cabin')&&/(換掉|換成|換班|換到|換|調班|不想飛|不要飛|不飛|改飛|代班)/.test(t)&&!/對調|移除|拿掉|恢復/.test(t)&&dateOf(t)){\n"
   "      var tg10=(/(?:換成|換到|改成|改飛|想飛)\\s*(KX\\s?\\d{1,4})/i.exec(t)||[])[1]||'',ds10=(/(?:換成|換到|改成|改飛|想飛|去)\\s*([^，,。\\s]{1,10})/.exec(t)||[])[1]||'';\n"
   "      var ap10=/其他|都可以|任何|隨便|都行|皆可/.test(ds10)?[]:apsOf(ds10).filter(function(x){return typeof x==='string'});\n"
   "      return [{tool:'crew_swap',args:{text:who10.empId+' '+dateOf(t)+' '+(tg10?tg10.replace(/\\s+/g,'').toUpperCase():'')+' '+ap10.join(' '),pick:1}}];\n"
   "    }")
RC('ai tool ground_shift',R229,"    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},",
   "    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},\n"
   "    ground_shift:{tab:'groundops',zh:'地勤改班別',run:function(a){return window.kgmGroundShiftSetR1010A(a)}},   /* 1010A */")
RC('ai local note',R229,"if(src==='local')th.note=(z()?'Claude Opus 5.5 目前連不上':'Claude unreachable')+(WHY8?((z()?'（原因：':' (')+WHY8+(z()?'）':')')):'')+(z()?'，這次由站內規則引擎依同一套權限執行。':' — handled by the built-in rule engine.');",
   "if(src==='local')th.note=z()?'站內 AI 引擎處理（依同一套權限執行）':'Handled by the built-in engine';   /* 1010A：使用者「你寫貼上什麼我不知道怎麼用」—— 不再要使用者去貼 Worker；連線失敗的技術原因留在診斷，不擠在每一則回覆下面 */\n"
   "    if(src==='local'&&WHY8)window.KGM_AI_WHY_R1010A=WHY8;")
RC('ai worker 404 once',R229,"        WHY8=res.status===404?(z()?'Worker 沒有 /ai/admin 這個路由（Worker 還是舊版，請貼上 1008A 的 Worker 程式）':'Worker has no /ai/admin route')",
   "        if(res.status===404)S.adminAiRemoteOffR929=1;   /* 1010A：Worker 沒有這個路由就不要每一次都再等它 */\n"
   "        WHY8=res.status===404?(z()?'Worker 沒有 /ai/admin 這個路由':'Worker has no /ai/admin route')")
RC('ai ground fn',R229,"    window.kgmCrewUpdateR928=function(){",
   "    /* 1010A：地勤改班別 —— S.groundBandOvR1010A[empId]=[{from,to,band}]，地勤派工（kgmGroundBandR1008A）在這段日期用指定的時間帶 */\n"
   "    var BAND10={early:{w:[180,840],zh:'清晨班（04:30 起）'},day:{w:[390,1050],zh:'早班（07:00 起）'},mid:{w:[660,1320],zh:'中班／午班（12:00 起）'},late:{w:[960,1650],zh:'晚班（18:00 起）'}};\n"
   "    function gbWrap10(){var g=window.kgmGroundBandR1008A;if(typeof g!=='function'||g.__r1010A)return !!(g&&g.__r1010A);\n"
   "      var w=function(id,date){try{var L=(S.groundBandOvR1010A||{})[id];if(L)for(var i=L.length-1;i>=0;i--){var o=L[i];if(o&&date>=o.from&&date<=o.to&&BAND10[o.band])return {k:o.band,w:BAND10[o.band].w.slice()}}}catch(_){}return g.apply(this,arguments)};\n"
   "      w.__r1010A=1;window.kgmGroundBandR1008A=w;return true}\n"
   "    (function tryWrap(n){if(!gbWrap10()&&n<40)setTimeout(function(){tryWrap(n+1)},500)})(0);\n"
   "    window.kgmGroundShiftSetR1010A=function(a){\n"
   "      a=a||{};var st=(S.staff||[]).filter(function(x){return x&&String(x.empId).toUpperCase()===String(a.empId||'').toUpperCase()})[0];\n"
   "      if(!st)return {ok:false,msg:'找不到員工編號 '+(a.empId||'')+'。'};if(st.role!=='ground')return {ok:false,msg:st.name+'（'+st.empId+'）不是地勤，班別調整只適用地勤；空勤組員請說「換班」。'};\n"
   "      var b=BAND10[a.band]?a.band:'mid',from=/^\\d{4}-\\d{2}-\\d{2}$/.test(a.from||'')?a.from:AD(todayISO(),1),to=/^\\d{4}-\\d{2}-\\d{2}$/.test(a.to||'')&&a.to>=from?a.to:AD(from,13);\n"
   "      gbWrap10();S.groundBandOvR1010A=S.groundBandOvR1010A||{};(S.groundBandOvR1010A[st.empId]=S.groundBandOvR1010A[st.empId]||[]).push({from:from,to:to,band:b,at:new Date().toISOString(),by:(S.adminUser||{}).empId||''});\n"
   "      try{if(window.kgmGroundPlanClearR1008A)window.kgmGroundPlanClearR1008A()}catch(_){}\n"
   "      try{notifyStaff(st.empId,'【班別調整】'+from+'～'+to+' 改為'+BAND10[b].zh+'，實際上下班時間依當天航班排定。')}catch(_){}\n"
   "      try{save()}catch(_){}try{render()}catch(_){}\n"
   "      return {ok:true,msg:'已把 '+st.name+'（'+st.empId+'）'+from+'～'+to+' 改為'+BAND10[b].zh+'；當天的櫃檯／登機門工作照這個時間帶重新派，例休日不變，並已通知本人。'};\n"
   "    };\n"
   "    window.kgmCrewUpdateR928=function(){")


# ── #16 候補接受：真的佔位、配一個隨機座位、座位圖看得到；沒位就不能接受 ─────────────────────────
#   使用者：「明明就寫只有三個位置有四個人，按下第一個接受，最後一個人就變有位置了？這代表這是假的接受」
#   原因：模擬候補按「候補成功」只記一個狀態，那一列消失，座位庫存沒有扣；剩下的人重新預判就多出一個位子。
#   · 模擬候補：接受時先確認目標艙等真的還有位（不夠就擋下），記下航班、艙等、人數，並從座位圖的空位隨機配一個座位
#     （存在 S.sbSimR929[id]），之後所有的座位庫存（kgmCabinInventory54）都扣掉這幾位、座位圖也畫出來。
#   · 真實的哩程升等候補：接受前一樣確認目標艙等有位；通知改成「座位由系統隨機分配，無法更改」。
#   · 模擬候補的編號原本跨航班會撞號（同一個編號在別班被當成已處理），決定紀錄改成帶航班＋日期。
R40='kgm-0816d-r40'
RC('sb sim id u',R40,"var h1=H929(seed929+'u'+u929),id1='SBU929'+(seed929%9973)+u929;if(done929[id1])continue;",
   "var h1=H929(seed929+'u'+u929),id1='SBU929'+(seed929%9973)+u929;(window.KGM_SBROW_R1010A=window.KGM_SBROW_R1010A||{})[id1]={code:code,date:date,fr:f929.fr,to:f929.to};if(done929[id1]&&(!done929[id1].code||(done929[id1].code===code&&done929[id1].date===date)))continue;   /* 1010A：決定紀錄帶航班，不跨班撞號 */")
RC('sb sim id s',R40,"var h2=H929(seed929+'s'+s929),id2='SBS929'+(seed929%9973)+s929;if(done929[id2])continue;",
   "var h2=H929(seed929+'s'+s929),id2='SBS929'+(seed929%9973)+s929;(window.KGM_SBROW_R1010A=window.KGM_SBROW_R1010A||{})[id2]={code:code,date:date,fr:f929.fr,to:f929.to};if(done929[id2]&&(!done929[id2].code||(done929[id2].code===code&&done929[id2].date===date)))continue;")
RW('upg accept note',"if(ok){applyUpgradeK(req,b);var st6=seat6(b,req.seg);req.seat=st6;req.decision='admin_success';_pushBkNotif(b,'✓ 【升等候補成功】'+req.code+' '+req.date+' 已升至 '+req.toCabin+(st6?'，已自動改配座位 '+st6+'（可至行程管理免費改選）。':'。原座位已清除，請免費重新選位。'));",
   "if(ok){if(window.kgmSbSeatOkR1010A&&!window.kgmSbSeatOkR1010A(req.code,req.date,req.toCabin,+req.pax||1)){alert('目標艙等目前沒有空位，不能接受這筆候補（請改按「失敗・退還哩程」或等有人取消）。');return}   /* 1010A：沒位就不能接受 */\n"
   "      applyUpgradeK(req,b);var st6=seat6(b,req.seg);req.seat=st6;req.decision='admin_success';b.upgSeatLockR1010A=b.upgSeatLockR1010A||{};b.upgSeatLockR1010A[req.seg]=1;_pushBkNotif(b,'✓ 【升等候補成功】'+req.code+' '+req.date+' 已升至 '+req.toCabin+(st6?'，座位 '+st6+'（候補成功的座位由系統隨機分配，無法更改）。':'。座位於報到時由系統隨機分配，無法更改。'));")
RC('manifest sb rows',R7,"    var rows=real.concat(base).concat(dhRows929(f,date,k)),st=store7(k)",
   "    try{if(window.kgmSimIdxR1010A)window.kgmSimIdxR1010A(base,f,date)}catch(_){}   /* 1010A：記下模擬旅客 PNR 在哪一班（定位管理查詢用） */\n"
   "    var rows=real.concat(base).concat(dhRows929(f,date,k)).concat((function(){try{return window.kgmSbClearedRowsR1010A?window.kgmSbClearedRowsR1010A(f,date).map(function(x,i){return normPax7(x,900+i,k)}):[]}catch(_){return []}})()),st=store7(k)")
RC('sb sim decide wrap',R229,"    window.kgmCrewUpdateR928=function(){",
   "    /* 1010A：候補接受要真的佔位（見 gen_r13.py #16） */\n"
   "    var CABC10={Economy:'E-T',Premium:'P-A',Business:'B-T',First:'F-X'};\n"
   "    function simOk10(code,date){var o=S.sbSimR929||{},L=[];Object.keys(o).forEach(function(id){var r=o[id];if(r&&r.how==='ok'&&r.code===code&&r.date===date&&r.cabin)L.push(Object.assign({id:id},r))});return L}\n"
   "    function invRaw10(code,date,cab){try{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.partner&&!x.via})[0];return f?window.kgmCabinInventory54(Object.assign({},f,{date:date}),date,cab):null}catch(_){return null}}\n"
   "    window.kgmSbSeatOkR1010A=function(code,date,cab,pax){var iv=invRaw10(code,date,cab);return !iv||(+iv.left||0)>=(+pax||1)};\n"
   "    window.kgmSbClearedRowsR1010A=function(f,date){return simOk10(f.code,date).map(function(r){var nm=String(r.name||'').split(/\\s+/);return {id:'SB:'+r.id,pnr:r.pnr||'',name:r.name||'',last:nm[0]||'',first:nm.slice(1).join(' '),cabin:r.cabin,fare:CABC10[r.cabin]||'',seat:r.seat||'',member:'',tier:'',sbClearedR1010A:true}})};\n"
   "    (function wrapInv10(n){var g=window.kgmCabinInventory54;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapInv10(n+1)},500);return}if(g.__r1010A)return;\n"
   "      var w=function(f,date,cab){var r=g.apply(this,arguments);try{if(!r||!f)return r;var L=simOk10(f.code,date||f.date);if(!L.length)return r;var d=0,seats={};\n"
   "        L.forEach(function(x){var n=+x.pax||1;if(x.cabin===cab){d-=n;if(x.seat)seats[x.seat]=1}if(x.fromCab&&x.fromCab===cab&&x.kind==='upgrade')d+=n});\n"
   "        if(!d&&!Object.keys(seats).length)return r;var o=Object.assign({},r);o.left=Math.max(0,Math.min(+r.capacity||1e9,(+r.left||0)+d));if(Array.isArray(r.seats))o.seats=r.seats.filter(function(s){return !seats[s]});return o}catch(_){return r}};\n"
   "      w.__r1010A=1;window.kgmCabinInventory54=w})(0);\n"
   "    (function wrapSim10(n){var g=window.kgmSbSimDecideR929;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapSim10(n+1)},500);return}if(g.__r1010A)return;\n"
   "      var w=function(id,how){var reg=(window.KGM_SBROW_R1010A||{})[id];\n"
   "        if(reg&&how==='ok'){var pl=null;try{pl=window.kgmStandbyPlanR1004B(reg.code,reg.date,reg.fr,reg.to)}catch(_){}\n"
   "          var row=pl&&((pl.up||[]).concat(pl.staff||[])).filter(function(x){return x&&x.id===id})[0];\n"
   "          if(row){var cab=row.kind==='upgrade'?row.toCabR1004B:(row.clearCabR1004B||(row.cabsR1004B||[])[0]||'Economy'),n=Math.max(1,+row.pax||1);\n"
   "            if(!window.kgmSbSeatOkR1010A(reg.code,reg.date,cab,n)){alert('目標艙等目前沒有空位，不能接受這筆候補。');return}\n"
   "            var seat='';try{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===reg.code&&x.fr===reg.fr&&x.to===reg.to})[0];var mf=f&&window.manifest7?window.manifest7(f,reg.date):null,rows=(mf&&(mf.rows||mf.pax||mf))||[];\n"
   "              var defs=[],used={};try{defs=(window.kgmCabinInventory54(Object.assign({},f,{date:reg.date}),reg.date,cab)||{}).seats||[]}catch(_){}\n"
   "              (Array.isArray(rows)?rows:[]).forEach(function(x){if(x&&x.seat)used[x.seat]=1});var free=defs.filter(function(s){return !used[s]});\n"
   "              if(free.length){var h=0,k=id+'|'+reg.date;for(var i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))>>>0;seat=free[h%free.length]}}catch(_){}\n"
   "            g.apply(this,arguments);var rec=(S.sbSimR929||{})[id];if(rec){rec.code=reg.code;rec.date=reg.date;rec.fr=reg.fr;rec.to=reg.to;rec.kind=row.kind;rec.cabin=cab;rec.fromCab=row.fromCabR1004B||'';rec.pax=n;rec.seat=seat;rec.name=row.name||'';rec.pnr=row.pnr||''}\n"
   "            try{save()}catch(_){}try{render()}catch(_){}return}}\n"
   "        var r=g.apply(this,arguments);var rec2=(S.sbSimR929||{})[id];if(rec2&&reg){rec2.code=reg.code;rec2.date=reg.date}try{save()}catch(_){}return r};\n"
   "      w.__r1010A=1;window.kgmSbSimDecideR929=w})(0);\n"
   "    window.kgmCrewUpdateR928=function(){")


# ── #19 航班資料：網路報到欄（真實訂位看報到紀錄；模擬旅客依離起飛時間推算，起飛前 48 小時開放） ──────────────
RC('webci real',R7,"physical:st.physical,boarded:st.boarded,documentFlag:st.documentFlag","webCI:!!st.checkedIn,physical:st.physical,boarded:st.boarded,documentFlag:st.documentFlag")
RC('webci sim',R7,"    /* 0920D：模擬旅客也要有報到資料。櫃檯起飛前 150 分開、60 分關，",
   "    /* 1010A：網路報到 —— 使用者「航班資料要多一個勾選的看看有沒有事先網路報到（Simulate as well）」。起飛前 48 小時開放；\n"
   "       模擬旅客依離起飛還有多久推算（開放後逐步增加，最後約六成；商務以上約七成五），調位組員（DH）不做網路報到。 */\n"
   "    (function(){var hw=99;try{var hh=window.kgmHoursToDepR920B&&window.kgmHoursToDepR920B(f,date);if(isFinite(hh))hw=hh}catch(_){}\n"
   "      rows.forEach(function(x){if(x.real)return;if(x.dhR929||hw>48){x.webCI=false;return}var top=/First|Business|Resident/.test(x.cabin||'')?75:60,pct=hw<=0?top:Math.round(top*Math.min(1,(48-hw)/40));x.webCI=(H(String(x.id)+'|web|'+k)%100)<pct})})();\n"
   "    /* 0920D：模擬旅客也要有報到資料。櫃檯起飛前 150 分開、60 分關，")
RC('webci th',R7,"<th>'+(z()?'座位（可改）':'Seat (editable)')+'</th><th>'+(z()?'實體報到':'Physical CI')+'</th>",
   "<th>'+(z()?'座位（可改）':'Seat (editable)')+'</th><th>'+(z()?'網路報到':'Web CI')+'</th><th>'+(z()?'實體報到':'Physical CI')+'</th>")
RC('webci td',R7,"'+seatNote+'</td><td><input type=\"checkbox\" '+(x.physical?'checked':'')+'",
   "'+seatNote+'</td><td style=\"text-align:center\"><input type=\"checkbox\" disabled '+(x.webCI?'checked title=\"'+(z()?'已於起飛前網路報到':'Checked in online')+'\"':'title=\"'+(z()?'未網路報到':'Not checked in online')+'\"')+'></td><td><input type=\"checkbox\" '+(x.physical?'checked':'')+'")

# ── #17 員工票狀態：沒賣豪經的航段，豪經座位併進經濟艙算（DH 仍可坐豪經）；「候補名單」改成就地預覽 ─────────────
RW('stx prem merge',"  var UP1004B=['Economy','Premium','Business','First'];\n  function near(c){for(var i=Math.max(0,UP1004B.indexOf(c));i<UP1004B.length;i++)if(cap[UP1004B[i]])return UP1004B[i];return c}",
   "  /* 1010A：使用者「ICN 明明就沒有販售豪華經濟艙為啥會有豪經的選項？那個和經濟艙一起算」—— 不賣豪經的航段（亞洲線只有曼谷賣），\n"
   "     DH 照樣可以坐豪經（上面已先扣），剩下的豪經座位併進經濟艙；員工票、升等候補都不會出現豪經。 */\n"
   "  var noP10=false;try{noP10=!!(base&&cap.Premium&&window.kgmSellsPremiumR71&&!window.kgmSellsPremiumR71(base))}catch(_){}\n"
   "  if(noP10){cap.Economy=(cap.Economy||0)+cap.Premium;left.Economy=(left.Economy||0)+(left.Premium||0);cap.Premium=0;left.Premium=0}\n"
   "  var UP1004B=['Economy','Premium','Business','First'];\n  function near(c){if(noP10&&c==='Premium')c='Economy';for(var i=Math.max(0,UP1004B.indexOf(c));i<UP1004B.length;i++)if(cap[UP1004B[i]])return UP1004B[i];return c}")
RC('stx preview',R229,"    window.kgmCrewUpdateR928=function(){",
   "    /* 1010A：員工票狀態「候補名單 ›」就地預覽，不再跳到航班資料（預覽裡另有一顆「到航班資料處理」） */\n"
   "    (function wrapStx10(n){var g=window.kgmStxStatusPageR1004B;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapStx10(n+1)},500);return}if(g.__r1010A)return;\n"
   "      window.kgmStxStatusOpenR1004B=function(code,date,fr,to){S.stxPrevR1010A={code:code,date:date,fr:fr,to:to};try{render()}catch(_){}};\n"
   "      window.kgmStxPrevCloseR1010A=function(){S.stxPrevR1010A=null;try{render()}catch(_){}};\n"
   "      window.kgmStxPrevGoR1010A=function(){var p=S.stxPrevR1010A;if(!p)return;S.stxPrevR1010A=null;S.adminTab='flightdata';S.opsQueryR7=p.code;S.opsDateR7=p.date;S.opsSelectedR7=[p.code,p.date,p.fr,p.to].join('|');try{render()}catch(_){}};\n"
   "      var CZ={First:'頭等',Business:'商務',Premium:'豪經',Economy:'經濟'};\n"
   "      var w=function(){var h=g.apply(this,arguments),p=S.stxPrevR1010A;if(!p)return h;var pl=null;try{pl=window.kgmStandbyPlanR1004B(p.code,p.date,p.fr,p.to)}catch(_){}if(!pl)return h;\n"
   "        var seats=['First','Business','Premium','Economy'].filter(function(c){return pl.cap[c]}).map(function(c){return '<span><i>'+CZ[c]+'</i><b>'+(pl.left[c]||0)+'</b></span>'}).join('');\n"
   "        var v=function(ok,t){return '<span class=\"k10sp-v '+(ok?'ok':'no')+'\">'+(ok?'✓ ':'✕ ')+t+'</span>'};\n"
   "        var up=(pl.up||[]).map(function(r){return '<tr><td>'+r.rankR1004B+'</td><td><b>'+hE(r.name)+'</b>'+(r.simR929?' <i class=\"k10sp-sim\">模擬</i>':'')+'<small>PNR '+hE(r.pnr)+'・申請 '+hE(r.atR1004B||'—')+'</small></td><td>'+hE((r.fromCabR1004B?CZ[r.fromCabR1004B]+' → ':'')+CZ[r.toCabR1004B])+'</td><td>'+v(r.clearR1004B,r.clearR1004B?'預計成功':'預計無位')+'</td></tr>'}).join('');\n"
   "        var st=(pl.staff||[]).map(function(r){return '<tr><td>'+r.rankR1004B+'</td><td><b>'+hE(r.name)+'</b>'+(r.simR929?' <i class=\"k10sp-sim\">模擬</i>':'')+'<small>PNR '+hE(r.pnr)+'・年資 '+r.yearsR1004B+' 年'+((r.famR1004B||[]).length?'・眷屬 '+r.famR1004B.length+' 位':'')+'</small></td><td><b>'+hE(r.planR1004B)+'</b><small>'+hE((r.cabsR1004B||[]).map(function(c){return CZ[c]}).join(' / '))+'</small></td><td>'+v(r.clearR1004B,r.clearR1004B?('預計可上・'+CZ[r.clearCabR1004B]):'預計無位')+'</td></tr>'}).join('');\n"
   "        var tb=function(t,b,e){return '<div class=\"k10sp-col\"><h4>'+t+'</h4>'+(b?'<table><thead><tr><th>#</th><th>旅客</th><th>內容</th><th>預判</th></tr></thead><tbody>'+b+'</tbody></table>':'<div class=\"k10sp-none\">'+e+'</div>')+'</div>'};\n"
   "        return h+'<style>.k10sp-mask{position:fixed;inset:0;background:rgba(15,25,22,.42);z-index:9000;display:flex;align-items:flex-start;justify-content:center;padding:6vh 16px;overflow:auto}'\n"
   "          +'.k10sp{background:#fff;border-radius:18px;max-width:980px;width:100%;box-shadow:0 30px 70px -30px rgba(0,0,0,.5);overflow:hidden}.k10sp header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 22px;border-bottom:1px solid #efe9dc;background:#fbf9f4}'\n"
   "          +'.k10sp header small{font-size:10px;letter-spacing:.16em;color:#a08a5c;font-weight:800}.k10sp header h3{margin:4px 0 0;font-size:19px;color:#0b3b30}.k10sp header button{border:0;background:none;font-size:22px;cursor:pointer;color:#7a7266}'\n"
   "          +'.k10sp-seats{display:flex;gap:10px;flex-wrap:wrap;padding:12px 22px;border-bottom:1px solid #f2ede2}.k10sp-seats span{background:#f3f7f5;border-radius:10px;padding:6px 12px;display:flex;gap:8px;align-items:center;font-size:12px;color:#4a564f}.k10sp-seats b{font-size:16px;color:#0b3b30}'\n"
   "          +'.k10sp-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:14px 22px}.k10sp-col h4{margin:0 0 8px;font-size:13px;color:#0b3b30}.k10sp-col table{width:100%;border-collapse:collapse;font-size:12px}.k10sp-col th{text-align:left;font-size:10.5px;color:#8a8175;border-bottom:1px solid #eee7da;padding:6px}.k10sp-col td{border-bottom:1px solid #f4f0e7;padding:7px 6px;vertical-align:top}'\n"
   "          +'.k10sp-col small{display:block;color:#9a9186;font-size:10.5px;margin-top:2px}.k10sp-v{font-size:11px;font-weight:800;border-radius:999px;padding:3px 9px;white-space:nowrap}.k10sp-v.ok{background:#e8f6ee;color:#1f6f4a}.k10sp-v.no{background:#fcebea;color:#a32a2a}'\n"
   "          +'.k10sp-sim{font-style:normal;font-size:9.5px;background:#f1ece0;color:#8a7a52;border-radius:6px;padding:1px 5px}.k10sp-none{color:#9a9186;font-size:12px;padding:14px 0}.k10sp footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 22px;border-top:1px solid #f2ede2}'\n"
   "          +'@media(max-width:760px){.k10sp-cols{grid-template-columns:1fr}}</style>'\n"
   "          +'<div class=\"k10sp-mask\" onclick=\"if(event.target===this)kgmStxPrevCloseR1010A()\"><div class=\"k10sp\"><header><div><small>STANDBY PREVIEW</small><h3>'+hE(p.code)+'　'+hE(p.fr)+' → '+hE(p.to)+'　'+hE(p.date)+'</h3></div><button onclick=\"kgmStxPrevCloseR1010A()\" aria-label=\"close\">×</button></header>'\n"
   "          +'<div class=\"k10sp-seats\"><span><i>目前剩餘座位</i></span>'+seats+'<span><i>DH</i><b>'+(pl.dh||[]).length+'</b></span></div>'\n"
   "          +'<div class=\"k10sp-cols\">'+tb('哩程升等候補（'+(pl.up||[]).length+'）',up,'沒有哩程升等候補。')+tb('員工票候補（'+(pl.staff||[]).length+'）',st,'沒有員工票候補。')+'</div>'\n"
   "          +'<footer><button class=\"btn\" onclick=\"kgmStxPrevCloseR1010A()\">關閉</button><button class=\"btn btn-g\" onclick=\"kgmStxPrevGoR1010A()\">到航班資料處理 ›</button></footer></div></div>'};\n"
   "      w.__r1010A=1;window.kgmStxStatusPageR1004B=w})(0);\n"
   "    window.kgmCrewUpdateR928=function(){")

# ── #3 案件處理中心：退票申請併進案件（依案件為主）、核准面板移到案件中心下面並改版、模擬資料 ─────────────
#   查到的根本原因：旅客送出的取消／退票申請會建立案件（S.casesR84），但案件處理中心的清單（caseRowsJ）根本沒讀這一份，
#   而且 S.casesR84、S.refundReqR113 都沒有存檔（重新整理就不見）—— 存檔見 PERSIST_1010A。
RW('case rows refund',"add(S.staffCasesR1007A,'staff','地勤／客服案件');",
   "add(S.staffCasesR1007A,'staff','地勤／客服案件');\n"
   "  /* 1010A：旅客的取消／退票申請（r113 建立的 S.casesR84）原本不在這份清單 —— 併進來，案件編號沿用原編號 */\n"
   "  try{add((S.casesR84||[]).map(function(c){if(!c)return c;var lg=c.log||[];return Object.assign({},c,{caseNo:c.id,detail:c.title||'',updatedAt:(lg[lg.length-1]||{}).at||c.createdAt,progress:lg.map(function(l){return {at:l.at,status:'',label:String(l.what||'')+(l.by?'（'+l.by+'）':'')}})})}),'refund','退票申請')}catch(_){}")
RW('case src refund',"invol:['艙等異動（系統）','Cabin change (system)']};",
   "invol:['艙等異動（系統）','Cabin change (system)'],refund:['旅客申請・執行長核准','Passenger request · CEO approval']};")
RW('case type refund',"refund_req:['退款申請','Refund request'],","refund_req:['退款申請','Refund request'],refund:['取消／退票申請','Cancellation / refund'],")
RW('case detail refund',"}else if(r.source==='invol'){acts=",
   "}else if(r.source==='refund'&&!cl){acts=window.kgmRefundCaseActsR1010A?window.kgmRefundCaseActsR1010A(r):'';   /* 1010A：退票案件在明細裡直接核准／駁回 */\n"
   "  }else if(r.source==='invol'){acts=")
R113='kgm-0903b-r113'
RC('rf panel pos',R113,"main.insertBefore(el,main.firstChild);",
   "var cc10=main.querySelector('.k7c');   /* 1010A：使用者「應該放到下面依照案件為主」—— 放在案件處理中心下面 */\n"
   "  if(cc10&&cc10.parentNode===main)main.insertBefore(el,cc10.nextSibling);else main.insertBefore(el,main.firstChild);")
_q0=CUR.index('function queueHtml113(){');_q1=CUR.index('function adminPanel113(){',_q0)
RC('rf queue html',R113,CUR[_q0:_q1],open('js/q113_10a.js',encoding='utf-8').read())
RC('rf css',R113,"+'.k113-empty{padding:22px;text-align:center;color:#9A948A;font-size:12px}';",
   "+'.k113-empty{padding:22px;text-align:center;color:#9A948A;font-size:12px}'\n"
   "/* 1010A：退票核准（以案件為主的卡片） */\n"
   "+'.k10rq-panel{box-shadow:0 10px 30px rgba(20,45,36,.055)}#app .p-admin-main .k113-panel.k10rq-panel,.k10rq-panel.k199-card{padding:0!important;overflow:hidden}'\n"
   "+'.k113-panel.k10rq-panel>header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;padding:18px 22px}'\n"
   "+'.k10rq-panel>header p{margin:4px 0 0;font-size:11.5px;color:#8A8578;line-height:1.7}'\n"
   "+'.k10rq-kpi{display:flex;gap:8px;flex-wrap:wrap}.k10rq-kpi span{border:1px solid #E7E1D2;background:#fff;border-radius:12px;padding:8px 14px;min-width:92px}'\n"
   "+'.k10rq-kpi small,.k10rq-amt small{display:block;font-size:9px;letter-spacing:.14em;color:#8A8578;font-weight:800}'\n"
   "+'.k10rq-kpi b{font:800 18px ui-monospace,Menlo,monospace;color:#1F4E46}'\n"
   "+'.k10rq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;padding:16px 22px 4px}'\n"
   "+'.k10rq{border:1px solid #E7E1D2;border-radius:14px;background:#fff;padding:14px 16px;display:flex;flex-direction:column;gap:10px;transition:box-shadow .2s,border-color .2s}'\n"
   "+'.k10rq:hover{border-color:#CDBF97;box-shadow:0 8px 22px rgba(20,45,36,.07)}'\n"
   "+'.k10rq-top{display:flex;justify-content:space-between;align-items:center;gap:8px}'\n"
   "+'.k10rq-no{border:0;border-bottom:1px dashed #B39B5E;background:none;padding:0;cursor:pointer;font:800 13.5px ui-monospace,Menlo,monospace;letter-spacing:.04em;color:#1F4E46}.k10rq-no:hover{color:#B39B5E}'\n"
   "+'.k10rq-chip{font-size:10px;font-weight:800;letter-spacing:.06em;padding:3px 10px;border-radius:999px;background:#FBF1D6;color:#7A5B12;border:1px solid #E7D6A8}'\n"
   "+'.k10rq-who b{display:block;font-size:14px;color:#2E3B36}.k10rq-who small{display:block;font-size:11px;color:#8A8578;margin-top:3px}'\n"
   "+'.k10rq-amt{display:grid;grid-template-columns:repeat(3,auto);justify-content:start;gap:4px 20px;background:#FBF9F3;border-radius:10px;padding:9px 12px}'\n"
   "+'.k10rq-amt b{display:block;font:800 13.5px ui-monospace,Menlo,monospace;color:#1F4E46;margin-top:2px}'\n"
   "+'.k10rq-foot{display:flex;justify-content:flex-end;gap:8px;align-items:center}.k10rq-foot .k113-go{margin:0}.k10rq-wait{font-size:11px;color:#8A8578}'\n"
   "+'.k10rq-irr{margin:12px 22px 16px;font-size:11px;color:#8E3B2C;line-height:1.7}.k10rq-irr.in{margin:10px 0}'\n"
   "+'.k10rq-hist{margin:0 22px 18px;border:1px solid #EFEADC;border-radius:12px;overflow:hidden}'\n"
   "+'.k10rq-hist summary{cursor:pointer;padding:11px 14px;font-size:12px;font-weight:800;color:#1F4E46;background:#FBF9F3}'\n"
   "+'.k10rq-hist summary b{display:inline-block;margin-left:6px;background:#1F4E46;color:#fff;border-radius:999px;padding:0 8px;font-size:10.5px}'\n"
   "+'.k10rq-hist td small{display:block;color:#8A8578;font-size:10.5px;margin-top:2px}'\n"
   "+'.k10rq-st{font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:999px;background:#EEF3F1;color:#1F4E46}'\n"
   "+'.k10rq-st.s-rejected{background:#FCEBEA;color:#A32A2A}.k10rq-st.s-withdrawn{background:#F2F0EA;color:#6B6455}.k10rq-act .k10rq-amt{margin:4px 0 0}';")

# ── #4／#21 定位管理：模擬旅客 PNR 查得到、改得到；每位旅客的備註與特殊服務 ──────────────────────────
RW('bk svc panel',"+(window.kgmDeskUpgHtmlR1006A?window.kgmDeskUpgHtmlR1006A(b,verifiedJ(b.pnr)):'')",
   "+(window.kgmDeskUpgHtmlR1006A?window.kgmDeskUpgHtmlR1006A(b,verifiedJ(b.pnr)):'')+(window.kgmPaxSvcHtmlR1010A?window.kgmPaxSvcHtmlR1010A(b):'')")
RW('bk sim busy',"+(p&&!b&&!matches.length?'<div class=\"r49-error\">'",
   "+(p&&!b&&!matches.length&&window.kgmSimBusyR1010A&&window.kgmSimBusyR1010A(p)?window.kgmSimBusyR1010A(p):'')"
   "+(p&&!b&&!matches.length&&!(window.kgmSimBusyR1010A&&window.kgmSimBusyR1010A(p))?'<div class=\"r49-error\">'")
RC('mf ssr badge',R7,"+(x.staff?' <span class=\"r7-staff-badge\">STAFF</span>':'')",
   "+(x.staff?' <span class=\"r7-staff-badge\">STAFF</span>':'')+(window.kgmSsrBadgeR1010A?window.kgmSsrBadgeR1010A(x):'')")
RC('svc + sim pnr',R229,"    window.kgmCrewUpdateR928=function(){",
   open('js/svc10a.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")

# ── 舊問題（1007A 起）：DH 組員訂位被寄信掃描當成旅客新訂位，寄訂位確認信／BigDeal 邀請到組員信箱 ──────────
#   實測：1009B 只要 DH 自動騰位掃描建立了 DH 訂位（483 筆），寄信掃描就對每一筆寄「訂位確認」與 BigDeal 邀請，
#   失敗就 15 秒重寄一次，瀏覽器同時開幾百個連線（ERR_INSUFFICIENT_RESOURCES）。DH 是組員調位，不是旅客訂位：一律不寄旅客通知；
#   模擬旅客轉成的正式訂位（b.simR1010A）是早就訂好的位子，不補寄「訂位確認」。
RW('mail skip dh a',"if(!b||!b.pnr||b.simulated||b.status!=='confirmed')return;",
   "if(!b||!b.pnr||b.simulated||b.dhR929||b.simR1010A||b.status!=='confirmed')return;   /* 1010A */")
RW('mail skip dh b',"if(!b||b.status==='cancelled'||!bookingEmailQ(b))return;",
   "if(!b||b.status==='cancelled'||b.dhR929||!bookingEmailQ(b))return;   /* 1010A：DH 組員不寄 BigDeal／報到通知 */")
RW('mail skip dh c',"if(!b||b.simulated||b.status==='cancelled')return Promise.resolve(false);",
   "if(!b||b.simulated||b.dhR929||b.status==='cancelled')return Promise.resolve(false);   /* 1010A */")

# ── #1 根本原因：自動產生冬季時刻的位移表有「−10 分」一格 → 改成 −15 分（短程冬夏至少差 15 分）；其餘照系統原本的流程算 ─────
RC('r68 winter steps','kgm-0823l-r68',"steps=[-45,-30,-20,-10,15,25,40,55];","steps=[-45,-30,-20,-15,15,25,40,55];   /* 1010A：−10 → −15（冬夏至少差 15 分） */")
RC('r57 winter steps','kgm-0823d-r57',"var WINTER_SHIFT7=[-45,-30,-20,-10,15,25,40,55];","var WINTER_SHIFT7=[-45,-30,-20,-15,15,25,40,55];   /* 1010A：−10 → −15 */")
# ── #1 冬夏季時刻差、成田／羽田 3h05、KX20 3h30（見 js/season10a.js） ──────────────────────────
RC('season pass',R229,"    window.kgmCrewUpdateR928=function(){",
   open('js/season10a.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")

# 人工釘選過的時刻表（之前幾輪使用者指定）也要一起改，不然它們會定時把冬季時刻寫回去：
RC('kx85 pin','kgm-0823d-r57',"  'KX85|FRA|BKK':{winter:{dep:'16:00',arr:'06:00',dd:1}},\n  'KX85|BKK|TPE':{winter:{dep:'07:30',arr:'11:40',dd:0}},\n  'KX85|FRA|TPE':{winter:{dep:'16:00',arr:'11:40',dd:1}}",
   "  /* 1010A：冬夏差至少 15 分 —— 法蘭克福晚 10 分起飛，曼谷回台北冬季 07:25（夏季 07:10） */\n"
   "  'KX85|FRA|BKK':{winter:{dep:'16:10',arr:'06:10',dd:1}},\n  'KX85|BKK|TPE':{winter:{dep:'07:25',arr:'11:45',dd:0}},\n  'KX85|FRA|TPE':{winter:{dep:'16:10',arr:'11:45',dd:1}}")
RC('kx43 r160','kgm-0905b-r160',"                  winter:{dep:'01:20',arr:'07:25',dd:1}},\n  'KX43|ICN|TPE':{summer:{dep:'07:25',arr:'08:30',dd:0},\n                  winter:{dep:'08:40',arr:'09:40',dd:0}}",
   "                  winter:{dep:'01:35',arr:'07:40',dd:1}},   /* 1010A：冬夏差至少 15 分 */\n  'KX43|ICN|TPE':{summer:{dep:'07:25',arr:'08:30',dd:0},\n                  winter:{dep:'08:55',arr:'09:55',dd:0}}")
RC('kx43 r77','kgm-0823p-r77',"      'KX43|LAS|ICN':{summer:['01:20','06:10',1,[2,5,7],'A359'],winter:['01:20','07:25',1,[2,5,7],'A359']},\n      'KX43|ICN|TPE':{summer:['07:25','08:30',0,[1,3,6],'A359'],winter:['08:40','09:40',0,[1,3,6],'A359']},\n      'KX43|LAS|TPE':{summer:['01:20','08:30',1,[2,5,7],'A359'],winter:['01:20','09:40',1,[2,5,7],'A359']},",
   "      'KX43|LAS|ICN':{summer:['01:20','06:10',1,[2,5,7],'A359'],winter:['01:35','07:40',1,[2,5,7],'A359']},   /* 1010A：冬季晚 15 分 */\n      'KX43|ICN|TPE':{summer:['07:25','08:30',0,[1,3,6],'A359'],winter:['08:55','09:55',0,[1,3,6],'A359']},\n      'KX43|LAS|TPE':{summer:['01:20','08:30',1,[2,5,7],'A359'],winter:['01:35','09:55',1,[2,5,7],'A359']},")

RC('r131 skip fixed block','kgm-0903b-r131',"    if(o.summer.viaR179||o.winter.viaR179)return;",
   "    if(o.summer.viaR179||o.winter.viaR179)return;\n    if(o.blockFixedR1010A)return;   /* 1010A：成田／羽田 3h05、KX20 3h30 是使用者指定，冬夏一樣，不再拉開 */")

# ── #6 機隊：常態機型調整、不用 A388 補位、換機紀錄照實際派機重對 ─────────────────────────────
#   實測（w9，一年）：每天換機最多的是 A330 家族（A339L/A339R 共 28 架）在午後一波短程同時出發時不夠用，
#   被換成 B779／A35K：KX282/281 新加坡 40 天、KX260/259 宿霧 40 天、KX272/271 峴港 23 天、KX154/153 名古屋 17 天；
#   B78X 21 架每架每天平均只飛 3.6 小時（全機隊最閒）。使用者：「順便改一些航班常態機型」——
#   這四對改成 B78X 常態（B78X 商務＋經濟，跟亞洲短程不賣豪華經濟艙的規則一致），空出來的 A330 去補其他班。
L143='kgm-0906a-r143'
for c,fr,to in [('KX282','TPE','SIN'),('KX281','SIN','TPE'),('KX260','TPE','CEB'),('KX259','CEB','TPE'),('KX272','TPE','DAD'),('KX271','DAD','TPE')]:
    RC('type143 '+c,L143,"{code:'%s',fr:'%s',to:'%s',acft:'A339L',r1006A:1}"%(c,fr,to),"{code:'%s',fr:'%s',to:'%s',acft:'B78X',r1010A:1}"%(c,fr,to))
RC('type143 NGO',L143,"             {code:'KX263',fr:'CNX',to:'TPE',acft:'A339L',r1006A:1}]);",
   "             {code:'KX263',fr:'CNX',to:'TPE',acft:'A339L',r1006A:1},\n"
   "             /* 1010A #6：名古屋 A339R → B78X（A330 尖峰不夠用，一年被換 17 天） */\n"
   "             {code:'KX154',fr:'TPE',to:'NGO',acft:'B78X',r1010A:1},\n             {code:'KX153',fr:'NGO',to:'TPE',acft:'B78X',r1010A:1},\n"
   "             /* 1010A #6：西雅圖 A35K → B779（A35K 只有 8 架，西雅圖每天一班就佔掉約兩架，墨爾本／伯斯旺日被擠去換 B779） */\n"
   "             {code:'KX24',fr:'TPE',to:'SEA',acft:'B779',r1010A:1},\n             {code:'KX23',fr:'SEA',to:'TPE',acft:'B779',r1010A:1}]);")
#   無機可派的補位：使用者「不要用A388調度後，會大虧」—— 原本時刻表不是 A388 的班，補位候選機型不含 A388（EQV 機型池本來就含 A388 的不受影響）。
RC('r72 no A388 sub','kgm-0823o-r72',"typesWithTails72().filter(function(t){var next=(AC[t]||{}).cabins||{};return !(type==='A21N'",
   "typesWithTails72().filter(function(t){var next=(AC[t]||{}).cabins||{};if(t==='A388'&&type!=='A388')return false;/* 1010A：不用 A388 補位 */return !(type==='A21N'")
RC('r72 no A388 move','kgm-0823o-r72',"typesWithTails72().some(function(t){var c=(AC[t]||{}).cabins||{};if((type==='A21N'&&t!==type)||",
   "typesWithTails72().some(function(t){var c=(AC[t]||{}).cabins||{};if((t==='A388'&&type!=='A388')||(type==='A21N'&&t!==type)||")
#   根本原因（w10 實測）：機隊排班引擎決定「這一班今天算哪個機型」時（r72 dayOf72）呼叫 acftOfFlight，
#   而 acftOfFlight 會先看 ① 目前這一班被排到哪一架（actualTailType0810J）② S.acftSub 裡的自動換機紀錄 ——
#   上一次補位留下的 A35K 紀錄，下一次重排就被當成「時刻表就是 A35K」，A35K 再被排去飛，紀錄再被確認一次，永遠換不回來。
#   排班時只看時刻表（含 EQV 機型池、人工換機、維修），不看自己上一輪的結果。
RC('r72 plan type no feedback','kgm-0823o-r72',"    try{t=acftOfFlight(f.code,date,f.fr,f.to)||f.acft}catch(_){t=f.acft}",
   "    /* 1010A：排班用的機型不看上一輪的派機結果（實際機身、系統自動換機紀錄），否則一次補位就會變成永久換機 */\n"
   "    var sv10=S.acftSub;S.acftSub=planSub10(sv10);window.KGM_PLAN_R1010A=(window.KGM_PLAN_R1010A||0)+1;\n"
   "    try{t=acftOfFlight(f.code,date,f.fr,f.to)||f.acft}catch(_){t=f.acft}finally{window.KGM_PLAN_R1010A--;S.acftSub=sv10}")
RC('r72 plan sub fn','kgm-0823o-r72',"function dayOf72(date){",
   "var PS10={src:null,n:-1,out:null};\n"
   "function planSub10(src){   /* 1010A：只留人工換機與維修改派；自動產生的（auto／auto0810J／coverageR830）不算 */\n"
   "  src=src||{};var n=Object.keys(src).length;if(PS10.src===src&&PS10.n===n&&PS10.out)return PS10.out;\n"
   "  var o={};Object.keys(src).forEach(function(k){var x=src[k];if(!x)return;if((x.auto||x.auto0810J||x.coverageR830)&&!x.manual&&!x.maint&&!x.mx)return;o[k]=x});\n"
   "  PS10.src=src;PS10.n=n;PS10.out=o;return o;\n"
   "}\n"
   "function dayOf72(date){")
RW('0810J plan no tail',"var a=actualTailType0810J(code,date);return a||_acftOfFlight0810J.apply(this,arguments);};",
   "var a=window.KGM_PLAN_R1010A?null:actualTailType0810J(code,date);/* 1010A：排班時不看目前派到哪一架 */return a||_acftOfFlight0810J.apply(this,arguments);};")

RC('sub clean',R229,"    window.kgmCrewUpdateR928=function(){",
   open('js/sub10a.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")

# ── #5 Residence 當日航班清單：KX132 有、KX131 沒有 ──────────────────────────────────────
#   原因：清單用 acftOfFlight(班號,日期) 判斷機型（不分航段、會被舊的自動換機紀錄蓋過），去程與回程各自查，兩個來源可能不一致。
#   改成先看那一段實際排到的機身（S.tailAssign，同一架飛機去回一定一致），沒有排機身才退回 acftOfFlight。
RW('res day list by tail',"      var tp='';try{tp=acftOfFlight(f.code,date)||f.acft||''}catch(_){}\n      var res=false;",
   "      var tp='';try{var tl10=idx10[f.code+'|'+f.fr+'→'+f.to];tp=(tl10&&window._typeOfTail&&window._typeOfTail(tl10))||acftOfFlight(f.code,date)||f.acft||''}catch(_){}   /* 1010A：以該航段實際機身為準 */\n      var res=false;")
RW('res day list idx',"window.kgmResFlightsOnR920=function(date){\n  var out=[];",
   "window.kgmResFlightsOnR920=function(date){\n  var out=[],idx10={};\n  try{Object.keys(S.tailAssign||{}).forEach(function(t){(S.tailAssign[t]||[]).forEach(function(x){if(x&&x.date===date&&!x.noPax)idx10[x.code+'|'+(x.route||((x.fr||'')+'→'+(x.to||'')))]=t})})}catch(_){}")

# ── #8 競標紀錄起飛後要保留：已起飛 60 天內的航班也照種子補出價（js/sub10a.js 的 kgmAucPastR1010A 呼叫） ──
RW('auc past ensure',"      if(!isFinite(hrs)||hrs<=0)return 0;",
   "      if(!isFinite(hrs)||hrs<=-60*24)return 0;\n      if(hrs<=0)hrs=1;   /* 1010A：已起飛 60 天內 —— 補當時的出價紀錄（截標後的歷史），不再一律回傳 0 */")
RW('auc past empty msg',"    if(w.hrs<=0)return z?'這一班已經起飛，沒有競標紀錄。':'Departed; no records.';",
   "    if(w.hrs<=0&&!(key==='res'&&!w.a380))return z?('這一班已經起飛，沒有 '+(key==='res'?'Residence':'BigDeal')+' 出價紀錄。'):'Departed; no bids.';   /* 1010A：真的沒人出價才這樣寫 */")

RW('auc past chip',"    var won=list.some(function(r){return r.status==='won'}),t,c;\n    if(f.kind==='bigdeal'){",
   "    var won=list.some(function(r){return r.status==='won'}),t,c;\n    if(w.hrs<=0)return '<i class=\"k4b-auc-st done\">'+e920(z?'已起飛 · 已結標':'Departed · settled')+'</i>';   /* 1010A */\n    if(f.kind==='bigdeal'){")

# ── KX240／KX239（使用者 1010A 再次提醒：「之前有改到…後來又恢復 Old Version」）──
#   夏 KX240 TPE-DPS 18:45-23:45 B78X、夏 KX239 DPS-TPE 07:20-12:30 B78X；冬 KX240 01:05-06:05 A21N/B78X、冬 KX239 07:35-12:50 A21N/B78X。
#   r77 的寫死表冬季 KX240 是 01:05-05:55，而且冬夏同樣 5 小時會被 r131 拉開 —— 表改成 06:05，season10a ① 把 KX240 標成固定飛行時間。
RW('kx240 r77 winter',"      'KX240|TPE|DPS':{summer:['18:45','23:45',0,'daily','B78X'],winter:['01:05','05:55',0,'daily','EQV']},",
   "      'KX240|TPE|DPS':{summer:['18:45','23:45',0,'daily','B78X'],winter:['01:05','06:05',0,'daily','EQV']},   /* 1010A：使用者指定冬季 01:05-06:05 */")

# ── 退票（使用者 1010A 提醒：旅客端只能整筆退；後台可退單一航段，手續費按段數比例）——規則本來就有（r94／r91），旅客端說明還寫「所勾選航段」，改成全部航段 ──
RW('rf note whole',"送出後此訂位的所勾選航段即取消，座位、餐點與加購服務同時釋出。","送出後此訂位的全部航段即取消，座位、餐點與加購服務同時釋出。")
RW('rf note whole en',"Submitting cancels the ticked sectors and releases seats, meals and extras.","Submitting cancels every sector of this booking and releases seats, meals and extras.")

# ── #9 里程兌換優惠（酬賓／升等）：js/redeem10a.js；後台「里程購買」多一個分頁 ──
RC('redeem promo',R229,"    window.kgmCrewUpdateR928=function(){",
   open('js/redeem10a.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")
RW('mv sub redeem',"var mvSub1004B=S.milesSubR1004B==='promo'?'promo':'review';",
   "var mvSub1004B=S.milesSubR1004B==='promo'?'promo':S.milesSubR1004B==='redeem'?'redeem':'review';   /* 1010A：第三個分頁「里程兌換優惠」 */")
RW('mv nav redeem',"+mvPromoN1004B+'</b></button></div>';",
   "+mvPromoN1004B+'</b></button><button class=\"'+(mvSub1004B==='redeem'?'on':'')+'\" onclick=\"S.milesSubR1004B=\\'redeem\\';render()\">'+(Z6()?'里程兌換優惠':'Redemption offers')+'<b>'+((S.redeemPromosR1010A||[]).filter(function(p){var n=todayISO();return p&&p.active!==false&&(!p.bookTo||p.bookTo>=n)}).length)+'</b></button></div>';")
RW('mv redeem view',"cases=mvTab1004B==='todo'?mvTodo1004B:mvTab1004B==='doing'?mvDoing1004B:mvDone1004B;",
   "if(mvSub1004B==='redeem')return '<div class=\"r6-admin-panel\">'+mvNav1004B+'<div class=\"r6-review-head\"><div><div class=\"r6-eyebrow\">MILES REDEMPTION · AWARD & UPGRADE OFFERS</div><h1>'+(Z6()?'里程兌換優惠':'Redemption offers')+'</h1><p class=\"r6-muted\">'+(Z6()?'酬賓機票、艙等升等所需里程的折扣活動：可限定航線、搭乘日期與兌換期間；前台酬賓搜尋與升等頁會自動套用並顯示。':'Discounts on miles needed for award tickets and upgrades, by route, travel dates and redemption window.')+'</p></div></div>'+(typeof window.kgmRedeemPromoPanelR1010A==='function'?window.kgmRedeemPromoPanelR1010A():'')+'</div>';\ncases=mvTab1004B==='todo'?mvTodo1004B:mvTab1004B==='doing'?mvDoing1004B:mvDone1004B;")

# ── #11 員工 ↔ 會員帳號綁定（js/link10a.js）──
RC('staff link',R229,"    window.kgmCrewUpdateR928=function(){",
   open('js/link10a.js',encoding='utf-8').read()+"    window.kgmCrewUpdateR928=function(){")
RW('staff link row',"+'<dt>'+(Z()?'年資':'Seniority')+'</dt><dd>'+years+(Z()?' 年':' yr')+'</dd>'",
   "+'<dt>'+(Z()?'年資':'Seniority')+'</dt><dd>'+years+(Z()?' 年':' yr')+'</dd>'+(window.kgmStaffLinkRowR1010A?window.kgmStaffLinkRowR1010A(st):'')")

# ── 存檔欄位（S 初始值與 save()） ──
S_INIT_1010A=''.join('%s:LS.get("%s",%s),'%(f,k,d) for f,k,d in PERSIST_1010A)
SAVE_1010A=''.join('LS.set("%s",S.%s||%s);'%(k,f,d) for f,k,d in PERSIST_1010A)
RW('r1010A S init','crewRankR1009B:LS.get("kgm7_crewrank",{}),','crewRankR1009B:LS.get("kgm7_crewrank",{}),'+S_INIT_1010A)
RW('r1010A save','LS.set("kgm7_crewrank",S.crewRankR1009B||{});','LS.set("kgm7_crewrank",S.crewRankR1009B||{});'+SAVE_1010A)

open('p_h_r13.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
