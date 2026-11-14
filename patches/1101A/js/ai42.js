
/* ══ 1115A D1／D8：後台 AI 真的工具迴圈、突發事件自動處置、臨時航班一句話去回程 ══
   使用者：「AI太笨了」「AI要是真的活AI而不是只會某些動作/Template」
           「AI也要「自動」要根據時事調整航班 像是前幾天美國FAA禁止所有美國航班起飛 所有那時段航班都要自動取消
             然後自動針對case決定取消方案 like這種case就是改成24hr後再起飛 or 12hr depends」
   ① kgmAiLoopR1115A：Claude 呼叫工具 → 網站執行 → 結果（tool_result）交回 Claude → Claude 再決定下一步，最多 8 輪。
      原本（1008B）只送一次：Claude 選了工具就結束，看不到執行結果，問一句查一句。直連（後台這台電腦的金鑰）或 Worker /ai/messages 都走這條。
   ② 突發事件（禁飛令、地面停止、機場／空域關閉）：kgmDisrPlanR1115A 找出時段內受影響的自營航班，逐班決定：
      恢復時間在 12 小時內 → 延後 12 小時；24 小時內 → 延後 24 小時（同一個當地時刻）；更久 → 取消、改搭恢復後第一班（沒有就退費）。
      延後走原本的 flight_delay（航班動態、旅客／組員通知、同一架下一班連鎖延誤），取消走原本的取消流程（processCancelledFlight0815）。
   ③ 自動監測：接上 Claude 時，後台開著每 N 小時用網路搜尋查官方公告（Claude 的 web_search），有時間明確、高可信度的事件就自動處置；
      其他列為「待確認」。紀錄 S.disrR1115A（kgm40_disr）。
   ④ 臨時航班「11/18 加一班 TPE-CDG / 11/19 加一班 CDG-TPE」：kgmTempSegsR1115A 拆段、kgmTempRetDepR1115A 依指定回程日排回程。 */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var KEY='kgm_ai_key_r1008b';
function key(){try{return String(localStorage.getItem(KEY)||'').trim()}catch(_){return ''}}
function wbase(){var b='';try{b=(window.kgmWorkerBaseR22&&window.kgmWorkerBaseR22())||'https://kgm-email.amychen-640413.workers.dev'}catch(_){b='https://kgm-email.amychen-640413.workers.dev'}return String(b||'').replace(/\/+$/,'')}
var LOOP={okWorker:0,noWorker:0,last:''};
window.KGM_AI_LOOP_R1115A=LOOP;
window.kgmAiOnR1115A=function(){return !!key()||LOOP.okWorker>0};

/* ── ① 工具迴圈 ── */
async function call(o,body){
  var k=o.key!=null?o.key:key(),url,headers;
  if(k){url='https://api.anthropic.com/v1/messages';headers={'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true','anthropic-beta':'server-side-fallback-2026-07-01'}}
  else{if(LOOP.noWorker||S.adminAiRemoteOffR929)return {err:z()?'Worker 還沒有 /ai/messages（舊版 Worker）':'Worker lacks /ai/messages',old:1};url=wbase()+'/ai/messages';headers={'content-type':'application/json'}}
  var via=k?'direct':'worker',ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},o.timeout||150000);
  try{
    var res=await fetch(url,{method:'POST',headers:headers,signal:ctl.signal,body:JSON.stringify(body)});clearTimeout(tm);
    var j=null;try{j=await res.json()}catch(_){}
    if(!res.ok){var em=String((j&&j.error&&(j.error.message||j.error))||'').slice(0,160);
      if(!k&&(res.status===404||res.status===405)){LOOP.noWorker=1;return {err:z()?'Worker 還沒有 /ai/messages（舊版 Worker）':'Worker lacks /ai/messages',old:1,via:via}}
      return {via:via,status:res.status,err:res.status===401?(z()?'API 金鑰無效（請到後台 AI「連線」重新貼上）':'Invalid API key')
        :res.status===429?(z()?'用量達到上限，請稍後再試':'Rate limited')
        :(res.status===529||res.status>=500)?(z()?'Anthropic 服務忙碌（'+res.status+'）':'Service busy')
        :/no key/i.test(em)?(z()?'Worker 沒有設定 ANTHROPIC_API_KEY':'Worker has no key')
        :/origin/i.test(em)?(z()?'Worker 的 ALLOWED_ORIGIN 跟目前網址不一樣':'ALLOWED_ORIGIN mismatch')
        :('HTTP '+res.status+(em?'：'+em:''))}}
    if(!k)LOOP.okWorker++;
    return {j:j,via:via};
  }catch(e){clearTimeout(tm);
    if(!k){LOOP.noWorker=1;return {err:z()?'連不到 Worker /ai/messages':'Worker unreachable',old:1,via:via}}
    return {via:via,err:(e&&e.name==='AbortError')?(z()?'等太久沒有回應':'Timed out'):(z()?'連不到 api.anthropic.com：':'Network: ')+String(e&&e.message||e).slice(0,80)}}
}
/* o：{model,system,tools,messages,run(name,input)→Promise<{ok,msg,view}>,maxIter,effort,key}
   回傳 {ok:true,reply,done,model,via,iters} 或 {ok:false,why,oldWorker} */
window.kgmAiLoopR1115A=async function(o){
  var msgs=(o.messages||[]).slice(),done=[],iter=0,model='',via='',reply='',crew=false,t0=Date.now(),max=o.maxIter||8;
  while(iter<max){
    iter++;
    var body={model:o.model||'claude-opus-5-5',max_tokens:o.maxTokens||16000,output_config:{effort:o.effort||'medium'},fallbacks:'default',system:o.system||'',messages:msgs};
    if(o.tools&&o.tools.length)body.tools=o.tools;
    var r=await call(o,body);via=r.via||via;
    if(r.err){LOOP.last=r.err;if(done.length)return {ok:true,reply:(z()?'（連線中斷：':'(Connection lost: ')+r.err+(z()?'；上面是已經完成的步驟）':')'),done:done,model:model,via:via,iters:iter,asyncCrew:crew};return {ok:false,why:r.err,oldWorker:!!r.old,via:via}}
    var j=r.j||{};model=j.model||model;
    if(j.stop_reason==='refusal'){LOOP.last='refusal';return done.length?{ok:true,reply:z()?'（Claude 婉拒繼續這個請求）':'(declined)',done:done,model:model,via:via,iters:iter}:{ok:false,why:z()?'Claude 婉拒這個請求（安全分類）':'Declined'}}
    var c=j.content||[];msgs.push({role:'assistant',content:c});
    var tx=c.filter(function(b){return b&&b.type==='text'}).map(function(b){return b.text}).join('\n').trim();
    if(j.stop_reason==='pause_turn')continue;   /* 伺服器端工具（web_search）還沒做完：原樣送回讓它接著做 */
    var uses=c.filter(function(b){return b&&b.type==='tool_use'});
    if(!uses.length){reply=tx;if(j.stop_reason==='max_tokens'&&!tx)reply=z()?'（回覆被截斷）':'(truncated)';break}
    if(tx)reply=tx;
    var res=[];
    for(var i=0;i<uses.length;i++){var u=uses[i],x=null;
      try{x=await o.run(u.name,u.input||{})}catch(e){x={ok:false,msg:String(e&&e.message||e)}}
      x=x||{ok:false,msg:'—'};if(x.asyncCrew)crew=true;done.push(Object.assign({tool:u.name,input:u.input||{}},x));
      res.push({type:'tool_result',tool_use_id:u.id,content:String(x.msg==null?'':x.msg).replace(/<[^>]+>/g,' ').replace(/[ \t]+/g,' ').slice(0,6000)||(x.ok?'OK':'失敗'),is_error:!x.ok})}
    msgs.push({role:'user',content:res});reply='';
    if(Date.now()-t0>300000)break;
  }
  LOOP.last='ok';
  return {ok:true,reply:reply,done:done,model:model,via:via,iters:iter,asyncCrew:crew};
};
/* 給 Claude 的工具說明（有完整參數的工具） */
window.KGM_AI_SCHEMA_R1115A={
  disruption_apply:{description:'突發事件處置（禁飛令、地面停止 ground stop、機場或空域關閉、罷工停擺…）：找出這段時間內受影響的 KGM 自營航班並逐班決定延後 12 小時、延後 24 小時或取消改搭。airports 機場三碼、countries 國家碼（US、JP、KR、CN、HK、TH、GB、FR、DE…，兩者擇一或都填）；scope=dep（從那裡起飛的班）、arr（降落那裡的班）或 both；start_utc／end_utc 用 ISO 時間（例如 2026-11-18T14:00:00Z，結束時間不知道就填你查到的預估並在 reason 註明）；mode=auto（依恢復時間自動決定，預設）、delay12、delay24、cancel；preview=true 只列出影響不執行。',
    input_schema:{type:'object',properties:{airports:{type:'array',items:{type:'string'}},countries:{type:'array',items:{type:'string'}},scope:{type:'string',enum:['dep','arr','both']},start_utc:{type:'string'},end_utc:{type:'string'},reason:{type:'string'},title:{type:'string'},source_url:{type:'string'},mode:{type:'string',enum:['auto','delay12','delay24','cancel']},preview:{type:'boolean'}},required:['scope','start_utc','end_utc','reason']}},
  flight_temp:{description:'建立臨時航班／加開航班（text 放使用者原話整句，例如「加開 TPE-NRT 11/5」「11/18 加一班 TPE-CDG / 11/19 加一班 CDG-TPE」——同一句裡的去程與回程一次放進來，回程會排在指定那天）。第一次呼叫會依距離建議機型並列出三個方案（機身已在出發站、前後勤務排得開）；之後把使用者的回答原樣放 text 再呼叫：選 1／2／3、改機型或時間、要不要販售。',
    input_schema:{type:'object',properties:{text:{type:'string'}},required:['text']}},
  flight_delay:{description:'航班延誤或改起飛時間（text 放原話，例如「KX181 10/27 延誤 45 分鐘 原因 前一班晚到」「KX13 明天改成 23:10 起飛」）：更新航班動態、通知旅客與當班組員，同一架下一班過站不足自動連鎖延誤。',
    input_schema:{type:'object',properties:{text:{type:'string'},code:{type:'string'},date:{type:'string'},reason:{type:'string'}},required:['text']}},
  flight_cancel:{description:'取消航班（text 放使用者原話，例如「取消10/23 03:00以後出發的航班」）：第一次呼叫會列出符合的班並追問原因，之後把使用者的回答原樣放 text 再呼叫：原因 → 補償方案（1 退費／2 改搭）→ 確認。整個國家或機場因禁令停飛請改用 disruption_apply。',
    input_schema:{type:'object',properties:{text:{type:'string'}},required:['text']}},
  data_query:{description:'查詢後台資料：q 放問題，例如「KX12 11/18」「哪些航班 11/18 延誤」、訂位代號、員工編號、機身 B-58xxx、案件。',
    input_schema:{type:'object',properties:{q:{type:'string'}},required:['q']}}
};
window.kgmAiSysAddR1115A=function(){
  return '\n\n【1115A 工作方式】現在 UTC '+new Date().toISOString().slice(0,16).replace('T',' ')+'。工具執行完，結果會回傳給你；需要資料就先查（data_query 等），看到結果再決定下一步，全部做完再用一兩句話總結做了什麼、還有什麼要使用者決定。\n'
    +'加開／臨時航班一律用 flight_temp（text 放原話；同一則訊息有去程與回程兩段時整句一次放進 text）。\n'
    +'禁飛令、地面停止（ground stop）、機場或空域關閉、罷工停擺等「某段時間某地不能飛」：用 disruption_apply。使用者要處理就先 preview=true 看影響，再 preview=false 執行（同一回合完成）；mode 不指定就用 auto（恢復時間 12 小時內延後 12 小時、24 小時內延後 24 小時、更久就取消改搭）。時間或範圍不確定時先用 web_search 查官方公告（FAA、NOTAM、各國民航局）再執行；查不到可靠來源就不要執行，說明查到什麼。\n'
    +'web_search 只在需要最新外部資訊時用。';
};

/* ── ④ 臨時航班：一句話裡的去程／回程 ── */
window.kgmTempSegsR1115A=function(t){t=String(t||'');var a=t.split(/(?<!\d)[\/／]|[\/／](?!\d)|[；;\n]/).map(function(s){return s.trim()}).filter(function(s){return s&&/[A-Za-z]{3}|[一-鿿]{2}/.test(s)});return a.length?a:[t]};
function badArr(m){m=((m%1440)+1440)%1440;return m>=30&&m<360}
/* minDep：回程最早可以起飛（出發日 00:00 起算、目的地當地分鐘）；回傳回程起飛（同一個基準）或 null */
window.kgmTempRetDepR1115A=function(P,minDep,du,tzd){
  if(!P||!P.ret)return minDep;
  var off=Math.round((Date.parse(P.ret+'T00:00:00Z')-Date.parse(P.date+'T00:00:00Z'))/864e5)*1440,pref=[];
  for(var s=8*60;s<=23*60;s+=30)pref.push(s);
  for(var i=0;i<pref.length;i++){var d=off+pref[i];if(d<minDep)continue;if(badArr(d+du+tzd))continue;return d}
  return null;
};

/* ── ② 突發事件 ── */
var CT={US:'ATL BOS DFW DTW EWR HNL IAD IAH JFK LAS LAX ONT ORD PHX SEA SFO SAN DEN MIA ANC GUM SJC PDX MSP CLT PHL',CA:'YVR YYZ YUL YYC',GB:'LHR LGW MAN',FR:'CDG ORY NCE',DE:'FRA MUC BER DUS',NL:'AMS',IT:'FCO MXP VCE',ES:'MAD BCN',AT:'VIE',CH:'ZRH GVA',CZ:'PRG',HU:'BUD',PL:'WAW',FI:'HEL',GR:'ATH',TR:'IST SAW',AE:'AUH DXB',QA:'DOH',TH:'BKK DMK CNX HKT',VN:'SGN HAN DAD CXR',SG:'SIN',MY:'KUL PEN BKI',PH:'MNL CEB',ID:'CGK DPS',MV:'MLE',IN:'DEL BOM',AU:'SYD MEL BNE PER',NZ:'AKL CHC',
  TW:'TPE TSA KHH RMQ TNN',JP:'NRT HND KIX NGO CTS FUK OKA SDJ UKB MYJ HKD KMJ HIJ TAK KOJ OKJ KTI',KR:'ICN GMP PUS CJU',CN:'PVG SHA PEK PKX CAN SZX XMN HGH CKG CTU NKG WUH CSX KMG XIY TSN DLC SYX HAK CGO FOC',HK:'HKG',MO:'MFM'};
var CTI=null;function ctry(ap){if(!CTI){CTI={};Object.keys(CT).forEach(function(c){CT[c].split(' ').forEach(function(a){CTI[a]=c})})}ap=String(ap||'').toUpperCase();return CTI[ap]||(window.kgmCountryR929&&window.kgmCountryR929(ap))||''}
window.kgmApCountryR1115A=ctry;
var CZH={US:'美國',CA:'加拿大',GB:'英國',FR:'法國',DE:'德國',NL:'荷蘭',IT:'義大利',ES:'西班牙',AT:'奧地利',CH:'瑞士',CZ:'捷克',HU:'匈牙利',PL:'波蘭',FI:'芬蘭',GR:'希臘',TR:'土耳其',AE:'阿聯',QA:'卡達',TH:'泰國',VN:'越南',SG:'新加坡',MY:'馬來西亞',PH:'菲律賓',ID:'印尼',MV:'馬爾地夫',IN:'印度',AU:'澳洲',NZ:'紐西蘭',TW:'台灣',JP:'日本',KR:'韓國',CN:'中國',HK:'香港',MO:'澳門'};
function mins(t){var p=String(t||'0:0').split(':');return (+p[0])*60+(+p[1]||0)}
function hm(m){m=((m%1440)+1440)%1440;return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
function addD(d,k){return new Date(Date.parse(d+'T12:00:00Z')+k*864e5).toISOString().slice(0,10)}
function tzAt(ap,d){try{if(window.kgmTzAtR1026C)return +window.kgmTzAtR1026C(ap,d)||0}catch(_){}try{return +tz(ap)||0}catch(_){return 0}}
function allF(){var a=[];try{a=[].concat(FLIGHTS,S.customFlights||[])}catch(_){}return a.filter(function(f){return f&&!f.partner&&!f.codeshare&&!f.via&&/^KX\d+$/.test(String(f.code||''))})}
function flies(f,d){try{return typeof flyOn==='function'?flyOn(f,new Date(d+'T12:00:00')):true}catch(_){return false}}
function sea(f,d){try{return (window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,d))||f}catch(_){return f}}
function utcMs(iso){var t=Date.parse(String(iso||'').trim().replace(' ','T')+(/[zZ]|[+-]\d\d:?\d\d$/.test(String(iso||'').trim())?'':'Z'));return isFinite(t)?t:NaN}
/* 一班某天：排定（或人工改過的）起飛／抵達的 UTC 分鐘 */
function legOf(f,d){var x=sea(f,d),ov=(S.flightOverrides||{})[f.code+'_'+d]||{};
  var dep=mins(x.dep),arr=mins(x.arr)+1440*(+x.dd||0);
  if(ov.dep&&ov.manual){dep=mins(ov.dep)+1440*(+ov.depDD||0);arr=ov.arr?mins(ov.arr)+1440*(+ov.arrDD||0):arr+(dep-mins(x.dep))}
  var b=Date.parse(d+'T00:00:00Z')/60000,dU=b+dep-tzAt(f.fr,d)*60,aU=b+arr-tzAt(f.to,addD(d,Math.floor(arr/1440)))*60;
  return {code:f.code,fr:f.fr,to:f.to,date:d,dep:x.dep,arr:x.arr,dd:+x.dd||0,depU:dU,arrU:aU,st:String(ov.status||''),disr:ov.disrR1115A||'',f:f}}
function set(a){var o={};(a||[]).forEach(function(x){x=String(x||'').trim().toUpperCase();if(x)o[x]=1});return o}
function hitAp(ap,A,C){return !!(A[ap]||C[ctry(ap)])}
/* 方案：恢復時間在 12／24 小時內就延後；新抵達時刻落在 00:30–05:59（非曼谷航線）不採用 12 小時改 24 小時；再久就取消改搭 */
function decide(L,need,mode){
  if(mode==='cancel')return {act:'cancel'};
  if(mode==='delay12')return {act:'delay',h:12};if(mode==='delay24')return {act:'delay',h:24};
  var bkk=L.fr==='BKK'||L.to==='BKK';
  var w12='';if(need+30<=720){var na=mins(L.arr)+1440*L.dd+720,nd=mins(L.dep)+720;if(bkk||(!badArr(na)&&!(hm(nd)>='03:00'&&hm(nd)<'06:00')))return {act:'delay',h:12};
    w12=z()?(badArr(na)?'延後 12 小時會在 '+hm(na)+' 凌晨抵達':'延後 12 小時會在 '+hm(nd)+' 凌晨起飛')+'，改 24 小時':'+12h lands at night'}
  if(need+30<=1440)return {act:'delay',h:24,why:w12};
  return {act:'cancel'};
}
window.kgmDisrPlanR1115A=function(a){
  a=a||{};var A=set(a.airports),C=set(a.countries),sc=a.scope||'dep',s=utcMs(a.start_utc),e=utcMs(a.end_utc),now=Date.now();
  if(!isFinite(s)||!isFinite(e)||e<=s)return {err:z()?'開始／結束時間看不懂（要 ISO 時間，例如 2026-11-18T14:00:00Z）':'Bad time window'};
  if(!Object.keys(A).length&&!Object.keys(C).length)return {err:z()?'要指定受影響的機場或國家':'Need airports or countries'};
  var sM=s/60000,eM=e/60000,nM=now/60000,d0=new Date(Math.max(s,now)-2*864e5).toISOString().slice(0,10),nd=Math.min(14,Math.ceil((e-Math.max(s,now))/864e5)+3),out=[],seen={};
  var F=allF();
  for(var k=0;k<=nd;k++){var d=addD(d0,k);F.forEach(function(f){
    var dh=sc!=='arr'&&hitAp(f.fr,A,C),ah=sc!=='dep'&&hitAp(f.to,A,C);if(!dh&&!ah)return;if(!flies(f,d))return;
    var L=legOf(f,d),id=L.code+'|'+L.fr+'|'+d;if(seen[id])return;seen[id]=1;
    if(L.depU<=nM)return;   /* 已經起飛的不動 */
    if(/cancel/i.test(L.st))return;
    var need=0;if(dh&&L.depU>=sM&&L.depU<eM)need=Math.max(need,eM-L.depU);if(ah&&L.arrU>=sM&&L.arrU<eM)need=Math.max(need,eM-L.arrU);
    if(need<=0)return;
    L.need=Math.round(need);L.dec=decide(L,L.need,a.mode||'auto');out.push(L)})}
  out.sort(function(x,y){return x.depU-y.depU});
  return {list:out,sM:sM,eM:eM}};
function fmtU(m){if(!isFinite(m))return z()?'（未公布）':'(TBA)';var d=new Date(m*60000);return d.toISOString().slice(5,16).replace('T',' ').replace('-','/')+'Z'}
function nextAfter(L,eM){   /* 恢復後同航線第一班（4 天內、沒有被取消、不在這次清單裡） */
  for(var k=0;k<=4;k++){var d=addD(L.date,k),best=null;allF().forEach(function(f){if(f.fr!==L.fr||f.to!==L.to||!flies(f,d))return;var x=legOf(f,d);if(x.depU<eM+30||/cancel/i.test(x.st))return;if(x.code===L.code&&x.date===L.date)return;if(!best||x.depU<best.depU)best=x});
    if(best){var y=sea(best.f,best.date);return Object.assign({},y,{date:best.date})}}return null}
function paxOn(code,d){var n=0;(S.bookings||[]).forEach(function(b){if(!b||/cancel/i.test(String(b.status||'')))return;[b.outF,b.inbF].concat(b.legsR||[]).forEach(function(x){if(x&&x.code===code&&x.date===d)n++})});return n}
function applyOne(L,ev){
  var who=(S.adminUser&&S.adminUser.empId)||'AI',why=ev.reason||'',k=L.code+'_'+L.date;
  if(L.dec.act==='delay'){
    var r={ok:false,msg:''};try{r=window.kgmAiDelayR1023A({code:L.code,date:L.date,reason:why,text:L.code+' '+L.fr+' '+L.date+' 延後 '+L.dec.h+' 小時 原因：'+String(why).replace(/[，。,.]/g,' ')})}catch(e){r={ok:false,msg:String(e&&e.message||e)}}
    var o=(S.flightOverrides||{})[k];if(o)o.disrR1115A=ev.id;
    return {code:L.code,date:L.date,fr:L.fr,to:L.to,was:L.dep+'–'+L.arr+(L.dd?'⁺'+L.dd:''),act:'delay'+L.dec.h,why:L.dec.why||'',ok:!!r.ok,msg:String(r.msg||'')}}
  var nf=nextAfter(L,ev.eM),cfg=nf?{mode:'move_existing',moveFlight:nf,reason:why}:{mode:'refund',reason:why},n0=paxOn(L.code,L.date);
  S.flightOverrides=S.flightOverrides||{};
  S.flightOverrides[k]=Object.assign({},S.flightOverrides[k]||{},{status:'Cancelled',depRemark:why,reason:why,cancelledBy:who,cancelledAt:new Date().toISOString(),disrR1115A:ev.id});
  var err='';try{processCancelledFlight0815(k,cfg)}catch(e){err=String(e&&e.message||e)}
  return {code:L.code,date:L.date,fr:L.fr,to:L.to,was:L.dep+'–'+L.arr+(L.dd?'⁺'+L.dd:''),act:'cancel',ok:!err,move:nf?(nf.code+' '+nf.date+' '+nf.dep):'',pax:n0,msg:err}}
function st(){var d=S.disrR1115A;if(!d||typeof d!=='object')d=S.disrR1115A={};d.events=d.events||[];if(d.auto==null)d.auto=true;if(d.autoApply==null)d.autoApply=true;if(!d.every)d.every=180;return d}
function evText(ev){var a=Object.keys(set(ev.airports)),c=Object.keys(set(ev.countries));
  return (c.length?c.map(function(x){return CZH[x]||x}).join('、'):'')+(c.length&&a.length?'、':'')+(a.length?a.join('、'):'')+' '+({dep:z()?'起飛':'departures',arr:z()?'降落':'arrivals',both:z()?'起降':'all'}[ev.scope||'dep'])+' '+fmtU(ev.sM)+'–'+fmtU(ev.eM)}
function sumTxt(P,ev,applied){
  var L=P.list,n12=0,n24=0,nc=0;L.forEach(function(x){if(x.dec.act==='cancel')nc++;else if(x.dec.h===12)n12++;else n24++});
  var head=(applied?(z()?'✓ 已處置 ':'✓ Applied: '):(z()?'預覽 ':'Preview: '))+(ev.title?ev.title+'：':'')+evText(ev)+'\n'
    +(z()?('受影響自營航班 '+L.length+' 班：延後 12 小時 '+n12+'、延後 24 小時 '+n24+'、取消改搭 '+nc):(L.length+' flights'));
  var rows=(applied||L).slice(0,40).map(function(x){var d=x.dec||{};var act=x.act||(d.act==='cancel'?'cancel':'delay'+d.h);
    var wy=(x.dec&&x.dec.why)||x.why||'';return '· '+x.code+' '+x.fr+'→'+x.to+' '+x.date+' '+(x.was||x.dep+'–'+x.arr+(x.dd?'⁺'+x.dd:''))+' → '+(act==='cancel'?(z()?'取消':'cancel')+(x.move?(z()?'，改搭 ':', rebook ')+x.move:(applied?(z()?'，退費':', refund'):'')):(z()?'延後 ':'+')+act.replace('delay','')+(z()?' 小時':'h'))+(wy?(z()?'（'+wy+'）':' ('+wy+')'):'')+(x.ok===false?(z()?'（失敗：':' (failed: ')+String(x.msg||'').slice(0,60)+'）':'')});
  if(L.length>40)rows.push(z()?'…另 '+(L.length-40)+' 班':'…');
  return head+(rows.length?'\n'+rows.join('\n'):'')+(applied?'':'\n'+(z()?'（規則：恢復時間在 12 小時內延後 12 小時、24 小時內延後 24 小時（同一個當地時刻）；更久就取消、改搭恢復後同航線第一班，沒有就退費。延後的班會通知旅客與組員，同一架的下一班過站不足會連鎖延誤。）':''));
}
/* 執行（或預覽）一個事件；auto＝背景自動 */
window.kgmDisrApplyR1115A=function(a,auto){
  a=a||{};var P=window.kgmDisrPlanR1115A(a);if(P.err)return {ok:false,msg:P.err};
  var ev={id:a.id||('DSR'+Date.now().toString(36).toUpperCase()),title:String(a.title||'').slice(0,120),reason:String(a.reason||a.title||(z()?'航管／主管機關禁令':'ATC restriction')).slice(0,120),source:String(a.source_url||'').slice(0,300),authority:String(a.authority||'').slice(0,60),
    airports:a.airports||[],countries:a.countries||[],scope:a.scope||'dep',start:a.start_utc,end:a.end_utc,sM:P.sM,eM:P.eM,mode:a.mode||'auto',at:new Date().toISOString(),by:auto?'AI 自動監測':((S.adminUser&&S.adminUser.empId)||'AI'),conf:a.confidence||''};
  if(a.preview)return {ok:true,view:true,msg:sumTxt(P,ev,null),plan:P};
  var D=st(),dup=D.events.filter(function(x){return x.status==='applied'&&x.scope===ev.scope&&x.start===ev.start&&x.end===ev.end&&JSON.stringify(Object.keys(set(x.airports)).sort().concat(Object.keys(set(x.countries)).sort()))===JSON.stringify(Object.keys(set(ev.airports)).sort().concat(Object.keys(set(ev.countries)).sort()))})[0];
  if(dup)return {ok:true,msg:(z()?'這個事件已經處置過（':'Already applied (')+dup.id+'）。'};
  var res=[];P.list.forEach(function(L){if(L.disr)return;res.push(applyOne(L,ev))});
  try{window.kgmCancelFleetR1023A&&window.kgmCancelFleetR1023A()}catch(_){}
  try{LS.set('kgmov4',S.flightOverrides)}catch(_){}
  ev.status='applied';ev.results=res;D.events.unshift(ev);if(D.events.length>60)D.events.length=60;
  try{logAct(auto?'AI 自動處置突發事件':'AI 突發事件處置',evText(ev)+' · '+res.length+' 班')}catch(_){}
  try{save()}catch(_){}
  return {ok:true,quiet:true,msg:sumTxt(P,ev,res),event:ev.id};
};

/* 沒接 Claude 時的站內解析：「11/18 FAA 禁止所有美國航班起飛 14:00-23:00 UTC」 */
var CN2={'美國':'US','美国':'US','加拿大':'CA','英國':'GB','法國':'FR','德國':'DE','荷蘭':'NL','義大利':'IT','西班牙':'ES','奧地利':'AT','瑞士':'CH','捷克':'CZ','匈牙利':'HU','波蘭':'PL','芬蘭':'FI','希臘':'GR','土耳其':'TR','阿聯':'AE','杜拜':'AE','卡達':'QA','泰國':'TH','越南':'VN','新加坡':'SG','馬來西亞':'MY','菲律賓':'PH','印尼':'ID','澳洲':'AU','紐西蘭':'NZ','日本':'JP','韓國':'KR','南韓':'KR','中國':'CN','大陸':'CN','香港':'HK','澳門':'MO','台灣':'TW'};
window.kgmDisrIsR1115A=function(t){return /FAA|禁飛|停飛令|地面停止|ground ?stop|機場關閉|關閉機場|空域關閉|關閉空域|禁止.{0,12}(起飛|起降|飛航|航班)|全面停飛/i.test(String(t||''))};
window.kgmDisrLocalR1115A=function(t){
  t=String(t||'');if(!window.kgmDisrIsR1115A(t))return null;
  var u=t.toUpperCase(),C={},A={};if(/FAA/.test(u))C.US=1;Object.keys(CN2).forEach(function(k){if(t.indexOf(k)>=0)C[CN2[k]]=1});
  (u.match(/\b[A-Z]{3}\b/g)||[]).forEach(function(x){if(x!=='FAA'&&x!=='UTC'&&x!=='GMT'&&ctry(x))A[x]=1});
  var sc=/降落|抵達|入境|arriv/i.test(t)&&!/起飛|depart/i.test(t)?'arr':(/起降|關閉|both/i.test(t)?'both':'dep');
  var y=+new Date().toISOString().slice(0,4),ds=[],m,re=/(?:(20\d\d)[-\/.年])?(?<![\d:])(\d{1,2})\s*[\/月]\s*(\d{1,2})日?(?![\d:])/g;
  while((m=re.exec(t))){if(+m[2]<1||+m[2]>12||+m[3]<1||+m[3]>31)continue;var d=(m[1]||y)+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);if(!m[1]&&d<new Date(Date.now()-864e5).toISOString().slice(0,10))d=(y+1)+d.slice(4);ds.push(d)}
  var ts=[];re=/(\d{1,2})[:：](\d{2})/g;while((m=re.exec(t)))ts.push(('0'+m[1]).slice(-2)+':'+m[2]);
  var utc=/UTC|GMT|Z\b|世界時/i.test(u),tpe=/台北|台灣時間|\+08|\+8/.test(t),zz=utc?'Z':(tpe?'+08:00':'Z');
  var d1=ds[0]||new Date().toISOString().slice(0,10),d2=ds[1]||d1,s,e;
  if(ts.length>=2){s=d1+'T'+ts[0]+':00'+zz;e=(ds[1]?d2:d1)+'T'+ts[1]+':00'+zz;if(utcMs(e)<=utcMs(s))e=addD(ds[1]?d2:d1,1)+'T'+ts[1]+':00'+zz}
  else if(ts.length===1){s=d1+'T'+ts[0]+':00'+zz;var hh=/(\d+)\s*(?:個)?\s*小時/.exec(t);e=new Date(utcMs(s)+((hh?+hh[1]:12)*36e5)).toISOString()}
  else{s=d1+'T00:00:00'+zz;e=addD(d2,1)+'T00:00:00'+zz}
  var mode=/取消/.test(t)&&!/延後|延誤/.test(t)?'auto':(/24\s*(?:小時|hr|h)/i.test(t)?'delay24':(/12\s*(?:小時|hr|h)/i.test(t)?'delay12':'auto'));
  return {airports:Object.keys(A),countries:Object.keys(C),scope:sc,start_utc:s,end_utc:e,reason:(/FAA/.test(u)?'FAA ':'')+(z()?'禁令（後台輸入）':'restriction'),mode:mode,preview:!/執行|直接|馬上|立即|自動/.test(t)};
};
/* 站內解析的「預覽 → 確認」 */
window.kgmDisrLocalAskR1115A=function(t){
  var P=S.disrPendR1115A;
  if(P&&Date.now()-P.at<30*60000&&/^\s*(確認|執行|好|是|ok|yes|go)\s*$/i.test(t)){S.disrPendR1115A=null;var a=Object.assign({},P.args,{preview:false});return Object.assign({quiet:true},window.kgmDisrApplyR1115A(a))}
  if(P&&/^\s*(算了|不要|放棄|cancel)\s*$/i.test(t)){S.disrPendR1115A=null;return {ok:true,msg:z()?'好，沒有處置。':'Cancelled.'}}
  var a=window.kgmDisrLocalR1115A(t);if(!a)return null;
  if(!a.airports.length&&!a.countries.length)return {ok:false,msg:z()?'請告訴我受影響的國家或機場，例如「11/18 14:00-23:00 UTC FAA 禁止美國所有航班起飛」。':'Which country / airports?'};
  var r=window.kgmDisrApplyR1115A(a);if(!r.ok)return r;
  if(a.preview){S.disrPendR1115A={args:a,at:Date.now()};return {ok:true,quiet:true,msg:r.msg+'\n\n'+(z()?'回覆「確認」就照這樣處置（會通知旅客與組員），或「算了」放棄。':'Reply "confirm".')}}
  return r};

/* ── ③ 自動監測（接上 Claude 才跑；網路搜尋官方公告） ── */
var SCAN={busy:0};
function netAps(){var o={};allF().forEach(function(f){o[f.fr]=1;o[f.to]=1});return Object.keys(o).sort()}
var REPORT={name:'report_disruptions',strict:true,description:'回報查到的航空營運中斷事件（禁飛令、地面停止、機場或空域關閉、罷工停擺）。沒有就回報空陣列。每個事件一筆。',
  input_schema:{type:'object',additionalProperties:false,required:['events'],properties:{events:{type:'array',items:{type:'object',additionalProperties:false,
    required:['title','authority','source_url','airports','countries','scope','start_utc','end_utc','confidence','summary'],
    properties:{title:{type:'string'},authority:{type:'string'},source_url:{type:'string'},airports:{type:'array',items:{type:'string'}},countries:{type:'array',items:{type:'string'}},
      scope:{type:'string',enum:['dep','arr','both']},start_utc:{type:'string'},end_utc:{type:['string','null']},confidence:{type:'string',enum:['high','medium','low']},summary:{type:'string'}}}}}}};
window.kgmDisrScanR1115A=async function(manual){
  var D=st();if(SCAN.busy)return;SCAN.busy=1;D.lastScan=new Date().toISOString();D.scanMsg=z()?'檢查中…':'Checking…';paint();
  var got=null,aps=netAps();
  var sys='你是 KGM Airways（台灣桃園為基地的航空公司）營運控制中心的監測助理。現在 UTC '+new Date().toISOString().slice(0,16).replace('T',' ')+'。\n'
    +'用 web_search 查「最近 48 小時內發布、影響現在到未來 72 小時」的航空營運中斷：主管機關禁飛令或地面停止（例如 FAA ground stop）、機場關閉、空域關閉、罷工導致機場停擺。\n'
    +'只看會影響下列機場的事件：'+aps.join(' ')+'。\n'
    +'只回報有官方來源（FAA、NOTAM、各國民航局、機場公告）或主要媒體報導、而且影響時段寫得出來的事件；結束時間沒公布就填 null。已經結束的事件不要回報。\n'
    +'最後一定要呼叫 report_disruptions 一次（沒有事件就 events 給空陣列），不要只用文字回答。';
  var L=await window.kgmAiLoopR1115A({model:'claude-opus-5-5',system:sys,maxIter:6,effort:'medium',
    tools:[{type:'web_search_20260209',name:'web_search',max_uses:6},REPORT],
    messages:[{role:'user',content:'請檢查現在有沒有會影響我們航班的禁飛令、地面停止、機場或空域關閉。'}],
    run:async function(n,a){if(n==='report_disruptions'){got=(a&&a.events)||[];return {ok:true,msg:'收到 '+got.length+' 筆'}}return {ok:false,msg:'unknown tool'}}});
  SCAN.busy=0;
  if(!L||!L.ok){D.scanMsg=(z()?'沒有完成：':'Failed: ')+((L&&L.why)||'—');try{save()}catch(_){}paint();return}
  if(!got){D.scanMsg=z()?'Claude 沒有回報結果（'+String(L.reply||'').slice(0,80)+'）':'No report';try{save()}catch(_){}paint();return}
  var n=0,np=0;got.forEach(function(x){if(!x||!x.start_utc)return;
    var key=[x.authority,x.start_utc,(x.airports||[]).join(','),(x.countries||[]).join(',')].join('|');if(D.events.some(function(e){return e.key===key}))return;
    var a=Object.assign({},x,{reason:(x.authority?x.authority+' ':'')+(x.title||''),mode:'auto'});
    if(x.end_utc&&x.confidence==='high'&&D.autoApply){var r=window.kgmDisrApplyR1115A(a,true);var e0=D.events[0];if(e0&&r.event===e0.id){e0.key=key;e0.summary=x.summary}n++;
      try{var c=S.adminAiR929=S.adminAiR929||LS.get('kgm_adminai929',{})||{},k2=(S.adminUser||{}).empId||'ADMIN';(c[k2]=c[k2]||[]).push({role:'assistant',text:(z()?'【自動監測】':'[Auto] ')+r.msg+(x.source_url?'\n'+(z()?'來源：':'Source: ')+x.source_url:''),at:new Date().toISOString(),src:'opus',note:z()?'Claude · 自動監測':'Claude · monitor'});LS.set('kgm_adminai929',c)}catch(_){}}
    else{D.events.unshift({id:'DSR'+Date.now().toString(36).toUpperCase()+np,key:key,status:'pending',title:x.title,authority:x.authority,source:x.source_url,airports:x.airports,countries:x.countries,scope:x.scope,start:x.start_utc,end:x.end_utc||'',conf:x.confidence,summary:x.summary,at:new Date().toISOString(),by:'AI 自動監測',
      why:!x.end_utc?(z()?'結束時間未公布':'No end time'):(x.confidence!=='high'?(z()?'可信度 '+x.confidence:'confidence '+x.confidence):(z()?'自動執行已關閉':'auto-apply off'))});np++}});
  D.scanMsg=(z()?'查到 ':'Found ')+got.length+(z()?' 筆；自動處置 '+n+'、待確認 '+np:' · applied '+n+' · pending '+np);
  try{save()}catch(_){}paint();try{window.kgmAdminAiDrawR929&&window.kgmAdminAiDrawR929()}catch(_){}
};
setInterval(function(){try{
  if(S.view!=='admin'||!S.adminAuthed)return;var D=st();if(!D.auto||SCAN.busy)return;
  if(!key()&&LOOP.noWorker)return;
  var last=Date.parse(D.lastScan||0)||0;if(Date.now()-last<(+D.every||180)*60000)return;
  if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<3000)return;
  window.kgmDisrScanR1115A(false)}catch(_){}},60000);

/* ── 介面：航班營運「關閉空域・Payload」頁最上面 ── */
function paint(){try{var el=document.getElementById('k115d');if(el)el.outerHTML=window.kgmDisrHtmlR1115A()}catch(_){}}
window.kgmDisrSetR1115A=function(k,v){var D=st();D[k]=v;try{save()}catch(_){}paint()};
window.kgmDisrFormR1115A=function(pv){
  var g=function(id){var x=document.getElementById(id);return x?String(x.value||'').trim():''};
  var w=g('k115dW'),zz=g('k115dZ')==='tpe'?'+08:00':'Z',s=g('k115dS'),e=g('k115dE'),list=w.toUpperCase().split(/[\s,，、]+/).filter(Boolean);
  var a={airports:list.filter(function(x){return x.length===3}),countries:list.filter(function(x){return x.length===2}),scope:g('k115dC')||'dep',start_utc:s?s+':00'+zz:'',end_utc:e?e+':00'+zz:'',reason:g('k115dR')||(z()?'航管／主管機關禁令':'Restriction'),mode:g('k115dM')||'auto',preview:!!pv};
  var r=window.kgmDisrApplyR1115A(a);S.disrFormMsgR1115A=r.msg;paint()};
window.kgmDisrPendApplyR1115A=function(id){var D=st(),ev=D.events.filter(function(x){return x.id===id})[0];if(!ev)return;
  if(!ev.end){S.disrFormMsgR1115A=z()?'這個事件沒有結束時間，請在下面表單填預估的結束時間再執行。':'Need an end time.';paint();return}
  var r=window.kgmDisrApplyR1115A({title:ev.title,reason:(ev.authority?ev.authority+' ':'')+(ev.title||''),source_url:ev.source,airports:ev.airports,countries:ev.countries,scope:ev.scope,start_utc:ev.start,end_utc:ev.end,mode:'auto'});
  if(r.ok){ev.status='done';ev.doneBy=r.event||''}S.disrFormMsgR1115A=r.msg;try{save()}catch(_){}paint()};
window.kgmDisrDismissR1115A=function(id){var D=st();D.events.forEach(function(x){if(x.id===id&&x.status==='pending')x.status='dismissed'});try{save()}catch(_){}paint()};
window.kgmDisrHtmlR1115A=function(){
  try{
  var D=st(),on=window.kgmAiOnR1115A(),k=!!key(),conn=k?(z()?'直接連線（這台電腦的金鑰）':'Direct'):(LOOP.okWorker?'Worker':(LOOP.noWorker?(z()?'Worker 還沒更新 /ai/messages':'Worker not updated'):(z()?'未確認（沒有金鑰，會試 Worker）':'Unverified')));
  var ev=D.events.slice(0,12).map(function(x){
    var res=(x.results||[]),n12=res.filter(function(r){return r.act==='delay12'}).length,n24=res.filter(function(r){return r.act==='delay24'}).length,nc=res.filter(function(r){return r.act==='cancel'}).length;
    return '<div class="k115d-ev '+E(x.status||'')+'"><div class="k115d-evh"><b>'+E(x.title||evText(x))+'</b><span class="k115d-tag">'+E({applied:z()?'已處置':'Applied',pending:z()?'待確認':'Pending',done:z()?'已處置':'Done',dismissed:z()?'不處理':'Dismissed'}[x.status]||x.status||'')+'</span></div>'
      +'<small>'+E(evText({airports:x.airports,countries:x.countries,scope:x.scope,sM:utcMs(x.start)/60000,eM:x.end?utcMs(x.end)/60000:NaN}))+' · '+E(x.by||'')+' · '+E(String(x.at||'').slice(0,16).replace('T',' '))+(x.authority?' · '+E(x.authority):'')+(x.why?' · '+E(x.why):'')+'</small>'
      +(x.summary?'<p>'+E(x.summary)+'</p>':'')+(x.source?'<a href="'+E(x.source)+'" target="_blank" rel="noopener">'+(z()?'來源':'Source')+'</a>':'')
      +(x.status==='applied'?'<div class="k115d-res">'+(z()?'延後 12 小時 ':'+12h ')+n12+' · '+(z()?'延後 24 小時 ':'+24h ')+n24+' · '+(z()?'取消改搭 ':'cancelled ')+nc
        +(res.length?'<table><tbody>'+res.slice(0,30).map(function(r){return '<tr><td>'+E(r.code)+'</td><td>'+E(r.fr+'→'+r.to)+'</td><td>'+E(r.date)+' '+E(r.was||'')+'</td><td>'+(r.act==='cancel'?'<em>'+(z()?'取消':'Cancelled')+'</em>'+(r.move?(z()?' → 改搭 ':' → ')+E(r.move):(z()?' → 退費':' → refund')):(z()?'延後 ':'+')+E(r.act.replace('delay',''))+(z()?' 小時':'h'))+(r.ok===false?' ✕':'')+'</td></tr>'}).join('')+'</tbody></table>':'<div class="k115d-none">'+(z()?'時段內沒有受影響的自營航班':'No KGM flights affected')+'</div>')+'</div>':'')
      +(x.status==='pending'?'<div class="k115d-act"><button class="k27pc-b" onclick="kgmDisrPendApplyR1115A(\''+E(x.id)+'\')">'+(z()?'照規則處置':'Apply')+'</button><button class="k27pc-b ghost" onclick="kgmDisrDismissR1115A(\''+E(x.id)+'\')">'+(z()?'不處理':'Dismiss')+'</button></div>':'')+'</div>'}).join('');
  return '<section class="k27pc k115d" id="k115d"><header><small>DISRUPTIONS · AI</small><h2>'+(z()?'突發事件・AI 自動處置':'Disruptions · AI handling')+'</h2>'
    +'<p>'+(z()?'禁飛令、地面停止（ground stop）、機場或空域關閉：時段內從那裡起飛（或降落那裡）的自營航班逐班決定——恢復時間在 12 小時內延後 12 小時、24 小時內延後 24 小時（同一個當地時刻），更久就取消並改搭恢復後同航線第一班（沒有就退費）；延後與取消都通知旅客、組員，同一架下一班過站不足會連鎖延誤。自動監測要接上 Claude（後台 AI「連線」貼金鑰，或 Worker 加 /ai/messages），每隔一段時間用網路搜尋查官方公告：時間明確、可信度高的事件直接處置，其他列「待確認」。':'Ground stops, airport or airspace closures: each affected flight is delayed 12 h / 24 h or cancelled and rebooked depending on when operations resume.')+'</p></header>'
    +'<div class="k115d-bar"><span>'+(z()?'Claude 連線：':'Claude: ')+'<b class="'+(on?'ok':'')+'">'+E(conn)+'</b></span>'
      +'<label><input type="checkbox" '+(D.auto?'checked':'')+' onchange="kgmDisrSetR1115A(\'auto\',this.checked)"> '+(z()?'自動監測':'Monitor')+'</label>'
      +'<label>'+(z()?'每':'Every')+' <select onchange="kgmDisrSetR1115A(\'every\',+this.value)">'+[60,180,360].map(function(m){return '<option value="'+m+'"'+(+D.every===m?' selected':'')+'>'+(m/60)+(z()?' 小時':' h')+'</option>'}).join('')+'</select></label>'
      +'<label><input type="checkbox" '+(D.autoApply?'checked':'')+' onchange="kgmDisrSetR1115A(\'autoApply\',this.checked)"> '+(z()?'高可信度自動執行':'Auto-apply high confidence')+'</label>'
      +'<button class="k27pc-b ghost" onclick="kgmDisrScanR1115A(true)"'+(SCAN.busy?' disabled':'')+'>'+(SCAN.busy?(z()?'檢查中…':'Checking…'):(z()?'立即檢查':'Check now'))+'</button>'
      +'<span class="k115d-last">'+(D.lastScan?(z()?'上次 ':'Last ')+E(String(D.lastScan).slice(5,16).replace('T',' '))+' UTC':'')+(D.scanMsg?' · '+E(D.scanMsg):'')+'</span></div>'
    +'<div class="k27pc-form"><label class="w">'+(z()?'國家碼／機場（空白或逗號分隔，例如 US 或 LAX SFO）':'Countries / airports')+'<input id="k115dW" placeholder="US"></label>'
      +'<label>'+(z()?'範圍':'Scope')+'<select id="k115dC"><option value="dep">'+(z()?'從那裡起飛':'Departures')+'</option><option value="arr">'+(z()?'降落那裡':'Arrivals')+'</option><option value="both">'+(z()?'起降都算':'Both')+'</option></select></label>'
      +'<label>'+(z()?'時區':'Zone')+'<select id="k115dZ"><option value="utc">UTC</option><option value="tpe">'+(z()?'台北':'Taipei')+'</option></select></label>'
      +'<label>'+(z()?'開始':'From')+'<input id="k115dS" type="datetime-local"></label><label>'+(z()?'結束（恢復）':'Until')+'<input id="k115dE" type="datetime-local"></label>'
      +'<label>'+(z()?'方案':'Plan')+'<select id="k115dM"><option value="auto">'+(z()?'自動（12／24 小時或取消）':'Auto')+'</option><option value="delay12">'+(z()?'全部延後 12 小時':'+12h')+'</option><option value="delay24">'+(z()?'全部延後 24 小時':'+24h')+'</option><option value="cancel">'+(z()?'全部取消改搭':'Cancel')+'</option></select></label>'
      +'<label class="w">'+(z()?'原因':'Reason')+'<input id="k115dR" placeholder="'+(z()?'FAA 全國地面停止':'FAA ground stop')+'"></label>'
      +'<button class="k27pc-b ghost" onclick="kgmDisrFormR1115A(true)">'+(z()?'預覽影響':'Preview')+'</button><button class="k27pc-b" onclick="kgmDisrFormR1115A(false)">'+(z()?'執行處置':'Apply')+'</button></div>'
    +(S.disrFormMsgR1115A?'<pre class="k115d-msg">'+E(S.disrFormMsgR1115A)+'</pre>':'')
    +(ev?'<div class="k27pc-h">'+(z()?'事件紀錄':'Events')+'</div>'+ev:'')+'</section>';
  }catch(e){return '<section class="k27pc" id="k115d">'+E(String(e&&e.message||e))+'</section>'}
};
try{var cs=document.createElement('style');cs.id='k115d-css';cs.textContent=
  '.k115d-bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:12px;font-size:12.5px;color:#33443D}.k115d-bar b{color:#B4472F}.k115d-bar b.ok{color:#0B6B47}.k115d-bar label{display:flex;gap:5px;align-items:center}.k115d-bar select{height:28px;border:1px solid #D6DED9;border-radius:8px}.k115d-last{color:#8A948F;font-size:11.5px}'
 +'.k115d-msg{white-space:pre-wrap;font:12.5px/1.6 inherit;background:#F8FAF9;border:1px solid #E4E9E6;border-radius:12px;padding:10px 12px;margin:10px 0 0;max-height:320px;overflow:auto}'
 +'.k115d-ev{border:1px solid #E4E9E6;border-radius:12px;padding:10px 12px;margin-top:8px;font-size:12.5px}.k115d-ev.pending{border-color:#F0C778;background:#FFFBF2}.k115d-evh{display:flex;justify-content:space-between;gap:8px}.k115d-evh b{color:#0F2A21}'
 +'.k115d-tag{font-size:11px;font-weight:700;padding:1px 8px;border-radius:999px;background:#EEF3F0;color:#0B3D2E;white-space:nowrap}.k115d-ev.pending .k115d-tag{background:#FFF0CF;color:#8A5A12}.k115d-ev small{display:block;color:#7A857F;margin-top:2px}.k115d-ev p{margin:6px 0 0;color:#33443D}.k115d-ev a{font-size:12px;color:#0B3D2E;font-weight:700}'
 +'.k115d-res{margin-top:6px;color:#33443D}.k115d-res table{width:100%;border-collapse:collapse;margin-top:4px}.k115d-res td{padding:3px 6px;border-top:1px solid #EEF1EF}.k115d-res em{font-style:normal;color:#B4472F;font-weight:700}.k115d-none{color:#8A948F;margin-top:4px}.k115d-act{display:flex;gap:8px;margin-top:8px}';
  (document.head||document.documentElement).appendChild(cs)}catch(_){}
})();
