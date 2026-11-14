const {chromium}=require('playwright');const SH='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fd22/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(14000);
await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='auctions';render()});await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>{const g=[...document.querySelectorAll('#app .k920-grp')].filter(x=>x.querySelector('.k929-bdh'));
 const rows=g.map(x=>{const h=x.querySelector('h3');return h.innerText.replace(/\s+/g,' ').slice(0,90)});
 let bad=0;const key=t=>(/(KX\d+\s+\S+\s+\d{4}-\d\d-\d\d)/.exec(t)||[])[1];for(let i=1;i<rows.length;i++){if(key(rows[i])===key(rows[i-1])&&/豪華經濟艙/.test(rows[i-1])&&/商務艙/.test(rows[i]))bad++}
 const pairs=rows.filter((r,i)=>i&&key(r)===key(rows[i-1])).length;
 return 'bigdeal groups '+rows.length+' same-flight adjacent pairs '+pairs+' premium-before-business '+bad+'\n'+rows.slice(0,10).join('\n')}));
try{await p.locator('.k929-bdh').first().scrollIntoViewIfNeeded();await p.waitForTimeout(300);await p.screenshot({path:SH+'auc_bd.png'})}catch(e){console.log('shot',e.message.slice(0,80))}
await b.close()})();
