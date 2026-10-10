    /* 1010A #11：員工帳號 ↔ 會員帳號綁定
       使用者：「員工票只能由綁定的會員帳號使用，只有員工編號不行；後台要有地方綁定（前台同步）」。
       · 綁定表 S.staffLinkR1010A（kgm10_stflink，前後台同步）：{員工編號: {userId, at, by}}，一個員工只能綁一個會員帳號、一個會員帳號只能綁一個員工。
       · 前台員工票身分驗證（kgmStaffGateVerifyK5）多一關：必須已登入、而且登入的會員帳號就是這個員工編號綁定的那一個。
       · 後台：員工管理最上面「員工 ↔ 會員帳號綁定」卡片（綁定／解除綁定，動作歷史留紀錄）。 */
    function lk10(){return (S.staffLinkR1010A=(S.staffLinkR1010A&&typeof S.staffLinkR1010A==='object'&&!Array.isArray(S.staffLinkR1010A))?S.staffLinkR1010A:{})}
    function lkE(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function lkUser10(q){q=String(q||'').trim();if(!q)return null;var Q=q.toUpperCase();return (S.users||[]).filter(function(u){return u&&(String(u.id||'').toUpperCase()===Q||String(u.email||'').toLowerCase()===q.toLowerCase())})[0]||null}
    function lkStaff10(id){id=String(id||'').trim().toUpperCase();return (S.staff||[]).filter(function(x){return x&&String(x.empId||'').toUpperCase()===id})[0]||null}
    window.kgmStaffLinkOfR1010A=function(empId){var r=lk10()[String(empId||'').toUpperCase()];return r&&r.userId?r:null};
    window.kgmStaffLinkCheckR1010A=function(empId){
      var zh=LANG!=='en',r=window.kgmStaffLinkOfR1010A(empId);
      if(!S.user||!S.user.id)return {ok:false,why:zh?'員工票只能由「已綁定員工編號的會員帳號」使用。請先登入您的會員帳號。':'Staff travel is only available from the member account linked to your employee ID. Please log in first.'};
      if(!r)return {ok:false,why:zh?'這個員工編號還沒有綁定會員帳號，只輸入員工編號不能使用員工票。請洽人資在後台「員工管理 › 員工 ↔ 會員帳號綁定」完成綁定。':'This employee ID is not linked to a member account yet. Ask HR to link it in the back office.'};
      if(r.userId!==S.user.id)return {ok:false,why:zh?'這個員工編號綁定的是另一個會員帳號，目前登入的帳號不能使用這個員工編號的員工票。':'This employee ID is linked to a different member account.'};
      return {ok:true};
    };
    /* 前台：身分驗證頁顯示綁定狀態 */
    window.kgmStaffLinkRowR1010A=function(st){
      var zh=LANG!=='en',c=window.kgmStaffLinkCheckR1010A(st&&st.empId),r=window.kgmStaffLinkOfR1010A(st&&st.empId);
      return '<dt>'+(zh?'綁定會員帳號':'Linked member')+'</dt><dd>'+(c.ok?('<span style="color:#1f6f4a;font-weight:800">✓ '+lkE(r.userId)+'</span>'):('<span style="color:#B3261E;font-weight:800">'+(r?(zh?'不是目前登入的帳號':'Not this account'):(zh?'尚未綁定':'Not linked'))+'</span>'))+'</dd>';
    };
    (function(){try{var p=window.kgmStaffGateVerifyK5;if(typeof p!=='function'||p.__r1010A)return;
      var w=function(){try{var id=String((document.getElementById('k55EmpId')||{}).value||'').trim().toUpperCase();var c=window.kgmStaffLinkCheckR1010A(id);if(!c.ok){alert(c.why);return}}catch(_){}return p.apply(this,arguments)};
      w.__r1010A=1;window.kgmStaffGateVerifyK5=w}catch(_){}})();
    /* 後台：綁定卡片 */
    window.kgmStaffLinkSetR1010A=function(){
      var zh=LANG!=='en',st=lkStaff10(S.lnkEmpR1010A),u=lkUser10(S.lnkUserR1010A);
      if(!st){alert(zh?'查無這個員工編號。':'Employee ID not found.');return}
      if(!u){alert(zh?'查無這個會員（請輸入會員卡號或 Email）。':'Member not found (card number or email).');return}
      var L=lk10(),other=Object.keys(L).filter(function(k){return L[k]&&L[k].userId===u.id&&k!==String(st.empId).toUpperCase()})[0];
      if(other){alert((zh?'這個會員帳號已經綁定員工 ':'This member is already linked to ')+other+(zh?'，一個會員帳號只能綁一位員工。':'.'));return}
      var old=L[String(st.empId).toUpperCase()];
      if(old&&old.userId&&old.userId!==u.id&&!confirm((zh?'員工 ':'Employee ')+st.empId+(zh?' 目前綁定 ':' is linked to ')+old.userId+(zh?'，要改綁到 ':'; relink to ')+u.id+'？'))return;
      L[String(st.empId).toUpperCase()]={userId:u.id,at:new Date().toISOString(),by:(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||''};
      try{logAct&&logAct('員工帳號綁定',st.empId+' '+(st.name||'')+' ↔ 會員 '+u.id)}catch(_){}
      S.lnkEmpR1010A='';S.lnkUserR1010A='';try{save()}catch(_){}render();
    };
    window.kgmStaffLinkDelR1010A=function(emp){
      var zh=LANG!=='en',L=lk10(),r=L[emp];if(!r)return;
      if(!confirm((zh?'解除員工 ':'Unlink ')+emp+(zh?' 與會員 ':' from ')+r.userId+(zh?' 的綁定？解除後這個會員帳號不能再用員工票。':'?')))return;
      delete L[emp];try{logAct&&logAct('員工帳號解除綁定',emp+' ↔ 會員 '+r.userId)}catch(_){}try{save()}catch(_){}render();
    };
    window.kgmStaffLinkCardR1010A=function(){
      var zh=LANG!=='en',L=lk10(),ks=Object.keys(L).filter(function(k){return L[k]&&L[k].userId}).sort();
      var rows=ks.map(function(k){var st=lkStaff10(k)||{},u=lkUser10(L[k].userId)||{};return '<tr><td><b>'+lkE(k)+'</b></td><td>'+lkE(st.name||'—')+'</td><td>'+lkE(L[k].userId)+'</td><td>'+lkE(u.name||[u.lastName,u.firstName].filter(Boolean).join(' ')||'—')+'</td><td>'+lkE(String(L[k].at||'').slice(0,10))+'</td><td><button class="btn btn-sm" onclick="kgmStaffLinkDelR1010A(\''+lkE(k)+'\')">'+(zh?'解除':'Unlink')+'</button></td></tr>'}).join('');
      var empOk=lkStaff10(S.lnkEmpR1010A),usrOk=lkUser10(S.lnkUserR1010A);
      return '<div class="card lk10" style="margin-bottom:16px"><style>.lk10 h3{margin:0 0 4px;font:900 16px Georgia,serif;color:#1F4E46}.lk10>p{margin:0 0 12px;font-size:12px;color:#7b8580;line-height:1.7}.lk10-f{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}.lk10-f small{display:block;font-size:11px;margin-top:4px;min-height:15px}.lk10-ok{color:#1f6f4a}.lk10-no{color:#B3261E}.lk10 table{margin-top:12px}</style>'
        +'<h3>'+(zh?'員工 ↔ 會員帳號綁定':'Employee ↔ member account link')+'</h3>'
        +'<p>'+(zh?'員工票只能由綁定的會員帳號使用；只知道員工編號而沒有登入綁定帳號，前台會擋下來。一位員工只能綁一個會員帳號。':'Staff travel can only be booked from the linked member account.')+'</p>'
        +'<div class="lk10-f"><label><span class="mc-label">'+(zh?'員工編號':'Employee ID')+'</span><input class="inp" placeholder="K10135" value="'+lkE(S.lnkEmpR1010A||'')+'" oninput="S.lnkEmpR1010A=this.value.toUpperCase().trim();var s=this.parentNode.querySelector(\'small\');var o=(S.staff||[]).filter(function(x){return x&&String(x.empId).toUpperCase()===S.lnkEmpR1010A})[0];s.className=o?\'lk10-ok\':\'lk10-no\';s.textContent=S.lnkEmpR1010A?(o?(\'✓ \'+(o.name||\'\')):\''+(zh?'查無此員工':'Not found')+'\'):\'\'"><small class="'+(empOk?'lk10-ok':'lk10-no')+'">'+(S.lnkEmpR1010A?(empOk?'✓ '+lkE(empOk.name||''):(zh?'查無此員工':'Not found')):'')+'</small></label>'
        +'<label><span class="mc-label">'+(zh?'會員卡號或 Email':'Member no. or email')+'</span><input class="inp" placeholder="KGM123456" value="'+lkE(S.lnkUserR1010A||'')+'" oninput="S.lnkUserR1010A=this.value.trim()"><small class="'+(usrOk?'lk10-ok':'lk10-no')+'">'+(S.lnkUserR1010A?(usrOk?'✓ '+lkE(usrOk.name||usrOk.id):(zh?'查無此會員':'Not found')):'')+'</small></label>'
        +'<div><button class="btn btn-g" onclick="kgmStaffLinkSetR1010A()">'+(zh?'綁定':'Link')+'</button><small>&nbsp;</small></div></div>'
        +'<table class="adm-tbl"><thead><tr><th>'+(zh?'員工編號':'Emp ID')+'</th><th>'+(zh?'員工':'Employee')+'</th><th>'+(zh?'會員卡號':'Member')+'</th><th>'+(zh?'會員姓名':'Member name')+'</th><th>'+(zh?'綁定日':'Since')+'</th><th></th></tr></thead><tbody>'
        +(rows||'<tr><td colspan="6" style="text-align:center;color:#9a948a;padding:16px">'+(zh?'目前沒有任何綁定。':'No links yet.')+'</td></tr>')+'</tbody></table></div>';
    };
    (function(){
      var r0=window.render;if(typeof r0!=='function'||r0.__lk10)return;
      var w=function(){var r=r0.apply(this,arguments);try{
        if(S.view==='admin'&&S.adminAuthed&&S.adminTab==='staff'){var m=document.querySelector('#app .p-admin-main');if(m&&!m.querySelector('.lk10')){m.insertAdjacentHTML('afterbegin',window.kgmStaffLinkCardR1010A())}}
      }catch(_){}return r};
      w.__lk10=1;Object.keys(r0).forEach(function(k){try{w[k]=r0[k]}catch(_){}});window.render=w;try{render=w}catch(_){}
    })();
