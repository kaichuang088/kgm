import json
out=[]
def R(label,old,new,cnt=1):
    out.append('R(%s,%s,%s,%d);'%(json.dumps(label),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
hdr='/* 0928B · 聯營航班補強（使用者第 21 點：Etihad／AA／Alaska／Qantas 要多一些） */\n'
anchor="    addPartnerF({code:'KX9888',op:'AA1205',airline:'American Airlines',fr:'MCO',to:'LAX',dep:'20:06',arr:'22:15',eq:'Airbus A321',days:'TH',from:'2026-08-06',toDate:'2026-09-03'});\n"
add="""    /* 0928B：聯營補強 —— 只加查得到班號＋時刻的真實航班，而且只加本站已有的機場。
       Etihad 先前多數只開到 2026-08-31（EY31／EY63 到 10-24），10/25 起一班都沒有；這裡補上冬季班表期間（到 2027-03-27）。
       本站時區表用標準時間：歐洲的夏令時刻已換成冬令當地時間（UTC 不變，當地時間早 1 小時），區間時間與來源的飛行時間一致。
       Etihad 的 02:10–02:45 出發波段接 KX66（23:55 抵 AUH），回程 19:10–19:40 抵 AUH 接 KX65（01:40 起飛）。 */
    var EYW928={oneworld:false,partnerType:'interline',share:.12,from:'2026-09-28',toDate:'2027-03-27'};
    [{code:'KX9901',op:'EY11',fr:'AUH',to:'LHR',dep:'02:40',arr:'06:45'},
     {code:'KX9902',op:'EY62',fr:'LHR',to:'AUH',dep:'08:30',arr:'19:35'},
     {code:'KX9903',op:'EY31',fr:'AUH',to:'CDG',dep:'02:35',arr:'06:55',from:'2026-10-25'},   /* 10-24 以前是原本的 KX9855 */
     {code:'KX9904',op:'EY32',fr:'CDG',to:'AUH',dep:'09:40',arr:'19:35'},
     {code:'KX9905',op:'EY16',fr:'MAN',to:'AUH',dep:'08:10',arr:'19:15'},
     {code:'KX9906',op:'EY101',fr:'AUH',to:'MAD',dep:'02:25',arr:'07:15',eq:'Boeing 787-9 / 787-10 varies by date'},
     {code:'KX9907',op:'EY102',fr:'MAD',to:'AUH',dep:'09:45',arr:'19:40',eq:'Boeing 787-9 / 787-10 varies by date'},
     {code:'KX9908',op:'EY121',fr:'AUH',to:'FRA',dep:'02:10',arr:'05:55',days:'MTWFSSU',eq:'Boeing 787-9 / 787-10 varies by date'},
     {code:'KX9909',op:'EY122',fr:'FRA',to:'AUH',dep:'09:55',arr:'19:10',eq:'Boeing 787-9 / 787-10 varies by date'},
     {code:'KX9910',op:'EY81',fr:'AUH',to:'MXP',dep:'02:15',arr:'05:45',eq:'Boeing 787-10 / 787-9 varies by date'},
     {code:'KX9911',op:'EY82',fr:'MXP',to:'AUH',dep:'10:40',arr:'19:40',eq:'Boeing 787-10 / 787-9 varies by date'}
    ].forEach(function(o){addPartnerF(Object.assign({airline:'Etihad Airways'},EYW928,o))});
    /* AA／Alaska（oneworld）：美東、美西之間的主幹線，接 KGM 的 LAX／SEA／JFK／BOS 航班 */
    var OWW928={from:'2026-09-28',toDate:'2027-03-27'};
    [{code:'KX9912',op:'AA3',airline:'American Airlines',fr:'JFK',to:'LAX',dep:'10:20',arr:'13:11'},
     {code:'KX9913',op:'AA4',airline:'American Airlines',fr:'LAX',to:'JFK',dep:'13:25',arr:'22:00'},
     {code:'KX9914',op:'AA10',airline:'American Airlines',fr:'LAX',to:'JFK',dep:'21:28',arr:'05:58',dd:1},
     {code:'KX9915',op:'AS16',airline:'Alaska Airlines',fr:'SEA',to:'JFK',dep:'07:00',arr:'15:29'},
     {code:'KX9916',op:'AS21',airline:'Alaska Airlines',fr:'JFK',to:'SEA',dep:'07:20',arr:'10:29'},
     {code:'KX9917',op:'AS214',airline:'Alaska Airlines',fr:'SEA',to:'BOS',dep:'23:06',arr:'07:39',dd:1,eq:'Boeing 737-900'},
     {code:'KX9918',op:'QF517',airline:'Qantas',fr:'BNE',to:'SYD',dep:'09:40',arr:'12:15'}
    ].forEach(function(o){addPartnerF(Object.assign({},OWW928,o))});
"""
R('codeshare add',anchor,anchor+add)
open('p_e_cs.js','w').write(hdr+'\n'.join(out)+'\n')
