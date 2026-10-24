/* 0928A · 前台搜尋結果的機型要照「那一天那一班」實際派的飛機
   （使用者：後台 2027-03-14 KX136 TPE→HND 由 B78X 飛（松山派駐的飛機順路），前台卻寫 A321neo；只有那天那班有調度才要改）
   原本只有 EQV 航班會去查當天實際機型，一般航班一律印時刻表的機型。改成一律問 acftOfFlight（當天的換機紀錄＋實際機身），
   沒有調度的日子結果跟時刻表一樣。 */
RL('fe actual type','#  const tableRows=flights.map((f,idx)=>{',
"      var _rt=(f.acft===\"EQV\")?acftOfFlight(f.code,f.date):f.acft;",
"      var _rt=(f.acft===\"EQV\")?acftOfFlight(f.code,f.date):f.acft;\n      /* 0928A：一般航班也照當天實際派的機型（有調度的那天那班才會不同） */\n      try{var _rt928=acftOfFlight(f.code,f.date||date,f.fr,f.to);if(_rt928&&_rt928!==\"EQV\"&&AC[_rt928])_rt=_rt928}catch(_){}",1);
