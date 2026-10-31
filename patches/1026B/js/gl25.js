/* 1025B：地勤請假 → 誰接手（同一天、同一套規則，把這位同仁當作沒請假再排一次，比對他原本那幾項工作現在是誰在做） */
var CV25={};
function gap25(date){return Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(T()+'T00:00:00Z'))/864e5)}
function tlab25(t){var f=(t.flights||[]).map(function(x){return x&&x.code}).filter(Boolean).join('／');
  return (t.kind==='ctr'?((z()?'報到櫃檯 ':'Counter ')+(t.counter||'')+(t.term?' · '+t.term:'')):(t.kind==='gate'?((z()?'登機門 ':'Gate ')+(t.gate||'—')):((z()?'到站 ':'Arrivals ')+(t.term||''))))+(f?' · '+f:'')}
window.kgmGroundCoverR1025B=function(ap,date,id){
  ap=String(ap||'TPE').toUpperCase();var k=ap+'|'+date+'|'+id+'|'+stamp8();if(CV25[k])return CV25[k];
  var P=plan8(ap,date);if(!P||!P.people[id]||BUSY8)return null;
  var B=null;BUSY8=true;IGN25=id;try{B=build8(ap,date)}catch(_){B=null}IGN25=null;BUSY8=false;
  if(!B||!B.people[id])return null;
  var q0=B.people[id],now={};(P.tasks||[]).forEach(function(t){now[t.key]=t});
  var out={ap:ap,date:date,empId:id,was:q0.off?'off':(q0.reserve?'reserve':'work'),from:q0.from!=null?hm(q0.from):'',to:q0.to!=null?hm(q0.to):'',tasks:[]};
  (q0.tasks||[]).slice().sort(function(a,b){return a.a-b.a}).forEach(function(t0){var t=now[t0.key],had={};(t0.who||[]).forEach(function(x){had[x]=1});
    if(t&&(t.who||[]).indexOf(id)>=0)return;   /* 指定時段請假：還是他做的不算 */
    var by=t?(t.who||[]).filter(function(x){return x!==id&&!had[x]}):[];
    out.tasks.push({key:t0.key,label:tlab25(t0),a:hm(t0.a),b:hm(t0.b),
      by:by.map(function(x){var q=P.people[x];return {empId:x,name:(q&&q.p&&q.p.name)||x}}),
      staffed:t?(t.who||[]).length:0,min:t?t.min:t0.min,short:!!(t&&(t.who||[]).length<t.min)})});
  CV25={};CV25[k]=out;return out;
};
function cover25html(ap,date,id,q){
  var lv=q.leaveR1025B||{},l=lv.l||{},zh=(typeof LEAVE_ZH!=='undefined'&&LEAVE_ZH[l.type])||'';
  var c=window.kgmGroundCoverR1025B(ap,date,id);
  var head='<div class="k25lv-h"><b>'+(z()?'本日請假':'On leave today')+(zh&&z()?'（'+E(zh)+'）':'')+'</b><span>'+E(lv.no||'')+(l.start?' · '+E(l.start)+(l.end&&l.end!==l.start?'～'+E(l.end):''):'')+'</span></div>';
  var body='';
  if(!c)body='<p class="k25lv-p">'+(z()?'這天的派工還在排，排好會列出每項工作由誰接手。':'Cover is being worked out.')+'</p>';
  else if(c.was!=='work')body='<p class="k25lv-p">'+(c.was==='reserve'?(z()?'原本是備勤（在家待命），不用找人代班。':'Was on reserve; no cover needed.'):(z()?'原本就是例休，不用找人代班。':'Was a rest day.'))+'</p>';
  else{
    var sh=c.tasks.filter(function(t){return t.short}).length;
    body='<p class="k25lv-p">'+(z()?('原本 '+E(c.from)+'–'+E(c.to)+' 的 '+c.tasks.length+' 項工作已改由同站同仁接手'+(sh?('，'+sh+' 項仍低於最少人力（值班主管調度）'):'，人力都到最少人力以上')+'：'):('Original shift '+E(c.from)+'–'+E(c.to)+': '+c.tasks.length+' duties re-assigned.'))+'</p>'
      +'<ul class="k25lv-list">'+c.tasks.map(function(t){
        return '<li'+(t.short?' class="short"':'')+'><time>'+E(t.a)+'–'+E(t.b)+'</time><b>'+E(t.label)+'</b><em>'
          +(t.by.length?t.by.map(function(x){return '<span>'+E(x.name)+' <small>'+E(x.empId)+'</small></span>'}).join(''):(z()?('同組同仁補位（現 '+t.staffed+' 人／最少 '+t.min+' 人）'):('Covered by the team ('+t.staffed+'/'+t.min+')')))
          +'</em></li>'}).join('')+'</ul>';
  }
  return '<div class="k74-person-jobs k8-jobs"><div class="k25lv">'+head+body+'</div></div>';
}
/* 核准時：清掉派工快取（指紋已含請假，下次讀就重排）；已排出派工的日子（到明天）通知接手的同仁 */
window.kgmGroundLeaveApplyR1025B=function(l){
  if(!l||!l.empId)return '';var st=staffOf8(l.empId);if(!st||st.role!=='ground')return '';
  var ap=station8(l.empId);if(!ap)return '';
  CACHE8={};CN8=0;CV25={};
  var tot=0,cov=0,sh=0,later=0,days=0,d=l.start,g=0,told={};
  while(d&&d<=(l.end||l.start)&&g++<62){var gp=gap25(d);
    if(gp>=-2&&gp<=1){var c=window.kgmGroundCoverR1025B(ap,d,l.empId);
      if(c&&c.was==='work'){days++;c.tasks.forEach(function(t){tot++;if(t.short)sh++;else cov++;
        t.by.forEach(function(x){var kk=x.empId+'|'+d;(told[kk]=told[kk]||{id:x.empId,d:d,t:[]}).t.push(t.a+'–'+t.b+' '+t.label)})})}}
    else if(gp>1)later++;
    try{d=addDays(d,1)}catch(_){break}}
  Object.keys(told).forEach(function(kk){var o=told[kk];try{notifyStaff(o.id,'【代班通知】'+(l.empName||l.empId)+' '+o.d+' 請假，以下工作改由您負責：'+o.t.join('；')+'。上下班時間以您的班表為準。')}catch(_){}});
  l.groundCoverR1025B={at:new Date().toISOString(),ap:ap,tasks:tot,covered:cov,short:sh,laterDays:later,people:Object.keys(told).length};
  return (z()?'請假當天改為休假':'Day(s) set to leave')+(tot?('；已排出的 '+tot+' 項櫃檯／登機門／到站工作改由 '+Object.keys(told).length+' 位同仁接手'+(sh?('（'+sh+' 項低於最少人力，值班主管調度）'):'')):'')
    +(later?('；其餘 '+later+' 天在前一天排派工時自動排給同仁'):'')+'。';
};
(function(){try{if(document.getElementById('k25lv-css'))return;var cs=document.createElement('style');cs.id='k25lv-css';
  cs.textContent='.k25lv{border:1px solid #ecd9b4;background:#fffaf0;border-radius:12px;padding:12px 14px}.k25lv-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}.k25lv-h b{font-size:14px;color:#8a5a12}.k25lv-h span{font-size:11px;color:#8a8578}'
   +'.k25lv-p{margin:6px 0 8px;font-size:12px;color:#4a4f4c;line-height:1.55}.k25lv-list{list-style:none;margin:0;padding:0;display:grid;gap:6px}'
   +'.k25lv-list li{display:grid;grid-template-columns:96px minmax(0,1fr) minmax(0,1.1fr);gap:10px;align-items:center;background:#fff;border:1px solid #efe6d4;border-radius:9px;padding:7px 10px;font-size:12px}'
   +'.k25lv-list time{font-variant-numeric:tabular-nums;font-weight:700;color:#0b493b}.k25lv-list b{font-weight:700;color:#26302c}.k25lv-list em{font-style:normal;color:#0b493b;font-family:inherit;font-weight:600;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px 12px;text-align:right}.k25lv-list em span{white-space:nowrap}.k25lv-list em small{color:#8a8578;font-weight:500;margin-left:3px}'
   +'.k25lv-list li.short{border-color:#efc2b5;background:#fff6f3}.k25lv-list li.short em{color:#b4472f}'
   +'.k25lv-part{background:#fff6e6!important}@media(max-width:640px){.k25lv-list li{grid-template-columns:1fr}}';
  document.head.appendChild(cs)}catch(_){}})();
window.kgmGroundLvSigR1025B=lvsig25;
