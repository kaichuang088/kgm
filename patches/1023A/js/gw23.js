function shift22(P){
  /* 1023A：換地點要算通勤（使用者：「地勤排班要算中間通勤時間（像是走到D10就是不用加入行程是通勤時間但是就是兩個時間可能要有十分鐘差）」）
     航班工作之間原本就要求不同崗位至少差 10 分鐘（ok8），但 8 小時填滿的部分（班前簡報、旅客服務台／支援、交接）會直接接到下一個崗位，
     兩個崗位之間的 10 分鐘空檔也被算成「服務台支援」。現在：從一個地點換到另一個地點一律留 10 分鐘「步行前往 ○○」（不算工作），
     同一個崗位之間的短空檔寫「原崗位待命」；班的起點往前 10 分（簡報完走到第一個崗位）。 */
  var WALK=10;
  var f0=Math.floor((P.first-15-WALK)/5)*5,l0=Math.ceil((P.last+15+WALK)/5)*5,s=f0;
  if(s+SHIFT22<l0)s=l0-SHIFT22;
  if(P.win1!=null&&s+SHIFT22>P.win1+60&&l0-SHIFT22<=f0)s=Math.max(l0-SHIFT22,Math.min(f0,P.win1+60-SHIFT22));
  var e=s+SHIFT22,TL=P.tasks.slice().sort(function(a,b){return a.a-b.a}),busy=TL.map(function(t){return [t.a,t.b]});
  var gaps=[],cur=s;busy.forEach(function(x){if(x[0]>cur)gaps.push([cur,x[0]]);cur=Math.max(cur,x[1])});if(e>cur)gaps.push([cur,e]);
  var mid=s+SHIFT22/2,meal=null,bc=1e9;
  gaps.forEach(function(g){if(g[1]-g[0]<30+2*WALK)return;
    var a=Math.max(g[0]+WALK,Math.min(g[1]-30-WALK,Math.round((mid-15)/5)*5));
    if(a-s>270||e-(a+30)>270)return;
    var c=Math.abs(a+15-mid);if(c<bc){bc=c;meal=[a,a+30]}});
  if(!meal)gaps.forEach(function(g){if(meal||g[1]-g[0]<30)return;var a=Math.max(g[0],Math.min(g[1]-30,Math.round((mid-15)/5)*5));meal=[a,a+30]});
  function zone(t){return t.kind==='ctr'?('C'+t.term):String(t.loc||t.key||'')}
  function lbl(t){return t.kind==='ctr'?((z()?'報到櫃檯 ':'Counter ')+(t.counter||'')):(t.kind==='gate'?((z()?'登機門 ':'Gate ')+(t.gate||'')):((z()?'到站 ':'Arrivals ')+(t.term||'')))}
  var fill=[];
  gaps.forEach(function(g){
    var pT=null,nT=null;TL.forEach(function(t){if(t.b===g[0])pT=t;if(t.a===g[1]&&!nT)nT=t});
    var parts=[g];if(meal&&meal[0]>=g[0]&&meal[1]<=g[1])parts=[[g[0],meal[0]],[meal[1],g[1]]];
    parts.forEach(function(q,pi){
      var a=q[0],b=q[1],from=pi===0?pT:null,to=pi===parts.length-1?nT:null;
      var desk=(pi===0&&parts.length>1)?(z()?'員工餐廳':'staff canteen'):(z()?'旅客服務台':'service desk');
      if(b-a<5){if(b>a){if(fill.length&&fill[fill.length-1].b===a)fill[fill.length-1].b=b;else fill.push({a:a,b:b,k:to?'walk':'post',to:to?lbl(to):''})}return}
      /* 只有一頭是崗位、時間不夠做別的：整段就是走過去 */
      if((from&&!to||to&&!from)&&b-a<WALK+10&&!(a===s||b===e)){fill.push({a:a,b:b,k:'walk',to:to?lbl(to):desk});return}
      /* 同一個崗位、空檔不長：留在原崗位 */
      if(from&&to&&zone(from)===zone(to)&&b-a<40){fill.push({a:a,b:b,k:'post',to:lbl(to)});return}
      /* 兩個崗位之間太短、排不下服務台：走過去，剩下的時間在下一個崗位準備 */
      if(from&&to&&b-a<2*WALK+15){var w=Math.min(WALK,b-a);fill.push({a:a,b:a+w,k:'walk',to:lbl(to)});if(b-a-w>=5)fill.push({a:a+w,b:b,k:'post',to:lbl(to)});return}
      var tail=null;
      if(from){var w1=Math.min(b,a+WALK);fill.push({a:a,b:w1,k:'walk',to:desk});a=w1}
      if(to&&b>a){tail={a:Math.max(a,b-WALK),b:b,k:'walk',to:lbl(to)};b=tail.a}
      if(b-a>=10){
        if(a===s&&b-a>=15){var br={a:a,b:a+15,k:'brief'};fill.push(br);a+=15;if(b-a<10&&!(b===e)){br.b=b;a=b}}
        if(b===e&&b-a>=15){var h={a:b-15,b:b,k:'hand'};b-=15;if(b-a>=10)fill.push({a:a,b:b,k:'svc'});else h.a=a;fill.push(h)}
        else if(b-a>=10)fill.push({a:a,b:b,k:'svc'});
        else if(b>a&&fill.length)fill[fill.length-1].b=b;
      }else if(b>a&&tail){tail.a=a}
      if(tail)fill.push(tail);
    });
  });
  P.from=s;P.to=e;P.meal=meal;P.fillR1022A=fill;
}
