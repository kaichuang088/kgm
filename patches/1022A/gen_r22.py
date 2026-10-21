from common import *
import json
# ══ 1022A ═══════════════════════════════════════════════════════════════════
#   使用者（1020B 交付後）：
#   「圖一不應該有下面那一些」（手機頁尾下面多一條白色空白）
#   「還有後台定位管理那裡要可以把乘客端的更改票全線關閉」
#   「圖二這種航班注意喔，有中停的價錢一定要低於直飛」（TPE→MEL：KX60 經 KUL 比 KX54 直飛貴）
#   「航班資料那裡組員、地勤、飛行員要直接列出他們接下來七天的航班，不能有搜尋功能（只能看到自己負責的航班，一但班表有更新這個也要更新，
#     也只能看到自己負責的部分，像是飛行資料只有飛行員看得到）」
#   「航班資料PDF要包含飛行資料和營運建議（for機長/ceo），還有之前講過要包含特別注意的旅客（金卡、鑽石卡、評分<2）也要列出來分艙等」
#   「圖三航班資料每一個旁邊都要有一個展開+和收起來-的按鈕不然整個太多了要滑到下面很麻煩」
#   「圖四有寫TPE-SYD via BKK很棒啊 但是像是圖五為啥沒有」（停機位查詢只有 KX50 寫死）
#   比對基準：1020B 最終版 w9（/tmp/j/kgm1020B_w9.html，patches/1020B/build.sh 重建）。
CUR=open('/tmp/j/kgm1020B_w9.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 航班資料 PDF：飛行資料（載重平衡、燃油估算）＋給機長／給 CEO 的營運建議＋特別留意旅客依艙等（金卡、鑽石卡、評分 < 2）—— ops18 → ops22 ══
RW('ops22',JS('ops18.js'),JS('ops22.js'))
# PDF 的載重平衡跟航班資料頁同一個函式：r7 loadBalance7 開出來，算完把數字留一份給 PDF 讀
RC('r7 expose lb','kgm-r7-admin-ops',"  function opsPage7(){",
   "  window.kgmLoadBalanceR1022A=loadBalance7;   /* 1022A：航班資料 PDF 的「飛行資料」讀同一個載重平衡 */\n  function opsPage7(){")
RC('r7 lb stash','kgm-r7-admin-ops',"    var util=Math.round(zfw/mzfw*1000)/10;\n    return '<section class=\"r7-ops-card r7-loadbal\">'",
   "    var util=Math.round(zfw/mzfw*1000)/10;\n"
   "    try{window.KGM_LB_R1022A=window.KGM_LB_R1022A||{};window.KGM_LB_R1022A[f.code+'|'+date+'|'+f.fr]={type:t,bagN:bagN,holdKg:holdKg,paxKg:paxKg,cabinKg:cabinKg,zfw:zfw,mzfw:mzfw,Z:Z,idx:Math.round(idx*10)/10,util:util,okBand:okBand,move:move,dir:dir,advice:advice}}catch(_){}   /* 1022A */\n"
   "    return '<section class=\"r7-ops-card r7-loadbal\">'")

# ══ r55 權限表：使用者「飛行資料只有飛行員看得到」、PDF「for 機長／CEO」→ 客艙組員拿掉（原本 flight／pdf 都有 cabin）══
RC('r55 perm flight','kgm-0823c-r55',"  flight:['cabin','pilot','ceo'],","  flight:['pilot','ceo'],          /* 1022A：飛行資料只有飛行員（使用者） */")
RC('r55 perm pdf','kgm-0823c-r55',"  pdf:['cabin','pilot','ceo']","  pdf:['pilot','ceo']               /* 1022A：PDF 給機長／CEO */")
RC('r55 hero all','kgm-0823c-r55',"      if(c.classList.contains('r7-manifest'))return;",
   "      if(c.classList.contains('r7-manifest'))return;\n      if(c.classList.contains('r7-ops-hero'))return;   /* 1022A：最上面的航班概況（班號、表定時間、人數）大家都要看得到是哪一班；飛行資料（天氣、航路、載重）仍只給飛行員 */")
# 頁面權限矩陣：0915A 空服員看不到航班資料頁 → 使用者 1022A「航班資料那裡組員、地勤、飛行員要直接列出他們接下來七天的航班」→ 空服員給檢視（只看得到自己的班，k22）
RC('r123 crew flightdata','kgm-0903b-r123',"  crew:{status:'view',sched:'view',mgr12:'use',leave:'use',stafftix:'use',stxstatus:'use',",
   "  crew:{flightdata:'view',   /* 1022A：使用者要組員在航班資料看到自己接下來 7 天的航班（只看得到自己的班與自己負責的區塊） */\n    status:'view',sched:'view',mgr12:'use',leave:'use',stafftix:'use',stxstatus:'use',")

# ══ 停機位查詢：所有經停直飛班都寫「起點→終點 via 經停站」（原本只寫死 KX50）══════════════
RC('r74 route label','kgm-0823o-r74',
   "function routeLabel74(f){\n  if(f&&f.code==='KX50'&&f.fr==='TPE')return 'TPE→SYD via BKK';\n  return f?(f.fr+'→'+f.to):'';\n}",
   "function routeLabel74(f,date){\n"
   "  /* 1022A：原本只寫死 KX50；改成查同一班號、從這一站出發、經停站＝這一段終點的經停列（f.via），有就寫「起點→終點 via 經停站」 */\n"
   "  if(!f)return '';\n"
   "  try{var dt=date?new Date(date+'T12:00:00'):null;\n"
   "    var V=allF().filter(function(x){return x&&x.via&&x.code===f.code&&x.fr===f.fr&&x.via===f.to&&(!dt||flyOn(x,dt))})[0];\n"
   "    if(V)return f.fr+'→'+V.to+' via '+f.to}catch(_){}\n"
   "  return f.fr+'→'+f.to;\n}")
RC('r74 label date 1','kgm-0823o-r74',"routeLabel:routeLabel74(f)","routeLabel:routeLabel74(f,date)")
RC('r74 label date 2','kgm-0823o-r74',"E(routeLabel74(f))","E(routeLabel74(f,date))",2)

# ══ 航班資料（組員看自己 7 天）讀組員班表同一份：r196 的 60 天索引只在「組員班表」分頁才會往前算（READY196），
#    其他分頁 kgmRosterR196 永遠回 0 天 → 加第三個參數 anyDay：呼叫端已經確認那幾天的組員計畫算好了（kgmCrewHasDayR121），就直接讀當天索引 ══
RC('r196 anyDay','kgm-0907A-r196',"window.kgmRosterR196=function(empId,days){\n  var out=[],n=Math.min(days||DAYS196,READY196);",
   "window.kgmRosterR196=function(empId,days,anyDay){\n  var out=[],n=anyDay?(days||DAYS196):Math.min(days||DAYS196,READY196);   /* 1022A：anyDay＝不等 r196 背景進度（航班資料頁自己暖好組員計畫） */")

# ══ 旅客自助改票總開關（定位管理）：存檔＋前後台同步（r229 只認 save() 裡 LS.set 的寫法）══════
RW('selfchg init','crewFreezeR928:LS.get("kgm12_crewfrz",{}),',
   'crewFreezeR928:LS.get("kgm12_crewfrz",{}),selfChgR1022A:LS.get("kgm22_selfchg",null),')
RW('selfchg save','LS.set("kgm12_crewfrz",S.crewFreezeR928',
   'LS.set("kgm22_selfchg",S.selfChgR1022A||null);LS.set("kgm12_crewfrz",S.crewFreezeR928')

# ══ 手機：頁尾下面那條白色空白 —— #app 的 padding-bottom（讓出下排五鈕）落在深色頁尾「下面」；
#    有頁尾的頁面改成把那段高度加在頁尾裡面（頁尾的深色一路延伸到下排五鈕後面），沒有頁尾的頁面照舊 ══
RW('mb footer gap',"    +F+'#app{padding-bottom:calc(66px + env(safe-area-inset-bottom))}'",
   "    +F+'#app{padding-bottom:calc(66px + env(safe-area-inset-bottom))}'\n"
   "    +F+'#app:has(>footer){padding-bottom:0}'+F+'#app>footer::after{content:\"\";display:block;height:calc(66px + env(safe-area-inset-bottom))}'   /* 1022A：頁尾下面不留白 */")

# ══ k22：中停票價低於直飛、改票總開關、航班資料（組員／地勤只看自己 7 天）、區塊 +/−（r229 最後，fl20b 之後）══
RW('k22 embed',JS('fl20b.js'),JS('fl20b.js')+JS('k22.js'))

open('p_h_r22.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
