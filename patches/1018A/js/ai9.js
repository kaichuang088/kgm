  /* 1008B：不用 Worker 也能用真的 Claude —— 後台這台電腦直接呼叫 Anthropic Messages API（金鑰只存在這台電腦的瀏覽器，不進 save()、不同步到前台）。
     順序：有金鑰 → 直連；直連失敗或沒金鑰 → Worker；兩條都不通 → 站內規則引擎。工具定義跟 Worker 同一份（建置時從 worker_ai_1008B.txt 取出）。 */
  var KEY9='kgm_ai_key_r1008b',VIA9='';
  var TOOLS9=__ADMIN_AI_TOOLS__;
  function key9(){try{return String(localStorage.getItem(KEY9)||'').trim()}catch(_){return ''}}
  function hist9(text){
    var h=chat().slice(-9,-2).filter(function(m){return m&&m.text&&!m.pending}).map(function(m){return {role:m.role==='user'?'user':'assistant',content:String(m.text).slice(0,2000)}}),msgs=[];
    h.forEach(function(m){if(!msgs.length&&m.role!=='user')return;if(msgs.length&&msgs[msgs.length-1].role===m.role)msgs[msgs.length-1].content+='\n'+m.content;else msgs.push(m)});
    if(msgs.length&&msgs[msgs.length-1].role==='user')msgs.pop();
    msgs.push({role:'user',content:String(text||'').slice(0,2000)});return msgs;
  }
  function sys9(){
    return '你是 KGM Airways 管理後台的 AI 助理。今天是 '+T()+'。登入者職務：'+roleOf()+'，員工編號 '+(me().empId||'')+'。\n'
      +'要改資料就呼叫工具；一次需求可以呼叫多個工具。日期一律用 YYYY-MM-DD（沒寫年份就用今天之後最近的那一天；寫了年份就照寫的年份）。\n'
      +'權限由網站端依職務檢查，沒有權限的工具網站會回覆「無權限」，你不用自己判斷。\n'
      +'只是問問題（例如營運概況、還有什麼沒處理）就直接用文字回答，依下面的即時營運摘要，不要編造摘要裡沒有的數字；要看某個頁面才呼叫 go_tab。\n'
      +'關閉或重新開放某個票價家族（基本／超值／豪華）一定用 fare_bucket，不要用 fare_rule_add。\n'
      +'組員請假、生病、要拿掉某幾天的班：用 crew_remove（一定要有員工編號、日期與原因，缺就反問）；反悔用 crew_restore。換班選方案用 crew_swap_pick。\n'
      +'同一天兩位組員對調用 crew_swap；某位組員要把某天的班改到另一天、另一條航線（含回程 DH）用 crew_trip_change，參數照需求填。\n'
      +'問員工票還有幾位、某班能不能上員工票：用 stx_seats。\n'
      +'看不懂或缺資料時不要亂猜，直接用一句中文反問。回覆一律用繁體中文，簡短。\n\n'
      +'【即時營運摘要（網站提供）】\n'+String(ctx6()||'（無）').slice(0,3000);
  }
  async function direct9(text,key){
    var known={};TOOLS9.forEach(function(t){known[t.name]=t});
    var tools=Object.keys(TOOLS).map(function(k){return known[k]||{name:k,description:String(TOOLS[k].zh||k).slice(0,400),input_schema:{type:'object',properties:{},additionalProperties:true}}});
    var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},90000);
    try{
      var res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:ctl.signal,
        headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true','anthropic-beta':'server-side-fallback-2026-07-01'},
        body:JSON.stringify({model:MODEL,max_tokens:16000,output_config:{effort:'medium'},fallbacks:'default',system:sys9(),tools:tools,messages:hist9(text)})});
      clearTimeout(tm);
      var j=null;try{j=await res.json()}catch(_){}
      if(!res.ok){var em=(j&&j.error&&j.error.message)||'';
        WHY8=res.status===401?(z()?'直連：API 金鑰無效（請到「連線」重新貼上）':'Direct: invalid API key')
          :res.status===429?(z()?'直連：用量達到上限，請稍後再試':'Direct: rate limited')
          :res.status===529||res.status>=500?(z()?'直連：Anthropic 服務忙碌（'+res.status+'），請稍後再試':'Direct: service busy')
          :((z()?'直連 HTTP ':'Direct HTTP ')+res.status+(em?('：'+em.slice(0,140)):''));
        return null}
      if(!j||j.stop_reason==='refusal'){WHY8=z()?'直連：Claude 婉拒這個請求（安全分類），已改由站內規則引擎處理':'Direct: request declined';return null}
      var c=j.content||[],reply=c.filter(function(b){return b.type==='text'}).map(function(b){return b.text}).join('\n').trim(),
          actions=c.filter(function(b){return b.type==='tool_use'}).map(function(b){return {tool:b.name,args:b.input||{}}});
      if(!reply&&!actions.length){WHY8=j.stop_reason==='max_tokens'?(z()?'直連：回覆被截斷':'Direct: truncated'):(z()?'直連：回覆是空的':'Direct: empty reply');return null}
      return {reply:reply,actions:actions,model:j.model||MODEL,via:'direct'};
    }catch(e9){clearTimeout(tm);WHY8=(e9&&e9.name==='AbortError')?(z()?'直連：等了 90 秒沒有回應':'Direct: timed out'):(z()?('直連：連不到 api.anthropic.com（網路或防火牆）：'+String(e9&&e9.message||e9).slice(0,80)):'Direct: network error');return null}
  }
  window.kgmAdminAiKeySaveR1008B=function(){var v=String((document.getElementById('k9aiKey')||{}).value||'').trim();try{if(v)localStorage.setItem(KEY9,v);else localStorage.removeItem(KEY9)}catch(_){}S.adminAiCfgMsgR1008B=v?(z()?'已儲存（只存在這台電腦）。':'Saved on this computer.'):(z()?'已清除金鑰。':'Key cleared.');draw()};
  window.kgmAdminAiKeyClearR1008B=function(){try{localStorage.removeItem(KEY9)}catch(_){}S.adminAiCfgMsgR1008B=z()?'已清除金鑰。':'Key cleared.';draw()};
  window.kgmAdminAiKeyTestR1008B=async function(){
    var k=String((document.getElementById('k9aiKey')||{}).value||'').trim()||key9();if(!k){S.adminAiCfgMsgR1008B=z()?'請先貼上金鑰。':'Paste a key first.';return draw()}
    S.adminAiCfgMsgR1008B=z()?'測試中…':'Testing…';draw();
    try{var r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model:MODEL,max_tokens:2000,output_config:{effort:'low'},messages:[{role:'user',content:'回覆「OK」兩個字。'}]})});
      var j=null;try{j=await r.json()}catch(_){}
      S.adminAiCfgMsgR1008B=r.ok?((z()?'✓ 連線成功：':'✓ Connected: ')+((j&&j.model)||MODEL)):((z()?'✕ 失敗 HTTP ':'✕ HTTP ')+r.status+((j&&j.error&&j.error.message)?('：'+String(j.error.message).slice(0,120)):''));
    }catch(e){S.adminAiCfgMsgR1008B=(z()?'✕ 連不到 api.anthropic.com：':'✕ Network: ')+String(e&&e.message||e).slice(0,80)}
    draw();
  };
  function cfg9(){
    if(!S.adminAiCfgR1008B)return '';
    var has=!!key9();
    return '<div class="k9ai-cfg"><b>'+(z()?'Claude 連線方式':'Claude connection')+'</b>'
      +'<p>'+(z()?'① 直接連線：在這裡貼上 Anthropic API 金鑰（console.anthropic.com → API Keys），只存在這台電腦的瀏覽器，不會同步到前台、不會寫進存檔。② Worker：沒有金鑰時改走 Cloudflare Worker 的 /ai/admin。兩條都不通才用站內規則引擎。'
          :'① Direct: paste an Anthropic API key (stored only in this browser). ② Worker /ai/admin when no key. Built-in rules only when both fail.')+'</p>'
      +'<div class="k9ai-row"><input id="k9aiKey" class="inp" type="password" autocomplete="off" placeholder="'+(has?(z()?'已設定金鑰（重新貼上可更換）':'Key saved — paste to replace'):'sk-ant-…')+'">'
      +'<button class="btn btn-sm" onclick="kgmAdminAiKeyTestR1008B()">'+(z()?'測試':'Test')+'</button><button class="btn btn-sm btn-g" onclick="kgmAdminAiKeySaveR1008B()">'+(z()?'儲存':'Save')+'</button>'
      +(has?'<button class="btn btn-sm" onclick="kgmAdminAiKeyClearR1008B()">'+(z()?'清除':'Clear')+'</button>':'')+'</div>'
      +'<small>'+(z()?'建議在 Anthropic Console 為這把金鑰設定每月用量上限；金鑰存在瀏覽器，能使用這台電腦的人都看得到。':'Set a monthly spend limit for this key; anyone using this browser can read it.')+'</small>'
      +(S.adminAiCfgMsgR1008B?'<div class="k9ai-msg">'+E(S.adminAiCfgMsgR1008B)+'</div>':'')+'</div>';
  }
  (function(){try{if(document.getElementById('k9ai-css'))return;var st=document.createElement('style');st.id='k9ai-css';st.textContent=''
    +'.k9ai-cfg{background:#fff;border:1px solid #ece7da;border-radius:10px;padding:10px 12px;font-size:11.5px;line-height:1.6;color:#3b3a36}'
    +'.k9ai-cfg b{display:block;font-size:12.5px;color:#1f1e1d;margin-bottom:4px}.k9ai-cfg p{margin:0 0 8px;color:#6b665c}'
    +'.k9ai-row{display:flex;gap:6px;align-items:center}.k9ai-row .inp{flex:1;min-width:0;font-size:12px;padding:6px 8px}'
    +'.k9ai-cfg small{display:block;margin-top:6px;color:#9a8f7a;font-size:10.5px}.k9ai-msg{margin-top:6px;font-weight:700;color:#0b493b}';
    (document.head||document.documentElement).appendChild(st)}catch(_){}})();
