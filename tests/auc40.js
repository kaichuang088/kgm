// 1112A C10：後台競標管理頂部「進行中的競標」：BigDeal 領先／Out of Bid、Residence 現金／里程開放中都看得到
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(30000);
const r=await p.evaluate(async()=>{const td=todayISO();let made=0;for(let k=3;k<=6;k++){const d=addDays(td,k);for(const [fr,to] of [['TPE','LAX'],['TPE','LHR'],['TPE','SFO'],['TPE','JFK']]){for(const f of (sortedFlights(fr,to,d)||[]).filter(x=>!x.partner).slice(0,2)){try{if(kgmBigDealWindowR929(f,d).open){kgmEnsureAuctionsR922(f.code,d,Object.assign({},f,{date:d}));made++}}catch(_){}}}}
 // 會員自己的 Residence 出價（另一張卡）
 S.residenceBidsR83=(S.residenceBidsR83||[]).filter(x=>x.id!=='RBT40');S.residenceBidsR83.unshift({id:'RBT40',userId:'KGMDEMO0911',who:'DEMO MEMBER',pnr:'RES40A',code:'KX5',fr:'TPE',to:'LAX',date:addDays(td,40),pax:1,amount:480000,status:'open',alt:'business',placedAt:new Date().toISOString(),diffCardR1112A:{mode:'other',last4:'5556',exp:'08/28',holder:'DEMO'}});
 S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='auctions';S.aucViewR1103A='all';render();await new Promise(r=>setTimeout(r,4000));render();await new Promise(r=>setTimeout(r,1200));
 const lv=document.querySelector('.k40lv');if(!lv)return {nolv:true};
 const want={bd:(S.bigDeals||[]).filter(b=>/^(open|leading|outbid|pending)$/.test(b.status)&&b.date>=td).length,rc:(S.residenceBidsR83||[]).filter(b=>b.status==='open'&&b.date>=td).length,rm:(S.resMileBidsR161||[]).filter(b=>b.status==='open'&&b.date>=td).length};
 const head=lv.querySelector('.k40lv-h').innerText.replace(/\s+/g,' ');const kpi=[...document.querySelectorAll('.k31a-k>div')].map(d=>d.innerText.replace(/\s+/g,' '));
 const firstTop=lv.getBoundingClientRect().top<(document.querySelector('.k920-grp')||{getBoundingClientRect:()=>({top:1e9})}).getBoundingClientRect().top;
 const allBtn=lv.querySelector('.k40lv-more');if(allBtn)allBtn.click();await new Promise(r=>setTimeout(r,900));
 try{render()}catch(_){}   /* 1112B：背景一直在補模擬出價 → 重畫後立刻數，表格跟資料同一個時間點 */
 const OW=(b)=>{const f=[].concat(FLIGHTS,S.customFlights||[]).find(x=>x&&x.code===b.code&&x.fr===b.fr&&x.to===b.to);return !f||kgmBigDealWindowR929(f,b.date).open};const want2={bd:(S.bigDeals||[]).filter(b=>/^(open|leading|outbid|pending)$/.test(b.status)&&b.date>=td&&OW(b)).length,rc:(S.residenceBidsR83||[]).filter(b=>b.status==='open'&&b.date>=td).length,rm:(S.resMileBidsR161||[]).filter(b=>b.status==='open'&&b.date>=td).length};const lv2=document.querySelector('.k40lv');const head2=lv2.querySelector('.k40lv-h').innerText.replace(/\s+/g,' ');const trs=[...lv2.querySelectorAll('tbody tr')];const mine=trs.find(t=>/RES40A/.test(t.innerText));
 const sts={};trs.forEach(t=>{const s=(t.querySelector('.k40lv-st')||{}).innerText;sts[s]=(sts[s]||0)+1});
 const incons=[...lv2.querySelectorAll('.k40lv-g')].map(g=>{const m=/Available Seats (\d+)(?:（[^）]*）)?・競標人數 (\d+)/.exec(g.querySelector('.k40lv-gh').innerText);if(!m)return null;const seats=+m[1];const rows=[...g.querySelectorAll('tbody tr')];const lead=rows.filter(t=>/領先/.test(t.innerText)).length;const pax=rows.reduce((a,t)=>{const x=/×(\d)/.exec(t.innerText);return a+(x?+x[1]:1)},0);return (pax<=seats&&lead!==rows.length)?g.querySelector('.k40lv-gh').innerText.replace(/\s+/g,' '):null}).filter(Boolean);S.aucViewR1103A='res';render();await new Promise(r=>setTimeout(r,900));const resOnly=[...document.querySelectorAll('.k40lv .k40lv-gh em')].every(e=>/Residence/.test(e.innerText));
 S.aucViewR1103A='bd';render();await new Promise(r=>setTimeout(r,900));const bdOnly=[...document.querySelectorAll('.k40lv .k40lv-gh em')].every(e=>/BigDeal/.test(e.innerText));
 S.aucViewR1103A='all';S.aucLiveAllR1112A=false;render();await new Promise(r=>setTimeout(r,700));
 return {made,incons,want,want2,head2,head,kpi:kpi[2],rows:trs.length,sts,mine:mine&&mine.innerText.replace(/\s+/g,' '),firstTop,resOnly,bdOnly}});
console.log(JSON.stringify(r,null,1));
await p.evaluate(()=>{const e=document.querySelector('.k40lv');if(e)e.scrollIntoView({block:'start'})});await p.waitForTimeout(400);await p.screenshot({path:'/tmp/j/s40/auc40.png'});
console.log('ERR',errs.slice(0,5));await b.close();
const tot=r.want2?r.want2.bd+r.want2.rc+r.want2.rm:-1;process.exit(r.want2&&r.want2.bd>0&&r.rows===tot&&r.incons&&!r.incons.length&&r.mine&&/5556/.test(r.mine)&&r.firstTop&&r.resOnly&&r.bdOnly&&!errs.length?0:1)})();
