  /* 0928B：員工報銷（使用者：「後台員工薪資那裡新增一個員工報銷就是自行選擇幣別，然後輸入多少錢附上照片收據證明，然後CEO Approve，通過就是會加到該員工的薪水。」）
     員工在〈薪資功過〉自己的頁面送出：幣別、金額、事由、收據照片（可多張，瀏覽器端壓縮）。
     CEO 在同一頁核准或退回；核准的金額依全站匯率（FX / toTWD）換成新台幣，併入核准當月的薪資（salaryOf 的 reimb）。 */
  (function(){
    var RB_CUR=['TWD','USD','JPY','KRW','HKD','SGD','EUR','GBP','AUD','NZD','CAD','THB','CNY','MYR','PHP','VND','IDR','AED','QAR','CHF'];
    function Z(){try{return LANG!=='en'}catch(_){return true}}
    function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function st(){return (S.reimbR928=S.reimbR928||[])}
    function dr(){return (window.__rbDraft928=window.__rbDraft928||{cur:'TWD',amt:'',desc:'',emp:'',photos:[]})}
    function twd(a,c){try{return typeof toTWD==='function'?toTWD(+a||0,c):Math.round((+a||0)*((window.FX||{})[c]||1))}catch(_){return Math.round(+a||0)}}
    window.kgmReimbSetR928=function(k,v){dr()[k]=v};
    window.kgmReimbPickR928=function(inp){
      var files=[].slice.call((inp&&inp.files)||[]),d=dr(),left=6-d.photos.length;
      if(!files.length)return;if(left<=0){alert(Z()?'最多 6 張收據照片。':'Up to 6 receipt photos.');return}
      files.slice(0,left).forEach(function(f){
        if(!/^image\//.test(f.type)){alert((Z()?'只接受圖片檔：':'Images only: ')+f.name);return}
        var rd=new FileReader();rd.onload=function(){var img=new Image();img.onload=function(){
          var m=1200,w=img.width,h=img.height,k=Math.min(1,m/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
          c.getContext('2d').drawImage(img,0,0,c.width,c.height);d.photos.push({name:f.name,src:c.toDataURL('image/jpeg',.72)});try{render()}catch(_){}};img.src=rd.result};rd.readAsDataURL(f);
      });
      try{inp.value=''}catch(_){}
    };
    window.kgmReimbDropR928=function(i){dr().photos.splice(i,1);try{render()}catch(_){}};
    window.kgmReimbSubmitR928=function(){
      var d=dr(),me=S.adminUser||{},ceo=(typeof isCEO==='function'&&isCEO());
      var emp=String(ceo?(d.emp||''):(me.empId||'')).toUpperCase().trim(),stf=(S.staff||[]).filter(function(x){return x.empId===emp})[0];
      var amt=Math.round((+d.amt||0)*100)/100,miss=[];
      if(!stf)miss.push(Z()?'員工編號':'Employee ID');if(!(amt>0))miss.push(Z()?'金額':'Amount');
      if(!String(d.desc||'').trim())miss.push(Z()?'事由':'Description');if(!d.photos.length)miss.push(Z()?'收據照片（至少 1 張）':'Receipt photo');
      if(miss.length){alert((Z()?'請補上：':'Missing: ')+miss.join(Z()?'、':', '));return}
      var id='RB'+todayISO().replace(/-/g,'').slice(2)+'-'+String(1001+st().length).slice(-4);
      st().unshift({id:id,empId:emp,name:stf.name,role:stf.role,currency:d.cur||'TWD',amount:amt,twd:twd(amt,d.cur||'TWD'),desc:String(d.desc).trim(),
        photos:d.photos.slice(),status:'pending',at:new Date().toISOString(),by:me.empId||'',payMonth:''});
      try{logAct(Z()?'員工報銷送出':'Reimbursement submitted',id+'　'+stf.name+'　'+(d.cur||'TWD')+' '+amt)}catch(_){}
      window.__rbDraft928={cur:d.cur,amt:'',desc:'',emp:ceo?d.emp:'',photos:[]};
      try{save()}catch(_){alert(Z()?'照片太大，瀏覽器空間不足，請減少張數。':'Photos too large for browser storage.');}
      try{render()}catch(_){}
    };
    window.kgmReimbDecideR928=function(id,ok){
      if(!(typeof isCEO==='function'&&isCEO())){alert(Z()?'只有執行長可以核准報銷。':'CEO only.');return}
      var r=st().filter(function(x){return x.id===id})[0];if(!r||r.status!=='pending')return;
      var why='';if(!ok){why=prompt(Z()?'退回原因（會通知員工）':'Reason for returning');if(why==null)return}
      r.status=ok?'approved':'rejected';r.decidedAt=new Date().toISOString();r.decidedBy=(S.adminUser||{}).empId||'CEO';r.reason=why||'';
      if(ok)r.payMonth=todayISO().slice(0,7);
      try{notifyStaff(r.empId,ok?('報銷已核准：'+r.currency+' '+r.amount.toLocaleString()+'（約 NT$'+r.twd.toLocaleString()+'）將併入 '+r.payMonth+' 薪資。單號 '+r.id)
        :('報銷被退回：'+r.currency+' '+r.amount.toLocaleString()+'。原因：'+(why||'—')+'。單號 '+r.id))}catch(_){}
      try{logAct(ok?'報銷核准':'報銷退回',r.id+'　'+r.name+'　NT$'+r.twd.toLocaleString())}catch(_){}
      try{save()}catch(_){}try{render()}catch(_){}
    };
    window.kgmReimbViewR928=function(id,i){
      var r=st().filter(function(x){return x.id===id})[0],p=r&&r.photos[i];if(!p&&id==='draft')p=dr().photos[i];if(!p)return;
      var o=document.createElement('div');o.className='k928-rb-view';o.onclick=function(){o.remove()};
      o.innerHTML='<img src="'+p.src+'" alt=""><span>'+E(p.name||'')+'　'+(Z()?'點一下關閉':'Click to close')+'</span>';document.body.appendChild(o);
    };
    function thumbs(list,id){return '<div class="k928-rb-th">'+list.map(function(p,i){return '<button type="button" onclick="kgmReimbViewR928(\''+id+'\','+i+')" title="'+E(p.name)+'"><img src="'+p.src+'" alt=""></button>'}).join('')+'</div>'}
    function chip(s){return '<span class="k928-rb-chip '+s+'">'+(Z()?({pending:'待 CEO 核准',approved:'已核准・併入薪資',rejected:'已退回'}[s]||s):s)+'</span>'}
    function card(r,ceo){
      return '<article class="k928-rb-item"><header><div><b>'+E(r.name)+'</b> <small>'+E(r.empId)+'</small></div>'+chip(r.status)+'</header>'
        +'<div class="k928-rb-amt"><b>'+E(r.currency)+' '+Number(r.amount).toLocaleString()+'</b>'+(r.currency!=='TWD'?'<small>'+(Z()?'約 ':'≈ ')+'NT$ '+Number(r.twd).toLocaleString()+'</small>':'')+'</div>'
        +'<p>'+E(r.desc)+'</p>'+thumbs(r.photos||[],r.id)
        +'<footer><small>'+E(r.id)+'・'+E(String(r.at||'').replace('T',' ').slice(0,16))+(r.payMonth?('・'+(Z()?'併入 ':'paid in ')+E(r.payMonth)):'')+(r.reason?('・'+(Z()?'原因：':'Reason: ')+E(r.reason)):'')+'</small>'
        +(ceo&&r.status==='pending'?'<span><button class="btn btn-g btn-sm" onclick="kgmReimbDecideR928(\''+r.id+'\',true)">'+(Z()?'核准，併入本月薪資':'Approve')+'</button> <button class="btn btn-sm" onclick="kgmReimbDecideR928(\''+r.id+'\',false)">'+(Z()?'退回':'Return')+'</button></span>':'')+'</footer></article>';
    }
    window.kgmReimbPanelR928=function(me){
      var ceo=!me,d=dr(),list=st().filter(function(r){return ceo||r.empId===me.empId}),pend=list.filter(function(r){return r.status==='pending'}),done=list.filter(function(r){return r.status!=='pending'}).slice(0,ceo?20:12);
      var form='<div class="k928-rb-form'+(ceo?'':' emp')+'">'
        +(ceo?'<label>'+(Z()?'員工編號':'Employee ID')+'<input class="inp" placeholder="K12345" value="'+E(d.emp||'')+'" oninput="kgmReimbSetR928(\'emp\',this.value.toUpperCase().trim())"></label>':'')
        +'<label>'+(Z()?'幣別':'Currency')+'<select class="inp" onchange="kgmReimbSetR928(\'cur\',this.value)">'+RB_CUR.map(function(c){return '<option'+(c===(d.cur||'TWD')?' selected':'')+'>'+c+'</option>'}).join('')+'</select></label>'
        +'<label>'+(Z()?'金額':'Amount')+'<input class="inp" type="number" min="0" step="0.01" value="'+E(d.amt||'')+'" oninput="kgmReimbSetR928(\'amt\',this.value)"></label>'
        +'<label class="wide">'+(Z()?'事由（例：外站住宿、計程車、代墊餐費）':'Description')+'<input class="inp" value="'+E(d.desc||'')+'" oninput="kgmReimbSetR928(\'desc\',this.value)"></label>'
        +'<label class="wide">'+(Z()?'收據照片（可多張，最多 6 張）':'Receipt photos (up to 6)')+'<input type="file" accept="image/*" multiple onchange="kgmReimbPickR928(this)"></label>'
        +(d.photos.length?'<div class="wide k928-rb-th">'+d.photos.map(function(p,i){return '<span><button type="button" onclick="kgmReimbViewR928(\'draft\','+i+')"><img src="'+p.src+'" alt=""></button><i onclick="kgmReimbDropR928('+i+')">×</i></span>'}).join('')+'</div>':'')
        +'<div class="wide k928-rb-go"><small>'+(Z()?'外幣依系統匯率換算成新台幣；CEO 核准後併入核准當月的薪資。':'Converted to TWD at the system rate; added to that month\'s pay once the CEO approves.')+'</small><button class="btn btn-g" onclick="kgmReimbSubmitR928()">'+(Z()?'送出報銷':'Submit')+'</button></div></div>';
      return '<div class="adm-card k928-rb"><div class="k928-rb-h"><b>'+(ceo?(Z()?'員工報銷（CEO 核准後併入當月薪資）':'Staff reimbursements (CEO approval)'):(Z()?'我的報銷':'My reimbursements'))+'</b>'
        +(ceo?'<span>'+(Z()?'待核准 ':'Pending ')+pend.length+'</span>':'')+'</div>'+form
        +(pend.length?'<div class="k928-rb-sub">'+(Z()?'待核准':'Pending')+'</div><div class="k928-rb-list">'+pend.map(function(r){return card(r,ceo)}).join('')+'</div>':'')
        +(done.length?'<div class="k928-rb-sub">'+(Z()?'已處理':'Processed')+'</div><div class="k928-rb-list">'+done.map(function(r){return card(r,ceo)}).join('')+'</div>':'')
        +(!list.length?'<div class="k928-rb-empty">'+(Z()?'目前沒有報銷紀錄。':'No reimbursements yet.')+'</div>':'')+'</div>';
    };
    try{if(!document.getElementById('k928-rb-css')){var cs=document.createElement('style');cs.id='k928-rb-css';cs.textContent=
      '.k928-rb-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.k928-rb-h b{font-size:14px;color:var(--g)}.k928-rb-h span{font-size:11px;font-weight:800;color:#8a5a12;background:#fff5e0;border-radius:999px;padding:3px 10px}'
      +'.k928-rb-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;background:#f8faf9;border:1px solid #e3ebe7;border-radius:12px;padding:12px}.k928-rb-form label{font-size:11px;font-weight:700;color:#5e6a64;display:flex;flex-direction:column;gap:4px}.k928-rb-form .wide{grid-column:1/-1}'
      +'.k928-rb-form.emp{grid-template-columns:repeat(2,minmax(0,1fr))}'
      +'.k928-rb-go{display:flex;justify-content:space-between;align-items:center;gap:10px}.k928-rb-go small{color:#7b817d;font-size:11px}'
      +'.k928-rb-th{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.k928-rb-th span{position:relative}.k928-rb-th button{border:1px solid #dcd6c8;border-radius:8px;padding:0;background:#fff;cursor:zoom-in;overflow:hidden;width:72px;height:72px}.k928-rb-th img{width:100%;height:100%;object-fit:cover;display:block}'
      +'.k928-rb-th i{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#b4472f;color:#fff;font-style:normal;font-size:12px;line-height:18px;text-align:center;cursor:pointer}'
      +'.k928-rb-sub{margin:14px 0 6px;font-size:11px;font-weight:800;letter-spacing:.08em;color:#8a8578}.k928-rb-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}'
      +'.k928-rb-item{border:1px solid #e6e1d6;border-radius:12px;padding:11px 13px;background:#fff}.k928-rb-item header{display:flex;justify-content:space-between;align-items:center;gap:8px}.k928-rb-item header small{color:#8a8578}'
      +'.k928-rb-amt{margin:6px 0 2px}.k928-rb-amt b{font-size:17px;color:#0b493b}.k928-rb-amt small{margin-left:8px;color:#7b817d}.k928-rb-item p{margin:2px 0;font-size:12px;color:#3d4944}'
      +'.k928-rb-item footer{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.k928-rb-item footer small{color:#8a8578;font-size:10.5px}'
      +'.k928-rb-chip{font-size:10.5px;font-weight:800;border-radius:999px;padding:3px 9px}.k928-rb-chip.pending{background:#fff5e0;color:#8a5a12}.k928-rb-chip.approved{background:#e5f1ec;color:#0b493b}.k928-rb-chip.rejected{background:#f8e4de;color:#b4472f}'
      +'.k928-rb-empty{padding:14px;text-align:center;color:#9a948a;font-size:12px}'
      +'.k928-rb-view{position:fixed;inset:0;z-index:99999;background:rgba(10,20,16,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:zoom-out}.k928-rb-view img{max-width:92vw;max-height:84vh;border-radius:10px;box-shadow:0 20px 50px rgba(0,0,0,.5)}.k928-rb-view span{color:#fff;font-size:12px}'
      +'@media(max-width:760px){.k928-rb-form{grid-template-columns:1fr}}';
      document.head.appendChild(cs)}}catch(_){}
  })();
