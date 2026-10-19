/* 1019A：航班動態主頁 —— 台北桃園（TPE）客機起飛／抵達看板（使用者：「航班動態要可以看到TPE即將抵達或出發的航班 像是這種General的 …
   然後搜尋的那個一樣保留只是多一個這種航班動態主頁」）。原本的「依航線」「依航班號」照舊，多一個「機場看板」分頁，進航班動態預設就是它。
   · 列出在桃園起降、跟 KGM 有關的航班：KGM 自營（含掛夥伴代碼的）＋夥伴營運、掛 KX 代碼的聯營航班。其他航空公司自己的航班網站裡沒有資料，不列。
   · 每一格都讀現有的唯一來源：時刻＝季節班表（kgmSeasonFlightR48），實際時間／狀態＝S.flightOverrides＋autoStatus（跟「依航線」同一套），
     登機門＝kgmGateOfR26（停機位分配），報到櫃檯／航廈／報到時間＝kgmCounterOfFlightR929。
   · 抵達的登機門：系統只排出發的停機位；抵達的飛機接著飛它在桃園的下一班（同一家、飛回出發地的那一班），停的就是那一班的登機門。
   · 聯營代碼（使用者：「KGM的航班有些也可以有聯營代碼喔！！…我們有對方的聯營 對方就要有我們的聯營 不用全部但是一些」）：
     夥伴營運的航班本來就掛 KX 代碼；這裡給一部分 KGM 自營航班掛上夥伴代碼（MKT19），看板疊列，「依航班號」也查得到。 */
(function(){
  var MKT19={   /* 承運：KX 班號 → 掛哪一家（代碼＝夥伴前綴＋固定區段＋KX 號碼） */
    'Etihad Airways':{pre:'EY',base:8000,kx:[66,65]},
    'Cathay Pacific':{pre:'CX',base:5000,kx:[350,349,354,353,358,357,362,361]},
    'Qantas':{pre:'QF',base:3000,kx:[52,51,54,53,58,57,56,55]},
    'Japan Airlines':{pre:'JL',base:5000,kx:[180,179,184,183,168,167,126,125,130,129,152,151,170,169,194,193,140,139]},
    'American Airlines':{pre:'AA',base:8000,kx:[4,3,14,13,48,47,36,35,10,9,38,37]},
    'Alaska Airlines':{pre:'AS',base:7000,kx:[24,23]},
    'Iberia':{pre:'IB',base:7000,kx:[84,83,92,91]},
    'Finnair':{pre:'AY',base:5000,kx:[98,97]},
    'Malaysia Airlines':{pre:'MH',base:9000,kx:[220,219,206,205]}
  };
  var ZH19={'KGM':'KGM Airways','Japan Airlines':'日本航空','Cathay Pacific':'國泰航空','Qantas':'澳洲航空','American Airlines':'美國航空','Alaska Airlines':'阿拉斯加航空',
    'Etihad Airways':'阿提哈德航空','Iberia':'伊比利亞航空','Finnair':'芬蘭航空','Malaysia Airlines':'馬來西亞航空','British Airways':'英國航空','Qatar Airways':'卡達航空'};
  var BYKX19={},BYMKT19={};
  Object.keys(MKT19).forEach(function(al){var m=MKT19[al];m.kx.forEach(function(n){var c=m.pre+(m.base+n),k='KX'+n;(BYKX19[k]=BYKX19[k]||[]).push({al:al,code:c});BYMKT19[c]=k})});
  window.KGM_MKT_R1019A=MKT19;
  /* KGM 自營航班掛的夥伴代碼 */
  window.kgmMktCodesR1019A=function(code){return (BYKX19[String(code||'').toUpperCase()]||[]).slice()};
  /* 夥伴代碼／夥伴營運班號 → KX 班號（查詢用） */
  window.kgmMktToKxR1019A=function(q){q=String(q||'').toUpperCase().replace(/\s+/g,'');if(!q)return '';if(BYMKT19[q])return BYMKT19[q];
    try{var hit=[].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&f.partner&&String(f.operatorFlight||'').toUpperCase()===q})[0];if(hit)return hit.code}catch(_){}return ''};
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function hm(v){v=((v%1440)+1440)%1440;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
  function nm(al){return z()?(ZH19[al]||al):(al==='KGM'?'KGM Airways':al)}
  function logo(al){var src='';try{src=al==='KGM'?(window.KGM_LOGO_R1019A||''):((window.KGM_PARTNER_LOGO_R1006A||{})[al]||'')}catch(_){}
    return '<span class="fb19-lg">'+(src?'<img src="'+src+'" alt="">':'<b>'+E(al==='KGM'?'KX':String(al).slice(0,2))+'</b>')+'</span>'}
  function city(a){try{return CITY(a)}catch(_){return a}}
  function nowTpe(){var d=new Date(Date.now()+8*3600000);return {date:d.toISOString().slice(0,10),min:d.getUTCHours()*60+d.getUTCMinutes()}}
  function ep(date,min){var q=String(date).split('-');return Date.UTC(+q[0],+q[1]-1,+q[2])+(min-480)*60000}   /* 桃園當地時間 → 絕對時間 */
  function allF(){try{return [].concat(FLIGHTS,S.customFlights||[]).filter(Boolean)}catch(_){return []}}
  function sea(f,d){try{return window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,d):f}catch(_){return f}}
  function flies(f,d){try{return flyOn(f,new Date(d+'T00:00:00'))}catch(_){return false}}
  function ovOf(f,d){try{return (S.flightOverrides||{})[_ovKey(f,d)]||{}}catch(_){return {}}}
  /* 一天在桃園的出發（dir='dep'）或抵達（dir='arr'）列：date＝看板日期（桃園當地） */
  var CACHE19={};
  function rows19(dir,date){
    var key=dir+'|'+date+'|'+(S.customFlights||[]).length+'|'+Object.keys(S.flightOverrides||{}).length+'|'+Math.floor(Date.now()/60000);
    if(CACHE19[key])return CACHE19[key];
    var A=allF(),out=[],seen={};
    A.forEach(function(f0){
      if(f0.via)return;
      if(dir==='dep'?f0.fr!=='TPE':f0.to!=='TPE')return;
      var cands=dir==='dep'?[date]:[date,addDays(date,-1),addDays(date,-2)];
      cands.forEach(function(dd0){
        if(!flies(f0,dd0))return;var f=sea(f0,dd0)||f0;
        var dd=+f.dd||0;if(dir==='arr'&&addDays(dd0,dd)!==date)return;
        var ov=ovOf(f,dd0),sch=dir==='dep'?f.dep:f.arr,act=dir==='dep'?(ov.dep||f.dep):(ov.arr||f.arr);
        var k=(f.partner?(f.operatorFlight||f.code):f.code)+'|'+f.fr+'|'+f.to+'|'+sch;
        var codes=f.partner?[{al:'KGM',code:f.code}]:window.kgmMktCodesR1019A(f.code);
        if(seen[k]){codes.forEach(function(c){if(!seen[k].codes.some(function(x){return x.code===c.code}))seen[k].codes.push(c)});return}
        /* 經停：出發看終點、抵達看起點（同一班號的整段列，當天有飛的那一個版本） */
        var via=null;A.forEach(function(V){if(via||!V.via||V.code!==f.code||V.partner)return;
          if(dir==='dep'&&V.fr==='TPE'&&V.via===f.to&&flies(V,dd0))via=V.to;
          if(dir==='arr'&&V.to==='TPE'&&V.via===f.fr&&flies(V,dd0))via=V.fr});
        var r={f:f,d:dd0,dir:dir,al:f.partner?f.operator:'KGM',code:f.partner?(f.operatorFlight||f.code):f.code,codes:codes,ov:ov,
          sch:sch,act:act,schMin:mn(sch),other:dir==='dep'?f.to:f.fr,via:via};
        seen[k]=r;out.push(r);
      });
    });
    out.sort(function(a,b){return a.schMin-b.schMin||String(a.code).localeCompare(String(b.code))});
    if(Object.keys(CACHE19).length>12)CACHE19={};CACHE19[key]=out;return out;
  }
  window.kgmTpeBoardRowsR1019A=rows19;
  function gateOf(code,d){try{var g=window.kgmGateOfR26?window.kgmGateOfR26(code,d):null;if(g&&g.gate)return {gate:g.gate,term:g.terminal||''}}catch(_){}return {gate:'',term:''}}
  function ctrOf(code,d){try{return window.kgmCounterOfFlightR929?window.kgmCounterOfFlightR929(code,d,'TPE'):null}catch(_){return null}}
  /* 抵達：飛機接著飛的那一班（同一家、桃園出發、飛回起點；沒有就同一家下一班），讀那一班的登機門 */
  function nextDep(r){
    var arrEp=ep(addDays(r.d,+r.f.dd||0),mn(r.act)),best=null,best2=null;
    [addDays(r.d,+r.f.dd||0),addDays(r.d,(+r.f.dd||0)+1)].forEach(function(d){
      rows19('dep',d).forEach(function(x){if(x.al!==r.al)return;var e=ep(d,mn(x.act));if(e<arrEp+60*60000||e>arrEp+30*3600000)return;
        if(x.other===r.other&&(!best||e<best.e))best={x:x,e:e};if(!best2||e<best2.e)best2={x:x,e:e}});
    });
    var b=best||best2;return b?b.x:null;
  }
  var ST19={dep:{'Departed':['已飛','Departed','done'],'Arrived':['已飛','Departed','done'],'Cancelled':['取消','Cancelled','bad'],'Delayed':['延誤','Delayed','warn'],
              'Diverted':['轉降','Diverted','bad'],'Time Change':['時間更改','Time change','warn']},
            arr:{'Arrived':['已抵達','Arrived','done'],'Departed':['飛行中','In flight','air'],'Cancelled':['取消','Cancelled','bad'],'Delayed':['延誤','Delayed','warn'],
              'Diverted':['轉降','Diverted','bad'],'Time Change':['時間更改','Time change','warn']}};
  function status(r,ctr){
    var s='';try{s=autoStatus(r.f,r.d,r.ov)}catch(_){s=''}
    var m=ST19[r.dir][s],now=Date.now();
    if(m){var t=m.slice();if(s==='Diverted'&&r.ov.divertTo)t[0]+=' '+r.ov.divertTo,t[1]+=' '+r.ov.divertTo;return t}
    if(r.dir==='dep'){var de=ep(r.d,mn(r.act));
      if(s==='Boarding')return now>=de-10*60000?['登機結束','Gate closed','warn']:['登機中','Boarding','board'];
      /* 櫃檯的關櫃時間是整個櫃檯時段結束（同櫃幾班一起），可能比這一班起飛還晚 → 這一班報到截止＝起飛前 60 分（櫃檯更早關就照櫃檯） */
      if(ctr&&ctr.open){var o=ep(r.d,mn(ctr.open));if(o>de)o-=864e5;var c=de-60*60000;if(ctr.close){var c2=ep(r.d,mn(ctr.close));if(c2<o)c2+=864e5;if(c2<c)c=c2}
        if(now>=o&&now<c)return ['報到中','Check-in','chk'];if(now>=c&&now<de)return ['報到截止','Check-in closed','warn']}
      return ['準時','On time','ok']}
    return ['準時','On time','ok'];
  }
  function belt(r,term){var h=0,s=r.code+'|'+r.d;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return String(1+h%(term==='T1'?6:7))}   /* 行李轉盤：T1 1–6、T2 1–7 */
  function cell(r){
    var ctr=r.dir==='dep'?ctrOf(r.f.code,r.d):null,g={gate:'',term:''},nx=null;
    if(r.dir==='dep')g=gateOf(r.f.code,r.d);else{nx=nextDep(r);if(nx)g=gateOf(nx.f.code,nx.d)}
    var term=(ctr&&ctr.term&&ctr.term!=='—'?ctr.term:'')||g.term||'';
    return {ctr:ctr,gate:g.gate,term:term,nx:nx,st:status(r,ctr)};
  }
  function filters(){var q=S.fb19||(S.fb19={});var n=nowTpe();
    if(!q.dir)q.dir='dep';if(!q.date)q.date=n.date;if(q.slot==null)q.slot=Math.floor(n.min/120);if(!q.term)q.term='all';if(q.q==null)q.q='';return q}
  window.kgmFbSetR1019A=function(k,v){var q=filters();q[k]=(k==='slot')?(v==='all'?'all':+v):v;if(k==='dir'||k==='date')S.fb19Open=null;try{render()}catch(_){}};
  window.kgmFbOpenR1019A=function(k){S.fb19Open=S.fb19Open===k?null:k;try{render()}catch(_){}};
  function match(r,c,qq){if(!qq)return true;qq=qq.toUpperCase();
    var hay=[r.code,r.other,r.via||'',city(r.other),r.via?city(r.via):'',nm(r.al),r.al].concat(r.codes.map(function(x){return x.code+' '+nm(x.al)+' '+x.al})).join(' ').toUpperCase();
    return hay.indexOf(qq)>=0||hay.replace(/\s+/g,'').indexOf(qq.replace(/\s+/g,''))>=0}
  /* 看板本體（1019A 第二版：使用者「太醜了吧天啊」→ 一班一列、點整列展開、聯營代碼放在班號下面小字、狀態用色塊、手機改卡片） */
  var IC19={dep:'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M2.5 19h19v2h-19zM22.07 9.64c-.21-.8-1.04-1.28-1.84-1.06L14.92 10 8 3.57l-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/></svg>',
    arr:'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M2.5 19h19v2h-19zM9.68 13.27l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.6.43 5.31 1.43z"/></svg>',
    q:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    rf:'<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 4v7h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ch:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
  function board(){
    var q=filters(),Z=z(),n=nowTpe(),rows=rows19(q.dir,q.date),qq=String(q.q||'').trim(),D=q.dir==='dep';
    var list=rows.filter(function(r){return qq||q.slot==='all'||Math.floor(r.schMin/120)===q.slot});
    var built=list.map(function(r){return {r:r,c:cell(r)}}).filter(function(x){return (q.term==='all'||x.c.term===q.term)&&match(x.r,x.c,qq)});
    var wk=Z?['日','一','二','三','四','五','六']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var dates=[-1,0,1].map(function(o){var d=addDays(n.date,o),dt=new Date(d+'T00:00:00');return '<option value="'+d+'"'+(d===q.date?' selected':'')+'>'+d.replace(/-/g,'/')+'（'+wk[dt.getDay()]+'）'+(o===0?(Z?' 今天':' Today'):'')+'</option>'}).join('');
    var slots='<option value="all"'+(q.slot==='all'?' selected':'')+'>'+(Z?'全天':'All day')+'</option>'+Array.apply(null,{length:12}).map(function(_,i){return '<option value="'+i+'"'+(q.slot===i?' selected':'')+'>'+hm(i*120)+' – '+hm(i*120+119)+'</option>'}).join('');
    var H=[Z?'時間':'Time',D?(Z?'目的地':'Destination'):(Z?'出發地':'Origin'),Z?'航空公司':'Airline',Z?'航班':'Flight',Z?'航廈':'Terminal',Z?'登機門':'Gate',D?(Z?'報到櫃檯':'Check-in'):(Z?'行李轉盤':'Baggage'),Z?'狀態':'Status',''];
    var body=built.map(function(x){var r=x.r,c=x.c,k=r.dir+'|'+r.code+'|'+r.d+'|'+r.sch,op=S.fb19Open===k,chg=r.act!==r.sch;
      var place='<b>'+E(city(r.other))+'</b><span class="fb19-iata">'+E(r.other)+'</span>'+(r.via?'<small>'+(D?(Z?'續飛 ':'continuing to ')+E(city(r.via)):(Z?'自 ':'from ')+E(city(r.via)))+'</small>':'');
      var cs=r.codes.map(function(l){var src='';try{src=l.al==='KGM'?(window.KGM_LOGO_R1019A||''):((window.KGM_PARTNER_LOGO_R1006A||{})[l.al]||'')}catch(_){}
        return '<span class="fb19-cs" title="'+E(nm(l.al))+'">'+(src?'<img src="'+src+'" alt="">':'')+E(l.code)+'</span>'}).join('');
      var oth=D?((c.ctr&&c.ctr.counter&&c.ctr.counter!=='—')?c.ctr.counter:''):(c.term?belt(r,c.term):'');
      var tr='<tr class="fb19-r'+(op?' on':'')+'" onclick="kgmFbOpenR1019A(\''+E(k)+'\')">'
        +'<td class="fb19-t">'+(chg?'<s>'+E(r.sch)+'</s><b class="chg">'+E(r.act)+'</b>':'<b>'+E(r.sch)+'</b>')+'</td>'
        +'<td class="fb19-c">'+place+'</td>'
        +'<td class="fb19-a">'+logo(r.al)+'<span>'+E(nm(r.al))+'</span></td>'
        +'<td class="fb19-fl"><b>'+E(r.code)+'</b>'+(cs?'<div class="fb19-cl">'+cs+'</div>':'')+'</td>'
        +'<td class="fb19-x" data-l="'+(Z?'航廈':'Terminal')+'">'+(c.term?'<span class="fb19-tm">'+E(c.term)+'</span>':'—')+'</td>'
        +'<td class="fb19-x" data-l="'+(Z?'登機門':'Gate')+'">'+E(c.gate||'—')+'</td>'
        +'<td class="fb19-x" data-l="'+(D?(Z?'櫃檯':'Check-in'):(Z?'轉盤':'Belt'))+'">'+E(oth||'—')+'</td>'
        +'<td class="fb19-s"><span class="fb19-st '+c.st[2]+'">'+E(Z?c.st[0]:c.st[1])+'</span></td>'
        +'<td class="fb19-v">'+IC19.ch+'</td></tr>';
      if(op){var f=r.f,ty='';try{ty=acftNameOf(f,r.d)}catch(_){ty=f.acft||''}
        var it=function(a,b){return '<div><span>'+a+'</span><b>'+b+'</b></div>'};
        tr+='<tr class="fb19-det"><td colspan="9"><div class="fb19-dg">'
          +it(Z?'航線':'Route',E(city(f.fr))+' '+E(f.fr)+'　→　'+E(city(f.to))+' '+E(f.to))
          +it(Z?'表訂（當地時間）':'Scheduled (local)',E(f.dep)+' → '+E(f.arr)+((+f.dd||0)?'<sup>+'+(+f.dd)+'</sup>':''))
          +it(Z?'飛行時間':'Duration',E(f.durStr||'—'))
          +it(Z?'機型':'Aircraft',E(ty||'—'))
          +it(Z?'營運航空':'Operated by',E(nm(r.al))+'　'+E(r.code))
          +(r.codes.length?it(Z?'共用班號':'Codeshare',r.codes.map(function(l){return E(l.code)+'（'+E(nm(l.al))+'）'}).join('、')):'')
          +(D&&c.ctr&&c.ctr.open?it(Z?'報到櫃檯開放':'Check-in',E(c.ctr.open)+' – '+E(c.ctr.close)):'')
          +(D?it(Z?'開始登機':'Boarding',hm(mn(r.act)-30)):'')
          +(!D&&c.nx?it(Z?'接續航班（同一架飛機）':'Next flight (same aircraft)',E(c.nx.code)+'　'+E(c.nx.act)+' → '+E(city(c.nx.other))):'')
          +'</div></td></tr>';
      }
      return tr;
    }).join('');
    if(!built.length)body='<tr><td colspan="9" class="fb19-none">'+(qq?(Z?'找不到符合「'+E(qq)+'」的航班。':'No flights match “'+E(qq)+'”.'):(Z?'這個時段沒有航班。':'No flights in this period.'))+'</td></tr>';
    return '<div class="fb19">'
      +'<div class="fb19-top"><div class="fb19-seg">'
        +'<button class="'+(D?'on':'')+'" onclick="kgmFbSetR1019A(\'dir\',\'dep\')">'+IC19.dep+(Z?'出發':'Departures')+'</button>'
        +'<button class="'+(!D?'on':'')+'" onclick="kgmFbSetR1019A(\'dir\',\'arr\')">'+IC19.arr+(Z?'抵達':'Arrivals')+'</button></div>'
        +'<div class="fb19-ap"><b>'+(Z?'台北桃園國際機場':'Taipei Taoyuan International')+'</b><span>TPE</span></div></div>'
      +'<div class="fb19-f">'
        +'<label><span>'+(Z?'日期':'Date')+'</span><select onchange="kgmFbSetR1019A(\'date\',this.value)">'+dates+'</select></label>'
        +'<label><span>'+(Z?'時間':'Time')+'</span><select onchange="kgmFbSetR1019A(\'slot\',this.value)">'+slots+'</select></label>'
        +'<label><span>'+(Z?'航廈':'Terminal')+'</span><select onchange="kgmFbSetR1019A(\'term\',this.value)"><option value="all"'+(q.term==='all'?' selected':'')+'>'+(Z?'所有航廈':'All terminals')+'</option><option value="T1"'+(q.term==='T1'?' selected':'')+'>'+(Z?'第一航廈':'Terminal 1')+'</option><option value="T2"'+(q.term==='T2'?' selected':'')+'>'+(Z?'第二航廈':'Terminal 2')+'</option></select></label>'
        +'<label class="fb19-qq"><span>'+(Z?'搜尋':'Search')+'</span><div>'+IC19.q+'<input placeholder="'+(Z?'航班編號／航空公司／城市':'Flight, airline or city')+'" value="'+E(q.q)+'" onkeydown="if(event.key===\'Enter\')kgmFbSetR1019A(\'q\',this.value)" onchange="kgmFbSetR1019A(\'q\',this.value)"></div></label>'
      +'</div>'
      +'<div class="fb19-meta"><span>'+(Z?'共 ':'')+built.length+(Z?' 班':' flights')+(qq?(Z?'（搜尋全天）':' (whole day)'):'')+(Z?'　·　時間為桃園當地時間':' · local time')+'</span>'
        +'<button onclick="CACHE19R1019A();render()">'+IC19.rf+(Z?'更新於 ':'Updated ')+hm(n.min)+'</button></div>'
      +'<div class="fb19-w"><table><thead><tr>'+H.map(function(h,i){return '<th class="h'+i+'">'+h+'</th>'}).join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>'
      +'<p class="fb19-n">'+(Z?'列出在桃園機場起降、由 KGM 營運或掛 KGM（KX）代碼的聯營航班。點一下航班看詳細資料。':'KGM-operated and KX-codeshare flights at Taipei Taoyuan. Tap a flight for details.')+'</p>'
    +'</div>';
  }
  window.CACHE19R1019A=function(){CACHE19={}};
  var CSS19='<style id="fb19-css">'
    +'.fb19{--fbg:#0f3d34;--fln:#e6ece9;--fsub:#6b7b74;color:#1d2a25}'
    +'.fb19-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:6px 0 18px}'
    +'.fb19-seg{display:inline-flex;background:#eef2f0;border-radius:999px;padding:4px}'
    +'.fb19-seg button{display:inline-flex;align-items:center;gap:8px;border:0;background:none;padding:9px 20px;border-radius:999px;font:inherit;font-size:14.5px;font-weight:800;color:#5d6b65;cursor:pointer;transition:background .15s,color .15s}'
    +'.fb19-seg button.on{background:var(--fbg);color:#fff;box-shadow:0 1px 3px rgba(15,61,52,.25)}'
    +'.fb19-ap{display:flex;align-items:baseline;gap:8px}.fb19-ap b{font-size:13px;color:#33413b}.fb19-ap span{font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;color:var(--fsub);border:1px solid var(--fln);border-radius:6px;padding:4px 6px}'
    +'.fb19-f{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) minmax(0,1.5fr);gap:12px}'
    +'.fb19-f label{display:flex;flex-direction:column;gap:6px;min-width:0}.fb19-f label>span{font-size:11px;font-weight:800;letter-spacing:.06em;color:var(--fsub)}'
    +'.fb19-f select,.fb19-f input{width:100%;box-sizing:border-box;height:42px;border:1px solid #dbe3df;border-radius:10px;background:#fff;padding:0 12px;font:inherit;font-size:14px;color:#1d2a25;outline:none}'
    +'.fb19-f select{appearance:none;-webkit-appearance:none;padding-right:34px;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M6 9l6 6 6-6%27 fill=%27none%27 stroke=%27%236b7b74%27 stroke-width=%272.5%27 stroke-linecap=%27round%27/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;cursor:pointer}'
    +'.fb19-f select:focus,.fb19-f input:focus{border-color:var(--fbg);box-shadow:0 0 0 3px rgba(15,61,52,.1)}'
    +'.fb19-qq div{position:relative}.fb19-qq svg{position:absolute;left:12px;top:13px;color:#8a978f}.fb19-qq input{padding-left:36px}'
    +'.fb19-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px;color:var(--fsub);margin:16px 2px 10px}'
    +'.fb19-meta button{display:inline-flex;align-items:center;gap:6px;border:0;background:none;font:inherit;font-size:12px;color:var(--fsub);cursor:pointer;padding:0}.fb19-meta button:hover{color:var(--fbg)}'
    +'.fb19-w{border:1px solid var(--fln);border-radius:14px;overflow:hidden;background:#fff}'
    +'.fb19 table{width:100%;border-collapse:collapse;font-size:14px}'
    +'.fb19 thead th{background:#f5f8f6;color:#5d6b65;text-align:left;font-size:11.5px;font-weight:800;letter-spacing:.05em;padding:12px 14px;border-bottom:1px solid var(--fln);white-space:nowrap}'
    +'.fb19 th.h0{width:84px}.fb19 th.h2{width:190px}.fb19 th.h3{width:120px}.fb19 th.h4,.fb19 th.h5{width:76px}.fb19 th.h6{width:84px}.fb19 th.h7{width:104px}.fb19 th.h8{width:34px}'
    +'.fb19-r td{padding:14px;border-top:1px solid #eef2f0;vertical-align:middle}.fb19 tbody tr:first-child td{border-top:0}'
    +'.fb19-r{cursor:pointer;transition:background .12s}.fb19-r:hover{background:#f8fbf9}.fb19-r.on{background:#f3f8f5}'
    +'.fb19-t b{display:block;font-size:17px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.01em}.fb19-t b.chg{color:#b45309}.fb19-t s{display:block;font-size:12px;color:#a3aea9;font-variant-numeric:tabular-nums}'
    +'.fb19-c b{font-size:14.5px;font-weight:700}.fb19-iata{margin-left:7px;font:700 11px/1 ui-monospace,Menlo,monospace;color:#8a978f;letter-spacing:.06em}.fb19-c small{display:block;font-size:11.5px;color:var(--fsub);margin-top:3px}'
    +'.fb19-a{white-space:nowrap}.fb19-a>span{font-size:13px;color:#33413b;vertical-align:middle}'
    +'.fb19-lg{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--fln);border-radius:9px;background:#fff;overflow:hidden;vertical-align:middle;margin-right:10px}'
    +'.fb19-lg img{max-width:28px;max-height:24px;object-fit:contain}.fb19-lg b{font-size:10px;color:var(--fbg)}'
    +'.fb19-fl b{font-size:14.5px;font-weight:800;font-variant-numeric:tabular-nums}'
    +'.fb19-cl{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:4px}.fb19-cs{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--fsub);font-variant-numeric:tabular-nums}.fb19-cs img{width:14px;height:14px;object-fit:contain;border-radius:3px}'
    +'.fb19-x{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;color:#33413b}'
    +'.fb19-tm{display:inline-block;font-size:12px;font-weight:800;color:var(--fbg);background:#e9f1ed;border-radius:6px;padding:3px 8px}'
    +'.fb19-st{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;border-radius:999px;padding:5px 11px;white-space:nowrap}'
    +'.fb19-st::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}'
    +'.fb19-st.done{background:#eff1f0;color:#5d6862}.fb19-st.ok{background:#e5f4ea;color:#14713c}.fb19-st.chk{background:#e8f0fd;color:#1d4fc4}.fb19-st.board{background:#f1eafd;color:#6b2bd1}'
    +'.fb19-st.warn{background:#fdf2e1;color:#a2560a}.fb19-st.bad{background:#fde8e8;color:#b42318}.fb19-st.air{background:#e8f0fd;color:#1d4fc4}'
    +'.fb19-v{color:#a3aea9;text-align:right}.fb19-v svg{transition:transform .15s;vertical-align:middle}.fb19-r.on .fb19-v svg{transform:rotate(180deg);color:var(--fbg)}'
    +'.fb19-det td{background:#f3f8f5;padding:4px 18px 18px 98px;border-top:0}'
    +'.fb19-dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px 22px}.fb19-dg div{display:flex;flex-direction:column;gap:3px}.fb19-dg span{font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--fsub)}.fb19-dg b{font-size:13.5px;font-weight:700;color:#1d2a25}'
    +'.fb19-none{text-align:center;color:var(--fsub);padding:40px 12px!important;cursor:default}'
    +'.fb19-n{font-size:11.5px;color:var(--fsub);margin:12px 2px 0}'
    +'.fb19-st2{display:flex;gap:6px;margin-bottom:16px}'
    +'@media (max-width:820px){.fb19-f{grid-template-columns:1fr 1fr}.fb19-qq{grid-column:1/-1}.fb19 thead{display:none}'
      +'.fb19 table,.fb19 tbody{display:block}.fb19-r{display:flex;flex-wrap:wrap;align-items:flex-start;padding:14px 14px 12px;border-top:1px solid #eef2f0}.fb19 tbody tr:first-child{border-top:0}'
      +'.fb19-r td{display:block;padding:0;border:0}.fb19-t{width:62px;flex:0 0 62px;order:0}.fb19-c{flex:1;min-width:0;order:1}.fb19-s{flex:0 0 auto;order:2;margin-left:8px}.fb19-fl{order:3}.fb19-x{order:4}.fb19-a{display:none!important}.fb19-v{display:none!important}'
      +'.fb19-fl{flex:0 0 100%;padding:8px 0 0 62px!important}.fb19-x{flex:0 0 auto;padding:8px 16px 0 0!important;font-size:13px}'
      +'.fb19-r td.fb19-x:nth-of-type(5){margin-left:62px}.fb19-x::before{content:attr(data-l);display:block;font-size:10.5px;font-weight:700;color:var(--fsub);margin-bottom:2px}'
      +'.fb19-det{display:block}.fb19-det td{display:block;padding:12px 14px 16px}.fb19-dg{grid-template-columns:1fr 1fr}'
      +'.fb19-seg{width:100%}.fb19-seg button{flex:1;justify-content:center}}'
    +'</style>';
  /* 航班動態：多一個「機場看板」分頁（預設），原本兩個分頁照舊 */
  if(typeof statusView==='function'&&!statusView.__fb19){
    var st19=statusView;
    statusView=function(){
      var Z=z();
      if(S.stBoardR1019A!==false){
        return CSS19+'<div style="max-width:1100px;margin:0 auto;padding:20px">'
          +'<h1 style="font-family:Georgia,serif;font-size:20px;color:var(--g);margin-bottom:14px">'+(Z?'航班到離動態':'Flight Status')+'</h1>'
          +'<div class="card" style="margin-bottom:12px"><div class="fb19-st2">'
            +'<button class="btn btn-sm btn-g" onclick="S.stBoardR1019A=true;render()">'+(Z?'機場看板':'Airport board')+'</button>'
            +'<button class="btn btn-sm" onclick="S.stBoardR1019A=false;S.stByNo=false;S.stFlightNo=\'\';render()">'+(Z?'依航線':'By Route')+'</button>'
            +'<button class="btn btn-sm" onclick="S.stBoardR1019A=false;S.stByNo=true;render()">'+(Z?'依航班號':'By Flight No.')+'</button></div>'
          +board()+'</div></div>';
      }
      /* 依航班號：夥伴代碼（JL5180）、夥伴營運班號（JL802）也查得到 —— 換成 KX 班號查同一班 */
      var q0=S.stFlightNo,kx=S.stByNo?window.kgmMktToKxR1019A(q0):'',h='';
      if(kx){S.stFlightNo=kx;try{h=String(st19.apply(this,arguments))}finally{S.stFlightNo=q0}h=h.replace('value="'+kx+'"','value="'+E(q0)+'"')}else h=String(st19.apply(this,arguments));   /* 輸入框留使用者打的代碼 */
      return h.replace('onclick="S.stByNo=false;S.stFlightNo=\'\';render()"','onclick="S.stBoardR1019A=false;S.stByNo=false;S.stFlightNo=\'\';render()"')
        .replace('onclick="S.stByNo=true;render()"','onclick="S.stBoardR1019A=false;S.stByNo=true;render()"')
        .replace(/(<button class="btn btn-sm[^"]*" onclick="S\.stBoardR1019A=false;S\.stByNo=false;)/,'<button class="btn btn-sm" onclick="S.stBoardR1019A=true;render()">'+(Z?'機場看板':'Airport board')+'</button>\n        $1');
    };
    statusView.__fb19=1;
  }
})();
