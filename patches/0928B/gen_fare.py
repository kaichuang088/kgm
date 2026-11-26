import json
out=[]
def R(label,old,new,cnt=1):
    out.append('R(%s,%s,%s,%d);'%(json.dumps(label),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
def RL(label,layer,old,new,cnt=1):
    out.append('RL(%s,%s,%s,%s,%d);'%(json.dumps(label),json.dumps(layer),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
hdr='''/* 0928B · 票價（使用者：「所有廉價價錢都要比較高，或者像是寒假接過年2/1/27-2/10/27此類的，像是STARLUX那段期間的TPE-CTS來回甚至飆到40000多，那有一點誇張但是就是要高一些。」）
   ① 最便宜的兩個票價家族調高：經濟艙基本 .50/.53/.56/.59 → .60/.63/.66/.69（約 +17～20%）、
      經濟艙超值 .64/.68/.72 → .72/.75/.78（約 +8～13%）。豪經基本 .96 → 1.02（不然會比經濟艙超值還便宜）；經濟艙豪華、豪經其他、商務、頭等不動。
   ② 春節核心期另外加價：原本 1/20～2/15 一律 ×2.0；2027-02-01～02-10（使用者指定）與 2028 年同樣的核心期
      （2028-01-22～01-31，春節 1/26）改為 ×2.5，前後的寒假肩期維持 ×2.0。 */
'''
L='kgm-0819d-r48'
for a,b in [("'E-C','C','Economy','Basic',.50","'E-C','C','Economy','Basic',.60"),("'E-I','I','Economy','Basic',.53","'E-I','I','Economy','Basic',.63"),
            ("'E-B','B','Economy','Basic',.56","'E-B','B','Economy','Basic',.66"),("'E-R','R','Economy','Basic',.59","'E-R','R','Economy','Basic',.69"),
            ("'E-T','T','Economy','Value',.64","'E-T','T','Economy','Value',.72"),("'E-P','P','Economy','Value',.68","'E-P','P','Economy','Value',.75"),
            ("'E-E','E','Economy','Value',.78".replace('.78','.72'),"'E-E','E','Economy','Value',.78"),
            ("'P-F','G','Premium','Basic',.96","'P-F','G','Premium','Basic',1.02")]:
    RL('fare '+a[1:4],L,a,b)
R('fare peak table',
"""function peakMul(dateStr){
  if(!dateStr)return 1;""",
"""/* 0928B：春節核心期（寒假接過年）比肩期更貴 */
var KGM_PEAK_R928=[{from:'2027-02-01',to:'2027-02-10',mul:2.5,zh:'2027 春節核心期'},{from:'2028-01-22',to:'2028-01-31',mul:2.5,zh:'2028 春節核心期'}];
function kgmPeakCoreR928(d){var m=1;try{(window.KGM_PEAK_R928||KGM_PEAK_R928||[]).forEach(function(p){if(d>=p.from&&d<=p.to)m=Math.max(m,+p.mul||1)})}catch(_){}return m}
function peakMul(dateStr){
  if(!dateStr)return 1;""")
R('fare peak A',
"""    if((m===1&&day>=20)||(m===2&&day<=15))mul=Math.max(mul,2.00);// CNY""",
"""    if((m===1&&day>=20)||(m===2&&day<=15))mul=Math.max(mul,2.00);// CNY
    mul=Math.max(mul,kgmPeakCoreR928(dateStr));   /* 0928B */""")
R('fare peak B',
"""if((mo===1&&dy>=20)||(mo===2&&dy<=15))m=Math.max(m,2.00);if(mo===7||mo===8)""",
"""if((mo===1&&dy>=20)||(mo===2&&dy<=15))m=Math.max(m,2.00);m=Math.max(m,kgmPeakCoreR928(d));/* 0928B */if(mo===7||mo===8)""")
open('p_e_fare.js','w').write(hdr+'\n'.join(out)+'\n')
