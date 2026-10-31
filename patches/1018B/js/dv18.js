  /* ══ 1018A：航班轉降（Divert）══════════════════════════════════════════════════════════
     使用者：「如果發生一些事情Divert需要換組員，被臨時收到通知要換航班（可能該日也有該航線回來只是提早）然後去程可能多派一點，
     這個AI處理能力是要有的喔，像是JFK/EWR/BOS等-TPE可能天氣問題可能會要轉降KIX，這個航班資料也要顯示喔，可能調整workload等等」
     · 標記轉降（S.flightOverrides：Diverted＋轉降機場）→ 前台航班狀態、後台航班資料都看得到；
     · 長程（飛行 8 小時以上）或總值勤超過 13 小時 → 一定換組員：
         接替組員＝台北出發、同機型族、同職級、前後一天都沒有班的人（班少的優先，平衡工作量），搭最早一班 KGM 台北→轉降站（DH）過去接手飛完；
         去程多派：客艙多一位、長程再多一位機師備援（一起 DH 過去，萬一再出狀況直接上）；
         原組員在轉降站休息（至少 12 小時，或跟當天值勤一樣長），之後搭最早一班 KGM 回台北（DH）；
       短程而且值勤還夠 → 原組員地停加油後直接續飛，不換人；
     · 班表：接替組員與原組員那幾天寫進「移除班表」（S.crewOffR928，原因寫轉降）並重排，被連帶影響的組員一起通知（kgmCrewReplanR928）；
       當事人另外收到臨時通知（幾點到哪裡報到、搭哪一班）。
     · 紀錄存在 S.divertsR1018A（kgm18_divert，save() 有寫 → 前後台同步、重新整理後還在）。 */
  var DVR18={wx:'天氣',med:'旅客急病',tech:'機械故障',fuel:'油量',sec:'保安',ops:'營運'};
  function dvWhy18(t){t=String(t||'');return /天氣|weather|風|雷|雪|霧|颱/i.test(t)?'wx':/急病|醫療|medical|病/i.test(t)?'med':/機械|故障|tech/i.test(t)?'tech':/油/i.test(t)?'fuel':/保安|security|炸|威脅/i.test(t)?'sec':'wx'}
  function dvLoc18(m,ap){var h=8;try{h=(TZ[ap]!=null?TZ[ap]:8)}catch(_){}var d=new Date(Math.round(m+h*60)*60000).toISOString();return {d:d.slice(0,10),hm:d.slice(11,16),s:d.slice(5,10).replace('-','/')+' '+d.slice(11,16)}}
  function yieldUI(){return new Promise(function(r){setTimeout(r,0)})}
  function dvSC18(a,b){try{return window.kgmSameCityR928(a,b)}catch(_){return a===b}}
  async function dvBuild18(a){
    var K=window.kgmCrewSwapKitR1006A,t=String(a.text||''),T0=Date.now()/60000;if(!K)return {text:'—'};
    var U=t.toUpperCase(),code=a.code||((/\bKX\s?(\d{1,4})\b/.exec(U)||[])[1]?'KX'+(/\bKX\s?(\d{1,4})\b/.exec(U)||[])[1]:''),date=a.date&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)?a.date:(dateOf(t)||T());
    var rt=/\b([A-Z]{3})(?:\s*\/\s*[A-Z]{3})*\s*(?:-|→|->|>|到|至|飛)\s*([A-Z]{3})\b/.exec(U),alt=String(a.alt||((/(?:轉降|改降|備降|DIVERT(?:ED)?\s*(?:TO)?|降落?在?)\s*(?:到|至|在)?\s*([A-Z]{3})\b/.exec(U)||[])[1])||'').toUpperCase(),why=a.reason||dvWhy18(t);
    var legs=function(d){try{return (window.kgmFlightsOnR121(d)||[]).filter(function(x){return x&&!x.positioning})}catch(_){return []}};
    var L=null,dd=[date,K.AD(date,-1)];for(var i=0;i<dd.length&&!L;i++){L=legs(dd[i]).filter(function(x){return code?(x.code===code&&(!rt||x.fr===rt[1]||x.to===rt[2])):(rt&&x.fr===rt[1]&&x.to===rt[2])})[0]||null;if(L&&!L.date)L.date=dd[i]}
    if(!L)return {text:(z()?'找不到 '+(code||(rt?rt[1]+'→'+rt[2]:''))+' '+date+' 的航班（班號或航線、日期要寫清楚，例如「KX31 10/20 天氣轉降 KIX」）。':'Flight not found.')};
    if(!alt||alt===L.to||alt===L.fr)return {text:z()?'要轉降到哪個機場？請寫三碼（例如 KIX）。':'Which diversion airport?'};
    try{if(TZ[alt]==null&&!(typeof AIRPORTS!=='undefined'&&AIRPORTS[alt]))return {text:(z()?'不認得機場 ':'Unknown airport ')+alt}}catch(_){}
    var fd=L.date||date,P=null,PM={},fam=function(x){try{return window.kgmTypeFamilyR121(x)}catch(_){return x}};
    var planOf=async function(d){if(PM[d])return PM[d];await yieldUI();try{PM[d]=window.kgmCrewPlanR121(d)||{}}catch(_){PM[d]={}}return PM[d]};
    P=await planOf(fd);var cf=((P.flights)||[]).filter(function(x){return x.code===L.code&&x.fr===L.fr})[0]||{pilots:[],cabin:[]};
    var dist=0;try{dist=distOf(alt,L.to)}catch(_){dist=1500}
    var blk=Math.max(60,(+L.arrUTC||0)-(+L.depUTC||0)),altArr=(+L.arrUTC||0)-Math.round(dist/14)+30;if(altArr<=(+L.depUTC||0)+45)altArr=(+L.depUTC||0)+Math.round(blk*0.85);
    var contBlk=Math.max(55,Math.round(dist/13.5)+25),duty=altArr-(+L.depUTC||0)+60,longH=blk>=480;
    var change=longH||duty+120+contBlk>780,restMin=Math.max(720,duty);
    var find=function(days,pred){var best=null;days.forEach(function(d){legs(d).forEach(function(x){if(pred(x)&&(!best||x.depUTC<best.depUTC)){best=x;if(!best.date)best.date=d}})});return best};
    var dl=[fd,K.AD(fd,1),K.AD(fd,2),K.AD(fd,3)],pos=null,ret=null,contDep=altArr+120;
    /* 接替組員先找直飛轉降機場的班（KIX 就是 KIX）；沒有才用同城市的機場（例如神戶），多留 90 分鐘地面接駁 */
    if(change){pos=find(dl,function(x){return dvSC18(x.fr,'TPE')&&x.to===alt&&x.depUTC>=Math.max(T0+150,altArr-300)});var xfer=0;
      if(!pos){pos=find(dl,function(x){return dvSC18(x.fr,'TPE')&&dvSC18(x.to,alt)&&x.depUTC>=Math.max(T0+150,altArr-300)});xfer=90}
      if(pos)contDep=Math.max(altArr+120,pos.arrUTC+75+xfer);else{contDep=altArr+restMin;change=false}}
    var contArr=contDep+contBlk;
    if(change)ret=find(dl,function(x){return dvSC18(x.fr,alt)&&dvSC18(x.to,'TPE')&&x.depUTC>=altArr+restMin});
    /* 接替組員：前後一天都沒班、同機型族、同職級；班少的先派 */
    var pick=[],gaps=[],used={},oldIds={};(cf.pilots||[]).concat(cf.cabin||[]).forEach(function(q){if(q&&q.empId)oldIds[q.empId]=1});
    if(change){
      var pd=dvLoc18(pos.depUTC,'TPE').d,W=[];for(var k=-3;k<=3;k++)W.push(K.AD(pd,k));
      var info={};for(var w=0;w<W.length;w++){var PP=await planOf(W[w]);((PP&&PP.flights)||[]).forEach(function(f){['pilots','cabin'].forEach(function(role){(f[role]||[]).forEach(function(q){if(!q||!q.empId)return;var o=info[q.empId]=info[q.empId]||{id:q.empId,name:q.name,role:role,rank:K.rankOf(q),fam:{},n:0,days:{},last:null};
        o.fam[fam(f.type)]=1;o.n++;o.days[W[w]]=1;if(W[w]<K.AD(pd,-1)&&(!o.last||W[w]>=o.last.d))o.last={d:W[w],to:f.to}})})})}
      var off=function(id){for(var j=-1;j<=2;j++){try{if(window.kgmCrewOffR928(id,K.AD(pd,j)))return true}catch(_){}}return false};
      var free=function(o){return !oldIds[o.id]&&!used[o.id]&&!o.days[K.AD(pd,-1)]&&!o.days[pd]&&!o.days[K.AD(pd,1)]&&(!o.last||dvSC18(o.last.to,'TPE'))&&!off(o.id)};
      var F0=fam(L.type),pool=Object.keys(info).map(function(id){return info[id]}).sort(function(x,y){return x.n-y.n||String(x.id).localeCompare(String(y.id))});
      var take=function(role,rank,label,extra){var c=pool.filter(function(o){return o.role===role&&o.rank===rank&&o.fam[F0]&&free(o)})[0];if(!c){gaps.push(label);return}used[c.id]=1;pick.push({empId:c.id,name:c.name,role:role,rank:rank,pos:label,extra:!!extra,n:c.n})};
      (cf.pilots||[]).forEach(function(q){take('pilots',K.rankOf(q),q.posZH||q.posCode||'機師')});
      (cf.cabin||[]).forEach(function(q){take('cabin',K.rankOf(q),q.posZH||q.posCode||'空服員')});
      /* 去程多派：客艙多一位；長程再多一位機師 */
      var fa=(cf.cabin||[]).filter(function(q){return !/PU|DPU/.test(q.posCode||'')})[0];if(fa)take('cabin',K.rankOf(fa),(z()?'備援空服員':'Spare FA'),true);
      if(longH){var fo=(cf.pilots||[]).filter(function(q){return !/PIC|TRI/.test(q.posCode||'')})[0];if(fo)take('pilots',K.rankOf(fo),(z()?'備援機師':'Spare pilot'),true)}
    }
    var key=L.code+'|'+fd+'|'+L.fr,a1=dvLoc18(altArr,alt),cd=dvLoc18(contDep,alt),ca=dvLoc18(contArr,L.to),pz=pos?dvLoc18(pos.depUTC,'TPE'):null,pa=pos?dvLoc18(pos.arrUTC,alt):null,rz=ret?dvLoc18(ret.depUTC,alt):null;
    var rec={key:key,code:L.code,date:fd,fr:L.fr,to:L.to,alt:alt,why:why,reason:DVR18[why]||why,type:L.type,tail:L.tail||'',at:new Date().toISOString(),by:(me()||{}).empId||'',
      altArr:altArr,contDep:contDep,contArr:contArr,change:change,longHaul:longH,duty:duty,
      pos:pos?{code:pos.code,fr:pos.fr,to:pos.to,date:pos.date,dep:pz.hm,arr:pa.hm}:null,ret:ret?{code:ret.code,fr:ret.fr,to:ret.to,date:ret.date,dep:rz.hm}:null,
      oldCrew:(cf.pilots||[]).concat(cf.cabin||[]).map(function(q){return {empId:q.empId,name:q.name,pos:q.posZH||q.posCode||''}}),newCrew:pick,gaps:gaps};
    S.divertsR1018A=S.divertsR1018A||{};S.divertsR1018A[key]=rec;
    S.flightOverrides=S.flightOverrides||{};var ok0=L.code+'_'+fd;S.flightOverrides[ok0]=Object.assign({},S.flightOverrides[ok0]||{},{status:'Diverted',divertTo:alt,arrRemark:(z()?'因'+rec.reason+'轉降 ':'Diverted ')+alt+'，續航 '+cd.s+' 起飛、'+ca.s+' 抵達 '+L.to,manual:true,divertR1018A:key});
    try{Object.keys(S.flightPredR7||{}).forEach(function(k){var v=S.flightPredR7[k];if(v&&k.indexOf(L.code)>=0&&k.indexOf(fd)>=0&&k.indexOf(L.fr)>=0)v.status='Diverted'})}catch(_){}   /* 航班資料頁的預測快取也改成轉降 */
    /* 通知當事人 */
    var nt=function(id,m){try{notifyStaff(id,m)}catch(_){}};
    var head='【轉降】'+L.code+' '+L.fr+'→'+L.to+'（'+fd+'）因'+rec.reason+'轉降 '+alt+'（預計 '+a1.s+' 落地）。';
    if(change){pick.forEach(function(c){nt(c.empId,'【臨時派遣・轉降支援】'+head+'請於 '+dvLoc18(pos.depUTC-90,'TPE').s+' 前到桃園機場 KGM 櫃檯報到，搭 '+pos.code+' TPE→'+pos.to+'（'+pz.s+' 起飛，DH）前往 '+alt+(c.extra?'，擔任備援':'，接手執飛 '+L.code+' '+alt+'→'+L.to+'（預計 '+cd.s+' 起飛）')+'。這幾天原本的班已改派其他組員。')});
      rec.oldCrew.forEach(function(c){nt(c.empId,head+'落地後在 '+alt+' 休息（公司安排住宿），'+(ret?(rz.s+' 搭 '+ret.code+' '+ret.fr+'→TPE（DH）返台'):'返台航班另行通知')+'；接下來幾天的班已改派，請留意新班表。')})}
    else rec.oldCrew.forEach(function(c){nt(c.empId,head+'地停加油後由原組員續飛，預計 '+cd.s+' 起飛、'+ca.s+' 抵達 '+L.to+'。')});
    /* 班表：接替組員與原組員那幾天移除並重排（被連帶影響的組員也會通知） */
    if(change&&typeof window.kgmCrewReplanR928==='function'){
      var ex={},offs=[],add=function(id,nm,from,to,why2){var o=ex[id]=ex[id]||{};K.each(from,K.AD(to,2),function(d){o[d]=1});offs.push({id:'DV'+Date.now().toString(36)+offs.length,empId:id,name:nm,from:from,to:to,reason:why2,by:rec.by,at:rec.at,active:true,divertR1018A:key})};
      var cA=ca.d,rD=ret?dvLoc18(ret.arrUTC,'TPE').d:K.AD(a1.d,1);
      pick.forEach(function(c){add(c.empId,c.name,pz.d,cA>pz.d?cA:pz.d,'轉降支援 '+L.code+' '+alt+'→'+L.to)});
      var oA=K.AD(a1.d,1);   /* 原組員：轉降那一班照舊（不能把他們從這一班拿掉），落地隔天起休息＋返台 */
      rec.oldCrew.forEach(function(c){add(c.empId,c.name,oA,rD>oA?rD:oA,'轉降後在 '+alt+' 休息、DH 返台')});
      var all=Object.keys(ex).map(function(id){return Object.keys(ex[id])}).reduce(function(x,y){return x.concat(y)},[]).sort();
      rec.replan='pending';
      window.kgmCrewReplanR928({from:all[0],to:all[all.length-1],exclude:ex,reason:'轉降 '+L.code+' '+alt+'（'+rec.reason+'）',
        apply:function(){S.crewOffR928=S.crewOffR928||[];offs.forEach(function(r){S.crewOffR928.unshift(r)});try{window.KGM_CREW_OFF_VER_R928=(window.KGM_CREW_OFF_VER_R928||0)+1}catch(_){}},
        done:function(r){rec.replan=r.n;try{save()}catch(_){}}});
    }
    try{save()}catch(_){}try{render()}catch(_){}
    var E2=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
    var row=function(c){return '<tr><td>'+E2(c.pos)+'</td><td><b>'+E2(c.name)+'</b> <small>'+E2(c.empId)+'</small></td></tr>'};
    var html='<div class="k6sw-top"><b>'+E2(L.code+' '+L.fr+'→'+L.to+' '+fd)+'</b>　因'+E2(rec.reason)+'轉降 <b>'+E2(alt)+'</b>，預計 '+a1.s+'（當地）落地；機號 '+E2(L.tail||'—')+'（'+E2(L.type||'')+'）。</div>'
      +'<div class="k6sw"><div class="k6sw-h"><span>'+(z()?'處理方案':'Plan')+'</span><b>'+(change?(z()?'換組員':'Crew change'):(z()?'原組員續飛':'Same crew continues'))+'</b> <small>'+(longH?'長程（飛行 '+Math.round(blk/60*10)/10+' 小時）':'值勤 '+Math.round(duty/60*10)/10+' 小時')+'</small></div>'
      +'<div class="k6sw-n">'+(z()?'續航 ':'Continuation ')+E2(L.code+' '+alt+'→'+L.to)+'：'+cd.s+' 起飛 → '+ca.s+' 抵達（當地）</div>'
      +(change?('<div class="k6sw-n">接替組員搭 <b>'+E2(pos.code)+'</b> TPE→'+E2(pos.to)+'（'+pz.s+' 起飛、'+pa.s+' 抵達，DH）'+(gaps.length?'；<b style="color:#9b2c1c">還缺 '+gaps.length+' 位（'+E2(gaps.join('、'))+'）找不到同機型、同職級又有空的人，請人工指派</b>':'')+'</div>'
        +'<div class="k6sw-t"><table><thead><tr><th>'+(z()?'位置':'Position')+'</th><th>'+(z()?'接替組員（臨時通知已送出）':'Relief crew')+'</th></tr></thead><tbody>'+pick.map(row).join('')+'</tbody></table></div>'
        +'<div class="k6sw-n">原組員 '+rec.oldCrew.length+' 位在 '+E2(alt)+' 休息 '+Math.round(restMin/60)+' 小時以上，'+(ret?(rz.s+' 搭 <b>'+E2(ret.code)+'</b> '+E2(ret.fr)+'→TPE（DH）返台'):'返台航班另行安排')+'；接替組員與原組員這幾天的班已移除並重排，被影響的組員會收到班表異動通知。</div>')
       :('<div class="k6sw-n">短程、值勤時間還夠：地停加油約 2 小時後由原組員續飛，不需要換人。</div>'))+'</div>';
    window.KGM_DIVERT_R1018A=rec;
    return {text:(z()?'已處理轉降：':'Diversion handled: ')+L.code+' '+fd+' → '+alt+(change?('，接替組員 '+pick.length+' 位搭 '+pos.code+' 前往、原組員 '+(ret?ret.code:'另行')+' 返台'):'，原組員續飛')+(gaps.length?'；還缺 '+gaps.length+' 位要人工指派':''),html:html};
  }
  function divert18(a){
    var th={role:'assistant',text:'',pending:true,at:new Date().toISOString()};chat().push(th);persist();draw();
    setTimeout(function(){dvBuild18(a).then(function(r){return r},function(e){return {text:String(e&&e.message||e)}}).then(function(r){th.pending=false;th.text=r.text||'';th.html=r.html||'';th.at=new Date().toISOString();persist();draw()})},0);
    return {ok:true,quiet:true,msg:z()?'正在處理轉降：找接替組員、去程航班與原組員回程…':'Handling diversion…'};
  }
  window.kgmDivertR1018A=function(a){return dvBuild18(a||{})};
  /* 航班資料：選到有轉降紀錄的航班 → 最上面一張轉降卡 */
  window.kgmDivertCardR1018A=function(code,date,fr){
    var r=(S.divertsR1018A||{})[code+'|'+date+'|'+fr];if(!r)return '';
    var E2=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
    var a1=dvLoc18(r.altArr,r.alt),cd=dvLoc18(r.contDep,r.alt),ca=dvLoc18(r.contArr,r.to);
    return '<section style="border:1px solid #e7c58a;background:#fffaf0;border-radius:14px;padding:14px 18px;margin:0 0 14px"><div style="font-size:10px;letter-spacing:.16em;color:#a0762c;font-weight:800">DIVERSION · 轉降</div>'
      +'<h3 style="margin:4px 0 6px;color:#7a4b0c;font-size:17px">'+E2(r.code)+' '+E2(r.fr)+'→'+E2(r.to)+' 因'+E2(r.reason)+'轉降 '+E2(r.alt)+'</h3>'
      +'<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;font-size:12px;color:#5b4a2c">'
      +'<div><small style="display:block;color:#9a8460">轉降落地</small><b>'+a1.s+'</b>（'+E2(r.alt)+' 當地）</div><div><small style="display:block;color:#9a8460">續航起飛</small><b>'+cd.s+'</b> '+E2(r.alt)+'→'+E2(r.to)+'</div>'
      +'<div><small style="display:block;color:#9a8460">續航抵達</small><b>'+ca.s+'</b>（'+E2(r.to)+' 當地）</div><div><small style="display:block;color:#9a8460">組員</small><b>'+(r.change?'換組員':'原組員續飛')+'</b>'+(r.change&&r.pos?' · 接替 '+r.newCrew.length+' 位搭 '+E2(r.pos.code):'')+'</div></div>'
      +(r.change?'<div style="margin-top:8px;font-size:12px;color:#5b4a2c">接替組員：'+r.newCrew.map(function(c){return E2(c.name)+'（'+E2(c.pos)+'）'}).join('、')+(r.gaps&&r.gaps.length?'；<b style="color:#9b2c1c">缺 '+r.gaps.length+' 位待人工指派</b>':'')+'<br>原組員 '+r.oldCrew.length+' 位在 '+E2(r.alt)+' 休息後'+(r.ret?'搭 '+E2(r.ret.code)+'（'+E2(r.ret.date.slice(5))+' '+E2(r.ret.dep)+'）返台':'返台航班另行安排')+'；工作量已調整（這幾天的班改派、重排並通知）。</div>':'')
      +'</section>'};
  try{var av18=typeof adminView==='function'?adminView:null;if(av18&&!av18.__dv18){adminView=function(){var h=String(av18.apply(this,arguments));try{if(S.adminAuthed&&S.adminTab==='flightdata'&&S.divertsR1018A){var p=String(S.opsSelectedR7||'').split('|');var c=p[0]?window.kgmDivertCardR1018A(p[0],p[1],p[2]):'';if(c)h=h.replace(/(<main[^>]*>)/,'$1'+c)}}catch(_){}return h};adminView.__dv18=1}}catch(_){}
