// 1115A D1／D8：後台 AI ——①沒接 Claude 的站內解析（加一班去回程）②工具迴圈（模擬 Messages API 多輪）③Worker /ai/messages 與舊 Worker 退回 ④突發事件站內預覽→確認 ⑤自動監測（模擬 web_search＋report_disruptions）
// 用法：node ai42.js [/tmp/j/kgm.html]
const {chromium}=require('playwright');
const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:1000}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,200)));
 await ctx.route(/workers\.dev/,r=>r.abort());
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});
 await p.waitForTimeout(5000);
 const login=()=>p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();S.adminAiOpenR929=true;kgmAdminAiDrawR929()});
 await login();
 const last=()=>p.evaluate(()=>{var c=S.adminAiR929&&S.adminAiR929.MASTER||[];var m=c[c.length-1]||{};return {text:m.text||'',note:m.note||'',src:m.src||''}});
 // ① 站內：使用者原句
 const t1=await p.evaluate(async()=>{try{localStorage.removeItem('kgm_ai_key_r1008b')}catch(_){}var n0=(S.customFlights||[]).length;await kgmAdminAiAskR929('11/18可以加一班TPE-CDG直飛/11/19可以加一班CDG-TPE直飛嗎');return n0});
 const r1=await last();console.log('① 回覆：\n'+r1.text+'\n  note='+r1.note);
 await p.evaluate(async()=>{await kgmAdminAiAskR929('1')});
 const r1b=await last();console.log('① 選 1：'+r1b.text);
 const cf=await p.evaluate(n0=>(S.customFlights||[]).slice(n0).map(f=>f.code+' '+f.fr+'→'+f.to+' '+f.effFrom+' '+f.dep+'–'+f.arr+(f.dd?'+'+f.dd:'')+' '+f.acft),t1);
 console.log('① 新建：',JSON.stringify(cf));
 // ①b 單句不同方向（不是來回）→ 先排第一段並提示第二段
 await p.evaluate(async()=>{await kgmAdminAiAskR929('11/20 加一班 TPE-NRT / 11/21 加一班 TPE-ICN')});
 console.log('①b',(await last()).text.split('\n').slice(0,3).join(' | '));
 await p.evaluate(async()=>{await kgmAdminAiAskR929('算了')});
 // ② 工具迴圈（模擬 Claude 三輪）
 const r2=await p.evaluate(async()=>{
   try{localStorage.setItem('kgm_ai_key_r1008b','sk-ant-mock')}catch(_){}
   var sent=[],of=window.fetch,turn=0;
   window.fetch=async function(u,o){if(String(u).indexOf('api.anthropic.com')<0)return of.apply(this,arguments);var body=JSON.parse(o.body);sent.push(body);turn++;
     var R=turn===1?{stop_reason:'tool_use',content:[{type:'thinking',thinking:'',signature:'s1'},{type:'text',text:'我先查一下 11/18 的 KX12。'},{type:'tool_use',id:'tu_1',name:'data_query',input:{q:'KX12 11/18'}}]}
       :turn===2?{stop_reason:'tool_use',content:[{type:'thinking',thinking:'',signature:'s2'},{type:'tool_use',id:'tu_2',name:'disruption_apply',input:{countries:['US'],scope:'dep',start_utc:'2026-11-18T14:00:00Z',end_utc:'2026-11-18T23:00:00Z',reason:'FAA ground stop（測試）',preview:true}}]}
       :{stop_reason:'end_turn',content:[{type:'thinking',thinking:'',signature:'s3'},{type:'text',text:'查好了：KX12 照常；如果 FAA 停飛，美國出發會影響上面這些班（只預覽，沒有執行）。'}]};
     return new Response(JSON.stringify(Object.assign({id:'msg_'+turn,type:'message',role:'assistant',model:'claude-opus-5-5',usage:{input_tokens:1,output_tokens:1}},R)),{status:200,headers:{'content-type':'application/json'}})};
   await kgmAdminAiAskR929('KX12 11/18 狀況？另外如果 FAA 11/18 14-23Z 停飛美國出發會影響哪些班');window.fetch=of;
   var s2=sent[1]||{},s3=sent[2]||{},lm2=(s2.messages||[]).slice(-2),lm3=(s3.messages||[]).slice(-1)[0]||{};
   return {calls:sent.length,tools:(sent[0].tools||[]).map(t=>t.name||t.type).filter(n=>/disruption|web_search|flight_temp|data_query/.test(n)),
     turn2EchoAssistant:lm2[0]&&lm2[0].role==='assistant'&&lm2[0].content[0].type==='thinking',turn2Result:lm2[1]&&lm2[1].content[0].type+' '+lm2[1].content[0].tool_use_id+' '+String(lm2[1].content[0].content).slice(0,80),
     turn3Result:lm3.content&&String(lm3.content[0].content).slice(0,120),sysHas:/1115A 工作方式/.test(s2.system||'')}});
 console.log('② 迴圈：',JSON.stringify(r2,null,1));
 const r2b=await last();console.log('② 回覆：',r2b.text.slice(0,300).replace(/\n/g,' | '),' note=',r2b.note);
 const ov0=await p.evaluate(()=>Object.keys(S.flightOverrides||{}).filter(k=>(S.flightOverrides[k]||{}).disrR1115A).length);console.log('② 預覽後被動到的班（應 0）：',ov0);
 // ③ Worker：沒金鑰 → /ai/messages（模擬）；再模擬 404 → 退回 /ai/admin
 await p.unroute(/workers\.dev/).catch(()=>{});
 let wk=0;await ctx.route(/workers\.dev\/ai\/messages/,async r=>{wk++;await r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({id:'m',type:'message',role:'assistant',model:'claude-opus-5-5',stop_reason:'end_turn',content:[{type:'text',text:'Worker 轉送：收到。'}]})})});
 await ctx.route(/workers\.dev\/ai\/admin/,r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({reply:'舊 /ai/admin 回覆',actions:[],model:'claude-opus-5-5'})}));
 await p.evaluate(async()=>{try{localStorage.removeItem('kgm_ai_key_r1008b')}catch(_){}await kgmAdminAiAskR929('你好')});
 const r3=await last();console.log('③ Worker /ai/messages：',r3.text,'| note=',r3.note,'| hits',wk);
 await ctx.unroute(/workers\.dev\/ai\/messages/);await ctx.route(/workers\.dev\/ai\/messages/,r=>r.fulfill({status:404,headers:{'access-control-allow-origin':'*'},body:'not found'}));
 await p.evaluate(async()=>{KGM_AI_LOOP_R1115A.okWorker=0;KGM_AI_LOOP_R1115A.noWorker=0;await kgmAdminAiAskR929('你好嗎')});
 const r3b=await last();console.log('③ 舊 Worker 404 → ',r3b.text,'| note=',r3b.note);
 await ctx.route(/workers\.dev/,r=>r.abort());
 await p.evaluate(()=>{KGM_AI_LOOP_R1115A.okWorker=0;KGM_AI_LOOP_R1115A.noWorker=1});
 // ④ 突發事件：站內解析 → 預覽 → 確認
 await p.evaluate(async()=>{await kgmAdminAiAskR929('11/18 14:00-23:00 UTC FAA 禁止所有美國航班起飛')});
 const r4=await last();console.log('④ 預覽：\n'+r4.text);
 await p.evaluate(async()=>{await kgmAdminAiAskR929('確認')});
 const r4b=await last();console.log('④ 確認：\n'+r4b.text.slice(0,900));
 const chk=await p.evaluate(()=>{var o=S.flightOverrides||{},out=[];Object.keys(o).forEach(k=>{var x=o[k];if(x&&x.disrR1115A)out.push(k+' '+x.status+' '+(x.dep||'')+(x.depDD?'+'+x.depDD:'')+' '+(x.reason||'').slice(0,20))});
   var D=S.disrR1115A||{};return {n:out.length,list:out.slice(0,30),events:(D.events||[]).length,saved:((LS.get('kgm40_disr',{})||{}).events||[]).length}});
 console.log('④ 寫入：',JSON.stringify(chk,null,1));
 // ④b 驗算：被列入的每一班，起飛（UTC）真的在 11/18 14:00–23:00Z 而且從美國出發
 const v4=await p.evaluate(()=>{var D=S.disrR1115A.events[0],bad=[];(D.results||[]).forEach(r=>{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(x=>x.code===r.code&&x.fr===r.fr)[0];var x=kgmSeasonFlightR48(f,r.date);var dep=Date.parse(r.date+'T'+x.dep+':00Z')/60000-kgmTzAtR1026C(r.fr,r.date)*60;
   var s=Date.parse('2026-11-18T14:00:00Z')/60000,e=Date.parse('2026-11-18T23:00:00Z')/60000;if(!(dep>=s&&dep<e)||kgmApCountryR1115A(r.fr)!=='US')bad.push(r.code+' '+r.fr+' '+r.date+' '+x.dep)});
   /* 反向：美國出發、起飛在時段內、沒被列入的 */
   var miss=[];[].concat(FLIGHTS,S.customFlights||[]).forEach(f=>{if(!f||f.partner||f.codeshare||f.via||!/^KX\d+$/.test(f.code)||kgmApCountryR1115A(f.fr)!=='US')return;['2026-11-17','2026-11-18','2026-11-19'].forEach(d=>{if(!flyOn(f,new Date(d+'T12:00:00')))return;var x=kgmSeasonFlightR48(f,d);var dep=Date.parse(d+'T'+x.dep+':00Z')/60000-kgmTzAtR1026C(f.fr,d)*60;var s=Date.parse('2026-11-18T14:00:00Z')/60000,e=Date.parse('2026-11-18T23:00:00Z')/60000;
     if(dep>=s&&dep<e&&!(D.results||[]).some(r=>r.code===f.code&&r.date===d&&r.fr===f.fr))miss.push(f.code+' '+f.fr+' '+d+' '+x.dep)})});
   return {n:(D.results||[]).length,bad:bad,miss:miss}});
 console.log('④ 驗算：',JSON.stringify(v4));
 // ④c 再送一次同一事件 → 不重複處置
 await p.evaluate(async()=>{await kgmAdminAiAskR929('11/18 14:00-23:00 UTC FAA 禁止所有美國航班起飛 直接執行')});
 console.log('④c 重複：',(await last()).text.slice(0,120));
 // ⑤ 自動監測（模擬 Claude：web_search 伺服器工具 → report_disruptions）
 const r5=await p.evaluate(async()=>{try{localStorage.setItem('kgm_ai_key_r1008b','sk-ant-mock')}catch(_){}
   var sent=[],of=window.fetch,turn=0;
   window.fetch=async function(u,o){if(String(u).indexOf('api.anthropic.com')<0)return of.apply(this,arguments);var body=JSON.parse(o.body);sent.push(body);turn++;
     var R=turn===1?{stop_reason:'pause_turn',content:[{type:'server_tool_use',id:'srv_1',name:'web_search',input:{query:'FAA ground stop'}},{type:'web_search_tool_result',tool_use_id:'srv_1',content:[]}]}
      :turn===2?{stop_reason:'tool_use',content:[{type:'text',text:'整理如下。'},{type:'tool_use',id:'tu_9',name:'report_disruptions',input:{events:[
          {title:'（測試）日本成田機場跑道關閉',authority:'JCAB',source_url:'https://example.invalid/notam',airports:['NRT'],countries:[],scope:'both',start_utc:'2026-11-20T01:00:00Z',end_utc:'2026-11-20T09:00:00Z',confidence:'high',summary:'測試事件'},
          {title:'（測試）法國航管罷工',authority:'DGAC',source_url:'https://example.invalid/dgac',airports:[],countries:['FR'],scope:'both',start_utc:'2026-11-21T04:00:00Z',end_utc:null,confidence:'medium',summary:'結束時間未公布'}]}}]}
      :{stop_reason:'end_turn',content:[{type:'text',text:'已回報。'}]};
     return new Response(JSON.stringify(Object.assign({id:'m'+turn,type:'message',role:'assistant',model:'claude-opus-5-5',usage:{}},R)),{status:200,headers:{'content-type':'application/json'}})};
   await kgmDisrScanR1115A(true);window.fetch=of;try{localStorage.removeItem('kgm_ai_key_r1008b')}catch(_){}
   var D=S.disrR1115A;return {calls:sent.length,pauseResent:sent[1]&&sent[1].messages.length===2&&sent[1].messages[1].content[0].type==='server_tool_use',hasSearchTool:sent[0].tools.some(t=>t.type==='web_search_20260209'),strict:sent[0].tools.some(t=>t.name==='report_disruptions'&&t.strict===true),
     msg:D.scanMsg,ev:(D.events||[]).slice(0,3).map(e=>e.status+' '+(e.title||'')+' '+((e.results||[]).length)+' '+(e.why||''))}});
 console.log('⑤ 監測：',JSON.stringify(r5,null,1));
 // ⑥ 介面：航班營運「關閉空域・Payload」頁
 await p.evaluate(()=>{S.view='admin';S.adminTab='airspace27';render();window.scrollTo(0,0)});await p.waitForTimeout(1500);
 const ui=await p.evaluate(()=>{var el=document.getElementById('k115d');return el?{h:el.getBoundingClientRect().height|0,ev:el.querySelectorAll('.k115d-ev').length,txt:el.innerText.slice(0,200)}:null});
 console.log('⑥ 介面：',JSON.stringify(ui));
 const el=await p.$('#k115d');if(el)await el.screenshot({path:'/tmp/j/ai42_panel.png'});
 await p.evaluate(()=>{S.adminAiOpenR929=true;kgmAdminAiDrawR929()});await p.waitForTimeout(500);await p.screenshot({path:'/tmp/j/ai42_chat.png'});
 // ⑦ 重新整理後紀錄還在、航班動態還是延誤
 await p.waitForTimeout(3000);await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});await p.waitForTimeout(8000);
 console.log('⑦ 重新整理後：',JSON.stringify(await p.evaluate(()=>({events:((S.disrR1115A||{}).events||[]).length,ov:Object.keys(S.flightOverrides||{}).filter(k=>(S.flightOverrides[k]||{}).disrR1115A).length,cf:(S.customFlights||[]).filter(f=>f.aiTempR1025B).map(f=>f.code+' '+f.fr+'→'+f.to+' '+f.effFrom)}))));
 console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})();
