from common import *
# ══ 1006A #41：「班表分配要平均，現在有的員工要飛很多有的不用」 ══
#   實測（28 天）：執勤 6～23 天、block 35～99 小時。A380 機師 K60057 28 天上 23 天班卻只有 35 小時（全是短程），
#   因為挑人只比「本月 block 分鐘」—— 飛短程的人永遠看起來最閒，一直被挑。
#   改成用「計薪時數」平衡：每段至少記 3 小時（航空業最低執勤保障的概念），法定 100 小時上限仍照實際 block（LOAD121 不動）。
RL('credit reset','kgm-0903b-r121',"S.crewLoadR121={}","S.crewLoadR121={};S.crewCreditR1006A={}",2)
RL('credit accrue','kgm-0903b-r121',
 "l[date.slice(0,7)]=(l[date.slice(0,7)]||0)+f.block;var l2=LOAD121",
 "l[date.slice(0,7)]=(l[date.slice(0,7)]||0)+f.block;var c6=(S.crewCreditR1006A=S.crewCreditR1006A||{})[p.empId]||(S.crewCreditR1006A[p.empId]={});c6[date.slice(0,7)]=(c6[date.slice(0,7)]||0)+Math.max(+f.block||0,180);/* 1006A：平衡用計薪時數 */var l2=LOAD121")
RL('credit balance','kgm-0903b-r121',
 "monthLoads[p.empId]=((S.crewLoadR121||{})[p.empId]||{})[date.slice(0,7)]||0;",
 "monthLoads[p.empId]=((S.crewCreditR1006A||{})[p.empId]||{})[date.slice(0,7)]||((S.crewLoadR121||{})[p.empId]||{})[date.slice(0,7)]||0;   /* 1006A：用計薪時數平衡（短程多日也算重） */")
RL('month duty cap','kgm-0903b-r121',
 "    if(_last&&_last.date===date)return false;\n",
 "    if(_last&&_last.date===date)return false;\n"
 "    /* 1006A：工作量要平均 —— 每個日曆月最多 20 個執勤日（至少休 10 天）；超過就讓給本月還有餘裕的人（虛擬補員不受限） */\n"
 "    if(!p.virtualR121){var mo6=date.slice(0,7),dd6={},n6=0;for(var q6=h.length-1;q6>=0;q6--){var d6=h[q6].date;if(!d6)continue;if(d6.slice(0,7)!==mo6){if(d6<mo6)break;continue}if(!dd6[d6]){dd6[d6]=1;n6++}}if(n6>=(+window.KGM_MONTH_DUTY_MAX_R1006A||20))return false;}\n")
save('p_h_load.js','/* 1006A · 組員工作量平衡 */\n')
