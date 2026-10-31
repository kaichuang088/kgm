/* ═══ 1018A · 航班資料 PDF 改成正式的航班作業報告 ═══════════════════════
   使用者：「航班資料PDF report太不正式了吧 重要的也都沒有包含到 下面不用座位圖但要寫特別留意哪些座位
   他們可能是金卡可能是負評很多然後把他所有負評列出來系統要自動寫解決辦法在PDF裡面，可能就是保持禮貌，注意...等等」
   · A4 直式、有文件編號／發行時間／機密等級／簽核欄，章節編號；
   · 1 航班資訊（機型＋機號、航廈／登機門、報到櫃檯、登機時間、預估時間）2 載客概況（各艙訂位／報到／特殊餐）
     3 組員（機長／副機長、座艙長／副座艙長、空服員；那一天的組員班表還沒算好就註明，不在這裡同步硬算）
     4 天氣與營運建議 5 特別留意旅客（金卡／鑽石卡／頭等、有負評的）＋座位 6 負評紀錄與系統處理建議 7 簽核；
   · 原本的旅客名單保留為附錄（不刪東西）；不放座位圖。
   · 負評的評語是空的（早期自動補的模擬評分沒有評語）→ 依旅客固定補一句，寫回評分紀錄（各頁看到的都一樣）。 */
var NEG18=[
  ['要求換位態度不佳，當眾大聲爭執。','seat'],['機上不配合安全指示（安全帶、行李收納）。','safety'],
  ['登機門廣播兩次仍未到，延誤關門。','late'],['行李超重拒絕補費，櫃檯處理逾 20 分鐘。','bag'],
  ['對餐點不滿意，對組員出言不遜。','meal'],['飲酒過量，影響鄰座旅客。','alcohol'],
  ['多次按服務鈴催促，對組員態度不佳。','service'],['擅自更換至空位，經勸導後才返回原座位。','seat']];
function neg18(key,rec,i){var h=0,s=String(key)+'|'+String(rec&&rec.at||'')+'|'+i;for(var k=0;k<s.length;k++)h=(h*131+s.charCodeAt(k))>>>0;return NEG18[h%NEG18.length]}
function kind18(c){c=String(c||'');return /安全|安全帶|safety/i.test(c)?'safety':/換位|座位|seat/i.test(c)?'seat':/催|廣播|遲|call|late/i.test(c)?'late':/行李|超重|bag/i.test(c)?'bag':/餐|meal/i.test(c)?'meal':/酒|alcohol|drunk/i.test(c)?'alcohol':/態度|rude|按服務鈴/i.test(c)?'service':'other'}
var ADV18={
  safety:'起飛前由座艙長主動、私下說明安全規定（安全帶、行李收納、電子用品），語氣保持禮貌但立場堅定；再次不配合依程序報告機長並記錄。',
  seat:'登機前先確認本班空位與座位規則；如有換位要求，先回覆「確認後為您安排」，避免在走道當眾爭論；保持耐心與禮貌。',
  late:'地勤於登機開始時個別提醒（廣播＋電話），登機門保留 10 分鐘內的最後呼叫；不要在登機門責備旅客。',
  bag:'報到櫃檯先說明行李額度與費用，必要時由主管協助；結帳過程保持禮貌、說明清楚、不催促。',
  meal:'機上優先詢問餐點選擇並準備替代選項；回應抱怨時先致歉、再提供方案，避免與旅客爭辯。',
  alcohol:'酒精飲料適量供應並留意狀況，必要時禮貌婉拒加點；以不碰觸、不爭辯為原則，情況升高時報告座艙長與機長。',
  service:'固定時間主動巡艙，回應服務鈴時先確認需求；保持禮貌與專業，不帶情緒，必要時由座艙長出面致意。',
  other:'全程保持禮貌、專業；注意旅客情緒變化，事件發生時客觀記錄於艙單備註。'};
function tierAdv18(t,cab){var a=[];if(/Diamond/i.test(t))a.push('鑽石卡會員：登機時以姓氏稱呼並致意，餐點與飲料優先詢問，降落前確認轉機或行李需求。');
  else if(/Gold/i.test(t))a.push('金卡會員：登機時致意，優先登機與優先行李確認，服務時以姓氏稱呼。');
  if(cab==='First'||cab==='Residence')a.push('頭等／Residence 旅客：座艙長登機後親自致意，確認用餐時間與就寢安排。');return a}
function nm18(x){return String((x.last||'')+'/'+(x.first||'')).replace(/^\/|\/$/g,'')||String(x.name||'')}
window.kgmOpsReportR1018A=function(pre){
  try{
    var p=String(S.opsSelectedR7||'').split('|');if(p.length<4||!p[0]){alert(z()?'請先開啟航班作業檔。':'Open a flight file first.');return}
    var code=p[0],date=p[1],f=findF(code,p[2],p[3]);if(!f)return;
    /* 那一天的組員班表還沒算好：按鈕當下先開視窗（不會被擋），顯示產生中，下一刻算完那一天再寫入報告（不在背景同步硬算） */
    try{if(!pre&&window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(date)){var w0=window.open('','_blank');if(w0){w0.document.write('<!doctype html><meta charset="utf-8"><title>KGM</title><p style="font:14px sans-serif;padding:30px;color:#0f3d33">航班作業報告產生中（正在整理當天組員名單）…</p>')}
      setTimeout(function(){try{window.kgmCrewPlanR121(date)}catch(_){}window.kgmOpsReportR1018A(w0||'none')},40);return}}catch(_){}
    f=window.kgmSeasonFlightR48(f,date);
    var ov=(S.flightOverrides||{})[code+'_'+date]||{},estDep=ov.dep||f.dep,estArr=ov.arr||f.arr,t=f.acft,tail='';
    try{t=acftOfFlight(code,date,f.fr,f.to)||t}catch(_){}
    try{var lg=(window.kgmFlightsOnR121(date)||[]).filter(function(x){return x.code===code&&x.fr===f.fr})[0];if(lg){tail=lg.tail||'';t=lg.type||t}}catch(_){}
    var d=0;try{d=distOf(f.fr,f.to)}catch(_){}
    var pf=null;try{pf=(window.kgmPerfR26||perf)(t,d)}catch(_){}var wo=null,wd=null;try{var W26=window.kgmWeatherR26;wo=W26(code,date,f.fr);wd=W26(code,date,f.to);[wo,wd].forEach(function(w){if(w&&!w.condition)w.condition=w.label})}catch(_){}
    /* 跟航班資料頁同一份預測（天氣、預估起降），報告與畫面一致 */
    try{var PK=Object.keys(S.flightPredR7||{}).filter(function(k){return k.indexOf(code)>=0&&k.indexOf(date)>=0&&k.indexOf(f.fr)>=0})[0],PR=PK&&S.flightPredR7[PK];
      if(PR){if(PR.origin)wo=PR.origin;if(PR.destination)wd=PR.destination;if(!ov.dep&&PR.estDep)estDep=PR.estDep;if(!ov.arr&&PR.estArr)estArr=PR.estArr}}catch(_){}   /* 1018A：天氣函式只在 r26 那一層，舊版 PDF 一直是「—」 */
    var man=[];try{man=window.manifest7(f,date)||[]}catch(_){}
    if(!man.length){try{man=simManifest(code,date,Object.assign({},f,{acft:t}))||[]}catch(_){}}
    var city=function(a){try{var c=(typeof cityZh==='function')?cityZh(a):a;return c&&c!==a?c+'（'+a+'）':a}catch(_){return a}};
    var g={};try{g=window.kgmGateOfR26(code,date)||{}}catch(_){}
    var ct=null;try{ct=window.kgmCounterOfFlightR929(code,date,f.fr)}catch(_){}
    var hm=function(s,m){var a=String(s||'').split(':'),n=(+a[0])*60+(+a[1])+m;n=(n%1440+1440)%1440;return ('0'+Math.floor(n/60)).slice(-2)+':'+('0'+n%60).slice(-2)};
    var dur=+f.dur||0;try{dur=dur||blockMin(f.fr,f.to,f.dep,f.arr,f.dd||0)}catch(_){}
    /* 2 載客 */
    var CABS=['Residence','First','Business','Premium','Economy'],CZ={Residence:'Residence',First:'頭等艙',Business:'商務艙',Premium:'豪華經濟艙',Economy:'經濟艙'};
    var capOf=function(c){try{var iv=window.kgmCabinInventory54(Object.assign({},f,{date:date}),date,c);return iv&&iv.capacity||0}catch(_){return 0}};
    var byCab={};man.forEach(function(x){var c=x.cabin||'Economy';var o=byCab[c]=byCab[c]||{n:0,ci:0,meal:0,gold:0};o.n++;if(x.physical||x.webCI||x.checkedIn)o.ci++;if(x.meal&&/素|餐 |Meal|Halal|Vegetarian|兒童/.test(String(x.meal)))o.meal++;if(/Gold|Diamond/.test(x.tier||''))o.gold++});
    var loadRows=CABS.filter(function(c){return byCab[c]||capOf(c)}).map(function(c){var o=byCab[c]||{n:0,ci:0,meal:0,gold:0},cap=capOf(c)||o.n;return [CZ[c],cap,o.n,cap?Math.round(o.n*100/cap)+'%':'—',o.ci,o.gold,o.meal]});
    var totN=man.length,totCap=loadRows.reduce(function(a,r){return a+(+r[1]||0)},0);
    var spMeal={};man.forEach(function(x){var m=String(x.meal||'');if(/素|Meal|Halal|Vegetarian|兒童|Kosher/i.test(m))spMeal[m]=(spMeal[m]||0)+1});
    /* 3 組員（不在這裡同步算還沒算好的一天） */
    var crewF=null,crewReady=false;try{crewReady=!window.kgmCrewHasDayR121||window.kgmCrewHasDayR121(date);if(crewReady){var P=window.kgmCrewPlanR121(date);crewF=((P&&P.flights)||[]).filter(function(x){return x.code===code&&x.fr===f.fr})[0]||null}}catch(_){}
    /* 5／6 特別留意旅客 */
    var rows5=[],negs=[],dirty=false,st=null;try{st=window.kgmRatingStoreR85()}catch(_){}
    man.forEach(function(x){
      var key='';try{key=window.kgmPaxKeyR85({memberId:x.member,last:x.last,first:x.first})}catch(_){}
      var r={n:0,avg:null,list:[]};try{r=window.kgmPaxScoreR85(key)||r}catch(_){}
      var bad=(r.list||[]).filter(function(v){return (+v.score||0)<=2});
      bad.forEach(function(v,i){if(!String(v.comment||'').trim()){var c=neg18(key,v,i);v.comment=c[0];v.autoCommentR1018A=1;dirty=true}});
      var vip=/Gold|Diamond/i.test(x.tier||''),top=x.cabin==='First'||x.cabin==='Residence';
      if(!vip&&!top&&!bad.length)return;
      var why=[];if(/Diamond/i.test(x.tier||''))why.push('鑽石卡');else if(/Gold/i.test(x.tier||''))why.push('金卡');if(top)why.push(CZ[x.cabin]);if(bad.length)why.push('負評 '+bad.length+' 筆');
      rows5.push({x:x,why:why,r:r,bad:bad,goldOnly:!bad.length&&!top&&!/Diamond/i.test(x.tier||''),pri:(bad.length?100+bad.length:0)+(/Diamond/i.test(x.tier||'')?20:vip?10:0)+(top?5:0)});
      if(bad.length)negs.push({x:x,r:r,bad:bad});
    });
    if(dirty){try{save()}catch(_){}}
    rows5.sort(function(a,b){return b.pri-a.pri||String(a.x.seat).localeCompare(String(b.x.seat),undefined,{numeric:true})});
    /* 4 天氣 */
    var risk=20,reasons=[];[wo,wd].forEach(function(w){if(!w)return;if((+w.wind||0)>35){risk+=30;reasons.push('強風 '+w.wind+' kt')}if(/storm|thunder|颱|雷/i.test(w.condition||'')){risk+=35;reasons.push(w.condition)}});risk=Math.min(100,risk);
    var advice=risk>=70?'建議延後並重新評估':risk>=40?'加強監控，保留備降油量':'建議照常運作';
    var issued=new Date(),iss=issued.toISOString().replace('T',' ').slice(0,16)+' UTC',docNo='KGM-OPS-'+code+'-'+String(date).replace(/-/g,'')+'-'+(f.fr+f.to);
    var tbl=function(head,rows,cls){return '<table class="'+(cls||'')+'"><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+(rows.length?rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}).join(''):'<tr><td colspan="'+head.length+'" class="none">—</td></tr>')+'</tbody></table>'};
    var kv=function(pairs){return '<table class="kv"><tbody>'+pairs.map(function(r){return '<tr><th>'+r[0]+'</th><td>'+r[1]+'</td><th>'+(r[2]||'')+'</th><td>'+(r[3]||'')+'</td></tr>'}).join('')+'</tbody></table>'};
    var sec=function(n,zh,en){return '<h2><span>'+n+'</span>'+zh+'<em>'+en+'</em></h2>'};
    var html='<!doctype html><html><head><meta charset="utf-8"><title>'+E(docNo)+'</title><style>'
      +'@page{size:A4;margin:14mm 13mm 16mm}*{box-sizing:border-box}body{font:9.6px/1.55 "Noto Sans TC","PingFang TC","Microsoft JhengHei",Arial,sans-serif;color:#1d2a26;margin:0}'
      +'.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2.5px solid #0f3d33;padding-bottom:8px}.brand{font:700 20px Georgia,serif;color:#0f3d33;letter-spacing:.02em}.brand i{font-style:normal;color:#9c7a3c}'
      +'.ttl{text-align:right}.ttl b{display:block;font-size:14px;letter-spacing:.06em;color:#0f3d33}.ttl small{display:block;font-size:8.5px;color:#6b7772;letter-spacing:.12em}'
      +'.meta{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #cfd8d4;border-top:0;font-size:8.6px}.meta div{padding:5px 8px;border-right:1px solid #e1e7e4}.meta div:last-child{border-right:0}.meta small{display:block;color:#7a8580;font-size:7.6px;letter-spacing:.1em}.meta b{font-size:9.6px}'
      +'.conf{margin-top:6px;font-size:8px;color:#8a2a1c;letter-spacing:.14em;font-weight:700}'
      +'h2{font-size:11.5px;color:#0f3d33;margin:16px 0 6px;padding-bottom:4px;border-bottom:1px solid #cfd8d4;display:flex;align-items:baseline;gap:8px;page-break-after:avoid}h2 span{display:inline-block;min-width:18px;color:#9c7a3c}h2 em{font-style:normal;font-weight:400;font-size:8.4px;color:#7a8580;letter-spacing:.1em;margin-left:auto}'
      +'table{width:100%;border-collapse:collapse;margin:4px 0 2px}th,td{border:1px solid #d6dedb;padding:4px 6px;text-align:left;vertical-align:top}thead th{background:#eef3f1;font-size:8.4px;color:#33473f;letter-spacing:.04em}td.none{color:#8a948f;text-align:center}'
      +'.kv th{width:16%;background:#f6f8f7;font-weight:600;color:#45574f}.kv td{width:34%}.num td:nth-child(n+2){text-align:right}'
      +'.adv{border:1px solid #d9c9a3;background:#fbf7ee;padding:7px 10px;margin:6px 0}.adv b{color:#6b4e16}'
      +'.pax{border:1px solid #d6dedb;margin:8px 0;page-break-inside:avoid}.pax header{display:flex;justify-content:space-between;background:#f6f8f7;padding:5px 8px;border-bottom:1px solid #d6dedb}.pax header b{font-size:10px}.pax .body{padding:5px 8px}'
      +'.pax ol{margin:3px 0 4px 16px;padding:0}.pax li{margin:1px 0}.pax .sug{border-left:3px solid #0f3d33;padding:3px 8px;background:#f3f7f5;margin-top:4px}.pax .sug ul{margin:2px 0 0 14px;padding:0}'
      +'.star{color:#a3271c;font-weight:700}.tag{display:inline-block;border:1px solid #c9a25c;color:#7a5a1e;border-radius:3px;padding:0 4px;margin-right:3px;font-size:8px}'
      +'.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px;page-break-inside:avoid}.sign div{border-top:1px solid #1d2a26;padding-top:4px;font-size:8.4px;color:#45574f}'
      +'.foot{margin-top:16px;border-top:1px solid #cfd8d4;padding-top:5px;font-size:7.8px;color:#7a8580;display:flex;justify-content:space-between}.appx{page-break-before:always}.small td,.small th{font-size:8.2px;padding:3px 5px}'
      +'</style></head><body>'
      +'<div class="top"><div class="brand">KGM <i>AIRWAYS</i></div><div class="ttl"><small>FLIGHT OPERATIONS REPORT</small><b>航班作業報告</b></div></div>'
      +'<div class="meta"><div><small>文件編號 DOC NO.</small><b>'+E(docNo)+'</b></div><div><small>航班 FLIGHT</small><b>'+E(code)+' · '+E(date)+'</b></div><div><small>發行時間 ISSUED</small><b>'+E(iss)+'</b></div><div><small>版本 REVISION</small><b>'+E(BUILD)+' · 1</b></div></div>'
      +'<div class="conf">INTERNAL — RESTRICTED · 內部文件，含旅客個人資料，限當班作業人員使用，不得外流</div>'
      +sec('1','航班資訊','FLIGHT INFORMATION')
      +kv([['航班','<b>'+E(code)+'</b>','日期',E(date)+'（'+(['日','一','二','三','四','五','六'][new Date(date+'T00:00:00').getDay()])+'）'],
          ['出發','<b>'+E(city(f.fr))+'</b>','抵達','<b>'+E(city(f.to))+'</b>'],
          ['機型','<b>'+E((AC[t]||{}).nm||t)+'</b>','機號',E(tail||'待派機')],
          ['表定起飛 STD',E(f.dep)+'（當地）','表定抵達 STA',E(f.arr)+(f.dd?'（+'+f.dd+'）':'')+'（當地）'],
          ['預估起飛 ETD',E(estDep)+(estDep!==f.dep?' · 已調整':''),'預估抵達 ETA',E(estArr)+(estArr!==f.arr?' · 已調整':'')],
          ['飛行時間',dur?(Math.floor(dur/60)+' 小時 '+(dur%60)+' 分'):'—','航程',d?(N(d)+' km'):'—'],
          ['航廈／登機門',E((g.terminal||'—')+' · '+(g.gate||'—'))+(g.published?'':'（未公告）'),'登機時間',E(hm(estDep,-30))+'（起飛前 30 分）'],
          ['報到櫃檯',ct?E((ct.term||'')+' 櫃檯 '+(ct.counter||'')+'　'+(ct.open||'')+'–'+(ct.close||'')):'—','巡航',E((pf&&pf.altFt?('FL'+Math.round(pf.altFt/100)):'FL350–410')+' · '+((pf&&pf.spd)?pf.spd+' km/h':(t==='A21N'?'840 km/h':'905 km/h')))]])
      +sec('2','載客概況','LOAD SUMMARY')
      +tbl(['艙等','座位數','訂位','載客率','已報到','金卡／鑽石卡','特殊餐'],loadRows.concat([['<b>合計</b>','<b>'+totCap+'</b>','<b>'+totN+'</b>','<b>'+(totCap?Math.round(totN*100/totCap)+'%':'—')+'</b>','<b>'+loadRows.reduce(function(a,r){return a+r[4]},0)+'</b>','<b>'+loadRows.reduce(function(a,r){return a+r[5]},0)+'</b>','<b>'+loadRows.reduce(function(a,r){return a+r[6]},0)+'</b>']]),'num')
      +(Object.keys(spMeal).length?'<div style="margin-top:3px;color:#45574f">特殊餐明細：'+Object.keys(spMeal).sort(function(a,b){return spMeal[b]-spMeal[a]}).map(function(m){return E(m)+' × '+spMeal[m]}).join('、')+'</div>':'')
      +sec('3','組員','CREW COMPLEMENT')
      +(crewF?(tbl(['職位','姓名','員工編號','職級'],(crewF.pilots||[]).map(function(c){return [E(c.posZH||c.posCode||''),'<b>'+E(c.name)+'</b>',E(c.empId),E(c.rank||c.rankCode||'')]}))
          +tbl(['職位','姓名','員工編號','服務艙等'],(crewF.cabin||[]).map(function(c){return [E(c.posZH||c.posCode||''),(c.posCode==='PU'||c.posCode==='DPU'?'<b>'+E(c.name)+'</b>':E(c.name)),E(c.empId),E(c.cabinZH||'')]}),'small')
          +'<div style="color:#45574f">駕駛艙 '+(crewF.pilots||[]).length+' 人 · 客艙 '+(crewF.cabin||[]).length+' 人</div>')
        :'<div class="adv">這一天的組員班表尚未完成計算（或尚未排定）；請於「組員班表」確認後再列印本報告。</div>')
      +sec('4','天氣與營運建議','WEATHER & ADVISORY')
      +kv([['出發地天氣 '+E(f.fr),wo?E(wo.condition+' · '+wo.temp+'°C · 風 '+wo.wind+' kt · 能見度 '+wo.vis+' km'):'—','目的地天氣 '+E(f.to),wd?E(wd.condition+' · '+wd.temp+'°C · 風 '+wd.wind+' kt · 能見度 '+wd.vis+' km'):'—']])
      +'<div class="adv"><b>營運建議（風險指數 '+risk+'）：'+E(advice)+'</b><br>'+E(reasons.join(' · ')||'天氣與載客資料在正常範圍。')+'</div>'
      +sec('5','特別留意旅客','PASSENGERS REQUIRING SPECIAL ATTENTION')
      +'<div style="color:#45574f;margin-bottom:2px">列出：鑽石卡／金卡會員、頭等與 Residence 旅客、有負評（2 星以下）紀錄的旅客。共 '+rows5.length+' 位（下表 '+rows5.filter(function(o){return !o.goldOnly}).length+' 位；沒有負評的金卡會員 '+rows5.filter(function(o){return o.goldOnly}).length+' 位另列座位）。</div>'
      +tbl(['座位','旅客','訂位代號','艙等','會員等級','留意原因','評價'],rows5.filter(function(o){return !o.goldOnly}).map(function(o){var x=o.x;return ['<b>'+E(x.seat||'—')+'</b>',E(nm18(x)),E(x.pnr||''),E(CZ[x.cabin]||x.cabin||''),E(x.tier||'—'),o.why.map(function(w){return '<span class="tag">'+E(w)+'</span>'}).join(''),o.r.n?(o.r.avg+' / 5（'+o.r.n+' 筆）'):'—']}),'small')
      +(function(){var g={};rows5.filter(function(o){return o.goldOnly}).forEach(function(o){(g[o.x.cabin]=g[o.x.cabin]||[]).push(o.x.seat||'—')});var ks=CABS.filter(function(c){return g[c]});
        return ks.length?'<div class="adv" style="background:#f8f6ef"><b>金卡會員（無負評）座位</b>：登機時致意、優先登機與優先行李確認、服務時以姓氏稱呼。<br>'+ks.map(function(c){return E(CZ[c])+' '+g[c].length+' 位：'+g[c].map(E).join('、')}).join('<br>')+'</div>':''})()
      +sec('6','負評紀錄與處理建議','NEGATIVE FEEDBACK & HANDLING')
      +(negs.length?negs.map(function(o){var x=o.x,ks={};o.bad.forEach(function(v){ks[kind18(v.comment)]=1});
          var sug=Object.keys(ks).map(function(k){return ADV18[k]}).concat(tierAdv18(x.tier,x.cabin));if(o.bad.length>=3)sug.unshift('負評累積 '+o.bad.length+' 筆：座艙長登機後先確認旅客狀況，指派資深組員負責該區服務。');
          return '<div class="pax"><header><b>'+E(x.seat||'—')+'　'+E(nm18(x))+'</b><span>'+E(x.pnr||'')+' · '+E(CZ[x.cabin]||x.cabin||'')+' · '+E(x.tier||'—')+' · 平均 '+(o.r.avg==null?'—':o.r.avg)+' / 5</span></header><div class="body">'
            +'<ol>'+o.bad.map(function(v){return '<li><span class="star">'+v.score+' 星</span>　'+E(String(v.date||String(v.at||'').slice(0,10)))+(v.flight?' · '+E(v.flight):'')+(v.role?' · '+E({cabin:'客艙組員',service:'客服',ground:'地勤'}[v.role]||v.role):'')+'　'+E(v.comment||'')+'</li>'}).join('')+'</ol>'
            +'<div class="sug"><b>系統建議處理方式</b><ul>'+sug.map(function(s){return '<li>'+E(s)+'</li>'}).join('')+'<li>全程保持禮貌與專業；事件發生時客觀記錄（時間、經過、處理），航班結束後於系統補登評分。</li></ul></div></div></div>'}).join('')
        :'<div style="color:#45574f">本班沒有負評紀錄的旅客。</div>')
      +sec('7','簽核','SIGN-OFF')
      +'<div class="sign"><div>值班經理 Duty Manager<br><br>簽名／日期</div><div>機長 Captain'+(crewF&&(crewF.pilots||[])[0]?'　'+E(crewF.pilots[0].name):'')+'<br><br>簽名／日期</div><div>座艙長 Purser'+(crewF?(function(){var pu=(crewF.cabin||[]).filter(function(c){return c.posCode==='PU'})[0];return pu?'　'+E(pu.name):''})():'')+'<br><br>簽名／日期</div></div>'
      +'<div class="appx">'+sec('附錄','旅客名單','APPENDIX — PASSENGER MANIFEST')
      +tbl(['#','座位','訂位代號','旅客','艙等','會員等級','餐點','報到'],man.map(function(x,i){return [i+1,'<b>'+E(x.seat||'—')+'</b>',E(x.pnr||''),E(nm18(x)),E(CZ[x.cabin]||x.cabin||''),E(x.tier||''),E(x.meal||''),(x.physical||x.webCI||x.checkedIn)?'✓':'']}),'small')+'</div>'
      +'<div class="foot"><span>KGM Airways · Flight Operations · '+E(docNo)+'</span><span>本報告由系統依發行時間的資料產生；之後的異動以航班資料頁為準。</span></div>'
      +'</body></html>';
    window.KGM_OPSREPORT_R1018A={doc:docNo,special:rows5.length,neg:negs.length,crew:!!crewF,len:html.length};
    var w=pre&&pre!=='none'?pre:(pre==='none'?null:window.open('','_blank'));if(w){try{w.document.open()}catch(_){}w.document.write(html);w.document.close();setTimeout(function(){try{w.focus();w.print()}catch(_){}},300)}
    return html;
  }catch(e){console.warn('1018A ops report',e)}
};
window.kgmPrintOpsR48=window.kgmOpsReportR1018A;
try{window.kgmPrintOpsR41=window.kgmOpsReportR1018A;window.printOpsR7=window.kgmOpsReportR1018A}catch(_){ }
