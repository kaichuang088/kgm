/* 0927C：休息日出勤（勞基法 §24 II）。週期取週一～週日，週日落在哪個月就算哪個月的薪水。
   資料＝組員班表（kgmCrewChainR210，組員自己看到的同一份）。
   · 只讀組員班表已經算好的日子：問更早、還沒算過的日期會讓 kgmCrewPlanR121 把整份快取倒掉重算
     （實測 7～8 秒，而且未來的班表會跟著重排），所以系統班表起點之前的日子不算，畫面註明起點。
   · 還沒排到的未來日子，在瀏覽器空檔一小段一小段往後補（跟組員班表分頁同一個方法），
     只在〈薪資功過〉分頁開著時做，算完重畫一次；380 位組員約 1.5 秒，分段做不鎖畫面。 */
var RDW927C={stamp:'',m:{},q:[],busy:false};
function ymEnd927C(ym){var y=+ym.slice(0,4),m=+ym.slice(5,7);return new Date(Date.UTC(y,m,0)).toISOString().slice(0,10)}
function ymNext927C(ym){var y=+ym.slice(0,4),m=+ym.slice(5,7);return new Date(Date.UTC(y,m,1)).toISOString().slice(0,7)}
function suns927C(ym){var s=ym+'-01',z=ymEnd927C(ym),out=[];while(new Date(s+'T12:00:00Z').getUTCDay()!==0)s=D(s,1);for(;s<=z;s=D(s,7))out.push(s);return out}
function stamp927C(){var st='';try{st=window.kgmRosterStampR121?String(window.kgmRosterStampR121()):''}catch(_){}return st}
function bucket927C(ym){var st=stamp927C();if(RDW927C.stamp!==st){RDW927C.stamp=st;RDW927C.m={};RDW927C.q=[]}return (RDW927C.m[ym]=RDW927C.m[ym]||{})}
function has927C(d){try{return !!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(d))}catch(_){return false}}
function range927C(ym){
  var su=suns927C(ym);if(!su.length)return null;
  var from=D(su[0],-6),to=su[su.length-1],a=from;
  while(a<=to&&!has927C(a))a=D(a,1);
  var b=a;if(a<=to)while(b<to&&has927C(D(b,1)))b=D(b,1);
  return {su:su,from:from,to:to,a:a<=to?a:null,b:a<=to?b:null};
}
function calc927C(empId,ym){
  var r=range927C(ym);if(!r)return {ym:ym,restDays:[],holidays:[],from:'',to:''};
  var res={ym:ym,restDays:[],holidays:[],from:r.from,to:r.to,dataFrom:r.a,dataTo:r.b,pending:!r.a||r.b<r.to};
  if(!r.a)return res;
  var n=Math.round((Date.parse(r.b)-Date.parse(r.a))/864e5)+1,by={};
  (window.kgmCrewChainR210(empId,r.a,n)||[]).forEach(function(x){
    var L=(x&&x.legs)||[];if(!L.length)return;
    var rep=Infinity,rel=-Infinity;
    L.forEach(function(l){var a=+l.reportUTC||((+l.depUTC||0)-60),b=+l.releaseUTC||((+l.arrUTC||0)+30);if(a<rep)rep=a;if(b>rel)rel=b});
    by[x.date]={h:Math.round(Math.max(0,Math.min(12,(rel-rep)/60))*10)/10,codes:L.map(function(l){return l.code}).join('+')};
  });
  r.su.forEach(function(sun){
    var w=[];for(var i=6;i>=0;i--){var d=D(sun,-i);if(by[d])w.push({date:d,h:by[d].h,codes:by[d].codes})}
    if(w.length>=6)res.restDays.push(w[5]);     /* 第 6 個執勤日＝休息日出勤 */
    if(w.length>=7)res.holidays.push(w[6]);     /* 第 7 個執勤日＝例假出勤 */
  });
  return res;
}
function crew927C(){return (S.staff||[]).filter(function(x){return x&&(x.role==='pilot'||x.role==='cabin')&&x.empId}).map(function(x){return x.empId})}
function run927C(){
  if(RDW927C.busy)return;
  RDW927C.busy=true;
  var idle=function(f){if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(f,{timeout:400});else setTimeout(f,40)};
  function slice(){
    if(!(S.view==='admin'&&S.adminTab==='salary')){RDW927C.busy=false;return}   /* 離開〈薪資功過〉就停，回來再接著算 */
    var st=stamp927C();if(RDW927C.stamp!==st){RDW927C.stamp=st;RDW927C.m={};RDW927C.q=[];RDW927C.busy=false;try{render()}catch(_){}return}
    if(!RDW927C.q.length){RDW927C.busy=false;try{render()}catch(_){}return}
    /* 要算的月份最後一個週日，組員班表還沒排到 → 先往後補一小段 */
    var to='';RDW927C.q.forEach(function(j){var su=suns927C(j[0]);if(su.length&&su[su.length-1]>to)to=su[su.length-1]});
    try{var cur=window.kgmCrewCursorR121?window.kgmCrewCursorR121():null;
      if(to&&!has927C(to)&&(!cur||cur<to)){window.kgmCrewStepR121(120,to);idle(slice);return}}catch(_){}
    var t0=Date.now();
    while(RDW927C.q.length&&Date.now()-t0<120){
      var j=RDW927C.q.shift(),b=RDW927C.m[j[0]]=RDW927C.m[j[0]]||{};
      var tr=((b[j[1]]||{}).tries||0)+1;
      try{b[j[1]]=calc927C(j[1],j[0])}catch(_){b[j[1]]={ym:j[0],restDays:[],holidays:[],err:1}}
      b[j[1]].tries=tr;
    }
    idle(slice);
  }
  idle(slice);
}
function want927C(ym,ids){
  var b=bucket927C(ym),seen={};
  RDW927C.q.forEach(function(j){seen[j[0]+'|'+j[1]]=1});
  ids.forEach(function(id){var r=b[id];if((!r||(r.pending&&(r.tries||0)<2))&&!seen[ym+'|'+id])RDW927C.q.push([ym,id])});   /* 算兩次還排不到就不再重排，避免空轉 */
  if(RDW927C.q.length)run927C();
}
window.kgmRestDayWorkR927C=function(empId,ym,now){
  ym=ym||T().slice(0,7);
  var b=bucket927C(ym),r=b[empId];
  if(r&&!r.pending)return r;
  if(now&&!r){try{r=b[empId]=calc927C(empId,ym)}catch(_){r=null}}   /* 本人：只讀已算好的日子，很快 */
  if(!r||(r.pending&&(r.tries||0)<2))want927C(ym,now?[empId]:crew927C());
  return r||{ym:ym,pending:true,restDays:[],holidays:[]};
};
window.kgmRestDayNextYmR927C=ymNext927C;
