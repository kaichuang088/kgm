    /* 1012A #2：第五航權（經停）航班的哩程升等候補、員工票候補要分段
       使用者：「如果是第五航權航班是分開的喔，所以可能有人訂購 TPE-LAS via ICN 的票要里程升等是可以只升等 TPE-ICN or ICN-LAS or Both（分開升等），
       所以名單應該要重新審核，因為有些人第一段就結束，有些人第二段才會上來」。
       · 候補名單每一筆標出它坐哪幾段（只到 ICN／ICN 上機／全程），打開某一段時只列出有坐那一段的人；全程那一列兩段都會出現。
       · 升等申請帶航段（下面）。
       · 後台候補成功（adminDecideUpgrade0810K）也照分段處理。 */
    (function(){
      function H12f(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
      function Ef(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
      function zf(){try{return LANG!=='en'}catch(_){return true}}
      var LG12={};
      function legs12(code){if(LG12[code]!==undefined)return LG12[code];
        var all=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.partner}),via=all.filter(function(x){return x.via})[0],r=null;
        if(via){var a=all.filter(function(x){return !x.via&&x.fr===via.fr&&x.to===via.via})[0],b=all.filter(function(x){return !x.via&&x.fr===via.via&&x.to===via.to})[0];
          if(a&&b)r={via:via,l1:a,l2:b,k1:a.fr+'-'+a.to,k2:b.fr+'-'+b.to,kAll:via.fr+'-'+via.to}}
        return LG12[code]=r}
      window.kgmViaLegsR1012A=legs12;
      function segOf12(b,code,date){var out=null;try{[['out',b.outF],['inb',b.inbF]].concat(((b.mcFlights||[]).map(function(m,i){return ['seg'+i,m&&(m.f||m)]}))).forEach(function(p){var f=p[1];if(!out&&f&&f.code===code&&(!date||f.date===date))out={k:p[0],f:f}})}catch(_){}return out}
      function cover12(r,L,code,date){
        if(r.simR929){var h=H12f('leg12|'+r.id)%10;return h<4?[L.k1,L.k2]:(h<7?[L.k1]:[L.k2])}
        if(r.kind==='upgrade'){var q=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===r.id})[0];if(q&&q.legR1012A)return [q.legR1012A]}
        var b=r.booking,s=b&&segOf12(b,code,date),f=s&&s.f;if(!f)return [L.k1,L.k2];
        if(f.via||(f.fr===L.via.fr&&f.to===L.via.to))return [L.k1,L.k2];
        var k=f.fr+'-'+f.to;return k===L.k1||k===L.k2?[k]:[L.k1,L.k2]}
      function tag12(c,L){var t=c.length>1?(L.via.fr+'→'+L.via.to+(zf()?' 全程':' through')):(c[0]===L.k1?(c[0].replace('-','→')+(zf()?'（'+L.l1.to+' 下機）':' (ends '+L.l1.to+')')):(c[0].replace('-','→')+(zf()?'（'+L.l2.fr+' 上機）':' (boards '+L.l2.fr+')')));
        return '<i class="k12-leg'+(c.length>1?' all':'')+'">'+Ef(t)+'</i> '}
      (function wrapList(n){var g=window.kgmStandbyListR40;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapList(n+1)},500);return}if(g.__r1012A)return;
        var w=function(code,date,fr,to){var rows=g.apply(this,arguments)||[],L=legs12(code);if(!L)return rows;
          rows.forEach(function(r){var c=cover12(r,L,code,date);r.legsR1012A=c;r.legTagR1012A=tag12(c,L)});
          var k=fr&&to?fr+'-'+to:'';if(k===L.k1||k===L.k2)rows=rows.filter(function(r){return r.legsR1012A.indexOf(k)>=0});
          return rows};
        w.__r1012A=1;window.kgmStandbyListR40=w})(0);
      /* 升等申請：經停航班的升等選項本來就分段列（0920B：豪經（TPE → ICN）／豪經（ICN → LAS），各自依那一段的距離計價），
         但按鈕送出時沒有帶「哪一段」，結果兩張卡片送出的是同一筆、扣整條航線的哩程、整張訂位一起升等。
         現在按鈕多帶一個航段參數（第 5 個）：申請時把這一段當成航班去判斷有沒有位子、算哩程；成功後訂位本身的艙等不動，
         改記在 b.legCabR1012A（只有那一段升等），候補名單也只出現在那一段。 */
      function bk12(p){return (S.bookings||[]).filter(function(x){return x&&x.pnr===p})[0]}
      function legInfo12(b,seg,leg){var f=b&&b[seg+'F'],L=f&&legs12(f.code);if(!L||!leg)return null;if(!(f.via||(f.fr===L.via.fr&&f.to===L.via.to)))return null;
        if(leg!==L.k1&&leg!==L.k2)return null;return {L:L,leg:leg}}
      function legF12(b,seg,leg,L){var src=leg===L.k1?L.l1:L.l2,f=b[seg+'F'],x=src;try{x=(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(src,f.date))||src}catch(_){}return Object.assign({},x,{date:f.date})}
      function withLeg12(b,seg,leg,fn){var P=legInfo12(b,seg,leg);if(!P)return fn(null);var k=seg+'F',keep=b[k],hid=[];
        b[k]=legF12(b,seg,P.leg,P.L);
        (S.upgradeReqs||[]).forEach(function(x){if(x&&x.pnr===b.pnr&&x.seg===seg&&(x.legR1012A||'')!==P.leg){hid.push(x);x.seg=seg+'@'+(x.legR1012A||'all')}});
        try{return fn(P)}finally{b[k]=keep;hid.forEach(function(x){x.seg=seg})}}
      /* #253：整段升等的流程（applyUpgradeK）還會動到 upgraded／freeSeat／報到／座位鎖，單段升等全部還原，只留 legCabR1012A＋那一段的新座位 */
      var SEGF12=['upgraded','freeSeat','boardingPass','checkinSeg0813','seatResetAfterUpgrade0815','upgSeatLockR1010A'];
      function snap12(b,seg){var o={cab:b[seg+'C'],upc:b.upgradedCabinsR7&&b.upgradedCabinsR7[seg],seats:b.seats&&b.seats[seg]?JSON.parse(JSON.stringify(b.seats[seg])):null,ids:(S.upgradeReqs||[]).map(function(x){return x&&x.id}),segf:{}};
        SEGF12.forEach(function(n){var v=b[n]&&b[n][seg];o.segf[n]=v===undefined?undefined:JSON.parse(JSON.stringify(v))});return o}
      function confirm12(b,seg,q,before){var k=seg+'C';if(before.cab!=null&&b[k]!==before.cab)b[k]=before.cab;
        if(b.upgradedCabinsR7&&before.upc==null)delete b.upgradedCabinsR7[seg];
        if(before.seats){b.seats=b.seats||{};b.seats[seg]=before.seats}
        Object.keys(before.segf||{}).forEach(function(n){var v=before.segf[n];if(v===undefined){if(b[n])delete b[n][seg]}else{b[n]=b[n]||{};b[n][seg]=v}});
        b.legCabR1012A=b.legCabR1012A||{};(b.legCabR1012A[seg]=b.legCabR1012A[seg]||{})[q.legR1012A]=q.toCabin;
        try{var st=legSeatPick12(b,seg,q.legR1012A,q.toCabin);if(st.length)q.seat=st.join('、')}catch(_){}}
      function afterLeg12(b,seg,P,before){
        var q=(S.upgradeReqs||[]).filter(function(x){return x&&x.pnr===b.pnr&&x.seg===seg&&before.ids.indexOf(x.id)<0})[0];if(!q)return;
        q.legR1012A=P.leg;q.legFrR1012A=P.leg.split('-')[0];q.legToR1012A=P.leg.split('-')[1];
        if(String(q.status)==='confirmed')confirm12(b,seg,q,before);try{save()}catch(_){}}
      function wrapLeg12(name){(function go(n){var g=window[name];if(typeof g!=='function'){if(n<40)setTimeout(function(){go(n+1)},500);return}if(g.__r1012L)return;
        var w=function(pnr,seg,type,toCabin,leg){var self=this,args=[].slice.call(arguments,0,4),b=bk12(pnr),cx=S._upgLegR1012A;
          if(!leg&&cx&&cx.pnr===pnr&&cx.seg===seg&&Date.now()-(+cx.at||0)<600000)leg=cx.leg;   /* 確認視窗（同意規定）之後才真的送出：航段從這裡接 */
          if(!b||!leg)return g.apply(self,args);var before=snap12(b,seg);
          return withLeg12(b,seg,leg,function(P){var r=g.apply(self,args);if(P&&(name==='doRequestUpgrade'||(r&&r.ok))){try{afterLeg12(b,seg,P,before)}catch(_){}if(r&&r.ok)S._upgLegR1012A=null}return r})};
        Object.keys(g).forEach(function(k){try{w[k]=g[k]}catch(_){}});w.__r1012L=1;window[name]=w;try{if(name==='requestUpgrade')requestUpgrade=w;else doRequestUpgrade=w}catch(_){}})(0)}
      wrapLeg12('requestUpgrade');wrapLeg12('doRequestUpgrade');
      /* 升等頁的按鈕是 confirmUpgradeR10(pnr,seg,type,to,航段) → 同意規定 → askUpgradeR28 → runUpgradeR27 → requestUpgrade，中間沒有帶航段：先記在 S */
      (function wrapConf(n){var g=window.confirmUpgradeR10;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapConf(n+1)},500);return}if(g.__r1012L)return;
        var w=function(pnr,seg,type,toCabin,leg){S._upgLegR1012A=leg?{pnr:pnr,seg:seg,leg:leg,at:Date.now()}:null;return g.apply(this,arguments)};
        w.__r1012L=1;window.confirmUpgradeR10=w})(0);
      /* 確認頁（askUpgradeR28）：只升一段時，哩程、航段都用那一段 */
      (function wrapAsk(n){var g=window.askUpgradeR28;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapAsk(n+1)},500);return}if(g.__r1012L)return;
        var w=function(pnr,seg,cabin){var self=this,args=arguments,b=bk12(pnr),cx=S._upgLegR1012A;
          if(!b||!cx||cx.pnr!==pnr||cx.seg!==seg)return g.apply(self,args);
          return withLeg12(b,seg,cx.leg,function(){var r=g.apply(self,args);try{if(S.upgAskR28)S.upgAskR28.legR1012A=cx.leg}catch(_){}return r})};
        w.__r1012L=1;window.askUpgradeR28=w})(0);
      /* 確認後送出（runUpgradeR27）：整段流程都用那一段（所需哩程、結果頁的航段與時間）；送出後把申請標成單段 */
      (function wrapRun(n){var g=window.runUpgradeR27;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapRun(n+1)},500);return}if(g.__r1012L)return;
        var w=function(pnr,seg){var self=this,args=arguments,b=bk12(pnr),cx=S._upgLegR1012A;
          if(!b||!cx||cx.pnr!==pnr||cx.seg!==seg||Date.now()-(+cx.at||0)>600000)return g.apply(self,args);
          var before=snap12(b,seg),P0=legInfo12(b,seg,cx.leg);if(!P0)return g.apply(self,args);
          var r=withLeg12(b,seg,cx.leg,function(){return g.apply(self,args)});
          try{afterLeg12(b,seg,P0,before)}catch(_){}S._upgLegR1012A=null;try{render()}catch(_){}return r};
        w.__r1012L=1;window.runUpgradeR27=w})(0);
      /* 確認視窗上的哩程：只升一段時依那一段計算 */
      (function wrapCan2(n){var g=window.canUpgradeWithMiles;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapCan2(n+1)},500);return}if(g.__r1012L)return;
        var w=function(type,cls,acft,dist,f){var cx=S._upgLegR1012A;try{if(cx&&f&&f.via&&Date.now()-(+cx.at||0)<600000){var b=bk12(cx.pnr),P=b&&legInfo12(b,cx.seg,cx.leg),bf=b&&b[cx.seg+'F'];
            if(P&&bf&&bf.code===f.code&&bf.date===f.date){var lf=legF12(b,cx.seg,P.leg,P.L);return g.call(this,type,cls,acft,distOf(lf.fr,lf.to),lf)}}}catch(_){}return g.apply(this,arguments)};
        Object.keys(g).forEach(function(k){try{w[k]=g[k]}catch(_){}});w.__r1012L=1;window.canUpgradeWithMiles=w;try{canUpgradeWithMiles=w}catch(_){}})(0);
      /* 1007A 的報價檢查層會把 doRequestUpgrade 包在最外層、照樣把全部參數傳進來；它包到我們外面也沒關係 */
      (function wrapDec(n){var g=window.adminDecideUpgrade0810K;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapDec(n+1)},500);return}if(g.__r1012A)return;
        var w=function(id,ok){var q=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===id})[0],b=q&&bk12(q.pnr);if(!q||!q.legR1012A||!b)return g.apply(this,arguments);
          var seg=q.seg||'out',before=snap12(b,seg),r,okF=window.kgmSbSeatOkR1010A;
          /* #253：有沒有位子要看「那一段」的庫存（原本用班號找第一段） */
          if(ok&&q.status==='waitlist'){var ps=physLeg12(b,seg,q.legR1012A),iv=null;try{iv=ps&&window.kgmCabinInventory54(ps.f,ps.date,q.toCabin)}catch(_){}
            if(iv&&(+iv.left||0)<(+q.pax||1)){alert('目標艙等（'+q.legR1012A.replace('-','→')+' 這一段）目前沒有空位，不能接受這筆候補（請改按「失敗・退還哩程」或等有人取消）。');return}
            window.kgmSbSeatOkR1010A=function(){return true}}
          try{r=g.apply(this,arguments)}finally{window.kgmSbSeatOkR1010A=okF}
          if(ok&&String(q.status)==='confirmed'){confirm12(b,seg,q,before);note12(b,q,'admin');try{save()}catch(_){}try{render()}catch(_){}}return r};
        w.__r1012A=1;window.adminDecideUpgrade0810K=w})(0);
      (function wrapCan(n){var g=window.kgmDeskCancelUpgR1006A;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapCan(n+1)},500);return}if(g.__r1012A)return;
        var w=function(id){var q=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===id})[0],r=g.apply(this,arguments);
          try{if(q&&q.legR1012A&&String(q.status)==='cancelled'){var b=bk12(q.pnr),m=b&&b.legCabR1012A&&b.legCabR1012A[q.seg||'out'],ms=b&&b.legSeatR1012A&&b.legSeatR1012A[q.seg||'out'];if(ms)delete ms[q.legR1012A];if(m){delete m[q.legR1012A];try{save()}catch(_){}}}}catch(_){}return r};
        w.__r1012A=1;window.kgmDeskCancelUpgR1006A=w})(0);
      /* 1012A #253：只升一段的旅客，航班資料（艙單）、座位庫存、登機證都要照「那一段」的艙等。
         · 艙單／庫存：經停航班的訂位依實際航段拆開（segs7(b,true)），升等的那一段算新艙等、坐新艙等的座位；另一段照原艙等、原座位。
         · 新艙等的座位存在 b.legSeatR1012A[seg][航段]（每位旅客一格），不動原本的 b.seats。
         · 起飛前 72 小時自動遞補（runUpgradeLockIn）原本會把整張訂位升等：單段的申請改看那一段的庫存，只升那一段。
         · 登機證：有單段升等的經停航班，兩段各印一張（各自的艙等、座位、登機門）。 */
      function physLeg12(b,seg,leg){try{return (window.segs7(b,true)||[]).filter(function(s){return s&&s.through&&s.rootKey===seg&&s.f&&(s.f.fr+'-'+s.f.to)===leg})[0]||null}catch(_){return null}}
      function legReq12(b,root,k){var rf=b&&b[root+'F'];return (S.upgradeReqs||[]).filter(function(x){return x&&x.pnr===b.pnr&&(x.seg||'out')===root&&x.legR1012A===k&&String(x.status)==='confirmed'&&(!x.date||!rf||!rf.date||x.date===rf.date)})[0]||null}
      var CABF12={Premium:'K',Business:'D',First:'V'},CABZ12={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙'};
      function legCabOf12(b,s){try{if(!b||!s||!s.through||!s.f||!b.legCabR1012A)return null;var root=s.rootKey||s.key,k=s.f.fr+'-'+s.f.to,m=b.legCabR1012A[root];
          if(!m||!m[k]||!legReq12(b,root,k))return null;var sm=((b.legSeatR1012A||{})[root]||{})[k];
          return {cabin:m[k],fare:CABF12[m[k]]||s.c,seats:[].concat(sm||[]),root:root,leg:k}}catch(_){return null}}
      window.kgmLegCabR1012A=legCabOf12;
      function paxN12(b){return Math.max(1,(b.paxList||[{}]).filter(function(p){return p&&p.passengerType!=='INF'}).length)}
      function legSeatPick12(b,seg,leg,cab){var ps=physLeg12(b,seg,leg);if(!ps)return [];var iv=null;try{iv=window.kgmCabinInventory54(ps.f,ps.date,cab,b.pnr)}catch(_){}
        var free=(iv&&iv.seats)||[],n=paxN12(b),st=[];if(free.length){var i0=H12f('legseat|'+b.pnr+'|'+leg)%free.length;for(var i=0;i<free.length&&st.length<n;i++)st.push(free[(i0+i)%free.length])}
        b.legSeatR1012A=b.legSeatR1012A||{};(b.legSeatR1012A[seg]=b.legSeatR1012A[seg]||{})[leg]=st;return st}
      /* 艙單自動配位時：單段升等的那一段寫回 legSeatR1012A（不是 b.seats） */
      window.kgmLegSeatSetR1012A=function(x){try{var b=x&&x.booking;if(!b||!x.seat||!b.legCabR1012A)return false;
          var s=(window.segs7(b,true)||[]).filter(function(q){return q&&q.through&&q.key===x.segmentKey})[0],u=s&&legCabOf12(b,s);if(!u)return false;
          b.legSeatR1012A=b.legSeatR1012A||{};var m=(b.legSeatR1012A[u.root]=b.legSeatR1012A[u.root]||{}),a=[].concat(m[u.leg]||[]);a[+x.passengerIndex||0]=x.seat;m[u.leg]=a;return true}catch(_){return false}};
      function note12(b,q,how){try{var leg=q.legR1012A.replace('-','→'),st=q.seat||'',zc=CABZ12[q.toCabin]||q.toCabin,
          msg='【升等成功・單段】'+q.code+' '+leg+' '+q.date+' 這一段已升至'+zc+(st?'，座位 '+st+'（系統隨機分配）':'')+'；另一段維持原艙等、原座位。';
          var n0=b.notifs&&b.notifs[0],old=n0&&n0.msg;
          if(how!=='lock'&&old&&old.indexOf(q.code)>=0&&/升等候補成功|里程升等已確認/.test(old)){n0.msg='✓ '+msg;(S.notifs||[]).forEach(function(x){if(x&&x.message===old)x.message='✓ '+msg})}
          else if(typeof window._pushBkNotif==='function')window._pushBkNotif(b,'✓ '+msg)}catch(_){}}
      /* 行程管理的座位格：只升一段時寫成「第 1 段座位／第 2 段座位」 */
      window.kgmLegSeatTxtR1012A=function(b,key,seat){try{if(!b||!b.legCabR1012A||!b.legCabR1012A[key])return '';
          var parts=(window.segs7(b,true)||[]).filter(function(s){return s&&s.through&&s.rootKey===key});if(parts.length<2)return '';
          var any=false,t=parts.map(function(s){var lc=legCabOf12(b,s);if(lc){any=true;return lc.seats[0]||'—'}return Object.keys((b.seats||{})[s.key]||(b.seats||{})[key]||{}).filter(function(k){return k!=='_auto'})[0]||seat||'—'});
          return any?t.join('／'):''}catch(_){return ''}};
      /* 72 小時自動遞補：單段申請先在這裡處理（看那一段的庫存），處理時把單段申請藏起來，原本的流程不會把整張訂位升等 */
      function hrs12(f,date){var h=NaN;try{if(window.kgmHoursToDepR920B)h=window.kgmHoursToDepR920B(f,date)}catch(_){}if(!isFinite(h))h=(new Date(date+'T'+(f.dep||'00:00')+':00')-Date.now())/3600000;return h}
      (function wrapLock(n){var g=window.runUpgradeLockIn;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapLock(n+1)},500);return}if(g.__r1012A)return;
        var w=function(){var hid=[],done=0;
          try{(S.upgradeReqs||[]).forEach(function(q){if(!q||!q.legR1012A||q.status!=='waitlist')return;hid.push(q);var b=bk12(q.pnr),seg=q.seg||'out',ps=b&&physLeg12(b,seg,q.legR1012A);if(!ps)return;
              var h=hrs12(ps.f,ps.date);if(!(h<=72&&h>=-3))return;var iv=null;try{iv=window.kgmCabinInventory54(ps.f,ps.date,q.toCabin)}catch(_){}
              if(iv&&(+iv.left||0)>=(+q.pax||1)){q.status='confirmed';q.settledAt=todayISO();q.decision='auto_leg';var before=snap12(b,seg);confirm12(b,seg,q,before);note12(b,q,'lock')}
              else{var got=0;try{got=window.kgmRestoreUpgradeMilesR1006A(q,b)}catch(_){}q.status='refunded';q.settledAt=todayISO();
                try{window._pushBkNotif(b,'【里程升等候補未遞補・單段】'+q.code+' '+q.legR1012A.replace('-','→')+' '+q.date+'，里程已按原效期退回'+(got?' '+Number(got).toLocaleString()+' 哩':'')+'。')}catch(_){}}
              done++})}catch(_){}
          hid=hid.filter(function(q){return q.status==='waitlist'});hid.forEach(function(q){q.status='waitlist@leg'});
          var r;try{r=g.apply(this,arguments)}finally{hid.forEach(function(q){if(q.status==='waitlist@leg')q.status='waitlist'})}
          if(done)try{save()}catch(_){}return (+r||0)+done};
        w.__r1012A=1;window.runUpgradeLockIn=w})(0);
      /* 登機證：經停航班有單段升等時，兩段各一張 */
      (function wrapBP(n){var g=window.boardingPass0814;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapBP(n+1)},500);return}if(g.__r1012A)return;
        var w=function(b,seg){var self=this,args=arguments;try{seg=seg||'out';var f=b&&(seg==='out'||seg==='inb')&&b[seg+'F'];if(!f||!f.via||!b.legCabR1012A||!b.legCabR1012A[seg])return g.apply(self,args);
            var parts=(window.segs7(b,true)||[]).filter(function(s){return s&&s.through&&s.rootKey===seg});if(parts.length<2||!parts.some(function(s){return legCabOf12(b,s)}))return g.apply(self,args);
            var Z=zf(),p0=(b.paxList||[{}])[0]||{},nm=[p0.lastName,p0.firstName].filter(Boolean).join(' ');
            var html12=parts.map(function(s,i){var lc=legCabOf12(b,s),b2=Object.assign({},b),ck=seg==='inb'?'inbC':'outC',fare=lc?lc.fare:s.c;
              b2[seg+'F']=Object.assign({},s.f,{date:s.date});b2[ck]=fare;if(seg==='inb')b2.inC=fare;
              var seat=lc?(lc.seats[0]||''):(Object.keys((b.seats||{})[s.key]||(b.seats||{})[seg]||{}).filter(function(k){return k!=='_auto'})[0]||'');
              b2.seats=Object.assign({},b.seats||{});var so={};if(seat)so[seat]=nm;b2.seats[seg]=so;
              if(window.kgmBpCardR1012A)return window.kgmBpCardR1012A(window.kgmBpDataR1012A(b2,seg,{f:Object.assign({},s.f,{date:s.date}),fare:fare,seat:seat,   /* 1012A：新版登機證（js/bp12.js），每段一張 */
                cabinNote:lc?(Z?'哩程升等':'Mileage upgrade'):'',legLabel:(Z?'第 '+(i+1)+' 段':'Sector '+(i+1))+' · '+s.f.fr+' → '+s.f.to}));
              var h=g.call(self,b2,seg);
              if(lc){var cz=Z?(CABZ12[lc.cabin]||lc.cabin):lc.cabin,lab=(Z?'艙等':'Class')+' <b>';h=h.replace(lab+FARE_NM(fare)+'</b>',lab+Ef(cz)+' · '+(Z?'哩程升等':'Mileage upgrade')+'</b>')}
              return '<div class="k12-bp-leg">'+(Z?'第 '+(i+1)+' 段':'Sector '+(i+1))+' · '+Ef(s.f.fr)+' → '+Ef(s.f.to)+(lc?' <i class="k12-leg">'+(Z?'已升等 ':'Upgraded ')+Ef(Z?(CABZ12[lc.cabin]||lc.cabin):lc.cabin)+'</i>':'')+'</div>'+h}).join('');
            return window.kgmBpPageR1012A?window.kgmBpPageR1012A(html12):html12}catch(_){return g.apply(self,args)}};
        /* 下載／彈出視窗用：有單段升等時回傳分段的登機證卡片，沒有就回空字串 */
        window.kgmLegBpCardsR1012A=function(b,seg){try{var f=b&&(seg==='out'||seg==='inb')&&b[seg+'F'];if(!f||!f.via||!b.legCabR1012A||!b.legCabR1012A[seg]||!window.kgmBpCardR1012A)return '';
            var Z=zf(),parts=(window.segs7(b,true)||[]).filter(function(s){return s&&s.through&&s.rootKey===seg});if(parts.length<2||!parts.some(function(s){return legCabOf12(b,s)}))return '';
            return parts.map(function(s,i){var lc=legCabOf12(b,s),fare=lc?lc.fare:s.c,seat=lc?(lc.seats[0]||''):(Object.keys((b.seats||{})[s.key]||(b.seats||{})[seg]||{}).filter(function(k){return k!=='_auto'})[0]||'');
              return window.kgmBpCardR1012A(window.kgmBpDataR1012A(b,seg,{f:Object.assign({},s.f,{date:s.date}),fare:fare,seat:seat,cabinNote:lc?(Z?'哩程升等':'Mileage upgrade'):'',legLabel:(Z?'第 '+(i+1)+' 段':'Sector '+(i+1))+' · '+s.f.fr+' → '+s.f.to}))}).join('')}catch(_){return ''}};
        w.__r1012A=1;window.boardingPass0814=w;try{window._mtBoardingPass=w}catch(_){}})(0);
      (function(){if(document.getElementById('k12-leg-css'))return;var s=document.createElement('style');s.id='k12-leg-css';
        s.textContent='.k12-leg{font-style:normal;display:inline-block;font-size:10px;font-weight:800;border-radius:6px;padding:1px 6px;margin-right:4px;background:#eef3fb;color:#2c4f86;border:1px solid #d3def0;white-space:nowrap}.k12-leg.all{background:#f1efe6;color:#6b5a2a;border-color:#e3dcc4}.k12-bp-leg{margin:14px 0 6px;font-size:12px;font-weight:800;letter-spacing:.04em;color:#41534b}.k12-bp-leg:first-child{margin-top:0}';(document.head||document.documentElement).appendChild(s)})();
    })();
