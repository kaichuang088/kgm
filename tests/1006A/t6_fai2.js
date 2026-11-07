var W=ms=>new Promise(r=>setTimeout(r,ms));
var of=window.__of||(window.__of=window.fetch);var calls=[];
window.fetch=function(u,o){if(/\/ai\/front/.test(String(u))){var b=JSON.parse(o.body);calls.push({text:b.text,policy:(b.policy||[]).length,hist:(b.history||[]).length,member:!!b.member});
  var resp=/東京/.test(b.text)?{reply:'下個月去東京我先幫您打開 11/12 的航班，可以在結果頁左右切換日期比價。',action:{type:'search',fr:'TPE',to:'NRT',date:'2026-11-12'}}
   :/真人|客服|agent/.test(b.text)?{reply:'好的，幫您轉接真人客服。',action:{type:'handoff'}}:{reply:'（Claude）經濟艙超值方案提供免費文字訊息 Wi-Fi，豪華方案提供完整 Wi-Fi。'};
  return new Promise(r=>setTimeout(()=>r(new Response(JSON.stringify(resp),{status:200,headers:{'Content-Type':'application/json'}})),800))}return of.apply(this,arguments)};
S.view='home';render();S.aiOpen=true;try{drawAi0819I()}catch(_){}
var out=[];
for(const q of ['經濟艙有wifi嗎','下個月去東京最便宜哪天']){var inp=document.getElementById('aiInput');inp.value=q;sendAI();await W(3000);
 var M=((S.aiConversation0819I||{}).messages||[]).filter(m=>m.role!=='user');out.push(q+' => '+String(M[M.length-1].text).replace(/\n/g,' / ')+' | view='+S.view+' search='+JSON.stringify(S.search&&{fr:S.search.fr,to:S.search.to,dep:S.search.dep}))}
S.view='home';render();try{drawAi0819I()}catch(_){}
var inp=document.getElementById('aiInput');inp.value='我想找真人客服幫忙改名字';sendAI();await W(3000);
var c=S.aiConversation0819I,it=c.csIdR1006A&&S.csQueueR1006A[c.csIdR1006A];out.push('handoff => cs='+(it?it.status+' '+it.summary:'none'));
var n0=c.messages.length;inp=document.getElementById('aiInput');inp.value='我的訂位代號是 ABC123';sendAI();await W(2500);
out.push('during CS: calls so far '+calls.length+', last user msg routed to agent: '+((it&&it.msgs||[]).slice(-1)[0]||{}).text);
return {out:out,calls:calls}
