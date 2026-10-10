// 1008B：後台 AI 直連測試 —— ①真的打 api.anthropic.com（假金鑰，驗證瀏覽器 file:// 的 CORS 路徑）②模擬回應（驗證解析與執行）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({ignoreHTTPSErrors:true,viewport:{width:1500,height:1000}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));
 await p.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(60000);
 const r1=await p.evaluate(async()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();
   S.adminAiOpenR929=true;S.adminAiCfgR1008B=true;kgmAdminAiDrawR929();document.getElementById('k9aiKey').value='sk-ant-api03-invalid-test-key';await kgmAdminAiKeyTestR1008B();return S.adminAiCfgMsgR1008B});
 console.log('REAL',r1);
 // ② 模擬：Messages API 回應（思考區塊＋文字＋工具呼叫）
 const r2=await p.evaluate(async()=>{
   try{localStorage.setItem('kgm_ai_key_r1008b','sk-ant-mock')}catch(_){}
   var sent=null,of=window.fetch;
   window.fetch=async function(u,o){if(String(u).indexOf('api.anthropic.com')>=0){sent={url:u,headers:o.headers,body:JSON.parse(o.body)};
       return new Response(JSON.stringify({id:'msg_mock',type:'message',role:'assistant',model:'claude-opus-5-5',stop_reason:'tool_use',
         content:[{type:'thinking',thinking:'',signature:'x'},{type:'text',text:'好的，幫你打開票價分析。'},{type:'tool_use',id:'tu_1',name:'go_tab',input:{tab:'票價分析'}}],usage:{input_tokens:10,output_tokens:5}}),{status:200,headers:{'content-type':'application/json'}})}
     return of.apply(this,arguments)};
   await kgmAdminAiAskR929('打開票價分析');
   window.fetch=of;
   var c=S.adminAiChatR929||[];var last=null;try{var k=Object.keys(S).filter(function(x){return /adminAi.*Chat|aiChat/i.test(x)});}catch(_){}
   var th=document.querySelectorAll('.k929ai-m.a');var lt=th.length?th[th.length-1].innerText:'';
   return {tab:S.adminTab,lastBubble:lt.slice(0,200),hdr:sent&&sent.headers,model:sent&&sent.body.model,maxTok:sent&&sent.body.max_tokens,effort:sent&&sent.body.output_config,fallbacks:sent&&sent.body.fallbacks,nTools:sent&&sent.body.tools.length,
     hasTripTool:sent&&sent.body.tools.some(function(t){return t.name==='crew_trip_change'&&t.input_schema&&t.input_schema.properties&&t.input_schema.properties.empId}),sysHead:sent&&sent.body.system.slice(0,60),msgs:sent&&sent.body.messages.length};
 });
 console.log('MOCK',JSON.stringify(r2,null,1));
 // ③ 模擬失敗（401）→ 退回站內引擎，原因寫清楚
 const r3=await p.evaluate(async()=>{var of=window.fetch;
   window.fetch=async function(u,o){if(String(u).indexOf('api.anthropic.com')>=0)return new Response(JSON.stringify({type:'error',error:{type:'authentication_error',message:'invalid x-api-key'}}),{status:401,headers:{'content-type':'application/json'}});return of.apply(this,arguments)};
   await kgmAdminAiAskR929('help');window.fetch=of;try{localStorage.removeItem('kgm_ai_key_r1008b')}catch(_){}
   var th=document.querySelectorAll('.k929ai-m.a small');return th.length?th[th.length-1].innerText:''});
 console.log('FAIL-NOTE',r3);
 await p.evaluate(()=>{var el=document.getElementById('k929aiMsgs');if(el)el.scrollTop=0});
 await p.screenshot({path:'/tmp/j/g9_ai.png'});
 console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
