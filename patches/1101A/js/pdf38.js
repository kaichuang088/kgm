/* ══ 1108A N7：航班資料 PDF 作業報告（使用者：「後台航班資料PDF Report太少要有需要特別注意的旅客（高階會員和他們的基本資料、低評分旅客）
   還有航線圖等等 CEO要可以全部都export 空服員只能export what they should see same as pilot」）
   做法：最外層包 kgmOpsReportR1018A（1018A／1022A 的正式報告，內容照舊），產生後依匯出人的職位整理：
   · 新增「2A 航線圖」：跟航班資料頁同一個衛星底圖航路（kgmRouteMapR1025B，每天依風場與關閉空域）；
   · 新增「6A 高階會員基本資料」：鑽石卡／金卡／頭等／Residence 旅客的座位、姓名、會員卡號、等級、國籍、年齡（生日）、艙等、餐點、聯絡電話（遮蔽）、證件提示；
   · 職位版本：CEO＝完整版（全部章節）；機師＝飛行版（航班資訊、飛行資料、航線圖、載客概況、組員、天氣與給機長的建議、簽核；不含旅客個資與名單）；
     客艙組員（地勤、客服同）＝客艙服務版（航班資訊、航線圖、載客概況、組員、天氣、特別留意旅客、高階會員基本資料、負評與處理建議、寵物、簽核、旅客名單；
     不含燃油／載重平衡等飛行資料與給機長／CEO 的建議）；其他職位不能匯出。頁首寫版本與匯出人。 */
(function(){
  if(window.__pdf38)return;window.__pdf38=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function H(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function me(){return S.adminUser||{}}
  function roleOf(){var u=me();if(u.empId==='MASTER'||u.role==='ceo')return 'ceo';return String(u.role||'')}
  function verOf(r){return r==='ceo'?'ceo':r==='pilot'?'pilot':/^(cabin|ground|service)$/.test(r)?'cabin':''}
  var VN={ceo:['CEO 完整版','CEO — full'],pilot:['機師飛行版','Flight crew'],cabin:['客艙服務版','Cabin service']};
  /* 章節保留表 */
  var KEEP={ceo:null,pilot:{'1':1,'2':1,'2A':1,'3':1,'4':1,'5':1,'8':1},cabin:{'1':1,'2A':1,'3':1,'4':1,'5':1,'6':1,'6A':1,'7':1,'8':1,'附錄':1}};
  function cur(){var p=String(S.opsSelectedR7||'').split('|');return p.length>=4&&p[0]?{code:p[0],date:p[1],fr:p[2],to:p[3]}:null}
  function age(d){var m=String(d||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return '';var t=new Date(),a=t.getFullYear()-(+m[1]);if(t.getMonth()+1<+m[2]||(t.getMonth()+1===+m[2]&&t.getDate()<+m[3]))a--;return a>=0&&a<120?a:''}
  function mask(ph){ph=String(ph||'').replace(/\s/g,'');return ph.length>4?ph.slice(0,ph.length-4).replace(/\d/g,'•')+ph.slice(-4):ph}
  function eliteSec(c){var man=[];try{var f=(FLIGHTS||[]).concat(S.customFlights||[]).filter(function(x){return x&&x.code===c.code&&x.fr===c.fr&&x.to===c.to})[0];window.KGM_NODH_R1023A=1;man=window.manifest7(Object.assign({},f,{date:c.date}),c.date)||[]}catch(_){}finally{window.KGM_NODH_R1023A=0}
    var CZ={Residence:'Residence',First:'頭等艙',Business:'商務艙',Premium:'豪華經濟艙',Economy:'經濟艙'},ORD={Residence:0,First:1,Business:2,Premium:3,Economy:4};
    var L=man.filter(function(x){return x&&(/diamond|gold|black/i.test(x.tier||'')||x.cabin==='First'||x.cabin==='Residence')}).sort(function(a,b){return ((ORD[a.cabin]||9)-(ORD[b.cabin]||9))||String(a.seat||'').localeCompare(String(b.seat||''),undefined,{numeric:true})});
    var rows=L.map(function(x){var mem=x.member||('KGM'+String(100000+H(x.pnr+'|'+x.name)%899999));var ph=x.phone||('+886 9'+String(10000000+H(x.name+'p')%89999999));var nat=x.nationality||'';
      return '<tr><td><b>'+E(x.seat||'—')+'</b></td><td><b>'+E((x.last||'')+'/'+(x.first||''))+'</b><br><small>'+E(x.pnr||'')+'</small></td><td class="mono">'+E(mem)+'</td><td>'+E(x.tier||'—')+'</td><td>'+E(nat)+'</td><td>'+E(age(x.dob))+(x.dob?'<br><small>'+E(x.dob)+'</small>':'')+'</td><td>'+E(CZ[x.cabin]||x.cabin||'')+'</td><td>'+E(x.detailedMeal||x.meal||'')+'</td><td class="mono">'+E(mask(ph))+'</td><td>'+(x.documentFlag?'⚠ 證件待查':'')+(x.groundUpgrade?' 地面升等':'')+'</td></tr>'}).join('');
    return '<h2><span>6A</span>高階會員基本資料<em>PREMIUM &amp; ELITE PASSENGER DETAILS</em></h2>'
      +'<div style="color:#45574f;margin-bottom:4px">鑽石卡、金卡會員與頭等／Residence 旅客 '+L.length+' 位（依艙等、座位排序）；電話只列末四碼，完整資料請在航班資料頁查詢。</div>'
      +(L.length?'<table class="small"><thead><tr><th>座位</th><th>旅客／訂位</th><th>會員卡號</th><th>等級</th><th>國籍</th><th>年齡（生日）</th><th>艙等</th><th>餐點</th><th>電話</th><th>提示</th></tr></thead><tbody>'+rows+'</tbody></table>':'<div style="color:#45574f">本班沒有高階會員或頭等旅客。</div>')}
  function petSec(c){try{var L=window.kgmPetsOnFlightR1108A?window.kgmPetsOnFlightR1108A(c.code,c.date):[];if(!L.length)return '';var SP={dog:'狗',cat:'貓',service:'服務犬'},MD={cabin:'客艙',hold:'托運貨艙',service:'客艙（服務犬）'};
      return '<div style="margin-top:8px"><b>寵物同行 '+L.length+'</b><table class="small"><thead><tr><th>旅客</th><th>寵物</th><th>方式</th><th>座位</th><th>狀態</th></tr></thead><tbody>'+L.map(function(x){return '<tr><td>'+E(x.pax)+'</td><td>'+E((SP[x.species]||x.species||'')+(x.name?'「'+x.name+'」':'')+(x.kg?' '+x.kg+' kg':''))+'</td><td>'+E(MD[x.mode]||x.mode||'')+'</td><td>'+E(x.mode==='hold'?'—':(x.seatShown||'同旅客座位'))+'</td><td>'+(x.ok?'已核准':'審核中')+'</td></tr>'}).join('')+'</tbody></table></div>'}catch(_){return ''}}
  function mapImg(c,cb){try{var f=(FLIGHTS||[]).concat(S.customFlights||[]).filter(function(x){return x&&x.code===c.code&&x.fr===c.fr&&x.to===c.to})[0];if(!f||!window.kgmRouteMapR1025B){cb('');return}
      var el=document.createElement('div');el.style.cssText='position:fixed;left:-9999px;top:0;width:860px;height:360px';document.body.appendChild(el);window.kgmRouteMapR1025B(el,Object.assign({},f,{date:c.date}),c.date);
      var t0=Date.now();(function poll(){var im=el.querySelector('img.k25map-img');if(im&&im.getAttribute('src')){var u=im.getAttribute('src');el.remove();cb(u);return}if(Date.now()-t0>9000){el.remove();cb('');return}setTimeout(poll,150)})()}catch(_){cb('')}}
  function mapSec(c,u){var lg='';try{lg=window.kgmRouteMapLegendR1025B?window.kgmRouteMapLegendR1025B({fr:c.fr,to:c.to,code:c.code},c.date):''}catch(_){}
    var d=0;try{d=distOf(c.fr,c.to)}catch(_){}
    return '<h2><span>2A</span>航線圖<em>ROUTE MAP</em></h2>'+(u?'<img src="'+u+'" style="width:100%;border:1px solid #cfd9d3;border-radius:6px" alt="route">':'<div style="color:#45574f">航線圖產生失敗（請在航班資料頁查看）。</div>')
      +'<div style="font-size:9.5px;color:#45574f;margin-top:3px">'+E(c.fr)+' → '+E(c.to)+(d?' · 大圓距離 '+Math.round(d).toLocaleString()+' km':'')+' · 當日依高空風與關閉空域規劃的航路（與航班資料頁同一份）'+(typeof lg==='string'&&lg?' · '+lg.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim():'')+'</div>'}
  /* 依章節切開：每段從 <h2><span>N</span> 開始；附錄包在 <div class="appx"> */
  function filterHtml(html,ver,c,u){var zh=z(),i=html.indexOf('<h2><span>');if(i<0)return html;var head=html.slice(0,i),j=html.indexOf('<div class="foot">'),tail=j>0?html.slice(j):'</body></html>',mid=j>0?html.slice(i,j):html.slice(i);
    mid=mid.replace('<div class="appx"><h2>','<h2>');var parts=[],re=/<h2><span>([^<]+)<\/span>/g,m,idx=[];while((m=re.exec(mid)))idx.push({n:m[1],at:m.index});
    idx.forEach(function(x,k){parts.push({n:x.n,h:mid.slice(x.at,k+1<idx.length?idx[k+1].at:mid.length)})});
    var out=[];parts.forEach(function(p){var h=p.h;if(p.n==='附錄'){h=h.replace(/<\/div>\s*$/,'');h='<div class="appx">'+h+'</div>'}
      if(p.n==='5'){if(ver!=='ceo')h=h.replace(/<div><b>給 CEO<\/b><ul>[\s\S]*?<\/ul><\/div>/,'');if(ver==='cabin')h=h.replace(/<div><b>給機長 Captain<\/b><ul>[\s\S]*?<\/ul><\/div>/,'')}
      if(p.n==='6')h+=petSec(c);
      out.push({n:p.n,h:h});if(p.n==='2')out.push({n:'2A',h:mapSec(c,u)});if(p.n==='6'){}if(p.n==='7')out.splice(out.length-1,0,{n:'6A',h:eliteSec(c)})});
    if(!out.some(function(p){return p.n==='2A'}))out.splice(1,0,{n:'2A',h:mapSec(c,u)});
    var K=KEEP[ver];if(K)out=out.filter(function(p){return K[p.n]});
    var who=me(),badge='<div class="conf" style="background:#0f3d33;color:#fff">'+E(zh?VN[ver][0]:VN[ver][1])+' · '+(zh?'匯出人 ':'Exported by ')+E((who.name||'')+' '+(who.empId||''))+(ver==='pilot'?(zh?' · 不含旅客個資':' · no passenger personal data'):ver==='cabin'?(zh?' · 不含燃油／載重與營運建議':' · no fuel / load / ops advisory'):'')+'</div>';
    head=head.replace('<div class="conf">',badge+'<div class="conf">');
    return head+out.map(function(p){return p.h}).join('')+tail}
  function wrap(){var O=window.kgmOpsReportR1018A;if(typeof O!=='function'||O.__pdf38)return;
    var w=function(pre){var c=cur(),zh=z();if(!c)return O.apply(this,arguments);var ver=verOf(roleOf());
      if(!ver){alert(zh?'航班作業報告只開放 CEO（完整版）、機師（飛行版）與客艙組員／地勤／客服（客艙服務版）匯出。':'Flight report export is limited to the CEO, pilots and cabin / ground / service staff.');return}
      var win=pre&&pre!=='none'?pre:(pre==='none'?null:window.open('','_blank'));
      try{if(win&&win.document){win.document.open();win.document.write('<!doctype html><meta charset="utf-8"><title>KGM</title><p style="font:14px sans-serif;padding:30px;color:#0f3d33">'+(zh?'航班作業報告產生中（航線圖與組員名單）…':'Preparing the flight report…')+'</p>')}}catch(_){}
      var go=function(){var html=null;try{html=O.call(this,'none')}catch(e){try{console.warn('pdf38',e)}catch(_){}}if(!html){try{win&&win.close()}catch(_){}return}
        mapImg(c,function(u){var h2=html;try{h2=filterHtml(html,ver,c,u)}catch(e){try{console.warn('pdf38 filter',e)}catch(_){}}window.KGM_OPSREPORT_R1108A={ver:ver,len:h2.length,map:!!u,sections:(h2.match(/<h2><span>([^<]+)<\/span>/g)||[]).map(function(x){return x.replace(/<[^>]+>/g,'')})};window.__k38LastReport=h2;
          if(win){try{win.document.open()}catch(_){}win.document.write(h2);win.document.close();setTimeout(function(){try{win.focus();win.print()}catch(_){}},400)}})};
      try{if(window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(c.date)){setTimeout(function(){try{window.kgmCrewPlanR121(c.date)}catch(_){}go()},40);return}}catch(_){}
      go()};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__pdf38=1;window.kgmOpsReportR1018A=w;try{window.kgmPrintOpsR41=w;window.printOpsR7=w}catch(_){}}
  wrap();[0,2000,6000,15000].forEach(function(t){setTimeout(wrap,t)});
})();
