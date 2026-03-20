#!/bin/bash
echo "$1" > /tmp/Main.java
cd /tmp && javac Main.java 2>&1 && java Main
