  /* 0928B：組員班表工具（使用者第 11 點）——
     · 不可排班日：核准的請假＋後台移除的日期區間（r121 eligible 會看這裡）
     · 重排並比對：任何一次變更（請假核准、移除班表、排班更新、AI 換班）都先記下「之前」，重排後逐人比對，
       有變動的真人組員一律發通知（被移除的人、接手的人、後續班表連帶改變的人都算）
     · AI 換班：用中文寫需求，系統找出合法的對調，列出兩個人換前／換後的班表，核准後才寫入 */
  (function(){
    function Z(){try{return LANG!=='en'}catch(_){return true}}
    function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function AD(d,n){return addDays(d,n)}
    var OFFV=-1,OFFM={};
    window.KGM_CREW_OFF_VER_R928=window.KGM_CREW_OFF_VER_R928||0;
    function each(a,b,fn){var d=a,g=0;while(d<=b&&g++<400){fn(d);d=AD(d,1)}}
    function win(a,b){var o={};each(a,AD(b,3),function(d){o[d]=1});return o}   /* 只放開：請假／移除那幾天＋之後 3 天（夠把人從外站接回來），再往後照原本公布的班 */
    window.kgmCrewOffR928=function(id,date){
      var v=window.KGM_CREW_OFF_VER_R928;
      if(v!==OFFV){OFFV=v;OFFM={};
        (S.leave||[]).forEach(function(l){if(l&&l.status==='approved'&&l.empId&&l.start)each(l.start,l.end||l.start,function(d){(OFFM[l.empId]=OFFM[l.empId]||{})[d]='leave'})});
        (S.crewOffR928||[]).forEach(function(r){if(r&&r.active!==false&&r.empId&&r.from)each(r.from,r.to||r.from,function(d){(OFFM[r.empId]=OFFM[r.empId]||{})[d]='removed'})});}
      var m=OFFM[id];return m?(m[date]||false):false;
    };
    function bump(){window.KGM_CREW_OFF_VER_R928=(window.KGM_CREW_OFF_VER_R928||0)+1;window.KGM_EXTRA_DUTY_R927D={};try{window.kgmCrewResetR121()}catch(_){}}   /* 重排要跟 r121 自己整份重算時一樣乾淨，結果才會一致 */
    function crewStaff(){var o={};(S.staff||[]).forEach(function(s){if(s&&(s.role==='pilot'||s.role==='cabin')&&s.active!==false)o[s.empId]=s});return o}
    /* 查人用：排班池的組員（K2xxxxx 等）也要找得到；凍結與比對仍只看正式組員，排班池當作吸收異動的彈性人力 */
    function crewAll(){var o={};try{var P=window.kgmCrewPoolR121();(P.pilots||[]).concat(P.cabin||[]).forEach(function(q){if(q&&q.empId)o[q.empId]=q})}catch(_){}var r=crewStaff();Object.keys(r).forEach(function(k){o[k]=r[k]});return o}
    function snap(a,b){var m={};each(a,b,function(d){var p=null;try{p=window.kgmCrewPlanR121(d)}catch(_){}
      ((p&&p.flights)||[]).forEach(function(f){(f.pilots||[]).concat(f.cabin||[]).forEach(function(q){if(!q||!q.empId)return;var x=(m[q.empId]=m[q.empId]||{});x[d]=(x[d]?x[d]+'+':'')+f.code+' '+f.fr+'→'+f.to})})});
      Object.keys(S.crewPositioningR121||{}).forEach(function(k){var d=k.slice(0,10);if(d<a||d>b)return;(S.crewPositioningR121[k]||[]).forEach(function(q){if(!q||!q.empId||!q.flight||q.autoR913)return;var x=(m[q.empId]=m[q.empId]||{});x[d]=(x[d]?x[d]+'+':'')+(q.surfaceR928?'地面轉場 ':'DH ')+q.flight.fr+'→'+q.flight.to})});   /* autoR913 是 r210 看班表時才補的，不列入比對 */
      Object.keys(m).forEach(function(id){Object.keys(m[id]).forEach(function(d){m[id][d]=m[id][d].split('+').sort().join('+')})});   /* 同一天的順序不影響比對 */
      return m}
    /* 變更前先記、變更後重排、逐人比對、通知 —— 分段在瀏覽器空檔算（像組員班表暖機一樣），畫面不會卡住 */
    function idle(f){if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(f,{timeout:250});else setTimeout(f,20)}
    function warm(until,done){var g=0;(function step(){try{window.kgmCrewStepR121(140,until)}catch(_){}var c=null;try{c=window.kgmCrewCursorR121()}catch(_){}if((c&&c>=until)||g++>4000){done();return}idle(step)})()}
    /* before 的格式是「KX95 ZRH→TPE」「DH …」「地面轉場 …」；只凍結營運航班（調位由引擎自己安排） */
    function freeze(before,a,b,ex,from){
      var F=S.crewFreezeR928=S.crewFreezeR928||{},real=crewStaff(),t=todayISO();
      Object.keys(F).forEach(function(d){if(d<t)delete F[d]});
      Object.keys(real).forEach(function(id){var x=before[id]||{};each(a,b,function(d){
        var e=ex[id];if(e&&(typeof e==='string'?d>=e:!!e[d])){if(F[d])delete F[d][id];return}   /* 字串＝從那天起不凍結；物件＝只有那幾天不凍結 */
        var op=String(x[d]||'').split('+').filter(function(v){return v&&!/^(DH|地面轉場)/.test(v)}).map(function(v){var w=v.split(' ');return w[0]+'@'+String(w[1]||'').split('→')[0]}).join('|');   /* 一天兩段都要凍結；航班號＋出發站（第五航權同一班號一天有兩段） */
        (F[d]=F[d]||{})[id]=op||'__OFF__';   /* 已公布的休假日也鎖住：不能臨時被排班（否則會把隔天已公布的班擠掉、一路連鎖），空出來的班由排班池接手 */
      })});
    }
    var QUEUE928=[];window.kgmCrewBusyR928=function(){return !!S._crBusy928||QUEUE928.length>0};
    window.kgmCrewReplanR928=function(ctx,cb){
      if(S._crBusy928){QUEUE928.push([ctx,cb]);return}
      ctx=ctx||{};var t0=Date.now(),from=ctx.from||todayISO(),to=ctx.to||AD(from,13),a=AD(from,-2),b=AD(to,7);if(a<todayISO())a=todayISO();
      S._crBusy928={reason:ctx.reason||'',at:t0};S._crMsg928=(Z()?'重排中…（'+(ctx.reason||'排班更新')+'）完成後會通知有異動的組員。':'Re-planning…');try{render()}catch(_){}
      warm(b,function(){
        var before=snap(a,b);
        /* 已公布的班表先凍結：每位正式組員照原本的班飛，只有被請假／移除／換班影響到的人才重排 */
        if(ctx.freeze!==false)freeze(before,a,b,ctx.exclude||{},from);
        try{if(ctx.apply)ctx.apply()}catch(e){try{console.warn('0928B replan apply',e)}catch(_){}}
        bump();
        warm(b,function(){
          var after=snap(a,b),real=crewStaff(),changes=[],all=null;
          Object.keys(ctx.exclude||{}).forEach(function(id){if(!real[id]){all=all||crewAll();if(all[id])real[id]=all[id]}});   /* 被請假／移除／換班的當事人一定列入 */
          Object.keys(real).forEach(function(id){var x=before[id]||{},y=after[id]||{},lines=[];
            each(a,b,function(d){var o=x[d]||'',n=y[d]||'';if(o!==n)lines.push({d:d,o:o,n:n})});
            if(lines.length)changes.push({empId:id,name:real[id].name,role:real[id].role,lines:lines})});
          if(ctx.notify!==false)changes.forEach(function(c){try{notifyStaff(c.empId,'【班表異動】'+(ctx.reason||'排班更新')+'：'+c.lines.slice(0,5).map(function(l){return l.d.slice(5)+' '+(l.o||'休')+' → '+(l.n||(window.kgmCrewOffR928(c.empId,l.d)?'請假／移除':'休'))}).join('；')+(c.lines.length>5?'…共 '+c.lines.length+' 天':''))}catch(_){}});
          var rec={at:new Date().toISOString(),reason:ctx.reason||'排班更新',range:a+'～'+b,n:changes.length,ms:Date.now()-t0,changes:changes.slice(0,30),by:(S.adminUser||{}).empId||''};
          S.crewReplanLogR928=[rec].concat(S.crewReplanLogR928||[]).slice(0,8);
          try{logAct('組員班表重排',rec.reason+'　'+rec.range+'　異動 '+rec.n+' 人')}catch(_){}
          S._crBusy928=null;
          try{if(ctx.done)ctx.done(rec)}catch(_){}try{if(cb)cb(rec)}catch(_){}
          try{save()}catch(_){}try{render()}catch(_){}
          var nx=QUEUE928.shift();if(nx)window.kgmCrewReplanR928(nx[0],nx[1]);
        });
      });
    };
    /* 請假核准後自動重排（doLeaveDecide 呼叫） */
    window.kgmCrewLeaveApplyR928=function(l){
      if(!l)return null;var st=(S.staff||[]).filter(function(x){return x.empId===l.empId})[0];if(!st||(st.role!=='pilot'&&st.role!=='cabin'))return null;
      var exL={};exL[l.empId]=win(l.start,l.end||l.start);
      window.kgmCrewReplanR928({from:l.start,to:l.end||l.start,exclude:exL,reason:(Z()?'請假核准 ':'Leave approved ')+(l.empName||l.empId)+' '+l.start+'～'+(l.end||l.start),done:function(rec){
        var mine=(rec.changes||[]).filter(function(c){return c.empId===l.empId})[0],gone=mine?mine.lines.filter(function(x){return x.o&&x.d>=l.start&&x.d<=(l.end||l.start)}).length:0;
        l.crewReplanR928={at:rec.at,removed:gone,others:Math.max(0,rec.n-(mine?1:0))};
        S._crMsg928=(Z()?('✓ '+(l.empName||l.empId)+' 請假已套用：請假期間 '+gone+' 個航班改由其他組員執飛，連帶重排 '+Math.max(0,rec.n-(mine?1:0))+' 位組員的後續班表，全部已通知。'):'Leave applied.');}});
      return true;
    };
    /* 後台：移除某人某段日期的班表 */
    window.kgmCrewRemoveR928=function(){
      var v=function(id){return String((document.getElementById(id)||{}).value||'').trim()};
      var emp=v('k928crEmp').toUpperCase(),a=v('k928crFrom'),b=v('k928crTo')||a,why=v('k928crWhy');
      var st=crewAll()[emp];
      if(!st){alert(Z()?'查無此組員（員工編號）。':'No such crew member.');return}
      if(!a||b<a){alert(Z()?'請選擇正確的日期區間。':'Choose a valid date range.');return}
      if(!why){alert(Z()?'請填寫原因。':'Enter a reason.');return}
      var exR={};exR[emp]=win(a,b);
      window.kgmCrewReplanR928({from:a,to:b,exclude:exR,reason:(Z()?'後台移除 ':'Removed ')+st.name+' '+a+'～'+b+'（'+why+'）',apply:function(){
        S.crewOffR928=S.crewOffR928||[];S.crewOffR928.unshift({id:'CR'+Date.now(),empId:emp,name:st.name,from:a,to:b,reason:why,by:(S.adminUser||{}).empId||'',at:new Date().toISOString(),active:true});},
        done:function(rec){S._crMsg928=(Z()?'✓ 已移除 '+st.name+' '+a+'～'+b+' 的班表，重排後共 '+rec.n+' 位組員班表異動並已通知。':'Removed; '+rec.n+' crew changed and notified.')}});
    };
    window.kgmCrewRestoreR928=function(id){
      var r=(S.crewOffR928||[]).filter(function(x){return x.id===id})[0];if(!r)return;
      var exS={};exS[r.empId]=r.from;   /* 恢復＝整份重算這個人從那天起的班 */
      window.kgmCrewReplanR928({from:r.from,to:r.to,exclude:exS,reason:(Z()?'恢復班表 ':'Restored ')+r.name+' '+r.from+'～'+r.to,apply:function(){r.active=false;r.restoredAt=new Date().toISOString()},
        done:function(rec){S._crMsg928=(Z()?'✓ 已恢復，'+rec.n+' 位組員班表異動並已通知。':'Restored.')}});
    };
    window.kgmCrewUpdateR928=function(){
      window.kgmCrewReplanR928({from:todayISO(),to:AD(todayISO(),13),reason:Z()?'排班更新（依最新航班、機隊、請假重算）':'Roster update',
        done:function(rec){S._crMsg928=(Z()?'✓ 排班已更新（'+rec.range+'），'+rec.n+' 位組員班表有異動並已通知；其餘 60 天在背景補算。':'Updated; '+rec.n+' changed.')}});
    };
    /* ── AI 換班 ──────────────────────────────────────────── */
    var AP_ZH={'東京':['NRT','HND'],'成田':['NRT'],'羽田':['HND'],'大阪':['KIX'],'關西':['KIX'],'神戶':['UKB'],'首爾':['ICN','GMP'],'仁川':['ICN'],'金浦':['GMP'],'上海':['PVG','SHA'],'洛杉磯':['LAX'],'香港':['HKG'],'澳門':['MFM'],'曼谷':['BKK','DMK'],'札幌':['CTS'],'新加坡':['SIN'],'雪梨':['SYD'],'墨爾本':['MEL'],'倫敦':['LHR'],'巴黎':['CDG'],'紐約':['JFK'],'舊金山':['SFO'],'西雅圖':['SEA'],'溫哥華':['YVR'],'峇里島':['DPS'],'沖繩':['OKA'],'福岡':['FUK'],'名古屋':['NGO'],'釜山':['PUS']};
    function dutyOn(id,date){var p=null;try{p=window.kgmCrewPlanR121(date)}catch(_){}var hit=null;((p&&p.flights)||[]).some(function(f){var q=(f.pilots||[]).concat(f.cabin||[]).filter(function(x){return x&&x.empId===id})[0];if(q){hit={f:f,q:q};return true}return false});return hit}
    function dutyAll(id,date){var p=null;try{p=window.kgmCrewPlanR121(date)}catch(_){}return ((p&&p.flights)||[]).filter(function(f){return (f.pilots||[]).concat(f.cabin||[]).some(function(x){return x&&x.empId===id})}).sort(function(u,v){return (u.depUTC||0)-(v.depUTC||0)})}
    /* 整趟：從換班那天起，到回到台北（含松山）為止的所有航段 —— 換班要整趟換，不能只換去程把人留在外站 */
    function trip(id,d0){var legs=[],d=d0,g=0;while(g++<7){var fs=dutyAll(id,d);if(fs.length){fs.forEach(function(f){legs.push({d:d,code:f.code,fr:f.fr,to:f.to})});if(window.kgmSameCityR928(fs[fs.length-1].to,'TPE'))break}else if(!legs.length)break;d=AD(d,1)}return legs}
    function tripTxt(t){return t.map(function(l){return l.d.slice(5)+' '+l.code+' '+l.fr+'→'+l.to}).join('、')}
    function chainTxt(id,a,n){var out=[];try{(window.kgmCrewChainR210(id,a,n)||[]).forEach(function(x){out.push({d:x.date,t:(x.legs||[]).map(function(l){return (l.deadhead?(l.surfaceR928?'地面轉場 ':'DH '):'')+(l.deadhead?'':l.code+' ')+l.fr+'→'+l.to}).join('、')||'休'})})}catch(_){}return out}
    function parse(txt){
      var t=String(txt||''),r={ids:[],date:'',code:'',aps:[]},st=crewAll(),m,re=/\b([A-Z]\d{5,6})\b/g;
      while((m=re.exec(t.toUpperCase()))){if(st[m[1]]&&r.ids.indexOf(m[1])<0)r.ids.push(m[1])}
      Object.keys(st).forEach(function(id){var n=String(st[id].name||'');if(n&&t.toLowerCase().indexOf(n.toLowerCase())>=0&&r.ids.indexOf(id)<0)r.ids.push(id)});
      var d=/(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t)||null;
      if(d)r.date=d[1]+'-'+('0'+d[2]).slice(-2)+'-'+('0'+d[3]).slice(-2);
      else{d=/(\d{1,2})\s*[\/月]\s*(\d{1,2})/.exec(t);if(d){var y=+todayISO().slice(0,4),cand=y+'-'+('0'+d[1]).slice(-2)+'-'+('0'+d[2]).slice(-2);if(cand<todayISO())cand=(y+1)+cand.slice(4);r.date=cand}}
      var c=/\bKX\s?(\d{1,4})\b/i.exec(t);if(c)r.code='KX'+c[1];
      var u=t.toUpperCase();(u.match(/\b[A-Z]{3}\b/g)||[]).forEach(function(x){if(typeof CITY==='function'&&CITY(x)&&CITY(x)!==x&&r.aps.indexOf(x)<0)r.aps.push(x)});
      Object.keys(AP_ZH).forEach(function(k){if(t.indexOf(k)>=0)AP_ZH[k].forEach(function(x){if(r.aps.indexOf(x)<0)r.aps.push(x)})});
      return r;
    }
    function rankOf(q){return q.rankCode||q.rank||''}
    window.kgmCrewAiAskR928=function(){
      var txt=String((document.getElementById('k928aiTxt')||{}).value||'').trim(),P=parse(txt),st=crewAll(),REAL=crewStaff(),res={text:txt,at:new Date().toISOString(),ok:false,msgs:[]};
      S.crewAiR928=res;window.__k928aiTxt=txt;
      function done(){try{save()}catch(_){}try{render()}catch(_){}}
      if(!P.ids.length){res.msgs.push(Z()?'我沒有在需求裡找到組員（請寫員工編號，例如 K60012，或完整姓名）。':'No crew member found in the request.');return done()}
      if(!P.date){res.msgs.push(Z()?'請寫出要換的日期（例如 10/12）。':'Please include the date.');return done()}
      var X=P.ids[0],dx=dutyOn(X,P.date);
      if(!dx){res.msgs.push(Z()?(st[X].name+'（'+X+'）'+P.date+' 沒有排到航班，不需要換班；若是要休假請走請假或「移除班表」。'):'No duty that day.');return done()}
      var Y=P.ids[1]||null,dy=Y?dutyOn(Y,P.date):null;
      if(Y&&!dy){res.msgs.push(Z()?(st[Y].name+'（'+Y+'）'+P.date+' 沒有排到航班，無法對調。'):'The other person has no duty that day.');return done()}
      if(!Y){
        /* 只寫了目的地或航班：找當天符合的航班上、同職務同階級同機型族的人 */
        var p=null;try{p=window.kgmCrewPlanR121(P.date)}catch(_){}
        var fam=function(t){try{return window.kgmTypeFamilyR121(t)}catch(_){return t}};
        var cands=[];((p&&p.flights)||[]).forEach(function(f){
          if(f.code===dx.f.code)return;
          var hit=(P.code&&f.code===P.code)||(P.aps.length&&(P.aps.indexOf(f.to)>=0||P.aps.indexOf(f.fr)>=0&&P.aps.indexOf(f.to)>=0));
          if(!hit)return;
          if(fam(f.type)!==fam(dx.f.type))return;
          if(!window.kgmSameCityR928(f.fr,dx.f.fr))return;
          var list=st[X].role==='pilot'?(f.pilots||[]):(f.cabin||[]);
          list.forEach(function(q){if(q&&rankOf(q)===rankOf(dx.q)&&REAL[q.empId])cands.push({id:q.empId,f:f,q:q})});
        });
        if(!cands.length){res.msgs.push(Z()?('找不到可以對調的人：'+P.date+' 符合「'+(P.code||P.aps.join('/'))+'」、同機型族（'+fam(dx.f.type)+'）、同階級、而且同一站出發的航班上，沒有可以對調的正式組員。'):'No legal swap partner.');return done()}
        Y=cands[0].id;dy={f:cands[0].f,q:cands[0].q};
      }
      if(st[X].role!==st[Y].role||rankOf(dx.q)!==rankOf(dy.q)){res.msgs.push(Z()?'兩人職務或階級不同（'+rankOf(dx.q)+' / '+rankOf(dy.q)+'），不能互換。':'Different role or rank.');return done()}
      /* 模擬：指定兩人對調 → 重排 → 看結果 → 還原（核准前班表不動）；分段算，畫面不卡 */
      if(S._crBusy928){res.msgs.push(Z()?'班表正在重排，請稍候再試。':'Busy, try again shortly.');return done()}
      var a=AD(P.date,-1),n=7,until=AD(a,n+1);
      S._crBusy928={reason:'AI',at:Date.now()};res.msgs.push(Z()?'AI 規劃中…（正在模擬兩人對調後的班表）':'Planning…');res.pending=true;done();
      warm(until,function(){
        var bx=chainTxt(X,a,n),by=chainTxt(Y,a,n),tx=trip(X,P.date),ty=trip(Y,P.date);
        /* 整趟對調：X 飛 Y 的整趟、Y 飛 X 的整趟；外站過夜那幾天不排別的班 */
        var pins={},span=function(t){return t.length?t[t.length-1].d:P.date},endAll=span(tx)>span(ty)?span(tx):span(ty),exD={};
        each(P.date,endAll,function(d){exD[d]=1});
        function give(id,t){var e=span(t);each(P.date,e,function(d){var c=t.filter(function(l){return l.d===d}).map(function(l){return l.code+'@'+l.fr}).join('|');(pins[d]=pins[d]||{})[id]=c||'__LAYOVER__'})}
        give(X,ty);give(Y,tx);
        var fz0=JSON.stringify(S.crewFreezeR928||{}),exS={};exS[X]=exD;exS[Y]=exD;freeze(snap(a,until),a,until,exS,P.date);   /* 模擬時其他人照原班，只看兩人 */
        S.crewPinR928=S.crewPinR928||{};var old={};Object.keys(pins).forEach(function(d){old[d]=S.crewPinR928[d]?JSON.stringify(S.crewPinR928[d]):null;S.crewPinR928[d]=Object.assign({},S.crewPinR928[d]||{},pins[d])});bump();
        warm(until,function(){
          var ax=chainTxt(X,a,n),ay=chainTxt(Y,a,n),nx=dutyOn(X,P.date),ny=dutyOn(Y,P.date);
          var miss=[];function chk(id,t){t.forEach(function(l){if(!dutyAll(id,l.d).some(function(f){return f.code===l.code&&f.fr===l.fr}))miss.push(st[id].name+' '+l.d.slice(5)+' '+l.code)})}
          chk(X,ty);chk(Y,tx);
          Object.keys(old).forEach(function(d){if(old[d]===null)delete S.crewPinR928[d];else S.crewPinR928[d]=JSON.parse(old[d])});S.crewFreezeR928=JSON.parse(fz0);bump();
          var ok=!miss.length&&tx.length>0&&ty.length>0;
          res.pending=false;res.msgs=[];res.ok=ok;res.date=P.date;res.end=endAll;res.pins=pins;res.exD=exD;
          res.X={id:X,name:st[X].name,from:tripTxt(tx),to:tripTxt(ty),before:bx,after:ax};
          res.Y={id:Y,name:st[Y].name,from:tripTxt(ty),to:tripTxt(tx),before:by,after:ay};
          res.msgs.push(ok?(Z()?('可以換（整趟對調，去程＋回程）。'+st[X].name+'（'+X+'）原本飛 '+res.X.from+'；'+st[Y].name+'（'+Y+'）原本飛 '+res.Y.from+'。對調後各自飛對方的整趟，休息、每週一日全休、月飛時與位置都符合規定，兩人之後幾天的班表也照新的落地點重排，差異如下。核准後才會寫入並通知。')
            :'Swap is legal (whole trip). Review both rosters below; nothing changes until you approve.')
            :(Z()?('這樣換不合法：整趟對調後排不上的航段：'+miss.join('、')+'（休息、位置、每週一日全休或月飛時不符合）。請換一天或換一位。'):'Not legal.'));
          S._crBusy928=null;done();
          var nq=QUEUE928.shift();if(nq)window.kgmCrewReplanR928(nq[0],nq[1]);
        });
      });
    };
    window.kgmCrewAiApproveR928=function(){
      var r=S.crewAiR928;if(!r||!r.ok||r.approved)return;
      r.approved=true;r.approvedAt=new Date().toISOString();
      var exA={};exA[r.X.id]=r.exD;exA[r.Y.id]=r.exD;
      window.kgmCrewReplanR928({from:r.date,to:AD(r.end||r.date,6),exclude:exA,reason:(Z()?'AI 換班核准 ':'AI swap approved ')+r.X.name+' ⇄ '+r.Y.name+' '+r.date,apply:function(){S.crewPinR928=S.crewPinR928||{};Object.keys(r.pins||{}).forEach(function(d){S.crewPinR928[d]=Object.assign({},S.crewPinR928[d]||{},r.pins[d])})},
        done:function(rec){r.changed=rec.n;S._crMsg928=(Z()?'✓ 已核准並寫入班表，'+rec.n+' 位組員班表異動並已通知（含兩位當事人）。':'Approved; '+rec.n+' notified.')}});
    };
    window.kgmCrewAiClearR928=function(){S.crewAiR928=null;window.__k928aiTxt='';try{render()}catch(_){}};
    function rosterTbl(p){
      var rows=p.before.map(function(b,i){var a=(p.after[i]||{}).t||'';var ch=a!==b.t;return '<tr class="'+(ch?'ch':'')+'"><td>'+E(b.d.slice(5))+'</td><td>'+E(b.t)+'</td><td>'+E(a)+'</td></tr>'}).join('');
      return '<div class="k928-ai-p"><b>'+E(p.name)+'</b> <small>'+E(p.id)+'　'+E(p.from)+' → '+E(p.to)+'</small><table><thead><tr><th>'+(Z()?'日期':'Date')+'</th><th>'+(Z()?'原本':'Before')+'</th><th>'+(Z()?'換班後':'After')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    }
    window.kgmCrewToolsR928=function(){
      var r=S.crewAiR928,offs=(S.crewOffR928||[]).filter(function(x){return x.active!==false}).slice(0,12),log=(S.crewReplanLogR928||[])[0];
      return '<div class="k928-ct">'
        +'<div class="k928-ct-top"><button class="btn btn-g" onclick="kgmCrewUpdateR928()">🔄 '+(Z()?'排班更新':'Update roster')+'</button>'
        +'<span>'+(Z()?'系統每天自動排班；航班、機隊、請假有變動時按這裡立即重算，有異動的組員會收到通知。':'Rosters are planned automatically; press to re-plan now.')+'</span></div>'
        +(S._crMsg928?'<div class="chip chip-ok" style="margin-top:8px">'+E(S._crMsg928)+'</div>':'')
        +'<div class="k928-ct-grid">'
        +'<section><h4>🤖 '+(Z()?'AI 換班':'AI swap')+'</h4><p>'+(Z()?'直接寫需求，例如「K60012 10/12 想換到東京的班」「K60012 和 K60045 10/12 對調」。':'e.g. "K60012 wants a Tokyo flight on 10/12".')+'</p>'
          +'<textarea id="k928aiTxt" class="inp" rows="2" placeholder="'+(Z()?'K60012 10/12 想換到 LAX 的班':'K60012 10/12 to LAX')+'">'+E(window.__k928aiTxt||(r&&r.text)||'')+'</textarea>'
          +'<div class="k928-ct-act"><button class="btn btn-g btn-sm" onclick="kgmCrewAiAskR928()">'+(Z()?'請 AI 規劃':'Ask AI')+'</button>'+(r?'<button class="btn btn-sm" onclick="kgmCrewAiClearR928()">'+(Z()?'清除':'Clear')+'</button>':'')+'</div>'
          +(r?'<div class="k928-ai-r '+(r.ok?'ok':'bad')+'">'+r.msgs.map(function(m){return '<p>'+E(m)+'</p>'}).join('')
            +(r.X&&r.Y?'<div class="k928-ai-two">'+rosterTbl(r.X)+rosterTbl(r.Y)+'</div>':'')
            +(r.ok&&!r.approved?'<button class="btn btn-g" onclick="kgmCrewAiApproveR928()">'+(Z()?'核准，更新班表並通知':'Approve & notify')+'</button>':'')
            +(r.approved?'<p class="k928-ok">✓ '+(Z()?'已核准寫入，':'Approved, ')+E(r.approvedAt.replace('T',' ').slice(0,16))+'</p>':'')+'</div>':'')
        +'</section>'
        +'<section><h4>✂️ '+(Z()?'移除班表（指定日期區間）':'Remove duties')+'</h4><p>'+(Z()?'移除後系統自動找符合休息與位置規定的人接手，並通知所有異動的人。':'Duties are reassigned to legal substitutes and everyone affected is notified.')+'</p>'
          +'<div class="k928-ct-f"><input id="k928crEmp" class="inp" placeholder="K60012"><input id="k928crFrom" type="date" class="inp" value="'+AD(todayISO(),1)+'"><input id="k928crTo" type="date" class="inp" value="'+AD(todayISO(),1)+'"><input id="k928crWhy" class="inp" placeholder="'+(Z()?'原因（例：訓練、體檢）':'Reason')+'"></div>'
          +'<div class="k928-ct-act"><button class="btn btn-g btn-sm" onclick="kgmCrewRemoveR928()">'+(Z()?'移除並重排':'Remove & re-plan')+'</button></div>'
          +(offs.length?'<table class="k928-ct-t"><tbody>'+offs.map(function(o){return '<tr><td><b>'+E(o.name)+'</b> <small>'+E(o.empId)+'</small></td><td>'+E(o.from)+'～'+E(o.to)+'</td><td>'+E(o.reason)+'</td><td><button class="btn btn-sm" onclick="kgmCrewRestoreR928(\''+o.id+'\')">'+(Z()?'恢復':'Restore')+'</button></td></tr>'}).join('')+'</tbody></table>':'')
        +'</section></div>'
        +(log?'<div class="k928-ct-log"><b>'+(Z()?'最近一次重排：':'Last re-plan: ')+'</b>'+E(log.reason)+'　'+E(log.range)+'　'+(Z()?'異動 ':'changed ')+log.n+(Z()?' 人':'')+(log.changes&&log.changes.length?'<details><summary>'+(Z()?'看異動明細':'Details')+'</summary>'+log.changes.slice(0,20).map(function(c){return '<div><b>'+E(c.name)+'</b> <small>'+E(c.empId)+'</small>：'+c.lines.slice(0,4).map(function(l){return E(l.d.slice(5)+' '+(l.o||'休')+' → '+(l.n||'休'))}).join('；')+(c.lines.length>4?'…':'')+'</div>'}).join('')+'</details>':'')+'</div>':'')
        +'</div>';
    };
    try{if(!document.getElementById('k928-ct-css')){var cs=document.createElement('style');cs.id='k928-ct-css';cs.textContent=
      '.k928-ct-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.k928-ct-top span{font-size:11.5px;color:#667}'
      +'.k928-ct-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:12px;margin-top:12px;align-items:start}.k928-ct-grid section{border:1px solid #e3ebe7;border-radius:12px;padding:12px;background:#fff}'
      +'.k928-ct-grid h4{margin:0 0 4px;font-size:13px;color:var(--g)}.k928-ct-grid p{margin:0 0 8px;font-size:11.5px;color:#667;line-height:1.6}'
      +'.k928-ct-grid textarea{width:100%;min-height:54px;resize:vertical}.k928-ct-act{display:flex;gap:8px;margin-top:8px}'
      +'.k928-ct-f{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}.k928-ct-f input:last-child{grid-column:1/-1}'
      +'.k928-ct-t{width:100%;margin-top:8px;font-size:11.5px;border-collapse:collapse}.k928-ct-t td{padding:5px 4px;border-top:1px solid #eef1ef}'
      +'.k928-ai-r{margin-top:10px;border-radius:10px;padding:10px 12px;font-size:12px}.k928-ai-r.ok{background:#f1f7f4;border:1px solid #cfe3d8}.k928-ai-r.bad{background:#fff6f2;border:1px solid #f0d3c2;color:#8a3b2c}.k928-ai-r p{margin:0 0 8px;color:inherit;font-size:12px}'
      +'.k928-ai-two{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}.k928-ai-p table{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}.k928-ai-p th{text-align:left;color:#7b817d;font-weight:700;padding:3px 4px}.k928-ai-p td{padding:3px 4px;border-top:1px solid #e6ece8}.k928-ai-p tr.ch td{background:#fff5e0;font-weight:700}'
      +'.k928-ok{color:#0b493b!important;font-weight:700}.k928-ct-log{margin-top:10px;font-size:11.5px;color:#556}.k928-ct-log details div{margin-top:3px}'
      +'@media(max-width:900px){.k928-ct-grid,.k928-ai-two{grid-template-columns:1fr}}';document.head.appendChild(cs)}}catch(_){}
  })();
