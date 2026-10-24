import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='/* 1004B · 前台／後台分檔與同步 */\n'
F="window.KGM_SIDE!=='front'&&"
R('front: AI admin cmd 1','  if(/管理員登入|管理员登入|管理員登錄|進入管理|管理後台|後台登入|管理登入|admin\\s*log\\s*in|admin\\s*login|adminlogin|adminlogon/i.test(msg)){',
  '  if('+F+'/管理員登入|管理员登入|管理員登錄|進入管理|管理後台|後台登入|管理登入|admin\\s*log\\s*in|admin\\s*login|adminlogin|adminlogon/i.test(msg)){')
R('front: AI admin cmd 2',"  if(/管理員登入|管理後台|後台登入|admin\\s*log\\s*in|admin\\s*login|adminlogin|adminlogon/i.test(t)){addI(",
  "  if("+F+"/管理員登入|管理後台|後台登入|admin\\s*log\\s*in|admin\\s*login|adminlogin|adminlogon/i.test(t)){addI(")
R('front: AI admin cmd 3',"if(/admin\\s*login|管理員登入|後台登入/i.test(t)){sayJ(","if("+F+"/admin\\s*login|管理員登入|後台登入/i.test(t)){sayJ(")
R('front: AI admin ask twice',"  if(!askedTwice140()){","  if(window.KGM_SIDE==='front'||!askedTwice140()){   /* 1004B：前台檔永遠進不了後台 */")
R('front: ctrl shift E',"    if(e.ctrlKey&&e.shiftKey&&(e.key==='E'||e.key==='e')){","    if("+F+"e.ctrlKey&&e.shiftKey&&(e.key==='E'||e.key==='e')){")
R('front: skip final year rebuild',"    if(window.KGM_ROT_FINAL_R913)return;\n    window.KGM_ROT_FINAL_R913=true;","    if(window.KGM_ROT_FINAL_R913)return;\n    if(window.KGM_SIDE==='front')return;   /* 1004B：前台不跑整年重排（只有後台用得到，實測獨佔主執行緒 30 秒以上） */\n    window.KGM_ROT_FINAL_R913=true;")
R('side engine',"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();\n\n</script>\n</body>",
  open('side.js',encoding='utf-8').read()+"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}\n})();\n\n</script>\n</body>")
open('p_g_side.js','w').write(hdr+'\n'.join(out)+'\n')
