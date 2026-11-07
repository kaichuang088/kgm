// 1103A：從網站實際內嵌的規章取 FFP-011／CRD-020／GRP-021（PDF 跟網站同一份）
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(8000);
const d=await p.evaluate(()=>{const o={};['KGM-FFP-011','KGM-CRD-020','KGM-GRP-021'].forEach(k=>{const x=window.KGM_POLICY_DOCS_R914[k];o[k]=x?JSON.parse(JSON.stringify(x)):null});return o});
fs.writeFileSync('/tmp/j/pol33.json',JSON.stringify(d));for(const k in d)console.log(k,d[k]&&d[k].ver,d[k]&&d[k].eff,d[k]&&d[k].arts,d[k]&&d[k].h.length);await b.close()})();
