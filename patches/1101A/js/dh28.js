
/* ══ 1101A：組員 DH 調位改日期／改班（使用者 Round 2：「DH 座位是現場 assign，改票那些都要關閉，只有後台可以改；
   現在後台也無法改，基本上就是透過後台 AI 說要改一天回來之類的，然後系統要自動更新 PNR」）
   · 後台 AI 工具 dh_change：找出 DH 訂位（PNR 或員工編號＋班號／日期），在同一段航線上找新的一天（改晚一天／早一天／指定日期）或指定班次；
   · 紀錄寫在 S.dhMoveR1101A（kgm28_dhmove，save() 有寫 → 前後台同步）；r7 航班資料的 DH 名單（dhList929）讀這份：舊班拿掉、新班加上；
   · 訂位：PNR 不變，outF／dhR929 換成新班與新日期，座位清空（機場櫃檯劃位），組員收到通知；DH 訂位一律不寄 Email（寄信程式本來就排除 dhR929）。
   · 限制（老實寫）：組員班表引擎本身的調位紀錄不重排——班表頁那天仍顯示原本的 DH 腿；改到的那班不檢查組員休息規則（後台人員自己判斷）。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function ad(d,k){return new Date(Date.parse(d+'T12:00:00Z')+k*864e5).toISOString().slice(0,10)}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function md(s,base){var iso=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);if(iso)return iso[1]+'-'+String(+iso[2]).padStart(2,'0')+'-'+String(+iso[3]).padStart(2,'0');
    var m=/(\d{1,2})\s*[\/\-.月]\s*(\d{1,2})/.exec(s);if(!m)return '';var y=+String(base||T()).slice(0,4),d=y+'-'+String(+m[1]).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0');if(d<ad(String(base||T()),-180))d=(y+1)+d.slice(4);return d}
  function moves(){S.dhMoveR1101A=S.dhMoveR1101A||[];return S.dhMoveR1101A}
  function flies(f,d){try{return flyOn(f,new Date(d+'T12:00:00'))}catch(_){return false}}
  function seas(f,d){try{return Object.assign({},f,(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,d))||{},{date:d})}catch(_){return Object.assign({},f,{date:d})}}
  function sched(fr,to,d){return [].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&!f.via&&!f.partner&&f.fr===fr&&f.to===to&&flies(f,d)}).map(function(f){return seas(f,d)}).sort(function(a,b){return String(a.dep).localeCompare(String(b.dep))})}
  /* 航班資料 DH 名單：舊班拿掉、新班加上（最後一筆有效） */
  window.kgmDhMoveListR1101A=function(list,f,date){try{var M=moves();if(!M.length)return list;
    var last={};M.forEach(function(m){if(m&&m.active!==false)last[m.pnr]=m});
    var out=list.filter(function(p){return !Object.keys(last).some(function(k){var m=last[k];return m.empId===p.empId&&m.orig.code===f.code&&m.orig.date===date&&!(m.to.code===f.code&&m.to.date===date)})});
    Object.keys(last).forEach(function(k){var m=last[k];if(m.to.code===f.code&&m.to.date===date&&m.to.fr===f.fr&&!out.some(function(p){return p.empId===m.empId}))out.push({empId:m.empId,role:m.role,name:m.name,cabin:m.cabin,seat:'',dhMovedR1101A:m.pnr})});
    return out}catch(_){return list}};
  window.kgmDhChangeR1101A=function(a){try{
    a=a||{};var t=String(a.text||''),U=t.toUpperCase(),bk=(S.bookings||[]).filter(function(b){return b&&b.dhR929&&b.status!=='cancelled'});
    var pnr=String(a.pnr||'').toUpperCase(),emp=String(a.empId||'').toUpperCase();
    if(!pnr){var pm=U.match(/\b[A-Z0-9]{4}\b/g)||[];pm.some(function(x){if(bk.some(function(b){return b.pnr===x})){pnr=x;return true}})}
    if(!emp)emp=((/\b([A-Z]\d{5,6})\b/.exec(U)||[])[1])||'';
    var code=String(a.code||'').toUpperCase().replace(/\s+/g,'');var codes=(U.match(/\bKX\s?\d{1,4}\b/g)||[]).map(function(x){return x.replace(/\s+/g,'')});
    var ds=[],re=/(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\s*[\/月]\s*\d{1,2})/g,m;while((m=re.exec(t)))ds.push({i:m.index,d:md(m[1])});
    var b=null;
    if(pnr)b=bk.filter(function(x){return x.pnr===pnr})[0];
    else if(emp){var c=bk.filter(function(x){return x.dhR929.empId===emp&&x.dhR929.date>=T()});
      var c2=codes[0]?c.filter(function(x){return x.dhR929.flight===codes[0]}):c;if(c2.length)c=c2;
      c2=ds[0]?c.filter(function(x){return x.dhR929.date===ds[0].d}):c;if(c2.length)c=c2;
      c.sort(function(x,y){return String(x.dhR929.date).localeCompare(String(y.dhR929.date))});b=c[0]}
    if(!b)return {ok:false,msg:z()?'找不到這筆 DH 調位訂位：請寫訂位代號（4 碼，例如 8K3X）或員工編號＋班號／日期。':'DH booking not found.'};
    var h=b.dhR929,f0=b.outF||{},fr=f0.fr,to=f0.to,cur=h.date;
    /* 新日期 */
    var nd=a.toDate||'';
    if(!nd){var k=t.search(/改到|改成|改為|延到|提前到|換到|to\s/i);var after=ds.filter(function(o){return k>=0&&o.i>k});if(after[0])nd=after[0].d;
      else if(/晚一天|延一天|隔天|後一天|多留一天|\+1|later by one|one day later/i.test(t))nd=ad(cur,1);
      else if(/早一天|提前一天|前一天|-1|one day earlier/i.test(t))nd=ad(cur,-1);
      else{var n2=/(晚|延|延後)\s*(\d)\s*天/.exec(t),n3=/(早|提前)\s*(\d)\s*天/.exec(t);if(n2)nd=ad(cur,+n2[2]);else if(n3)nd=ad(cur,-n3[2]);}}
    var nc=code||codes.filter(function(x){return x!==h.flight})[0]||'';
    if(!nd&&nc)nd=cur;
    if(!nd)return {ok:false,msg:z()?('這筆是 '+b.pnr+' '+h.flight+' '+fr+'→'+to+' '+cur+'。要改到哪一天或哪一班？（例如「改晚一天」「改到 '+ad(cur,1).slice(5).replace('-','/')+'」「改搭 KX…」）'):'Which date or flight?'};
    if(nd<T())return {ok:false,msg:z()?'不能改到今天以前。':'Date is in the past.'};
    var opt=sched(fr,to,nd),pick=nc?opt.filter(function(f){return f.code===nc})[0]:(opt.filter(function(f){return f.code===h.flight})[0]||opt[0]);
    if(!pick){var alt=[];for(var i=-3;i<=3;i++){var d2=ad(nd,i);if(d2<T())continue;sched(fr,to,d2).forEach(function(f){alt.push(d2.slice(5).replace('-','/')+' '+f.code+' '+f.dep)})}
      return {ok:false,msg:(z()?(nd+' '+(nc||'')+' 沒有 '+fr+'→'+to+' 的 KGM 班次（聯營／夥伴航空的 DH 這版還不能用 AI 改）。前後三天可以搭：'):'No flight. Options: ')+(alt.slice(0,8).join('、')||'—')}}
    if(pick.code===h.flight&&nd===cur)return {ok:false,msg:z()?'已經是這一班了。':'Already on this flight.'};
    var cab=((FARES[b.outC]||{}).cabin)||'Economy',p0=(b.paxList||[])[0]||{},nm=String(((p0.firstName||'')+' '+(p0.lastName||'')).trim());
    var who=(window.myName&&window.myName())||((S.adminUser||{}).name)||'admin';
    var first=moves().filter(function(x){return x.pnr===b.pnr})[0];
    var rec={id:'DHM'+Date.now().toString(36).toUpperCase(),pnr:b.pnr,empId:h.empId,role:h.role,name:nm,cabin:cab,
      orig:first?first.orig:{code:h.flight,date:cur,fr:fr,to:to},from:{code:h.flight,date:cur,dep:f0.dep},to:{code:pick.code,date:nd,fr:fr,to:to,dep:pick.dep,arr:pick.arr,dd:pick.dd||0},
      by:who,at:new Date().toISOString(),reason:String(a.reason||''),active:true};
    moves().push(rec);
    b.outF=Object.assign({},pick);b.dhR929=Object.assign({},h,{flight:pick.code,date:nd});b.search=Object.assign({},b.search||{},{dep:nd});
    b.seats=b.seats||{};b.seats.out={};b.dhMovedR1101A=(b.dhMovedR1101A||[]).concat([{from:rec.from,to:rec.to,at:rec.at,by:who}]);
    try{b.checkinSegmentsR7&&delete b.checkinSegmentsR7.out}catch(_){}
    var txt=(z()?'【DH 調位異動】':'[DH change] ')+b.pnr+'：'+rec.from.code+' '+cur+' '+fr+'→'+to+(z()?' 改為 ':' → ')+pick.code+' '+nd+' '+pick.dep+(z()?' 起飛（座位於機場櫃檯報到時劃位）。':' (seat at the airport).');
    try{notifyStaff(h.empId,txt)}catch(_){}
    try{logAct('DH change',b.pnr+' '+rec.from.code+' '+cur+' → '+pick.code+' '+nd)}catch(_){}
    try{save()}catch(_){}try{render()}catch(_){}
    return {ok:true,msg:(z()?'已更新 DH 訂位 ':'DH booking updated ')+b.pnr+'（'+nm+'・'+h.empId+'）：'+rec.from.code+' '+cur+' '+fr+'→'+to+(z()?' 改為 ':' → ')+pick.code+' '+nd+' '+pick.dep+'–'+pick.arr+((+pick.dd)?'⁺'+pick.dd:'')
      +(z()?'。PNR 不變、座位機場劃位、已通知組員；航班資料兩班的 DH 名單會跟著換。組員班表頁那天的 DH 腿不會自動重排，請一併確認休息時間。':'.')}
  }catch(e){return {ok:false,msg:String(e&&e.message||e)}}};
})();
