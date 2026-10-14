from common import *
# ══ 1006A #40：「組員班表要寫負責哪個艙等（越資深服務的艙等越高），一個航班就是一個正的座艙長一個負的」 ══
#   在最外層的 kgmCrewPlanR121 才指派（r167 換班、r196 補人都會改寫 rank，放裡面會被洗掉）：
#   每班客艙組員依「職級 → 年資」排序：第一位＝座艙長、第二位＝副座艙長、其餘＝空服員；
#   服務艙等依座位數 ÷ 服務比例（頭等 1:2、商務 1:8、豪經 1:20、經濟 1:40）分配人數，純依年資：最資深的排最高艙等。
#   顯示用的 rank 改成「職位・艙等」（例如「座艙長・頭等艙」），rankCode（人事職級）不動，換班配對照舊。
RL('crew positions','kgm-0907A-r196',
 "  if(READY196>=DAYS196&&o.rosterDays<DAYS196)bad.push('班表沒有到兩個月');\n  o.ok=!bad.length;o.bad=bad;\n  return o;\n};\n})();\n",
 "  if(READY196>=DAYS196&&o.rosterDays<DAYS196)bad.push('班表沒有到兩個月');\n  o.ok=!bad.length;o.bad=bad;\n  return o;\n};\n"
 r"""/* 1006A：一班一位座艙長＋一位副座艙長；每位客艙組員標服務艙等，越資深越高 */
var CABS1006A=[['suite','頭等艙',2],['first','頭等艙',2],['biz','商務艙',8],['prem','豪華經濟艙',20],['econ','經濟艙',40]];
window.kgmCabinPositionsR1006A=function(f){
  try{
    var L=f&&f.cabin;if(!L||!L.length)return f;
    var RK={PU:3,DPU:2,FA:1};
    var by=L.slice().sort(function(a,b){return (RK[b.rankCode]||0)-(RK[a.rankCode]||0)||(+b.seniority||0)-(+a.seniority||0)||String(a.empId).localeCompare(String(b.empId))});
    var pu=by[0],dpu=by.length>1?by[1]:null;
    var rest=by.slice(dpu?2:1).sort(function(a,b){return (+b.seniority||0)-(+a.seniority||0)||String(a.empId).localeCompare(String(b.empId))});
    var order=[pu].concat(dpu?[dpu]:[],rest);
    var ac=(typeof AC!=='undefined'&&(AC[f.type]||AC[f.acft]))||{},cb=ac.cabins||{};
    var sellP=true;try{if(window.kgmSellsPremiumR71)sellP=!!window.kgmSellsPremiumR71(f)}catch(_){}
    var cabs=[],seen={};
    CABS1006A.forEach(function(c){var x=cb[c[0]];if(!x||!(+x.seats))return;var nm=(c[0]==='prem'&&!sellP)?'經濟艙':c[1];
      if(seen[nm]){seen[nm].d+=(+x.seats)/c[2];return}var o={nm:nm,d:(+x.seats)/c[2]};seen[nm]=o;cabs.push(o)});
    if(!cabs.length)cabs=[{nm:'經濟艙',d:1}];
    var n=order.length,tot=cabs.reduce(function(a,c){return a+c.d},0);
    cabs.forEach(function(c){c.n=(n>=cabs.length)?1:0});
    var left=n-cabs.reduce(function(a,c){return a+c.n},0);
    if(left>0){var share=cabs.map(function(c){var e=left*c.d/tot;return {c:c,f:Math.floor(e),r:e-Math.floor(e)}});
      share.forEach(function(s){s.c.n+=s.f;left-=s.f});
      share.sort(function(a,b){return b.r-a.r});for(var i=0;left>0;i=(i+1)%share.length){share[i].c.n++;left--}}
    /* 艙等純看年資：最資深的排最高艙等（座艙長／副座艙長是職位，照職級挑，跟服務艙等分開） */
    var bySen=order.slice().sort(function(a,b){return (+b.seniority||0)-(+a.seniority||0)||String(a.empId).localeCompare(String(b.empId))});
    var k=0;
    cabs.forEach(function(c){for(var j=0;j<c.n&&k<bySen.length;j++,k++)bySen[k].cabinZH=c.nm});
    while(k<bySen.length)bySen[k++].cabinZH=cabs[cabs.length-1].nm;
    order.forEach(function(p,i){var pos=i===0?'座艙長':(i===1&&dpu?'副座艙長':'空服員');p.posZH=pos;p.posCode=i===0?'PU':(i===1&&dpu?'DPU':'FA');p.rank=pos+'・'+p.cabinZH});
    f.cabin=order;
  }catch(_){}
  return f;
};
function wrapPos1006A(){
  try{
    var cur=window.kgmCrewPlanR121;
    if(typeof cur!=='function'||cur.__r1006A)return;
    var fn=function(){
      var plan=cur.apply(this,arguments);
      try{((plan&&(plan.flights||plan.rows))||[]).forEach(window.kgmCabinPositionsR1006A)}catch(_){}
      return plan;
    };
    fn.__r1006A=1;Object.keys(cur).forEach(function(k){if(k!=='__r1006A')fn[k]=cur[k]});
    window.kgmCrewPlanR121=fn;
  }catch(_){}
}
wrapPos1006A();[400,1600,5500,21000,46000,70000].forEach(function(ms){setTimeout(wrapPos1006A,ms)});
})();
""")

# 年資單一來源：排班用 1+(雜湊%22) 年，名單／薪資／員工票候補看 hireDate（模擬員工全是 2024-01-01，一律 2 年）。
# 改成：模擬員工（hireDate 為 2024-01-01 或空白）的到職日改成與排班年資一致的日期；排班年資一律由到職日推算。
RL('r121 hire migrate','kgm-0903b-r121',
 "  (S.staff||[]).forEach(add);\n  ex.forEach(add);",
 "  /* 1006A：年資只有一個來源（到職日）。模擬員工的到職日原本全是 2024-01-01 → 名單、薪資、員工票候補都是 2 年，\n"
 "     排班卻用另一個雜湊年資。改成到職日＝排班年資對應的日期，之後全站都從到職日算。 */\n"
 "  try{var mig6=0,ty6=+String(T()).slice(0,4);(S.staff||[]).forEach(function(s){if(!s||!s.empId||s.hireR1006A)return;if(s.hireDate&&s.hireDate!=='2024-01-01')return;var h6=H(s.empId+'|hire1006A');h6=Math.imul(h6^(h6>>>15),0x2c1b3c6d)>>>0;h6=(h6^(h6>>>12))>>>0;var n6=1+(h6%22);s.hireDate=(ty6-n6)+'-'+('0'+(1+(h6>>>5)%9)).slice(-2)+'-'+('0'+(1+(h6>>>9)%28)).slice(-2);s.hireR1006A=1;mig6++});if(mig6)try{save()}catch(_){}}catch(_){}\n"
 "  (S.staff||[]).forEach(add);\n  ex.forEach(add);")
RL('r121 seniority from hire','kgm-0903b-r121',
 "      seniority:1+(h%22),",
 "      seniority:(function(){try{if(s.hireDate&&/^\\d{4}-\\d{2}-\\d{2}$/.test(s.hireDate)){var a=new Date(s.hireDate+'T00:00:00'),b=new Date(T()+'T00:00:00');var y=b.getFullYear()-a.getFullYear()-((b.getMonth()<a.getMonth()||(b.getMonth()===a.getMonth()&&b.getDate()<a.getDate()))?1:0);return Math.max(1,y)}}catch(_){}return 1+(h%22)})(),   /* 1006A：年資由到職日推算 */")
# 班表索引建立時再套一次職位（r176／r167 換人之後職位要跟著重排）
RL('r196 index positions','kgm-0907A-r196',
 "    ((plan&&plan.flights)||[]).forEach(function(f){\n      ['pilots','cabin'].forEach(function(kk){",
 "    ((plan&&plan.flights)||[]).forEach(function(f){\n      try{window.kgmCabinPositionsR1006A&&window.kgmCabinPositionsR1006A(f)}catch(_){}   /* 1006A */\n      ['pilots','cabin'].forEach(function(kk){")
# 個人班表每一天寫出職位與服務艙等
RL('r196 cell position','kgm-0907A-r196',
 "          +'<i>'+E(_op[0].dep||'')+'–'+E(_last.arr||'')+_plus+'　'+hhm(x.blockMin)+'</i>'",
 "          +'<i>'+E(_op[0].dep||'')+'–'+E(_last.arr||'')+_plus+'　'+hhm(x.blockMin)+'</i>'\n"
 "          +(function(){var rs=[];_op.forEach(function(l){if(l.rank&&rs.indexOf(l.rank)<0)rs.push(l.rank)});return rs.length?'<i class=\"k196-pos\" style=\"color:#8a6a22;font-weight:800\">'+E(rs.join(' / '))+'</i>':''})()   /* 1006A：職位・服務艙等 */")

# 職級跟年資走：每個機型族裡最資深的約 1/5 是座艙長、其次 1/5 副座艙長、其餘空服員（人數與原本 i%5 完全相同，只是誰當改由年資決定）
RL('r121 cabin rank by seniority','kgm-0903b-r121',
 "        l.sort(function(a,b){return H(a.empId+'|rk2')-H(b.empId+'|rk2')\n          ||String(a.empId).localeCompare(b.empId)});\n        l.forEach(function(p,i){\n          var r=i%5;",
 "        /* 1006A：職級依年資：最資深的當座艙長、其次副座艙長（人數與原本 i%5 相同） */\n"
 "        l.sort(function(a,b){return (+b.seniority||0)-(+a.seniority||0)||H(a.empId+'|rk2')-H(b.empId+'|rk2')\n          ||String(a.empId).localeCompare(b.empId)});\n"
 "        var nPU6=Math.ceil(l.length/5),nDPU6=Math.floor((l.length+3)/5);\n"
 "        l.forEach(function(p,i){\n          var r=i<nPU6?0:(i<nPU6+nDPU6?1:2);")

save('p_h_crewpos.js','/* 1006A · 客艙職位＋服務艙等 */\n')
