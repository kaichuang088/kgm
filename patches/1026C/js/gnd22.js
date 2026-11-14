/* ══ 1022A：地勤每次上班 8 小時（使用者：「TSA地勤太閒了吧排班規定就是要八小時每次上班喔！！」）
   原本上下班時間＝第一項工作前 15 分到最後一項後 15 分，工作少的人就是 2～4 小時的短班（松山一半的人只站一個櫃檯 2.4 小時）。
   ① 併班：航班工作不到 4 小時的人，依工作少的先，把他的每一項工作交給 8 小時內排得進去的同仁（同樣的人力下限、重疊、
      連續 4.5 小時用餐、同一航廈規則照舊，ok8）；全部交得出去就改成備勤（在家待命），交不出去就整筆還原。
   ② 每位到機場上班的人一律 8 小時：班的起點＝第一項工作前 15 分（排不下就往前移），航班工作以外的時間排
      班前簡報、旅客服務台／支援、交接；用餐 30 分鐘放在最接近班中間、而且前後連續工作都不超過 4.5 小時的空檔。 ══ */
var SHIFT22=480;
function consol22(people){
  function rm(P,x){x.who=x.who.filter(function(id){return id!==P.id});P.tasks=P.tasks.filter(function(y){return y!==x});P.work-=(x.b-x.a);
    P.first=P.tasks.length?Math.min.apply(null,P.tasks.map(function(y){return y.a})):null;P.last=P.tasks.length?Math.max.apply(null,P.tasks.map(function(y){return y.b})):null;if(!P.tasks.length)P.term=null}
  var low=people.filter(function(P){return !P.off&&P.tasks.length&&P.work<240}).sort(function(a,b){return a.work-b.work||a.ord-b.ord});
  low.forEach(function(P){
    if(!P.tasks.length)return;
    var moves=[],okAll=true,L=P.tasks.slice();
    for(var i=0;i<L.length&&okAll;i++){var t=L[i],R=null,rc=1e9;
      people.forEach(function(Q){if(Q===P||Q.off||!Q.tasks.length||Q.work<P.work||t.who.indexOf(Q.id)>=0)return;if(!ok8(Q,t,null))return;var c=cost8(Q,t);if(c<rc){rc=c;R=Q}});
      if(!R){okAll=false;break}
      rm(P,t);add8(R,t);moves.push({t:t,R:R});}
    if(!okAll){for(var m=moves.length-1;m>=0;m--){var x=moves[m];rm(x.R,x.t);add8(P,x.t)}}
  });
}
function shift22(P){
  var f0=Math.floor((P.first-15)/5)*5,l0=Math.ceil((P.last+15)/5)*5,s=f0;
  if(s+SHIFT22<l0)s=l0-SHIFT22;
  if(P.win1!=null&&s+SHIFT22>P.win1+60&&l0-SHIFT22<=f0)s=Math.max(l0-SHIFT22,Math.min(f0,P.win1+60-SHIFT22));
  var e=s+SHIFT22,busy=P.tasks.map(function(t){return [t.a,t.b]}).sort(function(a,b){return a[0]-b[0]});
  /* 空檔（班內、航班工作以外） */
  var gaps=[],cur=s;busy.forEach(function(x){if(x[0]>cur)gaps.push([cur,x[0]]);cur=Math.max(cur,x[1])});if(e>cur)gaps.push([cur,e]);
  /* 用餐：30 分鐘、離班中間最近，而且用餐前後的連續工作（含支援）都不超過 4.5 小時 */
  var mid=s+SHIFT22/2,meal=null,bc=1e9;
  gaps.forEach(function(g){if(g[1]-g[0]<30)return;
    var a=Math.max(g[0],Math.min(g[1]-30,Math.round((mid-15)/5)*5));
    if(a-s>270||e-(a+30)>270)return;
    var c=Math.abs(a+15-mid);if(c<bc){bc=c;meal=[a,a+30]}});
  if(!meal)gaps.forEach(function(g){if(meal||g[1]-g[0]<30)return;var a=Math.max(g[0],Math.min(g[1]-30,Math.round((mid-15)/5)*5));meal=[a,a+30]});
  var fill=[];
  gaps.forEach(function(g){
    var parts=[g];if(meal&&meal[0]>=g[0]&&meal[1]<=g[1])parts=[[g[0],meal[0]],[meal[1],g[1]]];
    parts.forEach(function(q){if(q[1]-q[0]<10)return;
      var a=q[0],b=q[1];
      if(a===s&&b-a>=15){fill.push({a:a,b:a+15,k:'brief'});a+=15}
      if(b===e&&b-a>=15){var h={a:b-15,b:b,k:'hand'};b-=15;if(b-a>=10)fill.push({a:a,b:b,k:'svc'});fill.push(h);return}
      if(b-a>=10)fill.push({a:a,b:b,k:'svc'})});
  });
  P.from=s;P.to=e;P.meal=meal;P.fillR1022A=fill;
}
var FILL22={brief:['班前簡報','Briefing','到地勤辦公室簽到、班前簡報：當日航班、特殊旅客、異常與延誤','Sign in; brief on today’s flights, special passengers and irregularities'],
  svc:['旅客服務台／支援','Service desk / support','旅客服務台：改票、退票、候補、行李查詢與遺失物、電話客服；櫃檯尖峰時支援報到','Service desk: changes, refunds, standby, baggage enquiries, phone; back up check-in at peaks'],
  hand:['交接下班','Handover','結報、交接下一班（未結案的旅客、行李與延誤）','Close out and hand over open cases to the next shift']};
