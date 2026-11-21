from common import *
# ══ 1006A #45：擴增聯營航班 ══
#   沿用既有的 feed0810J（addPartner0810J：同班號／同營運班次已存在就跳過，不會重複）。
#   只用系統裡已經有時區與城市名稱的機場；抵達時間＝起飛＋飛行時間＋兩地時差（跟既有聯營列同一個算法）。
TZ={'HND':9,'CTS':9,'FUK':9,'OKA':9,'HKG':8,'SIN':8,'MNL':8,'DPS':8,'KUL':8,'PEN':8,'LHR':0,'MAN':0,'MAD':1,'FCO':1,
    'BOS':-5,'DOH':3,'FRA':1,'CDG':1,'BCN':1,'JFK':-5,'SEA':-8,'HNL':-10}
def arr(fr,to,dep,blk):
    h,m=map(int,dep.split(':'));t=h*60+m+blk+(TZ[to]-TZ[fr])*60
    dd=t//1440;t%=1440
    return '%02d:%02d'%(t//60,t%60),dd
PAIRS=[  # (fr,to,dep,block,op,carrier) 去回成對
 ('HND','CTS','08:00',95,'JL501','Japan Airlines'),('CTS','HND','11:00',100,'JL506','Japan Airlines'),
 ('HND','FUK','08:00',120,'JL305','Japan Airlines'),('FUK','HND','11:30',95,'JL308','Japan Airlines'),
 ('HND','OKA','06:25',170,'JL903','Japan Airlines'),('OKA','HND','10:00',140,'JL904','Japan Airlines'),
 ('HKG','SIN','09:30',235,'CX635','Cathay Pacific'),('SIN','HKG','15:00',230,'CX636','Cathay Pacific'),
 ('HKG','MNL','08:35',130,'CX903','Cathay Pacific'),('MNL','HKG','12:00',145,'CX906','Cathay Pacific'),
 ('HKG','DPS','09:15',290,'CX785','Cathay Pacific'),('DPS','HKG','15:25',285,'CX784','Cathay Pacific'),
 ('KUL','SIN','08:30',60,'MH603','Malaysia Airlines'),('SIN','KUL','10:40',60,'MH604','Malaysia Airlines'),
 ('KUL','PEN','09:00',55,'MH1140','Malaysia Airlines'),('PEN','KUL','11:00',55,'MH1143','Malaysia Airlines'),
 ('KUL','DPS','09:30',180,'MH851','Malaysia Airlines'),('DPS','KUL','13:40',180,'MH850','Malaysia Airlines'),
 ('LHR','MAN','08:20',65,'BA1386','British Airways'),('MAN','LHR','10:30',65,'BA1387','British Airways'),
 ('LHR','MAD','09:35',140,'BA458','British Airways'),('MAD','LHR','13:55',145,'BA459','British Airways'),
 ('LHR','FCO','08:40',150,'BA548','British Airways'),('FCO','LHR','13:15',165,'BA549','British Airways'),
 ('LHR','BOS','09:50',470,'BA203','British Airways'),('BOS','LHR','18:15',400,'BA202','British Airways'),
 ('DOH','LHR','07:45',425,'QR001','Qatar Airways'),('LHR','DOH','14:30',400,'QR002','Qatar Airways'),
 ('DOH','FRA','08:10',390,'QR069','Qatar Airways'),('FRA','DOH','15:00',360,'QR070','Qatar Airways'),
 ('DOH','CDG','07:40',410,'QR037','Qatar Airways'),('CDG','DOH','15:15',380,'QR038','Qatar Airways'),
 ('MAD','BCN','08:00',80,'IB3022','Iberia'),('BCN','MAD','10:15',85,'IB3023','Iberia'),
 ('JFK','BOS','08:00',75,'AA2264','American Airlines'),('BOS','JFK','10:30',80,'AA2265','American Airlines'),
 ('SEA','HNL','09:00',380,'AS871','Alaska Airlines'),('HNL','SEA','14:30',340,'AS872','Alaska Airlines'),
]
CODES=list(range(9919,9950))+[9846,9847,9848,9849,9850,9896,9897,9898,9899]
assert len(CODES)>=len(PAIRS)
rows=[]
for i,(fr,to,dep,blk,op,car) in enumerate(PAIRS):
    a,dd=arr(fr,to,dep,blk)
    rows.append("['KX%d','%s','%s','%s','%s','%s','%s'%s]"%(CODES[i],fr,to,dep,a,op,car,(','+str(dd)) if dd else ''))
txt=',\n    '.join(rows[j]+(','+rows[j+1] if j+1<len(rows) else '') for j in range(0,len(rows),2))
R('codeshare feed expand',
 "['KX9997','CNS','BNE','15:10','17:20','QF9619','Qantas']\n  ];",
 "['KX9997','CNS','BNE','15:10','17:20','QF9619','Qantas'],\n"
 "    // 1006A：擴增聯營（JAL 國內線、國泰／馬航區域線、英航／卡達／伊比利亞歐洲線、美航／阿拉斯加美國線）\n    "+txt+"\n  ];")
R('conn hub DOH',
 "['LAX','SFO','SEA','DFW','SYD','MEL','BNE'].forEach(function(h){if(CONN_HUBS.indexOf(h)<0)CONN_HUBS.push(h);});",
 "['LAX','SFO','SEA','DFW','SYD','MEL','BNE','DOH'].forEach(function(h){if(CONN_HUBS.indexOf(h)<0)CONN_HUBS.push(h);});   /* 1006A：多哈接卡達聯營 */")
save('p_h_cs.js','/* 1006A · 擴增聯營航班 */\n')
print(txt[:400])
