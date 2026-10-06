from common import *
# ══ 1006A #3：特殊餐「大部分是一般餐，少數各種宗教／醫療餐」，不是素食旅客一律佛教素 ══
#   根因：模擬旅客的原始餐點有約 9% 是「素食」，航班資料把它一律換成「佛教素食 BVML」；
#   回教／印度教／猶太／耆那等宗教餐與醫療餐在模擬資料裡根本不會出現 → 特殊餐幾乎全是佛教素。
#   改成：兒童照舊（2–11 歲才給兒童餐）；其餘依旅客固定雜湊，約 6% 是特殊餐，分散在宗教餐與醫療餐，其餘吃該艙等的一般餐。
R('pax special meal mix',
 "  if(/^(veg|素食|蔬食)$/i.test(raw))return rel('BVML')||rel('AVML')||raw;\n  if(/kids|兒童|儿童/i.test(raw))",
 "  /* 1006A：素食旅客不再一律佛教素；特殊餐約 6%，宗教與醫療各種都有（千分比權重） */\n"
 "  var SP6=[['MOML',12],['HNML',8],['AVML',8],['VLML',8,'蛋奶素 Lacto-Ovo Vegetarian'],['BVML',6],['DBML',6,'糖尿病餐 Diabetic Meal'],\n"
 "           ['LSML',4,'低鹽餐 Low Sodium Meal'],['GFML',4,'無麩質餐 Gluten-Free Meal'],['KSML',2],['VJML',2],['BLML',2,'清淡餐 Bland Meal'],['LFML',2,'低脂餐 Low Fat Meal'],['NOPK',2],['NOBF',2]];\n"
 "  var k6=(h>>>9)%1000,acc6=0;\n"
 "  if(!/kids|兒童|儿童/i.test(raw))for(var q6=0;q6<SP6.length;q6++){acc6+=SP6[q6][1];if(k6<acc6)return rel(SP6[q6][0])||SP6[q6][2]||SP6[q6][0]}\n"
 "  if(/kids|兒童|儿童/i.test(raw))")
save('p_h_meal.js','/* 1006A · 特殊餐比例與種類 */\n')
