import json,math
exec(open('fit26b.py').read().split('rows=[];y=[]')[0])
k=json.load(open('fit26b.json'))['k']
TAS={'A388':905,'B779':905,'B77W':905,'A359':905,'A35K':905,'B789':900,'B78X':900,'A339':870,'A339L':870,'A339R':870,'A21N':830,'A21X':830}
def tgt(fr,to,ty,win):
    d,ej=feats(fr,to);b=k[0]+k[1]*d+k[2]*d*ej+k[3]*math.exp(-d/1.5)+(k[4]*d*ej if win else 0)
    t=TAS.get(ty,900);b+=k[1]*d*(900/t-1)
    return b
D=json.load(open('/tmp/j/ex2.json'))
rows=[r for r in D if not r['via']]
import collections
ch=[];
for r in rows:
    for se in ('s','w'):
        v=r[se];t=tgt(r['fr'],r['to'],v['ac'],se=='w')
        t5=math.ceil(t/5)*5
        ch.append((t5-v['dur'],r['code'],r['fr'],r['to'],se,v['dur'],t5,v['ac']))
inc=[c for c in ch if c[0]>0]
print('legs×season',len(ch),'increase',len(inc),'median inc',sorted(c[0] for c in inc)[len(inc)//2])
hist=collections.Counter(min(120,(c[0]//10)*10) for c in inc);print(sorted(hist.items()))
dec=[c for c in ch if c[0]<=0];print('already >= target',len(dec),'median slack',sorted(-c[0] for c in dec)[len(dec)//2])
for c in sorted(ch,reverse=True)[:25]:print(c)
print('---- short sample')
for c in ch:
    if c[1] in ('KX180','KX179','KX181','KX304','KX140','KX141','KX5','KX6','KX97','KX47'):print(c)
