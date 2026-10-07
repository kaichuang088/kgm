from common import *
# ══ 1007A：組員班表建置變慢（t_sched922：1004B 中位數 0.99 秒／最大 3.8 秒 → 1006A 3.8／19.4 秒 → 1007A 4.7／25.9 秒，同機同時段）══
#   剖析（CPU profile）：排班引擎 eligible() 從 2.0 秒變 7.0 秒 —— 1006A「每月最多 20 個執勤日」每判斷一次就把個人紀錄整份往回掃一遍。
#   改成跟「同一外站每月一次」同樣的作法：依（紀錄筆數, 月份）快取，紀錄有變才重算。判斷結果完全相同。
CUR=open('/tmp/j/kgm1007A_w54.html',encoding='utf-8').read()
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
RC('perf7 month duty cache','kgm-0903b-r121',
   "if(!p.virtualR121){var mo6=date.slice(0,7),dd6={},n6=0;for(var q6=h.length-1;q6>=0;q6--){var d6=h[q6].date;if(!d6)continue;if(d6.slice(0,7)!==mo6){if(d6<mo6)break;continue}if(!dd6[d6]){dd6[d6]=1;n6++}}if(n6>=(+window.KGM_MONTH_DUTY_MAX_R1006A||20))return false;}",
   "if(!p.virtualR121){var mo6=date.slice(0,7),mc7=st.mc7;if(!mc7||mc7.n!==h.length||mc7.mo!==mo6||mc7.h!==h){var dd6={},n6=0;for(var q6=h.length-1;q6>=0;q6--){var d6=h[q6].date;if(!d6)continue;if(d6.slice(0,7)!==mo6){if(d6<mo6)break;continue}if(!dd6[d6]){dd6[d6]=1;n6++}}mc7=st.mc7={n:h.length,mo:mo6,h:h,c:n6}}if(mc7.c>=(+window.KGM_MONTH_DUTY_MAX_R1006A||20))return false;}   /* 1007A：依紀錄筆數＋月份快取（原本每次判斷都整份重掃） */")
# 第二個熱點：1007A 的 DH 艙等判斷（kgmDhSlotR1007A）與引擎原本「這班還有沒有位子」的判斷各自算一次艙位庫存（每次都要重建整班模擬旅客名單），
#   而同一天同一班會被每一位候選組員問一次。改成兩邊共用 kgmDhInvR1007A 的同批次快取（同一個 JS 工作內有效；
#   其他 DH 入座造成的變化由 kgmDhSlotR1007A 另外扣掉）。
#   （原本試過「同一天同一班同一人沿用 eligible() 結果」的快取，實測組字串的成本比省下的還多，整體反而變慢 —— 已拿掉。）
RC('perf7 engine inv commit','kgm-0903b-r121',
   "var inv=window.kgmCabinInventory54(m,m.date,c)",
   "var inv=(window.kgmDhInvR1007A||window.kgmCabinInventory54)(m,m.date,c)")
RC('perf7 engine inv release','kgm-0903b-r121',
   "var inv=window.kgmCabinInventory54(m,date,c)",
   "var inv=(window.kgmDhInvR1007A||window.kgmCabinInventory54)(m,date,c)")
# 第四個熱點：eligible() 本身 —— 每天上千萬次呼叫。只調整「判斷順序」與加快取，判斷條件一字不改、結果相同：
#   ① 最常刷掉人的兩條（今天已經飛過、還在休息）原本排在請假查詢、每月上限、同航點檢查之後，提到最前面
#      （全部是「不合格就 return false」的純判斷；history() 在當天一開始就替每個人建好紀錄，提早呼叫沒有副作用；
#        飛時累計 sums 的維護位置不動）。
#   ② 週／月／年飛時與 30 小時休息的計算（二分搜尋＋迴圈）移到連續執勤日、每週休一天、本月飛時三項之後。
#   ③ 「每週一整天不排班」：本人紀錄最後 16 筆在這一週的日期，依（紀錄、筆數、週一）快取。
RC('perf7 early cheap rejects','kgm-0903b-r121',
   "  function eligible(p,f,rank,ignoreLocation){\n    if(rank&&p.rank!==rank)return false;\n",
   "  function eligible(p,f,rank,ignoreLocation){\n    if(rank&&p.rank!==rank)return false;\n"
   "    var st0=history(p),h0=st0.days;if(h0.length&&h0[h0.length-1].date===date)return false;if(st0.ready>f.depUTC-60)return false;   /* 1007A：最常見的兩個不合格原因先判（下方原本的判斷照舊保留） */\n")
RC('perf7 sums after cheap checks','kgm-0903b-r121',
   "    var total=sums[h.length],week=total-sums[after(f.depUTC-7*1440,'dep')],month=total-sums[after(f.depUTC-30*1440,'dep')],year=total-sums[after(f.depUTC-365*1440,'dep')],cursor=release-7*1440,longRest=0;\n    for(var hi=after(cursor,'release');hi<h.length;hi++){var x=h[hi];longRest=Math.max(longRest,x.report-cursor);cursor=Math.max(cursor,x.release)}\n\n    longRest=Math.max(longRest,report-cursor);\n",
   "")
RC('perf7 sums moved','kgm-0903b-r121',
   "    if(_cm+f.block>LAW.month100)return false;\n    return week+f.block<=LAW.roll7d",
   "    if(_cm+f.block>LAW.month100)return false;\n"+"    var total=sums[h.length],week=total-sums[after(f.depUTC-7*1440,'dep')],month=total-sums[after(f.depUTC-30*1440,'dep')],year=total-sums[after(f.depUTC-365*1440,'dep')],cursor=release-7*1440,longRest=0;\n    for(var hi=after(cursor,'release');hi<h.length;hi++){var x=h[hi];longRest=Math.max(longRest,x.report-cursor);cursor=Math.max(cursor,x.release)}\n\n    longRest=Math.max(longRest,report-cursor);\n".replace("\n\n","\n")+"    return week+f.block<=LAW.roll7d")
RC('perf7 fullweek cache','kgm-0903b-r121',
   '    add({date:d});(extra||[]).forEach(add);\n    var h=st.days||[];for(var i=Math.max(0,h.length-16);i<h.length;i++)add(h[i]);\n    /* r196 換人／補班加上去的勤務日（r121 自己的紀錄裡沒有） */\n    var ex=id&&window.KGM_EXTRA_DUTY_R927D&&window.KGM_EXTRA_DUTY_R927D[id];if(ex)Object.keys(ex).forEach(function(k){add({date:k})});\n    return n>=7;\n',
   '    /* 1007A：沒有額外調位日（extra）時，「紀錄最後 16 筆落在這一週的不同日期」依（紀錄、筆數、週一）快取，結果與下方原算法相同 */\n    var h=st.days||[];\n    if(!(extra&&extra.length)){var fw=st.fw7;if(!fw||fw.h!==h||fw.n!==h.length||fw.w0!==w0){var s7={},c7=0;for(var i7=Math.max(0,h.length-16);i7<h.length;i7++){var y7=h[i7];if(y7&&y7.date&&y7.date>=w0&&y7.date<=w1&&!s7[y7.date]){s7[y7.date]=1;c7++}}fw=st.fw7={h:h,n:h.length,w0:w0,s:s7,c:c7}}\n      var n7=1+fw.c-(fw.s[d]?1:0),ex7=id&&window.KGM_EXTRA_DUTY_R927D&&window.KGM_EXTRA_DUTY_R927D[id];\n      if(ex7)for(var k7 in ex7){if(k7&&k7>=w0&&k7<=w1&&k7!==d&&!fw.s[k7])n7++}\n      return n7>=7;}\n    add({date:d});(extra||[]).forEach(add);\n    for(var i=Math.max(0,h.length-16);i<h.length;i++)add(h[i]);\n    /* r196 換人／補班加上去的勤務日（r121 自己的紀錄裡沒有） */\n    var ex=id&&window.KGM_EXTRA_DUTY_R927D&&window.KGM_EXTRA_DUTY_R927D[id];if(ex)Object.keys(ex).forEach(function(k){add({date:k})});\n    return n>=7;\n')
# 第五個熱點：r210 的 firstTailDate914() 每次查某一天的航班都把整份機隊掃一遍找最早日期（1004B 就有，約佔建置時間 7 個百分點）。
#   依「S.tailAssign 物件＋排班引擎的逐架航段數指紋＋今天」快取，跟排班引擎判斷快取失效用的是同一個指紋。
RC('perf7 first tail date cache','kgm-0908B-r210',
   '    function firstTailDate914(){\n      var f=null;\n      try{\n',
   "    var FT7=null,FTK7=null,FTS7=null;   /* 1007A：班表第一天的快取 —— 原本每查一天的航班就把整份機隊（上萬段）掃一遍 */\n    function firstTailDate914(){\n      var k7=null;try{k7=(window.kgmRosterStampR121?window.kgmRosterStampR121():null);if(k7!==null)k7=k7+'|'+T()}catch(_){k7=null}\n      if(k7!==null&&FTS7===S.tailAssign&&FTK7===k7)return FT7;   /* 機隊物件與逐架航段數指紋（排班引擎自己的失效判斷）都沒變才沿用 */\n      var f=null;\n      try{\n")
RC('perf7 first tail date store','kgm-0908B-r210',
   "          if(x&&x.date&&(f===null||x.date<f))f=x.date})});\n      }catch(_){}\n      return f;\n    }",
   "          if(x&&x.date&&(f===null||x.date<f))f=x.date})});\n      }catch(_){}\n      FT7=f;FTK7=k7;FTS7=S.tailAssign;\n      return f;\n    }")
# 第三個熱點：人手不足時，choose() 會對「整個機型家族的全部組員」（含虛擬補員，上萬人）逐一判資格，判完再依月工作量排序，
#   但實際上只試排序後的前 24 位（1006A 加的上限）。1006A 的每月上限／同航點每月一次讓人手不足更常發生，這段掃描因此變成主要成本。
#   改成先排序再逐一判資格、試滿 24 位就停。Array.prototype.sort 是穩定排序，挑到的人與原本完全相同；
#   eligible() 沒有副作用（history() 在當天一開始已替每個人建好紀錄）。
RC('perf7 lazy remaining','kgm-0903b-r121',
   "var remaining=(buckets[fam121(f.type)+'|'+role]||[]).filter(function(p){return !used[p.empId]&&!_inL921[p.empId]&&eligible(p,f,rank,true)}).sort(function(a,b){return monthLoads[a.empId]-monthLoads[b.empId]});for(var k=0,tr6=0;k<remaining.length&&list.length<n&&tr6<24;k++){tr6++;if(reposition(remaining[k],f))list.push(remaining[k])}}",
   "var remaining=(buckets[fam121(f.type)+'|'+role]||[]).filter(function(p){return !used[p.empId]&&!_inL921[p.empId]}).sort(function(a,b){return monthLoads[a.empId]-monthLoads[b.empId]});for(var k=0,tr6=0;k<remaining.length&&list.length<n&&tr6<24;k++){if(!eligible(remaining[k],f,rank,true))continue;tr6++;if(reposition(remaining[k],f))list.push(remaining[k])}}   /* 1007A：先排序、逐一判資格，試滿 24 位就停（穩定排序，挑到的人與原本「全部判完再排序」完全相同；原本人手不足時整個機型幾千人每位都判一次） */")
# 1007A：組員歷史（「我飛過的航班：給旅客評分」要過去 30 天）——三個地方要用同一個起點：
#   ① 排班引擎第一次開算的游標，② 歷史「備好了沒」的檢查（kgmCrewNeedDayR1006A），③ 實際取歷史的鏈（今天往前 30 天）。
#   1006A 把 ② 改成「機隊第一天」（只往回 3～5 天），③ 仍是 30 天 → 一問歷史就把整份組員計畫作廢重算（凍結 48～56 秒）。
#   這裡讓 ① 從「機隊第一天」與「今天往前 30 天」較早的那天開始（更早的日子 r914 以四週後同星期幾的實際派機鏡像，0915A 起就有），
#   ② 也用同一天。歷史回到 30 天，而且不會再觸發整份重算。
RC('perf7 cursor start plan','kgm-0903b-r121',
   "if(!CURSOR121){var first=date;",
   "if(!CURSOR121){var first=date;try{var h7=D(T(),-30);if(h7<first)first=h7}catch(_){}   /* 1007A：至少從今天往前 30 天開始（組員歷史） */\n  ")
RC('perf7 cursor start step','kgm-0903b-r121',
   "var first=T();Object.keys(S.tailAssign||{})",
   "var first=T();try{var h7=D(T(),-30);if(h7<first)first=h7}catch(_){}   /* 1007A：同上 */\n  Object.keys(S.tailAssign||{})")
RC('perf7 need day = cursor start','kgm-0908B-r210',
   "NEED6={};NEED6[k]=first",
   "NEED6={};var h7=D(T(),-30);NEED6[k]=(first<h7?first:h7)")
# 1006A #46 漏改：第五航權中停改成一律 75 分之後，r216 的檢查仍是舊的 90–105 分 ——
#   每 7 秒判定 68 班全部「超出範圍」並重跑一次修正（白做工，時刻不會變，因為 r179 已鎖在 75 分），稽核也一直報紅。改成 75 分。
RC('perf7 r216 range 75','kgm-0908B-r216',
   "(x.ground<90||x.ground>105)",
   "(x.ground!==75)",3)
RC('perf7 r216 msg 75','kgm-0908B-r216',
   "第五航權中停仍未落在 90–105 分鐘 (",
   "第五航權中停不是 75 分鐘（1006A 起一律 75 分）(")
save('p_h_perf7.js','/* 1007A · 組員班表建置效能：每月執勤日數改為快取 */\n')
