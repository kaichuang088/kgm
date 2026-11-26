// 1103A：自創航班申請表——機型選單依兩端機場/航程/人數；去回程人數不同 → 報價、團體訂位人數
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1100}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(2000);
const r=await p.evaluate(async()=>{window.alert=()=>{};window.confirm=()=>true;var u=S.users.find(x=>x.email==='demo@kgm.com')||S.users[0];u.groupAccountR1025B={status:'active',company:'KK TRIP',type:'agency',taxId:'22099131',license:'乙1235',contact:{name:'Admin',phone:'0912345765',email:'t@g.com'},caseNo:'KG7579103126M'};S.user=u;
 S.view='group23';render();kgmCharterOpenR1026C('custom');await new Promise(r=>setTimeout(r,700));
 const set=(id,v)=>{var e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('input'))}};const opts=()=>[...document.getElementById('k27c-type').options].map(o=>o.value).filter(Boolean);const note=()=>((document.querySelector('.k31c-note')||{}).textContent||'');
 const out={};
 for(const [fr,to,pax] of [['TPE','PHX','231'],['TPE','LAX','231'],['TPE','NRT','231'],['TPE','KMQ','150'],['TPE','LHR','600'],['TPE','FUK','231']]){set('k27c-fr',fr);set('k27c-to',to);set('k27c-pax',pax);await new Promise(r=>setTimeout(r,700));out[fr+'-'+to+' '+pax]={opts:opts(),note:note()}}
 // 去回程人數
 set('k27c-name','2027員工出發囉');set('k27c-fr','TPE');set('k27c-to','PHX');set('k27c-date',addDays(todayISO(),200));set('k27c-ret',addDays(todayISO(),210));set('k27c-pax','231');await new Promise(r=>setTimeout(r,700));
 const pr=document.getElementById('k31c-paxret');out.paxRetVisible=!!pr&&pr.parentElement.style.display!=='none';out.paxLabel=document.getElementById('k27c-pax').parentElement.querySelector('span').textContent;
 set('k31c-paxret','180');await new Promise(r=>setTimeout(r,700));
 // 選 A388（PHX 不能停）應該不在選單 → 直接塞值送出也要擋
 const sel=document.getElementById('k27c-type');const o=document.createElement('option');o.value='A388';sel.appendChild(o);sel.value='A388';kgmCharterSubmitR1026C();await new Promise(r=>setTimeout(r,500));out.blockA388=S.k27cr&&S.k27cr.msg;
 await new Promise(r=>setTimeout(r,800));set('k31c-paxret','180');document.getElementById('k27c-type').value='';kgmCharterSubmitR1026C();await new Promise(r=>setTimeout(r,800));
 const q=(S.charterReqsR1026C||[])[0];out.req={id:q&&q.id,pax:q&&q.pax,paxRet:q&&q.paxRet,status:q&&q.status,msg:S.k27cr&&S.k27cr.msg};
 out.listTxt=((document.querySelector('.k30cr-facts')||document.querySelector('.k27cr-list')||{}).innerText||'').replace(/\s+/g,' ').slice(0,200);
 return out});
console.log(JSON.stringify(r,null,1));
const id=r.req.id;
const r2=await p.evaluate(async(id)=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='groups23';S.k27gdTab='charter';render();for(var w=0;w<20&&!document.getElementById('k28q-amt-'+id);w++)await new Promise(r=>setTimeout(r,500));
 const art=[...document.querySelectorAll('article,div')].find(e=>e.textContent.indexOf(id)>=0&&/k27cd/.test(e.className));
 var btn=[...document.querySelectorAll('button')].find(b=>/送出報價/.test(b.textContent)&&b.closest('article')&&b.closest('article').textContent.indexOf(id)>=0)||[...document.querySelectorAll('button')].find(b=>/送出報價/.test(b.textContent));const pre=document.getElementById('k28q-amt-'+id);const preV=pre&&pre.value;if(btn)btn.click();await new Promise(r=>setTimeout(r,800));var q=S.charterReqsR1026C.find(x=>x.id===id);
 return {adminHead:art?art.querySelector('.k27cd-n')&&art.querySelector('.k27cd-n').innerText.replace(/\s+/g,' '):'',prefill:preV,st:q&&q.status,amt:q&&q.quoteR1101A&&q.quoteR1101A.amount}},id);
console.log('admin',JSON.stringify(r2));
const r3=await p.evaluate(async(id)=>{S.adminAuthed=false;S.view='group23';render();await new Promise(r=>setTimeout(r,500));kgmCharterAcceptR1101A(id);await new Promise(r=>setTimeout(r,1500));var q=S.charterReqsR1026C.find(x=>x.id===id);var g=(S.groupsR1023A||[]).find(x=>x.id===q.groupId);var bk=g&&S.bookings.find(x=>x.pnr===g.pnr);
 return {st:q.status,pax:q.pax,paxRet:q.paxRet,flights:(q.flights||[]).map(f=>f.code+' '+f.fr+'→'+f.to+' '+f.type),group:g&&{pax:g.pax,total:g.total},bookingPax:bk&&bk.paxList.length,offer:((document.querySelector('.k30q-amt')||{}).innerText||'').replace(/\s+/g,' ')}},id);
console.log('accept',JSON.stringify(r3));console.log('ERR',errs.slice(0,5));
await p.screenshot({path:'/tmp/j/cf33.png',fullPage:false});await b.close()})();
