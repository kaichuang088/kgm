    /* 1012A：轉機航班跟直飛用同一個版型（使用者：「轉機航班顯示方式有可能跟KGM的組合一樣嗎 這樣不好看」）
       原本轉機是一張一張獨立的卡片（標題、最低價放右上角、按鈕在最下面），直飛是表格「航班｜票價起」兩欄。
       改成同一張表、同一種兩欄列：左欄上下兩段航班（時間、機場、航程時間、機型／聯營）中間夾轉機資訊，
       右欄跟直飛一樣是艙等標籤、去程起、價格與「選擇票價」。票價卡、選擇、住宿標示的資料流都照舊。
       哩程酬賓模式沿用原本的轉機卡（整列一格）。 */
    (function(){
      function zh(){try{return LANG!=='en'}catch(_){return true}}
      function selCab(f1,f2,pax){
        var order=(typeof CAB_ORDER!=='undefined'&&CAB_ORDER)||['Economy','Premium','Business','First'];
        var i0=Math.max(0,order.indexOf((S.search&&S.search.cabin)||'Economy'));
        var v1=[],v2=[];try{v1=validCodes(f1)||[];v2=validCodes(f2)||[]}catch(_){}
        for(var i=i0;i<order.length;i++){
          var cs=CAB_CODES(order[i]).filter(function(k){return k!=='R'&&v1.indexOf(k)>=0});
          if(!cs.length)continue;
          var best=null;cs.forEach(function(k){var p=Math.round(owPrice(f1,k,pax)*0.88)+Math.round(owPrice(f2,k,pax)*0.88);if(best===null||p<best)best=p});
          return {cab:order[i],p:best};
        }
        return {cab:order[i0],p:null};
      }
      function leg(f,dH,ac){
        return '<div style="display:flex;align-items:center;gap:18px;max-width:640px">'   /* 1012A：太密 → 字級降一級、每段之間留白、時間軸限寬 */
          +'<div style="flex:0 0 auto;min-width:64px;font-size:11px;font-weight:800;color:var(--g)">'+f.code+'</div>'
          +'<div style="text-align:center;min-width:52px"><div style="font-size:19px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.01em">'+f.dep+'</div>'
            +'<div style="font-size:10px;color:var(--sub);letter-spacing:.08em;margin-top:3px">'+f.fr+'</div></div>'
          +'<div style="flex:1;text-align:center;padding:0 2px;min-width:76px"><div style="font-size:10px;color:var(--sub)">'+durStr(f.dur)+'</div>'
            +'<div style="position:relative;height:12px;margin:4px 0"><div style="position:absolute;top:5px;left:0;right:0;height:1.5px;background:var(--border)"></div>'
              +'<div style="position:absolute;top:2px;left:0;width:6px;height:6px;border-radius:50%;background:var(--g)"></div>'
              +'<div style="position:absolute;top:-1px;right:-1px;color:var(--g);font-size:11px;line-height:1">&#9654;</div></div>'
            +'<div style="font-size:9.5px;color:var(--sub);letter-spacing:.04em">'+ac+'</div></div>'
          +'<div style="text-align:center;min-width:52px"><div style="font-size:19px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.01em">'+f.arr+dH+'</div>'
            +'<div style="font-size:10px;color:var(--sub);letter-spacing:.08em;margin-top:3px">'+f.to+'</div></div>'
        +'</div>';
      }
      window.kgmConnRowR1012A=function(cn,cIdx,dir,curr2,pax){
        var Z=zh(),f1=cn.f1,f2=cn.f2,hub=cn.hub;
        if(S.search&&S.search.useMiles&&S.user)return '<tr><td colspan="2" style="padding:12px 14px;border-bottom:1px solid var(--border)">'+renderConnCard(cn,cIdx,dir,curr2,pax)+'</td></tr>';
        var oc12=String(dir+'-'+cIdx+'-'+f1.code+'-'+f1.dep+'-'+f2.code+'-'+f2.dep+'-'+(f1.date||'')).replace(/[^\w-]/g,''),op12=S.openConnR1012A===oc12;
        var fareRows='';if(op12){S._renderConnDir0809C=dir;try{fareRows=connFareGrid(cn,cIdx,dir,curr2,pax)}finally{S._renderConnDir0809C=''}}
        var hi=null;try{hi=layoverHotelInfoFor(Object.assign({},f1,{isConn:true,connF2:f2,connLayover:cn.layover,via:hub}),'O')}catch(_){}
        var sc=selCab(f1,f2,pax),cab=sc.cab;
        var chip='<span style="display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.06em;color:'+CAB_COLOR(cab)+';background:'+CAB_BG(cab)+';border:1px solid var(--border);padding:2px 8px;border-radius:999px">'+CAB_NM(cab)+'</span>';
        var dateNote=cn.depDateNote?'<div style="font-size:10px;background:#fef9c3;color:#92400e;padding:3px 8px;border-radius:6px;margin:0 0 8px;display:inline-block">'+CITY(f1.fr)+(Z?' 出發建議：':' departure: ')+'<b>'+cn.depDateNote+'</b></div>':'';
        var xfer='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 10px 22px;padding:12px 0 12px 32px;border-left:2px dotted #c9d3ce">'   /* 轉機資訊：不加框，左側虛線連接兩段 */
          +'<span style="font-size:10.5px;color:var(--sub);letter-spacing:.03em">'+(Z?'轉機時間 ':'Layover ')+'<b style="color:var(--ink)">'+cn.layoverStr+'</b> · '+CITY(hub)+' ('+hub+')</span>'
          +((hi&&hi.qualifies)?'<span style="font-size:9.5px;font-weight:800;letter-spacing:.05em;color:#7c4a03;background:var(--goldsoft);border:1px solid var(--gold);padding:2px 9px;border-radius:999px">\u{1F3E8} '+(Z?'免費住宿 1 晚':'FREE HOTEL · 1 NIGHT')+'</span>':'')
          +'</div>';
        var tog="event.stopPropagation();S.openConnR1012A=(S.openConnR1012A==='"+oc12+"'?null:'"+oc12+"');render()";
        return '<tr class="k12c-row">'
          +'<td style="padding:24px 26px 26px;min-width:230px;border-bottom:1px solid #e3e8e5;vertical-align:middle;background:#fff">'
            +'<div style="font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:16px">'
              +(Z?('經 '+CITY(hub)+' 轉機 · 總時長 '+cn.totalStr):('1 stop via '+CITY(hub)+' · total '+cn.totalStr))+'</div>'
            +dateNote
            +leg(f1,_ddSup(f1,f1&&f1.date),acftNameOf(f1))
            +xfer
            +leg(f2,_ddSup(f2,f2&&f2.date),acftNameOf(f2))
          +'</td>'
          +'<td style="padding:24px 26px;vertical-align:middle;min-width:180px;width:37%;border-bottom:1px solid #e3e8e5;border-left:1px solid #eef2f0;background:#fbfcfb">'
            +'<div style="margin-bottom:9px">'+chip+'</div>'
            +'<div style="margin-bottom:10px"><div style="font-size:10px;color:var(--sub);margin-bottom:3px">'+(dir==='inb'?(Z?'回程起':'Return from'):(Z?'去程起':'Outbound from'))+'</div>'
              +'<div style="font-size:18px;font-weight:900;color:'+(sc.p!==null?'var(--gold)':'var(--red)')+';line-height:1">'+(sc.p!==null?fmtAmt(sc.p,curr2):(Z?'所選艙等售罄':'Selected cabin sold out'))+'</div>'
              +'<div style="font-size:9px;color:var(--sub)">'+(sc.p!==null?curr2:'')+'</div></div>'
            +'<button class="btn btn-sm '+(op12?'':'btn-g')+'" style="width:100%;letter-spacing:.02em" onclick="'+tog+'">'
              +(op12?(Z?'收起 ▲':'Close ▲'):(Z?'選擇票價 ▼':'Select fare ▼'))+'</button>'
          +'</td></tr>'
          +(op12?'<tr class="k12c-fp"><td colspan="2" style="padding:18px 18px 20px;background:linear-gradient(180deg,#fff,var(--light));border-bottom:1px solid var(--border)">'
            +'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border)">'   /* 跟直飛的票價面板同一個標題列 */
              +'<div><div style="font-family:Georgia,serif;font-size:15px;color:var(--g);font-weight:700">'+CAB_NM(cab)+'</div>'
                +'<div style="font-size:10.5px;color:var(--sub);margin-top:2px">'+f1.code+' + '+f2.code+' · '+CITY(f1.fr)+' → '+CITY(f2.to)+' · '+(pax||1)+(Z?' 位旅客':' passenger(s)')+'</div></div>'
              +'<div style="font-size:10px;color:var(--sub)">'+(Z?'只顯示搜尋時選定的艙等，不會改配其他艙等。':'Only the cabin selected in your search is shown.')+'</div></div>'
            +fareRows+'</td></tr>':'');
      };
      window.kgmConnTableR1012A=function(conns,nDirect,dir,curr2){
        var Z=zh(),th='padding:11px 18px;font-size:10px;font-weight:700;color:#fff;letter-spacing:.14em;text-transform:uppercase;border:none;text-align:left';
        var title=Z?(nDirect===0?'中轉航班（無直飛）':'亦可選擇：中轉'):(nDirect===0?'Connections (no direct available)':'Also available: connections');
        return '<div style="margin-top:16px;border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--sh1);background:#fff">'
          +'<table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--g)">'
            +'<th style="'+th+'">'+title+' ('+conns.length+')</th><th style="'+th+'">'+(Z?'票價起':'Fare from')+'</th></tr></thead><tbody>'
          +conns.map(function(cn,i){return window.kgmConnRowR1012A(cn,i,dir,curr2,S.search.pax)}).join('')
          +'</tbody></table></div>';
      };
    })();
