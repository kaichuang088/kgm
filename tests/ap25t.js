// 1025B G：後台機場欄位改用前台選擇器
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 const tabs=['groundops','groundroster12'];
 for(const t of tabs){await p.evaluate(t=>{S.adminTab=t;render()},t);await p.waitForTimeout(2500);
   const r=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#app .k25ap')];return {n:bs.length,labels:bs.slice(0,6).map(b=>b.innerText.replace(/\s+/g,' ').trim()),
     raw:[...document.querySelectorAll('#app [data-ap25="1"]')].slice(0,6).map(e=>(e.id||e.tagName)+'='+e.value)}});
   console.log(t,JSON.stringify(r));}
 // 航班狀態頁：開選擇器、搜「蘇黎世」、選、確認原欄位
 await p.evaluate(()=>{S.adminTab='price';render()});await p.waitForTimeout(2500);
 const has=await p.$('#app .k25ap');if(has){await has.click();await p.waitForTimeout(400);await p.keyboard.type('東京');await p.waitForTimeout(300);
   await p.screenshot({path:'/tmp/j/ap25_pop.png'});console.log('pos',JSON.stringify(await p.evaluate(()=>{const b=document.querySelector('#app .k25ap').getBoundingClientRect(),q=document.querySelector('.k25ap-pop').getBoundingClientRect();return {btnBottom:Math.round(b.bottom),btnLeft:Math.round(b.left),popTop:Math.round(q.top),popLeft:Math.round(q.left)}})));
   const before=await p.evaluate(()=>{const e=document.querySelector('#app [data-ap25="1"]');return e.id+'='+e.value});
   await p.locator('.k25ap-pop [data-v]').first().click();await p.waitForTimeout(800);
   const after=await p.evaluate(()=>{const e=document.querySelector('#app [data-ap25="1"]');return {v:e.id+'='+e.value,label:(e.__k25ap||{}).innerText}});
   console.log('pick before',before,'after',JSON.stringify(after));}
 await p.evaluate(()=>{S.adminTab='flightadjust';render()});await p.waitForTimeout(2500);await p.screenshot({path:'/tmp/j/ap25_route.png'});
 console.log('errors',errs.slice(0,5));await b.close()})();
