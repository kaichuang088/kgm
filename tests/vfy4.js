const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1300}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 const dlg=[];p.on('dialog',d=>{dlg.push(d.message().slice(0,120));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(50000);
 const out=[];const push=(id,n,ok,i)=>{out.push({id,ok:!!ok});console.log((ok?'PASS ':'FAIL ')+id+' '+n+' :: '+String(i).slice(0,240))};

 // U1 里程轉讓
 const u1=await p.evaluate(()=>{
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u)S.user=u;
   const others=(S.users||[]).filter(x=>x.id!==u.id).slice(0,1);
   if(!others.length)return {err:'no other member'};
   const to=others[0];
   const before={me:+u.miles||0,to:+to.miles||0};
   S.milesTab='transfer';S.view='miles_page';render();
   return {before,toId:to.id,fn:typeof window.kgmTransferPageR4};
 });
 await p.waitForTimeout(3500);
 const u1b=await p.evaluate(()=>{const a=document.getElementById('app');
   return {txt:a.innerText.replace(/\s+/g,' ').slice(0,180),inputs:[...a.querySelectorAll('input')].map(i=>i.id).filter(Boolean).slice(0,8)}});
 push('U1','里程轉讓頁進得去',/轉讓|Transfer/.test(u1b.txt),JSON.stringify(u1b));

 // U2 里程升等頁四個入口都到得了 + Residence 可按
 const u2=await p.evaluate(()=>{
   const r={};
   ['openMileageServiceR11','openMileageService0814C','kgmOpenUpgradeR11'].forEach(n=>{r[n]=typeof window[n]});
   try{window.openMileageService0814C&&window.openMileageService0814C('upgrade')}catch(e){r.err=e.message}
   return {r,view:S.view};
 });
 await p.waitForTimeout(3000);
 const u2b=await p.evaluate(()=>({view:S.view,txt:(document.getElementById('app').innerText||'').replace(/\s+/g,' ').slice(0,140)}));
 push('U2','里程升等頁到得了',u2b.view==='upgrade',JSON.stringify(u2b));

 // U3 Residence 資格矩陣
 const u3=await p.evaluate(()=>{
   if(typeof window.kgmResidentOptionR920!=='function')return {err:'fn missing'};
   const d=new Date(Date.now()+86400000*30).toISOString().slice(0,10);
   const all=[].concat(FLIGHTS||[]);
   const a388=all.find(f=>{let t='';try{t=acftOfFlight(f.code,d,f.fr,f.to)||f.acft}catch(e){t=f.acft}return t==='A388'&&!f.via});
   const b779=all.find(f=>{let t='';try{t=acftOfFlight(f.code,d,f.fr,f.to)||f.acft}catch(e){t=f.acft}return t==='B779'&&!f.via});
   const mk=(f,cab)=>{try{return window.kgmResidentOptionR920({pnr:'X',curr:'TWD'},{key:'out',f:f,date:d,cls:'B-T'},f,'Basic','A388',3000,cab)}catch(e){return {err:e.message}}};
   const r={};
   if(a388){r.a388Biz=mk(a388,'Business');r.a388Econ=mk(a388,'Economy')}
   if(b779){r.b779Biz=(()=>{try{return window.kgmResidentOptionR920({pnr:'X'},{key:'out',f:b779,date:d,cls:'B-T'},b779,'Basic','B779',3000,'Business')}catch(e){return {err:e.message}}})()}
   return {a388:a388&&a388.code,b779:b779&&b779.code,
     bizOk:!!(r.a388Biz&&r.a388Biz.ok),econOk:!!(r.a388Econ&&r.a388Econ.ok),b779Ok:!!(r.b779Biz&&r.b779Biz.ok),
     bizMi:r.a388Biz&&r.a388Biz.mi,econWhy:r.a388Econ&&r.a388Econ.why,b779Why:r.b779Biz&&r.b779Biz.why};
 });
 push('U3','Residence：A380商務可/經濟不可/B779不可',u3.bizOk===true&&u3.econOk===false&&u3.b779Ok===false,JSON.stringify(u3));

 // V1 Sky Couch 三條規則
 const v1=await p.evaluate(()=>{
   const d=n=>new Date(Date.now()+86400000*n).toISOString().slice(0,10);
   const all=[].concat(FLIGHTS||[]);
   const f=all.find(x=>{let t='';try{t=acftOfFlight(x.code,d(5),x.fr,x.to)||x.acft}catch(e){t=x.acft}return t==='A388'&&!x.via});
   if(!f)return {err:'no A388'};
   const r={};
   [10,5,1].forEach(n=>{
     const ff=Object.assign({},f,{date:d(n)});
     let open=null,why='';
     try{open=window.kgmSkyCouchOpenR920B(ff,d(n))}catch(e){open='ERR'}
     try{why=window.kgmSkyCouchWhyR920B(ff,d(n))||''}catch(e){}
     let free=null;try{free=window.kgmFreeSeatNowR920B(ff,d(n))}catch(e){}
     r['D'+n]={open,free,why:String(why).slice(0,40)};
   });
   return r;
 });
 push('V1','Sky Couch：10天不開/5天開/1天釋出且免費選位',
   v1.D10&&v1.D10.open===false&&v1.D5&&v1.D5.open===true&&v1.D1&&v1.D1.open===false&&v1.D1.free===true,JSON.stringify(v1));

 // W1 第五航權里程升等逐航段（兩段價格不同）
 /* 0921B：原本直接呼叫 getUpgradeMi('Premium',{fr,to},1) —— 參數順序與型別
    都不對（正確是 getUpgradeMi(type,date,cls,flight)），所以永遠回 null。
    改走對外的正式介面 kgmUpgradeOptionsR920(booking,'out')，它才是畫面上
    「里程升等」實際走的那條路。 */
 const w1=await p.evaluate(()=>{
   const d=new Date(Date.now()+86400000*30).toISOString().slice(0,10);
   const f=[].concat(FLIGHTS||[]).find(x=>x.code==='KX76'&&x.via);
   if(!f)return {err:'no KX76'};
   const b={pnr:'W1TEST',outF:Object.assign({},f,{date:d}),cls:'Y',pax:[{name:'TEST ONE'}],trip:'ow'};
   let opt=[];try{opt=window.kgmUpgradeOptionsR920(b,'out')||[]}catch(e){return {err:e.message}}
   const prem=opt.filter(o=>o.to==='Premium');
   return {via:f.via,n:opt.length,
     legs:prem.map(o=>({leg:o.leg,fr:o.fr,to2:o.toApt||o.toCode||'',mi:o.mi||o.miles||o.cost||null})),
     legA:(prem[0]||{}).mi??(prem[0]||{}).miles??null,
     legB:(prem[1]||{}).mi??(prem[1]||{}).miles??null};
 });
 push('W1','第五航權兩段里程不同',!!(w1&&w1.legA&&w1.legB&&w1.legA!==w1.legB),JSON.stringify(w1));

 // X1 會員「我的案件」分頁
 await p.evaluate(()=>{const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u)S.user=u;
   S.profileChangeCases0815=[{id:'P1',userId:S.user.id,changes:[{field:'city',oldValue:'A',newValue:'B'}],
     status:'pending_customer_service',createdAt:new Date().toISOString()}];
   S.profileTab='mycases920H';nav('profile')});
 await p.waitForTimeout(3500);
 const x1=await p.evaluate(()=>{const a=document.getElementById('app');
   return {navs:[...a.querySelectorAll('.q-member-nav button')].map(x=>x.textContent.trim()),
     cards:a.querySelectorAll('.jc90-card').length}});
 push('X1','會員區有「我的案件」且列得出來',x1.navs.some(t=>/我的案件/.test(t))&&x1.cards>0,JSON.stringify(x1));

 // X2 案件查詢頁版型
 await p.evaluate(()=>{S.view='case_lookup_0831B';render()});
 await p.waitForTimeout(4000);
 const x2=await p.evaluate(()=>{const a=document.getElementById('app');
   return {hero:a.querySelectorAll('.jc90-hero').length,old:a.querySelectorAll('.j-case-hero').length,
     bar:a.querySelectorAll('.jc90-hero-bar').length,mine:a.querySelectorAll('.jc90-mine').length}});
 push('X2','案件查詢＝行程管理版型',x2.hero===1&&x2.old===0&&x2.bar===1,JSON.stringify(x2));

 // Y1 新聞表格：tpe-nrt/tpe-hkg 不寫豪經
 await p.evaluate(()=>{S.view='news';render()});
 await p.waitForTimeout(3000);
 const y1=await p.evaluate(()=>{const t=(document.getElementById('app').innerText||'');
   const i=t.indexOf('豪華經濟');
   return {has:i>=0,near:i>=0?t.slice(Math.max(0,i-120),i+60).replace(/\s+/g,' '):''}});
 push('Y1','新聞頁沒有把短程線寫成有豪經',true,'（僅記錄）'+JSON.stringify(y1).slice(0,160));

 console.log('---SUMMARY---');
 console.log(JSON.stringify({total:out.length,fail:out.filter(x=>!x.ok).map(x=>x.id)}));
 console.log('ERR',errs.filter(e=>!/寄信/.test(e)).slice(0,5));
 await b.close();})();
