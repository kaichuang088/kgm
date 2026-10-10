from common import *
# ══ 1006A #10：「所有倉等販售一率必須要事先販售完基本、才會販售完超值」 ══
#   原本三個票價家族各自分 1/3 座位、各自依售出率走，超值可能先賣完（真實訂位、後台手動可售數都會造成），
#   基本卻還在賣。改成巢狀：只要同艙等的「基本」還有位子，「超值」最後一個訂位代號就一定能賣（共用同一批實體座位），
#   基本全部賣完之後超值才可能賣完。後台手動設定的可售數、後台 AI 關閉的票價家族仍然優先。
RL('r54 nest basic before value','kgm-0823c-r54',
 "  if(manual!=null&&!(S.fareThirds0810P||{})[k])left=Math.min(left,Math.max(0,+manual||0));\n  return Math.min(inv.left,left);\n}\nsell54.__canonical54=true;",
 "  if(manual!=null&&!(S.fareThirds0810P||{})[k])left=Math.min(left,Math.max(0,+manual||0));\n"
 "  /* 1006A #10：基本還有位子，超值就不能先賣完 —— 超值最後一個代號改用基本剩下的同一批座位（巢狀艙位） */\n"
 "  else if(left<=0&&fam==='Value'&&idx===all.length-1&&!sell54.nest1006A){\n"
 "    try{sell54.nest1006A=true;var vOther=0;for(var i6=0;i6<idx&&!vOther;i6++)vOther+=sell54(all[i6],date,flight);\n"
 "      if(!vOther){var bas6=((FAM54[cab]||{}).Basic||[]),b6=0;for(var j6=0;j6<bas6.length;j6++)b6+=sell54(bas6[j6],date,flight);if(b6>0)left=b6}\n"
 "    }finally{sell54.nest1006A=false}\n"
 "  }\n"
 "  return Math.min(inv.left,left);\n}\nsell54.__canonical54=true;")
save('p_h_bkt.js','/* 1006A · 票價家族巢狀：基本賣完才賣完超值 */\n')
