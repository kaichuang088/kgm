from common import *
import json
# ══ 1023A ═══════════════════════════════════════════════════════════════════
#   使用者（1022A 交付後）兩則訊息，逐條見 notes/1023A-pass126-notes.md。
#   比對基準：1022A 最終版 w37（/tmp/j/kgm1022A_w37.html，patches/1022A/build.sh 重建）。
CUR=open('/tmp/j/kgm1022A_w37.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 航班資料：使用者「ceo只看得到餐點」—— 已選航班（opsSelectedR7）但搜尋欄（opsQueryR7）是空的時候，r7 主頁什麼都不畫，
#    只剩另一層的餐點統計（k81）照樣依已選航班畫出來 → 搜尋欄空就從已選航班帶出班號與日期 ══
RC('ops q from sel','kgm-r7-admin-ops',"function opsPage7(){var q=S.opsQueryR7||'',date=S.opsDateR7||todayISO(),",
   "function opsPage7(){var sp23=String(S.opsSelectedR7||'').split('|');if(!S.opsQueryR7&&sp23.length>=4&&sp23[0]){S.opsQueryR7=sp23[0];S.opsDateR7=sp23[1]}   /* 1023A：只有已選航班、沒有搜尋字時照樣打開那一班 */\n  var q=S.opsQueryR7||'',date=S.opsDateR7||todayISO(),")

# ══ 候補（使用者：員工票 Payload、一人同時候補多班、模擬候補分航段不要全程、TPE-SYD 經濟只能升豪經、「經濟」單獨一格、候補成功要輸入座位）══
# 經停航班：模擬候補只坐一段（申請本來就分段），標籤只寫這一段，不再有「全程」
RC('sb sim one leg','kgm-0909E-r229',"if(r.simR929){var h=H12f('leg12|'+r.id)%10;return h<4?[L.k1,L.k2]:(h<7?[L.k1]:[L.k2])}",
   "if(r.simR929){var h=H12f('leg12|'+r.id)%10;return h<5?[L.k1]:[L.k2]}   /* 1023A：申請分段，模擬資料只坐一段 */")
RC('sb tag leg','kgm-0909E-r229',"function tag12(c,L){var t=c.length>1?(L.via.fr+'→'+L.via.to+(zf()?' 全程':' through')):(c[0]===L.k1?(c[0].replace('-','→')+(zf()?'（'+L.l1.to+' 下機）':' (ends '+L.l1.to+')')):(c[0].replace('-','→')+(zf()?'（'+L.l2.fr+' 上機）':' (boards '+L.l2.fr+')')));",
   "function tag12(c,L){var t=c[0].replace('-','→')+(zf()?' 段':' sector');   /* 1023A：只寫這一段（申請分段，不寫全程／上機／下機） */")
RC('sb tag view leg','kgm-0909E-r229',"          var k=fr&&to?fr+'-'+to:'';if(k===L.k1||k===L.k2)rows=rows.filter(function(r){return r.legsR1012A.indexOf(k)>=0});",
   "          var k=fr&&to?fr+'-'+to:'';if(k===L.k1||k===L.k2){rows=rows.filter(function(r){return r.legsR1012A.indexOf(k)>=0});rows.forEach(function(r){r.legTagR1012A=tag12([k],L)})}   /* 1023A：打開哪一段就寫哪一段 */")
# 模擬升等：只往上一級（經濟 → 豪經（有賣的話）→ 商務）
RC('sb sim up target','kgm-0816d-r40',"        var fromC=dist929<3000?'Economy':(h1%3?'Economy':'Premium'),toC=dist929<3000?'Business':(fromC==='Economy'?(h1%2?'Premium':'Business'):'Business');",
   "        var sp23=!!(window.kgmLegSellsPremR1023A&&window.kgmLegSellsPremR1023A(f929,date));   /* 1023A：升等只往上一級；這一段（含經停票）有賣豪經，經濟就只能升豪經 */\n"
   "        var fromC=(dist929<3000||!sp23)?'Economy':(h1%3?'Economy':'Premium'),toC=(window.kgmUpTargetR1023A&&window.kgmUpTargetR1023A(f929,date,fromC))||'Business';")
RC('sb sim f929 leg','kgm-0816d-r40',"    var f929=null;try{f929=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.partner})[0]}catch(_){}",
   "    var f929=null,fr23=arguments[2];try{var a929=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.partner});f929=a929.filter(function(x){return !x.via&&(!fr23||x.fr===fr23)})[0]||a929[0]}catch(_){}   /* 1023A：經停航班用打開的那一段（距離、艙等） */")
# 豪經：經過這一段的經停票有賣就不併進經濟艙
RC('sb noP leg','kgm-0816d-r40',"  var noP10=false;try{noP10=!!(base&&cap.Premium&&window.kgmSellsPremiumR71&&!window.kgmSellsPremiumR71(base))}catch(_){}",
   "  var noP10=false;try{noP10=!!(base&&cap.Premium&&window.kgmSellsPremiumR71&&!window.kgmSellsPremiumR71(base)&&!(window.kgmLegSellsPremR1023A&&window.kgmLegSellsPremR1023A(base,date)))}catch(_){}   /* 1023A：TPE→SYD 這種段，經過它的 TPE→CHC 有賣豪經，豪經客艙是真的 */")
# 員工票 Payload
RC('sb payload init','kgm-0816d-r40',"  var forStaff=Object.assign({},avail);",
   "  var forStaff=Object.assign({},avail);\n"
   "  /* 1023A：員工票要看 Payload —— 最大無燃油重量減去目前無燃油重量（跟航班資料頁載重平衡同一份），員工票每人 107 kg */\n"
   "  var PL23=null;try{PL23=window.kgmPayloadR1023A?window.kgmPayloadR1023A(code,date,fr||(base&&base.fr),to||(base&&base.to)):null}catch(_){}var plLeft23=PL23?PL23.left:Infinity,KG23=+window.KGM_STAFF_KG_R1023A||107;")
RC('sb payload staff','kgm-0816d-r40',"    for(var k=0;k<r.cabsR1004B.length;k++){var c=r.cabsR1004B[k];if(avail[c]>=n){avail[c]-=n;r.clearR1004B=true;r.clearCabR1004B=c;break}}",
   "    for(var k=0;k<r.cabsR1004B.length;k++){var c=r.cabsR1004B[k];if(avail[c]>=n){if(plLeft23<n*KG23){r.payloadR1023A=true;break}avail[c]-=n;plLeft23-=n*KG23;r.clearR1004B=true;r.clearCabR1004B=c;break}}   /* 1023A：有座位但 Payload 不夠也上不了 */")
RC('sb payload out','kgm-0816d-r40',"    staffPax:staff.reduce(function(s,r){return s+r.seatsR1004B},0)};",
   "    staffPax:staff.reduce(function(s,r){return s+r.seatsR1004B},0),\n"
   "    payload:PL23?{left0:PL23.left,after:plLeft23,mzfw:PL23.mzfw,zfw:PL23.zfw,util:PL23.util,kg:KG23}:null};   /* 1023A */")
RC('sb est payload','kgm-0816d-r40',"    return {left:Math.max(0,(pl.forStaff[cabin]||0)-ahead),ahead:ahead,base:pl.forStaff[cabin]||0,dh:pl.dh.length,up:pl.up.length};",
   "    var pk23=pl.payload?Math.floor(Math.max(0,pl.payload.left0)/(pl.payload.kg||107))-ahead:Infinity;   /* 1023A：剩餘座位預估也看 Payload */\n"
   "    return {left:Math.max(0,Math.min((pl.forStaff[cabin]||0)-ahead,pk23)),ahead:ahead,base:pl.forStaff[cabin]||0,dh:pl.dh.length,up:pl.up.length,payloadKg:pl.payload?pl.payload.left0:null};")
# 同時候補多班：同時候補的那一班也列出這張員工票
RC('sb alt list','kgm-0816d-r40',"      if(b.dhR929)return;   /* 1004A：調位組員是確認座位，不是候補 */\n      if(!segOnR40(b,code,date))return;",
   "      if(b.dhR929)return;   /* 1004A：調位組員是確認座位，不是候補 */\n      if(!segOnR40(b,code,date)&&!(window.kgmStxAltOnR1023A&&window.kgmStxAltOnR1023A(b,code,date)))return;   /* 1023A：同時候補的其他航班 */")
# 面板：Payload 指標、Payload 不足的預判文字、候補成功先輸入座位
RC('sb strip payload','kgm-0816d-r40',"      +'<span><i>'+(z()?'給員工票的座位':'Seats for staff')+'</i><b>'+plan.forStaffTotal+'</b><em>'+(z()?'扣除 ①②':'after ①②')+'</em></span></div></div>';",
   "      +'<span><i>'+(z()?'給員工票的座位':'Seats for staff')+'</i><b>'+plan.forStaffTotal+'</b><em>'+(z()?'扣除 ①②':'after ①②')+'</em></span>'\n"
   "      +(plan.payload?'<span class=\"k23-pl'+(plan.payload.left0<(plan.payload.kg||107)*4?' low':'')+'\"><i>Payload '+(z()?'餘量':'margin')+'</i><b>'+Math.max(0,Math.round(plan.payload.left0)).toLocaleString()+'<small> kg</small></b><em>'+(z()?'員工票每人 '+plan.payload.kg+' kg · 約 '+Math.max(0,Math.floor(plan.payload.left0/plan.payload.kg))+' 人':'≈ '+Math.max(0,Math.floor(plan.payload.left0/plan.payload.kg))+' staff')+'</em></span>':'')+'</div></div>';   /* 1023A */")
RC('sb up sim ask','kgm-0816d-r40',"    if(r.simR929)act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmSbSimDecideR929(\\''+A(r.id)+'\\',\\'ok\\')\">'+(z()?'候補成功':'Clear')+'</button>",
   "    if(r.simR929)act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmSbSeatAskR1023A(\\''+A(r.id)+'\\')\">'+(z()?'候補成功':'Clear')+'</button>")
RC('sb up real ask','kgm-0816d-r40',"act='<button class=\"btn btn-sm btn-g\" onclick=\"adminDecideUpgrade0810K(\\''+A(r.id)+'\\',true)\">'+(z()?'候補成功':'Clear')+'</button>",
   "act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmSbSeatAskR1023A(\\''+A(r.id)+'\\')\">'+(z()?'候補成功':'Clear')+'</button>")
RC('sb up row editor','kgm-0816d-r40',"      +'<td class=\"r40-act\">'+act+'</td></tr>';\n  }).join('');\n  var awRows",
   "      +'<td class=\"r40-act\">'+act+'</td></tr>'+(window.kgmSbSeatRowR1023A?window.kgmSbSeatRowR1023A(r,f,'up'):'');   /* 1023A：候補成功先輸入座位 */\n  }).join('');\n  var awRows")
RC('sb st real ask','kgm-0816d-r40',"onclick=\"kgmStaffClearR1006A(\\''+A(r.pnr)+'\\',\\''+A(f.code)+'\\',\\''+A(f.date)+'\\',\\''+A(r.clearCabR1004B||r.cabsR1004B[0]||'Economy')+'\\')\">'",
   "onclick=\"kgmSbSeatAskR1023A(\\''+A(r.id)+'\\')\">'")
RC('sb st sim ask','kgm-0816d-r40',"if(r.simR929)act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmSbSimDecideR929(\\''+A(r.id)+'\\',\\'ok\\')\">'+(z()?'候補成功・配位':'Seat')",
   "if(r.simR929)act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmSbSeatAskR1023A(\\''+A(r.id)+'\\')\">'+(z()?'候補成功・配位':'Seat')")
RC('sb st verd','kgm-0816d-r40',"      +'<td>'+verd(r.clearR1004B,r.clearR1004B?(z()?'預計可上':'Likely'):(z()?'預計無位':'No seat'))",
   "      +'<td>'+verd(r.clearR1004B,r.clearR1004B?(z()?'預計可上':'Likely'):(r.payloadR1023A?(z()?'Payload 不足':'Payload limit'):(z()?'預計無位':'No seat')))")
RC('sb st row editor','kgm-0816d-r40',"      +'<td class=\"r40-act\">'+act+'</td></tr>';\n    r.famR1004B.forEach(function(m){",
   "      +'<td class=\"r40-act\">'+act+'</td></tr>';\n    var ed23=window.kgmSbSeatRowR1023A?window.kgmSbSeatRowR1023A(r,f,'st'):'';   /* 1023A */\n    r.famR1004B.forEach(function(m){")
RC('sb st row editor end','kgm-0816d-r40',"        +'<td colspan=\"2\"><small class=\"k4b-sub\" style=\"margin:0\">'+(z()?'同一訂位 ':'Same PNR ')+'<span class=\"r40-mono\">'+E(r.pnr)+'</span> · '+(z()?'隨員工一起候補':'clears with employee')+'</small></td></tr>';\n    });\n    return h;",
   "        +'<td colspan=\"2\"><small class=\"k4b-sub\" style=\"margin:0\">'+(z()?'同一訂位 ':'Same PNR ')+'<span class=\"r40-mono\">'+E(r.pnr)+'</span> · '+(z()?'隨員工一起候補':'clears with employee')+'</small></td></tr>';\n    });\n    return h+ed23;")
RW('k23 embed',JS('k22.js'),JS('k22.js')+JS('k23.js')+JS('grp23.js'))   # 1023A Q：團體訂位 js/grp23.js

# 1023A：已候補成功（真的員工票已配位／模擬已按成功）的先占座位與 Payload，不再重新預判（員工票不在旅客名單，Payload 也還沒算到他們）
RC('sb done first','kgm-0816d-r40',"  staff.forEach(function(r,i){\n    var n=Math.max(1,1+r.famR1004B",
   "  staff.forEach(function(r){var n=Math.max(1,1+r.famR1004B.filter(function(f){return !f.inf}).length,+r.pax||1),dn=null;\n"
   "    try{dn=r.booking&&window.kgmStaffClearedR1006A?window.kgmStaffClearedR1006A(r.booking,code,date):null}catch(_){}\n"
   "    if(!dn&&!r.booking){var sm=(S.sbSimR929||{})[r.id];if(sm&&sm.how==='ok')dn=sm}\n"
   "    if(!dn)return;var c=near(cabOf1004B(dn.cabin||r.cabsR1004B[0]));r.doneR1023A=true;r.clearCabR1004B=c;if(avail[c]!=null)avail[c]=Math.max(0,avail[c]-n);plLeft23-=n*KG23});\n"
   "  staff.forEach(function(r,i){\n    if(r.doneR1023A){r.rankR1004B=i+1;r.seatsR1004B=Math.max(1,1+r.famR1004B.filter(function(f){return !f.inf}).length,+r.pax||1);r.clearR1004B=true;return}\n"
   "    var n=Math.max(1,1+r.famR1004B")

# 1023A：定位管理詳細頁 —— 模擬訂位先補齊資料；沒有會員寫「非會員」、沒加購寫「無加購服務」（使用者：「資料不能是 - 或是空的」）
RW('dossier fill',"function detailsJ(b){var pax=b.paxList||[],",
   "function detailsJ(b){try{if(window.kgmMockFillR1023A&&window.kgmMockFillR1023A(b))saveJ()}catch(_){}var pax=b.paxList||[],")
RW('dossier booker member',"EJ(booker.kgmId||booker.ffpNum||b.userId||'—')",
   "EJ(booker.kgmId||booker.ffpNum||b.userId||(ZJ()?'非會員':'Non-member'))")
RW('dossier pax member',"EJ(p.kgmId||p.ffpNum||'—')",
   "EJ(p.kgmId||p.ffpNum||(ZJ()?'非會員':'Non-member'))")
RW('dossier services',"EJ(services.join(' · ')||'—')",
   "EJ(services.join(' · ')||(ZJ()?'無加購服務':'None'))")

# 1023A：管理員在航班動態選的機身要存檔（整年機隊重排會清掉窗期內的手動機身，重排完 k23 再套一次）—— r229 同步只認 save() 裡 LS.set 的寫法
RW('tailpick init','cardBindR1022A:LS.get("kgm22_cards",[]),',
   'cardBindR1022A:LS.get("kgm22_cards",[]),tailPickR1023A:LS.get("kgm23_tailpick",[]),crewSwapR1023A:LS.get("kgm23_crewswap",[]),groupsR1023A:LS.get("kgm23_groups",[]),bagMovesR1023A:LS.get("kgm23_bagmoves",[]),')
RW('tailpick save','LS.set("kgm22_cards",S.cardBindR1022A||[]);',
   'LS.set("kgm22_cards",S.cardBindR1022A||[]);LS.set("kgm23_tailpick",S.tailPickR1023A||[]);LS.set("kgm23_crewswap",S.crewSwapR1023A||[]);LS.set("kgm23_groups",S.groupsR1023A||[]);LS.set("kgm23_bagmoves",S.bagMovesR1023A||[]);')

# 1023A：機隊依實際機身核對機型（0810J reconcile）會把人工換機紀錄覆寫成自動紀錄（manual 標記不見），重新整理後換機就失效 → 人工換機、機型相同就不覆寫
RW('reconcile keep manual',"var rec=S.acftSub[key],changed=!rec||rec.sub!==tp||rec.route!==rt||rec.tail!==tail;",
   "var rec=S.acftSub[key],changed=!rec||rec.sub!==tp||rec.route!==rt||rec.tail!==tail;if(rec&&rec.manual&&!rec.auto&&rec.sub===tp){if(rec.tail!==tail){rec.tail=tail}return}   /* 1023A */")

# 1023A：航線管理重排（使用者：「圖三那個航線管理太亂了」）—— r68 routesHtml68 整個換成 js/rt23.js（依區域、一條航線一張卡片、去回程並排、每個班號一行）
_i=CUR.index('function routesHtml68(){');_j=CUR.index('window.kgmRouteFindR68=function',_i)
RC('routes tidy','kgm-0823l-r68',CUR[_i:_j],JS('rt23.js')+'\n')
# 新增航線表單：每一格加標籤（原本只有 placeholder，首航日期那格看不出是開航日期；使用者：「加入新航班要可以選擇開航日期」）
_g0="""+'<div class="k57-new-grid"><input id="k57NewCode" class="inp" placeholder="KX3126" value="'+E7(x.code||'')+'">"""
_gi=CUR.index(_g0);_gj=CUR.index("""'"></div>'""",_gi)+len("""'"></div>'""")
RC('new route labels','kgm-0823d-r57',CUR[_gi:_gj],
 """+'<div class="k57-new-grid k23-ng">'
      +'<label><span>'+(zh?'班號':'Flight no.')+'</span><input id="k57NewCode" class="inp" placeholder="KX3126" value="'+E7(x.code||'')+'"></label>'
      +'<label><span>'+(zh?'出發':'From')+'</span><input id="k57NewFr" class="inp" placeholder="TPE" value="'+E7(x.fr||'')+'"></label>'
      +'<label><span>'+(zh?'目的地':'To')+'</span><input id="k57NewTo" class="inp" placeholder="KIX / NEW IATA" value="'+E7(x.to||'')+'"></label>'
      +'<label class="k23-ng-key"><span>'+(zh?'開航日期（首航日）':'Start date (first flight)')+'</span><input id="k57NewDate" type="date" class="inp" value="'+E7(x.date||T7())+'"></label>'
      +'<label><span>'+(zh?'起飛時間':'Departure')+'</span><input id="k57NewDep" type="time" class="inp" value="'+E7(x.dep||'')+'"></label>'
      +'<label><span>'+(zh?'機型':'Aircraft')+'</span><select id="k57NewType" class="inp">'+types.map(function(t){return '<option'+(t===(x.type||'A21N')?' selected':'')+'>'+t+'</option>'}).join('')+'</select></label>'
      +'<label><span>'+(zh?'EQV 輪替機型（機型選 EQV 才用）':'EQV pool (only for EQV)')+'</span><select id="k57NewPool" class="inp">'+types.filter(function(t){return t!=='EQV'}).map(function(t){return '<option'+(t===(x.pool||'A21N')?' selected':'')+'>'+t+'</option>'}).join('')+'</select></label>'
      +'<label><span>'+(zh?'指定機身（可空白）':'Tail (optional)')+'</span><input id="k57NewTail" class="inp" placeholder="B-58xxx" value="'+E7(x.tail||'')+'"></label>'
      +'<label><span>'+(zh?'座位圖沿用（航班號，可空白）':'Inherit seat map from (optional)')+'</span><input id="k57NewSeatFrom" class="inp" placeholder="KX12" value="'+E7(x.seatFrom||'')+'"></label>'
      +'<div class="k23-ng-opt"><label class="k57-temp"><input id="k57NewTemp" type="checkbox"'+(x.temporary?' checked':'')+'> '+(zh?'臨時航班':'Temporary')+'</label>'
      +'<label><span>'+(zh?'臨時航班結束日期':'Temporary until')+'</span><input id="k57NewUntil" type="date" class="inp" value="'+E7(x.until||'')+'"></label>'
      +'<label class="k57-temp"><input id="k57NewNoSale" type="checkbox"'+(x.noSale?' checked':'')+'> '+(zh?'不開放販售（只排班不賣票）':'Not for sale')+'</label></div></div>'""")

# 1023A：後台 AI「換機」改走 setFlightAcftOnDate（原本直接寫換機紀錄，不通知旅客、不重新配位）；新增「飛機退役並由另一架接手」
_a0=CUR.index("    aircraft_swap:{tab:'fleetsched',zh:'換機',run:function(a){");_a1=CUR.index("    crew_swap:{tab:'sched'",_a0)
RC('ai aircraft swap','kgm-0909E-r229',CUR[_a0:_a1],
 "    aircraft_swap:{tab:'fleetsched',zh:'換機（code 班號、date 日期、type 機型）：販售、航班動態、機隊同步並通知旅客',run:function(a){\n"
 "      if(!AC[a.type])return {ok:false,msg:(z()?'沒有這個機型：':'Unknown type: ')+a.type};\n"
 "      var r=window.setFlightAcftOnDate(a.code,a.date,a.type);   /* 1023A：跟後台航班動態同一條路（換機紀錄＋旅客通知＋重新配位） */\n"
 "      if(!r||!r.ok)return {ok:false,msg:(r&&r.why)||(z()?'這班不能換機型（受保護航班或找不到班號）。':'This flight cannot change type.')};\n"
 "      return {ok:true,msg:(z()?'已將 ':'Swapped ')+a.code+' '+a.date+(z()?' 換成 ':' to ')+a.type+(z()?'，'+(r.bookings||0)+' 筆訂位已通知'+(r.pairR922?'（回程 '+r.pairR922.replace(' ok','')+' 同步）':''):'')}}},\n"
 "    fleet_retire:{tab:'fleetsched',zh:'飛機退役並由另一架接手（reg 要退役的機身、from 退役日 YYYY-MM-DD（至少 7 天後）、replace 接手的機身，同機型）：接手的那架從退役日起飛退役機原本的班，接手機原本的班改給同機型其他飛機',run:function(a){return window.kgmFleetRetireReplaceR1023A(a.reg,a.from,a.replace)}},\n")
RC('ai plan retire','kgm-0909E-r229',"    var t=norm(text),acts=[];\n    if(/轉降|改降|備降|divert/i.test(t)",
 "    var t=norm(text),acts=[];\n    if(/退役|retire/i.test(t)){var rg23=(t.toUpperCase().match(/B-?\\d{5}/g)||[]).map(function(x){return x.replace(/^B-?/,'B-')}),dt23=(t.match(/\\d{4}-\\d{1,2}-\\d{1,2}/)||[])[0]||'';if(!dt23){var md23=/(\\d{1,2})\\s*[\\/月]\\s*(\\d{1,2})/.exec(t);if(md23){var y23=+todayISO().slice(0,4),c23=y23+'-'+('0'+md23[1]).slice(-2)+'-'+('0'+md23[2]).slice(-2);dt23=c23<todayISO()?(y23+1)+c23.slice(4):c23}}if(rg23.length)return [{tool:'fleet_retire',args:{reg:rg23[0],from:dt23,replace:rg23[1]||''}}]}   /* 1023A：退役＋接手 */\n    if(/轉降|改降|備降|divert/i.test(t)")

# 1023A：票價調整頁重排（k22 kgmFareAdjPageR1022A 的表單部分換成 js/fa23.js；欄位 id 不變）
_f0=CUR.index("    var form=ed?('<div class=\"fa22-f\">'");_f1=CUR.index("      :'<p>'+(z()?'只有執行長與定價人員可以調整",_f0)
RC('fareadj form','kgm-0909E-r229',CUR[_f0:_f1],JS('fa23.js'))
RC('fareadj hero','kgm-0909E-r229',"+(z()?'系統每天照營收管理自動調整票價；這裡設定的人工幅度會在系統票價上再乘一次，可以只調某個艙等裡的一段訂位代號（例如經濟艙 E-C～E-T），只在設定的航班日期內有效（到期自動失效），訂票頁立即生效，可以隨時停用或刪除。單一班次、單一天、單一代號的價格與可售座位，請在「票價分析」的艙位階梯格子裡改。'",
   "+(z()?'在系統（營收管理）票價上再乘一個幅度：可以只調某個艙等的一段訂位代號、只在設定的航班日期內有效，訂票頁立即生效。單一班次單一天的價格與座位請到「票價分析」的艙位階梯改。'")

# 1023A：地勤換地點算 10 分鐘通勤（gnd22 shift22 換成 js/gw23.js；畫面多「步行前往」與「原崗位待命」兩種）
_s0=CUR.index('function shift22(P){');_s1=CUR.index('var FILL22=',_s0)
RC('ground walk','kgm-0907A-r194',CUR[_s0:_s1],JS('gw23.js'))
RC('ground walk fill','kgm-0907A-r194',"var FILL22={brief:",
   "var FILL22={walk:['通勤（步行）','Walk','前往','Walk to'],post:['原崗位待命','Stand by at post','留在','Stay at'],brief:")
RC('ground walk row','kgm-0907A-r194',"    if(it.f){var L22=FILL22[it.f.k];rows.push(",
   "    if(it.f&&(it.f.k==='walk'||it.f.k==='post')){var W23=FILL22[it.f.k];rows.push('<article class=\"k8-walk\"><time>'+hm(it.f.a)+'–'+hm(it.f.b)+'<i>'+(it.f.k==='walk'?(z()?'通勤':'Walk'):(z()?'待命':'Stand by'))+'</i></time><div><b>'+(z()?W23[0]:W23[1])+'</b><span>'+(z()?W23[2]:W23[3])+' '+String(it.f.to||'')+(it.f.k==='walk'?(z()?'（不算工作時間）':' (not duty)'):'')+'</span></div><em>'+dur(it.f.b-it.f.a)+'</em></article>');return}   /* 1023A */\n    if(it.f){var L22=FILL22[it.f.k];rows.push(")

# 1023A：組員名冊預設依國籍排序、台灣優先（使用者：「組員班表預設是按照國籍TPE優先」）；同國籍內維持原本順序
RC('crew nat sort','kgm-0907A-r196',"  var l=staff196(role),q=String(S['crewQ'+which+'R196']||'');",
   "  var NO23={TW:0,TH:1,JP:2,KR:3},l=staff196(role).map(function(s,i){return {s:s,i:i,n:NO23[natOf196(s.empId)]==null?9:NO23[natOf196(s.empId)]}}).sort(function(a,b){return a.n-b.n||a.i-b.i}).map(function(x){return x.s}),q=String(S['crewQ'+which+'R196']||'');   /* 1023A：國籍排序，台灣優先 */")

# 1023A：取消航班的「退費」改成只退這一段（實付票價＋附加服務），系統自動退款、不開案件
RW('cancel refund label','<option value="refund">直接全額退費</option>','<option value="refund">退費（退這一段實付票價＋附加服務，系統自動退款）</option>',3)

# 1023A：後台 AI 給 Claude 的工具多兩個：取消航班（會追問原因與補償）、查詢後台資料
RC('ai tools cancel query','kgm-0909E-r229',"    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},",
   "    flight_cancel:{tab:'status',zh:'取消航班（text 放使用者原話，例如「取消10/23 03:00以後出發的航班」「取消今日所有航班」；第一次呼叫會列出符合的班並追問原因，之後把使用者的回答原樣放 text 再呼叫：原因 → 補償方案（1 退費／2 改搭）→ 確認）',run:function(a){return window.kgmAiCancelR1023A(a)}},   /* 1023A */\n"
   "    data_query:{tab:'status',any:true,zh:'查詢後台資料（q 放問題：班號＋日期、訂位代號、員工編號、機身、延誤／取消清單、案件）',run:function(a){return window.kgmAiQueryR1023A(a)}},   /* 1023A */\n"
   "    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},")

# 1023A：AI 換班核准只對調那兩位、那幾班（使用者：「按下接受此方案就會整個系統死當…AI調整班表只會調整到有影響那兩個喔不會調整其他的喔 很重要 也只有調整那一些要改的航班而已」）
#   引擎每天算好的計畫（MEM121）回傳前套用對調紀錄 S.crewSwapR1023A（就地換人，重複套用結果一樣）；核准時不再整段重排（原本一天 1.5～6 秒、還會改到其他人）
RC('crew swap overlay a','kgm-0903b-r121',"  inval121(date);\n  if(MEM121[date])return MEM121[date];",
   "  inval121(date);\n  if(MEM121[date])return ov23(MEM121[date]);")
RC('crew swap overlay b','kgm-0903b-r121',"  PRESTAMP121=stampUpTo121(CURSOR121);\n  return MEM121[date];\n};",
   "  PRESTAMP121=stampUpTo121(CURSOR121);\n  return ov23(MEM121[date]);\n};\nfunction ov23(p){try{return window.kgmCrewSwapApplyR1023A?window.kgmCrewSwapApplyR1023A(p):p}catch(_){return p}}   /* 1023A：AI 換班對調 */")
RC('crew swap only two','kgm-0909E-r229',"    ok.sort(function(a,b){return (a.v||0)-(b.v||0)||(a.same||0)-(b.same||0)||a.n-b.n});ok=ok.slice(0,3);   /* 1022A */",
   "    ok.sort(function(a,b){return (a.v||0)-(b.v||0)||(a.same||0)-(b.same||0)||a.n-b.n});var nAll23=ok.length;ok=ok.filter(function(c){return !c.n}).slice(0,3);   /* 1023A：只列兩個人對調就成立的方案（不能把別的班丟給其他人） */\n    if(!ok.length&&nAll23)return {text:z()?('有 '+nAll23+' 個方案，但都要把其中一些班丟給其他人接手（換班後休息不夠），不符合「只動這兩個人」。請換一天或換目的地。'):'Every option needs a third person.'};")
RC('crew swap who','kgm-0909E-r229',"+'</small></div>'\n          +(o.n?'<div class=\"k6sw-n\">'",
   "+'</small></div>'\n          +(window.kgmSwapWhoR1023A?window.kgmSwapWhoR1023A(X,((typeof st!=='undefined'&&st[X])||{}).name||X,o):'')   /* 1023A：寫員工編號、換成是誰、DH 的 PNR */\n          +(o.n?'<div class=\"k6sw-n\">'")
RC('crew swap who b','kgm-0909E-r229',"+'</small></div>'\n        +(o.n?'<div class=\"k6sw-n\">'",
   "+'</small></div>'\n        +(window.kgmSwapWhoR1023A?window.kgmSwapWhoR1023A(X,((typeof st!=='undefined'&&st[X])||{}).name||X,o):'')   /* 1023A */\n        +(o.n?'<div class=\"k6sw-n\">'")
RC('crew swap only two 18','kgm-0909E-r229',"return ok.slice(0,3)};   /* 1022A：同一班飛過去的排後面 */",
   "return ok.filter(function(c){return !c.n}).slice(0,3)};   /* 1022A：同一班飛過去的排後面；1023A：只留兩個人對調就成立的方案 */")

# ══ R（使用者：「報到的時候當輸入行李資料發現多一個行李或是超重，要提示說要請旅客注意信箱當下會寄送付款資料」）══
#    r49 實體櫃檯報到：輸入件數／重量時當下算超額（跟完成報到同一套額度與超重規則），畫面直接提示；按「繼續」就建立請款並寄出付款資料（原本要等完成報到才寄），
#    件數或重量改了 → 作廢舊的請款再寄新的；完成報到不重複寄。
RC('bag mail fns','kgm-0819e-r49',"window.kgmCheckinField49=function(k,v){if(S.checkin49)S.checkin49[k]=v};",
   "window.kgmCheckinField49=function(k,v){if(S.checkin49)S.checkin49[k]=v};\n"
   "/* 1023A：行李超額（多件／超重）—— 跟 kgmCheckinFinish49 同一套額度（票價＋會員）與超重規則 */\n"
   "function bagCalc23(c){var b=booking49(c.pnr),tier=bookingTier49(b,c.memberTier),s=null;try{s=(window.kgmSegsR45?window.kgmSegsR45(c.pnr):[]).filter(function(x){return x.code===c.code&&(!c.date||x.date===c.date)})[0]}catch(_){}\n"
   "  var cls=(s&&s.cls)||(b&&b.outC)||'',fam=family49(cls)||'Basic',cab=((FARES[cls]||{}).cabin)||'Economy',isLong=false;try{isLong=distOf(c.fr,c.to)>4000}catch(_){}\n"
   "  var allow=(parseInt(bag49(cab,fam,isLong),10)||0)+(/silver|gold|diamond|black/i.test(tier)?1:0),pieces=Math.max(+c.extra||0,Math.max(0,(+c.bags||0)-allow)),ow=overweight49(cab,c.weights),em='';\n"
   "  try{var p=((b&&b.paxList)||[])[0]||{};em=p.email||(b&&b.contactEmail)||''}catch(_){}\n"
   "  return {b:b,allow:allow,pieces:pieces,ow:ow,units:pieces+ow.units,email:em}}\n"
   "function bagCharge23(c){var k=bagCalc23(c),old=(c.charge&&c.charge.status==='unpaid')?c.charge:null;\n"
   "  if(old&&old.units23===k.units)return k;                                  /* 已經寄過同樣的付款資料 */\n"
   "  if(old){try{window.kgmVoidChargeR45(old.id)}catch(_){}c.charge=null;c.paymentSent=false;c.emailed23=false}\n"
   "  if(k.units&&k.b&&window.kgmCreateChargeR45){var amt=Math.round(140*(FX.USD||31.5)*k.units),ch=window.kgmCreateChargeR45({pnr:k.b.pnr,items:[{label:'Baggage charge · '+k.units+' equivalent piece(s) × USD 140',amount:amt}],note:k.ow.reject?'Carrier approval required; carrier may refuse carriage.':'Airport baggage payment link'});\n"
   "    c.charge=ch&&ch.charge;if(c.charge)c.charge.units23=k.units;c.paymentSent=!!(ch&&ch.ok);c.emailed23=!!(c.charge&&c.charge.emailed);c.mailTo23=(c.charge&&c.charge.email)||'';c.mailAt23=new Date().toISOString()}\n"
   "  return k}\n"
   "function bagNote23(c){var k=bagCalc23(c);if(!k.units)return '';var parts=[];\n"
   "  if(k.pieces)parts.push(z()?('超出免費額度 '+k.pieces+' 件'):(k.pieces+' piece(s) over the allowance'));\n"
   "  if(k.ow.weights.length)parts.push(z()?('超重 '+k.ow.weights.length+' 件（'+k.ow.weights.join('、')+' kg，單件上限 '+k.ow.limit+' kg）'):(k.ow.weights.length+' overweight bag(s) (limit '+k.ow.limit+' kg)'));\n"
   "  return '<div class=\"k23-bagmail\"><b>✉ '+(z()?'請提醒旅客注意信箱':'Ask the passenger to watch their email')+'</b><p>'+(z()\n"
   "    ?('偵測到'+parts.join('、')+'，合計 '+k.units+' 個等值件（USD '+(140*k.units)+'）。按下方「檢查標籤提醒」進入下一步時，系統會立即寄送付款資料到 '+E(k.email||'訂位 Email')+'，請旅客現在留意信箱並完成付款。'+(k.email?'':'此訂位沒有 Email：付款連結會留在旅客的通知中心，請在櫃檯協助當場付款。'))\n"
   "    :(parts.join(', ')+' — '+k.units+' equivalent piece(s), USD '+(140*k.units)+'. The next step sends the payment details to '+E(k.email||'the booking email')+' right away.'))+'</p></div>'}\n"
   "function bagSent23(c){if(!c||!c.charge)return '';var to=c.mailTo23||'';return '<div class=\"k23-bagmail sent\"><b>✉ '+(z()?(c.emailed23?'付款資料已寄出，請旅客注意信箱':'已建立付款連結（此訂位沒有 Email）'):(c.emailed23?'Payment details sent — ask the passenger to check their email':'Payment link created (no email on file)'))+'</b><p>'\n"
   "  +E(c.charge.id)+' · '+E(c.charge.curr||'TWD')+' '+Number(c.charge.total||0).toLocaleString('en-US')+(to?(' · '+E(to)):'')+' · '+String(c.mailAt23||'').slice(11,16)+(z()?'　付款完成後自動寫入訂位。':'  Posts to the booking once paid.')+'</p></div>'}\n"
   "window.kgmBagNoteR1023A=function(){var c=S.checkin49,e=document.getElementById('k23BagNote');if(c&&e)e.innerHTML=bagNote23(c)};")
RC('bag mail next','kgm-0819e-r49',"if(ow.approval&&!c.heavyApproved)return alert(z()?'32 公斤以上行李須先取得航空公司核可。':'Bags over 32 kg require airline approval.');}c.step=Math.min(3,(c.step||1)+1);render()};",
   "if(ow.approval&&!c.heavyApproved)return alert(z()?'32 公斤以上行李須先取得航空公司核可。':'Bags over 32 kg require airline approval.');bagCharge23(c)}c.step=Math.min(3,(c.step||1)+1);render()};   /* 1023A：行李資料輸入完就寄付款資料 */")
RC('bag mail finish','kgm-0819e-r49',"if(chargeUnits&&b){var amt=Math.round(140*(FX.USD||31.5)*chargeUnits),ch=window.kgmCreateChargeR45({pnr:b.pnr,items:[{label:'Baggage charge · '+chargeUnits+' equivalent piece(s) × USD 140',amount:amt}],note:ow.reject?'Carrier approval required; carrier may refuse carriage.':'Airport baggage payment link'});c.charge=ch&&ch.charge;c.paymentSent=!!(ch&&ch.ok)}",
   "if(b)bagCharge23(c);   /* 1023A：第 2 步已寄過同樣的就不再寄；件數或重量改過才作廢重寄 */")
RC('bag mail in bags','kgm-0819e-r49',"oninput=\"kgmCheckinField49(\\'bags\\',this.value)\"","oninput=\"kgmCheckinField49(\\'bags\\',this.value);kgmBagNoteR1023A()\"")
RC('bag mail in w','kgm-0819e-r49',"onchange=\"kgmCheckinField49(\\'weights\\',this.value);render()\"","oninput=\"kgmCheckinField49(\\'weights\\',this.value);kgmBagNoteR1023A()\" onchange=\"kgmCheckinField49(\\'weights\\',this.value);render()\"")
RC('bag mail in x','kgm-0819e-r49',"oninput=\"kgmCheckinField49(\\'extra\\',this.value)\"","oninput=\"kgmCheckinField49(\\'extra\\',this.value);kgmBagNoteR1023A()\"")
RC('bag mail note','kgm-0819e-r49',"<p>'+(z()?'件數超額與重量超額合併計費，每一等值件 USD 140；付款連結寄至旅客 Email。':'Piece and weight excess are combined; each equivalent piece is USD 140 via an emailed payment link.')+'</p>",
   "<p>'+(z()?'件數超額與重量超額合併計費，每一等值件 USD 140；付款連結寄至旅客 Email。':'Piece and weight excess are combined; each equivalent piece is USD 140 via an emailed payment link.')+'</p><div id=\"k23BagNote\">'+bagNote23(c)+'</div>")
RC('bag mail step3','kgm-0819e-r49',"if(c.step===3)body='<section><h2>'+(z()?'最後確認':'Final review')+'</h2>'",
   "if(c.step===3)body='<section><h2>'+(z()?'最後確認':'Final review')+'</h2>'+bagSent23(c)")
RC('bag mail done','kgm-0819e-r49',"(d.paymentSent?'<div class=\"r49-warn\">'+(z()?'額外行李付款連結已寄至旅客 Email；款項完成後自動寫入訂位。':'The extra-baggage payment link was emailed and will post automatically after payment.')+'</div>':'')",
   "(d.paymentSent?bagSent23(d):'')")

# ══ R（使用者：「員工票候補狀態也要consider workload喔 big deal也是」）══
#    r40 起飛前 48–72 小時員工票通知：有座位但 Payload 不夠（員工票每人 107 kg，跟候補面板同一套 kgmPayloadR1023A）一樣通知「不用前往機場」
RC('stb notice payload','kgm-0816d-r40',"        var pax=Math.max(1,(b.paxList||[]).length),go=left>=pax;",
   "        var pax=Math.max(1,(b.paxList||[]).length),go=left>=pax,pl23=null;\n"
   "        try{pl23=window.kgmStaffPayloadR1023A?window.kgmStaffPayloadR1023A(s.f,s.date,pax,b.pnr):null}catch(_){}if(go&&pl23&&!pl23.ok)go=false;   /* 1023A：座位夠但 Payload 不夠也不用去 */")
RC('stb notice rec','kgm-0816d-r40',"        b.stbNoticeR929[key]={at:new Date().toISOString(),go:go,seats:left,stage:stage};",
   "        b.stbNoticeR929[key]={at:new Date().toISOString(),go:go,seats:left,stage:stage,payloadKg:pl23?pl23.left:null,payloadShortR1023A:!!(pl23&&!pl23.ok&&left>=pax)};")
RC('stb notice title','kgm-0816d-r40',"        var t=(go?'✈ 員工票候補：請前往機場 ':'員工票候補：本班已無空位，請不要前往機場 ')+s.f.code+' '+s.date;",
   "        var plS23=!!(pl23&&!pl23.ok&&left>=pax);\n"
   "        var t=(go?'✈ 員工票候補：請前往機場 ':(plS23?'員工票候補：本班載重已滿（Payload 不足），請不要前往機場 ':'員工票候補：本班已無空位，請不要前往機場 '))+s.f.code+' '+s.date;")
RC('stb notice msg','kgm-0816d-r40',"                :('起飛前 '+Math.round(h)+' 小時確認：'+s.f.code+'（'+s.date+'）已完全沒有空位，請不要前往機場。可改搭其他班次（員工票免費改票）。');",
   "                :(plS23?('起飛前 '+Math.round(h)+' 小時確認：'+s.f.code+'（'+s.date+'）雖然還有 '+left+' 個空位，但飛機載重已接近上限（Payload 餘量約 '+Math.max(0,Math.round(pl23.left)).toLocaleString()+' kg，員工票每人以 '+pl23.kg+' kg 計，'+pax+' 位需要 '+(pax*pl23.kg)+' kg），請不要前往機場。可改搭其他班次（員工票免費改票）。')\n"
   "                :('起飛前 '+Math.round(h)+' 小時確認：'+s.f.code+'（'+s.date+'）已完全沒有空位，請不要前往機場。可改搭其他班次（員工票免費改票）。'));")
RC('stb notice html','kgm-0816d-r40',"+(r.go?(z9?'✈ 請前往機場候補':'Come to the airport'):(z9?'本班已無空位，請不要前往機場':'Flight full — do not come'))",
   "+(r.go?(z9?'✈ 請前往機場候補':'Come to the airport'):(r.payloadShortR1023A?(z9?'本班載重已滿（Payload 不足），請不要前往機場':'Payload limit reached — do not come'):(z9?'本班已無空位，請不要前往機場':'Flight full — do not come')))")
RC('stb notice html kg','kgm-0816d-r40',"（起飛前 '+r.stage+' 小時檢查）· 當時可用座位 '+r.seats)",
   "（起飛前 '+r.stage+' 小時檢查）· 當時可用座位 '+r.seats+(r.payloadKg!=null?(' · Payload 餘量 '+Math.max(0,Math.round(r.payloadKg)).toLocaleString()+' kg'):''))")

# ══ S：寄信清單（r110）——每一項可預覽信件樣式；可匯出 CSV；測試信用清單（含後面補的）找名稱並附上正式信件 html ══
RC('mail preview btn','kgm-0903a-r110',"          +'<td><button class=\"k110-t2\" onclick=\"kgmMailTestR110(\\''+E(r.ev)+'\\')\">'\n          +(z()?'測試':'Test')+'</button></td></tr>'}).join('')",
   "          +'<td style=\"white-space:nowrap\"><button class=\"k110-t2\" onclick=\"kgmMailPreviewR1023A(\\''+E(r.ev)+'\\')\">'+(z()?'預覽':'Preview')+'</button> <button class=\"k110-t2\" onclick=\"kgmMailTestR110(\\''+E(r.ev)+'\\')\">'\n          +(z()?'測試':'Test')+'</button></td></tr>'}).join('')   /* 1023A：預覽信件樣式 */")
RC('mail csv btn','kgm-0903a-r110',"      +'<button class=\"k110-go ghost\" onclick=\"kgmMailTestAllR110()\">'+(z()?'全部寄一次':'Send all')+'</button>'",
   "      +'<button class=\"k110-go ghost\" onclick=\"kgmMailTestAllR110()\">'+(z()?'全部寄一次':'Send all')+'</button>'\n      +'<button class=\"k110-go ghost\" onclick=\"kgmMailCsvR1023A()\">'+(z()?'匯出清單 CSV':'Export CSV')+'</button>'   /* 1023A */")
RC('mail test row','kgm-0903a-r110',"  var row=MAIL110.filter(function(x){return x.ev===ev})[0]||{zh:ev,en:ev};\n  try{\n    var r=await window.kgmPostR22('/send',{",
   "  var row=MAIL110.filter(function(x){return x.ev===ev})[0];\n  try{var mm23=window.kgmMailMapR110();row=row||(mm23.external||[]).concat(mm23.internal||[]).filter(function(x){return x.ev===ev})[0]}catch(_){}row=row||{zh:ev,en:ev};   /* 1023A：後面補進清單的事件也找得到名稱 */\n  var tp23=null;try{tp23=window.kgmMailHtmlR1023A?window.kgmMailHtmlR1023A(ev,{pnr:'',flight:'',date:''}):null}catch(_){}\n  try{\n    var r=await window.kgmPostR22('/send',{html:tp23?tp23.html:undefined,")
# ══ Q：團體訂位 —— 前台路由（兩份 views 表都要有）、選單、首頁訂票卡分頁、旅客人數 9 位上限的說明；後台定位管理 GROUP DESK、團體標籤與資訊列 ══
RW('group view',"prep:prepView,upgrade:upgradeView};","prep:prepView,upgrade:upgradeView,group23:function(){return window.kgmGroupViewR1023A?window.kgmGroupViewR1023A():homeView()}};",2)
RW('group menu','{zh:"查詢票價",en:"Fare Search",nav:"booking"}]},','{zh:"查詢票價",en:"Fare Search",nav:"booking"},{zh:"團體訂位",en:"Group Booking",nav:"group23"}]},')
RW('group home tab','box-shadow:${(!!s.useMiles)===v?"0 0 0 1px var(--border) inset":"none"}">${lab}</button>`).join("")}',
   'box-shadow:${(!!s.useMiles)===v?"0 0 0 1px var(--border) inset":"none"}">${lab}</button>`).join("")}<button onclick="nav(\'group23\')" style="border:none;cursor:pointer;padding:10px 22px;font-size:14px;font-weight:600;color:var(--sub);background:transparent;border-radius:10px 10px 0 0">${LANG==="en"?"Group (10+)":"團體訂位"}<small style="font-size:11px;margin-left:4px;color:#9A7B2F">${LANG==="en"?"":"10 位以上"}</small></button>')
RW('group pax note',"+'<p>'+(LANG==='en'?'Children must travel with an adult in the same cabin. Infants may not exceed the number of adults.':'兒童須與成人搭乘同一客艙；每位成人最多攜帶一位不佔位嬰兒。')+'</p></div>';",
   "+'<p>'+(LANG==='en'?'Children must travel with an adult in the same cabin. Infants may not exceed the number of adults.':'兒童須與成人搭乘同一客艙；每位成人最多攜帶一位不佔位嬰兒。')+'</p>'\n    +'<p style=\"margin-top:6px\">'+(LANG==='en'?'10 or more travellers? ':'10 位以上同行？')+'<a href=\"javascript:void 0\" onclick=\"S.paxPickerOpen=false;nav(\\'group23\\')\" style=\"color:var(--g);font-weight:800\">'+(LANG==='en'?'Group booking →':'團體訂位 →')+'</a></p></div>';   /* 1023A */")
RW('group desk tag',"return '<button class=\"btn\" onclick=\"kgmPickBooking0910(\\''+AJ(x)+'\\')\"><b>'+EJ(x)+'</b><br>",
   "return '<button class=\"btn\" onclick=\"kgmPickBooking0910(\\''+AJ(x)+'\\')\"><b>'+EJ(x)+'</b>'+(window.kgmGroupTagR1023A?window.kgmGroupTagR1023A(x):'')+'<br>")
RW('group desk banner',"+(b?'<div class=\"j-booking-layout\">'+detailsJ(dossierBookingJ(b))",
   "+(b&&window.kgmGroupBannerR1023A?window.kgmGroupBannerR1023A(b):'')+(b?'<div class=\"j-booking-layout\">'+detailsJ(dossierBookingJ(b))")
# T（使用者：「把這個開到一個新的TAB in admin」）：GROUP DESK 不放在定位管理裡，改成「訂位與客服」底下自己的分頁「團體訂位」（groups23）
RW('group tab side',"['bookings','定位管理'],['cases0831B','案件處理中心']","['bookings','定位管理'],['groups23','團體訂位'],['cases0831B','案件處理中心']",2)
RW('group tab body',"else if(tab==='cardverify')body=(typeof window.kgmCardVerifyPageR1022A==='function'?window.kgmCardVerifyPageR1022A():'');   /* 1022A */",
   "else if(tab==='cardverify')body=(typeof window.kgmCardVerifyPageR1022A==='function'?window.kgmCardVerifyPageR1022A():'');   /* 1022A */else if(tab==='groups23')body=(typeof window.kgmGroupDeskPageR1023A==='function'?window.kgmGroupDeskPageR1023A():'');   /* 1023A：團體訂位 */")
RC('group tab perm service','kgm-0903b-r123',"service:{cardverify:'use',","service:{cardverify:'use',groups23:'use',")
RC('group tab perm backend','kgm-0903b-r123',"flightadjust:'use',bookings:'use',","flightadjust:'use',bookings:'use',groups23:'use',")
RW('group tab role',"if(r==='service')return ['bookings','cases0831B',","if(r==='service')return ['bookings','groups23','cases0831B',")
RW('group tab order',"var ORDER7=['status','flightdata','groundops','bookings',","var ORDER7=['status','flightdata','groundops','bookings','groups23',")

# ══ C：行李改運 —— 載重平衡不算改運出去的行李、加上改運進來的（散貨艙）；航班資料頁載重平衡下方畫改運面板（k23） ══
RC('bag move kg','kgm-r7-admin-ops',"function bagKg7(id,n){return 15+(H(String(id)+'#'+n)%9);}",
   "function bagKg7(id,n){return 15+(H(String(id)+'#'+n)%9);}\n  window.kgmBagKgR1023A=bagKg7;   /* 1023A：行李改運用同一個重量 */")
RC('bag move lb','kgm-r7-admin-ops',"      for(var i=0;i<n;i++){var w=bagKg7(x.id,i);Z[zn].n++;Z[zn].kg+=w;holdKg+=w;bagN++;}\n    });",
   "      for(var i=0;i<n;i++){if(window.kgmBagOutR1023A&&window.kgmBagOutR1023A(f.code,date,f.fr,x.id,i))continue;var w=bagKg7(x.id,i);Z[zn].n++;Z[zn].kg+=w;holdKg+=w;bagN++;}   /* 1023A：改運出去的不算 */\n    });\n"
   "    try{(window.kgmBagInR1023A?window.kgmBagInR1023A(f.code,date,f.fr):[]).forEach(function(q){Z.BULK.n++;Z.BULK.kg+=q.kg;holdKg+=q.kg;bagN++})}catch(_){}   /* 1023A：別班改運進來的放散貨艙 */")
RC('bag move panel','kgm-r7-admin-ops',"+loadBalance7(f,date,m,t)+'<div class=\"r7-ops-work\">'",
   "+loadBalance7(f,date,m,t)+(window.kgmBagMoveHtmlR1023A?window.kgmBagMoveHtmlR1023A(f,date,m,t):'')+'<div class=\"r7-ops-work\">'")

# ══ I：泰籍組員班表太空（使用者：「泰國及組員班表太空了吧 偶爾也是可能一個月來TPE延長一次航班（可能隔天飛個短程）可以DH可能JL的回BKK或是執勤回TPE再回BKK」）══
#    ① 排序：曼谷基地泰籍的「先到先走」（r＝上次下班時間）把從沒派過勤的虛擬組員當成 0 → 永遠排在休息好的正式泰籍組員前面；改成排最後；
#       在曼谷的正式泰籍組員排在最前面（實測 28 天 B779 曼谷班泰籍機師 260 個位置，正式的只拿到 43 個）。
#       （試過把虛擬泰籍排到外站組員後面：外站台籍組員改去接曼谷第五航權，60 天第 59 天缺 2 位機師，不採用。）
#    ② 每月一次台北延長：正式泰籍組員飛到台北之後，可以從台北飛一趟短程來回（≤5 小時），之後執勤 TPE→BKK 或 DH 回曼谷
#       （趟數規則照 1022A「基地→A→X→A→基地」，A＝台北；外站三天、DH 回基地也照原本的規則）。
RC('th sort fresh last','kgm-0903b-r121',"r:(aw22||p.nat22==='TH')?lr22:0",
   "r:(aw22||p.nat22==='TH')?((st.initial&&p.virtualR121)?9e15:lr22-((p.nat22==='TH'&&!p.virtualR121&&!aw22)?1e9:0)):0")   # 在曼谷的正式泰籍組員先排（虛擬泰籍與外站組員照原本先到先走）
RC('th ext elig','kgm-0903b-r121',"    if(p.nat22==='TH'&&f.fr!=='BKK'&&f.to!=='BKK')return false;   /* 1022A：泰籍組員只飛曼谷航線 */",
   "    if(p.nat22==='TH'&&f.fr!=='BKK'&&f.to!=='BKK'&&!thExt23(p,st,f,date))return false;   /* 1022A：泰籍組員只飛曼谷航線；1023A：每月一次台北延長 */")
RC('th ext fn','kgm-0903b-r121',"function natPref22(p,f){",
   "/* 1023A：泰籍正式組員每個月一次「台北延長」—— 人在台北時從台北飛一趟 5 小時內的短程（去），以及這一趟的回程（回台北） */\n"
   "function thExt23(p,st,f,date){\n"
   "  if(p.virtualR121)return false;\n"
   "  var tp=function(a){return a==='TPE'||sameCity928(a,'TPE')},h=st.days||[],last=null,i;\n"
   "  for(i=h.length-1;i>=0;i--){if(h[i]&&!h[i].deadhead){last=h[i];break}}\n"
   "  var ext=function(x){return x&&!x.deadhead&&x.fr!=='BKK'&&x.to!=='BKK'};\n"
   "  if(last&&ext(last)&&tp(last.fr)&&tp(f.to)&&(st.at===f.fr||sameCity928(st.at,f.fr)))return true;\n"
   "  if(!(f.block>0&&f.block<=300)||!tp(f.fr)||!tp(st.at))return false;\n"
   "  var mo=String(date).slice(0,7),n=0;h.forEach(function(x){if(ext(x)&&String(x.date).slice(0,7)===mo)n++});\n"
   "  return n===0}\n"
   "function natPref22(p,f){")

# ══ J：信用卡綁定只收 KGM Cards（STAR-Gen Bank × KGM 聯名卡 Star K／G／M）＋《KGM Cards 聯名卡使用辦法》KGM-CRD-020（網站內嵌＋Policies PDF 同一份 crd_doc.py）══
import crd_doc
K22=JS('k22.js').split('\n')
def kl(n):return K22[n-1]
_net0=kl(569)+'\n'+kl(570)
assert _net0.startswith('  var NET22={visa:'),_net0[:30]
RW('kgmcards net',_net0,
   "  /* 1023A：只能綁定 KGM Cards（STAR-Gen Bank × KGM 聯名卡）—— 卡別＝聯名卡，等級＝卡片組織等級；BIN 對照表（模擬發卡銀行資料） */\n"
   "  var NET22={stark:['KGM Star K',['Visa Signature']],starg:['KGM Star G',['Mastercard World Elite']],starm:['KGM Star M',['Visa Infinite']]};\n"
   "  var KBIN23={'473291':'stark','552816':'starg','489763':'starm'};window.KGM_CARD_BIN_R1023A=KBIN23;")
_nof=kl(571);assert _nof.startswith('  function netOf(num)')
RW('kgmcards netOf',_nof,"  function netOf(num){return KBIN23[String(num||'').replace(/\\D/g,'').slice(0,6)]||''}")
_iss=kl(576);assert _iss.startswith('  function issuer(bin)')
RW('kgmcards issuer',_iss,"  function issuer(bin){var net=netOf(bin);if(!net)return null;return {net:net,tier:NET22[net][1][0],bank:'STAR-Gen Bank'}}")
RW('kgmcards ai net',"(z()?'BIN '+c.bin6+' 屬於 '+(iss?NET22[iss.net][0]:'未知組織')+'，但選擇的是 '+((NET22[c.net]||[''])[0]):'Network mismatch'),z()?'卡號與選擇的卡別不符':'Network mismatch');",
   "(iss?(z()?'BIN '+c.bin6+' 是 '+NET22[iss.net][0]+'，但選擇的是 '+((NET22[c.net]||[''])[0]):'Card product mismatch'):(z()?'BIN '+c.bin6+' 不是 STAR-Gen Bank × KGM 聯名卡（只能綁定 KGM Cards）':'Not a KGM Card')),iss?(z()?'卡號與選擇的卡別不符':'Product mismatch'):(z()?'不是 KGM Cards 聯名卡':'Not a KGM Card'));")
RW('kgmcards ai starm',"    var res=bad?'rejected':rev?'review':'verified';",
   "    if(c.net==='starm'){var lv23=String((u&&(u.level||u.tier))||c.memberTier||'').toLowerCase(),okL23=/silver|gold|diamond|black/.test(lv23);add(okL23,'rev',okL23?(z()?'會員等級 '+lv23+'，符合 Star M 卡持卡資格':'Tier OK for Star M'):(z()?'Star M 卡須為 Explorer 銀卡以上會員（目前 '+(lv23||'未知')+'）':'Star M requires Silver or above'),z()?'Star M 卡須銀卡以上會員':'Star M needs Silver+')}   /* 1023A：KGM-CRD-020 第五條 */\n"
   "    var res=bad?'rejected':rev?'review':'verified';")
RW('kgmcards bind check',"    if(num.length<13){alert(z()?'請輸入完整卡號。':'Enter the card number.');return}",
   "    if(num.length<13){alert(z()?'請輸入完整卡號。':'Enter the card number.');return}\n"
   "    if(!netOf(num)){alert(z()?'這張卡不是 KGM Cards。帳戶只能綁定 STAR-Gen Bank × KGM 聯名卡（Star K／Star G／Star M）；其他信用卡請在結帳時直接輸入。':'Only KGM Cards (STAR-Gen Bank × KGM) can be saved. Other cards can be entered at checkout.');return}   /* 1023A */\n"
   "    if(ty&&ty.split('|')[0]!==netOf(num)){alert(z()?'卡號是 '+NET22[netOf(num)][0]+'，與選擇的卡別不同，請重新選擇。':'The number is a '+NET22[netOf(num)][0]+'; choose that card type.');return}\n"
   "    if(window.kgmPolicyGateR914&&!window.kgmPolicyGateR914(['KGM-CRD-020'],'kgmCardBindR1022A()'))return;")
RW('kgmcards front head',"'<div class=\"k22-cb-h\"><small>PAYMENT CARDS</small><h3>'+(z()?'信用卡綁定':'Saved cards')+'</h3><p>'+(z()?'綁定後結帳可直接選用。系統會驗證卡別等級與持卡人姓名；我們只保留卡號前 6 碼與後 4 碼，不保存完整卡號與安全碼。':'We keep only the first 6 and last 4 digits.')+'</p></div>'",
   "'<div class=\"k22-cb-h\"><small>KGM CARDS · STAR-Gen Bank × KGM</small><h3>'+(z()?'KGM Cards 聯名卡綁定':'KGM Cards')+'</h3><p>'+(z()?'帳戶只能綁定 STAR-Gen Bank × KGM 聯名卡（Star K／Star G／Star M）。綁定後簽帳哩程自動轉入本帳戶、結帳可直接選用，並依卡別享有貴賓室與優先服務。系統會核對卡別、持卡人姓名與有效期限；我們只保留卡號前 6 碼與後 4 碼，不保存完整卡號與安全碼。':'Only STAR-Gen Bank × KGM co-branded cards can be saved. We keep only the first 6 and last 4 digits.')+'</p></div>'+(window.kgmCardPerksHtmlR1023A?window.kgmCardPerksHtmlR1023A():'')")
RW('kgmcards front consent',"        +'<button class=\"btn btn-g\" onclick=\"kgmCardBindR1022A()\">'+(z()?'送出驗證':'Submit')+'</button></div>'",
   "        +'<button class=\"btn btn-g\" onclick=\"kgmCardBindR1022A()\">'+(z()?'送出驗證':'Submit')+'</button></div>'+(window.kgmPolicyConsentR914?'<div class=\"k23-cb-consent\">'+window.kgmPolicyConsentR914('KGM-CRD-020',{after:'kgmCardBindR1022A()',noWarn:true})+'</div>':'')")
_sim0=kl(650)+'\n'+kl(651)
assert _sim0.startswith("      var nets=['visa'"),_sim0[:40]
RW('kgmcards sim',_sim0,
   "      var nets=['stark','starg','starm','stark','starg','stark','starm','stark','other','starg','stark','starm','stark','starg'],made=0,now=Date.now();   /* 1023A：KGM Cards；other＝一般信用卡（不能綁定） */\n"
   "      nets.forEach(function(net,i){var u=us[(i*37+11)%us.length];var oth=net==='other';if(oth)net='stark';var pre=oth?'4111':{stark:'473291',starg:'552816',starm:'489763'}[net],len=16;")
RW('kgmcards sim iss',"        var iss=issuer(num.slice(0,6)),T2=NET22[net][1],kind=i%7;",
   "        var iss=issuer(num.slice(0,6))||{net:net,tier:NET22[net][1][0],bank:''},T2=NET22[net][1],kind=oth?0:i%7;")
RW('kgmcards adm text',"(z()?'會員在前台「我的帳戶」綁定信用卡後，由系統 AI 逐項驗證：卡號檢查碼（Luhn）、BIN 對應的發卡組織、發卡行資料（模擬）裡這個 BIN 的卡片等級是否與申報相符、持卡人姓名是否與會員姓名相符、有效期限、是否已綁在別的會員。全部通過自動核准；等級或姓名不符轉人工；格式錯誤、過期、重複綁定直接退回。系統只保存卡號前 6 碼與後 4 碼。':'')",
   "(z()?'會員在前台「我的帳戶」綁定 KGM Cards（STAR-Gen Bank × KGM 聯名卡 Star K／Star G／Star M）後，由系統 AI 逐項驗證：卡號檢查碼（Luhn）、卡號前 6 碼是不是 KGM Cards 以及卡別是否相符、發卡銀行資料（模擬）的卡片等級、持卡人姓名是否與會員姓名相符、有效期限、是否已綁在別的會員、Star M 卡是否為銀卡以上會員。全部通過自動核准；等級、姓名或會員等級不符轉人工；不是 KGM Cards、格式錯誤、過期、重複綁定直接退回。系統只保存卡號前 6 碼與後 4 碼（依《KGM Cards 聯名卡使用辦法》KGM-CRD-020）。':'')")
_crd=crd_doc.doc()
RW('kgmcards policy doc',"window.kgmPolicyDocR914=function(id){",
   "/* 1023A：《KGM Cards 聯名卡使用辦法》（patches/1023A/crd_doc.py，PDF 同一份） */\nwindow.KGM_POLICY_DOCS_R914[\"KGM-CRD-020\"]="+json.dumps(_crd,ensure_ascii=False)+";\nwindow.kgmPolicyDocR914=function(id){")
RW('kgmcards policy audit',"if(o.docs!==16)o.bad.push('辦法份數 '+o.docs+'（應為 16）');","if(o.docs!==17)o.bad.push('辦法份數 '+o.docs+'（應為 17）');   /* 1023A：加 KGM-CRD-020 */")

# ══ 結尾 ══
open('p_h_r23.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
