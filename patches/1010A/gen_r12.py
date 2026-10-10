from common import *
import base64, importlib.util
# ══ 1009B ═══════════════════════════════════════════════════════════════════
#   使用者（回答 1009A 的三個問題）：
#   1.「沒賣豪經的航段：商務客滿時副機長改坐經濟？」→「沒有要一階一階往下讓位」→ 維持 1009A（不改）
#   2.「座艙長、副座艙長要不要跟機師一樣看當班位置？」→「要也要可以整體level up(level up後30天後要重新排班)」
#   3.「航線訓練要不要連續帶飛？」→「wdym教官沒有排班就dh回來」
#   ① DH：座艙長、副座艙長看當班位置（r196 的 kgmCabinPositionsR1006A：依職級、年資，第一位座艙長、第二位副座艙長）。
#   ② 職級晉升（副機師→正機師、正機師→教官資格、空服員→副座艙長、副座艙長→座艙長）：核准後第 30 天生效，
#      生效日起用新職級排班（走 r229 的 kgmCrewReplanR928：已公布的班表照樣凍結，只有當事人從生效日起重排，有異動的組員都通知）。
#   ③ 外站多出來的組員送回台北時，教官最先送（原本跟其他正機師一起排隊，常被留在外站沒排班）。
#   ④ 規章：KGM-CHG-003 第十五條（依當班職位）、KGM-HR-001 第十條第九、十二款與新增第十三款（職級晉升）。
CUR=open('/tmp/j/kgm1009A_w4.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))

# ── ① 客艙 DH 看當班位置 ────────────────────────────────────────────────
P121='kgm-0903b-r121'
RC('cabin pos default',P121,"  function posDef1009A(role,rank,i){if(role!=='pilot')return '';",
   "  function posDef1009A(role,rank,i){if(role!=='pilot')return rank==='PU'?'PU':(rank==='DPU'?(i?'FA':'DPU'):'FA');   /* 1009B：客艙也帶位置（每班一位座艙長、一位副座艙長） */")
RC('cabin extra DPU fill FA',P121,"var up929=more929>0?choose(f,'cabin','DPU',more929,used):[];",
   "var up929=more929>0?choose(f,'cabin','DPU',more929,used,'FA'):[];")
RC('return dh cabin pos',P121,"q=f&&(f.pilots||[]).filter(function(x){return x&&x.empId===p.empId})[0];return (q&&q.posCode)||''}return ''}",
   "q=f&&(p.role==='pilot'?(f.pilots||[]):((window.kgmCabinPositionsR1006A&&window.kgmCabinPositionsR1006A(f)),(f.cabin||[]))).filter(function(x){return x&&x.empId===p.empId})[0];return (q&&q.posCode)||''}return ''}   /* 1009B：客艙的位置照 r196 同一套規則 */")
RC('return dh pos all roles',P121,"var ps9=p.role==='pilot'?lastPos1009A(p):'';","var ps9=lastPos1009A(p);")
OPS='kgm-r7-admin-ops'
RC('pos7 cabin',OPS,"  function pos7(p,r){var c=String((p&&p.posR1009A)||'');if(c)return c;return r.role==='pilot'?({CP:'PIC',FO:'SIC',CR:'CRZ'}[r.rank]||''):''}",
   "  function pos7(p,r){var c=String((p&&p.posR1009A)||'');if(c)return c;return r.role==='pilot'?({CP:'PIC',FO:'SIC',CR:'CRZ'}[r.rank]||''):(r.role==='cabin'?r.rank:'')}   /* 1009B：客艙沒有位置就照職級 */")
RC('cabin PU by pos',OPS,"    if(r.role==='cabin'&&r.rank==='PU'&&hasP)return {list:['Premium'],must:'Premium'};     /* 座艙長 */\n",
   "    if(r.role==='cabin'&&c9==='PU'&&hasP)return {list:['Premium'],must:'Premium'};     /* 座艙長（1009B：當班位置） */\n")
RC('cabin DPU by pos',OPS,"    if(r.role==='cabin'&&r.rank==='DPU'&&hasP)return {list:['Premium','Economy'],must:'Economy'};",
   "    if(r.role==='cabin'&&c9==='DPU'&&hasP)return {list:['Premium','Economy'],must:'Economy'};")
RC('prio cabin by pos',OPS,"    if(c==='Premium')return (pl&&ps)||(r.role==='cabin'&&r.rank==='PU')?3:(r.role==='cabin'&&r.rank==='DPU'?1:0);",
   "    if(c==='Premium')return (pl&&ps)||(r.role==='cabin'&&ps==='PU')?3:(r.role==='cabin'&&ps==='DPU'?1:0);   /* 1009B：客艙看當班位置 */")
RC('dh title cabin pos',OPS,"    if(r.role==='cabin')return z7()?({PU:'座艙長',DPU:'副座艙長',FA:'空服員'}[r.rank]||'客艙組員'):({PU:'Purser',DPU:'Assistant purser',FA:'Flight attendant'}[r.rank]||'Cabin crew');return r.role||''}",
   "    if(r.role==='cabin'){var CZ9={PU:'座艙長',DPU:'副座艙長',FA:'空服員'},CE9={PU:'Purser',DPU:'Assistant purser',FA:'Flight attendant'};   /* 1009B：照當班位置，職級不同時括號註明 */\n"
   "      return z7()?((CZ9[c9]||'客艙組員')+(c9&&r.rank&&c9!==r.rank&&CZ9[r.rank]?'（'+CZ9[r.rank]+'）':'')):(CE9[c9]||'Cabin crew')}return r.role||''}")

# ── ② 職級晉升 ──────────────────────────────────────────────────────────
RC('level helpers',P121,"window.kgmCrewPoolR121=pool121;",
   "/* 1009B：職級晉升 —— S.crewLevelR1009B[empId]=[{from,to,at,eff,by}]；生效日（核准後第 30 天）起排班用新職級。\n"
   "   機師池記下原職級（baseRankR1009B），排班引擎算某一天時套用那天的職級，算完還原成今天的職級。 */\n"
   "var LVZH1009B={CP:'正機師',FO:'副機師',CR:'巡航機師',PU:'座艙長',DPU:'副座艙長',FA:'空服員'};\n"
   "function lvOf1009B(p,date){var L=(S.crewLevelR1009B||{})[p.empId],r={rank:p.baseRankR1009B||p.rank,tri:!!p.baseTriR1009B};\n"
   "  (L||[]).forEach(function(x){if(x&&x.eff&&x.eff<=date){if(x.to==='TRI')r.tri=true;else r.rank=x.to}});return r}\n"
   "function lvApply1009B(list,date){var M=S.crewLevelR1009B,any=false;if(M)for(var k in M){any=true;break}if(!any)return;\n"
   "  list.forEach(function(p){if(!M[p.empId])return;var r=lvOf1009B(p,date);p.rank=r.rank;p.rankZH=LVZH1009B[r.rank]||p.rankZH;if(p.role==='pilot')p.triR1009A=r.rank==='CP'&&r.tri})}\n"
   "window.kgmCrewLevelOfR1009B=function(empId,date){try{var P=pool121(),p=P.pilots.concat(P.cabin).filter(function(x){return x&&x.empId===empId})[0];if(!p)return null;\n"
   "  var r=lvOf1009B(p,date||T());r.zh=LVZH1009B[r.rank]||'';r.role=p.role;return r}catch(_){return null}};\n"
   "window.kgmCrewPoolR121=pool121;")
RC('pool base rank',P121,
   "pilots.forEach(function(p){p.triR1009A=p.rank==='CP'&&(H(p.empId+'|tri1009A')%10===0)});   /* 1009A：約一成正機師具教官資格（TRI／TRE） */\n"
   "  POOL121={pilots:pilots,cabin:cabin,byType:byType};POOLSTAMP=stamp;",
   "pilots.forEach(function(p){p.triR1009A=p.rank==='CP'&&(H(p.empId+'|tri1009A')%10===0)});   /* 1009A：約一成正機師具教官資格（TRI／TRE） */\n"
   "  /* 1009B：正式組員的職級固定下來 —— 職級原本是每次開頁依機型族需求、排序重新分配，同一個人這次是副機師、下次可能是正機師（實測 K60003），\n"
   "     晉升就沒有意義。第一次分到的職級存進 S.crewRankR1009B，之後一律沿用；排班池的虛擬組員照舊依機型族平衡。 */\n"
   "  (function(){var RS9=S.crewRankR1009B=S.crewRankR1009B||{},st9={},n9=0;(S.staff||[]).forEach(function(s){if(s&&s.empId&&(s.role==='pilot'||s.role==='cabin'))st9[s.empId]=1});\n"
   "    pilots.concat(cabin).forEach(function(p){if(!st9[p.empId])return;var r=RS9[p.empId];if(r){if(r!==p.rank){p.rank=r;p.rankZH=LVZH1009B[r]||p.rankZH}}else{RS9[p.empId]=p.rank;n9++}});\n"
   "    if(n9)setTimeout(function(){try{save()}catch(_){}},0)})();\n"
   "  pilots.forEach(function(p){p.triR1009A=p.rank==='CP'&&(H(p.empId+'|tri1009A')%10===0)});\n"
   "  pilots.concat(cabin).forEach(function(p){p.baseRankR1009B=p.rank;p.baseTriR1009B=!!p.triR1009A});lvApply1009B(pilots.concat(cabin),T());   /* 1009B：記下原職級，套用今天已生效的晉升 */\n"
   "  POOL121={pilots:pilots,cabin:cabin,byType:byType};POOLSTAMP=stamp;")
RC('plan rank of the day',P121,"var flights=window.kgmFlightsOnR121(date),P=pool121(),people=P.pilots.concat(P.cabin),byId={},buckets={},violations=[],busy={},monthLoads={};",
   "var flights=window.kgmFlightsOnR121(date),P=pool121(),people=P.pilots.concat(P.cabin),byId={},buckets={},violations=[],busy={},monthLoads={};lvApply1009B(people,date);   /* 1009B：這一天的職級（晉升生效日起用新職級） */")
RC('plan rank restore',P121,"  return MEM121[date]={date:date,sig:date+'|'+flights.length,flights:rows,standby:standby,violations:violations,pilotsUsed:Object.keys(busy).length,builtAt:new Date().toISOString(),authoritative0911:true};",
   "  lvApply1009B(people,T());   /* 1009B：算完把職級還原成今天的 */\n"
   "  return MEM121[date]={date:date,sig:date+'|'+flights.length,flights:rows,standby:standby,violations:violations,pilotsUsed:Object.keys(busy).length,builtAt:new Date().toISOString(),authoritative0911:true};")
RW('level S init','dhBumpR1007A:LS.get("kgm7_dhbump",{}),','dhBumpR1007A:LS.get("kgm7_dhbump",{}),crewLevelR1009B:LS.get("kgm7_crewlvl",{}),crewRankR1009B:LS.get("kgm7_crewrank",{}),')
RW('level save','LS.set("kgm7_dhbump",S.dhBumpR1007A||{});','LS.set("kgm7_dhbump",S.dhBumpR1007A||{});LS.set("kgm7_crewlvl",S.crewLevelR1009B||{});LS.set("kgm7_crewrank",S.crewRankR1009B||{});')
R229='kgm-0909E-r229'
RC('level up action',R229,"    window.kgmCrewUpdateR928=function(){",
   "    /* 1009B：職級晉升（level up）—— 核准後第 30 天生效，生效日起重新排班；已公布的班表照樣凍結，只有當事人從生效日起重排，有異動的組員都通知 */\n"
   "    var LVNX9B={FO:'CP',CR:'CP',FA:'DPU',DPU:'PU'},LVZH9B={CP:'正機師',FO:'副機師',CR:'巡航機師',PU:'座艙長',DPU:'副座艙長',FA:'空服員',TRI:'教官資格'};\n"
   "    function E9b(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]})}\n"
   "    function lvNext9B(id){var f=window.kgmCrewLevelOfR1009B&&window.kgmCrewLevelOfR1009B(id,'9999-12-31');if(!f)return null;var nx=f.rank==='CP'?(f.tri?null:'TRI'):LVNX9B[f.rank];return nx?{from:f.rank==='CP'&&nx==='TRI'?'CP':f.rank,to:nx,role:f.role}:null}\n"
   "    function lvCan9B(){try{if((S.adminUser||{}).role==='ceo')return true;return !!(window.kgmPermR123&&window.kgmPermR123('sched')==='use')}catch(_){return false}}\n"
   "    window.kgmLevelUpBtnR1009B=function(id){\n"
   "      try{if(!(S.staff||[]).some(function(s){return s&&s.empId===id}))return '';\n"
   "        var L=((S.crewLevelR1009B||{})[id]||[]),t=todayISO(),pend=L.filter(function(x){return x&&x.eff>t}),nx=lvNext9B(id);\n"
   "        var h='<span class=\"k9b-lv\" style=\"display:inline-flex;gap:8px;align-items:center;margin-left:12px;flex-wrap:wrap;vertical-align:middle\">';\n"
   "        pend.forEach(function(x){h+='<em style=\"font-style:normal;font-size:12px;padding:3px 10px;border-radius:999px;background:#fff4dc;color:#7a5200;border:1px solid #f0d9a6\">'\n"
   "          +(Z()?'已核准晉升：':'Promotion approved: ')+E9b(LVZH9B[x.from]||x.from)+' → '+E9b(LVZH9B[x.to]||x.to)+(Z()?'（'+x.eff+' 生效，生效日起重新排班）':' (effective '+x.eff+')')+'</em>'});\n"
   "        if(nx&&lvCan9B())h+='<button class=\"btn btn-sm\"'+(S._crBusy928?' disabled':'')+' onclick=\"kgmLevelUpR1009B(\\''+E9b(id)+'\\')\">'+(Z()?'升等：':'Level up: ')+E9b(LVZH9B[nx.from]||nx.from)+' → '+E9b(LVZH9B[nx.to]||nx.to)+'</button>';\n"
   "        return h+'</span>'}catch(_){return ''}};\n"
   "    window.kgmLevelUpR1009B=function(id,silent){\n"
   "      var nx=lvNext9B(id),st=(S.staff||[]).filter(function(s){return s&&s.empId===id})[0];if(!nx||!st||!lvCan9B())return false;\n"
   "      var eff=AD(todayISO(),30),fz=LVZH9B[nx.from]||nx.from,tz=LVZH9B[nx.to]||nx.to;\n"
   "      if(!silent&&!confirm(Z()?(st.name+'（'+id+'）'+fz+' → '+tz+'\\n核准後第 30 天（'+eff+'）生效，生效日起依新職級重新排班；生效日前的班表不變。\\n確定核准？'):('Promote '+st.name+' to '+nx.to+' effective '+eff+'?')))return false;\n"
   "      var ex={};ex[id]=eff;\n"
   "      window.kgmCrewReplanR928({from:todayISO(),to:AD(eff,13),exclude:ex,   /* 從今天起全部凍結（生效日前的班表不動），只有當事人從生效日起重排 */\n"
   "        reason:(Z()?'職級晉升 ':'Promotion ')+st.name+' '+fz+' → '+tz+'（'+eff+' 生效）',\n"
   "        apply:function(){S.crewLevelR1009B=S.crewLevelR1009B||{};(S.crewLevelR1009B[id]=S.crewLevelR1009B[id]||[]).push({from:nx.from,to:nx.to,at:new Date().toISOString(),eff:eff,by:(S.adminUser||{}).empId||''})},\n"
   "        done:function(rec){try{notifyStaff(id,'【職級晉升】'+fz+' → '+tz+'，'+eff+' 生效；生效日起依新職級排班。')}catch(_){}\n"
   "          S._crMsg928=(Z()?'✓ '+st.name+' 晉升「'+tz+'」已核准（'+eff+' 生效）：生效日起重新排班，'+rec.n+' 位組員班表有異動並已通知。':'Promotion approved; '+rec.n+' rosters changed.')}});\n"
   "      return true;\n"
   "    };\n"
   "    window.kgmCrewUpdateR928=function(){")
RC('roster header level up','kgm-0907A-r196',"      +'</span></div>'\n    +'<div class=\"k196-kpi\">'",
   "      +'</span>'+(window.kgmLevelUpBtnR1009B?window.kgmLevelUpBtnR1009B(id):'')+'</div>'   /* 1009B：職級晉升 */\n    +'<div class=\"k196-kpi\">'")

# ── ③ 教官沒排班就調位回台北 ────────────────────────────────────────────
RC('release instructors',P121,"list.slice(keep).concat(list.slice(0,keep).filter(function(p){return off928(p.empId,D(date,-1))})).forEach(",
   "list.slice(keep).concat(list.slice(0,keep).filter(function(p){return off928(p.empId,D(date,-1))||p.triR1009A})).forEach(")   # 1009B：教官不佔外站的保留名額 —— 當天沒排到班就調位回台北

# ── ④ 規章 ──────────────────────────────────────────────────────────────
def load(name,path):
    sp=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
docs=json.load(open('docs_r914.json',encoding='utf-8'))
old6=load('pol6_1009A','../1009A/pol6.py').build(docs)['KGM-CHG-003']
new6=load('pol6_1009B','pol6.py').build(docs)['KGM-CHG-003']
R86='kgm-0831c-r86'
RC('chg003 doc',R86,'"KGM-CHG-003":%s'%json.dumps(old6,ensure_ascii=False,separators=(',',':')),'"KGM-CHG-003":%s'%json.dumps(new6,ensure_ascii=False,separators=(',',':')))
P=open('pol/KGM-HR-001.pdf','rb').read()   # 由 pol/render_pol.py 排版（hr_doc.py 的條文），與 ZIP 內 17_KGM_員工管理辦法.pdf 同一份
import pypdf, io
NP=len(pypdf.PdfReader(io.BytesIO(P)).pages)
a=CUR.index("window.KGM_EMP_POLICY_PDF_R1004B='")+len("window.KGM_EMP_POLICY_PDF_R1004B='");e=CUR.index("'",a)
RC('hr001 pdf',R86,CUR[a:e],'data:application/pdf;base64,'+base64.b64encode(P).decode())
RC('hr001 pages',R86,"  ver:'2026.10（Rev. B）',eff:'2026-10-06',pages:12,arts:32,","  ver:'2026.10（Rev. B）',eff:'2026-10-06',pages:%d,arts:32,"%NP)
save('p_h_r12.js','/* 1009B · 客艙 DH 看當班位置、職級晉升（30 天生效並重排）、教官沒排班就調位回台北、規章同步 */\n')
