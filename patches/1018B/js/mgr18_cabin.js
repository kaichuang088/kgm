    function cityName18(a){try{var c=(typeof CITY_ZH!=='undefined'&&CITY_ZH[a])||'';if(!c&&typeof AIRPORTS!=='undefined'&&AIRPORTS[a])c=AIRPORTS[a].zh||AIRPORTS[a].city||'';return c&&c!==a?c:''}catch(_){return ''}}
    function cabinSec12(){var date=S._mgrCDateR1012A||T12(),P=null,ready=true;
      try{ready=!window.kgmCrewHasDayR121||window.kgmCrewHasDayR121(date)}catch(_){ready=true}
      if(!ready){setTimeout(function(){try{window.kgmCrewPlanR121(date)}catch(_){}try{if(S.adminTab==='mgr12'&&S._mgrSecR1012A==='cabin')render()}catch(_){}},60)}   /* 1018A：那一天組員班表還沒算好 → 先畫頁面，下一刻再算 */
      else{try{P=window.kgmCrewPlanR121(date)}catch(_){P=null}}
      var all=((P&&P.flights)||[]).filter(function(f){return f&&!f.positioning&&(f.cabin||[]).length}).sort(function(a,b){return String(a.dep).localeCompare(String(b.dep))});
      var byAp={};all.forEach(function(f){byAp[f.fr]=(byAp[f.fr]||0)+1});
      var aps=Object.keys(byAp).sort(function(a,b){return (b==='TPE')-(a==='TPE')||(b==='TSA')-(a==='TSA')||byAp[b]-byAp[a]||a.localeCompare(b)});
      var ap=S._mgrCApR1018A&&byAp[S._mgrCApR1018A]?S._mgrCApR1018A:(aps[0]||'TPE');
      var qf=String(S._mgrCQR1018A||'').trim().toUpperCase().replace(/\s+/g,'');
      var fromAp=all.filter(function(f){return f.fr===ap}),byTo={};fromAp.forEach(function(f){byTo[f.to]=(byTo[f.to]||0)+1});
      var tos=Object.keys(byTo).sort(),to=S._mgrCToR1018A&&byTo[S._mgrCToR1018A]?S._mgrCToR1018A:'';
      var pickTo=!qf&&!to&&fromAp.length>16;   /* 1018A：出發站班次多（桃園一天一百多班）→ 先選航點，不一次列出全部航班 */
      var fl=all.filter(function(f){return qf?String(f.code).toUpperCase().indexOf(qf)>=0:(f.fr===ap&&(!to||f.to===to))});
      if(pickTo)fl=[];
      var code=S._mgrCFltR1012A&&fl.some(function(f){return f.code+'|'+f.fr===S._mgrCFltR1012A})?S._mgrCFltR1012A:(fl[0]?fl[0].code+'|'+fl[0].fr:'');
      var f=fl.filter(function(x){return x.code+'|'+x.fr===code})[0],m=st12();
      var done=function(x){var r=x.code+' '+x.fr+'→'+x.to,n=0;(x.cabin||[]).forEach(function(c){if(m.attend[akey12('c',date,c.empId,r)])n++});return n};
      var m3=Object.keys(m.managers).filter(function(id){var r=m.managers[id];return r.dept==='cabin'&&+r.level===3}).map(function(id){var s=staff12(id);return s?s.name:id});
      var head='<div class="k12m-bar"><div class="k12m-form"><label>'+(z12()?'日期':'Date')+'<input type="date" class="inp" value="'+date+'" onchange="S._mgrCDateR1012A=this.value;S._mgrCFltR1012A=\'\';render()"></label>'
        +'<label>'+(z12()?'出發航點':'Departure station')+'<select class="inp" onchange="S._mgrCApR1018A=this.value;S._mgrCToR1018A=\'\';S._mgrCQR1018A=\'\';S._mgrCFltR1012A=\'\';render()">'+aps.map(function(a){return '<option value="'+a+'"'+(a===ap&&!qf?' selected':'')+'>'+a+'（'+byAp[a]+(z12()?' 班':'')+'）</option>'}).join('')+'</select></label>'
        +'<label>'+(z12()?'航點':'Destination')+'<select class="inp" onchange="S._mgrCToR1018A=this.value;S._mgrCQR1018A=\'\';S._mgrCFltR1012A=\'\';render()"><option value="">'+(z12()?'選擇航點…':'Choose…')+'</option>'+tos.map(function(a){return '<option value="'+a+'"'+(a===to&&!qf?' selected':'')+'>'+a+(cityName18(a)?' '+E12(cityName18(a)):'')+'（'+byTo[a]+(z12()?' 班':'')+'）</option>'}).join('')+'</select></label></div>'
        +q18('_mgrCQR1018A',z12()?'或直接輸入班號（例：KX12）':'Or flight number')+'</div>';
      var cards=pickTo?'<div class="k12m-sub" style="margin:2px 0 8px">'+E12(ap)+(z12()?' 今天有 '+fromAp.length+' 班，先選航點：':': choose a destination')+'</div><div class="k12m-aps">'+tos.map(function(a){var xs=fromAp.filter(function(f){return f.to===a}),n=0,d=0;xs.forEach(function(x){n+=(x.cabin||[]).length;d+=done(x)});
          return '<button class="k12m-ap" onclick="S._mgrCToR1018A=\''+A12(a)+'\';S._mgrCFltR1012A=\'\';render()"><b>'+E12(a)+'</b><span>'+E12(cityName18(a)||'')+'</span><small>'+xs.length+(z12()?' 班 · 點名 ':' flt · ')+d+'/'+n+'</small></button>'}).join('')+'</div>'
        :fl.length?'<div class="k12m-flts">'+fl.map(function(x){var k=x.code+'|'+x.fr,n=(x.cabin||[]).length,d=done(x);
          return '<button class="k12m-flt'+(k===code?' on':'')+'" onclick="S._mgrCFltR1012A=\''+A12(k)+'\';render()"><b>'+E12(x.code)+'</b><span>'+E12(x.fr+' → '+x.to)+' · '+E12(x.dep||'')+'</span><span>'+(z12()?'客艙組員 ':'Cabin crew ')+n+(z12()?' 人 · 已點名 ':' · checked ')+d+'</span><div class="k12m-prog"><i style="width:'+(n?Math.round(d*100/n):0)+'%"></i></div></button>'}).join('')+'</div>'
        :'<div class="k12m-empty">'+(!ready?(z12()?'這一天的組員班表計算中…':'Computing crew plan…'):(qf?(z12()?'這一天沒有這個班號的航班':'No such flight'):(z12()?'這個航點這一天沒有航班':'No flights')))+'</div>';
      var pu=f?(f.cabin||[]).filter(function(c){return c.posCode==='PU'})[0]:null,dpu=f?(f.cabin||[]).filter(function(c){return c.posCode==='DPU'}):[];
      var ref=f?(f.code+' '+f.fr+'→'+f.to):'';
      return '<div class="k12m-card"><div class="k12m-sec"><h3>'+(z12()?'客艙點名':'Cabin roll call')+'</h3><small>'+(z12()?('總座艙長 Manager III：'+(m3.join('、')||'尚未任命')):'')+'</small></div>'
        +'<p>'+(z12()?'先選日期與出發航點（或直接打班號），再點一班。當班座艙長＝Manager II、副座艙長＝Manager I，報到時點名這一班全體客艙組員。':'Pick a date and departure station, then a flight.')+'</p>'+head+cards
        +(f?'<div class="k12m-team"><b>'+E12(ref)+'</b><span class="k12m-sub">'+E12(f.dep||'')+'</span>'+(pu?('<span style="margin-left:10px">'+E12(pu.name)+'</span> <span class="k12m-lv l2">'+(z12()?'座艙長 · Manager II':'Purser · Manager II')+'</span>'):'')+dpu.map(function(c){return '<span style="margin-left:6px">'+E12(c.name)+'</span> <span class="k12m-lv l1">'+(z12()?'副座艙長 · Manager I':'Asst. purser · Manager I')+'</span>'}).join('')+'</div>'
          +'<table class="k12m-t"><thead><tr><th>'+(z12()?'組員':'Crew')+'</th><th>'+(z12()?'當班位置':'Position')+'</th><th>'+(z12()?'服務艙等':'Cabin')+'</th><th>'+(z12()?'點名':'Roll call')+'</th></tr></thead><tbody>'
          +(f.cabin||[]).map(function(c){return '<tr><td>'+who18(c.name,c.empId)+'</td><td>'+E12(c.posZH||c.posCode||'')+'</td><td>'+E12(c.cabinZH||'')+'</td><td>'+stBtns12('c',date,c.empId,ref)+'</td></tr>'}).join('')+'</tbody></table>':'')+'</div>'}
