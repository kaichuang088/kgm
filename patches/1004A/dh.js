  /* ══ 1004A：以旅客身分調位（DH）的組員也列進航班資料 ═══════════════════════
     使用者：「航班資料要清楚顯示組員以旅客身分調位，並自動產生員工 PNR，可以在行程管理打開」
     · 來源：組員班表排出的調位紀錄 S.crewPositioningR121（日期｜班號｜起點｜終點 → 組員、艙等、座位）。
     · 每一筆產生固定的員工 PNR（D＋5 碼，由員工編號＋日期＋班號決定，重排班表也不會變），
       同時在訂位檔建立一筆員工票（staffTix／dhR929），用 PNR＋姓名就能在「行程管理」打開。
     · 航班資料表格裡這幾列標「DH 調位」，艙等欄寫「員工 · DH」，一眼分得出來。 */
  function dhPnr929(empId,date,code){var h=2166136261,s=empId+'|'+date+'|'+code;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}h>>>=0;
    var A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',o='D';for(var k=0;k<5;k++){o+=A[h%A.length];h=Math.floor(h/32)+(k+1)*7919}return o}
  var DHDATE929={};
  function dhList929(f,date){
    var key=[date,f.code,f.fr,f.to].join('|'),o=S.crewPositioningR121||{};
    if(!(o[key]&&o[key].length)&&!DHDATE929[date]){DHDATE929[date]=1;try{if(typeof window.crewOnFlight==='function')window.crewOnFlight(f.code,date)}catch(_){}o=S.crewPositioningR121||{}}
    return (o[key]||[]).filter(function(p){return p&&p.empId&&!p.surfaceR928})
  }
  function dhBooking929(p,f,date){
    var pnr=dhPnr929(p.empId,date,f.code),b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];
    if(b)return b;
    var nm=String(p.name||'').trim().split(/\s+/),first=(nm.slice(0,-1).join(' ')||nm[0]||'').toUpperCase(),last=(nm.length>1?nm[nm.length-1]:'').toUpperCase();
    var code={Economy:'E-C',Premium:'P-F',Business:'B-T',First:'F-X'}[p.cabin]||'E-C';
    var st=(S.staff||[]).filter(function(x){return x&&x.empId===p.empId})[0]||{};
    b={pnr:pnr,status:'confirmed',userId:null,staffTix:true,dhR929:{empId:p.empId,role:p.role,flight:f.code,date:date},
      search:{type:'OW',fr:f.fr,to:f.to,dep:date,pax:1},outF:Object.assign({},f,{date:date}),outC:code,inbF:null,
      paxList:[{title:'',firstName:first,lastName:last,passport:'',nat:'TW',email:st.email||(String(p.empId).toLowerCase()+'@kgm-airways.com'),kgmId:p.empId,passengerType:'ADT'}],contactEmail:st.email||(String(p.empId).toLowerCase()+'@kgm-airways.com'),
      seats:{out:p.seat?(function(){var o={};o[p.seat]=p.name;return o})():{}},mealChoice:{},total:0,curr:'TWD',bookedAt:new Date().toISOString(),
      ticketNumber:'297'+String(parseInt(pnr.slice(1),36)%10000000000).padStart(10,'0')};
    S.bookings=S.bookings||[];S.bookings.push(b);return b;
  }
  function dhRows929(f,date,k){
    var out=[],made=false;
    dhList929(f,date).forEach(function(p,i){
      var had=(S.bookings||[]).some(function(x){return x&&x.pnr===dhPnr929(p.empId,date,f.code)});
      var b=dhBooking929(p,f,date);if(!had)made=true;
      var sr=(S.staff||[]).filter(function(x){return x&&x.empId===p.empId})[0]||{},px=b.paxList[0]||{};
      out.push({id:'DH|'+p.empId,pnr:b.pnr,name:((px.lastName||'')+' '+(px.firstName||'')).trim()||String(p.name||'').toUpperCase(),dob:sr.dob||'',nationality:sr.nat||sr.nationality||'TW',email:sr.email||(String(p.empId).toLowerCase()+'@kgm-airways.com'),phone:sr.phone||'',last:(b.paxList[0]||{}).lastName||'',first:(b.paxList[0]||{}).firstName||'',
        member:p.empId,tier:'Staff',cabin:p.cabin||'Economy',fare:'DH',seat:p.seat||'',meal:'',freeBags:2,extraBags:0,physical:false,boarded:false,
        staff:true,dhR929:true,dhRole:p.role||'',passengerIndex:900+i,booking:null,segmentKey:'out',real:false,key:k});
    });
    if(made){try{save()}catch(_){}}
    return out;
  }
  window.kgmDhPnrR929=dhPnr929;
  /* 行程管理：用員工 PNR 查詢時，訂位檔裡還沒有就從調位紀錄補建（最多往後看 4 天） */
  window.kgmDhMaterializeR929=function(pnr){
    try{
      pnr=String(pnr||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
      if(!/^D[A-Z0-9]{5}$/.test(pnr)||(S.bookings||[]).some(function(x){return x&&x.pnr===pnr}))return false;
      function scan(){var o=S.crewPositioningR121||{},hit=null;Object.keys(o).some(function(key){var p=key.split('|');if(p[1]==='GT')return false;
        return (o[key]||[]).some(function(r){if(r&&r.empId&&dhPnr929(r.empId,p[0],p[1])===pnr){hit={r:r,date:p[0],code:p[1],fr:p[2],to:p[3]};return true}return false})});return hit}
      var h=scan();
      for(var d=0;!h&&d<4;d++){var dd=new Date(Date.now()+d*864e5).toISOString().slice(0,10);if(DHDATE929[dd])continue;DHDATE929[dd]=1;
        var f0=(FLIGHTS||[]).filter(function(x){return x&&!x.partner&&!x.via})[0];try{if(f0)window.crewOnFlight(f0.code,dd)}catch(_){}h=scan()}
      if(!h)return false;
      var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===h.code&&x.fr===h.fr&&x.to===h.to})[0];
      if(!f){var fl=h.r.flight||{};f={code:h.code,fr:h.fr,to:h.to,dep:fl.dep||'',arr:fl.arr||'',dd:+fl.dd||0,acft:fl.type||fl.acft||''}}   /* 經停航班的實體航段在 FLIGHTS 裡不一定有自己的一列 */
      dhBooking929(h.r,f,h.date);try{save()}catch(_){}return true;
    }catch(_){return false}
  };
  function manifest7(f,date){
