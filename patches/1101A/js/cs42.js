
/* ══ 1115A D9：地勤／空服員為旅客成立案件 ══
   使用者：「然後地勤／空服員也要可以成立案件喔 申請者可以直接寫地勤 像是行李沒有送達地勤可以直接創建案件 位置超賣等等也是」
   原本（1007A）只有地勤、客服、CEO 在「案件處理中心」用 PNR 建案件；空服員沒有入口，現場也常常不知道 PNR。
   ・航班資料頁（地勤、空服員都看得到自己的班）上方加「＋ 為這班旅客建立案件」：從這班旅客名單（同一份艙單，含系統模擬旅客）用姓名／座位／PNR 找人。
   ・表單就是原本那一個（kgmCase7FormR1115A＝案件處理中心的 newForm7），送出也是原本的 kgmCase7Create；
     申請者寫「機場地勤」或「客艙組員」＋姓名員編（後台看得到），旅客看到的是單位。
   ・新類型：座位重複／超賣（機上）、機上服務事件、旅客受傷／身體不適；行李延誤標成「行李延誤／未送達」。
   ・模擬旅客（沒有真的訂位）一樣可以建案件，但不寄信、不發站內通知（模擬資料一律不寄信）。 */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function role(){var u=S.adminUser||{};if(u.empId==='MASTER')return 'ceo';var r=String(u.role||'').toLowerCase();return r==='admin'?'ceo':r}
function canOpen(){return /^(ceo|ground|service|backend|cabin|crew|pilot)$/.test(role())}   /* 1118A G7：機師也可以 */
window.kgmCaseCanOpenR1115A=canOpen;
var MC={k:'',t:0,L:[]};
function selFl(){var p=String(S.opsSelectedR7||'').split('|');return p[0]&&p[1]?{code:p[0],date:p[1],fr:p[2]||'',to:p[3]||''}:null}
function paxOf(fl){
  var k=fl.code+'|'+fl.date+'|'+fl.fr+'|'+fl.to;if(MC.k===k&&Date.now()-MC.t<120000)return MC.L;
  var L=[];try{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===fl.code&&!x.via&&(!fl.fr||x.fr===fl.fr)})[0];
    if(f&&typeof window.manifest7==='function'){var sf=f;try{sf=Object.assign({},(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,fl.date))||f)}catch(_){}
      window.KGM_NODH_R1023A=1;try{L=(window.manifest7(sf,fl.date)||[]).filter(function(p){return p&&!p.staff})}finally{window.KGM_NODH_R1023A=0}}}catch(_){}
  MC={k:k,t:Date.now(),L:L};return L}
function bkOf(pnr){return (S.bookings||[]).filter(function(b){return b&&b.status!=='cancelled'&&String(b.pnr||'').toUpperCase()===String(pnr||'').toUpperCase()})[0]||null}
/* 原本表單用：模擬旅客沒有訂位 → 給表單一份只有這位旅客、這一段的資料（不寄信、不通知） */
window.kgmCase7SimBkR1115A=function(f){var q=f&&f.simR1115A;if(!q)return null;var fl=f.flR1115A||{};f.notify=false;f.pax=0;f.seg=0;
  return {pnr:q.pnr,paxList:[{lastName:q.last||q.name||'',firstName:q.first||''}],outF:{code:fl.code,fr:fl.fr,to:fl.to,date:fl.date},simR1115A:1}};
window.kgmCaseFlightOpenR1115A=function(){var fl=selFl();if(!fl||!canOpen())return;
  S.case7New={pnr:'',type:/^(cabin|crew|pilot)$/.test(role())?'onboard_service':'bag_delayed',pax:0,seg:0,prio:'normal',notify:true,err:'',flR1115A:fl};S.case115Q='';S.case115Msg='';try{render()}catch(_){}};
window.kgmCasePickR1115A=function(i){var f=S.case7New;if(!f||!f.flR1115A)return;var p=paxOf(f.flR1115A)[+i];if(!p)return;
  var b=p.real?bkOf(p.pnr):null;f.seatR1115A=p.seat||'';f.err='';
  if(b){f.simR1115A=null;f.pnr=b.pnr;f.pax=+p.passengerIndex||0;f.notify=true;
    var segs=[];try{segs=(typeof window.segs7==='function'?window.segs7(b,true):[]).filter(function(s){return s.f&&s.f.code})}catch(_){}
    var ix=-1;segs.forEach(function(s,j){if(ix<0&&s.f.code===f.flR1115A.code&&(s.date||s.f.date)===f.flR1115A.date)ix=j});f.seg=ix<0?0:ix}
  else{f.pnr=p.pnr;f.simR1115A={pnr:p.pnr,name:p.name,last:p.last,first:p.first,seat:p.seat,cabin:p.cabin};f.notify=false;f.pax=0;f.seg=0}
  try{render()}catch(_){}};
window.kgmCaseQR1115A=function(v){S.case115Q=v;var el=document.getElementById('k115cl');if(el)el.innerHTML=list()};
function list(){var f=S.case7New;if(!f||!f.flR1115A)return '';var L=paxOf(f.flR1115A),q=String(S.case115Q||'').trim().toUpperCase(),out=[];
  L.forEach(function(p,i){if(out.length>=60)return;var s=(p.name+' '+p.seat+' '+p.pnr+' '+(p.member||'')).toUpperCase();if(q&&s.indexOf(q)<0)return;
    var on=(f.simR1115A&&f.simR1115A.pnr===p.pnr&&f.simR1115A.name===p.name)||(!f.simR1115A&&f.pnr===p.pnr&&(+f.pax||0)===(+p.passengerIndex||0));
    out.push('<button type="button" class="'+(on?'on':'')+'" onclick="kgmCasePickR1115A('+i+')"><b>'+E(p.seat||'—')+'</b><span>'+E(p.name)+'</span><small>'+E(p.cabin||'')+' · '+E(p.pnr)+(p.real?'':(z()?' · 模擬':' · sim'))+'</small></button>')});
  return out.length?out.join(''):'<div class="k115c-none">'+(z()?'找不到符合的旅客':'No match')+'</div>'}
function picker(){var f=S.case7New,fl=f.flR1115A,n=paxOf(fl).length;
  return '<div class="k115c-pick"><div class="k115c-h"><b>'+(z()?'這班旅客 ':'Passengers on ')+E(fl.code+' '+fl.fr+'→'+fl.to+' '+fl.date)+'</b><small>'+n+(z()?' 位 · 用姓名、座位或 PNR 找':' pax')+'</small></div>'
    +'<input class="inp" placeholder="'+(z()?'例：32K、CHEN、ABC123':'e.g. 32K, CHEN')+'" value="'+E(S.case115Q||'')+'" oninput="kgmCaseQR1115A(this.value)">'
    +'<div class="k115c-list" id="k115cl">'+list()+'</div>'
    +(f.simR1115A?'<div class="k115c-sim">'+(z()?'這位是系統模擬旅客（沒有真的訂位）：案件照樣成立，但不寄信、不發通知。':'Simulated passenger: no email or notice will be sent.')+'</div>':'')
    +'<div class="k115c-tip">'+(z()?'要換別班：關掉這個視窗，在航班資料左邊選你的另一班再按「＋ 為這班旅客建立案件」。'+((function(){try{return window.kgmPermR123&&window.kgmPermR123('cases0831B')}catch(_){return false}})()?'旅客不在你的航班上：到「案件處理中心」用訂位代號建立。':''):'To switch flights, close this and pick another flight on the left.')+'</div>'
    +'<div class="k115c-who">'+(z()?'申請者：':'Opened by: ')+'<b>'+E(({ground:z()?'機場地勤':'Airport staff',cabin:z()?'客艙組員':'Cabin crew',crew:z()?'客艙組員':'Cabin crew',service:z()?'客服中心':'Customer service'}[role()])||(z()?'客服中心':'Customer service'))+'</b> '+E(((S.adminUser||{}).name||'')+' '+((S.adminUser||{}).empId||''))+'</div></div>'}
function bar(){var fl=selFl();if(!fl)return S.case115Msg&&S.adminTab==='flightdata'?'<div class="k115c-bar" id="k115cbar"><em>'+E(S.case115Msg)+'</em></div>':'';
  return '<div class="k115c-bar" id="k115cbar"><button type="button" class="k115c-btn" onclick="kgmCaseFlightOpenR1115A()">＋ '+(z()?'為這班旅客建立案件':'Open a case for a passenger')+'</button><span>'+(z()?'行李沒有送達、座位重複／超賣、機上服務、旅客受傷…（'+E(fl.code+' '+fl.date)+'）':'Delayed bags, duplicate seats, in-flight incidents…')+'</span>'
    +(S.case115Msg?'<em>'+E(S.case115Msg)+'</em>':'')+'</div>'}
/* 1115B E4（使用者：「哪裡可以提出案件for地勤and空服 也要清楚喔」）：地勤、空服員的後台側欄最上面一顆「＋ 提出案件」，
   按了就到航班資料（自己的班，預設最近一班）並直接打開「為這班旅客建立案件」；旁邊寫可以建哪些事、去哪裡看。 */
function navRole(){var r=role();return r==='ground'||r==='cabin'||r==='crew'||r==='pilot'||r==='service'}   /* 1118A G7：客服、機師也有 */
/* 側欄常被背景重畫整個換掉 → 按下（pointerdown）就動作，click 再來一次 600 毫秒內不重複 */
var GO15=0;function once15(){var n=Date.now();if(n-GO15<600)return false;GO15=n;return true}
window.kgmCaseGoR1115B=function(){if(!canOpen()||!once15())return;S.case7New=null;S.case115Q='';S.case115Auto=Date.now();S.case115Msg='';S.adminTab='flightdata';try{render()}catch(_){}waitSel()};
/* 地勤／組員的「自己的班」是背景算的（地勤班表第一次要幾秒）→ 最多等 45 秒找到就打開，找不到才提示稍後再按 */
var WS=0;function waitSel(){clearTimeout(WS);WS=setTimeout(function(){if(!S.case115Auto)return;if(S.adminTab!=='flightdata'){S.case115Auto=0;return}try{render()}catch(_){}paint();if(S.case115Auto)waitSel()},1000)}
/* 1115B E3：空服員、機師側欄提醒許願截止（哪個月、哪天截止、送了沒），按「去許願」到自己的班表 */
function wishRole(){var r=role();return r==='cabin'||r==='crew'||r==='pilot'}
window.kgmWishGoR1115B=function(){var u=S.adminUser||{};if(!u.empId||!once15())return;S.adminTab='sched';S.crewSelR196=u.empId;try{render()}catch(_){}
  var n=0;(function f(){var w=document.querySelector('.k115w');if(w){try{w.scrollIntoView({behavior:'smooth',block:'center'})}catch(_){}return}if(++n<40)setTimeout(f,500)})()};
function wishBox(){if(!wishRole()||!window.kgmCrewWishMonthR1115A||!window.kgmCrewWishDeadlineR1115B)return '';var u=S.adminUser||{},mo=window.kgmCrewWishMonthR1115A(),w=null;
  try{var me=(S.staff||[]).filter(function(x){return x&&x.empId===u.empId})[0];w=window.kgmCrewWishOfR1115A(u.empId,(me&&me.base)||((me&&me.nationality==='TH')?'BKK':'TPE'),mo)}catch(_){}   /* 員工檔的基地（不碰組員池，重畫時不花時間） */
  var dl=new Date(window.kgmCrewWishDeadlineR1115B(mo)+8*3600000),dt=(dl.getUTCMonth()+1)+'/'+dl.getUTCDate()+' 23:59',ms=window.kgmCrewWishDeadlineR1115B(mo)-Date.now(),hh=Math.max(0,Math.floor(ms/3600000));
  return '<div class="k115c-wish'+(w&&w.mine?' ok':'')+'"><b>'+(z()?'許願航點 · '+mo:'Bids · '+mo)+'</b><small>'+(z()?'截止 '+dt+'（剩 '+(hh>=24?Math.floor(hh/24)+' 天 '+(hh%24)+' 小時':hh+' 小時')+'）· '+(w&&w.mine?'已送出':'還沒送出（沒送出＝不指定）'):'Closes '+dt+(w&&w.mine?' · submitted':' · not submitted'))+'</small><button type="button" onpointerdown="kgmWishGoR1115B()" onclick="kgmWishGoR1115B()">'+(z()?(w&&w.mine?'查看／修改':'去許願'):'Open')+'</button></div>'}
function nav(){var side=document.querySelector('.p-admin-side');if(!side)return;var old=document.getElementById('k115cnav');
  var showCase=navRole()&&canOpen(),wb=wishBox();
  if(!showCase&&!wb){if(old)old.remove();return}
  var casesOk=false;try{casesOk=!!(window.kgmPermR123&&window.kgmPermR123('cases0831B'))}catch(_){}
  var html='<div id="k115cnav" class="k115c-nav">'+(showCase?'<button type="button" class="'+(S.adminTab==='newcase118'?'on':'')+'" onpointerdown="kgmNcGoR1118A()" onclick="kgmNcGoR1118A()">＋ '+(z()?'提出案件':'Open a case')+'</button><small>'+(z()?'獨立分頁：從你的航班旅客或訂位代號建立，看你建過的案件。':'Own tab: from your flights or a PNR; see the cases you opened.')+'</small>':'')+wb+'</div>';
  if(old&&old.parentElement===side&&old.getAttribute('data-h')===html)return;if(old)old.remove();
  side.insertAdjacentHTML('afterbegin',html.replace('id="k115cnav"','id="k115cnav" data-h="'+E(html)+'"'))}
function paint(){try{
  if(S.view!=='admin'||!S.adminAuthed){var h0=document.getElementById('k115cm');if(h0)h0.remove();return}
  nav();
  if(S.case115Auto&&S.adminTab==='flightdata'){if(selFl()){S.case115Auto=0;S.case115Msg='';if(!S.case7New){window.kgmCaseFlightOpenR1115A();return}}
    else if(Date.now()-S.case115Auto>45000){S.case115Auto=0;S.case115Msg=z()?'還找不到你這 7 天的航班：可能真的沒有排班，也可能地勤／組員班表還在背景排（剛開頁時要等一下）。請稍後再按一次「＋ 提出案件」；旅客不在你的航班上，到「案件處理中心」用訂位代號建立。':'Could not find your flights yet — try again shortly.'}
    else S.case115Msg=z()?'正在找你這 7 天的航班…':'Finding your flights…'}
  /* 航班資料頁：入口按鈕 */
  if(S.adminTab==='flightdata'&&canOpen()){var root=document.querySelector('.r7-admin')||document.querySelector('.p-admin-main');
    if(root&&(selFl()||S.case115Msg)){var old=document.getElementById('k115cbar'),nb=bar();if(old){if(old.getAttribute('data-h')!==nb){old.outerHTML=nb.replace('id="k115cbar"','id="k115cbar" data-h="'+E(nb)+'"')}}else root.insertAdjacentHTML('afterbegin',nb.replace('id="k115cbar"','id="k115cbar" data-h="'+E(nb)+'"'))}}   /* 內容沒變就不重畫（背景一直重畫會讓按鈕在點下去的瞬間被換掉） */
  /* 表單：案件處理中心以外的頁面也要畫得出來（空服員沒有案件處理中心） */
  var host=document.getElementById('k115cm'),f=S.case7New;
  var onCases=S.adminTab==='cases0831B'&&document.querySelector('.k7c-modal:not(#k115cm .k7c-modal)');
  if(f&&!onCases&&window.kgmCase7FormR1115A){if(!host){host=document.createElement('div');host.id='k115cm';document.body.appendChild(host)}host.innerHTML=window.kgmCase7FormR1115A()}
  else if(host&&(!f||onCases))host.remove();
  if(f&&f.flR1115A){var bd=document.querySelector('.k7c-dlg-body');if(bd&&!bd.querySelector('.k115c-pick'))bd.insertAdjacentHTML('afterbegin',picker())}
}catch(e){try{console.warn('cs42',e)}catch(_){}}}

/* ══ 1118A G7（使用者：「地勤和客服和組員是都有創建案件的能力對嗎有獨立的tab」）══
   後台「提出案件」獨立分頁（S.adminTab='newcase118'，側欄最上面那顆鈕）：地勤、客服、空服員、機師都有。
   ① 從我的航班建立（地勤／空服員／機師）：列出自己這 7 天的航班（組員讀已算好的班表、地勤讀地勤班表，背景一天一天補），按「建立案件」→ 這班旅客名單挑人 → 原本的建案表單；
   ② 用訂位代號建立（每個職位都有；旅客不在你的航班上也可以）；③ 我建立的案件（案件編號、類型、旅客、航班、狀態）。
   建案表單、通知、模擬旅客不寄信、案件處理中心照舊（同一份 S.staffCasesR1007A）。 */
window.kgmNcGoR1118A=function(){if(!canOpen()||!once15())return;S.case7New=null;S.case115Q='';S.case115Msg='';S.adminTab='newcase118';try{render()}catch(_){}};
var NC={k:'',days:null,busy:0};
function D18(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
function td18(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
function myFlights(){var r=role(),u=S.adminUser||{},k=r+'|'+u.empId+'|'+td18();if(NC.k!==k){NC={k:k,days:{},busy:0}}
  var out=[],ds=[];for(var i=0;i<7;i++)ds.push(D18(td18(),i));var missing=0;
  if(r==='ground'){var me=(S.staff||[]).filter(function(x){return x&&x.empId===u.empId})[0]||{},st=me.station||'TPE';
    ds.forEach(function(d){if(!NC.days[d]){missing++;return}var P=NC.days[d],p=(P&&P.people&&P.people[u.empId])||null;
      if(p&&!p.off)(p.tasks||[]).forEach(function(t){(t.flights||[]).forEach(function(f){if(!f||!f.code)return;var fd=(+t.a>=1440)?D18(d,1):(+t.a<0?D18(d,-1):d),key=[f.code,fd,f.fr,f.to].join('|');if(!out.some(function(x){return x.key===key}))out.push({key:key,code:f.code,fr:f.fr,to:f.to,date:fd,dep:f.dep||'',what:t.kind==='arr'?(z()?'到站':'Arrival'):t.kind==='gate'?(z()?'登機門':'Gate'):(z()?'報到櫃檯':'Counter')})})})});
    if(missing&&!NC.busy){var d0=ds.filter(function(d){return !NC.days[d]})[0];NC.busy=1;setTimeout(function(){try{NC.days[d0]=window.kgmGroundPlanR1008A?window.kgmGroundPlanR1008A(st,d0):{}}catch(_){NC.days[d0]={}}NC.busy=0;try{if(S.adminTab==='newcase118'){var el=document.getElementById('k118nc-fl');if(el)el.innerHTML=flHtml()}}catch(_){}},60)}}
  else if(r==='cabin'||r==='crew'||r==='pilot'){var rows=[];window.__kgmRosUI1115B=1;try{rows=window.kgmRosterR196?(window.kgmRosterR196(u.empId,7,true)||[]):[]}catch(_){rows=[]}finally{window.__kgmRosUI1115B=0}
    var got={};rows.forEach(function(x){if(!x||!x.date)return;got[x.date]=1;(x.legs||[]).forEach(function(l){if(!l||!l.code||l.deadhead||l.dh)return;var key=[l.code,x.date,l.fr,l.to].join('|');if(!out.some(function(y){return y.key===key}))out.push({key:key,code:l.code,fr:l.fr,to:l.to,date:x.date,dep:l.dep||'',what:''})})});
    ds.forEach(function(d){var ok=false;try{ok=!!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(d))}catch(_){}if(!ok)missing++})}
  out.sort(function(a,b){return (a.date+a.dep).localeCompare(b.date+b.dep)});return {list:out,missing:missing}}
window.kgmNcFlR1118A=function(key){if(!canOpen())return;S.opsSelectedR7=key;S.case115Msg='';window.kgmCaseFlightOpenR1115A()};
window.kgmNcPnrR1118A=function(){var el=document.getElementById('k118nc-pnr'),v=String(el&&el.value||'').trim().toUpperCase();if(!v){alert(z()?'請輸入訂位代號。':'Enter a booking reference.');return}
  if(!bkOf(v)){alert(z()?'查無訂位代號 '+v+'（取消的訂位不能建案件）。模擬旅客請用上面「從我的航班建立」挑人。':'Booking '+v+' not found.');return}S.case115Msg='';window.kgmCase7Open(v)};
function flHtml(){var r=role(),F=myFlights(),zh=z();if(!(r==='ground'||r==='cabin'||r==='crew'||r==='pilot'))return '';
  var rows=F.list.map(function(f){return '<tr><td><b>'+E(f.code)+'</b></td><td>'+E(f.fr+'→'+f.to)+'</td><td>'+E(f.date.slice(5))+' '+E(f.dep)+'</td><td>'+E(f.what||'')+'</td><td><button type="button" class="k118nc-go" onclick="kgmNcFlR1118A(\''+E(f.key)+'\')">'+(zh?'建立案件':'Open case')+'</button></td></tr>'}).join('');
  return (rows?'<table class="k118nc-t"><thead><tr><th>'+(zh?'航班':'Flight')+'</th><th>'+(zh?'航線':'Route')+'</th><th>'+(zh?'日期／起飛':'Date / dep')+'</th><th>'+(r==='ground'?(zh?'我的工作':'Duty'):'')+'</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>':'')
    +(F.missing?'<p class="k118nc-wait">'+(zh?(r==='ground'?'地勤班表還有 '+F.missing+' 天在背景排，排好會自動出現在這裡。':'組員班表還有 '+F.missing+' 天在背景算，算好會自動出現在這裡。'):F.missing+' day(s) still being rostered.')+'</p>':(!rows?'<p class="k118nc-wait">'+(zh?'你這 7 天沒有排到航班。旅客的事一樣可以用下面的訂位代號建立。':'No flights in the next 7 days.')+'</p>':''))}
var NCT=0;function ncTick(){clearTimeout(NCT);NCT=setTimeout(function(){if(S.view!=='admin'||S.adminTab!=='newcase118')return;var el=document.getElementById('k118nc-fl');if(el){var h=flHtml();if(el.getAttribute('data-h')!==h){el.innerHTML=h;el.setAttribute('data-h',h)}}if(myFlights().missing)ncTick()},3000)}
window.kgmNewCasePageR1118A=function(){try{var zh=z(),r=role(),u=S.adminUser||{};if(!canOpen())return '<div class="k118nc"><h2>'+(zh?'提出案件':'Open a case')+'</h2><p>'+(zh?'你的職位不能建立案件。':'Your role cannot open cases.')+'</p></div>';
    var who={ground:zh?'機場地勤':'Airport staff',cabin:zh?'客艙組員':'Cabin crew',crew:zh?'客艙組員':'Cabin crew',pilot:zh?'機師':'Pilot',service:zh?'客服中心':'Customer service',ceo:'CEO',backend:zh?'後台':'Back office'}[r]||r;
    var mine=(S.staffCasesR1007A||[]).filter(function(c){return c&&c.by&&c.by.empId===u.empId}).slice(0,30);
    var casesOk=false;try{casesOk=!!(window.kgmPermR123&&window.kgmPermR123('cases0831B'))}catch(_){}
    var ST={open:zh?'處理中':'Open',pending:zh?'待處理':'Pending',closed:zh?'已結案':'Closed',ceo:zh?'待 CEO':'CEO review'};
    var fl=(r==='ground'||r==='cabin'||r==='crew'||r==='pilot');ncTick();
    return '<div class="k118nc"><div class="k118nc-hd"><h2>'+(zh?'提出案件':'Open a case')+'</h2><p>'+(zh?'申請者：<b>'+E(who)+'</b> '+E((u.name||'')+' '+(u.empId||''))+'。可以建：行李延誤／未送達、座位重複／超賣、機上服務事件、旅客受傷／身體不適、拒絕登機、寵物、其他。真的訂位會通知旅客；系統模擬旅客照樣成案但不寄信。':'Opened by <b>'+E(who)+'</b>.')+'</p>'+(S.case115Msg?'<div class="k118nc-ok">'+E(S.case115Msg)+'</div>':'')+'</div>'
      +(fl?'<section class="k118nc-c"><h3>① '+(zh?'從我的航班旅客建立':'From my flights')+'</h3><p class="k118nc-s">'+(zh?'你這 7 天的航班；按「建立案件」→ 從這班旅客名單用姓名、座位或 PNR 找人。':'Your flights in the next 7 days.')+'</p><div id="k118nc-fl">'+flHtml()+'</div></section>':'')
      +'<section class="k118nc-c"><h3>'+(fl?'② ':'① ')+(zh?'用訂位代號建立':'By booking reference')+'</h3><p class="k118nc-s">'+(zh?'旅客不在你的航班上、或是電話／Email 進來的案子。':'For passengers not on your flights, phone or email requests.')+'</p><div class="k118nc-pnr"><input id="k118nc-pnr" class="inp" maxlength="8" placeholder="'+(zh?'訂位代號（PNR），例：ABC123':'PNR, e.g. ABC123')+'" onkeydown="if(event.key===\'Enter\')kgmNcPnrR1118A()"><button type="button" class="btn btn-g" onclick="kgmNcPnrR1118A()">'+(zh?'找訂位並建立':'Find & open')+'</button></div></section>'
      +'<section class="k118nc-c"><h3>'+(fl?'③ ':'② ')+(zh?'我建立的案件':'Cases I opened')+' <small>'+mine.length+'</small></h3>'+(mine.length?'<table class="k118nc-t"><thead><tr><th>'+(zh?'案件編號':'Case')+'</th><th>'+(zh?'類型':'Type')+'</th><th>'+(zh?'旅客':'Passenger')+'</th><th>'+(zh?'航班':'Flight')+'</th><th>'+(zh?'建立時間':'Opened')+'</th><th>'+(zh?'狀態':'Status')+'</th></tr></thead><tbody>'+mine.map(function(c){var sg=c.segment||{};return '<tr><td class="mono"><b>'+E(c.caseNo)+'</b></td><td>'+E(c.typeLabelR1101A||c.typeLabel||c.type||'')+'</td><td>'+E(c.paxName||'')+(c.pnr?' <small>'+E(c.pnr)+'</small>':'')+'</td><td>'+E((sg.code||c.flight||'')+(sg.date?' '+String(sg.date).slice(5):''))+'</td><td>'+E(String(c.createdAt||c.at||'').slice(5,16).replace('T',' '))+'</td><td>'+E(ST[c.status]||c.status||'')+'</td></tr>'}).join('')+'</tbody></table>':'<p class="k118nc-wait">'+(zh?'還沒有。':'None yet.')+'</p>')
      +(casesOk?'<p class="k118nc-s">'+(zh?'後續處理、審核在「案件處理中心」。':'Follow-up in the Case Center.')+'</p>':'<p class="k118nc-s">'+(zh?'建好後由客服接手處理，狀態會更新在這裡。':'Customer service takes it from here.')+'</p>')+'</section></div>'}catch(e){return '<div class="k118nc">'+E(e.message)+'</div>'}};
try{var cs18=document.createElement('style');cs18.textContent='.k118nc{max-width:980px}.k118nc-hd h2{margin:0 0 4px;color:#0B3D2E}.k118nc-hd p{margin:0 0 10px;font-size:13px;color:#4D5A54;line-height:1.6}.k118nc-ok{margin:6px 0 10px;padding:8px 12px;border-radius:10px;background:#E6F2EC;color:#0B6B47;font-weight:700;font-size:13px}'
  +'.k118nc-c{background:#fff;border:1px solid #E3E8E5;border-radius:14px;padding:14px 16px;margin:0 0 12px}.k118nc-c h3{margin:0 0 4px;font-size:15px;color:#0F2A21}.k118nc-c h3 small{font-weight:600;color:#7A857F;margin-left:6px}.k118nc-s{margin:0 0 8px;font-size:12.5px;color:#6A756F}'
  +'.k118nc-t{width:100%;border-collapse:collapse;font-size:13px}.k118nc-t th{text-align:left;background:#F3F6F4;padding:6px 8px;font-weight:600;color:#33413A}.k118nc-t td{padding:6px 8px;border-top:1px solid #EEF2F0}.k118nc-go{border:0;border-radius:999px;background:#0B3D2E;color:#fff;padding:5px 12px;font:700 12px inherit;cursor:pointer}.k118nc-go:hover{background:#145A44}'
  +'.k118nc-pnr{display:flex;gap:8px;max-width:520px}.k118nc-pnr .inp{flex:1;text-transform:uppercase}.k118nc-wait{font-size:12.5px;color:#8A5A12;background:#FFF6E5;border-radius:8px;padding:6px 10px;margin:6px 0 0}.k115c-nav button.on{box-shadow:0 0 0 2px #fff inset}';
  (document.head||document.documentElement).appendChild(cs18)}catch(_){}
/* 1118A G7：權限表（r123）沒有這個分頁 → 會被當成「無權限」整頁藏起來；能建案件的職位一律可用 */
function permHook(){var O=window.kgmPermR123;if(typeof O!=='function'||O.__cs118)return;var w=function(tab){if(tab==='newcase118')return canOpen()?'use':'none';return O.apply(this,arguments)};try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__cs118=1;window.kgmPermR123=w}
permHook();setTimeout(permHook,0);setTimeout(permHook,3000);setTimeout(permHook,15000);
var PT=0;function hook(){var r0=window.render;if(typeof r0!=='function'||r0.__cs42)return;var w=function(){var r=r0.apply(this,arguments);paint();clearTimeout(PT);PT=setTimeout(paint,40);return r};
  try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__cs42=1;window.render=w;try{render=w}catch(_){}}
hook();setTimeout(hook,0);setTimeout(hook,3000);setTimeout(hook,15000);
/* 建立後：在航班資料頁寫出案件編號（空服員不會切到案件處理中心） */
function cw(){var o=window.kgmCase7Create;if(typeof o!=='function'||o.__cs42)return;var w=function(){var f=S.case7New,n0=(S.staffCasesR1007A||[]).length;var r=o.apply(this,arguments);
    try{if(!S.case7New&&(S.staffCasesR1007A||[]).length>n0){var c=S.staffCasesR1007A[0];S.case115Msg=(z()?'✓ 已建立案件 ':'✓ Case ')+c.caseNo+' · '+(c.typeLabelR1101A||c.type)+' · '+(c.paxName||'')+(c.simR1103A?(z()?'（模擬旅客，不寄通知）':''):(z()?'（已通知旅客）':''));try{render()}catch(_){}}}catch(_){}return r};
  w.__cs42=1;window.kgmCase7Create=w}
cw();setTimeout(cw,0);setTimeout(cw,3000);
try{var cs=document.createElement('style');cs.id='k115c-css';cs.textContent=
  '.k115c-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 12px;padding:10px 14px;border:1px solid #E3E8E5;border-radius:12px;background:#fff;font-size:12.5px;color:#5F6B66}'
 +'.k115c-btn{border:0;background:#0B3D2E;color:#fff;border-radius:999px;padding:7px 14px;font:700 12.5px inherit;cursor:pointer}.k115c-bar em{font-style:normal;font-weight:700;color:#0B6B47}'
 +'.k115c-pick{border:1px solid #E3E8E5;border-radius:12px;padding:10px 12px;margin:0 0 12px;background:#F8FAF9}.k115c-h{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px}.k115c-h b{color:#0F2A21;font-size:13px}.k115c-h small{color:#7A857F}'
 +'.k115c-pick .inp{width:100%;margin-bottom:6px}.k115c-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px;max-height:210px;overflow:auto}'
 +'.k115c-list button{display:flex;flex-direction:column;align-items:flex-start;gap:1px;text-align:left;border:1px solid #DDE4E0;background:#fff;border-radius:10px;padding:6px 9px;cursor:pointer;font:12px inherit;color:#14231D}'
 +'.k115c-list button b{font-size:12.5px;color:#0B3D2E}.k115c-list button small{color:#8A948F;font-size:10.5px}.k115c-list button.on{border-color:#0B3D2E;background:#EAF3EE;box-shadow:0 0 0 1px #0B3D2E inset}'
 +'.k115c-nav{margin:0 0 12px;padding:12px;border-radius:14px;background:#0B3D2E;color:#E8F1EC}.k115c-nav button{display:block;width:100%;border:0;border-radius:10px;background:#C9A24A;color:#0B2A20;font:800 14px inherit;padding:10px 12px;cursor:pointer;text-align:left}.k115c-nav button:hover{background:#D8B45E}.k115c-nav small{display:block;margin-top:7px;font-size:11.5px;line-height:1.5;color:#CFE0D7}.k115c-tip{margin-top:6px;font-size:11.5px;color:#6A756F}'
 +'.k115c-wish{margin-top:10px;padding:10px 11px;border-radius:11px;background:#FFF4DC;color:#5C3D00}.k115c-wish.ok{background:#E6F2EC;color:#14402F}.k115c-nav>.k115c-wish:first-child{margin-top:0}.k115c-wish b{display:block;font-size:13px}.k115c-wish small{display:block;margin-top:3px;font-size:11.5px;line-height:1.45;color:inherit;opacity:.9}.k115c-nav .k115c-wish button{margin-top:7px;width:auto;padding:6px 12px;font-size:12px;background:#0B3D2E;color:#fff;border-radius:999px}'
 +'.k115c-none{color:#8A948F;font-size:12px;padding:6px}.k115c-sim{margin-top:6px;font-size:11.5px;color:#8A5A12;background:#FFF6E5;border-radius:8px;padding:5px 8px}.k115c-who{margin-top:6px;font-size:12px;color:#5F6B66}.k115c-who b{color:#0B3D2E}';
  (document.head||document.documentElement).appendChild(cs)}catch(_){}
})();
