/* 0928B · 里程來源（使用者：「帳戶上非自有里程 67,459，但酬賓／升等選里程來源時顯示 0。每次進入酬賓或升等都要問用哪一種。」）
   ① 帳戶頁與升等用的是「里程批次」（mileageLots0809G，自有／非自有分開），酬賓的來源視窗（r10）卻讀 u.nonSelfMiles
      —— 兩個來源不一致，受讓進來的里程在視窗裡永遠是 0。視窗改用同一個批次餘額（kgmMileageBalanceR4）。
   ② 上一次選過的來源會被記住，下次進酬賓／升等就不再問。改成每次進入酬賓機票或里程升等頁都先清掉，重新詢問。 */
R('r10 modal balances',
"self=+u.miles||0,other=+u.nonSelfMiles||0;return '<div class=\"r10-modal\"",
"self=(window.kgmMileageBalanceR4?+window.kgmMileageBalanceR4('self')||0:(+u.miles||0)),other=(window.kgmMileageBalanceR4?+window.kgmMileageBalanceR4('non_self')||0:(+u.nonSelfMiles||0));   /* 0928B：跟帳戶頁同一份里程批次 */return '<div class=\"r10-modal\"",1);
R('r10 prompt balances',
"var self=((S.users||[]).find(function(u){return S.user&&u.id===S.user.id})||S.user||{}).miles||0,other=((S.users||[]).find(function(u){return S.user&&u.id===S.user.id})||{}).nonSelfMiles||0;",
"var self=(window.kgmMileageBalanceR4?+window.kgmMileageBalanceR4('self')||0:0),other=(window.kgmMileageBalanceR4?+window.kgmMileageBalanceR4('non_self')||0:0);   /* 0928B */",1);
RL('ask source every entry','kgm-0909E-r229',
"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();",
"/* ══ 0928B：每次進入酬賓機票／里程升等，都重新詢問里程來源 ══════ */\n"
+"(function(){\n"
+"  function reset(){try{S.mileageSourceR4='';S.pendingMileage0812A=null}catch(_){}}\n"
+"  function wrapFn(name,test){var f=window[name];if(typeof f!=='function'||f.__src928)return;var w=function(){try{if(test.apply(this,arguments))reset()}catch(_){}return f.apply(this,arguments)};w.__src928=1;window[name]=w;try{if(name==='nav')nav=w}catch(_){}}\n"
+"  function install(){\n"
+"    wrapFn('openMileageServiceR11',function(want){return /award|upgrade/.test(String(want||''))});\n"
+"    wrapFn('kgmMilesGoR95',function(go){return /award|upgrade/.test(String(go||''))});\n"
+"    wrapFn('nav',function(v){return (v==='upgrade')||(v==='miles_page'&&/award|upgrade/.test(String(S.milesTab||'')))});\n"
+"  }\n"
+"  install();setTimeout(install,0);setTimeout(install,1500);\n"
+"})();\n"
+"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();",1);
