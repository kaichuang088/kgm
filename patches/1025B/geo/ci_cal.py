# 1025B R：用華航 A359 直飛歐洲冬季少賣的座位校正 Payload 模型（使用者給的數字）
import json,math
src=open('route.py').read()
exec(src.split('res={}')[0])          # 取 route.py 的函式（區域、格網、dij）
exec(open('calib2.py').read().split('d=json.load')[0])   # segair / 風
CI={'LHR':80,'AMS':107,'FRA':59,'VIE':25,'PRG':40,'FCO':31}
EXTRA={'LHR':[51.47,-0.45],'AMS':[52.31,4.76],'FRA':[50.03,8.57],'VIE':[48.11,16.57],'PRG':[50.10,14.26],'FCO':[41.80,12.25]}
out={}
for k,v in CI.items():
    A=AP['TPE'];B=AP.get(k) or EXTRA[k]
    h,names=hit(A,B);wp=dij(A,B) if (h and names) else [A,B]
    d0=hav(A,B);d1=sum(hav(wp[i],wp[i+1]) for i in range(len(wp)-1))
    aw=segair(wp,905,True);as_=segair(wp,905,False);gw=segair([A,B],905,True)
    out[k]={'blocked':v,'d0':round(d0),'d1':round(d1),'airW':round(aw),'airS':round(as_),'airW_gc':round(gw),'wp':[[round(p[0],1),round(p[1],1)] for p in wp[1:-1]]}
    print(k,v,'gc',round(d0),'path',round(d1),'air winter',round(aw),'summer',round(as_),'(gc winter',round(gw),')')
json.dump(out,open('ci_cal.json','w'))
