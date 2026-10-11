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
      function snap12(b,seg){return {cab:b[seg+'C'],upc:b.upgradedCabinsR7&&b.upgradedCabinsR7[seg],seats:b.seats&&b.seats[seg]?JSON.parse(JSON.stringify(b.seats[seg])):null,ids:(S.upgradeReqs||[]).map(function(x){return x&&x.id})}}
      function confirm12(b,seg,q,before){var k=seg+'C';if(before.cab!=null&&b[k]!==before.cab)b[k]=before.cab;
        if(b.upgradedCabinsR7&&before.upc==null)delete b.upgradedCabinsR7[seg];
        if(before.seats){b.seats=b.seats||{};b.seats[seg]=before.seats}
        b.legCabR1012A=b.legCabR1012A||{};(b.legCabR1012A[seg]=b.legCabR1012A[seg]||{})[q.legR1012A]=q.toCabin}
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
          var seg=q.seg||'out',before=snap12(b,seg),r=g.apply(this,arguments);if(ok&&String(q.status)==='confirmed'){confirm12(b,seg,q,before);try{save()}catch(_){}try{render()}catch(_){}}return r};
        w.__r1012A=1;window.adminDecideUpgrade0810K=w})(0);
      (function wrapCan(n){var g=window.kgmDeskCancelUpgR1006A;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapCan(n+1)},500);return}if(g.__r1012A)return;
        var w=function(id){var q=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===id})[0],r=g.apply(this,arguments);
          try{if(q&&q.legR1012A&&String(q.status)==='cancelled'){var b=bk12(q.pnr),m=b&&b.legCabR1012A&&b.legCabR1012A[q.seg||'out'];if(m){delete m[q.legR1012A];try{save()}catch(_){}}}}catch(_){}return r};
        w.__r1012A=1;window.kgmDeskCancelUpgR1006A=w})(0);
      (function(){if(document.getElementById('k12-leg-css'))return;var s=document.createElement('style');s.id='k12-leg-css';
        s.textContent='.k12-leg{font-style:normal;display:inline-block;font-size:10px;font-weight:800;border-radius:6px;padding:1px 6px;margin-right:4px;background:#eef3fb;color:#2c4f86;border:1px solid #d3def0;white-space:nowrap}.k12-leg.all{background:#f1efe6;color:#6b5a2a;border-color:#e3dcc4}';(document.head||document.documentElement).appendChild(s)})();
    })();
