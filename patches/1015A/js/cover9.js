/* 1008B：無機可派的最後一道補位 —— 前兩輪（同站接上、TPE 成對去回）都放不進去的航段，
   允許插入「調機」（無乘客的定位航段，跟 r72 自己用的 positioningR830 同一種格式）：
   找一架同級或更大的機身（窄體／廣體不互換），只要它的空檔夠飛「調機過去 → 本段 → 調機接回下一勤務」就放進去。
   每一段都記在 out.fixed，機隊頁看得到是哪一架、補了哪一段。 */
function loc1008B(abs,ap){var s=new Date((abs+tz135(ap)*60)*60000).toISOString();return {date:s.slice(0,10),time:s.slice(11,16)}}
function ferryDur1008B(fr,to){var d=0;try{d=Math.max(55,Math.round((distOf(fr,to)||1200)/780*60+35))}catch(_){d=150}return d}
function ferryRow1008B(fr,to,depAbs,seq){
  var dur=ferryDur1008B(fr,to),a=loc1008B(depAbs,fr),b=loc1008B(depAbs+dur,to);
  return {row:{date:a.date,code:'KX89'+String(10+(seq%90)).padStart(2,'0'),route:fr+'→'+to,fr:fr,to:to,dep:a.time,arr:b.time,
    dd:Math.round((Date.parse(b.date)-Date.parse(a.date))/86400000),positioningR830:true,noPax:true,auto:true,r72:1,coverR1008B:true},
    iv:{a:depAbs,b:depAbs+dur,fr:fr,to:to}};
}
function ferryFill1008B(left,iv,tailType,out){
  var seq=0;
  left.forEach(function(m){
    if(m.ok1006A)return;
    var f=m.f,need=null;
    try{need=m.t||((typeof acftOfFlight==='function')?acftOfFlight(f.code,m.date,f.fr,f.to):f.acft)}catch(_){need=f.acft}
    var rk=RANK135[need]||3,a=abs135(m.date,f.dep,f.fr),bnd=a+durOf135(f),best=null;
    Object.keys(iv).forEach(function(t){
      if((S.tsaFleet||{})[t])return;
      if(window.kgmTailUnavailR928&&window.kgmTailUnavailR928(t,m.date))return;
      var tt=tailType[t];if(!tt)return;var r2=RANK135[tt]||0;
      if(r2<rk)return;if((rk<=1)!==(r2<=1))return;
      var l=iv[t],prev=null,next=null;
      for(var i=0;i<l.length;i++){if(l[i].b+TURN135<=a){prev=l[i];continue}if(l[i].a>=bnd+TURN135){next=l[i];break}return}
      if(!prev)return;                                         /* 不知道飛機在哪裡就不動 */
      var inF=prev.to!==f.fr,outF=!!(next&&next.fr!==f.to),d1=inF?ferryDur1008B(prev.to,f.fr):0,d2=outF?ferryDur1008B(f.to,next.fr):0;
      if(inF&&prev.b+TURN135+d1+TURN135>a)return;              /* 調機過去來不及 */
      if(outF&&bnd+TURN135+d2+TURN135>next.a)return;           /* 調機回下一勤務來不及 */
      var cost=(inF?1:0)+(outF?1:0),slack=a-prev.b;
      if(!best||cost<best.cost||(cost===best.cost&&slack<best.slack))best={t:t,cost:cost,slack:slack,prev:prev,next:next,inF:inF,outF:outF,d1:d1};
    });
    if(!best)return;
    var t=best.t,add=[];
    if(best.inF){var fi=ferryRow1008B(best.prev.to,f.fr,a-TURN135-best.d1,seq++);add.push(fi)}
    add.push({row:{date:m.date,code:f.code,route:f.fr+'→'+f.to,fr:f.fr,to:f.to,dep:f.dep,arr:f.arr,dd:+f.dd||0,auto:true,r72:1,coverR135:true,coverR1008B:true},iv:{a:a,b:bnd,fr:f.fr,to:f.to}});
    if(best.outF){var fo=ferryRow1008B(f.to,best.next.fr,bnd+TURN135,seq++);add.push(fo)}
    S.tailAssign[t]=S.tailAssign[t]||[];
    add.forEach(function(x){S.tailAssign[t].push(x.row);iv[t].push(x.iv)});
    iv[t].sort(function(p,q){return p.a-q.a});
    m.ok1006A=true;out.covered++;out.ferried=(out.ferried||0)+(best.inF?1:0)+(best.outF?1:0);
    out.fixed.push(m.date+' '+f.code+' '+f.fr+'→'+f.to+' → '+t+((best.inF||best.outF)?'（含調機）':''));
  });
}
/* 1008B：機隊頁「無機可派」不再只有一個數字 —— 列出是哪幾段，並可下載診斷檔（含這台電腦上保存的航班／機隊修改），
   下次如果還有缺口，直接把檔案給我們就能重現。 */
window.kgmCoverListR1008B=function(){
  try{
    var c=window.KGM_COVER_CACHE_R914,v=c&&c.v;if(!v||(!v.missing&&!v.notPlanned))return '';
    var zh=(typeof LANG==='undefined'||LANG!=='en'),E=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})};
    var h='<div class="k72-miss1008B" style="margin-top:10px;padding:12px 14px;border:1px solid #f0c9c4;border-radius:12px;background:#fff8f7;font-size:12px;line-height:1.7">';
    if(v.missing)h+='<b style="color:#a33a2c">'+(zh?('無機可派 '+v.missing+' 段（前 '+Math.min(40,(v.missList||[]).length)+' 段）'):(v.missing+' uncovered legs'))+'</b><div style="columns:2;column-gap:18px;color:#5b2a24">'
      +(v.missList||[]).slice(0,40).map(function(x){return '<div>'+E(x)+'</div>'}).join('')+'</div>';
    if(v.notPlanned)h+='<b style="color:#8a5a00">'+(zh?('時刻表有、但沒有進入機隊排班 '+v.notPlanned+' 段'):(v.notPlanned+' timetable legs not in the rotation plan'))+'</b><div style="columns:2;column-gap:18px;color:#6b4a00">'
      +(v.notPlannedList||[]).slice(0,40).map(function(x){return '<div>'+E(x)+'</div>'}).join('')+'</div>';
    h+='<button class="btn btn-sm" style="margin-top:8px" onclick="kgmFleetDiagR1008B()">'+(zh?'下載排班診斷檔':'Download diagnostics')+'</button></div>';
    return h;
  }catch(_){return ''}
};
window.kgmFleetDiagR1008B=function(){
  try{
    var keep={},skip=/^(kgm_tailasg|kgm_crewsched|kgmbk4|kgmus4|kgmu4|kgm_audit|kgm_chat|kgmnt4)$|key|token|secret|pass/i;   /* 金鑰、密碼一律不放進診斷檔 */
    for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(skip.test(k))continue;
      if(!/fleet|acft|flight|season|tail|_mx|fdis|cf4|bov4|dov4|ov4|tstat|tsa|master|ret/i.test(k))continue;
      var s=localStorage.getItem(k)||'';if(s.length<400000)keep[k]=s}
    var c=window.KGM_COVER_CACHE_R914,v=(c&&c.v)||{};
    var d={build:(typeof V!=='undefined'?V:document.title),at:new Date().toString(),tz:(function(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(_){return ''}})(),
      today:todayISO(),side:window.KGM_SIDE||'',cover:{window:v.window,expected:v.expected,missing:v.missing,missList:v.missList,notPlanned:v.notPlanned,notPlannedList:v.notPlannedList},
      split:(function(){try{return window.kgmLiveSplitR929()}catch(_){return null}})(),fleetSize:(function(){try{return Object.keys(S.tailAssign||{}).length}catch(_){return 0}})(),storage:keep};
    var blob=new Blob([JSON.stringify(d,null,1)],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='KGM_fleet_diag_'+todayISO()+'.json';document.body.appendChild(a);a.click();
    setTimeout(function(){try{URL.revokeObjectURL(a.href);a.remove()}catch(_){}},2000);
  }catch(e){alert('診斷檔產生失敗：'+(e&&e.message||e))}
};
