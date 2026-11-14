const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<150&&!(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A));i++)await p.waitForTimeout(1000);await p.waitForTimeout(20000);
 console.log(JSON.stringify(await p.evaluate(()=>{const r=window.kgmLiveSplitR929();const o={n:r&&r.n,list:(r&&r.list||[]).slice(0,5)};
  const show=(tl,d0,d1)=>(S.tailAssign[tl]||[]).filter(x=>x.date>=d0&&x.date<=d1).sort((a,b)=>(a.depAbs||0)-(b.depAbs||0)).map(x=>x.date+' '+x.code+' '+x.route+' '+x.dep+'-'+x.arr);
  o.t1=show('B-58404','2027-03-25','2027-03-30');o.t2=show('B-58190','2027-03-24','2027-03-30');
  o.kx19=[];Object.keys(S.tailAssign).forEach(tl=>(S.tailAssign[tl]||[]).forEach(x=>{if(/^KX(19|20|54|53)$/.test(x.code)&&x.date>='2027-03-25'&&x.date<='2027-03-29')o.kx19.push(x.date+' '+x.code+' '+x.route+' '+tl+' '+x.dep)}));o.kx19.sort();return o}),null,1));await b.close()})();
