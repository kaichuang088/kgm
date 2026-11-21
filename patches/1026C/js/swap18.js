    /* 1018A：指定換到「哪一天、哪一段」—— 使用者：「K10143想把10/29的KX127換成10/28的UKB-TPE」「圖五這種一定要找到，想盡辦法也要找到，前提合法」。
       原本只在同一天、同一站出發的航班上找人，10/28 的 UKB→TPE（神戶出發）永遠找不到。改成：
       · 在指定的日期（可以好幾天：「10/28 或 10/29」）找飛那一段、同機型族、同階級的組員，兩人「整段勤務」（台北出發到回台北）互換；
       · 硬條件：換班前休息夠、兩段勤務都從台北出發；換班後休息不夠的下一班改派給別人（列在預覽）；
       · 指定日期找不到 → 自動放寬到前後兩天，並明講是哪一個條件擋住（機型資格、職級、休息）。 */
    if(opt18&&((opt18.tDates||[]).length||opt18.tFr)){
      var SC18=function(a,b){try{return window.kgmSameCityR928(a,b)}catch(_){return a===b}};
      var start18=function(id,d){for(var k=0;k<=6;k++){var dd=K.AD(d,-k),fs=legsOf(id,dd);if(fs.length&&SC18(fs[0].fr,'TPE'))return dd}return d};
      var sx18=start18(X,date);tx=tripF(X,sx18);
      if(!tx.length)return {text:((st[X]||{}).name||X)+' '+date+(z()?' 找不到完整的勤務（從台北出發到回台北）。':' has no complete duty.')};
      var today18=T();
      var reqD=(opt18.tDates&&opt18.tDates.length)?opt18.tDates.slice():[date];
      var routeTxt=opt18.tFr?(opt18.tFr+'→'+opt18.tTo):(code||'');
      var why={none:0,fam:0,rank:0,base:0,rest:0,famTypes:{}},C18=[],seen18={},strict18=true;   /* 先找指定的機場（UKB 就是 UKB）；都沒有才放寬到同城市（KIX／UKB） */
      var collect=function(days){
        days.forEach(function(td){if(td<today18)return;((planOf(td).flights)||[]).forEach(function(f){
          if(opt18.tFr&&!(strict18?(f.fr===opt18.tFr&&f.to===opt18.tTo):(SC18(f.fr,opt18.tFr)&&SC18(f.to,opt18.tTo))))return;
          if(!opt18.tFr&&code&&f.code!==code)return;
          if(f===dx.f)return;
          var crew=(roleX==='pilot')?(f.pilots||[]):(f.cabin||[]);
          if(fam(f.type)!==fam(dx.f.type)){why.fam++;why.famTypes[f.type]=1;return}
          var hit=false;crew.forEach(function(q){if(!q||!q.empId||q.empId===X)return;if(K.rankOf(q)!==rkX){why.rank++;return}if(Y&&q.empId!==Y)return;
            if(seen18[q.empId+'|'+td])return;seen18[q.empId+'|'+td]=1;hit=true;C18.push({id:q.empId,name:(st[q.empId]||q).name||q.empId,f:f,td:td,v:REAL[q.empId]?0:1})});
          if(!crew.length)why.none++;
        })});
      };
      var ready18=function(id,first,skip){for(var k=0;k<=4;k++){var d=K.AD(first.d,-k),fs=legsOf(id,d).filter(function(f){return !skip[d+'|'+f.code+'|'+f.fr]&&(+f.depUTC||0)<(+first.f.depUTC||0)});
        if(fs.length){var f=fs[fs.length-1];return (+f.arrUTC||0)+30+Math.max(+f.minimumRestMinutes||0,(+f.block||0)>=480?2880:720)}}return 0};
      var check18=function(id,mine,theirs){var skip={};mine.forEach(function(l){skip[key(l)]=1});
        if(ready18(id,theirs[0],skip)>(+theirs[0].f.depUTC||0)-60)return {hard:'rest'};
        var give=[],s=theirs[0].d,e=theirs[theirs.length-1].d;K.each(s,e,function(d){legsOf(id,d).forEach(function(f){if(!skip[d+'|'+f.code+'|'+f.fr])give.push(d+'|'+f.code+'|'+f.fr)})});
        var nd=nextDuty(id,e,skip),post=0;
        if(nd&&(+nd.depUTC||0)-60<lastArr(theirs)+restAfter(theirs)){K.each(K.AD(e,1),K.AD(e,4),function(d){legsOf(id,d).forEach(function(f){if(f===nd){give.push(d+'|'+f.code+'|'+f.fr);post=d}})})}
        return {hard:'',give:give,post:post}};
      var evalAll=async function(){var ok=[];C18.sort(function(a,b){return a.v-b.v||String(a.td).localeCompare(String(b.td))});
        for(var i=0;i<C18.length&&ok.length<8&&i<60;i++){var c=C18[i];if(i%4===3)await yieldUI();
          var tc=tripF(c.id,start18(c.id,c.td));
          if(!tc.length||!tc.some(function(l){return l.f===c.f})||!SC18(tc[0].f.fr,'TPE')||!SC18(tx[0].f.fr,'TPE')){why.base++;continue}
          var e1=check18(X,tx,tc),e2=check18(c.id,tc,tx);if(e1.hard||e2.hard){why.rest++;continue}
          c.tc=tc;c.gx=e1;c.gy=e2;c.n=e1.give.length+e2.give.length;ok.push(c)}
        ok.sort(function(a,b){return (a.v||0)-(b.v||0)||(reqD.indexOf(a.td)<0)-(reqD.indexOf(b.td)<0)||a.n-b.n});return ok.slice(0,3)};
      for(var w18=0;w18<reqD.length;w18++){for(var v18=-5;v18<=3;v18++)planOf(K.AD(reqD[w18],v18));await yieldUI()}
      collect(reqD);var ok18=await evalAll(),wide18=false;
      if(!ok18.length){   /* 指定的日期沒有合法方案 → 放寬到前後兩天 */
        var more=[];reqD.forEach(function(d){for(var k=-2;k<=2;k++){var dd=K.AD(d,k);if(reqD.indexOf(dd)<0&&more.indexOf(dd)<0)more.push(dd)}});
        for(var m18=0;m18<more.length;m18++){for(var u18=-5;u18<=3;u18++)planOf(K.AD(more[m18],u18));await yieldUI()}
        C18=[];collect(more);ok18=await evalAll();wide18=ok18.length>0;
      }
      var city18=false;if(!ok18.length&&opt18.tFr){strict18=false;C18=[];seen18={};collect(reqD);ok18=await evalAll();city18=ok18.length>0}   /* 最後才放寬到同城市的機場 */
      var dTxt=reqD.map(function(d){return d.slice(5).replace('-','/')}).join(z()?' 或 ':' or ');
      if(!ok18.length){
        var rs=[];
        if(why.fam)rs.push(z()?('那幾天的 '+routeTxt+' 是 '+Object.keys(why.famTypes).join('／')+'，跟 '+((st[X]||{}).name||X)+' 原本的 '+dx.f.code+'（'+dx.f.type+'）不是同一個機型族，沒有該機型資格不能飛'):'type rating mismatch');
        if(why.rank)rs.push(z()?'同一段上同職級的人不夠（職級不能跨）':'no one of the same rank');
        if(why.rest)rs.push(z()?(why.rest+' 位換了之後休息時間不足（前一天剛落地或隔天一早要飛）'):'rest');
        if(why.base)rs.push(z()?'對方那一段不是從台北出發的完整勤務，整段互換不成立':'not a base-to-base duty');
        if(!rs.length)rs.push(z()?(dTxt+' 前後兩天都沒有 '+routeTxt+' 的航班'):'no such flight');
        return {text:(z()?('找不到合法的換法（'+dTxt+' 的 '+routeTxt+'，已放寬到前後兩天）：'):'No legal option: ')+rs.join('；')+(z()?'。':'.')};
      }
      var RS=ok18.reduce(function(a,c){return [a,c.tc[0].d].sort()[0]},tx[0].d);
      var a1=K.AD(RS,-1),days18=[];for(var i18=0;i18<8;i18++)days18.push(K.AD(a1,i18));
      var opts18=ok18.map(function(c){
        var s0=[tx[0].d,c.tc[0].d].sort()[0],end=[tx[tx.length-1].d,c.tc[c.tc.length-1].d].sort()[1],pins={},exD={};
        K.each(s0,end,function(d){exD[d]=1});[c.gx.post,c.gy.post].forEach(function(d){if(d)exD[d]=1});
        var give18=function(id,tr){K.each(tr[0].d,tr[tr.length-1].d,function(d){var v=tr.filter(function(l){return l.d===d}).map(function(l){return l.f.code+'@'+l.f.fr}).join('|');(pins[d]=pins[d]||{})[id]=v||'__LAYOVER__'})};
        give18(X,c.tc);give18(c.id,tx);
        return {id:c.id,name:c.name,flight:c.f.code+' '+c.f.fr+'→'+c.f.to,start:s0,end:end,pins:pins,exD:exD,td:c.td,
          fromX:tx.map(function(l){return l.d.slice(5)+' '+l.f.code}).join('、'),fromY:c.tc.map(function(l){return l.d.slice(5)+' '+l.f.code}).join('、'),n:c.n,
          rows:days18.map(function(d){return {d:d,bx:dayTxt(X,d),ax:afterTxt(X,tx,c.tc,d,c.gx.give),by:dayTxt(c.id,d),ay:afterTxt(c.id,c.tc,tx,d,c.gy.give)}})};
      });
      S.adminAiSwapOptsR1006A={X:X,xName:(st[X]||{}).name||X,date:RS,opts:opts18,at:Date.now()};
      var cell18=function(b,a){return a===b?E(a):('<b>'+E(a)+'</b><s>'+E(b)+'</s>')};
      var html18='<div class="k6sw-top">'+(z()?'<b>'+E((st[X]||{}).name||X)+'（'+E(X)+'）</b> 原本 '+E(opts18[0].fromX)+'，想換成 '+E(dTxt)+' 的 '+E(routeTxt)+'。'
          +(wide18?'<b>指定的日期沒有合法的人可以換，下面是前後兩天最接近的方案。</b>':'')+(city18?'<b>'+E(routeTxt)+' 那幾天沒有合法的人可以換，下面是同城市機場（'+E(opt18.tFr)+'／同城市）的方案。</b>':'')+'下面是前 '+opts18.length+' 個合法方案（同機型族、同階級、兩段都從台北出發、休息時間都夠），列出兩人換班後的班表，選一個就寫入班表並通知兩位：':'Legal options:')+'</div>'
        +opts18.map(function(o,i){return '<div class="k6sw"><div class="k6sw-h"><span>'+(z()?'方案 ':'Option ')+(i+1)+'</span><b>'+E(o.name)+'</b> <small>'+E(o.id)+'　原本飛 '+E(o.fromY)+'</small></div>'
          +(o.n?'<div class="k6sw-n">'+(z()?'核准後有 '+o.n+' 段原本的班改由其他人接手（表格中標示）':'')+'</div>':'')+'<div class="k6sw-t"><table><thead><tr><th>'+(z()?'日期':'Date')+'</th><th>'+E((st[X]||{}).name||X)+(z()?'（換班後）':' (after)')+'</th><th>'+E(o.name)+(z()?'（換班後）':' (after)')+'</th></tr></thead><tbody>'
          +o.rows.map(function(r){return '<tr'+(r.d===o.td||r.d===date?' class="on"':'')+'><td>'+E(r.d.slice(5))+'</td><td>'+cell18(r.bx,r.ax)+'</td><td>'+cell18(r.by,r.ay)+'</td></tr>'}).join('')+'</tbody></table></div>'
          +'<button class="k6sw-go" onclick="kgmAdminAiAskR929(\'選方案 '+(i+1)+'\')">'+(z()?'選這個方案':'Choose')+'</button></div>'}).join('');
      return {text:(z()?'換班方案 ':'Swap options ')+opts18.map(function(o,i){return (i+1)+'. '+o.name+' '+o.flight+' '+o.td.slice(5)}).join('　'),html:html18};
    }
