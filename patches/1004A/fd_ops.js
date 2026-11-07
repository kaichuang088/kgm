  /* ══ 1004A：航班資料表格 —— 搜尋、作業動作、表頭右上方白塊 ═══════════════════
     使用者：「航班動態那個表格上面要加入搜尋，可能搜尋旅客姓名、PNR、會員卡號等等，然後你修一下那表格右上方是白色的」
             「最右邊可以有一個動作的按鈕可能包含移出此航班，免費升等，付費升等，超賣給予補償等等…然後動作可能也有什麼非自願降等、自願等等，
               反正要有這些功能但是不影響美觀」「免費升等是要選擇動作之後按旁邊的按鈕才會升等」
     · 表格上方一列工具：搜尋框（姓名／PNR／會員卡號，即時篩選）＋「作業動作」下拉。
     · 每一列最右邊一顆「執行」：依上方選的動作處理這位旅客；已處理過的會在同一格顯示結果標籤，可「復原」。
     · 右上白塊：表格比卡片寬、整張卡片橫向捲動時，上面兩條摘要只有可視寬度 → 捲到右邊就露白。摘要列改成 sticky 貼齊可視範圍；
       艙等分隔列的文字也跟著貼齊左邊，不會捲到右邊只剩一條深綠色空條。 */
  var FDACT929=[
    ['offload',   '移出此航班',            'Offload'],
    ['freeup',    '免費升等',              'Complimentary upgrade'],
    ['paidup',    '付費升等（現場優惠價）', 'Paid upgrade (on-site price)'],
    ['comp',      '超賣補償（拒絕登機）',   'Denied boarding compensation'],
    ['volbump',   '自願讓位（改搭下一班）', 'Volunteer (take next flight)'],
    ['invdown',   '非自願降等',            'Involuntary downgrade'],
    ['voldown',   '自願降等',              'Voluntary downgrade'],
    ['restore',   '復原（撤銷上一個動作）', 'Undo last action']
  ];
  function fdActName929(a){var r=FDACT929.filter(function(x){return x[0]===a})[0];return r?(z()?r[1]:r[2]):a}
  var CABO929=['Economy','Premium','Business','First','Resident'];
  function cabZh929(c){return z()?({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙',Resident:'Residence'}[c]||c):c}
  function lowFare929(f,date,cab){try{var c=upgradeFare7(f,date,cab);return c?Math.round(+owPrice(Object.assign({},f,{date:date}),c,1)||0):0}catch(_){return 0}}
  function curFare929(f,date,x){try{return Math.round(+owPrice(Object.assign({},f,{date:date}),x.fare,1)||0)||lowFare929(f,date,x.cabin)}catch(_){return lowFare929(f,date,x.cabin)}}
  function freeSeat929(f,date,m,id,cab){var occ={};m.forEach(function(p){if(p.id!==id&&p.seat&&!p.offloadR929)occ[p.seat]=1});
    return (seatsFlat7(type7(f,date)).find(function(s){return s.cabin===cab&&!s.resident&&!occ[s.id]})||{}).id||''}
  function cabinsOn929(f,date){var h={};seatsFlat7(type7(f,date)).forEach(function(s){if(!s.resident)h[s.cabin]=1});return CABO929.filter(function(c){return h[c]})}
  function applyRow929(key,x,patch,f,date){
    var st=store7(key);st.rows[x.id]=Object.assign({},st.rows[x.id]||{},patch);
    if(x.real&&x.booking){var b=x.booking;
      if(patch.fare){b.segmentFare0826A=b.segmentFare0826A||{};b.segmentFare0826A[x.segmentKey]=patch.fare}
      if(patch.seat!==undefined){b.seats=b.seats||{};var so=b.seats[x.segmentKey]||{};if(x.seat)delete so[x.seat];if(patch.seat)so[patch.seat]=x.name;delete so._auto;b.seats[x.segmentKey]=so}
    }
  }
  function tell929(x,title,msg){
    if(!x.real||!x.booking)return;
    try{S.notifs=S.notifs||[];S.notifs.unshift({title:title,message:msg,date:todayISO(),read:false,userId:x.booking.userId||null,pnr:x.booking.pnr})}catch(_){}
    try{var p=(x.booking.paxList||[])[0]||{},mail=p.email||x.booking.contactEmail||'';if(mail&&typeof kgmNotify==='function')Promise.resolve(kgmNotify('booking.changed',{email:mail,pnr:x.booking.pnr,subject:title,message:msg})).catch(function(){})}catch(_){}
  }
  window.kgmFdActR929=function(key,id){
    var act=S.fdActR929||'';
    if(!act){alert(z()?'請先在表格上方的「作業動作」選擇要執行的動作。':'Pick an action above the table first.');return}
    var hit=upgradeFlightFromKey7(key),f=hit.f,date=hit.date;if(!f)return;
    var m=manifest7(f,date),x=m.find(function(q){return q.id===id});if(!x)return;
    var who=(S.adminUser&&(S.adminUser.name||S.adminUser.empId))||'GROUND',now=new Date().toISOString(),short=distOf(f.fr,f.to)<3000;
    var rec={act:act,at:now,by:who},prev={cabin:x.cabin,fare:x.fare,seat:x.seat};
    var cabs=cabinsOn929(f,date),ci=cabs.indexOf(x.cabin);
    if(x.offloadR929&&act!=='restore'){alert(z()?'這位旅客已移出本航班，請先「復原」。':'Passenger is offloaded; undo first.');return}
    if(act==='restore'){
      var st=store7(key),row=st.rows[id]||{},pv=row.prevR929;
      if(!row.opsActR929){alert(z()?'這位旅客沒有可以復原的作業動作。':'Nothing to undo.');return}
      var back={opsActR929:null,offloadR929:false,prevR929:null};if(pv){back.cabin=pv.cabin;back.fare=pv.fare;back.seat=pv.seat}
      applyRow929(key,x,back,f,date);logAct(z()?'航班資料：復原作業動作':'Flight file: undo',x.pnr+' '+f.code+' '+fdActName929(row.opsActR929.act));save();render();return;
    }
    if(act==='freeup'){
      if(x.real&&x.booking){window.groundUpgradeR7(key,id);return}
      var used=upgradeQuota7(key).length;if(used>=3){alert(z()?'本航班三個免費升等額度已用完。':'All three complimentary upgrades are used.');return}
      var tg=upgradeTarget7(f,date,x.cabin);if(!tg){alert(z()?'本艙等不可免費升等；地勤不得升至頭等艙。':'Not eligible.');return}
      var sf=freeSeat929(f,date,m,id,tg);if(!sf){alert(z()?'下一艙等目前沒有空位。':'No seat in the next cabin.');return}
      if(!confirm((z()?'確定免費升等 ':'Upgrade ')+x.name+' → '+cabZh929(tg)+' '+sf+'？'))return;
      upgradeQuota7(key).push({pnr:x.pnr,id:id,at:now,staff:who});
      rec.to=tg;applyRow929(key,x,{cabin:tg,fare:upgradeFare7(f,date,tg),seat:sf,groundUpgrade:true,opsActR929:rec,prevR929:prev},f,date);
      logAct(z()?'地勤免費升等':'Ground complimentary upgrade',x.pnr+' '+f.code+' '+x.cabin+'→'+tg+' '+sf);save();render();return;
    }
    if(act==='paidup'){
      var up=cabs.slice(ci+1).filter(function(c){return c!=='Resident'&&freeSeat929(f,date,m,id,c)});
      if(!up.length){alert(z()?'上面的艙等目前都沒有空位。':'No seats in higher cabins.');return}
      var to=up[0];if(up.length>1){var pick=prompt((z()?'升至哪個艙等？輸入編號：\n':'Upgrade to which cabin?\n')+up.map(function(c,i){return (i+1)+'. '+cabZh929(c)}).join('\n'),'1');if(pick===null)return;to=up[Math.max(0,Math.min(up.length-1,(+pick||1)-1))]}
      var diff=Math.max(0,lowFare929(f,date,to)-curFare929(f,date,x)),offer=Math.max(1000,Math.round(diff*0.75/500)*500);
      var amt=prompt((z()?('付費升等至 '+cabZh929(to)+'\n票價差額 NT$'+diff.toLocaleString()+'，現場優惠價（75%）：'):('Upgrade to '+to+'. On-site price:')),String(offer));if(amt===null)return;amt=Math.max(0,Math.round(+amt||0));
      var sp=freeSeat929(f,date,m,id,to);rec.to=to;rec.amount=amt;rec.diff=diff;
      applyRow929(key,x,{cabin:to,fare:upgradeFare7(f,date,to),seat:sp,opsActR929:rec,prevR929:prev},f,date);
      if(x.real&&x.booking){x.booking.total=(+x.booking.total||0)+amt;(x.booking.paidUpgradesR929=x.booking.paidUpgradesR929||[]).push({seg:x.segmentKey,to:to,amount:amt,at:now,by:who})}
      tell929(x,(z()?'現場付費升等完成 ':'Paid upgrade ')+f.code,(z()?('您的 '+f.code+'（'+date+'）已升等至 '+cabZh929(to)+' '+sp+'，收取 NT$'+amt.toLocaleString()+'。'):'Upgraded.'));
      logAct(z()?'地勤付費升等':'Ground paid upgrade',x.pnr+' '+f.code+' '+x.cabin+'→'+to+' NT$'+amt);save();render();return;
    }
    if(act==='invdown'||act==='voldown'){
      if(ci<=0){alert(z()?'已經是最低艙等。':'Already the lowest cabin.');return}
      var dn=cabs.slice(0,ci).reverse().filter(function(c){return freeSeat929(f,date,m,id,c)})[0];if(!dn){alert(z()?'下面的艙等沒有空位。':'No seat in a lower cabin.');return}
      var d2=Math.max(0,curFare929(f,date,x)-lowFare929(f,date,dn));
      var ref=act==='invdown'?Math.max(d2,Math.round(curFare929(f,date,x)*0.5/100)*100):d2;   /* 非自願：退差額，至少退原票價 50% */
      var ra=prompt((z()?(fdActName929(act)+' → '+cabZh929(dn)+'\n'+(act==='invdown'?'退還差額並補償（至少原票價 50%）：':'退還票價差額：')):'Refund amount:'),String(ref));if(ra===null)return;ra=Math.max(0,Math.round(+ra||0));
      var sd=freeSeat929(f,date,m,id,dn);rec.to=dn;rec.amount=ra;
      applyRow929(key,x,{cabin:dn,fare:upgradeFare7(f,date,dn),seat:sd,opsActR929:rec,prevR929:prev},f,date);
      if(x.real&&x.booking)(x.booking.refundsR60=x.booking.refundsR60||[]).push({at:now,segs:[x.segmentKey],fare:0,fee:0,noShow:0,net:ra,downgradeR929:act});
      tell929(x,(z()?'艙等異動與退款 ':'Cabin change & refund ')+f.code,(z()?('您的 '+f.code+'（'+date+'）改為 '+cabZh929(dn)+' '+sd+'，退還 NT$'+ra.toLocaleString()+'（原付款方式）。'):'Downgraded and refunded.'));
      logAct(z()?'地勤'+fdActName929(act):'Ground downgrade',x.pnr+' '+f.code+' '+x.cabin+'→'+dn+' 退 NT$'+ra);save();render();return;
    }
    if(act==='offload'||act==='comp'||act==='volbump'){
      var def=act==='offload'?0:(act==='comp'?(short?6000:18000):(short?4000:12000));
      var why='';
      if(act==='offload'){why=prompt(z()?'移出原因（例如：證件不符、未於截止時間報到、安全因素）：':'Reason:','');if(why===null)return}
      var amt2=def;if(act!=='offload'){var aa=prompt(z()?(fdActName929(act)+'\n補償金額（NT$，另安排下一班）：'):'Compensation (NT$):',String(def));if(aa===null)return;amt2=Math.max(0,Math.round(+aa||0))}
      rec.amount=amt2;rec.reason=why;
      applyRow929(key,x,{offloadR929:true,seat:'',physical:false,boarded:false,opsActR929:rec,prevR929:prev},f,date);
      if(x.real&&x.booking&&amt2)(x.booking.compR929=x.booking.compR929||[]).push({seg:x.segmentKey,act:act,amount:amt2,at:now,by:who});
      tell929(x,(z()?(act==='offload'?'航班異動通知 ':'改搭與補償通知 '):'Flight notice ')+f.code,
        z()?(act==='offload'?('您已被移出 '+f.code+'（'+date+'）'+(why?('，原因：'+why):'')+'。請洽機場櫃檯協助後續安排。')
            :('您 '+f.code+'（'+date+'）的座位已改為下一班，並提供補償 NT$'+amt2.toLocaleString()+'。'))
          :'Your flight arrangement has changed.');
      logAct(z()?'航班資料：'+fdActName929(act):'Flight file: '+act,x.pnr+' '+f.code+(amt2?(' NT$'+amt2):'')+(why?(' '+why):''));save();render();return;
    }
  };
  window.kgmFdFilterR929=function(q){S.fdQR929=String(q||'');fdApply929()};
  function fdApply929(){
    try{
      var q=String(S.fdQR929||'').trim().toLowerCase().replace(/\s+/g,' '),n=0,tot=0;
      var box=document.querySelector('#app .r7-manifest');if(!box)return;
      var inp=document.getElementById('k929FdQ');if(inp&&document.activeElement!==inp&&inp.value!==(S.fdQR929||''))inp.value=S.fdQR929||'';
      box.querySelectorAll('tbody tr').forEach(function(tr){
        if(tr.classList.contains('k55-grp')){var td=tr.firstElementChild;if(td&&!td.querySelector('.k929-grpl')){var w=document.createElement('span');w.className='k929-grpl';while(td.firstChild)w.appendChild(td.firstChild);td.appendChild(w)}return}
        var d=tr.getAttribute('data-q929');if(d==null)return;tot++;
        var ok=!q||q.split(' ').every(function(t){return d.indexOf(t)>=0});tr.style.display=ok?'':'none';if(ok)n++;
      });
      var cur=null,any=false;
      box.querySelectorAll('tbody tr').forEach(function(tr){
        if(tr.classList.contains('k55-grp')){if(cur)cur.style.display=(any||!q)?'':'none';cur=tr;any=false;return}
        if(tr.style.display!=='none'&&tr.getAttribute('data-q929')!=null)any=true;
      });
      if(cur)cur.style.display=(any||!q)?'':'none';
      var c=document.getElementById('k929FdN');if(c)c.textContent=q?((z()?'符合 ':'')+n+' / '+tot+(z()?' 位':'')):((z()?'共 ':'')+tot+(z()?' 位旅客':' passengers'));
    }catch(_){}
  }
  function fdBar929(){
    var act=S.fdActR929||'';
    return '<div class="k929-fdbar">'
      +'<label class="k929-fdq"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6b7a72" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
      +'<input id="k929FdQ" autocomplete="off" placeholder="'+(z()?'搜尋旅客姓名、PNR 或會員卡號':'Search name, PNR or member ID')+'" value="'+E(S.fdQR929||'')+'" oninput="kgmFdFilterR929(this.value)"></label>'
      +'<span class="k929-fdn" id="k929FdN"></span>'
      +'<label class="k929-fdact"><span>'+(z()?'作業動作':'Action')+'</span><select onchange="S.fdActR929=this.value;render()">'
      +'<option value="">'+(z()?'— 請選擇 —':'— choose —')+'</option>'
      +FDACT929.map(function(a){return '<option value="'+a[0]+'"'+(act===a[0]?' selected':'')+'>'+E(z()?a[1]:a[2])+'</option>'}).join('')+'</select></label>'
      +'<small>'+(z()?'選好動作後，按旅客列最右側的按鈕執行':'Then press the button at the end of a passenger row')+'</small></div>';
  }
  function fdCell929(k,x,legacy){
    var r=x.opsActR929,tag='';
    if(r&&r.act){var cls={offload:'bad',comp:'warn',volbump:'warn',invdown:'bad',voldown:'mut',paidup:'ok',freeup:'ok'}[r.act]||'mut';
      tag='<span class="k929-fdtag '+cls+'">'+E(fdActName929(r.act))+(r.to?(' → '+E(cabZh929(r.to))):'')+(r.amount?(' · NT&#36;'+Number(r.amount).toLocaleString()):'')   /* &#36;：避免被後面層的 String.replace 當成 $1 */+'</span>'}
    else if(x.groundUpgrade)tag=legacy;
    var act=S.fdActR929||'',lab=act?(z()?'執行':'Apply'):(z()?'選擇動作':'Pick action');
    return '<div class="k929-fdcell">'+tag+'<button class="k929-fdgo'+(act?'':' idle')+'" title="'+E(act?fdActName929(act):'')+'" onclick="kgmFdActR929(\''+A(k)+'\',\''+A(x.id)+'\')">'+lab+(act?(' · '+E(fdActName929(act).replace(/（.*$/,''))):'')+'</button></div>';
  }
  (function css929(){if(document.getElementById('k929-fd-css'))return;var st=document.createElement('style');st.id='k929-fd-css';
    st.textContent='.r7-manifest>div{position:sticky;left:0;z-index:3}'
      +'.k929-fdbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 12px;background:#fff;border-bottom:1px solid #ece7da}'
      +'.k929-fdq{display:flex;align-items:center;gap:8px;flex:1 1 280px;min-width:220px;border:1px solid #d6dee9;border-radius:10px;padding:0 10px;background:#fbfcfd}'
      +'.k929-fdq input{border:0!important;outline:0;box-shadow:none!important;background:transparent!important;height:36px;flex:1;font-size:13px;padding:0!important}'
      +'.k929-fdn{font-size:11.5px;color:#6b7a72;white-space:nowrap}'
      +'.k929-fdact{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:800;color:#0b493b;letter-spacing:.04em}'
      +'.k929-fdact select{height:36px;border:1px solid #cfd8d2;border-radius:10px;padding:0 10px;font-size:13px;background:#fff;min-width:210px}'
      +'.k929-fdbar small{font-size:10.5px;color:#8a94a0}'
      +'.k929-fdcell{display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:150px}'
      +'.k929-fdgo{border:1px solid #0b493b;background:#0b493b;color:#fff;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap}'
      +'.k929-fdgo.idle{background:#fff;color:#8a94a0;border-color:#d6dee9}'
      +'.k929-fdtag{display:inline-block;border-radius:999px;padding:2px 8px;font-size:10.5px;font-weight:800;white-space:nowrap}'
      +'.k929-fdtag.ok{background:#e7f4ee;color:#0b6b48}.k929-fdtag.bad{background:#fde8ec;color:#b3123a}.k929-fdtag.warn{background:#fff3dc;color:#8a5a00}.k929-fdtag.mut{background:#eef1f4;color:#5b6670}'
      +'.r7-manifest tr.k929-off td{opacity:.45}.r7-manifest tr.k929-off td:last-child{opacity:1}'
      +'.k929-grpl{position:sticky;left:12px;display:inline-block}'
      +'.k929-dh{display:inline-block;margin-left:4px;border-radius:999px;padding:1px 7px;font-size:9.5px;font-weight:900;background:#1d3557;color:#fff;letter-spacing:.03em}';
    (document.head||document.documentElement).appendChild(st)})();
  if(typeof render==='function'){var rd929=render;render=window.render=function(){var r=rd929.apply(this,arguments);[0,320,900].forEach(function(ms){setTimeout(fdApply929,ms)});return r}}
  window.searchOpsR7=function(){
