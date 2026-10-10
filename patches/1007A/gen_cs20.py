from common import *
# ══ 1006A #20：「我希望AI對話那裡客服要可編輯，然後有些會按下轉人工，客服那裡要顯示說有幾個在等待，然後可以Chat，
#    還有再轉交給人工之前系統要自動做一個簡短的Summary包含訂位代號要幹嘛等等的」 ══
#   前台 AI 視窗：多一顆「轉真人客服」。按下去先由系統整理摘要（會員、訂位代號、需求類別、航班、旅客最後一句話），
#     排進真人客服佇列；之後旅客打的字直接送給客服（AI 不回），客服的回覆即時出現在同一個視窗。
#   後台「AI 對話查詢」（cases0831C）最上面多一塊「真人客服」：等待中／處理中人數、佇列、對話、可編輯的摘要、
#     可以更正 AI 先前的回覆（旅客那邊同步改成更正後的內容並註明）、接手、回覆、結束。側邊欄顯示等待人數。
#   資料：S.csQueueR1006A＝{id: 對話}；以 LS.set("kgm_csq6",S.csQueueR1006A) 存檔，前後台同步引擎自動帶過去
#     （物件逐欄合併、訊息陣列依 id 合併，兩邊同時打字不會互相蓋掉）。
L='kgm-0909E-r229'
JS=r"""/* ══ 1006A #20：AI 對話轉真人客服 ═══════════════════════════════════════════ */
(function cs1006A(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(v){return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function nid(p){return p+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase()}
  function now(){return new Date().toISOString()}
  function Q(){if(!S.csQueueR1006A||typeof S.csQueueR1006A!=='object'||Array.isArray(S.csQueueR1006A)){var v=null;try{v=LS.get('kgm_csq6',null)}catch(_){}S.csQueueR1006A=(v&&typeof v==='object'&&!Array.isArray(v))?v:{}}return S.csQueueR1006A}
  function persist(){try{LS.set("kgm_csq6",S.csQueueR1006A)}catch(_){}try{save()}catch(_){}}
  Q();
  /* 存檔一律帶上佇列（同步引擎靠這一行認得 kgm_csq6 ↔ S.csQueueR1006A） */
  if(typeof save==='function'&&!save.cs1006A){var sv6=save;save=window.save=function(){var r=sv6.apply(this,arguments);try{LS.set("kgm_csq6",S.csQueueR1006A)}catch(_){}return r};save.cs1006A=true}
  function list(st){var q=Q();return Object.keys(q).map(function(k){return q[k]}).filter(function(x){return x&&(!st||st.indexOf(x.status)>=0)})}
  window.kgmCsWaitingR1006A=function(){return list(['waiting']).length};
  function conv(){try{return S.aiConversation0819I||null}catch(_){return null}}
  function user6(){var u=S.user||{};return {id:u.id||'GUEST',name:u.name||[u.lastName,u.firstName].filter(Boolean).join(' ')||(z()?'訪客':'Guest'),email:u.email||''}}
  /* ── 自動摘要：訂位代號、需求、航班、日期、旅客最後一句話 ── */
  var INTENT=[[/退票|取消.*(訂位|機票|行程)|refund|cancel/i,'退票／取消'],[/改票|改期|改日期|換班|改航班|change\s*(flight|date)/i,'改票'],
    [/升等|upgrade/i,'里程升等'],[/酬賓|award|里程票/i,'酬賓機票'],[/行李|baggage|luggage/i,'行李'],[/選位|座位|seat/i,'選位'],
    [/餐|meal/i,'特殊餐'],[/報到|check.?in/i,'報到'],[/退款|refund/i,'退款'],[/里程|miles?/i,'里程'],[/姓名|名字|護照|資料更改|name/i,'旅客資料更改'],
    [/寵物|輪椅|特殊協助|嬰兒|wheelchair|pet/i,'特殊服務'],[/抱怨|客訴|投訴|很差|生氣|complain/i,'客訴'],[/發票|收據|invoice|receipt/i,'收據／發票']];
  function summarize(c,u){
    var msgs=(c&&c.messages)||[],ut=msgs.filter(function(m){return m.role==='user'}).map(function(m){return String(m.text||'')}),all=ut.join('  ');
    var pnrs=[];(all.toUpperCase().match(/\b[A-Z0-9]{6}\b/g)||[]).forEach(function(p){if(/[A-Z]/.test(p)&&/\d/.test(p)&&pnrs.indexOf(p)<0)pnrs.push(p)});
    var known=(S.bookings||[]).filter(function(b){return b&&b.pnr&&(b.userId===u.id||(S.user&&b.email&&b.email===S.user.email))});
    var pnr=pnrs.filter(function(p){return known.some(function(b){return b.pnr===p})})[0]||pnrs[0]||'';
    if(!pnr&&known.length){var up=known.filter(function(b){return !/cancel|refund/.test(String(b.status||''))}).sort(function(a,b){return String((a.outF||{}).date||'').localeCompare(String((b.outF||{}).date||''))});var t=new Date().toISOString().slice(0,10);var nx=up.filter(function(b){return String((b.outF||{}).date||'')>=t})[0];if(nx)pnr=nx.pnr+(z()?'（會員最近一筆行程，旅客未提及）':' (next trip, not mentioned)')}
    var intents=[];INTENT.forEach(function(x){if(x[0].test(all)&&intents.indexOf(x[1])<0)intents.push(x[1])});
    var codes=(all.toUpperCase().match(/\bKX\s?\d{1,4}\b/g)||[]).map(function(x){return x.replace(/\s+/g,'')}).filter(function(x,i,a){return a.indexOf(x)===i});
    var dates=(all.match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}\s*[\/月]\s*\d{1,2}\s*日?/g)||[]).slice(0,3);
    var last=ut.length?ut[ut.length-1]:'';if(last.length>70)last=last.slice(0,70)+'…';
    var mode=c&&c.mode&&c.mode!=='home'?({flight:'航班查詢',award:'酬賓機票',upgrade:'里程升等',miles:'里程查詢'})[c.mode]||c.mode:'';
    var need=intents.length?intents.join('、'):(mode?mode:(z()?'一般詢問':'General'));
    var s=[(z()?'會員 ':'Member ')+u.name+(u.id&&u.id!=='GUEST'?'（'+u.id+'）':''),(z()?'訂位代號 ':'PNR ')+(pnr||(z()?'未提供':'none')),(z()?'需求 ':'Needs ')+need];
    if(codes.length)s.push((z()?'航班 ':'Flights ')+codes.join('、'));
    if(dates.length)s.push((z()?'日期 ':'Dates ')+dates.join('、'));
    if(last)s.push((z()?'旅客最後說：「':'Last message: "')+last+(z()?'」':'"'));
    return {text:s.join('｜'),pnr:String(pnr).slice(0,6),need:need,codes:codes};
  }
  /* ── 前台：轉真人客服 ── */
  window.kgmCsHandoffR1006A=function(){
    var c=conv();if(!c)return;
    if(c.csIdR1006A&&Q()[c.csIdR1006A]&&/waiting|active/.test(Q()[c.csIdR1006A].status))return;
    var u=user6(),sm=summarize(c,u),id=nid('CS'),q=Q();
    var ahead=list(['waiting']).length;
    var hist=(c.messages||[]).slice(-20).map(function(m,i,arr){return {id:nid('M'),role:m.role==='user'?'user':'ai',text:String(m.html?String(m.text||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim():m.text||'').slice(0,600),at:m.at||now(),convAt:m.at||''}});
    q[id]={id:id,userId:u.id,name:u.name,email:u.email,pnr:sm.pnr,need:sm.need,summary:sm.text,summaryAuto:sm.text,aiChatId:c.idR139||'',status:'waiting',at:now(),msgs:hist,agent:'',agentName:''};
    c.csIdR1006A=id;c.csSeenR1006A={};
    c.messages.push({role:'assistant',html:true,at:now(),csSys:true,text:'<div class="k6cs-sys"><b>'+(z()?'已為您轉接真人客服':'Connecting you to an agent')+'</b>'
      +'<span>'+(z()?('對話編號 '+id+' · 前面還有 '+ahead+' 位等候'):('Ref '+id+' · '+ahead+' ahead of you'))+'</span>'
      +'<small>'+(z()?'轉接前系統已整理摘要給客服：':'Summary passed to the agent: ')+E(sm.text)+'</small>'
      +'<small>'+(z()?'客服接手前，您可以繼續輸入補充說明，客服會一併看到。':'You can keep typing; the agent will see it.')+'</small></div>'});
    persist();try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}
  };
  window.kgmCsLeaveR1006A=function(){
    var c=conv();if(!c||!c.csIdR1006A)return;var it=Q()[c.csIdR1006A];
    if(it&&it.status!=='closed'){it.status='closed';it.closedAt=now();it.closedBy='customer';it.msgs.push({id:nid('M'),role:'sys',text:z()?'旅客結束了真人客服':'Customer left',at:now()})}
    c.csIdR1006A='';c.messages.push({role:'assistant',text:z()?'已結束真人客服，接下來由 AI 繼續為您服務。':'Back to the AI assistant.',at:now()});
    persist();try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}
  };
  /* 真人客服進行中：旅客打的字送給客服，不給 AI */
  if(typeof window.kgmSendAi0819I==='function'){
    var send6=window.kgmSendAi0819I;
    window.kgmSendAi0819I=function(){
      try{var c=conv(),it=c&&c.csIdR1006A&&Q()[c.csIdR1006A];
        if(it&&/waiting|active/.test(it.status)){var inp=document.getElementById('aiInput'),t=String(inp&&inp.value||'').trim();if(!t)return;inp.value='';
          c.messages.push({role:'user',text:t,at:now()});it.msgs.push({id:nid('M'),role:'user',text:t,at:now()});it.lastUserAt=now();
          persist();try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}return}}catch(_){}
      return send6.apply(this,arguments);
    };
    try{window.sendAI=sendAI=window.kgmSendAi0819I}catch(_){}
  }
  /* 客服的回覆、客服更正的 AI 內容、客服結束 → 同步到旅客的視窗 */
  function pullAgent(){
    var c=conv();if(!c||!c.csIdR1006A)return false;var it=Q()[c.csIdR1006A];if(!it)return false;var ch=false,seen=c.csSeenR1006A=c.csSeenR1006A||{};
    if((it.status==='active'||it.status==='closed')&&it.agentName&&!seen.__joined){seen.__joined=1;c.messages.push({role:'assistant',at:now(),text:(z()?'客服 ':'Agent ')+(it.agentName||'')+(z()?' 已加入對話。':' has joined.')});ch=true}
    (it.msgs||[]).forEach(function(m){
      if(m.role==='agent'&&!seen[m.id]){seen[m.id]=m.editedAt||1;c.messages.push({role:'assistant',html:true,at:m.at,csAgent:m.id,text:'<div class="k6cs-ag"><i>'+E(z()?'客服 ':'Agent ')+E(m.by||'')+'</i>'+E(m.text).replace(/\n/g,'<br>')+'</div>'});ch=true}
      else if(m.role==='agent'&&m.editedAt&&seen[m.id]!==m.editedAt){seen[m.id]=m.editedAt;(c.messages||[]).forEach(function(x){if(x.csAgent===m.id){x.text='<div class="k6cs-ag"><i>'+E(z()?'客服 ':'Agent ')+E(m.by||'')+'</i>'+E(m.text).replace(/\n/g,'<br>')+'<small>'+(z()?'（客服已修改）':'(edited)')+'</small></div>'}});ch=true}
      else if(m.role==='ai'&&m.editedAt&&m.convAt&&seen[m.id]!==m.editedAt){seen[m.id]=m.editedAt;(c.messages||[]).forEach(function(x){if(x.at===m.convAt&&x.role==='assistant'){x.html=true;x.text='<div>'+E(m.text).replace(/\n/g,'<br>')+'<small class="k6cs-fix">'+(z()?'（已由客服 '+E(m.editedBy||'')+' 更正）':'(corrected by agent)')+'</small></div>'}});ch=true}
    });
    if(it.status==='closed'&&!seen.__closed){seen.__closed=1;c.csIdR1006A='';c.messages.push({role:'assistant',at:now(),text:z()?'客服已結束這次對話，接下來由 AI 繼續為您服務。':'The agent closed this chat. The AI assistant is back.'});ch=true}
    return ch;
  }
  function bar(){
    var w=document.getElementById('aiWindow'),inp=document.getElementById('aiInput');if(!w||!inp)return;
    var c=conv(),it=c&&c.csIdR1006A&&Q()[c.csIdR1006A],row=inp.parentElement;if(!row)return;
    var html;
    if(it&&/waiting|active/.test(it.status)){
      var ahead=list(['waiting']).filter(function(x){return x.at<it.at}).length;
      html='<span class="k6cs-st '+it.status+'"><i></i>'+(it.status==='active'?((z()?'真人客服 ':'Agent ')+E(it.agentName||'')+(z()?' 服務中':' is here')):((z()?'等候真人客服 · 前面 ':'Waiting · ')+ahead+(z()?' 位':' ahead')))+'</span><button onclick="kgmCsLeaveR1006A()">'+(z()?'結束真人客服':'End')+'</button>';
    }else html='<button class="go" onclick="kgmCsHandoffR1006A()">'+(z()?'👤 轉真人客服':'👤 Talk to an agent')+'</button><small>'+(z()?'系統會先把對話整理成摘要交給客服':'We will brief the agent first')+'</small>';
    var b=w.querySelector('.k6cs-bar');if(!b){b=document.createElement('div');b.className='k6cs-bar';row.parentElement.insertBefore(b,row)}
    if(b.getAttribute('data-h')!==html){b.innerHTML=html;b.setAttribute('data-h',html)}
    if(it&&/waiting|active/.test(it.status))inp.placeholder=z()?'輸入訊息給客服…':'Message the agent…';
  }
  if(typeof window.drawAi0819I==='function'){
    var draw6=window.drawAi0819I;
    window.drawAi0819I=function(){if(window.KGM_SIDE!=='admin'){try{pullAgent()}catch(_){}}var r=draw6.apply(this,arguments);try{bar()}catch(_){}return r};
  }
  /* 另一邊（後台）寫進來時，同步引擎會重畫；AI 視窗開著就順便把客服訊息拉進來 */
  setInterval(function(){try{if(window.KGM_SIDE==='admin')return;var c=conv();try{bar()}catch(_){}if(c&&c.csIdR1006A&&pullAgent()){try{save()}catch(_){}try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}}}catch(_){}},2000);

  /* ── 後台：AI 對話查詢 → 真人客服 ── */
  function me(){var u=S.adminUser||{};return {id:u.empId||'',name:u.name||u.empId||'客服'}}
  function tm(s){try{var d=new Date(s);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}catch(_){return ''}}
  function ago(s){var m=Math.max(0,Math.round((Date.now()-Date.parse(s))/60000));return m<1?(z()?'剛剛':'now'):m<60?(m+(z()?' 分鐘':'m')):(Math.floor(m/60)+(z()?' 小時':'h'))}
  window.kgmCsPickR1006A=function(id){S.csSelR1006A=id;S.csEditR1006A=null;mount(true)};
  window.kgmCsTakeR1006A=function(id){var it=Q()[id];if(!it)return;var m=me();it.status='active';it.agent=m.id;it.agentName=m.name;it.takenAt=now();it.msgs.push({id:nid('M'),role:'sys',text:(z()?'客服 ':'Agent ')+m.name+(z()?' 接手':' joined'),at:now()});S.csSelR1006A=id;persist();mount(true)};
  window.kgmCsReplyR1006A=function(id){var ta=document.getElementById('k6csReply');var t=String(ta&&ta.value||'').trim();if(!t)return;var it=Q()[id];if(!it)return;var m=me();
    if(it.status==='waiting'){it.status='active';it.agent=m.id;it.agentName=m.name;it.takenAt=now()}
    it.msgs.push({id:nid('M'),role:'agent',text:t,by:m.name,byId:m.id,at:now()});ta.value='';persist();mount(true)};
  window.kgmCsCloseR1006A=function(id){var it=Q()[id];if(!it)return;it.status='closed';it.closedAt=now();it.closedBy=me().id;it.msgs.push({id:nid('M'),role:'sys',text:z()?'客服結束對話':'Closed by agent',at:now()});persist();mount(true)};
  window.kgmCsSaveSumR1006A=function(id){var ta=document.getElementById('k6csSum');var it=Q()[id];if(!it||!ta)return;it.summary=String(ta.value||'').trim()||it.summaryAuto;it.summaryBy=me().name;it.summaryAt=now();persist();mount(true)};
  window.kgmCsEditR1006A=function(id,mid){S.csEditR1006A={id:id,mid:mid};mount(true);setTimeout(function(){var t=document.getElementById('k6csEdit');if(t)t.focus()},30)};
  window.kgmCsEditSaveR1006A=function(){var e=S.csEditR1006A;if(!e)return;var it=Q()[e.id];var ta=document.getElementById('k6csEdit');if(!it||!ta)return;
    (it.msgs||[]).forEach(function(m){if(m.id===e.mid){var t=String(ta.value||'').trim();if(t&&t!==m.text){m.orig=m.orig||m.text;m.text=t;m.editedAt=now();m.editedBy=me().name}}});S.csEditR1006A=null;persist();mount(true)};
  window.kgmCsEditCancelR1006A=function(){S.csEditR1006A=null;mount(true)};
  /* 模擬資料：沒有任何對話時放三筆（標示「模擬」），讓佇列與流程看得到樣子 */
  function seed(){var q=Q();if(Object.keys(q).length||S.csSeededR1006A)return;S.csSeededR1006A=1;
    var t=Date.now(),mk=function(min,name,uid,pnr,need,last,st){var id='CS'+(t-min*60000).toString(36).toUpperCase();q[id]={id:id,sim:true,userId:uid,name:name,email:'',pnr:pnr,need:need,status:st,at:new Date(t-min*60000).toISOString(),
      summary:'會員 '+name+'（'+uid+'）｜訂位代號 '+pnr+'｜需求 '+need+'｜旅客最後說：「'+last+'」',summaryAuto:'',agent:'',agentName:'',
      msgs:[{id:id+'a',role:'user',text:last,at:new Date(t-(min+2)*60000).toISOString()},{id:id+'b',role:'ai',text:'我可以協助查詢航班、酬賓機票與里程升等；這個需求需要真人客服處理，我幫您轉接。',at:new Date(t-(min+1)*60000).toISOString()}]};q[id].summaryAuto=q[id].summary};
    mk(3,'陳怡君','KGM20418831','K7Q2MD','改票','想把 11/14 的 KX12 改到 11/16，同一個艙等','waiting');
    mk(9,'Daniel Wu','KGM31805522','R4XT8P','退票／取消','家裡有急事，KX52 回程不能飛了，可以退嗎','waiting');
    mk(26,'林志明','KGM10992741','B8LNQ2','特殊服務','父親需要輪椅，KX185 要怎麼申請','waiting');
    try{LS.set("kgm_csq6",S.csQueueR1006A)}catch(_){}}
  function html(){
    var all=list(),wait=all.filter(function(x){return x.status==='waiting'}).sort(function(a,b){return a.at.localeCompare(b.at)}),act=all.filter(function(x){return x.status==='active'}).sort(function(a,b){return a.at.localeCompare(b.at)});
    var today=new Date().toISOString().slice(0,10),done=all.filter(function(x){return x.status==='closed'&&String(x.closedAt||'').slice(0,10)===today}).sort(function(a,b){return String(b.closedAt).localeCompare(String(a.closedAt))});
    var sel=Q()[S.csSelR1006A]||wait[0]||act[0]||null;if(sel)S.csSelR1006A=sel.id;
    function item(x){var on=sel&&sel.id===x.id;var lu=(x.msgs||[]).filter(function(m){return m.role==='user'}).slice(-1)[0];
      return '<button class="k6cs-it'+(on?' on':'')+'" onclick="kgmCsPickR1006A(\''+A(x.id)+'\')"><span class="k6cs-dot '+x.status+'"></span><b>'+E(x.name)+(x.sim?'<em>'+(z()?'模擬':'SIM')+'</em>':'')+'</b><small>'+E(x.pnr||'—')+' · '+E(x.need||'')+'</small><i>'+E(lu?String(lu.text).slice(0,40):'')+'</i><u>'+ago(x.status==='closed'?x.closedAt:x.at)+'</u></button>'}
    var left='<div class="k6cs-l">'
      +'<h4>'+(z()?'等待中':'Waiting')+' <b>'+wait.length+'</b></h4>'+(wait.length?wait.map(item).join(''):'<p class="k6cs-none">'+(z()?'沒有人在等待':'Nobody waiting')+'</p>')
      +'<h4>'+(z()?'處理中':'In progress')+' <b>'+act.length+'</b></h4>'+(act.length?act.map(item).join(''):'<p class="k6cs-none">—</p>')
      +'<h4>'+(z()?'今天已結束':'Closed today')+' <b>'+done.length+'</b></h4>'+done.slice(0,6).map(item).join('')+'</div>';
    var right='<div class="k6cs-r"><div class="k6cs-empty">'+(z()?'左邊選一個對話。':'Pick a conversation.')+'</div></div>';
    if(sel){
      var ed=S.csEditR1006A&&S.csEditR1006A.id===sel.id?S.csEditR1006A.mid:'';
      var msgs=(sel.msgs||[]).map(function(m){
        if(m.role==='sys')return '<div class="k6cs-m sys"><span>'+E(m.text)+' · '+tm(m.at)+'</span></div>';
        var who=m.role==='user'?E(sel.name):m.role==='ai'?'AI':((z()?'客服 ':'Agent ')+E(m.by||''));
        var body=ed===m.id?('<textarea id="k6csEdit" class="inp">'+E(m.text)+'</textarea><div class="k6cs-eb"><button class="p" onclick="kgmCsEditSaveR1006A()">'+(z()?'儲存更正':'Save')+'</button><button onclick="kgmCsEditCancelR1006A()">'+(z()?'取消':'Cancel')+'</button></div>')
          :('<p>'+E(m.text).replace(/\n/g,'<br>')+'</p>'+(m.editedAt?'<small class="k6cs-edn">'+(z()?'已由 '+E(m.editedBy||'')+' 更正 · 原文：':'Edited · was: ')+E(String(m.orig||'').slice(0,80))+'</small>':''));
        var tool=(m.role==='ai'||m.role==='agent')&&sel.status!=='closed'&&ed!==m.id?'<button class="k6cs-ed" onclick="kgmCsEditR1006A(\''+A(sel.id)+'\',\''+A(m.id)+'\')">'+(z()?'編輯':'Edit')+'</button>':'';
        return '<div class="k6cs-m '+m.role+'"><div class="k6cs-mh"><b>'+who+'</b><time>'+tm(m.at)+'</time>'+tool+'</div>'+body+'</div>';
      }).join('');
      var st={waiting:z()?'等待中':'Waiting',active:z()?'處理中':'In progress',closed:z()?'已結束':'Closed'}[sel.status];
      right='<div class="k6cs-r"><div class="k6cs-hd"><div><small>'+E(sel.id)+(sel.aiChatId?' · '+E(sel.aiChatId):'')+'</small><h3>'+E(sel.name)+(sel.sim?' <em>'+(z()?'模擬':'SIM')+'</em>':'')+'</h3>'
        +'<span>'+E(sel.userId||'')+(sel.pnr?' · '+(z()?'訂位代號 ':'PNR ')+'<b>'+E(sel.pnr)+'</b>':'')+' · '+st+(sel.agentName?' · '+E(sel.agentName):'')+'</span></div>'
        +'<div class="k6cs-act">'+(sel.status==='waiting'?'<button class="p" onclick="kgmCsTakeR1006A(\''+A(sel.id)+'\')">'+(z()?'接手':'Take')+'</button>':'')+(sel.status!=='closed'?'<button onclick="kgmCsCloseR1006A(\''+A(sel.id)+'\')">'+(z()?'結束對話':'Close')+'</button>':'')+'</div></div>'
        +'<div class="k6cs-sum"><label>'+(z()?'轉接摘要（系統自動整理，可以修改）':'Handoff summary (editable)')+'</label><textarea id="k6csSum" class="inp" rows="2">'+E(sel.summary||'')+'</textarea>'
        +'<div><button onclick="kgmCsSaveSumR1006A(\''+A(sel.id)+'\')">'+(z()?'儲存摘要':'Save')+'</button>'+(sel.summaryBy?'<small>'+(z()?'最後由 ':'by ')+E(sel.summaryBy)+(z()?' 修改':'')+'</small>':'')+'</div></div>'
        +'<div class="k6cs-msgs" id="k6csMsgs">'+msgs+'</div>'
        +(sel.status!=='closed'?'<div class="k6cs-rep"><textarea id="k6csReply" class="inp" rows="2" placeholder="'+(z()?'輸入回覆，Enter 送出（Shift+Enter 換行）':'Type a reply')+'" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();kgmCsReplyR1006A(\''+A(sel.id)+'\')}"></textarea><button class="p" onclick="kgmCsReplyR1006A(\''+A(sel.id)+'\')">'+(z()?'送出':'Send')+'</button></div>':'<div class="k6cs-closed">'+(z()?'這個對話已結束。':'This chat is closed.')+'</div>')
        +'</div>';
    }
    return '<section class="k6cs" data-k6cs="1"><div class="k6cs-top"><div><small>LIVE AGENT · 真人客服</small><h2>'+(z()?'轉真人客服的對話':'Chats handed to an agent')+'</h2><p>'+(z()?'旅客在 AI 視窗按下「轉真人客服」後排進這裡；系統先整理摘要（訂位代號、要辦什麼）。AI 先前的回覆可以直接更正，旅客那邊同步顯示更正後的內容。':'Customers who tap “Talk to an agent” queue here with an auto summary. You can correct earlier AI replies; the customer sees the correction.')+'</p></div>'
      +'<div class="k6cs-kpi"><span class="w"><b>'+wait.length+'</b>'+(z()?'等待中':'waiting')+'</span><span class="a"><b>'+act.length+'</b>'+(z()?'處理中':'in progress')+'</span><span><b>'+done.length+'</b>'+(z()?'今天結束':'closed today')+'</span></div></div>'
      +'<div class="k6cs-g">'+left+right+'</div></section>';
  }
  function css(){if(document.getElementById('k6csCss'))return;var s=document.createElement('style');s.id='k6csCss';s.textContent=
    '.k6cs{background:#fff;border:1px solid #e9e4d8;border-radius:16px;margin:0 0 18px;overflow:hidden}'
    +'.k6cs-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;padding:18px 22px;border-bottom:1px solid #f0ebe0}.k6cs-top small{font-size:10.5px;letter-spacing:.14em;color:#a08a5c;font-weight:800}.k6cs-top h2{margin:4px 0;font-size:20px;color:#0b3b30}.k6cs-top p{margin:0;font-size:12.5px;color:#7a7266;max-width:640px;line-height:1.6}'
    +'.k6cs-kpi{display:flex;gap:8px}.k6cs-kpi span{background:#f3f0e8;border-radius:12px;padding:8px 14px;text-align:center;font-size:11px;color:#6f675c;font-weight:700;min-width:72px}.k6cs-kpi b{display:block;font-size:22px;color:#2c2a26}.k6cs-kpi .w{background:#fdf0e6;color:#9a4d1c}.k6cs-kpi .w b{color:#c2541d}.k6cs-kpi .a{background:#e8f4ef;color:#1f6f4a}.k6cs-kpi .a b{color:#0b6b52}'
    +'.k6cs-g{display:grid;grid-template-columns:300px 1fr;min-height:430px}.k6cs-l{border-right:1px solid #f0ebe0;padding:12px;background:#fcfbf7;max-height:640px;overflow:auto}'
    +'.k6cs-l h4{margin:10px 6px 6px;font-size:11px;color:#8a8175;letter-spacing:.08em}.k6cs-l h4 b{color:#2c2a26}.k6cs-none{font-size:12px;color:#b2aa9c;margin:4px 8px 10px}'
    +'.k6cs-it{display:grid;grid-template-columns:12px 1fr auto;gap:2px 8px;width:100%;text-align:left;background:#fff;border:1px solid #eee7da;border-radius:11px;padding:9px 10px;margin-bottom:6px;cursor:pointer}.k6cs-it.on{border-color:#0b6b52;box-shadow:0 0 0 2px rgba(11,107,82,.12)}'
    +'.k6cs-it b{font-size:13px;color:#2c2a26}.k6cs-it b em,.k6cs-hd h3 em{font-style:normal;font-size:10px;background:#efeae0;color:#8a8175;border-radius:6px;padding:1px 6px;margin-left:6px;font-weight:700}.k6cs-it small{grid-column:2;font-size:11px;color:#8a8175}.k6cs-it i{grid-column:2;font-size:11px;color:#a59d90;font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.k6cs-it u{grid-row:1;grid-column:3;text-decoration:none;font-size:10.5px;color:#a59d90}'
    +'.k6cs-dot{grid-row:1/4;width:9px;height:9px;border-radius:50%;margin-top:5px}.k6cs-dot.waiting{background:#e2742c;box-shadow:0 0 0 3px rgba(226,116,44,.18)}.k6cs-dot.active{background:#22a565}.k6cs-dot.closed{background:#c9c2b5}'
    +'.k6cs-r{display:flex;flex-direction:column;min-width:0}.k6cs-empty{margin:auto;color:#a59d90}.k6cs-hd{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:14px 18px;border-bottom:1px solid #f0ebe0}'
    +'.k6cs-hd small{font-size:10.5px;color:#a59d90;font-family:ui-monospace,Menlo,monospace}.k6cs-hd h3{margin:2px 0;font-size:17px;color:#0b3b30}.k6cs-hd span{font-size:12px;color:#6f675c}.k6cs-hd span b{font-family:ui-monospace,Menlo,monospace;color:#0b3b30}'
    +'.k6cs-act{display:flex;gap:6px}.k6cs button{border:1px solid #ddd5c4;background:#fff;border-radius:9px;padding:7px 13px;font-weight:800;color:#2c2a26;cursor:pointer;font-size:12px}.k6cs button.p{background:#0b6b52;border-color:#0b6b52;color:#fff}'
    +'.k6cs-sum{padding:10px 18px;background:#fbf7ec;border-bottom:1px solid #f0ebe0}.k6cs-sum label{font-size:11px;font-weight:800;color:#8a6b1f}.k6cs-sum textarea{width:100%;margin:5px 0;font-size:12.5px;line-height:1.55;resize:vertical}.k6cs-sum div{display:flex;gap:10px;align-items:center}.k6cs-sum small{font-size:11px;color:#a59d90}'
    +'.k6cs-msgs{flex:1;overflow:auto;padding:14px 18px;max-height:380px;display:flex;flex-direction:column;gap:9px}'
    +'.k6cs-m{max-width:78%;border-radius:12px;padding:8px 11px;font-size:13px;line-height:1.55}.k6cs-m p{margin:0}.k6cs-mh{display:flex;gap:8px;align-items:center;margin-bottom:2px}.k6cs-mh b{font-size:11px}.k6cs-mh time{font-size:10.5px;color:#a59d90}'
    +'.k6cs-m.user{background:#f3f0e8;align-self:flex-start}.k6cs-m.ai{background:#fff;border:1px dashed #d9d1c0;align-self:flex-start;color:#4a443b}.k6cs-m.ai b{color:#8a8175}.k6cs-m.agent{background:#e6f3ee;align-self:flex-end}.k6cs-m.agent b{color:#0b6b52}'
    +'.k6cs-m.sys{align-self:center;background:none;padding:0;font-size:11px;color:#a59d90}.k6cs-ed{border:0!important;background:none!important;color:#0b6b52!important;padding:0 4px!important;font-size:11px!important}'
    +'.k6cs-m textarea{width:100%;min-height:64px;font-size:12.5px}.k6cs-eb{display:flex;gap:6px;margin-top:5px}.k6cs-edn{display:block;font-size:10.5px;color:#a08a5c;margin-top:3px}'
    +'.k6cs-rep{display:flex;gap:8px;padding:12px 18px;border-top:1px solid #f0ebe0}.k6cs-rep textarea{flex:1;resize:none;font-size:13px}.k6cs-closed{padding:12px 18px;color:#a59d90;font-size:12px;border-top:1px solid #f0ebe0}'
    +'.k6cs-sb{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;border-radius:9px;background:#e2742c;color:#fff;font-size:10.5px;font-weight:800;margin-left:6px;padding:0 5px;font-style:normal}'
    +'.k6cs-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;border-top:1px solid #efeae0;background:#fcfbf7;font-size:12px}.k6cs-bar button{border:1px solid #ddd5c4;background:#fff;border-radius:999px;padding:5px 12px;font-weight:800;font-size:12px;cursor:pointer;color:#2c2a26}.k6cs-bar button.go{border-color:#0b6b52;color:#0b6b52}.k6cs-bar small{color:#a59d90;font-size:11px}'
    +'.k6cs-st{display:inline-flex;align-items:center;gap:6px;font-weight:800;color:#9a4d1c;flex:1}.k6cs-st i{width:8px;height:8px;border-radius:50%;background:#e2742c}.k6cs-st.active{color:#0b6b52}.k6cs-st.active i{background:#22a565}'
    +'.k6cs-sys{display:flex;flex-direction:column;gap:3px}.k6cs-sys b{color:#0b6b52}.k6cs-sys span{font-size:12px}.k6cs-sys small{font-size:11.5px;color:#7a7266;line-height:1.5}.k6cs-ag i{display:block;font-style:normal;font-size:11px;font-weight:800;color:#0b6b52;margin-bottom:2px}.k6cs-ag small,.k6cs-fix{display:block;font-size:10.5px;color:#a08a5c}'
    +'@media(max-width:900px){.k6cs-g{grid-template-columns:1fr}.k6cs-l{border-right:0;border-bottom:1px solid #f0ebe0;max-height:260px}.k6cs-top{flex-direction:column;align-items:flex-start}}';
    (document.head||document.documentElement).appendChild(s)}
  function typingIn(){var a=document.activeElement;return !!(a&&a.closest&&a.closest('.k6cs')&&/^(TEXTAREA|INPUT)$/.test(a.tagName))}
  function mount(force){
    try{css();
      if(!S.adminAuthed||S.view!=='admin'){return}
      badge();
      var main=document.querySelector('#app .p-admin-main'),have=main&&main.querySelector('[data-k6cs]');
      if(S.adminTab!=='cases0831C'){if(have)have.remove();return}
      if(!main)return;seed();
      var h=html(),sig=h.length+'|'+JSON.stringify(Q()).length+'|'+(S.csSelR1006A||'')+'|'+JSON.stringify(S.csEditR1006A||null);
      if(have&&!force&&have.getAttribute('data-sig')===sig)return;
      if(have&&typingIn()&&!force)return;   /* 正在打字不重畫 */
      var keep=document.getElementById('k6csReply'),kv=keep?keep.value:'';
      var d=document.createElement('div');d.innerHTML=h;var el=d.firstElementChild;el.setAttribute('data-sig',sig);
      if(have)have.replaceWith(el);else main.insertBefore(el,main.firstChild);
      var r2=document.getElementById('k6csReply');if(r2&&kv)r2.value=kv;
      var box=document.getElementById('k6csMsgs');if(box)box.scrollTop=box.scrollHeight;
    }catch(e){try{console.warn('k6cs',e)}catch(_){}}
  }
  function badge(){try{var n=list(['waiting']).length;document.querySelectorAll('#app .p-admin-side button').forEach(function(b){if(String(b.getAttribute('onclick')||'').indexOf("'cases0831C'")<0)return;var s=b.querySelector('.k6cs-sb');if(!n){if(s)s.remove();return}if(!s){s=document.createElement('i');s.className='k6cs-sb';b.appendChild(s)}if(s.textContent!==String(n))s.textContent=String(n)})}catch(_){}}
  window.kgmCsMountR1006A=mount;
  if(typeof render==='function'){var rd6c=render;render=window.render=function(){var r=rd6c.apply(this,arguments);setTimeout(function(){mount(false)},0);setTimeout(function(){mount(false)},300);return r}}
  setInterval(function(){try{if(S.view==='admin'&&S.adminAuthed){badge();if(S.adminTab==='cases0831C')mount(false)}}catch(_){}},2000);
})();
"""
RL('cs handoff + console',L,
 "/* 把暫扣的里程改掛到改票後的新日期 */\nwindow.kgmMileMoveR923=function(id,newDate,newCode){",
 JS+"/* 把暫扣的里程改掛到改票後的新日期 */\nwindow.kgmMileMoveR923=function(id,newDate,newCode){")
# 客服人員要看得到「AI 對話查詢」（原本預設權限沒有這個分頁，客服登入只會出現在「未解鎖權限」）
RL('perm service cases0831C','kgm-0903b-r123',
 "  service:{stxstatus:'use',bookings:'use',cases0831B:'use',",
 "  service:{cases0831C:'use',stxstatus:'use',bookings:'use',cases0831B:'use',   /* 1006A #20：真人客服在 AI 對話查詢 */")
RL('perm backend cases0831C','kgm-0903b-r123',
 "  backend:{stxstatus:'use',status:'use',",
 "  backend:{cases0831C:'use',stxstatus:'use',status:'use',")
save('p_h_cs20.js','/* 1006A · AI 對話轉真人客服：前台轉接＋自動摘要，後台佇列／對話／可編輯 */\n')
