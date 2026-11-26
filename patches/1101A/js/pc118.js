
/* ══ 1118A G3（使用者：「如果旅客有帶寵物要在報到時提醒那裡跳出還有要什麼檢查輸入什麼資料檢查有沒有通過（現場）的也要放上去」）══
   · 地勤櫃檯報到視窗（checkinWizard49）一打開，這個 PNR 在這一班有核准的寵物（kgmPetsOnFlightR1108A，跟航班資料名單同一份）→
     最上面跳出「🐾 寵物同行・須完成現場檢查」，下面是現場檢查表（每隻一張）：
     ① 寵物＋籠子實秤（kg）② 籠子長寬高（cm）③ 年齡（出生日期 → 週數）④ 狂犬病疫苗接種日 ⑤ 健康證明簽發日 ⑥ 晶片號碼（15 碼）
     ⑦ 品種跟申請相同、不是短鼻品種 ⑧ 目的地入境／檢疫文件 ⑨ 籠子防漏、通風、可上鎖 ⑩ 精神正常、未使用鎮靜劑（服務犬：訓練證明、背心／牽繩）。
   · 判斷全部照《動物運送規定》KGM-PET-009（kgmPetRulesR1101A，唯一來源）：客艙寵物＋籠 ≤ 8 kg、籠 ≤ 46×28×24 cm；
     託運 ≤ 45 kg、長＋寬＋高 ≤ 292 cm；≥ 16 週；狂犬病疫苗接種 ≥ 30 天、未滿 1 年；健康證明出發前 10 天內簽發。逐項 ✓／✗，全部 ✓ 才是「通過」。
   · 結果寫進 S.petCiR1118A[PNR|班號|日期|寵物編號]（存檔 kgm118_petci，跨分頁、重新整理後還在）：通過／不通過、量到的值、檢查人員、時間。
   · 沒記錄結果前不能按「繼續」；不通過 → 寵物不能隨行，旅客本人可以照常報到（視窗寫處理方式），並提示可「為這班旅客建立案件」。 */
(function(){
  if(window.__pc118)return;window.__pc118=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function R(){return window.kgmPetRulesR1101A||{cabinKg:8,carrier:[46,28,24],holdKg:45,kennelSum:292,minWeeks:16,snub:[]}}
  function store(){return S.petCiR1118A=S.petCiR1118A||{}}
  function nm(s){return String(s||'').replace(/[\s\/]+/g,'').toUpperCase()}   /* 寵物申請的姓名有「LAST/FIRST」也有「LAST FIRST」兩種寫法 */
  /* 這位報到旅客的姓名（LAST/FIRST，跟寵物申請同一格式）：模擬名單的寵物沒有 PNR，用姓名對 */
  function paxName(c){if(c.paxNmR1118A!=null)return c.paxNmR1118A;var n='';try{var I=window.kgmCiInfoR1103A?window.kgmCiInfoR1103A({key:c.key,id:c.id,pnr:c.pnr}):null;n=I&&I.name&&I.name!=='/'?I.name:''}catch(_){}return c.paxNmR1118A=nm(n)}
  function pets(c){if(!c)return [];try{var L=window.kgmPetsOnFlightR1108A?window.kgmPetsOnFlightR1108A(c.code,c.date):[];if(!L.length)return [];var me=null;
      return L.filter(function(p){if(!p||!p.ok)return false;if(p.pnr&&c.pnr&&nm(p.pnr)===nm(c.pnr))return true;if(me==null)me=paxName(c);return !!(me&&nm(p.pax)===me)})}catch(_){return []}}
  function caseOf(no){return (S.staffCasesR1007A||[]).filter(function(x){return x&&x.caseNo===no})[0]||null}
  function key(c,p,i){return String(c.pnr||p.pax||'').toUpperCase()+'|'+c.code+'|'+c.date+'|'+(p.no||i)}
  function draft(c,k){c.petR1118A=c.petR1118A||{};return c.petR1118A[k]=c.petR1118A[k]||{}}
  function num(v){var n=parseFloat(String(v==null?'':v).replace(/[^\d.]/g,''));return isFinite(n)?n:null}
  function days(a,b){return Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/86400000)}
  var SN={dog:'狗',cat:'貓',service:'服務犬'},MD={cabin:'客艙',hold:'託運（貨艙）',service:'服務犬（客艙）'};
  /* 逐項判斷：回傳 [{k,label,ok(true/false/null 未填),note}] */
  function evalPet(c,p,d){var r=R(),zh=z(),mode=p.mode||'cabin',sv=p.species==='service'||mode==='service',out=[];
    var kg=num(d.kg);out.push({k:'kg',ok:kg==null?null:(sv?true:mode==='hold'?kg<=r.holdKg:kg<=r.cabinKg),
      note:kg==null?'':(sv?(zh?'服務犬不限重（不佔座位）':'no limit'):(zh?('上限 '+(mode==='hold'?r.holdKg:r.cabinKg)+' kg（'+(mode==='hold'?'託運，含籠':'客艙，含籠')+'）'):('limit '+(mode==='hold'?r.holdKg:r.cabinKg)+' kg')))+(p.kg?(zh?' · 申請時 ':' · declared ')+p.kg+' kg':'')});
    if(!sv){var dm=String(d.dims||'').match(/\d+(\.\d+)?/g)||[],ok=null,note='';
      if(dm.length>=3){var v=dm.slice(0,3).map(Number);if(mode==='hold'){var sum=v[0]+v[1]+v[2];ok=sum<=r.kennelSum;note=(zh?'長＋寬＋高 ':'L+W+H ')+sum+' cm（'+(zh?'上限 ':'max ')+r.kennelSum+'）'}
        else{var lim=r.carrier.slice().sort(function(a,b){return b-a}),vs=v.slice().sort(function(a,b){return b-a});ok=vs[0]<=lim[0]&&vs[1]<=lim[1]&&vs[2]<=lim[2];note=(zh?'上限 ':'max ')+r.carrier.join('×')+' cm'}}
      out.push({k:'dims',ok:ok,note:note})}
    var wk=null;if(d.birth&&/^\d{4}-\d{2}-\d{2}$/.test(d.birth))wk=Math.floor(days(d.birth,c.date)/7);
    out.push({k:'birth',ok:wk==null?null:wk>=r.minWeeks,note:wk==null?'':(zh?('出發日 '+wk+' 週（至少 '+r.minWeeks+' 週）'):(wk+' weeks (min '+r.minWeeks+')'))});
    var vd=null;if(d.rabies&&/^\d{4}-\d{2}-\d{2}$/.test(d.rabies))vd=days(d.rabies,c.date);
    out.push({k:'rabies',ok:vd==null?null:(vd>=30&&vd<=365),note:vd==null?'':(zh?('接種後 '+vd+' 天（須 30～365 天）'):(vd+' days since vaccination (30–365)'))});
    var hd=null;if(d.health&&/^\d{4}-\d{2}-\d{2}$/.test(d.health))hd=days(d.health,c.date);
    out.push({k:'health',ok:hd==null?null:(hd>=0&&hd<=10),note:hd==null?'':(zh?('出發前 '+hd+' 天簽發（須 10 天內）'):(hd+' days before departure (≤10)'))});
    var chip=String(d.chip||'').replace(/\s/g,'');out.push({k:'chip',ok:chip?/^\d{15}$/.test(chip):null,note:chip?(/^\d{15}$/.test(chip)?(zh?'15 碼 ISO 晶片':'15-digit ISO'):(zh?'須為 15 碼數字（ISO 11784/11785）':'must be 15 digits')):''});
    out.push({k:'breed',ok:yn(d.breed),note:p.breed?((zh?'申請品種：':'Declared: ')+p.breed):''});
    out.push({k:'entry',ok:yn(d.entry),note:''});
    if(!sv)out.push({k:'cage',ok:yn(d.cage),note:''});
    out.push({k:'calm',ok:yn(d.calm),note:''});
    if(sv)out.push({k:'svc',ok:yn(d.svc),note:''});
    return out}
  var LB={kg:['寵物＋籠子實秤','Weight incl. carrier'],dims:['籠子尺寸（長×寬×高 cm）','Carrier L×W×H (cm)'],birth:['出生日期（算年齡）','Date of birth'],rabies:['狂犬病疫苗接種日','Rabies vaccination date'],health:['健康證明簽發日','Health certificate issued'],chip:['晶片號碼','Microchip no.'],
    breed:['品種與申請相同、不是短鼻品種','Breed matches application, not snub-nosed'],entry:['目的地入境／檢疫文件齊全','Destination import / quarantine papers'],cage:['籠子防漏、通風、可上鎖','Carrier leak-proof, ventilated, lockable'],calm:['精神正常、未使用鎮靜劑','Alert, not sedated'],svc:['服務犬訓練證明、背心與牽繩','Service-dog certificate, vest and leash']};
  function verdict(rows){if(rows.some(function(x){return x.ok===false}))return 'fail';if(rows.every(function(x){return x.ok===true}))return 'pass';return 'pending'}
  window.kgmPetCiSetR1118A=function(k,f,v){var c=S.checkin49;if(!c)return;var d=draft(c,k);d[f]=v;var el=document.getElementById('k118pc-'+k.replace(/[^A-Za-z0-9]/g,'_'));if(el){var p=pets(c).filter(function(p,i){return key(c,p,i)===k})[0];if(p)el.outerHTML=card(c,p,pets(c).indexOf(p))}};
  /* 報到視窗是單獨重畫的（ci31），一般 render() 不會更新它 → 寵物區塊就地換掉 */
  function repaint(){var el=document.querySelector('.k118pc');if(el&&S.checkin49){var h=window.kgmPetCiHtmlR1118A(S.checkin49);if(h){el.outerHTML=h;return}}try{if(window.kgmCiWizHtmlR1103A){var m=document.querySelector('.r49-modal');if(m){m.outerHTML=window.kgmCiWizHtmlR1103A();return}}}catch(_){}try{render()}catch(_){}}
  window.kgmPetCiSaveR1118A=function(k){var c=S.checkin49;if(!c)return;var L=pets(c),i=-1;L.forEach(function(p,j){if(key(c,p,j)===k)i=j});if(i<0)return;var p=L[i],d=draft(c,k),rows=evalPet(c,p,d),v=verdict(rows);
    if(v==='pending'){alert(z()?'還有項目沒有填或沒有勾，請全部檢查完再記錄。':'Complete every item before recording.');return}
    var u=S.adminUser||{};store()[k]={result:v,at:Date.now(),by:(u.name||'')+' '+(u.empId||''),pet:{no:p.no,name:p.name,species:p.species,breed:p.breed,mode:p.mode},vals:JSON.parse(JSON.stringify(d)),fails:rows.filter(function(x){return x.ok===false}).map(function(x){return x.k})};
    try{save()}catch(_){}repaint()};
  window.kgmPetCiRedoR1118A=function(k){var c=S.checkin49;if(!c)return;var o=store()[k];if(o&&o.vals){c.petR1118A=c.petR1118A||{};c.petR1118A[k]=JSON.parse(JSON.stringify(o.vals))}delete store()[k];try{save()}catch(_){}repaint()};
  function inp(k,f,type,val,ph){return '<input class="inp" type="'+type+'" value="'+E(val==null?'':val)+'"'+(ph?' placeholder="'+E(ph)+'"':'')+' onchange="kgmPetCiSetR1118A(\''+A(k)+'\',\''+f+'\',this.value)">'}
  function chk(k,f,val){var zh=z(),o=function(v,t){return '<option value="'+v+'"'+(String(val==null?'':val)===v?' selected':'')+'>'+t+'</option>'};return '<select class="inp k118pc-ck" onchange="kgmPetCiSetR1118A(\''+A(k)+'\',\''+f+'\',this.value)">'+o('',zh?'— 請檢查':'— check')+o('1',zh?'符合':'OK')+o('0',zh?'不符合':'Not OK')+'</select>'}
  function yn(v){return v==null||v===''?null:String(v)==='1'}
  function card(c,p,i){var zh=z(),k=key(c,p,i),rec=store()[k],id='k118pc-'+k.replace(/[^A-Za-z0-9]/g,'_'),cs=caseOf(p.no),pt=(cs&&cs.pet)||{},head='<div class="k118pc-h"><b>🐾 '+E(p.name||'')+'</b> · '+E(zh?(SN[p.species]||p.species):p.species)+(p.breed?' · '+E(p.breed):'')+' · '+E(zh?(MD[p.mode]||p.mode):p.mode)+(p.seatShown||p.seat?' · '+(zh?'座位 ':'seat ')+E(p.seatShown||p.seat):'')+' · '+(zh?'案件 ':'case ')+E(p.no||'')+(pt.dims?' · '+(zh?'申請籠子 ':'declared carrier ')+E(pt.dims):'')+'</div>';
    if(rec){var ok=rec.result==='pass';return '<div class="k118pc-card '+(ok?'pass':'fail')+'" id="'+id+'">'+head+'<div class="k118pc-res">'+(ok?(zh?'✓ 現場檢查通過':'✓ Passed'):(zh?'✗ 現場檢查不通過':'✗ Failed'))+' · '+E(rec.by)+' · '+new Date(rec.at+8*3600000).toISOString().slice(5,16).replace('T',' ')+(zh?'（台北）':' TPE')
        +(ok?'':'<p>'+(zh?'未通過：':'Failed: ')+rec.fails.map(function(f){return E(zh?LB[f][0]:LB[f][1])}).join('、')+'。'+(zh?'寵物不能搭這班（不隨行）；旅客本人可照常報到。請跟旅客說明，需要時在航班資料頁「＋ 為這班旅客建立案件」（寵物退費／改期）。':' The pet cannot travel; the passenger may still check in. Open a case from the flight file if needed.')+'</p>')
        +'<button type="button" class="btn" onclick="kgmPetCiRedoR1118A(\''+A(k)+'\')">'+(zh?'重新檢查':'Re-check')+'</button></div></div>'}
    var d=draft(c,k),rows=evalPet(c,p,d),v=verdict(rows),val=function(f){return d[f]},mark=function(r){return r.ok===true?'<i class="ok">✓</i>':r.ok===false?'<i class="ng">✗</i>':'<i>·</i>'};
    var body=rows.map(function(r){var ctl=r.k==='kg'?inp(k,'kg','number',val('kg'),'kg'):r.k==='dims'?inp(k,'dims','text',val('dims'),'46×28×24'):r.k==='birth'||r.k==='rabies'||r.k==='health'?inp(k,r.k,'date',val(r.k)):r.k==='chip'?inp(k,'chip','text',val('chip'),'900123456789012'):chk(k,r.k,val(r.k));
      return '<tr class="'+(r.ok===false?'ng':r.ok===true?'ok':'')+'"><td>'+mark(r)+'</td><th>'+E(zh?LB[r.k][0]:LB[r.k][1])+'</th><td>'+ctl+'</td><td><small>'+E(r.note||'')+'</small></td></tr>'}).join('');
    return '<div class="k118pc-card" id="'+id+'">'+head+'<table class="k118pc-t">'+body+'</table><div class="k118pc-foot"><b class="'+v+'">'+(v==='pass'?(zh?'全部符合 → 通過':'All OK → pass'):v==='fail'?(zh?'有項目不符合 → 不通過':'Item(s) failed → fail'):(zh?'尚未檢查完':'Incomplete'))+'</b><button type="button" class="btn btn-g" onclick="kgmPetCiSaveR1118A(\''+A(k)+'\')">'+(zh?'記錄檢查結果':'Record result')+'</button></div></div>'}
  window.kgmPetCiHtmlR1118A=function(c){try{if(!c||c.step===4)return '';var L=pets(c);if(!L.length)return '';var zh=z(),left=L.filter(function(p,i){return !store()[key(c,p,i)]}).length;
      if(c.step!==1){var res=L.map(function(p,i){var r=store()[key(c,p,i)];return '🐾 '+E(p.name||'')+'：'+(r?(r.result==='pass'?(zh?'現場檢查通過':'passed'):(zh?'未通過（寵物不隨行）':'failed (pet not carried)')):(zh?'未檢查':'not checked'))}).join('　');return '<div class="k118pc-mini">'+res+'</div>'}
      return '<div class="k118pc"><div class="k118pc-pop"><b>🐾 '+(zh?'旅客有寵物同行 · 須完成現場檢查':'Travelling with a pet · counter inspection required')+'</b><span>'+(zh?(left?'還有 '+left+' 隻沒記錄結果，記錄後才能繼續報到。':'檢查結果已記錄。'):(left?left+' pet(s) still to record.':'Results recorded.'))+(zh?' 規則：《動物運送規定》KGM-PET-009。':' Rules: KGM-PET-009.')+'</span></div>'+L.map(function(p,i){return card(c,p,i)}).join('')+'</div>'}catch(e){try{console.warn('pc118',e&&e.message)}catch(_){}return ''}};
  /* 第一步「繼續」：還有寵物沒記錄結果就擋下 */
  function hookNext(){var O=window.kgmCheckinNext49;if(typeof O!=='function'||O.__pc118)return;var w=function(){var c=S.checkin49;try{if(c&&c.step===1){var L=pets(c),left=L.filter(function(p,i){return !store()[key(c,p,i)]});if(left.length){alert(z()?'這位旅客有寵物同行：請先完成寵物現場檢查並「記錄檢查結果」。':'Record the pet inspection result first.');return}}}catch(_){}return O.apply(this,arguments)};w.__pc118=1;window.kgmCheckinNext49=w}
  hookNext();[0,1500,5000].forEach(function(t){setTimeout(hookNext,t)});
  window.kgmPetCiOfR1118A=function(pnr,code,date){var o=store(),pre=String(pnr).toUpperCase()+'|'+code+'|'+date+'|';return Object.keys(o).filter(function(k){return k.indexOf(pre)===0}).map(function(k){return o[k]})};
  var st=document.createElement('style');st.textContent='.k118pc{margin:0 0 12px}.k118pc-pop{background:#fff4d6;border:2px solid #d99a00;border-radius:10px;padding:10px 12px;margin-bottom:8px;display:flex;flex-direction:column;gap:2px;animation:k118pcIn .35s ease-out}.k118pc-pop b{color:#7a4b00;font-size:15px}.k118pc-pop span{font-size:12px;color:#5b4a2a}@keyframes k118pcIn{from{transform:translateY(-6px);opacity:0}to{transform:none;opacity:1}}'
    +'.k118pc-card{border:1px solid #e1d7c3;border-radius:10px;padding:10px 12px;margin-bottom:8px;background:#fffdf8}.k118pc-card.pass{border-color:#2e8b57;background:#f2fbf5}.k118pc-card.fail{border-color:#c0392b;background:#fdf3f2}.k118pc-h{font-size:13px;margin-bottom:6px;color:#3a3324}'
    +'.k118pc-t{width:100%;border-collapse:collapse;font-size:12px}.k118pc-t th{text-transform:none;letter-spacing:0;text-align:left;font-weight:600;padding:4px 6px;white-space:nowrap;color:#3a3324}.k118pc-t td{padding:3px 6px;vertical-align:middle}.k118pc-t tr+tr{border-top:1px solid #f0e8d8}.k118pc-t .inp{padding:4px 6px;font-size:12px;min-width:130px}.k118pc-t tr.ng{background:#fdecea}.k118pc-t i{font-style:normal;font-weight:700;display:inline-block;width:16px;text-align:center;color:#a8a08c}.k118pc-t i.ok{color:#2e8b57}.k118pc-t i.ng{color:#c0392b}.k118pc-ck{font-size:12px;white-space:nowrap}'
    +'.k118pc-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px}.k118pc-foot b.pass{color:#2e8b57}.k118pc-foot b.fail{color:#c0392b}.k118pc-foot b.pending{color:#8a7d5c}.k118pc-res{font-weight:700;font-size:13px}.k118pc-card.pass .k118pc-res{color:#2e8b57}.k118pc-card.fail .k118pc-res{color:#c0392b}.k118pc-res p{font-weight:400;font-size:12px;color:#5b2b25;margin:4px 0}.k118pc-res .btn{margin-top:6px}.k118pc-mini{background:#fff4d6;border-radius:8px;padding:6px 10px;font-size:12px;margin-bottom:8px;color:#5b4a2a}';
  (document.head||document.documentElement).appendChild(st);
})();
