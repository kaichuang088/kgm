const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const hits=[];
 await ctx.route(/workers\.dev/,async r=>{const q=r.request();let body=q.postData()||'';let j=null;try{j=JSON.parse(body)}catch(_){}
   hits.push({url:q.url().replace(/^https:\/\/[^/]+/,''),to:j&&(j.to||j.email),subj:j&&(j.subject||j.title),len:body.length,snip:body.slice(0,160)});r.fulfill({status:200,body:'{"ok":true}'})});
 const p=await ctx.newPage();await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(+process.env.W||40000);
 const info=await p.evaluate(()=>({users:(S.users||[]).length,bk:(S.bookings||[]).length}));
 console.log(JSON.stringify(info));hits.forEach(h=>console.log(JSON.stringify(h)));console.log('TOTAL',hits.length);await b.close()})();
