window.KGM_EXTRA_TAILS_R203=EXTRA203;
/* ══ 0928A：後台自己新增飛機、退役飛機（使用者：「後台要可以直接新增某個機型的飛機數量（機身編號、年齡——
   每一架都要有年齡，其餘的就模擬，新的從輸入的年齡開始自動往上加，例如 1 年 5 個月；是買的還是租的），
   也要可以退役飛機（把某一天開始往後班表全部改派給其他台飛機）」）
   · 新增的飛機跟上面 ADD203 同一套：接在同一個獨立號段後面，不動任何既有機型的號段。
   · 資料存在 S.fleetAddedR928／S.fleetRetiredR928（跟著存檔，重新載入還在）。
   · 改班表一律「起飛前 7 天以上」：重排整年後，把今天到生效日前一天的輪轉原樣放回（跟 30 天鎖定同一個作法）。 */
function types928(){return ['B779','A388','B78X','B789','A21N','A21X','A359','A35K','A339L','A339R']}
function num928(r){var m=/^B-(\d{5})$/.exec(String(r||''));return m?+m[1]:0}
function allRegs928(){var s={};types928().forEach(function(t){try{(tailsFor(t)||[]).forEach(function(r){s[r]=t})}catch(_){}});return s}
function applyAdded928(){
  (S.fleetAddedR928||[]).forEach(function(a){
    if(!a||!a.type||!a.reg||OWNER203[a.reg])return;
    (EXTRA203[a.type]=EXTRA203[a.type]||[]).push(a.reg);OWNER203[a.reg]=a.type;ALL203.push(a.reg);
  });
}
/* 存檔：save() 只存固定的幾個欄位，這兩個自己存（跟 r48 kgm_r48 同一個做法） */
try{var ld928=LS.get('kgm_fleet_r928',null);if(ld928){S.fleetAddedR928=ld928.added||[];S.fleetRetiredR928=ld928.retired||{}}}catch(_){}
try{if(typeof save==='function'&&!save.__r928){var sv928=save;save=window.save=function(){var r=sv928.apply(this,arguments);try{LS.set('kgm_fleet_r928',{added:S.fleetAddedR928||[],retired:S.fleetRetiredR928||{}})}catch(_){}return r};save.__r928=1}}catch(_){}
try{applyAdded928()}catch(_){}
window.kgmTailUnavailR928=function(t,date){
  var r=(S.fleetRetiredR928||{})[t];if(r&&date>=r.from)return true;
  var a=(S.fleetAddedR928||[]);for(var i=0;i<a.length;i++)if(a[i]&&a[i].reg===t&&date<a[i].from)return true;
  return false;
};
function T928(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
function D928(d,n){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
function months928(a,b){var x=new Date(a+'T12:00:00Z'),y=new Date(b+'T12:00:00Z');return Math.max(0,(y.getUTCFullYear()-x.getUTCFullYear())*12+(y.getUTCMonth()-x.getUTCMonth())-(y.getUTCDate()<x.getUTCDate()?1:0))}
/* 每一架的機齡（月）：後台新增的 = 輸入的機齡＋輸入日到今天；其餘依機型平均機齡模擬（固定亂數，不會跳動） */
window.kgmTailAgeR928=function(reg,date){
  date=date||T928();
  var a=(S.fleetAddedR928||[]).filter(function(x){return x&&x.reg===reg})[0];
  var m,sim=false;
  if(a){m=(+a.ageMonths||0)+months928(a.enteredAt||date,date)}
  else{
    var t='';try{t=_typeOfTail(reg)||''}catch(_){}
    var avg=parseFloat(String(((typeof AC!=='undefined'&&AC[t])||{}).avgAge||'3'))||3;
    var h=0,s=String(reg);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
    var spread=Math.min(avg*0.8,2.5);
    m=Math.max(2,Math.round((avg+((h%1000)/1000*2-1)*spread)*12));sim=true;
  }
  var zh=true;try{zh=LANG!=='en'}catch(_){}
  var y=Math.floor(m/12),mm=m%12;
  return {months:m,years:Math.round(m/12*10)/10,simulated:sim,acq:a?a.acq:'',
    text:zh?((y?y+' 年 ':'')+mm+' 個月'):((y?y+'y ':'')+mm+'m')};
};
/* 重排並保留生效日之前的輪轉 */
function rebuildKeep928(from){
  var t0=T928(),keep={};
  Object.keys(S.tailAssign||{}).forEach(function(tl){keep[tl]=(S.tailAssign[tl]||[]).filter(function(x){return x&&x.date>=t0&&x.date<from}).map(function(x){return Object.assign({},x)})});
  try{window.kgmClearRotationCacheR72()}catch(_){}
  try{window.kgmPlanCacheClearR196&&window.kgmPlanCacheClearR196()}catch(_){}
  window.kgmRebuildFleetR72(null,366,true);
  Object.keys(S.tailAssign||{}).forEach(function(tl){S.tailAssign[tl]=(S.tailAssign[tl]||[]).filter(function(x){return !(x&&x.date>=t0&&x.date<from)})});
  Object.keys(keep).forEach(function(tl){if(!keep[tl].length)return;S.tailAssign[tl]=keep[tl].concat(S.tailAssign[tl]||[]).sort(function(a,b){return String(a.date).localeCompare(String(b.date))||String(a.dep||'').localeCompare(String(b.dep||''))})});
  try{window.kgmClearRotationCacheR72()}catch(_){}
  try{var g=window.kgmCoverGapsR135(false);if(g.missing&&g.missing<=300)window.kgmCoverGapsR135(true)}catch(_){}
  try{window.KGM_COVER_CACHE_R914=null}catch(_){}
  try{if(window.kgmCrewResetR121)window.kgmCrewResetR121()}catch(_){}
}
window.kgmFleetAddR928=function(o){
  o=o||{};var zh=true;try{zh=LANG!=='en'}catch(_){}
  var type=String(o.type||''),n=Math.max(1,Math.min(20,parseInt(o.count,10)||1));
  if(types928().indexOf(type)<0)return {ok:false,why:zh?'請選擇機型。':'Pick a type.'};
  var ageM=Math.max(0,(parseInt(o.ageY,10)||0)*12+(parseInt(o.ageM,10)||0));
  var from=String(o.from||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(from))from=D928(T928(),30);
  if(from<D928(T928(),7))return {ok:false,why:zh?'投入日最早是 7 天後（班表異動要提前 7 天通知旅客）。':'Entry date must be at least 7 days ahead.'};
  var regs=allRegs928(),want=String(o.reg||'').trim().toUpperCase(),list=[];
  if(want){
    if(n!==1)return {ok:false,why:zh?'指定機身編號時一次只能新增 1 架。':'Specify one registration at a time.'};
    if(!/^B-\d{5}$/.test(want))return {ok:false,why:zh?'機身編號格式是 B-12345。':'Registration format is B-12345.'};
    if(regs[want]||OWNER203[want])return {ok:false,why:(zh?'這個機身編號已經在使用：':'Already in use: ')+want};
    list.push(want);
  }else{
    var mx=0;Object.keys(regs).concat(ALL203).forEach(function(r){mx=Math.max(mx,num928(r))});
    for(var i=0;i<n;i++){var r='B-'+(++mx);while(regs[r]||OWNER203[r])r='B-'+(++mx);list.push(r)}
  }
  S.fleetAddedR928=S.fleetAddedR928||[];
  list.forEach(function(r){S.fleetAddedR928.push({reg:r,type:type,ageMonths:ageM,enteredAt:T928(),acq:o.acq==='lease'?'lease':'buy',from:from,at:new Date().toISOString()})});
  applyAdded928();
  rebuildKeep928(from);
  try{save()}catch(_){}
  try{render()}catch(_){}
  return {ok:true,regs:list,from:from};
};
window.kgmFleetRetireR928=function(reg,from){
  var zh=true;try{zh=LANG!=='en'}catch(_){}
  reg=String(reg||'').trim().toUpperCase();
  var t='';try{t=_typeOfTail(reg)||''}catch(_){}
  if(!t)return {ok:false,why:(zh?'查無這架飛機：':'Unknown aircraft: ')+reg};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(from||'')))return {ok:false,why:zh?'請選擇退役日。':'Pick a date.'};
  if(from<D928(T928(),7))return {ok:false,why:zh?'退役日最早是 7 天後（班表異動要提前 7 天通知旅客）。':'Retirement must be at least 7 days ahead.'};
  var same=0;try{same=(tailsFor(t)||[]).filter(function(x){return !(S.fleetRetiredR928||{})[x]}).length}catch(_){}
  if(same<=1)return {ok:false,why:zh?'這是這個機型最後一架，退役後沒有飛機可以接手。':'Last aircraft of its type.'};
  S.fleetRetiredR928=S.fleetRetiredR928||{};
  S.fleetRetiredR928[reg]={from:from,type:t,at:new Date().toISOString()};
  rebuildKeep928(from);
  var left=(S.tailAssign[reg]||[]).filter(function(x){return x&&x.date>=from}).length;
  try{save()}catch(_){}
  try{render()}catch(_){}
  return {ok:true,reg:reg,from:from,leftAfter:left};
};
window.kgmFleetUnretireR928=function(reg){
  if(!(S.fleetRetiredR928||{})[reg])return {ok:false};
  var from=S.fleetRetiredR928[reg].from;delete S.fleetRetiredR928[reg];
  var f2=from>D928(T928(),7)?from:D928(T928(),7);
  rebuildKeep928(f2);try{save()}catch(_){}try{render()}catch(_){}
  return {ok:true};
};
