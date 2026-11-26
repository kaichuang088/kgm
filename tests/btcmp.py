import json,sys
A=json.load(open('/tmp/j/ex2.json'));B=json.load(open(sys.argv[1] if len(sys.argv)>1 else '/tmp/j/btB.json'))['out']
from collections import defaultdict
def key(r):return (r['code'],r['fr'],r['to'],r['via'])
ia=defaultdict(list);ib=defaultdict(list)
for r in A:ia[key(r)].append(r)
for r in B:ib[key(r)].append(r)
def m(t):h,mm=t.split(':');return int(h)*60+int(mm)
rows=[(k,se,a[se],b[se]) for k in ib for a,b in zip(ia[k],ib[k]) for se in ('s','w')]
legs=[x for x in rows if not x[0][3]]
inc=[b['dur']-a['dur'] for k,se,a,b in legs]
import collections
print('legs',len(legs),'unchanged',sum(1 for v in inc if v==0),'median',sorted(inc)[len(inc)//2],'hist',sorted(collections.Counter(min(130,(v//10)*10) for v in inc).items()))
print('neg',[(k,se,a['dur'],b['dur']) for k,se,a,b in legs if b['dur']<a['dur']])
sh=[(k,se,a['dep'],b['dep']) for k,se,a,b in legs if a['dep']!=b['dep']];print('dep moved',len(sh),'earlier',[x for x in sh if ((m(x[3])-m(x[2]))%1440)>720])
print('new late',[(k[0],k[1],k[2],se,a['arr'],b['arr']) for k,se,a,b in legs if 0<=m(b['arr'])<180 and not 0<=m(a['arr'])<180])
print('03',[(k,se,b['arr']) for k,se,a,b in legs if 180<=m(b['arr'])<240])
print('dep crossing midnight',[(k,se,a['dep'],b['dep']) for k,se,a,b in legs if m(b['dep'])<m(a['dep']) ])
json.dump([[list(k),se,a,b] for k,se,a,b in rows],open('/tmp/j/btdiff.json','w'))
