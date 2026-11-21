import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='/* 1004B · 組員調位（DH）：班表寫出班號、補出的 DH 對到真實航班、航班資料列出 DH */\n'
R('dh real flight fn',"function chainDhR913(empId,fr,to,date,nextDepUTC){\n  var dur=150;",
"""/* 1004B：使用者：「組員班表DH要寫是哪一班」。原本補出來的調位段（code:'DH'）時間是由下一段勤務往前倒推的，
   不是任何一個真的航班 —— 班表只能寫「DH OKA→TPE」，航班資料、員工票狀態也看不到這位組員坐在哪一班。
   改成：當天與前一天、同一航線上，落地後還有 60 分鐘以上才報到下一段的航班裡，挑最晚落地的那一班（含聯營）
   —— 長程或清晨的勤務，實務上就是前一晚先搭過去；落地超過 36 小時前的不算。
   找不到才維持原本倒推的時刻。班次寫在 dhFlightR1004B（日期 dhDateR1004B），調位紀錄也登記在那一班底下。 */
function realDhR1004B(fr,to,date,nextDepUTC){
  var best=null;
  function tz(ap){try{if(typeof TZ!=='undefined'&&TZ[ap]!=null)return +TZ[ap]}catch(_){}return 8}
  function ok(t){return /^\\d\\d:\\d\\d$/.test(String(t||''))}
  function utc(f,fd){
    var dep=isFinite(f.depUTC)?+f.depUTC:Date.parse(fd+'T'+f.dep+':00Z')/60000-tz(f.fr)*60;
    var arr=isFinite(f.arrUTC)?+f.arrUTC:Date.parse(D(fd,+f.dd||0)+'T'+f.arr+':00Z')/60000-tz(f.to)*60;
    return [dep,arr];
  }
  function take(c){
    if(!(isFinite(c.depUTC)&&isFinite(c.arrUTC))||c.arrUTC>nextDepUTC-60||c.arrUTC<nextDepUTC-36*60)return;
    if(!best||c.arrUTC>best.arrUTC)best=c;
  }
  /* 航班清單用組員引擎自己的「當天實際營運」（kgmFlightsOnR121）：訂位用的 sortedFlights 會把已經起飛、
     已經過去的班次濾掉，前一天的航班永遠找不到。直飛之外，也認同一個班號的兩段接續（KX20 TPE→NRT→HNL、
     KX86 TPE→BKK→FRA 這類經停航班）。聯營班次只在引擎清單完全沒有時才從訂位清單補。 */
  /* 引擎把經停航班的後段記在後段起飛的那一天（KX86 TPE→BKK 是 10/05、BKK→FRA 記在 10/06），
     所以前一天與當天的航段放在同一池子裡接。 */
  var pool=[],by={};
  [D(date,-1),date].forEach(function(fd){
    var fs=[];try{fs=(window.kgmFlightsOnR121?window.kgmFlightsOnR121(fd):[])||[]}catch(_){}
    fs.forEach(function(f){if(f&&!f.positioning&&ok(f.dep)&&ok(f.arr)){var u=utc(f,fd);pool.push({f:f,fd:fd,dep:u[0],arr:u[1]})}});
  });
  pool.forEach(function(x){(by[x.f.code]=by[x.f.code]||[]).push(x)});
  pool.forEach(function(x){
    var f=x.f;if(f.fr!==fr)return;
    if(f.to===to){take({code:f.code,date:x.fd,dep:f.dep,arr:f.arr,dd:+f.dd||0,depUTC:x.dep,arrUTC:x.arr,op:'',legs:[{d:x.fd,fr:f.fr,to:f.to}]});return}
    (by[f.code]||[]).forEach(function(y){
      var g=y.f;if(y===x||g.fr!==f.to||g.to!==to||!(y.dep>=x.arr&&y.dep-x.arr<12*60))return;
      var dd=Math.round((Date.parse(new Date((y.arr+tz(to)*60)*60000).toISOString().slice(0,10))-Date.parse(x.fd))/86400000);
      take({code:f.code,date:x.fd,dep:f.dep,arr:g.arr,dd:dd,depUTC:x.dep,arrUTC:y.arr,op:'',viaR1004B:f.to,legs:[{d:x.fd,fr:f.fr,to:f.to},{d:y.fd,fr:g.fr,to:g.to}]});
    });
  });
  if(!best){
    [date,D(date,-1)].forEach(function(fd){
      var ps=[];try{ps=(sortedFlights(fr,to,fd)||[]).filter(function(f){return f&&f.partner&&f.fr===fr&&f.to===to&&ok(f.dep)&&ok(f.arr)})}catch(_){}
      ps.forEach(function(f){var u=utc(f,fd);take({code:f.code,date:fd,dep:f.dep,arr:f.arr,dd:+f.dd||0,depUTC:u[0],arrUTC:u[1],op:String(f.operator||'')})});
    });
  }
  return best;
}
window.kgmRealDhR1004B=realDhR1004B;
function chainDhR913(empId,fr,to,date,nextDepUTC){
  var dur=150;""")
R('dh real flight use',"  return {code:'DH',fr:fr,to:to,date:date,dep:dep,arr:arr,dd:0,block:0,blockStr:'DH',\n    depUTC:depUTC,arrUTC:arrUTC,durR913:dur,",
"""  var rf1004B=(typeof nextDepUTC==='number'&&isFinite(nextDepUTC))?realDhR1004B(fr,to,date,nextDepUTC):null;
  if(rf1004B){dep=rf1004B.dep;arr=rf1004B.arr;depUTC=rf1004B.depUTC;arrUTC=rf1004B.arrUTC;dur=arrUTC-depUTC}
  return {code:'DH',fr:fr,to:to,date:date,dep:dep,arr:arr,dd:rf1004B?rf1004B.dd:0,block:0,blockStr:'DH',
    dhFlightR1004B:rf1004B?rf1004B.code:'',dhOpR1004B:rf1004B?rf1004B.op:'',dhDateR1004B:rf1004B?rf1004B.date:'',dhLegsR1004B:rf1004B&&rf1004B.legs||null,
    depUTC:depUTC,arrUTC:arrUTC,durR913:dur,""")
R('dh positioning key',"        var kk=[date,'DH',dh.fr,dh.to].join('|');\n        var lst=(S.crewPositioningR121[kk]=S.crewPositioningR121[kk]||[]);\n        if(!lst.some(function(z2){return z2&&z2.empId===empId}))\n          lst.push(","        /* 1004B：對到真實航班就登記在那一班底下；經停航班兩段都登記（航班資料是逐段看的） */\n        (dh.dhLegsR1004B||[{d:date,fr:dh.fr,to:dh.to}]).forEach(function(lg){\n        var kk=[lg.d,dh.dhFlightR1004B||'DH',lg.fr,lg.to].join('|');\n        var lst=(S.crewPositioningR121[kk]=S.crewPositioningR121[kk]||[]);\n        if(!lst.some(function(z2){return z2&&z2.empId===empId}))\n          lst.push(")
R('dh positioning flight',"            flight:Object.assign({},dh,{operating:false}),autoR913:true});","            flight:Object.assign({},dh,{operating:false},dh.dhFlightR1004B?{code:dh.dhFlightR1004B,fr:lg.fr,to:lg.to}:{}),autoR913:true});\n        });")
R('roster dh whole day',"        h+='<b>DH</b><i>'+E(_dp.join('→'))+'</i>'",
  "        h+='<b>DH'+(dhCodes1004B(_dl)?' '+E(dhCodes1004B(_dl)):'')+'</b><i>'+E(_dp.join('→'))+'</i>'"
  "+(_dl[0].dep&&_dl[0].dep!=='--:--'?'<i>'+E(_dl[0].dep)+'–'+E(_dl[_dl.length-1].arr||'')+'</i>':'')")
R('roster dh line',"(_dl.length?('<i class=\"k196-dh\">DH '+E(_dl.map(function(l){return l.fr+'→'+l.to+(l.dep&&l.dep!=='--:--'?(' '+l.dep+'–'+l.arr):'')}).join('・'))",
  "(_dl.length?('<i class=\"k196-dh\">DH '+E(_dl.map(function(l){var c=dhCode1004B(l);return (c?c+' ':'')+l.fr+'→'+l.to+(l.dep&&l.dep!=='--:--'?(' '+l.dep+'–'+l.arr):'')}).join('・'))")
R('roster dh helpers',"  function dhLegs196(x){return (x.legs||[]).filter(function(l){return isDh196(l)&&!sameCity929(l)})}",
"""  function dhLegs196(x){return (x.legs||[]).filter(function(l){return isDh196(l)&&!sameCity929(l)})}
  /* 1004B：DH 搭的是哪一班（引擎排的調位本來就掛真實班號；補出來的調位看 dhFlightR1004B） */
  function dhCode1004B(l){var c=l&&(l.dhFlightR1004B||(l.code&&l.code!=='DH'?l.code:''));return c?String(c)+(l.dhOpR1004B?'（'+l.dhOpR1004B+'）':'')+(l.dhDateR1004B&&l.date&&l.dhDateR1004B!==l.date?(z()?' 前一天':' prev. day'):''):''}
  function dhCodes1004B(ls){var o=[];(ls||[]).forEach(function(l){var c=dhCode1004B(l);if(c&&o.indexOf(c)<0)o.push(c)});return o.join('/')}""")
s=open('/tmp/j/kgm1004A_final.html',encoding='utf-8').read()
a="+'</span></div>'+fdBar929()+'<table><thead><tr><th>#</th><th>'+(z()?'旅客／會員':'Passenger / member')+'</th>"
assert s.count(a)==1
R('manifest dh bar',a,"+'</span></div>'+fdBar929()"
 "+(function(){/* 1004B：使用者：「航班資料要看到哪一些是DH」—— 名單最上面先列出本班所有調位組員 */"
 "var dh=(m||[]).filter(function(x){return x&&x.dhR929});if(!dh.length)return '';"
 "var RZ={pilot:z()?'飛行員':'Pilot',cabin:z()?'客艙':'Cabin',crew:z()?'客艙':'Cabin'};"
 "return '<div class=\"k4b-dhbar\"><b>'+(z()?'本班調位組員 DH':'Crew deadheading on this flight')+' <i>'+dh.length+'</i></b>'"
 "+dh.map(function(x){return '<span>'+E(x.name)+'<small>'+E(RZ[x.dhRole]||x.dhRole||'')+(x.seat?' · '+E(x.seat):'')+' · '+E(x.pnr)+'</small></span>'}).join('')"
 "+'<em>'+(z()?'DH 是確認座位，優先於員工票候補':'Deadheads hold confirmed seats ahead of staff standby')+'</em></div>'})()"
 "+'<table><thead><tr><th>#</th><th>'+(z()?'旅客／會員':'Passenger / member')+'</th>")
css=[
"'.k4b-dhbar{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;padding:10px 12px;background:#eef3fb;border-top:1px solid #dbe4f3;border-bottom:1px solid #dbe4f3}',",
"'.k4b-dhbar b{font-size:11px;color:#1d4f9c;font-weight:900;margin-right:4px}',",
"'.k4b-dhbar b i{font-style:normal;background:#1d4f9c;color:#fff;border-radius:999px;padding:1px 8px;margin-left:4px;font-size:10px}',",
"'.k4b-dhbar span{display:inline-flex;flex-direction:column;background:#fff;border:1px solid #d3def0;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;color:#1e2b26}',",
"'.k4b-dhbar span small{font-size:9.5px;color:#6d7a90;font-weight:600}',",
"'.k4b-dhbar em{font-style:normal;font-size:10px;color:#6d7a90;margin-left:auto}',",
]
RL('dh css','kgm-0816d-r40',"'.r40-moved{font-size:11.5px","\n".join(css)+"\n'.r40-moved{font-size:11.5px")
R('roster row keeps dh flight',"    deadhead:dh,dhR913:dh,remark:l.remark||''};","    deadhead:dh,dhR913:dh,remark:l.remark||'',\n    dhFlightR1004B:l.dhFlightR1004B||'',dhOpR1004B:l.dhOpR1004B||'',dhDateR1004B:l.dhDateR1004B||'',date:l.date||''};   /* 1004B：DH 搭哪一班要帶過來 */")
R('chain first day dh',"    /* 位置接不上就補一段調機，並登記成正式的調位紀錄 */\n    var _hasDh=",
  "    /* 1004B：班表視窗的第一天，組員可能前一天就已經在外站（引擎排的第一段就是從外站調回來的 DH）。\n"
  "       原本一律假設人在基地，再補一段「基地→外站」的 DH 去接 —— 班表上就變成整天坐飛機去又坐飛機回\n"
  "       （實測 7 天 2,660 個組員日裡 8 天，全部是視窗第一天）。第一天的第一段若是 DH，就以它的起點為目前位置。 */\n"
  "    if(i===0&&legs.length&&legs[0]&&(legs[0].dhR913||legs[0].deadhead)&&legs[0].fr!==at)at=legs[0].fr;\n"
  "    /* 位置接不上就補一段調機，並登記成正式的調位紀錄 */\n    var _hasDh=")
R('chain start location',"  window.kgmCrewPlanR121(D(startDate,n-1));\n  for(var i=0;i<n;i++){var date=D(startDate,i)",
  "  window.kgmCrewPlanR121(D(startDate,n-1));\n"
  "  /* 1004B：鏈的起點原本一律假設人在基地；前一晚停在外站的組員，第一天就會被補一段根本不存在的「基地→外站」DH，\n"
  "     而且這段 DH 現在會登記到真實航班上、佔掉員工票的位置。往前看 1–3 天引擎已經排好的班（只看算過的日子，\n"
  "     不觸發重算），取最後一段的落點當起點。 */\n"
  "  try{for(var b4=1;b4<=3;b4++){var pd4=D(startDate,-b4);if(!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(pd4)))break;\n"
  "    var pp4=window.kgmCrewPlanR121(pd4),last4=null;\n"
  "    (pp4.flights||[]).forEach(function(f){if(!f||f.surfaceR928)return;if(!(f.pilots||[]).concat(f.cabin||[]).some(function(p){return p&&p.empId===empId}))return;if(!last4||(+f.depUTC||0)>(+last4.depUTC||0))last4=f});\n"
  "    if(last4){at=last4.to||at;break}}}catch(_){}\n"
  "  for(var i=0;i<n;i++){var date=D(startDate,i)")
open('p_g_dh.js','w').write(hdr+'\n'.join(out)+'\n')
