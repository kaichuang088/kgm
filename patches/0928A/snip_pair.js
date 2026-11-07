  /* 0928A：多段班「前段 → 後段」改成依時間配對（使用者：「飛機一律抵達後要直接回來！全部都要檢查喔！」）。
     原本每個前段依序找「第一個還沒被接走的後段」；只要有一個前段被推到隔天（例如換季當天），
     之後每一個前段都跟著晚一天 —— 實測 KX71 MUC→BKK 11:30 落地，要等到隔天 13:00 才飛 BKK→TPE（25.5 小時），
     當天 13:00 那班卻給了前一天落地的飛機。改成：每一班後段，交給「最近才落地、還沒配對、來得及轉機（75 分）」的前段。 */
  var PAIR928={},BASE928=Math.floor(Date.parse(w0+'T00:00:00Z')/60000);
  function pair928(x){
    try{
      var code=x.f.code;
      if(!PAIR928[code]){
        var map=new Map(),cands=secList72(code),secs=[],seen={};
        if(!cands.length){PAIR928[code]=map;return undefined}
        for(var di=0;di<ndays+3;di++){
          var cd=D(w0,di);
          for(var q=0;q<cands.length;q++){
            var raw=cands[q],c=window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(raw,cd):raw;
            var sk=cd+'|'+raw.fr+'|'+raw.to;if(seen[sk])continue;
            if(!onDay927C(c,cd))continue;
            var ct=c.acft;if(ct==='EQV'){try{ct=acftOfFlight(c.code,cd,c.fr,c.to)||ct}catch(_){}}
            if(ct!==type&&cands.length>1)continue;
            seen[sk]=1;
            c=Object.assign({},c);c.dur=_fUTC(c,cd,'arr')-_fUTC(c,cd,'dep');
            secs.push({c:c,cd:cd,di:di,dep:epoch72(cd,c.dep,c.fr)-BASE928});
          }
        }
        secs.sort(function(a,b){return a.dep-b.dep});
        var fronts=flat.filter(function(y){return y.f.code===code&&isFirst72(y.f)}).sort(function(a,b){return a.arrAbs-b.arrAbs});
        var used=new Set();
        secs.forEach(function(s){
          var pick=null;
          for(var i=fronts.length-1;i>=0;i--){
            var y=fronts[i];
            if(y.arrAbs+75>s.dep)continue;
            if(y.arrAbs<s.dep-3*1440)break;
            if(used.has(y)||y.f.to!==s.c.fr)continue;
            pick=y;break;
          }
          if(pick){used.add(pick);map.set(pick,s)}
        });
        PAIR928[code]=map;
      }
      var s2=PAIR928[code].get(x);
      if(!s2)return secList72(code).length?null:undefined;
      return {f:s2.c,date:s2.cd,di:s2.di,depAbs:s2.dep,arrAbs:s2.dep+durOn72(s2.c,s2.cd),u:0,synthR72:1};
    }catch(_){return undefined}
  }
