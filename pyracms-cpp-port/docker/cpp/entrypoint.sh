#!/bin/bash
echo "$1" > /tmp/main.cpp
g++ -o /tmp/main /tmp/main.cpp -std=c++20 2>&1 && /tmp/main
