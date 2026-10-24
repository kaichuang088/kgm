function routesHtml68(){
  /* 1023A：航線管理重排（使用者：「那個航線管理太亂了」）
     原本依「出發洲 → 抵達洲」分 26 組、照出發地代碼排，同一條航線的去程與回程分在兩組，同一航段多個班號只顯示第一班的時刻。
     改成：依航點區域分組（REGIONS()，跟「新增航點」的區域同一份），一條航線一張卡片，左邊去程、右邊回程，
     每一個班號一行（班號／營運日／夏季／冬季／載入）；台灣以外兩站之間的段（第五航權、外站延伸段）放最後一組。 */
  var q=String(S.k68Q||'').trim().toUpperCase(),TW={TPE:1,TSA:1},RG={},ORD=[];
  try{var R=REGIONS();Object.keys(R).forEach(function(k){if(k==='台灣')return;ORD.push(k);(R[k]||[]).forEach(function(a){RG[a]=k})})}catch(_){}
  var OUT=z()?'外站之間（第五航權／延伸段）':'Between outstations (5th freedom / extensions)';
  function regOf(a){return RG[a]||contOf68(a)}
  var map=sectors68(),pairs={},n=0;
  Object.keys(map).forEach(function(k){
    var list=map[k],f=list[0],tw=TW[f.fr]||TW[f.to],a=tw?(TW[f.fr]?f.fr:f.to):[f.fr,f.to].sort()[0],b=a===f.fr?f.to:f.fr;
    if(q){var hay=(k+' '+CT(f.fr)+' '+CT(f.to)+' '+list.map(function(x){return x.code}).join(' ')).toUpperCase();if(hay.indexOf(q)<0)return}
    var key=a+'|'+b,g=tw?regOf(b):OUT;
    var p=pairs[key]=pairs[key]||{a:a,b:b,g:g,out:[],back:[]};
    (f.fr===a?p.out:p.back).push.apply(f.fr===a?p.out:p.back,list);n+=list.length;
  });
  var groups={};Object.keys(pairs).forEach(function(k){var p=pairs[k];(groups[p.g]=groups[p.g]||[]).push(p)});
  var order=ORD.filter(function(g){return groups[g]}).concat(Object.keys(groups).filter(function(g){return ORD.indexOf(g)<0&&g!==OUT}).sort()).concat(groups[OUT]?[OUT]:[]);
  var td=T(),y=+td.slice(0,4),sd=(td<=y+'-07-15'?y:y+1)+'-07-15',wd=(td<=y+'-01-15'?y:y+1)+'-01-15';
  var WD=z()?['一','二','三','四','五','六','日']:['M','T','W','T','F','S','S'];
  function daysOf(d){if(Array.isArray(d)&&d.length>=7&&[1,2,3,4,5,6,7].every(function(i){return d.indexOf(i)>=0}))d='daily';if(d==null||d==='daily')return '<span class="k23r-daily">'+(z()?'每日':'Daily')+'</span>';if(d==='none'||(Array.isArray(d)&&!d.length))return '';
    if(!Array.isArray(d))return '<span class="k23r-daily">'+E(String(d))+'</span>';var s='';for(var i=1;i<=7;i++)s+='<i class="'+(d.indexOf(i)>=0?'on':'')+'">'+WD[i-1]+'</i>';return '<span class="k23r-wd">'+s+'</span>'}
  function sea(f,date,key){var o=((S.seasonSchedulesR48||{})[[f.code,f.fr,f.to].join('|')]||{})[key]||{},r={dep:f.dep,arr:f.arr,days:o.days};
    try{var x=window.kgmSeasonFlightR48(f,date);if(x&&x.dep){r.dep=x.dep;r.arr=x.arr;r.dd=x.dd}}catch(_){}
    if(r.days==null&&f.seasonDaysR66)r.days=f.seasonDaysR66[key];if(r.days==null)r.days=f.days;
    r.off=r.days==='none'||(Array.isArray(r.days)&&!r.days.length);return r}
  function line(f){var su=sea(f,sd,'summer'),wi=sea(f,wd,'winter'),dl=0;try{dl=window.kgmWinterBlockDeltaR68(f.fr,f.to)}catch(_){}
    var tm=function(r){return r.off?'<em class="k23r-off">'+(z()?'不飛':'Not operating')+'</em>':('<b>'+E(r.dep)+'–'+E(r.arr)+(r.dd?'<sup>+'+r.dd+'</sup>':'')+'</b>'+daysOf(r.days))};
    return '<div class="k23r-fl"><span class="k23r-code">'+E(f.code)+'</span>'
      +'<span class="k23r-s"><small>'+(z()?'夏':'S')+'</small>'+tm(su)+'</span>'
      +'<span class="k23r-s"><small>'+(z()?'冬':'W')+'</small>'+tm(wi)+(dl&&!wi.off?'<u>'+(dl>0?'+':'')+dl+(z()?' 分':' min')+'</u>':'')+'</span>'
      +'<button class="k23r-open" type="button" onclick="kgmSchedPickR57(\''+A([f.code,f.fr,f.to].join('|'))+'\')">'+(z()?'載入':'Open')+'</button></div>'}
  function col(list,fr,to){list=list.slice().sort(function(x,y){return String(x.dep).localeCompare(String(y.dep))||String(x.code).localeCompare(String(y.code))});
    return '<div class="k23r-dir"><div class="k23r-dh">'+E(fr)+' → '+E(to)+'<small>'+list.length+(z()?' 班':' flights')+'</small></div>'
      +(list.length?list.map(line).join(''):'<div class="k23r-none">'+(z()?'沒有這個方向的航班':'No flights this way')+'</div>')+'</div>'}
  var head='<header><span>NETWORK</span><h3>'+(z()?'航線管理':'Route management')+'</h3></header>'
    +'<p class="k57-eff">'+(z()?('共 '+Object.keys(pairs).length+' 條航線、'+n+' 個班號航段，依航點區域分組；一條航線一張卡片，左邊去程、右邊回程。點「載入」編輯該班的夏／冬季班表。')
      :(Object.keys(pairs).length+' routes, '+n+' flight sectors by region. Outbound left, return right; open one to edit its seasonal timetable.'))+'</p>'
    +'<div class="k68-find"><input id="k68q" class="inp" placeholder="'+(z()?'搜尋航點、城市或航班號（例如 NRT、東京、KX180）':'Search airport, city or flight (e.g. NRT, Tokyo, KX180)')
      +'" value="'+A(S.k68Q||'')+'" onkeydown="if(event.key===\'Enter\')kgmRouteFindR68()">'
      +'<button class="k68-btn" onclick="kgmRouteFindR68()">'+(z()?'搜尋':'Search')+'</button>'
      +(q?('<button class="k68-btn ghost" onclick="S.k68Q=\'\';render()">'+(z()?'清除':'Clear')+'</button>'):'')+'</div>'
    +'<div class="k23r-jump">'+order.map(function(g){return '<button type="button" onclick="S.k68Open=S.k68Open||{};S.k68Open[\''+A(g)+'\']=true;render();setTimeout(function(){var e=document.querySelector(\'[data-k23r=&quot;'+A(g)+'&quot;]\');if(e)e.scrollIntoView({behavior:\'smooth\',block:\'start\'})},120)">'+E(g)+'<i>'+groups[g].length+'</i></button>'}).join('')+'</div>';
  if(!n)return '<section class="k57-card k57-routes k68-routes">'+head+'<div class="k68-empty">'+(z()?'找不到符合的航段。':'No sector matches that search.')+'</div></section>'+(window.kgmNewRouteHtmlR57?window.kgmNewRouteHtmlR57():'');
  var body=order.map(function(g){
    var L=groups[g].sort(function(x,y){return (x.a+x.b).localeCompare(y.a+y.b)}),open=!!q||(S.k68Open||{})[g]||(L.length<=4&&(S.k68Open||{})[g]!==false);
    return '<section class="k68-cont k23r-g'+(open?' on':'')+'" data-k23r="'+A(g)+'">'
      +'<button class="k68-cont-h" onclick="S.k68Open=S.k68Open||{};S.k68Open[\''+A(g)+'\']=!('+(open?'true':'false')+');render()"><b>'+E(g)+'</b><span>'+L.length+(z()?' 條航線':' routes')+'</span><i>'+(open?'−':'+')+'</i></button>'
      +(open?'<div class="k23r-list">'+L.map(function(p){
        return '<article class="k23r-card"><header><b>'+E(p.a)+' ⇄ '+E(p.b)+'</b><span>'+E(CT(p.a))+' ⇄ '+E(CT(p.b))+'</span></header>'
          +'<div class="k23r-cols">'+col(p.out,p.a,p.b)+col(p.back,p.b,p.a)+'</div></article>'}).join('')+'</div>':'')
      +'</section>'}).join('');
  return '<section class="k57-card k57-routes k68-routes">'+head+body+'</section>'+(window.kgmNewRouteHtmlR57?window.kgmNewRouteHtmlR57():'');
}
