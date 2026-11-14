
/* 1004B：候補預判。使用者：「候補名單要分左右，左邊是里程升等右邊是員工票，兩邊都要排好順序，左邊要是按照申請順序決定先後，
   右邊員工票要是按照方案年資和倉等進行排序，然後系統要先預先判定好是哪個根據剩餘位置」
   座位分配順序（與後台「員工票狀態」共用同一份計算）：
     ① 調位組員（DH）先佔：已排座位的在座位庫存裡已經扣掉；還沒排座位的在這裡再扣
     ② 哩程升等依申請先後佔目標艙等；升等成功的人空出原本的座位
     ③ 員工票依 方案（ID25＞ID50＞ID90＞ZED＞本人免費）→ 年資 → 艙等（高艙等在前）→ 申請時間；
        有同性朋友同行的一律最後（員工票管理辦法）。同一張訂位（本人＋眷屬）要一起上才算候補成功。 */
var PLAN1004B={ID25:0,ID50:1,ID90:2,ZED:3,FREE:4};
var CAB1004B={First:0,Business:1,Premium:2,Economy:3};
var sbCache1004B={};
function cabOf1004B(c){
  c=String(c||'');if(CAB1004B[c]!=null)return c;
  try{var x=(FARES[c]||AWARD_FARES[c]||{}).cabin;if(x&&CAB1004B[x]!=null)return x}catch(_){}
  return /^P/.test(c)?'Premium':/^B/.test(c)?'Business':/^F/.test(c)?'First':'Economy';
}
function famOf1004B(r){
  if(r.famR1004B)return r.famR1004B;
  var b=r.booking,st=b&&b.staffTix&&typeof b.staffTix==='object'?b.staffTix:null,out=[];
  try{(b&&b.paxList||[]).slice(1).forEach(function(p,i){
    var fm=(st&&st.fam||[])[i]||{};
    out.push({name:[p.lastName,p.firstName].filter(Boolean).join('/')||fm.name||[fm.last,fm.first].filter(Boolean).join(' ')||'—',rel:fm.relation||fm.rel||'',inf:p.passengerType==='INF'});
  })}catch(_){}
  return out;
}
window.kgmStandbyPlanR1004B=function(code,date,fr,to){
  var rows=[];try{rows=window.kgmStandbyListR40(code,date)||[]}catch(_){}
  var key=[code,date,fr||'',to||'',rows.map(function(r){return r.id}).join(','),(S.bookings||[]).length,JSON.stringify(S.sbSimR929||{}).length].join('|'),hit=sbCache1004B[key];
  if(hit&&Date.now()-hit.t<4000)return hit.v;
  var base=null;
  try{var all=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.partner});
    base=all.filter(function(x){return (!fr||x.fr===fr)&&(!to||x.to===to)})[0]||all[0]||null}catch(_){}
  var cap={},left={},dh=[];
  ['First','Business','Premium','Economy'].forEach(function(cb){
    cap[cb]=0;left[cb]=0;if(!base)return;
    try{var iv=window.kgmCabinInventory54(Object.assign({},base,{date:date}),date,cb)||{};cap[cb]=+iv.capacity||0;left[cb]=+iv.left||0}catch(_){}
  });
  /* ① DH */
  try{
    var kf=fr||(base&&base.fr),kt=to||(base&&base.to);
    ((S.crewPositioningR121||{})[[date,code,kf,kt].join('|')]||[]).forEach(function(p){
      if(!p||!p.empId||p.surfaceR928)return;
      var cb=CAB1004B[p.cabin]!=null?p.cabin:'Economy';
      dh.push({empId:p.empId,name:p.name||'',role:p.role||'',cabin:cb,seat:p.seat||''});
      if(!p.seat&&left[cb]>0)left[cb]--;
    });
  }catch(_){}
  /* 這架飛機沒有的艙等（例如全商務／豪經配置沒有經濟艙）一律往上找最近的艙等 */
  var UP1004B=['Economy','Premium','Business','First'];
  function near(c){for(var i=Math.max(0,UP1004B.indexOf(c));i<UP1004B.length;i++)if(cap[UP1004B[i]])return UP1004B[i];return c}
  var avail=Object.assign({},left);
  /* ② 哩程升等：申請先後 */
  var up=rows.filter(function(r){return r.kind==='upgrade'}).map(function(r){return Object.assign({},r,{atR1004B:String(r.at||'').replace('T',' ').slice(0,16)})});
  up.sort(function(a,b){return a.atR1004B.localeCompare(b.atR1004B)||String(a.id).localeCompare(String(b.id))});
  up.forEach(function(r,i){
    var tc=near(cabOf1004B(r.to)),fc=r.from?near(cabOf1004B(r.from)):null,n=Math.max(1,+r.pax||1);if(fc===tc)fc=null;
    r.rankR1004B=i+1;r.toCabR1004B=tc;r.fromCabR1004B=fc;
    if(cap[tc]&&avail[tc]>=n){avail[tc]-=n;if(fc&&fc!==tc&&cap[fc])avail[fc]+=n;r.clearR1004B=true}else r.clearR1004B=false;
  });
  var forStaff=Object.assign({},avail);
  /* ③ 員工票 */
  var staff=rows.filter(function(r){return r.kind==='staff'}).map(function(r){
    var b=r.booking,st=b&&b.staffTix&&typeof b.staffTix==='object'?b.staffTix:null,o=Object.assign({},r);
    o.planR1004B=String(st&&st.plan||r.to||'ID90').toUpperCase();
    var emp=st&&st.empId?(S.staff||[]).filter(function(x){return x&&x.empId===st.empId})[0]:null,j=emp&&(emp.joinDate||emp.hireDate);
    o.empIdR1004B=st&&st.empId||'';
    o.yearsR1004B=r.years!=null?+r.years:(j?Math.max(0,(+String(date).slice(0,4))-(+String(j).slice(0,4))):0);
    var cabs=[];(st&&st.preferredCabins&&st.preferredCabins.length?st.preferredCabins:(r.cabsR1004B||['Economy'])).forEach(function(c){c=near(cabOf1004B(c));if(cap[c]&&cabs.indexOf(c)<0)cabs.push(c)});
    o.cabsR1004B=cabs.length?cabs:[near('Economy')];
    o.famR1004B=famOf1004B(r);
    o.friendR1004B=false;try{o.friendR1004B=!!(b&&window.kgmStxHasFriendR927&&window.kgmStxHasFriendR927(b))}catch(_){}
    o.atR1004B=String(r.at||'').replace('T',' ').slice(0,16);
    return o;
  });
  staff.sort(function(a,b){
    var pa=PLAN1004B[a.planR1004B],pb=PLAN1004B[b.planR1004B];pa=pa==null?2:pa;pb=pb==null?2:pb;
    return (a.friendR1004B?1:0)-(b.friendR1004B?1:0)||pa-pb||b.yearsR1004B-a.yearsR1004B
      ||CAB1004B[a.cabsR1004B[0]]-CAB1004B[b.cabsR1004B[0]]||a.atR1004B.localeCompare(b.atR1004B);
  });
  staff.forEach(function(r,i){
    var n=Math.max(1,1+r.famR1004B.filter(function(f){return !f.inf}).length,+r.pax||1);
    r.rankR1004B=i+1;r.seatsR1004B=n;r.clearR1004B=false;r.clearCabR1004B='';
    for(var k=0;k<r.cabsR1004B.length;k++){var c=r.cabsR1004B[k];if(avail[c]>=n){avail[c]-=n;r.clearR1004B=true;r.clearCabR1004B=c;break}}
  });
  function sum(o){return Object.keys(o).reduce(function(s,k){return s+(+o[k]||0)},0)}
  var v={code:code,date:date,flight:base,cap:cap,left:left,dh:dh,up:up,staff:staff,
    award:rows.filter(function(r){return r.kind==='award'}),
    forStaff:forStaff,forStaffTotal:sum(forStaff),after:avail,afterTotal:sum(avail),
    upClear:up.filter(function(r){return r.clearR1004B}).length,
    staffClearPax:staff.filter(function(r){return r.clearR1004B}).reduce(function(s,r){return s+r.seatsR1004B},0),
    staffPax:staff.reduce(function(s,r){return s+r.seatsR1004B},0)};
  if(Object.keys(sbCache1004B).length>300)sbCache1004B={};
  sbCache1004B[key]={t:Date.now(),v:v};
  return v;
};

/* 1004B：把某一天的「補出來的 DH」先算好（組員鏈一位一位算，分段在空檔做，不鎖畫面）。
   引擎自己排的 DH 本來就在 S.crewPositioningR121；補出來的要等那位組員的班表鏈算到那一天才會登記。
   航班資料（候補名單）與員工票狀態打開某一天時呼叫，算完重畫。鏈一律從今天起算，起點位置才正確。 */
var DHW1004B={};
window.kgmDhWarmR1004B=function(date){
  try{
    if(!date||DHW1004B[date]||typeof window.kgmCrewChainR210!=='function')return DHW1004B[date]==='done';
    var t0=T();if(date<t0||date>addDays(t0,21))return true;
    DHW1004B[date]='busy';
    var crew=(S.staff||[]).filter(function(s){return s&&s.empId&&/pilot|cabin|crew/.test(String(s.role||''))}),i=0;
    var n=Math.round((Date.parse(date)-Date.parse(t0))/86400000)+1;
    (function step(){
      var until=Date.now()+40;
      while(i<crew.length&&Date.now()<until){try{window.kgmCrewChainR210(crew[i].empId,t0,n)}catch(_){}i++}
      if(i<crew.length){setTimeout(step,30);return}
      DHW1004B[date]='done';sbCache1004B={};
      try{if(S.view==='admin'&&/flightdata|stxstatus/.test(String(S.adminTab||'')))render()}catch(_){}
    })();
  }catch(_){}
  return false;
};
