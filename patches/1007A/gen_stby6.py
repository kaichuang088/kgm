from common import *
# ══ 1006A #4：員工票候補順序 ══
#   使用者：「員工票候補順序除了看方案依方案（ID50＞ID25＞ID90＞ZED＞免費票）→ 年資 → 艙等；方案和年資應該是平等的喔！」
#   原本三套互相矛盾：r40 排序 ID25 第一、r21 計算 ID50›ZED›ID90›免費、r229 候補機率 免費最前、辦法條文又是免費最前。
#   統一成：方案分（ID50 4、ID25 3、ID90 2、ZED 1、免費 0）＋年資分（0–1 年 0、2–4 年 1、5–9 年 2、10–14 年 3、15 年以上 4），
#   兩者同權相加，分數高的先；同分再依方案 → 年資 → 艙等 → 申請時間。同性朋友同行仍一律最後（0927B）。
L='kgm-0816d-r40'
RL('plan order + score',L,
 "var PLAN1004B={ID25:0,ID50:1,ID90:2,ZED:3,FREE:4};",
 "var PLAN1004B={ID50:0,ID25:1,ID90:2,ZED:3,FREE:4};   /* 1006A：ID50＞ID25＞ID90＞ZED＞免費票 */\n"
 "/* 1006A：方案與年資同權 —— 各 0–4 分相加 */\n"
 "function stbyScore1006A(plan,yrs){var p=PLAN1004B[String(plan||'').toUpperCase()];p=p==null?2:p;var y=+yrs||0;return (4-p)+(y>=15?4:y>=10?3:y>=5?2:y>=2?1:0)}\n"
 "window.kgmStbyScoreR1006A=stbyScore1006A;")
RL('staff sort score',L,
 "    return (a.friendR1004B?1:0)-(b.friendR1004B?1:0)||pa-pb||b.yearsR1004B-a.yearsR1004B",
 "    return (a.friendR1004B?1:0)-(b.friendR1004B?1:0)||stbyScore1006A(b.planR1004B,b.yearsR1004B)-stbyScore1006A(a.planR1004B,a.yearsR1004B)||pa-pb||b.yearsR1004B-a.yearsR1004B")
RL('seat est ahead score',L,
 "      if(rf<fr||(rf===fr&&(rp<pr||(rp===pr&&r.yearsR1004B>=yrs))))ahead+=r.seatsR1004B;",
 "      var rs6=stbyScore1006A(r.planR1004B,r.yearsR1004B),ms6=stbyScore1006A(me.plan,yrs);   /* 1006A：先比方案＋年資總分 */\n"
 "      if(rf<fr||(rf===fr&&(rs6>ms6||(rs6===ms6&&(rp<pr||(rp===pr&&r.yearsR1004B>=yrs))))))ahead+=r.seatsR1004B;")
RL('panel rule text',L,
 "z()?'依方案（ID25＞ID50＞ID90＞ZED＞免費票）→ 年資 → 艙等；眷屬與員工同一訂位，一起上才算成功。':'By plan, then seniority, then cabin; dependants clear together with the employee.'",
 "z()?'方案（ID50＞ID25＞ID90＞ZED＞免費票）與年資同權計分（各 0–4 分相加），同分再依方案 → 年資 → 艙等；同性朋友同行一律最後；眷屬與員工同一訂位，一起上才算成功。':'Plan (ID50 > ID25 > ID90 > ZED > free) and seniority are scored equally (0–4 each); ties go by plan, seniority, then cabin. Travelling with a registered friend is always last; dependants clear together with the employee.'")
RL('r21 rank','kgm-0814d-r21',
 "var rank={ID50:0,ZED:1,ID90:2,FREE:3};",
 "var rank={ID50:0,ID25:1,ID90:2,ZED:3,FREE:4};   /* 1006A：ID50＞ID25＞ID90＞ZED＞免費票 */")
RL('r21 text','kgm-0814d-r21',
 "?'哩程升等候補優先於員工票；同為員工票時 ID50 › ZED › ID90 › 免費票。",
 "?'哩程升等候補優先於員工票；同為員工票時方案（ID50 › ID25 › ID90 › ZED › 免費票）與年資同權計分。")
RL('r21 text en','kgm-0814d-r21',
 ":'Mileage upgrade waitlists clear before staff tickets; among staff the order is ID50, ZED, ID90, then free.",
 ":'Mileage upgrade waitlists clear before staff tickets; among staff, plan (ID50, ID25, ID90, ZED, free) and seniority are scored equally.")
RL('r229 odds priority','kgm-0909E-r229',
 "var PLAN_PRIORITY_R913={ZED:0.82,ID90:0.90,ID50:1.06,ID25:1.10,free:1.14};",
 "var PLAN_PRIORITY_R913={free:0.82,ZED:0.90,ID90:0.98,ID25:1.10,ID50:1.14};   /* 1006A：ID50＞ID25＞ID90＞ZED＞免費票 */")
RL('r229 odds text','kgm-0909E-r229',
 "方案順位（免費＞ID25＞ID50＞ID90＞ZED，同性朋友同行排最後）",
 "方案（ID50＞ID25＞ID90＞ZED＞免費票）與年資同權計分（同性朋友同行排最後）")
RL('r169 plan notes','kgm-0905b-r169',
 "ID90:['ID90',10,z()?'票面價 10%，候補順位依年資':'10% of fare, standby by seniority'],\n         ID50:['ID50',50,z()?'票面價 50%，候補順位優於 ID90':'50% of fare, priority above ID90'],\n         ID25:['ID25',75,z()?'票面價 75%（七五折），候補順位優於 ID50':'75% of fare, priority above ID50'],",
 "ID90:['ID90',10,z()?'票面價 10%，方案順位第三（與年資同權計分）':'10% of fare, third plan priority (scored equally with seniority)'],\n         ID50:['ID50',50,z()?'票面價 50%，方案順位最前（與年資同權計分）':'50% of fare, top plan priority (scored equally with seniority)'],\n         ID25:['ID25',75,z()?'票面價 75%（七五折），方案順位第二（與年資同權計分）':'75% of fare, second plan priority (scored equally with seniority)'],")
# 員工票管理辦法（系統內文件）
RL('policy table','kgm-0831c-r86',
 "<td>員工本人，每年 2 趟來回</td><td>第一順位</td></tr><tr><td>ID25</td><td>75%（七五折）</td><td>員工、登記眷屬及登記之同性朋友</td><td>第二順位</td></tr><tr><td>ID50</td><td>50%</td><td>員工、登記眷屬及登記之同性朋友</td><td>第二順位（次於 ID25）</td></tr><tr><td>ID90</td><td>10%</td><td>員工及登記眷屬</td><td>第三順位</td></tr><tr><td>ZED</td><td>依 ZED 費率表</td><td>與他航互惠之行程</td><td>第四順位</td>",
 "<td>員工本人，每年 2 趟來回</td><td>第五順位</td></tr><tr><td>ID25</td><td>75%（七五折）</td><td>員工、登記眷屬及登記之同性朋友</td><td>第二順位</td></tr><tr><td>ID50</td><td>50%</td><td>員工、登記眷屬及登記之同性朋友</td><td>第一順位</td></tr><tr><td>ID90</td><td>10%</td><td>員工及登記眷屬</td><td>第三順位</td></tr><tr><td>ZED</td><td>依 ZED 費率表</td><td>與他航互惠之行程</td><td>第四順位</td>")
RL('policy art11','kgm-0831c-r86',
 "<li><b>一、</b>方案順位：本人免費、ID25、ID50、ID90、ZED；有登記之同性朋友同行之申請，一律排在所有員工票之後；</li><li><b>二、</b>同一方案者，依職級順序；</li><li><b>三、</b>職級相同者，依到職日先後；</li>",
 "<li><b>一、</b>有登記之同性朋友同行之申請，一律排在所有員工票之後；</li><li><b>二、</b>方案與年資同權計分，總分高者優先：方案分 ID50 四分、ID25 三分、ID90 二分、ZED 一分、本人免費零分；年資分未滿二年零分、二至四年一分、五至九年二分、十至十四年三分、十五年以上四分；</li><li><b>三、</b>總分相同者，依方案順位（ID50、ID25、ID90、ZED、本人免費），再依年資、艙等（高艙等在前）；</li>")
RL('policy rules list','kgm-0831c-r86',
 "'候補順位：ID25 ＞ ID50 ＞ ID90 ＞ ZED ＞ 本人免費票；有同性朋友同行者一律最後；同順位依年資，再依申請時間。'",
 "'候補順位：方案（ID50 ＞ ID25 ＞ ID90 ＞ ZED ＞ 本人免費票）與年資同權計分（各 0–4 分相加）；同分依方案 → 年資 → 艙等 → 申請時間；有同性朋友同行者一律最後。'")
save('p_h_stby.js','/* 1006A · 員工票候補順序（方案與年資同權） */\n')
