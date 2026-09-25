#!/bin/bash
# With PYRACMS_INPUTS set, the run's input files (a snippet's attachments)
# arrive as a tar on stdin: unpack them into /tmp, the one writable place,
# and run from there so fopen("data.txt") finds them.
[ -n "$PYRACMS_INPUTS" ] && tar -x -C /tmp --exclude=__code__ 2>/dev/null
cd /tmp
echo "$1" > /tmp/main.cpp
g++ -o /tmp/main /tmp/main.cpp -std=c++20 2>&1 && /tmp/main
