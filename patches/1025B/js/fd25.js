
/* ══ C：航班資料頁（使用者：「航班資料圖一那樣頁面已經不行了醜的要命」「圖二並沒有比較好只是全部收起來而已」）
   ① 還沒開航班：不再只有一顆「候補」小標籤＋一行字 —— 標題下面是搜尋，接著「今日出發」（桃園／松山，時間、班號、航線、機型、登機門、狀態，按一下就開）
      與「最近開啟」（這台瀏覽器）；查的班號那天沒飛 → 列出前後最近有飛的日期，按一下就開。
   ② 開了航班：航班卡（班號、航線、表定／預估、旅客、行李）永遠在上面，下面是分頁 —— 總覽（天氣＋航線）／旅客名單／座位圖／載重平衡／行李改運／
      餐點／報到核對／候補／全部（照舊整頁直排）。一次只看一個區塊、分頁上直接寫數字（旅客、候補、報到核對失敗、改運件數）。
      每個區塊的內容都沒有拿掉；1022A 的 + / −（收起只留標題列）照舊在「全部」分頁使用。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function city(a){try{return (z()?CITY_ZH:(typeof CITY_EN!=='undefined'?CITY_EN:CITY_ZH))[a]||a}catch(_){return a}}
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function own(){try{return [].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&!f.partner&&!f.codeshare&&/^KX\d+$/.test(String(f.code||''))})}catch(_){return []}}
  function flies(f,d){try{return flyOn(f,new Date(d+'T12:00:00'))}catch(_){return true}}
  function sea(f,d){try{return (window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,d))||f}catch(_){return f}}
  function stat(code,d){var o=(S.flightOverrides||{})[code+'_'+d]||{},s=o.status||'Scheduled';
    var m={Scheduled:['準時','On time','ok'],'On Time':['準時','On time','ok'],Delayed:['延誤','Delayed','warn'],Cancelled:['取消','Cancelled','bad'],Diverted:['轉降','Diverted','bad'],Departed:['已起飛','Departed','mut'],Boarding:['登機中','Boarding','ok']}[s]||[s,s,'mut'];
    return '<i class="k25fd-st '+m[2]+'">'+E(z()?m[0]:m[1])+'</i>'}
  function gate(code,d){try{var g=window.kgmGateOfR26&&window.kgmGateOfR26(code,d);return g?(g.gate||g.stand||''):''}catch(_){return ''}}
  function ac(code,d,f){try{var t=acftOfFlight(code,d,f.fr,f.to);return t&&t!=='EQV'?t:''}catch(_){return f.acft||''}}
  function key(f,d){return [f.code,d,f.fr,f.to].join('|')}
  window.kgmFdOpenR1025B=function(code,d,fr,to){S.opsQueryR7=code;S.opsDateR7=d;S.opsSelectedR7=[code,d,fr,to].join('|');S.fdTabR1025B='ov';try{render()}catch(_){}try{window.scrollTo({top:0})}catch(_){}};
  function row(f,d){var x=sea(f,d);return '<button type="button" class="k25fd-row" onclick="kgmFdOpenR1025B(\''+A(f.code)+'\',\''+d+'\',\''+A(f.fr)+'\',\''+A(f.to)+'\')">'
    +'<time>'+E(x.dep||f.dep)+'</time><b>'+E(f.code)+'</b><span>'+E(f.fr)+' '+E(city(f.fr))+' → '+E(f.to)+' '+E(city(f.to))+'</span><em>'+E(ac(f.code,d,f))+'</em><small>'+(gate(f.code,d)?E((z()?'登機門 ':'Gate ')+gate(f.code,d)):'')+'</small>'+stat(f.code,d)+'<u>'+(z()?'開啟':'Open')+'</u></button>'}
  function recent(){try{var r=JSON.parse(localStorage.getItem('kgm25_fdrecent')||'[]');return Array.isArray(r)?r:[]}catch(_){return []}}
  function remember(k){try{var r=recent().filter(function(x){return x!==k});r.unshift(k);localStorage.setItem('kgm25_fdrecent',JSON.stringify(r.slice(0,6)))}catch(_){}}
  window.kgmOpsLandingR1025B=function(q,date){
    var td=todayISO(),now=new Date(),nowM=now.getHours()*60+now.getMinutes(),h='';
    if(q){   /* 查了但那天沒飛：前後 14 天最近有飛的日子 */
      var Q=String(q).toUpperCase().replace(/\s+/g,''),rt=/^([A-Z]{3})-([A-Z]{3})$/.exec(Q),L=own().filter(function(f){return !f.via&&(rt?(f.fr===rt[1]&&f.to===rt[2]):f.code===Q)}),near=[];
      for(var k=-14;k<=14&&near.length<8;k++){var d=addDays(date,k);if(k===0)continue;L.forEach(function(f){if(flies(f,d)&&near.length<8&&!near.some(function(n){return n.d===d&&n.f.code===f.code&&n.f.fr===f.fr}))near.push({d:d,f:f})})}
      near.sort(function(a,b){return Math.abs(Date.parse(a.d)-Date.parse(date))-Math.abs(Date.parse(b.d)-Date.parse(date))||a.d.localeCompare(b.d)});
      h+='<section class="k25fd-card"><header><b>'+(z()?(E(q)+' 在 '+E(date)+' 沒有航班'):('No '+E(q)+' on '+E(date)))+'</b><span>'+(L.length?(z()?'最近有飛的日期，按一下開啟':'Nearest operating dates'):(z()?'找不到這個班號或航線（班號例：KX180；航線例：TPE-NRT）':'No such flight or route'))+'</span></header>'
        +(near.length?'<div class="k25fd-list">'+near.map(function(n){return row(n.f,n.d).replace('<time>','<time><small>'+E(n.d.slice(5))+'</small>')}).join('')+'</div>':'')+'</section>';
    }
    var dep=own().filter(function(f){return !f.via&&(f.fr==='TPE'||f.fr==='TSA')&&flies(f,td)}).map(function(f){return {f:f,m:mn(sea(f,td).dep||f.dep)}}).sort(function(a,b){return a.m-b.m});
    var up=dep.filter(function(x){return x.m>=nowM-60}),shown=(up.length?up:dep).slice(0,14);
    h+='<section class="k25fd-card"><header><b>'+(z()?'今日出發':'Departing today')+'</b><span>'+E(td)+(z()?'・桃園／松山・接下來 ':' · TPE / TSA · next ')+shown.length+(z()?(' 班（共 '+dep.length+' 班）'):(' of '+dep.length))+'</span></header>'
      +(shown.length?'<div class="k25fd-list">'+shown.map(function(x){return row(x.f,td)}).join('')+'</div>':'<p class="k25fd-none">'+(z()?'今天沒有從桃園／松山出發的航班。':'No departures today.')+'</p>')+'</section>';
    var rc=recent().map(function(k){var p=k.split('|'),f=own().filter(function(x){return x.code===p[0]&&x.fr===p[2]&&x.to===p[3]})[0];return f?{f:f,d:p[1]}:null}).filter(Boolean);
    if(rc.length)h+='<section class="k25fd-card"><header><b>'+(z()?'最近開啟':'Recently opened')+'</b><span>'+(z()?'這台瀏覽器':'This browser')+'</span></header><div class="k25fd-list">'+rc.map(function(n){return row(n.f,n.d).replace('<time>','<time><small>'+E(n.d.slice(5))+'</small>')}).join('')+'</div></section>';
    return h;
  };
  /* ── 開了航班：整頁改成「作業台」版面（使用者第二次：「要有實質上的介面改變…只是加入了一些東西但是一樣不 Organized 不好看」）
     最上面一條深綠色作業列（捲動時固定在頂端）：這一班是誰（班號、航線、日期、機型、機身、狀態）、實體航段切換、區塊目錄（每項寫數字）；
     下面整頁寬（旅客名單、座位圖這種寬表格不被擠）：航班狀態列（表定／預估、旅客、行李）→ 總覽是儀表板（報到進度、行李、載重、Payload、候補、報到核對、餐點、航路，按一下到該區塊）
     → 照片式路線圖（geo25：從太空看的地球、關閉空域、實際航路）→ 天氣；其他分頁一次一個區塊。
     各區塊原本的程式與內容都不動，只重新排版、統一標題與外框；「全部」分頁照舊整頁直排（1022A 的 + / − 仍可用）。 ── */
  var G=[['ov',['wx','route'],['總覽','Overview'],'◎'],['man',['man'],['旅客名單','Manifest'],'☰'],['seat',['seat'],['座位圖','Seat map'],'▦'],['lb',['lb'],['載重平衡','Load & balance'],'⚖'],
    ['bm',['bm'],['行李改運','Bag reroute'],'⇄'],['meal',['meal'],['餐點','Catering'],'◔'],['ci',['ci'],['報到核對','Check-in review'],'✓'],['sb',['sb'],['候補','Standby'],'⏳'],['all',[],['全部','All sections'],'≡']];
  function num(el,re){var m=re.exec((el&&el.textContent)||'');return m?m[1]:''}
  function txt(el){return String((el&&el.textContent)||'').replace(/\s+/g,' ').trim()}
  function cur(){var p=String(S.opsSelectedR7||'').split('|');if(p.length<4)return null;var f=own().filter(function(x){return x.code===p[0]&&x.fr===p[2]&&x.to===p[3]})[0]||null;return f?{f:f,d:p[1]}:null}
  function metric(hero,re){var m=[].slice.call(hero.querySelectorAll('.r7-metric')).filter(function(x){return re.test(txt(x.querySelector('small')))})[0];return m?txt(m.querySelector('b')):''}
  function tzh(c){try{var v=TZ[c];return typeof v==='number'?v:8}catch(_){return 8}}
  function prog(f,d){try{var x=sea(f,d),a=Date.parse(d+'T00:00:00Z')+(mn(x.dep||f.dep)-tzh(f.fr)*60)*60000,b=Date.parse(d+'T00:00:00Z')+(mn(x.arr||f.arr)+(+(x.dd!=null?x.dd:f.dd)||0)*1440-tzh(f.to)*60)*60000,n=Date.now();
    var ov=(S.flightOverrides||{})[f.code+'_'+d]||{};if(ov.status==='Cancelled')return null;return n>a&&n<b?(n-a)/(b-a):null}catch(_){return null}}
  function idCard(c,hero,top){var f=c.f,d=c.d,t=(/·\s*([A-Z0-9]+)\s*$/.exec(txt(hero.querySelector('.r7-kicker')))||[])[1]||ac(f.code,d,f),tail='';try{tail=window.kgmTailOfR1023A?(window.kgmTailOfR1023A(f.code,d,f.fr,f.to)||''):''}catch(_){}
    var dt=new Date(d+'T12:00:00'),wk=z()?['日','一','二','三','四','五','六'][dt.getDay()]:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
    return '<div class="k25fd-id"><div class="cd"><small>'+(z()?'航班作業檔':'Flight file')+'</small><b>'+E(f.code)+'</b></div><div class="rt"><span>'+E(f.fr)+'<i>'+E(city(f.fr))+'</i></span><em>✈</em><span>'+E(f.to)+'<i>'+E(city(f.to))+'</i></span></div>'
      +'<dl><div><dt>'+(z()?'日期':'Date')+'</dt><dd>'+E(d)+'（'+wk+'）</dd></div><div><dt>'+(z()?'機型':'Type')+'</dt><dd>'+E(t||'—')+'</dd></div><div><dt>'+(z()?'機身':'Tail')+'</dt><dd>'+E(tail||'—')+'</dd></div><div><dt>'+(z()?'狀態':'Status')+'</dt><dd>'+stat(f.code,d)+'</dd></div></dl></div>'}
  function kpis(c,hero,secs,cnt){var f=c.f,d=c.d,pax=metric(hero,/PAX/).split('/').map(function(x){return +String(x).replace(/[^\d]/g,'')||0}),bags=metric(hero,/BAGS/).split('/').map(function(x){return String(x).trim()});
    var lbT=txt(secs.lb),zf=/ZFW\s*\/\s*MZFW\s*([\d,]+)\s*\/\s*([\d,]+)/.exec(lbT),li=/建議裝載指數\s*([\d.]+)%/.exec(lbT)||/load index\s*([\d.]+)%/i.exec(lbT),pl=/Payload\s*餘量\s*([\d,]+)\s*kg/.exec(txt(secs.bm))||/Payload\s*餘量\s*([\d,]+)/.exec(txt(secs.sb));
    var mt=txt(secs.meal),un=/未選\s*(\d+)\s*份/.exec(mt),wd=null;try{wd=window.kgmWarDelayR1025B&&window.kgmWarDelayR1025B(f,d)}catch(_){}
    var bk=pax[0]||0,ci=pax[1]||0,bd=pax[2]||0,pc=function(a){return bk?Math.round(a/bk*100):0};
    function tile(go,lab,big,sub,extra,cls){return '<button type="button" class="k25fd-kpi'+(cls?' '+cls:'')+'" data-go="'+go+'"><small>'+lab+'</small><b>'+big+'</b>'+(sub?'<span>'+sub+'</span>':'')+(extra||'')+'</button>'}
    var h='<section class="k25fd-kpis" data-k25="kpi">'
      +tile('man',z()?'報到進度':'Check-in',ci+'<em> / '+bk+'</em>',(z()?'已登機 ':'Boarded ')+bd+'（'+pc(bd)+'%）','<i class="bar"><u style="width:'+pc(ci)+'%"></u><u class="b2" style="width:'+pc(bd)+'%"></u></i>','wide')
      +tile('lb',z()?'托運行李':'Checked bags',E(bags[0]||'0')+'<em>'+(z()?' 件':' pcs')+'</em>',(z()?'額外 ':'Extra ')+E(bags[1]||'0'))
      +tile('lb',z()?'零燃油重量':'ZFW',zf?E(zf[1])+'<em> kg</em>':'—',zf?('MZFW '+E(zf[2])+(li?(z()?'・裝載指數 ':' · LI ')+E(li[1])+'%':'')):'',zf?'<i class="bar"><u style="width:'+Math.min(100,Math.round(+zf[1].replace(/,/g,'')/(+zf[2].replace(/,/g,''))*100))+'%"></u></i>':'')
      +tile('bm','Payload '+(z()?'餘量':'margin'),pl?E(pl[1])+'<em> kg</em>':'—',z()?'可再裝的旅客＋貨物':'Room for pax + cargo')
      +tile('sb',z()?'候補':'Standby',(cnt.sb||'0')+'<em>'+(z()?' 人':'')+'</em>',z()?'哩程升等＋員工票':'Upgrades + staff')
      +tile('ci',z()?'報到核對失敗':'Check-in failures',(cnt.ci||'0')+'<em>'+(z()?' 件':'')+'</em>',z()?'證件／簽證／名單比對':'Docs / visa / watchlist',null,+cnt.ci>0?'alert':'')
      +tile('meal',z()?'餐點未選':'Meals unselected',(un?un[1]:'0')+'<em>'+(z()?' 份':'')+'</em>',z()?'上機再選':'Choose on board')
      +tile('ov',z()?'航路':'Routing',wd&&wd.min>0?('+'+wd.min+'<em>'+(z()?' 分':' min')+'</em>'):(z()?'大圓':'Direct'),wd?((z()?'避開 ':'Avoids ')+E(wd.zonesTxt.join(z()?'、':', '))+'・+'+wd.km.toLocaleString()+' km'):(z()?'不經過關閉空域':'No closed airspace'),null,wd&&wd.min>0?'warn':'')
      +'</section>';
    return h}
  function mapBox(card,c){var box=card.querySelector(':scope > .k25map');
    if(!box){box=document.createElement('div');box.className='k25map';card.insertBefore(box,card.firstChild);card.classList.add('k25has')}
    var L=window.kgmRouteMapLegendR1025B?window.kgmRouteMapLegendR1025B(c.f,c.d):null,sig=c.f.code+'|'+c.d+'|'+(z()?'z':'e');
    if(L&&box.getAttribute('data-sig')!==sig){box.setAttribute('data-sig',sig);
      var hd=card.querySelector(':scope > .k25map-hd');if(!hd){hd=document.createElement('div');hd.className='k25map-hd';card.insertBefore(hd,box)}
      hd.innerHTML='<div class="r7-kicker">FLIGHT PLAN ROUTE</div><h2>'+(z()?'飛行計畫航路':'Flight plan route')+'</h2><p>'+(L.war?(z()?'大圓直飛會經過關閉空域，實際航路繞道（金色線）；紅色斜線＝關閉空域。':'The great circle crosses closed airspace; the planned track (gold) detours around it. Red hatching = closed airspace.'):(z()?'這條航線不經過關閉空域，照大圓航線飛。':'This route does not cross closed airspace.'))+'</p>';
      box.innerHTML='<div class="k25map-lg">'+L.legend+'</div><div class="k25map-info">'+L.info+'</div><div class="k25map-ld">'+(z()?'地圖產生中…':'Rendering map…')+'</div>'}
    if(box.offsetWidth>0&&window.kgmRouteMapR1025B)window.kgmRouteMapR1025B(box,c.f,c.d,prog(c.f,c.d))}
  function apply(){try{
    if(!(S.view==='admin'&&S.adminTab==='flightdata')){if(document.documentElement.classList.contains('k25fd-on'))document.documentElement.classList.remove('k25fd-on');return}
    var root=document.querySelector('.r7-admin');if(!root)return;var mnEl=root.parentElement||root;
    var nav23=mnEl.querySelector('.k23fd-navw'),hero=root.querySelector('.r7-ops-hero'),rail=root.querySelector(':scope > .k25fd-band'),c=cur();
    if(nav23)nav23.style.display='none';
    document.documentElement.classList.toggle('k25fd-on',!!(hero&&c));
    if(!hero||!c){if(rail)rail.remove();mnEl.classList.remove('k25fd-main','k25fd-tabm');root.classList.remove('k25fd-tab');root.classList.add('k25fd-empty');return}
    root.classList.remove('k25fd-empty');mnEl.classList.add('k25fd-main');
    if(S.opsSelectedR7)remember(S.opsSelectedR7);
    var secs={};[].forEach.call(mnEl.querySelectorAll('[data-k23fd]'),function(el){secs[el.getAttribute('data-k23fd')]=el});
    /* 候補區塊：k23 只標「看得見的」那個，被這裡藏起來後標記會被拿掉 → 自己找（看得見的，或是被這裡藏起來的） */
    if(!secs.sb)secs.sb=[].slice.call(mnEl.querySelectorAll(':scope>.k55-standby,:scope>.r40-panel,.r7-admin .k55-standby')).filter(function(x){return x.offsetHeight>0||x.classList.contains('k25fd-hide')})[0]||null;
    var have=G.filter(function(g){return g[0]==='all'||g[1].some(function(k){return secs[k]})});
    var act=S.fdTabR1025B;if(!have.some(function(g){return g[0]===act}))act='ov';
    var tabMode=act!=='all';root.classList.toggle('k25fd-tab',tabMode);mnEl.classList.toggle('k25fd-tabm',tabMode);mnEl.setAttribute('data-k25t',act);
    G.forEach(function(g){g[1].forEach(function(k){var el=secs[k];if(el)el.classList.toggle('k25fd-hide',tabMode&&g[0]!==act)})});
    /* 區塊標題：旅客名單原本沒有標題列 */
    if(secs.man&&!secs.man.querySelector(':scope > .k25fd-sechd')){var hd=document.createElement('div');hd.className='k25fd-sechd';hd.innerHTML='<div class="r7-kicker">PASSENGER MANIFEST</div><h2>'+(z()?'旅客名單':'Passenger manifest')+'</h2>';secs.man.insertBefore(hd,secs.man.firstChild)}
    var cnt={man:num(root.querySelector('.k929-fdbar'),/(\d+)\s*位/)||(secs.man?secs.man.querySelectorAll('tbody tr').length:''),sb:num(secs.sb,/候補人數\s*(\d+)/),ci:num(secs.ci,/報到核對失敗\s*(\d+)/),
      bm:(function(){var m=/已改運出去／改進來\s*(\d+)\s*\/\s*(\d+)/.exec((secs.bm&&secs.bm.textContent)||'');return m?String((+m[1])+(+m[2])):''})()};
    /* 作業列 */
    if(!rail){rail=document.createElement('div');rail.className='k25fd-band';rail.innerHTML='<div class="k25fd-bt"><div class="k25fd-idw"></div><div class="k25fd-sect"></div></div><nav class="k25fd-tabs"></nav>';var srch=root.querySelector(':scope > .r7-ops-search');root.insertBefore(rail,srch?srch.nextSibling:root.firstChild)}
    var idw=rail.querySelector('.k25fd-idw'),isig=S.opsSelectedR7+'|'+txt(hero.querySelector('.r7-kicker'))+'|'+JSON.stringify((S.flightOverrides||{})[c.f.code+'_'+c.d]||{}).length+'|'+(z()?'z':'e');
    if(idw.getAttribute('data-sig')!==isig){idw.setAttribute('data-sig',isig);idw.innerHTML=idCard(c,hero)}
    var pills=root.querySelector(':scope > .r7-ops-tabs'),sw=rail.querySelector('.k25fd-sect');if(pills){sw.innerHTML='';sw.appendChild(pills)}
    sw.style.display=(sw.querySelector('.r7-ops-tabs')&&sw.querySelectorAll('.r7-ops-tabs button').length>1)?'':'none';
    var bar=rail.querySelector('.k25fd-tabs'),sig=have.map(function(g){return g[0]+':'+(cnt[g[0]]||'')}).join(',')+'|'+act+'|'+(z()?'z':'e');
    if(bar.getAttribute('data-sig')!==sig){bar.setAttribute('data-sig',sig);
      bar.innerHTML=have.map(function(g){var c2=cnt[g[0]];return '<button type="button" data-t="'+g[0]+'" class="'+(g[0]===act?'on':'')+(g[0]==='ci'&&+c2>0?' alert':'')+'"><s>'+g[3]+'</s><span>'+E(z()?g[2][0]:g[2][1])+'</span>'+(c2!==''&&c2!=null?'<i>'+E(c2)+'</i>':'')+'</button>'}).join('')}
    /* 總覽儀表板 */
    var kp=root.querySelector('.k25fd-kpis'),ksig=[S.opsSelectedR7,metric(hero,/PAX/),metric(hero,/BAGS/),cnt.sb,cnt.ci,txt(secs.meal).length,txt(secs.lb).length,txt(secs.bm).length,z()?'z':'e'].join('|');
    if(!kp||kp.getAttribute('data-sig')!==ksig){var tmp=document.createElement('div');tmp.innerHTML=kpis(c,hero,secs,cnt);var nk=tmp.firstChild;nk.setAttribute('data-sig',ksig);if(kp)kp.replaceWith(nk);else{var tp=root.querySelector('.r7-ops-top')||hero;tp.parentNode.insertBefore(nk,tp.nextSibling)}kp=nk}   /* 插在 r7-ops-top 外面（插在裡面會被 k23 當成天氣卡） */
    kp.classList.toggle('k25fd-hide',tabMode&&act!=='ov');
    /* 照片式路線圖 */
    if(secs.route&&!secs.route.classList.contains('k25fd-hide'))mapBox(secs.route,c);
    var kb=root.querySelector(':scope > .k22-bar');if(kb)kb.style.display=tabMode?'none':'';
  }catch(e){try{console.warn('fd25',e)}catch(_){}}}
  document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('.k25fd-tabs button[data-t],.k25fd-kpi[data-go]');if(!b)return;S.fdTabR1025B=b.getAttribute('data-t')||b.getAttribute('data-go');apply();
    try{var m=document.querySelector('.k25fd-main');if(m){var y=m.getBoundingClientRect().top+window.scrollY-12;if(window.scrollY>y)window.scrollTo({top:Math.max(0,y)})}}catch(_){}});
  setInterval(apply,500);
  try{var Q=false;new MutationObserver(function(){if(Q)return;if(!(S.view==='admin'&&S.adminTab==='flightdata'))return;Q=true;Promise.resolve().then(function(){Q=false;apply()})}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
  try{if(!document.getElementById('k25fd-css')){var cs=document.createElement('style');cs.id='k25fd-css';
    var M='#app main.k25fd-main';   /* 原本的航班卡樣式是 #app .p-admin-main …!important，要比它權重高 */
    cs.textContent='.k25fd-hide,main .k25fd-hide.k25fd-hide.r40-panel{display:none!important}'   /* 候補區塊（.r40-panel）原本有 display:block!important，要比它權重高 */
     /* 版面：上面一條作業列（固定在頂端）＋整頁寬內容；r7-admin 改成直排 flex（天氣卡可以排到路線圖後面） */
     +M+'{overflow:clip!important}'
     /* 作業列要黏在畫面頂端：body／#app 的 overflow-x:hidden 會讓 sticky 失效 → 只有這一頁改成 clip（不產生捲動容器，畫面一樣） */
     +'html.k25fd-on body,html.k25fd-on #app{overflow-x:clip!important;overflow-y:visible!important}'
     +M+' > .r7-admin{display:flex!important;flex-direction:column;align-items:stretch}'+M+' > .r7-admin > *{min-width:0}'
     +M+' .r7-ops-top{display:contents!important}'
     +M+'[data-k25t="ov"] [data-k23fd="wx"]{order:3}'+M+'[data-k25t="ov"] .k25fd-kpis{order:1}'+M+'[data-k25t="ov"] [data-k23fd="route"]{order:2}'
     +M+'.k25fd-tabm .k22-tg,'+M+' .k25fd-kpis > .k22-tg,'+M+' .r7-ops-hero > .k22-tg{display:none!important}'
     +M+' .r7-ops-card h3{font:700 15px/1.4 system-ui,sans-serif!important;color:#0F2A21!important;margin:0 0 10px!important}'+M+'.k25fd-tabm .k22-col{max-height:none!important;overflow:visible!important}'
     +M+' > .r7-admin > :first-child{margin-bottom:12px!important}'
     +M+' > .r7-admin > :first-child .r7-kicker{display:none}'+M+' > .r7-admin > :first-child h1{font-size:22px!important;margin:0!important}'
     +M+' > .r7-admin > .r7-ops-search{display:grid!important;grid-template-columns:minmax(0,1fr) 190px auto;gap:10px;align-items:end;padding:12px 14px!important;margin:0 0 14px!important;border:1px solid #E4E9E6!important;border-radius:14px!important;background:#F8FAF9!important;box-shadow:none!important}'
     +M+' > .r7-admin > .r7-ops-search label{font-size:11px!important;color:#66726C!important;margin:0!important}'+M+' > .r7-admin > .r7-ops-search .inp{height:38px!important;margin-top:4px!important;background:#fff!important}'
     +M+' > .r7-admin > .r7-ops-search .btn{height:38px!important;padding:0 18px!important}'
     /* 作業列 */
     +'.k25fd-band{position:sticky;top:60px;z-index:30;margin:0 0 16px;background:linear-gradient(135deg,#0A3528,#0F4A39 70%,#1A5A45);border-radius:16px;box-shadow:0 8px 24px rgba(11,61,46,.18);color:#fff;padding:14px 16px 10px}'
     +'.k25fd-band.k25fd-fix{position:fixed;top:0;border-radius:0 0 16px 16px}'
     +'.k25fd-bt{display:flex;align-items:center;gap:18px;flex-wrap:wrap}'
     +'.k25fd-idw{flex:1;min-width:0}'
     +'.k25fd-id{display:flex;align-items:center;gap:22px;flex-wrap:wrap}'
     +'.k25fd-id .cd small{display:block;font:700 9.5px/1 system-ui,sans-serif;letter-spacing:.16em;color:#E9C46A;text-transform:uppercase}'
     +'.k25fd-id .cd b{display:block;font:800 28px/1.1 ui-monospace,Menlo,monospace;letter-spacing:.02em;margin-top:4px;color:#fff}'
     +'.k25fd-id .rt{display:flex;align-items:center;gap:12px;padding-left:20px;border-left:1px solid rgba(255,255,255,.16)}.k25fd-id .rt span{display:flex;flex-direction:column;font:700 19px/1.1 ui-monospace,Menlo,monospace}.k25fd-id .rt i{font:500 11px/1.5 system-ui,sans-serif;font-style:normal;color:rgba(255,255,255,.7)}.k25fd-id .rt em{font-style:normal;color:#E9C46A;font-size:15px}'
     +'.k25fd-id dl{margin:0;display:flex;gap:20px;padding-left:20px;border-left:1px solid rgba(255,255,255,.16)}.k25fd-id dl div{min-width:0}.k25fd-id dt{font-size:10px;color:rgba(255,255,255,.6);letter-spacing:.08em}.k25fd-id dd{margin:3px 0 0;font:600 13px/1.3 ui-monospace,Menlo,monospace;color:#fff;white-space:nowrap}'
     +'.k25fd-id .k25fd-st{font-family:system-ui,sans-serif;font-size:11px;padding:2px 9px}'
     +'.k25fd-sect .r7-ops-tabs{display:flex!important;gap:6px;margin:0!important;padding:0!important;background:none!important;border:0!important}'
     +'.k25fd-sect .r7-ops-tabs button{margin:0!important;border-radius:999px!important;font-size:12px!important;padding:7px 12px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;border:1px solid rgba(255,255,255,.2)!important}'
     +'.k25fd-sect .r7-ops-tabs button b{color:inherit!important}.k25fd-sect .r7-ops-tabs button.on{background:#E9C46A!important;color:#0A3528!important;border-color:#E9C46A!important}'
     +'.k25fd-band .k25fd-tabs{display:flex;gap:2px;margin:12px -6px 0;padding:8px 6px 0;border-top:1px solid rgba(255,255,255,.12);overflow-x:auto;scrollbar-width:none}'
     +'.k25fd-tabs button{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border:0;border-radius:10px;background:transparent;color:rgba(255,255,255,.82);font:600 13px/1.2 inherit;font-family:inherit;cursor:pointer;white-space:nowrap}'
     +'.k25fd-tabs button s{text-decoration:none;font-size:12px;opacity:.75}'
     +'.k25fd-tabs button:hover{background:rgba(255,255,255,.08);color:#fff}.k25fd-tabs button.on{background:#fff;color:#0A3528}.k25fd-tabs button.on s{opacity:1;color:#9A7B2F}'
     +'.k25fd-tabs button i{font-style:normal;font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff}.k25fd-tabs button.on i{background:#E5F1EC;color:#0B3D2E}'
     +'.k25fd-tabs button.alert i{background:#F8E4DE;color:#B4472F}'
     /* 右欄：統一外框與標題 */
     +M+' .r7-ops-card,'+M+' > .r40-panel{background:#fff!important;border:1px solid #E4E9E6!important;border-radius:16px!important;box-shadow:0 1px 2px rgba(16,40,30,.04)!important;padding:20px 22px!important;margin:0 0 16px!important;color:#14231D}'
     +M+' .r7-ops-card .r7-kicker,'+M+' .r40-kick{font:700 10.5px/1.3 system-ui,sans-serif!important;letter-spacing:.14em!important;color:#9A7B2F!important;text-transform:uppercase;margin:0 0 4px!important}'
     +M+' .r7-ops-card h2,'+M+' > .r40-panel h2{font-size:19px!important;line-height:1.3!important;margin:0 0 6px!important;color:#0F2A21!important}'
     +M+' .r7-ops-card > p,'+M+' .r40-sub{font-size:12.5px!important;color:#66726C!important;margin:0 0 14px!important}'
     +'.k25fd-sechd{margin:0 0 12px}'
     /* 航班狀態列（原本深綠漸層大卡）：班號／航線／機型已在作業列 → 這裡只留表定、預估、旅客、行李、最終目的地 */
     +M+' .r7-ops-card.r7-ops-hero{background:#fff!important;color:#14231D!important;padding:4px 6px!important;margin:0 0 16px!important;box-shadow:0 1px 2px rgba(16,40,30,.04)!important}'
     +M+' .r7-ops-hero > .r7-kicker,'+M+' .r7-ops-hero > h2{display:none!important}'
     +M+' .r7-ops-hero .r7-metrics{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:0!important;margin:0!important}'
     +M+' .r7-ops-hero .r7-metric{background:transparent!important;border:0!important;border-left:1px solid #EDF0EE!important;border-radius:0!important;padding:12px 16px!important;min-width:0;box-shadow:none!important}'
     +M+' .r7-ops-hero .r7-metric:first-child{border-left:0!important}'
     +M+' .r7-ops-hero .r7-metric small{display:block;color:#7A8580!important;font-size:10px!important;letter-spacing:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:1!important}'
     +M+' .r7-ops-hero .r7-metric b{display:block;color:#0F2A21!important;font:700 15px/1.4 ui-monospace,Menlo,monospace!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px}'
     +M+' .r7-ops-hero .r7-metric b+small{font-size:10.5px!important;letter-spacing:0}'
     /* 儀表板 */
     +'.k25fd-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 16px}'
     +'.k25fd-kpi{display:flex;flex-direction:column;gap:3px;text-align:left;padding:14px 16px;border:1px solid #E4E9E6;border-radius:14px;background:#fff;cursor:pointer;font-family:inherit;color:#14231D;min-width:0;transition:border-color .15s,box-shadow .15s}'
     +'.k25fd-kpi:hover{border-color:#B9CBC2;box-shadow:0 4px 14px rgba(16,40,30,.07)}'
     +'.k25fd-kpi small{font-size:11px;font-weight:700;color:#66726C;letter-spacing:.04em}'
     +'.k25fd-kpi b{font:800 24px/1.15 ui-monospace,Menlo,monospace;color:#0B3D2E}.k25fd-kpi b em{font:600 13px system-ui,sans-serif;color:#7A8580;font-style:normal}'
     +'.k25fd-kpi>span{font-size:11.5px;color:#66726C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
     +'.k25fd-kpi .bar{display:block;position:relative;height:6px;border-radius:99px;background:#EDF1EF;margin-top:6px;overflow:hidden}.k25fd-kpi .bar u{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:#9CC5B3}.k25fd-kpi .bar u.b2{background:#0B3D2E}.k25fd-kpi .bar u:only-child{background:#0B3D2E}'
     +'.k25fd-kpi.alert{border-color:#EBC3B8;background:#FFF8F6}.k25fd-kpi.alert b{color:#B4472F}.k25fd-kpi.warn{border-color:#EED9A8;background:#FFFBF1}.k25fd-kpi.warn b{color:#8A5A12}'
     /* 路線圖 */
     +M+' .r7-route-card.k25has{padding:0!important;overflow:hidden}'+M+' .r7-route-card.k25has > svg{display:none!important}'
     +M+' .r7-route-card.k25has .r7-route-legend{padding:14px 22px 16px;margin:0!important}'+M+' .r7-route-card.k25has .k25map{margin:0 22px;border-radius:12px}'
     +'.k25map{position:relative;background:#081624;min-height:240px;overflow:hidden}'
     +'.k25map-img{display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .35s}.k25map.ready .k25map-img{opacity:1}.k25map.ready .k25map-ld{display:none}'
     +'.k25map-ld{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.55);font-size:12.5px}'
     +'.k25map-hd{padding:20px 22px 14px}.k25map-hd p{margin:0!important}'
     +'.k25map-lg{position:absolute;right:14px;top:14px;z-index:2;display:flex;gap:12px;padding:7px 12px;border-radius:10px;background:rgba(6,18,30,.62);color:#fff;font-size:11.5px;backdrop-filter:blur(4px)}'
     +'.k25map-lg .lg{display:inline-flex;align-items:center;gap:6px}.k25map-lg .lg:before{content:"";display:inline-block;width:18px;height:0;border-top:3px solid #F5C55B}.k25map-lg .gc:before{border-top:2px dashed rgba(255,255,255,.8)}.k25map-lg .zn:before{width:12px;height:10px;border:1px solid #ff8a80;background:repeating-linear-gradient(135deg,rgba(255,120,110,.6) 0 2px,rgba(205,40,40,.35) 2px 5px)}'
     +'.k25map-info{position:absolute;left:14px;bottom:12px;z-index:2;max-width:calc(100% - 28px);padding:7px 12px;border-radius:10px;background:rgba(6,18,30,.66);color:rgba(255,255,255,.92);font-size:12px;backdrop-filter:blur(4px)}.k25map-info b{color:#F5C55B!important}'
     /* 座位圖收在中間、不要拉滿 */
     +M+'[data-k25t="seat"] .r7-seatmap,'+M+' .r7-seatmap{overflow-x:auto}'
     +'@media(max-width:1100px){.k25fd-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.k25fd-id dl{padding-left:0;border-left:0;flex-wrap:wrap}'
       +M+' .r7-ops-hero .r7-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}}'
     /* 還沒開航班的畫面 */
     +'.k25fd-card{margin-top:14px;background:#fff;border:1px solid #E3E8E5;border-radius:16px;overflow:hidden}'
     +'.k25fd-card>header{display:flex;align-items:baseline;gap:12px;padding:14px 18px;border-bottom:1px solid #EEF2EF}.k25fd-card>header b{font-size:15px;color:#14231D}.k25fd-card>header span{font-size:12px;color:#66726C}'
     +'.k25fd-list{display:flex;flex-direction:column}'
     +'.k25fd-row{display:grid;grid-template-columns:78px 72px minmax(0,1fr) 64px 92px 74px 44px;align-items:center;gap:10px;width:100%;padding:11px 18px;border:0;border-bottom:1px solid #F1F4F2;background:#fff;text-align:left;font-family:inherit;font-size:13px;color:#14231D;cursor:pointer}'
     +'.k25fd-row:last-child{border-bottom:0}.k25fd-row:hover{background:#F6F9F7}.k25fd-row:hover u{color:#0B3D2E}'
     +'.k25fd-row time{font:700 14px ui-monospace,Menlo,monospace;color:#0B3D2E;display:flex;flex-direction:column;line-height:1.2}.k25fd-row time small{font:600 10.5px system-ui,sans-serif;color:#9A7B2F}'
     +'.k25fd-row b{font:700 13px ui-monospace,Menlo,monospace;letter-spacing:.04em}.k25fd-row span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#3d4944}'
     +'.k25fd-row em{font-style:normal;font-size:12px;color:#66726C;font-family:ui-monospace,Menlo,monospace}.k25fd-row small{font-size:12px;color:#66726C}'
     +'.k25fd-row u{text-decoration:none;font-size:12px;font-weight:700;color:#5E6B65;text-align:right}'
     +'.k25fd-st{font-style:normal;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;text-align:center}.k25fd-st.ok{background:#E5F1EC;color:#0B493B}.k25fd-st.warn{background:#FFF3DC;color:#8A5A12}.k25fd-st.bad{background:#F8E4DE;color:#B4472F}.k25fd-st.mut{background:#EEF1EF;color:#66726C}'
     +'.k25fd-none{padding:16px 18px;margin:0;color:#66726C;font-size:13px}'
     +'.k25fd-empty .k22-bar{display:none!important}'
     +'@media(max-width:760px){.k25fd-row{grid-template-columns:62px 60px minmax(0,1fr) 70px}.k25fd-row em,.k25fd-row small,.k25fd-row u{display:none}}';
    document.head.appendChild(cs)}}catch(_){}
})();
