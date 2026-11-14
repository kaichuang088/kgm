// KGM_BUILD_*='0928B' ×12 via regex
const fs=require('fs');const f=process.argv[2];let s=fs.readFileSync(f,'utf8');const re=/(KGM_BUILD_[A-Za-z0-9_]*=')1004B'/g;const n=(s.match(re)||[]).length;if(n!==12){console.log('FAIL KGM_BUILD count',n);process.exit(1)}s=s.replace(re,"$11009B'");fs.writeFileSync(f,s);console.log('KGM_BUILD replaced',n);
