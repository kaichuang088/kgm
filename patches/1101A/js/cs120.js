/* ══ 1120A K5（使用者：「AI summary太爛了吧（格式和內容）然後你要多一點simulate現在太少」）
       K6（「所有請你simulate的東西每一天都要自動simulate more」）══
   原本：轉真人客服的摘要是一行字「會員…｜訂位代號…｜需求…｜旅客最後說…」，放在兩行的文字框；模擬對話只有開站時寫死的 3 筆，之後永遠不變。
   改（不另做一套：佇列還是 S.csQueueR1006A／kgm_csq6、頁面還是 r229 1006A 的 k6cs、模擬訂位還是 kgmCsSimPnrR1012A 建）：
   ① 摘要改成結構化卡片，每次畫面都從「這筆對話＋這個訂位代號的實際訂位」重新整理（不存第二份）：
      旅客（姓名・會員編號・卡等・等了多久）／訂位（航段、日期時刻、艙等票價、人數、距出發幾天、狀態）／
      需求（類別＋旅客原話）／AI 已經回覆什麼／要留意（72 小時內出發、要退款、醫療需求…）／建議處理步驟。
      原本的文字框保留成「客服補充／修正」（同一個 k6csSum，儲存照舊 kgmCsSaveSumR1006A）。
   ② 模擬對話每天自動產生 6～10 筆（依日期雜湊固定：同一天開幾次頁都是同一批），時間散在當天 07:00–23:00（台北），
      到時間才出現；之後依時間自己往前走：等待 15 分鐘後由模擬客服接手、90 分鐘後回覆並結束。
      訂位用原本的 kgmCsSimPnrR1012A 依第一句話（班號＋日期）建成模擬訂位（定位管理查得到；模擬訂位一律不寄信，見 mail120）。
      關閉 7 天以上的模擬對話自動清掉（佇列不會無限長）。 */
(function(){
  if(window.__cs120)return;window.__cs120=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function H(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function D(d,n){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
  function Q(){return (S.csQueueR1006A=S.csQueueR1006A||{})}
  function persist(){try{LS.set("kgm_csq6",S.csQueueR1006A)}catch(_){}try{save()}catch(_){}}
  /* 直接找 S.bookings 裡那一筆（kgmBkPnrR1118A 的索引可能給到另一份物件，改它不會存到） */
  function bk(pnr){if(!pnr)return null;var P=String(pnr).toUpperCase(),L=S.bookings||[];for(var i=0;i<L.length;i++){var b=L[i];if(b&&String(b.pnr).toUpperCase()===P)return b}return null}
  function md(d){return String(d||'').slice(5).replace('-','/').replace(/^0/,'').replace('/0','/')}

  /* ── 需求類別：建議處理步驟（不寫條號，避免引錯條文）── */
  var KIND={
    change:{re:/改票|改期|改日期|改班|change/i,lbl:'改票',steps:['確認票價方案可否改期與改票手續費（行程管理「更改行程」會照規則算）','查新日期同艙等是否有位；沒有位要先說明可改的艙等或日期','差價＋手續費報價給旅客，同意後在後台改並重新開票','已完成的航段不能改，只改還沒飛的那段']},
    refund:{re:/退票|退款|取消|refund|cancel/i,lbl:'退票／取消',steps:['確認票價方案可否退票、退票手續費與未使用稅金','家庭急事／醫療等特殊情況可要求證明，送「退票退費」案件（需 CEO 終審）','告知退款作業時間（原付款方式退回）']},
    wchr:{re:/輪椅|特殊服務|行動不便|WCHR|wheel/i,lbl:'特殊服務',steps:['確認輪椅種類（到登機門／上下機梯／完全無法行走）並在訂位加註 SSR','提醒旅客起飛前 48 小時內完成申請、當天提早到櫃檯','需醫療證明的情況（氧氣、擔架）轉醫療組']},
    bag:{re:/行李|托運|bag/i,lbl:'行李',steps:['查這個票價方案與卡等的免費行李額度','網路預購超重／加件比機場便宜，可直接在附加服務頁加購','特殊行李（樂器、運動器材）要先申請']},
    seat:{re:/座位|選位|seat/i,lbl:'座位',steps:['看同訂位旅客目前座位與可選座位','付費座位／緊急出口座位規則先說明','沒有相鄰座位時加註，報到時由地勤協助']},
    miles:{re:/里程|哩程|會員|入帳|補登|mile/i,lbl:'里程／會員',steps:['查這段航班是否已飛、會員編號是否在訂位上','起飛後 7 天仍未入帳可補登（登機證或電子機票號碼）','聯營航班依夥伴規則累積']},
    upg:{re:/升等|upgrade/i,lbl:'升等',steps:['確認票價方案可否用里程升等、所需里程','查目標艙等升等座位（候補順序依卡等）','候補成功系統會通知；不成功不扣里程']},
    pet:{re:/寵物|貓|狗|pet/i,lbl:'寵物',steps:['確認寵物種類、重量（含籠）與目的地入境規定','走「寵物同行申請」（每班名額有限），核准後才能托運／帶上客艙','提醒籠子尺寸與報到時間']},
    irr:{re:/延誤|異動|時間改|改時間|接不上|誤點|delay/i,lbl:'航班異動',steps:['查這班最新狀態與新時刻（航班動態）','異動造成接不上：可免費改到可銜接的班次或退票','必要時開案件給補償（餐券、住宿）']},
    rcpt:{re:/收據|發票|報帳|receipt|invoice/i,lbl:'收據／發票',steps:['確認抬頭、統編與語言','電子機票收據可由行程管理下載；需加抬頭由客服重開','附加服務另有收據']},
    meal:{re:/餐|素|過敏|meal/i,lbl:'餐點',steps:['確認特殊餐種類（素食、過敏、宗教餐）','起飛前 24 小時前可加訂','24 小時內無法保證，報到時再確認']},
    other:{re:/.^/,lbl:'一般詢問',steps:['先確認旅客要辦的事與訂位代號','能在前台自助完成的，引導旅客操作','需要後台處理的開案件追蹤']}
  };
  function kindOf(it){var t=String(it.need||'')+' '+((it.msgs||[]).filter(function(m){return m.role==='user'}).map(function(m){return m.text}).join(' '));for(var k in KIND){if(k!=='other'&&KIND[k].re.test(String(it.need||'')))return k}for(var k2 in KIND){if(k2!=='other'&&KIND[k2].re.test(t))return k2}return 'other'}

  /* ── ① 結構化摘要卡 ── */
  function cabinOf(code){try{var f=(typeof FARES!=='undefined'&&FARES[code])||{};var c=/^F-/.test(code)?'頭等艙':/^B-/.test(code)?'商務艙':/^P-/.test(code)?'豪華經濟艙':/^R-/.test(code)?'Residence':'經濟艙';var fam=f.familyR48?({Basic:'基本',Value:'超值',Flex:'豪華',Deluxe:'豪華',Lite:'基本'}[f.familyR48]||f.familyR48):'';return c+' '+code+(fam?'（'+fam+'）':'')}catch(_){return code||''}}
  function segsOf(b){var L=[];try{L=(window.segs7?window.segs7(b):[])||[]}catch(_){}if(!L.length){if(b.outF)L.push({f:b.outF,date:b.outF.date,cab:b.outC});if(b.inbF)L.push({f:b.inbF,date:b.inbF.date,cab:b.inbC})}return L}
  function tierOf(it,b){if(it.tierR1120A)return it.tierR1120A;try{var u=(S.users||[]).filter(function(x){return x&&x.id===it.userId})[0];if(u&&(u.tier||u.level))return u.tier||u.level}catch(_){}return ''}
  var TZH={Bronze:'普卡',Silver:'銀卡',Gold:'金卡',Diamond:'鑽石卡'};
  function card(it){var b=bk(it.pnr),k=kindOf(it),K=KIND[k],today=T(),zh=z();
    var users=(it.msgs||[]).filter(function(m){return m.role==='user'}),ais=(it.msgs||[]).filter(function(m){return m.role==='ai'});
    var wait=Math.max(0,Math.round((Date.now()-Date.parse(it.at))/60000)),tier=tierOf(it,b);
    var rows=[],flags=[],L=b?segsOf(b):[];
    rows.push(['旅客','<b>'+E(it.name||'—')+'</b>'+(it.userId?' · '+E(it.userId):'')+(tier?' · <span class="cs120-tier t-'+E(tier)+'">'+E(TZH[tier]||tier)+'</span>':'')+(it.status==='waiting'?' · <em>已等 '+(wait<60?wait+' 分鐘':Math.floor(wait/60)+' 小時 '+(wait%60)+' 分')+'</em>':'')]);
    if(b){var pax=(b.paxList||[]).length||1,first=L.filter(function(s){return s&&s.date>=today})[0]||L[0];
      var segH=L.map(function(s){var f=s.f||{},past=s.date<today;return '<span class="cs120-seg'+(past?' past':'')+'"><b>'+E(f.code||'')+'</b> '+E(f.fr||'')+'→'+E(f.to||'')+' · '+md(s.date)+' '+E(f.dep||'')+(past?' · 已飛':'')+'</span>'}).join('');
      var dd=first?Math.round((Date.parse(first.date)-Date.parse(today))/86400000):null;
      rows.push(['訂位','<b>'+E(b.pnr)+'</b> · '+E(cabinOf(b.outC||''))+' · '+pax+' 位'+(dd!=null&&dd>=0?' · 距出發 '+dd+' 天':'')+(b.status&&b.status!=='confirmed'?' · '+E(b.status):'')+'<div class="cs120-segs">'+segH+'</div>']);
      if(dd!=null&&dd>=0&&dd<=3)flags.push('72 小時內出發，優先處理');
    }else rows.push(['訂位',it.pnr?'<b>'+E(it.pnr)+'</b> · <em>系統查不到這個訂位代號（請跟旅客核對）</em>':'<em>旅客沒有提供訂位代號</em>']);
    rows.push(['需求','<b>'+E(K.lbl)+'</b>'+(users[0]?'：「'+E(users[0].text)+'」':'')+(users.length>1?'<div class="cs120-q">追問：「'+E(users[users.length-1].text)+'」</div>':'')]);
    if(ais.length)rows.push(['AI 已回覆','<span class="cs120-ai">'+E(String(ais[ais.length-1].text).slice(0,140))+(String(ais[ais.length-1].text).length>140?'…':'')+'</span>']);
    if(k==='refund')flags.push('涉及退款：要開「退票退費」案件，CEO 終審');
    if(k==='wchr'||/醫|病|孕|氧氣/.test(users.map(function(m){return m.text}).join(' ')))flags.push('有醫療／行動需求，確認 SSR 與證明文件');
    if(it.status==='waiting'&&wait>=15)flags.push('等待超過 15 分鐘');
    if(b&&L.some(function(s){return s.date<today})&&k==='change')flags.push('有已飛航段：只能改還沒飛的那段');
    if(flags.length)rows.push(['留意',flags.map(function(f){return '<span class="cs120-flag">'+E(f)+'</span>'}).join('')]);
    rows.push(['建議處理','<ol>'+K.steps.map(function(s){return '<li>'+E(s)+'</li>'}).join('')+'</ol>']);
    return '<div class="cs120-card"><div class="cs120-h"><span>HANDOFF BRIEF</span><b>'+(zh?'轉接摘要':'Handoff summary')+'</b><i>'+(zh?'系統依對話與訂位自動整理':'Built from the chat and booking')+'</i></div>'
      +'<dl>'+rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('')+'</dl></div>'}
  function decorate(){try{
    if(!S.adminAuthed||S.view!=='admin'||S.adminTab!=='cases0831C')return;
    var box=document.querySelector('#app .k6cs-sum');if(!box)return;var it=Q()[S.csSelR1006A];if(!it)return;
    var sig=it.id+'|'+(it.msgs||[]).length+'|'+it.status+'|'+(bk(it.pnr)?1:0)+'|'+Math.floor(Date.now()/60000);
    if(box.getAttribute('data-cs120')===sig)return;
    if(document.activeElement&&document.activeElement.id==='k6csSum')return;   /* 正在打字不重畫 */
    var ta=box.querySelector('#k6csSum'),val=ta?ta.value:(it.summary||''),sb=box.querySelector('button[onclick*="kgmCsSaveSumR1006A"]'),btn=sb?sb.parentElement:null;
    var edited=it.summaryBy&&it.summary&&it.summary!==it.summaryAuto;
    box.innerHTML=card(it)+'<details class="cs120-note"'+(edited?' open':'')+'><summary>'+(z()?'客服補充／修正摘要':'Agent note')+(edited?' · '+(z()?'已修改':'edited'):'')+'</summary>'
      +'<textarea id="k6csSum" class="inp" rows="3">'+E(val)+'</textarea>'+(btn?btn.outerHTML:'')+'</details>';
    box.setAttribute('data-cs120',sig);box.classList.add('cs120-sum')}catch(e){try{console.warn('cs120',e)}catch(_){}}}
  var pend=false;function soon(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;decorate()})}
  try{new MutationObserver(function(){if(S.adminTab==='cases0831C')soon()}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
  setInterval(decorate,1500);

  /* ── ② 每天自動產生模擬對話 ── */
  var NM=[['陳怡婷','CHEN','YITING'],['林冠廷','LIN','KUANTING'],['黃郁雯','HUANG','YUWEN'],['張家豪','CHANG','CHIAHAO'],['李佳穎','LEE','CHIAYING'],['王柏翰','WANG','POHAN'],['吳欣怡','WU','HSINYI'],['劉承恩','LIU','CHENGEN'],['蔡佩珊','TSAI','PEISHAN'],['楊宗翰','YANG','TSUNGHAN'],['許雅筑','HSU','YACHU'],['鄭宇軒','CHENG','YUHSUAN'],['謝孟哲','HSIEH','MENGCHE'],['郭品妤','KUO','PINYU'],['洪俊傑','HUNG','CHUNCHIEH'],
    ['Emily Carter','CARTER','EMILY'],['James Walker','WALKER','JAMES'],['Haruka Sato','SATO','HARUKA'],['Minjun Kim','KIM','MINJUN'],['Olivia Brown','BROWN','OLIVIA'],['Lucas Martin','MARTIN','LUCAS'],['Aiko Tanaka','TANAKA','AIKO']];
  var AG=[['張雅雯','K31207'],['李承翰','K31455'],['吳佩珊','K31862'],['黃冠宇','K32019'],['許庭瑜','K32266']];
  var TPL={
    change:['想把 {d} 的 {code} 改到 {d2}，同一個艙等','改的話手續費多少？差價怎麼算？','可以改，您的票價方案改期手續費會在改票頁顯示；改到 {d2} 需要確認同艙等是否有位，我幫您轉接真人客服確認。','已幫您查到 {d2} 同艙等有位，差價＋手續費共 TWD {fee}，同意的話我這邊直接幫您改並重新開票。','好，麻煩幫我改'],
    refund:['{code} {d} 這班臨時不能飛了，可以退票嗎','退的話多久會退到卡上？','依票價規則可能有退票手續費，未使用的稅金可以退；特殊情況需要真人客服確認，我幫您轉接。','已幫您送出退票申請（案件會由主管終審），退款約 7～14 個工作天退回原卡。','謝謝'],
    wchr:['家人 {d} 搭 {code}，需要輪椅，要怎麼申請','到機場要提前多久？','可以申請輪椅服務，需要確認是到登機門還是上下機梯也需要協助，我幫您轉接。','已在訂位加註輪椅服務（到機門），當天請提早 2.5 小時到櫃檯，地勤會協助。','好的'],
    bag:['{d} 的 {code} 可以多帶一件行李嗎？我是經濟艙','現在加購跟機場買差多少？','可以在附加服務頁加購托運行李，網路預購比機場便宜；我幫您轉接確認您票價的額度。','您目前含 1 件 23 公斤，網路加購第二件 TWD {fee2}，機場價約貴三成，我把加購連結傳給您。','了解'],
    seat:['{d} 的 {code} 想跟同行的人坐一起，系統選不到','可以幫我保留走道嗎？','線上選位顯示的是目前可選的座位；相鄰座位不足時要由客服協助，我幫您轉接。','已幫兩位安排 {seat} 相鄰座位，走道在 {seatA}，選位費已免收。','太好了'],
    miles:['{code} {d} 的里程好像沒有入帳','補登要附什麼？','起飛後 7 天仍未入帳可以補登，需要電子機票號碼或登機證；我幫您轉接確認。','查到是會員編號沒有帶進訂位，已幫您補登，里程 3 個工作天內入帳。','謝謝'],
    upg:['{d} 的 {code} 可以用里程升等商務艙嗎？','候補成功會通知嗎？','可以用里程申請升等，所需里程依票價方案；座位是否開放要真人客服確認，我幫您轉接。','已幫您排入升等候補，成功會寄信與站內通知，不成功不扣里程。','好'],
    pet:['{d} 想帶貓搭 {code}，要怎麼申請？','籠子尺寸有限制嗎？','寵物同行要先在「寵物同行」申請，每班名額有限；我幫您轉接確認這班名額。','這班還有客艙寵物名額，申請表已傳給您，籠子含寵物 8 公斤內、尺寸 45×35×25 公分。','收到'],
    irr:['收到 {d} {code} 時間改了的通知，接不上原本的行程','可以免費改到前一班嗎？','航班時間異動接不上可以免費改到可銜接的班次；我幫您轉接確認可改的班次。','已免費幫您改到前一班，新的行程確認已更新在行程管理。','謝謝幫忙'],
    rcpt:['{d} 的 {code}（{pnr}）公司報帳需要英文收據','抬頭要寫公司名稱','電子機票收據可以在行程管理下載；需要加抬頭要由客服重開，我幫您轉接。','英文收據（含抬頭）已重新開立，可以在行程管理下載。','OK 謝謝'],
    meal:['{d} 的 {code} 我吃素，訂位的時候沒選到','蛋奶素可以嗎？','起飛前 24 小時都可以加訂特殊餐；我幫您轉接確認。','已幫您加訂蛋奶素（VLML），會顯示在行程管理。','謝謝']
  };
  var KEYS=Object.keys(TPL);
  function fill(t,v){return String(t).replace(/\{(\w+)\}/g,function(_,k){return v[k]!=null?v[k]:''})}
  function nowTpeMin(){var d=new Date(Date.now()+8*3600000);return d.getUTCHours()*60+d.getUTCMinutes()}
  function tpeISO(date,min){return new Date(Date.parse(date+'T00:00:00Z')+(min-480)*60000).toISOString()}
  function flights(){try{return [].concat(FLIGHTS||[],S.customFlights||[]).filter(function(f){return f&&!f.partner&&!f.codeshare&&!f.via&&/^KX\d{1,4}$/.test(f.code)&&(f.fr==='TPE'||f.to==='TPE')})}catch(_){return []}}
  function flyOK(f,d){try{return !!flyOn(f,new Date(d+'T12:00:00'))}catch(_){return false}}
  function plan(date){var h=H('cs120|'+date),n=6+h%5,out=[],F=flights();if(!F.length)return out;
    for(var i=0;i<n;i++){var hi=H('cs120|'+date+'|'+i),min=420+(hi%960),k=KEYS[(hi>>>5)%KEYS.length],nm=NM[(hi>>>9)%NM.length],f=F[(hi>>>13)%F.length];
      var fd=null;for(var j=0;j<10&&!fd;j++){var c=D(date,4+((hi>>>3)%40)+j);if(flyOK(f,c))fd=c}if(!fd)continue;
      var pnr='';for(var q=0,x=hi;q<6;q++){pnr+='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32];x=(Math.floor(x/32)^H(pnr+q))>>>0}
      var r=(hi>>>7)%1000/1000,tier=r<0.72?'Bronze':r<0.91?'Silver':r<0.975?'Gold':'Diamond';
      out.push({i:i,min:min,k:k,nm:nm,f:f,fd:fd,pnr:pnr,tier:tier,uid:'KGM'+String(10000000+(hi%89999999)).slice(0,8),ag:AG[(hi>>>11)%AG.length],h:hi})}
    return out.sort(function(a,b){return a.min-b.min})}
  function addOne(date,p){var q=Q(),id='CS120'+date.replace(/-/g,'')+('0'+p.i).slice(-2);if(q[id])return false;
    var T0=TPL[p.k],v={code:p.f.code,d:md(p.fd),d2:md(D(p.fd,2)),pnr:p.pnr,fee:String(1500+(p.h%40)*100),fee2:String(1800+(p.h%10)*100),seat:(30+p.h%20)+'D/E',seatA:(30+p.h%20)+'D'};
    var at=tpeISO(date,p.min),t=Date.parse(at),M=function(o,role,text,by){return {id:id+o,role:role,text:text,by:by||'',at:new Date(t+o*60000).toISOString()}};
    var en=/[A-Za-z]/.test(p.nm[0]);
    q[id]={id:id,sim:true,sim120:date,userId:p.uid,name:p.nm[0],email:'',pnr:p.pnr,need:KIND[p.k].lbl,status:'waiting',at:at,tierR1120A:p.tier,romR1120A:[p.nm[1],p.nm[2]],natR1120A:en?'':'TW',
      summary:'',summaryAuto:'',agent:'',agentName:'',k120:p.k,ag120:p.ag,v120:v,
      msgs:[M(-4,'user',fill(T0[0],v)),M(-3,'ai',fill(T0[2],v)),M(-1,'user',fill(T0[1],v)),M(0,'sys',z()?'旅客要求轉接真人客服':'Customer asked for an agent')]};
    var it=q[id];it.summary=it.summaryAuto=(z()?'會員 ':'Member ')+it.name+'（'+it.userId+'）｜'+(z()?'訂位代號 ':'PNR ')+it.pnr+'｜'+(z()?'需求 ':'Need ')+it.need;
    return true}
  /* 時間往前走：等 15 分鐘 → 模擬客服接手；90 分鐘 → 回覆、旅客回、結束 */
  function vOf(it){if(it.v120)return it.v120;var b=bk(it.pnr),f=b&&b.outF||{},d=f.date||T(),h=H(it.id);return {code:f.code||'',d:md(d),d2:md(D(d,2)),pnr:it.pnr||'',fee:String(1500+(h%40)*100),fee2:String(1800+(h%10)*100),seat:(30+h%20)+'D/E',seatA:(30+h%20)+'D'}}
  function advance(it){if(!it||!it.sim)return false;   /* sim120＝每天產生的；sim＝開站時寫死的三筆（原本永遠停在等待中） */
    var age=(Date.now()-Date.parse(it.at))/60000,ch=false,t=Date.parse(it.at),k=it.k120||kindOf(it),T0=TPL[k]||TPL.change,ag=it.ag120||AG[H(it.id)%AG.length],V=vOf(it);
    var M=function(o,role,text,by){return {id:it.id+'x'+o,role:role,text:text,by:by||'',byId:role==='agent'?ag[1]:'',at:new Date(t+o*60000).toISOString()}};
    if(it.status==='waiting'&&age>=15){it.status='active';it.agent=ag[1];it.agentName=ag[0];it.takenAt=new Date(t+15*60000).toISOString();
      it.msgs.push(M(15,'sys',(z()?'客服 ':'Agent ')+ag[0]+(z()?' 接手':' joined')),M(16,'agent',(z()?'您好，我是客服'+ag[0]+'，正在幫您查詢，請稍候。':'Hi, this is '+ag[0]+'. Checking for you now.'),ag[0]));ch=true}
    if(it.status==='active'&&it.agent===ag[1]&&age>=90){it.msgs.push(M(40,'agent',fill(T0[3],V),ag[0]),M(44,'user',fill(T0[4],V)),M(46,'sys',z()?'客服結束對話':'Closed by agent'));
      it.status='closed';it.closedAt=new Date(t+46*60000).toISOString();it.closedBy=ag[1];ch=true}
    return ch}
  function tick(){try{
    if(window.KGM_SIDE==='front'||!S||!S.bookings)return;
    var q=Q(),today=T(),nm=nowTpeMin(),added=0,changed=0;
    for(var back=2;back>=0;back--){var d=D(today,-back);plan(d).forEach(function(p){if(back===0&&p.min>nm)return;if(addOne(d,p))added++})}
    Object.keys(q).forEach(function(id){if(advance(q[id]))changed++});
    /* 關閉 7 天以上的模擬對話清掉 */
    var cut=D(today,-7);Object.keys(q).forEach(function(id){var it=q[id];if(it&&it.sim120&&it.status==='closed'&&String(it.closedAt||'').slice(0,10)<cut){delete q[id];changed++}});
    if(added){/* 模擬訂位：用原本的 csPnr12 依第一句話建；中文名字先換成拼音名給它用，建好再換回來 */
      var tmp=[];Object.keys(q).forEach(function(id){var it=q[id];if(it&&it.sim120&&it.romR1120A&&!bk(it.pnr)){tmp.push([it,it.name]);it.name=it.romR1120A[1]+' '+it.romR1120A[0]}});
      try{if(window.kgmCsSimPnrR1012A)window.kgmCsSimPnrR1012A()}catch(_){}
      tmp.forEach(function(x){var it=x[0];it.name=x[1];var b=bk(it.pnr);if(b){b.csSimR1012A=b.csSimR1012A||it.id;(b.paxList||[]).forEach(function(p,i){if(i===0&&it.userId)p.ffpNum=it.userId;if(it.natR1120A)p.nat=it.natR1120A})}})}
    Object.keys(q).forEach(function(id){var it=q[id];if(!it||!it.sim120||!it.romR1120A)return;var b=bk(it.pnr),p0=b&&(b.paxList||[])[0];if(p0&&!/^[A-Z]/.test(String(p0.lastName||''))){p0.lastName=it.romR1120A[0];p0.firstName=it.romR1120A[1];if(it.natR1120A)p0.nat=it.natR1120A;if(it.userId)p0.ffpNum=it.userId;
      var em=(it.romR1120A[1]+'.'+it.romR1120A[0]).toLowerCase()+(10+H(it.id)%89)+'@gmail.com';if(!/^[a-z]/i.test(String(p0.email||'')))p0.email=em;if(!/^[a-z]/i.test(String(b.contactEmail||'')))b.contactEmail=em;changed++}});
    if(added||changed)persist();
    if(added)setTimeout(tick,4000);   /* 頁面本身的 mount 也會叫 csPnr12（可能用中文名先建）→ 4 秒後再把姓名改成拼音 */
    window.KGM_CS120={added:added,changed:changed,total:Object.keys(q).length,sim120:Object.keys(q).filter(function(k){return q[k]&&q[k].sim120}).length}}catch(e){try{console.warn('cs120 tick',e)}catch(_){}}}
  window.kgmCsSimTickR1120A=tick;
  setTimeout(tick,7000);setInterval(tick,60000);

  /* ── ③ 其他模擬資料每天補（K6）──
     實測（同一個瀏覽器、時鐘往後撥一天）：模擬案件 72→72、寵物申請、模擬團體 6→6 都不會因為過了一天而增加
     （案件只在後台開著時每 3 分鐘進一件；寵物／團體只在第一次開站種一批）。
     改：每天第一次開後台（機隊整年重排做完之後、使用者沒在操作時）補上「上次補到今天」之間每一天的量（最多補 3 天）：
       · 模擬案件：每天 2～4 件，用原本的產生器 kgmCaseSimR1022A（行李、客訴、特殊協助、航班異常…同一套情境）；
       · 寵物同行申請：每天 1 件，照開站那批的格式（新的寵物、航班、日期，狀態從「已收件」開始，之後由原本的案件模擬往下走）；
       · 模擬團體訂位：每 2 天 1 團，照開站那批的格式（新的團名、旅行社、航班、日期，狀態「已報價」或「已付訂金」）；
       · 退票申請（待 CEO 核准）：每 2 天一批，用原本的 kgmRefundSimSeedR1010A（force 依當天日期挑新的航班與旅客）。
     第一次跑只記下今天（開站那批就是今天的量），之後每天才補。補到哪一天記在 S.simDayR1120A（kgm120_simday）。 */
  var PETS=[['dog','KIKI','柴犬',8.1,'cabin'],['cat','OREO','美國短毛貓',4.6,'cabin'],['dog','LUCKY','米克斯',12.5,'hold'],['cat','PUDDING','曼赤肯',3.2,'cabin'],['dog','BEAN','臘腸犬',6.3,'cabin'],['dog','MAX','邊境牧羊犬',18,'hold'],['cat','SNOW','波斯貓',5.4,'cabin'],['dog','TOFU','馬爾濟斯',3.9,'cabin']];
  var GRPN=[['九州溫泉 5 日',28],['首爾購物 4 日',22],['北海道滑雪 6 日',35],['大阪環球影城 5 日',30],['峇里島蜜月 6 日',16],['清邁慢遊 5 日',20],['東京賞櫻 6 日',38],['企業獎勵・沖繩 4 日',64]];
  function clone(o){return JSON.parse(JSON.stringify(o))}
  function dayFlight(d,salt,from){var F=flights().filter(function(f){return f.fr==='TPE'});if(!F.length)return null;for(var i=0;i<30;i++){var f=F[H(salt+'|'+i)%F.length],fd=D(from,H(salt+'d'+i)%14);if(flyOK(f,fd))return {f:f,d:fd}}return null}
  function addPet(d){var L=S.staffCasesR1007A=S.staffCasesR1007A||[],tpl=L.filter(function(c){return c&&c.mockR1108A&&c.type==='pet'})[0];if(!tpl)return 0;
    var no='KG9P'+d.replace(/-/g,'').slice(2)+'M';if(L.some(function(c){return c&&c.caseNo===no}))return 0;var x=dayFlight(d,'pet120'+d,D(d,7));if(!x)return 0;
    var P=PETS[H('pet'+d)%PETS.length],nm=NM[H('petn'+d)%NM.length],fee=P[4]==='hold'?150:100,at=new Date(Date.parse(d+'T02:00:00Z')+(H(d)%600)*60000).toISOString(),f=x.f;
    var c=clone(tpl);delete c.mockBoundR1108A;delete c.decisionR1101A;delete c.closedAt;
    Object.assign(c,{caseNo:no,pnr:'',status:'received',paxName:nm[1]+' / '+nm[2],segment:{code:f.code,fr:f.fr,to:f.to,date:x.d,key:'out'},segments:[{code:f.code,fr:f.fr,to:f.to,date:x.d,dep:f.dep,key:'out',fee:fee,seat:'',seatShown:'',seatFee:0}],
      detail:'寵物同行申請：'+({dog:'狗',cat:'貓'}[P[0]])+'「'+P[1]+'」・'+P[2]+'・'+P[3]+' kg・'+({cabin:'客艙',hold:'托運'}[P[4]])+'。航段：'+f.code+' '+f.fr+'→'+f.to+' '+x.d.slice(5)+'（模擬資料）',
      pet:{species:P[0],name:P[1],breed:P[2],kg:P[3],mode:P[4],fee:fee,total:fee,docs:true,seats:{}},files:[],createdAt:at,updatedAt:at,by:{empId:'',name:nm[2]+' '+nm[1],role:'passenger'},
      progress:[{at:at,status:'received',label:'旅客線上申請（系統依 KGM-PET-009 預審通過）',by:'旅客'}],notes:[],sim120:d});
    L.push(c);return 1}
  function addGroup(d){var L=S.groupsR1023A=S.groupsR1023A||[],tpl=L.filter(function(g){return g&&g.mockR1108A&&g.status==='deposit_paid'})[0]||L.filter(function(g){return g&&g.mockR1108A})[0];if(!tpl)return 0;
    var id='GRP'+d.replace(/-/g,'').slice(2)+'-S';if(L.some(function(g){return g&&g.id===id}))return 0;var x=dayFlight(d,'grp120'+d,D(d,45));if(!x)return 0;
    var R=GRPN[H('g'+d)%GRPN.length],f=x.f,ret=D(x.d,4+H('r'+d)%3),back=null;try{back=flights().filter(function(y){return y.fr===f.to&&y.to==='TPE'&&flyOK(y,ret)})[0]||null}catch(_){}
    var per=Math.round((9000+(H(id)%9000))/10)*10,tot=per*R[1],dep=Math.round(tot*0.1),st=H('s'+d)%2?'deposit_paid':'quoted',at=new Date(Date.parse(d+'T03:00:00Z')+(H(id)%480)*60000).toISOString();
    var segs=[{key:'out',code:f.code,fr:f.fr,to:f.to,date:x.d,dep:f.dep,arr:f.arr,cls:'E-G'}].concat(back?[{key:'inb',code:back.code,fr:back.fr,to:back.to,date:ret,dep:back.dep,arr:back.arr,cls:'E-G'}]:[]);
    var g=clone(tpl);delete g.ticketedAt;delete g.split;delete g.cancelWhy;
    Object.assign(g,{id:id,createdAt:at,status:st,name:R[0],pnr:'M'+String(H(id)%100000).padStart(5,'0'),adults:R[1],pax:R[1],pax0:R[1],segs:segs,legs:segs.map(function(s){return {code:s.code,fr:s.fr,to:s.to,date:s.date,dep:s.dep,arr:s.arr}}),
      total:tot,perSeat:per,deposit:{amount:dep,paid:st!=='quoted',paidAt:st!=='quoted'?at:null,due:st==='quoted'?D(d,5):undefined},balance:{amount:tot-dep,paid:false,due:D(x.d,-21),reminders:[]},due:{balance:D(x.d,-21),names:D(x.d,-28)},names:[],
      history:[{at:at,act:'團體訂位成立（模擬資料）',by:'system'}],sim120:d});
    L.push(g);return 1}
  function daily(){try{
    if(window.KGM_SIDE==='front'||!S||!S.adminAuthed||S.view!=='admin')return;
    if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<8000)return;var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
    var st=S.simDayR1120A=S.simDayR1120A||{},today=T();
    if(!st.last){st.last=today;persist();return}
    if(st.last>=today)return;
    var gap=Math.min(3,Math.round((Date.parse(today)-Date.parse(st.last))/86400000)),got={cases:0,pets:0,groups:0};
    for(var i=gap-1;i>=0;i--){var d=D(today,-i);
      try{if(window.kgmCaseSimR1022A){var r0=window.render;window.render=function(){};try{got.cases+=window.kgmCaseSimR1022A(2+H('c'+d)%3)||0}finally{window.render=r0}}}catch(_){}
      got.pets+=addPet(d);if(H('gd'+d)%2===0)got.groups+=addGroup(d);
      /* 退票申請（待 CEO 核准）：原本的產生器 force 模式依當天日期挑新的航班與旅客 → 每 2 天補一批 */
      if(H('rf'+d)%2===0){try{var rr=window.kgmRefundSimSeedR1010A&&window.kgmRefundSimSeedR1010A(true);got.refunds=(got.refunds||0)+(typeof rr==='number'?rr:(rr&&rr.length)||0)}catch(_){}}}
    st.last=today;st.lastGot=got;persist();window.KGM_SIMDAY_R1120A=got;
    try{(window.kgmSafeRenderR1026C||render)()}catch(_){}}catch(e){try{console.warn('cs120 daily',e)}catch(_){}}}
  window.kgmSimDailyR1120A=daily;
  (function wait(n){setTimeout(function(){if(window.KGM_FULLDONE_1006A||n>40){daily();setInterval(daily,10*60000)}else wait(n+1)},n?5000:30000)})(0);

  var CSS='.k6cs-sum.cs120-sum{padding:14px 18px;background:#fbf9f3}.k6cs-sum.cs120-sum div.cs120-card,.k6cs-sum.cs120-sum div.cs120-q{display:block}.k6cs-sum.cs120-sum div.cs120-segs{display:flex;flex-wrap:wrap;gap:6px}.k6cs-sum.cs120-sum div.cs120-h{display:flex;align-items:baseline}'   /* 原本 .k6cs-sum div{display:flex} 會套到卡片 */
    +'.cs120-card{background:#fff;border:1px solid #ece4d2;border-radius:14px;overflow:hidden}'
    +'.cs120-h{display:flex;align-items:baseline;gap:10px;padding:10px 14px;background:#0b3d2e;color:#fff}.cs120-h span{font-size:10px;letter-spacing:.18em;color:#d9c08a;font-weight:800}.cs120-h b{font-size:14px}.cs120-h i{margin-left:auto;font-style:normal;font-size:11px;color:#b9cfc6}'
    +'.cs120-card dl{display:grid;grid-template-columns:86px 1fr;margin:0}.cs120-card dt{padding:9px 0 9px 14px;font-size:11.5px;font-weight:800;color:#8a6b1f;border-top:1px solid #f3eee2}.cs120-card dd{margin:0;padding:9px 14px 9px 4px;font-size:13px;line-height:1.6;color:#22302a;border-top:1px solid #f3eee2}'
    +'.cs120-card dt:first-of-type,.cs120-card dd:first-of-type{border-top:0}.cs120-card dd em{font-style:normal;color:#9a5b12}.cs120-card dd ol{margin:0;padding-left:18px}.cs120-card dd li{margin:1px 0}'
    +'.cs120-segs{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px}.cs120-seg{font-size:12px;padding:3px 9px;border-radius:999px;background:#eef4f1;color:#0b3d2e}.cs120-seg.past{background:#f1f1ef;color:#9aa39f;text-decoration:line-through}'
    +'.cs120-q{margin-top:3px;color:#5b6660;font-size:12.5px}.cs120-ai{color:#5b5548}'
    +'.cs120-flag{display:inline-block;margin:0 6px 4px 0;padding:3px 9px;border-radius:8px;background:#fff4e2;color:#8a4b00;font-size:12px;font-weight:700}'
    +'.cs120-tier{padding:1px 8px;border-radius:999px;font-size:11px;font-weight:800;background:#f0ece2;color:#6b5a2e}.cs120-tier.t-Gold{background:#f6e7bf;color:#7a5a12}.cs120-tier.t-Diamond{background:#e3ecf5;color:#24466b}.cs120-tier.t-Silver{background:#eceff1;color:#4a555c}'
    +'.cs120-note{margin-top:10px}.cs120-note summary{cursor:pointer;font-size:12px;font-weight:800;color:#8a6b1f}.cs120-note textarea{width:100%;margin:6px 0;font-size:12.5px}.cs120-note>div{display:flex;gap:10px;align-items:center}';
  try{var st=document.createElement('style');st.id='cs120-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
