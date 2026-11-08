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
  function filterHtml(html,ver,c,u,xtra){var zh=z(),i=html.indexOf('<h2><span>');if(i<0)return html;var head=html.slice(0,i),j=html.indexOf('<div class="foot">'),tail=j>0?html.slice(j):'</body></html>',mid=j>0?html.slice(i,j):html.slice(i);
    mid=mid.replace('<div class="appx"><h2>','<h2>');var parts=[],re=/<h2><span>([^<]+)<\/span>/g,m,idx=[];while((m=re.exec(mid)))idx.push({n:m[1],at:m.index});
    idx.forEach(function(x,k){parts.push({n:x.n,h:mid.slice(x.at,k+1<idx.length?idx[k+1].at:mid.length)})});
    var out=[];parts.forEach(function(p){var h=p.h;if(p.n==='附錄'){h=h.replace(/<\/div>\s*$/,'');h='<div class="appx">'+h+'</div>'}
      if(p.n==='5'){if(ver!=='ceo')h=h.replace(/<div><b>給 CEO<\/b><ul>[\s\S]*?<\/ul><\/div>/,'');if(ver==='cabin')h=h.replace(/<div><b>給機長 Captain<\/b><ul>[\s\S]*?<\/ul><\/div>/,'')}
      if(p.n==='6')h+=petSec(c);
      out.push({n:p.n,h:h});if(p.n==='2')out.push({n:'2A',h:mapSec(c,u)});if(p.n==='6'){}if(p.n==='7')out.splice(out.length-1,0,{n:'6A',h:eliteSec(c)})});
    if(!out.some(function(p){return p.n==='2A'}))out.splice(1,0,{n:'2A',h:mapSec(c,u)});
    var K=KEEP[ver];if(K)out=out.filter(function(p){return K[p.n]});
    if(ver==='ceo'&&xtra&&xtra.length){var ai=-1;out.forEach(function(p,k){if(p.n==='附錄')ai=k});var add=xtra.map(function(x){return {n:x.n,h:x.h}});if(ai>=0)Array.prototype.splice.apply(out,[ai,0].concat(add));else out=out.concat(add)}   /* 1108B B13：CEO 完整版加航班資料頁全部區塊 */
    var who=me(),badge='<div class="conf" style="background:#0f3d33;color:#fff">'+E(zh?VN[ver][0]:VN[ver][1])+' · '+(zh?'匯出人 ':'Exported by ')+E((who.name||'')+' '+(who.empId||''))+(ver==='pilot'?(zh?' · 不含旅客個資':' · no passenger personal data'):ver==='cabin'?(zh?' · 不含燃油／載重與營運建議':' · no fuel / load / ops advisory'):'')+'</div>';
    head=head.replace('<div class="conf">',badge+'<div class="conf">');
    return head+out.map(function(p){return p.h}).join('')+tail}
  /* ── 1108B B13（使用者：「CEO 看到的航班狀態資料 report 一樣少啊 CEO 要可以看到全部！」）──
     CEO 完整版：把航班資料頁「全部」分頁的每個區塊（載重平衡／Payload 鎖後排、行李改運、報到核對、餐點、完整座位圖、候補名單…）照原樣放進報告（按鈕、輸入框拿掉，填的值留著），
     樣式只帶這些區塊用到的 CSS。報告原本已有的（航班資訊、航路、旅客名單）不重複。 */
  var SKIP39=/r7-ops-hero|r7-route-card|r7-manifest|k25fd-kpis/;
  function cssFor39(root){var cls={};[].slice.call(root.querySelectorAll('[class]')).concat([root]).forEach(function(e){String(e.getAttribute('class')||'').split(/\s+/).forEach(function(k){if(k)cls[k]=1})});
    var keys=Object.keys(cls),out=[],hit=function(sel){if(/data-kgm-tab|^\s*(html|body)[.:\[]/.test(sel))return false;for(var i=0;i<keys.length;i++)if(sel.indexOf('.'+keys[i])>=0)return true;return false};   /* 依頁面狀態藏區塊的規則（body:not([data-kgm-tab=…])）不帶 */
    [].slice.call(document.styleSheets).forEach(function(sh){var R=null;try{R=sh.cssRules}catch(_){return}if(!R)return;[].slice.call(R).forEach(function(r){try{if(r.type===1){if(hit(r.selectorText||''))out.push(r.cssText)}else if(r.type===4&&/print|max-width/.test(r.conditionText||r.media&&r.media.mediaText||'')){}else if(r.type===4){var inner=[].slice.call(r.cssRules).filter(function(x){return x.type===1&&hit(x.selectorText||'')}).map(function(x){return x.cssText});if(inner.length)out.push('@media '+r.media.mediaText+'{'+inner.join('')+'}')}}catch(_){}})});
    return out.join('\n')}
  function clean39(el){var c=el.cloneNode(true);[].slice.call(c.querySelectorAll('input,textarea')).forEach(function(i){var t=i.type==='checkbox'||i.type==='radio'?(i.checked?'☑':'☐'):(i.value||'');var sp=document.createElement('span');sp.className='k39v';sp.textContent=t||'—';i.parentNode.replaceChild(sp,i)});
    [].slice.call(c.querySelectorAll('select')).forEach(function(i){var o=i.options[i.selectedIndex];var sp=document.createElement('span');sp.className='k39v';sp.textContent=o?o.textContent:'';i.parentNode.replaceChild(sp,i)});
    [].slice.call(c.querySelectorAll('button')).forEach(function(b){if(b.closest('.r7-seatmap,.r7-cabin')||/seat/.test(b.className||'')){var sp=document.createElement('span');sp.className=b.className;sp.innerHTML=b.innerHTML;if(b.title)sp.title=b.title;b.parentNode.replaceChild(sp,b)}else b.remove()});   /* 座位是按鈕 → 留成方格 */
    [].slice.call(c.querySelectorAll('script,.k25fd-tabs,[role=button]')).forEach(function(b){b.remove()});
    [c].concat([].slice.call(c.querySelectorAll('[data-k23fd],[data-k22]'))).forEach(function(e){e.removeAttribute('data-k23fd');e.removeAttribute('data-k22')});   /* 分頁用的屬性會被頁面規則藏起來 */
    [].slice.call(c.querySelectorAll('[onclick],[onchange],[oninput]')).forEach(function(e){e.removeAttribute('onclick');e.removeAttribute('onchange');e.removeAttribute('oninput')});
    [].slice.call(c.querySelectorAll('details')).forEach(function(d){d.setAttribute('open','')});return c}
  function snap39(c,cb){var zh=z(),pt=S.fdTabR1025B,pa=S.adminTab,pv=S.view;try{S.view='admin';S.adminTab='flightdata';S.fdTabR1025B='all';render()}catch(_){}
    setTimeout(function(){var L=[];try{var cards=[].slice.call(document.querySelectorAll('#app .r7-ops-card.k22-sec,#app .r40-panel.k22-sec')).filter(function(e){return !SKIP39.test(e.className)&&!e.parentElement.closest('.r7-ops-card.k22-sec')});
        var hero=document.querySelector('#app .r7-ops-hero');cards=cards.filter(function(e,i){return !(i===0&&!e.querySelector('h2,h3,header')&&hero)});
        var box=document.createElement('div');var first0=cards[0];cards.forEach(function(e){var cl=clean39(e);if(e===first0&&!e.querySelector('.r7-loadbal,.k23bm'))cl.setAttribute('data-k39first','1');box.appendChild(cl)});var k39first=function(e){return e.getAttribute('data-k39first')==='1'&&!/r7-loadbal|k23bm|k55|k81|r7-seatmap|r40|k166/.test(e.className||'')};var css=cssFor39(box);var n=9;
        var TT=[[/r7-loadbal/,'載重平衡・Payload 鎖後排','Load & balance'],[/k23bm/,'行李改運','Bag reroute'],[/k55-cifail/,'報到核對','Check-in review'],[/k81-meals/,'餐點統計','Catering'],[/r7-seatmap/,'完整座位圖','Seat map'],[/k55-standby|r40-panel/,'候補名單','Standby'],[/k166/,'超賣／撞位處理','Oversale']];
        [].slice.call(box.children).forEach(function(e){var t='',cn=String(e.className||'');TT.forEach(function(x){if(!t&&x[0].test(cn))t=zh?x[1]:x[2]});if(!t&&k39first(e))t=zh?'航班狀態（表定／預估・旅客・行李）':'Flight status';if(!t)t=(e.querySelector('h2,h3,h4,header b')||{}).textContent||'';t=String(t).replace(/\s+/g,' ').trim().slice(0,40);if(!t||!String(e.textContent||'').replace(/\s+/g,'').length)return;
          L.push({n:String(n),h:'<h2><span>'+(n++)+'</span>'+E(t)+'<small>'+(zh?'航班資料頁原樣':'From the flight file')+'</small></h2><div class="k39fd">'+e.outerHTML+'</div>'})});
        if(L.length)L[0].h='<style>'+css+'.k39fd{margin:6px 0 14px;font-size:11px}.k39fd .k39v{display:inline-block;min-width:18px;padding:0 4px;border-bottom:1px solid #ccd}.k39fd *{max-width:100%;box-shadow:none!important;position:static!important}.k39fd *{max-height:none!important;overflow:visible!important}.k39fd>section,.k39fd>div{display:block!important;visibility:visible!important;opacity:1!important}</style>'+L[0].h}catch(e){try{console.warn('pdf38 snap',e)}catch(_){}}
      try{S.fdTabR1025B=pt;S.adminTab=pa;S.view=pv;render()}catch(_){}cb(L)},900)}
  function wrap(){var O=window.kgmOpsReportR1018A;if(typeof O!=='function'||O.__pdf38)return;
    var w=function(pre){var c=cur(),zh=z();if(!c)return O.apply(this,arguments);var ver=verOf(roleOf());
      if(!ver){alert(zh?'航班作業報告只開放 CEO（完整版）、機師（飛行版）與客艙組員／地勤／客服（客艙服務版）匯出。':'Flight report export is limited to the CEO, pilots and cabin / ground / service staff.');return}
      var win=pre&&pre!=='none'?pre:(pre==='none'?null:window.open('','_blank'));
      try{if(win&&win.document){win.document.open();win.document.write('<!doctype html><meta charset="utf-8"><title>KGM</title><p style="font:14px sans-serif;padding:30px;color:#0f3d33">'+(zh?'航班作業報告產生中（航線圖與組員名單）…':'Preparing the flight report…')+'</p>')}}catch(_){}
      var go=function(){var html=null;try{html=O.call(this,'none')}catch(e){try{console.warn('pdf38',e)}catch(_){}}if(!html){try{win&&win.close()}catch(_){}return}
        var fin=function(xtra){mapImg(c,function(u){var h2=html;try{h2=filterHtml(html,ver,c,u,xtra)}catch(e){try{console.warn('pdf38 filter',e)}catch(_){}}window.KGM_OPSREPORT_R1108A={ver:ver,len:h2.length,map:!!u,sections:(h2.match(/<h2><span>([^<]+)<\/span>/g)||[]).map(function(x){return x.replace(/<[^>]+>/g,'')})};window.__k38LastReport=h2;
          if(win){try{win.document.open()}catch(_){}win.document.write(h2);win.document.close();setTimeout(function(){try{win.focus();win.print()}catch(_){}},400)}})};
        if(ver==='ceo')snap39(c,fin);else fin(null)};
      try{if(window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(c.date)){setTimeout(function(){try{window.kgmCrewPlanR121(c.date)}catch(_){}go()},40);return}}catch(_){}
      go()};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__pdf38=1;window.kgmOpsReportR1018A=w;try{window.kgmPrintOpsR41=w;window.printOpsR7=w}catch(_){}}
  wrap();[0,2000,6000,15000].forEach(function(t){setTimeout(wrap,t)});
})();
