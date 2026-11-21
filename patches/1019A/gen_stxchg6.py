from common import *
# ══ 1006A #29：員工票改票「依方案比例補差價」（ID90 → 只付差額的 10%）—— 使用者說之前講過但沒改好 ══
#   根因（兩個資料來源）：
#   ① 改票頁 optionsFor59 拿員工票的 SE／SK／SZ／SH 去「公開票價階梯」找有位的艙等，SE 不在階梯上、員工艙等也沒有公開艙位
#      → 每一班都被換成公開票種（畫面：「R 經濟艙 基本・原方案售罄・升列 基本」），改完員工票就變成一般票。
#   ② 報價 kgmReissueQuoteR45 後面幾層會把 to_.cls 換成可售的公開票種，0928B 的員工票包裝再把「SE 舊票價」與「E-R 新票價」各乘 10% 相減
#      → 兩個不同艙等比價，差額不是「新舊票價差 × 方案比例」。
#   改成：員工票一律維持原員工艙等（候補，不看公開艙位）；前後都用同一個員工艙等的票價比，再乘方案比例；不收改票手續費。
RL('staff quote same class','kgm-0909E-r229',
 "r.oldFare=Math.round((+r.oldFare||0)*pct);r.newFare=Math.round((+r.newFare||0)*pct);r.fareDiff=r.newFare-r.oldFare;r.changeFee=0;r.total=r.fareDiff;",
 "/* 1006A #29：員工票維持原員工艙等，前後用同一個艙等的票價比（原本被換成公開票種 E-R 再比，差額亂掉） */\n"
 "        var c6=(r.seg&&r.seg.cls)||'',px6=+r.pax||1,o6=0,n6=0;\n"
 "        try{var sg6=(window.segs7?window.segs7(b):[]).filter(function(x){return x&&x.key===(r.seg&&r.seg.key)})[0];\n"
 "          if(sg6&&c6&&FARES[c6]&&r.flight&&r.to_){o6=+owPrice(Object.assign({},sg6.f,{date:sg6.date}),c6,px6)||0;n6=+owPrice(Object.assign({},r.flight,{date:r.to_.date}),c6,px6)||0}}catch(_){}\n"
 "        if(o6>0&&n6>0){r.to_.cls=c6;r.requestedClass=c6;r.oldFareDateAdjusted=o6;r.newFareDateAdjusted=n6;r.oldFare=o6;r.newFare=n6;r.soldOut=false;r.seatsLeft=null;\n"
 "          r.sameFlight=(r.to_.code===r.seg.code&&r.to_.date===r.seg.date)}\n"
 "        r.oldFare=Math.round((+r.oldFare||0)*pct);r.newFare=Math.round((+r.newFare||0)*pct);r.fareDiff=r.newFare-r.oldFare;r.changeFee=0;r.total=r.fareDiff;")
RL('rx staff ladder','kgm-0823f-r59',
 "    var start=ladder.indexOf(s.cls);if(start<0){ladder.unshift(s.cls);start=0}",
 "    var start=ladder.indexOf(s.cls);if(start<0){ladder.unshift(s.cls);start=0}\n"
 "    var stx6=!!(window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b));if(stx6){ladder=[s.cls];start=0}   /* 1006A #29：員工票只改日期／航班，艙等維持員工艙等 */")
RL('rx staff no public inventory','kgm-0823f-r59',
 "      var cls=ladder[i],fm=FARES[cls]||{},left=inv59(cls,date,dated);",
 "      var cls=ladder[i],fm=FARES[cls]||{},left=stx6?pax:inv59(cls,date,dated);   /* 1006A #29：員工票是候補，不看公開艙位 */")
RL('rx staff explain','kgm-0823f-r59',
 "\n        :('<dt>'+(z()?'艙等異動說明':'Class')+'</dt><dd>'",
 "\n        :(window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b))   /* 1006A #29 */\n"
 "        ?('<dt>'+(z()?'員工票':'Staff ticket')+'</dt><dd>'+(z()\n"
 "            ?('維持員工艙等 '+E(String(s.cls))+'（候補）。票價差額＝（新票價－原票價）× 方案比例 '+Math.round((window.kgmStaffPctR928(b)||0)*100)+'%（'+E(String((b.staffPricing&&b.staffPricing.plan)||(b.stx&&b.stx.plan)||'').toUpperCase())+'），不收改票手續費。')\n"
 "            :('Stays in staff class '+E(String(s.cls))+' (standby). Fare difference × your plan rate; no change fee.'))+'</dd>')\n"
 "        :('<dt>'+(z()?'艙等異動說明':'Class')+'</dt><dd>'")
RL('rx staff seats left','kgm-0823f-r59',
 "      +'<dt>'+(z()?'剩餘可售':'Seats left')+'</dt><dd>'+(+r.left>5?(z()?'有剩餘位置':'Available'):N(r.left))+'</dd>'",
 "      +((window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b))   /* 1006A #29：員工票是候補，沒有「剩餘可售」 */\n"
 "        ?('<dt>'+(z()?'座位':'Seat')+'</dt><dd>'+(z()?'候補（起飛前依空位與候補順序定案）':'Standby — cleared by space and priority before departure')+'</dd>')\n"
 "        :('<dt>'+(z()?'剩餘可售':'Seats left')+'</dt><dd>'+(+r.left>5?(z()?'有剩餘位置':'Available'):N(r.left))+'</dd>'))")

save('p_h_stxchg.js','/* 1006A · 員工票改票：維持員工艙等、差額依方案比例 */\n')
