    /* 1004B：查詢類與組員班表 */
    if(/(沒處理|未處理|還沒處理|待處理|待審|待辦|待核|pending|to-?do)/i.test(t)||(/案件|申請|審查|審核/.test(t)&&/有沒有|還有|多少|哪些|幾件|嗎|\?|？/.test(t)))return [{tool:'pending_overview'}];
    var crIds=(t.toUpperCase().match(/\b[A-Z]\d{5,6}\b/g)||[]);
    if(/(恢復).*(班表|班)/.test(t))return [{tool:'crew_restore',args:{empId:crIds[0]||''}}];
    if(/(移除|拿掉|取消|停飛).*(班表|班)/.test(t)&&!/規則/.test(t)){
      if(!crIds.length&&/哪些|列出|目前/.test(t))return [{tool:'crew_off_list'}];
      var crR=rangeOf(t),crW=(/(?:原因|因為|理由)[:：]?\s*([^，,。）)]+)/.exec(t)||[])[1]||((/[（(]([^）)]+)[）)]/.exec(t)||[])[1])||'';
      return [{tool:'crew_remove',args:{empId:crIds[0]||'',from:crR.from,to:crR.to,reason:crW.trim()}}];
    }
    if(/(排班更新|重新排班|重排班表|立即重算)/.test(t))return [{tool:'crew_update'}];
    var sx=/\b(KX\s?\d{1,4})\b/i.exec(t);if(sx&&/員工票|staff/i.test(t)&&/(剩|位|座位|空位|seats?)/i.test(t))return [{tool:'stx_seats',args:{code:sx[1].replace(/\s+/g,'').toUpperCase(),date:dateOf(t)||T()}}];
    var gt=/(?:打開|開啟|前往|帶我去|切到|切換到|go to|open)\s*「?([^」\s]+)」?/i.exec(t);if(gt&&!/後台\s*AI/.test(t))return [{tool:'go_tab',args:{tab:gt[1].replace(/(分頁|頁面|頁)$/,'')}}];
