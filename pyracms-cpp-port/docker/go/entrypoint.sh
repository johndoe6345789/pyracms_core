#!/bin/bash
echo "$1" > /tmp/main.go
cd /tmp && go run main.go
