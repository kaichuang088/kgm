from common import *
L='kgm-0909E-r229'
li=SRC.index('<script id="'+L+'"');le=SRC.index('</script>',li);LAY=SRC[li:le]
# ══ 1006A #15：日期解析 —— 「11/24」「01-21 ~ 02-10 (2027)」「1月21日」 ══
RL('ai dateOf',L,
 "  function dateOf(s){var y=+T().slice(0,4),m;\n    if((m=/(\\d{4})[-\\/.](\\d{1,2})[-\\/.](\\d{1,2})/.exec(s)))return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);\n    if((m=/(\\d{1,2})\\s*[\\/月]\\s*(\\d{1,2})/.exec(s))){var d=y+'-'+('0'+m[1]).slice(-2)+'-'+('0'+m[2]).slice(-2);if(d<T())d=(y+1)+d.slice(4);return d}return ''}",
 "  /* 1006A：日期一律聽得懂 —— 2027-01-21、1/21、01-21、1月21日；整句裡寫了「(2027)」「2027年」就用那一年；沒寫年份而且已經過了就是明年 */\n"
 "  function yearOf6(s){var m=/(?:^|[^\\d])(20\\d{2})(?=\\s*(?:年|\\)|）|$|[^\\d\\-\\/.]))/.exec(String(s||''));return m?+m[1]:0}\n"
 "  function dateOf(s,yy){var y=+T().slice(0,4),m;s=String(s||'');yy=yy||yearOf6(s);\n"
 "    if((m=/(\\d{4})\\s*[-\\/.年]\\s*(\\d{1,2})\\s*[-\\/.月]\\s*(\\d{1,2})/.exec(s)))return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);\n"
 "    if((m=/(?:^|[^\\dA-Za-z])(\\d{1,2})\\s*[\\/月\\-.]\\s*(\\d{1,2})(?![\\d%])/.exec(s))&&+m[1]>=1&&+m[1]<=12&&+m[2]>=1&&+m[2]<=31){var Y=yy||y,d=Y+'-'+('0'+m[1]).slice(-2)+'-'+('0'+m[2]).slice(-2);if(!yy&&d<T())d=(Y+1)+d.slice(4);return d}return ''}")
RL('ai rangeOf',L,
 "    var re=/((?:\\d{4}[-\\/.])?\\d{1,2}[-\\/.月]\\d{1,2}日?)\\s*(?:~|-|到|至|–)\\s*((?:\\d{4}[-\\/.])?\\d{1,2}[-\\/.月]\\d{1,2}日?)/,m=re.exec(t);\n    if(m){var a=dateOf(m[1]),b=dateOf(m[2]);",
 "    var re=/((?:\\d{4}[-\\/.年])?\\d{1,2}[-\\/.月]\\d{1,2}日?)\\s*(?:~|-|到|至|–)\\s*((?:\\d{4}[-\\/.年])?\\d{1,2}[-\\/.月]\\d{1,2}日?)/,m=re.exec(t),yy6=yearOf6(t);\n    if(m){var a=dateOf(m[1],yy6),b=dateOf(m[2],yy6);")
# 對話泡泡可以放我們自己產生的表格（換班方案）
RL('ai draw html',L,
 "return '<div class=\"k929ai-m '+(m.role==='user'?'u':'a')+'\"><div>'+E(m.text).replace(/\\n/g,'<br>')+'</div>'",
 "return '<div class=\"k929ai-m '+(m.role==='user'?'u':'a')+(m.html?' k6w':'')+'\"><div>'+(m.html||E(m.text).replace(/\\n/g,'<br>'))+'</div>'")
# ══ 新工具：票價家族開關、換班方案選擇 ══
RL('ai tools add',L,
 "    set_state:{tab:'syscfg',sys:true,zh:'直接修改資料',",
 r"""    /* 1006A：「關閉01-21 ~ 02-10 (2027) 所有航線經濟艙「基本」票價」—— 依艙等＋票價家族＋日期區間＋航線關閉／重新開放 */
    fare_bucket:{tab:'price',zh:'關閉／開放票價家族（基本／超值／豪華）',run:function(a){
      var act=a.action==='open'?'open':'close',fam=({basic:'Basic',value:'Value',deluxe:'Deluxe'})[String(a.family||'').toLowerCase()]||a.family||'';
      if(!/^(Basic|Value|Deluxe)$/.test(fam))return {ok:false,msg:z()?'要指定票價家族：基本／超值／豪華。':'Specify Basic / Value / Deluxe.'};
      var cz={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙'},fz={Basic:'基本',Value:'超值',Deluxe:'豪華'};
      var desc=(a.fr||a.toAp?((a.fr||'任何地點')+'→'+(a.toAp||'任何地點')):'所有航線')+'　'+(a.cabin?cz[a.cabin]||a.cabin:'所有艙等')+'「'+fz[fam]+'」　'+(a.from?(a.from+'～'+(a.to||a.from)):'不限日期');
      S.fareBucketsR1006A=S.fareBucketsR1006A||[];
      if(act==='open'){var n=0;S.fareBucketsR1006A.forEach(function(x){if(!x||x.off||x.family!==fam)return;if(a.cabin&&x.cabin&&x.cabin!==a.cabin)return;if(a.fr&&x.fr&&x.fr!==a.fr)return;if(a.toAp&&x.toAp&&x.toAp!==a.toAp)return;if(a.from&&x.to&&x.to<a.from)return;if(a.to&&x.from&&x.from>a.to)return;x.off=true;x.offBy=me().empId||'';n++});try{save()}catch(_){}
        return {ok:n>0,msg:n?((z()?'已重新開放：':'Reopened: ')+desc+(z()?'（解除 '+n+' 筆關閉）':'')):(z()?'這個範圍目前沒有被關閉的票價。':'Nothing closed in that range.')}}
      S.fareBucketsR1006A.push({id:'FB'+Date.now().toString(36).toUpperCase(),action:'close',family:fam,cabin:a.cabin||'',fr:a.fr||'',toAp:a.toAp||'',from:a.from||'',to:a.to||a.from||'',by:me().empId||'',at:new Date().toISOString()});try{save()}catch(_){}
      return {ok:true,msg:(z()?'已關閉：':'Closed: ')+desc+(z()?'。訂位頁該期間不再出現這個票價家族（其他家族照常販售），要恢復說「重新開放…」。':'')}}},
    crew_swap_pick:{tab:'sched',zh:'選定換班方案並寫入班表',run:function(a){return swapPick6(+a.n||1)}},
    set_state:{tab:'syscfg',sys:true,zh:'直接修改資料',""")
# 規則清單也列出被關閉的票價家族
RL('ai rule list buckets',L,
 "      return {ok:true,msg:l.length?l.map(function(r){return r.id+'　'+ruleTxt(r)}).join('\\n'):(z()?'目前沒有特殊票價規則。':'No rules.')}}},",
 "      var fb=(S.fareBucketsR1006A||[]).filter(function(x){return x&&!x.off}),fz={Basic:'基本',Value:'超值',Deluxe:'豪華'};   /* 1006A */\n"
 "      var t1=l.length?l.map(function(r){return r.id+'　'+ruleTxt(r)}).join('\\n'):(z()?'目前沒有特殊票價規則。':'No rules.');\n"
 "      return {ok:true,msg:t1+(fb.length?('\\n'+(z()?'關閉中的票價家族：':'Closed fare families:')+'\\n'+fb.map(function(x){return x.id+'　'+(x.fr||x.toAp?((x.fr||'*')+'→'+(x.toAp||'*')):'所有航線')+' '+(({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙'})[x.cabin]||x.cabin||'所有艙等')+'「'+fz[x.family]+'」 '+(x.from||'')+'～'+(x.to||'')}).join('\\n')):'')}}},")
# ══ 1006A #13：換班 —— 不再整份重排模擬（那就是卡死、連線逾時的原因），改成在現有班表上算出前三個合法方案，
#    每個方案列出「申請人換班後的班表」與「對方換班後的班表」，由問的人自己選；選了才寫入班表。 ══
ci=LAYOVER=None
a0=LAY.index('  function crewSwap(a){')
a1=LAY.index('  /* 1004B：待處理事項總覽',a0)
old=LAY[a0:a1]
new=r'''  function crewSwap(a){
    /* 1006A：換班改成「在現有班表上找前三個合法方案，列出新班表讓人選」，不跑整份重排 —— 原本每試一位就整份重算 8 天，
       Chrome 跳「網頁沒有回應」、Worker 等到逾時變成「連線錯誤」。 */
    try{
      var K=window.kgmCrewSwapKitR1006A;if(!K)return {ok:false,msg:'—'};
      var t=String(a.text||[a.empId,a.date,a.dest||a.to||'',a.code||''].join(' ')),ids=[],m,re=/\b([A-Z]\d{5,6})\b/g,st=K.crewAll();
      while((m=re.exec(t.toUpperCase()))){if(st[m[1]]&&ids.indexOf(m[1])<0)ids.push(m[1])}
      Object.keys(st).forEach(function(id){var n=String(st[id].name||'');if(n.length>3&&t.toLowerCase().indexOf(n.toLowerCase())>=0&&ids.indexOf(id)<0)ids.push(id)});
      var date=a.date&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)?a.date:dateOf(t);
      if(!ids.length)return {ok:false,msg:z()?'請寫出組員員工編號或姓名（例如 K60012）。':'Need an employee ID.'};
      if(!date)return {ok:false,msg:z()?'請寫出日期（例如 10/12）。':'Need a date.'};
      var code=(/\bKX\s?(\d{1,4})\b/i.exec(t)||[])[1],aps=apsOf(t);
      var th={role:'assistant',text:'',pending:true,at:new Date().toISOString()};chat().push(th);persist();draw();
      var X=ids[0],Y=ids[1]||'';
      K.warm(K.AD(date,10),function(){setTimeout(function(){
        swapBuild6(K,X,Y,date,code?'KX'+code:'',aps).then(function(r){return r},function(e){return {text:String(e&&e.message||e)}}).then(function(r){
          th.pending=false;th.text=r.text||'';th.html=r.html||'';th.at=new Date().toISOString();persist();draw()});
      },0)});
      return {ok:true,quiet:true,msg:(z()?'正在找 '+((st[X]||{}).name||X)+' '+date+' 可以對調的人，算好會列出前三個方案與換班後的新班表…':'Finding swap options…')};
    }catch(e){return {ok:false,msg:String(e.message||e)}}
  }
  async function swapBuild6(K,X,Y,date,code,aps){
    var st=K.crewAll(),REAL=K.crewStaff(),fam=function(x){try{return window.kgmTypeFamilyR121(x)}catch(_){return x}};
    /* 每一天的班表只取一次（kgmCrewPlanR121 每呼叫一次都會重跑當日的鏈指派），之後查誰都是查表 */
    var PM={},IX={},yieldUI=function(){return new Promise(function(r){setTimeout(r,0)})};
    function planOf(d){if(!PM[d]){try{PM[d]=window.kgmCrewPlanR121(d)||{}}catch(_){PM[d]={}}var ix={};((PM[d].flights)||[]).forEach(function(f){(f.pilots||[]).concat(f.cabin||[]).forEach(function(q){if(q&&q.empId)(ix[q.empId]=ix[q.empId]||[]).push(f)})});Object.keys(ix).forEach(function(k){ix[k].sort(function(u,v){return (u.depUTC||0)-(v.depUTC||0)})});IX[d]=ix}return PM[d]}
    var legsOf=function(id,d){planOf(d);return (IX[d]&&IX[d][id])||[]};
    for(var w6=-4;w6<=10;w6++){planOf(K.AD(date,w6));await yieldUI()}
    function tripF(id,d0){var out=[],d=d0,g=0;while(g++<7){var fs=legsOf(id,d);if(fs.length){fs.forEach(function(f){out.push({d:d,f:f})});if(window.kgmSameCityR928(fs[fs.length-1].to,'TPE'))break}else if(!out.length)break;d=K.AD(d,1)}return out}
    var dx=null;((planOf(date).flights)||[]).some(function(f){var q=(f.pilots||[]).concat(f.cabin||[]).filter(function(y){return y&&y.empId===X})[0];if(q){dx={f:f,q:q};return true}});
    if(!dx)return {text:((st[X]||{}).name||X)+' '+date+(z()?' 沒有排到航班，不需要換班（要休假請說「移除 '+X+' '+date+' 的班表」）。':' has no duty.')};
    var rkX=K.rankOf(dx.q),roleX=(st[X]||{}).role||'cabin';
    var tx=tripF(X,date);
    var cands=[];
    var p=planOf(date);
    ((p&&p.flights)||[]).forEach(function(f){
      if(f.code===dx.f.code)return;
      if(code&&f.code!==code)return;
      if(!code&&aps.length&&aps.indexOf(f.to)<0&&aps.indexOf(f.fr)<0)return;
      if(fam(f.type)!==fam(dx.f.type))return;
      try{if(!window.kgmSameCityR928(f.fr,dx.f.fr))return}catch(_){}
      ((roleX==='pilot')?(f.pilots||[]):(f.cabin||[])).forEach(function(q){
        if(!q||!q.empId||q.empId===X||K.rankOf(q)!==rkX)return;
        if(Y&&q.empId!==Y)return;
        /* 正式組員優先；不足三位時，排班池的組員（班表上一樣是實名的人）也列入 */
        if(!cands.some(function(c){return c.id===q.empId}))cands.push({id:q.empId,name:(st[q.empId]||q).name||q.empId,f:f,v:REAL[q.empId]?0:1});
      });
    });
    if(!cands.length)return {text:z()?('找不到可以對調的人：'+date+' 符合條件（同機型族、同階級、同一站出發'+(code?'、'+code:aps.length?'、'+aps.join('/'):'')+'）的航班上沒有正式組員。'):'No candidate.'};
    function key(l){return l.d+'|'+l.f.code+'|'+l.f.fr}
    function lastArr(tr){return tr.length?((+tr[tr.length-1].f.arrUTC||0)+30):0}
    function restAfter(tr){var f=tr.length?tr[tr.length-1].f:null;if(!f)return 720;return Math.max(+f.minimumRestMinutes||0,(+f.block||0)>=480?2880:720)}
    function prevReady(id){for(var k=1;k<=4;k++){var fs=legsOf(id,K.AD(date,-k));if(fs.length){var f=fs[fs.length-1];return (+f.arrUTC||0)+30+Math.max(+f.minimumRestMinutes||0,(+f.block||0)>=480?2880:720)}}return 0}
    function nextDuty(id,from,skip){for(var k=1;k<=4;k++){var d=K.AD(from,k),fs=legsOf(id,d).filter(function(f){return !skip[d+'|'+f.code+'|'+f.fr]});if(fs.length)return fs[0]}return null}
    /* 硬條件只有「換班前休息夠」（過去改不了）；換班期間或剛結束時原本的別班，核准後由排班引擎改派給其他人 —— 列在預覽裡，衝突越少的方案排越前面 */
    function check(id,mine,theirs){
      var skip={};mine.forEach(function(l){skip[key(l)]=1});
      var end=theirs.length?theirs[theirs.length-1].d:date,give=[];
      if(theirs.length&&prevReady(id)>(+theirs[0].f.depUTC||0)-60)return {hard:z()?'換班前休息不足':'insufficient rest before'};
      K.each(date,end,function(d){legsOf(id,d).forEach(function(f){if(!skip[d+'|'+f.code+'|'+f.fr])give.push(d+'|'+f.code+'|'+f.fr)})});
      var nd=nextDuty(id,end,skip),post=0;
      if(nd&&(+nd.depUTC||0)-60<lastArr(theirs)+restAfter(theirs)){var nd0=nd.date||'';K.each(K.AD(end,1),K.AD(end,4),function(d){legsOf(id,d).forEach(function(f){if(f===nd){give.push(d+'|'+f.code+'|'+f.fr);post=d}})})}
      return {hard:'',give:give,post:post};
    }
    var ok=[],rej=0;
    cands.sort(function(a,b){return a.v-b.v});var tried6=0;
    for(var ci6=0;ci6<cands.length;ci6++){var c=cands[ci6];if(ok.length>=8||tried6++>40)break;if(ci6%4===3)await yieldUI();var tc=tripF(c.id,date);
      if(!tc.length||!tx.length)continue;var e1=check(X,tx,tc),e2=check(c.id,tc,tx);if(e1.hard||e2.hard){rej++;continue}c.tc=tc;c.gx=e1;c.gy=e2;c.n=e1.give.length+e2.give.length;ok.push(c)}
    ok.sort(function(a,b){return (a.v||0)-(b.v||0)||a.n-b.n});ok=ok.slice(0,3);
    if(!ok.length)return {text:z()?('有 '+cands.length+' 位同機型族、同階級、同站出發的人，但換班前的休息時間都不夠（前一天剛落地）。請換一天或換目的地。'):'No legal option.'};
    function txt(tr,d){return tr.filter(function(l){return l.d===d}).map(function(l){return l.f.code+' '+l.f.fr+'→'+l.f.to}).join('、')}
    function dayTxt(id,d){return legsOf(id,d).map(function(f){return f.code+' '+f.fr+'→'+f.to}).join('、')||(z()?'休':'Off')}
    function afterTxt(id,mine,theirs,d,gv){var skip={};mine.forEach(function(l){skip[key(l)]=1});var gs={};(gv||[]).forEach(function(k){gs[k]=1});var keep=[],handed=[];legsOf(id,d).forEach(function(f){var k=d+'|'+f.code+'|'+f.fr;if(skip[k])return;if(gs[k])handed.push(f.code);else keep.push(f.code+' '+f.fr+'→'+f.to)});var add=txt(theirs,d);if(add)keep.push(add);if(handed.length)keep.push((z()?'（原本 ':'(')+handed.join('、')+(z()?' 改由他人接手）':' reassigned)'));
      var inTrip=theirs.length&&d>=theirs[0].d&&d<=theirs[theirs.length-1].d;return keep.join('、')||(inTrip?(z()?'外站過夜':'Layover'):(z()?'休':'Off'))}
    var a0=K.AD(date,-1),days=[];for(var i=0;i<8;i++)days.push(K.AD(a0,i));
    var opts=ok.map(function(c,i){
      var tc=c.tc,end=[tx[tx.length-1].d,tc[tc.length-1].d].sort()[1],pins={},exD={};
      K.each(date,end,function(d){exD[d]=1});[c.gx.post,c.gy.post].forEach(function(d){if(d)exD[d]=1});   /* 換班後休息不夠的下一班也讓引擎改派 */
      function give(id,tr){var e=tr[tr.length-1].d;K.each(date,e,function(d){var v=tr.filter(function(l){return l.d===d}).map(function(l){return l.f.code+'@'+l.f.fr}).join('|');(pins[d]=pins[d]||{})[id]=v||'__LAYOVER__'})}
      give(X,tc);give(c.id,tx);
      return {id:c.id,name:c.name,flight:c.f.code+' '+c.f.fr+'→'+c.f.to,end:end,pins:pins,exD:exD,fromX:tx.map(function(l){return l.d.slice(5)+' '+l.f.code}).join('、'),fromY:tc.map(function(l){return l.d.slice(5)+' '+l.f.code}).join('、'),
        n:c.n,rows:days.map(function(d){var bx=dayTxt(X,d),ax=afterTxt(X,tx,tc,d,c.gx.give),by=dayTxt(c.id,d),ay=afterTxt(c.id,tc,tx,d,c.gy.give);return {d:d,bx:bx,ax:ax,by:by,ay:ay}})};
    });
    S.adminAiSwapOptsR1006A={X:X,xName:(st[X]||{}).name||X,date:date,opts:opts,at:Date.now()};
    var cell=function(b,a){return a===b?E(a):('<b>'+E(a)+'</b><s>'+E(b)+'</s>')};
    var html='<div class="k6sw-top">'+(z()?'<b>'+E((st[X]||{}).name||X)+'（'+E(X)+'）'+E(date)+'</b> 原本飛 '+E(opts[0].fromX)+'。下面是前 '+opts.length+' 個合法方案（同機型族、同階級、同站出發，休息時間都夠），每個方案都列出<b>你換班後</b>與<b>對方換班後</b>的班表，選一個就會寫入班表並通知兩位：':'Pick one of these legal swaps:')+'</div>'
      +opts.map(function(o,i){return '<div class="k6sw"><div class="k6sw-h"><span>'+(z()?'方案 ':'Option ')+(i+1)+'</span><b>'+E(o.name)+'</b> <small>'+E(o.id)+'　原本飛 '+E(o.fromY)+'</small></div>'
        +(o.n?'<div class="k6sw-n">'+(z()?'核准後有 '+o.n+' 段原本的班改由其他人接手（表格中標示）':'')+'</div>':'')+'<div class="k6sw-t"><table><thead><tr><th>'+(z()?'日期':'Date')+'</th><th>'+E((st[X]||{}).name||X)+(z()?'（換班後）':' (after)')+'</th><th>'+E(o.name)+(z()?'（換班後）':' (after)')+'</th></tr></thead><tbody>'
        +o.rows.map(function(r){return '<tr'+(r.d===date?' class="on"':'')+'><td>'+E(r.d.slice(5))+'</td><td>'+cell(r.bx,r.ax)+'</td><td>'+cell(r.by,r.ay)+'</td></tr>'}).join('')+'</tbody></table></div>'
        +'<button class="k6sw-go" onclick="kgmAdminAiAskR929(\'選方案 '+(i+1)+'\')">'+(z()?'選這個方案':'Choose')+'</button></div>'}).join('')
      +(rej?'<div class="k6sw-n">'+(z()?'另有 '+rej+' 位換班前的休息時間不夠（前一天剛落地），已排除。':'')+'</div>':'');
    return {text:(z()?'換班方案 ':'Swap options ')+opts.map(function(o,i){return (i+1)+'. '+o.name}).join('　'),html:html};
  }
  function swapPick6(n){
    var o=S.adminAiSwapOptsR1006A;if(!o||!o.opts||!o.opts.length)return {ok:false,msg:z()?'目前沒有換班方案，先說「K60012 10/12 想換到東京的班」。':'No swap options.'};
    var c=o.opts[Math.max(0,Math.min(o.opts.length-1,n-1))];
    S.crewAiR928={ok:true,text:'AI',at:new Date().toISOString(),msgs:[],date:o.date,end:c.end,pins:c.pins,exD:c.exD,
      X:{id:o.X,name:o.xName,from:c.fromX,to:c.fromY},Y:{id:c.id,name:c.name,from:c.fromY,to:c.fromX}};
    try{window.kgmCrewAiApproveR928()}catch(e){return {ok:false,msg:String(e.message||e)}}
    S.adminAiSwapOptsR1006A=null;
    return {ok:true,msg:(z()?'已套用方案 ':'Applied option ')+n+'：'+o.xName+' ⇄ '+c.name+' '+o.date+(z()?'。班表在背景重排（不會卡住畫面），完成後兩位與其他受影響的組員都會收到通知。':'')};
  }
'''
R('ai crewSwap async options',old,new)
# 在 plan() 裡認得「選方案 n」與票價家族開關
RL('ai plan pick+bucket',L,
 "    if(/核准.*換班|換班.*核准|approve/i.test(t))return [{tool:'crew_swap_approve'}];",
 "    if(/核准.*換班|換班.*核准|approve/i.test(t))return [{tool:'crew_swap_approve'}];\n"
 "    /* 1006A：選換班方案 */\n"
 "    var pk6=/(?:選|用|採用|套用)?\\s*(?:第\\s*)?(\\d)\\s*(?:個)?\\s*方案|方案\\s*(\\d)|(?:選|用)\\s*第\\s*(\\d)\\s*(?:位|個)/.exec(t);if(pk6&&S.adminAiSwapOptsR1006A)return [{tool:'crew_swap_pick',args:{n:+(pk6[1]||pk6[2]||pk6[3])}}];\n"
 "    /* 1006A：關閉／開放票價家族（基本／超值／豪華），日期聽得懂 01-21 ~ 02-10 (2027) */\n"
 "    var fb6=/(關閉|關掉|停售|下架|不賣|開放|重新開放|恢復|恢復販售)/.exec(t),fm6=/(基本|超值|豪華|basic|value|deluxe)/i.exec(t.replace(/豪華經濟艙?|豪經/g,'◇'));\n"
 "    if(fb6&&fm6&&!/規則/.test(t)){var r6=rangeOf(t),ap6=apsOf(t).filter(function(x){return typeof x==='string'}),all6=/所有航線|全部航線|全航線|全線|all routes/i.test(t);\n"
 "      var fam6=({'基本':'Basic','超值':'Value','豪華':'Deluxe'})[fm6[1]]||({basic:'Basic',value:'Value',deluxe:'Deluxe'})[fm6[1].toLowerCase()];\n"
 "      if(fam6)return [{tool:'fare_bucket',args:{action:/開放|恢復/.test(fb6[1])?'open':'close',family:fam6,cabin:cabOf(t),from:r6.from,to:r6.to,fr:all6?'':(ap6[0]||''),toAp:all6?'':(ap6[1]||'')}}]}")
# exec：非同步的換班結果另外補一則，第一則不要寫「✓」
RL('ai exec quiet',L,
 "    var lines=r.out.map(function(o){return (o.ok?'✓ ':(o.denied?'⛔ ':'✕ '))+o.msg});",
 "    var lines=r.out.map(function(o){return (o.quiet?'':(o.ok?'✓ ':(o.denied?'⛔ ':'✕ ')))+o.msg});")
# 換班卡片樣式
RL('ai css swap',L,
 "      +'@media(max-width:520px){#kgmAdminAi929{right:12px}",
 "      +'.k929ai-m.k6w{max-width:100%}.k6sw-top{font-size:12px;line-height:1.7;margin-bottom:8px}.k6sw{border:1px solid #ece7da;border-radius:10px;padding:8px 9px;margin:8px 0;background:#fffdf9}'\n"
 "      +'.k6sw-h{font-size:12px;margin-bottom:6px}.k6sw-h span{display:inline-block;background:#1f1e1d;color:#fff;border-radius:999px;padding:1px 8px;font-size:10.5px;margin-right:6px}.k6sw-h small{display:block;color:#8a8175;font-size:10.5px;margin-top:2px}'\n"
 "      +'.k6sw-t{overflow-x:auto}.k6sw-t table{width:100%;border-collapse:collapse;font-size:10.5px}.k6sw-t th{text-align:left;color:#8a8175;font-weight:700;padding:3px 4px;border-bottom:1px solid #eee}.k6sw-t td{padding:3px 4px;border-bottom:1px solid #f3efe6;vertical-align:top}'\n"
 "      +'.k6sw-t tr.on td{background:#fbf3e3}.k6sw-t td b{color:#0b493b}.k6sw-t td s{display:block;color:#b0a999;font-size:9.5px}.k6sw-go{margin-top:7px;width:100%;border:0;background:#D97757;color:#fff;border-radius:8px;padding:7px;font-weight:800;cursor:pointer}.k6sw-n{font-size:10.5px;color:#8a8175}'\n"
 "      +'@media(max-width:520px){#kgmAdminAi929{right:12px}")
# 票價家族關閉要真的生效：在最外層的 validCodes 再過濾一次
RL('ai validCodes buckets',L,
 "  if(typeof render==='function'){var rdA=render;render=window.render=function(){var r=rdA.apply(this,arguments);setTimeout(draw,0);return r}}\n  setTimeout(draw,1500);",
 "  if(typeof render==='function'){var rdA=render;render=window.render=function(){var r=rdA.apply(this,arguments);setTimeout(draw,0);return r}}\n  setTimeout(draw,1500);\n"
 "  /* 1006A：被關閉的票價家族（後台 AI fare_bucket）在訂位頁不賣 */\n"
 "  try{var vc6=validCodes;validCodes=window.validCodes=function(f){var out=vc6.apply(this,arguments)||[];try{var Lb=(S.fareBucketsR1006A||[]).filter(function(x){return x&&!x.off&&x.action==='close'});if(!Lb.length||!f||typeof f!=='object')return out;var d=f.date||(S.search&&S.search.dep)||T();\n"
 "    out=out.filter(function(c){var F=FARES[c]||{};return !Lb.some(function(x){return F.tierEN===x.family&&(!x.cabin||x.cabin===F.cabin)&&(!x.from||d>=x.from)&&(!x.to||d<=x.to)&&(!x.fr||x.fr===f.fr)&&(!x.toAp||x.toAp===f.to)})})}catch(_){}return out};window.kgmFareBucketOpenR1006A=function(code,f){return validCodes(f).indexOf(code)>=0}}catch(_){}")
# 換班引擎的工具函式匯出給後台 AI（引擎裡的函式是區域變數，外面拿不到）
RL('crew kit export',L,
 "    window.kgmCrewAiApproveR928=function(){",
 "    window.kgmCrewSwapKitR1006A={trip:trip,dutyAll:dutyAll,dutyOn:dutyOn,chainTxt:chainTxt,warm:warm,AD:AD,each:each,crewStaff:crewStaff,crewAll:crewAll,rankOf:rankOf};   /* 1006A */\n    window.kgmCrewAiApproveR928=function(){")
# help 範例
RL('ai help examples',L,
 "· K60012 10/12 想換到東京的班（會列出至少三位候選）",
 "· K60012 10/12 想換到東京的班（列出前三個方案與換班後的新班表，回「選方案 2」）\\n· 關閉 01-21 ~ 02-10 (2027) 所有航線經濟艙「基本」票價／重新開放…")
# ══ 1006A #15：前台 AI 聽不懂「11/24」—— 只認得 2026-11-24 與「11月24日」 ══
R('front AI parseDate',
 "function parseDateI(t){var m=t.match(/20\\d{2}[-\\/]\\d{1,2}[-\\/]\\d{1,2}/);if(m){var a=m[0].split(/[-\\/]/);return a[0]+'-'+a[1].padStart(2,'0')+'-'+a[2].padStart(2,'0')}m=t.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*[日號号]?/);if(m)return String(new Date().getFullYear())+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0');",
 "function parseDateI(t){t=String(t||'').replace(/[０-９]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-65248)});var m=t.match(/20\\d{2}\\s*[-\\/.年]\\s*\\d{1,2}\\s*[-\\/.月]\\s*\\d{1,2}/);if(m){var a=m[0].split(/\\s*[-\\/.年月]\\s*/);return a[0]+'-'+a[1].padStart(2,'0')+'-'+a[2].padStart(2,'0')}\n"
 "  /* 1006A：「11/24」「11-24」「11月24日」都聽得懂；沒寫年份而且已經過了就是明年；句子裡有「2027年」「(2027)」就用那一年 */\n"
 "  var yy=(t.match(/(?:^|[^\\d])(20\\d{2})\\s*(?:年|\\)|）)/)||[])[1];m=t.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*[日號号]?/)||t.match(/(?:^|[^\\dA-Za-z])(\\d{1,2})\\s*[\\/\\-.]\\s*(\\d{1,2})(?![\\d%])/);\n"
 "  if(m&&+m[1]>=1&&+m[1]<=12&&+m[2]>=1&&+m[2]<=31){var today=itI(),Y=yy?+yy:+today.slice(0,4),d=Y+'-'+String(m[1]).padStart(2,'0')+'-'+String(m[2]).padStart(2,'0');if(!yy&&d<today)d=(Y+1)+d.slice(4);return d}")
save('p_h_ai6b.js','/* 1006A · 後台 AI：日期、票價家族、換班方案 */\n')
