/* 0927B · 員工票：48 小時定案、ID25（七五折）、同性朋友、子女不限年齡但須核對親屬關係 */

/* ── 1. 定案時間 72h → 48h（只動員工票，哩程升等候補仍是 72h） ── */
R('stx settle window',
 "return s&&_fUTC(s.f,s.date,'dep')-now<=4320&&_fUTC(s.f,s.date,'dep')>now});",
 "return s&&_fUTC(s.f,s.date,'dep')-now<=(+window.KGM_STAFF_LOCK_H_R927||48)*60&&_fUTC(s.f,s.date,'dep')>now});");
R('stx settle comment',
 "// 起飛前 72 小時：先跑哩程升等候補，剩下的位子才給員工票。\nfunction runStaffStandby(){",
 "// 起飛前 48 小時（0927B：原 72 小時）：先跑哩程升等候補，剩下的位子才給員工票。\nvar KGM_STAFF_LOCK_H_R927=window.KGM_STAFF_LOCK_H_R927=48;\nfunction runStaffStandby(){");
/* 同性朋友同行的員工票一律排在最後定案 */
R('stx settle order friend last',
 "b.ticketStatus!=='refunded'}).sort(function(a,b){return String(a.bookedAt||'').localeCompare(String(b.bookedAt||''))}).forEach(function(b){\n    var entries=prepareStaffBooking0911(b)",
 "b.ticketStatus!=='refunded'}).sort(function(a,b){/* 0927B：有「同性朋友」同行的員工票，候補順位排在所有員工票之後 */var fa=kgmStxHasFriendR927(a)?1:0,fb=kgmStxHasFriendR927(b)?1:0;return (fa-fb)||String(a.bookedAt||'').localeCompare(String(b.bookedAt||''))}).forEach(function(b){\n    var entries=prepareStaffBooking0911(b)");
R('stx friend helper',
 "var KGM_STAFF_LOCK_H_R927=window.KGM_STAFF_LOCK_H_R927=48;\n",
 "var KGM_STAFF_LOCK_H_R927=window.KGM_STAFF_LOCK_H_R927=48;\n/* 0927B：這一筆員工票有沒有「同性朋友」同行 */\nfunction kgmStxHasFriendR927(b){try{var x=(b&&(b.stx||b.staffTix))||b||{};return (x.fam||[]).some(function(f){return f&&f.relation==='friend'})}catch(_){return false}}\nwindow.kgmStxHasFriendR927=kgmStxHasFriendR927;\n");
R('verifyStaffTix comment',
 "// 驗證通過才算候補成立；起飛前 72 小時定案，且哩程升等候補優先。",
 "// 驗證通過才算候補成立；起飛前 48 小時定案（0927B），且哩程升等候補優先。");
R('verifyStaffTix notice',
 "+\"\\u8d77\\u98db\\u524d 72 \\u5c0f\\u6642\\u4f9d\\u5269\\u9918\\u5ea7\\u4f4d\\u5b9a\\u6848",
 "+\"\\u8d77\\u98db\\u524d 48 \\u5c0f\\u6642\\u4f9d\\u5269\\u9918\\u5ea7\\u4f4d\\u5b9a\\u6848");
R('mail comment','   ② 起飛前 72 小時仍確定滿艙 → 直接寄「候補失敗」','   ② 起飛前 48 小時仍確定滿艙 → 直接寄「候補失敗」');
R('mail cleared',"' 已於起飛前 72 小時定案，候補成功。","' 已於起飛前 48 小時定案，候補成功。");
R('mail failed',"' 於起飛前 72 小時定案時，首選與次選艙等均已滿艙","' 於起飛前 48 小時定案時，首選與次選艙等均已滿艙");
R('apply msg','不累積哩程，起飛前 72 小時依實際空位自動遞補）','不累積哩程，起飛前 48 小時依實際空位自動遞補）');
R('admin button','_S("執行 72h 候補定案","Run T-72h standby")','_S("執行 48h 候補定案","Run T-48h standby")');
R('verified card zh',"'已進入候補；起飛前 72 小時依規則定案。'","'已進入候補；起飛前 48 小時依規則定案。'");
R('verified card en',"settled under the 72-hour rule.'","settled under the 48-hour rule.'");
/* r21（舊流程，無入口）同步改成 48 小時，避免兩套規則 */
RL('r21 settle','kgm-0814d-r21',"if(h>12||h<-2)return;                                   /* decided 12 hours out */","if(h>48||h<-2)return;                                   /* 0927B：decided 48 hours out */");
RL('r21 text1','kgm-0814d-r21',"'員工票全程為候補，起飛前 12 小時公布結果。","'員工票全程為候補，起飛前 48 小時公布結果。");
RL('r21 text1en','kgm-0814d-r21',"are decided 12 hours before departure. Dependants","are decided 48 hours before departure. Dependants");
RL('r21 text2','kgm-0814d-r21',"結果於起飛前 12 小時公布。')","結果於起飛前 48 小時公布。')");
RL('r21 text2en','kgm-0814d-r21',"is decided 12 hours before departure.'))","is decided 48 hours before departure.'))");
RL('r21 text3','kgm-0814d-r21',"?'結果於起飛前 12 小時公布。未候補上時","?'結果於起飛前 48 小時公布。未候補上時");

/* ── 2. ID25（七五折，付正價 75%） ── */
R('TIX_TYPES',
 'const TIX_TYPES={free:"本人免費票（額度 2/年,單程1・來回2,僅付稅金）",ID90:"ID90 一折",ID50:"ID50 五折",ZED:"ZED 聯航"};',
 'const TIX_TYPES={free:"本人免費票（額度 2/年,單程1・來回2,僅付稅金）",ID90:"ID90 一折",ID50:"ID50 五折",ID25:"ID25 七五折",ZED:"ZED 聯航"};');
R('STX_FAM_RATE','var STX_FAM_RATE={ID90:0.15,ID50:0.60,ZED:1.00};',
 'var STX_FAM_RATE={ID90:0.15,ID50:0.60,ID25:0.75,ZED:1.00};/* 0927B：ID25 眷屬與本人同為 75% */');
R('stxFareAmount selfRate','var selfRate=p==="ID90"?0.10:0.50;','var selfRate=p==="ID90"?0.10:p==="ID25"?0.75:0.50;');
R('stxFareAmount comment','// 員工票票價：本人免費票票面價為 0（稅金另計）；ID90／ID50／ZED 依所選方案計價。','// 員工票票價：本人免費票票面價為 0（稅金另計）；ID90／ID50／ID25／ZED 依所選方案計價。');
R('stxPlanLabel','ID50:LANG==="en"?"50% fare":"五折",ZED:"ZED"})[S.stx.plan]','ID50:LANG==="en"?"50% fare":"五折",ID25:LANG==="en"?"75% fare":"七五折",ZED:"ZED"})[S.stx.plan]');
R('old staff page A','["ID50","ID50",Z?"五折":"50%",false],["ZED"','["ID50","ID50",Z?"五折":"50%",false],["ID25","ID25",Z?"七五折":"75%",false],["ZED"');
R('old staff page B','["ID50","ID50",Z?"五折購票":"Pay 50%",false],\n    ["ZED"','["ID50","ID50",Z?"五折購票":"Pay 50%",false],\n    ["ID25","ID25",Z?"七五折購票":"Pay 75%",false],\n    ["ZED"');
R('0810J plans',"['ID50',Z?'五折 ID50':'ID50 · 50%',Z?'支付正價 50%':'50% of public fare',false],\n      ['ZED'","['ID50',Z?'五折 ID50':'ID50 · 50%',Z?'支付正價 50%':'50% of public fare',false],\n      ['ID25',Z?'七五折 ID25':'ID25 · 75%',Z?'支付正價 75%':'75% of public fare',false],\n      ['ZED'");
R('0810J warn',"'請先選擇：本人免費／一折 ID90／五折 ID50／固定額 ZED。':'Select Employee Free / ID90 / ID50 / ZED before continuing.'","'請先選擇：本人免費／一折 ID90／五折 ID50／七五折 ID25／固定額 ZED。':'Select Employee Free / ID90 / ID50 / ID25 / ZED before continuing.'");
R('doPay alert',"'Choose ID90, ID50, ZED or Employee Free before payment.':'請在確認頁先選擇一折 ID90、五折 ID50、固定額 ZED 或本人免費。'","'Choose ID90, ID50, ID25, ZED or Employee Free before payment.':'請在確認頁先選擇一折 ID90、五折 ID50、七五折 ID25、固定額 ZED 或本人免費。'");
R('doPay alert2',"'員工票必須完成員工編號驗證並選擇本人免費／ID90／ID50／ZED 方案。'","'員工票必須完成員工編號驗證並選擇本人免費／ID90／ID50／ID25／ZED 方案。'");
RL('r10 plans','kgm-0814c-r10',"['ID50','ID50 五折'],['ZED','ZED 固定額']","['ID50','ID50 五折'],['ID25','ID25 七五折'],['ZED','ZED 固定額']");
RL('r47 PLAN_NM','kgm-0819a-r47',"ID50:['ID50 五折','ID50 (50%)'],ZED:","ID50:['ID50 五折','ID50 (50%)'],ID25:['ID25 七五折','ID25 (75%)'],ZED:");
RL('r49 quiz plan','kgm-0819e-r49','<option value="ID50">5 \'+(z()?\'折\':\'off\')+\'</option>','<option value="ID50">5 \'+(z()?\'折\':\'off\')+\'</option><option value="ID25">7.5 \'+(z()?\'折\':\'off\')+\'</option>');
R('r57 staffFactorJ','return {FREE:0,ID90:.10,ID50:.50,ZED:1}[p]==null?1:{FREE:0,ID90:.10,ID50:.50,ZED:1}[p]}','return {FREE:0,ID90:.10,ID50:.50,ID25:.75,ZED:1}[p]==null?1:{FREE:0,ID90:.10,ID50:.50,ID25:.75,ZED:1}[p]}');
RL('r169 plan info','kgm-0905b-r169',"ID50:['ID50',50,z()?'票面價 50%，候補順位優於 ID90':'50% of fare, priority above ID90'],","ID50:['ID50',50,z()?'票面價 50%，候補順位優於 ID90':'50% of fare, priority above ID90'],\n         ID25:['ID25',75,z()?'票面價 75%（七五折），候補順位優於 ID50':'75% of fare, priority above ID50'],");
RL('r180 planPct','kgm-0907B-r180',"  if(p==='ID50')return 0.50;\n","  if(p==='ID50')return 0.50;\n  if(p==='ID25')return 0.75;\n");
RL('r225 text','kgm-0909D-r225',"'方案（免費／ID90／ID50／ZED）與艙等在進入員工票專區後選。'","'方案（免費／ID90／ID50／ID25／ZED）與艙等在進入員工票專區後選。'");
RL('r229 plan card','kgm-0909E-r229',"  ZED:{off:Z()?'固定額':'Flat rate',","  ID25:{off:Z()?'七五折':'75% of fare',desc:Z()?'本人與眷屬皆可・同性朋友可用・候補順位較前':'Employee, family and registered friend · priority standby'},\n  ZED:{off:Z()?'固定額':'Flat rate',");
RL('r229 priority','kgm-0909E-r229',"var PLAN_PRIORITY_R913={ZED:0.82,ID90:0.90,ID50:1.06,free:1.14};","var PLAN_PRIORITY_R913={ZED:0.82,ID90:0.90,ID50:1.06,ID25:1.10,free:1.14};/* 0927B：ID25 付得最多，排在 ID50 之前 */");
RL('r229 priority comment','kgm-0909E-r229',"   順位：ZED < ID90 < ID50 < 免費票（本人限定，順位最前）。 */","   順位：ZED < ID90 < ID50 < ID25 < 免費票（本人限定，順位最前）；有「同性朋友」同行一律最後（0927B）。 */");
RL('r229 friend odds','kgm-0909E-r229',"    base*=PLAN_PRIORITY_R913[plan]||1;\n","    base*=PLAN_PRIORITY_R913[plan]||1;\n    /* 0927B：同性朋友同行，候補順位排在所有員工票之後 */\n    try{if(window.kgmStxHasFriendR927&&window.kgmStxHasFriendR927(S.stx))base*=0.70}catch(_){}\n");
RL('r229 odds text','kgm-0909E-r229',"方案順位（免費＞ID50＞ID90＞ZED）與同班已候補的員工票估算，起飛前 72 小時定案；","方案順位（免費＞ID25＞ID50＞ID90＞ZED，同性朋友同行排最後）與同班已候補的員工票估算，起飛前 48 小時定案；");

/* ── 3. 管理辦法（摘要版與全文） ── */
R('policy 48 a',"'員工票是候補票（Standby），不保證成行；座位於起飛前 72 小時依順位定案。'","'員工票是候補票（Standby），不保證成行；座位於起飛前 48 小時依順位定案。'");
R('policy 48 b',"'起飛前 72 小時定案：確定滿艙直接寄候補失敗通知；","'起飛前 48 小時定案：確定滿艙直接寄候補失敗通知；");
R('policy deps',"'眷屬限配偶、父母、配偶父母、符合資格子女，且須事先登記。',\n  '本人免費票不得攜帶眷屬；需攜眷請改選 ID90／ID50／ZED。'",
 "'眷屬限配偶、父母、配偶父母、子女（不限年齡），且須事先登記並經後台核對親屬關係後才能同行。',\n  '可另登記「同性朋友」同行：同樣須經後台核對；僅適用 ID50／ID25，候補順位排在所有員工票之後。',\n  '本人免費票不得攜帶眷屬；需攜眷請改選 ID90／ID50／ID25／ZED。'");
R('policy order',"'候補順位：ID50 ＞ ID90 ＞ ZED ＞ 本人免費票；同順位依年資，再依申請時間。'","'候補順位：ID25 ＞ ID50 ＞ ID90 ＞ ZED ＞ 本人免費票；有同性朋友同行者一律最後；同順位依年資，再依申請時間。'");
R('policy doc table','<tr><td>ID50</td><td>50%</td><td>員工及登記眷屬</td><td>第二順位</td></tr>','<tr><td>ID25</td><td>75%（七五折）</td><td>員工、登記眷屬及登記之同性朋友</td><td>第二順位</td></tr><tr><td>ID50</td><td>50%</td><td>員工、登記眷屬及登記之同性朋友</td><td>第二順位（次於 ID25）</td></tr>');
R('policy doc art11','方案順位：本人免費、ID50、ID90、ZED；</li>','方案順位：本人免費、ID25、ID50、ID90、ZED；有登記之同性朋友同行之申請，一律排在所有員工票之後；</li>');
R('policy doc art12','候補結果於<b>起飛前七十二小時定案</b>，並以電子郵件及站內通知告知。','候補結果於<b>起飛前四十八小時定案</b>，並以電子郵件及站內通知告知。');
R('policy doc art6','<p>ID50 及 ID90 無次數限制，但每年合計不得逾二十個航段。</p>','<p>ID25、ID50 及 ID90 無次數限制，但每年合計不得逾二十個航段。</p>');

/* ── 4. 同性朋友＋子女不限年齡（須經後台核對） ── */
RL('REL5','kgm-0823c-r55',"var REL5=[['spouse','配偶','Spouse'],['child','子女','Child'],\n          ['parent','父母','Parent'],['pinlaw','配偶父母','Parent-in-law']];",
 "var REL5=[['spouse','配偶','Spouse'],['child','子女','Child'],\n          ['parent','父母','Parent'],['pinlaw','配偶父母','Parent-in-law'],\n          /* 0927B：同性朋友 —— 須經後台核對、僅 ID50／ID25、候補最後 */\n          ['friend','同性朋友','Same-sex friend']];\n/* 0927B：同性朋友可以使用的方案 */\nvar FRIEND_PLANS_R927=window.KGM_FRIEND_PLANS_R927=['ID50','ID25'];");
RL('gate add pending','kgm-0823c-r55',"    st.famOnFile.push(r);try{save()}catch(_){}render();",
 "    /* 0927B：新登記的眷屬／同性朋友要先經後台核對親屬關係（或身分）才能勾選同行；子女不限年齡。 */\n    r.pendR927=true;r.addedR927=new Date().toISOString();\n    st.famOnFile.push(r);try{save()}catch(_){}\n    alert(Z()?'已送出登記。須經後台核對'+(r.relation==='friend'?'身分':'親屬關係')+'證明後，才能選為同行旅客。':'Submitted. It can be selected once the back office has verified the relationship.');\n    render();");
RL('gate verify skip pending','kgm-0823c-r55',"      var r=(st.famOnFile||[])[i];\n      if(r)fam.push(",
 "      var r=(st.famOnFile||[])[i];\n      if(r&&r.pendR927)return;   /* 0927B：尚未核對，不可同行 */\n      if(r)fam.push(");
RL('gate verify friend plan','kgm-0823c-r55',"    S.stx={empId:st.empId,name:st.name,plan:plan,who:who,fam:fam,withFam:fam.length>0,",
 "    /* 0927B：有同性朋友同行時只能選 ID50 或 ID25 */\n    if(fam.some(function(x){return x&&x.relation==='friend'})&&FRIEND_PLANS_R927.indexOf(plan)<0){\n      alert(Z()?'有「同性朋友」同行時，只能選擇 ID50 五折或 ID25 七五折。':'With a registered friend travelling, only ID50 or ID25 can be used.');\n      return;\n    }\n    S.stx={empId:st.empId,name:st.name,plan:plan,who:who,fam:fam,withFam:fam.length>0,");
RL('gate free alert','kgm-0823c-r55',"'本人免費方案僅限員工本人；攜帶眷屬請選擇一折、五折或 ZED。':'Employee Free is employee-only. Select ID90, ID50 or ZED when travelling with dependants.'",
 "'本人免費方案僅限員工本人；攜帶眷屬請選擇一折、五折、七五折或 ZED。':'Employee Free is employee-only. Select ID90, ID50, ID25 or ZED when travelling with dependants.'");
RL('gate row pending','kgm-0823c-r55',"return '<tr class=\"k55-famrow\"><td><input type=\"checkbox\" class=\"k55-famck\" data-i=\"'+i+'\" disabled></td><td><b>'+E5(r.last+' '+r.first)+'</b></td>'\n              +'<td>'+E5(Z()?rel[1]:rel[2])+'</td>",
 "return '<tr class=\"k55-famrow'+(r.pendR927?' k55-pend':'')+'\"><td><input type=\"checkbox\" class=\"k55-famck\" data-i=\"'+i+'\"'+(r.pendR927?' data-pend=\"1\"':'')+' disabled></td><td><b>'+E5(r.last+' '+r.first)+'</b></td>'\n              +'<td>'+E5(Z()?rel[1]:rel[2])+(r.pendR927?'<small class=\"k55-pendtag\">'+(Z()?'待後台核對':'Pending verification')+'</small>':'')+'</td>");
RL('who toggle pending','kgm-0823c-r55',"      c.disabled=!on; if(!on)c.checked=false;","      /* 0927B：待核對的眷屬／同性朋友永遠不能勾 */\n      var pend=c.getAttribute('data-pend')==='1';\n      c.disabled=!on||pend; if(!on||pend)c.checked=false;");
RL('gate note','kgm-0823c-r55',"+'<p class=\"k55-sg-note\">'+(Z()?'選擇「本人＋眷屬」時，至少要勾選一位同行眷屬；本人也會計入旅客與票價人數。'",
 "+'<p class=\"k55-sg-note\">'+(Z()?'子女不限年齡；新登記的眷屬或同性朋友須經後台核對後才能勾選。有同性朋友同行時只能選 ID50／ID25，且候補順位最後。':'Children of any age may be registered. New registrations must be verified by the back office first; a registered friend can only use ID50 or ID25 and stands by last.')+'</p>'\n      +'<p class=\"k55-sg-note\">'+(Z()?'選擇「本人＋眷屬」時，至少要勾選一位同行眷屬；本人也會計入旅客與票價人數。'");
/* 後台：待核對名單（掛在員工票分頁最上面） */
RL('post55 famReview','kgm-0823c-r55',"    standbyTwoCols5();\n    priceLadder5();","    standbyTwoCols5();\n    famReview5();\n    priceLadder5();");
RL('famReview5 fn','kgm-0823c-r55',"/* accept dialog: seat, cabin and meal chosen at the counter */",
`/* 0927B：眷屬／同性朋友的親屬關係核對（後台 員工票 分頁）。
   旅客端新登記的人一律 pendR927，核對通過才可同行；退回就從名單移除並通知員工。 */
function famPending5(){
  var out=[];
  try{(S.staff||[]).forEach(function(st){(st&&st.famOnFile||[]).forEach(function(r,i){if(r&&r.pendR927)out.push({st:st,r:r,i:i})})})}catch(_){}
  return out;
}
window.kgmFamPendingR927=famPending5;
window.kgmFamReviewR927=function(empId,i,ok){
  try{
    var st=(S.staff||[]).filter(function(x){return x&&x.empId===empId})[0];if(!st)return false;
    var r=(st.famOnFile||[])[+i];if(!r||!r.pendR927)return false;
    var who=(r.last+' '+r.first),rel=(REL5.filter(function(x){return x[0]===r.relation})[0]||['','—'])[1];
    if(ok){r.pendR927=false;r.relVerifiedR927={by:(S.adminUser||{}).empId||'admin',at:new Date().toISOString()}}
    else st.famOnFile.splice(+i,1);
    try{notifyStaff(empId,(ok?'員工票同行登記已核對通過：':'員工票同行登記未通過核對，已退回：')+who+'（'+rel+'）')}catch(_){}
    try{save()}catch(_){}try{render()}catch(_){}
    return true;
  }catch(_){return false}
};
function famReview5(){
  try{
    if(S.view!=='admin'||S.adminTab!=='stafftix')return;
    var main=document.querySelector('#app .p-admin-main');if(!main)return;
    var list=famPending5();
    var key=list.map(function(x){return x.st.empId+'|'+x.i}).join(',')+'|'+(Z()?'z':'e');
    var box=main.querySelector('.k55-famrev');
    if(box&&box.getAttribute('data-k')===key)return;
    if(!box){box=document.createElement('section');box.className='r7-ops-card k55-famrev';main.insertBefore(box,main.firstChild)}
    box.setAttribute('data-k',key);
    box.innerHTML='<div class=\"r7-kicker\">STAFF TRAVEL · RELATIONSHIP CHECK</div><h2>'+(Z()?'眷屬／同性朋友 登記核對':'Dependant and friend registrations')+' <span>'+list.length+'</span></h2>'
      +'<p>'+(Z()?'旅客端新登記的同行者要先在這裡核對證明文件（子女不限年齡，須核對親屬關係；同性朋友核對身分）。通過後員工才能勾選同行。':'New registrations must be checked here before they can travel.')+'</p>'
      +(list.length?'<table class=\"k55-famrev-t\"><thead><tr><th>'+(Z()?'員工':'Employee')+'</th><th>'+(Z()?'姓名':'Name')+'</th><th>'+(Z()?'關係':'Relation')+'</th><th>'+(Z()?'出生日期':'Date of birth')+'</th><th>'+(Z()?'護照號碼':'Passport')+'</th><th></th></tr></thead><tbody>'
        +list.map(function(x){var rel=REL5.filter(function(q){return q[0]===x.r.relation})[0]||['','—','—'];
          return '<tr><td>'+E5(x.st.name||'')+'<small>'+E5(x.st.empId)+'</small></td><td><b>'+E5(x.r.last+' '+x.r.first)+'</b></td><td>'+E5(Z()?rel[1]:rel[2])+'</td><td>'+E5(x.r.dob||'')+'</td><td>'+E5(x.r.passport||'')+'</td>'
            +'<td><button class=\"btn btn-sm btn-g\" onclick=\"kgmFamReviewR927(\\''+E5(x.st.empId)+'\\','+x.i+',true)\">'+(Z()?'核對通過':'Approve')+'</button> '
            +'<button class=\"btn btn-sm\" onclick=\"kgmFamReviewR927(\\''+E5(x.st.empId)+'\\','+x.i+',false)\">'+(Z()?'退回':'Reject')+'</button></td></tr>'}).join('')+'</tbody></table>'
       :'<p class=\"k55-none\">'+(Z()?'目前沒有待核對的登記。':'Nothing waiting for verification.')+'</p>');
  }catch(_){}
}

/* accept dialog: seat, cabin and meal chosen at the counter */`);
RL('css pend','kgm-0823c-r55',"var CSS55=[\n","var CSS55=[\n'.k55-pend td{color:#8a8f98}.k55-pendtag{display:inline-block;margin-left:6px;font-size:10.5px;font-weight:700;color:#8a6b1f;background:#fdf6e3;border:1px solid #ecdcae;border-radius:6px;padding:1px 6px}',\n'.k55-famrev table{width:100%;border-collapse:collapse;font-size:12.5px}.k55-famrev th,.k55-famrev td{padding:7px 8px;border-bottom:1px solid #eef1f4;text-align:left;vertical-align:middle}.k55-famrev td small{display:block;color:#8a8f98;font-size:11px}.k55-famrev h2 span{font-size:13px;color:#8a6b1f;margin-left:6px}.k55-famrev>p{margin:6px 0 12px;font-size:12.5px;color:#5b6570;line-height:1.7}',\n");
/* 櫃檯候補名單：同性朋友同行的排最後 */
RL('standby list friend last','kgm-0823c-r55',"stf.sort(function(a,b){return (b.years-a.years)||String(a.at).localeCompare(String(b.at))})",
 "stf.sort(function(a,b){var fa=a.friendR927?1:0,fb=b.friendR927?1:0;return (fa-fb)||(b.years-a.years)||String(a.at).localeCompare(String(b.at))})");
RL('staffRows5 friend flag','kgm-0823c-r55',"        years:years,who:t.who||'self',\n","        years:years,who:t.who||'self',\n        friendR927:(function(){try{var bk=(S.bookings||[]).filter(function(b){return b&&b.pnr===t.pnr})[0];return !!(window.kgmStxHasFriendR927&&(window.kgmStxHasFriendR927(bk)||window.kgmStxHasFriendR927(t)))}catch(_){return false}})(),\n");
R('policy doc art4','<p>眷屬異動每年至多辦理二次，並應檢附戶籍證明。</p>','<p>眷屬異動每年至多辦理二次，並應檢附戶籍證明。子女不限年齡，惟須檢附親屬關係證明，經後台核對通過後始得同行。</p><p>員工另得登記「同性朋友」同行，應檢附身分證明並經後台核對；同性朋友僅適用 ID50 及 ID25 方案，候補順位排在所有員工票之後。</p>');
