    /* 1010A #4／#21：模擬旅客的 PNR 在「定位管理」查得到、改得到
       使用者：「AI Simulate 的 PNR 在定位管理要可以查得到」「所有的模擬的 PNR 都要可以在定位管理中調整」。
       · 定位管理查不到正式訂位時，到模擬旅客名單找（先找航班資料看過的那幾班，再從今天往後 60 天、往前 3 天逐日找，
         分段執行不卡畫面）；找到就把這位旅客轉成一筆正式訂位（S.bookings，b.simR1010A 記來源），
         之後改票、退票、請款、備註、特殊服務都走正式訂位的流程，前後台同步。
       · 轉成正式訂位的旅客，從模擬名單排除（simManifest 外面包一層），航班資料、座位、庫存不會算兩次。 */
    var SMAT10={n:-1,b:null,m:{}};
    function mat10map(){var B=S.bookings||[];if(SMAT10.n===B.length&&SMAT10.b===B)return SMAT10.m;var m={};
      B.forEach(function(b){var s=b&&b.simR1010A;if(s&&s.code&&s.date)(m[s.code+'|'+s.date]=m[s.code+'|'+s.date]||{})[b.pnr]=1});SMAT10={n:B.length,b:B,m:m};return m}
    (function wrapSm10(){var g=window.simManifest;if(typeof g!=='function'||g.__r1010A)return;
      var w=function(code,date){var r=g.apply(this,arguments);try{var m=mat10map()[String(code||'').split('/')[0]+'|'+date];if(m&&Array.isArray(r))r=r.filter(function(x){return !(x&&m[x.pnr])})}catch(_){}return r};
      w.__r1010A=1;window.simManifest=w})();
    window.kgmSimIdxR1010A=function(rows,f,date){try{var I=window.KGM_SIMIDX_R1010A=window.KGM_SIMIDX_R1010A||{};(rows||[]).forEach(function(x){if(x&&!x.real&&x.pnr&&/^[A-Z0-9]{6}$/.test(x.pnr))I[x.pnr]={f:f,date:date}})}catch(_){}};
    function AD10(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
    function hit10(pnr,f,date){try{var rows=window.manifest7(f,date)||[];var x=rows.filter(function(r){return r&&!r.real&&r.pnr===pnr&&!/^(SB:|DH\|)/.test(String(r.id||''))&&r.cabin!=='Resident'})[0];return x?{f:f,date:date,x:x}:null}catch(_){return null}}
    var CABF10={First:'F-X',Business:'B-T',Premium:'P-F',Economy:'E-C'};
    function simMat10(h){
      if(!h)return null;var x=h.x,f=h.f,date=h.date;
      var ex=(S.bookings||[]).filter(function(b){return b&&b.pnr===x.pnr})[0];if(ex)return ex;
      var fare=x.fare;try{if(!(FARES[fare]||(typeof AWARD_FARES!=='undefined'&&AWARD_FARES[fare])))fare=CABF10[x.cabin]||'E-C'}catch(_){fare=CABF10[x.cabin]||'E-C'}
      var nm=[x.last,x.first].filter(Boolean).join(' ')||x.name||'';
      var price=0;try{price=Math.round(owPrice(Object.assign({},f,{date:date}),fare,1)||0)}catch(_){}
      var hh=0;for(var i=0;i<x.pnr.length;i++)hh=(hh*31+x.pnr.charCodeAt(i))>>>0;
      var bt=new Date(date+'T09:00:00Z');bt.setUTCDate(bt.getUTCDate()-(7+hh%70));var now=new Date();if(bt>now)bt=new Date(now.getTime()-(1+hh%48)*3600e3);
      var b={pnr:x.pnr,status:'confirmed',userId:null,
        simR1010A:{code:f.code,fr:f.fr,to:f.to,date:date,at:new Date().toISOString(),by:(S.adminUser||{}).empId||''},
        search:{type:'OW',fr:f.fr,to:f.to,dep:date,pax:1},outF:Object.assign({},f,{date:date}),outC:fare,inbF:null,
        paxList:[{title:'',firstName:String(x.first||'').toUpperCase(),lastName:String(x.last||'').toUpperCase(),dob:x.dob||'',passport:'',nat:x.nationality||'',email:x.email||'',ffpNum:x.member||'',tier:x.tier||'',passengerType:'ADT'}],
        contactEmail:x.email||'',seats:{out:(function(){var o={};if(x.seat)o[x.seat]=nm;return o})()},mealChoice:x.meal?{out:x.meal}:{},
        total:price,curr:'TWD',bookedAt:bt.toISOString(),ticketNumber:'297'+String((hh*7919)%10000000000).padStart(10,'0')};
      b.ticket=b.ticketNumber;S.bookings=S.bookings||[];S.bookings.push(b);
      try{logAct('模擬旅客轉為正式訂位',x.pnr+' '+f.code+' '+date+' '+nm)}catch(_){}
      try{save()}catch(_){}
      return b;
    }
    window.kgmSimMaterializeR1010A=simMat10;
    window.kgmSimFindR1010A=function(pnr,cb){
      pnr=String(pnr||'').toUpperCase();var ix=(window.KGM_SIMIDX_R1010A||{})[pnr];
      if(ix){var h0=hit10(pnr,ix.f,ix.date);if(h0){cb(simMat10(h0));return}}
      var T=todayISO(),ord=[0,1,-1,2,-2,3,-3];for(var i=4;i<=60;i++)ord.push(i);var k=0,j=0,d='',L=null;
      (function step(){var t0=Date.now();   /* 每一小段最多 60 毫秒，畫面不會卡 */
        while(Date.now()-t0<60){
          if(!L||j>=L.length){if(k>=ord.length){cb(null);return}d=AD10(T,ord[k++]);j=0;L=[];try{L=kgmDayOf72R1006A(d)||[]}catch(_){}continue}
          var f=L[j]&&L[j].f,ac=L[j]&&L[j].t;j++;if(!f||f.partner||f.codeshare)continue;var ff=Object.assign({},f,{acft:ac||f.acft}),m=[];
          try{m=window.simManifest(f.code,d,ff)||[]}catch(_){}
          var has=m.some(function(x){return x&&x.pnr===pnr});
          if(!has){try{var ch=window.kgmFifthChainR96&&window.kgmFifthChainR96(f.code,f.fr,f.to);if(ch&&ch.via===f.fr)has=(window.simManifest(f.code+'/'+f.fr,d,ff)||[]).some(function(x){return x&&x.pnr===pnr})}catch(_){}}
          if(has){var h=hit10(pnr,f,d);if(h){cb(simMat10(h));return}}}
        setTimeout(step,0)})();
    };
    window.kgmSimBusyR1010A=function(p){var s=S.simSearchR1010A;if(s&&s.pnr===p&&s.busy)return '<div class="k10-simbusy"><i></i>正在旅客名單（含模擬旅客）查詢 '+hE(p)+'…</div>';return ''};
    (function wrapPnr10(n){var g=window.kgmSearchPnr0819J;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapPnr10(n+1)},500);return}if(g.__r1010A)return;
      var w=function(){var el=document.getElementById('jPnr'),p=String((el||{}).value||'').trim().toUpperCase();
        var any=(S.bookings||[]).some(function(b){if(!b)return false;if(String(b.pnr||'').toUpperCase()===p||String(b.userId||'').toUpperCase()===p)return true;return (b.paxList||[]).some(function(x){return String(x.kgmId||x.ffpNum||'').toUpperCase()===p})});
        if(any||!/^[A-Z0-9]{6}$/.test(p))return g.apply(this,arguments);
        S.simSearchR1010A={pnr:p,busy:1};g.apply(this,arguments);
        window.kgmSimFindR1010A(p,function(b){S.simSearchR1010A={pnr:p,busy:0};
          if(b){S.bookingSearch0819J=b.pnr;S.bookingMemberMatches0910=[];S.bookingMode0819J='home';S.bookingVerify0819J={pnr:b.pnr,checks:{}}}
          try{render()}catch(_){}})};
      w.__r1010A=1;window.kgmSearchPnr0819J=w})(0);

    /* 1010A #4：旅客備註與特殊服務（定位管理 → 查到訂位後，每位旅客分開設定）
       使用者：「後台要可以幫每位旅客新增備註或選擇特殊服務，可能透過定位管理那裡」。
       存在 paxList[i].ssrR1010A（IATA 特殊服務代碼）與 remarkR1010A；勾選與輸入中的內容先存在 S.svcDraftR1010A，
       畫面重畫也不會不見；按「儲存」才寫進訂位、記動作歷史。航班資料名單的姓名旁顯示代碼（滑過看說明／備註）。 */
    var SSR10=[['WCHR','輪椅（可自行上下階梯）'],['WCHS','輪椅（無法上下階梯）'],['WCHC','輪椅（需協助至座位）'],['BLND','視障旅客'],['DEAF','聽障旅客'],
      ['DPNA','智能／發展障礙協助'],['MAAS','機場全程協助'],['UMNR','無成人陪伴兒童'],['MEDA','醫療狀況（需醫療證明）'],['PPOC','攜帶式氧氣機'],
      ['SVAN','服務犬'],['PETC','客艙寵物'],['BSCT','嬰兒搖籃'],['EXST','加購座位'],['LANG','語言協助']];
    var SSRZ10={};SSR10.forEach(function(s){SSRZ10[s[0]]=s[1]});
    function svcCur10(b,i){var p=(b.paxList||[])[i]||{},d=(S.svcDraftR1010A||{})[b.pnr+'|'+i];return d?{ssr:d.ssr||[],rmk:d.rmk||'',draft:1}:{ssr:p.ssrR1010A||[],rmk:p.remarkR1010A||'',draft:0}}
    window.kgmPaxSvcHtmlR1010A=function(b){
      if(!b||!b.pnr)return '';var P=b.paxList||[];if(!P.length)return '';
      var fl=S.svcFlashR1010A||{},flOn=fl.pnr===b.pnr&&(Date.now()-(+fl.t||0))<5000;
      return '<section class="k10svc"><header><div><small>PASSENGER SERVICES · REMARKS</small><h3>旅客備註與特殊服務</h3>'
        +'<p>每位旅客分開設定。儲存後，航班資料名單的姓名旁會出現服務代碼，地勤與客艙都看得到；每次修改都記在動作歷史。</p></div>'
        +(b.simR1010A?'<span class="k10svc-sim">由模擬旅客轉入・'+hE(b.simR1010A.code)+' '+hE(String(b.simR1010A.date||'').slice(5))+'</span>':'')+'</header>'
        +'<div class="k10svc-list">'+P.map(function(p,i){var c=svcCur10(b,i),on={},saved=p.ssrR1010A||[];c.ssr.forEach(function(x){on[x]=1});
          return '<div class="k10svc-pax"><div class="k10svc-h"><b>'+(i+1)+'. '+hE([p.lastName,p.firstName].filter(Boolean).join(' / ')||'—')+'</b>'
            +'<span>'+(saved.length?saved.map(function(x){return '<em title="'+hE(SSRZ10[x]||x)+'">'+hE(x)+'</em>'}).join(''):'<i>尚未設定特殊服務</i>')+'</span></div>'
            +'<div class="k10svc-chips">'+SSR10.map(function(s){return '<label class="k10svc-chip'+(on[s[0]]?' on':'')+'"><input type="checkbox" data-k10ssr="'+i+'" value="'+s[0]+'"'+(on[s[0]]?' checked':'')+' onchange="kgmPaxSvcDraftR1010A(\''+hE(b.pnr)+'\','+i+')"><b>'+s[0]+'</b>'+hE(s[1])+'</label>'}).join('')+'</div>'
            +'<textarea class="inp k10svc-rmk" id="k10rmk'+i+'" rows="2" maxlength="500" oninput="kgmPaxSvcDraftR1010A(\''+hE(b.pnr)+'\','+i+')" placeholder="備註（例如：行動較慢，請安排優先登機；希望靠走道座位）">'+hE(c.rmk)+'</textarea>'
            +'<div class="k10svc-f"><small>'+(c.draft?'<b class="k10svc-dirty">尚未儲存</b>　':'')+(p.svcAtR1010A?('最後更新 '+hE(String(p.svcAtR1010A).slice(0,16).replace('T',' '))+(p.svcByR1010A?' · '+hE(p.svcByR1010A):'')):'尚無紀錄')+'</small>'
            +(flOn&&fl.i===i?'<span class="k10svc-ok">✓ 已儲存</span>':'')
            +'<button class="btn btn-g btn-sm" onclick="kgmPaxSvcSaveR1010A(\''+hE(b.pnr)+'\','+i+')">儲存這位旅客</button></div></div>'}).join('')+'</div></section>';
    };
    window.kgmPaxSvcDraftR1010A=function(pnr,i){
      var codes=[].slice.call(document.querySelectorAll('input[data-k10ssr="'+i+'"]')).filter(function(x){return x.checked}).map(function(x){return x.value});
      [].slice.call(document.querySelectorAll('input[data-k10ssr="'+i+'"]')).forEach(function(x){if(x.parentNode)x.parentNode.classList.toggle('on',x.checked)});
      var t=String((document.getElementById('k10rmk'+i)||{}).value||'');
      (S.svcDraftR1010A=S.svcDraftR1010A||{})[pnr+'|'+i]={ssr:codes,rmk:t};
    };
    window.kgmPaxSvcSaveR1010A=function(pnr,i){
      var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!b)return;var p=(b.paxList||[])[i];if(!p)return;
      window.kgmPaxSvcDraftR1010A(pnr,i);var d=(S.svcDraftR1010A||{})[pnr+'|'+i]||{ssr:p.ssrR1010A||[],rmk:p.remarkR1010A||''};
      var codes=(d.ssr||[]).filter(function(x){return SSRZ10[x]}),t=String(d.rmk||'').trim().slice(0,500);
      var was=(p.ssrR1010A||[]).join(',')+'|'+(p.remarkR1010A||'');
      p.ssrR1010A=codes;p.remarkR1010A=t;p.svcAtR1010A=new Date().toISOString();p.svcByR1010A=(S.adminUser||{}).name||(S.adminUser||{}).empId||'';
      (b.svcLogR1010A=b.svcLogR1010A||[]).push({at:p.svcAtR1010A,by:p.svcByR1010A,i:i,ssr:codes.slice(),remark:t});
      if(was!==codes.join(',')+'|'+t){try{logAct('旅客備註／特殊服務',pnr+' 第 '+(i+1)+' 位：'+(codes.join(' ')||'無特殊服務')+(t?'；備註：'+t.slice(0,60):''))}catch(_){}}
      if(S.svcDraftR1010A)delete S.svcDraftR1010A[pnr+'|'+i];
      S.svcFlashR1010A={pnr:pnr,i:i,t:Date.now()};try{save()}catch(_){}try{render()}catch(_){}
    };
    window.kgmSsrBadgeR1010A=function(x){try{if(!x||!x.real||!x.booking)return '';var p=(x.booking.paxList||[])[x.passengerIndex]||{},c=p.ssrR1010A||[];
      return c.map(function(k){return ' <span class="k10ssr" title="'+hE(SSRZ10[k]||k)+'">'+hE(k)+'</span>'}).join('')+(p.remarkR1010A?' <span class="k10ssr rmk" title="'+hE('備註：'+p.remarkR1010A)+'">備註</span>':'')}catch(_){return ''}};

    /* 1010A #3：退票核准的模擬資料（使用者「那個要有 Simulate Data」）
       後台第一次登入時，從未來 4～16 天的航班挑 6 位模擬旅客轉成正式訂位，替他們送出取消／退票申請：
       4 件待核准、1 件已駁回、1 件旅客撤回。走的是跟旅客自己申請一樣的案件流程（案件處理中心看得到、可以核准／駁回），
       只做一次（S.refundSimR1010A，存檔同步）。 */
    window.kgmRefundSimSeedR1010A=function(force){
      try{
        if(!force&&S.refundSimR1010A&&S.refundSimR1010A.v)return 0;
        var st=window.kgmRefundStoreR113&&window.kgmRefundStoreR113();if(!st||!window.kgmOpenCaseR84||!window.manifest7)return 0;
        var T=todayISO(),plan=[[4,'pending',30],[7,'pending',9],[11,'pending',52],[16,'pending',3],[9,'rejected',120],[13,'withdrawn',75]],made=[];
        plan.forEach(function(q,qi){
          var d=AD10(T,q[0]),L=[];try{L=(kgmDayOf72R1006A(d)||[]).filter(function(x){return x&&x.f&&!x.f.partner&&!x.f.codeshare&&!x.f.via})}catch(_){}
          if(!L.length)return;
          var hh=0,key='rf10|'+d+'|'+qi;for(var i=0;i<key.length;i++)hh=(hh*31+key.charCodeAt(i))>>>0;
          var x0=L[hh%L.length],f=x0.f,rows=[];
          try{rows=(window.manifest7(f,d)||[]).filter(function(r){return r&&!r.real&&/^[A-Z0-9]{6}$/.test(r.pnr||'')&&!/^(SB:|DH\|)/.test(String(r.id||''))&&r.cabin!=='Resident'&&!st[r.pnr]})}catch(_){}
          if(!rows.length)return;
          var x=rows[(hh>>>3)%rows.length],b=simMat10({f:f,date:d,x:x});if(!b||st[b.pnr])return;
          var fee=4800;try{var v=window.kgmRefundFeeR60&&window.kgmRefundFeeR60(b.outC);if(v!=null)fee=v}catch(_){}
          var paid=+b.total||0;if(!paid){paid=12000+hh%30000;b.total=paid}var net=Math.max(0,paid-fee);
          var at=new Date(Date.now()-q[2]*3600e3).toISOString(),p=b.paxList[0]||{};
          var c=window.kgmOpenCaseR84({type:'refund',title:'旅客取消／退票申請（待執行長核准）',pnr:b.pnr,booking:b,name:{first:p.firstName,last:p.lastName},amount:net,currency:'TWD',
            external:'您的取消／退票申請已受理。預計退款 NT$'+net.toLocaleString()+'。在本公司核准之前，您仍可在「行程管理」撤回申請。',
            internal:'待執行長核准。退票手續費 NT$'+fee.toLocaleString()+'（整筆訂單一次）。',originR103:'passenger'});
          if(!c)return;
          c.createdAt=at;(c.log||[]).forEach(function(l){l.at=at;l.by='旅客（行程管理）'});c.simR1010A=1;
          var r={id:'RF'+String(Date.parse(at)).slice(-8),pnr:b.pnr,at:at,status:'pending',net:net,fee:fee,currency:'TWD',caseId:c.id,by:'',channel:'passenger',simR1010A:1};
          st[b.pnr]=r;b.cancelPendingR113=r.id;b.caseNoR103=c.id;
          if(q[1]!=='pending'){
            var cl=new Date(Date.parse(at)+(6+hh%30)*3600e3).toISOString();r.status=q[1];r.closedAt=cl;delete b.cancelPendingR113;c.status='closed';c.closedAtR103=cl;
            if(q[1]==='rejected'){r.reason='旅客重複申請（同一行程已另案處理），本件駁回。';(c.log=c.log||[]).push({at:cl,by:'執行長',what:'退票申請駁回：'+r.reason})}
            else{c.resolutionR113='旅客自行撤回取消申請，案件終止。';(c.log=c.log||[]).push({at:cl,by:'旅客',what:'撤回取消申請，訂位已恢復'})}
          }
          made.push(b.pnr);
        });
        S.refundSimR1010A={v:1,at:new Date().toISOString(),pnrs:made};try{save()}catch(_){}
        return made.length;
      }catch(e){try{console.warn('1010A refund sim',e)}catch(_){}return 0}
    };
    (function seed10(n){if(n>150)return;setTimeout(function(){
      try{if(S.refundSimR1010A&&S.refundSimR1010A.v)return;
        if(S.adminAuthed&&S.view==='admin'&&typeof kgmDayOf72R1006A==='function'&&window.manifest7){if(window.kgmRefundSimSeedR1010A()){try{render()}catch(_){}}return}}catch(_){}
      seed10(n+1)},n?4000:9000)})(0);

    (function css10(){if(document.getElementById('kgm-1010a-css'))return;var s=document.createElement('style');s.id='kgm-1010a-css';s.textContent=
       '.k10svc{border:1px solid #E7E1D2;border-radius:16px;background:#fff;margin:16px 0 0;overflow:hidden;box-shadow:0 3px 12px rgba(20,45,36,.04)}'
      +'.k10svc>header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:16px 20px;background:#FBF9F3;border-bottom:1px solid #EFEADC}'
      +'.k10svc>header small{display:block;font-size:9.5px;letter-spacing:.18em;color:#B39B5E;font-weight:800}'
      +'.k10svc>header h3{margin:3px 0 2px;font:900 16px Georgia,serif;color:#1F4E46}.k10svc>header p{margin:0;font-size:11px;color:#8A8578;line-height:1.7;max-width:70ch}'
      +'.k10svc-sim{font-size:10.5px;font-weight:800;color:#7A5B12;background:#FBF1D6;border:1px solid #E7D6A8;border-radius:999px;padding:3px 10px;white-space:nowrap}'
      +'.k10svc-pax{padding:14px 20px;border-top:1px solid #F2EEE4}.k10svc-pax:first-child{border-top:0}'
      +'.k10svc-h{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}.k10svc-h b{font-size:13.5px;color:#2E3B36}'
      +'.k10svc-h em{font-style:normal;font:800 10.5px ui-monospace,Menlo,monospace;background:#1F4E46;color:#fff;border-radius:6px;padding:2px 7px;margin-left:4px}.k10svc-h i{font-size:11px;color:#9A948A;font-style:normal}'
      +'.k10svc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}'
      +'.k10svc-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #E7E1D2;border-radius:999px;padding:5px 11px;font-size:11.5px;color:#5E5A50;cursor:pointer;background:#fff;transition:background .15s,border-color .15s,color .15s;user-select:none}'
      +'.k10svc-chip input{display:none}.k10svc-chip b{font:800 10.5px ui-monospace,Menlo,monospace;color:#1F4E46}'
      +'.k10svc-chip:hover{border-color:#B39B5E}.k10svc-chip.on{background:#1F4E46;border-color:#1F4E46;color:#fff}.k10svc-chip.on b{color:#F3E3B5}'
      +'.k10svc-rmk{width:100%;box-sizing:border-box;min-height:56px;border-radius:11px;font-size:12.5px;line-height:1.6;padding:9px 12px;resize:vertical}'
      +'.k10svc-f{display:flex;align-items:center;gap:10px;margin-top:8px}.k10svc-f small{flex:1;font-size:10.5px;color:#9A948A}.k10svc-dirty{color:#B3261E}.k10svc-ok{font-size:11.5px;font-weight:800;color:#1f6f4a}'
      +'.k10ssr{display:inline-block;font:800 9.5px ui-monospace,Menlo,monospace;background:#E8F0ED;color:#1F4E46;border:1px solid #C9DDD5;border-radius:5px;padding:1px 5px;margin-left:2px;vertical-align:1px;cursor:help}'
      +'.k10ssr.rmk{background:#FBF1D6;color:#7A5B12;border-color:#E7D6A8;font-family:inherit}'
      +'.k10-simbusy{display:flex;align-items:center;gap:10px;margin:12px 0;padding:12px 16px;border:1px solid #E7E1D2;border-radius:12px;background:#FBF9F3;font-size:12.5px;color:#1F4E46}'
      +'.k10-simbusy i{width:14px;height:14px;border:2px solid #C9DDD5;border-top-color:#1F4E46;border-radius:50%;animation:k10spin .8s linear infinite}@keyframes k10spin{to{transform:rotate(360deg)}}';
      (document.head||document.documentElement).appendChild(s)})();
