const fs=require('fs');
const s=fs.readFileSync('/tmp/j/kgm.html','utf8');
const re=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;let m,i=0,bad=0;
while((m=re.exec(s))){
  i++;
  const body=m[1];
  if(!body.trim())continue;
  try{new Function(body)}catch(e){
    bad++;
    const id=(s.slice(Math.max(0,m.index-120),m.index+60).match(/<script id="([^"]+)"/)||[])[1]||('#'+i);
    console.log('SYNTAX ERROR in',id,':',e.message.slice(0,160));
  }
}
console.log('scripts checked',i,'errors',bad);
