
/* ══ 1026C：後台「通知管理」版面重整（使用者：「通知管理頁很醜」）—— 原本六個發送表單（標題帶 emoji）一個接一個直排，下面再接 104 列的寄信清單，整頁 6,000 像素。
   改成：上面兩個分頁「發送通知」／「寄信清單」；發送通知＝左邊六種對象（員工公告、時段旅客、單一旅客、航班旅客、全體公告、會員等級）、右邊只顯示選到的那一張表單；
   寄信清單＝原本的 Worker 檢查與信件清單，加上搜尋。表單、按鈕、送出的程式都是原本那一份（只重新排版，不另做一套）。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var CH=[['staff',/員工公告/,'👥',['員工公告','Staff notice'],['分部門或全體員工','By department or all staff']],
    ['slot',/依時段通知旅客/,'🕘',['時段旅客','Departure window'],['某天某時段出發的旅客','Passengers departing in a time window']],
    ['pax',/發送訊息給旅客/,'✉',['單一旅客','One passenger'],['指定一位會員','Message one member']],
    ['flt',/私訊特定航班日期旅客/,'✈',['航班旅客','Flight passengers'],['某一班某一天的旅客','Everyone on one flight/date']],
    ['ann',/發布全體公告/,'📣',['全體公告','Announcement'],['首頁與通知中心','Home page and inbox']],
    ['lvl',/依會員等級發送/,'★',['會員等級','By tier'],['Bronze／Silver／Gold／Diamond','Bronze to Diamond']]];
  function apply(){try{
    if(!(S.view==='admin'&&S.adminTab==='notify'))return;
    var m=document.querySelector('#app main');if(!m)return;
    var forms=null,mail=m.querySelector('.k110-mail');
    [].some.call(m.children,function(c){if(c.tagName==='DIV'&&/員工公告/.test((c.firstElementChild&&c.firstElementChild.textContent)||'')){forms=c;return true}return false});
    if(!forms)return;
    var tab=S.ntTab27==='mail'?'mail':'send',sel=S.ntCh27||'staff';
    var cards={};[].forEach.call(forms.children,function(c){var h=(c.firstElementChild&&c.firstElementChild.textContent)||'';CH.forEach(function(x){if(x[1].test(h)){cards[x[0]]=c;c.setAttribute('data-nt27',x[0])}})});
    if(!cards[sel])sel='staff';
    var top=m.querySelector(':scope > .k27nt-top');
    if(!top){top=document.createElement('div');top.className='k27nt-top';m.insertBefore(top,m.firstChild)}
    var sig=tab+'|'+sel+'|'+(z()?'z':'e');
    if(top.getAttribute('data-sig')!==sig){top.setAttribute('data-sig',sig);
      top.innerHTML='<div class="k27nt-hd"><div><small>NOTIFICATIONS</small><h2>'+(z()?'通知管理':'Notifications')+'</h2><p>'+(z()?'對員工或旅客發送通知；寄信清單列出系統會自動寄出的每一種信件，可預覽、寄測試信。':'Send notices to staff or passengers; the mail map lists every automatic email.')+'</p></div>'
        +'<div class="k27nt-tabs"><button type="button" data-nt27t="send" class="'+(tab==='send'?'on':'')+'">'+(z()?'發送通知':'Send')+'</button><button type="button" data-nt27t="mail" class="'+(tab==='mail'?'on':'')+'">'+(z()?'寄信清單':'Mail map')+'</button></div></div>'}
    forms.classList.add('k27nt-forms');forms.classList.toggle('k27nt-hide',tab!=='send');if(mail)mail.classList.toggle('k27nt-hide',tab!=='mail');
    var nav=forms.querySelector(':scope > .k27nt-nav');
    if(!nav){nav=document.createElement('nav');nav.className='k27nt-nav';forms.insertBefore(nav,forms.firstChild)}
    var nsig=sel+'|'+(z()?'z':'e');
    if(nav.getAttribute('data-sig')!==nsig){nav.setAttribute('data-sig',nsig);
      nav.innerHTML=CH.filter(function(x){return cards[x[0]]}).map(function(x){return '<button type="button" data-nt27c="'+x[0]+'" class="'+(x[0]===sel?'on':'')+'"><s>'+x[2]+'</s><span><b>'+(z()?x[3][0]:x[3][1])+'</b><small>'+(z()?x[4][0]:x[4][1])+'</small></span></button>'}).join('')}
    Object.keys(cards).forEach(function(k){cards[k].classList.toggle('k27nt-on',k===sel);cards[k].classList.add('k27nt-card')});
    /* 1026C：員工公告改成多行；每張表單的輸入框加排版工具列；主管多一個對象「我的團隊」 */
    try{var sc=cards.staff;if(sc){var ip=sc.querySelector('input.inp:not([type])');if(ip){var ta=document.createElement('textarea');ta.className='inp';ta.rows=4;ta.placeholder=ip.placeholder;ta.value=ip.value;ta.setAttribute('oninput',ip.getAttribute('oninput')||'');ip.replaceWith(ta)}
        var sl=sc.querySelector('select');var me=(S.adminUser||{}).empId,mm=me&&window.kgmMgrOfR1012A&&window.kgmMgrOfR1012A(me);
        if(sl&&mm&&!sl.querySelector('option[value="team"]')){var o=document.createElement('option');o.value='team';o.textContent=(z()?'我的團隊（':'My team (')+(window.kgmTeamOfR1026C?window.kgmTeamOfR1026C(me).length:0)+(z()?' 人）':')');if(S._scDept==='team')o.selected=true;sl.insertBefore(o,sl.firstChild)}}
      Object.keys(cards).forEach(function(k){[].forEach.call(cards[k].querySelectorAll('textarea'),function(t){window.kgmRichBarR1026C&&window.kgmRichBarR1026C(t)})})}catch(_){}
    /* 寄信清單：搜尋 */
    if(mail&&!mail.querySelector('.k27nt-q')){var bar=mail.querySelector('.k110-bar');if(bar){var q=document.createElement('input');q.className='inp k27nt-q';q.placeholder=z()?'搜尋事件或信件內容（例：booking、改票、團體）':'Search events';q.value=S.ntQ27||'';
        q.addEventListener('input',function(){S.ntQ27=q.value;filt(mail)});bar.appendChild(q)}}
    if(mail)filt(mail);
  }catch(e){try{console.warn('nt27',e)}catch(_){}}}
  function filt(mail){var v=String(S.ntQ27||'').trim().toLowerCase();[].forEach.call(mail.querySelectorAll('.k110-grp'),function(g){var n=0;[].forEach.call(g.querySelectorAll('tbody tr'),function(r){var ok=!v||String(r.textContent||'').toLowerCase().indexOf(v)>=0;r.style.display=ok?'':'none';if(ok)n++});g.style.display=n?'':'none'})}
  document.addEventListener('click',function(ev){var t=ev.target.closest&&ev.target.closest('[data-nt27t],[data-nt27c]');if(!t)return;if(t.hasAttribute('data-nt27t'))S.ntTab27=t.getAttribute('data-nt27t');else S.ntCh27=t.getAttribute('data-nt27c');apply()});
  setInterval(apply,500);
  try{var Qn=false;new MutationObserver(function(){if(Qn||!(S.view==='admin'&&S.adminTab==='notify'))return;Qn=true;Promise.resolve().then(function(){Qn=false;apply()})}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
  try{var cs=document.createElement('style');cs.id='k27nt-css';cs.textContent=
    '.k27nt-hide,.k27nt-forms.k27nt-hide{display:none!important}'
   +'.k27nt-hd{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 16px}.k27nt-hd small{font:700 10.5px system-ui,sans-serif;letter-spacing:.14em;color:#9A7B2F}.k27nt-hd h2{margin:2px 0 4px;font-size:22px;color:#0F2A21}.k27nt-hd p{margin:0;font-size:12.5px;color:#66726C;max-width:620px}'
   +'.k27nt-tabs{display:flex;gap:4px;padding:4px;border-radius:999px;background:#F1F4F2}.k27nt-tabs button{border:0;background:transparent;border-radius:999px;padding:8px 18px;font:700 13px inherit;color:#55605B;cursor:pointer}.k27nt-tabs button.on{background:#0B3D2E;color:#fff}'
   +'.k27nt-forms{display:grid!important;max-width:none!important;grid-template-columns:260px minmax(0,1fr)!important;gap:16px!important;align-items:start}.k27nt-forms > .k27nt-card.k27nt-on{width:auto!important;max-width:none!important;justify-self:stretch}'
   +'.k27nt-nav{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid #E4E9E6;border-radius:16px;background:#F8FAF9;grid-row:1/span 6}'
   +'.k27nt-nav button{display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:0;background:transparent;border-radius:12px;padding:10px 12px;cursor:pointer;font-family:inherit;color:#14231D}.k27nt-nav button:hover{background:#EEF3F0}.k27nt-nav button.on{background:#fff;box-shadow:0 1px 3px rgba(16,40,30,.08),0 0 0 1px #DCE5E0}'
   +'.k27nt-nav s{text-decoration:none;flex:none;width:34px;height:34px;border-radius:10px;background:#E5F1EC;display:flex;align-items:center;justify-content:center;font-size:16px;color:#0B3D2E}.k27nt-nav button.on s{background:#0B3D2E;color:#E9C46A}'
   +'.k27nt-nav span{display:flex;flex-direction:column;min-width:0}.k27nt-nav b{font-size:13.5px}.k27nt-nav small{font-size:11.5px;color:#66726C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
   +'.k27nt-forms > .k27nt-card{display:none!important}.k27nt-forms > .k27nt-card.k27nt-on{display:flex!important;flex-direction:column;gap:12px;grid-column:2;margin:0!important;padding:22px 24px!important;border:1px solid #E4E9E6!important;border-radius:16px!important;background:#fff!important;box-shadow:0 1px 2px rgba(16,40,30,.04)!important}'
   +'.k27nt-card > :first-child{font:700 17px/1.4 system-ui,sans-serif!important;color:#0F2A21!important;margin:0!important}'
   +'.k27nt-card .inp,.k27nt-card select,.k27nt-card textarea{width:100%;box-sizing:border-box}.k27nt-card textarea{min-height:110px;flex:1 1 100%}.k27nt-card .k27rt-bar,.k27nt-card .k27rt-prev{flex:1 1 100%;width:100%;box-sizing:border-box}.k27nt-card > div{display:flex!important;gap:10px;flex-wrap:wrap;align-items:center}.k27nt-card > div > textarea,.k27nt-card > div > .k27rt-bar,.k27nt-card > div > .k27rt-prev{flex:1 1 100%!important;width:100%!important}.k27nt-card > div > .inp,.k27nt-card > div > select,.k27nt-card > div > input{flex:1;min-width:150px;width:auto}'
   +'.k27nt-card > button,.k27nt-card > div > button{align-self:flex-end;padding:10px 22px!important;border-radius:999px!important}'
   +'.k27nt-q{flex:1;min-width:240px;height:40px}'
   +'.k6cs-act{display:flex;gap:6px;flex-wrap:wrap}.k6cs-act button{white-space:nowrap}'   /* 1026C：客服接手按鈕不要被擠成直排 */
   +'@media(max-width:900px){.k6cs-hd{flex-wrap:wrap;gap:8px}.k6cs-act{width:100%}.k27nt-card > div > select{flex:1 1 100%!important;width:100%!important}.k27nt-forms{grid-template-columns:1fr!important}.k27nt-nav{grid-row:auto;flex-direction:row;overflow-x:auto}.k27nt-nav button{min-width:150px}.k27nt-nav small{display:none}.k27nt-forms > .k27nt-card.k27nt-on{grid-column:1}}';
    document.head.appendChild(cs)}catch(_){}
})();
