    /* 1012A：登機證改成使用者給的參考版型（白底卡片：艙等＋航空公司標誌、Gate／Boarding Time／Seat／Zone、Flight 與起訖、
       虛線下方 Name／Flight / Date／ETKT／SEQ／Member Card No. 與 QR、紅字提醒；卡片外「重要訊息」與出境查驗聯、列印鈕）。
       原本四個地方各畫各的（行程登機證 boardingPass0814、行程管理 r7、r6、下載列印），欄位與登機時間都不一樣（起飛前 30／40 分）。
       四個地方都改讀這一份：登機時間、櫃檯、登機組別、座位全部同一個來源。 */
    (function(){
      var CSS12=''
        +'.k12bp-wrap{max-width:820px;margin:0 auto;color:#1c2421;font-family:"Helvetica Neue",Arial,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif}'
        +'.k12bp-title{text-align:center;font:700 34px "Helvetica Neue",Arial,"PingFang TC","Noto Sans TC",sans-serif;letter-spacing:.01em;margin:4px 0 12px;color:#111}'
        +'.k12bp-sub{text-align:center;font-size:14.5px;color:#2b2b2b;margin:0 0 26px}'
        +'.k12bp-card{background:#fff;border-radius:8px;box-shadow:0 2px 12px rgba(16,40,32,.10);border-top:7px solid #2f6b56;overflow:hidden;margin:0 0 26px}'
        +'.k12bp-top{padding:28px 30px 0}'
        +'.k12bp-hd{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:34px}'
        +'.k12bp-cab{font-size:20px;font-weight:600;color:#3f6f5e}.k12bp-cab i{font-style:normal;font-size:13px;color:#b8975a;margin-left:8px}'
        +'.k12bp-logo{display:flex;align-items:center;gap:12px}'
        +'.k12bp-logo b{font:700 24px Georgia,"Times New Roman",serif;letter-spacing:.02em;color:#0b3a2e;white-space:nowrap}.k12bp-logo b span{color:#b8975a}'
        +'.k12bp-logo em{width:1px;height:30px;background:#c9d2ce;display:block}'
        +'.k12bp-logo small{font-size:11px;letter-spacing:.12em;color:#4a4a4a;display:flex;align-items:center;gap:6px}'
        +'.k12bp-logo small:after{content:"";width:11px;height:11px;border:2px solid #7f7f7f;border-radius:50%;display:inline-block}'
        +'.k12bp-g4{display:grid;grid-template-columns:2.3fr 1.2fr .9fr .6fr;gap:12px;padding-bottom:22px;border-bottom:1px solid #e7ebe9}'
        +'.k12bp-k{font-size:15px;color:#4f7a69;margin-bottom:12px}'
        +'.k12bp-v{font-size:29px;font-weight:600;color:#111;line-height:1.1;font-variant-numeric:tabular-nums}'
        +'.k12bp-g4>div:not(:first-child){text-align:left}.k12bp-g4>div:last-child{text-align:right}'
        +'.k12bp-fl{display:grid;grid-template-columns:1.3fr 1fr .8fr 1fr;align-items:center;gap:12px;padding:24px 0 26px}'
        +'.k12bp-ap{text-align:center}.k12bp-ap b{display:block;font-size:24px;font-weight:600;color:#111;letter-spacing:.02em}'
        +'.k12bp-ap span{display:block;font-size:15px;color:#4f7a69;margin-top:12px;letter-spacing:.02em}'
        +'.k12bp-pl{text-align:center;color:#3a3a3a}.k12bp-pl svg{width:74px;height:34px}'
        +'.k12bp-cut{border-top:1.5px dashed #9aa5a0;margin:0 30px}'
        +'.k12bp-bt{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 30px 26px}'
        +'.k12bp-dl{display:grid;grid-template-columns:auto 1fr;gap:9px 26px;font-size:15px}.k12bp-dl dt{font-weight:700;color:#111}.k12bp-dl dd{margin:0;color:#2b2b2b;font-variant-numeric:tabular-nums}'
        +'.k12bp-note{color:#c2410c;font-size:15px;margin-top:22px}'
        +'.k12bp-qr{flex:none;width:112px;height:112px}'
        +'.k12bp-info{font-size:15px;color:#1c1c1c;margin:4px 0 30px}.k12bp-info h4{font-size:16px;font-weight:500;margin:0 0 10px}'
        +'.k12bp-info ul{margin:0;padding-left:22px}.k12bp-info li{margin:8px 0;line-height:1.55}.k12bp-info li b{color:#0b3a2e}'
        +'.k12bp-stub{display:flex;justify-content:space-between;align-items:center;gap:20px;border:1px solid #7b7b7b;border-radius:8px;background:#f3f3f3;padding:22px 28px;margin:0 0 30px}'
        +'.k12bp-stub dl{display:grid;grid-template-columns:auto 1fr;gap:12px 28px;margin:0;font-size:16px}.k12bp-stub dt{color:#111}.k12bp-stub dd{margin:0;font-variant-numeric:tabular-nums}'
        +'.k12bp-imm{width:160px;height:100px;border:1px solid #333;background:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex:none}'
        +'.k12bp-leg{display:inline-block;font-size:12px;font-weight:700;color:#7a5a17;background:#f8eedb;border:1px solid #e3cf9f;border-radius:999px;padding:3px 10px;margin:0 0 10px}'
        +'.k12bp-print{display:block;margin:6px auto 10px;min-width:180px;height:44px;border:0;border-radius:6px;background:#2f6b56;color:#fff;font-size:16px;font-weight:600;letter-spacing:.1em;cursor:pointer}'
        +'.k12bp-print:hover{background:#245544}'
        +'@media (max-width:640px){.k12bp-top{padding:20px 18px 0}.k12bp-cut{margin:0 18px}.k12bp-bt{padding:20px 18px;flex-direction:column;align-items:flex-start}'
          +'.k12bp-g4{grid-template-columns:1fr 1fr;row-gap:18px}.k12bp-g4>div:last-child{text-align:left}.k12bp-fl{grid-template-columns:1fr 1fr 1fr}.k12bp-fl>div:first-child{grid-column:1/-1}'
          +'.k12bp-logo b{font-size:20px}.k12bp-v{font-size:24px}.k12bp-title{font-size:28px}.k12bp-stub{flex-direction:column;align-items:flex-start}.k12bp-hd{flex-direction:column;align-items:flex-start}}'
        +'@media print{html.k12bp-printing body *{visibility:hidden!important}html.k12bp-printing .k12bp-wrap,html.k12bp-printing .k12bp-wrap *{visibility:visible!important}'
          +'html.k12bp-printing .k12bp-wrap{position:absolute;left:0;top:0;width:100%;max-width:none}.k12bp-print{display:none!important}.k12bp-card{box-shadow:none;border:1px solid #ccc;break-inside:avoid}.k12bp-stub{break-inside:avoid}}';
      window.KGM_BP_CSS_R1012A=CSS12;
      function css(){if(document.getElementById('k12bp-css'))return;var st=document.createElement('style');st.id='k12bp-css';st.textContent=CSS12;(document.head||document.documentElement).appendChild(st)}
      try{css()}catch(_){}
      function zh(){try{return LANG!=='en'}catch(_){return true}}
      function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
      function hash(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h}
      function mins(t){var a=String(t||'00:00').split(':');return (+a[0]||0)*60+(+a[1]||0)}
      function hhmm(m){m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
      function cityEn(c){try{return (typeof CITY_EN!=='undefined'&&CITY_EN[c])||c}catch(_){return c}}
      var MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      function ddmon(d){var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(String(d||''));return m?(m[3]+MON[+m[2]-1]):String(d||'')}
      var CABEN={Economy:'Economy Class',Premium:'Premium Economy',Business:'Business Class',First:'First Class',Resident:'The Residence'};
      function cabinOf(fare){var x={};try{x=(FARES[fare]||AWARD_FARES[fare]||{})}catch(_){}if(x.cabin)return x.cabin;var m=/^(?:AW-)?([EPBFR])-/.exec(String(fare||''));return m?({E:'Economy',P:'Premium',B:'Business',F:'First',R:'Resident'})[m[1]]:'Economy'}
      /* 登機與關櫃時間：跟行程卡同一套（國內線 25／30 分，其他 40／60 分；登機門起飛前 10 分關閉，KGM-GC 第 12 條） */
      function times(f){var dom=(f.fr==='TSA'||f.to==='TSA')&&['TPE','TSA','RMQ','KHH','TNN','HUN','TTT','MZG','KNH','LZN'].indexOf(f.to)>=0;
        var d=mins(f.dep),brd=dom?25:40,close=dom?30:60;return {board:hhmm(d-brd),close:close,brdMin:brd}}
      /* 簡化的 QR 圖樣（三個定位框＋依訂位產生的格點），只是示意 */
      function qr(seed){var n=25,h=hash(seed),cells='',x,y;
        function fin(cx,cy){return '<rect x="'+cx+'" y="'+cy+'" width="7" height="7" fill="#111"/><rect x="'+(cx+1)+'" y="'+(cy+1)+'" width="5" height="5" fill="#fff"/><rect x="'+(cx+2)+'" y="'+(cy+2)+'" width="3" height="3" fill="#111"/>'}
        for(y=0;y<n;y++)for(x=0;x<n;x++){if((x<8&&y<8)||(x>16&&y<8)||(x<8&&y>16))continue;h=(Math.imul(h^(x*31+y),1664525)+1013904223)>>>0;if((h>>>28)&1)cells+='M'+x+' '+y+'h1v1h-1z'}
        return '<svg class="k12bp-qr" viewBox="-1 -1 27 27" shape-rendering="crispEdges" aria-label="QR"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/><path d="'+cells+'" fill="#111"/>'+fin(0,0)+fin(18,0)+fin(0,18)+'</svg>'}
      var PLANE='<svg viewBox="0 0 80 36" aria-hidden="true"><g fill="#3a3a3a" transform="rotate(-14 40 18)"><path d="M6 20.5c0-1.4 1.1-2.5 2.5-2.5H58c5.5 0 10.5 1.3 13 3 1 .7 1 1.7 0 2.3-2.5 1.6-7.5 2.7-13 2.7H12.5c-1.3 0-2.5-.7-3.1-1.8z"/><path d="M30 19 42 4h5.5l-6 15zM33 25l8 9h5l-4-9zM8.5 19 6 9h4.5l7 10z"/></g></svg>';
      /* 一張登機證需要的資料（b＝訂位，seg＝航段 key；ov 可覆蓋 f／fare／seat／legLabel／cabinNote） */
      window.kgmBpDataR1012A=function(b,seg,ov){
        ov=ov||{};seg=seg||'out';var info=null;try{info=bookingSegInfo0813(b,seg)}catch(_){}
        var f=ov.f||(info&&info.f)||{};f=Object.assign({},f);if(ov.date)f.date=ov.date;
        var fare=ov.fare||((b.segmentFare0826A||{})[seg])||(info&&info.c)||b.outC;
        var seat=ov.seat;if(seat==null){var so=(b.seats||{})[seg]||{};seat=Object.keys(so).filter(function(k){return k!=='_auto'&&so[k]})[0]||'';
          try{if(seat&&window.kgmSeatShowR65)seat=window.kgmSeatShowR65(seat,b,seg)||seat}catch(_){}}
        if(seat==='—'||seat==='-')seat='';
        var p=(b.paxList||[{}])[0]||{},u=null;try{u=(S.users||[]).filter(function(x){return x&&x.id===b.userId})[0]||null}catch(_){}
        var gate='';try{gate=gateFor(f)}catch(_){}if(!gate||gate==='-'||gate==='—')gate='';
        var t=times(f),cab=cabinOf(fare);
        var ctr='';try{ctr=window.kgmCheckinTextR1012A?window.kgmCheckinTextR1012A(f,zh()):''}catch(_){}
        var z='';try{z=window.kgmBpZoneTxtR1012A(b,null,fare,seat,f)}catch(_){z='ZONE 4'}
        return {pnr:b.pnr,f:f,fare:fare,cabin:cab,cabinNote:ov.cabinNote||'',legLabel:ov.legLabel||'',seat:seat,gate:gate,board:t.board,close:t.close,zone:z,ctr:ctr,
          name:((p.lastName||'')+'/'+(p.firstName||'')+(p.title?' '+p.title:'')).toUpperCase().replace(/^\/$/,''),
          etkt:b.ticketNo||b.ticketNumber||b.ticket||('297-'+String(1000000000+hash(b.pnr+'|tkt')%8999999999).slice(0,10)),
          seq:String(1+hash(b.pnr+'|'+seg+'|'+(f.code||'')+'|'+(f.fr||'')+'|seq')%168).padStart(3,'0'),   /* 經停航班每段不同 */
          member:p.ffpNum||p.kgmId||(u&&(u.memberId||u.kgmId||u.id))||''};
      };
      /* 一張登機證（卡片＋重要訊息＋出境查驗聯） */
      window.kgmBpCardR1012A=function(o){
        try{css()}catch(_){}
        var f=o.f||{},Z=zh(),gateTxt=o.gate||'Check at Airport';
        var ctrLine=o.ctr?(Z?('請於班機起飛前至少 '+o.close+' 分鐘至 <b>'+E(o.ctr)+'</b> 完成行李託運手續。'):('Please complete baggage drop at <b>'+E(o.ctr)+'</b> at least '+o.close+' minutes before departure.'))
                         :(Z?('請於班機起飛前至少 '+o.close+' 分鐘至機場報到櫃檯完成行李託運手續。'):('Please complete baggage drop at least '+o.close+' minutes before departure.'));
        return '<div class="k12bp-one">'
          +(o.legLabel?'<span class="k12bp-leg">'+E(o.legLabel)+'</span>':'')
          +'<article class="k12bp-card"><div class="k12bp-top">'
            +'<div class="k12bp-hd"><div class="k12bp-cab">'+E(CABEN[o.cabin]||o.cabin)+(o.cabinNote?'<i>'+E(o.cabinNote)+'</i>':'')+'</div>'
              +'<div class="k12bp-logo"><b>KGM <span>AIRWAYS</span></b><em></em><small>A ONEWORLD MEMBER</small></div></div>'
            +'<div class="k12bp-g4">'
              +'<div><div class="k12bp-k">Gate</div><div class="k12bp-v">'+E(gateTxt)+'</div></div>'
              +'<div><div class="k12bp-k">Boarding Time</div><div class="k12bp-v">'+E(o.board)+'</div></div>'
              +'<div><div class="k12bp-k">Seat</div><div class="k12bp-v">'+E(o.seat||'—')+'</div></div>'
              +'<div><div class="k12bp-k">Zone</div><div class="k12bp-v">'+E(String(o.zone||'').replace(/^ZONE\s*/,''))+'</div></div>'
            +'</div>'
            +'<div class="k12bp-fl">'
              +'<div><div class="k12bp-k">Flight</div><div class="k12bp-v">'+E(f.code)+'</div></div>'
              +'<div class="k12bp-ap"><b>'+E(f.fr)+'</b><span>'+E(String(cityEn(f.fr)).toUpperCase())+'</span></div>'
              +'<div class="k12bp-pl">'+PLANE+'</div>'
              +'<div class="k12bp-ap"><b>'+E(f.to)+'</b><span>'+E(String(cityEn(f.to)).toUpperCase())+'</span></div>'
            +'</div></div>'
            +'<div class="k12bp-cut"></div>'
            +'<div class="k12bp-bt"><div>'
              +'<dl class="k12bp-dl"><dt>Name</dt><dd>'+E(o.name)+'</dd><dt>Flight / Date</dt><dd>'+E(f.code)+' / '+E(ddmon(f.date))+'</dd>'
                +'<dt>ETKT</dt><dd>'+E(o.etkt)+'</dd><dt>SEQ</dt><dd>'+E(o.seq)+'</dd><dt>Member Card No.</dt><dd>'+E(o.member||'—')+'</dd></dl>'
              +'<div class="k12bp-note">*'+(Z?('請於登機時間 '+E(o.board)+' 前抵達登機門；登機門於起飛前 10 分鐘關閉。'):('Please be at the gate by '+E(o.board)+'. The gate closes 10 minutes before departure.'))+'</div>'
            +'</div>'+qr(o.pnr+'|'+f.code+'|'+f.date+'|'+o.seq)+'</div>'
          +'</article>'
          +'<div class="k12bp-info"><h4>重要訊息/Important Information</h4><ul>'
            +(Z?'<li>請自行列印此登機證以辦理機場通關手續及登機作業。</li>'
                +'<li>不需託運行李旅客：您可在完成安全檢查及證照查驗程序後，直接前往登機門。並請於班機起飛前至少 30 分鐘抵達登機門，將旅行證件交給本公司人員檢查。</li>'
                +'<li>需託運行李旅客：'+ctrLine+'</li>'
                +'<li>行李規定及危險品資訊請瀏覽 KGM 航空官網「行李規定」。</li>'
              :'<li>Please print this boarding pass for airport formalities and boarding.</li>'
                +'<li>No checked baggage: after security and passport control, go straight to the gate and be there at least 30 minutes before departure with your travel documents.</li>'
                +'<li>Checked baggage: '+ctrLine+'</li>'
                +'<li>For baggage and dangerous-goods rules, see “Baggage” on the KGM Airways website.</li>')
          +'</ul></div>'
          +'<div class="k12bp-stub"><dl><dt>Name</dt><dd>'+E(o.name)+'</dd><dt>Flight / Date</dt><dd>'+E(f.code)+' / '+E(ddmon(f.date))+'</dd>'
            +'<dt>From – To</dt><dd>'+E(f.fr)+' – '+E(f.to)+'</dd><dt>Seat / SEQ</dt><dd>'+E(o.seat||'—')+' / '+E(o.seq)+'</dd></dl><div class="k12bp-imm">Immigration</div></div>'
        +'</div>';
      };
      /* 整頁：標題、說明、各段登機證、列印 */
      window.kgmBpPageR1012A=function(cards,opt){opt=opt||{};var Z=zh();
        return '<div class="k12bp-wrap">'+(opt.noTitle?'':'<h2 class="k12bp-title">Boarding Pass</h2>')
          +'<p class="k12bp-sub">'+(Z?'請自行列印登機證以辦理機場通關手續及登機作業':'Please print your boarding pass for airport formalities and boarding')+'</p>'
          +cards+(opt.noPrint?'':'<button type="button" class="k12bp-print" onclick="kgmBpPrintR1012A()">'+(Z?'列印':'Print')+'</button>')+'</div>'};
      window.kgmBpPrintR1012A=function(){var h=document.documentElement;h.classList.add('k12bp-printing');function off(){h.classList.remove('k12bp-printing');window.removeEventListener('afterprint',off)}
        window.addEventListener('afterprint',off);try{window.print()}catch(_){}setTimeout(off,60000)};
      /* 下載／另開視窗用的完整 HTML 文件 */
      window.kgmBpCardsOfR1012A=function(b){var segs=[];try{segs=bpSegments(b)}catch(_){}
        return segs.map(function(s){var lg=window.kgmLegBpCardsR1012A?window.kgmLegBpCardsR1012A(b,s.seatKey):'';if(lg)return lg;   /* 單段升等：分段各一張 */
          return window.kgmBpCardR1012A(window.kgmBpDataR1012A(b,s.seatKey,{f:s.f,fare:((b.segmentFare0826A||{})[s.seatKey])||s.c,seat:s.seat||''}))}).join('')};
      window.kgmBpDocR1012A=function(b){var cards=window.kgmBpCardsOfR1012A(b);if(!cards)return '';
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Boarding Pass '+E(b.pnr)+'</title><style>body{margin:0;padding:28px 16px;background:#fafaf8}'+CSS12
          +'@media print{.k12bp-print{display:none}body{background:#fff}}</style></head><body>'+window.kgmBpPageR1012A(cards).replace('onclick="kgmBpPrintR1012A()"','onclick="window.print()"')+'</body></html>'};
    })();
