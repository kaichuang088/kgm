/* ══ 1120A M1（使用者：「我也一直對這兩張有意見」——無限萬里遊首頁、購買哩程頁）══
   版面重做，功能全部沿用原本的（不另做一套）：
   · 無限萬里遊（milesTab＝overview）：原本＝mileageHome0819H（標題＋四顆一樣大的按鈕）。
     改成跟 1118A 首頁同一套淺色版面：上方會員卡（可用里程、會員等級、會員編號）＋四個主要服務大卡（酬賓機票／里程升等／購買里程／帳戶明細，
     按下去呼叫的跟原本一樣：openMileageService0814C('award'|'upgrade')、milesTab='buymiles'、profile details）＋其他服務（里程轉讓）＋「怎麼累積里程」。
     沒登入：會員卡換成「登入查看里程」。
   · 購買哩程（milesTab＝buymiles／buy）：原本＝深色大圖＋一個 50 個選項的下拉選單＋右邊小計。
     改成：上方標題＋活動說明（kgmBuyPromoTextR928，沒有活動就不寫優惠字樣，跟原本同一個規則）、常用數量方塊（5,000～50,000，含加贈與價格）、
     「其他數量」保留原本的下拉選單（每 1,000 哩一格，buyMilesSelect0815）、右邊固定小計＋「立即付款」（doPointsBuyMiles）。
     價格一律讀 buyMilesTierQuote0815（原本那支），安全驗證說明（第 1、2 次購買 24–72 小時）從原本那層的輸出抓過來照放。
   · 付款成功頁、里程轉讓頁、其他分頁照舊交回原本那條鏈。 */
(function(){
  if(window.__mh120)return;window.__mh120=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function me(){try{return (typeof authoritativeMember0813==='function'&&authoritativeMember0813())||S.user||null}catch(_){return S.user||null}}
  var TZH={Explorer:'Explorer',Bronze:'普卡',Silver:'銀卡',Gold:'金卡',Diamond:'鑽石卡'};
  var IC={award:'<svg viewBox="0 0 24 24"><path d="M2.5 19h19M3.6 13.2l3.1.9 3.6-6.6 2 .6-1.6 7.3 4.6 1.3 2-2.3 1.6.4-1.1 3.6L4.5 15.6z"/></svg>',
    upgrade:'<svg viewBox="0 0 24 24"><path d="M12 20V5M6 11l6-6 6 6M5 20h14"/></svg>',
    buy:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 10a2.5 2 0 0 1 2.5-1.6c1.6 0 2.6.8 2.6 1.9 0 2.6-5.2 1.3-5.2 3.9 0 1.1 1.1 1.9 2.6 1.9a2.6 2 0 0 0 2.6-1.6"/></svg>',
    act:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8.5 9h7M8.5 12.5h7M8.5 16h4"/></svg>',
    gift:'<svg viewBox="0 0 24 24"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1"/></svg>'};
  function tile(k,ic,en,zh,sub,on){return '<button type="button" class="mh120-tile" onclick="'+on+'"><i>'+IC[ic]+'</i><small>'+en+'</small><b>'+zh+'</b><span>'+sub+'</span><em>→</em></button>'}
  function hub(){var zh=z(),u=me(),lvl=u?(u.level||u.tier||'Explorer'):'';
    var card=u?('<div class="mh120-card"><div class="mh120-card-top"><span>KGM MILES</span><em>'+E(TZH[lvl]||lvl)+'</em></div><small>'+(zh?'可用里程':'Available miles')+'</small><b>'+Number(u.miles||0).toLocaleString()+'<i> mi</i></b>'
        +'<div class="mh120-card-ft"><span>'+E(u.name||((u.firstName||'')+' '+(u.lastName||'')))+'</span><span>'+E(u.id||u.memberId||'')+'</span></div></div>')
      :('<div class="mh120-card guest"><div class="mh120-card-top"><span>KGM MILES</span></div><b class="g">'+(zh?'登入後查看您的里程':'Sign in to see your miles')+'</b><p>'+(zh?'兌換酬賓機票、升等、購買里程都需要先登入會員。':'Sign in to redeem, upgrade or buy miles.')+'</p><button type="button" class="btn btn-g" onclick="S.authMode=\'login\';nav(\'auth\')">'+(zh?'會員登入':'Sign in')+'</button></div>');
    var tiles=tile('award','award','REDEEM',zh?'酬賓機票':'Award tickets',zh?'用里程兌換機票：搜尋航班、選艙等、直接兌換':'Search flights and redeem with miles',"S.modal=null;S.mileageSource0812A=null;openMileageService0814C('award')")
      +tile('upgrade','upgrade','UPGRADE',zh?'里程升等':'Mileage upgrades',zh?'從已訂的行程選航段，升到更高艙等':'Upgrade a segment of an existing booking',"S.modal=null;openMileageService0814C('upgrade')")
      +tile('buy','buy','PURCHASE',zh?'購買里程':'Buy miles',zh?'差一點就夠？選數量、付款後入帳':'Top up your balance in a few steps',"S.milesTab='buymiles';render()")
      +tile('act','act','ACTIVITY',zh?'帳戶明細':'Account activity',zh?'每一筆里程與會籍積分的來源與到期':'Every mileage and tier-point entry',"S.milesTab='details';S.profileTab='details';S.view='profile';render()");
    var more=(typeof window.kgmTransferPageR4==='function'?'<button type="button" onclick="S.milesTab=\'transfer\';render()"><i>'+IC.gift+'</i><span><b>'+(zh?'里程轉讓':'Transfer miles')+'</b><small>'+(zh?'轉給家人朋友（Email 驗證）':'Send miles to family or friends')+'</small></span></button>':'');
    var earn=[[zh?'搭乘 KGM 航班':'Fly KGM',zh?'依飛行距離 × 票種：豪華 100%、超值 80%、基本 50%':'Distance × fare: Flex 100%, Value 80%, Basic 50%'],[zh?'聯營夥伴航班':'Partner flights',zh?'依夥伴航空與艙等規則累積':'Earn on partner flights by their rules'],[zh?'KGM 聯名卡':'KGM co-brand cards',zh?'刷卡消費累積里程與會籍積分':'Earn miles and tier points on spend'],[zh?'航後問卷':'Post-flight survey',zh?'完成有效問卷可獲 600 里程':'600 miles for a completed survey']];
    return '<main class="mh120"><section class="mh120-hero"><div class="mh120-hl"><span class="mh120-eye">KGM MILES · '+(zh?'無限萬里遊':'INFINITE JOURNEY')+'</span><h1>'+(zh?'里程，帶你去下一個地方':'Miles that take you further')+'</h1><p>'+(zh?'兌換機票、升等、購買與帳戶明細，每一項都直接進入對應的服務頁。':'Redeem, upgrade, buy and review — each opens its own service page.')+'</p></div>'+card+'</section>'
      +'<section class="mh120-tiles">'+tiles+'</section>'
      +(more?'<section class="mh120-more"><h3>'+(zh?'其他服務':'More')+'</h3><div>'+more+'</div></section>':'')
      +'<section class="mh120-earn"><h3>'+(zh?'怎麼累積里程':'Ways to earn')+'</h3><div>'+earn.map(function(x,i){return '<article><i>0'+(i+1)+'</i><b>'+x[0]+'</b><span>'+x[1]+'</span></article>'}).join('')+'</div></section></main>'}
  /* ── 購買哩程 ── */
  function U(v){return Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}   /* 1120A：金額千分位（USD 1,200.00） */
  var PK=[5000,10000,20000,30000,50000];
  function q(n){try{return buyMilesTierQuote0815(n)}catch(_){return null}}
  function buy(prevHtml){var zh=z(),u=me()||{},qty=+S._buyMilesQty||10000,Q=q(qty);if(!Q)return null;
    var pt={tag:'',h1:'',p:'',note:'',small:''};try{if(window.kgmBuyPromoTextR928)pt=window.kgmBuyPromoTextR928(Q,zh)||pt}catch(_){}
    var sec='';try{var m=String(prevHtml||'').match(/<div class="buy-note0815">([\s\S]*?)<\/div>/g);if(m&&m.length)sec=m[m.length-1].replace(/^<div class="buy-note0815">|<\/div>$/g,'')}catch(_){}
    var cards=PK.map(function(n){var x=q(n);if(!x)return '';var on=n===qty;return '<button type="button" class="mh120-pk'+(on?' on':'')+'" onclick="buyMilesSelect0815('+n+')"><b>'+n.toLocaleString()+'<i> mi</i></b>'+(x.bonus?'<em>+'+x.bonus.toLocaleString()+' '+(zh?'加贈':'bonus')+'</em>':'<em class="no">&nbsp;</em>')+'<span>USD '+U(x.usd)+'</span><small>'+(zh?'每千哩 ':'per 1,000 · ')+'USD '+U(x.usd/((x.qty+x.bonus)/1000))+'</small></button>'}).join('');
    var opts='';for(var n=1000;n<=50000;n+=1000){var x=q(n);if(!x)continue;opts+='<option value="'+n+'"'+(n===qty?' selected':'')+'>'+n.toLocaleString()+(x.bonus?' + '+x.bonus.toLocaleString():'')+' mi · USD '+U(x.usd)+'</option>'}
    var tiers=(Q.tiers||[]).length?'<div class="mh120-tiers">'+Q.tiers.map(function(t){return '<span><b>'+t.bonus+'%</b> '+(zh?'加贈':'bonus')+' · '+Number(t.min).toLocaleString()+'+ mi</span>'}).join('')+'</div>':'';
    return '<main class="mh120 mh120-buy"><button type="button" class="mh120-back" onclick="S.milesTab=\'overview\';render()">← '+(zh?'無限萬里遊':'KGM Miles')+'</button>'
      +'<section class="mh120-bh"><span class="mh120-eye">KGM MILES · '+(zh?'購買里程':'BUY MILES')+'</span><h1>'+(pt.h1||(zh?'購買里程，離下一趟旅程更近':'Top up your miles'))+'</h1>'+(pt.p?'<p>'+pt.p+'</p>':'')+tiers+'</section>'
      +'<section class="mh120-bg"><div class="mh120-bl"><h2>'+E(((u.firstName||u.name||'Explorer')+'').split(' ')[0])+(zh?'，選擇要購買的里程':', choose an amount')+'</h2><div class="mh120-pks">'+cards+'</div>'
        +'<label class="mh120-other"><span>'+(zh?'其他數量（每 1,000 哩一格，最多 50,000 哩）':'Other amount (1,000-mile steps, up to 50,000)')+'</span><select class="inp" onchange="buyMilesSelect0815(this.value)">'+opts+'</select></label>'
        +(pt.note?'<p class="mh120-fine">'+pt.note+'</p>':'')+'</div>'
        +'<aside class="mh120-sum"><h3>'+(zh?'本次購買':'Your order')+'</h3><div><span>'+(zh?'購買里程':'Miles')+'</span><b>'+Q.qty.toLocaleString()+'</b></div><div><span>'+(zh?'加贈里程':'Bonus')+'</span><b>'+(Q.bonus?'+'+Q.bonus.toLocaleString():'—')+'</b></div><div class="t"><span>'+(zh?'入帳總里程':'Total credited')+'</span><b>'+Q.totalMiles.toLocaleString()+' mi</b></div>'
        +'<div class="p"><span>'+(zh?'金額':'Total')+'</span><b>USD '+U(Q.usd)+'</b></div><button type="button" class="btn btn-g mh120-pay" onclick="doPointsBuyMiles()">'+(zh?'立即付款':'Pay now')+'</button>'
        +(sec?'<p class="mh120-sec">'+sec+'</p>':'')+(pt.small?'<small>'+pt.small+'</small>':'')+'</aside></section></main>'}
  function wrap(){var O=window.milesPageView;try{if(typeof milesPageView==='function'&&milesPageView!==O)O=milesPageView}catch(_){}
    if(typeof O!=='function'||O.__mh120)return;
    var w=function(){var t=String(S.milesTab||'overview');
      try{if(t==='overview'&&!S.upgResR27&&!S.upgAskR28&&!S.milesPurchaseSuccess0809D)return hub();
        if((t==='buymiles'||t==='buy')&&!S.milesPurchaseSuccess0809D&&S.user){var h0='';try{h0=String(buyMilesPointsUI())}catch(_){}var b=buy(h0);if(b)return b}}catch(e){try{console.warn('mh120',e)}catch(_){}}
      return O.apply(this,arguments)};
    w.__mh120=1;window.milesPageView=w;try{milesPageView=w}catch(_){}}
  wrap();[0,1500,5000].forEach(function(t){setTimeout(wrap,t)});
  var CSS='.mh120{max-width:1180px;margin:0 auto;padding:30px 32px 56px;color:#0F2A21}.mh120-eye{font-size:11px;letter-spacing:.22em;font-weight:800;color:#8A7444}'
    +'.mh120-hero{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:36px;align-items:center;padding:8px 0 28px;border-bottom:1px solid #E7E0D0}'
    +'.mh120-hl h1{font-family:Georgia,"Noto Serif TC",serif;font-size:44px;line-height:1.15;margin:12px 0 12px;color:#0B3D2E;font-weight:700}.mh120-hl p{font-size:15px;line-height:1.8;color:#5B6660;max-width:520px;margin:0}'
    +'.mh120-card{position:relative;border-radius:22px;padding:24px 26px;background:linear-gradient(135deg,#0B3D2E 0%,#145740 60%,#1d6b51 100%);color:#fff;box-shadow:0 26px 50px -30px rgba(11,61,46,.8);overflow:hidden;min-height:210px;display:flex;flex-direction:column}'
    +'.mh120-card:after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;border:1px solid rgba(217,192,138,.35)}'
    +'.mh120-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}.mh120-card-top span{font-size:11px;letter-spacing:.24em;color:#D9C08A;font-weight:800}.mh120-card-top em{font-style:normal;font-size:12px;font-weight:800;padding:4px 12px;border-radius:999px;background:rgba(217,192,138,.18);color:#F3E3BE}'
    +'.mh120-card small{font-size:12px;color:#B9CFC6}.mh120-card>b{font-size:42px;font-weight:800;letter-spacing:-.01em;margin-top:2px}.mh120-card>b i{font-style:normal;font-size:16px;color:#B9CFC6;font-weight:600}'
    +'.mh120-card-ft{margin-top:auto;padding-top:18px;display:flex;justify-content:space-between;font-size:12.5px;color:#D7E5DF;letter-spacing:.04em}'
    +'.mh120-card.guest b.g{font-size:22px;margin:4px 0 6px}.mh120-card.guest p{font-size:13px;color:#C8DAD2;margin:0 0 16px;line-height:1.6}.mh120-card.guest .btn{align-self:flex-start;background:#C9A24F;border-color:#C9A24F;color:#0B2A20}'
    +'.mh120-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:28px 0 0}'
    +'.mh120-tile{position:relative;text-align:left;border:1px solid #E7E0D0;background:#fff;border-radius:20px;padding:22px 20px 20px;cursor:pointer;font-family:inherit;color:#0F2A21;display:flex;flex-direction:column;gap:4px;min-height:190px;transition:transform .18s,box-shadow .18s,border-color .18s}'
    +'.mh120-tile:hover{transform:translateY(-3px);box-shadow:0 22px 40px -30px rgba(11,61,46,.6);border-color:#CDBF9C}'
    +'.mh120-tile i{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#F3EFE4;margin-bottom:12px}.mh120-tile svg{width:22px;height:22px;fill:none;stroke:#0B3D2E;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'
    +'.mh120-tile small{font-size:10.5px;letter-spacing:.2em;color:#8A7444;font-weight:800}.mh120-tile b{font-size:19px}.mh120-tile span{font-size:13px;line-height:1.6;color:#6E7670}.mh120-tile em{font-style:normal;position:absolute;right:20px;top:22px;color:#B8AC8E;font-size:18px}'
    +'.mh120-more,.mh120-earn{margin-top:34px}.mh120-more h3,.mh120-earn h3{font-size:13px;letter-spacing:.14em;color:#8A7444;margin:0 0 12px;font-weight:800}'
    +'.mh120-more>div{display:flex;gap:12px;flex-wrap:wrap}.mh120-more button{display:flex;align-items:center;gap:12px;border:1px solid #E7E0D0;background:#fff;border-radius:16px;padding:12px 18px 12px 12px;cursor:pointer;font-family:inherit;text-align:left}.mh120-more button i{width:38px;height:38px;border-radius:12px;background:#F3EFE4;display:grid;place-items:center}.mh120-more svg{width:20px;height:20px;fill:none;stroke:#0B3D2E;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.mh120-more b{display:block;font-size:14px;color:#0F2A21}.mh120-more small{font-size:12px;color:#6E7670}'
    +'.mh120-earn>div{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid #E7E0D0;border-radius:20px;background:#FBF9F4;overflow:hidden}.mh120-earn article{padding:18px 20px;border-left:1px solid #EDE6D6;display:flex;flex-direction:column;gap:4px}.mh120-earn article:first-child{border-left:0}.mh120-earn article i{font-style:normal;font-size:11px;font-weight:800;color:#C9A24F;letter-spacing:.1em}.mh120-earn article b{font-size:15px}.mh120-earn article span{font-size:12.5px;color:#6E7670;line-height:1.6}'
    /* 購買 */
    +'.mh120-back{border:0;background:none;color:#0B3D2E;font-weight:700;font-size:13.5px;cursor:pointer;padding:0;margin-bottom:14px;font-family:inherit}'
    +'.mh120-bh{padding:4px 0 22px;border-bottom:1px solid #E7E0D0}.mh120-bh h1{font-family:Georgia,"Noto Serif TC",serif;font-size:38px;color:#0B3D2E;margin:10px 0 8px;line-height:1.2}.mh120-bh p{font-size:14.5px;color:#5B6660;margin:0;line-height:1.7}'
    +'.mh120-tiers{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.mh120-tiers span{padding:6px 12px;border-radius:999px;background:#F3EFE4;font-size:12.5px;color:#5C4A1E}.mh120-tiers b{color:#0B3D2E}'
    +'.mh120-bg{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:28px;margin-top:26px;align-items:start}.mh120-bl h2{font-size:20px;margin:0 0 14px;color:#0F2A21}'
    +'.mh120-pks{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.mh120-pk{border:1px solid #E1DACA;background:#fff;border-radius:16px;padding:16px 12px;cursor:pointer;font-family:inherit;text-align:left;display:flex;flex-direction:column;gap:3px;color:#0F2A21;transition:border-color .15s,box-shadow .15s}'
    +'.mh120-pk:hover{border-color:#C9B98F}.mh120-pk.on{border-color:#0B3D2E;box-shadow:0 0 0 1.5px #0B3D2E inset;background:#F6FAF8}.mh120-pk b{font-size:20px}.mh120-pk b i{font-style:normal;font-size:12px;color:#6E7670}.mh120-pk em{font-style:normal;font-size:12px;font-weight:800;color:#1f7a55}.mh120-pk em.no{visibility:hidden}.mh120-pk span{font-size:14px;font-weight:700;margin-top:6px}.mh120-pk small{font-size:11px;color:#8b958f}'
    +'.mh120-other{display:flex;flex-direction:column;gap:6px;margin-top:18px;max-width:420px}.mh120-other span{font-size:12px;color:#6E7670;font-weight:700}.mh120-fine{font-size:12px;color:#6E7670;margin:14px 0 0;line-height:1.7}'
    +'.mh120-sum{position:sticky;top:90px;border:1px solid #E7E0D0;border-radius:20px;background:#fff;padding:22px;box-shadow:0 22px 44px -36px rgba(11,61,46,.55)}.mh120-sum h3{margin:0 0 12px;font-size:13px;letter-spacing:.14em;color:#8A7444}'
    +'.mh120-sum>div{display:flex;justify-content:space-between;padding:9px 0;border-top:1px solid #F1ECE0;font-size:14px;color:#33413a}.mh120-sum>div.t b{color:#0B3D2E}.mh120-sum>div.p{border-top:1px solid #E1DACA;padding-top:12px;margin-top:4px}.mh120-sum>div.p b{font-size:22px;color:#0B3D2E}'
    +'.mh120-pay{width:100%;margin-top:14px;height:48px;font-size:15px}.mh120-sec{font-size:12px;color:#6B5A2E;background:#FFF8EA;border:1px solid #EAD9B4;border-radius:12px;padding:10px 12px;line-height:1.6;margin:14px 0 0}.mh120-sum small{display:block;font-size:11.5px;color:#8b958f;margin-top:10px}'
    +'@media(max-width:1000px){.mh120-hero{grid-template-columns:1fr}.mh120-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.mh120-earn>div{grid-template-columns:repeat(2,minmax(0,1fr))}.mh120-earn article:nth-child(3){border-left:0}.mh120-earn article:nth-child(n+3){border-top:1px solid #EDE6D6}.mh120-bg{grid-template-columns:1fr}.mh120-sum{position:static}.mh120-pks{grid-template-columns:repeat(3,minmax(0,1fr))}}'
    +'@media(max-width:640px){.mh120{padding:18px 16px 110px}.mh120-hl h1{font-size:30px}.mh120-bh h1{font-size:28px}.mh120-tiles{grid-template-columns:1fr;gap:10px}.mh120-tile{min-height:0;padding:16px 16px 16px 72px}.mh120-tile i{position:absolute;left:16px;top:18px;margin:0}.mh120-earn>div{grid-template-columns:1fr}.mh120-earn article{border-left:0!important;border-top:1px solid #EDE6D6}.mh120-earn article:first-child{border-top:0}.mh120-pks{grid-template-columns:repeat(2,minmax(0,1fr))}.mh120-pk:last-child:nth-child(odd){grid-column:1/-1}.mh120-card>b{font-size:34px}}';
  try{var st=document.createElement('style');st.id='mh120-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();
