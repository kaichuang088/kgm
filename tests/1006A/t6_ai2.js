// 1006A #14：後台 AI 處理中（Worker 延遲 8 秒）切換其他分頁＋本機規則引擎常用指令耗時
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 await p.addInitScript(()=>{window.__lt=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push({t:Math.round(e.startTime),d:Math.round(e.duration)}))).observe({type:'longtask',buffered:true})}catch(e){}
   var of=window.fetch;window.fetch=function(u,o){if(/\/ai\/admin/.test(String(u))){try{window.__body=JSON.parse(o.body)}catch(_){}return new Promise(function(res){setTimeout(function(){res(new Response(JSON.stringify({reply:'（模擬 Worker 回覆）收到。',actions:[]}),{status:200,headers:{'Content-Type':'application/json'}}))},8000)})}return of.apply(this,arguments)}});
 await p.goto('file:///tmp/j/w49_admin.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>window.KGM_ROT_FINAL_MS_R913>0,null,{timeout:400000,polling:500});await p.waitForTimeout(12000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();S.adminAiOpenR929=true;kgmAdminAiDrawR929()});
 await p.waitForTimeout(1500);
 const t0=await p.evaluate(()=>{window.__lt=[];var t=performance.now();window.__aiP=window.kgmAdminAiAskR929('今天營運概況如何');return Math.round(performance.now()-t)});
 const sw=[];
 for(const tab of ['fleetsched','salary','auctions','stxstatus','approve']){await p.waitForTimeout(600);
   const r=await p.evaluate(async(t)=>{var a=performance.now();S.adminTab=t;render();var s=performance.now()-a;await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
     var host=document.getElementById('kgmAdminAi929'),c=(host&&host.innerText)||'';return {tab:t,sync:Math.round(s),paint:Math.round(performance.now()-a),panel:!!(host&&host.offsetParent!==null||host&&host.style.display!=='none'),thinking:/思考中/.test(c)}},tab);sw.push(r)}
 await p.waitForTimeout(9000);
 const ctx=await p.evaluate(()=>({len:(window.__body&&window.__body.context||'').length,ctx:(window.__body&&window.__body.context||'').slice(0,900),tools:(window.__body&&window.__body.tools||[]).length}));console.log('CTX',JSON.stringify(ctx));
 const fin=await p.evaluate(()=>{var host=document.getElementById('kgmAdminAi929');return {busy:!!S.adminAiBusyR929,tab:S.adminTab,last:(host&&host.querySelector('.k929ai-msgs')||{}).innerText.slice(-200),lt:window.__lt.filter(x=>x.d>=300)}});
 // 本機規則引擎（Worker 不通）常用指令
 await p.evaluate(()=>{S.adminAiRemoteOffR929=true});
 const cmds=['關閉01-21 ~ 02-10 (2027) 所有航線經濟艙「基本」票價','重新開放01-21 ~ 02-10 (2027) 所有航線經濟艙「基本」票價','TPE-NRT 11/1~11/10 經濟艙漲 15%','K60012 10/12 想換到東京的班','help'];
 const cr=[];for(const q of cmds){const r=await p.evaluate(async(q)=>{window.__lt=[];var a=performance.now();await window.kgmAdminAiAskR929(q);var d=performance.now()-a;var c=(document.querySelector('#kgmAdminAi929 .k929ai-msgs')||{}).innerText||'';return {q:q.slice(0,24),ms:Math.round(d),ltMax:Math.max(0,...window.__lt.map(x=>x.d)),reply:c.slice(-180).replace(/\n/g,' / ')}},q);cr.push(r);await p.waitForTimeout(1500)}
 console.log(JSON.stringify({askSync:t0,switch:sw,final:fin,local:cr,errs:errs.slice(0,4)},null,1));
 await p.screenshot({path:'/tmp/j/ai6.png'});await b.close();})();
