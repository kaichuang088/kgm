
/* ══ 1026C（交付 1027A）：包機／自創航班申請（使用者：「訂購團體機票也要選擇包機或是建立航班，包機可以選擇日期，然後必須要提早半年預定包機。
      自創航班至少需要提早三個月訂購，要輸入總共有幾位，希望是哪個機型，後台會給予回覆，若成功，後台會給與班機編號，然後也要加入該飛機的飛行Schedule
      (後台會自動顯示哪些飛機可以)」；回答：包機「兩者都可以（包下現有班整班／另加一架飛指定航線），費用就是各個艙等每個位置」、「後台人工核准」）
   ① 前台「我的團體訂位」：一般航班團體訂位／包機申請／自創航班申請三個入口；申請單存 S.charterReqsR1026C（kgm27_charter，前後台同步）。
      包機：起飛日至少 183 天後；自創航班：至少 90 天後。
   ② 後台「團體訂位」第三個分頁「包機／自創航班」：每一段列出可用機身（跟 AI 臨時航班同一套 kgmTempPlanR1026C：那個時間已經在出發站、前後勤務排得開、
      不在凌晨抵達），團體業務選一個方案按核准 → 建立航班（kgmTempCreateR1026C：寫進 S.customFlights＋那架飛機的 S.tailAssign，機隊重排保留），給班號；
      包下現有航班＝那一天那一班設成「只開放包機」而且只有這個團體帳號能訂（ch27 規則帶 owner），已經有一般旅客訂位的班不能核准。
   ③ 費用：包機＝各艙座位數 × 該艙一般 1 位最低票價（整架）；自創航班＝人數 × 經濟艙一般 1 位最低票價。核准時替團體帳號建立團體訂位
      （同一套 finish：名單、整團劃位、尾款提醒、開票一人一 PNR 都照團體規則），訂金 10% 開請款單，7 天內沒付就取消並釋出（新航班一併取消）。 ══ */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}}
function M(v){try{return fmtAmt(Math.round(+v||0),'TWD')}catch(_){return 'NT$'+Math.round(+v||0).toLocaleString()}}
function days(a,b){return Math.round((Date.parse(b+'T12:00:00')-Date.parse(a+'T12:00:00'))/86400000)}
function save1(){try{save()}catch(_){}}
function R(){return S.charterReqsR1026C=S.charterReqsR1026C||[]}
function who(){return (S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'desk'}
function userOf(id){return (S.users||[]).filter(function(u){return u&&u.id===id})[0]||null}
function me(){if(!S.user)return null;return userOf(S.user.id)||S.user}
function city(c){try{return (z()?CITY_ZH:(typeof CITY_EN!=='undefined'?CITY_EN:CITY_ZH))[c]||c}catch(_){return c}}
var LEAD={charter:183,custom:90},TYPES=['A21N','B78X','B789','B779','A359','A35K','A339R','A339L','A388'];
var KIND={charter_existing:['包下現有航班（整班）','Charter a scheduled flight'],charter_extra:['加開包機（另加一架）','Charter an extra aircraft'],custom:['自創航班','Custom flight']};
function kindName(k){var x=KIND[k]||[k,k];return z()?x[0]:x[1]}
function leadOf(k){return k==='custom'?LEAD.custom:LEAD.charter}
function allF(){try{return [].concat(FLIGHTS,S.customFlights||[])}catch(_){return []}}
function opOn(f,d){if(f.effFrom&&d<f.effFrom)return false;if(f.effTo&&d>f.effTo)return false;try{if(typeof window.flyOn==='function')return !!window.flyOn(f,d)}catch(_){}return true}   /* 網站的 flyOn（營運日、冬夏季） */
function legOfCode(code,d){var c=String(code||'').toUpperCase().replace(/\s/g,'');var L=allF().filter(function(f){return f&&f.code===c&&!f.via&&!f.partner&&!f.codeshare});if(!L.length)return null;
  var on=L.filter(function(f){return opOn(f,d)})[0]||null;if(!on)return null;var f=Object.assign({},on,{date:d});try{if(window.kgmApplySeasonR112){var g=window.kgmApplySeasonR112(f,d);if(g)f=Object.assign({},g,{date:d})}}catch(_){}return f}
function typeOf(f){try{return acftOfFlight(f.code,f.date,f.fr,f.to)||f.acft}catch(_){return f.acft}}
/* 各艙座位數：機型座位圖的實際座位（seatSections7）；沒有就用 AC 表 */
function cabSeats(t){var o={Economy:0,Premium:0,Business:0,First:0};
  try{(window.seatSections7(t)||[]).forEach(function(s){var n=0;(s.rows||[]).forEach(function(r){(r.cells||[]).forEach(function(c){if(c&&c.id)n++})});if(s.name in o)o[s.name]+=n;else if(/Suite|First/.test(s.name))o.First+=n})}catch(_){}   /* 座位圖：rows[].cells[] 有 id 的格子 */
  if(!o.Economy){try{var c=(AC[t]||{}).cabins||{};o.Economy=+(c.econ&&c.econ.seats)||0;o.Premium=+(c.prem&&c.prem.seats)||0;o.Business=+(c.biz&&c.biz.seats)||0;o.First=+(c.suite&&c.suite.seats)||0}catch(_){}}
  return o}
/* 一般旅客 1 位的最低票價（不看剩幾位：包機是整架）；算不出來用距離估 */
function seatPrice(f,cab){var best=null;window.__grp25raw=1;
  try{Object.keys(FARES).forEach(function(cd){var x=FARES[cd];if(!x||x.cabin!==cab||!x.familyR48||x.groupPlanR1026C)return;var p=0;try{p=+owPrice(f,cd,1)||0}catch(_){}if(p>0&&(best==null||p<best))best=p})}finally{window.__grp25raw=0}
  if(best==null){var km=1200;try{km=+distOf(f.fr,f.to)||1200}catch(_){}best=Math.round(Math.max(3200,km*4.2)*({Economy:1,Premium:1.8,Business:3.6,First:6}[cab]||1)/10)*10}
  return Math.round(best)}
function quoteLeg(r,f,t){var cs=cabSeats(t),lines=[],sum=0;
  if(r.kind==='custom'){var p=seatPrice(f,'Economy');lines.push({cab:'Economy',n:r.pax,p:p});sum=r.pax*p}
  else ['First','Business','Premium','Economy'].forEach(function(c){if(!cs[c])return;var p=seatPrice(f,c);lines.push({cab:c,n:cs[c],p:p});sum+=cs[c]*p});
  return {sum:sum,lines:lines,seats:cs}}
function cabZh(c){return z()?({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙'}[c]||c):c}
/* 申請的每一段：{fr,to,date,code(包現有班才有),time} */
function legsOf(r){var L=[{fr:r.fr,to:r.to,date:r.date,code:r.code||'',time:r.time||''}];if(r.retDate)L.push({fr:r.to,to:r.fr,date:r.retDate,code:r.retCode||'',time:r.retTime||''});return L}
/* 這一班這一天已經有的一般（非模擬、不是這個團體）訂位人數 */
function realOn(code,date,uid){var n=0;try{(S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled'||b.userId===uid&&b.charterR1026C)return;if(window.kgmIsMockBookingR1026C&&window.kgmIsMockBookingR1026C(b))return;
  var segs=[[b.outF],[b.inbF]].concat((b.mcFlights||[]).map(function(m){return [m&&m.f]}));segs.forEach(function(x){var f=x[0];if(f&&f.code===code&&f.date===date)n+=(b.paxList||[]).length||1})})}catch(_){}return n}
function mail(ev,r,msg,extra){try{if(typeof kgmNotify!=='function')return;var u=userOf(r.userId)||{};Promise.resolve(kgmNotify(ev,Object.assign({email:(r.contact&&r.contact.email)||u.email||'',name:(r.contact&&r.contact.name)||u.name||'',caseNo:r.id,agency:r.company||'',message:msg},extra||{}))).catch(function(){})}catch(_){}}
function newId(){var d=T().replace(/-/g,'').slice(2,6),n=R().length+1;return 'CHR'+d+'-'+String(100+n).slice(-3)}
window.kgmCharterPendR1026C=function(){return R().filter(function(r){return r&&r.status==='pending'}).length};

/* ── ① 前台：申請 ── */
window.kgmCharterOpenR1026C=function(k){S.k27cr={kind:k==='custom'?'custom':'charter_existing',msg:''};try{render()}catch(_){}setTimeout(function(){try{var e=document.getElementById('k27cr-form');if(e)e.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){}},60)};
function val(id){var e=document.getElementById(id);return e?String(e.value||'').trim():''}
var FIELDS=['k27c-name','k27c-code','k27c-date','k27c-rcode','k27c-ret','k27c-pax','k27c-fr','k27c-to','k27c-time','k27c-rtime','k27c-type','k27c-plan','k27c-notes'];
function keep(){var D=S.k27cr;if(!D)return;D.v=D.v||{};FIELDS.forEach(function(id){var e=document.getElementById(id);if(e)D.v[id]=e.value})}
function dv(id){var D=S.k27cr||{};return E(((D.v||{})[id])||'')}
window.kgmCharterKindR1026C=function(k){keep();S.k27cr=S.k27cr||{};S.k27cr.kind=k;S.k27cr.msg='';try{render()}catch(_){}};
window.kgmCharterSubmitR1026C=function(){keep();var D=S.k27cr||{},u=me(),a=u&&u.groupAccountR1025B;
  var st=window.kgmGrpAcctStateR1026C?window.kgmGrpAcctStateR1026C():'';if(!u||!a||st!=='open'){D.msg=z()?'需要已核准、且在開放期間內的團體帳號。':'An active group account is required.';try{render()}catch(_){}return}
  var k=D.kind,r={id:newId(),kind:k,userId:u.id,company:a.company||'',taxId:a.taxId||'',caseNo:a.caseNo||'',contact:a.contact||{},status:'pending',createdAt:new Date().toISOString(),
    date:val('k27c-date'),retDate:val('k27c-ret'),pax:Math.round(+val('k27c-pax')||0),plan:val('k27c-plan')||'U',name:val('k27c-name'),notes:val('k27c-notes'),history:[]};
  var bad=function(m){D.msg=m;try{render()}catch(_){}};
  if(!/^\d{4}-\d\d-\d\d$/.test(r.date))return bad(z()?'請選出發日期。':'Pick a date.');
  var lead=leadOf(k),d0=days(T(),r.date);if(d0<lead)return bad(z()?(k==='custom'?'自創航班':'包機')+'須於起飛前 '+lead+' 天（'+(k==='custom'?'三個月':'半年')+'）以前申請；最早可選 '+AD(T(),lead)+'。':'Too late.');
  if(r.retDate&&r.retDate<r.date)return bad(z()?'回程日期不能早於去程。':'Return before outbound.');
  if(!r.name)return bad(z()?'請填團名或活動名稱。':'Group name required.');
  if(k==='charter_existing'){r.code=val('k27c-code').toUpperCase().replace(/\s/g,'');r.retCode=val('k27c-rcode').toUpperCase().replace(/\s/g,'');
    var f=legOfCode(r.code,r.date);if(!f)return bad(z()?r.code+' 在 '+r.date+' 沒有飛（請確認班號與日期）。':'Not operating.');r.fr=f.fr;r.to=f.to;
    if(r.retDate){var g=legOfCode(r.retCode,r.retDate);if(!g)return bad(z()?'回程 '+(r.retCode||'（未填班號）')+' 在 '+r.retDate+' 沒有飛。':'Return not operating.');if(g.fr!==f.to||g.to!==f.fr)return bad(z()?'回程班號的航線要跟去程相反（'+f.to+'→'+f.fr+'）。':'Return route mismatch.')}
    var cs=cabSeats(typeOf(f)),tot=cs.Economy+cs.Premium+cs.Business+cs.First;if(!r.pax)r.pax=tot;if(r.pax>tot)return bad(z()?'人數超過這班的座位數（'+tot+' 位）。':'Too many.')}
  else{r.fr=val('k27c-fr').toUpperCase();r.to=val('k27c-to').toUpperCase();r.type=val('k27c-type');r.time=val('k27c-time');r.retTime=val('k27c-rtime');
    try{if(!CITY_ZH[r.fr]||!CITY_ZH[r.to])return bad(z()?'請用機場代碼選出發地與目的地（例如 TPE、NRT）。':'Pick airports.')}catch(_){}
    if(r.fr===r.to)return bad(z()?'出發地與目的地不能相同。':'Same airport.');
    if(k==='charter'||k==='charter_extra')r.kind='charter_extra';
    if(!(r.pax>=10))return bad(z()?'人數至少 10 位。':'At least 10.');
    if(r.type){var cs2=cabSeats(r.type),t2=cs2.Economy+cs2.Premium+cs2.Business+cs2.First;if(t2&&r.pax>t2)return bad(z()?r.type+' 只有 '+t2+' 個座位。':'Too many for this type.')}}
  if(!(r.pax>=10))return bad(z()?'人數至少 10 位。':'At least 10.');
  r.history.push({at:r.createdAt,act:z()?'送出申請':'Submitted',by:'customer'});R().unshift(r);S.k27cr=null;S.k27crMsg=(z()?'✓ 已送出 ':'✓ Submitted ')+r.id+(z()?'，KGM 團體業務審核後會寄信回覆（核准會給班號與報價）。':'');
  mail('group.charter_received',r,(z()?kindName(r.kind)+'申請已收到（'+r.id+'）：'+r.fr+'→'+r.to+' '+r.date+(r.retDate?'，回程 '+r.retDate:'')+'，'+r.pax+' 位。團體業務會依機隊與時刻安排後回覆。':'Request received.'));
  try{kgmNotify('internal.group_request',{email:'groups@kgm-airways.com',caseNo:r.id,message:(z()?'新的'+kindName(r.kind)+'申請：':'New request: ')+r.company+' '+r.fr+'→'+r.to+' '+r.date+' '+r.pax+(z()?' 位':' pax')})}catch(_){}
  try{logAct(z()?'包機／自創航班申請':'Charter request',r.id+' '+r.company)}catch(_){}save1();try{render()}catch(_){}};
window.kgmCharterCancelR1026C=function(id){var r=R().filter(function(x){return x.id===id})[0];if(!r||r.status!=='pending')return;if(!confirm(z()?'撤回這筆申請？':'Withdraw?'))return;r.status='cancelled';r.history.push({at:new Date().toISOString(),act:z()?'申請人撤回':'Withdrawn',by:'customer'});save1();try{render()}catch(_){}};
var STZ={pending:['審核中','Under review','#8A5A00','#FFF4E0'],approved:['已核准','Approved','#0B6B48','#E9F5EF'],declined:['未核准','Declined','#9B1C1C','#FDECEC'],cancelled:['已撤回／取消','Cancelled','#6B6F6C','#F1F2F1']};
function chip(st){var x=STZ[st]||[st,st,'#555','#eee'];return '<span class="k27cr-st" style="color:'+x[2]+';background:'+x[3]+'">'+(z()?x[0]:x[1])+'</span>'}
function form(){var D=S.k27cr;if(!D)return '';var k=D.kind,ex=k==='charter_existing',cu=k==='custom',lead=leadOf(k),min=AD(T(),lead);
  var tabs=(cu?'':'<div class="k27cr-kinds"><button type="button" class="'+(ex?'on':'')+'" onclick="kgmCharterKindR1026C(\'charter_existing\')">'+kindName('charter_existing')+'</button><button type="button" class="'+(k==='charter_extra'?'on':'')+'" onclick="kgmCharterKindR1026C(\'charter_extra\')">'+kindName('charter_extra')+'</button></div>');
  var plan='<label><span>'+(z()?'團體方案（改退費、名單與尾款期限）':'Group plan')+'</span><select id="k27c-plan"><option value="U">'+(z()?'團體彈性 U（名單 14 天、尾款 7 天前）':'Group Flex (U)')+'</option><option value="Q"'+(dv('k27c-plan')==='Q'?' selected':'')+'>'+(z()?'團體優惠 Q（名單 28 天、尾款 21 天前）':'Group Saver (Q)')+'</option></select></label>';
  var types='<option value="">'+(z()?'由 KGM 建議':'KGM to suggest')+'</option>'+TYPES.map(function(t){var n='';try{n=(AC[t]||{}).nm||''}catch(_){}return '<option value="'+t+'"'+(dv('k27c-type')===t?' selected':'')+'>'+t+(n?' · '+E(n):'')+'</option>'}).join('');
  var f=ex?('<label><span>'+(z()?'去程班號':'Flight')+'</span><input id="k27c-code" value="'+dv('k27c-code')+'" placeholder="KX180"></label><label><span>'+(z()?'去程日期':'Date')+'</span><input id="k27c-date" value="'+dv('k27c-date')+'" type="date" min="'+min+'"></label>'
      +'<label><span>'+(z()?'回程班號（選填）':'Return flight (optional)')+'</span><input id="k27c-rcode" value="'+dv('k27c-rcode')+'" placeholder="KX181"></label><label><span>'+(z()?'回程日期（選填）':'Return date')+'</span><input id="k27c-ret" value="'+dv('k27c-ret')+'" type="date" min="'+min+'"></label>'
      +'<label><span>'+(z()?'旅客人數（空白＝整架座位）':'Travellers (blank = all seats)')+'</span><input id="k27c-pax" value="'+dv('k27c-pax')+'" type="number" min="10"></label>')
    :('<label><span>'+(z()?'出發地（機場代碼）':'From')+'</span><input id="k27c-fr" value="'+dv('k27c-fr')+'" placeholder="TPE" maxlength="3"></label><label><span>'+(z()?'目的地（機場代碼）':'To')+'</span><input id="k27c-to" value="'+dv('k27c-to')+'" placeholder="KIX" maxlength="3"></label>'
      +'<label><span>'+(z()?'去程日期':'Date')+'</span><input id="k27c-date" value="'+dv('k27c-date')+'" type="date" min="'+min+'"></label><label><span>'+(z()?'希望起飛時間（選填）':'Preferred time')+'</span><input id="k27c-time" value="'+dv('k27c-time')+'" type="time"></label>'
      +'<label><span>'+(z()?'回程日期（選填）':'Return date')+'</span><input id="k27c-ret" value="'+dv('k27c-ret')+'" type="date" min="'+min+'"></label><label><span>'+(z()?'回程希望起飛時間（選填）':'Return time')+'</span><input id="k27c-rtime" value="'+dv('k27c-rtime')+'" type="time"></label>'
      +'<label><span>'+(z()?'總人數':'Travellers')+'</span><input id="k27c-pax" value="'+dv('k27c-pax')+'" type="number" min="10"></label><label><span>'+(z()?'希望機型':'Preferred aircraft')+'</span><select id="k27c-type">'+types+'</select></label>');
  var note=cu?(z()?'自創航班：至少起飛前 90 天（三個月）申請。費用＝人數 × 該航線經濟艙一般最低票價；KGM 依機隊安排可用飛機，核准後給班號並寫進那架飛機的班表。':'Custom flight: at least 90 days ahead.')
    :(ex?(z()?'包下現有航班：至少起飛前 183 天（半年）申請；整班只給貴團，費用＝各艙座位數 × 各艙一般最低票價。這一天如果已經有一般旅客訂位，無法整班包下。':'Charter a scheduled flight: at least 183 days ahead.')
        :(z()?'加開包機：至少起飛前 183 天（半年）申請；KGM 另派一架飛機，費用＝各艙座位數 × 各艙一般最低票價。':'Extra charter: at least 183 days ahead.'));
  return '<section class="k27cr-form" id="k27cr-form"><header><div><small>'+(cu?'CUSTOM FLIGHT':'CHARTER')+'</small><h2>'+(cu?(z()?'自創航班申請':'Custom flight request'):(z()?'包機申請':'Charter request'))+'</h2><p>'+note+'</p></div><button type="button" class="k27cr-x" onclick="S.k27cr=null;render()" aria-label="close">×</button></header>'+tabs
    +'<div class="k27cr-grid"><label class="w2"><span>'+(z()?'團名／活動名稱':'Group / event name')+'</span><input id="k27c-name" value="'+dv('k27c-name')+'" placeholder="'+(z()?'例：2027 員工旅遊・北海道':'e.g. Incentive 2027')+'"></label>'+f+plan
    +'<label class="w2"><span>'+(z()?'其他需求（選填）':'Notes (optional)')+'</span><textarea id="k27c-notes" rows="2">'+dv('k27c-notes')+'</textarea></label></div>'
    +(D.msg?'<div class="k27cr-err">'+E(D.msg)+'</div>':'')+'<footer><span>'+(z()?'最早可選 ':'Earliest ')+min+'</span><button type="button" class="k25g-btn" onclick="kgmCharterSubmitR1026C()">'+(z()?'送出申請':'Submit')+'</button></footer></section>'}
function frontList(){var u=me();if(!u)return '';var L=R().filter(function(r){return r&&r.userId===u.id});if(!L.length)return '';
  return '<section class="k27cr-list"><h3>'+(z()?'包機／自創航班申請':'Charter & custom flight requests')+'</h3>'+L.map(function(r){var g=r.groupId&&(S.groupsR1023A||[]).filter(function(x){return x.id===r.groupId})[0];
    return '<article><div class="k27cr-h"><b>'+E(r.name||r.id)+'</b>'+chip(r.status)+'</div><div class="k27cr-m">'+E(r.id)+' · '+kindName(r.kind)+' · '+E(r.fr)+'→'+E(r.to)+' '+E(r.date)+(r.retDate?(z()?'，回程 ':' · return ')+E(r.retDate):'')+' · '+r.pax+(z()?' 位':' pax')+'</div>'
      +(r.status==='approved'?'<div class="k27cr-ok">'+(z()?'班號 ':'Flights ')+'<b>'+E((r.flights||[]).map(function(f){return f.code+' '+f.fr+'→'+f.to+' '+f.date+' '+f.dep+'–'+f.arr+' '+f.type}).join('；'))+'</b><br>'+(z()?'報價 ':'Quote ')+'<b>'+M(r.quote)+'</b>'+(g?' · '+(z()?'團體案件編號 ':'Case ')+'<a href="javascript:void 0" onclick="S.grpViewR1023A={id:\''+E(g.id)+'\'};render()">'+E(g.id)+'</a>':'')
        +(g&&g.status==='quoted'&&g.deposit&&g.deposit.token?' <button type="button" class="k25g-btn sm" onclick="kgmOpenPayR45(\''+E(g.deposit.token)+'\')">'+(z()?'付訂金 ':'Pay deposit ')+M(g.deposit.amount)+(z()?'（'+E(g.deposit.due)+' 前）':'')+'</button>':'')+'</div>':'')
      +(r.status==='declined'?'<div class="k27cr-no">'+(z()?'原因：':'Reason: ')+E(r.declineWhy||'—')+'</div>':'')
      +(r.status==='pending'?'<div class="k27cr-a"><button type="button" class="k25g-btn ghost sm" onclick="kgmCharterCancelR1026C(\''+E(r.id)+'\')">'+(z()?'撤回申請':'Withdraw')+'</button></div>':'')+'</article>'}).join('')+'</section>'}
window.kgmCharterFrontR1026C=function(){return (S.k27crMsg?'<div class="k25g-msg">'+E(S.k27crMsg)+'</div>':'')+form()+frontList()};

/* ── ② 後台：審核 ── */
/* 新航班：飛機要回基地 —— 去程＝載客去＋空機回（同一天）；回程在別天＝空機去＋載客回；去回同一天＝兩段都載客。空機段不販售、不收費。 */
function tzH(a){try{return +TZ[a]||8}catch(_){return 8}}
function durM(fr,to){var d=1200;try{d=+distOf(fr,to)||1200}catch(_){}return Math.round(Math.max(55,d/780*60+35)/5)*5}
function tmin(t){return t?((+t.slice(0,2))*60+(+t.slice(3,5))):null}
function planItem(r,leg,mode,leg2){var P,pref=tmin(leg.time);
  if(mode==='ferrySvc'){P={fr:leg.to,to:leg.fr};if(pref!=null){var tn=(r.type==='A388')?120:(/^A21/.test(r.type||'')?60:90);pref=pref-tn-durM(leg.to,leg.fr)-Math.round((tzH(leg.fr)-tzH(leg.to))*60)}}
  else P={fr:leg.fr,to:leg.to};
  P=Object.assign(P,{kind:'temp',date:leg.date,type:r.type||'',time:pref,round:true,sale:false,at:Date.now()});
  var o=null;try{o=window.kgmTempPlanR1026C?window.kgmTempPlanR1026C(P):null}catch(_){}
  return {leg:leg,leg2:leg2||null,mode:mode,p:{P:P,opts:(o&&o.opts)||[],why:o&&o.r&&o.r.why}}}
function pick(r,i){return ((S.k27crPick||{})[r.id]||{})[i]||0}
window.kgmCharterPickR1026C=function(id,i,j){S.k27crPick=S.k27crPick||{};S.k27crPick[id]=S.k27crPick[id]||{};S.k27crPick[id][i]=+j;try{render()}catch(_){}};
var PLCACHE={};
function deskLegs(r){var key=r.id+'|'+(r.type||'')+'|'+((S.customFlights||[]).length)+'|'+Math.floor(Date.now()/20000);if(PLCACHE[key])return PLCACHE[key];
  var L=legsOf(r),out=[];
  if(!L[0].code&&L[1]&&L[1].date===L[0].date)out.push(planItem(r,L[0],'svcSvc',L[1]));
  else L.forEach(function(leg,i){if(leg.code){var f=legOfCode(leg.code,leg.date);out.push({leg:leg,f:f,type:f&&typeOf(f),real:f?realOn(f.code,leg.date,r.userId):0});return}
    out.push(planItem(r,leg,i===0?'svcFerry':'ferrySvc'))});
  PLCACHE={};PLCACHE[key]=out;return out}
/* 這個方案裡「載客」的段（給報價、訂位、通知用） */
function svcOf(L,o){var P=L.p.P,d2=AD(P.date,o.rdd||0);
  var out={fr:P.fr,to:P.to,date:P.date,dep:o.dep,arr:o.arr,dd:o.dd,acft:o.type,dur:o.du},back={fr:P.to,to:P.fr,date:d2,dep:o.rdep,arr:o.rarr,dd:(o.rad||0)-(o.rdd||0),acft:o.type,dur:o.du};
  return L.mode==='svcSvc'?[out,back]:(L.mode==='svcFerry'?[out]:[back])}
function legQuote(r,L,i){if(L.f)return quoteLeg(r,L.f,L.type);var o=L.p&&L.p.opts[pick(r,i)];if(!o)return null;var sum=0,lines=[];
  svcOf(L,o).forEach(function(x){var q=quoteLeg(r,Object.assign({code:'KX0000'},x),o.type);sum+=q.sum;lines=lines.concat(q.lines)});return {sum:sum,lines:lines}}
function optTxt(L,o){var dd=function(n){return n>0?'⁺'+n:''},P=L.p.P,a=P.fr+' '+o.dep+' → '+P.to+' '+o.arr+dd(o.dd),b=P.to+' '+o.rdep+dd(o.rdd)+' → '+P.fr+' '+o.rarr+dd(o.rad);
  if(L.mode==='svcSvc')return a+'　'+(z()?'回程 ':'return ')+b;
  if(L.mode==='svcFerry')return a+'　<i>'+(z()?'（空機回 ':'(ferry ')+b+')</i>';
  return '<i>'+(z()?'（空機去 ':'(ferry ')+a+')</i>　'+b}
function deskCard(r){var open=r.status==='pending',LS=open?deskLegs(r):[],tot=0,ok=open;
  var legs=open?LS.map(function(L,i){var q=legQuote(r,L,i);if(q)tot+=q.sum;else ok=false;
    var lab=L.leg2?(z()?'去回程（同一天）':'Out & return (same day)'):((L.leg.fr===r.fr)?(z()?'去程':'Outbound'):(z()?'回程':'Return'));
    var h='<div class="k27cd-leg"><div class="k27cd-lh"><b>'+lab+'</b> '+E(L.leg.fr)+' '+E(city(L.leg.fr))+' → '+E(L.leg.to)+' '+E(city(L.leg.to))+' · '+E(L.leg.date)+(L.leg2?' ⇄':'')+'</div>';
    if(L.leg.code){if(!L.f){ok=false;return h+'<div class="k27cd-bad">'+E(L.leg.code)+(z()?' 這一天沒有飛':' not operating')+'</div></div>'}
      if(L.real>0)ok=false;
      h+='<div class="k27cd-opt on"><b>'+E(L.f.code)+'</b> '+E(L.f.dep)+'–'+E(L.f.arr)+' · '+E(L.type)+' · '+(z()?'座位 ':'Seats ')+(function(c){return ['First','Business','Premium','Economy'].filter(function(k){return c[k]}).map(function(k){return cabZh(k)+' '+c[k]}).join('／')})(cabSeats(L.type))+'</div>'
        +(L.real>0?'<div class="k27cd-bad">'+(z()?'這一班這一天已有 '+L.real+' 位一般旅客訂位，不能整班包下（請先跟申請人改日期，或把這些旅客改到其他班）。':L.real+' passengers already booked.')+'</div>':'<div class="k27cd-good">'+(z()?'這一天沒有一般旅客訂位，可以整班包下。':'No other bookings.')+'</div>')}
    else{var P=L.p||{opts:[]};if(!P.opts.length){ok=false;h+='<div class="k27cd-bad">'+(z()?'這一天找不到「當時已經在 '+E(P.P.fr)+'」而且前後勤務排得開的飛機'+(r.type?'（'+E(r.type)+'）':'')+'；可以請申請人改日期或機型。':'No aircraft available.')+'</div>'}
      else h+='<div class="k27cd-sug">'+(z()?'可用飛機（機身當時已在 '+E(P.P.fr)+'、前後勤務排得開、不在凌晨抵達；空機段不販售、不收費）':'Available aircraft')+(P.why?' · '+E(P.why):'')+'</div>'+P.opts.map(function(o,j){var on=pick(r,i)===j;return '<label class="k27cd-opt'+(on?' on':'')+'"><input type="radio" name="k27p'+E(r.id)+i+'" '+(on?'checked':'')+' onchange="kgmCharterPickR1026C(\''+E(r.id)+'\','+i+','+j+')"><b>'+E(o.type)+' '+E(o.tail)+'</b> '+optTxt(L,o)+'</label>'}).join('')}
    if(q)h+='<div class="k27cd-q">'+q.lines.map(function(x){return cabZh(x.cab)+' '+x.n+' × '+M(x.p)}).join(' ＋ ')+' ＝ <b>'+M(q.sum)+'</b></div>';
    return h+'</div>'}).join(''):'';
  var head='<div class="k27cd-h"><div><b>'+E(r.name||r.id)+'</b>'+chip(r.status)+'<small>'+E(r.id)+' · '+kindName(r.kind)+' · '+E(r.company)+' · '+(z()?'綁定案件 ':'Case ')+E(r.caseNo)+'</small></div><div class="k27cd-n"><b>'+r.pax+'</b><small>'+(z()?'位':'pax')+'</small></div></div>'
    +'<div class="k27cd-m">'+E(r.fr)+'→'+E(r.to)+' '+E(r.date)+(r.retDate?(z()?'，回程 ':' · return ')+E(r.retDate):'')+(r.type?' · '+(z()?'希望機型 ':'Type ')+E(r.type):'')+' · '+(z()?'方案 ':'Plan ')+E(r.plan)+' · '+(z()?'距起飛 ':'Lead ')+days(T(),r.date)+(z()?' 天':' d')+(r.notes?'<br>'+(z()?'備註：':'Notes: ')+E(r.notes):'')+'</div>';
  if(!open)return '<article class="k27cd">'+head+(r.status==='approved'?'<div class="k27cr-ok">'+E((r.flights||[]).map(function(f){return f.code+' '+f.fr+'→'+f.to+' '+f.date+' '+f.dep+'–'+f.arr+' '+f.type+(f.tail?' '+f.tail:'')}).join('；'))+' · '+M(r.quote)+(r.groupId?' · '+E(r.groupId):'')+((r.ferries||[]).length?'<br><small>'+(z()?'空機段（不販售）：':'Ferry: ')+E(r.ferries.map(function(f){return f.code+' '+f.fr+'→'+f.to+' '+f.date+' '+f.dep}).join('；'))+'</small>':'')+'</div>':'')+(r.status==='declined'?'<div class="k27cr-no">'+E(r.declineWhy||'')+'</div>':'')+'</article>';
  return '<article class="k27cd open">'+head+legs+'<div class="k27cd-f"><div class="k27cd-tot">'+(z()?'報價合計 ':'Quote ')+'<b>'+(ok?M(tot):'—')+'</b><small>'+(r.kind==='custom'?(z()?'人數 × 經濟艙一般最低票價':'pax × lowest economy fare'):(z()?'各艙座位數 × 各艙一般最低票價（整架）':'all seats × lowest fare per cabin'))+'</small></div>'
    +'<input id="k27cd-why-'+E(r.id)+'" placeholder="'+(z()?'不核准的原因（婉拒時必填）':'Reason (to decline)')+'"><button type="button" class="k25g-btn ghost" onclick="kgmCharterDeclineR1026C(\''+E(r.id)+'\')">'+(z()?'不核准':'Decline')+'</button><button type="button" class="k25g-btn" '+(ok?'':'disabled')+' onclick="kgmCharterApproveR1026C(\''+E(r.id)+'\')">'+(z()?'核准・建立航班':'Approve')+'</button></div></article>'}
window.kgmCharterDeskR1026C=function(){var L=R().slice().sort(function(a,b){return (a.status==='pending'?0:1)-(b.status==='pending'?0:1)||String(b.createdAt).localeCompare(String(a.createdAt))});
  return '<header class="k27cd-top"><div><h2>'+(z()?'包機／自創航班':'Charter & custom flights')+'</h2><p>'+(z()?'團體帳號在前台送出的申請。包機至少起飛前 183 天、自創航班至少 90 天。選一架可用的飛機按核准：系統建立航班（給班號、寫進那架飛機的班表）、替團體建立團體訂位並開訂金請款單（7 天內付款）。':'Requests from group accounts.')+'</p></div></header>'
    +(S.k27cdMsg?'<div class="k25g-msg">'+E(S.k27cdMsg)+'</div>':'')+(L.length?L.map(deskCard).join(''):'<div class="k27cd-empty">'+(z()?'目前沒有申請。':'No requests.')+'</div>')};
window.kgmCharterDeclineR1026C=function(id){var r=R().filter(function(x){return x.id===id})[0];if(!r||r.status!=='pending')return;var why=val('k27cd-why-'+id);if(!why){S.k27cdMsg=z()?'請先填不核准的原因（會寄給申請人）。':'Enter a reason.';try{render()}catch(_){}return}
  r.status='declined';r.declineWhy=why;r.history.push({at:new Date().toISOString(),act:(z()?'不核准：':'Declined: ')+why,by:who()});mail('group.charter_declined',r,(z()?'很抱歉，'+kindName(r.kind)+'申請 '+r.id+' 無法承接：'+why:'Declined: '+why));
  S.k27cdMsg=(z()?'已回覆不核准 ':'Declined ')+r.id;try{logAct(z()?'包機申請不核准':'Charter declined',r.id+' '+why)}catch(_){}save1();try{render()}catch(_){}};
/* 販售對象：這一班這一天只開放這個團體帳號（ch27 規則帶 owner） */
function lockFlight(code,date,r){S.salesModeR1026C=S.salesModeR1026C||{rules:[]};S.salesModeR1026C.rules=S.salesModeR1026C.rules||[];
  S.salesModeR1026C.rules.push({id:'SM'+Date.now().toString(36)+Math.floor(Math.random()*99),code:code,from:date,to:date,mode:'charter',owner:r.userId,reqId:r.id,at:new Date().toISOString(),by:who()})}
window.kgmCharterApproveR1026C=function(id){var r=R().filter(function(x){return x.id===id})[0];if(!r||r.status!=='pending')return;var LS=deskLegs(r),fl=[],tot=0,bad='';
  LS.forEach(function(L,i){if(bad)return;var q=legQuote(r,L,i);if(!q){bad=z()?'第 '+(i+1)+' 段沒有可用的方案':'No option';return}
    if(L.leg.code){if(!L.f||L.real>0){bad=z()?L.leg.code+' 不能整班包下':'Cannot charter';return}fl.push({code:L.f.code,fr:L.f.fr,to:L.f.to,date:L.leg.date,dep:L.f.dep,arr:L.f.arr,dd:L.f.dd||0,type:L.type,existing:true,f:L.f});tot+=q.sum;return}
    fl.push({L:L,plan:L.p.P,opt:L.p.opts[pick(r,i)],q:q});tot+=q.sum});
  if(bad){S.k27cdMsg=bad;try{render()}catch(_){}return}
  if(!confirm((z()?'核准 '+r.id+'？\n':'Approve '+r.id+'?\n')+(z()?'報價 ':'Quote ')+M(tot)+'\n'+(z()?'新航班會寫進所選飛機的班表；團體帳號會收到班號與訂金請款單。':'')))return;
  /* 建立新航班（同一套 kgmTempCreateR1026C：S.customFlights＋S.tailAssign，機隊重排保留） */
  var made=[];fl.forEach(function(x){if(x.existing){lockFlight(x.code,x.date,r);made.push({code:x.code,fr:x.fr,to:x.to,date:x.date,dep:x.dep,arr:x.arr,dd:x.dd,type:x.type,existing:true});return}
    var n0=(S.customFlights||[]).length;try{window.kgmTempCreateR1026C(x.plan,x.opt)}catch(e){bad=String(e&&e.message||e)}
    var nf=(S.customFlights||[]).slice(n0);if(nf.length<2){bad=bad||(z()?'建立航班失敗':'Create failed');return}
    var svc=x.L.mode==='svcSvc'?[0,1]:(x.L.mode==='svcFerry'?[0]:[1]);
    nf.forEach(function(f,k){f.charterR1026C=r.id;f.charterOwnerR1026C=r.userId;
      if(svc.indexOf(k)<0){f.ferryR1026C=true;f.noSaleR913=true;(r.ferries=r.ferries||[]).push({code:f.code,fr:f.fr,to:f.to,date:f.effFrom,dep:f.dep,arr:f.arr,type:f.acft,tail:x.opt.tail});return}
      f.noSaleR913=false;lockFlight(f.code,f.effFrom,r);made.push({code:f.code,fr:f.fr,to:f.to,date:f.effFrom,dep:f.dep,arr:f.arr,dd:f.dd||0,type:f.acft,tail:x.opt.tail,created:true})})});
  if(bad){S.k27cdMsg=bad;try{render()}catch(_){}return}
  /* 團體訂位（主訂位：人數＝申請人數，名單 TBA；票價＝報價） */
  var u=userOf(r.userId)||{},a=u.groupAccountR1025B||{},cab='Economy',gc=null;try{gc=window.kgmGrpCodeR1025B(cab,r.plan==='Q'?'Q':'U')}catch(_){}
  var seg=function(m){var f=allF().filter(function(q){return q&&q.code===m.code&&q.fr===m.fr&&q.to===m.to})[0]||{};return Object.assign({},f,{code:m.code,fr:m.fr,to:m.to,dep:m.dep,arr:m.arr,dd:m.dd,acft:m.type,date:m.date,charterR1026C:r.id})};
  var pnr='';try{pnr=genPNR()}catch(_){pnr='C'+Math.random().toString(36).slice(2,7).toUpperCase()}
  var px=[];for(var i=0;i<r.pax;i++)px.push({title:'',lastName:'TBA',firstName:'ADT'+('00'+(i+1)).slice(-3),passengerType:'ADT',email:u.email||'',groupNameTbaR1023A:true});
  var b={pnr:pnr,search:{type:made[1]?'RT':'OW',fr:r.fr,to:r.to,dep:r.date,ret:r.retDate||'',pax:r.pax,adults:r.pax,children:0,infants:0,cabin:cab,grp25:1},outF:seg(made[0]),outC:gc,inbF:made[1]?seg(made[1]):null,inbC:made[1]?gc:null,
    paxList:px,passengerCounts:{adults:r.pax,children:0,infants:0},seatPassengerCount:r.pax,addons:{},seats:{},total:tot,curr:'TWD',fareComponent:tot,mcFlights:null,bookedAt:new Date().toISOString(),userId:r.userId,status:'confirmed',
    isAward:false,email:u.email||'',charterR1026C:r.id,paymentMethod:z()?'包機／自創航班：訂金請款中':'Charter: deposit invoiced'};
  S.bookings=S.bookings||[];S.bookings.push(b);
  var g=null;try{g=window.kgmGrpFinishR1026C(b,{name:r.name,type:r.kind==='custom'?'custom':'charter',leader:'',notes:r.notes},{adults:r.pax,children:0,infants:0,seats:r.pax},{user:u,acct:a,quiet:true})}catch(e){bad=String(e&&e.message||e)}
  if(!g){S.k27cdMsg=(z()?'建立團體訂位失敗：':'Group booking failed: ')+bad;try{render()}catch(_){}return}
  /* 訂金：核准後 7 天內付（finish 預設訂金已付——這裡改成請款） */
  var dep=Math.round(tot*0.10),due=AD(T(),7);if(g.status==='paid'){/* 出發前尾款期限內：一次付清 */dep=tot}
  g.deposit={amount:dep,paid:false,due:due};g.balance.amount=tot-dep;g.status='quoted';g.charterR1026C=r.id;g.kindR1026C=r.kind;b.balanceDue=tot;
  try{var c=window.kgmCreateChargeR45({pnr:b.pnr,items:[{label:(z()?'包機／自創航班訂金 · ':'Charter deposit · ')+g.id,amount:dep}],note:(z()?'核准後 7 天內（'+due+' 前）付訂金；逾期取消並釋出座位':'Deposit due '+due)});g.deposit.chargeId=c&&c.charge&&c.charge.id;g.deposit.token=c&&c.charge&&c.charge.token}catch(_){}
  (g.history=g.history||[]).push({at:new Date().toISOString(),act:(z()?'由 '+kindName(r.kind)+'申請 '+r.id+' 核准建立；訂金 ':'Created from ')+M(dep)+(z()?' 請款中（'+due+' 前）':''),by:who()});
  r.status='approved';r.quote=tot;r.flights=made;r.groupId=g.id;r.approvedAt=new Date().toISOString();r.approvedBy=who();r.history.push({at:r.approvedAt,act:(z()?'核准：':'Approved: ')+made.map(function(m){return m.code+' '+m.date}).join('、')+' · '+M(tot),by:who()});
  mail('group.charter_approved',r,(z()?kindName(r.kind)+'申請 '+r.id+' 已核准：'+made.map(function(m){return m.code+' '+m.fr+'→'+m.to+' '+m.date+' '+m.dep+'–'+m.arr+'（'+m.type+'）'}).join('；')+'。報價 '+M(tot)+'，請於 '+due+' 前付訂金 '+M(dep)+'；團體案件編號 '+g.id+'，名單與尾款期限依'+(r.plan==='Q'?'團體優惠':'團體彈性')+'方案。':'Approved.'),{amount:dep,payUrl:g.deposit.token?'#/pay/'+g.deposit.token:''});
  try{logAct(z()?'核准包機／自創航班':'Charter approved',r.id+' '+made.map(function(m){return m.code}).join('/')+' '+M(tot))}catch(_){}
  var ecoN=0;try{ecoN=cabSeats(made[0].type).Economy}catch(_){}if(ecoN&&r.pax>ecoN)(g.history=g.history||[]).push({at:new Date().toISOString(),act:(z()?'人數 '+r.pax+' 超過經濟艙 '+ecoN+' 位：超過的旅客請在名單頁逐位改艙等（包機不另收差額）':'Move extra travellers to other cabins'),by:'system'});
  S.k27cdMsg=(z()?'✓ 已核准 ':'✓ Approved ')+r.id+'：'+made.map(function(m){return m.code+' '+m.date+(m.tail?' '+m.tail:'')}).join('、')+(z()?'；團體案件編號 ':'; case ')+g.id;PLCACHE={};save1();try{render()}catch(_){}};

/* ── ③ 訂金：付了 → 待尾款；7 天沒付 → 取消（新建的航班一併取消、販售限制拿掉） ── */
function tick(){var ch=false,td=T();(S.groupsR1023A||[]).forEach(function(g){if(!g||g.status!=='quoted'||!g.deposit)return;var c=null;try{c=(S.chargesR45||[]).filter(function(x){return x&&x.id===g.deposit.chargeId})[0]}catch(_){}
    if(c&&c.status==='paid'){g.deposit.paid=true;g.deposit.paidAt=c.paidAt||new Date().toISOString();g.status=g.balance.amount>0?'deposit_paid':'paid';(g.history=g.history||[]).push({at:new Date().toISOString(),act:(z()?'訂金已付 ':'Deposit paid ')+M(g.deposit.amount),by:'system'});var b=(S.bookings||[]).filter(function(x){return x.pnr===g.pnr})[0];if(b)b.balanceDue=g.balance.amount;ch=true;return}
    if(td>g.deposit.due){var r=R().filter(function(x){return x.id===g.charterR1026C})[0];g.status='cancelled';g.cancelWhy='deposit';(g.history=g.history||[]).push({at:new Date().toISOString(),act:z()?'訂金逾期，取消並釋出':'Deposit overdue — cancelled',by:'system'});
      var b2=(S.bookings||[]).filter(function(x){return x.pnr===g.pnr})[0];if(b2){b2.status='cancelled';b2.cancelledAt=td}try{if(c&&c.status==='unpaid')window.kgmVoidChargeR45(c.id)}catch(_){}try{if(g.balance&&g.balance.chargeId)window.kgmVoidChargeR45(g.balance.chargeId)}catch(_){}
      if(r){r.status='cancelled';r.history.push({at:new Date().toISOString(),act:z()?'訂金逾期取消':'Deposit overdue',by:'system'});
        (r.flights||[]).concat(r.ferries||[]).forEach(function(m){if(m.created||r.ferries&&r.ferries.indexOf(m)>=0){(S.customFlights||[]).forEach(function(f){if(f&&f.code===m.code&&f.charterR1026C===r.id){f.effTo=AD(f.effFrom,-1);f.cancelledR1026C=true}});Object.keys(S.tailAssign||{}).forEach(function(t){S.tailAssign[t]=(S.tailAssign[t]||[]).filter(function(x){return !(x&&x.code===m.code&&x.date===m.date)})})}});
        if(S.salesModeR1026C&&S.salesModeR1026C.rules)S.salesModeR1026C.rules=S.salesModeR1026C.rules.filter(function(x){return x.reqId!==r.id});
        mail('group.cancelled',r,(z()?'訂金未於 '+g.deposit.due+' 前付款，'+kindName(r.kind)+' '+r.id+' 已取消。':'Cancelled.'))}ch=true}});
  if(ch)save1();return ch}
window.kgmCharterTickR1026C=tick;setTimeout(tick,13000);setInterval(function(){try{if(tick())render()}catch(_){}},60000);

try{var st=document.createElement('style');st.id='kgm-cr27-css';st.textContent=''
  +'.k27cr-acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.k25g-btn.ghost{background:#fff;color:#0B3D2E;border:1px solid #0B3D2E}.k25g-btn.sm{padding:6px 12px;font-size:12.5px;min-height:0}'
  +'.k27cr-form{background:#fff;border:1px solid #DCE5E0;border-radius:16px;padding:20px 22px;margin:0 0 18px;box-shadow:0 6px 20px rgba(11,61,46,.06)}'
  +'.k27cr-form header{display:flex;justify-content:space-between;gap:12px}.k27cr-form header small{font-size:10px;letter-spacing:.18em;color:#A9822F;font-weight:800}.k27cr-form h2{margin:2px 0 4px;font-size:20px;color:#0B3D2E}.k27cr-form header p{margin:0;color:#5E6863;font-size:12.5px;line-height:1.7;max-width:720px}'
  +'.k27cr-x{border:0;background:none;font-size:24px;color:#93A099;cursor:pointer;line-height:1}'
  +'.k27cr-kinds{display:flex;gap:6px;background:#F1F4F2;border-radius:999px;padding:4px;width:max-content;max-width:100%;margin:14px 0 4px;flex-wrap:wrap}.k27cr-kinds button{border:0;background:transparent;border-radius:999px;padding:8px 16px;font:700 13px inherit;color:#55605B;cursor:pointer}.k27cr-kinds button.on{background:#0B3D2E;color:#fff}'
  +'.k27cr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;margin-top:14px}.k27cr-grid label{display:flex;flex-direction:column;gap:5px;font-size:12px;color:#55605B;font-weight:700}.k27cr-grid label.w2{grid-column:1/-1}'
  +'.k27cr-grid input,.k27cr-grid select,.k27cr-grid textarea{border:1px solid #CFD9D3;border-radius:10px;padding:10px 12px;font:500 14px inherit;color:#1F2A25;background:#fff;min-height:42px;width:100%;box-sizing:border-box}'
  +'.k27cr-err{margin-top:12px;background:#FDECEC;color:#9B1C1C;border-radius:10px;padding:9px 12px;font-size:13px}'
  +'.k27cr-form footer{display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:12px}.k27cr-form footer span{font-size:12px;color:#7A857F}'
  +'.k27cr-list{margin:0 0 18px}.k27cr-list h3{font-size:15px;color:#0B3D2E;margin:6px 0 10px}.k27cr-list article,.k27cd{background:#fff;border:1px solid #E1E8E4;border-radius:14px;padding:14px 16px;margin-bottom:10px}'
  +'.k27cr-h{display:flex;align-items:center;gap:8px;justify-content:space-between}.k27cr-st{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11.5px;font-weight:800;margin-left:8px}'
  +'.k27cr-m,.k27cd-m{font-size:12.5px;color:#5E6863;margin-top:4px;line-height:1.7}.k27cr-ok{margin-top:8px;background:#E9F5EF;border-radius:10px;padding:9px 12px;font-size:13px;color:#0B3D2E;line-height:1.8}.k27cr-no{margin-top:8px;background:#FDECEC;border-radius:10px;padding:9px 12px;font-size:13px;color:#9B1C1C}.k27cr-a{margin-top:8px;text-align:right}'
  +'.k27cd-top h2{font-size:18px;color:#0B3D2E;margin:0 0 4px}.k27cd-top p{font-size:12.5px;color:#5E6863;margin:0 0 14px;line-height:1.7}.k27cd-empty{padding:28px;text-align:center;color:#7A857F;background:#F7F9F8;border-radius:12px}'
  +'.k27cd-h{display:flex;justify-content:space-between;gap:10px}.k27cd-h small{display:block;color:#7A857F;font-size:11.5px;margin-top:3px}.k27cd-n{text-align:right}.k27cd-n b{font-size:22px;color:#0B3D2E;display:block;line-height:1}.k27cd-n small{color:#7A857F;font-size:11px}'
  +'.k27cd-leg{border-top:1px dashed #DCE5E0;margin-top:12px;padding-top:10px}.k27cd-lh{font-size:13px;color:#1F2A25;margin-bottom:6px}.k27cd-sug{font-size:11.5px;color:#7A857F;margin-bottom:6px}'
  +'.k27cd-opt{display:flex;align-items:center;gap:8px;border:1px solid #DCE5E0;border-radius:10px;padding:8px 11px;margin:5px 0;font-size:13px;cursor:pointer}.k27cd-opt.on{border-color:#0B3D2E;background:#F1F7F4}'
  +'.k27cd-bad{background:#FDECEC;color:#9B1C1C;border-radius:9px;padding:7px 10px;font-size:12.5px;margin-top:6px}.k27cd-good{background:#E9F5EF;color:#0B6B48;border-radius:9px;padding:7px 10px;font-size:12.5px;margin-top:6px}'
  +'.k27cd-q{font-size:12px;color:#55605B;margin-top:6px}.k27cd-f{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px;border-top:1px solid #E1E8E4;padding-top:12px}.k27cd-tot{flex:1 1 220px}.k27cd-tot b{font-size:18px;color:#0B3D2E}.k27cd-tot small{display:block;color:#7A857F;font-size:11px}'
  +'.k27cd-f input{flex:1 1 220px;border:1px solid #CFD9D3;border-radius:10px;padding:9px 11px;font:500 13px inherit;min-height:40px}.k27cd-f button[disabled]{opacity:.45;cursor:not-allowed}'
  +'@media(max-width:640px){.k27cr-grid{grid-template-columns:1fr}.k27cr-form{padding:16px}.k27cr-acts{justify-content:stretch}.k27cr-acts .k25g-btn{flex:1 1 100%}.k27cr-form footer{flex-direction:column;align-items:stretch}.k27cr-form footer .k25g-btn{width:100%}.k27cd-f button{flex:1 1 45%}}';
  (document.head||document.documentElement).appendChild(st)}catch(_){}
})();
