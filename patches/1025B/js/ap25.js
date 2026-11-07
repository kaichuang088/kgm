
/* ══ G：後台選機場的欄位一律用前台那個選擇器（使用者：「後台所有需要用到航線格式要跟前台後來那樣一樣」→ 確認是「前台選機場那個選擇器」）
   前台 r158：大按鈕「TPE 台北桃園」，點開依區域分組、代碼／中文／英文都搜得到。
   後台各頁的機場欄位寫法不同（下拉選單、三碼輸入框），不一個一個改表單：原本的欄位保留（藏起來），前面放同一款按鈕；
   選好之後把代碼寫回原本的欄位並觸發它自己的 input／change —— 各頁原本的存檔、篩選、重畫照舊。
   · 下拉選單：選項大多是三碼的就換（選項範圍照原本的，例如只列有飛的航點）
   · 輸入框：三碼欄位（排除國籍、幣別、新增機場代碼）與已知的航點欄位；原本可以空白（例如「全部」）的保留「全部」；
     新增航線的出發／目的地可以用清單裡沒有的新代碼 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var EXC={rNat:1,r6Nat:1,r7Nat:1,k914ApCode:1,k914ApCurr:1,k158q:1,k25apq:1};
  var IDS={adDivertTo:1,cancelNewFr0815:1,cancelNewTo0815:1,r49TempFr:1,r49TempTo:1,hMasterFr:1,hMasterTo:1,hNewFr:1,hNewTo:1,k57NewFr:1,k57NewTo:1,k69mxStation:1,nfVia:1};
  var NEWOK={k57NewFr:1,k57NewTo:1,nfVia:1,hNewFr:1,hNewTo:1};
  function L(){return window.kgmApLibR1025B||null}
  function city(a){try{return L()?L().city(a):a}catch(_){return a}}
  function sub(a){try{return L()?L().sub(a):''}catch(_){return ''}}
  function iata(v){return /^[A-Z]{3}$/.test(String(v||''))}
  var KN=null,KNT=0;function known(){if(!KN||Date.now()-KNT>10000){KN={};KNT=Date.now();try{var R=L()?L().regions():{};Object.keys(R).forEach(function(rg){(R[rg]||[]).forEach(function(a){KN[a]=1})})}catch(_){}try{Object.keys(CITY_ZH||{}).forEach(function(a){if(iata(a))KN[a]=1})}catch(_){}}return KN}
  function isApSelect(el){var o=el.options;if(!o||o.length<2)return false;var n=0,m=0,K=known();for(var i=0;i<o.length;i++){var v=o[i].value;if(v==='')continue;m++;if(iata(v)&&K[v])n++}return m>=2&&n/m>=0.8}   /* 幣別（USD／TWD）也是三碼，要真的是航點才換 */
  function isApInput(el){if(el.readOnly||el.disabled)return false;var t=(el.type||'text').toLowerCase();if(t!=='text'&&t!=='')return false;if(EXC[el.id])return false;if(el.closest('.k25ap-pop,.k158-pop'))return false;
    if(IDS[el.id])return true;return el.maxLength===3&&!/幣|Curr|國籍|Nat/i.test((el.placeholder||'')+(el.id||''))}
  function optsOf(el){
    if(el.tagName==='SELECT'){var o=[],blank=null;[].forEach.call(el.options,function(x){if(x.value==='')blank=x.textContent||'';else if(iata(x.value))o.push(x.value)});return {list:o,blank:blank}}
    var all=[];try{var R=L()?L().regions():{};Object.keys(R).forEach(function(rg){(R[rg]||[]).forEach(function(a){if(all.indexOf(a)<0)all.push(a)})})}catch(_){}
    var ph=String(el.placeholder||'');return {list:all,blank:(/全部|All/i.test(ph)||(!el.value&&!IDS[el.id]))?(z()?'全部':'All'):null,newOk:!!NEWOK[el.id]}}
  function label(el){var v=String(el.value||'').toUpperCase();if(!v){var o=optsOf(el);return '<span class="k25ap-ph">'+E(o.blank||(z()?'選擇航點':'Choose airport'))+'</span>'}
    return '<b>'+E(v)+'</b><span>'+E(iata(v)?city(v):'')+'</span>'}
  function enhance(el){
    el.setAttribute('data-ap25','1');
    var b=document.createElement('button');b.type='button';b.className='k25ap';b.innerHTML=label(el);
    var rc=el.getBoundingClientRect();if(rc.width>0)b.style.width=Math.max(120,rc.width)+'px';if(rc.height>24)b.style.height=Math.round(rc.height)+'px';   /* 跟原本欄位一樣寬、一樣高，版面不跳 */
    b.onclick=function(ev){ev.preventDefault();open(el,b)};
    el.parentNode.insertBefore(b,el);el.style.display='none';el.__k25ap=b;
  }
  var POP=null,CUR=null,CK=null;
  /* 背景重畫會把整頁換掉：記住是哪一個欄位（id，或同一個 change 寫法的第幾個），選好時找重畫後的那一個 */
  function keyOf(el){if(el.id)return '#'+el.id;var oc=el.getAttribute('onchange')||el.getAttribute('oninput')||'',L=[].filter.call(document.querySelectorAll('#app '+el.tagName),function(x){return (x.getAttribute('onchange')||x.getAttribute('oninput')||'')===oc});return el.tagName+'|'+oc+'|'+L.indexOf(el)}
  function resolve(k,old){if(old&&document.body.contains(old))return old;if(!k)return null;if(k[0]==='#')return document.getElementById(k.slice(1));var p=k.split('|'),tag=p[0],i=+p[p.length-1],oc=p.slice(1,-1).join('|');
    var L=[].filter.call(document.querySelectorAll('#app '+tag),function(x){return (x.getAttribute('onchange')||x.getAttribute('oninput')||'')===oc});return L[i]||null}
  function close(){if(POP&&POP.parentNode)POP.parentNode.removeChild(POP);POP=null;CUR=null;CK=null}
  function pick(el,v){
    el=resolve(CK,el)||el;
    el.value=v;
    try{el.dispatchEvent(new Event('input',{bubbles:true}))}catch(_){}
    try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch(_){}
    if(el.__k25ap)el.__k25ap.innerHTML=label(el);
    close();
  }
  function list(el,q){
    var o=optsOf(el),Q=String(q||'').trim(),match=window.kgmApMatchR158||function(a,s){return !s||a.indexOf(String(s).toUpperCase())>=0},
        rank=function(a){try{return L()?L().rank(a,Q):0}catch(_){return 0}},cur=String(el.value||'').toUpperCase(),html='',tot=0;
    var R={};try{R=L()?L().regions():{}}catch(_){R={}}
    var inR={};Object.keys(R).forEach(function(rg){(R[rg]||[]).forEach(function(a){inR[a]=rg})});
    var groups={},order=[];
    o.list.forEach(function(a){if(!match(a,Q))return;var rg=inR[a]||(z()?'其他':'Other');if(!groups[rg]){groups[rg]=[];order.push(rg)}groups[rg].push(a)});
    var ro=Object.keys(R);order.sort(function(x,y){var a=ro.indexOf(x),b=ro.indexOf(y);return (a<0?999:a)-(b<0?999:b)});
    if(o.blank!=null&&!Q)html+='<button type="button" class="k158-op'+(cur?'':' on')+'" data-v=""><b>—</b><span>'+E(o.blank)+'</span></button>';
    order.forEach(function(rg){var L2=groups[rg].sort(function(a,b){return rank(a)-rank(b)||a.localeCompare(b)});tot+=L2.length;
      html+='<div class="k158-rg">'+E(rg)+'</div>'+L2.map(function(a){var s=sub(a);return '<button type="button" class="k158-op'+(cur===a?' on':'')+'" data-v="'+E(a)+'"><b>'+E(a)+'</b><span>'+E(city(a))+'</span>'+(s?'<i>'+E(s)+'</i>':'')+'</button>'}).join('')});
    var U=Q.toUpperCase();if(o.newOk&&iata(U)&&o.list.indexOf(U)<0)html+='<button type="button" class="k158-op" data-v="'+E(U)+'"><b>'+E(U)+'</b><span>'+(z()?'使用新的航點代碼':'Use new airport code')+'</span></button>';
    if(!html)html='<div class="k158-none">'+(z()?'找不到符合的航點。可以試代碼（ZRH）、中文（蘇黎世／苏黎世）或英文（Zurich）。':'No match.')+'</div>';
    return {html:html,n:tot};
  }
  function open(el,b){
    if(CUR===el){close();return}close();CUR=el;CK=keyOf(el);
    var p=document.createElement('div');p.className='k158-pop k25ap-pop';
    p.innerHTML='<div class="k158-bar"><input id="k25apq" autocomplete="off" placeholder="'+(z()?'代碼、中文、英文都可以（例如 ZRH／蘇黎世／苏黎世／Zurich）':'IATA code, Chinese or English')+'"><small></small></div><div class="k25ap-list"></div>';
    document.body.appendChild(p);POP=p;
    /* 放在按鈕正下方（文件座標：按鈕位置＋捲動量；body 有自己的包含區塊時 fixed 會偏掉） */
    var r=b.getBoundingClientRect(),br=document.body.getBoundingClientRect(),h=Math.min(380,p.offsetHeight||380),
        below=r.bottom+4,top=(below+h>window.innerHeight&&r.top-h-4>8)?(r.top-h-4):below,left=Math.min(r.left,window.innerWidth-(p.offsetWidth||340)-12);
    p.style.cssText='position:absolute;top:'+Math.round(top-br.top)+'px;left:'+Math.round(Math.max(8,left)-br.left)+'px;z-index:100000;margin:0';
    var inp=p.querySelector('input'),box=p.querySelector('.k25ap-list'),sm=p.querySelector('small');
    function draw(){var x=list(el,inp.value);box.innerHTML=x.html;sm.textContent=z()?('找到 '+x.n+' 個航點・簡體與英文也找得到'):(x.n+' matches')}
    draw();inp.oninput=draw;
    inp.onkeydown=function(ev){if(ev.key==='Escape'){close()}else if(ev.key==='Enter'){ev.preventDefault();var f=box.querySelector('[data-v]');if(f)pick(el,f.getAttribute('data-v'))}};
    box.onclick=function(ev){var t=ev.target.closest('[data-v]');if(t)pick(el,t.getAttribute('data-v'))};
    setTimeout(function(){try{inp.focus()}catch(_){}},0);
  }
  document.addEventListener('pointerdown',function(ev){if(!POP)return;if(ev.target.closest('.k25ap-pop,.k25ap'))return;close()},true);
  window.addEventListener('resize',close);
  function scan(){try{
    if(!(S.adminAuthed&&S.view==='admin'))return;var app=document.getElementById('app');if(!app)return;
    if(POP&&CUR&&!document.body.contains(CUR)){var n2=resolve(CK,null);if(n2)CUR=n2}   /* 重畫後換成新的那一個，選擇器不關 */
    [].forEach.call(app.querySelectorAll('select:not([data-ap25]),input:not([data-ap25])'),function(el){
      if(el.tagName==='SELECT'?isApSelect(el):isApInput(el))enhance(el);else el.setAttribute('data-ap25','0')});
    [].forEach.call(app.querySelectorAll('[data-ap25="1"]'),function(el){if(el.__k25ap&&document.activeElement!==el)el.__k25ap.innerHTML=label(el)});
  }catch(_){}}
  var pend=false;function soon(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;scan()})}
  try{var mo=new MutationObserver(soon);var go=function(){var app=document.getElementById('app');if(app)mo.observe(app,{childList:true,subtree:true});else setTimeout(go,500)};go()}catch(_){}
  setInterval(soon,1500);
  try{if(!document.getElementById('k25ap-css')){var cs=document.createElement('style');cs.id='k25ap-css';
    cs.textContent='.k25ap{display:inline-flex;align-items:baseline;gap:8px;height:34px;padding:0 12px;border:1px solid #d8dce1;border-radius:10px;background:#fff;cursor:pointer;font-family:inherit;font-size:13px;color:#1f2b3a;text-align:left;max-width:100%;vertical-align:middle}'
      +'.k25ap:hover{border-color:#C9A661}.k25ap b{font-family:ui-monospace,Menlo,monospace;color:#0d4a3c;letter-spacing:.06em;font-size:13px;align-self:center}.k25ap span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-self:center}.k25ap .k25ap-ph{color:#8a94a0}'
      +'.k25ap-pop{min-width:320px;max-width:min(420px,calc(100vw - 16px));max-height:380px;overflow-y:auto;background:#fff;border:1px solid #e6e2d6;border-radius:14px;box-shadow:0 14px 38px rgba(24,38,58,.14)}'
      +'.k25ap-pop .k158-bar{padding:10px 11px;border-bottom:1px solid #eee9dc;position:sticky;top:0;background:#fff;z-index:2}'
      +'.k25ap-pop .k158-bar input{width:100%;height:36px;border:1px solid #d8dce1;border-radius:10px;padding:0 11px;font-size:13px;font-family:inherit}'
      +'.k25ap-pop .k158-bar input:focus{outline:0;border-color:#C9A661;box-shadow:0 0 0 3px rgba(201,166,97,.16)}'
      +'.k25ap-pop .k158-bar small{display:block;font-size:10px;color:#9aa3ae;margin-top:6px}'
      +'.k25ap-pop .k158-rg{padding:7px 12px 3px;font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#8a94a0;background:#FAF8F2}'
      +'.k25ap-pop .k158-op{display:flex;align-items:baseline;gap:9px;width:100%;text-align:left;border:none;background:#fff;cursor:pointer;padding:8px 12px;font-family:inherit;font-size:13px;color:#1f2b3a}'
      +'.k25ap-pop .k158-op:hover{background:#F6F3EA}.k25ap-pop .k158-op.on{background:#EDF4F0}'
      +'.k25ap-pop .k158-op b{font-family:ui-monospace,Menlo,monospace;color:#0d4a3c;letter-spacing:.06em;font-size:12.5px;min-width:34px}'
      +'.k25ap-pop .k158-op i{font-style:normal;font-size:10.5px;color:#9aa3ae;margin-left:auto;padding-left:10px}'
      +'.k25ap-pop .k158-none{padding:16px;font-size:12px;color:#9aa3ae;line-height:1.7}';
    document.head.appendChild(cs)}}catch(_){}
  window.kgmApScanR1025B=scan;
})();
