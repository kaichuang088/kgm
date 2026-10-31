  /* 1008A：跨日改班（例：「K10597 想把 KX152 10-22 改 TPE-KIX 並且改到 10-21 回程 10-23 可以 DH 可以服務 KIX-TPE/UKB-TPE」）
     站內引擎先把需求拆清楚、在現有班表上算出可行的組合（去程哪一班、回程執勤或 DH、原本那班誰能接手），列成方案；
     跨日改班需要整段重排，寫入班表仍由組員班表頁核准（或交給 Worker 上的 Claude）。 */
  function md8(s,base){var iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(iso)return s;var m=/(\d{1,2})[\/\-.](\d{1,2})/.exec(s);if(!m)return '';var y=+String(base||T()).slice(0,4),d=y+'-'+String(+m[1]).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0');if(d<T().slice(0,4)+'-01-01')d=(y+1)+d.slice(4);return d}
  function tripChange8(a){
    try{
      var K=window.kgmCrewSwapKitR1006A;if(!K)return {ok:false,msg:'—'};
      /* Worker 上的 Claude 會用結構化參數呼叫；站內引擎傳原始句子 */
      var t=String(a.text||'');if(!t&&a.empId)t=[a.empId,a.code||'',a.fromDate||'','改',(a.toFr||'TPE')+'-'+(a.toTo||''),'改到',a.toDate||'','回程',a.returnDate||'',(a.returnRoutes||[]).join('/'),a.dh?'DH':''].join(' ');
      var U=t.toUpperCase(),st=K.crewAll();
      var X=((/\b([A-Z]\d{5,6})\b/.exec(U)||[])[1])||'';if(!X||!st[X])return {ok:false,msg:z()?'請寫出組員員工編號（例如 K10597）。':'Need an employee ID.'};
      var code=((/\b(KX\s?\d{1,4})\b/.exec(U)||[])[1]||'').replace(/\s+/g,'');
      var dAll=[],re=/(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-.]\d{1,2})/g,m;while((m=re.exec(t)))dAll.push({i:m.index,d:md8(m[1])});
      var at=function(rx){var k=t.search(rx);if(k<0)return '';var x=dAll.filter(function(o){return o.i>k})[0];return x?x.d:''};
      var d1=(function(){if(!code)return dAll[0]&&dAll[0].d;var k=U.indexOf(code);var x=dAll.filter(function(o){return o.i>k})[0];return x?x.d:(dAll[0]&&dAll[0].d)})();
      var d2=at(/改到|改成|提前到|延到|換到/)||((dAll[1]||{}).d)||d1,d3=at(/回程|回來|返回|回台/)||'';
      var prs=[],rp=/\b([A-Z]{3})\s*[-–→>\/]\s*([A-Z]{3})\b/g;while((m=rp.exec(U)))prs.push([m[1],m[2]]);
      /* 「KIX-TPE/UKB-TPE」：斜線後面那一段也算一個回程選項 */
      var rp2=/\/\s*([A-Z]{3})\s*[-–→>]\s*([A-Z]{3})\b/g;while((m=rp2.exec(U)))if(!prs.some(function(p){return p[0]===m[1]&&p[1]===m[2]}))prs.push([m[1],m[2]]);
      var out=prs[0]||null,rets=prs.slice(1),dhOk=/DH|調位|搭機回|以旅客/.test(U);
      if(!out)return {ok:false,msg:z()?'請寫出要改去的航線（例如 TPE-KIX）。':'Need the new route.'};
      var th={role:'assistant',text:'',pending:true,at:new Date().toISOString()};chat().push(th);persist();draw();
      K.warm(K.AD(d3||d2,3),function(){setTimeout(function(){
        var txt=[],PM={};
        function plan(d){if(!PM[d]){try{PM[d]=window.kgmCrewPlanR121(d)||{}}catch(_){PM[d]={}}}return PM[d]}
        function crewOf(f,role){return ((role==='pilot')?(f.pilots||[]):(f.cabin||[]))}
        function flies(f,d){try{return flyOn(f,new Date(d+'T12:00:00'))}catch(_){return false}}
        function sched(fr,to,d){return [].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&!f.via&&!f.partner&&f.fr===fr&&f.to===to&&flies(f,d)}).map(function(f){var sf=f;try{sf=window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(f,d)||f):f}catch(_){}return sf}).sort(function(x,y){return String(x.dep).localeCompare(String(y.dep))})}
        var nm=(st[X]||{}).name||X,role=(st[X]||{}).role||'cabin',cur=null,q0=null;
        ((plan(d1).flights)||[]).some(function(f){var q=(f.pilots||[]).concat(f.cabin||[]).filter(function(y){return y&&y.empId===X})[0];if(q&&(!code||f.code===code)){cur=f;q0=q;return true}});
        var rk=q0?K.rankOf(q0):'';
        txt.push((z()?'我理解的需求：':'Request: ')+nm+'（'+X+(rk?'・'+rk:'')+'）'+(cur?('原本 '+d1+' 飛 '+cur.code+' '+cur.fr+'→'+cur.to+' '+(cur.dep||'')):(d1+' 沒有找到 '+(code||'這一班')+' 的勤務'))
          +'，想改成 '+d2+' '+out[0]+'→'+out[1]+(d3?('，'+d3+' 回 '+(rets.length?rets.map(function(r){return r[0]+'→'+r[1]}).join(' 或 '):'TPE')+(dhOk?'（可 DH 或執勤）':'')):'')+'。');
        /* ① 去程 */
        var ob=sched(out[0],out[1],d2);
        txt.push('');txt.push(z()?'① 去程 '+d2+' '+out[0]+'→'+out[1]+'：':'① Outbound:');
        if(!ob.length)txt.push(z()?'　這一天沒有這條航線的班。':'　No flight that day.');
        ob.forEach(function(f){var pf=((plan(d2).flights)||[]).filter(function(x){return x.code===f.code&&x.fr===f.fr})[0],same=pf?crewOf(pf,role).filter(function(q){return q&&K.rankOf(q)===rk}):[];
          txt.push('　'+f.code+' '+f.dep+'–'+f.arr+'（'+(pf?(z()?'同職級組員 '+same.length+' 位'+(same.length?'：'+same.slice(0,3).map(function(q){return (st[q.empId]||q).name||q.empId}).join('、'):''):''):(z()?'組員尚未排定':'not crewed yet'))+'）')});
        /* ② 回程 */
        if(d3){txt.push('');txt.push(z()?'② 回程 '+d3+'：':'② Return:');
          (rets.length?rets:[[out[1],out[0]]]).forEach(function(r){var rb=sched(r[0],r[1],d3);
            if(!rb.length){txt.push('　'+r[0]+'→'+r[1]+(z()?'：這一天沒有班':': none'));return}
            rb.forEach(function(f){var pf=((plan(d3).flights)||[]).filter(function(x){return x.code===f.code&&x.fr===f.fr})[0],same=pf?crewOf(pf,role).filter(function(q){return q&&K.rankOf(q)===rk}).length:0,eco='';
              try{var inv=window.kgmCabinInventory54(Object.assign({},f,{date:d3}),d3,'Economy');eco=Math.max(0,(+inv.capacity||0)-(+inv.sold||0))}catch(_){}
              txt.push('　'+f.code+' '+r[0]+'→'+r[1]+' '+f.dep+'–'+f.arr+'：'+(z()?('執勤（目前同職級 '+same+' 位）'+(dhOk?('／DH（經濟艙約剩 '+eco+' 位）'):'')):('operate / DH')))})})}
        /* ③ 原本那一班誰來接 */
        if(cur){var busy={};((plan(d1).flights)||[]).forEach(function(f){(f.pilots||[]).concat(f.cabin||[]).forEach(function(q){if(q&&q.empId)busy[q.empId]=1})});
          var prev=K.AD(d1,-1),busyP={};((plan(prev).flights)||[]).forEach(function(f){(f.pilots||[]).concat(f.cabin||[]).forEach(function(q){if(q&&q.empId)busyP[q.empId]=1})});
          var free=Object.keys(st).filter(function(id){var p=st[id];return id!==X&&p&&p.role===role&&!busy[id]&&!busyP[id]&&(!rk||String(p.rank||'').toUpperCase()===rk||String(p.rankCode||'').toUpperCase()===rk)}).slice(0,3);
          txt.push('');txt.push(z()?('③ '+cur.code+' '+d1+' 的空缺：前一天與當天都沒有勤務、同職級可接手的組員 '+(free.length?free.map(function(id){return (st[id].name||id)+'（'+id+'）'}).join('、'):'找不到（需要從待命組員調派）')):'③ Replacement');}
        txt.push('');
        txt.push(z()?('建議：'+(ob[0]?('去程 '+ob[0].code+' '+d2):'去程無班')+(d3?('，回程 '+(dhOk?'以 DH 搭乘':'執勤')+' '+(function(){var r=(rets[0]||[out[1],out[0]]),rb=sched(r[0],r[1],d3);return rb[0]?rb[0].code+' '+r[0]+'→'+r[1]:'（當天無班）'})()):'')+'。跨日改班會連動前後幾天的休息時數，寫入班表請到「組員班表」核准；Worker 上的 Claude 連線後可以直接執行。'):'');
        th.pending=false;th.text=txt.join('\n');th.at=new Date().toISOString();persist();draw();
      },0)});
      return {ok:true,quiet:true,msg:z()?('正在分析 '+((st[X]||{}).name||X)+' 的改班需求（去程、回程與原班的接手人選）…'):'Analysing…'};
    }catch(e){return {ok:false,msg:String(e.message||e)}}
  }
