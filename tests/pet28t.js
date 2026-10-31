// 1101A：寵物同行申請＋旅客建立案件（附件）＋後台送 CEO／核准＋航班資料寵物標示
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},acceptDownloads:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
const D=await p.evaluate(()=>{var u=S.users.find(x=>x.email==='demo@kgm.com')||S.users[0];S.user=u;var T=todayISO();
 function mk(pnr,code,D){var f0=FLIGHTS.filter(x=>x.code===code&&!x.via)[0];var f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});S.bookings.push({pnr:pnr,status:'confirmed',userId:u.id,email:u.email,contactEmail:u.email,outF:f,outC:'E-T',inbF:null,paxList:[{firstName:'DEMO',lastName:'EXPLORER',title:'MR'}],seats:{},total:9000,curr:'TWD',bookedAt:new Date().toISOString()})}
 var D=null,f0=FLIGHTS.find(x=>x.code==='KX180');for(var i=10;i<25;i++){var d=addDays(T,i);if(flyOn(f0,new Date(d+'T12:00:00'))){D=d;break}}
 mk('PET28A','KX180',D);var l=FLIGHTS.find(x=>x.to==='LHR'&&!x.partner&&!x.via);if(l)mk('PET28L',l.code,addDays(T,30));
 nav('pet28');return {D,lhr:l&&l.code}});
await p.waitForTimeout(1200);await p.screenshot({path:'/tmp/j/pet1.png'});
// 用真的介面操作
await p.selectOption('.k28pet-form select.inp >> nth=0','PET28A');await p.waitForTimeout(500);
await p.evaluate(()=>{kgmPetSetR1101A('kg','6');kgmPetSetR1101A('weeks','30');kgmPetSetR1101A('dims','40x30x20');kgmPetSetR1101A('name','Mochi');kgmPetSetR1101A('breed','柴犬 Shiba',1)});await p.waitForTimeout(400);
await p.click('.k28pet-form .k60-check input');await p.waitForTimeout(400);
await p.setInputFiles('.k28-drop input','/tmp/j/hc.pdf');await p.waitForTimeout(300);
const pre=await p.evaluate(()=>({res:(document.querySelector('.k28pet-res')||{}).innerText,files:document.querySelectorAll('#k28f-pet li').length,dis:document.querySelector('.k28pet-acts .k60-btn').disabled}));
await p.screenshot({path:'/tmp/j/pet2.png',fullPage:true});
await p.click('.k28pet-acts .k60-btn');await p.waitForTimeout(1500);
const c1=await p.evaluate(()=>{var c=S.staffCasesR1007A.find(x=>x.type==='pet'&&x.pnr==='PET28A');return c&&{no:c.caseNo,st:c.status,files:c.files,pet:c.pet,done:S.pet28&&S.pet28.done}});
// 規則：倫敦只受理貨運；超重；短鼻托運
const rules=await p.evaluate(()=>{var b=S.bookings.find(x=>x.pnr==='PET28L'),a=S.bookings.find(x=>x.pnr==='PET28A');return {lhr:b?kgmPetCheckR1101A(b,'out',{species:'cat',mode:'cabin',kg:4}).why:null,heavy:kgmPetCheckR1101A(a,'out',{species:'dog',mode:'cabin',kg:11}).why,snub:kgmPetCheckR1101A(a,'out',{species:'dog',mode:'hold',kg:12,snub:true}).why,holdFee:kgmPetCheckR1101A(a,'out',{species:'dog',mode:'hold',kg:20}).fee}});
// 旅客建立案件
await p.evaluate(()=>{S.case28=null;nav('case28')});await p.waitForTimeout(800);
await p.selectOption('.k28pet-form select.inp >> nth=0','PET28A');await p.waitForTimeout(400);
await p.click('.k28cat button:has-text("服務客訴")');await p.waitForTimeout(300);
await p.fill('.k28pet-form textarea','經濟艙餐點用完，只剩素食，空服員回覆態度不佳。');
await p.setInputFiles('.k28-drop input','/tmp/j/hc.pdf');await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/j/case1.png',fullPage:true});
await p.click('.k28pet-acts .k60-btn');await p.waitForTimeout(1500);
const c2=await p.evaluate(()=>{var c=S.staffCasesR1007A.find(x=>x.paxR1101A&&x.type==='complaint');return c&&{no:c.caseNo,files:(c.files||[]).length}});
// 後台
const adm=await p.evaluate(async(no)=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='cases0831B';S.case28Cat='other';S.case7Sel=no;render();await new Promise(r=>setTimeout(r,800));
  var out={cat:[...document.querySelectorAll('.k28-cat button')].map(b=>b.innerText.replace(/\s+/g,' ')),src:(document.querySelector('.k7c-detail header small')||{}).innerText,file:!!document.querySelector('.k7c-detail .k28-files button'),toCeoBtn:!![...document.querySelectorAll('.k7c-btns button')].find(b=>/送 CEO/.test(b.innerText))};
  kgmCase28ToCeo(no);await new Promise(r=>setTimeout(r,500));out.st1=S.staffCasesR1007A.find(x=>x.caseNo===no).status;out.ceoPanel=!!document.getElementById('k28CeoMsg');
  document.getElementById('k28CeoMsg').value='已核准，請於報到時至櫃檯支付寵物費用。';kgmCase28Ceo(no,true);await new Promise(r=>setTimeout(r,500));
  var bk=S.bookings.find(x=>x.pnr==='PET28A');out.st2=S.staffCasesR1007A.find(x=>x.caseNo===no).status;out.pets=bk.petsR1101A;out.tag=kgmPetTagR1101A('PET28A',bk.outF.code+'|'+bk.outF.date+'|TPE|NRT');
  S.case28Cat='refund';render();await new Promise(r=>setTimeout(r,500));out.refundRows=document.querySelectorAll('.k7c-table tbody tr').length;out.otherShown=[...document.querySelectorAll('.k7c-table tbody tr')].some(t=>/寵物/.test(t.innerText));
  return out},c1&&c1.no);
await p.screenshot({path:'/tmp/j/case2.png'});
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(()=>null),p.evaluate(f=>kgmCaseFileGetR1101A(f.id,f.name),c1.files[0])]);
const dlOk=dl?(require('fs').readFileSync(await dl.path(),'utf8')):null;
console.log(JSON.stringify({D,pre,c1,rules,c2,adm,dlOk,errs:errs.slice(0,3)},null,1));await b.close()})();
