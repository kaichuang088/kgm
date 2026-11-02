/* ══ 1103A：團體帳號申請與審核、團體票 G 的改退規則（使用者：
   「創建旅行社那些團購帳號需要前台 report information 給後台，後台會審核（審核也會看用戶國籍等等） 現在要可以訂購團體票太簡單
    然後團體票改成只有 G Class 你去參照一下長榮航空退改票的規定直接使用 然後解鎖那些的方式需要更謹慎」「可混倉喔我的意思是退改票辦法統一」）
   · 長榮的團體票條款不公開（官網只寫「團體旅客請洽原開票旅行社」），這裡用業界與長榮旅行社團體票（GV）常見做法：
     團進團出、訂金不退、名單期限前可改名、開票後不能改期／改航班／改名、開票後不退票價（機場稅可洽客服退還）、哩程 50%。
     → 新方案 G（PLANS.G，艙等代號 E-G／P-G／B-G）；舊的 Q／U 訂位照原本規則（不回溯）。
   · 前台：還沒有團體帳號（或被退回）→ 團體訂位頁顯示申請表（公司、統編、執照、負責人與聯絡人國籍、地址、預估出團量…），送出＝待審核。
   · 後台：核准前一定要完成審核（kgmGrpApproveR1026C 包裝）：系統先標風險（統編檢查碼、旅行社執照格式、免費信箱、
     聯絡人國籍與會員資料不符、高風險國籍），審核人逐項打勾；有高風險旗標要 CEO 核准。核准後 90 天試用：每團最多 40 位、每月最多 3 團。 */
(function(){
  if(window.__ga31)return;window.__ga31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function me(){try{if(!S.user)return null;return (S.users||[]).filter(function(u){return u&&u.id===S.user.id})[0]||S.user}catch(_){return null}}
  /* ── ① 團體票 G：線上不能改票、不能退票（最外層） ── */
  function isG(k){try{var f=FARES[k];return !!(f&&f.groupPlanR1026C==='G')}catch(_){return false}}
  /* 團體引擎的 feeWrap（第 12 秒）會再包一層、而且把舊函式上的旗標全複製過去 → 用「最外層是不是我這支」判斷，不靠旗標 */
  var MYC=null,MYR=null;
  function hookFees(){try{if(typeof changeFeeOf==='function'&&changeFeeOf!==MYC){var C0=changeFeeOf;MYC=function(k){if(isG(k))return -1;return C0.apply(this,arguments)};try{Object.keys(C0).forEach(function(q){if(!(q in MYC))MYC[q]=C0[q]})}catch(_){}changeFeeOf=MYC;window.changeFeeOf=MYC}}catch(_){}
    try{if(typeof refundPolicyOf==='function'&&refundPolicyOf!==MYR){var R0=refundPolicyOf;MYR=function(k){if(isG(k))return {allowed:false,fee:0,groupG:true};return R0.apply(this,arguments)};try{Object.keys(R0).forEach(function(q){if(!(q in MYR))MYR[q]=R0[q]})}catch(_){}refundPolicyOf=MYR;window.refundPolicyOf=MYR}}catch(_){}}
  hookFees();[0,3000,12500,16000,30000].forEach(function(t){setTimeout(hookFees,t)});
  /* ── ② 前台申請表 ── */
  var NAT=[['TW','中華民國（臺灣）'],['JP','日本'],['KR','韓國'],['HK','香港'],['MO','澳門'],['CN','中國大陸'],['SG','新加坡'],['MY','馬來西亞'],['TH','泰國'],['VN','越南'],['PH','菲律賓'],['ID','印尼'],['IN','印度'],['US','美國'],['CA','加拿大'],['GB','英國'],['DE','德國'],['FR','法國'],['AU','澳洲'],['NZ','紐西蘭'],['RU','俄羅斯'],['IR','伊朗'],['KP','北韓'],['MM','緬甸'],['SY','敘利亞'],['CU','古巴'],['BY','白俄羅斯'],['OT','其他']];
  var HIGH={KP:1,IR:1,MM:1,SY:1,CU:1,RU:1,BY:1};   /* FATF 高風險／受國際制裁的國籍：一定要 CEO 核准 */
  function natName(c){var x=NAT.filter(function(n){return n[0]===c})[0];return x?x[1]:(c||'—')}
  var FREE=/@(gmail|yahoo|hotmail|outlook|icloud|qq|163|126|live|msn|aol|proton(mail)?|yandex)\./i;
  function ubnOk(v){v=String(v||'').replace(/\D/g,'');if(v.length!==8)return false;var w=[1,2,1,2,1,2,4,1],s=0;for(var i=0;i<8;i++){var p=+v[i]*w[i];s+=Math.floor(p/10)+p%10}return s%5===0||(v[6]==='7'&&(s+1)%5===0)}
  function licOk(t,v){if(t!=='agency')return true;return /^交觀(甲|乙|綜)\s*\d{3,5}$/.test(String(v||'').trim())}
  function F(){return S.ga31=S.ga31||{type:'agency'}}
  window.kgmGaSetR1103A=function(k,v){F()[k]=v};
  function form(){var f=F(),u=me(),st='none';try{st=window.kgmGrpAcctStateR1026C?window.kgmGrpAcctStateR1026C():'none'}catch(_){}var x=u&&u.groupAccountR1025B;
    if(st==='pending')return '<section class="k31ga"><header><small>GROUP ACCOUNT</small><h2>'+(z()?'團體帳號審核中':'Under review')+'</h2></header><p class="k31ga-n">'+(z()?'申請編號 '+E((x&&x.caseNo)||'')+'。KGM 團體業務會核對公司登記、執照與聯絡人資料，通常 3 個工作天內以 email 通知結果；有疑問會先聯絡您。':'We will email you within 3 business days.')+'</p>'+(x&&x.appR1103A?'<dl class="k31ga-dl">'+summary(x)+'</dl>':'')+'</section>';
    var rej=x&&x.status==='rejected';
    var sel=function(k,list,ph){return '<select class="inp" onchange="kgmGaSetR1103A(\''+k+'\',this.value)"><option value="">'+(ph||'—')+'</option>'+list.map(function(o){return '<option value="'+o[0]+'"'+(f[k]===o[0]?' selected':'')+'>'+E(o[1])+'</option>'}).join('')+'</select>'};
    var inp=function(k,ph,t){return '<input class="inp" type="'+(t||'text')+'" value="'+E(f[k]||'')+'" placeholder="'+E(ph||'')+'" oninput="kgmGaSetR1103A(\''+k+'\',this.value)">'};
    var row=function(lab,html,req,w){return '<label class="'+(w?'w':'')+'"><span>'+lab+(req?' <i>*</i>':'')+'</span>'+html+'</label>'};
    return '<section class="k31ga"><header><small>GROUP ACCOUNT · APPLICATION</small><h2>'+(z()?'申請團體帳號':'Apply for a group account')+'</h2><p>'+(z()?'團體訂位（10–99 位、團體票 G）只開放給審核通過的旅行社、企業、學校與團體。請填寫真實資料；KGM 會核對公司登記、旅行業執照與負責人、聯絡人身分，資料不實者撤銷帳號。':'Group fares are available to approved organisations only.')+'</p></header>'
      +(rej?'<p class="k31ga-warn">'+(z()?'上次申請未通過：'+E(x.rejectReasonR1103A||'資料不完整')+'。請更正後重新送出。':'Previous application rejected.')+'</p>':'')
      +'<div class="k31ga-g">'
      +row(z()?'團體類型':'Type',sel('type',[['agency',z()?'旅行社':'Travel agency'],['corp',z()?'企業／獎勵旅遊':'Corporate'],['school',z()?'學校／遊學':'School'],['other',z()?'其他團體':'Other']]),1)
      +row(z()?'公司／團體名稱':'Organisation',inp('company'),1)
      +row(z()?'統一編號':'Tax ID',inp('taxId','8 碼'),1)
      +row(z()?'旅行業執照字號':'Travel licence',inp('license',z()?'例：交觀甲 1234（旅行社必填）':'agencies'),f.type==='agency')
      +row(z()?'品保協會會員編號':'TQAA no.',inp('tqaa',z()?'旅行社選填':''),0)
      +row(z()?'登記國家':'Registered in',sel('country',NAT),1)
      +row(z()?'營業地址':'Address',inp('addr'),1,1)
      +row(z()?'負責人姓名':'Representative',inp('owner'),1)
      +row(z()?'負責人國籍':'Representative nationality',sel('ownerNat',NAT),1)
      +row(z()?'聯絡人姓名':'Contact',inp('contact',(u&&u.name)||''),1)
      +row(z()?'聯絡人國籍':'Contact nationality',sel('contactNat',NAT),1)
      +row(z()?'聯絡電話':'Phone',inp('phone'),1)
      +row(z()?'公司 email':'Company email',inp('email',(u&&u.email)||'','email'),1)
      +row(z()?'預估年度出團數':'Groups per year',sel('volume',[['1-5','1–5'],['6-20','6–20'],['21-50','21–50'],['51+','51+']]),1)
      +row(z()?'主要目的地':'Main destinations',inp('dests',z()?'例：日本、泰國':''),0)
      +row(z()?'申請說明':'Notes',inp('reason',z()?'主要客群、出團型態等':''),0,1)
      +'</div><label class="k31ga-ck"><input type="checkbox"'+(f.agree?' checked':'')+' onchange="kgmGaSetR1103A(\'agree\',this.checked)"> '+(z()?'我已閱讀並同意《團體旅客運送規定》KGM-GRP-021（團體票 G：開票後不能改期、不退票價），並保證以上資料屬實。':'I agree to KGM-GRP-021 and confirm the information is true.')+'</label>'
      +(f.err?'<p class="k31ga-warn">'+E(f.err)+'</p>':'')
      +'<button class="k31ga-go" onclick="kgmGaSubmitR1103A()">'+(z()?'送出申請':'Submit application')+'</button></section>'}
  function summary(x){var a=x.appR1103A||{};return [[z()?'公司':'Org',x.company],[z()?'統編':'Tax ID',x.taxId],[z()?'執照':'Licence',x.license||'—'],[z()?'登記國家':'Country',natName(a.country)],[z()?'負責人':'Representative',(a.owner||'')+'（'+natName(a.ownerNat)+'）'],[z()?'聯絡人':'Contact',((x.contact||{}).name||'')+'（'+natName(a.contactNat)+'）'],[z()?'電話／email':'Phone / email',((x.contact||{}).phone||'')+' · '+((x.contact||{}).email||'')],[z()?'地址':'Address',a.addr||''],[z()?'年度出團':'Volume',a.volume||''],[z()?'目的地':'Destinations',a.dests||'—']].map(function(r){return '<dt>'+E(r[0])+'</dt><dd>'+E(r[1])+'</dd>'}).join('')}
  function cno(){return 'GA'+T().replace(/-/g,'').slice(2)+String(Math.floor(Math.random()*9000)+1000)}
  window.kgmGaSubmitR1103A=function(){var f=F(),u=me();f.err='';if(!u){f.err=z()?'請先登入會員。':'Please log in.';try{render()}catch(_){}return}
    var need=['type','company','taxId','country','addr','owner','ownerNat','contact','contactNat','phone','email','volume'];if(f.type==='agency')need.push('license');
    var miss=need.filter(function(k){return !String(f[k]||'').trim()});if(miss.length){f.err=z()?'請把標 * 的欄位填完整。':'Please complete required fields.';try{render()}catch(_){}return}
    if(!ubnOk(f.taxId)){f.err=z()?'統一編號檢查碼不符，請確認。':'Invalid tax ID.';try{render()}catch(_){}return}
    if(!licOk(f.type,f.license)){f.err=z()?'旅行業執照字號格式應為「交觀甲／乙／綜 + 數字」。':'Licence format.';try{render()}catch(_){}return}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)){f.err=z()?'email 格式不正確。':'Invalid email.';try{render()}catch(_){}return}
    if(!f.agree){f.err=z()?'請勾選同意團體規定並保證資料屬實。':'Please accept the terms.';try{render()}catch(_){}return}
    var now=new Date().toISOString();
    u.groupAccountR1025B={status:'pending',type:f.type,company:String(f.company).trim(),taxId:String(f.taxId).replace(/\D/g,''),license:String(f.license||'').trim(),contact:{name:f.contact,phone:f.phone,email:f.email},caseNo:cno(),boundAt:now,
      appR1103A:{country:f.country,addr:f.addr,owner:f.owner,ownerNat:f.ownerNat,contactNat:f.contactNat,volume:f.volume,dests:f.dests||'',reason:f.reason||'',tqaa:f.tqaa||'',at:now,memberNat:u.nationality||u.nat||''}};
    try{if(S.user&&S.user!==u&&S.user.id===u.id)S.user.groupAccountR1025B=u.groupAccountR1025B}catch(_){}
    S.ga31={type:'agency'};try{logAct(z()?'團體帳號申請':'Group account application',u.groupAccountR1025B.company+' · '+u.groupAccountR1025B.caseNo)}catch(_){}try{save()}catch(_){}try{render()}catch(_){}};
  /* 前台 AI 客服：不再自己收資料、自己開通（1026C 舊流程會直接開通一年）→ 一律引導到團體訂位頁的申請表，由後台人工審核 */
  window.kgmGaAiMsgR1103A=function(){var x=(me()||{}).groupAccountR1025B;
    if(x&&x.status==='pending')return z()?('您的團體帳號申請（編號 '+(x.caseNo||'')+'，'+(x.company||'')+'）已收到，正由 KGM 團體業務人工審核（公司登記、旅行業執照、負責人與聯絡人國籍），通常 3 個工作天內以 email 通知結果。審核通過前不能訂團體票。'):'Your application is under review; we will email you within 3 business days.';
    if(x&&x.status==='rejected')return z()?('您上次的團體帳號申請未通過'+(x.rejectReasonR1103A?'（'+x.rejectReasonR1103A+'）':'')+'。請到選單「優惠與訂票 › 團體訂位」更正資料後重新送出申請表。'):'Your previous application was not approved; please correct it and resubmit on the Group booking page.';
    return z()?'團體訂位（10–99 位、團體票 G）要先申請團體帳號，並由 KGM 團體業務人工審核通過：\n1. 選單「優惠與訂票 › 團體訂位」填寫申請表（公司名稱、統一編號、旅行業執照、負責人與聯絡人國籍、預估出團數等）。\n2. 送出後通常 3 個工作天內以 email 通知結果；首次通過有 90 天試用期（每團最多 40 位、同時最多 3 團）。\nAI 客服不能直接開通團體帳號。':'Group bookings need an approved group account. Please submit the application form on the Group booking page; our group desk reviews it within 3 business days.'};
  /* 團體訂位頁：沒有帳號／被退回／審核中 → 申請表放最上面 */
  function host(){var app=document.getElementById('app');if(!app)return null;var h=null;[].slice.call(app.children).forEach(function(n){if(!h&&n.tagName==='DIV'&&n.id!=='aiChat')h=n});return h}
  function paint(){try{if(S.view!=='group23'||!S.user)return;var st=window.kgmGrpAcctStateR1026C?window.kgmGrpAcctStateR1026C():'none',x=(me()||{}).groupAccountR1025B;
      if(!(st==='none'||st==='pending'||(x&&x.status==='rejected')))return;var h=host();if(!h||h.querySelector('.k31ga,.k31ga-in'))return;
      /* 審核中：原本的團體頁已經有「申請審核中」卡（文字改成人工審核，gen_r28 'ga31 hero pending'）→ 只把申請資料摘要接在那張卡裡，不再多一張重複的卡 */
      var bc=st==='pending'&&h.querySelector('.k25bind-c');if(bc){var lf=h.querySelector('.k25bind > div:first-child');
        if(lf&&!lf.querySelector('.k31ga-st')){var ol=document.createElement('ol');ol.className='k31ga-st';ol.innerHTML=[[1,z()?'送出申請':'Applied',x&&x.boundAt?String(x.boundAt).slice(0,10):''],[2,z()?'團體業務人工審核':'Manual review',z()?'約 3 個工作天':'~3 business days'],[3,z()?'試用 90 天':'90-day trial',z()?'每團 ≤40 位、同時 ≤3 團':'≤40 pax, ≤3 groups'],[4,z()?'正式團體帳號':'Full account',z()?'依審核設定的開放期間':'per approved period']].map(function(r,i){return '<li class="'+(i===0?'ok':i===1?'now':'')+'"><b>'+(i===0?'✓':r[0])+'</b><span>'+E(r[1])+'<small>'+E(r[2])+'</small></span></li>'}).join('');lf.appendChild(ol)}if(x&&x.appR1103A){var dl=document.createElement('dl');dl.className='k31ga-dl k31ga-in';dl.innerHTML=summary(x);bc.appendChild(dl)}else{var sp=document.createElement('i');sp.className='k31ga-in';sp.style.display='none';bc.appendChild(sp)}return}var k=h.querySelector('.k25g');var d=document.createElement('div');d.innerHTML=form();if(k&&k.parentNode)k.parentNode.insertBefore(d.firstChild,k.nextSibling);else h.insertBefore(d.firstChild,h.firstChild)}catch(e){try{console.warn('ga31',e)}catch(_){}}}
  function hook(){var r0=window.render;if(typeof r0==='function'&&!r0.__ga31){var w=function(){var r=r0.apply(this,arguments);paint();admin();return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__ga31=1;window.render=w;try{render=w}catch(_){}}
    var O=window.kgmGrpApproveR1026C;if(typeof O==='function'&&!O.__ga31){var a=function(uid,from,to){var u=(S.users||[]).filter(function(q){return q&&q.id===uid})[0],x=u&&u.groupAccountR1025B;if(!x)return false;
        var rv=x.reviewR1103A||{};if(!rv.done){S.ga31Rev={uid:uid,from:from||T(),to:to||'',ck:{}};try{render()}catch(_){}return false}return O.apply(this,arguments)};a.__ga31=1;window.kgmGrpApproveR1026C=a}
    var P=window.kgmGrpPickR1101A;if(typeof P==='function'&&!P.__ga31){var p=function(k,how){var u=me(),x=u&&u.groupAccountR1025B,tr=x&&x.trialR1103A;
        if(tr&&T()<=tr.until){var s=S.search||{},px=+(s.grpPax25||0)||((+s.adults||0)+(+s.children||0));if(px>tr.maxPax){alert(z()?('試用期間（至 '+tr.until+'）每團最多 '+tr.maxPax+' 位；請減少人數或聯絡 KGM 團體業務。'):'Trial limit.');return}
          var ym=T().slice(0,7),n=(S.groupsR1023A||[]).filter(function(g){return g&&g.userId===u.id&&String(g.createdAt||g.at||'').slice(0,7)===ym&&!/cancel/.test(g.status||'')}).length;if(n>=tr.maxGroups){alert(z()?('試用期間每月最多 '+tr.maxGroups+' 團，本月已 '+n+' 團。'):'Monthly trial limit.');return}}
        return P.apply(this,arguments)};p.__ga31=1;window.kgmGrpPickR1101A=p}}
  hook();setTimeout(hook,0);setTimeout(hook,3000);setTimeout(hook,12000);
  /* ── ③ 後台審核視窗 ── */
  function flags(u,x){var a=x.appR1103A||{},F0=[];var em=((x.contact||{}).email)||u.email||'';
    if(!ubnOk(x.taxId))F0.push(['bad',z()?'統一編號檢查碼不符':'Tax ID checksum fails']);
    if(!licOk(x.type,x.license))F0.push(['bad',z()?'旅行社執照字號格式不符':'Licence format']);
    if(x.type==='agency'&&FREE.test(em))F0.push(['warn',z()?'旅行社使用免費信箱（'+em+'）':'Free email domain']);
    var mn=String(u.nationality||u.nat||a.memberNat||'').toUpperCase().slice(0,2);if(mn&&a.contactNat&&mn!==a.contactNat)F0.push(['warn',z()?'聯絡人國籍（'+natName(a.contactNat)+'）與會員資料（'+natName(mn)+'）不同':'Nationality mismatch']);
    if(HIGH[a.ownerNat]||HIGH[a.contactNat]||HIGH[a.country])F0.push(['high',z()?'高風險／受制裁國籍或登記國（'+[a.ownerNat,a.contactNat,a.country].filter(function(c){return HIGH[c]}).map(natName).join('、')+'）——需 CEO 核准':'High-risk nationality — CEO approval']);
    if(!x.appR1103A)F0.push(['warn',z()?'舊流程（AI 綁定）沒有填國籍、地址、負責人——請補問':'Legacy application: missing details']);
    if(a.volume==='51+')F0.push(['warn',z()?'申報年度出團 51 團以上：試用期滿前請確認實績':'High declared volume']);
    return F0}
  var CK=[['co',z()?'公司登記資料與統編相符（經濟部商工登記查詢）':'Company registry matches'],['lic',z()?'旅行業執照有效（交通部觀光署旅行業查詢）':'Licence valid'],['id',z()?'負責人、聯絡人身分與國籍已核對':'IDs & nationality checked'],['ct',z()?'電話、email 已回撥／回信確認':'Contact verified'],['tm',z()?'已說明團體票 G 規定（開票後不能改期、不退票價）':'Terms explained']];
  function admin(){try{var R=S.ga31Rev;var old=document.getElementById('k31ga-rev');if(!R||S.view!=='admin'){if(old)old.remove();return}
      var u=(S.users||[]).filter(function(q){return q&&q.id===R.uid})[0],x=u&&u.groupAccountR1025B;if(!x){S.ga31Rev=null;if(old)old.remove();return}
      var fl=flags(u,x),hi=fl.some(function(f){return f[0]==='high'}),bad=fl.some(function(f){return f[0]==='bad'}),role=(S.adminUser||{}).role,ceo=role==='ceo';
      var all=CK.every(function(c){return R.ck[c[0]]}),can=all&&!bad&&(!hi||ceo);
      var h='<div class="k31ga-mask"><div class="k31ga-dlg"><header><div><small>GROUP ACCOUNT REVIEW</small><h3>'+E(x.company)+'</h3><p>'+E(x.caseNo||'')+' · '+E(u.id)+'</p></div><button class="x" onclick="S.ga31Rev=null;render()">×</button></header>'
        +'<dl class="k31ga-dl">'+summary(x)+'</dl>'
        +'<div class="k31ga-fl">'+(fl.length?fl.map(function(f){return '<span class="'+f[0]+'">'+(f[0]==='high'?'⚠ ':f[0]==='bad'?'✕ ':'! ')+E(f[1])+'</span>'}).join(''):'<span class="ok">✓ '+(z()?'系統沒有發現異常':'No flags')+'</span>')+'</div>'
        +'<div class="k31ga-cks">'+CK.map(function(c){return '<label><input type="checkbox"'+(R.ck[c[0]]?' checked':'')+' onchange="S.ga31Rev.ck[\''+c[0]+'\']=this.checked;render()"> '+E(c[1])+'</label>'}).join('')+'</div>'
        +'<p class="k31ga-n">'+(z()?'核准後 90 天試用：每團最多 40 位、每月最多 3 團；期滿無違規自動解除。':'90-day trial: max 40 pax per group, 3 groups per month.')+(bad?'<br><b>'+(z()?'有資料錯誤（✕），不能核准。':'Fix errors first.')+'</b>':'')+(hi&&!ceo?'<br><b>'+(z()?'有高風險旗標，只有 CEO 可以核准。':'CEO approval required.')+'</b>':'')+'</p>'
        +'<label class="k31ga-rj">'+(z()?'退回原因':'Reject reason')+'<input class="inp" id="k31ga-rr" placeholder="'+(z()?'例：執照字號查無資料':'')+'"></label>'
        +'<div class="k31ga-acts"><button class="btn" onclick="kgmGaRejectR1103A()">'+(z()?'退回申請':'Reject')+'</button><button class="btn btn-g"'+(can?'':' disabled')+' onclick="kgmGaApproveR1103A()">'+(z()?'核准（開始試用）':'Approve (trial)')+'</button></div></div></div>';
      if(old)old.outerHTML=h.replace('<div class="k31ga-mask">','<div class="k31ga-mask" id="k31ga-rev">');else{var d=document.createElement('div');d.innerHTML=h.replace('<div class="k31ga-mask">','<div class="k31ga-mask" id="k31ga-rev">');document.body.appendChild(d.firstChild)}}catch(e){try{console.warn('ga31 rev',e)}catch(_){}}}
  window.kgmGaApproveR1103A=function(){var R=S.ga31Rev;if(!R)return;var u=(S.users||[]).filter(function(q){return q&&q.id===R.uid})[0],x=u&&u.groupAccountR1025B;if(!x)return;
    var fl=flags(u,x);if(fl.some(function(f){return f[0]==='bad'}))return;if(fl.some(function(f){return f[0]==='high'})&&((S.adminUser||{}).role!=='ceo'))return;if(!CK.every(function(c){return R.ck[c[0]]}))return;
    var by=(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'';x.reviewR1103A={done:true,ck:Object.assign({},R.ck),flags:fl.map(function(f){return f[1]}),by:by,role:(S.adminUser||{}).role||'',at:new Date().toISOString()};
    x.trialR1103A={until:AD(T(),90),maxPax:40,maxGroups:3};S.ga31Rev=null;window.kgmGrpApproveR1026C(R.uid,R.from,R.to)};
  window.kgmGaRejectR1103A=function(){var R=S.ga31Rev;if(!R)return;var u=(S.users||[]).filter(function(q){return q&&q.id===R.uid})[0],x=u&&u.groupAccountR1025B;if(!x)return;var why=String((document.getElementById('k31ga-rr')||{}).value||'').trim();if(!why){alert(z()?'請填退回原因。':'Enter a reason.');return}
    x.status='rejected';x.rejectReasonR1103A=why;x.rejectedAt=new Date().toISOString();x.rejectedBy=(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'';
    try{if(typeof kgmNotify==='function')Promise.resolve(kgmNotify('group.account_bound',{email:u.email||((x.contact||{}).email)||'',name:(x.contact||{}).name||'',caseNo:x.caseNo||'',message:(z()?'您的團體帳號申請未通過：'+why+'。更正後可重新申請。':'Application rejected: '+why)})).catch(function(){})}catch(_){}
    try{logAct(z()?'團體帳號退回':'Group account rejected',x.company+' · '+why)}catch(_){}S.ga31Rev=null;try{save()}catch(_){}try{render()}catch(_){}};
  try{var css=document.createElement('style');css.textContent=[
    '.k31ga{max-width:1080px;margin:18px auto;background:#fff;border:1px solid #e6e0d2;border-radius:16px;padding:20px 22px}.k31ga header small{font-size:10.5px;letter-spacing:.18em;color:#a08a5c;font-weight:800}.k31ga h2{margin:4px 0 6px;font:700 22px Georgia,serif;color:#0b3b30}.k31ga header p{margin:0 0 12px;color:#5d665f;font-size:13px;line-height:1.6}',
    '.k31ga-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 14px}.k31ga-g label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700;color:#6b645a}.k31ga-g label.w{grid-column:span 2}.k31ga-g label i{color:#9b2d17;font-style:normal}.k31ga-g .inp{height:38px}@media(max-width:760px){.k31ga-g{grid-template-columns:1fr}.k31ga-g label.w{grid-column:auto}}',
    '.k31ga-ck{display:flex;gap:8px;align-items:flex-start;margin:14px 0 6px;font-size:12.5px;color:#3c3a35;line-height:1.5}.k31ga-go{height:42px;padding:0 26px;border:0;border-radius:11px;background:#0b3b30;color:#fff;font-weight:800;cursor:pointer;margin-top:8px}',
    '.k31ga-warn{background:#fbe6e0;color:#9b2d17;border-radius:9px;padding:8px 12px;font-size:12.5px}.k31ga-n{font-size:12px;color:#6b645a;line-height:1.6}.k31ga-dl{display:grid;grid-template-columns:110px 1fr;gap:5px 12px;font-size:12.5px;margin:8px 0}.k31ga-dl dt{color:#8a8175}.k31ga-dl dd{margin:0;color:#1d2622}.k31ga-in{border-top:1px solid rgba(0,0,0,.08);padding-top:10px;margin-top:10px;text-align:left}.k31ga-st{list-style:none;margin:26px 0 0;padding:0;display:grid;gap:14px;max-width:340px}.k31ga-st li{display:flex;gap:12px;align-items:flex-start;color:rgba(255,255,255,.6)}.k31ga-st li b{flex:0 0 26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:12px}.k31ga-st li span{display:flex;flex-direction:column;font-size:13.5px;line-height:1.35}.k31ga-st li small{font-size:11.5px;opacity:.75;margin-top:2px}.k31ga-st li.ok{color:#fff}.k31ga-st li.ok b{background:#c9a24a;border-color:#c9a24a;color:#123}.k31ga-st li.now{color:#fff}.k31ga-st li.now b{border-color:#c9a24a;color:#e7c97a;box-shadow:0 0 0 3px rgba(201,162,74,.25)}',
    '.k31ga-mask{position:fixed;inset:0;z-index:9000;background:rgba(10,24,20,.45);display:flex;align-items:center;justify-content:center;padding:20px}.k31ga-dlg{width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:16px;padding:20px 22px;box-shadow:0 24px 60px rgba(0,0,0,.25)}',
    '.k31ga-dlg header{display:flex;justify-content:space-between;align-items:flex-start}.k31ga-dlg header small{font-size:10px;letter-spacing:.16em;color:#a08a5c;font-weight:800}.k31ga-dlg h3{margin:2px 0;font-size:19px;color:#0b3b30}.k31ga-dlg header p{margin:0;font-size:12px;color:#8a8175}.k31ga-dlg .x{border:0;background:#f2efe7;border-radius:8px;width:30px;height:30px;cursor:pointer}',
    '.k31ga-fl{display:flex;flex-direction:column;gap:5px;margin:10px 0}.k31ga-fl span{font-size:12.5px;padding:6px 10px;border-radius:8px;background:#fdf3d8;color:#7a5608}.k31ga-fl .bad{background:#fbe6e0;color:#9b2d17}.k31ga-fl .high{background:#9b2d17;color:#fff;font-weight:800}.k31ga-fl .ok{background:#e7f4ec;color:#1f6f4a}',
    '.k31ga-cks{display:flex;flex-direction:column;gap:6px;margin:10px 0;padding:10px 12px;background:#faf8f3;border-radius:10px}.k31ga-cks label{font-size:12.5px;display:flex;gap:8px;align-items:center}.k31ga-rj{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700;color:#6b645a;margin:8px 0}',
    '.k31ga-acts{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}.k31ga-acts .btn[disabled]{opacity:.45;cursor:not-allowed}',
    /* 團體票 G 卡（前置視窗） */
    '.k31g-card{display:flex;gap:16px;border:1px solid #d8e5dd;border-radius:14px;padding:14px 16px;margin:6px 0 16px;background:linear-gradient(180deg,#fbfdfb,#f4f8f5)}.k31g-badge{width:64px;height:64px;flex:none;border-radius:14px;background:#0b3b30;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}.k31g-badge b{font:800 28px Georgia,serif;line-height:1}.k31g-badge span{font-size:9.5px;letter-spacing:.14em;opacity:.85}',
    '.k31g-body h4{margin:0 0 8px;font-size:14.5px;color:#0b3b30}.k31g-rules{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px 18px}.k31g-rules li{display:flex;gap:8px;font-size:12.5px;line-height:1.5}.k31g-rules b{flex:none;width:82px;color:#6b645a;font-weight:700}.k31g-rules span{color:#1d2622}.k31g-n{margin:8px 0 0;font-size:11.5px;color:#8a8175}@media(max-width:760px){.k31g-rules{grid-template-columns:1fr}}'
  ].join('');document.head.appendChild(css)}catch(_){}
})();
