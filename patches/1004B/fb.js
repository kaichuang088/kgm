/* 1004B：使用者：「客人回櫃改成旅客回饋然後如果有表揚到哪位組員或是責罵的要幫我列出來！
   然後管理員可以一個按鈕按下加績效（如果是表揚）或是扣績效（如果是罵他不好）」
   旅客問卷本來就有「指定一位空服員＋空服員評分」：空服員 4 分以上、而且意見是在稱讚組員＝表揚；空服員 2 分以下、或意見在抱怨組員＝申訴。
   近 30 天、還沒處理的排前面。按鈕直接登錄功過（表揚＝嘉獎、申訴＝警告），寫進「薪資功過」並通知那位組員。 */
var FBCREW1004B=/空服員|座艙長|組員|機組|服務員|purser|crew/i,FBNEG1004B=/態度|不耐|冷淡|失禮|很差|不理|兇|敷衍|無禮|愛理不理/;
function fbEmp1004B(x){
  if(x.crewEmpR1004B)return x.crewEmpR1004B;
  var n=String(x.crewMember||'').trim().toLowerCase();if(!n)return '';
  var all=(S.staff||[]).slice();try{var PL=window.kgmCrewPoolR121();all=all.concat(PL.cabin||[])}catch(_){}
  var seen={},hit=all.filter(function(s){if(!s||seen[s.empId]||String(s.name||'').trim().toLowerCase()!==n)return false;seen[s.empId]=1;return true});
  return hit.length===1?hit[0].empId:'';
}
function fbCrewRows1004B(){
  var out=[],t0=addDays(T(),-30);
  (S.surveyResponsesR48||[]).forEach(function(x,i){
    if(!x||!x.crewMember||String(x.date||'')<t0)return;
    var sc=+x.crew||0,txt=String(x.comment||''),crew=FBCREW1004B.test(txt),neg=FBNEG1004B.test(txt);
    var kind=(sc&&sc<=2)||(crew&&neg)?'complaint':(sc>=4&&crew&&!neg)?'praise':'';
    if(kind)out.push({i:i,x:x,kind:kind,emp:fbEmp1004B(x)});
  });
  return out.sort(function(a,b){return (a.x.perfR1004B?1:0)-(b.x.perfR1004B?1:0)||String(b.x.date).localeCompare(String(a.x.date))});
}
window.kgmFeedbackOpenR1004B=function(){return fbCrewRows1004B().filter(function(r){return !r.x.perfR1004B}).map(function(r){return {id:r.i,txt:(r.kind==='praise'?'表揚 ':'申訴 ')+r.x.crewMember+' · '+r.x.code+' '+r.x.date+' · 空服員 '+(r.x.crew||'—')+'/5'}})};
window.kgmFbPerfR1004B=function(i){
  var x=(S.surveyResponsesR48||[])[+i];if(!x||x.perfR1004B)return;
  var r=fbCrewRows1004B().filter(function(q){return q.i===+i})[0];if(!r)return;
  var emp=r.emp,st=(S.staff||[]).filter(function(s){return s&&s.empId===emp})[0];
  if(!st){try{var PL=window.kgmCrewPoolR121();st=(PL.cabin||[]).concat(PL.pilots||[]).filter(function(s){return s&&s.empId===emp})[0]}catch(_){}}   /* 排班池裡的組員不一定在 S.staff */
  if(!st){alert(z()?'問卷上的組員姓名對不到員工資料，請到「薪資功過」手動登錄。':'Crew member not found.');return}
  var type=r.kind==='praise'?'award1':'warn1',mt=MERIT_TYPES[type];
  var reason=(r.kind==='praise'?'旅客表揚':'旅客申訴')+'：'+x.code+' '+x.date+(x.comment?'「'+String(x.comment).slice(0,40)+'」':'')+'（空服員評分 '+(x.crew||'—')+'/5）';
  S.merits=S.merits||[];S.merits.unshift({empId:emp,type:type,reason:reason,date:todayISO(),by:(S.adminUser||{}).name||(S.adminUser||{}).empId||'',srcR1004B:'feedback'});
  x.perfR1004B={how:type,at:new Date().toISOString(),by:(S.adminUser||{}).empId||'',empId:emp};
  try{notifyStaff(emp,'人事通知：您被登錄「'+mt[0]+'」（'+(mt[1]>0?'獎金 NT$'+mt[1].toLocaleString():'績效 '+mt[1]+'%')+'），事由：'+reason)}catch(_){}
  try{logAct('功過登錄（旅客回饋）',st.name+'・'+mt[0]+'・'+reason)}catch(_){}
  try{save()}catch(_){}try{render()}catch(_){}
};
function fbCrew1004B(){
  var rows=fbCrewRows1004B(),pr=rows.filter(function(r){return r.kind==='praise'}),cp=rows.filter(function(r){return r.kind==='complaint'});
  function card(r){
    var x=r.x,done=x.perfR1004B,mt=done&&MERIT_TYPES[done.how];
    return '<article class="k4b-fb-it '+r.kind+(done?' done':'')+'"><header><b>'+E(x.crewMember)+'</b>'+(r.emp?'<small>'+E(r.emp)+'</small>':'')+'<span class="k4b-fb-sc">'+(z()?'空服員 ':'Crew ')+(x.crew||'—')+'/5</span></header>'
      +'<p>'+(x.comment?'「'+E(x.comment)+'」':'<i>'+(z()?'（沒有文字意見）':'(no comment)')+'</i>')+'</p>'
      +'<footer><span>'+E(x.code)+' · '+E(x.date)+(x.pnr?' · '+E(x.pnr):'')+'</span>'
      +(done?'<em>'+(z()?'已登錄 ':'Filed ')+E(mt?mt[0]:done.how)+' · '+E(done.by||'')+'</em>'
        :(r.emp?'<button class="btn btn-sm '+(r.kind==='praise'?'btn-g':'k4b-fb-neg')+'" onclick="kgmFbPerfR1004B('+r.i+')">'+(r.kind==='praise'?(z()?'＋ 加績效（嘉獎）':'+ Commend'):(z()?'－ 扣績效（警告）':'− Warn'))+'</button>'
          :'<em>'+(z()?'姓名對不到員工，請手動登錄':'No staff match')+'</em>'))+'</footer></article>';
  }
  function col(t,cls,list){var open=list.filter(function(r){return !r.x.perfR1004B}).length;
    return '<div class="k4b-fb-col '+cls+'"><h3>'+t+' <span>'+list.length+'</span>'+(open?'<i>'+(z()?'待處理 ':'open ')+open+'</i>':'')+'</h3>'
      +(list.length?list.slice(0,12).map(card).join('')+(list.length>12?'<div class="k4b-fb-more">'+(z()?'另有 '+(list.length-12)+' 筆較早的紀錄':'+'+(list.length-12)+' more')+'</div>':''):'<div class="k4b-fb-none">'+(z()?'近 30 天沒有':'None in 30 days')+'</div>')+'</div>';
  }
  return '<section class="k4b-fb"><div class="k4b-fb-head"><div><small>CREW · PRAISE & COMPLAINTS</small><h2>'+(z()?'組員表揚與申訴':'Crew praise and complaints')+'</h2>'
    +'<p>'+(z()?'近 30 天的問卷裡，旅客指定的空服員拿到 4 分以上、意見又是在稱讚組員的列為表揚；空服員 2 分以下、或意見在抱怨組員的列為申訴。按一下就登錄到「薪資功過」：表揚＝嘉獎（獎金 NT$1,000），申訴＝警告（績效 −2%），並通知該組員。':'Last 30 days. One click files a commendation or warning in Salary & Merits.')+'</p></div></div>'
    +'<div class="k4b-fb-cols">'+col(z()?'表揚':'Praise','p',pr)+col(z()?'申訴':'Complaints','c',cp)+'</div></section>';
}
