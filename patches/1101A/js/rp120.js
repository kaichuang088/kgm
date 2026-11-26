/* ══ 1120A 航班作業報告（使用者：「你可以在航班資料PDF Report加上浮水印並且Protect那份PDF (所有文字都要無法Copy)」
       「圖四是怎麼回事為啥沒to the left，然後未選餐下面也要寫建議：...」
       「圖五我希望可以在上面寫要注意的旅客那裡座位有個超連結按一下會自動到這個座位圖上的那個座位（在PDF上）」）══
   · 原本報告是寫進新視窗再叫瀏覽器列印（頁尾印出 about:blank、文字可以複製）。改成直接產生 PDF：
     報告照舊組好（pdf38 → kgmOpsReportR1018A），放進看不見的 iframe 排版 → html2canvas 每頁畫成圖 → jsPDF 組 PDF。
     每頁是圖片（沒有任何文字層，所以沒有文字可以複製），每頁加浮水印（匯出人、員工編號、時間）、頁首頁尾；
     PDF 加權限保護（只允許列印，不允許複製、修改）。
   · 第 6 節（特別留意旅客）每一列的座位是超連結 → 跳到完整座位圖（CEO 完整版第 13 節）同一個座位，座位圖上這些座位加金框；
     座位圖上的金框座位再連回第 6 節那一列。
   · 餐點統計：占比文字一律靠左（原本跟著長條長短跑）；未選餐下面加「建議」列（未選餐人數依本艙已選比例分配到一般菜單；特殊餐要事先預訂，不分配）。
     建議列加在航班資料頁本身（報告是複製那一頁），兩邊同一份。
   · 函式庫（pdflib120.js）要產生 PDF 時才載入；任何一步失敗 → 照舊開列印視窗（不會沒東西）。 */
(function(){
  if(window.__rp120)return;window.__rp120=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  /* ── 餐點統計：未選餐建議 ── */
  var SPM=/[A-Za-z]{3,}|兒童|嬰兒|素|糖尿|無麩|低鹽|低脂|清真|猶太|回教|印度|海鮮|水果|過敏/;   /* 特殊餐（要事先預訂的）：名稱帶英文代號或這些字 */
  function mealAdvice(root){
    [].slice.call((root||document).querySelectorAll('.k81-meals table.k81-t')).forEach(function(t){
      if(t.querySelector('tr.k120-madv'))return;
      var none=t.querySelector('tr.k81-none');if(!none)return;
      var nN=+(String((none.querySelector('.k81-n')||{}).textContent||'0').replace(/\D/g,''))||0;
      var std=[];[].slice.call(t.querySelectorAll('tbody tr')).forEach(function(tr){if(tr===none||tr.classList.contains('k120-madv'))return;var nm=String((tr.children[0]||{}).textContent||'').trim(),n=+(String((tr.querySelector('.k81-n')||{}).textContent||'0').replace(/\D/g,''))||0;if(nm&&!SPM.test(nm))std.push({nm:nm,n:n})});
      var zh=z(),txt;
      if(!nN)txt=zh?'建議：本艙旅客都已選餐，照上表份數裝載即可。':'Advice: every passenger in this cabin has chosen; load as listed.';
      else if(!std.length)txt=zh?'建議：未選餐 '+nN+' 位，本艙還沒有人選一般餐點 → 一般菜單各道平均備餐。':'Advice: '+nN+' undecided and no standard choice yet → split evenly across the standard menu.';
      else{var tot=std.reduce(function(a,x){return a+x.n},0)||std.length,al=std.map(function(x){var q=(tot?x.n/tot:1/std.length)*nN;return {nm:x.nm,f:Math.floor(q),r:q-Math.floor(q)}}),left=nN-al.reduce(function(a,x){return a+x.f},0);
        al.slice().sort(function(a,b){return b.r-a.r}).forEach(function(x){if(left>0){x.f++;left--}});
        txt=(zh?'建議：未選餐 '+nN+' 位依本艙已選比例分配 —— ':'Advice: split the '+nN+' undecided by this cabin\'s choices — ')+al.filter(function(x){return x.f>0}).map(function(x){return x.nm+' '+x.f+(zh?' 份':'')}).join(zh?'、':', ')+(zh?'（特殊餐須事先預訂，不在此分配）':' (special meals are pre-ordered and not included)')}
      var tr=document.createElement('tr');tr.className='k120-madv';tr.innerHTML='<td colspan="3">'+E(txt)+'</td>';none.parentNode.insertBefore(tr,none.nextSibling)})}
  function hookRender(){var r0=window.render;if(typeof r0!=='function'||r0.__rp120)return;var w=function(){var r=r0.apply(this,arguments);try{if(S.view==='admin'&&document.querySelector('.k81-meals'))mealAdvice(document)}catch(_){}try{crewCol()}catch(_){}try{cqFix()}catch(_){}return r};
    try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__rp120=1;window.render=w;try{render=w}catch(_){}}
  /* 1120A L3（使用者：「組員班表也加入+/-不然好亂」）：組員頁「給旅客評分」「組員班表」兩大區塊加 + / −（跟航班資料頁同一種按鈕、同一種收起樣式） */
  S.k120colR=S.k120colR||{k195:false,k196:false};
  function crewCol(){try{if(S.view!=='admin')return;[['k195','#app section.k195'],['k196','#app section.k196']].forEach(function(x){var sec=document.querySelector(x[1]);if(!sec)return;
      var b=sec.querySelector(':scope > .k22-tg.k120tg');if(!b){b=document.createElement('button');b.type='button';b.className='k22-tg k120tg';b.setAttribute('onclick',"kgmCrewColR1120A('"+x[0]+"')");sec.insertBefore(b,sec.firstChild);sec.classList.add('k22-sec')}
      var col=!!S.k120colR[x[0]];sec.classList.toggle('k22-col',col);var t=col?'+':'−';if(b.textContent!==t)b.textContent=t;b.title=col?(z()?'展開':'Expand'):(z()?'收起':'Collapse')})}catch(_){}}
  window.kgmCrewColR1120A=function(k){S.k120colR[k]=!S.k120colR[k];crewCol()};
  /* 1120A L1（使用者：「圖一要像之前可以使用喔」）：航班組員查詢 —— 查不到時說清楚原因：這天沒飛（列營運日、可直接點最近有飛的日期）、
     組員班表還在算（算好自動重查）、沒有這個班號。1008C 起不飛的日子不再隨機編組員，原本只寫「可能尚未排班或該日不飛」。 */
  var CQT='該日該航班查無組員(可能尚未排班或該日不飛)。';
  function cqFix(){try{if(S.view!=='admin'||!S._cqRun||!S._cqCode)return;var el=null;[].slice.call(document.querySelectorAll('#app .adm-card div')).forEach(function(d){if(!el&&!d.children.length&&d.textContent===CQT)el=d});if(!el)return;
    var code=String(S._cqCode).toUpperCase().trim(),d=S._cqDate||todayISO(),zh=z(),F=(FLIGHTS||[]).concat(S.customFlights||[]).filter(function(f){return f&&f.code===code});
    var W=['日','一','二','三','四','五','六'],wd=function(x){return W[new Date(x+'T12:00:00Z').getUTCDay()]},add=function(x,n){var t=new Date(x+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
    var h='';if(!F.length)h=zh?'查無 '+E(code)+' 這個航班號。':'No flight '+E(code)+'.';
    else{var fl=function(x){return F.some(function(f){try{return flyOn(f,new Date(x+'T00:00:00'))}catch(_){return false}})},rt=F[0].fr+'→'+F[0].to;
      if(fl(d)){h=(zh?E(code)+'（'+rt+'）'+d+' 有飛，組員班表還在計算這一天，算好會自動顯示。':'Crew for this day is still being computed.');setTimeout(function(){try{if(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(d))render();else setTimeout(cqFix,3000)}catch(_){}},3000)}
      else{var ds=[],days={};for(var i=-7;i<=366&&ds.length<6;i++){var x=add(d,i);if(fl(x)){days[wd(x)]=1;if(i>0||ds.length<2)ds.push(x)}}var first=ds.filter(function(x){return x>d})[0];if(first)for(var j=0;j<28;j++){var y=add(first,j);if(fl(y))days[wd(y)]=1}   /* 1120A：28 天內沒飛（季節航線）的也找得到，營運日依下一次有飛那段算 */
        var near=ds.filter(function(x){return x>=todayISO()}).slice(0,5);
        h=(zh?'<b>'+E(code)+'（'+rt+'）'+d+'（週'+wd(d)+'）不飛</b>，所以沒有組員。'+(Object.keys(days).length?'營運日：週'+W.filter(function(w){return days[w]}).join('、'):'一年內都沒有營運（可能已停飛或尚未開航）')+'。'+(first&&first>add(d,28)?'下一次營運是 '+first+'（季節航線）。':''):'<b>'+E(code)+' does not operate on '+d+'.</b>')
          +(near.length?'<div class="k120cq">'+(zh?'最近有飛：':'Next: ')+near.map(function(x){return '<button type="button" class="btn btn-sm" onclick="S._cqDate=\''+x+'\';S._cqRun=1;render()">'+x.slice(5).replace('-','/')+'（'+wd(x)+'）</button>'}).join('')+'</div>':'')}}
    el.innerHTML=h;el.setAttribute('data-k120','1')}catch(_){}}
  window.kgmCqFixR1120A=cqFix;
  hookRender();[0,1500,4000,12000].forEach(function(t){setTimeout(hookRender,t)});
  setInterval(function(){try{if(S.view==='admin'&&document.querySelector('#app section.k195,#app section.k196'))crewCol()}catch(_){}},800);   /* 組員班表區塊會自己就地重畫（不經 render），按鈕不見就補回 */
  window.kgmMealAdviceR1120A=mealAdvice;
  var CSS='.k81-t td:last-child>span{float:left;width:40px;margin:0!important;text-align:left;color:#5d6b64}.k81-t td:last-child>i{max-width:calc(100% - 48px)}'
    +'.k81-t tr.k120-madv td{background:#fffaf0;color:#6b5420;font-size:11px;line-height:1.6;padding:6px 9px 8px;border-bottom:1px solid #f0e3c4}'+'.k120cq{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}';
  try{var st=document.createElement('style');st.id='rp120-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}

  /* ── PDF ── */
  var W=700,MLR=13,MT=17,MB=15,CW=210-2*MLR,CH=297-MT-MB,PX_MM=W/CW,PH=Math.floor(CH*PX_MM);   /* 內容 184mm＝700px；一頁內容高 265mm */
  function seatOf(s){var m=/^\s*(\d{1,3})\s*([A-Z])\s*$/.exec(String(s||'').toUpperCase());return m?(+m[1])+m[2]:''}
  function prep(doc){
    /* 1120A K1（使用者：「PDF怎麼這麼醜」）：航班資料頁原樣的區塊，左右兩欄（例如候補兩張卡）在 A4 寬度會被擠壓、右邊被切 → 一律改成上下一欄、表格撐滿 */
    try{[].slice.call(doc.querySelectorAll('.k39fd *')).forEach(function(e){var cs=doc.defaultView.getComputedStyle(e);
      if(cs.display==='grid'||cs.display==='inline-grid'){var n=String(cs.gridTemplateColumns||'').split(' ').filter(Boolean).length;if(n>1&&!e.closest('.r7-map-row,.r7-map-cells,.r7-cabin'))e.style.gridTemplateColumns='minmax(0,1fr)'}
      if(cs.display==='flex'&&cs.flexDirection==='row'&&e.children.length>1&&e.scrollWidth>e.clientWidth+4)e.style.flexWrap='wrap';
      if(e.tagName==='TABLE'){e.style.width='100%';e.style.maxWidth='100%'}})}catch(_){}
    /* 座位圖：每個座位標上座位號 */
    var map={};
    [].slice.call(doc.querySelectorAll('.r7-map-row')).forEach(function(row){var rn=String((row.querySelector('small')||{}).textContent||'').trim();if(!/^\d+$/.test(rn))return;
      [].slice.call(row.querySelectorAll('.r7-map-seat')).forEach(function(sp){var L='';for(var i=0;i<sp.childNodes.length;i++){var n=sp.childNodes[i];if(n.nodeType===3&&n.textContent.trim()){L=n.textContent.trim();break}}if(/^[A-Z]$/.test(L)){var id=(+rn)+L;sp.setAttribute('data-k120s',id);map[id]=sp}})});
    /* 第 6 節：每列第一格的座位 */
    var src=[],h=[].slice.call(doc.querySelectorAll('h2')),s6=null,s6e=null;h.forEach(function(x,i){var n=String((x.querySelector('span')||{}).textContent||'').trim();if(n==='6'){s6=x;s6e=h[i+1]||null}});
    var CWID={'座位':5,'旅客':10,'訂位代號':7,'會員等級':6.5,'留意原因':7,'餐點':8,'評價':6.5,'過去負評':18,'服務重點':21,'基本資料':10,'Seat':5,'Passenger':10,'PNR':7,'Tier':6.5,'Reason':7,'Meal':8,'Rating':6.5,'Past negative reviews':18,'Service focus':21,'Passenger details':10};   /* 1121A Q4：加「基本資料」欄；英文版表頭同寬 */   /* 第 6 節欄寬：負評與服務重點兩欄要寬 */
    if(s6){var el=s6.nextElementSibling;while(el&&el!==s6e){[].slice.call(el.tagName==='TABLE'?[el]:el.querySelectorAll('table')).forEach(function(t){var ths=[].slice.call(t.querySelectorAll('thead th'));if(ths.some(function(th){return /過去負評|Past negative/.test(th.textContent)})){t.style.tableLayout='fixed';t.style.width='100%';ths.forEach(function(th){var w=CWID[String(th.textContent).trim()];if(w)th.style.width=w+'%'})}[].slice.call(t.querySelectorAll('tbody tr')).forEach(function(tr){var td=tr.children[0];if(!td)return;var id=seatOf(td.textContent);if(!id)return;td.setAttribute('data-k120l',id);if(map[id]){td.classList.add('k120lk');map[id].classList.add('k120hl');src.push({id:id,td:td,tr:tr,seat:map[id]})}})});el=el.nextElementSibling}}
    return src}
  function absRect(el){var r=el.getBoundingClientRect(),d=el.ownerDocument.defaultView;return {x:r.left+d.scrollX,y:r.top+d.scrollY,w:r.width,h:r.height}}
  function pages(doc,H){
    var forced=[],cands=[];
    [].slice.call(doc.body.querySelectorAll('*')).forEach(function(e){var cs=null;try{cs=doc.defaultView.getComputedStyle(e)}catch(_){}if(!cs)return;if(cs.breakBefore==='page'||cs.pageBreakBefore==='always'){var y=absRect(e).y;if(y>5)forced.push(y)}});
    var keep=function(e){var p=e.previousElementSibling;while(p&&(/^H[1-4]$/.test(p.tagName)||/g-exit-divider|r7-kicker|k81-h/.test(p.className||''))){e=p;p=e.previousElementSibling}return e};   /* 標題、緊急出口橫條跟下一個一起換頁 */
    [].slice.call(doc.body.querySelectorAll('h2,h3,h4,tr,.pax,li,p,img,table,.r7-map-row,.r7-cabin,.k81-cabin,.sign,.k39fd>*,body>div,body>section,.k120neg')).forEach(function(e){if(e.tagName==='TR'&&e.parentNode&&e.parentNode.tagName==='THEAD')return;var r=absRect(keep(e));if(r.h>0||e.tagName==='TR')cands.push(Math.round(r.y))});
    cands.sort(function(a,b){return a-b});forced.sort(function(a,b){return a-b});
    var out=[],y=0,g=0;while(y<H-2&&g++<400){var lim=y+PH,end=lim,f=forced.filter(function(v){return v>y+20&&v<=lim})[0];
      if(f!=null)end=f;else if(lim<H){var c=-1;for(var i=0;i<cands.length;i++){var v=cands[i];if(v>y+PH*0.3&&v<=lim)c=v}if(c>0)end=c}else end=H;
      out.push({y:y,h:Math.min(end,H)-y});y=end}
    return out}
  function wm(ctx,w,h,k,lines){ctx.save();ctx.globalAlpha=0.075;ctx.fillStyle='#0B3D2E';ctx.font='700 '+Math.round(5.2*k)+'px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';ctx.translate(w/2,h/2);ctx.rotate(-Math.PI/6);
    var step=34*k,len=Math.hypot(w,h);for(var yy=-len/2,i=0;yy<len/2;yy+=step,i++){var t=lines[i%lines.length];var tw=ctx.measureText(t).width+28*k;for(var xx=-len/2+(i%2)*tw/2;xx<len/2;xx+=tw)ctx.fillText(t,xx,yy)}ctx.restore()}
  function headFoot(ctx,w,h,k,hd,ft,pn){ctx.save();ctx.fillStyle='#0B3D2E';ctx.font='700 '+Math.round(2.6*k)+'px "Noto Sans TC","PingFang TC",sans-serif';ctx.textBaseline='alphabetic';
    ctx.fillText(hd[0],MLR*k,10.5*k);ctx.textAlign='right';ctx.fillStyle='#8A7444';ctx.fillText(hd[1],w-MLR*k,10.5*k);
    ctx.strokeStyle='#C9A24F';ctx.lineWidth=0.35*k;ctx.beginPath();ctx.moveTo(MLR*k,12.6*k);ctx.lineTo(w-MLR*k,12.6*k);ctx.stroke();
    ctx.strokeStyle='#D6DED9';ctx.beginPath();ctx.moveTo(MLR*k,h-10.6*k);ctx.lineTo(w-MLR*k,h-10.6*k);ctx.stroke();
    ctx.font='500 '+Math.round(2.3*k)+'px "Noto Sans TC","PingFang TC",sans-serif';ctx.fillStyle='#5d6b64';ctx.textAlign='left';ctx.fillText(ft,MLR*k,h-6.6*k);ctx.textAlign='right';ctx.fillText(pn,w-MLR*k,h-6.6*k);ctx.restore()}
  /* 主函式：html＝報告；win＝要顯示的視窗（可為 null）；meta＝{ver,docNo,who,code,date}；回傳 Promise（成功＝{blob,pages,links}） */
  window.kgmOpsPdfR1120A=function(html,win,meta){
    return new Promise(function(resolve,reject){
      var t0=Date.now();
      if(!window.kgmPdfLibR1120A||!window.kgmPdfLibR1120A()){reject(new Error('lib'));return}
      var fr=document.createElement('iframe');fr.setAttribute('aria-hidden','true');fr.style.cssText='position:fixed;left:-12000px;top:0;width:'+W+'px;height:1200px;border:0;visibility:hidden';document.body.appendChild(fr);
      var doc=fr.contentDocument;doc.open();doc.write(String(html).replace(/<\/head>/i,'<style>html,body{margin:0!important;padding:0!important;background:#fff!important;width:'+W+'px!important;max-width:none!important}'
        +'.k120lk{color:#0B3D2E}.k120lk b{border-bottom:1.5px solid #C9A24F}.r7-map-seat.k120hl{outline:2.5px solid #0B3D2E!important;outline-offset:1.5px;z-index:2}.k22-tg{display:none!important}'
        +'.k120neg{font-size:7.6px;line-height:1.4;color:#7a3b2e;margin:0 0 3px;padding-bottom:2px;border-bottom:1px dotted #e7d3cb}.k120neg:last-child{border-bottom:0}.k120neg b{color:#b4412b}'
        +'.k81-t td:last-child>span{float:left;width:40px;margin:0!important;text-align:left}.k81-t td:last-child>i{max-width:calc(100% - 48px)}'
        +'.k81-t tr.k120-madv td{background:#fffaf0;color:#6b5420;font-size:9.5px;line-height:1.55;padding:5px 9px 7px}</style></head>'));doc.close();
      var go=function(){try{
        try{mealAdvice(doc)}catch(_){}
        var src=prep(doc),H=Math.ceil(doc.documentElement.scrollHeight);fr.style.height=H+'px';
        var P=pages(doc,H);
        var links=src.map(function(o){return {id:o.id,a:absRect(o.td),r:absRect(o.tr),b:absRect(o.seat)}});
        var jsPDF=window.jspdf.jsPDF,own='kgm'+Math.random().toString(36).slice(2)+Date.now().toString(36);
        var pdf=new jsPDF({unit:'mm',format:'a4',compress:true,encryption:{userPassword:'',ownerPassword:own,userPermissions:['print']}});
        try{pdf.setProperties({title:meta.docNo||'KGM flight report',subject:'KGM Airways flight operations report',author:'KGM Airways',creator:'KGM Airways'})}catch(_){}
        var SC=2,k=W*SC/CW,pw=Math.round(210*k),ph=Math.round(297*k),now=new Date(),ts=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
        var who=meta.who||'',zh=z(),wml=['KGM AIRWAYS · '+(zh?'機密文件':'CONFIDENTIAL')+' · '+who+' · '+ts,(zh?'僅供本航班作業使用 · 禁止翻拍轉傳':'Internal use only · do not copy or forward')+' · '+(meta.docNo||'')];
        var hd=['KGM AIRWAYS · '+(zh?'航班作業報告':'FLIGHT OPERATIONS REPORT')+(meta.verName?' · '+meta.verName:''),meta.docNo||''];
        /* 分段畫：每段最多 5,200px，切成一頁一頁 */
        var chunks=[],cur=null;P.forEach(function(p,i){if(!cur||p.y+p.h-cur.y>5200){cur={y:p.y,h:0,pages:[]};chunks.push(cur)}cur.pages.push(i);cur.h=p.y+p.h-cur.y});
        var ci=0;
        var step=function(){if(ci>=chunks.length){finish();return}var c=chunks[ci++];
          if(win&&win.document){try{var m=win.document.getElementById('k120p');if(m)m.textContent=(zh?'產生 PDF 中… ':'Building PDF… ')+Math.round(ci*100/chunks.length)+'%'}catch(_){}}
          window.html2canvas(doc.body,{scale:SC,backgroundColor:'#ffffff',x:0,y:c.y,width:W,height:c.h,windowWidth:W,windowHeight:Math.max(H,1200),scrollX:0,scrollY:0,logging:false,useCORS:true,imageTimeout:8000}).then(function(cv){
            c.pages.forEach(function(pi){var p=P[pi],pc=document.createElement('canvas');pc.width=pw;pc.height=ph;var ctx=pc.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,pw,ph);
              ctx.drawImage(cv,0,Math.round((p.y-c.y)*SC),W*SC,Math.round(p.h*SC),Math.round(MLR*k),Math.round(MT*k),W*SC,Math.round(p.h*SC));
              wm(ctx,pw,ph,k,wml);headFoot(ctx,pw,ph,k,hd,(zh?'機密 · 匯出人 ':'Confidential · exported by ')+who+' · '+ts,(pi+1)+' / '+P.length);
              if(pi>0)pdf.addPage('a4','portrait');pdf.addImage(pc.toDataURL('image/jpeg',0.86),'JPEG',0,0,210,297,undefined,'FAST')});
            setTimeout(step,0)}).catch(function(e){cleanup();reject(e)})};
        var pageOf=function(y){for(var i=0;i<P.length;i++)if(y>=P[i].y&&y<P[i].y+P[i].h)return i;return -1};
        var finish=function(){var n=0;
          links.forEach(function(L){var pa=pageOf(L.a.y+1),pb=pageOf(L.b.y+1);if(pa<0||pb<0)return;
            var ty=Math.max(0,MT+(L.b.y-P[pb].y)/PX_MM-30);
            pdf.setPage(pa+1);pdf.link(MLR+L.a.x/PX_MM,MT+(L.a.y-P[pa].y)/PX_MM,Math.max(6,L.a.w/PX_MM),Math.max(3,L.a.h/PX_MM),{pageNumber:pb+1,top:ty});
            var tr2=Math.max(0,MT+(L.r.y-P[pa].y)/PX_MM-20);pdf.setPage(pb+1);pdf.link(MLR+L.b.x/PX_MM,MT+(L.b.y-P[pb].y)/PX_MM,L.b.w/PX_MM,L.b.h/PX_MM,{pageNumber:pa+1,top:tr2});n++});
          var blob=pdf.output('blob');cleanup();
          window.__k120LastPdf={pages:P.length,bytes:blob.size,links:n,seats:links.length,ms:Date.now()-t0,docNo:meta.docNo,blob:blob};
          resolve({blob:blob,pages:P.length,links:n})};
        step();
      }catch(e){cleanup();reject(e)}};
      var cleanup=function(){try{fr.remove()}catch(_){}};
      var imgs=[].slice.call(doc.images||[]),waited=0;(function wait(){if(imgs.every(function(i){return i.complete})||waited>8000){requestAnimationFrame(function(){setTimeout(go,60)});return}waited+=100;setTimeout(wait,100)})();
    })};
  /* 新視窗顯示 PDF（可直接看、下載；檔名＝文件編號） */
  window.kgmOpsPdfShowR1120A=function(win,blob,name){var u=URL.createObjectURL(blob),zh=z();
    var h='<!doctype html><html><head><meta charset="utf-8"><title>'+E(name)+'</title><style>html,body{margin:0;height:100%;background:#2b302e;font-family:"Noto Sans TC",sans-serif}header{height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:#0B3D2E;color:#fff}header b{font-size:14px;letter-spacing:.02em}header span{font-size:11.5px;color:#cfe0d7;margin-left:10px}a{background:#C9A24F;color:#0B2A20;text-decoration:none;font-weight:800;font-size:13px;padding:8px 16px;border-radius:999px}embed{display:block;width:100%;height:calc(100% - 46px);border:0}</style></head><body>'
      +'<header><div><b>'+E(name)+'</b><span>'+(zh?'受保護 PDF：只能檢視與列印，無法複製文字':'Protected PDF: view & print only, text cannot be copied')+'</span></div><a href="'+u+'" download="'+E(name)+'.pdf">'+(zh?'下載 PDF':'Download PDF')+'</a></header><embed type="application/pdf" src="'+u+'"></body></html>';
    try{win.document.open();win.document.write(h);win.document.close()}catch(_){}}
})();
