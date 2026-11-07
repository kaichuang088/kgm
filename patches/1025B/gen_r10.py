from common import *
import base64
# ══ 1008C ═══════════════════════════════════════════════════════════════════
#   使用者（回答 1008B 的問題 4）：「要正機長和副機長都要商務 然後巡航可以豪經」
#   ① DH 艙等：正機師、副機師 → 商務艙；巡航機師 → 豪華經濟艙（不賣豪經的航段 → 商務艙）；座艙長、其他組員照舊。
#   ② 「CP 被標成副機師」：航班組員查詢問到「當天沒有飛的班」（例：KX106 只在旺季週一四五日飛，10-10 週六）時，
#      交給最舊的組員產生器，它照排序貼職稱，三個正機師被標成正／副／巡航 —— 當天沒有這班就直接回空的。
#   ③ 規章 KGM-CHG-003 第十五條、KGM-HR-001 第十條第九款與修訂履歷同步改（網站內嵌條文與後台內嵌 PDF、ZIP 內 PDF 同一份來源）。
CUR=open('/tmp/j/kgm1008B_w3.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
OPS='kgm-r7-admin-ops'
RC('dh cabins pilots',OPS,
   "    if(r.role==='pilot'&&r.rank==='CP'&&hasB)return {list:['Business'],must:'Business'};   /* 機長（正機師） */\n",
   "    if(r.role==='pilot'&&(r.rank==='CP'||r.rank==='FO')&&hasB)return {list:['Business'],must:'Business'};   /* 1008C：正機師、副機師都坐商務艙 */\n"
   "    if(r.role==='pilot'&&r.rank==='CR'&&(hasP||hasB))return hasP?{list:['Premium','Business'],must:'Premium'}:{list:['Business'],must:'Business'};   /* 1008C：巡航機師豪經（沒有豪經 → 商務） */\n")
RC('dh trip page text',OPS,"座位由公司指派（機長商務艙、座艙長豪華經濟艙、其他組員經濟艙），",
   "座位由公司指派（正、副機師商務艙，巡航機師與座艙長豪華經濟艙，其他組員經濟艙），")
RC('dh flight data text',OPS,"DH 是確認座位，優先於員工票候補。機長商務艙、座艙長豪華經濟艙、其他組員經濟艙。",
   "DH 是確認座位，優先於員工票候補。正、副機師商務艙，巡航機師與座艙長豪華經濟艙，其他組員經濟艙。")

# ② 當天沒有這班 → 不交給舊產生器（舊產生器照排序貼「正／副／巡航」）
RC('crew lookup not operating','kgm-0817b-r43',
   "      var c=window.kgmCrewOfR43(code,date);\n      if(c){",
   "      try{var d8c=window.kgmDayOf72R1006A?window.kgmDayOf72R1006A(date):null;   /* 1008C：這天沒有飛這班 → 回空的，不再隨機編組員 */\n"
   "        if(d8c&&d8c.length&&!d8c.some(function(r){return r&&r.f&&r.f.code===code}))return {roster:[],sched:[],synth:[],sourceR43:true,notOperatingR1008C:true}}catch(_){}\n"
   "      var c=window.kgmCrewOfR43(code,date);\n      if(c){")
# 排班計畫以外（60 天後）的日子，r43 會從整個機師池隨機抽人、照排序貼職稱 → 正機師位置只抽正機師、其餘只抽副機師，職稱照本人職級
RC('r43 draw by rank','kgm-0817b-r43',
   "  var pr=draw(pilots,size.pilots,'p'),cr=draw(cabin,size.cabin,'c');",
   "  var RK8=null;try{var P8=window.kgmCrewPoolR121&&window.kgmCrewPoolR121();if(P8){RK8={};(P8.pilots||[]).forEach(function(r){RK8[r.empId]=r.rank})}}catch(_){}   /* 1008C */\n"
   "  var pr=null;if(RK8){var cp8=pilots.filter(function(p){return RK8[p.empId]==='CP'}),fo8=pilots.filter(function(p){return RK8[p.empId]==='FO'||RK8[p.empId]==='CR'});if(cp8.length&&fo8.length)pr=draw(cp8,1,'pc').concat(draw(fo8,Math.max(0,size.pilots-1),'pf'))}\n"
   "  if(!pr)pr=draw(pilots,size.pilots,'p');var cr=draw(cabin,size.cabin,'c');")
RC('r43 label by rank','kgm-0817b-r43',
   "      rank:(PILOT_RANKS[Math.min(i,2)]||PILOT_RANKS[2])[1]}}),",
   "      rank:(RK8&&RK8[p.empId])?({CP:'正機師',FO:'副機師',CR:'巡航機師'}[RK8[p.empId]]||(PILOT_RANKS[Math.min(i,2)]||PILOT_RANKS[2])[1]):(PILOT_RANKS[Math.min(i,2)]||PILOT_RANKS[2])[1]}}),   /* 1008C：職稱照本人職級，不照排序 */")

# ③ 規章（網站內嵌的 KGM-CHG-003 條文）＋後台內嵌的員工管理辦法 PDF
R86='kgm-0831c-r86'
RC('chg003 dh cabins',R86,"<b>機長為商務艙</b>，<b>座艙長為豪華經濟艙</b>（未販售豪華經濟艙之航段為經濟艙），其他組員為經濟艙；",
   "<b>正機師及副機師（機長、副機長）為商務艙</b>，<b>巡航機師為豪華經濟艙</b>（未販售豪華經濟艙之航段為商務艙），<b>座艙長為豪華經濟艙</b>（未販售豪華經濟艙之航段為經濟艙），其他組員為經濟艙；")
RC('chg003 dh release',R86,"<p>機長或座艙長應搭乘之艙等已無空位時，","<p>正機師、副機師、巡航機師或座艙長應搭乘之艙等已無空位時，")
P=open('pol/KGM-HR-001.pdf','rb').read()   # 由 pol/render_pol.py 排版（hr_doc.py 的條文），與 ZIP 內 17_KGM_員工管理辦法.pdf 同一份
a=CUR.index("window.KGM_EMP_POLICY_PDF_R1004B='")+len("window.KGM_EMP_POLICY_PDF_R1004B='");e=CUR.index("'",a)
RC('hr001 pdf',R86,CUR[a:e],'data:application/pdf;base64,'+base64.b64encode(P).decode())
# ④ 分頁標題「KGM Airways · 1008C · 1008C · 1008C」：0908B r206 的標題守門只剝「0 開頭」的版號（0\d{3}[A-Z]），
#    1004A 起版號是 1 開頭就剝不掉，每寫一次標題就多接一段。改成四位數字＋字母都剝掉，只留一個目前版號（0908B 使用者要求過的行為）。
RC('title guard strip','kgm-0908B-r206',"var STRIP=/[\\s]*[·—–\\-|][\\s]*0\\d{3}[A-Z](?=$|[\\s·—–\\-|])/g;",
   "var STRIP=/[\\s]*[·—–\\-|][\\s]*\\d{4}[A-Z](?=$|[\\s·—–\\-|])/g;   /* 1008C：1 開頭的版號也要剝（原本只剝 0 開頭，標題會一直疊加） */")
RC('title guard bare','kgm-0908B-r206',"t=t.replace(/\\b0\\d{3}[A-Z]\\b/g,'')","t=t.replace(/\\b\\d{4}[A-Z]\\b/g,'')")
# ⑤ 組員班表「位置接不上就補一段」（r210）沒有看同城機場：人在松山、下一段從桃園出發，被補成「DH TSA→TPE」（0929A #6 要求同城不算調位）。
#    實測 60 天班表 2 段（2026-11-26 兩位機師）。同城 → 跟排班引擎 r121 同一種地面轉場（格式、登記方式相同）；其他照舊補 DH。
RC('chain same-city ground transfer','kgm-0908B-r210',
   "    if(legs.length&&at&&legs[0].fr!==at&&!_hasDh){\n      var dh=chainDhR913(empId,at,legs[0].fr,date,legs[0].depUTC);\n",
   "    if(legs.length&&at&&legs[0].fr!==at&&!_hasDh&&window.kgmSameCityR928&&window.kgmSameCityR928(at,legs[0].fr)){   /* 1008C：同城另一個機場 → 地面轉場，不是 DH */\n"
   "      var gA8c=(typeof legs[0].depUTC==='number')?legs[0].depUTC-75:null,gD8c=gA8c==null?null:gA8c-120,\n"
   "        gt8c={code:'地面轉場',fr:at,to:legs[0].fr,date:date,arrDate:date,dep:'',arr:'',depUTC:gD8c,arrUTC:gA8c,reportUTC:gD8c,releaseUTC:gA8c,dd:0,block:0,blockStr:'地面',acft:'—',type:'—',\n"
   "          deadhead:true,operating:false,surfaceR928:true,remark:(typeof z==='function'&&z()?'地面轉場（同城機場）':'Ground transfer (same city)')};\n"
   "      legs.unshift(gt8c);\n"
   "      try{S.crewPositioningR121=S.crewPositioningR121||{};var gk8c=[date,'GT',gt8c.fr,gt8c.to].join('|'),GK8c=window.KGM_GT_KEYS_R928=window.KGM_GT_KEYS_R928||{};\n"
   "        if(!S.crewPositioningR121[gk8c])(GK8c[date]=GK8c[date]||[]).push(gk8c);\n"
   "        var gl8c=(S.crewPositioningR121[gk8c]=S.crewPositioningR121[gk8c]||[]);\n"
   "        if(!gl8c.some(function(z2){return z2&&z2.empId===empId}))gl8c.push({empId:empId,name:staff.name||'',role:staff.role||'',cabin:'—',seat:'',surfaceR928:true,flight:Object.assign({},gt8c)})}catch(_){}\n"
   "    }else if(legs.length&&at&&legs[0].fr!==at&&!_hasDh){\n      var dh=chainDhR913(empId,at,legs[0].fr,date,legs[0].depUTC);\n")
save('p_h_r10.js','/* 1008C · DH 機師艙等（正副機師商務、巡航豪經）、航班組員查詢不再替沒飛的班編組員、規章同步、分頁標題版號不再重複、班表同城補位改地面轉場 */\n')
