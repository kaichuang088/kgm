// 1108B B9：BigDeal 出價改成兩個「儀表＋拉桿」（現金／里程），拉桿改原本的數字框，出價照舊
// 第二輪（使用者看圖「有點醜」）：出價後儀表顯示目前出價、往右拉才是加碼；右邊一格出價總價值＋按鈕
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(18000);
const r=await p.evaluate(async()=>{const u={id:'KGMBD39',name:'BD TEST',email:'bd39@example.com',password:'x',miles:200000,level:'Gold',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMBD39');S.users.push(u);S.user=u;
 let d=null,f=null;for(let k=3;k<=6&&!f;k++){const dd=addDays(todayISO(),k);const L=sortedFlights('TPE','LAX',dd)||[];const x=L.find(y=>!y.partner&&window.kgmBigDealWindowR929(y,dd).open);if(x){f=x;d=dd}}
 if(!f)return {nof:true};S.bookings=S.bookings.filter(x=>x.pnr!=='BD39AA');S.bookings.push({pnr:'BD39AA',userId:u.id,status:'confirmed',outF:Object.assign({},f,{date:d}),outC:'E-E',paxList:[{firstName:'BD',lastName:'TEST',passengerType:'ADT'}],total:30000,curr:'TWD'});
 S.view='bigdeal31';render();await new Promise(r=>setTimeout(r,1500));
 const g=[...document.querySelectorAll('.k39g')];if(!g.length)return {nog:true,txt:(document.querySelector('.k31d')||{innerText:''}).innerText.slice(0,300)};
 const row=g[0].closest('.k929bd-row');const cabTx=row.querySelector('.k929bd-cab small').innerText;const rc=row.querySelector('.k39g[data-u="c"] input[type=range]'),rm=row.querySelector('.k39g[data-u="m"] input[type=range]');
 const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};const base=+row.querySelector('.k39g[data-u="c"]').getAttribute('data-base');
 const lv=[];for(const k of [0.3,0.8,1.2,1.6,2.2]){set(rc,Math.round(base*k/500)*500);lv.push([rc.value,row.querySelector('.k39g[data-u="c"] .k39g-lv').textContent,row.querySelector('.k39g[data-u="c"] .k39g-ndl').style.transform])}
 set(rc,Math.round(base*1.2/500)*500);const mb=+row.querySelector('.k39g[data-u="m"]').getAttribute('data-base');set(rm,Math.round(mb*0.5/1000)*1000);
 const hidC=row.querySelector('input[type=number][id$="_c"]').value,hidM=row.querySelector('input[type=number][id$="_m"]').value;
 const n0=(S.bigDeals||[]).length;row.querySelector('.k929bd-in button.btn-g').click();await new Promise(r=>setTimeout(r,800));const bd=(S.bigDeals||[]).filter(x=>x.pnr==='BD39AA').slice(-1)[0];
 return {flight:f.code+' '+d,widgets:g.length,cabTx,lv,hidC,hidM,bid:bd&&{amount:bd.amount,miles:bd.miles,status:bd.status,to:bd.toCabin},n:(S.bigDeals||[]).length-n0}});
console.log(JSON.stringify(r,null,1));
await p.waitForTimeout(1500);
const r2=await p.evaluate(async()=>{const row=document.querySelector('.k39g').closest('.k929bd-row');const wc=row.querySelector('.k39g[data-u="c"]'),wm=row.querySelector('.k39g[data-u="m"]');
 const st={c:{amt:wc.querySelector('.k39g-amt').textContent,lv:wc.querySelector('.k39g-lv').textContent,sub:wc.querySelector('.k39g-sub').textContent,range:wc.querySelector('input[type=range]').value},
   m:{amt:wm.querySelector('.k39g-amt').textContent,lv:wm.querySelector('.k39g-lv').textContent,sub:wm.querySelector('.k39g-sub').textContent},tot:row.querySelector('.k39g-tot').innerText.replace(/\s+/g,' '),btns:[...row.querySelectorAll('.k39g-act .btn')].map(b=>b.textContent)};
 const rc=wc.querySelector('input[type=range]');const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};
 set(rc,3000);const low={range:rc.value,hid:row.querySelector('input[type=number][id$="_c"]').value};
 set(rc,10000);const up={hid:row.querySelector('input[type=number][id$="_c"]').value,sub:wc.querySelector('.k39g-sub').textContent,tot:row.querySelector('.k39g-tot').innerText.replace(/\s+/g,' ')};
 window.alert=()=>{};row.querySelector('.k39g-act .btn-g').click();await new Promise(r=>setTimeout(r,800));const bd=(S.bigDeals||[]).filter(x=>x.pnr==='BD39AA').slice(-1)[0];
 const lay=[...row.querySelector('.k929bd-in').children].map(c=>c.className+':'+Math.round(c.getBoundingClientRect().width));const card=row.getBoundingClientRect();const act=row.querySelector('.k39g-act').getBoundingClientRect();
 return {st,low,up,after:bd&&{amount:bd.amount,miles:bd.miles,status:bd.status},lay,inside:act.right<=card.right+1}});
console.log('AFTERBID',JSON.stringify(r2,null,1));await p.waitForTimeout(1200);await p.evaluate(()=>{const e=document.querySelector('.k39g');if(e)e.scrollIntoView({block:'center'})});await p.waitForTimeout(400);await p.screenshot({path:'/tmp/j/s39/bd39b.png'});await p.evaluate(()=>{const e=document.querySelector('.k39g');if(e)e.scrollIntoView({block:'center'})});await p.waitForTimeout(400);await p.screenshot({path:'/tmp/j/s39/bd39.png'});
console.log('ERR',errs.slice(0,5));await b.close()})();
