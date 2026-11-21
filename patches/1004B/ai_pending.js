  /* 1004B：待處理事項總覽 —— 只列出這位登入者看得到（有「使用」或「檢視」權限）的分頁 */
  function pending1004B(){
    function vis(tab){if(roleOf()==='ceo')return true;try{var p=window.kgmPermR123?window.kgmPermR123(tab):'';return p==='use'||p==='view'}catch(_){return false}}
    var L=[],tot=0;
    try{if(vis('milesverify')&&window.kgmMilesSimR1004B)window.kgmMilesSimR1004B()}catch(_){}   /* 里程購買的模擬案件原本要打開那一頁才產生 */
    function add(tab,label,arr,fmt){if(!vis(tab)||!arr||!arr.length)return;tot+=arr.length;
      L.push('· '+label+'：'+arr.length+(z()?' 件':'')+'\n'+arr.slice(0,5).map(function(x){return '    '+fmt(x)}).join('\n')+(arr.length>5?'\n    …':''))}
    try{add('cases0831B',z()?'案件處理中心（進行中）':'Open cases',window.kgmCaseOpenRowsR1004B?window.kgmCaseOpenRowsR1004B():[],function(r){return [r.no,r.type,r.pnr,r.status].filter(Boolean).join(' · ')})}catch(_){}
    try{add('milesverify',z()?'里程購買審查（待審）':'Mile purchases to review',(S.milesPurchaseCases0809D||[]).filter(function(c){return c&&/^pending/.test(String(c.status||''))}),function(c){
      var fl='';try{var rk=window.kgmMilesRiskR929&&window.kgmMilesRiskR929(c);if(rk&&(rk.flag||rk.suspicious||(rk.flags&&rk.flags.length)))fl=z()?' ⚠ AI 標記可疑':' ⚠ flagged'}catch(_){}
      return [c.id,c.name,N(c.miles)+(z()?' 哩':' mi')].filter(Boolean).join(' · ')+fl})}catch(_){}
    try{add('leave',z()?'請假待審':'Leave requests',(S.leave||[]).filter(function(x){return x&&/^(pending|ceo_review)$/.test(String(x.status||''))}),function(x){return [(x.empName||x.name||x.empId),x.start||x.from,(x.days?x.days+(z()?' 天':' d'):''),x.reason].filter(Boolean).join(' · ')})}catch(_){}
    try{add('salary',z()?'費用報銷待審':'Expense claims',(S.reimbR928||[]).filter(function(x){return x&&/^(pending|ceo_review)$/.test(String(x.status||''))}),function(x){return [(x.name||x.empName||x.empId),(x.cur||x.currency||''),x.amt||x.amount,x.desc].filter(Boolean).join(' · ')})}catch(_){}
    try{var P=S.permR123||{};add('approve',z()?'權限／變更申請待核':'Permission requests',(P.req||[]).concat(P.change||[]).filter(function(x){return x&&String(x.status||'')==='pending'}),function(x){return [(x.name||x.empId),x.label||x.tab,x.what,x.reason].filter(Boolean).join(' · ')})}catch(_){}
    try{add('stafftix',z()?'員工票眷屬／同性朋友核對':'Dependant checks',window.kgmFamPendingR927?window.kgmFamPendingR927():[],function(x){return (x.st.name||x.st.empId)+'：'+x.r.last+' '+x.r.first})}catch(_){}
    try{add('flightdata',z()?'哩程升等候補（待決定）':'Upgrade standbys',(S.upgradeReqs||[]).filter(function(r){return r&&String(r.status||'')==='waitlist'}),function(r){return [r.code,r.date,r.pnr,r.toCabin].filter(Boolean).join(' · ')})}catch(_){}
    try{add('feedback_r48',z()?'旅客回饋（尚未處理）':'Passenger feedback',window.kgmFeedbackOpenR1004B?window.kgmFeedbackOpenR1004B():[],function(x){return x.txt||x.id})}catch(_){}
    if(!tot)return {ok:true,msg:z()?'目前沒有待處理的事項（依你的職務「'+roleZh()+'」看得到的範圍）。':'Nothing pending.'};
    return {ok:true,msg:(z()?'目前還有 '+tot+' 件待處理（依你的職務「'+roleZh()+'」看得到的範圍）：\n':tot+' items pending:\n')+L.join('\n')};
  }
