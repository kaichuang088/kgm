from common import *
import base64, importlib.util
# ══ 1009A ═══════════════════════════════════════════════════════════════════
#   使用者（回答 1008C 的三個問題）：
#   1.「第 17 條改成改票留改票紀錄編號，退票才留案件編號」→ 好
#   2.「教官：班表標『訓練』、教官坐其中一個機師位置」→ 好
#   3.「巡航機師豪經，所以 DH 商務是機長副機長(priority last)或教官、DH Premium 是巡航機長或是乘務長/副乘務長(Priority Last)、
#      DH Econ 是組員，如果真的商務沒有位置就要把副機長換到豪經然後如果豪經沒有位置就把副乘務長換到經濟」
#   ① 機師位置：每一班第一位正機師＝機長（航線訓練時＝教官），第一位副機師＝副機長，其餘＝巡航機師（看位置，不看職級）。
#   ② 航線訓練：約 6% 航班，教官（約一成正機師具資格）坐機長位置，副機長為受訓人員；職稱標「・教官・訓練」「・訓練」「・巡航」。
#   ③ DH 艙等：機長／副機長／教官商務；巡航機師、座艙長、副座艙長豪經；其他經濟。同艙等的順位：商務艙副機長最後、豪經副座艙長最後，
#      位子不夠時副機長移到豪經、副座艙長移到經濟（排班當下就移，不先請旅客下機）；移完還是不夠才走 1007A 的 72 小時騰位。
#   ④ 改票紀錄編號：官網改票、票務中心改票、地勤現場改票三條路都留 CHG＋年月日＋4 碼（不是案件編號）；後台訂位歷程列出來。
#   ⑤ 規章：KGM-CHG-003 第十五條（DH 艙等與順位）、第十七條（紀錄編號）、第十八條；KGM-HR-001 第十條第九、十一、十二款。
CUR=open('/tmp/j/kgm1008C_w4.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))

# ── ① ② 排班引擎（r121）──────────────────────────────────────────────
P121='kgm-0903b-r121'
RC('pool instructors',P121,"POOL121={pilots:pilots,cabin:cabin,byType:byType};POOLSTAMP=stamp;",
   "pilots.forEach(function(p){p.triR1009A=p.rank==='CP'&&(H(p.empId+'|tri1009A')%10===0)});   /* 1009A：約一成正機師具教官資格（TRI／TRE） */\n"
   "  POOL121={pilots:pilots,cabin:cabin,byType:byType};POOLSTAMP=stamp;")
RC('eligible instructor',P121,"  function eligible(p,f,rank,ignoreLocation){\n    if(rank&&p.rank!==rank)return false;",
   "  function eligible(p,f,rank,ignoreLocation){\n    if(rank==='TRI'){if(p.rank!=='CP'||!p.triR1009A)return false}else if(rank&&p.rank!==rank)return false;   /* 1009A：TRI＝具教官資格的正機師 */")
RC('choose pos',P121,"  function choose(f,role,rank,n,used){",
   "  /* 1009A：機師在這一班的位置 —— 第一位正機師＝機長（航線訓練時＝教官），第一位副機師＝副機長，其餘＝巡航機師。\n"
   "     調位（DH）去接這一班時，用這個位置決定艙等（巡航看位置，不看職級）。 */\n"
   "  var DHPOS1009A='';\n"
   "  function posDef1009A(role,rank,i){if(role!=='pilot')return '';if(rank==='TRI')return 'TRI';if(rank==='CP')return i?'CRZ':'PIC';if(rank==='FO')return i?'CRZ':'SIC';return 'CRZ'}\n"
   "  function train1009A(f){if(f.positioning||f.noPax||f.positioningR830)return false;return H(String(f.code)+'|'+date+'|trn1009A')%100<6}   /* 約 6% 航班安排航線訓練，同一班同一天結果固定 */\n"
   "  function choose(f,role,rank,n,used,pos9){")
RC('choose reposition pos',P121,"if(reposition(remaining[k],f))list.push(remaining[k])",
   "DHPOS1009A=pos9||posDef1009A(role,rank,list.length);if(reposition(remaining[k],f))list.push(remaining[k])")
RC('reposition slot pos',P121,"slot=window.kgmDhSlotR1007A(p,m,m.date,slot)||slot",
   "slot=window.kgmDhSlotR1007A(Object.assign({},p,{posR1009A:DHPOS1009A}),m,m.date,slot)||slot")
RC('reposition record pos',P121,"(S.crewPositioningR121[key]=S.crewPositioningR121[key]||[]).push({empId:p.empId,name:p.name,role:p.role,cabin:slots[j].cabin,seat:slots[j].seat,flight:",
   "(S.crewPositioningR121[key]=S.crewPositioningR121[key]||[]).push({empId:p.empId,name:p.name,role:p.role,posR1009A:DHPOS1009A,cabin:slots[j].cabin,seat:slots[j].seat,flight:")
RC('rows training',P121,
   "      pilots=choose(f,'pilot','CP',comp.n>=4?2:1,used).concat(choose(f,'pilot','FO',comp.n>=4?2:1,used));\n"
   "      if(pilots.length<comp.n)pilots=pilots.concat(choose(f,'pilot',null,comp.n-pilots.length,used));",
   "      var tr9=train1009A(f)?choose(f,'pilot','TRI',1,used,'TRI'):[];   /* 1009A：航線訓練 —— 教官坐機長位置；找不到有空的教官就照一般航班排 */\n"
   "      pilots=(tr9.length?tr9.concat(comp.n>=4?choose(f,'pilot','CP',1,used,'CRZ'):[]):choose(f,'pilot','CP',comp.n>=4?2:1,used)).concat(choose(f,'pilot','FO',comp.n>=4?2:1,used));\n"
   "      if(pilots.length<comp.n)pilots=pilots.concat(choose(f,'pilot',null,comp.n-pilots.length,used,'CRZ'));")
RC('rows positions',P121,
   "    function rec(p){return {empId:p.empId,name:p.name,rank:p.rankZH,rankCode:p.rank,seniority:p.seniority}}\n"
   "    return Object.assign({},f,{blockStr:hhm(f.block),complement:comp,requiredCabin:cabN,minimumRestMinutes:minRest,pilots:pilots.map(rec),cabin:cabin.map(rec)});",
   "    function rec(p){return {empId:p.empId,name:p.name,rank:p.rankZH,rankCode:p.rank,seniority:p.seniority}}\n"
   "    /* 1009A：機師位置與職稱 —— 機長／教官／副機長／巡航；職稱後面標「・巡航」「・教官・訓練」「・訓練」 */\n"
   "    var pic9=-1,sic9=-1;pilots.forEach(function(p,i){if(pic9<0&&p.rank==='CP')pic9=i;else if(sic9<0&&p.rank==='FO')sic9=i});\n"
   "    var trn9=!!(tr9&&tr9.length&&pic9>=0&&pilots[pic9]===tr9[0]);\n"
   "    function prec9(p,i){var r=rec(p),c=i===pic9?(trn9?'TRI':'PIC'):(i===sic9?'SIC':'CRZ');r.posCode=c;r.posZH={PIC:'機長',TRI:'教官',SIC:'副機長',CRZ:'巡航機師'}[c];\n"
   "      r.rank=c==='TRI'?(p.rankZH+'・教官・訓練'):(c==='SIC'&&trn9)?(p.rankZH+'・訓練'):c==='CRZ'?(p.rank==='CR'?p.rankZH:p.rankZH+'・巡航'):p.rankZH;if(trn9)r.trainingR1009A=true;return r}\n"
   "    return Object.assign({},f,{blockStr:hhm(f.block),complement:comp,requiredCabin:cabN,minimumRestMinutes:minRest,pilots:pilots.map(prec9),cabin:cabin.map(rec),trainingR1009A:trn9});")

RC('return dh pos helper',P121,"  var nextNeed={},stationGroups={};",
   "  /* 1009A：飛完以旅客身分回台北的調位 —— 位置照他最後一段執勤航班（機長／副機長／巡航） */\n"
   "  function lastPos1009A(p){var h=history(p).days;for(var i=h.length-1;i>=0;i--){var d=h[i];if(!d||d.deadhead||!d.code)continue;"
   "var pl=d.date===date?{flights:rows}:MEM121[d.date],f=pl&&(pl.flights||[]).filter(function(x){return x&&x.code===d.code&&x.fr===d.fr})[0],q=f&&(f.pilots||[]).filter(function(x){return x&&x.empId===p.empId})[0];return (q&&q.posCode)||''}return ''}\n"
   "  var nextNeed={},stationGroups={};")
RC('return dh pos',P121,"var st=history(p);if(st.days.some(function(d){return d.date===date}))return;var candidates=flights.filter(",
   "var st=history(p);if(st.days.some(function(d){return d.date===date}))return;var ps9=p.role==='pilot'?lastPos1009A(p):'';var candidates=flights.filter(")
RC('return dh slot pos',P121,"try{if(window.kgmDhSlotR1007A)slot=window.kgmDhSlotR1007A(p,m,date,slot)||slot}catch(_){}if(slot.hardR1007A)continue;/* 1007A */var key=[date,m.code,m.fr,m.to].join('|');S.crewPositioningR121=S.crewPositioningR121||{};(S.crewPositioningR121[key]=S.crewPositioningR121[key]||[]).push({empId:p.empId,name:p.name,role:p.role,cabin:slot.cabin,",
   "try{if(window.kgmDhSlotR1007A)slot=window.kgmDhSlotR1007A(Object.assign({},p,{posR1009A:ps9}),m,date,slot)||slot}catch(_){}if(slot.hardR1007A)continue;/* 1007A */var key=[date,m.code,m.fr,m.to].join('|');S.crewPositioningR121=S.crewPositioningR121||{};(S.crewPositioningR121[key]=S.crewPositioningR121[key]||[]).push({empId:p.empId,name:p.name,role:p.role,posR1009A:ps9,cabin:slot.cabin,")

# ── 組員班表鏈（r210）：班表上的段帶位置；位置接不上補的 DH 用下一段的位置 ──
P210='kgm-0908B-r210'
OP9="((legs.filter(function(l9){return l9&&!l9.deadhead})[0])||{}).posR1009A||''"
RC('chain leg pos',P210,"legs.push(Object.assign({},f,{acft:f.type,rank:p.rank,reportUTC:f.depUTC-60,releaseUTC:f.arrUTC+30,arrDate:D(date,f.dd||0)}))",
   "legs.push(Object.assign({},f,{acft:f.type,rank:p.rank,posR1009A:p.posCode||'',reportUTC:f.depUTC-60,releaseUTC:f.arrUTC+30,arrDate:D(date,f.dd||0)}))")
RC('chain dh slot pos',P210,"return window.kgmDhSlotR1007A({empId:e,role:s.role||''},{code:c,fr:lg.fr,to:lg.to,type:''},lg.d,null)",
   "return window.kgmDhSlotR1007A({empId:e,role:s.role||'',posR1009A:"+OP9+"},{code:c,fr:lg.fr,to:lg.to,type:''},lg.d,null)")
RC('chain dh record pos',P210,"lst.push({empId:empId,name:staff.name||'',role:staff.role||'',cabin:((sl7=dhSlR210(empId,staff,lg,dh))&&sl7.cabin)||'Economy',seat:(sl7&&sl7.seat)||'',",
   "lst.push({empId:empId,name:staff.name||'',role:staff.role||'',posR1009A:"+OP9+",cabin:((sl7=dhSlR210(empId,staff,lg,dh))&&sl7.cabin)||'Economy',seat:(sl7&&sl7.seat)||'',")

RC('roster per-leg rank','kgm-0908B-r211',"var legs=(c.legs||[]).map(function(l){return toRow(l,rank)});",
   "var legs=(c.legs||[]).map(function(l){return toRow(l,(l&&!l.deadhead&&l.rank)||rank)});   /* 1009A：每一段用自己的職稱（巡航、教官・訓練、訓練），不是整個人一個職稱 */")

# ── ③ DH 艙等與順位（kgm-r7-admin-ops）─────────────────────────────────
OPS='kgm-r7-admin-ops'
RC('dh cabins',OPS,
   "    if(r.role==='pilot'&&(r.rank==='CP'||r.rank==='FO')&&hasB)return {list:['Business'],must:'Business'};   /* 1008C：正機師、副機師都坐商務艙 */\n"
   "    if(r.role==='pilot'&&r.rank==='CR'&&(hasP||hasB))return hasP?{list:['Premium','Business'],must:'Premium'}:{list:['Business'],must:'Business'};   /* 1008C：巡航機師豪經（沒有豪經 → 商務） */\n"
   "    if(r.role==='cabin'&&r.rank==='PU'&&hasP)return {list:['Premium'],must:'Premium'};     /* 座艙長 */\n",
   "    /* 1009A：機師看這一班的位置（機長／教官／副機長／巡航），客艙組員看職級 */\n"
   "    var c9=pos7(p,r);\n"
   "    if(r.role==='pilot'&&(c9==='PIC'||c9==='TRI')&&hasB)return {list:['Business'],must:'Business'};   /* 機長、教官 */\n"
   "    if(r.role==='pilot'&&c9==='SIC'&&hasB)return hasP?{list:['Business','Premium'],must:'Premium'}:{list:['Business','Economy'],must:'Economy'};   /* 副機長：商務艙順位最後，沒位子就豪經 */\n"
   "    if(r.role==='pilot'&&c9==='CRZ'&&(hasP||hasB))return hasP?{list:['Premium','Business'],must:'Premium'}:{list:['Business'],must:'Business'};   /* 巡航機師豪經（沒有豪經 → 商務） */\n"
   "    if(r.role==='cabin'&&r.rank==='PU'&&hasP)return {list:['Premium'],must:'Premium'};     /* 座艙長 */\n"
   "    if(r.role==='cabin'&&r.rank==='DPU'&&hasP)return {list:['Premium','Economy'],must:'Economy'};     /* 1009A：副座艙長豪經，順位最後，沒位子就經濟 */\n")
RC('dh title + priority helpers',OPS,
   "  function dhTitle7(p){var r=rankOf7(p);if(r.role==='pilot')return z7()?({CP:'機長（正機師）',FO:'副機師',CR:'巡航機師'}[r.rank]||'飛行員'):({CP:'Captain',FO:'First officer',CR:'Cruise relief'}[r.rank]||'Pilot');\n",
   "  /* 1009A：調位紀錄上的位置（排班引擎記的）；舊紀錄沒有就照職級 */\n"
   "  function pos7(p,r){var c=String((p&&p.posR1009A)||'');if(c)return c;return r.role==='pilot'?({CP:'PIC',FO:'SIC',CR:'CRZ'}[r.rank]||''):''}\n"
   "  /* 1009A：同一艙等裡的順位（數字大＝優先）。商務：機長、教官 3，副機長 2，其他借坐 0；豪經：巡航、座艙長、副機長 3，副座艙長 1，其他借坐 0 */\n"
   "  function prio9(q,c){var r=rankOf7(q),ps=pos7(q,r),pl=r.role==='pilot';\n"
   "    if(c==='Business')return pl&&(ps==='PIC'||ps==='TRI')?3:(pl&&ps==='SIC'?2:0);\n"
   "    if(c==='Premium')return (pl&&ps)||(r.role==='cabin'&&r.rank==='PU')?3:(r.role==='cabin'&&r.rank==='DPU'?1:0);\n"
   "    return 0}\n"
   "  function free9(m,date,c,lst,ex){var t={},n=0;lst.forEach(function(q){if(!q||q.surfaceR928||ex[q.empId])return;if(q.seat)t[q.seat]=1;if(q.cabin===c)n++});\n"
   "    var inv=inv7(m,date,c),fr=(inv.seats||[]).filter(function(s){return !t[s]}),cap=(+inv.capacity||0)-(+inv.sold||0)-n;return cap>0&&fr.length?fr[0]:''}\n"
   "  /* c 艙裡順位比 X 低的調位組員，移到他自己的下一個艙等（副機長 → 豪經、副座艙長 → 經濟）；回傳空出來的座位 */\n"
   "  function bump9(X,c,m,date,f,lst,ex,depth){\n"
   "    var px=prio9(X,c);if(px<=0)return null;\n"
   "    var cand=lst.filter(function(q){return q&&!q.surfaceR928&&!ex[q.empId]&&q.cabin===c&&prio9(q,c)<px})\n"
   "      .sort(function(a,b){return prio9(a,c)-prio9(b,c)||(a.seat?0:1)-(b.seat?0:1)});\n"
   "    if(!cand.length)return null;\n"
   "    var q=cand[0],seat=q.seat||'';move9(q,c,m,date,f,lst,ex,depth+1);return {seat:seat};\n"
   "  }\n"
   "  function move9(q,from,m,date,f,lst,ex,depth){\n"
   "    var w=wantCabs7(q,f,date),e2=Object.assign({},ex);e2[q.empId]=1;\n"
   "    for(var i=0;i<w.list.length;i++){var c=w.list[i];if(c===from)continue;\n"
   "      var s=free9(m,date,c,lst,e2);if(s){q.cabin=c;q.seat=s;q.movedR1009A=from;return}\n"
   "      if(depth<2){var b=bump9(q,c,m,date,f,lst,e2,depth);if(b){q.cabin=c;q.seat=b.seat;q.movedR1009A=from;return}}\n"
   "    }\n"
   "    var nc=w.must!==from?w.must:(w.list.filter(function(c){return c!==from})[0]||w.must);if(nc!==from)q.movedR1009A=from;q.cabin=nc;q.seat='';   /* 還是沒有位子：72 小時騰位處理 */\n"
   "  }\n"
   "  function dhTitle7(p){var r=rankOf7(p),c9=pos7(p,r);if(r.role==='pilot'){   /* 1009A：照位置 */\n"
   "      var zh9={PIC:'機長（正機師）',TRI:'教官（正機師）',SIC:'副機長（'+(r.zh||'副機師')+'）',CRZ:'巡航機師'+(r.rank&&r.rank!=='CR'&&r.zh?'（'+r.zh+'）':'')}[c9],en9={PIC:'Captain',TRI:'Instructor',SIC:'First officer',CRZ:'Cruise relief'}[c9];\n"
   "      return z7()?(zh9||({CP:'機長（正機師）',FO:'副機師',CR:'巡航機師'}[r.rank]||'飛行員')):(en9||({CP:'Captain',FO:'First officer',CR:'Cruise relief'}[r.rank]||'Pilot'))}\n")
RC('dh slot priority',OPS,
   "      var key=[date,m.code,m.fr,m.to].join('|'),lst=(S.crewPositioningR121||{})[key]||[],taken={},inC={};\n"
   "      lst.forEach(function(q){if(!q||q.empId===p.empId)return;if(q.seat)taken[q.seat]=1;inC[q.cabin]=(inC[q.cabin]||0)+1});\n"
   "      for(var i=0;i<w.list.length;i++){\n"
   "        var c=w.list[i],inv=inv7(m,date,c);\n"
   "        /* 快取的庫存可能是這班其他 DH 入座前或入座後算的：空位先扣掉其他 DH 的座位，可售數用「座位數－已售－其他 DH」，兩者取小 */\n"
   "        var free=(inv.seats||[]).filter(function(s){return !taken[s]}),cap=(+inv.capacity||0)-(+inv.sold||0)-(inC[c]||0);\n"
   "        if(cap>0&&free.length)return {cabin:c,seat:free[0]};\n"
   "      }\n",
   "      var key=[date,m.code,m.fr,m.to].join('|'),lst=(S.crewPositioningR121||{})[key]||[],ex9={};ex9[p.empId]=1;\n"
   "      for(var i=0;i<w.list.length;i++){\n"
   "        var c=w.list[i];\n"
   "        /* 快取的庫存可能是這班其他 DH 入座前或入座後算的：空位先扣掉其他 DH 的座位，可售數用「座位數－已售－其他 DH」，兩者取小 */\n"
   "        var s9=free9(m,date,c,lst,ex9);if(s9)return {cabin:c,seat:s9};\n"
   "        /* 1009A：這一艙沒有空位 → 先請順位比較低的調位組員往下移（副機長 → 豪經、副座艙長 → 經濟），不先請旅客下機 */\n"
   "        var b9=bump9(p,c,m,date,f,lst,ex9,0);if(b9)return b9.seat?{cabin:c,seat:b9.seat}:{cabin:c,seat:'',bump:true};\n"
   "      }\n")
RC('dh trip page text',OPS,"座位由公司指派（正、副機師商務艙，巡航機師與座艙長豪華經濟艙，其他組員經濟艙），",
   "座位由公司指派（機長、副機長、教官商務艙；巡航機師、座艙長、副座艙長豪華經濟艙；其他組員經濟艙。商務艙客滿時副機長改坐豪華經濟艙，豪華經濟艙客滿時副座艙長改坐經濟艙），")
RC('dh flight data text',OPS,"DH 是確認座位，優先於員工票候補。正、副機師商務艙，巡航機師與座艙長豪華經濟艙，其他組員經濟艙。",
   "DH 是確認座位，優先於員工票候補。機長、副機長、教官商務艙；巡航機師、座艙長、副座艙長豪經；其他組員經濟艙。商務艙客滿時副機長改坐豪經，豪經客滿時副座艙長改坐經濟艙。")

# ── ④ 改票紀錄編號 ────────────────────────────────────────────────────
R74='kgm-0823o-r74'
RC('chg no fn',R74,"function groundWrite74(b,key,f,cls,date){",
   "/* 1009A：改票紀錄編號（KGM-CHG-003 第十七條）—— 更改及改票不成立案件，但每一筆都留紀錄編號；\n"
   "   格式 CHG＋年月日＋4 碼，跟案件編號（KG…M）分得開。官網改票、票務中心改票、地勤現場改票共用。 */\n"
   "window.kgmChgNoR1009A=function(b){\n"
   "  var d=new Date(),ymd=String(d.getFullYear()).slice(-2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'),used={},A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';\n"
   "  (S.bookings||[]).forEach(function(x){if(!x)return;(x.changeHistory||[]).concat(x.reissueLogR45||[]).forEach(function(y){if(y&&y.recNo)used[y.recNo]=1})});\n"
   "  for(var i=0;i<50;i++){var h=hash74(((b&&b.pnr)||'')+'|'+Date.now()+'|'+i),c='';for(var k=0;k<4;k++){c+=A[h%A.length];h=Math.floor(h/A.length)+(k+1)*7919}var no='CHG'+ymd+'-'+c;if(!used[no])return no}\n"
   "  return 'CHG'+ymd+'-'+Date.now().toString(36).slice(-4).toUpperCase();\n"
   "};\n"
   "function groundWrite74(b,key,f,cls,date){")
RC('ground rec no',R74,"caseNo=groundCaseNo74();","caseNo=(window.kgmChgNoR1009A?window.kgmChgNoR1009A(b):groundCaseNo74());   /* 1009A：改票紀錄編號，不是案件編號 */")
RC('ground rec field',R74,",mode:'ground-counter',by:by,caseNo:caseNo});",",mode:'ground-counter',by:by,caseNo:caseNo,recNo:caseNo});")
RC('ground charge note',R74,"note:'Case '+caseNo+' · on-site reissue'","note:'Record '+caseNo+' · on-site reissue'")
R45='kgm-0818b-r45'
RC('desk rec no',R45,"b.reissueLogR45.push({at:new Date().toISOString(),seg:segKey,",
   "var recNo9=(window.kgmChgNoR1009A?window.kgmChgNoR1009A(b):'');   /* 1009A：改票紀錄編號 */\n  b.reissueLogR45.push({recNo:recNo9,at:new Date().toISOString(),seg:segKey,")
RC('desk notif rec no',R45,"        +(z()?'。原座位已取消，請重新選位。':'. Your seat was released; please choose a new one.'));",
   "        +(z()?'。原座位已取消，請重新選位。':'. Your seat was released; please choose a new one.')\n"
   "        +(recNo9?(z()?'改票紀錄編號 ':' Change record ')+recNo9:''));")
RW('online rec no',
   "  if(!bk.changeHistory)bk.changeHistory=[];\n  bk.changeHistory.push({seg:seg,from:oldDate,to:newDate,fromFlight:oldCode,toFlight:newF.code,",
   "  if(!bk.changeHistory)bk.changeHistory=[];\n  var recNo9=(window.kgmChgNoR1009A?window.kgmChgNoR1009A(bk):'');   /* 1009A：改票紀錄編號 */\n"
   "  bk.changeHistory.push({recNo:recNo9,seg:seg,from:oldDate,to:newDate,fromFlight:oldCode,toFlight:newF.code,")
RW('online notif rec no',
   "message:LANG===\"en\"?\"PNR \"+pnr+\": \"+seg+\" changed to \"+newDate:\"訂位 \"+pnr+\" \"+( seg===\"inb\"?\"回程\":\"去程\")+\"已改至 \"+newDate,date:todayISO(),read:false});",
   "message:(LANG===\"en\"?\"PNR \"+pnr+\": \"+seg+\" changed to \"+newDate:\"訂位 \"+pnr+\" \"+( seg===\"inb\"?\"回程\":\"去程\")+\"已改至 \"+newDate)+(recNo9?(LANG===\"en\"?\" · Change record \":\"．改票紀錄編號 \")+recNo9:\"\"),date:todayISO(),read:false});")
RW('online alert rec no',
   "  alert(\"✓ \"+(LANG===\"en\"?\"Flight changed to \"+newDate:\"航班已改至 \"+newDate)+\"。\");\n}\nfunction doChangeFlight(pnr,code,fr,to){",
   "  alert(\"✓ \"+(LANG===\"en\"?\"Flight changed to \"+newDate:\"航班已改至 \"+newDate)+\"。\"+(recNo9?(\"\\n\"+(LANG===\"en\"?\"Change record \":\"改票紀錄編號 \")+recNo9):\"\"));\n}\nfunction doChangeFlight(pnr,code,fr,to){")
R152='kgm-0908a-r152'
RC('history reissue rec no',R152,
   "          +(z()?'　合計 NT$':'　total NT$')+N(x.total)+(x.by?('　'+x.by):''),x.caseNo||'');\n"
   "      if(x.caseNo)cases.push({id:x.caseNo,kind:z()?'改票':'Reissue'});\n"
   "    });\n",
   "          +(z()?'　合計 NT$':'　total NT$')+N(x.total)+(x.by?('　'+x.by):''),x.recNo||x.caseNo||'');   /* 1009A：改票紀錄編號；改票不是案件，不列入案件清單 */\n"
   "    });\n"
   "    /* 1009A：旅客在官網自己改的票（changeHistory）也列進來 */\n"
   "    (b.changeHistory||[]).forEach(function(x){\n"
   "      push152(out,x.at,z()?'改票':'REISSUE',\n"
   "        (z()?'官網改票 ':'Online change ')+(x.fromFlight||'')+' '+(x.from||'')+' → '+(x.toFlight||'')+' '+(x.to||''),\n"
   "        (z()?'手續費 NT$':'fee NT$')+N(x.fee||0)+(z()?'　票差 NT$':'　diff NT$')+N(x.fareDifference||0),x.recNo||'');\n"
   "    });\n")

# ── ⑤ 規章：網站內嵌條文（KGM-CHG-003）與後台內嵌 PDF（KGM-HR-001）────────
def load(name,path):
    sp=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
docs=json.load(open('docs_r914.json',encoding='utf-8'))
old6=load('pol6_1008C','../1008C/pol6.py').build(docs)['KGM-CHG-003']
new6=load('pol6_1009A','pol6.py').build(docs)['KGM-CHG-003']
R86='kgm-0831c-r86'
RC('chg003 doc',R86,'"KGM-CHG-003":%s'%json.dumps(old6,ensure_ascii=False,separators=(',',':')),'"KGM-CHG-003":%s'%json.dumps(new6,ensure_ascii=False,separators=(',',':')))
P=open('pol/KGM-HR-001.pdf','rb').read()   # 由 pol/render_pol.py 排版（hr_doc.py 的條文），與 ZIP 內 17_KGM_員工管理辦法.pdf 同一份
import pypdf, io
NP=len(pypdf.PdfReader(io.BytesIO(P)).pages)
a=CUR.index("window.KGM_EMP_POLICY_PDF_R1004B='")+len("window.KGM_EMP_POLICY_PDF_R1004B='");e=CUR.index("'",a)
RC('hr001 pdf',R86,CUR[a:e],'data:application/pdf;base64,'+base64.b64encode(P).decode())
RC('hr001 pages',R86,"  ver:'2026.10（Rev. B）',eff:'2026-10-06',pages:11,arts:32,","  ver:'2026.10（Rev. B）',eff:'2026-10-06',pages:%d,arts:32,"%NP)
save('p_h_r11.js','/* 1009A · 機師位置（機長／教官／副機長／巡航）與航線訓練、DH 艙等順位、改票紀錄編號、規章同步 */\n')
