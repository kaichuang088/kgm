import json
SRC=open('/tmp/j/kgm1004B_t18.html',encoding='utf-8').read()   # 1006A 的基準＝1004B 最終版
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):
    n=SRC.count(old)
    assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):
    i=SRC.index('<script id="'+layer+'"');e=SRC.index('</script>',i);n=SRC[i:e].count(old)
    assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def save(name,hdr):
    open(name,'w').write(hdr+'\n'.join(out)+'\n');print('ok',name,len(out))
