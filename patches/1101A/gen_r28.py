from common import *
import json
# ══ 1101A ═══════════════════════════════════════════════════════════════
#   使用者（1027A 交付後）三輪回饋，逐條見 notes/1101A-pass130-notes.md。
#   比對基準：1027A 最終版 w77（/tmp/j/kgm1026C_w77.html，patches/1026C/build.sh 重建，跟交付檔逐位元相同）。
#   程式內部標記一律 1101A／R1101A。
CUR=open('/tmp/j/kgm1026C_w77.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]
# ══ A：時刻（js/bt26.js 1101A 版：EARLY27 加 KX262／KX66／KX9、WIN28 非曼谷航線 01:30–03:59 不抵達）══
RW('bt28 window',open('../1026C/js/bt26.js',encoding='utf-8').read(),JS('bt26.js'))

# ══ B1：地勤備勤時段（使用者圖：備勤 13:00–21:00 → 隔天早班 02:45，休息嚴重不足）——1027A 掃描 4 天 850 組有 35 組 <11 小時，全部牽涉備勤：
#   備勤那天顯示的是舊輪班表的時段（DUTY08），不是這個人這週的班別、也沒看前後天 → 改成班別代表時段，再跟前一天下班、隔天上班各隔 ≥11 小時；排不下就這天休息。
RW('gnd28 reserve',"      if(q.reserve)return {off:false,k:d.k,label:z()?'備勤':'Reserve',from:d.from,to:d.to,hours:0,\n        reserveR1008A:true,planR1008A:true,baseR1008A:d.from+'–'+d.to};",
   "      if(q.reserve)return rv28(id,date,d);   /* 1101A：備勤時段照班別＋前後天休息 11 小時 */")
RW('gnd28 reserve fn',"  var duty=function(id,date){\n    var d=DUTY08.apply(this,arguments);",
   "  /* 1101A：備勤（當天工作已排滿、在機場待命）時段：班別代表時段（PREV8），跟前一天實際下班、隔天實際上班各隔 ≥11 小時；排不下＝這天休息 */\n"
   "  var RV28=0;function p28(t){var a=String(t||'').split(':');return (+a[0]||0)*60+(+a[1]||0)}function ad28(d,k){return new Date(Date.parse(d+'T12:00:00Z')+k*864e5).toISOString().slice(0,10)}\n"
   "  function rv28(id,date,d){var bd=null;try{bd=window.kgmGroundBandR1008A(id,date)}catch(_){}var pv=PREV8[(bd&&bd.k)||'early']||PREV8.early,s=p28(pv.from),e=s+480;\n"
   "    if(!RV28){RV28++;try{var pd=window.kgmGroundDutyR99(id,ad28(date,-1)),nd=window.kgmGroundDutyR99(id,ad28(date,1)),pe=null,ns=null;\n"
   "      if(pd&&!pd.off&&pd.from){var a=p28(pd.from),b=p28(pd.to);if(b<=a)b+=1440;pe=b-1440}if(nd&&!nd.off&&nd.from)ns=p28(nd.from)+1440;\n"
   "      if(pe!=null&&s<pe+660){s=pe+660;e=s+480}if(ns!=null&&e>ns-660){e=ns-660;s=e-480}\n"
   "      if((pe!=null&&s<pe+660)||(ns!=null&&e>ns-660))return {off:true,k:'off',label:z()?'休息（與前後班間隔不足 11 小時）':'Rest (11-h gap)',from:'',to:'',hours:0,restR1101A:true}}finally{RV28--}}\n"
   "    return {off:false,k:(bd&&bd.k)||d.k,label:z()?'備勤':'Reserve',from:hm(((s%1440)+1440)%1440),to:hm(((e%1440)+1440)%1440),hours:0,reserveR1008A:true,planR1008A:true,baseR1008A:d.from+'–'+d.to}}\n"
   "  var duty=function(id,date){\n    var d=DUTY08.apply(this,arguments);")

#   B1 續：一般班接一般班也有 <11 小時（中班 18:30 下班 → 隔天補滿 8 小時把起點往前推到 05:20）→ 排某天前先拿前一天的派工（派工排得出來的 4 天內依日期順序），
#   指派工作不早於「前一天下班＋11 小時＋簡報 25 分」、補滿 8 小時的起點不早於「前一天下班＋11 小時」。
RW('gnd28 prev plan',"  if(BUSY8)return null;\n  BUSY8=true;",
   "  if(BUSY8)return null;\n"
   "  try{var pd28=new Date(Date.parse(date+'T12:00:00Z')-864e5).toISOString().slice(0,10),g28=Math.round((Date.parse(pd28+'T00:00:00Z')-Date.parse(T()+'T00:00:00Z'))/864e5);   /* 1101A：前一天的派工（休息 11 小時） */\n"
   "    window.KGM_GPREV_R1101A=(g28>=-2&&g28<=1)?plan8(ap,pd28):(CACHE8[ap+'|'+pd28+'|'+stamp8()]||null)}catch(_){window.KGM_GPREV_R1101A=null}\n"
   "  BUSY8=true;")
RW('gnd28 lb',"  var people=poolOf8(ap).map(function(p){return person8(p,date)});",
   "  var people=poolOf8(ap).map(function(p){return person8(p,date)});\n"
   "  try{var PV28=window.KGM_GPREV_R1101A;if(PV28&&PV28.people)people.forEach(function(P){var q=PV28.people[P.id];if(q&&!q.off&&!q.reserve&&q.to!=null)P.lb28=q.to-1440+660})}catch(_){}   /* 1101A：前一天下班＋11 小時 */")
RW('gnd28 ok8',"function ok8(P,t,maxGap){\n  if(P.off)return false;",
   "function ok8(P,t,maxGap){\n  if(P.off)return false;\n  if(P.lb28!=null&&t.a<P.lb28+25)return false;   /* 1101A：跟前一天下班隔 11 小時（再加簡報＋步行 25 分） */")
RW('gnd28 shift22',"  if(P.win1!=null&&s+SHIFT22>P.win1+60&&l0-SHIFT22<=f0)s=Math.max(l0-SHIFT22,Math.min(f0,P.win1+60-SHIFT22));",
   "  if(P.win1!=null&&s+SHIFT22>P.win1+60&&l0-SHIFT22<=f0)s=Math.max(l0-SHIFT22,Math.min(f0,P.win1+60-SHIFT22));\n"
   "  if(P.lb28!=null&&s<P.lb28&&P.lb28<=f0)s=P.lb28;   /* 1101A：補滿 8 小時的起點不早於前一天下班＋11 小時 */")

open('p_h_r28.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))
