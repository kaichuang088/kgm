/* ══ 1025B A：團體訂位重做（使用者逐條指定）
   ① 帳號要先經「AI 客服」核對基本資料、綁定成團體帳號（產生案件編號），綁定之後才看得到「團體訂位」分頁；
   ② 選航班跟一般訂票完全同一套（單程／來回／多航段、轉機、日期列、篩選都一樣）—— 首頁訂票卡切到「團體訂位」就是團體模式；
   ③ 團體方案：每一艙一個「團體」方案，比當下這一艙一般可賣的最低價再少 5%；改票／退票手續費＝這一艙「超值」方案的手續費 × 0.75；
   ④ 訂完先劃位（付完訂金直接到整團劃位：系統可一鍵相鄰劃位，也可以進一般選位頁自己調）；
   ⑤ 付款：訂位時付訂金 10%（出發前 14 天內訂的一次付清），尾款付款連結當下就寄、每 7 天提醒一次，最晚出發前 14 天付清（逾期自動取消、釋出座位）；
   ⑥ 名單最晚出發前 14 天提供（先以 TBA 保留座位）；名單提供前可減少人數，最多 3 位；
   ⑦ 尾款付清＋名單齊全 → 開票，一位旅客一個 PNR（各自報到、改票）；
   ⑧ 前台「我的團體訂位」、後台「團體訂位」頁重做。
   沒有另寫一套訂票：團體模式只是在一般訂票流程上加條件 —— 庫存 sell54（這一艙整艙空位，扣 Payload 限座）、票價 owPrice、旅客人數 10–99、
   旅客資料頁（團名、名單之後再給）、付款頁（訂金）；團體紀錄沿用 S.groupsR1023A（kind:'v25'）；1023A 舊的申請單資料照樣看得到。 ══ */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}}
function M(v,c){try{return fmtAmt(Math.round(+v||0),c||'TWD')}catch(_){return (c||'TWD')+' '+Math.round(+v||0).toLocaleString()}}
function G(){return S.groupsR1023A=S.groupsR1023A||[]}
function save1(){try{save()}catch(_){}}
function days(a,b){return Math.round((Date.parse(b+'T12:00:00')-Date.parse(a+'T12:00:00'))/86400000)}
function bk(pnr){return (S.bookings||[]).filter(function(b){return b&&b.pnr===pnr})[0]||null}
function ap(c){try{var m=z()?CITY_ZH:(typeof CITY_EN!=='undefined'?CITY_EN:CITY_ZH);return (m&&m[c])||c}catch(_){return c}}
/* 1026C（交付 1027A）：團體訂位兩個方案（使用者：「團體訂購就是提供兩個方案，就是優惠和彈性，你去選沒有用過的英文代號」）
   代號：全站沒用過的字母只剩 Q、U → 團體優惠 Q（E-Q／P-Q／B-Q）、團體彈性 U（E-U／P-U／B-U）。
   優惠：改票每人 NT$1,400、退票每人 NT$2,600；名單（確認人數）出發前 28 天、尾款出發前 21 天；名單期限前可 ±3 位不收手續費（加人看當天空位）；行李經濟艙短程 1×23、長程 2×23。
   彈性：改票每人 NT$600、退票每人 NT$1,500；名單出發前 14 天、尾款出發前 7 天；名單期限前可 ±6 位不收手續費；行李 2×23；可依「超值」規則申請哩程升等。
   兩者：不能用酬賓機票、不能網路報到（出發當日由領隊或全體旅客到機場櫃檯辦理）、隨時免費選位（整團一次鎖位；使用者 1027A：「團體定位要可以免費隨時選位置，所以價錢要在高一點」）、座位保留到起飛前 60 分鐘；
   超過免費名額的增減，每一位都收手續費（加人＝改票費、減人＝退票費）；每位旅客艙等可以不一樣（名單頁逐位調整）。
   價格：本艙一般 1 位可賣的最低價 × 優惠 0.93／彈性 1.08（使用者指定；免費選位所以比原本 0.90／1.05 高）。訂金照舊 10%。 */
var DEP=0.10,FEE=1,MINP=10,MAXP=99;
var PLANS={Q:{k:'Q',zh:'團體優惠',en:'Group Saver',mul:0.93,chg:1400,ref:2600,names:28,bal:21,free:3,upg:false},
           U:{k:'U',zh:'團體彈性',en:'Group Flex',mul:1.08,chg:600,ref:1500,names:14,bal:7,free:6,upg:true}};
window.KGM_GRP_PLANS_R1026C=PLANS;
window.KGM_GRP_RULES_R1025B={deposit:DEP,min:MINP,max:MAXP,plans:PLANS};
function planOf(x){if(!x)return PLANS.U;if(typeof x==='string'){var f=(typeof FARES!=='undefined')?FARES[x]:null;return PLANS[(f&&f.groupPlanR1026C)||x]||PLANS.U}return PLANS[x.plan]||PLANS.U}
window.kgmGrpPlanOfR1026C=planOf;
var TYPES=[['agency','旅行社','Travel agency'],['corp','企業／獎勵旅遊','Corporate / incentive'],['school','學校／遊學','School / study tour'],['other','其他團體','Other group']];
function typeName(t){var x=TYPES.filter(function(q){return q[0]===t})[0];return x?(z()?x[1]:x[2]):(t||'')}

/* ── ① 綁定團體帳號 ── */
function me(){if(!S.user)return null;return (S.users||[]).filter(function(u){return u&&u.id===S.user.id})[0]||S.user}
function acctAny(){var u=me();return u&&u.groupAccountR1025B||null}
/* 可以訂團體票＝已核准，而且今天在開放期間內（沒設期間＝不限） */
function openNow(x){if(!x||x.status!=='active')return false;var td=T();if(x.from&&td<x.from)return false;if(x.to&&td>x.to)return false;return true}
function acct(){var x=acctAny();return openNow(x)?x:null}
window.kgmGrpAcctStateR1026C=function(){var x=acctAny();if(!x)return 'none';if(x.status==='pending')return 'pending';if(x.status!=='active')return x.status;return openNow(x)?'open':'closed'};
/* 後台：核准（設定開放期間）、新增用戶、停用 */
function acctMail(u,x,ev,msg){try{if(typeof kgmNotify==='function')Promise.resolve(kgmNotify(ev,{email:u.email||(x.contact&&x.contact.email)||'',name:x.contact&&x.contact.name||'',caseNo:x.caseNo||'',message:msg})).catch(function(){})}catch(_){}}
window.kgmGrpApproveR1026C=function(uid,from,to){var u=(S.users||[]).filter(function(x){return x&&x.id===uid})[0];if(!u||!u.groupAccountR1025B)return false;var x=u.groupAccountR1025B;
  x.status='active';x.from=from||T();x.to=to||'';x.approvedAt=new Date().toISOString();x.approvedBy=(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'';if(S.user&&S.user.id===uid)S.user.groupAccountR1025B=x;
  acctMail(u,x,'group.account_bound',(z()?'您的團體帳號已核准（'+x.company+'），開放期間 '+x.from+' ～ '+(x.to||'不限')+'；期間內可在首頁訂票卡的「團體訂位」分頁訂位。':'Your group account is approved.'));
  try{logAct(z()?'團體帳號核准':'Group account approved',x.company+' · '+x.from+'～'+(x.to||'—'))}catch(_){}save1();return true};
window.kgmGrpPeriodR1026C=function(uid,from,to){var u=(S.users||[]).filter(function(x){return x&&x.id===uid})[0];if(!u||!u.groupAccountR1025B)return false;if(from&&to&&to<from)return false;   /* 1026C：改開放期間 */
  var x=u.groupAccountR1025B,was=(x.from||'')+'～'+(x.to||'');x.from=from||x.from||T();x.to=to||'';x.periodAt=new Date().toISOString();x.periodBy=(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'';if(S.user&&S.user.id===uid)S.user.groupAccountR1025B=x;
  acctMail(u,x,'group.account_bound',(z()?'您的團體帳號（'+x.company+'）開放期間已更新為 '+x.from+' ～ '+(x.to||'不限')+'。':'Your group account period was updated.'));
  try{logAct(z()?'團體帳號開放期間':'Group account period',x.company+' · '+was+' → '+x.from+'～'+(x.to||'—'))}catch(_){}save1();return true};
window.kgmGrpAddUserR1026C=function(q,d){q=String(q||'').trim().toLowerCase();var u=(S.users||[]).filter(function(x){return x&&(String(x.id||'').toLowerCase()===q||String(x.email||'').toLowerCase()===q)})[0];if(!u)return 'nouser';
  if(!d.company||!taxOk(d.taxId))return 'bad';var now=new Date().toISOString();
  u.groupAccountR1025B={status:'active',type:d.type||'agency',company:d.company,taxId:String(d.taxId).replace(/\D/g,''),license:d.license||'',contact:{name:d.contact||u.name||'',phone:d.phone||u.phone||'',email:u.email||''},caseNo:caseNo(),boundAt:now,boundBy:(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'desk',from:d.from||T(),to:d.to||'',approvedAt:now,approvedBy:(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||''};
  if(S.user&&S.user.id===u.id)S.user.groupAccountR1025B=u.groupAccountR1025B;
  acctMail(u,u.groupAccountR1025B,'group.account_bound',(z()?'KGM 團體業務已為您開通團體帳號（'+d.company+'），開放期間 '+u.groupAccountR1025B.from+' ～ '+(u.groupAccountR1025B.to||'不限')+'。':'Group account opened.'));
  try{logAct(z()?'新增團體用戶':'Group user added',d.company+' · '+(u.email||u.id))}catch(_){}save1();return 'ok'};
window.kgmGrpBoundR1025B=function(){return !!acct()};
window.kgmGrpAccountR1025B=acct;
/* 統一編號檢查碼（財政部：加權 1,2,1,2,1,2,4,1，各位乘積的十位＋個位相加，總和可被 5 整除；第 7 碼為 7 時總和＋1 也可） */
function taxOk(v){v=String(v||'').replace(/\D/g,'');if(!/^\d{8}$/.test(v))return false;var w=[1,2,1,2,1,2,4,1],s=0;for(var i=0;i<8;i++){var p=(+v[i])*w[i];s+=Math.floor(p/10)+p%10}
  return s%5===0||(v[6]==='7'&&(s+1)%5===0)}
function licOk(v){return /^(交觀)?\s*(甲|乙|綜合?)\s*(字第)?\s*\d{3,5}\s*號?$/.test(String(v||'').trim())}
function phoneOk(v){var d=String(v||'').replace(/[\s\-()]/g,'');return /^09\d{8}$/.test(d)||/^0\d{8,9}$/.test(d)||/^\+\d{8,15}$/.test(d)}
function caseNo(){var d=new Date(),mm=('0'+(d.getMonth()+1)).slice(-2),dd=('0'+d.getDate()).slice(-2),yy=String(d.getFullYear()).slice(2),n=1000+Math.floor(Math.random()*9000),no='KG'+n+mm+dd+yy+'M';
  if((S.staffCasesR1007A||[]).some(function(c){return c&&c.caseNo===no}))no=no.replace(/M$/,'N');return no}
function bind(d){var u=me();if(!u)return null;var no=caseNo(),now=new Date().toISOString();
  /* 1026C：使用者「團體定位就是有個按鈕一邊是團體定位一邊是團體定位帳號綁定 AI要可以審核 也要人工可自己加入」
     → AI 客服核對（統編檢查碼、執照格式、聯絡資料）就是審核，通過直接開通，開放期間預設一年；後台「團體帳號綁定」可以調整期間、停用，也可以人工新增 */
  var rec={status:'active',type:d.type,company:d.company,taxId:d.taxId,license:d.license||'',contact:{name:d.contact,phone:d.phone,email:u.email||''},caseNo:no,boundAt:now,boundBy:'AI',from:T(),to:AD(T(),365),approvedAt:now,approvedBy:'AI'};
  u.groupAccountR1025B=rec;if(S.user&&S.user!==u)S.user.groupAccountR1025B=rec;
  S.staffCasesR1007A=S.staffCasesR1007A||[];
  S.staffCasesR1007A.unshift({caseNo:no,pnr:'',type:'group_account',status:'resolved',priority:'normal',paxIndex:0,paxName:String(d.contact||'').toUpperCase(),segment:null,
    detail:(z()?'團體帳號綁定：':'Group account: ')+d.company+'（'+typeName(d.type)+'，統一編號 '+d.taxId+(d.license?'，旅行業執照 '+d.license:'')+'）',createdAt:now,updatedAt:now,
    by:{empId:'AI',name:z()?'AI 客服':'AI assistant',role:'service'},assignee:{empId:'AI',name:z()?'AI 客服':'AI assistant'},userId:u.id,email:u.email||'',
    progress:[{at:now,status:'received',label:z()?'AI 客服受理團體帳號申請':'Received by AI assistant',by:'AI'},{at:now,status:'resolved',label:z()?'AI 審核通過（統編檢查碼、執照、聯絡資料），開通團體帳號一年':'Verified and approved by AI (one year)',by:'AI'}],
    notes:[{at:now,by:'AI',text:(z()?'核對：統一編號檢查碼正確、聯絡 Email 與會員帳號相同、電話格式正確':'Checked tax ID checksum, member email, phone format')+(d.license?(z()?'、旅行業執照格式正確':', licence format'):'')}],groupR1025B:1});
  try{if(typeof kgmNotify==='function')Promise.resolve(kgmNotify('group.account_bound',{email:u.email||'',name:d.contact,caseNo:no,message:(z()?'您的團體帳號已由 AI 客服審核開通（'+d.company+'），開放期間 '+rec.from+' ～ '+rec.to+'；期間內可在首頁訂票卡的「團體訂位」分頁訂位。':'Your group account is active.')})).catch(function(){})}catch(_){}
  try{logAct&&logAct(z()?'團體帳號綁定（AI 客服）':'Group account bound (AI)',d.company+' · '+no)}catch(_){}
  save1();return rec}
window.kgmGrpUnbindR1025B=function(uid,why){var u=(S.users||[]).filter(function(x){return x&&x.id===uid})[0];if(!u||!u.groupAccountR1025B)return false;u.groupAccountR1025B.status='revoked';u.groupAccountR1025B.revokedAt=new Date().toISOString();u.groupAccountR1025B.revokeWhy=why||'';if(S.user&&S.user.id===uid)S.user.groupAccountR1025B=u.groupAccountR1025B;save1();return true};

/* AI 客服對話（前台 AI 視窗）：一步一步問、每一步都檢查，最後確認才綁定 */
var STEPS=['type','company','taxId','license','contact','phone','confirm'];
function ask(st,d){var u=me()||{};
  if(st==='type')return (z()?'好的，我來幫您綁定團體帳號（約 1 分鐘，隨時輸入「取消」可以中止）。\n請問是哪一種團體？\n1. 旅行社\n2. 企業／獎勵旅遊\n3. 學校／遊學\n4. 其他團體':'Sure — which kind of group? 1 Travel agency 2 Corporate 3 School 4 Other');
  if(st==='company')return z()?'請輸入公司（或學校、團體）的完整名稱：':'Company / organisation name:';
  if(st==='taxId')return z()?'請輸入統一編號（8 碼）：':'Tax ID (8 digits):';
  if(st==='license')return z()?'請輸入旅行業執照號碼（例如：交觀甲 1234、乙 5678、綜合 123）：':'Travel agency licence number:';
  if(st==='contact')return z()?'團體聯絡人（負責這個帳號的人）姓名：':'Contact person name:';
  if(st==='phone')return z()?'聯絡人電話（手機 09 開頭或市話、國際號碼 + 開頭）：':'Contact phone:';
  if(st==='confirm')return (z()?'請確認以下資料：\n':'Please confirm:\n')+'· '+(z()?'類型：':'Type: ')+typeName(d.type)+'\n· '+(z()?'名稱：':'Name: ')+d.company+'\n· '+(z()?'統一編號：':'Tax ID: ')+d.taxId+(d.license?'\n· '+(z()?'旅行業執照：':'Licence: ')+d.license:'')
    +'\n· '+(z()?'聯絡人：':'Contact: ')+d.contact+'\n· '+(z()?'電話：':'Phone: ')+d.phone+'\n· Email：'+(u.email||'—')+(z()?'（會員帳號的 Email，團體相關通知會寄到這裡）':'')+'\n\n'+(z()?'資料正確請回覆「確認」，要修改請回覆「重來」。':'Reply "confirm" or "restart".');
  return ''}
function step(c,t){var g=c.grp25,d=g.data,st=g.step,v=String(t||'').trim(),bad='';
  if(/^(取消|cancel|不要了|算了)$/i.test(v)){c.grp25=null;return z()?'好的，已取消綁定。需要時再跟我說「綁定團體帳號」。':'Cancelled.'}
  if(st==='type'){var m={'1':'agency','2':'corp','3':'school','4':'other'},k=m[v.charAt(0)]||(/旅行社|agency/i.test(v)?'agency':/企業|公司|獎勵|corp/i.test(v)?'corp':/學校|遊學|school/i.test(v)?'school':/其他|other/i.test(v)?'other':'');if(!k)bad=z()?'請回覆 1–4 其中一個數字。':'Reply 1–4.';else d.type=k}
  else if(st==='company'){if(v.length<2)bad=z()?'名稱太短，請輸入完整名稱。':'Too short.';else d.company=v}
  else if(st==='taxId'){var x=v.replace(/\D/g,'');if(!/^\d{8}$/.test(x))bad=z()?'統一編號是 8 碼數字。':'8 digits.';else if(!taxOk(x))bad=z()?'這組統一編號的檢查碼不正確，請再確認一次（可以看公司登記資料或發票）。':'Checksum does not match.';else d.taxId=x}
  else if(st==='license'){if(!licOk(v))bad=z()?'格式不對，請照執照上的寫法，例如「交觀甲 1234」。':'Licence format not recognised.';else d.license=v.replace(/\s+/g,' ')}
  else if(st==='contact'){if(v.length<2||/\d/.test(v))bad=z()?'請輸入聯絡人姓名。':'Enter a name.';else d.contact=v}
  else if(st==='phone'){if(!phoneOk(v))bad=z()?'電話格式不對：手機 09 開頭 10 碼，市話 0 開頭，國際請加 +。':'Phone format not recognised.';else d.phone=v.replace(/\s+/g,'')}
  else if(st==='confirm'){if(/^(重來|restart)$/i.test(v)){g.data={};g.step='type';return ask('type',g.data)}
    if(!/^(確認|確定|是|對|ok|yes|confirm)$/i.test(v))return z()?'請回覆「確認」或「重來」。':'Reply "confirm" or "restart".';
    var r=bind(d);c.grp25=null;if(!r)return z()?'請先登入會員再綁定。':'Please sign in first.';
    return (z()?'✓ 審核通過，團體帳號已開通（案件編號 '+r.caseNo+'，開放到 '+r.to+'）。\n\n現在首頁訂票卡多了「團體訂位」分頁（10–99 位，選航班跟一般訂票一樣）。\n團體有兩個方案：\n・團體優惠（Q）：價格較低；名單（確認人數）出發前 28 天、尾款出發前 21 天；名單期限前可 ±3 位不收手續費；改票每人 NT$1,400、退票每人 NT$2,600。\n・團體彈性（U）：名單出發前 14 天、尾款出發前 7 天；名單期限前可 ±6 位不收手續費；改票每人 NT$600、退票每人 NT$1,500；可申請哩程升等。\n訂位時付訂金 10%；付清且名單齊全後一人一個 PNR 開票。詳細規定見《團體訂位規章》（KGM-GRP-021）。':'Approved. Case '+r.caseNo+'. The Group tab is now on the home booking card.')}
  if(bad)return bad+'\n'+ask(st,d);
  var i=STEPS.indexOf(st)+1;if(STEPS[i]==='license'&&d.type!=='agency')i++;g.step=STEPS[i];return ask(g.step,d)}
var TRIG=/綁定.*(團體|旅行社)|團體帳號|團體訂位|旅行團|旅行社.*(訂位|訂票|帳號)|group (booking|account)/i;
function aiReply(t,c){
  if(c&&c.grp25)return step(c,t);
  if(!TRIG.test(t))return '';
  if(!S.user)return z()?'團體訂位要先登入會員，再由我幫您綁定團體帳號。':'Please sign in first.';
  var a=acct();if(a)return (z()?'您的帳號已綁定團體帳號：'+a.company+'（'+typeName(a.type)+'，案件 '+a.caseNo+'）。\n訂位：首頁訂票卡「團體訂位」分頁（選航班跟一般訂票一樣）。\n管理已訂的團體（付尾款、名單、劃位、減少人數、開票）：選單「優惠與訂票 › 團體訂位」。':'Already bound: '+a.company);
  c.grp25={step:'type',data:{}};return (z()?'團體訂位（10–99 位）要先綁定團體帳號，我需要核對幾項基本資料：類型、名稱、統一編號、（旅行社）執照號碼、聯絡人與電話。\n\n':'')+ask('type',c.grp25.data)}
var MYAI=null;
function aiWrap(){var o=window.kgmSendAi0819I;if(typeof o!=='function'||o===MYAI)return;
  var w=function(){
    try{var inp=document.getElementById('aiInput'),t=String(inp&&inp.value||'').trim(),c=S.aiConversation0819I;
      var live=c&&c.csIdR1006A&&(S.csQueueR1006A||{})[c.csIdR1006A]&&/waiting|active/.test((S.csQueueR1006A||{})[c.csIdR1006A].status);
      if(t&&!live){var a=aiReply(t,c);
        if(a){inp.value='';if(!c||!c.messages){try{window.kgmRestartAi0819I()}catch(_){}c=S.aiConversation0819I;if(c&&c.messages&&!c.grp25&&TRIG.test(t)&&!acct()&&S.user)c.grp25={step:'type',data:{}}}
          var now=new Date().toISOString();c.messages.push({role:'user',text:t,at:now});c.messages.push({role:'assistant',text:a,at:now,srcR1025B:'group'});c.done=!c.grp25;
          try{save()}catch(_){}try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}return}}}catch(e){try{console.warn('grp25 ai',e)}catch(_){}}
    return o.apply(this,arguments)};
  try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}MYAI=w;window.kgmSendAi0819I=w;try{kgmSendAi0819I=w}catch(_){}}
aiWrap();setInterval(aiWrap,2000);   /* 永遠當最外層：其他層（1023A 一般問題）後來再包也會被包回來 */
window.kgmGrpAskAiR1025B=function(){try{if(!S.user){S.view='login';render();return}window.kgmToggleAi0819I&&window.kgmToggleAi0819I();setTimeout(function(){var i=document.getElementById('aiInput');if(i){i.value=z()?'綁定團體帳號':'Group account';window.kgmSendAi0819I&&window.kgmSendAi0819I()}},300)}catch(_){}};

/* ── ② 團體模式（一般訂票流程加條件） ── */
function on(){try{return !!(S.search&&S.search.grp25&&acct()&&S.view!=='admin')}catch(_){return false}}
window.kgmGrpOnR1025B=on;
window.kgmGrpModeR1025B=function(v){S.search=S.search||{};
  if(v){if(!acct()){window.kgmGrpAskAiR1025B();return}S.search.grp25=1;S.search.useMiles=false;S.promoCode='';var n=(+S.search.adults||0)+(+S.search.children||0);if(n<MINP){S.search.adults=Math.max(MINP,+S.search.adults||0);}S.search.infants=Math.min(+S.search.infants||0,+S.search.adults||0)}
  else{S.search.grp25=0;if(+S.search.adults>9)S.search.adults=1;if((+S.search.adults||1)+(+S.search.children||0)>9)S.search.children=0}
  S.openFare=null;try{render()}catch(_){}};
function fam(){return window.KGM_FAM54_R1025B||null}   /* r54 匯出（FAM54 在 r54 的閉包裡） */
var GC={};var CABZ={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙'};
function mkCodes(){if(GC.Economy)return true;var f=fam();if(!f||typeof FARES==='undefined')return false;
  [['Economy','E'],['Premium','P'],['Business','B']].forEach(function(c){var cab=c[0],pre=c[1],F=f[cab];if(!F)return;var bq=(F.Basic||F.Value||[])[0],bu=(F.Value||F.Basic||[])[0];if(!bq||!bu)return;
    GC[cab]={};['Q','U'].forEach(function(k){var code=pre+'-'+k,P=PLANS[k],base=FARES[k==='Q'?bq:bu]||{};
      if(!(FARES[code]&&FARES[code].groupPlanR1026C)){var o=Object.assign({},base,{zh:k+' '+CABZ[cab]+' '+P.zh,en:k+' '+cab+' '+P.en,tier:P.zh+' '+P.en,tierEN:P.en,
          chgZH:'NT$'+P.chg.toLocaleString(),chgEN:'NT$'+P.chg.toLocaleString(),refZH:'NT$'+P.ref.toLocaleString(),refEN:'NT$'+P.ref.toLocaleString(),
          displayCodeR48:k,groupPlanR1026C:k,familyR48:k==='Q'?'Basic':'Value',freeSeat:1,rec:false});   /* 1026C：改票／退票費＝方案金額（每位旅客），changeFeeOf／refundPolicyOf 最外層直接回方案值 */
        if(cab==='Economy')o.bag=k==='Q'?'短程 1×23kg／長程 2×23kg':'2×23kg';
        FARES[code]=o}   /* 基底的 __halfR101 標記要留著（沒有標記的票價表手續費會被 r101 再除一次） */
      GC[cab][k]=code})});
  return !!GC.Economy}
function isG(code){return !!(code&&typeof FARES!=='undefined'&&FARES[code]&&FARES[code].groupPlanR1026C)}
function gcode(cab,k){mkCodes();return GC[cab]&&GC[cab][k||'U']||null}
window.kgmGrpCodeR1025B=gcode;window.kgmGrpCodesR1026C=function(){mkCodes();return GC};window.kgmIsGrpCodeR1026C=isG;
setTimeout(mkCodes,0);setTimeout(mkCodes,1500);setTimeout(mkCodes,6000);
/* 方案清單：團體模式只列 Q／U（這班有的艙等）；一般訂票把 Q／U 拿掉 */
function vcWrap(){var O=window.validCodes;if(typeof O!=='function'||O.__grp27)return;
  var w=function(f){var r=O.apply(this,arguments)||[];try{mkCodes();if(on()&&!window.__grp25raw){var cabs={};r.forEach(function(c){var cb=(FARES[c]||{}).cabin;if(cb)cabs[cb]=1});var out=[];['Economy','Premium','Business'].forEach(function(cb){if(cabs[cb]&&GC[cb])out.push(GC[cb].Q,GC[cb].U)});return out.length?out:r}
      return r.filter(function(c){return !isG(c)})}catch(_){return r}};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp27=1;window.validCodes=w;try{validCodes=w}catch(_){}}
vcWrap();setTimeout(vcWrap,0);setTimeout(vcWrap,3000);setTimeout(vcWrap,12000);
/* 搜尋頁「去程起」與票價卡用 CAB_CODES（每一艙的代號清單）篩 → 團體模式把 Q／U 放在最前面 */
function ccWrap(){var O=window.CAB_CODES;if(typeof O!=='function'||O.__grp27)return;
  var w=function(k){var r=O.apply(this,arguments)||[];try{if(on()&&!window.__grp25raw){mkCodes();var g=GC[k];if(g)return [g.Q,g.U].concat(r)}}catch(_){}return r};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp27=1;window.CAB_CODES=w;try{CAB_CODES=w}catch(_){}}
ccWrap();setTimeout(ccWrap,0);setTimeout(ccWrap,3000);setTimeout(ccWrap,12000);
function seatsLeft(flight,date,cab){var inv={left:0};try{inv=window.kgmCabinInventory54(flight,date,cab)||inv}catch(_){}var left=+inv.left||0;
  if(cab==='Economy'&&window.kgmPaxCapR1025B){try{var pc=window.kgmPaxCapR1025B(flight,date);if(pc&&pc.blocked)left-=pc.blocked}catch(_){}}return Math.max(0,left)}
/* sell54 最前面問這裡（gen_r25 'grp25 sell54'）：團體模式下每一艙只賣「團體」那一個代號，數量＝這一艙整艙空位（扣 Payload 限座） */
window.kgmGrpSellR1025B=function(code,date,flight){
  if(window.__grp25raw||!on())return null;var fi=FARES[code]||{},cab=fi.cabin||'Economy';
  if(cab==='First'||cab==='Resident'||!fi.familyR48)return 0;if(!isG(code))return 0;
  if(flight&&(flight.partner||flight.codeshare))return (cab==='Economy'||cab==='Business')?PARTNER26:0;   /* 1026B：夥伴營運段 —— 聯營團體座位配額 */
  return seatsLeft(flight,date,cab)};
var PARTNER26=30;window.KGM_GRP_PARTNER_R1026B=PARTNER26;
/* 團體票價：這一艙當下一般可賣（1 位）的最低價 × 方案係數（優惠 0.93、彈性 1.08） */
var PC={},PCN=0;
function grpPrice(O,self,f,code,pax){var cab=(FARES[code]||{}).cabin||'Economy',k=[f.code,f.date,f.fr,f.to,code,pax,(S.search||{}).type,(S.search||{}).adults,(S.search||{}).children,(S.search||{}).infants].join('|'),c=PC[k];
  if(c&&Date.now()-c.t<4000)return c.v;var best=null;window.__grp25raw=1;
  try{Object.keys(FARES).forEach(function(cd){var x=FARES[cd];if(!x||x.cabin!==cab||!x.familyR48||x.groupPlanR1026C)return;var s=0;try{s=window.kgmInventory49(cd,f.date,f)}catch(_){s=0}if(!(s>0))return;var p=+O.call(self,f,cd,pax)||0;if(p>0&&(best==null||p<best))best=p})}
  finally{window.__grp25raw=0}
  if(best==null){var fb=gcode(cab,'U');var bc=(fam()||{})[cab];bc=bc&&(bc.Value||bc.Basic||[])[0];window.__grp25raw=1;try{best=+O.call(self,f,bc||fb,pax)||0}finally{window.__grp25raw=0}}var v=Math.round(best*planOf(code).mul);if(++PCN>2000){PC={};PCN=0}PC[k]={t:Date.now(),v:v};return v}
var OW0=null;function owWrap(){var O=window.owPrice;if(typeof O!=='function'||O.__grp25)return;
  var w=function(f,code,pax){if(window.__grp25raw||!f||!f.date||!isG(code))return O.apply(this,arguments);return grpPrice(O,this,f,code,pax)};OW0=O;
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.owPrice=w;try{owPrice=w}catch(_){}}
owWrap();setTimeout(owWrap,0);setTimeout(owWrap,3000);setTimeout(owWrap,12000);
/* 旅客人數：團體模式 10–99（首頁訂票卡的人數選單改成直接輸入） */
function pcWrap(){var O=window.passengerCounts;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){if(!on())return O.apply(this,arguments);var s=S.search,a=Math.max(1,+s.adults||1),c=Math.max(0,+s.children||0),i=Math.max(0,+s.infants||0);if(a+c>MAXP)c=Math.max(0,MAXP-a);if(a>MAXP)a=MAXP;if(i>a)i=a;s.adults=a;s.children=c;s.infants=i;s.pax=a+c;return {adults:a,children:c,infants:i,seats:a+c,total:a+c+i}};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.passengerCounts=w;try{passengerCounts=w}catch(_){}}
pcWrap();setTimeout(pcWrap,0);setTimeout(pcWrap,3000);
function ppWrap(){var O=window.paxPickerHTML;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){if(!on())return O.apply(this,arguments);if(!S.paxPickerOpen)return '';var p=passengerCounts();
    var row=function(k,zh,en,sub){return '<div class="pax-pick-row"><div><b>'+(z()?zh:en)+'</b><small>'+sub+'</small></div><div><input type="number" class="inp k25g-num" min="0" max="'+MAXP+'" value="'+p[k]+'" onchange="kgmGrpPaxR1025B(\''+k+'\',this.value)"></div></div>'};
    return '<div class="pax-pick-pop"><div class="pax-pick-head"><b>'+(z()?'團體人數':'Group size')+'</b><button onclick="S.paxPickerOpen=false;render()">×</button></div>'
      +row('adults','成人','Adults',z()?'12 歲以上':'12+')+row('children','兒童','Children',z()?'2–11 歲・成人票價 75%':'2–11 · 75%')+row('infants','嬰兒','Infants',z()?'未滿 2 歲・不佔位・每位成人 1 位':'under 2 · lap')
      +'<p>'+(z()?'團體 '+MINP+'–'+MAXP+' 位（成人＋兒童）；不到 '+MINP+' 位請切回一般訂票。':MINP+'–'+MAXP+' travellers')+'</p></div>'};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.paxPickerHTML=w;try{paxPickerHTML=w}catch(_){}}
ppWrap();setTimeout(ppWrap,0);setTimeout(ppWrap,3000);
window.kgmGrpPaxR1025B=function(k,v){var n=Math.max(0,Math.min(MAXP,Math.round(+v||0)));S.search[k]=n;if(k==='adults'&&n<1)S.search.adults=1;passengerCounts();S.openFare=null;try{render()}catch(_){}};
/* 搜尋前檢查人數 */
window.kgmGrpPaxOkR1025B=function(){if(!on())return true;var p=passengerCounts();if(p.seats<MINP){alert(z()?'團體訂位至少 '+MINP+' 位（成人＋兒童）。':'At least '+MINP+' travellers.');return false}return true};
/* 首頁兩個搜尋鍵（單程／來回、多航段）最後都是 nav('booking') → 在這裡擋人數不足 */
function navWrap(){var O=window.nav;if(typeof O!=='function'||O.__grp25)return;var w=function(v){if(v==='booking'&&S.view==='home'&&!window.kgmGrpPaxOkR1025B())return;return O.apply(this,arguments)};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.nav=w;try{nav=w}catch(_){}}
navWrap();setTimeout(navWrap,0);setTimeout(navWrap,3000);

/* ③ 旅客資料頁（團體）：團名、類型、領隊；名單之後再給，先以 TBA 保留座位 */
function draft(){var d=S.grpDraftR1025B=S.grpDraftR1025B||{};if(!d.type){var a=acct();d.type=a&&a.type==='agency'?'tour':(a&&a.type)||'tour'}return d}
function firstDate(){var x=null;try{if(S.search.type==='MC'){var m=(S.mcFlights||[]).filter(Boolean)[0];x=m&&m.f&&m.f.date}else x=(S.outF&&S.outF.date)||S.search.dep}catch(_){}return x||S.search.dep}
function curPlan(){var c=null;try{c=S.outC||(S.mcFlights&&S.mcFlights[0]&&S.mcFlights[0].c)}catch(_){}return planOf(c)}
function dues(d0,P){P=P||curPlan();var td=T(),late=days(td,d0)<=P.bal,nl=days(td,d0)<=P.names;return {late:late,balance:late?td:AD(d0,-P.bal),names:nl?(AD(td,1)>AD(d0,-1)?AD(d0,-1):AD(td,1)):AD(d0,-P.names)}}
function pvWrap(){var O=window.paxView;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){if(!on())return O.apply(this,arguments);var a=acct(),d=draft(),p=passengerCounts(),d0=firstDate(),P=curPlan(),du=dues(d0,P);
    var inp=function(k,ph){return '<input class="inp" value="'+E(d[k]||'')+'" placeholder="'+E(ph||'')+'" oninput="S.grpDraftR1025B.'+k+'=this.value">'};
    return '<div class="k25g-pax card"><div class="k25g-ph"><small>GROUP DETAILS</small><h2>'+(z()?'團體資料':'Group details')+'</h2><p>'+(z()?'名單不用現在填：先以 TBA 保留 ':'Names later: ')+p.seats+(z()?' 個座位（'+P.zh+' '+P.k+'），名單（確認人數）最晚 ':' seats held as TBA ('+P.en+'); names due ')+E(du.names)+(z()?' 前提供（出發前 '+P.names+' 天）。':'.')+'</p></div>'
      +'<div class="k25g-acct"><div><small>'+(z()?'團體帳號':'Account')+'</small><b>'+E(a.company)+'</b><span>'+E(typeName(a.type))+' · '+(z()?'統編 ':'Tax ID ')+E(a.taxId)+(a.license?' · '+E(a.license):'')+'</span></div><div><small>'+(z()?'聯絡人':'Contact')+'</small><b>'+E(a.contact.name)+'</b><span>'+E(a.contact.phone)+' · '+E(a.contact.email)+'</span></div><div><small>'+(z()?'人數':'Travellers')+'</small><b>'+p.adults+(z()?' 成人':' adults')+(p.children?' · '+p.children+(z()?' 兒童':' children'):'')+(p.infants?' · '+p.infants+(z()?' 嬰兒':' infants'):'')+'</b><span>'+(z()?'名單期限前可 ±'+P.free+' 位不收手續費':'±'+P.free+' free before names')+'</span></div></div>'
      +'<div class="k25g-grid"><label>'+(z()?'團名':'Group name')+inp('name',z()?'例如：北海道賞雪 7 日':'e.g. Hokkaido 7D')+'</label>'
      +'<label>'+(z()?'團體類型':'Type')+'<select class="inp" onchange="S.grpDraftR1025B.type=this.value">'+[['tour','旅行團','Tour'],['corp','企業／獎勵旅遊','Corporate'],['school','學校／遊學','School'],['other','其他','Other']].map(function(t){return '<option value="'+t[0]+'"'+(d.type===t[0]?' selected':'')+'>'+E(z()?t[1]:t[2])+'</option>'}).join('')+'</select></label>'
      +'<label>'+(z()?'領隊姓名（選填）':'Tour leader (optional)')+inp('leader','')+'</label><label>'+(z()?'領隊電話（選填）':'Leader phone')+inp('leaderPhone','')+'</label>'
      +'<label class="k25g-wide">'+(z()?'備註（餐食、輪椅、特殊需求）':'Notes')+'<textarea class="inp" rows="2" oninput="S.grpDraftR1025B.notes=this.value">'+E(d.notes||'')+'</textarea></label></div>'
      +'<div class="k25g-pay"><div><small>'+(z()?'付款':'Payment')+'</small>'+(du.late?'<b>'+(z()?'出發前 '+P.bal+' 天內：訂位時一次付清':'Within '+P.bal+' days: pay in full')+'</b>':'<b>'+(z()?'訂位時付訂金 10%，尾款最晚 ':'Deposit 10% now, balance by ')+E(du.balance)+'</b><span>'+(z()?'尾款付款連結訂位後立即寄出，未付清前每 7 天提醒一次；逾期未付自動取消並釋出座位（訂金不退）。':'Balance link is sent immediately and reminded weekly.')+'</span>')+'</div>'
      +'<div><small>'+(z()?'團體票規（'+P.zh+' '+P.k+'）':'Group fare rules ('+P.en+')')+'</small><b>'+(z()?'改票每人 NT$'+P.chg.toLocaleString()+'・退票每人 NT$'+P.ref.toLocaleString():'Change NT$'+P.chg.toLocaleString()+' · refund NT$'+P.ref.toLocaleString()+' per person')+'</b><span>'+(z()?'開票後一位旅客一個 PNR；團體旅客不能網路報到（出發當日由領隊或全體旅客到櫃檯辦理）；隨時免費選位（可整團一次劃位）；不能使用酬賓機票、不能參加 Residence 競標'+(P.upg?'；可依「超值」規則申請哩程升等':'；不能申請哩程升等')+'。':'One PNR per traveller; airport check-in only.')+'</span></div></div>'
      +'<div class="k25g-act"><button class="btn btn-o" onclick="S.phase=\''+(S.search.type==='RT'?'sel_inb':'sel_out')+'\';render()">'+(z()?'← 返回選航班':'← Back')+'</button><button class="btn btn-g" onclick="kgmGrpPaxNextR1025B()">'+(z()?'下一步：確認訂位':'Continue')+'</button></div></div>'};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.paxView=w;try{paxView=w}catch(_){}}
pvWrap();setTimeout(pvWrap,0);setTimeout(pvWrap,3000);setTimeout(pvWrap,12000);
window.kgmGrpPaxNextR1025B=function(){var d=draft(),a=acct(),p=passengerCounts();if(!String(d.name||'').trim()){alert(z()?'請填團名。':'Enter the group name.');return}
  var L=[];for(var i=0;i<p.seats;i++){var chd=i>=p.adults;L.push({title:'',lastName:'TBA',firstName:(chd?'CHD':'ADT')+('0'+(i+1)).slice(-2),passengerType:chd?'CHD':'ADT',email:i===0?a.contact.email:'',phone:i===0?a.contact.phone:'',groupNameTbaR1023A:true})}
  for(var j=0;j<p.infants;j++)L.push({title:'',lastName:'TBA',firstName:'INF'+('0'+(j+1)).slice(-2),passengerType:'INF',groupNameTbaR1023A:true});
  S.paxList=L;S.seats={};S.addons=S.addons||{};S.phase='confirm';try{render()}catch(_){}try{window.scrollTo(0,0)}catch(_){}};
/* 付款頁：本次只付訂金 */
function payWrap(){var O=window.payView;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){var h=O.apply(this,arguments);if(!on())return h;var tot=0,cur='TWD';try{var q=journeyPrice();tot=q.total||q.grand||q.amount||0;cur=journeyCurr()}catch(_){}var P=curPlan(),du=dues(firstDate(),P),dep=du.late?tot:Math.round(tot*DEP);
    return '<div class="k25g-paynote"><b>'+(z()?'團體訂位付款':'Group payment')+'</b><span>'+(du.late?(z()?'出發前 '+P.bal+' 天內訂位，本次付清全額。':'Paying in full.'):(z()?'本次信用卡只扣訂金 ':'Card charged deposit ')+'<b>'+M(dep,cur)+'</b>'+(z()?'（10%）；尾款 ':'; balance ')+'<b>'+M(tot-dep,cur)+'</b>'+(z()?' 最晚 '+du.balance+' 前付清，付款連結訂位後立即寄出。':' due '+du.balance))+'</span></div>'+h};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.payView=w;try{payView=w}catch(_){}}
payWrap();setTimeout(payWrap,0);setTimeout(payWrap,3000);
/* 訂位成立 → 團體紀錄＋尾款請款，直接到整團劃位 */
function doPayWrap(){var O=window.doPay;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){var was=on(),before=(S.bookings||[]).length,d=Object.assign({},draft()),pc=null;try{pc=passengerCounts()}catch(_){}
    var r=O.apply(this,arguments);
    if(was){var t0=Date.now();(function poll(){var b=(S.bookings||[]).length>before?S.bookings[S.bookings.length-1]:null;if(b&&b.pnr&&!b.groupR1025B){try{finish(b,d,pc)}catch(e){try{console.warn('grp25 finish',e)}catch(_){}}return}if(Date.now()-t0<15000)setTimeout(poll,150)})()}
    return r};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.doPay=w;try{doPay=w}catch(_){}}
doPayWrap();setTimeout(doPayWrap,0);setTimeout(doPayWrap,3000);
window.kgmGrpFinishR1026C=function(b,d,pc,opt){return finish(b,d,pc,opt)};   /* 1026C：包機／自創航班核准後由後台建立團體訂位（js/cr27.js） */
function newId(){var d=T().replace(/-/g,'').slice(2,6),n=G().length+1;return 'GRP'+d+'-'+String(1000+n).slice(-3)+String.fromCharCode(65+(Date.now()%26))}
function segsOf(b){var o=[];var add=function(key,f,c){if(f&&f.code)o.push({key:key,code:f.code,fr:f.fr,to:f.to,date:f.date,dep:f.dep,arr:f.arr,cls:c})};
  if(b.mcFlights&&b.mcFlights.length){b.mcFlights.forEach(function(m,i){if(m&&m.f){add('mc'+i,m.f,m.c);if(m.f.connF2)add('mc'+i+'b',m.f.connF2,m.c)}})}
  else{add('out',b.outF,b.outC);if(b.outF&&b.outF.connF2)add('out2',b.outF.connF2,b.outC);if(b.inbF){add('inb',b.inbF,b.inbC);if(b.inbF.connF2)add('inb2',b.inbF.connF2,b.inbC)}}return o}
window.kgmGrpSegsR1025B=segsOf;
function mail(ev,g,extra){try{if(typeof kgmNotify!=='function')return;Promise.resolve(kgmNotify(ev,Object.assign({email:g.contact&&g.contact.email||'',groupId:g.id,groupName:g.name,agency:g.company||'',pax:g.pax,pnr:g.pnr||'',name:g.contact&&g.contact.name||''},extra||{}))).catch(function(){})}catch(_){}}
function log(g,act,by){(g.history=g.history||[]).push({at:new Date().toISOString(),act:act,by:by||(S.adminUser?(S.adminUser.empId||S.adminUser.name):'customer')})}
function finish(b,d,pc,opt){
  var a=(opt&&opt.acct)||acct()||{},u=(opt&&opt.user)||me()||{},segs=segsOf(b),d0=segs.length?segs[0].date:T(),P=planOf(b.outC||(segs[0]||{}).cls),du=dues(d0,P),tot=Math.round(+b.total||+b.totalPaid||0),cur=b.curr||b.currency||'TWD',dep=du.late?tot:Math.round(tot*DEP);
  var g={kind:'v25',id:newId(),createdAt:new Date().toISOString(),status:du.late?'paid':'deposit_paid',name:String(d.name||'').trim(),type:d.type||'tour',leader:d.leader||'',leaderPhone:d.leaderPhone||'',notes:d.notes||'',
    userId:u.id||null,company:a.company||'',taxId:a.taxId||'',license:a.license||'',caseNo:a.caseNo||'',contact:a.contact||{},pnr:b.pnr,
    adults:pc?pc.adults:0,children:pc?pc.children:0,infants:pc?pc.infants:0,pax:pc?pc.seats:0,pax0:pc?pc.seats:0,reduced:0,plan:P.k,adj:0,fees:[],moved:[],
    segs:segs,cabin:(FARES[b.outC||(segs[0]||{}).cls]||{}).cabin||'Economy',total:tot,curr:cur,perSeat:pc&&pc.seats?Math.round(tot/pc.seats):0,
    deposit:{amount:dep,paid:true,paidAt:new Date().toISOString()},balance:{amount:tot-dep,paid:tot-dep<=0,due:du.balance,reminders:[]},due:{balance:du.balance,names:du.names},names:[],history:[],legs:segs.map(function(s){return {code:s.code,fr:s.fr,to:s.to,date:s.date,dep:s.dep,arr:s.arr}})};
  b.group=true;b.fareGroup='G';b.groupR1023A={id:g.id,name:g.name,agency:g.company,type:g.type};b.groupR1025B={id:g.id,plan:P.k};b.balanceDue=g.balance.amount;b.paymentMethod=(z()?'團體：訂金 ':'Group deposit ')+M(dep,cur);
  if(g.balance.amount>0){var ch=null;try{ch=window.kgmCreateChargeR45({pnr:b.pnr,items:[{label:'Group balance · '+g.id,amount:g.balance.amount}],note:(z()?'團體尾款，請於 ':'Group balance due ')+du.balance+(z()?' 前付清（出發前 '+P.bal+' 天），逾期自動取消並釋出座位':'')})}catch(_){}
    g.balance.chargeId=ch&&ch.charge&&ch.charge.id;g.balance.token=ch&&ch.charge&&ch.charge.token;g.balance.reminders.push(T())}
  log(g,'團體訂位成立（'+g.pax+' 位，PNR '+b.pnr+'），訂金 '+M(dep,cur),'customer');G().unshift(g);
  if(opt&&opt.quiet){save1();return g}   /* 1026C：包機／自創航班由後台建立 */
  mail('group.booked',g,{amount:tot,currency:cur,message:(z()?'團體訂位已成立，訂金 '+M(dep,cur)+' 已收到。'+(g.balance.amount>0?'尾款 '+M(g.balance.amount,cur)+' 請於 '+du.balance+' 前付清；':'')+'名單請於 '+du.names+' 前提供。請先完成整團劃位。':'Group booked.')});
  S.grpDraftR1025B=null;S.grpViewR1023A={id:g.id};S.grp25Tab='seats';S.view='group23';S.phase=null;save1();try{render()}catch(_){}try{window.scrollTo(0,0)}catch(_){}}

/* ── ④ 整團劃位：每一段從經濟艙後段往前、整排相鄰；也可以進一般選位頁自己調 ── */
function sectionsOf(t){try{return window.seatSections7(t)||[]}catch(_){return []}}
function cabName(c){return {Economy:'Economy',Premium:'Premium',Business:'Business',First:'First'}[c]||c}
window.kgmGrpAutoSeatR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;var b=bk(g.pnr);if(!b)return;var n=g.pax,done=0,miss=[];
  b.seats=b.seats||{};
  var ptn26=[];segsOf(b).forEach(function(s){if(s.partner||s.codeshare||/^KX9[5-9]\d\d$/.test(String(s.code||''))&&isPartner26(s)){ptn26.push(s.code);return}   /* 1026B：夥伴營運段由營運航空在機場劃位 */
    var f=Object.assign({},s,{acft:''});var t='';try{t=acftOfFlight(s.code,s.date,s.fr,s.to)}catch(_){}f.acft=t;
    var taken={};try{Object.assign(taken,simSeatMap(s.code,s.date)||{})}catch(_){}try{Object.assign(taken,realTakenSeats0814(Object.assign({},f),b.pnr)||{})}catch(_){}
    var cab=(FARES[s.cls]||{}).cabin||g.cabin,sec=sectionsOf(t).filter(function(x){return x.name===cabName(cab)})[0];if(!sec){miss.push(s.code);return}
    /* 整排空位最多的排先用（同排相鄰），一樣多就後段優先；同一排內照座位順序（同一邊靠在一起） */
    var rows=[];(sec.rows||[]).forEach(function(r,ri){var f=(r.cells||[]).filter(function(c){return c&&!c.aisle&&c.id&&!taken[c.id]&&!taken[String(c.id).toUpperCase()]}).map(function(c){return c.id});if(f.length)rows.push({i:ri,f:f})});
    rows.sort(function(a,b){return b.f.length-a.f.length||b.i-a.i});
    var pick=[];rows.forEach(function(r){if(pick.length>=n)return;r.f.forEach(function(id2){if(pick.length<n)pick.push(id2)})});
    pick.sort(function(a,b){return (parseInt(a)-parseInt(b))||String(a).localeCompare(String(b))});if(pick.length<n)miss.push(s.code);var o={};pick.forEach(function(id2){o[id2]=true});b.seats[s.key]=o;done++});
  g.seatsAt=new Date().toISOString();g.seatsBy='auto';log(g,'整團劃位（同排相鄰優先）'+done+' 段'+(miss.length?'，座位不足：'+miss.join('、'):'')+(ptn26.length?'；'+ptn26.join('、')+' 由營運航空於報到時劃位':''));save1();S.grpMsgR1025B=(z()?'✓ 已整團劃位 ':'✓ Seated ')+done+(z()?' 段':' segments')+(miss.length?(z()?'（'+miss.join('、')+' 空位不夠整團，請手動調整）':''):'');try{render()}catch(_){}};
function isPartner26(s){try{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];return !!(f&&(f.partner||f.codeshare))}catch(_){return false}}
window.kgmGrpSeatManualR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;try{window.startAcftReseat0809G(g.pnr)}catch(_){}};

/* ── ⑥ 名單、減少人數 ── */
function namesDone(g){return (g.names||[]).filter(function(p){return p&&p.last&&p.first}).length}
window.kgmGrpNamesR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;var b=bk(g.pnr),out=[],bad=[];
  for(var i=0;i<g.pax;i++){var v=function(k){var e=document.getElementById('k25gN'+k+i);return e?String(e.value||'').trim():''};
    var r={last:v('L').toUpperCase().replace(/[^A-Z\- ]/g,''),first:v('F').toUpperCase().replace(/[^A-Z\- ]/g,''),gender:v('G'),dob:v('D'),passport:v('P').toUpperCase(),type:i>=g.adults?'CHD':'ADT'};
    if((r.last&&!r.first)||(!r.last&&r.first))bad.push((i+1)+(z()?'：姓、名都要填':': both names'));if(r.dob&&!/^\d{4}-\d{2}-\d{2}$/.test(r.dob))bad.push((i+1)+(z()?'：生日 YYYY-MM-DD':': DOB'));out.push(r)}
  if(bad.length){S.grpMsgR1025B=bad.slice(0,6).join('　');try{render()}catch(_){}return}
  g.names=out;if(b)out.forEach(function(r,i){var p=b.paxList[i]=b.paxList[i]||{};if(r.last&&r.first){p.lastName=r.last;p.firstName=r.first;p.groupNameTbaR1023A=false}else{p.lastName='TBA';p.firstName=r.type+('0'+(i+1)).slice(-2);p.groupNameTbaR1023A=true}
    p.gender=r.gender;p.dob=r.dob;p.passport=r.passport;p.passengerType=r.type;p.title=r.gender==='F'?(r.type==='CHD'?'MISS':'MS'):(r.gender==='M'?(r.type==='CHD'?'MSTR':'MR'):'')});
  log(g,'名單更新 '+namesDone(g)+'/'+g.pax);S.grpMsgR1025B=(z()?'✓ 已儲存名單 ':'✓ Saved ')+namesDone(g)+' / '+g.pax;maybeTicket(g);save1();try{render()}catch(_){}};
window.kgmGrpPasteR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;var t=String((document.getElementById('k25gPaste')||{}).value||'');
  t.split(/\r?\n/).map(function(l){return l.trim()}).filter(Boolean).forEach(function(l,i){if(i>=g.pax)return;var c=l.split(/\s*[,\t;]\s*/),nm=String(c[0]||'').split('/');
    var set=function(k,v){var e=document.getElementById('k25gN'+k+i);if(e&&v!=null)e.value=v};set('L',nm[0]||'');set('F',nm[1]||'');set('G',(c[1]||'').toUpperCase().charAt(0));set('D',c[2]||'');set('P',c[3]||'')});
  S.grpMsgR1025B=z()?'已貼上，確認後按「儲存名單」':'Pasted — press Save'};
function freeLeft(g){var P=planOf(g);return T()<=g.due.names?Math.max(0,P.free-(g.adj||0)):0}
function canReduce(g){return /deposit_paid|paid/.test(g.status)&&g.pax>1}
function canAdd(g){return /deposit_paid|paid/.test(g.status)&&g.pax+(g.moved||[]).length<MAXP}
/* 尾款重開（人數、艙等變了） */
function rebal(g,b,why){var c=charge(g.balance.chargeId);if(c&&c.status==='unpaid'){try{window.kgmVoidChargeR45(c.id)}catch(_){}}
  var paid=g.deposit.amount+(g.balance.paid?g.balance.amountPaid||g.balance.amount:0)+(g.extraPaid||0),need=Math.max(0,g.total+(g.feeTotal||0)-paid);
  if(g.balance.paid&&need>0){g.extraPaid=(g.extraPaid||0)+(g.balance.amountPaid||g.balance.amount);g.balance.amountPaid=0;g.balance.paid=false;g.status='deposit_paid'}
  if(!g.balance.paid){g.balance.amount=need;if(b)b.balanceDue=need;if(need>0){var ch=null;try{ch=window.kgmCreateChargeR45({pnr:g.pnr,items:[{label:'Group balance · '+g.id,amount:need}],note:(z()?'團體尾款（'+why+'後重開），請於 ':'Group balance due ')+g.due.balance+(z()?' 前付清':'')})}catch(_){}g.balance.chargeId=ch&&ch.charge&&ch.charge.id;g.balance.token=ch&&ch.charge&&ch.charge.token}else{g.balance.paid=true;g.status='paid'}}}
function priceOf(g,s,code){var f=null;try{f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0]}catch(_){}if(!f||!OW0)return 0;f=Object.assign({},f,{date:s.date,dep:s.dep,arr:s.arr});var v=0;try{v=+grpPrice(OW0,null,f,code,1)||0}catch(_){v=0}return v}
function feeIn(g,kind,n,why){var P=planOf(g),unit=kind==='add'?P.chg:P.ref,amt=unit*n;g.fees=g.fees||[];g.fees.push({at:new Date().toISOString(),kind:kind,n:n,unit:unit,amount:amt,why:why||''});g.feeTotal=(g.feeTotal||0)+amt;return amt}
window.kgmGrpReduceR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g||!canReduce(g))return;var b=bk(g.pnr);if(!b)return;var P=planOf(g),fl=freeLeft(g);
  if(!confirm(z()?('減少 1 位？（從名單最後一位開始）\n'+(fl>0?'名單期限前免費名額還有 '+fl+' 位，這一位不收手續費。':'已超過免費名額（或過了名單期限），這一位收退票手續費 NT$'+P.ref.toLocaleString()+'。')):'Remove one traveller?'))return;
  var i=g.pax-1,chd=i>=g.adults;b.paxList.splice(i,1);Object.keys(b.seats||{}).forEach(function(k){var ks=Object.keys(b.seats[k]||{});if(ks.length>i){delete b.seats[k][ks[i]]}});
  if(chd)g.children--;else g.adults--;g.pax--;g.reduced++;if(g.names)g.names.splice(i,1);var fee=0;if(fl>0)g.adj=(g.adj||0)+1;else fee=feeIn(g,'reduce',1,z()?'減少 1 位':'remove 1');
  var unit=chd?0.75:1,cut=Math.round(g.perSeat*unit);g.total=Math.max(0,g.total-cut);b.total=g.total;b.seatPassengerCount=g.pax;b.passengerCounts={adults:g.adults,children:g.children,infants:g.infants};b.search=Object.assign({},b.search,{adults:g.adults,children:g.children,pax:g.pax});
  if(g.balance&&!g.balance.paid)rebal(g,b,z()?'減少人數':'size change');else if(fee>0)rebal(g,b,z()?'減少人數手續費':'fee');
  log(g,'減少 1 位（剩 '+g.pax+' 位'+(fee?'，退票手續費 NT$'+fee.toLocaleString():'，免費名額已用 '+(g.adj||0)+'/'+P.free)+'）');mail('group.reduced',g,{message:(z()?'團體人數減為 '+g.pax+' 位'+(fee?'（收退票手續費 NT$'+fee.toLocaleString()+'）':'（免手續費）')+'，尾款更新為 '+M(g.balance.amount,g.curr):'Group size reduced.')});S.grpMsgR1025B=(z()?'✓ 已減少 1 位，剩 ':'✓ Now ')+g.pax+(z()?' 位':'');save1();try{render()}catch(_){}};

/* 加 1 位：每一段（自營）這一艙要有空位；名單期限前在免費名額內不收手續費，超過收改票手續費 */
window.kgmGrpAddR1026C=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g||!canAdd(g))return;var b=bk(g.pnr);if(!b)return;var P=planOf(g),fl=freeLeft(g);
  var lack=[];segsOf(b).forEach(function(s){if(isPartner26(s))return;var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];if(!f)return;var cab=(FARES[s.cls]||{}).cabin||g.cabin;if(seatsLeft(Object.assign({},f,{date:s.date}),s.date,cab)<1)lack.push(s.code+' '+s.date)});
  if(lack.length){S.grpMsgR1025B=(z()?'今天這些航段已經沒有空位，不能加人：':'No seats on: ')+lack.join('、');try{render()}catch(_){}return}
  if(!confirm(z()?('加 1 位成人？'+(fl>0?'（名單期限前免費名額還有 '+fl+' 位，不收手續費）':'（已超過免費名額或過了名單期限，收改票手續費 NT$'+P.chg.toLocaleString()+'）')+'\n票價每位約 '+M(g.perSeat,g.curr)+'，加進尾款。'):'Add one adult?'))return;
  var i=g.adults;b.paxList.splice(i,0,{title:'',lastName:'TBA',firstName:'ADT'+('0'+(g.pax+1)).slice(-2),passengerType:'ADT',groupNameTbaR1023A:true});if(g.names)g.names.splice(i,0,{});
  g.adults++;g.pax++;g.added=(g.added||0)+1;var fee=0;if(fl>0)g.adj=(g.adj||0)+1;else fee=feeIn(g,'add',1,z()?'加 1 位':'add 1');
  g.total+=g.perSeat;b.total=g.total;b.seatPassengerCount=g.pax;b.passengerCounts={adults:g.adults,children:g.children,infants:g.infants};b.search=Object.assign({},b.search,{adults:g.adults,children:g.children,pax:g.pax});
  rebal(g,b,z()?'加人':'add');log(g,'加 1 位（共 '+g.pax+' 位'+(fee?'，改票手續費 NT$'+fee.toLocaleString():'，免費名額已用 '+(g.adj||0)+'/'+P.free)+'）；請重新整團劃位');
  mail('group.pax_added',g,{message:(z()?'團體人數增為 '+g.pax+' 位'+(fee?'（收改票手續費 NT$'+fee.toLocaleString()+'）':'（免手續費）')+'，尾款更新為 '+M(g.balance.amount,g.curr)+'；新增的旅客請補名單並重新劃位。':'Traveller added.')});
  S.grpMsgR1025B=(z()?'✓ 已加 1 位，共 ':'✓ Now ')+g.pax+(z()?' 位；請重新整團劃位':'');save1();try{render()}catch(_){}};
/* 每位旅客艙等可以不一樣（使用者：「每位旅客艙等可以不一樣」）：名單頁選別的艙等 → 這位旅客拆成自己的訂位（同團、同方案、那一艙的團體代號），
   每一段（自營）那一艙要有空位；差額＝那一艙團體價 − 原本每位，加進（或扣掉）尾款；座位在新艙等自動劃。 */
window.kgmGrpCabinR1026C=function(id,i,cab){var g=G().filter(function(x){return x.id===id})[0];if(!g||/ticketed|cancelled/.test(g.status))return;var b=bk(g.pnr);if(!b)return;
  var r=(g.names||[])[i]||{};if(!r.last||!r.first){S.grpMsgR1025B=z()?'請先填好這位旅客的姓名、儲存名單，再改艙等。':'Save the name first.';try{render()}catch(_){}return}
  if(g.pax<=1){return}var P=planOf(g),nc=gcode(cab,P.k);if(!nc){return}
  var segs=segsOf(b),lack=[],diff=0;segs.forEach(function(s){if(isPartner26(s))return;var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];if(!f)return;if(seatsLeft(Object.assign({},f,{date:s.date}),s.date,cab)<1)lack.push(s.code);diff+=priceOf(g,s,nc)});
  if(lack.length){S.grpMsgR1025B=(z()?CABZ[cab]+'沒有空位：':'No seats: ')+lack.join('、');try{render()}catch(_){}return}
  var chd=i>=g.adults,unit=chd?0.75:1,old=Math.round(g.perSeat*unit),nw=Math.round(diff*unit),d=nw-old;if(g.charterR1026C&&g.kindR1026C!=='custom'){nw=old;d=0}   /* 1026C：包機整架已付，改艙等不另收 */
  if(!confirm(z()?(r.last+'/'+r.first+' 改成'+CABZ[cab]+'？\n'+CABZ[cab]+'團體價約 '+M(nw,g.curr)+'，差額 '+(d>=0?'+':'')+M(d,g.curr)+'（加進尾款）。這位旅客會拆成自己的訂位代號。'):'Move to '+cab+'?'))return;
  var p=b.paxList[i];var c=JSON.parse(JSON.stringify(b));var np='';try{np=genPNR()}catch(_){np='G'+String(Date.now()).slice(-5)}
  c.pnr=np;c.paxList=[p];c.seats={};c.total=nw;c.balanceDue=0;c.passengerCounts={adults:chd?0:1,children:chd?1:0,infants:0};c.seatPassengerCount=1;c.search=Object.assign({},c.search,{adults:chd?0:1,children:chd?1:0,infants:0,pax:1,cabin:cab});
  if(c.outC)c.outC=nc;if(c.inbC)c.inbC=nc;(c.mcFlights||[]).forEach(function(m){if(m)m.c=nc});c.segmentFare0826A=null;c.groupR1025B={id:g.id,plan:P.k,master:g.pnr,cabinMove:1};c.status='confirmed';
  b.paxList.splice(i,1);Object.keys(b.seats||{}).forEach(function(k){var ks=Object.keys(b.seats[k]||{});if(ks.length>i)delete b.seats[k][ks[i]]});g.names.splice(i,1);if(chd)g.children--;else g.adults--;g.pax--;
  b.seatPassengerCount=g.pax;b.passengerCounts={adults:g.adults,children:g.children,infants:g.infants};b.search=Object.assign({},b.search,{adults:g.adults,children:g.children,pax:g.pax});
  S.bookings.push(c);g.moved=g.moved||[];g.moved.push({pnr:np,name:r.last+'/'+r.first,type:chd?'CHD':'ADT',cab:cab,code:nc,amount:nw,at:new Date().toISOString(),names:r});
  g.total+=d;b.total=Math.max(0,b.total-old);rebal(g,b,z()?'艙等調整':'cabin change');
  try{seatOne(c,cab)}catch(_){}
  log(g,r.last+'/'+r.first+' 改'+CABZ[cab]+'（訂位 '+np+'，差額 '+M(d,g.curr)+'）');S.grpMsgR1025B=(z()?'✓ ':'✓ ')+r.last+'/'+r.first+(z()?' 已改'+CABZ[cab]+'，訂位代號 '+np:' moved to '+cab);save1();try{render()}catch(_){}};
function seatOne(c,cab){segsOf(c).forEach(function(s){if(isPartner26(s))return;var t='';try{t=acftOfFlight(s.code,s.date,s.fr,s.to)}catch(_){}var taken={};try{Object.assign(taken,simSeatMap(s.code,s.date)||{})}catch(_){}try{Object.assign(taken,realTakenSeats0814(Object.assign({},s,{acft:t}),c.pnr)||{})}catch(_){}
  var sec=sectionsOf(t).filter(function(x){return x.name===cabName(cab)})[0];if(!sec)return;var pick=null;(sec.rows||[]).some(function(r){return (r.cells||[]).some(function(x){if(x&&!x.aisle&&x.id&&!taken[x.id]){pick=x.id;return true}return false})});if(pick){c.seats[s.key]={};c.seats[s.key][pick]=true}})}

/* ── ⑤⑦ 尾款、提醒、逾期、開票（一人一 PNR） ── */
function charge(id){return (S.chargesR45||[]).filter(function(c){return c&&c.id===id})[0]||null}
window.kgmGrpPayBalR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(g&&g.balance&&g.balance.token&&window.kgmOpenPayR45)window.kgmOpenPayR45(g.balance.token)};
function tno(){return '297'+String(Date.now()).slice(-7)+String(Math.floor(Math.random()*900+100))}
function maybeTicket(g,force){
  if(g.kind!=='v25'||g.status==='ticketed'||g.status==='cancelled')return false;if(!g.balance.paid||namesDone(g)<g.pax)return false;if(g.pax<1&&!(g.moved||[]).length)return false;
  var b=bk(g.pnr);if(!b)return false;var keys=Object.keys(b.seats||{}),pnrs=[],units=g.adults+g.children*0.75||1,infs=(b.paxList||[]).filter(function(p){return String(p.passengerType).toUpperCase()==='INF'}),ai=0;
  (b.paxList||[]).forEach(function(p,i){if(String(p.passengerType).toUpperCase()==='INF')return;var inf=String(p.passengerType).toUpperCase()==='ADT'&&ai<infs.length?infs[ai++]:null;   /* 不佔位嬰兒跟著前幾位成人的 PNR */var np='';try{np=genPNR()}catch(_){np='G'+String(Date.now()+i).slice(-5)}
    var seats={};keys.forEach(function(k){var ks=Object.keys(b.seats[k]||{});if(ks[i]){seats[k]={};seats[k][ks[i]]=true}});
    var unit=String(p.passengerType).toUpperCase()==='CHD'?0.75:1,amt=Math.round(g.total*unit/units);
    var c=JSON.parse(JSON.stringify(b));c.pnr=np;c.paxList=[Object.assign({},p,{ticketR1023A:tno()})].concat(inf?[Object.assign({},inf,{ticketR1023A:tno()})]:[]);c.seats=seats;c.total=amt;c.balanceDue=0;c.passengerCounts={adults:unit===1?1:0,children:unit===1?0:1,infants:inf?1:0};c.seatPassengerCount=1;
    c.search=Object.assign({},c.search,{adults:unit===1?1:0,children:unit===1?0:1,infants:inf?1:0,pax:1});c.ticketNumber=c.paxList[0].ticketR1023A;c.ticket=c.ticketNumber;c.groupR1025B={id:g.id,plan:g.plan||'U',master:g.pnr,index:i};c.bookedAt=b.bookedAt;c.status='confirmed';
    S.bookings.push(c);pnrs.push({pnr:np,name:p.lastName+'/'+p.firstName,ticket:c.ticketNumber,seat:Object.keys(seats).map(function(k){return Object.keys(seats[k])[0]}).join(' '),inf:inf?inf.lastName+'/'+inf.firstName:''})});
  (g.moved||[]).forEach(function(m){var c=bk(m.pnr);if(!c||c.status==='cancelled')return;var tn=tno();(c.paxList||[]).forEach(function(p){p.ticketR1023A=tn});c.ticketNumber=tn;c.ticket=tn;pnrs.push({pnr:m.pnr,name:m.name,ticket:tn,seat:Object.keys(c.seats||{}).map(function(k){return Object.keys(c.seats[k]||{})[0]||''}).join(' '),cab:m.cab})});
  b.status='cancelled';b.cancelledAt=T();b.splitR1025B={at:new Date().toISOString(),into:pnrs.map(function(x){return x.pnr})};b.groupReleasedR1023A=false;
  g.status='ticketed';g.ticketedAt=new Date().toISOString();g.split=pnrs;log(g,'開票：一人一個 PNR，共 '+pnrs.length+' 個'+(force?'（業務手動）':''));
  mail('group.ticketed',g,{message:(z()?'全團 '+pnrs.length+' 位已開票，一位旅客一個 PNR：\n':'Tickets issued:\n')+pnrs.map(function(x){return x.pnr+'　'+x.name+'　'+x.ticket}).join('\n')});return true}
window.kgmGrpTicketR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;if(!maybeTicket(g,1)){S.grpMsgR1025B=z()?'還不能開票：要尾款付清而且名單齊全':'Needs balance paid and complete names'}save1();try{render()}catch(_){}};
function tick(){var ch=false,td=T();
  G().forEach(function(g){if(g.kind!=='v25'||/ticketed|cancelled/.test(g.status))return;var b=bk(g.pnr);
    if(b&&b.status==='cancelled'&&!b.splitR1025B){g.status='cancelled';log(g,'訂位已取消','system');ch=true;return}
    if(g.balance&&!g.balance.paid){var c=charge(g.balance.chargeId);
      if(c&&c.status==='paid'){g.balance.paid=true;g.balance.amountPaid=g.balance.amount;g.balance.paidAt=c.paidAt||new Date().toISOString();g.status='paid';if(b)b.balanceDue=0;log(g,'尾款已付 '+M(g.balance.amount,g.curr),'system');mail('group.balance_paid',g,{amount:g.balance.amount,currency:g.curr,message:z()?'尾款已收到。名單齊全後系統自動開票（一人一個 PNR）。':'Balance received.'});ch=true}
      else if(td>g.due.balance){if(b){b.status='cancelled';b.cancelledAt=td;b.groupReleasedR1023A=true}try{if(c&&c.status==='unpaid')window.kgmVoidChargeR45(c.id)}catch(_){}g.status='cancelled';g.cancelWhy='balance';log(g,'尾款逾期（期限 '+g.due.balance+'），自動取消並釋出座位','system');mail('group.cancelled',g,{message:z()?'尾款未在 '+g.due.balance+' 前付清，團體訂位已取消、座位已釋出（訂金不退）。':'Balance overdue — cancelled.'});ch=true;return}
      else{var last=g.balance.reminders[g.balance.reminders.length-1]||g.createdAt.slice(0,10),left=days(td,g.due.balance);
        if(days(last,td)>=7||((left===3||left===1)&&last!==td)){g.balance.reminders.push(td);mail('group.balance_reminder',g,{amount:g.balance.amount,currency:g.curr,payUrl:c?'#/pay/'+c.token:'',message:(z()?'團體尾款 '+M(g.balance.amount,g.curr)+' 請於 '+g.due.balance+' 前付清（還有 '+left+' 天）。':'Balance due '+g.due.balance)});log(g,'尾款提醒（還有 '+left+' 天）','system');ch=true}}}
    if(namesDone(g)<g.pax){var ln=days(td,g.due.names);g.namesRem=g.namesRem||[];if((ln===7||ln===3||ln===1||ln===0)&&g.namesRem.indexOf(td)<0){g.namesRem.push(td);mail('group.names_reminder',g,{message:(z()?'名單還差 '+(g.pax-namesDone(g))+' 位，請於 '+g.due.names+' 前補齊（姓名須與護照相同）。':'Name list incomplete.')});log(g,'名單提醒（還有 '+ln+' 天）','system');ch=true}}
    if(maybeTicket(g))ch=true});
  if(ch)save1();return ch}
window.kgmGrpTickR1025B=tick;setTimeout(tick,11000);setInterval(function(){try{if(tick())render()}catch(_){}},60000);

/* ── 改票／退票手續費 × 0.75（團體票，訂位上帶 groupR1025B） ── */
function curBk(){try{return S.mgResult||(S.chgPnr&&bk(S.chgPnr))||(S.seatChangePnr&&bk(S.seatChangePnr))||null}catch(_){return null}}
function feeWrap(){
  var C=window.changeFeeOf;if(typeof C==='function'&&!C.__grp25){var w=function(k){if(isG(k))return planOf(k).chg;return C.apply(this,arguments)};   /* 1026C：團體代號（Q／U）＝方案改票費（底下 familyR48 那層會換成基本／超值的費用） */try{Object.keys(C).forEach(function(k){if(!(k in w))w[k]=C[k]})}catch(_){}w.__grp25=1;window.changeFeeOf=w;try{changeFeeOf=w}catch(_){}}
  var R=window.refundPolicyOf;if(typeof R==='function'&&!R.__grp25){var w2=function(k){if(isG(k))return {allowed:true,fee:planOf(k).ref,groupR1025B:1};return R.apply(this,arguments)};try{Object.keys(R).forEach(function(k){if(!(k in w2))w2[k]=R[k]})}catch(_){}w2.__grp25=1;window.refundPolicyOf=w2;try{refundPolicyOf=w2}catch(_){}}}
feeWrap();setTimeout(feeWrap,0);setTimeout(feeWrap,3000);setTimeout(feeWrap,12000);
function feeTxt(g){var P=planOf(g);return (z()?'改票每人 NT$':'Change NT$')+P.chg.toLocaleString()+(z()?'・退票每人 NT$':' · refund NT$')+P.ref.toLocaleString()}
window.kgmGrpFeeTxtR1025B=feeTxt;

/* ── 團體模式畫面標示（訂票卡、選航班頁的票價卡） ── */
function deco(){try{var o=on();document.documentElement.classList.toggle('kgm-grp25',o);document.documentElement.classList.toggle('kgm-grp25b',!!acct());
    if(!o)return;
    /* 選航班頁的票價卡（article.k929-fare）：其他方案（售完）收起來；團體優惠 Q／團體彈性 U 各一張，價格下面加一行方案重點 */
    [].forEach.call(document.querySelectorAll('#app article.k929-fare'),function(el){if(el.getAttribute('data-g25'))return;el.setAttribute('data-g25','1');
      if(el.classList.contains('sold')){el.style.display='none';return}
      var bt=el.querySelector('button[onclick*="pickFare("]'),m=bt?String(bt.getAttribute('onclick')).match(/'([A-Z]-[QU])'/):null,P=m?planOf(m[1]):null;if(!P)return;
      var pr=[].filter.call(el.querySelectorAll('*'),function(e){return e.children.length===0&&/含稅/.test(e.textContent)})[0];
      if(pr&&!el.querySelector('.k25g-fare-tag')){var t=document.createElement('div');t.className='k25g-fare-tag';
        t.textContent=z()?(P.zh+'：名單出發前 '+P.names+' 天・尾款出發前 '+P.bal+' 天・名單前 ±'+P.free+' 位免手續費・改票每人 NT$'+P.chg.toLocaleString()+'／退票每人 NT$'+P.ref.toLocaleString()+(P.upg?'・可申請哩程升等':'')):(P.en+': names '+P.names+'d · balance '+P.bal+'d · ±'+P.free+' free');pr.parentNode.insertBefore(t,pr.nextSibling)}})}catch(_){}}
setInterval(deco,400);
try{var Q=false;new MutationObserver(function(){if(Q)return;Q=true;Promise.resolve().then(function(){Q=false;deco()})}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}

/* ── ⑧ 前台「我的團體訂位」 ── */
var ST={quoted:['已核准・待付訂金','Approved · deposit due','#7A4B00','#FFF4E0'],deposit_paid:['已付訂金・待尾款','Deposit paid','#B26A00','#FFF3E0'],paid:['已付清・待名單','Paid · names due','#0B6B48','#E9F5EF'],ticketed:['已開票','Ticketed','#0B3D2E','#E3EEE9'],cancelled:['已取消','Cancelled','#6B6F6C','#F1F2F1']};
function chip(s){var x=ST[s]||[s,s,'#555','#eee'];return '<span class="k25g-st" style="color:'+x[2]+';background:'+x[3]+'">'+E(z()?x[0]:x[1])+'</span>'}
function seatsCount(g){var b=bk(g.pnr);if(!b)return [0,0];var s=segsOf(b),ok=0;s.forEach(function(x){if(Object.keys((b.seats||{})[x.key]||{}).length>=g.pax)ok++});return [ok,s.length]}
function stepsBar(g){var sc=seatsCount(g),st=[[z()?'訂位・訂金':'Booked',true],[z()?'整團劃位':'Seats',sc[1]&&sc[0]===sc[1]],[z()?'尾款':'Balance',g.balance.paid],[z()?'名單':'Names',namesDone(g)>=g.pax],[z()?'開票（一人一 PNR）':'Tickets',g.status==='ticketed']];
  var cur=st.findIndex(function(x){return !x[1]});return '<ol class="k25g-steps">'+st.map(function(x,i){return '<li class="'+(x[1]?'done':(i===cur?'on':''))+'"><i>'+(x[1]?'✓':i+1)+'</i>'+E(x[0])+'</li>'}).join('')+'</ol>'}
function segTable(g){var b=bk(g.pnr)||{};return '<table class="k25g-t"><thead><tr><th>'+(z()?'航段':'Sector')+'</th><th>'+(z()?'日期':'Date')+'</th><th>'+(z()?'時間':'Time')+'</th><th>'+(z()?'座位':'Seats')+'</th></tr></thead><tbody>'
  +(g.status==='ticketed'?g.segs:segsOf(b)).map(function(s){var n=Object.keys(((b.seats||{})[s.key])||{}).length;return '<tr><td><b>'+E(s.code)+'</b> '+E(s.fr)+' → '+E(s.to)+'<small>'+E(ap(s.fr))+' → '+E(ap(s.to))+'</small></td><td>'+E(s.date)+'</td><td>'+E(s.dep||'')+'–'+E(s.arr||'')+'</td><td>'+(g.status==='ticketed'?'—':(n>=g.pax?'<b class="ok">'+n+' / '+g.pax+'</b>':n+' / '+g.pax))+'</td></tr>'}).join('')+'</tbody></table>'}
function namesEd(g){var rows='';for(var i=0;i<g.pax;i++){var r=(g.names||[])[i]||{},chd=i>=g.adults;
    rows+='<tr><td>'+(i+1)+'<small>'+(chd?(z()?'兒童':'CHD'):(z()?'成人':'ADT'))+'</small></td><td><input id="k25gNL'+i+'" class="inp" value="'+E(r.last||'')+'" placeholder="WANG"></td><td><input id="k25gNF'+i+'" class="inp" value="'+E(r.first||'')+'" placeholder="DAMING"></td>'
      +'<td><select id="k25gNG'+i+'" class="inp"><option value=""></option><option'+(r.gender==='M'?' selected':'')+' value="M">M</option><option'+(r.gender==='F'?' selected':'')+' value="F">F</option></select></td><td><input id="k25gND'+i+'" class="inp" value="'+E(r.dob||'')+'" placeholder="1990-05-20"></td><td><input id="k25gNP'+i+'" class="inp" value="'+E(r.passport||'')+'"></td>'
      +'<td>'+(g.status==='ticketed'?E(cab25(g.cabin)):'<select class="inp" onchange="if(this.value!==\''+g.cabin+'\')kgmGrpCabinR1026C(\''+A(g.id)+'\','+i+',this.value)">'+['Economy','Premium','Business'].filter(function(cb){return GC[cb]}).map(function(cb){return '<option value="'+cb+'"'+(cb===g.cabin?' selected':'')+'>'+E(cab25(cb))+'</option>'}).join('')+'</select>')+'</td></tr>'}
  var mv=(g.moved||[]).length?'<div class="k25g-moved"><b>'+(z()?'已改艙等（各自的訂位代號）':'Moved to another cabin')+'</b>'+(g.moved||[]).map(function(m){return '<span>'+E(m.name)+' · '+E(cab25(m.cab))+' · <i class="mono">'+E(m.pnr)+'</i></span>'}).join('')+'</div>':'';
  return '<p class="k25g-p">'+(z()?'姓名照護照英文拼音（姓、名分開），可以分次填、每次按「儲存名單」。期限 ':'Names as in passport. Due ')+E(g.due.names)+'</p><details class="k25g-paste"><summary>'+(z()?'從 Excel 貼上整份名單':'Paste from spreadsheet')+'</summary><p class="k25g-p">'+(z()?'每行一位：姓/名, 性別, 生日, 護照號碼':'LAST/FIRST, M/F, YYYY-MM-DD, passport')+'</p><textarea id="k25gPaste" class="inp" rows="4"></textarea><button type="button" class="k25g-btn ghost" onclick="kgmGrpPasteR1025B(\''+A(g.id)+'\')">'+(z()?'套用到下表':'Fill')+'</button></details>'
    +'<div class="k25g-scroll"><table class="k25g-t k25g-names"><thead><tr><th>#</th><th>'+(z()?'姓 Last':'Last')+'</th><th>'+(z()?'名 First':'First')+'</th><th>'+(z()?'性別':'Sex')+'</th><th>'+(z()?'生日':'DOB')+'</th><th>'+(z()?'護照號碼':'Passport')+'</th><th>'+(z()?'艙等':'Cabin')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+mv
    +'<div class="k25g-act"><button type="button" class="k25g-btn" onclick="kgmGrpNamesR1025B(\''+A(g.id)+'\')">'+(z()?'儲存名單':'Save names')+'</button></div>'}
/* 前台頁面（使用者：「這頁面還是不好看喔」）：不再是大橫幅＋兩排膠囊＋一張表 ——
   上面一條精簡標頭（團名、狀態、關鍵數字），左邊是行程（每一段一張航段卡，含座位進度）與五個步驟卡（目前要做的那一步展開、其他收合只寫結果），
   右邊固定欄是付款、期限倒數與團體票規。 */
function dleft(d){var n=days(T(),d);return n<0?(z()?'已過期':'overdue'):(n===0?(z()?'今天':'today'):(z()?'還有 '+n+' 天':n+' days'))}
function hm2(s){return E(s||'')}
function itin(g){var b=bk(g.pnr)||{},L=g.status==='ticketed'?g.segs:segsOf(b);
  return L.map(function(s,i){var n=Object.keys(((b.seats||{})[s.key])||{}).length,pct=g.status==='ticketed'?100:Math.round(Math.min(1,n/(g.pax||1))*100),dt=new Date(s.date+'T12:00:00'),wk=z()?'日一二三四五六'.charAt(dt.getDay()):['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
    return '<div class="k25s"><div class="k25s-n">'+(i+1)+'</div><div class="k25s-d"><b>'+E(s.date.slice(5).replace('-','/'))+'</b><small>'+(z()?'週':'')+wk+'</small></div>'
      +'<div class="k25s-r"><div class="k25s-p"><b>'+hm2(s.dep)+'</b><span>'+E(s.fr)+'</span><small>'+E(ap(s.fr))+'</small></div><div class="k25s-line"><i></i><em>✈</em><small>'+E(s.code)+'</small></div><div class="k25s-p r"><b>'+hm2(s.arr)+'</b><span>'+E(s.to)+'</span><small>'+E(ap(s.to))+'</small></div></div>'
      +'<div class="k25s-seat"><small>'+(z()?'座位':'Seats')+'</small><b>'+(g.status==='ticketed'?(z()?'已開票':'Ticketed'):n+' / '+g.pax)+'</b><i><u style="width:'+pct+'%"></u></i></div></div>'}).join('')}
function stepCard(k,num,title,done,summary,body,cur){var open=(S.grp25Tab||cur)===k;
  return '<section class="k25st'+(done?' done':'')+(open?' open':'')+(cur===k?' cur':'')+'"><button type="button" class="k25st-h" onclick="S.grp25Tab=\''+k+'\';S.grpMsgR1025B=\'\';render()"><span class="k25st-i">'+(done?'✓':num)+'</span><span class="k25st-t"><b>'+E(title)+'</b><small>'+summary+'</small></span>'+(cur===k&&!done?'<em>'+(z()?'下一步':'Next')+'</em>':'')+'<s>'+(open?'−':'+')+'</s></button>'+(open?'<div class="k25st-b">'+body+'</div>':'')+'</section>'}
function detailV25(g){var sc=seatsCount(g),nd=namesDone(g),b=bk(g.pnr),act=!/ticketed|cancelled/.test(g.status),d0=(g.segs[0]||{}).date||T();
  if(['booked','seats','pay','names','tickets'].indexOf(S.grp25Tab)<0)S.grp25Tab=null;
  var seatsDone=sc[1]&&sc[0]===sc[1],cur=!seatsDone&&act?'seats':(!g.balance.paid&&act?'pay':(nd<g.pax&&act?'names':'tickets'));
  var seatBody='<p class="k25g-p">'+(z()?'系統會在每一段把整團排在一起：先用整排空位最多的那幾排（同排相鄰），一樣多就從後段開始。要個別換位子，進一般選位頁調整。':'Seats the whole group together on every sector.')+'</p>'
    +(b?segsOf(b).map(function(s){var L=Object.keys(((b.seats||{})[s.key])||{});return '<div class="k25seg"><b>'+E(s.code)+' '+E(s.fr)+'→'+E(s.to)+'</b><span>'+(L.length?L.map(function(x){return '<i>'+E(x)+'</i>'}).join(''):'<em>'+(z()?'尚未劃位':'not seated')+'</em>')+'</span></div>'}).join(''):'')
    +(act?'<div class="k25g-act"><button type="button" class="k25g-btn" onclick="kgmGrpAutoSeatR1025B(\''+A(g.id)+'\')">'+(seatsDone?(z()?'重新整團劃位':'Re-seat'):(z()?'整團相鄰劃位':'Seat the group'))+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpSeatManualR1025B(\''+A(g.id)+'\')">'+(z()?'進入選位頁調整':'Adjust seats')+'</button></div>':'');
  var payBody='<div class="k25pay"><div><small>'+(z()?'訂金 10%':'Deposit')+'</small><b>'+M(g.deposit.amount,g.curr)+'</b><span class="ok">✓ '+(z()?'已付':'Paid')+' '+E(String(g.deposit.paidAt||'').slice(0,10))+'</span></div><div><small>'+(z()?'尾款':'Balance')+'</small><b>'+M(g.balance.amount,g.curr)+'</b><span class="'+(g.balance.paid?'ok':'due')+'">'+(g.balance.paid?'✓ '+(z()?'已付':'Paid'):(z()?'期限 ':'Due ')+E(g.due.balance)+'・'+dleft(g.due.balance))+'</span></div></div>'
    +(g.balance.paid||!act?'':'<div class="k25g-act"><button type="button" class="k25g-btn" onclick="kgmGrpPayBalR1025B(\''+A(g.id)+'\')">'+(z()?'付尾款 ':'Pay ')+M(g.balance.amount,g.curr)+'</button><span class="k25g-p">'+(z()?'付款連結也已寄到 '+E(g.contact&&g.contact.email||'')+'；未付清前每 7 天、期限前 3 天與 1 天提醒，逾期自動取消並釋出座位（訂金不退）。':'')+'</span></div>')
    +((g.balance.reminders||[]).length?'<p class="k25g-p">'+(z()?'已寄提醒：':'Reminders: ')+E(g.balance.reminders.join('、'))+'</p>':'');
  var namesBody=(g.status==='ticketed'?'<p class="k25g-p">'+(z()?'已開票，名單不能再改；個別異動請用各自的 PNR。':'Ticketed.')+'</p>':namesEd(g))
    +(canReduce(g)||canAdd(g)?'<div class="k25g-reduce"><b>'+(z()?'增減人數':'Group size')+'</b><span>'+(z()?(freeLeft(g)>0?'名單期限（'+g.due.names+'）前還有 '+freeLeft(g)+' 位免手續費的增減名額（'+planOf(g).zh+' ±'+planOf(g).free+'）；':'免費名額已用完或過了名單期限；')+'超過的每一位：加人收改票費 NT$'+planOf(g).chg.toLocaleString()+'、減人收退票費 NT$'+planOf(g).ref.toLocaleString()+'。加人要看當天的空位。':'')+'</span>'
      +(canAdd(g)?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAddR1026C(\''+A(g.id)+'\')">'+(z()?'加 1 位':'Add 1')+'</button>':'')+(canReduce(g)?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpReduceR1025B(\''+A(g.id)+'\')">'+(z()?'減少 1 位':'Remove 1')+'</button>':'')+'</div>':'');
  var tickBody=g.status==='ticketed'?('<p class="k25g-p">'+(z()?'一位旅客一個 PNR，可在「行程管理」用各自的 PNR 查詢、免費選位（隨時）、改票（'+E(feeTxt(g))+'）；報到請出發當日到機場櫃檯辦理。':'One PNR per traveller.')+'</p><div class="k25g-scroll"><table class="k25g-t"><thead><tr><th>#</th><th>PNR</th><th>'+(z()?'旅客':'Passenger')+'</th><th>'+(z()?'機票號碼':'Ticket')+'</th><th>'+(z()?'座位':'Seat')+'</th></tr></thead><tbody>'+(g.split||[]).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><b class="mono">'+E(x.pnr)+'</b></td><td>'+E(x.name)+(x.inf?'<small>+ '+E(x.inf)+'</small>':'')+'</td><td class="mono">'+E(x.ticket)+'</td><td class="mono">'+E(x.seat||'—')+'</td></tr>'}).join('')+'</tbody></table></div>')
    :'<p class="k25g-p">'+(z()?'尾款付清、名單齊全後系統自動開票，一位旅客一個 PNR。':'Tickets issue automatically.')+'</p><div class="k25chk"><span class="'+(g.balance.paid?'ok':'')+'">'+(g.balance.paid?'✓':'○')+' '+(z()?'尾款付清':'Balance paid')+'</span><span class="'+(nd>=g.pax?'ok':'')+'">'+(nd>=g.pax?'✓':'○')+' '+(z()?'名單齊全 ':'Names ')+nd+'/'+g.pax+'</span></div>';
  var steps=stepCard('booked',1,z()?'訂位成立・訂金':'Booked',g.deposit.paid!==false,g.deposit.paid===false?((z()?'訂金 ':'Deposit ')+M(g.deposit.amount,g.curr)+(z()?' 待付・期限 ':' due ')+E(g.deposit.due||'')):((z()?'訂金 ':'Deposit ')+M(g.deposit.amount,g.curr)+(z()?' 已付・':' paid · ')+E(String(g.deposit.paidAt||g.createdAt||'').slice(0,10))),'<p class="k25g-p">'+(z()?planOf(g).zh+'（'+planOf(g).k+'）；PNR ':planOf(g).en+'; PNR ')+E(g.pnr)+(z()?'（開票前是整團一筆）。':'.')+'</p>',cur)
    +stepCard('seats',2,z()?'整團劃位':'Seats',seatsDone,(z()?'已劃 ':'Seated ')+sc[0]+' / '+sc[1]+(z()?' 段':' sectors'),seatBody,cur)
    +stepCard('pay',3,z()?'尾款':'Balance',g.balance.paid,g.balance.paid?(z()?'已付清':'Paid'):(M(g.balance.amount,g.curr)+'・'+(z()?'期限 ':'due ')+E(g.due.balance)),payBody,cur)
    +stepCard('names',4,z()?'旅客名單':'Names',nd>=g.pax,nd+' / '+g.pax+'・'+(z()?'期限 ':'due ')+E(g.due.names),namesBody,cur)
    +stepCard('tickets',5,z()?'開票（一人一個 PNR）':'Tickets',g.status==='ticketed',g.status==='ticketed'?(g.split||[]).length+(z()?' 個 PNR 已開票':' PNRs'):(z()?'付清＋名單齊全後自動開票':'Automatic'),tickBody,cur);
  var side='<aside class="k25side"><div class="k25box"><small>'+(z()?'團體總價':'Total')+'</small><b class="big">'+M(g.total,g.curr)+'</b><span>'+g.pax+(z()?' 位・每位約 ':' pax · ~')+M(g.perSeat,g.curr)+'</span><div class="k25bar"><u style="width:'+Math.round((((g.deposit.paid===false?0:g.deposit.amount)+(g.balance.paid?g.balance.amount:0))/(g.total||1))*100)+'%"></u></div><span>'+(z()?'已付 ':'Paid ')+M((g.deposit.paid===false?0:g.deposit.amount)+(g.balance.paid?g.balance.amount:0),g.curr)+'</span>'+(g.deposit.paid===false&&g.deposit.token?'<button type="button" class="k25g-btn full" onclick="kgmOpenPayR45(\''+A(g.deposit.token)+'\')">'+(z()?'付訂金 ':'Pay deposit ')+M(g.deposit.amount,g.curr)+'</button>':'')+(!g.balance.paid&&act&&g.deposit.paid!==false?'<button type="button" class="k25g-btn full" onclick="kgmGrpPayBalR1025B(\''+A(g.id)+'\')">'+(z()?'付尾款 ':'Pay balance ')+M(g.balance.amount,g.curr)+'</button>':'')+'</div>'
    +'<div class="k25box"><small>'+(z()?'期限':'Deadlines')+'</small>'+[[z()?'尾款':'Balance',g.due.balance,g.balance.paid],[z()?'名單':'Names',g.due.names,nd>=g.pax],[z()?'出發':'Departure',d0,false]].map(function(x){return '<div class="k25dl'+(x[2]?' ok':'')+'"><span>'+E(x[0])+'</span><b>'+E(x[1])+'</b><em>'+(x[2]?'✓':dleft(x[1]))+'</em></div>'}).join('')+'</div>'
    +'<div class="k25box"><small>'+(z()?'團體帳號':'Account')+'</small><b>'+E(g.company)+'</b><span>'+E(g.contact&&g.contact.name||'')+' · '+E(g.contact&&g.contact.phone||'')+'</span>'+(g.leader?'<span>'+(z()?'領隊 ':'Leader ')+E(g.leader)+(g.leaderPhone?' · '+E(g.leaderPhone):'')+'</span>':'')+'</div>'
    +'<div class="k25box rules"><small>'+(z()?'團體票規・':'Fare rules · ')+E(z()?planOf(g).zh+' '+planOf(g).k:planOf(g).en)+'</small><ul><li>'+E(feeTxt(g))+'</li><li>'+(z()?'名單期限前 ±'+planOf(g).free+' 位免手續費（已用 '+(g.adj||0)+'）；超過每位收手續費':'±'+planOf(g).free+' free before names')+'</li><li>'+(z()?'訂金不退；尾款逾期自動取消':'Deposit non-refundable')+'</li><li>'+(z()?'不能網路報到：出發當日由領隊或全體旅客到櫃檯辦理':'Airport check-in only')+'</li><li>'+(z()?'隨時免費選位（可整團一次劃位）；座位保留到起飛前 60 分鐘':'Free seat selection any time; seats held until 60 min')+'</li><li>'+(z()?'開票後一人一個 PNR':'One PNR per traveller')+'</li></ul></div></aside>';
  return '<div class="k25top"><div class="k25crumb"><a href="javascript:void 0" onclick="S.grpViewR1023A=null;render()">'+(z()?'我的團體訂位':'My groups')+'</a><span>›</span>'+E(g.id)+'</div>'
    +'<div class="k25top-r"><div><h1>'+E(g.name||'—')+'</h1><p>'+E(g.company)+(g.leader?' · '+(z()?'領隊 ':'Leader ')+E(g.leader):'')+'</p></div>'+chip(g.status)+'</div>'
    +'<div class="k25facts"><div><small>'+(z()?'團體案件編號':'Group case no.')+'</small><b class="mono">'+E(g.id)+'</b><span>'+(g.split?(z()?'已開票：每位旅客一個 PNR':'Ticketed: one PNR each'):(z()?'開票前整團 PNR ':'Group PNR ')+E(g.pnr))+'</span></div><div><small>'+(z()?'人數':'Travellers')+'</small><b>'+g.pax+'</b><span>'+g.adults+(z()?' 成人':' ADT')+(g.children?' · '+g.children+(z()?' 兒童':' CHD'):'')+(g.reduced?(z()?' · 減 ':' · −')+g.reduced:'')+'</span></div><div><small>'+(z()?'出發':'Departs')+'</small><b>'+E(d0)+'</b><span>'+dleft(d0)+'</span></div><div><small>'+(z()?'航段':'Sectors')+'</small><b>'+g.segs.length+'</b><span>'+E(g.segs.map(function(s){return s.fr}).concat([(g.segs[g.segs.length-1]||{}).to]).join(' → '))+'</span></div><div><small>'+(z()?'艙等':'Cabin')+'</small><b>'+E(cab25(g.cabin))+'</b><span>'+(z()?'團體方案':'Group fare')+'</span></div></div></div>'
    +(S.grpMsgR1025B?'<div class="k25g-msg">'+E(S.grpMsgR1025B)+'</div>':'')
    +'<div class="k25cols"><main><section class="k25card"><header><b>'+(z()?'行程':'Itinerary')+'</b><span>'+(z()?'時間為當地時間':'Local times')+'</span></header>'+itin(g)+'</section><div class="k25steps">'+steps+'</div></main>'+side+'</div>'}
function cab25(c){return z()?({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙'})[c]||c:c}
function list(){var u=me(),L=G().filter(function(g){return g.kind==='v25'&&u&&g.userId===u.id});
  var act=L.filter(function(g){return !/ticketed|cancelled/.test(g.status)}),done=L.filter(function(g){return /ticketed|cancelled/.test(g.status)});
  var card=function(g){var sc=seatsCount(g),nd=namesDone(g),d0=(g.segs[0]||{}).date||'',pct=Math.round(((sc[1]&&sc[0]===sc[1]?1:0)+(g.balance.paid?1:0)+(nd>=g.pax?1:0)+(g.status==='ticketed'?1:0)+1)/5*100);
    var nx=g.status==='ticketed'?(z()?'已開票':'Ticketed'):g.status==='cancelled'?(z()?'已取消':'Cancelled'):g.status==='quoted'?(z()?'下一步：付訂金 ':'Next: deposit ')+E(g.deposit&&g.deposit.due||''):!(sc[1]&&sc[0]===sc[1])?(z()?'下一步：整團劃位':'Next: seats'):!g.balance.paid?(z()?'下一步：尾款 ':'Next: balance ')+E(g.due.balance):(z()?'下一步：名單 ':'Next: names ')+nd+'/'+g.pax;
    return '<button type="button" class="k25gc" onclick="S.grpViewR1023A={id:\''+A(g.id)+'\'};S.grp25Tab=null;S.grpMsgR1025B=\'\';render()"><div class="k25gc-d"><b>'+E(d0.slice(5).replace('-','/'))+'</b><small>'+E(d0.slice(0,4))+'</small></div>'
      +'<div class="k25gc-m"><b>'+E(g.name||g.id)+'</b><span class="mono">'+E(g.segs.map(function(s){return s.fr}).concat([(g.segs[g.segs.length-1]||{}).to]).join(' → '))+'</span><small>'+(z()?'案件 ':'Case ')+E(g.id)+' · '+g.pax+(z()?' 位':' pax')+'</small></div>'
      +'<div class="k25gc-p"><span>'+nx+'</span><i><u style="width:'+pct+'%"></u></i></div>'+chip(g.status)+'</button>'};
  return '<div class="k25list">'+(act.length?'<h3>'+(z()?'進行中':'Active')+' · '+act.length+'</h3>'+act.map(card).join(''):'<div class="k25empty"><b>'+(z()?'還沒有進行中的團體訂位':'No active group bookings')+'</b><span>'+(z()?'到首頁訂票卡切換「團體訂位」分頁，選航班跟一般訂票一樣。':'Use the Group tab on the home booking card.')+'</span></div>')
    +(done.length?'<h3>'+(z()?'已開票／已取消':'Ticketed / cancelled')+' · '+done.length+'</h3>'+done.map(card).join(''):'')
+'</div>'}
function viewWrap(){var O=window.kgmGroupViewR1023A;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){var a=acct(),ax=acctAny();
    if(S.user&&!a&&ax&&ax.status!=='revoked')return '<div class="k25g"><section class="k25bind"><div><small>GROUP TRAVEL</small><h1>'+(z()?'團體訂位':'Group booking')+'</h1><p>'+E(ax.company)+' · '+(z()?'案件 ':'Case ')+E(ax.caseNo||'')+'</p></div><div class="k25bind-c"><b>'+(ax.status==='pending'?(z()?'申請審核中':'Awaiting approval'):(z()?'目前不在開放期間':'Outside the booking period'))+'</b><p>'+(ax.status==='pending'?(z()?'AI 客服已核對您的資料，KGM 團體業務核准並設定開放期間後會寄信通知您。':'We will email you once approved.'):(z()?'開放期間 '+E(ax.from||'—')+' ～ '+E(ax.to||'不限')+'。需要延長請聯絡 KGM 團體業務。':'Contact the group desk to extend.'))+'</p></div></section></div>';
    if(!S.user||!a)return '<div class="k25g"><section class="k25bind"><div><small>GROUP TRAVEL</small><h1>'+(z()?'團體訂位':'Group booking')+'</h1><p>'+(z()?'旅行社、企業獎勵旅遊、學校與各類團體，10–99 位同行。':'For 10–99 travellers.')+'</p>'
      +'<ul><li><b>Q</b><span>'+(z()?'團體優惠：名單 28 天、尾款 21 天前，±3 位免手續費':'Group Saver')+'</span></li><li><b>U</b><span>'+(z()?'團體彈性：名單 14 天、尾款 7 天前，±6 位免手續費':'Group Flex')+'</span></li><li><b>10%</b><span>'+(z()?'訂金':'Deposit')+'</span></li><li><b>1:1</b><span>'+(z()?'開票一人一個 PNR':'One PNR each')+'</span></li></ul></div>'
      +'<div class="k25bind-c"><b>'+(z()?'先綁定團體帳號':'Bind a group account')+'</b><p>'+(z()?'由 AI 客服核對類型、名稱、統一編號、（旅行社）執照、聯絡人與電話，綁定到您的會員帳號並給您案件編號；之後首頁訂票卡會出現「團體訂位」分頁。':'The AI assistant verifies your details.')+'</p><button type="button" class="k25g-btn" onclick="kgmGrpAskAiR1025B()">'+(S.user?(z()?'開啟 AI 客服綁定':'Open AI assistant'):(z()?'登入會員':'Sign in'))+'</button></div></section></div>';
    var v=S.grpViewR1023A,g=v?G().filter(function(x){return x.id===v.id&&x.kind==='v25'})[0]:null;
    if(g)return '<div class="k25g">'+detailV25(g)+'</div>';
    return '<div class="k25g"><div class="k25top"><div class="k25top-r"><div><small class="k25eyebrow">GROUP TRAVEL</small><h1>'+(z()?'我的團體訂位':'My group bookings')+'</h1><p>'+E(a.company)+' · '+E(typeName(a.type))+' · '+(z()?'統編 ':'Tax ID ')+E(a.taxId)+' · '+(z()?'綁定案件 ':'Case ')+E(a.caseNo)+'</p></div><div class="k27cr-acts"><button type="button" class="k25g-btn" onclick="nav(\'home\');setTimeout(function(){kgmGrpModeR1025B(1)},50)">'+(z()?'＋ 一般航班團體訂位':'＋ Scheduled flights')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmCharterOpenR1026C(\'charter\')">'+(z()?'包機申請':'Charter')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmCharterOpenR1026C(\'custom\')">'+(z()?'自創航班申請':'Custom flight')+'</button></div></div></div>'+(window.kgmCharterFrontR1026C?window.kgmCharterFrontR1026C():'')+list()+'</div>'};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.kgmGroupViewR1023A=w}
viewWrap();setTimeout(viewWrap,0);setTimeout(viewWrap,3000);

/* ── 後台「團體訂位」頁重做 ── */
window.kgmGrpAdmR1025B=function(act,id,arg){var g=G().filter(function(x){return x.id===id})[0],msg='';
  if(act==='open'){S.grp25AdmOpen=S.grp25AdmOpen===id?'':id;try{render()}catch(_){}return}
  if(act==='filter'){S.grp25AdmF=id;try{render()}catch(_){}return}
  if(act==='unbind'){var why=prompt(z()?'停用這個團體帳號的原因：':'Reason:')||'';if(window.kgmGrpUnbindR1025B(id,why))msg=z()?'已停用團體帳號':'Revoked';S.grp25AdmMsg=msg;try{render()}catch(_){}return}
  if(!g)return;
  if(act==='remind'){mail('group.balance_reminder',g,{amount:g.balance.amount,currency:g.curr,message:(z()?'團體尾款 '+M(g.balance.amount,g.curr)+' 請於 '+g.due.balance+' 前付清。':'Balance reminder')});g.balance.reminders.push(T());log(g,'業務手動寄尾款提醒');msg=z()?'已寄尾款提醒':'Reminder sent'}
  if(act==='namesRemind'){mail('group.names_reminder',g,{message:(z()?'名單還差 '+(g.pax-namesDone(g))+' 位，請於 '+g.due.names+' 前補齊。':'Names reminder')});log(g,'業務手動寄名單提醒');msg=z()?'已寄名單提醒':'Sent'}
  if(act==='extend'){var k=arg||'balance';g.due[k]=AD(g.due[k],3);if(k==='balance')g.balance.due=g.due.balance;log(g,'延長'+(k==='balance'?'尾款':'名單')+'期限至 '+g.due[k]);msg=(z()?'已延長至 ':'Extended to ')+g.due[k]}
  if(act==='ticket'){if(!maybeTicket(g,1))msg=z()?'還不能開票：要尾款付清而且名單齊全':'Needs balance and names';else msg=z()?'✓ 已開票（一人一 PNR）':'✓ Ticketed'}
  if(act==='seat'){window.kgmGrpAutoSeatR1025B(g.id);msg=S.grpMsgR1025B||''}
  if(act==='cancel'){if(!confirm(z()?'確定取消團體 '+g.id+' 並釋出座位？（訂金不退）':'Cancel and release?'))return;var b=bk(g.pnr);if(b){b.status='cancelled';b.cancelledAt=T();b.groupReleasedR1023A=true}var c=g.balance&&charge(g.balance.chargeId);if(c&&c.status==='unpaid')try{window.kgmVoidChargeR45(c.id)}catch(_){}
    g.status='cancelled';g.cancelWhy='desk';log(g,'業務取消並釋位');mail('group.cancelled',g,{message:z()?'團體訂位已取消，座位已釋出。':'Cancelled.'});msg=z()?'已取消並釋位':'Cancelled'}
  if(act==='pnr'){S.adminTab='bookings';try{render()}catch(_){}setTimeout(function(){try{var q=document.getElementById('jPnr');if(q)q.value=arg||g.pnr;window.kgmSearchPnr0819J&&window.kgmSearchPnr0819J()}catch(_){}},150);return}
  if(act==='csv'){var rows=[['#','Last','First','Type','Sex','DOB','Passport','PNR','Ticket']];(g.names||[]).forEach(function(p,i){var s=(g.split||[])[i]||{};rows.push([i+1,p.last,p.first,p.type,p.gender||'',p.dob||'',p.passport||'',s.pnr||g.pnr,s.ticket||''])});
    var csv='﻿'+rows.map(function(r){return r.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=g.id+'_names.csv';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},400);return}
  S.grp25AdmMsg=msg;save1();try{render()}catch(_){}};
function admDesk(){try{tick()}catch(_){}
  var L=G().filter(function(g){return g.kind==='v25'}),f=S.grp25AdmF||'active',open=S.grp25AdmOpen||'',td=T();
  var due=function(g){return !g.balance.paid?g.due.balance:(namesDone(g)<g.pax?g.due.names:'')},late=function(g){var d=due(g);return d&&days(td,d)<=3&&!/ticketed|cancelled/.test(g.status)};
  var cnt={active:L.filter(function(g){return !/ticketed|cancelled/.test(g.status)}).length,bal:L.filter(function(g){return g.status==='deposit_paid'}).length,names:L.filter(function(g){return g.status==='paid'&&namesDone(g)<g.pax}).length,ready:L.filter(function(g){return g.status==='paid'&&namesDone(g)>=g.pax}).length,ticketed:L.filter(function(g){return g.status==='ticketed'}).length,late:L.filter(late).length,all:L.length};
  var show=L.filter(function(g){return f==='all'?true:f==='active'?!/ticketed|cancelled/.test(g.status):f==='bal'?g.status==='deposit_paid':f==='names'?(g.status==='paid'&&namesDone(g)<g.pax):f==='ready'?(g.status==='paid'&&namesDone(g)>=g.pax):f==='late'?late(g):g.status===f});
  var kpi=[['active',z()?'進行中':'Active'],['bal',z()?'待尾款':'Balance due'],['names',z()?'待名單':'Names due'],['ready',z()?'待開票':'Ready'],['late',z()?'3 天內到期':'Due ≤3d'],['ticketed',z()?'已開票':'Ticketed'],['all',z()?'全部':'All']].map(function(k){return '<button type="button" class="'+(f===k[0]?'on':'')+(k[0]==='late'&&cnt.late?' warn':'')+'" onclick="kgmGrpAdmR1025B(\'filter\',\''+k[0]+'\')"><b>'+cnt[k[0]]+'</b><span>'+E(k[1])+'</span></button>'}).join('');
  var rows=show.map(function(g){var o=g.id===open,sc=seatsCount(g),nd=namesDone(g),pct=Math.round((g.balance.paid?1:0)*25+(sc[1]&&sc[0]===sc[1]?25:0)+(nd/g.pax)*25+(g.status==='ticketed'?25:0));
    var tr='<tr class="'+(o?'on':'')+(late(g)?' late':'')+'" onclick="kgmGrpAdmR1025B(\'open\',\''+A(g.id)+'\')"><td><b>'+E(g.name||'—')+'</b><small>'+(z()?'案件 ':'Case ')+E(g.id)+(g.split?'':' · PNR '+E(g.pnr))+'</small></td><td><b>'+E(g.company)+'</b><small>'+E(g.contact&&g.contact.name||'')+' · '+E(g.caseNo||'')+'</small></td>'
      +'<td>'+E(planOf(g).k)+' · '+g.segs.slice(0,3).map(function(s){return '<div>'+E(s.code+' '+s.fr+'→'+s.to)+' <small style="display:inline">'+E(s.date.slice(5))+'</small></div>'}).join('')+'</td><td><b>'+g.pax+'</b><small>'+(g.reduced?(z()?'減 ':'−')+g.reduced:'')+'</small></td><td>'+chip(g.status)+'<div class="k25gd-bar"><i style="width:'+pct+'%"></i></div></td>'
      +'<td>'+(g.balance.paid?'✓':M(g.balance.amount,g.curr))+'<small>'+(g.balance.paid?'':E(g.due.balance))+'</small></td><td>'+nd+'/'+g.pax+'<small>'+E(g.due.names)+'</small></td><td>'+sc[0]+'/'+sc[1]+'</td></tr>';
    if(!o)return tr;
    var acts='<div class="k25g-act">'+(g.status==='deposit_paid'?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'remind\',\''+A(g.id)+'\')">'+(z()?'寄尾款提醒':'Remind balance')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'extend\',\''+A(g.id)+'\',\'balance\')">'+(z()?'尾款期限 +3 天':'Balance +3d')+'</button>':'')
      +(!/ticketed|cancelled/.test(g.status)&&nd<g.pax?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'namesRemind\',\''+A(g.id)+'\')">'+(z()?'寄名單提醒':'Remind names')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'extend\',\''+A(g.id)+'\',\'names\')">'+(z()?'名單期限 +3 天':'Names +3d')+'</button>':'')
      +(!/ticketed|cancelled/.test(g.status)?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'seat\',\''+A(g.id)+'\')">'+(z()?'整團相鄰劃位':'Auto-seat')+'</button><button type="button" class="k25g-btn" onclick="kgmGrpAdmR1025B(\'ticket\',\''+A(g.id)+'\')">'+(z()?'開票（一人一 PNR）':'Ticket')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'cancel\',\''+A(g.id)+'\')">'+(z()?'取消並釋位':'Cancel')+'</button>':'')
      +'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'pnr\',\''+A(g.id)+'\')">'+(z()?'開啟 PNR ':'PNR ')+E(g.pnr)+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'csv\',\''+A(g.id)+'\')">'+(z()?'匯出名單 CSV':'CSV')+'</button></div>';
    var info='<div class="k25gd-info"><div><small>'+(z()?'團體帳號':'Account')+'</small><b>'+E(g.company)+'</b><span>'+(z()?'統編 ':'Tax ')+E(g.taxId)+(g.license?' · '+E(g.license):'')+' · '+E(g.caseNo)+'</span></div><div><small>'+(z()?'聯絡人／領隊':'Contact / leader')+'</small><b>'+E(g.contact&&g.contact.name||'')+'</b><span>'+E(g.contact&&g.contact.phone||'')+' · '+E(g.contact&&g.contact.email||'')+(g.leader?' · '+(z()?'領隊 ':'Leader ')+E(g.leader):'')+'</span></div><div><small>'+(z()?'金額':'Amounts')+'</small><b>'+M(g.total,g.curr)+'</b><span>'+(z()?'訂金 ':'Deposit ')+M(g.deposit.amount,g.curr)+' ✓ · '+(z()?'尾款 ':'Balance ')+(g.balance.paid?'✓':M(g.balance.amount,g.curr)+'（'+E(g.due.balance)+'）')+'</span></div><div><small>'+(z()?'備註':'Notes')+'</small><span>'+E(g.notes||'—')+'</span></div></div>';
    var split=g.split?'<div class="k25g-scroll"><table class="k25g-t"><thead><tr><th>#</th><th>PNR</th><th>'+(z()?'旅客':'Passenger')+'</th><th>'+(z()?'機票':'Ticket')+'</th><th>'+(z()?'座位':'Seat')+'</th></tr></thead><tbody>'+g.split.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><a href="javascript:void 0" onclick="kgmGrpAdmR1025B(\'pnr\',\''+A(g.id)+'\',\''+A(x.pnr)+'\')">'+E(x.pnr)+'</a></td><td>'+E(x.name)+'</td><td>'+E(x.ticket)+'</td><td>'+E(x.seat||'')+'</td></tr>'}).join('')+'</tbody></table></div>':'';
    var hist='<details class="k25gd-h"><summary>'+(z()?'處理紀錄':'History')+' · '+(g.history||[]).length+'</summary>'+(g.history||[]).slice().reverse().map(function(h){return '<div><time>'+E(String(h.at).slice(0,16).replace('T',' '))+'</time> '+E(h.act)+' <small>'+E(h.by||'')+'</small></div>'}).join('')+'</details>';
    return tr+'<tr class="k25gd-open"><td colspan="8" onclick="event.stopPropagation()">'+stepsBar(g)+info+segTable(g)+split+acts+hist+'</td></tr>'}).join('');
  var accts=(S.users||[]).filter(function(u){return u&&u.groupAccountR1025B}),pend=accts.filter(function(u){return u.groupAccountR1025B.status==='pending'});
  var dd=AD(td,365),acform='<div class="k27ga"><div class="k27ga-h"><b>'+(z()?'團體帳號':'Group accounts')+'</b><span>'+(z()?'待核准 ':'Pending ')+pend.length+' · '+(z()?'使用中 ':'Active ')+accts.filter(function(u){return openNow(u.groupAccountR1025B)}).length+'</span>'
      +'<button type="button" class="k25g-btn'+(S.k27gaTab==='add'?'':' ghost')+'" onclick="S.k27gaTab=S.k27gaTab===\'add\'?\'\':\'add\';render()">'+(z()?'＋ 新增用戶（設定開放期間）':'＋ Add user')+'</button></div>'
    +(S.k27gaTab==='add'?'<div class="k27ga-f"><label>'+(z()?'會員編號或 Email':'Member ID / email')+'<input id="k27gU" class="inp"></label><label>'+(z()?'名稱':'Company')+'<input id="k27gC" class="inp"></label><label>'+(z()?'類型':'Type')+'<select id="k27gT" class="inp">'+TYPES.map(function(t){return '<option value="'+t[0]+'">'+E(z()?t[1]:t[2])+'</option>'}).join('')+'</select></label><label>'+(z()?'統一編號':'Tax ID')+'<input id="k27gX" class="inp" maxlength="8"></label><label>'+(z()?'旅行業執照（旅行社）':'Licence')+'<input id="k27gL" class="inp"></label><label>'+(z()?'聯絡人':'Contact')+'<input id="k27gN" class="inp"></label><label>'+(z()?'電話':'Phone')+'<input id="k27gP" class="inp"></label><label>'+(z()?'開放期間：從':'From')+'<input id="k27gF" type="date" class="inp" value="'+td+'"></label><label>'+(z()?'到':'To')+'<input id="k27gE" type="date" class="inp" value="'+dd+'"></label>'
      +'<button type="button" class="k25g-btn" onclick="(function(){var v=function(i){return String((document.getElementById(i)||{}).value||\'\').trim()};var r=kgmGrpAddUserR1026C(v(\'k27gU\'),{company:v(\'k27gC\'),type:v(\'k27gT\'),taxId:v(\'k27gX\'),license:v(\'k27gL\'),contact:v(\'k27gN\'),phone:v(\'k27gP\'),from:v(\'k27gF\'),to:v(\'k27gE\')});S.grp25AdmMsg=r===\'ok\'?\''+(z()?'✓ 已新增團體用戶':'Added')+'\':r===\'nouser\'?\''+(z()?'找不到這個會員':'No such member')+'\':\''+(z()?'請填名稱與正確的統一編號':'Company and valid tax ID required')+'\';if(r===\'ok\')S.k27gaTab=\'\';render()})()">'+(z()?'新增並開放':'Add')+'</button></div>':'')
    +(pend.length?'<div class="k27ga-p">'+pend.map(function(u){var x=u.groupAccountR1025B;return '<div class="k27ga-r"><div><b>'+E(x.company)+'</b><small>'+E(typeName(x.type))+' · '+(z()?'統編 ':'Tax ')+E(x.taxId)+(x.license?' · '+E(x.license):'')+' · '+E(x.contact&&x.contact.name||'')+' '+E(x.contact&&x.contact.phone||'')+' · '+E(u.email||'')+' · '+E(x.caseNo||'')+'</small></div>'
      +'<label>'+(z()?'從':'From')+'<input id="k27gaF'+E(u.id)+'" type="date" class="inp" value="'+td+'"></label><label>'+(z()?'到':'To')+'<input id="k27gaE'+E(u.id)+'" type="date" class="inp" value="'+dd+'"></label>'
      +'<button type="button" class="k25g-btn" onclick="kgmGrpApproveR1026C(\''+A(u.id)+'\',document.getElementById(\'k27gaF'+A(u.id)+'\').value,document.getElementById(\'k27gaE'+A(u.id)+'\').value);S.grp25AdmMsg=\''+(z()?'✓ 已核准':'Approved')+'\';render()">'+(z()?'核准開放':'Approve')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'unbind\',\''+A(u.id)+'\')">'+(z()?'不核准':'Decline')+'</button></div>'}).join('')+'</div>':'')+'</div>';
  var ac='<details class="k25gd-acc"'+(S.grp25AccOpen!==false?' open':'')+' ontoggle="S.grp25AccOpen=this.open"><summary>'+(z()?'團體帳號（AI 客服綁定）':'Group accounts')+' · '+accts.filter(function(u){return u.groupAccountR1025B.status==='active'}).length+'</summary><div class="k25g-scroll"><table class="k25g-t"><thead><tr><th>'+(z()?'名稱／類型':'Name / type')+'</th><th>'+(z()?'統編／執照':'Tax / licence')+'</th><th>'+(z()?'會員／案件':'Member / case')+'</th><th>'+(z()?'狀態':'Status')+'</th><th>'+(z()?'開放期間':'Open period')+'</th><th></th></tr></thead><tbody>'
    +(accts.length?accts.map(function(u){var x=u.groupAccountR1025B;return '<tr><td><b>'+E(x.company)+'</b><small>'+E(typeName(x.type))+' · '+E(x.contact&&x.contact.name||'')+' · '+E(x.contact&&x.contact.phone||'')+'</small></td><td>'+E(x.taxId)+'<small>'+E(x.license||'')+'</small></td><td>'+E(u.email||'')+'<small>'+E(x.caseNo)+' · '+E(String(x.boundAt||'').slice(0,10))+'</small></td><td>'+(x.status==='active'?((x.to&&x.to<T())?(z()?'已過期':'Expired'):(z()?'使用中':'Active')):(z()?'已停用':'Revoked'))+'</td>'
      +'<td class="k27ga-per">'+(x.status==='active'?'<input id="k27gpF'+E(u.id)+'" type="date" class="inp" value="'+E(x.from||'')+'"><span>～</span><input id="k27gpE'+E(u.id)+'" type="date" class="inp" value="'+E(x.to||'')+'"><button type="button" class="k25g-btn ghost" onclick="var r=kgmGrpPeriodR1026C(\''+A(u.id)+'\',document.getElementById(\'k27gpF'+A(u.id)+'\').value,document.getElementById(\'k27gpE'+A(u.id)+'\').value);S.grp25AdmMsg=r?\''+(z()?'✓ 已更新開放期間':'Period updated')+'\':\''+(z()?'結束日期不能早於開始日期':'End before start')+'\';render()">'+(z()?'更新':'Update')+'</button>':E((x.from||'')+(x.to?' ～ '+x.to:'')))+'</td>'   /* 1026C：開放期間可改 */
      +'<td>'+(x.status==='active'?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'unbind\',\''+A(u.id)+'\')">'+(z()?'停用':'Revoke')+'</button>':'')+'</td></tr>'}).join(''):'<tr><td colspan="6" class="k25g-none">'+(z()?'還沒有團體帳號。會員在前台 AI 客服說「綁定團體帳號」即可申請。':'None yet.')+'</td></tr>')+'</tbody></table></div></details>';
  var tabs='<div class="k27gd-tabs"><button type="button" class="'+(S.k27gdTab?'':'on')+'" onclick="S.k27gdTab=\'\';render()">'+(z()?'團體訂位':'Group bookings')+' <i>'+cnt.active+'</i></button><button type="button" class="'+(S.k27gdTab==='acct'?'on':'')+'" onclick="S.k27gdTab=\'acct\';render()">'+(z()?'團體帳號綁定':'Group accounts')+' <i>'+accts.length+'</i></button><button type="button" class="'+(S.k27gdTab==='charter'?'on':'')+'" onclick="S.k27gdTab=\'charter\';render()">'+(z()?'包機／自創航班':'Charter / custom')+' <i>'+((window.kgmCharterPendR1026C&&window.kgmCharterPendR1026C())||0)+'</i></button></div>';
  if(S.k27gdTab==='charter')return '<section class="k25gd">'+tabs+(window.kgmCharterDeskR1026C?window.kgmCharterDeskR1026C():'')+'</section>';
  if(S.k27gdTab==='acct')return acctPage27(tabs);   /* 1026C：卡片版面（js/gq27.js） */
  return '<section class="k25gd">'+tabs+'<header><div><small>GROUP DESK</small><b>'+(z()?'團體訂位':'Group bookings')+'</b></div><span>'+(z()?'團體帳號經前台 AI 客服核對、團體業務核准開放期間；訂位走一般訂票流程，兩個方案：團體優惠 Q（名單 28／尾款 21 天前、±3 位、改 1,400／退 2,600）、團體彈性 U（名單 14／尾款 7 天前、±6 位、改 600／退 1,500）。規章 KGM-GRP-021。':'')+'</span></header>'
    +'<div class="k25gd-kpi">'+kpi+'</div>'+(S.grp25AdmMsg?'<div class="k25g-msg">'+E(S.grp25AdmMsg)+'</div>':'')
    +(show.length?'<div class="k25g-scroll"><table class="k25g-t k25gd-t"><thead><tr><th>'+(z()?'團名':'Group')+'</th><th>'+(z()?'團體帳號':'Account')+'</th><th>'+(z()?'航段':'Sectors')+'</th><th>'+(z()?'人數':'Pax')+'</th><th>'+(z()?'狀態／進度':'Status')+'</th><th>'+(z()?'尾款':'Balance')+'</th><th>'+(z()?'名單':'Names')+'</th><th>'+(z()?'座位':'Seats')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="k25g-none">'+(z()?'這個分類沒有團體訂位。':'Nothing here.')+'</div>')
    +'</section>'}
/* 1026C：「團體帳號綁定」分頁重做（使用者：「這個頁面不夠好看喔」）—— 原本是擠在一張 8 欄表格裡（名稱、類型、狀態、「停用」都被擠成直排）。
   改成卡片：上面標題＋三個數字（待核准／使用中／已過期或停用）＋「新增團體用戶」；待核准一張張卡片（核准時設定開放期間）；
   帳號一個一張卡片：名稱＋類型＋狀態，第二行統編／執照、聯絡人、會員、案件編號，右邊直接改開放期間、停用（已停用的可以重新開放）。功能跟原本相同。 */
function acctPage27(tabs){
  var td=T(),dd=AD(td,365),accts=(S.users||[]).filter(function(u){return u&&u.groupAccountR1025B});
  var st=function(x){return x.status==='pending'?'pend':x.status!=='active'?'off':(x.to&&x.to<td)?'exp':(x.from&&x.from>td)?'soon':'on'};
  var pend=accts.filter(function(u){return st(u.groupAccountR1025B)==='pend'}),act=accts.filter(function(u){return st(u.groupAccountR1025B)==='on'||st(u.groupAccountR1025B)==='soon'}),off=accts.filter(function(u){var k=st(u.groupAccountR1025B);return k==='exp'||k==='off'});
  var flt=S.k27gqF||'all',shown=accts.filter(function(u){var k=st(u.groupAccountR1025B);return k!=='pend'&&(flt==='all'||(flt==='on'&&(k==='on'||k==='soon'))||(flt==='off'&&(k==='exp'||k==='off')))});
  var LAB={on:z()?'使用中':'Active',soon:z()?'尚未開始':'Starts later',exp:z()?'已過期':'Expired',off:z()?'已停用':'Revoked',pend:z()?'待核准':'Pending'};
  var msg=S.grp25AdmMsg||'';if(msg)setTimeout(function(){if(S.grp25AdmMsg===msg){S.grp25AdmMsg='';var e=document.querySelector('.k27gq-msg');if(e)e.remove()}},4500);
  function ini(n){return E(String(n||'?').trim().charAt(0)||'?')}
  function meta(u,x){return '<div class="k27gq-meta"><span><i>'+(z()?'統編':'Tax ID')+'</i>'+E(x.taxId||'—')+(x.license?' · '+E(x.license):'')+'</span><span><i>'+(z()?'聯絡人':'Contact')+'</i>'+E(x.contact&&x.contact.name||'—')+(x.contact&&x.contact.phone?' · '+E(x.contact.phone):'')+'</span><span><i>'+(z()?'會員':'Member')+'</i>'+E(u.email||u.id||'')+'</span><span><i>'+(z()?'案件':'Case')+'</i>'+E(x.caseNo||'—')+(x.boundAt?' · '+E(String(x.boundAt).slice(0,10)):'')+'</span></div>'}
  function per(id,f,t,btn,cls){return '<div class="k27gq-per"><label><i>'+(z()?'開放期間':'Open period')+'</i><span><input id="'+id+'F" type="date" class="inp" value="'+E(f)+'"><b>～</b><input id="'+id+'E" type="date" class="inp" value="'+E(t)+'"></span></label>'+btn+'</div>'}
  var head='<div class="k27gq-hd"><div><small>GROUP ACCOUNTS</small><h3>'+(z()?'團體帳號':'Group accounts')+'</h3><p>'+(z()?'旅行社、企業、學校等團體由前台 AI 客服核對資料後開通；也可以在這裡直接新增會員為團體用戶。開放期間內才能訂團體票。':'Verified by the AI agent, or added here. Group fares only within the open period.')+'</p></div>'
    +'<div class="k27gq-stats"><span class="p"><b>'+pend.length+'</b>'+LAB.pend+'</span><span class="a"><b>'+act.length+'</b>'+LAB.on+'</span><span class="o"><b>'+off.length+'</b>'+(z()?'過期／停用':'Expired / revoked')+'</span></div>'
    +'<button type="button" class="k25g-btn'+(S.k27gaTab==='add'?' ghost':'')+'" onclick="S.k27gaTab=S.k27gaTab===\'add\'?\'\':\'add\';render()">'+(S.k27gaTab==='add'?(z()?'收起':'Close'):(z()?'＋ 新增團體用戶':'＋ Add group user'))+'</button></div>';
  var form=S.k27gaTab==='add'?'<div class="k27gq-card k27gq-add"><h4>'+(z()?'新增團體用戶':'Add a group user')+'</h4><div class="k27gq-grid">'
      +'<label>'+(z()?'會員編號或 Email':'Member ID / email')+'<input id="k27gU" class="inp" placeholder="KGM10000000"></label><label>'+(z()?'團體名稱':'Company')+'<input id="k27gC" class="inp"></label><label>'+(z()?'類型':'Type')+'<select id="k27gT" class="inp">'+TYPES.map(function(t){return '<option value="'+t[0]+'">'+E(z()?t[1]:t[2])+'</option>'}).join('')+'</select></label>'
      +'<label>'+(z()?'統一編號':'Tax ID')+'<input id="k27gX" class="inp" maxlength="8"></label><label>'+(z()?'旅行業執照（旅行社）':'Licence')+'<input id="k27gL" class="inp"></label><label>'+(z()?'聯絡人':'Contact')+'<input id="k27gN" class="inp"></label>'
      +'<label>'+(z()?'電話':'Phone')+'<input id="k27gP" class="inp"></label><label>'+(z()?'開放期間：從':'From')+'<input id="k27gF" type="date" class="inp" value="'+td+'"></label><label>'+(z()?'到':'To')+'<input id="k27gE" type="date" class="inp" value="'+dd+'"></label></div>'
      +'<div class="k27gq-foot"><button type="button" class="k25g-btn ghost" onclick="S.k27gaTab=\'\';render()">'+(z()?'取消':'Cancel')+'</button><button type="button" class="k25g-btn" onclick="(function(){var v=function(i){return String((document.getElementById(i)||{}).value||\'\').trim()};var r=kgmGrpAddUserR1026C(v(\'k27gU\'),{company:v(\'k27gC\'),type:v(\'k27gT\'),taxId:v(\'k27gX\'),license:v(\'k27gL\'),contact:v(\'k27gN\'),phone:v(\'k27gP\'),from:v(\'k27gF\'),to:v(\'k27gE\')});S.grp25AdmMsg=r===\'ok\'?\''+(z()?'✓ 已新增團體用戶':'Added')+'\':r===\'nouser\'?\''+(z()?'找不到這個會員':'No such member')+'\':\''+(z()?'請填團體名稱與正確的統一編號':'Company and valid tax ID required')+'\';if(r===\'ok\')S.k27gaTab=\'\';render()})()">'+(z()?'新增並開放':'Add')+'</button></div></div>':'';
  var pq=pend.length?'<h4 class="k27gq-sec">'+LAB.pend+' <b>'+pend.length+'</b></h4>'+pend.map(function(u){var x=u.groupAccountR1025B,id='k27gaP'+E(u.id);
      return '<div class="k27gq-card pend"><div class="k27gq-av">'+ini(x.company)+'</div><div class="k27gq-main"><div class="k27gq-t"><b>'+E(x.company)+'</b><em>'+E(typeName(x.type))+'</em><s class="pend">'+LAB.pend+'</s></div>'+meta(u,x)+'</div>'
        +per(id,td,dd,'<div class="k27gq-btns"><button type="button" class="k25g-btn" onclick="kgmGrpApproveR1026C(\''+A(u.id)+'\',document.getElementById(\''+id+'F\').value,document.getElementById(\''+id+'E\').value);S.grp25AdmMsg=\''+(z()?'✓ 已核准':'Approved')+'\';render()">'+(z()?'核准開放':'Approve')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'unbind\',\''+A(u.id)+'\')">'+(z()?'不核准':'Decline')+'</button></div>')+'</div>'}).join(''):'';
  var chips=[['all',z()?'全部':'All',accts.length-pend.length],['on',LAB.on,act.length],['off',z()?'過期／停用':'Expired / revoked',off.length]].map(function(c){return '<button type="button" class="'+(flt===c[0]?'on':'')+'" onclick="S.k27gqF=\''+c[0]+'\';render()">'+c[1]+' <i>'+c[2]+'</i></button>'}).join('');
  var list=shown.map(function(u){var x=u.groupAccountR1025B,k=st(x),id='k27gp'+E(u.id),btn;
      if(k==='off')btn='<div class="k27gq-btns"><button type="button" class="k25g-btn" onclick="kgmGrpApproveR1026C(\''+A(u.id)+'\',document.getElementById(\''+id+'F\').value,document.getElementById(\''+id+'E\').value);S.grp25AdmMsg=\''+(z()?'✓ 已重新開放':'Reopened')+'\';render()">'+(z()?'重新開放':'Reopen')+'</button></div>';
      else btn='<div class="k27gq-btns"><button type="button" class="k25g-btn ghost" onclick="var r=kgmGrpPeriodR1026C(\''+A(u.id)+'\',document.getElementById(\''+id+'F\').value,document.getElementById(\''+id+'E\').value);S.grp25AdmMsg=r?\''+(z()?'✓ 已更新開放期間':'Period updated')+'\':\''+(z()?'結束日期不能早於開始日期':'End before start')+'\';render()">'+(z()?'更新期間':'Update')+'</button><button type="button" class="k25g-btn ghost bad" onclick="if(confirm(\''+(z()?'停用這個團體帳號？之後不能再訂團體票（已訂的不受影響）。':'Revoke this group account?')+'\'))kgmGrpAdmR1025B(\'unbind\',\''+A(u.id)+'\')">'+(z()?'停用':'Revoke')+'</button></div>';
      return '<div class="k27gq-card '+k+'"><div class="k27gq-av">'+ini(x.company)+'</div><div class="k27gq-main"><div class="k27gq-t"><b>'+E(x.company)+'</b><em>'+E(typeName(x.type))+'</em><s class="'+k+'">'+LAB[k]+'</s></div>'+meta(u,x)+'</div>'
        +per(id,x.from||td,k==='off'?AD(td,365):(x.to||''),btn)+'</div>'}).join('');
  return '<section class="k25gd">'+tabs+(msg?'<div class="k25g-msg k27gq-msg">'+E(msg)+'</div>':'')+'<div class="k27gq">'+head+form+pq
    +'<div class="k27gq-lh"><h4 class="k27gq-sec">'+(z()?'團體帳號':'Accounts')+'</h4><div class="k27gq-chips">'+chips+'</div></div>'
    +(list||'<div class="k27gq-none">'+(accts.length-pend.length?(z()?'這個分類沒有帳號。':'Nothing here.'):(z()?'還沒有團體帳號。會員在前台 AI 客服說「綁定團體帳號」即可申請，或按右上角「新增團體用戶」。':'No group accounts yet.'))+'</div>')+'</div></section>'}
function deskWrap(){var O=window.kgmGroupDeskPageR1023A;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){var pm='use';try{pm=window.kgmPermR123?window.kgmPermR123('groups23'):'use'}catch(_){}if(pm==='none')return O.apply(this,arguments);
    return '<div class="k23gp">'+admDesk()+'</div>'};   /* 1026C：1023A 舊版團體申請（報價制）拿掉（使用者：「1023A 舊版團體申請（報價制）可移除」） */
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.kgmGroupDeskPageR1023A=w}
deskWrap();setTimeout(deskWrap,0);setTimeout(deskWrap,3000);

/* ── 前台選單「團體訂位」：沒有綁定就不顯示 ── */
function menuHide(){try{var b=!!acct();[].forEach.call(document.querySelectorAll('[onclick*="group23"]'),function(el){if(el.closest&&el.closest('.k25g'))return;var li=el.closest('li')||el;if(!b)li.setAttribute('data-g25hide','1');else li.removeAttribute('data-g25hide')})}catch(_){}}
setInterval(menuHide,800);

var CSS='[data-g25hide]{display:none!important}'
  +'.k27gd-tabs{display:flex;gap:6px;background:#F1F4F2;border-radius:999px;padding:4px;width:max-content;margin:0 0 14px}.k27gd-tabs button{border:0;background:transparent;border-radius:999px;padding:8px 18px;font:700 13px inherit;color:#55605B;cursor:pointer}.k27gd-tabs button.on{background:#0B3D2E;color:#fff}.k27gd-tabs i{font-style:normal;opacity:.75;margin-left:4px}'
  +'.k25gd-acc .k25g-btn{white-space:nowrap}.k25gd-acc td:nth-last-child(-n+3){white-space:nowrap}.k25gd-acc td:first-child{min-width:130px}.k27ga-per{white-space:nowrap}.k27ga-per input{width:138px;height:32px;display:inline-block}.k27ga-per span{margin:0 4px;color:#8A948F}.k27ga-per button{margin-left:6px}'
  +'.k27gq{display:flex;flex-direction:column;gap:12px}.k27gq-hd{display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap;padding:18px 20px;border:1px solid #E4E9E6;border-radius:16px;background:linear-gradient(135deg,#F7FAF8,#FFFFFF)}.k27gq-hd>div:first-child{flex:1;min-width:260px}.k27gq-hd small{font:700 10.5px system-ui,sans-serif;letter-spacing:.14em;color:#9A7B2F}.k27gq-hd h3{margin:2px 0 4px;font-size:19px;color:#0F2A21}.k27gq-hd p{margin:0;font-size:12.5px;color:#66726C;line-height:1.6;max-width:560px}'
  +'.k27gq-stats{display:flex;gap:8px}.k27gq-stats span{display:flex;flex-direction:column;align-items:center;min-width:78px;padding:8px 10px;border-radius:12px;background:#F1F4F2;font-size:11px;color:#66726C}.k27gq-stats b{font:800 20px/1.2 ui-monospace,Menlo,monospace;color:#0F2A21}.k27gq-stats .p{background:#FFF4E2}.k27gq-stats .p b{color:#8A5A12}.k27gq-stats .a{background:#E7F2EC}.k27gq-stats .a b{color:#0B493B}.k27gq-hd>.k25g-btn{align-self:center}'
  +'.k27gq-card{display:flex;align-items:center;gap:16px;padding:14px 16px;border:1px solid #E4E9E6;border-radius:14px;background:#fff;flex-wrap:wrap}.k27gq-card.pend{border-color:#EED9A8;background:#FFFCF4}.k27gq-card.off,.k27gq-card.exp{background:#FAFAF9}.k27gq-card.off .k27gq-t b,.k27gq-card.exp .k27gq-t b{color:#66726C}'
  +'.k27gq-av{flex:none;width:42px;height:42px;border-radius:12px;background:#0B3D2E;color:#E9C46A;display:flex;align-items:center;justify-content:center;font:800 17px system-ui,sans-serif}.k27gq-card.pend .k27gq-av{background:#9A7B2F;color:#fff}.k27gq-card.off .k27gq-av,.k27gq-card.exp .k27gq-av{background:#C9D1CD;color:#fff}'
  +'.k27gq-main{flex:1;min-width:280px}.k27gq-t{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.k27gq-t b{font-size:15px;color:#0F2A21}.k27gq-t em{font-style:normal;font-size:11.5px;padding:2px 8px;border-radius:999px;background:#EEF2F0;color:#3D4944}.k27gq-t s{text-decoration:none;font-size:11.5px;font-weight:700;padding:2px 9px;border-radius:999px}'
  +'.k27gq-t s.on{background:#E5F1EC;color:#0B493B}.k27gq-t s.soon{background:#E8EEF8;color:#2F4F6B}.k27gq-t s.pend{background:#FFF3DC;color:#8A5A12}.k27gq-t s.exp,.k27gq-t s.off{background:#F3E6E2;color:#9A4632}'
  +'.k27gq-meta{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:6px;font-size:12.5px;color:#3D4944}.k27gq-meta i{font-style:normal;font-size:11px;color:#8A948F;margin-right:5px}'
  +'.k27gq-per{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap}.k27gq-per label{display:flex;flex-direction:column;gap:4px}.k27gq-per label>i{font-style:normal;font-size:11px;color:#8A948F;font-weight:700}.k27gq-per label>span{display:flex;align-items:center;gap:6px}.k27gq-per input{width:142px;height:36px}.k27gq-per b{color:#8A948F;font-weight:400}'
  +'.k27gq-btns{display:flex;gap:8px}.k27gq-btns .k25g-btn{white-space:nowrap}.k25g-btn.ghost.bad{color:#B4472F;border-color:#EBC3B8}'
  +'.k27gq-sec{margin:6px 0 0;font-size:14px;color:#0F2A21}.k27gq-sec b{display:inline-block;margin-left:4px;padding:0 8px;border-radius:999px;background:#FFF3DC;color:#8A5A12;font-size:12px}.k27gq-lh{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:4px}'
  +'.k27gq-chips{display:flex;gap:6px}.k27gq-chips button{border:1px solid #D6DED9;background:#fff;border-radius:999px;padding:6px 12px;font:600 12px inherit;color:#3D4944;cursor:pointer}.k27gq-chips button.on{background:#0B3D2E;border-color:#0B3D2E;color:#fff}.k27gq-chips i{font-style:normal;opacity:.7;margin-left:3px}'
  +'.k27gq-add h4{margin:0 0 10px;font-size:14px;color:#0F2A21;flex-basis:100%}.k27gq-add{display:block}.k27gq-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 14px}.k27gq-grid label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700;color:#55605B}.k27gq-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}'
  +'.k27gq-none{padding:22px;border:1px dashed #D6DED9;border-radius:14px;text-align:center;color:#66726C;font-size:13px}'
  +'@media(max-width:760px){.k27gd-tabs{max-width:100%;overflow-x:auto;scrollbar-width:none}.k27gd-tabs button{white-space:nowrap;padding:8px 14px}.k27gq-grid{grid-template-columns:1fr}.k27gq-stats span{min-width:64px}.k27gq-per input{width:128px}}'
  +'.k27ga{border:1px solid #E4E9E6;border-radius:14px;padding:12px 14px;margin:12px 0;background:#FBFCFB}.k27ga-h{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.k27ga-h b{font-size:14px;color:#0F2A21}.k27ga-h span{color:#66726C;font-size:12px;flex:1}'
  +'.k27ga-f{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-top:10px;align-items:end}.k27ga-f label,.k27ga-r label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:#55605B}'
  +'.k27ga-r{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;border-top:1px solid #EEF2EF;padding-top:10px;margin-top:10px}.k27ga-r>div{flex:1;min-width:240px}.k27ga-r small{display:block;color:#66726C;font-size:11.5px;margin-top:2px}'
  +'.k25g-moved{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.5px}.k25g-moved span{background:#F2F6F4;border-radius:999px;padding:3px 10px}'
  +'.k25g{max-width:1180px;margin:0 auto;padding:22px 20px 60px;color:#14231D}'
  +'.k25g-hero{background:linear-gradient(135deg,#0B3D2E,#145A44);color:#fff;border-radius:20px;padding:26px 28px 20px;margin-bottom:14px}.k25g-hero small{letter-spacing:2px;font-size:11px;color:#D6B25E;font-weight:800}.k25g-hero h1{margin:6px 0;font-size:28px}.k25g-hero p{margin:0 0 10px;color:#CFE1D8;font-size:13.5px;line-height:1.7}'
  +'.k25g-card{background:#fff;border:1px solid #E3E8E5;border-radius:16px;padding:16px 18px;margin-bottom:12px}.k25g-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.k25g-head small{font-size:11.5px;letter-spacing:1px;color:#9A7B2F;font-weight:700}.k25g-head h2{margin:4px 0;font-size:22px;color:#0B3D2E}.k25g-head p{margin:0;color:#5F6B66;font-size:13px}'
  +'.k25g-steps{display:flex;gap:8px;list-style:none;margin:0 0 12px;padding:0;flex-wrap:wrap}.k25g-steps li{display:flex;align-items:center;gap:7px;padding:6px 12px 6px 6px;border-radius:999px;background:#F1F4F2;font-size:12.5px;color:#5F6B66}.k25g-steps li i{font-style:normal;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#E1E7E3;font-size:11px;font-weight:800}.k25g-steps li.done{color:#0B6B48}.k25g-steps li.done i{background:#0B6B48;color:#fff}.k25g-steps li.on{background:#0B3D2E;color:#fff;font-weight:800}.k25g-steps li.on i{background:#D6B25E;color:#0B3D2E}'
  +'.k25g-tabs{display:flex;gap:6px;margin:0 0 12px;flex-wrap:wrap}.k25g-tabs button{border:1px solid #D9E0DC;background:#fff;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer;color:#5F6B66}.k25g-tabs button.on{background:#0B3D2E;color:#fff;border-color:#0B3D2E}'
  +'.k25g-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:0 0 12px}.k25g-kpis>div{background:#F8FAF9;border:1px solid #E3E8E5;border-radius:14px;padding:12px 14px}.k25g-kpis small{display:block;font-size:11.5px;color:#7A857F;font-weight:700}.k25g-kpis b{display:block;font-size:19px;color:#0B3D2E;margin:3px 0}.k25g-kpis span{font-size:12px;color:#5F6B66}'
  +'.k25g-t{width:100%;border-collapse:collapse;font-size:13px}.k25g-t th{text-align:left;font-size:11.5px;color:#7A857F;font-weight:700;padding:8px 10px;border-bottom:1px solid #E3E8E5;white-space:nowrap}.k25g-t td{padding:9px 10px;border-bottom:1px solid #EEF1EF;vertical-align:top}.k25g-t td small{display:block;color:#8A948F;font-size:11.5px;margin-top:2px}.k25g-t b.ok{color:#0B6B48}'
  +'.k25g-names td{padding:5px 6px}.k25g-names .inp{min-width:90px;padding:6px 8px;font-size:12.5px}.k25g-scroll{overflow-x:auto}'
  +'.k25g-act{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.k25g-btn{border:0;background:#0B3D2E;color:#fff;border-radius:999px;padding:10px 20px;font-weight:800;cursor:pointer;font-size:13.5px}.k25g-btn.ghost{background:#fff;color:#0B3D2E;border:1px solid #C9D3CE;padding:8px 14px;font-size:12.5px}.k25g-btn.light{background:#D6B25E;color:#0B3D2E}.k25g-btn.light2{background:transparent;color:#fff;border-color:rgba(255,255,255,.4)}'
  +'.k25g-p{font-size:12.5px;color:#6B756F;line-height:1.7;margin:4px 0}.k25g-none{padding:14px;border-radius:10px;background:#F6F7F6;color:#7A857F;font-size:13px}.k25g-msg{margin:0 0 12px;padding:10px 14px;border-radius:12px;background:#FFF6E5;border:1px solid #F0C778;color:#6B4A0E;font-size:13px;font-weight:600}'
  +'.k25g-st{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:800;white-space:nowrap}'
  +'.k25g-row{display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(0,2fr) 60px auto;grid-template-areas:"a b c d" "e e e e";gap:4px 14px;align-items:center;width:100%;text-align:left;border:1px solid #E3E8E5;background:#fff;border-radius:14px;padding:12px 14px;margin-bottom:8px;cursor:pointer;font-family:inherit;color:#14231D}.k25g-row:hover{border-color:#B9CBC2}'
  +'.k25g-row b{font-size:14px;color:#0B3D2E}.k25g-row small{display:block;font-size:11.5px;color:#7A857F}.k25g-row span{display:inline-block;margin-right:10px;font-size:12.5px;font-family:ui-monospace,Menlo,monospace}.k25g-row span i{font-style:normal;color:#9A7B2F}.k25g-mini{grid-area:e;font-size:11.5px;color:#6B756F}'
  +'.k25g-rules2{margin-top:12px;padding:12px 14px;border-radius:12px;background:#F7F5EF;border:1px solid #EAE3CF;font-size:12.5px;color:#4A4535;line-height:1.7}.k25g-rules2 b{display:block;color:#0B3D2E}'
  +'.k25g-reduce{margin-top:12px;padding:12px 14px;border-radius:12px;background:#F8FAF9;border:1px solid #E3E8E5;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12.5px}.k25g-reduce b{color:#0B3D2E}.k25g-reduce span{flex:1;min-width:240px;color:#5F6B66}'
  +'.k25g-paste{margin:8px 0}.k25g-paste summary{cursor:pointer;font-size:12.5px;font-weight:700;color:#0B3D2E}.k25g-paste textarea{width:100%;margin:6px 0}'
  +'.k25g-bindc b{font-size:16px;color:#0B3D2E}'
  +'.k25g-pax{padding:22px 24px}.k25g-ph small{letter-spacing:2px;font-size:10.5px;color:#9A7B2F;font-weight:800}.k25g-ph h2{margin:4px 0;color:#0B3D2E}.k25g-ph p{margin:0 0 14px;color:#5F6B66;font-size:13px}'
  +'.k25g-acct{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:14px}.k25g-acct>div,.k25g-pay>div{background:#F8FAF9;border:1px solid #E3E8E5;border-radius:12px;padding:10px 12px}.k25g-acct small,.k25g-pay small{display:block;font-size:11px;color:#7A857F;font-weight:700}.k25g-acct b,.k25g-pay b{display:block;color:#0B3D2E;font-size:14px;margin:2px 0}.k25g-acct span,.k25g-pay span{font-size:12px;color:#5F6B66;line-height:1.6}'
  +'.k25g-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px 12px}.k25g-grid label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:#5F6B66;font-weight:600}.k25g-wide{grid-column:1/-1}'
  +'.k25g-pay{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-top:14px}'
  +'.k25g-paynote{display:flex;flex-direction:column;gap:4px;margin:0 0 12px;padding:12px 16px;border-radius:12px;background:#FFF6E5;border:1px solid #F0C778;color:#6B4A0E;font-size:13px}.k25g-paynote>b{color:#0B3D2E}'
  +'.k25g-num{width:84px;text-align:center}.k25g-fare-tag{margin:6px 0 2px;padding:5px 9px;border-radius:8px;background:#FFF6E5;color:#8A5A12;font-size:11.5px;font-weight:700;line-height:1.4}'
  +'.k25gd{background:#fff;border:1px solid #E3E8E5;border-radius:16px;padding:16px 18px;margin:0 0 14px}.k25gd>header{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:10px;flex-wrap:wrap}.k25gd>header small{display:block;font-size:10.5px;letter-spacing:2px;color:#9A7B2F;font-weight:800}.k25gd>header b{font-size:19px;color:#0B3D2E}.k25gd>header span{font-size:12px;color:#7A857F;max-width:640px;line-height:1.6}'
  +'.k25gd-kpi{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.k25gd-kpi button{border:1px solid #E3E8E5;background:#F8FAF9;border-radius:12px;padding:8px 14px;cursor:pointer;text-align:left;min-width:96px}.k25gd-kpi button b{display:block;font-size:19px;color:#0B3D2E}.k25gd-kpi button span{font-size:11.5px;color:#6B756F}.k25gd-kpi button.on{background:#0B3D2E;border-color:#0B3D2E}.k25gd-kpi button.on b,.k25gd-kpi button.on span{color:#fff}.k25gd-kpi button.warn b{color:#B4472F}'
  +'.k25gd-t tbody tr{cursor:pointer}.k25gd-t tbody tr:hover td{background:#FAFBFA}.k25gd-t tr.on td{background:#F3F7F5}.k25gd-t tr.late td:first-child{box-shadow:inset 3px 0 0 #C0392B}'
  +'.k25gd-bar{height:5px;border-radius:99px;background:#EDF1EF;margin-top:6px;overflow:hidden;width:110px}.k25gd-bar i{display:block;height:100%;background:#0B6B48}'
  +'.k25gd-open>td{background:#F8FAF9;cursor:default;padding:14px}.k25gd-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:0 0 10px}.k25gd-info>div{background:#fff;border:1px solid #E3E8E5;border-radius:12px;padding:10px 12px;font-size:12.5px}.k25gd-info small{display:block;color:#7A857F;font-weight:700;font-size:11px}.k25gd-info b{display:block;color:#0B3D2E}'
  +'.k25gd-h{margin-top:10px;font-size:12px;color:#5F6B66}.k25gd-h summary{cursor:pointer;font-weight:700}.k25gd-h div{padding:3px 0}.k25gd-h time{color:#8A948F}'
  +'.k25gd-acc,.k25gd-old{margin-top:14px;border:1px solid #E3E8E5;border-radius:14px;padding:10px 14px;background:#fff}.k25gd-acc summary,.k25gd-old summary{cursor:pointer;font-weight:800;color:#0B3D2E;font-size:13.5px}'
  +'html.kgm-grp25 .k25g-banner25{display:flex}'
  /* 1025B 前台團體頁（第二版） */
  +'.k25g .mono{font-family:ui-monospace,Menlo,monospace}'
  +'.k25top{background:#fff;border:1px solid #E3E8E5;border-radius:18px;padding:18px 22px;margin-bottom:14px;box-shadow:0 1px 2px rgba(16,40,30,.04)}'
  +'.k25crumb{font-size:12px;color:#7A857F;display:flex;gap:6px;align-items:center;margin-bottom:6px}.k25crumb a{color:#0B6B48;font-weight:700;text-decoration:none}'
  +'.k25top-r{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}.k25top-r h1{margin:2px 0;font-size:24px;color:#0B3D2E}.k25top-r p{margin:0;color:#5F6B66;font-size:13px}.k25eyebrow{font-size:10.5px;letter-spacing:2px;color:#9A7B2F;font-weight:800}'
  +'.k25facts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;margin-top:14px;border-top:1px solid #EEF1EF;padding-top:12px}.k25facts>div{padding:0 14px;border-left:1px solid #EEF1EF}.k25facts>div:first-child{border-left:0;padding-left:0}'
  +'.k25facts small{display:block;font-size:10.5px;color:#7A857F;letter-spacing:.06em;font-weight:700}.k25facts b{display:block;font-size:17px;color:#0F2A21;margin-top:2px}.k25facts span{font-size:11.5px;color:#6B756F}'
  +'.k25cols{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start}.k25side{position:sticky;top:76px;display:flex;flex-direction:column;gap:12px}'
  +'.k25card{background:#fff;border:1px solid #E3E8E5;border-radius:16px;padding:14px 16px;margin-bottom:12px}.k25card>header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}.k25card>header b{color:#0B3D2E;font-size:14.5px}.k25card>header span{font-size:11.5px;color:#7A857F}'
  +'.k25s{display:grid;grid-template-columns:26px 54px minmax(0,1fr) 120px;gap:12px;align-items:center;padding:12px 4px;border-top:1px solid #F0F3F1}.k25s:first-of-type{border-top:0}'
  +'.k25s-n{width:24px;height:24px;border-radius:50%;background:#EAF1ED;color:#0B3D2E;font-size:11px;font-weight:800;display:grid;place-items:center}.k25s-d b{display:block;font:800 15px ui-monospace,Menlo,monospace;color:#0B3D2E}.k25s-d small{font-size:11px;color:#9A7B2F;font-weight:700}'
  +'.k25s-r{display:grid;grid-template-columns:auto minmax(60px,1fr) auto;gap:10px;align-items:center}.k25s-p b{display:block;font:800 20px/1.1 ui-monospace,Menlo,monospace;color:#0F2A21}.k25s-p span{font:700 12.5px ui-monospace,Menlo,monospace;color:#0B3D2E}.k25s-p small{display:block;font-size:11px;color:#7A857F}.k25s-p.r{text-align:right}'
  +'.k25s-line{position:relative;text-align:center;height:34px}.k25s-line i{position:absolute;left:0;right:0;top:12px;border-top:1.5px dashed #C9D3CE}.k25s-line em{position:relative;font-style:normal;background:#fff;padding:0 6px;color:#9A7B2F}.k25s-line small{display:block;font:700 11px ui-monospace,Menlo,monospace;color:#5F6B66;margin-top:2px}'
  +'.k25s-seat small{display:block;font-size:10.5px;color:#7A857F;font-weight:700}.k25s-seat b{font-size:14px;color:#0F2A21}.k25s-seat i,.k25gc-p i,.k25bar{display:block;height:6px;border-radius:99px;background:#EDF1EF;margin-top:5px;overflow:hidden}.k25s-seat u,.k25gc-p u,.k25bar u{display:block;height:100%;background:#0B6B48;border-radius:99px}'
  +'.k25steps{display:flex;flex-direction:column;gap:8px}.k25st{background:#fff;border:1px solid #E3E8E5;border-radius:14px;overflow:hidden}.k25st.cur{border-color:#0B3D2E;box-shadow:0 4px 16px rgba(11,61,46,.08)}'
  +'.k25st-h{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border:0;background:none;cursor:pointer;text-align:left;font-family:inherit;color:#14231D}'
  +'.k25st-i{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12.5px;font-weight:800;background:#F1F4F2;color:#5F6B66;flex:none}.k25st.done .k25st-i{background:#0B6B48;color:#fff}.k25st.cur:not(.done) .k25st-i{background:#0B3D2E;color:#E9C46A}'
  +'.k25st-t{flex:1;min-width:0}.k25st-t b{display:block;font-size:14px;color:#0B3D2E}.k25st-t small{display:block;font-size:12px;color:#6B756F;margin-top:1px}.k25st-h em{font-style:normal;font-size:11px;font-weight:800;color:#8A5A12;background:#FFF3DC;padding:3px 9px;border-radius:999px}.k25st-h s{text-decoration:none;color:#9AA3A0;font-size:18px;width:18px;text-align:center}'
  +'.k25st-b{padding:2px 16px 16px 54px;border-top:1px solid #F0F3F1}'
  +'.k25seg{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px dashed #EEF1EF;font-size:12.5px}.k25seg>b{min-width:150px;color:#0B3D2E;font-family:ui-monospace,Menlo,monospace}.k25seg span{display:flex;flex-wrap:wrap;gap:4px}.k25seg i{font-style:normal;font:700 11px ui-monospace,Menlo,monospace;padding:2px 6px;border-radius:6px;background:#EAF1ED;color:#0B3D2E}.k25seg em{font-style:normal;color:#9AA3A0}'
  +'.k25pay{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}.k25pay>div{background:#F8FAF9;border:1px solid #E3E8E5;border-radius:12px;padding:10px 12px}.k25pay small{display:block;font-size:11px;color:#7A857F;font-weight:700}.k25pay b{display:block;font-size:18px;color:#0F2A21;margin:2px 0}.k25pay span{font-size:12px}.k25pay .ok,.k25chk .ok{color:#0B6B48;font-weight:700}.k25pay .due{color:#8A5A12;font-weight:700}'
  +'.k25chk{display:flex;gap:16px;font-size:13px;color:#7A857F;margin-top:6px}'
  +'.k25box{background:#fff;border:1px solid #E3E8E5;border-radius:16px;padding:14px 16px}.k25box>small{display:block;font-size:10.5px;letter-spacing:.1em;color:#9A7B2F;font-weight:800;margin-bottom:6px}.k25box>b{display:block;font-size:14px;color:#0B3D2E}.k25box>b.big{font-size:22px;font-family:ui-monospace,Menlo,monospace}.k25box>span{display:block;font-size:12px;color:#6B756F;margin-top:3px}'
  +'.k25bar{margin:10px 0 2px}.k25g-btn.full{width:100%;margin-top:12px}'
  +'.k25dl{display:grid;grid-template-columns:48px 1fr auto;gap:8px;align-items:center;padding:7px 0;border-top:1px solid #F0F3F1;font-size:12.5px}.k25dl:first-of-type{border-top:0}.k25dl span{color:#7A857F}.k25dl b{font-family:ui-monospace,Menlo,monospace;color:#0F2A21}.k25dl em{font-style:normal;font-size:11px;font-weight:800;color:#8A5A12}.k25dl.ok em{color:#0B6B48}'
  +'.k25box.rules ul{margin:0;padding-left:16px;font-size:12px;color:#4A4535;line-height:1.7}'
  +'.k25list h3{font-size:13px;color:#7A857F;margin:16px 4px 8px;letter-spacing:.04em}'
  +'.k25gc{display:grid;grid-template-columns:62px minmax(0,1fr) 220px auto;gap:16px;align-items:center;width:100%;text-align:left;background:#fff;border:1px solid #E3E8E5;border-radius:16px;padding:14px 18px;margin-bottom:10px;cursor:pointer;font-family:inherit;color:#14231D;transition:border-color .15s,box-shadow .15s}.k25gc:hover{border-color:#B9CBC2;box-shadow:0 6px 18px rgba(16,40,30,.07)}'
  +'.k25gc-d{text-align:center;border-right:1px solid #EEF1EF;padding-right:12px}.k25gc-d b{display:block;font:800 18px ui-monospace,Menlo,monospace;color:#0B3D2E}.k25gc-d small{font-size:11px;color:#9A7B2F;font-weight:700}'
  +'.k25gc-m b{display:block;font-size:15px;color:#0B3D2E}.k25gc-m span{display:block;font-size:12.5px;color:#14231D;margin-top:2px}.k25gc-m small{display:block;font-size:11.5px;color:#7A857F;margin-top:2px}.k25gc-p span{font-size:12px;color:#5F6B66;font-weight:600}'
  +'.k25empty{background:#fff;border:1px dashed #C9D3CE;border-radius:16px;padding:22px;text-align:center}.k25empty b{display:block;color:#0B3D2E;font-size:15px}.k25empty span{font-size:12.5px;color:#7A857F}'
  +'.k25bind{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:16px;background:linear-gradient(135deg,#0B3D2E,#145A44);color:#fff;border-radius:20px;padding:26px 28px}.k25bind small{letter-spacing:2px;font-size:11px;color:#D6B25E;font-weight:800}.k25bind h1{margin:6px 0;font-size:28px}.k25bind p{color:#CFE1D8;font-size:13.5px;line-height:1.7;margin:0 0 14px}'
  +'.k25bind ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:10px}.k25bind li{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px 12px}.k25bind li b{display:block;font:800 18px ui-monospace,Menlo,monospace;color:#E9C46A}.k25bind li span{font-size:12px;color:#CFE1D8}'
  +'.k25bind-c{background:#fff;color:#14231D;border-radius:16px;padding:18px}.k25bind-c b{font-size:16px;color:#0B3D2E}.k25bind-c p{color:#5F6B66;font-size:13px}'
  +'@media(max-width:900px){.k25cols,.k25bind{grid-template-columns:1fr}.k25side{position:static}.k25facts{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:10px}.k25s{grid-template-columns:26px 48px minmax(0,1fr)}.k25s-seat{grid-column:2/-1}.k25gc{grid-template-columns:56px minmax(0,1fr)}.k25gc-p{grid-column:1/-1}.k25st-b{padding-left:16px}}';
try{var st=document.createElement('style');st.id='k25-css-g';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();

