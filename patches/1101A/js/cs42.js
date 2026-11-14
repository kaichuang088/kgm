
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
function canOpen(){return /^(ceo|ground|service|backend|cabin|crew)$/.test(role())}
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
  S.case7New={pnr:'',type:/^(cabin|crew)$/.test(role())?'onboard_service':'bag_delayed',pax:0,seg:0,prio:'normal',notify:true,err:'',flR1115A:fl};S.case115Q='';S.case115Msg='';try{render()}catch(_){}};
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
    +'<div class="k115c-who">'+(z()?'申請者：':'Opened by: ')+'<b>'+E(({ground:z()?'機場地勤':'Airport staff',cabin:z()?'客艙組員':'Cabin crew',crew:z()?'客艙組員':'Cabin crew',service:z()?'客服中心':'Customer service'}[role()])||(z()?'客服中心':'Customer service'))+'</b> '+E(((S.adminUser||{}).name||'')+' '+((S.adminUser||{}).empId||''))+'</div></div>'}
function bar(){var fl=selFl();if(!fl)return '';
  return '<div class="k115c-bar" id="k115cbar"><button type="button" class="k115c-btn" onclick="kgmCaseFlightOpenR1115A()">＋ '+(z()?'為這班旅客建立案件':'Open a case for a passenger')+'</button><span>'+(z()?'行李沒有送達、座位重複／超賣、機上服務、旅客受傷…（'+E(fl.code+' '+fl.date)+'）':'Delayed bags, duplicate seats, in-flight incidents…')+'</span>'
    +(S.case115Msg?'<em>'+E(S.case115Msg)+'</em>':'')+'</div>'}
function paint(){try{
  if(S.view!=='admin'||!S.adminAuthed){var h0=document.getElementById('k115cm');if(h0)h0.remove();return}
  /* 航班資料頁：入口按鈕 */
  if(S.adminTab==='flightdata'&&canOpen()){var root=document.querySelector('.r7-admin')||document.querySelector('.p-admin-main');
    if(root&&selFl()){var old=document.getElementById('k115cbar'),nb=bar();if(old){if(old.getAttribute('data-h')!==nb){old.outerHTML=nb.replace('id="k115cbar"','id="k115cbar" data-h="'+E(nb)+'"')}}else root.insertAdjacentHTML('afterbegin',nb.replace('id="k115cbar"','id="k115cbar" data-h="'+E(nb)+'"'))}}   /* 內容沒變就不重畫（背景一直重畫會讓按鈕在點下去的瞬間被換掉） */
  /* 表單：案件處理中心以外的頁面也要畫得出來（空服員沒有案件處理中心） */
  var host=document.getElementById('k115cm'),f=S.case7New;
  var onCases=S.adminTab==='cases0831B'&&document.querySelector('.k7c-modal:not(#k115cm .k7c-modal)');
  if(f&&!onCases&&window.kgmCase7FormR1115A){if(!host){host=document.createElement('div');host.id='k115cm';document.body.appendChild(host)}host.innerHTML=window.kgmCase7FormR1115A()}
  else if(host&&(!f||onCases))host.remove();
  if(f&&f.flR1115A){var bd=document.querySelector('.k7c-dlg-body');if(bd&&!bd.querySelector('.k115c-pick'))bd.insertAdjacentHTML('afterbegin',picker())}
}catch(e){try{console.warn('cs42',e)}catch(_){}}}
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
 +'.k115c-none{color:#8A948F;font-size:12px;padding:6px}.k115c-sim{margin-top:6px;font-size:11.5px;color:#8A5A12;background:#FFF6E5;border-radius:8px;padding:5px 8px}.k115c-who{margin-top:6px;font-size:12px;color:#5F6B66}.k115c-who b{color:#0B3D2E}';
  (document.head||document.documentElement).appendChild(cs)}catch(_){}
})();
