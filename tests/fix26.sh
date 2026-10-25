#!/bin/bash
cd /tmp/j
cmp -s kgm.html kgm1026B_w22.html || cp kgm1026B_w22.html kgm.html
timeout 500 node vfy5d.js > F26_vfy5d.out 2>&1; echo "vfy5d done"
timeout 600 node grp25d.js > F26_grp25d.out 2>&1; echo "grp25d done"
timeout 400 node gp2.js kgm.html > F26_gp2.out 2>&1; echo "gp2 done"
timeout 600 node t_admlag.js flightadjust,price,groundroster12,chat > F26_adm_B.out 2>&1; echo "admB done"
cp kgm1026A_w50.html kgm.html
timeout 600 node t_admlag.js flightadjust,price,groundroster12,chat > F26_adm_A.out 2>&1; echo "admA done"
timeout 600 node grp25d.js > F26_grp25d_A.out 2>&1; echo "grp25dA done"
cp kgm1026B_w22.html kgm.html
echo ALLDONE
