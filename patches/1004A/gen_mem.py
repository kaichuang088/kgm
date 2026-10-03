import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='''/* 1004A · 會員管理：排序＋篩選、表格直接停權／恢復／移除；停權帳號不能登入 */
'''
R('#76 filter+sort','''  var us=(S.users||[]).filter(function(u){
    if(!q)return true;
    return [u.email,u.name,u.id,u.phone].filter(Boolean).some(function(v){return String(v).toLowerCase().indexOf(q)>=0;});
  });''','''  var us=(S.users||[]).filter(function(u){
    if(!q)return true;
    return [u.email,u.name,u.id,u.phone].filter(Boolean).some(function(v){return String(v).toLowerCase().indexOf(q)>=0;});
  });
  /* 1004A：使用者「會員管理要可以選擇 Order 並用 Filter，然後表格要可以直接停權或移除某個帳戶」 */
  var lvOf929=function(u){return String(u.level||u.tier||'')},lvs929=[];(S.users||[]).forEach(function(u){var l=lvOf929(u);if(l&&lvs929.indexOf(l)<0)lvs929.push(l)});
  if(S._accLvR929)us=us.filter(function(u){return lvOf929(u)===S._accLvR929});
  if(S._accStR929)us=us.filter(function(u){return S._accStR929==='suspended'?!!u.suspended:!u.suspended});
  var LVR929={Bronze:1,Silver:2,Gold:3,Platinum:4,Diamond:5,Emerald:6},srt929=S._accSortR929||'id';
  var regOf929=function(u){return String(u.regDate||u.created||u.joined||'')};
  us=us.slice().sort(function(a,b){
    if(srt929==='name')return String(a.name||'').localeCompare(String(b.name||''));
    if(srt929==='tier')return (LVR929[lvOf929(b)]||0)-(LVR929[lvOf929(a)]||0)||String(a.id).localeCompare(String(b.id));
    if(srt929==='miles_desc')return (+b.miles||0)-(+a.miles||0);
    if(srt929==='miles_asc')return (+a.miles||0)-(+b.miles||0);
    if(srt929==='reg')return regOf929(b).localeCompare(regOf929(a));
    if(srt929==='status')return (b.suspended?1:0)-(a.suspended?1:0)||String(a.id).localeCompare(String(b.id));
    return String(a.id).localeCompare(String(b.id));
  });
  var canAct929=true;try{canAct929=typeof window.kgmPermR123!=='function'||window.kgmPermR123('members')==='use'}catch(_){}''')
R('#76 controls','''      +'<span class="chip chip-mut">'+us.length+' / '+((S.users||[]).length)+'</span>''','''      +'<div><div style="font-size:10.5px;color:#667;margin-bottom:3px">'+(Z?'排序':'Order')+'</div><select class="inp" style="height:32px" onchange="S._accSortR929=this.value;render()">'
        +[['id',Z?'會員號':'Member no.'],['name',Z?'姓名':'Name'],['tier',Z?'等級（高→低）':'Tier (high→low)'],['miles_desc',Z?'哩程（多→少）':'Miles (high→low)'],['miles_asc',Z?'哩程（少→多）':'Miles (low→high)'],['reg',Z?'註冊日（新→舊）':'Joined (newest)'],['status',Z?'停權的排前面':'Suspended first']]
          .map(function(o){return '<option value="'+o[0]+'"'+(srt929===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>'
      +'<div><div style="font-size:10.5px;color:#667;margin-bottom:3px">'+(Z?'等級':'Tier')+'</div><select class="inp" style="height:32px" onchange="S._accLvR929=this.value;render()"><option value="">'+(Z?'全部':'All')+'</option>'
        +lvs929.map(function(l){return '<option'+(S._accLvR929===l?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select></div>'
      +'<div><div style="font-size:10.5px;color:#667;margin-bottom:3px">'+(Z?'狀態':'Status')+'</div><select class="inp" style="height:32px" onchange="S._accStR929=this.value;render()">'
        +[['',Z?'全部':'All'],['active',Z?'正常':'Active'],['suspended',Z?'已停權':'Suspended']].map(function(o){return '<option value="'+o[0]+'"'+((S._accStR929||'')===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>'
      +'<span class="chip chip-mut">'+us.length+' / '+((S.users||[]).length)+'</span>''')
R('#76 header','''Z?"\\u751f\\u65e5":"DOB",Z?"\\u96fb\\u8a71":"PHONE",Z?"\\u570b\\u7c4d":"NAT",Z?"\\u7b49\\u7d1a":"TIER",Z?"\\u54e9\\u7a0b":"MILES"]''','''Z?"\\u751f\\u65e5":"DOB",Z?"\\u96fb\\u8a71":"PHONE",Z?"\\u570b\\u7c4d":"NAT",Z?"\\u7b49\\u7d1a":"TIER",Z?"\\u54e9\\u7a0b":"MILES",Z?"狀態":"STATUS",Z?"操作":"ACTION"]''')
R('#76 row','''+cell(u.dob)+cell(u.phone)+cell(u.nat)+cell(u.level||u.tier)+cell((u.miles||0).toLocaleString())+'</tr>';''','''+cell(u.dob)+cell(u.phone)+cell(u.nat)+cell(u.level||u.tier)+cell((u.miles||0).toLocaleString())
        +'<td style="padding:6px 9px;border-bottom:1px solid var(--border);white-space:nowrap">'+(u.suspended?'<span class="chip" style="background:#fdecec;color:#a61b1b">'+(Z?'已停權':'Suspended')+'</span>'+(u.suspendedAt?'<div style="font-size:9.5px;color:#999;margin-top:2px">'+esc(String(u.suspendedAt).slice(0,10))+' '+esc(u.suspendedBy||'')+'</div>':''):'<span class="chip chip-ok">'+(Z?'正常':'Active')+'</span>')+'</td>'
        +'<td style="padding:6px 9px;border-bottom:1px solid var(--border);white-space:nowrap">'+(canAct929
          ?('<button class="btn btn-sm" style="padding:2px 8px;font-size:10.5px" onclick="kgmAccSuspendR929(\\''+esc(u.id)+'\\','+(u.suspended?'false':'true')+')">'+(u.suspended?(Z?'恢復':'Restore'):(Z?'停權':'Suspend'))+'</button> '
            +'<button class="btn btn-sm" style="padding:2px 8px;font-size:10.5px;color:#a61b1b;border-color:#e7b3b3" onclick="kgmAccRemoveR929(\\''+esc(u.id)+'\\')">'+(Z?'移除':'Remove')+'</button>')
          :'<span style="color:#aaa;font-size:10.5px">'+(Z?'僅檢視':'View only')+'</span>')+'</td></tr>';''')
R('#76 fns','''function accToggle(id){''','''/* 1004A：停權／恢復／移除會員帳號（需要「會員管理」使用權限；都寫入操作紀錄） */
window.kgmAccSuspendR929=function(id,on){
  var Z=LANG!=="en",u=(S.users||[]).filter(function(x){return x&&x.id===id})[0];if(!u)return;
  try{if(typeof window.kgmPermR123==='function'&&window.kgmPermR123('members')!=='use'){alert(Z?'無權限':'No permission');return}}catch(_){}
  if(on&&!confirm((Z?'確定停權 ':'Suspend ')+u.id+' '+(u.name||'')+(Z?'？停權後無法登入，已訂的行程不受影響。':'? The member will not be able to sign in.')))return;
  u.suspended=!!on;u.suspendedAt=on?new Date().toISOString():'';u.suspendedBy=on?((S.adminUser||{}).empId||''):'';
  if(on&&S.user&&S.user.id===u.id)S.user=null;
  try{logAct(on?(Z?'停權會員':'Suspend member'):(Z?'恢復會員':'Restore member'),u.id)}catch(_){}
  try{save()}catch(_){}render();
};
window.kgmAccRemoveR929=function(id){
  var Z=LANG!=="en",i=(S.users||[]).findIndex(function(x){return x&&x.id===id});if(i<0)return;var u=S.users[i];
  try{if(typeof window.kgmPermR123==='function'&&window.kgmPermR123('members')!=='use'){alert(Z?'無權限':'No permission');return}}catch(_){}
  var nb=(S.bookings||[]).filter(function(b){return b&&(b.userId===u.id||b.memberId===u.id)}).length;
  if(!confirm((Z?'確定移除帳號 ':'Remove account ')+u.id+' '+(u.name||'')+'？'+(Z?('此動作無法復原'+(nb?('；名下 '+nb+' 筆訂位會保留，只是不再連到會員帳號'):'')+'。'):' This cannot be undone.')))return;
  S.users.splice(i,1);if(S.user&&S.user.id===u.id)S.user=null;
  S.removedUsersR929=S.removedUsersR929||[];S.removedUsersR929.push({id:u.id,name:u.name||'',email:u.email||'',at:new Date().toISOString(),by:(S.adminUser||{}).empId||''});
  try{logAct(Z?'移除會員帳號':'Remove member',u.id+' '+(u.email||''))}catch(_){}
  try{save()}catch(_){}render();
};
function accToggle(id){''')
R('#76 login block','''  if(!u){S.authErr=LANG==="en"?"Incorrect ID or password":"帳號或密碼錯誤。";render();return;}''','''  if(!u){S.authErr=LANG==="en"?"Incorrect ID or password":"帳號或密碼錯誤。";render();return;}
  if(u.suspended){S.authErr=LANG==="en"?"This account has been suspended. Please contact KGM customer service.":"此帳號已停權，請聯絡 KGM 客服。";render();return;}   /* 1004A：後台停權的帳號不能登入 */''')
open('p_f_mem.js','w').write(hdr+'\n'.join(out)+'\n')
