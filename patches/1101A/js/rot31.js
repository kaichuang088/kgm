/* ══ 1103A：機隊輪轉統一規則（使用者：「飛機排班之前明明就沒有問題為什麼現在又有問題」「排班邏輯要統一設定好 這是大問題不是檢查特定飛機就可以解決的」）══
   根因（1102A 以前就有）：
   ① 機隊排班頁的「＋」（kgmFleetAddR69）完全不檢查：不看時間、不看飛機在哪一站，直接把那一段塞進這架飛機，
      還把它從原本那架拿掉（原本那架停在外站、後面接不上）；手排的段會被釘住，之後每次重排都保留 → 一次點錯永遠錯。
   ② 航班狀態「換機身」（k23 applyPick／availTails）用「當地時間」比衝突（不同時區直接相減），也不看換過去之後下一段接不接得上；
      換機型時擋下來之前已經先把原機身那幾段刪掉。
   ③ 機身逐月排班的格子依當地出發時刻字串排序，看不出真正的先後。
   統一規則（全部讀這一份）：
   · 時間一律換成 UTC 分鐘比（kgmRotSpanR1103A）；
   · 搬動的單位是「一趟」＝從基地（TPE／TSA）出發到回到基地的連續航段（第五航權 TPE→BKK→FRA→BKK→TPE 整趟一起搬），
     不會把一趟拆開讓任何一架停在外站；
   · 搬進去之前檢查：那段時間沒有別的勤務（落地到下一段起飛至少：A388 90 分、A21N 60 分、其他廣體 75 分；基地 45 分）、
     前一段落地的機場＝這一趟出發的機場、這一趟回到基地後接得上下一段；被佔用的時段如果剛好是同機型族的完整一趟，就兩架對調（對調後兩架都要過同樣的檢查）；
   · 不過就完全不動，並說出原因；
   · 已經存在瀏覽器裡、會造成重疊或跳站的手排段（manualR69／byR1023A）自動撤銷釘選、交回自動派機補上（kgmRotSweepR1103A，開站排完、套用指定後、之後每分鐘）。 */
(function(){
  if(window.__rot31)return;window.__rot31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function tz(a){try{return (TZ&&TZ[a]!=null)?+TZ[a]:8}catch(_){return 8}}
  function mins(t){var p=String(t||'0:0').split(':');return (+p[0]||0)*60+(+p[1]||0)}
  function rt(x){return String((x&&x.route)||(((x&&x.fr)||'')+'→'+((x&&x.to)||''))).split('→')}
  function FR(x){return rt(x)[0]||''}function TO(x){return rt(x)[1]||''}
  var BASE={TPE:1,TSA:1};
  function same(a,b){return a===b||(!!BASE[a]&&!!BASE[b])}
  function sp(x){var d=Date.parse(String(x.date)+'T00:00:00Z')/60000;if(!isFinite(d))return [0,0];
    var a=d+mins(x.dep)-tz(FR(x))*60,b=d+(+x.dd||0)*1440+mins(x.arr)-tz(TO(x))*60;if(b<=a)b+=1440;return [a,b]}
  window.kgmRotSpanR1103A=sp;
  function typeOf(t){try{return window._typeOfTail(t)||''}catch(_){return ''}}
  function fam(t){t=String(t||'');return t==='A339L'||t==='A339R'?'A339':(t==='A21X'?'A21N':t)}
  function turn(t,ap){if(BASE[ap])return 45;t=String(t||'');return /^A38/.test(t)?90:(/^A21/.test(t)?60:75)}
  function ferry(x){return !!(x&&(x.positioningR830||x.ferryR830||x.ferryR1102A||/^KX89\d\d$/.test(String(x.code||''))))}
  function legsOf(t){return ((S.tailAssign||{})[t]||[]).filter(Boolean).slice().sort(function(a,b){return sp(a)[0]-sp(b)[0]})}
  /* 一趟：往前走到從基地出發的那一段、往後走到回到基地的那一段（中間每一段都要接得上） */
  function lineOf(L,x){var i=L.indexOf(x);if(i<0)return [x];var s=i,e=i;
    while(s>0&&!BASE[FR(L[s])]&&same(TO(L[s-1]),FR(L[s]))&&!ferry(L[s-1]))s--;
    while(e<L.length-1&&!BASE[TO(L[e])]&&same(FR(L[e+1]),TO(L[e]))&&!ferry(L[e+1]))e++;
    return L.slice(s,e+1)}
  function findLeg(spec){var TA=S.tailAssign||{},hit=null;Object.keys(TA).some(function(t){var L=TA[t]||[];for(var i=0;i<L.length;i++){var x=L[i];
      if(x&&x.code===spec.code&&x.date===spec.date&&(!spec.route||rt(x).join('→')===spec.route)){hit={tail:t,x:x};return true}}});return hit}
  function fmt(x){return x.code+' '+rt(x).join('→')+' '+x.date.slice(5)+' '+(x.dep||'')}
  /* 檢查 tail 加上 add、拿掉 rem 之後，跟 add 相鄰的接點是否合理 */
  function check(t,add,rem){var ty=typeOf(t),L=legsOf(t).filter(function(x){return rem.indexOf(x)<0}).concat(add).sort(function(a,b){return sp(a)[0]-sp(b)[0]});
    for(var i=1;i<L.length;i++){var a=L[i-1],b=L[i];if(add.indexOf(a)<0&&add.indexOf(b)<0)continue;
      var g=sp(b)[0]-sp(a)[1];
      if(g<0)return {ok:false,kind:'busy',why:(z()?'時間重疊：':'Overlap: ')+fmt(a)+' ／ '+fmt(b)};
      if(!same(TO(a),FR(b)))return {ok:false,kind:'away',why:(z()?'位置接不上：':'Position break: ')+fmt(a)+(z()?' 落地 ':' lands ')+TO(a)+(z()?'，下一段 ':', next ')+fmt(b)+(z()?' 從 ':' from ')+FR(b)};
      if(g<turn(ty,TO(a)))return {ok:false,kind:'busy',why:(z()?'過站時間不足（'+g+' 分，至少 '+turn(ty,TO(a))+' 分）：':'Turnaround too short: ')+fmt(a)+' → '+fmt(b)}}
    if(add.length){var f=L.filter(function(x){return add.indexOf(x)<0&&sp(x)[1]<=sp(add[0])[0]}).pop();
      if(!f&&!same('TPE',FR(add[0]))&&!BASE[FR(add[0])])return {ok:false,kind:'away',why:(z()?'這架飛機在 ':'Aircraft is not at ')+FR(add[0])+(z()?' 之前沒有勤務（不在該站）':'')}}
    return {ok:true}}
  function unavail(t,d){try{if((S.tailStatus||{})[t]==='maintenance')return z()?'維修中':'In maintenance';if(window.kgmTailUnavailR928&&window.kgmTailUnavailR928(t,d))return z()?'已退役／尚未交機':'Retired / not delivered';
      if((S.fleetMaintenanceR830||[]).some(function(m){return m&&m.tail===t&&d>=m.from&&d<=m.until}))return z()?'排定維修':'Scheduled maintenance'}catch(_){}return ''}
  /* 搬動：specs＝[{code,date,route}] 或航段物件；dest＝目標機身；opt.dry＝只檢查不改；opt.mark＝搬過去的段加上的旗標 */
  function move(specs,dest,opt){opt=opt||{};var TA=S.tailAssign=S.tailAssign||{};
    var got=(specs||[]).map(function(s){return s&&s.code&&s.date&&!s.route&&s.fr?findLeg({code:s.code,date:s.date,route:s.fr+'→'+s.to}):findLeg(s)}).filter(Boolean);
    if(!got.length)return {ok:false,kind:'none',n:0,why:z()?'找不到這一段（還沒排進任何飛機）':'Leg not assigned to any aircraft'};
    var src=got[0].tail;if(got.some(function(g){return g.tail!==src}))return {ok:false,kind:'busy',n:0,why:z()?'這幾段目前不在同一架飛機上':'Legs are on different aircraft'};
    if(src===dest)return {ok:true,n:0,noop:true};
    var u=unavail(dest,got[0].x.date);if(u)return {ok:false,kind:'mx',n:0,why:dest+' '+u};
    var LS=legsOf(src),line=[];got.forEach(function(g){lineOf(LS,g.x).forEach(function(x){if(line.indexOf(x)<0)line.push(x)})});
    line.sort(function(a,b){return sp(a)[0]-sp(b)[0]});
    var w0=sp(line[0])[0],w1=sp(line[line.length-1])[1],LD=legsOf(dest);
    /* dest 在這段時間（含前後過站）有的勤務 → 擴成完整的一趟 */
    var hit=LD.filter(function(x){var q=sp(x);return q[0]<w1+90&&w0-90<q[1]}),back=[];
    hit.forEach(function(x){lineOf(LD,x).forEach(function(y){if(back.indexOf(y)<0)back.push(y)})});
    back.sort(function(a,b){return sp(a)[0]-sp(b)[0]});
    var swap=back.length>0;
    if(swap){if(fam(typeOf(dest))!==fam(typeOf(src)))return {ok:false,kind:'busy',n:0,why:(z()?'這段時間 '+dest+' 已有勤務（'+fmt(back[0])+'），不同機型不能對調':'Busy: ')+''};
      if(back.some(ferry))return {ok:false,kind:'busy',n:0,why:(z()?'這段時間 '+dest+' 有調機／空機段（'+fmt(back.filter(ferry)[0])+'）':'Busy with positioning')};
      var c1=check(dest,line,back);if(!c1.ok)return {ok:false,kind:c1.kind,n:0,why:dest+'：'+c1.why};
      var c2=check(src,back,line);if(!c2.ok)return {ok:false,kind:c2.kind,n:0,why:(z()?'對調後 ':'After swap ')+src+'：'+c2.why}}
    else{var c=check(dest,line,[]);if(!c.ok)return {ok:false,kind:c.kind,n:0,why:dest+'：'+c.why}}
    if(opt.dry)return {ok:true,n:line.length,swap:swap,line:line.map(fmt),back:back.map(fmt)};
    TA[src]=(TA[src]||[]).filter(function(x){return line.indexOf(x)<0});TA[dest]=(TA[dest]||[]).filter(function(x){return back.indexOf(x)<0});
    line.forEach(function(x){x.manualR69=1;if(opt.mark)x[opt.mark]=1;delete x.auto;TA[dest].push(x)});
    back.forEach(function(x){x.manualR69=1;delete x.auto;TA[src].push(x)});
    [src,dest].forEach(function(t){TA[t].sort(function(a,b){return sp(a)[0]-sp(b)[0]})});
    try{window.IDX69=null}catch(_){}
    return {ok:true,n:line.length,swap:swap,src:src,line:line.map(fmt),back:back.map(fmt)}}
  window.kgmRotMoveR1103A=move;window.kgmRotCheckR1103A=check;window.kgmRotLineR1103A=function(t,x){return lineOf(legsOf(t),x)};
  /* 機隊排班頁「＋」：整趟搬到這架；被佔用的時段是完整的一趟就對調；不過就說原因、不改任何東西 */
  function wrapAdd(){var O=window.kgmFleetAddR69;if(typeof O!=='function'||O.__r31)return;
    var w=function(code,fr,to){try{var tail=window.kgmFsTailR1103A?window.kgmFsTailR1103A():S._fsTail,date=S._fsDate||todayISO();
        if(tail&&!unavail(tail,date)){S.tailAssign=S.tailAssign||{};S.tailAssign[tail]=S.tailAssign[tail]||[];var r=move([{code:code,date:date,route:fr+'→'+to}],tail,{});
          if(r.kind==='none'){   /* 還沒排進任何飛機的段：照這一天的季節時刻建一段，同樣要過檢查 */
            var f=null;try{f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(q){return q&&q.code===code&&q.fr===fr&&q.to===to})[0];if(f&&window.kgmSeasonFlightR48)f=window.kgmSeasonFlightR48(f,date)||f}catch(_){}
            if(f){var leg={date:date,code:code,route:fr+'→'+to,dep:f.dep,arr:f.arr,dd:f.dd||0,manualR69:1},c=check(tail,[leg],[]);
              if(c.ok){S.tailAssign[tail].push(leg);S.tailAssign[tail].sort(function(a,b){return sp(a)[0]-sp(b)[0]});try{window.IDX69=null}catch(_){}S._fsMsg='✓ '+(z()?'已把 ':'Assigned ')+fmt(leg)+(z()?' 放入 ':' to ')+tail;try{save()}catch(_){}}
              else S._fsMsg='✕ '+(z()?'不能放入：':'Cannot assign: ')+tail+'：'+c.why;
              try{render()}catch(_){}return}}
          if(r.kind!=='none'){S._fsMsg=r.ok?(r.noop?(z()?'這一段本來就在 '+tail+'。':'Already on '+tail):('✓ '+(z()?'已把整趟 ':'Moved ')+r.line.join('、')+(z()?' 放入 ':' to ')+tail+(r.swap?(z()?'；'+tail+' 原本那趟（'+r.back.join('、')+'）換給 '+r.src:'; swapped with '+r.src):(z()?'（自 '+r.src+' 移出）':' (from '+r.src+')')))):('✕ '+(z()?'不能放入：':'Cannot assign: ')+r.why);
            if(r.ok&&!r.noop){try{save()}catch(_){}}try{render()}catch(_){}return}}}catch(_){}
      return O.apply(this,arguments)};
    w.__r31=1;window.kgmFleetAddR69=w}
  /* 已存在的衝突：手排段造成重疊或跳站 → 撤銷釘選、拿掉，交回自動派機補 */
  var LOG=window.KGM_ROTFIX_R1103A=window.KGM_ROTFIX_R1103A||[];
  function sweep(){var TA=S.tailAssign||{},T0=todayISO(),n=0;
    Object.keys(TA).forEach(function(t){var L=legsOf(t).filter(function(x){return x.date>=addDays(T0,-1)}),bad=[];
      for(var i=1;i<L.length;i++){var a=L[i-1],b=L[i],g=sp(b)[0]-sp(a)[1];if(g>=0&&same(TO(a),FR(b)))continue;
        var man=function(x){return !!(x.manualR69||x.byR1023A)&&!ferry(x)};
        var pick=man(b)?b:(man(a)?a:null);if(!pick)continue;
        var before=bad.length;lineOf(L,pick).forEach(function(x){if(man(x)&&bad.indexOf(x)<0)bad.push(x)});
        if(bad.length>before&&LOG.length<300)LOG.push({at:new Date().toISOString(),tail:t,leg:fmt(pick),why:g<0?'overlap':'jump'})}
      if(bad.length){TA[t]=(TA[t]||[]).filter(function(x){return bad.indexOf(x)<0});n+=bad.length}});
    if(n){try{window.IDX69=null}catch(_){}try{if(window.kgmCoverGapsR135)window.kgmCoverGapsR135(true)}catch(_){}try{save()}catch(_){}}
    window.KGM_ROTSWEEP_R1103A={at:Date.now(),removed:n,total:LOG.length};return n}
  window.kgmRotSweepR1103A=sweep;
  function wrapReapply(){var O=window.kgmTailPickApplyR1023A;if(typeof O!=='function'||O.__r31)return;var w=function(){var r=O.apply(this,arguments);try{sweep()}catch(_){}return r};w.__r31=1;window.kgmTailPickApplyR1023A=w}
  function tick(){wrapAdd();wrapReapply()}
  tick();setTimeout(tick,0);setTimeout(tick,4000);
  var started=false;setInterval(function(){tick();if(!window.KGM_FULLDONE_1006A)return;
    if(!started){started=true;try{sweep()}catch(_){}return}
    try{if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)>3000)sweep()}catch(_){}},60000);
  setInterval(function(){if(window.KGM_FULLDONE_1006A&&!started){started=true;try{sweep()}catch(_){}}},5000);
})();

/* ══ 1103A：背景排班不跟著畫面停（使用者：「我希望後台組員排班、飛機排班可以在我看其他後台頁面甚至不在後台頁面時可以繼續跑
   現在一定要掛在那個tab像是組員排班他才會跑」；使用者選「只有後台檔」）══
   ① 切到別的瀏覽器分頁／縮小視窗：瀏覽器把看不見的頁面計時器壓到每秒一次、隱藏 5 分鐘後每分鐘一次，requestIdleCallback 幾乎不跑
      → 背景排班等於停住。隱藏時改由 Worker 計時叫醒（Worker 的計時器不受這個壓制）：組員引擎每 3 秒檢查一次、機隊整年重排每段接著做。
   ② 在後台其他頁（不是組員班表）操作時，原本要停手 20 秒才開始算、算完一天休息 8 倍時間 → 改成停手 6 秒、休息 3 倍（組員班表頁照舊 4 秒）。
   只在後台檔（KGM_SIDE 不是 front）；給旅客的前台檔不跑。 */
(function(){
  if(window.__bg31)return;window.__bg31=1;
  function adminFile(){return String(window.KGM_SIDE||'')!=='front'}
  var Q=[],wk=null,lastTick=0;
  function start(){if(wk||!adminFile())return;try{var u=URL.createObjectURL(new Blob(['setInterval(function(){postMessage(1)},250)'],{type:'text/javascript'}));wk=new Worker(u);wk.onmessage=pump}catch(_){wk=null}}
  function pump(){if(!document.hidden)return;var now=Date.now(),due=Q.filter(function(q){return q.at<=now});Q=Q.filter(function(q){return q.at>now});
    due.forEach(function(q){try{q.fn()}catch(_){}});
    if(now-lastTick>=3000&&typeof window.kgmCrewTickR1103A==='function'){lastTick=now;try{window.kgmCrewTickR1103A()}catch(_){}}}
  window.kgmBgSoonR1103A=function(fn,ms){ms=+ms||0;if(!document.hidden||!adminFile())return setTimeout(fn,ms);start();if(!wk)return setTimeout(fn,ms);Q.push({fn:fn,at:Date.now()+ms});return 0};
  window.kgmBgHiddenR1103A=function(){return !!(document.hidden&&adminFile())};
  try{document.addEventListener('visibilitychange',function(){if(document.hidden){start();return}var q=Q;Q=[];q.forEach(function(x){setTimeout(x.fn,Math.max(0,x.at-Date.now()))})})}catch(_){}
  if(adminFile())start();
})();
