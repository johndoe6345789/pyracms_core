#!/bin/bash
# Same shape as the C++ runner. -lm so <math.h> programs link.
[ -n "$PYRACMS_INPUTS" ] && tar -x -C /tmp --exclude=__code__ 2>/dev/null
cd /tmp
echo "$1" > /tmp/main.c
gcc -o /tmp/main /tmp/main.c -std=c17 -lm 2>&1 && /tmp/main
