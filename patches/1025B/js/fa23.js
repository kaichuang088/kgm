    /* 1023A：票價調整頁重排（使用者：「圖一太亂了吧」）—— 分成 ①航線 ②艙等與訂位代號 ③期間與幅度 ④預覽；欄位 id 不變（kgmFareAdjAddR1022A 照舊讀），
       加快捷幅度與「這一條航線下一班的實際票價 → 調整後」試算（owPrice＝訂票頁同一個價格） */
    var fam23={Basic:z()?'基本':'Basic',Value:z()?'超值':'Value',Deluxe:z()?'豪華':'Deluxe'};
    var rng23=[[all[0],all[all.length-1],z()?'整個'+cz(o.cab):'Whole cabin']].concat((function(){var fam={},out=[];all.forEach(function(c){var f=(FARES[c]||{}).familyR48||'';if(!f)return;(fam[f]=fam[f]||[]).push(c)});Object.keys(fam).forEach(function(f){var L=fam[f];out.push([L[0],L[L.length-1],(fam23[f]||f)+' '+L[0]+'～'+L[L.length-1]])});return out})());
    var smp23=(function(){var out=[];try{var f0=null,d0='';for(var i=1;i<=21&&!f0;i++){var d=D(td,i);allF().forEach(function(f){if(f0||!f||f.partner||f.via||f.fr!==q.fr||f.to!==q.to)return;try{if(flyOn(f,new Date(d+'T12:00:00'))){f0=f;d0=d}}catch(_){}})}
      if(!f0)return out;var fd=Object.assign({},f0,{date:d0}),cl=o.cab&&all.length?[c1,c2].filter(function(x,i,a){return x&&a.indexOf(x)===i}):(function(){var L=[];['Economy','Premium','Business','First'].forEach(function(c){var k=codesOf(c);if(k.length)L.push(k[0])});return L})();
      cl.forEach(function(c){var v=0;try{v=Math.round(owPrice(fd,c,1)||0)}catch(_){}if(v>0)out.push({f:f0.code,d:d0,c:c,v:v})})}catch(_){}return out})();
    var step=function(n,t,body){return '<section class="fa23-step"><div class="fa23-n">'+n+'</div><div class="fa23-b"><h4>'+t+'</h4>'+body+'</div></section>'};
    var form=ed?('<div class="fa23">'
      +step('1',z()?'航線':'Route','<div class="fa23-row">'
        +'<label>'+(z()?'出發地':'From')+sel('fa22Fr',Object.keys(aps).sort().map(function(a){return [a,lab(a)]}),q.fr,"kgmFareAnaSetR1004B('fr',this.value)")+'</label>'
        +'<label>'+(z()?'目的地':'To')+sel('fa22To',tos.map(function(a){return [a,lab(a)]}),q.to,"kgmFareAnaSetR1004B('to',this.value)")+'</label>'
        +'<label>'+(z()?'方向':'Direction')+sel('fa22Dir',[['one',(z()?'單向 ':'One way ')+q.fr+' → '+q.to],['both',z()?'雙向（去回都調）':'Both ways']],'one')+'</label>'
        +'<label>'+(z()?'班號':'Flight')+sel('fa22Code',[['',z()?'整條航線（所有班號）':'Whole route']].concat(codes.sort(function(a,b){return a.localeCompare(b,undefined,{numeric:true})}).map(function(c){return [c,c]})),'')+'</label></div>')
      +step('2',z()?'艙等與訂位代號':'Cabin & fare classes','<div class="fa23-row">'
        +'<label>'+(z()?'艙等':'Cabin')+sel('fa22Cab',[['',z()?'全部艙等':'All cabins']].concat(Object.keys(CZ22).map(function(c){return [c,cz(c)]})),o.cab||'',"kgmFareAdjSetR1022A('cab',this.value)")+'</label>'
        +(o.cab&&all.length?('<div class="fa23-chips">'+rng23.map(function(x){var on=x[0]===c1&&x[1]===c2;return '<button type="button" class="'+(on?'on':'')+'" onclick="S._fadjR1022A.c1=\''+E(x[0])+'\';S._fadjR1022A.c2=\''+E(x[1])+'\';render()">'+E(x[2])+'</button>'}).join('')+'</div>'):'<p class="fa23-hint">'+(z()?'不選艙等＝所有艙等一起調；選了艙等可以只調其中一段訂位代號。':'Pick a cabin to limit to some fare classes.')+'</p>')
        +'</div>'
        +(o.cab&&all.length?('<details class="fa23-more"'+(rng23.some(function(x){return x[0]===c1&&x[1]===c2})?'':' open')+'><summary>'+(z()?'自訂代號範圍':'Custom class range')+'（'+E(c1+'～'+c2)+'）</summary><div class="fa23-row">'
          +'<label>'+(z()?'從':'From')+sel('fa22C1',all.map(function(c){return [c,c]}),c1,"kgmFareAdjSetR1022A('c1',this.value)")+'</label>'
          +'<label>'+(z()?'到':'To')+sel('fa22C2',all.map(function(c){return [c,c]}),c2,"kgmFareAdjSetR1022A('c2',this.value)")+'</label></div></details>'):''))
      +step('3',z()?'期間與幅度':'Dates & change','<div class="fa23-row">'
        +'<label>'+(z()?'航班日期從':'Flights from')+'<input id="fa22From" type="date" class="inp" value="'+E(S._fa23From||td)+'" onchange="S._fa23From=this.value"></label>'
        +'<label>'+(z()?'到':'to')+'<input id="fa22Until" type="date" class="inp" value="'+E(S._fa23Until||D(td,30))+'" onchange="S._fa23Until=this.value"></label>'
        +'<label>'+(z()?'調整（%）':'Change (%)')+'<input id="fa22Pct" type="number" step="1" class="inp" placeholder="+10 / -15" value="'+E(S._fa23Pct||'')+'" oninput="S._fa23Pct=this.value;kgmFa23PrevR1023A()"></label>'
        +'<div class="fa23-quick">'+[-20,-10,-5,5,10,20].map(function(v){return '<button type="button" class="'+(v<0?'dn':'up')+'" onclick="var e=document.getElementById(\'fa22Pct\');e.value='+v+';S._fa23Pct=\''+v+'\';kgmFa23PrevR1023A()">'+(v>0?'+':'')+v+'%</button>'}).join('')+'</div></div>'
        +'<label class="fa23-note">'+(z()?'原因（寫入動作歷史）':'Reason')+'<input id="fa22Note" class="inp" value="'+E(S._fa23Note||'')+'" oninput="S._fa23Note=this.value" placeholder="'+(z()?'例：競爭對手降價、包機需求、連假提早漲':'')+'"></label>')
      +step('4',z()?'預覽並套用':'Preview & apply','<p class="fa23-sum">'+(z()?'將套用：':'Will apply: ')+'<b>'+E(q.fr+' → '+q.to)+'</b> · <b>'+E(cz(o.cab))+(o.cab&&all.length?(' '+(c1===all[0]&&c2===all[all.length-1]?(z()?'全部代號 ':'all classes ')+all[0]+'～'+all[all.length-1]:c1+'～'+c2)):'')+'</b>'+(z()?'；系統（營收管理）票價再乘上這個幅度，只在期間內有效。':'')+'</p>'
        +(smp23.length?('<div class="fa23-prev">'+smp23.map(function(x){return '<div><small>'+E(x.f+' · '+x.d.slice(5)+' · '+x.c)+'</small><span>NT$'+x.v.toLocaleString()+'</span><i>→</i><b data-fa23="'+x.v+'"'+(+S._fa23Pct?' style="color:'+(+S._fa23Pct>0?'#9b2c1c':'#145c38')+'"':'')+'>'+(+S._fa23Pct?'NT$'+Math.round(x.v*(1+S._fa23Pct/100)).toLocaleString():'—')+'</b></div>'}).join('')+'</div><p class="fa23-hint">'+(z()?'以這條航線三週內最近一班的目前票價試算（已含生效中的人工調整）。':'Sample: next flight’s current fare.')+'</p>'):'')
        +((o.cab&&all.length&&!(c1===all[0]&&c2===all[all.length-1]))?('<p class="fa23-warn">'+(z()?'只調一段代號時，調高可能讓這一段比後面的代號還貴（階梯倒掛），請到「票價分析」的艙位階梯確認。':'Raising part of a ladder can invert it; check Fare analysis.')+'</p>'):'')
        +'<button class="btn btn-g fa22-go" onclick="kgmFareAdjAddR1022A()">'+(z()?'套用':'Apply')+'</button>')
      +'</div>')
