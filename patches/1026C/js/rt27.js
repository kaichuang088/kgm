
/* ══ 1026C：公告／通知可以排版（使用者：「這公告要可以打 Bullet point／bold／underline／italic／etc」）
   ① 通知管理每一張表單的輸入框上面加一排工具：粗體、斜體、底線、項目符號、編號、清除；下面即時預覽。
   ② 存的是純文字標記（**粗體**、*斜體*、__底線__、行首「- 」項目、「1. 」編號），舊資料、寄信、搜尋都照樣是文字；
      網站上顯示通知、公告、員工訊息的地方由 kgmRichR1026C 轉成格式（只轉這幾種標記，其他 HTML 一律跳脫，不會被插入程式）。 ══ */
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function inl(t){return t.replace(/\*\*([^*\n]+?)\*\*/g,'<b>$1</b>').replace(/__([^_\n]+?)__/g,'<u>$1</u>').replace(/(^|[^*\w])\*([^*\s\n](?:[^*\n]*?[^*\s\n])?)\*(?!\*)/g,'$1<i>$2</i>')}
  var RX=/\*\*[^*\n]+\*\*|__[^_\n]+__|(^|\n)\s*(?:[-•]|\d+\.)\s+\S|(^|[^*\w])\*[^*\s\n][^*\n]*\*/;
  window.kgmRichHasR1026C=function(s){return RX.test(String(s||''))};
  window.kgmRichR1026C=function(s){var L=esc(s).split(/\r?\n/),out='',list='';
    function close(){if(list){out+='</'+list+'>';list=''}}
    L.forEach(function(ln){var m=/^\s*[-•]\s+(.*)$/.exec(ln),n=/^\s*\d+\.\s+(.*)$/.exec(ln);
      if(m){if(list!=='ul'){close();out+='<ul class="k27rt-ul">';list='ul'}out+='<li>'+inl(m[1])+'</li>';return}
      if(n){if(list!=='ol'){close();out+='<ol class="k27rt-ol">';list='ol'}out+='<li>'+inl(n[1])+'</li>';return}
      close();out+=(out&&!/>$/.test(out)?'<br>':'')+inl(ln)});
    close();return out};
  /* 工具列 */
  function wrap(el,a,b){var s=el.selectionStart||0,e=el.selectionEnd||0,v=el.value,t=v.slice(s,e)||'';
    if(!t){el.value=v.slice(0,s)+a+b+v.slice(e);el.selectionStart=el.selectionEnd=s+a.length}else{el.value=v.slice(0,s)+a+t+b+v.slice(e);el.selectionStart=s;el.selectionEnd=e+a.length+b.length}
    fire(el)}
  function lines(el,kind){var v=el.value,s=el.selectionStart||0,e=el.selectionEnd||0,ls=v.lastIndexOf('\n',s-1)+1,le=v.indexOf('\n',e);if(le<0)le=v.length;
    var seg=v.slice(ls,le).split('\n'),k=0,nx=seg.map(function(x){var c=x.replace(/^\s*(?:[-•]|\d+\.)\s+/,'');if(kind==='ul')return '- '+c;k++;return k+'. '+c}).join('\n');
    el.value=v.slice(0,ls)+nx+v.slice(le);el.selectionStart=ls;el.selectionEnd=ls+nx.length;fire(el)}
  function fire(el){try{el.dispatchEvent(new Event('input',{bubbles:true}))}catch(_){}el.focus()}
  function prev(el){var p=el.__k27p;if(!p)return;var v=el.value;p.innerHTML=v.trim()&&window.kgmRichHasR1026C(v)?'<small>預覽</small><div>'+window.kgmRichR1026C(v)+'</div>':'';p.style.display=p.innerHTML?'':'none'}
  window.kgmRichBarR1026C=function(el){if(!el||el.__k27bar)return;el.__k27bar=1;var bar=document.createElement('div');bar.className='k27rt-bar';
    bar.innerHTML='<button type="button" data-a="b" title="粗體"><b>B</b></button><button type="button" data-a="i" title="斜體"><i>I</i></button><button type="button" data-a="u" title="底線"><u>U</u></button><span></span><button type="button" data-a="ul" title="項目符號">• 項目</button><button type="button" data-a="ol" title="編號">1. 編號</button><span></span><button type="button" data-a="x" title="清除格式">清除</button>';
    bar.addEventListener('mousedown',function(e){e.preventDefault()});
    bar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=b.getAttribute('data-a');
      if(a==='b')wrap(el,'**','**');else if(a==='i')wrap(el,'*','*');else if(a==='u')wrap(el,'__','__');else if(a==='ul'||a==='ol')lines(el,a);
      else{el.value=el.value.replace(/\*\*|__/g,'').replace(/(^|[^*])\*([^*]+)\*/g,'$1$2').replace(/^\s*(?:[-•]|\d+\.)\s+/gm,'');fire(el)}prev(el)});
    el.parentNode.insertBefore(bar,el);var p=document.createElement('div');p.className='k27rt-prev';p.style.display='none';el.__k27p=p;el.parentNode.insertBefore(p,el.nextSibling);
    el.addEventListener('input',function(){prev(el)});prev(el)};
  /* 網站上顯示的地方：文字節點裡有標記的才換（輸入框、程式碼、可編輯區不動） */
  var SKIP=/^(TEXTAREA|INPUT|SCRIPT|STYLE|SELECT|OPTION|CODE|PRE|NOSCRIPT)$/;
  function pass(){try{var root=document.getElementById('app');if(!root)return;if(S.view==='admin'&&/^(flightdata|fleetsched|sched|groundroster12|groundops|status|price|fareana|fareadj|finance|salary)$/.test(S.adminTab||''))return;   /* 大表格頁面不掃 */var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var v=n.nodeValue;if(!v||v.length<4)return NodeFilter.FILTER_SKIP;if(v.indexOf('**')<0&&v.indexOf('__')<0&&v.indexOf('*')<0&&!/(^|\n)\s*(?:[-•]|\d+\.)\s/.test(v))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_ACCEPT}}),L=[],n;
      while((n=w.nextNode())){var pe=n.parentElement;if(!pe||SKIP.test(pe.tagName)||pe.closest('[contenteditable],.k27rt-prev,.k27rt-bar,svg'))continue;if(window.kgmRichHasR1026C(n.nodeValue)&&/\*\*[^*]+\*\*|__[^_]+__|\*[^*\s]|^\s*[-•]\s|\n\s*[-•]\s|\n\s*\d+\.\s/.test(n.nodeValue))L.push(n)}
      L.forEach(function(t){var sp=document.createElement('span');sp.className='k27rt';sp.innerHTML=window.kgmRichR1026C(t.nodeValue);t.parentNode.replaceChild(sp,t)})}catch(_){}}
  var PQ=0;function soon(){if(PQ)return;PQ=setTimeout(function(){PQ=0;pass()},60)}
  try{new MutationObserver(soon).observe(document.documentElement,{childList:true,subtree:true})}catch(_){setInterval(pass,1500)}
  try{var cs=document.createElement('style');cs.id='k27rt-css';cs.textContent=
    '.k27rt-bar{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:6px;border:1px solid #DCE5E0;border-bottom:0;border-radius:10px 10px 0 0;background:#F6F9F7}'
   +'.k27rt-bar button{border:1px solid transparent;background:transparent;border-radius:7px;min-width:32px;height:30px;padding:0 9px;font:600 13px system-ui,sans-serif;color:#24352E;cursor:pointer}.k27rt-bar button:hover{background:#fff;border-color:#DCE5E0}.k27rt-bar span{width:1px;height:18px;background:#DCE5E0;margin:0 4px}'
   +'.k27rt-bar + textarea,.k27rt-bar + input{border-top-left-radius:0!important;border-top-right-radius:0!important;margin-top:0!important}'
   +'.k27rt-prev{margin-top:8px;padding:10px 12px;border:1px dashed #DCE5E0;border-radius:10px;background:#FBFCFB;font-size:13px;color:#24352E}.k27rt-prev small{display:block;font-size:10.5px;letter-spacing:.1em;color:#9A7B2F;font-weight:700;margin-bottom:4px}'
   +'.k27rt ul,.k27rt ol,.k27rt-prev ul,.k27rt-prev ol{margin:4px 0;padding-left:20px}.k27rt li,.k27rt-prev li{margin:2px 0}';
    document.head.appendChild(cs)}catch(_){}
})();

/* ══ 1026C：Manager I／II／III 的團隊群組（使用者：「Manager I/II/III 向自己的 TEAM 發 MESSAGE，要有自己 team 的 group」）
   團隊＝主管紀錄（mgr12）那一份：地勤 Manager I／II＝同站同輪替的小組（kgmMgrTeamsR1012A，跟地勤班表同一份）；
   Manager III＝整個部門；客艙／飛行員／其他部門的 Manager I／II＝同部門同基地。
   ① 員工聊天多一個「團隊群組」（主管、組員、執行長看得到）；② 通知管理「員工公告」多一個對象「我的團隊」，主管發給自己團隊不用送審。 ══ */
(function(){
  var TC={t:0,v:{}};
  function staff(){return S.staff||[]}
  function lvlName(l){return ['','Manager I','Manager II','Manager III'][+l]||'Manager'}
  function base(s){return String(s&&(s.base||s.station||s.homeBase)||'TPE')}
  window.kgmTeamOfR1026C=function(mid){if(!mid||!window.kgmMgrOfR1012A)return [];var now=Date.now();if(now-TC.t>60000){TC={t:now,v:{}}}if(TC.v[mid])return TC.v[mid];
    var m=window.kgmMgrOfR1012A(mid),me=staff().filter(function(x){return x&&x.empId===mid})[0],out=[];if(!m||!me){TC.v[mid]=out;return out}
    var dept=m.dept||me.role,lv=+m.level||1;
    if(dept==='ground'&&lv<=2&&window.kgmMgrTeamsR1012A){try{var ap=(window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(mid))?'TSA':'TPE',T=window.kgmMgrTeamsR1012A(ap,todayISO());out=(T&&T[mid])||[]}catch(_){out=[]}}
    else out=staff().filter(function(x){return x&&x.active!==false&&x.empId!==mid&&x.role===dept&&(lv>=3||base(x)===base(me))}).map(function(x){return x.empId});
    TC.v[mid]=out;return out};
  window.kgmTeamGroupsR1026C=function(me,ceo){var out=[];if(!window.kgmMgrOfR1012A)return out;
    staff().forEach(function(s){if(!s||!s.empId)return;var m=window.kgmMgrOfR1012A(s.empId);if(!m)return;
      if(!(ceo||s.empId===me||window.kgmTeamOfR1026C(s.empId).indexOf(me)>=0))return;
      out.push(['dept_team_'+s.empId,'👥 '+s.name+' 團隊（'+lvlName(m.level)+'）',m.dept||s.role])});
    return out};
})();
