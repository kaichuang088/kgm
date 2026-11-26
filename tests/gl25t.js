// 1025B K：地勤請假 → 當天改休、工作由同仁接手（整天＋指定時段），後台面板截圖
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<200;i++){if(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A))break;await p.waitForTimeout(1000)}
 await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{
   const d=addDays(todayISO(),1);const t0=performance.now();window.kgmGroundPlanClearR1008A();const P=kgmGroundPlanR1008A('TPE',d);const ms=performance.now()-t0;
   const ids=Object.keys(P.people).filter(id=>{const q=P.people[id];return !q.off&&!q.reserve&&q.tasks.length>=3}).sort();
   const id=ids[7],id2=ids[23],q=P.people[id],q2=P.people[id2];
   const before={id,name:q.p.name,duty:kgmGroundShiftLabelR90(id,d),tasks:q.tasks.map(t=>t.key+' '+t.a+'-'+t.b),short:P.short.length,working:P.working,reserve:P.reserve};
   const n0=(S.staffNotifs||[]).length;
   // 整天請假
   S.leave=S.leave||[];S.leave.unshift({caseNo:'LVG25A',empId:id,empName:q.p.name,type:'personal',days:1,start:d,end:d,reason:'test',status:'pending',filed:todayISO()});
   doLeaveDecide(0,true);
   const P2=kgmGroundPlanR1008A('TPE',d),q1=P2.people[id];
   const cov=kgmGroundCoverR1025B('TPE',d,id);
   const notes=(S.staffNotifs||[]).slice(0,(S.staffNotifs||[]).length-n0).map(x=>(x.empId||'')+' '+String(x.msg||x.message||'').slice(0,160));
   const after={off:q1.off,lv:!!q1.leaveR1025B,duty:kgmGroundShiftLabelR90(id,d),short:P2.short.length,working:P2.working,reserve:P2.reserve,
     cover:cov&&{was:cov.was,from:cov.from,to:cov.to,tasks:cov.tasks.map(t=>t.a+'-'+t.b+' '+t.label+' → '+(t.by.map(x=>x.empId).join(',')||'('+t.staffed+'/'+t.min+')')+(t.short?' SHORT':''))},
     leaveRec:S.leave[0].groundCoverR1025B,future:kgmGroundShiftLabelR90(id,addDays(todayISO(),5))};
   // 未來 5 天整天請假：預排顯示請假
   let fd=null;for(let k=3;k<12;k++){const x=addDays(todayISO(),k);if(!kgmGroundDutyR99(id,x).off){fd=x;break}}const fb=kgmGroundShiftLabelR90(id,fd);
   S.leave.unshift({caseNo:'LVG25B',empId:id,empName:q.p.name,type:'annual',days:1,start:fd,end:fd,reason:'test',status:'pending',filed:todayISO()});
   doLeaveDecide(0,true);const fut=fd+' '+fb+' → '+kgmGroundShiftLabelR90(id,fd)+' | msg '+S.leave[0].groundCoverR1025B.laterDays;
   // 指定時段：第二位，取他第一項工作開始後 2 小時
   const hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
   const ta=Math.min(...q2.tasks.map(t=>t.a));const pa=Math.ceil((ta+60)/5)*5,pb=pa+120;
   const b2={id:id2,duty:kgmGroundShiftLabelR90(id2,d),tasks:q2.tasks.map(t=>t.a+'-'+t.b)};
   S.leave.unshift({caseNo:'LVG25C',empId:id2,empName:q2.p.name,type:'personal',days:0,start:d,end:d,part:{from:hm(pa),to:hm(pb),hours:2},reason:'test',status:'pending',filed:todayISO()});
   doLeaveDecide(0,true);
   const P3=kgmGroundPlanR1008A('TPE',d),q3=P3.people[id2];
   const ov=q3.tasks.filter(t=>t.a<pb&&t.b>pa).length;
   const part={win:hm(pa)+'-'+hm(pb),duty:kgmGroundShiftLabelR90(id2,d),tasks:q3.tasks.map(t=>t.a+'-'+t.b),overlap:ov,fill:(q3.fillR1022A||[]).map(f=>f.k+' '+hm(f.a)+'-'+hm(f.b)),meal:q3.meal,short:P3.short.length,from:q3.from,to:q3.to};
   return {ms,d,before,after,fut,b2,part,notes:notes.slice(0,6),nNotes:notes.length};
 });
 console.log(JSON.stringify(r,null,1));
 // 後台面板
 await p.evaluate(([id,d])=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='groundroster12';S._cr74Ap='TPE';S._cr74Date=d;S._cr74Person=id;render()},[r.before.id,r.d]);
 await p.waitForTimeout(2500);
 await p.locator('.k74-person').first().screenshot({path:'/tmp/j/gl25_full.png',timeout:20000}).catch(e=>console.log('shot1',String(e).slice(0,100)));
 await p.evaluate(([id])=>{S._cr74Person=id;render()},[r.b2.id]);await p.waitForTimeout(2000);
 await p.locator('.k74-person').first().screenshot({path:'/tmp/j/gl25_part.png',timeout:20000}).catch(e=>console.log('shot2',String(e).slice(0,100)));
 await p.evaluate(()=>{S.adminTab='leave';render()});await p.waitForTimeout(1500);
 await p.screenshot({path:'/tmp/j/gl25_leave.png',fullPage:false});
 console.log('errors',errs.slice(0,5),'mailfail',await p.evaluate(()=>(window.KGM_MAIL_FAIL_R1025B||[]).length));
 await b.close()})();
