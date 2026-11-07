/* 1019A：搜尋航班頁面的篩選（使用者：「我希望搜尋航班頁面可以多這個Filter 只要轉機次數（直飛和一次） 營運航空（這個像是澳洲的就顯示KGM和澳洲航空，
   香港的顯示KGM和國泰航空，以此類推不會全部顯示），還有轉機地點（但也只列出該航點Available的）不會列出全部，針對於每個航線，其餘都不用」）
   · 三個篩選：轉機次數（不限／僅直飛／轉機 1 次）、營運航空、轉機點；選項只從「這條航線、這一天」的搜尋結果裡算出來，旁邊寫有幾班。
   · 每一列的「選擇票價」是用在清單裡的位置選航班（pickFare(dir,idx)／pickConnectionFare(cIdx)）→ 不能把航班從清單拿掉，
     改成每一列標上位置（直飛 data-f19＝idx、轉機 data-c19＝cIdx），不符合的用 CSS 藏起來，位置不變、選到的一定是看到的那一班。
   · 狀態存在 S.ff19（依去／回程＋航線；換航線就清掉），換篩選時收起已展開的票價面板。哩程酬賓、員工票頁面不加。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var ZH={'KGM':'KGM Airways','Japan Airlines':'日本航空','Cathay Pacific':'國泰航空','Qantas':'澳洲航空','American Airlines':'美國航空','Alaska Airlines':'阿拉斯加航空',
    'Etihad Airways':'阿提哈德航空','Iberia':'伊比利亞航空','Finnair':'芬蘭航空','Malaysia Airlines':'馬來西亞航空','British Airways':'英國航空','Qatar Airways':'卡達航空'};
  function nm(a){return z()?(ZH[a]||a):(a==='KGM'?'KGM Airways':a)}
  function opOf(f){return f&&f.partner?(f.operator||'Partner'):'KGM'}
  function logo(a){var src='';try{src=a==='KGM'?(window.KGM_LOGO_R1019A||''):((window.KGM_PARTNER_LOGO_R1006A||{})[a]||'')}catch(_){}return src?'<img src="'+src+'" alt="">':''}
  function city(a){try{return CITY(a)}catch(_){return a}}
  /* 這一頁（去程或回程）的直飛與轉機，跟 flightSel 用同一組函式、同一個順序 */
  function lists(dir){
    var isOut=dir==='out',date=isOut?S.search.dep:S.search.ret,fr=isOut?S.search.fr:S.search.to,to=isOut?S.search.to:S.search.fr,fl=[],cn=[];
    try{fl=sortedFlights(fr,to,date)||[]}catch(_){}
    try{var fifth=typeof isFifthMarket==='function'&&isFifthMarket(fr,to);cn=fifth?[]:(findConnections(fr,to,date)||[])}catch(_){}
    return {key:dir+'|'+fr+'|'+to,fl:fl,cn:cn};
  }
  function st(L){var q=S.ff19;if(!q||q.key!==L.key)q=S.ff19={key:L.key,stops:'any',ops:[],hubs:[],open:''};return q}
  function keep(q,L){
    var okD=[],okC=[];
    L.fl.forEach(function(f,i){var ok=q.stops!=='conn'&&(!q.ops.length||q.ops.indexOf(opOf(f))>=0);okD.push(ok)});
    L.cn.forEach(function(c,i){var ops=[opOf(c.f1),opOf(c.f2)];
      var ok=q.stops!=='direct'&&(!q.ops.length||ops.every(function(o){return q.ops.indexOf(o)>=0}))&&(!q.hubs.length||q.hubs.indexOf(c.hub)>=0);okC.push(ok)});
    return {d:okD,c:okC};
  }
  window.kgmFf19R1019A=function(k,v){
    var q=S.ff19;if(!q)return;
    if(k==='open'){q.open=q.open===v?'':v}
    else if(k==='stops'){q.stops=v}
    else if(k==='ops'||k==='hubs'){var a=q[k],i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v)}
    else if(k==='clear'){if(v==='stops')q.stops='any';else q[v]=[]}
    else if(k==='all'){q.stops='any';q.ops=[];q.hubs=[];q.open=''}
    if(k!=='open'){S.openFare=null;S.openConnR1012A=null}
    try{render()}catch(_){}
  };
  function bar(dir,L,q,K){
    var Z=z(),nD=L.fl.length,nC=L.cn.length;
    /* 選項：只列這次結果裡有的 */
    var opsCnt={},hubCnt={};
    L.fl.forEach(function(f){var o=opOf(f);opsCnt[o]=(opsCnt[o]||0)+1});
    /* 旁邊的數字＝只勾這一家時會看到幾班（轉機兩段不同家的，要兩家都勾才出現，不算進任何一家；這家要列出來） */
    var opsAll={},mix={};
    L.cn.forEach(function(c){var a=opOf(c.f1),b=opOf(c.f2);opsAll[a]=1;opsAll[b]=1;if(a===b)opsCnt[a]=(opsCnt[a]||0)+1;else{(mix[a]=mix[a]||{})[b]=1;(mix[b]=mix[b]||{})[a]=1}hubCnt[c.hub]=(hubCnt[c.hub]||0)+1});
    Object.keys(opsAll).forEach(function(o){if(!opsCnt[o])opsCnt[o]=0});
    var ops=Object.keys(opsCnt).sort(function(a,b){return a==='KGM'?-1:b==='KGM'?1:nm(a).localeCompare(nm(b))}),hubs=Object.keys(hubCnt).sort(function(a,b){return hubCnt[b]-hubCnt[a]});
    q.ops=q.ops.filter(function(o){return o in opsCnt});q.hubs=q.hubs.filter(function(h){return hubCnt[h]});   /* 換日期後這天沒有的選項自動拿掉 */
    var shown=K.d.filter(Boolean).length+K.c.filter(Boolean).length,total=nD+nC;
    function chip(id,label,on,body){
      return '<div class="ff19-c'+(q.open===id?' open':'')+'"><button class="ff19-b'+(on?' on':'')+'" onclick="kgmFf19R1019A(\'open\',\''+id+'\')">'+label
        +'<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
        +(q.open===id?'<div class="ff19-p" onclick="event.stopPropagation()"><div class="ff19-ph"><b>'+label.replace(/<[^>]+>/g,'')+'</b><button aria-label="close" onclick="kgmFf19R1019A(\'open\',\''+id+'\')">✕</button></div>'+body
          +'<div class="ff19-pf"><button onclick="kgmFf19R1019A(\'clear\',\''+id+'\')"'+((id==='stops'?q.stops==='any':!q[id].length)?' disabled':'')+'>'+(Z?'清除':'Clear')+'</button></div></div>':'')+'</div>';
    }
    function radio(v,t,n){var dis=!n&&v!=='any';return '<label class="ff19-o'+(dis?' dis':'')+'"><input type="radio" name="ff19s"'+(q.stops===v?' checked':'')+(dis?' disabled':'')+' onchange="kgmFf19R1019A(\'stops\',\''+v+'\')"><span>'+t+'</span><em>'+n+'</em></label>'}
    function check(k,v,t,n,ic){return '<label class="ff19-o"><input type="checkbox"'+(q[k].indexOf(v)>=0?' checked':'')+' onchange="kgmFf19R1019A(\''+k+'\',\''+E(v)+'\')">'+(ic?'<i class="ff19-lg">'+ic+'</i>':'')+'<span>'+t+'</span><em>'+n+'</em></label>'}
    var stopsLbl=q.stops==='direct'?(Z?'僅直飛':'Nonstop only'):q.stops==='conn'?(Z?'轉機 1 次':'1 stop'):(Z?'轉機次數':'Stops');
    var opsLbl=q.ops.length?(q.ops.length===1?nm(q.ops[0]):(Z?'營運航空 · ':'Airlines · ')+q.ops.length):(Z?'營運航空':'Airlines');
    var hubLbl=q.hubs.length?(q.hubs.length===1?(Z?'經 ':'via ')+city(q.hubs[0]):(Z?'轉機點 · ':'Connections · ')+q.hubs.length):(Z?'轉機點':'Connecting airport');
    var h='<div class="ff19">'
      +chip('stops',stopsLbl,q.stops!=='any',radio('any',Z?'不限轉機次數':'Any number of stops',total)+radio('direct',Z?'僅顯示直飛航班':'Nonstop only',nD)+radio('conn',Z?'轉機 1 次':'1 stop',nC))
      +chip('ops',opsLbl,q.ops.length>0,ops.map(function(o){return check('ops',o,E(nm(o)),opsCnt[o]||'<i class="ff19-mix">'+(Z?'需同時勾選 ':'with ')+E(Object.keys(mix[o]||{}).map(nm).join(Z?'、':', '))+'</i>',logo(o))}).join('')
        +'<div class="ff19-tip">'+(Z?'轉機航班要每一段的營運航空都有勾選才會顯示。':'Connections show only if every leg is operated by a selected airline.')+'</div>')
      +(hubs.length?chip('hubs',hubLbl,q.hubs.length>0,hubs.map(function(a){return check('hubs',a,E(city(a))+' <small>'+E(a)+'</small>',hubCnt[a],'')}).join('')):'')
      +((q.stops!=='any'||q.ops.length||q.hubs.length)?'<button class="ff19-x" onclick="kgmFf19R1019A(\'all\')">'+(Z?'全部清除':'Clear all')+'</button>':'')
      +'<span class="ff19-n">'+(Z?'顯示 '+shown+'／'+total+' 個航班':shown+' of '+total+' flights')+'</span>'
      +'</div>';
    if(!shown&&total)h+='<div class="ff19-empty">'+(Z?'沒有符合篩選條件的航班。':'No flights match these filters.')+' <button onclick="kgmFf19R1019A(\'all\')">'+(Z?'清除篩選':'Clear filters')+'</button></div>';
    return h;
  }
  var CSS='<style id="ff19-css">.ff19{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:14px 0 12px}'
    +'.ff19-c{position:relative}.ff19-b{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border:1px solid #d5ddd9;border-radius:999px;background:#fff;font:inherit;font-size:13.5px;font-weight:700;color:#33413b;cursor:pointer}'
    +'.ff19-b:hover{border-color:#0f3d34}.ff19-b.on{background:#e8f1ec;border-color:#0f3d34;color:#0f3d34}.ff19-c.open .ff19-b svg{transform:rotate(180deg)}'
    +'.ff19-p{position:absolute;z-index:40;top:44px;left:0;min-width:280px;max-width:340px;background:#fff;border:1px solid #e3e9e6;border-radius:14px;box-shadow:0 18px 40px -12px rgba(16,40,32,.28);padding:16px 18px 10px}'
    +'.ff19-ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.ff19-ph b{font-size:15px;color:#1d2a25}.ff19-ph button{border:0;background:none;font-size:16px;color:#6b7b74;cursor:pointer}'
    +'.ff19-o{display:flex;align-items:center;gap:10px;padding:9px 2px;font-size:14px;color:#1d2a25;cursor:pointer;border-radius:8px}.ff19-o:hover{background:#f6f9f7}'
    +'.ff19-o input{width:18px;height:18px;accent-color:#0f3d34;margin:0;flex:0 0 auto}.ff19-o span{flex:1}.ff19-o small{color:#8a978f;font-size:11px;letter-spacing:.06em;margin-left:4px}'
    +'.ff19-o em{font-style:normal;font-size:12px;color:#8a978f;font-variant-numeric:tabular-nums}.ff19-o.dis{opacity:.45;cursor:not-allowed}.ff19-mix{font-style:normal;font-size:11px;color:#a07a2c}'
    +'.ff19-lg{display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;border:1px solid #e3e9e6;border-radius:6px;background:#fff;overflow:hidden}.ff19-lg img{max-width:20px;max-height:18px;object-fit:contain}'
    +'.ff19-tip{font-size:11px;color:#8a978f;margin:6px 2px 2px;line-height:1.5}'
    +'.ff19-pf{display:flex;justify-content:flex-end;border-top:1px solid #eef2f0;margin-top:8px;padding-top:8px}.ff19-pf button{border:0;background:none;font:inherit;font-size:13px;font-weight:700;color:#0f5f57;cursor:pointer}.ff19-pf button:disabled{color:#b8c2bd;cursor:default}'
    +'.ff19-x{border:0;background:none;font:inherit;font-size:13px;font-weight:700;color:#0f5f57;cursor:pointer;padding:0 6px}'
    +'.ff19-n{margin-left:auto;font-size:12px;color:#6b7b74}'
    +'.ff19-empty{border:1px dashed #cdd7d2;border-radius:12px;padding:18px;text-align:center;color:#55645e;font-size:13.5px;margin-bottom:12px}.ff19-empty button{border:0;background:none;font:inherit;font-weight:800;color:#0f5f57;cursor:pointer}'
    +'@media (max-width:640px){.ff19-p{position:fixed;left:12px;right:12px;top:auto;bottom:12px;max-width:none;max-height:70vh;overflow:auto;z-index:2147483600}.ff19-n{width:100%;margin-left:0}}</style>';
  if(typeof flightSel==='function'&&!flightSel.__ff19){
    var fs19=flightSel;
    flightSel=function(dir){
      var h=String(fs19.apply(this,arguments));
      try{
        if((S.search&&S.search.useMiles&&S.user)||(S.stx&&S.stx.plan)||h.indexOf('<!--ff19-->')<0)return h.replace('<!--ff19-->','');
        var L=lists(dir),q=st(L);if(!L.fl.length&&!L.cn.length)return h.replace('<!--ff19-->','');
        var K=keep(q,L),hide=[];
        /* 打開票價面板時 #app 會帶 k221-step，r228 用 #app.k221-step tr.fl-row{display:table-row!important} 把列全部打開 → 這裡權重要比它高 */
        /* 手機版 mb19 把列改成卡片用 html:not(.kgm-side-admin) body #app tr.fl-row.fl-row（1,3,3）→ 藏列再疊一次 class 到（1,4,3） */
        K.d.forEach(function(ok,i){if(!ok)hide.push('tr[data-f19="'+i+'"],html body #app tr.fl-row.fl-row.fl-row[data-f19="'+i+'"],html body #app tr#fp'+i)});
        K.c.forEach(function(ok,i){if(!ok)hide.push('tr[data-c19="'+i+'"],html body #app tr.k12c-row.k12c-row.k12c-row[data-c19="'+i+'"]')});
        var css=CSS+(hide.length?'<style id="ff19-hide">'+hide.join(',')+'{display:none!important}</style>':'');
        h=h.replace('<!--ff19-->',css+bar(dir,L,q,K));
      }catch(_){h=h.replace('<!--ff19-->','')}
      return h;
    };
    flightSel.__ff19=1;
  }
})();
