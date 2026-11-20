/* ══ 1121A R5（使用者：「員工系統最上排要有地方可以連動自己的kgm account，記得只有連動的account才可以訂購員工票（這樣就不用再使用之前輸入優惠碼在coupon那裡），
   綁定就會自動對到，但綁定也要書入基本資料確認是對的人」）══
   沿用 1010A 的綁定表 S.staffLinkR1010A（kgm10_stflink，{員工編號:{userId,at,by}}；一個員工一個帳號、一個帳號一個員工），不另做一份：
   ① 後台（員工系統）右上角「連動我的 KGM 帳號」：員工自己輸入 會員卡號或 Email＋英文姓＋英文名＋出生日期，
      四項都要跟會員資料相同、而且會員英文姓名要跟員工資料的姓名相同，才綁定；已綁定顯示帳號、可解除。
   ② 前台：登入的是綁定帳號 → 訂位區「預訂機票／酬賓機票」旁多一個「員工票」，按了直接進員工票（自動帶員工編號、身分已由綁定確認，不用輸入員工密碼）；
      沒綁定的人在優惠碼欄輸入員工編號 → 不再進員工票，提示先到員工系統綁定。 */
(function(){
  if(window.__st121)return;window.__st121=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function L(){return (S.staffLinkR1010A=(S.staffLinkR1010A&&typeof S.staffLinkR1010A==='object'&&!Array.isArray(S.staffLinkR1010A))?S.staffLinkR1010A:{})}
  function staff(id){id=String(id||'').toUpperCase();return (S.staff||[]).filter(function(x){return x&&String(x.empId||'').toUpperCase()===id})[0]||null}
  function userBy(q){q=String(q||'').trim().toLowerCase();if(!q)return null;return (S.users||[]).filter(function(u){return u&&(String(u.id||'').toLowerCase()===q||String(u.email||'').toLowerCase()===q)})[0]||null}
  function linkOfUser(uid){var l=L();return Object.keys(l).filter(function(k){return l[k]&&String(l[k].userId)===String(uid)})[0]||''}
  function toks(s){return String(s||'').toUpperCase().replace(/[^A-Z\s]/g,' ').split(/\s+/).filter(Boolean).sort().join(' ')}
  function sv(){try{save()}catch(_){}}
  /* ── ① 後台：右上角 ── */
  window.kgmStaffLinkOpenR1121A=function(){var me=S.adminUser||{},st=staff(me.empId);if(!st){alert(z()?'這個登入身分沒有員工資料，無法綁定。':'No staff record.');return}
    var cur=L()[st.empId],u=cur&&userBy(cur.userId),zh=z();
    var ov=document.createElement('div');ov.id='st121m';
    ov.innerHTML='<div class="st121-box"><button type="button" class="st121-x" onclick="this.closest(\'#st121m\').remove()">×</button><small>KGM ACCOUNT LINK</small><h3>'+(zh?'連動我的 KGM 會員帳號':'Link my KGM account')+'</h3>'
      +(u?'<p>'+(zh?'已連動：':'Linked: ')+'<b>'+E(u.id)+'</b>（'+E(u.lastName+' '+u.firstName)+'）。'+(zh?'用這個帳號登入前台，就可以直接訂員工票。':'Sign in with this account to book staff tickets.')+'</p><div class="st121-act"><button type="button" class="st121-sec" onclick="kgmStaffUnlinkR1121A()">'+(zh?'解除連動':'Unlink')+'</button></div>'
        :'<p>'+(zh?'只有連動的會員帳號可以訂員工票（不再用優惠碼）。請輸入會員資料確認是本人：':'Only the linked account can book staff tickets. Confirm it is you:')+'</p>'
         +'<label>'+(zh?'會員卡號或 Email':'Member no. or email')+'<input id="st121q" class="inp" placeholder="KGM100000"></label>'
         +'<div class="st121-2"><label>'+(zh?'英文姓（護照）':'Last name')+'<input id="st121l" class="inp" style="text-transform:uppercase"></label><label>'+(zh?'英文名（護照）':'First name')+'<input id="st121f" class="inp" style="text-transform:uppercase"></label></div>'
         +'<label>'+(zh?'出生日期':'Date of birth')+'<input id="st121d" type="date" class="inp"></label>'
         +'<p class="st121-n">'+(zh?'四項都要跟會員資料一致，而且會員英文姓名要跟員工資料（'+E(st.name)+'）相同。':'All four must match, and the name must match your staff record.')+'</p>'
         +'<div class="st121-act"><button type="button" class="st121-go" onclick="kgmStaffLinkSelfR1121A()">'+(zh?'確認並連動':'Confirm & link')+'</button></div>')
      +'</div>';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove()});document.body.appendChild(ov)};
  window.kgmStaffLinkSelfR1121A=function(){var zh=z(),me=S.adminUser||{},st=staff(me.empId);if(!st)return;
    function v(id){return String((document.getElementById(id)||{}).value||'').trim()}
    var u=userBy(v('st121q')),ln=v('st121l').toUpperCase(),fn=v('st121f').toUpperCase(),d=v('st121d');
    var bad=function(m){alert(m)};
    if(!u)return bad(zh?'查無這個會員卡號／Email。':'Member not found.');
    if(!ln||!fn||!d)return bad(zh?'請填寫英文姓、英文名與出生日期。':'Fill in all fields.');
    if(toks(u.lastName)!==toks(ln)||toks(u.firstName)!==toks(fn)||String(u.dob||u.birthDate||'').slice(0,10)!==d)return bad(zh?'資料與會員帳號不一致，無法確認是本人。':'Details do not match the member account.');
    if(toks(u.lastName+' '+u.firstName)!==toks(st.name))return bad(zh?'會員英文姓名與員工資料（'+st.name+'）不同。如果改過名字請洽人資更新員工資料。':'Name differs from your staff record.');
    var other=linkOfUser(u.id);if(other&&other!==st.empId)return bad(zh?'這個會員帳號已經連動另一位員工（'+other+'）。':'This account is linked to another employee.');
    L()[st.empId]={userId:u.id,at:new Date().toISOString(),by:st.empId,selfR1121A:true};sv();
    try{if(typeof logAct==='function')logAct(zh?'員工連動會員帳號':'Staff account link',st.empId+' → '+u.id)}catch(_){}
    var m=document.getElementById('st121m');if(m)m.remove();alert(zh?'已連動 '+u.id+'。用這個帳號登入前台，訂位區會出現「員工票」。':'Linked.');try{render()}catch(_){}};
  window.kgmStaffUnlinkR1121A=function(){var me=S.adminUser||{};if(!confirm(z()?'確定解除連動？解除後這個會員帳號不能再訂員工票。':'Unlink?'))return;delete L()[String(me.empId||'').toUpperCase()];sv();var m=document.getElementById('st121m');if(m)m.remove();try{render()}catch(_){}};
  function paintAdmin(){try{if(!(S.view==='admin'&&S.adminAuthed))return;var br=document.querySelector('.k7a-br');if(!br)return;var me=S.adminUser||{},st=staff(me.empId);
      var b=br.querySelector('.st121-hb');if(!st){if(b)b.remove();return}
      var cur=L()[st.empId],lab=cur?((z()?'已連動 ':'Linked ')+cur.userId):(z()?'連動我的 KGM 帳號':'Link my KGM account');
      if(!b){b=document.createElement('button');b.type='button';b.className='st121-hb';b.onclick=function(){window.kgmStaffLinkOpenR1121A()};var ver=br.querySelector('.k7a-ver');br.insertBefore(b,ver||br.lastChild)}
      if(b.textContent!==lab)b.textContent=lab;b.classList.toggle('on',!!cur)}catch(_){}}
  /* ── ② 前台 ── */
  function myEmp(){try{return S.user&&S.user.id?linkOfUser(S.user.id):''}catch(_){return ''}}
  window.kgmStaffGoR1121A=function(){var e=myEmp();if(!e)return;S.search=S.search||{};S.search.useMiles=false;S.search.grp25=0;S.openFare=null;S.promoCode=e;S.__stxLinkR1121A=e;S.stx=null;S.view='booking';S.phase='';sv();try{render()}catch(_){}   /* 員工票身分頁只在訂位頁（staffGatePage5：S.view==='booking'）；首頁的 post55 會把員工編號清掉，所以直接進訂位頁 */try{scrollTo(0,0)}catch(_){}};
  var WARNED={};
  function paintFront(){try{if(S.view==='admin')return;var e=myEmp();
      /* 優惠碼欄輸入員工編號：只有綁定帳號、而且是自己的編號才算 */
      var pc=String(S.promoCode||'').trim().toUpperCase();
      if(pc&&staff(pc)){if(e&&e===pc){S.__stxLinkR1121A=pc}else{S.promoCode='';S.stx=null;S.staffVerifiedR10=false;if(!WARNED[pc]){WARNED[pc]=1;setTimeout(function(){alert(z()?'員工票不再用優惠碼。請先在員工系統右上角「連動我的 KGM 帳號」，之後用連動的帳號登入，訂位區就會出現「員工票」。':'Staff tickets no longer use promo codes. Link your KGM account in the staff portal first.')},30)}setTimeout(function(){try{render()}catch(_){}},60);return}}
      /* 訂位區按鈕 */
      var mb=[].filter.call(document.querySelectorAll('#app button'),function(x){return /^(酬賓機票|Award)/.test(x.textContent.trim())&&/useMiles=true/.test(x.getAttribute('onclick')||'')})[0];
      var row=mb&&mb.parentElement,eb=row&&row.querySelector('.st121-fb');
      if(row&&e){if(!eb){eb=document.createElement('button');eb.type='button';eb.className='st121-fb';eb.onclick=window.kgmStaffGoR1121A;row.appendChild(eb)}var t=(z()?'員工票':'Staff ticket')+' · '+e;if(eb.textContent!==t)eb.textContent=t;eb.classList.toggle('on',String(S.promoCode||'').toUpperCase()===e)}else if(eb)eb.remove();
      /* 員工票身分驗證：綁定帳號 → 自動帶員工編號與密碼欄，欄位藏起來 */
      var id=document.getElementById('k55EmpId'),pw=document.getElementById('k55EmpPw');
      if(id&&e&&S.__stxLinkR1121A===e&&String(S.promoCode||'').toUpperCase()===e){var st=staff(e);if(st){if(id.value!==st.empId)id.value=st.empId;if(pw&&pw.value!==String(st.password||''))pw.value=String(st.password||'');
          [id,pw].forEach(function(x){if(!x)return;var lb=x.closest('label')||x.parentElement;if(lb&&!lb.classList.contains('st121-hid'))lb.classList.add('st121-hid')});
          [].forEach.call(document.querySelectorAll('#app .k55-staffgate p'),function(q){if(/優惠代碼被辨識/.test(q.textContent)&&!q.__st121){q.__st121=1;q.textContent=z()?'您已用連動員工編號 '+e+' 的 KGM 會員帳號登入，員工身分已確認。請選票種與搭乘身分，完成後即可搜尋員工票；員工票不得使用哩程折抵。':'Signed in with the account linked to '+e+'. Choose the ticket type and travellers.'}});
          var host=(id.closest('label')||id.parentElement).parentElement;if(host&&!host.querySelector('.st121-ok')){var d=document.createElement('div');d.className='st121-ok';d.textContent=(z()?'✓ 已由連動帳號確認員工身分（'+e+'），不需要輸入員工密碼':'✓ Verified via linked account ('+e+')');host.insertBefore(d,host.firstChild)}}}
    }catch(_){}}
  /* ── ③ 1121A R7（使用者：「圖四我希望員工票頁面可以強化統一好看」）：後台「員工票」頁（adminTab stafftix）——
     內容與功能都不動，只整理外觀：最上面一張總覽（共幾筆、待核對、已核對候補中、已定案、退件、停權中，從 S.staffTix／S.staffTixBansR913 算），
     各區標題改成同一種樣式（小字分類＋標題）、說明框改成中性提示、卡片／輸入框／按鈕／表格統一；「眷屬／同性朋友登記核對」移到員工票清單下面。 */
  function stats(){var L=S.staffTix||[];if(!Array.isArray(L))L=Object.values(L);var c={all:0,todo:0,ok:0,done:0,bad:0};
    L.forEach(function(x){if(!x)return;var st=String(x.status||'');if(/cancel/.test(st))return;c.all++;if(/fail|reject|denied|refund/.test(st))c.bad++;else if(/clear|confirm|board|flown|done|issued/.test(st))c.done++;else if(x.verified)c.ok++;else c.todo++});
    var B=S.staffTixBansR913||{},bl=Array.isArray(B)?B:Object.values(B),td=(typeof todayISO==='function'?todayISO():'');c.ban=bl.filter(function(b){return b&&(!b.until||String(b.until)>=td)&&!b.lifted}).length;
    var fr=document.querySelector('#app .k55-famrev h2 span');c.fam=fr?(+fr.textContent||0):0;return c}
  function paintStx(){try{var m=document.querySelector('#app .p-admin-main');var on=S.view==='admin'&&S.adminAuthed&&S.adminTab==='stafftix'&&!!m;
      document.documentElement.classList.toggle('st121-stx',!!on);if(!on)return;var c=stats(),zh=z();
      var hd=m.querySelector(':scope>.st121-h');if(!hd){hd=document.createElement('section');hd.className='st121-h';m.insertBefore(hd,m.firstChild)}
      var html='<div class="st121-ht"><small>STAFF TRAVEL · STANDBY</small><h2>'+(zh?'員工票':'Staff travel')+'</h2><p>'+(zh?'員工用連動的 KGM 會員帳號在前台訂位（不累積哩程、候補）；這一頁核對資料、看系統候補結果、管理停權。':'Staff book from their linked member account; verify, watch standby results and manage suspensions here.')+'</p></div>'
        +'<div class="st121-k">'+[['all',zh?'員工票訂位':'Bookings'],['todo',zh?'待核對':'To verify'],['ok',zh?'已核對・候補中':'Verified · standby'],['done',zh?'已定案':'Cleared'],['bad',zh?'退件':'Rejected'],['fam',zh?'眷屬待核對':'Dependants'],['ban',zh?'停權中':'Suspended']].map(function(k){return '<div class="'+(k[0]==='todo'&&c.todo?'warn':'')+'"><small>'+k[1]+'</small><b>'+(c[k[0]]||0)+'</b></div>'}).join('')+'</div>';
      if(hd.innerHTML!==html)hd.innerHTML=html;
      [].forEach.call(m.querySelectorAll(':scope>.adm-card'),function(cd){if(cd.__st121n||!/一律於乘客網站首頁/.test(cd.textContent))return;cd.__st121n=1;cd.classList.add('st121-note');
        cd.innerHTML='<div>'+(zh?'員工票一律由<b>員工自己連動的 KGM 會員帳號</b>在前台訂位（員工系統右上角「連動我的 KGM 帳號」；不再用優惠碼），不在這裡申請。這一頁供地勤／後台核對資料與查看系統候補結果；沒有 CEO 人工放行或婉拒。核對不符者自動退件退費，並保留失敗紀錄供後台查核。':'Staff book from their own linked member account; this page is for verification and standby results.')+'</div>'});
      var fam=m.querySelector(':scope>.k55-famrev');if(fam)fam.classList.add('st121-late');
      var grp='';[].forEach.call(m.children,function(x){if(x.classList.contains('adm-sec'))grp=/權限|辦法/.test(x.textContent)?'late':'main';if(x.classList.contains('adm-sec')||x.classList.contains('adm-card'))x.classList.toggle('st121-g3',grp==='late')});
      [].forEach.call(m.querySelectorAll(':scope>.adm-sec'),function(x){if(!x.querySelector('small')){var k=/PNR/.test(x.textContent)?'VERIFICATION':/權限/.test(x.textContent)?'SUSPENSION':/辦法/.test(x.textContent)?'POLICY':'BOOKINGS';var sm=document.createElement('small');sm.textContent=k;x.insertBefore(sm,x.firstChild)}});
    }catch(_){}}
  function paint(){paintAdmin();paintFront();paintStx()}
  function hook(){var r0=window.render;if(typeof r0!=='function'||r0.__st121)return;var w=function(){var r=r0.apply(this,arguments);try{paint()}catch(_){}return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__st121=1;window.render=w;try{render=w}catch(_){}}
  hook();[0,1500,4000,12000].forEach(function(t){setTimeout(hook,t)});setInterval(paint,1200);
  try{var cs=document.createElement('style');cs.textContent='.st121-hb{margin-right:10px;border:1px solid rgba(255,255,255,.35);background:transparent;color:#F3E3BE;border-radius:999px;padding:6px 12px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}.st121-hb.on{border-color:#C9A24F;color:#fff;background:rgba(201,162,79,.18)}'
    +'#st121m{position:fixed;inset:0;z-index:2147483000;background:rgba(18,28,22,.46);display:flex;align-items:center;justify-content:center;padding:16px}.st121-box{position:relative;background:#fff;border-radius:18px;max-width:480px;width:100%;padding:26px 28px;box-shadow:0 24px 60px rgba(0,0,0,.25);color:#1f2a24}'
    +'.st121-box small{font-size:10.5px;letter-spacing:.18em;color:#a08a5c;font-weight:800}.st121-box h3{margin:4px 0 10px;font-size:20px;color:#0b3b30}.st121-box p{font-size:13px;line-height:1.7;color:#4a564f;margin:0 0 12px}.st121-box label{display:block;font-size:12px;font-weight:700;color:#5d665f;margin:0 0 10px}.st121-box .inp{width:100%;box-sizing:border-box;margin-top:4px}'
    +'.st121-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.st121-n{font-size:11.5px!important;color:#8a8175!important}.st121-act{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}.st121-go{background:#0b3b30;color:#fff;border:0;border-radius:10px;padding:10px 18px;font-weight:800;cursor:pointer}.st121-sec{background:#fff;border:1px solid #dcd3be;border-radius:10px;padding:9px 16px;cursor:pointer}'
    +'.st121-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;border:1px solid #e3e0d8;background:#fff;font-size:18px;cursor:pointer}'
    +'.st121-fb{border:none;cursor:pointer;padding:10px 22px;font-size:14px;font-weight:600;color:#7a5608;background:transparent;border-radius:10px 10px 0 0}.st121-fb.on{font-weight:800;color:#0b3b30;background:#fff;box-shadow:0 0 0 1px var(--border) inset}'
    +'html.st121-stx #app .p-admin-main{display:flex;flex-direction:column}html.st121-stx #app .p-admin-main>*{order:1}html.st121-stx #app .p-admin-main>.st121-h{order:0}html.st121-stx #app .p-admin-main>.st121-late{order:2}html.st121-stx #app .p-admin-main>.st121-g3{order:3}'
    +'.st121-h{background:linear-gradient(135deg,#0B3D2E,#14544A);color:#fff;border-radius:18px;padding:22px 24px 18px;margin:0 0 18px}.st121-ht small{font-size:10.5px;letter-spacing:.2em;color:#E8D8A8;font-weight:800}.st121-ht h2{margin:4px 0 6px;font:700 26px Georgia,"Noto Serif TC",serif;color:#fff}.st121-ht p{margin:0 0 14px;font-size:13px;color:#CFE3DA;line-height:1.6}'
    +'.st121-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}.st121-k>div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:9px 12px}.st121-k small{display:block;font-size:11px;color:#CFE3DA;font-weight:700}.st121-k b{font:700 24px Georgia,serif;color:#fff}.st121-k>div.warn{background:rgba(232,216,168,.18);border-color:#E8D8A8}'
    +'html.st121-stx #app .p-admin-main>.adm-sec{display:flex;flex-direction:column;border:0!important;padding:0!important;margin:22px 0 10px!important;font:700 19px Georgia,"Noto Serif TC",serif!important;color:#0B3D2E!important;background:none!important;box-shadow:none!important}html.st121-stx #app .p-admin-main>.adm-sec::before{display:none!important}html.st121-stx #app .p-admin-main>.adm-sec>small{font:800 10.5px system-ui,sans-serif;letter-spacing:.2em;color:#A08A5C;margin-bottom:3px}'
    +'html.st121-stx #app .p-admin-main>.adm-card,html.st121-stx #app .p-admin-main>.k55-famrev{border:1px solid #E6E0D2!important;border-radius:16px!important;box-shadow:0 8px 22px -20px rgba(11,58,46,.6)!important;padding:18px 20px!important;margin:0 0 12px!important;background:#fff!important}'
    +'html.st121-stx #app .p-admin-main>.st121-note{background:#F6F9F7!important;border-color:#D8E5DD!important;font-size:13px;line-height:1.7;color:#3d4a43}html.st121-stx #app .p-admin-main>.st121-note b{color:#0B3D2E}html.st121-stx #app .p-admin-main .adm-card .inp{height:40px;border-radius:10px}html.st121-stx #app .p-admin-main .adm-card .btn{height:40px;border-radius:10px;padding:0 16px}'
    +'html.st121-stx #app .p-admin-main table th{background:#FAF8F3;color:#8A8175;font-size:11px;letter-spacing:.06em}html.st121-stx #app .p-admin-main table td{border-top:1px solid #F1EDE4}'
    +'.st121-hid{display:none!important}.st121-ok{background:#eef7f1;border:1px solid #cfe5d7;color:#1f6f4a;border-radius:10px;padding:9px 12px;font-size:13px;font-weight:700;margin:0 0 10px}';(document.head||document.documentElement).appendChild(cs)}catch(_){}
})();
