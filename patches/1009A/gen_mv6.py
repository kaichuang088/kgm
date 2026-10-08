from common import *
# ── 1006A #9：使用者「里程購買審查10、里程購買優惠0 一個在上一個在下，請統一，很醜」「里程購買審查tab name change to 里程購買」
R('mv nav top (review)',"</style><div class=\"r6-review-head\"><div><div class=\"r6-eyebrow\">AI PRE-SCREEN · HUMAN REVIEW · ONE BUSINESS DAY</div>",
  "</style>'+mvNav1004B+'<div class=\"r6-review-head\"><div><div class=\"r6-eyebrow\">AI PRE-SCREEN · HUMAN REVIEW · ONE BUSINESS DAY</div>")
R('mv nav top (review) old spot',"'+mvNav1004B+mvTabs1004B+","'+mvTabs1004B+")
R('tab rename sidebar',"['milesverify','里程購買審查']","['milesverify','里程購買']",2)
R('tab rename member nav',"['miles','里程購買審查']","['miles','里程購買']",3)
R('tab rename r3 btn',"render()\">'+(Z3()?'里程購買審查':'Mileage Purchase Review')+'<","render()\">'+(Z3()?'里程購買':'Mileage purchase')+'<",2)
R('tab rename r3 txt',"button.textContent=Z3()?'里程購買審查':'Mileage Purchase Review';","button.textContent=Z3()?'里程購買':'Mileage purchase';")
R('tab rename r4 btn',"render()\">'+(z4()?'里程購買審查':'Mileage purchase review')+'<","render()\">'+(z4()?'里程購買':'Mileage purchase')+'<")
save('p_h_mv.js','/* 1006A · 里程購買 */\n')
