
/* ══ 1023A Q：團體（旅行團）訂位 ═════════════════════════════════════════════════════
   使用者：「要加入可以旅行團訂票那種東西定位資料也要看到哪些是旅行團那些之類的 前後台都要有專業此類系統」
   流程（業界做法）：申請 → 報價（系統自動或業務人工）→ 接受報價＝保留座位、寄訂金付款資料 → 付訂金 → 名單（可分次）→ 尾款 → 開票
   ・前台：首頁訂票卡「團體訂位」分頁、選單「優惠與訂票 → 團體訂位」（S.view='group23'）；查詢＝團號＋聯絡 Email。
   ・後台：定位管理（沒有開啟訂位時）上方「GROUP DESK」清單；團體 PNR 在定位清單有「團體」標籤、開啟後有團體資訊列。
   ・資料：S.groupsR1023A（kgm23_groups，save() 一起存）；保留座位就是一筆真正的訂位（S.bookings，group:true、fareGroup:'G'、
     名單未到前姓名 TBA），庫存（cabinInventory54）自然扣掉；付款走票務中心請款（kgmCreateChargeR45，付款連結 #/pay/…）。
   ・自動：報價 72 小時失效；訂金逾期自動取消並釋位；名單期限前 3 天提醒；尾款付清＋名單齊全自動開票。 */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
function N(n){return Number(n||0).toLocaleString('en-US')}
function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}}
function M(v){try{return fmtAmt(Math.round(+v||0),'TWD')}catch(_){return 'NT$'+N(v)}}
function G(){return S.groupsR1023A=S.groupsR1023A||[]}
function save1(){try{save()}catch(_){}}
function days(a,b){return Math.round((Date.parse(b+'T12:00:00')-Date.parse(a+'T12:00:00'))/86400000)}
var MIN=10,MAX=99;
var TYPES=[['tour','旅行團','Tour group'],['corp','企業／獎勵旅遊','Corporate / incentive'],['school','學校／遊學團','School / study tour'],['religious','宗教朝聖','Pilgrimage'],['sports','運動／表演團體','Sports / performance'],['other','其他','Other']];
var ST={requested:['待報價','Awaiting quote','#9A7B2F','#FFF6E5'],quoted:['已報價・待確認','Quoted','#1F5FA8','#EAF2FC'],held:['座位保留・待付訂金','Seats held · deposit due','#B26A00','#FFF3E0'],
  deposit_paid:['已付訂金・待名單與尾款','Deposit paid','#0B6B48','#E9F5EF'],ticketed:['已開票','Ticketed','#0B3D2E','#E3EEE9'],declined:['無法承接','Declined','#A3271C','#FDECEA'],
  expired:['逾期失效','Expired','#6B6F6C','#F1F2F1'],cancelled:['已取消','Cancelled','#6B6F6C','#F1F2F1']};
function stChip(s){var x=ST[s]||[s,s,'#555','#eee'];return '<span class="k23g-st" style="color:'+x[2]+';background:'+x[3]+'">'+E(z()?x[0]:x[1])+'</span>'}
function typeName(t){var x=TYPES.filter(function(q){return q[0]===t})[0];return x?(z()?x[1]:x[2]):t}
function cab(c){return z()?({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙'})[c]||c:c}
function ap(c){try{var m=z()?CITY_ZH:(typeof CITY_EN!=='undefined'?CITY_EN:CITY_ZH);return (m&&m[c])||c}catch(_){return c}}
function newId(){var d=T().replace(/-/g,'').slice(2,6),n=G().length+1;return 'GRP'+d+'-'+String(1000+n).slice(-3)+String.fromCharCode(65+(Date.now()%26))}
function own(){return [].concat(typeof FLIGHTS!=='undefined'?FLIGHTS:[],S.customFlights||[]).filter(function(f){return f&&!f.partner&&!f.via&&/^KX\d{1,4}$/.test(f.code)})}
function airports(){var o={};own().forEach(function(f){o[f.fr]=1;o[f.to]=1});return Object.keys(o).sort()}
function flightsOn(fr,to,date){if(!fr||!to||!date)return [];return own().filter(function(f){if(f.fr!==fr||f.to!==to)return false;var ok=true;try{ok=flyOn(f,new Date(date+'T12:00:00'))}catch(_){}return ok}).map(function(f){var x=f;try{x=(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,date))||f}catch(_){}return Object.assign({},x,{date:date})}).sort(function(a,b){return String(a.dep).localeCompare(String(b.dep))})}
function legF(code,fr,to,date){return flightsOn(fr,to,date).filter(function(f){return f.code===code})[0]||null}
function inv54(f,d,c){try{return window.kgmCabinInventory54(f,d,c)||{left:0,capacity:0}}catch(_){return {left:0,capacity:0}}}
function charge(id){return (S.chargesR45||[]).filter(function(c){return c&&c.id===id})[0]||null}
function bk(pnr){return (S.bookings||[]).filter(function(b){return b&&b.pnr===pnr})[0]||null}
function namesDone(g){return (g.names||[]).filter(function(p){return p&&p.last&&p.first}).length}
function paxN(g){return (+g.adults||0)+(+g.children||0)}
function log(g,act,by){(g.history=g.history||[]).push({at:new Date().toISOString(),act:act,by:by||(S.adminUser?(S.adminUser.empId||S.adminUser.name):'customer')})}
function mail(ev,g,extra){try{if(typeof kgmNotify!=='function')return;var p=Object.assign({email:g.contact&&g.contact.email||'',groupId:g.id,groupName:g.name,agency:g.agency||'',pax:paxN(g),pnr:g.pnr||'',
  flight:g.legs&&g.legs[0]?g.legs[0].code:'',date:g.legs&&g.legs[0]?g.legs[0].date:'',name:g.contact&&g.contact.name||''},extra||{});Promise.resolve(kgmNotify(ev,p)).catch(function(){})}catch(_){}}
function mailSales(g,what){try{if(typeof kgmNotify!=='function')return;Promise.resolve(kgmNotify('internal.group_request',{email:'groups@kgm-airways.com',groupId:g.id,groupName:g.name,agency:g.agency||'',pax:paxN(g),
  flight:g.legs&&g.legs[0]?g.legs[0].code:'',date:g.legs&&g.legs[0]?g.legs[0].date:'',message:what})).catch(function(){})}catch(_){}
  try{if(typeof notifyCEO==='function')notifyCEO((z()?'團體訂位 ':'Group ')+g.id+'：'+what)}catch(_){}}

/* ── 報價：這一艙目前還在賣的最低價代號為基準，人數越多折扣越多，班機越滿折扣越少 ── */
function quoteLeg(L,g){
  var f=legF(L.code,L.fr,L.to,L.date)||L,n=paxN(g),c=g.cabin||'Economy',inv={left:0,capacity:0};
  inv=inv54(Object.assign({},f,{date:L.date}),L.date,c);
  var codes=Object.keys(FARES).filter(function(k){return FARES[k]&&FARES[k].cabin===c&&!/^X-/.test(k)}),open=[],best=null;
  codes.forEach(function(k){var p=0;try{p=+owPrice(Object.assign({},f,{date:L.date}),k,1)||0}catch(_){}if(!(p>0))return;var s=1;try{if(typeof window.kgmInventory49==='function')s=window.kgmInventory49(k,L.date,Object.assign({},f,{date:L.date}))}catch(_){}
    var o={k:k,p:p,s:s};if(s>0)open.push(o);if(!best||p<best.p)best=o});
  open.sort(function(a,b){return a.p-b.p});var base=open[0]||best||{k:codes[0],p:0};
  var lf=0.8;try{lf=+loadFactor(L.code,L.date)||0.8}catch(_){}
  var disc=n>=30?0.15:(n>=20?0.12:0.08);if(lf>0.85)disc=disc/2;
  var pa=Math.round(base.p*(1-disc)/10)*10,pc=Math.round(pa*0.75/10)*10;
  return {code:L.code,fr:L.fr,to:L.to,date:L.date,dep:f.dep||L.dep,arr:f.arr||L.arr,dd:+f.dd||0,cls:base.k,base:Math.round(base.p),disc:Math.round(disc*100),perAdult:pa,perChild:pc,left:inv.left|0,cap:inv.capacity|0,lf:Math.round(lf*100)};
}
function totals(g){var a=+g.adults||0,c=+g.children||0,t=0;(g.quote&&g.quote.legs||[]).forEach(function(q){t+=a*q.perAdult+c*q.perChild});return t}
function autoOk(g,legs){var n=paxN(g),why=[];
  legs.forEach(function(q){if(q.left<n)why.push(q.code+(z()?' 座位不足（剩 '+q.left+'）':' not enough seats'));else if(n>Math.floor(q.cap*0.4))why.push(q.code+(z()?' 超過單班團體上限（客艙 40%）':' exceeds 40% group cap'))});
  if(days(T(),g.legs[0].date)<14)why.push(z()?'出發前 14 天內':'within 14 days of departure');
  if(g.cabin==='Business')why.push(z()?'商務艙團體需業務審核':'Business-class groups need sales review');
  return why}
function deadlines(g,acceptDay){var d0=g.legs[0].date,a=acceptDay||T(),cap=AD(d0,-3);
  var dep=AD(a,3);if(dep>AD(d0,-1))dep=AD(d0,-1);
  var bal=AD(d0,-21);if(bal<AD(a,3))bal=AD(a,3)>cap?cap:AD(a,3);
  var nm=AD(d0,-14);if(nm<AD(a,3))nm=AD(a,3)>cap?cap:AD(a,3);
  return {deposit:dep,balance:bal,names:nm}}
function doQuote(g,manual){
  var legs=g.legs.map(function(L){return quoteLeg(L,g)});
  if(manual){legs.forEach(function(q,i){if(manual[i]){if(+manual[i].a>0)q.perAdult=Math.round(+manual[i].a);if(+manual[i].c>0)q.perChild=Math.round(+manual[i].c);q.manual=true}})}
  g.quote={legs:legs,at:new Date().toISOString(),validUntil:new Date(Date.now()+72*3600000).toISOString(),by:manual?(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'sales':'system'};
  g.quote.total=totals(g);g.quote.deposit=Math.round(g.quote.total*0.10/10)*10;g.status='quoted';
  log(g,(manual?'業務報價 ':'系統自動報價 ')+M(g.quote.total));
  mail('group.quoted',g,{amount:g.quote.total,currency:'TWD',message:(z()?'報價有效至 ':'Valid until ')+g.quote.validUntil.slice(0,16).replace('T',' ')});
}

/* ── 前台動作 ── */
function F(){var s=S.grpFormR1023A=S.grpFormR1023A||{};if(!s.trip)s.trip='RT';if(!s.fr)s.fr='TPE';if(!s.to)s.to='NRT';if(!s.dep)s.dep=AD(T(),45);if(!s.ret)s.ret=AD(T(),50);if(s.adults==null)s.adults=20;if(s.children==null)s.children=0;if(!s.cabin)s.cabin='Economy';if(!s.type)s.type='tour';return s}
window.kgmGrpFieldR1023A=function(k,v,re){F()[k]=v;if(re){if(k==='fr'||k==='to'||k==='dep'||k==='ret'||k==='trip'){S.grpFormR1023A.outCode='';S.grpFormR1023A.inbCode=''}try{render()}catch(_){}}};
window.kgmGrpTabR1023A=function(t){S.grpTabR1023A=t;S.grpMsgR1023A='';try{render()}catch(_){}};
window.kgmGrpSubmitR1023A=function(){
  var s=F(),bad=[],n=(+s.adults||0)+(+s.children||0);
  if(n<MIN)bad.push(z()?'團體訂位至少 '+MIN+' 位（10 位以下請直接線上訂票）':'At least '+MIN+' passengers');
  if(n>MAX)bad.push(z()?'單一團體最多 '+MAX+' 位，請分成兩團':'Up to '+MAX+' passengers per group');
  if(+s.children>+s.adults)bad.push(z()?'兒童人數不能多於成人':'Children cannot outnumber adults');
  if(!s.outCode)bad.push(z()?'請選擇去程航班':'Choose the outbound flight');
  if(s.trip==='RT'&&!s.inbCode)bad.push(z()?'請選擇回程航班':'Choose the return flight');
  if(s.trip==='RT'&&s.ret<=s.dep)bad.push(z()?'回程日期要晚於去程':'Return must be after departure');
  if(days(T(),s.dep)<7)bad.push(z()?'出發前 7 天內的團體請洽業務專線':'Groups departing within 7 days: please call sales');
  if(!String(s.name||'').trim())bad.push(z()?'請填團名':'Enter the group name');
  if(!String(s.cName||'').trim())bad.push(z()?'請填聯絡人':'Enter a contact name');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s.cEmail||'')))bad.push(z()?'請填正確的聯絡 Email':'Enter a valid email');
  if(!String(s.cPhone||'').trim())bad.push(z()?'請填聯絡電話':'Enter a phone number');
  if(s.type==='tour'&&!String(s.agency||'').trim())bad.push(z()?'旅行團請填旅行社名稱':'Enter the travel agency');
  if(bad.length){S.grpMsgR1023A=bad.join('　');try{render()}catch(_){}return}
  var L=[legF(s.outCode,s.fr,s.to,s.dep)];if(s.trip==='RT')L.push(legF(s.inbCode,s.to,s.fr,s.ret));
  if(L.some(function(x){return !x})){S.grpMsgR1023A=z()?'選的航班這一天沒有飛，請重新選擇':'That flight does not operate on the date';try{render()}catch(_){}return}
  var g={id:newId(),createdAt:new Date().toISOString(),status:'requested',type:s.type,name:String(s.name).trim(),agency:String(s.agency||'').trim(),license:String(s.license||'').trim(),
    contact:{name:String(s.cName).trim(),email:String(s.cEmail).trim(),phone:String(s.cPhone).trim()},trip:s.trip,cabin:s.cabin,adults:+s.adults||0,children:+s.children||0,notes:String(s.notes||'').trim(),
    legs:L.map(function(f){return {code:f.code,fr:f.fr,to:f.to,date:f.date,dep:f.dep,arr:f.arr}}),names:[],history:[]};
  log(g,'送出團體訂位申請','customer');G().unshift(g);
  mail('group.request_received',g,{message:(z()?'團號 ':'Group ')+g.id});
  var legs=g.legs.map(function(L){return quoteLeg(L,g)}),why=autoOk(g,legs);
  if(!why.length)doQuote(g);else{g.reviewWhy=why;mailSales(g,(z()?'需要人工報價：':'Manual quote needed: ')+why.join('、'))}
  S.grpViewR1023A={id:g.id,email:g.contact.email};S.grpTabR1023A='view';S.grpMsgR1023A='';S.grpFormR1023A=null;save1();try{render()}catch(_){}window.scrollTo&&window.scrollTo(0,0);
};
window.kgmGrpLookupR1023A=function(){var id=String((document.getElementById('k23gId')||{}).value||'').trim().toUpperCase(),em=String((document.getElementById('k23gEm')||{}).value||'').trim().toLowerCase();
  var g=G().filter(function(x){return x.id.toUpperCase()===id&&String(x.contact&&x.contact.email||'').toLowerCase()===em})[0];
  if(!g){S.grpMsgR1023A=z()?'查無此團體訂位，請確認團號與申請時填的 Email':'No group matches that number and email';S.grpViewR1023A=null}else{S.grpViewR1023A={id:g.id,email:em};S.grpMsgR1023A=''}
  S.grpTabR1023A='view';try{render()}catch(_){}};
function seatsOk(g){return g.quote.legs.every(function(q){var inv={left:0};var f=legF(q.code,q.fr,q.to,q.date);inv=f?inv54(f,q.date,g.cabin):{left:0};return inv.left>=paxN(g)})}
window.kgmGrpAcceptR1023A=function(id){
  var g=G().filter(function(x){return x.id===id})[0];if(!g||g.status!=='quoted')return;
  if(Date.parse(g.quote.validUntil)<Date.now()){g.status='expired';log(g,'報價逾期');save1();try{render()}catch(_){}return}
  if(!seatsOk(g)){S.grpMsgR1023A=z()?'很抱歉，這段時間座位已被訂走，無法保留；業務會重新報價。':'Seats are no longer available; sales will re-quote.';g.status='requested';g.reviewWhy=['seats'];mailSales(g,'接受報價時座位不足，需重新報價');save1();try{render()}catch(_){}return}
  var n=paxN(g),q0=g.quote.legs[0],q1=g.quote.legs[1],f0=legF(q0.code,q0.fr,q0.to,q0.date),f1=q1?legF(q1.code,q1.fr,q1.to,q1.date):null;
  var pax=[];for(var i=0;i<n;i++){var chd=i>=(+g.adults||0);pax.push({title:'',lastName:'TBA',firstName:(chd?'CHD':'ADT')+String(i+1).padStart(2,'0'),passengerType:chd?'CHD':'ADT',email:i===0?g.contact.email:'',groupNameTbaR1023A:true})}
  var pnr='';try{pnr=genPNR()}catch(_){pnr='G'+String(Date.now()).slice(-5)}
  var b={pnr:pnr,status:'confirmed',group:true,fareGroup:'G',groupR1023A:{id:g.id,name:g.name,agency:g.agency,type:g.type},userId:null,
    search:{type:g.trip==='RT'?'RT':'OW',fr:q0.fr,to:q0.to,dep:q0.date,ret:q1?q1.date:null,pax:n},outF:Object.assign({},f0,{date:q0.date}),outC:q0.cls,inbF:f1?Object.assign({},f1,{date:q1.date}):null,inbC:q1?q1.cls:null,
    paxList:pax,contactEmail:g.contact.email,contactPhone:g.contact.phone,seats:{},mealChoice:{},total:g.quote.total,curr:'TWD',bookedAt:new Date().toISOString(),paymentMethod:z()?'團體帳款':'Group invoice'};
  S.bookings=S.bookings||[];S.bookings.push(b);g.pnr=pnr;g.status='held';g.acceptedAt=new Date().toISOString();g.due=deadlines(g);
  var ch=null;try{ch=window.kgmCreateChargeR45({pnr:pnr,items:[{label:'Group deposit 10% · '+g.id,amount:g.quote.deposit}],note:(z()?'團體訂金，請於 ':'Group deposit due ')+g.due.deposit+(z()?' 前付清，逾期座位自動釋出':'')})}catch(_){}
  g.deposit={amount:g.quote.deposit,chargeId:ch&&ch.charge&&ch.charge.id,token:ch&&ch.charge&&ch.charge.token,paid:false};
  log(g,'接受報價，保留 '+n+' 個座位（PNR '+pnr+'）','customer');
  mail('group.held',g,{amount:g.quote.deposit,currency:'TWD',payUrl:ch&&ch.link||'',message:(z()?'訂金請於 '+g.due.deposit+' 前付清；名單 '+g.due.names+'、尾款 '+g.due.balance+' 前完成。':'Deposit due '+g.due.deposit)});
  mailSales(g,'已接受報價並保留座位，PNR '+pnr);save1();try{render()}catch(_){}};
window.kgmGrpPayR1023A=function(id,which){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;var o=which==='balance'?g.balance:g.deposit;if(o&&o.token&&window.kgmOpenPayR45)window.kgmOpenPayR45(o.token)};
window.kgmGrpNamesSaveR1023A=function(id){
  var g=G().filter(function(x){return x.id===id})[0];if(!g)return;var n=paxN(g),out=[],bad=[];
  for(var i=0;i<n;i++){var v=function(k){var e=document.getElementById('k23gN'+k+i);return e?String(e.value||'').trim():''};
    var r={last:v('L').toUpperCase().replace(/[^A-Z\- ]/g,''),first:v('F').toUpperCase().replace(/[^A-Z\- ]/g,''),gender:v('G'),dob:v('D'),passport:v('P').toUpperCase(),type:i>=(+g.adults||0)?'CHD':'ADT'};
    if((r.last&&!r.first)||(!r.last&&r.first))bad.push((i+1)+(z()?'：姓、名都要填':': both names'));
    if(r.dob&&!/^\d{4}-\d{2}-\d{2}$/.test(r.dob))bad.push((i+1)+(z()?'：生日格式 YYYY-MM-DD':': DOB YYYY-MM-DD'));
    out.push(r)}
  if(bad.length){S.grpMsgR1023A=bad.slice(0,6).join('　');try{render()}catch(_){}return}
  g.names=out;var b=bk(g.pnr);
  if(b)out.forEach(function(r,i){var p=b.paxList[i]=b.paxList[i]||{};if(r.last&&r.first){p.lastName=r.last;p.firstName=r.first;p.groupNameTbaR1023A=false}else{p.lastName='TBA';p.firstName=(r.type)+String(i+1).padStart(2,'0');p.groupNameTbaR1023A=true}
    p.gender=r.gender;p.dob=r.dob;p.passport=r.passport;p.passengerType=r.type;p.title=r.gender==='F'?(r.type==='CHD'?'MISS':'MS'):(r.gender==='M'?(r.type==='CHD'?'MSTR':'MR'):'')});
  log(g,'名單更新 '+namesDone(g)+'/'+n);S.grpMsgR1023A=(z()?'✓ 已儲存名單 ':'✓ Saved ')+namesDone(g)+' / '+n;maybeTicket(g);save1();try{render()}catch(_){}};
window.kgmGrpPasteR1023A=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g)return;var t=String((document.getElementById('k23gPaste')||{}).value||'');
  var lines=t.split(/\r?\n/).map(function(l){return l.trim()}).filter(Boolean);
  lines.forEach(function(l,i){if(i>=paxN(g))return;var c=l.split(/\s*[,\t;]\s*/),nm=String(c[0]||'').split('/');
    var set=function(k,v){var e=document.getElementById('k23gN'+k+i);if(e&&v!=null)e.value=v};set('L',nm[0]||'');set('F',nm[1]||'');set('G',(c[1]||'').toUpperCase().charAt(0));set('D',c[2]||'');set('P',c[3]||'')});
  S.grpMsgR1023A=(z()?'已貼上 ':'Pasted ')+Math.min(lines.length,paxN(g))+(z()?' 位，確認後按「儲存名單」':' rows; press Save')};

/* ── 自動：付款、逾期、提醒、開票 ── */
function ticketNo(){return '297'+String(Date.now()).slice(-7)+String(Math.floor(Math.random()*900+100))}
function maybeTicket(g){
  if(g.status!=='deposit_paid'||!g.balance||!g.balance.paid||namesDone(g)<paxN(g))return false;
  var b=bk(g.pnr);if(!b)return false;
  (b.paxList||[]).forEach(function(p){if(!p.ticketR1023A)p.ticketR1023A=ticketNo()});b.ticketNumber=(b.paxList[0]||{}).ticketR1023A;b.ticket=b.ticketNumber;b.balanceDue=0;
  g.status='ticketed';g.ticketedAt=new Date().toISOString();log(g,'已開票 '+paxN(g)+' 張');
  mail('group.ticketed',g,{ticketNumber:b.ticketNumber,message:(z()?'全團 '+paxN(g)+' 位已開票，請於出發前 48 小時起辦理線上報到。':'All tickets issued.')});mailSales(g,'已開票');return true}
function tick(){
  var ch=false,now=Date.now(),td=T();
  G().forEach(function(g){
    if(g.status==='quoted'&&g.quote&&Date.parse(g.quote.validUntil)<now){g.status='expired';log(g,'報價逾期失效','system');mail('group.expired',g,{message:z()?'報價已超過 72 小時有效期限。':'Quote expired.'});ch=true}
    if(g.status==='held'&&g.deposit){var c=charge(g.deposit.chargeId);
      if(c&&c.status==='paid'){g.deposit.paid=true;g.deposit.paidAt=c.paidAt||new Date().toISOString();g.status='deposit_paid';log(g,'訂金已付 '+M(g.deposit.amount),'system');
        var rest=Math.max(0,(g.quote.total||0)-(g.deposit.amount||0)),x=null;try{x=window.kgmCreateChargeR45({pnr:g.pnr,items:[{label:'Group balance · '+g.id,amount:rest}],note:(z()?'團體尾款，請於 ':'Group balance due ')+g.due.balance+(z()?' 前付清':'')})}catch(_){}
        g.balance={amount:rest,chargeId:x&&x.charge&&x.charge.id,token:x&&x.charge&&x.charge.token,paid:false};
        mail('group.deposit_paid',g,{amount:g.deposit.amount,currency:'TWD',message:(z()?'訂金已收到。請於 '+g.due.names+' 前完成名單、'+g.due.balance+' 前付清尾款 ':'Deposit received. Balance ')+M(rest)});ch=true}
      else if(td>g.due.deposit){var b=bk(g.pnr);if(b){b.status='cancelled';b.cancelledAt=td;b.groupReleasedR1023A=true}try{if(c&&c.status==='unpaid')window.kgmVoidChargeR45(c.id)}catch(_){}
        g.status='expired';log(g,'訂金逾期，座位已釋出','system');mail('group.expired',g,{message:z()?'訂金未在期限內付清，保留的座位已釋出。':'Deposit overdue; seats released.'});mailSales(g,'訂金逾期，自動釋位');ch=true}}
    if(g.status==='deposit_paid'&&g.balance){var c2=charge(g.balance.chargeId);if(c2&&c2.status==='paid'&&!g.balance.paid){g.balance.paid=true;g.balance.paidAt=c2.paidAt||new Date().toISOString();log(g,'尾款已付 '+M(g.balance.amount),'system');ch=true}
      if(!g.namesRemindedAt&&namesDone(g)<paxN(g)&&td>=AD(g.due.names,-3)){g.namesRemindedAt=td;mail('group.names_reminder',g,{message:(z()?'名單還差 '+(paxN(g)-namesDone(g))+' 位，請於 '+g.due.names+' 前補齊（姓名須與護照相同）。':'Name list incomplete.')});ch=true}
      if(maybeTicket(g))ch=true}
  });
  if(ch)save1();return ch}
window.kgmGroupTickR1023A=tick;
setTimeout(tick,9000);setInterval(function(){try{if(tick())render()}catch(_){}},60000);

/* ── 前台頁面 ── */
function steps(g){var order=['requested','quoted','held','deposit_paid','ticketed'],i=g?order.indexOf(g.status):-1;
  var L=z()?['申請','報價','保留座位・訂金','名單・尾款','開票']:['Request','Quote','Hold · deposit','Names · balance','Ticketed'];
  return '<ol class="k23g-steps">'+L.map(function(t,k){return '<li class="'+(i>k?'done':(i===k?'on':''))+'"><i>'+(k+1)+'</i>'+E(t)+'</li>'}).join('')+'</ol>'}
function legTable(g,admin){var q=g.quote&&g.quote.legs||null;
  return '<table class="k23g-t"><thead><tr><th>'+(z()?'航段':'Sector')+'</th><th>'+(z()?'日期':'Date')+'</th><th>'+(z()?'時間':'Time')+'</th>'+(q?'<th>'+(z()?'每位成人':'Per adult')+'</th><th>'+(z()?'每位兒童':'Per child')+'</th>':'')+(admin&&q?'<th>'+(z()?'基準／折扣／剩位':'Base / disc. / left')+'</th>':'')+'</tr></thead><tbody>'
    +g.legs.map(function(L,i){var x=q&&q[i];return '<tr><td><b>'+E(L.code)+'</b> '+E(L.fr)+' → '+E(L.to)+'<small>'+E(ap(L.fr))+' → '+E(ap(L.to))+'</small></td><td>'+E(L.date)+'</td><td>'+E(L.dep||'')+'–'+E(L.arr||'')+'</td>'
      +(q?'<td>'+M(x.perAdult)+'</td><td>'+(+g.children?M(x.perChild):'—')+'</td>':'')+(admin&&q?'<td>'+M(x.base)+' · −'+x.disc+'% · '+x.left+'/'+x.cap+(x.manual?(z()?' · 人工':' · manual'):'')+'</td>':'')+'</tr>'}).join('')+'</tbody></table>'}
function money3(g){if(!g.quote)return '';var dep=g.deposit||{amount:g.quote.deposit},bal=g.balance||{amount:Math.max(0,g.quote.total-g.quote.deposit)};
  return '<div class="k23g-money"><div><small>'+(z()?'團體總價':'Group total')+'</small><b>'+M(g.quote.total)+'</b><span>'+(+g.adults)+(z()?' 成人':' adults')+(+g.children?' · '+g.children+(z()?' 兒童':' children'):'')+' · '+E(cab(g.cabin))+'</span></div>'
    +'<div><small>'+(z()?'訂金 10%':'Deposit 10%')+'</small><b>'+M(dep.amount)+'</b><span>'+(dep.paid?(z()?'✓ 已付':'✓ Paid'):(g.due?(z()?'期限 ':'Due ')+g.due.deposit:(z()?'接受報價後 3 天內':'within 3 days of acceptance')))+'</span></div>'
    +'<div><small>'+(z()?'尾款':'Balance')+'</small><b>'+M(bal.amount)+'</b><span>'+(bal.paid?(z()?'✓ 已付':'✓ Paid'):(g.due?(z()?'期限 ':'Due ')+g.due.balance:(z()?'出發前 21 天':'21 days before departure')))+'</span></div>'
    +'<div><small>'+(z()?'名單':'Names')+'</small><b>'+namesDone(g)+' / '+paxN(g)+'</b><span>'+(g.due?(z()?'期限 ':'Due ')+g.due.names:(z()?'出發前 14 天':'14 days before departure'))+'</span></div></div>'}
function namesEditor(g,admin){var n=paxN(g),rows='';
  for(var i=0;i<n;i++){var r=(g.names||[])[i]||{},chd=i>=(+g.adults||0);
    rows+='<tr><td>'+(i+1)+'<small>'+(chd?(z()?'兒童':'CHD'):(z()?'成人':'ADT'))+'</small></td><td><input id="k23gNL'+i+'" class="inp" value="'+E(r.last||'')+'" placeholder="WANG"></td><td><input id="k23gNF'+i+'" class="inp" value="'+E(r.first||'')+'" placeholder="DAMING"></td>'
      +'<td><select id="k23gNG'+i+'" class="inp"><option value=""></option><option'+(r.gender==='M'?' selected':'')+' value="M">M</option><option'+(r.gender==='F'?' selected':'')+' value="F">F</option></select></td>'
      +'<td><input id="k23gND'+i+'" class="inp" value="'+E(r.dob||'')+'" placeholder="1990-05-20"></td><td><input id="k23gNP'+i+'" class="inp" value="'+E(r.passport||'')+'" placeholder="'+(z()?'護照號碼':'Passport')+'"></td></tr>'}
  return '<section class="k23g-card"><header><b>'+(z()?'旅客名單':'Passenger names')+'</b><span>'+namesDone(g)+' / '+n+(g.due?(z()?'　期限 ':'　due ')+g.due.names:'')+'</span></header>'
    +'<p class="k23g-p">'+(z()?'姓名請填護照上的英文拼音（姓／名分開）。可以分次填寫，每次按「儲存名單」；名單齊全且尾款付清後系統自動開票。':'Use the names exactly as in the passport. You can save in several rounds.')+'</p>'
    +'<details class="k23g-paste"><summary>'+(z()?'從 Excel 貼上整份名單':'Paste from a spreadsheet')+'</summary><p class="k23g-p">'+(z()?'每行一位：姓/名, 性別, 生日, 護照號碼（例如 WANG/DAMING, M, 1990-05-20, 312345678）':'One per line: LAST/FIRST, M/F, YYYY-MM-DD, passport')+'</p><textarea id="k23gPaste" class="inp" rows="4"></textarea><button type="button" class="k23g-btn ghost" onclick="kgmGrpPasteR1023A(\''+A(g.id)+'\')">'+(z()?'套用到下表':'Fill the table')+'</button></details>'
    +'<div class="k23g-scroll"><table class="k23g-t k23g-names"><thead><tr><th>#</th><th>'+(z()?'姓 Last':'Last')+'</th><th>'+(z()?'名 First':'First')+'</th><th>'+(z()?'性別':'Sex')+'</th><th>'+(z()?'生日':'DOB')+'</th><th>'+(z()?'護照號碼':'Passport')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
    +'<div class="k23g-act"><button type="button" class="k23g-btn" onclick="kgmGrpNamesSaveR1023A(\''+A(g.id)+'\')">'+(z()?'儲存名單':'Save names')+'</button></div></section>'}
function detail(g){
  var b=g.pnr?bk(g.pnr):null,act='';
  if(g.status==='requested')act='<div class="k23g-note">'+(z()?'我們的團體業務會在 1 個工作天內報價，報價會寄到 '+E(g.contact.email)+'。':'Our group desk will quote within one business day.')+'</div>';
  if(g.status==='quoted')act='<div class="k23g-note">'+(z()?'報價有效至 '+E(g.quote.validUntil.slice(0,16).replace('T',' '))+'。接受報價後立即保留 '+paxN(g)+' 個座位，並寄出訂金付款資料（10%，3 天內付清）。':'Quote valid until '+g.quote.validUntil.slice(0,16))+'</div><div class="k23g-act"><button type="button" class="k23g-btn" onclick="kgmGrpAcceptR1023A(\''+A(g.id)+'\')">'+(z()?'接受報價並保留座位':'Accept and hold seats')+'</button></div>';
  if(g.status==='held')act='<div class="k23g-note">'+(z()?'座位已保留（PNR '+E(g.pnr)+'）。訂金付款資料已寄到 '+E(g.contact.email)+'，請於 '+E(g.due.deposit)+' 前付清，逾期座位自動釋出。':'Seats held. Pay the deposit by '+g.due.deposit)+'</div><div class="k23g-act"><button type="button" class="k23g-btn" onclick="kgmGrpPayR1023A(\''+A(g.id)+'\',\'deposit\')">'+(z()?'付訂金 ':'Pay deposit ')+M(g.deposit.amount)+'</button></div>';
  if(g.status==='deposit_paid')act=(g.balance&&!g.balance.paid?'<div class="k23g-act"><button type="button" class="k23g-btn" onclick="kgmGrpPayR1023A(\''+A(g.id)+'\',\'balance\')">'+(z()?'付尾款 ':'Pay balance ')+M(g.balance.amount)+'</button><span class="k23g-p">'+(z()?'期限 ':'Due ')+E(g.due.balance)+'</span></div>':'<div class="k23g-note ok">'+(z()?'尾款已付清；名單齊全後自動開票。':'Balance paid; tickets issue once names are complete.')+'</div>')+namesEditor(g);
  if(g.status==='ticketed'&&b)act='<section class="k23g-card"><header><b>'+(z()?'電子機票':'E-tickets')+'</b><span>PNR '+E(g.pnr)+'</span></header><div class="k23g-scroll"><table class="k23g-t"><thead><tr><th>#</th><th>'+(z()?'旅客':'Passenger')+'</th><th>'+(z()?'機票號碼':'Ticket')+'</th></tr></thead><tbody>'+(b.paxList||[]).map(function(p,i){return '<tr><td>'+(i+1)+'</td><td>'+E(p.lastName+'/'+p.firstName)+'</td><td>'+E(p.ticketR1023A||'')+'</td></tr>'}).join('')+'</tbody></table></div><p class="k23g-p">'+(z()?'可於「查詢訂位」輸入 PNR 辦理線上報到與選位。團體票（G）不可線上改票或退票，異動請洽團體業務。':'Use Find Booking with the PNR for check-in.')+'</p></section>';
  if(g.status==='expired'||g.status==='declined'||g.status==='cancelled')act='<div class="k23g-note bad">'+E(g.declineWhy||(g.status==='expired'?(z()?'已逾期失效。如仍需要，請重新申請。':'Expired. Please submit a new request.'):(z()?'此團體訂位已結束。':'Closed.')))+'</div>';
  return '<section class="k23g-card k23g-head"><div><small>'+E(g.id)+(g.pnr?' · PNR '+E(g.pnr):'')+'</small><h2>'+E(g.name)+'</h2><p>'+E(typeName(g.type))+(g.agency?' · '+E(g.agency):'')+' · '+E(g.contact.name)+'</p></div>'+stChip(g.status)+'</section>'
    +'<section class="k23g-card"><header><b>'+(z()?'航班':'Flights')+'</b><span>'+E(cab(g.cabin))+' · '+paxN(g)+(z()?' 位':' pax')+'</span></header>'+legTable(g)+'</section>'+money3(g)+act;
}
function form(){var s=F(),aps=airports(),opt=function(v){return aps.map(function(a){return '<option value="'+a+'"'+(a===v?' selected':'')+'>'+a+' '+E(ap(a))+'</option>'}).join('')};
  var fo=flightsOn(s.fr,s.to,s.dep),fi=s.trip==='RT'?flightsOn(s.to,s.fr,s.ret):[];
  if(fo.length&&!fo.some(function(f){return f.code===s.outCode}))s.outCode=fo[0].code;if(fi.length&&!fi.some(function(f){return f.code===s.inbCode}))s.inbCode=fi[0].code;
  var fsel=function(list,k){return list.length?'<select class="inp" onchange="kgmGrpFieldR1023A(\''+k+'\',this.value)">'+list.map(function(f){return '<option value="'+E(f.code)+'"'+(f.code===s[k]?' selected':'')+'>'+E(f.code)+'　'+E(f.dep)+'–'+E(f.arr)+(+f.dd?'⁺'+f.dd:'')+'</option>'}).join('')+'</select>':'<div class="k23g-none">'+(z()?'這一天沒有直飛航班':'No nonstop flight that day')+'</div>'};
  var inp=function(k,ph,type){return '<input class="inp" '+(type?'type="'+type+'" ':'')+'value="'+E(s[k]||'')+'" placeholder="'+E(ph||'')+'" oninput="kgmGrpFieldR1023A(\''+k+'\',this.value)">'};
  var n=(+s.adults||0)+(+s.children||0);
  return '<section class="k23g-card"><header><b>'+(z()?'1　行程':'1　Itinerary')+'</b></header><div class="k23g-grid">'
    +'<label>'+(z()?'行程':'Trip')+'<select class="inp" onchange="kgmGrpFieldR1023A(\'trip\',this.value,1)"><option value="RT"'+(s.trip==='RT'?' selected':'')+'>'+(z()?'來回':'Round trip')+'</option><option value="OW"'+(s.trip==='OW'?' selected':'')+'>'+(z()?'單程':'One way')+'</option></select></label>'
    +'<label>'+(z()?'出發地':'From')+'<select class="inp" onchange="kgmGrpFieldR1023A(\'fr\',this.value,1)">'+opt(s.fr)+'</select></label>'
    +'<label>'+(z()?'目的地':'To')+'<select class="inp" onchange="kgmGrpFieldR1023A(\'to\',this.value,1)">'+opt(s.to)+'</select></label>'
    +'<label>'+(z()?'艙等':'Cabin')+'<select class="inp" onchange="kgmGrpFieldR1023A(\'cabin\',this.value)">'+['Economy','Premium','Business'].map(function(c){return '<option value="'+c+'"'+(c===s.cabin?' selected':'')+'>'+E(cab(c))+'</option>'}).join('')+'</select></label>'
    +'<label>'+(z()?'去程日期':'Depart')+'<input class="inp" type="date" min="'+AD(T(),7)+'" value="'+E(s.dep)+'" onchange="kgmGrpFieldR1023A(\'dep\',this.value,1)"></label>'
    +'<label>'+(z()?'去程航班':'Outbound flight')+fsel(fo,'outCode')+'</label>'
    +(s.trip==='RT'?'<label>'+(z()?'回程日期':'Return')+'<input class="inp" type="date" min="'+E(s.dep)+'" value="'+E(s.ret)+'" onchange="kgmGrpFieldR1023A(\'ret\',this.value,1)"></label><label>'+(z()?'回程航班':'Return flight')+fsel(fi,'inbCode')+'</label>':'')
    +'</div></section>'
    +'<section class="k23g-card"><header><b>'+(z()?'2　人數與團體':'2　Group')+'</b><span>'+(z()?'10–99 位':'10–99 pax')+'</span></header><div class="k23g-grid">'
    +'<label>'+(z()?'成人（12 歲以上）':'Adults (12+)')+'<input class="inp" type="number" min="1" max="99" value="'+E(s.adults)+'" oninput="kgmGrpFieldR1023A(\'adults\',this.value)"></label>'
    +'<label>'+(z()?'兒童（2–11 歲）':'Children (2–11)')+'<input class="inp" type="number" min="0" max="98" value="'+E(s.children)+'" oninput="kgmGrpFieldR1023A(\'children\',this.value)"></label>'
    +'<label>'+(z()?'團體類型':'Group type')+'<select class="inp" onchange="kgmGrpFieldR1023A(\'type\',this.value)">'+TYPES.map(function(t){return '<option value="'+t[0]+'"'+(t[0]===s.type?' selected':'')+'>'+E(z()?t[1]:t[2])+'</option>'}).join('')+'</select></label>'
    +'<label>'+(z()?'團名':'Group name')+inp('name',z()?'例如：北海道賞雪 7 日':'e.g. Hokkaido 7D')+'</label>'
    +'<label>'+(z()?'旅行社／公司名稱':'Agency / company')+inp('agency',z()?'旅行團必填':'Required for tours')+'</label>'
    +'<label>'+(z()?'旅行業註冊編號（選填）':'Licence no. (optional)')+inp('license','')+'</label>'
    +'</div></section>'
    +'<section class="k23g-card"><header><b>'+(z()?'3　聯絡人':'3　Contact')+'</b></header><div class="k23g-grid">'
    +'<label>'+(z()?'聯絡人':'Name')+inp('cName','')+'</label><label>Email'+inp('cEmail','name@agency.com')+'</label><label>'+(z()?'電話':'Phone')+inp('cPhone','+886')+'</label>'
    +'<label class="k23g-wide">'+(z()?'備註（餐食、輪椅、特殊需求）':'Notes (meals, wheelchairs…)')+'<textarea class="inp" rows="2" oninput="kgmGrpFieldR1023A(\'notes\',this.value)">'+E(s.notes||'')+'</textarea></label>'
    +'</div><div class="k23g-act"><button type="button" class="k23g-btn" onclick="kgmGrpSubmitR1023A()">'+(z()?'送出團體訂位申請':'Submit group request')+'</button><span class="k23g-p">'+(z()?'座位與價格以報價為準；系統可自動報價的會立即顯示。':'Prices are confirmed in the quote.')+'</span></div></section>'}
function rules(){return '<aside class="k23g-rules"><b>'+(z()?'團體訂位規則':'Group booking rules')+'</b><ul>'+(z()?
  ['同一行程 10–99 位旅客（含兒童；嬰兒另洽業務）。','出發 14 天以上、經濟／豪華經濟艙、人數不超過該艙 40% 時系統自動報價；其餘由團體業務 1 個工作天內報價。','報價有效 72 小時；接受報價即保留座位，訂金 10% 須 3 天內付清，逾期自動釋位。','名單於出發前 14 天、尾款於出發前 21 天前完成（接受時已在期限內者為接受後 3 天）。','尾款付清且名單齊全後自動開票；團體票（G）不可線上改票、退票，人數或姓名異動請洽團體業務。','訂金不退；開票後依團體票規辦理。']
  :['10–99 passengers on the same itinerary.','Automatic quote for Economy/Premium, 14+ days out and up to 40% of the cabin.','Quote valid 72h; deposit 10% within 3 days of acceptance.','Names 14 days and balance 21 days before departure.','Tickets issue automatically once paid and named; group fares cannot be changed online.','Deposits are non-refundable.']).map(function(t){return '<li>'+E(t)+'</li>'}).join('')+'</ul></aside>'}
window.kgmGroupViewR1023A=function(){
  var tab=S.grpTabR1023A||'new',v=S.grpViewR1023A,g=v?G().filter(function(x){return x.id===v.id})[0]:null;
  if(tab==='view'&&!g&&!S.grpMsgR1023A)tab='find';
  var body=tab==='new'?form():(tab==='find'||!g?('<section class="k23g-card"><header><b>'+(z()?'查詢團體訂位':'Find a group booking')+'</b></header><div class="k23g-grid"><label>'+(z()?'團號':'Group number')+'<input id="k23gId" class="inp" placeholder="GRP2610-001A" value="'+E(v&&v.id||'')+'"></label><label>'+(z()?'申請時填的 Email':'Contact email')+'<input id="k23gEm" class="inp" value="'+E(v&&v.email||'')+'" onkeydown="if(event.key===\'Enter\')kgmGrpLookupR1023A()"></label></div><div class="k23g-act"><button type="button" class="k23g-btn" onclick="kgmGrpLookupR1023A()">'+(z()?'查詢':'Find')+'</button></div></section>'):detail(g));
  return '<div class="k23g"><section class="k23g-hero"><small>GROUP TRAVEL</small><h1>'+(z()?'團體訂位':'Group booking')+'</h1><p>'+(z()?'旅行社、企業獎勵旅遊、學校與各類團體，10 位以上同行專屬報價、座位保留與名單管理。':'Dedicated fares, seat holds and name management for 10 or more travellers.')+'</p>'+steps(tab==='view'?g:null)+'</section>'
    +'<nav class="k23g-tabs"><button type="button" class="'+(tab==='new'?'on':'')+'" onclick="kgmGrpTabR1023A(\'new\')">'+(z()?'新申請':'New request')+'</button><button type="button" class="'+(tab!=='new'?'on':'')+'" onclick="kgmGrpTabR1023A(\''+(g?'view':'find')+'\')">'+(z()?'查詢／管理團體訂位':'Find / manage')+'</button>'+(g&&tab!=='find'?'<button type="button" onclick="kgmGrpTabR1023A(\'find\')">'+(z()?'查其他團':'Another group')+'</button>':'')+'</nav>'
    +(S.grpMsgR1023A?'<div class="k23g-msg">'+E(S.grpMsgR1023A)+'</div>':'')
    +'<div class="k23g-cols"><div>'+body+'</div>'+rules()+'</div></div>'};

/* ── 後台：定位管理 GROUP DESK ── */
window.kgmGrpAdmR1023A=function(act,id,arg){
  var g=G().filter(function(x){return x.id===id})[0];
  if(act==='open'){S.grpOpenR1023A=S.grpOpenR1023A===id?'':id;S.grpAdmMsgR1023A='';try{render()}catch(_){}return}
  if(act==='filter'){S.grpFilterR1023A=id;try{render()}catch(_){}return}
  if(!g)return;var msg='';
  if(act==='quote'){var man=g.legs.map(function(L,i){return {a:(document.getElementById('k23gqa'+i)||{}).value,c:(document.getElementById('k23gqc'+i)||{}).value}});doQuote(g,man);msg=(z()?'✓ 已送出報價 ':'✓ Quoted ')+M(g.quote.total)}
  if(act==='auto'){doQuote(g);msg=(z()?'✓ 已依系統價格報價 ':'✓ Quoted ')+M(g.quote.total)}
  if(act==='decline'){var why=String((document.getElementById('k23gWhy')||{}).value||'').trim()||(z()?'該日期座位已滿':'No seats');g.status='declined';g.declineWhy=why;log(g,'婉拒：'+why);mail('group.declined',g,{message:why});msg=z()?'已婉拒並通知旅行社':'Declined'}
  if(act==='extend'){if(g.due){var k=arg||'deposit';g.due[k]=AD(g.due[k],3);log(g,'延長'+k+'期限至 '+g.due[k]);msg=(z()?'已延長至 ':'Extended to ')+g.due[k]}if(g.status==='quoted'){g.quote.validUntil=new Date(Date.parse(g.quote.validUntil)+72*3600000).toISOString();log(g,'報價延長 72 小時');msg=z()?'報價延長 72 小時':'Quote extended'}}
  if(act==='resend'){var o=g.status==='held'?g.deposit:g.balance;if(o){var c=charge(o.chargeId);mail('billing.charge_created',g,{amount:o.amount,currency:'TWD',id:o.chargeId,payUrl:c?'#/pay/'+c.token:'',items:c?c.items:[],message:z()?'團體款項付款資料（重寄）':'Payment details (resent)'});log(g,'重寄付款資料');msg=z()?'已重寄付款資料':'Resent'}}
  if(act==='cancel'){if(!confirm(z()?'確定取消團體 '+g.id+' 並釋出所有座位？（已付訂金不退）':'Cancel and release all seats?'))return;var b=bk(g.pnr);if(b){b.status='cancelled';b.cancelledAt=T();b.groupReleasedR1023A=true}
    [g.deposit,g.balance].forEach(function(o){var c=o&&charge(o.chargeId);if(c&&c.status==='unpaid')try{window.kgmVoidChargeR45(c.id)}catch(_){}});g.status='cancelled';log(g,'業務取消並釋位');mail('group.cancelled',g,{message:z()?'團體訂位已取消，座位已釋出。':'Group cancelled.'});msg=z()?'已取消並釋位':'Cancelled'}
  if(act==='ticket'){if(!maybeTicket(g))msg=z()?'還不能開票：要尾款付清而且名單齊全':'Needs balance and full names';else msg=z()?'✓ 已開票':'✓ Ticketed'}
  if(act==='csv'){var b2=bk(g.pnr),rows=[['#','Last','First','Type','Sex','DOB','Passport','Ticket']];(b2?b2.paxList:[]).forEach(function(p,i){rows.push([i+1,p.lastName,p.firstName,p.passengerType,p.gender||'',p.dob||'',p.passport||'',p.ticketR1023A||''])});
    var csv='﻿'+rows.map(function(r){return r.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=g.id+'_names.csv';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},400);return}
  if(act==='pnr'){S.adminTab='bookings';try{render()}catch(_){}setTimeout(function(){try{var q=document.getElementById('jPnr');if(q)q.value=g.pnr;window.kgmSearchPnr0819J&&window.kgmSearchPnr0819J()}catch(_){}},150);return}   /* 到定位管理開這筆 PNR */
  S.grpAdmMsgR1023A=msg;save1();try{render()}catch(_){}};
function nextDue(g){if(!g.due)return g.status==='quoted'&&g.quote?(z()?'報價到期 ':'Quote ')+g.quote.validUntil.slice(5,16).replace('T',' '):'';
  if(g.status==='held')return (z()?'訂金 ':'Deposit ')+g.due.deposit;if(g.status==='deposit_paid')return (g.balance&&!g.balance.paid?(z()?'尾款 ':'Balance ')+g.due.balance:'')+(namesDone(g)<paxN(g)?(z()?'　名單 ':'  Names ')+g.due.names:'');return ''}
function late(g){var td=T();return !!(g.due&&((g.status==='held'&&td>=AD(g.due.deposit,-1))||(g.status==='deposit_paid'&&((g.balance&&!g.balance.paid&&td>=AD(g.due.balance,-3))||(namesDone(g)<paxN(g)&&td>=AD(g.due.names,-3))))))}
window.kgmGroupDeskHtmlR1023A=function(){
  try{tick()}catch(_){}
  var L=G(),flt=S.grpFilterR1023A||'active',open=S.grpOpenR1023A||'';
  var cnt=function(s){return L.filter(function(g){return g.status===s}).length};
  var act=L.filter(function(g){return /requested|quoted|held|deposit_paid/.test(g.status)});
  var show=flt==='active'?act:(flt==='all'?L:L.filter(function(g){return g.status===flt}));
  var head='<div class="k23gd-kpi">'+[['requested',z()?'待報價':'To quote'],['quoted',z()?'待旅行社確認':'Quoted'],['held',z()?'待付訂金':'Deposit due'],['deposit_paid',z()?'待名單／尾款':'Names / balance'],['ticketed',z()?'已開票':'Ticketed']].map(function(k){return '<button type="button" class="'+(flt===k[0]?'on':'')+'" onclick="kgmGrpAdmR1023A(\'filter\',\''+k[0]+'\')"><b>'+cnt(k[0])+'</b><span>'+E(k[1])+'</span></button>'}).join('')
    +'<button type="button" class="'+(flt==='active'?'on':'')+'" onclick="kgmGrpAdmR1023A(\'filter\',\'active\')"><b>'+act.length+'</b><span>'+(z()?'進行中':'Active')+'</span></button><button type="button" class="'+(flt==='all'?'on':'')+'" onclick="kgmGrpAdmR1023A(\'filter\',\'all\')"><b>'+L.length+'</b><span>'+(z()?'全部':'All')+'</span></button></div>';
  var rows=show.map(function(g){var o=g.id===open,lt=late(g);
    var tr='<tr class="'+(o?'on':'')+(lt?' late':'')+'" onclick="kgmGrpAdmR1023A(\'open\',\''+A(g.id)+'\')"><td><b>'+E(g.id)+'</b><small>'+(g.pnr?'PNR '+E(g.pnr):'—')+'</small></td><td><b>'+E(g.name)+'</b><small>'+E(typeName(g.type))+(g.agency?' · '+E(g.agency):'')+'</small></td>'
      +'<td>'+g.legs.map(function(x){return E(x.code+' '+x.fr+'→'+x.to)+'<small>'+E(x.date)+'</small>'}).join('')+'</td><td>'+paxN(g)+'<small>'+E(cab(g.cabin))+'</small></td><td>'+stChip(g.status)+'</td><td>'+(g.pnr?namesDone(g)+'/'+paxN(g):'—')+'</td><td>'+(g.quote?M(g.quote.total):'—')+'</td><td class="'+(lt?'k23gd-late':'')+'">'+E(nextDue(g))+'</td></tr>';
    if(!o)return tr;
    var adm='';
    if(g.status==='requested'||g.status==='quoted'){var ql=g.legs.map(function(Lg){return quoteLeg(Lg,g)});
      adm+='<div class="k23gd-q"><b>'+(z()?'報價（每位，新台幣）':'Quote per person (TWD)')+'</b>'+(g.reviewWhy?'<p class="k23g-p">'+(z()?'需人工報價原因：':'Review: ')+E(g.reviewWhy.join('、'))+'</p>':'')
        +ql.map(function(q,i){var cur=g.quote&&g.quote.legs[i];return '<div class="k23gd-ql"><span>'+E(q.code+' '+q.fr+'→'+q.to+' '+q.date)+'<small>'+(z()?'系統基準 ':'Base ')+M(q.base)+'（'+E(q.cls)+'）· '+(z()?'建議 ':'Suggest ')+M(q.perAdult)+' · '+(z()?'剩位 ':'left ')+q.left+'/'+q.cap+' · LF '+q.lf+'%</small></span>'
          +'<label>'+(z()?'成人':'Adult')+'<input id="k23gqa'+i+'" class="inp" type="number" value="'+(cur?cur.perAdult:q.perAdult)+'"></label><label>'+(z()?'兒童':'Child')+'<input id="k23gqc'+i+'" class="inp" type="number" value="'+(cur?cur.perChild:q.perChild)+'"></label></div>'}).join('')
        +'<div class="k23g-act"><button type="button" class="k23g-btn" onclick="event.stopPropagation();kgmGrpAdmR1023A(\'quote\',\''+A(g.id)+'\')">'+(g.status==='quoted'?(z()?'更新報價':'Update quote'):(z()?'送出報價':'Send quote'))+'</button>'
        +'<input id="k23gWhy" class="inp" placeholder="'+(z()?'婉拒原因（選填）':'Reason (optional)')+'" style="max-width:220px"><button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'decline\',\''+A(g.id)+'\')">'+(z()?'婉拒':'Decline')+'</button>'
        +(g.status==='quoted'?'<button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'extend\',\''+A(g.id)+'\')">'+(z()?'報價延長 72 小時':'Extend quote')+'</button>':'')+'</div></div>'}
    if(g.status==='held'||g.status==='deposit_paid')adm+='<div class="k23g-act"><button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'resend\',\''+A(g.id)+'\')">'+(z()?'重寄付款資料':'Resend payment')+'</button><button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'extend\',\''+A(g.id)+'\',\''+(g.status==='held'?'deposit':'names')+'\')">'+(g.status==='held'?(z()?'訂金期限 +3 天':'Deposit +3d'):(z()?'名單期限 +3 天':'Names +3d'))+'</button>'
      +(g.status==='deposit_paid'?'<button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'ticket\',\''+A(g.id)+'\')">'+(z()?'開票':'Issue tickets')+'</button>':'')+'<button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'cancel\',\''+A(g.id)+'\')">'+(z()?'取消並釋位':'Cancel & release')+'</button></div>';
    if(g.pnr)adm+='<div class="k23g-act"><button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'pnr\',\''+A(g.id)+'\')">'+(z()?'開啟 PNR ':'Open PNR ')+E(g.pnr)+'</button><button type="button" class="k23g-btn ghost" onclick="kgmGrpAdmR1023A(\'csv\',\''+A(g.id)+'\')">'+(z()?'匯出名單 CSV':'Export names')+'</button></div>';
    var info='<div class="k23gd-info"><div><small>'+(z()?'聯絡人':'Contact')+'</small><b>'+E(g.contact.name)+'</b><span>'+E(g.contact.email)+' · '+E(g.contact.phone)+'</span></div><div><small>'+(z()?'旅行社／註冊編號':'Agency / licence')+'</small><b>'+E(g.agency||'—')+'</b><span>'+E(g.license||'—')+'</span></div><div><small>'+(z()?'備註':'Notes')+'</small><span>'+E(g.notes||'—')+'</span></div></div>';
    var hist='<details class="k23gd-h"><summary>'+(z()?'處理紀錄':'History')+' · '+(g.history||[]).length+'</summary>'+(g.history||[]).slice().reverse().map(function(h){return '<div><time>'+E(String(h.at).slice(0,16).replace('T',' '))+'</time> '+E(h.act)+' <small>'+E(h.by||'')+'</small></div>'}).join('')+'</details>';
    return tr+'<tr class="k23gd-open"><td colspan="8" onclick="event.stopPropagation()">'+legTable(g,true)+money3(g)+info+adm+hist+'</td></tr>'}).join('');
  return '<section class="k23gd"><header><div><small>GROUP DESK</small><b>'+(z()?'團體訂位（旅行團）':'Group bookings')+'</b></div><span>'+(z()?'旅行社在前台「團體訂位」送出申請；系統可自動報價的會直接報價，其餘在這裡人工報價。團體 PNR 在「定位管理」的清單上標「團體」，開啟後有團體資訊列。':'Requests come from the website. Group PNRs are tagged in Bookings.')+'</span></header>'
    +head+(S.grpAdmMsgR1023A?'<div class="k23g-msg">'+E(S.grpAdmMsgR1023A)+'</div>':'')
    +(show.length?'<div class="k23g-scroll"><table class="k23g-t k23gd-t"><thead><tr><th>'+(z()?'團號':'Group')+'</th><th>'+(z()?'團名／旅行社':'Name / agency')+'</th><th>'+(z()?'航班':'Flights')+'</th><th>'+(z()?'人數':'Pax')+'</th><th>'+(z()?'狀態':'Status')+'</th><th>'+(z()?'名單':'Names')+'</th><th>'+(z()?'金額':'Total')+'</th><th>'+(z()?'下一個期限':'Next deadline')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      :'<div class="k23g-none">'+(z()?'這個分類沒有團體訂位。':'No groups here.')+'</div>')+'</section>'};
/* 1023A T：後台獨立分頁「團體訂位」（groups23） */
window.kgmGroupDeskPageR1023A=function(){var pm='use';try{pm=window.kgmPermR123?window.kgmPermR123('groups23'):'use'}catch(_){}
  if(pm==='none')return '<div class="k23g-note bad">'+(z()?'你的職務沒有「團體訂位」分頁的權限，可在審核中心申請。':'No access to Group bookings.')+'</div>';
  return '<div class="k23gp">'+window.kgmGroupDeskHtmlR1023A()+'</div>'};   /* 權限跟側邊欄同一份（kgmPermR123） */
window.kgmGroupOpenR1023A=function(id){S.adminTab='groups23';S.grpFilterR1023A='all';S.grpOpenR1023A=id;try{render()}catch(_){}};
/* 開啟的訂位是團體 PNR：資訊列 */
window.kgmGroupBannerR1023A=function(b){if(!b||!b.groupR1023A)return '';var g=G().filter(function(x){return x.id===b.groupR1023A.id})[0];
  return '<div class="k23g-banner"><b>'+(z()?'旅行團／團體 GROUP':'GROUP')+'</b><span>'+E(b.groupR1023A.id)+' · '+E(b.groupR1023A.name)+(b.groupR1023A.agency?' · '+E(b.groupR1023A.agency):'')+'</span>'+(g?stChip(g.status)+'<span>'+(z()?'名單 ':'Names ')+namesDone(g)+'/'+paxN(g)+'</span>':'')+(S.adminAuthed?'<button type="button" class="k23g-btn ghost" onclick="kgmGroupOpenR1023A(\''+A(b.groupR1023A.id)+'\')">'+(z()?'開啟團體訂位 →':'Open group →')+'</button>':'')+'<em>'+(z()?'G 艙團體票：不可線上改票／退票，姓名與人數異動由團體業務處理。':'Group fare: changes via the group desk.')+'</em></div>'};
window.kgmGroupTagR1023A=function(pnr){var b=bk(pnr);return b&&b.groupR1023A?'<i class="k23g-tag">'+(z()?'團體':'GROUP')+'</i>':''};

var CSS='.k23g{max-width:1180px;margin:0 auto;padding:22px 20px 60px;color:#14231D}'
  +'.k23g-hero{background:linear-gradient(135deg,#0B3D2E,#145A44);color:#fff;border-radius:20px;padding:28px 30px 22px;margin-bottom:16px}'
  +'.k23g-hero small{letter-spacing:2.4px;font-size:11px;color:#D6B25E;font-weight:800}.k23g-hero h1{margin:6px 0 6px;font-size:30px}.k23g-hero p{margin:0 0 14px;color:#CFE1D8;font-size:14px;max-width:640px;line-height:1.7}'
  +'.k23g-steps{display:flex;gap:8px;list-style:none;margin:0;padding:0;flex-wrap:wrap}.k23g-steps li{display:flex;align-items:center;gap:7px;padding:6px 12px 6px 6px;border-radius:999px;background:rgba(255,255,255,.08);font-size:12.5px;color:#CFE1D8}'
  +'.k23g-steps li i{font-style:normal;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.15);font-size:11px;font-weight:800}'
  +'.k23g-steps li.done{color:#fff}.k23g-steps li.done i{background:#D6B25E;color:#0B3D2E}.k23g-steps li.on{background:#fff;color:#0B3D2E;font-weight:800}.k23g-steps li.on i{background:#0B3D2E;color:#fff}'
  +'.k23g .k23g-card .k23g-steps li{background:#F1F4F2;color:#5F6B66}'
  +'.k23g-tabs{display:flex;gap:6px;margin:0 0 14px;flex-wrap:wrap}.k23g-tabs button{border:1px solid #D9E0DC;background:#fff;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer;color:#5F6B66}.k23g-tabs button.on{background:#0B3D2E;color:#fff;border-color:#0B3D2E}'
  +'.k23g-cols{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start}@media(max-width:900px){.k23g-cols{grid-template-columns:1fr}}'
  +'.k23g-card{background:#fff;border:1px solid #E3E8E5;border-radius:16px;padding:16px 18px;margin-bottom:12px}.k23g-card>header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}.k23g-card>header b{font-size:15px;color:#0B3D2E}.k23g-card>header span{font-size:12.5px;color:#7A857F}'
  +'.k23g-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.k23g-head small{font-size:11.5px;letter-spacing:1px;color:#9A7B2F;font-weight:700}.k23g-head h2{margin:4px 0;font-size:22px;color:#0B3D2E}.k23g-head p{margin:0;color:#5F6B66;font-size:13px}'
  +'.k23g-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px 12px}.k23g-grid label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:#5F6B66;font-weight:600}.k23g-wide{grid-column:1/-1}'
  +'.k23g-act{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.k23g-btn{border:0;background:#0B3D2E;color:#fff;border-radius:999px;padding:10px 20px;font-weight:800;cursor:pointer;font-size:13.5px}.k23g-btn.ghost{background:#fff;color:#0B3D2E;border:1px solid #C9D3CE;padding:8px 14px;font-size:12.5px}'
  +'.k23g-p{font-size:12.5px;color:#6B756F;line-height:1.7;margin:4px 0}.k23g-none{padding:12px;border-radius:10px;background:#F6F7F6;color:#7A857F;font-size:12.5px}'
  +'.k23g-msg{margin:0 0 12px;padding:10px 14px;border-radius:12px;background:#FFF6E5;border:1px solid #F0C778;color:#6B4A0E;font-size:13px;font-weight:600}'
  +'.k23g-note{padding:12px 14px;border-radius:12px;background:#EAF2FC;color:#1F4E86;font-size:13px;line-height:1.7;margin-bottom:6px}.k23g-note.ok{background:#E9F5EF;color:#0B6B48}.k23g-note.bad{background:#FDECEA;color:#A3271C}'
  +'.k23g-st{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:800;white-space:nowrap}'
  +'.k23g-t{width:100%;border-collapse:collapse;font-size:13px}.k23g-t th{text-align:left;font-size:11.5px;color:#7A857F;font-weight:700;padding:8px 10px;border-bottom:1px solid #E3E8E5;white-space:nowrap}.k23g-t td{padding:9px 10px;border-bottom:1px solid #EEF1EF;vertical-align:top}.k23g-t td small{display:block;color:#8A948F;font-size:11.5px;margin-top:2px}'
  +'.k23g-names td{padding:5px 6px}.k23g-names .inp{min-width:90px;padding:6px 8px;font-size:12.5px}.k23g-scroll{overflow-x:auto}'
  +'.k23g-money{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 12px}@media(max-width:700px){.k23g-money{grid-template-columns:repeat(2,minmax(0,1fr))}}'
  +'.k23g-money>div{background:#fff;border:1px solid #E3E8E5;border-radius:14px;padding:12px 14px}.k23g-money small{display:block;font-size:11.5px;color:#7A857F;font-weight:700}.k23g-money b{display:block;font-size:18px;color:#0B3D2E;margin:3px 0}.k23g-money span{font-size:12px;color:#5F6B66}'
  +'.k23g-rules{background:#F7F5EF;border:1px solid #EAE3CF;border-radius:16px;padding:16px 18px;font-size:12.5px;color:#4A4535;line-height:1.75;position:sticky;top:14px}.k23g-rules b{color:#0B3D2E;font-size:14px}.k23g-rules ul{margin:8px 0 0;padding-left:18px}'
  +'.k23g-paste{margin:8px 0}.k23g-paste summary{cursor:pointer;font-size:12.5px;font-weight:700;color:#0B3D2E}.k23g-paste textarea{width:100%;margin:6px 0}'
  +'.k23gd{background:#fff;border:1px solid #E3E8E5;border-radius:16px;padding:16px 18px;margin:0 0 14px}.k23gd>header{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:10px;flex-wrap:wrap}'
  +'.k23gd>header small{display:block;font-size:10.5px;letter-spacing:2px;color:#9A7B2F;font-weight:800}.k23gd>header b{font-size:18px;color:#0B3D2E}.k23gd>header span{font-size:12px;color:#7A857F;max-width:560px;line-height:1.6}'
  +'.k23gd-kpi{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.k23gd-kpi button{border:1px solid #E3E8E5;background:#F8FAF9;border-radius:12px;padding:8px 14px;cursor:pointer;text-align:left;min-width:92px}.k23gd-kpi button b{display:block;font-size:18px;color:#0B3D2E}.k23gd-kpi button span{font-size:11.5px;color:#6B756F}.k23gd-kpi button.on{background:#0B3D2E;border-color:#0B3D2E}.k23gd-kpi button.on b,.k23gd-kpi button.on span{color:#fff}'
  +'.k23gd-t tbody tr{cursor:pointer}.k23gd-t tbody tr:hover td{background:#FAFBFA}.k23gd-t tr.on td{background:#F3F7F5}.k23gd-t tr.late td:first-child{box-shadow:inset 3px 0 0 #C0392B}.k23gd-late{color:#A3271C;font-weight:700}'
  +'.k23gd-open>td{background:#F8FAF9;cursor:default;padding:14px}.k23gd-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 10px}.k23gd-info>div{background:#fff;border:1px solid #E3E8E5;border-radius:12px;padding:10px 12px;font-size:12.5px}.k23gd-info small{display:block;color:#7A857F;font-weight:700;font-size:11px}.k23gd-info b{display:block;color:#0B3D2E}'
  +'.k23gd-q{background:#fff;border:1px solid #E3E8E5;border-radius:12px;padding:12px;margin:0 0 6px}.k23gd-ql{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-top:8px}.k23gd-ql>span{flex:1;min-width:240px;font-size:13px;font-weight:700}.k23gd-ql>span small{display:block;font-weight:500;color:#7A857F}.k23gd-ql label{display:flex;flex-direction:column;font-size:11.5px;color:#6B756F}.k23gd-ql .inp{width:120px}'
  +'.k23gd-h{margin-top:10px;font-size:12px;color:#5F6B66}.k23gd-h summary{cursor:pointer;font-weight:700}.k23gd-h div{padding:3px 0}.k23gd-h time{color:#8A948F}'
  +'.k23g-tag{font-style:normal;display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;background:#FFF3E0;color:#B26A00;font-size:10.5px;font-weight:800;vertical-align:middle}'
  +'.k23gp{max-width:1180px}.k23gp .k23gd{margin:0}'
  +'.k23g-banner{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 14px;border-radius:12px;background:#FFF6E5;border:1px solid #F0C778;margin:0 0 10px;font-size:13px}.k23g-banner b{color:#B26A00;letter-spacing:.5px}.k23g-banner em{font-style:normal;color:#6B5A2A;font-size:12px;flex-basis:100%}';
try{var st=document.createElement('style');st.id='k23-css-g';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
