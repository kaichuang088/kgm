function parseRouteI(t){var u=t.toUpperCase(),m=u.match(/\b([A-Z]{3})\s*(?:-|→|\bTO\b)\s*([A-Z]{3})\b/);if(m&&(!aptCodes920F().length||(aptCodes920F().indexOf(m[1])>=0&&aptCodes920F().indexOf(m[2])>=0)))return [m[1],m[2]];
  /* 0927D：上面這行原本是 (?:-|→|TO)，「TSA TOKYO」會被讀成 TSA→KYO（把 Tokyo 的 TO 當成「到」）；改成 TO 要是獨立的字，兩端也要是真的機場 */
  /* 0927D：原本只認得幾個中文城市名（東京一律成田），英文（Tokyo）、松山／羽田／金浦都不認得。
     改成：中文、英文、三碼混著打都可以（例：TSA 到 Tokyo、台北飛首爾），兩個機場的城市依另一端對應。 */
  var lo=String(t).toLowerCase(),ents=[],seen={};
  function add(name,aps){name=String(name||'');if(!name||!aps||!aps.length)return;var k=name.toLowerCase();if(seen[k])return;seen[k]=1;ents.push([name,aps])}
  CITY927D.forEach(function(g){g.n.forEach(function(x){add(x,g.aps)})});
  [['桃園','TPE'],['松山','TSA'],['成田','NRT'],['羽田','HND'],['仁川','ICN'],['金浦','GMP'],['浦東','PVG'],['虹橋','SHA'],['關西','KIX'],['新加坡','SIN'],['香港','HKG']]
    .forEach(function(x){add(x[0],[x[1]])});
  aptCodes920F().forEach(function(k){
    add(aptZh920F(k),[k]);
    try{var en=(typeof CITY_EN!=='undefined'&&CITY_EN[k])||'';if(en&&en.length>=4)add(en,[k])}catch(_){}
  });
  var hits=[];
  ents.forEach(function(e){
    var nm=e[0],isEn=/^[\x00-\x7f]+$/.test(nm),hay=isEn?lo:t,needle=isEn?nm.toLowerCase():nm,at=hay.indexOf(needle);
    while(at>=0){
      var okB=!isEn||((at===0||!/[a-z]/.test(hay.charAt(at-1)))&&!/[a-z]/.test(hay.charAt(at+needle.length)||''));
      if(okB){hits.push({at:at,len:needle.length,aps:e[1]});break}
      at=hay.indexOf(needle,at+1);
    }
  });
  var STOP={THE:1,AND:1,FOR:1,ONE:1,TWO:1,YOU:1,ARE:1,NOT:1,CAN:1,ALL:1,ANY:1,HOW:1,WHO:1,OUT:1,DAY:1,PAX:1,SEAT:1};
  var re=/\b([A-Za-z]{3})\b/g,mm;
  while((mm=re.exec(t))){var c=mm[1].toUpperCase();if(STOP[c]&&mm[1]!==c)continue;if(aptCodes920F().indexOf(c)>=0)hits.push({at:mm.index,len:3,aps:[c]})}
  /* 同一個位置重疊的，留最長的 */
  hits.sort(function(a,b){return a.at-b.at||b.len-a.len});
  var keep=[],end=-1;
  hits.forEach(function(h){if(h.at>=end){keep.push(h);end=h.at+h.len}});
  if(keep.length<2)return null;
  var A=keep[0].aps,B=keep[1].aps,fa='',fb='';
  if(A.length===1){fa=A[0];fb=pickAp927D(B,fa)}
  else if(B.length===1){fb=B[0];fa=pickAp927D(A,fb)}
  else{fa=pickAp927D(A,null);fb=pickAp927D(B,fa)}
  return (fa&&fb&&fa!==fb)?[fa,fb]:null}
