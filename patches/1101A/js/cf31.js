/* ══ 1103A：自創航班／加開包機申請表（使用者：「這裡要可以去回程人數不同」「如果用戶選擇A388但是起飛或是目的地其中一方不能停
   或是填寫不能停的機型 不能列出來當選項」「我這裡輸入TPE-PHX還是有A21N欸」）══
   ① 機型選單每次依出發地／目的地／人數重新產生（不是把選項藏起來——Mac Safari 的下拉選單不理 hidden，1102A 那樣做 A21N 還是看得到）：
      · A388：兩端機場都要能停 A380（A388_PORTS：KGM 自己有排 A388 的機場＋實際有 A380 定期航班的機場）；
      · 航程：機型最大航程 ×0.95 要大於兩地距離；長程（4,000 公里以上）不用 A21N、A339R（KGM 自己的班也是短程才用這兩型）；
      · 座位：機型總座位數要放得下這個方向的人數；
      · 都不符合時選單只留「由 KGM 建議」，下面寫原因。
   ② 去程人數／回程人數分開填（有回程日期才出現回程人數，空白＝跟去程一樣）；報價每一段用那一段的人數算；送出時兩個方向都檢查座位數。
   ④ 填到一半的欄位每打一字就記住（原本背景重畫會清空整張表）。
   ③ 送出前再檢查一次（機型不在可選清單就擋下）；後台排機（kgmTempPlanR1026C）也排除不能停的機型。 */
(function(){
  if(window.__cf31)return;window.__cf31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function U(v){return String(v||'').toUpperCase().trim()}
  function km(a,b){try{return +distOf(U(a),U(b))||0}catch(_){return 0}}
  function known(a){a=U(a);try{return a.length===3&&TZ&&TZ[a]!=null}catch(_){return false}}
  /* 可停 A380 的機場：實際有 A380 定期航班的機場（中東、歐洲、北美、亞太主要樞紐） */
  var A388_PORTS={TPE:1,NRT:1,HND:1,KIX:1,ICN:1,HKG:1,PVG:1,PEK:1,PKX:1,CAN:1,SIN:1,KUL:1,BKK:1,MNL:1,DEL:1,BOM:1,BLR:1,MAA:1,HYD:1,CMB:1,MLE:1,
    DXB:1,DOH:1,AUH:1,JED:1,RUH:1,CAI:1,TLV:1,JNB:1,CPT:1,MRU:1,
    LHR:1,LGW:1,MAN:1,BHX:1,CDG:1,NCE:1,FRA:1,MUC:1,DUS:1,HAM:1,AMS:1,ZRH:1,VIE:1,PRG:1,MAD:1,BCN:1,LIS:1,FCO:1,MXP:1,IST:1,CPH:1,OSL:1,ARN:1,DUB:1,
    LAX:1,SFO:1,JFK:1,EWR:1,IAD:1,IAH:1,DFW:1,ORD:1,ATL:1,MIA:1,BOS:1,SEA:1,YVR:1,YYZ:1,YUL:1,MEX:1,GRU:1,
    SYD:1,MEL:1,BNE:1,PER:1,AKL:1};
  function a388At(a){a=U(a);if(A388_PORTS[a])return true;try{return FLIGHTS.some(function(f){return f&&(f.fr===a||f.to===a)&&/^A38/.test(String(f.acft||''))})}catch(_){return false}}
  window.kgmA388OkR1103A=a388At;
  var RANGE={A21N:7400,A21X:8700,B78X:11900,B789:14000,B779:13500,A359:15000,A35K:16100,A339R:7000,A339L:13300,A388:15000};
  var TYPES=['A21N','B78X','B789','B779','A359','A35K','A339R','A339L','A388'];
  function seats(t){var n=0;try{(window.seatSections7(t)||[]).forEach(function(s){(s.rows||[]).forEach(function(r){(r.cells||[]).forEach(function(c){if(c&&c.id)n++})})})}catch(_){}
    if(!n){try{var c=(AC[t]||{}).cabins||{};['econ','prem','biz','suite','first'].forEach(function(k){n+=+((c[k]||{}).seats)||0})}catch(_){}}return n}
  /* 這一段能用的機型與每一型不能用的原因 */
  function okTypes(fr,to,pax){fr=U(fr);to=U(to);var d=(known(fr)&&known(to))?km(fr,to):0,out=[],why={};   /* 不在航點資料的機場：不知道距離，只看 A380 與座位 */
    TYPES.forEach(function(t){var w='';
      if(/^A38/.test(t)&&(!a388At(fr)||!a388At(to)))w=z()?((!a388At(fr)?fr:to)+' 不能停 A380'):((!a388At(fr)?fr:to)+' cannot handle the A380');
      else if(d>=4000&&(/^A21/.test(t)||t==='A339R'))w=z()?'長程航段（4,000 公里以上）不用這個機型':'Not used on long-haul';
      else if(d&&RANGE[t]&&d>RANGE[t]*0.95)w=z()?'航程不夠（'+Math.round(d).toLocaleString()+' 公里）':'Out of range';
      else if(pax&&seats(t)&&pax>seats(t))w=z()?'座位不夠（'+seats(t)+' 位）':'Not enough seats';
      if(w)why[t]=w;else out.push(t)});
    return {types:out,why:why,km:d}}
  window.kgmCharterTypesR1103A=okTypes;
  function el(id){return document.getElementById(id)}
  function num(v){v=Math.round(+v||0);return v>0?v:0}
  function D(){return S.k27cr||{}}
  function vv(k){var d=D();return ((d.v31||{})[k])||''}
  function setv(k,v){var d=S.k27cr;if(!d)return;d.v31=d.v31||{};d.v31[k]=v}
  /* 表單：去程人數改名、加回程人數、重產機型選單 */
  /* 填到一半的欄位：每打一個字就記進 S.k27cr.v（原本只有按「送出」才記，背景一重畫就整張表清空——日期、航點都不見） */
  function keepAll(){var f=el('k27cr-form'),d=S.k27cr;if(!f||!d)return;d.v=d.v||{};[].forEach.call(f.querySelectorAll('input[id^="k27c-"],select[id^="k27c-"],textarea[id^="k27c-"]'),function(x){if(x.__cf31k)return;x.__cf31k=1;var h=function(){try{(S.k27cr.v=S.k27cr.v||{})[x.id]=x.value}catch(_){}};x.addEventListener('input',h);x.addEventListener('change',h)})}
  function sync(){try{keepAll()}catch(_){}var sel=el('k27c-type'),fr=el('k27c-fr'),to=el('k27c-to'),px=el('k27c-pax');if(!sel||!fr||!to)return;
    var paxLab=px&&px.parentElement&&px.parentElement.querySelector('span');if(paxLab&&!paxLab.__cf31){paxLab.__cf31=1;paxLab.textContent=z()?'去程人數':'Outbound travellers'}
    var ret=el('k27c-ret'),pr=el('k31c-paxret');
    if(px&&!pr){var lab=document.createElement('label');lab.className='k31c-pr';lab.innerHTML='<span>'+(z()?'回程人數（空白＝跟去程一樣）':'Return travellers (blank = same)')+'</span><input id="k31c-paxret" type="number" min="10">';
      px.parentElement.parentElement.insertBefore(lab,px.parentElement.nextSibling);pr=el('k31c-paxret');pr.value=vv('paxRet');pr.addEventListener('input',function(){setv('paxRet',pr.value);sync()})}
    if(pr){var has=!!(ret&&ret.value);pr.parentElement.style.display=has?'':'none'}
    var p1=num(px&&px.value),p2=num(pr&&pr.value)||p1,need=Math.max(p1,(ret&&ret.value)?p2:0),cur=sel.value||vv('type');
    var dt=el('k27c-date'),d1=dt&&dt.value||'',d2=(ret&&ret.value)||'';
    var key=[U(fr.value),U(to.value),need,d1,d2,z()?1:0].join('|');if(sel.__cf31===key&&sel.options.length)return;sel.__cf31=key;
    var o=(U(fr.value).length===3&&U(to.value).length===3)?okTypes(fr.value,to.value,need):{types:TYPES.slice(),why:{},km:0};
    /* 1115A D2（使用者：「新創航班要可以只顯示Available的機型而非全部」）：去程（與回程）那一天真的排得出飛機的機型才列 */
    var pend40=false;try{if(o.types.length&&/^\d{4}-\d{2}-\d{2}$/.test(d1)&&window.kgmCharterAvailR1115A){var av=window.kgmCharterAvailR1115A(U(fr.value),U(to.value),d1,/^\d{4}-\d{2}-\d{2}$/.test(d2)?d2:'',o.types,function(){sel.__cf31='';try{sync()}catch(_){}});
      if(!av)pend40=true;else o.types=o.types.filter(function(t){if(av[t])return true;o.why[t]=z()?(av.__why&&av.__why[t]||'那幾天沒有排得出來的飛機'):'No aircraft free on those dates';return false})}}catch(_){}
    sel.innerHTML='<option value="">'+(z()?'由 KGM 建議':'KGM to suggest')+'</option>'+o.types.map(function(t){var n='';try{n=(AC[t]||{}).nm||''}catch(_){}return '<option value="'+t+'">'+t+(n?' · '+n:'')+'</option>'}).join('');
    sel.value=o.types.indexOf(cur)>=0?cur:'';if(cur&&sel.value!==cur)setv('type','');
    if(!sel.__cf31l){sel.__cf31l=1;sel.addEventListener('change',function(){setv('type',sel.value)})}
    var note=sel.parentElement.querySelector('.k31c-note');if(!note){note=document.createElement('small');note.className='k31c-note';sel.parentElement.appendChild(note)}
    var gone=Object.keys(o.why);if(pend40){note.textContent=z()?'正在確認這幾天哪幾型排得出飛機…（確認完清單會自動更新）':'Checking aircraft availability…';[fr,to,px,ret,el('k27c-date')].forEach(function(x){if(x&&!x.__cf31){x.__cf31=1;x.addEventListener('input',sync);x.addEventListener('change',sync)}});return}
    note.textContent=!(U(fr.value).length===3&&U(to.value).length===3)?'':((!known(fr.value)||!known(to.value))?((z()?'（'+(!known(fr.value)?U(fr.value):U(to.value))+' 不在 KGM 航點資料，航程由團體業務確認）':'')+' '):'')+(gone.length?((z()?'不列出：':'Not offered: ')+gone.map(function(t){return t+'（'+o.why[t]+'）'}).join('；')):'');
    [fr,to,px,ret,el('k27c-date')].forEach(function(x){if(x&&!x.__cf31){x.__cf31=1;x.addEventListener('input',sync);x.addEventListener('change',sync)}})}
  setInterval(function(){try{if(el('k27c-type'))sync()}catch(_){}},500);
  /* 送出：機型要在可選清單、回程人數檢查；成功後把回程人數寫進申請 */
  function wrapSubmit(){var O=window.kgmCharterSubmitR1026C;if(typeof O!=='function'||O.__cf31)return;
    var w=function(){try{sync()}catch(_){}
      var fr=el('k27c-fr'),to=el('k27c-to'),px=el('k27c-pax'),pr=el('k31c-paxret'),ret=el('k27c-ret'),sel=el('k27c-type');
      if(fr&&to&&px){var p1=num(px.value),p2=pr&&pr.value?num(pr.value):p1,hasRet=!!(ret&&ret.value);
        if(hasRet&&pr&&pr.value&&p2<10){S.k27cr.msg=z()?'回程人數至少 10 位。':'Return: at least 10.';try{render()}catch(_){}return}
        var t=sel&&sel.value;if(t&&U(fr.value).length===3&&U(to.value).length===3){var o=okTypes(fr.value,to.value,Math.max(p1,hasRet?p2:0));if(o.types.indexOf(t)<0){S.k27cr.msg=(z()?t+' 不能飛這一段：':t+': ')+(o.why[t]||'');try{render()}catch(_){}return}}
        var before=(S.charterReqsR1026C||[]).length;var r0=O.apply(this,arguments);
        try{var L=S.charterReqsR1026C||[];if(L.length>before){var r=L[0];if(r&&hasRet&&p2&&p2!==r.pax){r.paxRet=p2;r.history=r.history||[];r.history.push({at:new Date().toISOString(),act:(z()?'去程 '+r.pax+' 位、回程 '+p2+' 位':'Out '+r.pax+' / return '+p2),by:'customer'});try{save()}catch(_){}try{render()}catch(_){}}}}catch(_){}
        return r0}
      return O.apply(this,arguments)};
    w.__cf31=1;window.kgmCharterSubmitR1026C=w}
  /* 後台排機：不能停／航程不夠／長程的機型不排 */
  function wrapPlan(){var O=window.kgmTempPlanR1026C;if(typeof O!=='function'||O.__cf31)return;
    var w=function(P){if(P&&P.fr&&P.to&&known(P.fr)&&known(P.to)){var ok=okTypes(P.fr,P.to,0).types;if(P.type&&ok.indexOf(P.type)<0)P=Object.assign({},P,{type:'',typeDroppedR1103A:P.type});
        var o=O.call(this,P);if(o&&o.opts)o.opts=o.opts.filter(function(x){return !x||!x.type||ok.indexOf(x.type)>=0});return o}
      return O.apply(this,arguments)};w.__cf31=1;window.kgmTempPlanR1026C=w}
  function hook(){wrapSubmit();wrapPlan()}
  hook();setTimeout(hook,0);setTimeout(hook,3000);setTimeout(hook,8000);
  /* 顯示：去程／回程人數 */
  window.kgmCharterPaxTxtR1103A=function(r){if(!r)return '';return (r.paxRet&&r.paxRet!==r.pax)?((z()?'去程 ':'Out ')+r.pax+(z()?' 位・回程 ':' · return ')+r.paxRet+(z()?' 位':'')):(r.pax+(z()?' 位':' pax'))};
  try{var cs=document.createElement('style');cs.textContent='.k31c-note{display:block;margin-top:5px;color:#8A5A00;font-size:11.5px;line-height:1.5}';document.head.appendChild(cs)}catch(_){}
})();

/* ══ 1115A D2／D3（使用者：「新創航班要可以只顯示Available的機型而非全部」「這種包機申請要可以propose一個新機型 from 後台」）══
   kgmCharterAvailR1115A(fr,to,date,retDate)：每一型問一次後台排機（kgmTempPlanR1026C，跟核准時同一套：機身當時在出發地、前後勤務排得開、不在凌晨抵達），
   去程那天、有回程的話回程那天都排得出來才算可用。申請表的機型選單、後台「提議改用機型」都讀它。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var TY=['A21N','B78X','B789','B779','A359','A35K','A339R','A339L','A388'],C={},RUN={};
  function one(fr,to,date,t){try{var o=window.kgmTempPlanR1026C({fr:fr,to:to,kind:'temp',date:date,type:t,time:null,round:true,sale:false,at:Date.now()});return (o&&o.opts||[]).filter(function(x){return !x.type||x.type===t}).length}catch(_){return 0}}
  /* 排機一型一天約 0.4～0.6 秒 → 背景分段：一次只算一型一天、使用者 1.5 秒內有操作就先等；算好之前回傳 null，算完呼叫 done */
  function step(k){var R=RUN[k];if(!R)return;if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<1500){setTimeout(function(){step(k)},700);return}
    var j=R.q.shift();if(j){var n=one(R.fr,R.to,j[1],j[0]);if(n){if(j[2])R.v[j[0]]=Math.min(R.v[j[0]]||n,n);else R.ok1[j[0]]=n}else{R.no[j[0]]=1;R.v.__why[j[0]]=z()?(j[1]+' 沒有排得出來的 '+j[0]):'No '+j[0]+' free on '+j[1];R.q=R.q.filter(function(x){return x[0]!==j[0]})}}
    if(R.q.length){setTimeout(function(){step(k)},40);return}
    R.types.forEach(function(t){if(!R.no[t]&&R.ok1[t])R.v[t]=R.v[t]||R.ok1[t]});if(!R.ret)R.types.forEach(function(t){if(R.ok1[t])R.v[t]=R.ok1[t]});
    if(Object.keys(C).length>40)C={};C[k]={t:Date.now(),v:R.v};delete RUN[k];R.cb.forEach(function(f){try{f()}catch(_){}})}
  window.kgmCharterAvailR1115A=function(fr,to,date,ret,types,done){types=(types&&types.length?types:TY).slice();var k=[fr,to,date,ret||'',types.join(',')].join('|'),c=C[k];if(c&&Date.now()-c.t<600000)return c.v;
    var R=RUN[k];if(!R){R=RUN[k]={fr:fr,to:to,ret:ret,types:types,q:[],v:{__why:{}},ok1:{},no:{},cb:[]};types.forEach(function(t){R.q.push([t,date,0]);if(ret)R.q.push([t,ret,1])});setTimeout(function(){step(k)},0)}
    if(done&&R.cb.indexOf(done)<0)R.cb.push(done);return null};
  function R(){return S.charterReqsR1026C||[]}
  function rerender(){try{(window.kgmSafeRenderR1026C||render)()}catch(_){}}
  /* 後台：提議改用機型（列出這筆申請的日期真的排得出來的機型；預設＝申請人希望的） */
  window.kgmCharterProposeHtmlR1115A=function(r){try{if(!r||r.status!=='pending'||S.view!=='admin')return '';
    var fr=r.fr,to=r.to;if(!fr||!to||!r.date)return '';var ok=window.kgmCharterTypesR1103A?window.kgmCharterTypesR1103A(fr,to,Math.max(+r.pax||0,+r.paxRet||0)).types:TY;
    var av=window.kgmCharterAvailR1115A(fr,to,r.date,r.retDate||'',ok,rerender);if(!av)return '<div class="k115p"><small>'+(z()?'正在確認 '+r.date+(r.retDate?'／'+r.retDate:'')+' 哪幾型排得出飛機…（確認完會出現「提議改用機型」）':'Checking aircraft…')+'</small></div>';var list=ok.filter(function(t){return av[t]});var cur=r.typeProposeR1115A||r.type||'';
    var opts='<option value="">'+(z()?(r.type?'照申請人希望（'+r.type+'）':'由系統建議'):'As requested')+'</option>'+list.filter(function(t){return t!==r.type}).map(function(t){return '<option value="'+t+'"'+(t===r.typeProposeR1115A?' selected':'')+'>'+t+'</option>'}).join('');
    return '<div class="k115p"><label>'+(z()?'提議改用機型':'Propose another type')+'<select onchange="kgmCharterProposeR1115A(\''+String(r.id).replace(/'/g,'')+'\',this.value)">'+opts+'</select></label>'
      +'<small>'+(z()?'只列 '+r.date+(r.retDate?'／'+r.retDate:'')+' 真的排得出飛機、而且兩端機場能停、航程與座位夠的機型（'+(list.length?list.join('、'):'沒有')+'）':'')
      +(r.typeProposeR1115A&&r.typeProposeR1115A!==r.type?(z()?'。送出報價時會告訴客戶「後台提議改用 '+r.typeProposeR1115A+'（原希望 '+(r.type||'未指定')+'）」。':''):'')+'</small></div>'}catch(_){return ''}};
  window.kgmCharterProposeR1115A=function(id,t){var r=R().filter(function(x){return x&&x.id===id})[0];if(!r||r.status!=='pending')return;
    r.typeProposeR1115A=t&&t!==r.type?t:'';try{delete (S.k27crPick||{})[id]}catch(_){}try{save()}catch(_){}try{render()}catch(_){}};
  try{var cs=document.createElement('style');cs.textContent='.k115p{margin:10px 0 2px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px}.k115p label{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#0B3D2E}.k115p select{padding:6px 10px;border-radius:10px;border:1px solid #cfd8d3;font-size:13px}.k115p small{color:#6b746f;font-size:12px;line-height:1.5}';document.head.appendChild(cs)}catch(_){}
})();
