/* ══ 1007A：後台像正式的員工系統 ═══════════════════════════════════════════
   使用者：「後台這樣感覺很不像正式後台的網站 包含什麼登入介面 很敏感顯示假的 有可能你想一下怎麼調整嗎」
   原本的問題（實際看畫面）：
   · 員工登入頁、後台每一頁都套著旅客網站的頁首（優惠與訂票／行程管理／Member Portal）與頁尾（含「系統自我檢測 Self-Test」），
     右上、右下還有開發用的版號浮標。
   · 首頁（航班狀態）最下面直接攤開「寄信服務診斷」：Cloudflare Worker 網址、origin-blocked 這類技術錯誤 —— 正式系統不會給一般員工看這個。
   · 登入頁有「員工註冊」可以自己選職務（含 CEO）。
   改成：
   · 員工登入獨立成全頁的員工入口：左邊公司與資安告知、右邊登入表單；記住員工編號、顯示密碼、忘記密碼指引。
     帳號、密碼與職務授權碼（原「職務通關密語」，各職務的碼不變）照舊驗證；「員工註冊」改成「首次啟用帳號」（仍需人資發的職務授權碼）。
   · 後台頁面拿掉旅客網站的頁首頁尾與版號浮標，改成員工系統的頂列：系統名稱、目前登入者與職務、版本、登出。
   · 寄信服務診斷只放在「系統設定」分頁（系統人員／CEO 才進得去），航班狀態首頁不再顯示。 */
(function(){
'use strict';
function zh(){try{return LANG!=='en'}catch(_){return true}}
function E(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var RZ={ground:['地勤人員','Ground staff'],cabin:['客艙組員','Cabin crew'],pilot:['飛行員','Pilot'],backend:['系統人員','Systems'],pricing:['定價人員','Pricing'],service:['客服人員','Customer service'],ceo:['執行長','CEO']};
function mode(){try{if(S.view!=='admin')return '';return S.adminAuthed?'console':'login'}catch(_){return ''}}
function tagMode(){try{var m=mode(),h=document.documentElement;if(m){if(h.getAttribute('data-kgm-staff')!==m)h.setAttribute('data-kgm-staff',m)}else if(h.hasAttribute('data-kgm-staff'))h.removeAttribute('data-kgm-staff');bar()}catch(_){}}
/* 記住員工編號（只存在這台裝置） */
function remembered(){try{return localStorage.getItem('kgm_staff_remember_r1007a')||''}catch(_){return ''}}
window.kgmStaffLoginR1007A=function(){
  var id=String(S._alId||'').trim();
  try{if(S._alRem7)localStorage.setItem('kgm_staff_remember_r1007a',id);else localStorage.removeItem('kgm_staff_remember_r1007a')}catch(_){}
  try{(window.doAdminLogin||doAdminLogin)()}catch(e){try{doAdminLogin()}catch(_){}}
  landing();
};
/* 登入後的第一頁：原本照 ROLE_TABS 的第一個（地勤是舊的 seatmap 分頁），但權限表裡沒有那個分頁 → 地勤一登入就是一片空白。
   改成：那一頁沒有權限時，依側邊欄順序找第一個這個職務能用的分頁。 */
var ORDER7=['status','flightdata','groundops','bookings','cases0831B','cases0831C','flightadjust','sched','fleetsched','leave','stafftix','stxstatus','price','fareana','finance','members','milesverify','salary','staff','syscfg','approve','chat'];
function landing(){
  try{
    if(!S.adminAuthed||typeof window.kgmPermR123!=='function')return;
    var u=S.adminUser||{};if(window.kgmPermR123(S.adminTab,u)!=='none')return;
    for(var i=0;i<ORDER7.length;i++){if(window.kgmPermR123(ORDER7[i],u)!=='none'){S.adminTab=ORDER7[i];try{render()}catch(_){}return}}
  }catch(_){}
}
window.kgmStaffActivateR1007A=function(){try{(window.doAdminRegister||doAdminRegister)()}catch(e){try{doAdminRegister()}catch(_){}}};
function loginHtml(){
  var Z=zh(),act=S._admMode==='reg';
  if(S._alId==null||S._alId===''){var r=remembered();if(r){S._alId=r;S._alRem7=true}}
  var role=S._arRole||'ground';
  var left='<aside class="k7a-brand"><div class="k7a-logo"><b>KGM</b><span>AIRWAYS</span></div>'
    +'<div class="k7a-sys"><small>'+(Z?'內部系統':'INTERNAL SYSTEM')+'</small><h1>Operations Portal</h1><p>'+(Z?'營運、訂位、客服、機隊與人資作業系統':'Operations, reservations, customer service, fleet and HR')+'</p></div>'
    +'<div class="k7a-notice"><b>'+(Z?'僅限授權人員使用':'Authorised personnel only')+'</b><p>'+(Z?'本系統僅供 KGM Airways 員工依職務使用。所有登入與操作皆會記錄於稽核日誌；未經授權存取或洩漏旅客個人資料，將依個人資料保護法及公司規定處理。'
      :'For KGM Airways staff only. Every sign-in and action is recorded in the audit log. Unauthorised access or disclosure of passenger data is subject to the Personal Data Protection Act and company policy.')+'</p></div>'
    +'<div class="k7a-help">'+(Z?'IT 服務台　分機 2580　·　it-helpdesk@kgm-airways.com':'IT Service Desk · ext. 2580 · it-helpdesk@kgm-airways.com')+'</div></aside>';
  var form;
  if(!act){
    form='<h2>'+(Z?'員工登入':'Staff sign-in')+'</h2><p class="k7a-lead">'+(Z?'請使用員工編號或公司 Email 登入。':'Sign in with your employee ID or company email.')+'</p>'
      +(S.adminErr?'<div class="k7a-err" role="alert">'+E(S.adminErr)+'</div>':'')
      +'<label>'+(Z?'員工編號或公司 Email':'Employee ID or company email')+'<input class="k7a-in" autocomplete="username" value="'+E(S._alId||'')+'" oninput="S._alId=this.value" onkeydown="if(event.key===\'Enter\')kgmStaffLoginR1007A()"></label>'
      +'<label>'+(Z?'密碼':'Password')+'<span class="k7a-pw"><input class="k7a-in" id="adPw" type="'+(S._alShow7?'text':'password')+'" autocomplete="current-password" value="'+E(S._alPw||'')+'" oninput="S._alPw=this.value" onkeydown="if(event.key===\'Enter\')kgmStaffLoginR1007A()">'
        +'<button type="button" onclick="S._alShow7=!S._alShow7;render()">'+(S._alShow7?(Z?'隱藏':'Hide'):(Z?'顯示':'Show'))+'</button></span></label>'
      +'<label>'+(Z?'職務授權碼':'Role authorisation code')+'<input class="k7a-in" type="password" autocomplete="off" value="'+E(S._alP2||'')+'" oninput="S._alP2=this.value" onkeydown="if(event.key===\'Enter\')kgmStaffLoginR1007A()">'
        +'<small>'+(Z?'第二層驗證：各職務由人資部發給的授權碼。':'Second factor issued by HR for your role.')+'</small></label>'
      +'<div class="k7a-row"><label class="k7a-chk"><input type="checkbox"'+(S._alRem7?' checked':'')+' onchange="S._alRem7=this.checked"> '+(Z?'在這台裝置記住員工編號':'Remember my ID on this device')+'</label>'
        +'<a href="javascript:void 0" onclick="S._alForgot7=!S._alForgot7;render()">'+(Z?'忘記密碼？':'Forgot password?')+'</a></div>'
      +(S._alForgot7?'<div class="k7a-info">'+(Z?'密碼由 IT 服務台重設：請撥分機 2580 或寄信至 it-helpdesk@kgm-airways.com，並準備員工編號以供身分核對。':'Passwords are reset by the IT Service Desk (ext. 2580, it-helpdesk@kgm-airways.com). Have your employee ID ready.')+'</div>':'')
      +'<button class="k7a-go" onclick="kgmStaffLoginR1007A()">'+(Z?'登入':'Sign in')+'</button>'
      +'<p class="k7a-alt">'+(Z?'第一次使用？':'First time here?')+' <a href="javascript:void 0" onclick="S._admMode=\'reg\';S.adminErr=\'\';render()">'+(Z?'啟用員工帳號':'Activate your account')+'</a></p>';
  }else{
    form='<h2>'+(Z?'啟用員工帳號':'Activate staff account')+'</h2><p class="k7a-lead">'+(Z?'新進同仁請以人資部提供的職務授權碼啟用帳號，啟用後即可登入。':'New staff activate their account with the role code issued by HR.')+'</p>'
      +(S.adminErr?'<div class="k7a-err" role="alert">'+E(S.adminErr)+'</div>':'')
      +'<label>'+(Z?'姓名':'Full name')+'<input class="k7a-in" value="'+E(S._arName||'')+'" oninput="S._arName=this.value"></label>'
      +'<label>'+(Z?'公司 Email':'Company email')+'<input class="k7a-in" value="'+E(S._arEmail||'')+'" oninput="S._arEmail=this.value"></label>'
      +'<label>'+(Z?'職務':'Role')+'<select class="k7a-in" onchange="S._arRole=this.value">'+['ground','cabin','pilot','service','pricing','backend','ceo'].map(function(k){return '<option value="'+k+'"'+(role===k?' selected':'')+'>'+E(Z?RZ[k][0]:RZ[k][1])+'</option>'}).join('')+'</select></label>'
      +'<label>'+(Z?'職務授權碼':'Role authorisation code')+'<input class="k7a-in" type="password" value="'+E(S._arP2||'')+'" oninput="S._arP2=this.value"></label>'
      +'<label>'+(Z?'設定密碼':'Choose a password')+'<input class="k7a-in" type="password" value="'+E(S._arPw||'')+'" oninput="S._arPw=this.value"></label>'
      +'<button class="k7a-go" onclick="kgmStaffActivateR1007A()">'+(Z?'啟用並登入':'Activate and sign in')+'</button>'
      +'<p class="k7a-alt"><a href="javascript:void 0" onclick="S._admMode=\'login\';S.adminErr=\'\';render()">← '+(Z?'返回登入':'Back to sign-in')+'</a></p>';
  }
  return '<div class="k7a-login">'+left+'<section class="k7a-form"><div class="k7a-card">'+form+'</div>'
    +'<div class="k7a-foot">© '+new Date().getFullYear()+' KGM Airways · '+(Z?'內部系統':'Internal system')+' · '+(Z?'版本':'Build')+' '+E(window.KGM_BUILD_LABEL||'')+'</div></section></div>';
}
/* 頂列 */
function bar(){
  try{
    var have=document.getElementById('k7a-bar');
    if(mode()!=='console'){if(have)have.remove();return}
    var u=S.adminUser||{},r=String(u.role||'');if(u.empId==='MASTER'||r==='admin')r='ceo';var Z=zh();
    var sig=[u.empId,u.name,r,Z?1:0].join('|');
    if(have&&have.getAttribute('data-sig')===sig)return;
    var d=have||document.createElement('div');d.id='k7a-bar';d.setAttribute('data-sig',sig);
    d.innerHTML='<div class="k7a-bl"><b>KGM</b><span>AIRWAYS</span><i></i><em>Operations Portal</em></div>'
      +'<div class="k7a-br"><span class="k7a-who"><b>'+E(u.name||u.empId||'')+'</b><small>'+E(u.empId||'')+' · '+E(RZ[r]?(Z?RZ[r][0]:RZ[r][1]):r)+'</small></span>'
      +'<span class="k7a-ver">'+(Z?'版本':'Build')+' '+E(window.KGM_BUILD_LABEL||'')+'</span>'
      +'<button onclick="(window.doAdminLogout||function(){S.adminAuthed=false;S.adminUser=null;render()})()">'+(Z?'登出':'Sign out')+'</button></div>';
    if(!have)document.body.insertBefore(d,document.body.firstChild);
  }catch(_){}
}
try{
  var av=window.adminView||(typeof adminView==='function'?adminView:null);
  if(av&&!av.__r1007a){
    var fn=function(){if(!S.adminAuthed){try{return loginHtml()}catch(e){try{console.warn('staff login',e)}catch(_){}}}return av.apply(this,arguments)};
    fn.__r1007a=1;window.adminView=fn;try{adminView=fn}catch(_){}
  }
}catch(_){}
try{
  if(typeof render==='function'&&!render.__r1007aStaff){
    var rd=render;var R=function(){tagMode();var x=rd.apply(this,arguments);tagMode();return x};R.__r1007aStaff=1;render=window.render=R;
  }
}catch(_){}
setInterval(tagMode,600);tagMode();
(function(){try{if(document.getElementById('k7a-css'))return;var s=document.createElement('style');s.id='k7a-css';s.textContent=''
  +'html[data-kgm-staff] #app>header,html[data-kgm-staff] #app>footer,html[data-kgm-staff] #kgmBadgeR40,html[data-kgm-staff] #kgmBadgeR45,html[data-kgm-staff] #kgmStampR45,html[data-kgm-staff] #kgmBadgeR48,'
  +'html[data-kgm-staff] #kgmLayerStamp,html[data-kgm-staff] #kgmStampK,html[data-kgm-staff] #kgmStampB,html[data-kgm-staff] #kgmStampC,html[data-kgm-staff] #kgmStampR33,html[data-kgm-staff] #kgmBuildBadge{display:none!important}'
  +'html[data-kgm-staff="login"] #aiChat{display:none!important}html[data-kgm-staff="login"] body{background:#f3f1ea}'
  +'.k7a-login{min-height:100vh;display:grid;grid-template-columns:minmax(320px,44%) 1fr;background:#f3f1ea}'
  +'.k7a-brand{background:linear-gradient(160deg,#0a2f26 0%,#0f3f33 55%,#174f41 100%);color:#e9efe9;padding:48px 52px;display:flex;flex-direction:column;gap:34px}'
  +'.k7a-logo{font:900 24px/1 Georgia,"Times New Roman",serif;letter-spacing:.02em}.k7a-logo b{color:#fff}.k7a-logo span{color:#c9a95a;margin-left:6px}'
  +'.k7a-sys small{display:block;font-size:11px;letter-spacing:.22em;color:#c9a95a;font-weight:800}.k7a-sys h1{margin:8px 0 6px;font:700 34px/1.15 Georgia,serif;color:#fff}.k7a-sys p{margin:0;color:rgba(233,239,233,.75);font-size:14px}'
  +'.k7a-notice{margin-top:auto;border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:16px 18px;background:rgba(255,255,255,.04)}.k7a-notice b{font-size:13px;color:#fff}.k7a-notice p{margin:6px 0 0;font-size:12px;line-height:1.75;color:rgba(233,239,233,.72)}'
  +'.k7a-help{font-size:12px;color:rgba(233,239,233,.6)}'
  +'.k7a-form{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px}'
  +'.k7a-card{width:min(420px,100%);background:#fff;border:1px solid #e3dfd4;border-radius:16px;padding:32px 32px 26px;box-shadow:0 20px 50px rgba(15,40,32,.08)}'
  +'.k7a-card h2{margin:0;font:800 22px/1.3 -apple-system,"Noto Sans TC",sans-serif;color:#13392f}.k7a-lead{margin:6px 0 18px;font-size:13px;color:#6f7a73}'
  +'.k7a-card label{display:block;font-size:12.5px;font-weight:700;color:#3b4842;margin:0 0 14px}.k7a-card label small{display:block;font-weight:500;color:#8b948f;font-size:11.5px;margin-top:5px}'
  +'.k7a-in{display:block;width:100%;box-sizing:border-box;height:44px;margin-top:6px;border:1px solid #d6d9d2;border-radius:10px;padding:0 13px;font-size:14px;background:#fbfbf9;color:#1f2a25;outline:none}'
  +'.k7a-in:focus{border-color:#17493a;background:#fff;box-shadow:0 0 0 3px rgba(23,73,58,.12)}'
  +'.k7a-pw{display:flex;gap:0;position:relative}.k7a-pw .k7a-in{padding-right:64px}.k7a-pw button{position:absolute;right:6px;top:12px;border:0;background:none;color:#17493a;font-size:12px;font-weight:800;cursor:pointer;padding:6px 8px}'
  +'.k7a-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:-2px 0 14px}.k7a-row a,.k7a-alt a{color:#17493a;font-size:12.5px;font-weight:700;text-decoration:none}'
  +'.k7a-chk{display:flex!important;align-items:center;gap:7px;margin:0!important;font-weight:500!important;color:#5c6a63!important}.k7a-chk input{margin:0}'
  +'.k7a-go{display:block;width:100%;height:46px;border:0;border-radius:10px;background:#17493a;color:#fff;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:.04em}.k7a-go:hover{background:#0f3a2e}'
  +'.k7a-err{background:#fbeceb;border:1px solid #f1c9c4;color:#a3342b;border-radius:10px;padding:10px 12px;font-size:12.5px;margin:0 0 14px}'
  +'.k7a-info{background:#f2f6f4;border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.7;color:#3b4842;margin:0 0 14px}'
  +'.k7a-alt{margin:16px 0 0;text-align:center;font-size:12.5px;color:#6f7a73}.k7a-foot{margin-top:18px;font-size:11.5px;color:#8b948f}'
  +'#k7a-bar{position:sticky;top:0;z-index:9000;display:flex;justify-content:space-between;align-items:center;height:52px;padding:0 24px;background:#0f3a2e;color:#e9efe9;box-shadow:0 1px 0 rgba(0,0,0,.2)}'
  +'html:not([data-kgm-staff="console"]) #k7a-bar{display:none}'
  +'html[data-kgm-staff="console"] .j-admin-who{display:none}'   /* 頂列已經顯示登入者與職務，頁首那一行重複就拿掉 */
  +'.k7a-bl{display:flex;align-items:center;gap:6px;font:900 16px Georgia,serif}.k7a-bl b{color:#fff}.k7a-bl span{color:#c9a95a}.k7a-bl i{width:1px;height:20px;background:rgba(255,255,255,.25);margin:0 10px}.k7a-bl em{font:600 13px -apple-system,"Noto Sans TC",sans-serif;font-style:normal;color:rgba(233,239,233,.85);letter-spacing:.04em}'
  +'.k7a-br{display:flex;align-items:center;gap:16px}.k7a-who{display:flex;flex-direction:column;align-items:flex-end;line-height:1.2}.k7a-who b{font-size:13px;color:#fff}.k7a-who small{font-size:11px;color:rgba(233,239,233,.7)}'
  +'.k7a-ver{font-size:11px;color:rgba(233,239,233,.55);border:1px solid rgba(255,255,255,.18);border-radius:99px;padding:3px 9px}'
  +'.k7a-br button{border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;border-radius:8px;padding:6px 14px;font-size:12.5px;font-weight:700;cursor:pointer}.k7a-br button:hover{background:rgba(255,255,255,.1)}'
  +'@media(max-width:860px){.k7a-login{grid-template-columns:1fr}.k7a-brand{padding:28px 24px;gap:18px}.k7a-notice{margin-top:0}.k7a-ver{display:none}}';
  (document.head||document.documentElement).appendChild(s)}catch(_){}})();
})();
