const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
 await p.waitForTimeout(70000);
 const r=await p.evaluate(()=>{
   const names=Object.keys(window).filter(k=>/^kgmAudit/i.test(k)&&typeof window[k]==='function');
   const out={total:names.length,threw:[],notOk:[],ok:0};
   names.forEach(n=>{
     let v;
     try{v=window[n]()}catch(e){out.threw.push(n+': '+String(e&&e.message||e).slice(0,90));return}
     const ok=(v===true)||(v&&typeof v==='object'&&(v.ok===true||(Array.isArray(v.bad)&&v.bad.length===0)));
     if(ok)out.ok++;else out.notOk.push(n+(v&&v.bad&&v.bad.length?(' :: '+String(v.bad[0]).slice(0,70)):''));
   });
   return out;
 });
 console.log('validators',r.total,'ok',r.ok,'threw',r.threw.length,'notOk',r.notOk.length);
 if(r.threw.length)console.log('THREW:',JSON.stringify(r.threw,null,1));
 console.log('NOTOK:',JSON.stringify(r.notOk,null,1));
 // view sweep
 const views=await p.evaluate(async()=>{
   const bad=[];
   const vs=['home','booking','manage','profile','miles_page','fare_products_r48','status','news','case_lookup'];
   for(const v of vs){try{S.view=v;render()}catch(e){bad.push(v+': '+e.message.slice(0,80))}}
   S.view='home';render();
   return bad;
 });
 console.log('view errors',views.length,views);
 console.log('PAGE ERRORS',errs.length);
 if(errs.length)console.log(JSON.stringify([...new Set(errs)].slice(0,10),null,1));
 await b.close();})();
