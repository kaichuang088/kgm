/* 0928A · 稽核跟著這一輪的規則改（不是放寬）
   ① r112 季節時刻：只比 KGM 自己的航班。這一輪新增的聯營航班（例：國泰 CX450 台北→成田）時刻照對方公布的班表，
      不跟 KGM 的夏／冬位移，放進來比會被當成「沒有換季」。
   ② r173：使用者規定 Residence 里程競標只能用已開票的訂位從〈艙位升等〉提出，訂位流程不再帶「意圖」過來；
      所以意圖帶過來的那一班「不該」被列出（旗標 KGM_RES_MILE_INTENT_R927D 打開時才應該列出）。 */
RL('audit r112 own only','kgm-0903b-r112',
"    s.forEach(function(f){ if(mw[f.code]){tot++; if(mw[f.code]!==f.dep)diff++} });",
"    s.forEach(function(f){ if(f.partner)return; if(mw[f.code]){tot++; if(mw[f.code]!==f.dep)diff++} });   /* 0928A：聯營航班不比 */",1);
RL('audit r173 intent rule','kgm-0905c-r173',
"  o.intentOK=!!(o.intent&&o.intent.listed===1);",
"  o.intentOK=!!(o.intent&&o.intent.listed===(window.KGM_RES_MILE_INTENT_R927D?1:0));   /* 0928A：里程競標只從已開票訂位提出，意圖不列 */",1);
