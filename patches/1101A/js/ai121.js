/* ══ 1121A R6（使用者：「看看後台AI的聰明程度。。。」）══
   截圖：「k10203想把11-27 and 11-28的MNL換成其他的」→ 引擎只讀第一個日期，又把 MNL 當成「要換去的地方」（在 MNL 的班上找人），
   找不到兩人對調就叫人換一天；接著「那他要換12-05 and 12-07的PEN航線可以換成其他日本航線嗎」→ 沒有員工編號（「他」）就看不懂。
   不另做一套 AI：在後台 AI 入口（kgmAdminAiAskR929，最外層）前面加一道整理，整理完照原本的引擎執行：
   ① 「他／她／這位」→ 這段對話上一次提到的員工編號；
   ② 一句話裡好幾個日期（and／和／、）→ 每個日期各跑一次換班；
   ③ 「XXX 換成其他的／其他日本航線／韓國…」→ XXX 是「原本要換掉的」，候選是「其他航點（不含 XXX）」或該區域的航點，
      同機型族、同職級、兩人對調的規則不變（只動這兩個人，1023A 使用者規定）。
   整理後的指令會顯示在對話裡（看得到 AI 怎麼理解）。 */
(function(){
  if(window.__ai121)return;window.__ai121=1;
  var REG={'日本':'NRT HND KIX NGO FUK CTS OKA HIJ HKD KMJ KOJ MYJ OKJ SDJ UKB','韓國':'ICN GMP PUS CJU','中國':'PVG SHA PEK CAN CTU CKG SZX XMN HGH CGO','大陸':'PVG SHA PEK CAN CTU CKG SZX XMN HGH CGO',
    '港澳':'HKG MFM','東南亞':'BKK DMK SIN KUL PEN MNL CEB SGN HAN DAD CGK DPS CNX KTI','泰國':'BKK DMK CNX','美國':'LAX SFO SEA JFK EWR ORD IAH DFW BOS ATL LAS PHX DTW IAD ONT HNL','北美':'LAX SFO SEA JFK EWR ORD IAH DFW BOS ATL LAS PHX DTW IAD ONT HNL YVR YYZ',
    '加拿大':'YVR YYZ','歐洲':'LHR CDG FRA MUC AMS VIE ZRH FCO MXP MAD BCN PRG BUD WAW ATH IST HEL','澳洲':'SYD MEL BNE PER','紐西蘭':'AKL CHC','澳紐':'SYD MEL BNE PER AKL CHC','短程':'NRT HND KIX NGO FUK CTS OKA ICN GMP PUS HKG MFM MNL PVG SHA'};
  var NET=null;function net(){if(NET)return NET;NET={};try{(FLIGHTS||[]).forEach(function(f){if(f&&!f.partner&&/^KX\d{1,3}$/.test(f.code)&&f.fr==='TPE')NET[f.to]=1})}catch(_){}return NET}
  function codesIn(t){var out=[],n=net(),u=String(t).toUpperCase(),m,re=/(^|[^A-Z])([A-Z]{3})(?![A-Z])/g;while((m=re.exec(u))){if(n[m[2]]&&out.indexOf(m[2])<0)out.push(m[2])}
    try{Object.keys(CITY_ZH).forEach(function(c){if(!n[c]||out.indexOf(c)>=0)return;var nm=String(CITY_ZH[c]||'');if(nm.length>=2&&t.indexOf(nm)>=0)out.push(c);else if(nm.length===4&&t.indexOf(nm.slice(2))>=0&&!/^(國際|機場)$/.test(nm.slice(2)))out.push(c)})}catch(_){}
    return out}
  function chatArr(){try{var s=S.adminAiR929||{},k=(S.adminUser||{}).empId||'ADMIN';return s[k]||[]}catch(_){return []}}
  function lastId(){var c=chatArr();for(var i=c.length-1;i>=0;i--){var m=c[i]&&c[i].role==='user'&&/\b([Kk]\d{5,6})\b/.exec(String(c[i].text||''));if(m)return m[1].toUpperCase()}return ''}
  function today(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function datesIn(t){var out=[],m,re=/(?:(\d{4})[-\/.年])?(\d{1,2})[-\/.月](\d{1,2})日?/g,td=today(),y=+td.slice(0,4);
    while((m=re.exec(t))){var mo=+m[2],d=+m[3];if(mo<1||mo>12||d<1||d>31)continue;var yy=m[1]?+m[1]:y,iso=yy+'-'+('0'+mo).slice(-2)+'-'+('0'+d).slice(-2);if(!m[1]&&iso<td&&(+td.slice(5,7)-mo)>2)iso=(y+1)+iso.slice(4);if(out.indexOf(iso)<0)out.push(iso)}return out}
  var PRON=/他|她|這位|該員|同一位|同一個人|\bhim\b|\bher\b|this crew/i;
  function rewrite(text){var t=String(text||'').trim();if(!t)return null;
    if(/^(選方案|第\s*\d\s*(位|個))|^help$/i.test(t))return null;
    var ids=[],m,re=/\b([Kk]\d{5,6})\b/g;while((m=re.exec(t))){var id=m[1].toUpperCase();if(ids.indexOf(id)<0)ids.push(id)}
    var usedPron=false;if(!ids.length&&PRON.test(t)){var li=lastId();if(li){ids=[li];usedPron=true}}
    var swap=/換|調|swap/i.test(t);
    if(!ids.length)return null;
    if(!swap)return usedPron?{cmds:[ids[0]+' '+t],why:'「'+t.match(PRON)[0]+'」＝'+ids[0]}:null;
    var kw=/(換成|換到|改成|改飛|換去|換為)/.exec(t),bf=kw?t.slice(0,kw.index):t,af=kw?t.slice(kw.index+kw[0].length):'';
    var ds=datesIn(bf);if(!ds.length)ds=datesIn(t);
    if(kw&&/[A-Za-z]{3}\s*(?:-|－|→|->|>|到|至)\s*[A-Za-z]{3}/.test(af)){   /* 指定換到哪一段 → 原本的引擎看得懂（TR:），只處理多個日期／代名詞 */
      if(ds.length<=1&&!usedPron)return null;var rest=t.replace(/\b[Kk]\d{5,6}\b/g,'');return {cmds:(ds.length?ds:['']).map(function(d){return ids[0]+' '+d+' '+rest.replace(/(?:(\d{4})[-\/.年])?(\d{1,2})[-\/.月](\d{1,2})日?(\s*(and|和|跟|、|,|，|及)\s*(?:(\d{4})[-\/.年])?\d{1,2}[-\/.月]\d{1,2}日?)*/,'')}),why:(usedPron?'「他」＝'+ids[0]+'；':'')+'日期分開各找一次'}}
    var src=codesIn(bf),tg=[],lab=[];
    Object.keys(REG).forEach(function(k){if(af.indexOf(k)>=0){lab.push(k);REG[k].split(' ').forEach(function(c){if(net()[c]&&tg.indexOf(c)<0)tg.push(c)})}});
    if(!tg.length){var ex=codesIn(af);if(ex.length){tg=ex;lab.push(ex.join('／'))}}
    if(!tg.length&&(!kw||/其他|其它|別的|任何|other|any|都可以|都行/i.test(af))){Object.keys(net()).forEach(function(c){if(tg.indexOf(c)<0)tg.push(c)});lab.push('其他任何航點')}
    tg=tg.filter(function(c){return src.indexOf(c)<0&&c!=='TPE'&&c!=='TSA'});
    if(!tg.length||!ds.length)return (ds.length>1||usedPron)?{cmds:ds.map(function(d){return ids[0]+' '+d+' 換班 '+src.join(' ')}),why:(usedPron?'「他」＝'+ids[0]+'；':'')+'日期分開各找一次'}:null;
    var srcZ=src.map(function(c){try{return (CITY_ZH[c]||c)}catch(_){return c}}).join('／');
    return {cmds:ds.map(function(d){return ids[0]+' '+d+' 換班（原本'+(srcZ||'那天的班')+'，換成'+lab.join('、')+'）'+tg.join(' ')}),
      why:(usedPron?'「他」＝'+ids[0]+'；':'')+(ds.length>1?ds.length+' 個日期分開各找一次；':'')+(src.length?srcZ+' 是要換掉的班（不在 '+srcZ+' 的班上找人）；':'')+'候選＝'+lab.join('、')+'（'+tg.length+' 個航點）的同機型族、同職級組員，兩人對調'};
  }
  window.kgmAiRewriteR1121A=rewrite;
  function note(txt){try{var s=S.adminAiR929=S.adminAiR929||{},k=(S.adminUser||{}).empId||'ADMIN';(s[k]=s[k]||[]).push({role:'assistant',text:txt,at:new Date().toISOString(),note:'站內 AI：理解你的需求'})}catch(_){}}
  function hook(){var W0=window.kgmAdminAiAskR929;if(typeof W0!=='function'||W0.__ai121)return;
    var w=async function(text){var r=null;try{r=rewrite(text)}catch(e){r=null}
      if(!r||!r.cmds||!r.cmds.length)return W0.apply(this,arguments);
      try{var s=S.adminAiR929=S.adminAiR929||{},k=(S.adminUser||{}).empId||'ADMIN';(s[k]=s[k]||[]).push({role:'user',text:String(text),at:new Date().toISOString()})}catch(_){}
      note('我理解成：'+r.why+'。'+(r.cmds.length>1?'下面分 '+r.cmds.length+' 次找：':'')+'\n'+r.cmds.map(function(c){return '・'+c.replace(/\s[A-Z]{3}(\s[A-Z]{3})+$/,' …')}).join('\n'));
      for(var i=0;i<r.cmds.length;i++){try{await W0.call(this,r.cmds[i])}catch(_){}}};
    w.__ai121=1;window.kgmAdminAiAskR929=w}
  hook();[0,1500,3500,8000,15000,30000,60000].forEach(function(t){setTimeout(hook,t)});
})();
