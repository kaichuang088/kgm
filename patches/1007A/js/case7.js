/* ══ 1007A：服務案件 ════════════════════════════════════════════════════════
   使用者：「地勤和客服要可以針對一個PNR創立案件編號 可能是行李遺失等等 然後後台和前台案件都好醜 要improve not organized」
   · 地勤、客服（以及 CEO／系統人員）可以在案件處理中心「＋ 建立案件」：輸入 PNR → 選旅客、航段、案件類型
     （行李遺失／延誤／損壞、遺失物品、服務客訴、特殊協助、退款申請、航班異動協助、其他），行李類另填行李條號碼與外觀。
     案件編號跟其他案件同一種格式（KG＋4 碼＋月日年＋M），存在 S.staffCasesR1007A（前後台同步），
     旅客收到站內通知＋Email，行程管理、我的案件、案件查詢都看得到。
   · 後台案件處理中心改成「清單＋明細」：上方統計、分頁（進行中／已完成）、搜尋與類型／來源篩選，
     左邊一行一件，右邊是選中案件的完整資料、處理進度與可以做的動作；所有案件類型名稱都是中文（原本直接印 ground_reissue）。
   · 前台案件查詢結果頁重做：案件編號與狀態在最上面，「目前進度／下一步」一眼看到，處理紀錄由新到舊。 */
var CT7={
  ground_reissue:['現場改票','Counter reissue'],mileage_diff:['哩程差額補收','Mileage difference'],
  customer_refund:['退票退款','Refund'],internal_refund:['內部退款','Internal refund'],
  bag_lost:['行李遺失','Lost baggage'],bag_delayed:['行李延誤','Delayed baggage'],bag_damaged:['行李損壞','Damaged baggage'],
  item_lost:['遺失物品','Lost property'],complaint:['服務客訴','Service complaint'],assistance:['特殊協助','Special assistance'],
  refund_req:['退款申請','Refund request'],disruption:['航班異動協助','Disruption assistance'],other:['其他','Other']};
var CS7={counter:['機場櫃檯','Airport counter'],money:['財務','Finance'],irrops:['航班異常','Irregular operations'],
  profile:['會員服務','Membership'],miles:['里程服務','Miles'],staff:['地勤／客服','Ground / Customer service'],upgrade:['里程升等','Upgrade']};
var NEW7=['bag_lost','bag_delayed','bag_damaged','item_lost','complaint','assistance','refund_req','disruption','other'];
function L7(pair,fb){return pair?(ZJ()?pair[0]:pair[1]):(fb||'')}
function case7Label(r){
  var raw=r.raw||{},k=String(raw.type||raw.action||'');
  r.typeKey=k||r.source;
  if(CT7[k])r.type=L7(CT7[k]);
  else if(!r.type||/^[a-z_]+$/.test(String(r.type)))r.type=L7(CS7[r.source],r.type);
  r.sourceLabel=L7(CS7[r.source],r.source);
  if(r.detail&&/^[a-z_]+$/.test(String(r.detail))&&CT7[r.detail])r.detail=L7(CT7[r.detail]);
  return r;
}
function staffRole7(){var u=S.adminUser||{},r=String(u.role||'');if(u.empId==='MASTER')return 'ceo';return r==='admin'?'ceo':r}
function canOpen7(){return /^(ceo|ground|service|backend)$/.test(staffRole7())}
function isCeo7(){return staffRole7()==='ceo'}
function hm7(t){t=String(t||'');if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t))return t.slice(0,10)+' '+t.slice(11,16);return t}
function bk7(pnr){return (S.bookings||[]).filter(function(b){return b&&String(b.pnr||'').toUpperCase()===String(pnr||'').toUpperCase()})[0]||null}
function paxName7(b,i){var p=((b&&b.paxList)||[])[i||0]||{};return ((p.lastName||'')+' / '+(p.firstName||'')).replace(/^ \/ | \/ $/g,'').trim()}
function segList7(b){var out=[];try{(typeof window.segs7==='function'?window.segs7(b,true):[]).forEach(function(s){var f=s.f||{};if(f.code)out.push({key:s.key,code:f.code,fr:f.fr,to:f.to,date:s.date||f.date||''})})}catch(_){}
  if(!out.length&&b&&b.outF)out.push({key:'out',code:b.outF.code,fr:b.outF.fr,to:b.outF.to,date:b.outF.date||(b.search||{}).dep||''});return out}
function closed7(r){return caseClosedJ(r)||/^(closed|resolved)$/.test(String(r&&r.status||''))}
function rowExtra7(r){
  var raw=r.raw||{},b=caseBookingJ(r),x={pax:'',flight:''};
  if(raw.paxName)x.pax=raw.paxName;else if(b)x.pax=paxName7(b,0);else if(typeof raw.name==='string')x.pax=raw.name;
  if(!x.pax&&raw.userId){try{var m7=(S.users||[]).filter(function(u){return u&&u.id===raw.userId})[0];if(m7)x.pax=[m7.lastName,m7.firstName].filter(Boolean).join(' ')+' · '+m7.id}catch(_){}}   /* 會員案件：顯示會員姓名與卡號 */
  if(raw.segment&&raw.segment.code)x.flight=raw.segment.code+' '+(raw.segment.fr||'')+'→'+(raw.segment.to||'')+' '+String(raw.segment.date||'').slice(5);
  else if(b&&b.outF)x.flight=(b.outF.code||'')+' '+(b.outF.fr||'')+'→'+(b.outF.to||'')+' '+String(b.outF.date||(b.search||{}).dep||'').slice(5);
  return x;
}
/* 案件編號：跟 caseNoJ 同一種格式，避開已用過的號碼 */
function newNo7(){
  var d=new Date().toISOString().slice(0,10).replace(/-/g,''),md=d.slice(4)+d.slice(2,4),used={};
  try{caseRowsJ().forEach(function(r){used[r.no]=1})}catch(_){}
  var n='';do{n='KG'+String(1000+Math.floor(Math.random()*9000))+md+'M'}while(used[n]);return n;
}
/* ── 建立案件（地勤／客服） ─────────────────────────────────────────── */
window.kgmCase7Open=function(pnr){S.case7New={pnr:String(pnr||'').toUpperCase(),type:'bag_delayed',pax:0,seg:0,prio:'normal',notify:true,err:''};render()};
window.kgmCase7Close=function(){S.case7New=null;render()};
window.kgmCase7Field=function(k,v){if(!S.case7New)return;S.case7New[k]=v;if(k==='pnr'||k==='type'||k==='pax'||k==='seg')render()};
function newForm7(){
  var f=S.case7New;if(!f)return '';
  var b=f.pnr?bk7(f.pnr):null,segs=b?segList7(b):[],bag=/^bag_/.test(f.type),zh=ZJ();
  var pax=b?(b.paxList||[]).map(function(p,i){return '<option value="'+i+'"'+(+f.pax===i?' selected':'')+'>'+EJ(paxName7(b,i))+'</option>'}).join(''):'';
  var segOpt=segs.map(function(s,i){return '<option value="'+i+'"'+(+f.seg===i?' selected':'')+'>'+EJ(s.code+'　'+s.fr+' → '+s.to+'　'+s.date)+'</option>'}).join('');
  return '<div class="k7c-modal" onclick="if(event.target===this)kgmCase7Close()"><div class="k7c-dlg" role="dialog" aria-modal="true">'
    +'<header><div><small>'+(zh?'NEW SERVICE CASE · 建立案件':'NEW SERVICE CASE')+'</small><h3>'+(zh?'為訂位建立案件':'Open a case for a booking')+'</h3></div>'
    +'<button class="k7c-x" onclick="kgmCase7Close()" aria-label="close">×</button></header>'
    +'<div class="k7c-dlg-body">'
    +'<div class="k7c-row"><label>'+(zh?'訂位代號 PNR':'Booking reference')+'<div class="k7c-pnr"><input class="inp" id="k7cPnr" value="'+EJ(f.pnr||'')+'" maxlength="8" placeholder="ABC123" style="text-transform:uppercase" onkeydown="if(event.key===\'Enter\')kgmCase7Field(\'pnr\',this.value.trim().toUpperCase())">'
      +'<button class="btn" onclick="kgmCase7Field(\'pnr\',document.getElementById(\'k7cPnr\').value.trim().toUpperCase())">'+(zh?'查詢':'Look up')+'</button></div></label></div>'
    +(f.pnr&&!b?'<div class="k7c-err">'+(zh?'查無此訂位代號。':'Booking not found.')+'</div>':'')
    +(b?('<div class="k7c-bk"><b>PNR '+EJ(b.pnr)+'</b><span>'+EJ((b.paxList||[]).length+(zh?' 位旅客':' pax'))+'</span>'
        +'<span>'+EJ(segs.map(function(s){return s.code+' '+s.fr+'→'+s.to}).join('　'))+'</span>'
        +'<span>'+EJ(b.contactEmail||((b.paxList||[])[0]||{}).email||'')+'</span></div>'
      +'<div class="k7c-grid2">'
        +'<label>'+(zh?'案件類型':'Case type')+'<select class="inp" onchange="kgmCase7Field(\'type\',this.value)">'
          +NEW7.map(function(k){return '<option value="'+k+'"'+(f.type===k?' selected':'')+'>'+EJ(L7(CT7[k]))+'</option>'}).join('')+'</select></label>'
        +'<label>'+(zh?'優先等級':'Priority')+'<select class="inp" onchange="kgmCase7Field(\'prio\',this.value)">'
          +'<option value="normal"'+(f.prio!=='urgent'?' selected':'')+'>'+(zh?'一般':'Normal')+'</option>'
          +'<option value="urgent"'+(f.prio==='urgent'?' selected':'')+'>'+(zh?'緊急（24 小時內回覆）':'Urgent (reply in 24h)')+'</option></select></label>'
        +'<label>'+(zh?'旅客':'Passenger')+'<select class="inp" onchange="kgmCase7Field(\'pax\',+this.value)">'+pax+'</select></label>'
        +'<label>'+(zh?'航段':'Segment')+'<select class="inp" onchange="kgmCase7Field(\'seg\',+this.value)">'+segOpt+'</select></label>'
      +'</div>'
      +(bag?('<div class="k7c-sub">'+(zh?'行李資料':'Baggage details')+'</div><div class="k7c-grid2">'
          +'<label>'+(zh?'行李條號碼':'Bag tag number')+'<input class="inp" value="'+EJ(f.tag||'')+'" placeholder="KX 123456" oninput="kgmCase7Field(\'tag\',this.value)"></label>'
          +'<label>'+(zh?'行李外觀（顏色、品牌、尺寸）':'Description (colour, brand, size)')+'<input class="inp" value="'+EJ(f.look||'')+'" placeholder="'+(zh?'黑色硬殼 28 吋 Samsonite':'Black hard-shell 28in')+'" oninput="kgmCase7Field(\'look\',this.value)"></label>'
          +'<label>'+(zh?'最後看到的地點':'Last seen')+'<input class="inp" value="'+EJ(f.seen||'')+'" placeholder="'+(zh?'TPE 第二航廈托運櫃檯':'TPE T2 check-in')+'" oninput="kgmCase7Field(\'seen\',this.value)"></label>'
          +'<label>'+(zh?'找到後送達地址／電話':'Delivery address / phone')+'<input class="inp" value="'+EJ(f.deliver||'')+'" oninput="kgmCase7Field(\'deliver\',this.value)"></label>'
        +'</div>'):'')
      +'<label class="k7c-full">'+(zh?'案件說明（旅客看得到）':'Description (visible to the passenger)')
        +'<textarea class="inp" rows="4" oninput="kgmCase7Field(\'detail\',this.value)" placeholder="'+(zh?'例：旅客抵達 NRT 後行李未出現在轉盤，已完成 PIR（行李異常報告）。':'e.g. Bag did not arrive at NRT; PIR completed.')+'">'+EJ(f.detail||'')+'</textarea></label>'
      +'<label class="k7c-full">'+(zh?'內部備註（只有員工看得到）':'Internal note (staff only)')
        +'<textarea class="inp" rows="2" oninput="kgmCase7Field(\'note\',this.value)">'+EJ(f.note||'')+'</textarea></label>'
      +'<label class="k7c-check"><input type="checkbox"'+(f.notify!==false?' checked':'')+' onchange="kgmCase7Field(\'notify\',this.checked)"> '+(zh?'以 Email 與站內通知告知旅客案件編號':'Email the case number to the passenger')+'</label>'):'')
    +(f.err?'<div class="k7c-err">'+EJ(f.err)+'</div>':'')
    +'</div><footer><button class="btn" onclick="kgmCase7Close()">'+(zh?'取消':'Cancel')+'</button>'
    +'<button class="btn btn-g"'+(b?'':' disabled')+' onclick="kgmCase7Create()">'+(zh?'建立案件':'Create case')+'</button></footer></div></div>';
}
window.kgmCase7Create=function(){
  var f=S.case7New;if(!f)return;var b=bk7(f.pnr),zh=ZJ();
  if(!b){f.err=zh?'請先輸入正確的訂位代號。':'Enter a valid booking reference.';render();return}
  if(!String(f.detail||'').trim()){f.err=zh?'請填寫案件說明。':'Please describe the case.';render();return}
  if(/^bag_/.test(f.type)&&!String(f.tag||'').trim()){f.err=zh?'行李案件請填行李條號碼。':'Bag tag number is required.';render();return}
  var u=S.adminUser||{},at=new Date().toISOString(),seg=segList7(b)[+f.seg||0]||{},no=newNo7(),role=staffRole7();
  var who=(u.name||u.empId||'')+(u.empId&&u.name?' ('+u.empId+')':'');
  var rec={caseNo:no,pnr:b.pnr,type:f.type,status:'received',priority:f.prio==='urgent'?'urgent':'normal',
    paxIndex:+f.pax||0,paxName:paxName7(b,+f.pax||0),segment:{code:seg.code||'',fr:seg.fr||'',to:seg.to||'',date:seg.date||''},
    detail:String(f.detail||'').trim(),bag:/^bag_/.test(f.type)?{tag:String(f.tag||'').trim(),look:String(f.look||'').trim(),seen:String(f.seen||'').trim(),deliver:String(f.deliver||'').trim()}:null,
    createdAt:at,updatedAt:at,by:{empId:u.empId||'',name:u.name||'',role:role},assignee:{empId:u.empId||'',name:u.name||''},
    userId:b.userId||null,email:b.contactEmail||((b.paxList||[])[+f.pax||0]||{}).email||((b.paxList||[])[0]||{}).email||'',
    progress:[{at:at,status:'received',label:(zh?'案件成立（':'Case opened (')+(zh?({ground:'機場地勤',service:'客服中心',ceo:'客服中心',backend:'客服中心'}[role]||'客服中心'):({ground:'Airport staff',service:'Customer service'}[role]||'Customer service'))+(zh?'）':')'),by:who}],   /* 旅客看到的是單位，不是員工姓名（姓名留在 by，後台看得到） */
    notes:String(f.note||'').trim()?[{at:at,by:who,text:String(f.note).trim()}]:[]};
  S.staffCasesR1007A=S.staffCasesR1007A||[];S.staffCasesR1007A.unshift(rec);
  if(f.notify!==false){
    var label=L7(CT7[f.type]);
    S.notifs=S.notifs||[];S.notifs.unshift({title:(zh?'服務案件成立 ':'Case opened ')+no,message:(zh?('我們已為您的訂位 '+b.pnr+' 建立「'+label+'」案件，案件編號 '+no+'。可在「案件查詢」以編號與姓名查詢進度。')
      :('Case '+no+' ('+label+') was opened for booking '+b.pnr+'.')),date:TJ(),read:false,userId:b.userId||null});
    try{if(window.kgmMailCaseOpenedR115)window.kgmMailCaseOpenedR115({id:no,pnr:b.pnr,type:label,email:rec.email})}catch(_){}
  }
  try{logAct(zh?'建立案件':'Open case',no+' · '+b.pnr+' · '+L7(CT7[f.type]))}catch(_){}
  S.case7New=null;S.case7Sel=no;S.caseTabR913='open';saveJ();render();
};
/* ── 地勤／客服案件的處理（更新狀態、通知旅客、內部備註、指派） ── */
var ST7=[['received',['已受理','Received']],['investigating',['調查處理中','Investigating']],['awaiting_customer',['等待旅客回覆','Waiting for passenger']],['closed',['結案','Closed']]];
function staffRec7(no){return (S.staffCasesR1007A||[]).filter(function(x){return x&&x.caseNo===no})[0]||null}
window.kgmCase7Update=function(no){
  var c=staffRec7(no);if(!c)return;var zh=ZJ();
  var st=(document.getElementById('k7cSt')||{}).value||c.status,msg=String((document.getElementById('k7cMsg')||{}).value||'').trim(),note=String((document.getElementById('k7cNote')||{}).value||'').trim();
  if(st===c.status&&!msg&&!note){alert(zh?'沒有任何變更。':'Nothing to update.');return}
  if(st==='closed'&&!msg){alert(zh?'結案請寫給旅客的處理結果。':'Write the resolution for the passenger before closing.');return}
  var u=S.adminUser||{},at=new Date().toISOString(),who=(u.name||u.empId||'')+(u.empId&&u.name?' ('+u.empId+')':''),lab=L7((ST7.filter(function(x){return x[0]===st})[0]||[])[1]);
  if(st!==c.status||msg){c.progress.push({at:at,status:st,label:(st!==c.status?lab:(zh?'處理說明':'Update')),note:msg,by:who});c.status=st}
  if(note){c.notes=c.notes||[];c.notes.unshift({at:at,by:who,text:note})}
  c.updatedAt=at;if(st==='closed')c.closedAt=at;
  if(msg){
    var b=bk7(c.pnr);S.notifs=S.notifs||[];
    S.notifs.unshift({title:(zh?'案件進度更新 ':'Case update ')+c.caseNo,message:msg,date:TJ(),read:false,userId:(b&&b.userId)||c.userId||null});
    try{if(typeof kgmNotify==='function'&&c.email)kgmNotify('case.updated',{email:c.email,caseNo:c.caseNo,pnr:c.pnr,status:st,
      subject:(zh?'案件進度更新 ':'Case update ')+c.caseNo,message:msg,eventId:'r1007a-case:'+c.caseNo+':'+at}).catch(function(){})}catch(_){}
  }
  try{logAct(zh?'更新案件':'Update case',c.caseNo+' → '+lab)}catch(_){}
  saveJ();render();
};
window.kgmCase7Assign=function(no){var c=staffRec7(no);if(!c)return;var u=S.adminUser||{};c.assignee={empId:u.empId||'',name:u.name||''};c.updatedAt=new Date().toISOString();saveJ();render()};
window.kgmCase7Sel=function(no){S.case7Sel=no;render()};
window.kgmCase7Filter=function(k,v){S.case7F=S.case7F||{};S.case7F[k]=v;S.case7Sel=null;render()};
/* ── 後台：案件處理中心 ── */
function chip7(r){var s=String(r.status||''),c=closed7(r)?'done':/ceo_review|needs_more_info/.test(s)?'ceo':/awaiting_customer|payment_pending/.test(s)?'wait':'open';
  return '<span class="k7c-st '+c+'">'+EJ(caseStatusJ(s))+'</span>'}
function timeline7(r,staff){
  var p=(r.progress&&r.progress.length?r.progress:[{at:r.created,status:r.status,label:caseStatusJ(r.status)}]).slice().reverse();
  return '<ol class="k7c-tl">'+p.map(function(x,i){return '<li class="'+(i===0?'now':'')+'"><i></i><div><b>'+EJ(x.label||caseStatusJ(x.status))+'</b>'
    +'<small>'+EJ(hm7(x.at))+(staff&&x.by?' · '+EJ(x.by):'')+'</small>'+(x.note?'<p>'+EJ(x.note)+'</p>':'')+'</div></li>'}).join('')+'</ol>';
}
function kv7(k,v){return v?'<div><small>'+EJ(k)+'</small><b>'+EJ(v)+'</b></div>':''}
function detail7(r){
  if(!r)return '<div class="k7c-empty">'+(ZJ()?'從左邊選一件案件查看內容。':'Select a case.')+'</div>';
  var zh=ZJ(),raw=r.raw||{},x=rowExtra7(r),cl=closed7(r),staff=r.source==='staff',ceo=isCeo7();
  /* 案件內容：沒有另外寫說明的舊案件（例如未登機退款）只會顯示類別名稱 —— 改用原始紀錄裡的事由 */
  var desc=(r.detail&&r.detail!==r.type&&r.detail!==r.sourceLabel)?r.detail:String(raw.external||raw.reason||raw.description||'');
  var acts='';
  if(staff&&!cl){
    acts='<div class="k7c-act"><div class="k7c-sub">'+(zh?'處理案件':'Work this case')+'</div>'
      +'<div class="k7c-grid2"><label>'+(zh?'狀態':'Status')+'<select class="inp" id="k7cSt">'
        +ST7.map(function(s){return '<option value="'+s[0]+'"'+(raw.status===s[0]?' selected':'')+'>'+EJ(L7(s[1]))+'</option>'}).join('')+'</select></label>'
      +'<label>'+(zh?'經辦人':'Owner')+'<div class="k7c-own"><b>'+EJ((raw.assignee&&raw.assignee.name)||(raw.assignee&&raw.assignee.empId)||'—')+'</b>'
        +'<button class="btn" onclick="kgmCase7Assign(\''+AJ(r.no)+'\')">'+(zh?'指派給我':'Assign to me')+'</button></div></label></div>'
      +'<label class="k7c-full">'+(zh?'給旅客的說明（會寄 Email 並出現在案件查詢）':'Message to the passenger (emailed and shown on the case page)')+'<textarea class="inp" rows="3" id="k7cMsg"></textarea></label>'
      +'<label class="k7c-full">'+(zh?'內部備註（只有員工看得到）':'Internal note (staff only)')+'<textarea class="inp" rows="2" id="k7cNote"></textarea></label>'
      +'<div class="k7c-btns"><button class="btn btn-g" onclick="kgmCase7Update(\''+AJ(r.no)+'\')">'+(zh?'儲存並更新':'Save update')+'</button></div></div>';
  }else if(!cl){
    acts='<div class="k7c-act"><div class="k7c-btns"><button class="btn" onclick="kgmCaseSupplement0831B(\''+AJ(r.no)+'\')">'+(zh?'客服補充說明':'Add staff note')+'</button>'
      +(r.source==='profile'?profileActsR913(r):(ceo?('<button class="btn btn-g" onclick="kgmCaseDecision0831B(\''+AJ(r.no)+'\',true)">'+(zh?'CEO 核准':'CEO approve')+'</button>'
        +'<button class="btn j-reject" onclick="kgmCaseDecision0831B(\''+AJ(r.no)+'\',false)">'+(zh?'拒絕／要求補件':'Reject / request details')+'</button>'):''))
      +'</div></div>';
  }else acts='<div class="k7c-closed">✓ '+(zh?'本案已結案，不可再更改。':'Closed — read only.')+'</div>';
  var bag=raw.bag?('<div class="k7c-sub">'+(zh?'行李資料':'Baggage')+'</div><div class="k7c-kv">'+kv7(zh?'行李條號碼':'Bag tag',raw.bag.tag)+kv7(zh?'外觀':'Description',raw.bag.look)
    +kv7(zh?'最後看到':'Last seen',raw.bag.seen)+kv7(zh?'送達地址／電話':'Delivery',raw.bag.deliver)+'</div>'):'';
  var notes=(staff&&(raw.notes||[]).length)?('<div class="k7c-sub">'+(zh?'內部備註':'Internal notes')+'</div><ul class="k7c-notes">'
    +raw.notes.map(function(n){return '<li><small>'+EJ(hm7(n.at))+' · '+EJ(n.by||'')+'</small><p>'+EJ(n.text)+'</p></li>'}).join('')+'</ul>'):'';
  return '<article class="k7c-detail"><header><div><small>'+EJ(r.sourceLabel||'')+(raw.priority==='urgent'?' · <em>'+(zh?'緊急':'URGENT')+'</em>':'')+'</small>'
    +'<h3>'+EJ(r.no)+'</h3><span>'+EJ(r.type)+'</span></div>'+chip7(r)+'</header>'
    +'<div class="k7c-kv">'+kv7('PNR',r.pnr)+kv7(zh?'旅客':'Passenger',x.pax)+kv7(zh?'航班':'Flight',x.flight)
      +kv7(zh?'建立':'Opened',hm7(r.created))+kv7(zh?'最後更新':'Updated',hm7(r.updated))
      +kv7(zh?'建立人員':'Opened by',raw.by&&(raw.by.name||raw.by.empId))+(+r.amount?kv7(zh?'金額':'Amount',(r.currency||'TWD')+' '+Number(r.amount).toLocaleString()):'')+'</div>'
    +(desc?'<div class="k7c-sub">'+(zh?'案件內容':'Details')+'</div><p class="k7c-text">'+EJ(desc)+'</p>':'')
    +bag+(r.source==='profile'?profileBlockR913(r):'')
    +'<div class="k7c-sub">'+(zh?'處理紀錄':'History')+'</div>'+timeline7(r,true)+notes+acts+'</article>';
}
function caseCenter7J(){
  var zh=ZJ(),all=caseRowsJ(),F=S.case7F||{},q=String(S.caseFilter0831B||'').toUpperCase();
  var today=TJ(),mon=today.slice(0,7);
  var open=all.filter(function(r){return !closed7(r)}),done=all.filter(closed7);
  var kpi=[[zh?'待處理':'Open',open.filter(function(r){return !/ceo_review|needs_more_info|awaiting_customer|payment_pending/.test(r.status)}).length,''],
    [zh?'等待旅客':'Waiting for passenger',open.filter(function(r){return /awaiting_customer|payment_pending/.test(r.status)}).length,'wait'],
    [zh?'待 CEO 審核':'Awaiting CEO',open.filter(function(r){return /ceo_review|needs_more_info/.test(r.status)}).length,'ceo'],
    [zh?'今日新增':'Opened today',all.filter(function(r){return String(r.created).slice(0,10)===today}).length,''],
    [zh?'本月結案':'Closed this month',done.filter(function(r){return String(r.updated).slice(0,7)===mon}).length,'done']];
  var tab=S.caseTabR913==='done'?'done':'open';
  var types={},srcs={};all.forEach(function(r){types[r.type]=1;srcs[r.source]=r.sourceLabel});
  var rows=(tab==='done'?done:open).filter(function(r){
    if(F.type&&r.type!==F.type)return false;if(F.src&&r.source!==F.src)return false;
    if(q){var x=rowExtra7(r);if([r.no,r.pnr,r.type,caseStatusJ(r.status),r.detail,x.pax,x.flight].join(' ').toUpperCase().indexOf(q)<0)return false}
    return true});
  rows.sort(function(a,b){var ua=(a.raw||{}).priority==='urgent'?1:0,ub=(b.raw||{}).priority==='urgent'?1:0;return (tab==='open'?ub-ua:0)||String(b.updated).localeCompare(String(a.updated))});
  var sel=rows.filter(function(r){return r.no===S.case7Sel})[0]||rows[0]||null;
  var list=rows.length?('<table class="k7c-table"><thead><tr><th>'+(zh?'案件編號':'Case')+'</th><th>'+(zh?'類型':'Type')+'</th><th>'+(zh?'PNR／旅客':'PNR / passenger')+'</th><th>'+(zh?'更新':'Updated')+'</th><th>'+(zh?'狀態':'Status')+'</th></tr></thead><tbody>'
    +rows.map(function(r){var x=rowExtra7(r),u=(r.raw||{}).priority==='urgent';
      return '<tr class="'+(sel&&sel.no===r.no?'on':'')+'" onclick="kgmCase7Sel(\''+AJ(r.no)+'\')"><td><b>'+EJ(r.no)+'</b>'+(u?'<em class="k7c-urg">'+(zh?'緊急':'URGENT')+'</em>':'')+'</td>'
        +'<td>'+EJ(r.type)+'<small>'+EJ(r.sourceLabel||'')+'</small></td><td>'+EJ(r.pnr||'—')+'<small>'+EJ(x.pax||'')+'</small></td>'
        +'<td>'+EJ(hm7(r.updated).slice(5))+'</td><td>'+chip7(r)+'</td></tr>'}).join('')+'</tbody></table>')
    :'<div class="k7c-empty">'+(tab==='done'?(zh?'沒有符合條件的已結案案件。':'No closed cases.'):(zh?'沒有符合條件的進行中案件。':'No open cases.'))+'</div>';
  return '<section class="k7c">'
    +'<div class="k7c-head"><div><small>CUSTOMER CASES</small><h2>'+(zh?'案件處理中心':'Case management')+'</h2>'
      +'<p>'+(zh?'改票、退款、航班異常、會員資料、里程與地勤／客服建立的案件都在這裡。點一件案件看完整紀錄與可以做的處理。':'Every customer case in one place. Select a case to see its history and actions.')+'</p></div>'
      +(canOpen7()?'<button class="btn btn-g k7c-new" onclick="kgmCase7Open(\'\')">＋ '+(zh?'建立案件':'New case')+'</button>':'')+'</div>'
    +'<div class="k7c-kpi">'+kpi.map(function(k){return '<div class="'+k[2]+'"><small>'+EJ(k[0])+'</small><b>'+k[1]+'</b></div>'}).join('')+'</div>'
    +'<div class="k7c-bar"><div class="k7c-tabs"><button class="'+(tab==='open'?'on':'')+'" onclick="S.case7Sel=null;kgmCaseTabR913(\'open\')">'+(zh?'進行中':'Open')+' <b>'+open.length+'</b></button>'
      +'<button class="'+(tab==='done'?'on':'')+'" onclick="S.case7Sel=null;kgmCaseTabR913(\'done\')">'+(zh?'已結案':'Closed')+' <b>'+done.length+'</b></button></div>'
      +'<input id="jCaseQ" class="inp" value="'+EJ(S.caseFilter0831B||'')+'" placeholder="'+(zh?'搜尋案件編號、PNR、旅客、航班':'Search case, PNR, passenger, flight')+'" onkeydown="if(event.key===\'Enter\')kgmCaseFilter0831B()">'
      +'<select class="inp" onchange="kgmCase7Filter(\'type\',this.value)"><option value="">'+(zh?'全部類型':'All types')+'</option>'+Object.keys(types).sort().map(function(t){return '<option'+(F.type===t?' selected':'')+'>'+EJ(t)+'</option>'}).join('')+'</select>'
      +'<select class="inp" onchange="kgmCase7Filter(\'src\',this.value)"><option value="">'+(zh?'全部來源':'All sources')+'</option>'+Object.keys(srcs).map(function(s){return '<option value="'+EJ(s)+'"'+(F.src===s?' selected':'')+'>'+EJ(srcs[s])+'</option>'}).join('')+'</select>'
      +'<button class="btn" onclick="kgmCaseFilter0831B()">'+(zh?'搜尋':'Search')+'</button></div>'
    +'<div class="k7c-split"><div class="k7c-list">'+list+'</div><div class="k7c-pane">'+detail7(sel)+'</div></div>'
    +newForm7()+'</section>';
}
/* ── 前台：案件查詢結果 ── */
var NEXT7={received:['我們已收到您的案件，專人會在 1 個工作天內與您聯繫。','We have your case and will contact you within one business day.'],
  investigating:['專人正在處理您的案件，有進度會立即以 Email 通知您。','We are working on your case and will email you with updates.'],
  awaiting_customer:['我們需要您的回覆：請依 Email 指示提供資料，或來電客服並提供案件編號。','We need information from you — please reply to our email or call us with your case number.'],
  payment_pending:['這件案件需要付款才能完成，請依 Email 或行程管理的指示付款。','Payment is required to complete this case.'],
  ceo_review:['案件正在審核中，審核完成後會立即通知您。','Your case is under review.'],needs_more_info:['案件審核中，客服正在補充資料。','Under review; our team is adding information.'],
  bank_processing:['款項正由銀行／支付系統處理，一般需要 7–14 個工作天。','Your payment is being processed by the bank (7–14 business days).']};
function caseFile7J(st){
  var r=st.result,zh=ZJ();try{case7Label(r)}catch(_){}
  var raw=r.raw||{},x=rowExtra7(r),cl=!!st.closed||closed7(r);
  var nx=cl?(zh?'本案已結案，處理結果已以 Email 通知您。':'This case is closed. The outcome was emailed to you.'):L7(NEXT7[r.status],zh?'專人處理中，有進度會以 Email 通知您。':'We will email you with updates.');
  var p=(r.progress&&r.progress.length?r.progress:[{at:r.created,status:r.status,label:caseStatusJ(r.status)}]).slice().reverse();
  return '<main class="j-case-public k7p">'
    +'<div class="k7p-top"><button class="btn" onclick="S.caseLookup0831B={};render()">← '+(zh?'返回案件查詢':'Back to case search')+'</button></div>'
    +'<section class="k7p-hero"><div><small>KGM SERVICE CASE · '+(zh?'案件編號':'CASE NUMBER')+'</small><h1>'+EJ(r.no)+'</h1><p>'+EJ(r.type)+(r.pnr?' · PNR '+EJ(r.pnr):'')+'</p></div>'
      +'<div class="k7p-status '+(cl?'done':'')+'"><small>'+(zh?'目前狀態':'STATUS')+'</small><b>'+EJ(cl?(zh?'已結案':'Closed'):caseStatusJ(r.status))+'</b></div></section>'
    +'<div class="k7p-grid"><div class="k7p-main">'
      +'<section class="k7p-card"><h2>'+(zh?'案件資料':'Case details')+'</h2><div class="k7c-kv">'
        +kv7(zh?'案件類型':'Type',r.type)+kv7('PNR',r.pnr)+kv7(zh?'旅客':'Passenger',x.pax)+kv7(zh?'航班':'Flight',x.flight)
        +kv7(zh?'建立日期':'Opened',hm7(r.created))+kv7(zh?'最後更新':'Updated',hm7(r.updated))
        +(+r.amount?kv7(zh?'金額':'Amount',(r.currency||'TWD')+' '+Number(r.amount).toLocaleString()):'')+'</div>'
        +(r.detail&&r.detail!==r.type?'<p class="k7c-text">'+EJ(r.detail)+'</p>':'')
        +(raw.bag?('<div class="k7c-sub">'+(zh?'行李資料':'Baggage')+'</div><div class="k7c-kv">'+kv7(zh?'行李條號碼':'Bag tag',raw.bag.tag)+kv7(zh?'外觀':'Description',raw.bag.look)+kv7(zh?'送達地址／電話':'Delivery',raw.bag.deliver)+'</div>'):'')
      +'</section>'
      +'<section class="k7p-card"><h2>'+(zh?'處理紀錄':'History')+'</h2><ol class="k7c-tl">'+p.map(function(s,i){return '<li class="'+(i===0?'now':'')+'"><i></i><div><b>'+EJ(s.label||caseStatusJ(s.status))+'</b><small>'+EJ(hm7(s.at))+'</small>'+(s.note?'<p>'+EJ(s.note)+'</p>':'')+'</div></li>'}).join('')+'</ol></section>'
    +'</div><aside class="k7p-side">'
      +'<section class="k7p-card k7p-next '+(cl?'done':'')+'"><small>'+(zh?'下一步':'WHAT HAPPENS NEXT')+'</small><p>'+EJ(nx)+'</p></section>'
      +'<section class="k7p-card"><small>'+(zh?'需要協助':'NEED HELP')+'</small><p>'+(zh?'客服專線 0800-789-456（24 小時）<br>來電請提供案件編號 ':'Call 0800-789-456 (24h) and quote ')+'<b>'+EJ(r.no)+'</b></p>'
        +'<p class="k7p-mute">'+(zh?'每一次進度更新都會以 Email 通知訂位時留下的信箱。':'Every update is emailed to the address on the booking.')+'</p></section>'
    +'</aside></div></main>';
}
/* ── 行程管理：這個訂位的服務案件 ── */
window.kgmCaseTripHtmlR1007A=function(b){
  try{
    if(!b||!b.pnr)return '';var zh=ZJ();
    var l=caseRowsJ().filter(function(r){return String(r.pnr||'').toUpperCase()===String(b.pnr).toUpperCase()});if(!l.length)return '';
    return '<section class="k7p-trip"><header><small>SERVICE CASES</small><h3>'+(zh?'這個訂位的服務案件':'Service cases for this booking')+'</h3></header>'
      +l.map(function(r){var cl=closed7(r);return '<button class="k7p-trow" onclick="kgmOpenMyCaseR920H&&kgmOpenMyCaseR920H(\''+AJ(r.no)+'\')"><b>'+EJ(r.no)+'</b><span>'+EJ(r.type)+'</span>'
        +'<em class="'+(cl?'done':'')+'">'+EJ(cl?(zh?'已結案':'Closed'):caseStatusJ(r.status))+'</em><i>›</i></button>'}).join('')+'</section>';
  }catch(_){return ''}
};
window.kgmCaseTripKeyR1007A=function(b){try{return caseRowsJ().filter(function(r){return b&&r.pnr===b.pnr}).map(function(r){return r.no+r.status}).join(',')}catch(_){return ''}};
(function(){try{if(document.getElementById('k7c-css'))return;var s=document.createElement('style');s.id='k7c-css';s.textContent=''
  +'.k7c{--g:#17493a;--gold:#a9822f;--line:#e4dfd3;--sub:#7d8780;--ink:#1f2a25;color:var(--ink)}'
  +'.k7c-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:14px}'
  +'.k7c-head small,.k7c-sub,.k7p-card>small,.k7p-hero small{display:block;font-size:10px;letter-spacing:.16em;font-weight:900;color:var(--gold,#a9822f)}'
  +'.k7c-head h2{margin:4px 0 4px;font:900 22px/1.2 Georgia,"Noto Serif TC",serif;color:#17493a}.k7c-head p{margin:0;font-size:12px;color:#7d8780;max-width:640px;line-height:1.7}'
  +'.k7c-new{white-space:nowrap;border-radius:10px;padding:10px 18px}'
  +'.k7c-kpi{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:0 0 14px}'
  +'.k7c-kpi>div{border:1px solid #e4dfd3;border-radius:12px;padding:10px 14px;background:#fff}.k7c-kpi small{display:block;font-size:11px;color:#7d8780;font-weight:700}'
  +'.k7c-kpi b{font:900 22px/1.3 -apple-system,"Noto Sans TC",sans-serif;color:#17493a}.k7c-kpi .wait b{color:#9a6a12}.k7c-kpi .ceo b{color:#a3342b}.k7c-kpi .done b{color:#2f7a5c}'
  +'.k7c-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.k7c-bar .inp{height:38px;margin:0}.k7c-bar input.inp{flex:1;min-width:200px}.k7c-bar select.inp{width:auto;min-width:140px}'
  +'.k7c-tabs{display:flex;background:#f1eee6;border-radius:10px;padding:3px}.k7c-tabs button{border:0;background:none;padding:7px 14px;border-radius:8px;font-size:12.5px;font-weight:800;color:#5c6a63;cursor:pointer}'
  +'.k7c-tabs button.on{background:#fff;color:#17493a;box-shadow:0 1px 3px rgba(0,0,0,.08)}.k7c-tabs b{font-size:11px;color:#a9822f;margin-left:3px}'
  +'.k7c-split{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px;align-items:start}'
  +'.k7c-list{border:1px solid #e4dfd3;border-radius:12px;background:#fff;overflow:auto;max-height:720px}'
  +'.k7c-table td:nth-child(2),.k7c-table td:nth-child(4),.k7c-table td:nth-child(5){white-space:nowrap}'   /* 類型、更新時間、狀態不斷行 */
  +'.k7c-table{width:100%;border-collapse:collapse;font-size:12.5px}.k7c-table th{position:sticky;top:0;background:#faf8f3;text-align:left;font-size:10.5px;letter-spacing:.06em;color:#7d8780;padding:9px 12px;border-bottom:1px solid #e4dfd3;font-weight:800}'
  +'.k7c-table td{padding:10px 12px;border-bottom:1px solid #f0ece2;vertical-align:top}.k7c-table td small{display:block;font-size:11px;color:#8b948f;margin-top:2px}'
  +'.k7c-table td b{font-family:ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.02em}.k7c-table tr{cursor:pointer}.k7c-table tbody tr:hover{background:#fbfaf6}'
  +'.k7c-table tr.on{background:#eef5f1;box-shadow:inset 3px 0 0 #17493a}.k7c-urg,.k7c-detail header em{display:inline-block;margin-left:6px;font-style:normal;font-size:9.5px;font-weight:900;color:#fff;background:#b3261e;border-radius:99px;padding:1px 7px;vertical-align:1px}'
  +'.k7c-st{display:inline-block;white-space:nowrap;font-size:11px;font-weight:800;border-radius:99px;padding:3px 10px;background:#e6efea;color:#17493a}'
  +'.k7c-st.wait{background:#fbf0d9;color:#8a5b12}.k7c-st.ceo{background:#f9e3e0;color:#a3342b}.k7c-st.done{background:#eceae4;color:#6b6b63}'
  +'.k7c-pane{position:sticky;top:12px}.k7c-detail{border:1px solid #e4dfd3;border-radius:12px;background:#fff;padding:16px 18px}'
  +'.k7c-detail table th,.k7c-detail table td:first-child,.k7c-detail table td:last-child{white-space:nowrap}.k7c-detail table td{vertical-align:middle}'   /* 會員資料變更表：欄位名稱、審核結果不斷行 */
  +'.k7c-detail header{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;border-bottom:1px solid #f0ece2;padding-bottom:12px;margin-bottom:12px}'
  +'.k7c-detail header small{font-size:10px;letter-spacing:.14em;font-weight:900;color:#a9822f}.k7c-detail h3{margin:3px 0 2px;font:800 19px/1.2 ui-monospace,Menlo,monospace;color:#17493a}.k7c-detail header span{font-size:12.5px;color:#46564e;font-weight:700}'
  +'.k7c-kv{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px 14px;margin:6px 0 10px}.k7c-kv small{display:block;font-size:10.5px;color:#8b948f}.k7c-kv b{font-size:12.5px;color:#1f2a25;font-weight:700;word-break:break-word}'
  +'.k7c-sub{margin:14px 0 6px}.k7c-text{margin:0 0 6px;font-size:13px;line-height:1.75;color:#2e3b36;white-space:pre-wrap}'
  +'.k7c-tl{list-style:none;margin:6px 0 4px;padding:0}.k7c-tl li{display:flex;gap:12px;position:relative;padding:0 0 14px}'
  +'.k7c-tl li:before{content:"";position:absolute;left:5px;top:14px;bottom:0;width:2px;background:#e3e7e4}.k7c-tl li:last-child:before{display:none}'
  +'.k7c-tl i{flex:none;width:12px;height:12px;border-radius:50%;background:#b9c4be;margin-top:3px;position:relative;z-index:1}.k7c-tl li.now i{background:#17493a;box-shadow:0 0 0 4px rgba(23,73,58,.14)}'
  +'.k7c-tl b{display:block;font-size:12.5px;color:#1f2a25}.k7c-tl small{display:block;font-size:11px;color:#8b948f;margin-top:1px}.k7c-tl p{margin:5px 0 0;font-size:12px;color:#46564e;background:#f7f6f1;border-radius:8px;padding:7px 10px;white-space:pre-wrap}'
  +'.k7c-notes{list-style:none;margin:0;padding:0}.k7c-notes li{border-left:3px solid #e8d9b4;padding:4px 10px;margin-bottom:6px;background:#fdfaf2}.k7c-notes small{font-size:10.5px;color:#8b948f}.k7c-notes p{margin:2px 0 0;font-size:12px;white-space:pre-wrap}'
  +'.k7c-act{border-top:1px solid #f0ece2;margin-top:10px;padding-top:4px}.k7c-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.k7c-act label,.k7c-dlg label{display:block;font-size:11.5px;font-weight:700;color:#5c6a63}'
  +'.k7c-act .inp,.k7c-dlg .inp{width:100%;margin-top:4px}.k7c-full{margin-top:10px}.k7c-btns{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}'
  +'.k7c-own{display:flex;gap:8px;align-items:center;margin-top:4px}.k7c-own b{flex:1;font-size:12.5px;color:#1f2a25}'
  +'.k7c-closed{margin-top:12px;background:#eef5f1;color:#17493a;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:800}'
  +'.k7c-empty{padding:40px 16px;text-align:center;color:#8b948f;font-size:12.5px}'
  +'.k7c-modal{position:fixed;inset:0;background:rgba(17,27,23,.45);z-index:100100;display:flex;align-items:flex-start;justify-content:center;padding:6vh 16px;overflow:auto}'
  +'.k7c-dlg{background:#fff;border-radius:16px;width:min(720px,100%);box-shadow:0 30px 80px rgba(0,0,0,.25)}'
  +'.k7c-dlg header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 22px 12px;border-bottom:1px solid #f0ece2}.k7c-dlg header small{font-size:10px;letter-spacing:.16em;font-weight:900;color:#a9822f}'
  +'.k7c-dlg h3{margin:4px 0 0;font:900 19px Georgia,"Noto Serif TC",serif;color:#17493a}.k7c-x{border:0;background:none;font-size:26px;line-height:1;color:#8b948f;cursor:pointer}'
  +'.k7c-dlg-body{padding:14px 22px 6px}.k7c-dlg footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 22px 18px;border-top:1px solid #f0ece2}'
  +'.k7c-pnr{display:flex;gap:8px;margin-top:4px}.k7c-pnr .inp{margin:0}.k7c-bk{display:flex;gap:14px;flex-wrap:wrap;align-items:baseline;background:#f4f8f6;border-radius:10px;padding:10px 12px;margin:10px 0;font-size:12px;color:#46564e}'
  +'.k7c-bk b{font-family:ui-monospace,Menlo,monospace;color:#17493a;font-size:14px}.k7c-err{background:#fbeceb;color:#a3342b;border-radius:8px;padding:8px 12px;font-size:12px;margin:8px 0}'
  +'.k7c-check{display:flex!important;gap:8px;align-items:center;margin:12px 0 4px;font-weight:600!important}.k7c-check input{width:auto;margin:0}'
  +'@media(max-width:1100px){.k7c-split{grid-template-columns:1fr}.k7c-pane{position:static}.k7c-kpi{grid-template-columns:repeat(3,1fr)}}'
  +'@media(max-width:640px){.k7c-kpi{grid-template-columns:repeat(2,1fr)}.k7c-grid2{grid-template-columns:1fr}.k7c-head{flex-direction:column}}'
  /* 前台 */
  +'.k7p{max-width:1080px;margin:0 auto;padding:22px 16px 40px}.k7p-top{margin-bottom:12px}.k7p-top .btn{border-radius:999px;padding:8px 16px;font-weight:800}'
  +'.k7p-hero{display:flex;justify-content:space-between;align-items:center;gap:18px;background:linear-gradient(120deg,#0d3d31,#1b6a55);color:#fff;border-radius:18px;padding:24px 28px;margin-bottom:16px}'
  +'.k7p-hero small{color:#d9c58f}.k7p-hero h1{margin:6px 0 4px;font:800 28px/1.15 ui-monospace,Menlo,monospace;letter-spacing:.03em;color:#fff}.k7p-hero p{margin:0;font-size:13px;color:rgba(255,255,255,.82)}'
  +'.k7p-status{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:12px 18px;min-width:170px;text-align:center}.k7p-status small{color:#d9c58f}.k7p-status b{display:block;font-size:17px;margin-top:4px;color:#fff}'
  +'.k7p-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start}.k7p-card{background:#fff;border:1px solid #e4dfd3;border-radius:14px;padding:18px 20px;margin-bottom:14px}'
  +'.k7p-card h2{margin:0 0 10px;font:900 16px Georgia,"Noto Serif TC",serif;color:#17493a}.k7p-card p{font-size:13px;line-height:1.75;color:#2e3b36;margin:8px 0 0}.k7p-mute{color:#8b948f!important;font-size:12px!important}'
  +'.k7p-next{background:#fbf7ec;border-color:#ecdcae}.k7p-next p{font-size:14px;font-weight:700;color:#5d4410}.k7p-next.done{background:#eef5f1;border-color:#cfe2d8}.k7p-next.done p{color:#17493a}'
  +'.k7p-trip{background:#fff;border:1px solid #e4dfd3;border-radius:14px;padding:14px 18px;margin:0 0 14px}.k7p-trip header small{font-size:10px;letter-spacing:.16em;font-weight:900;color:#a9822f}.k7p-trip h3{margin:3px 0 8px;font:900 15px Georgia,"Noto Serif TC",serif;color:#17493a}'
  +'.k7p-trow{display:flex;width:100%;align-items:center;gap:12px;border:0;border-top:1px solid #f0ece2;background:none;padding:10px 2px;cursor:pointer;text-align:left;font-size:12.5px;color:#2e3b36}'
  +'.k7p-trow b{font-family:ui-monospace,Menlo,monospace;color:#17493a}.k7p-trow span{flex:1}.k7p-trow em{font-style:normal;font-size:11px;font-weight:800;background:#e6efea;color:#17493a;border-radius:99px;padding:2px 9px}.k7p-trow em.done{background:#eceae4;color:#6b6b63}.k7p-trow i{font-style:normal;color:#a9822f;font-size:18px}'
  +'@media(max-width:860px){.k7p-grid{grid-template-columns:1fr}.k7p-hero{flex-direction:column;align-items:flex-start}}';
  (document.head||document.documentElement).appendChild(s)}catch(_){}})();
