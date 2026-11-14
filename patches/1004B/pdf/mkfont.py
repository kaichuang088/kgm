import glob,re,time,os,sys
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
t0=time.time()
html=open(sys.argv[1],encoding='utf-8').read()
need=set(ord(c) for c in html)|set(range(0x20,0x7f))
for pkg,fam in (('noto-sans-tc','NotoSansTC'),('noto-serif-tc','NotoSerifTC')):
  d=[x for x in glob.glob('/tmp/fnt/fontsource-%s-*'%pkg) if os.path.isdir(x)][0]
  for w in ('400','700'):
    css=open(d+'/'+w+'.css').read()
    files=[]
    for m in re.finditer(r"src: url\(\./files/([^)]+\.woff2)\)[^;]*;\s*unicode-range: ([^;]+);",css):
      rs=[]
      for r in m.group(2).split(','):
        r=r.strip()[2:]
        a,b=(r.split('-')+[None])[:2];a=int(a,16);b=int(b,16) if b else a
        rs.append((a,b))
      if any(a<=c<=b for c in need for a,b in rs): files.append(d+'/files/'+m.group(1))
    tt=[]
    for i,f in enumerate(files):
      ft=TTFont(f);ft.flavor=None;o='mf/_%s_%s_%d.ttf'%(fam,w,i);ft.save(o);tt.append(o)
    f0=TTFont(tt[0]);print(fam,w,len(files),'subsets',f0['head'].unitsPerEm,'glyf' in f0,'CFF ' in f0)
    mg=Merger().merge(tt)
    mg.save('mf/%s-%s.ttf'%(fam,w))
print(time.time()-t0)
