
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
var DISC=0.05,DEP=0.10,FEE=0.75,MINP=10,MAXP=99,RED=3,NAMES_D=14,BAL_D=14;
window.KGM_GRP_RULES_R1025B={disc:DISC,deposit:DEP,fee:FEE,min:MINP,max:MAXP,reduce:RED,namesDays:NAMES_D,balanceDays:BAL_D};
var TYPES=[['agency','旅行社','Travel agency'],['corp','企業／獎勵旅遊','Corporate / incentive'],['school','學校／遊學','School / study tour'],['other','其他團體','Other group']];
function typeName(t){var x=TYPES.filter(function(q){return q[0]===t})[0];return x?(z()?x[1]:x[2]):(t||'')}

/* ── ① 綁定團體帳號 ── */
function me(){if(!S.user)return null;return (S.users||[]).filter(function(u){return u&&u.id===S.user.id})[0]||S.user}
function acct(){var u=me();return u&&u.groupAccountR1025B&&u.groupAccountR1025B.status==='active'?u.groupAccountR1025B:null}
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
  var rec={status:'active',type:d.type,company:d.company,taxId:d.taxId,license:d.license||'',contact:{name:d.contact,phone:d.phone,email:u.email||''},caseNo:no,boundAt:now,boundBy:'AI'};
  u.groupAccountR1025B=rec;if(S.user&&S.user!==u)S.user.groupAccountR1025B=rec;
  S.staffCasesR1007A=S.staffCasesR1007A||[];
  S.staffCasesR1007A.unshift({caseNo:no,pnr:'',type:'group_account',status:'resolved',priority:'normal',paxIndex:0,paxName:String(d.contact||'').toUpperCase(),segment:null,
    detail:(z()?'團體帳號綁定：':'Group account: ')+d.company+'（'+typeName(d.type)+'，統一編號 '+d.taxId+(d.license?'，旅行業執照 '+d.license:'')+'）',createdAt:now,updatedAt:now,
    by:{empId:'AI',name:z()?'AI 客服':'AI assistant',role:'service'},assignee:{empId:'AI',name:z()?'AI 客服':'AI assistant'},userId:u.id,email:u.email||'',
    progress:[{at:now,status:'received',label:z()?'AI 客服受理團體帳號綁定':'Received by AI assistant',by:'AI'},{at:now,status:'resolved',label:z()?'基本資料核對完成，已綁定團體帳號':'Verified and bound',by:'AI'}],
    notes:[{at:now,by:'AI',text:(z()?'核對：統一編號檢查碼正確、聯絡 Email 與會員帳號相同、電話格式正確':'Checked tax ID checksum, member email, phone format')+(d.license?(z()?'、旅行業執照格式正確':', licence format'):'')}],groupR1025B:1});
  try{if(typeof kgmNotify==='function')Promise.resolve(kgmNotify('group.account_bound',{email:u.email||'',name:d.contact,caseNo:no,message:(z()?'您的團體帳號已綁定（'+d.company+'），現在可以在首頁訂票卡的「團體訂位」分頁訂位。':'Your group account is active.')})).catch(function(){})}catch(_){}
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
    return (z()?'✓ 綁定完成，案件編號 '+r.caseNo+'。\n\n現在首頁訂票卡多了「團體訂位」分頁：選航班跟一般訂票一樣（單程、來回、多航段都可以），10–99 位，票價比一般最低價少 5%。\n訂位時付訂金 10%，尾款最晚出發前 14 天付清；名單最晚出發前 14 天提供，名單提供前最多可減少 3 位；付清且名單齊全後一人一個 PNR 開票。\n管理已訂的團體：選單「優惠與訂票 › 團體訂位」。':'Bound. Case '+r.caseNo+'. The Group tab is now on the home booking card.')}
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
function gcode(cab){var f=fam(),a=f&&f[cab]&&(f[cab].Value||f[cab].Basic);return a&&a[0]||null}
window.kgmGrpCodeR1025B=gcode;
function seatsLeft(flight,date,cab){var inv={left:0};try{inv=window.kgmCabinInventory54(flight,date,cab)||inv}catch(_){}var left=+inv.left||0;
  if(cab==='Economy'&&window.kgmPaxCapR1025B){try{var pc=window.kgmPaxCapR1025B(flight,date);if(pc&&pc.blocked)left-=pc.blocked}catch(_){}}return Math.max(0,left)}
/* sell54 最前面問這裡（gen_r25 'grp25 sell54'）：團體模式下每一艙只賣「團體」那一個代號，數量＝這一艙整艙空位（扣 Payload 限座） */
window.kgmGrpSellR1025B=function(code,date,flight){
  if(window.__grp25raw||!on())return null;var fi=FARES[code]||{},cab=fi.cabin||'Economy';
  if(cab==='First'||cab==='Resident'||!fi.familyR48)return 0;if(code!==gcode(cab))return 0;return seatsLeft(flight,date,cab)};
/* 團體票價：這一艙當下一般可賣（1 位）的最低價 × 0.95 */
var PC={},PCN=0;
function grpPrice(O,self,f,code,pax){var cab=(FARES[code]||{}).cabin||'Economy',k=[f.code,f.date,f.fr,f.to,cab,pax,(S.search||{}).type,(S.search||{}).adults,(S.search||{}).children,(S.search||{}).infants].join('|'),c=PC[k];
  if(c&&Date.now()-c.t<4000)return c.v;var best=null;window.__grp25raw=1;
  try{Object.keys(FARES).forEach(function(cd){var x=FARES[cd];if(!x||x.cabin!==cab||!x.familyR48)return;var s=0;try{s=window.kgmInventory49(cd,f.date,f)}catch(_){s=0}if(!(s>0))return;var p=+O.call(self,f,cd,pax)||0;if(p>0&&(best==null||p<best))best=p})}
  finally{window.__grp25raw=0}
  if(best==null)best=+O.call(self,f,code,pax)||0;var v=Math.round(best*(1-DISC));if(++PCN>2000){PC={};PCN=0}PC[k]={t:Date.now(),v:v};return v}
function owWrap(){var O=window.owPrice;if(typeof O!=='function'||O.__grp25)return;
  var w=function(f,code,pax){if(window.__grp25raw||!on()||!f||!f.date)return O.apply(this,arguments);var cab=(FARES[code]||{}).cabin;if(!cab||code!==gcode(cab))return O.apply(this,arguments);return grpPrice(O,this,f,code,pax)};
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
function dues(d0){var td=T(),late=days(td,d0)<=BAL_D;return {late:late,balance:late?td:AD(d0,-BAL_D),names:late?AD(td,1)>AD(d0,-1)?AD(d0,-1):AD(td,1):AD(d0,-NAMES_D)}}
function pvWrap(){var O=window.paxView;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){if(!on())return O.apply(this,arguments);var a=acct(),d=draft(),p=passengerCounts(),d0=firstDate(),du=dues(d0);
    var inp=function(k,ph){return '<input class="inp" value="'+E(d[k]||'')+'" placeholder="'+E(ph||'')+'" oninput="S.grpDraftR1025B.'+k+'=this.value">'};
    return '<div class="k25g-pax card"><div class="k25g-ph"><small>GROUP DETAILS</small><h2>'+(z()?'團體資料':'Group details')+'</h2><p>'+(z()?'名單不用現在填：先以 TBA 保留 ':'Names later: ')+p.seats+(z()?' 個座位，名單最晚 ':' seats held as TBA; names due ')+E(du.names)+(z()?' 前提供（出發前 14 天）。':'.')+'</p></div>'
      +'<div class="k25g-acct"><div><small>'+(z()?'團體帳號':'Account')+'</small><b>'+E(a.company)+'</b><span>'+E(typeName(a.type))+' · '+(z()?'統編 ':'Tax ID ')+E(a.taxId)+(a.license?' · '+E(a.license):'')+'</span></div><div><small>'+(z()?'聯絡人':'Contact')+'</small><b>'+E(a.contact.name)+'</b><span>'+E(a.contact.phone)+' · '+E(a.contact.email)+'</span></div><div><small>'+(z()?'人數':'Travellers')+'</small><b>'+p.adults+(z()?' 成人':' adults')+(p.children?' · '+p.children+(z()?' 兒童':' children'):'')+(p.infants?' · '+p.infants+(z()?' 嬰兒':' infants'):'')+'</b><span>'+(z()?'名單提供前最多可減少 ':'Can reduce by up to ')+RED+(z()?' 位':' before names')+'</span></div></div>'
      +'<div class="k25g-grid"><label>'+(z()?'團名':'Group name')+inp('name',z()?'例如：北海道賞雪 7 日':'e.g. Hokkaido 7D')+'</label>'
      +'<label>'+(z()?'團體類型':'Type')+'<select class="inp" onchange="S.grpDraftR1025B.type=this.value">'+[['tour','旅行團','Tour'],['corp','企業／獎勵旅遊','Corporate'],['school','學校／遊學','School'],['other','其他','Other']].map(function(t){return '<option value="'+t[0]+'"'+(d.type===t[0]?' selected':'')+'>'+E(z()?t[1]:t[2])+'</option>'}).join('')+'</select></label>'
      +'<label>'+(z()?'領隊姓名（選填）':'Tour leader (optional)')+inp('leader','')+'</label><label>'+(z()?'領隊電話（選填）':'Leader phone')+inp('leaderPhone','')+'</label>'
      +'<label class="k25g-wide">'+(z()?'備註（餐食、輪椅、特殊需求）':'Notes')+'<textarea class="inp" rows="2" oninput="S.grpDraftR1025B.notes=this.value">'+E(d.notes||'')+'</textarea></label></div>'
      +'<div class="k25g-pay"><div><small>'+(z()?'付款':'Payment')+'</small>'+(du.late?'<b>'+(z()?'出發前 14 天內：訂位時一次付清':'Within 14 days: pay in full')+'</b>':'<b>'+(z()?'訂位時付訂金 10%，尾款最晚 ':'Deposit 10% now, balance by ')+E(du.balance)+'</b><span>'+(z()?'尾款付款連結訂位後立即寄出，未付清前每 7 天提醒一次；逾期未付自動取消並釋出座位（訂金不退）。':'Balance link is sent immediately and reminded weekly.')+'</span>')+'</div>'
      +'<div><small>'+(z()?'團體票規':'Group fare rules')+'</small><b>'+(z()?'改票／退票手續費＝該艙「超值」× 0.75':'Change / refund fee = cabin Value fee × 0.75')+'</b><span>'+(z()?'開票後一位旅客一個 PNR，各自報到、改票。':'One PNR per traveller after ticketing.')+'</span></div></div>'
      +'<div class="k25g-act"><button class="btn btn-o" onclick="S.phase=\''+(S.search.type==='RT'?'sel_inb':'sel_out')+'\';render()">'+(z()?'← 返回選航班':'← Back')+'</button><button class="btn btn-g" onclick="kgmGrpPaxNextR1025B()">'+(z()?'下一步：確認訂位':'Continue')+'</button></div></div>'};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.paxView=w;try{paxView=w}catch(_){}}
pvWrap();setTimeout(pvWrap,0);setTimeout(pvWrap,3000);setTimeout(pvWrap,12000);
window.kgmGrpPaxNextR1025B=function(){var d=draft(),a=acct(),p=passengerCounts();if(!String(d.name||'').trim()){alert(z()?'請填團名。':'Enter the group name.');return}
  var L=[];for(var i=0;i<p.seats;i++){var chd=i>=p.adults;L.push({title:'',lastName:'TBA',firstName:(chd?'CHD':'ADT')+('0'+(i+1)).slice(-2),passengerType:chd?'CHD':'ADT',email:i===0?a.contact.email:'',phone:i===0?a.contact.phone:'',groupNameTbaR1023A:true})}
  for(var j=0;j<p.infants;j++)L.push({title:'',lastName:'TBA',firstName:'INF'+('0'+(j+1)).slice(-2),passengerType:'INF',groupNameTbaR1023A:true});
  S.paxList=L;S.seats={};S.addons=S.addons||{};S.phase='confirm';try{render()}catch(_){}try{window.scrollTo(0,0)}catch(_){}};
/* 付款頁：本次只付訂金 */
function payWrap(){var O=window.payView;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){var h=O.apply(this,arguments);if(!on())return h;var tot=0,cur='TWD';try{var q=journeyPrice();tot=q.total||q.grand||q.amount||0;cur=journeyCurr()}catch(_){}var du=dues(firstDate()),dep=du.late?tot:Math.round(tot*DEP);
    return '<div class="k25g-paynote"><b>'+(z()?'團體訂位付款':'Group payment')+'</b><span>'+(du.late?(z()?'出發前 14 天內訂位，本次付清全額。':'Paying in full.'):(z()?'本次信用卡只扣訂金 ':'Card charged deposit ')+'<b>'+M(dep,cur)+'</b>'+(z()?'（10%）；尾款 ':'; balance ')+'<b>'+M(tot-dep,cur)+'</b>'+(z()?' 最晚 '+du.balance+' 前付清，付款連結訂位後立即寄出。':' due '+du.balance))+'</span></div>'+h};
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
function newId(){var d=T().replace(/-/g,'').slice(2,6),n=G().length+1;return 'GRP'+d+'-'+String(1000+n).slice(-3)+String.fromCharCode(65+(Date.now()%26))}
function segsOf(b){var o=[];var add=function(key,f,c){if(f&&f.code)o.push({key:key,code:f.code,fr:f.fr,to:f.to,date:f.date,dep:f.dep,arr:f.arr,cls:c})};
  if(b.mcFlights&&b.mcFlights.length){b.mcFlights.forEach(function(m,i){if(m&&m.f){add('mc'+i,m.f,m.c);if(m.f.connF2)add('mc'+i+'b',m.f.connF2,m.c)}})}
  else{add('out',b.outF,b.outC);if(b.outF&&b.outF.connF2)add('out2',b.outF.connF2,b.outC);if(b.inbF){add('inb',b.inbF,b.inbC);if(b.inbF.connF2)add('inb2',b.inbF.connF2,b.inbC)}}return o}
window.kgmGrpSegsR1025B=segsOf;
function mail(ev,g,extra){try{if(typeof kgmNotify!=='function')return;Promise.resolve(kgmNotify(ev,Object.assign({email:g.contact&&g.contact.email||'',groupId:g.id,groupName:g.name,agency:g.company||'',pax:g.pax,pnr:g.pnr||'',name:g.contact&&g.contact.name||''},extra||{}))).catch(function(){})}catch(_){}}
function log(g,act,by){(g.history=g.history||[]).push({at:new Date().toISOString(),act:act,by:by||(S.adminUser?(S.adminUser.empId||S.adminUser.name):'customer')})}
function finish(b,d,pc){
  var a=acct()||{},u=me()||{},segs=segsOf(b),d0=segs.length?segs[0].date:T(),du=dues(d0),tot=Math.round(+b.total||+b.totalPaid||0),cur=b.curr||b.currency||'TWD',dep=du.late?tot:Math.round(tot*DEP);
  var g={kind:'v25',id:newId(),createdAt:new Date().toISOString(),status:du.late?'paid':'deposit_paid',name:String(d.name||'').trim(),type:d.type||'tour',leader:d.leader||'',leaderPhone:d.leaderPhone||'',notes:d.notes||'',
    userId:u.id||null,company:a.company||'',taxId:a.taxId||'',license:a.license||'',caseNo:a.caseNo||'',contact:a.contact||{},pnr:b.pnr,
    adults:pc?pc.adults:0,children:pc?pc.children:0,infants:pc?pc.infants:0,pax:pc?pc.seats:0,pax0:pc?pc.seats:0,reduced:0,
    segs:segs,cabin:(FARES[b.outC||(segs[0]||{}).cls]||{}).cabin||'Economy',total:tot,curr:cur,perSeat:pc&&pc.seats?Math.round(tot/pc.seats):0,
    deposit:{amount:dep,paid:true,paidAt:new Date().toISOString()},balance:{amount:tot-dep,paid:tot-dep<=0,due:du.balance,reminders:[]},due:{balance:du.balance,names:du.names},names:[],history:[],legs:segs.map(function(s){return {code:s.code,fr:s.fr,to:s.to,date:s.date,dep:s.dep,arr:s.arr}})};
  b.group=true;b.fareGroup='G';b.groupR1023A={id:g.id,name:g.name,agency:g.company,type:g.type};b.groupR1025B={id:g.id,feeMul:FEE};b.balanceDue=g.balance.amount;b.paymentMethod=(z()?'團體：訂金 ':'Group deposit ')+M(dep,cur);
  if(g.balance.amount>0){var ch=null;try{ch=window.kgmCreateChargeR45({pnr:b.pnr,items:[{label:'Group balance · '+g.id,amount:g.balance.amount}],note:(z()?'團體尾款，請於 ':'Group balance due ')+du.balance+(z()?' 前付清（出發前 14 天），逾期自動取消並釋出座位':'')})}catch(_){}
    g.balance.chargeId=ch&&ch.charge&&ch.charge.id;g.balance.token=ch&&ch.charge&&ch.charge.token;g.balance.reminders.push(T())}
  log(g,'團體訂位成立（'+g.pax+' 位，PNR '+b.pnr+'），訂金 '+M(dep,cur),'customer');G().unshift(g);
  mail('group.booked',g,{amount:tot,currency:cur,message:(z()?'團體訂位已成立，訂金 '+M(dep,cur)+' 已收到。'+(g.balance.amount>0?'尾款 '+M(g.balance.amount,cur)+' 請於 '+du.balance+' 前付清；':'')+'名單請於 '+du.names+' 前提供。請先完成整團劃位。':'Group booked.')});
  S.grpDraftR1025B=null;S.grpViewR1023A={id:g.id};S.grp25Tab='seats';S.view='group23';S.phase=null;save1();try{render()}catch(_){}try{window.scrollTo(0,0)}catch(_){}}

/* ── ④ 整團劃位：每一段從經濟艙後段往前、整排相鄰；也可以進一般選位頁自己調 ── */
function sectionsOf(t){try{return window.seatSections7(t)||[]}catch(_){return []}}
function cabName(c){return {Economy:'Economy',Premium:'Premium',Business:'Business',First:'First'}[c]||c}
window.kgmGrpAutoSeatR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;var b=bk(g.pnr);if(!b)return;var n=g.pax,done=0,miss=[];
  b.seats=b.seats||{};
  segsOf(b).forEach(function(s){var f=Object.assign({},s,{acft:''});var t='';try{t=acftOfFlight(s.code,s.date,s.fr,s.to)}catch(_){}f.acft=t;
    var taken={};try{Object.assign(taken,simSeatMap(s.code,s.date)||{})}catch(_){}try{Object.assign(taken,realTakenSeats0814(Object.assign({},f),b.pnr)||{})}catch(_){}
    var cab=(FARES[s.cls]||{}).cabin||g.cabin,sec=sectionsOf(t).filter(function(x){return x.name===cabName(cab)})[0];if(!sec){miss.push(s.code);return}
    /* 整排空位最多的排先用（同排相鄰），一樣多就後段優先；同一排內照座位順序（同一邊靠在一起） */
    var rows=[];(sec.rows||[]).forEach(function(r,ri){var f=(r.cells||[]).filter(function(c){return c&&!c.aisle&&c.id&&!taken[c.id]&&!taken[String(c.id).toUpperCase()]}).map(function(c){return c.id});if(f.length)rows.push({i:ri,f:f})});
    rows.sort(function(a,b){return b.f.length-a.f.length||b.i-a.i});
    var pick=[];rows.forEach(function(r){if(pick.length>=n)return;r.f.forEach(function(id2){if(pick.length<n)pick.push(id2)})});
    pick.sort(function(a,b){return (parseInt(a)-parseInt(b))||String(a).localeCompare(String(b))});if(pick.length<n)miss.push(s.code);var o={};pick.forEach(function(id2){o[id2]=true});b.seats[s.key]=o;done++});
  g.seatsAt=new Date().toISOString();g.seatsBy='auto';log(g,'整團劃位（同排相鄰優先）'+done+' 段'+(miss.length?'，座位不足：'+miss.join('、'):''));save1();S.grpMsgR1025B=(z()?'✓ 已整團劃位 ':'✓ Seated ')+done+(z()?' 段':' segments')+(miss.length?(z()?'（'+miss.join('、')+' 空位不夠整團，請手動調整）':''):'');try{render()}catch(_){}};
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
function canReduce(g){return /deposit_paid|paid/.test(g.status)&&g.reduced<RED&&T()<=g.due.names&&g.pax>MINP-RED}
window.kgmGrpReduceR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g||!canReduce(g))return;var b=bk(g.pnr);if(!b)return;
  if(!confirm(z()?'減少 1 位？（從名單最後一位開始；已付的訂金不退，尾款會依少掉的人數扣掉）':'Remove one traveller?'))return;
  var i=g.pax-1,chd=i>=g.adults;b.paxList.splice(i,1);Object.keys(b.seats||{}).forEach(function(k){var ks=Object.keys(b.seats[k]||{});if(ks.length>i){delete b.seats[k][ks[i]]}});
  if(chd)g.children--;else g.adults--;g.pax--;g.reduced++;if(g.names)g.names.splice(i,1);
  var unit=chd?0.75:1,cut=Math.round(g.perSeat*unit);g.total=Math.max(0,g.total-cut);b.total=g.total;b.seatPassengerCount=g.pax;b.passengerCounts={adults:g.adults,children:g.children,infants:g.infants};b.search=Object.assign({},b.search,{adults:g.adults,children:g.children,pax:g.pax});
  if(g.balance&&!g.balance.paid){g.balance.amount=Math.max(0,g.total-g.deposit.amount);b.balanceDue=g.balance.amount;var c=charge(g.balance.chargeId);if(c&&c.status==='unpaid'){try{window.kgmVoidChargeR45(c.id)}catch(_){}var ch=null;try{ch=window.kgmCreateChargeR45({pnr:g.pnr,items:[{label:'Group balance · '+g.id,amount:g.balance.amount}],note:(z()?'團體尾款（減少人數後重開），請於 ':'Group balance due ')+g.due.balance+(z()?' 前付清':'')})}catch(_){}g.balance.chargeId=ch&&ch.charge&&ch.charge.id;g.balance.token=ch&&ch.charge&&ch.charge.token}}
  log(g,'減少 1 位（剩 '+g.pax+' 位，已減 '+g.reduced+'/'+RED+'）');mail('group.reduced',g,{message:(z()?'團體人數減為 '+g.pax+' 位，尾款更新為 '+M(g.balance.amount,g.curr):'Group size reduced.')});S.grpMsgR1025B=(z()?'✓ 已減少 1 位，剩 ':'✓ Now ')+g.pax+(z()?' 位':'');save1();try{render()}catch(_){}};

/* ── ⑤⑦ 尾款、提醒、逾期、開票（一人一 PNR） ── */
function charge(id){return (S.chargesR45||[]).filter(function(c){return c&&c.id===id})[0]||null}
window.kgmGrpPayBalR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(g&&g.balance&&g.balance.token&&window.kgmOpenPayR45)window.kgmOpenPayR45(g.balance.token)};
function tno(){return '297'+String(Date.now()).slice(-7)+String(Math.floor(Math.random()*900+100))}
function maybeTicket(g,force){
  if(g.kind!=='v25'||g.status==='ticketed'||g.status==='cancelled')return false;if(!g.balance.paid||namesDone(g)<g.pax)return false;
  var b=bk(g.pnr);if(!b)return false;var keys=Object.keys(b.seats||{}),pnrs=[],units=g.adults+g.children*0.75||1,infs=(b.paxList||[]).filter(function(p){return String(p.passengerType).toUpperCase()==='INF'}),ai=0;
  (b.paxList||[]).forEach(function(p,i){if(String(p.passengerType).toUpperCase()==='INF')return;var inf=String(p.passengerType).toUpperCase()==='ADT'&&ai<infs.length?infs[ai++]:null;   /* 不佔位嬰兒跟著前幾位成人的 PNR */var np='';try{np=genPNR()}catch(_){np='G'+String(Date.now()+i).slice(-5)}
    var seats={};keys.forEach(function(k){var ks=Object.keys(b.seats[k]||{});if(ks[i]){seats[k]={};seats[k][ks[i]]=true}});
    var unit=String(p.passengerType).toUpperCase()==='CHD'?0.75:1,amt=Math.round(g.total*unit/units);
    var c=JSON.parse(JSON.stringify(b));c.pnr=np;c.paxList=[Object.assign({},p,{ticketR1023A:tno()})].concat(inf?[Object.assign({},inf,{ticketR1023A:tno()})]:[]);c.seats=seats;c.total=amt;c.balanceDue=0;c.passengerCounts={adults:unit===1?1:0,children:unit===1?0:1,infants:inf?1:0};c.seatPassengerCount=1;
    c.search=Object.assign({},c.search,{adults:unit===1?1:0,children:unit===1?0:1,infants:inf?1:0,pax:1});c.ticketNumber=c.paxList[0].ticketR1023A;c.ticket=c.ticketNumber;c.groupR1025B={id:g.id,feeMul:FEE,master:g.pnr,index:i};c.bookedAt=b.bookedAt;c.status='confirmed';
    S.bookings.push(c);pnrs.push({pnr:np,name:p.lastName+'/'+p.firstName,ticket:c.ticketNumber,seat:Object.keys(seats).map(function(k){return Object.keys(seats[k])[0]}).join(' '),inf:inf?inf.lastName+'/'+inf.firstName:''})});
  b.status='cancelled';b.cancelledAt=T();b.splitR1025B={at:new Date().toISOString(),into:pnrs.map(function(x){return x.pnr})};b.groupReleasedR1023A=false;
  g.status='ticketed';g.ticketedAt=new Date().toISOString();g.split=pnrs;log(g,'開票：一人一個 PNR，共 '+pnrs.length+' 個'+(force?'（業務手動）':''));
  mail('group.ticketed',g,{message:(z()?'全團 '+pnrs.length+' 位已開票，一位旅客一個 PNR：\n':'Tickets issued:\n')+pnrs.map(function(x){return x.pnr+'　'+x.name+'　'+x.ticket}).join('\n')});return true}
window.kgmGrpTicketR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;if(!maybeTicket(g,1)){S.grpMsgR1025B=z()?'還不能開票：要尾款付清而且名單齊全':'Needs balance paid and complete names'}save1();try{render()}catch(_){}};
function tick(){var ch=false,td=T();
  G().forEach(function(g){if(g.kind!=='v25'||/ticketed|cancelled/.test(g.status))return;var b=bk(g.pnr);
    if(b&&b.status==='cancelled'&&!b.splitR1025B){g.status='cancelled';log(g,'訂位已取消','system');ch=true;return}
    if(g.balance&&!g.balance.paid){var c=charge(g.balance.chargeId);
      if(c&&c.status==='paid'){g.balance.paid=true;g.balance.paidAt=c.paidAt||new Date().toISOString();g.status='paid';if(b)b.balanceDue=0;log(g,'尾款已付 '+M(g.balance.amount,g.curr),'system');mail('group.balance_paid',g,{amount:g.balance.amount,currency:g.curr,message:z()?'尾款已收到。名單齊全後系統自動開票（一人一個 PNR）。':'Balance received.'});ch=true}
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
  var C=window.changeFeeOf;if(typeof C==='function'&&!C.__grp25){var w=function(k){var v=C.apply(this,arguments),b=window.__grp25raw?null:curBk();if(b&&b.groupR1025B&&v>0)return Math.round(v*FEE);return v};try{Object.keys(C).forEach(function(k){if(!(k in w))w[k]=C[k]})}catch(_){}w.__grp25=1;window.changeFeeOf=w;try{changeFeeOf=w}catch(_){}}
  var R=window.refundPolicyOf;if(typeof R==='function'&&!R.__grp25){var w2=function(k){var v=R.apply(this,arguments),b=window.__grp25raw?null:curBk();if(b&&b.groupR1025B&&v&&v.fee>0)return Object.assign({},v,{fee:Math.round(v.fee*FEE),groupR1025B:1});return v};try{Object.keys(R).forEach(function(k){if(!(k in w2))w2[k]=R[k]})}catch(_){}w2.__grp25=1;window.refundPolicyOf=w2;try{refundPolicyOf=w2}catch(_){}}}
feeWrap();setTimeout(feeWrap,0);setTimeout(feeWrap,3000);setTimeout(feeWrap,12000);
function feeTxt(cab){var f=fam()||{},v=f[cab]&&f[cab].Value&&f[cab].Value[0],c=null,r=null;window.__grp25raw=1;   /* 跟改票／退票實際扣的同一支（changeFeeOf、refundPolicyOf），乘 0.75 */
  try{c=window.changeFeeOf(v);var p=window.refundPolicyOf(v);r=p&&p.allowed?p.fee:null}catch(_){}finally{window.__grp25raw=0}
  var t=function(x){return x==null?(z()?'不可':'n/a'):(x===0?(z()?'免費':'free'):'TWD '+Math.round(x*FEE).toLocaleString())};
  return (z()?'改票每航段 ':'Change/sector ')+(c<0?(z()?'不可':'n/a'):t(c))+(z()?'・退票 ':' · Refund ')+t(r)}
window.kgmGrpFeeTxtR1025B=feeTxt;

/* ── 團體模式畫面標示（訂票卡、選航班頁的票價卡） ── */
function deco(){try{var o=on();document.documentElement.classList.toggle('kgm-grp25',o);document.documentElement.classList.toggle('kgm-grp25b',!!acct());
    if(!o)return;
    /* 選航班頁的票價卡（article.k929-fare）：其他方案（售完）收起來；「超值 Value」那張改寫成「團體」、手續費寫 × 0.75 之後的金額 */
    [].forEach.call(document.querySelectorAll('#app article.k929-fare'),function(el){if(el.getAttribute('data-g25'))return;el.setAttribute('data-g25','1');
      if(el.classList.contains('sold')){el.style.display='none';return}
      var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false),n,L=[];while((n=w.nextNode()))L.push(n);
      L.forEach(function(n){var v=n.nodeValue;if(/超值|Value/.test(v))n.nodeValue=v.replace(/超值/g,'團體').replace(/\bValue\b/g,'Group');
        var row=n.parentElement&&n.parentElement.parentElement,rt=row?row.textContent:'';
        if(/NT\$\s?[\d,]+/.test(v)&&/改票|退票|手續費|櫃檯/.test(rt))n.nodeValue=n.nodeValue.replace(/NT\$\s?([\d,]+)/g,function(m,x){return 'NT$'+Math.round(+x.replace(/,/g,'')*FEE).toLocaleString()})});
      var pr=[].filter.call(el.querySelectorAll('*'),function(e){return e.children.length===0&&/含稅/.test(e.textContent)})[0];
      if(pr&&!el.querySelector('.k25g-fare-tag')){var t=document.createElement('div');t.className='k25g-fare-tag';t.textContent=z()?'團體價：本艙一般最低價 −5%・改票／退票手續費 × 0.75':'Group fare: lowest public fare −5% · fees × 0.75';pr.parentNode.insertBefore(t,pr.nextSibling)}})}catch(_){}}
setInterval(deco,400);
try{var Q=false;new MutationObserver(function(){if(Q)return;Q=true;Promise.resolve().then(function(){Q=false;deco()})}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}

/* ── ⑧ 前台「我的團體訂位」 ── */
var ST={deposit_paid:['已付訂金・待尾款','Deposit paid','#B26A00','#FFF3E0'],paid:['已付清・待名單','Paid · names due','#0B6B48','#E9F5EF'],ticketed:['已開票','Ticketed','#0B3D2E','#E3EEE9'],cancelled:['已取消','Cancelled','#6B6F6C','#F1F2F1']};
function chip(s){var x=ST[s]||[s,s,'#555','#eee'];return '<span class="k25g-st" style="color:'+x[2]+';background:'+x[3]+'">'+E(z()?x[0]:x[1])+'</span>'}
function seatsCount(g){var b=bk(g.pnr);if(!b)return [0,0];var s=segsOf(b),ok=0;s.forEach(function(x){if(Object.keys((b.seats||{})[x.key]||{}).length>=g.pax)ok++});return [ok,s.length]}
function stepsBar(g){var sc=seatsCount(g),st=[[z()?'訂位・訂金':'Booked',true],[z()?'整團劃位':'Seats',sc[1]&&sc[0]===sc[1]],[z()?'尾款':'Balance',g.balance.paid],[z()?'名單':'Names',namesDone(g)>=g.pax],[z()?'開票（一人一 PNR）':'Tickets',g.status==='ticketed']];
  var cur=st.findIndex(function(x){return !x[1]});return '<ol class="k25g-steps">'+st.map(function(x,i){return '<li class="'+(x[1]?'done':(i===cur?'on':''))+'"><i>'+(x[1]?'✓':i+1)+'</i>'+E(x[0])+'</li>'}).join('')+'</ol>'}
function segTable(g){var b=bk(g.pnr)||{};return '<table class="k25g-t"><thead><tr><th>'+(z()?'航段':'Sector')+'</th><th>'+(z()?'日期':'Date')+'</th><th>'+(z()?'時間':'Time')+'</th><th>'+(z()?'座位':'Seats')+'</th></tr></thead><tbody>'
  +(g.status==='ticketed'?g.segs:segsOf(b)).map(function(s){var n=Object.keys(((b.seats||{})[s.key])||{}).length;return '<tr><td><b>'+E(s.code)+'</b> '+E(s.fr)+' → '+E(s.to)+'<small>'+E(ap(s.fr))+' → '+E(ap(s.to))+'</small></td><td>'+E(s.date)+'</td><td>'+E(s.dep||'')+'–'+E(s.arr||'')+'</td><td>'+(g.status==='ticketed'?'—':(n>=g.pax?'<b class="ok">'+n+' / '+g.pax+'</b>':n+' / '+g.pax))+'</td></tr>'}).join('')+'</tbody></table>'}
function namesEd(g){var rows='';for(var i=0;i<g.pax;i++){var r=(g.names||[])[i]||{},chd=i>=g.adults;
    rows+='<tr><td>'+(i+1)+'<small>'+(chd?(z()?'兒童':'CHD'):(z()?'成人':'ADT'))+'</small></td><td><input id="k25gNL'+i+'" class="inp" value="'+E(r.last||'')+'" placeholder="WANG"></td><td><input id="k25gNF'+i+'" class="inp" value="'+E(r.first||'')+'" placeholder="DAMING"></td>'
      +'<td><select id="k25gNG'+i+'" class="inp"><option value=""></option><option'+(r.gender==='M'?' selected':'')+' value="M">M</option><option'+(r.gender==='F'?' selected':'')+' value="F">F</option></select></td><td><input id="k25gND'+i+'" class="inp" value="'+E(r.dob||'')+'" placeholder="1990-05-20"></td><td><input id="k25gNP'+i+'" class="inp" value="'+E(r.passport||'')+'"></td></tr>'}
  return '<p class="k25g-p">'+(z()?'姓名照護照英文拼音（姓、名分開），可以分次填、每次按「儲存名單」。期限 ':'Names as in passport. Due ')+E(g.due.names)+'</p><details class="k25g-paste"><summary>'+(z()?'從 Excel 貼上整份名單':'Paste from spreadsheet')+'</summary><p class="k25g-p">'+(z()?'每行一位：姓/名, 性別, 生日, 護照號碼':'LAST/FIRST, M/F, YYYY-MM-DD, passport')+'</p><textarea id="k25gPaste" class="inp" rows="4"></textarea><button type="button" class="k25g-btn ghost" onclick="kgmGrpPasteR1025B(\''+A(g.id)+'\')">'+(z()?'套用到下表':'Fill')+'</button></details>'
    +'<div class="k25g-scroll"><table class="k25g-t k25g-names"><thead><tr><th>#</th><th>'+(z()?'姓 Last':'Last')+'</th><th>'+(z()?'名 First':'First')+'</th><th>'+(z()?'性別':'Sex')+'</th><th>'+(z()?'生日':'DOB')+'</th><th>'+(z()?'護照號碼':'Passport')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
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
    +(canReduce(g)?'<div class="k25g-reduce"><b>'+(z()?'減少人數':'Reduce')+'</b><span>'+(z()?'名單期限前最多可減少 '+RED+' 位（已減 '+g.reduced+' 位）；從最後一位開始，尾款依少掉的人數扣掉，訂金不退。':'')+'</span><button type="button" class="k25g-btn ghost" onclick="kgmGrpReduceR1025B(\''+A(g.id)+'\')">'+(z()?'減少 1 位':'Remove 1')+'</button></div>':'');
  var tickBody=g.status==='ticketed'?('<p class="k25g-p">'+(z()?'一位旅客一個 PNR，可在「行程管理」用各自的 PNR 與姓氏報到、選位、改票（手續費 × 0.75）。':'One PNR per traveller.')+'</p><div class="k25g-scroll"><table class="k25g-t"><thead><tr><th>#</th><th>PNR</th><th>'+(z()?'旅客':'Passenger')+'</th><th>'+(z()?'機票號碼':'Ticket')+'</th><th>'+(z()?'座位':'Seat')+'</th></tr></thead><tbody>'+(g.split||[]).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><b class="mono">'+E(x.pnr)+'</b></td><td>'+E(x.name)+(x.inf?'<small>+ '+E(x.inf)+'</small>':'')+'</td><td class="mono">'+E(x.ticket)+'</td><td class="mono">'+E(x.seat||'—')+'</td></tr>'}).join('')+'</tbody></table></div>')
    :'<p class="k25g-p">'+(z()?'尾款付清、名單齊全後系統自動開票，一位旅客一個 PNR。':'Tickets issue automatically.')+'</p><div class="k25chk"><span class="'+(g.balance.paid?'ok':'')+'">'+(g.balance.paid?'✓':'○')+' '+(z()?'尾款付清':'Balance paid')+'</span><span class="'+(nd>=g.pax?'ok':'')+'">'+(nd>=g.pax?'✓':'○')+' '+(z()?'名單齊全 ':'Names ')+nd+'/'+g.pax+'</span></div>';
  var steps=stepCard('booked',1,z()?'訂位成立・訂金':'Booked',true,(z()?'訂金 ':'Deposit ')+M(g.deposit.amount,g.curr)+(z()?' 已付・':' paid · ')+E(String(g.createdAt||'').slice(0,10)),'<p class="k25g-p">'+(z()?'團體方案：本艙一般最低價 −5%；PNR ':'Group fare; PNR ')+E(g.pnr)+(z()?'（開票前是整團一筆）。':'.')+'</p>',cur)
    +stepCard('seats',2,z()?'整團劃位':'Seats',seatsDone,(z()?'已劃 ':'Seated ')+sc[0]+' / '+sc[1]+(z()?' 段':' sectors'),seatBody,cur)
    +stepCard('pay',3,z()?'尾款':'Balance',g.balance.paid,g.balance.paid?(z()?'已付清':'Paid'):(M(g.balance.amount,g.curr)+'・'+(z()?'期限 ':'due ')+E(g.due.balance)),payBody,cur)
    +stepCard('names',4,z()?'旅客名單':'Names',nd>=g.pax,nd+' / '+g.pax+'・'+(z()?'期限 ':'due ')+E(g.due.names),namesBody,cur)
    +stepCard('tickets',5,z()?'開票（一人一個 PNR）':'Tickets',g.status==='ticketed',g.status==='ticketed'?(g.split||[]).length+(z()?' 個 PNR 已開票':' PNRs'):(z()?'付清＋名單齊全後自動開票':'Automatic'),tickBody,cur);
  var side='<aside class="k25side"><div class="k25box"><small>'+(z()?'團體總價':'Total')+'</small><b class="big">'+M(g.total,g.curr)+'</b><span>'+g.pax+(z()?' 位・每位約 ':' pax · ~')+M(g.perSeat,g.curr)+'</span><div class="k25bar"><u style="width:'+Math.round(((g.deposit.amount+(g.balance.paid?g.balance.amount:0))/(g.total||1))*100)+'%"></u></div><span>'+(z()?'已付 ':'Paid ')+M(g.deposit.amount+(g.balance.paid?g.balance.amount:0),g.curr)+'</span>'+(!g.balance.paid&&act?'<button type="button" class="k25g-btn full" onclick="kgmGrpPayBalR1025B(\''+A(g.id)+'\')">'+(z()?'付尾款 ':'Pay balance ')+M(g.balance.amount,g.curr)+'</button>':'')+'</div>'
    +'<div class="k25box"><small>'+(z()?'期限':'Deadlines')+'</small>'+[[z()?'尾款':'Balance',g.due.balance,g.balance.paid],[z()?'名單':'Names',g.due.names,nd>=g.pax],[z()?'出發':'Departure',d0,false]].map(function(x){return '<div class="k25dl'+(x[2]?' ok':'')+'"><span>'+E(x[0])+'</span><b>'+E(x[1])+'</b><em>'+(x[2]?'✓':dleft(x[1]))+'</em></div>'}).join('')+'</div>'
    +'<div class="k25box"><small>'+(z()?'團體帳號':'Account')+'</small><b>'+E(g.company)+'</b><span>'+E(g.contact&&g.contact.name||'')+' · '+E(g.contact&&g.contact.phone||'')+'</span>'+(g.leader?'<span>'+(z()?'領隊 ':'Leader ')+E(g.leader)+(g.leaderPhone?' · '+E(g.leaderPhone):'')+'</span>':'')+'</div>'
    +'<div class="k25box rules"><small>'+(z()?'團體票規':'Fare rules')+'</small><ul><li>'+(z()?'改票／退票手續費：「超值」× 0.75（':'Fees ×0.75 (')+E(feeTxt(g.cabin))+(z()?'，每段每位）':')')+'</li><li>'+(z()?'名單期限前可減少 '+RED+' 位（已減 '+g.reduced+'）':'Reduce up to '+RED)+'</li><li>'+(z()?'訂金不退；尾款逾期自動取消':'Deposit non-refundable')+'</li><li>'+(z()?'開票後一人一個 PNR':'One PNR per traveller')+'</li></ul></div></aside>';
  return '<div class="k25top"><div class="k25crumb"><a href="javascript:void 0" onclick="S.grpViewR1023A=null;render()">'+(z()?'我的團體訂位':'My groups')+'</a><span>›</span>'+E(g.id)+'</div>'
    +'<div class="k25top-r"><div><h1>'+E(g.name||'—')+'</h1><p>'+E(g.company)+(g.leader?' · '+(z()?'領隊 ':'Leader ')+E(g.leader):'')+'</p></div>'+chip(g.status)+'</div>'
    +'<div class="k25facts"><div><small>PNR</small><b class="mono">'+E(g.pnr)+'</b></div><div><small>'+(z()?'人數':'Travellers')+'</small><b>'+g.pax+'</b><span>'+g.adults+(z()?' 成人':' ADT')+(g.children?' · '+g.children+(z()?' 兒童':' CHD'):'')+(g.reduced?(z()?' · 減 ':' · −')+g.reduced:'')+'</span></div><div><small>'+(z()?'出發':'Departs')+'</small><b>'+E(d0)+'</b><span>'+dleft(d0)+'</span></div><div><small>'+(z()?'航段':'Sectors')+'</small><b>'+g.segs.length+'</b><span>'+E(g.segs.map(function(s){return s.fr}).concat([(g.segs[g.segs.length-1]||{}).to]).join(' → '))+'</span></div><div><small>'+(z()?'艙等':'Cabin')+'</small><b>'+E(cab25(g.cabin))+'</b><span>'+(z()?'團體方案':'Group fare')+'</span></div></div></div>'
    +(S.grpMsgR1025B?'<div class="k25g-msg">'+E(S.grpMsgR1025B)+'</div>':'')
    +'<div class="k25cols"><main><section class="k25card"><header><b>'+(z()?'行程':'Itinerary')+'</b><span>'+(z()?'時間為當地時間':'Local times')+'</span></header>'+itin(g)+'</section><div class="k25steps">'+steps+'</div></main>'+side+'</div>'}
function cab25(c){return z()?({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙'})[c]||c:c}
function list(){var u=me(),L=G().filter(function(g){return g.kind==='v25'&&u&&g.userId===u.id});var old=G().filter(function(g){return g.kind!=='v25'&&u&&g.contact&&String(g.contact.email||'').toLowerCase()===String(u.email||'').toLowerCase()});
  var act=L.filter(function(g){return !/ticketed|cancelled/.test(g.status)}),done=L.filter(function(g){return /ticketed|cancelled/.test(g.status)});
  var card=function(g){var sc=seatsCount(g),nd=namesDone(g),d0=(g.segs[0]||{}).date||'',pct=Math.round(((sc[1]&&sc[0]===sc[1]?1:0)+(g.balance.paid?1:0)+(nd>=g.pax?1:0)+(g.status==='ticketed'?1:0)+1)/5*100);
    var nx=g.status==='ticketed'?(z()?'已開票':'Ticketed'):g.status==='cancelled'?(z()?'已取消':'Cancelled'):!(sc[1]&&sc[0]===sc[1])?(z()?'下一步：整團劃位':'Next: seats'):!g.balance.paid?(z()?'下一步：尾款 ':'Next: balance ')+E(g.due.balance):(z()?'下一步：名單 ':'Next: names ')+nd+'/'+g.pax;
    return '<button type="button" class="k25gc" onclick="S.grpViewR1023A={id:\''+A(g.id)+'\'};S.grp25Tab=null;S.grpMsgR1025B=\'\';render()"><div class="k25gc-d"><b>'+E(d0.slice(5).replace('-','/'))+'</b><small>'+E(d0.slice(0,4))+'</small></div>'
      +'<div class="k25gc-m"><b>'+E(g.name||g.id)+'</b><span class="mono">'+E(g.segs.map(function(s){return s.fr}).concat([(g.segs[g.segs.length-1]||{}).to]).join(' → '))+'</span><small>'+E(g.id)+' · PNR '+E(g.pnr)+' · '+g.pax+(z()?' 位':' pax')+'</small></div>'
      +'<div class="k25gc-p"><span>'+nx+'</span><i><u style="width:'+pct+'%"></u></i></div>'+chip(g.status)+'</button>'};
  return '<div class="k25list">'+(act.length?'<h3>'+(z()?'進行中':'Active')+' · '+act.length+'</h3>'+act.map(card).join(''):'<div class="k25empty"><b>'+(z()?'還沒有進行中的團體訂位':'No active group bookings')+'</b><span>'+(z()?'到首頁訂票卡切換「團體訂位」分頁，選航班跟一般訂票一樣。':'Use the Group tab on the home booking card.')+'</span></div>')
    +(done.length?'<h3>'+(z()?'已開票／已取消':'Ticketed / cancelled')+' · '+done.length+'</h3>'+done.map(card).join(''):'')
    +(old.length?'<p class="k25g-p">'+(z()?'1023A 舊版團體申請：':'Earlier requests: ')+old.map(function(g){return E(g.id)+'（'+E(g.status)+'）'}).join('、')+'</p>':'')+'</div>'}
function viewWrap(){var O=window.kgmGroupViewR1023A;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){var a=acct();
    if(!S.user||!a)return '<div class="k25g"><section class="k25bind"><div><small>GROUP TRAVEL</small><h1>'+(z()?'團體訂位':'Group booking')+'</h1><p>'+(z()?'旅行社、企業獎勵旅遊、學校與各類團體，10–99 位同行。':'For 10–99 travellers.')+'</p>'
      +'<ul><li><b>−5%</b><span>'+(z()?'本艙一般最低價再少 5%':'Below the lowest public fare')+'</span></li><li><b>10%</b><span>'+(z()?'訂金，尾款出發前 14 天':'Deposit; balance 14 days out')+'</span></li><li><b>14 '+(z()?'天':'d')+'</b><span>'+(z()?'名單出發前 14 天提供，可減 3 位':'Names 14 days out')+'</span></li><li><b>1:1</b><span>'+(z()?'開票一人一個 PNR':'One PNR each')+'</span></li></ul></div>'
      +'<div class="k25bind-c"><b>'+(z()?'先綁定團體帳號':'Bind a group account')+'</b><p>'+(z()?'由 AI 客服核對類型、名稱、統一編號、（旅行社）執照、聯絡人與電話，綁定到您的會員帳號並給您案件編號；之後首頁訂票卡會出現「團體訂位」分頁。':'The AI assistant verifies your details.')+'</p><button type="button" class="k25g-btn" onclick="kgmGrpAskAiR1025B()">'+(S.user?(z()?'開啟 AI 客服綁定':'Open AI assistant'):(z()?'登入會員':'Sign in'))+'</button></div></section></div>';
    var v=S.grpViewR1023A,g=v?G().filter(function(x){return x.id===v.id&&x.kind==='v25'})[0]:null;
    if(g)return '<div class="k25g">'+detailV25(g)+'</div>';
    return '<div class="k25g"><div class="k25top"><div class="k25top-r"><div><small class="k25eyebrow">GROUP TRAVEL</small><h1>'+(z()?'我的團體訂位':'My group bookings')+'</h1><p>'+E(a.company)+' · '+E(typeName(a.type))+' · '+(z()?'統編 ':'Tax ID ')+E(a.taxId)+' · '+(z()?'綁定案件 ':'Case ')+E(a.caseNo)+'</p></div><button type="button" class="k25g-btn" onclick="nav(\'home\');setTimeout(function(){kgmGrpModeR1025B(1)},50)">'+(z()?'＋ 新的團體訂位':'＋ New booking')+'</button></div></div>'+list()+'</div>'};
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
    var tr='<tr class="'+(o?'on':'')+(late(g)?' late':'')+'" onclick="kgmGrpAdmR1025B(\'open\',\''+A(g.id)+'\')"><td><b>'+E(g.name||'—')+'</b><small>'+E(g.id)+' · PNR '+E(g.pnr)+'</small></td><td><b>'+E(g.company)+'</b><small>'+E(g.contact&&g.contact.name||'')+' · '+E(g.caseNo||'')+'</small></td>'
      +'<td>'+g.segs.slice(0,3).map(function(s){return '<div>'+E(s.code+' '+s.fr+'→'+s.to)+' <small style="display:inline">'+E(s.date.slice(5))+'</small></div>'}).join('')+'</td><td><b>'+g.pax+'</b><small>'+(g.reduced?(z()?'減 ':'−')+g.reduced:'')+'</small></td><td>'+chip(g.status)+'<div class="k25gd-bar"><i style="width:'+pct+'%"></i></div></td>'
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
  var accts=(S.users||[]).filter(function(u){return u&&u.groupAccountR1025B});
  var ac='<details class="k25gd-acc"'+(S.grp25AccOpen?' open':'')+' ontoggle="S.grp25AccOpen=this.open"><summary>'+(z()?'團體帳號（AI 客服綁定）':'Group accounts')+' · '+accts.filter(function(u){return u.groupAccountR1025B.status==='active'}).length+'</summary><div class="k25g-scroll"><table class="k25g-t"><thead><tr><th>'+(z()?'名稱':'Name')+'</th><th>'+(z()?'類型':'Type')+'</th><th>'+(z()?'統編／執照':'Tax / licence')+'</th><th>'+(z()?'會員':'Member')+'</th><th>'+(z()?'案件':'Case')+'</th><th>'+(z()?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'
    +(accts.length?accts.map(function(u){var x=u.groupAccountR1025B;return '<tr><td><b>'+E(x.company)+'</b><small>'+E(x.contact&&x.contact.name||'')+' · '+E(x.contact&&x.contact.phone||'')+'</small></td><td>'+E(typeName(x.type))+'</td><td>'+E(x.taxId)+'<small>'+E(x.license||'')+'</small></td><td>'+E(u.email||'')+'<small>'+E(u.id||'')+'</small></td><td>'+E(x.caseNo)+'<small>'+E(String(x.boundAt||'').slice(0,10))+'</small></td><td>'+(x.status==='active'?(z()?'使用中':'Active'):(z()?'已停用':'Revoked'))+'</td><td>'+(x.status==='active'?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'unbind\',\''+A(u.id)+'\')">'+(z()?'停用':'Revoke')+'</button>':'')+'</td></tr>'}).join(''):'<tr><td colspan="7" class="k25g-none">'+(z()?'還沒有團體帳號。會員在前台 AI 客服說「綁定團體帳號」即可申請。':'None yet.')+'</td></tr>')+'</tbody></table></div></details>';
  return '<section class="k25gd"><header><div><small>GROUP DESK</small><b>'+(z()?'團體訂位':'Group bookings')+'</b></div><span>'+(z()?'團體帳號經前台 AI 客服核對、綁定；訂位走一般訂票流程（團體方案：一般最低價 −5%、訂金 10%、尾款與名單出發前 14 天、名單前可減 3 位、開票一人一 PNR、改退費 × 0.75）。':'')+'</span></header>'
    +'<div class="k25gd-kpi">'+kpi+'</div>'+(S.grp25AdmMsg?'<div class="k25g-msg">'+E(S.grp25AdmMsg)+'</div>':'')
    +(show.length?'<div class="k25g-scroll"><table class="k25g-t k25gd-t"><thead><tr><th>'+(z()?'團名':'Group')+'</th><th>'+(z()?'團體帳號':'Account')+'</th><th>'+(z()?'航段':'Sectors')+'</th><th>'+(z()?'人數':'Pax')+'</th><th>'+(z()?'狀態／進度':'Status')+'</th><th>'+(z()?'尾款':'Balance')+'</th><th>'+(z()?'名單':'Names')+'</th><th>'+(z()?'座位':'Seats')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="k25g-none">'+(z()?'這個分類沒有團體訂位。':'Nothing here.')+'</div>')
    +ac+'</section>'}
function deskWrap(){var O=window.kgmGroupDeskPageR1023A;if(typeof O!=='function'||O.__grp25)return;
  var w=function(){var pm='use';try{pm=window.kgmPermR123?window.kgmPermR123('groups23'):'use'}catch(_){}if(pm==='none')return O.apply(this,arguments);
    var old=G().some(function(g){return g.kind!=='v25'});
    return '<div class="k23gp">'+admDesk()+(old?'<details class="k25gd-old"><summary>'+(z()?'1023A 舊版團體申請（報價制）':'Earlier quote-based requests')+'</summary>'+(window.kgmGroupDeskHtmlR1023A?window.kgmGroupDeskHtmlR1023A():'')+'</details>':'')+'</div>'};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp25=1;window.kgmGroupDeskPageR1023A=w}
deskWrap();setTimeout(deskWrap,0);setTimeout(deskWrap,3000);

/* ── 前台選單「團體訂位」：沒有綁定就不顯示 ── */
function menuHide(){try{var b=!!acct();[].forEach.call(document.querySelectorAll('[onclick*="group23"]'),function(el){if(el.closest&&el.closest('.k25g'))return;var li=el.closest('li')||el;if(!b)li.setAttribute('data-g25hide','1');else li.removeAttribute('data-g25hide')})}catch(_){}}
setInterval(menuHide,800);

var CSS='[data-g25hide]{display:none!important}'
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
