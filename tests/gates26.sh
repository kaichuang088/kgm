#!/bin/bash
cd /tmp/j
for t in vfy1 vfy2d vfy3 vfy4 vfy5 vfy6; do timeout 500 node $t.js > G26_$t.out 2>&1; echo "$t done $(date +%T)"; done
timeout 400 node t_crewrule.js > G26_t_crewrule.out 2>&1; echo crewrule done
W=110000 timeout 400 node tz8.js /tmp/j/kgm.html > G26_tz8.out 2>&1; echo tz8 done
timeout 400 node ai9t.js /tmp/j/kgm.html > G26_ai9t.out 2>&1; echo ai9t done
W=110000 timeout 400 node t_fl1.js > G26_t_fl1.out 2>&1; echo fl1 done
timeout 600 node reg2.js > G26_reg2.out 2>&1; echo reg2 done
timeout 600 node t_sched922.js > G26_t_sched922.out 2>&1; echo sched done
timeout 900 node t_admlag.js > G26_t_admlag.out 2>&1; echo admlag done
for t in grp25d grp25ui grp25mc gp2 rotreload; do timeout 600 node $t.js > G26_$t.out 2>&1; echo "$t done $(date +%T)"; done
echo ALLDONE
