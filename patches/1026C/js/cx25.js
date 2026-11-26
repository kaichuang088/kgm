  /* ── ① 取消航班 ──
     1025B（使用者：「取消所有10/23 03:00以後出發的航班 既然該日出發已經取消那回程也要取消 長程航班不取消…
       1) 取消這麼多航班才290個定位？？ 2) 我說長程不取消 但是有些長程的被取消」）
     · 以「整組輪轉」為單位：從基地（台北桃園／松山／高雄）出發、符合時間條件的班，連同同一架飛機接著飛的航段（經停後段、回程）
       一路到飛機回到基地，整組一起取消；同一架飛機的接續看飛機排班（S.tailAssign），沒有排到才用班號配對＋回程日期推算。
     · 長程（kgmIsLongHaulR71：輪擋 6 小時以上；整組只要有一段是長程就算）可以排除：「長程不取消」「除了長程」「只取消短程」；
       沒講而清單裡有長程，先問要不要一起取消。
     · 飛機已經在外站、當天才飛回基地的班照飛（飛機要回來），列出來；說「外站也取消」才一起取消。
     · 旅客數：航班資料同一份旅客名單（manifest7，含系統模擬訂位）＋線上訂位筆數分開寫；只有線上訂位會收到通知與退款。
     · 原本流程進行中說「長程航班不取消」會被當成新的取消指令整個重來（日期沒寫＝今天、時間沒寫＝全天）→ 否定句不算新指令。 */
  var HUB25={TPE:1,TSA:1,KHH:1};
  function same25(a,b){try{return a===b||!!(window.kgmSameCityR928&&window.kgmSameCityR928(a,b))}catch(_){return a===b}}
  function rowOf25(code,fr,to){return allF().filter(function(f){return f&&!f.via&&!f.partner&&f.code===code&&f.fr===fr&&(!to||f.to===to)})[0]||null}
  function isLong25(l){try{var f=rowOf25(l.code,l.fr,l.to);if(!f)return false;var x=Object.assign({},seasonal(f,l.date),{date:l.date});return !!(window.kgmIsLongHaulR71&&window.kgmIsLongHaulR71(x))}catch(_){return false}}
  function tailIdx25(){var idx={},T=S.tailAssign||{};
    Object.keys(T).forEach(function(tl){var L=(T[tl]||[]).filter(function(x){return x&&x.date&&x.code&&!x.positioningR830}).slice().sort(function(a,b){return (a.depAbs!=null&&b.depAbs!=null)?(a.depAbs-b.depAbs):(String(a.date).localeCompare(String(b.date))||mn(a.dep)-mn(b.dep))});
      L.forEach(function(x,i){var fr=x.fr||String(x.route||'').split('→')[0];idx[x.code+'|'+fr+'|'+x.date]={tl:tl,L:L,i:i}})});
    return idx}
  function legOf25(y){var fr=y.fr||String(y.route||'').split('→')[0],to=y.to||String(y.route||'').split('→')[1];return {code:y.code,fr:fr,to:to,date:y.date,dep:y.dep,arr:y.arr}}
  /* 從 x 開始，同一架飛機接著飛到回基地為止 */
  function rot25(x,IX){
    var out=[x],last=x,hit=IX[x.code+'|'+x.fr+'|'+x.date];
    if(HUB25[x.to])return out;
    if(hit){for(var j=hit.i+1;j<hit.L.length&&out.length<8;j++){var y=legOf25(hit.L[j]);if(!same25(y.fr,last.to))break;out.push(y);last=y;if(HUB25[y.to])return out}}
    /* 飛機排班找不到：同班號的後段（第五航權）→ 回程（班號配對、回程日期） */
    out=[x];last=x;
    for(var k=0;k<4&&!HUB25[last.to];k++){
      var nx=null,f0=rowOf25(last.code,last.fr,last.to);
      [0,1].forEach(function(dd){if(nx)return;var d2=D(last.date,dd);allF().forEach(function(f){if(nx||!f||f.via||f.partner||f.code!==last.code||f.fr!==last.to||f.to===last.fr)return;if(flies(f,d2)){var s2=seasonal(f,d2);nx={code:f.code,fr:f.fr,to:f.to,date:d2,dep:s2.dep,arr:s2.arr}}})});
      if(!nx&&f0&&window.kgmReturnLegR105){var bk=window.kgmReturnLegR105(f0);if(bk){var sd=seasonal(f0,last.date),bd=(window.kgmBackDateR99&&window.kgmBackDateR99(last.date,sd,seasonal(bk,last.date)))||D(last.date,1),sb=seasonal(bk,bd);nx={code:bk.code,fr:bk.fr,to:bk.to,date:bd,dep:sb.dep,arr:sb.arr}}}
      if(!nx)break;out.push(nx);last=nx}
    return out}
  /* 流程進行中，句子裡明確有日期／時間／班號／航點才算新的取消指令（「全部都要取消」「長程不取消」是回答，不是新指令） */
  function target25(t){return /\d{1,2}\s*[\/月]\s*\d{1,2}|20\d\d[-\/.年]|今天|今日|明天|明日|後天|KX\s?\d|\d{1,2}\s*[:：點]\s*\d{0,2}\s*(以後|之後|後|起|以前|之前|前)/i.test(t)||apsIn(t).length>0}
  function scopeIn(t,base){var sc=Object.assign({},base||{});
    if(/長程[^，。,;；\n]{0,6}(不|別|不要|免|除外|保留|照飛|不用)|(除了|不含|不包括|排除|扣除)[^，。,;；\n]{0,4}長程|只(取消)?(短程|中短程|區域)|短程就好/.test(t))sc.long='ex';
    else if(/長程也|包含長程|含長程|長程一起|全部(都)?取消|都要?取消|全部都要/.test(t))sc.long='in';
    if(/外站[^，。,;；\n]{0,4}(也|一起)|包含外站|含外站/.test(t))sc.away=true;
    else if(/外站[^，。,;；\n]{0,4}(照飛|不取消|不要取消|保留)/.test(t))sc.away=false;
    return sc}
  function findFlights(t,sc){
    sc=sc||{};
    var d=dateIn(t)||tpeNow().date,tm=timeIn(t),codes=(t.toUpperCase().match(/\bKX\s?\d{1,4}\b/g)||[]).map(function(x){return x.replace(/\s/g,'')}),aps=apsIn(t);
    var starts=[],seen={},IX=tailIdx25(),inTime=function(x){if(!tm)return true;var v=mn(x.dep);return tm.after?v>=tm.min:v<tm.min};
    allF().forEach(function(f){if(!f||f.partner||f.codeshare||f.via||!/^KX\d+$/.test(f.code))return;
      if(codes.length&&codes.indexOf(f.code)<0)return;
      if(!codes.length&&(aps.length?aps.indexOf(f.fr)<0:!HUB25[f.fr]))return;
      if(!flies(f,d))return;var x=seasonal(f,d),k=f.code+'|'+f.fr+'|'+d;if(seen[k])return;seen[k]=1;
      if(!inTime(x))return;if(ov(f.code,d).status==='Cancelled')return;
      starts.push({code:f.code,fr:f.fr,to:f.to,dep:x.dep,arr:x.arr,date:d})});
    starts.sort(function(a,b){return mn(a.dep)-mn(b.dep)||a.code.localeCompare(b.code)});
    var rots=[],used={},key=function(l){return l.code+'|'+l.fr+'|'+l.date};
    starts.forEach(function(s){if(used[key(s)])return;var L=rot25(s,IX).filter(function(l,i){return i===0||(!used[key(l)]&&ov(l.code,l.date).status!=='Cancelled')});L.forEach(function(l){used[key(l)]=1});rots.push({legs:L,long:L.some(isLong25)})});
    /* 飛機已在外站、當天（時間條件內）飛回基地的班 */
    var away=[];
    if(!codes.length&&!aps.length)allF().forEach(function(f){if(!f||f.partner||f.codeshare||f.via||!/^KX\d+$/.test(f.code)||HUB25[f.fr])return;if(!flies(f,d))return;var x=seasonal(f,d),l={code:f.code,fr:f.fr,to:f.to,dep:x.dep,arr:x.arr,date:d};
      if(used[key(l)]||!inTime(x)||ov(f.code,d).status==='Cancelled')return;used[key(l)]=1;l.long=isLong25(l);away.push(l)});
    if(sc.long==='ex')away=away.filter(function(l){return !l.long});   /* 長程不取消：外站的長程段也照飛 */
    var keep=rots.filter(function(r){return !(sc.long==='ex'&&r.long)}),excl=rots.filter(function(r){return sc.long==='ex'&&r.long});
    var list=[];keep.forEach(function(r){r.legs.forEach(function(l){list.push(l)})});if(sc.away)away.forEach(function(l){list.push(l)});
    /* 航班動態的取消是記在「班號＋日期」上（S.flightOverrides），同班號同一天的每一段都會一起變成取消：
       同班號同一天另一段是要保留的長程 → 這一段不能單獨取消（列出來）；其他情況把那一段也明列進清單，不偷偷多取消 */
    var inL={},blocked=[],add=[];list.forEach(function(l){inL[l.code+'|'+l.fr+'|'+l.date]=1});
    var byKey={};list.forEach(function(l){(byKey[l.code+'_'+l.date]=byKey[l.code+'_'+l.date]||[]).push(l)});
    Object.keys(byKey).forEach(function(k){var L0=byKey[k],c=L0[0].code,dd=L0[0].date,sib=[];
      allF().forEach(function(f){if(!f||f.via||f.partner||f.code!==c||inL[c+'|'+f.fr+'|'+dd])return;if(!flies(f,dd))return;var x=seasonal(f,dd);sib.push({code:c,fr:f.fr,to:f.to,date:dd,dep:x.dep,arr:x.arr})});
      if(!sib.length)return;
      if(sc.long==='ex'&&sib.some(isLong25)){L0.forEach(function(l){l.blockR1025B=1;blocked.push(l)});return}
      sib.forEach(function(x){x.sibR1025B=1;inL[c+'|'+x.fr+'|'+dd]=1;add.push(x)})});
    list=list.filter(function(l){return !l.blockR1025B}).concat(add);
    return {date:d,tm:tm,rots:keep,excl:excl,away:away,list:list,sc:sc,blocked:blocked,sib:add};
  }
  /* 旅客：航班資料同一份旅客名單（含系統模擬訂位，不建立 DH 訂位）＋線上訂位筆數 */
  async function count25(L){for(var i=0;i<L.length;i++){var x=L[i];if(x.px==null){var f=rowOf25(x.code,x.fr,x.to),n=0;
      if(f){window.KGM_NODH_R1023A=1;try{n=(window.manifest7(Object.assign({},seasonal(f,x.date)),x.date)||[]).length}catch(_){n=0}finally{window.KGM_NODH_R1023A=0}}
      x.px=n;x.pax=paxOn(x.code,x.date)}
    }}   /* 一次算完（約 1 秒）：分批讓出反而會被背景排班插隊，實測等 6 秒 */
  function hm25(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
  function legTxt(l,d0){return l.code+' '+l.fr+'→'+l.to+' '+(l.date!==d0?l.date.slice(5).replace('-','/')+' ':'')+l.dep+'（'+(l.px!=null?l.px+' 人':'')+(l.pax?'・線上 '+l.pax+' 筆':'')+'）'}
  function sum25(L){return L.reduce(function(a,x){a.px+=x.px||0;a.bk+=x.pax||0;return a},{px:0,bk:0})}
  function listTxt(R){
    var lines=R.rots.slice(0,15).map(function(r){return '· '+r.legs.map(function(l){return legTxt(l,R.date)}).join(' → ')+(r.long?'〔長程〕':'')});
    if(R.rots.length>15)lines.push('…另 '+(R.rots.length-15)+' 組');
    if(R.sc.away&&R.away.length)lines.push('· 飛機已在外站的航段（一起取消）：'+R.away.map(function(l){return legTxt(l,R.date)}).join('、'));
    return lines.join('\n')}
  function head25(R){
    var s=sum25(R.list),nLeg=R.list.length,nRet=nLeg-R.rots.length-(R.sc.away?R.away.length:0);
    var t=R.date+(R.tm?('，'+hm25(R.tm.min)+(R.tm.after?' 以後出發':' 以前出發')):'');
    var out='找到 '+R.rots.length+' 組要取消（'+t+'，從基地出發的班＋同一架飛機的後段與回程），共 '+nLeg+' 班（其中回程／後段 '+Math.max(0,nRet)+' 班）。\n'
      +'受影響旅客約 '+s.px.toLocaleString()+' 人（航班資料旅客名單，含系統模擬訂位）；其中線上訂位 '+s.bk.toLocaleString()+' 筆會收到通知與退款／改搭。\n'+listTxt(R);
    if(R.excl.length){var ne=R.excl.reduce(function(a,r){return a+r.legs.length},0);out+='\n\n長程不取消（照飛）：'+R.excl.length+' 組 '+ne+' 班 —— '+R.excl.slice(0,12).map(function(r){var cs=[];r.legs.forEach(function(l){if(cs.indexOf(l.code)<0)cs.push(l.code)});return cs.join('/')+'（'+[r.legs[0].fr].concat(r.legs.map(function(l){return l.to})).join('→')+'）'}).join('、')+(R.excl.length>12?'…':'')}
    if(R.blocked&&R.blocked.length)out+='\n\n同班號同一天另一段是長程（照飛），這幾段不能單獨取消、照飛：'+R.blocked.slice(0,12).map(function(l){return l.code+' '+l.fr+'→'+l.to}).join('、')+(R.blocked.length>12?'…':'')+'（航班動態的取消以班號＋日期為單位）。';
    if(R.sib&&R.sib.length)out+='\n\n同班號同一天的另一段也會一起取消（航班動態以班號＋日期為單位）：'+R.sib.slice(0,12).map(function(l){return l.code+' '+l.fr+'→'+l.to}).join('、')+(R.sib.length>12?'…':'')+'。';
    if(R.away.length&&!R.sc.away){var sa=sum25(R.away);out+='\n\n飛機已在外站的 '+R.away.length+' 班照飛（飛機要飛回基地，約 '+sa.px.toLocaleString()+' 人）：'+R.away.slice(0,12).map(function(l){return l.code+' '+l.fr+'→'+l.to}).join('、')+(R.away.length>12?'…':'')+'。要一起取消請說「外站也取消」。'}
    return out}
  var REASONS=[['天氣','Weather'],['機械','Technical'],['航管','ATC'],['營運','Operational'],['罷工','Industrial action'],['颱風','Typhoon'],['疫情','Public health']];
  var Q_REASON='\n\n① 取消原因是什麼？全部同一個原因就直接回答（天氣／颱風／機械故障／航管流量／營運調整／罷工／其他請描述）；每班不同請寫「KX12 天氣、KX14 機械」。說「算了」就放棄。';
  async function start(t,sc0){
    var T0=Date.now(),sc=scopeIn(t,sc0),R=findFlights(t,sc);
    if(!R.list.length&&!R.excl.length)return '找不到符合的航班（'+R.date+(R.tm?(' '+hm25(R.tm.min)+(R.tm.after?' 以後':' 以前')):'')+'）。已經取消的班不會重複列。';
    var T25=Date.now();await count25(R.list);await count25(R.away);window.KGM_CX_MS_R1025B={find:T25-T0,count:Date.now()-T25};
    var P=S.adminAiPendR1023A={kind:'cancel',step:'reason',text:t,sc:sc,R:R,list:R.list,date:R.date,at:Date.now()};
    var nl=R.rots.filter(function(r){return r.long});
    if(sc.long==null&&nl.length){P.step='scope';
      return head25(R)+'\n\n先確認範圍：其中 '+nl.length+' 組（'+nl.reduce(function(a,r){return a+r.legs.length},0)+' 班）是長程（輪擋 6 小時以上，'+nl.slice(0,8).map(function(r){return r.legs[0].code}).join('、')+(nl.length>8?'…':'')+'），要一起取消嗎？回答「長程不取消」或「長程也取消」。'}
    if(!R.list.length){S.adminAiPendR1023A=null;return head25(R)+'\n\n排除長程之後沒有要取消的班。'}
    return head25(R)+Q_REASON;
  }
