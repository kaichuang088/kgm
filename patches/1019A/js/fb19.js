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
      if(ctr&&ctr.open&&ctr.close){var o=ep(r.d,mn(ctr.open)),c=ep(r.d,mn(ctr.close));if(o>de)o-=864e5;if(c>de)c-=864e5;if(now>=o&&now<c)return ['報到中','Check-in','board']}
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
  function board(){
    var q=filters(),Z=z(),n=nowTpe(),rows=rows19(q.dir,q.date),qq=String(q.q||'').trim();
    var list=rows.filter(function(r){return qq||q.slot==='all'||Math.floor(r.schMin/120)===q.slot});
    var built=list.map(function(r){return {r:r,c:cell(r)}}).filter(function(x){return (q.term==='all'||x.c.term===q.term)&&match(x.r,x.c,qq)});
    var dates=[-1,0,1].map(function(o){var d=addDays(n.date,o),dt=new Date(d+'T00:00:00');return '<option value="'+d+'"'+(d===q.date?' selected':'')+'>'+d.replace(/-/g,'/')+(Z?'（'+['日','一','二','三','四','五','六'][dt.getDay()]+'）':'')+'</option>'}).join('');
    var slots='<option value="all"'+(q.slot==='all'?' selected':'')+'>'+(Z?'全天':'All day')+'</option>'+Array.apply(null,{length:12}).map(function(_,i){return '<option value="'+i+'"'+(q.slot===i?' selected':'')+'>'+hm(i*120)+' ~ '+hm(i*120+119)+'</option>'}).join('');
    var head=q.dir==='dep'?[Z?'時間':'Time',Z?'目的地':'To',Z?'航空公司':'Airline',Z?'航班':'Flight',Z?'航廈':'Terminal',Z?'登機門':'Gate',Z?'報到櫃檯':'Check-in',Z?'狀態':'Status']
                         :[Z?'時間':'Time',Z?'出發地':'From',Z?'航空公司':'Airline',Z?'航班':'Flight',Z?'航廈':'Terminal',Z?'登機門':'Gate',Z?'行李轉盤':'Baggage',Z?'狀態':'Status'];
    var body=built.map(function(x){var r=x.r,c=x.c,k=r.dir+'|'+r.code+'|'+r.d+'|'+r.sch,op=S.fb19Open===k;
      var chg=r.act!==r.sch,lines=[{al:r.al,code:r.code}].concat(r.codes);
      var place=E(city(r.other))+(r.via?'<small>'+(q.dir==='dep'?(Z?'續飛 ':'then ')+E(city(r.via)):(Z?'自 ':'from ')+E(city(r.via)))+'</small>':'');
      var det='';
      if(op){var f=r.f,ty='';try{ty=acftNameOf(f,r.d)}catch(_){ty=f.acft||''}
        var it=function(a,b){return '<div><span>'+a+'</span><b>'+b+'</b></div>'};
        det='<tr class="fb19-det"><td colspan="8"><div class="fb19-dg">'
          +it(Z?'航線':'Route',E(city(f.fr))+' '+E(f.fr)+' → '+E(city(f.to))+' '+E(f.to))
          +it(Z?'表訂起飛／抵達':'Scheduled',E(f.dep)+' → '+E(f.arr)+((+f.dd||0)?'<sup>+'+(+f.dd)+'</sup>':'')+(Z?'（當地時間）':' (local)'))
          +it(Z?'飛行時間':'Duration',E(f.durStr||''))
          +it(Z?'機型':'Aircraft',E(ty))
          +it(Z?'營運':'Operated by',E(nm(r.al))+' '+E(r.code))
          +(lines.length>1?it(Z?'共用班號':'Codeshare',lines.slice(1).map(function(l){return E(l.code)+'（'+E(nm(l.al))+'）'}).join('、')):'')
          +(r.dir==='dep'&&c.ctr&&c.ctr.open?it(Z?'報到櫃檯開放':'Check-in open',E(c.ctr.open)+' – '+E(c.ctr.close)):'')
          +(r.dir==='dep'?it(Z?'開始登機':'Boarding',hm(mn(r.act)-30)):'')
          +(r.dir==='arr'&&c.nx?it(Z?'接續航班（同一架飛機）':'Next flight (same aircraft)',E(c.nx.code)+' '+E(c.nx.act)+' → '+E(city(c.nx.other))):'')
          +'</div></td></tr>';
      }
      return '<tr class="fb19-r'+(op?' on':'')+'">'
        +'<td class="fb19-t">'+(chg?'<s>'+E(r.sch)+'</s>':'')+'<b>'+E(r.act)+'</b></td>'
        +'<td class="fb19-c">'+place+'</td>'
        +'<td>'+lines.map(function(l){return '<div class="fb19-al">'+logo(l.al)+'<span>'+E(nm(l.al))+'</span></div>'}).join('')+'</td>'
        +'<td>'+lines.map(function(l){return '<div class="fb19-cd">'+E(l.code)+'</div>'}).join('')+'</td>'
        +'<td class="fb19-tm '+(c.term==='T1'?'t1':'t2')+'">'+E(c.term||'—')+'</td>'
        +'<td>'+E(c.gate||'—')+'</td>'
        +'<td>'+E(r.dir==='dep'?((c.ctr&&c.ctr.counter&&c.ctr.counter!=='—')?c.ctr.counter:'—'):(c.term?belt(r,c.term):'—'))+'</td>'
        +'<td class="fb19-s '+c.st[2]+'"><small>'+(q.dir==='dep'?(Z?'出發':'Dep'):(Z?'抵達':'Arr'))+'</small> '+E(Z?c.st[0]:c.st[1])+'</td>'
        +'</tr><tr class="fb19-more"><td colspan="8"><button onclick="kgmFbOpenR1019A(\''+E(k)+'\')">'+(op?'︿ ':'﹀ ')+(op?(Z?'收合':'Less'):(Z?'顯示更多':'More'))+'</button></td></tr>'+det;
    }).join('');
    if(!built.length)body='<tr><td colspan="8" class="fb19-none">'+(Z?'這個時段沒有符合的航班。':'No flights in this period.')+'</td></tr>';
    return '<div class="fb19">'
      +'<div class="fb19-tabs"><button class="'+(q.dir==='dep'?'on':'')+'" onclick="kgmFbSetR1019A(\'dir\',\'dep\')">'+(Z?'客機起飛':'Departures')+'</button><button class="'+(q.dir==='arr'?'on':'')+'" onclick="kgmFbSetR1019A(\'dir\',\'arr\')">'+(Z?'客機抵達':'Arrivals')+'</button>'
        +'<span class="fb19-ap">'+(Z?'台北桃園國際機場 TPE':'Taipei Taoyuan (TPE)')+'</span></div>'
      +'<div class="fb19-f">'
        +'<label>'+(Z?'日期':'Date')+'<select class="inp" onchange="kgmFbSetR1019A(\'date\',this.value)">'+dates+'</select></label>'
        +'<label>'+(Z?'時間':'Time')+'<select class="inp" onchange="kgmFbSetR1019A(\'slot\',this.value)">'+slots+'</select></label>'
        +'<label>'+(Z?'航廈':'Terminal')+'<select class="inp" onchange="kgmFbSetR1019A(\'term\',this.value)"><option value="all"'+(q.term==='all'?' selected':'')+'>'+(Z?'所有航廈':'All terminals')+'</option><option value="T1"'+(q.term==='T1'?' selected':'')+'>'+(Z?'第一航廈 T1':'Terminal 1')+'</option><option value="T2"'+(q.term==='T2'?' selected':'')+'>'+(Z?'第二航廈 T2':'Terminal 2')+'</option></select></label>'
        +'<label class="fb19-q">'+(Z?'搜尋':'Search')+'<input class="inp" placeholder="'+(Z?'航班編號／航空公司／城市':'Flight / airline / city')+'" value="'+E(q.q)+'" onkeydown="if(event.key===\'Enter\')kgmFbSetR1019A(\'q\',this.value)" onchange="kgmFbSetR1019A(\'q\',this.value)"></label>'
      +'</div>'
      +'<div class="fb19-up"><button onclick="CACHE19R1019A();render()" title="'+(Z?'重新整理':'Refresh')+'">⟳</button> '+(Z?'更新於 ':'Updated ')+hm(n.min)+(qq?(Z?'　搜尋時列出全天':' · searching the whole day'):'')+'</div>'
      +'<div class="fb19-w"><table><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>'
      +'<p class="fb19-n">'+(Z?'列出在桃園機場起降、由 KGM 營運或掛 KGM（KX）代碼的聯營航班；時間為桃園當地時間。':'KGM-operated and KX-codeshare flights at Taipei Taoyuan; local time.')+'</p>'
    +'</div>';
  }
  window.CACHE19R1019A=function(){CACHE19={}};
  var CSS19='<style id="fb19-css">.fb19-tabs{display:flex;align-items:baseline;gap:22px;flex-wrap:wrap;margin:4px 0 16px}.fb19-tabs button{background:none;border:0;padding:0;font-family:inherit;font-size:26px;font-weight:900;line-height:1.2;color:#9aa8a2;cursor:pointer}'
    +'.fb19-tabs button.on{color:#0f3d34}.fb19-ap{margin-left:auto;font-size:12px;color:#6b7b74;letter-spacing:.04em}'
    +'.fb19-f{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) minmax(0,1.6fr);gap:14px}.fb19-f label{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#55645e;font-weight:700}.fb19-f .inp{height:44px;width:100%;box-sizing:border-box}'
    +'.fb19-up{display:flex;justify-content:flex-end;align-items:center;gap:6px;font-size:12px;color:#55645e;margin:14px 0 8px}.fb19-up button{border:0;background:none;font-size:16px;cursor:pointer;color:#0f3d34;padding:0}'
    +'.fb19-w{overflow-x:auto;border-radius:12px;border:1px solid #e3ebe7}.fb19 table{width:100%;border-collapse:collapse;min-width:860px;font-size:14px}'
    +'.fb19 thead th{background:#0f5f57;color:#fff;text-align:left;font-weight:800;padding:14px 12px;font-size:14px;white-space:nowrap}'
    +'.fb19 td{padding:12px;vertical-align:middle;border-top:1px solid #edf1ef}.fb19-r td{border-top:1px solid #dfe6e2}.fb19-more td{border-top:0;padding:0 12px 10px}'
    +'.fb19-more button{border:0;background:none;color:#0f5f57;font-weight:800;font-size:13px;cursor:pointer;padding:0}'
    +'.fb19-t s{display:block;color:#a9b3ae;font-size:12.5px}.fb19-t b{font-size:15px;font-variant-numeric:tabular-nums}.fb19-c small{display:block;font-size:11px;color:#6b7b74;margin-top:2px}'
    +'.fb19-al{display:flex;align-items:center;gap:10px;min-height:40px}.fb19-al+.fb19-al{margin-top:6px}.fb19-lg{display:inline-flex;align-items:center;justify-content:center;width:56px;height:36px;border:1px solid #dfe6e2;border-radius:8px;background:#fff;overflow:hidden;flex:0 0 auto}'
    +'.fb19-lg img{max-width:50px;max-height:30px;object-fit:contain}.fb19-lg b{font-size:12px;color:#0f3d34}'
    +'.fb19-cd{min-height:40px;display:flex;align-items:center;font-variant-numeric:tabular-nums}.fb19-cd+.fb19-cd{margin-top:6px}'
    +'.fb19-tm{font-weight:900;font-size:16px}.fb19-tm.t1{color:#0f7a6e}.fb19-tm.t2{color:#9a5b12}'
    +'.fb19-s{white-space:nowrap;font-weight:800}.fb19-s small{font-weight:600;color:#55645e;font-size:12px}.fb19-s.done{color:#33413b}.fb19-s.ok{color:#15803d}.fb19-s.board{color:#7c3aed}.fb19-s.warn{color:#b45309}.fb19-s.bad{color:#b91c1c}.fb19-s.air{color:#1e40af}'
    +'.fb19-det td{background:#f7faf8;padding:12px 16px}.fb19-dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px 18px}.fb19-dg div{display:flex;flex-direction:column;gap:2px}.fb19-dg span{font-size:11px;color:#6b7b74}.fb19-dg b{font-size:13px;color:#1d2a25}'
    +'.fb19-none{text-align:center;color:#6b7b74;padding:28px!important}.fb19-n{font-size:11.5px;color:#6b7b74;margin:10px 2px 0}'
    +'.fb19-st{display:flex;gap:6px;margin-bottom:14px}'
    +'@media (max-width:760px){.fb19-f{grid-template-columns:1fr 1fr}.fb19-q{grid-column:1/-1}.fb19-tabs button{font-size:21px}.fb19-ap{margin-left:0;width:100%}}</style>';
  /* 航班動態：多一個「機場看板」分頁（預設），原本兩個分頁照舊 */
  if(typeof statusView==='function'&&!statusView.__fb19){
    var st19=statusView;
    statusView=function(){
      var Z=z();
      if(S.stBoardR1019A!==false){
        return CSS19+'<div style="max-width:1100px;margin:0 auto;padding:20px">'
          +'<h1 style="font-family:Georgia,serif;font-size:20px;color:var(--g);margin-bottom:14px">'+(Z?'航班到離動態':'Flight Status')+'</h1>'
          +'<div class="card" style="margin-bottom:12px"><div class="fb19-st">'
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
