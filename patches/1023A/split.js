// 1004B：從合併檔產出前台檔與後台檔（只在第一個 <script> 開頭加一行 KGM_SIDE，其餘逐位元組相同）
// 用法：node split.js <合併檔.html> <前台輸出.html> <後台輸出.html>
const fs=require('fs');const s=fs.readFileSync(process.argv[2],'utf8');const a='<script>\n';const i=s.indexOf(a);
if(i<0){console.log('FAIL no first script');process.exit(1)}
const mk=side=>s.slice(0,i+a.length)+"window.KGM_SIDE='"+side+"';   /* 1004B："+(side==='front'?'前台檔':'後台檔')+" */\n"+s.slice(i+a.length);
fs.writeFileSync(process.argv[3],mk('front'));fs.writeFileSync(process.argv[4],mk('admin'));console.log('split ok');
