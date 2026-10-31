/* ══ 1004B：前台／後台分成兩個檔案（同一份程式，檔案開頭的 KGM_SIDE 決定是哪一邊），兩邊即時同步 ══════════
   使用者：「系統整體太卡頓了，我決定把前台和後台分開，但是要可以同步，你每次更新兩個都要給我，並且要確保兩個可以同步，
   然後移除前台可以進到後台的 Any Shortcuts」
   · 前台（KGM_SIDE='front'）：完全進不了後台 —— AI 指令、Ctrl+Shift+E、任何把畫面切到後台的路徑都擋掉；
     不跑只有後台才用得到的整年機隊重排（開站後 20 秒那一次，實測獨佔主執行緒 30 秒以上）。近 60 天的開機排班照跑（前台顯示機型要用）。
   · 後台（KGM_SIDE='admin'）：一打開就是後台登入。
   · 同步：兩個檔案把資料存在同一個瀏覽器儲存區；一邊存檔，另一邊立刻收到 storage 事件、讀回那一份資料並重畫
     （正在輸入框打字時，等打完再重畫，不會把輸入洗掉）。前提：兩個檔放在同一個網域，或同一台電腦用同一個瀏覽器開同一個資料夾。
   · 沒有 KGM_SIDE（測試用的合併檔）＝前台後台都在，行為跟以前一樣。 */
(function side1004B(){
  var SIDE=String(window.KGM_SIDE||'');
  window.kgmSideR1004B=function(){return SIDE};
  /* 儲存鍵 → S 欄位：從程式本身的 LS.set("鍵",S.欄位) 掃出來，不另外維護一份會過期的清單。
     不同步的：目前登入的旅客（kgmu4，各分頁各自登入）、機隊排班與組員排班（各自算，結果一致）。 */
  var MAP=null,SKIP={kgmu4:1,kgm_tailasg:1,kgm_acftsub:1,kgm_schedgen:1,kgm_schema:1,kgm_crewsched:1};
  function buildMap(){
    MAP={};
    try{[].forEach.call(document.scripts,function(sc){
      var t=sc.textContent||'',re=/LS\.set(?:Now)?\(\s*["']([\w$-]+)["']\s*,\s*S\.([\w$]+)\s*(?:\|\|[^,;)]{0,40})?\)/g,m;
      while((m=re.exec(t))){if(!SKIP[m[1]]&&!MAP[m[1]])MAP[m[1]]=m[2]}
    })}catch(_){}
    /* 季節時刻是好幾個欄位包成一個物件存的 */
    MAP.kgm_r48={seasons:'seasonSchedulesR48',invites:'surveyInvitesR48',responses:'surveyResponsesR48',mileageLedger:'mileageLedgerR48',ai:'aiReissueR48'};
    return MAP;
  }
  /* 兩邊各自定時存檔，內容一樣只是時間戳不同 —— 比較時忽略時間戳，實質內容不同才讀入、才重畫 */
  function same(a,b){
    try{var rp=function(k,v){return /^(updatedAt|predictedAt|predictionUpdatedAt|savedAt|lastSeen|checkedAt)$/.test(k)?undefined:v};
      return JSON.stringify(a===undefined?null:a,rp)===JSON.stringify(b===undefined?null:b,rp)}catch(_){return false}
  }
  window.kgmSyncMapR1004B=function(){return MAP||buildMap()};
  /* 版本號：每份資料寫入時另外記一個版本（kgmrev:鍵）。寫入前先看儲存區的版本是不是比自己手上的新 ——
     是的話代表另一個分頁剛改過、這邊還沒讀到，直接寫會把對方的修改蓋掉（實測：前台剛存的訂位被後台的定時存檔洗掉，兩邊都不見）。
     這時先合併（同一筆以對方為準、兩邊各自新增的都保留），再寫回去。 */
  var BASE={},TAB=Math.random().toString(36).slice(2,8),_get=Storage.prototype.getItem,_set=Storage.prototype.setItem;
  function revOf(k){try{return +String(_get.call(localStorage,'kgmrev:'+k)||'0').split('|')[0]||0}catch(_){return 0}}
  var IDK=['pnr','id','empId','code','key','reqId','caseId','no'];
  function idOf(x){if(!x||typeof x!=='object')return null;for(var i=0;i<IDK.length;i++){var v=x[IDK[i]];if(v!=null&&v!=='')return IDK[i]+':'+v}return null}
  function merge(mine,theirs,depth){
    /* 1004B：整包物件（例如 S.r49 = 新聞＋報到＋對話）也要逐欄合併 —— 原本物件直接用對方的，
       後台剛發的新聞若遇到前台同時存檔就被蓋掉（實測兩次裡一次發生） */
    if(!Array.isArray(mine)&&!Array.isArray(theirs)&&mine&&theirs&&typeof mine==='object'&&typeof theirs==='object'&&(depth||0)<2){
      var o={};Object.keys(theirs).forEach(function(k){o[k]=(k in mine)?merge(mine[k],theirs[k],(depth||0)+1):theirs[k]});
      Object.keys(mine).forEach(function(k){if(!(k in theirs))o[k]=mine[k]});
      return o;
    }
    if(!Array.isArray(mine)||!Array.isArray(theirs))return theirs;
    var seen={},out=theirs.slice(),ok=true;
    theirs.forEach(function(x){var k=idOf(x);if(k==null)ok=false;else seen[k]=1});
    if(!ok)return theirs;
    mine.forEach(function(x){var k=idOf(x);if(k!=null&&!seen[k])out.push(x)});
    return out;
  }
  var pend=0,waiting=0;
  function typing(){var a=document.activeElement;return !!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))}
  function redraw(){
    if(typing()){
      if(!waiting){waiting=1;var iv=setInterval(function(){if(!typing()){clearInterval(iv);waiting=0;try{render()}catch(_){}}},700)}
      return;
    }
    try{render()}catch(_){}
  }
  /* 把儲存區裡這一份讀進 S；回傳有沒有實質變動 */
  /* 季節時刻：每個分頁開啟後前 90 秒都在跑自己的時刻整理（兩邊同一套程式、結果相同），這段期間不讀對方的，
     免得整理到一半被對方的半成品蓋掉；之後（例如後台改了時刻表）照常同步。 */
  var SETTLED=false;setTimeout(function(){SETTLED=true;try{if(pull('kgm_r48',false))changed(['kgm_r48'])}catch(_){}},90000);
  function pull(k,mergeMine){
    var f=MAP[k];if(!f)return false;var ch=false;
    if(k==='kgm_r48'&&!SETTLED)return false;
    try{var raw=_get.call(localStorage,k);if(raw==null)return false;var v=JSON.parse(raw);
      if(typeof f==='string'){var nv=mergeMine?merge(S[f],v):v;if(!same(S[f],nv)){S[f]=nv;ch=true}}
      else Object.keys(f).forEach(function(part){if(v&&v[part]!==undefined){var nv=mergeMine?merge(S[f[part]],v[part]):v[part];if(!same(S[f[part]],nv)){S[f[part]]=nv;ch=true}}});
    }catch(_){}
    BASE[k]=revOf(k);
    return ch;
  }
  function changed(keys){
    window.KGM_SYNC_R1004B={at:new Date().toISOString(),keys:keys,n:((window.KGM_SYNC_R1004B||{}).n||0)+1};
    if(!pend){pend=1;setTimeout(function(){pend=0;redraw()},250)}
  }
  window.addEventListener('storage',function(e){
    try{
      if(!e.key||(e.storageArea&&e.storageArea!==localStorage))return;
      var k=e.key.indexOf('kgmrev:')===0?e.key.slice(7):e.key;
      if(!MAP)buildMap();
      if(!MAP[k])return;
      if(pull(k,false))changed([k]);
    }catch(_){}
  });
  Storage.prototype.setItem=function(k,v){
    try{
      if(this===localStorage&&typeof k==='string'&&k.indexOf('kgmrev:')<0){
        if(!MAP)buildMap();
        if(MAP[k]){
          var cur=revOf(k);
          /* 時刻表以後台為準：前台寫季節時刻這一份時，時刻部分沿用儲存區裡後台的版本，只寫自己的問卷、里程帳等 */
          if(SIDE==='front'&&k==='kgm_r48'){try{var st=JSON.parse(_get.call(this,k)||'null'),mine=JSON.parse(v);if(st&&st.seasons){mine.seasons=st.seasons;v=JSON.stringify(mine)}}catch(_){}}
          if(cur>(BASE[k]||0)){
            /* 對方剛改過、這邊還沒讀到 → 先合併再寫 */
            if(pull(k,true))changed([k]);
            var f=MAP[k];v=JSON.stringify(typeof f==='string'?S[f]:(function(){var o={};try{o=JSON.parse(v)}catch(_){}Object.keys(f).forEach(function(p){o[p]=S[f[p]]});return o})());
          }
          if(_get.call(this,k)===String(v)){BASE[k]=Math.max(BASE[k]||0,cur);return}   /* 內容沒變：不寫、不改版本號 */
          var r=_set.call(this,k,v);
          var nr=Date.now();if(nr<=cur)nr=cur+1;
          _set.call(this,'kgmrev:'+k,nr+'|'+TAB);BASE[k]=nr;
          return r;
        }
      }
    }catch(_){}
    return _set.call(this,k,v);
  };
  /* 開啟時的版本基準 */
  try{buildMap();Object.keys(MAP).forEach(function(k){BASE[k]=revOf(k)})}catch(_){}
  if(SIDE==='front'){
    /* 任何路徑把畫面切到後台 → 一律回首頁 */
    var _r=render;
    render=window.render=function(){
      try{if(S.view==='admin'){S.view='home';S.adminAuthed=false;S.adminUser=null}}catch(_){}
      return _r.apply(this,arguments);
    };
    try{if(S.view==='admin'){S.view='home';render()}}catch(_){}
  }
  if(SIDE==='admin'){
    try{document.documentElement.classList.add('kgm-side-admin')}catch(_){}
    /* 1004B：後台檔不需要前台的 KGM AI。原本是每次重畫後才由後台 AI 的 draw() 把 #aiChat 藏起來，
       換分頁時中間那一下就會閃出來（使用者：「換 tab 他就會閃一下」）。改成一開始就用樣式永久藏住。 */
    try{var st0=document.createElement('style');st0.id='kgm-side-admin-css';st0.textContent='html.kgm-side-admin #aiChat,html.kgm-side-admin #aiWindow{display:none!important}'
      /* 1004B：後台檔的表頭不放前台導覽（優惠與訂票／行程管理／飛行準備／無限萬哩遊）、旅客通知與 Member Portal；語言切換保留 */
      +'html.kgm-side-admin header:has(>div>.portal-util0815)>div:nth-child(2){display:none!important}'   /* 只限網站表頭；後台頁自己的 <header>（管理後台、CEO、PDF）不能動 */
      +'html.kgm-side-admin header .portal-util0815>.r4-notify-head,html.kgm-side-admin header .portal-util0815>.portal-link0815:last-child{display:none!important}';(document.head||document.documentElement).appendChild(st0)}catch(_){}
    try{if(S.view!=='admin'){S.view='admin';render()}}catch(_){}
    /* 後台檔點左上角 KGM AIRWAYS（原本回前台首頁）→ 回後台 */
    var _ra=render;
    render=window.render=function(){try{if(S.view==='home')S.view='admin'}catch(_){}return _ra.apply(this,arguments)};
  }
})();
