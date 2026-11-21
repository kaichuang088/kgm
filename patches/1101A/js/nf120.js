/* ══ 1120A K3（使用者：「創建航班要先選完第一步驟就是航點起飛時間（創建航班一率要用來回）只是看要哪一趟販售或是都販售，然後選完這些才會到機型，
       機型只會列出可以飛的機型（有足夠空檔）的，然後會自動加入飛機排班表，EQV的那裡要多選，然後EQV/固定機型不用強求要哪一個被fill in，但是一定要有一個fill in」）
     K2（「航班調整也要可以說某個現有航班某一週變成營運哪幾天」）══
   · 航班調整／航線管理頁的「新增航線／臨時航班」換成兩步驟（window.kgmNewRouteHtmlR57 換掉；r57 舊表單函式還在，不刪）：
     第一步：航點、去／回程班號、首航日（結束日可空白）、營運日、去程與回程起飛時間（一律來回）、販售哪一趟（都賣／只賣去程／只賣回程／都不賣）。
     第二步：只列「航程夠、而且前 10 個營運日每天都有空機身（在出發站、去回整段前後 75 分沒有別的勤務、轉機時間夠）」的機型；
             固定機型（單選）或 EQV 輪替（多選）擇一，至少要選一個。
     建立：去回兩班寫進 S.customFlights（跟原本同一份），EQV 池寫進 S.eqvPoolR198（航線管理 EQV 勾選同一份，1120A 起會存檔），
           再叫整年機隊重排（kgmRebuildFleetR72），新航班跟其他航班一起排進飛機排班表。
   · 某一週改營運日：S.weekOpsR1120A[班號][該週星期一]＝[1..7]（1＝週一…7＝週日，跟航班表 days 同一套），最外層包 flyOn；
     可勾「連同回程」；改完清輪轉快取、整年機隊重排、組員重算。拿掉的日子如果已有訂位，畫面列出筆數（旅客要另外用航班狀態處理，不會自動取消）。 */
(function(){
  if(window.__nf120)return;window.__nf120=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function D(d,n){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
  function mn(t){var q=/^(\d{1,2}):(\d{2})/.exec(String(t||''));return q?(+q[1])*60+(+q[2]):null}
  function hm(n){n=((n%1440)+1440)%1440;return ('0'+Math.floor(n/60)).slice(-2)+':'+('0'+n%60).slice(-2)}
  function tz(ap,d){try{if(window.kgmTzAtR1026C)return +window.kgmTzAtR1026C(ap,d)}catch(_){}try{return +TZ[ap]||8}catch(_){return 8}}
  function abs(d,t,ap){return Date.parse(d+'T00:00:00Z')/60000+(typeof t==='number'?t:mn(t))-tz(ap,d)*60}
  function dow(d){return new Date(d+'T12:00:00Z').getUTCDay()||7}
  function wk(d){return D(d,1-dow(d))}
  function AF(){try{return [].concat(FLIGHTS||[],S.customFlights||[]).filter(Boolean)}catch(_){return []}}
  var WD=['','一','二','三','四','五','六','日'];
  function save2(){try{save()}catch(_){}}
  function rebuild(){try{if(window.kgmClearRotationCacheR72)window.kgmClearRotationCacheR72()}catch(_){}try{if(window.kgmClearEqvPlanR79)window.kgmClearEqvPlanR79()}catch(_){}
    try{if(window.kgmCrewResetR121)window.kgmCrewResetR121()}catch(_){}try{if(window.kgmRebuildFleetR72)window.kgmRebuildFleetR72(T(),366,true)}catch(_){}}

  /* ───────── K2：某一週改營運日 ───────── */
  function ymd(dt){if(typeof dt==='string')return dt.slice(0,10);try{return dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2)+'-'+('0'+dt.getDate()).slice(-2)}catch(_){return ''}}
  function inEff(f,d){if(f.effFrom&&d<f.effFrom)return false;if(f.effTo&&d>f.effTo)return false;return true}
  function wrapFly(){var O=window.flyOn;if(typeof O!=='function'||O.__nf120)return;
    var w=function(f,dt){try{var W=S.weekOpsR1120A;if(W&&f&&f.code&&W[f.code]){var d=ymd(dt),o=W[f.code][wk(d)];if(o&&inEff(f,d))return o.indexOf(dow(d))>=0}}catch(_){}return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__nf120=1;w._raw=O;window.flyOn=w;try{flyOn=w}catch(_){}}
  wrapFly();[0,1000,4000,12000].forEach(function(t){setTimeout(wrapFly,t)});
  function rowsOf(code){return AF().filter(function(f){return f.code===code&&!f.via&&!f.partner})}
  function rawFly(f,d){var O=window.flyOn&&window.flyOn._raw?window.flyOn._raw:window.flyOn;try{return !!O(f,new Date(d+'T00:00:00'))}catch(_){return false}}
  function pairOf(code){try{if(window.kgmKxPairR1108B){var n=+String(code).replace(/\D/g,''),p=window.kgmKxPairR1108B(n);if(p>0&&p!==n)return 'KX'+p}}catch(_){}return ''}   /* kgmKxPairR1108B 吃數字 */
  window.kgmWeekOpsReadR1120A=function(){var g=function(id){var e=document.getElementById(id);return e?String(e.value||'').trim():''};var x=S.nfWkR1120A=S.nfWkR1120A||{};x.code=g('nfWkCode').toUpperCase();x.date=g('nfWkDate')||x.date||T();var pe=document.getElementById('nfWkPair');if(pe)x.pair=!!pe.checked;
    if(document.getElementById('nfWkD1')){var days=[];for(var i=1;i<=7;i++){var c=document.getElementById('nfWkD'+i);if(c&&c.checked)days.push(i)}x.days=days}
    if(x.loaded&&(x.loaded!==x.code||x.loadedWk!==wk(x.date)))x.loaded='';   /* 改了班號或換了一週：要重新讀取 */
    return x};
  window.kgmWeekOpsLoadR1120A=function(){var x=window.kgmWeekOpsReadR1120A();var R=rowsOf(x.code);x.msg='';x.loaded=R.length?x.code:'';x.loadedWk=wk(x.date);if(!R.length){x.msg=z()?'找不到 '+x.code+' 這個班號。':'No such flight.';render();return}
    var w0=wk(x.date),cur=(S.weekOpsR1120A||{})[x.code]&&S.weekOpsR1120A[x.code][w0];x.days=cur?cur.slice():[1,2,3,4,5,6,7].filter(function(i){return R.some(function(f){return rawFly(f,D(w0,i-1))})});x.pairCode=pairOf(x.code);render()};
  window.kgmWeekOpsApplyR1120A=function(clear){var x=window.kgmWeekOpsReadR1120A(),zh=z(),R=rowsOf(x.code);if(!R.length){alert(zh?'找不到這個班號。':'No such flight.');return}
    if(!clear&&!x.loaded){alert(zh?'請先按「讀取這週目前營運日」，確認後再套用。':'Load the week first.');render();return}
    var multi={};R.forEach(function(f){var k=f.fr+f.to;multi[k]=(multi[k]||0)+1});if(Object.keys(multi).some(function(k){return multi[k]>1})){alert(zh?x.code+' 一週內有兩種時刻（同班號兩列），這裡先不支援單週改營運日。':'This flight has two timetables per week; not supported.');return}
    var w0=wk(x.date),codes=[x.code];if(x.pair){var pc=pairOf(x.code);if(pc&&rowsOf(pc).length)codes.push(pc)}
    S.weekOpsR1120A=S.weekOpsR1120A||{};var removedBk=0;
    codes.forEach(function(c){S.weekOpsR1120A[c]=S.weekOpsR1120A[c]||{};
      if(clear){delete S.weekOpsR1120A[c][w0];if(!Object.keys(S.weekOpsR1120A[c]).length)delete S.weekOpsR1120A[c];return}
      S.weekOpsR1120A[c][w0]=x.days.slice();
      for(var i=1;i<=7;i++){var d=D(w0,i-1);if(x.days.indexOf(i)>=0)continue;if(!rowsOf(c).some(function(f){return rawFly(f,d)}))continue;
        (S.bookings||[]).forEach(function(b){if(!b||/cancel|refund/.test(String(b.status||'')))return;[b.outF,b.inbF].concat((b.mcFlights||[]).map(function(m){return m&&m.f})).forEach(function(f){if(f&&f.code===c&&f.date===d)removedBk++})})}});
    x.msg=(clear?(zh?'已恢復 '+codes.join('／')+' 這一週（'+w0+' 起）原本的營運日。':'Restored.'):(zh?'已設定 '+codes.join('／')+' '+w0+' 這一週營運：週'+(x.days.length?x.days.map(function(i){return WD[i]}).join('、'):'（全週停飛）')+'。機隊與組員會重新排班。':'Saved.'))
      +(removedBk?(zh?' ⚠ 拿掉的日子已經有 '+removedBk+' 筆訂位：請到「航班狀態」對那幾天做取消／改期，系統不會自動取消旅客。':' ⚠ '+removedBk+' bookings on removed days — handle them in Flight status.'):'');
    var fin=x.msg;x.msg=(zh?'已套用，正在重排機隊與組員（約 20 秒，期間畫面會停住）…':'Applied — rescheduling (about 20 s)…');save2();render();
    setTimeout(function(){rebuild();x.msg=fin;save2();render()},80)};
  function weekCard(){var zh=z(),x=S.nfWkR1120A||{},W=S.weekOpsR1120A||{},w0=wk(x.date||T());
    var list=[];Object.keys(W).forEach(function(c){Object.keys(W[c]).sort().forEach(function(k){if(k>=wk(T()))list.push([c,k,W[c][k]])})});
    return '<section class="k57-card nf120-card"><header><span>WEEKLY OPERATION</span><h3>'+(zh?'某一週改營運日':'Change operating days for one week')+'</h3></header>'
      +'<p class="k57-eff">'+(zh?'輸入班號、選那一週的任一天，勾這一週要飛的星期幾。只影響這一週；其他週照原本班表。改完機隊與組員自動重新排班。':'Pick a flight and any date in the week, then tick the days it should operate that week only.')+'</p>'
      +'<div class="nf120-row"><label><span>'+(zh?'班號':'Flight')+'</span><input id="nfWkCode" class="inp" placeholder="KX181" value="'+E(x.code||'')+'"></label>'
      +'<label><span>'+(zh?'那一週的任一天':'Any date in the week')+'</span><input id="nfWkDate" type="date" class="inp" value="'+E(x.date||T())+'"></label>'
      +'<button type="button" class="btn" onclick="kgmWeekOpsLoadR1120A()">'+(zh?'讀取這週目前營運日':'Load')+'</button></div>'
      +(x.loaded?'<div class="nf120-wk"><b>'+E(x.loaded)+' · '+w0+' ～ '+D(w0,6)+'</b><div class="nf120-days">'+[1,2,3,4,5,6,7].map(function(i){return '<label><input type="checkbox" id="nfWkD'+i+'"'+((x.days||[]).indexOf(i)>=0?' checked':'')+'> '+(zh?'週'+WD[i]:['','Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i])+'<small>'+D(w0,i-1).slice(5).replace('-','/')+'</small></label>'}).join('')+'</div>'
        +(x.pairCode?'<label class="nf120-pair"><input type="checkbox" id="nfWkPair"'+(x.pair!==false?' checked':'')+'> '+(zh?'連同回程 '+E(x.pairCode)+' 一起改（同樣的星期幾）':'Also change the return '+E(x.pairCode))+'</label>':'')
        +'<div class="nf120-act"><button type="button" class="btn btn-g" onclick="kgmWeekOpsApplyR1120A()">'+(zh?'套用這一週':'Apply for this week')+'</button><button type="button" class="btn" onclick="kgmWeekOpsApplyR1120A(true)">'+(zh?'恢復原本':'Restore')+'</button></div></div>':'')
      +(x.msg?'<div class="k57-msg">'+E(x.msg)+'</div>':'')
      +(list.length?'<div class="nf120-list"><b>'+(zh?'已設定的單週營運日':'Weekly overrides')+'</b>'+list.map(function(r){return '<span>'+E(r[0])+' · '+r[1]+' 起 · 週'+(r[2].length?r[2].map(function(i){return WD[i]}).join(''):(zh?'（停飛）':'(none)'))+'</span>'}).join('')+'</div>':'')
      +'</section>'}

  /* ───────── K3：新增航班（兩步驟） ───────── */
  /* r28 會把畫面上 KX 班號附近的「EQV」字樣換成當天實際機型 → 這裡的 EQV 標籤用 CSS 畫，不放文字節點 */
  var Q='<i class="nf120-q"></i>';
  var TYPES=['A21N','B78X','B789','B779','A359','A35K','A339R','A339L','A388'];
  function known(a){try{return window.kgmKnownAirportR913?window.kgmKnownAirportR913(a):true}catch(_){return true}}
  function dist(a,b){try{return +distOf(a,b)||0}catch(_){return 0}}
  function durOf(a,b){var d=dist(a,b)||1200;return Math.round(Math.max(55,d/780*60+35)/5)*5}
  function turn(t){return t==='A388'?120:(/^A21|^A32/.test(t)?60:90)}
  function freeCode(odd){var used={};AF().forEach(function(f){if(f&&f.code)used[f.code]=1});for(var n=odd?2001:2002;n<2999;n+=2)if(!used['KX'+n]&&!used['KX'+(n+(odd?1:-1))])return 'KX'+n;return ''}
  function tailsOf(t){var L=[];try{L=(tailsFor(t)||[]).slice()}catch(_){}return L.filter(function(tl){return (S.tailStatus||{})[tl]!=='maintenance'&&!((S.fleetRetiredR928||{})[tl])})}
  var LEG={};function legsOf(tl){var k=tl+'|'+((S.tailAssign||{})[tl]||[]).length;if(LEG[tl]&&LEG[tl].k===k)return LEG[tl].v;
    var v=((S.tailAssign||{})[tl]||[]).filter(function(x){return x&&x.date&&!x.cancelledR1023A}).map(function(x){var fr=x.fr||String(x.route||'').split('→')[0],to=x.to||String(x.route||'').split('→')[1],a=abs(x.date,x.dep,fr),b=abs(D(x.date,+x.dd||0),x.arr,to);if(!(b>a))b=a+180;return [a,b,x.date]});
    LEG[tl]={k:k,v:v};return v}
  function busy(tl,a,b){var L=legsOf(tl);for(var i=0;i<L.length;i++){if(!(b+75<=L[i][0]||L[i][1]+75<=a))return true}return false}
  function at(tl,d,depMin,fr){var x=null;try{x=window.kgmTailAtR913(tl,d,depMin)}catch(_){}if(x==null)x=(S.tsaFleet&&S.tsaFleet[tl])?'TSA':'TPE';if(x==='TSA'&&fr==='TPE')x='TPE';if(x==='TPE'&&fr==='TSA')x='TSA';return x===fr}
  function legTimes(x,d){var dO=durOf(x.fr,x.to),a=abs(d,x.dep,x.fr),b=a+dO,rd=d,ra=abs(rd,x.ret,x.to);while(ra<b+30&&rd<D(d,2)){rd=D(rd,1);ra=abs(rd,x.ret,x.to)}var rb=ra+durOf(x.to,x.fr);return {a:a,b:b,ra:ra,rb:rb,rd:rd,dO:dO}}
  function opDates(x,n){var out=[];for(var i=0;i<60&&out.length<n;i++){var d=D(x.from,i);if(x.until&&d>x.until)break;if((x.days||[]).indexOf(dow(d))>=0)out.push(d)}return out}
  function feasible(x){var ds=opDates(x,10),res=[];
    TYPES.forEach(function(t){var can=true;try{can=_acftCanFly(t,x.fr,x.to)!==false&&_acftCanFly(t,x.to,x.fr)!==false}catch(_){}
      if(!can){res.push({t:t,ok:false,why:z()?'航程不夠（'+Math.round(dist(x.fr,x.to)).toLocaleString()+' km）':'range'});return}
      var tl=tailsOf(t);if(!tl.length){res.push({t:t,ok:false,why:z()?'沒有這型機身':'no tails'});return}
      var lt0=ds.length?legTimes(x,ds[0]):null;if(lt0&&lt0.ra-lt0.b<turn(t)){res.push({t:t,ok:false,why:z()?'回程起飛太早：這型在 '+x.to+' 至少要 '+turn(t)+' 分鐘過站':'turnaround too short'});return}
      var okDays=0,minFree=1e9;ds.forEach(function(d){var lt=legTimes(x,d),n=0;tl.forEach(function(tail){if(n>=3)return;if(!at(tail,d,mn(x.dep),x.fr))return;if(busy(tail,lt.a,lt.rb))return;n++});if(n>0)okDays++;minFree=Math.min(minFree,n)});
      if(okDays<ds.length)res.push({t:t,ok:false,why:(z()?'前 '+ds.length+' 個營運日只有 '+okDays+' 天有空機身':'free on '+okDays+'/'+ds.length+' days')});
      else res.push({t:t,ok:true,days:ds.length,free:minFree>=3?'3+':String(minFree)})});
    return res}
  function readS1(){var g=function(id){var e=document.getElementById(id);return e?String(e.value||'').trim():''};var x=S.nf120=S.nf120||{};
    x.fr=g('nf1Fr').toUpperCase();x.to=g('nf1To').toUpperCase();x.code=g('nf1Code').toUpperCase();x.code2=g('nf1Code2').toUpperCase();x.from=g('nf1From');x.until=g('nf1Until');x.dep=g('nf1Dep');x.ret=g('nf1Ret');
    var days=[];for(var i=1;i<=7;i++){var c=document.getElementById('nf1D'+i);if(c&&c.checked)days.push(i)}x.days=days;var s=document.querySelector('input[name="nf1Sell"]:checked');x.sell=s?s.value:'both';return x}
  window.kgmNfAutoRetR1120A=function(){var x=readS1();if(!/^[A-Z]{3}$/.test(x.fr)||!/^[A-Z]{3}$/.test(x.to)||mn(x.dep)==null){alert(z()?'先填出發地、目的地與去程起飛時間。':'Fill origin, destination and departure first.');return}
    var d=x.from||T(),a=abs(d,x.dep,x.fr)+durOf(x.fr,x.to)+90,loc=a+tz(x.to,d)*60-Date.parse(d+'T00:00:00Z')/60000;x.ret=hm(Math.ceil(loc/5)*5);render()};
  window.kgmNfNextR1120A=function(){var x=readS1(),zh=z(),err=[];
    if(!/^[A-Z]{3}$/.test(x.fr)||!/^[A-Z]{3}$/.test(x.to)||x.fr===x.to)err.push(zh?'出發地／目的地（3 碼代碼）':'origin / destination');
    else[x.fr,x.to].forEach(function(a){if(!known(a))err.push(zh?a+' 還不是本公司航點（請先在下面「新增航點」建立）':a+' is not a KGM airport')});
    if(!/^KX\d{2,4}$/.test(x.code)||!/^KX\d{2,4}$/.test(x.code2)||x.code===x.code2)err.push(zh?'去程／回程班號':'flight numbers');
    else if(AF().some(function(f){return f.code===x.code||f.code===x.code2}))err.push(zh?'班號已經有人用了':'flight number already used');
    if(!x.from)err.push(zh?'首航日':'first date');if(x.until&&x.until<x.from)err.push(zh?'結束日早於首航日':'end before start');
    if(!x.days.length)err.push(zh?'至少一個營運日':'operating days');if(mn(x.dep)==null||mn(x.ret)==null)err.push(zh?'去程與回程起飛時間':'departure times');
    if(err.length){x.err=(zh?'請確認：':'Check: ')+err.join('、');render();return}
    x.err='';x.step=2;x.pick={fixed:'',eqv:[]};x.feas=feasible(x);render()};
  window.kgmNfBackR1120A=function(){var x=S.nf120||{};x.step=1;render()};
  window.kgmNfPickR1120A=function(kind,t){var x=S.nf120||{},p=x.pick=x.pick||{fixed:'',eqv:[]};if(kind==='fixed'){p.fixed=p.fixed===t?'':t;if(p.fixed)p.eqv=[]}else{var i=p.eqv.indexOf(t);if(i>=0)p.eqv.splice(i,1);else p.eqv.push(t);if(p.eqv.length)p.fixed=''}render()};
  window.kgmNfCreateR1120A=function(){var x=S.nf120||{},p=x.pick||{},zh=z();if(!p.fixed&&!(p.eqv||[]).length){alert(zh?'請選一個固定機型，或至少一個 EQV 輪替機型。':'Pick a fixed type or at least one EQV type.');return}
    var pool=p.fixed?null:p.eqv.slice(),acft=p.fixed||'EQV',days=x.days.length===7?'daily':x.days.slice();
    var mk=function(code,fr,to,dep,sell){var dO=durOf(fr,to),d=x.from,a=abs(d,dep,fr)+dO,loc=a+tz(to,d)*60-Date.parse(d+'T00:00:00Z')/60000,dd=Math.floor(loc/1440);
      return {code:code,fr:fr,to:to,dep:dep,arr:hm(loc),dd:dd,dur:dO,acft:acft,days:days,effFrom:x.from,effTo:x.until||null,newRouteR830:true,createdR1120A:true,noSaleR913:!sell,eqvPoolR1120A:pool}};
    var out=mk(x.code,x.fr,x.to,x.dep,x.sell==='both'||x.sell==='out'),back=mk(x.code2,x.to,x.fr,x.ret,x.sell==='both'||x.sell==='ret');
    S.customFlights=S.customFlights||[];S.customFlights.push(out,back);
    if(pool){var st=window.kgmEqvPoolStoreR198?window.kgmEqvPoolStoreR198():(S.eqvPoolR198=S.eqvPoolR198||{});[out,back].forEach(function(f){st[f.code+'|'+f.fr+'|'+f.to]={summer:pool.slice(),winter:pool.slice()}})}
    x.done=(zh?'已建立 '+out.code+' '+out.fr+'→'+out.to+' '+out.dep+'－'+out.arr+(out.dd?'⁺'+out.dd:'')+' ／ '+back.code+' '+back.fr+'→'+back.to+' '+back.dep+'－'+back.arr+(back.dd?'⁺'+back.dd:'')+'；機型 '+(pool?'\u0001（'+pool.join('／')+'）':acft)+'；'+({both:'去回都販售',out:'只販售去程',ret:'只販售回程',none:'都不販售（只排班）'})[x.sell]+'。已排進整年機隊，在「機隊排班」看得到這兩班。':'Created.');
    var fin=x.done;S.nf120={step:1,done:(zh?'已建立，正在把這兩班排進整年機隊（約 20 秒，期間畫面會停住）…':'Created — rescheduling the fleet (about 20 s)…')};save2();render();
    setTimeout(function(){rebuild();S.nf120.done=fin;save2();render()},80)};   /* 整年機隊重排是同步的（約 18～21 秒）：先讓畫面顯示「排班中」再開始 */
  function wizard(){var zh=z(),x=S.nf120=S.nf120||{step:1};if(!x.code){x.code=freeCode(true);x.code2=x.code?(pairOf(x.code)||('KX'+(+x.code.slice(2)+1))):''}if(!x.from)x.from=D(T(),14);if(!x.days)x.days=[1,2,3,4,5,6,7];if(!x.sell)x.sell='both';
    var head='<section class="k57-card k57-new nf120-card"><header><span>NETWORK CONTROL</span><h3>'+(zh?'新增航線／臨時航班':'New route / temporary flight')+'</h3></header>'
      +'<ol class="nf120-steps"><li class="'+(x.step===1?'on':'ok')+'"><i>1</i>'+(zh?'航點與時間（去回程）':'Route & times')+'</li><li class="'+(x.step===2?'on':'')+'"><i>2</i>'+(zh?'機型（只列排得開的）':'Aircraft')+'</li></ol>';
    if(x.step!==2){
      return head+'<p class="k57-eff">'+(zh?'新增航班一律是來回兩班。先填航點、班號、日期、營運日與去回程起飛時間（當地時間），選要販售哪一趟；下一步才選機型。':'Every new flight is a round trip. Fill route, numbers, dates, days and local departure times, choose which leg is sold, then pick aircraft.')+'</p>'
        +'<div class="nf120-grid">'
        +'<label><span>'+(zh?'出發':'From')+'</span><input id="nf1Fr" class="inp" maxlength="3" placeholder="TPE" value="'+E(x.fr||'')+'"></label>'
        +'<label><span>'+(zh?'目的地':'To')+'</span><input id="nf1To" class="inp" maxlength="3" placeholder="KIX" value="'+E(x.to||'')+'"></label>'
        +'<label><span>'+(zh?'去程班號':'Outbound no.')+'</span><input id="nf1Code" class="inp" value="'+E(x.code||'')+'"></label>'
        +'<label><span>'+(zh?'回程班號':'Return no.')+'</span><input id="nf1Code2" class="inp" value="'+E(x.code2||'')+'"></label>'
        +'<label><span>'+(zh?'首航日':'First date')+'</span><input id="nf1From" type="date" class="inp" value="'+E(x.from||'')+'"></label>'
        +'<label><span>'+(zh?'結束日（空白＝長期）':'Last date (blank = ongoing)')+'</span><input id="nf1Until" type="date" class="inp" value="'+E(x.until||'')+'"></label>'
        +'<label><span>'+(zh?'去程起飛（出發地當地）':'Outbound departure (local)')+'</span><input id="nf1Dep" type="time" class="inp" value="'+E(x.dep||'')+'"></label>'
        +'<label><span>'+(zh?'回程起飛（目的地當地）':'Return departure (local)')+'</span><div class="nf120-in"><input id="nf1Ret" type="time" class="inp" value="'+E(x.ret||'')+'"><button type="button" class="btn btn-sm" onclick="kgmNfAutoRetR1120A()">'+(zh?'建議':'Suggest')+'</button></div></label>'
        +'</div>'
        +'<div class="nf120-days"><span>'+(zh?'營運日':'Days')+'</span>'+[1,2,3,4,5,6,7].map(function(i){return '<label><input type="checkbox" id="nf1D'+i+'"'+(x.days.indexOf(i)>=0?' checked':'')+'> '+(zh?'週'+WD[i]:['','Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i])+'</label>'}).join('')+'</div>'
        +'<div class="nf120-sell"><span>'+(zh?'販售':'Sell')+'</span>'+[['both',zh?'去回都販售':'Both'],['out',zh?'只販售去程':'Outbound only'],['ret',zh?'只販售回程':'Return only'],['none',zh?'都不販售（只排班）':'Not for sale']].map(function(o){return '<label><input type="radio" name="nf1Sell" value="'+o[0]+'"'+(x.sell===o[0]?' checked':'')+'> '+o[1]+'</label>'}).join('')+'</div>'
        +(x.err?'<div class="k57-needap">'+E(x.err)+'</div>':'')+(x.done?'<div class="k57-msg">'+E(x.done).replace('\u0001',Q)+'</div>':'')
        +'<div class="nf120-act"><button type="button" class="btn btn-g" onclick="kgmNfNextR1120A()">'+(zh?'下一步：選機型 →':'Next: aircraft →')+'</button></div></section>'}
    var F=x.feas||[],ok=F.filter(function(r){return r.ok}),no=F.filter(function(r){return !r.ok}),p=x.pick||{fixed:'',eqv:[]};
    var nm=function(t){try{return ((typeof AC!=='undefined'&&AC[t])||{}).nm||t}catch(_){return t}};
    return head+'<div class="nf120-sum"><b>'+E(x.code)+' '+E(x.fr)+'→'+E(x.to)+' '+E(x.dep)+'</b><b>'+E(x.code2)+' '+E(x.to)+'→'+E(x.fr)+' '+E(x.ret)+'</b><span>'+E(x.from)+(x.until?' ～ '+E(x.until):(zh?' 起長期':' onward'))+' · '+(zh?'週':'')+(x.days.length===7?(zh?'每天':'daily'):x.days.map(function(i){return WD[i]}).join(''))+'</span><button type="button" class="btn btn-sm" onclick="kgmNfBackR1120A()">'+(zh?'← 改第一步':'← Back')+'</button></div>'
      +'<p class="k57-eff">'+(zh?'下面只列「航程夠、而且前 '+((ok[0]&&ok[0].days)||10)+' 個營運日每天都有空的機身（在出發站、去回整段前後 75 分沒有別的勤務、過站時間夠）」的機型。選一個固定機型，或勾一個以上當 '+Q+' 輪替（兩種擇一，至少選一個）。':'Only types with a free tail on every one of the first operating days are listed. Choose one fixed type, or one or more EQV types.')+'</p>'
      +(ok.length?'<div class="nf120-types">'+ok.map(function(r){var fx=p.fixed===r.t,eq=(p.eqv||[]).indexOf(r.t)>=0;return '<div class="nf120-type'+(fx||eq?' on':'')+'"><b>'+E(r.t)+'</b><small>'+E(nm(r.t))+'</small><em>'+(zh?'每天至少 '+r.free+' 架空機身':r.free+' tails free daily')+'</em>'
          +'<div><button type="button" class="btn btn-sm'+(fx?' btn-g':'')+'" onclick="kgmNfPickR1120A(\'fixed\',\''+r.t+'\')">'+(fx?'✓ ':'')+(zh?'固定機型':'Fixed')+'</button><button type="button" class="btn btn-sm'+(eq?' btn-g':'')+'" onclick="kgmNfPickR1120A(\'eqv\',\''+r.t+'\')">'+(eq?'✓ ':'')+Q+'</button></div></div>'}).join('')+'</div>'
        :'<div class="k57-needap">'+(zh?'沒有機型在這個時間每天都排得開。請回第一步改時間或營運日。':'No type fits; change the times or days.')+'</div>')
      +(no.length?'<details class="nf120-no"><summary>'+(zh?'不能飛的機型（'+no.length+'）':'Not possible ('+no.length+')')+'</summary>'+no.map(function(r){return '<span>'+E(r.t)+'：'+E(r.why)+'</span>'}).join('')+'</details>':'')
      +'<div class="nf120-act"><span class="nf120-sel">'+(p.fixed?(zh?'固定機型：':'Fixed: ')+E(p.fixed):((p.eqv||[]).length?Q+'：'+E(p.eqv.join('／')):(zh?'尚未選機型':'No aircraft chosen')))+'</span><button type="button" class="btn btn-g" onclick="kgmNfCreateR1120A()"'+(ok.length?'':' disabled')+'>'+(zh?'建立去回兩班並排進機隊':'Create both legs and schedule')+'</button></div></section>'}
  function hook(){var O=window.kgmNewRouteHtmlR57;if(typeof O!=='function'||O.__nf120)return;var w=function(){try{return weekCard()+wizard()}catch(e){try{console.warn('nf120',e)}catch(_){}return O.apply(this,arguments)}};w.__nf120=1;w._old=O;window.kgmNewRouteHtmlR57=w}
  hook();[0,1500,5000].forEach(function(t){setTimeout(hook,t)});
  /* 欄位一改就寫回 S（背景重畫會整頁換掉，只放在 DOM 的值會不見——機場選擇器 ap25 選好也是觸發 input／change） */
  function keep(ev){try{var id=(ev.target&&ev.target.id)||'';if(/^nf1/.test(id)&&document.getElementById('nf1Fr'))readS1();else if(/^nfWk/.test(id)&&document.getElementById('nfWkCode'))window.kgmWeekOpsReadR1120A()}catch(_){}}
  document.addEventListener('input',keep,true);document.addEventListener('change',keep,true);
  /* 1120A 起 S.eqvPoolR198 會存檔；新建航班的 EQV 池在航班本身也存一份（舊瀏覽器資料補回） */
  setTimeout(function(){try{var st=window.kgmEqvPoolStoreR198?window.kgmEqvPoolStoreR198():null;if(!st)return;(S.customFlights||[]).forEach(function(f){if(f&&f.eqvPoolR1120A&&!st[f.code+'|'+f.fr+'|'+f.to])st[f.code+'|'+f.fr+'|'+f.to]={summer:f.eqvPoolR1120A.slice(),winter:f.eqvPoolR1120A.slice()}})}catch(_){}},2000);
  var CSS='.nf120-q{font-style:normal}.nf120-q:after{content:"EQV"}.nf120-card .nf120-steps{display:flex;gap:10px;list-style:none;margin:10px 0 14px;padding:0}.nf120-steps li{display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:#f2f5f3;color:#6a7a72;font-size:13px;font-weight:700}.nf120-steps li i{font-style:normal;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#dfe7e2;font-size:12px}.nf120-steps li.on{background:#0B3D2E;color:#fff}.nf120-steps li.on i{background:#C9A24F;color:#0B2A20}.nf120-steps li.ok i{background:#cfe6da}'
    +'.nf120-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 14px}.nf120-grid label,.nf120-row label{display:flex;flex-direction:column;gap:5px}.nf120-grid label>span,.nf120-row label>span{font-size:11.5px;font-weight:700;color:#5d6b64;letter-spacing:.04em}.nf120-in{display:flex;gap:6px}.nf120-in .inp{flex:1}'
    +'.nf120-days,.nf120-sell{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin:14px 0 0}.nf120-days>span,.nf120-sell>span{font-size:11.5px;font-weight:800;color:#8A7444;letter-spacing:.08em;min-width:52px}.nf120-days label,.nf120-sell label{display:inline-flex;align-items:center;gap:5px;font-size:13px;padding:6px 10px;border:1px solid #e1e8e4;border-radius:10px;background:#fff;cursor:pointer}.nf120-days label small{color:#8b958f;margin-left:3px}'
    +'.nf120-act{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:16px;flex-wrap:wrap}.nf120-sel{font-size:13px;color:#33413a;font-weight:700;margin-right:auto}'
    +'.nf120-sum{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:10px 14px;border-radius:12px;background:#f6f9f7;border:1px solid #e1e8e4;margin-bottom:10px}.nf120-sum b{font-size:14px;color:#0B3D2E}.nf120-sum span{font-size:12.5px;color:#5d6b64}.nf120-sum .btn{margin-left:auto}'
    +'.nf120-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}.nf120-type{border:1px solid #e1e8e4;border-radius:14px;padding:12px 14px;background:#fff;display:flex;flex-direction:column;gap:4px}.nf120-type.on{border-color:#0B3D2E;box-shadow:0 0 0 1px #0B3D2E inset}.nf120-type b{font-size:16px;color:#0B3D2E}.nf120-type small{color:#6a7a72}.nf120-type em{font-style:normal;font-size:12px;color:#1f6b52}.nf120-type div{display:flex;gap:6px;margin-top:6px}'
    +'.nf120-no{margin-top:10px;font-size:12.5px;color:#6a7a72}.nf120-no span{display:block;padding:2px 0}'
    +'.nf120-row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px}.nf120-wk{margin-top:12px;padding:12px 14px;border:1px solid #e1e8e4;border-radius:12px;background:#fbfcfb}.nf120-wk>b{font-size:13.5px;color:#0B3D2E}.nf120-pair{display:flex;gap:6px;align-items:center;margin-top:10px;font-size:13px}'
    +'.nf120-list{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px 10px;font-size:12.5px}.nf120-list b{width:100%;color:#8A7444;font-size:11.5px;letter-spacing:.06em}.nf120-list span{padding:4px 10px;border-radius:999px;background:#f2f5f3}'
    +'@media(max-width:900px){.nf120-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}';
  try{var st=document.createElement('style');st.id='nf120-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
