from common import *
import json
# ══ 1019A ═══════════════════════════════════════════════════════════════════
#   使用者（1018B 交付後，版號定為 1019A）：
#   ①「重新開放系統已關閉的階：要」（票價分析的艙位格子可以把系統關掉的階重新開放）
#   ②「轉機票價：轉機兩段可賣的代號對不上時，只看第一段 …要（修）」
#   ④「航班動態要可以看到TPE即將抵達或出發的航班 像是這種General的 KGM的航班有些也可以有聯營代碼喔！！…搜尋的那個一樣保留只是多一個這種航班動態主頁」（js/fb19.js）
#   比對基準：1018B 最終版 w13（/tmp/j/kgm1018B_w13.html，patches/1018B/build.sh 重建）。
CUR=open('/tmp/j/kgm1018B_w13.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()

# ══ ② 轉機票價兩段都要賣得到（js/cn19.js 放在最後一層 r229 最前面）══════════════════════
RW('cn19 embed','<script id="kgm-0909E-r229">\n','<script id="kgm-0909E-r229">\n'+JS('cn19.js')+JS('fb19.js'))   # fb19＝④ 航班動態機場看板＋KGM 航班掛夥伴代碼
RW('cn19 grid',
   '  var vc=validCodes(f1).filter(function(k){return k!=="R"&&validCodes(f2).indexOf(k)>=0;});\n  if(!vc.length)vc=validCodes(f1).filter(function(k){return k!=="R";});\n',
   '  var vc=window.kgmConnCodesR1019A?window.kgmConnCodesR1019A(f1,f2,pax):validCodes(f1).filter(function(k){return k!=="R"&&validCodes(f2).indexOf(k)>=0;});   /* 1019A：兩段都賣得到的代號（不再退回只看第一段） */\n')
RW('cn19 row price',
   "        var v1=[],v2=[];try{v1=validCodes(f1)||[];v2=validCodes(f2)||[]}catch(_){}\n        for(var i=i0;i<order.length;i++){\n          var cs=CAB_CODES(order[i]).filter(function(k){return k!=='R'&&v1.indexOf(k)>=0});",
   "        var v1=[];try{v1=window.kgmConnCodesR1019A?window.kgmConnCodesR1019A(f1,f2,pax):(validCodes(f1)||[])}catch(_){}   /* 1019A：跟轉機票價卡同一份（兩段都賣得到） */\n        for(var i=i0;i<order.length;i++){\n          var cs=CAB_CODES(order[i]).filter(function(k){return k!=='R'&&v1.indexOf(k)>=0});")
RW('cn19 pick leg2',
   '  const code2=validCodes(cn.f2).includes(fareCode)?fareCode:(validCodes(cn.f2)[0]||"B");\n  if(dir==="out"){\n    S.outF={...cn.f1,isConn:true,connF2:{...cn.f2},connCode2:code2,connHub:cn.hub,connLayover:cn.layover,date:cn.f1.date||date||S.search.dep};\n    S.outC=fareCode;',
   '  /* 1019A：轉機卡賣的代號兩段都有位子 → 第二段用同一個代號（原本第二段不是「第一個能賣的」就被換成第二段清單的第一個，價錢跟卡片對不上） */\n  const c19=window.kgmConnCodesR1019A?window.kgmConnCodesR1019A(cn.f1,cn.f2,(S.search&&S.search.pax)||1):[];\n  const code2=(c19.indexOf(fareCode)>=0||validCodes(cn.f2).includes(fareCode))?fareCode:(validCodes(cn.f2)[0]||"B");\n  if(dir==="out"){\n    S.outF={...cn.f1,isConn:true,connF2:{...cn.f2},connCode2:code2,connHub:cn.hub,connLayover:cn.layover,date:cn.f1.date||date||S.search.dep};\n    S.outC=fareCode;')
RW('cn19 leg2 fare',
   '    if(vc.length&&vc.indexOf(c2)<0)c2=(vc.indexOf(c)>=0?c:vc[0]);',
   '    if(vc.length&&vc.indexOf(c2)<0&&!(c2===c&&FARES[c2]))c2=(vc.indexOf(c)>=0?c:vc[0]);   /* 1019A：第二段跟第一段同一個代號（轉機卡選的）就照這個代號算，不換成別的方案 */')

# ══ ① 重新開放系統已關閉的階（票價分析的艙位格子座位可以比系統多）═══════════════════════════
RC('bks19 helper','kgm-0823c-r54','function sell54(code,date,flight){\n',
   "/* 1019A：票價分析人工設定的這一階座位（S.fareRulesR929 的 bucket 規則帶 seatsR1019A；KGM_BKS_OFF_R1019A＝量系統原本的值時暫時不看） */\n"
   "function bks19(flight,date,code){if(window.KGM_BKS_OFF_R1019A)return null;var L=S.fareRulesR929;if(!L||!L.length)return null;\n"
   "  for(var i=L.length-1;i>=0;i--){var r=L[i];if(r&&!r.off&&r.seatsR1019A!=null&&r.bucket===code&&r.code===flight.code&&r.from===date&&r.to===date&&(!r.fr||r.fr===flight.fr)&&(!r.toAp||r.toAp===flight.to))return r}return null}\n"
   "window.kgmBucketSeatR1019A=bks19;\n"
   "function sell54(code,date,flight){\n")
RC('bks19 apply','kgm-0823c-r54',
   "  if(cab==='Economy'&&left>0&&typeof window.kgmRmEcoCloseR1014A==='function'){try{if(window.kgmRmEcoCloseR1014A(flight,date))left=0}catch(_){}}\n  return left;\n}\nsell54.__canonical54=true;",
   "  if(cab==='Economy'&&left>0&&typeof window.kgmRmEcoCloseR1014A==='function'){try{if(window.kgmRmEcoCloseR1014A(flight,date))left=0}catch(_){}}\n"
   "  /* 1019A：票價分析人工設定這一階的座位（使用者：「重新開放系統已關閉的階…要」）—— 可以比系統多（重新開放）也可以比系統少；\n"
   "     設定之後這一階真的賣掉的從設定值扣，最多是這一艙實際空位。人工設定優先於系統（包含上面的經濟艙營收管理售完）。 */\n"
   "  var r19=bks19(flight,date,code);if(r19)left=Math.max(0,Math.min(inv.left,(+r19.seatsR1019A||0)-Math.max(0,(inv.fareCounts[code]||0)-(+r19.soldR1019A||0))));\n"
   "  return left;\n}\nsell54.__canonical54=true;")
RW('fa19 editor',open('../1018B/js/fa18b.js',encoding='utf-8').read(),JS('fa18b.js'))
RW('fa19 rule list',
   """          +'<td><span class="fa18-m '+(p>0?'up':'dn')+'">'+(p>0?'+':'')+p+'%</span></td><td>'+E(r.note||'')+'</td>""",
   """          +'<td>'+((r.seatsR1019A==null||Math.abs(p)>=0.05)?'<span class="fa18-m '+(p>0?'up':'dn')+'">'+(p>0?'+':'')+p+'%</span>':'')   /* 1019A：艙位格子的座位設定也列出來 */
          +(r.seatsR1019A!=null?'<div style="font-size:11px;font-weight:800;color:#1F4E46;margin-top:2px">'+(z()?'可售 ':'Seats ')+E(String(r.seatsR1019A))+(r.bucket?' · '+E(r.bucket):'')+'</div>':'')+'</td><td>'+E(r.note||'')+'</td>""")

# ══ ③ 時刻調整（使用者審 00:00～02:59 抵達的 20 班之後指定）═══════════════════════════════
#   「KX288/KX287都提早1-1.5小時」→ 1.5 小時；「KX212/KX211提早1.5-2小時」→ 2 小時；「KX282/KX281提早2-2.5hr」→ 2.5 小時
#   （都取區間上限：抵達儘量不要落在半夜）；KX37「你直接寫新時間 反正抵達台北時間最好是04:00-05:00上午」→ 夏 00:20–04:55⁺¹（15h35）、冬 00:05–04:50⁺¹（15h45）
#   （網站波士頓固定 UTC−5、不算夏令時間，飛行時間照網站的算法；都比去程 KX38 夏 15h25／冬 14h40 長；夏季 KX38 22:30 落地 → 00:20 起飛，過站 1h50 ≥ B789 90 分；
#   冬夏起飛差 15 分＝r229 1010A 規則下限（差不到 15 分它會自己把冬季往後推，w2 實測推成 01:25–06:15）；
#   冬季抵達不能跟夏季同一個時間：r106 會當成「改了起飛忘了改抵達」把抵達跟著移，r131 再拉開 5 分（w3 實測 04:55 → 04:35））；
#   「KX51提早15分鐘」→ 夏季（審的那幾列是夏季；冬季 22:55 抵達本來就在午夜前）。
#   直飛：寫進 r77 定值表 tt929（seededR57=0、pinnedR179=1，r68 不再位移）；已存過、標了 userR929A 的紀錄只有還是 1018B 的值才換（MIG19A）。
#   KX51：雪梨起飛是 r179 用前段落地＋75 分算的；夏季只飛奧克蘭（基督城那段夏季 days=[]）→ 奧克蘭→雪梨跟雪梨→台北的夏季一起往前 15 分
#   （值還是 1018B／r77 預設才換）。基督城那段不能動：新瀏覽器的冬季是從它的夏季推出來的，動了冬季會一起變（w1 實測冬季變 18:05）。
RC('tt19 fixed','kgm-0823p-r77',
   "'A359'],winter:['07:00','11:10',0,[1,2,3,4,5,6,7],'A359']}\n    };",
   "'A359'],winter:['07:00','11:10',0,[1,2,3,4,5,6,7],'A359']}\n"
   "      /* 1019A：使用者審 00:00～02:59 抵達後指定（KX288/287 提早 1.5h、KX212/211 提早 2h、KX282/281 提早 2.5h、KX37 抵達台北 04:00～05:00） */\n"
   "      ,'KX288|TPE|SGN':{summer:['22:05','23:55',0,'daily','B779'],winter:['22:20','00:00',1,'daily','B779']},'KX287|SGN|TPE':{summer:['01:25','05:30',0,'daily','B779'],winter:['01:40','05:35',0,'daily','B779']}\n"
   "      ,'KX212|TPE|HAN':{summer:['22:55','00:10',1,'daily','A339R'],winter:['22:40','00:05',1,'daily','A339R']},'KX211|HAN|TPE':{summer:['05:40','09:05',0,'daily','A339R'],winter:['05:25','09:00',0,'daily','A339R']}\n"
   "      ,'KX282|TPE|SIN':{summer:['14:05','18:00',0,'daily','B78X'],winter:['14:45','18:25',0,'daily','B78X']},'KX281|SIN|TPE':{summer:['19:30','23:45',0,'daily','B78X'],winter:['20:10','00:10',1,'daily','B78X']}\n"
   "      ,'KX37|BOS|TPE':{summer:['00:20','04:55',1,[2,4,5,7],'B789'],winter:['00:05','04:50',1,[2,4,5,7],'B789']}\n"
   "    };")
RC('tt19 migrate','kgm-0823p-r77',
   "      if(old&&old.userR929A&&MIG18B[k]&&old.summer&&MIG18B[k].indexOf(old.summer.dep+'-'+old.summer.arr)>=0){old.summer=rec(v.summer);old.updatedAt=new Date().toISOString()}\n",
   "      if(old&&old.userR929A&&MIG18B[k]&&old.summer&&MIG18B[k].indexOf(old.summer.dep+'-'+old.summer.arr)>=0){old.summer=rec(v.summer);old.updatedAt=new Date().toISOString()}\n"
   "      var MIG19A={'KX288|TPE|SGN':['23:35-01:25','23:50-01:30'],'KX287|SGN|TPE':['02:55-07:00','03:10-07:05'],'KX212|TPE|HAN':['00:55-02:10','00:40-02:05'],'KX211|HAN|TPE':['07:40-11:05','07:25-11:00'],\n"
   "        'KX282|TPE|SIN':['16:35-20:30','17:15-20:55'],'KX281|SIN|TPE':['22:00-02:15','22:40-02:40'],'KX37|BOS|TPE':['01:50-04:10','01:05-02:40']};   /* 1019A：1018B 的值才換，人工改過的不動 */\n"
   "      if(old&&old.userR929A&&MIG19A[k])['summer','winter'].forEach(function(q,qi){if(old[q]&&MIG19A[k][qi]===old[q].dep+'-'+old[q].arr){old[q]=rec(v[q]);old.updatedAt=new Date().toISOString()}});\n")
RC('kx51 summer 1019A','kgm-0823p-r77',
   "      if(f&&window.kgmClearDerivedOverridesR57){window.kgmClearDerivedOverridesR57(f,'summer');window.kgmClearDerivedOverridesR57(f,'winter')}\n    });\n  }catch(_){}\n  /* 0928A：台北⇄峇里島",
   "      if(f&&window.kgmClearDerivedOverridesR57){window.kgmClearDerivedOverridesR57(f,'summer');window.kgmClearDerivedOverridesR57(f,'winter')}\n    });\n"
   "    /* 1019A：使用者「KX51提早15分鐘」（夏季 雪梨 19:40 起飛、00:10⁺¹ 抵達）。雪梨起飛是 r179 用前段落地＋75 分算的，\n"
   "       夏季只飛奧克蘭（基督城那段夏季不飛）→ 奧克蘭→雪梨跟雪梨→台北的夏季一起往前 15 分；只換還是 1018B／上面預設值的（人工改過的不動），換過就不會再換。\n"
   "       基督城那段不動（新瀏覽器的冬季時刻是從它的夏季推出來的）。 */\n"
   "    var K51={'KX51|AKL|SYD':[['17:00-18:25'],['16:45','18:10',0]],'KX51|SYD|TPE':[['19:40-00:10','20:00-00:30'],['19:25','23:55',0]]};\n"
   "    Object.keys(K51).forEach(function(k){var o=S.seasonSchedulesR48[k],m=K51[k],p=k.split('|');\n"
   "      if(o&&o.summer&&m[0].indexOf(o.summer.dep+'-'+o.summer.arr)>=0){o.summer.dep=m[1][0];o.summer.arr=m[1][1];o.summer.dd=m[1][2];o.updatedAt=new Date().toISOString()}\n"
   "      allF().forEach(function(f){if(!f||f.partner||f.via||f.code!==p[0]||f.fr!==p[1]||f.to!==p[2])return;if(m[0].indexOf(f.dep+'-'+f.arr)<0)return;\n"
   "        f.dep=m[1][0];f.arr=m[1][1];f.dd=m[1][2];try{f.dur=blockMin(f.fr,f.to,f.dep,f.arr,f.dd||0);f.durStr=durStr(f.dur)}catch(_){}})});\n"
   "  }catch(_){}\n  /* 0928A：台北⇄峇里島")

RW('fb19 logo',"  var KGM_LOGO_0809D='data","  var KGM_LOGO_0809D=window.KGM_LOGO_R1019A='data")   # 1019A：看板的 KGM 標誌（原本只在這一層內可用）

open('p_h_r19.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
