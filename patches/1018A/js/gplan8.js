/* ══ 1008A：地勤單一派工引擎（桃園／松山）══════════════════════════════════
   使用者：「我在後台看到圖一有四個航班結果圖二櫃檯2只有兩個航班 然後為什麼地勤這麼經常會沒有航班
   這樣太多人都擠在那裡了吧（排班時間可能每個人客製化直接要更好）然後工作內容很vague」
   原因：櫃檯頁的「當班地勤」（r102／r138 依班別挑人）與個人班表（r194 把 8 小時硬切三段、
   再去畫面上撈航班）是兩份互不相干的資料，個人班表的航班是猜出來的，沒有航班的時段就寫一段空話。
   現在改成一天一份派工計畫，櫃檯頁、個人班表、週班表都讀同一份：
     ① 工作只有三種，而且全部來自當天真的航班：報到櫃檯（櫃檯分配表的每一列）、
        登機門（每一班 KGM 出發）、到站（每一班 KGM 抵達：機門接機與行李轉盤）。
     ② 依時間順序把工作排給人：先排每項工作的最少人力，再補到建議人力；
        優先接在同一個人前一項工作後面（減少空等），接不上才開一個新的人。
     ③ 每個人的班別＝第一項工作前 15 分鐘報到，到最後一項工作後 15 分鐘交接 → 每人客製，
        班別長度上限 9 小時、工時上限 8 小時、連續工作 4.5 小時內一定有 30 分鐘以上用餐。
        仍沿用原本的週休二日與早／中／晚班輪替（只在那個班別的時間帶內排），同一天只待一個航廈。
     ④ 排不到工作的人＝備勤（在家待命，不到機場），不再派去「旅客服務台」空等。 */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
function hm(v){v=((Math.round(v)%1440)+1440)%1440;
  return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
function H(s){var x=2166136261;s=String(s);for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
function dur(m){m=Math.max(0,Math.round(m));var h=Math.floor(m/60),r=m%60;
  if(!h)return z()?(r+' 分'):(r+'m');
  return z()?(h+' 小時'+(r?(' '+r+' 分'):'')):(h+'h'+(r?(' '+String(r).padStart(2,'0')+'m'):''))}
function termName(t){var m=/^T(\d)$/.exec(String(t||''));return m?(z()?('第 '+m[1]+' 航廈'):('Terminal '+m[1])):String(t||'')}
function wide8(ty){return /^(B77|B78|A35|A33|A34|A38)/.test(String(ty||''))}

var BUSY8=false,CACHE8={},CN8=0;
var ORIG8=null,DUTY08=null;

/* 這個人屬於哪一站（只有桃園／松山是 KGM 自己的地勤） */
function station8(id){
  try{var p=staffOf8(id);if(!p||p.role!=='ground'||p.active===false)return null}catch(_){return null}
  try{if(window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(id))return 'TSA'}catch(_){}
  return 'TPE';
}
var SIDX8=null,SIDXN8=-1;
function staffOf8(id){
  var L=(S.staff||[]);
  if(!SIDX8||SIDXN8!==L.length){SIDX8={};L.forEach(function(p){if(p&&p.empId)SIDX8[p.empId]=p});SIDXN8=L.length}
  return SIDX8[id]||null;
}
function poolOf8(ap){
  return (S.staff||[]).filter(function(x){
    if(!x||x.role!=='ground'||x.active===false)return false;
    var t=false;try{t=!!(window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(x.empId))}catch(_){}
    return (ap==='TSA')===t;
  });
}
function stamp8(){
  var a=0,b=0;try{a=(S.staff||[]).length;b=(S.customFlights||[]).length}catch(_){}
  return a+'|'+b+'|'+(z()?'z':'e');
}

/* ── 工作項目 ───────────────────────────────────────────────────── */
var POS_CTR=[
  {t:'櫃檯組長',e:'Counter lead',d:'開櫃前系統與行李秤檢查、超賣與候補處理、關櫃後尾差回報',de:'Pre-opening system and scale checks, oversale/standby, close-out figures'},
  {t:'證照查驗',e:'Document check',d:'核對護照、簽證與 APIS，發登機證',de:'Passports, visas and APIS; issue boarding passes'},
  {t:'行李收運',e:'Baggage acceptance',d:'秤重、掛牌、超重／超件收費、危險品詢問',de:'Weigh and tag bags, excess fees, dangerous-goods questions'},
  {t:'優先報到',e:'Priority check-in',d:'商務艙與 Elite 會員報到、貴賓室邀請函、優先行李牌',de:'Business and Elite check-in, lounge invitations, priority tags'},
  {t:'特殊旅客',e:'Special assistance',d:'輪椅、無成人陪伴兒童、孕婦與寵物託運文件',de:'Wheelchairs, unaccompanied minors, pets and medical forms'},
  {t:'排隊分流',e:'Queue control',d:'引導自助報到與自助託運，先攔下證件不全的旅客',de:'Kiosk and bag-drop guidance; catch incomplete documents early'},
  {t:'超大行李',e:'Oversize bags',d:'超大行李送 X 光、行李件數與尾差核對',de:'Oversize bags to X-ray; bag counts and late figures'}
];
var POS_GATE=[
  {t:'登機門組長',e:'Gate lead',d:'與座艙長交接艙單、核對最終人數、關機門',de:'Hand over the load sheet, reconcile final count, close the door'},
  {t:'登機證掃描',e:'Boarding scan',d:'分區登機、登機證與護照複核、未登機旅客廣播',de:'Zoned boarding, pass and passport check, no-show calls'},
  {t:'機邊與輪椅',e:'Aircraft side',d:'機邊行李（嬰兒車、輪椅）、需協助旅客優先登機',de:'Gate-delivered items and assisted boarding'},
  {t:'候補與座位',e:'Standby & seats',d:'候補與員工票放行、座位調整、升等名單',de:'Standby and staff clearance, seat changes, upgrades'}
];
var POS_ARR=[
  {t:'機門接機',e:'Meet at door',d:'機門接輪椅與無成人陪伴兒童、轉機旅客指引到轉機櫃檯',de:'Wheelchairs and minors at the door; transfer guidance'},
  {t:'行李轉盤',e:'Baggage belt',d:'盯轉盤、延誤／破損行李登記（PIR）、優先行李核對',de:'Watch the belt, file delayed/damaged bag reports, priority bags'}
];
function needCtr8(ap,n,a388){
  if(ap==='TSA')return {min:n>=2?2:1,ideal:n>=3?3:(n===2?3:2)};
  var ideal=n>=3?5:(n===2?4:3);if(a388)ideal++;
  return {min:n>=3?3:2,ideal:ideal};
}

function deps8(ap,date){
  /* 櫃檯分配表本身（同一份，櫃檯頁就是畫這份） */
  var rows=[];
  for(var s=0;s<8;s++){
    var r=null;try{r=ORIG8(ap,date,s)}catch(_){r=null}
    rows.push(r);
  }
  return rows;
}
function arrivals8(ap,date){
  var out=[],seen={},dt=new Date(date+'T12:00:00');
  try{
    [].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){
      if(!f||f.via||f.partner||f.to!==ap)return;
      try{if(!flyOn(f,dt))return}catch(_){return}
      var sf=f;try{sf=window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(f,date)||f):f}catch(_){}
      var k=f.code+'|'+f.fr;if(seen[k])return;seen[k]=1;
      var a=mn(sf.arr||f.arr);if(a<180)a+=1440;   /* 凌晨三點前落地的算當晚的晚班 */
      var ty='';try{ty=acftOfFlight(f.code,date,f.fr,f.to)||f.acft}catch(_){ty=f.acft}
      var tm='T1';try{tm=terminalForFlight(f)||'T1'}catch(_){}
      if(ap==='TSA')tm='T1';
      out.push({code:f.code,fr:f.fr,to:f.to,arr:sf.arr||f.arr,m:a,type:ty,term:tm});
    });
  }catch(_){}
  return out;
}

function tasks8(ap,date,slots){
  var T8=[];
  slots.forEach(function(r,s){
    ((r&&r.rows)||[]).forEach(function(row,ri){
      var fl=row.flights||[];if(!fl.length)return;
      var a=mn(row.open),b=mn(row.close);if(b<a)b+=1440;
      var a388=fl.some(function(f){return f&&f.type==='A388'});
      var nd=needCtr8(ap,fl.length,a388);
      var term=(ap==='TSA')?'T1':String(row.term||'T1');
      /* 開櫃超過 3 小時的櫃檯分成前後兩組人交接（不讓同一個人連站 4 小時以上） */
      var A0=a-15,B0=b+10,np=(B0-A0)>200?2:1,cut=Math.round((A0+(B0-A0)/np)/5)*5;
      for(var pi=0;pi<np;pi++)
        T8.push({kind:'ctr',key:'c|'+s+'|'+ri+(np>1?('|'+pi):''),row:'c|'+s+'|'+ri,part:np>1?pi+1:0,parts:np,slot:s,ri:ri,term:term,loc:'C'+term+row.counter,counter:String(row.counter),
          flights:fl,a:pi?cut:A0,b:(np>1&&!pi)?cut:B0,min:nd.min,ideal:nd.ideal,who:[]});
      /* 登機門：同一列的每一班（聯營班由營運航空自己的地勤登機，不排 KGM 的人） */
      fl.forEach(function(f){
        if(!f||f.partner)return;
        var d=mn(f.dep);try{var sf=window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,date):null;if(sf&&sf.dep)d=mn(sf.dep)}catch(_){}
        if(d<f.open)d+=1440;
        var g=null;try{g=window.kgmGateOfR26&&window.kgmGateOfR26(f.code,date)}catch(_){}
        var gate=(g&&(g.gate||g.stand))||'';
        var gt=(g&&g.terminal)||term;if(ap==='TSA')gt='T1';
        var big=f.type==='A388',wd=wide8(f.type);
        T8.push({kind:'gate',key:'g|'+f.code,term:gt,loc:'G'+gate,gate:gate,flights:[f],dep:hm(d),
          a:d-(big?80:(wd?65:50)),b:d+10,min:big?3:2,ideal:big?4:(wd?3:2),who:[]});
      });
    });
  });
  arrivals8(ap,date).forEach(function(f){
    var wd=wide8(f.type);
    T8.push({kind:'arr',key:'a|'+f.code,term:f.term,loc:'A'+f.term,flights:[f],a:f.m-15,b:f.m+(wd?45:35),
      min:0,ideal:wd?2:1,who:[]});
  });
  /* 凌晨 03:00 以前的工作算在當天晚班的尾巴（一個營運日 03:00 到隔天 03:00） */
  T8.forEach(function(t){if(t.a<180){t.a+=1440;t.b+=1440}});
  var pr={ctr:0,gate:1,arr:2};
  T8.sort(function(x,y){return x.a-y.a||pr[x.kind]-pr[y.kind]||String(x.key).localeCompare(String(y.key))});
  return T8;
}

/* ── 人 ─────────────────────────────────────────────────────────── */
/* 班別時間帶：航班集中在早上 06–10 點與下午 15–19 點，所以時間帶依航班量配人
   （三成清晨、三成早上、兩成中午、兩成晚上），以週為單位輪替，同一週每天都在同一個時間帶，
   前後兩天的下班到上班一定超過 11 小時（勞基法第 34 條）。例休日沿用原本的週休二日。 */
var BANDS8=[{k:'early',w:[180,840]},{k:'day',w:[390,1050]},{k:'mid',w:[660,1320]},{k:'late',w:[960,1650]}];
/* 預排（還沒到派工的日子）：每個時間帶的代表時段，正式上下班時間前一天依航班排定 */
var PREV8={early:{k:'early',zh:'早班',en:'Early',from:'04:30',to:'12:30'},day:{k:'early',zh:'早班',en:'Early',from:'07:00',to:'15:00'},
  mid:{k:'mid',zh:'中班',en:'Mid',from:'12:00',to:'20:00'},late:{k:'late',zh:'晚班',en:'Late',from:'18:00',to:'02:00'}};
var ROT8=[0,0,0,1,1,1,2,2,3,3],ROT8TSA=[0,0,1,1,2];   /* 松山沒有夜間航班：只有清晨／早上／中午 */
function week8(date){try{return Math.floor((Date.parse(date+'T00:00:00Z')/86400000+4)/7)}catch(_){return 0}}
window.kgmGroundBandR1008A=function(id,date){
  var R=ROT8;try{if(window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(id))R=ROT8TSA}catch(_){}
  return BANDS8[R[(week8(date)+H('b8|'+id))%R.length]]};
function person8(p,date){
  var d=null;try{d=DUTY08(p.empId,date)}catch(_){d=null}
  if(!d||d.off)return {id:p.empId,p:p,off:true,base:d};
  var bd=window.kgmGroundBandR1008A(p.empId,date);
  return {id:p.empId,p:p,off:false,base:d,band:bd.k,win0:bd.w[0],win1:bd.w[1],term:null,tasks:[],work:0,first:null,last:null,
    ord:H(p.empId+'|'+date)};
}
var MAXSPAN=540,MAXWORK=480,MAXRUN=270,BRK=30;
function ok8(P,t,maxGap){
  if(P.off)return false;
  if(t.a<P.win0||t.b>P.win1)return false;
  if(P.term&&P.term!==t.term)return false;
  if(P.work+(t.b-t.a)>MAXWORK)return false;
  if(P.tasks.length){
    var f=Math.min(P.first,t.a),l=Math.max(P.last,t.b);
    if((l+15)-(f-15)>MAXSPAN)return false;
    if(maxGap!=null&&t.a>P.last&&t.a-P.last>maxGap)return false;
    if(maxGap!=null&&t.b<P.first&&P.first-t.b>maxGap)return false;
    var L=P.tasks.concat([t]).sort(function(x,y){return x.a-y.a});
    for(var i=1;i<L.length;i++){
      var mv=(L[i].loc===L[i-1].loc)?0:10;
      if(L[i].a<L[i-1].b+mv)return false;
    }
    var rs=L[0].a;
    for(var j=0;j<L.length;j++){
      if(j&&L[j].a-L[j-1].b>=BRK)rs=L[j].a;
      if(L[j].b-rs>MAXRUN)return false;
    }
  }
  return true;
}
function cost8(P,t){
  if(!P.tasks.length)return 95+(t.a-P.win0)/12;
  var g=0;
  if(t.a>=P.last)g=t.a-P.last;else if(t.b<=P.first)g=P.first-t.b;
  return g+P.work/120;
}
function add8(P,t){
  P.tasks.push(t);P.tasks.sort(function(x,y){return x.a-y.a});
  P.work+=(t.b-t.a);P.term=P.term||t.term;
  P.first=P.first==null?t.a:Math.min(P.first,t.a);P.last=P.last==null?t.b:Math.max(P.last,t.b);
  t.who.push(P.id);
}
var PRI8={ctr:18,gate:12,arr:0};
function chain8(P,tasks,level,kinds){
  for(var guard=0;guard<40;guard++){
    var best=null,bc=1e9;
    var rs=null;
    if(P.tasks.length){rs=P.tasks[0].a;for(var j=1;j<P.tasks.length;j++)if(P.tasks[j].a-P.tasks[j-1].b>=BRK)rs=P.tasks[j].a}
    for(var i=0;i<tasks.length;i++){
      var t=tasks[i],need=level==='min'?t.min:t.ideal;
      if(t.who.length>=need||t.who.indexOf(P.id)>=0)continue;
      if(kinds&&kinds.indexOf(t.kind)<0)continue;
      var g;
      if(!P.tasks.length){if(t.a<P.win0)continue;g=(t.a-P.win0)/4}
      else if(t.a>=P.last){g=t.a-P.last;if(g>75)continue;
        /* 連續工作 3.5 小時以上，下一項最好留 30–60 分鐘給他吃飯 */
        if(P.last-rs>=210)g=(g>=BRK&&g<=60)?g-25:g+25}
      else if(t.b<=P.first){g=P.first-t.b;if(g>75)continue}
      else g=-5;   /* 正好塞進現有的空檔 */
      g-=(t.who.length<t.min?PRI8[t.kind]:0);
      if(g>=bc)continue;
      if(!ok8(P,t,null))continue;
      bc=g;best=t;
    }
    if(!best)return;
    add8(P,best);
  }
}
function undo8(P){
  P.tasks.forEach(function(t){t.who=t.who.filter(function(x){return x!==P.id})});
  P.tasks=[];P.work=0;P.first=P.last=null;P.term=null;
}
function pick8(people,t,allowNew,maxGap){
  var best=null,bc=1e9;
  for(var i=0;i<people.length;i++){
    var P=people[i];
    if(P.off||t.who.indexOf(P.id)>=0)continue;
    if(!P.tasks.length&&!allowNew)continue;
    if(!ok8(P,t,maxGap))continue;
    var c=cost8(P,t)+(P.ord%97)/1000;
    if(c<bc){bc=c;best=P}
  }
  return best;
}

function build8(ap,date){
  var slots=deps8(ap,date);
  var tasks=tasks8(ap,date,slots);
  var people=poolOf8(ap).map(function(p){return person8(p,date)});
  /* 一個人一個人排：從他班別時間帶裡最早還缺人的工作開始，接著挑「接得最緊」的下一項，
     直到班別長度／工時／用餐規則不允許為止（像排一條公車路線），所以每個人的班是連續的。
     ① 先只排「還沒到最少人力」的工作；② 已經在上班的人再把空檔補到建議人力；
     ③ 還沒排到的人才拿剩下的建議人力。 */
  people.sort(function(x,y){return (x.off?1:0)-(y.off?1:0)||(x.win0||0)-(y.win0||0)||x.ord-y.ord});
  people.forEach(function(P){if(!P.off)chain8(P,tasks,'min')});
  /* 補到建議人力的順序：報到櫃檯 → 登機門 → 到站 */
  [['ctr'],['ctr','gate'],['ctr','gate','arr']].forEach(function(ks){
    people.forEach(function(P){if(!P.off&&P.tasks.length)chain8(P,tasks,'ideal',ks)});
    people.forEach(function(P){if(!P.off&&!P.tasks.length){chain8(P,tasks,'ideal',ks);if(P.work<210)undo8(P)}});   /* 為了補人力而叫一個人來機場，至少要有 3.5 小時的工作 */
  });
  /* ④ 工時太短（< 3 小時）的人：他身上的工作若都超過最少人力就整個釋放回備勤，
        免得叫一個人來機場只站一個登機門 */
  people.forEach(function(P){
    if(P.off||!P.tasks.length||P.work>=180)return;
    if(!P.tasks.every(function(t){return t.who.length>t.min}))return;
    undo8(P);
  });
  var by={};people.forEach(function(P){by[P.id]=P});
  /* 每項工作裡每個人的位置（依員編排序後固定，組長由排第一的人擔任） */
  tasks.forEach(function(t){
    t.who.sort(function(x,y){return (by[y].work-by[x].work)||String(x).localeCompare(String(y))});
  });
  people.forEach(function(P){
    if(P.off)return;
    if(!P.tasks.length){P.reserve=true;return}
    var f=Math.floor((P.first-15)/5)*5,l=Math.ceil((P.last+15)/5)*5;
    P.from=f;P.to=l;
    P.k=f<9*60?'early':(f<15*60?'mid':'late');
    /* 用餐：第一個 30 分鐘以上的空檔 */
    for(var i=1;i<P.tasks.length;i++){
      if(P.tasks[i].a-P.tasks[i-1].b>=BRK){P.meal=[P.tasks[i-1].b,Math.min(P.tasks[i].a,P.tasks[i-1].b+45)];break}
    }
  });
  /* 櫃檯分配表（給櫃檯頁）：只換人，櫃檯、航班、開關櫃時間不動 */
  var alloc=slots.map(function(r,s){
    if(!r)return r;
    var o=Object.assign({},r);
    o.rows=(r.rows||[]).map(function(row,ri){
      var parts=tasks.filter(function(x){return x.row==='c|'+s+'|'+ri});
      var nr=Object.assign({},row);
      if(!parts.length)return nr;
      var st=[],du=[];
      parts.forEach(function(t){
        t.who.forEach(function(id,i){
          var P=by[id],pos=POS_CTR[i%POS_CTR.length];
          if(st.some(function(x){return x.empId===id}))return;
          st.push(Object.assign({},P.p,{job:(z()?('報到櫃檯・'+pos.t):('Check-in · '+pos.e))+' '+hm(t.a)+'–'+hm(t.b),
            shiftR102:hm(P.from)+'–'+hm(P.to),shiftR1008A:hm(P.from)+'–'+hm(P.to),dutyR1008A:hm(t.a)+'–'+hm(t.b)}));
          du.push({who:P.p.name||id,empId:id,task:z()?pos.t:pos.e,detail:z()?pos.d:pos.de,from:hm(t.a),to:hm(t.b)});
        });
      });
      nr.staff=st;nr.duties=du;nr.needR1008A=parts[0].ideal;nr.minR1008A=parts[0].min;nr.partsR1008A=parts.length;
      return nr;
    });
    o.planR1008A=true;
    return o;
  });
  var short=tasks.filter(function(t){return t.who.length<t.min}).map(function(t){return t.key});
  var res={ap:ap,date:date,tasks:tasks,people:by,alloc:alloc,short:short,
    working:people.filter(function(P){return !P.off&&P.tasks.length}).length,
    reserve:people.filter(function(P){return P.reserve}).length,
    off:people.filter(function(P){return P.off}).length};
  return res;
}
function plan8(ap,date){
  ap=String(ap||'TPE').toUpperCase();date=date||T();
  if(ap!=='TPE'&&ap!=='TSA')return null;
  if(!ORIG8||!DUTY08)return null;
  var k=ap+'|'+date+'|'+stamp8();
  if(CACHE8[k])return CACHE8[k];
  if(BUSY8)return null;
  BUSY8=true;window.KGM_GPLAN_BUSY_R1008A=true;
  var P=null;
  try{P=build8(ap,date)}catch(e){try{console.warn('gplan8',e)}catch(_){}P=null}
  BUSY8=false;window.KGM_GPLAN_BUSY_R1008A=false;
  if(!P)return null;
  if(CN8>40){CACHE8={};CN8=0}
  CACHE8[k]=P;CN8++;
  return P;
}
window.kgmGroundPlanR1008A=plan8;
window.kgmGroundPlanClearR1008A=function(){CACHE8={};CN8=0};

/* ── 人力：桃園每天約 135 班出發、140 班抵達，報到櫃檯＋登機門的最少人力在早上 7 點同時要 90 人左右，
   原本全站只有 139 位地勤（松山 12 位），排不出來（舊版是讓同一個人同時掛兩個櫃檯、再用「旅客服務台」填空檔）。
   依同一套作法（既有的 groundPool 系列也是自動補足模擬地勤）補到桃園約 270、松山 20 位；
   員編與姓名固定（前台與後台兩個檔案算出來一模一樣，同步不會亂）。 */
var GTARGET8=290,FN8=['Yu-Chen','Chia-Hao','Mei-Ling','Wei-Ting','Kai-Hsun','Pei-Yun','Chih-Wei','Hsin-Yi','Jia-En','Tzu-Han','Yi-Ting','Po-Han','Shu-Fen','Cheng-En','Ya-Wen','Kuan-Yu','Hui-Ling','Tsung-Han','Pin-Yu','Yu-Hsuan','James','Emily','Natalie','Ryan','Chloe','Daniel'];
var LN8=['Wu','Lin','Chen','Huang','Chang','Tsai','Lee','Wang','Hsu','Kuo','Yeh','Liu','Yang','Cheng','Hsieh','Lai','Chou','Su','Lu','Hung'];
function ensureStaff8(){
  try{
    S.staff=S.staff||[];
    var G=S.staff.filter(function(x){return x&&x.role==='ground'&&x.active!==false});
    if(G.length>=GTARGET8)return 0;
    var have={};S.staff.forEach(function(x){if(x&&x.empId)have[x.empId]=1});
    var n=0,i=0;
    while(G.length+n<GTARGET8&&i<2000){
      var id='KG'+String(65000+i);i++;
      if(have[id])continue;
      var h=H(id+'|n8');
      var hd=new Date(Date.UTC(2014+(h%12),(h>>4)%12,1+((h>>8)%27))).toISOString().slice(0,10);
      S.staff.push({empId:id,name:FN8[h%FN8.length]+' '+LN8[(h>>5)%LN8.length],email:id.toLowerCase()+'@kgm-airways.test',
        role:'ground',password:'demo',hireDate:hd,active:true,base:'TPE',station:'TPE',dependents:[],simulated:true,groundGeneratedR1008A:true});
      have[id]=1;n++;
    }
    if(n){SIDX8=null;try{save()}catch(_){}}
    return n;
  }catch(_){return 0}
}
window.kgmGroundEnsureStaffR1008A=ensureStaff8;

/* ── 接到既有的兩個入口上（櫃檯分配表、個人班別），全站都讀這一份 ────── */
function install8(){
  if(window.kgmGroundPlanInstalledR1008A)return false;
  if(typeof window.kgmCounterAllocR74!=='function'||typeof window.kgmGroundDutyR99!=='function')return false;
  ORIG8=window.kgmCounterAllocR74;DUTY08=window.kgmGroundDutyR99;
  ensureStaff8();
  window.kgmCounterAllocR74=function(ap,date,slot){
    var A=String(ap||'TPE').toUpperCase();
    if(BUSY8||(A!=='TPE'&&A!=='TSA'))return ORIG8.apply(this,arguments);
    var P=plan8(A,date||T());
    var r=P&&P.alloc[+slot];
    if(!r)return ORIG8.apply(this,arguments);
    var o=Object.assign({},r);o.rows=(r.rows||[]).map(function(x){return Object.assign({},x)});
    return o;
  };
  window.kgmCounterAllocR74.__r1008A=1;
  var duty=function(id,date){
    var d=DUTY08.apply(this,arguments);
    if(BUSY8||!d||d.off)return d;
    try{
      var ap=station8(id);if(!ap)return d;
      /* 派工（實際上下班時間）只排到明天，跟櫃檯分配頁可查的日期一樣；更早或更晚的日子顯示預排的時間帶 */
      var td=T(),gap=Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(td+'T00:00:00Z'))/864e5);
      if(!(gap>=-2&&gap<=1)){
        var bd=window.kgmGroundBandR1008A(id,date),pv=PREV8[bd.k];
        return {off:false,k:pv.k,label:z()?pv.zh:pv.en,from:pv.from,to:pv.to,hours:8,previewR1008A:true,bandR1008A:bd.k,
          baseR1008A:d.from+'–'+d.to};
      }
      var P=plan8(ap,date);if(!P)return d;
      var q=P.people[id];if(!q||q.off)return d;
      if(q.reserve)return {off:false,k:d.k,label:z()?'備勤':'Reserve',from:d.from,to:d.to,hours:0,
        reserveR1008A:true,planR1008A:true,baseR1008A:d.from+'–'+d.to};
      var lab={early:['早班','Early'],mid:['中班','Mid'],late:['晚班','Late']}[q.k];
      return {off:false,k:q.k,label:z()?lab[0]:lab[1],from:hm(q.from),to:hm(q.to),
        hours:Math.round((q.to-q.from)/6)/10,workMinsR1008A:q.work,planR1008A:true,termR1008A:q.term,
        baseR1008A:d.from+'–'+d.to};
    }catch(_){}
    return d;
  };
  window.kgmGroundDutyR99=duty;window.kgmGroundShiftR90=duty;
  window.kgmGroundShiftLabelR90=function(id,date){
    var s=window.kgmGroundDutyR99(id,date);
    if(s.off)return s.label;
    if(s.reserveR1008A)return s.label+'　'+s.from+'–'+s.to+(z()?'（在家待命）':' (on call)');
    return s.label+'　'+s.from+'–'+s.to+'（'+s.hours+'h）';
  };
  window.kgmGroundPlanInstalledR1008A=true;
  return true;
}
install8();
setTimeout(install8,0);

/* ── 個人班表（後台「櫃檯分配與地勤行事曆」的個人區塊）──────────── */
function flTxt8(f,kind){
  if(!f)return '';
  if(kind==='arr')return f.code+' '+f.fr+'→'+f.to+(z()?(' '+f.arr+' 抵達'):(' arr '+f.arr))+(f.type&&!/^CS_/.test(f.type)?' · '+f.type:'');
  return f.code+' '+f.fr+'→'+f.to+(z()?(' '+f.dep+' 起飛'):(' dep '+f.dep))+(f.type?' · '+f.type:'');
}
window.kgmGroundPeopleR1008A=function(ap,date){
  var P=plan8(ap,date);if(!P)return null;
  var ids=Object.keys(P.people);
  var rank=function(q){return q.off?2:(q.reserve?1:0)};
  ids.sort(function(a,b){var x=P.people[a],y=P.people[b];
    return rank(x)-rank(y)||((x.from||0)-(y.from||0))||String(a).localeCompare(String(b))});
  return ids.map(function(id){var q=P.people[id];
    return {empId:id,name:q.p.name||id,p:q.p,off:q.off,reserve:!!q.reserve,
      label:q.off?(z()?'例休':'Rest day'):(q.reserve?(z()?'備勤':'Reserve'):(hm(q.from)+'–'+hm(q.to))),
      tasks:q.tasks||[]}});
};
window.kgmGroundJobsR1008A=function(ap,date,id){
  var P=plan8(ap,date);if(!P)return null;
  var q=P.people[id];
  if(!q)return '<div class="k74-person-jobs k8-jobs"><div class="k74-empty">'+(z()?'這位同仁不屬於本站。':'Not on this station.')+'</div></div>';
  if(q.off)return '<div class="k74-person-jobs k8-jobs"><div class="k74-empty">'+(z()?'本日例休（每週固定連休兩天）。':'Rest day.')+'</div></div>';
  if(q.reserve){
    var b=q.base||{};
    return '<div class="k74-person-jobs k8-jobs"><div class="k8-reserve"><b>'+(z()?'本日備勤':'Reserve today')+'</b><span>'
      +(z()?('在家待命 '+E(b.from)+'–'+E(b.to)+'；當天的櫃檯、登機門與到站人力已排滿，接到通知 60 分鐘內到場（例如航班延誤、併班或同仁請假）。不到機場就不會在現場空等。')
           :('On call '+E(b.from)+'–'+E(b.to)+'; every counter, gate and arrival is already staffed. Report within 60 minutes if called.'))
      +'</span></div></div>';
  }
  var rows=[],prev=null,mealDone=false;
  q.tasks.forEach(function(t){
    if(prev){
      var gap=t.a-prev.b;
      if(gap>=BRK&&!mealDone){mealDone=true;
        rows.push('<article class="k8-break"><time>'+hm(prev.b)+'–'+hm(Math.min(t.a,prev.b+45))+'</time><div><b>'+(z()?'用餐休息':'Meal break')+'</b><span>'
          +(z()?('員工餐廳（'+termName(q.term)+' 管制區內）；'+dur(t.a-prev.b)+'後接下一項工作'):('Staff canteen; next duty in '+dur(t.a-prev.b)))+'</span></div><em>'+dur(Math.min(t.a,prev.b+45)-prev.b)+'</em></article>');
      }else if(gap>=20){
        rows.push('<article class="k8-break"><time>'+hm(prev.b)+'–'+hm(t.a)+'</time><div><b>'+(z()?'移動與交接':'Transfer & handover')+'</b><span>'
          +(z()?('前往下一個崗位、交接前一班的尾差與特殊旅客'):('Move to the next post; hand over late figures and special cases'))+'</span></div><em>'+dur(gap)+'</em></article>');
      }
    }
    var idx=t.who.indexOf(id),pos,where,fl;
    if(t.kind==='ctr'){
      pos=POS_CTR[Math.max(0,idx)%POS_CTR.length];
      where=termName(t.term)+' · '+(z()?'報到櫃檯 ':'Check-in counter ')+E(t.counter)
        +(t.part?(z()?(t.part===1?'（開櫃組，之後交接）':'（接手到關櫃）'):(t.part===1?' (opening team)':' (to closing)')):'');
      fl=t.flights.map(function(f){return E(flTxt8(f,'ctr'))}).join('<br>');
    }else if(t.kind==='gate'){
      pos=POS_GATE[Math.max(0,idx)%POS_GATE.length];
      where=termName(t.term)+' · '+(z()?'登機門 ':'Gate ')+E(t.gate||'—');
      fl=E(flTxt8(t.flights[0],'gate'));
    }else{
      pos=POS_ARR[Math.max(0,idx)%POS_ARR.length];
      where=termName(t.term)+' · '+(z()?'入境到站':'Arrivals');
      fl=E(flTxt8(t.flights[0],'arr'));
    }
    var kindTxt={ctr:z()?'報到':'Check-in',gate:z()?'登機':'Boarding',arr:z()?'到站':'Arrival'}[t.kind];
    rows.push('<article class="k8-'+t.kind+'"><time>'+hm(t.a)+'–'+hm(t.b)+'<i>'+kindTxt+'</i></time><div><b>'+where+'</b><span>'+fl+'</span><small><b>'
      +E(z()?pos.t:pos.e)+'</b>'+(t.who.length>1?(z()?('（共 '+t.who.length+' 人）'):(' ('+t.who.length+' staff)')):'')+' · '+E(z()?pos.d:pos.de)+'</small></div><em>'+dur(t.b-t.a)+'</em></article>');
    prev=t;
  });
  var nC=q.tasks.filter(function(t){return t.kind==='ctr'}).length,nG=q.tasks.filter(function(t){return t.kind==='gate'}).length,
      nA=q.tasks.filter(function(t){return t.kind==='arr'}).length;
  var head='<div class="k8-shift"><b>'+(z()?'今日派工':'Today\u2019s duties')+'</b><code>'+q.tasks.length+(z()?' 項':'')+'</code>'
    +'<span>'+(z()?('實際工時 '+dur(q.work)+' · 報到櫃檯 '+nC+' · 登機門 '+nG+' · 到站 '+nA):('Working '+dur(q.work)+' · counters '+nC+' · gates '+nG+' · arrivals '+nA))+'</span>'
    +'<span>'+(z()?(hm(q.from)+' 到'+termName(q.term)+'地勤辦公室簡報（第一項工作前 15 分鐘），'+hm(q.to)+' 交接下班'):('Brief at '+hm(q.from)+', hand over at '+hm(q.to)))+'</span></div>';
  return head+'<div class="k74-person-jobs k8-jobs">'+rows.join('')+'</div>';
};
/* 本站當日人力（取代原本「五個梯次上下班時間」那一張） */
window.kgmGroundStationHtmlR1008A=function(ap,date,id){
  ap=String(ap||'TPE').toUpperCase();if(ap!=='TPE'&&ap!=='TSA')return '';
  var P=plan8(ap,date);if(!P)return '';
  var n={ctr:0,gate:0,arr:0},sh={ctr:0,gate:0},pk=0,pkAt=0,ev={};
  var rows={};P.tasks.forEach(function(t){
    if(t.kind==='ctr'){rows[t.row]=1;if(t.who.length<t.min)sh.ctr++}else n[t.kind]++;
    if(t.kind==='gate'&&t.who.length<t.min)sh.gate++;
  });
  n.ctr=Object.keys(rows).length;
  Object.keys(P.people).forEach(function(k){var q=P.people[k];if(q.off||!q.tasks.length)return;
    for(var m=Math.floor(q.from/30)*30;m<q.to;m+=30)ev[m]=(ev[m]||0)+1});
  Object.keys(ev).forEach(function(m){if(ev[m]>pk){pk=ev[m];pkAt=+m}});
  var staffed=P.tasks.filter(function(t){return t.kind==='arr'&&t.who.length}).length;
  var tile=function(a,b,c){return '<div><small>'+a+'</small><b>'+b+'</b><i>'+c+'</i></div>'};
  return '<b>'+(z()?'本站當日人力（依航班排定）':'Station staffing today (built from flights)')+'</b>'
    +'<p>'+(z()?('每個人的上下班時間由他當天的工作決定，不再是固定梯次；當天工作排滿後，其餘同仁為備勤（在家待命）。'+(sh.ctr||sh.gate?('<b style="color:#A33">人力低於下限：報到櫃檯 '+sh.ctr+' 組、登機門 '+sh.gate+' 班。</b>'):''))
         :'Each person\u2019s hours follow their own duties; everyone else is on call.')+'</p>'
    +'<div class="k163-grid">'
      +tile(z()?'上班':'Working',P.working,z()?'人':'staff')
      +tile(z()?'備勤（在家）':'On call',P.reserve,z()?'人':'staff')
      +tile(z()?'例休':'Rest day',P.off,z()?'人':'staff')
      +tile(z()?'在場最多':'Peak on site',pk,(z()?'人 · ':'at ')+hm(pkAt))
      +tile(z()?'報到櫃檯':'Counters',n.ctr,z()?'組':'groups')
      +tile(z()?'登機門':'Gates',n.gate,z()?'班':'flights')
      +tile(z()?'到站服務':'Arrivals',staffed+'／'+n.arr,z()?'班有人接':'met')
    +'</div>';
};
/* 個人區塊的「職務」：今天實際做的事，不是固定崗位 */
window.kgmGroundRoleR1008A=function(ap,date,id){
  var P=plan8(ap,date);if(!P||!P.people[id])return '';
  var q=P.people[id];if(q.off)return z()?'旅客服務地勤・本日例休':'Passenger Service Agent · rest day';
  if(q.reserve)return z()?'旅客服務地勤・本日備勤':'Passenger Service Agent · reserve';
  var k={};q.tasks.forEach(function(t){k[t.kind]=1});
  var w=[];if(k.ctr)w.push(z()?'報到櫃檯':'check-in');if(k.gate)w.push(z()?'登機門':'gates');if(k.arr)w.push(z()?'到站':'arrivals');
  return (z()?'旅客服務地勤・':'Passenger Service Agent · ')+w.join(z()?'／':' / ');
};

try{
  if(!document.getElementById('kgm-r1008A-gplan-css')){
    var st=document.createElement('style');st.id='kgm-r1008A-gplan-css';
    st.textContent=
      '.k8-shift{display:flex;align-items:baseline;gap:6px 12px;flex-wrap:wrap;margin:0 0 9px;padding:10px 13px;border:1px solid #DCE6E0;border-radius:11px;background:#F4F9F6}'
     +'.k8-shift b{font-size:13px;color:#123C32;font-weight:900}.k8-shift code{font:900 13px ui-monospace,Menlo,monospace;color:#1F6F4A}'
     +'.k8-shift span{font-size:10.5px;color:#6D7873}'
     +'.k8-jobs{display:grid;gap:6px}.k8-jobs article{display:grid;grid-template-columns:120px 1fr 86px;gap:11px;align-items:center;background:#fff;border:1px solid #E1E8E3;border-left:4px solid #1F6F4A;border-radius:10px;padding:9px 12px}'
     +'.k8-jobs article.k8-gate{border-left-color:#A9822F}.k8-jobs article.k8-arr{border-left-color:#5B7FA6}'
     +'.k8-jobs article.k8-break{background:#FAFBFA;border-style:dashed;border-left:4px dashed #C9D3CD;padding:6px 12px}'
     +'.k8-jobs article.k8-break b{color:#6D7873;font-size:11px}.k8-jobs article.k8-break span{font-size:10px}'
     +'@media(max-width:760px){.k8-jobs article{grid-template-columns:1fr}}'
     +'.k8-jobs time{display:block;font:800 11px ui-monospace,Menlo,monospace;color:#123C32}'
     +'.k8-jobs time i{display:inline-block;margin-left:0;margin-top:3px;font-style:normal;font:800 9px system-ui;letter-spacing:.08em;padding:1px 7px;border-radius:99px;background:#EEF3F0;color:#1F6F4A}'
     +'.k8-jobs article.k8-gate time i{background:#F7EFDC;color:#8A6D1F}.k8-jobs article.k8-arr time i{background:#E9F0F7;color:#3D5F86}'
     +'.k8-jobs div>b{display:block;font-size:12px;color:#123C32;font-weight:900}'
     +'.k8-jobs div>span{display:block;font-size:10.5px;color:#34413B;margin-top:3px;line-height:1.55}'
     +'.k8-jobs small{display:block;font-size:10px;color:#6D7873;margin-top:3px}.k8-jobs small b{color:#1F6F4A;display:inline}'
     +'.k8-jobs em{font-style:normal;font:800 10.5px ui-monospace,Menlo,monospace;color:#6D7873;text-align:right}'
     +'.k8-reserve{padding:13px 14px;border:1px dashed #C9D3CD;border-radius:10px;background:#FAFBFA}.k8-reserve b{display:block;color:#123C32;font-size:13px}.k8-reserve span{display:block;font-size:11px;color:#6D7873;margin-top:4px;line-height:1.6}';
    (document.head||document.documentElement).appendChild(st);
  }
}catch(_){}

/* 稽核：櫃檯頁與個人班表是同一份；沒有人同時站兩個崗位、沒有人跨兩個航廈、工時與用餐守規則 */
window.kgmAuditR1008A=function(ap,date){
  ap=ap||'TPE';date=date||T();
  var P=plan8(ap,date),bad=[];
  if(!P)return {ok:false,bad:['沒有派工計畫']};
  var mism=0;
  for(var s=0;s<8;s++){
    var r=window.kgmCounterAllocR74(ap,date,s);
    (r.rows||[]).forEach(function(row,ri){
      var ts=P.tasks.filter(function(x){return x.row==='c|'+s+'|'+ri});
      var ids=(row.staff||[]).map(function(p){return p.empId}).join(',');
      var want=[];ts.forEach(function(t){t.who.forEach(function(x){if(want.indexOf(x)<0)want.push(x)})});
      if(!ts.length||ids!==want.join(','))mism++;
    });
  }
  if(mism)bad.push('櫃檯頁與派工計畫不一致 '+mism+' 列');
  var over=0,span=0,run=0,multi=0;
  Object.keys(P.people).forEach(function(id){
    var q=P.people[id];if(q.off||!q.tasks.length)return;
    var L=q.tasks;
    for(var i=1;i<L.length;i++)if(L[i].a<L[i-1].b)over++;
    if(q.to-q.from>MAXSPAN)span++;
    var rs=L[0].a;for(var j=0;j<L.length;j++){if(j&&L[j].a-L[j-1].b>=BRK)rs=L[j].a;if(L[j].b-rs>MAXRUN)run++}
    var tm={};L.forEach(function(t){tm[t.term]=1});if(Object.keys(tm).length>1)multi++;
  });
  if(over)bad.push('同一人工作重疊 '+over);
  if(span)bad.push('班別超過 9 小時 '+span);
  if(run)bad.push('連續工作超過 4.5 小時沒有用餐 '+run);
  if(multi)bad.push('同一人一天跨兩個航廈 '+multi);
  var ctrShort=P.tasks.filter(function(t){return t.kind==='ctr'&&t.who.length<t.min}).length;
  if(ctrShort)bad.push('報到櫃檯人力低於下限 '+ctrShort);
  return {ok:!bad.length,bad:bad,ap:ap,date:date,tasks:P.tasks.length,working:P.working,reserve:P.reserve,off:P.off,
    short:P.short.length,ctrShort:ctrShort};
};
})();
