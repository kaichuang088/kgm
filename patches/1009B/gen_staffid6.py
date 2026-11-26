from common import *
# ══ 1006A（三遍檢查時發現）：每次開頁面飛行員／空服員人數不一樣（119 或 120、259 或 260） ══
#   根因：模擬地勤用 genEmpId() 隨機取 K10000～K99999 的編號，有時剛好抽到 K60100 這種「機組池保留的編號」；
#   之後 kgmEnsureCrewPoolR43 產生機組時看到編號被佔走就直接跳過 → 那一次少一位飛行員或空服員，
#   排班、薪資表、評分全部跟著不一樣（每個 session 隨機），也讓「班表平均」的檢查每次結果不同。
#   改成：① 隨機編號避開 K60000～K60999、K80000～K80999（機組池保留）；
#        ② 機組池補人時，編號被模擬地勤佔走就把那位地勤換一個隨機編號，機組照原本的固定編號補上，人數一定湊滿。
R('genEmpId skip crew range',
 'do{id="K"+String(10000+Math.floor(Math.random()*90000));}while((S.staff||[]).some(function(x){return x.empId===id;}));',
 'do{id="K"+String(10000+Math.floor(Math.random()*90000));}while(/^K[68]0\\d{3}$/.test(id)||(S.staff||[]).some(function(x){return x.empId===id;}));   /* 1006A：K60xxx／K80xxx 是機組池保留的編號 */')
RL('crew pool fill exact','kgm-0817b-r43',
 "    var need=want[role]-have[role];\n"
 "    for(var i=0;i<need;i++){\n"
 "      var seed=role+'|'+i;\n"
 "      var id='K'+String(60000+(role==='pilot'?0:20000)+i).padStart(5,'0');\n"
 "      if(S.staff.some(function(s){return s.empId===id}))continue;\n",
 "    /* 1006A：照固定編號補到湊滿人數；編號被模擬地勤佔走就把地勤換號，不再跳過 */\n"
 "    for(var i=0;i<want[role]&&have[role]<want[role];i++){\n"
 "      var seed=role+'|'+i;\n"
 "      var id='K'+String(60000+(role==='pilot'?0:20000)+i).padStart(5,'0');\n"
 "      var hold=S.staff.filter(function(s){return s&&s.empId===id})[0];\n"
 "      if(hold&&hold.role===role)continue;\n"
 "      if(hold){if(!(hold.simulated||hold.groundGenerated0810M||hold.groundGenerated0810L))continue;\n"
 "        try{hold.empId=genEmpId();hold.email=hold.empId.toLowerCase()+'@kgm-airways.test'}catch(_){continue}}\n"
 "      have[role]++;\n")
save('p_h_staffid.js','/* 1006A · 機組池編號不再被隨機地勤編號佔走 */\n')
