
/* ══ 1101A：案件與寵物同行（使用者 Round 1～2）══════════════════════════════════════════
   「要加入寵物搭機申請（上排要有地方加入按鈕然後 AI 也要可以 Work），後台一樣放在案件編號處理那裡，航班資料要顯示哪個旅客有申請寵物或是 DH」
   「寵物有分可帶上飛機和不可，這方面要確認好規矩（參照現在航空公司）」
   「旅客端也要可以創立案件在上排其中一處，選擇類別等等；用戶端要可以 attach files，後台也要可以下載」
   「案件那裡要兩個 tab：一個是退票退費相關（需要到 CEO），一般的其他（團體改名等等）放到其他；需要 Assign to CEO 做最後審核，顯示 CEO 待審核；
    這也要隨時 simulate（包含客服處理案件）」「案件要寫哪個航班 eg CX531 (KX9921) TPE-HKG」
   · 寵物規則：《動物運送規定》KGM-PET-009 Rev. B（pet_doc.py，規章彙編同一份），kgmPetRulesR1101A／kgmPetCheckR1101A 是唯一來源，前台表單、後台審核、AI 回答都讀它。
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
  /* ── 規則：《動物運送規定》KGM-PET-009 Rev. B（patches/1101A/pet_doc.py，網站內嵌與 PDF 同一份；改數字兩邊一起改） ── */
  var R={
    cabinKg:8,carrier:[46,28,24],holdKg:45,kennelSum:292,minWeeks:16,cabinPerFlight:2,holdPerFlight:4,
    cabinOk:['Economy','Premium'],applyCabinH:72,applyHoldH:72,
    fee:{cabin:120,hold:[[160,180],[245,280],[292,380]]},cur:'USD',
    cargoOnly:{LHR:'英國',SYD:'澳洲',MEL:'澳洲',BNE:'澳洲',PER:'澳洲',AKL:'紐西蘭',CHC:'紐西蘭',HNL:'夏威夷',HKG:'香港',AUH:'阿聯',DXB:'阿聯'},
    snub:['巴哥 Pug','法國鬥牛犬 French Bulldog','英國鬥牛犬 English Bulldog','波士頓梗犬 Boston Terrier','西施 Shih Tzu','北京犬 Pekingese','拳師犬 Boxer','騎士查理王小獵犬 Cavalier King Charles','鬥牛獒 Bullmastiff','沙皮狗 Shar Pei','日本狆 Japanese Chin','波斯貓 Persian','喜馬拉雅貓 Himalayan','異國短毛貓 Exotic Shorthair','英國短毛貓 British Shorthair','蘇格蘭摺耳貓 Scottish Fold']
  };
  window.kgmPetRulesR1101A=R;
  function ksum(d){return (String(d||'').match(/\d+/g)||[]).slice(0,3).reduce(function(a,b){return a+ +b},0)}
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
        var dm=String(pet.dims||'').match(/\d+/g)||[];if(dm.length>=3){dm=dm.slice(0,3).map(Number).sort(function(a,b){return b-a});var lim=R.carrier.slice().sort(function(a,b){return b-a});if(dm[0]>lim[0]||dm[1]>lim[1]||dm[2]>lim[2])why.push(zh?'運輸袋超過 46×28×24 公分，放不進前方座位下，請改托運（貨艙）。':'Carrier exceeds 46×28×24 cm.')}
        if(petsOn(f,date).cabin>=R.cabinPerFlight)why.push(zh?'這一班客艙寵物名額（2 隻）已滿。':'Cabin pet quota full.');
      }else if(mode==='hold'){
        if(pet.snub)why.push(zh?'短鼻（扁臉）品種不受理托運（貨艙溫度與氣壓變化風險高）；體重符合可改客艙。':'Snub-nosed breeds are not accepted in the hold.');
        if(kg>R.holdKg)why.push(zh?('寵物連同運輸籠超過 '+R.holdKg+' 公斤，請洽 KGM Cargo。'):'Over '+R.holdKg+' kg.');
        var ks=ksum(pet.dims);if(ks>R.kennelSum)why.push(zh?'運輸籠三邊合計超過 292 公分，請洽 KGM Cargo 以貨運辦理。':'Kennel too large: cargo only.');
        if(petsOn(f,date).hold>=R.holdPerFlight)why.push(zh?'這一班貨艙寵物名額（4 隻）已滿。':'Hold pet quota full.');
        warn.push(zh?'起訖或轉機站預報氣溫高於 29°C 或低於 −10°C 時，當天可能無法托運。':'Hold transport may be refused in extreme temperatures.');
      }
      var h=(Date.parse(date+'T'+String(f.dep||'00:00')+':00Z')-tz(f.fr)*3600e3-Date.now())/3600e3,need=mode==='hold'?R.applyHoldH:R.applyCabinH;
      if(h<need)why.push(zh?('需在起飛前 '+need+' 小時提出申請。'):'Apply at least '+need+'h before departure.');
    }
    var fee=0;if(mode==='cabin')fee=R.fee.cabin;else if(mode==='hold'){var k2=ksum(pet.dims);fee=R.fee.hold[0][1];R.fee.hold.forEach(function(t,i){if(k2>(i?R.fee.hold[i-1][0]:0)&&k2<=t[0])fee=t[1]})}
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
  /* 1102A：使用者「圖三用戶端寵物介面不好看，寵物的航班也要有回程，只顯示日期還沒到的航班，要規定要提早多久申請，也要開放權限去選位置（寵物選位一定要加錢）」
     · 訂位用卡片選，只列還有「還沒起飛」航段的訂位；航段可複選（去程＋回程一次申請，一件案件）；每段寫申請截止（起飛前 72 小時，出發地當地時間），過了截止的段不能勾。
     · 帶上客艙的寵物可以選座位（不能坐第一排、緊急出口排、Payload 鎖住的排）；選位費 R.seatFee（經濟 USD 30／豪經 USD 40，每段），送出時座位直接劃給攜帶寵物的旅客。 */
  R.seatFee={Economy:30,Premium:40};
  function depMs(f){return Date.parse(f.date+'T'+String(f.dep||'00:00')+':00Z')-tz(f.fr)*3600e3}
  function dlTxt(f,h){var d=new Date(Date.parse(f.date+'T'+String(f.dep||'00:00')+':00Z')-h*3600e3);return String(d.getUTCMonth()+1).padStart(2,'0')+'/'+String(d.getUTCDate()).padStart(2,'0')+' '+String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')}
  function futSegs(b){var now=Date.now();return segsOf(b).filter(function(s){return s.f&&s.f.date&&depMs(s.f)>now})}
  function segOpen(s,mode){var need=mode==='hold'?R.applyHoldH:R.applyCabinH;return depMs(s.f)-Date.now()>=need*3600e3}
  function legName(k,i){var zh=z();k=String(k||'');return /^out/.test(k)?(zh?'去程':'Outbound'):/^inb/.test(k)?(zh?'回程':'Return'):(zh?'第 '+(i+1)+' 段':'Flight '+(i+1))}
  var CABZ={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙',Resident:'Residence'};
  function cabTxt(c){return z()?(CABZ[c]||c):c}
  function wk(d){try{return '日一二三四五六'.charAt(new Date(d+'T00:00:00Z').getUTCDay())}catch(_){return ''}}
  function md(d){return String(d||'').slice(5).replace('-','/')}
  function shS(f,id){try{return (id&&window.kgmShownSeatR1006A&&window.kgmShownSeatR1006A(f,id))||id}catch(_){return id}}   /* 訂位存內部排號，旅客看到的是顯示排號（1006A） */
  function paxOf(b){return (b.paxList||[]).filter(function(p){return p.passengerType!=='INF'})}
  function pnm(p){return [p.lastName,p.firstName].filter(Boolean).join(' ')||'Passenger'}
  /* 寵物座位：這一段這位旅客可以坐的位子（空位＋自己目前的位子；排除第一排、緊急出口排、Payload 鎖住的排） */
  function seatInfo(b,s,pi){var f=s.f,cab=cabOf(b,s.key),out={cab:cab,type:'',rows:[],ok:{},cur:'',curBad:'',block:''};
    try{var inv=window.kgmCabinInventory54(f,f.date,cab,b.pnr),type=inv.type;out.type=type;
      var mine=Object.keys((b.seats||{})[s.key]||{}).filter(function(k){return k!=='_auto'}),cur=mine[pi]||'';out.cur=cur;
      for(var j=0;j<pi;j++)if(!mine[j]){out.block=z()?'同訂位前面的旅客還沒有座位，請由第一位旅客攜帶寵物，或報到時於櫃檯劃位。':'Seat the earlier passengers first.';break}
      var free={};(inv.seats||[]).forEach(function(x){free[x]=1});mine.forEach(function(x,j){if(j!==pi)delete free[x]});if(cur)free[cur]=1;
      var secs=(window.seatSections7(type)||[]).filter(function(x){return x.name===cab}),ex=[];try{ex=(AC[type]||{}).exitRows||[]}catch(_){}
      var ids=[];secs.forEach(function(x){x.rows.forEach(function(r){r.cells.forEach(function(c){if(c.id)ids.push(c.id)})})});
      var bl={};try{bl=window.kgmPlBlockedIdsR1101A?window.kgmPlBlockedIdsR1101A(f,f.date,ids)||{}:{}}catch(_){}
      secs.forEach(function(x){x.rows.forEach(function(r,ri){var c0=r.cells.filter(function(c){return c.id})[0],rn=c0?parseInt(shS(f,c0.id),10)||r.n:r.n,bulk=ri===0,exit=ex.indexOf(rn)>=0;   /* AC.exitRows 是顯示排號 */out.rows.push({n:r.n,bulk:bulk,exit:exit,cells:r.cells});
        r.cells.forEach(function(c){if(!c.id)return;var why=bulk?'bulk':exit?'exit':bl[c.id]?'pl':'';if(c.id===cur&&why)out.curBad=why;if(free[c.id]&&!why)out.ok[c.id]=1})})})}catch(e){out.err=String(e&&e.message||e)}
    return out}
  function pf(){S.pet28=S.pet28||{pnr:'',last:'',keys:null,pax:0,seats:{},seatOpen:'',species:'dog',mode:'cabin',kg:'',dims:'',weeks:'',breed:'',snub:false,name:'',docs:false,note:'',err:'',done:null};var F=S.pet28;if(!F.seats)F.seats={};return F}
  window.kgmPetSetR1101A=function(k,v,re){var F=pf();F[k]=v;if(k==='breed')F.snub=R.snub.some(function(x){return String(v||'').toLowerCase().indexOf(x.split(' ')[0].toLowerCase())>=0||String(v||'').toLowerCase().indexOf((x.split(' ').slice(1).join(' ')||'@@').toLowerCase())>=0});
    if(k==='pnr'){F.keys=null;F.seats={};F.seatOpen='';F.pax=0;F.err=''}if(k==='pax'||k==='mode'||k==='species'){F.seats={};F.seatOpen=''}if(re)render()};
  window.kgmPetKeyR1102A=function(k,on){var F=pf();F.keys=F.keys||{};F.keys[k]=!!on;if(!on){delete F.seats[k];if(F.seatOpen===k)F.seatOpen=''}F.err='';render()};
  window.kgmPetSeatR1102A=function(k,seat){var F=pf();if(seat===null){delete F.seats[k]}else if(seat)F.seats[k]=seat;else F.seatOpen=F.seatOpen===k?'':k;if(seat)F.seatOpen='';render()};
  function bkOf(F){return F.pnr?findBk(F.pnr,F.last):null}
  function selKeys(b,F){var fs=futSegs(b);if(!F.keys){F.keys={};fs.forEach(function(s){if(segOpen(s,F.mode))F.keys[s.key]=true})}return fs.filter(function(s){return F.keys[s.key]&&segOpen(s,F.mode)}).map(function(s){return s.key})}
  function seatMap(b,s,F){var zh=z(),si=seatInfo(b,s,+F.pax||0),pick=F.seats[s.key]||'';if(si.err)return '<div class="k60-warn">'+E(si.err)+'</div>';if(si.block)return '<div class="k30-seatnote">'+E(si.block)+'</div>';
    var nOk=Object.keys(si.ok).length;if(!nOk)return '<div class="k30-seatnote">'+(zh?'這一班 '+cabTxt(si.cab)+' 目前沒有可攜帶寵物的空位（第一排、緊急出口排不能攜帶寵物）；送出申請後報到時由櫃檯安排。':'No seats available for pets on this flight.')+'</div>';
    var h='<div class="k30-map"><div class="k30-legend"><b>'+(zh?si.type+' '+cabTxt(si.cab)+'・可選 '+nOk+' 個座位':nOk+' seats available')+'</b><span><i class="ok"></i>'+(zh?'可選':'Available')+'</span><span><i class="cur"></i>'+(zh?'目前座位':'Current')+'</span><span><i class="sel"></i>'+(zh?'已選':'Selected')+'</span><span><i class="no"></i>'+(zh?'已售／不可攜帶寵物（第一排、緊急出口排）':'Taken / not allowed')+'</span></div><div class="k30-grid">';
    si.rows.forEach(function(r){var c0=r.cells.filter(function(c){return c.id})[0],rn=c0?parseInt(shS(s.f,c0.id),10)||r.n:r.n;h+='<div class="k30-row'+(r.exit?' exit':'')+'"><em>'+rn+(r.exit?'<small>EXIT</small>':'')+'</em>'+r.cells.map(function(c){if(c.aisle)return '<span class="ai"></span>';var cls=c.id===pick?'sel':(si.ok[c.id]?(c.id===si.cur?'cur':'ok'):'no');
      return '<button type="button" class="'+cls+'" title="'+E(shS(s.f,c.id))+'"'+(cls==='no'?' disabled':'')+' onclick="kgmPetSeatR1102A(\''+A(s.key)+'\',\''+A(c.id)+'\')">'+E(c.col)+'</button>'}).join('')+'</div>'});
    return h+'</div></div>'}
  function petPage(){
    var zh=z(),F=pf(),b=bkOf(F),mine=myBookings().filter(function(x){return futSegs(x).length}).sort(function(a,c){return depMs(futSegs(a)[0].f)-depMs(futSegs(c)[0].f)});
    if(F.done)return '<main class="k60 k28pet"><header class="k60-head"><span>TRAVEL WITH PETS</span><h1>'+(zh?'申請已送出':'Application submitted')+'</h1><p>'+(zh?'案件編號 ':'Case ')+'<b>'+E(F.done)+'</b>'+(zh?'。我們會在 1 個工作天內審核，核准後行程管理會顯示寵物同行；寵物運送費與選位費於機場櫃檯報到時支付。':'. We will review it within one business day.')+'</p></header>'
      +'<div class="k28pet-acts"><button class="k60-btn" onclick="S.pet28=null;render()">'+(zh?'再申請一筆':'New application')+'</button><button class="k60-btn ghost" onclick="S.view=\'case_lookup_0831B\';render()">'+(zh?'查詢案件進度':'Track case')+'</button></div></main>';
    var step=function(n,t,s){return '<div class="k30-step"><i>'+n+'</i><b>'+t+'</b>'+(s?'<span>'+s+'</span>':'')+'</div>'};
    /* ① 訂位 */
    var look='<div class="k28pet-grid"><label>'+(zh?'訂位代號':'Booking reference')+'<input class="inp" value="'+E(mine.some(function(x){return x.pnr===F.pnr})?'':F.pnr)+'" onchange="kgmPetSetR1101A(\'pnr\',this.value.trim().toUpperCase(),1)" style="text-transform:uppercase"></label>'
      +'<label>'+(zh?'旅客姓氏（英文）':'Last name')+'<input class="inp" value="'+E(F.last)+'" onchange="kgmPetSetR1101A(\'last\',this.value,1)" style="text-transform:uppercase"></label></div>';
    var cards=mine.map(function(x){var fs=futSegs(x),a=fs[0].f,l=fs[fs.length-1].f,np=paxOf(x).length,has=(x.petsR1101A||[]).length||(S.staffCasesR1007A||[]).some(function(c){return c&&c.type==='pet'&&c.pnr===x.pnr&&c.status!=='closed'});
      var rt=fs.length>1&&l.to===a.fr;
      return '<button type="button" class="k30-bk'+(x.pnr===F.pnr?' on':'')+'" onclick="kgmPetSetR1101A(\'pnr\',\''+A(x.pnr)+'\',1)"><span class="pn">'+E(x.pnr)+'</span><span class="rt"><b>'+E(a.fr)+'</b><i>'+(rt?'⇄':'→')+'</i><b>'+E(rt?a.to:l.to)+'</b></span>'
        +'<span class="dt">'+E(md(a.date))+(fs.length>1&&l.date!==a.date?' – '+E(md(l.date)):'')+'</span><span class="mt">'+fs.length+(zh?' 段未出發 · ':' upcoming · ')+np+(zh?' 位旅客':' pax')+(has?' · 🐾':'')+'</span></button>'}).join('');
    var pick=step(1,zh?'選擇訂位':'Choose a booking',zh?'只列還有航段尚未出發的訂位':'Bookings with upcoming flights')
      +(mine.length?'<div class="k30-bks">'+cards+'</div><details class="k30-look"'+(F.pnr&&!mine.some(function(x){return x.pnr===F.pnr})?' open':'')+'><summary>'+(zh?'申請其他訂位（輸入訂位代號）':'Another booking')+'</summary>'+look+'</details>':look);
    var form='';
    if(F.pnr&&!b)form='<div class="k60-warn">'+(zh?'查無此訂位，或姓氏不符。':'Booking not found.')+'</div>';
    else if(b&&!futSegs(b).length)form='<div class="k60-warn">'+(zh?'這筆訂位沒有尚未起飛的航段。':'No upcoming flights in this booking.')+'</div>';
    else if(b){
      var fs=futSegs(b),keys=selKeys(b,F),pax=paxOf(b);if(+F.pax>=pax.length)F.pax=0;
      var segHtml=fs.map(function(s,i){var f=s.f,op=segOpen(s,F.mode),on=op&&F.keys[s.key],need=F.mode==='hold'?R.applyHoldH:R.applyCabinH;
        return '<label class="k30-seg'+(on?' on':'')+(op?'':' off')+'"><input type="checkbox"'+(on?' checked':'')+(op?'':' disabled')+' onchange="kgmPetKeyR1102A(\''+A(s.key)+'\',this.checked)">'
          +'<span class="lg">'+legName(s.key,i)+'</span><span class="fl"><b>'+E(f.code||'')+'</b><small>'+E(cabTxt(cabOf(b,s.key)))+'</small></span>'
          +'<span class="od"><b>'+E(f.fr)+'</b><small>'+E(cityN(f.fr))+'</small></span><span class="ar">→</span><span class="od"><b>'+E(f.to)+'</b><small>'+E(cityN(f.to))+'</small></span>'
          +'<span class="tm"><b>'+E(md(f.date))+(zh?'（'+wk(f.date)+'）':'')+' '+E(f.dep||'')+'</b><small>'+(op?((zh?'申請截止 ':'Apply by ')+dlTxt(f,need)+(zh?'（當地時間）':' local')):(zh?'已過申請期限（起飛前 '+need+' 小時）':'Closed ('+need+'h before departure)'))+'</small></span></label>'}).join('');
      var opt=function(k,v,l){return '<button type="button" class="'+(F[k]===v?'on':'')+'" onclick="kgmPetSetR1101A(\''+k+'\',\''+v+'\',1)">'+l+'</button>'};
      form+=step(2,zh?'選擇航段':'Flights',zh?'去程、回程可一起申請；每段需在起飛前 72 小時前申請（以出發地當地時間計）':'Apply for several flights at once; 72 hours before each departure')
        +'<div class="k30-segs">'+segHtml+'</div>'
        +(pax.length>1?'<div class="k28pet-sub">'+(zh?'攜帶寵物的旅客':'Passenger travelling with the pet')+'</div><div class="k28seg">'+pax.map(function(p,i){return '<button type="button" class="'+((+F.pax||0)===i?'on':'')+'" onclick="kgmPetSetR1101A(\'pax\','+i+',1)">'+E(pnm(p))+'</button>'}).join('')+'</div>':'')
        +step(3,zh?'寵物資料':'About your pet','')
        +'<div class="k28pet-grid"><label>'+(zh?'寵物名字':'Pet name')+'<input class="inp" value="'+E(F.name)+'" oninput="kgmPetSetR1101A(\'name\',this.value)"></label><div></div></div>'
        +'<div class="k28pet-sub">'+(zh?'寵物種類':'Animal')+'</div><div class="k28seg">'+opt('species','dog',zh?'🐕 狗':'🐕 Dog')+opt('species','cat',zh?'🐈 貓':'🐈 Cat')+opt('species','service',zh?'🦮 服務犬（免費）':'🦮 Service dog')+'</div>'
        +(F.species!=='service'?('<div class="k28pet-sub">'+(zh?'運送方式':'How the pet travels')+'</div><div class="k28seg">'+opt('mode','cabin',zh?'客艙（放前方座位下）':'In cabin (under seat)')+opt('mode','hold',zh?'托運（溫控貨艙）':'Checked (hold)')+'</div>'
          +'<div class="k28pet-grid3"><label>'+(zh?'品種':'Breed')+'<input class="inp" list="k28breeds" value="'+E(F.breed)+'" onchange="kgmPetSetR1101A(\'breed\',this.value,1)"><datalist id="k28breeds">'+R.snub.map(function(x){return '<option value="'+E(x)+'">'}).join('')+'</datalist></label>'
          +'<label>'+(zh?'寵物＋袋／籠重量（kg）':'Pet + carrier (kg)')+'<input class="inp" type="number" min="0" step="0.1" value="'+E(F.kg)+'" onchange="kgmPetSetR1101A(\'kg\',this.value,1)"></label>'
          +'<label>'+(zh?'年齡（週）':'Age (weeks)')+'<input class="inp" type="number" min="0" value="'+E(F.weeks)+'" onchange="kgmPetSetR1101A(\'weeks\',this.value,1)"></label>'
          +'<label>'+(zh?'袋／籠尺寸（長×寬×高 cm）':'Carrier size (L×W×H cm)')+'<input class="inp" placeholder="46×28×24" value="'+E(F.dims)+'" onchange="kgmPetSetR1101A(\'dims\',this.value,1)"></label></div>'):'');
      /* 每段判斷 */
      var chks=keys.map(function(k){return {k:k,s:fs.filter(function(x){return x.key===k})[0],c:window.kgmPetCheckR1101A(b,k,F)}});
      var cabinPet=F.species!=='service'&&F.mode==='cabin';
      if(cabinPet&&chks.length){
        form+=step(4,zh?'座位（選填）':'Seat (optional)',zh?'攜帶客艙寵物可指定座位，選位費每段 經濟艙 USD '+R.seatFee.Economy+'／豪華經濟艙 USD '+R.seatFee.Premium+'；第一排與緊急出口排不能攜帶寵物':'Seat fee per flight: Economy USD '+R.seatFee.Economy+' / Premium USD '+R.seatFee.Premium)
          +'<div class="k30-seats">'+chks.map(function(x,i){var s=x.s,cab=cabOf(b,s.key),fee=R.seatFee[cab],sel=F.seats[s.key]||'',si=null,curTxt='';
            if(fee==null)return '<div class="k30-st"><span class="lg">'+legName(s.key,fs.indexOf(s))+'</span><b>'+E(s.f.code)+'</b><span class="k30-stx">'+(zh?'此艙等不受理客艙寵物':'Cabin pets not accepted in this cabin')+'</span></div>';
            if(!sel){si=seatInfo(b,s,+F.pax||0);curTxt=si.cur?((zh?'目前座位 ':'Current seat ')+shS(s.f,si.cur)+(si.curBad?(zh?'（'+({bulk:'第一排',exit:'緊急出口排',pl:'該排暫停販售'}[si.curBad])+'，不能攜帶寵物，請選位或報到時改位）':' (not allowed with a pet)'):'')):(zh?'尚未選位（報到時櫃檯安排可攜帶寵物的座位）':'No seat yet')}
            return '<div class="k30-st'+(F.seatOpen===s.key?' open':'')+'"><span class="lg">'+legName(s.key,fs.indexOf(s))+'</span><b>'+E(s.f.code)+'</b><span class="k30-stx">'+(sel?((zh?'已選 ':'Selected ')+'<em>'+E(shS(s.f,sel))+'</em> · USD '+fee):E(curTxt))+'</span>'
              +'<span class="k30-sb">'+(sel?'<button type="button" class="k60-btn ghost" onclick="kgmPetSeatR1102A(\''+A(s.key)+'\',null)">'+(zh?'取消選位':'Remove')+'</button>':'')+'<button type="button" class="k60-btn ghost" onclick="kgmPetSeatR1102A(\''+A(s.key)+'\',\'\')">'+(F.seatOpen===s.key?(zh?'收起':'Close'):(sel?(zh?'改座位':'Change'):(zh?'選座位 +USD '+fee:'Choose seat +USD '+fee)))+'</button></span>'
              +(F.seatOpen===s.key?seatMap(b,s,F):'')+'</div>'}).join('')+'</div>'}
      form+='<label class="k60-check"><input type="checkbox"'+(F.docs?' checked':'')+' onchange="kgmPetSetR1101A(\'docs\',this.checked,1)"> '+(zh?'我已備妥：10 天內的健康證明、狂犬病疫苗（施打滿 30 天且在有效期內）、晶片，以及目的地入境／檢疫文件':'I have the health certificate, rabies vaccination, microchip and entry documents')+'</label>'
        +'<div class="k28pet-sub">'+(zh?'上傳文件（健康證明、疫苗紀錄…，最多 3 個、每個 5 MB 內）':'Documents (max 3, 5 MB each)')+'</div><label class="k28-drop"><input type="file" multiple accept=".pdf,image/*" onchange="kgmCaseFilePickR1101A(this,\'pet\')"><span>'+(zh?'＋ 選擇檔案':'+ Choose files')+'</span></label><ul class="k28-files" id="k28f-pet"></ul>'
        +'<label>'+(zh?'其他說明':'Notes')+'<textarea class="inp" rows="2" oninput="kgmPetSetR1101A(\'note\',this.value)">'+E(F.note)+'</textarea></label>';
      /* 結果＋費用 */
      if(!chks.length)form+='<div class="k28pet-res no"><b>'+(zh?'請至少勾選一段航班':'Choose at least one flight')+'</b></div>';
      else{var allOk=chks.every(function(x){return x.c.ok}),tot=0,warn={};
        var rowsH=chks.map(function(x){var c=x.c,s=x.s,sf=F.seats[s.key]&&R.seatFee[cabOf(b,s.key)]||0,pfee=c.mode==='service'?0:c.fee;(c.warn||[]).forEach(function(w){warn[w]=1});if(c.ok)tot+=pfee+sf;
          return '<tr class="'+(c.ok?'':'bad')+'"><td>'+legName(s.key,fs.indexOf(s))+' <b>'+E(s.f.code)+'</b> '+E(s.f.fr)+'→'+E(s.f.to)+' '+E(md(s.f.date))+'</td><td>'+(c.ok?'✓ '+(c.mode==='hold'?(zh?'托運':'Hold'):c.mode==='service'?(zh?'服務犬':'Service'):(zh?'客艙':'Cabin')):'<span>'+c.why.map(E).join('<br>')+'</span>')+'</td>'
            +'<td class="n">'+(c.ok?(pfee?'USD '+pfee:(zh?'免費':'Free')):'—')+'</td><td class="n">'+(c.ok&&sf?'USD '+sf+' <small>'+E(shS(s.f,F.seats[s.key]))+'</small>':'—')+'</td></tr>'}).join('');
        form+='<div class="k28pet-res '+(allOk?'ok':'no')+'"><b>'+(allOk?(zh?'✓ 符合規定':'✓ Eligible'):(zh?'有航段目前不符合，請調整或取消勾選該段':'Some flights are not eligible'))+'</b>'
          +'<table class="k30-fee"><thead><tr><th>'+(zh?'航段':'Flight')+'</th><th>'+(zh?'判斷':'Result')+'</th><th class="n">'+(zh?'運送費':'Pet fee')+'</th><th class="n">'+(zh?'選位費':'Seat fee')+'</th></tr></thead><tbody>'+rowsH+'</tbody>'
          +(allOk?'<tfoot><tr><td colspan="2">'+(zh?'合計（機場櫃檯報到時支付）':'Total (pay at check-in)')+'</td><td class="n" colspan="2"><b>USD '+tot+'</b></td></tr></tfoot>':'')+'</table>'
          +(Object.keys(warn).length?'<small>'+Object.keys(warn).map(E).join('　')+'</small>':'')+'</div>'}
      form+=(F.err?'<div class="k60-warn">'+E(F.err)+'</div>':'')
        +'<div class="k28pet-acts"><button class="k60-btn" '+(chks.length&&chks.every(function(x){return x.c.ok})?'':'disabled')+' onclick="kgmPetSubmitR1101A()">'+(zh?'送出申請':'Submit')+'</button></div>';
    }
    return '<main class="k60 k28pet"><header class="k60-head"><span>TRAVEL WITH PETS</span><h1>'+(zh?'寵物同行申請':'Travel with your pet')+'</h1>'
      +'<p>'+(zh?'貓、狗可以帶上客艙（動物連同運輸袋 8 公斤內、經濟／豪華經濟艙），超過的托運進溫控貨艙（45 公斤內、短吻品種不受理）；英國、澳洲、紐西蘭、夏威夷、香港、阿聯只受理貨運。每一段航班都要在起飛前 72 小時前提出申請；去程、回程可以一次申請。完整規定見《動物運送規定》KGM-PET-009。':'Cats and dogs up to 8 kg incl. carrier travel in the cabin; larger pets in the hold (up to 45 kg). Apply 72 hours before each departure.')+'</p></header>'
      +rulesCard()+'<section class="k28pet-form">'+pick+form+'</section></main>';
  }
  function rulesCard(){var zh=z();return '<section class="k28pet-rules"><div><i>🧳</i><b>'+(zh?'可以帶上客艙':'In the cabin')+'</b><span>'+(zh?'貓、狗 · 動物＋運輸袋 ≤ 8 kg · 袋 ≤ 46×28×24 cm · 經濟／豪經 · 每班 2 隻 · 可選位（USD 30／40）':'≤ 8 kg incl. carrier, 46×28×24 cm')+'</span><em>USD 120 '+(zh?'／段':'/ sector')+'</em></div>'
    +'<div><i>❄</i><b>'+(zh?'托運（溫控貨艙）':'In the hold')+'</b><span>'+(zh?'動物＋籠 ≤ 45 kg · IATA 硬殼籠 · 三邊合計 ≤ 292 cm · 短吻品種不受理 · 每班 4 隻':'≤ 45 kg, IATA kennel, no snub-nosed breeds')+'</span><em>USD 180／280／380</em></div>'
    +'<div><i>🦮</i><b>'+(zh?'服務犬':'Service dogs')+'</b><span>'+(zh?'受過訓練的導盲／輔助犬 · 客艙腳邊 · 附訓練證明；情緒支持動物依寵物規定':'Trained assistance dogs only')+'</span><em>'+(zh?'免費':'Free')+'</em></div>'
    +'<div class="no"><i>⛔</i><b>'+(zh?'不受理／只收貨運':'Not accepted / cargo only')+'</b><span>'+(zh?'貓狗以外動物、未滿 16 週、懷孕哺乳、具攻擊性 · 英澳紐、夏威夷、香港、阿聯航點只收貨運（KGM Cargo）':'Other animals; UK, AU, NZ, Hawaii, HK, UAE are cargo only')+'</span><em>KGM Cargo</em></div></section>'}
  /* 座位劃給攜帶寵物的旅客（b.seats[段] 的順序＝旅客順序） */
  function setSeat(b,key,pi,seat){b.seats=b.seats||{};var cur=b.seats[key]||{},ks=Object.keys(cur).filter(function(k){return k!=='_auto'}),pax=paxOf(b),arr=pax.map(function(p,i){return ks[i]||''}),o={};arr[pi]=seat;
    arr.forEach(function(sd,i){if(sd)o[sd]=(i===pi)?pnm(pax[i]):(cur[sd]!=null?cur[sd]:pnm(pax[i]))});if(cur._auto)o._auto=cur._auto;b.seats[key]=o}
  window.kgmPetSubmitR1101A=function(){var zh=z(),F=pf(),b=findBk(F.pnr,F.last);if(!b){F.err=zh?'查無訂位。':'Booking not found.';render();return}
    var fs=futSegs(b),keys=selKeys(b,F);if(!keys.length){F.err=zh?'請至少勾選一段航班。':'Choose a flight.';render();return}
    var bad=[],segs=[];keys.forEach(function(k){var c=window.kgmPetCheckR1101A(b,k,F);if(!c.ok)bad.push(c.why.join(' '));else segs.push({k:k,c:c})});if(bad.length){F.err=bad.join(' ');render();return}
    var pi=+F.pax||0,pax=paxOf(b),p=pax[pi]||pax[0]||{},seats={};
    var cabinPet=F.species!=='service'&&F.mode==='cabin';
    if(cabinPet)for(var i=0;i<segs.length;i++){var k=segs[i].k,sd=F.seats[k];if(!sd)continue;var s=fs.filter(function(x){return x.key===k})[0],si=seatInfo(b,s,pi);
      if(!si.ok[sd]){F.err=(zh?'座位 '+sd+' 已被選走或不能攜帶寵物，請重新選位。':'Seat '+sd+' is no longer available.');delete F.seats[k];render();return}seats[k]={seat:sd,shown:shS(s.f,sd),fee:R.seatFee[cabOf(b,k)]||0,was:si.cur||''}}
    Object.keys(seats).forEach(function(k){setSeat(b,k,pi,seats[k].seat)});
    var no=caseNo(),at=new Date().toISOString(),f0=segs[0].c.f,mode=segs[0].c.mode,fee=mode==='service'?0:segs[0].c.fee,tot=0;segs.forEach(function(x){tot+=(x.c.mode==='service'?0:x.c.fee)+((seats[x.k]||{}).fee||0)});
    var segTxt=segs.map(function(x){var f=x.c.f;return f.code+' '+f.fr+'→'+f.to+' '+md(f.date)+(seats[x.k]?(zh?' 座位 ':' seat ')+seats[x.k].shown:'')}).join('、');
    saveFiles('pet',no).then(function(files){
      var rec={caseNo:no,pnr:b.pnr,type:'pet',status:'received',priority:'normal',paxIndex:pi,paxName:((p.lastName||'')+' / '+(p.firstName||'')).trim(),
        segment:{code:f0.code,fr:f0.fr,to:f0.to,date:f0.date,key:segs[0].k},segments:segs.map(function(x){var f=x.c.f;return {code:f.code,fr:f.fr,to:f.to,date:f.date,dep:f.dep,key:x.k,fee:x.c.mode==='service'?0:x.c.fee,seat:(seats[x.k]||{}).seat||'',seatShown:(seats[x.k]||{}).shown||'',seatFee:(seats[x.k]||{}).fee||0}}),
        detail:(zh?'寵物同行申請：':'Pet travel: ')+({dog:zh?'狗':'dog',cat:zh?'貓':'cat',service:zh?'服務犬':'service dog'}[F.species])+(F.name?'「'+F.name+'」':'')+(F.breed?'・'+F.breed:'')+(F.kg?'・'+F.kg+' kg':'')+'・'+(mode==='hold'?(zh?'托運':'hold'):mode==='service'?(zh?'客艙（服務犬）':'cabin (service)'):(zh?'客艙':'cabin'))+(zh?'。航段：':'. Flights: ')+segTxt+(zh?'。合計 USD ':'. Total USD ')+tot+(F.note?'。'+F.note:''),
        pet:{species:F.species,name:F.name,breed:F.breed,snub:!!F.snub,kg:+F.kg||0,dims:F.dims,weeks:+F.weeks||0,mode:mode,fee:fee,total:tot,docs:!!F.docs,seats:seats},files:files,
        createdAt:at,updatedAt:at,by:{empId:'',name:p.firstName?(p.lastName+' '+p.firstName):'',role:'passenger'},assignee:{empId:'',name:''},userId:b.userId||(S.user&&S.user.id)||null,
        email:b.contactEmail||p.email||(S.user&&S.user.email)||'',typeLabelR1101A:zh?'寵物同行申請':'Pet travel application',paxR1101A:1,
        progress:[{at:at,status:'received',label:(zh?'旅客線上申請（系統依 KGM-PET-009 預審通過）':'Submitted online')+(Object.keys(seats).length?(zh?'；已劃寵物座位 ':'; seats ')+Object.keys(seats).map(function(k){return seats[k].shown}).join('、'):''),by:zh?'旅客':'Passenger'}],notes:[]};
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
    drawFiles(S.view==='pet28'?'pet':'case');
    var g30=h.querySelector('.k30-grid'),o30=g30&&g30.querySelector('button.sel,button.cur,button.ok');if(o30)g30.scrollTop=Math.max(0,o30.offsetTop-g30.offsetTop-90)}catch(e){try{console.warn('cs28',e)}catch(_){}}}
  try{var r0=window.render;if(typeof r0==='function'&&!r0.__cs28){var w=function(){var r=r0.apply(this,arguments);paint();return r};w.__cs28=1;window.render=w;try{render=w}catch(_){}}}catch(_){}
  /* ── 前台 AI：寵物問題用同一份規則回答；說要申請（或給了訂位代號）就直接打開申請頁並帶入 ── */
  window.kgmPetAiR1101A=function(t){var zh=z(),U=String(t||'').toUpperCase(),pnr='';(U.match(/\b[A-Z0-9]{6}\b/g)||[]).some(function(x){if((S.bookings||[]).some(function(b){return b&&b.pnr===x})){pnr=x;return true}});
    var kg=+((/(\d+(?:\.\d+)?)\s*(?:公斤|kg|KG)/.exec(t)||[])[1]||0),sp=/貓|cat/i.test(t)?'cat':/服務犬|導盲|service/i.test(t)?'service':'dog';
    var base=zh?('KGM《動物運送規定》（KGM-PET-009）：\n· 可以帶上客艙：貓、狗，動物連同運輸袋 8 公斤內、袋子 46×28×24 公分內，限經濟艙／豪華經濟艙，每班 2 隻；每段 USD 120。\n'
      +'· 托運（溫控貨艙）：超過客艙限制的貓、狗，動物連同 IATA 硬殼籠 45 公斤內、籠子三邊合計 292 公分內，短吻（扁臉）品種不受理，每班 4 隻；每段 USD 180／280／380（依籠子大小）。\n'
      +'· 服務犬免費、在客艙腳邊；情緒支持動物依寵物規定。\n· 只收貨運（客艙、托運都不行）：英國、澳洲、紐西蘭、夏威夷、香港、阿聯。\n· 不受理：貓狗以外的動物、未滿 16 週、懷孕或哺乳中、具攻擊性。\n· 起飛前 72 小時申請；需 10 天內健康證明、狂犬病疫苗（滿 30 天）、晶片、目的地入境文件；費用於櫃檯報到時支付。')
      :'KGM Carriage of Animals (KGM-PET-009): cabin up to 8 kg incl. carrier (Economy / Premium Economy, USD 120), hold up to 45 kg in an IATA kennel (USD 180-380), no snub-nosed breeds in the hold, service dogs free; UK, AU, NZ, Hawaii, HK and UAE are cargo only.';
    var extra='';if(pnr){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0],s0=segsOf(b)[0];if(s0){var c=window.kgmPetCheckR1101A(b,s0.key,{species:sp,mode:kg>R.cabinKg?'hold':'cabin',kg:kg,docs:true});
      extra='\n\n'+(zh?('您的訂位 '+pnr+'（'+s0.f.code+' '+s0.f.fr+'→'+s0.f.to+' '+s0.f.date+'）'+(c.ok?('可以申請'+(c.mode==='hold'?'托運':c.mode==='service'?'服務犬隨行':'客艙')+'，費用 USD '+c.fee+'（櫃檯報到時支付）。'):('目前不符合：'+c.why.join(' ')))):(c.ok?'Eligible.':'Not eligible: '+c.why.join(' ')))}}
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
      (c.segments&&c.segments.length?c.segments:[c.segment||{}]).forEach(function(sg){   /* 1102A：一件申請可含多段（去程＋回程），每段一筆；座位、選位費跟著寫 */
        b.petsR1101A.push({caseNo:c.caseNo,key:sg.key||'out',code:sg.code,date:sg.date,fr:sg.fr,to:sg.to,mode:(c.pet||{}).mode,species:(c.pet||{}).species,name:(c.pet||{}).name,kg:(c.pet||{}).kg,fee:sg.fee!=null?sg.fee:(c.pet||{}).fee,seat:sg.seat||'',seatShown:sg.seatShown||sg.seat||'',seatFee:+sg.seatFee||0,paxIndex:+c.paxIndex||0,at:at})})}}
    c.status=ok?'closed':'investigating';c.updatedAt=at;if(ok)c.closedAt=at;c.decisionR1101A={ok:!!ok,by:who(),at:at};
    c.progress.push({at:at,status:c.status,label:ok?(pet?(zh?'核准寵物同行':'Pet approved'):(zh?'執行長核准，結案':'Approved by CEO — closed')):(zh?'執行長退回，請客服補充':'Returned by CEO'),note:msg,by:who()});
    S.notifs=S.notifs||[];S.notifs.unshift({title:(zh?'案件審核結果 ':'Case decision ')+c.caseNo,message:msg,date:T(),read:false,userId:c.userId||null});
    try{if(typeof kgmNotify==='function'&&c.email&&!c.simR1022A&&!c.simR1101A)kgmNotify('case.updated',{email:c.email,caseNo:c.caseNo,pnr:c.pnr,status:c.status,subject:(zh?'案件審核結果 ':'Case decision ')+c.caseNo,message:msg,eventId:'r1101a-ceo:'+c.caseNo+':'+at}).catch(function(){})}catch(_){}
    try{logAct(ok?'CEO 核准案件':'CEO 退回案件',c.caseNo)}catch(_){}try{save()}catch(_){}render()};
  window.kgmCase28CeoActsR1101A=function(r){var zh=z(),ceo=false;try{ceo=String((S.adminUser||{}).role||'')==='ceo'||(S.adminUser||{}).empId==='MASTER'}catch(_){}
    if(!ceo)return '<div class="k7c-closed">⏳ '+(zh?'已送執行長最後審核，等待決定。':'Awaiting the CEO.')+'</div>';
    var c=rec(r.no)||{},pet=c.type==='pet';
    return '<div class="k7c-act"><div class="k7c-sub">'+(zh?'執行長最後審核':'CEO final review')+'</div>'
      +(pet&&c.pet?'<p class="k7c-text">'+E((zh?'寵物：':'Pet: ')+[c.pet.species,c.pet.breed,c.pet.kg?c.pet.kg+' kg':'',c.pet.mode,'USD '+(c.pet.total!=null?+c.pet.total:(+c.pet.fee||0))].filter(Boolean).join('・'))+'</p>'
        +(c.segments&&c.segments.length?'<p class="k7c-text">'+E((zh?'航段：':'Flights: ')+c.segments.map(function(sg){return sg.code+' '+sg.fr+'→'+sg.to+' '+String(sg.date||'').slice(5)+(sg.seat?(zh?' 座位 ':' seat ')+(sg.seatShown||sg.seat)+'（USD '+(+sg.seatFee||0)+'）':'')}).join('、'))+'</p>':''):'')
      +'<label class="k7c-full">'+(zh?'給旅客的審核結果（會寄 Email）':'Decision for the passenger')+'<textarea class="inp" rows="3" id="k28CeoMsg"></textarea></label>'
      +'<div class="k7c-btns"><button class="btn btn-g" onclick="kgmCase28Ceo(\''+A(r.no)+'\',true)">'+(pet?(zh?'核准寵物同行':'Approve pet'):(zh?'CEO 核准並結案':'Approve & close'))+'</button><button class="btn j-reject" onclick="kgmCase28Ceo(\''+A(r.no)+'\',false)">'+(zh?'退回客服':'Return')+'</button></div></div>'};
  /* 航班資料：這位旅客有核准的寵物 → 名字旁標「寵物」 */
  window.kgmPetTagR1101A=function(pnr,code,date){try{if(String(code).indexOf('|')>=0){var k9=String(code).split('|');code=k9[0];date=k9[1]}var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!b)return '';
    var p=(b.petsR1101A||[]).filter(function(x){return x.code===code&&x.date===date})[0];
    if(!p){var c=(S.staffCasesR1007A||[]).filter(function(x){return x&&x.type==='pet'&&x.pnr===pnr&&x.status!=='closed'&&(x.segments&&x.segments.length?x.segments:[x.segment||{}]).some(function(sg){return sg.code===code&&sg.date===date})})[0];   /* 還在審核的申請也標出來（1102A：多段） */
      return c?'<span class="k28-pettag pend" title="'+E(c.caseNo)+'">🐾 '+(z()?'寵物申請中':'Pet pending')+'</span>':''}
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
      var refund=/refund/.test(c.type||'');c.progress=c.progress||[];
      if(refund&&c.status!=='received'){c.status='ceo_review';c.progress.push({at:at,status:'ceo_review',label:'客服初審完成（附件齊全），送執行長最後審核',by:'客服中心（模擬）'})}
      else{var i=['received','investigating','awaiting_customer'].indexOf(c.status),nx=CSN[Math.min(CSN.length-1,i<0?0:i+(c.status==='awaiting_customer'?1:0))];
        if(c.type==='pet'&&nx[0]==='closed')nx=['ceo_review','客服確認文件齊全，送執行長核准'];c.status=nx[0];c.progress.push({at:at,status:nx[0],label:nx[1],by:'客服中心（模擬）'})}
      c.updatedAt=at;ch++}
    /* 新案件：大約每 3 次（約 6 分鐘）進一件 */
    if(tick%3===0&&window.kgmCaseSimR1022A){var keep=S.adminTab;var n0=L.length;try{var r0=window.render;window.render=function(){};window.kgmCaseSimR1022A(1);window.render=r0}catch(_){}
      if((S.staffCasesR1007A||[]).length>n0){var nc=S.staffCasesR1007A[0];if(nc){nc.simR1101A=1;nc.createdAt=at;nc.updatedAt=at;nc.status='received';nc.progress=[{at:at,status:'received',label:(nc.progress&&nc.progress[0]&&nc.progress[0].label)||'案件成立',by:nc.progress&&nc.progress[0]&&nc.progress[0].by||'客服中心'}]}ch++}S.adminTab=keep}
    if(ch){try{save()}catch(_){}if(S.adminTab==='cases0831B')try{(window.kgmSafeRenderR1026C||render)()}catch(_){}}
  }catch(e){try{console.warn('cs28 sim',e)}catch(_){}}}
  setInterval(simTick,120000);window.kgmCaseSimTickR1101A=simTick;
  /* ── 樣式 ── */
  try{var cs=document.createElement('style');cs.id='k28cs-css';cs.textContent=
    '.k28pet{max-width:960px}.k28pet-rules{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 18px}'
   +'.k28pet-rules>div{background:#fff;border:1px solid rgba(11,58,46,.12);border-radius:16px;padding:16px 18px;display:grid;grid-template-columns:34px 1fr;column-gap:12px;row-gap:4px}'
   +'.k28pet-rules i{grid-row:span 3;width:34px;height:34px;border-radius:10px;background:#EEF4F0;display:flex;align-items:center;justify-content:center;font-style:normal}'
   +'.k28pet-rules>div.no{background:#FBF7F4;border-color:#EAD9CF}.k28pet-rules>div.no i{background:#F6E6DD}.k28pet-rules b{color:#0B3D2E;font-size:14.5px}.k28pet-rules span{font-size:12px;color:#6B7570;line-height:1.6}.k28pet-rules em{font-style:normal;font:700 13px ui-monospace,monospace;color:#B08A3E}'
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
   +'.k28-pettag{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;background:#FFF3D9;color:#7A5A12;font:700 10.5px system-ui,sans-serif;white-space:nowrap}.k28-pettag.pend{background:#F1F4F2;color:#55605B;border:1px dashed #C6D0CB}'
   +'.k28-cat{display:flex;gap:6px;margin:0 0 14px}.k28-cat button{appearance:none;border:1px solid #D9E1DC;background:#fff;border-radius:12px;padding:10px 18px;font:700 14px inherit;font-family:inherit;color:#33443C;cursor:pointer;display:flex;gap:10px;align-items:center}.k28-cat button small{font-weight:500;font-size:11.5px;color:#7A857F}.k28-cat button b{font:700 12px ui-monospace,monospace;background:#EEF2EF;border-radius:999px;padding:1px 8px}'
   +'.k28-cat button.on{background:#0B3D2E;border-color:#0B3D2E;color:#fff}.k28-cat button.on small{color:#CFE0D7}.k28-cat button.on b{background:#B08A3E;color:#fff}'
   /* 1102A：寵物頁重做（步驟、訂位卡、航段列、選位圖、費用表） */
   +'.k30-step{display:flex;align-items:baseline;gap:10px;margin-top:6px;padding-top:14px;border-top:1px solid #EEF1EF}.k30-step:first-child{border-top:0;padding-top:0;margin-top:0}.k30-step i{font-style:normal;flex:0 0 24px;height:24px;border-radius:50%;background:#0B3D2E;color:#fff;font:700 12px ui-monospace,monospace;display:inline-flex;align-items:center;justify-content:center;transform:translateY(-1px)}.k30-step b{font-size:15.5px;color:#0B3D2E}.k30-step span{font-size:12px;color:#7A857F}'
   +'.k30-bks{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}.k30-bk{appearance:none;text-align:left;border:1px solid #D9E1DC;background:#fff;border-radius:14px;padding:12px 14px;display:grid;gap:4px;cursor:pointer;font-family:inherit;transition:border-color .15s,box-shadow .15s}.k30-bk:hover{border-color:#9DB8AA}.k30-bk.on{border-color:#0B3D2E;box-shadow:0 0 0 2px rgba(11,61,46,.18);background:#F6FAF8}'
   +'.k30-bk .pn{font:700 11px ui-monospace,monospace;letter-spacing:.12em;color:#B08A3E}.k30-bk .rt{display:flex;gap:8px;align-items:center}.k30-bk .rt b{font:700 20px ui-monospace,monospace;color:#0B3D2E}.k30-bk .rt i{font-style:normal;color:#9AA59F}.k30-bk .dt{font:600 13px inherit;font-family:inherit;color:#33443C}.k30-bk .mt{font-size:11.5px;color:#7A857F}'
   +'.k30-look summary{cursor:pointer;font-size:12.5px;color:#0B3D2E;font-weight:600;margin:2px 0 8px}.k30-segs{display:grid;gap:8px}'
   +'.k30-seg{display:grid!important;grid-template-columns:20px 48px 96px 140px 22px 140px minmax(0,1fr);align-items:center;column-gap:12px!important;border:1px solid #D9E1DC;border-radius:12px;padding:10px 14px;cursor:pointer;font:500 13px inherit!important;font-family:inherit!important;letter-spacing:0!important;text-transform:none!important;color:#14231D!important;background:#fff}'
   +'.k30-seg.on{border-color:#0B3D2E;background:#F6FAF8}.k30-seg.off{opacity:.55;cursor:not-allowed;background:#FAFAF9}.k30-seg input{width:16px;height:16px;accent-color:#0B3D2E;margin:0}.k30-seg .lg{font:700 11px system-ui,sans-serif;color:#B08A3E;letter-spacing:.06em}'
   +'.k30-seg .fl b,.k30-seg .od b{display:block;font:700 14px ui-monospace,monospace;color:#0B3D2E}.k30-seg small{display:block;font-size:11px;color:#7A857F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.k30-seg .ar{color:#9AA59F;text-align:center}.k30-seg .tm{text-align:right}.k30-seg .tm b{display:block;font:600 13px ui-monospace,monospace;color:#14231D}.k30-seg.off .tm small{color:#A4482A}'
   +'.k30-seats{display:grid;gap:8px}.k30-st{display:grid;grid-template-columns:56px 70px minmax(0,1fr) auto;align-items:center;gap:10px;border:1px solid #E3E8E5;border-radius:12px;padding:10px 14px;background:#fff}.k30-st.open{border-color:#B08A3E}.k30-st .lg{font:700 11px system-ui,sans-serif;color:#B08A3E}.k30-st>b{font:700 14px ui-monospace,monospace;color:#0B3D2E}.k30-stx{font-size:12.5px;color:#55605B}.k30-stx em{font-style:normal;font:700 13px ui-monospace,monospace;color:#0B3D2E;background:#FFF3D9;border-radius:6px;padding:1px 7px}.k30-sb{display:flex;gap:6px}.k30-sb .k60-btn{padding:6px 12px;font-size:12.5px}'
   +'.k30-map{grid-column:1/-1;margin-top:6px}.k30-legend b{color:#0B3D2E;font-size:12px;margin-right:4px}.k30-legend{display:flex;flex-wrap:wrap;align-items:center;gap:14px;font-size:11.5px;color:#6B7570;margin-bottom:8px}.k30-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:-1px;border:1px solid #C9D3CE}.k30-legend i.ok{background:#fff;border-color:#2F7D5B}.k30-legend i.cur{background:#E6F4EC;border-color:#2F7D5B}.k30-legend i.sel{background:#B08A3E;border-color:#B08A3E}.k30-legend i.no{background:#E9ECEA}'
   +'.k30-grid{max-height:300px;overflow:auto;border:1px solid #EEF1EF;border-radius:10px;padding:8px 10px;background:#FBFCFB;display:grid;gap:4px;justify-content:center}.k30-row{display:flex;align-items:center;gap:4px}.k30-row em{font-style:normal;width:34px;font:600 11px ui-monospace,monospace;color:#7A857F;text-align:right;padding-right:6px}.k30-row em small{display:block;font-size:8.5px;color:#C0562F;letter-spacing:.06em}.k30-row .ai{width:14px}'
   +'.k30-row button{width:28px;height:26px;border-radius:6px;border:1px solid #2F7D5B;background:#fff;font:600 11px ui-monospace,monospace;color:#0B3D2E;cursor:pointer;padding:0}.k30-row button:hover:not([disabled]){background:#E6F4EC}.k30-row button.cur{background:#E6F4EC}.k30-row button.sel{background:#B08A3E;border-color:#B08A3E;color:#fff}.k30-row button.no{background:#E9ECEA;border-color:#E1E5E3;color:#B5BDB9;cursor:not-allowed}'
   +'.k30-seatnote{grid-column:1/-1;font-size:12px;color:#7A5A12;background:#FFF8E8;border-radius:8px;padding:8px 10px}'
   +'.k30-fee{width:100%;border-collapse:collapse;margin-top:8px;font-size:12.5px;color:#14231D}.k30-fee th{text-align:left;font:700 10.5px system-ui,sans-serif;letter-spacing:.08em;color:#7A857F;padding:6px 8px;border-bottom:1px solid rgba(11,58,46,.15)}.k30-fee td{padding:7px 8px;border-bottom:1px solid rgba(11,58,46,.08);vertical-align:top}.k30-fee .n{text-align:right;white-space:nowrap}.k30-fee td small{display:inline!important;margin:0 0 0 5px!important;color:#7A857F;font-family:ui-monospace,monospace}.k30-fee tr.bad td{color:#8A3B18}.k30-fee td b{display:inline}.k30-fee td:first-child{white-space:nowrap}.k30-fee tfoot td{border-bottom:0;font-weight:700;padding-top:9px}'
   +'@media(max-width:760px){.k28pet-rules,.k28pet-grid,.k28pet-grid3{grid-template-columns:1fr}.k28pet-form{padding:16px}.k30-step{flex-wrap:wrap;row-gap:4px}.k30-step span{flex-basis:100%;padding-left:34px}.k30-seg{grid-template-columns:20px minmax(0,1fr) minmax(0,1fr);grid-template-areas:"c lg fl" "c fr to" "c tm tm";row-gap:6px;align-items:start}.k30-seg>input{grid-area:c;margin-top:2px}.k30-seg>.lg{grid-area:lg}.k30-seg>.fl{grid-area:fl;text-align:right}.k30-seg>.fl b,.k30-seg>.fl small{display:inline;margin-left:6px}.k30-seg>span:nth-child(4){grid-area:fr}.k30-seg>.ar{display:none}.k30-seg>span:nth-child(6){grid-area:to;text-align:right}.k30-seg>.tm{grid-area:tm;text-align:left;border-top:1px dashed #E3E8E5;padding-top:6px}.k30-st{grid-template-columns:auto 1fr}.k30-stx{grid-column:1/-1}.k30-sb{grid-column:1/-1}.k30-fee td{padding:6px 4px}.k30-fee td:first-child{white-space:normal}.k30-fee th{white-space:nowrap}.k30-row button{width:26px}}';
    document.head.appendChild(cs)}catch(_){}
})();

/* 1101B：使用者「後台我也沒在定位那裡多看到寵物搭機的資料」——定位管理（0819J 票務中心）查到的訂位：表頭加「寵物同行」、完整行程下面加一段寵物表（已核准＝訂位上的 petsR1101A；審核中＝寵物案件）。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var MODE={cabin:['客艙','Cabin'],hold:['托運貨艙','Hold'],service:['服務犬','Service dog'],cargo:['貨運','Cargo']};
  function md(m){var x=MODE[m]||[m||'—',m||'—'];return z()?x[0]:x[1]}
  function rows(b){var out=[];(b.petsR1101A||[]).forEach(function(p){out.push({st:'ok',caseNo:p.caseNo,seg:(p.code||'')+' '+(p.fr||'')+'→'+(p.to||'')+' '+(p.date||''),mode:p.mode,who:(p.name||'')+(p.species?'（'+p.species+'）':''),kg:p.kg,fee:p.fee,seat:p.seatShown||p.seat||'',seatFee:+p.seatFee||0})});
    (S.staffCasesR1007A||[]).forEach(function(c){if(!c||c.type!=='pet'||c.pnr!==b.pnr||/closed|rejected|declined/.test(c.status||''))return;if((b.petsR1101A||[]).some(function(p){return p.caseNo===c.caseNo}))return;var p=c.pet||{};
      (c.segments&&c.segments.length?c.segments:[c.segment||{}]).forEach(function(s){out.push({st:'pend',caseNo:c.caseNo,seg:(s.code||'')+' '+(s.fr||'')+'→'+(s.to||'')+' '+(s.date||''),mode:p.mode,who:(p.name||'')+(p.species?'（'+p.species+'）':''),kg:p.kg,fee:s.fee!=null?s.fee:p.fee,seat:s.seatShown||s.seat||'',seatFee:+s.seatFee||0})})});
    return out}
  window.kgmPetBookingCellR1101B=function(b){try{var r=rows(b);if(!r.length)return '<div><small>'+(z()?'寵物同行':'Pets')+'</small><b>—</b></div>';
      return '<div><small>'+(z()?'寵物同行':'Pets')+'</small><b class="k29-petcell">🐾 '+r.map(function(x){return md(x.mode)+(x.st==='pend'?(z()?'（審核中）':' (pending)'):'')}).join('、')+'</b></div>'}catch(_){return ''}};
  window.kgmPetBookingDetailR1101B=function(b){try{var r=rows(b);if(!r.length)return '';
      return '<h3 class="k29-peth">'+(z()?'寵物同行':'Travelling pets')+'</h3><div class="j-table"><table><thead><tr><th>'+(z()?'航段':'Segment')+'</th><th>'+(z()?'方式':'Mode')+'</th><th>'+(z()?'寵物':'Pet')+'</th><th>'+(z()?'重量':'Weight')+'</th><th>'+(z()?'座位':'Seat')+'</th><th>'+(z()?'費用':'Fee')+'</th><th>'+(z()?'狀態／案件':'Status / case')+'</th></tr></thead><tbody>'
        +r.map(function(x){return '<tr><td>'+E(x.seg)+'</td><td>'+E(md(x.mode))+'</td><td>'+E(x.who||'—')+'</td><td>'+(x.kg?E(x.kg)+' kg':'—')+'</td><td>'+(x.seat?E(x.seat):'—')+'</td><td>'+((+x.fee||0)+(+x.seatFee||0)?'USD '+((+x.fee||0)+(+x.seatFee||0))+(x.seatFee?'<small style="display:block;color:#7A857F">'+(z()?'含選位 ':'incl. seat ')+x.seatFee+'</small>':''):'—')+'</td><td>'+(x.st==='ok'?(z()?'已核准':'Approved'):(z()?'審核中':'Pending'))+' · '+E(x.caseNo||'')+'</td></tr>'}).join('')+'</tbody></table></div>'}catch(_){return ''}};
  try{var cs=document.createElement('style');cs.textContent='.k29-petcell{color:#7A4B00}.k29-peth{margin:16px 0 6px;font:700 15px inherit;color:#0B3D2E}';document.head.appendChild(cs)}catch(_){}
})();

/* 1102A：使用者「圖二那裡要多寵物喔」——後台側欄「訂位與客服」加「寵物同行」分頁（pets30）：寵物申請（審核中／已核准／全部）一覽，每件列航段、座位、費用，按「開啟案件」到案件處理中心審核（審核流程照舊：客服→CEO 核准）；下方列未來 14 天各班寵物名額（客艙 2／貨艙 4）。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function addD(d,n){var x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
  var MODE={cabin:['客艙','Cabin'],hold:['托運貨艙','Hold'],service:['服務犬','Service dog']},SP={dog:['狗','Dog'],cat:['貓','Cat'],service:['服務犬','Service dog']};
  function L(m,k){var x=m[k];return x?(z()?x[0]:x[1]):(k||'—')}
  function st(){S.petDeskR1102A=S.petDeskR1102A||{f:'pend',q:''};return S.petDeskR1102A}
  function items(){var out=[],seen={};
    (S.staffCasesR1007A||[]).forEach(function(c){if(!c||c.type!=='pet')return;seen[c.caseNo]=1;var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===c.pnr})[0];
      var ok=c.status==='closed'&&(!c.decisionR1101A||c.decisionR1101A.ok)&&b&&(b.petsR1101A||[]).some(function(p){return p.caseNo===c.caseNo});
      out.push({no:c.caseNo,pnr:c.pnr,pax:c.paxName||'',pet:c.pet||{},segs:(c.segments&&c.segments.length?c.segments:[c.segment||{}]),st:ok?'ok':c.status==='closed'?'done':'pend',raw:c.status,ceo:c.status==='ceo_review',at:c.createdAt||''})});
    (S.bookings||[]).forEach(function(b){if(!b||!(b.petsR1101A||[]).length)return;var g={};b.petsR1101A.forEach(function(p){if(seen[p.caseNo])return;var k=p.caseNo||('—'+b.pnr);(g[k]=g[k]||[]).push(p)});
      Object.keys(g).forEach(function(k){var p=g[k][0],x=(b.paxList||[])[+p.paxIndex||0]||{};out.push({no:p.caseNo||'',pnr:b.pnr,pax:((x.lastName||'')+' / '+(x.firstName||'')).trim(),pet:{species:p.species,name:p.name,kg:p.kg,mode:p.mode,fee:p.fee},segs:g[k],st:'ok',raw:'closed',at:p.at||''})})});
    return out}
  function future(it){var t=T();return it.segs.some(function(s){return String(s.date||'')>=t})}
  window.kgmPetDeskOpenR1102A=function(no,done){S.adminTab='cases0831B';S.case28Cat='other';S.caseTabR913=done?'done':'open';S.case7F={};S.caseFilter0831B='';S.case7Sel=no;try{render()}catch(_){}try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){}};
  window.kgmPetDeskSetR1102A=function(k,v){st()[k]=v;try{render()}catch(_){}};
  window.kgmPetDeskPageR1102A=function(){var zh=z(),F=st(),all=items(),q=String(F.q||'').trim().toUpperCase();
    var pend=all.filter(function(x){return x.st==='pend'&&future(x)}),ok=all.filter(function(x){return x.st==='ok'&&future(x)});
    var rows=(F.f==='pend'?pend:F.f==='ok'?ok:all).filter(function(x){if(!q)return true;return (x.no+' '+x.pnr+' '+x.pax+' '+x.segs.map(function(s){return s.code}).join(' ')).toUpperCase().indexOf(q)>=0})
      .sort(function(a,b){var da=(a.segs[0]||{}).date||'',db=(b.segs[0]||{}).date||'';return F.f==='all'?String(b.at).localeCompare(String(a.at)):da.localeCompare(db)});
    /* 未來 14 天各班名額 */
    var t=T(),end=addD(t,14),Q={};all.forEach(function(x){if(x.st==='done')return;x.segs.forEach(function(s){if(!s.date||s.date<t||s.date>end)return;var k=s.date+'|'+s.code+'|'+s.fr+'|'+s.to,o=Q[k]=Q[k]||{d:s.date,code:s.code,fr:s.fr,to:s.to,cabin:0,hold:0,service:0,pend:0};var m=x.pet.mode||'cabin';o[m]=(o[m]||0)+1;if(x.st==='pend')o.pend++})});
    var ql=Object.keys(Q).sort().map(function(k){return Q[k]});var R=window.kgmPetRulesR1101A||{cabinPerFlight:2,holdPerFlight:4};
    var chip=function(k,lab,n){return '<button type="button" class="'+(F.f===k?'on':'')+'" onclick="kgmPetDeskSetR1102A(\'f\',\''+k+'\')">'+lab+'<b>'+n+'</b></button>'};
    var stTxt=function(x){return x.st==='ok'?'<span class="k30pd-st ok">'+(zh?'已核准':'Approved')+'</span>':x.st==='done'?'<span class="k30pd-st done">'+(zh?'已結案':'Closed')+'</span>':'<span class="k30pd-st pend">'+(x.ceo?(zh?'待 CEO 核准':'Awaiting CEO'):(zh?'客服審核中':'In review'))+'</span>'};
    var tb=rows.length?('<table class="k30pd-t"><thead><tr><th>'+(zh?'案件／訂位':'Case / PNR')+'</th><th>'+(zh?'旅客':'Passenger')+'</th><th>'+(zh?'寵物':'Pet')+'</th><th>'+(zh?'方式':'Mode')+'</th><th>'+(zh?'航段（座位）':'Flights (seat)')+'</th><th class="n">'+(zh?'費用':'Fee')+'</th><th>'+(zh?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'
      +rows.map(function(x){var p=x.pet,tot=p.total!=null?+p.total:x.segs.reduce(function(n,s){return n+(s.fee!=null?+s.fee:(+p.fee||0))+(+s.seatFee||0)},0);
        return '<tr><td><b class="mono">'+E(x.no||'—')+'</b><small class="mono">'+E(x.pnr)+'</small></td><td>'+E(x.pax||'—')+'</td><td>'+E(L(SP,p.species))+(p.name?'「'+E(p.name)+'」':'')+'<small>'+E([p.breed,p.kg?p.kg+' kg':''].filter(Boolean).join(' · '))+'</small></td><td>'+E(L(MODE,p.mode))+'</td>'
          +'<td class="segs">'+x.segs.map(function(s){return '<div><b>'+E(s.code||'')+'</b> '+E(s.fr||'')+'→'+E(s.to||'')+' <span>'+E(String(s.date||'').slice(5))+(s.dep?' '+E(s.dep):'')+'</span>'+(s.seat?' <em>'+E(s.seatShown||s.seat)+'</em>':'')+'</div>'}).join('')+'</td>'
          +'<td class="n">'+(tot?'USD '+tot:(zh?'免費':'Free'))+'</td><td>'+stTxt(x)+'</td><td>'+(x.no&&x.no.charAt(0)!=='—'?'<button class="btn btn-sm" onclick="kgmPetDeskOpenR1102A(\''+A(x.no)+'\','+(x.raw==='closed'?'true':'false')+')">'+(zh?'開啟案件':'Open')+'</button>':'')+'</td></tr>'}).join('')+'</tbody></table>')
      :'<div class="k30pd-empty">'+(F.f==='pend'?(zh?'目前沒有待審核的寵物申請。':'No pending applications.'):(zh?'沒有符合的資料。':'Nothing found.'))+'</div>';
    var qt=ql.length?('<table class="k30pd-t k30pd-q"><thead><tr><th>'+(zh?'日期':'Date')+'</th><th>'+(zh?'航班':'Flight')+'</th><th>'+(zh?'客艙寵物':'Cabin')+'</th><th>'+(zh?'貨艙寵物':'Hold')+'</th><th>'+(zh?'服務犬':'Service')+'</th><th>'+(zh?'其中審核中':'Pending')+'</th></tr></thead><tbody>'
      +ql.map(function(o){var bar=function(n,m){return '<span class="k30pd-bar'+(n>=m?' full':'')+'"><i style="width:'+Math.min(100,Math.round(n/m*100))+'%"></i></span><b>'+n+'／'+m+'</b>'};
        return '<tr><td class="mono">'+E(o.d.slice(5))+'</td><td><b>'+E(o.code)+'</b> '+E(o.fr)+'→'+E(o.to)+'</td><td>'+bar(o.cabin,R.cabinPerFlight)+'</td><td>'+bar(o.hold,R.holdPerFlight)+'</td><td>'+(o.service||'—')+'</td><td>'+(o.pend||'—')+'</td></tr>'}).join('')+'</tbody></table>')
      :'<div class="k30pd-empty">'+(zh?'未來 14 天沒有寵物同行的航班。':'No pets booked in the next 14 days.')+'</div>';
    return '<section class="k30pd"><header><div><small>PETS</small><h2>'+(zh?'寵物同行':'Travelling pets')+'</h2><p>'+(zh?'旅客在前台「旅客服務 › 寵物同行申請」送出的申請；審核在案件處理中心（客服初審 → CEO 核准），核准後寫進訂位、航班資料名單標示 🐾。規則依《動物運送規定》KGM-PET-009。':'Applications from the website; review happens in the case centre.')+'</p></div>'
      +'<div class="k30pd-kpi"><div><small>'+(zh?'審核中':'Pending')+'</small><b>'+pend.length+'</b></div><div><small>'+(zh?'已核准（未出發）':'Approved')+'</small><b>'+ok.length+'</b></div><div><small>'+(zh?'14 天內有寵物的班次':'Flights, 14 days')+'</small><b>'+ql.length+'</b></div></div></header>'
      +'<div class="k30pd-bar0"><div class="k30pd-chips">'+chip('pend',zh?'審核中':'Pending',pend.length)+chip('ok',zh?'已核准':'Approved',ok.length)+chip('all',zh?'全部':'All',all.length)+'</div>'
      +'<input class="inp" placeholder="'+(zh?'搜尋案件編號、訂位代號、班號、旅客':'Search case, PNR, flight, name')+'" value="'+E(F.q||'')+'" onchange="kgmPetDeskSetR1102A(\'q\',this.value)"></div>'
      +'<div class="k30pd-card">'+tb+'</div>'
      +'<h3>'+(zh?'未來 14 天各班寵物名額':'Pet quota by flight, next 14 days')+'<small>'+(zh?'客艙每班 '+R.cabinPerFlight+' 隻、貨艙 '+R.holdPerFlight+' 隻（含審核中）':'')+'</small></h3><div class="k30pd-card">'+qt+'</div></section>'};
  try{var cs=document.createElement('style');cs.textContent=
    '.k30pd{display:grid;gap:14px}.k30pd>header{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;flex-wrap:wrap}.k30pd>header small{font:800 10.5px system-ui,sans-serif;letter-spacing:.2em;color:#B08A3E}.k30pd h2{margin:2px 0 4px;font-size:22px;color:#0B3D2E}.k30pd>header p{margin:0;max-width:640px;font-size:12.5px;color:#6B7570;line-height:1.6}'
   +'.k30pd-kpi{display:flex;gap:10px}.k30pd-kpi>div{background:#fff;border:1px solid rgba(11,58,46,.12);border-radius:12px;padding:10px 16px;min-width:118px}.k30pd-kpi small{display:block;font-size:11px;color:#7A857F}.k30pd-kpi b{font:700 22px ui-monospace,monospace;color:#0B3D2E}'
   +'.k30pd-bar0{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}.k30pd-bar0 .inp{max-width:320px}.k30pd-chips{display:flex;gap:6px}.k30pd-chips button{appearance:none;border:1px solid #D9E1DC;background:#fff;border-radius:999px;padding:7px 14px;font:600 13px inherit;font-family:inherit;color:#33443C;cursor:pointer;display:flex;gap:8px;align-items:center}.k30pd-chips button b{font:700 11.5px ui-monospace,monospace;background:#EEF2EF;border-radius:999px;padding:1px 7px}.k30pd-chips button.on{background:#0B3D2E;border-color:#0B3D2E;color:#fff}.k30pd-chips button.on b{background:#B08A3E;color:#fff}'
   +'.k30pd-card{background:#fff;border:1px solid rgba(11,58,46,.12);border-radius:14px;overflow:auto}.k30pd h3{margin:8px 0 0;font-size:15px;color:#0B3D2E;display:flex;gap:10px;align-items:baseline}.k30pd h3 small{font-size:11.5px;color:#7A857F;font-weight:500}'
   +'.k30pd-t{width:100%;border-collapse:collapse;font-size:12.5px}.k30pd-t th{text-align:left;font:700 10.5px system-ui,sans-serif;letter-spacing:.08em;color:#7A857F;background:#F7F8F6;padding:9px 12px;border-bottom:1px solid #E6EBE8;white-space:nowrap}.k30pd-t td{padding:10px 12px;border-bottom:1px solid #EEF1EF;vertical-align:top;color:#14231D}.k30pd-t tr:last-child td{border-bottom:0}'
   +'.k30pd-t td small{display:block;color:#7A857F;font-size:11px;margin-top:2px}.k30pd-t .n{text-align:right;white-space:nowrap}.k30pd-t .mono{font-family:ui-monospace,monospace}.k30pd-t td.segs div{white-space:nowrap;line-height:1.7}.k30pd-t td.segs span{color:#6B7570}.k30pd-t td.segs em{font-style:normal;font:700 11px ui-monospace,monospace;background:#FFF3D9;color:#7A5A12;border-radius:6px;padding:0 6px}'
   +'.k30pd-st{display:inline-block;border-radius:999px;padding:2px 9px;font:700 11px system-ui,sans-serif;white-space:nowrap}.k30pd-st.ok{background:#E6F4EC;color:#11663F}.k30pd-st.pend{background:#FFF3D9;color:#7A5A12}.k30pd-st.done{background:#EEF1EF;color:#55605B}'
   +'.k30pd-q td{vertical-align:middle}.k30pd-bar{display:inline-block;width:64px;height:6px;border-radius:9px;background:#EEF1EF;margin-right:8px;vertical-align:middle;overflow:hidden}.k30pd-bar i{display:block;height:100%;background:#2F7D5B}.k30pd-bar.full i{background:#C0562F}.k30pd-q b{font:700 12px ui-monospace,monospace}'
   +'.k30pd-empty{padding:26px;text-align:center;color:#7A857F;font-size:13px}';document.head.appendChild(cs)}catch(_){}
})();
