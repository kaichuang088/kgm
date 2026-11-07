// 1020B：航班動態「依航線」「依航班號」—— 經停班兩段日期、沒飛的日子、聯營代碼、錯誤；桌機＋手機截圖
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
const SP='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/st20b/';require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];
 for(const [w,h,tag] of [[1400,900,'d'],[390,844,'m']]){
 const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:tag==='m'?2:1,isMobile:tag==='m',hasTouch:tag==='m'})).newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message.slice(0,200)));
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
 const go=async(o)=>{await p.evaluate(o=>{S.view='status';S.stBoardR1019A=false;Object.assign(S,o);render();window.scrollTo(0,0)},o);await p.waitForTimeout(400)};
 const txt=async()=>p.evaluate(()=>{const c=[...document.querySelectorAll('#app .fs20-c')].map(c=>c.innerText.replace(/\s+/g,' ').slice(0,260));const e=document.querySelector('#app .fs20-empty');const n=document.querySelector('#app .fs20-note');const ttl=document.querySelector('#app .fs20-ttl');
   const strip=[...document.querySelectorAll('#app .fs20-strip button')].map(x=>(x.classList.contains('on')?'*':'')+(x.classList.contains('no')?'-':'+')).join('');return {ttl:ttl&&ttl.innerText.replace(/\s+/g,' '),cards:c,empty:e&&e.innerText.replace(/\s+/g,' '),note:n&&n.innerText.replace(/\s+/g,' '),strip,sw:document.documentElement.scrollWidth}});
 if(tag==='d'){
  const cases=[['KX62','2026-10-20'],['KX62','2026-10-21'],['KX61','2026-10-21'],['KX31','2026-10-20'],['KX31','2026-10-21'],['KX78','2026-10-20'],['KX78','2026-10-21'],['KX77','2026-10-21'],['42','2026-10-20'],['KX2','2026-10-20'],['KX2','2026-12-02'],['KX100','2026-12-03'],['KX99','2026-12-03'],['KX304','2026-11-20'],['KX303','2026-11-20'],['QR8002','2026-12-02'],['JL5180','2026-10-22'],['KX9534','2026-11-20'],['KX9999','2026-10-20'],['KX52','2026-10-22']];
  for(const [n,d] of cases){await go({stByNo:true,stFlightNo:n,stBase:d,stOff:0});console.log('NO',n,d,JSON.stringify(await txt()))}
  for(const [fr,to,d] of [['TPE','LHR','2026-10-20'],['BKK','LHR','2026-10-21'],['TPE','DOH','2026-10-20'],['TPE','DOH','2026-12-02'],['TPE','NRT','2026-10-22'],['YVR','TPE','2026-10-21']]){await go({stByNo:false,stFlightNo:'',stFr:fr,stTo:to,stBase:d,stOff:0});const r=await txt();console.log('RT',fr,to,d,r.ttl,'cards',r.cards.length,r.cards.map(c=>c.slice(0,40)).join(' || '),r.empty||'',r.strip)}
 }
 const shots=[['no_kx62',{stByNo:true,stFlightNo:'KX62',stBase:'2026-10-20',stOff:0}],['no_kx2_none',{stByNo:true,stFlightNo:'KX2',stBase:'2026-10-20',stOff:0}],['no_kx78_off',{stByNo:true,stFlightNo:'KX78',stBase:'2026-10-20',stOff:0}],['no_42',{stByNo:true,stFlightNo:'42',stBase:'2026-10-20',stOff:0}],['rt_tpe_nrt',{stByNo:false,stFlightNo:'',stFr:'TPE',stTo:'NRT',stBase:'2026-10-22',stOff:0}],['no_qr',{stByNo:true,stFlightNo:'QR8002',stBase:'2026-12-02',stOff:0}],['no_empty',{stByNo:true,stFlightNo:'',stBase:'2026-10-20',stOff:0}]];
 for(const [n,o] of shots){await go(o);await p.screenshot({path:SP+tag+'_'+n+'.png',fullPage:true});if(tag==='m')console.log('m',n,'sw',await p.evaluate(()=>document.documentElement.scrollWidth))}
 await p.context().close()}
 console.log('errs',JSON.stringify(errs.slice(0,10)));await b.close()})();
