/* 0928B · 輪轉檢查紅字
   ① 無機可派：從輪轉起算日（可能是昨天）開始算，已經過去的日子也算進去 —— 使用者畫面「262（最早 2026-09-27，共 2 天）」。
      已經飛完的日子沒有「派不派得到」的問題，只算今天以後。
   ② 第五航權拆機：記下是哪一班，稽核與畫面都查得到。 */
RL('cover from today','kgm-0904a-r135',
"    var date=D(start,i),dt=new Date(date+'T12:00:00');",
"    var date=D(start,i),dt=new Date(date+'T12:00:00');\n    try{if(date<todayISO())continue}catch(_){}   /* 0928B：過去的日子不算 */",1);
RL('split log','kgm-0823o-r72',
"    else if(isFirst72(x.f))split++;",
"    else if(isFirst72(x.f)){split++;(window.KGM_SPLIT_LIST_R928=window.KGM_SPLIT_LIST_R928||[]).push(type+' '+x.date+' '+x.f.code+' '+x.f.fr+'→'+x.f.to)}",1);
/* ③ 第五航權拆機 1 的來源：KX59 墨爾本起飛冬季 23:35、夏季 00:05 —— 換季當天（2027-03-28）凌晨 00:05 那班跟前一晚 23:35 那班
      只差 30 分鐘，吉隆坡早上兩架落地、只有一班 KX59 吉隆坡→台北，多一架被拆開。
      通則（跟 0928A 峇里島同一個道理）：夏季第一天，冬季是晚上起飛（18:00 後）、夏季改成凌晨（06:00 前）的班不飛 ——
      前一晚冬季那班就是它。 */
R('flyOn season midnight',
'  if(f.noOpDatesR928&&f.noOpDatesR928.length){',
'  if(!f.partner&&typeof window!=="undefined"&&window.kgmSeasonR57&&window.kgmSeasonFlightR48){const _d9=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(_d9==="2027-03-28"||_d9==="2028-03-26"){const _p9=new Date(d.getTime()-864e5),_pd9=_p9.getFullYear()+"-"+String(_p9.getMonth()+1).padStart(2,"0")+"-"+String(_p9.getDate()).padStart(2,"0");try{if(window.kgmSeasonR57(_d9)==="summer"&&window.kgmSeasonR57(_pd9)==="winter"){const _w9=window.kgmSeasonFlightR48(f,_pd9),_s9=window.kgmSeasonFlightR48(f,_d9);if(_w9&&_s9&&String(_w9.dep)>="18:00"&&String(_s9.dep)<="06:00")return false;}}catch(_){}}}// 0928B：換季當天跨午夜的重複班\n  if(f.noOpDatesR928&&f.noOpDatesR928.length){',1);
