const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});
 for(const w of [390,1440]){
 const p=await (await b.newContext({viewport:{width:w,height:900}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(9000);
 await p.evaluate(()=>{const d=new Date(Date.now()+86400000*25).toISOString().slice(0,10);
   S.search={fr:'TPE',to:'NRT',dep:d,type:'OW',pax:1,cabin:'Economy'};S.view='booking';
   const fs=sortedFlights('TPE','NRT',d)||[];pickFare('out',0,(validCodes(Object.assign({},fs[0],{date:d}))||[])[0],true);
   S.paxList=[{title:'MR',lastName:'TEST',firstName:'BK',dob:'1990-01-01',nat:'TW',passport:'X1234567',email:'t@g.com',countryCode:'+886',phone:'912345678'}];
   S.phase='pay';render();window.scrollTo(0,0)});
 await p.waitForTimeout(2500);
 const sw=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,cc:!!document.querySelector('.k923cc')}));
 console.log(w,JSON.stringify(sw),JSON.stringify(errs));
 const y=await p.evaluate(()=>{const e=document.querySelector('.k923cc');return e?e.getBoundingClientRect().top+scrollY-60:0});
 await p.screenshot({path:'/tmp/j/cc_'+w+'.png',clip:{x:0,y:Math.max(0,y),width:w,height:w<500?1500:800}});
 }
 await b.close();})();
