
/* ══ 1101A：案件與寵物同行（使用者 Round 1～2）══════════════════════════════════════════
   「要加入寵物搭機申請（上排要有地方加入按鈕然後 AI 也要可以 Work），後台一樣放在案件編號處理那裡，航班資料要顯示哪個旅客有申請寵物或是 DH」
   「寵物有分可帶上飛機和不可，這方面要確認好規矩（參照現在航空公司）」
   「旅客端也要可以創立案件在上排其中一處，選擇類別等等；用戶端要可以 attach files，後台也要可以下載」
   「案件那裡要兩個 tab：一個是退票退費相關（需要到 CEO），一般的其他（團體改名等等）放到其他；需要 Assign to CEO 做最後審核，顯示 CEO 待審核；
    這也要隨時 simulate（包含客服處理案件）」「案件要寫哪個航班 eg CX531 (KX9921) TPE-HKG」
   · 寵物規則：KGM-PET-022（規章彙編同一份），kgmPetRulesR1101A／kgmPetCheckR1101A 是唯一來源，前台表單、後台審核、AI 回答都讀它。
   · 申請與旅客自建案件都存進 S.staffCasesR1007A（跟地勤／客服建立的案件同一份 → 案件處理中心、案件查詢、前後台同步都照舊）；
     附件檔案本體放 IndexedDB（kgm28_files），案件只記檔名／大小／編號（localStorage 放不下檔案）。同一個瀏覽器的前後台分頁都讀得到。
   · 核准的寵物寫在訂位 b.petsR1101A（[{seg,key,mode,species,...}]），航班資料名單讀它標「寵物」。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function tz(a){try{return (TZ&&TZ[a]!=null)?TZ[a]:8}catch(_){return 8}}
  function hm(s){var m=/(\d{1,2}):(\d{2})/.exec(String(s||''));return m?(+m[1]*60+ +m[2]):0}
  function cityN(a){try{return (typeof CITY==='function'&&CITY(a))||a}catch(_){return a}}
  /* ── 規則 KGM-PET-022 ─────────────────────────────────────────────── */
  var R={
    cabinKg:8,carrier:[45,35,20],holdKg:45,kennel:[122,81,89],minWeeks:16,cabinPerFlight:2,holdPerFlight:3,holdSmallAc:2,
    cabinOk:['Economy','Premium'],applyCabinH:48,applyHoldH:72,
    fee:{cabin:[3000,6000],hold:[5000,10000]},
    cargoOnly:{LHR:'英國',SYD:'澳洲',MEL:'澳洲',BNE:'澳洲',PER:'澳洲',AKL:'紐西蘭',CHC:'紐西蘭',HNL:'夏威夷',HKG:'香港',AUH:'阿聯',DXB:'阿聯'},
    snub:['巴哥 Pug','法國鬥牛犬 French Bulldog','英國鬥牛犬 English Bulldog','波士頓㹴 Boston Terrier','西施 Shih Tzu','北京犬 Pekingese','拳師犬 Boxer','騎士查理王小獵犬 Cavalier King Charles','鬥牛獒 Bullmastiff','沙皮狗 Shar Pei','日本狆 Japanese Chin','波斯貓 Persian','喜馬拉雅貓 Himalayan','異國短毛貓 Exotic Shorthair','英國短毛貓 British Shorthair','蘇格蘭摺耳貓 Scottish Fold']
  };
  window.kgmPetRulesR1101A=R;
  function blockMin(f){var d=hm(f.dep)-tz(f.fr)*60,a=hm(f.arr)+(+f.dd||0)*1440-tz(f.to)*60;var m=a-d;while(m<0)m+=1440;return m}
  function segsOf(b){try{if(window.segs7)return (window.segs7(b,true)||[]).map(function(s){return {key:s.key,f:Object.assign({},s.f||s,{date:s.date||(s.f||{}).date})}})}catch(_){}
    var o=[];if(b.outF)o.push({key:'out',f:b.outF});if(b.inbF)o.push({key:'inb',f:b.inbF});return o}
  function cabOf(b,key){try{var c=((b.segmentFare0826A||{})[key])||(key==='inb'?b.inbC:b.outC);return ((FARES[c]||{}).cabin)||'Economy'}catch(_){return 'Economy'}}
  function petsOn(f,date){var n={cabin:0,hold:0};(S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled')return;(b.petsR1101A||[]).forEach(function(p){if(p.code===f.code&&p.date===date&&p.mode!=='service')n[p.mode]=(n[p.mode]||0)+1})});return n}
  /* 一段航程的判斷：回傳 {ok,mode,fee,why[],warn[]} */
  window.kgmPetCheckR1101A=function(b,key,pet){
    var zh=z(),s=segsOf(b).filter(function(x){return x.key===key})[0],why=[],warn=[];if(!s)return {ok:false,why:[zh?'找不到這個航段。':'Segment not found.']};
    var f=s.f,date=f.date,cab=cabOf(b,key),mode=pet.mode||'cabin',kg=+pet.kg||0,sp=pet.species||'dog',lh=blockMin(f)>360;
    if(sp==='service'){mode='service'}
    if(f.partner||/^KX9\d{3}$/.test(f.code||''))why.push(zh?'夥伴航空營運的航段依該航空公司規定，請直接向營運航空申請。':'Partner-operated: apply with the operating airline.');
    if(sp!=='dog'&&sp!=='cat'&&sp!=='service')why.push(zh?'只受理貓、狗（及受過訓練的服務犬）。':'Only cats and dogs are accepted.');
    if(sp==='service'){if(!pet.docs)why.push(zh?'服務犬需附訓練機構證明、狂犬病疫苗紀錄與目的地入境許可。':'Service dogs need training and vaccination documents.')}
    else{
      var aps=[f.fr,f.to];segsOf(b).forEach(function(x){aps.push(x.f.fr,x.f.to)});try{aps.push((b.outF||{}).to,(b.inbF||{}).to)}catch(_){}   /* 經停／來回：整趟行程碰到只收貨運的地方都算 */
      var cg='';aps.forEach(function(a){if(!cg&&R.cargoOnly[a])cg=R.cargoOnly[a]});if(cg)why.push(zh?(cg+'規定寵物只能以「貨運」入境／出境，不受理客艙或托運，請洽 KGM Cargo。'):('Cargo only for '+cg+'.'));
      if(+pet.weeks&&+pet.weeks<R.minWeeks)why.push(zh?'寵物需滿 16 週大。':'Pets must be at least 16 weeks old.');
      if(mode==='cabin'){
        if(R.cabinOk.indexOf(cab)<0)why.push(zh?'客艙寵物只限經濟艙、豪華經濟艙（商務艙、頭等艙平躺座椅前方沒有可放寵物箱的空間）。':'Cabin pets: Economy / Premium Economy only.');
        if(kg>R.cabinKg)why.push(zh?('寵物連同寵物袋超過 '+R.cabinKg+' 公斤，只能改為托運（貨艙）。'):'Over '+R.cabinKg+' kg: hold only.');
        var dm=String(pet.dims||'').match(/\d+/g)||[];if(dm.length>=3){dm=dm.slice(0,3).map(Number).sort(function(a,b){return b-a});var lim=R.carrier.slice().sort(function(a,b){return b-a});if(dm[0]>lim[0]||dm[1]>lim[1]||dm[2]>lim[2])why.push(zh?'寵物袋超過 45×35×20 公分，放不進前方座位下。':'Carrier exceeds 45×35×20 cm.')}
        if(petsOn(f,date).cabin>=R.cabinPerFlight)why.push(zh?'這一班客艙寵物名額（2 隻）已滿。':'Cabin pet quota full.');
      }else if(mode==='hold'){
        if(pet.snub)why.push(zh?'短鼻（扁臉）品種不受理托運（貨艙溫度與氣壓變化風險高）；體重符合可改客艙。':'Snub-nosed breeds are not accepted in the hold.');
        if(kg>R.holdKg)why.push(zh?('寵物連同運輸籠超過 '+R.holdKg+' 公斤，請洽 KGM Cargo。'):'Over '+R.holdKg+' kg.');
        var small=/A21N|A321|A339|A330/.test(String(f.acft||''));if(petsOn(f,date).hold>=(small?R.holdSmallAc:R.holdPerFlight))why.push(zh?'這一班貨艙寵物名額已滿。':'Hold pet quota full.');
        warn.push(zh?'起訖或轉機站預報氣溫高於 29°C 或低於 −10°C 時，當天可能無法托運。':'Hold transport may be refused in extreme temperatures.');
      }
      var h=(Date.parse(date+'T'+String(f.dep||'00:00')+':00Z')-tz(f.fr)*3600e3-Date.now())/3600e3,need=mode==='hold'?R.applyHoldH:R.applyCabinH;
      if(h<need)why.push(zh?('需在起飛前 '+need+' 小時提出申請。'):'Apply at least '+need+'h before departure.');
    }
    var fee=mode==='service'?0:R.fee[mode==='hold'?'hold':'cabin'][lh?1:0];
    return {ok:!why.length,mode:mode,fee:fee,lh:lh,cab:cab,why:why,warn:warn,f:f}};
  /* ── 附件：IndexedDB ─────────────────────────────────────────────── */
  function db(){return new Promise(function(res,rej){try{var r=indexedDB.open('kgm28_files',1);r.onupgradeneeded=function(){r.result.createObjectStore('f')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}}catch(e){rej(e)}})}
  function put(id,blob){return db().then(function(d){return new Promise(function(res,rej){var t=d.transaction('f','readwrite');t.objectStore('f').put(blob,id);t.oncomplete=function(){res(id)};t.onerror=function(){rej(t.error)}})})}
  function get(id){return db().then(function(d){return new Promise(function(res,rej){var q=d.transaction('f').objectStore('f').get(id);q.onsuccess=function(){res(q.result)};q.onerror=function(){rej(q.error)}})})}
  window.kgmCaseFileGetR1101A=function(id,name){get(id).then(function(bl){if(!bl){alert(z()?'這個檔案只存在上傳的那台裝置（本機瀏覽器），這台找不到。':'File not found on this device.');return}
    var u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=name||id;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},1500)}).catch(function(e){alert(String(e&&e.message||e))})};
  window.kgmCaseFilesHtmlR1101A=function(c){var fs=(c&&c.files)||[];if(!fs.length)return '';
    return '<div class="k7c-sub">'+(z()?'旅客附件':'Attachments')+'</div><ul class="k28-files">'+fs.map(function(f){return '<li><span class="ic">📎</span><b>'+E(f.name)+'</b><small>'+Math.max(1,Math.round((+f.size||0)/1024))+' KB</small>'
      +'<button type="button" class="btn btn-sm" onclick="kgmCaseFileGetR1101A(\''+A(f.id)+'\',\''+A(f.name)+'\')">'+(z()?'下載':'Download')+'</button></li>'}).join('')+'</ul>'};
  var PEND={};   /* 表單選好、還沒送出的檔案 */
  window.kgmCaseFilePickR1101A=function(inp,form){var fs=[].slice.call(inp.files||[]);PEND[form]=PEND[form]||[];var bad=[];
    fs.forEach(function(f){if(PEND[form].length>=3){bad.push(f.name+(z()?'（最多 3 個檔案）':' (max 3)'));return}if(f.size>5*1024*1024){bad.push(f.name+(z()?'（超過 5 MB）':' (>5 MB)'));return}PEND[form].push(f)});
    if(bad.length)alert((z()?'以下檔案沒有加入：\n':'Not added:\n')+bad.join('\n'));inp.value='';drawFiles(form)};
  window.kgmCaseFileDropR1101A=function(form,i){(PEND[form]||[]).splice(i,1);drawFiles(form)};
  function drawFiles(form){var el=document.getElementById('k28f-'+form);if(!el)return;el.innerHTML=(PEND[form]||[]).map(function(f,i){return '<li><span class="ic">📎</span><b>'+E(f.name)+'</b><small>'+Math.max(1,Math.round(f.size/1024))+' KB</small><button type="button" onclick="kgmCaseFileDropR1101A(\''+form+'\','+i+')" aria-label="remove">×</button></li>'}).join('')}
  function saveFiles(form,no){var fs=(PEND[form]||[]).slice();PEND[form]=[];return Promise.all(fs.map(function(f,i){var id=no+'-'+(i+1)+'-'+Date.now().toString(36);return put(id,f).then(function(){return {id:id,name:f.name,size:f.size,type:f.type}},function(){return null})})).then(function(l){return l.filter(Boolean)})}
  /* ── 共用：新增一件旅客案件（跟地勤／客服建立的同一種格式） ── */
  function caseNo(){var used={};(S.staffCasesR1007A||[]).forEach(function(c){used[c.caseNo]=1});var md=new Date().toISOString().slice(5,10).replace('-','')+String(new Date().getFullYear()).slice(2),n;do{n='KG'+String(1000+Math.floor(Math.random()*9000))+md+'M'}while(used[n]);return n}
  function addCase(rec){S.staffCasesR1007A=S.staffCasesR1007A||[];S.staffCasesR1007A.unshift(rec);
    S.notifs=S.notifs||[];S.notifs.unshift({title:(z()?'案件已送出 ':'Case submitted ')+rec.caseNo,message:(z()?'我們已收到您的「':'We received your "')+rec.typeLabelR1101A+(z()?'」，案件編號 '+rec.caseNo+'。處理進度可在「案件查詢」查看。':'", case '+rec.caseNo+'.'),date:T(),read:false,userId:rec.userId||null});
    try{if(window.kgmMailCaseOpenedR115&&rec.email)window.kgmMailCaseOpenedR115({id:rec.caseNo,pnr:rec.pnr,type:rec.typeLabelR1101A,email:rec.email})}catch(_){}
    try{save()}catch(_){}}
  function myBookings(){var u=S.user;if(!u)return [];return (S.bookings||[]).filter(function(b){return b&&b.pnr&&b.status!=='cancelled'&&(b.userId===u.id)})}
  function findBk(pnr,last){pnr=String(pnr||'').trim().toUpperCase();last=String(last||'').trim().toUpperCase();var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];
    if(!b)return null;if(S.user&&b.userId===S.user.id)return b;if(!last)return null;return (b.paxList||[]).some(function(p){return String(p.lastName||'').toUpperCase()===last})?b:null}
  /* ── 前台：寵物同行申請 ─────────────────────────────────────────── */
  function pf(){S.pet28=S.pet28||{pnr:'',last:'',key:'',species:'dog',mode:'cabin',kg:'',dims:'',weeks:'',breed:'',snub:false,name:'',docs:false,note:'',err:'',done:null};return S.pet28}
  window.kgmPetSetR1101A=function(k,v,re){var F=pf();F[k]=v;if(k==='breed')F.snub=R.snub.some(function(x){return String(v||'').toLowerCase().indexOf(x.split(' ')[0].toLowerCase())>=0||String(v||'').toLowerCase().indexOf((x.split(' ').slice(1).join(' ')||'@@').toLowerCase())>=0});if(re)render()};
  function petPage(){
    var zh=z(),F=pf(),b=F.pnr?findBk(F.pnr,F.last):null,mine=myBookings();
    if(F.done)return '<main class="k60 k28pet"><header class="k60-head"><span>TRAVEL WITH PETS</span><h1>'+(zh?'申請已送出':'Application submitted')+'</h1><p>'+(zh?'案件編號 ':'Case ')+'<b>'+E(F.done)+'</b>'+(zh?'。我們會在 1 個工作天內審核，核准後行程管理會顯示寵物同行，費用於機場櫃檯報到時支付。':'. We will review it within one business day.')+'</p></header>'
      +'<div class="k28pet-acts"><button class="k60-btn" onclick="S.pet28=null;render()">'+(zh?'再申請一筆':'New application')+'</button><button class="k60-btn ghost" onclick="S.view=\'case_lookup_0831B\';render()">'+(zh?'查詢案件進度':'Track case')+'</button></div></main>';
    var segs=b?segsOf(b):[];if(b&&!F.key&&segs[0])F.key=segs[0].key;
    var chk=b&&F.key?window.kgmPetCheckR1101A(b,F.key,F):null;
    var pick=mine.length?('<label>'+(zh?'選擇訂位':'Booking')+'<select class="inp" onchange="kgmPetSetR1101A(\'pnr\',this.value);kgmPetSetR1101A(\'key\',\'\',1)"><option value="">'+(zh?'— 請選擇 —':'— choose —')+'</option>'
      +mine.map(function(x){var f=x.outF||{};return '<option value="'+E(x.pnr)+'"'+(x.pnr===F.pnr?' selected':'')+'>'+E(x.pnr+'　'+(f.code||'')+' '+(f.fr||'')+'→'+(f.to||'')+'　'+(f.date||''))+'</option>'}).join('')+'</select></label>')
      :('<label>'+(zh?'訂位代號':'Booking reference')+'<input class="inp" value="'+E(F.pnr)+'" onchange="kgmPetSetR1101A(\'pnr\',this.value.trim().toUpperCase(),1)" style="text-transform:uppercase"></label>'
        +'<label>'+(zh?'旅客姓氏（英文）':'Last name')+'<input class="inp" value="'+E(F.last)+'" onchange="kgmPetSetR1101A(\'last\',this.value,1)" style="text-transform:uppercase"></label>');
    var opt=function(k,v,l){return '<button type="button" class="'+(F[k]===v?'on':'')+'" onclick="kgmPetSetR1101A(\''+k+'\',\''+v+'\',1)">'+l+'</button>'};
    var form=b?('<div class="k28pet-grid">'
        +'<label>'+(zh?'航段':'Segment')+'<select class="inp" onchange="kgmPetSetR1101A(\'key\',this.value,1)">'+segs.map(function(s){var f=s.f;return '<option value="'+E(s.key)+'"'+(s.key===F.key?' selected':'')+'>'+E((f.code||'')+'　'+f.fr+' → '+f.to+'　'+f.date+' '+(f.dep||''))+'</option>'}).join('')+'</select></label>'
        +'<label>'+(zh?'寵物名字':'Pet name')+'<input class="inp" value="'+E(F.name)+'" oninput="kgmPetSetR1101A(\'name\',this.value)"></label></div>'
      +'<div class="k28pet-sub">'+(zh?'寵物種類':'Animal')+'</div><div class="k28seg">'+opt('species','dog',zh?'🐕 狗':'🐕 Dog')+opt('species','cat',zh?'🐈 貓':'🐈 Cat')+opt('species','service',zh?'🦮 服務犬（免費）':'🦮 Service dog')+'</div>'
      +(F.species!=='service'?('<div class="k28pet-sub">'+(zh?'運送方式':'How the pet travels')+'</div><div class="k28seg">'+opt('mode','cabin',zh?'客艙（放前方座位下）':'In cabin (under seat)')+opt('mode','hold',zh?'托運（溫控貨艙）':'Checked (hold)')+'</div>'
        +'<div class="k28pet-grid3"><label>'+(zh?'品種':'Breed')+'<input class="inp" list="k28breeds" value="'+E(F.breed)+'" onchange="kgmPetSetR1101A(\'breed\',this.value,1)"><datalist id="k28breeds">'+R.snub.map(function(x){return '<option value="'+E(x)+'">'}).join('')+'</datalist></label>'
        +'<label>'+(zh?'寵物＋寵物袋／籠 重量（kg）':'Pet + carrier (kg)')+'<input class="inp" type="number" min="0" step="0.1" value="'+E(F.kg)+'" onchange="kgmPetSetR1101A(\'kg\',this.value,1)"></label>'
        +'<label>'+(zh?'年齡（週）':'Age (weeks)')+'<input class="inp" type="number" min="0" value="'+E(F.weeks)+'" onchange="kgmPetSetR1101A(\'weeks\',this.value,1)"></label>'
        +'<label>'+(zh?'寵物袋／籠尺寸（長×寬×高 cm）':'Carrier size (L×W×H cm)')+'<input class="inp" placeholder="45×35×20" value="'+E(F.dims)+'" onchange="kgmPetSetR1101A(\'dims\',this.value,1)"></label></div>'):'')
      +'<label class="k60-check"><input type="checkbox"'+(F.docs?' checked':'')+' onchange="kgmPetSetR1101A(\'docs\',this.checked,1)"> '+(zh?'我已備妥：10 天內的健康證明、狂犬病疫苗（施打滿 30 天且在有效期內）、晶片，以及目的地入境／檢疫文件':'I have the health certificate, rabies vaccination, microchip and entry documents')+'</label>'
      +'<div class="k28pet-sub">'+(zh?'上傳文件（健康證明、疫苗紀錄…，最多 3 個、每個 5 MB 內）':'Documents (max 3, 5 MB each)')+'</div><label class="k28-drop"><input type="file" multiple accept=".pdf,image/*" onchange="kgmCaseFilePickR1101A(this,\'pet\')"><span>'+(zh?'＋ 選擇檔案':'+ Choose files')+'</span></label><ul class="k28-files" id="k28f-pet"></ul>'
      +'<label>'+(zh?'其他說明':'Notes')+'<textarea class="inp" rows="2" oninput="kgmPetSetR1101A(\'note\',this.value)">'+E(F.note)+'</textarea></label>'
      +(chk?('<div class="k28pet-res '+(chk.ok?'ok':'no')+'">'+(chk.ok?('<b>✓ '+(zh?'符合規定':'Eligible')+'</b><span>'+(chk.mode==='service'?(zh?'服務犬免費，於客艙腳邊隨行。':'Service dogs travel free in the cabin.'):((zh?(chk.mode==='hold'?'托運（溫控貨艙）':'客艙')+'・'+(chk.lh?'長程':'短程')+'每段每隻 NT$':'Fee NT$')+chk.fee.toLocaleString()+(zh?'，機場櫃檯報到時支付':' at check-in')))+'</span>')
        :('<b>'+(zh?'目前不符合':'Not eligible yet')+'</b><ul>'+chk.why.map(function(w){return '<li>'+E(w)+'</li>'}).join('')+'</ul>'))
        +(chk.warn.length?'<small>'+chk.warn.map(E).join('　')+'</small>':'')+'</div>'):'')
      +(F.err?'<div class="k60-warn">'+E(F.err)+'</div>':'')
      +'<div class="k28pet-acts"><button class="k60-btn" '+(chk&&chk.ok?'':'disabled')+' onclick="kgmPetSubmitR1101A()">'+(zh?'送出申請':'Submit')+'</button></div>')
      :(F.pnr?'<div class="k60-warn">'+(zh?'查無此訂位，或姓氏不符。':'Booking not found.')+'</div>':'');
    return '<main class="k60 k28pet"><header class="k60-head"><span>TRAVEL WITH PETS</span><h1>'+(zh?'寵物同行申請':'Travel with your pet')+'</h1>'
      +'<p>'+(zh?'貓、狗可以在客艙（寵物連同寵物袋 8 公斤內、經濟／豪華經濟艙）或托運（溫控貨艙，45 公斤內、短鼻品種不受理）同行；英國、澳洲、紐西蘭、夏威夷、香港、阿聯只受理貨運。完整規定見 KGM-PET-022。':'Cats and dogs can travel in the cabin (up to 8 kg incl. carrier) or in the hold (up to 45 kg).')+'</p></header>'
      +rulesCard()+'<section class="k28pet-form">'+pick+form+'</section></main>';
  }
  function rulesCard(){var zh=z();return '<section class="k28pet-rules"><div><i>🧳</i><b>'+(zh?'客艙':'Cabin')+'</b><span>'+(zh?'貓、狗 · 寵物＋袋 ≤ 8 kg · 袋 ≤ 45×35×20 cm · 經濟／豪經 · 每班 2 隻 · 起飛前 48 小時申請':'≤ 8 kg incl. carrier')+'</span><em>NT$3,000／6,000</em></div>'
    +'<div><i>❄</i><b>'+(zh?'托運（溫控貨艙）':'Hold')+'</b><span>'+(zh?'寵物＋籠 ≤ 45 kg · IATA 硬殼籠 · 短鼻品種不受理 · 每班 3 隻（窄體／A330 2 隻）· 起飛前 72 小時申請':'≤ 45 kg, IATA kennel')+'</span><em>NT$5,000／10,000</em></div>'
    +'<div><i>🦮</i><b>'+(zh?'服務犬':'Service dogs')+'</b><span>'+(zh?'受過訓練的導盲／輔助犬 · 客艙腳邊 · 附訓練證明與入境許可；情緒支持動物不受理':'Trained assistance dogs only')+'</span><em>'+(zh?'免費':'Free')+'</em></div></section>'}
  window.kgmPetSubmitR1101A=function(){var zh=z(),F=pf(),b=findBk(F.pnr,F.last);if(!b){F.err=zh?'查無訂位。':'Booking not found.';render();return}
    var chk=window.kgmPetCheckR1101A(b,F.key,F);if(!chk.ok){F.err=chk.why.join(' ');render();return}
    var no=caseNo(),at=new Date().toISOString(),f=chk.f,p=(b.paxList||[])[0]||{};
    saveFiles('pet',no).then(function(files){
      var rec={caseNo:no,pnr:b.pnr,type:'pet',status:'received',priority:'normal',paxIndex:0,paxName:((p.lastName||'')+' / '+(p.firstName||'')).trim(),
        segment:{code:f.code,fr:f.fr,to:f.to,date:f.date,key:F.key},detail:(zh?'寵物同行申請：':'Pet travel: ')+({dog:zh?'狗':'dog',cat:zh?'貓':'cat',service:zh?'服務犬':'service dog'}[F.species])+(F.name?'「'+F.name+'」':'')+(F.breed?'・'+F.breed:'')+(F.kg?'・'+F.kg+' kg':'')+'・'+(chk.mode==='hold'?(zh?'托運':'hold'):chk.mode==='service'?(zh?'客艙（服務犬）':'cabin (service)'):(zh?'客艙':'cabin'))+(F.note?'。'+F.note:''),
        pet:{species:F.species,name:F.name,breed:F.breed,snub:!!F.snub,kg:+F.kg||0,dims:F.dims,weeks:+F.weeks||0,mode:chk.mode,fee:chk.fee,docs:!!F.docs},files:files,
        createdAt:at,updatedAt:at,by:{empId:'',name:p.firstName?(p.lastName+' '+p.firstName):'',role:'passenger'},assignee:{empId:'',name:''},userId:b.userId||(S.user&&S.user.id)||null,
        email:b.contactEmail||p.email||(S.user&&S.user.email)||'',typeLabelR1101A:zh?'寵物同行申請':'Pet travel application',paxR1101A:1,
        progress:[{at:at,status:'received',label:zh?'旅客線上申請（系統依 KGM-PET-022 預審通過）':'Submitted online',by:zh?'旅客':'Passenger'}],notes:[]};
      addCase(rec);F.done=no;render()})};
  /* ── 前台：建立客服案件 ─────────────────────────────────────────── */
  var PCT=['refund_req','bag_delayed','bag_lost','bag_damaged','item_lost','complaint','assistance','miles_claim','group_change','other'];
  function cf(){S.case28=S.case28||{pnr:'',last:'',type:'complaint',detail:'',key:'',err:'',done:null};return S.case28}
  window.kgmCaseSetR1101A=function(k,v,re){var F=cf();F[k]=v;if(re)render()};
  var PCL={refund_req:['退款申請','Refund request'],bag_delayed:['行李延誤','Delayed baggage'],bag_lost:['行李遺失','Lost baggage'],bag_damaged:['行李損壞','Damaged baggage'],item_lost:['遺失物品','Lost property'],
    complaint:['服務客訴','Service complaint'],assistance:['特殊協助','Special assistance'],miles_claim:['里程補登','Missing miles'],group_change:['團體改名／名單異動','Group name change'],other:['其他','Other'],pet:['寵物同行申請','Pet travel']};
  function caseLabel(k){var p=PCL[k];return p?(z()?p[0]:p[1]):k}
  function casePage(){var zh=z(),F=cf(),b=F.pnr?findBk(F.pnr,F.last):null,mine=myBookings();
    if(F.done)return '<main class="k60 k28pet"><header class="k60-head"><span>CUSTOMER CARE</span><h1>'+(zh?'案件已送出':'Case submitted')+'</h1><p>'+(zh?'案件編號 ':'Case ')+'<b>'+E(F.done)+'</b>'+(zh?'。專人會在 1 個工作天內回覆，進度會以 Email 與站內通知告訴您。':'.')+'</p></header><div class="k28pet-acts"><button class="k60-btn" onclick="S.case28=null;render()">'+(zh?'再建立一件':'New case')+'</button><button class="k60-btn ghost" onclick="S.view=\'case_lookup_0831B\';render()">'+(zh?'查詢案件進度':'Track case')+'</button></div></main>';
    var segs=b?segsOf(b):[];
    var pick=mine.length?('<label>'+(zh?'相關訂位':'Booking')+'<select class="inp" onchange="kgmCaseSetR1101A(\'pnr\',this.value,1)"><option value="">'+(zh?'— 請選擇 —':'— choose —')+'</option>'+mine.map(function(x){var f=x.outF||{};return '<option value="'+E(x.pnr)+'"'+(x.pnr===F.pnr?' selected':'')+'>'+E(x.pnr+'　'+(f.code||'')+' '+(f.fr||'')+'→'+(f.to||'')+'　'+(f.date||''))+'</option>'}).join('')+'</select></label>')
      :('<label>'+(zh?'訂位代號':'Booking reference')+'<input class="inp" value="'+E(F.pnr)+'" onchange="kgmCaseSetR1101A(\'pnr\',this.value.trim().toUpperCase(),1)" style="text-transform:uppercase"></label><label>'+(zh?'旅客姓氏（英文）':'Last name')+'<input class="inp" value="'+E(F.last)+'" onchange="kgmCaseSetR1101A(\'last\',this.value,1)" style="text-transform:uppercase"></label>');
    return '<main class="k60 k28pet"><header class="k60-head"><span>CUSTOMER CARE</span><h1>'+(zh?'建立客服案件':'Contact us')+'</h1><p>'+(zh?'行李、退款、客訴、特殊協助、里程補登、團體名單異動…選擇類別、描述狀況並附上照片或文件，案件會直接送到 KGM 客服中心。':'Choose a category, describe what happened and attach photos or documents.')+'</p></header>'
      +'<section class="k28pet-form"><div class="k28pet-grid">'+pick+'</div>'
      +(F.pnr&&!b?'<div class="k60-warn">'+(zh?'查無此訂位，或姓氏不符。':'Booking not found.')+'</div>':'')
      +(b&&segs.length?'<label>'+(zh?'相關航段':'Flight')+'<select class="inp" onchange="kgmCaseSetR1101A(\'key\',this.value)"><option value="">'+(zh?'整筆訂位':'Whole booking')+'</option>'+segs.map(function(s){var f=s.f;return '<option value="'+E(s.key)+'"'+(F.key===s.key?' selected':'')+'>'+E(window.kgmCaseFlightR1101A(f.code,f.fr,f.to,f.date))+'</option>'}).join('')+'</select></label>':'')
      +'<div class="k28pet-sub">'+(zh?'案件類別':'Category')+'</div><div class="k28cat">'+PCT.map(function(k){return '<button type="button" class="'+(F.type===k?'on':'')+'" onclick="kgmCaseSetR1101A(\'type\',\''+k+'\',1)">'+E(caseLabel(k))+'</button>'}).join('')+'<button type="button" onclick="S.view=\'pet28\';render()">🐾 '+(zh?'寵物同行（另有申請表）':'Travel with pets')+'</button></div>'
      +(F.type==='refund_req'?'<div class="k28pet-note">'+(zh?'退票退費案件會由客服初審後送執行長最後核准；一般取消退票也可在行程管理直接申請。':'Refund cases are approved by the CEO.')+'</div>':'')
      +'<label>'+(zh?'狀況說明':'What happened')+'<textarea class="inp" rows="5" oninput="kgmCaseSetR1101A(\'detail\',this.value)" placeholder="'+(zh?'例：抵達後行李未出現在轉盤，行李條 KX123456，深藍色 28 吋硬殼。':'')+'">'+E(F.detail)+'</textarea></label>'
      +'<div class="k28pet-sub">'+(zh?'附件（照片、收據、證明，最多 3 個、每個 5 MB 內）':'Attachments (max 3, 5 MB each)')+'</div><label class="k28-drop"><input type="file" multiple accept=".pdf,image/*,.doc,.docx" onchange="kgmCaseFilePickR1101A(this,\'case\')"><span>'+(zh?'＋ 選擇檔案':'+ Choose files')+'</span></label><ul class="k28-files" id="k28f-case"></ul>'
      +(F.err?'<div class="k60-warn">'+E(F.err)+'</div>':'')
      +'<div class="k28pet-acts"><button class="k60-btn" onclick="kgmCaseSubmitR1101A()">'+(zh?'送出案件':'Submit')+'</button></div></section></main>'}
  window.kgmCaseSubmitR1101A=function(){var zh=z(),F=cf(),b=findBk(F.pnr,F.last);
    if(!b){F.err=zh?'請先選擇或輸入正確的訂位。':'Choose a booking.';render();return}
    if(String(F.detail||'').trim().length<8){F.err=zh?'請把狀況寫清楚一點（至少 8 個字）。':'Please describe the issue.';render();return}
    var no=caseNo(),at=new Date().toISOString(),s=F.key?segsOf(b).filter(function(x){return x.key===F.key})[0]:null,f=s?s.f:(b.outF||{}),p=(b.paxList||[])[0]||{},type=F.type==='group_change'?'other':F.type;
    saveFiles('case',no).then(function(files){
      var rec={caseNo:no,pnr:b.pnr,type:type,status:'received',priority:/^bag_lost|assistance$/.test(type)?'urgent':'normal',paxIndex:0,paxName:((p.lastName||'')+' / '+(p.firstName||'')).trim(),
        segment:{code:f.code||'',fr:f.fr||'',to:f.to||'',date:f.date||''},detail:(F.type==='group_change'?(zh?'【團體改名／名單異動】':'[Group change] '):'')+String(F.detail).trim(),bag:null,files:files,
        createdAt:at,updatedAt:at,by:{empId:'',name:p.firstName?(p.lastName+' '+p.firstName):'',role:'passenger'},assignee:{empId:'',name:''},userId:b.userId||(S.user&&S.user.id)||null,
        email:b.contactEmail||p.email||(S.user&&S.user.email)||'',typeLabelR1101A:caseLabel(F.type),paxR1101A:1,
        progress:[{at:at,status:'received',label:zh?'旅客線上建立案件':'Opened online by passenger',by:zh?'旅客':'Passenger'}],notes:[]};
      addCase(rec);F.done=no;render()})};
  /* 前台頁面掛在內容區（路由表是 const，跟 0831B 案件查詢同一個做法） */
  function host(){var app=document.getElementById('app');if(!app)return null;var h=null;[].slice.call(app.children).forEach(function(n){if(!h&&n.tagName==='DIV'&&n.id!=='aiChat')h=n});return h}
  function paint(){try{if(S.view!=='pet28'&&S.view!=='case28')return;var h=host();if(!h)return;var html=S.view==='pet28'?petPage():casePage();h.innerHTML=html;
    drawFiles(S.view==='pet28'?'pet':'case')}catch(e){try{console.warn('cs28',e)}catch(_){}}}
  try{var r0=window.render;if(typeof r0==='function'&&!r0.__cs28){var w=function(){var r=r0.apply(this,arguments);paint();return r};w.__cs28=1;window.render=w;try{render=w}catch(_){}}}catch(_){}
  /* ── 前台 AI：寵物問題用同一份規則回答；說要申請（或給了訂位代號）就直接打開申請頁並帶入 ── */
  window.kgmPetAiR1101A=function(t){var zh=z(),U=String(t||'').toUpperCase(),pnr='';(U.match(/\b[A-Z0-9]{6}\b/g)||[]).some(function(x){if((S.bookings||[]).some(function(b){return b&&b.pnr===x})){pnr=x;return true}});
    var kg=+((/(\d+(?:\.\d+)?)\s*(?:公斤|kg|KG)/.exec(t)||[])[1]||0),sp=/貓|cat/i.test(t)?'cat':/服務犬|導盲|service/i.test(t)?'service':'dog';
    var base=zh?('KGM 寵物同行規定（KGM-PET-022）：\n· 客艙：貓、狗，寵物連同寵物袋 8 公斤內、袋子 45×35×20 公分內，限經濟艙／豪華經濟艙，每班 2 隻，起飛前 48 小時申請；短程 NT$3,000、長程 NT$6,000（每段每隻）。\n'
      +'· 托運（溫控貨艙）：寵物連同 IATA 硬殼籠 45 公斤內，短鼻（扁臉）品種不受理，每班 3 隻（窄體／A330 2 隻），起飛前 72 小時申請；短程 NT$5,000、長程 NT$10,000。\n'
      +'· 服務犬免費、客艙腳邊；情緒支持動物不受理。\n· 英國、澳洲、紐西蘭、夏威夷、香港、阿聯只受理貨運。\n· 需要：10 天內健康證明、狂犬病疫苗（滿 30 天）、晶片、目的地入境文件；寵物需滿 16 週。')
      :'KGM pet policy (KGM-PET-022): cabin up to 8 kg incl. carrier (Economy / Premium Economy), hold up to 45 kg in an IATA kennel, no snub-nosed breeds in the hold, service dogs free.';
    var extra='';if(pnr){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0],s0=segsOf(b)[0];if(s0){var c=window.kgmPetCheckR1101A(b,s0.key,{species:sp,mode:kg>R.cabinKg?'hold':'cabin',kg:kg,docs:true});
      extra='\n\n'+(zh?('您的訂位 '+pnr+'（'+s0.f.code+' '+s0.f.fr+'→'+s0.f.to+' '+s0.f.date+'）'+(c.ok?('可以申請'+(c.mode==='hold'?'托運':c.mode==='service'?'服務犬隨行':'客艙')+'，費用 NT$'+c.fee.toLocaleString()+'（櫃檯報到時支付）。'):('目前不符合：'+c.why.join(' ')))):(c.ok?'Eligible.':'Not eligible: '+c.why.join(' ')))}}
    if(pnr||/申請|我要帶|想帶|幫我|apply|bring/i.test(t)){S.pet28=null;var F=pf();F.pnr=pnr;F.species=sp;if(kg){F.kg=String(kg);F.mode=kg>R.cabinKg?'hold':'cabin'}
      setTimeout(function(){try{S.view='pet28';render();window.scrollTo(0,0)}catch(_){}},400);extra+=zh?'\n\n已幫您打開「寵物同行申請」頁'+(pnr?'並帶入訂位 '+pnr:'')+'，填好寵物資料、上傳證明就可以送出。':'\n\nI opened the pet application form for you.'}
    else extra+=zh?'\n\n要申請請說「我要申請寵物同行」（可附訂位代號），或從上方選單「行程管理 › 旅客服務 › 寵物同行申請」。':'';
    return base+extra};
  /* ── 航班顯示：夥伴營運寫「營運班號 (KX 班號) 起－迄」 ── */
  window.kgmCaseFlightR1101A=function(code,fr,to,date){try{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&(!fr||x.fr===fr)})[0]||{};
    var op=f.operatorFlight||f.op||f.opCode||'';return (op&&op!==code?op+' ('+code+')':code)+' '+(fr||f.fr||'')+'-'+(to||f.to||'')+(date?' '+String(date).slice(5):'')}catch(_){return code+' '+fr+'-'+to}};
  /* ── 案件分類：退票退費（需 CEO）／其他 ── */
  window.kgmCaseIsRefundR1101A=function(r){var k=String(r&&(r.typeKey||(r.raw||{}).type||'')||''),s=String(r&&r.source||'');return s==='refund'||s==='money'||/refund/.test(k)};
  /* ── 送 CEO 最後審核／CEO 決定（地勤／客服／旅客案件） ── */
  function rec(no){return (S.staffCasesR1007A||[]).filter(function(x){return x&&x.caseNo===no})[0]||null}
  function who(){var u=S.adminUser||{};return (u.name||u.empId||'')+(u.empId&&u.name?' ('+u.empId+')':'')}
  window.kgmCase28ToCeo=function(no){var c=rec(no);if(!c)return;var zh=z(),note=String((document.getElementById('k7cNote')||{}).value||(document.getElementById('k7cMsg')||{}).value||'').trim();
    var at=new Date().toISOString();c.status='ceo_review';c.updatedAt=at;c.progress.push({at:at,status:'ceo_review',label:zh?'客服初審完成，送執行長最後審核':'Sent to CEO for final review',note:note,by:who()});
    if(note){c.notes=c.notes||[];c.notes.unshift({at:at,by:who(),text:(zh?'送 CEO：':'To CEO: ')+note})}
    try{logAct(zh?'送 CEO 審核':'To CEO',c.caseNo)}catch(_){}try{save()}catch(_){}render()};
  window.kgmCase28Ceo=function(no,ok){var c=rec(no);if(!c)return;var zh=z(),msg=String((document.getElementById('k28CeoMsg')||{}).value||'').trim();
    if(!msg){alert(zh?'請寫給旅客的審核結果。':'Write the decision for the passenger.');return}
    var at=new Date().toISOString(),pet=c.type==='pet';
    if(ok&&pet){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===c.pnr})[0];if(b){b.petsR1101A=(b.petsR1101A||[]).filter(function(p){return p.caseNo!==c.caseNo});
      b.petsR1101A.push({caseNo:c.caseNo,key:(c.segment||{}).key||'out',code:(c.segment||{}).code,date:(c.segment||{}).date,fr:(c.segment||{}).fr,to:(c.segment||{}).to,mode:(c.pet||{}).mode,species:(c.pet||{}).species,name:(c.pet||{}).name,kg:(c.pet||{}).kg,fee:(c.pet||{}).fee,at:at})}}
    c.status=ok?'closed':'investigating';c.updatedAt=at;if(ok)c.closedAt=at;c.decisionR1101A={ok:!!ok,by:who(),at:at};
    c.progress.push({at:at,status:c.status,label:ok?(pet?(zh?'核准寵物同行':'Pet approved'):(zh?'執行長核准，結案':'Approved by CEO — closed')):(zh?'執行長退回，請客服補充':'Returned by CEO'),note:msg,by:who()});
    S.notifs=S.notifs||[];S.notifs.unshift({title:(zh?'案件審核結果 ':'Case decision ')+c.caseNo,message:msg,date:T(),read:false,userId:c.userId||null});
    try{if(typeof kgmNotify==='function'&&c.email&&!c.simR1022A&&!c.simR1101A)kgmNotify('case.updated',{email:c.email,caseNo:c.caseNo,pnr:c.pnr,status:c.status,subject:(zh?'案件審核結果 ':'Case decision ')+c.caseNo,message:msg,eventId:'r1101a-ceo:'+c.caseNo+':'+at}).catch(function(){})}catch(_){}
    try{logAct(ok?'CEO 核准案件':'CEO 退回案件',c.caseNo)}catch(_){}try{save()}catch(_){}render()};
  window.kgmCase28CeoActsR1101A=function(r){var zh=z(),ceo=false;try{ceo=String((S.adminUser||{}).role||'')==='ceo'||(S.adminUser||{}).empId==='MASTER'}catch(_){}
    if(!ceo)return '<div class="k7c-closed">⏳ '+(zh?'已送執行長最後審核，等待決定。':'Awaiting the CEO.')+'</div>';
    var c=rec(r.no)||{},pet=c.type==='pet';
    return '<div class="k7c-act"><div class="k7c-sub">'+(zh?'執行長最後審核':'CEO final review')+'</div>'
      +(pet&&c.pet?'<p class="k7c-text">'+E((zh?'寵物：':'Pet: ')+[c.pet.species,c.pet.breed,c.pet.kg?c.pet.kg+' kg':'',c.pet.mode,'NT$'+(+c.pet.fee||0).toLocaleString()].filter(Boolean).join('・'))+'</p>':'')
      +'<label class="k7c-full">'+(zh?'給旅客的審核結果（會寄 Email）':'Decision for the passenger')+'<textarea class="inp" rows="3" id="k28CeoMsg"></textarea></label>'
      +'<div class="k7c-btns"><button class="btn btn-g" onclick="kgmCase28Ceo(\''+A(r.no)+'\',true)">'+(pet?(zh?'核准寵物同行':'Approve pet'):(zh?'CEO 核准並結案':'Approve & close'))+'</button><button class="btn j-reject" onclick="kgmCase28Ceo(\''+A(r.no)+'\',false)">'+(zh?'退回客服':'Return')+'</button></div></div>'};
  /* 航班資料：這位旅客有核准的寵物 → 名字旁標「寵物」 */
  window.kgmPetTagR1101A=function(pnr,code,date){try{if(String(code).indexOf('|')>=0){var k9=String(code).split('|');code=k9[0];date=k9[1]}var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!b||!b.petsR1101A)return '';
    var p=b.petsR1101A.filter(function(x){return x.code===code&&x.date===date})[0];if(!p)return '';
    return '<span class="k28-pettag" title="'+E((p.name||'')+' '+(p.species||'')+' '+(p.kg||'')+'kg')+'">🐾 '+(p.mode==='hold'?(z()?'寵物托運':'Pet-hold'):p.mode==='service'?(z()?'服務犬':'Service dog'):(z()?'寵物客艙':'Pet-cabin'))+'</span>'}catch(_){return ''}};
  /* ── 持續模擬：後台開著時，每隔幾分鐘有新案件進來、客服把進行中的模擬案件往下處理一步（使用者：「這也要隨時 simulate，包含客服處理案件」） ── */
  var CSN=[['investigating','客服專員已聯繫旅客，正在向站點／合作單位查證'],['awaiting_customer','已請旅客補充資料（收據、照片或證明文件）'],['investigating','旅客已補件，進入審核'],['closed','處理完成，已回覆旅客並結案']];
  var tick=0;
  function simTick(){try{
    if(!S.adminAuthed||S.view!=='admin')return;if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<8000)return;
    var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
    tick++;var L=S.staffCasesR1007A||[],at=new Date().toISOString(),ch=0;
    /* 客服處理：挑一件最久沒動的模擬案件往下一步（退款類送 CEO，不自己結案） */
    var open=L.filter(function(c){return c&&(c.simR1022A||c.simR1101A)&&c.status!=='closed'&&c.status!=='ceo_review'}).sort(function(x,y){return String(x.updatedAt).localeCompare(String(y.updatedAt))});
    var c=open[0];if(c&&Date.now()-Date.parse(c.updatedAt||0)>20*60e3){
      var refund=/refund/.test(c.type||'');
      if(refund&&c.status!=='received'){c.status='ceo_review';c.progress.push({at:at,status:'ceo_review',label:'客服初審完成（附件齊全），送執行長最後審核',by:'客服中心（模擬）'})}
      else{var i=['received','investigating','awaiting_customer'].indexOf(c.status),nx=CSN[Math.min(CSN.length-1,i<0?0:i+(c.status==='awaiting_customer'?1:0))];
        if(c.type==='pet'&&nx[0]==='closed')nx=['ceo_review','客服確認文件齊全，送執行長核准'];c.status=nx[0];c.progress.push({at:at,status:nx[0],label:nx[1],by:'客服中心（模擬）'})}
      c.updatedAt=at;ch++}
    /* 新案件：大約每 3 次（約 6 分鐘）進一件 */
    if(tick%3===0&&window.kgmCaseSimR1022A){var keep=S.adminTab;var n0=L.length;try{var r0=window.render;window.render=function(){};window.kgmCaseSimR1022A(1);window.render=r0}catch(_){}
      if((S.staffCasesR1007A||[]).length>n0){var nc=S.staffCasesR1007A[0];if(nc){nc.simR1101A=1;nc.createdAt=at;nc.updatedAt=at;nc.status='received';nc.progress=[{at:at,status:'received',label:(nc.progress&&nc.progress[0]&&nc.progress[0].label)||'案件成立',by:nc.progress&&nc.progress[0]&&nc.progress[0].by||'客服中心'}]}ch++}S.adminTab=keep}
    if(ch){try{save()}catch(_){}if(S.adminTab==='cases0831B')try{(window.kgmSafeRenderR1026C||render)()}catch(_){}}
  }catch(e){try{console.warn('cs28 sim',e)}catch(_){}}}
  setInterval(simTick,120000);
  /* ── 樣式 ── */
  try{var cs=document.createElement('style');cs.id='k28cs-css';cs.textContent=
    '.k28pet{max-width:960px}.k28pet-rules{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 18px}'
   +'.k28pet-rules>div{background:#fff;border:1px solid rgba(11,58,46,.12);border-radius:16px;padding:16px 18px;display:grid;grid-template-columns:34px 1fr;column-gap:12px;row-gap:4px}'
   +'.k28pet-rules i{grid-row:span 3;width:34px;height:34px;border-radius:10px;background:#EEF4F0;display:flex;align-items:center;justify-content:center;font-style:normal}'
   +'.k28pet-rules b{color:#0B3D2E;font-size:14.5px}.k28pet-rules span{font-size:12px;color:#6B7570;line-height:1.6}.k28pet-rules em{font-style:normal;font:700 13px ui-monospace,monospace;color:#B08A3E}'
   +'.k28pet-form{background:#fff;border:1px solid rgba(11,58,46,.12);border-radius:18px;padding:22px 24px;display:grid;gap:14px;box-shadow:0 12px 30px -24px rgba(11,58,46,.6)}'
   +'.k28pet-form label{display:grid;gap:6px;font:700 11px system-ui,sans-serif;letter-spacing:.1em;color:#7A857F;text-transform:uppercase}.k28pet-form label .inp,.k28pet-form textarea{font:500 14px inherit;font-family:inherit;letter-spacing:0;text-transform:none;color:#14231D}'
   +'.k28pet-form .k60-check{display:flex;gap:10px;align-items:flex-start;font:500 13px inherit;font-family:inherit;letter-spacing:0;text-transform:none;color:#33443C}'
   +'.k28pet-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.k28pet-grid3{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}'
   +'.k28pet-sub{font:800 11px system-ui,sans-serif;letter-spacing:.18em;color:#B08A3E;margin-top:4px}'
   +'.k28seg,.k28cat{display:flex;gap:8px;flex-wrap:wrap}.k28seg button,.k28cat button{appearance:none;border:1px solid #D9E1DC;background:#fff;border-radius:999px;padding:9px 16px;font:600 13.5px inherit;font-family:inherit;color:#33443C;cursor:pointer}'
   +'.k28seg button.on,.k28cat button.on{background:#0B3D2E;border-color:#0B3D2E;color:#fff}'
   +'.k28pet-res{border-radius:14px;padding:14px 16px;font-size:13.5px;line-height:1.7}.k28pet-res.ok{background:#EEF7F1;border:1px solid #BFDCCB;color:#0B3D2E}.k28pet-res.no{background:#FDF3EE;border:1px solid #F0CDBB;color:#8A3B18}.k28pet-res b{display:block}.k28pet-res ul{margin:4px 0 0 18px;padding:0}.k28pet-res small{display:block;margin-top:6px;color:#7A857F}'
   +'.k28pet-note{font-size:12.5px;color:#7A5A12;background:#FFF8E8;border-radius:10px;padding:10px 12px}'
   +'.k28pet-acts{display:flex;justify-content:flex-end;gap:10px}.k28pet-acts .k60-btn[disabled]{opacity:.45;cursor:not-allowed}'
   +'.k28-drop{position:relative;display:inline-flex!important;width:max-content;border:1px dashed rgba(176,138,62,.7);border-radius:12px;padding:10px 16px!important;background:#FFFCF5;cursor:pointer}.k28-drop input{position:absolute;inset:0;opacity:0;cursor:pointer}.k28-drop span{font:600 13px inherit;font-family:inherit;color:#0B3D2E;letter-spacing:0;text-transform:none}'
   +'.k28-files{list-style:none;margin:0;padding:0;display:grid;gap:6px}.k28-files li{display:flex;align-items:center;gap:10px;background:#F7F8F6;border-radius:10px;padding:8px 12px;font-size:13px}.k28-files b{flex:1;font-weight:600;color:#14231D;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.k28-files small{color:#7A857F}.k28-files li>button:not(.btn){border:0;background:none;font-size:18px;color:#9A3A2F;cursor:pointer}'
   +'.k28-pettag{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;background:#FFF3D9;color:#7A5A12;font:700 10.5px system-ui,sans-serif;white-space:nowrap}'
   +'.k28-cat{display:flex;gap:6px;margin:0 0 14px}.k28-cat button{appearance:none;border:1px solid #D9E1DC;background:#fff;border-radius:12px;padding:10px 18px;font:700 14px inherit;font-family:inherit;color:#33443C;cursor:pointer;display:flex;gap:10px;align-items:center}.k28-cat button small{font-weight:500;font-size:11.5px;color:#7A857F}.k28-cat button b{font:700 12px ui-monospace,monospace;background:#EEF2EF;border-radius:999px;padding:1px 8px}'
   +'.k28-cat button.on{background:#0B3D2E;border-color:#0B3D2E;color:#fff}.k28-cat button.on small{color:#CFE0D7}.k28-cat button.on b{background:#B08A3E;color:#fff}'
   +'@media(max-width:760px){.k28pet-rules,.k28pet-grid,.k28pet-grid3{grid-template-columns:1fr}.k28pet-form{padding:16px}}';
    document.head.appendChild(cs)}catch(_){}
})();
