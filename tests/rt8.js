// 1008B：模擬「真實使用者」：持久化瀏覽器設定檔（localStorage 保留），前台＋後台兩個檔同時開。
// 用法：PROFILE=dir node rt8.js "<前台>|<後台>|<等待毫秒>" ["<前台>|<後台>|<等待>" ...]   最後一組量測
const {chromium}=require('playwright');
(async()=>{
 const dir=process.env.PROFILE||'/tmp/j/prof_rt8';
 const steps=process.argv.slice(2).map(s=>s.split('|'));
 for(let si=0;si<steps.length;si++){
  const [front,admin,wait]=steps[si];
  const ctx=await chromium.launchPersistentContext(dir,{headless:true,viewport:{width:1500,height:1000}});
  const errs=[];
  const pages=[];
  for(const f of [front,admin]){ if(!f||f==='-')continue;
    const p=await ctx.newPage();p.on('pageerror',e=>errs.push(f.split('/').pop()+': '+String(e.message).slice(0,120)));
    await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});pages.push([f,p]);}
  for(const [f,p] of pages)await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
  // 後台登入（跟使用者一樣進後台看）
  for(const [f,p] of pages)if(/a\d*\.html$|後台/.test(f))await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='fleetsched';render()});
  await pages[0][1].waitForTimeout(+wait||150000);
  const out=[];
  for(const [f,p] of pages){
    out.push([f.split('/').pop(),await p.evaluate(()=>{var r={};try{var c=window.kgmLiveCoverR135();r.missing=c.missing;r.expected=c.expected;r.window=c.window;var ds=Object.keys(c.byDate927D||{}).sort();r.days=ds.length;r.first=ds.slice(0,5);r.byDate=ds.slice(0,8).map(d=>d+':'+c.byDate927D[d])}catch(e){r.err=String(e.message)}
      try{r.split=window.kgmLiveSplitR929().n}catch(_){}
      r.final=window.KGM_ROT_FINAL_MS_R913||0;r.kept=window.KGM_KEPT72_1006A;r.side=window.KGM_SIDE;r.build=document.title;
      try{r.lsTail=(localStorage.getItem('kgm_tailasg')||'').length;r.schema=localStorage.getItem('kgm_schema')}catch(_){}
      try{r.tails=Object.keys(S.tailAssign||{}).length;r.legs=Object.values(S.tailAssign||{}).reduce((a,l)=>a+(l||[]).length,0)}catch(_){}
      return r})]);
  }
  console.log('STEP',si,JSON.stringify(out),'ERR',JSON.stringify(errs.slice(0,4)));
  await ctx.close();
 }
})();
