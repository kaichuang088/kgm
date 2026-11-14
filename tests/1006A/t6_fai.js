var W=ms=>new Promise(r=>setTimeout(r,ms));
var qs=['我的託運行李可以帶幾公斤','小孩單獨搭飛機要怎麼辦','下個月去東京最便宜哪天','可以帶寵物嗎','你好','我想把明天的票改到後天','經濟艙有wifi嗎','what is the baggage allowance for premium economy'];
var out=[];
for(const q of qs){try{S.aiOpen=true;}catch(_){}
 var inp=document.getElementById('aiInput');if(!inp){try{window.drawAi0819I&&drawAi0819I()}catch(_){};inp=document.getElementById('aiInput')}
 if(!inp){out.push('no input');break}
 inp.value=q;sendAI();await W(4000);
 var M=((S.aiConversation0819I||{}).messages||[]).filter(m=>m.role!=='user');var last=M.length?(M[M.length-1].text||M[M.length-1].html||''):'';
 out.push(q+' => '+(last||'').slice(0,220).replace(/\n/g,' / '));}
return out
